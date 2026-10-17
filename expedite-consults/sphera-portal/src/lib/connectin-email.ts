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
      ? `ConnectLn Security: Your 2FA Verification Code is ${code}`
      : `Welcome to ConnectLn: Verify Your Account (${code})`

    const envFrom = (process.env.RESEND_FROM_EMAIL || process.env.RESEND_FORM_EMAIL || DEFAULT_FROM_EMAIL).trim()
    const fromAddress = envFrom.includes("<")
      ? envFrom
      : `ConnectLn Security <${envFrom}>`

    console.log(`[ConnectLn Email Dispatch] Sending to: ${toEmail} from: ${fromAddress} with code: ${code}`)

    const plainText = `Hello ${fullName},\n\nYour single-use ConnectLn ${isLogin ? "2FA sign-in" : "registration verification"} code is:\n\n${code}\n\nThis code will expire in 15 minutes.\n\n--\nConnectLn Security · Tickets, vouches, and real work\nExpedite Consults LLC · Zero-Trust Identity Infrastructure`

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
                <img src="https://connectln.vercel.app/brand/connectln-icon.png" width="64" height="64" alt="ConnectLn" style="display: block; border-radius: 16px;" />
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
    })

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
      : `ConnectLn Network <${envFrom}>`

    const subject = `${senderName} invited you to connect on ConnectLn`

    const plainText = `Hi there,\n\n${senderName} has invited you to join their trusted network on ConnectLn — Tickets, vouches, and real work.\n\n${personalMessage ? `Personal note from ${senderName}:\n"${personalMessage}"\n\n` : ""}Accept invitation & connect: ${inviteLink}\n\n--\nConnectLn Network · Tickets, vouches, and real work\nExpedite Consults LLC · Zero-Trust Identity Infrastructure`

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
            <span class="badge">🌐 Professional Network Invitation</span>
            <h2 class="greeting">${senderName} invited you to connect</h2>
            <p class="text">
              Expand your cryptographic 1st-degree professional network across enterprise teams, alumni, cloud engineers, trades &amp; defense specialists.
            </p>
            ${personalMessage ? `<div class="quote-box">"${personalMessage}"</div>` : ""}
            <div>
              <a href="${inviteLink}" class="btn" target="_blank">Accept Invitation &amp; Join Network →</a>
            </div>
            <p class="text" style="font-size: 11px; margin-bottom: 0;">
              Or copy and paste this link in your browser:<br/>
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

