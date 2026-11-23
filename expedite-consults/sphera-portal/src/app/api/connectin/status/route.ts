import { NextRequest, NextResponse } from "next/server"
import {
  firebaseKvDeleteItem,
  firebaseKvListItems,
  firebaseKvSetItem,
} from "@/lib/connectin-firebase-kv"
import {
  buildTikTokEmbedUrl,
  isAllowedSocialResolveHost,
  parseSocialVideoUrl,
  ParsedSocialVideo,
  splitLinkAndCustomTitle,
} from "@/lib/connectin-social-video"

const STATUS_KV_MAP = "connectln_status_updates_v1"
const STATUS_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days
const MAX_RESOLVE_BATCH = 15
const MAX_PUBLISH_BATCH = 20
const MAX_INLINE_DATA_CHARS = 700_000

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

export interface ResolvedStatusLink extends ParsedSocialVideo {
  title: string
  authorName?: string
  resolved: boolean
}

function isSafeExternalUrl(raw: string): URL | null {
  try {
    const u = new URL(raw)
    if (u.protocol !== "https:") return null
    if (!isAllowedSocialResolveHost(u.hostname)) return null
    return u
  } catch {
    return null
  }
}

async function resolveShortSocialUrl(parsed: ParsedSocialVideo): Promise<ParsedSocialVideo> {
  const safeInitial = isSafeExternalUrl(parsed.originalUrl)
  if (!safeInitial) return parsed

  try {
    const res = await fetch(safeInitial.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": BROWSER_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    })

    const finalUrl = res.url ? isSafeExternalUrl(res.url) : null
    if (finalUrl) {
      const reparsed = parseSocialVideoUrl(finalUrl.toString())
      if (reparsed && (!reparsed.needsServerResolve || reparsed.provider === "facebook")) {
        return {
          ...reparsed,
          originalUrl: parsed.originalUrl,
        }
      }
    }

    // For TikTok pages whose URL didn't expose numeric ID in path, scan page HTML lightly
    if (parsed.provider === "tiktok") {
      const html = (await res.text().catch(() => "")).slice(0, 120_000)
      const videoIdMatch =
        html.match(/https:\/\/www\.tiktok\.com\/@[^"'\s]+\/video\/(\d{15,22})/) ||
        html.match(/"video"\s*:\s*\{\s*"id"\s*:\s*"(\d{15,22})"/) ||
        html.match(/"itemId"\s*:\s*"(\d{15,22})"/)
      if (videoIdMatch?.[1]) {
        const videoId = videoIdMatch[1]
        return {
          ...parsed,
          canonicalUrl: finalUrl?.toString() || `https://www.tiktok.com/video/${videoId}`,
          embedUrl: buildTikTokEmbedUrl(videoId),
          videoId,
          needsServerResolve: false,
        }
      }
    }
  } catch (err) {
    console.warn("[/api/connectin/status] Redirect resolve notice:", (err as any)?.message || err)
  }

  return parsed
}

async function enrichSocialMetadata(item: ParsedSocialVideo, customTitle: string): Promise<ResolvedStatusLink> {
  let active = item.needsServerResolve ? await resolveShortSocialUrl(item) : item

  let title = customTitle
  let authorName: string | undefined
  let thumbnailUrl = active.thumbnailUrl

  if (active.provider === "youtube") {
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(active.canonicalUrl)}&format=json`,
        { signal: AbortSignal.timeout(4000), cache: "no-store" }
      )
      if (oembedRes.ok) {
        const data: any = await oembedRes.json()
        if (!title && typeof data?.title === "string") title = data.title.trim()
        if (typeof data?.author_name === "string") authorName = data.author_name.trim()
        if (!thumbnailUrl && typeof data?.thumbnail_url === "string") thumbnailUrl = data.thumbnail_url.trim()
      }
    } catch {}
  } else if (active.provider === "tiktok") {
    try {
      const targetForOembed = active.canonicalUrl || active.originalUrl
      const oembedRes = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(targetForOembed)}`,
        { signal: AbortSignal.timeout(4000), cache: "no-store" }
      )
      if (oembedRes.ok) {
        const data: any = await oembedRes.json()
        if (!title && typeof data?.title === "string") title = data.title.trim()
        if (typeof data?.author_name === "string") authorName = data.author_name.trim()
        if (!thumbnailUrl && typeof data?.thumbnail_url === "string") thumbnailUrl = data.thumbnail_url.trim()
        const oembedVideoId =
          typeof data?.embed_product_id === "string" && /^\d{15,22}$/.test(data.embed_product_id)
            ? data.embed_product_id
            : undefined
        if (oembedVideoId && !active.embedUrl) {
          active = {
            ...active,
            videoId: oembedVideoId,
            embedUrl: buildTikTokEmbedUrl(oembedVideoId),
            needsServerResolve: false,
          }
        }
      }
    } catch {}
  }

  if (!title) {
    title =
      active.provider === "youtube"
        ? active.isVertical
          ? "YouTube Shorts Status"
          : "YouTube Video Status"
        : active.provider === "tiktok"
          ? "TikTok Video Status"
          : active.isVertical
            ? "Facebook Reel Video Status"
            : "Facebook Video Status"
  }

  return {
    ...active,
    thumbnailUrl,
    title,
    authorName,
    resolved: Boolean(active.embedUrl),
  }
}

export async function GET() {
  try {
    const entries = await firebaseKvListItems<any>(STATUS_KV_MAP, false)
    const items = entries
      .map((entry) => entry?.data)
      .filter((item) => item && typeof item.id === "string" && typeof item.authorName === "string")
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0))
      .slice(0, 120)

    return NextResponse.json(
      { ok: true, count: items.length, items },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (err: any) {
    console.error("[GET /api/connectin/status]", err)
    return NextResponse.json({ ok: false, error: err?.message || "Failed to load statuses" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = String(body?.action || "publish")

    if (action === "resolve") {
      const rawUrls = Array.isArray(body?.urls)
        ? body.urls.map((u: unknown) => String(u || "")).filter(Boolean).slice(0, MAX_RESOLVE_BATCH)
        : body?.url
          ? [String(body.url)]
          : []

      const resolved = await Promise.all(
        rawUrls.map(async (line: string) => {
          const { url, customTitle } = splitLinkAndCustomTitle(line)
          const parsed = parseSocialVideoUrl(url)
          if (!parsed) {
            return { ok: false, input: line, url, customTitle }
          }
          const enriched = await enrichSocialMetadata(parsed, customTitle)
          return { ok: true, input: line, ...enriched }
        })
      )

      return NextResponse.json({ ok: true, resolved })
    }

    const incoming = Array.isArray(body?.items)
      ? body.items
      : body?.item
        ? [body.item]
        : []

    if (incoming.length === 0) {
      return NextResponse.json({ ok: false, error: "At least one status item is required." }, { status: 400 })
    }

    const now = Date.now()
    const cleanItems: any[] = []

    for (let i = 0; i < Math.min(incoming.length, MAX_PUBLISH_BATCH); i++) {
      const raw = incoming[i]
      if (!raw || typeof raw !== "object" || !raw.id || !raw.authorName) continue

      const videoUrl = String(raw.videoUrl || "")
      const audioUrl = String(raw.audioUrl || "")
      if (videoUrl.startsWith("blob:") || audioUrl.startsWith("blob:")) {
        continue
      }

      const safeImage =
        typeof raw.imageUrl === "string" && raw.imageUrl.length <= MAX_INLINE_DATA_CHARS
          ? raw.imageUrl
          : undefined
      const safeAttachment =
        typeof raw.attachmentUrl === "string" && raw.attachmentUrl.length <= MAX_INLINE_DATA_CHARS
          ? raw.attachmentUrl
          : undefined

      cleanItems.push({
        ...raw,
        id: String(raw.id),
        authorName: String(raw.authorName).slice(0, 120),
        authorEmail: raw.authorEmail ? String(raw.authorEmail).toLowerCase().trim() : undefined,
        imageUrl: safeImage,
        attachmentUrl: safeAttachment,
        viewed: false,
        createdAtMs: Number(raw.createdAtMs) || now - i,
      })
    }

    if (cleanItems.length === 0) {
      return NextResponse.json({ ok: true, savedCount: 0, items: [] })
    }

    await Promise.all(
      cleanItems.map((item) =>
        firebaseKvSetItem(STATUS_KV_MAP, item.id, item, STATUS_TTL_SECONDS)
      )
    )

    return NextResponse.json({ ok: true, savedCount: cleanItems.length, items: cleanItems })
  } catch (err: any) {
    console.error("[POST /api/connectin/status]", err)
    return NextResponse.json({ ok: false, error: err?.message || "Failed to save status" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let id = req.nextUrl.searchParams.get("id") || ""
    if (!id) {
      const body = await req.json().catch(() => null)
      id = String(body?.id || "")
    }
    id = id.trim()
    if (!id) {
      return NextResponse.json({ ok: false, error: "Status id is required." }, { status: 400 })
    }

    await firebaseKvDeleteItem(STATUS_KV_MAP, id)
    return NextResponse.json({ ok: true, deletedId: id })
  } catch (err: any) {
    console.error("[DELETE /api/connectin/status]", err)
    return NextResponse.json({ ok: false, error: err?.message || "Failed to delete status" }, { status: 500 })
  }
}
