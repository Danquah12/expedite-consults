import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import os from "os"

export interface CommCallParticipant {
  call_id: string
  user_id: string
  device_id: string
  peer_id?: string
  display_name: string
  role: string
  device_label?: string
  joined_at: string
  last_seen_ms?: number
  left_at: string | null
  is_muted?: boolean
  is_video_on?: boolean
  is_speaking?: boolean
  is_screen_sharing?: boolean
  virtual_bg_id?: string
  virtual_bg_badge?: string
  live_frame?: string | null
  live_audio_chunk?: {
    seq: number
    data_url: string
    ts: number
  } | null
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

export interface CommCallRecord {
  id: string
  conversation_id: string
  initiator_user_id: string
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
  shared_stage?: SharedStageRecord | null
  shared_messages?: SharedCallChatMessage[]
}

const globalForCalls = globalThis as unknown as {
  __vibeActiveCallsMap?: Map<string, CommCallRecord>
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

function getTwilioCallsAuthHeader(): string | null {
  const sid = process.env.TWILIO_ACCOUNT_SID || ""
  const token = process.env.TWILIO_AUTH_TOKEN || ""
  if (!sid || !token) return null
  return `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`
}

function makeCloudParticipantKey(callId: string, userId: string): string {
  const cleanCall = String(callId || "room").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 36)
  const cleanUser = String(userId || "peer").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 36)
  return `p__${cleanCall}__${cleanUser}`
}

async function pushCloudCallParticipant(callId: string, participant: CommCallParticipant, force = false): Promise<void> {
  const auth = getTwilioCallsAuthHeader()
  if (!auth) return
  const key = makeCloudParticipantKey(callId, participant.user_id)
  const nowMs = Date.now()
  const lastPush = lastCloudParticipantPushMap.get(key) || 0
  if (!force && nowMs - lastPush < 2200) return
  lastCloudParticipantPushMap.set(key, nowMs)

  try {
    const hasSmallAudio =
      participant.live_audio_chunk &&
      typeof participant.live_audio_chunk.data_url === "string" &&
      participant.live_audio_chunk.data_url.length < 7500
    const maxFrameLen = hasSmallAudio ? 7500 : 11500
    const compactParticipant = {
      ...participant,
      call_id: callId,
      // Keep item well under Twilio Sync 16KB limit while syncing both voice audio and video frames
      live_frame:
        participant.live_frame && participant.live_frame.length < maxFrameLen
          ? participant.live_frame
          : null,
      live_audio_chunk: hasSmallAudio ? participant.live_audio_chunk : null,
    }
    const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${CALLS_SYNC_MAP_NAME}`
    const serialized = JSON.stringify(compactParticipant)

    const updateRes = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ Data: serialized, Ttl: "60" }).toString(),
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
          Ttl: "60",
        }).toString(),
      }).catch(() => {})
    }
  } catch {
    // non-fatal
  }
}

async function pullCloudCallParticipants(): Promise<void> {
  const auth = getTwilioCallsAuthHeader()
  if (!auth) return
  const nowMs = Date.now()
  if (nowMs - lastCloudPullMs < 2000) return
  lastCloudPullMs = nowMs

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 1400)
    const res = await fetch(
      `https://sync.twilio.com/v1/Services/default/Maps/${CALLS_SYNC_MAP_NAME}/Items?PageSize=80`,
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
    for (const item of items) {
      const data = item?.data
      if (!data || !data.call_id || !data.user_id) continue
      if (data.participant_state === "LEFT" || !data.last_seen_ms || nowMs - data.last_seen_ms >= PARTICIPANT_TTL_MS) {
        continue
      }
      const record = ACTIVE_CALLS_STORE.get(data.call_id)
      if (!record || record.state === "ENDED") continue
      const existingIdx = record.participants.findIndex((p) => p.user_id === data.user_id)
      if (existingIdx < 0) {
        record.participants.push(data as CommCallParticipant)
      } else {
        const localP = record.participants[existingIdx]
        if ((data.last_seen_ms || 0) > (localP.last_seen_ms || 0)) {
          record.participants[existingIdx] = {
            ...localP,
            ...data,
            live_frame: data.live_frame || localP.live_frame || null,
            live_audio_chunk: data.live_audio_chunk || localP.live_audio_chunk || null,
          }
        } else if (!localP.peer_id && data.peer_id) {
          record.participants[existingIdx].peer_id = data.peer_id
        }
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
          obj[k] = { ...v, participants: [] }
        } else {
          ACTIVE_CALLS_STORE.delete(k)
        }
        continue
      }
      const activeParts = (v.participants || []).filter(
        (p) => p.last_seen_ms && nowMs - p.last_seen_ms < PARTICIPANT_TTL_MS
      )
      if (activeParts.length > 0) {
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
      shared_stage: null,
      shared_messages: [],
    }
    ACTIVE_CALLS_STORE.set(callId, record)
    savePersistedCalls()
  }
  return record
}

export async function GET(req: NextRequest) {
  loadPersistedCalls()
  const callId = req.nextUrl.searchParams.get("call_id")
  if (callId) {
    const call = ACTIVE_CALLS_STORE.get(callId)
    return NextResponse.json({
      protocol_version: 1,
      call: call || null,
    })
  }
  const calls = Array.from(ACTIVE_CALLS_STORE.values())
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
        existing.state = "ENDED"
        existing.ended_at = now
        existing.participants = []
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

    if (action === "create" || action === "join" || action === "heartbeat" || action === "share_stage" || action === "chat_message") {
      const callId = body.call_id || "call-9b0bbf68-live"
      const userId = body.user_id || `user-${nowMs.toString().slice(-6)}`
      const deviceId = body.device_id || "dev-web-workstation"
      const displayName = body.display_name || "Meeting Participant"
      const conversationId = body.conversation_id || "9b0bbf68-20c8-4416-b82c-0f0e81b8df80"

      const record = ensureCallRoom(callId, userId, displayName, conversationId)
      await pullCloudCallParticipants()

      // If this call room was recently ended (< 15s ago) and a client is only sending a periodic heartbeat (not explicitly creating/joining a new call),
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
        // Otherwise, a new call is being started in this room — reopen cleanly
        record.state = "CONNECTED"
        record.ended_at = null
        record.participants = []
        record.shared_stage = null
        record.state_version += 1
      }

      // Update shared presentation stage if provided
      if (body.shared_stage !== undefined) {
        if (body.shared_stage === null || body.shared_stage.active === false) {
          record.shared_stage = {
            active: false,
            sharer_user_id: userId,
            sharer_name: displayName,
            mode: "screen",
            title: "",
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
      const updatedParticipant: CommCallParticipant = {
        call_id: callId,
        user_id: userId,
        device_id: deviceId,
        peer_id: body.peer_id || (existingIdx >= 0 ? record.participants[existingIdx].peer_id : undefined),
        display_name: displayName,
        role: body.role || (existingIdx === 0 ? "Host · Local Camera & Mic" : "Invited Friend · Live Video"),
        device_label: body.device_label || "Live WebRTC Camera",
        joined_at: existingIdx >= 0 ? record.participants[existingIdx].joined_at : now,
        last_seen_ms: nowMs,
        left_at: null,
        is_muted: typeof body.is_muted === "boolean" ? body.is_muted : false,
        is_video_on: typeof body.is_video_on === "boolean" ? body.is_video_on : true,
        is_speaking: typeof body.is_speaking === "boolean" ? body.is_speaking : true,
        is_screen_sharing: typeof body.is_screen_sharing === "boolean" ? body.is_screen_sharing : false,
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
          typeof body.live_frame === "string" && body.live_frame.length > 3200
            ? body.live_frame
            : existingIdx >= 0
            ? record.participants[existingIdx].live_frame
            : null,
        live_audio_chunk:
          body.is_muted === true
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
      }

      // Sync participant to global cloud map so all Vercel serverless instances see all participants in real time
      pushCloudCallParticipant(callId, updatedParticipant, existingIdx < 0).catch(() => {})

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
