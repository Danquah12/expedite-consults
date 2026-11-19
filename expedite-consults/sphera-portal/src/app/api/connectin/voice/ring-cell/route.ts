import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import {
  resolveRecipientCellPhone,
  normalizeDialablePhone,
  formatPrettyPhoneDisplay,
  escapeXml,
} from "@/lib/connectin-twilio-voice"
import { connectinDb } from "@/lib/connectin-db"
import { pullCloudUsersIntoDb } from "@/lib/connectin-cloud-sync"

export const dynamic = "force-dynamic"
export const revalidate = 0

const DEFAULT_FROM_EMAIL = "auth@expediteconsults.com"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

async function resolveRecipientEmail(params: {
  targetEmail?: string
  targetName?: string
  targetPhone?: string
}): Promise<{ email: string; displayName: string }> {
  const directEmail = String(params.targetEmail || "").trim().toLowerCase()
  const rawName = String(params.targetName || "").replace(/^@+/, "").trim()
  const normName = rawName.toLowerCase()
  const normPhone = params.targetPhone ? normalizeDialablePhone(params.targetPhone) : ""

  if (EMAIL_RE.test(directEmail) && !directEmail.endsWith("@connectin.app")) {
    return { email: directEmail, displayName: rawName || directEmail.split("@")[0] }
  }

  try {
    await pullCloudUsersIntoDb()
    const users = connectinDb.getAllUsersWithProfiles()
    for (const u of users) {
      const uEmail = (u.email || "").trim().toLowerCase()
      if (!EMAIL_RE.test(uEmail) || uEmail.endsWith("@connectin.app")) continue
      const uName = (u.name || "").trim().toLowerCase()
      const uPhone = u.phone ? normalizeDialablePhone(u.phone) : ""

      const phoneMatches = Boolean(normPhone && uPhone && uPhone === normPhone)
      const nameMatches = Boolean(
        normName &&
          uName &&
          (uName === normName ||
            uName.includes(normName) ||
            normName.includes(uName))
      )
      if (phoneMatches || nameMatches) {
        return { email: uEmail, displayName: u.name || rawName || uEmail.split("@")[0] }
      }
    }
  } catch {
    // non-fatal
  }

  return { email: "", displayName: rawName || "ConnectLn Contact" }
}

async function sendInstantVideoCallEmailPush(params: {
  toEmail: string
  recipientName: string
  callerName: string
  callerEmail?: string
  callMode: "audio" | "video"
  joinUrl: string
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = (process.env.RESEND_API_KEY || "").trim()
  const cleanTo = params.toEmail.trim().toLowerCase()
  if (!apiKey || !EMAIL_RE.test(cleanTo)) {
    return { sent: false, error: !apiKey ? "RESEND_API_KEY missing" : "no_recipient_email" }
  }

  const resend = new Resend(apiKey)
  const rawFrom = (
    process.env.RESEND_FROM_EMAIL ||
    process.env.RESEND_FROM ||
    DEFAULT_FROM_EMAIL
  ).trim()
  const cleanFromAddr =
    rawFrom && !rawFrom.toLowerCase().includes("resend.dev")
      ? rawFrom.includes("<")
        ? (rawFrom.match(/<([^>]+)>/)?.[1] || DEFAULT_FROM_EMAIL).trim()
        : rawFrom
      : DEFAULT_FROM_EMAIL

  const safeCaller = params.callerName.replace(/[<>"]/g, "").trim() || "ConnectLn Caller"
  const fromHeader = `${safeCaller} (Live Call) <${cleanFromAddr}>`
  const isVideo = params.callMode === "video"
  const subject = isVideo
    ? `📹 Incoming Live Video Call from ${safeCaller} — Tap to Answer with Camera`
    : `📞 Incoming Live Voice Call from ${safeCaller} — Tap to Answer`

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;padding:16px;color:#181411">
    <div style="background:#181411;color:#FBF8F3;padding:18px 22px;border-radius:16px 16px 0 0;border-bottom:3px solid #10B981">
      <div style="font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#34D399;margin-bottom:4px">
        ● LIVE INCOMING ${isVideo ? "VIDEO" : "VOICE"} CALL
      </div>
      <div style="font-size:20px;font-weight:800;color:#FFFFFF">
        ${escapeHtml(safeCaller)} is calling you right now
      </div>
    </div>
    <div style="background:#FBF8F3;border:1px solid #E0D6C5;border-top:none;border-radius:0 0 16px 16px;padding:24px 22px;text-align:center">
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.5;color:#292524">
        Hi <strong>${escapeHtml(params.recipientName || "there")}</strong>, tap the button below on your phone or computer to answer <strong>${escapeHtml(safeCaller)}</strong> with ${isVideo ? "your live camera &amp; audio" : "live two-way audio"}:
      </p>
      <a href="${escapeHtml(params.joinUrl)}" style="display:inline-block;background:#059669;color:#FFFFFF;text-decoration:none;padding:15px 28px;border-radius:12px;font-weight:800;font-size:16px;box-shadow:0 4px 14px rgba(5,150,105,0.35)">
        ${isVideo ? "📹 Tap to Answer &amp; Turn On Camera →" : "📞 Tap to Join Live Call →"}
      </a>
      <p style="margin:18px 0 0 0;font-size:12px;color:#78716C;word-break:break-all">
        Direct link: <a href="${escapeHtml(params.joinUrl)}" style="color:#7C4225">${escapeHtml(params.joinUrl)}</a>
      </p>
    </div>
  </div>`

  const text = `${safeCaller} is calling you live on ConnectLn (${isVideo ? "Video + Camera" : "Voice"}).\n\nTap to answer with your camera on your phone:\n${params.joinUrl}`

  try {
    const { error } = await resend.emails.send({
      from: fromHeader,
      to: [cleanTo],
      ...(params.callerEmail && EMAIL_RE.test(params.callerEmail)
        ? { replyTo: params.callerEmail }
        : {}),
      subject,
      html,
      text,
    })
    if (error) {
      return { sent: false, error: error.message }
    }
    return { sent: true }
  } catch (e: any) {
    return { sent: false, error: e?.message || "email_send_failed" }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const callerName = String(body?.callerName || "Kwesi Asiedu").trim()
    const callerEmail = String(body?.callerEmail || "").trim()
    const callMode: "audio" | "video" = body?.callMode === "video" ? "video" : "audio"
    const rawJoinUrl =
      String(body?.joinUrl || "").trim() ||
      `https://conectln.com/connectin?tab=vibecomms&joinCall=${encodeURIComponent(
        body?.roomId || `room_${Date.now()}`
      )}`
    const alsoPlaceAlertCall = Boolean(body?.placeAlertCall)

    const resolved = await resolveRecipientCellPhone({
      targetPhone: body?.toPhone,
      targetName: body?.targetName,
      targetEmail: body?.targetEmail,
    })

    const emailLookup = await resolveRecipientEmail({
      targetEmail: body?.targetEmail,
      targetName: resolved.matchedMemberName || body?.targetName,
      targetPhone: resolved.resolvedPhone || body?.toPhone,
    })

    const recipientLabel =
      resolved.matchedMemberName ||
      emailLookup.displayName ||
      String(body?.targetName || "Guest").trim()

    // Ensure invitedName is appended to joinUrl so recipient lands in the video call with their real name without login friction
    let joinUrl = rawJoinUrl
    if (recipientLabel && !joinUrl.includes("invitedName=")) {
      joinUrl += `${joinUrl.includes("?") ? "&" : "?"}invitedName=${encodeURIComponent(recipientLabel)}`
    }

    // 1. Instant Email Push to Recipient's Phone (100% carrier-independent delivery in ~1s to Gmail / Apple Mail / Yahoo / Outlook)
    let emailSent = false
    let emailError = ""
    if (emailLookup.email) {
      const emailRes = await sendInstantVideoCallEmailPush({
        toEmail: emailLookup.email,
        recipientName: recipientLabel,
        callerName,
        callerEmail,
        callMode,
        joinUrl,
      })
      emailSent = emailRes.sent
      emailError = emailRes.error || ""
    }

    if (!resolved.resolvedPhone) {
      return NextResponse.json(
        {
          ok: emailSent,
          needsPhone: !emailSent,
          emailSent,
          recipientEmail: emailLookup.email || undefined,
          joinUrl,
          error: emailSent
            ? undefined
            : "No mobile phone number on file yet for this contact. Enter their cell number to ring their phone.",
        },
        { status: 200 }
      )
    }

    const toPhone = normalizeDialablePhone(resolved.resolvedPhone)
    const digitsOnly = toPhone.replace(/[^\d]/g, "")
    const smsText = `📹 ConnectLn Live ${callMode === "video" ? "Video" : "Voice"} Call from ${callerName}! Tap to open your camera & join live: ${joinUrl}`
    const whatsappUrl = `https://wa.me/${digitsOnly}?text=${encodeURIComponent(smsText)}`
    const nativeSmsHref = `sms:${toPhone}?&body=${encodeURIComponent(smsText)}`

    const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim()
    const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim()
    const localFrom = normalizeDialablePhone(process.env.TWILIO_PHONE_NUMBER || "+12402623543")
    const tollFreeFrom = "+18333022830"

    let smsSent = false
    let smsSid = ""
    let smsError = ""
    let voiceAlertSid = ""

    if (accountSid && authToken) {
      const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
      const candidateSenders =
        toPhone === tollFreeFrom
          ? [localFrom]
          : toPhone === localFrom
          ? [tollFreeFrom]
          : [tollFreeFrom, localFrom]

      for (const fromNum of candidateSenders) {
        try {
          const res = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
              method: "POST",
              headers: {
                Authorization: authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                To: toPhone,
                From: fromNum,
                Body: smsText,
              }).toString(),
            }
          )
          const data: any = await res.json()
          if (res.ok && data?.sid) {
            smsSent = true
            smsSid = data.sid
            break
          }
          smsError = data?.message || smsError
        } catch (e: any) {
          smsError = e?.message || smsError
        }
      }

      if (alsoPlaceAlertCall) {
        const fromCaller = toPhone === localFrom ? tollFreeFrom : localFrom
        const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Pause length="1"/><Say voice="Polly.Joanna">Hello! Incoming ConnectLn live ${callMode} call from ${escapeXml(
          callerName
        )}. Please tap the video call link just sent to your phone notification or email to join live with your camera.</Say><Pause length="1"/><Say voice="Polly.Joanna">Once again, ${escapeXml(
          callerName
        )} is waiting for you on ConnectLn video.</Say></Response>`

        try {
          const callRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
            {
              method: "POST",
              headers: {
                Authorization: authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                To: toPhone,
                From: fromCaller,
                Twiml: twiml,
              }).toString(),
            }
          )
          const callData: any = await callRes.json()
          if (callRes.ok && callData?.sid) {
            voiceAlertSid = callData.sid
          }
        } catch {}
      }
    }

    return NextResponse.json({
      ok: true,
      toPhone,
      prettyPhone: formatPrettyPhoneDisplay(toPhone),
      matchedMemberName: recipientLabel,
      emailSent,
      recipientEmail: emailLookup.email || undefined,
      emailError: emailSent ? undefined : emailError || undefined,
      smsSent,
      smsSid: smsSid || undefined,
      smsError: smsSent ? undefined : smsError || undefined,
      voiceAlertSid: voiceAlertSid || undefined,
      joinUrl,
      whatsappUrl,
      nativeSmsHref,
    })
  } catch (err: any) {
    console.error("[voice/ring-cell] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to alert recipient cell phone" },
      { status: 500 }
    )
  }
}
