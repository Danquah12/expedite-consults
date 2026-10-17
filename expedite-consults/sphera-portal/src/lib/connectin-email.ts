import { Resend } from "resend"

const DEFAULT_FROM_EMAIL = "auth@expediteconsults.com"

function getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY || "").trim()
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
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
      ? `ConnectIn Security: Your 2FA Verification Code is ${code}`
      : `Welcome to ConnectIn: Verify Your Account (${code})`

    const envFrom = (process.env.RESEND_FROM_EMAIL || process.env.RESEND_FORM_EMAIL || DEFAULT_FROM_EMAIL).trim()
    const fromAddress = envFrom.includes("<")
      ? envFrom
      : `ConnectIn Security <${envFrom}>`

    console.log(`[ConnectIn Email Dispatch] Sending to: ${toEmail} from: ${fromAddress} with code: ${code}`)

    const plainText = `Hello ${fullName},\n\nYour single-use ConnectIn ${isLogin ? "2FA sign-in" : "registration verification"} code is:\n\n${code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this verification code, please ignore this email.\n\n--\nConnectIn Security\nExpedite Consults LLC · Zero-Trust Identity Infrastructure\nWashington DC · Baltimore · GovCloud Defense Enclaves`

    let { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toEmail.toLowerCase().trim()],
      replyTo: "auth@expediteconsults.com",
      subject,
      text: plainText,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 540px; margin: 30px auto; background: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; }
            .header { background: linear-gradient(135deg, #0A66C2 0%, #4338ca 100%); padding: 36px 24px; text-align: center; }
            .logo { font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: -1px; margin: 0; }
            .content { padding: 36px 28px; text-align: center; }
            .badge { display: inline-block; background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(52, 211, 153, 0.3); margin-bottom: 16px; }
            .greeting { font-size: 18px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; }
            .text { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #020617; border: 2px solid #0A66C2; border-radius: 16px; padding: 20px; margin: 0 auto 24px; display: inline-block; }
            .otp-code { font-size: 38px; font-weight: 900; color: #38bdf8; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; }
            .footer { border-top: 1px solid #1e293b; padding: 20px; text-align: center; font-size: 11px; color: #64748b; background: #020617; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">Connect<span style="color:#38bdf8;">In</span></h1>
              <p style="color: #e2e8f0; font-size: 12px; margin: 6px 0 0 0;">Autonomous AI-Powered Professional Network</p>
            </div>
            <div class="content">
              <span class="badge">🔒 Cryptographic Identity Verification</span>
              <h2 class="greeting">Hello, ${fullName}!</h2>
              <p class="text">
                ${isLogin ? "Enter the following single-use verification code to complete your two-factor sign in:" : "Thank you for registering on ConnectIn. Use the single-use 6-digit confirmation code below to verify your account:"}
              </p>
              
              <div class="otp-box">
                <span class="otp-code">${code}</span>
              </div>

              <p class="text" style="font-size: 11px;">
                This code is valid for <strong>15 minutes</strong>. If you did not initiate this request, please ignore this email.
              </p>
            </div>
            <div class="footer">
              <p style="margin:0 0 4px 0;">Expedite Consults LLC · 100% Zero-Trust Identity Infrastructure</p>
              <p style="margin:0;">Washington DC · Baltimore · GovCloud Defense Enclaves</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error("[ConnectIn Email Resend Error]", error)
      return { success: false, error: error.message || "Failed to dispatch email via Resend" }
    }

    console.log(`[ConnectIn Email Dispatched] Message ID: ${data?.id} to ${toEmail}`)
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
  senderName,
  personalMessage,
  inviteLink
}: {
  toEmail: string
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

    const envFrom = (process.env.RESEND_FROM_EMAIL || process.env.RESEND_FORM_EMAIL || DEFAULT_FROM_EMAIL).trim()
    const fromAddress = envFrom.includes("<")
      ? envFrom
      : `ConnectIn Network <${envFrom}>`

    const subject = `${senderName} invited you to connect on ConnectIn`

    const plainText = `Hi there,\n\n${senderName} has invited you to join their trusted network on ConnectIn — the zero-trust professional network for cloud, cybersecurity & enterprise architects.\n\n${personalMessage ? `Personal note from ${senderName}:\n"${personalMessage}"\n\n` : ""}Accept invitation & connect: ${inviteLink}\n\n--\nConnectIn Network\nExpedite Consults LLC · Zero-Trust Identity Infrastructure\nWashington DC · Baltimore · GovCloud Defense Enclaves`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 30px auto; background: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; }
          .header { background: linear-gradient(135deg, #0A66C2 0%, #4338ca 100%); padding: 36px 24px; text-align: center; }
          .logo { font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: -1px; margin: 0; }
          .content { padding: 36px 28px; text-align: center; }
          .badge { display: inline-block; background: rgba(56, 189, 248, 0.2); color: #38bdf8; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(56, 189, 248, 0.3); margin-bottom: 16px; }
          .greeting { font-size: 20px; font-weight: 800; color: #f8fafc; margin-bottom: 12px; }
          .text { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
          .quote-box { background: #020617; border-left: 4px solid #0A66C2; border-radius: 8px; padding: 16px; margin: 0 auto 24px; text-align: left; font-size: 12px; color: #e2e8f0; font-style: italic; }
          .btn { display: inline-block; background: linear-gradient(135deg, #0A66C2 0%, #2563eb 100%); color: #ffffff !important; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(10, 102, 194, 0.4); margin: 8px 0 24px 0; }
          .footer { border-top: 1px solid #1e293b; padding: 20px; text-align: center; font-size: 11px; color: #64748b; background: #020617; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Connect<span style="color:#38bdf8;">In</span></h1>
            <p style="color: #e2e8f0; font-size: 12px; margin: 6px 0 0 0;">Autonomous AI-Powered Professional Network</p>
          </div>
          <div class="content">
            <span class="badge">🌐 Professional Network Invitation</span>
            <h2 class="greeting">${senderName} invited you to connect</h2>
            <p class="text">
              Expand your cryptographic 1st-degree professional network across enterprise teams, alumni, cloud engineers, and defense specialists.
            </p>
            ${personalMessage ? `<div class="quote-box">"${personalMessage}"</div>` : ""}
            <div>
              <a href="${inviteLink}" class="btn" target="_blank">Accept Invitation &amp; Join Network →</a>
            </div>
            <p class="text" style="font-size: 11px; margin-bottom: 0;">
              Or copy and paste this link in your browser:<br/>
              <a href="${inviteLink}" style="color:#38bdf8; word-break: break-all;">${inviteLink}</a>
            </p>
          </div>
          <div class="footer">
            <p style="margin:0 0 4px 0;">Expedite Consults LLC · Zero-Trust Identity Infrastructure</p>
            <p style="margin:0;">Washington DC · Baltimore · GovCloud Defense Enclaves</p>
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

