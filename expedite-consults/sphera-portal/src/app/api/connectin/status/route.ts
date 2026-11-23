import { NextRequest, NextResponse } from "next/server"
import {
  firebaseKvDeleteItem,
  firebaseKvGetItem,
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
const STATUS_INTERACTIONS_KV_MAP = "connectln_status_interactions_v1"
const STATUS_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days
const INTERACTIONS_TTL_SECONDS = 14 * 24 * 60 * 60 // 14 days
const MAX_RESOLVE_BATCH = 15
const MAX_PUBLISH_BATCH = 20
const MAX_INLINE_DATA_CHARS = 700_000
const MAX_AVATAR_DATA_CHARS = 250_000

export interface StatusCommentItem {
  id: string
  slideId: string
  authorName: string
  authorEmail?: string
  authorAvatar?: string
  text: string
  timestampLabel: string
  createdAtMs: number
}

export interface StatusSlideInteractions {
  slideId: string
  reactions: Record<string, string[]>
  comments: StatusCommentItem[]
  updatedAtMs: number
}

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

function decodeBasicHtmlEntities(raw: string): string {
  return String(raw || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

async function resolveYouTubePlaylistFromPage(playlistId: string): Promise<{
  title?: string
  thumbnailUrl?: string
  videoIds: string[]
}> {
  try {
    const res = await fetch(
      `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`,
      {
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(6000),
        cache: "no-store",
      }
    )
    if (!res.ok) return { videoIds: [] }
    const html = await res.text()
    const rawOgTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1]
    const rawOgImg = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1]
    const seen = new Set<string>()
    const videoIds: string[] = []
    for (const m of html.matchAll(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g)) {
      const vid = m[1]
      if (!seen.has(vid)) {
        seen.add(vid)
        videoIds.push(vid)
        if (videoIds.length >= 25) break
      }
    }
    return {
      title: rawOgTitle ? decodeBasicHtmlEntities(rawOgTitle).trim() : undefined,
      thumbnailUrl: rawOgImg ? decodeBasicHtmlEntities(rawOgImg).trim() : undefined,
      videoIds,
    }
  } catch (err) {
    console.warn("[/api/connectin/status] YouTube playlist page fetch notice:", (err as any)?.message || err)
    return { videoIds: [] }
  }
}

async function enrichSocialMetadata(item: ParsedSocialVideo, customTitle: string): Promise<ResolvedStatusLink> {
  let active =
    item.needsServerResolve && item.provider !== "youtube"
      ? await resolveShortSocialUrl(item)
      : item

  let title = customTitle
  let authorName: string | undefined
  let thumbnailUrl = active.thumbnailUrl

  if (active.provider === "youtube") {
    let oembedOk = false
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(active.canonicalUrl)}&format=json`,
        { signal: AbortSignal.timeout(4000), cache: "no-store" }
      )
      if (oembedRes.ok) {
        oembedOk = true
        const data: any = await oembedRes.json()
        if (!title && typeof data?.title === "string") title = data.title.trim()
        if (typeof data?.author_name === "string") authorName = data.author_name.trim()
        if (!thumbnailUrl && typeof data?.thumbnail_url === "string") thumbnailUrl = data.thumbnail_url.trim()
      }
    } catch {}

    const isDynamicMix = Boolean(active.playlistId && /^RD/i.test(active.playlistId))
    if (active.playlistId && (isDynamicMix || !oembedOk || !thumbnailUrl)) {
      const pageMeta = await resolveYouTubePlaylistFromPage(active.playlistId)
      if (!title && pageMeta.title) title = pageMeta.title
      if (!thumbnailUrl) {
        thumbnailUrl =
          pageMeta.thumbnailUrl ||
          (pageMeta.videoIds[0] ? `https://i.ytimg.com/vi/${pageMeta.videoIds[0]}/hqdefault.jpg` : undefined)
      }
      if (pageMeta.videoIds.length > 0 && (isDynamicMix || !oembedOk)) {
        const firstId = pageMeta.videoIds[0]
        const extraTracks = pageMeta.videoIds.slice(1, 25)
        const embedUrl =
          extraTracks.length > 0
            ? `https://www.youtube.com/embed/${firstId}?playlist=${extraTracks.join(",")}&autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
            : `https://www.youtube.com/embed/${firstId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
        active = {
          ...active,
          videoId: firstId,
          embedUrl,
          needsServerResolve: false,
        }
      }
    }
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
        ? active.playlistId && !active.videoId
          ? active.formatLabel.includes("MUSIC")
            ? "YouTube Music Playlist"
            : "YouTube Playlist"
          : active.isVertical
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
    const [entries, interactionEntries] = await Promise.all([
      firebaseKvListItems<any>(STATUS_KV_MAP, false),
      firebaseKvListItems<StatusSlideInteractions>(STATUS_INTERACTIONS_KV_MAP, false),
    ])
    const rawItems = entries
      .map((entry) => entry?.data)
      .filter((item) => item && typeof item.id === "string" && typeof item.authorName === "string")
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0))
      .slice(0, 120)

    const items = await Promise.all(
      rawItems.map(async (item) => {
        if (item.embedUrl) return item
        const sourceCandidate = String(item.externalSourceUrl || item.videoUrl || "").trim()
        const parsed = parseSocialVideoUrl(sourceCandidate)
        if (!parsed) return item

        const resolved = await enrichSocialMetadata(parsed, "")
        if (!resolved.embedUrl) return item
        const isGenericTitle =
          !item.title ||
          /^YouTube Status Clip #\d+$/i.test(String(item.title).trim()) ||
          /^Uploaded /i.test(String(item.text || ""))
        return {
          ...item,
          title: isGenericTitle && resolved.title ? resolved.title : item.title,
          videoTitle: isGenericTitle && resolved.title ? resolved.title : item.videoTitle,
          videoUrl: resolved.canonicalUrl || item.videoUrl,
          imageUrl:
            resolved.thumbnailUrl ||
            (String(item.imageUrl || "").includes("images.unsplash.com") ? undefined : item.imageUrl),
          embedUrl: resolved.embedUrl,
          embedProvider: resolved.provider,
          isVerticalEmbed: Boolean(resolved.isVertical),
          sourcePlatform: resolved.platform,
          mediaFormat: resolved.formatLabel,
          videoDuration: resolved.platform,
          text: /^Imported YouTube clip \(MP4\)$/i.test(String(item.text || "").trim())
            ? `Shared ${resolved.platform} (${resolved.formatLabel})`
            : item.text,
        }
      })
    )

    const interactions: Record<string, StatusSlideInteractions> = {}
    for (const entry of interactionEntries) {
      const slideId = String(entry?.data?.slideId || entry?.key || "").trim()
      if (!slideId || !entry?.data) continue
      interactions[slideId] = {
        slideId,
        reactions:
          entry.data.reactions && typeof entry.data.reactions === "object"
            ? entry.data.reactions
            : {},
        comments: Array.isArray(entry.data.comments) ? entry.data.comments : [],
        updatedAtMs: Number(entry.data.updatedAtMs || entry.updatedAtMs || 0),
      }
    }

    return NextResponse.json(
      { ok: true, count: items.length, items, interactions },
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

    if (action === "react") {
      const slideId = String(body?.slideId || "").trim()
      const emoji = String(body?.emoji || "").trim()
      const reactorKey = String(body?.userEmail || body?.userName || "member")
        .trim()
        .toLowerCase()
        .slice(0, 120)

      if (!slideId || !emoji || emoji.length > 12) {
        return NextResponse.json({ ok: false, error: "Valid slideId and emoji are required." }, { status: 400 })
      }

      const existing = await firebaseKvGetItem<StatusSlideInteractions>(
        STATUS_INTERACTIONS_KV_MAP,
        slideId
      )
      const base: StatusSlideInteractions = existing
        ? {
            slideId,
            reactions: { ...(existing.reactions || {}) },
            comments: Array.isArray(existing.comments) ? existing.comments : [],
            updatedAtMs: Number(existing.updatedAtMs || 0),
          }
        : { slideId, reactions: {}, comments: [], updatedAtMs: 0 }

      const currentReactors = Array.isArray(base.reactions[emoji]) ? [...base.reactions[emoji]] : []
      const existingIdx = currentReactors.indexOf(reactorKey)
      let added = false
      if (existingIdx >= 0) {
        currentReactors.splice(existingIdx, 1)
      } else {
        currentReactors.push(reactorKey)
        added = true
      }
      if (currentReactors.length > 0) {
        base.reactions[emoji] = currentReactors
      } else {
        delete base.reactions[emoji]
      }
      base.updatedAtMs = Date.now()

      await firebaseKvSetItem(STATUS_INTERACTIONS_KV_MAP, slideId, base, INTERACTIONS_TTL_SECONDS)
      return NextResponse.json({
        ok: true,
        slideId,
        emoji,
        toggled: added ? "added" : "removed",
        interactions: base,
      })
    }

    if (action === "comment") {
      const slideId = String(body?.slideId || "").trim()
      const text = String(body?.text || "").trim().slice(0, 500)
      const authorName = String(body?.authorName || "ConnectLn Member").trim().slice(0, 120)
      const authorEmail = body?.authorEmail ? String(body.authorEmail).trim().toLowerCase().slice(0, 160) : undefined
      const rawAvatar = typeof body?.authorAvatar === "string" ? body.authorAvatar : ""
      const authorAvatar =
        rawAvatar && rawAvatar.length <= MAX_AVATAR_DATA_CHARS ? rawAvatar : undefined
      const timestampLabel = String(
        body?.timestampLabel ||
          `Today at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
      ).slice(0, 64)

      if (!slideId || !text) {
        return NextResponse.json({ ok: false, error: "Valid slideId and comment text are required." }, { status: 400 })
      }

      const existing = await firebaseKvGetItem<StatusSlideInteractions>(
        STATUS_INTERACTIONS_KV_MAP,
        slideId
      )
      const base: StatusSlideInteractions = existing
        ? {
            slideId,
            reactions: existing.reactions && typeof existing.reactions === "object" ? existing.reactions : {},
            comments: Array.isArray(existing.comments) ? [...existing.comments] : [],
            updatedAtMs: Number(existing.updatedAtMs || 0),
          }
        : { slideId, reactions: {}, comments: [], updatedAtMs: 0 }

      const newComment: StatusCommentItem = {
        id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        slideId,
        authorName,
        authorEmail,
        authorAvatar,
        text,
        timestampLabel,
        createdAtMs: Date.now(),
      }

      base.comments = [...base.comments, newComment].slice(-100)
      base.updatedAtMs = Date.now()

      await firebaseKvSetItem(STATUS_INTERACTIONS_KV_MAP, slideId, base, INTERACTIONS_TTL_SECONDS)
      return NextResponse.json({
        ok: true,
        slideId,
        comment: newComment,
        interactions: base,
      })
    }

    if (action === "delete_comment") {
      const slideId = String(body?.slideId || "").trim()
      const commentId = String(body?.commentId || "").trim()
      if (!slideId || !commentId) {
        return NextResponse.json({ ok: false, error: "slideId and commentId are required." }, { status: 400 })
      }

      const existing = await firebaseKvGetItem<StatusSlideInteractions>(
        STATUS_INTERACTIONS_KV_MAP,
        slideId
      )
      if (!existing) {
        return NextResponse.json({ ok: true, slideId, deletedCommentId: commentId, interactions: null })
      }

      const updated: StatusSlideInteractions = {
        slideId,
        reactions: existing.reactions && typeof existing.reactions === "object" ? existing.reactions : {},
        comments: Array.isArray(existing.comments)
          ? existing.comments.filter((c) => c.id !== commentId)
          : [],
        updatedAtMs: Date.now(),
      }
      await firebaseKvSetItem(STATUS_INTERACTIONS_KV_MAP, slideId, updated, INTERACTIONS_TTL_SECONDS)
      return NextResponse.json({ ok: true, slideId, deletedCommentId: commentId, interactions: updated })
    }

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

    await Promise.all([
      firebaseKvDeleteItem(STATUS_KV_MAP, id),
      firebaseKvDeleteItem(STATUS_INTERACTIONS_KV_MAP, id),
    ])
    return NextResponse.json({ ok: true, deletedId: id })
  } catch (err: any) {
    console.error("[DELETE /api/connectin/status]", err)
    return NextResponse.json({ ok: false, error: err?.message || "Failed to delete status" }, { status: 500 })
  }
}
