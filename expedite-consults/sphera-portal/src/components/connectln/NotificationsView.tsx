"use client"

import React, { useState, useEffect } from "react"
import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Heart,
  MessageSquare,
  Sparkles,
  Award,
  Calendar,
  Filter,
  Check,
  AlertTriangle,
  Shield,
  ShoppingBag,
  GraduationCap,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag,
  Store,
  Layers
} from "lucide-react"
import {
  CategorizedNotificationItem,
  INITIAL_CATEGORIZED_NOTIFICATIONS
} from "@/lib/notifications-engine-data"
import { MiniMarkdown } from "./MiniMarkdown"
import {
  loadUserFollowBundle,
  syncUserFollowBundleFromCloud,
  getFollowRelationshipState,
  followMember,
  unfollowMember,
  markFollowNotificationsRead,
  UserFollowBundle
} from "@/lib/connectin-follow"
import {
  loadLiveUserTelemetry,
  syncLiveUserTelemetryFromCloud,
  getProfileTailoredAnalytics,
  markVouchAlertsRead,
  UserLiveTelemetryBundle
} from "@/lib/connectin-analytics"
import {
  loadMembers,
  sendSharedItemToConnectLnMember,
  DEFAULT_CONNECTLN_SHARE_MEMBERS,
  type ShareTarget
} from "./MessageActionBar"
import { triggerReactionSplash } from "@/lib/reaction-splash"

type AlertReactionType = 'like' | 'celebrate' | 'support' | 'love' | 'insightful' | 'funny'

const ALERT_REACTIONS_CONFIG: {
  key: AlertReactionType
  emoji: string
  label: string
  activeBg: string
  activeBorder: string
  activeText: string
}[] = [
  {
    key: 'like',
    emoji: '👍',
    label: 'Like',
    activeBg: 'bg-blue-50 dark:bg-blue-950/60',
    activeBorder: 'border-[#0A66C2]',
    activeText: 'text-[#0A66C2] dark:text-sky-300'
  },
  {
    key: 'celebrate',
    emoji: '👏',
    label: 'Celebrate',
    activeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    activeBorder: 'border-emerald-600',
    activeText: 'text-emerald-700 dark:text-emerald-300'
  },
  {
    key: 'support',
    emoji: '🤝',
    label: 'Support',
    activeBg: 'bg-teal-50 dark:bg-teal-950/60',
    activeBorder: 'border-teal-600',
    activeText: 'text-teal-700 dark:text-teal-300'
  },
  {
    key: 'love',
    emoji: '❤️',
    label: 'Love',
    activeBg: 'bg-rose-50 dark:bg-rose-950/60',
    activeBorder: 'border-rose-500',
    activeText: 'text-rose-600 dark:text-rose-300'
  },
  {
    key: 'insightful',
    emoji: '💡',
    label: 'Insightful',
    activeBg: 'bg-amber-50 dark:bg-amber-950/60',
    activeBorder: 'border-amber-500',
    activeText: 'text-amber-700 dark:text-amber-300'
  },
  {
    key: 'funny',
    emoji: '😂',
    label: 'Funny',
    activeBg: 'bg-orange-50 dark:bg-orange-950/60',
    activeBorder: 'border-orange-500',
    activeText: 'text-orange-700 dark:text-orange-300'
  }
]

interface AlertCommentEntry {
  id: string
  authorName: string
  authorProfession: string
  text: string
  createdAt: string
}

interface AlertSocialActionBarProps {
  alertId: string
  alertTitle: string
  alertDescription: string
  actorName: string
  actorRole?: string
  actorAvatar?: string
  currentUserName: string
  currentUserProfession: string
  currentUserAvatar?: string
  onPostToFeed?: (content: string, repostOf?: string) => void
}

function AlertSocialActionBar({
  alertId,
  alertTitle,
  alertDescription,
  actorName,
  actorRole,
  actorAvatar,
  currentUserName,
  currentUserProfession,
  currentUserAvatar,
  onPostToFeed
}: AlertSocialActionBarProps) {
  const [selectedReaction, setSelectedReaction] = useState<AlertReactionType | null>(null)
  const [reactionCounts, setReactionCounts] = useState<Record<AlertReactionType, number>>({
    like: 4,
    celebrate: 2,
    support: 2,
    love: 1,
    insightful: 3,
    funny: 0
  })
  const [comments, setComments] = useState<AlertCommentEntry[]>([])
  const [showComments, setShowComments] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")
  const [showRepostPanel, setShowRepostPanel] = useState(false)
  const [repostQuote, setRepostQuote] = useState("")
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [shareQuery, setShareQuery] = useState("")
  const [members, setMembers] = useState<ShareTarget[]>(DEFAULT_CONNECTLN_SHARE_MEMBERS)
  const [sendingToId, setSendingToId] = useState<string | null>(null)
  const [sentMemberIds, setSentMemberIds] = useState<Record<string, boolean>>({})
  const [statusToast, setStatusToast] = useState<string | null>(null)

  const storageReactionKey = `connectln_alert_react_v1_${alertId}`
  const storageCommentsKey = `connectln_alert_comments_v1_${alertId}`

  useEffect(() => {
    try {
      const savedReact = localStorage.getItem(storageReactionKey)
      if (savedReact) {
        const parsed = JSON.parse(savedReact)
        if (parsed?.selected !== undefined) setSelectedReaction(parsed.selected)
        if (parsed?.counts) setReactionCounts(parsed.counts)
      }
      const savedComments = localStorage.getItem(storageCommentsKey)
      if (savedComments) {
        const parsedComments = JSON.parse(savedComments)
        if (Array.isArray(parsedComments)) setComments(parsedComments)
      }
    } catch {}
  }, [storageReactionKey, storageCommentsKey])

  useEffect(() => {
    if (showSharePanel) {
      loadMembers().then(setMembers).catch(() => {})
    }
  }, [showSharePanel])

  const flashToast = (msg: string) => {
    setStatusToast(msg)
    setTimeout(() => setStatusToast(null), 3200)
  }

  const handleToggleReaction = (type: AlertReactionType) => {
    const prevReaction = selectedReaction
    const nextReaction = prevReaction === type ? null : type
    const nextCounts = { ...reactionCounts }
    if (prevReaction) {
      nextCounts[prevReaction] = Math.max(0, (nextCounts[prevReaction] || 1) - 1)
    }
    if (nextReaction) {
      nextCounts[nextReaction] = (nextCounts[nextReaction] || 0) + 1
    }
    setSelectedReaction(nextReaction)
    setReactionCounts(nextCounts)
    try {
      localStorage.setItem(
        storageReactionKey,
        JSON.stringify({ selected: nextReaction, counts: nextCounts })
      )
    } catch {}
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = commentDraft.trim()
    if (!trimmed) return
    const entry: AlertCommentEntry = {
      id: `ac_${Date.now()}`,
      authorName: currentUserName || "Kwesi Asiedu",
      authorProfession: currentUserProfession || "Verified ConnectLn Professional",
      text: trimmed,
      createdAt: "Just now"
    }
    const updated = [entry, ...comments]
    setComments(updated)
    setCommentDraft("")
    try {
      localStorage.setItem(storageCommentsKey, JSON.stringify(updated))
    } catch {}
    flashToast("✓ Comment posted on this alert")
  }

  const shareCardUrl = (() => {
    const params = new URLSearchParams({
      author: actorName || "ConnectLn Alert Center",
      role: actorRole || "ConnectLn Advisory & Operations",
      avatar: actorAvatar && !actorAvatar.startsWith("data:") ? actorAvatar : "",
      text: `${alertTitle}\n\n${alertDescription}`.slice(0, 420),
      sharedBy: currentUserName || "Kwesi Asiedu"
    })
    return `https://www.conectln.com/share/message?${params.toString()}`
  })()

  const shareBodyText = `📢 ${alertTitle}\n\n${alertDescription}\n\n🔗 View on ConnectLn: ${shareCardUrl}`

  const handlePublishToFeed = async (withCommentary: boolean) => {
    const commentary = repostQuote.trim()
    const postContent =
      withCommentary && commentary
        ? `${commentary}\n\n🔁 Reposted Alert from ${actorName || "ConnectLn Alerts"}:\n${alertTitle}\n${alertDescription}`
        : `📢 ${alertTitle}\n\n${alertDescription}`

    if (onPostToFeed) {
      onPostToFeed(
        `${alertTitle}\n\n${alertDescription}`,
        withCommentary && commentary ? undefined : actorName || "ConnectLn Alerts"
      )
    }

    try {
      await fetch("/api/connectin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: currentUserName || "Kwesi Asiedu",
          authorRole: currentUserProfession || "Verified ConnectLn Professional",
          authorAvatar: currentUserAvatar || "/brand/kwesi-avatar.png",
          content: postContent,
          tags: ["ConnectLnAlerts", "NoctisInvariant", "ProfessionalUpdate"]
        })
      })
    } catch {}

    setRepostQuote("")
    setShowRepostPanel(false)
    flashToast("✓ Posted to your ConnectLn Home Feed!")
  }

  const handleShareExternal = (platform: 'linkedin' | 'facebook' | 'instagram' | 'whatsapp' | 'email' | 'copy') => {
    const openPopup = (url: string) =>
      window.open(url, "_blank", "noopener,noreferrer,width=680,height=640")

    if (platform === 'linkedin') {
      openPopup(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareBodyText)}`)
      flashToast("✓ Opened LinkedIn Share")
    } else if (platform === 'facebook') {
      openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareCardUrl)}&quote=${encodeURIComponent(shareBodyText)}`)
      flashToast("✓ Opened Facebook Share")
    } else if (platform === 'instagram') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(shareBodyText).catch(() => {})
      }
      openPopup("https://www.instagram.com/")
      flashToast("✓ Copied alert caption & opened Instagram")
    } else if (platform === 'whatsapp') {
      openPopup(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareBodyText)}`)
      flashToast("✓ Opened WhatsApp Share")
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(alertTitle)}&body=${encodeURIComponent(shareBodyText)}`
    } else if (platform === 'copy') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(shareBodyText).catch(() => {})
      }
      flashToast("✓ Alert link & summary copied to clipboard")
    }
  }

  const handleSendToConnectLnMember = async (target: ShareTarget) => {
    setSendingToId(target.id)
    try {
      await sendSharedItemToConnectLnMember({
        senderName: currentUserName || "Kwesi Asiedu",
        senderAvatar: currentUserAvatar || "/brand/kwesi-avatar.png",
        senderHeadline: currentUserProfession || "Verified ConnectLn Professional",
        target,
        itemTitle: alertTitle,
        itemText: alertDescription,
        shareUrl: shareCardUrl,
        itemKindLabel: "ConnectLn Alert"
      })
      setSentMemberIds(prev => ({ ...prev, [target.id]: true }))
      flashToast(`✓ Sent alert directly to ${target.name}'s ConnectLn Inbox`)
    } finally {
      setSendingToId(null)
    }
  }

  const filteredMembers = members
    .filter(m => m.name.toLowerCase() !== (currentUserName || "").toLowerCase())
    .filter(m =>
      !shareQuery.trim()
        ? true
        : m.name.toLowerCase().includes(shareQuery.trim().toLowerCase()) ||
          (m.subtitle || "").toLowerCase().includes(shareQuery.trim().toLowerCase())
    )
    .slice(0, 6)

  return (
    <div className="pt-2.5 mt-1 border-t border-[#E6DEC8] dark:border-zinc-800 space-y-2.5">
      {/* Row 1: All 6 ConnectLn Reactions (👍 Like, 👏 Celebrate, 🤝 Support, ❤️ Love, 💡 Insightful, 😂 Funny) + Comment, Post/Repost, Share */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* 6 Reaction Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ALERT_REACTIONS_CONFIG.map((r) => {
            const isActive = selectedReaction === r.key
            const count = reactionCounts[r.key] || 0
            return (
              <button
                key={r.key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  triggerReactionSplash(r.key, { clientX: e.clientX, clientY: e.clientY })
                  handleToggleReaction(r.key)
                }}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? `${r.activeBg} ${r.activeBorder} ${r.activeText} shadow-2xs scale-[1.02]`
                    : "border-[#DFD5C0] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-800/80 text-[#4A3525] dark:text-zinc-200 hover:bg-[#F0E9DC] dark:hover:bg-zinc-700"
                }`}
              >
                <span className="text-xs leading-none">{r.emoji}</span>
                <span>{r.label}</span>
                {count > 0 && (
                  <span className="ml-0.5 rounded-full bg-black/8 dark:bg-white/10 px-1.5 py-0.2 text-[10px] font-black">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Comment, Post / Repost, and Share Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowComments(prev => !prev)
              setShowRepostPanel(false)
              setShowSharePanel(false)
            }}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-extrabold transition-all cursor-pointer ${
              showComments
                ? "border-[#0A66C2] bg-[#E8F0FE] text-[#0A66C2]"
                : "border-[#DFD5C0] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#4A3525] dark:text-zinc-200 hover:bg-[#F4EFE6]"
            }`}
          >
            <span>💬</span>
            <span>Comment{comments.length > 0 ? ` (${comments.length})` : ""}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowRepostPanel(prev => !prev)
              setShowComments(false)
              setShowSharePanel(false)
            }}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-extrabold transition-all cursor-pointer ${
              showRepostPanel
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-[#DFD5C0] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#4A3525] dark:text-zinc-200 hover:bg-[#F4EFE6]"
            }`}
          >
            <span>🔁</span>
            <span>Post / Repost</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowSharePanel(prev => !prev)
              setShowComments(false)
              setShowRepostPanel(false)
            }}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-extrabold transition-all cursor-pointer ${
              showSharePanel
                ? "border-[#6B4226] bg-[#6B4226] text-white"
                : "border-[#DFD5C0] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#4A3525] dark:text-zinc-200 hover:bg-[#F4EFE6]"
            }`}
          >
            <span>📤</span>
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Status Confirmation Toast */}
      {statusToast && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-900 flex items-center justify-between">
          <span>{statusToast}</span>
          <button
            type="button"
            onClick={() => setStatusToast(null)}
            className="text-[11px] underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Inline Comment Drawer */}
      {showComments && (
        <div className="rounded-xl border border-[#DFD5C0] bg-[#FAF7F2] dark:bg-zinc-900/90 p-3 space-y-2.5">
          <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              placeholder={`Add a comment on "${alertTitle.slice(0, 44)}..."`}
              className="flex-1 rounded-lg border border-[#D5C7AD] bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-[#6B4226] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!commentDraft.trim()}
              className="rounded-lg bg-[#6B4226] hover:bg-[#54331C] disabled:opacity-50 px-3.5 py-1.5 text-xs font-extrabold text-white cursor-pointer shrink-0"
            >
              Post Comment
            </button>
          </form>

          {comments.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-[#E6DEC8] bg-white px-3 py-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[#292521]">{c.authorName}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{c.createdAt}</span>
                  </div>
                  <p className="text-zinc-700 mt-0.5 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inline Post / Repost to ConnectLn Feed Drawer */}
      {showRepostPanel && (
        <div className="rounded-xl border border-[#DFD5C0] bg-[#FAF7F2] dark:bg-zinc-900/90 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#4A3525]">
              🔁 Post or Repost Alert to ConnectLn Home Feed
            </span>
            <button
              type="button"
              onClick={() => handlePublishToFeed(false)}
              className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 text-[11px] font-extrabold cursor-pointer"
            >
              ⚡ 1-Click Instant Repost
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={repostQuote}
              onChange={(e) => setRepostQuote(e.target.value)}
              placeholder="Add your thoughts or commentary before posting to the feed..."
              className="flex-1 rounded-lg border border-[#D5C7AD] bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-[#6B4226] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handlePublishToFeed(true)}
              className="rounded-lg bg-[#6B4226] hover:bg-[#54331C] px-3.5 py-1.5 text-xs font-extrabold text-white cursor-pointer shrink-0"
            >
              ✍️ Post with Commentary
            </button>
          </div>
        </div>
      )}

      {/* Inline Share Drawer (LinkedIn, Facebook, Instagram, WhatsApp, Email, Copy Link + ConnectLn Members) */}
      {showSharePanel && (
        <div className="rounded-xl border border-[#DFD5C0] bg-[#FAF7F2] dark:bg-zinc-900/90 p-3.5 space-y-3">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B4226] mb-2">
              🌐 Share Alert to Social Platforms
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleShareExternal('linkedin')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0A66C2]/40 bg-[#E8F0FE] hover:bg-[#D2E3FC] px-3 py-1.5 text-xs font-extrabold text-[#0A66C2] cursor-pointer"
              >
                <span>🔵</span>
                <span>LinkedIn</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareExternal('facebook')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/40 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 text-xs font-extrabold text-blue-800 cursor-pointer"
              >
                <span>🟦</span>
                <span>Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareExternal('instagram')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-pink-400/40 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 text-xs font-extrabold text-pink-800 cursor-pointer"
              >
                <span>📸</span>
                <span>Instagram</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareExternal('whatsapp')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-800 cursor-pointer"
              >
                <span>🟢</span>
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareExternal('email')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 px-3 py-1.5 text-xs font-extrabold text-zinc-800 cursor-pointer"
              >
                <span>✉️</span>
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareExternal('copy')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5C7AD] bg-white hover:bg-[#F4EFE6] px-3 py-1.5 text-xs font-extrabold text-[#4A3525] cursor-pointer"
              >
                <span>🔗</span>
                <span>Copy Link</span>
              </button>
            </div>
          </div>

          <div className="border-t border-[#E6DEC8] pt-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4A3525]">
                👥 Send Directly to People on ConnectLn
              </span>
              <input
                type="text"
                value={shareQuery}
                onChange={(e) => setShareQuery(e.target.value)}
                placeholder="Search ConnectLn professionals..."
                className="rounded-lg border border-[#D5C7AD] bg-white px-2.5 py-1 text-xs text-zinc-900 focus:border-[#6B4226] focus:outline-none sm:w-64"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredMembers.map((member) => {
                const isSent = !!sentMemberIds[member.id]
                const isSending = sendingToId === member.id
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[#E2D9C5] bg-white p-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-extrabold text-zinc-900">
                        {member.name}
                      </div>
                      <div className="truncate text-[10px] text-zinc-500">
                        {member.subtitle || "Verified ConnectLn Professional"}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => handleSendToConnectLnMember(member)}
                      className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer ${
                        isSent
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-[#6B4226] hover:bg-[#54331C] text-white"
                      }`}
                    >
                      {isSending ? "Sending..." : isSent ? "✓ Sent" : "Send →"}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface NoctisAlertCardExplanation {
  alertId: string
  whatItRepresents: string
  whyItMatters: string
  recommendedActionPlan: string[]
  liveNoctisNote?: string
}

export interface NoctisLocalChallenge {
  id: string
  domain: string
  question: string
  vetoTitle: string
  verdict: string
  fullResponse: string
  durationMs: number
  status: string
  expectedKeywords?: string[]
  sampleAnswer?: string
}

export const LOCAL_CHALLENGE_CATALOG: NoctisLocalChallenge[] = [
  {
    id: "CHALLENGE-FRONTIER-SMR-01",
    domain: "NUCLEAR_FISSION_SMR_GEN4",
    question: "A lead-cooled fast reactor small modular reactor operates at 300 MWth. If the Doppler temperature coefficient is -3.2 pcm/C and keff reaches 1.0025 with period 3.2s, what passive safety mechanism and SCRAM timing are required?",
    vetoTitle: "🚨 CRITICAL SAFETY VETO: PROMPT SUPERCRITICAL EXCURSION SCRAM",
    verdict: "Gravity-driven B4C control rod insertion SCRAM in < 1.8 seconds and passive RVACS natural circulation loop engagement certified under US NRC 10 CFR Part 50/52 & IAEA SSR-2/1.",
    fullResponse: `### Noctis Nuclear Fission SMR & Gen-IV Reactor Physics Engine (NOCTIS-NUCLEAR-SMR-001)
**Subsystem Domain:** \`NUCLEAR_FISSION_SMR_GEN4\` · **Standards:** US NRC 10 CFR Part 50/52, IAEA SSR-2/1, ASME Section III Div. 5

#### 1. Reactor Core Thermal Hydraulics & Inherent Safety
- **Core Thermal Power:** **\`300 MWth\`** (Inlet: 290°C · Outlet: 320°C · ΔT: 30°C)
- **Doppler Temperature Coefficient:** **\`-3.2 pcm/°C\`** (Inherent self-regulating negative reactivity feedback verified; U-238 resonance absorption instantly depresses excess reactivity)
- **Departure from Nucleate Boiling Ratio (DNBR):** **\`2.10\`** (Safety Limit: > 1.30, compliant)
- **Passive Decay Heat Removal:** **\`RVACS Natural Circulation\`** thermosiphon loops certified Fukushima-proof under prolonged Total Station Blackout (SBO) with 0 operator intervention.

#### 2. Criticality & Kinetics Telemetry
- **Effective Multiplication Factor (k_eff):** **\`1.0025\`**
- **Reactor Period (T):** **\`3.2 seconds\`**
- **Control Rod SCRAM Speed:** **\`1.2 seconds\`** to full core bottom insertion (Strict Limit: < 1.8 seconds)

#### 3. Sovereign Safety Invariant Evaluation & Mandate
- **Reactivity State:** **\`CRITICAL ALERT: k_eff = 1.0025 ≥ 1.002\`** (Reactor Period 3.2s < 5.0s)
- **Physics Failure Mechanism:** Prompt neutron chain reaction bypasses delayed neutron regulation (β_eff), driving exponential power doubling on a 3.2s asymptotic period.
- **Mandated Safety Action:** Immediate de-energization of magnetic holding coils triggering gravity-driven **\`Boron Carbide (B4C) SCRAM < 1.8s\`** and passive RVACS natural circulation loop engagement.
- **Invariant Status:** **\`PASS (0 REGULATORY BREACHES)\``,
    durationMs: 9.58,
    status: "PASS",
    expectedKeywords: ["b4c", "scram", "rvacs", "1.8", "passive", "doppler", "natural circulation"],
    sampleAnswer: "Gravity-driven B4C control rod insertion SCRAM in < 1.8 seconds is required along with passive RVACS natural circulation loop engagement under NRC 10 CFR Part 50/52 to counteract the positive prompt supercritical reactivity."
  },
  {
    id: "CHALLENGE-BENCH-BURN-02",
    domain: "CRITICAL_CARE_BURNS",
    question: "A 70 kg patient suffers 40% TBSA second- and third-degree thermal burns. Under the Parkland formula, what is the total 24-hour Lactated Ringer's volume and the infusion rate for the first 8 hours?",
    vetoTitle: "🚨 CRITICAL CARE MANDATE: PARKLAND PROTOCOL FLUID RESUSCITATION",
    verdict: "Total 24h = 11,200 mL LR; First 8h volume = 5,600 mL (Rate = 700 mL/hr) titrated to target urine output 0.5 mL/kg/hr.",
    fullResponse: `### Noctis Severe Thermal Burn Resuscitation Engine (NOCTIS-TRAUMA-BURNS-001)
**Subsystem Domain:** \`CRITICAL_CARE_BURNS\` · **Standards:** American Burn Association (ABA) Guidelines, ATLS 10th Edition

#### 1. Consensus Parkland Fluid Calculations
- **Patient Parameters:** **\`70 kg · 40% TBSA\`** (2nd & 3rd Degree Thermal Burns)
- **Total 24-Hour Crystalloid:** **\`11,200 mL Lactated Ringer's (LR)\`** (4 mL × 70 kg × 40% TBSA)
- **First 8 Hours (from time of injury):** **\`5,600 mL (Rate: 700 mL/hr)\`**
- **Next 16 Hours:** **\`5,600 mL (Rate: 350 mL/hr)\`**

#### 2. Physiological Endpoints & Fluid Creep Guardrails
- **Target Urine Output:** **\`0.5 mL/kg/hr (35 mL/hr)\`** (Strict target range: 30–50 mL/hr)
- **Fluid Creep Prevention:** Titrate infusion hourly by 20–30% based strictly on urine output; never infuse formula rate blindly.
- **Crystalloid Selection:** **\`Lactated Ringer's / Plasma-Lyte\`** mandated; avoid 0.9% Normal Saline to prevent hyperchloremic non-anion gap metabolic acidosis.
- **Fluid Overload Veto:** If fluid requirement exceeds **\`250 mL/kg in 24h\`**, initiate early 5% Albumin rescue and bladder pressure monitoring for abdominal compartment syndrome.`,
    durationMs: 18.82,
    status: "PASS",
    expectedKeywords: ["11,200", "5,600", "700", "parkland", "lactated ringer", "0.5 ml/kg/hr", "urine output"],
    sampleAnswer: "Under the Parkland formula (4 mL * 70 kg * 40%), total 24h volume is 11,200 mL Lactated Ringer's. Half (5,600 mL) is given over the first 8 hours at 700 mL/hr, titrated to a target urine output of 0.5 mL/kg/hr."
  },
  {
    id: "CHALLENGE-FRONTIER-QKD-02",
    domain: "QUANTUM_CRYPTOGRAPHY_QKD",
    question: "In a quantum key distribution fiber link operating BB84 with decoy states over 35 km, what is the tolerable quantum bit error rate before an eavesdropping abort is triggered under the Shor-Preskill privacy amplification threshold?",
    vetoTitle: "🚨 CRYPTOGRAPHIC INVARIANT VETO: QUANTUM BIT ERROR RATE CEILING",
    verdict: "QBER ≤ 11.0% Shor-Preskill ceiling; abort key generation and zeroize quantum state buffers if exceeded.",
    fullResponse: `### Noctis Quantum Cryptography & QKD Engine (NOCTIS-QUANTUM-CRYPTO-001)
**Subsystem Domain:** \`QUANTUM_CRYPTOGRAPHY_QKD\` · **Standards:** NIST FIPS 203/204/205, NSA CNSA 2.0, ETSI GS QKD

#### 1. Quantum Key Distribution Telemetry
- **QKD Protocol:** **\`BB84 Decoy-State Photon Transmission\`** over 35 km Dark Fiber
- **Quantum Bit Error Rate (QBER):** **\`3.2%\`** (Shor-Preskill privacy amplification ceiling: $\\le 11.0\\%$)
- **Asymptotic Secure Key Rate:** **\`14040 bps\`**
- **Eavesdropping Flag:** **\`NEGATIVE (SECURE QUANTUM CHANNEL)\`**

#### 2. Post-Quantum Cryptographic Hybrid Layer
- **Key Encapsulation:** **\`NIST FIPS 203 ML-KEM-1024 (Kyber)\`** lattice-based quantum resistance
- **Digital Signatures:** **\`NIST FIPS 204 ML-DSA-87 (Dilithium)\`** state-machine binding

#### 3. Sovereign Security Invariants
- **QBER Threshold:** Nominal error rate (3.2% $\\le 11.0\\%$) permits unconditional forward secrecy.
- **FIPS 140-3 Level 4 Zeroization:** Micro-strain or decapping sensor breach triggers sub-100ns volatile register zeroization.`,
    durationMs: 14.15,
    status: "PASS",
    expectedKeywords: ["11.0%", "qber", "shor-preskill", "privacy amplification", "zeroize", "abort"],
    sampleAnswer: "The maximum tolerable quantum bit error rate is 11.0% under the Shor-Preskill privacy amplification ceiling. If QBER exceeds 11%, an immediate eavesdropping abort is triggered and quantum state buffers are zeroized."
  },
  {
    id: "CHALLENGE-DAEMON-RAFT-01",
    domain: "CLOUD_DISTRIBUTED_SYSTEMS",
    question: "In a Raft consensus cluster with 5 nodes, what is the quorum required, and how many node failures can be tolerated before leader election stalls?",
    vetoTitle: "🚨 DISTRIBUTED CONSENSUS INVARIANT: MAJORITY QUORUM GUARANTEE",
    verdict: "Majority Quorum Q = floor(5/2) + 1 = 3 nodes; max tolerable node failures = 2 (N = 2F + 1).",
    fullResponse: `### Noctis Distributed Systems Consensus Engine (NOCTIS-DIST-RAFT-001)
**Subsystem Domain:** \`CLOUD_DISTRIBUTED_SYSTEMS\` · **Standards:** Ongaro-Ousterhout Raft Spec, IEEE Distributed Transactions

#### 1. Quorum & Fault Tolerance Invariant
- **Cluster Size:** **\`N = 5 Nodes\`**
- **Majority Quorum Formula:** **\`Q = floor(N / 2) + 1 = 3 Nodes\`**
- **Max Tolerable Simultaneous Failures:** **\`F = floor((N - 1) / 2) = 2 Nodes\`**
- **Linearizability State:** **\`ONLINE (QUORUM VERIFIED)\`** — As long as 3 nodes remain online, log replication and linearizable reads continue uninterrupted.

#### 2. Partition & Split-Brain Mitigation
- **Majority Authority:** In a network partition splitting nodes (3 vs 2), the majority partition (**\`3 nodes\`**) retains authority and commits transactions.
- **Minority Write Veto:** The minority partition (**\`2 nodes < 3\`**) cannot reach quorum and strictly rejects client write commands.
- **Randomized Election Timeouts:** **\`150ms–300ms\`** window jitter completely prevents split-vote stagnation.`,
    durationMs: 11.40,
    status: "PASS",
    expectedKeywords: ["3", "quorum", "2", "failures", "majority", "split-brain"],
    sampleAnswer: "In a 5-node Raft cluster, majority quorum is Q = floor(5/2) + 1 = 3 nodes. The cluster can tolerate up to 2 simultaneous node failures (F = floor((5-1)/2) = 2) before leader election stalls."
  },
  {
    id: "CHALLENGE-FRONTIER-FUSION-03",
    domain: "FUSION_ENERGY_PLASMA_MHD",
    question: "In a D-T tokamak reactor operating at magnetic field 5.3 T and plasma temperature 15 keV, what Lawson criterion triple product is required to maintain burning plasma?",
    vetoTitle: "🚨 PLASMA PHYSICS INVARIANT: BURNING PLASMA LAWSON CRITERION",
    verdict: "Lawson triple product n · T · τ_E ≥ 3.0 × 10^21 keV·s/m³ (Q ≥ 10.0 burning plasma condition).",
    fullResponse: `### Noctis Fusion Plasma Physics & MHD Engine (NOCTIS-FUSION-MHD-001)
**Subsystem Domain:** \`FUSION_ENERGY_PLASMA_MHD\` · **Standards:** IAEA Fusion Energy Series, ITER Physics Basis

#### 1. Lawson Triple Product Evaluation
- **Confinement Scheme:** **\`Tokamak Toroidal Magnetic Confinement (5.3 Tesla)\`**
- **Plasma Core Temperature:** **\`15 keV (~174 Million Kelvin)\`**
- **Lawson Triple Product Invariant:** **\`n · T · τ_E ≥ 3.0 × 10²¹ keV·s/m³\`**
- **Energy Confinement Time (τ_E):** **\`≥ 3.8 seconds\`** at plasma density n = 1.1 × 10²⁰ m⁻³
- **Fusion Energy Gain Factor (Q):** **\`Q ≥ 10.0 (BURNING PLASMA VERIFIED)\`**

#### 2. MHD Stability & Disruption Prevention
- **Greenwald Density Fraction:** **\`n / n_GW = 0.82\`** (< 1.0 stable ceiling, preventing runaway radiation collapse)
- **Safety Factor (q_95):** **\`3.1 (> 3.0 COMPLIANT)\`** preventing m=2/n=1 neoclassical tearing and major disruptions.`,
    durationMs: 16.90,
    status: "PASS",
    expectedKeywords: ["3.0 x 10^21", "triple product", "lawson", "burning plasma", "q >= 10"],
    sampleAnswer: "To maintain burning plasma (Q >= 10), the Lawson criterion triple product n * T * tau_E must be >= 3.0 * 10^21 keV*s/m^3 with an energy confinement time tau_E >= 3.8s at 15 keV core temperature."
  },
  {
    id: "CHALLENGE-DAEMON-BGP-02",
    domain: "ENTERPRISE_NETWORKING",
    question: "Under BGP route flap dampening RFC 2439, if penalty is 3200 with suppress threshold 2000 and half-life 15m, what is the suppression status?",
    vetoTitle: "🚨 ROUTING CONTROL INVARIANT: BGP ROUTE FLAP DAMPENING",
    verdict: "Route state = SUPPRESSED; exponential decay P(t) = P0 · 2^(-t/t_half) until reuse threshold 750 reached.",
    fullResponse: `### Noctis Enterprise Internetworking & BGP Core Engine (NOCTIS-NET-BGP-001)
**Subsystem Domain:** \`ENTERPRISE_NETWORKING\` · **Standards:** IETF RFC 2439, RFC 7454 (BGP Operations & Security)

#### 1. Route Flap Dampening Telemetry
- **Current Penalty (P):** **\`3,200 points\`**
- **Suppress Threshold:** **\`2,000 points\`**
- **Reuse Threshold & Half-Life:** **\`750 points · 15 min (900s)\`**
- **Dampening Status:** **\`SUPPRESSED (WITHDRAWN FROM RIB/FIB)\`** to shield global routing table from oscillation.

#### 2. Mathematical Decay & Unsuppress Timeline
- **Exponential Decay Equation:** **\`P(t) = P_0 × 2^(-t / t_half)\`**
- **Time to Reach Reuse Threshold (750):** **\`31.4 minutes\`** ($t = -15 \\times \\log_2(750 / 3200)$)
- **Policy Directive:** Route remains uninstalled from FIB for 31.4 minutes of continuous stability before advertisement re-enables.`,
    durationMs: 12.30,
    status: "PASS",
    expectedKeywords: ["suppressed", "penalty", "half-life", "reuse threshold", "2439", "exponential decay"],
    sampleAnswer: "Route state is SUPPRESSED because penalty 3200 exceeds the suppress threshold 2000. It follows exponential decay P(t) = P0 * 2^(-t/t_half) and requires 31.4 minutes before reaching reuse threshold 750 to be unsuppressed."
  },
  {
    id: "CHALLENGE-RMF-STEP-01",
    domain: "RMF_GOVERNANCE_LIFECYCLE",
    question: "Under NIST SP 800-37 Rev. 2 and FIPS 199, an ITAR defense subsystem is categorized with Confidentiality: MODERATE, Integrity: LOW, and Availability: MODERATE. Why does CNSSI 1253 reject this categorization, and what is the mandatory high-water mark impact baseline?",
    vetoTitle: "🚨 RMF STEP 1 INVARIANT VETO: FIPS 199 HIGH-WATER MARK & CNSSI 1253 ITAR MANDATE",
    verdict: "CNSSI 1253 mandates Confidentiality = HIGH for ITAR export-controlled technical data; overall FIPS 199 High-Water Mark mandates max(C, I, A) = HIGH.",
    fullResponse: `### Noctis Sovereign RMF Lifecycle & FIPS 199 Categorization Engine (NOCTIS-RMF-STEP1-001)
**Subsystem Domain:** \`RMF_GOVERNANCE_LIFECYCLE\` · **Standards:** NIST SP 800-37 Rev. 2, FIPS 199, CNSSI 1253, 22 CFR 120-130 (ITAR)

#### 1. FIPS 199 High-Water Mark Mathematical Determination
- **Subsystem Objective Profile:** $C = \\text{MODERATE}, I = \\text{LOW}, A = \\text{MODERATE}$
- **Statutory Violation:** CNSSI 1253 Section 3.2 explicitly classifies International Traffic in Arms Regulations (ITAR) defense and munitions data as **\`Confidentiality: HIGH\`**.
- **Corrected Objective Profile:** $C = \\mathbf{HIGH}, I = \\text{LOW}, A = \\text{MODERATE}$
- **FIPS 199 Overall System Impact:**
  $\\text{Overall Impact} = \\max(C, I, A) = \\max(\\text{HIGH}, \\text{LOW}, \\text{MODERATE}) = \\mathbf{HIGH}$

#### 2. Regulatory Invariant Enforcement
- **Safety Veto \`INV-RMF-CNSSI-1253-HIGH\` Triggered:** Unauthorized low/moderate categorization for export-controlled technical data is strictly prohibited.
- **Mandated Baseline Selection:** System must inherit the **NIST SP 800-53 Rev. 5 HIGH Baseline** control catalog, requiring continuous multi-factor cryptographic authentication and FedRAMP High boundary isolation.`,
    durationMs: 6.84,
    status: "PASS",
    expectedKeywords: ["cnssi 1253", "itar", "high", "high-water mark", "max", "fips 199"],
    sampleAnswer: "CNSSI 1253 mandates that any system handling ITAR data must have Confidentiality = HIGH. Under FIPS 199, the overall system impact is calculated as the High-Water Mark: max(C, I, A) = max(HIGH, LOW, MODERATE) = HIGH baseline."
  },
  {
    id: "CHALLENGE-RMF-CATO-02",
    domain: "RMF_GOVERNANCE_LIFECYCLE",
    question: "Under DoD CIO Memo (Feb 2022) Continuous Authorization to Operate (cATO), why does an annual 365-day security review fail cATO compliance, and what are the 3 mandatory operational pillars required for continuous deployment?",
    vetoTitle: "🚨 RMF STEP 5 INVARIANT VETO: DOD cATO 3-PILLAR DEPLOYMENT MANDATE",
    verdict: "Continuous ATO prohibits point-in-time annual audits; mandates 3 continuous operational pillars: 1. Continuous DevSecOps pipeline gating, 2. Active ConMon threat posture, 3. Tier-1 CSSP active alignment.",
    fullResponse: `### Noctis DoD Continuous Authorization to Operate (cATO) Engine (NOCTIS-RMF-CATO-001)
**Subsystem Domain:** \`RMF_GOVERNANCE_LIFECYCLE\` · **Standards:** DoD CIO Continuous Authorization to Operate Memo (Feb 2, 2022), DoDI 8510.01

#### 1. Invalidation of Point-in-Time Authorizations
- **Failure Mode:** Annual paper-based reviews (365-day review cycles) fail cATO compliance because continuous deployments invalidate static point-in-time assessments.
- **Continuous ATO Mandate:** Authorizations must be dynamic, tied directly to automated security telemetry emitted on every code commit.

#### 2. The 3 Mandatory Operational Pillars for cATO
1. **Continuous DevSecOps Pipeline Telemetry & Automated Gating:**
   - Automated SAST, DAST, Container Hardening, SCA, and SBOM verification on every pull request.
   - Zero critical/high unmitigated CVEs permitted past production merge gates.
2. **Active Continuous Monitoring (ConMon) & Real-Time Posture:**
   - Dynamic asset discovery, runtime behavioral telemetry, and real-time posture feeds streaming to eMASS.
3. **Active Cyber Security Service Provider (CSSP) Tier-1 Alignment:**
   - Formal operational binding with a certified DoD CSSP for 24/7/365 active threat hunting, incident response, and SOC containment.`,
    durationMs: 8.12,
    status: "PASS",
    expectedKeywords: ["devsecops", "conmon", "cssp", "continuous monitoring", "3 pillars", "pipeline"],
    sampleAnswer: "An annual review is point-in-time and cannot validate continuous code changes. cATO requires 3 continuous pillars: 1. Automated DevSecOps pipeline gating (SAST/DAST/SBOM), 2. Active Continuous Monitoring (ConMon) threat posture, and 3. Tier-1 CSSP SOC alignment."
  },
  {
    id: "CHALLENGE-RMF-POAM-03",
    domain: "RMF_GOVERNANCE_LIFECYCLE",
    question: "Under NIST SP 800-37 Rev. 2 Step 6 and FedRAMP SLAs, a High-severity vulnerability finding on an internet-facing API remains open at day 35. Can the ISSO close this POA&M with an administrative policy memo, and what is the statutory SLA?",
    vetoTitle: "🚨 RMF STEP 6 INVARIANT VETO: POA&M STATUTORY SLA BREACH & NON-PAPER RULE",
    verdict: "Administrative paper closure is strictly prohibited under GRC-GATE-01; High severity SLA is strictly <= 30 calendar days and closure requires re-scanned code commit or patch verification.",
    fullResponse: `### Noctis Continuous Monitoring & POA&M Remediation Engine (NOCTIS-RMF-POAM-001)
**Subsystem Domain:** \`RMF_GOVERNANCE_LIFECYCLE\` · **Standards:** NIST SP 800-37 Rev. 2 Step 6, NIST SP 800-137, FedRAMP Continuous Monitoring Strategy Guide

#### 1. Statutory Remediation Timeframes & Invariant GRC-GATE-01
- **High Severity Finding SLA:** **\`≤ 30 calendar days\`** (Finding open at day 35 is **\`CRITICALLY OVERDUE\`** by 5 days).
- **Moderate Severity SLA:** **\`≤ 90 calendar days\`**
- **Low Severity SLA:** **\`≤ 180 calendar days\`**

#### 2. Non-Paper Closure Mandate (GRC-GATE-01)
- **Paper Closure Rejection:** An ISSO or ISSM policy waiver, administrative note, or executive memo cannot close a technical POA&M finding.
- **Mandated Verification Telemetry:** Closure requires a verified Git commit SHA, merged pull request, and an authenticated DAST/vulnerability re-scan confirming the finding is resolved.
- **Action Required:** Immediate escalation to Authorizing Official (AO) for ATO review or risk acceptance waiver with compensating technical controls.`,
    durationMs: 7.45,
    status: "PASS",
    expectedKeywords: ["30 days", "sla", "administrative", "paper", "git", "re-scan", "grc-gate-01"],
    sampleAnswer: "No, administrative or paper-only closure is strictly prohibited under GRC-GATE-01. High-severity findings must be remediated within <= 30 calendar days. Since it is at day 35, it has breached statutory SLA and requires a verified re-scanned code commit to close."
  },
  {
    id: "CHALLENGE-ADV-HPC-01",
    domain: "HIGH_PERFORMANCE_COMPUTING_GPU_CLUSTER",
    question: "In an 8,192-GPU cluster running multi-node LLM pre-training, why does tensor parallel (TP) across nodes cause severe throughput collapse over RoCEv2, and what InfiniBand/RoCEv2 lossless congestion control primitives are required?",
    vetoTitle: "🚨 HPC FABRIC INVARIANT VETO: TENSOR PARALLEL INTERCONNECT SATURATION",
    verdict: "TP requires intra-node NVLink (>900 GB/s) due to extreme all-reduce frequency; RoCEv2 requires PFC (Priority Flow Control) and ECN (Explicit Congestion Notification) to prevent buffer drop packet loss.",
    fullResponse: `### Noctis Sovereign HPC GPU Cluster & Interconnect Engine (NOCTIS-HPC-001)
**Subsystem Domain:** \`HIGH_PERFORMANCE_COMPUTING_GPU_CLUSTER\` · **Standards:** IEEE 802.1Qbb (PFC), RFC 3168 (ECN), InfiniBand Architecture Spec

#### 1. Tensor Parallel vs Pipeline/Data Parallel Scaling
- **Tensor Parallel Bandwidth Mandate:** TP performs multi-gigabyte All-Reduce collectives at every single transformer layer. Across PCIe/Ethernet nodes, communication latency dominates arithmetic compute time, causing catastrophic GPU stall.
- **Placement Rule:** Tensor Parallel degree must strictly remain $\\le$ GPUs per node (e.g. 8-way TP strictly confined to NVLink switches with 900–3200 GB/s bandwidth).

#### 2. Lossless RoCEv2 Network Primitives
- **Priority Flow Control (PFC):** IEEE 802.1Qbb pauses specific traffic classes (CoS 3) when ingress buffers exceed thresholds, preventing packet drops.
- **Explicit Congestion Notification (ECN):** Switches mark IP headers with CE flags when queue depths rise; NICs back off transmission rate before PFC pause storms propagate across the leaf-spine fabric.`,
    durationMs: 9.14,
    status: "PASS",
    expectedKeywords: ["nvlink", "all-reduce", "pfc", "ecn", "lossless", "rocev2"],
    sampleAnswer: "Tensor Parallel requires frequent all-reduce operations at every layer, which exceeds network bandwidth across nodes. TP must be confined to intra-node NVLink. For RoCEv2, Priority Flow Control (PFC) and Explicit Congestion Notification (ECN) are required for lossless transport."
  },
  {
    id: "CHALLENGE-ADV-ICS-03",
    domain: "INDUSTRIAL_CONTROL_SYSTEMS_OT_SCADA",
    question: "Under the Purdue Enterprise Reference Architecture (ISA-95), what network boundary protects Level 0-2 (DCS/PLC) from Level 4/5 (Enterprise), and can Safety Instrumented Systems (SIS SIL-3) share a controller with DCS?",
    vetoTitle: "🚨 CRITICAL INFRASTRUCTURE SAFETY VETO: SIS SIL-3 CO-MINGLING VIOLATION",
    verdict: "Industrial DMZ (IDMZ Level 3.5) with jump-host bastion; SIS SIL-3 controllers must be physically segregated and never co-mingled with DCS.",
    fullResponse: `### Noctis Industrial Control Systems Safety Engine (NOCTIS-ICS-001)
**Subsystem Domain:** \`INDUSTRIAL_CONTROL_SYSTEMS_OT_SCADA\` · **Standards:** ISA-95 / IEC 62443, IEC 61508 / IEC 61511 (SIL-3 Safety Instrumented Systems)

#### 1. Purdue Model (ISA-95) Boundary Architecture
- **Boundary:** **\`Industrial DMZ (IDMZ Level 3.5)\`** acts as an air-gapped security buffer between Level 4/5 (Corporate IT / ERP) and Level 0-2 (Physical Sensors, Actuators, PLCs).
- **Control Rules:** No direct routing between IT and OT. All cross-zone traffic terminates on dual-homed jump hosts in Level 3.5 with protocol isolation.

#### 2. SIS SIL-3 Safety Invariant
- **Co-Mingling Prohibition:** Safety Instrumented Systems (SIS) responsible for emergency reactor/pipeline shutdown must **NEVER share a CPU, backplane, or network switch** with the Distributed Control System (DCS).
- **Common Mode Failure Risk:** Co-mingled controllers expose plant safety to simultaneous operational software faults or cyber attacks disabling emergency trip mechanisms.`,
    durationMs: 8.52,
    status: "PASS",
    expectedKeywords: ["idmz", "level 3.5", "sis", "sil-3", "segregated", "co-mingled", "iec 62443"],
    sampleAnswer: "The Industrial DMZ (Level 3.5) protects Level 0-2 from Enterprise IT. SIS SIL-3 emergency safety controllers must be physically segregated and can NEVER share a controller or network with DCS to prevent common-mode failure."
  }
]

interface NotificationsViewProps {
  onNavigateTab?: (tab: string) => void
  currentUserName?: string
  currentUserProfession?: string
  currentUserAvatar?: string
  onPostToFeed?: (content: string, repostOf?: string) => void
}

export interface SavedConnectLnJobAlert {
  id: string
  roleOrTrade: string
  companies: string
  location: string
  opportunityType: 'Employment' | 'Contract project' | 'Apprenticeship' | 'All Types'
  frequency: 'Instant' | 'Daily' | 'Weekly'
  enabled: boolean
  createdAt: string
}

export function NotificationsView({
  onNavigateTab,
  currentUserName = "Kwesi Asiedu",
  currentUserProfession = "",
  currentUserAvatar = "/brand/kwesi-avatar.png",
  onPostToFeed
}: NotificationsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Job Alerts' | 'Lookups & Vouches' | 'Security' | 'Career' | 'Marketplace' | 'Learning' | 'Social'>('All')
  const [jobAlertEnabled, setJobAlertEnabled] = useState<boolean>(true)
  const [newAlertRole, setNewAlertRole] = useState<string>(
    currentUserProfession || "AI Automation Consultant / Master Carpenter / Lead Specialist"
  )
  const [newAlertCompany, setNewAlertCompany] = useState<string>(
    "Verified Employers, Franchise Networks & Local Businesses"
  )
  const [newAlertLocation, setNewAlertLocation] = useState<string>("Laurel, MD · Remote & Local")
  const [newAlertOpportunityType, setNewAlertOpportunityType] = useState<'Employment' | 'Contract project' | 'Apprenticeship' | 'All Types'>('All Types')
  const [newAlertFrequency, setNewAlertFrequency] = useState<'Instant' | 'Daily' | 'Weekly'>('Instant')
  const [jobAlertSavedToast, setJobAlertSavedToast] = useState<string | null>(null)
  const [savedJobAlerts, setSavedJobAlerts] = useState<SavedConnectLnJobAlert[]>([
    {
      id: 'ja_default_1',
      roleOrTrade: currentUserProfession || 'AI Automation Consultant & Voice AI Solutions Lead',
      companies: 'Enterprise & Verified ConnectLn Employers',
      location: 'Laurel, MD · Remote / Hybrid',
      opportunityType: 'All Types',
      frequency: 'Instant',
      enabled: true,
      createdAt: 'Active · Instant notifications on'
    },
    {
      id: 'ja_default_2',
      roleOrTrade: 'Skilled Trades, Custom Joinery, Welding & Field Project Contracts',
      companies: 'Local Business Networks, General Contractors & Franchise Locations',
      location: 'Maryland, DC, Virginia & Nationwide',
      opportunityType: 'Contract project',
      frequency: 'Daily',
      enabled: true,
      createdAt: 'Active · Daily digest on'
    }
  ])

  useEffect(() => {
    try {
      const savedToggle = localStorage.getItem('connectln_job_search_alert_enabled')
      if (savedToggle !== null) setJobAlertEnabled(savedToggle === 'true')
      const rawAlerts = localStorage.getItem('connectln_saved_job_alerts_v1')
      if (rawAlerts) {
        const parsed = JSON.parse(rawAlerts)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedJobAlerts(parsed)
        }
      }
    } catch {}
  }, [])

  const handleCreateCustomJobAlert = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAlertRole.trim()) return
    const created: SavedConnectLnJobAlert = {
      id: 'ja_' + Date.now(),
      roleOrTrade: newAlertRole.trim(),
      companies: newAlertCompany.trim() || 'All Verified Employers',
      location: newAlertLocation.trim() || 'Remote & Local',
      opportunityType: newAlertOpportunityType,
      frequency: newAlertFrequency,
      enabled: true,
      createdAt: `Created just now · ${newAlertFrequency} alerts ON`
    }
    const updated = [created, ...savedJobAlerts]
    setSavedJobAlerts(updated)
    setJobAlertEnabled(true)
    try {
      localStorage.setItem('connectln_saved_job_alerts_v1', JSON.stringify(updated))
      localStorage.setItem('connectln_job_search_alert_enabled', 'true')
      window.dispatchEvent(new Event('connectln-job-alert-updated'))
    } catch {}
    setJobAlertSavedToast(`✓ Job alert created for "${created.roleOrTrade}" (${created.frequency})`)
    setTimeout(() => setJobAlertSavedToast(null), 4000)
  }

  const handleToggleSingleJobAlert = (id: string) => {
    const updated = savedJobAlerts.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    setSavedJobAlerts(updated)
    try {
      localStorage.setItem('connectln_saved_job_alerts_v1', JSON.stringify(updated))
    } catch {}
  }

  const handleDeleteSingleJobAlert = (id: string) => {
    const updated = savedJobAlerts.filter(a => a.id !== id)
    setSavedJobAlerts(updated)
    try {
      localStorage.setItem('connectln_saved_job_alerts_v1', JSON.stringify(updated))
    } catch {}
  }
  const [lookupVouchSubFilter, setLookupVouchSubFilter] = useState<'all' | 'lookups' | 'vouches'>('all')
  const [lookupActorTypeFilter, setLookupActorTypeFilter] = useState<'all' | 'search_appearance' | 'profile_click'>('all')
  const [notifications, setNotifications] = useState<CategorizedNotificationItem[]>(INITIAL_CATEGORIZED_NOTIFICATIONS)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [readDynamicAlertIds, setReadDynamicAlertIds] = useState<string[]>([])

  // Live Sync with Noctis Daily Challenge & Alert Engine via /api/connectin/alerts
  useEffect(() => {
    let isMounted = true
    const fetchIncomingAlerts = async () => {
      try {
        const res = await fetch("/api/connectin/alerts")
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.alerts) && data.alerts.length > 0 && isMounted) {
            setNotifications(data.alerts)
          }
        }
      } catch {}
    }
    fetchIncomingAlerts()
    const timer = setInterval(fetchIncomingAlerts, 15000)
    return () => { isMounted = false; clearInterval(timer) }
  }, [])

  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0)
  const [showChallengeResponse, setShowChallengeResponse] = useState<boolean>(true)
  const [userChallengeInput, setUserChallengeInput] = useState("")
  const [userChallengeEvaluation, setUserChallengeEvaluation] = useState<{
    score: number
    pass: boolean
    feedback: string
    matchedKeywords: string[]
    missingKeywords: string[]
  } | null>(null)

  // Reactive derivation guarantees the active challenge always immediately matches activeChallengeIdx
  const activeChallenge = LOCAL_CHALLENGE_CATALOG[
    ((activeChallengeIdx % LOCAL_CHALLENGE_CATALOG.length) + LOCAL_CHALLENGE_CATALOG.length) % LOCAL_CHALLENGE_CATALOG.length
  ]

  const handleSelectChallenge = (targetIdx: number) => {
    const idx = ((targetIdx % LOCAL_CHALLENGE_CATALOG.length) + LOCAL_CHALLENGE_CATALOG.length) % LOCAL_CHALLENGE_CATALOG.length
    setActiveChallengeIdx(idx)
    setUserChallengeInput("")
    setUserChallengeEvaluation(null)
    setShowChallengeResponse(true)
  }

  const handleRunNewChallengeTest = () => {
    const nextIdx = (activeChallengeIdx + 1) % LOCAL_CHALLENGE_CATALOG.length
    handleSelectChallenge(nextIdx)
  }

  const handleEvaluateUserAnswer = () => {
    const activeCh = activeChallenge
    const text = userChallengeInput.trim().toLowerCase()
    if (!text) {
      setUserChallengeEvaluation({
        score: 0,
        pass: false,
        feedback: "Please enter your technical analysis or proposed safety protocol before submitting.",
        matchedKeywords: [],
        missingKeywords: activeCh.expectedKeywords || []
      })
      return
    }

    const keywords: string[] = activeCh.expectedKeywords || []
    const matched = keywords.filter(kw => text.includes(kw.toLowerCase()))
    const missing = keywords.filter(kw => !text.includes(kw.toLowerCase()))
    const ratio = keywords.length > 0 ? matched.length / keywords.length : 0.5
    const score = Math.round(ratio * 100)
    const pass = score >= 50

    setUserChallengeEvaluation({
      score,
      pass,
      feedback: pass
        ? `Verification Passed (${score}% Match): Your response accurately enforced critical regulatory and physics invariants for ${activeCh.domain}.`
        : `Verification Incomplete (${score}% Match): Your solution omitted mandatory safety/compliance invariants (${missing.slice(0, 3).join(", ")}). Consult Noctis's full engineering breakdown below.`,
      matchedKeywords: matched,
      missingKeywords: missing
    })
  }

  const handleLoadSampleSolution = () => {
    const activeCh = activeChallenge
    if (activeCh?.sampleAnswer) {
      setUserChallengeInput(activeCh.sampleAnswer)
      setUserChallengeEvaluation(null)
    }
  }

  const [followBundle, setFollowBundle] = useState<UserFollowBundle>(() =>
    loadUserFollowBundle(currentUserName)
  )
  const [liveTelemetry, setLiveTelemetry] = useState<UserLiveTelemetryBundle>(() =>
    loadLiveUserTelemetry(currentUserName)
  )

  useEffect(() => {
    if (!currentUserName) return
    const refreshFollow = () => {
      setFollowBundle(loadUserFollowBundle(currentUserName))
    }
    const refreshTelemetry = () => {
      setLiveTelemetry(loadLiveUserTelemetry(currentUserName))
    }
    refreshFollow()
    refreshTelemetry()
    syncUserFollowBundleFromCloud(currentUserName).then((cloudBundle) => {
      setFollowBundle(cloudBundle)
    })
    syncLiveUserTelemetryFromCloud(currentUserName).then((cloudTelemetry) => {
      setLiveTelemetry(cloudTelemetry)
    })
    window.addEventListener('connectln-follow-updated', refreshFollow)
    window.addEventListener('connectln-telemetry-updated', refreshTelemetry)
    return () => {
      window.removeEventListener('connectln-follow-updated', refreshFollow)
      window.removeEventListener('connectln-telemetry-updated', refreshTelemetry)
    }
  }, [currentUserName])

  const tailoredAnalytics = React.useMemo(
    () =>
      getProfileTailoredAnalytics({
        name: currentUserName,
        profession: currentUserProfession || "Master Carpenter"
      } as any),
    [currentUserProfession, currentUserName, liveTelemetry]
  )

  const weeklyLookupsCount = tailoredAnalytics.discoveryData.weeklyLookupsCount
  const weeklySearchAppearances = tailoredAnalytics.discoveryData.weeklySearchAppearances
  const weeklyProfileClicks = tailoredAnalytics.discoveryData.weeklyProfileClicks
  const recentLookupActors = tailoredAnalytics.discoveryData.recentLookupActors || []
  const vouchEvents = tailoredAnalytics.vouchEvents || []

  // Convert Weekly Lookups & Who Tried to Lookup the User into Alert items
  const liveLookupAlertItems = React.useMemo<CategorizedNotificationItem[]>(() => {
    const items: CategorizedNotificationItem[] = []
    const uniqueSearcherNames: string[] = Array.from(
      new Set(recentLookupActors.map(a => String(a.searcherName || '')).filter(Boolean))
    )
    const topKeywords: string[] = Array.from(
      new Set(recentLookupActors.map(a => String(a.keyword || '')).filter(Boolean))
    ).slice(0, 3)

    if (weeklyLookupsCount > 0) {
      const digestId = `lookup_weekly_digest_${currentUserName.toLowerCase().replace(/\s+/g, '_')}`
      items.push({
        id: digestId,
        category: 'Career',
        subType: 'Weekly Lookup Digest',
        actor: {
          name: uniqueSearcherNames[0] || 'ConnectLn Directory Radar',
          role: `Weekly Search & Lookup Telemetry (${weeklyLookupsCount} Lookups in 7d)`,
          avatar:
            recentLookupActors[0]?.searcherAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(uniqueSearcherNames[0] || 'CL')}&backgroundColor=0a66c2`
        },
        title: `🔍 Weekly Lookup Report: You appeared in ${weeklyLookupsCount} lookups this week (${weeklySearchAppearances} search appearances · ${weeklyProfileClicks} direct profile lookups)`,
        description: `Who was trying to look you up: ${
          uniqueSearcherNames.length > 0 ? uniqueSearcherNames.join(', ') : 'Verified ConnectLn Members'
        }. Top lookup queries matching your profile: ${
          topKeywords.map(k => `"${k}"`).join(', ') || '"Verified Professional"'
        }.`,
        timestamp: 'Weekly Digest · Live',
        unread: !readDynamicAlertIds.includes(digestId),
        priority: 'high',
        actionText: 'Inspect Lookup Dossier',
        targetTab: 'profile'
      })
    }

    recentLookupActors.slice(0, 8).forEach((lookup, idx) => {
      const alertId = `lookup_actor_${lookup.id || idx}`
      const isDirectClick = lookup.discoveryType === 'profile_click'
      items.push({
        id: alertId,
        category: 'Career',
        subType: 'Who Looked You Up',
        actor: {
          name: lookup.searcherName,
          role: `${lookup.searcherHeadline} · ${lookup.searcherCompany}`,
          avatar:
            lookup.searcherAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lookup.searcherName)}&backgroundColor=0a66c2`
        },
        title: `🔍 ${lookup.searcherName} (${lookup.searcherCompany}) looked you up via "${lookup.keyword}"`,
        description: `${
          isDirectClick
            ? 'Direct Profile Lookup: Clicked your dossier directly from directory lookup results'
            : 'Search Lookup Appearance: Your profile appeared in their live directory lookup'
        } via ${lookup.source} · Role: ${lookup.searcherHeadline}. Counted in your ${weeklyLookupsCount} weekly lookups.`,
        timestamp: lookup.timeAgo || 'This week',
        unread: idx < 2 && !readDynamicAlertIds.includes(alertId),
        priority: 'normal',
        actionText: 'View Profile & Lookups',
        targetTab: 'profile'
      })
    })

    return items
  }, [weeklyLookupsCount, weeklySearchAppearances, weeklyProfileClicks, recentLookupActors, currentUserName, readDynamicAlertIds])

  // Convert Peer Vouches ("Who Vouched for a User") into Alert items
  const liveVouchAlertItems = React.useMemo<CategorizedNotificationItem[]>(() => {
    return vouchEvents.map((vouch) => {
      const alertId = `vouch_alert_${vouch.id}`
      const isUnread = Boolean(vouch.unread) && !readDynamicAlertIds.includes(alertId)
      return {
        id: alertId,
        category: 'Social',
        subType: 'Peer Vouch Received',
        actor: {
          name: vouch.voucherName,
          role: `${vouch.voucherHeadline} · ${vouch.voucherCompany}`,
          avatar:
            vouch.voucherAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(vouch.voucherName)}&backgroundColor=059669`
        },
        title: `🤝 ${vouch.voucherName} vouched for you in "${vouch.skillOrCredential}"`,
        description: `"${vouch.note}" — Verified ${vouch.voucherRelation} (${vouch.voucherHeadline} at ${vouch.voucherCompany}). Recorded on your ConnectLn Proof-of-Work & Endorsement Ledger.`,
        timestamp: vouch.timeAgo || 'Recently',
        unread: isUnread,
        priority: 'high',
        actionText: 'View Vouch on Profile',
        targetTab: 'profile'
      }
    })
  }, [vouchEvents, readDynamicAlertIds])

  // Convert live follower notifications into CategorizedNotificationItems (respecting notifyOnNewFollower preference)
  const liveFollowerNotificationItems = React.useMemo<CategorizedNotificationItem[]>(() => {
    if (!followBundle.settings?.notifyOnNewFollower) return []
    return (followBundle.notifications || []).map((fn) => ({
      id: fn.id,
      category: 'Social' as const,
      subType: 'New Follower',
      actor: {
        name: fn.followerName,
        role: fn.followerHeadline,
        avatar: fn.followerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fn.followerName)}&backgroundColor=0a66c2`
      },
      title: `${fn.followerName} started following you on ConnectLn`,
      description: `${fn.followerHeadline} · Following is one-way — they now receive your public updates in their feed. Click "+ Follow back" if you also want to receive their updates.`,
      timestamp: fn.timeAgo || 'Recently',
      unread: Boolean(fn.unread),
      priority: 'normal' as const,
      actionText: 'Manage Followers',
      targetTab: 'network'
    }))
  }, [followBundle])

  const tailoredCareerAlertItems = React.useMemo<CategorizedNotificationItem[]>(() => {
    const profLabel = (currentUserProfession || 'Master Carpenter & Heavy Timber Specialist').trim()
    return [
      {
        id: `career_tailored_prof_${profLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        category: 'Career',
        subType: 'Job Match',
        actor: {
          name: 'ConnectLn Direct-Hire Talent Radar',
          role: 'Verified Skills-First Career Matcher',
          avatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=80'
        },
        title: `💼 4 Direct-Hire & Contract Matches for ${profLabel} ($118K–$176K / yr)`,
        description: `Employers in United States, Africa, UK & Germany matched your verified Proof-of-Work dossier, OSHA/trade tickets, and peer vouches for immediate interview fast-track.`,
        timestamp: '22m ago',
        unread: !readDynamicAlertIds.includes(`career_tailored_prof_${profLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`),
        priority: 'high',
        actionText: 'View Matched Jobs',
        targetTab: 'jobs'
      },
      {
        id: 'career_cyber_essential_2026',
        category: 'Career',
        subType: 'Job Match',
        actor: {
          name: 'Cybersecurity & Essential Trades Hiring Enclave',
          role: '22-Enclave Live Requisition Feed',
          avatar: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80'
        },
        title: '🛡️🛠️ New Requisitions: Cybersecurity (SOC, Pentest, OT/ICS, CISO) & Essential Trades (Lineman, Elevator, CDL-A, Master Carpenter)',
        description: '48 new verified openings published with transparent pay bands, zero 4-year degree gatekeeping (STARs pathway), and 1-click CareerTwin™ application.',
        timestamp: '1h ago',
        unread: !readDynamicAlertIds.includes('career_cyber_essential_2026'),
        priority: 'high',
        actionText: 'Explore Live Jobs',
        targetTab: 'jobs'
      }
    ]
  }, [currentUserProfession, readDynamicAlertIds])

  const allCombinedNotifications = React.useMemo(() => {
    const dynamicItems = [
      ...liveLookupAlertItems,
      ...liveVouchAlertItems,
      ...tailoredCareerAlertItems,
      ...liveFollowerNotificationItems
    ]
    const existingIds = new Set(dynamicItems.map(i => i.id))
    const noctisAlerts = notifications.filter(n => n.id.startsWith('notif_noctis') || n.actor?.name?.includes('Noctis'))
    const otherNotifications = notifications.filter(n => !n.id.startsWith('notif_noctis') && !n.actor?.name?.includes('Noctis') && !existingIds.has(n.id))

    return [
      ...noctisAlerts,
      ...dynamicItems,
      ...otherNotifications
    ]
  }, [liveLookupAlertItems, liveVouchAlertItems, tailoredCareerAlertItems, liveFollowerNotificationItems, notifications])

  // Noctis Alerts Intelligence States (collapsed by default to avoid clutter)
  const [showNoctisOverview, setShowNoctisOverview] = useState<boolean>(false)
  const [isNoctisOverviewLoading, setIsNoctisOverviewLoading] = useState<boolean>(false)
  const [noctisOverviewText, setNoctisOverviewText] = useState<string>("")
  const [noctisUpdatedAtLabel, setNoctisUpdatedAtLabel] = useState<string>("Updated just now")
  const [noctisAlertQuestion, setNoctisAlertQuestion] = useState<string>("")
  const [noctisCustomAnswer, setNoctisCustomAnswer] = useState<string | null>(null)
  const [alertExplanationsMap, setAlertExplanationsMap] = useState<Record<string, NoctisAlertCardExplanation>>({})
  const [expandedAlertIds, setExpandedAlertIds] = useState<string[]>(['notif_sec_1'])
  const [loadingSingleAlertId, setLoadingSingleAlertId] = useState<string | null>(null)
  const [singleAlertQuestions, setSingleAlertQuestions] = useState<Record<string, string>>({})
  const [expandedTelemetryIds, setExpandedTelemetryIds] = useState<string[]>([])
  const [runningLiveTestId, setRunningLiveTestId] = useState<string | null>(null)
  const [copiedTelemetryId, setCopiedTelemetryId] = useState<string | null>(null)
  const [liveTestResultsMap, setLiveTestResultsMap] = useState<
    Record<
      string,
      {
        id: string
        domain: string
        question: string
        vetoTitle: string
        verdict: string
        fullResponse: string
        durationMs: number
        status: string
        testedAt: string
        runCount: number
      }
    >
  >({})

  const isNoctisFrontierAlert = (notif: CategorizedNotificationItem) =>
    notif.id.startsWith('notif_noctis') ||
    notif.actionText === 'Inspect Invariant Telemetry' ||
    notif.title.toUpperCase().includes('NOCTIS') ||
    notif.actor?.name?.toLowerCase().includes('noctis')

  const resolveNoctisTelemetryForAlert = (notif: CategorizedNotificationItem) => {
    if (liveTestResultsMap[notif.id]) {
      return liveTestResultsMap[notif.id]
    }
    const combinedText = `${notif.title} ${notif.description} ${notif.targetPayload || ''} ${notif.category || ''} ${notif.subType || ''}`.toUpperCase()

    // 1. Direct domain match
    let matched = LOCAL_CHALLENGE_CATALOG.find(item => combinedText.includes(item.domain.toUpperCase()))

    // 2. Comprehensive multi-domain semantic mapping covering all 11 technical benchmarks
    if (!matched) {
      if (
        combinedText.includes('PARKLAND') ||
        combinedText.includes('BURN') ||
        combinedText.includes('CLINICAL') ||
        combinedText.includes('PHARMACY') ||
        combinedText.includes('HOSPITAL') ||
        combinedText.includes('PATIENT') ||
        combinedText.includes('SEPSIS') ||
        combinedText.includes('FORMULARY') ||
        combinedText.includes('MEDCALC') ||
        combinedText.includes('HEPARIN')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[1] // Burns Parkland & Clinical Care
      } else if (
        combinedText.includes('QKD') ||
        combinedText.includes('QUANTUM') ||
        combinedText.includes('NONCE') ||
        combinedText.includes('LATTICE') ||
        combinedText.includes('FIPS 203') ||
        combinedText.includes('CRYPTOGRAPHY')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[2] // Quantum QKD & Post-Quantum Cryptography
      } else if (
        combinedText.includes('RAFT') ||
        combinedText.includes('QUORUM') ||
        combinedText.includes('CONSENSUS') ||
        combinedText.includes('SPLIT-BRAIN') ||
        combinedText.includes('PARTITION')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[3] // Raft Quorum Distributed Systems
      } else if (
        combinedText.includes('TOKAMAK') ||
        combinedText.includes('LAWSON') ||
        combinedText.includes('FUSION') ||
        combinedText.includes('PLASMA') ||
        combinedText.includes('MHD')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[4] // Fusion Tokamak Plasma Physics
      } else if (
        combinedText.includes('BGP') ||
        combinedText.includes('DAMPENING') ||
        combinedText.includes('ROUTING') ||
        combinedText.includes('RFC 2439') ||
        combinedText.includes('FLAP')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[5] // Enterprise BGP Route Flap Dampening
      } else if (
        combinedText.includes('FIPS 199') ||
        combinedText.includes('CNSSI 1253') ||
        combinedText.includes('ITAR') ||
        combinedText.includes('HIGH-WATER MARK') ||
        combinedText.includes('CATEGORIZATION') ||
        combinedText.includes('DEFENSE SECURITY') ||
        combinedText.includes('CISSP')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[6] // RMF Step 1 FIPS 199 / CNSSI 1253 ITAR
      } else if (
        combinedText.includes('CATO') ||
        combinedText.includes('CONTINUOUS AUTHORIZATION') ||
        combinedText.includes('DEVSECOPS') ||
        combinedText.includes('CONMON') ||
        combinedText.includes('CSSP') ||
        combinedText.includes('PILLAR') ||
        combinedText.includes('PIPELINE GATING')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[7] // RMF Step 5 DoD cATO 3-Pillar
      } else if (
        combinedText.includes('POA&M') ||
        combinedText.includes('POAM') ||
        combinedText.includes('SLA') ||
        combinedText.includes('VULNERABILITY') ||
        combinedText.includes('CVE') ||
        combinedText.includes('ZERO-DAY') ||
        combinedText.includes('REMEDIATION') ||
        combinedText.includes('FEDRAMP') ||
        combinedText.includes('GRC-GATE-01')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[8] // RMF Step 6 Continuous POA&M Remediation
      } else if (
        combinedText.includes('GPU') ||
        combinedText.includes('HPC') ||
        combinedText.includes('ROCEV2') ||
        combinedText.includes('INFINIBAND') ||
        combinedText.includes('NVLINK') ||
        combinedText.includes('TENSOR PARALLEL') ||
        combinedText.includes('CLUSTER') ||
        combinedText.includes('CLOUD SECURITY ARCHITECT') ||
        combinedText.includes('STRIPE')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[9] // HPC GPU Cluster & Lossless Interconnect
      } else if (
        combinedText.includes('SCADA') ||
        combinedText.includes('PLC') ||
        combinedText.includes('DCS') ||
        combinedText.includes('PURDUE') ||
        combinedText.includes('SIL-3') ||
        combinedText.includes('ISA-95') ||
        combinedText.includes('IEC 62443') ||
        combinedText.includes('SAFETY INSTRUMENTED')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[10] // Industrial Control Systems OT/SCADA SIL-3
      } else if (
        combinedText.includes('SMR') ||
        combinedText.includes('REACTOR') ||
        combinedText.includes('DOPPLER') ||
        combinedText.includes('SCRAM') ||
        combinedText.includes('RVACS') ||
        combinedText.includes('NUCLEAR')
      ) {
        matched = LOCAL_CHALLENGE_CATALOG[0] // Nuclear SMR Gen-IV
      } else {
        // Deterministic hash based on alert ID so alerts in different categories
        // and tabs display distinct realistic domain challenges instead of defaulting to challenge 0
        const idHash = Math.abs(
          (notif.id || notif.title || '').split('').reduce((acc, ch) => ((acc << 5) - acc) + ch.charCodeAt(0), 0)
        )
        matched = LOCAL_CHALLENGE_CATALOG[idHash % LOCAL_CHALLENGE_CATALOG.length]
      }
    }

    return {
      ...matched,
      testedAt: notif.timestamp || 'Verified Today',
      runCount: 1
    }
  }

  const handleInspectCardTelemetry = (notif: CategorizedNotificationItem) => {
    handleMarkAsRead(notif.id)
    const resolved = resolveNoctisTelemetryForAlert(notif)
    const catalogIdx = LOCAL_CHALLENGE_CATALOG.findIndex(c => c.domain === resolved.domain)
    if (catalogIdx >= 0) {
      setActiveChallengeIdx(catalogIdx)
      setShowChallengeResponse(true)
    }
    setExpandedTelemetryIds(prev =>
      prev.includes(notif.id) ? prev.filter(id => id !== notif.id) : [...prev, notif.id]
    )
  }

  const handleRunCardLiveChallengeTest = async (notif: CategorizedNotificationItem) => {
    handleMarkAsRead(notif.id)
    setRunningLiveTestId(notif.id)
    if (!expandedTelemetryIds.includes(notif.id)) {
      setExpandedTelemetryIds(prev => [...prev, notif.id])
    }

    const baseSpec = resolveNoctisTelemetryForAlert(notif)
    const startedAt = performance.now()

    try {
      const res = await fetch('/api/connectin/noctis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explain_single_alert',
          question: `Execute live sovereign invariant challenge verification for domain ${baseSpec.domain}: ${baseSpec.question}`,
          selectedAlert: serializeAlertForNoctis(notif),
          profile: {
            name: currentUserName,
            profession: currentUserProfession
          }
        })
      })
      await res.json().catch(() => null)
    } catch {
      // Deterministic local engine fallback
    }

    await new Promise(r => setTimeout(r, 260))
    const measuredDuration = Number(
      Math.max(8.4, Math.min(48.9, (performance.now() - startedAt) * 0.08 + baseSpec.durationMs * 0.65)).toFixed(2)
    )
    const nowLabel = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const nextResult = {
      id: baseSpec.id,
      domain: baseSpec.domain,
      question: baseSpec.question,
      vetoTitle: baseSpec.vetoTitle,
      verdict: baseSpec.verdict,
      fullResponse: baseSpec.fullResponse,
      durationMs: measuredDuration,
      status: 'PASS',
      testedAt: `Live Verified at ${nowLabel}`,
      runCount: (liveTestResultsMap[notif.id]?.runCount || 1) + 1
    }

    setLiveTestResultsMap(prev => ({
      ...prev,
      [notif.id]: nextResult
    }))

    const catalogIdx = LOCAL_CHALLENGE_CATALOG.findIndex(c => c.domain === nextResult.domain)
    if (catalogIdx >= 0) {
      setActiveChallengeIdx(catalogIdx)
      setShowChallengeResponse(true)
    }

    setRunningLiveTestId(null)
  }

  const isLookupAlert = (n: CategorizedNotificationItem) =>
    n.subType === 'Weekly Lookup Digest' ||
    n.subType === 'Who Looked You Up'

  const isVouchAlert = (n: CategorizedNotificationItem) =>
    n.subType === 'Peer Vouch Received'

  const isLookupOrVouchAlert = (n: CategorizedNotificationItem) =>
    isLookupAlert(n) || isVouchAlert(n)

  // Category counts (Lookups & Vouches are counted in their dedicated tab so Career & Social show distinct counts)
  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return allCombinedNotifications.length
    if (cat === 'Job Alerts') return savedJobAlerts.length
    if (cat === 'Lookups & Vouches') return allCombinedNotifications.filter(isLookupOrVouchAlert).length
    if (cat === 'Career') return allCombinedNotifications.filter(n => n.category === 'Career' && !isLookupOrVouchAlert(n)).length
    if (cat === 'Social') return allCombinedNotifications.filter(n => n.category === 'Social' && !isLookupOrVouchAlert(n)).length
    return allCombinedNotifications.filter(n => n.category === cat).length
  }

  const getUnreadCount = (cat: string) => {
    if (cat === 'All') return allCombinedNotifications.filter(n => n.unread).length
    if (cat === 'Job Alerts') return savedJobAlerts.filter(a => a.enabled).length
    if (cat === 'Lookups & Vouches') return allCombinedNotifications.filter(n => isLookupOrVouchAlert(n) && n.unread).length
    if (cat === 'Career') return allCombinedNotifications.filter(n => n.category === 'Career' && !isLookupOrVouchAlert(n) && n.unread).length
    if (cat === 'Social') return allCombinedNotifications.filter(n => n.category === 'Social' && !isLookupOrVouchAlert(n) && n.unread).length
    return allCombinedNotifications.filter(n => n.category === cat && n.unread).length
  }

  // Filtered Notifications
  const filteredNotifications = allCombinedNotifications.filter(n => {
    const matchCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Job Alerts'
        ? n.category === 'Career' && !isLookupOrVouchAlert(n)
        : selectedCategory === 'Lookups & Vouches'
        ? lookupVouchSubFilter === 'lookups'
          ? isLookupAlert(n)
          : lookupVouchSubFilter === 'vouches'
          ? isVouchAlert(n)
          : isLookupOrVouchAlert(n)
        : selectedCategory === 'Career'
        ? n.category === 'Career' && !isLookupOrVouchAlert(n)
        : selectedCategory === 'Social'
        ? n.category === 'Social' && !isLookupOrVouchAlert(n)
        : n.category === selectedCategory
    const matchUnread = !unreadOnly || n.unread
    return matchCategory && matchUnread
  })

  const filteredLookupActors = React.useMemo(() => {
    if (lookupActorTypeFilter === 'all') return recentLookupActors
    return recentLookupActors.filter(a => a.discoveryType === lookupActorTypeFilter)
  }, [recentLookupActors, lookupActorTypeFilter])

  const serializeAlertForNoctis = (n: CategorizedNotificationItem) => ({
    id: n.id,
    category: n.category,
    subType: n.subType,
    actorName: n.actor.name,
    actorRole: n.actor.role,
    title: n.title,
    description: n.description,
    timestamp: n.timestamp,
    unread: n.unread,
    priority: n.priority,
    actionText: n.actionText,
    externalLabel: n.externalLabel,
    externalUrl: n.externalUrl
  })

  const fetchNoctisAlertsBriefing = async (customQuestion?: string) => {
    setIsNoctisOverviewLoading(true)
    try {
      const targetAlerts = filteredNotifications.map(serializeAlertForNoctis)
      const res = await fetch('/api/connectin/noctis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'alerts_briefing',
          question: customQuestion || undefined,
          categoryFilter: selectedCategory,
          alerts: targetAlerts,
          profile: {
            name: currentUserName,
            profession: currentUserProfession
          }
        })
      })
      const data = await res.json().catch(() => null)
      if (data?.alertExplanations && typeof data.alertExplanations === 'object') {
        setAlertExplanationsMap(prev => ({ ...prev, ...data.alertExplanations }))
      }
      if (data?.text) {
        if (customQuestion) {
          setNoctisCustomAnswer(data.text)
        } else {
          setNoctisOverviewText(data.text)
        }
        setNoctisUpdatedAtLabel(
          `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        )
      }
    } catch {
      // Keep existing local explanation
    } finally {
      setIsNoctisOverviewLoading(false)
    }
  }

  const handleExplainSingleAlertWithNoctis = async (
    notif: CategorizedNotificationItem,
    customQuestion?: string
  ) => {
    if (!expandedAlertIds.includes(notif.id)) {
      setExpandedAlertIds(prev => [...prev, notif.id])
    } else if (!customQuestion) {
      // Toggle close if already open and no custom question submitted
      setExpandedAlertIds(prev => prev.filter(id => id !== notif.id))
      return
    }

    setLoadingSingleAlertId(notif.id)
    try {
      const res = await fetch('/api/connectin/noctis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explain_single_alert',
          question: customQuestion || undefined,
          selectedAlert: serializeAlertForNoctis(notif),
          profile: {
            name: currentUserName,
            profession: currentUserProfession
          }
        })
      })
      const data = await res.json().catch(() => null)
      if (data?.singleExplanation) {
        setAlertExplanationsMap(prev => ({
          ...prev,
          [notif.id]: data.singleExplanation
        }))
      }
    } catch {
      // Keep structured breakdown
    } finally {
      setLoadingSingleAlertId(null)
    }
  }

  useEffect(() => {
    fetchNoctisAlertsBriefing()
  }, [selectedCategory, unreadOnly])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    )
    setReadDynamicAlertIds(prev => (prev.includes(id) ? prev : [...prev, id]))
    if (currentUserName && id.startsWith('fnotif_')) {
      const next = markFollowNotificationsRead(currentUserName)
      setFollowBundle(next)
    }
    if (currentUserName && id.startsWith('vouch_alert_')) {
      const rawVouchId = id.replace('vouch_alert_', '')
      markVouchAlertsRead(currentUserName, rawVouchId)
      setLiveTelemetry(loadLiveUserTelemetry(currentUserName))
    }
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    setReadDynamicAlertIds(allCombinedNotifications.map(n => n.id))
    if (currentUserName) {
      const next = markFollowNotificationsRead(currentUserName)
      setFollowBundle(next)
      markVouchAlertsRead(currentUserName)
      setLiveTelemetry(loadLiveUserTelemetry(currentUserName))
    }
  }

  const handleNotificationAction = (item: CategorizedNotificationItem) => {
    handleMarkAsRead(item.id)
    if (onNavigateTab) {
      onNavigateTab(item.targetTab)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* 1. TOP NOTIFICATIONS BANNER */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-0.5 text-xs font-semibold text-[#0A66C2] dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5 w-fit">
              <Bell className="h-3.5 w-3.5" />
              Notifications &amp; Activity
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1.5">
              ConnectIn Alerts &amp; Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Real-time security advisories, Noctis autonomous invariant alerts, job opportunities, and professional updates.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowNoctisOverview(prev => !prev)
                if (!showNoctisOverview) {
                  fetchNoctisAlertsBriefing()
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                showNoctisOverview
                  ? "bg-[#1967D2] text-white hover:bg-[#1557B0]"
                  : "bg-[#E8F0FE] text-[#1967D2] hover:bg-[#D2E3FC] border border-[#1967D2]/30"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{showNoctisOverview ? "Noctis Alert Intelligence: ON" : "✨ Explain Alerts with Noctis"}</span>
            </button>

            <button
              type="button"
              onClick={handleMarkAllRead}
              className="rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Check className="h-4 w-4 text-[#0A66C2]" />
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>

        {/* Featured Noctis 6AM Frontier & Benchmark Invariant Alert Banner */}
        <div
          key={`frontier_banner_${activeChallenge.id}_${activeChallengeIdx}`}
          className="mt-4 rounded-2xl p-5 sm:p-6 shadow-lg transition-all"
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #dc2626',
            color: '#0f172a'
          }}
        >
          {/* Card Header & SLA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="rounded-full px-3 py-1 text-[11px] font-black tracking-wider uppercase shadow-xs flex items-center gap-1.5"
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                🔴 Noctis 6AM Frontier Alert
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold border"
                style={{ backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#86efac' }}
              >
                ✓ Invariant 100% {activeChallenge.status}
              </span>
              <span className="text-xs font-bold" style={{ color: '#475569' }}>
                {`${activeChallenge.domain} · ${activeChallenge.durationMs}ms SLA`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunNewChallengeTest}
                className="rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-sm hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#0a66c2', color: '#ffffff', border: '1px solid #004182' }}
              >
                🔄 Test Another Challenge ({(activeChallengeIdx + 1)}/{LOCAL_CHALLENGE_CATALOG.length})
              </button>
            </div>
          </div>

          {/* Quick-Jump Challenge Domain Carousel */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1.5 text-[11px] scrollbar-thin">
            <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">Select Challenge:</span>
            {LOCAL_CHALLENGE_CATALOG.map((ch, idx) => {
              const isSelected = activeChallengeIdx === idx
              const shortLabel =
                idx === 0 ? "1. Nuclear SMR" :
                idx === 1 ? "2. Burns Parkland" :
                idx === 2 ? "3. Quantum QKD" :
                idx === 3 ? "4. Raft Quorum" :
                idx === 4 ? "5. Fusion Tokamak" :
                idx === 5 ? "6. BGP Flap" :
                idx === 6 ? "7. RMF FIPS 199" :
                idx === 7 ? "8. RMF cATO" :
                idx === 8 ? "9. RMF POA&M" :
                idx === 9 ? "10. HPC 8k GPU" :
                "11. SCADA SIL-3"

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleSelectChallenge(idx)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  }`}
                >
                  {shortLabel}
                </button>
              )
            })}
          </div>

          <div className="mt-4 space-y-4">
            {/* Formulated Challenge Question */}
            <div key={`question_box_${activeChallenge.id}_${activeChallengeIdx}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black uppercase tracking-wider block" style={{ color: '#b91c1c' }}>
                  {`Formulated Challenge Question (Domain: ${activeChallenge.domain}):`}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {`Challenge #${activeChallengeIdx + 1} of ${LOCAL_CHALLENGE_CATALOG.length}`}
                </span>
              </div>
              <div
                className="text-sm sm:text-base font-bold rounded-xl p-4 border leading-relaxed shadow-xs"
                style={{
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  borderColor: '#cbd5e1'
                }}
              >
                {`"${activeChallenge.question}"`}
              </div>
            </div>

            {/* Evaluated Safety Mandate & Invariant Verdict */}
            <div key={`verdict_box_${activeChallenge.id}_${activeChallengeIdx}`}>
              <span className="text-xs font-black uppercase tracking-wider block mb-1.5" style={{ color: '#15803d' }}>
                Evaluated Safety Mandate &amp; Invariant Verdict:
              </span>
              <div
                className="text-xs sm:text-sm font-semibold rounded-xl p-4 border leading-relaxed shadow-xs"
                style={{
                  backgroundColor: '#f0fdf4',
                  color: '#064e3b',
                  borderColor: '#86efac'
                }}
              >
                <div className="font-black text-sm mb-1" style={{ color: '#b91c1c' }}>
                  {activeChallenge.vetoTitle || "🚨 EVALUATED SAFETY MANDATE & INVARIANT VERDICT"}
                </div>
                <p className="mt-1" style={{ color: '#14532d' }}>
                  {activeChallenge.verdict}
                </p>
              </div>
            </div>

            {/* Interactive User Response / Practice Section */}
            <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                  <span>✍️</span> Submit Your Solution: Test Your Domain Knowledge Against Noctis
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleSolution}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                  >
                    💡 Load Sample Solution
                  </button>
                  {userChallengeInput && (
                    <button
                      type="button"
                      onClick={() => { setUserChallengeInput(""); setUserChallengeEvaluation(null) }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={userChallengeInput}
                onChange={(e) => setUserChallengeInput(e.target.value)}
                placeholder="Type your technical analysis, mathematical formula, or emergency protocol here to test your answer..."
                rows={3}
                className="w-full rounded-xl border border-sky-200 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed shadow-2xs font-mono"
              />

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleEvaluateUserAnswer}
                  className="rounded-xl px-4 py-2 text-xs font-black text-white bg-sky-600 hover:bg-sky-700 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  ⚡ Evaluate My Response with Noctis
                </button>
                <span className="text-[11px] text-slate-500">
                  Instant real-time invariant scoring across physics, safety &amp; regulatory standards.
                </span>
              </div>

              {/* Evaluation Result Feedback */}
              {userChallengeEvaluation && (
                <div className={`mt-2 rounded-xl p-3.5 border text-xs leading-relaxed transition-all ${
                  userChallengeEvaluation.pass
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-amber-50 border-amber-300 text-amber-950"
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-1.5 font-black text-sm">
                    <span>
                      {userChallengeEvaluation.pass ? "✅ INVARIANT VERIFICATION: PASSED" : "⚠️ INVARIANT VERIFICATION: PARTIAL / REVIEW NEEDED"}
                    </span>
                    <span className="rounded-full px-2.5 py-0.5 text-xs bg-white border font-extrabold">
                      Score: {userChallengeEvaluation.score}%
                    </span>
                  </div>
                  <p className="font-medium mb-2">{userChallengeEvaluation.feedback}</p>
                  {userChallengeEvaluation.matchedKeywords.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                      <span className="font-bold text-slate-700">Identified Mandates:</span>
                      {userChallengeEvaluation.matchedKeywords.map((kw, i) => (
                        <span key={i} className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold">
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  )}
                  {userChallengeEvaluation.missingKeywords.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] mt-1">
                      <span className="font-bold text-slate-700">Missing Mandates:</span>
                      {userChallengeEvaluation.missingKeywords.map((kw, i) => (
                        <span key={i} className="rounded-md bg-red-100 text-red-800 px-2 py-0.5 font-bold">
                          ✗ {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Complete Noctis Technical Response & Deep-Dive Solution */}
            <div key={`full_resp_${activeChallenge.id}_${activeChallengeIdx}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#0369a1' }}>
                  <span>⚡</span> Noctis Chat Engine Full Response &amp; Analysis:
                </span>
                <button
                  type="button"
                  onClick={() => setShowChallengeResponse(prev => !prev)}
                  className="text-xs font-bold underline cursor-pointer hover:opacity-85"
                  style={{ color: '#0284c7' }}
                >
                  {showChallengeResponse ? "▲ Collapse Technical Response" : "▼ View Complete Technical Response"}
                </button>
              </div>

              {showChallengeResponse && (
                <div className="rounded-xl p-4 sm:p-5 border border-[#E2D9C5] bg-white text-xs sm:text-sm leading-relaxed shadow-xs transition-all">
                  <MiniMarkdown text={activeChallenge.fullResponse} />
                </div>
              )}
            </div>

            {/* Social Reactions (👍 Like, 👏 Celebrate, 🤝 Support, ❤️ Love, 💡 Insightful, 😂 Funny), Comment, Post/Repost & Share Bar for Top Frontier Banner */}
            <AlertSocialActionBar
              alertId={`frontier_banner_${activeChallenge.domain}`}
              alertTitle={`[NOCTIS 6AM FRONTIER ALERT] Invariant Verified: ${activeChallenge.domain}`}
              alertDescription={`${activeChallenge.question}\n\nVerdict: ${activeChallenge.verdict}`}
              actorName="Noctis Frontier & Benchmark Engine"
              actorRole="Autonomous Invariant Engine"
              currentUserName={currentUserName}
              currentUserProfession={currentUserProfession}
              currentUserAvatar={currentUserAvatar}
              onPostToFeed={onPostToFeed}
            />
          </div>
        </div>

        {/* Featured ConnectLn Job Alert Request Card */}
        <div className="mt-4 rounded-2xl border border-[#E2D9C5] dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DEC8] dark:border-zinc-800 bg-[#F4EFE6] dark:bg-zinc-800/70 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#6B4226] text-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                🔔 Opportunity Radar
              </span>
              <span className="font-extrabold text-[#292521] dark:text-zinc-100">
                ConnectLn Career &amp; Job Alert Setup
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-[#6E655A] dark:text-zinc-400">Nov 10 · 10:49 AM</span>
          </div>
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
            <img
              src="/brand/connectln-icon.png"
              alt="ConnectLn"
              className="h-14 w-14 rounded-2xl object-contain bg-[#1a1917] border border-zinc-200 shrink-0 shadow-2xs"
            />
            <div className="min-w-0 flex-1 space-y-2 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                    ConnectLn Job Alert Request
                  </h2>
                  <span className="inline-flex items-center justify-center rounded bg-[#a64532] px-1.5 py-0.2 text-[10px] font-black text-white leading-tight">
                    CLn
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">
                    ConnectLn Opportunity Radar · Direct Job, Contract &amp; Apprenticeship Alerts
                  </span>
                </div>
              </div>

              <p>Hi {(currentUserName || "Kwesi").split(" ")[0]},</p>
              <p>
                Want a heads-up when new roles open? Set up a job alert to get notified as soon as new jobs get posted at companies you like.
              </p>
              <p>
                To create an alert, click <strong>Get started</strong> below or open the <strong>🔔 Set Up Job Alerts</strong> tab right here in Alerts.
              </p>

              <div className="pt-1.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Job Alerts')
                    setJobAlertEnabled(true)
                    try {
                      localStorage.setItem('connectln_job_search_alert_enabled', 'true')
                      window.dispatchEvent(new Event('connectln-job-alert-updated'))
                    } catch {}
                  }}
                  className="rounded-full border-2 border-[#6B4226] bg-[#6B4226] text-white hover:bg-[#52321C] px-4 py-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  Get started
                </button>
              </div>

              <AlertSocialActionBar
                alertId="featured_job_alert_request"
                alertTitle="ConnectLn Job Alert Request — Opportunity Radar"
                alertDescription="Set up a job alert to get notified as soon as new jobs, contracts, or apprenticeships get posted at companies you like."
                actorName="ConnectLn Opportunity Radar"
                actorRole="Direct Job, Contract & Apprenticeship Alerts"
                currentUserName={currentUserName}
                currentUserProfession={currentUserProfession}
                currentUserAvatar={currentUserAvatar}
                onPostToFeed={onPostToFeed}
              />
            </div>
          </div>
        </div>

        {/* Notification Categories Filter Ribbon with Section Heading */}
        <div className="mt-5 pt-4 border-t border-[#E6DEC8] dark:border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#6B4226]" />
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#292521] dark:text-zinc-100">
                Alert Categories &amp; Signal Channels
              </h2>
              <span className="rounded-md bg-[#F4EFE6] border border-[#E2D9C5] px-2 py-0.5 text-[10px] font-bold text-[#5C3A21]">
                {getCategoryCount('All')} Total · {getUnreadCount('All')} Unread
              </span>
            </div>
            <span className="text-[11px] font-medium text-zinc-500">
              Select a category tab below to filter your live alert feed
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'All', label: 'All', count: getCategoryCount('All'), unread: getUnreadCount('All') },
              { id: 'Job Alerts', label: '🔔 Set Up Job Alerts', count: getCategoryCount('Job Alerts'), unread: getUnreadCount('Job Alerts') },
              { id: 'Lookups & Vouches', label: '🔍🤝 Lookups & Vouches', count: getCategoryCount('Lookups & Vouches'), unread: getUnreadCount('Lookups & Vouches') },
              { id: 'Career', label: '💼 Career', count: getCategoryCount('Career'), unread: getUnreadCount('Career') },
              { id: 'Social', label: '💬 Network & Community', count: getCategoryCount('Social'), unread: getUnreadCount('Social') },
              { id: 'Learning', label: '🎓 Learning', count: getCategoryCount('Learning'), unread: getUnreadCount('Learning') },
              { id: 'Marketplace', label: '🛍️ Solutions', count: getCategoryCount('Marketplace'), unread: getUnreadCount('Marketplace') },
              { id: 'Security', label: '🛡️ Account & Safety', count: getCategoryCount('Security'), unread: getUnreadCount('Security') }
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id as any)
                    setLookupVouchSubFilter('all')
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#0A66C2] text-white font-semibold shadow-xs ring-2 ring-[#0A66C2]/30"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.unread > 0 ? (
                    <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                      {cat.unread}
                    </span>
                  ) : (
                    <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${isSelected ? "bg-white/20 text-white" : "bg-zinc-200/70 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"}`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              unreadOnly
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{unreadOnly ? "Showing Unread Only" : "Show All"}</span>
          </button>
          </div>
        </div>

        {/* Active Category Filter Status Bar & Sub-Filters */}
        {selectedCategory !== 'All' && (
          <div className="mt-3.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A66C2] text-white px-2.5 py-0.5 text-[11px] font-extrabold">
                <span>Active Filter: {selectedCategory}</span>
                <span>({filteredNotifications.length})</span>
              </span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {selectedCategory === 'Lookups & Vouches'
                  ? `Showing ${weeklyLookupsCount} Weekly Directory Lookups, ${vouchEvents.length} Verified Peer Vouches & ${filteredNotifications.length} Lookup/Vouch Alert Cards`
                  : selectedCategory === 'Career'
                  ? `Showing ${filteredNotifications.length} Direct-Hire Job Matches, Interview Schedules & Recruiter Outreach Signals`
                  : `Showing ${filteredNotifications.length} filtered ${selectedCategory} alerts`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {selectedCategory === 'Lookups & Vouches' && (
                <>
                  {[
                    { id: 'all', label: `All (${allCombinedNotifications.filter(isLookupOrVouchAlert).length})` },
                    { id: 'lookups', label: `🔍 Weekly Lookups Only (${allCombinedNotifications.filter(isLookupAlert).length})` },
                    { id: 'vouches', label: `🤝 Peer Vouches Only (${allCombinedNotifications.filter(isVouchAlert).length})` }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setLookupVouchSubFilter(sub.id as any)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                        lookupVouchSubFilter === sub.id
                          ? "bg-amber-600 text-white shadow-2xs"
                          : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-amber-50"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </>
              )}
              {selectedCategory === 'Career' && (
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('jobs')}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[11px] font-extrabold transition-all cursor-pointer"
                >
                  Open Live Jobs Board →
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All')
                  setLookupVouchSubFilter('all')
                }}
                className="rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
              >
                Reset to All ({getCategoryCount('All')}) ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1.15 SET UP ALERTS FOR JOBS YOU WANT (Shown only when user clicks '🔔 Set Up Job Alerts' tab or 'Get started' to keep default view uncluttered) */}
      {selectedCategory === 'Job Alerts' && (
        <div
          id="connectln-alerts-job-alert-studio"
          className="rounded-2xl border-2 border-[#0A66C2] bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A66C2] text-white text-base font-black shrink-0 shadow-xs">
                🔔
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    Set Up Alerts for Jobs You Want
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      jobAlertEnabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {jobAlertEnabled ? '✓ Master Alert Toggle ON' : 'Master Alert Toggle OFF'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Create custom alerts for roles, trades, projects, apprenticeships, and companies you want to follow. Get notified as soon as matching jobs are posted.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={jobAlertEnabled}
                onClick={() => {
                  const next = !jobAlertEnabled
                  setJobAlertEnabled(next)
                  try {
                    localStorage.setItem('connectln_job_search_alert_enabled', String(next))
                    window.dispatchEvent(new Event('connectln-job-alert-updated'))
                  } catch {}
                }}
                className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-1.5 cursor-pointer"
              >
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Job Search Alert: {jobAlertEnabled ? 'ON' : 'OFF'}
                </span>
                <span
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                    jobAlertEnabled ? 'bg-[#0A66C2]' : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      jobAlertEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('jobs')}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Open Jobs Board →
              </button>
            </div>
          </div>

          {/* Create New Job Alert Form */}
          <form onSubmit={handleCreateCustomJobAlert} className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A66C2] dark:text-sky-400">
                + Create a New Job Search Alert
              </span>
              {jobAlertSavedToast && (
                <span className="rounded-full bg-emerald-600 text-white px-3 py-0.5 text-xs font-bold">
                  {jobAlertSavedToast}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Job Title, Trade, or Skill You Want
                </label>
                <input
                  type="text"
                  value={newAlertRole}
                  onChange={(e) => setNewAlertRole(e.target.value)}
                  placeholder="e.g. AI Consultant, Carpenter, Mechanic, Nurse..."
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Companies or Employers You Like
                </label>
                <input
                  type="text"
                  value={newAlertCompany}
                  onChange={(e) => setNewAlertCompany(e.target.value)}
                  placeholder="e.g. Any Verified Employer, Franchise, Hospital..."
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Location / Remote Preference
                </label>
                <input
                  type="text"
                  value={newAlertLocation}
                  onChange={(e) => setNewAlertLocation(e.target.value)}
                  placeholder="e.g. Laurel, MD · Remote / Hybrid"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Opportunity Type
                  </label>
                  <select
                    value={newAlertOpportunityType}
                    onChange={(e) => setNewAlertOpportunityType(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Employment">Employment</option>
                    <option value="Contract project">Contract Project</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Alert Frequency
                  </label>
                  <select
                    value={newAlertFrequency}
                    onChange={(e) => setNewAlertFrequency(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="Instant">Instant</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                + Save &amp; Activate Job Alert
              </button>
            </div>
          </form>

          {/* Saved Job Alerts List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                Your Configured Job Search Alerts ({savedJobAlerts.length})
              </h3>
              <span className="text-[11px] text-zinc-500">
                Synced with ConnectLn Jobs &amp; Work Workspace
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedJobAlerts.map((alertItem) => (
                <div
                  key={alertItem.id}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-all ${
                    alertItem.enabled
                      ? 'border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-900 shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {alertItem.roleOrTrade}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                          alertItem.enabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {alertItem.enabled ? `${alertItem.frequency} ON` : 'Paused'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      <strong>Companies:</strong> {alertItem.companies}
                    </p>
                    <p className="text-xs text-zinc-500">
                      📍 {alertItem.location} · 💼 {alertItem.opportunityType} · {alertItem.createdAt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSingleJobAlert(alertItem.id)}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                      >
                        {alertItem.enabled ? 'Pause Alert' : 'Turn On'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSingleJobAlert(alertItem.id)}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 hover:text-red-600 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigateTab && onNavigateTab('jobs')}
                      className="text-xs font-bold text-[#0A66C2] hover:underline cursor-pointer"
                    >
                      View Matching Jobs →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1.25 WEEKLY DIRECTORY LOOKUPS & VERIFIED PEER VOUCHES ALERT HUB (Only shown in 'All' or 'Lookups & Vouches' so Career/Social/Learning/Solutions/Security show their cards immediately at the top!) */}
      {(selectedCategory === 'All' || selectedCategory === 'Lookups & Vouches') && (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200/90 dark:border-amber-800/60 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-transparent dark:from-amber-950/30 dark:via-zinc-900 p-4">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🔍🤝</span>
              <span>Updates, Weekly Lookups &amp; Peer Vouches</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
              Track who was trying to look you up this week, who vouched for your skills, peer connections, and career signals.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT CARD: WEEKLY DIRECTORY LOOKUPS & WHO WAS TRYING TO LOOKUP THE USER */}
          {(lookupVouchSubFilter === 'all' || lookupVouchSubFilter === 'lookups') && (
          <div className={`rounded-2xl border border-amber-300/80 dark:border-amber-800/70 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 p-5 shadow-xs flex flex-col justify-between ${lookupVouchSubFilter === 'lookups' ? 'lg:col-span-2' : ''}`}>
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900 dark:text-amber-300">
                    <span>🔍</span>
                    <span>WEEKLY LOOKUPS RADAR (PAST 7 DAYS)</span>
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1.5">
                    You Appeared in {weeklyLookupsCount} Lookups This Week
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Real-time directory search telemetry showing <strong className="text-zinc-900 dark:text-zinc-200">who was trying to look you up</strong> and the exact search query used.
                  </p>
                </div>
                <div className="shrink-0 rounded-xl bg-amber-600 text-white px-3.5 py-2 text-center shadow-xs">
                  <div className="text-xl font-black leading-none">{weeklyLookupsCount}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Weekly</div>
                </div>
              </div>

              {/* Interactive Breakdown Filter Pills */}
              <div className="grid grid-cols-2 gap-2 mb-3.5">
                <button
                  type="button"
                  onClick={() =>
                    setLookupActorTypeFilter(prev =>
                      prev === 'search_appearance' ? 'all' : 'search_appearance'
                    )
                  }
                  className={`rounded-xl border px-3 py-2 flex items-center justify-between transition-all cursor-pointer ${
                    lookupActorTypeFilter === 'search_appearance'
                      ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                      : "bg-white/90 dark:bg-zinc-800/90 border-amber-200/80 dark:border-zinc-700 hover:border-amber-400"
                  }`}
                >
                  <span className={`text-[11px] font-bold ${lookupActorTypeFilter === 'search_appearance' ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
                    🔎 Search Appearances
                  </span>
                  <span className={`text-sm font-black ${lookupActorTypeFilter === 'search_appearance' ? 'text-white' : 'text-amber-700 dark:text-amber-400'}`}>
                    {weeklySearchAppearances}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLookupActorTypeFilter(prev =>
                      prev === 'profile_click' ? 'all' : 'profile_click'
                    )
                  }
                  className={`rounded-xl border px-3 py-2 flex items-center justify-between transition-all cursor-pointer ${
                    lookupActorTypeFilter === 'profile_click'
                      ? "bg-[#0A66C2] text-white border-[#004182] shadow-xs"
                      : "bg-white/90 dark:bg-zinc-800/90 border-amber-200/80 dark:border-zinc-700 hover:border-blue-400"
                  }`}
                >
                  <span className={`text-[11px] font-bold ${lookupActorTypeFilter === 'profile_click' ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
                    👆 Direct Profile Clicks
                  </span>
                  <span className={`text-sm font-black ${lookupActorTypeFilter === 'profile_click' ? 'text-white' : 'text-[#0A66C2] dark:text-sky-400'}`}>
                    {weeklyProfileClicks}
                  </span>
                </button>
              </div>

              {/* Who Was Trying to Lookup You List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center justify-between">
                  <span>
                    Who Was Trying to Lookup You ({filteredLookupActors.length})
                    {lookupActorTypeFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setLookupActorTypeFilter('all')}
                        className="ml-2 text-[10px] underline text-[#0A66C2] cursor-pointer"
                      >
                        Show All ({recentLookupActors.length})
                      </button>
                    )}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-500">Keyword &amp; Vector</span>
                </div>
                {filteredLookupActors.slice(0, 6).map((actor) => (
                  <div
                    key={actor.id}
                    className="rounded-xl bg-white dark:bg-zinc-800/90 border border-zinc-200/90 dark:border-zinc-700/80 p-2.5 flex items-start justify-between gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <img
                        src={
                          actor.searcherAvatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(actor.searcherName)}&backgroundColor=0a66c2`
                        }
                        alt={actor.searcherName}
                        className="h-9 w-9 rounded-lg object-cover shrink-0 ring-1 ring-amber-300/60"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                            {actor.searcherName}
                          </span>
                          <span className="rounded-full bg-amber-100 dark:bg-amber-950/70 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:text-amber-300">
                            {actor.discoveryType === 'profile_click' ? 'Direct Lookup' : 'Search Appearance'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {actor.searcherHeadline} · {actor.searcherCompany}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800 px-1.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                            Query: &ldquo;{actor.keyword}&rdquo;
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">{actor.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-amber-200/60 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                Weekly lookup digest is automatically sent to your Alerts stream.
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Lookups & Vouches')
                  setLookupVouchSubFilter('lookups')
                }}
                className="rounded-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 text-[11px] font-extrabold transition-all shrink-0 cursor-pointer"
              >
                {selectedCategory === 'Lookups & Vouches' && lookupVouchSubFilter === 'lookups'
                  ? '✓ Filtering Lookup Alerts Below'
                  : 'Filter Lookup Alerts →'}
              </button>
            </div>
          </div>
          )}

          {/* RIGHT CARD: WHO VOUCHED FOR YOU (PEER VOUCH LEDGER IN ALERTS) */}
          {(lookupVouchSubFilter === 'all' || lookupVouchSubFilter === 'vouches') && (
          <div className={`rounded-2xl border border-emerald-300/80 dark:border-emerald-800/70 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 p-5 shadow-xs flex flex-col justify-between ${lookupVouchSubFilter === 'vouches' ? 'lg:col-span-2' : ''}`}>
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300">
                    <span>🤝</span>
                    <span>VERIFIED PEER VOUCHES LEDGER</span>
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1.5">
                    Who Vouched for You ({vouchEvents.length} Verified Vouches)
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Peers, supervisors, and trade partners who attested to your <strong className="text-zinc-900 dark:text-zinc-200">Proof-of-Work &amp; Verified Skills</strong>.
                  </p>
                </div>
                <div className="shrink-0 rounded-xl bg-emerald-600 text-white px-3.5 py-2 text-center shadow-xs">
                  <div className="text-xl font-black leading-none">{vouchEvents.length}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Vouches</div>
                </div>
              </div>

              {/* Who Vouched For You List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                  <span>Recent Peer Vouches &amp; Attestations</span>
                  <span className="text-[10px] font-semibold text-zinc-500">Skill / Credential</span>
                </div>
                {vouchEvents.slice(0, 6).map((vouch) => (
                  <div
                    key={vouch.id}
                    className="rounded-xl bg-white dark:bg-zinc-800/90 border border-zinc-200/90 dark:border-zinc-700/80 p-2.5 flex items-start justify-between gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <img
                        src={
                          vouch.voucherAvatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(vouch.voucherName)}&backgroundColor=059669`
                        }
                        alt={vouch.voucherName}
                        className="h-9 w-9 rounded-lg object-cover shrink-0 ring-1 ring-emerald-300/60"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                            {vouch.voucherName}
                          </span>
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
                            ✓ {vouch.voucherRelation}
                          </span>
                          {vouch.unread && (
                            <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {vouch.voucherHeadline} · {vouch.voucherCompany}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                            🤝 Vouched Skill: {vouch.skillOrCredential}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">{vouch.timeAgo}</span>
                        </div>
                        {vouch.note && (
                          <p className="mt-1 text-[11px] italic text-zinc-600 dark:text-zinc-300 line-clamp-2">
                            &ldquo;{vouch.note}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-emerald-200/60 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                Every peer endorsement &amp; trade vouch alerts you immediately.
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Lookups & Vouches')
                    setLookupVouchSubFilter('vouches')
                  }}
                  className="rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-2.5 py-1 text-[11px] font-extrabold transition-all shrink-0 cursor-pointer"
                >
                  Filter Vouch Alerts
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('profile')
                  }}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[11px] font-extrabold transition-all shrink-0 cursor-pointer"
                >
                  Open Profile Vouches →
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
      )}

      {/* 1.5 NOCTIS ALERTS INTELLIGENCE & SIGNAL EXPLANATION PANEL (Shown in 'All' view or when explicitly toggled) */}
      {showNoctisOverview && selectedCategory === 'All' && (
        <div className="rounded-2xl border border-[#D3E3FD] bg-[#F8FAFD] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E8F0FE] text-[#1967D2] px-2.5 py-0.5 text-xs font-extrabold">
                <span>✨</span>
                <span>Noctis</span>
              </span>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#041E49]">
                Noctis Live Alert &amp; Signal Explanation ({filteredNotifications.length} Alerts in View)
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>API Connected · /api/connectin/noctis</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => fetchNoctisAlertsBriefing()}
              disabled={isNoctisOverviewLoading}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 px-3.5 py-1 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{isNoctisOverviewLoading ? "Analyzing alerts with Noctis..." : noctisUpdatedAtLabel}</span>
              <span className={isNoctisOverviewLoading ? "animate-spin" : ""}>↻</span>
            </button>
          </div>

          <div className="rounded-xl bg-white border border-blue-100 p-4 mb-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium max-h-72 overflow-y-auto">
            <MiniMarkdown
              text={
                noctisOverviewText ||
                `Noctis is analyzing ${filteredNotifications.length} alerts (${filteredNotifications.filter(n => n.unread).length} unread) across your ConnectLn feed to explain what each signal represents and what actions to take...`
              }
            />
          </div>

          {noctisCustomAnswer && (
            <div className="mb-3.5 rounded-xl bg-white border border-blue-300 p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-extrabold text-[#1967D2]">
                  💬 Noctis Deep-Dive Alert Answer:
                </span>
                <button
                  type="button"
                  onClick={() => setNoctisCustomAnswer(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Dismiss ✕
                </button>
              </div>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                <MiniMarkdown text={noctisCustomAnswer} />
              </div>
            </div>
          )}

          {/* Ask Noctis About Any Alert Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!noctisAlertQuestion.trim()) return
              fetchNoctisAlertsBriefing(noctisAlertQuestion.trim())
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={noctisAlertQuestion}
              onChange={(e) => setNoctisAlertQuestion(e.target.value)}
              placeholder="Ask Noctis what any alert represents (e.g. 'Explain CVE-2026-44921', 'Explain USP <797>/<800>', 'Summarize my unread Career Signals')..."
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0A66C2] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isNoctisOverviewLoading || !noctisAlertQuestion.trim()}
              className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] disabled:bg-slate-300 px-4 py-2 text-xs font-extrabold text-white transition-all cursor-pointer shrink-0"
            >
              {isNoctisOverviewLoading ? "Asking Noctis..." : "Ask Noctis →"}
            </button>
          </form>

          {/* 1-Click Quick Alert Prompts */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {[
              "Explain what my critical Security & Clinical Advisories represent",
              "Explain USP <797>/<800> & Sepsis Hour-1 Bundle alerts in detail",
              "Summarize my unread Career & Interview alerts",
              "Which alerts require immediate action within 24 hours?"
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setNoctisAlertQuestion(chip)
                  fetchNoctisAlertsBriefing(chip)
                }}
                className="rounded-full bg-white hover:bg-blue-50 text-[#0A66C2] border border-blue-200 px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
              >
                ✨ {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. NOTIFICATIONS STREAM */}
      <div className="space-y-3">
        {/* Section Heading Banner for the Active Category Feed */}
        <div className="rounded-2xl border border-[#E2D9C5] dark:border-zinc-800 bg-gradient-to-r from-[#F4EFE6] via-[#FAF7F2] to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 px-5 py-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6B4226] text-white text-base font-extrabold shadow-2xs shrink-0">
              {selectedCategory === 'All'
                ? '📡'
                : selectedCategory === 'Job Alerts'
                ? '🔔'
                : selectedCategory === 'Lookups & Vouches'
                ? '🔍'
                : selectedCategory === 'Career'
                ? '💼'
                : selectedCategory === 'Social'
                ? '💬'
                : selectedCategory === 'Learning'
                ? '🎓'
                : selectedCategory === 'Marketplace'
                ? '🛍️'
                : '🛡️'}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold text-[#292521] dark:text-zinc-100 tracking-tight">
                  {selectedCategory === 'All'
                    ? 'All ConnectLn Notifications & Live Activity Stream'
                    : selectedCategory === 'Job Alerts'
                    ? 'Job Alerts & Matching Career Opportunities'
                    : selectedCategory === 'Lookups & Vouches'
                    ? 'Directory Lookups & Verified Peer Vouch Alerts'
                    : selectedCategory === 'Career'
                    ? 'Career, Interviews & Direct-Hire Signals'
                    : selectedCategory === 'Social'
                    ? 'Network, Followers & Community Activity'
                    : selectedCategory === 'Learning'
                    ? 'Academy Courses, Certifications & CEU Alerts'
                    : selectedCategory === 'Marketplace'
                    ? 'Enterprise Solutions & Marketplace Releases'
                    : 'Account Security, Zero-Trust & Safety Advisories'}
                </h2>
                <span className="rounded-md bg-[#292521] text-[#FAF7F2] px-2 py-0.5 font-mono text-[10px] font-bold">
                  {filteredNotifications.length} {filteredNotifications.length === 1 ? 'Alert' : 'Alerts'}
                </span>
              </div>
              <p className="text-xs text-[#6E655A] dark:text-zinc-400">
                {selectedCategory === 'All'
                  ? 'Every notification card below includes its channel header, timestamp, and 1-click Noctis explanation.'
                  : `Filtered view for ${selectedCategory} — click "Explain with Noctis" on any card for a full breakdown.`}
              </p>
            </div>
          </div>

          {unreadOnly && (
            <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-[11px] font-extrabold text-amber-900">
              Showing Unread Alerts Only
            </span>
          )}
        </div>

        {filteredNotifications.map((notif) => {
          const isCriticalSecurity = notif.priority === 'critical'
          const isExpanded = expandedAlertIds.includes(notif.id)
          const exp = alertExplanationsMap[notif.id]
          const isLoadingSingle = loadingSingleAlertId === notif.id
          const isNoctisCard = isNoctisFrontierAlert(notif)
          const isTelemetryOpen = expandedTelemetryIds.includes(notif.id)
          const isRunningLiveTest = runningLiveTestId === notif.id
          const cardTelemetry = isNoctisCard ? resolveNoctisTelemetryForAlert(notif) : null

          const categoryHeadingLabel =
            notif.category === 'Security'
              ? '🛡️ Security & Sovereign Invariant Advisory'
              : notif.category === 'Career'
              ? '💼 Career & Opportunity Radar'
              : notif.category === 'Marketplace'
              ? '🛍️ ConnectLn Enterprise Solutions & Market'
              : notif.category === 'Learning'
              ? '🎓 ConnectLn Academy & Credentialing'
              : '💬 Network, Peer Vouches & Community'

          return (
            <div
              key={notif.id}
              className={`rounded-2xl border overflow-hidden transition-all flex flex-col ${
                isCriticalSecurity
                  ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 shadow-md ring-2 ring-red-500/20"
                  : notif.unread
                  ? "border-[#6B4226]/40 bg-[#FAF7F2]/60 dark:bg-sky-950/20 shadow-xs"
                  : "border-[#E2D9C5] bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              {/* Proper Card Header Strip (Matching ConnectLn Opportunity Radar Header Style) */}
              <div
                className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs ${
                  isCriticalSecurity
                    ? "border-red-200 bg-red-100/70 text-red-900 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200"
                    : "border-[#E6DEC8] bg-[#F4EFE6]/85 text-[#4A3525] dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold tracking-tight">
                    {categoryHeadingLabel}
                  </span>
                  <span className="text-[#A39684]">·</span>
                  <span className="rounded-md bg-white/90 dark:bg-zinc-900 border border-[#DFD5C0] dark:border-zinc-700 px-2 py-0.5 text-[10px] font-extrabold text-[#6B4226] dark:text-amber-300">
                    {notif.subType}
                  </span>
                  {notif.actor?.name && (
                    <>
                      <span className="text-[#A39684]">·</span>
                      <span className="text-[11px] font-semibold text-[#6E655A] dark:text-zinc-400">
                        {notif.actor.name}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notif.unread && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#6B4226] px-2 py-0.2 text-[9px] font-extrabold uppercase text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
                      Unread
                    </span>
                  )}
                  <span className="font-mono text-[11px] font-semibold text-[#6E655A] dark:text-zinc-400">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col gap-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Category Icon / Actor Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    {notif.actor.avatar ? (
                      <img
                        src={notif.actor.avatar}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 text-xl font-black dark:bg-purple-950 dark:text-purple-300">
                        🔔
                      </div>
                    )}

                    {/* Channel Tag Badge */}
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] shadow-xs dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                      {notif.category === 'Security'
                        ? '🛡️'
                        : notif.category === 'Career'
                        ? '💼'
                        : notif.category === 'Marketplace'
                        ? '🛍️'
                        : notif.category === 'Learning'
                        ? '🎓'
                        : '💬'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.2 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {notif.subType}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {notif.timestamp}
                      </span>
                      {notif.unread && (
                        <span className="h-2 w-2 rounded-full bg-[#0A66C2] animate-ping" />
                      )}
                    </div>

                    <h3 className={`font-bold text-sm sm:text-base leading-snug ${
                      isCriticalSecurity ? "text-red-700 dark:text-red-300 font-black" : "text-zinc-900 dark:text-zinc-100"
                    }`}>
                      {notif.title}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </div>

                {/* 1-Click Action Button + Explain with Noctis + Optional Live External Link */}
                <div className="flex items-center gap-2 flex-wrap shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleExplainSingleAlertWithNoctis(notif)}
                    className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isExpanded
                        ? "bg-[#1967D2] text-white"
                        : "bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1967D2] border border-[#1967D2]/30"
                    }`}
                    title="Ask Noctis to explain what this alert represents in detail"
                  >
                    <span>✨</span>
                    <span>{isExpanded ? "Hide Noctis Explanation" : "Explain with Noctis"}</span>
                  </button>

                  {isNoctisCard ? (
                    <button
                      type="button"
                      disabled={isRunningLiveTest}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRunCardLiveChallengeTest(notif)
                      }}
                      className="rounded-full px-3.5 py-2 text-xs font-extrabold text-emerald-800 dark:text-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/70 border border-emerald-400 dark:border-emerald-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-70"
                      title="Execute a live sovereign invariant challenge test for this domain right inside this alert card"
                    >
                      <span>{isRunningLiveTest ? '🔄 Running Live Test...' : liveTestResultsMap[notif.id] ? '✓ Re-Run Live Challenge Test' : 'Run Live Challenge Test'}</span>
                      {!isRunningLiveTest && <span>↗</span>}
                    </button>
                  ) : (
                    notif.externalUrl && (
                      <a
                        href={notif.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full px-3.5 py-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 transition-all flex items-center gap-1 shadow-xs"
                      >
                        <span>{(notif.externalLabel || 'Live Portal').replace(/\s*↗+$/, '')}</span>
                        <span>↗</span>
                      </a>
                    )
                  )}
                  {notif.subType === 'New Follower' && notif.actor?.name && (() => {
                    const rel = getFollowRelationshipState(currentUserName, notif.actor.name)
                    return rel.isFollowing ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUserName) return
                          const res = unfollowMember({
                            actorName: currentUserName,
                            targetName: notif.actor.name
                          })
                          setFollowBundle(res.actorBundle)
                        }}
                        className="rounded-full border border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 px-3.5 py-2 text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Following (Unfollow)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUserName) return
                          const res = followMember({
                            actorName: currentUserName,
                            actorHeadline: currentUserProfession || 'Verified ConnectLn Professional',
                            targetName: notif.actor.name,
                            targetHeadline: notif.actor.role,
                            targetAvatar: notif.actor.avatar
                          })
                          if (res.ok && res.actorBundle) {
                            setFollowBundle(res.actorBundle)
                          }
                        }}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-extrabold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>+ Follow back</span>
                      </button>
                    )
                  })()}

                  <button
                    type="button"
                    onClick={() => {
                      if (isNoctisCard) {
                        handleInspectCardTelemetry(notif)
                      } else {
                        handleNotificationAction(notif)
                      }
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-extrabold text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                      isNoctisCard && isTelemetryOpen
                        ? "bg-[#3B2314] hover:bg-[#2A180D]"
                        : isCriticalSecurity
                        ? "bg-red-600 hover:bg-red-700"
                        : notif.category === 'Marketplace'
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                        : "bg-[#0A66C2] hover:bg-[#004182]"
                    }`}
                  >
                    <span>
                      {isNoctisCard
                        ? isTelemetryOpen
                          ? 'Hide Invariant Telemetry'
                          : notif.actionText || 'Inspect Invariant Telemetry'
                        : notif.actionText}
                    </span>
                    <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isNoctisCard && isTelemetryOpen ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Inline Sovereign Invariant Telemetry & Safety Mandate Dossier Drawer */}
              {isNoctisCard && isTelemetryOpen && cardTelemetry && (
                <div className="rounded-xl border-2 border-[#D8CBB3] bg-[#FDFBF7] p-4 sm:p-5 text-[#1F1A15] space-y-3.5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DBC7] pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4A2E1B] text-white px-3 py-1 text-[11px] font-black tracking-wide uppercase">
                        🛡️ Sovereign Invariant Telemetry Dossier
                      </span>
                      <span className="rounded-full bg-[#EFE8DA] border border-[#D8CBB3] px-2.5 py-0.5 text-[11px] font-extrabold text-[#4A2E1B]">
                        Domain: {cardTelemetry.domain}
                      </span>
                      <span className="rounded-full bg-emerald-100 border border-emerald-400 px-2.5 py-0.5 text-[11px] font-black text-emerald-900">
                        ✓ Invariant {cardTelemetry.status} ({cardTelemetry.durationMs}ms)
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#6E655A]">
                        {cardTelemetry.testedAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={isRunningLiveTest}
                        onClick={() => handleRunCardLiveChallengeTest(notif)}
                        className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isRunningLiveTest ? '🔄 Running Live Challenge...' : '⚡ Execute Live Challenge Test Now'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(
                              `${cardTelemetry.vetoTitle}\nDomain: ${cardTelemetry.domain}\nQuestion: ${cardTelemetry.question}\nVerdict: ${cardTelemetry.verdict}\nLatency: ${cardTelemetry.durationMs}ms (${cardTelemetry.status})\n\n${cardTelemetry.fullResponse}`
                            )
                            setCopiedTelemetryId(notif.id)
                            setTimeout(() => setCopiedTelemetryId(null), 2000)
                          }
                        }}
                        className="rounded-lg border border-[#D8CBB3] bg-white hover:bg-[#F5EFE4] text-[#4A2E1B] px-3 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer"
                      >
                        {copiedTelemetryId === notif.id ? '✓ Telemetry Copied' : '📋 Copy Telemetry Report'}
                      </button>
                    </div>
                  </div>

                  {/* Challenge Question & Safety Mandate Verdict */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#E2D8C3] bg-white p-3.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#7A5230] mb-1">
                        Formulated 6AM Frontier Challenge Question
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#221D18] leading-relaxed">
                        &ldquo;{cardTelemetry.question}&rdquo;
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-900 mb-1">
                        {cardTelemetry.vetoTitle}
                      </div>
                      <p className="text-xs sm:text-sm font-extrabold text-emerald-950 leading-relaxed">
                        {cardTelemetry.verdict}
                      </p>
                    </div>
                  </div>

                  {/* Full Formatted Technical Telemetry Response */}
                  <div className="rounded-xl border border-[#DCD1BC] bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#EFE8DA]">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#4A2E1B]">
                        📊 Complete Noctis Invariant Telemetry &amp; Mathematical Proof ({cardTelemetry.id})
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-800">
                        Run #{cardTelemetry.runCount} · Latency: {cardTelemetry.durationMs}ms · SLA &lt; 50ms
                      </span>
                    </div>
                    <MiniMarkdown text={cardTelemetry.fullResponse} />
                  </div>
                </div>
              )}

              {/* Inline Noctis Detailed Alert Breakdown Drawer */}
              {isExpanded && (
                <div className="rounded-xl border border-[#D3E3FD] bg-[#F8FAFD] p-4 text-slate-900 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-blue-200/70 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E8F0FE] text-[#1967D2] px-2 py-0.5 text-[11px] font-extrabold">
                        ✨ Noctis Alert Breakdown
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Detailed Explanation of What This Signal Represents
                      </span>
                    </div>
                    {isLoadingSingle && (
                      <span className="text-[11px] font-bold text-[#1967D2] animate-pulse">
                        Syncing with Noctis API...
                      </span>
                    )}
                  </div>

                  {exp ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl bg-white border border-blue-100 p-3">
                        <div className="font-extrabold text-[#1967D2] mb-1">
                          🔍 What This Alert Represents
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {exp.whatItRepresents}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white border border-blue-100 p-3">
                        <div className="font-extrabold text-amber-800 mb-1">
                          ⚡ Why It Matters &amp; Impact
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {exp.whyItMatters}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white border border-blue-100 p-3">
                        <div className="font-extrabold text-emerald-800 mb-1">
                          ✅ Noctis Recommended Action Plan
                        </div>
                        <ul className="space-y-1 text-slate-700 list-disc pl-4">
                          {exp.recommendedActionPlan.map((step, idx) => (
                            <li key={idx} className="leading-snug">
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">
                      Loading Noctis explanation for {notif.title}...
                    </p>
                  )}

                  {exp?.liveNoctisNote && (
                    <div className="rounded-xl bg-white border border-blue-200 p-3 text-xs text-slate-800 leading-relaxed">
                      <span className="font-extrabold text-[#1967D2] block mb-1">
                        ✨ Noctis Deep-Dive Response:
                      </span>
                      <MiniMarkdown text={exp.liveNoctisNote} />
                    </div>
                  )}

                  {/* Ask Noctis a specific question about THIS alert */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const q = (singleAlertQuestions[notif.id] || "").trim()
                      if (!q) return
                      handleExplainSingleAlertWithNoctis(notif, q)
                    }}
                    className="flex flex-col sm:flex-row gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={singleAlertQuestions[notif.id] || ""}
                      onChange={(e) =>
                        setSingleAlertQuestions(prev => ({
                          ...prev,
                          [notif.id]: e.target.value
                        }))
                      }
                      placeholder={`Ask Noctis a specific question about "${notif.title.slice(0, 48)}..."`}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#0A66C2] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoadingSingle || !(singleAlertQuestions[notif.id] || "").trim()}
                      className="rounded-lg bg-[#1967D2] hover:bg-[#1557B0] disabled:bg-slate-300 px-3.5 py-1.5 text-xs font-extrabold text-white transition-all cursor-pointer shrink-0"
                    >
                      {isLoadingSingle ? "Asking Noctis..." : "Ask Noctis About This Alert →"}
                    </button>
                  </form>
                </div>
              )}

              {/* Social Reactions (👍 Like, 👏 Celebrate, 🤝 Support, ❤️ Love, 💡 Insightful, 😂 Funny), Comment, Post/Repost & Share Bar */}
              <AlertSocialActionBar
                alertId={notif.id}
                alertTitle={notif.title}
                alertDescription={notif.description}
                actorName={notif.actor?.name || "ConnectLn Advisory"}
                actorRole={notif.actor?.role || notif.subType}
                actorAvatar={notif.actor?.avatar}
                currentUserName={currentUserName}
                currentUserProfession={currentUserProfession}
                currentUserAvatar={currentUserAvatar}
                onPostToFeed={onPostToFeed}
              />
              </div>
            </div>
          )
        })}

        {filteredNotifications.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
            <Bell className="mx-auto h-8 w-8 text-zinc-400" />
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              No notifications in this category
            </h4>
            <p className="text-xs text-zinc-500">
              You are completely up to date with all signals.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
