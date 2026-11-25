"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Play,
  Search,
  ShieldCheck,
  X,
} from "lucide-react"
import type { Post, UserProfile } from "@/lib/connectln-data"
import {
  CONNECTLN_STAGE_VIDEO_EVENT,
  getConnectLnMoreVideosCatalog,
  type StageConnectLnVideoDetail,
  type StagedConnectLnVideo,
} from "@/lib/connectln-video-stage"
import {
  ConnectLnStudioPlayer,
  notifyExclusiveVideoPlay,
} from "./ConnectLnStudioPlayer"

interface ConnectLnStagedVideoModalProps {
  user?: UserProfile
  feedPosts?: Post[]
}

export function ConnectLnStagedVideoModal({
  user,
  feedPosts = [],
}: ConnectLnStagedVideoModalProps) {
  const [stagedVideo, setStagedVideo] = useState<StagedConnectLnVideo | null>(null)
  const [history, setHistory] = useState<StagedConnectLnVideo[]>([])
  const [customRelated, setCustomRelated] = useState<StagedConnectLnVideo[]>([])
  const [stageNonce, setStageNonce] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<
    "all" | "for_you" | "trades" | "tech"
  >("all")

  const stagedPlayerIdRef = useRef<string>(
    `cln-staged-modal-${Math.random().toString(36).slice(2, 10)}`
  )
  const stageScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleStageEvent = (e: Event) => {
      const detail = (e as CustomEvent<StageConnectLnVideoDetail>).detail
      if (!detail?.video) return
      setStagedVideo(detail.video)
      setCustomRelated(detail.relatedVideos || [])
      setHistory([])
      setSearchQuery("")
      setActiveCategory("all")
      setStageNonce((n) => n + 1)
      notifyExclusiveVideoPlay(stagedPlayerIdRef.current)
      setTimeout(() => {
        stageScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      }, 30)
    }

    window.addEventListener(CONNECTLN_STAGE_VIDEO_EVENT, handleStageEvent)
    return () => {
      window.removeEventListener(CONNECTLN_STAGE_VIDEO_EVENT, handleStageEvent)
    }
  }, [])

  useEffect(() => {
    if (!stagedVideo) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStagedVideo(null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [stagedVideo])

  const catalogVideos = useMemo(() => {
    if (!stagedVideo) return []
    return getConnectLnMoreVideosCatalog({
      currentYoutubeId: stagedVideo.youtubeId,
      currentDirectUrl: stagedVideo.directVideoUrl,
      currentTitle: stagedVideo.title,
      enclaveId: stagedVideo.enclaveId || user?.professionEnclave,
      customRelated,
      feedPosts,
      limit: 32,
    })
  }, [stagedVideo, user?.professionEnclave, customRelated, feedPosts])

  const filteredCatalog = useMemo(() => {
    let list = catalogVideos
    if (activeCategory === "for_you") {
      const userEnc = user?.professionEnclave
      const matched = list.filter(
        (v) =>
          (userEnc && v.enclaveId === userEnc) ||
          v.categoryLabel === "Home Feed"
      )
      if (matched.length > 0) list = matched
    } else if (activeCategory === "trades") {
      list = list.filter((v) =>
        /trades|carpentry|plumbing|electrical|welding|hvac|masonry|roofing|automotive|field|solar|machining|painting/i.test(
          `${v.enclaveId || ""} ${v.categoryLabel || ""} ${v.title}`
        )
      )
    } else if (activeCategory === "tech") {
      list = list.filter((v) =>
        /tech|cyber|software|ai|finance|business|law|telecom/i.test(
          `${v.enclaveId || ""} ${v.categoryLabel || ""} ${v.title}`
        )
      )
    }

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((v) =>
        `${v.title} ${v.speaker || ""} ${v.categoryLabel || ""} ${v.description || ""}`
          .toLowerCase()
          .includes(q)
      )
    }
    return list
  }, [catalogVideos, activeCategory, searchQuery, user?.professionEnclave])

  const handleSelectNextVideo = (nextVideo: StagedConnectLnVideo) => {
    if (!stagedVideo) return
    setHistory((prev) => [...prev, stagedVideo])
    setStagedVideo(nextVideo)
    setStageNonce((n) => n + 1)
    notifyExclusiveVideoPlay(stagedPlayerIdRef.current)
    setTimeout(() => {
      stageScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }, 30)
  }

  const handleSelectPreviousVideo = () => {
    if (history.length === 0) return
    const previous = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setStagedVideo(previous)
    setStageNonce((n) => n + 1)
    notifyExclusiveVideoPlay(stagedPlayerIdRef.current)
    setTimeout(() => {
      stageScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }, 30)
  }

  if (!stagedVideo) return null

  const nextQueuedVideo = filteredCatalog[0] || catalogVideos[0] || null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ConnectLn Staged Video Player"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 lg:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) setStagedVideo(null)
      }}
    >
      <div className="flex w-full max-w-6xl max-h-[94dvh] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
        {/* Top In-Platform Theater Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-[#12100E] px-3 sm:px-5 py-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/brand/connectln-icon-256.png"
              alt="ConnectLn"
              className="h-7 w-7 rounded-lg object-contain shrink-0"
            />
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white truncate">
              ConnectLn Video Stage
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 shrink-0">
              <ShieldCheck className="h-3 w-3" />
              <span>Staying inside ConnectLn</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleSelectPreviousVideo}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>
            )}
            {nextQueuedVideo && (
              <button
                type="button"
                onClick={() => handleSelectNextVideo(nextQueuedVideo)}
                className="inline-flex items-center gap-1 rounded-full bg-[#0A66C2] hover:bg-[#004182] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
              >
                <span>Next Video</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setStagedVideo(null)}
              aria-label="Close ConnectLn Video Stage"
              className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Main Theater Split Grid */}
        <div
          ref={stageScrollRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start"
        >
          {/* Left Column: Primary Active ConnectLn Player + Brief Metadata */}
          <div className="space-y-3 min-w-0">
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-xl">
              <ConnectLnStudioPlayer
                key={`${stagedVideo.youtubeId || stagedVideo.directVideoUrl || stagedVideo.title}-${stageNonce}`}
                youtubeId={stagedVideo.youtubeId}
                directVideoUrl={stagedVideo.directVideoUrl}
                embedUrl={stagedVideo.embedUrl}
                sourceProvider={stagedVideo.sourceProvider}
                posterImageUrl={stagedVideo.thumbnailUrl}
                title={stagedVideo.title}
                serialPlate={stagedVideo.serialPlate || "CLN-STAGE"}
                speaker={stagedVideo.speaker || "ConnectLn Masterclass"}
                speakerRole={stagedVideo.speakerRole}
                durationLabel={stagedVideo.durationLabel || ""}
                description={stagedVideo.description}
                takeaways={stagedVideo.takeaways}
                sourceLanguage={stagedVideo.sourceLanguage}
                sourceLanguageLabel={stagedVideo.sourceLanguageLabel}
                autoPlay={true}
                initialMuted={false}
                isStagedPlayer={true}
                playerId={stagedPlayerIdRef.current}
                relatedVideos={catalogVideos}
                onSelectMoreVideo={handleSelectNextVideo}
                className="w-full"
              />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5 sm:p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {stagedVideo.serialPlate && (
                  <span className="rounded bg-[#A64532] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    {stagedVideo.serialPlate}
                  </span>
                )}
                {stagedVideo.categoryLabel && (
                  <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                    {stagedVideo.categoryLabel}
                  </span>
                )}
                {stagedVideo.durationLabel && (
                  <span className="text-[11px] font-mono text-zinc-400">
                    ⏱ {stagedVideo.durationLabel}
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                {stagedVideo.title}
              </h3>

              {(stagedVideo.speaker || stagedVideo.speakerRole) && (
                <p className="text-xs font-medium text-zinc-300">
                  {stagedVideo.speaker}
                  {stagedVideo.speakerRole ? ` · ${stagedVideo.speakerRole}` : ""}
                </p>
              )}

              {stagedVideo.description && (
                <p className="text-xs leading-relaxed text-zinc-400">
                  {stagedVideo.description}
                </p>
              )}

              {stagedVideo.takeaways && stagedVideo.takeaways.length > 0 && (
                <ul className="pt-1 space-y-1 border-t border-zinc-800/80 text-[11px] text-zinc-300">
                  {stagedVideo.takeaways.slice(0, 4).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column: More Videos on ConnectLn Staging Queue */}
          <aside className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden lg:max-h-[76dvh]">
            <div className="p-3 border-b border-zinc-800 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white">
                  <Film className="h-4 w-4 text-amber-400" />
                  <span>More Videos on ConnectLn</span>
                </h4>
                <span className="rounded-full bg-[#0A66C2]/25 border border-sky-500/30 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                  {filteredCatalog.length}
                </span>
              </div>

              <div className="relative">
                <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ConnectLn videos..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-[#0A66C2] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: "for_you", label: "For You" },
                    { id: "trades", label: "Trades" },
                    { id: "tech", label: "Tech & Cyber" },
                    { id: "all", label: "All" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
                      activeCategory === tab.id
                        ? "bg-amber-500 text-zinc-950"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {filteredCatalog.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No matching videos in this filter.
                </div>
              ) : (
                filteredCatalog.map((vid, idx) => (
                  <button
                    key={`${vid.youtubeId || vid.directVideoUrl || vid.title}-${idx}`}
                    type="button"
                    onClick={() => handleSelectNextVideo(vid)}
                    className="group flex w-full items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/70 hover:border-[#0A66C2] hover:bg-zinc-900 p-2 text-left transition-all cursor-pointer"
                  >
                    <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-black">
                      {vid.thumbnailUrl ? (
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-[10px] text-zinc-400">
                          ConnectLn
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A66C2]/90 text-white">
                          <Play className="h-3 w-3 fill-white ml-0.5" />
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-[11px] font-bold text-white line-clamp-2 leading-snug group-hover:text-sky-300">
                        {vid.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {vid.speaker || "ConnectLn Masterclass"}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {vid.categoryLabel && (
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 truncate max-w-[140px]">
                            {vid.categoryLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
