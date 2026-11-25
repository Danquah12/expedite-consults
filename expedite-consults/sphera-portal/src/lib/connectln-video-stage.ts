import { EDUCATIONAL_WHEEL_TALKS } from "./connectin-videos"
import {
  SKILLED_TRADES_LEARN_BY_DOING_LESSONS,
  type LearnVideoSourceProvider,
} from "./skilled-trades-learn-by-doing-data"

export const CONNECTLN_STAGE_VIDEO_EVENT = "connectln:stage-video-player"

export interface StagedConnectLnVideo {
  youtubeId?: string
  directVideoUrl?: string
  embedUrl?: string
  sourceProvider?: LearnVideoSourceProvider
  title: string
  speaker?: string
  speakerRole?: string
  serialPlate?: string
  durationLabel?: string
  description?: string
  takeaways?: string[]
  thumbnailUrl?: string
  categoryLabel?: string
  enclaveId?: string
  sourceLanguage?: string
  sourceLanguageLabel?: string
}

export interface StageConnectLnVideoDetail {
  video: StagedConnectLnVideo
  openMoreVideos?: boolean
  relatedVideos?: StagedConnectLnVideo[]
}

const VALID_YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/

export function extractPlayableYoutubeId(raw?: string): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (VALID_YT_ID_RE.test(trimmed)) return trimmed
  const m = trimmed.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  )
  return m?.[1]
}

export function stageConnectLnVideo(
  video: StagedConnectLnVideo,
  options?: {
    openMoreVideos?: boolean
    relatedVideos?: StagedConnectLnVideo[]
  }
): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<StageConnectLnVideoDetail>(CONNECTLN_STAGE_VIDEO_EVENT, {
      detail: {
        video,
        openMoreVideos: options?.openMoreVideos ?? true,
        relatedVideos: options?.relatedVideos ?? [],
      },
    })
  )
}

export interface MoreVideosCatalogParams {
  currentYoutubeId?: string
  currentDirectUrl?: string
  currentTitle?: string
  enclaveId?: string
  customRelated?: StagedConnectLnVideo[]
  feedPosts?: Array<{
    id?: string
    author?: { name?: string; headline?: string }
    media?: {
      type?: string
      youtubeId?: string
      url?: string
      thumbnailUrl?: string
      title?: string
      description?: string
      duration?: string
      serialPlate?: string
      takeaways?: string[]
    }
  }>
  limit?: number
}

function isPlayableEntry(v: StagedConnectLnVideo): boolean {
  return Boolean(
    extractPlayableYoutubeId(v.youtubeId) || v.directVideoUrl || v.embedUrl
  )
}

function normalizeStagedVideo(v: StagedConnectLnVideo): StagedConnectLnVideo {
  const yt = extractPlayableYoutubeId(v.youtubeId)
  return {
    ...v,
    youtubeId: yt,
    thumbnailUrl:
      v.thumbnailUrl ||
      (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : undefined),
  }
}

export function getConnectLnMoreVideosCatalog(
  params: MoreVideosCatalogParams
): StagedConnectLnVideo[] {
  const {
    currentYoutubeId,
    currentDirectUrl,
    currentTitle,
    enclaveId,
    customRelated = [],
    feedPosts = [],
    limit = 24,
  } = params

  const excludedYt = extractPlayableYoutubeId(currentYoutubeId)
  const excludedDirect = currentDirectUrl?.trim()
  const excludedTitle = currentTitle?.trim().toLowerCase()

  const seenKeys = new Set<string>()
  const results: StagedConnectLnVideo[] = []

  const pushCandidate = (candidate: StagedConnectLnVideo) => {
    if (results.length >= limit) return
    const normalized = normalizeStagedVideo(candidate)
    if (!isPlayableEntry(normalized)) return

    if (excludedYt && normalized.youtubeId === excludedYt) return
    if (excludedDirect && normalized.directVideoUrl?.trim() === excludedDirect) return
    if (
      !normalized.youtubeId &&
      !normalized.directVideoUrl &&
      excludedTitle &&
      normalized.title.trim().toLowerCase() === excludedTitle
    ) {
      return
    }

    const dedupeKey =
      normalized.youtubeId ||
      normalized.directVideoUrl ||
      normalized.embedUrl ||
      normalized.title.trim().toLowerCase()
    if (!dedupeKey || seenKeys.has(dedupeKey)) return
    seenKeys.add(dedupeKey)
    results.push(normalized)
  }

  // 1. Caller-provided related candidates
  for (const item of customRelated) {
    pushCandidate(item)
  }

  // 2. Playable video posts from the Home feed
  for (const post of feedPosts) {
    if (results.length >= limit) break
    const media = post?.media
    if (!media || media.type !== "video") continue
    const yt = extractPlayableYoutubeId(media.youtubeId || media.url)
    const directUrl =
      !yt &&
      media.url &&
      !/youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(media.url)
        ? media.url
        : undefined
    if (!yt && !directUrl) continue
    pushCandidate({
      youtubeId: yt,
      directVideoUrl: directUrl,
      sourceProvider: yt ? "youtube" : "connectln_native",
      title: media.title || post.author?.name || "ConnectLn Video Briefing",
      speaker: post.author?.name || "ConnectLn Member",
      speakerRole: post.author?.headline,
      serialPlate: media.serialPlate || "CLN-FEED",
      durationLabel: media.duration || "",
      description: media.description,
      takeaways: media.takeaways,
      thumbnailUrl: media.thumbnailUrl,
      categoryLabel: "Home Feed",
    })
  }

  // Helper to convert verified wheel talks
  const pushWheelTalk = (talk: (typeof EDUCATIONAL_WHEEL_TALKS)[number]) => {
    const yt = extractPlayableYoutubeId(talk.youtubeId)
    if (talk.searchUrl && !yt) return
    if (!yt) return
    pushCandidate({
      youtubeId: yt,
      sourceProvider: "youtube",
      title: talk.title,
      speaker: talk.speaker,
      speakerRole: talk.speakerTitle,
      serialPlate: talk.serialPlate,
      durationLabel: talk.duration,
      description: talk.summary,
      takeaways: talk.takeaways,
      thumbnailUrl: talk.thumbnailUrl,
      categoryLabel: talk.categoryLabel,
      enclaveId: talk.enclaveId,
    })
  }

  // 3. Matching-enclave verified talks from The Wheel
  if (enclaveId && enclaveId !== "all") {
    for (const talk of EDUCATIONAL_WHEEL_TALKS) {
      if (results.length >= limit) break
      if (talk.enclaveId === enclaveId) pushWheelTalk(talk)
    }
  }

  // 4. Matching or general lessons from Skilled Trades: Learn by Doing
  const sortedLessons =
    enclaveId && enclaveId !== "all"
      ? [
          ...SKILLED_TRADES_LEARN_BY_DOING_LESSONS.filter(
            (l) => l.enclaveId === enclaveId
          ),
          ...SKILLED_TRADES_LEARN_BY_DOING_LESSONS.filter(
            (l) => l.enclaveId !== enclaveId
          ),
        ]
      : SKILLED_TRADES_LEARN_BY_DOING_LESSONS

  for (const lesson of sortedLessons) {
    if (results.length >= limit) break
    if (!lesson.embedAvailable) continue
    const yt = extractPlayableYoutubeId(lesson.youtubeId)
    if (!yt && !lesson.directVideoUrl && !lesson.embedUrl) continue
    pushCandidate({
      youtubeId: yt,
      directVideoUrl: lesson.directVideoUrl,
      embedUrl: lesson.embedUrl,
      sourceProvider: lesson.sourceProvider,
      title: lesson.title,
      speaker: lesson.originalCreator,
      speakerRole: lesson.creatorDomain,
      serialPlate: `LBD-${lesson.lessonNumber}`,
      durationLabel: lesson.duration,
      description: lesson.description,
      takeaways: lesson.skillsCovered,
      thumbnailUrl: lesson.thumbnailUrl,
      categoryLabel: lesson.category,
      enclaveId: lesson.enclaveId,
      sourceLanguage: lesson.sourceLanguage,
      sourceLanguageLabel: lesson.sourceLanguageLabel,
    })
  }

  // 5. Remaining verified Wheel talks across professions
  for (const talk of EDUCATIONAL_WHEEL_TALKS) {
    if (results.length >= limit) break
    pushWheelTalk(talk)
  }

  return results
}
