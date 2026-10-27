import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { appendCloudTelemetry, fetchCloudTelemetry } from "@/lib/connectin-cloud-sync"

export async function GET() {
  try {
    const [cloud, localLogs] = await Promise.all([
      fetchCloudTelemetry(),
      Promise.resolve(connectinDb.getActivityLogs())
    ])
    const actMap = new Map<string, any>()
    ;[...(cloud.activityLogs || []), ...localLogs].forEach(ev => {
      if (ev && ev.id && !actMap.has(ev.id)) actMap.set(ev.id, ev)
    })
    return NextResponse.json({
      success: true,
      activityLogs: Array.from(actMap.values())
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load activity logs" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || !body.actionType) {
      return NextResponse.json(
        { success: false, error: "actionType is required" },
        { status: 400 }
      )
    }

    const saved = connectinDb.recordActivity({
      ...body,
      id: body.id || `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      timestampIso: body.timestampIso || new Date().toISOString()
    })

    await appendCloudTelemetry({ activityLog: saved })

    return NextResponse.json({
      success: true,
      event: saved
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record activity" },
      { status: 500 }
    )
  }
}

