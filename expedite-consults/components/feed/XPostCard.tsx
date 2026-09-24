"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  MoreHorizontal,
  CheckCircle2,
  Sparkles,
  BarChart2,
  BookOpen,
  Send,
  Volume2,
} from "lucide-react";
import { FeedPost, feedStore } from "@/lib/feed-store";
import { FeedMediaCard } from "@/components/feed/FeedMediaCard";

function formatCompact(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num ? num.toString() : "0";
}

interface XPostCardProps {
  post: FeedPost;
  onLike?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onVotePoll?: (postId: string, optionIndex: number) => void;
  onAddComment?: (postId: string, text: string) => void;
  onShare?: (post: FeedPost) => void;
  onFollow?: (username: string) => void;
  onCommentClick?: (postId: string) => void;
  onTagClick?: (tag: string) => void;
  currentUsername?: string;
}

export function XPostCard({
  post,
  onLike,
  onRepost,
  onBookmark,
  onVotePoll,
  onAddComment,
  onShare,
  onFollow,
  onCommentClick,
  onTagClick,
  currentUsername = "kwesi",
}: XPostCardProps) {
  const [isLiked, setIsLiked] = useState(!!post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isReposted, setIsReposted] = useState(!!post.isReposted);
  const [repostsCount, setRepostsCount] = useState(post.repostsCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(!!post.isSaved || !!post.isBookmarked);
  const [poll, setPoll] = useState(post.poll);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState(post.commentsList || []);
  const [commentText, setCommentText] = useState("");
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(post.id);
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    } else {
      const res = feedStore.toggleLike(post.id);
      setIsLiked(res.isLiked);
      setLikesCount(res.likes);
    }
    if (!isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRepost) {
      onRepost(post.id);
      setIsReposted(!isReposted);
      setRepostsCount((prev) => (isReposted ? Math.max(0, prev - 1) : prev + 1));
    } else {
      const res = feedStore.toggleRepost(post.id);
      setIsReposted(res.isReposted);
      setRepostsCount(res.repostsCount);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmark) {
      onBookmark(post.id);
      setIsBookmarked(!isBookmarked);
    } else {
      const res = feedStore.toggleSave(post.id);
      setIsBookmarked(res.isSaved);
    }
  };

  const handleVote = (optionId: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (poll?.hasVoted || poll?.userVotedIndex !== undefined) return;
    if (onVotePoll) {
      onVotePoll(post.id, idx);
    } else {
      const updated = feedStore.votePoll(post.id, optionId);
      if (updated) setPoll(updated);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (onAddComment) {
      onAddComment(post.id, commentText.trim());
      setCommentsList((prev) => [
        {
          id: `c-${Date.now()}`,
          user: "Kwesi Asiedu",
          username: currentUsername,
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
          text: commentText.trim(),
          time: "Just now",
          likes: 0,
        },
        ...prev,
      ]);
      setCommentText("");
    } else {
      const newComment = feedStore.addComment(post.id, commentText.trim(), "Kwesi Asiedu", currentUsername);
      if (newComment) {
        setCommentsList((prev) => [newComment, ...prev]);
        setCommentText("");
      }
    }
  };

  // Render text with clickable hashtags
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (part.startsWith("#") && part.length > 1) {
        return (
          <span
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onTagClick && onTagClick(part);
            }}
            className="text-amber-400 hover:text-amber-300 cursor-pointer font-medium hover:underline"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith("@") && part.length > 1) {
        return (
          <span key={idx} className="text-sky-400 hover:text-sky-300 cursor-pointer font-medium hover:underline">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article className="border-b border-neutral-800 hover:bg-white/[0.02] transition-colors duration-150 p-4 sm:p-5 relative">
      {/* Repost Header if applicable */}
      {post.repostOf && (
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-2 ml-10">
          <Repeat2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{post.author.name} reposted</span>
        </div>
      )}

      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <img
            src={post.author.avatarUrl}
            alt={post.author.name}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-white/10 hover:opacity-90 transition-opacity cursor-pointer"
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Author Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="font-bold text-sm sm:text-base text-white hover:underline cursor-pointer truncate">
                {post.author.name}
              </span>

              {/* Verified Checkmarks */}
              {post.author.badgeType === "gospel" || post.category === "gospel" ? (
                <span className="text-amber-400 text-xs" title="Verified Gospel Leader">
                  ✝️
                </span>
              ) : post.author.verified ? (
                <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 flex-shrink-0" />
              ) : null}

              <span className="text-xs sm:text-sm text-neutral-500 truncate">
                @{post.author.username}
              </span>
              <span className="text-neutral-600 text-xs">·</span>
              <span className="text-xs text-neutral-500 whitespace-nowrap">
                {post.author.timeAgo || "2h"}
              </span>

              {post.category === "gospel" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 ml-1">
                  Gospel
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare && onShare(post);
              }}
              className="text-neutral-500 hover:text-neutral-300 p-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Post Text */}
          <div className="text-sm sm:text-[15px] text-neutral-100 mt-2 leading-relaxed whitespace-pre-line break-words">
            {renderFormattedText(post.content)}
          </div>

          {/* Gospel Scripture Reference Card */}
          {post.scripture && (
            <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-neutral-900 border border-amber-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    {post.scripture.reference} {post.scripture.translation ? `(${post.scripture.translation})` : ""}
                  </span>
                </div>
                {post.scripture.theme && (
                  <span className="text-[10px] font-medium text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    {post.scripture.theme}
                  </span>
                )}
              </div>
              <p className="text-sm font-serif text-neutral-100 italic">
                “{post.scripture.text}”
              </p>
            </div>
          )}

          {/* Media Player Card */}
          {(post.videoUrl || post.imageUrl) && (
            <div className="mt-3.5 rounded-2xl overflow-hidden border border-white/10 max-h-[520px]">
              <FeedMediaCard post={post} />
            </div>
          )}

          {/* Interactive Poll */}
          {poll && (
            <div className="mt-3.5 p-4 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2.5">
              <div className="text-xs font-bold text-neutral-300 mb-2">
                📊 {poll.question}
              </div>
              {poll.options.map((opt) => {
                const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                return (
                  <button
                    key={opt.id}
                    onClick={(e) => handleVote(opt.id, e)}
                    disabled={poll.hasVoted}
                    className={`w-full relative overflow-hidden rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                      opt.voted
                        ? "border-amber-400/60 bg-amber-500/10 text-white"
                        : poll.hasVoted
                        ? "border-white/5 bg-white/[0.02] text-neutral-300"
                        : "border-white/10 bg-neutral-800 hover:bg-neutral-700 hover:border-white/20 text-white cursor-pointer"
                    }`}
                  >
                    {/* Background progress fill if voted */}
                    {poll.hasVoted && (
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                          opt.voted ? "bg-amber-500/25" : "bg-white/10"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {opt.text}
                        {opt.voted && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      </span>
                      {poll.hasVoted && (
                        <span className="font-bold text-neutral-300">
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
              <div className="text-[11px] text-neutral-500 pt-1 flex items-center justify-between">
                <span>{formatCompact(poll.totalVotes)} votes</span>
                {poll.expiresIn && <span>{poll.expiresIn}</span>}
              </div>
            </div>
          )}

          {/* Twitter / X Interactive Action Bar */}
          <div className="flex items-center justify-between text-neutral-500 mt-4 max-w-md pt-1">
            {/* Comment / Reply */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
                onCommentClick && onCommentClick(post.id);
              }}
              className="flex items-center gap-1.5 hover:text-sky-400 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-sky-400/10 transition-colors">
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs">{formatCompact(post.commentsCount + commentsList.length - (post.commentsList?.length || 0))}</span>
            </button>

            {/* Repost */}
            <button
              onClick={handleRepost}
              className={`flex items-center gap-1.5 transition-colors group ${
                isReposted ? "text-emerald-400" : "hover:text-emerald-400"
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-emerald-400/10 transition-colors">
                <Repeat2 className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </div>
              <span className="text-xs">{formatCompact(repostsCount)}</span>
            </button>

            {/* Heart / Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors group relative ${
                isLiked ? "text-rose-500" : "hover:text-rose-500"
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-rose-500/10 transition-colors">
                <Heart className={`w-4 h-4 group-hover:scale-125 transition-transform ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              </div>
              <span className="text-xs">{formatCompact(likesCount)}</span>
              {showHeartBurst && (
                <span className="absolute -top-4 left-2 text-rose-500 text-xs font-bold animate-ping pointer-events-none">
                  +1
                </span>
              )}
            </button>

            {/* View Impressions */}
            <div className="flex items-center gap-1.5 hover:text-sky-400 transition-colors cursor-default">
              <div className="p-2 rounded-full">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className="text-xs">{formatCompact(post.viewsCount || post.likes * 4 + 1200)}</span>
            </div>

            {/* Bookmark & Share */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked
                    ? "text-amber-400 bg-amber-400/10"
                    : "hover:text-amber-400 hover:bg-amber-400/10"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-400" : ""}`} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare && onShare(post);
                }}
                className="p-2 rounded-full hover:text-sky-400 hover:bg-sky-400/10 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* In-Line Comments Drawer */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Post your reply..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold transition-all shadow-sm"
                >
                  Reply
                </button>
              </form>

              {/* Comments Thread */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {commentsList.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                    <img src={c.avatar} alt={c.user} className="w-6 h-6 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{c.user}</span>
                        <span className="text-[10px] text-neutral-500">@{c.username} · {c.time}</span>
                      </div>
                      <p className="text-xs text-neutral-200 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
