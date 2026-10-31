import { NextRequest, NextResponse } from "next/server"
import {
  pullCloudActivityLogs,
  recordGlobalUserActivity,
  upsertCloudActivityItem
} from "@/lib/connectin-cloud-sync"

export async function GET() {
  try {
    const activityLogs = await pullCloudActivityLogs()
    return NextResponse.json({
      success: true,
      total: activityLogs.length,
      activityLogs
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

    // Support batch sync of local user activity logs from any client browser
    if (body && Array.isArray(body.batchActivities)) {
      const batch = body.batchActivities.filter((b: any) => b && b.actionType).slice(0, 25)
      await Promise.allSettled(batch.map((ev: any) => upsertCloudActivityItem(ev)))
      return NextResponse.json({
        success: true,
        syncedCount: batch.length
      })
    }

    if (!body || !body.actionType) {
      return NextResponse.json(
        { success: false, error: "actionType is required" },
        { status: 400 }
      )
    }

    const saved = await recordGlobalUserActivity(body)

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

