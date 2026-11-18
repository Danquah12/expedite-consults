import { Resend } from "resend"
import { formatE164Phone } from "./connectin-sms"

/**
 * Out-of-app & external email/SMS delivery for ConnectLn Messaging:
 * - Delivers direct messages to external email users (Gmail, Yahoo, Outlook, iCloud, AOL, corporate domains) via Resend.
 * - Notifies internal ConnectLn members via email (Resend) and SMS (Twilio) at their registered contact details.
 * - Sets Reply-To to the sender's email so external recipients can reply directly from Gmail/Yahoo OR click 1 button
 *   to open the live ConnectLn conversation thread.
 */

const DEFAULT_FROM_EMAIL = "auth@expediteconsults.com"
const OPEN_MESSAGING_URL = "https://conectln.com/connectin?tab=messaging"

const dispatchedMessageIds = new Set<string>()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function clip(s: string, max: number): string {
  const flat = s.replace(/\s+/g, " ").trim()
  return flat.length > max ? flat.slice(0, max - 1) + "…" : flat
}

function resolveVerifiedFromAddress(senderDisplayName?: string): string {
  const rawEnv = (
    process.env.RESEND_FROM_EMAIL ||
    process.env.RESEND_FROM ||
    process.env.RESEND_FORM_EMAIL ||
    DEFAULT_FROM_EMAIL
  ).trim()

  // Never use onboarding@resend.dev because Resend restricts resend.dev to the account owner only;
  // auth@expediteconsults.com is domain-verified for Gmail, Yahoo, Outlook, and all external recipients.
  const cleanEmail = rawEnv && !rawEnv.toLowerCase().includes("resend.dev")
    ? rawEnv.includes("<")
      ? (rawEnv.match(/<([^>]+)>/)?.[1] || DEFAULT_FROM_EMAIL).trim()
      : rawEnv
    : DEFAULT_FROM_EMAIL

  const safeLabel = (senderDisplayName || "ConnectLn").replace(/[<>"]/g, "").trim()
  return `${safeLabel} via ConnectLn <${cleanEmail}>`
}

async function sendEmail(params: {
  to: string
  senderName: string
  senderEmail?: string
  senderHeadline?: string
  recipientName: string
  text: string
  subject?: string
  messageId?: string
  isExternalRecipient?: boolean
}): Promise<{ ok: boolean; error?: string }> {
  const {
    to,
    senderName,
    senderEmail,
    senderHeadline,
    recipientName,
    text,
    subject: customSubject,
    messageId,
    isExternalRecipient = false,
  } = params

  const apiKey = (process.env.RESEND_API_KEY || "").trim()
  const cleanTo = (to || "").trim().toLowerCase()
  if (!apiKey || !EMAIL_RE.test(cleanTo)) {
    return { ok: false, error: !apiKey ? "RESEND_API_KEY missing" : "invalid_email" }
  }

  const fromPrimary = resolveVerifiedFromAddress(senderName)
  const fallbackFrom = `ConnectLn Messages <${DEFAULT_FROM_EMAIL}>`
  const validReplyTo =
    senderEmail && EMAIL_RE.test(senderEmail.trim()) && !senderEmail.endsWith("@connectin.app")
      ? senderEmail.trim()
      : undefined

  const body = text.length > 2500 ? text.slice(0, 2500) + "…" : text
  const isMeetingInvite = text.includes("Meeting invitation from")
  const isRsvpResponse = text.includes("Meeting RSVP Response")
  const reasonMatch = text.match(/Reason:\s*([^\n]+)/i)
  const reason = reasonMatch ? reasonMatch[1].trim() : "Scheduled Meeting"

  const rsvpBase = `https://conectln.com/api/connectin/meeting-rsvp?host=${encodeURIComponent(senderName)}&invitee=${encodeURIComponent(recipientName)}&msgId=${encodeURIComponent(messageId || "")}&reason=${encodeURIComponent(reason)}`
  const rsvpButtonsHtml = isMeetingInvite
    ? `<div style="margin-top:16px;padding:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px">
        <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#0f172a">📋 Confirm your attendance (sends your response back to ${esc(senderName)}):</p>
        <div>
          <a href="${rsvpBase}&choice=yes" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:9px 18px;border-radius:8px;font-weight:700;font-size:13px;margin-right:8px">✅ Yes</a>
          <a href="${rsvpBase}&choice=no" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:9px 18px;border-radius:8px;font-weight:700;font-size:13px;margin-right:8px">❌ No</a>
          <a href="${rsvpBase}&choice=maybe" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;padding:9px 18px;border-radius:8px;font-weight:700;font-size:13px">🤔 Maybe</a>
        </div>
      </div>`
    : ""

  const subjectPreview = clip(body, 44)
  const resolvedSubject = customSubject?.trim()
    ? customSubject.trim()
    : isMeetingInvite
    ? `📅 ConnectLn Meeting Invitation from ${senderName}: ${reason}`
    : isRsvpResponse
    ? `📅 Meeting RSVP Response from ${senderName}`
    : isExternalRecipient
    ? `${senderName} via ConnectLn: "${subjectPreview}"`
    : `New ConnectLn message from ${senderName}: "${subjectPreview}"`

  const openInboxUrl = `${OPEN_MESSAGING_URL}&invitedName=${encodeURIComponent(recipientName || cleanTo.split("@")[0])}&invitedEmail=${encodeURIComponent(cleanTo)}&inviter=${encodeURIComponent(senderName)}`

  const plainText = `${senderName}${senderHeadline ? ` (${senderHeadline})` : ""} sent you a message via ConnectLn:\n\n${body}\n\n${isMeetingInvite ? `Confirm Yes: ${rsvpBase}&choice=yes\nConfirm No: ${rsvpBase}&choice=no\nConfirm Maybe: ${rsvpBase}&choice=maybe\n\n` : ""}View & reply on ConnectLn: ${openInboxUrl}${validReplyTo ? `\nOr reply directly to this email (${validReplyTo}).` : ""}\n\n-- ConnectLn · Tickets, vouches, and real work`

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:580px;margin:0 auto;padding:16px;color:#191919">
    <div style="display:flex;align-items:center;gap:10px;background:#191919;color:#F5F0EB;padding:14px 18px;border-radius:12px 12px 0 0">
      <img src="https://conectln.com/brand/connectln-icon-256.png" alt="ConnectLn" width="28" height="28" style="border-radius:6px;vertical-align:middle;margin-right:8px" />
      <span style="font-size:16px;font-weight:700;letter-spacing:-0.02em;color:#F5F0EB">ConnectLn</span>
      <span style="margin-left:auto;font-size:11px;font-weight:600;color:#d6d3d1">${isMeetingInvite ? "📅 Official Meeting Invitation" : isRsvpResponse ? "📅 Meeting RSVP Response" : isExternalRecipient ? "✉️ External Direct Message" : "✉️ Direct Message"}</span>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:20px;background:#ffffff">
      <p style="font-size:15px;margin:0 0 4px 0;color:#191919"><strong>${esc(senderName)}</strong> ${isMeetingInvite ? "invited you to a meeting on ConnectLn:" : isRsvpResponse ? "responded to your meeting invitation:" : "sent you a message via ConnectLn:"}</p>
      ${senderHeadline ? `<p style="font-size:12px;color:#666666;margin:0 0 14px 0">${esc(senderHeadline)}</p>` : `<div style="height:10px"></div>`}
      <div style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #0A66C2;border-radius:8px;padding:14px;font-size:14px;line-height:1.5;color:#191919">${esc(body)}</div>
      ${rsvpButtonsHtml}
      <div style="margin-top:18px">
        <a href="${openInboxUrl}" style="background:#0A66C2;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:9999px;font-weight:600;font-size:14px;display:inline-block">Open Conversation &amp; Reply on ConnectLn →</a>
      </div>
      ${validReplyTo ? `<p style="color:#666666;font-size:12px;margin:12px 0 0 0">You can also reply directly to this email to reach <strong>${esc(senderName)}</strong> (${esc(validReplyTo)}).</p>` : ""}
      <hr style="border:none;border-top:1px solid #f1f5f9;margin:16px 0 10px 0" />
      <p style="color:#71717a;font-size:11px;margin:0">ConnectLn · Tickets, vouches, and real work · Expedite Consults LLC</p>
    </div>
  </div>`

  const entityRefHeader = { "X-Entity-Ref-ID": messageId || `connectln-dm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
  const resend = new Resend(apiKey)
  let { error } = await resend.emails.send({
    from: fromPrimary,
    to: [cleanTo],
    ...(validReplyTo ? { replyTo: validReplyTo } : {}),
    headers: entityRefHeader,
    subject: resolvedSubject,
    text: plainText,
    html,
  })

  // Automatic fallback to canonical auth@expediteconsults.com if custom env sender domain had any issue
  if (error && fromPrimary !== fallbackFrom) {
    const retry = await resend.emails.send({
      from: fallbackFrom,
      to: [cleanTo],
      ...(validReplyTo ? { replyTo: validReplyTo } : {}),
      headers: entityRefHeader,
      subject: resolvedSubject,
      text: plainText,
      html,
    })
    error = retry.error
  }

  if (error) {
    console.warn("[dm-notify] email failed:", error)
    return { ok: false, error: error.message || "Resend error" }
  }
  return { ok: true }
}

async function sendSms(toPhone: string, senderName: string, text: string, recipientName?: string): Promise<{ ok: boolean; note: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || ""
  const authToken = process.env.TWILIO_AUTH_TOKEN || ""
  const fromPhone = process.env.TWILIO_PHONE_NUMBER || ""
  if (!accountSid || !authToken || !fromPhone) return { ok: false, note: "Twilio is not configured (missing account SID, auth token or sender number)" }
  if (!toPhone) return { ok: false, note: "no phone number on file for this member" }
  const to = formatE164Phone(toPhone)
  if (to === formatE164Phone(fromPhone)) return { ok: false, note: "recipient number equals the sender number" }
  const smsInboxUrl = recipientName
    ? `${OPEN_MESSAGING_URL}&invitedName=${encodeURIComponent(recipientName)}&inviter=${encodeURIComponent(senderName)}`
    : OPEN_MESSAGING_URL
  const body = `ConnectLn: new message from ${senderName}: "${clip(text, 110)}" Reply: ${smsInboxUrl}`
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
  } catch {}
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
  senderEmail?: string
  senderHeadline?: string
  subject?: string
  text: string
  messageId?: string
  isExternalRecipient?: boolean
  bypassCooldown?: boolean
}): Promise<{ email: boolean; emailError?: string; sms: boolean; skipped?: string; smsNote?: string }> {
  const {
    recipientName,
    recipientEmail,
    recipientPhone,
    senderName,
    senderEmail,
    senderHeadline,
    subject,
    text,
    messageId,
    isExternalRecipient = false,
    bypassCooldown = false,
  } = params

  // Deduplicate only exact duplicate retries of the same messageId — NEVER drop a 2nd/3rd follow-up message!
  if (messageId) {
    const dedupeKey = `${messageId}>${(recipientEmail || recipientName).toLowerCase()}`
    if (dispatchedMessageIds.has(dedupeKey)) {
      return { email: false, sms: false, skipped: "duplicate_message_id" }
    }
    dispatchedMessageIds.add(dedupeKey)
    if (dispatchedMessageIds.size > 2000) {
      const oldest = dispatchedMessageIds.values().next().value
      if (oldest) dispatchedMessageIds.delete(oldest)
    }
  }
  void bypassCooldown

  const wantEmail = process.env.DM_NOTIFY_EMAIL !== "0"
  const wantSms = process.env.DM_NOTIFY_SMS !== "0"
  const withTimeout = <T,>(p: Promise<T>, fallback: T) =>
    Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), 8500))]).catch(() => fallback)

  const [emailRes, sms] = await Promise.all([
    wantEmail && recipientEmail
      ? withTimeout(
          sendEmail({
            to: recipientEmail,
            senderName,
            senderEmail,
            senderHeadline,
            recipientName,
            text,
            subject,
            messageId,
            isExternalRecipient,
          }),
          { ok: false, error: "Email dispatch timed out" }
        )
      : Promise.resolve({ ok: false, error: "No recipient email provided" }),
    wantSms && recipientPhone
      ? withTimeout(sendSms(recipientPhone, senderName, text, recipientName), { ok: false, note: "timed out calling Twilio" })
      : Promise.resolve({ ok: false, note: "No phone number provided" }),
  ])
  return { email: emailRes.ok, emailError: emailRes.error, sms: sms.ok, smsNote: sms.note }
}
