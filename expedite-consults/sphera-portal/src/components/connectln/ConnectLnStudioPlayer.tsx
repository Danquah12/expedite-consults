"use client"

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Captions,
  Sparkles,
  CheckCircle2,
  Radio
} from "lucide-react"
import { getAllWheelTalks, ONBOARDING_GUIDE_CHAPTERS } from "@/lib/connectin-videos"

export interface ConnectLnStudioPlayerProps {
  youtubeId: string
  title: string
  serialPlate?: string
  speaker?: string
  durationLabel?: string
  autoPlay?: boolean
  className?: string
  thumbnailUrl?: string
  summary?: string
  takeaways?: string[]
  categoryLabel?: string
}

// Reliable, fast-loading royalty-free MP4 studio b-roll streams (Wikimedia Commons / Google Cloud CDN)
// Used as subtle background motion layer alongside the high-res masterclass visual stage
const STUDIO_BROLL_STREAMS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
]

export function ConnectLnStudioPlayer({
  youtubeId,
  title,
  serialPlate = "CLN-STUDIO",
  speaker = "ConnectLn Masterclass",
  durationLabel = "4:30",
  autoPlay = true,
  className = "h-[230px] sm:h-[280px] w-full",
  thumbnailUrl,
  summary,
  takeaways,
  categoryLabel
}: ConnectLnStudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Automatically enrich briefing details from the Wheel catalog or Onboarding chapters if not passed directly
  const matchedCatalogData = useMemo(() => {
    try {
      const talks = getAllWheelTalks()
      const foundTalk = talks.find(
        (t) =>
          (youtubeId && t.youtubeId === youtubeId) ||
          (serialPlate && t.serialPlate === serialPlate) ||
          t.title === title
      )
      if (foundTalk) {
        return {
          summary: summary || foundTalk.summary,
          takeaways: takeaways && takeaways.length > 0 ? takeaways : foundTalk.takeaways,
          thumbnailUrl:
            thumbnailUrl ||
            foundTalk.thumbnailUrl ||
            (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : ""),
          categoryLabel: categoryLabel || foundTalk.categoryLabel
        }
      }
      const foundChapter = ONBOARDING_GUIDE_CHAPTERS.find(
        (c) => (youtubeId && c.youtubeId === youtubeId) || c.title === title
      )
      if (foundChapter) {
        return {
          summary: summary || foundChapter.description,
          takeaways: takeaways && takeaways.length > 0 ? takeaways : foundChapter.highlights,
          thumbnailUrl:
            thumbnailUrl ||
            (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : ""),
          categoryLabel: categoryLabel || foundChapter.subtitle
        }
      }
    } catch {
      // Fallback gracefully
    }
    return {
      summary:
        summary ||
        `Executive field briefing and technical masterclass covering ${title}, presented by ${speaker}.`,
      takeaways:
        takeaways && takeaways.length > 0
          ? takeaways
          : [
              `Core operational architecture & field verification standards for ${title}`,
              `Zero-trust safety, compliance telemetry, and peer-verified execution protocols`,
              `Production implementation checklist led by ${speaker}`
            ],
      thumbnailUrl:
        thumbnailUrl ||
        (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "/brand/connectln-og.png"),
      categoryLabel: categoryLabel || "ConnectLn Studio Masterclass"
    }
  }, [youtubeId, serialPlate, title, speaker, summary, takeaways, thumbnailUrl, categoryLabel])

  // Build structured briefing chapters for synchronized visual slides & voice narration
  const chapters = useMemo(() => {
    const list: { badge: string; heading: string; body: string }[] = [
      {
        badge: "CHAPTER 01 · EXECUTIVE OVERVIEW",
        heading: title,
        body: matchedCatalogData.summary
      }
    ]
    matchedCatalogData.takeaways.forEach((item, idx) => {
      list.push({
        badge: `CHAPTER 0${idx + 2} · KEY TAKEAWAY #${idx + 1}`,
        heading: `${matchedCatalogData.categoryLabel} Standard #${idx + 1}`,
        body: item
      })
    })
    return list
  }, [title, matchedCatalogData])

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [showCaptions, setShowCaptions] = useState<boolean>(true)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(() => {
    const parts = durationLabel.split(":").map(Number)
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return Math.max(30, parts[0] * 60 + parts[1])
    }
    return 180
  })
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [showControls, setShowControls] = useState<boolean>(true)
  const [thumbError, setThumbError] = useState<boolean>(false)

  // Pick a deterministic b-roll stream based on serialPlate/youtubeId
  const brollUrl = useMemo(() => {
    const seed = (serialPlate + youtubeId).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    return STUDIO_BROLL_STREAMS[seed % STUDIO_BROLL_STREAMS.length]
  }, [serialPlate, youtubeId])

  // Determine active chapter index from currentTime (cycles through chapters every ~12 seconds so viewer sees dynamic progression immediately)
  const activeChapterIndex = useMemo(() => {
    const slotSeconds = 12
    return Math.floor(currentTime / slotSeconds) % chapters.length
  }, [currentTime, chapters.length])

  const activeChapter = chapters[activeChapterIndex] || chapters[0]

  // Synchronize HTML5 background video play/pause
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true // Background b-roll is visual only; narration is handled by Studio Voice Engine
    if (isPlaying) {
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [isPlaying, brollUrl])

  // Web Speech API Studio Narration Engine — speaks the briefing clearly when playing & unmuted
  const speakNarration = useCallback(
    (chapterIdx: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return
      try {
        window.speechSynthesis.cancel()
        if (!isPlaying || isMuted) return

        const scriptParts: string[] = []
        if (chapterIdx === 0) {
          scriptParts.push(
            `ConnectLn Studio Briefing ${serialPlate}. ${title}. Presented by ${speaker}.`
          )
          scriptParts.push(matchedCatalogData.summary)
          matchedCatalogData.takeaways.forEach((t, idx) => {
            scriptParts.push(`Key Takeaway ${idx + 1}: ${t}.`)
          })
        } else {
          const ch = chapters[chapterIdx]
          if (ch) {
            scriptParts.push(`${ch.heading}. ${ch.body}`)
          }
        }

        const utterance = new SpeechSynthesisUtterance(scriptParts.join(" "))
        utterance.rate = 1.02
        utterance.pitch = 0.98
        utterance.volume = 1.0

        const voices = window.speechSynthesis.getVoices()
        const preferredVoice =
          voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Natural") ||
                v.name.includes("Online") ||
                v.name.includes("Guy") ||
                v.name.includes("Andrew") ||
                v.name.includes("Google US English"))
          ) || voices.find((v) => v.lang.startsWith("en"))

        if (preferredVoice) {
          utterance.voice = preferredVoice
        }

        window.speechSynthesis.speak(utterance)
      } catch {
        // Ignore speech synthesis errors on restricted environments
      }
    },
    [isPlaying, isMuted, serialPlate, title, speaker, matchedCatalogData, chapters]
  )

  // Start or stop studio narration when video changes, play state changes, or mute state changes
  useEffect(() => {
    setThumbError(false)
    setCurrentTime(0)
    setIsPlaying(autoPlay)
  }, [youtubeId, title, autoPlay])

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    if (isPlaying && !isMuted) {
      const timer = setTimeout(() => {
        speakNarration(0)
      }, 250)
      return () => {
        clearTimeout(timer)
        window.speechSynthesis.cancel()
      }
    } else {
      window.speechSynthesis.cancel()
    }
  }, [youtubeId, title, isPlaying, isMuted, speakNarration])

  // Smooth timeline progression & continuous looping
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setCurrentTime((prev) => (prev + 0.5 >= duration ? 0 : prev + 0.5))
    }, 500)
    return () => clearInterval(timer)
  }, [isPlaying, duration])

  const triggerControlsVisibility = () => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3200)
  }

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (isPlaying) {
      setIsPlaying(false)
      setShowControls(true)
    } else {
      setIsPlaying(true)
      triggerControlsVisibility()
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMuted((prev) => !prev)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
  }

  const handleJumpChapter = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation()
    setCurrentTime(idx * 12)
    setIsPlaying(true)
    if (!isMuted) {
      speakNarration(idx)
    }
  }

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentTime(0)
    setIsPlaying(true)
    if (!isMuted) {
      speakNarration(0)
    }
  }

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const formatTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec))
    const mins = Math.floor(s / 60)
    const rem = s % 60
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`
  }

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControlsVisibility}
      onClick={togglePlay}
      className={`relative overflow-hidden bg-[#0E0D0B] select-none group cursor-pointer ${className}`}
    >
      {/* 1. NATIVE HTML5 STUDIO CINEMA SURFACE (Zero YouTube Bot-Gate Iframes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle HTML5 Motion B-Roll Layer */}
        <video
          ref={videoRef}
          src={brollUrl}
          playsInline
          muted
          loop
          autoPlay={autoPlay}
          className="absolute inset-0 h-full w-full object-cover opacity-35 scale-105"
        />

        {/* High-Resolution Briefing Thumbnail with Dynamic Ken-Burns Cinema Motion */}
        {!thumbError && matchedCatalogData.thumbnailUrl && (
          <img
            src={matchedCatalogData.thumbnailUrl}
            alt={title}
            onError={() => setThumbError(true)}
            style={{
              transform: isPlaying
                ? `scale(${1.04 + ((currentTime % 12) / 12) * 0.08})`
                : "scale(1.02)",
              transition: "transform 600ms linear"
            }}
            className="absolute inset-0 h-full w-full object-cover opacity-65 mix-blend-lighten"
          />
        )}

        {/* Studio Cinema Gradient & Vignette Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(23,21,19,0.25) 0%, rgba(14,13,11,0.88) 85%), linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.92) 100%)"
          }}
        />
      </div>

      {/* 2. TOP CONNECTLN STUDIO BROADCAST HEADER OVERLAY */}
      <div className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Official ConnectLn Squircle Badge */}
          <div className="h-7 w-7 rounded-lg bg-[#A64532] border border-amber-300/30 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-black text-xs tracking-tighter">C</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate drop-shadow-xs">{title}</p>
            <p className="text-[10px] text-zinc-300 truncate">
              {speaker} · {matchedCatalogData.categoryLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Live Audio Narration Equalizer Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-950/85 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
            <Radio className={`h-3 w-3 ${isPlaying && !isMuted ? "animate-pulse text-emerald-400" : "text-zinc-500"}`} />
            <span>{isPlaying && !isMuted ? "AI Voice Briefing Live" : isMuted ? "Audio Muted" : "Paused"}</span>
          </div>

          <span className="rounded-md bg-black/70 border border-amber-400/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 shrink-0">
            {serialPlate}
          </span>
        </div>
      </div>

      {/* 3. LIVE SYNCHRONIZED STUDIO BRIEFING SLIDE & TELEPROMPTER STAGE */}
      {showCaptions && (
        <div className="absolute inset-x-4 sm:inset-x-8 bottom-14 z-10 pointer-events-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl border border-white/15 bg-[#141210]/85 backdrop-blur-md p-3 sm:p-4 shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-300">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>{activeChapter.badge}</span>
              </span>

              {/* Interactive Chapter Selector Pills */}
              <div className="flex items-center gap-1">
                {chapters.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleJumpChapter(e, idx)}
                    className={`h-5 px-2 rounded-full text-[9px] font-mono font-bold transition-all cursor-pointer ${
                      idx === activeChapterIndex
                        ? "bg-amber-400 text-zinc-950 shadow-2xs"
                        : "bg-white/10 text-zinc-300 hover:bg-white/20"
                    }`}
                    title={`Jump to Chapter ${idx + 1}`}
                  >
                    {idx === 0 ? "Overview" : `Pt ${idx}`}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-3 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{activeChapter.body}</span>
            </p>
          </div>
        </div>
      )}

      {/* 4. CENTER PLAY / PAUSE INDICATOR (Shown when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="h-14 w-14 rounded-full bg-[#A64532]/95 border border-white/30 text-white flex items-center justify-center shadow-2xl backdrop-blur-xs">
            <Play className="h-6 w-6 fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* 5. BOTTOM CONNECTLN STUDIO CONTROL BAR */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-4 pt-4 pb-2.5 space-y-1.5 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-90 group-hover:opacity-100"
        }`}
      >
        {/* Interactive Timeline Scrubber */}
        <div className="relative flex items-center w-full">
          <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-amber-400 rounded-full transition-all duration-150"
            />
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(1, duration)}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Seek video timeline"
            className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          />
        </div>

        {/* Controls & ConnectLn Studio Watermark Row */}
        <div className="flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              title="Restart briefing"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              title={isMuted ? "Unmute voice narration" : "Mute voice narration"}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => setShowCaptions((prev) => !prev)}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                showCaptions ? "bg-white/15 text-amber-300" : "hover:bg-white/15 text-zinc-400"
              }`}
              title="Toggle briefing slide captions"
            >
              <Captions className="h-4 w-4" />
            </button>

            <span className="text-[11px] font-mono font-semibold text-zinc-200">
              {formatTime(currentTime)} <span className="text-zinc-400">/ {formatTime(duration)}</span>
            </span>
          </div>

          {/* Right side: ConnectLn Studio Brand Pill + Fullscreen */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md bg-[#171513]/90 border border-white/15 px-2.5 py-0.5 shadow-xs">
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded bg-[#A64532] text-[9px] font-black text-white">
                C
              </span>
              <span className="text-[10px] font-extrabold tracking-tight text-white">
                ConnectLn Studio
              </span>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              title="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
