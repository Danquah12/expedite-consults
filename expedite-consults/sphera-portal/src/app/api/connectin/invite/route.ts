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
const SYNC_INVITES_KEY = "global_invites_v1"

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

async function pullCloudInvites(): Promise<StoredInviteRecord[]> {
  const auth = getTwilioAuthHeader()
  if (!auth) return []
  try {
    const res = await fetch(
      `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_INVITES_MAP}/Items/${encodeURIComponent(SYNC_INVITES_KEY)}`,
      {
        method: "GET",
        headers: { Authorization: auth },
        cache: "no-store"
      }
    )
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.data?.items) ? (json.data.items as StoredInviteRecord[]) : []
  } catch {
    return []
  }
}

async function pushCloudInvites(items: StoredInviteRecord[]): Promise<void> {
  const auth = getTwilioAuthHeader()
  if (!auth) return
  try {
    const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_INVITES_MAP}`
    const serialized = JSON.stringify({ items: items.slice(0, 80) })
    const updateRes = await fetch(`${baseUrl}/Items/${encodeURIComponent(SYNC_INVITES_KEY)}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ Data: serialized }).toString()
    })
    if (updateRes.ok) return
    if (updateRes.status === 404) {
      await fetch("https://sync.twilio.com/v1/Services/default/Maps", {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ UniqueName: SYNC_INVITES_MAP }).toString()
      }).catch(() => {})
      await fetch(`${baseUrl}/Items`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ Key: SYNC_INVITES_KEY, Data: serialized }).toString()
      }).catch(() => {})
    }
  } catch {
    // best-effort cloud persistence
  }
}

async function syncAndSaveInviteRecord(record: StoredInviteRecord): Promise<StoredInviteRecord[]> {
  const store = getInviteStore()
  store.set(record.cid, record)
  const cloudItems = await pullCloudInvites()
  for (const item of cloudItems) {
    if (item && item.cid && !store.has(item.cid)) {
      store.set(item.cid, item)
    } else if (item && item.cid && store.has(item.cid)) {
      const local = store.get(item.cid)!
      // Preserve accepted/ignored/withdrawn status if updated more recently
      if (item.status && item.status !== "pending" && local.status === "pending" && item.cid !== record.cid) {
        store.set(item.cid, item)
      }
    }
  }
  store.set(record.cid, record)
  const all = Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt)
  await pushCloudInvites(all)
  return all
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

  // Build receivedInvites & sentInvites for NetworkView
  const receivedInvites = activeRecords.map((rec) => {
    const isDirectToCurrentUser =
      Boolean(user && rec.recipientName && rec.recipientName.toLowerCase().trim() === user) ||
      Boolean(email && rec.recipientEmail && rec.recipientEmail.toLowerCase().trim() === email)
    const displayName = isDirectToCurrentUser
      ? rec.senderName || rec.recipientName || "ConnectLn Member"
      : rec.recipientName || rec.recipientEmail || rec.recipientPhone || rec.senderName || "ConnectLn Member"
    const displayHeadline = isDirectToCurrentUser
      ? rec.senderHeadline || `Invited you to connect on ConnectLn`
      : rec.recipientHeadline ||
        (rec.recipientEmail
          ? `Invited by ${rec.senderName} via Email · ${rec.recipientEmail}`
          : rec.recipientPhone
          ? `Invited by ${rec.senderName} via SMS · ${rec.recipientPhone}`
          : `Invited by ${rec.senderName} · ConnectLn Network`)
    const displayAvatar = isDirectToCurrentUser
      ? rec.senderAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0a66c2`
      : rec.recipientAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0a66c2`

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
      email: rec.recipientEmail,
      phone: rec.recipientPhone,
      channel: rec.channel || "link",
      status: rec.status || "pending"
    }
  })

  const sentInvites = activeRecords
    .filter((rec) => !user || !rec.senderName || rec.senderName.toLowerCase().trim() === user)
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
            : `Invited via ConnectLn`),
        avatar:
          rec.recipientAvatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0a66c2`,
        email: rec.recipientEmail,
        phone: rec.recipientPhone,
        sentAt: formatRelativeTimeAgo(rec.createdAt),
        customNote: rec.customNote,
        status: (rec.status || "pending") as "pending" | "accepted"
      }
    })

  const acceptedConnections = acceptedRecords
    .filter((rec) => {
      if (!user) return true
      const sName = (rec.senderName || "").toLowerCase().trim()
      const rName = (rec.recipientName || "").toLowerCase().trim()
      const rEmail = (rec.recipientEmail || "").toLowerCase().trim()
      return sName === user || rName === user || (email && rEmail === email)
    })
    .map((rec) => {
      const isSender = Boolean(user && rec.senderName && rec.senderName.toLowerCase().trim() === user)
      const peerName = isSender
        ? rec.recipientName || rec.recipientEmail || rec.recipientPhone || "Connected Member"
        : rec.senderName || rec.recipientName || "Connected Member"
      const peerHeadline = isSender
        ? rec.recipientHeadline || "Verified ConnectLn Member"
        : rec.senderHeadline || "Verified ConnectLn Member"
      const peerAvatar = isSender
        ? rec.recipientAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(peerName)}&backgroundColor=0a66c2`
        : rec.senderAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(peerName)}&backgroundColor=0a66c2`
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
        email: rec.recipientEmail
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
      const targetCid = String(cid || "").replace(/^(inv_|out_)/, "").trim()
      const normName = String(recipientName || "").toLowerCase().trim()
      let updatedCount = 0
      for (const [key, rec] of store.entries()) {
        if (
          (targetCid && (key === targetCid || rec.cid === targetCid)) ||
          (normName &&
            (rec.recipientName?.toLowerCase().trim() === normName ||
              rec.senderName?.toLowerCase().trim() === normName))
        ) {
          store.set(key, { ...rec, status })
          updatedCount++
        }
      }
      const all = Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt)
      await pushCloudInvites(all)
      return NextResponse.json({ success: true, updatedCount })
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
