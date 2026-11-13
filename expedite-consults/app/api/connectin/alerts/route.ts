import { NextRequest, NextResponse } from "next/server"
import { connectinNotificationsStore } from "@/lib/connectin-notifications-store"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Noctis-Key",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(req: NextRequest) {
  try {
    const alerts = connectinNotificationsStore.getAll()
    const unreadCount = connectinNotificationsStore.getUnreadCount()

    return NextResponse.json(
      {
        success: true,
        count: alerts.length,
        unreadCount,
        alerts
      },
      { headers: CORS_HEADERS }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve ConnectIn alerts" },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      description,
      category = "Security",
      subType = "Security Advisory",
      actor,
      actionText = "Inspect Invariant Telemetry",
      targetTab = "pulserooms",
      priority = "critical",
      metadata
    } = body

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required 'title' or 'description'" },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const createdAlert = connectinNotificationsStore.addAlert({
      category: category as any,
      subType: subType as any,
      title,
      description,
      actor: actor || {
        name: "Noctis Frontier & Benchmark Engine",
        role: "Autonomous Invariant Engine",
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
        isVerified: true
      },
      actionText,
      targetTab: targetTab as any,
      priority: priority as any,
      targetPayload: metadata ? JSON.stringify(metadata) : undefined
    })

    return NextResponse.json(
      {
        success: true,
        message: "Alert delivered to ConnectIn Alert menu successfully.",
        unreadCount: connectinNotificationsStore.getUnreadCount(),
        alert: createdAlert
      },
      { status: 201, headers: CORS_HEADERS }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch alert to ConnectIn" },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
