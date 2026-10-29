"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw } from "lucide-react"

interface ConnectLnStudioPlayerProps {
  youtubeId: string
  title: string
  serialPlate?: string
  speaker?: string
  durationLabel?: string
  autoPlay?: boolean
  className?: string
}

export function ConnectLnStudioPlayer({
  youtubeId,
  title,
  serialPlate = "CLN-STUDIO",
  speaker = "ConnectLn Masterclass",
  durationLabel = "3:00",
  autoPlay = true,
  className = "h-[230px] sm:h-[280px] w-full"
}: ConnectLnStudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(() => {
    const parts = durationLabel.split(":").map(Number)
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1]
    }
    return 120
  })
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [showControls, setShowControls] = useState<boolean>(true)
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

  // Subscribe to YouTube iframe state/time events via postMessage
  useEffect(() => {
    setIsPlaying(autoPlay)
    setCurrentTime(0)

    const handleMessage = (e: MessageEvent) => {
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
            // 1 = playing, 2 = paused, 0 = ended (auto-replay continuously until user clicks Next Talk)
            if (data.info.playerState === 1) {
              setIsPlaying(true)
            } else if (data.info.playerState === 0) {
              setCurrentTime(0)
              setIsPlaying(true)
              const win = iframeRef.current?.contentWindow
              if (win) {
                win.postMessage(JSON.stringify({ event: "command", func: "seekTo", args: [0, true] }), "*")
                win.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), "*")
              }
            } else if (data.info.playerState === 2) {
              setIsPlaying(false)
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
        win.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*")
      }
    }, 1000)

    return () => {
      window.removeEventListener("message", handleMessage)
      clearInterval(interval)
    }
  }, [youtubeId, autoPlay])

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
    }, 2800)
  }

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (isPlaying) {
      sendPlayerCommand("pauseVideo")
      setIsPlaying(false)
      setShowControls(true)
    } else {
      sendPlayerCommand("playVideo")
      setIsPlaying(true)
      triggerControlsVisibility()
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMuted) {
      sendPlayerCommand("unMute")
      setIsMuted(false)
    } else {
      sendPlayerCommand("mute")
      setIsMuted(true)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    sendPlayerCommand("seekTo", [newTime, true])
  }

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation()
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
      onMouseMove={triggerControlsVisibility}
      onClick={togglePlay}
      className={`relative overflow-hidden bg-black select-none group cursor-pointer ${className}`}
    >
      {/* Cropped Video Surface — hides native top title & bottom watermark */}
      <div className="absolute inset-x-0 -top-[62px] -bottom-[62px] pointer-events-none">
        <iframe
          ref={iframeRef}
          key={youtubeId}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&loop=1&playlist=${youtubeId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&enablejsapi=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="h-full w-full border-0 pointer-events-none"
        />
      </div>

      {/* Top ConnectLn Studio Header Overlay */}
      <div
        className={`absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/85 via-black/45 to-transparent px-4 py-2.5 flex items-center justify-between gap-3 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Official ConnectLn Squircle Badge */}
          <div className="h-7 w-7 rounded-lg bg-[#171513] border border-white/15 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-black text-xs tracking-tighter">C</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate drop-shadow-xs">{title}</p>
            <p className="text-[10px] text-zinc-300 truncate">{speaker} · {serialPlate}</p>
          </div>
        </div>

        <span className="rounded-md bg-black/60 border border-white/15 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 shrink-0">
          {serialPlate}
        </span>
      </div>

      {/* Center Play / Pause Indicator */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
          !isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-90"
        }`}
      >
        <div className="h-14 w-14 rounded-full bg-black/70 border border-white/25 text-white flex items-center justify-center shadow-2xl backdrop-blur-xs">
          {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white ml-0.5" />}
        </div>
      </div>

      {/* Bottom ConnectLn Studio Control Bar (Replaces YouTube Bar & Logo) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-4 pt-5 pb-2.5 space-y-1.5 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {/* Interactive Timeline Scrubber */}
        <div className="relative flex items-center w-full">
          <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-[#A64532] rounded-full transition-all duration-150"
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
          <div className="flex items-center gap-2.5">
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
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <span className="text-[11px] font-mono font-semibold text-zinc-200">
              {formatTime(currentTime)} <span className="text-zinc-400">/ {formatTime(duration)}</span>
            </span>
          </div>

          {/* Right side: ConnectLn Studio Brand Pill + Fullscreen (Where YouTube watermark used to be) */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-md bg-[#171513]/90 border border-white/15 px-2.5 py-1 shadow-xs">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-[#A64532] text-[10px] font-black text-white">
                C
              </span>
              <span className="text-[11px] font-extrabold tracking-tight text-white">
                ConnectLn
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
