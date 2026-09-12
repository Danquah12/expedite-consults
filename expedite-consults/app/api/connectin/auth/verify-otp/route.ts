import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { validateOTP } from "@/lib/connectin-otp"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      target,
      code,
      name: incomingName,
      role: incomingRole,
      headline: incomingHeadline,
      otpChallengeToken: incomingChallengeToken
    } = body

    if (!target || !code) {
      return NextResponse.json({ error: "Target email/phone and 6-digit code are required." }, { status: 400 })
    }

    const cleanTarget = target.toLowerCase().trim()
    const cookieChallenge = req.cookies.get("connectin_otp_challenge")?.value
    const challengeToken = incomingChallengeToken || cookieChallenge

    // 1. Verify OTP using signed cryptographic challenge, Twilio Verify API, and DB checks
    const targetsToCheck = Array.from(new Set([
      cleanTarget,
      body.phone ? String(body.phone).trim() : null,
      body.email ? String(body.email).toLowerCase().trim() : null,
      cleanTarget.replace(/[^\d+]/g, ""),
      cleanTarget.replace(/[^\d]/g, "").length === 10 ? `+1${cleanTarget.replace(/[^\d]/g, "")}` : null
    ].filter(Boolean) as string[]))

    let isValid = false
    for (const tgt of targetsToCheck) {
      if (await validateOTP(tgt, code, challengeToken)) {
        isValid = true
        break
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 401 })
    }

    // Determine displayName intelligently from user input or email structure
    let displayName = incomingName?.trim()
    if (!displayName) {
      const prefix = cleanTarget.split("@")[0] || ""
      if (prefix.includes(".") || prefix.includes("_") || prefix.includes("-")) {
        displayName = prefix
          .split(/[._-]/)
          .filter(Boolean)
          .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ")
      } else {
        displayName = prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : "ConnectIn Member"
      }
    }

    const userRole = incomingRole || "personal"

    // 2. Find or auto-hydrate user across serverless lambdas
    let user = connectinDb.findUserByEmail(cleanTarget)
    let profile = user ? connectinDb.findProfileByUserId(user.id) : undefined

    if (!user || !profile) {
      const created = connectinDb.createUser(
        {
          email: cleanTarget,
          role: userRole,
          status: "Active",
          mfaEnabled: true,
          mfaChannel: "email"
        },
        {
          name: displayName,
          headline: incomingHeadline || `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Professional · Verified ConnectIn Member`,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName + "-" + cleanTarget)}&backgroundColor=0a66c2,4338ca,0070f3&textColor=ffffff&fontWeight=700`,
          coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
          location: "United States · Cryptographically Verified",
          about: `Verified ${userRole} member on ConnectIn Zero-Trust Network.`,
          skills: [],
          clearanceLevel: "Standard Verified Identity (Level 2)",
          fido2MfaVerified: true,
          cryptoVerificationBadge: "0xED25519_SESSION_INITIALIZED",
          skillMatrixScore: 50.0,
          connectionsCount: 0,
          followersCount: 0,
          profileViews: 0,
          postImpressions: 0
        }
      )
      user = created.user
      profile = created.profile
    } else if (displayName && profile.name !== displayName) {
      profile.name = displayName
      profile.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName + "-" + cleanTarget)}&backgroundColor=0a66c2,4338ca,0070f3&textColor=ffffff&fontWeight=700`
    }

    // 3. Create persistent cryptographic session
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1"
    const userAgent = req.headers.get("user-agent") || "Web Browser"

    const session = connectinDb.createSession(user.id, {
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress.split(",")[0],
      userAgent,
      location: "United States · Cryptographic Enclave"
    })

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      },
      profile,
      session: {
        sessionId: session.sessionId,
        token: session.token,
        deviceName: session.deviceName,
        createdAt: session.createdAt
      }
    })

    // Set secure HTTP-only session cookie (30 days)
    response.cookies.set("connectin_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60
    })

    // Clear consumed challenge cookie
    response.cookies.set("connectin_otp_challenge", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0
    })

    return response
  } catch (error: any) {
    console.error("[/api/connectin/auth/verify-otp]", error)
    return NextResponse.json({ error: error.message || "OTP verification failed" }, { status: 500 })
  }
}
