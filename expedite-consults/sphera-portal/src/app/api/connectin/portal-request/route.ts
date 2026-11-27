import { NextRequest, NextResponse } from "next/server"
import { firebaseKvListItems, firebaseKvSetItem } from "@/lib/connectin-firebase-kv"
import { sendConnectLnPortalRequestEmail } from "@/lib/connectin-email"

const PORTAL_REQUESTS_MAP = "connectln_portal_requests_v1"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface PortalRequestRecord {
  id: string
  fullName: string
  email: string
  phoneOrOrg: string
  message: string
  sourcePage: string
  status: "new"
  createdAt: string
}

export async function GET() {
  try {
    const items = await firebaseKvListItems<PortalRequestRecord>(PORTAL_REQUESTS_MAP)
    const sorted = [...items]
      .sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0))
      .slice(0, 50)
      .map((item) => item.data)

    return NextResponse.json({
      ok: true,
      count: items.length,
      requests: sorted,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load portal requests." },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const fullName = String(body?.fullName || "").trim().slice(0, 120)
    const email = String(body?.email || "").trim().toLowerCase().slice(0, 160)
    const phoneOrOrg = String(body?.phoneOrOrg || "").trim().slice(0, 160)
    const message = String(body?.message || "").trim().slice(0, 1500)
    const sourcePage = String(body?.sourcePage || "/connectin").trim().slice(0, 120) || "/connectin"

    if (fullName.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Please enter your full name (at least 2 characters)." },
        { status: 400 }
      )
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid work or personal email address." },
        { status: 400 }
      )
    }

    const requestId = `REQ-${Date.now().toString(36).toUpperCase().slice(-6)}`
    const createdAt = new Date().toISOString()

    const record: PortalRequestRecord = {
      id: requestId,
      fullName,
      email,
      phoneOrOrg,
      message,
      sourcePage,
      status: "new",
      createdAt,
    }

    await firebaseKvSetItem(PORTAL_REQUESTS_MAP, record.id, record)

    let emailSent = false
    try {
      const emailRes = await sendConnectLnPortalRequestEmail({
        requestId: record.id,
        fullName: record.fullName,
        email: record.email,
        phoneOrOrg: record.phoneOrOrg,
        message: record.message,
        sourcePage: record.sourcePage,
        submittedAt: record.createdAt,
      })
      emailSent = Boolean(emailRes?.success)
    } catch {
      emailSent = false
    }

    return NextResponse.json({
      ok: true,
      requestId: record.id,
      emailSent,
      record,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to submit portal request." },
      { status: 500 }
    )
  }
}
