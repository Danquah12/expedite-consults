import { NextRequest, NextResponse } from "next/server"
import { getOrSync24HourLearningVideos } from "@/lib/connectln-learning-video-sync"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const force = searchParams.get("force") === "1"

    const result = await getOrSync24HourLearningVideos({
      forceSync: force,
      triggeredBy: force ? "learning-tab-manual-or-24h-sync" : "learning-tab-auto-check",
    })

    return NextResponse.json(
      {
        ok: true,
        syncedLessons: result.lessons,
        addedCount: result.addedCount,
        meta: result.meta,
        mongoConnected: result.mongoConnected,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  } catch (err: any) {
    console.error("[GET /api/connectin/learning-videos] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load 24h Learning video sync" },
      { status: 500 }
    )
  }
}
