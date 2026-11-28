"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
  Play,
  Pause,
  ShieldCheck,
  Film,
  PlayCircle,
  RotateCcw,
  RotateCw,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ChevronLeft,
} from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { NoctisVideoInterpreterPopup } from "./NoctisVideoInterpreterPopup"
import type { LearnVideoSourceProvider } from "@/lib/skilled-trades-learn-by-doing-data"
import {
  stageConnectLnVideo,
  getConnectLnMoreVideosCatalog,
  extractPlayableYoutubeId,
  type StagedConnectLnVideo,
} from "@/lib/connectln-video-stage"

export const CONNECTLN_VIDEO_PLAY_EVENT = "connectln:exclusive-video-play"

export function notifyExclusiveVideoPlay(activePlayerId: string) {
  if (typeof window === "undefined") return
  const win = window as any
  win.__connectlnActiveVideoPlayerId = activePlayerId
  win.__noctisAudioPlaySeq = (win.__noctisAudioPlaySeq || 0) + 1
  if (win.__noctisSharedAudioEl instanceof HTMLAudioElement) {
    try {
      win.__noctisSharedAudioEl.onended = null
      win.__noctisSharedAudioEl.onerror = null
      win.__noctisSharedAudioEl.pause()
    } catch {}
  }
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {}
  }
  window.dispatchEvent(
    new CustomEvent(CONNECTLN_VIDEO_PLAY_EVENT, {
      detail: { playerId: activePlayerId },
    })
  )
  // Also pause any HTML5 <video> elements AND YouTube/Vimeo <iframe> players on the page (except active player / WebRTC streams)
  try {
    const videos = document.querySelectorAll("video")
    videos.forEach((v) => {
      if (!v.srcObject && v.dataset.connectlnPlayerId !== activePlayerId && !v.paused) {
        v.pause()
      }
    })
    const iframes = document.querySelectorAll("iframe")
    iframes.forEach((frame) => {
      if (frame.dataset.connectlnPlayerId === activePlayerId) return
      const src = (frame.src || "").toLowerCase()
      const fWin = frame.contentWindow
      if (!fWin) return
      try {
        if (src.includes("youtube.com") || src.includes("youtube-nocookie.com")) {
          fWin.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [0] }), "*")
          fWin.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*")
          fWin.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "*")
        } else if (src.includes("vimeo.com")) {
          fWin.postMessage(JSON.stringify({ method: "setVolume", value: 0 }), "*")
          fWin.postMessage(JSON.stringify({ method: "pause" }), "*")
        }
      } catch {}
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
  onPlaybackTimeChange?: (seconds: number, durationSeconds: number) => void
  seekRequest?: { seconds: number; nonce: number } | null
  isStagedPlayer?: boolean
  relatedVideos?: StagedConnectLnVideo[]
  onSelectMoreVideo?: (video: StagedConnectLnVideo) => void
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
  pillClass: string
} {
  switch (provider) {
    case "vimeo":
      return {
        badge: "Vimeo · In ConnectLn",
        pillClass: "bg-sky-500/20 text-sky-200 border-sky-400/30",
      }
    case "archive_org":
      return {
        badge: "Internet Archive · Open",
        pillClass: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
      }
    case "ted":
      return {
        badge: "TED Talks · In ConnectLn",
        pillClass: "bg-rose-500/20 text-rose-200 border-rose-400/30",
      }
    case "peertube":
      return {
        badge: "PeerTube · Federated",
        pillClass: "bg-orange-500/20 text-orange-200 border-orange-400/30",
      }
    case "dailymotion":
      return {
        badge: "Dailymotion · In ConnectLn",
        pillClass: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30",
      }
    case "connectln_native":
      return {
        badge: "ConnectLn Original",
        pillClass: "bg-amber-500/20 text-amber-200 border-amber-400/30",
      }
    case "youtube":
    default:
      return {
        badge: "ConnectLn Studio",
        pillClass: "bg-red-500/20 text-red-200 border-red-400/30",
      }
  }
}

function formatMediaTime(sec: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0))
  const hrs = Math.floor(safe / 3600)
  const mins = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }
  return `${mins}:${String(secs).padStart(2, "0")}`
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
  onPlaybackTimeChange,
  seekRequest = null,
  isStagedPlayer = false,
  relatedVideos,
  onSelectMoreVideo,
}: ConnectLnStudioPlayerProps) {
  const { language } = useLanguage()

  const [inlineVideoOverride, setInlineVideoOverride] = useState<StagedConnectLnVideo | null>(null)
  const [inlineVideoHistory, setInlineVideoHistory] = useState<StagedConnectLnVideo[]>([])

  useEffect(() => {
    setInlineVideoOverride(null)
    setInlineVideoHistory([])
  }, [youtubeId, directVideoUrl, embedUrl, title])

  const activeYoutubeId = inlineVideoOverride ? inlineVideoOverride.youtubeId || "" : youtubeId
  const activeDirectVideoUrl = inlineVideoOverride ? inlineVideoOverride.directVideoUrl : directVideoUrl
  const activeEmbedUrl = inlineVideoOverride ? inlineVideoOverride.embedUrl : embedUrl
  const activeSourceVideoUrl = inlineVideoOverride ? undefined : sourceVideoUrl
  const activeTitle = inlineVideoOverride?.title || title
  const activeSpeaker = inlineVideoOverride?.speaker || speaker
  const activeSpeakerRole = inlineVideoOverride?.speakerRole || speakerRole
  const activeSerialPlate = inlineVideoOverride?.serialPlate || serialPlate
  const activePosterImageUrl = inlineVideoOverride?.thumbnailUrl || posterImageUrl
  const activeDurationLabel = inlineVideoOverride?.durationLabel || durationLabel
  const activeDescription = inlineVideoOverride?.description || description
  const activeTakeaways = inlineVideoOverride?.takeaways || takeaways
  const activeSourceLangRaw = inlineVideoOverride?.sourceLanguage || sourceLanguage
  const activeSourceLangLabel = inlineVideoOverride?.sourceLanguageLabel || sourceLanguageLabel
  const effectiveAutoPlay = inlineVideoOverride ? true : autoPlay

  const effectiveProvider = inferProviderFromUrls(
    inlineVideoOverride?.sourceProvider ?? sourceProvider,
    activeDirectVideoUrl,
    activeEmbedUrl,
    activeYoutubeId
  )
  const [html5FallbackToEmbed, setHtml5FallbackToEmbed] = useState<boolean>(false)
  const isHtml5Direct =
    !html5FallbackToEmbed &&
    Boolean(activeDirectVideoUrl) &&
    (effectiveProvider === "connectln_native" || effectiveProvider === "archive_org")

  useEffect(() => {
    setHtml5FallbackToEmbed(false)
  }, [activeDirectVideoUrl, activeEmbedUrl])

  const [playerOrigin, setPlayerOrigin] = useState<string>(() =>
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://conectln.com"
  )
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location?.origin &&
      window.location.origin !== playerOrigin
    ) {
      setPlayerOrigin(window.location.origin)
    }
  }, [playerOrigin])

  const normalizedSourceLang = (activeSourceLangRaw || "en").toLowerCase()
  const preferredNoctisLang =
    typeof window !== "undefined" && (window as any).__noctisPreferredAudioLang
      ? String((window as any).__noctisPreferredAudioLang).toLowerCase()
      : language
  const isInterpretingNeeded = preferredNoctisLang !== normalizedSourceLang
  const isInterpretingNeededRef = useRef(isInterpretingNeeded)
  isInterpretingNeededRef.current = isInterpretingNeeded
  const sourceLangRef = useRef(normalizedSourceLang)
  sourceLangRef.current = normalizedSourceLang
  const initialLangRef = useRef(preferredNoctisLang)

  const containerRef = useRef<HTMLDivElement>(null)
  const ytIframeRef = useRef<HTMLIFrameElement>(null)
  const externalIframeRef = useRef<HTMLIFrameElement>(null)
  const html5VideoRef = useRef<HTMLVideoElement>(null)
  const generatedIdRef = useRef<string>(`cln-studio-${Math.random().toString(36).slice(2, 10)}`)
  const effectivePlayerId = playerId || generatedIdRef.current
  const onExclusiveStopRef = useRef(onExclusiveStop)
  onExclusiveStopRef.current = onExclusiveStop
  const onPlaybackTimeChangeRef = useRef(onPlaybackTimeChange)
  onPlaybackTimeChangeRef.current = onPlaybackTimeChange
  const lastReportedSecRef = useRef<number>(-1)

  const [isPlaying, setIsPlaying] = useState<boolean>(effectiveAutoPlay)
  const [isStoppedByOther, setIsStoppedByOther] = useState<boolean>(false)
  const [playbackPhase, setPlaybackPhase] = useState<"playing" | "paused" | "ended">(
    effectiveAutoPlay ? "playing" : "paused"
  )
  const [showMoreVideosOverlay, setShowMoreVideosOverlay] = useState<boolean>(false)
  const dismissedPauseOverlayRef = useRef<boolean>(false)
  const lastInterceptedYtIdRef = useRef<string>("")
  const wasPlayingBeforeCallRef = useRef<boolean>(false)
  const isPlayingStateRef = useRef<boolean>(effectiveAutoPlay)
  isPlayingStateRef.current = isPlaying
  const isVoiceDuckingRef = useRef<boolean>(false)
  const [isMutedState, setIsMutedState] = useState<boolean>(() => {
    if (initialMuted || isVoiceDuckingRef.current || isInterpretingNeededRef.current) return true
    return !hasSessionAudioActivation()
  })
  const [controlsVisible, setControlsVisible] = useState<boolean>(true)
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(() => {
    const parts = (activeDurationLabel || "").split(":").map(Number)
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return Math.max(60, parts[0] * 60 + parts[1])
    }
    return 180
  })

  useEffect(() => {
    const parts = (activeDurationLabel || "").split(":").map(Number)
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      setDuration(Math.max(60, parts[0] * 60 + parts[1]))
    } else {
      setDuration(180)
    }
  }, [activeDurationLabel, activeYoutubeId])

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement &&
            (document.fullscreenElement === containerRef.current ||
              containerRef.current?.contains(document.fullscreenElement))
        )
      )
    }
    document.addEventListener("fullscreenchange", onFsChange)
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange)
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current)
    }
  }, [])

  const revealControlsTemporarily = useCallback(() => {
    setControlsVisible(true)
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current)
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlayingStateRef.current) {
        setControlsVisible(false)
      }
    }, 3200)
  }, [])

  const moreVideosList = useMemo(
    () =>
      getConnectLnMoreVideosCatalog({
        currentYoutubeId: activeYoutubeId,
        currentDirectUrl: activeDirectVideoUrl,
        currentTitle: activeTitle,
        customRelated: relatedVideos,
        limit: 12,
      }),
    [activeYoutubeId, activeDirectVideoUrl, activeTitle, relatedVideos]
  )

  const currentVideoAsStaged = useMemo<StagedConnectLnVideo>(
    () => ({
      youtubeId: activeYoutubeId || undefined,
      directVideoUrl: activeDirectVideoUrl,
      embedUrl: activeEmbedUrl,
      sourceProvider: effectiveProvider,
      title: activeTitle,
      speaker: activeSpeaker,
      speakerRole: activeSpeakerRole,
      serialPlate: activeSerialPlate,
      durationLabel: activeDurationLabel,
      description: activeDescription,
      takeaways: activeTakeaways,
      thumbnailUrl:
        activePosterImageUrl ||
        (activeYoutubeId ? `https://i.ytimg.com/vi/${activeYoutubeId}/hqdefault.jpg` : undefined),
      sourceLanguage: activeSourceLangRaw,
      sourceLanguageLabel: activeSourceLangLabel,
    }),
    [
      activeYoutubeId,
      activeDirectVideoUrl,
      activeEmbedUrl,
      effectiveProvider,
      activeTitle,
      activeSpeaker,
      activeSpeakerRole,
      activeSerialPlate,
      activeDurationLabel,
      activeDescription,
      activeTakeaways,
      activePosterImageUrl,
      activeSourceLangRaw,
      activeSourceLangLabel,
    ]
  )

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

  const onSelectMoreVideoRef = useRef(onSelectMoreVideo)
  onSelectMoreVideoRef.current = onSelectMoreVideo

  const playVideoInline = useCallback(
    (videoToPlay: StagedConnectLnVideo) => {
      setShowMoreVideosOverlay(false)
      dismissedPauseOverlayRef.current = false
      if (onSelectMoreVideoRef.current) {
        onSelectMoreVideoRef.current(videoToPlay)
        return
      }
      setInlineVideoHistory((prev) => [...prev, currentVideoAsStaged])
      setInlineVideoOverride(videoToPlay)
      setIsStoppedByOther(false)
      setPlaybackPhase("playing")
      setIsPlaying(true)
      setCurrentTime(0)
      notifyExclusiveVideoPlay(effectivePlayerId)
      revealControlsTemporarily()
    },
    [currentVideoAsStaged, effectivePlayerId, revealControlsTemporarily]
  )

  const playVideoInlineRef = useRef(playVideoInline)
  playVideoInlineRef.current = playVideoInline

  const handleReturnToPreviousInlineVideo = useCallback(() => {
    if (inlineVideoHistory.length === 0) return
    const previous = inlineVideoHistory[inlineVideoHistory.length - 1]
    const nextHistory = inlineVideoHistory.slice(0, -1)
    setInlineVideoHistory(nextHistory)
    setInlineVideoOverride(nextHistory.length === 0 ? null : previous)
    setShowMoreVideosOverlay(false)
    dismissedPauseOverlayRef.current = false
    setIsStoppedByOther(false)
    setPlaybackPhase("playing")
    setIsPlaying(true)
    setCurrentTime(0)
    notifyExclusiveVideoPlay(effectivePlayerId)
    revealControlsTemporarily()
  }, [effectivePlayerId, inlineVideoHistory, revealControlsTemporarily])

  const openInConnectLnStage = useCallback(
    (videoToStage: StagedConnectLnVideo) => {
      setShowMoreVideosOverlay(false)
      dismissedPauseOverlayRef.current = false
      if (onSelectMoreVideoRef.current) {
        onSelectMoreVideoRef.current(videoToStage)
        return
      }
      if (isHtml5Direct && html5VideoRef.current) {
        html5VideoRef.current.pause()
      } else if (effectiveProvider === "youtube") {
        sendYtCommand("mute")
        sendYtCommand("pauseVideo")
      }
      setIsPlaying(false)
      setIsStoppedByOther(true)
      stageConnectLnVideo(videoToStage, {
        openMoreVideos: true,
        relatedVideos: moreVideosList,
      })
    },
    [effectiveProvider, isHtml5Direct, moreVideosList, sendYtCommand]
  )

  const duckReinforceTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])

  const shouldMuteForTranslation = useCallback(() => {
    if (isVoiceDuckingRef.current || isInterpretingNeededRef.current) return true
    if (typeof window !== "undefined") {
      const w = window as any
      if (w.__noctisVoiceDuckingActive === true) return true
      const shared = w.__noctisSharedAudioEl
      if (
        shared instanceof HTMLAudioElement &&
        !shared.paused &&
        !shared.ended &&
        shared.src &&
        !shared.src.startsWith("data:")
      ) {
        return true
      }
      const activeTarget = (
        w.__noctisPreferredAudioLang ||
        document.documentElement.getAttribute("lang") ||
        ""
      )
        .toString()
        .toLowerCase()
      if (activeTarget && activeTarget !== sourceLangRef.current) return true
    }
    return false
  }, [])

  // Duck or restore audio safely via official player APIs (YouTube IFrame API or HTML5 <video>.muted)
  const applyVoiceDuckingToPlayer = useCallback(
    (shouldDuck: boolean) => {
      duckReinforceTimersRef.current.forEach((t) => clearTimeout(t))
      duckReinforceTimersRef.current = []

      const muteActive = shouldDuck || shouldMuteForTranslation()
      if (isHtml5Direct && html5VideoRef.current) {
        html5VideoRef.current.muted = muteActive
        html5VideoRef.current.volume = muteActive ? 0 : 1
        setIsMutedState(muteActive)
        return
      }
      if (effectiveProvider === "vimeo") {
        const extWin = externalIframeRef.current?.contentWindow
        if (extWin) {
          try {
            extWin.postMessage(JSON.stringify({ method: "setVolume", value: muteActive ? 0 : 1 }), "*")
            extWin.postMessage(JSON.stringify({ method: "setMuted", value: muteActive }), "*")
          } catch {}
        }
        setIsMutedState(muteActive)
        return
      }
      if (effectiveProvider === "youtube") {
        if (muteActive) {
          sendYtCommand("setVolume", [0])
          sendYtCommand("mute")
          setIsMutedState(true)
          const t1 = setTimeout(() => {
            if (shouldMuteForTranslation()) {
              sendYtCommand("setVolume", [0])
              sendYtCommand("mute")
            }
          }, 150)
          const t2 = setTimeout(() => {
            if (shouldMuteForTranslation()) {
              sendYtCommand("setVolume", [0])
              sendYtCommand("mute")
            }
          }, 450)
          const t3 = setTimeout(() => {
            if (shouldMuteForTranslation()) {
              sendYtCommand("setVolume", [0])
              sendYtCommand("mute")
            }
          }, 1000)
          duckReinforceTimersRef.current.push(t1, t2, t3)
        } else if (!initialMuted && hasSessionAudioActivation()) {
          sendYtCommand("unMute")
          sendYtCommand("setVolume", [100])
          setIsMutedState(false)
        }
      }
    },
    [effectiveProvider, initialMuted, isHtml5Direct, sendYtCommand, shouldMuteForTranslation]
  )

  useEffect(() => {
    const syncMuteOnLangOrDuck = (forcedDuck?: boolean, incomingLang?: string) => {
      const w = typeof window !== "undefined" ? (window as any) : {}
      const shared = w.__noctisSharedAudioEl
      const sharedPlaying = Boolean(
        shared instanceof HTMLAudioElement &&
          !shared.paused &&
          !shared.ended &&
          shared.src &&
          !shared.src.startsWith("data:")
      )
      const activeTarget = (
        incomingLang ||
        w.__noctisPreferredAudioLang ||
        language ||
        ""
      )
        .toString()
        .toLowerCase()
      const differsFromSource = Boolean(activeTarget && activeTarget !== sourceLangRef.current)
      const globalDuck = w.__noctisVoiceDuckingActive === true
      const shouldMute = Boolean(
        forcedDuck ||
          sharedPlaying ||
          (forcedDuck === undefined ? differsFromSource || globalDuck : globalDuck)
      )
      isVoiceDuckingRef.current = shouldMute
      if (!shouldMute) {
        isInterpretingNeededRef.current = false
      }
      applyVoiceDuckingToPlayer(shouldMute)
    }

    syncMuteOnLangOrDuck()

    const handleLangEvt = (e: Event) => {
      const detail = (e as CustomEvent<any>).detail
      const nextLang = typeof detail === "string" ? detail : detail?.langCode
      syncMuteOnLangOrDuck(undefined, nextLang)
    }
    const handleDuckEvt = (e: Event) => {
      const custom = e as CustomEvent<{ duck?: boolean }>
      syncMuteOnLangOrDuck(Boolean(custom.detail?.duck))
    }

    window.addEventListener("sphera-lang-changed", handleLangEvt)
    window.addEventListener("connectln:noctis-command-language", handleLangEvt)
    window.addEventListener("connectln:noctis-voice-duck", handleDuckEvt)
    return () => {
      duckReinforceTimersRef.current.forEach((t) => clearTimeout(t))
      duckReinforceTimersRef.current = []
      window.removeEventListener("sphera-lang-changed", handleLangEvt)
      window.removeEventListener("connectln:noctis-command-language", handleLangEvt)
      window.removeEventListener("connectln:noctis-voice-duck", handleDuckEvt)
    }
  }, [language, isInterpretingNeeded, applyVoiceDuckingToPlayer])

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

  // Auto-pause and unmount inline player when scrolled out of viewport so top videos never play over bottom ones
  useEffect(() => {
    if (isStagedPlayer || typeof IntersectionObserver === "undefined") return
    const target = containerRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            (!entry.isIntersecting || entry.intersectionRatio < 0.08) &&
            isPlayingStateRef.current &&
            !document.fullscreenElement
          ) {
            if (isHtml5Direct && html5VideoRef.current) {
              html5VideoRef.current.pause()
            } else if (effectiveProvider === "youtube") {
              sendYtCommand("setVolume", [0])
              sendYtCommand("mute")
              sendYtCommand("pauseVideo")
            } else if (effectiveProvider === "vimeo") {
              const extWin = externalIframeRef.current?.contentWindow
              if (extWin) {
                try {
                  extWin.postMessage(JSON.stringify({ method: "setVolume", value: 0 }), "*")
                  extWin.postMessage(JSON.stringify({ method: "pause" }), "*")
                } catch {}
              }
            }
            setIsPlaying(false)
            setPlaybackPhase("paused")
            onExclusiveStopRef.current?.()
          }
        }
      },
      {
        root: null,
        rootMargin: "-52px 0px 0px 0px",
        threshold: [0, 0.08, 0.16],
      }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [effectiveProvider, isHtml5Direct, isStagedPlayer, sendYtCommand])

  // YouTube official IFrame postMessage telemetry listener (routes any unexpected switch inline into ConnectLn)
  useEffect(() => {
    setIsStoppedByOther(false)
    setCurrentTime(0)
    setIsPlaying(effectiveAutoPlay)
    setPlaybackPhase(effectiveAutoPlay ? "playing" : "paused")
    setShowMoreVideosOverlay(false)
    dismissedPauseOverlayRef.current = false
    lastInterceptedYtIdRef.current = ""
    setIsMutedState(initialMuted || shouldMuteForTranslation() || !hasSessionAudioActivation())
    if (effectiveAutoPlay) {
      notifyExclusiveVideoPlay(effectivePlayerId)
    }

    if (effectiveProvider !== "youtube" || !activeYoutubeId) return

    const handleMessage = (e: MessageEvent) => {
      const win = ytIframeRef.current?.contentWindow
      if (!win || e.source !== win) return
      if (!e.data || typeof e.data !== "string") return
      try {
        const data = JSON.parse(e.data)
        if (data.event === "infoDelivery" && data.info) {
          const rawReportedId =
            typeof data.info.videoData?.video_id === "string"
              ? data.info.videoData.video_id.trim()
              : ""
          const reportedYtId = extractPlayableYoutubeId(rawReportedId)
          if (
            reportedYtId &&
            reportedYtId !== activeYoutubeId &&
            reportedYtId !== lastInterceptedYtIdRef.current
          ) {
            lastInterceptedYtIdRef.current = reportedYtId
            const vTitle =
              (typeof data.info.videoData?.title === "string" &&
                data.info.videoData.title.trim()) ||
              "ConnectLn Video Briefing"
            const vAuthor =
              (typeof data.info.videoData?.author === "string" &&
                data.info.videoData.author.trim()) ||
              "ConnectLn Studio"
            playVideoInlineRef.current({
              youtubeId: reportedYtId,
              sourceProvider: "youtube",
              title: vTitle,
              speaker: vAuthor,
              serialPlate: "CLN-NEXT",
              thumbnailUrl: `https://i.ytimg.com/vi/${reportedYtId}/hqdefault.jpg`,
              description:
                "Playing inside ConnectLn — zero external transitions.",
            })
            return
          }

          if (typeof data.info.currentTime === "number") {
            setCurrentTime(data.info.currentTime)
          }
          if (typeof data.info.duration === "number" && data.info.duration > 0) {
            setDuration(data.info.duration)
          }
          const translationMuting = shouldMuteForTranslation()
          if (
            translationMuting &&
            (data.info.muted === false ||
              (typeof data.info.volume === "number" && data.info.volume > 0))
          ) {
            sendYtCommand("setVolume", [0])
            sendYtCommand("mute")
            setIsMutedState(true)
          } else if (typeof data.info.muted === "boolean") {
            setIsMutedState(translationMuting ? true : data.info.muted)
          }
          if (typeof data.info.playerState === "number") {
            const pState = data.info.playerState
            if ((window as any).__connectlnCallSilenceActive && pState === 1) {
              sendYtCommand("mute")
              sendYtCommand("pauseVideo")
              setIsPlaying(false)
              setPlaybackPhase("paused")
              return
            }
            if (pState === 1) {
              setIsPlaying(true)
              setPlaybackPhase("playing")
              setShowMoreVideosOverlay(false)
              dismissedPauseOverlayRef.current = false
              if ((window as any).__connectlnActiveVideoPlayerId !== effectivePlayerId) {
                notifyExclusiveVideoPlay(effectivePlayerId)
              }
              if (shouldMuteForTranslation()) {
                sendYtCommand("setVolume", [0])
                sendYtCommand("mute")
                setIsMutedState(true)
              }
            } else if (pState === 2) {
              setIsPlaying(false)
              setPlaybackPhase("paused")
              setControlsVisible(true)
              if (!dismissedPauseOverlayRef.current) {
                setShowMoreVideosOverlay(true)
              }
            } else if (pState === 0) {
              setIsPlaying(false)
              setPlaybackPhase("ended")
              setControlsVisible(true)
              dismissedPauseOverlayRef.current = false
              setShowMoreVideosOverlay(true)
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
    }, 800)

    return () => {
      window.removeEventListener("message", handleMessage)
      clearInterval(poll)
    }
  }, [activeYoutubeId, activeDirectVideoUrl, effectiveProvider, effectiveAutoPlay, effectivePlayerId, initialMuted, sendYtCommand, shouldMuteForTranslation])

  // Gentle timer tick for non-YouTube external iframes so docked Noctis Interpreter tracks progress
  useEffect(() => {
    if (!isPlaying || isStoppedByOther || effectiveProvider === "youtube" || isHtml5Direct) return
    const timer = setInterval(() => {
      setCurrentTime((prev) => (prev + 1 >= duration ? 0 : prev + 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying, isStoppedByOther, effectiveProvider, isHtml5Direct, duration])

  // Notify parent classroom workspace only when the integer second changes
  useEffect(() => {
    const wholeSec = Math.max(0, Math.floor(currentTime))
    const wholeDur = Math.max(0, Math.floor(duration))
    if (wholeSec !== lastReportedSecRef.current) {
      lastReportedSecRef.current = wholeSec
      onPlaybackTimeChangeRef.current?.(wholeSec, wholeDur)
    }
  }, [currentTime, duration])

  // Seek playback on external timestamp note click using official APIs only
  useEffect(() => {
    if (!seekRequest) return
    const targetSec = Math.max(0, Math.floor(seekRequest.seconds))
    notifyExclusiveVideoPlay(effectivePlayerId)
    setIsStoppedByOther(false)
    if (isHtml5Direct && html5VideoRef.current) {
      try {
        html5VideoRef.current.currentTime = targetSec
        html5VideoRef.current.play().catch(() => {})
      } catch {
        // ignore seek error before metadata load
      }
    } else if (effectiveProvider === "youtube") {
      sendYtCommand("seekTo", [targetSec, true])
      sendYtCommand("playVideo")
    }
    setCurrentTime(targetSec)
    setIsPlaying(true)
  }, [seekRequest?.nonce, seekRequest?.seconds, effectivePlayerId, effectiveProvider, isHtml5Direct, sendYtCommand])

  // Computed official embed URL for iframe-based non-YouTube providers
  const resolvedExternalEmbedSrc = useMemo(() => {
    if (effectiveProvider === "youtube" || isHtml5Direct) return ""
    const raw = (activeEmbedUrl || activeSourceVideoUrl || "").trim()
    if (!raw) return ""
    if (effectiveProvider === "vimeo") {
      try {
        const u = new URL(raw.includes("player.vimeo.com") ? raw : raw)
        const muteFlag = initialMuted || shouldMuteForTranslation() ? "1" : hasSessionAudioActivation() ? "0" : "1"
        if (!u.hostname.includes("player.vimeo.com")) {
          const m = u.pathname.match(/\/(\d{6,12})/)
          if (m?.[1]) {
            return `https://player.vimeo.com/video/${m[1]}?autoplay=${effectiveAutoPlay ? 1 : 0}&muted=${muteFlag}&dnt=1`
          }
        }
        u.searchParams.set("autoplay", effectiveAutoPlay ? "1" : "0")
        u.searchParams.set("muted", muteFlag)
        return u.toString()
      } catch {
        return raw
      }
    }
    return raw
  }, [effectiveProvider, isHtml5Direct, activeEmbedUrl, activeSourceVideoUrl, effectiveAutoPlay, initialMuted, shouldMuteForTranslation])

  const resolvedPoster =
    activePosterImageUrl ||
    (activeYoutubeId ? `https://i.ytimg.com/vi/${activeYoutubeId}/hqdefault.jpg` : undefined)

  const providerMeta = getProviderMeta(effectiveProvider)

  const compliantYouTubeSrc = useMemo(() => {
    if (!activeYoutubeId) return ""
    const muteFlag = initialMuted || shouldMuteForTranslation() ? 1 : hasSessionAudioActivation() ? 0 : 1
    const params = new URLSearchParams({
      autoplay: effectiveAutoPlay ? "1" : "0",
      mute: String(muteFlag),
      controls: "0",
      disablekb: "1",
      fs: "0",
      rel: "0",
      iv_load_policy: "3",
      modestbranding: "1",
      playsinline: "1",
      enablejsapi: "1",
      origin: playerOrigin,
      cc_load_policy: initialLangRef.current !== normalizedSourceLang ? "1" : "0",
      cc_lang_pref: initialLangRef.current,
      hl: initialLangRef.current,
    })
    return `https://www.youtube-nocookie.com/embed/${activeYoutubeId}?${params.toString()}`
  }, [activeYoutubeId, effectiveAutoPlay, initialMuted, normalizedSourceLang, playerOrigin, shouldMuteForTranslation])

  const handleResumePlayer = useCallback(() => {
    notifyExclusiveVideoPlay(effectivePlayerId)
    setIsStoppedByOther(false)
    setShowMoreVideosOverlay(false)
    dismissedPauseOverlayRef.current = false
    setPlaybackPhase("playing")
    setIsPlaying(true)
    if (isHtml5Direct && html5VideoRef.current) {
      if (playbackPhase === "ended") {
        try {
          html5VideoRef.current.currentTime = 0
        } catch {}
      }
      html5VideoRef.current.play().catch(() => {})
    } else if (effectiveProvider === "youtube") {
      if (playbackPhase === "ended") {
        sendYtCommand("seekTo", [0, true])
      }
      sendYtCommand("playVideo")
    }
    revealControlsTemporarily()
  }, [effectivePlayerId, effectiveProvider, isHtml5Direct, playbackPhase, revealControlsTemporarily, sendYtCommand])

  const handleCanvasClick = useCallback(() => {
    if (isPlaying) {
      dismissedPauseOverlayRef.current = false
      sendYtCommand("pauseVideo")
      setIsPlaying(false)
      setPlaybackPhase("paused")
      setShowMoreVideosOverlay(true)
      setControlsVisible(true)
    } else {
      handleResumePlayer()
    }
  }, [handleResumePlayer, isPlaying, sendYtCommand])

  const toggleYouTubePlayPause = useCallback(() => {
    if (isPlaying) {
      dismissedPauseOverlayRef.current = true
      sendYtCommand("pauseVideo")
      setIsPlaying(false)
      setPlaybackPhase("paused")
      setControlsVisible(true)
    } else {
      handleResumePlayer()
    }
  }, [handleResumePlayer, isPlaying, sendYtCommand])

  const seekYouTubeTo = useCallback(
    (targetSec: number) => {
      const clamped = Math.max(0, Math.min(Math.floor(duration), Math.floor(targetSec)))
      sendYtCommand("seekTo", [clamped, true])
      setCurrentTime(clamped)
      revealControlsTemporarily()
    },
    [duration, revealControlsTemporarily, sendYtCommand]
  )

  const seekYouTubeBy = useCallback(
    (deltaSec: number) => {
      seekYouTubeTo(currentTime + deltaSec)
    },
    [currentTime, seekYouTubeTo]
  )

  const toggleYouTubeMute = useCallback(() => {
    if (isMutedState) {
      if (shouldMuteForTranslation()) {
        sendYtCommand("setVolume", [0])
        sendYtCommand("mute")
        setIsMutedState(true)
        revealControlsTemporarily()
        return
      }
      ;(window as any).__connectlnAudioUnlocked = true
      sendYtCommand("unMute")
      sendYtCommand("setVolume", [100])
      setIsMutedState(false)
    } else {
      sendYtCommand("mute")
      sendYtCommand("setVolume", [0])
      setIsMutedState(true)
    }
    revealControlsTemporarily()
  }, [isMutedState, revealControlsTemporarily, sendYtCommand, shouldMuteForTranslation])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      el.requestFullscreen?.().catch(() => {})
    }
    revealControlsTemporarily()
  }, [revealControlsTemporarily])

  const openInPlayerMoreVideos = useCallback(() => {
    dismissedPauseOverlayRef.current = false
    setShowMoreVideosOverlay(true)
    setControlsVisible(true)
    if (isHtml5Direct && html5VideoRef.current && !html5VideoRef.current.paused) {
      html5VideoRef.current.pause()
      setIsPlaying(false)
      setPlaybackPhase("paused")
    } else if (effectiveProvider === "youtube" && isPlayingStateRef.current) {
      sendYtCommand("pauseVideo")
      setIsPlaying(false)
      setPlaybackPhase("paused")
    }
  }, [effectiveProvider, isHtml5Direct, sendYtCommand])

  return (
    <div
      ref={containerRef}
      className={`flex flex-col w-full bg-black overflow-hidden ${className}`}
    >
      {/* 860x496 Ultra-Wide Studio Stage Video Canvas (Strict Sandbox + Native ConnectLn Controls & In-Player Shelf) */}
      <div
        data-testid="connectln-studio-player-stage"
        className="relative w-full max-w-[860px] mx-auto aspect-[860/496] min-h-[200px] bg-black overflow-hidden group/canvas"
        onMouseMove={revealControlsTemporarily}
        onTouchStart={revealControlsTemporarily}
      >
        {isStoppedByOther ? (
          <div className="relative h-full w-full flex flex-col items-center justify-center bg-zinc-950 text-white">
            {resolvedPoster && (
              <img
                src={resolvedPoster}
                alt={activeTitle}
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
                {activeTitle}
              </p>
            </div>
          </div>
        ) : isHtml5Direct && activeDirectVideoUrl ? (
          <video
            ref={html5VideoRef}
            key={activeDirectVideoUrl}
            src={activeDirectVideoUrl}
            poster={resolvedPoster}
            controls
            playsInline
            preload="metadata"
            autoPlay={effectiveAutoPlay}
            muted={initialMuted || shouldMuteForTranslation()}
            data-connectln-player-id={effectivePlayerId}
            onPlay={(e) => {
              notifyExclusiveVideoPlay(effectivePlayerId)
              if (shouldMuteForTranslation()) {
                e.currentTarget.muted = true
                e.currentTarget.volume = 0
                setIsMutedState(true)
              }
              setIsPlaying(true)
              setPlaybackPhase("playing")
              setShowMoreVideosOverlay(false)
              dismissedPauseOverlayRef.current = false
            }}
            onVolumeChange={(e) => {
              if (shouldMuteForTranslation() && (!e.currentTarget.muted || e.currentTarget.volume > 0)) {
                e.currentTarget.muted = true
                e.currentTarget.volume = 0
                setIsMutedState(true)
              }
            }}
            onPause={(e) => {
              setIsPlaying(false)
              if (!e.currentTarget.seeking && !e.currentTarget.ended) {
                setPlaybackPhase("paused")
                if (!dismissedPauseOverlayRef.current) {
                  setShowMoreVideosOverlay(true)
                }
              }
            }}
            onEnded={() => {
              setIsPlaying(false)
              setPlaybackPhase("ended")
              dismissedPauseOverlayRef.current = false
              setShowMoreVideosOverlay(true)
            }}
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration
              if (Number.isFinite(d) && d > 0) setDuration(d)
            }}
            onTimeUpdate={(e) => {
              setCurrentTime(e.currentTarget.currentTime || 0)
            }}
            onError={() => {
              if (activeEmbedUrl) {
                setHtml5FallbackToEmbed(true)
              }
            }}
            className="h-full w-full bg-black object-contain"
          />
        ) : effectiveProvider === "youtube" && activeYoutubeId ? (
          <iframe
            ref={ytIframeRef}
            key={activeYoutubeId}
            data-connectln-player-id={effectivePlayerId}
            src={compliantYouTubeSrc}
            title={activeTitle}
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
            onLoad={() => {
              const win = ytIframeRef.current?.contentWindow
              if (win) {
                win.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*")
              }
              if (shouldMuteForTranslation()) {
                sendYtCommand("setVolume", [0])
                sendYtCommand("mute")
                setIsMutedState(true)
              }
            }}
            className="h-full w-full border-0 pointer-events-none select-none"
          />
        ) : resolvedExternalEmbedSrc ? (
          <iframe
            ref={externalIframeRef}
            key={resolvedExternalEmbedSrc}
            data-connectln-player-id={effectivePlayerId}
            src={resolvedExternalEmbedSrc}
            title={activeTitle}
            sandbox="allow-scripts allow-same-origin allow-presentation"
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

        {/* ConnectLn Native Custom Player Controls Overlay (Zero YouTube Popups/Links) */}
        {effectiveProvider === "youtube" &&
          activeYoutubeId &&
          !isStoppedByOther &&
          !showMoreVideosOverlay && (
            <div
              data-connectln-player-controls="true"
              className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none"
            >
              {/* Transparent canvas click target to pause/play cleanly inside ConnectLn */}
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onClick={handleCanvasClick}
                className="absolute inset-0 z-0 w-full h-full bg-transparent pointer-events-auto cursor-pointer focus:outline-none"
              />

              {/* Top Bar: Inline History Back + Active Title + Audio & More Videos */}
              <div
                className={`relative z-10 flex items-center justify-between gap-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-3 py-2 text-white pointer-events-auto transition-opacity duration-200 ${
                  controlsVisible || !isPlaying || inlineVideoHistory.length > 0 || isMutedState
                    ? "opacity-100"
                    : "opacity-0 group-hover/canvas:opacity-100"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {inlineVideoHistory.length > 0 && (
                    <button
                      type="button"
                      data-connectln-inline-back="true"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReturnToPreviousInlineVideo()
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-black/75 hover:bg-[#0A66C2] border border-white/25 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm cursor-pointer shrink-0 transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Back</span>
                    </button>
                  )}
                  <span className="text-[11px] font-semibold text-white/95 line-clamp-1 drop-shadow">
                    {activeTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isMutedState && !shouldMuteForTranslation() && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleYouTubeMute()
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-black/75 hover:bg-[#0A66C2] border border-white/25 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm cursor-pointer transition-colors"
                    >
                      <VolumeX className="h-3 w-3" />
                      <span>Tap for sound</span>
                    </button>
                  )}
                  <button
                    type="button"
                    data-connectln-inplayer-more="true"
                    onClick={(e) => {
                      e.stopPropagation()
                      openInPlayerMoreVideos()
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-zinc-900/85 hover:bg-[#0A66C2] border border-white/25 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:text-white shadow-sm cursor-pointer transition-colors"
                  >
                    <Film className="h-3 w-3" />
                    <span>More Videos</span>
                  </button>
                </div>
              </div>

              {/* Bottom Control Bar: Seek Slider, Play/Pause, -10s/+10s, Mute, Time, Videos, Fullscreen */}
              <div
                onClick={(e) => e.stopPropagation()}
                className={`relative z-10 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-3 pt-4 pb-2 text-white pointer-events-auto transition-opacity duration-200 space-y-1.5 ${
                  controlsVisible || !isPlaying
                    ? "opacity-100"
                    : "opacity-0 group-hover/canvas:opacity-100"
                }`}
              >
                <input
                  type="range"
                  aria-label="Seek video"
                  min={0}
                  max={Math.max(1, Math.floor(duration))}
                  value={Math.min(Math.floor(currentTime), Math.floor(duration))}
                  onChange={(e) => seekYouTubeTo(Number(e.target.value))}
                  className="w-full h-1.5 accent-[#0A66C2] bg-white/25 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={toggleYouTubePlayPause}
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                      className="inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-[#0A66C2] p-1.5 text-white cursor-pointer transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="h-3.5 w-3.5 fill-white" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => seekYouTubeBy(-10)}
                      aria-label="Rewind 10 seconds"
                      className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-white/10 hover:bg-white/25 px-2 py-1 text-[10px] font-bold text-white cursor-pointer transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>10s</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => seekYouTubeBy(10)}
                      aria-label="Forward 10 seconds"
                      className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-white/10 hover:bg-white/25 px-2 py-1 text-[10px] font-bold text-white cursor-pointer transition-colors"
                    >
                      <span>10s</span>
                      <RotateCw className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleYouTubeMute}
                      aria-label={isMutedState ? "Unmute video" : "Mute video"}
                      className="inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 p-1.5 text-white cursor-pointer transition-colors"
                    >
                      {isMutedState ? (
                        <VolumeX className="h-3.5 w-3.5" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <span className="font-mono text-[10px] sm:text-[11px] text-zinc-200 select-none">
                      {formatMediaTime(currentTime)} / {formatMediaTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      data-connectln-inplayer-more-bottom="true"
                      onClick={openInPlayerMoreVideos}
                      className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-[#0A66C2] px-2.5 py-1 text-[10px] font-bold text-white cursor-pointer transition-colors"
                    >
                      <Film className="h-3 w-3 text-amber-300" />
                      <span>Videos</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                      className="inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 p-1.5 text-white cursor-pointer transition-colors"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Native ConnectLn "More Videos" Overlay Covering Paused/Ended Canvas (Keeps Users Inside ConnectLn) */}
        {showMoreVideosOverlay && !isStoppedByOther && (
          <div className="absolute inset-0 z-20 flex flex-col justify-between bg-gradient-to-t from-black/95 via-black/85 to-black/75 p-3 sm:p-4 text-white backdrop-blur-[2px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {inlineVideoHistory.length > 0 && (
                  <button
                    type="button"
                    data-connectln-inline-back="true"
                    onClick={handleReturnToPreviousInlineVideo}
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-[#0A66C2] border border-white/25 px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Previous Video</span>
                  </button>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 border border-white/20 px-2.5 py-1 text-[10px] font-bold text-amber-300">
                  <Film className="h-3 w-3" />
                  <span>
                    ConnectLn Player ·{" "}
                    {playbackPhase === "ended"
                      ? "Up Next on ConnectLn"
                      : "Paused · More Videos in ConnectLn"}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResumePlayer}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0A66C2] hover:bg-[#004182] px-3 py-1 text-[11px] font-bold text-white shadow-md cursor-pointer"
                >
                  {playbackPhase === "ended" ? (
                    <RotateCcw className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3 fill-white" />
                  )}
                  <span>{playbackPhase === "ended" ? "Replay" : "Resume"}</span>
                </button>
                {!isStagedPlayer && (
                  <button
                    type="button"
                    onClick={() => openInConnectLnStage(currentVideoAsStaged)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Stage Player</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    dismissedPauseOverlayRef.current = true
                    setShowMoreVideosOverlay(false)
                  }}
                  aria-label="Dismiss More Videos overlay"
                  className="rounded-full bg-black/60 hover:bg-black/85 border border-white/20 p-1 text-zinc-200 hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-extrabold text-white">
                  More Videos to Watch in ConnectLn
                </p>
                <button
                  type="button"
                  onClick={() =>
                    openInConnectLnStage(moreVideosList[0] || currentVideoAsStaged)
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-amber-500 hover:bg-amber-400 px-3 py-1 text-[11px] font-extrabold text-zinc-950 shadow-sm cursor-pointer shrink-0"
                >
                  <span>Stage New Player →</span>
                </button>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {moreVideosList.slice(0, 8).map((vid, idx) => (
                  <button
                    key={`${vid.youtubeId || vid.directVideoUrl || vid.title}-${idx}`}
                    type="button"
                    data-connectln-inplayer-video-card="true"
                    onClick={() => playVideoInline(vid)}
                    className="group flex w-44 sm:w-52 shrink-0 flex-col overflow-hidden rounded-xl border border-white/20 bg-zinc-900/95 hover:border-amber-400 text-left shadow-lg transition-all cursor-pointer"
                  >
                    <div className="relative h-22 sm:h-24 w-full bg-black overflow-hidden">
                      {vid.thumbnailUrl ? (
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-zinc-800 text-zinc-400 text-xs">
                          ConnectLn Video
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A66C2]/95 text-white shadow-md">
                          <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                        </span>
                      </div>
                    </div>
                    <div className="p-2 space-y-0.5">
                      <p className="text-[11px] font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300">
                        {vid.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {vid.speaker || "ConnectLn Studio"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compliant In-Platform Attribution Strip Positioned Strictly BELOW the Video Frame */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 border-t border-zinc-800/90 px-3 py-1.5 text-[11px] text-zinc-300">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold shrink-0 ${providerMeta.pillClass}`}
          >
            {effectiveProvider === "connectln_native" && <ShieldCheck className="h-3 w-3" />}
            {providerMeta.badge}
          </span>
          <span className="truncate font-semibold text-zinc-100">{activeSpeaker}</span>
          {licenseLabel && (
            <span className="text-[10px] text-zinc-400 hidden sm:inline">
              · {licenseLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isStagedPlayer && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
              <ShieldCheck className="h-3 w-3" />
              <span>Plays inside ConnectLn</span>
            </span>
          )}
          <button
            type="button"
            data-connectln-more-videos="true"
            onClick={() =>
              openInConnectLnStage(
                isStagedPlayer && moreVideosList[0]
                  ? moreVideosList[0]
                  : currentVideoAsStaged
              )
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-[#0A66C2]/20 hover:bg-[#0A66C2] px-2.5 py-0.5 text-[10px] font-bold text-sky-100 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <PlayCircle className="h-3 w-3" />
            <span>More Videos</span>
          </button>
        </div>
      </div>

      {/* DOCKED NOCTIS LIVE VIDEO LANGUAGE INTERPRETER & VOICE DUBBING BAR (Cleanly Below Video Frame) */}
      {!isStoppedByOther && (
        <NoctisVideoInterpreterPopup
          dockedBelow={true}
          youtubeId={activeYoutubeId || undefined}
          title={activeTitle}
          speaker={activeSpeaker}
          speakerRole={activeSpeakerRole}
          serialPlate={activeSerialPlate}
          description={activeDescription}
          takeaways={activeTakeaways}
          sourceLanguage={normalizedSourceLang}
          sourceLanguageLabel={activeSourceLangLabel}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onRequestPlayVideo={() => {
            notifyExclusiveVideoPlay(effectivePlayerId)
            setIsStoppedByOther(false)
            setShowMoreVideosOverlay(false)
            dismissedPauseOverlayRef.current = false
            setPlaybackPhase("playing")
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
            if (!shouldDuck) {
              isInterpretingNeededRef.current = false
            }
            applyVoiceDuckingToPlayer(shouldDuck)
          }}
        />
      )}
    </div>
  )
}
