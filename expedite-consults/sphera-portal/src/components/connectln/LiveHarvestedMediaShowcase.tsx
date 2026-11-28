"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Film,
  Image as ImageIcon,
  Play,
  Clock,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Briefcase,
  ShoppingBag,
  Radio,
  Tv,
  House,
  Sliders,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Share2,
  Send,
  Copy,
  Check,
  VolumeX,
  ShieldCheck,
} from "lucide-react"
import {
  HarvestedMediaItem,
  HarvesterDestination,
  getStoredHarvestedItemsForDestination,
  loadStoredHarvestedItems,
  saveStoredHarvestedItems,
  dedupeHarvestedItems,
  computeHarvesterTelemetry,
  HARVESTER_EVENT_NAME,
} from "@/lib/connectin-media-harvester"
import {
  loadMembers,
  sendSharedItemToConnectLnMember,
  DEFAULT_CONNECTLN_SHARE_MEMBERS,
  type ShareTarget,
} from "./MessageActionBar"
import { triggerReactionSplash } from "@/lib/reaction-splash"
import {
  ConnectLnStudioPlayer,
  CONNECTLN_VIDEO_PLAY_EVENT,
  notifyExclusiveVideoPlay,
} from "./ConnectLnStudioPlayer"
import { NoctisVideoInterpreterPopup } from "./NoctisVideoInterpreterPopup"
import { loadStoredUser, isSuperAdminUser } from "@/lib/connectin-storage"
import {
  registerViewportVideoSlot,
  notifyManualVideoOverride,
  requestViewportAutoplayEvaluation,
} from "@/lib/connectln-settings"

/** Direct-file (mp4) player with the same Noctis language / dubbing bar docked underneath. */
function HarvestedMp4Player({
  item,
  initialMuted = false,
  playerId,
}: {
  item: HarvestedMediaItem
  initialMuted?: boolean
  playerId?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(120)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(initialMuted)

  const isNoctisTranslationMutingActive = useCallback((incomingLang?: string) => {
    if (typeof window === "undefined") return false
    if ((window as any).__noctisVoiceDuckingActive === true) return true
    if (incomingLang && incomingLang.trim().toLowerCase() !== "en") return true
    const prefLang = ((window as any).__noctisPreferredAudioLang || "").toString().toLowerCase()
    if (prefLang && prefLang !== "en") return true
    const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase()
    if (htmlLang && htmlLang !== "en") return true
    try {
      const storedLang = (localStorage.getItem("sphera-lang") || "").toLowerCase()
      if (storedLang && storedLang !== "en") return true
    } catch {}
    return false
  }, [])

  // Start unmuted when in view; if cold-load browser policy temporarily blocks unmuted HTML5 audio, fall back cleanly and auto-unmute on first gesture
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    const syncMp4MuteState = (incomingLang?: string) => {
      if (!videoRef.current) return
      if (isNoctisTranslationMutingActive(incomingLang)) {
        videoRef.current.muted = true
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }

    const startMuted = initialMuted || isNoctisTranslationMutingActive()
    vid.muted = startMuted
    vid.volume = startMuted ? 0 : 1
    setIsMuted(startMuted)
    vid.play().catch(() => {
      vid.muted = true
      setIsMuted(true)
      vid.play().catch(() => {})
    })

    const unlockMp4 = () => {
      if (!videoRef.current) return
      if (isNoctisTranslationMutingActive()) {
        videoRef.current.muted = true
        videoRef.current.volume = 0
        setIsMuted(true)
        return
      }
      if (!videoRef.current.paused && !initialMuted) {
        videoRef.current.muted = false
        videoRef.current.volume = 1
        setIsMuted(false)
      }
    }

    const onDuckOrLangChange = (e: Event) => {
      const custom = e as CustomEvent<{ duck?: boolean; langCode?: string } | string>
      if (e.type === "connectln:noctis-voice-duck") {
        const duck = Boolean((custom.detail as any)?.duck)
        if (duck || isNoctisTranslationMutingActive()) {
          syncMp4MuteState()
        } else if (!initialMuted && videoRef.current && !videoRef.current.paused) {
          videoRef.current.muted = false
          videoRef.current.volume = 1
          setIsMuted(false)
        }
      } else {
        const detail = custom.detail
        const incomingLang = typeof detail === "string" ? detail : detail?.langCode
        if ((incomingLang && incomingLang.toLowerCase() !== "en") || isNoctisTranslationMutingActive(incomingLang)) {
          syncMp4MuteState(incomingLang)
        }
      }
    }

    window.addEventListener("pointerdown", unlockMp4, { passive: true })
    window.addEventListener("keydown", unlockMp4, { passive: true })
    window.addEventListener("connectln:noctis-voice-duck", onDuckOrLangChange)
    window.addEventListener("sphera-lang-changed", onDuckOrLangChange)
    window.addEventListener("connectln:noctis-command-language", onDuckOrLangChange)
    return () => {
      window.removeEventListener("pointerdown", unlockMp4)
      window.removeEventListener("keydown", unlockMp4)
      window.removeEventListener("connectln:noctis-voice-duck", onDuckOrLangChange)
      window.removeEventListener("sphera-lang-changed", onDuckOrLangChange)
      window.removeEventListener("connectln:noctis-command-language", onDuckOrLangChange)
    }
  }, [initialMuted, isNoctisTranslationMutingActive])

  return (
    <div className="bg-black">
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          src={item.videoUrl}
          data-connectln-player-id={playerId}
          controls
          autoPlay
          muted={isMuted}
          playsInline
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 120)}
          onPlay={(e) => {
            if (isNoctisTranslationMutingActive()) {
              e.currentTarget.muted = true
              e.currentTarget.volume = 0
              setIsMuted(true)
            }
            setIsPlaying(true)
          }}
          onPause={() => setIsPlaying(false)}
          onVolumeChange={(e) => {
            if (isNoctisTranslationMutingActive() && (!e.currentTarget.muted || e.currentTarget.volume > 0)) {
              e.currentTarget.muted = true
              e.currentTarget.volume = 0
              setIsMuted(true)
              return
            }
            setIsMuted(e.currentTarget.muted)
          }}
          className="h-full w-full object-cover"
        />
        {isPlaying && isMuted && !isNoctisTranslationMutingActive() && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (isNoctisTranslationMutingActive()) return
              if (videoRef.current) {
                videoRef.current.muted = false
                videoRef.current.volume = 1
              }
              setIsMuted(false)
            }}
            style={{ color: "#FFFFFF" }}
            className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 rounded-full bg-black/85 hover:bg-[#0A66C2] border border-white/25 px-2.5 py-1 text-[10px] font-semibold shadow-lg cursor-pointer"
          >
            <VolumeX className="h-3 w-3 text-amber-400" />
            <span style={{ color: "#FFFFFF" }}>Tap for Sound 🔊</span>
          </button>
        )}
      </div>
      <NoctisVideoInterpreterPopup
        dockedBelow={true}
        title={item.title}
        speaker={item.authorName}
        speakerRole={item.authorRole}
        serialPlate={item.serialNumber}
        description={item.summary}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onRequestPlayVideo={() => {
          videoRef.current?.play().catch(() => {})
        }}
        onMuteOriginalVideo={(duck) => {
          // Mute the original audio while Noctis is speaking so two voices never overlap
          if (videoRef.current) {
            videoRef.current.muted = duck
            videoRef.current.volume = duck ? 0 : 1
            setIsMuted(duck)
          }
        }}
      />
    </div>
  )
}

interface LiveHarvestedMediaShowcaseProps {
  destination: HarvesterDestination
  onOpenAdminBackend?: () => void
  onSelectForMediaStage?: (item: HarvestedMediaItem) => void
  onShareItemToFeed?: (item: HarvestedMediaItem) => void
  compact?: boolean
  defaultCollapsedOnMobile?: boolean
}

const HEADER_CONFIG: Record<
  HarvesterDestination,
  {
    badge: string
    title: string
    subtitle: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  home: {
    badge: "HOME LIVE MEDIA WIRE",
    title: "Live ConnectLn Videos & Visuals",
    subtitle: "Fresh domain videos and visuals synced automatically from the ConnectLn Admin Backend.",
    icon: House,
  },
  jobs: {
    badge: "JOBS VIDEO BRIEFINGS · 1-MIN AUTO-PULL",
    title: "Live Employer Video Briefings & Jobsite Visuals",
    subtitle: "Watch real workplace videos and technical role walk-throughs pushed every minute from the Admin Backend.",
    icon: Briefcase,
  },
  market: {
    badge: "MARKET DEMO STREAM · 1-MIN AUTO-PULL",
    title: "Live Product Demo Videos & Solution Architecture Visuals",
    subtitle: "Interactive product demonstrations and enterprise solution visuals syndicated every 60 seconds.",
    icon: ShoppingBag,
  },
  media: {
    badge: "STUDIO HARVESTER STREAM · 1-MIN AUTO-PULL",
    title: "Newly Pulled ConnectLn Videos & Visual Dispatches",
    subtitle: "Continuously growing video and visual catalog pulled every minute across all ConnectLn enclaves.",
    icon: Tv,
  },
  pulse: {
    badge: "PULSE VIDEO & PHOTO WIRE · 1-MIN AUTO-PULL",
    title: "Breaking Video & Field Visual Intelligence Dispatches",
    subtitle: "Real-time video briefings and field photography pushed every 60 seconds from the Admin Media Backend.",
    icon: Radio,
  },
}

export function LiveHarvestedMediaShowcase({
  destination,
  onOpenAdminBackend,
  onSelectForMediaStage,
  onShareItemToFeed,
  compact = false,
  defaultCollapsedOnMobile = false,
}: LiveHarvestedMediaShowcaseProps) {
  const [items, setItems] = useState<HarvestedMediaItem[]>(() =>
    getStoredHarvestedItemsForDestination(destination)
  )
  const [totalVideosCount, setTotalVideosCount] = useState<number>(() =>
    computeHarvesterTelemetry(loadStoredHarvestedItems()).totalVideosAllTime
  )
  const [pulledTodayCount, setPulledTodayCount] = useState<number>(() =>
    computeHarvesterTelemetry(loadStoredHarvestedItems()).pulledTodayCount
  )
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [startedByScroll, setStartedByScroll] = useState<boolean>(true)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [isSyncingNow, setIsSyncingNow] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(true)

  useEffect(() => {
    if (defaultCollapsedOnMobile && typeof window !== "undefined" && window.innerWidth < 768) {
      setIsExpanded(false)
    }
  }, [defaultCollapsedOnMobile])
  const [showAllItems, setShowAllItems] = useState<boolean>(false)
  const [secondsToNextAutoPull, setSecondsToNextAutoPull] = useState<number>(86400)
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({})
  const [repostedIds, setRepostedIds] = useState<Record<string, boolean>>({})
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null)
  const [canAccessAdminBackend, setCanAccessAdminBackend] = useState<boolean>(false)

  useEffect(() => {
    setCanAccessAdminBackend(isSuperAdminUser(loadStoredUser()))
  }, [])
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [commentsByItem, setCommentsByItem] = useState<Record<string, { id: string; author: string; text: string; time: string }[]>>({})
  const [openShareId, setOpenShareId] = useState<string | null>(null)
  const [shareMemberQuery, setShareMemberQuery] = useState<string>("")
  const [shareMembers, setShareMembers] = useState<ShareTarget[]>(DEFAULT_CONNECTLN_SHARE_MEMBERS)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    if (openShareId) {
      loadMembers().then(setShareMembers).catch(() => {})
    }
  }, [openShareId])

  const flashToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const refreshFromStore = () => {
    const all = loadStoredHarvestedItems()
    const filtered = all.filter((i) => i.destinations.includes(destination))
    const tel = computeHarvesterTelemetry(all)
    setItems(filtered)
    setTotalVideosCount(tel.totalVideosAllTime)
    setPulledTodayCount(tel.pulledTodayCount)
  }

  useEffect(() => {
    refreshFromStore()
    // Also fetch latest from server on mount so any Admin push on the server immediately syncs
    fetch("/api/connectin/media-harvester", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.items) && data.items.length > 0) {
          const local = loadStoredHarvestedItems()
          saveStoredHarvestedItems(dedupeHarvestedItems([...data.items, ...local]))
          refreshFromStore()
        }
      })
      .catch(() => {})

    const handleEvent = () => refreshFromStore()
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key.includes("connectln_harvested_media")) {
        refreshFromStore()
      }
    }
    window.addEventListener(HARVESTER_EVENT_NAME, handleEvent)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener(HARVESTER_EVENT_NAME, handleEvent)
      window.removeEventListener("storage", handleStorage)
    }
  }, [destination])

  const handleManualPullForTab = async (isAutoTick: boolean = false) => {
    setIsSyncingNow(true)
    try {
      const res = await fetch("/api/connectin/media-harvester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pull_now",
          count: 2,
          destinations: ["home", "jobs", "market", "media", "pulse"],
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data?.telemetry?.items)) {
          const local = loadStoredHarvestedItems()
          saveStoredHarvestedItems(dedupeHarvestedItems([...data.telemetry.items, ...local]))
          refreshFromStore()
          setSecondsToNextAutoPull(86400)
          const newestTitle = data?.pulledItems?.[0]?.title
          if (newestTitle) {
            flashToast(
              isAutoTick
                ? `⚡ 24h Scheduled Video Added: "${newestTitle.slice(0, 52)}..."`
                : `✓ Added fresh video (all old videos kept): "${newestTitle.slice(0, 52)}..."`
            )
          }
        }
      }
    } finally {
      setIsSyncingNow(false)
    }
  }

  // 24-hour additive live RSS sync schedule across Home, Jobs, Market, Media & Pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToNextAutoPull((prev) => {
        if (prev <= 1) {
          handleManualPullForTab(true)
          return 86400
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [destination])

  const cfg = HEADER_CONFIG[destination]
  const HeaderIcon = cfg.icon
  const defaultLimit = compact ? 3 : 4
  const visibleItems = showAllItems ? items : items.slice(0, defaultLimit)
  const visibleVideoKey = visibleItems
    .filter((i) => i.kind === "video" && (i.videoUrl || i.youtubeId))
    .map((i) => i.id)
    .join("|")

  // Stop playback whenever another video player across ConnectLn takes exclusive focus
  useEffect(() => {
    const handleExclusivePlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ playerId?: string }>
      const activeId = customEvent.detail?.playerId
      if (!activeId) return
      setPlayingId((prev) => {
        if (!prev) return null
        const myPlayerId = `harvest-${destination}-${prev}`
        return activeId === myPlayerId ? prev : null
      })
    }
    window.addEventListener(CONNECTLN_VIDEO_PLAY_EVENT, handleExclusivePlay)
    return () => window.removeEventListener(CONNECTLN_VIDEO_PLAY_EVENT, handleExclusivePlay)
  }, [destination])

  // Auto-play AND unmute videos across ALL tabs (Home, Jobs, Market, Media, Pulse) when scrolled into view!
  useEffect(() => {
    if (!isExpanded) return
    const cleanups: Array<() => void> = []

    visibleItems.forEach((item) => {
      if (item.kind !== "video" || (!item.videoUrl && !item.youtubeId)) return
      const slotPlayerId = `harvest-${destination}-${item.id}`
      cleanups.push(
        registerViewportVideoSlot({
          id: slotPlayerId,
          getElement: () => cardRefs.current[item.id] || null,
          startAutoplay: () => {
            setStartedByScroll(true)
            setPlayingId(item.id)
          },
          stopAutoplay: () => {
            setPlayingId((prev) => (prev === item.id ? null : prev))
          },
        })
      )
    })

    requestViewportAutoplayEvaluation()
    return () => {
      cleanups.forEach((fn) => fn())
    }
  }, [destination, isExpanded, visibleVideoKey])

  if (visibleItems.length === 0) return null

  return (
    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 sm:p-4 shadow-xs space-y-3">
      {/* Clean Editorial Section Header — Zero Cluttered Telemetry Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="min-w-0 flex-1 flex items-center gap-2 text-left cursor-pointer"
        >
          <HeaderIcon className="h-4 w-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
          <h3 className="text-[13.5px] sm:text-[14.5px] font-bold text-[#191919] dark:text-white line-clamp-2 sm:truncate text-left">
            {cfg.title}
          </h3>
        </button>

        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {canAccessAdminBackend && (
            <button
              type="button"
              onClick={() => handleManualPullForTab(false)}
              disabled={isSyncingNow}
              className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncingNow ? "animate-spin" : ""}`} />
              <span>{isSyncingNow ? "Syncing..." : "Sync Video"}</span>
            </button>
          )}

          {onOpenAdminBackend && canAccessAdminBackend && (
            <button
              type="button"
              onClick={onOpenAdminBackend}
              className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="h-3 w-3" />
              <span>Backend</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer shrink-0"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Clean WSJ-Format Editorial Cards Grid */}
      {isExpanded && (
        <div
          className={`grid grid-cols-1 ${
            compact ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
          } gap-3.5`}
        >
          {visibleItems.map((item) => {
            const isPlaying = playingId === item.id
            const isApplied = appliedIds.includes(item.id)
            const slotPlayerId = `harvest-${destination}-${item.id}`
            const displayHeadline =
              destination === "jobs" && item.jobMeta
                ? item.jobMeta.roleTitle
                : destination === "market" && item.marketMeta
                ? item.marketMeta.productName
                : item.title
            const displaySummary =
              destination === "pulse" && item.pulseMeta
                ? item.pulseMeta.takeaway
                : item.summary

            return (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) cardRefs.current[item.id] = el
                  else delete cardRefs.current[item.id]
                }}
                className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-between shadow-xs hover:border-zinc-300 transition-all"
              >
                <div>
                  {/* 1. Clean WSJ Author Header */}
                  <div className="px-3.5 pt-3 pb-1.5 flex items-center gap-2.5">
                    <img
                      src={
                        item.authorAvatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.authorName)}&backgroundColor=191919`
                      }
                      alt={item.authorName}
                      className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-[13.5px] font-semibold text-[#191919] dark:text-zinc-100 truncate leading-tight">
                          {item.organization || item.authorName}
                        </p>
                        <ShieldCheck className="h-3.5 w-3.5 text-[#666666] dark:text-zinc-400 shrink-0" />
                      </div>
                      <p className="text-[11.5px] text-[#666666] dark:text-zinc-400 truncate leading-tight">
                        {item.authorName} · {item.category}
                      </p>
                    </div>
                  </div>

                  {/* 2. Clean 2-Line Editorial Copy Above Media */}
                  <div className="px-3.5 pb-2.5">
                    <p className="text-[13px] text-[#191919] dark:text-zinc-200 line-clamp-2 leading-[1.42]">
                      {displaySummary}
                    </p>
                  </div>

                  {/* 3. Full-Bleed Unclouded WSJ Media Stage (Editorial Serif Headline on Bottom-Left) */}
                  {item.kind === "video" && isPlaying && (item.videoUrl || item.youtubeId) ? (
                    item.videoUrl ? (
                      <HarvestedMp4Player
                        item={item}
                        initialMuted={false}
                        playerId={slotPlayerId}
                      />
                    ) : (
                      <ConnectLnStudioPlayer
                        youtubeId={item.youtubeId as string}
                        title={displayHeadline}
                        serialPlate={item.serialNumber}
                        speaker={item.authorName}
                        speakerRole={item.authorRole}
                        description={item.summary}
                        durationLabel={item.duration}
                        initialMuted={false}
                        playerId={slotPlayerId}
                        onExclusiveStop={() => setPlayingId((prev) => (prev === item.id ? null : prev))}
                        className="w-full"
                      />
                    )
                  ) : (
                    <div
                      onClick={() => {
                        if (item.kind !== "video") return
                        setStartedByScroll(false)
                        notifyManualVideoOverride(slotPlayerId, cardRefs.current[item.id])
                        notifyExclusiveVideoPlay(slotPlayerId)
                        setPlayingId(item.id)
                        if (onSelectForMediaStage) {
                          onSelectForMediaStage(item)
                        }
                      }}
                      className={`relative aspect-[16/10] bg-zinc-950 overflow-hidden border-y border-zinc-100 dark:border-zinc-800 ${
                        item.kind === "video" ? "cursor-pointer group" : ""
                      }`}
                    >
                      <img
                        src={
                          item.imageUrl ||
                          (item.youtubeId
                            ? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`
                            : "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&auto=format&fit=crop&q=80")
                        }
                        alt={displayHeadline}
                        onError={(e) => {
                          const img = e.currentTarget
                          if (img.dataset.fallbackApplied === "1") return
                          img.dataset.fallbackApplied = "1"
                          img.src = item.youtubeId
                            ? `https://i.ytimg.com/vi/${item.youtubeId}/mqdefault.jpg`
                            : "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&auto=format&fit=crop&q=80"
                        }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                      {item.kind === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="h-11 w-11 rounded-full bg-black/60 border border-white/30 text-white flex items-center justify-center shadow-lg backdrop-blur-xs transition-transform group-hover:scale-105">
                            <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3 pt-6 flex items-end justify-between gap-3 pointer-events-none">
                        <h4
                          style={{
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: "#FFFFFF",
                          }}
                          className="text-[15px] sm:text-[17px] font-bold leading-[1.18] line-clamp-2 max-w-[85%] drop-shadow-md"
                        >
                          {displayHeadline}
                        </h4>
                        <span
                          style={{
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: "rgba(255,255,255,0.9)",
                          }}
                          className="text-xs font-bold tracking-tight shrink-0"
                        >
                          CLN
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contextual Footer Action (Only Jobs/Market CTAs + Single Clean Social Row — Zero Repeated Title or Watch Button!) */}
                <div className="px-3.5 py-2 bg-white dark:bg-zinc-950 space-y-1.5">
                  {(destination === "jobs" && item.jobMeta) || (destination === "market" && item.marketMeta) ? (
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                      {destination === "jobs" && item.jobMeta ? (
                        <>
                          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 truncate">
                            {item.jobMeta.company} · {item.jobMeta.salary}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setAppliedIds((prev) =>
                                prev.includes(item.id) ? prev : [...prev, item.id]
                              )
                            }
                            className={`rounded-full px-3 py-0.5 text-[10.5px] font-semibold cursor-pointer ${
                              isApplied
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                            }`}
                          >
                            {isApplied ? "✓ Applied" : "Apply"}
                          </button>
                        </>
                      ) : destination === "market" && item.marketMeta ? (
                        <>
                          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 truncate">
                            {item.marketMeta.vendor} · {item.marketMeta.price}
                          </span>
                          <a
                            href={item.marketMeta.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-3 py-0.5 text-[10.5px] font-semibold text-white flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Full Social Engagement & Multi-Platform Share Strip (Like, Comment, Post/Repost, Share) */}
                  {(() => {
                    const isLiked = Boolean(likedIds[item.id])
                    const isReposted = Boolean(repostedIds[item.id])
                    const itemComments = commentsByItem[item.id] || []
                    const shareUrl = `https://www.conectln.com/connectin?tab=${destination}&media=${encodeURIComponent(item.id)}`
                    const shareText = `📢 ${item.title} (${item.authorName}) on ConnectLn:\n\n"${item.summary}"\n\n🔗 ${shareUrl}`
                    const filteredMembers = shareMembers
                      .filter((m) => {
                        const q = shareMemberQuery.trim().toLowerCase()
                        if (!q) return true
                        return (
                          m.name.toLowerCase().includes(q) ||
                          (m.subtitle || "").toLowerCase().includes(q)
                        )
                      })
                      .slice(0, 5)

                    return (
                      <div className="pt-1.5 border-t border-[#DFD4C0]/60 dark:border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                          {/* Like */}
                          <button
                            type="button"
                            onClick={(e) => {
                              triggerReactionSplash("like", { clientX: e.clientX, clientY: e.clientY })
                              setLikedIds((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }))
                            }}
                            className={`flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors cursor-pointer ${
                              isLiked
                                ? "bg-blue-50 text-[#0A66C2] dark:bg-blue-950/40 dark:text-sky-300"
                                : "text-zinc-600 hover:bg-[#EFE7D6] dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>{isLiked ? "Liked · 1" : "Like"}</span>
                          </button>

                          {/* Comment */}
                          <button
                            type="button"
                            onClick={() =>
                              setOpenCommentsId((prev) => (prev === item.id ? null : item.id))
                            }
                            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-zinc-600 hover:bg-[#EFE7D6] dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>
                              Comment{itemComments.length > 0 ? ` (${itemComments.length})` : ""}
                            </span>
                          </button>

                          {/* Post / Repost */}
                          <button
                            type="button"
                            onClick={() => {
                              setRepostedIds((prev) => ({ ...prev, [item.id]: true }))
                              if (onShareItemToFeed) {
                                onShareItemToFeed(item)
                              }
                              flashToast(`✓ Reposted "${item.title.slice(0, 32)}..." to ConnectLn Feed`)
                            }}
                            className={`flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors cursor-pointer ${
                              isReposted
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "text-zinc-600 hover:bg-[#EFE7D6] dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <Repeat2 className="h-3 w-3" />
                            <span>{isReposted ? "Reposted ✓" : "Repost"}</span>
                          </button>

                          {/* Share Popover Toggle */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenShareId((prev) => (prev === item.id ? null : item.id))
                              }
                              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-zinc-600 hover:bg-[#EFE7D6] dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <Share2 className="h-3 w-3" />
                              <span>Share</span>
                            </button>

                            {openShareId === item.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={() => setOpenShareId(null)}
                                />
                                <div className="absolute right-0 bottom-full mb-1.5 z-40 w-68 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 shadow-2xl text-zinc-900 dark:text-zinc-100 space-y-2">
                                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0A66C2] dark:text-sky-400">
                                    ↪ Share to ConnectLn Member:
                                  </p>
                                  <input
                                    type="text"
                                    value={shareMemberQuery}
                                    onChange={(e) => setShareMemberQuery(e.target.value)}
                                    placeholder="Search person on ConnectLn..."
                                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[11px] focus:outline-none focus:border-[#0A66C2]"
                                  />
                                  <div className="max-h-32 overflow-y-auto space-y-1">
                                    {filteredMembers.map((member) => (
                                      <button
                                        key={member.id}
                                        type="button"
                                        onClick={async () => {
                                          await sendSharedItemToConnectLnMember({
                                            senderName: "Kwesi Asiedu",
                                            target: member,
                                            itemTitle: item.title,
                                            itemText: item.summary,
                                            shareUrl,
                                            itemKindLabel:
                                              item.kind === "video"
                                                ? "ConnectLn Video"
                                                : "ConnectLn Visual",
                                          })
                                          setOpenShareId(null)
                                          flashToast(`✓ Shared with ${member.name} on ConnectLn`)
                                        }}
                                        className="flex w-full items-center justify-between gap-2 rounded-lg p-1 text-left hover:bg-sky-50 dark:hover:bg-sky-950/40 cursor-pointer"
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <img
                                            src={
                                              member.avatar ||
                                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0a66c2`
                                            }
                                            alt={member.name}
                                            className="h-5 w-5 rounded-full object-cover shrink-0"
                                          />
                                          <span className="text-[10px] font-bold truncate">
                                            {member.name}
                                          </span>
                                        </div>
                                        <span className="rounded-full bg-[#0A66C2] px-1.5 py-0.5 text-[9px] font-bold text-white shrink-0">
                                          Send
                                        </span>
                                      </button>
                                    ))}
                                  </div>

                                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                    Share Externally:
                                  </p>
                                  <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        window.open(
                                          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                                          "_blank"
                                        )
                                        setOpenShareId(null)
                                      }}
                                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 py-1 px-1.5 hover:bg-sky-50 text-[#0A66C2] cursor-pointer"
                                    >
                                      LinkedIn
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        window.open(
                                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
                                          "_blank"
                                        )
                                        setOpenShareId(null)
                                      }}
                                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 py-1 px-1.5 hover:bg-blue-50 text-[#1877F2] cursor-pointer"
                                    >
                                      Facebook
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard?.writeText(shareText).catch(() => {})
                                        window.open("https://www.instagram.com/", "_blank")
                                        setOpenShareId(null)
                                        flashToast("Copied caption & opened Instagram")
                                      }}
                                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 py-1 px-1.5 hover:bg-pink-50 text-[#E1306C] cursor-pointer"
                                    >
                                      Instagram
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        window.open(
                                          `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
                                          "_blank"
                                        )
                                        setOpenShareId(null)
                                      }}
                                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 py-1 px-1.5 hover:bg-emerald-50 text-[#25D366] cursor-pointer"
                                    >
                                      WhatsApp
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        window.open(
                                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(shareUrl)}`,
                                          "_blank"
                                        )
                                        setOpenShareId(null)
                                      }}
                                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 py-1 px-1.5 hover:bg-zinc-100 cursor-pointer"
                                    >
                                      Post 𝕏
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard?.writeText(shareUrl).catch(() => {})
                                        setCopiedId(item.id)
                                        setTimeout(() => setCopiedId(null), 2000)
                                      }}
                                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 py-1 px-1.5 hover:bg-zinc-100 flex items-center justify-center gap-0.5 cursor-pointer"
                                    >
                                      {copiedId === item.id ? (
                                        <Check className="h-3 w-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                      <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Inline Comment Drawer */}
                        {openCommentsId === item.id && (
                          <div className="rounded-lg border border-[#DFD4C0] dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 space-y-1.5 text-[11px]">
                            {itemComments.length > 0 && (
                              <div className="max-h-24 overflow-y-auto space-y-1">
                                {itemComments.map((c) => (
                                  <div key={c.id} className="rounded bg-zinc-50 dark:bg-zinc-900 px-2 py-1">
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                      {c.author}
                                    </span>{" "}
                                    <span className="text-[9px] text-zinc-400">{c.time}</span>
                                    <p className="text-zinc-700 dark:text-zinc-300">{c.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            <form
                              onSubmit={(e) => {
                                e.preventDefault()
                                const text = (commentDrafts[item.id] || "").trim()
                                if (!text) return
                                setCommentsByItem((prev) => ({
                                  ...prev,
                                  [item.id]: [
                                    ...(prev[item.id] || []),
                                    {
                                      id: `hc_${Date.now()}`,
                                      author: "Kwesi Asiedu",
                                      text,
                                      time: "Just now",
                                    },
                                  ],
                                }))
                                setCommentDrafts((prev) => ({ ...prev, [item.id]: "" }))
                              }}
                              className="flex items-center gap-1"
                            >
                              <input
                                type="text"
                                value={commentDrafts[item.id] || ""}
                                onChange={(e) =>
                                  setCommentDrafts((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                placeholder="Add a comment..."
                                className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1 text-[11px] focus:outline-none focus:border-[#0A66C2]"
                              />
                              <button
                                type="submit"
                                className="rounded-md bg-[#0A66C2] px-2 py-1 text-[10px] font-bold text-white cursor-pointer"
                              >
                                Post
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isExpanded && items.length > defaultLimit && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
            Showing {visibleItems.length} of {items.length} synced items for {destination.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={() => setShowAllItems((prev) => !prev)}
            className="rounded-full border border-[#6B4423]/40 bg-white hover:bg-[#EFE7D6] px-3.5 py-1 text-xs font-extrabold text-[#3A2818] cursor-pointer transition-all"
          >
            {showAllItems
              ? "▲ Show Top Recent Videos"
              : `▼ View All ${items.length} Synced Admin Videos & Visuals`}
          </button>
        </div>
      )}

      {toastMsg && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-[10px] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
