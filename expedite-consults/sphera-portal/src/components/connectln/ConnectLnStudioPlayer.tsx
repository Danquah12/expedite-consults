"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Play, ExternalLink, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { NoctisVideoInterpreterPopup } from "./NoctisVideoInterpreterPopup"
import type { LearnVideoSourceProvider } from "@/lib/skilled-trades-learn-by-doing-data"

export const CONNECTLN_VIDEO_PLAY_EVENT = "connectln:exclusive-video-play"

export function notifyExclusiveVideoPlay(activePlayerId: string) {
  if (typeof window === "undefined") return
  ;(window as any).__connectlnActiveVideoPlayerId = activePlayerId
  window.dispatchEvent(
    new CustomEvent(CONNECTLN_VIDEO_PLAY_EVENT, {
      detail: { playerId: activePlayerId },
    })
  )
  // Also pause any HTML5 <video> elements on the page (except live WebRTC camera streams with srcObject)
  try {
    const videos = document.querySelectorAll("video")
    videos.forEach((v) => {
      if (!v.srcObject && v.dataset.connectlnPlayerId !== activePlayerId && !v.paused) {
        v.pause()
      }
    })
  } catch {
    // ignore
  }
}

function hasSessionAudioActivation(): boolean {
  if (typeof window === "undefined") return false
  if ((window as any).__connectlnAudioUnlocked) return true
  const ua = (navigator as any)?.userActivation
  if (ua && (ua.hasBeenActive || ua.isActive)) {
    ;(window as any).__connectlnAudioUnlocked = true
    return true
  }
  return false
}

if (typeof window !== "undefined" && !(window as any).__connectlnGlobalVideoGuardInstalled) {
  ;(window as any).__connectlnGlobalVideoGuardInstalled = true
  const markAudioUnlocked = () => {
    ;(window as any).__connectlnAudioUnlocked = true
  }
  window.addEventListener("pointerdown", markAudioUnlocked, { capture: true, passive: true })
  window.addEventListener("touchstart", markAudioUnlocked, { capture: true, passive: true })
  window.addEventListener("keydown", markAudioUnlocked, { capture: true, passive: true })
  window.addEventListener("click", markAudioUnlocked, { capture: true, passive: true })

  document.addEventListener(
    "play",
    (e) => {
      const target = e.target
      if (target instanceof HTMLVideoElement && !target.srcObject) {
        if (!target.dataset.connectlnPlayerId) {
          target.dataset.connectlnPlayerId = `html5-video-${Math.random().toString(36).slice(2, 10)}`
        }
        notifyExclusiveVideoPlay(target.dataset.connectlnPlayerId)
      }
    },
    true
  )
}

interface ConnectLnStudioPlayerProps {
  youtubeId?: string
  sourceProvider?: LearnVideoSourceProvider
  embedUrl?: string
  directVideoUrl?: string
  sourceVideoUrl?: string
  licenseLabel?: string
  title: string
  serialPlate?: string
  speaker?: string
  speakerRole?: string
  speakerAvatarUrl?: string
  posterImageUrl?: string
  durationLabel?: string
  description?: string
  takeaways?: string[]
  /** Spoken language of the source video (defaults to "en"). If non-English (e.g. "es", "fr", "ja"), Noctis translates/interprets! */
  sourceLanguage?: string
  sourceLanguageLabel?: string
  autoPlay?: boolean
  initialMuted?: boolean
  className?: string
  playerId?: string
  onExclusiveStop?: () => void
}

function inferProviderFromUrls(
  explicit?: LearnVideoSourceProvider,
  directVideoUrl?: string,
  embedUrl?: string,
  youtubeId?: string
): LearnVideoSourceProvider {
  if (explicit) return explicit
  if (directVideoUrl) {
    if (embedUrl && embedUrl.includes("archive.org")) return "archive_org"
    return "connectln_native"
  }
  if (embedUrl) {
    const low = embedUrl.toLowerCase()
    if (low.includes("vimeo.com")) return "vimeo"
    if (low.includes("archive.org")) return "archive_org"
    if (low.includes("ted.com")) return "ted"
    if (low.includes("dailymotion.com") || low.includes("dmcdn.net")) return "dailymotion"
    if (low.includes("makertube") || low.includes("tilvids") || low.includes("peertube") || low.includes("/videos/embed/")) {
      return "peertube"
    }
  }
  if (youtubeId) return "youtube"
  return "connectln_native"
}

function getProviderMeta(provider: LearnVideoSourceProvider): {
  badge: string
  ctaLabel: string
  pillClass: string
} {
  switch (provider) {
    case "vimeo":
      return {
        badge: "Vimeo",
        ctaLabel: "Watch on Vimeo",
        pillClass: "bg-sky-500/20 text-sky-200 border-sky-400/30",
      }
    case "archive_org":
      return {
        badge: "Internet Archive · Open",
        ctaLabel: "View on Internet Archive",
        pillClass: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
      }
    case "ted":
      return {
        badge: "TED Talks",
        ctaLabel: "Watch on TED",
        pillClass: "bg-rose-500/20 text-rose-200 border-rose-400/30",
      }
    case "peertube":
      return {
        badge: "PeerTube · Federated",
        ctaLabel: "Watch on PeerTube",
        pillClass: "bg-orange-500/20 text-orange-200 border-orange-400/30",
      }
    case "dailymotion":
      return {
        badge: "Dailymotion",
        ctaLabel: "Watch on Dailymotion",
        pillClass: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30",
      }
    case "connectln_native":
      return {
        badge: "ConnectLn Original",
        ctaLabel: "ConnectLn Studio Lesson",
        pillClass: "bg-amber-500/20 text-amber-200 border-amber-400/30",
      }
    case "youtube":
    default:
      return {
        badge: "YouTube",
        ctaLabel: "Watch on YouTube",
        pillClass: "bg-red-500/20 text-red-200 border-red-400/30",
      }
  }
}

export function ConnectLnStudioPlayer({
  youtubeId = "",
  sourceProvider,
  embedUrl,
  directVideoUrl,
  sourceVideoUrl,
  licenseLabel,
  title,
  serialPlate = "CLN-STUDIO",
  speaker = "ConnectLn Masterclass",
  speakerRole,
  speakerAvatarUrl,
  posterImageUrl,
  durationLabel = "3:00",
  description,
  takeaways,
  sourceLanguage = "en",
  sourceLanguageLabel,
  autoPlay = true,
  initialMuted = false,
  className = "w-full",
  playerId,
  onExclusiveStop,
}: ConnectLnStudioPlayerProps) {
  const { language } = useLanguage()
  const effectiveProvider = inferProviderFromUrls(sourceProvider, directVideoUrl, embedUrl, youtubeId)
  const isHtml5Direct =
    Boolean(directVideoUrl) &&
    (effectiveProvider === "connectln_native" || effectiveProvider === "archive_org")

  const normalizedSourceLang = (sourceLanguage || "en").toLowerCase()
  const preferredNoctisLang =
    typeof window !== "undefined" && (window as any).__noctisPreferredAudioLang
      ? String((window as any).__noctisPreferredAudioLang).toLowerCase()
      : language
  const isInterpretingNeeded =
    language !== normalizedSourceLang || preferredNoctisLang !== normalizedSourceLang
  const isInterpretingNeededRef = useRef(isInterpretingNeeded)
  isInterpretingNeededRef.current = isInterpretingNeeded
  const sourceLangRef = useRef(normalizedSourceLang)
  sourceLangRef.current = normalizedSourceLang
  const initialLangRef = useRef(preferredNoctisLang)

  const containerRef = useRef<HTMLDivElement>(null)
  const ytIframeRef = useRef<HTMLIFrameElement>(null)
  const html5VideoRef = useRef<HTMLVideoElement>(null)
  const generatedIdRef = useRef<string>(`cln-studio-${Math.random().toString(36).slice(2, 10)}`)
  const effectivePlayerId = playerId || generatedIdRef.current
  const onExclusiveStopRef = useRef(onExclusiveStop)
  onExclusiveStopRef.current = onExclusiveStop

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay)
  const [isStoppedByOther, setIsStoppedByOther] = useState<boolean>(false)
  const wasPlayingBeforeCallRef = useRef<boolean>(false)
  const isPlayingStateRef = useRef<boolean>(autoPlay)
  isPlayingStateRef.current = isPlaying
  const isVoiceDuckingRef = useRef<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(() => {
    const parts = (durationLabel || "").split(":").map(Number)
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return Math.max(60, parts[0] * 60 + parts[1])
    }
    return 180
  })

  const sendYtCommand = useCallback((func: string, args: any[] = []) => {
    const win = ytIframeRef.current?.contentWindow
    if (!win) return
    win.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args,
      }),
      "*"
    )
  }, [])

  const shouldMuteForTranslation = useCallback(() => {
    if (isVoiceDuckingRef.current || isInterpretingNeededRef.current) return true
    if (typeof window !== "undefined" && (window as any).__noctisPreferredAudioLang) {
      const pref = String((window as any).__noctisPreferredAudioLang).toLowerCase()
      if (pref !== sourceLangRef.current) return true
    }
    return false
  }, [])

  // Duck or restore audio safely via official player APIs (YouTube IFrame API or HTML5 <video>.muted)
  const applyVoiceDuckingToPlayer = useCallback(
    (shouldDuck: boolean) => {
      const muteActive = shouldDuck || shouldMuteForTranslation()
      if (isHtml5Direct && html5VideoRef.current) {
        html5VideoRef.current.muted = muteActive
        html5VideoRef.current.volume = muteActive ? 0 : 1
        return
      }
      if (effectiveProvider === "youtube") {
        if (muteActive) {
          sendYtCommand("setVolume", [0])
          sendYtCommand("mute")
        } else if (!initialMuted && hasSessionAudioActivation()) {
          sendYtCommand("unMute")
          sendYtCommand("setVolume", [100])
        }
      }
    },
    [effectiveProvider, initialMuted, isHtml5Direct, sendYtCommand, shouldMuteForTranslation]
  )

  // Single-video mutual exclusion + incoming ConnectLn call pause across all providers
  useEffect(() => {
    const handleExclusivePlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ playerId?: string }>
      const activeId = customEvent.detail?.playerId
      if (activeId && activeId !== effectivePlayerId) {
        if (activeId === "__connectln_call_silence__" && isPlayingStateRef.current) {
          wasPlayingBeforeCallRef.current = true
        }
        if (isHtml5Direct && html5VideoRef.current) {
          html5VideoRef.current.pause()
        } else if (effectiveProvider === "youtube") {
          sendYtCommand("mute")
          sendYtCommand("pauseVideo")
        }
        setIsPlaying(false)
        setIsStoppedByOther(true)
        if (onExclusiveStopRef.current && activeId !== "__connectln_call_silence__") {
          onExclusiveStopRef.current()
        }
      }
    }

    const handleCallSilenceChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ active?: boolean }>
      const callActive = Boolean(customEvent.detail?.active)
      if (callActive) {
        if (isPlayingStateRef.current) {
          wasPlayingBeforeCallRef.current = true
        }
        if (isHtml5Direct && html5VideoRef.current) {
          html5VideoRef.current.pause()
        } else if (effectiveProvider === "youtube") {
          sendYtCommand("mute")
          sendYtCommand("pauseVideo")
        }
        setIsPlaying(false)
      } else if (wasPlayingBeforeCallRef.current) {
        wasPlayingBeforeCallRef.current = false
        setIsStoppedByOther(false)
        if (isHtml5Direct && html5VideoRef.current) {
          html5VideoRef.current.play().catch(() => {})
        } else if (effectiveProvider === "youtube") {
          sendYtCommand("playVideo")
        }
        setIsPlaying(true)
      }
    }

    window.addEventListener(CONNECTLN_VIDEO_PLAY_EVENT, handleExclusivePlay)
    window.addEventListener("connectln:call-silence-change", handleCallSilenceChange)
    return () => {
      window.removeEventListener(CONNECTLN_VIDEO_PLAY_EVENT, handleExclusivePlay)
      window.removeEventListener("connectln:call-silence-change", handleCallSilenceChange)
    }
  }, [effectivePlayerId, effectiveProvider, isHtml5Direct, sendYtCommand])

  // YouTube official IFrame postMessage telemetry listener (no click hijacking, no forced override of user pause)
  useEffect(() => {
    setIsStoppedByOther(false)
    setCurrentTime(0)
    setIsPlaying(autoPlay)
    if (autoPlay) {
      notifyExclusiveVideoPlay(effectivePlayerId)
    }

    if (effectiveProvider !== "youtube" || !youtubeId) return

    const handleMessage = (e: MessageEvent) => {
      const win = ytIframeRef.current?.contentWindow
      if (!win || e.source !== win) return
      if (!e.data || typeof e.data !== "string") return
      try {
        const data = JSON.parse(e.data)
        if (data.event === "infoDelivery" && data.info) {
          if (typeof data.info.currentTime === "number") {
            setCurrentTime(data.info.currentTime)
          }
          if (typeof data.info.duration === "number" && data.info.duration > 0) {
            setDuration(data.info.duration)
          }
          if (typeof data.info.playerState === "number") {
            const pState = data.info.playerState
            if ((window as any).__connectlnCallSilenceActive && pState === 1) {
              sendYtCommand("mute")
              sendYtCommand("pauseVideo")
              setIsPlaying(false)
              return
            }
            if (pState === 1) {
              setIsPlaying(true)
              if ((window as any).__connectlnActiveVideoPlayerId !== effectivePlayerId) {
                notifyExclusiveVideoPlay(effectivePlayerId)
              }
              if (shouldMuteForTranslation()) {
                sendYtCommand("setVolume", [0])
                sendYtCommand("mute")
              }
            } else if (pState === 2 || pState === 0) {
              setIsPlaying(false)
            }
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    }

    window.addEventListener("message", handleMessage)
    const poll = setInterval(() => {
      const win = ytIframeRef.current?.contentWindow
      if (win) {
        win.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*")
      }
    }, 1000)

    return () => {
      window.removeEventListener("message", handleMessage)
      clearInterval(poll)
    }
  }, [youtubeId, effectiveProvider, autoPlay, effectivePlayerId, sendYtCommand, shouldMuteForTranslation])

  // Gentle timer tick for non-YouTube external iframes so docked Noctis Interpreter tracks progress
  useEffect(() => {
    if (!isPlaying || isStoppedByOther || effectiveProvider === "youtube" || isHtml5Direct) return
    const timer = setInterval(() => {
      setCurrentTime((prev) => (prev + 1 >= duration ? 0 : prev + 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying, isStoppedByOther, effectiveProvider, isHtml5Direct, duration])

  // Computed official embed URL for iframe-based non-YouTube providers
  const resolvedExternalEmbedSrc = useMemo(() => {
    if (effectiveProvider === "youtube" || isHtml5Direct) return ""
    const raw = (embedUrl || sourceVideoUrl || "").trim()
    if (!raw) return ""
    if (effectiveProvider === "vimeo") {
      try {
        const u = new URL(raw.includes("player.vimeo.com") ? raw : raw)
        const muteFlag = initialMuted || shouldMuteForTranslation() ? "1" : hasSessionAudioActivation() ? "0" : "1"
        if (!u.hostname.includes("player.vimeo.com")) {
          const m = u.pathname.match(/\/(\d{6,12})/)
          if (m?.[1]) {
            return `https://player.vimeo.com/video/${m[1]}?autoplay=${autoPlay ? 1 : 0}&muted=${muteFlag}&dnt=1`
          }
        }
        u.searchParams.set("autoplay", autoPlay ? "1" : "0")
        u.searchParams.set("muted", muteFlag)
        return u.toString()
      } catch {
        return raw
      }
    }
    return raw
  }, [effectiveProvider, isHtml5Direct, embedUrl, sourceVideoUrl, autoPlay, initialMuted, shouldMuteForTranslation])

  const resolvedPoster =
    posterImageUrl ||
    (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined)

  const externalWatchUrl = useMemo(() => {
    if (effectiveProvider === "connectln_native") return ""
    if (sourceVideoUrl && /^https?:\/\//i.test(sourceVideoUrl)) return sourceVideoUrl
    if (effectiveProvider === "youtube" && youtubeId) {
      return `https://www.youtube.com/watch?v=${youtubeId}`
    }
    return ""
  }, [effectiveProvider, sourceVideoUrl, youtubeId])

  const providerMeta = getProviderMeta(effectiveProvider)

  const compliantYouTubeSrc = useMemo(() => {
    if (!youtubeId) return ""
    const muteFlag = initialMuted || shouldMuteForTranslation() ? 1 : hasSessionAudioActivation() ? 0 : 1
    const params = new URLSearchParams({
      autoplay: autoPlay ? "1" : "0",
      mute: String(muteFlag),
      controls: "1",
      fs: "1",
      rel: "0",
      playsinline: "1",
      enablejsapi: "1",
      cc_load_policy: initialLangRef.current !== normalizedSourceLang ? "1" : "0",
      cc_lang_pref: initialLangRef.current,
      hl: initialLangRef.current,
    })
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`
  }, [youtubeId, autoPlay, initialMuted, normalizedSourceLang, shouldMuteForTranslation])

  const handleResumePlayer = () => {
    notifyExclusiveVideoPlay(effectivePlayerId)
    setIsStoppedByOther(false)
    setIsPlaying(true)
    if (isHtml5Direct && html5VideoRef.current) {
      html5VideoRef.current.play().catch(() => {})
    }
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col w-full bg-black overflow-hidden ${className}`}
    >
      {/* Full Uncropped 16:9 Video Canvas (Min >= 200x200px, Zero Obstructions Over YouTube/External Iframes) */}
      <div className="relative w-full aspect-video min-h-[200px] bg-black overflow-hidden">
        {isStoppedByOther ? (
          <div className="relative h-full w-full flex flex-col items-center justify-center bg-zinc-950 text-white">
            {resolvedPoster && (
              <img
                src={resolvedPoster}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover opacity-50"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
              <button
                type="button"
                onClick={handleResumePlayer}
                className="inline-flex items-center gap-2 rounded-full bg-black/80 hover:bg-black border border-white/30 px-4 py-2 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Resume Video</span>
              </button>
              <p className="text-[11px] text-zinc-200 line-clamp-1 max-w-md drop-shadow">
                {title}
              </p>
            </div>
          </div>
        ) : isHtml5Direct && directVideoUrl ? (
          <video
            ref={html5VideoRef}
            key={directVideoUrl}
            src={directVideoUrl}
            poster={resolvedPoster}
            controls
            playsInline
            preload="metadata"
            autoPlay={autoPlay}
            muted={initialMuted || shouldMuteForTranslation()}
            data-connectln-player-id={effectivePlayerId}
            onPlay={() => {
              notifyExclusiveVideoPlay(effectivePlayerId)
              setIsPlaying(true)
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration
              if (Number.isFinite(d) && d > 0) setDuration(d)
            }}
            onTimeUpdate={(e) => {
              setCurrentTime(e.currentTarget.currentTime || 0)
            }}
            className="h-full w-full bg-black object-contain"
          />
        ) : effectiveProvider === "youtube" && youtubeId ? (
          <iframe
            ref={ytIframeRef}
            key={youtubeId}
            src={compliantYouTubeSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => {
              const win = ytIframeRef.current?.contentWindow
              if (win) {
                win.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*")
              }
            }}
            className="h-full w-full border-0"
          />
        ) : resolvedExternalEmbedSrc ? (
          <iframe
            key={resolvedExternalEmbedSrc}
            src={resolvedExternalEmbedSrc}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            Video stream unavailable
          </div>
        )}
      </div>

      {/* Compliant Attribution & License Strip Positioned Strictly BELOW the Video Frame */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 border-t border-zinc-800/90 px-3 py-1.5 text-[11px] text-zinc-300">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold shrink-0 ${providerMeta.pillClass}`}
          >
            {effectiveProvider === "connectln_native" && <ShieldCheck className="h-3 w-3" />}
            {providerMeta.badge}
          </span>
          <span className="truncate font-semibold text-zinc-100">{speaker}</span>
          {licenseLabel && (
            <span className="text-[10px] text-zinc-400 hidden sm:inline">
              · {licenseLabel}
            </span>
          )}
        </div>

        {externalWatchUrl ? (
          <a
            href={externalWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 px-2.5 py-0.5 text-[10px] font-bold text-zinc-100 transition-colors shrink-0"
          >
            <span>{providerMeta.ctaLabel}</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        ) : (
          <span className="text-[10px] font-semibold text-emerald-300 shrink-0">
            Hosted on ConnectLn
          </span>
        )}
      </div>

      {/* DOCKED NOCTIS LIVE VIDEO LANGUAGE INTERPRETER & VOICE DUBBING BAR (Cleanly Below Video Frame) */}
      {!isStoppedByOther && (
        <NoctisVideoInterpreterPopup
          dockedBelow={true}
          youtubeId={youtubeId || undefined}
          title={title}
          speaker={speaker}
          speakerRole={speakerRole}
          serialPlate={serialPlate}
          description={description}
          takeaways={takeaways}
          sourceLanguage={normalizedSourceLang}
          sourceLanguageLabel={sourceLanguageLabel}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onRequestPlayVideo={() => {
            notifyExclusiveVideoPlay(effectivePlayerId)
            setIsStoppedByOther(false)
            if (isHtml5Direct && html5VideoRef.current) {
              html5VideoRef.current.muted = shouldMuteForTranslation()
              html5VideoRef.current.play().catch(() => {})
            } else if (effectiveProvider === "youtube") {
              if (shouldMuteForTranslation()) {
                sendYtCommand("setVolume", [0])
                sendYtCommand("mute")
              }
              sendYtCommand("playVideo")
            }
            setIsPlaying(true)
          }}
          onMuteOriginalVideo={(shouldDuck) => {
            isVoiceDuckingRef.current = shouldDuck
            applyVoiceDuckingToPlayer(shouldDuck)
          }}
        />
      )}
    </div>
  )
}
