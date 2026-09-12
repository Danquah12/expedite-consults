import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("connectin_session")?.value

    if (token) {
      const session = connectinDb.findSessionByToken(token)
      if (session) {
        connectinDb.revokeSession(session.sessionId)
      }
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." })
    response.cookies.delete("connectin_session")
    return response
  } catch (error: any) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
