import { NextRequest, NextResponse } from "next/server"
import {
  HarvesterDestination,
  computeHarvesterTelemetry,
  dedupeHarvestedItems,
  normalizeExclusiveDestinations,
} from "@/lib/connectin-media-harvester"
import {
  getOrRunAdditive24HourVideoArchive,
  appendCustomAdminItemToArchive,
  updateArchivedItemDestinations,
  formatRelativePublishedLabel,
} from "@/lib/connectin-live-video-sync"

export const dynamic = "force-dynamic"
export const revalidate = 0

let MANUAL_ROTATION_STEP = 0

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const force = searchParams.get("force") === "1" || searchParams.get("autoTick") === "1"

    const archive = await getOrRunAdditive24HourVideoArchive({
      forceSync: force,
      triggeredBy: force ? "client-24h-or-manual-sync" : "auto-24h-check",
    })

    const telemetry = computeHarvesterTelemetry(archive.items)
    return NextResponse.json(
      {
        ...telemetry,
        syncCadenceHours: 24,
        mode: "additive_preserve_all_existing",
        totalArchivedCount: archive.items.length,
        lastAddedCount: archive.meta.lastAddedCount,
        lastDailySyncIso: archive.meta.lastDailySyncIso,
        nextScheduledSyncIso: archive.meta.nextScheduledSyncIso,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    )
  } catch (err: any) {
    console.error("[media-harvester GET] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load media archive" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = body.action || "pull_now"

    if (action === "pull_now") {
      const count = Math.min(12, Math.max(1, Number(body.count) || 6))
      const requestedDestinations: HarvesterDestination[] =
        Array.isArray(body.destinations) && body.destinations.length > 0
          ? body.destinations
          : ["home", "jobs", "market", "media", "pulse"]
      const excludeYoutubeIds = new Set<string>(
        Array.isArray(body.excludeYoutubeIds)
          ? body.excludeYoutubeIds.map((id: unknown) => String(id || "").trim())
          : []
      )

      // Run additive sync — appends any newly published videos without deleting any older videos
      const archive = await getOrRunAdditive24HourVideoArchive({
        forceSync: true,
        triggeredBy: "manual-or-scheduled-pull",
      })

      const unseenFirst = [
        ...archive.items.filter((i) => !i.youtubeId || !excludeYoutubeIds.has(i.youtubeId)),
        ...archive.items.filter((i) => i.youtubeId && excludeYoutubeIds.has(i.youtubeId)),
      ]

      const pullOffset = ((MANUAL_ROTATION_STEP++) * 2) % Math.max(1, unseenFirst.length)
      const rotated = [
        ...unseenFirst.slice(pullOffset),
        ...unseenFirst.slice(0, pullOffset),
      ]

      const newlyPulled = rotated.slice(0, count).map((item) => {
        const partitionedDests = normalizeExclusiveDestinations(item)
        return {
          ...item,
          destinations:
            partitionedDests.length > 0
              ? partitionedDests
              : requestedDestinations,
          pulledAtLabel: formatRelativePublishedLabel(item.pulledAtIso),
        }
      })

      // Strictly additive: all existing archived videos remain intact
      const mergedAll = dedupeHarvestedItems([...newlyPulled, ...archive.items])
      const telemetry = computeHarvesterTelemetry(mergedAll)

      return NextResponse.json({
        ok: true,
        mode: "additive_preserve_all_existing",
        addedToArchiveCount: archive.addedItems.length,
        totalArchivedCount: mergedAll.length,
        nextScheduledSyncIso: archive.meta.nextScheduledSyncIso,
        pulledItems: newlyPulled,
        telemetry,
      })
    }

    if (action === "push_custom") {
      const kind: "video" | "picture" = body.kind === "picture" ? "picture" : "video"
      const title = String(body.title || "ConnectLn Enterprise Field Dispatch").trim()
      const summary = String(
        body.summary ||
          "Verified professional briefing syndicated from the ConnectLn Admin Media Backend."
      ).trim()
      const category = String(body.category || "Cybersecurity & Engineering").trim()
      const authorName = String(body.authorName || "Kwesi Asiedu").trim()
      const organization = String(body.organization || "Expedite Consults").trim()
      const destinations: HarvesterDestination[] =
        Array.isArray(body.destinations) && body.destinations.length > 0
          ? body.destinations
          : ["home", "jobs", "market", "media", "pulse"]

      const result = await appendCustomAdminItemToArchive({
        kind,
        title,
        summary,
        category,
        authorName,
        organization,
        destinations,
        rawMediaUrl: String(body.mediaUrl || "").trim(),
        rawImageUrl: body.imageUrl ? String(body.imageUrl).trim() : undefined,
      })

      const telemetry = computeHarvesterTelemetry(result.allItems)
      return NextResponse.json({
        ok: true,
        pulledItems: [result.customItem],
        telemetry,
      })
    }

    if (action === "update_destinations") {
      const itemId = String(body.itemId || "")
      const destinations: HarvesterDestination[] = Array.isArray(body.destinations)
        ? body.destinations
        : ["home", "jobs", "market", "media", "pulse"]

      const updated = await updateArchivedItemDestinations(itemId, destinations)
      const telemetry = computeHarvesterTelemetry(updated)
      return NextResponse.json({ ok: true, telemetry })
    }

    const archive = await getOrRunAdditive24HourVideoArchive({ forceSync: false })
    const telemetry = computeHarvesterTelemetry(archive.items)
    return NextResponse.json({ ok: true, telemetry })
  } catch (err: any) {
    console.error("[media-harvester POST] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to execute media harvester action" },
      { status: 500 }
    )
  }
}
