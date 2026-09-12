import { Resend } from "resend"
const resend = new Resend(process.env.RESEND_API_KEY)

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
}: SendOTPEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const isLogin = action === "login_2fa"
    const subject = isLogin
      ? `🔐 ConnectIn Security: Your 2FA Sign-In Code is ${code}`
      : `🚀 Welcome to ConnectIn: Verify Your Account (${code})`

    const fromAddress = process.env.RESEND_FORM_EMAIL || "ConnectIn Identity <onboarding@resend.dev>"

    console.log(`[ConnectIn Email Dispatch] Attempting send to: ${toEmail} using ${fromAddress}`)

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toEmail],
      subject,
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
                This code is valid for <strong>10 minutes</strong>. If you did not initiate this request, please ignore this email.
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
      console.error("[Resend Error]", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error("[sendConnectInOTPEmail]", err)
    return { success: false, error: err.message || "Failed to send OTP email" }
  }
}
