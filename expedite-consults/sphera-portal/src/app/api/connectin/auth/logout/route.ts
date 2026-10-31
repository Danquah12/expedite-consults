import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { recordGlobalUserActivity } from "@/lib/connectin-cloud-sync"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("connectin_session")?.value

    if (token) {
      const session = connectinDb.findSessionByToken(token)
      if (session) {
        const user = connectinDb.findUserById(session.userId)
        const profile = connectinDb.findProfileByUserId(session.userId)
        connectinDb.revokeSession(session.sessionId)
        if (user || profile) {
          await recordGlobalUserActivity({
            id: `act_logout_${session.userId}_${Date.now().toString().slice(-5)}`,
            userId: session.userId,
            userName: profile?.name || user?.email.split("@")[0] || "ConnectLn Member",
            userEmail: user?.email || "",
            userAvatar: profile?.avatar || "",
            userRole: String(user?.role || "personal").toUpperCase(),
            actionType: "USER_LOGOUT",
            actionLabel: "Signed Out of Session",
            category: "auth",
            targetTitle: session.deviceName || "ConnectLn Session",
            details: `Terminated authenticated session (${session.location || "Verified Enclave"})`,
            timestampIso: new Date().toISOString()
          }).catch(() => {})
        }
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
