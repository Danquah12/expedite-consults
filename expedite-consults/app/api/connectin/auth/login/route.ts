import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { sendConnectInOTPEmail } from "@/lib/connectin-email"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, channel = "email" } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = connectinDb.findUserByEmail(cleanEmail)

    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 })
    }

    if (user.status === "Suspended" || user.status === "Banned") {
      return NextResponse.json({ error: "This account is suspended. Contact security administrator." }, { status: 403 })
    }

    // Check password if set
    if (user.passwordHash && password) {
      const inputHash = crypto.createHash("sha256").update(password).digest("hex")
      if (inputHash !== user.passwordHash) {
        return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
      }
    }

    const profile = connectinDb.findProfileByUserId(user.id)
    const fullName = profile?.name || cleanEmail.split("@")[0]

    // Generate 2FA code
    const otpCode = Math.floor(100000 + crypto.randomInt(0, 900000)).toString()
    connectinDb.setOTP(cleanEmail, otpCode, 10)
    if (user.phone) {
      connectinDb.setOTP(user.phone, otpCode, 10)
    }

    // Send 2FA email via Resend
    if (channel === "email" || !user.phone) {
      await sendConnectInOTPEmail({
        toEmail: cleanEmail,
        fullName,
        code: otpCode,
        action: "login_2fa"
      })
    } else {
      console.log(`[SMS 2FA DISPATCH] To: ${user.phone} Code: ${otpCode}`)
    }

    return NextResponse.json({
      success: true,
      requires2FA: true,
      channel,
      target: channel === "sms" && user.phone ? user.phone : cleanEmail,
      message: `2FA code dispatched via ${channel.toUpperCase()}`,
      devCode: process.env.NODE_ENV !== "production" ? otpCode : undefined
    })
  } catch (error: any) {
    console.error("[/api/connectin/auth/login]", error)
    return NextResponse.json({ error: error.message || "Login challenge failed" }, { status: 500 })
  }
}
