import { NextRequest, NextResponse } from "next/server"
import { sendConnectInInviteSMS, sendConnectInInviteVoiceCall, formatE164Phone } from "@/lib/connectin-sms"
import { sendConnectInInviteEmail } from "@/lib/connectin-email"
import { recordGlobalUserActivity } from "@/lib/connectin-cloud-sync"

export interface StoredInviteRecord {
  cid: string
  recipientName: string
  recipientEmail?: string
  recipientPhone?: string
  recipientHeadline?: string
  recipientAvatar?: string
  senderName: string
  senderEmail?: string
  senderHeadline?: string
  senderAvatar?: string
  customNote?: string
  channel?: "sms" | "email" | "call" | "link" | "member_connect"
  status?: "pending" | "accepted" | "ignored" | "withdrawn"
  createdAt: number
}

const SYNC_INVITES_MAP = "connectin_invitations_map_v1"
const SYNC_BACKUP_MAP = "connectin_activity_logs_map_v1"

const globalForInvites = globalThis as unknown as {
  __connectlnInviteRecords?: Map<string, StoredInviteRecord>
}

function getInviteStore(): Map<string, StoredInviteRecord> {
  if (!globalForInvites.__connectlnInviteRecords) {
    globalForInvites.__connectlnInviteRecords = new Map<string, StoredInviteRecord>()
  }
  return globalForInvites.__connectlnInviteRecords
}

function getTwilioAuthHeader(): string | null {
  const sid = process.env.TWILIO_ACCOUNT_SID || ""
  const token = process.env.TWILIO_AUTH_TOKEN || ""
  if (!sid || !token) return null
  return `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`
}

function sanitizeCompactAvatar(rawAvatar?: string, fallbackName?: string): string {
  const name = (fallbackName || "Member").trim()
  const isKwesi = name.toLowerCase().includes("kwesi asiedu")
  if (!rawAvatar || (rawAvatar.startsWith("data:") && rawAvatar.length > 1500)) {
    return isKwesi
      ? "/brand/kwesi-avatar.png"
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0a66c2`
  }
  return rawAvatar
}

function sanitizeInviteRecord(rec: StoredInviteRecord): StoredInviteRecord {
  const cleanCid = String(rec.cid || `cin_${Date.now().toString(36)}`).replace(/^(inv_|out_)/, "").trim()
  return {
    ...rec,
    cid: cleanCid,
    recipientName: String(rec.recipientName || "").trim().slice(0, 120),
    recipientHeadline: rec.recipientHeadline ? String(rec.recipientHeadline).slice(0, 160) : undefined,
    recipientAvatar: sanitizeCompactAvatar(rec.recipientAvatar, rec.recipientName),
    senderName: String(rec.senderName || "Member").trim().slice(0, 120),
    senderHeadline: rec.senderHeadline ? String(rec.senderHeadline).slice(0, 160) : undefined,
    senderAvatar: sanitizeCompactAvatar(rec.senderAvatar, rec.senderName),
    customNote: rec.customNote ? String(rec.customNote).slice(0, 280) : undefined
  }
}

async function upsertMapItemInTwilio(mapName: string, key: string, dataObj: any): Promise<boolean> {
  const auth = getTwilioAuthHeader()
  if (!auth) return false
  try {
    const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${mapName}`
    const serialized = JSON.stringify(dataObj)
    const updateRes = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ Data: serialized }).toString()
    })
    if (updateRes.ok) return true
    if (updateRes.status === 404) {
      await fetch("https://sync.twilio.com/v1/Services/default/Maps", {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ UniqueName: mapName }).toString()
      }).catch(() => {})
      const createRes = await fetch(`${baseUrl}/Items`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ Key: key, Data: serialized }).toString()
      })
      return createRes.ok
    }
    return false
  } catch {
    return false
  }
}

async function pullCloudInvites(): Promise<StoredInviteRecord[]> {
  const auth = getTwilioAuthHeader()
  if (!auth) return []
  const recordsMap = new Map<string, StoredInviteRecord>()

  const collectFromMap = async (mapName: string) => {
    try {
      const res = await fetch(
        `https://sync.twilio.com/v1/Services/default/Maps/${mapName}/Items?PageSize=100`,
        {
          method: "GET",
          headers: { Authorization: auth },
          cache: "no-store"
        }
      )
      if (!res.ok) return
      const json = await res.json()
      const rawItems = Array.isArray(json?.items) ? json.items : []
      for (const entry of rawItems) {
        const d = entry?.data
        if (!d) continue
        if (Array.isArray(d.items)) {
          for (const sub of d.items) {
            if (sub && sub.cid && sub.senderName) {
              recordsMap.set(sub.cid, sub as StoredInviteRecord)
            }
          }
        } else if (d.cid && d.senderName && (d.recipientName || d.recipientEmail || d.recipientPhone)) {
          recordsMap.set(d.cid, d as StoredInviteRecord)
        }
      }
    } catch {
      // ignore
    }
  }

  await Promise.all([
    collectFromMap(SYNC_INVITES_MAP),
    collectFromMap(SYNC_BACKUP_MAP)
  ])

  return Array.from(recordsMap.values())
}

async function syncAndSaveInviteRecord(rawRecord: StoredInviteRecord): Promise<StoredInviteRecord[]> {
  const record = sanitizeInviteRecord(rawRecord)
  const store = getInviteStore()

  // Prevent duplicate pending records for the same sender -> recipient pair
  const sNorm = record.senderName.toLowerCase().trim()
  const rNorm = record.recipientName.toLowerCase().trim()
  let existingCidToReuse: string | null = null
  for (const [k, existing] of store.entries()) {
    if (
      existing.senderName.toLowerCase().trim() === sNorm &&
      existing.recipientName.toLowerCase().trim() === rNorm &&
      existing.status === "pending"
    ) {
      existingCidToReuse = k
      break
    }
  }
  const finalCid = existingCidToReuse || record.cid
  const finalRecord: StoredInviteRecord = { ...record, cid: finalCid }
  store.set(finalCid, finalRecord)

  const itemKey = `inv_${finalCid.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48)}`
  await Promise.all([
    upsertMapItemInTwilio(SYNC_INVITES_MAP, itemKey, finalRecord),
    upsertMapItemInTwilio(SYNC_BACKUP_MAP, itemKey, finalRecord)
  ])

  return Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt)
}

function doesInviteMatchUser(
  targetName?: string,
  targetEmail?: string,
  targetPhone?: string,
  queryName?: string,
  queryEmail?: string,
  queryPhone?: string
): boolean {
  const tName = (targetName || "").toLowerCase().trim()
  const tEmail = (targetEmail || "").toLowerCase().trim()
  const tPhone = (targetPhone || "").replace(/[^\d]/g, "").slice(-10)

  const qName = (queryName || "").toLowerCase().trim()
  const qEmail = (queryEmail || "").toLowerCase().trim()
  const qPhone = (queryPhone || "").replace(/[^\d]/g, "").slice(-10)

  if (qEmail && tEmail && qEmail === tEmail) return true
  if (qPhone && qPhone.length === 10 && tPhone && qPhone === tPhone) return true
  if (qName && tName) {
    if (qName === tName) return true
    const qCompact = qName.replace(/[^a-z0-9]/g, "")
    const tCompact = tName.replace(/[^a-z0-9]/g, "")
    if (qCompact.length >= 3 && qCompact === tCompact) return true
    // Also match if one is a single-word handle/first-name >= 4 chars that matches the first token of the other
    const qTokens = qName.split(/\s+/).filter(Boolean)
    const tTokens = tName.split(/\s+/).filter(Boolean)
    if (qTokens.length === 1 && qTokens[0].length >= 4 && tTokens[0] === qTokens[0]) return true
    if (tTokens.length === 1 && tTokens[0].length >= 4 && qTokens[0] === tTokens[0]) return true
  }
  // Match email prefix with name (e.g. "yaaldg@gmail.com" <-> "Yaaldg")
  if (qEmail && tName) {
    const qLocal = qEmail.split("@")[0].replace(/[^a-z0-9]/g, "")
    const tCompact = tName.replace(/[^a-z0-9]/g, "")
    if (qLocal.length >= 4 && qLocal === tCompact) return true
  }
  if (tEmail && qName) {
    const tLocal = tEmail.split("@")[0].replace(/[^a-z0-9]/g, "")
    const qCompact = qName.replace(/[^a-z0-9]/g, "")
    if (tLocal.length >= 4 && tLocal === qCompact) return true
  }
  return false
}

function formatRelativeTimeAgo(timestampMs: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000))
  if (diffSec < 60) return "Just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  return `${diffDays}d ago`
}

const COMMON_SURNAMES = [
  "asiedu", "mensah", "appiah", "owusu", "boateng", "osei", "amoah", "agyemang", "acheampong", "opoku",
  "koomson", "addo", "tetteh", "quaye", "baah", "nyarko", "frimpong", "ansah", "gyamfi", "baffour",
  "smith", "johnson", "williams", "brown", "jones", "miller", "davis", "wilson", "taylor", "anderson",
  "thomas", "jackson", "white", "harris", "martin", "thompson", "garcia", "martinez", "robinson", "clark",
  "rodriguez", "lewis", "walker", "hall", "allen", "young", "king", "wright", "scott", "green",
  "baker", "adams", "nelson", "carter", "mitchell", "roberts", "turner", "phillips", "campbell", "parker",
  "evans", "edwards", "collins", "stewart", "morris", "morales", "murphy", "cook", "rogers", "gutierrez"
]

export function deriveHumanNameFromEmail(rawInput: string): string {
  const trimmed = (rawInput || "").trim()
  if (!trimmed) return ""

  // Handle "Yaw Asiedu <yaw@gmail.com>" format
  const angleMatch = trimmed.match(/^([^<@]+)<([^>]+)>$/)
  if (angleMatch && angleMatch[1].trim()) {
    return angleMatch[1]
      .trim()
      .replace(/["']/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ")
  }

  const local = (trimmed.split("@")[0] || "").trim()
  if (!local) return ""

  const cleaned = local.replace(/[._-]+/g, " ").replace(/\d+/g, "").trim()
  if (!cleaned) return ""

  // If single concatenated token like "yawasiedu" or "kwameboateng", split known surname suffix
  if (!cleaned.includes(" ")) {
    const lower = cleaned.toLowerCase()
    for (const surname of COMMON_SURNAMES) {
      if (lower.length > surname.length + 1 && lower.endsWith(surname)) {
        const first = lower.slice(0, lower.length - surname.length)
        return `${first.charAt(0).toUpperCase() + first.slice(1)} ${surname.charAt(0).toUpperCase() + surname.slice(1)}`
      }
      if (lower.length > surname.length + 1 && lower.startsWith(surname)) {
        const rest = lower.slice(surname.length)
        return `${rest.charAt(0).toUpperCase() + rest.slice(1)} ${surname.charAt(0).toUpperCase() + surname.slice(1)}`
      }
    }
  }

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function buildRecipientInviteUrl(
  baseInviteLink: string,
  params: {
    cid?: string
    senderName: string
    senderHeadline?: string
    recipientName?: string
    recipientEmail?: string
    recipientPhone?: string
  }
): string {
  try {
    const url = new URL(
      baseInviteLink.startsWith("http")
        ? baseInviteLink
        : `https://www.connectln.app${baseInviteLink.startsWith("/") ? "" : "/"}${baseInviteLink}`
    )
    const isLiveCallInvite = Boolean(url.searchParams.get("joinCall"))
    if (isLiveCallInvite) {
      url.pathname = "/connectin"
      if (!url.searchParams.get("tab")) {
        url.searchParams.set("tab", "vibecomms")
      }
    } else {
      url.pathname = "/connectin-login"
      url.searchParams.set("invite", "accept")
    }
    if (params.cid) {
      url.searchParams.set("cid", params.cid)
    }
    if (params.senderName) {
      url.searchParams.set("inviter", params.senderName)
      url.searchParams.set("ref", params.senderName.toLowerCase().replace(/\s+/g, "-"))
    }
    if (params.senderHeadline) {
      url.searchParams.set("inviterHeadline", params.senderHeadline)
    }
    if (params.recipientName) {
      url.searchParams.set("invitedName", params.recipientName)
    }
    if (params.recipientEmail) {
      url.searchParams.set("invitedEmail", params.recipientEmail)
    }
    if (params.recipientPhone) {
      url.searchParams.set("invitedPhone", params.recipientPhone)
    }
    return url.toString()
  } catch {
    const q = new URLSearchParams()
    q.set("invite", "accept")
    if (params.cid) q.set("cid", params.cid)
    if (params.senderName) q.set("inviter", params.senderName)
    if (params.recipientName) q.set("invitedName", params.recipientName)
    if (params.recipientEmail) q.set("invitedEmail", params.recipientEmail)
    return `https://www.connectln.app/connectin-login?${q.toString()}`
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cid = (searchParams.get("cid") || "").trim()
  const email = (searchParams.get("email") || "").trim().toLowerCase()
  const phone = (searchParams.get("phone") || "").trim()
  const inviter = (searchParams.get("inviter") || "").trim().toLowerCase()
  const user = (searchParams.get("user") || "").trim().toLowerCase()

  const store = getInviteStore()
  const cloudItems = await pullCloudInvites()
  for (const item of cloudItems) {
    if (item && item.cid) {
      const existing = store.get(item.cid)
      if (!existing || (item.status && item.status !== "pending" && existing.status === "pending")) {
        store.set(item.cid, item)
      }
    }
  }

  if (cid && store.has(cid)) {
    const rec = store.get(cid)
    return NextResponse.json({ success: true, invite: rec, record: rec })
  }

  const allRecords = Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt)
  const activeRecords = allRecords.filter((r) => r.status !== "withdrawn" && r.status !== "ignored" && r.status !== "accepted")
  const acceptedRecords = allRecords.filter((r) => r.status === "accepted")

  const matched =
    allRecords.find((r) => (email && r.recipientEmail === email) || (phone && r.recipientPhone === phone)) ||
    allRecords.find((r) => inviter && r.senderName.toLowerCase().includes(inviter) && r.recipientName) ||
    allRecords[0]

  // Build receivedInvites & sentInvites for NetworkView (LinkedIn-style strict separation)
  const receivedInvites = activeRecords
    .filter((rec) => {
      if (!user && !email && !phone) return false
      const isSentByMe = doesInviteMatchUser(rec.senderName, rec.senderEmail, undefined, user, email, phone)
      if (isSentByMe) return false
      const isReceivedByMe = doesInviteMatchUser(rec.recipientName, rec.recipientEmail, rec.recipientPhone, user, email, phone)
      return isReceivedByMe
    })
    .map((rec) => {
      const displayName = rec.senderName || "ConnectLn Member"
      const displayHeadline = rec.senderHeadline || `Invited you to connect on ConnectLn`
      const displayAvatar = sanitizeCompactAvatar(rec.senderAvatar, displayName)

      return {
        id: `inv_${rec.cid}`,
        cid: rec.cid,
        name: displayName,
        headline: displayHeadline,
        avatar: displayAvatar,
        mutualCount: 18,
        timeAgo: formatRelativeTimeAgo(rec.createdAt),
        customNote: rec.customNote,
        senderName: rec.senderName,
        recipientName: rec.recipientName,
        email: rec.senderEmail || rec.recipientEmail,
        phone: rec.recipientPhone,
        channel: rec.channel || "member_connect",
        status: rec.status || "pending"
      }
    })

  const sentInvites = activeRecords
    .filter((rec) => {
      if (!user && !email && !phone) return false
      return doesInviteMatchUser(rec.senderName, rec.senderEmail, undefined, user, email, phone)
    })
    .map((rec) => {
      const displayName = rec.recipientName || rec.recipientEmail || rec.recipientPhone || "Invited Member"
      return {
        id: `out_${rec.cid}`,
        cid: rec.cid,
        name: displayName,
        headline:
          rec.recipientHeadline ||
          (rec.recipientEmail
            ? `Invited via Email · ${rec.recipientEmail}`
            : rec.recipientPhone
            ? `Invited via SMS · ${rec.recipientPhone}`
            : `Invited on ConnectLn`),
        avatar: sanitizeCompactAvatar(rec.recipientAvatar, displayName),
        email: rec.recipientEmail,
        phone: rec.recipientPhone,
        sentAt: formatRelativeTimeAgo(rec.createdAt),
        customNote: rec.customNote,
        status: (rec.status || "pending") as "pending" | "accepted"
      }
    })

  const acceptedConnections = acceptedRecords
    .filter((rec) => {
      if (!user && !email && !phone) return false
      const isSender = doesInviteMatchUser(rec.senderName, rec.senderEmail, undefined, user, email, phone)
      const isRecipient = doesInviteMatchUser(rec.recipientName, rec.recipientEmail, rec.recipientPhone, user, email, phone)
      return isSender || isRecipient
    })
    .map((rec) => {
      const isSender = doesInviteMatchUser(rec.senderName, rec.senderEmail, undefined, user, email, phone)
      const peerName = isSender
        ? rec.recipientName || rec.recipientEmail || rec.recipientPhone || "Connected Member"
        : rec.senderName || rec.recipientName || "Connected Member"
      const peerHeadline = isSender
        ? rec.recipientHeadline || "Verified ConnectLn Member"
        : rec.senderHeadline || "Verified ConnectLn Member"
      const peerAvatar = isSender
        ? sanitizeCompactAvatar(rec.recipientAvatar, peerName)
        : sanitizeCompactAvatar(rec.senderAvatar, peerName)
      return {
        id: `conn_${rec.cid}`,
        cid: rec.cid,
        name: peerName,
        headline: peerHeadline,
        avatar: peerAvatar,
        connectedSince: isSender ? "Invitation Sent · Accepted" : "Invitation Received · Accepted",
        originType: isSender ? "sent_accepted" : "received_accepted",
        capabilities: ["Verified Specialist", "1st Degree Peer"],
        verifiedBadges: [isSender ? "✓ Invitation Sent & Accepted" : "✓ Invitation Received & Accepted"],
        mutualCount: 18,
        isOnline: true,
        email: isSender ? rec.recipientEmail : rec.senderEmail
      }
    })

  return NextResponse.json({
    success: Boolean(matched),
    invite: matched || null,
    record: matched || null,
    receivedInvites,
    sentInvites,
    acceptedConnections,
    allInvites: activeRecords
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      action,
      channel,
      cid = "",
      recipients,
      recipientName = "",
      recipientHeadline = "",
      recipientAvatar = "",
      recipientNames = {},
      message,
      customNote = "",
      senderName = "Member",
      senderEmail = "",
      senderHeadline = "",
      senderAvatar = "",
      status = "pending",
      inviteLink = "https://www.connectln.app/connectin"
    } = body

    const store = getInviteStore()

    if (action === "update_status") {
      const cloudItems = await pullCloudInvites()
      for (const item of cloudItems) {
        if (item && item.cid && !store.has(item.cid)) {
          store.set(item.cid, item)
        }
      }
      const targetCid = String(cid || "").replace(/^(inv_|out_|inv_from_)/, "").trim()
      const normRecip = String(recipientName || "").toLowerCase().trim()
      const normSender = String(senderName || "").toLowerCase().trim()
      const updatedRecords: StoredInviteRecord[] = []
      for (const [key, rec] of store.entries()) {
        const matchByCid = Boolean(targetCid && (key === targetCid || rec.cid === targetCid))
        const matchByNames =
          Boolean(normRecip && (rec.recipientName?.toLowerCase().trim() === normRecip || rec.senderName?.toLowerCase().trim() === normRecip)) &&
          (!normSender || normSender === "member" || rec.senderName?.toLowerCase().trim() === normSender || rec.recipientName?.toLowerCase().trim() === normSender)
        if (matchByCid || matchByNames) {
          const updated = sanitizeInviteRecord({ ...rec, status })
          store.set(key, updated)
          updatedRecords.push(updated)
        }
      }
      await Promise.all(
        updatedRecords.map(async (uRec) => {
          const itemKey = `inv_${uRec.cid.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48)}`
          await Promise.all([
            upsertMapItemInTwilio(SYNC_INVITES_MAP, itemKey, uRec),
            upsertMapItemInTwilio(SYNC_BACKUP_MAP, itemKey, uRec)
          ])
        })
      )
      return NextResponse.json({ success: true, updatedCount: updatedRecords.length })
    }

    // Support lightweight link & in-app connection registration so copied/shared links and member connects persist on the server
    if (channel === "register_link" || channel === "member_connect") {
      const recordCid = (cid || `cin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`).trim()
      const cleanRecip = (recipientName || (Array.isArray(recipients) ? String(recipients[0] || "") : "")).trim()
      if (cleanRecip) {
        const firstRecipient = Array.isArray(recipients) && recipients.length > 0 ? String(recipients[0]).trim() : ""
        const isEmail = firstRecipient.includes("@")
        const isPhone = !isEmail && firstRecipient.replace(/[^\d+]/g, "").length >= 10
        await syncAndSaveInviteRecord({
          cid: recordCid,
          recipientName: cleanRecip,
          recipientEmail: isEmail ? firstRecipient.toLowerCase() : undefined,
          recipientPhone: isPhone ? firstRecipient : undefined,
          recipientHeadline: recipientHeadline || undefined,
          recipientAvatar: recipientAvatar || undefined,
          senderName,
          senderEmail: senderEmail || undefined,
          senderHeadline: senderHeadline || undefined,
          senderAvatar: senderAvatar || undefined,
          customNote: customNote || undefined,
          channel: channel === "member_connect" ? "member_connect" : "link",
          status: "pending",
          createdAt: Date.now()
        })
      }
      return NextResponse.json({ success: true, cid: recordCid })
    }

    if (!channel || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. 'channel' ('sms' | 'call' | 'email') and 'recipients' array are required." },
        { status: 400 }
      )
    }

    if (channel === "sms") {
      const results: Array<{ phone: string; success: boolean; sid?: string; error?: string }> = []
      let successCount = 0

      for (const rawPhone of recipients) {
        const cleanPhone = formatE164Phone(rawPhone)
        if (!cleanPhone || cleanPhone.length < 10) {
          results.push({ phone: rawPhone, success: false, error: "Invalid phone number format" })
          continue
        }

        const resolvedRecipientName = (recipientNames?.[rawPhone] || recipientNames?.[cleanPhone] || recipientName || cleanPhone).trim()
        const itemCid = cid || `cin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`
        await syncAndSaveInviteRecord({
          cid: itemCid,
          recipientName: resolvedRecipientName,
          recipientPhone: cleanPhone,
          recipientHeadline: recipientHeadline || `Invited via SMS · ${cleanPhone}`,
          recipientAvatar: recipientAvatar || undefined,
          senderName,
          senderEmail: senderEmail || undefined,
          senderHeadline: senderHeadline || undefined,
          senderAvatar: senderAvatar || undefined,
          customNote: customNote || undefined,
          channel: "sms",
          status: "pending",
          createdAt: Date.now()
        })

        const personalizedLink = buildRecipientInviteUrl(inviteLink, {
          cid: itemCid,
          senderName,
          senderHeadline,
          recipientName: resolvedRecipientName,
          recipientPhone: cleanPhone
        })

        const rawMessage = message?.trim()
          ? message.trim().replace(/https?:\/\/[^\s]+/g, personalizedLink)
          : `ConnectLn: Hi${resolvedRecipientName ? ` ${resolvedRecipientName}` : ""}! ${senderName} has invited you to connect on ConnectLn. Join here: ${personalizedLink}`

        const res = await sendConnectInInviteSMS({
          toPhone: cleanPhone,
          message: rawMessage,
          senderName
        })

        if (res.success) {
          successCount++
          results.push({ phone: cleanPhone, success: true, sid: res.sid })
        } else {
          results.push({ phone: cleanPhone, success: false, error: res.error, sid: res.sid })
        }
      }

      const allSucceeded = successCount === recipients.length
      recordGlobalUserActivity({
        id: `act_inv_sms_${Date.now().toString().slice(-6)}`,
        userName: senderName,
        actionType: "USER_INVITED",
        actionLabel: `Sent ${recipients.length} SMS Invitation(s)`,
        category: "network",
        targetTitle: recipientName || recipients.join(", "),
        details: `${senderName} dispatched ${successCount}/${recipients.length} SMS invite(s) to ${recipientName || recipients.join(", ")}`,
        timestampIso: new Date().toISOString()
      }).catch(() => {})
      return NextResponse.json({
        success: successCount > 0,
        allSucceeded,
        channel: "sms",
        total: recipients.length,
        dispatched: successCount,
        results
      })
    } else if (channel === "call") {
      const results: Array<{ phone: string; success: boolean; sid?: string; error?: string }> = []
      let successCount = 0

      for (const rawPhone of recipients) {
        const cleanPhone = formatE164Phone(rawPhone)
        if (!cleanPhone || cleanPhone.length < 10) {
          results.push({ phone: rawPhone, success: false, error: "Invalid phone number format" })
          continue
        }

        const resolvedRecipientName = (recipientNames?.[rawPhone] || recipientNames?.[cleanPhone] || recipientName || cleanPhone).trim()
        const itemCid = cid || `cin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`
        await syncAndSaveInviteRecord({
          cid: itemCid,
          recipientName: resolvedRecipientName,
          recipientPhone: cleanPhone,
          recipientHeadline: recipientHeadline || `Invited via Voice Call · ${cleanPhone}`,
          recipientAvatar: recipientAvatar || undefined,
          senderName,
          senderEmail: senderEmail || undefined,
          senderHeadline: senderHeadline || undefined,
          senderAvatar: senderAvatar || undefined,
          customNote: customNote || undefined,
          channel: "call",
          status: "pending",
          createdAt: Date.now()
        })

        const personalizedLink = buildRecipientInviteUrl(inviteLink, {
          cid: itemCid,
          senderName,
          senderHeadline,
          recipientName: resolvedRecipientName,
          recipientPhone: cleanPhone
        })

        const res = await sendConnectInInviteVoiceCall({
          toPhone: cleanPhone,
          senderName,
          inviteLink: personalizedLink
        })

        if (res.success) {
          successCount++
          results.push({ phone: cleanPhone, success: true, sid: res.sid })
        } else {
          results.push({ phone: cleanPhone, success: false, error: res.error, sid: res.sid })
        }
      }

      const allSucceeded = successCount === recipients.length
      recordGlobalUserActivity({
        id: `act_inv_call_${Date.now().toString().slice(-6)}`,
        userName: senderName,
        actionType: "USER_INVITED",
        actionLabel: `Initiated ${recipients.length} Voice Call Invitation(s)`,
        category: "network",
        targetTitle: recipientName || recipients.join(", "),
        details: `${senderName} rang ${recipientName || recipients.join(", ")} via automated ConnectLn voice call`,
        timestampIso: new Date().toISOString()
      }).catch(() => {})
      return NextResponse.json({
        success: successCount > 0,
        allSucceeded,
        channel: "call",
        total: recipients.length,
        dispatched: successCount,
        results
      })
    } else if (channel === "email") {
      const results: Array<{ email: string; success: boolean; id?: string; error?: string }> = []
      let successCount = 0

      for (const rawEntry of recipients) {
        // Support "Yaw Asiedu <yaw@gmail.com>" or plain "yaw@gmail.com"
        const angleMatch = String(rawEntry).trim().match(/^([^<@]+)<([^>]+)>$/)
        const cleanEmail = (angleMatch ? angleMatch[2] : String(rawEntry)).trim().toLowerCase()
        const inlineAngleName = angleMatch ? angleMatch[1].trim().replace(/["']/g, "") : ""

        if (!cleanEmail || !cleanEmail.includes("@")) {
          results.push({ email: rawEntry, success: false, error: "Invalid email address format" })
          continue
        }

        const resolvedRecipientName = (
          inlineAngleName ||
          recipientNames?.[rawEntry] ||
          recipientNames?.[cleanEmail] ||
          (recipients.length === 1 ? recipientName : "") ||
          deriveHumanNameFromEmail(rawEntry)
        ).trim()

        const itemCid = cid || `cin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`
        await syncAndSaveInviteRecord({
          cid: itemCid,
          recipientName: resolvedRecipientName || cleanEmail,
          recipientEmail: cleanEmail,
          recipientHeadline: recipientHeadline || `Invited via Email · ${cleanEmail}`,
          recipientAvatar: recipientAvatar || undefined,
          senderName,
          senderEmail: senderEmail || undefined,
          senderHeadline: senderHeadline || undefined,
          senderAvatar: senderAvatar || undefined,
          customNote: customNote || undefined,
          channel: "email",
          status: "pending",
          createdAt: Date.now()
        })

        const personalizedLink = buildRecipientInviteUrl(inviteLink, {
          cid: itemCid,
          senderName,
          senderHeadline,
          recipientName: resolvedRecipientName,
          recipientEmail: cleanEmail
        })

        const personalizedMessage = message?.trim()
          ? message.trim().replace(/https?:\/\/[^\s]+/g, personalizedLink)
          : undefined

        const res = await sendConnectInInviteEmail({
          toEmail: cleanEmail,
          recipientName: resolvedRecipientName,
          senderName,
          personalMessage: personalizedMessage,
          inviteLink: personalizedLink
        })

        if (res.success) {
          successCount++
          results.push({ email: cleanEmail, success: true, id: res.id })
        } else {
          results.push({ email: cleanEmail, success: false, error: res.error })
        }
      }

      const allSucceeded = successCount === recipients.length
      recordGlobalUserActivity({
        id: `act_inv_email_${Date.now().toString().slice(-6)}`,
        userName: senderName,
        actionType: "USER_INVITED",
        actionLabel: `Sent ${recipients.length} Email Invitation(s)`,
        category: "network",
        targetTitle: recipientName || recipients.join(", "),
        details: `${senderName} sent ${successCount}/${recipients.length} email invite(s) to ${recipientName || recipients.join(", ")}`,
        timestampIso: new Date().toISOString()
      }).catch(() => {})
      return NextResponse.json({
        success: successCount > 0,
        allSucceeded,
        channel: "email",
        total: recipients.length,
        dispatched: successCount,
        results
      })
    } else {
      return NextResponse.json({ error: "Unsupported channel. Use 'sms', 'call', or 'email'." }, { status: 400 })
    }
  } catch (err: any) {
    console.error("[/api/connectin/invite POST Error]", err)
    return NextResponse.json(
      { error: err.message || "Failed to process invitation dispatch." },
      { status: 500 }
    )
  }
}
