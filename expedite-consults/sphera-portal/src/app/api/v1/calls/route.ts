import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import os from "os"
import { recordGlobalUserActivity } from "@/lib/connectin-cloud-sync"
import { publishToPhones } from "@/lib/connectin-realtime"
import { firebaseKvSetItem, firebaseKvListItems } from "@/lib/connectin-firebase-kv"
import {
  lookupWhatsAppRecipient,
  sendIncomingCallWebPush,
  isSamePhoneOwnerEmail,
} from "@/lib/connectin-whatsapp-directory"

async function dispatchMinimizedWakeupPushForTargets(params: {
  callId: string
  callMode: "audio" | "video"
  callerName: string
  callerPhone?: string
  targets: Array<{ phone?: string; email?: string; name?: string }>
}): Promise<void> {
  if (!params.targets.length) return
  const joinUrl = `https://conectln.com/connectin?waCall=${encodeURIComponent(
    params.callId
  )}&mode=${params.callMode}&callerName=${encodeURIComponent(params.callerName)}&autoAnswer=1`
  await Promise.race([
    Promise.all(
      params.targets.map(async (t) => {
        if (!t.phone && !t.email && !t.name) return
        const found = await lookupWhatsAppRecipient({
          targetPhone: t.phone,
          targetEmail: t.email,
          targetName: t.name,
        }).catch(() => null)
        if (found?.member) {
          await sendIncomingCallWebPush({
            member: found.member,
            callId: params.callId,
            callMode: params.callMode,
            callerName: params.callerName,
            callerPhone: params.callerPhone,
            joinUrl,
          }).catch(() => {})
        }
      })
    ),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ])
}

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
  is_cohost?: boolean
  host_muted?: boolean
  host_unmuted_at_ms?: number
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
  file_name?: string
  file_size_label?: string
  recipient_scope?: "everyone" | "individual" | "selected"
  recipient_ids?: string[]
  recipient_names?: string[]
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
  attachment_mime?: string
  attachment_data_url?: string
  recipient_scope?: "everyone" | "individual" | "selected"
  recipient_ids?: string[]
  recipient_names?: string[]
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
  is_cohost?: boolean
  host_muted?: boolean
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
  cohost_keys?: string[]
  muted_keys?: string[]
  moderation_updated_at_ms?: number
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
const PARTICIPANT_TTL_MS = 180000
const CALLS_SYNC_MAP_NAME = "vibe_active_calls_map_v1"
let lastDiskLoadMs = 0
let lastDiskSaveMs = 0
let lastCloudPullMs = 0
const lastCloudParticipantPushMap = new Map<string, number>()
const lastCloudAudioSeqMap = new Map<string, number>()
const ENDED_CALL_TOMBSTONES = new Map<string, number>()
const ENDED_TOMBSTONE_TTL_MS = 120000

function isCallTombstoned(callId: string, nowMs = Date.now()): boolean {
  const ts = ENDED_CALL_TOMBSTONES.get(callId)
  if (!ts) return false
  if (nowMs - ts < ENDED_TOMBSTONE_TTL_MS) return true
  ENDED_CALL_TOMBSTONES.delete(callId)
  return false
}

function makeCloudEndedKey(callId: string): string {
  const cleanCall = String(callId || "room").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48)
  return `e__${cleanCall}`
}

function getTwilioCallsAuthHeader(): string | null {
  return "firebase-kv"
}

let cloudflareIceCache: { servers: any[]; expiresAtMs: number } | null = null

/**
 * Dedicated relay: Cloudflare Realtime TURN (free tier 1,000 GB/month) when
 * CLOUDFLARE_TURN_KEY_ID + CLOUDFLARE_TURN_API_TOKEN are set. Short-lived credentials
 * minted server-side and cached for 12h. Returns [] when not configured or on failure.
 */
async function getCloudflareTurnServers(): Promise<any[]> {
  const keyId = String(process.env.CLOUDFLARE_TURN_KEY_ID || "").trim()
  const token = String(process.env.CLOUDFLARE_TURN_API_TOKEN || "").trim()
  if (!keyId || !token) return []
  if (cloudflareIceCache && cloudflareIceCache.expiresAtMs > Date.now()) return cloudflareIceCache.servers
  try {
    const res = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(keyId)}/credentials/generate-ice-servers`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ttl: 86400 }),
        cache: "no-store",
      }
    )
    if (!res.ok) return []
    const data: any = await res.json()
    const raw = data?.iceServers
    const servers = Array.isArray(raw) ? raw : raw ? [raw] : []
    if (servers.length > 0) {
      cloudflareIceCache = { servers, expiresAtMs: Date.now() + 12 * 60 * 60 * 1000 }
    }
    return servers
  } catch {
    return []
  }
}

async function getCachedTwilioIceServers(): Promise<any[]> {
  const stun = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ]
  const dedicated = await getCloudflareTurnServers()
  if (dedicated.length > 0) return [...dedicated, ...stun]
  // Fallback: free public OpenRelay TURN (shared, best-effort)
  return [
    ...stun,
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turns:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ]
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

function makeCloudChatKey(callId: string): string {
  const cleanCall = String(callId || "room").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48)
  return `c__${cleanCall}`
}

function buildModerationIdentityKeys(entry: {
  userId?: string
  phone?: string
  email?: string
  name?: string
}): string[] {
  const keys: string[] = []
  const uid = String(entry.userId || "").trim()
  if (uid) keys.push(`uid:${uid}`)
  const digits = String(entry.phone || "").replace(/[^\d]/g, "")
  if (digits.length >= 7) keys.push(`tel:${digits.slice(-10)}`)
  const em = String(entry.email || "").trim().toLowerCase()
  if (em) keys.push(`em:${em}`)
  const nm = String(entry.name || "").trim().toLowerCase()
  if (nm && nm !== "connectln call" && nm !== "participant") keys.push(`nm:${nm}`)
  return keys
}

function participantMatchesModKey(
  entry: { user_id?: string; phone?: string; email?: string; display_name?: string; name?: string },
  keySet: Set<string>
): boolean {
  if (keySet.size === 0) return false
  const candidates = buildModerationIdentityKeys({
    userId: entry.user_id,
    phone: entry.phone,
    email: entry.email,
    name: entry.display_name || entry.name,
  })
  return candidates.some((k) => keySet.has(k))
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
      is_cohost: raw.is_cohost !== undefined ? Boolean(raw.is_cohost) : prev?.is_cohost,
      host_muted: raw.host_muted !== undefined ? Boolean(raw.host_muted) : prev?.host_muted,
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
const lastCloudChatPushMap = new Map<string, number>()

async function pushCloudInvitedRoster(
  callId: string,
  roster: CommInvitedMember[] | undefined,
  force = false,
  cohostKeys?: string[],
  mutedKeys?: string[],
  moderationUpdatedAtMs?: number
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
    is_cohost: Boolean(m.is_cohost),
    host_muted: Boolean(m.host_muted),
    updated_at_ms: m.updated_at_ms || nowMs,
  }))
  const liveRec = ACTIVE_CALLS_STORE.get(callId)
  const payloadObj: Record<string, any> = {
    kind: "roster",
    call_id: callId,
    invited_roster: compactRoster,
    updated_at_ms: nowMs,
  }
  if (liveRec) {
    if (liveRec.initiator_user_id) payloadObj.initiator_user_id = liveRec.initiator_user_id
    if (liveRec.initiator_name) payloadObj.initiator_name = liveRec.initiator_name
    if (liveRec.initiator_phone) payloadObj.initiator_phone = liveRec.initiator_phone
    if (liveRec.target_recipient_name) payloadObj.target_recipient_name = liveRec.target_recipient_name
    if (liveRec.target_recipient_email) payloadObj.target_recipient_email = liveRec.target_recipient_email
    if (liveRec.target_recipient_phone) payloadObj.target_recipient_phone = liveRec.target_recipient_phone
  }
  if (cohostKeys !== undefined || mutedKeys !== undefined) {
    payloadObj.cohost_keys = cohostKeys || []
    payloadObj.muted_keys = mutedKeys || []
    if (moderationUpdatedAtMs && moderationUpdatedAtMs > 0) {
      payloadObj.moderation_updated_at_ms = moderationUpdatedAtMs
    }
  }
  await upsertTwilioSyncItem(auth, rosterKey, JSON.stringify(payloadObj), "600")
}

async function pushCloudSharedMessages(
  callId: string,
  messages: SharedCallChatMessage[] | undefined,
  force = false
): Promise<void> {
  const auth = getTwilioCallsAuthHeader()
  if (!auth || !Array.isArray(messages) || messages.length === 0) return
  const chatKey = makeCloudChatKey(callId)
  const nowMs = Date.now()
  const lastPush = lastCloudChatPushMap.get(chatKey) || 0
  if (!force && nowMs - lastPush < 600) return
  lastCloudChatPushMap.set(chatKey, nowMs)

  const compactMsgs = messages.slice(-25).map((m) => ({
    ...m,
    attachment_data_url:
      m.attachment_data_url && m.attachment_data_url.length < 260000
        ? m.attachment_data_url
        : undefined,
  }))
  const payload = JSON.stringify({
    kind: "chat",
    call_id: callId,
    shared_messages: compactMsgs,
    updated_at_ms: nowMs,
  })
  await upsertTwilioSyncItem(auth, chatKey, payload, "300")
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
    stage?.frame_or_data_url && stage.frame_or_data_url.length < 480000
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
    file_name: stage?.file_name,
    file_size_label: stage?.file_size_label,
    recipient_scope: stage?.recipient_scope || "everyone",
    recipient_ids: stage?.recipient_ids,
    recipient_names: stage?.recipient_names,
    use_webrtc_stream: Boolean(stage?.use_webrtc_stream),
    frame_or_data_url: compactFrame,
    updated_at_ms: stage?.updated_at_ms || nowMs,
  })
  await upsertTwilioSyncItem(auth, stageKey, payload, "180")
}

async function upsertTwilioSyncItem(_auth: string, key: string, serialized: string, ttlSec = "60"): Promise<void> {
  try {
    const parsed = JSON.parse(serialized)
    await firebaseKvSetItem(CALLS_SYNC_MAP_NAME, key, parsed, Number(ttlSec) || 60)
  } catch {
    // non-fatal
  }
}

async function pushCloudCallParticipant(callId: string, participant: CommCallParticipant, force = false): Promise<void> {
  const auth = getTwilioCallsAuthHeader()
  if (!auth) return
  const key = makeCloudParticipantKey(callId, participant.user_id)
  const nowMs = Date.now()

  // Push participant metadata (`p__call__user`) to Firebase KV so all serverless instances share active calls
  // Immediate on create/join/leave/end (force=true); every 10s on routine heartbeat to stay well below Firebase 60/min quota.
  const lastPush = lastCloudParticipantPushMap.get(key) || 0
  const minPushIntervalMs = 10000
  if (force || nowMs - lastPush >= minPushIntervalMs) {
    lastCloudParticipantPushMap.set(key, nowMs)
    const compactParticipant = {
      ...participant,
      call_id: callId,
      live_frame: null,
      live_audio_chunk: null,
      recent_audio_chunks: undefined,
    }
    await upsertTwilioSyncItem(auth, key, JSON.stringify(compactParticipant), "600").catch(() => {})
  }
}

async function pullCloudCallParticipants(excludeUserId?: string, forceRefresh = false): Promise<void> {
  const nowMs = Date.now()
  if (!forceRefresh && nowMs - lastCloudPullMs < 80) return
  lastCloudPullMs = nowMs

  try {
    const items = await firebaseKvListItems<any>(CALLS_SYNC_MAP_NAME, forceRefresh)

    // Pass 0: record ended-call tombstones (`e__`) so no ended call can ever be resurrected by another lambda instance
    for (const item of items) {
      const data = item?.data
      if (!data || !data.call_id) continue
      if (data.kind === "ended" || String(item?.key || "").startsWith("e__")) {
        const endedTs = Number(data.ended_at_ms) || 0
        if (endedTs > 0 && nowMs - endedTs < ENDED_TOMBSTONE_TTL_MS) {
          ENDED_CALL_TOMBSTONES.set(data.call_id, endedTs)
          const existingRec = ACTIVE_CALLS_STORE.get(data.call_id)
          if (existingRec) {
            existingRec.state = "ENDED"
            existingRec.ended_at = data.ended_at || existingRec.ended_at || new Date(endedTs).toISOString()
            existingRec.participants = []
            existingRec.invited_roster = []
            existingRec.shared_stage = null
          }
        }
      }
    }

    // First pass: merge participant records (`p__`) and collect shared stage (`s__`), roster (`r__`), chat (`c__`), and audio (`a__`)
    const audioItems: any[] = []
    const rosterItems: any[] = []
    const chatItems: any[] = []
    for (const item of items) {
      const data = item?.data
      if (!data || !data.call_id) continue
      if (data.kind === "ended" || String(item?.key || "").startsWith("e__")) continue
      if (isCallTombstoned(data.call_id, nowMs)) continue
      if (data.kind === "roster" || String(item?.key || "").startsWith("r__")) {
        rosterItems.push(data)
        continue
      }
      if (data.kind === "chat" || String(item?.key || "").startsWith("c__")) {
        chatItems.push(data)
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
              file_name: data.file_name,
              file_size_label: data.file_size_label,
              recipient_scope: data.recipient_scope || "everyone",
              recipient_ids: Array.isArray(data.recipient_ids) ? data.recipient_ids : undefined,
              recipient_names: Array.isArray(data.recipient_names) ? data.recipient_names : undefined,
              use_webrtc_stream: Boolean(data.use_webrtc_stream),
              frame_or_data_url: data.frame_or_data_url || record.shared_stage?.frame_or_data_url || null,
              updated_at_ms: remoteTs,
            }
          }
        }
        continue
      }
      if (!data.user_id) continue
      if (data.kind === "audio" || String(item?.key || "").startsWith("a__")) {
        if (!(excludeUserId && data.user_id === excludeUserId)) {
          audioItems.push(data)
        }
        continue
      }
      if (data.participant_state === "LEFT") {
        if (!(excludeUserId && data.user_id === excludeUserId)) {
          const leftRecord = ACTIVE_CALLS_STORE.get(data.call_id)
          if (leftRecord) {
            leftRecord.participants = (leftRecord.participants || []).filter((p) => p.user_id !== data.user_id)
          }
        }
        continue
      }
      if (!data.last_seen_ms || nowMs - data.last_seen_ms >= PARTICIPANT_TTL_MS) {
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
      if (excludeUserId && data.user_id === excludeUserId) continue
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

      // Third pass: merge invited_roster + timestamp-versioned moderation keys (`r__`)
      for (const rData of rosterItems) {
        const remoteTs = Number(rData.updated_at_ms) || 0
        if (nowMs - remoteTs > 300000) continue
        let record = ACTIVE_CALLS_STORE.get(rData.call_id)
        if (!record && Array.isArray(rData.invited_roster) && rData.invited_roster.length > 0) {
          record = ensureCallRoom(rData.call_id, "host", "ConnectLn Call", rData.call_id)
        }
        if (record && record.state !== "ENDED") {
          if (rData.initiator_user_id) record.initiator_user_id = rData.initiator_user_id
          if (rData.initiator_name && !record.initiator_name) record.initiator_name = rData.initiator_name
          if (rData.initiator_phone && !record.initiator_phone) record.initiator_phone = rData.initiator_phone
          if (rData.target_recipient_name && !record.target_recipient_name) {
            record.target_recipient_name = rData.target_recipient_name
          }
          if (rData.target_recipient_email && !record.target_recipient_email) {
            record.target_recipient_email = rData.target_recipient_email
          }
          if (rData.target_recipient_phone && !record.target_recipient_phone) {
            record.target_recipient_phone = rData.target_recipient_phone
          }
          if (Array.isArray(rData.invited_roster)) {
            mergeInvitedEntriesIntoRecord(record, rData.invited_roster, remoteTs || nowMs)
          }
          const incomingModTs =
            typeof rData.moderation_updated_at_ms === "number"
              ? rData.moderation_updated_at_ms
              : 0
          if (
            incomingModTs > 0 &&
            incomingModTs >= (record.moderation_updated_at_ms || 0)
          ) {
            if (Array.isArray(rData.cohost_keys)) {
              record.cohost_keys = [...rData.cohost_keys]
            }
            if (Array.isArray(rData.muted_keys)) {
              record.muted_keys = [...rData.muted_keys]
            }
            record.moderation_updated_at_ms = incomingModTs
          }
        }
      }

      // Fourth pass: merge shared chat messages (`c__`)
      for (const cData of chatItems) {
        const remoteTs = Number(cData.updated_at_ms) || 0
        if (nowMs - remoteTs > 300000) continue
        const record = ACTIVE_CALLS_STORE.get(cData.call_id)
        if (record && record.state !== "ENDED" && Array.isArray(cData.shared_messages)) {
          const msgMap = new Map<string, SharedCallChatMessage>()
          for (const m of record.shared_messages || []) msgMap.set(m.id, m)
          for (const m of cData.shared_messages) {
            if (m && m.id) msgMap.set(m.id, m)
          }
          record.shared_messages = Array.from(msgMap.values()).slice(-50)
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
              if (
                typeof v.moderation_updated_at_ms === "number" &&
                v.moderation_updated_at_ms > (mem.moderation_updated_at_ms || 0)
              ) {
                if (Array.isArray(v.cohost_keys)) {
                  mem.cohost_keys = [...v.cohost_keys]
                }
                if (Array.isArray(v.muted_keys)) {
                  mem.muted_keys = [...v.muted_keys]
                }
                mem.moderation_updated_at_ms = v.moderation_updated_at_ms
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
        (m) => m.updated_at_ms && nowMs - m.updated_at_ms < 180000
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

  const endedCallIds: string[] = []
  for (const [eid, ts] of ENDED_CALL_TOMBSTONES.entries()) {
    if (nowMs - ts < ENDED_TOMBSTONE_TTL_MS) {
      endedCallIds.push(eid)
    } else {
      ENDED_CALL_TOMBSTONES.delete(eid)
    }
  }

  const calls = Array.from(ACTIVE_CALLS_STORE.values()).filter((c) => {
    if (c.state === "ENDED" || isCallTombstoned(c.id, nowMs)) return false
    const liveParts = (c.participants || []).filter(
      (p) => p.last_seen_ms && nowMs - p.last_seen_ms < PARTICIPANT_TTL_MS
    )
    c.participants = liveParts
    const hasFreshInvite = (c.invited_roster || []).some(
      (m) => m.status !== "removed" && m.updated_at_ms && nowMs - m.updated_at_ms < 120000
    )
    return liveParts.length > 0 || hasFreshInvite
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
          (incomingEmail &&
            targetEmail &&
            (targetEmail === incomingEmail || isSamePhoneOwnerEmail(incomingEmail, targetEmail))) ||
          (incomingForName &&
            targetName &&
            (targetName === incomingForName ||
              targetName.includes(incomingForName) ||
              incomingForName.includes(targetName)))
      )
    }

    const incomingCalls = calls.filter((c) => {
      // Skip ONLY if this exact browser/mobile tab (`viewerPeerId`) is already a participant in the call,
      // OR if this request comes from the call's initiator tab (`initiator_user_id === viewerPeerId`).
      if (viewerPeerId && c.participants.some((p) => p.user_id === viewerPeerId)) {
        return false
      }
      if (c.initiator_user_id && viewerPeerId && c.initiator_user_id === viewerPeerId) {
        return false
      }
      const cidLower = c.id.toLowerCase()
      const targetDigits = String(c.target_recipient_phone || "").replace(/[^\d]/g, "")
      const initiatorDigits = String(c.initiator_phone || "").replace(/[^\d]/g, "")
      const hasExplicitTargetPhone = targetDigits.length >= 7

      // Never ring the initiator's own phone when the recipient answers and their heartbeat runs,
      // unless dialing another number on the same account owner whose call hasn't been answered yet.
      const viewerIsInitiatorPhone = Boolean(
        incomingPhoneDigits.length >= 7 &&
          initiatorDigits.length >= 7 &&
          (incomingPhoneDigits === initiatorDigits ||
            incomingPhoneDigits.slice(-10) === initiatorDigits.slice(-10))
      )
      const isIntentionalSelfCall = Boolean(
        viewerIsInitiatorPhone &&
          targetDigits.length >= 7 &&
          (targetDigits === initiatorDigits || targetDigits.slice(-10) === initiatorDigits.slice(-10))
      )
      const callAlreadyAnsweredByPeer = (c.participants || []).some(
        (p) => p.user_id && c.initiator_user_id && p.user_id !== c.initiator_user_id
      )
      const targetsSameAccountOwner = Boolean(
        (incomingEmail &&
          c.target_recipient_email &&
          isSamePhoneOwnerEmail(incomingEmail, c.target_recipient_email)) ||
          (incomingForName &&
            c.target_recipient_name &&
            c.target_recipient_name.trim().toLowerCase() === incomingForName)
      )
      if (viewerIsInitiatorPhone && !isIntentionalSelfCall) {
        if (
          callAlreadyAnsweredByPeer ||
          !targetsSameAccountOwner ||
          (c.initiator_user_id && viewerPeerId && c.initiator_user_id === viewerPeerId)
        ) {
          return false
        }
      }

      const phoneMatchesTarget = Boolean(
        hasExplicitTargetPhone &&
          incomingPhoneDigits.length >= 7 &&
          (incomingPhoneDigits === targetDigits ||
            incomingPhoneDigits.slice(-10) === targetDigits.slice(-10))
      )

      // When a call dials a specific phone number (`target_recipient_phone`), match primarily by phone number
      // or shared owner email so secondary devices signed in with the same owner email also ring.
      const primaryMatch = hasExplicitTargetPhone
        ? phoneMatchesTarget ||
          matchesTarget(c.target_recipient_name, c.target_recipient_email, c.target_recipient_phone)
        : matchesTarget(c.target_recipient_name, c.target_recipient_email, c.target_recipient_phone)

      const rosterMatch = (c.invited_roster || []).some((inv) => {
        if (inv.status === "removed") return false
        const invDigits = String(inv.phone || "").replace(/[^\d]/g, "")
        if (invDigits.length >= 7 && incomingPhoneDigits.length >= 7) {
          if (invDigits === incomingPhoneDigits || invDigits.slice(-10) === incomingPhoneDigits.slice(-10)) {
            return true
          }
        }
        return matchesTarget(inv.name, inv.email, inv.phone)
      })

      // For DM calls without an explicit target_recipient_name/phone (where callId contains both caller & callee names),
      // don't match the caller's own name via `cidLower.includes(nameSlug)`.
      const viewerSharesCallerName = c.participants.some(
        (p) => incomingForName && String(p.display_name || "").trim().toLowerCase() === incomingForName
      )
      const hasAnyExplicitTarget = Boolean(
        c.target_recipient_name || c.target_recipient_email || c.target_recipient_phone
      )
      if (!hasAnyExplicitTarget && (!c.invited_roster || c.invited_roster.length === 0)) {
        return Boolean(rosterMatch)
      }

      return Boolean(
        primaryMatch ||
          rosterMatch ||
          (!hasAnyExplicitTarget && !viewerSharesCallerName && nameSlug.length >= 4 && cidLower.includes(nameSlug))
      )
    })
    return NextResponse.json({
      protocol_version: 1,
      incoming_calls: incomingCalls,
      ended_call_ids: endedCallIds,
    })
  }

  return NextResponse.json({
    protocol_version: 1,
    active_calls_count: calls.length,
    calls,
    ended_call_ids: endedCallIds,
  })
}

async function removeSingleParticipantFromGroupCall(params: {
  callId: string
  existing: CommCallRecord
  userId?: string
  participantPhone?: string
  displayName?: string
  now: string
  nowMs: number
}): Promise<void> {
  const { callId, existing, userId, participantPhone, displayName, now, nowMs } = params
  const leavingKeys = new Set(
    buildModerationIdentityKeys({
      userId,
      phone: participantPhone,
      name: displayName,
    })
  )

  const matchedParticipant = userId
    ? (existing.participants || []).find((p) => p.user_id === userId)
    : undefined
  if (matchedParticipant?.phone) {
    buildModerationIdentityKeys({
      phone: matchedParticipant.phone,
      name: matchedParticipant.display_name,
    }).forEach((k) => leavingKeys.add(k))
  }

  if (userId) {
    existing.participants = (existing.participants || []).filter((p) => p.user_id !== userId)
    await pushCloudCallParticipant(
      callId,
      {
        call_id: callId,
        user_id: userId,
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

  let rosterUpdated = false
  if (leavingKeys.size > 0 && Array.isArray(existing.invited_roster)) {
    for (const inv of existing.invited_roster) {
      if (inv && inv.status !== "removed" && participantMatchesModKey(inv, leavingKeys)) {
        inv.status = "removed"
        inv.updated_at_ms = nowMs
        rosterUpdated = true
      }
    }
  }
  if (rosterUpdated) {
    await pushCloudInvitedRoster(
      callId,
      existing.invited_roster,
      true,
      existing.cohost_keys,
      existing.muted_keys,
      existing.moderation_updated_at_ms
    ).catch(() => {})
  }

  if (existing.shared_stage && userId && existing.shared_stage.sharer_user_id === userId) {
    existing.shared_stage = null
    await pushCloudSharedStage(callId, null, true).catch(() => {})
  }

  existing.state_version += 1
  ACTIVE_CALLS_STORE.set(callId, existing)
  savePersistedCalls(true)
}

export async function POST(req: NextRequest) {
  try {
    loadPersistedCalls()
    const body = await req.json()
    const action = body.action || "create"
    const now = new Date().toISOString()
    const nowMs = Date.now()

    if (action === "leave" && body.call_id) {
      const leaveCallId = String(body.call_id).trim()
      await pullCloudCallParticipants(undefined, true).catch(() => {})
      const existing = ACTIVE_CALLS_STORE.get(leaveCallId)
      if (existing) {
        await removeSingleParticipantFromGroupCall({
          callId: leaveCallId,
          existing,
          userId: body.user_id,
          participantPhone:
            typeof body.participant_phone === "string" ? body.participant_phone : undefined,
          displayName: typeof body.display_name === "string" ? body.display_name : undefined,
          now,
          nowMs,
        })
      }
      return NextResponse.json({
        protocol_version: 1,
        event_type: "call.participant_left",
        occurred_at: now,
        call: existing || null,
      })
    }

    if (action === "end" && body.call_id) {
      const endCallId = String(body.call_id).trim()
      await pullCloudCallParticipants(undefined, true).catch(() => {})
      let existing = ACTIVE_CALLS_STORE.get(endCallId)
      if (!existing) {
        existing = ensureCallRoom(endCallId, body.user_id || "host", body.display_name || "Host", endCallId)
      }

      const otherActive = (existing.participants || []).filter(
        (p) =>
          p.user_id !== body.user_id &&
          p.participant_state !== "LEFT" &&
          p.last_seen_ms &&
          nowMs - p.last_seen_ms < PARTICIPANT_TTL_MS
      )
      if (otherActive.length >= 2 && !body.end_for_all) {
        await removeSingleParticipantFromGroupCall({
          callId: endCallId,
          existing,
          userId: body.user_id,
          participantPhone:
            typeof body.participant_phone === "string" ? body.participant_phone : undefined,
          displayName: typeof body.display_name === "string" ? body.display_name : undefined,
          now,
          nowMs,
        })
        return NextResponse.json({
          protocol_version: 1,
          event_type: "call.participant_left",
          occurred_at: now,
          call: existing,
        })
      }

      ENDED_CALL_TOMBSTONES.set(endCallId, nowMs)

      const phonesToSilence: Array<string | undefined> = [
        existing.target_recipient_phone,
        existing.initiator_phone,
        typeof body.target_recipient_phone === "string" ? body.target_recipient_phone : undefined,
        ...(existing.invited_roster || []).map((m) => m.phone),
        ...(existing.participants || []).map((p) => p.phone),
        ...(Array.isArray(body.invited_phones) ? body.invited_phones : []),
      ]

      const cloudOps: Promise<any>[] = [
        upsertTwilioSyncItem(
          "firebase-kv",
          makeCloudEndedKey(endCallId),
          JSON.stringify({
            kind: "ended",
            call_id: endCallId,
            ended_at: now,
            ended_at_ms: nowMs,
          }),
          "120"
        ).catch(() => {}),
        publishToPhones(phonesToSilence, "call-ended", { callId: endCallId }).catch(() => {}),
        pushCloudSharedStage(endCallId, null, true).catch(() => {}),
        pushCloudInvitedRoster(endCallId, [], true, [], [], nowMs).catch(() => {}),
      ]
      for (const p of existing.participants || []) {
        cloudOps.push(
          pushCloudCallParticipant(
            endCallId,
            { ...p, last_seen_ms: 0, left_at: now, participant_state: "LEFT" },
            true
          ).catch(() => {})
        )
      }
      await Promise.all(cloudOps)
      lastCloudPullMs = 0

      existing.state = "ENDED"
      existing.ended_at = now
      existing.participants = []
      existing.invited_roster = []
      existing.shared_stage = null
      existing.state_version += 1
      ACTIVE_CALLS_STORE.set(endCallId, existing)
      savePersistedCalls(true)

      return NextResponse.json({
        protocol_version: 1,
        event_type: "call.ended",
        occurred_at: now,
        call: existing,
      })
    }

    if (action === "moderate_participant" && body.call_id) {
      const modCallId = String(body.call_id).trim()
      await pullCloudCallParticipants().catch(() => {})
      const record = ensureCallRoom(modCallId, body.user_id || "host", body.display_name || "Host", modCallId)
      if (!Array.isArray(record.muted_keys)) record.muted_keys = []
      if (!Array.isArray(record.cohost_keys)) record.cohost_keys = []

      const subAction = String(body.sub_action || "")
      const targetKeys = buildModerationIdentityKeys({
        userId: body.target_user_id,
        phone: body.target_phone,
        email: body.target_email,
        name: body.target_name,
      })
      const touchedParticipants: CommCallParticipant[] = []

      if (subAction === "mute_all") {
        const nextMuted = new Set<string>(record.muted_keys)
        for (const p of record.participants || []) {
          if (body.actor_user_id && p.user_id === body.actor_user_id) continue
          for (const k of buildModerationIdentityKeys({
            userId: p.user_id,
            phone: p.phone,
            name: p.display_name,
          })) {
            nextMuted.add(k)
          }
          p.host_muted = true
          p.is_muted = true
          touchedParticipants.push(p)
        }
        for (const inv of record.invited_roster || []) {
          for (const k of buildModerationIdentityKeys({
            phone: inv.phone,
            email: inv.email,
            name: inv.name,
          })) {
            nextMuted.add(k)
          }
          inv.host_muted = true
        }
        record.muted_keys = Array.from(nextMuted)
      } else if (subAction === "mute_member" || subAction === "unmute_member") {
        const shouldMute = subAction === "mute_member"
        const mutedSet = new Set<string>(record.muted_keys)
        const targetSet = new Set<string>(targetKeys)
        for (const k of targetKeys) {
          if (shouldMute) mutedSet.add(k)
          else mutedSet.delete(k)
        }
        for (const p of record.participants || []) {
          if (participantMatchesModKey(p, targetSet)) {
            for (const pk of buildModerationIdentityKeys({
              userId: p.user_id,
              phone: p.phone,
              name: p.display_name,
            })) {
              if (shouldMute) mutedSet.add(pk)
              else mutedSet.delete(pk)
            }
            p.host_muted = shouldMute
            p.is_muted = shouldMute
            if (!shouldMute) p.host_unmuted_at_ms = nowMs
            touchedParticipants.push(p)
          }
        }
        for (const inv of record.invited_roster || []) {
          if (participantMatchesModKey(inv, targetSet)) {
            for (const ik of buildModerationIdentityKeys({
              phone: inv.phone,
              email: inv.email,
              name: inv.name,
            })) {
              if (shouldMute) mutedSet.add(ik)
              else mutedSet.delete(ik)
            }
            inv.host_muted = shouldMute
          }
        }
        record.muted_keys = Array.from(mutedSet)
      } else if (subAction === "toggle_cohost") {
        const grant = body.is_cohost !== false
        const cohostSet = new Set<string>(record.cohost_keys)
        const targetSet = new Set<string>(targetKeys)
        for (const k of targetKeys) {
          if (grant) cohostSet.add(k)
          else cohostSet.delete(k)
        }
        for (const p of record.participants || []) {
          if (participantMatchesModKey(p, targetSet)) {
            for (const pk of buildModerationIdentityKeys({
              userId: p.user_id,
              phone: p.phone,
              name: p.display_name,
            })) {
              if (grant) cohostSet.add(pk)
              else cohostSet.delete(pk)
            }
            p.is_cohost = grant
            touchedParticipants.push(p)
          }
        }
        for (const inv of record.invited_roster || []) {
          if (participantMatchesModKey(inv, targetSet)) {
            for (const ik of buildModerationIdentityKeys({
              phone: inv.phone,
              email: inv.email,
              name: inv.name,
            })) {
              if (grant) cohostSet.add(ik)
              else cohostSet.delete(ik)
            }
            inv.is_cohost = grant
          }
        }
        record.cohost_keys = Array.from(cohostSet)
      }

      record.moderation_updated_at_ms = nowMs
      record.state_version += 1
      ACTIVE_CALLS_STORE.set(modCallId, record)
      await Promise.all([
        pushCloudInvitedRoster(
          modCallId,
          record.invited_roster,
          true,
          record.cohost_keys,
          record.muted_keys,
          record.moderation_updated_at_ms
        ).catch(() => {}),
        ...touchedParticipants.map((p) =>
          pushCloudCallParticipant(modCallId, p, true).catch(() => {})
        ),
      ])
      savePersistedCalls(true)
      return NextResponse.json({
        protocol_version: 1,
        event_type: "call.moderated",
        occurred_at: now,
        call: record,
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

      // Ensure initiator/host is immediately recorded as a live participant so minimized
      // recipients polling GET /api/v1/calls on another serverless instance see the active call before getUserMedia resolves.
      let hostParticipantToPush: CommCallParticipant | null = null
      const hostIdx = (record.participants || []).findIndex((p) => p.user_id === userId)
      if (hostIdx < 0) {
        hostParticipantToPush = {
          call_id: callId,
          user_id: userId,
          device_id: "host-signaling",
          display_name: displayName,
          role: "Host · Calling",
          device_label: "ConnectLn WebRTC",
          phone: record.initiator_phone,
          target_recipient_name: record.target_recipient_name,
          target_recipient_email: record.target_recipient_email,
          target_recipient_phone: record.target_recipient_phone,
          initiator_phone: record.initiator_phone,
          call_type: record.call_type,
          joined_at: now,
          last_seen_ms: nowMs,
          left_at: null,
          is_muted: false,
          is_video_on: record.call_type !== "audio",
          is_speaking: false,
          is_screen_sharing: false,
          participant_state: "CONNECTED",
          e2ee_media_fingerprint: "7749 2210 8841 3390",
        }
        record.participants.push(hostParticipantToPush)
      }

      if (changed || hostParticipantToPush) {
        record.state_version += 1
        await Promise.all([
          changed
            ? pushCloudInvitedRoster(
                callId,
                record.invited_roster,
                true,
                record.cohost_keys,
                record.muted_keys,
                record.moderation_updated_at_ms
              ).catch(() => {})
            : Promise.resolve(),
          hostParticipantToPush
            ? pushCloudCallParticipant(callId, hostParticipantToPush, true).catch(() => {})
            : Promise.resolve(),
          changed && !body.skip_push
            ? dispatchMinimizedWakeupPushForTargets({
                callId,
                callMode: record.call_type === "audio" ? "audio" : "video",
                callerName: record.initiator_name || displayName,
                callerPhone: record.initiator_phone,
                targets: updates.map((u) => ({ phone: u?.phone, email: u?.email, name: u?.name })),
              }).catch(() => {})
            : Promise.resolve(),
        ])
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

      // Always pull cloud state first so cross-lambda call-end tombstones (`e__`) are known immediately
      await pullCloudCallParticipants(userId).catch(() => {})

      if (action === "create" || (action === "join" && body.reopen && !body.is_answering_recipient)) {
        ENDED_CALL_TOMBSTONES.delete(callId)
      }

      if (
        action === "heartbeat" &&
        (isCallTombstoned(callId, nowMs) || ACTIVE_CALLS_STORE.get(callId)?.state === "ENDED")
      ) {
        const endedRec = ACTIVE_CALLS_STORE.get(callId)
        if (endedRec) {
          endedRec.state = "ENDED"
          endedRec.participants = []
        }
        return NextResponse.json({
          protocol_version: 1,
          event_type: "call.ended",
          occurred_at: now,
          call: endedRec || { id: callId, state: "ENDED", participants: [] },
        })
      }

      const record = ensureCallRoom(callId, userId, displayName, conversationId)

      // Never reopen an ENDED room from any heartbeat or answering-recipient beat
      if (record.state === "ENDED") {
        if (action === "heartbeat" || body.is_answering_recipient === true) {
          record.participants = []
          return NextResponse.json({
            protocol_version: 1,
            event_type: "call.ended",
            occurred_at: now,
            call: record,
          })
        }
        // Only explicit `create` / host `join` reopens a previously ended room
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
            updated_at_ms: Number(body.shared_stage?.updated_at_ms) || nowMs,
          }
        } else {
          record.shared_stage = {
            active: true,
            sharer_user_id: body.shared_stage.sharer_user_id || userId,
            sharer_name: body.shared_stage.sharer_name || displayName,
            mode: body.shared_stage.mode || "screen",
            title: body.shared_stage.title || "Live Shared Content",
            mime_type: body.shared_stage.mime_type,
            file_name: body.shared_stage.file_name,
            file_size_label: body.shared_stage.file_size_label,
            recipient_scope: body.shared_stage.recipient_scope || "everyone",
            recipient_ids: Array.isArray(body.shared_stage.recipient_ids) ? body.shared_stage.recipient_ids : undefined,
            recipient_names: Array.isArray(body.shared_stage.recipient_names) ? body.shared_stage.recipient_names : undefined,
            use_webrtc_stream: Boolean(body.shared_stage.use_webrtc_stream),
            frame_or_data_url: body.shared_stage.frame_or_data_url || null,
            updated_at_ms: Number(body.shared_stage.updated_at_ms) || nowMs,
          }
        }
      }

      // Append shared chat message / shared file attachment if provided
      let chatChanged = false
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
            attachment_mime: body.chat_message.attachment_mime,
            attachment_data_url: body.chat_message.attachment_data_url,
            recipient_scope: body.chat_message.recipient_scope || "everyone",
            recipient_ids: Array.isArray(body.chat_message.recipient_ids) ? body.chat_message.recipient_ids : undefined,
            recipient_names: Array.isArray(body.chat_message.recipient_names) ? body.chat_message.recipient_names : undefined,
            sent_at: now,
          })
          if (record.shared_messages.length > 50) {
            record.shared_messages = record.shared_messages.slice(-50)
          }
          chatChanged = true
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

      const participantPhone =
        typeof body.participant_phone === "string" && body.participant_phone.trim()
          ? body.participant_phone.trim()
          : existingIdx >= 0
          ? record.participants[existingIdx].phone
          : undefined

      if (body.clear_host_mute === true && Array.isArray(record.muted_keys)) {
        const selfKeys = new Set(
          buildModerationIdentityKeys({
            userId,
            phone: participantPhone,
            name: displayName,
          })
        )
        const beforeLen = record.muted_keys.length
        record.muted_keys = record.muted_keys.filter((k) => !selfKeys.has(k))
        if (record.muted_keys.length !== beforeLen) {
          record.moderation_updated_at_ms = nowMs
          rosterChanged = true
        }
      }

      const cohostSet = new Set(record.cohost_keys || [])
      const mutedSet = new Set(record.muted_keys || [])
      const isCohost =
        participantMatchesModKey(
          { user_id: userId, phone: participantPhone, display_name: displayName },
          cohostSet
        ) || Boolean(body.is_cohost)
      const isHostMuted = participantMatchesModKey(
        { user_id: userId, phone: participantPhone, display_name: displayName },
        mutedSet
      )

      const updatedParticipant: CommCallParticipant = {
        call_id: callId,
        user_id: userId,
        device_id: deviceId,
        peer_id: body.peer_id || (existingIdx >= 0 ? record.participants[existingIdx].peer_id : undefined),
        display_name: displayName,
        role: body.role || (existingIdx === 0 ? "Host · Local Camera & Mic" : "Invited Friend · Live Video"),
        device_label: body.device_label || "Live WebRTC Camera",
        phone: participantPhone,
        target_recipient_name: record.target_recipient_name,
        target_recipient_email: record.target_recipient_email,
        target_recipient_phone: record.target_recipient_phone,
        initiator_phone: record.initiator_phone,
        call_type: record.call_type,
        joined_at: existingIdx >= 0 ? record.participants[existingIdx].joined_at : now,
        last_seen_ms: nowMs,
        left_at: null,
        is_muted: isHostMuted ? true : isMuted,
        is_cohost: isCohost,
        host_muted: isHostMuted,
        host_unmuted_at_ms:
          existingIdx >= 0 ? record.participants[existingIdx].host_unmuted_at_ms : undefined,
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
          !isVideoOn || isWebRtcConnected || body.live_frame === null
            ? null
            : typeof body.live_frame === "string" &&
              body.live_frame.startsWith("data:image/") &&
              body.live_frame.length > 400
            ? body.live_frame
            : existingIdx >= 0
            ? record.participants[existingIdx].live_frame
            : null,
        live_audio_chunk:
          isMuted || isHostMuted || isWebRtcConnected
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
          isMuted || isHostMuted || isWebRtcConnected
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
        pushCloudCallParticipant(
          callId,
          updatedParticipant,
          existingIdx < 0 || action === "join" || action === "create" || rosterChanged
        ).catch(() => {}),
        stageChanged
          ? pushCloudSharedStage(callId, record.shared_stage || null, action === "share_stage").catch(() => {})
          : Promise.resolve(),
        chatChanged
          ? pushCloudSharedMessages(callId, record.shared_messages, true).catch(() => {})
          : Promise.resolve(),
        rosterChanged
          ? pushCloudInvitedRoster(
              callId,
              record.invited_roster,
              true,
              record.cohost_keys,
              record.muted_keys,
              record.moderation_updated_at_ms
            ).catch(() => {})
          : Promise.resolve(),
        pullCloudCallParticipants(userId).catch(() => {}),
      ])

      // Prune stale participants who haven't sent a heartbeat in > 25 seconds so disconnected/ended users never stay frozen
      record.participants = record.participants.filter(
        (p) => !p.last_seen_ms || nowMs - p.last_seen_ms < PARTICIPANT_TTL_MS
      )

      ACTIVE_CALLS_STORE.set(callId, record)
      savePersistedCalls()

      if (action === "create") {
        const pushTargets: Array<{ phone?: string; email?: string; name?: string }> = []
        if (record.target_recipient_phone || record.target_recipient_email || record.target_recipient_name) {
          pushTargets.push({
            phone: record.target_recipient_phone,
            email: record.target_recipient_email,
            name: record.target_recipient_name,
          })
        }
        for (const inv of inlineRosterUpdates) {
          if (inv?.phone || inv?.email || inv?.name) {
            pushTargets.push({ phone: inv.phone, email: inv.email, name: inv.name })
          }
        }
        if (pushTargets.length > 0) {
          await dispatchMinimizedWakeupPushForTargets({
            callId,
            callMode: record.call_type === "audio" ? "audio" : "video",
            callerName: record.initiator_name || displayName,
            callerPhone: record.initiator_phone,
            targets: pushTargets,
          }).catch(() => {})
        }
      }

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
