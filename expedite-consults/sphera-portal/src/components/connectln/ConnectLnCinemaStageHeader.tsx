"use client"

import React, { useMemo, useState } from "react"
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Pin,
  Play,
  RefreshCw,
  Settings,
  Sparkles,
  Subtitles,
  Tv,
  Volume2,
  VolumeX,
  Wand2,
} from "lucide-react"
import { Post, ReactionType, SuggestedConnection, UserProfile } from "@/lib/connectln-data"
import { useTheme } from "@/context/ThemeContext"

interface ConnectLnCinemaStageHeaderProps {
  activeFeedCategory: string
  onChangeFeedCategory: (cat: "for_you" | "following") => void
  featuredPosts: Post[]
  currentUser: UserProfile
  suggestedPeople: SuggestedConnection[]
  activeProfessionTitle: string
  showProfessionDrawer: boolean
  onToggleProfessionDrawer: () => void
  isSyncingVideos: boolean
  onSyncVideos: () => void
  onToggleReaction: (postId: string, reaction: ReactionType) => void
  onToggleSave: (postId: string) => void
  onSelectMember: (member: { id?: string; name: string; headline?: string; avatar?: string }) => void
  onNavigateTab: (tab: string) => void
  onOpenMobileMenu?: () => void
}

function getInitials(name: string): string {
  const parts = String(name || "CL").trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase()
  }
  return String(name || "CL").slice(0, 2).toUpperCase()
}

export function ConnectLnCinemaStageHeader({
  activeFeedCategory,
  onChangeFeedCategory,
  featuredPosts,
  currentUser,
  suggestedPeople,
  activeProfessionTitle,
  showProfessionDrawer,
  onToggleProfessionDrawer,
  isSyncingVideos,
  onSyncVideos,
  onToggleReaction,
  onToggleSave,
  onSelectMember,
  onNavigateTab,
  onOpenMobileMenu,
}: ConnectLnCinemaStageHeaderProps) {
  const { isDark, setTheme } = useTheme()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)
  const [captionsOn, setCaptionsOn] = useState(true)
  const [stageFxOn, setStageFxOn] = useState(true)
  const [soundOn, setSoundOn] = useState(true)

  const stagePosts = useMemo(() => {
    const withMedia = featuredPosts.filter((p) => p?.media?.youtubeId || p?.media?.url)
    const pool = withMedia.length > 0 ? withMedia : featuredPosts
    return pool.slice(0, 24)
  }, [featuredPosts])

  const safeIdx = stagePosts.length > 0 ? activeIndex % stagePosts.length : 0
  const activePost = stagePosts[safeIdx] || featuredPosts[0]

  const avatarRingItems = useMemo(() => {
    const items: Array<{
      key: string
      name: string
      avatar?: string
      headline?: string
      postIdx?: number
      memberId?: string
    }> = [
      {
        key: "self",
        name: currentUser.name,
        avatar: currentUser.avatar,
        headline: currentUser.headline,
        postIdx: 0,
        memberId: currentUser.id,
      },
    ]
    const seen = new Set<string>([String(currentUser.name || "").toLowerCase()])

    stagePosts.forEach((post, idx) => {
      const n = String(post.author?.name || "").trim()
      if (!n || seen.has(n.toLowerCase())) return
      seen.add(n.toLowerCase())
      items.push({
        key: `post_${post.id}`,
        name: n,
        avatar: post.author?.avatar,
        headline: post.author?.headline,
        postIdx: idx,
        memberId: post.author?.id,
      })
    })

    suggestedPeople.slice(0, 12).forEach((person) => {
      const n = String(person.name || "").trim()
      if (!n || seen.has(n.toLowerCase())) return
      seen.add(n.toLowerCase())
      items.push({
        key: `sug_${person.id}`,
        name: n,
        avatar: person.avatar,
        headline: person.headline,
        memberId: person.id,
      })
    })

    return items.slice(0, 16)
  }, [currentUser, stagePosts, suggestedPeople])

  const goPrev = () => {
    if (stagePosts.length === 0) return
    setIsPlayingVideo(false)
    setActiveIndex((prev) => (prev - 1 + stagePosts.length) % stagePosts.length)
  }

  const goNext = () => {
    if (stagePosts.length === 0) return
    setIsPlayingVideo(false)
    setActiveIndex((prev) => (prev + 1) % stagePosts.length)
  }

  const youtubeId = activePost?.media?.youtubeId
  const mediaImageUrl =
    activePost?.media?.thumbnailUrl ||
    (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : activePost?.media?.url)
  const captionText =
    activePost?.media?.title ||
    activePost?.media?.overlayTitle ||
    String(activePost?.content || "").replace(/\s+/g, " ").slice(0, 68) ||
    `${activeProfessionTitle} Live Briefing`

  return (
    <section className="space-y-2.5 w-full max-w-full overflow-hidden">
      {/* Row 1: Centered Following | For You Switcher + Mobile Quick-Nav Trigger */}
      <div
        data-testid="stage-feed-tabs"
        className="relative flex items-center justify-center border-b border-zinc-200/80 dark:border-indigo-400/15 pb-1"
      >
        {onOpenMobileMenu && (
          <button
            type="button"
            data-testid="mobile-stage-menu-btn"
            onClick={onOpenMobileMenu}
            className="lg:hidden absolute left-0 inline-flex items-center gap-1 rounded-full border border-zinc-300 dark:border-indigo-400/25 bg-white dark:bg-[#121629] px-2.5 py-1 text-xs font-bold text-zinc-800 dark:text-slate-100 cursor-pointer"
          >
            <Menu className="h-3.5 w-3.5" />
            <span>Nav</span>
          </button>
        )}

        <div className="flex items-center gap-5 sm:gap-7">
          <button
            type="button"
            onClick={() => onChangeFeedCategory("following")}
            className={`relative px-2 py-1.5 text-sm font-bold transition-colors cursor-pointer ${
              activeFeedCategory === "following"
                ? "text-zinc-950 dark:text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Following
            {activeFeedCategory === "following" && (
              <span className="absolute inset-x-0 -bottom-1 h-[2.5px] rounded-full bg-[#0A66C2] dark:bg-white" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeFeedCategory("for_you")}
            className={`relative px-2 py-1.5 text-sm font-bold transition-colors cursor-pointer ${
              activeFeedCategory !== "following"
                ? "text-zinc-950 dark:text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            For You
            {activeFeedCategory !== "following" && (
              <span className="absolute inset-x-0 -bottom-1 h-[2.5px] rounded-full bg-[#0A66C2] dark:bg-white" />
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Compact Control Pill Bar (Mobile Horizontally Scrollable) */}
      <div
        data-testid="stage-control-bar"
        className="rounded-2xl border border-zinc-200 dark:border-indigo-400/20 bg-white/95 dark:bg-gradient-to-r dark:from-[#12162b] dark:via-[#1b1636] dark:to-[#12162b] px-2.5 sm:px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm"
      >
        <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 min-w-0">
          <span
            title={activeProfessionTitle}
            className="text-xs font-semibold text-zinc-600 dark:text-slate-300 whitespace-nowrap"
          >
            Clip {Math.min(safeIdx + 1, Math.max(stagePosts.length, 1))} of {Math.max(stagePosts.length, 1)}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous clip"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 dark:border-indigo-400/25 bg-zinc-50 dark:bg-white/5 text-zinc-700 dark:text-slate-200 hover:bg-zinc-100 dark:hover:bg-white/15 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next clip"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 dark:border-indigo-400/25 bg-zinc-50 dark:bg-white/5 text-zinc-700 dark:text-slate-200 hover:bg-zinc-100 dark:hover:bg-white/15 cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5 sm:pb-0">
          <button
            type="button"
            data-testid="stage-profession-pill"
            onClick={onToggleProfessionDrawer}
            className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
              showProfessionDrawer
                ? "bg-teal-600 text-white border-teal-500"
                : "border-zinc-200 dark:border-teal-400/30 bg-zinc-100 dark:bg-teal-950/50 text-zinc-800 dark:text-teal-200 hover:bg-zinc-200 dark:hover:bg-teal-900/50"
            }`}
          >
            <Pin className="h-3 w-3" />
            <span>Profession</span>
          </button>

          <button
            type="button"
            onClick={() => setCaptionsOn((prev) => !prev)}
            className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
              captionsOn
                ? "bg-indigo-600 text-white border-indigo-400/60"
                : "border-zinc-200 dark:border-indigo-400/25 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-slate-300"
            }`}
          >
            <Subtitles className="h-3 w-3" />
            <span>CC · {captionsOn ? "On" : "Off"}</span>
          </button>

          <button
            type="button"
            onClick={onSyncVideos}
            disabled={isSyncingVideos}
            className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border border-zinc-200 dark:border-amber-400/30 bg-zinc-100 dark:bg-amber-500/10 text-zinc-800 dark:text-amber-200 hover:bg-zinc-200 dark:hover:bg-amber-500/20 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncingVideos ? "animate-spin" : ""}`} />
            <span>{isSyncingVideos ? "Syncing" : "Sync"}</span>
          </button>

          <button
            type="button"
            onClick={() => setStageFxOn((prev) => !prev)}
            className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
              stageFxOn
                ? "bg-fuchsia-600 text-white border-fuchsia-400/60"
                : "border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-slate-300"
            }`}
          >
            <Wand2 className="h-3 w-3" />
            <span>Stage FX</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundOn((prev) => !prev)}
            className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border border-zinc-200 dark:border-indigo-400/25 bg-zinc-100 dark:bg-white/5 text-zinc-800 dark:text-slate-200 hover:bg-zinc-200 dark:hover:bg-white/10 cursor-pointer"
          >
            {soundOn ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            <span>{soundOn ? "Sound On" : "Muted"}</span>
          </button>

          <button
            type="button"
            data-testid="stage-display-theme-btn"
            onClick={() => setTheme(isDark ? "classic" : "midnight")}
            className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border border-zinc-200 dark:border-sky-400/35 bg-zinc-100 dark:bg-sky-500/15 text-zinc-900 dark:text-sky-200 hover:bg-zinc-200 dark:hover:bg-sky-500/25 cursor-pointer"
            title="Switch between Midnight Glass and Light Display"
          >
            <Settings className="h-3 w-3" />
            <span>Display: {isDark ? "Midnight" : "Light"}</span>
          </button>
        </div>
      </div>

      {/* Row 3: Midnight Cinema Stage Frame */}
      <div
        data-testid="connectln-cinema-stage-card"
        className={`rounded-2xl sm:rounded-3xl border border-zinc-800/80 dark:border-indigo-400/25 bg-[#070913] p-2.5 sm:p-3.5 transition-shadow ${
          stageFxOn ? "shadow-[0_18px_50px_rgba(37,99,235,0.22)]" : "shadow-xl"
        }`}
      >
        {/* Top Horizontal Avatar / Stories Ring Strip */}
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-2.5">
          {avatarRingItems.map((item) => {
            const isSelected =
              typeof item.postIdx === "number" &&
              activePost &&
              activePost.author?.name?.toLowerCase() === item.name.toLowerCase()
            return (
              <button
                key={item.key}
                type="button"
                title={item.name}
                onClick={() => {
                  if (typeof item.postIdx === "number") {
                    setIsPlayingVideo(false)
                    setActiveIndex(item.postIdx)
                  } else {
                    onSelectMember({
                      id: item.memberId,
                      name: item.name,
                      headline: item.headline,
                      avatar: item.avatar,
                    })
                  }
                }}
                className={`relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#111528] text-xs font-extrabold text-white transition-transform hover:scale-105 cursor-pointer overflow-hidden border ${
                  isSelected
                    ? "ring-2 ring-violet-400 border-violet-300"
                    : "border-white/20 hover:border-sky-400/70"
                }`}
              >
                {item.avatar && !item.avatar.includes("dicebear") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{getInitials(item.name)}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* 16:9 Cinema Media Viewport */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#0d1224] border border-white/10">
          {youtubeId && isPlayingVideo ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${soundOn ? 0 : 1}&rel=0`}
              title={captionText}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : mediaImageUrl ? (
            <div className="relative h-full w-full group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaImageUrl}
                alt={captionText}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              {youtubeId && (
                <button
                  type="button"
                  onClick={() => setIsPlayingVideo(true)}
                  aria-label="Play featured briefing video"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/70 border border-white/30 text-white hover:bg-[#0064E0] transition-colors cursor-pointer shadow-xl"
                >
                  <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-white ml-0.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-[#0f172a] via-[#17183b] to-[#0b1120] p-4 sm:p-6 text-white">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>ConnectLn Spotlight</span>
              </div>
              <p className="text-sm sm:text-lg font-bold leading-snug line-clamp-3">
                {activePost?.content || "Welcome to the ConnectLn Midnight-Glass Feed."}
              </p>
              <span className="text-xs text-slate-300">{activePost?.author?.headline || activeProfessionTitle}</span>
            </div>
          )}

          {captionsOn && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[90%] rounded-full bg-black/75 backdrop-blur-md border border-white/15 px-3.5 py-1 text-center text-[11px] sm:text-xs font-medium text-white truncate">
              — {captionText}
            </div>
          )}
        </div>

        {/* Bottom Engagement Row */}
        {activePost && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 px-1 text-slate-200">
            <button
              type="button"
              onClick={() =>
                onSelectMember({
                  id: activePost.author?.id,
                  name: activePost.author?.name || currentUser.name,
                  headline: activePost.author?.headline,
                  avatar: activePost.author?.avatar,
                })
              }
              className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer hover:opacity-90"
            >
              <span className="h-7 w-7 shrink-0 rounded-full overflow-hidden border border-white/25 bg-[#121629] flex items-center justify-center text-[11px] font-bold">
                {activePost.author?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePost.author.avatar}
                    alt={activePost.author.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(activePost.author?.name || "CL")
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-white">
                  {activePost.author?.name}
                </span>
                <span className="block truncate text-[10px] text-slate-400">
                  {activePost.timestamp || "Featured"}
                </span>
              </span>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onToggleReaction(activePost.id, "like")}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
                  activePost.userReaction
                    ? "bg-rose-500/20 border-rose-400/50 text-rose-300"
                    : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${activePost.userReaction ? "fill-rose-400" : ""}`} />
                <span>{activePost.stats?.likesCount || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSave(activePost.id)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
                  activePost.isSaved
                    ? "bg-sky-500/20 border-sky-400/50 text-sky-300"
                    : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${activePost.isSaved ? "fill-sky-300" : ""}`} />
                <span className="hidden sm:inline">{activePost.isSaved ? "Saved" : "Save"}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab("media")}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 cursor-pointer"
              >
                <Tv className="h-3.5 w-3.5 text-sky-400" />
                <span className="hidden sm:inline">Media Hub</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
