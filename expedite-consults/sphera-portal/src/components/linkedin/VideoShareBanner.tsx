"use client"

import React, { useState } from "react"
import { Play, ShieldCheck, Share2, Copy, Check, Mail } from "lucide-react"
import { resolveUserProfilePicture, isDefaultPlaceholderAvatar } from "@/lib/connectin-storage"

export interface VideoShareBannerProps {
  /** Sharer's profile picture (circular on the left inside the ConnectLn Logo Card) */
  avatarUrl?: string
  userAvatar?: string
  /** Sharer's name */
  authorName?: string
  userName?: string
  /** Sharer's headline or title */
  authorHeadline?: string
  userHeadline?: string
  /** Brand / Platform Name (defaults to ConnectLn) */
  brandName?: string
  /** Video or shared item title */
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
  /** Key takeaways or metrics */
  takeaways?: string[]
  /** Optional click callback if parent handles modal playback */
  onPlayClick?: () => void
  onWatchClick?: () => void
  /** Compact variant for smaller cards/modals */
  compact?: boolean
  /** Hide the bottom share bar when embedded in a modal that already has a share bar */
  hideShareBar?: boolean
}

export function VideoShareBanner({
  avatarUrl,
  userAvatar,
  authorName,
  userName,
  authorHeadline,
  userHeadline,
  videoTitle,
  videoSubtitle,
  youtubeId,
  thumbnailUrl,
  videoUrl,
  duration = "5:00",
  serialPlate,
  takeaways = [],
  onPlayClick,
  onWatchClick,
  compact = false,
  hideShareBar = false
}: VideoShareBannerProps) {
  const [isPlayingInline, setIsPlayingInline] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const candidateAvatar = avatarUrl || userAvatar
  const resolvedAvatar =
    candidateAvatar && !isDefaultPlaceholderAvatar(candidateAvatar)
      ? candidateAvatar
      : resolveUserProfilePicture(null, candidateAvatar)
  const resolvedAuthor = authorName || userName || "Kwesi Asiedu"
  const resolvedHeadline = authorHeadline || userHeadline
  const resolvedPlayHandler = onPlayClick || onWatchClick

  const handlePlayTrigger = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (resolvedPlayHandler) {
      resolvedPlayHandler()
      return
    }
    if (
      youtubeId ||
      (videoUrl &&
        (videoUrl.includes("youtube.com") ||
          videoUrl.includes("youtu.be") ||
          videoUrl.endsWith(".mp4")))
    ) {
      setIsPlayingInline(true)
    } else if (videoUrl) {
      window.open(videoUrl, "_blank", "noopener,noreferrer")
    }
  }

  // Extract 11-char YouTube ID if videoUrl is a YouTube link
  const resolvedYtId =
    youtubeId ||
    (() => {
      if (!videoUrl) return null
      const trimmed = videoUrl.trim()
      if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
      const m = trimmed.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
      )
      return m ? m[1] : null
    })()

  // ConnectLn OpenGraph URL so WhatsApp, LinkedIn, X, Facebook, and messages render the ConnectLn Logo + Profile Picture Card
  const resolvedShareUrl = `https://www.connectln.app/connectin?video=${encodeURIComponent(
    resolvedYtId || ""
  )}&plate=${encodeURIComponent(serialPlate || "CLN-VID")}&v=connectln8`

  const resolvedThumb =
    thumbnailUrl ||
    (resolvedYtId ? `https://i.ytimg.com/vi/${resolvedYtId}/hqdefault.jpg` : null)

  const shareText = `🎥 ${videoTitle}${
    serialPlate ? ` (${serialPlate})` : ""
  } — Shared by ${resolvedAuthor} on ConnectLn:\n${resolvedShareUrl}`

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const handleLinkedInShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        resolvedShareUrl
      )}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `🎥 ${videoTitle} — Shared by ${resolvedAuthor} on ConnectLn`
      )}&url=${encodeURIComponent(resolvedShareUrl)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const handleFacebookShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        resolvedShareUrl
      )}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const handleEmailShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `mailto:?subject=${encodeURIComponent(
      `ConnectLn Share: ${videoTitle}`
    )}&body=${encodeURIComponent(shareText)}`
  }

  const handleCopyShareLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(resolvedShareUrl).catch(() => {})
    }
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-zinc-800 shadow-lg transition-all hover:shadow-xl"
      style={{ backgroundColor: "#171513", color: "#F5F0EB" }}
    >
      {/* OFFICIAL CONNECTLN LOGO CARD WITH USER PROFILE PICTURE INSERTED INSIDE */}
      <div
        onClick={handlePlayTrigger}
        className={`${
          compact ? "p-3.5 sm:p-4" : "p-4 sm:p-6"
        } flex flex-col sm:flex-row items-center gap-4 sm:gap-6 cursor-pointer group w-full`}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #221F1D 0%, #171513 100%)"
        }}
      >
        {/* LEFT: Circular Profile Picture Inserted Inside ConnectLn Logo Card (Full Name & Headline Always Visible) */}
        <div className="flex flex-col items-center shrink-0 sm:w-44">
          <div
            className={`relative rounded-full p-1 bg-gradient-to-tr from-[#0066FF] via-[#38BDF8] to-[#0A66C2] shadow-xl ${
              compact
                ? "h-20 w-20 sm:h-24 sm:w-24"
                : "h-28 w-28 sm:h-32 sm:w-32"
            }`}
          >
            <div
              className="h-full w-full rounded-full overflow-hidden border-2"
              style={{ borderColor: "#171513", backgroundColor: "#221F1D" }}
            >
              <img
                src={resolvedAvatar}
                alt={resolvedAuthor}
                onError={(e) => {
                  e.currentTarget.src = "/brand/kwesi-avatar.png"
                }}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <span
              className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0066FF] text-white ring-2 ring-[#171513] shadow-sm"
              title={`Shared by ${resolvedAuthor}`}
            >
              <ShieldCheck className="h-3 w-3" />
            </span>
          </div>

          <div className="mt-2 text-center w-full px-1">
            <p
              className="text-xs sm:text-sm font-extrabold leading-snug break-words"
              style={{ color: "#F5F0EB" }}
            >
              {resolvedAuthor}
            </p>
            {resolvedHeadline && (
              <p
                className="text-[10px] font-medium leading-snug break-words mt-0.5"
                style={{ color: "#9E9891" }}
              >
                {resolvedHeadline}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: Official ConnectLn Emblem ("C" Squircle) + ConnectLn Wordmark + Terracotta Underline + Full Video Details */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0 flex-1 w-full">
          <div className="flex items-center gap-3">
            {/* Official ConnectLn "C" Squircle Icon */}
            <img
              src="/brand/connectln-icon-256.png"
              alt="ConnectLn Emblem"
              className={`${
                compact ? "h-12 w-12 sm:h-14 sm:w-14" : "h-14 w-14 sm:h-16 sm:w-16"
              } rounded-2xl object-contain shadow-md shrink-0`}
            />

            <div className="text-left">
              {/* Official ConnectLn Wordmark with Terracotta Underline */}
              <div className="inline-flex flex-col items-start">
                <span
                  className={`${
                    compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
                  } font-black tracking-tight leading-none`}
                  style={{ color: "#F5F0EB" }}
                >
                  ConnectLn
                </span>
                <span
                  className="mt-1 h-1.5 w-[78%] rounded-full"
                  style={{ backgroundColor: "#A64532" }}
                />
              </div>

              <p
                className="mt-1 text-xs font-medium"
                style={{ color: "#9E9891" }}
              >
                Tickets, vouches, and real work
              </p>
            </div>
          </div>

          {/* Shared Video / Content Title & Play Bar Inside ConnectLn Card — Never Clipped or Truncated */}
          <div
            className="mt-3 w-full rounded-xl p-2.5 sm:p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.12)"
            }}
          >
            <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
              {resolvedThumb && (
                <div className="relative h-11 w-16 sm:h-12 sm:w-20 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-black">
                  <img
                    src={resolvedThumb}
                    alt={videoTitle}
                    className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-3.5 w-3.5 text-white fill-current" />
                  </div>
                </div>
              )}

              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {serialPlate && (
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
                      style={{
                        backgroundColor: "#A64532",
                        color: "#F5F0EB"
                      }}
                    >
                      {serialPlate}
                    </span>
                  )}
                  {duration && (
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.08)",
                        color: "#D6D1C7"
                      }}
                    >
                      ⏱ {duration}
                    </span>
                  )}
                </div>
                <h4
                  className="text-xs sm:text-sm font-bold leading-snug break-words"
                  style={{ color: "#F5F0EB" }}
                >
                  {videoTitle}
                </h4>
                {(videoSubtitle || takeaways[0]) && (
                  <p
                    className="text-[11px] leading-snug break-words mt-0.5"
                    style={{ color: "#9E9891" }}
                  >
                    {videoSubtitle || takeaways[0]}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlayTrigger}
              style={{ backgroundColor: "#A64532", color: "#FFFFFF" }}
              className="self-end sm:self-center shrink-0 inline-flex items-center gap-1.5 rounded-full hover:opacity-95 px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isPlayingInline ? "Playing" : "Watch"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inline Video Player (When User Clicks Play and No External Modal Handler Overrides) */}
      {isPlayingInline && (resolvedYtId || videoUrl) && (
        <div className="px-4 pb-3">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/15 shadow-inner">
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
              style={{ backgroundColor: "rgba(0,0,0,0.85)", color: "#FFFFFF" }}
              className="absolute top-2 right-2 rounded-full px-2.5 py-1 text-[10px] font-bold border border-white/20 cursor-pointer"
            >
              ✕ Close Player
            </button>
          </div>
        </div>
      )}

      {/* Multi-Platform Direct Sharing Bar (WhatsApp, LinkedIn, X, Facebook, Email, Copy Link) */}
      {!hideShareBar && (
        <div
          className="px-3.5 py-2 border-t flex flex-wrap items-center justify-between gap-2"
          style={{
            backgroundColor: "#1F1C1A",
            borderColor: "rgba(255,255,255,0.1)"
          }}
        >
          <span
            className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
            style={{ color: "#D6D1C7" }}
          >
            <Share2 className="h-3 w-3" style={{ color: "#A64532" }} />
            <span>Share ConnectLn Card:</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              style={{ backgroundColor: "#25D366", color: "#FFFFFF" }}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
              title="Share on WhatsApp"
            >
              <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
              </svg>
              <span>WhatsApp</span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={handleLinkedInShare}
              style={{ backgroundColor: "#0A66C2", color: "#FFFFFF" }}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
              title="Share on LinkedIn"
            >
              <span>LinkedIn</span>
            </button>

            {/* X / Twitter */}
            <button
              type="button"
              onClick={handleTwitterShare}
              style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
              title="Share on X (Twitter)"
            >
              <span>X / Post</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleFacebookShare}
              style={{ backgroundColor: "#1877F2", color: "#FFFFFF" }}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
              title="Share on Facebook"
            >
              <span>Facebook</span>
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={handleEmailShare}
              style={{ backgroundColor: "#A64532", color: "#FFFFFF" }}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
              title="Share via Email"
            >
              <Mail className="h-2.5 w-2.5" />
              <span>Email</span>
            </button>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyShareLink}
              style={{ backgroundColor: "#2C2825", color: "#F5F0EB" }}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer border border-white/10"
              title="Copy Direct Share Link"
            >
              {copiedLink ? (
                <Check className="h-2.5 w-2.5 text-emerald-400" />
              ) : (
                <Copy className="h-2.5 w-2.5" />
              )}
              <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
