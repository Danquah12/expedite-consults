import { NextRequest, NextResponse } from "next/server"
import {
  HarvestedMediaItem,
  HarvesterDestination,
  getCurrentMinuteSlot,
  getInitialDeterministicHarvestedItems,
  computeHarvesterTelemetry,
  dedupeHarvestedItems,
  CONNECTLN_HARVESTER_TEMPLATES,
} from "@/lib/connectin-media-harvester"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface LiveRssChannelConfig {
  channelId: string
  organization: string
  authorName: string
  authorRole: string
  authorAvatar: string
  enclaveId: string
  category: string
  jobCompany: string
  jobSalary: string
}

const LIVE_YOUTUBE_RSS_CHANNELS: LiveRssChannelConfig[] = [
  {
    channelId: "UCK7tptUDHh-RYDsdxO1-5QQ",
    organization: "The Wall Street Journal",
    authorName: "WSJ Video Desk",
    authorRole: "Global Economy, Defense & Executive Briefings",
    authorAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=WSJ&backgroundColor=191919",
    enclaveId: "business_finance",
    category: "Global Markets & Policy",
    jobCompany: "Dow Jones & Enterprise Strategy",
    jobSalary: "$155,000 – $225,000",
  },
  {
    channelId: "UCUtWNBWbFL9We-cdXkiAuJA",
    organization: "This Old House",
    authorName: "Master Trades Crew · This Old House",
    authorRole: "Master Carpentry, Plumbing, HVAC & Building Science",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    enclaveId: "trades_construction",
    category: "Master Building Trades",
    jobCompany: "Commercial & Residential Master Builders",
    jobSalary: "$112,000 – $168,000",
  },
  {
    channelId: "UC6n8I1UDTKP1IWjQMg6_TwA",
    organization: "The B1M",
    authorName: "Fred Mills · The B1M",
    authorRole: "Global Megaprojects, High-Rise Construction & Civil Engineering",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
    enclaveId: "trades_construction",
    category: "Commercial Construction & Megaprojects",
    jobCompany: "Turner, Bechtel & Skanska Civil",
    jobSalary: "$128,000 – $190,000",
  },
  {
    channelId: "UCB3jUEyCLRbCw7QED0vnXYg",
    organization: "Electrician U",
    authorName: "Dustin Stelzer · Master Electrician",
    authorRole: "Licensed Master Electrician · NEC Code & Distribution",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
    enclaveId: "trades_construction",
    category: "Electrical & NEC Compliance",
    jobCompany: "Rosendin & MYR Group Electrical",
    jobSalary: "$118,000 – $176,000",
  },
  {
    channelId: "UCMOqf8ab-42UUQIdVoKwjlQ",
    organization: "Practical Engineering",
    authorName: "Grady Hillhouse, PE",
    authorRole: "Licensed Civil & Power Grid Infrastructure Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80",
    enclaveId: "trades_construction",
    category: "Power Grid & Civil Infrastructure",
    jobCompany: "AECOM & Quanta Power Infrastructure",
    jobSalary: "$130,000 – $188,000",
  },
  {
    channelId: "UCzr30osBdTmuFUS8IfXtXmg",
    organization: "Essential Craftsman",
    authorName: "Scott Wadsworth · Essential Craftsman",
    authorRole: "Master Timber Framer, Blacksmith & General Contractor",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80",
    enclaveId: "trades_construction",
    category: "Heavy Framing & Field Craftsmanship",
    jobCompany: "Pacific Northwest Heavy Timber & GC",
    jobSalary: "$105,000 – $158,000",
  },
  {
    channelId: "UCUMZ7gohGI9HcU9VNsr2FJQ",
    organization: "Bloomberg Originals",
    authorName: "Bloomberg Technology & Industry",
    authorRole: "Enterprise Leadership, Semiconductors & Global Supply Chains",
    authorAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=BBG&backgroundColor=0f172a",
    enclaveId: "business_finance",
    category: "Enterprise & Industry Intelligence",
    jobCompany: "Bloomberg & Global Enterprise Advisory",
    jobSalary: "$165,000 – $245,000",
  },
  {
    channelId: "UCKWaEZ-_VweaEx1j62do_vQ",
    organization: "IBM Technology",
    authorName: "IBM Cloud & Security Architecture",
    authorRole: "Zero-Trust Cloud Resilience, AI Agents & Enterprise Security",
    authorAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=IBM&backgroundColor=0a66c2",
    enclaveId: "tech_cybersecurity",
    category: "Cloud Resilience & Cybersecurity",
    jobCompany: "IBM Consulting & Expedite Cloud Security",
    jobSalary: "$170,000 – $240,000",
  },
  {
    channelId: "UCsBjURrPoezykLs9EqgamOA",
    organization: "Fireship",
    authorName: "Jeff Delaney · Fireship Engineering",
    authorRole: "Systems Architecture, Cloud Outages & Modern Software",
    authorAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=FS&backgroundColor=ea580c",
    enclaveId: "tech_cybersecurity",
    category: "Software & Cloud Engineering",
    jobCompany: "Cloud Platform & AI Infrastructure",
    jobSalary: "$175,000 – $260,000",
  },
  {
    channelId: "UCvJJ_dzjViJCoLf5uKUTwoA",
    organization: "CNBC",
    authorName: "CNBC Markets & Technology Desk",
    authorRole: "Capital Markets, Industrial Policy & Tech Economy",
    authorAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=CNBC&backgroundColor=1e3a8a",
    enclaveId: "business_finance",
    category: "Economy & Technology Markets",
    jobCompany: "Enterprise Finance & Capital Advisory",
    jobSalary: "$150,000 – $230,000",
  },
  {
    channelId: "UCes1EvRjcKU4sY_UEavndBw",
    organization: "ChrisFix",
    authorName: "ChrisFix · Master Automotive Tech",
    authorRole: "Hands-On Powertrain Diagnostics & Mechanical Restoration",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80",
    enclaveId: "automotive_mechanics",
    category: "Automotive Diagnostics & Repair",
    jobCompany: "Commercial Fleet & Master Auto Service",
    jobSalary: "$98,000 – $145,000",
  },
  {
    channelId: "UCG-iSMVtWbbwDDXgXXypARQ",
    organization: "MedCram",
    authorName: "Dr. Roger Seheult, MD · MedCram",
    authorRole: "Pulmonology, Critical Care & Clinical Medical Education",
    authorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=240&auto=format&fit=crop&q=80",
    enclaveId: "healthcare_medicine",
    category: "Clinical Medicine & Healthcare",
    jobCompany: "Regional Clinical & Hospital Systems",
    jobSalary: "$145,000 – $285,000",
  },
]

const LIVE_RSS_CACHE_TTL_MS = 10 * 60 * 1000
let CACHED_LIVE_RSS_ITEMS: HarvestedMediaItem[] = []
let LAST_RSS_FETCH_MS = 0
let CUSTOM_ADMIN_ITEMS: HarvestedMediaItem[] = []
let MANUAL_PULL_COUNTER = 1

function decodeXmlEntities(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim()
}

function cleanEditorialSummary(rawDesc: string, fallbackTitle: string, org: string): string {
  const decoded = decodeXmlEntities(rawDesc || "")
  const lines = decoded
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((line) => {
      if (!line) return false
      if (/^https?:\/\//i.test(line)) return false
      if (/^(subscribe|follow us|join our|sign up|watch more|listen to|sponsored by|use code|merch|patreon|instagram|twitter|tiktok|facebook|linkedin)/i.test(line)) {
        return false
      }
      if (/^(#[a-z0-9_]+\s*)+$/i.test(line)) return false
      if (/^\d{1,2}:\d{2}\s+/.test(line)) return false
      return true
    })
    .map((line) =>
      line
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/(#[a-z0-9_]+\s*){2,}$/gi, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((line) => line.length >= 28)

  const lead = lines.slice(0, 2).join(" ").trim()
  if (lead.length >= 35) {
    return lead.length > 320 ? `${lead.slice(0, 317).trimEnd()}...` : lead
  }
  return `${org} field briefing examining ${fallbackTitle.replace(/\s*\|\s*.*$/, "")} and key operational takeaways for practitioners.`
}

function formatRelativePublishedLabel(publishedIso: string): string {
  const ts = Date.parse(publishedIso)
  if (!Number.isFinite(ts)) return "1h"
  const diffMs = Math.max(0, Date.now() - ts)
  const mins = Math.floor(diffMs / 60000)
  if (mins < 2) return "Just now"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  const weeks = Math.floor(days / 7)
  return `${weeks}w`
}

async function fetchSingleChannelRss(cfg: LiveRssChannelConfig): Promise<HarvestedMediaItem[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4500)
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(cfg.channelId)}`,
      {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ConnectLnMediaSync/2.0)",
        },
      }
    )
    if (!res.ok) return []
    const xml = await res.text()
    const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).map((m) => m[1])

    const fullVideos: HarvestedMediaItem[] = []
    const shortVideos: HarvestedMediaItem[] = []

    for (const entryXml of entries.slice(0, 8)) {
      const videoId = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim()
      if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) continue

      const rawTitle = entryXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ""
      const cleanTitle = decodeXmlEntities(rawTitle)
        .replace(/\s*#\w+\s*$/g, "")
        .trim()
      if (!cleanTitle) continue

      const linkHref = entryXml.match(/<link[^>]+href="([^"]+)"/)?.[1] || ""
      const isShort = linkHref.includes("/shorts/") || /#shorts/i.test(rawTitle)

      const publishedIso =
        entryXml.match(/<published>([^<]+)<\/published>/)?.[1]?.trim() || new Date().toISOString()
      const rawDescription =
        entryXml.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || ""
      const summary = cleanEditorialSummary(rawDescription, cleanTitle, cfg.organization)

      const viewsMatch = entryXml.match(/<media:statistics[^>]+views="(\d+)"/)
      const starCountMatch = entryXml.match(/<media:starRating[^>]+count="(\d+)"/)
      const viewsCount = viewsMatch ? Math.max(120, Number(viewsMatch[1])) : 1850
      const likesCount = starCountMatch ? Math.max(18, Number(starCountMatch[1])) : Math.max(24, Math.round(viewsCount * 0.04))

      const publishedMs = Date.parse(publishedIso) || Date.now()
      const slot = Math.max(1, Math.floor(publishedMs / 60000))

      const builtItem: HarvestedMediaItem = {
        id: `cln_live_${videoId}`,
        serialNumber: `CLN-LIVE-${videoId.slice(0, 5).toUpperCase()}`,
        kind: "video",
        title: cleanTitle,
        summary,
        youtubeId: videoId,
        imageUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        authorName: cfg.authorName,
        authorRole: cfg.authorRole,
        authorAvatar: cfg.authorAvatar,
        organization: cfg.organization,
        enclaveId: cfg.enclaveId,
        category: cfg.category,
        duration: "06:30",
        destinations: ["home", "jobs", "market", "media", "pulse"],
        pulledAtIso: publishedIso,
        pulledAtLabel: formatRelativePublishedLabel(publishedIso),
        minuteSlot: slot,
        sourceFeed: `${cfg.organization} Live Video Feed`,
        viewsCount,
        likesCount,
        jobMeta: {
          roleTitle: `${cfg.category} Specialist`,
          company: cfg.jobCompany,
          location: "Nationwide / Hybrid",
          salary: cfg.jobSalary,
          employmentType: "Full-time · Verified Employer",
        },
        marketMeta: {
          productName: cleanTitle.slice(0, 68),
          vendor: cfg.organization,
          price: "Included",
          category: cfg.category,
          liveUrl: `https://www.youtube.com/watch?v=${videoId}`,
        },
        pulseMeta: {
          severityOrTag: cfg.category.toUpperCase(),
          sourceName: cfg.organization,
          takeaway: summary,
        },
      }

      if (isShort) {
        shortVideos.push(builtItem)
      } else {
        fullVideos.push(builtItem)
      }
    }

    // Prefer widescreen full-length episodes first so the 16:9 player looks crisp edge-to-edge
    return [...fullVideos, ...shortVideos].slice(0, 3)
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

async function getMergedLiveAndCustomItems(forceRefresh: boolean = false): Promise<HarvestedMediaItem[]> {
  const now = Date.now()
  if (forceRefresh || CACHED_LIVE_RSS_ITEMS.length === 0 || now - LAST_RSS_FETCH_MS > LIVE_RSS_CACHE_TTL_MS) {
    const settled = await Promise.allSettled(
      LIVE_YOUTUBE_RSS_CHANNELS.map((ch) => fetchSingleChannelRss(ch))
    )
    const fetched: HarvestedMediaItem[] = []
    for (const res of settled) {
      if (res.status === "fulfilled" && res.value.length > 0) {
        fetched.push(...res.value)
      }
    }

    if (fetched.length > 0) {
      // Refresh relative time labels ("2h", "5h", "1d") and sort newest published first
      CACHED_LIVE_RSS_ITEMS = dedupeHarvestedItems(
        fetched.map((item) => ({
          ...item,
          pulledAtLabel: formatRelativePublishedLabel(item.pulledAtIso),
        }))
      )
      LAST_RSS_FETCH_MS = now
    } else if (CACHED_LIVE_RSS_ITEMS.length === 0) {
      CACHED_LIVE_RSS_ITEMS = dedupeHarvestedItems(getInitialDeterministicHarvestedItems(12))
    }
  } else {
    CACHED_LIVE_RSS_ITEMS = CACHED_LIVE_RSS_ITEMS.map((item) => ({
      ...item,
      pulledAtLabel: formatRelativePublishedLabel(item.pulledAtIso),
    }))
  }

  return dedupeHarvestedItems([...CUSTOM_ADMIN_ITEMS, ...CACHED_LIVE_RSS_ITEMS]).slice(0, 48)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const force = searchParams.get("force") === "1" || searchParams.get("autoTick") === "1"
  const items = await getMergedLiveAndCustomItems(force)
  const telemetry = computeHarvesterTelemetry(items)

  return NextResponse.json(
    {
      ...telemetry,
      syncCadenceMinutes: 15,
      liveRssActive: CACHED_LIVE_RSS_ITEMS.some((i) => i.id.startsWith("cln_live_")),
      lastLiveSyncIso: LAST_RSS_FETCH_MS ? new Date(LAST_RSS_FETCH_MS).toISOString() : new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = body.action || "pull_now"

    if (action === "pull_now") {
      const count = Math.min(8, Math.max(1, Number(body.count) || 4))
      const requestedDestinations: HarvesterDestination[] =
        Array.isArray(body.destinations) && body.destinations.length > 0
          ? body.destinations
          : ["home", "jobs", "market", "media", "pulse"]
      const excludeYoutubeIds = new Set<string>(
        Array.isArray(body.excludeYoutubeIds)
          ? body.excludeYoutubeIds.map((id: unknown) => String(id || "").trim())
          : []
      )

      const allLive = await getMergedLiveAndCustomItems(true)
      const unseenFirst = [
        ...allLive.filter((i) => !i.youtubeId || !excludeYoutubeIds.has(i.youtubeId)),
        ...allLive.filter((i) => i.youtubeId && excludeYoutubeIds.has(i.youtubeId)),
      ]

      const pullOffset = ((MANUAL_PULL_COUNTER++ - 1) * 2) % Math.max(1, unseenFirst.length)
      const rotated = [
        ...unseenFirst.slice(pullOffset),
        ...unseenFirst.slice(0, pullOffset),
      ]

      const newlyPulled = rotated.slice(0, count).map((item) => ({
        ...item,
        destinations: Array.from(new Set([...item.destinations, ...requestedDestinations])),
        pulledAtLabel: formatRelativePublishedLabel(item.pulledAtIso),
      }))

      const mergedAll = dedupeHarvestedItems([...newlyPulled, ...allLive])
      const telemetry = computeHarvesterTelemetry(mergedAll)

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
          "Verified professional briefing syndicated from the ConnectLn Admin Media Backend."
      ).trim()
      const category = String(body.category || "Cybersecurity & Engineering").trim()
      const authorName = String(body.authorName || "Kwesi Asiedu").trim()
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
        authorRole: "Platform Administrator · ConnectLn",
        authorAvatar: "/brand/kwesi-avatar.png",
        organization,
        enclaveId: "tech_cybersecurity",
        category,
        duration: kind === "video" ? "03:30" : undefined,
        destinations,
        pulledAtIso: new Date().toISOString(),
        pulledAtLabel: "Just now",
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
          sourceName: organization,
          takeaway: summary,
        },
      }

      CUSTOM_ADMIN_ITEMS = [customItem, ...CUSTOM_ADMIN_ITEMS].slice(0, 20)
      const allMerged = await getMergedLiveAndCustomItems(false)
      const telemetry = computeHarvesterTelemetry(allMerged)

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

      CUSTOM_ADMIN_ITEMS = CUSTOM_ADMIN_ITEMS.map((item) =>
        item.id === itemId ? { ...item, destinations } : item
      )
      CACHED_LIVE_RSS_ITEMS = CACHED_LIVE_RSS_ITEMS.map((item) =>
        item.id === itemId ? { ...item, destinations } : item
      )
      const allMerged = await getMergedLiveAndCustomItems(false)
      const telemetry = computeHarvesterTelemetry(allMerged)
      return NextResponse.json({ ok: true, telemetry })
    }

    const allMerged = await getMergedLiveAndCustomItems(false)
    const telemetry = computeHarvesterTelemetry(allMerged)
    return NextResponse.json({ ok: true, telemetry })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to execute media harvester action" },
      { status: 500 }
    )
  }
}
