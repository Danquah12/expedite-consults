"use client"

import React, { useState, useEffect } from "react"
import {
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  UserPlus,
  ExternalLink,
  Shield,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  Calendar,
  Briefcase,
  ShieldCheck
} from "lucide-react"
import { NewsItem, SuggestedConnection, UserProfile } from "@/lib/connectln-data"
import {
  loadUserFollowBundle,
  syncUserFollowBundleFromCloud,
  getFollowRelationshipState,
  followMember,
  unfollowMember,
  normalizeFollowKey
} from "@/lib/connectin-follow"
import { useLanguage } from "@/context/LanguageContext"

interface RightSidebarNewsProps {
  news: NewsItem[]
  suggestedPeople: SuggestedConnection[]
  onToggleConnect: (personId: string) => void
  onToggleFollow?: (person: SuggestedConnection) => void
  currentUser?: UserProfile
  onNewsClick?: (headline: string) => void
  onNavigateTab?: (tab: string) => void
  onOpenNetworkSubTab?: (subTab: 'followers' | 'following' | 'connections') => void
  onOpenAIAssistant?: (initialQuery?: string) => void
  onSelectMember?: (member: any) => void
}

export function RightSidebarNews({
  news,
  suggestedPeople,
  onToggleConnect,
  onToggleFollow,
  currentUser,
  onNewsClick,
  onNavigateTab,
  onOpenNetworkSubTab,
  onOpenAIAssistant,
  onSelectMember
}: RightSidebarNewsProps) {
  const [showAllNews, setShowAllNews] = useState(false)
  const [sidebarQuery, setSidebarQuery] = useState("")
  const [followTick, setFollowTick] = useState(0)
  const [followFeedback, setFollowFeedback] = useState<string | null>(null)
  const { t } = useLanguage()
  const displayedNews = showAllNews ? news : news.slice(0, 3)

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleRefresh = () => setFollowTick(v => v + 1)
    window.addEventListener("connectln-follow-updated", handleRefresh)
    if (currentUser?.name) {
      syncUserFollowBundleFromCloud(currentUser.name).then(() => setFollowTick(v => v + 1)).catch(() => {})
    }
    return () => window.removeEventListener("connectln-follow-updated", handleRefresh)
  }, [currentUser?.name])

  const userFollowBundle = React.useMemo(
    () => loadUserFollowBundle(currentUser?.name),
    [currentUser?.name, followTick]
  )

  // Exclude self and blocked accounts; verified badge is strictly independent of follow relationship
  const eligibleFellows = React.useMemo(() => {
    const myNorm = normalizeFollowKey(currentUser?.name)
    const blockedSet = new Set(userFollowBundle.blockedUsers.map(b => normalizeFollowKey(b.name)))
    return suggestedPeople.filter(p => {
      const pNorm = normalizeFollowKey(p.name)
      if (!pNorm || pNorm === myNorm) return false
      if (blockedSet.has(pNorm)) return false
      return true
    })
  }, [suggestedPeople, currentUser?.name, userFollowBundle.blockedUsers])

  return (
    <aside className="space-y-3">
      {/* 1. COMPACT NOCTIS AI ASSISTANT BAR */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpenAIAssistant && onOpenAIAssistant()}
            className="flex items-center gap-2 group min-w-0 text-left cursor-pointer"
          >
            <div className="h-7 w-7 rounded-lg bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center text-[#0A66C2] dark:text-[#70B5F9] shrink-0 group-hover:bg-[#0A66C2] group-hover:text-white transition-colors">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] flex items-center gap-1.5 transition-colors">
                <span>{t("ask_vibe_ai", "Ask Noctis")}</span>
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                {t("vibe_ai_desc", "Career, Trade & Technical Intelligence")}
              </p>
            </div>
          </button>
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center gap-1 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{t("vibe_online", "Ready")}</span>
          </span>
        </div>

        {/* Query Input */}
        <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg p-1 border border-zinc-200/90 dark:border-zinc-700/80 focus-within:border-[#0A66C2] transition-all">
          <input
            type="text"
            placeholder={t("ask_noctis_placeholder", "Ask a question or search skills...")}
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onOpenAIAssistant) {
                onOpenAIAssistant(sidebarQuery)
                setSidebarQuery("")
              }
            }}
            className="flex-1 bg-transparent px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (onOpenAIAssistant) {
                onOpenAIAssistant(sidebarQuery)
                setSidebarQuery("")
              }
            }}
            className="rounded-md bg-[#0A66C2] hover:bg-[#004182] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors shrink-0 cursor-pointer"
          >
            {t("search_button", "Ask")}
          </button>
        </div>

        {/* Subtle 2-chip quick sparks */}
        <div className="flex items-center gap-1.5">
          {[
            { label: "✨ Resume Review", q: "Resume optimization tips" },
            { label: "🎯 Career & Pay Guide", q: "Top roles and compensation guide" },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenAIAssistant && onOpenAIAssistant(chip.q)}
              className="flex-1 text-[10px] font-medium rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 transition-colors border border-zinc-200/70 dark:border-zinc-700/60 truncate cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CONNECTIN NEWS & RESEARCH INTELLIGENCE */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            {t("news_and_pulse", "ConnectIn News & Pulse")}
          </h3>
          <Info className="h-4 w-4 text-zinc-400 cursor-pointer hover:text-zinc-600" />
        </div>

        <p className="text-xs font-semibold text-zinc-500 mb-2 dark:text-zinc-400">
          {t("top_stories", "Top stories & cyber intelligence")}
        </p>

        <div className="space-y-2.5">
          {displayedNews.map((item) => (
            <div
              key={item.id}
              onClick={() => onNewsClick && onNewsClick(item.headline)}
              className="group cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 group-hover:bg-[#0A66C2] transition-colors shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800 group-hover:text-[#0A66C2] group-hover:underline dark:text-zinc-200 leading-snug">
                    {item.headline}
                  </h4>
                  <p className="mt-0.5 text-[10px] text-zinc-400">
                    {item.timeAgo} · {item.readersCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAllNews(!showAllNews)}
          className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 focus:outline-none cursor-pointer"
        >
          <span>{showAllNews ? t("show_less", "Show less") : t("show_more", "Show more")}</span>
          {showAllNews ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* 3. VERIFIED FELLOWS & PEOPLE TO FOLLOW (ONE-WAY FOLLOW GRAPH, SEPARATE FROM CONNECTIONS) */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2.5">
        <div className="flex items-center justify-between pb-1">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            {t("verified_fellows", "Verified Fellows to Follow")}
          </h3>
          <Info className="h-4 w-4 text-zinc-400" title="Following is one-way: receive public updates in your feed without sending a connection invitation." />
        </div>

        {/* Live Followers & Following Counter Strip */}
        <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/70 p-2 border border-zinc-200/70 dark:border-zinc-700/70 text-center">
          <button
            type="button"
            onClick={() => {
              if (onOpenNetworkSubTab) onOpenNetworkSubTab('following')
              else if (onNavigateTab) onNavigateTab('network')
            }}
            className="hover:bg-white dark:hover:bg-zinc-900 rounded-md py-1 transition-colors cursor-pointer"
            title="View people you follow"
          >
            <p className="text-xs font-extrabold text-[#0A66C2] dark:text-sky-400">
              {userFollowBundle.following.length}
            </p>
            <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Following</p>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onOpenNetworkSubTab) onOpenNetworkSubTab('followers')
              else if (onNavigateTab) onNavigateTab('network')
            }}
            className="hover:bg-white dark:hover:bg-zinc-900 rounded-md py-1 transition-colors cursor-pointer"
            title="View people following you"
          >
            <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
              {userFollowBundle.followers.length}
            </p>
            <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Followers</p>
          </button>
        </div>

        {followFeedback && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2.5 py-1.5 text-[11px] font-semibold text-[#0A66C2] dark:text-sky-300">
            {followFeedback}
          </div>
        )}

        <div className="space-y-3 mt-1">
          {eligibleFellows.slice(0, 3).map((person) => {
            const rel = getFollowRelationshipState(currentUser?.name, person.name)
            const targetFollowBundle = loadUserFollowBundle(person.name)
            return (
              <div key={person.id} className="flex items-start gap-2.5">
                <img
                  src={person.avatar}
                  alt={person.name}
                  onClick={() => onSelectMember?.(person)}
                  className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-800 cursor-pointer hover:ring-2 hover:ring-[#0A66C2] transition-all"
                  title={`Open ${person.name}'s Workspace`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p
                      onClick={() => onSelectMember?.(person)}
                      className="font-bold text-xs text-zinc-900 hover:underline hover:text-[#0A66C2] cursor-pointer truncate dark:text-zinc-100"
                      title={`Open ${person.name}'s Workspace`}
                    >
                      {person.name}
                    </p>
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" title="Verified identity badge (independent of follow status)" />
                  </div>
                  <p
                    onClick={() => onSelectMember?.(person)}
                    className="text-[11px] text-zinc-500 line-clamp-2 dark:text-zinc-400 leading-tight cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    {person.headline}
                  </p>
                  {targetFollowBundle.followers.length > 0 && (
                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                      {targetFollowBundle.followers.length} {targetFollowBundle.followers.length === 1 ? 'follower' : 'followers'}
                      {rel.followsYou ? ' · Follows you' : ''}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (onToggleFollow) {
                          onToggleFollow(person)
                          return
                        }
                        if (!currentUser?.name) return
                        if (rel.isFollowing) {
                          unfollowMember({
                            actorName: currentUser.name,
                            targetName: person.name
                          })
                          setFollowFeedback(`Unfollowed ${person.name}.`)
                        } else {
                          const res = followMember({
                            actorId: currentUser.id,
                            actorName: currentUser.name,
                            actorHeadline: currentUser.headline,
                            actorAvatar: currentUser.avatar,
                            actorProfession: currentUser.profession,
                            actorLocation: currentUser.location,
                            targetId: person.id,
                            targetName: person.name,
                            targetHeadline: person.headline,
                            targetAvatar: person.avatar,
                            isConnectedWithTarget: Boolean(person.isConnected)
                          })
                          if (!res.ok && res.error) {
                            setFollowFeedback(res.error)
                          } else {
                            setFollowFeedback(`Following ${person.name}. Their public updates now appear in your feed.`)
                          }
                        }
                        setTimeout(() => setFollowFeedback(null), 3500)
                      }}
                      className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                        rel.isFollowing
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : rel.followsYou
                          ? "border-[#0A66C2] bg-blue-50 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white dark:bg-blue-950/40 dark:text-sky-300"
                          : "border-zinc-400 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-600 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      }`}
                      title={rel.isFollowing ? `Click to unfollow ${person.name}` : `Follow ${person.name} to receive their public updates in your feed`}
                    >
                      {rel.isFollowing ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      <span>
                        {rel.isFollowing
                          ? t("following", "Following")
                          : rel.followsYou
                          ? "Follow back"
                          : t("follow", "Follow")}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            if (onOpenNetworkSubTab) onOpenNetworkSubTab('following')
            else if (onNavigateTab) onNavigateTab('network')
          }}
          className="w-full pt-2 border-t border-zinc-100 dark:border-zinc-800 text-left text-[11px] font-bold text-[#0A66C2] dark:text-sky-400 hover:underline flex items-center justify-between cursor-pointer"
        >
          <span>Manage Followers &amp; Following</span>
          <span>→</span>
        </button>
      </div>
    </aside>
  )
}
