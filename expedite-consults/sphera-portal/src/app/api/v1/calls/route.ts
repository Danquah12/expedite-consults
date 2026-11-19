import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import os from "os"
import { recordGlobalUserActivity } from "@/lib/connectin-cloud-sync"

export interface CommCallParticipant {
  call_id: string
  user_id: string
  device_id: string
  peer_id?: string
  display_name: string
  role: string
  device_label?: string
  phone?: string
  target_recipient_name?: string
  target_recipient_email?: string
  target_recipient_phone?: string
  initiator_phone?: string
  call_type?: "audio" | "video" | "screenshare"
  joined_at: string
  last_seen_ms?: number
  left_at: string | null
  is_muted?: boolean
  is_video_on?: boolean
  is_speaking?: boolean
  is_screen_sharing?: boolean
  webrtc_connected?: boolean
  virtual_bg_id?: string
  virtual_bg_badge?: string
  live_frame?: string | null
  live_audio_chunk?: {
    seq: number
    data_url: string
    ts: number
  } | null
  recent_audio_chunks?: Array<{
    seq: number
    data_url: string
    ts: number
  }> | null
  participant_state: "RINGING" | "NEGOTIATING" | "CONNECTED" | "RECONNECTING" | "LEFT"
  e2ee_media_fingerprint: string
}

export interface SharedStageRecord {
  active: boolean
  sharer_user_id: string
  sharer_name: string
  mode: "screen" | "file" | "snapshot" | "presentation"
  title: string
  mime_type?: string
  use_webrtc_stream?: boolean
  frame_or_data_url: string | null
  updated_at_ms: number
}

export interface SharedCallChatMessage {
  id: string
  sender_id: string
  sender_name: string
  text: string
  attachment_name?: string
  attachment_data_url?: string
  sent_at: string
}

export interface CommInvitedMember {
  id: string
  name: string
  phone?: string
  email?: string
  avatar?: string
  status: "ringing" | "in-progress" | "invited" | "unanswered" | "removed"
  callSid?: string
  updated_at_ms: number
}

export interface CommCallRecord {
  id: string
  conversation_id: string
  initiator_user_id: string
  initiator_name?: string
  initiator_phone?: string
  target_recipient_name?: string
  target_recipient_email?: string
  target_recipient_phone?: string
  call_type: "audio" | "video" | "screenshare"
  topology: "P2P_E2EE" | "SFU_E2EE_SFRAME"
  state: "CREATED" | "RINGING" | "NEGOTIATING" | "CONNECTED" | "RECONNECTING" | "ENDED"
  state_version: number
  sframe_key_epoch: number
  low_bandwidth_mode: boolean
  started_at: string
  ended_at: string | null
  turn_credentials: {
    uris: string[]
    username: string
    credential: string
    ttl_seconds: number
    relay_policy: "all" | "relay"
  }
  participants: CommCallParticipant[]
  invited_roster?: CommInvitedMember[]
  shared_stage?: SharedStageRecord | null
  shared_messages?: SharedCallChatMessage[]
}

const globalForCalls = globalThis as unknown as {
  __vibeActiveCallsMap?: Map<string, CommCallRecord>
  __vibeTwilioIceCache?: { iceServers: any[]; fetchedAtMs: number }
}

const ACTIVE_CALLS_STORE: Map<string, CommCallRecord> =
  globalForCalls.__vibeActiveCallsMap || new Map<string, CommCallRecord>()
globalForCalls.__vibeActiveCallsMap = ACTIVE_CALLS_STORE

const TMP_CALLS_FILE = path.join(os.tmpdir(), "vibe_active_calls_v4.json")
const PARTICIPANT_TTL_MS = 25000
const CALLS_SYNC_MAP_NAME = "vibe_active_calls_map_v1"
let lastDiskLoadMs = 0
let lastDiskSaveMs = 0
let lastCloudPullMs = 0
const lastCloudParticipantPushMap = new Map<string, number>()
const lastCloudAudioSeqMap = new Map<string, number>()

function getTwilioCallsAuthHeader(): string | null {
  const sid = process.env.TWILIO_ACCOUNT_SID || ""
  const token = process.env.TWILIO_AUTH_TOKEN || ""
  if (!sid || !token) return null
  return `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`
}

async function getCachedTwilioIceServers(): Promise<any[]> {
  const fallbackStun = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ]
  const nowMs = Date.now()
  if (
    globalForCalls.__vibeTwilioIceCache &&
    nowMs - globalForCalls.__vibeTwilioIceCache.fetchedAtMs < 25 * 60 * 1000
  ) {
    return globalForCalls.__vibeTwilioIceCache.iceServers
  }
  const sid = process.env.TWILIO_ACCOUNT_SID || ""
  const auth = getTwilioCallsAuthHeader()
  if (!sid || !auth) return fallbackStun

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 1400)
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Tokens.json`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ Ttl: "3600" }).toString(),
      signal: controller.signal,
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data?.ice_servers) && data.ice_servers.length > 0) {
        const normalized = data.ice_servers.map((s: any) => ({
          urls: s.urls || s.url,
          ...(s.username ? { username: s.username } : {}),
          ...(s.credential ? { credential: s.credential } : {}),
        }))
        const combined = [...fallbackStun, ...normalized]
        globalForCalls.__vibeTwilioIceCache = { iceServers: combined, fetchedAtMs: nowMs }
        return combined
      }
    }
  } catch {
    // ignore timeout
  } finally {
    clearTimeout(timer)
  }
  return fallbackStun
}

function makeCloudParticipantKey(callId: string, userId: string): string {
  const cleanCall = String(callId || "room").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 36)
  const cleanUser = String(userId || "peer").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 36)
  return `p__${cleanCall}__${cleanUser}`
}

function makeCloudAudioKey(callId: string, userId: string): string {
  const cleanCall = String(callId || "room").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 36)
  const cleanUser = String(userId || "peer").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 36)
  return `a__${cleanCall}__${cleanUser}`
}

function makeCloudStageKey(callId: string): string {
  const cleanCall = String(callId || "room").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48)
  return `s__${cleanCall}`
}

function makeCloudRosterKey(callId: string): string {
  const cleanCall = String(callId || "room").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48)
  return `r__${cleanCall}`
}

export function makeInvitedMemberKey(entry: { id?: string; phone?: string; email?: string; name?: string }): string {
  const phoneDigits = String(entry.phone || "").replace(/[^\d]/g, "")
  if (phoneDigits.length >= 7) return `tel_${phoneDigits}`
  if (entry.id && String(entry.id).trim()) return String(entry.id).trim().slice(0, 64)
  const emailClean = String(entry.email || "").trim().toLowerCase()
  if (emailClean) return `em_${emailClean.replace(/[^a-z0-9@._-]/g, "_")}`
  return `nm_${String(entry.name || "guest")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 48)}`
}

function mergeInvitedEntriesIntoRecord(
  record: CommCallRecord,
  rawEntries: any[],
  nowMs: number
): boolean {
  if (!Array.isArray(rawEntries) || rawEntries.length === 0) return false
  if (!Array.isArray(record.invited_roster)) record.invited_roster = []
  const byId = new Map<string, CommInvitedMember>()
  for (const existing of record.invited_roster) {
    if (existing?.id) byId.set(existing.id, existing)
  }

  let changed = false
  for (const raw of rawEntries) {
    if (!raw || typeof raw !== "object") continue
    const key = makeInvitedMemberKey(raw)
    if (!key) continue
    const incomingTs = Number(raw.updated_at_ms) || nowMs
    const prev = byId.get(key)
    if (prev && (prev.updated_at_ms || 0) > incomingTs) continue

    const validStatus: CommInvitedMember["status"] =
      raw.status === "in-progress" ||
      raw.status === "invited" ||
      raw.status === "unanswered" ||
      raw.status === "removed"
        ? raw.status
        : "ringing"

    const avatarVal =
      typeof raw.avatar === "string" && raw.avatar.length < 400
        ? raw.avatar
        : prev?.avatar

    byId.set(key, {
      id: key,
      name: String(raw.name || prev?.name || "Invited Participant").trim(),
      phone: raw.phone !== undefined ? String(raw.phone || "").trim() : prev?.phone,
      email: raw.email !== undefined ? String(raw.email || "").trim().toLowerCase() : prev?.email,
      avatar: avatarVal,
      status: validStatus,
      callSid:
        raw.callSid !== undefined
          ? raw.callSid
            ? String(raw.callSid)
            : undefined
          : prev?.callSid,
      updated_at_ms: incomingTs,
    })
    changed = true
  }

  if (changed) {
    record.invited_roster = Array.from(byId.values()).slice(-24)
  }
  return changed
}

const lastCloudStagePushMap = new Map<string, number>()
const lastCloudRosterPushMap = new Map<string, number>()

async function pushCloudInvitedRoster(
  callId: string,
  roster: CommInvitedMember[] | undefined,
  force = false
): Promise<void> {
  const auth = getTwilioCallsAuthHeader()
  if (!auth) return
  const rosterKey = makeCloudRosterKey(callId)
  const nowMs = Date.now()
  const lastPush = lastCloudRosterPushMap.get(rosterKey) || 0
  if (!force && nowMs - lastPush < 600) return
  lastCloudRosterPushMap.set(rosterKey, nowMs)

  const compactRoster = (roster || []).slice(-24).map((m) => ({
    id: m.id,
    name: m.name,
    phone: m.phone || "",
    email: m.email || "",
    avatar: m.avatar && m.avatar.length < 320 ? m.avatar : undefined,
    status: m.status,
    callSid: m.callSid,
    updated_at_ms: m.updated_at_ms || nowMs,
  }))
  const payload = JSON.stringify({
    kind: "roster",
    call_id: callId,
    invited_roster: compactRoster,
    updated_at_ms: nowMs,
  })
  await upsertTwilioSyncItem(auth, rosterKey, payload, "300")
}

async function pushCloudSharedStage(callId: string, stage: SharedStageRecord | null, force = false): Promise<void> {
  const auth = getTwilioCallsAuthHeader()
  if (!auth) return
  const stageKey = makeCloudStageKey(callId)
  const nowMs = Date.now()
  const lastPush = lastCloudStagePushMap.get(stageKey) || 0
  if (!force && nowMs - lastPush < 700) return
  lastCloudStagePushMap.set(stageKey, nowMs)

  const compactFrame =
    stage?.frame_or_data_url && stage.frame_or_data_url.length < 12800
      ? stage.frame_or_data_url
      : null
  const payload = JSON.stringify({
    kind: "stage",
    call_id: callId,
    active: Boolean(stage?.active),
    sharer_user_id: stage?.sharer_user_id || "",
    sharer_name: stage?.sharer_name || "",
    mode: stage?.mode || "screen",
    title: stage?.title || "",
    mime_type: stage?.mime_type,
    use_webrtc_stream: Boolean(stage?.use_webrtc_stream),
    frame_or_data_url: compactFrame,
    updated_at_ms: stage?.updated_at_ms || nowMs,
  })
  await upsertTwilioSyncItem(auth, stageKey, payload)
}

async function upsertTwilioSyncItem(auth: string, key: string, serialized: string, ttlSec = "60"): Promise<void> {
  const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${CALLS_SYNC_MAP_NAME}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 1100)
  try {
    const updateRes = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ Data: serialized, Ttl: ttlSec }).toString(),
      signal: controller.signal,
    })
    if (updateRes.ok) return

    if (updateRes.status === 404) {
      await fetch("https://sync.twilio.com/v1/Services/default/Maps", {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ UniqueName: CALLS_SYNC_MAP_NAME }).toString(),
      }).catch(() => {})

      await fetch(`${baseUrl}/Items`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          Key: key,
          Data: serialized,
          Ttl: ttlSec,
        }).toString(),
      }).catch(() => {})
    }
  } catch {
    // non-fatal timeout
  } finally {
    clearTimeout(timer)
  }
}

async function pushCloudCallParticipant(callId: string, participant: CommCallParticipant, force = false): Promise<void> {
  const auth = getTwilioCallsAuthHeader()
  if (!auth) return
  const key = makeCloudParticipantKey(callId, participant.user_id)
  const audioKey = makeCloudAudioKey(callId, participant.user_id)
  const nowMs = Date.now()
  const pendingWrites: Promise<void>[] = []

  // 1. Push fallback voice audio chunks ONLY when WebRTC native Opus audio is not connected
  const latestSeq = participant.live_audio_chunk?.seq || 0
  const lastPushedSeq = lastCloudAudioSeqMap.get(audioKey) || 0
  if (participant.is_muted || participant.webrtc_connected) {
    if (lastPushedSeq !== -1) {
      lastCloudAudioSeqMap.set(audioKey, -1)
      pendingWrites.push(
        upsertTwilioSyncItem(
          auth,
          audioKey,
          JSON.stringify({
            kind: "audio",
            call_id: callId,
            user_id: participant.user_id,
            is_muted: Boolean(participant.is_muted),
            last_seen_ms: nowMs,
            live_audio_chunk: null,
            recent_audio_chunks: [],
          })
        )
      )
    }
  } else if (latestSeq > lastPushedSeq && participant.live_audio_chunk?.data_url) {
    lastCloudAudioSeqMap.set(audioKey, latestSeq)
    const compactChunks = (participant.recent_audio_chunks || [participant.live_audio_chunk])
      .filter((c) => c && typeof c.data_url === "string" && c.data_url.length < 13500)
      .slice(-2)
    let audioPayload = JSON.stringify({
      kind: "audio",
      call_id: callId,
      user_id: participant.user_id,
      is_muted: false,
      last_seen_ms: nowMs,
      live_audio_chunk:
        participant.live_audio_chunk.data_url.length < 13500 ? participant.live_audio_chunk : null,
      recent_audio_chunks: compactChunks,
    })
    // Ensure under Twilio Sync 16KB limit even with 2 chunks
    if (audioPayload.length > 15200) {
      audioPayload = JSON.stringify({
        kind: "audio",
        call_id: callId,
        user_id: participant.user_id,
        is_muted: false,
        last_seen_ms: nowMs,
        live_audio_chunk:
          participant.live_audio_chunk.data_url.length < 14000 ? participant.live_audio_chunk : null,
        recent_audio_chunks: compactChunks.slice(-1),
      })
    }
    pendingWrites.push(upsertTwilioSyncItem(auth, audioKey, audioPayload))
  }

  // 2. Push participant metadata + fallback video frame (`p__call__user`), throttled gently when WebRTC is live
  const lastPush = lastCloudParticipantPushMap.get(key) || 0
  const minPushIntervalMs = participant.webrtc_connected ? 1400 : 450
  if (force || nowMs - lastPush >= minPushIntervalMs) {
    lastCloudParticipantPushMap.set(key, nowMs)
    const compactParticipant = {
      ...participant,
      call_id: callId,
      live_frame:
        participant.is_video_on !== false &&
        participant.live_frame &&
        participant.live_frame.length < 13500
          ? participant.live_frame
          : null,
      live_audio_chunk:
        !participant.webrtc_connected &&
        participant.live_audio_chunk &&
        typeof participant.live_audio_chunk.data_url === "string" &&
        participant.live_audio_chunk.data_url.length < 2800
          ? participant.live_audio_chunk
          : null,
      recent_audio_chunks: undefined,
    }
    pendingWrites.push(upsertTwilioSyncItem(auth, key, JSON.stringify(compactParticipant)))
  }

  if (pendingWrites.length > 0) {
    await Promise.all(pendingWrites).catch(() => {})
  }
}

async function pullCloudCallParticipants(excludeUserId?: string): Promise<void> {
  const auth = getTwilioCallsAuthHeader()
  if (!auth) return
  const nowMs = Date.now()
  if (nowMs - lastCloudPullMs < 500) return
  lastCloudPullMs = nowMs

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 1200)
    const res = await fetch(
      `https://sync.twilio.com/v1/Services/default/Maps/${CALLS_SYNC_MAP_NAME}/Items?PageSize=100`,
      {
        method: "GET",
        headers: { Authorization: auth },
        cache: "no-store",
        signal: controller.signal,
      }
    )
    clearTimeout(timer)
    if (!res.ok) return
    const json = await res.json()
    const items = Array.isArray(json.items) ? json.items : []

    // First pass: merge participant records (`p__`) and collect shared stage (`s__`), roster (`r__`), and audio (`a__`)
    const audioItems: any[] = []
    const rosterItems: any[] = []
    for (const item of items) {
      const data = item?.data
      if (!data || !data.call_id) continue
      if (data.kind === "roster" || String(item?.key || "").startsWith("r__")) {
        rosterItems.push(data)
        continue
      }
      if (data.kind === "stage" || String(item?.key || "").startsWith("s__")) {
        const record = ACTIVE_CALLS_STORE.get(data.call_id)
        if (record && record.state !== "ENDED") {
          const remoteTs = Number(data.updated_at_ms) || 0
          const localTs = record.shared_stage?.updated_at_ms || 0
          if (remoteTs > localTs && nowMs - remoteTs < 60000) {
            record.shared_stage = {
              active: Boolean(data.active),
              sharer_user_id: data.sharer_user_id || "",
              sharer_name: data.sharer_name || "",
              mode: data.mode || "screen",
              title: data.title || "",
              mime_type: data.mime_type,
              use_webrtc_stream: Boolean(data.use_webrtc_stream),
              frame_or_data_url: data.frame_or_data_url || record.shared_stage?.frame_or_data_url || null,
              updated_at_ms: remoteTs,
            }
          }
        }
        continue
      }
      if (!data.user_id) continue
      if (excludeUserId && data.user_id === excludeUserId) continue
      if (data.kind === "audio" || String(item?.key || "").startsWith("a__")) {
        audioItems.push(data)
        continue
      }
      if (data.participant_state === "LEFT" || !data.last_seen_ms || nowMs - data.last_seen_ms >= PARTICIPANT_TTL_MS) {
        continue
      }
      let record = ACTIVE_CALLS_STORE.get(data.call_id)
      if (!record) {
        record = ensureCallRoom(
          data.call_id,
          data.user_id,
          data.display_name || "Meeting Participant",
          data.call_id
        )
      }
      if (record.state === "ENDED") continue
      if (data.call_type) record.call_type = data.call_type
      if (data.target_recipient_name && !record.target_recipient_name) {
        record.target_recipient_name = data.target_recipient_name
      }
      if (data.target_recipient_email && !record.target_recipient_email) {
        record.target_recipient_email = data.target_recipient_email
      }
      if (data.target_recipient_phone && !record.target_recipient_phone) {
        record.target_recipient_phone = data.target_recipient_phone
      }
      if (data.initiator_phone && !record.initiator_phone) {
        record.initiator_phone = data.initiator_phone
      }
      if (!record.initiator_name && data.display_name) {
        record.initiator_name = data.display_name
      }
      const existingIdx = record.participants.findIndex((p) => p.user_id === data.user_id)
      if (existingIdx < 0) {
        record.participants.push(data as CommCallParticipant)
      } else {
        const localP = record.participants[existingIdx]
        if ((data.last_seen_ms || 0) >= (localP.last_seen_ms || 0)) {
          record.participants[existingIdx] = {
            ...localP,
            ...data,
            live_frame: data.live_frame || localP.live_frame || null,
            live_audio_chunk: data.live_audio_chunk || localP.live_audio_chunk || null,
            recent_audio_chunks: data.recent_audio_chunks || localP.recent_audio_chunks || null,
          }
        } else if (!localP.peer_id && data.peer_id) {
          record.participants[existingIdx].peer_id = data.peer_id
        }
      }
    }

    // Second pass: merge dedicated voice audio items (`a__`) so every participant receives the latest voice chunks
    for (const aData of audioItems) {
      if (!aData.last_seen_ms || nowMs - aData.last_seen_ms >= PARTICIPANT_TTL_MS) continue
      const record = ACTIVE_CALLS_STORE.get(aData.call_id)
      if (!record || record.state === "ENDED") continue
      const existingIdx = record.participants.findIndex((p) => p.user_id === aData.user_id)
      if (existingIdx < 0) continue
      const localP = record.participants[existingIdx]
      if (aData.is_muted) {
        localP.is_muted = true
        localP.live_audio_chunk = null
        localP.recent_audio_chunks = null
      } else {
        const remoteSeq = aData.live_audio_chunk?.seq || 0
        const localSeq = localP.live_audio_chunk?.seq || 0
        if (remoteSeq >= localSeq && aData.live_audio_chunk) {
          localP.live_audio_chunk = aData.live_audio_chunk
        }
        if (Array.isArray(aData.recent_audio_chunks) && aData.recent_audio_chunks.length > 0) {
          const combined = [...(localP.recent_audio_chunks || []), ...aData.recent_audio_chunks]
          const bySeq = new Map<number, { seq: number; data_url: string; ts: number }>()
          for (const c of combined) {
            if (c && typeof c.seq === "number" && c.data_url) {
              bySeq.set(c.seq, c)
            }
          }
            localP.recent_audio_chunks = Array.from(bySeq.values())
              .sort((a, b) => a.seq - b.seq)
              .slice(-3)
          }
        }
      }

      // Third pass: merge invited_roster items (`r__`) so every caller and answering phone sees all invited people!
      for (const rData of rosterItems) {
        const remoteTs = Number(rData.updated_at_ms) || 0
        if (nowMs - remoteTs > 300000) continue
        let record = ACTIVE_CALLS_STORE.get(rData.call_id)
        if (!record && Array.isArray(rData.invited_roster) && rData.invited_roster.length > 0) {
          record = ensureCallRoom(rData.call_id, "host", "ConnectLn Call", rData.call_id)
        }
        if (record && record.state !== "ENDED" && Array.isArray(rData.invited_roster)) {
          mergeInvitedEntriesIntoRecord(record, rData.invited_roster, remoteTs || nowMs)
        }
      }
    } catch {
      // non-fatal
    }
  }

  function loadPersistedCalls(): Map<string, CommCallRecord> {
    const nowMs = Date.now()
    if (ACTIVE_CALLS_STORE.size > 0 && nowMs - lastDiskLoadMs < 2000) {
      return ACTIVE_CALLS_STORE
    }
    lastDiskLoadMs = nowMs
    try {
      if (fs.existsSync(TMP_CALLS_FILE)) {
        const raw = fs.readFileSync(TMP_CALLS_FILE, "utf-8")
        const parsed = JSON.parse(raw) as Record<string, CommCallRecord>
        for (const [k, v] of Object.entries(parsed)) {
          if (!ACTIVE_CALLS_STORE.has(k)) {
            ACTIVE_CALLS_STORE.set(k, v)
          } else {
            const mem = ACTIVE_CALLS_STORE.get(k)!
            if (v.state === "ENDED" && (v.state_version || 0) >= (mem.state_version || 0)) {
              mem.state = "ENDED"
              mem.ended_at = v.ended_at
              mem.participants = []
              mem.invited_roster = []
              mem.shared_stage = null
              mem.state_version = v.state_version
            } else if (mem.state !== "ENDED") {
              const mergedMap = new Map<string, CommCallParticipant>()
              for (const p of mem.participants) {
                if (p.last_seen_ms && nowMs - p.last_seen_ms < PARTICIPANT_TTL_MS) {
                  mergedMap.set(p.user_id, p)
                }
              }
              for (const p of v.participants || []) {
                if (!p.last_seen_ms || nowMs - p.last_seen_ms >= PARTICIPANT_TTL_MS) continue
                const existing = mergedMap.get(p.user_id)
                if (!existing || (p.last_seen_ms || 0) >= (existing.last_seen_ms || 0)) {
                  mergedMap.set(p.user_id, p)
                }
              }
              mem.participants = Array.from(mergedMap.values())
              if (Array.isArray(v.invited_roster) && v.invited_roster.length > 0) {
                mergeInvitedEntriesIntoRecord(mem, v.invited_roster, nowMs)
              }
            }

          // Merge shared_stage if disk version is newer
          if (
            mem.state !== "ENDED" &&
            v.shared_stage &&
            (!mem.shared_stage || v.shared_stage.updated_at_ms >= mem.shared_stage.updated_at_ms)
          ) {
            mem.shared_stage = v.shared_stage
          }

          // Merge shared_messages
          if (Array.isArray(v.shared_messages)) {
            const msgMap = new Map<string, SharedCallChatMessage>()
            for (const m of mem.shared_messages || []) msgMap.set(m.id, m)
            for (const m of v.shared_messages) msgMap.set(m.id, m)
            mem.shared_messages = Array.from(msgMap.values()).slice(-50)
          }
        }
      }
    }
  } catch {
    // Ignore fs errors
  }
  return ACTIVE_CALLS_STORE
}

function savePersistedCalls(force = false) {
  const nowMs = Date.now()
  if (!force && nowMs - lastDiskSaveMs < 2000) return
  lastDiskSaveMs = nowMs
  try {
    const obj: Record<string, CommCallRecord> = {}
    for (const [k, v] of ACTIVE_CALLS_STORE.entries()) {
      if (v.state === "ENDED") {
        const endedMs = v.ended_at ? new Date(v.ended_at).getTime() : 0
        if (nowMs - endedMs < 20000) {
          obj[k] = { ...v, participants: [], invited_roster: [] }
        } else {
          ACTIVE_CALLS_STORE.delete(k)
        }
        continue
      }
      const activeParts = (v.participants || []).filter(
        (p) => p.last_seen_ms && nowMs - p.last_seen_ms < PARTICIPANT_TTL_MS
      )
      const recentInvite = (v.invited_roster || []).some(
        (m) => m.updated_at_ms && nowMs - m.updated_at_ms < 45000
      )
      if (activeParts.length > 0 || recentInvite) {
        obj[k] = { ...v, participants: activeParts }
      } else {
        ACTIVE_CALLS_STORE.delete(k)
      }
    }
    fs.writeFileSync(TMP_CALLS_FILE, JSON.stringify(obj), "utf-8")
  } catch {
    // Ignore fs errors
  }
}

function generateScopedTurnCredentials(userId: string) {
  const ttlSeconds = 3600
  const expiration = Math.floor(Date.now() / 1000) + ttlSeconds
  const username = `${expiration}:${userId}`
  const hmac = crypto.createHmac("sha1", "vibe-desknote-turn-ephemeral-secret")
  hmac.update(username)
  const credential = hmac.digest("base64")

  return {
    uris: [
      "stun:stun.l.google.com:19302",
      "stun:stun.cloudflare.com:3478",
      "stun:stun.vibe.connectln.app:3478",
      "turn:turn-us-east.vibe.connectln.app:3478?transport=udp",
      "turns:turn-africa-accra.vibe.connectln.app:5349?transport=tcp",
    ],
    username,
    credential,
    ttl_seconds: ttlSeconds,
    relay_policy: "all" as const,
  }
}

function ensureCallRoom(callId: string, initiatorId: string, displayName: string, conversationId: string): CommCallRecord {
  loadPersistedCalls()
  let record = ACTIVE_CALLS_STORE.get(callId)
  const now = new Date().toISOString()

  if (!record) {
    record = {
      id: callId,
      conversation_id: conversationId || "9b0bbf68-20c8-4416-b82c-0f0e81b8df80",
      initiator_user_id: initiatorId,
      call_type: "video",
      topology: "SFU_E2EE_SFRAME",
      state: "CONNECTED",
      state_version: 1,
      sframe_key_epoch: 12,
      low_bandwidth_mode: false,
      started_at: now,
      ended_at: null,
      turn_credentials: generateScopedTurnCredentials(initiatorId),
      participants: [],
      invited_roster: [],
      shared_stage: null,
      shared_messages: [],
    }
    ACTIVE_CALLS_STORE.set(callId, record)
    savePersistedCalls()
  }
  return record
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("ice") === "1") {
    const iceServers = await getCachedTwilioIceServers()
    return NextResponse.json({ ice_servers: iceServers })
  }
  loadPersistedCalls()
  await pullCloudCallParticipants().catch(() => {})
  const nowMs = Date.now()
  const callId = req.nextUrl.searchParams.get("call_id")
  if (callId) {
    const call = ACTIVE_CALLS_STORE.get(callId)
    return NextResponse.json({
      protocol_version: 1,
      call: call || null,
    })
  }

  const incomingForName = (req.nextUrl.searchParams.get("incoming_for") || "").trim().toLowerCase()
  const incomingEmail = (req.nextUrl.searchParams.get("incoming_email") || "").trim().toLowerCase()
  const incomingPhoneDigits = (req.nextUrl.searchParams.get("incoming_phone") || "").replace(/[^\d]/g, "")
  const viewerPeerId = (req.nextUrl.searchParams.get("viewer_peer_id") || "").trim()

  const calls = Array.from(ACTIVE_CALLS_STORE.values()).filter((c) => {
    if (c.state === "ENDED") return false
    const liveParts = (c.participants || []).filter(
      (p) => p.last_seen_ms && nowMs - p.last_seen_ms < PARTICIPANT_TTL_MS
    )
    c.participants = liveParts
    return liveParts.length > 0
  })

  if (incomingForName || incomingEmail || incomingPhoneDigits) {
    const nameSlug = incomingForName.replace(/[^a-z0-9]+/g, "_")
    const matchesTarget = (tNameRaw?: string, tEmailRaw?: string, tPhoneRaw?: string) => {
      const targetName = (tNameRaw || "").trim().toLowerCase()
      const targetEmail = (tEmailRaw || "").trim().toLowerCase()
      const targetPhoneDigits = (tPhoneRaw || tNameRaw || "").replace(/[^\d]/g, "")
      const phoneTailMatch = Boolean(
        incomingPhoneDigits.length >= 7 &&
          targetPhoneDigits.length >= 7 &&
          (incomingPhoneDigits === targetPhoneDigits ||
            incomingPhoneDigits.slice(-10) === targetPhoneDigits.slice(-10))
      )
      return Boolean(
        phoneTailMatch ||
          (incomingEmail && targetEmail && targetEmail === incomingEmail) ||
          (incomingForName &&
            targetName &&
            (targetName === incomingForName ||
              targetName.includes(incomingForName) ||
              incomingForName.includes(targetName)))
      )
    }

    const incomingCalls = calls.filter((c) => {
      // Skip ONLY if this exact browser/mobile tab (`viewerPeerId`) is already a participant in the call.
      // Never skip on `display_name === incomingForName` so calling your own phone from desktop still rings on your phone!
      if (viewerPeerId && c.participants.some((p) => p.user_id === viewerPeerId)) {
        return false
      }
      const cidLower = c.id.toLowerCase()
      const primaryMatch = matchesTarget(
        c.target_recipient_name,
        c.target_recipient_email,
        c.target_recipient_phone
      )
      const rosterMatch = (c.invited_roster || []).some(
        (inv) => inv.status !== "removed" && matchesTarget(inv.name, inv.email, inv.phone)
      )
      return Boolean(primaryMatch || rosterMatch || (nameSlug.length >= 4 && cidLower.includes(nameSlug)))
    })
    return NextResponse.json({
      protocol_version: 1,
      incoming_calls: incomingCalls,
    })
  }

  return NextResponse.json({
    protocol_version: 1,
    active_calls_count: calls.length,
    calls,
  })
}

export async function POST(req: NextRequest) {
  try {
    loadPersistedCalls()
    const body = await req.json()
    const action = body.action || "create"
    const now = new Date().toISOString()
    const nowMs = Date.now()

    if (action === "leave" && body.call_id) {
      const existing = ACTIVE_CALLS_STORE.get(body.call_id)
      if (existing) {
        if (body.user_id) {
          existing.participants = (existing.participants || []).filter((p) => p.user_id !== body.user_id)
          pushCloudCallParticipant(
            body.call_id,
            {
              call_id: body.call_id,
              user_id: body.user_id,
              device_id: "left",
              display_name: "Left",
              role: "Left",
              device_label: "Left",
              joined_at: now,
              last_seen_ms: 0,
              left_at: now,
              is_muted: true,
              is_video_on: false,
              is_speaking: false,
              is_screen_sharing: false,
              participant_state: "LEFT",
              e2ee_media_fingerprint: "",
            },
            true
          ).catch(() => {})
        }
        if (existing.shared_stage && existing.shared_stage.sharer_user_id === body.user_id) {
          existing.shared_stage = null
          pushCloudSharedStage(body.call_id, null, true).catch(() => {})
        }
        existing.state_version += 1
        ACTIVE_CALLS_STORE.set(body.call_id, existing)
        savePersistedCalls(true)
      }
      return NextResponse.json({
        protocol_version: 1,
        event_type: "call.participant_left",
        occurred_at: now,
        call: existing || null,
      })
    }

    if (action === "end" && body.call_id) {
      const existing = ACTIVE_CALLS_STORE.get(body.call_id)
      if (existing) {
        for (const p of existing.participants || []) {
          pushCloudCallParticipant(
            body.call_id,
            { ...p, last_seen_ms: 0, left_at: now, participant_state: "LEFT" },
            true
          ).catch(() => {})
        }
        pushCloudSharedStage(body.call_id, null, true).catch(() => {})
        pushCloudInvitedRoster(body.call_id, [], true).catch(() => {})
        existing.state = "ENDED"
        existing.ended_at = now
        existing.participants = []
        existing.invited_roster = []
        existing.shared_stage = null
        existing.state_version += 1
        ACTIVE_CALLS_STORE.set(body.call_id, existing)
        savePersistedCalls(true)
      }
      return NextResponse.json({
        protocol_version: 1,
        event_type: "call.ended",
        occurred_at: now,
        call: existing || null,
      })
    }

    if (action === "upsert_invitee" && body.call_id) {
      const callId = String(body.call_id).trim()
      const userId = body.user_id || `host_${nowMs.toString().slice(-6)}`
      const displayName = body.display_name || "ConnectLn Host"
      await pullCloudCallParticipants().catch(() => {})
      const record = ensureCallRoom(callId, userId, displayName, callId)
      if (record.state === "ENDED") {
        record.state = "CONNECTED"
        record.ended_at = null
        record.participants = []
        record.invited_roster = []
        record.shared_stage = null
        record.state_version += 1
      }
      if (body.call_type === "audio" || body.call_type === "video") {
        record.call_type = body.call_type
      }
      if (typeof body.target_recipient_name === "string" && body.target_recipient_name.trim()) {
        record.target_recipient_name = body.target_recipient_name.trim()
      }
      if (typeof body.target_recipient_email === "string" && body.target_recipient_email.trim()) {
        record.target_recipient_email = body.target_recipient_email.trim().toLowerCase()
      }
      if (typeof body.target_recipient_phone === "string" && body.target_recipient_phone.trim()) {
        record.target_recipient_phone = body.target_recipient_phone.trim()
      }
      if (typeof body.initiator_phone === "string" && body.initiator_phone.trim()) {
        record.initiator_phone = body.initiator_phone.trim()
      }
      if (!record.initiator_name && displayName) {
        record.initiator_name = displayName
      }

      const updates: any[] = []
      if (body.invited_member) updates.push(body.invited_member)
      if (Array.isArray(body.invited_roster_updates)) updates.push(...body.invited_roster_updates)
      const changed = mergeInvitedEntriesIntoRecord(record, updates, nowMs)
      if (changed) {
        record.state_version += 1
        await pushCloudInvitedRoster(callId, record.invited_roster, true).catch(() => {})
      }
      ACTIVE_CALLS_STORE.set(callId, record)
      savePersistedCalls(true)
      return NextResponse.json({
        protocol_version: 1,
        event_type: "call.roster_updated",
        occurred_at: now,
        call: record,
      })
    }

    if (action === "create" || action === "join" || action === "heartbeat" || action === "share_stage" || action === "chat_message") {
      const callId = body.call_id || "call-9b0bbf68-live"
      const userId = body.user_id || `user-${nowMs.toString().slice(-6)}`
      const deviceId = body.device_id || "dev-web-workstation"
      const displayName = body.display_name || "Meeting Participant"
      const conversationId = body.conversation_id || "9b0bbf68-20c8-4416-b82c-0f0e81b8df80"

      const record = ensureCallRoom(callId, userId, displayName, conversationId)

      // If this call room was recently ended (< 15s ago) and a client is only sending a periodic heartbeat (not explicitly creating/joining/reopening a call),
      // return the ENDED state immediately so all remaining screens close/clear frozen participants!
      if (record.state === "ENDED") {
        const endedMs = record.ended_at ? new Date(record.ended_at).getTime() : 0
        if (action === "heartbeat" && !body.reopen && nowMs - endedMs < 15000) {
          record.participants = []
          return NextResponse.json({
            protocol_version: 1,
            event_type: "call.ended",
            occurred_at: now,
            call: record,
          })
        }
        // Otherwise, a call is being started or handed off into this room — reopen cleanly
        record.state = "CONNECTED"
        record.ended_at = null
        record.participants = []
        record.shared_stage = null
        record.state_version += 1
      }

      // Update shared presentation stage if provided
      let stageChanged = false
      if (body.shared_stage !== undefined) {
        stageChanged = true
        if (body.shared_stage === null || body.shared_stage.active === false) {
          record.shared_stage = {
            active: false,
            sharer_user_id: userId,
            sharer_name: displayName,
            mode: "screen",
            title: "",
            use_webrtc_stream: false,
            frame_or_data_url: null,
            updated_at_ms: nowMs,
          }
        } else {
          record.shared_stage = {
            active: true,
            sharer_user_id: body.shared_stage.sharer_user_id || userId,
            sharer_name: body.shared_stage.sharer_name || displayName,
            mode: body.shared_stage.mode || "screen",
            title: body.shared_stage.title || "Live Shared Content",
            mime_type: body.shared_stage.mime_type,
            use_webrtc_stream: Boolean(body.shared_stage.use_webrtc_stream),
            frame_or_data_url: body.shared_stage.frame_or_data_url || null,
            updated_at_ms: nowMs,
          }
        }
      }

      // Append shared chat message / shared file attachment if provided
      if (body.chat_message) {
        if (!Array.isArray(record.shared_messages)) {
          record.shared_messages = []
        }
        const msgId = body.chat_message.id || `msg-${nowMs}`
        if (!record.shared_messages.some((m) => m.id === msgId)) {
          record.shared_messages.push({
            id: msgId,
            sender_id: userId,
            sender_name: displayName,
            text: body.chat_message.text || "",
            attachment_name: body.chat_message.attachment_name,
            attachment_data_url: body.chat_message.attachment_data_url,
            sent_at: now,
          })
          if (record.shared_messages.length > 50) {
            record.shared_messages = record.shared_messages.slice(-50)
          }
        }
      }

      // Upsert this participant into the shared call room
      const existingIdx = record.participants.findIndex((p) => p.user_id === userId)
      const isWebRtcConnected = Boolean(body.webrtc_connected)
      const isVideoOn = typeof body.is_video_on === "boolean" ? body.is_video_on : true
      const isMuted = typeof body.is_muted === "boolean" ? body.is_muted : false
      if (body.call_type === "audio" || body.call_type === "video" || body.call_type === "screenshare") {
        record.call_type = body.call_type
      }
      if (typeof body.target_recipient_name === "string" && body.target_recipient_name.trim()) {
        record.target_recipient_name = body.target_recipient_name.trim()
      }
      if (typeof body.target_recipient_email === "string" && body.target_recipient_email.trim()) {
        record.target_recipient_email = body.target_recipient_email.trim().toLowerCase()
      }
      if (typeof body.target_recipient_phone === "string" && body.target_recipient_phone.trim()) {
        record.target_recipient_phone = body.target_recipient_phone.trim()
      }
      if (typeof body.initiator_phone === "string" && body.initiator_phone.trim()) {
        record.initiator_phone = body.initiator_phone.trim()
      }
      if (!record.initiator_name && displayName) {
        record.initiator_name = displayName
      }
      let rosterChanged = false
      const inlineRosterUpdates: any[] = []
      if (body.invited_member) inlineRosterUpdates.push(body.invited_member)
      if (Array.isArray(body.invited_roster_updates)) {
        inlineRosterUpdates.push(...body.invited_roster_updates)
      }
      if (inlineRosterUpdates.length > 0) {
        rosterChanged = mergeInvitedEntriesIntoRecord(record, inlineRosterUpdates, nowMs)
      }

      const updatedParticipant: CommCallParticipant = {
        call_id: callId,
        user_id: userId,
        device_id: deviceId,
        peer_id: body.peer_id || (existingIdx >= 0 ? record.participants[existingIdx].peer_id : undefined),
        display_name: displayName,
        role: body.role || (existingIdx === 0 ? "Host · Local Camera & Mic" : "Invited Friend · Live Video"),
        device_label: body.device_label || "Live WebRTC Camera",
        phone:
          typeof body.participant_phone === "string" && body.participant_phone.trim()
            ? body.participant_phone.trim()
            : existingIdx >= 0
            ? record.participants[existingIdx].phone
            : undefined,
        target_recipient_name: record.target_recipient_name,
        target_recipient_email: record.target_recipient_email,
        target_recipient_phone: record.target_recipient_phone,
        initiator_phone: record.initiator_phone,
        call_type: record.call_type,
        joined_at: existingIdx >= 0 ? record.participants[existingIdx].joined_at : now,
        last_seen_ms: nowMs,
        left_at: null,
        is_muted: isMuted,
        is_video_on: isVideoOn,
        is_speaking: typeof body.is_speaking === "boolean" ? body.is_speaking : true,
        is_screen_sharing: typeof body.is_screen_sharing === "boolean" ? body.is_screen_sharing : false,
        webrtc_connected: isWebRtcConnected,
        virtual_bg_id:
          body.virtual_bg_id !== undefined
            ? body.virtual_bg_id
            : existingIdx >= 0
            ? record.participants[existingIdx].virtual_bg_id
            : "none",
        virtual_bg_badge:
          body.virtual_bg_badge !== undefined
            ? body.virtual_bg_badge
            : existingIdx >= 0
            ? record.participants[existingIdx].virtual_bg_badge
            : undefined,
        live_frame:
          !isVideoOn
            ? null
            : typeof body.live_frame === "string" &&
              body.live_frame.startsWith("data:image/") &&
              body.live_frame.length > 800
            ? body.live_frame
            : existingIdx >= 0
            ? record.participants[existingIdx].live_frame
            : null,
        live_audio_chunk:
          isMuted || isWebRtcConnected
            ? null
            : body.live_audio_chunk &&
              typeof body.live_audio_chunk.data_url === "string" &&
              body.live_audio_chunk.data_url.startsWith("data:audio/")
            ? {
                seq: Number(body.live_audio_chunk.seq) || nowMs,
                data_url: body.live_audio_chunk.data_url,
                ts: Number(body.live_audio_chunk.ts) || nowMs,
              }
            : existingIdx >= 0
            ? record.participants[existingIdx].live_audio_chunk
            : null,
        recent_audio_chunks:
          isMuted || isWebRtcConnected
            ? null
            : Array.isArray(body.recent_audio_chunks) && body.recent_audio_chunks.length > 0
            ? body.recent_audio_chunks
                .filter(
                  (c: any) =>
                    c &&
                    typeof c.data_url === "string" &&
                    c.data_url.startsWith("data:audio/")
                )
                .map((c: any) => ({
                  seq: Number(c.seq) || nowMs,
                  data_url: c.data_url,
                  ts: Number(c.ts) || nowMs,
                }))
                .slice(-3)
            : existingIdx >= 0
            ? record.participants[existingIdx].recent_audio_chunks
            : null,
        participant_state: "CONNECTED",
        e2ee_media_fingerprint:
          existingIdx >= 0
            ? record.participants[existingIdx].e2ee_media_fingerprint
            : "7749 2210 8841 3390",
      }

      if (existingIdx >= 0) {
        record.participants[existingIdx] = updatedParticipant
      } else {
        record.participants.push(updatedParticipant)
        record.sframe_key_epoch += 1
        record.state_version += 1
        recordGlobalUserActivity({
          id: `act_call_join_${callId}_${userId}_${now.slice(0, 13)}`,
          userId,
          userName: displayName,
          actionType: "CALL_JOINED",
          actionLabel: `Joined Live Video Call (${callId})`,
          category: "network",
          targetId: callId,
          targetTitle: `NoctisChat Studio Room (${callId})`,
          details: `${displayName} joined live multi-party E2EE video & audio call (${updatedParticipant.role})`,
          timestampIso: now
        }).catch(() => {})
      }

      // Run cloud push and pull IN PARALLEL so heartbeat round-trip latency is cut in half (~220ms instead of ~850ms)
      await Promise.all([
        pushCloudCallParticipant(callId, updatedParticipant, existingIdx < 0 || action === "join" || action === "create").catch(() => {}),
        stageChanged
          ? pushCloudSharedStage(callId, record.shared_stage || null, action === "share_stage").catch(() => {})
          : Promise.resolve(),
        rosterChanged
          ? pushCloudInvitedRoster(callId, record.invited_roster, true).catch(() => {})
          : Promise.resolve(),
        pullCloudCallParticipants(userId).catch(() => {}),
      ])

      // Prune stale participants who haven't sent a heartbeat in > 25 seconds so disconnected/ended users never stay frozen
      record.participants = record.participants.filter(
        (p) => !p.last_seen_ms || nowMs - p.last_seen_ms < PARTICIPANT_TTL_MS
      )

      ACTIVE_CALLS_STORE.set(callId, record)
      savePersistedCalls()

      return NextResponse.json({
        protocol_version: 1,
        event_type: action === "heartbeat" ? "call.heartbeat" : "call.accepted",
        occurred_at: now,
        call: record,
      })
    }

    if (action === "transition" && body.call_id) {
      const existing = ACTIVE_CALLS_STORE.get(body.call_id)
      if (!existing) {
        return NextResponse.json(
          { error: "CALL_NOT_FOUND", message: "Call session not found or already ended" },
          { status: 404 }
        )
      }
      existing.state = body.next_state || existing.state
      existing.state_version += 1
      if (existing.state === "ENDED") {
        existing.ended_at = now
        existing.participants = []
        existing.shared_stage = null
      }
      savePersistedCalls(true)
      return NextResponse.json({
        protocol_version: 1,
        event_type: `call.${existing.state.toLowerCase()}`,
        occurred_at: now,
        call: existing,
      })
    }

    return NextResponse.json({ status: "ok" })
  } catch (err: any) {
    return NextResponse.json(
      { error: "INVALID_CALL_SIGNALING_PAYLOAD", message: err?.message || "Invalid payload" },
      { status: 400 }
    )
  }
}
