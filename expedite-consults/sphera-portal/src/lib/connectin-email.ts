import { Resend } from "resend"

const DEFAULT_FROM_EMAIL = "auth@expediteconsults.com"

function getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY || "").trim()
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

function resolveResendFromAddress(senderLabel: string): string {
  const envFrom = (
    process.env.RESEND_FROM_EMAIL ||
    process.env.RESEND_FROM ||
    process.env.RESEND_FORM_EMAIL ||
    DEFAULT_FROM_EMAIL
  ).trim()
  const cleanAddr = envFrom.includes("<")
    ? (envFrom.match(/<([^>]+)>/)?.[1] || DEFAULT_FROM_EMAIL).trim()
    : envFrom
  const safeAddr =
    cleanAddr && !cleanAddr.toLowerCase().includes("resend.dev")
      ? cleanAddr
      : DEFAULT_FROM_EMAIL
  return `${senderLabel} <${safeAddr}>`
}

interface SendOTPEmailParams {
  toEmail: string
  fullName: string
  code: string
  action: "registration" | "login_2fa"
}

export async function sendConnectInOTPEmail({
  toEmail,
  fullName,
  code,
  action
}: SendOTPEmailParams): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const resend = getResendClient()
    if (!resend) {
      const err = "RESEND_API_KEY is not configured in environment variables."
      console.warn(`[ConnectIn Email Dispatch] ${err}`)
      return { success: false, error: err }
    }

    const isLogin = action === "login_2fa"
    const subject = isLogin
      ? `ConnectLn Security: Your 2FA Verification Code is ${code}`
      : `Welcome to ConnectLn: Verify Your Account (${code})`

    const fromAddress = resolveResendFromAddress("ConnectLn Security")

    console.log(`[ConnectLn Email Dispatch] Sending 2FA email to: ${toEmail} from: ${fromAddress}`)

    const plainText = `Hello ${fullName},\n\nYour single-use ConnectLn ${isLogin ? "2FA sign-in" : "registration verification"} code is:\n\n${code}\n\nThis code will expire in 15 minutes.\n\n--\nConnectLn Security · Tickets, vouches, and real work\nExpedite Consults LLC · Zero-Trust Identity Infrastructure`

    const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0b0a; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 540px; margin: 30px auto; background: #181716; border-radius: 24px; border: 1px solid #2e2b26; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .header { background: #121110; padding: 32px 24px; text-align: center; border-bottom: 2px solid #262420; }
            .content { padding: 36px 28px; text-align: center; }
            .badge { display: inline-block; background: rgba(166, 69, 50, 0.15); color: #e06c58; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(166, 69, 50, 0.3); margin-bottom: 16px; }
            .greeting { font-size: 18px; font-weight: 700; color: #f2ede4; margin-bottom: 8px; }
            .text { font-size: 13px; color: #a8a196; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #0c0b0a; border: 2px solid #a64532; border-radius: 16px; padding: 20px; margin: 0 auto 24px; display: inline-block; box-shadow: 0 0 20px rgba(166, 69, 50, 0.15); }
            .otp-code { font-size: 38px; font-weight: 900; color: #f2ede4; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; }
            .footer { border-top: 1px solid #262420; padding: 20px; text-align: center; font-size: 11px; color: #787268; background: #121110; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="margin: 0 auto 12px auto; width: 64px; height: 64px; border-radius: 16px; overflow: hidden; display: inline-block; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
                <img src="https://conectln.com/brand/connectln-icon.png" width="64" height="64" alt="ConnectLn" style="display: block; border-radius: 16px;" />
              </div>
              <div style="font-size: 28px; font-weight: 900; color: #f2ede4; letter-spacing: -0.5px; line-height: 1.1;">
                Connect<span style="color:#f2ede4;">L</span>n
              </div>
              <div style="height: 2px; width: 64px; background: #a64532; margin: 6px auto 8px auto; border-radius: 2px;"></div>
              <p style="color: #9c9589; font-size: 11px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.5px;">Tickets, vouches, and real work</p>
            </div>
            <div class="content">
              <span class="badge">🔒 Cryptographic Identity Verification</span>
              <h2 class="greeting">Hello, ${fullName}!</h2>
              <p class="text">
                ${isLogin ? "Enter the following single-use verification code to complete your two-factor sign in:" : "Thank you for registering on ConnectLn. Use the single-use 6-digit confirmation code below to verify your account:"}
              </p>
              
              <div class="otp-box">
                <span class="otp-code">${code}</span>
              </div>

              <p class="text" style="font-size: 11px;">
                This code is valid for <strong>15 minutes</strong>. If you did not initiate this request, please ignore this email.
              </p>
            </div>
            <div class="footer">
              <p style="margin:0 0 4px 0;">ConnectLn · Tickets, vouches, and real work</p>
              <p style="margin:0;">Expedite Consults LLC · Zero-Trust Identity Infrastructure</p>
            </div>
          </div>
        </body>
        </html>
      `

    let { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toEmail.toLowerCase().trim()],
      replyTo: DEFAULT_FROM_EMAIL,
      subject,
      text: plainText,
      html: htmlBody
    })

    if (error && !fromAddress.toLowerCase().includes(DEFAULT_FROM_EMAIL)) {
      console.warn(`[ConnectLn Email Retry] Custom from (${fromAddress}) failed (${error.message}); retrying with ${DEFAULT_FROM_EMAIL}`)
      const retryRes = await resend.emails.send({
        from: `ConnectLn Security <${DEFAULT_FROM_EMAIL}>`,
        to: [toEmail.toLowerCase().trim()],
        replyTo: DEFAULT_FROM_EMAIL,
        subject,
        text: plainText,
        html: htmlBody
      })
      data = retryRes.data
      error = retryRes.error
    }

    if (error) {
      console.error("[ConnectLn Email Resend Error]", error)
      return { success: false, error: error.message || "Failed to dispatch email via Resend" }
    }

    console.log(`[ConnectLn Email Dispatched] Message ID: ${data?.id} to ${toEmail}`)
    return { success: true, id: data?.id }
  } catch (err: any) {
    console.error("[sendConnectInOTPEmail]", err)
    return { success: false, error: err.message || "Failed to send OTP email" }
  }
}

/**
 * Send branded out-of-band email invitations via Resend
 */
export async function sendConnectInInviteEmail({
  toEmail,
  recipientName,
  senderName,
  personalMessage,
  inviteLink
}: {
  toEmail: string
  recipientName?: string
  senderName: string
  personalMessage?: string
  inviteLink: string
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const resend = getResendClient()
    if (!resend) {
      const err = "RESEND_API_KEY is not configured in environment variables."
      console.warn(`[sendConnectInInviteEmail] ${err}`)
      return { success: false, error: err }
    }

    const fromAddress = resolveResendFromAddress("ConnectLn Network")

    const cleanRecipientName = (recipientName || "").trim()
    const subject = cleanRecipientName
      ? `${cleanRecipientName}, ${senderName} invited you to connect on ConnectLn`
      : `${senderName} invited you to connect on ConnectLn`

    const plainText = `Hi ${cleanRecipientName || "there"},\n\n${senderName} has invited you to join their trusted network on ConnectLn — Tickets, vouches, and real work.\n\n${personalMessage ? `Personal note from ${senderName}:\n"${personalMessage}"\n\n` : ""}Accept invitation & create your ConnectLn profile: ${inviteLink}\n\n--\nConnectLn Network · Tickets, vouches, and real work\nExpedite Consults LLC · Zero-Trust Identity Infrastructure`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0b0a; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 30px auto; background: #181716; border-radius: 24px; border: 1px solid #2e2b26; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { background: #121110; padding: 32px 24px; text-align: center; border-bottom: 2px solid #262420; }
          .content { padding: 36px 28px; text-align: center; }
          .badge { display: inline-block; background: rgba(166, 69, 50, 0.15); color: #e06c58; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(166, 69, 50, 0.3); margin-bottom: 16px; }
          .greeting { font-size: 20px; font-weight: 800; color: #f2ede4; margin-bottom: 12px; }
          .text { font-size: 13px; color: #a8a196; line-height: 1.6; margin-bottom: 24px; }
          .quote-box { background: #0c0b0a; border-left: 4px solid #a64532; border-radius: 8px; padding: 16px; margin: 0 auto 24px; text-align: left; font-size: 12px; color: #e2e8f0; font-style: italic; }
          .btn { display: inline-block; background: #a64532; color: #ffffff !important; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(166, 69, 50, 0.4); margin: 8px 0 24px 0; }
          .footer { border-top: 1px solid #262420; padding: 20px; text-align: center; font-size: 11px; color: #787268; background: #121110; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="margin: 0 auto 12px auto; width: 64px; height: 64px; border-radius: 16px; overflow: hidden; display: inline-block; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
              <img src="https://connectln.vercel.app/brand/connectln-icon.png" width="64" height="64" alt="ConnectLn" style="display: block; border-radius: 16px;" />
            </div>
            <div style="font-size: 28px; font-weight: 900; color: #f2ede4; letter-spacing: -0.5px; line-height: 1.1;">
              Connect<span style="color:#f2ede4;">L</span>n
            </div>
            <div style="height: 2px; width: 64px; background: #a64532; margin: 6px auto 8px auto; border-radius: 2px;"></div>
            <p style="color: #9c9589; font-size: 11px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.5px;">Tickets, vouches, and real work</p>
          </div>
          <div class="content">
            <span class="badge">🌐 Personal Network Invitation</span>
            <h2 class="greeting">${cleanRecipientName ? `Hi ${cleanRecipientName}, ${senderName} invited you to connect` : `${senderName} invited you to connect`}</h2>
            <p class="text">
              Join ConnectLn under your own profile and connect directly with <strong>${senderName}</strong> across enterprise teams, alumni, cloud engineers, trades &amp; defense specialists.
            </p>
            ${personalMessage ? `<div class="quote-box">"${personalMessage}"</div>` : ""}
            <div>
              <a href="${inviteLink}" class="btn" target="_blank">${cleanRecipientName ? `Join as ${cleanRecipientName} &amp; Connect →` : `Accept Invitation &amp; Join Network →`}</a>
            </div>
            <p class="text" style="font-size: 11px; margin-bottom: 0;">
              Or copy and paste this personal invitation link in your browser:<br/>
              <a href="${inviteLink}" style="color:#e06c58; word-break: break-all;">${inviteLink}</a>
            </p>
          </div>
          <div class="footer">
            <p style="margin:0 0 4px 0;">ConnectLn · Tickets, vouches, and real work</p>
            <p style="margin:0;">Expedite Consults LLC · Zero-Trust Identity Infrastructure</p>
          </div>
        </div>
      </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toEmail.toLowerCase().trim()],
      replyTo: "auth@expediteconsults.com",
      subject,
      text: plainText,
      html: htmlContent
    })

    if (error) {
      console.error("[ConnectIn Invite Email Resend Error]", error)
      return { success: false, error: error.message || "Failed to dispatch email via Resend" }
    }

    console.log(`[ConnectIn Invite Email Dispatched] To: ${toEmail} ID: ${data?.id}`)
    return { success: true, id: data?.id }
  } catch (err: any) {
    console.error("[sendConnectInInviteEmail Exception]", err)
    return { success: false, error: err.message || "Email dispatch failed" }
  }
}

export const EXPEDITE_ADMIN_NOTIFICATION_EMAILS = [
  "kasiedu@expedite-consults.com",
  "kasiedu@expediteconsults.com",
  "kwesi.asiedu@expediteconsults.com",
] as const

const EMAIL_FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escapeEmailHtml(val: string): string {
  return String(val || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildRecipientList(extraEmails: Array<string | undefined>): string[] {
  const unique = new Set<string>(EXPEDITE_ADMIN_NOTIFICATION_EMAILS.map((e) => e.toLowerCase()))
  for (const raw of extraEmails) {
    const clean = String(raw || "").trim().toLowerCase()
    if (
      clean &&
      EMAIL_FORMAT_RE.test(clean) &&
      !clean.endsWith(".conectln.com") &&
      !clean.endsWith("@connectin.app") &&
      !clean.endsWith("@conectln.com")
    ) {
      unique.add(clean)
    }
  }
  return Array.from(unique)
}

export async function sendBusinessBookingQuoteEmail(params: {
  referenceId: string
  businessName: string
  ownerName?: string
  ownerEmail?: string
  serviceTitle: string
  customerName: string
  customerContact: string
  customerLocation?: string
  projectScope: string
  preferredDate: string
  estimatedBudget?: string
}): Promise<{ success: boolean; sentTo: string[]; id?: string; error?: string }> {
  const recipientEmails = buildRecipientList([params.ownerEmail, params.customerContact])
  try {
    const resend = getResendClient()
    if (!resend) {
      const err = "RESEND_API_KEY is not configured in environment variables."
      console.warn(`[sendBusinessBookingQuoteEmail] ${err}`)
      return { success: false, sentTo: recipientEmails, error: err }
    }

    const fromAddress = resolveResendFromAddress("ConnectLn Business Desk")
    const timestampIso = new Date().toISOString()
    const subject = `New Booking & Quote Request (${params.referenceId}) — ${params.serviceTitle} | ${params.businessName}`

    const plainText = [
      `CONNECTLN OFFICIAL BOOKING & QUOTE REQUEST (${params.referenceId})`,
      `Business Name: ${params.businessName}`,
      `Owner / Practice Lead: ${params.ownerName || "Business Owner"}`,
      `Customer Name / Organization: ${params.customerName}`,
      `Customer Email / Phone: ${params.customerContact}`,
      `Requested Service / Product: ${params.serviceTitle}`,
      `Preferred Date / Timing: ${params.preferredDate}`,
      `Estimated Budget: ${params.estimatedBudget || "Requesting Itemized Quote"}`,
      `Service Coverage / Location: ${params.customerLocation || "Service Area"}`,
      `Project Scope / Appointment Details:\n${params.projectScope}`,
      `Submitted UTC: ${timestampIso}`,
    ].join("\n")

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;padding:18px;background:#faf8f5;border:1px solid #e5ddd0;border-radius:14px;color:#18181b;">
        <div style="background:#181411;color:#fff;padding:16px 20px;border-radius:10px 10px 0 0;border-bottom:3px solid #92400e;">
          <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#fbbf24;">Direct Booking &amp; Free Estimate Receipt</div>
          <h2 style="margin:6px 0 0;font-size:19px;">${escapeEmailHtml(params.businessName)}</h2>
        </div>
        <div style="background:#ffffff;padding:20px;border-radius:0 0 10px 10px;border:1px solid #e5ddd0;border-top:none;">
          <p style="font-size:14px;margin:0 0 14px;">A new booking &amp; quote request (<strong>#${escapeEmailHtml(params.referenceId)}</strong>) has been submitted on ConnectLn.</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;background:#f8fafc;border-radius:8px;">
            <tr><td style="padding:8px 12px;font-weight:700;width:190px;">Confirmation Reference:</td><td style="padding:8px 12px;font-family:monospace;">#${escapeEmailHtml(params.referenceId)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:700;">Customer / Org:</td><td style="padding:8px 12px;">${escapeEmailHtml(params.customerName)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:700;">Email / Phone:</td><td style="padding:8px 12px;">${escapeEmailHtml(params.customerContact)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:700;">Requested Service:</td><td style="padding:8px 12px;">${escapeEmailHtml(params.serviceTitle)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:700;">Preferred Date:</td><td style="padding:8px 12px;">${escapeEmailHtml(params.preferredDate)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:700;">Service Location:</td><td style="padding:8px 12px;">${escapeEmailHtml(params.customerLocation || "Standard Service Coverage")}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:700;">Submitted UTC:</td><td style="padding:8px 12px;font-family:monospace;">${escapeEmailHtml(timestampIso)}</td></tr>
          </table>
          <div style="margin-top:14px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#92400e;margin-bottom:4px;">Project Scope / Appointment Details</div>
            <p style="margin:0;font-size:13px;line-height:1.5;white-space:pre-wrap;">${escapeEmailHtml(params.projectScope)}</p>
          </div>
          <p style="margin:14px 0 0;font-size:11px;color:#71717a;">Delivered by ConnectLn Business &amp; Expedite Consults Notification Desk.</p>
        </div>
      </div>
    `

    const replyToValid = EMAIL_FORMAT_RE.test(params.customerContact.trim())
      ? params.customerContact.trim().toLowerCase()
      : "auth@expediteconsults.com"

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipientEmails,
      replyTo: replyToValid,
      subject,
      text: plainText,
      html,
    })

    if (error) {
      console.error("[sendBusinessBookingQuoteEmail Resend Error]", error)
      return { success: false, sentTo: recipientEmails, error: error.message || "Failed to send booking email" }
    }

    return { success: true, sentTo: recipientEmails, id: data?.id }
  } catch (err: any) {
    console.error("[sendBusinessBookingQuoteEmail Exception]", err)
    return { success: false, sentTo: recipientEmails, error: err?.message || "Email dispatch failed" }
  }
}

export async function sendNoctisJobApplicationEmail(params: {
  confirmationId: string
  deliveryMode: "direct_connectln_ats" | "external_portal_handoff"
  recruiterEmail?: string
  auditHashSha256: string
  submittedAt: string
  jobTitle: string
  company: string
  location: string
  salaryRange: string
  targetAtsHost: string
  applicantName: string
  applicantEmail: string
  applicantHeadline: string
  resumeFileName: string
  primarySkill: string
  noctisCoverBrief: string
  employerResponse: string
}): Promise<{ success: boolean; sentTo: string[]; id?: string; error?: string }> {
  const isDirectAts = params.deliveryMode === "direct_connectln_ats"
  const recipientEmails = buildRecipientList(
    isDirectAts ? [params.recruiterEmail, params.applicantEmail] : [params.applicantEmail]
  )
  try {
    const resend = getResendClient()
    if (!resend) {
      const err = "RESEND_API_KEY is not configured in environment variables."
      console.warn(`[sendNoctisJobApplicationEmail] ${err}`)
      return { success: false, sentTo: recipientEmails, error: err }
    }

    const fromAddress = resolveResendFromAddress("Noctis Autonomous Career Agent")
    const subject = isDirectAts
      ? `Direct ConnectLn ATS Application (${params.confirmationId}) — ${params.jobTitle} at ${params.company}`
      : `Noctis™ Packet Prepared & Portal Handoff (${params.confirmationId}) — ${params.jobTitle} at ${params.company}`
    const heading = isDirectAts
      ? "🤖 Direct ConnectLn ATS Application Delivered"
      : "🚀 Noctis™ Application Packet Prepared & External Portal Launched"
    const cleanApplicantEmail = String(params.applicantEmail || "").trim().toLowerCase()
    const replyTo = EMAIL_FORMAT_RE.test(cleanApplicantEmail)
      ? cleanApplicantEmail
      : "auth@expediteconsults.com"

    const plainText = [
      heading,
      params.employerResponse,
      `Delivery Tier: ${isDirectAts ? "Tier 1 — Direct ConnectLn & Employer Email ATS" : "Tier 2 — Noctis Packet Prep & External Employer Portal Handoff"}`,
      `Confirmation ID: ${params.confirmationId}`,
      `Role: ${params.jobTitle}`,
      `Employer / ATS Host: ${params.company} (${params.targetAtsHost})`,
      ...(params.recruiterEmail ? [`Employer Recruiting Inbox: ${params.recruiterEmail}`] : []),
      `Applicant: ${params.applicantName} (${params.applicantHeadline})`,
      `Location & Compensation: ${params.location} · ${params.salaryRange}`,
      `Resume File: ${params.resumeFileName}`,
      `Verified Skill Fit: ${params.primarySkill}`,
      `UTC Timestamp: ${params.submittedAt}`,
      `SHA-256 Audit Hash: ${params.auditHashSha256}`,
      params.noctisCoverBrief ? `\nNoctis Cover Brief:\n${params.noctisCoverBrief}` : "",
    ].join("\n")

    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e4e4e7;border-radius:12px;">
      <h2 style="color:#0A66C2;margin:0 0 8px;">${heading}</h2>
      <p style="font-size:14px;color:#18181b;margin:0 0 16px;">${escapeEmailHtml(params.employerResponse)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:12px;background:#f4f4f5;border-radius:8px;padding:12px;">
        <tr><td style="padding:6px 10px;font-weight:bold;">Delivery Mode:</td><td style="padding:6px 10px;">${isDirectAts ? "Tier 1 · Direct ConnectLn ATS &amp; Recruiter Inbox" : "Tier 2 · Noctis Packet Prepared + External Portal Handoff"}</td></tr>
        <tr><td style="padding:6px 10px;font-weight:bold;">Confirmation ID:</td><td style="padding:6px 10px;">${escapeEmailHtml(params.confirmationId)}</td></tr>
        <tr><td style="padding:6px 10px;font-weight:bold;">Role:</td><td style="padding:6px 10px;">${escapeEmailHtml(params.jobTitle)}</td></tr>
        <tr><td style="padding:6px 10px;font-weight:bold;">Employer / ATS Host:</td><td style="padding:6px 10px;">${escapeEmailHtml(params.company)} (${escapeEmailHtml(params.targetAtsHost)})</td></tr>
        ${params.recruiterEmail ? `<tr><td style="padding:6px 10px;font-weight:bold;">Employer Inbox:</td><td style="padding:6px 10px;">${escapeEmailHtml(params.recruiterEmail)}</td></tr>` : ""}
        <tr><td style="padding:6px 10px;font-weight:bold;">Applicant:</td><td style="padding:6px 10px;">${escapeEmailHtml(params.applicantName)} · ${escapeEmailHtml(params.applicantHeadline)}</td></tr>
        <tr><td style="padding:6px 10px;font-weight:bold;">Resume File:</td><td style="padding:6px 10px;">${escapeEmailHtml(params.resumeFileName)}</td></tr>
        <tr><td style="padding:6px 10px;font-weight:bold;">Verified Fit:</td><td style="padding:6px 10px;">${escapeEmailHtml(params.primarySkill)}</td></tr>
        <tr><td style="padding:6px 10px;font-weight:bold;">UTC Timestamp:</td><td style="padding:6px 10px;">${escapeEmailHtml(params.submittedAt)}</td></tr>
        <tr><td style="padding:6px 10px;font-weight:bold;">SHA-256 Audit Hash:</td><td style="padding:6px 10px;font-family:monospace;word-break:break-all;">${escapeEmailHtml(params.auditHashSha256)}</td></tr>
      </table>
      ${params.noctisCoverBrief ? `<div style="margin-top:16px;padding:12px;background:#eef6ff;border-radius:8px;font-size:12px;"><strong>Noctis™ Cover Brief:</strong><pre style="white-space:pre-wrap;font-family:inherit;margin:6px 0 0;">${escapeEmailHtml(params.noctisCoverBrief)}</pre></div>` : ""}
    </div>`

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipientEmails,
      replyTo,
      subject,
      text: plainText,
      html,
    })

    if (error) {
      console.error("[sendNoctisJobApplicationEmail Resend Error]", error)
      return { success: false, sentTo: recipientEmails, error: error.message || "Failed to send job application receipt" }
    }

    return { success: true, sentTo: recipientEmails, id: data?.id }
  } catch (err: any) {
    console.error("[sendNoctisJobApplicationEmail Exception]", err)
    return { success: false, sentTo: recipientEmails, error: err?.message || "Email dispatch failed" }
  }
}

export interface SendConnectLnPortalRequestParams {
  requestId: string
  fullName: string
  email: string
  phoneOrOrg?: string
  message?: string
  sourcePage?: string
  submittedAt: string
}

/**
 * Notify ConnectLn administrators and send confirmation receipt when a visitor submits
 * a consultation or portal request from the bottom portal CTA.
 */
export async function sendConnectLnPortalRequestEmail(
  params: SendConnectLnPortalRequestParams
): Promise<{ success: boolean; sentTo: string[]; id?: string; error?: string }> {
  const recipientEmails = buildRecipientList([params.email])
  try {
    const resend = getResendClient()
    if (!resend) {
      return {
        success: false,
        sentTo: recipientEmails,
        error: "RESEND_API_KEY is not configured.",
      }
    }

    const fromAddress = resolveResendFromAddress("ConnectLn Portal Requests")
    const cleanEmail = String(params.email || "").trim().toLowerCase()
    const replyTo = EMAIL_FORMAT_RE.test(cleanEmail) ? cleanEmail : DEFAULT_FROM_EMAIL
    const subject = `[ConnectLn Portal Request ${params.requestId}] ${params.fullName}`

    const plainText = [
      "New ConnectLn Portal Consultation & Request Submission",
      `Request ID: ${params.requestId}`,
      `Full Name: ${params.fullName}`,
      `Email: ${cleanEmail}`,
      `Phone / Organization: ${params.phoneOrOrg || "Not provided"}`,
      `Source Page: ${params.sourcePage || "/connectin"}`,
      `Submitted At (UTC): ${params.submittedAt}`,
      "",
      "Request Details:",
      params.message || "General consultation / onboarding request.",
    ].join("\n")

    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #d1fae5;border-radius:16px;background:#ffffff;">
      <div style="background:#041E14;color:#ffffff;padding:20px 24px;border-radius:12px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6ee7b7;">ConnectLn Portal Request</p>
        <h2 style="margin:0;font-size:20px;font-weight:800;">Consultation &amp; Support Request Received</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;background:#f4f7f5;border-radius:10px;overflow:hidden;">
        <tr><td style="padding:8px 12px;font-weight:700;color:#064e3b;">Reference ID:</td><td style="padding:8px 12px;font-family:monospace;">${escapeEmailHtml(params.requestId)}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:700;color:#064e3b;">Full Name:</td><td style="padding:8px 12px;">${escapeEmailHtml(params.fullName)}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:700;color:#064e3b;">Email:</td><td style="padding:8px 12px;">${escapeEmailHtml(cleanEmail)}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:700;color:#064e3b;">Phone / Org:</td><td style="padding:8px 12px;">${escapeEmailHtml(params.phoneOrOrg || "Not provided")}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:700;color:#064e3b;">Source:</td><td style="padding:8px 12px;">${escapeEmailHtml(params.sourcePage || "/connectin")}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:700;color:#064e3b;">UTC Timestamp:</td><td style="padding:8px 12px;">${escapeEmailHtml(params.submittedAt)}</td></tr>
      </table>
      <div style="margin-top:16px;padding:14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;font-size:13px;color:#064e3b;">
        <strong>Request Details:</strong>
        <p style="margin:6px 0 0;white-space:pre-wrap;">${escapeEmailHtml(params.message || "General consultation / onboarding request.")}</p>
      </div>
    </div>`

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipientEmails,
      replyTo,
      subject,
      text: plainText,
      html,
    })

    if (error) {
      console.error("[sendConnectLnPortalRequestEmail Resend Error]", error)
      return {
        success: false,
        sentTo: recipientEmails,
        error: error.message || "Failed to dispatch portal request email",
      }
    }

    return { success: true, sentTo: recipientEmails, id: data?.id }
  } catch (err: any) {
    console.error("[sendConnectLnPortalRequestEmail Exception]", err)
    return {
      success: false,
      sentTo: recipientEmails,
      error: err?.message || "Portal request email dispatch failed",
    }
  }
}

export interface SendConnectLnSecurityAlertParams {
  toEmail: string
  firstName: string
  subject: string
  headline: string
  summaryText: string
  locationDisplay: string
  deviceDisplay: string
  timestampDisplay: string
  mapImageUrl: string
  profiles: string[]
  notMeUrl: string
  checkEmailUrl: string
}

/**
 * Send Meta-style ConnectLn security alert email (e.g. password change, phone change, passkey added)
 * featuring a regional geo map card, metadata rows, connected ConnectLn profiles,
 * full-width "This wasn't me" lockdown CTA, and "Visit the Help Center to confirm" link.
 */
export async function sendConnectLnSecurityAlertEmail(
  params: SendConnectLnSecurityAlertParams
): Promise<{ success: boolean; error?: string; id?: string }> {
  const cleanEmail = String(params.toEmail || "").trim().toLowerCase()
  if (
    !cleanEmail ||
    !EMAIL_FORMAT_RE.test(cleanEmail) ||
    cleanEmail.endsWith(".conectln.com") ||
    cleanEmail.endsWith("@conectln.com") ||
    cleanEmail.endsWith("@connectin.app") ||
    cleanEmail.endsWith("@connectin.phone")
  ) {
    return { success: false, error: "Skipped synthetic or non-deliverable email address." }
  }

  try {
    const resend = getResendClient()
    if (!resend) {
      const err = "RESEND_API_KEY is not configured in environment variables."
      console.warn(`[sendConnectLnSecurityAlertEmail] ${err}`)
      return { success: false, error: err }
    }

    const fromAddress = resolveResendFromAddress("ConnectLn Security")
    const firstName = escapeEmailHtml(params.firstName || "there")
    const headline = escapeEmailHtml(params.headline)
    const summaryText = escapeEmailHtml(params.summaryText)
    const locationDisplay = escapeEmailHtml(params.locationDisplay)
    const deviceDisplay = escapeEmailHtml(params.deviceDisplay)
    const timestampDisplay = escapeEmailHtml(params.timestampDisplay)
    const mapImageUrl = escapeEmailHtml(params.mapImageUrl)
    const notMeUrl = escapeEmailHtml(params.notMeUrl)
    const checkEmailUrl = escapeEmailHtml(params.checkEmailUrl)
    const escapedEmail = escapeEmailHtml(cleanEmail)

    const profilesHtml = params.profiles
      .map((p) => `<li style="margin:0 0 6px 0;color:#1c1e21;font-size:15px;line-height:1.45;">${escapeEmailHtml(p)}</li>`)
      .join("")

    const plainText = [
      params.headline,
      "",
      `Hi ${params.firstName || "there"},`,
      "",
      params.summaryText,
      "",
      "Was this you?",
      `- Location: ${params.locationDisplay}`,
      `- Device: ${params.deviceDisplay}`,
      `- Time: ${params.timestampDisplay}`,
      "",
      "Profiles in this account:",
      ...params.profiles.map((p) => `* ${p}`),
      "",
      `This wasn't me (Lock account & review): ${params.notMeUrl}`,
      "",
      "If this was you, you can ignore this email.",
      "",
      "Thanks,",
      "ConnectLn Security",
      "",
      `Wondering if this email is really from us? Visit the Help Center to confirm: ${params.checkEmailUrl}`,
      "",
      `This message was sent to ${cleanEmail}.`,
      "Expedite Consults LLC · ConnectLn Security Support · Laurel, MD 20707",
      "To help keep your profile secure, please don't forward this email.",
    ].join("\n")

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1e21;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:28px 16px 40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;text-align:left;background-color:#ffffff;">
          <tr>
            <td style="padding:0 0 22px 0;">
              <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:700;color:#1c1e21;letter-spacing:-0.02em;">${headline}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 16px 0;font-size:15px;line-height:1.5;color:#1c1e21;">
              Hi ${firstName},
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 26px 0;font-size:15px;line-height:1.5;color:#1c1e21;">
              ${summaryText}
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 12px 0;font-size:15px;font-weight:700;color:#1c1e21;">
              Was this you?
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e4e6eb;border-radius:12px;background-color:#ffffff;">
                <tr>
                  <td style="padding:14px;">
                    <img src="${mapImageUrl}" alt="Location map for ${locationDisplay}" width="510" style="width:100%;max-width:532px;height:auto;border-radius:10px;display:block;border:0;margin-bottom:14px;" />
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:15px;line-height:1.45;color:#1c1e21;">
                      <tr>
                        <td width="30" valign="top" style="padding:5px 8px 6px 2px;font-size:16px;color:#1c1e21;">&#128205;</td>
                        <td valign="top" style="padding:5px 0 6px 0;font-size:15px;color:#1c1e21;">${locationDisplay}</td>
                      </tr>
                      <tr>
                        <td width="30" valign="top" style="padding:5px 8px 6px 2px;font-size:16px;color:#1c1e21;">&#128187;</td>
                        <td valign="top" style="padding:5px 0 6px 0;font-size:15px;color:#1c1e21;">${deviceDisplay}</td>
                      </tr>
                      <tr>
                        <td width="30" valign="top" style="padding:5px 8px 2px 2px;font-size:16px;color:#1c1e21;">&#128338;</td>
                        <td valign="top" style="padding:5px 0 2px 0;font-size:15px;color:#1c1e21;">${timestampDisplay}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 8px 0;font-size:15px;color:#1c1e21;">
              Profiles in this account:
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 22px 0;">
              <ul style="margin:0;padding:0 0 0 20px;">
                ${profilesHtml}
              </ul>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px 0;">
              <a href="${notMeUrl}" target="_blank" style="display:block;width:100%;background-color:#0064E0;color:#ffffff;text-align:center;font-size:15px;font-weight:700;padding:13px 20px;border-radius:8px;text-decoration:none;box-sizing:border-box;">This wasn't me</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 22px 0;font-size:15px;line-height:1.5;color:#1c1e21;">
              If this was you, you can ignore this email.
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 22px 0;font-size:15px;line-height:1.5;color:#1c1e21;">
              Thanks,<br />ConnectLn Security
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 22px 0;font-size:15px;line-height:1.5;color:#65676b;">
              Wondering if this email is really from us? Visit the Help Center to confirm:<br />
              <a href="${checkEmailUrl}" target="_blank" style="color:#0064E0;text-decoration:none;word-break:break-all;">conectln.com/help/check-email</a>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 0 0 0;border-top:1px solid #e4e6eb;font-size:11px;line-height:1.55;color:#8a8d91;">
              This message was sent to <a href="mailto:${escapedEmail}" style="color:#0064E0;text-decoration:none;">${escapedEmail}</a>.<br />
              Expedite Consults LLC, Attention: ConnectLn Security Support, Laurel, MD 20707<br />
              To help keep your profile secure, please don't forward this email. <a href="${checkEmailUrl}" target="_blank" style="color:#0064E0;text-decoration:none;">Learn more</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    let { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [cleanEmail],
      replyTo: DEFAULT_FROM_EMAIL,
      subject: params.subject,
      text: plainText,
      html,
    })

    if (error && !fromAddress.toLowerCase().includes(DEFAULT_FROM_EMAIL)) {
      const retryRes = await resend.emails.send({
        from: `ConnectLn Security <${DEFAULT_FROM_EMAIL}>`,
        to: [cleanEmail],
        replyTo: DEFAULT_FROM_EMAIL,
        subject: params.subject,
        text: plainText,
        html,
      })
      data = retryRes.data
      error = retryRes.error
    }

    if (error) {
      console.error("[sendConnectLnSecurityAlertEmail Resend Error]", error)
      return { success: false, error: error.message || "Failed to send security alert email" }
    }

    return { success: true, id: data?.id }
  } catch (err: any) {
    console.error("[sendConnectLnSecurityAlertEmail Exception]", err)
    return { success: false, error: err?.message || "Security alert email dispatch failed" }
  }
}

