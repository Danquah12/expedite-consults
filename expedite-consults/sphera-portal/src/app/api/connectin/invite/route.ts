import { NextRequest, NextResponse } from "next/server"
import { sendConnectInInviteSMS, formatE164Phone } from "@/lib/connectin-sms"
import { sendConnectInInviteEmail } from "@/lib/connectin-email"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      channel,
      recipients,
      message,
      senderName = "Member",
      inviteLink = "https://connectln.vercel.app/connectin"
    } = body

    if (!channel || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. 'channel' ('sms' | 'email') and 'recipients' array are required." },
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

        const smsContent = message?.trim() || `ConnectIn: Hi! ${senderName} has invited you to connect on ConnectIn Zero-Trust Network. Join here: ${inviteLink}`

        const res = await sendConnectInInviteSMS({
          toPhone: cleanPhone,
          message: smsContent,
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
    } else if (channel === "email") {
      const results: Array<{ email: string; success: boolean; id?: string; error?: string }> = []
      let successCount = 0

      for (const rawEmail of recipients) {
        const cleanEmail = rawEmail.trim().toLowerCase()
        if (!cleanEmail || !cleanEmail.includes("@")) {
          results.push({ email: rawEmail, success: false, error: "Invalid email address format" })
          continue
        }

        const res = await sendConnectInInviteEmail({
          toEmail: cleanEmail,
          senderName,
          personalMessage: message,
          inviteLink
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
      return NextResponse.json({ error: "Unsupported channel. Use 'sms' or 'email'." }, { status: 400 })
    }
  } catch (err: any) {
    console.error("[/api/connectin/invite POST Error]", err)
    return NextResponse.json(
      { error: err.message || "Failed to process invitation dispatch." },
      { status: 500 }
    )
  }
}
