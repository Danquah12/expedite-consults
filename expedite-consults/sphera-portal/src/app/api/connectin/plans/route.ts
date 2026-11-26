import { NextRequest, NextResponse } from "next/server"
import { firebaseKvGetItem, firebaseKvSetItem } from "@/lib/connectin-firebase-kv"

const PLANS_BILLING_MAP = "connectln_plans_billing_v1"

export interface UserPlanRecord {
  planId: string
  planName: string
  audience: "individual" | "business"
  billingCycle: "yearly" | "monthly"
  seats: number
  status: "active" | "trialing" | "enterprise_requested"
  updatedAtMs: number
  enterpriseNote?: string
}

function defaultPlanRecord(): UserPlanRecord {
  return {
    planId: "free",
    planName: "ConnectLn Free",
    audience: "individual",
    billingCycle: "yearly",
    seats: 1,
    status: "active",
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
  return clean ? `pln_${clean}` : "pln_guest"
}

function normalizePlan(raw?: Partial<UserPlanRecord> | null): UserPlanRecord {
  const base = defaultPlanRecord()
  if (!raw || typeof raw !== "object") return base
  const audience = raw.audience === "business" ? "business" : "individual"
  const billingCycle = raw.billingCycle === "monthly" ? "monthly" : "yearly"
  const seatsNum = Number(raw.seats)
  const seats = Number.isFinite(seatsNum) ? Math.min(500, Math.max(1, Math.round(seatsNum))) : 1
  const status =
    raw.status === "trialing" || raw.status === "enterprise_requested" ? raw.status : "active"
  return {
    planId: String(raw.planId || base.planId).trim().slice(0, 60) || base.planId,
    planName: String(raw.planName || base.planName).trim().slice(0, 80) || base.planName,
    audience,
    billingCycle,
    seats,
    status,
    updatedAtMs: typeof raw.updatedAtMs === "number" ? raw.updatedAtMs : 0,
    ...(raw.enterpriseNote ? { enterpriseNote: String(raw.enterpriseNote).trim().slice(0, 500) } : {}),
  }
}

export async function GET(req: NextRequest) {
  try {
    const userKey = sanitizeUserKey(req.nextUrl.searchParams.get("userKey"))
    const stored = await firebaseKvGetItem<UserPlanRecord>(PLANS_BILLING_MAP, userKey)
    const plan = normalizePlan(stored)
    return NextResponse.json({ ok: true, plan })
  } catch (err) {
    console.error("[plans GET] Error:", err)
    return NextResponse.json({ ok: false, plan: defaultPlanRecord(), error: "Failed to read plan state" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userKey = sanitizeUserKey(body?.userKey)
    const existing = normalizePlan(await firebaseKvGetItem<UserPlanRecord>(PLANS_BILLING_MAP, userKey))
    const next = normalizePlan({
      planId: body?.planId ?? existing.planId,
      planName: body?.planName ?? existing.planName,
      audience: body?.audience ?? existing.audience,
      billingCycle: body?.billingCycle ?? existing.billingCycle,
      seats: body?.seats ?? existing.seats,
      status: body?.status ?? existing.status,
      enterpriseNote: body?.enterpriseNote,
      updatedAtMs: Date.now(),
    })

    await firebaseKvSetItem(PLANS_BILLING_MAP, userKey, next)
    return NextResponse.json({ ok: true, plan: next })
  } catch (err) {
    console.error("[plans POST] Error:", err)
    return NextResponse.json({ ok: false, error: "Failed to save plan state" }, { status: 500 })
  }
}
