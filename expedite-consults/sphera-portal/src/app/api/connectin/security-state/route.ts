import { NextRequest, NextResponse } from "next/server"
import { firebaseKvGetItem, firebaseKvSetItem } from "@/lib/connectin-firebase-kv"

const SECURITY_STATE_MAP = "connectln_security_state_v1"

export interface CloudPasskeyEntry {
  id: string
  label: string
  createdAtIso: string
}

export interface UserSecurityCloudState {
  passkeys: CloudPasskeyEntry[]
  revokedOAuthAppIds: string[]
  recoveryCodesGeneratedAtIso?: string
  updatedAtMs: number
}

function defaultSecurityState(): UserSecurityCloudState {
  return {
    passkeys: [],
    revokedOAuthAppIds: [],
    updatedAtMs: 0,
  }
}

function sanitizeUserKey(raw?: string | null): string {
  const clean = String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80)
  return clean ? `sec_${clean}` : "sec_guest"
}

function normalizeSecurityState(raw?: Partial<UserSecurityCloudState> | null): UserSecurityCloudState {
  const base = defaultSecurityState()
  if (!raw || typeof raw !== "object") return base
  const passkeys: CloudPasskeyEntry[] = Array.isArray(raw.passkeys)
    ? raw.passkeys
        .filter((p) => p && typeof p.id === "string" && p.id.trim())
        .slice(0, 20)
        .map((p) => ({
          id: String(p.id).trim().slice(0, 80),
          label: String(p.label || "WebAuthn Passkey").trim().slice(0, 80),
          createdAtIso: String(p.createdAtIso || new Date().toISOString()).slice(0, 40),
        }))
    : []
  const revokedOAuthAppIds = Array.isArray(raw.revokedOAuthAppIds)
    ? Array.from(new Set(raw.revokedOAuthAppIds.map((id) => String(id || "").trim()).filter(Boolean))).slice(0, 40)
    : []
  return {
    passkeys,
    revokedOAuthAppIds,
    ...(raw.recoveryCodesGeneratedAtIso
      ? { recoveryCodesGeneratedAtIso: String(raw.recoveryCodesGeneratedAtIso).slice(0, 40) }
      : {}),
    updatedAtMs: typeof raw.updatedAtMs === "number" ? raw.updatedAtMs : 0,
  }
}

export async function GET(req: NextRequest) {
  try {
    const userKey = sanitizeUserKey(req.nextUrl.searchParams.get("userKey"))
    const stored = await firebaseKvGetItem<UserSecurityCloudState>(SECURITY_STATE_MAP, userKey)
    const security = normalizeSecurityState(stored)
    return NextResponse.json({ ok: true, security })
  } catch (err) {
    console.error("[security-state GET] Error:", err)
    return NextResponse.json(
      { ok: false, security: defaultSecurityState(), error: "Failed to read security state" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userKey = sanitizeUserKey(body?.userKey)
    const patch = body?.patch && typeof body.patch === "object" ? body.patch : body || {}
    const existing = normalizeSecurityState(
      await firebaseKvGetItem<UserSecurityCloudState>(SECURITY_STATE_MAP, userKey)
    )
    const next = normalizeSecurityState({
      passkeys: patch.passkeys !== undefined ? patch.passkeys : existing.passkeys,
      revokedOAuthAppIds:
        patch.revokedOAuthAppIds !== undefined ? patch.revokedOAuthAppIds : existing.revokedOAuthAppIds,
      recoveryCodesGeneratedAtIso:
        patch.recoveryCodesGeneratedAtIso !== undefined
          ? patch.recoveryCodesGeneratedAtIso
          : existing.recoveryCodesGeneratedAtIso,
      updatedAtMs: Date.now(),
    })

    await firebaseKvSetItem(SECURITY_STATE_MAP, userKey, next)
    return NextResponse.json({ ok: true, security: next })
  } catch (err) {
    console.error("[security-state POST] Error:", err)
    return NextResponse.json({ ok: false, error: "Failed to persist security state" }, { status: 500 })
  }
}
