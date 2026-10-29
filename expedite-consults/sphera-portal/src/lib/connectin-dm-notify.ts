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

async function sendEmail(to: string, senderName: string, text: string): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY || "").trim()
  if (!apiKey || !to) return false
  const envFrom = (process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || DEFAULT_FROM_EMAIL).trim()
  const from = envFrom.includes("<") ? envFrom : `ConnectLn Messages <${envFrom}>`
  const body = text.length > 1500 ? text.slice(0, 1500) + "…" : text
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: [to.toLowerCase().trim()],
    subject: `New ConnectLn message from ${senderName}`,
    text: `${senderName} sent you a message on ConnectLn:\n\n${body}\n\nOpen your inbox to reply: ${OPEN_MESSAGING_URL}\n\n-- ConnectLn · Tickets, vouches, and real work`,
    html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:16px;color:#18181b">
      <p style="font-size:15px"><strong>${esc(senderName)}</strong> sent you a message on ConnectLn:</p>
      <div style="white-space:pre-wrap;background:#f6f3ee;border:1px solid #e4ddd0;border-radius:10px;padding:12px;font-size:14px">${esc(body)}</div>
      <p style="margin-top:16px"><a href="${OPEN_MESSAGING_URL}" style="background:#0A66C2;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:bold;font-size:14px">Open your inbox &amp; reply</a></p>
      <p style="color:#71717a;font-size:12px">ConnectLn · Tickets, vouches, and real work</p></div>`,
  })
  if (error) console.warn("[dm-notify] email failed:", error)
  return !error
}

async function sendSms(toPhone: string, senderName: string, text: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || ""
  const authToken = process.env.TWILIO_AUTH_TOKEN || ""
  const fromPhone = process.env.TWILIO_PHONE_NUMBER || ""
  if (!accountSid || !authToken || !fromPhone || !toPhone) return false
  const to = formatE164Phone(toPhone)
  if (to === formatE164Phone(fromPhone)) return false
  const body = `ConnectLn: new message from ${senderName}: "${clip(text, 110)}" Reply: ${OPEN_MESSAGING_URL}`
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: fromPhone, Body: body }).toString(),
  })
  if (!res.ok) console.warn("[dm-notify] sms failed:", res.status, (await res.text().catch(() => "")).slice(0, 200))
  return res.ok
}

export async function notifyDmRecipient(params: {
  recipientName: string
  recipientEmail?: string
  recipientPhone?: string
  senderName: string
  text: string
}): Promise<{ email: boolean; sms: boolean; skipped?: string }> {
  const { recipientName, recipientEmail, recipientPhone, senderName, text } = params
  const key = `${senderName.toLowerCase()}>${recipientName.toLowerCase()}`
  const now = Date.now()
  if (now - (lastNotifiedAt.get(key) || 0) < COOLDOWN_MS) return { email: false, sms: false, skipped: "cooldown" }
  lastNotifiedAt.set(key, now)

  const wantEmail = process.env.DM_NOTIFY_EMAIL !== "0"
  const wantSms = process.env.DM_NOTIFY_SMS !== "0"
  const withTimeout = <T,>(p: Promise<T>, fallback: T) =>
    Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), 8000))]).catch(() => fallback)

  const [email, sms] = await Promise.all([
    wantEmail && recipientEmail ? withTimeout(sendEmail(recipientEmail, senderName, text), false) : Promise.resolve(false),
    wantSms && recipientPhone ? withTimeout(sendSms(recipientPhone, senderName, text), false) : Promise.resolve(false),
  ])
  return { email, sms }
}
