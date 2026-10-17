"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  X,
  Sparkles,
  Share2,
  CheckCircle2,
  Tv,
  GraduationCap,
  ShieldCheck,
  RotateCcw
} from "lucide-react"
import { EDUCATIONAL_WHEEL_TALKS, WheelVideoTalk } from "@/lib/connectin-videos"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ConnectInVideoWheelProps {
  className?: string
  defaultCategory?: 'all' | 'finance' | 'trade' | 'compliance' | 'security'
  title?: string
  subtitle?: string
  onOpenVideoGuide?: () => void
}

export function ConnectInVideoWheel({
  className = "",
  defaultCategory = "all",
  title = "The Wheel — 5-Minute Masterclasses & Briefings",
  subtitle = "Expedite Consults educational talks, apprenticeship standards, and contractor strategy.",
  onOpenVideoGuide
}: ConnectInVideoWheelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory)
  const [activeVideo, setActiveVideo] = useState<WheelVideoTalk | null>(null)
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(true)
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const filteredTalks = selectedCategory === "all"
    ? EDUCATIONAL_WHEEL_TALKS
    : EDUCATIONAL_WHEEL_TALKS.filter(t => t.category === selectedCategory)

  // Smooth scroll left / right
  const scrollWheel = (direction: 'left' | 'right') => {
    if (!trackRef.current) return
    const offset = direction === 'left' ? -320 : 320
    trackRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  // Auto-scroll loop when auto-play is enabled
  useEffect(() => {
    if (!isPlayingAuto) return
    const interval = setInterval(() => {
      if (trackRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = trackRef.current
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          trackRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          trackRef.current.scrollBy({ left: 240, behavior: 'smooth' })
        }
      }
    }, 6000)

    return () => clearInterval(interval)
  }, [isPlayingAuto])

  const handleShareVideo = (video: WheelVideoTalk) => {
    const url = `https://www.youtube.com/watch?v=${video.youtubeId}`
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2500)
    }
  }

  const handlePlayNext = () => {
    if (!activeVideo) return
    const currentIndex = filteredTalks.findIndex(t => t.id === activeVideo.id)
    const nextIndex = (currentIndex + 1) % filteredTalks.length
    setActiveVideo(filteredTalks[nextIndex])
  }

  return (
    <section className={`overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#1C1916] text-[#EFE8DC] p-4 sm:p-5 shadow-lg relative ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#35302B] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              🎡
            </span>
            <h2 className="font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 font-semibold">
                Expedite Consults Series
              </span>
            </h2>
          </div>
          <p className="text-xs text-[#EFE8DC]/70 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {onOpenVideoGuide && (
            <button
              type="button"
              onClick={onOpenVideoGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold transition-all cursor-pointer mr-1"
            >
              <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
              <span>Platform Guide</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPlayingAuto(!isPlayingAuto)}
            className={`h-8 px-2.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border ${
              isPlayingAuto
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-white/10 border-white/20 text-[#EFE8DC]/80 hover:bg-white/15"
            }`}
            title={isPlayingAuto ? "Pause rotation" : "Resume auto-rotation"}
          >
            {isPlayingAuto ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span className="text-[11px]">{isPlayingAuto ? "Rotation: On" : "Paused"}</span>
          </button>

          <button
            type="button"
            onClick={() => scrollWheel('left')}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous plate"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollWheel('right')}
            className="h-8 w-8 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 transition-colors cursor-pointer font-bold"
            aria-label="Next plate"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar text-xs">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#EFE8DC]/50 shrink-0 mr-1">
          Filter Talks:
        </span>
        {[
          { id: "all", label: "All Briefings (12)" },
          { id: "finance", label: "Financial & Tax Advisory (5)" },
          { id: "trade", label: "Trades & Craftsmanship (6)" },
          { id: "compliance", label: "Safety & OSHA (1)" }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                : "bg-white/5 text-[#EFE8DC]/70 hover:bg-white/10 border border-white/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* The Wheel Horizontal Scrolling Track */}
      <div
        ref={trackRef}
        className="flex gap-3.5 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {filteredTalks.map((talk) => (
          <div
            key={talk.id}
            onClick={() => setActiveVideo(talk)}
            className="group relative h-[18.5rem] w-[14rem] sm:w-[15.5rem] shrink-0 snap-center rounded-2xl overflow-hidden border border-[#3E3832] bg-[#25211D] hover:border-amber-500/70 transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between shadow-md"
          >
            {/* Top Serial Plate Badge */}
            <div className="p-2.5 flex items-center justify-between border-b border-[#35302B] bg-[#1F1B18]/90 z-10">
              <span className="font-mono text-[10px] font-bold tracking-wider text-amber-300/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                {talk.serialPlate}
              </span>
              <span className="text-[10px] font-bold text-[#EFE8DC]/75 px-1.5 py-0.5 rounded bg-white/5">
                ⏱ {talk.duration}
              </span>
            </div>

            {/* Video Thumbnail with Play Button Overlay */}
            <div className="relative flex-1 overflow-hidden bg-black/40">
              <img
                src={talk.thumbnailUrl}
                alt={talk.title}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#1C1916] via-[#1C1916]/40 to-transparent" />

              {/* Centered Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-11 w-11 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform group-hover:bg-amber-400">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>

              {/* Category Pill Over Thumbnail */}
              <div className="absolute bottom-2 left-2.5 right-2.5">
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-black/70 px-2 py-0.5 rounded border border-amber-500/30 backdrop-blur-xs">
                  {talk.categoryLabel}
                </span>
              </div>
            </div>

            {/* Bottom Meta & Card Title */}
            <div className="p-3 bg-[#1C1916] border-t border-[#35302B] space-y-1">
              <h3 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                {talk.title}
              </h3>
              <p className="text-[10px] text-[#EFE8DC]/60 truncate">
                {talk.speaker}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Callout */}
      <div className="mt-3 pt-3 border-t border-[#35302B] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#EFE8DC]/60">
        <p className="text-[11px] flex items-center gap-1.5">
          <span>🔒</span>
          <span>
            Expedite Consults Trade & Enterprise Education series is free for all verified ConnectIn members.
          </span>
        </p>
        <span className="text-[10px] font-mono text-amber-400/80">
          Continuous Rotation · Tap Plate for Interactive Viewer
        </span>
      </div>

      {/* Video Modal Player Dialog */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => { if (!open) setActiveVideo(null) }}>
        <DialogContent className="max-w-3xl p-0 border border-zinc-700 bg-zinc-950 text-white rounded-3xl overflow-hidden shadow-2xl">
          {activeVideo && (
            <div className="space-y-0">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 backdrop-blur-md">
                <div className="flex items-center gap-2.5 pr-4">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                    {activeVideo.serialPlate}
                  </span>
                  <div>
                    <h2 className="font-bold text-sm sm:text-base text-white truncate max-w-md sm:max-w-xl">
                      {activeVideo.title}
                    </h2>
                    <p className="text-xs text-zinc-400 truncate">
                      {activeVideo.speaker} · {activeVideo.speakerTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleShareVideo(activeVideo)}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors relative cursor-pointer"
                    title="Copy video link"
                  >
                    <Share2 className="h-4 w-4" />
                    {copyFeedback && (
                      <span className="absolute -top-7 -right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                        Copied!
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVideo(null)}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Responsive 16:9 YouTube Video Player */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>

              {/* Video Notes & Takeaways */}
              <div className="p-5 space-y-4 max-h-[35vh] overflow-y-auto">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    Executive Briefing Summary
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed mt-1">
                    {activeVideo.summary}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Masterclass Key Takeaways</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {activeVideo.takeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags and Next Plate Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeVideo.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`, '_blank', 'noopener,noreferrer')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>YouTube</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePlayNext}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Next Talk in Wheel</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
