import { NextRequest, NextResponse } from "next/server"
import { sendConnectInInviteSMS, sendConnectInInviteVoiceCall, formatE164Phone } from "@/lib/connectin-sms"
import { sendConnectInInviteEmail } from "@/lib/connectin-email"

interface StoredInviteRecord {
  cid: string
  recipientName: string
  recipientEmail?: string
  recipientPhone?: string
  senderName: string
  senderHeadline?: string
  createdAt: number
}

const globalForInvites = globalThis as unknown as {
  __connectlnInviteRecords?: Map<string, StoredInviteRecord>
}

function getInviteStore(): Map<string, StoredInviteRecord> {
  if (!globalForInvites.__connectlnInviteRecords) {
    globalForInvites.__connectlnInviteRecords = new Map<string, StoredInviteRecord>()
  }
  return globalForInvites.__connectlnInviteRecords
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

  const store = getInviteStore()

  if (cid && store.has(cid)) {
    const rec = store.get(cid)
    return NextResponse.json({ success: true, invite: rec, record: rec })
  }

  // Search most recent matching invite by email, phone, or inviter
  const allRecords = Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt)
  const matched =
    allRecords.find((r) => (email && r.recipientEmail === email) || (phone && r.recipientPhone === phone)) ||
    allRecords.find((r) => inviter && r.senderName.toLowerCase().includes(inviter) && r.recipientName) ||
    allRecords[0]

  return NextResponse.json({
    success: Boolean(matched),
    invite: matched || null,
    record: matched || null
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      channel,
      cid = "",
      recipients,
      recipientName = "",
      recipientNames = {},
      message,
      senderName = "Member",
      senderHeadline = "",
      inviteLink = "https://www.connectln.app/connectin"
    } = body

    const store = getInviteStore()

    // Support lightweight link registration so copied/shared links also remember the invited person's name on the server
    if (channel === "register_link") {
      const recordCid = (cid || `cin_${Date.now().toString(36)}`).trim()
      if (recipientName.trim()) {
        store.set(recordCid, {
          cid: recordCid,
          recipientName: recipientName.trim(),
          recipientEmail: Array.isArray(recipients) ? recipients[0] : undefined,
          senderName,
          senderHeadline,
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

        const resolvedRecipientName = (recipientNames?.[rawPhone] || recipientNames?.[cleanPhone] || recipientName || "").trim()
        const itemCid = cid || `cin_${Date.now().toString(36)}`
        store.set(itemCid, {
          cid: itemCid,
          recipientName: resolvedRecipientName,
          recipientPhone: cleanPhone,
          senderName,
          senderHeadline,
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

        const resolvedRecipientName = (recipientNames?.[rawPhone] || recipientNames?.[cleanPhone] || recipientName || "").trim()
        const itemCid = cid || `cin_${Date.now().toString(36)}`
        store.set(itemCid, {
          cid: itemCid,
          recipientName: resolvedRecipientName,
          recipientPhone: cleanPhone,
          senderName,
          senderHeadline,
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

        const itemCid = cid || `cin_${Date.now().toString(36)}`
        store.set(itemCid, {
          cid: itemCid,
          recipientName: resolvedRecipientName,
          recipientEmail: cleanEmail,
          senderName,
          senderHeadline,
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
