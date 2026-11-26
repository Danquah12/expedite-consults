import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import {
  firebaseKvGetItem,
  firebaseKvSetItem,
} from "@/lib/connectin-firebase-kv"

export const dynamic = "force-dynamic"
export const revalidate = 0

const COMM_STATE_MAP = "connectln_comm_pro_state_v1"
const E2EE_PUBKEY_MAP = "connectln_e2ee_pubkeys_v1"
const PAIR_TOKEN_MAP = "connectln_device_pair_v1"

function normalizeKey(raw?: string): string {
  return String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9+@._-]/g, "")
    .trim()
}

interface StoredCommState {
  privacy?: Record<string, any>
  linkedDevices?: Array<{
    id: string
    name: string
    platform: string
    location: string
    lastActiveIso: string
    isCurrent?: boolean
  }>
  updatedAtIso: string
}

interface StoredPublicKeyEntry {
  key: string
  publicJwk: Record<string, any>
  fingerprint: string
  updatedAtIso: string
}

interface StoredPairToken {
  token: string
  shortCode: string
  ownerUserKey: string
  ownerName: string
  status: "pending" | "approved"
  device?: {
    id: string
    name: string
    platform: string
    location: string
    lastActiveIso: string
  }
  createdAtIso: string
  expiresAtMs: number
}

export async function GET(req: NextRequest) {
  try {
    const pubkeyParam = req.nextUrl.searchParams.get("pubkey")
    if (pubkeyParam) {
      const keys = pubkeyParam
        .split(",")
        .map((k) => normalizeKey(k))
        .filter(Boolean)
      for (const k of keys) {
        const entry = await firebaseKvGetItem<StoredPublicKeyEntry>(E2EE_PUBKEY_MAP, k)
        if (entry?.publicJwk) {
          return NextResponse.json({
            ok: true,
            found: true,
            key: entry.key,
            publicJwk: entry.publicJwk,
            fingerprint: entry.fingerprint,
            updatedAtIso: entry.updatedAtIso,
          })
        }
      }
      return NextResponse.json({ ok: true, found: false })
    }

    const pairTokenParam = req.nextUrl.searchParams.get("pairToken")
    if (pairTokenParam) {
      const cleanToken = String(pairTokenParam).trim()
      const pairing = await firebaseKvGetItem<StoredPairToken>(PAIR_TOKEN_MAP, cleanToken)
      if (!pairing) {
        return NextResponse.json({
          ok: true,
          pairing: { token: cleanToken, status: "expired" },
        })
      }
      const isExpired = Date.now() > pairing.expiresAtMs && pairing.status !== "approved"
      return NextResponse.json({
        ok: true,
        pairing: {
          ...pairing,
          status: isExpired ? "expired" : pairing.status,
        },
      })
    }

    const userKeyRaw = req.nextUrl.searchParams.get("userKey") || ""
    const userKey = normalizeKey(userKeyRaw)
    if (!userKey) {
      return NextResponse.json({ ok: false, error: "Missing userKey" }, { status: 400 })
    }

    const [state, pubkey] = await Promise.all([
      firebaseKvGetItem<StoredCommState>(COMM_STATE_MAP, userKey),
      firebaseKvGetItem<StoredPublicKeyEntry>(E2EE_PUBKEY_MAP, userKey),
    ])

    return NextResponse.json({
      ok: true,
      userKey,
      state: state || null,
      linkedDevices: state?.linkedDevices || [],
      e2eePublicKey: pubkey || null,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load comm state" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = String(body?.action || "sync_state")

    if (action === "sync_state") {
      const userKey = normalizeKey(body?.userKey)
      if (!userKey) {
        return NextResponse.json({ ok: false, error: "Missing userKey" }, { status: 400 })
      }
      const existing = (await firebaseKvGetItem<StoredCommState>(COMM_STATE_MAP, userKey)) || {
        updatedAtIso: new Date().toISOString(),
      }
      const nextPrivacy =
        body?.privacy && typeof body.privacy === "object"
          ? { ...(existing.privacy || {}), ...body.privacy }
          : existing.privacy || {}

      const nextDevices = Array.isArray(body?.linkedDevices)
        ? body.linkedDevices
        : existing.linkedDevices || []

      const nextState: StoredCommState = {
        privacy: nextPrivacy,
        linkedDevices: nextDevices,
        updatedAtIso: new Date().toISOString(),
      }
      await firebaseKvSetItem(COMM_STATE_MAP, userKey, nextState)

      if (body?.e2eePublicJwk && body?.e2eeFingerprint) {
        const aliases: string[] = Array.isArray(body?.aliases)
          ? body.aliases.map((a: string) => normalizeKey(a)).filter(Boolean)
          : []
        const keysToPublish = Array.from(new Set([userKey, ...aliases]))
        const entry: StoredPublicKeyEntry = {
          key: userKey,
          publicJwk: body.e2eePublicJwk,
          fingerprint: String(body.e2eeFingerprint),
          updatedAtIso: new Date().toISOString(),
        }
        await Promise.all(
          keysToPublish.map((k) => firebaseKvSetItem(E2EE_PUBKEY_MAP, k, entry))
        )
      }

      return NextResponse.json({ ok: true, state: nextState })
    }

    if (action === "create_pair_token") {
      const ownerUserKey = normalizeKey(body?.userKey)
      if (!ownerUserKey) {
        return NextResponse.json({ ok: false, error: "Missing userKey" }, { status: 400 })
      }
      const token = `pair_${crypto.randomBytes(6).toString("hex")}`
      const shortCode = crypto.randomBytes(3).toString("hex").toUpperCase()
      const expiresAtMs = Date.now() + 300 * 1000
      const rec: StoredPairToken = {
        token,
        shortCode,
        ownerUserKey,
        ownerName: String(body?.ownerName || ownerUserKey).trim(),
        status: "pending",
        createdAtIso: new Date().toISOString(),
        expiresAtMs,
      }
      await Promise.all([
        firebaseKvSetItem(PAIR_TOKEN_MAP, token, rec, 300),
        firebaseKvSetItem(PAIR_TOKEN_MAP, `code_${shortCode}`, rec, 300),
      ])

      return NextResponse.json({
        ok: true,
        token,
        shortCode,
        expiresAtMs,
        pairUrl: `https://conectln.com/connectin?pairDevice=${encodeURIComponent(token)}`,
      })
    }

    if (action === "approve_pair_token") {
      const rawInput = String(body?.token || body?.shortCode || "").trim()
      if (!rawInput) {
        return NextResponse.json({ ok: false, error: "Missing pairing token or code" }, { status: 400 })
      }
      let rec = await firebaseKvGetItem<StoredPairToken>(PAIR_TOKEN_MAP, rawInput)
      if (!rec) {
        rec = await firebaseKvGetItem<StoredPairToken>(
          PAIR_TOKEN_MAP,
          `code_${rawInput.toUpperCase()}`
        )
      }
      if (!rec || Date.now() > rec.expiresAtMs) {
        return NextResponse.json(
          { ok: false, error: "Pairing QR / code expired. Generate a fresh QR code." },
          { status: 410 }
        )
      }

      const device = {
        id: `dev_${Date.now()}`,
        name: String(body?.deviceName || "Paired ConnectLn Browser").trim(),
        platform: String(body?.platform || "Web / Companion Device").trim(),
        location: String(body?.location || "Encrypted Session").trim(),
        lastActiveIso: new Date().toISOString(),
        isCurrent: false,
      }

      const ownerState = (await firebaseKvGetItem<StoredCommState>(
        COMM_STATE_MAP,
        rec.ownerUserKey
      )) || {
        updatedAtIso: new Date().toISOString(),
      }
      const prevDevices = Array.isArray(ownerState.linkedDevices) ? ownerState.linkedDevices : []
      const nextState: StoredCommState = {
        ...ownerState,
        linkedDevices: [device, ...prevDevices.filter((d) => d.id !== device.id)].slice(0, 12),
        updatedAtIso: new Date().toISOString(),
      }
      const updatedRec: StoredPairToken = {
        ...rec,
        status: "approved",
        device,
      }

      await Promise.all([
        firebaseKvSetItem(COMM_STATE_MAP, rec.ownerUserKey, nextState),
        firebaseKvSetItem(PAIR_TOKEN_MAP, rec.token, updatedRec, 300),
        firebaseKvSetItem(PAIR_TOKEN_MAP, `code_${rec.shortCode}`, updatedRec, 300),
      ])

      return NextResponse.json({
        ok: true,
        device,
        ownerUserKey: rec.ownerUserKey,
        ownerName: rec.ownerName,
      })
    }

    if (action === "revoke_device") {
      const userKey = normalizeKey(body?.userKey)
      const deviceId = String(body?.deviceId || "").trim()
      if (!userKey || !deviceId) {
        return NextResponse.json({ ok: false, error: "Missing userKey or deviceId" }, { status: 400 })
      }
      const existing = await firebaseKvGetItem<StoredCommState>(COMM_STATE_MAP, userKey)
      const nextDevices = (existing?.linkedDevices || []).filter((d) => d.id !== deviceId)
      await firebaseKvSetItem(COMM_STATE_MAP, userKey, {
        ...(existing || {}),
        linkedDevices: nextDevices,
        updatedAtIso: new Date().toISOString(),
      })
      return NextResponse.json({ ok: true, linkedDevices: nextDevices })
    }

    return NextResponse.json({ ok: false, error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to update comm state" },
      { status: 500 }
    )
  }
}
