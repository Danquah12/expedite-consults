import { NextRequest, NextResponse } from "next/server"
import { sendConnectInInviteSMS, sendConnectInInviteVoiceCall, formatE164Phone } from "@/lib/connectin-sms"
import { sendConnectInInviteEmail } from "@/lib/connectin-email"

function deriveHumanNameFromEmail(email: string): string {
  const local = (email.split("@")[0] || "").trim()
  if (!local) return ""
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function buildRecipientInviteUrl(
  baseInviteLink: string,
  params: {
    senderName: string
    senderHeadline?: string
    recipientName?: string
    recipientEmail?: string
    recipientPhone?: string
  }
): string {
  try {
    const url = new URL(baseInviteLink.startsWith("http") ? baseInviteLink : `https://www.connectln.app${baseInviteLink.startsWith("/") ? "" : "/"}${baseInviteLink}`)
    url.searchParams.set("invite", "accept")
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
    if (params.senderName) q.set("inviter", params.senderName)
    if (params.recipientName) q.set("invitedName", params.recipientName)
    if (params.recipientEmail) q.set("invitedEmail", params.recipientEmail)
    return `https://www.connectln.app/connectin?${q.toString()}`
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      channel,
      recipients,
      recipientName = "",
      recipientNames = {},
      message,
      senderName = "Member",
      senderHeadline = "",
      inviteLink = "https://www.connectln.app/connectin"
    } = body

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
        const personalizedLink = buildRecipientInviteUrl(inviteLink, {
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
        const personalizedLink = buildRecipientInviteUrl(inviteLink, {
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

      for (const rawEmail of recipients) {
        const cleanEmail = rawEmail.trim().toLowerCase()
        if (!cleanEmail || !cleanEmail.includes("@")) {
          results.push({ email: rawEmail, success: false, error: "Invalid email address format" })
          continue
        }

        const resolvedRecipientName = (
          recipientNames?.[rawEmail] ||
          recipientNames?.[cleanEmail] ||
          (recipients.length === 1 ? recipientName : "") ||
          deriveHumanNameFromEmail(cleanEmail)
        ).trim()

        const personalizedLink = buildRecipientInviteUrl(inviteLink, {
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
