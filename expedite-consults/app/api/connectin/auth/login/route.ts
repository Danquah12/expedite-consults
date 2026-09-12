import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { sendConnectInOTPEmail } from "@/lib/connectin-email"
import { sendConnectInSMS } from "@/lib/connectin-sms"
import { createAndStoreOTP } from "@/lib/connectin-otp"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, channel = "email" } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    let user = connectinDb.findUserByEmail(cleanEmail)

    if (!user) {
      const prefix = cleanEmail.split("@")[0] || ""
      const defaultName = prefix.includes(".") || prefix.includes("_") || prefix.includes("-")
        ? prefix.split(/[._-]/).filter(Boolean).map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
        : prefix.charAt(0).toUpperCase() + prefix.slice(1)

      const created = connectinDb.createUser(
        {
          email: cleanEmail,
          role: "personal",
          status: "Active",
          mfaEnabled: true,
          mfaChannel: "email"
        },
        {
          name: defaultName,
          headline: "Verified Professional · ConnectIn Member",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName + "-" + cleanEmail)}&backgroundColor=0a66c2`,
          coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
          location: "United States · Cryptographically Verified",
          about: "Verified member on ConnectIn Zero-Trust Network.",
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
      user = created.user
    }

    if (user.status === "Suspended" || user.status === "Banned") {
      return NextResponse.json({ error: "This account is suspended. Contact security administrator." }, { status: 403 })
    }

    const profile = connectinDb.findProfileByUserId(user.id)
    const fullName = profile?.name || cleanEmail.split("@")[0]

    // Generate deterministic & store 2FA code
    const otpCode = createAndStoreOTP(cleanEmail)
    if (user.phone) {
      connectinDb.setOTP(user.phone, otpCode, 15)
    }

    // Send 2FA code via selected channel
    if (channel === "sms" && user.phone) {
      await sendConnectInSMS({
        toPhone: user.phone,
        code: otpCode,
        fullName
      })
    } else {
      const emailRes = await sendConnectInOTPEmail({
        toEmail: cleanEmail,
        fullName,
        code: otpCode,
        action: "login_2fa"
      })
      if (!emailRes.success) {
        console.warn("[/api/connectin/auth/login] Email dispatch notice:", emailRes.error)
      }
    }

    return NextResponse.json({
      success: true,
      requires2FA: true,
      channel,
      target: channel === "sms" && user.phone ? user.phone : cleanEmail,
      message: `2FA security code dispatched via ${channel.toUpperCase()}`
    })
  } catch (error: any) {
    console.error("[/api/connectin/auth/login]", error)
    return NextResponse.json({ error: error.message || "Login challenge failed" }, { status: 500 })
  }
}
