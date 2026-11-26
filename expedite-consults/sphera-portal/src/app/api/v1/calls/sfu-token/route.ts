import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"
export const revalidate = 0

function base64UrlJson(obj: Record<string, any>): string {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function signLiveKitJwt(params: {
  apiKey: string
  apiSecret: string
  roomName: string
  identity: string
  displayName: string
  canPublish?: boolean
}): string {
  const nowSec = Math.floor(Date.now() / 1000)
  const header = base64UrlJson({ alg: "HS256", typ: "JWT" })
  const payload = base64UrlJson({
    iss: params.apiKey,
    sub: params.identity,
    name: params.displayName,
    nbf: nowSec - 10,
    exp: nowSec + 7200,
    jti: crypto.randomUUID(),
    video: {
      roomJoin: true,
      room: params.roomName,
      canPublish: params.canPublish !== false,
      canSubscribe: true,
      canPublishData: true,
    },
  })
  const signingInput = `${header}.${payload}`
  const sig = crypto
    .createHmac("sha256", params.apiSecret)
    .update(signingInput)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
  return `${signingInput}.${sig}`
}

function getSfuAndTurnStatus() {
  const apiKey = (process.env.LIVEKIT_API_KEY || "").trim()
  const apiSecret = (process.env.LIVEKIT_API_SECRET || "").trim()
  const wsUrl = (process.env.LIVEKIT_URL || "").trim()
  const coturnUrls = (process.env.COTURN_URLS || "").trim()
  const coturnSecret = (process.env.COTURN_STATIC_AUTH_SECRET || "").trim()

  const sfuConfigured = Boolean(apiKey && apiSecret && wsUrl)
  const coturnConfigured = Boolean(coturnUrls && coturnSecret)
  return {
    sfuConfigured,
    coturnConfigured,
    wsUrl: sfuConfigured ? wsUrl : null,
    mode: sfuConfigured ? "livekit_sfu" : "webrtc_mesh_turn",
    hasApiCreds: Boolean(apiKey && apiSecret),
  }
}

export async function GET() {
  const status = getSfuAndTurnStatus()
  return NextResponse.json({
    ok: true,
    mode: status.mode,
    sfuConfigured: status.sfuConfigured,
    coturnConfigured: status.coturnConfigured,
    wsUrl: status.wsUrl,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const roomName = String(body?.roomName || "").trim() || "connectln_room"
    const identity = String(body?.identity || "").trim() || `user_${Date.now()}`
    const displayName = String(body?.displayName || identity).trim()

    const status = getSfuAndTurnStatus()
    if (!status.sfuConfigured) {
      return NextResponse.json({
        ok: true,
        mode: "webrtc_mesh_turn",
        sfuConfigured: false,
        coturnConfigured: status.coturnConfigured,
        wsUrl: null,
        token: null,
      })
    }

    const token = signLiveKitJwt({
      apiKey: process.env.LIVEKIT_API_KEY!.trim(),
      apiSecret: process.env.LIVEKIT_API_SECRET!.trim(),
      roomName,
      identity,
      displayName,
      canPublish: true,
    })

    return NextResponse.json({
      ok: true,
      mode: "livekit_sfu",
      sfuConfigured: true,
      coturnConfigured: status.coturnConfigured,
      wsUrl: status.wsUrl,
      token,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to generate SFU room token" },
      { status: 500 }
    )
  }
}
