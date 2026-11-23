/**
 * ConnectLn Status Social Video Parser & Embed URL Builder
 * Supports YouTube (videos, Shorts, live, youtu.be), Facebook (watch, videos, reels, fb.watch, share),
 * and TikTok (standard video links and mobile vm/vt/t short links).
 */

export type SocialEmbedProvider = "youtube" | "facebook" | "tiktok"
export type StatusSocialPlatform = "YouTube" | "Facebook" | "TikTok"

export interface ParsedSocialVideo {
  provider: SocialEmbedProvider
  platform: StatusSocialPlatform
  originalUrl: string
  canonicalUrl: string
  embedUrl: string
  videoId?: string
  playlistId?: string
  isVertical: boolean
  thumbnailUrl?: string
  formatLabel: string
  needsServerResolve: boolean
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
])

const TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
])

const FACEBOOK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "mbasic.facebook.com",
  "fb.watch",
  "www.fb.watch",
])

export function isAllowedSocialResolveHost(hostname: string): boolean {
  const host = String(hostname || "").toLowerCase().trim()
  if (!host) return false
  if (YOUTUBE_HOSTS.has(host) || TIKTOK_HOSTS.has(host) || FACEBOOK_HOSTS.has(host)) {
    return true
  }
  return (
    host.endsWith(".youtube.com") ||
    host.endsWith(".tiktok.com") ||
    host.endsWith(".facebook.com") ||
    host.endsWith(".fb.watch")
  )
}

export function splitLinkAndCustomTitle(rawLine: string): { url: string; customTitle: string } {
  const trimmed = String(rawLine || "").trim()
  const pipeIdx = trimmed.indexOf("|")
  if (pipeIdx !== -1) {
    return {
      url: trimmed.slice(0, pipeIdx).trim(),
      customTitle: trimmed.slice(pipeIdx + 1).trim(),
    }
  }
  const urlMatch = trimmed.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/i)
  if (urlMatch) {
    const matchedUrl = urlMatch[0]
    const remainingTitle = trimmed
      .replace(matchedUrl, " ")
      .replace(/[-–—:|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    return {
      url: matchedUrl,
      customTitle: remainingTitle,
    }
  }
  return { url: trimmed, customTitle: "" }
}

function normalizeInputUrl(raw: string): URL | null {
  let clean = String(raw || "").trim()
  if (!clean || clean.startsWith("/") || clean.startsWith("data:") || clean.startsWith("blob:")) {
    return null
  }
  if (/\s/.test(clean)) {
    const extracted = clean.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/i)?.[0]
    if (extracted) {
      clean = extracted
    } else {
      return null
    }
  }
  if (!/^https?:\/\//i.test(clean)) {
    if (/^(www\.|m\.|music\.|vm\.|vt\.)?(youtube\.com|youtu\.be|tiktok\.com|facebook\.com|fb\.watch)/i.test(clean)) {
      clean = `https://${clean}`
    } else {
      return null
    }
  }
  if (clean.startsWith("http://")) {
    clean = `https://${clean.slice(7)}`
  }
  try {
    return new URL(clean)
  } catch {
    return null
  }
}

function extractYouTubePlaylistId(parsedUrl: URL): string | null {
  const rawList = parsedUrl.searchParams.get("list")
  if (!rawList) return null
  const match = rawList.trim().match(/^([a-zA-Z0-9_-]{10,120})$/)
  return match ? match[1] : null
}

function extractYouTubeId(parsedUrl: URL): { id: string; isVertical: boolean } | null {
  const host = parsedUrl.hostname.toLowerCase()
  const path = parsedUrl.pathname
  const cleanId = (candidate?: string | null): string | null => {
    if (!candidate) return null
    const match = candidate.trim().match(/^([a-zA-Z0-9_-]{11})$/)
    return match ? match[1] : null
  }

  if (host === "youtu.be") {
    const seg = path.split("/").filter(Boolean)[0]
    const id = cleanId(seg)
    return id ? { id, isVertical: false } : null
  }

  if (path.startsWith("/shorts/")) {
    const id = cleanId(path.split("/").filter(Boolean)[1])
    return id ? { id, isVertical: true } : null
  }

  if (path.startsWith("/embed/") || path.startsWith("/live/") || path.startsWith("/v/")) {
    const id = cleanId(path.split("/").filter(Boolean)[1])
    return id ? { id, isVertical: false } : null
  }

  const vParam = cleanId(parsedUrl.searchParams.get("v"))
  if (vParam) {
    return { id: vParam, isVertical: false }
  }

  return null
}

function buildFacebookEmbedUrl(canonicalUrl: string, isVertical: boolean): string {
  const width = isVertical ? 320 : 560
  const height = isVertical ? 560 : 315
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(canonicalUrl)}&show_text=false&autoplay=true&allowfullscreen=true&width=${width}&height=${height}`
}

export function buildTikTokEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&controls=1&music_info=1&description=1&rel=0`
}

export function parseSocialVideoUrl(rawInput: string): ParsedSocialVideo | null {
  const u = normalizeInputUrl(rawInput)
  if (!u) return null

  const host = u.hostname.toLowerCase()
  const originalUrl = u.toString()

  // 1. YouTube (Videos, Shorts, Live, YouTube Music, and Playlists / Dynamic Mixes)
  if (YOUTUBE_HOSTS.has(host) || host.endsWith(".youtube.com")) {
    const isMusicHost = host === "music.youtube.com"
    const yt = extractYouTubeId(u)
    const playlistId = extractYouTubePlaylistId(u)

    if (yt) {
      const canonicalUrl = yt.isVertical
        ? `https://www.youtube.com/shorts/${yt.id}`
        : playlistId
          ? `https://www.youtube.com/watch?v=${yt.id}&list=${encodeURIComponent(playlistId)}`
          : `https://www.youtube.com/watch?v=${yt.id}`
      const embedUrl = playlistId
        ? `https://www.youtube.com/embed/${yt.id}?list=${encodeURIComponent(playlistId)}&autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
        : `https://www.youtube.com/embed/${yt.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
      return {
        provider: "youtube",
        platform: "YouTube",
        originalUrl,
        canonicalUrl,
        embedUrl,
        videoId: yt.id,
        playlistId: playlistId || undefined,
        isVertical: yt.isVertical,
        thumbnailUrl: `https://i.ytimg.com/vi/${yt.id}/hqdefault.jpg`,
        formatLabel: yt.isVertical
          ? "YT SHORTS"
          : isMusicHost
            ? "YT MUSIC"
            : playlistId
              ? "YT PLAYLIST"
              : "YOUTUBE",
        needsServerResolve: false,
      }
    }

    if (playlistId) {
      const isDynamicMix = /^RD/i.test(playlistId)
      return {
        provider: "youtube",
        platform: "YouTube",
        originalUrl,
        canonicalUrl: `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`,
        embedUrl: `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`,
        playlistId,
        isVertical: false,
        formatLabel: isMusicHost ? "YT MUSIC PLAYLIST" : "YT PLAYLIST",
        needsServerResolve: isDynamicMix,
      }
    }

    return null
  }

  // 2. TikTok
  if (TIKTOK_HOSTS.has(host) || host.endsWith(".tiktok.com")) {
    const path = u.pathname
    // Exclude bare homepage https://www.tiktok.com/
    const isShortHost = host === "vm.tiktok.com" || host === "vt.tiktok.com"
    const isShortPath = path.startsWith("/t/")
    if (!isShortHost && (!path || path === "/")) {
      return null
    }

    const idMatch =
      path.match(/\/(?:video|v|embed\/v2|player\/v1)\/(\d{15,22})/) ||
      u.searchParams.get("item_id")?.match(/^(\d{15,22})$/)

    const videoId = idMatch?.[1]
    if (videoId) {
      const canonicalUrl = isShortHost || isShortPath
        ? `https://www.tiktok.com/video/${videoId}`
        : `https://www.tiktok.com${path}`
      return {
        provider: "tiktok",
        platform: "TikTok",
        originalUrl,
        canonicalUrl,
        embedUrl: buildTikTokEmbedUrl(videoId),
        videoId,
        isVertical: true,
        formatLabel: "TIKTOK",
        needsServerResolve: false,
      }
    }

    if (isShortHost || isShortPath || /\/@[a-zA-Z0-9_.]+\/(?:video|photo)\//.test(path)) {
      return {
        provider: "tiktok",
        platform: "TikTok",
        originalUrl,
        canonicalUrl: originalUrl,
        embedUrl: "",
        isVertical: true,
        formatLabel: "TIKTOK",
        needsServerResolve: true,
      }
    }

    return null
  }

  // 3. Facebook
  if (FACEBOOK_HOSTS.has(host) || host.endsWith(".facebook.com") || host.endsWith(".fb.watch")) {
    // Unwrap plugins/video.php?href=...
    if (u.pathname.startsWith("/plugins/video.php")) {
      const innerHref = u.searchParams.get("href")
      if (innerHref) {
        return parseSocialVideoUrl(innerHref)
      }
    }

    const isFbWatchHost = host === "fb.watch" || host.endsWith(".fb.watch")
    const path = u.pathname
    const isShareLink = path.startsWith("/share/")
    const isReel = path.includes("/reel/") || path.includes("/reels/") || path.startsWith("/share/r/")
    const hasVideoSignal =
      isFbWatchHost ||
      isShareLink ||
      isReel ||
      path.startsWith("/watch") ||
      path.includes("/videos/") ||
      path.includes("/video.php") ||
      Boolean(u.searchParams.get("v"))

    // Do NOT treat bare homepage "https://www.facebook.com" as an embedded video
    if (!hasVideoSignal) {
      return null
    }

    const canonicalObj = new URL(originalUrl)
    if (
      canonicalObj.hostname === "m.facebook.com" ||
      canonicalObj.hostname === "web.facebook.com" ||
      canonicalObj.hostname === "mbasic.facebook.com" ||
      canonicalObj.hostname === "facebook.com"
    ) {
      canonicalObj.hostname = "www.facebook.com"
    }
    const canonicalUrl = canonicalObj.toString()
    const needsServerResolve = isFbWatchHost || isShareLink

    return {
      provider: "facebook",
      platform: "Facebook",
      originalUrl,
      canonicalUrl,
      embedUrl: buildFacebookEmbedUrl(canonicalUrl, isReel),
      isVertical: isReel,
      formatLabel: isReel ? "FB REEL" : "FB VIDEO",
      needsServerResolve,
    }
  }

  return null
}

export function buildStatusEmbedIframeSrc(
  embedUrl: string,
  provider: SocialEmbedProvider | undefined,
  muted: boolean
): string {
  if (!embedUrl) return ""
  try {
    const u = new URL(embedUrl)
    if (provider === "youtube" || u.hostname.includes("youtube")) {
      u.searchParams.set("mute", muted ? "1" : "0")
      return u.toString()
    }
    if (provider === "facebook" || u.hostname.includes("facebook")) {
      u.searchParams.set("mute", muted ? "1" : "0")
      return u.toString()
    }
    return u.toString()
  } catch {
    return embedUrl
  }
}
