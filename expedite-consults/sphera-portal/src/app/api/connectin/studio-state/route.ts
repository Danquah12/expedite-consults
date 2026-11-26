import { NextRequest, NextResponse } from "next/server"
import { firebaseKvGetItem, firebaseKvSetItem } from "@/lib/connectin-firebase-kv"

const STUDIO_STATE_MAP = "connectln_studio_state_v1"

const ALLOWED_MODULES = [
  "docs",
  "workbooks",
  "decks",
  "sign",
  "invoices",
  "ledger",
  "boards",
  "forms",
] as const

export type StudioCloudModuleName = (typeof ALLOWED_MODULES)[number]

function isAllowedModule(val: unknown): val is StudioCloudModuleName {
  return typeof val === "string" && (ALLOWED_MODULES as readonly string[]).includes(val)
}

function sanitizeUserKey(raw?: string | null): string {
  const clean = String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 72)
  return clean || "guest"
}

export async function GET(req: NextRequest) {
  try {
    const safeUserKey = sanitizeUserKey(req.nextUrl.searchParams.get("userKey"))
    const entries = await Promise.all(
      ALLOWED_MODULES.map(async (mod) => {
        const data = await firebaseKvGetItem<any>(STUDIO_STATE_MAP, `st_${safeUserKey}__${mod}`)
        return [mod, data] as const
      })
    )

    const modules: Record<string, any> = {}
    for (const [mod, data] of entries) {
      if (data !== null && data !== undefined) {
        modules[mod] = data
      }
    }

    return NextResponse.json({ ok: true, modules })
  } catch (err) {
    console.error("[studio-state GET] Error:", err)
    return NextResponse.json({ ok: false, modules: {}, error: "Failed to load studio state" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const safeUserKey = sanitizeUserKey(body?.userKey)
    const mod = body?.module
    if (!isAllowedModule(mod)) {
      return NextResponse.json({ ok: false, error: "Invalid studio module" }, { status: 400 })
    }

    const updatedAtMs = Date.now()
    await firebaseKvSetItem(STUDIO_STATE_MAP, `st_${safeUserKey}__${mod}`, body?.data ?? [])
    return NextResponse.json({ ok: true, module: mod, updatedAtMs })
  } catch (err) {
    console.error("[studio-state POST] Error:", err)
    return NextResponse.json({ ok: false, error: "Failed to persist studio state" }, { status: 500 })
  }
}
