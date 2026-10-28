"use client"

import React, { useState, useMemo } from "react"
import {
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  MoreHorizontal,
  Bookmark,
  Share2,
  Check,
  UserPlus,
  UserCheck,
  Globe,
  Lock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Vote,
  Sparkles,
  Award,
  Calendar,
  ShieldCheck,
  CornerDownRight,
  ExternalLink,
  ShoppingBag,
  Star,
  Play,
  BookOpen,
  DollarSign,
  Key,
  Copy,
  Zap,
  Info,
  Eye
} from "lucide-react"
import { Post, ReactionType, Comment, UserProfile, PollData } from "@/lib/connectln-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLanguage } from "@/context/LanguageContext"
import { translatePostText } from "@/lib/translations/post-translator"
import { resolveUserProfilePicture, generatePersonalSignatureAvatar, trackUserActivity } from "@/lib/connectin-storage"
import { buildSharePreviewUrl, useSharePic } from "@/lib/connectin-share"
import { VideoShareBanner } from "./VideoShareBanner"

interface FeedPostCardProps {
  post: Post
  currentUser: UserProfile
  onToggleReaction: (postId: string, reaction: ReactionType | null) => void
  onAddComment: (postId: string, commentText: string, parentCommentId?: string) => void
  onToggleSave: (postId: string) => void
  onFollowToggle?: (authorId: string) => void
  onVotePoll?: (postId: string, optionId: string) => void
  onSelectMember?: (member: any) => void
}

const reactionIcons: Record<ReactionType, { label: string; icon: string; color: string }> = {
  like: { label: 'Like', icon: '👍', color: 'text-[#0A66C2]' },
  celebrate: { label: 'Celebrate', icon: '👏', color: 'text-emerald-600' },
  support: { label: 'Support', icon: '🤝', color: 'text-teal-600' },
  love: { label: 'Love', icon: '❤️', color: 'text-red-500' },
  insightful: { label: 'Insightful', icon: '💡', color: 'text-amber-500' },
  funny: { label: 'Funny', icon: '😂', color: 'text-orange-500' }
}

export function FeedPostCard({
  post,
  currentUser,
  onToggleReaction,
  onAddComment,
  onToggleSave,
  onFollowToggle,
  onVotePoll,
  onSelectMember
}: FeedPostCardProps) {
  const { t, language } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTranslation, setShowTranslation] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [newCommentText, setNewCommentText] = useState("")
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isFollowing, setIsFollowing] = useState(post.author.isFollowing ?? false)
  const [isReposted, setIsReposted] = useState(false)
  const [localRepostBonus, setLocalRepostBonus] = useState(0)

  // Product Discovery Modal State
  const [activeProductModal, setActiveProductModal] = useState<'view' | 'demo' | 'docs' | 'pricing' | 'trial' | 'buy' | null>(null)
  const [trialKey, setTrialKey] = useState("")
  const [copiedTrialKey, setCopiedTrialKey] = useState(false)

  // Document Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  // Poll state
  const [localPoll, setLocalPoll] = useState<PollData | undefined>(post.poll)

  // Automatic translation support
  const translationResult = useMemo(() => {
    return translatePostText(post.content, language)
  }, [post.content, language])

  const activeContent = (showTranslation && translationResult.isTranslated) ? translationResult.text : post.content
  const isLongText = activeContent.length > 240
  const displayedContent = isExpanded || !isLongText ? activeContent : activeContent.slice(0, 240) + "..."

  const [showShareModal, setShowShareModal] = useState(false)
  const isCurrentUserPost =
    post.author.connectionDegree === 'You' ||
    post.id === 'post_dstrike_wheel_masterclass' ||
    post.media?.type === 'video'
  const resolvedAuthorName = isCurrentUserPost
    ? (currentUser.name || post.author.name)
    : post.author.name
  const resolvedAuthorHeadline = isCurrentUserPost
    ? (currentUser.headline || post.author.headline)
    : post.author.headline
  const resolvedUserPic = resolveUserProfilePicture(currentUser)
  const resolvedPostAuthorPic = isCurrentUserPost
    ? resolvedUserPic
    : (post.author.avatar || generatePersonalSignatureAvatar({ name: post.author.name }))

  const postSnippet = (post.content || post.media?.title || "").slice(0, 90).replace(/\n/g, " ").trim()

  const handleReactionSelect = (type: ReactionType) => {
    if (post.userReaction === type) {
      onToggleReaction(post.id, null)
      trackUserActivity({
        actionType: 'POST_UNLIKED',
        actionLabel: `Removed Reaction (${reactionIcons[type].icon} ${reactionIcons[type].label})`,
        category: 'engagement',
        targetId: post.id,
        targetTitle: `Post by ${resolvedAuthorName}`,
        details: `Removed reaction on "${postSnippet}..."`,
        user: currentUser
      })
    } else {
      onToggleReaction(post.id, type)
      trackUserActivity({
        actionType: 'POST_LIKED',
        actionLabel: `Reacted ${reactionIcons[type].icon} ${reactionIcons[type].label} to Post`,
        category: 'engagement',
        targetId: post.id,
        targetTitle: `Post by ${resolvedAuthorName}`,
        details: `Reacted ${reactionIcons[type].icon} ${reactionIcons[type].label} on "${postSnippet}..."`,
        user: currentUser
      })
    }
    setShowReactionPicker(false)
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    const text = newCommentText.trim()
    onAddComment(post.id, text)
    trackUserActivity({
      actionType: 'POST_COMMENTED',
      actionLabel: 'Commented on Post',
      category: 'engagement',
      targetId: post.id,
      targetTitle: `Post by ${resolvedAuthorName}`,
      details: `Comment: "${text}" (on post: "${postSnippet}...")`,
      user: currentUser
    })
    setNewCommentText("")
  }

  const handlePostReply = (parentCommentId: string) => {
    if (!replyText.trim()) return
    const text = replyText.trim()
    onAddComment(post.id, text, parentCommentId)
    trackUserActivity({
      actionType: 'COMMENT_REPLIED',
      actionLabel: 'Replied to a Comment',
      category: 'engagement',
      targetId: post.id,
      targetTitle: `Post by ${resolvedAuthorName}`,
      details: `Reply: "${text}"`,
      user: currentUser
    })
    setReplyText("")
    setReplyToId(null)
  }

  const handleRepostClick = () => {
    setIsReposted(true)
    setLocalRepostBonus(prev => prev + 1)
    trackUserActivity({
      actionType: 'POST_REPOSTED',
      actionLabel: 'Reposted to Network Feed',
      category: 'engagement',
      targetId: post.id,
      targetTitle: `Post by ${resolvedAuthorName}`,
      details: `Reposted "${postSnippet}..." to network feed`,
      user: currentUser
    })
  }

  const sharerPic = useSharePic(resolveUserProfilePicture(currentUser))
  const getPostShareData = () => {
    const origin = "https://www.connectln.app"
    const snippet = (post.content || "").slice(0, 100).replace(/\n/g, ' ').trim()
    const postUrl = buildSharePreviewUrl({
      to: `/connectin?v=connectln5`,
      title: snippet || `Post by ${resolvedAuthorName}`,
      sharerName: currentUser?.name || "",
      pic: sharerPic,
      subtitle: `Post by ${resolvedAuthorName}`,
    })
    const text = `ConnectLn · Shared by ${currentUser?.name || resolvedAuthorName}:\n\n"${snippet}..."\n\n${postUrl}`
    return { origin, postUrl, snippet, text }
  }

  const handleCopyLink = () => {
    const { postUrl } = getPostShareData()
    navigator.clipboard?.writeText(postUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    trackUserActivity({
      actionType: 'POST_SHARED',
      actionLabel: 'Shared Post (Copied Link)',
      category: 'engagement',
      targetId: post.id,
      targetTitle: `Post by ${resolvedAuthorName}`,
      details: `Copied share link for "${postSnippet}..."`,
      user: currentUser
    })
    setShowMenu(false)
    setShowShareModal(false)
  }

  const handleShareWhatsApp = () => {
    const { text } = getPostShareData()
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank")
    trackUserActivity({
      actionType: 'POST_SHARED',
      actionLabel: 'Shared Post via WhatsApp',
      category: 'engagement',
      targetId: post.id,
      targetTitle: `Post by ${resolvedAuthorName}`,
      details: `Shared "${postSnippet}..." to WhatsApp`,
      user: currentUser
    })
    setShowMenu(false)
    setShowShareModal(false)
  }

  const handleShareFacebook = () => {
    const { postUrl, text } = getPostShareData()
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(text)}`, "_blank")
    trackUserActivity({
      actionType: 'POST_SHARED',
      actionLabel: 'Shared Post via Facebook',
      category: 'engagement',
      targetId: post.id,
      targetTitle: `Post by ${resolvedAuthorName}`,
      details: `Shared "${postSnippet}..." to Facebook`,
      user: currentUser
    })
    setShowMenu(false)
    setShowShareModal(false)
  }

  const handleShareTwitter = () => {
    const { postUrl, snippet } = getPostShareData()
    const text = `Post by ${resolvedAuthorName} on ConnectIn: "${snippet}..."`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`, "_blank")
    trackUserActivity({
      actionType: 'POST_SHARED',
      actionLabel: 'Shared Post via 𝕏 (Twitter)',
      category: 'engagement',
      targetId: post.id,
      targetTitle: `Post by ${resolvedAuthorName}`,
      details: `Shared "${postSnippet}..." to 𝕏`,
      user: currentUser
    })
    setShowMenu(false)
    setShowShareModal(false)
  }

  const handleShareInstagram = async () => {
    const { text } = getPostShareData()
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      }
    } catch {}
    window.open("https://www.instagram.com/", "_blank")
    trackUserActivity({
      actionType: 'POST_SHARED',
      actionLabel: 'Shared Post via Instagram',
      category: 'engagement',
      targetId: post.id,
      targetTitle: `Post by ${resolvedAuthorName}`,
      details: `Shared "${postSnippet}..." to Instagram`,
      user: currentUser
    })
    setShowMenu(false)
    setShowShareModal(false)
  }

  const handleShareLinkedIn = () => {
    const { postUrl } = getPostShareData()
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, "_blank")
    trackUserActivity({
      actionType: 'POST_SHARED',
      actionLabel: 'Shared Post via LinkedIn',
      category: 'engagement',
      targetId: post.id,
      targetTitle: `Post by ${resolvedAuthorName}`,
      details: `Shared "${postSnippet}..." to LinkedIn`,
      user: currentUser
    })
    setShowMenu(false)
    setShowShareModal(false)
  }

  const handleVote = (optionId: string) => {
    if (!localPoll || localPoll.userVotedOptionId) return
    const votedOpt = localPoll.options.find(o => o.id === optionId)
    const updatedOptions = localPoll.options.map(opt =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    )
    const updatedPoll: PollData = {
      ...localPoll,
      totalVotes: localPoll.totalVotes + 1,
      userVotedOptionId: optionId,
      options: updatedOptions
    }
    setLocalPoll(updatedPoll)
    trackUserActivity({
      actionType: 'POLL_VOTED',
      actionLabel: 'Voted in Poll',
      category: 'engagement',
      targetId: post.id,
      targetTitle: `Poll by ${resolvedAuthorName}`,
      details: `Voted "${votedOpt?.text || optionId}" on poll "${localPoll.question}"`,
      user: currentUser
    })
    if (onVotePoll) onVotePoll(post.id, optionId)
  }

  return (
    <article className="overflow-visible rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all">
      {/* Celebration Banner Header if milestone */}
      {post.celebration && (
        <div className="flex items-center gap-2 border-b border-amber-100 bg-gradient-to-r from-amber-50/80 to-sky-50/80 px-4 py-2 text-xs font-semibold text-amber-900 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-sky-950/20 dark:text-amber-300">
          <span className="text-base">{post.celebration.badge}</span>
          <span>{post.celebration.headline}</span>
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-start gap-3 min-w-0">
          <div
            onClick={() =>
              onSelectMember?.({
                id: post.author.id,
                name: resolvedAuthorName,
                headline: resolvedAuthorHeadline,
                avatar: resolvedPostAuthorPic
              })
            }
            className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden ring-2 ring-[#0066FF] cursor-pointer hover:ring-[#0A66C2] transition-all"
            title={`Open ${resolvedAuthorName}'s Workspace`}
          >
            <img
              src={resolvedPostAuthorPic}
              alt={resolvedAuthorName}
              onError={(e) => {
                e.currentTarget.src = generatePersonalSignatureAvatar({ name: resolvedAuthorName })
              }}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={() =>
                  onSelectMember?.({
                    id: post.author.id,
                    name: resolvedAuthorName,
                    headline: resolvedAuthorHeadline,
                    avatar: resolvedPostAuthorPic
                  })
                }
                className="font-bold text-sm text-zinc-900 hover:underline hover:text-[#0A66C2] cursor-pointer dark:text-zinc-100"
                title={`Open ${resolvedAuthorName}'s Workspace`}
              >
                {resolvedAuthorName}
              </span>
              {post.author.connectionDegree !== 'You' && (
                <span className="text-xs text-zinc-400 font-normal">
                  · {post.author.connectionDegree}
                </span>
              )}
              {post.author.connectionDegree !== 'You' && onFollowToggle && (
                <button
                  onClick={() => {
                    setIsFollowing(!isFollowing)
                    onFollowToggle(post.author.id)
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0A66C2] hover:bg-sky-50 px-2 py-0.5 rounded-md dark:hover:bg-sky-950/30 ml-1"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="h-3 w-3" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3" /> Follow
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-500 truncate dark:text-zinc-400 mt-0.5">
              {resolvedAuthorHeadline}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
              <span>{post.timestamp}</span>
              <span>·</span>
              {post.visibility === 'Public' ? (
                <Globe className="h-3 w-3 text-zinc-400" />
              ) : (
                <Lock className="h-3 w-3 text-zinc-400" />
              )}
            </div>
          </div>
        </div>

        {/* 3-Dots Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-30 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 text-xs">
                <button
                  onClick={() => {
                    onToggleSave(post.id)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Bookmark className={`h-4 w-4 ${post.isSaved ? "fill-zinc-700 dark:fill-zinc-200 text-transparent" : ""}`} />
                  <span>{post.isSaved ? t("unsave_post", "Unsave post") : t("save_post", "Save post")}</span>
                </button>
                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800 pt-1">
                  <span className="px-3 py-0.5 text-[10px] uppercase font-bold text-zinc-400 block">Share Post</span>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <svg className="h-3.5 w-3.5 fill-current text-[#25D366] shrink-0" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handleShareFacebook}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <svg className="h-3.5 w-3.5 fill-current text-[#1877F2] shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <span className="font-black text-xs">𝕏</span>
                    <span>Post on 𝕏</span>
                  </button>
                  <button
                    onClick={handleShareInstagram}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <svg className="h-3.5 w-3.5 fill-current text-[#E1306C] shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={handleShareLinkedIn}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <span className="text-[#0A66C2] font-black text-xs">in</span>
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>{copiedLink ? t("link_copied", "Link copied!") : t("copy_link", "Copy link")}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      <div className="px-4 py-2 text-xs sm:text-sm text-zinc-800 leading-relaxed dark:text-zinc-200 whitespace-pre-line">
        {displayedContent}
        {isLongText && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="ml-1 font-semibold text-zinc-500 hover:text-[#0A66C2] focus:outline-none"
          >
            {t("see_more", "...see more")}
          </button>
        )}

        {/* ConnectLn-style Translation Toggle */}
        {language !== "en" && translationResult.isTranslated && (
          <div className="pt-1.5 flex items-center gap-1.5 text-[11px]">
            <Globe className="h-3 w-3 text-[#0A66C2] dark:text-sky-400 shrink-0" />
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className="font-bold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
            >
              {showTranslation
                ? t("see_original", "See original")
                : t("see_translation", "See translation")}
            </button>
            <span className="text-zinc-400">·</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {showTranslation ? `${t("translated_by", "Translated")} (${language.toUpperCase()})` : "English"}
            </span>
          </div>
        )}
      </div>

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2 text-xs font-semibold text-[#0A66C2]">
          {post.hashtags.map((tag, idx) => (
            <span key={idx} className="hover:underline cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 1. INTERACTIVE POLL BLOCK (If post has poll) */}
      {localPoll && (
        <div className="mx-4 my-2 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              {localPoll.question}
            </h4>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              {localPoll.timeRemaining}
            </span>
          </div>

          <div className="space-y-2.5">
            {localPoll.options.map((option) => {
              const hasVoted = Boolean(localPoll.userVotedOptionId)
              const isSelected = localPoll.userVotedOptionId === option.id
              const percentage = localPoll.totalVotes > 0
                ? Math.round((option.votes / localPoll.totalVotes) * 100)
                : 0

              return (
                <div key={option.id} className="relative">
                  {hasVoted ? (
                    <div className="relative overflow-hidden rounded-lg border border-zinc-300 bg-white py-2.5 px-3 dark:border-zinc-700 dark:bg-zinc-800">
                      {/* Percentage Bar */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
                          isSelected ? "bg-sky-100 dark:bg-sky-950/60" : "bg-zinc-100 dark:bg-zinc-700/40"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="relative z-10 flex items-center justify-between text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        <span className="flex items-center gap-1.5 truncate">
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />}
                          <span className={isSelected ? "font-bold text-[#0A66C2]" : ""}>{option.text}</span>
                        </span>
                        <span className="font-bold ml-2 shrink-0">{percentage}%</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleVote(option.id)}
                      className="w-full rounded-lg border border-zinc-300 bg-white py-2 px-3 text-left text-xs font-semibold text-zinc-700 hover:border-[#0A66C2] hover:bg-sky-50/50 hover:text-[#0A66C2] transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-sky-500"
                    >
                      {option.text}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
            <span>{localPoll.totalVotes.toLocaleString()} votes cast</span>
            {localPoll.userVotedOptionId && (
              <span className="font-semibold text-emerald-600">✓ Vote recorded</span>
            )}
          </div>
        </div>
      )}

      {/* 2. DOCUMENT / MULTI-PAGE SLIDER (If post is document) */}
      {post.document && (
        <div className="relative mx-4 my-2 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900 text-white shadow-md dark:border-zinc-800">
          <div className="flex items-center justify-between bg-zinc-950 px-4 py-2 text-xs border-b border-zinc-800">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300 truncate">
              <FileText className="h-4 w-4 text-[#0A66C2]" />
              {post.document.title}
            </span>
            <span className="text-zinc-400 font-mono">
              {currentSlideIndex + 1} / {post.document.totalPages}
            </span>
          </div>

          {/* Slide Content Box */}
          <div className={`p-8 min-h-[220px] flex flex-col justify-between bg-gradient-to-br ${
            post.document.slides[currentSlideIndex]?.bgColor || "from-blue-600 to-indigo-900"
          }`}>
            <div>
              <span className="inline-block rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-sky-200 backdrop-blur-xs">
                {post.document.slides[currentSlideIndex]?.visualTag || "SLIDE"}
              </span>
              <h3 className="mt-3 text-lg font-bold text-white leading-snug">
                {post.document.slides[currentSlideIndex]?.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-100 leading-relaxed max-w-lg">
                {post.document.slides[currentSlideIndex]?.content}
              </p>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <div className="flex gap-1.5">
                {post.document.slides.map((_, sIdx) => (
                  <span
                    key={sIdx}
                    onClick={() => setCurrentSlideIndex(sIdx)}
                    className={`h-1.5 rounded-full cursor-pointer transition-all ${
                      sIdx === currentSlideIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentSlideIndex(Math.min(post.document!.totalPages - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === post.document.totalPages - 1}
                className="flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. QUOTE REPOST EMBED BLOCK */}
      {post.quotedPost && (
        <div className="mx-4 my-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-start gap-2.5">
            <img
              src={post.quotedPost.authorAvatar}
              alt={post.quotedPost.authorName}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                {post.quotedPost.authorName}
              </p>
              <p className="text-[11px] text-zinc-500 truncate dark:text-zinc-400">
                {post.quotedPost.authorHeadline}
              </p>
              <p className="text-[10px] text-zinc-400">{post.quotedPost.timestamp}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-300 leading-normal line-clamp-3">
            {post.quotedPost.content}
          </p>
        </div>
      )}

      {/* 4. EMBEDDED PRODUCT DISCOVERY CARD */}
      {post.embeddedProduct && (
        <div className="mx-4 my-3 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 p-4 sm:p-5 text-zinc-900 dark:text-zinc-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#0A66C2] dark:text-sky-300 text-2xl shadow-xs shrink-0 border border-blue-200 dark:border-blue-800">
                {post.embeddedProduct.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    {post.embeddedProduct.name}
                  </h4>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-semibold text-[#0A66C2] dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                    {post.embeddedProduct.badge}
                  </span>
                </div>
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {post.embeddedProduct.tagline}
                </p>
                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {post.embeddedProduct.pricing}
                  </span>
                  {post.embeddedProduct.rating && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {post.embeddedProduct.rating} ({post.embeddedProduct.reviewsCount} reviews)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-3">
            {post.embeddedProduct.description}
          </p>

          {/* Key Features Checklist */}
          {post.embeddedProduct.keyFeatures && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-3 pb-1 border-t border-zinc-200 dark:border-zinc-700/60 mt-3">
              {post.embeddedProduct.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          )}

          {/* 6-ACTION PRODUCT DISCOVERY ENGINE BAR */}
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {/* 1. View Product */}
            <button
              type="button"
              onClick={() => setActiveProductModal('view')}
              className="rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 py-1.5 px-2 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1 border border-zinc-200 dark:border-zinc-700 shadow-2xs cursor-pointer"
              title="View Product Overview"
            >
              <Eye className="h-3.5 w-3.5 text-[#0A66C2]" />
              <span>View</span>
            </button>

            {/* 2. Demo */}
            {post.embeddedProduct.demoUrl ? (
              <a
                href={post.embeddedProduct.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 py-1.5 px-2 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1 border border-zinc-200 dark:border-zinc-700 shadow-2xs"
                title="Live Sandbox Demo"
              >
                <Play className="h-3.5 w-3.5 text-emerald-600" />
                <span>Demo</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setActiveProductModal('demo')}
                className="rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 py-1.5 px-2 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1 border border-zinc-200 dark:border-zinc-700 shadow-2xs cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 text-emerald-600" />
                <span>Demo</span>
              </button>
            )}

            {/* 3. Documentation */}
            <a
              href={post.embeddedProduct.docsUrl || "https://portal.expediteconsults.com"}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 py-1.5 px-2 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1 border border-zinc-200 dark:border-zinc-700 shadow-2xs"
              title="Technical Docs & Architecture"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-600" />
              <span>Docs</span>
            </a>

            {/* 4. Pricing */}
            <button
              type="button"
              onClick={() => setActiveProductModal('pricing')}
              className="rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 py-1.5 px-2 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1 border border-zinc-200 dark:border-zinc-700 shadow-2xs cursor-pointer"
              title="View Pricing & Plans"
            >
              <DollarSign className="h-3.5 w-3.5 text-teal-600" />
              <span>Pricing</span>
            </button>

            {/* 5. Start Trial */}
            <button
              type="button"
              onClick={() => {
                const key = 'TRIAL-EXP-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-2026'
                setTrialKey(key)
                setActiveProductModal('trial')
              }}
              className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] py-1.5 px-2 text-[11px] font-semibold text-white transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
              title="Generate Instant 14-Day Trial License"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Trial</span>
            </button>

            {/* 6. Buy / License */}
            <a
              href={post.embeddedProduct.buyUrl || "https://portal.expediteconsults.com"}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 py-1.5 px-2 text-[11px] font-semibold text-white transition-colors flex items-center justify-center gap-1 shadow-2xs"
              title="Buy Commercial License"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Buy</span>
            </a>
          </div>
        </div>
      )}

      {/* Standard Image Media with Profile Picture Inserted into ConnectLn Logo Header */}
      {post.media && post.media.type === 'image' && (
        <div className="mx-4 my-3 overflow-hidden rounded-2xl border border-zinc-800 shadow-md" style={{ backgroundColor: '#171513' }}>
          {/* Official ConnectLn Logo Strip with Profile Picture Inserted */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10" style={{ backgroundColor: '#171513', color: '#F5F0EB' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={resolvedPostAuthorPic}
                alt={resolvedAuthorName}
                onError={(e) => {
                  e.currentTarget.src = generatePersonalSignatureAvatar({ name: resolvedAuthorName })
                }}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-[#0066FF] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-extrabold truncate" style={{ color: '#F5F0EB' }}>{resolvedAuthorName}</p>
                <p className="text-[10px] truncate" style={{ color: '#9E9891' }}>Tickets, vouches, and real work</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <img
                src="/brand/connectln-icon-256.png"
                alt="ConnectLn"
                className="h-7 w-7 rounded-lg object-contain"
              />
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight leading-none" style={{ color: '#F5F0EB' }}>ConnectLn</span>
                <span className="mt-0.5 h-1 w-4/5 rounded-full" style={{ backgroundColor: '#A64532' }} />
              </div>
            </div>
          </div>
          <div className="relative w-full overflow-hidden bg-zinc-900 max-h-[480px]">
            <img
              src={post.media.url}
              alt="Post content"
              className="w-full object-cover max-h-[480px]"
            />
          </div>
        </div>
      )}

      {/* Signature Profile + ConnectLn Video Share Banner (When a video is shared from The Wheel or anywhere on ConnectLn) */}
      {post.media && post.media.type === 'video' && (
        <div className="mx-4 my-3">
          <VideoShareBanner
            avatarUrl={resolvedPostAuthorPic}
            userAvatar={resolvedPostAuthorPic}
            authorName={resolvedAuthorName}
            authorHeadline={resolvedAuthorHeadline}
            brandName="ConnectLn"
            videoTitle={post.media.title || "ConnectLn Masterclass & Technical Briefing"}
            videoSubtitle={post.media.description || resolvedAuthorHeadline}
            youtubeId={post.media.youtubeId}
            thumbnailUrl={post.media.thumbnailUrl}
            videoUrl={post.media.url}
            duration={post.media.duration || "5:00"}
            serialPlate={post.media.serialPlate}
            takeaways={post.media.takeaways}
          />
        </div>
      )}

      {/* Post Stats (Social Proof) */}
      <div className="mx-4 flex items-center justify-between border-b border-zinc-100 py-2.5 text-[11px] sm:text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#0A66C2] text-[10px] text-white shadow-xs">
              👍
            </span>
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-xs">
              ❤️
            </span>
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white shadow-xs">
              💡
            </span>
          </div>
          <span className="hover:underline hover:text-[#0A66C2] cursor-pointer">
            {post.stats.likesCount + (post.userReaction ? 1 : 0)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline hover:text-[#0A66C2]"
          >
            {post.comments.length} {t("comments_count", "comments")}
          </button>
          <span>·</span>
          <span className="hover:underline hover:text-[#0A66C2]">
            {post.stats.repostsCount + localRepostBonus} {t("reposts_count", "reposts")}
          </span>
        </div>
      </div>

      {/* Interactive Action Bar (Like, Comment, Repost, Send) */}
      <div className="relative flex items-center justify-around px-1 sm:px-2 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        {/* Floating Reaction Bar on Hover / Long Press */}
        {showReactionPicker && (
          <div
            onMouseEnter={() => setShowReactionPicker(true)}
            onMouseLeave={() => setShowReactionPicker(false)}
            className="absolute -top-12 left-4 z-30 flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {Object.entries(reactionIcons).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleReactionSelect(key as ReactionType)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-transform hover:scale-135 hover:-translate-y-1"
                title={config.label}
              >
                {config.icon}
              </button>
            ))}
          </div>
        )}

        {/* Like Button */}
        <div
          className="relative"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          <button
            onClick={() => handleReactionSelect(post.userReaction || 'like')}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-md px-2 sm:px-3 py-2 text-[11px] sm:text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              post.userReaction ? reactionIcons[post.userReaction].color : ""
            }`}
          >
            {post.userReaction ? (
              <span className="text-sm sm:text-base">{reactionIcons[post.userReaction].icon}</span>
            ) : (
              <ThumbsUp className="h-4 w-4" />
            )}
            <span>
              {post.userReaction ? reactionIcons[post.userReaction].label : t("like", "Like")}
            </span>
          </button>
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 sm:gap-1.5 rounded-md px-2 sm:px-3 py-2 text-[11px] sm:text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{t("comment", "Comment")}</span>
        </button>

        {/* Repost Button */}
        <button
          onClick={handleRepostClick}
          className={`flex items-center gap-1 sm:gap-1.5 rounded-md px-2 sm:px-3 py-2 text-[11px] sm:text-xs transition-colors cursor-pointer ${
            isReposted
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <Repeat2 className="h-4 w-4" />
          <span>{isReposted ? "Reposted ✓" : t("repost", "Repost")}</span>
        </button>

        {/* Multi-Social Share Button & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowShareModal(!showShareModal)}
            className="flex items-center gap-1 sm:gap-1.5 rounded-md px-2 sm:px-3 py-2 text-[11px] sm:text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>

          {showShareModal && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowShareModal(false)} />
              <div className="absolute left-0 bottom-full mb-2 z-30 w-64 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                {/* Official ConnectLn Logo Card Preview with Profile Picture Inserted */}
                <div
                  className="flex items-center gap-3 rounded-lg p-2.5 border border-zinc-800 shadow-sm"
                  style={{ backgroundColor: '#171513', color: '#F5F0EB' }}
                >
                  <img
                    src={resolvedUserPic}
                    alt={currentUser.name}
                    onError={(e) => {
                      e.currentTarget.src = "/brand/kwesi-avatar.png"
                    }}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[#0066FF] shrink-0"
                  />
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <img
                      src="/brand/connectln-icon-256.png"
                      alt="ConnectLn"
                      className="h-7 w-7 rounded-md object-contain shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex flex-col">
                        <span className="text-sm font-black tracking-tight leading-none" style={{ color: '#F5F0EB' }}>
                          ConnectLn
                        </span>
                        <span className="mt-0.5 h-1 w-4/5 rounded-full" style={{ backgroundColor: '#A64532' }} />
                      </div>
                      <p className="text-[9px] truncate mt-0.5" style={{ color: '#9E9891' }}>
                        Tickets, vouches, and real work
                      </p>
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 text-[10px] uppercase font-bold text-zinc-400 block border-b border-zinc-100 dark:border-zinc-800 pb-1">
                  Share ConnectLn Card to:
                </span>
                
                {/* 1. WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-200 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4 fill-current text-[#25D366] shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
                  </svg>
                  <span className="font-semibold">WhatsApp</span>
                </button>

                {/* 2. Facebook */}
                <button
                  onClick={handleShareFacebook}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-700 hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-200 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4 fill-current text-[#1877F2] shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="font-semibold">Facebook</span>
                </button>

                {/* 3. X (Twitter) */}
                <button
                  onClick={handleShareTwitter}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-700 hover:bg-zinc-100 hover:text-black dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <span className="font-black text-xs w-4 text-center">𝕏</span>
                  <span className="font-semibold">Post on 𝕏</span>
                </button>

                {/* 4. Instagram */}
                <button
                  onClick={handleShareInstagram}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-700 hover:bg-pink-50 hover:text-[#E1306C] dark:text-zinc-200 dark:hover:bg-pink-950/40 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4 fill-current text-[#E1306C] shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="font-semibold">Instagram</span>
                </button>

                {/* 5. LinkedIn */}
                <button
                  onClick={handleShareLinkedIn}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-700 hover:bg-sky-50 hover:text-[#0A66C2] dark:text-zinc-200 dark:hover:bg-sky-950/40 transition-colors cursor-pointer"
                >
                  <span className="text-[#0A66C2] font-black text-xs w-4 text-center">in</span>
                  <span className="font-semibold">LinkedIn</span>
                </button>

                {/* 6. Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-100 dark:border-zinc-800 pt-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-zinc-500" />}
                  <span className="font-semibold">{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Quick Direct WhatsApp Button */}
        <button
          onClick={handleShareWhatsApp}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-zinc-600 hover:text-[#25D366] hover:bg-emerald-50 dark:text-zinc-300 dark:hover:text-[#25D366] dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
          title="Share to WhatsApp"
        >
          <svg className="w-4 h-4 fill-current shrink-0 text-[#25D366]" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
          </svg>
          <span className="hidden sm:inline font-semibold">WhatsApp</span>
        </button>
      </div>

      {/* Expanded Comment Section */}
      {showComments && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
          {/* Add Comment Input */}
          <form onSubmit={handlePostComment} className="flex items-start gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center rounded-full border border-zinc-300 bg-white px-3 py-1.5 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800">
                <input
                  type="text"
                  placeholder={t("add_comment_placeholder", "Add a comment or thought...")}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="rounded-full bg-[#0A66C2] p-1 text-white disabled:opacity-30 hover:bg-[#004182]"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3 pt-1">
            {post.comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="rounded-xl bg-zinc-100 p-3 text-xs dark:bg-zinc-800/80">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {comment.author.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 truncate max-w-xs dark:text-zinc-400">
                            {comment.author.headline}
                          </p>
                        </div>
                        <span className="text-[10px] text-zinc-400">{comment.timestamp}</span>
                      </div>
                      <p className="mt-2 text-zinc-800 leading-normal dark:text-zinc-200">
                        {comment.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 px-2 pt-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                      <button className="hover:text-[#0A66C2]">
                        Like {comment.likesCount > 0 && `· ${comment.likesCount}`}
                      </button>
                      <span>·</span>
                      <button
                        onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                        className="hover:text-[#0A66C2]"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Inline Reply Input */}
                    {replyToId === comment.id && (
                      <div className="mt-2 flex items-center gap-2 pl-4">
                        <CornerDownRight className="h-4 w-4 text-zinc-400 shrink-0" />
                        <input
                          type="text"
                          placeholder={`Reply to ${comment.author.name}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePostReply(comment.id)
                          }}
                          className="flex-1 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          autoFocus
                        />
                        <button
                          onClick={() => handlePostReply(comment.id)}
                          disabled={!replyText.trim()}
                          className="rounded-full bg-[#0A66C2] px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
                        >
                          Reply
                        </button>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 space-y-2 pl-6 border-l-2 border-zinc-200 dark:border-zinc-700">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <img
                              src={reply.author.avatar}
                              alt={reply.author.name}
                              className="h-6 w-6 rounded-full object-cover shrink-0"
                            />
                            <div className="flex-1 rounded-lg bg-zinc-100/70 p-2.5 text-xs dark:bg-zinc-800/50">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {reply.author.name}
                              </p>
                              <p className="text-zinc-800 dark:text-zinc-200 mt-1">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PRODUCT ACTION MODALS (View Product, Pricing, Trial License) */}
      {post.embeddedProduct && (
        <Dialog open={Boolean(activeProductModal)} onOpenChange={() => setActiveProductModal(null)}>
          <DialogContent className="max-w-lg">
            {/* VIEW PRODUCT MODAL */}
            {activeProductModal === 'view' && (
              <div className="space-y-4">
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{post.embeddedProduct.icon}</span>
                    <div>
                      <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {post.embeddedProduct.name}
                      </DialogTitle>
                      <span className="text-xs text-purple-600 font-semibold">{post.embeddedProduct.category}</span>
                    </div>
                  </div>
                </DialogHeader>

                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {post.embeddedProduct.tagline}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {post.embeddedProduct.description}
                </p>

                {post.embeddedProduct.keyFeatures && (
                  <div className="space-y-1.5 pt-2">
                    <h5 className="font-bold text-xs text-zinc-800 dark:text-zinc-200">Capabilities Included:</h5>
                    {post.embeddedProduct.keyFeatures.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {post.embeddedProduct.pricing}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveProductModal('trial')}
                      className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
                    >
                      Start Free Trial
                    </button>
                    {post.embeddedProduct.demoUrl && (
                      <a
                        href={post.embeddedProduct.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182]"
                      >
                        Open Sandbox →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PRICING MODAL */}
            {activeProductModal === 'pricing' && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span>Pricing & Subscription Tiers</span>
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 space-y-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Standard Enterprise</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">$499 <span className="text-xs font-normal text-zinc-400">/ mo</span></p>
                    <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                      <li>✓ Continuous AppSec scanning</li>
                      <li>✓ AI-BOM & LLM analyzer</li>
                      <li>✓ Standard SLAs</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-purple-400 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-950/20 space-y-2">
                    <span className="text-xs font-bold text-purple-600 uppercase">Defense Enclave</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">$1,499 <span className="text-xs font-normal text-zinc-400">/ mo</span></p>
                    <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                      <li>✓ Autonomous pentest queue</li>
                      <li>✓ XM Cyber Choke Point graph</li>
                      <li>✓ 24/7 Red Team support</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveProductModal('trial')}
                    className="rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182]"
                  >
                    Activate 14-Day Trial
                  </button>
                </div>
              </div>
            )}

            {/* TRIAL KEY ACTIVATION MODAL */}
            {activeProductModal === 'trial' && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <span>Instant 14-Day Trial Activation</span>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 pt-1 text-xs">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Your sandbox trial key for <strong>{post.embeddedProduct.name}</strong> has been generated and provisioned. No credit card required.
                  </p>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">
                      License Key
                    </label>
                    <div className="flex items-center justify-between rounded-lg border border-zinc-300 bg-zinc-100 p-2.5 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800">
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {trialKey || 'TRIAL-EXP-9X42-2026'}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(trialKey || 'TRIAL-EXP-9X42-2026')
                          setCopiedTrialKey(true)
                          setTimeout(() => setCopiedTrialKey(false), 2000)
                        }}
                        className="rounded-md bg-white px-2 py-1 text-[11px] font-bold text-zinc-700 shadow-2xs dark:bg-zinc-700 dark:text-zinc-200"
                      >
                        {copiedTrialKey ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => setActiveProductModal(null)}
                    className="rounded-full px-4 py-1.5 text-xs font-bold text-zinc-600"
                  >
                    Done
                  </button>
                  <a
                    href={post.embeddedProduct.demoUrl || "https://portal.expediteconsults.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182] flex items-center gap-1"
                  >
                    <span>Launch Trial Environment</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </article>
  )
}
