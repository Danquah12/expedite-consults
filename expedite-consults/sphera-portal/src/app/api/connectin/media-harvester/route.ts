import { NextRequest, NextResponse } from "next/server"
import {
  HarvestedMediaItem,
  HarvesterDestination,
  getCurrentMinuteSlot,
  buildHarvestedItemForSlot,
  getInitialDeterministicHarvestedItems,
  computeHarvesterTelemetry,
  CONNECTLN_HARVESTER_TEMPLATES,
} from "@/lib/connectin-media-harvester"

export const dynamic = "force-dynamic"
export const revalidate = 0

// In-memory store on the server instance that grows every minute + merges deterministic minute slots
let SERVER_HARVESTED_ITEMS: HarvestedMediaItem[] = getInitialDeterministicHarvestedItems(14)
let LAST_PROCESSED_MINUTE_SLOT: number = getCurrentMinuteSlot()
let MANUAL_PULL_COUNTER = 1

function syncCurrentMinuteSlots() {
  const currentSlot = getCurrentMinuteSlot()
  if (currentSlot > LAST_PROCESSED_MINUTE_SLOT) {
    const missedSlots = Math.min(10, currentSlot - LAST_PROCESSED_MINUTE_SLOT)
    const newlyPulled: HarvestedMediaItem[] = []
    for (let s = missedSlots - 1; s >= 0; s--) {
      const slotNum = currentSlot - s
      const item = buildHarvestedItemForSlot(slotNum, 0, Date.now() - s * 60000)
      newlyPulled.push(item)
    }
    const existingIds = new Set(SERVER_HARVESTED_ITEMS.map((i) => i.id))
    const filteredNew = newlyPulled.filter((i) => !existingIds.has(i.id))
    SERVER_HARVESTED_ITEMS = [...filteredNew, ...SERVER_HARVESTED_ITEMS].slice(0, 60)
    LAST_PROCESSED_MINUTE_SLOT = currentSlot
  }
}

export async function GET(req: NextRequest) {
  syncCurrentMinuteSlots()

  const { searchParams } = new URL(req.url)
  const autoTick = searchParams.get("autoTick") === "1"

  if (autoTick) {
    // Pull 1 fresh video on the 60-second tick so the platform visibly grows every minute
    const pullSeq = MANUAL_PULL_COUNTER++
    const uniqueStep = Math.floor(Date.now() / 1000) + pullSeq
    const slot = getCurrentMinuteSlot() + uniqueStep
    const forcedTplIndex = (getCurrentMinuteSlot() + pullSeq) % 8
    const item = buildHarvestedItemForSlot(slot, 0, Date.now(), forcedTplIndex)
    item.id = `cln_auto_${Date.now()}_${pullSeq}`
    item.pulledAtIso = new Date().toISOString()
    item.pulledAtLabel = `Auto-pulled just now (${new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })})`
    SERVER_HARVESTED_ITEMS = [item, ...SERVER_HARVESTED_ITEMS].slice(0, 60)
  }

  const telemetry = computeHarvesterTelemetry(SERVER_HARVESTED_ITEMS)
  return NextResponse.json(telemetry, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    syncCurrentMinuteSlots()
    const body = await req.json().catch(() => ({}))
    const action = body.action || "pull_now"

    if (action === "pull_now") {
      const count = Math.min(6, Math.max(1, Number(body.count) || 2))
      const requestedDestinations: HarvesterDestination[] =
        Array.isArray(body.destinations) && body.destinations.length > 0
          ? body.destinations
          : ["home", "jobs", "market", "media", "pulse"]

      const newlyPulled: HarvestedMediaItem[] = []
      const nowTimeStr = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })

      const baseStep = Math.floor(Date.now() / 1000)
      for (let i = 0; i < count; i++) {
        const pullSeq = MANUAL_PULL_COUNTER++
        const slot = getCurrentMinuteSlot() + baseStep + i + pullSeq
        const forcedTplIndex = i === 0 ? (getCurrentMinuteSlot() + pullSeq) % 8 : (getCurrentMinuteSlot() + pullSeq + i) % CONNECTLN_HARVESTER_TEMPLATES.length
        const built = buildHarvestedItemForSlot(slot, 0, Date.now() - i * 1000, forcedTplIndex)
        built.id = `cln_pull_${Date.now()}_${i}_${pullSeq}`
        built.destinations = requestedDestinations
        built.pulledAtIso = new Date(Date.now() - i * 1000).toISOString()
        built.pulledAtLabel = `Pulled & pushed at ${nowTimeStr}`
        newlyPulled.push(built)
      }

      SERVER_HARVESTED_ITEMS = [...newlyPulled, ...SERVER_HARVESTED_ITEMS].slice(0, 60)
      const telemetry = computeHarvesterTelemetry(SERVER_HARVESTED_ITEMS)

      return NextResponse.json({
        ok: true,
        pulledItems: newlyPulled,
        telemetry,
      })
    }

    if (action === "push_custom") {
      const kind: "video" | "picture" = body.kind === "picture" ? "picture" : "video"
      const title = String(body.title || "ConnectLn Enterprise Field Dispatch").trim()
      const summary = String(
        body.summary ||
          "Verified professional video & visual briefing syndicated from the ConnectLn Admin Media Backend to Home, Jobs, Market, Media, and Pulse."
      ).trim()
      const category = String(body.category || "Cybersecurity & Engineering").trim()
      const authorName = String(body.authorName || "Kwesi Asiedu · ConnectLn Admin").trim()
      const organization = String(body.organization || "Expedite Consults").trim()
      const destinations: HarvesterDestination[] =
        Array.isArray(body.destinations) && body.destinations.length > 0
          ? body.destinations
          : ["home", "jobs", "market", "media", "pulse"]

      const fallbackTpl = CONNECTLN_HARVESTER_TEMPLATES[0]
      const rawMediaUrl = String(body.mediaUrl || "").trim()
      const isYoutube =
        rawMediaUrl.includes("youtube.com") ||
        rawMediaUrl.includes("youtu.be") ||
        /^[a-zA-Z0-9_-]{11}$/.test(rawMediaUrl)

      let youtubeId: string | undefined
      let videoUrl: string | undefined
      let imageUrl = String(body.imageUrl || fallbackTpl.imageUrl).trim()

      if (kind === "video") {
        if (isYoutube) {
          const match = rawMediaUrl.match(
            /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
          )
          youtubeId = match ? match[1] : rawMediaUrl
          if (!body.imageUrl && youtubeId) {
            imageUrl = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
          }
        } else {
          videoUrl = rawMediaUrl || "/status-videos/agentic_flywheel.mp4"
        }
      } else {
        imageUrl = rawMediaUrl || "/images/connectln-studies/agentic-mcp-cover.jpg"
      }

      const nowTimeStr = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })
      const slot = getCurrentMinuteSlot() + MANUAL_PULL_COUNTER++

      const customItem: HarvestedMediaItem = {
        id: `cln_custom_${Date.now()}_${MANUAL_PULL_COUNTER}`,
        serialNumber: `CLN-ADM-${String(1000 + MANUAL_PULL_COUNTER)}`,
        kind,
        title,
        summary,
        videoUrl,
        youtubeId,
        imageUrl,
        authorName,
        authorRole: "Platform Administrator · ConnectLn Media Backend",
        authorAvatar: "/brand/kwesi-avatar.png",
        organization,
        enclaveId: "tech_cybersecurity",
        category,
        duration: kind === "video" ? "03:30" : undefined,
        destinations,
        pulledAtIso: new Date().toISOString(),
        pulledAtLabel: `Admin Pushed at ${nowTimeStr}`,
        minuteSlot: slot,
        sourceFeed: "ConnectLn Admin Direct Push",
        viewsCount: 1850,
        likesCount: 142,
        jobMeta: {
          roleTitle: `${title} — Lead Specialist`,
          company: organization,
          location: "Remote / Hybrid",
          salary: "$165,000 – $220,000",
          employmentType: "Full-time · Direct Hire",
        },
        marketMeta: {
          productName: title,
          vendor: organization,
          price: "$299/mo",
          category: "Solutions",
          liveUrl: "https://conectln.com",
        },
        pulseMeta: {
          severityOrTag: "ADMIN MEDIA DISPATCH",
          sourceName: "ConnectLn Admin Backend",
          takeaway: summary,
        },
      }

      SERVER_HARVESTED_ITEMS = [customItem, ...SERVER_HARVESTED_ITEMS].slice(0, 60)
      const telemetry = computeHarvesterTelemetry(SERVER_HARVESTED_ITEMS)

      return NextResponse.json({
        ok: true,
        pulledItems: [customItem],
        telemetry,
      })
    }

    if (action === "update_destinations") {
      const itemId = String(body.itemId || "")
      const destinations: HarvesterDestination[] = Array.isArray(body.destinations)
        ? body.destinations
        : ["home", "jobs", "market", "media", "pulse"]

      SERVER_HARVESTED_ITEMS = SERVER_HARVESTED_ITEMS.map((item) =>
        item.id === itemId ? { ...item, destinations } : item
      )
      const telemetry = computeHarvesterTelemetry(SERVER_HARVESTED_ITEMS)
      return NextResponse.json({ ok: true, telemetry })
    }

    const telemetry = computeHarvesterTelemetry(SERVER_HARVESTED_ITEMS)
    return NextResponse.json({ ok: true, telemetry })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to execute media harvester action" },
      { status: 500 }
    )
  }
}
