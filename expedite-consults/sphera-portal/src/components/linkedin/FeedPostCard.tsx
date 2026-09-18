"use client"

import React, { useState } from "react"
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
import { Post, ReactionType, Comment, UserProfile, PollData } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FeedPostCardProps {
  post: Post
  currentUser: UserProfile
  onToggleReaction: (postId: string, reaction: ReactionType | null) => void
  onAddComment: (postId: string, commentText: string, parentCommentId?: string) => void
  onToggleSave: (postId: string) => void
  onFollowToggle?: (authorId: string) => void
  onVotePoll?: (postId: string, optionId: string) => void
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
  onVotePoll
}: FeedPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newCommentText, setNewCommentText] = useState("")
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isFollowing, setIsFollowing] = useState(post.author.isFollowing ?? false)

  // Product Discovery Modal State
  const [activeProductModal, setActiveProductModal] = useState<'view' | 'demo' | 'docs' | 'pricing' | 'trial' | 'buy' | null>(null)
  const [trialKey, setTrialKey] = useState("")
  const [copiedTrialKey, setCopiedTrialKey] = useState(false)

  // Document Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  // Poll state
  const [localPoll, setLocalPoll] = useState<PollData | undefined>(post.poll)

  const isLongText = post.content.length > 240
  const displayedContent = isExpanded || !isLongText ? post.content : post.content.slice(0, 240) + "..."

  const handleReactionSelect = (type: ReactionType) => {
    if (post.userReaction === type) {
      onToggleReaction(post.id, null)
    } else {
      onToggleReaction(post.id, type)
    }
    setShowReactionPicker(false)
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    onAddComment(post.id, newCommentText.trim())
    setNewCommentText("")
  }

  const handlePostReply = (parentCommentId: string) => {
    if (!replyText.trim()) return
    onAddComment(post.id, replyText.trim(), parentCommentId)
    setReplyText("")
    setReplyToId(null)
  }

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    setShowMenu(false)
  }

  const handleVote = (optionId: string) => {
    if (!localPoll || localPoll.userVotedOptionId) return
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
          <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-zinc-900 hover:underline hover:text-[#0A66C2] cursor-pointer dark:text-zinc-100">
                {post.author.name}
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
              {post.author.headline}
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
                  <span>{post.isSaved ? "Unsave post" : "Save post"}</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{copiedLink ? "Link copied!" : "Copy link to post"}</span>
                </button>
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
            ...see more
          </button>
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

      {/* 4. EMBEDDED PRODUCT DISCOVERY CARD (6-ACTION COMMERCE ENGINE) */}
      {post.embeddedProduct && (
        <div className="mx-4 my-3 overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/90 to-purple-950 p-4 sm:p-5 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-2xl shadow-md shrink-0">
                {post.embeddedProduct.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-sm sm:text-base text-white">
                    {post.embeddedProduct.name}
                  </h4>
                  <span className="rounded-full bg-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-200 border border-purple-400/40">
                    {post.embeddedProduct.badge}
                  </span>
                </div>
                <p className="text-xs font-semibold text-purple-200/90">
                  {post.embeddedProduct.tagline}
                </p>
                <div className="flex items-center gap-3 text-xs text-purple-300/80 pt-0.5">
                  <span className="font-bold text-emerald-400">
                    {post.embeddedProduct.pricing}
                  </span>
                  {post.embeddedProduct.rating && (
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <Star className="h-3 w-3 fill-amber-300" />
                      {post.embeddedProduct.rating} ({post.embeddedProduct.reviewsCount} reviews)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed mt-3">
            {post.embeddedProduct.description}
          </p>

          {/* Key Features Checklist */}
          {post.embeddedProduct.keyFeatures && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-3 pb-1 border-t border-white/10 mt-3">
              {post.embeddedProduct.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                  <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          )}

          {/* 6-ACTION PRODUCT DISCOVERY ENGINE BAR */}
          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {/* 1. View Product */}
            <button
              onClick={() => setActiveProductModal('view')}
              className="rounded-lg bg-white/10 hover:bg-white/20 py-2 px-2 text-[11px] font-bold text-white transition-all flex items-center justify-center gap-1 border border-white/15 shadow-2xs"
              title="View Product Overview"
            >
              <Eye className="h-3.5 w-3.5 text-sky-400" />
              <span>View</span>
            </button>

            {/* 2. Demo */}
            {post.embeddedProduct.demoUrl ? (
              <a
                href={post.embeddedProduct.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-white/10 hover:bg-white/20 py-2 px-2 text-[11px] font-bold text-white transition-all flex items-center justify-center gap-1 border border-white/15 shadow-2xs"
                title="Live Sandbox Demo"
              >
                <Play className="h-3.5 w-3.5 text-emerald-400" />
                <span>Demo</span>
              </a>
            ) : (
              <button
                onClick={() => setActiveProductModal('demo')}
                className="rounded-lg bg-white/10 hover:bg-white/20 py-2 px-2 text-[11px] font-bold text-white transition-all flex items-center justify-center gap-1 border border-white/15"
              >
                <Play className="h-3.5 w-3.5 text-emerald-400" />
                <span>Demo</span>
              </button>
            )}

            {/* 3. Documentation */}
            <a
              href={post.embeddedProduct.docsUrl || "https://portal.expediteconsults.com"}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-white/10 hover:bg-white/20 py-2 px-2 text-[11px] font-bold text-white transition-all flex items-center justify-center gap-1 border border-white/15 shadow-2xs"
              title="Technical Docs & Architecture"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span>Docs</span>
            </a>

            {/* 4. Pricing */}
            <button
              onClick={() => setActiveProductModal('pricing')}
              className="rounded-lg bg-white/10 hover:bg-white/20 py-2 px-2 text-[11px] font-bold text-white transition-all flex items-center justify-center gap-1 border border-white/15 shadow-2xs"
              title="View Pricing & Plans"
            >
              <DollarSign className="h-3.5 w-3.5 text-teal-400" />
              <span>Pricing</span>
            </button>

            {/* 5. Start Trial */}
            <button
              onClick={() => {
                const key = 'TRIAL-EXP-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-2026'
                setTrialKey(key)
                setActiveProductModal('trial')
              }}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2 px-2 text-[11px] font-extrabold text-white transition-all flex items-center justify-center gap-1 shadow-md border border-purple-400/40"
              title="Generate Instant 14-Day Trial License"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>Trial</span>
            </button>

            {/* 6. Buy / License */}
            <a
              href={post.embeddedProduct.buyUrl || "https://portal.expediteconsults.com"}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 px-2 text-[11px] font-extrabold text-white transition-all flex items-center justify-center gap-1 shadow-md"
              title="Buy Commercial License"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Buy</span>
            </a>
          </div>
        </div>
      )}

      {/* Standard Image Media */}
      {post.media && post.media.type === 'image' && (
        <div className="relative mt-2 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 max-h-[480px]">
          <img
            src={post.media.url}
            alt="Post content"
            className="w-full object-cover max-h-[480px]"
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
            {post.comments.length} comments
          </button>
          <span>·</span>
          <span className="hover:underline hover:text-[#0A66C2]">
            {post.stats.repostsCount} reposts
          </span>
        </div>
      </div>

      {/* Interactive Action Bar (Like, Comment, Repost, Send) */}
      <div className="relative flex items-center justify-around px-2 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
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
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              post.userReaction ? reactionIcons[post.userReaction].color : ""
            }`}
          >
            {post.userReaction ? (
              <span className="text-base">{reactionIcons[post.userReaction].icon}</span>
            ) : (
              <ThumbsUp className="h-4 w-4" />
            )}
            <span>
              {post.userReaction ? reactionIcons[post.userReaction].label : "Like"}
            </span>
          </button>
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Comment</span>
        </button>

        {/* Repost Button */}
        <button
          onClick={() => alert("Post reposted to your network!")}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          <Repeat2 className="h-4 w-4" />
          <span>Repost</span>
        </button>

        {/* Send Button */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Send className="h-4 w-4" />}
          <span>{copiedLink ? "Sent" : "Send"}</span>
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
                  placeholder="Add a comment or thought..."
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
