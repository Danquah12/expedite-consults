import { Resend } from "resend"
import { formatE164Phone } from "./connectin-sms"

/**
 * Out-of-app notifications for direct messages: when a member receives a ConnectLn message we also
 * email them (Resend) and text them (Twilio) at the contact details they registered with.
 * Everything here is best-effort: a failed email/SMS must never block or fail the message itself.
 */

const DEFAULT_FROM_EMAIL = "auth@expediteconsults.com"
const OPEN_MESSAGING_URL = "https://www.connectln.app/connectin?tab=messaging"

// Best-effort burst limiter (per sender -> recipient). Serverless instances don't share memory,
// so this only softens bursts; it is not a hard guarantee.
const lastNotifiedAt = new Map<string, number>()
const COOLDOWN_MS = 2 * 60 * 1000

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function clip(s: string, max: number): string {
  const flat = s.replace(/\s+/g, " ").trim()
  return flat.length > max ? flat.slice(0, max - 1) + "…" : flat
}

async function sendEmail(to: string, senderName: string, recipientName: string, text: string, messageId?: string): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY || "").trim()
  if (!apiKey || !to) return false
  const envFrom = (process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || DEFAULT_FROM_EMAIL).trim()
  const from = envFrom.includes("<") ? envFrom : `ConnectLn Messages <${envFrom}>`
  const body = text.length > 1500 ? text.slice(0, 1500) + "…" : text
  const isMeetingInvite = text.includes("Meeting invitation from")
  const isRsvpResponse = text.includes("Meeting RSVP Response")
  const reasonMatch = text.match(/Reason:\s*([^\n]+)/i)
  const reason = reasonMatch ? reasonMatch[1].trim() : "Scheduled Meeting"

  const rsvpBase = `https://www.connectln.app/api/connectin/meeting-rsvp?host=${encodeURIComponent(senderName)}&invitee=${encodeURIComponent(recipientName)}&msgId=${encodeURIComponent(messageId || "")}&reason=${encodeURIComponent(reason)}`
  const rsvpButtonsHtml = isMeetingInvite
    ? `<div style="margin-top:16px;padding:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px">
        <p style="margin:0 0 10px 0;font-size:13px;font-weight:800;color:#0f172a">📋 Confirm your attendance (sends your response back to ${esc(senderName)}):</p>
        <div>
          <a href="${rsvpBase}&choice=yes" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:9px 18px;border-radius:8px;font-weight:800;font-size:13px;margin-right:8px">✅ Yes</a>
          <a href="${rsvpBase}&choice=no" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:9px 18px;border-radius:8px;font-weight:800;font-size:13px;margin-right:8px">❌ No</a>
          <a href="${rsvpBase}&choice=maybe" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;padding:9px 18px;border-radius:8px;font-weight:800;font-size:13px">🤔 Maybe</a>
        </div>
      </div>`
    : ""

  const subject = isMeetingInvite
    ? `📅 ConnectLn Meeting Invitation from ${senderName}: ${reason}`
    : isRsvpResponse
    ? `📅 Meeting RSVP Response from ${senderName}`
    : `New ConnectLn message from ${senderName}`

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: [to.toLowerCase().trim()],
    subject,
    text: `${senderName} sent you a message on ConnectLn:\n\n${body}\n\n${isMeetingInvite ? `Confirm Yes: ${rsvpBase}&choice=yes\nConfirm No: ${rsvpBase}&choice=no\nConfirm Maybe: ${rsvpBase}&choice=maybe\n\n` : ""}Open your inbox to reply: ${OPEN_MESSAGING_URL}\n\n-- ConnectLn · Tickets, vouches, and real work`,
    html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:16px;color:#18181b">
      <div style="display:flex;align-items:center;gap:10px;background:#171513;color:#F5F0EB;padding:12px 16px;border-radius:12px 12px 0 0">
        <img src="https://www.connectln.app/brand/connectln-icon-256.png" alt="ConnectLn" width="28" height="28" style="border-radius:6px;vertical-align:middle;margin-right:8px" />
        <span style="font-size:16px;font-weight:900;letter-spacing:-0.02em;color:#F5F0EB">ConnectLn</span>
        <span style="margin-left:auto;font-size:11px;font-weight:700;color:#d6d3d1">${isMeetingInvite ? "📅 Official Meeting Invitation" : isRsvpResponse ? "📅 Meeting RSVP Response" : "Direct Message"}</span>
      </div>
      <div style="border:1px solid #e4ddd0;border-top:none;border-radius:0 0 12px 12px;padding:16px;background:#ffffff">
        <p style="font-size:15px;margin-top:0"><strong>${esc(senderName)}</strong> ${isMeetingInvite ? "invited you to a meeting on ConnectLn:" : isRsvpResponse ? "responded to your meeting invitation:" : "sent you a message on ConnectLn:"}</p>
        <div style="white-space:pre-wrap;background:#f6f3ee;border:1px solid #e4ddd0;border-radius:10px;padding:12px;font-size:14px">${esc(body)}</div>
        ${rsvpButtonsHtml}
        <p style="margin-top:16px"><a href="${OPEN_MESSAGING_URL}" style="background:#0A66C2;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block">Open your inbox &amp; reply</a></p>
        <p style="color:#71717a;font-size:12px;margin-bottom:0">ConnectLn · Tickets, vouches, and real work</p>
      </div>
    </div>`,
  })
  if (error) console.warn("[dm-notify] email failed:", error)
  return !error
}

async function sendSms(toPhone: string, senderName: string, text: string): Promise<{ ok: boolean; note: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || ""
  const authToken = process.env.TWILIO_AUTH_TOKEN || ""
  const fromPhone = process.env.TWILIO_PHONE_NUMBER || ""
  if (!accountSid || !authToken || !fromPhone) return { ok: false, note: "Twilio is not configured (missing account SID, auth token or sender number)" }
  if (!toPhone) return { ok: false, note: "no phone number on file for this member" }
  const to = formatE164Phone(toPhone)
  if (to === formatE164Phone(fromPhone)) return { ok: false, note: "recipient number equals the sender number" }
  const body = `ConnectLn: new message from ${senderName}: "${clip(text, 110)}" Reply: ${OPEN_MESSAGING_URL}`
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: fromPhone, Body: body }).toString(),
  })
  const raw = await res.text().catch(() => "")
  let info: any = {}
  try {
    info = JSON.parse(raw)
  } catch {
    // non-JSON error body
  }
  const masked = to.length > 6 ? `${to.slice(0, 3)}****${to.slice(-3)}` : "****"
  if (!res.ok) {
    console.warn("[dm-notify] sms failed:", res.status, raw.slice(0, 200))
    return { ok: false, note: `Twilio ${res.status} (code ${info.code ?? "?"}): ${info.message || raw.slice(0, 120)} [to ${masked}]` }
  }
  return { ok: true, note: `queued with Twilio (sid ${info.sid || "?"}, status ${info.status || "?"}) to ${masked}` }
}

export async function notifyDmRecipient(params: {
  recipientName: string
  recipientEmail?: string
  recipientPhone?: string
  senderName: string
  text: string
  messageId?: string
}): Promise<{ email: boolean; sms: boolean; skipped?: string; smsNote?: string }> {
  const { recipientName, recipientEmail, recipientPhone, senderName, text, messageId } = params
  const isMeetingOrRsvp = text.includes("Meeting invitation from") || text.includes("Meeting RSVP Response")
  const key = `${senderName.toLowerCase()}>${recipientName.toLowerCase()}`
  const now = Date.now()
  if (!isMeetingOrRsvp && now - (lastNotifiedAt.get(key) || 0) < COOLDOWN_MS) {
    return { email: false, sms: false, skipped: "cooldown" }
  }
  lastNotifiedAt.set(key, now)

  const wantEmail = process.env.DM_NOTIFY_EMAIL !== "0"
  const wantSms = process.env.DM_NOTIFY_SMS !== "0"
  const withTimeout = <T,>(p: Promise<T>, fallback: T) =>
    Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), 8000))]).catch(() => fallback)

  const [email, sms] = await Promise.all([
    wantEmail && recipientEmail ? withTimeout(sendEmail(recipientEmail, senderName, recipientName, text, messageId), false) : Promise.resolve(false),
    wantSms
      ? withTimeout(sendSms(recipientPhone || "", senderName, text), { ok: false, note: "timed out calling Twilio" })
      : Promise.resolve({ ok: false, note: "SMS notifications are switched off (DM_NOTIFY_SMS=0)" }),
  ])
  return { email, sms: sms.ok, smsNote: sms.note }
}
