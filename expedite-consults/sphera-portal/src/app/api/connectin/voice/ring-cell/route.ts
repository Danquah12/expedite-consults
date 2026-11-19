import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import {
  resolveRecipientCellPhone,
  normalizeDialablePhone,
  formatPrettyPhoneDisplay,
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
          (uName === normName || uName.includes(normName) || normName.includes(uName))
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

async function sendInstantInternetCallEmailPush(params: {
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
  const fromHeader = `${safeCaller} (ConnectLn Internet Call) <${cleanFromAddr}>`
  const isVideo = params.callMode === "video"
  const subject = isVideo
    ? `📹 Incoming Free Internet Video Call from ${safeCaller} — Tap to Answer`
    : `📞 Incoming Free Internet Voice Call from ${safeCaller} — Tap to Answer`

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;padding:16px;color:#181411">
    <div style="background:#181411;color:#FBF8F3;padding:18px 22px;border-radius:16px 16px 0 0;border-bottom:3px solid #10B981">
      <div style="font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#34D399;margin-bottom:4px">
        ● FREE INTERNET ${isVideo ? "VIDEO" : "VOICE"} CALL (E2EE)
      </div>
      <div style="font-size:20px;font-weight:800;color:#FFFFFF">
        ${escapeHtml(safeCaller)} is calling you on ConnectLn
      </div>
    </div>
    <div style="background:#FBF8F3;border:1px solid #E0D6C5;border-top:none;border-radius:0 0 16px 16px;padding:24px 22px;text-align:center">
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.5;color:#292524">
        Hi <strong>${escapeHtml(params.recipientName || "there")}</strong>, tap below on Wi-Fi or mobile data to answer <strong>${escapeHtml(safeCaller)}</strong> with ${isVideo ? "live video &amp; audio" : "live internet audio"} (100% free over internet):
      </p>
      <a href="${escapeHtml(params.joinUrl)}" style="display:inline-block;background:#059669;color:#FFFFFF;text-decoration:none;padding:15px 28px;border-radius:12px;font-weight:800;font-size:16px;box-shadow:0 4px 14px rgba(5,150,105,0.35)">
        ${isVideo ? "📹 Tap to Answer Video Call →" : "📞 Tap to Answer Internet Call →"}
      </a>
      <p style="margin:18px 0 0 0;font-size:12px;color:#78716C;word-break:break-all">
        Direct link: <a href="${escapeHtml(params.joinUrl)}" style="color:#7C4225">${escapeHtml(params.joinUrl)}</a>
      </p>
    </div>
  </div>`

  const text = `${safeCaller} is calling you on ConnectLn (${isVideo ? "Internet Video Call" : "Internet Voice Call"}).\n\nTap to answer free over Wi-Fi/Data:\n${params.joinUrl}`

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

/**
 * 100% Zero-Twilio-Cost Internet Call Alert & User-Borne SIM/SMS Handoff Generator.
 * Never dials PSTN via Twilio and never sends server-billed Twilio SMS.
 * Instead dispatches free internet email push + returns `sms:`, `tel:`, and `wa.me` handoff URIs so the user's own device bears any carrier cost.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const callerName = String(body?.callerName || "ConnectLn Caller").trim()
    const callerEmail = String(body?.callerEmail || "").trim()
    const callMode: "audio" | "video" = body?.callMode === "video" ? "video" : "audio"
    const rawJoinUrl =
      String(body?.joinUrl || "").trim() ||
      `https://conectln.com/connectin?tab=vibecomms&joinCall=${encodeURIComponent(
        body?.roomId || `room_${Date.now()}`
      )}`

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

    let joinUrl = rawJoinUrl
    if (recipientLabel && !joinUrl.includes("invitedName=")) {
      joinUrl += `${joinUrl.includes("?") ? "&" : "?"}invitedName=${encodeURIComponent(recipientLabel)}`
    }

    let emailSent = false
    let emailError = ""
    if (emailLookup.email) {
      const emailRes = await sendInstantInternetCallEmailPush({
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

    const toPhone = resolved.resolvedPhone ? normalizeDialablePhone(resolved.resolvedPhone) : ""
    const digitsOnly = toPhone.replace(/[^\d]/g, "")
    const smsText = `${
      callMode === "video" ? "📹" : "📞"
    } ${callerName} is calling you on ConnectLn (Free Internet ${
      callMode === "video" ? "Video" : "Voice"
    } Call)! Tap to answer live: ${joinUrl}`
    const whatsappUrl = digitsOnly
      ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent(smsText)}`
      : `https://wa.me/?text=${encodeURIComponent(smsText)}`
    const nativeSmsHref = toPhone
      ? `sms:${toPhone}?&body=${encodeURIComponent(smsText)}`
      : `sms:?&body=${encodeURIComponent(smsText)}`
    const nativeTelHref = toPhone ? `tel:${toPhone}` : ""

    return NextResponse.json({
      ok: true,
      internetOnly: true,
      userBorneCarrierHandoff: true,
      toPhone: toPhone || undefined,
      prettyPhone: toPhone ? formatPrettyPhoneDisplay(toPhone) : undefined,
      matchedMemberName: recipientLabel,
      emailSent,
      recipientEmail: emailLookup.email || undefined,
      emailError: emailSent ? undefined : emailError || undefined,
      smsSent: false,
      joinUrl,
      whatsappUrl,
      nativeSmsHref,
      nativeTelHref: nativeTelHref || undefined,
    })
  } catch (err: any) {
    console.error("[voice/ring-cell] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to prepare internet call handoff" },
      { status: 500 }
    )
  }
}
