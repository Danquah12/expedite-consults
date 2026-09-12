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
    response.cookies.delete("authjs.session-token")
    response.cookies.delete("__Secure-authjs.session-token")
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("__Secure-next-auth.session-token")
    response.cookies.delete("authjs.csrf-token")
    response.cookies.delete("__Host-authjs.csrf-token")
    return response
  } catch (error: any) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
