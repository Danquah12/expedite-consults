"use client"

import React, { useState, useRef, useEffect } from "react"
import { Play, ShieldCheck, Share2, Copy, Check, Mail, Send, VolumeX } from "lucide-react"
import { resolveUserProfilePicture, isDefaultPlaceholderAvatar, generatePersonalSignatureAvatar, isForeignPersonaAvatar } from "@/lib/connectin-storage"
import { buildSharePreviewUrl, useSharePic } from "@/lib/connectin-share"
import { ConnectLnStudioPlayer, CONNECTLN_VIDEO_PLAY_EVENT, notifyExclusiveVideoPlay } from "./ConnectLnStudioPlayer"
import { NoctisVideoInterpreterPopup } from "./NoctisVideoInterpreterPopup"
import {
  useAutoplayVideosPref,
  registerViewportVideoSlot,
  notifyManualVideoOverride,
} from "@/lib/connectln-settings"
import {
  loadMembers,
  sendSharedItemToConnectLnMember,
  DEFAULT_CONNECTLN_SHARE_MEMBERS,
  type ShareTarget,
} from "./MessageActionBar"

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
  /** Clean full-bleed WSJ editorial feed mode — hides duplicate author card, serial plates, and duplicate share bar */
  editorialFeedMode?: boolean
  /** Automatically play inline when scrolled into viewport on the Home Feed */
  autoPlayOnScroll?: boolean
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
  hideShareBar = false,
  editorialFeedMode = false,
  autoPlayOnScroll = true
}: VideoShareBannerProps) {
  const [isPlayingInline, setIsPlayingInline] = useState(false)
  // Autoplay is OFF unless the user turns it on in Settings -> Behavior
  const [autoplayPref] = useAutoplayVideosPref()
  const autoplayAllowed = autoPlayOnScroll && autoplayPref
  const autoplayAllowedRef = useRef(autoplayAllowed)
  autoplayAllowedRef.current = autoplayAllowed
  const [startedByScroll, setStartedByScroll] = useState(true)
  const [isDirectMuted, setIsDirectMuted] = useState(false)
  const directVideoRef = useRef<HTMLVideoElement>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showMemberPicker, setShowMemberPicker] = useState(false)
  const [memberQuery, setMemberQuery] = useState("")
  const [members, setMembers] = useState<ShareTarget[]>(DEFAULT_CONNECTLN_SHARE_MEMBERS)
  const [sentNote, setSentNote] = useState<string | null>(null)
  const bannerPlayerIdRef = useRef<string>(`cln-banner-${Math.random().toString(36).slice(2, 10)}`)
  const videoStageRef = useRef<HTMLDivElement>(null)
  const userManuallyStoppedRef = useRef<boolean>(false)

  useEffect(() => {
    if (showMemberPicker) {
      loadMembers().then(setMembers).catch(() => {})
    }
  }, [showMemberPicker])

  // Stop inline playback whenever any other video starts playing across ConnectLn
  useEffect(() => {
    const handleExclusivePlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ playerId?: string }>
      const activeId = customEvent.detail?.playerId
      if (activeId && activeId !== bannerPlayerIdRef.current) {
        setIsPlayingInline(false)
      }
    }
    window.addEventListener(CONNECTLN_VIDEO_PLAY_EVENT, handleExclusivePlay)
    return () => {
      window.removeEventListener(CONNECTLN_VIDEO_PLAY_EVENT, handleExclusivePlay)
    }
  }, [])

  const resolvedAuthor = authorName || userName || "ConnectIn Member"
  const candidateAvatar = avatarUrl || userAvatar
  const resolvedAvatar =
    candidateAvatar && !isDefaultPlaceholderAvatar(candidateAvatar) && !isForeignPersonaAvatar(candidateAvatar, { name: resolvedAuthor })
      ? candidateAvatar
      : resolveUserProfilePicture({ name: resolvedAuthor, avatar: candidateAvatar } as any)
  const resolvedHeadline = authorHeadline || userHeadline
  const sharePic = useSharePic(resolvedAvatar)
  const resolvedPlayHandler = onPlayClick || onWatchClick

  const handlePlayTrigger = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (resolvedPlayHandler) {
      resolvedPlayHandler()
      return
    }
    if (resolvedYtId || videoUrl) {
      if (isPlayingInline) {
        userManuallyStoppedRef.current = true
        notifyManualVideoOverride(null)
        setIsPlayingInline(false)
      } else {
        userManuallyStoppedRef.current = false
        setStartedByScroll(false)
        setIsDirectMuted(false)
        notifyManualVideoOverride(bannerPlayerIdRef.current, videoStageRef.current)
        notifyExclusiveVideoPlay(bannerPlayerIdRef.current)
        setIsPlayingInline(true)
      }
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

  // Auto-play inline AND unmute speaker when scrolled into viewport across all ConnectLn feeds
  useEffect(() => {
    if (!autoPlayOnScroll || resolvedPlayHandler) return
    const playable = Boolean(resolvedYtId || videoUrl)
    if (!playable) return

    return registerViewportVideoSlot({
      id: bannerPlayerIdRef.current,
      getElement: () => videoStageRef.current,
      startAutoplay: () => {
        if (!autoplayAllowedRef.current || userManuallyStoppedRef.current) return
        setStartedByScroll(true)
        setIsDirectMuted(false)
        setIsPlayingInline(true)
      },
      stopAutoplay: () => {
        userManuallyStoppedRef.current = false
        setIsPlayingInline(false)
      },
    })
  }, [autoPlayOnScroll, resolvedPlayHandler, resolvedYtId, videoUrl])

  // Ensure direct HTML5 <video> unmutes ONLY when Noctis translation is NOT active
  useEffect(() => {
    if (!isPlayingInline || resolvedYtId) return
    const vid = directVideoRef.current
    if (!vid) return

    const isNoctisTranslationMutingActive = (incomingLang?: string) => {
      if (typeof window === "undefined") return false
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
      let storedLang = ""
      try {
        storedLang = (localStorage.getItem("sphera-lang") || "").toLowerCase()
      } catch {}
      const effectiveLang = (
        incomingLang ||
        w.__noctisPreferredAudioLang ||
        document.documentElement.getAttribute("lang") ||
        storedLang ||
        "en"
      )
        .toString()
        .trim()
        .toLowerCase()
      return effectiveLang !== "en"
    }

    const syncDirectMuteState = (incomingLang?: string) => {
      if (!directVideoRef.current) return
      if (isNoctisTranslationMutingActive(incomingLang)) {
        directVideoRef.current.muted = true
        directVideoRef.current.volume = 0
        setIsDirectMuted(true)
      }
    }

    if (isNoctisTranslationMutingActive()) {
      vid.muted = true
      vid.volume = 0
      setIsDirectMuted(true)
      vid.play().catch(() => {})
    } else {
      vid.muted = false
      vid.volume = 1
      vid.play().catch(() => {
        vid.muted = true
        setIsDirectMuted(true)
        vid.play().catch(() => {})
      })
    }

    const unlockDirect = () => {
      if (!directVideoRef.current) return
      if (isNoctisTranslationMutingActive()) {
        directVideoRef.current.muted = true
        directVideoRef.current.volume = 0
        setIsDirectMuted(true)
        return
      }
      if (!directVideoRef.current.paused) {
        directVideoRef.current.muted = false
        directVideoRef.current.volume = 1
        setIsDirectMuted(false)
      }
    }

    const onDuckOrLangChange = (e: Event) => {
      const custom = e as CustomEvent<{ duck?: boolean; langCode?: string } | string>
      if (e.type === "connectln:noctis-voice-duck") {
        const duck = Boolean((custom.detail as any)?.duck)
        if (duck || isNoctisTranslationMutingActive()) {
          syncDirectMuteState()
        } else if (!isNoctisTranslationMutingActive() && directVideoRef.current && !directVideoRef.current.paused) {
          directVideoRef.current.muted = false
          directVideoRef.current.volume = 1
          setIsDirectMuted(false)
        }
      } else {
        const detail = custom.detail
        const incomingLang = typeof detail === "string" ? detail : detail?.langCode
        if ((incomingLang && incomingLang.toLowerCase() !== "en") || isNoctisTranslationMutingActive(incomingLang)) {
          syncDirectMuteState(incomingLang)
        }
      }
    }

    window.addEventListener("pointerdown", unlockDirect, { passive: true })
    window.addEventListener("keydown", unlockDirect, { passive: true })
    window.addEventListener("connectln:noctis-voice-duck", onDuckOrLangChange)
    window.addEventListener("sphera-lang-changed", onDuckOrLangChange)
    window.addEventListener("connectln:noctis-command-language", onDuckOrLangChange)
    return () => {
      window.removeEventListener("pointerdown", unlockDirect)
      window.removeEventListener("keydown", unlockDirect)
      window.removeEventListener("connectln:noctis-voice-duck", onDuckOrLangChange)
      window.removeEventListener("sphera-lang-changed", onDuckOrLangChange)
      window.removeEventListener("connectln:noctis-command-language", onDuckOrLangChange)
    }
  }, [isPlayingInline, resolvedYtId])

  // If the user switches autoplay off in Settings, stop any video that was started by scrolling
  useEffect(() => {
    if (!autoplayAllowed && startedByScroll) {
      setIsPlayingInline(false)
    }
  }, [autoplayAllowed, startedByScroll])

  // ConnectLn OpenGraph URL so WhatsApp, LinkedIn, X, Facebook, and messages render the ConnectLn Logo + Profile Picture Card
  const resolvedShareUrl = buildSharePreviewUrl({
    to: `/connectin?video=${encodeURIComponent(resolvedYtId || "")}&plate=${encodeURIComponent(serialPlate || "CLN-VID")}&vtitle=${encodeURIComponent((videoTitle || "").slice(0, 120))}`,
    title: videoTitle,
    sharerName: resolvedAuthor,
    pic: sharePic,
    subtitle: serialPlate || "",
  })

  const resolvedThumb =
    thumbnailUrl ||
    (resolvedYtId ? `https://i.ytimg.com/vi/${resolvedYtId}/hqdefault.jpg` : null)

  const cleanTitle = videoTitle.replace(/ — Career Masterclass.*$/i, "")
  const leadTakeaway = takeaways[0] ? `\n• ${takeaways[0]}` : ""
  const shareText = [
    `*CONNECTLN — Tickets, Vouches & Real Work*`,
    ``,
    `*${cleanTitle}*${serialPlate ? ` (${serialPlate})` : ""}`,
    `Shared by *${resolvedAuthor}*${videoSubtitle ? ` · ${videoSubtitle}` : ""}${leadTakeaway}`,
    ``,
    `Watch Masterclass on ConnectLn:`,
    resolvedShareUrl
  ].join("\n")

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

  const handleInstagramShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
      }
    } catch {}
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer")
    setSentNote("Copied caption & opened Instagram")
    setTimeout(() => setSentNote(null), 2800)
  }

  const handleSendToConnectLnMember = async (target: ShareTarget) => {
    await sendSharedItemToConnectLnMember({
      senderName: resolvedAuthor,
      senderAvatar: resolvedAvatar,
      senderHeadline: resolvedHeadline,
      target,
      itemTitle: videoTitle,
      itemText: videoSubtitle || takeaways[0] || "",
      shareUrl: resolvedShareUrl,
      itemKindLabel: "ConnectLn Video",
    })
    setShowMemberPicker(false)
    setSentNote(`✓ Sent to ${target.name} on ConnectLn`)
    setTimeout(() => setSentNote(null), 3200)
  }

  const filteredMembers = members
    .filter((m) => {
      const q = memberQuery.trim().toLowerCase()
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        (m.subtitle || "").toLowerCase().includes(q)
      )
    })
    .slice(0, 6)

  return (
    <div
      className={
        editorialFeedMode
          ? "relative w-full overflow-hidden border-y border-zinc-100 dark:border-zinc-800 bg-black"
          : "relative w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md transition-all hover:shadow-lg"
      }
      style={editorialFeedMode ? undefined : { backgroundColor: "#171513", color: "#F5F0EB" }}
    >
      {/* FULL-WIDTH WSJ / LINKEDIN EDITORIAL INLINE VIDEO STAGE (100% Unclouded Canvas) */}
      {(resolvedYtId || videoUrl || resolvedThumb) && (
        <div
          ref={videoStageRef}
          className={`relative w-full overflow-hidden bg-black group/stage ${
            editorialFeedMode ? "" : "border-b border-white/10"
          }`}
        >
          {isPlayingInline && (resolvedYtId || videoUrl) ? (
            <>
              {resolvedYtId ? (
                <ConnectLnStudioPlayer
                  youtubeId={resolvedYtId}
                  title={cleanTitle}
                  serialPlate={serialPlate || "CLN-VID"}
                  speaker={resolvedAuthor}
                  speakerRole={resolvedHeadline}
                  description={videoSubtitle}
                  takeaways={takeaways}
                  durationLabel={duration}
                  initialMuted={false}
                  playerId={bannerPlayerIdRef.current}
                  onExclusiveStop={() => setIsPlayingInline(false)}
                  className="w-full"
                />
              ) : (
                <div data-testid="connectln-video-stage" className="relative w-full max-w-[860px] mx-auto aspect-[860/496] bg-black">
                  <video
                    ref={directVideoRef}
                    src={videoUrl}
                    data-connectln-player-id={bannerPlayerIdRef.current}
                    controls
                    autoPlay
                    muted={isDirectMuted}
                    playsInline
                    loop
                    onPlay={(e) => {
                      const w = typeof window !== "undefined" ? (window as any) : {}
                      const shared = w.__noctisSharedAudioEl
                      const sharedPlaying = Boolean(
                        shared instanceof HTMLAudioElement && !shared.paused && !shared.ended && shared.src && !shared.src.startsWith("data:")
                      )
                      const htmlLang = typeof document !== "undefined" ? (document.documentElement.getAttribute("lang") || "").toLowerCase() : ""
                      const effectiveLang = (w.__noctisPreferredAudioLang || htmlLang || "en").toString().trim().toLowerCase()
                      if (w.__noctisVoiceDuckingActive || sharedPlaying || effectiveLang !== "en") {
                        e.currentTarget.muted = true
                        e.currentTarget.volume = 0
                        setIsDirectMuted(true)
                      }
                    }}
                    onVolumeChange={(e) => {
                      const w = typeof window !== "undefined" ? (window as any) : {}
                      const shared = w.__noctisSharedAudioEl
                      const sharedPlaying = Boolean(
                        shared instanceof HTMLAudioElement && !shared.paused && !shared.ended && shared.src && !shared.src.startsWith("data:")
                      )
                      const htmlLang = typeof document !== "undefined" ? (document.documentElement.getAttribute("lang") || "").toLowerCase() : ""
                      const effectiveLang = (w.__noctisPreferredAudioLang || htmlLang || "en").toString().trim().toLowerCase()
                      const shouldForceMute = Boolean(w.__noctisVoiceDuckingActive || sharedPlaying || effectiveLang !== "en")
                      if (shouldForceMute && (!e.currentTarget.muted || e.currentTarget.volume > 0)) {
                        e.currentTarget.muted = true
                        e.currentTarget.volume = 0
                        setIsDirectMuted(true)
                        return
                      }
                      setIsDirectMuted(e.currentTarget.muted)
                    }}
                    className="h-full w-full object-cover bg-black"
                  />
                  {isDirectMuted && (typeof window === "undefined" || !(window as any).__noctisVoiceDuckingActive) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const w = typeof window !== "undefined" ? (window as any) : {}
                        const shared = w.__noctisSharedAudioEl
                        const sharedPlaying = Boolean(
                          shared instanceof HTMLAudioElement && !shared.paused && !shared.ended && shared.src && !shared.src.startsWith("data:")
                        )
                        const htmlLang = typeof document !== "undefined" ? (document.documentElement.getAttribute("lang") || "").toLowerCase() : ""
                        const effectiveLang = (w.__noctisPreferredAudioLang || htmlLang || "en").toString().trim().toLowerCase()
                        if (w.__noctisVoiceDuckingActive || sharedPlaying || effectiveLang !== "en") {
                          return
                        }
                        if (directVideoRef.current) {
                          directVideoRef.current.muted = false
                          directVideoRef.current.volume = 1
                        }
                        setIsDirectMuted(false)
                      }}
                      style={{ color: "#FFFFFF" }}
                      className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/75 hover:bg-black/90 border border-white/20 px-3 py-1 text-[11px] font-semibold shadow-md cursor-pointer"
                    >
                      <VolumeX className="h-3.5 w-3.5 text-white" />
                      <span style={{ color: "#FFFFFF" }}>Tap for sound</span>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col w-full bg-black">
              {/* Clean WSJ-Format Full-Bleed Poster Stage (Zero Top Clutter, Editorial Serif Bottom Headline + Monogram) */}
              <div
                data-testid="connectln-video-stage"
                onClick={handlePlayTrigger}
                className="relative w-full max-w-[860px] mx-auto aspect-[860/496] cursor-pointer group overflow-hidden bg-zinc-950"
              >
                {resolvedThumb && (
                  <img
                    src={resolvedThumb}
                    alt={cleanTitle}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                {/* Subtle Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/60 border border-white/30 text-white shadow-xl backdrop-blur-xs transition-transform duration-200 group-hover:scale-105">
                    <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current ml-0.5" />
                  </div>
                </div>

                {/* WSJ Editorial Lower-Third Headline & Monogram Watermark */}
                <div className="absolute inset-x-0 bottom-0 px-4 sm:px-5 pb-4 pt-8 flex items-end justify-between gap-4 pointer-events-none">
                  <h4
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', Times, serif",
                      color: "#FFFFFF",
                    }}
                    className="text-lg sm:text-2xl font-bold leading-[1.15] tracking-tight line-clamp-2 max-w-[84%] drop-shadow-md text-left"
                  >
                    {cleanTitle}
                  </h4>
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
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standalone Card Details (Hidden in Feed Mode since FeedPostCard already displays Author, Caption & Social Actions!) */}
      {!editorialFeedMode && (
      <div
        onClick={handlePlayTrigger}
        className={`${
          compact ? "p-2.5 sm:p-3" : "p-3 sm:p-3.5"
        } flex flex-col gap-2.5 cursor-pointer group w-full`}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #221F1D 0%, #171513 100%)"
        }}
      >
        {/* TOP ROW: Left = Circular Author Avatar + Full Name & Headline | Right = Official ConnectLn Brand + Watch/Close Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          {/* LEFT: Circular Profile Picture + Author Name & Headline */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`relative rounded-full p-0.5 bg-gradient-to-tr from-[#0066FF] via-[#38BDF8] to-[#0A66C2] shadow-lg shrink-0 ${
                compact ? "h-11 w-11 sm:h-12 sm:w-12" : "h-12 w-12 sm:h-14 sm:w-14"
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
                    e.currentTarget.src = generatePersonalSignatureAvatar({ name: resolvedAuthor })
                  }}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0066FF] text-white ring-2 ring-[#171513] shadow-sm"
                title={`Shared by ${resolvedAuthor}`}
              >
                <ShieldCheck className="h-2.5 w-2.5" />
              </span>
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p
                className="text-xs sm:text-sm font-extrabold leading-snug break-words"
                style={{ color: "#F5F0EB" }}
              >
                {resolvedAuthor}
              </p>
              {resolvedHeadline && (
                <p
                  className="text-[11px] font-medium leading-snug break-words mt-0.5"
                  style={{ color: "#9E9891" }}
                >
                  {resolvedHeadline}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Official ConnectLn Emblem ("C" Squircle) + Wordmark + Watch / Close Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <img
                src="/brand/connectln-icon-256.png"
                alt="ConnectLn Emblem"
                className={`${
                  compact ? "h-8 w-8 sm:h-9 sm:w-9" : "h-9 w-9 sm:h-10 sm:w-10"
                } rounded-xl object-contain shadow-sm shrink-0`}
              />
              <div className="text-left">
                <div className="inline-flex flex-col items-start">
                  <span
                    className={`${
                      compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
                    } font-black tracking-tight leading-none`}
                    style={{ color: "#F5F0EB" }}
                  >
                    ConnectLn
                  </span>
                  <span
                    className="mt-0.5 h-1 w-[78%] rounded-full"
                    style={{ backgroundColor: "#A64532" }}
                  />
                </div>
                <p
                  className="mt-0.5 text-[10px] font-medium leading-none"
                  style={{ color: "#9E9891" }}
                >
                  Tickets, vouches, and real work
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlayTrigger}
              style={{ backgroundColor: "#A64532", color: "#FFFFFF" }}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full hover:opacity-95 px-3 py-1.5 text-[11px] sm:text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>{isPlayingInline ? "Close Player" : "Watch"}</span>
            </button>
          </div>
        </div>

        {/* BOTTOM ROW: Full-Width Shared Video Title, Badges & Description (Spans 100% width so text never wraps into narrow columns!) */}
        <div
          className="w-full rounded-xl px-3 py-2 border text-left"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.12)"
          }}
        >
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
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "#9E9891"
              }}
            >
              🎥 Verified Profession Field Stream
            </span>
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
      )}

      {/* Multi-Platform Direct Sharing Bar (WhatsApp, LinkedIn, X, Facebook, Email, Copy Link) */}
      {!hideShareBar && !editorialFeedMode && (
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

            {/* Instagram */}
            <button
              type="button"
              onClick={handleInstagramShare}
              style={{ backgroundColor: "#E1306C", color: "#FFFFFF" }}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
              title="Share on Instagram"
            >
              <span>Instagram</span>
            </button>

            {/* Send to ConnectLn Member */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMemberPicker((prev) => !prev)
                }}
                style={{ backgroundColor: "#6B4423", color: "#FFFFFF" }}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                title="Send directly to another person on ConnectLn"
              >
                <Send className="h-2.5 w-2.5" />
                <span>ConnectLn Member</span>
              </button>

              {showMemberPicker && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowMemberPicker(false)}
                  />
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 bottom-full mb-2 z-40 w-72 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-2xl text-zinc-900 space-y-1.5"
                  >
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0A66C2]">
                      ↪ Send Video to ConnectLn Member:
                    </p>
                    <input
                      type="text"
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder="Search member name..."
                      className="w-full rounded-lg border border-zinc-300 px-2.5 py-1 text-xs text-zinc-900 focus:outline-none focus:border-[#0A66C2]"
                    />
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleSendToConnectLnMember(member)}
                          className="flex w-full items-center justify-between gap-2 rounded-lg p-1.5 text-left hover:bg-sky-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={
                                member.avatar ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0a66c2`
                              }
                              alt={member.name}
                              className="h-6 w-6 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-zinc-900 truncate">
                                {member.name}
                              </p>
                              {member.subtitle && (
                                <p className="text-[9px] text-zinc-500 truncate">
                                  {member.subtitle}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="rounded-full bg-[#0A66C2] px-2 py-0.5 text-[10px] font-bold text-white shrink-0">
                            Send
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

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

          {sentNote && (
            <span className="text-[10px] font-bold text-emerald-400">
              {sentNote}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
