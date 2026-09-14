"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { StoryItem } from "@/lib/feed-store";

interface StoryViewerModalProps {
  isOpen: boolean;
  stories: StoryItem[];
  initialIndex: number;
  onClose: () => void;
  onAddStory: (newStory: any) => void;
}

export function StoryViewerModal({
  isOpen,
  stories,
  initialIndex,
  onClose,
  onAddStory,
}: StoryViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [reactionBurst, setReactionBurst] = useState<string | null>(null);

  const activeStory = stories[currentIndex] || stories[0];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, stories.length, isPaused, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleReaction = (emoji: string) => {
    setReactionBurst(emoji);
    setTimeout(() => setReactionBurst(null), 1200);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setReactionBurst(`💬 Sent reply to @${activeStory?.username}`);
    setReplyText("");
    setTimeout(() => setReactionBurst(null), 2000);
  };

  if (!isOpen || !activeStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
      {reactionBurst && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-4xl font-black text-white bg-black/80 px-6 py-3 rounded-full border border-pink-500/50 shadow-2xl animate-bounce">
          {reactionBurst}
        </div>
      )}

      <div
        className="relative w-full max-w-[420px] aspect-[9/16] max-h-[90vh] bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col justify-between select-none"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeStory.mediaUrl}
          alt={activeStory.displayName}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none" />

        <div className="relative z-20 p-4 space-y-3">
          <div className="flex gap-1.5 w-full">
            {stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-pink-500 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeStory.avatar} alt={activeStory.displayName} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">{activeStory.displayName}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{activeStory.timeAgo}</span>
                </div>
                <span className="text-[10px] text-pink-400 font-bold block">@{activeStory.username}</span>
              </div>
            </div>

            <button onClick={onClose} className="p-1 rounded-full bg-black/50 text-white hover:bg-black/80">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeStory.caption && (
          <div className="relative z-20 px-4 py-2">
            <p className="text-xs font-semibold text-white bg-black/60 backdrop-blur-md p-2.5 rounded-xl inline-block border border-white/10 max-w-[90%]">
              {activeStory.caption}
            </p>
          </div>
        )}

        <div className="absolute inset-0 z-10 flex">
          <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
        </div>

        <div className="relative z-20 p-4 space-y-2">
          <div className="flex justify-around py-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
            {["🔥", "❤️", "👏", "😮", "💎", "🚀"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-lg hover:scale-130 transition transform active:scale-90 p-1"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Send message to @${activeStory.username}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
              className="flex-1 bg-black/60 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-pink-500 backdrop-blur-md"
            />
            <button
              onClick={handleSendReply}
              className="w-9 h-9 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white items-center justify-center disabled:opacity-30 shadow-xl"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex === stories.length - 1}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white items-center justify-center disabled:opacity-30 shadow-xl"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
