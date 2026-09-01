"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from "lucide-react";
import { cn, timeAgo, formatCount } from "@/lib/utils";
import type { PostWithDetails } from "@/types";

interface PostCardProps {
  post: PostWithDetails;
}

async function toggleLike(postId: string): Promise<{ liked: boolean; count: number }> {
  const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function PostCard({ post }: PostCardProps) {
  const queryClient = useQueryClient();
  const [localLiked, setLocalLiked] = useState(post.isLiked ?? false);
  const [localCount, setLocalCount] = useState(post._count.reactions);

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post.id),
    onMutate: () => {
      setLocalLiked((prev: boolean) => !prev);
      setLocalCount((prev: number) => localLiked ? prev - 1 : prev + 1);
    },
    onSuccess: (data) => {
      setLocalLiked(data.liked);
      setLocalCount(data.count);
    },
    onError: () => {
      setLocalLiked((prev: boolean) => !prev);
      setLocalCount((prev: number) => localLiked ? prev + 1 : prev - 1);
    },
  });

  const primaryMediaUrl = post.mediaUrls?.[0];
  const displayName = post.author?.profile?.displayName ?? post.author?.profile?.username ?? "Unknown";
  const avatarUrl = post.author?.profile?.avatar;
  const username = post.author?.profile?.username ?? "unknown";

  return (
    <article className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/profile/${username}`} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-violet-800 flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                {displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-white">{displayName}</p>
              {post.author?.profile?.isVerified && (
                <svg className="w-3.5 h-3.5 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500">
              @{username} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </Link>
        <button className="text-gray-500 hover:text-white transition">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media */}
      {primaryMediaUrl && (
        <div className="w-full aspect-square bg-zinc-900 relative overflow-hidden">
          <img
            src={primaryMediaUrl}
            alt="Post media"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {post.mediaUrls.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 rounded-full px-2 py-1 text-xs text-white font-medium">
              1/{post.mediaUrls.length}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className="flex items-center gap-1.5 group"
              aria-label={localLiked ? "Unlike" : "Like"}
            >
              <Heart
                className={cn(
                  "w-6 h-6 transition-all",
                  localLiked
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-gray-400 group-hover:text-red-400"
                )}
              />
              <span className={cn("text-sm", localLiked ? "text-red-400" : "text-gray-400")}>
                {formatCount(localCount)}
              </span>
            </button>

            {/* Comment */}
            <button className="flex items-center gap-1.5 group" aria-label="Comments">
              <MessageCircle className="w-6 h-6 text-gray-400 group-hover:text-violet-400 transition" />
              <span className="text-sm text-gray-400">{formatCount(post._count.comments)}</span>
            </button>

            {/* Share */}
            <button className="flex items-center gap-1.5 group" aria-label="Share">
              <Share2 className="w-5 h-5 text-gray-400 group-hover:text-white transition" />
            </button>
          </div>

          {/* Save */}
          <button className="group" aria-label={post.isSaved ? "Unsave" : "Save"}>
            <Bookmark
              className={cn(
                "w-6 h-6 transition",
                post.isSaved
                  ? "fill-violet-500 text-violet-500"
                  : "text-gray-400 group-hover:text-violet-400"
              )}
            />
          </button>
        </div>

        {/* Content/Caption */}
        {post.content && (
          <div className="mt-3 text-sm text-white leading-relaxed">
            <Link href={`/profile/${username}`} className="font-semibold mr-2">
              {username}
            </Link>
            <ContentText text={post.content} />
          </div>
        )}

        {post._count.comments > 0 && (
          <button className="mt-1 text-xs text-gray-500 hover:text-gray-300 transition">
            View {formatCount(post._count.comments)} comment{post._count.comments !== 1 ? "s" : ""}
          </button>
        )}
      </div>
    </article>
  );
}

function ContentText({ text }: { text: string }) {
  const parts = text.split(/(#\w+|@\w+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          return (
            <Link key={i} href={`/explore?tag=${part.slice(1)}`} className="text-violet-400 hover:underline">
              {part}
            </Link>
          );
        }
        if (part.startsWith("@")) {
          return (
            <Link key={i} href={`/profile/${part.slice(1)}`} className="text-violet-400 hover:underline">
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
