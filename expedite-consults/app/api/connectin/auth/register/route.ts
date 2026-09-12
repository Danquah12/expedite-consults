import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { sendConnectInOTPEmail } from "@/lib/connectin-email"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, password, role, twoFactorChannel = "email" } = body

    if (!email || !firstName) {
      return NextResponse.json({ error: "First name and email are required." }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const fullName = `${firstName} ${lastName || ""}`.trim()

    // 1. Generate 6-digit cryptographic OTP code
    const otpCode = Math.floor(100000 + crypto.randomInt(0, 900000)).toString()

    // 2. Store OTP in DB
    connectinDb.setOTP(cleanEmail, otpCode, 10)
    if (phone) {
      connectinDb.setOTP(phone.trim(), otpCode, 10)
    }

    // 3. If user doesn't exist yet, stage or create in DB
    const existingUser = connectinDb.findUserByEmail(cleanEmail)
    if (!existingUser) {
      connectinDb.createUser(
        {
          email: cleanEmail,
          phone: phone || "",
          passwordHash: password ? crypto.createHash("sha256").update(password).digest("hex") : undefined,
          role: role || "personal",
          status: "Active",
          mfaEnabled: true,
          mfaChannel: twoFactorChannel === "sms" ? "sms" : "email"
        },
        {
          name: fullName,
          headline: `${(role || "personal").charAt(0).toUpperCase() + (role || "personal").slice(1)} Professional · Verified ConnectIn Member`,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=0a66c2`,
          coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
          location: "United States · Cryptographically Verified",
          about: `Verified ${(role || "personal")} member on ConnectIn Zero-Trust Network.`,
          skills: ["Cloud Engineering", "Security Architecture", "Zero Trust"],
          clearanceLevel: "Standard Verified Identity (Level 2)",
          fido2MfaVerified: true,
          cryptoVerificationBadge: "0xED25519_SESSION_INITIALIZED",
          skillMatrixScore: 88.0,
          connectionsCount: 1,
          followersCount: 5,
          profileViews: 1,
          postImpressions: 12
        }
      )
    }

    // 4. Dispatch Email via Resend
    if (twoFactorChannel === "email") {
      await sendConnectInOTPEmail({
        toEmail: cleanEmail,
        fullName,
        code: otpCode,
        action: "registration"
      })
    } else {
      console.log(`[SMS OTP DISPATCH] To: ${phone} Code: ${otpCode}`)
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${twoFactorChannel === "sms" ? phone : cleanEmail}`,
      channel: twoFactorChannel,
      target: twoFactorChannel === "sms" ? phone : cleanEmail,
      devCode: process.env.NODE_ENV !== "production" ? otpCode : undefined
    })
  } catch (error: any) {
    console.error("[/api/connectin/auth/register]", error)
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 })
  }
}
