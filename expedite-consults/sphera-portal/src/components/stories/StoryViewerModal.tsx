"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Send, Heart, Eye } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";
import type { StoryGroup, StoryItem } from "@/types";

interface StoryViewerModalProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}

const STORY_DURATION_MS = 5000;

export function StoryViewerModal({
  groups,
  initialGroupIndex,
  onClose,
}: StoryViewerModalProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const currentGroup = groups[groupIndex];
  const currentStory: StoryItem | undefined = currentGroup?.stories[storyIndex];

  // Record view in backend
  const recordView = useCallback(async (storyId: string) => {
    try {
      await fetch(`/api/stories/${storyId}/view`, { method: "POST" });
    } catch {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    if (currentStory) {
      recordView(currentStory.id);
    }
  }, [currentStory, recordView]);

  // Go to next story or next group
  const nextStory = useCallback(() => {
    if (!currentGroup) return;
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((prev) => prev + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentGroup, storyIndex, groupIndex, groups.length, onClose]);

  // Go to previous story or previous group
  const prevStory = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      setGroupIndex((prev) => prev - 1);
      const prevGroup = groups[groupIndex - 1];
      setStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  }, [storyIndex, groupIndex, groups]);

  // Progress bar animation timer
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const interval = 50; // Update every 50ms
    const step = 100 / (STORY_DURATION_MS / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, currentStory, nextStory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextStory();
      if (e.key === "ArrowLeft") prevStory();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStory, prevStory, onClose]);

  if (!currentGroup || !currentStory) return null;

  const authorName = currentGroup.author.profile?.displayName ?? currentGroup.author.profile?.username ?? "Sphera User";
  const authorAvatar = currentGroup.author.profile?.avatar;
  const username = currentGroup.author.profile?.username;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        <X size={22} />
      </button>

      {/* Nav Chevrons (desktop) */}
      {groupIndex > 0 && (
        <button
          onClick={prevStory}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
      )}
      {groupIndex < groups.length - 1 && (
        <button
          onClick={nextStory}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Story Player Phone Container */}
      <div
        className="relative w-full max-w-sm h-full max-h-[840px] md:rounded-3xl overflow-hidden bg-zinc-950 flex flex-col justify-between select-none shadow-2xl border border-zinc-800/80"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story Media Background */}
        <div className="absolute inset-0 bg-black">
          {currentStory.mediaType === "VIDEO" ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        {/* Tap zones for fast forward / backward */}
        <div className="absolute inset-0 z-20 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={prevStory} />
          <div className="w-2/3 h-full cursor-pointer" onClick={nextStory} />
        </div>

        {/* Top Header & Segmented Progress Bars */}
        <div className="relative z-30 p-4 space-y-3 pointer-events-none">
          {/* Multi-segment progress bar */}
          <div className="flex gap-1.5">
            {currentGroup.stories.map((s, idx) => {
              const isPast = idx < storyIndex;
              const isCurrent = idx === storyIndex;
              return (
                <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-none rounded-full"
                    style={{
                      width: isPast ? "100%" : isCurrent ? `${progress}%` : "0%",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* User info */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <Avatar name={authorName} src={authorAvatar || undefined} size="sm" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-white">{authorName}</span>
                  {currentGroup.author.profile?.isVerified && (
                    <span className="text-[#00d4ff] text-xs">✓</span>
                  )}
                </div>
                <p className="text-[11px] text-white/70">
                  @{username} · {timeAgo(currentStory.createdAt)}
                </p>
              </div>
            </div>

            {currentStory.viewsCount !== undefined && currentStory.viewsCount > 0 && (
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white/90 text-xs">
                <Eye size={12} />
                <span>{currentStory.viewsCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Caption Overlay */}
        {currentStory.caption && (
          <div className="relative z-30 px-5 mb-auto pointer-events-none">
            <div className="inline-block bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-sm font-medium text-white shadow-lg">
              {currentStory.caption}
            </div>
          </div>
        )}

        {/* Bottom Quick Reply Bar */}
        <div className="relative z-30 p-4 flex items-center gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${authorName}...`}
            className="flex-1 h-10 px-4 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white placeholder:text-white/60 text-xs focus:outline-none focus:border-[#00d4ff] transition-all"
          />
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white"
          >
            <Heart size={18} className={isLiked ? "text-red-500 fill-red-500" : "text-white"} />
          </button>
          <button
            disabled={!replyText.trim()}
            onClick={() => setReplyText("")}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-[#00d4ff] text-[#0a0f1e] disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
