"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { NoctisVideoInterpreterPopup } from "./NoctisVideoInterpreterPopup"

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

// Global capture-phase listener so native <video> elements also enforce single-video playback,
// plus session-wide audio unlock tracker so videos scrolled into view unmute speaker automatically!
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
  youtubeId: string
  title: string
  serialPlate?: string
  speaker?: string
  speakerRole?: string
  speakerAvatarUrl?: string
  posterImageUrl?: string
  durationLabel?: string
  description?: string
  takeaways?: string[]
  /** Spoken language of the source video (defaults to "en"). If non-English (e.g. "es", "fr", "ja") and user is on English, Noctis interprets it into English! */
  sourceLanguage?: string
  sourceLanguageLabel?: string
  autoPlay?: boolean
  initialMuted?: boolean
  className?: string
  playerId?: string
  onExclusiveStop?: () => void
}

export function ConnectLnStudioPlayer({
  youtubeId,
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
  className = "h-[230px] sm:h-[280px] w-full",
  playerId,
  onExclusiveStop
}: ConnectLnStudioPlayerProps) {
  const { language } = useLanguage()
  const normalizedSourceLang = (sourceLanguage || "en").toLowerCase()
  const preferredNoctisLang =
    typeof window !== "undefined" && (window as any).__noctisPreferredAudioLang
      ? String((window as any).__noctisPreferredAudioLang).toLowerCase()
      : language
  const isInterpretingNeeded =
    language !== normalizedSourceLang || preferredNoctisLang !== normalizedSourceLang
  const isInterpretingNeededRef = useRef(isInterpretingNeeded)
  isInterpretingNeededRef.current = isInterpretingNeeded
  const languageRef = useRef(language)
  languageRef.current = language
  const sourceLangRef = useRef(normalizedSourceLang)
  sourceLangRef.current = normalizedSourceLang
  const initialLangRef = useRef(preferredNoctisLang)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const generatedIdRef = useRef<string>(`cln-studio-${Math.random().toString(36).slice(2, 10)}`)
  const effectivePlayerId = playerId || generatedIdRef.current
  const onExclusiveStopRef = useRef(onExclusiveStop)
  onExclusiveStopRef.current = onExclusiveStop

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay)
  const [hasVideoStarted, setHasVideoStarted] = useState<boolean>(false)
  const [isStoppedByOther, setIsStoppedByOther] = useState<boolean>(false)
  const userPausedManuallyRef = useRef<boolean>(false)
  const wasPlayingBeforeCallRef = useRef<boolean>(false)
  const isPlayingStateRef = useRef<boolean>(autoPlay)
  isPlayingStateRef.current = isPlaying
  const unmuteBlockedByBrowserRef = useRef<boolean>(false)
  const hasUnmutedOnceRef = useRef<boolean>(false)
  const ytPlayerStateRef = useRef<number>(-1)
  const lastUnmuteSentAtRef = useRef<number>(0)
  const lastRecoveryAtRef = useRef<number>(0)
  const [isMuted, setIsMuted] = useState<boolean>(initialMuted)
  const isVoiceDuckingRef = useRef<boolean>(false)
  const userManuallyMutedRef = useRef<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(() => {
    const parts = durationLabel.split(":").map(Number)
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1]
    }
    return 120
  })
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [showControls, setShowControls] = useState<boolean>(!autoPlay)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sendPlayerCommand = useCallback((func: string, args: any[] = []) => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args
      }),
      "*"
    )
  }, [])

  // Helper: whether the original YouTube audio must stay muted for translation/dubbing
  const shouldMuteForTranslation = useCallback(() => {
    if (isVoiceDuckingRef.current || isInterpretingNeededRef.current) return true
    if (typeof window !== "undefined" && (window as any).__noctisPreferredAudioLang) {
      const pref = String((window as any).__noctisPreferredAudioLang).toLowerCase()
      if (pref !== sourceLangRef.current) return true
    }
    return false
  }, [])

  // When Noctis interpretation is actively speaking (shouldDuck === true), completely MUTE the original video audio
  // on ALL devices (desktop and mobile) so you NEVER hear two people talking at the same time, and keep video playing!
  // When Noctis stops speaking (shouldDuck === false), restore original video sound only if not in translation mode.
  const applyVoiceDuckingToPlayer = useCallback(
    (shouldDuck: boolean) => {
      if (shouldDuck || shouldMuteForTranslation()) {
        sendPlayerCommand("setVolume", [0])
        sendPlayerCommand("mute")
        if (!userPausedManuallyRef.current && (ytPlayerStateRef.current === 2 || ytPlayerStateRef.current === 5)) {
          sendPlayerCommand("playVideo")
        }
        setTimeout(() => {
          if (isVoiceDuckingRef.current || shouldMuteForTranslation()) {
            sendPlayerCommand("setVolume", [0])
            sendPlayerCommand("mute")
            if (!userPausedManuallyRef.current && (ytPlayerStateRef.current === 2 || ytPlayerStateRef.current === 5)) {
              sendPlayerCommand("playVideo")
            }
          }
        }, 80)
      } else if (
        ytPlayerStateRef.current === 1 &&
        !userManuallyMutedRef.current &&
        !unmuteBlockedByBrowserRef.current
      ) {
        hasUnmutedOnceRef.current = true
        lastUnmuteSentAtRef.current = Date.now()
        sendPlayerCommand("unMute")
        sendPlayerCommand("setVolume", [100])
        setIsMuted(false)
      }
    },
    [sendPlayerCommand, shouldMuteForTranslation]
  )

  // Listen for any other video starting on the page (or an incoming/active ConnectLn call) and immediately pause this one
  useEffect(() => {
    const handleExclusivePlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ playerId?: string }>
      const activeId = customEvent.detail?.playerId
      if (activeId && activeId !== effectivePlayerId) {
        if (activeId === "__connectln_call_silence__" && isPlayingStateRef.current) {
          wasPlayingBeforeCallRef.current = true
        }
        sendPlayerCommand("mute")
        sendPlayerCommand("pauseVideo")
        if (activeId !== "__connectln_call_silence__") {
          sendPlayerCommand("stopVideo")
        }
        setIsPlaying(false)
        setIsStoppedByOther(true)
        setShowControls(true)
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
        sendPlayerCommand("mute")
        sendPlayerCommand("pauseVideo")
        setIsPlaying(false)
        setShowControls(true)
      } else if (wasPlayingBeforeCallRef.current && !userPausedManuallyRef.current) {
        wasPlayingBeforeCallRef.current = false
        setIsStoppedByOther(false)
        sendPlayerCommand("playVideo")
        setIsPlaying(true)
        if (!userManuallyMutedRef.current && !shouldMuteForTranslation()) {
          sendPlayerCommand("unMute")
          sendPlayerCommand("setVolume", [100])
          setIsMuted(false)
        }
      }
    }
    window.addEventListener(CONNECTLN_VIDEO_PLAY_EVENT, handleExclusivePlay)
    window.addEventListener("connectln:call-silence-change", handleCallSilenceChange)
    return () => {
      window.removeEventListener(CONNECTLN_VIDEO_PLAY_EVENT, handleExclusivePlay)
      window.removeEventListener("connectln:call-silence-change", handleCallSilenceChange)
    }
  }, [effectivePlayerId, sendPlayerCommand, shouldMuteForTranslation])

  // Subscribe to YouTube iframe state/time events via postMessage
  useEffect(() => {
    userPausedManuallyRef.current = false
    unmuteBlockedByBrowserRef.current = false
    hasUnmutedOnceRef.current = false
    ytPlayerStateRef.current = -1
    lastRecoveryAtRef.current = 0
    setHasVideoStarted(false)
    setIsPlaying(autoPlay)
    setIsStoppedByOther(false)
    setCurrentTime(0)
    if (autoPlay) {
      notifyExclusiveVideoPlay(effectivePlayerId)
    }

    const handleMessage = (e: MessageEvent) => {
      const win = iframeRef.current?.contentWindow
      if (!win || e.source !== win) return
      if (!e.data || typeof e.data !== "string") return
      try {
        const data = JSON.parse(e.data)
        if (data.event === "infoDelivery" && data.info) {
          if (typeof data.info.currentTime === "number") {
            setCurrentTime(data.info.currentTime)
            if (data.info.currentTime > 0.05) {
              setHasVideoStarted(true)
            }
          }
          if (typeof data.info.duration === "number" && data.info.duration > 0) {
            setDuration(data.info.duration)
          }
          if (typeof data.info.playerState === "number") {
            const pState = data.info.playerState
            ytPlayerStateRef.current = pState

            if ((window as any).__connectlnCallSilenceActive) {
              if (pState === 1) {
                win.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*")
                win.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "*")
              }
              setIsPlaying(false)
              return
            }

            // 1 = playing, 2 = paused, 0 = ended (never interrupt -1 unstarted or 3 buffering!)
            if (pState === 1) {
              setIsPlaying(true)
              setHasVideoStarted(true)
              if (shouldMuteForTranslation()) {
                win.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [0] }), "*")
                win.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*")
              } else if (
                !userManuallyMutedRef.current &&
                !unmuteBlockedByBrowserRef.current &&
                !initialMuted &&
                !hasUnmutedOnceRef.current
              ) {
                hasUnmutedOnceRef.current = true
                lastUnmuteSentAtRef.current = Date.now()
                win.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), "*")
                win.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [100] }), "*")
                setIsMuted(false)
              }
            } else if (pState === 0) {
              setCurrentTime(0)
              setIsPlaying(true)
              win.postMessage(JSON.stringify({ event: "command", func: "seekTo", args: [0, true] }), "*")
              win.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), "*")
            } else if (pState === 2 || pState === 5) {
              if (!userPausedManuallyRef.current) {
                // Browser paused the iframe (e.g. blocked unmuted autoplay).
                // Keep the video moving smoothly by muting the iframe and resuming playVideo!
                if (Date.now() - lastUnmuteSentAtRef.current < 3500) {
                  unmuteBlockedByBrowserRef.current = true
                  if (!shouldMuteForTranslation()) {
                    setIsMuted(true)
                  }
                }
                if (Date.now() - lastRecoveryAtRef.current > 900) {
                  lastRecoveryAtRef.current = Date.now()
                  win.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*")
                  win.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), "*")
                }
                setIsPlaying(true)
              } else {
                setIsPlaying(false)
              }
            }
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    }

    window.addEventListener("message", handleMessage)
    const interval = setInterval(() => {
      const win = iframeRef.current?.contentWindow
      if (win) {
        if ((window as any).__connectlnCallSilenceActive) {
          if (ytPlayerStateRef.current === 1) {
            win.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*")
            win.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "*")
          }
          return
        }
        win.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*")
        if (shouldMuteForTranslation() && ytPlayerStateRef.current === 1) {
          win.postMessage(
            JSON.stringify({ event: "command", func: "setVolume", args: [0] }),
            "*"
          )
          win.postMessage(
            JSON.stringify({ event: "command", func: "mute", args: [] }),
            "*"
          )
        } else if (
          ytPlayerStateRef.current === 1 &&
          !userManuallyMutedRef.current &&
          !initialMuted &&
          !shouldMuteForTranslation() &&
          hasSessionAudioActivation() &&
          unmuteBlockedByBrowserRef.current
        ) {
          unmuteBlockedByBrowserRef.current = false
          hasUnmutedOnceRef.current = true
          lastUnmuteSentAtRef.current = Date.now()
          win.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), "*")
          win.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [100] }), "*")
          setIsMuted(false)
        }
        // Only kick playVideo if YouTube is paused (2) or cued (5) — never while -1 (loading) or 3 (buffering)
        if (
          !userPausedManuallyRef.current &&
          (ytPlayerStateRef.current === 2 || ytPlayerStateRef.current === 5) &&
          Date.now() - lastRecoveryAtRef.current > 1200
        ) {
          lastRecoveryAtRef.current = Date.now()
          if (!hasSessionAudioActivation() || unmuteBlockedByBrowserRef.current) {
            win.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*")
          }
          win.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), "*")
        }
      }
    }, 800)

    return () => {
      window.removeEventListener("message", handleMessage)
      clearInterval(interval)
    }
  }, [youtubeId, autoPlay, initialMuted, effectivePlayerId, shouldMuteForTranslation])

  // Automatically unmute speaker when player is in view & pause/mute when scrolled out of view!
  useEffect(() => {
    const node = containerRef.current
    if (!node || typeof window === "undefined" || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          if (isStoppedByOther || userPausedManuallyRef.current || (window as any).__connectlnCallSilenceActive) return
          sendPlayerCommand("playVideo")
          setIsPlaying(true)
          if (!userManuallyMutedRef.current && !shouldMuteForTranslation()) {
            unmuteBlockedByBrowserRef.current = false
            hasUnmutedOnceRef.current = true
            lastUnmuteSentAtRef.current = Date.now()
            sendPlayerCommand("unMute")
            sendPlayerCommand("setVolume", [100])
            setIsMuted(false)
          }
        } else if (!entry.isIntersecting || entry.intersectionRatio < 0.12) {
          if (ytPlayerStateRef.current === 1) {
            sendPlayerCommand("mute")
            sendPlayerCommand("pauseVideo")
            setIsPlaying(false)
          }
        }
      },
      { threshold: [0, 0.12, 0.35, 0.7] }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [isStoppedByOther, sendPlayerCommand, shouldMuteForTranslation])

  // Automatically unmute active in-view video on first user touch/click/keypress if browser initially gated cold-load audio
  useEffect(() => {
    if (typeof window === "undefined") return
    const handleFirstActivation = () => {
      ;(window as any).__connectlnAudioUnlocked = true
      if (
        !(window as any).__connectlnCallSilenceActive &&
        !isStoppedByOther &&
        !userManuallyMutedRef.current &&
        !shouldMuteForTranslation() &&
        ytPlayerStateRef.current === 1
      ) {
        unmuteBlockedByBrowserRef.current = false
        hasUnmutedOnceRef.current = true
        lastUnmuteSentAtRef.current = Date.now()
        sendPlayerCommand("unMute")
        sendPlayerCommand("setVolume", [100])
        setIsMuted(false)
      }
    }
    window.addEventListener("touchstart", handleFirstActivation, { passive: true })
    window.addEventListener("click", handleFirstActivation, { passive: true })
    window.addEventListener("keydown", handleFirstActivation, { passive: true })
    return () => {
      window.removeEventListener("touchstart", handleFirstActivation)
      window.removeEventListener("click", handleFirstActivation)
      window.removeEventListener("keydown", handleFirstActivation)
    }
  }, [isStoppedByOther, sendPlayerCommand, shouldMuteForTranslation])

  // Fallback timer so scrubber progresses smoothly and loops when reaching duration
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setCurrentTime((prev) => (prev + 0.5 >= duration ? 0 : prev + 0.5))
    }, 500)
    return () => clearInterval(timer)
  }, [isPlaying, duration, sendPlayerCommand])

  const triggerControlsVisibility = () => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 1400)
  }

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    unmuteBlockedByBrowserRef.current = false
    if (isPlaying && !isStoppedByOther) {
      userPausedManuallyRef.current = true
      sendPlayerCommand("pauseVideo")
      setIsPlaying(false)
      setShowControls(true)
    } else {
      userPausedManuallyRef.current = false
      notifyExclusiveVideoPlay(effectivePlayerId)
      setIsStoppedByOther(false)
      userManuallyMutedRef.current = false
      if (!shouldMuteForTranslation()) {
        hasUnmutedOnceRef.current = true
        lastUnmuteSentAtRef.current = Date.now()
        sendPlayerCommand("unMute")
        sendPlayerCommand("setVolume", [100])
        setIsMuted(false)
      } else {
        sendPlayerCommand("setVolume", [0])
        sendPlayerCommand("mute")
      }
      sendPlayerCommand("playVideo")
      setIsPlaying(true)
      triggerControlsVisibility()
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    unmuteBlockedByBrowserRef.current = false
    if (isMuted) {
      userManuallyMutedRef.current = false
      const muteForTrans = shouldMuteForTranslation()
      if (!muteForTrans) {
        hasUnmutedOnceRef.current = true
        lastUnmuteSentAtRef.current = Date.now()
        sendPlayerCommand("unMute")
      }
      const targetVol = muteForTrans ? 0 : 100
      sendPlayerCommand("setVolume", [targetVol])
      setTimeout(() => sendPlayerCommand("setVolume", [targetVol]), 80)
      sendPlayerCommand("playVideo")
      setIsMuted(false)
    } else {
      userManuallyMutedRef.current = true
      sendPlayerCommand("mute")
      setIsMuted(true)
    }
  }

  // Ensure sound is unmuted on user interaction when Noctis is not speaking and video has already started
  useEffect(() => {
    const unlockAudio = () => {
      if (isStoppedByOther || ytPlayerStateRef.current === -1) return
      if (shouldMuteForTranslation()) {
        applyVoiceDuckingToPlayer(true)
      } else if (!userManuallyMutedRef.current && unmuteBlockedByBrowserRef.current) {
        unmuteBlockedByBrowserRef.current = false
        hasUnmutedOnceRef.current = true
        lastUnmuteSentAtRef.current = Date.now()
        sendPlayerCommand("unMute")
        sendPlayerCommand("setVolume", [100])
        setIsMuted(false)
      }
      if (!userPausedManuallyRef.current && ytPlayerStateRef.current === 2) {
        sendPlayerCommand("playVideo")
      }
    }
    window.addEventListener("pointerdown", unlockAudio, { passive: true })
    window.addEventListener("touchstart", unlockAudio, { passive: true })
    return () => {
      window.removeEventListener("pointerdown", unlockAudio)
      window.removeEventListener("touchstart", unlockAudio)
    }
  }, [isStoppedByOther, sendPlayerCommand, applyVoiceDuckingToPlayer, shouldMuteForTranslation])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    userPausedManuallyRef.current = false
    setCurrentTime(newTime)
    sendPlayerCommand("seekTo", [newTime, true])
    sendPlayerCommand("playVideo")
  }

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation()
    userPausedManuallyRef.current = false
    unmuteBlockedByBrowserRef.current = false
    notifyExclusiveVideoPlay(effectivePlayerId)
    setIsStoppedByOther(false)
    setCurrentTime(0)
    sendPlayerCommand("seekTo", [0, true])
    sendPlayerCommand("playVideo")
    setIsPlaying(true)
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
      className={`flex flex-col w-full bg-black overflow-hidden ${className}`}
    >
      {/* 100% Unclouded 16:9 Video Canvas (Controls auto-hide while playing and appear only on hover/pause) */}
      <div
        onMouseMove={triggerControlsVisibility}
        onClick={togglePlay}
        className="relative flex-1 min-h-[200px] aspect-video w-full overflow-hidden bg-black select-none group cursor-pointer"
      >
        {/* Cropped Video Surface — hides native top title & bottom watermark; unmounts iframe if stopped by another video */}
        <div className="absolute inset-x-0 -top-[62px] -bottom-[62px] pointer-events-none">
          {isStoppedByOther ? (
            <img
              src={posterImageUrl || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
              alt={title}
              className="h-full w-full object-cover opacity-75"
            />
          ) : (
            <iframe
              ref={iframeRef}
              key={youtubeId}
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&mute=${initialMuted || shouldMuteForTranslation() ? 1 : hasSessionAudioActivation() ? 0 : 1}&loop=1&playlist=${youtubeId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=${initialLangRef.current !== normalizedSourceLang ? 1 : 0}&cc_lang_pref=${initialLangRef.current}&hl=${initialLangRef.current}&disablekb=1&fs=0&playsinline=1&enablejsapi=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onLoad={() => {
                const win = iframeRef.current?.contentWindow
                if (win) {
                  win.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*")
                }
              }}
              className="h-full w-full border-0 pointer-events-none"
            />
          )}
        </div>

        {/* Instant Thumbnail Preview Overlay while YouTube stream initializes (Prevents initial black screen!) */}
        {!hasVideoStarted && !isStoppedByOther && (
          <img
            src={posterImageUrl || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt={title}
            className="absolute inset-0 z-[5] h-full w-full object-cover pointer-events-none transition-opacity duration-200"
          />
        )}

        {/* Floating Unmute Pill when Auto-Playing Muted on Scroll */}
        {isPlaying && isMuted && !isStoppedByOther && language === normalizedSourceLang && !isVoiceDuckingRef.current && (
          <button
            type="button"
            onClick={toggleMute}
            style={{ color: "#FFFFFF" }}
            className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-black/75 hover:bg-black/90 border border-white/20 px-3 py-1 text-[11px] font-semibold shadow-md backdrop-blur-xs transition-all cursor-pointer"
          >
            <VolumeX className="h-3.5 w-3.5 text-white" />
            <span style={{ color: "#FFFFFF" }}>Tap for sound</span>
          </button>
        )}

        {/* WSJ-Style Editorial Lower-Third Headline & Monogram (Shown before playback starts or when paused; completely clear during active video!) */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-4 sm:px-5 pt-12 pb-4 flex items-end justify-between gap-4 pointer-events-none transition-opacity duration-300 ${
            !isPlaying || !hasVideoStarted ? "opacity-100" : "opacity-0"
          }`}
        >
          <h3
            style={{
              fontFamily: "Georgia, 'Times New Roman', Times, serif",
              color: "#FFFFFF",
            }}
            className="text-lg sm:text-2xl font-bold leading-[1.15] tracking-tight line-clamp-2 max-w-[84%] drop-shadow-md"
          >
            {title}
          </h3>
          <span
            style={{
              fontFamily: "Georgia, 'Times New Roman', Times, serif",
              color: "rgba(255,255,255,0.92)",
            }}
            className="text-sm sm:text-base font-bold tracking-tight shrink-0 select-none"
          >
            CLN
          </span>
        </div>

        {/* Center Play / Pause Indicator (Only visible when paused or hovered) */}
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
            !isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-80"
          }`}
        >
          <div style={{ color: "#FFFFFF" }} className="h-12 w-12 rounded-full bg-black/60 border border-white/25 flex items-center justify-center shadow-xl backdrop-blur-xs">
            {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
          </div>
        </div>

        {/* Bottom Scrubber Control Bar (Auto-hides while playing; appears only on hover) */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ color: "#FFFFFF" }}
          className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3.5 pt-4 pb-2 space-y-1 transition-opacity duration-300 ${
            showControls && isPlaying && hasVideoStarted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {/* Interactive Timeline Scrubber */}
          <div className="relative flex items-center w-full">
            <div className="w-full h-1 rounded-full bg-white/30 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-white rounded-full transition-all duration-150"
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

          {/* Minimal Playback Controls */}
          <div style={{ color: "#FFFFFF" }} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                style={{ color: "#FFFFFF" }}
                className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                style={{ color: "#FFFFFF" }}
                className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
                title="Restart video"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={toggleMute}
                style={{ color: "#FFFFFF" }}
                className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-amber-300" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <span style={{ color: "#F4F4F5" }} className="text-[11px] font-mono">
                {formatTime(currentTime)} <span style={{ color: "#A1A1AA" }}>/ {formatTime(duration)}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              style={{ color: "#FFFFFF" }}
              className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              title="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* DOCKED NOCTIS LIVE VIDEO LANGUAGE INTERPRETER & VOICE DUBBING BAR (Sits cleanly below the video canvas!) */}
      {!isStoppedByOther && (
        <NoctisVideoInterpreterPopup
          dockedBelow={true}
          youtubeId={youtubeId}
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
            userPausedManuallyRef.current = false
            notifyExclusiveVideoPlay(effectivePlayerId)
            setIsStoppedByOther(false)
            if (shouldMuteForTranslation()) {
              sendPlayerCommand("setVolume", [0])
              sendPlayerCommand("mute")
            }
            sendPlayerCommand("playVideo")
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
