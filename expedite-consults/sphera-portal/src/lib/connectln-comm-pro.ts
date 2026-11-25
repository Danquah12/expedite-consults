"use client"

export type DisappearingDuration = "off" | "24h" | "7d" | "90d"

export interface PinnedThreadMessage {
  id: string
  text: string
  sender: string
  timestamp?: string
}

export interface CommPrivacySettings {
  hideLastSeen: boolean
  readReceiptsEnabled: boolean
  silenceUnknownCallers: boolean
  blockedKeys: string[]
  reportedKeys: string[]
  lockedThreadPins: Record<string, string>
  disappearingByThread: Record<string, DisappearingDuration>
  pinnedMsgByThread: Record<string, PinnedThreadMessage>
  deletedForMeIds: string[]
  viewedOnceIds: string[]
  pollVotesByMsgId: Record<string, Record<string, string[]>>
}

export interface LinkedDeviceSession {
  id: string
  name: string
  platform: string
  location: string
  lastActiveIso: string
  isCurrent?: boolean
}

export interface OfflineQueuedMessage {
  clientMsgId: string
  threadId: string
  enclave: string
  text: string
  senderName: string
  senderEmail?: string
  senderAvatar?: string
  senderRole?: string
  recipientName: string
  recipientEmail?: string
  recipientSubtitle?: string
  recipientAvatar?: string
  channelType: string
  queuedAtIso: string
}

const PRIVACY_STORAGE_KEY = "connectln_comm_pro_v1"
const DEVICES_STORAGE_KEY = "connectln_comm_devices_v1"
const OFFLINE_QUEUE_KEY = "connectln_comm_offline_queue_v1"
export const COMM_PRO_CHANGED_EVENT = "connectln:comm-pro-changed"

const DEFAULT_PRIVACY_SETTINGS: CommPrivacySettings = {
  hideLastSeen: false,
  readReceiptsEnabled: true,
  silenceUnknownCallers: false,
  blockedKeys: [],
  reportedKeys: [],
  lockedThreadPins: {},
  disappearingByThread: {},
  pinnedMsgByThread: {},
  deletedForMeIds: [],
  viewedOnceIds: [],
  pollVotesByMsgId: {},
}

export function normalizeCommKey(val?: string): string {
  return String(val || "")
    .toLowerCase()
    .replace(/[^a-z0-9+@._-]/g, "")
    .trim()
}

function emitCommProChanged() {
  if (typeof window === "undefined") return
  try {
    window.dispatchEvent(new CustomEvent(COMM_PRO_CHANGED_EVENT))
  } catch {}
}

export function getCommPrivacySettings(): CommPrivacySettings {
  if (typeof window === "undefined") return { ...DEFAULT_PRIVACY_SETTINGS }
  try {
    const raw = window.localStorage.getItem(PRIVACY_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PRIVACY_SETTINGS }
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_PRIVACY_SETTINGS,
      ...parsed,
      blockedKeys: Array.isArray(parsed?.blockedKeys) ? parsed.blockedKeys : [],
      reportedKeys: Array.isArray(parsed?.reportedKeys) ? parsed.reportedKeys : [],
      lockedThreadPins:
        parsed?.lockedThreadPins && typeof parsed.lockedThreadPins === "object"
          ? parsed.lockedThreadPins
          : {},
      disappearingByThread:
        parsed?.disappearingByThread && typeof parsed.disappearingByThread === "object"
          ? parsed.disappearingByThread
          : {},
      pinnedMsgByThread:
        parsed?.pinnedMsgByThread && typeof parsed.pinnedMsgByThread === "object"
          ? parsed.pinnedMsgByThread
          : {},
      deletedForMeIds: Array.isArray(parsed?.deletedForMeIds) ? parsed.deletedForMeIds : [],
      viewedOnceIds: Array.isArray(parsed?.viewedOnceIds) ? parsed.viewedOnceIds : [],
      pollVotesByMsgId:
        parsed?.pollVotesByMsgId && typeof parsed.pollVotesByMsgId === "object"
          ? parsed.pollVotesByMsgId
          : {},
    }
  } catch {
    return { ...DEFAULT_PRIVACY_SETTINGS }
  }
}

export function updateCommPrivacySettings(
  patch:
    | Partial<CommPrivacySettings>
    | ((prev: CommPrivacySettings) => CommPrivacySettings)
): CommPrivacySettings {
  const prev = getCommPrivacySettings()
  const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }
  emitCommProChanged()
  return next
}

export function isContactBlocked(nameOrPhone?: string): boolean {
  const k = normalizeCommKey(nameOrPhone)
  if (!k) return false
  const s = getCommPrivacySettings()
  return s.blockedKeys.some((b) => b === k || (b.length >= 5 && k.includes(b)) || (k.length >= 5 && b.includes(k)))
}

export function toggleBlockContact(keyRaw: string): boolean {
  const k = normalizeCommKey(keyRaw)
  if (!k) return false
  let nowBlocked = false
  updateCommPrivacySettings((prev) => {
    const exists = prev.blockedKeys.includes(k)
    nowBlocked = !exists
    return {
      ...prev,
      blockedKeys: exists
        ? prev.blockedKeys.filter((x) => x !== k)
        : Array.from(new Set([...prev.blockedKeys, k])),
    }
  })
  return nowBlocked
}

export function reportContact(keyRaw: string): CommPrivacySettings {
  const k = normalizeCommKey(keyRaw)
  if (!k) return getCommPrivacySettings()
  return updateCommPrivacySettings((prev) => ({
    ...prev,
    reportedKeys: Array.from(new Set([...prev.reportedKeys, k])),
  }))
}

const DURATION_MS_MAP: Record<Exclude<DisappearingDuration, "off">, number> = {
  "24h": 24 * 3600 * 1000,
  "7d": 7 * 24 * 3600 * 1000,
  "90d": 90 * 24 * 3600 * 1000,
}

export function isMessageExpiredForThread(threadId: string, createdAtIso?: string): boolean {
  if (!threadId || !createdAtIso) return false
  const s = getCommPrivacySettings()
  const dur = s.disappearingByThread[threadId]
  if (!dur || dur === "off") return false
  const ts = Date.parse(createdAtIso)
  if (Number.isNaN(ts)) return false
  return Date.now() - ts > DURATION_MS_MAP[dur]
}

export function togglePollVote(
  msgId: string,
  optionIdx: number,
  voterName: string
): CommPrivacySettings {
  const voter = (voterName || "You").trim()
  const optKey = String(optionIdx)
  return updateCommPrivacySettings((prev) => {
    const msgVotes = { ...(prev.pollVotesByMsgId[msgId] || {}) }
    const currentList = Array.isArray(msgVotes[optKey]) ? msgVotes[optKey] : []
    const alreadyVotedThis = currentList.includes(voter)
    // Single-choice clean toggle across options
    for (const k of Object.keys(msgVotes)) {
      msgVotes[k] = (msgVotes[k] || []).filter((v) => v !== voter)
    }
    if (!alreadyVotedThis) {
      msgVotes[optKey] = [...(msgVotes[optKey] || []), voter]
    }
    return {
      ...prev,
      pollVotesByMsgId: {
        ...prev.pollVotesByMsgId,
        [msgId]: msgVotes,
      },
    }
  })
}

export function markViewOnceOpened(msgId: string): CommPrivacySettings {
  return updateCommPrivacySettings((prev) => ({
    ...prev,
    viewedOnceIds: Array.from(new Set([...prev.viewedOnceIds, msgId])),
  }))
}

export function getLinkedDevices(): LinkedDeviceSession[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(DEVICES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
  const platformLabel = /Edg/i.test(ua)
    ? "Edge Desktop"
    : /Chrome/i.test(ua)
    ? "Chrome Desktop"
    : /Safari/i.test(ua)
    ? "Safari"
    : "Web Browser"
  const seeded: LinkedDeviceSession[] = [
    {
      id: "dev_current_web",
      name: `This ${platformLabel} Session`,
      platform: "ConnectLn Web · E2EE Verified",
      location: "Active Now",
      lastActiveIso: new Date().toISOString(),
      isCurrent: true,
    },
  ]
  try {
    window.localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(seeded))
  } catch {}
  return seeded
}

export function linkNewDevice(name: string, platform = "Companion Device"): LinkedDeviceSession[] {
  const existing = getLinkedDevices()
  const next: LinkedDeviceSession[] = [
    ...existing,
    {
      id: `dev_${Date.now()}`,
      name: name.trim() || `ConnectLn Companion #${existing.length + 1}`,
      platform,
      location: "Paired via QR Safety Token",
      lastActiveIso: new Date().toISOString(),
      isCurrent: false,
    },
  ]
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }
  emitCommProChanged()
  return next
}

export function revokeLinkedDevice(deviceId: string): LinkedDeviceSession[] {
  const next = getLinkedDevices().filter((d) => d.id !== deviceId || d.isCurrent)
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }
  emitCommProChanged()
  return next
}

export function getOfflineQueue(): OfflineQueuedMessage[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function enqueueOfflineMessage(msg: OfflineQueuedMessage): OfflineQueuedMessage[] {
  const prev = getOfflineQueue()
  if (prev.some((x) => x.clientMsgId === msg.clientMsgId)) return prev
  const next = [...prev, msg]
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(next))
    } catch {}
  }
  emitCommProChanged()
  return next
}

export function removeOfflineMessage(clientMsgId: string): OfflineQueuedMessage[] {
  const next = getOfflineQueue().filter((x) => x.clientMsgId !== clientMsgId)
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(next))
    } catch {}
  }
  emitCommProChanged()
  return next
}

// ============================================================================
// Structured Backwards-Compatible Rich Message Markers
// ============================================================================

function cleanMarkerField(s: string, maxLen = 140): string {
  return String(s || "")
    .replace(/[\r\n|[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen)
}

export function encodeQuoteReply(sender: string, snippet: string, body: string): string {
  const cleanSender = cleanMarkerField(sender || "Member", 60)
  const cleanSnippet = cleanMarkerField(snippet || "", 120)
  return `[[REPLY|${cleanSender}|${cleanSnippet}]]\n${body}`
}

export function encodePollMarker(question: string, options: string[]): string {
  const q = cleanMarkerField(question, 160)
  const opts = options.map((o) => cleanMarkerField(o, 80)).filter(Boolean).slice(0, 4)
  return `[[POLL|${q}|${opts.join("|")}]]`
}

export function encodeLocationMarker(lat: number, lng: number, label: string): string {
  const cleanLabel = cleanMarkerField(label || "Pinned Location", 120)
  return `[[LOC|${lat.toFixed(5)}|${lng.toFixed(5)}|${cleanLabel}]]`
}

export function encodeContactMarker(name: string, role: string, email?: string): string {
  return `[[CONTACT|${cleanMarkerField(name, 80)}|${cleanMarkerField(role || "ConnectLn Member", 100)}|${cleanMarkerField(email || "", 100)}]]`
}

export function encodeViewOnceMarker(label: string, mediaDataUrl: string): string {
  const cleanLabel = cleanMarkerField(label || "Confidential Media", 90)
  const safeUrl = String(mediaDataUrl || "").replace(/\]\]/g, "")
  return `[[VIEWONCE|${cleanLabel}|${safeUrl}]]`
}

export function encodeVoiceNoteMarker(
  durationSec: number,
  transcript: string,
  audioDataUrl?: string
): string {
  const dur = Math.max(1, Math.round(durationSec || 1))
  const cleanTr = cleanMarkerField(transcript || "Voice message", 240)
  const safeUrl = String(audioDataUrl || "").replace(/\]\]/g, "")
  return `[[VOICE|${dur}|${cleanTr}|${safeUrl}]]`
}

export function encodeVideoNoteMarker(
  durationSec: number,
  caption: string,
  videoDataUrl?: string
): string {
  const dur = Math.max(1, Math.round(durationSec || 1))
  const cleanCap = cleanMarkerField(caption || "Video note", 180)
  const safeUrl = String(videoDataUrl || "").replace(/\]\]/g, "")
  return `[[VIDEONOTE|${dur}|${cleanCap}|${safeUrl}]]`
}

export interface ParsedRichMessage {
  reply?: { sender: string; snippet: string }
  poll?: { question: string; options: string[] }
  location?: { lat: string; lng: string; label: string }
  contact?: { name: string; role: string; email?: string }
  viewOnce?: { label: string; dataUrl: string }
  voice?: { durationSec: number; transcript: string; dataUrl?: string }
  videoNote?: { durationSec: number; caption: string; dataUrl?: string }
  bodyText: string
}

export function parseRichMessage(rawText: string): ParsedRichMessage {
  let remaining = String(rawText || "")
  const out: ParsedRichMessage = { bodyText: remaining }

  const replyMatch = /^\[\[REPLY\|([^|\]]*)\|([^|\]]*)\]\]\s*\n?/.exec(remaining)
  if (replyMatch) {
    out.reply = {
      sender: replyMatch[1].trim() || "Member",
      snippet: replyMatch[2].trim(),
    }
    remaining = remaining.slice(replyMatch[0].length)
  }

  const trimmed = remaining.trim()

  const pollMatch = /^\[\[POLL\|([^\]]+)\]\]$/.exec(trimmed)
  if (pollMatch) {
    const parts = pollMatch[1].split("|").map((p) => p.trim()).filter(Boolean)
    if (parts.length >= 3) {
      out.poll = { question: parts[0], options: parts.slice(1) }
      out.bodyText = ""
      return out
    }
  }

  const locMatch = /^\[\[LOC\|([^|\]]+)\|([^|\]]+)\|([^\]]*)\]\]$/.exec(trimmed)
  if (locMatch) {
    out.location = { lat: locMatch[1], lng: locMatch[2], label: locMatch[3] || "Shared Location" }
    out.bodyText = ""
    return out
  }

  const contactMatch = /^\[\[CONTACT\|([^|\]]+)\|([^|\]]*)\|([^\]]*)\]\]$/.exec(trimmed)
  if (contactMatch) {
    out.contact = {
      name: contactMatch[1],
      role: contactMatch[2] || "Verified ConnectLn Member",
      email: contactMatch[3] || undefined,
    }
    out.bodyText = ""
    return out
  }

  const voMatch = /^\[\[VIEWONCE\|([^|\]]*)\|([\s\S]*)\]\]$/.exec(trimmed)
  if (voMatch) {
    out.viewOnce = {
      label: voMatch[1] || "View-Once Media",
      dataUrl: voMatch[2] || "",
    }
    out.bodyText = ""
    return out
  }

  const voiceMatch = /^\[\[VOICE\|(\d+)\|([^|\]]*)\|([\s\S]*)\]\]$/.exec(trimmed)
  if (voiceMatch) {
    out.voice = {
      durationSec: Number(voiceMatch[1]) || 1,
      transcript: voiceMatch[2] || "",
      dataUrl: voiceMatch[3] || undefined,
    }
    out.bodyText = ""
    return out
  }

  const videoMatch = /^\[\[VIDEONOTE\|(\d+)\|([^|\]]*)\|([\s\S]*)\]\]$/.exec(trimmed)
  if (videoMatch) {
    out.videoNote = {
      durationSec: Number(videoMatch[1]) || 1,
      caption: videoMatch[2] || "",
      dataUrl: videoMatch[3] || undefined,
    }
    out.bodyText = ""
    return out
  }

  out.bodyText = remaining
  return out
}

// ============================================================================
// Consent-First Noctis AI Helpers & E2EE Safety Fingerprint
// ============================================================================

export function deriveE2eeSafetyCode(seed: string): string {
  const input = String(seed || "connectln-e2ee")
  let h1 = 0x811c9dc5
  let h2 = 0x9e3779b9
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 0x01000193) >>> 0
    h2 = Math.imul(h2 ^ (ch + i), 0x85ebca6b) >>> 0
  }
  const groups: string[] = []
  for (let g = 0; g < 6; g++) {
    const val = (Math.imul(h1 + g * 7919, 2654435761) ^ (h2 >>> g)) >>> 0
    groups.push(String(val % 100000).padStart(5, "0"))
  }
  return groups.join(" ")
}

export function summarizeThreadWithNoctis(
  messages: Array<{ sender?: { name?: string }; text: string; isDeleted?: boolean }>,
  threadTitle: string
): { summary: string; keyDecisions: string[]; nextSteps: string[] } {
  const active = messages.filter((m) => !m.isDeleted && m.text?.trim())
  if (active.length === 0) {
    return {
      summary: `No active messages in "${threadTitle}" yet.`,
      keyDecisions: [],
      nextSteps: ["Send an opening message to start collaborating."],
    }
  }
  const recent = active.slice(-8)
  const speakers = Array.from(new Set(recent.map((m) => m.sender?.name || "Member")))
  const cleanedTexts = recent.map((m) => {
    const parsed = parseRichMessage(m.text)
    if (parsed.poll) return `Poll: ${parsed.poll.question}`
    if (parsed.location) return `Shared location: ${parsed.location.label}`
    if (parsed.contact) return `Shared contact: ${parsed.contact.name}`
    if (parsed.voice) return `Voice note: ${parsed.voice.transcript}`
    if (parsed.videoNote) return `Video note: ${parsed.videoNote.caption}`
    if (parsed.viewOnce) return `View-once attachment: ${parsed.viewOnce.label}`
    return parsed.bodyText.replace(/\s+/g, " ").trim()
  })

  const keyDecisions = cleanedTexts
    .filter((t) => /\b(approved|confirmed|ready|agreed|scheduled|verified|signed|yes)\b/i.test(t))
    .slice(0, 3)
    .map((t) => t.slice(0, 120))

  const nextSteps = cleanedTexts
    .filter((t) => /\b(please|need|send|review|check|tomorrow|schedule|follow|confirm|\?)\b/i.test(t))
    .slice(0, 3)
    .map((t) => t.slice(0, 120))

  const latest = cleanedTexts[cleanedTexts.length - 1]?.slice(0, 150) || ""
  return {
    summary: `Analyzed ${recent.length} recent message(s) between ${speakers.join(" & ")} in "${threadTitle}". Latest update: "${latest}"`,
    keyDecisions: keyDecisions.length > 0 ? keyDecisions : ["Thread alignment ongoing; no formal sign-off keyword detected yet."],
    nextSteps: nextSteps.length > 0 ? nextSteps : ["Reply or schedule a quick Voice/Video huddle if follow-up is needed."],
  }
}

export function extractActionItemsFromThread(
  messages: Array<{ sender?: { name?: string }; text: string; isDeleted?: boolean }>
): string[] {
  const items: string[] = []
  for (const m of messages.slice(-15)) {
    if (m.isDeleted || !m.text?.trim()) continue
    const parsed = parseRichMessage(m.text)
    const body = (parsed.bodyText || parsed.voice?.transcript || "").replace(/\s+/g, " ").trim()
    if (!body) continue
    if (/\b(will|please|need to|send|review|verify|prepare|upload|schedule|deliver|check|set up)\b/i.test(body)) {
      const who = m.sender?.name || "Member"
      items.push(`${who}: ${body.slice(0, 115)}${body.length > 115 ? "..." : ""}`)
    }
  }
  return Array.from(new Set(items)).slice(0, 5)
}

export function scanThreadForScamRisks(
  messages: Array<{ text: string; isDeleted?: boolean }>
): { riskLevel: "low" | "medium" | "high"; findings: string[] } {
  const findings: string[] = []
  let score = 0
  for (const m of messages) {
    if (m.isDeleted || !m.text) continue
    const t = m.text
    if (/\b(otp|verification code|seed phrase|private key|wire transfer|gift card|western union|crypto wallet)\b/i.test(t)) {
      findings.push("Mentions sensitive payment/credential terms (OTP, wire transfer, gift card, or keys).")
      score += 2
    }
    if (/\b(urgent|act immediately|account suspended|verify within 24 hours|click immediately)\b/i.test(t)) {
      findings.push("Uses high-urgency pressure phrasing often associated with phishing.")
      score += 1
    }
    if (/https?:\/\/(?:\d{1,3}\.){3}\d{1,3}|bit\.ly\/|tinyurl\.com\//i.test(t)) {
      findings.push("Contains raw IP or shortened external URL — inspect destination before clicking.")
      score += 1
    }
  }
  const uniqueFindings = Array.from(new Set(findings))
  const riskLevel: "low" | "medium" | "high" = score >= 3 ? "high" : score >= 1 ? "medium" : "low"
  return {
    riskLevel,
    findings:
      uniqueFindings.length > 0
        ? uniqueFindings
        : ["No phishing links, urgent credential harvesting, or high-risk payment indicators detected."],
  }
}

export function polishDraftWithNoctis(
  text: string,
  tone: "executive" | "concise" | "friendly"
): string {
  const trimmed = String(text || "").replace(/\s+/g, " ").trim()
  if (!trimmed) return text
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  const punctuated = /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`
  if (tone === "concise") {
    return punctuated.replace(/\b(just|actually|basically|really|very|kind of|sort of)\s+/gi, "").trim()
  }
  if (tone === "friendly") {
    return `Hi! ${punctuated} Let me know what you think.`
  }
  return `Hello — ${punctuated} Please let me know once you have had a chance to review.`
}
