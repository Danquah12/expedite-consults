import { NextRequest, NextResponse } from "next/server"
import {
  CategorizedNotificationItem,
  INITIAL_CATEGORIZED_NOTIFICATIONS
} from "@/lib/notifications-engine-data"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Noctis-Source",
}

// In-memory persistent alert buffer (stays hot across serverless invocations)
let inMemoryAlerts: CategorizedNotificationItem[] = [...INITIAL_CATEGORIZED_NOTIFICATIONS]

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(req: NextRequest) {
  try {
    const unreadCount = inMemoryAlerts.filter(a => a.unread).length

    return NextResponse.json(
      {
        success: true,
        count: inMemoryAlerts.length,
        unreadCount,
        alerts: inMemoryAlerts
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

    const newAlert: CategorizedNotificationItem = {
      id: `notif_noctis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
      timestamp: "Just now",
      unread: true,
      actionText,
      targetTab: targetTab as any,
      priority: priority as any,
      targetPayload: metadata ? JSON.stringify(metadata) : undefined
    }

    // Prepend to top so it's the very first item in the Alerts menu
    inMemoryAlerts.unshift(newAlert)

    return NextResponse.json(
      {
        success: true,
        message: "Alert delivered to ConnectIn Alert menu successfully.",
        unreadCount: inMemoryAlerts.filter(a => a.unread).length,
        alert: newAlert
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
