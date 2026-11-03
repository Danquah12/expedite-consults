"use client"

import { B2BConversationThread, B2BMessageItem } from "./b2b-messaging-data"

const SHARED_DM_STORAGE_KEY = "connectin_shared_bilateral_dms_v1"
export const SEED_PATIENCE_CREATED_AT_ISO = "2026-10-26T14:30:00.000Z"

export interface LocalBilateralMessage {
  id: string
  senderName: string
  senderEmail?: string
  senderAvatar: string
  senderRole: string
  recipientName: string
  recipientEmail?: string
  subject?: string
  text: string
  attachment?: string
  timestamp: string
  createdAtIso: string
  readBy: string[]
}

export interface LocalBilateralConversation {
  pairKey: string
  participantA: {
    name: string
    email?: string
    avatar: string
    headline: string
  }
  participantB: {
    name: string
    email?: string
    avatar: string
    headline: string
  }
  messages: LocalBilateralMessage[]
  updatedAtIso: string
}

export function normalizeDmName(nameOrEmail?: string): string {
  return String(nameOrEmail || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

export function computeClientPairKey(userA: string, userB: string): string {
  const normA = normalizeDmName(userA).replace(/[^a-z0-9]/g, "_") || "user_a"
  const normB = normalizeDmName(userB).replace(/[^a-z0-9]/g, "_") || "user_b"
  const sorted = [normA, normB].sort()
  return `dm_pair__${sorted[0].slice(0, 22)}__${sorted[1].slice(0, 22)}`
}

export function doesDmParticipantMatch(
  candidateName: string,
  viewerName: string,
  candidateEmail?: string,
  viewerEmail?: string
): boolean {
  const cName = normalizeDmName(candidateName)
  const vName = normalizeDmName(viewerName)
  if (cName && vName && cName === vName) return true

  // Same name ignoring spaces/punctuation, e.g. "Busy Vito" vs "Busyvito"
  const cCompact = cName.replace(/[^a-z0-9]/g, "")
  const vCompact = vName.replace(/[^a-z0-9]/g, "")
  if (cCompact.length >= 4 && cCompact === vCompact) return true

  if (candidateEmail && viewerEmail) {
    const cEmail = normalizeDmName(candidateEmail)
    const vEmail = normalizeDmName(viewerEmail)
    if (cEmail && vEmail && cEmail === vEmail) {
      const cTok = cName.split(" ").filter(t => t.length >= 3)
      const vTok = vName.split(" ").filter(t => t.length >= 3)
      if (!cName || !vName || cCompact === vCompact || cTok.some(t => vTok.includes(t))) return true
    }
  }

  const cTokens = cName.split(" ").filter(Boolean)
  const vTokens = vName.split(" ").filter(Boolean)
  if (cTokens.length >= 2 && vTokens.length >= 2) {
    if (cTokens[0] === vTokens[0] && cTokens[cTokens.length - 1] === vTokens[vTokens.length - 1]) {
      return true
    }
  }
  return false
}

/**
 * Resolves the accurate ISO timestamp for a message from its createdAtIso, embedded epoch ID,
 * or date embedded in attachment filenames (such as noctis-report-2026-10-26.doc or Greenshot 2026-10-23).
 */
export function resolveMessageIsoDate(msg: {
  id?: string
  createdAtIso?: string
  timestamp?: string
  text?: string
  attachment?: string
  attachments?: { name: string }[]
}): string | undefined {
  if (!msg) return undefined

  // 1. Canonical seed message to PATIENCE Addo with noctis-report-2026-10-26.doc
  if (
    msg.id === "dm_seed_kwesi_patience_1" ||
    (msg.text && msg.text.includes("noctis-report-2026-10-26.doc") && msg.timestamp === "Just now")
  ) {
    return SEED_PATIENCE_CREATED_AT_ISO
  }

  // 2. Check if message ID has an embedded 13-digit Unix millisecond timestamp
  if (msg.id) {
    const idMatch = msg.id.match(/(?:dm_msg_|local_dm_|dm_reply_|msg-|custom-|mini_msg_|thread-custom-|msg-init-|local-)(\d{13})/)
    if (idMatch) {
      const epochMs = Number(idMatch[1])
      if (Number.isFinite(epochMs) && epochMs > 1700000000000) {
        return new Date(epochMs).toISOString()
      }
    }
  }

  // 3. Valid createdAtIso field
  if (msg.createdAtIso) {
    const parsed = Date.parse(msg.createdAtIso)
    if (Number.isFinite(parsed) && parsed > 1700000000000) {
      return new Date(parsed).toISOString()
    }
  }

  // 4. Date embedded in attachment or text (e.g. "2026-10-23" or "2026-10-26")
  const combinedSource = [
    msg.attachment || "",
    ...(msg.attachments?.map(a => a.name) || []),
    msg.text || ""
  ].join(" ")
  const dateMatch = combinedSource.match(/\b(202\d-\d{2}-\d{2})\b/)
  if (dateMatch) {
    const fallbackIso = `${dateMatch[1]}T12:00:00.000Z`
    const parsed = Date.parse(fallbackIso)
    if (Number.isFinite(parsed)) {
      return new Date(parsed).toISOString()
    }
  }

  return undefined
}

/**
 * Formats a message's date & time so both the calendar date (e.g. "Oct 26, 2026" or "Nov 2, 2026")
 * and the clock time (e.g. "12:09 AM") are always clearly displayed.
 */
export function formatMessageSentDateTime(
  msgOrIso?:
    | string
    | {
        id?: string
        createdAtIso?: string
        timestamp?: string
        text?: string
        attachment?: string
        attachments?: { name: string }[]
      },
  fallbackTimestamp?: string
): string {
  let resolvedIso: string | undefined
  let rawLabel = fallbackTimestamp || ""

  if (typeof msgOrIso === "string") {
    const parsed = Date.parse(msgOrIso)
    if (Number.isFinite(parsed) && parsed > 1700000000000) {
      resolvedIso = new Date(parsed).toISOString()
    } else {
      rawLabel = msgOrIso
    }
  } else if (msgOrIso && typeof msgOrIso === "object") {
    resolvedIso = resolveMessageIsoDate(msgOrIso)
    if (!rawLabel && msgOrIso.timestamp) {
      rawLabel = msgOrIso.timestamp
    }
  }

  if (resolvedIso) {
    const d = new Date(resolvedIso)
    if (!isNaN(d.getTime())) {
      const datePart = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
      // If rawLabel is already an explicit clock time like "12:09 AM" or "11:36 AM", preserve or format local time
      const timePart = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      })
      return `${datePart} · ${timePart}`
    }
  }

  // If rawLabel already includes a month name (e.g. "Oct 26, 2026 · 10:30 AM"), return as-is
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+/i.test(rawLabel.trim())) {
    return rawLabel.trim()
  }

  // Convert relative demo labels ("5m ago", "22m ago", "1h ago", "Yesterday", "2d ago") into real calendar dates
  const now = new Date()
  const trimmed = rawLabel.trim()
  const minMatch = trimmed.match(/^(\d+)\s*m\s*ago$/i)
  if (minMatch) {
    const d = new Date(now.getTime() - Number(minMatch[1]) * 60 * 1000)
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
  }
  const hrMatch = trimmed.match(/^(\d+)\s*h\s*ago$/i)
  if (hrMatch) {
    const d = new Date(now.getTime() - Number(hrMatch[1]) * 3600 * 1000)
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
  }
  const dayMatch = trimmed.match(/^(\d+)\s*d\s*ago$/i)
  if (dayMatch) {
    const d = new Date(now.getTime() - Number(dayMatch[1]) * 86400 * 1000)
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  }
  if (/^yesterday$/i.test(trimmed)) {
    const d = new Date(now.getTime() - 86400 * 1000)
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  }
  if (/^(just now|now)$/i.test(trimmed)) {
    return `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
  }

  // If rawLabel is a bare time like "12:09 AM", prefix with today's date if no other date is known
  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(trimmed)) {
    return `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${trimmed}`
  }

  return trimmed || `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

/**
 * Returns a calendar day header label (e.g., "October 26, 2026" or "Today — November 2, 2026")
 * for grouping messages by date inside the conversation stream.
 */
export function formatMessageDateHeading(msg: {
  id?: string
  createdAtIso?: string
  timestamp?: string
  text?: string
  attachment?: string
  attachments?: { name: string }[]
}): string {
  const iso = resolveMessageIsoDate(msg)
  const d = iso ? new Date(iso) : new Date()
  const validDate = isNaN(d.getTime()) ? new Date() : d

  const now = new Date()
  const isToday =
    validDate.getFullYear() === now.getFullYear() &&
    validDate.getMonth() === now.getMonth() &&
    validDate.getDate() === now.getDate()

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    validDate.getFullYear() === yesterday.getFullYear() &&
    validDate.getMonth() === yesterday.getMonth() &&
    validDate.getDate() === yesterday.getDate()

  const fullDate = validDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric"
  })

  if (isToday) return `Today — ${fullDate}`
  if (isYesterday) return `Yesterday — ${fullDate}`
  return fullDate
}

function getDefaultSeedConversation(): LocalBilateralConversation {
  const pairKey = computeClientPairKey("Kwesi Asiedu", "PATIENCE Addo")
  return {
    pairKey,
    participantA: {
      name: "Kwesi Asiedu",
      email: "kwesi.asiedu@connectin.app",
      avatar: "/brand/kwesi-avatar.png",
      headline: "Principal Cloud & AI Security Architect · ConnectLn Founder"
    },
    participantB: {
      name: "PATIENCE Addo",
      email: "patience.addo@connectin.app",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PATIENCE%20Addo&backgroundColor=0a66c2",
      headline: "Doctor of Veterinary Medicine (DVM) · Small Animal Surgery, Pharmacology & Preventive Care"
    },
    messages: [
      {
        id: "dm_seed_kwesi_patience_1",
        senderName: "Kwesi Asiedu",
        senderEmail: "kwesi.asiedu@connectin.app",
        senderAvatar: "/brand/kwesi-avatar.png",
        senderRole: "Principal Cloud & AI Security Architect · ConnectLn Founder",
        recipientName: "PATIENCE Addo",
        subject: "neeed you for a job",
        text: "Subject: neeed you for a job\nneed to connect with you for a job\n📎 Attached: noctis-report-2026-10-26.doc",
        attachment: "noctis-report-2026-10-26.doc",
        timestamp: "Oct 26, 2026 · 10:30 AM",
        createdAtIso: SEED_PATIENCE_CREATED_AT_ISO,
        readBy: ["kwesi asiedu"]
      }
    ],
    updatedAtIso: SEED_PATIENCE_CREATED_AT_ISO
  }
}

export function loadLocalBilateralConversations(): Record<string, LocalBilateralConversation> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(SHARED_DM_STORAGE_KEY)
    const parsed: Record<string, LocalBilateralConversation> = raw ? JSON.parse(raw) : {}
    const seed = getDefaultSeedConversation()
    let mutated = false

    if (!parsed[seed.pairKey]) {
      parsed[seed.pairKey] = seed
      mutated = true
    } else {
      // Normalize any legacy cached seed message that had "Just now" or today's date back to Oct 26, 2026
      const existingConvo = parsed[seed.pairKey]
      if (existingConvo && Array.isArray(existingConvo.messages)) {
        existingConvo.messages = existingConvo.messages.map(m => {
          if (m.id === "dm_seed_kwesi_patience_1") {
            mutated = true
            return {
              ...m,
              createdAtIso: SEED_PATIENCE_CREATED_AT_ISO,
              timestamp: formatMessageSentDateTime({
                ...m,
                id: "dm_seed_kwesi_patience_1",
                createdAtIso: SEED_PATIENCE_CREATED_AT_ISO
              })
            }
          }
          return m
        })
        const lastIso =
          existingConvo.messages[existingConvo.messages.length - 1]?.createdAtIso ||
          SEED_PATIENCE_CREATED_AT_ISO
        if (existingConvo.updatedAtIso !== lastIso) {
          existingConvo.updatedAtIso = lastIso
          mutated = true
        }
      }
    }

    if (mutated) {
      localStorage.setItem(SHARED_DM_STORAGE_KEY, JSON.stringify(parsed))
    }
    return parsed
  } catch {
    const seed = getDefaultSeedConversation()
    return { [seed.pairKey]: seed }
  }
}

export function recordLocalBilateralDirectMessage(params: {
  senderName: string
  senderEmail?: string
  senderAvatar: string
  senderRole: string
  recipientName: string
  recipientEmail?: string
  recipientAvatar?: string
  recipientSubtitle?: string
  subject?: string
  text: string
  attachment?: string
}): LocalBilateralConversation | null {
  if (typeof window === "undefined") return null
  try {
    const store = loadLocalBilateralConversations()
    const pairKey = computeClientPairKey(params.senderName, params.recipientName)
    const nowIso = new Date().toISOString()
    const nowLabel = formatMessageSentDateTime(nowIso)
    const senderNorm = normalizeDmName(params.senderName)

    const newMsg: LocalBilateralMessage = {
      id: `local_dm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderName: params.senderName,
      senderEmail: params.senderEmail,
      senderAvatar: params.senderAvatar || "/brand/kwesi-avatar.png",
      senderRole: params.senderRole || "Verified ConnectLn Professional",
      recipientName: params.recipientName,
      recipientEmail: params.recipientEmail,
      subject: params.subject,
      text: params.text,
      attachment: params.attachment,
      timestamp: nowLabel,
      createdAtIso: nowIso,
      readBy: [senderNorm]
    }

    const existing = store[pairKey]
    const updated: LocalBilateralConversation = existing
      ? {
          ...existing,
          messages: [...existing.messages, newMsg],
          updatedAtIso: nowIso
        }
      : {
          pairKey,
          participantA: {
            name: params.senderName,
            email: params.senderEmail,
            avatar: params.senderAvatar || "/brand/kwesi-avatar.png",
            headline: params.senderRole || "Verified ConnectLn Professional"
          },
          participantB: {
            name: params.recipientName,
            email: params.recipientEmail,
            avatar:
              params.recipientAvatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.recipientName)}&backgroundColor=0a66c2`,
            headline:
              params.recipientSubtitle ||
              "Verified ConnectLn Professional · Direct Member Channel"
          },
          messages: [newMsg],
          updatedAtIso: nowIso
        }

    store[pairKey] = updated
    localStorage.setItem(SHARED_DM_STORAGE_KEY, JSON.stringify(store))
    window.dispatchEvent(new CustomEvent("connectin_dm_updated"))
    return updated
  } catch {
    return null
  }
}

export function markLocalBilateralConversationRead(partnerNameOrPairKey: string, viewerName: string) {
  if (typeof window === "undefined" || !viewerName) return
  try {
    const store = loadLocalBilateralConversations()
    const viewerNorm = normalizeDmName(viewerName)
    let changed = false

    for (const key of Object.keys(store)) {
      const convo = store[key]
      const matchesKey = key === partnerNameOrPairKey
      const matchesPartner =
        doesDmParticipantMatch(convo.participantA.name, partnerNameOrPairKey) ||
        doesDmParticipantMatch(convo.participantB.name, partnerNameOrPairKey)

      if (matchesKey || matchesPartner) {
        convo.messages = convo.messages.map(m => {
          if (m.readBy.includes(viewerNorm)) return m
          changed = true
          return { ...m, readBy: [...m.readBy, viewerNorm] }
        })
      }
    }

    if (changed) {
      localStorage.setItem(SHARED_DM_STORAGE_KEY, JSON.stringify(store))
      window.dispatchEvent(new CustomEvent("connectin_dm_updated"))
    }
  } catch {}
}

export function getLocalBilateralThreadsForViewer(
  viewerName?: string,
  viewerEmail?: string,
  enclave = "trades_construction"
): B2BConversationThread[] {
  if (!viewerName && !viewerEmail) return []
  const store = loadLocalBilateralConversations()
  const viewerNorm = normalizeDmName(viewerName || viewerEmail)
  const results: B2BConversationThread[] = []

  const allConvos = Object.values(store).sort((a, b) =>
    (b.updatedAtIso || "").localeCompare(a.updatedAtIso || "")
  )

  for (const convo of allConvos) {
    const isA = doesDmParticipantMatch(
      convo.participantA.name,
      viewerName || "",
      convo.participantA.email,
      viewerEmail
    )
    const isB = doesDmParticipantMatch(
      convo.participantB.name,
      viewerName || "",
      convo.participantB.email,
      viewerEmail
    )
    if (!isA && !isB) continue

    const partner = isA ? convo.participantB : convo.participantA

    const mappedMessages: B2BMessageItem[] = (convo.messages || []).map(m => {
      const sentByViewer = doesDmParticipantMatch(
        m.senderName,
        viewerName || "",
        m.senderEmail,
        viewerEmail
      )
      const resolvedIso = resolveMessageIsoDate(m) || m.createdAtIso
      const formattedTime = formatMessageSentDateTime(
        { ...m, createdAtIso: resolvedIso },
        m.timestamp
      )
      return {
        id: m.id,
        sender: {
          id: sentByViewer ? "me" : `partner_${normalizeDmName(m.senderName).replace(/\s+/g, "_")}`,
          name: m.senderName,
          avatar:
            m.senderAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.senderName)}&backgroundColor=0a66c2`,
          role: m.senderRole || "Verified ConnectLn Member",
          isVerified: true
        },
        text: m.text,
        timestamp: formattedTime,
        createdAtIso: resolvedIso,
        attachments: m.attachment ? [{ name: m.attachment, type: "Document" }] : undefined
      }
    })
    const orderedMessages = sortMessagesChronologically(mappedMessages)

    const unreadCount = (convo.messages || []).filter(m => {
      const sentByViewer = doesDmParticipantMatch(
        m.senderName,
        viewerName || "",
        m.senderEmail,
        viewerEmail
      )
      if (sentByViewer) return false
      return !(m.readBy || []).map(r => normalizeDmName(r)).includes(viewerNorm)
    }).length

    const lastMsg = orderedMessages[orderedMessages.length - 1]

    results.push({
      id: convo.pairKey,
      professionEnclave: enclave,
      channelType: "People",
      subType: "DM",
      title: partner.name,
      subtitle: partner.headline || "Verified ConnectLn Professional · Direct Member Channel",
      avatar:
        partner.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner.name)}&backgroundColor=0a66c2`,
      isVerified: true,
      verifiedBadge: "✓ Direct Member Message",
      onlineStatus: "online",
      unreadCount,
      lastMessage: lastMsg ? lastMsg.text.replace(/\n/g, " · ") : "New conversation",
      lastMessageTime: lastMsg
        ? formatMessageSentDateTime(lastMsg, lastMsg.timestamp)
        : formatMessageSentDateTime(convo.updatedAtIso),
      messages: orderedMessages
    })
  }

  return results
}

/**
 * Orders messages oldest -> newest (newest at the bottom). Messages without a full timestamp keep their
 * position relative to the dated message that precedes them.
 */
export function sortMessagesChronologically<
  T extends {
    id?: string
    createdAtIso?: string
    timestamp?: string
    text?: string
    attachment?: string
    attachments?: { name: string }[]
  }
>(msgs: T[]): T[] {
  let last = 0
  const keyed = msgs.map((m, i) => {
    const resolvedIso = resolveMessageIsoDate(m) || m.createdAtIso
    const t = resolvedIso ? Date.parse(resolvedIso) : NaN
    const k = Number.isFinite(t) ? t : last
    last = k
    return { m, k, i }
  })
  keyed.sort((a, b) => a.k - b.k || a.i - b.i)
  return keyed.map(x => x.m)
}

function getThreadNewestTimestampMs(thread: B2BConversationThread): number {
  const msgs = thread.messages || []
  for (let i = msgs.length - 1; i >= 0; i--) {
    const iso = resolveMessageIsoDate(msgs[i]) || msgs[i].createdAtIso
    if (iso) {
      const parsed = Date.parse(iso)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return 0
}

export function mergeBilateralAndServerThreads(
  localBilateral: B2BConversationThread[],
  serverThreads: B2BConversationThread[]
): B2BConversationThread[] {
  const mergedByPartner = new Map<string, B2BConversationThread>()
  const keyOf = (title: string) => normalizeDmName(title).replace(/[^a-z0-9]/g, "")

  const normalizeThreadDates = (thread: B2BConversationThread): B2BConversationThread => {
    const normalizedMsgs = sortMessagesChronologically(
      (thread.messages || []).map(m => {
        const resolvedIso = resolveMessageIsoDate(m) || m.createdAtIso
        return {
          ...m,
          createdAtIso: resolvedIso,
          timestamp: formatMessageSentDateTime({ ...m, createdAtIso: resolvedIso }, m.timestamp)
        }
      })
    )
    const last = normalizedMsgs[normalizedMsgs.length - 1]
    return {
      ...thread,
      messages: normalizedMsgs,
      lastMessageTime: last
        ? formatMessageSentDateTime(last, last.timestamp)
        : formatMessageSentDateTime(undefined, thread.lastMessageTime)
    }
  }

  // 1. Add all server threads first (combining duplicates for the same partner)
  for (const rawSt of serverThreads) {
    const st = normalizeThreadDates(rawSt)
    const normTitle = keyOf(st.title)
    const prev = mergedByPartner.get(normTitle || st.id)
    if (!prev) {
      mergedByPartner.set(normTitle || st.id, st)
      continue
    }
    const seen = new Set<string>()
    const msgs = sortMessagesChronologically(
      [...prev.messages, ...st.messages].filter(m => (seen.has(m.id) ? false : (seen.add(m.id), true)))
    )
    const last = msgs[msgs.length - 1]
    mergedByPartner.set(normTitle || st.id, {
      ...prev,
      messages: msgs,
      unreadCount: (prev.unreadCount || 0) + (st.unreadCount || 0),
      lastMessage: last ? last.text.replace(/\n/g, " · ") : prev.lastMessage,
      lastMessageTime: last ? formatMessageSentDateTime(last, last.timestamp) : prev.lastMessageTime
    })
  }

  // 2. Merge local bilateral threads by partner name so both local + cloud messages appear seamlessly
  for (const rawLt of localBilateral) {
    const lt = normalizeThreadDates(rawLt)
    const normTitle = keyOf(lt.title)
    const existing = mergedByPartner.get(normTitle)
    if (!existing) {
      mergedByPartner.set(normTitle, lt)
      continue
    }

    const combinedMsgs: B2BMessageItem[] = [...existing.messages]
    for (const lm of lt.messages) {
      const alreadyExists = combinedMsgs.some(
        em =>
          em.id === lm.id ||
          (em.text.trim() === lm.text.trim() &&
            normalizeDmName(em.sender.name) === normalizeDmName(lm.sender.name))
      )
      if (!alreadyExists) {
        combinedMsgs.push(lm)
      }
    }
    const sortedMsgs = sortMessagesChronologically(combinedMsgs)
    const lastMsg = sortedMsgs[sortedMsgs.length - 1]
    mergedByPartner.set(normTitle, {
      ...existing,
      ...lt,
      id: existing.id.startsWith("dm_pair__") ? existing.id : lt.id,
      messages: sortedMsgs,
      lastMessage: lastMsg ? lastMsg.text.replace(/\n/g, " · ") : existing.lastMessage,
      lastMessageTime: lastMsg ? formatMessageSentDateTime(lastMsg, lastMsg.timestamp) : existing.lastMessageTime,
      unreadCount: Math.max(lt.unreadCount || 0, existing.unreadCount || 0)
    })
  }

  // Sort bilateral member conversations newest-first by their actual message date
  const localPartnerNames = new Set(localBilateral.map(t => keyOf(t.title)))
  const topThreads: B2BConversationThread[] = []
  const restThreads: B2BConversationThread[] = []

  for (const [key, thread] of mergedByPartner.entries()) {
    if (localPartnerNames.has(key) || thread.id.startsWith("dm_pair__")) {
      topThreads.push(thread)
    } else {
      restThreads.push(thread)
    }
  }

  topThreads.sort((a, b) => getThreadNewestTimestampMs(b) - getThreadNewestTimestampMs(a))

  return [...topThreads, ...restThreads]
}
