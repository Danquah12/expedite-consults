"use client"

import React, { useState } from "react"
import { Play, ShieldCheck, ExternalLink, Sparkles, Volume2 } from "lucide-react"

export interface VideoShareBannerProps {
  /** Sharer's profile picture (circular on the left with blue border) */
  avatarUrl: string
  /** Sharer's name */
  authorName: string
  /** Sharer's headline or title */
  authorHeadline?: string
  /** Brand / Channel / Platform Name (e.g., "DSTRIKE", "CONNECTIN", or speaker/company) */
  brandName?: string
  /** Video title */
  videoTitle: string
  /** Video subtitle or category */
  videoSubtitle?: string
  /** YouTube ID if playable via YouTube iframe */
  youtubeId?: string
  /** Direct video URL or thumbnail URL */
  thumbnailUrl?: string
  /** Video URL to open or play */
  videoUrl?: string
  /** Duration badge e.g. "5:20" */
  duration?: string
  /** Serial plate or badge e.g. "CLN-TRD01" */
  serialPlate?: string
  /** Key takeaways or metrics for the right-hand bars */
  takeaways?: string[]
  /** Optional click callback if parent handles modal playback */
  onPlayClick?: () => void
  /** Compact variant for smaller cards/modals */
  compact?: boolean
}

export function VideoShareBanner({
  avatarUrl,
  authorName,
  authorHeadline,
  brandName,
  videoTitle,
  videoSubtitle,
  youtubeId,
  thumbnailUrl,
  videoUrl,
  duration = "5:00",
  serialPlate,
  takeaways = [],
  onPlayClick,
  compact = false
}: VideoShareBannerProps) {
  const [isPlayingInline, setIsPlayingInline] = useState(false)

  // Determine the brand wordmark to display at the top right
  const resolvedBrand = (brandName || "DSTRIKE").toUpperCase()
  const isDstrike = resolvedBrand.includes("DSTRIKE")

  const handlePlayTrigger = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPlayClick) {
      onPlayClick()
      return
    }
    if (youtubeId || (videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") || videoUrl.endsWith(".mp4")))) {
      setIsPlayingInline(true)
    } else if (videoUrl) {
      window.open(videoUrl, "_blank", "noopener,noreferrer")
    }
  }

  // Extract 11-char YouTube ID if videoUrl is a YouTube link
  const resolvedYtId = youtubeId || (() => {
    if (!videoUrl) return null
    const trimmed = videoUrl.trim()
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
    const m = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/)
    return m ? m[1] : null
  })()

  const resolvedThumb =
    thumbnailUrl ||
    (resolvedYtId ? `https://i.ytimg.com/vi/${resolvedYtId}/hqdefault.jpg` : null)

  const barItems = takeaways.length >= 5
    ? takeaways.slice(0, 5)
    : [
        takeaways[0] || videoTitle || "Live Telemetry & Field Masterclass",
        takeaways[1] || videoSubtitle || `Shared by ${authorName}`,
        takeaways[2] || "Real-Time Performance & Analytics Stream",
        takeaways[3] || "Verified Professional Briefing & Standards",
        takeaways[4] || "Interactive ConnectIn Video Enclave"
      ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white text-zinc-900 shadow-md transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-white">
      {/* Main Signature Card Layout: Left Circular Blue-Ringed Profile Picture + Right Brand & Dual Telemetry/Video Panels */}
      <div className={`${compact ? "p-3.5 sm:p-4" : "p-4 sm:p-6"} flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white text-zinc-900`}>
        {/* LEFT: Large Circular Profile Picture with Signature Electric Blue Ring */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`relative rounded-full p-1 bg-gradient-to-tr from-[#0066FF] via-[#0A66C2] to-[#38BDF8] shadow-lg ${
              compact ? "h-24 w-24 sm:h-28 sm:w-28" : "h-32 w-32 sm:h-40 sm:w-40"
            }`}
          >
            <div className="h-full w-full rounded-full overflow-hidden bg-zinc-100 border-2 border-white">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName || "User")}&backgroundColor=0a66c2`}
                alt={authorName}
                className="h-full w-full object-cover object-center"
              />
            </div>
            {/* Live Verified Badge on Avatar */}
            <span
              className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0066FF] text-white ring-2 ring-white shadow-sm"
              title={`Shared by ${authorName}`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="mt-2 text-center max-w-[160px]">
            <p className="text-xs font-extrabold text-zinc-900 truncate">{authorName}</p>
            {authorHeadline && (
              <p className="text-[10px] font-medium text-zinc-500 truncate">{authorHeadline}</p>
            )}
          </div>
        </div>

        {/* RIGHT: Top Brand Logo Header + Bottom 2-Column Dark Telemetry / Video Panels */}
        <div className="flex-1 w-full min-w-0 space-y-3.5">
          {/* Top Brand Header Row (Matches DSTRIKE Logo + Bolt Aesthetic + Video Title) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
            <div className="flex items-center gap-3">
              {/* Signature "D" Monogram with Blue Lightning Cutout */}
              <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[#0F141C] text-white font-black text-2xl shadow-sm overflow-hidden">
                <span className="tracking-tighter pr-1">D</span>
                {/* Blue Lightning Bolt Slash */}
                <svg
                  viewBox="0 0 24 24"
                  className="absolute -bottom-1 -right-0.5 h-7 w-7 text-[#0066FF] fill-current drop-shadow"
                >
                  <path d="M13 2L4 14h6l-2 8 10-12h-6l1-8z" />
                </svg>
              </div>

              {/* Bold Wordmark with Blue Accent */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isDstrike ? (
                    <span className="text-xl sm:text-2xl font-black tracking-wider text-[#0F141C] leading-none">
                      DSTRI<span className="text-[#0066FF]">K</span>E
                    </span>
                  ) : (
                    <span className="text-lg sm:text-xl font-black tracking-wider text-[#0F141C] leading-none uppercase">
                      {resolvedBrand.slice(0, -2)}
                      <span className="text-[#0066FF]">{resolvedBrand.slice(-2, -1)}</span>
                      {resolvedBrand.slice(-1)}
                    </span>
                  )}

                  {serialPlate && (
                    <span className="rounded bg-[#0F141C] px-2 py-0.5 font-mono text-[10px] font-bold text-[#38BDF8] border border-[#0066FF]/40">
                      {serialPlate}
                    </span>
                  )}
                  {duration && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-[#0066FF] border border-blue-200">
                      ⏱ {duration}
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-800 truncate mt-1">
                  {videoTitle}
                </h4>
              </div>
            </div>

            {/* Watch / Play CTA Pill */}
            <button
              type="button"
              onClick={handlePlayTrigger}
              className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isPlayingInline ? "Playing Live" : "Watch Video"}</span>
            </button>
          </div>

          {/* Inline Video Player (When User Clicks Play and No External Modal Handler Overrides) */}
          {isPlayingInline && (resolvedYtId || videoUrl) ? (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#0B0F17] border-2 border-[#0066FF] shadow-inner">
              {resolvedYtId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${resolvedYtId}?autoplay=1&rel=0&modestbranding=1`}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="h-full w-full object-contain bg-black"
                />
              )}
              <button
                type="button"
                onClick={() => setIsPlayingInline(false)}
                className="absolute top-2 right-2 rounded-full bg-black/80 hover:bg-black text-white px-2.5 py-1 text-[10px] font-bold border border-white/20 cursor-pointer"
              >
                ✕ Close Player
              </button>
            </div>
          ) : (
            /* TWO DARK PANELS SIDE BY SIDE (Matches Attached Image: Left Blue Line Chart + Video Preview, Right Alternating Blue/Amber Progress Bars) */
            <div
              onClick={handlePlayTrigger}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 cursor-pointer group"
            >
              {/* PANEL 1 (LEFT): Dark Navy Telemetry Box with Top Blue Accent Bar, Glowing Blue Line Graph & Video Thumbnail Overlay */}
              <div className="relative h-36 sm:h-40 rounded-none sm:rounded-xs bg-[#0B0F17] border-t-[3px] border-t-[#0066FF] overflow-hidden flex flex-col justify-between p-3 shadow-inner">
                {/* Subtle Background Video Thumbnail (if available) */}
                {resolvedThumb && (
                  <img
                    src={resolvedThumb}
                    alt={videoTitle}
                    className="absolute inset-0 h-full w-full object-cover opacity-25 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/75 to-[#0B0F17]/60" />

                {/* Top Label inside Left Dark Box */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-sky-300/90">
                  <span className="flex items-center gap-1 font-bold">
                    <span className="h-2 w-2 rounded-full bg-[#0066FF] animate-pulse" />
                    VIDEO TELEMETRY
                  </span>
                  <span className="bg-[#0066FF]/20 text-[#38BDF8] px-1.5 py-0.5 rounded text-[9px] font-bold border border-[#0066FF]/40">
                    ▶ PLAY
                  </span>
                </div>

                {/* Exact Glowing Blue Line Chart with White Circular Nodes from Attached Screenshot */}
                <div className="relative z-10 my-auto pt-1">
                  <svg viewBox="0 0 240 100" className="w-full h-24 overflow-visible">
                    <defs>
                      <linearGradient id="dstrikeBlueArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0066FF" stopOpacity="0.48" />
                        <stop offset="100%" stopColor="#0066FF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Subtle Horizontal Grid Lines */}
                    <line x1="10" y1="25" x2="230" y2="25" stroke="#1E293B" strokeWidth="1" />
                    <line x1="10" y1="52" x2="230" y2="52" stroke="#1E293B" strokeWidth="1" />
                    <line x1="10" y1="80" x2="230" y2="80" stroke="#1E293B" strokeWidth="1" />

                    {/* Area Under Curve */}
                    <path
                      d="M 20 75 L 55 88 L 92 55 L 128 16 L 164 34 L 198 88 L 226 55 L 226 92 L 20 92 Z"
                      fill="url(#dstrikeBlueArea)"
                    />

                    {/* Glowing Electric Blue Polyline */}
                    <polyline
                      fill="none"
                      stroke="#0077FF"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="20,75 55,88 92,55 128,16 164,34 198,88 226,55"
                    />

                    {/* White-Centered Circular Data Nodes */}
                    {[
                      [20, 75],
                      [55, 88],
                      [92, 55],
                      [128, 16],
                      [164, 34],
                      [198, 88],
                      [226, 55]
                    ].map(([cx, cy], idx) => (
                      <circle
                        key={idx}
                        cx={cx}
                        cy={cy}
                        r="4"
                        fill="#0B0F17"
                        stroke="#FFFFFF"
                        strokeWidth="2.2"
                      />
                    ))}
                  </svg>
                </div>

                {/* Centered Play Overlay Button on Hover */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                  <div className="h-11 w-11 rounded-full bg-[#0066FF]/90 group-hover:bg-[#0066FF] text-white flex items-center justify-center shadow-xl ring-2 ring-white/80 group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* PANEL 2 (RIGHT): Dark Navy Metrics / Takeaways Box with Top Gold Accent Bar & 5 Alternating Blue/Amber Horizontal Bars */}
              <div className="relative h-36 sm:h-40 rounded-none sm:rounded-xs bg-[#0B0F17] border-t-[3px] border-t-[#EAB308] p-3.5 flex flex-col justify-between shadow-inner">
                {[0, 1, 2, 3, 4].map((rowIdx) => {
                  const isBlue = rowIdx % 2 === 0
                  const labelText = barItems[rowIdx] || ""
                  return (
                    <div key={rowIdx} className="space-y-0.5">
                      <div className="flex items-center w-full h-3.5 bg-[#1E2530] rounded-[2px] overflow-hidden">
                        {/* Left Colored Block (Alternating Blue #0066FF and Gold #EAB308 exactly like screenshot) */}
                        <div
                          className={`h-full w-6 shrink-0 ${
                            isBlue ? "bg-[#0066FF]" : "bg-[#E5B84B]"
                          }`}
                        />
                        {/* Subtle Text Overlay Inside Track */}
                        <span className="px-2 text-[9px] font-mono text-zinc-300 truncate">
                          {labelText}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Dark Green / Slate Status Strip */}
      <div className="bg-[#0B3B24] px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-emerald-200">
        <span className="truncate">
          ✓ Verified ConnectIn Video Share · Profile Identity Linked ({authorName})
        </span>
        <span className="shrink-0 font-bold text-emerald-300">
          connectln.app
        </span>
      </div>
    </div>
  )
}
