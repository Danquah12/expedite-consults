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

interface LiveHarvestedMediaShowcaseProps {
  destination: HarvesterDestination
  onOpenAdminBackend?: () => void
  onSelectForMediaStage?: (item: HarvestedMediaItem) => void
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
    badge: "HOME LIVE MEDIA WIRE · 1-MIN AUTO-PULL",
    title: "Live ConnectLn Videos & Visuals Pushed to Home",
    subtitle: "Fresh domain videos and pictures pulled every 60 seconds from the ConnectLn Admin Backend.",
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
  const [appliedIds, setAppliedIds] = useState<string[]>([])

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
    const handleEvent = () => refreshFromStore()
    window.addEventListener(HARVESTER_EVENT_NAME, handleEvent)
    return () => window.removeEventListener(HARVESTER_EVENT_NAME, handleEvent)
  }, [destination])

  const handleManualPullForTab = async () => {
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
        }
      }
    } finally {
      setIsSyncingNow(false)
    }
  }

  const cfg = HEADER_CONFIG[destination]
  const HeaderIcon = cfg.icon
  const visibleItems = items.slice(0, compact ? 3 : 4)

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
            onClick={handleManualPullForTab}
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
                <div className="px-3 py-2 bg-[#FAF6EE]/70 dark:bg-zinc-900 border-t border-[#DFD4C0]/70 dark:border-zinc-800 flex items-center justify-between gap-2">
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
