import { NextRequest, NextResponse } from "next/server"
import { getRealtimeServer, getRealtimeConfig } from "@/lib/connectin-realtime"
import { connectinDb } from "@/lib/connectin-db"
import { refreshWhatsAppDirectoryCache, isSamePhoneOwnerEmail } from "@/lib/connectin-whatsapp-directory"

export const dynamic = "force-dynamic"

/** Public client config (lets the browser connect without rebuilding when keys change). */
export async function GET() {
  const cfg = getRealtimeConfig()
  return NextResponse.json({ enabled: cfg.enabled, key: cfg.key, cluster: cfg.cluster })
}

/**
 * Pusher private-channel authorization. A user may ONLY subscribe to
 * `private-ring-<digits>` for the phone number verified on their own signed-in account,
 * so nobody can eavesdrop on another member's incoming calls.
 */
export async function POST(req: NextRequest) {
  const server = getRealtimeServer()
  if (!server) return NextResponse.json({ error: "Realtime not configured" }, { status: 503 })

  const form = await req.formData().catch(() => null)
  const socketId = String(form?.get("socket_id") || "")
  const channel = String(form?.get("channel_name") || "")
  const m = channel.match(/^private-ring-(\d{7,15})$/)
  if (!socketId || !m) return NextResponse.json({ error: "Bad channel" }, { status: 403 })
  const wantDigits = m[1]

  const token = req.cookies.get("connectin_session")?.value
  const sess = token ? connectinDb.findSessionByToken(token) : null
  const user = sess ? connectinDb.findUserById(sess.userId) : undefined
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const ownDigits = new Set<string>()
  if (user.phone) ownDigits.add(String(user.phone).replace(/[^\d]/g, ""))
  try {
    const cache = await refreshWhatsAppDirectoryCache()
    for (const mbr of cache.values()) {
      if (mbr.verifiedBy2FA && mbr.email && isSamePhoneOwnerEmail(mbr.email, user.email)) {
        ownDigits.add(mbr.phone.replace(/[^\d]/g, ""))
      }
    }
  } catch {}

  if (!ownDigits.has(wantDigits)) {
    return NextResponse.json({ error: "Not your number" }, { status: 403 })
  }
  return NextResponse.json(server.authorizeChannel(socketId, channel))
}
