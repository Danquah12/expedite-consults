import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("connectin_session")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const session = connectinDb.findSessionByToken(token)
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = connectinDb.findUserById(session.userId)
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 404 })
    }

    const profile = connectinDb.findProfileByUserId(user.id)
    const activeSessions = connectinDb.getUserSessions(user.id)

    return NextResponse.json({
      authenticated: true,
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
        deviceName: session.deviceName,
        ipAddress: session.ipAddress,
        location: session.location,
        createdAt: session.createdAt
      },
      activeSessions
    })
  } catch (error: any) {
    console.error("[/api/connectin/auth/me]", error)
    return NextResponse.json({ error: "Session verification failed" }, { status: 500 })
  }
}
