"use client"

import React, { useState, useEffect } from "react"
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
} from "lucide-react"
import {
  HarvestedMediaItem,
  HarvesterDestination,
  getStoredHarvestedItemsForDestination,
  loadStoredHarvestedItems,
  saveStoredHarvestedItems,
  computeHarvesterTelemetry,
  HARVESTER_EVENT_NAME,
} from "@/lib/connectin-media-harvester"
import {
  loadMembers,
  sendSharedItemToConnectLnMember,
  DEFAULT_CONNECTLN_SHARE_MEMBERS,
  type ShareTarget,
} from "./MessageActionBar"

interface LiveHarvestedMediaShowcaseProps {
  destination: HarvesterDestination
  onOpenAdminBackend?: () => void
  onSelectForMediaStage?: (item: HarvestedMediaItem) => void
  onShareItemToFeed?: (item: HarvestedMediaItem) => void
  compact?: boolean
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
    badge: "HOME LIVE MEDIA WIRE · 60-MIN AUTO-SYNC",
    title: "Live ConnectLn Videos & Visuals Pushed to Home",
    subtitle: "Fresh domain videos and pictures synced every 60 minutes from the ConnectLn Admin Backend.",
    icon: House,
  },
  jobs: {
    badge: "JOBS VIDEO BRIEFINGS · 60-MIN AUTO-SYNC",
    title: "Live Employer Video Briefings & Jobsite Visuals",
    subtitle: "Watch real workplace videos and technical role walk-throughs synced every 60 minutes from the Admin Backend.",
    icon: Briefcase,
  },
  market: {
    badge: "MARKET DEMO STREAM · 60-MIN AUTO-SYNC",
    title: "Live Product Demo Videos & Solution Architecture Visuals",
    subtitle: "Interactive product demonstrations and enterprise solution visuals syndicated every 60 minutes.",
    icon: ShoppingBag,
  },
  media: {
    badge: "STUDIO HARVESTER STREAM · 60-MIN AUTO-SYNC",
    title: "Newly Pulled ConnectLn Videos & Visual Dispatches",
    subtitle: "Continuously growing video and visual catalog synced every 60 minutes across all ConnectLn enclaves.",
    icon: Tv,
  },
  pulse: {
    badge: "PULSE VIDEO & PHOTO WIRE · 60-MIN AUTO-SYNC",
    title: "Breaking Video & Field Visual Intelligence Dispatches",
    subtitle: "Real-time video briefings and field photography synced every 60 minutes from the Admin Media Backend.",
    icon: Radio,
  },
}

export function LiveHarvestedMediaShowcase({
  destination,
  onOpenAdminBackend,
  onSelectForMediaStage,
  onShareItemToFeed,
  compact = false,
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
  const [isSyncingNow, setIsSyncingNow] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(true)
  const [showAllItems, setShowAllItems] = useState<boolean>(false)
  const [secondsToNextAutoPull, setSecondsToNextAutoPull] = useState<number>(3600)
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({})
  const [repostedIds, setRepostedIds] = useState<Record<string, boolean>>({})
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null)
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
          const map = new Map<string, HarvestedMediaItem>()
          ;[...data.items, ...local].forEach((item) => {
            if (item && item.id && !map.has(item.id)) {
              map.set(item.id, item)
            }
          })
          saveStoredHarvestedItems(Array.from(map.values()))
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
          const map = new Map<string, HarvestedMediaItem>()
          ;[...data.telemetry.items, ...local].forEach((item) => {
            if (item && item.id && !map.has(item.id)) {
              map.set(item.id, item)
            }
          })
          saveStoredHarvestedItems(Array.from(map.values()))
          refreshFromStore()
          setSecondsToNextAutoPull(3600)
          const newestTitle = data?.pulledItems?.[0]?.title
          if (newestTitle) {
            flashToast(
              isAutoTick
                ? `⚡ 60-Min Admin Auto-Sync: Pulled "${newestTitle.slice(0, 48)}..." live!`
                : `✓ Synced new video from Admin Backend: "${newestTitle.slice(0, 48)}..."`
            )
          }
        }
      }
    } finally {
      setIsSyncingNow(false)
    }
  }

  // Visible 60-minute (3600s) countdown that pulls & syncs a fresh video every 60 minutes right into the active tab
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToNextAutoPull((prev) => {
        if (prev <= 1) {
          handleManualPullForTab(true)
          return 3600
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [destination])

  const cfg = HEADER_CONFIG[destination]
  const HeaderIcon = cfg.icon
  const defaultLimit = compact ? 3 : 4
  const visibleItems = showAllItems ? items.slice(0, 16) : items.slice(0, defaultLimit)

  if (visibleItems.length === 0) return null

  return (
    <div className="rounded-2xl border border-[#DFD4C0] dark:border-zinc-800 bg-[#FAF6EE] dark:bg-zinc-900 p-4 sm:p-5 shadow-2xs space-y-3.5">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3A2818] px-2.5 py-0.5 text-[10px] font-bold text-[#FAF6EE]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              {cfg.badge}
            </span>
            <span className="rounded-full bg-[#EFE7D6] dark:bg-zinc-800 border border-[#D5C8B0] dark:border-zinc-700 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#3A2818] dark:text-zinc-200">
              {totalVideosCount.toLocaleString()} Platform Videos · +{pulledTodayCount.toLocaleString()} Today
            </span>
            <span className="rounded-full bg-emerald-100 border border-emerald-400 px-2.5 py-0.5 text-[10px] font-mono font-extrabold text-emerald-900">
              ⏱️ Next 60-Min Auto-Sync: {Math.floor(secondsToNextAutoPull / 60)}m {String(secondsToNextAutoPull % 60).padStart(2, "0")}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <HeaderIcon className="h-4 w-4 text-[#6B4423] shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
              {cfg.title}
            </h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{cfg.subtitle}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => handleManualPullForTab(false)}
            disabled={isSyncingNow}
            className="rounded-xl bg-[#6B4423] hover:bg-[#523319] px-3 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncingNow ? "animate-spin" : ""}`} />
            <span>{isSyncingNow ? "Pulling..." : "Pull New Video Now"}</span>
          </button>

          {onOpenAdminBackend && (
            <button
              type="button"
              onClick={onOpenAdminBackend}
              className="rounded-xl border border-[#C8B99E] dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-[#EFE7D6] px-3 py-1.5 text-[11px] font-bold text-[#3A2818] dark:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="h-3 w-3 text-[#6B4423]" />
              <span>Admin Media Backend</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="rounded-xl border border-[#DFD4C0] dark:border-zinc-700 bg-white/80 dark:bg-zinc-800 p-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-[#EFE7D6] cursor-pointer"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {isExpanded && (
        <div
          className={`grid grid-cols-1 ${
            compact ? "md:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"
          } gap-3`}
        >
          {visibleItems.map((item) => {
            const isPlaying = playingId === item.id
            const isApplied = appliedIds.includes(item.id)
            return (
              <div
                key={item.id}
                className="rounded-xl border border-[#DFD4C0] dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-between shadow-2xs hover:border-[#6B4423]/60 transition-all"
              >
                <div>
                  <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                    {item.kind === "video" && isPlaying ? (
                      item.videoUrl ? (
                        <video
                          src={item.videoUrl}
                          controls
                          autoPlay
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : item.youtubeId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
                          title={item.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full border-0"
                        />
                      ) : null
                    ) : (
                      <>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                        {item.kind === "video" && (
                          <button
                            type="button"
                            onClick={() => {
                              setPlayingId(item.id)
                              if (onSelectForMediaStage) {
                                onSelectForMediaStage(item)
                              }
                            }}
                            className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                          >
                            <div className="h-10 w-10 rounded-full bg-[#6B4423]/95 group-hover:bg-[#3A2818] text-white flex items-center justify-center shadow-lg ring-2 ring-white/80 transition-transform group-hover:scale-105">
                              <Play className="h-4 w-4 fill-current ml-0.5" />
                            </div>
                          </button>
                        )}
                      </>
                    )}

                    <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none">
                      <span className="rounded-md bg-[#3A2818]/90 px-2 py-0.5 text-[9px] font-bold text-[#FAF6EE]">
                        {item.kind === "video" ? `🎬 ${item.duration || "03:15"}` : "🖼️ PHOTO"}
                      </span>
                    </div>

                    <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[9px] text-white/90 pointer-events-none">
                      <span className="truncate font-semibold">{item.category}</span>
                      <span className="font-mono bg-black/60 px-1.5 py-0.5 rounded shrink-0">
                        {item.pulledAtLabel.replace("Pulled ", "")}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-1.5">
                    <p className="text-xs font-bold text-zinc-950 dark:text-white line-clamp-2 leading-snug">
                      {destination === "jobs" && item.jobMeta
                        ? item.jobMeta.roleTitle
                        : destination === "market" && item.marketMeta
                        ? item.marketMeta.productName
                        : item.title}
                    </p>

                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {destination === "pulse" && item.pulseMeta
                        ? item.pulseMeta.takeaway
                        : item.summary}
                    </p>

                    {destination === "jobs" && item.jobMeta && (
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-1 text-[10px] font-semibold text-[#6B4423] dark:text-amber-300">
                        <span>{item.jobMeta.company}</span>
                        <span className="font-mono">{item.jobMeta.salary}</span>
                      </div>
                    )}

                    {destination === "market" && item.marketMeta && (
                      <div className="pt-1 flex items-center justify-between text-[10px] font-semibold text-[#6B4423] dark:text-amber-300">
                        <span>{item.marketMeta.vendor}</span>
                        <span className="font-mono bg-[#EFE7D6] dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[#3A2818] dark:text-zinc-200">
                          {item.marketMeta.price}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contextual Footer Action */}
                <div className="px-3 py-2 bg-[#FAF6EE]/70 dark:bg-zinc-900 border-t border-[#DFD4C0]/70 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-zinc-500 truncate">
                      {item.authorName}
                    </span>

                    {destination === "jobs" ? (
                      <button
                        type="button"
                        onClick={() =>
                          setAppliedIds((prev) =>
                            prev.includes(item.id) ? prev : [...prev, item.id]
                          )
                        }
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer ${
                          isApplied
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[#3A2818] text-white hover:bg-[#523319]"
                        }`}
                      >
                        {isApplied ? "✓ Applied" : "Video Apply"}
                      </button>
                    ) : destination === "market" && item.marketMeta ? (
                      <a
                        href={item.marketMeta.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-[#3A2818] hover:bg-[#523319] px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1"
                      >
                        <span>Launch</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPlayingId(item.id)
                          if (onSelectForMediaStage) {
                            onSelectForMediaStage(item)
                          }
                        }}
                        className="rounded-lg bg-[#EFE7D6] dark:bg-zinc-800 hover:bg-[#DFD4C0] px-2.5 py-1 text-[10px] font-bold text-[#3A2818] dark:text-zinc-200 cursor-pointer"
                      >
                        {item.kind === "video" ? "▶ Watch Video" : "Inspect Visual"}
                      </button>
                    )}
                  </div>

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
                            onClick={() =>
                              setLikedIds((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }))
                            }
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
