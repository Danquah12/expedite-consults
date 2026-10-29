"use client"

import { B2BConversationThread, B2BMessageItem } from "./b2b-messaging-data"

const SHARED_DM_STORAGE_KEY = "connectin_shared_bilateral_dms_v1"

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
      // A shared email only counts when the names are also related, so different people
      // who happen to use the same address are never merged into one inbox.
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
        timestamp: "Just now",
        createdAtIso: new Date().toISOString(),
        readBy: ["kwesi asiedu"]
      }
    ],
    updatedAtIso: new Date().toISOString()
  }
}

export function loadLocalBilateralConversations(): Record<string, LocalBilateralConversation> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(SHARED_DM_STORAGE_KEY)
    const parsed: Record<string, LocalBilateralConversation> = raw ? JSON.parse(raw) : {}
    const seed = getDefaultSeedConversation()
    if (!parsed[seed.pairKey]) {
      parsed[seed.pairKey] = seed
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
    const nowLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const nowIso = new Date().toISOString()
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
        timestamp: m.timestamp || "Just now",
        createdAtIso: m.createdAtIso,
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
      lastMessageTime: lastMsg ? lastMsg.timestamp : "Just now",
      messages: orderedMessages
    })
  }

  return results
}

/**
 * Orders messages oldest -> newest (newest at the bottom). Messages without a full timestamp keep their
 * position relative to the dated message that precedes them.
 */
export function sortMessagesChronologically<T extends { createdAtIso?: string }>(msgs: T[]): T[] {
  let last = 0
  const keyed = msgs.map((m, i) => {
    const t = m.createdAtIso ? Date.parse(m.createdAtIso) : NaN
    const k = Number.isFinite(t) ? t : last
    last = k
    return { m, k, i }
  })
  keyed.sort((a, b) => a.k - b.k || a.i - b.i)
  return keyed.map(x => x.m)
}

export function mergeBilateralAndServerThreads(
  localBilateral: B2BConversationThread[],
  serverThreads: B2BConversationThread[]
): B2BConversationThread[] {
  const mergedByPartner = new Map<string, B2BConversationThread>()
  // Same person under slightly different names ("Busy Vito" / "Busyvito") must be ONE thread
  const keyOf = (title: string) => normalizeDmName(title).replace(/[^a-z0-9]/g, "")

  // 1. Add all server threads first (combining duplicates for the same partner instead of overwriting)
  for (const st of serverThreads) {
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
      lastMessageTime: last ? last.timestamp : prev.lastMessageTime
    })
  }

  // 2. Merge local bilateral threads by partner name so both local + cloud messages appear seamlessly
  for (const lt of localBilateral) {
    const normTitle = keyOf(lt.title)
    const existing = mergedByPartner.get(normTitle)
    if (!existing) {
      mergedByPartner.set(normTitle, lt)
      continue
    }

    // Deduplicate messages by text + senderName so optimistic local + cloud synced messages don't duplicate
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
    combinedMsgs.splice(0, combinedMsgs.length, ...sortMessagesChronologically(combinedMsgs))
    const lastMsg = combinedMsgs[combinedMsgs.length - 1]
    mergedByPartner.set(normTitle, {
      ...existing,
      ...lt,
      id: existing.id.startsWith("dm_pair__") ? existing.id : lt.id,
      messages: combinedMsgs,
      lastMessage: lastMsg ? lastMsg.text.replace(/\n/g, " · ") : existing.lastMessage,
      lastMessageTime: lastMsg ? lastMsg.timestamp : existing.lastMessageTime,
      unreadCount: Math.max(lt.unreadCount || 0, existing.unreadCount || 0)
    })
  }

  // Put bilateral threads at the very top
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

  return [...topThreads, ...restThreads]
}
