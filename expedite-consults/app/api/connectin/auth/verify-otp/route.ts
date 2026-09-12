import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { target, code } = body

    if (!target || !code) {
      return NextResponse.json({ error: "Target email/phone and 6-digit code are required." }, { status: 400 })
    }

    const cleanTarget = target.toLowerCase().trim()

    // 1. Verify OTP
    const isValid = connectinDb.verifyOTP(cleanTarget, code)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 401 })
    }

    // 2. Find user
    const user = connectinDb.findUserByEmail(cleanTarget)
    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 })
    }

    const profile = connectinDb.findProfileByUserId(user.id)

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

    // Set secure HTTP-only session cookie
    response.cookies.set("connectin_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return response
  } catch (error: any) {
    console.error("[/api/connectin/auth/verify-otp]", error)
    return NextResponse.json({ error: error.message || "OTP verification failed" }, { status: 500 })
  }
}
