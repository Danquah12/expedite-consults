"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  Flame,
} from "lucide-react";
import { FeedPost } from "@/lib/feed-store";
import { getVideoBlob, getVideoObjectUrl } from "@/lib/indexed-db-media";

interface FeedMediaCardProps {
  post: FeedPost;
  onDoubleClick?: (e: React.MouseEvent) => void;
  isTheater?: boolean;
}

function isVideoMedia(url?: string, type?: string): boolean {
  if (!url && type === "immersive_video") return true;
  if (!url) return false;
  if (url.startsWith("blob:") || url.startsWith("idb:")) return true;
  if (url.startsWith("data:video")) return true;
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url)) return true;
  if (type === "immersive_video" && !/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url)) {
    return true;
  }
  return false;
}

export function FeedMediaCard({ post, onDoubleClick, isTheater = false }: FeedMediaCardProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showFeedbackIcon, setShowFeedbackIcon] = useState<"play" | "pause" | null>(null);
  const [progress, setProgress] = useState(0);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const rawMediaUrl = post.videoUrl || post.imageUrl;
  const isVideo = isVideoMedia(rawMediaUrl, post.type);

  // Resolve media URL from IndexedDB if using idb:// or if stored locally
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    async function resolveMedia() {
      if (rawMediaUrl && rawMediaUrl.startsWith("idb://")) {
        const id = rawMediaUrl.replace("idb://", "");
        const url = await getVideoObjectUrl(id);
        if (active && url) {
          createdUrl = url;
          setResolvedSrc(url);
          return;
        }
      }

      // Check if post ID has a stored blob in IndexedDB
      if (post.id) {
        const url = await getVideoObjectUrl(post.id);
        if (active && url) {
          createdUrl = url;
          setResolvedSrc(url);
          return;
        }
      }

      if (active) {
        setResolvedSrc(rawMediaUrl || null);
      }
    }

    resolveMedia();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [rawMediaUrl, post.id]);

  // Play/pause control
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      triggerFeedback("pause");
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      triggerFeedback("play");
    }
  };

  const triggerFeedback = (type: "play" | "pause") => {
    setShowFeedbackIcon(type);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setShowFeedbackIcon(null), 600);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (total > 0) {
        setProgress((current / total) * 100);
      }
    }
  };

  // Click vs Double Click handling
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      if (onDoubleClick) onDoubleClick(e);
    } else {
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;
        if (isVideo) {
          togglePlay(e);
        }
      }, 250);
    }
  };

  // Fallback visual generator for text-only or failed media
  const renderFallbackCanvas = () => (
    <div
      onClick={handleClick}
      className={`w-full h-full min-h-[360px] md:min-h-[440px] flex flex-col justify-between p-6 sm:p-8 cursor-pointer select-none bg-gradient-to-br from-[#1b1429] via-[#0d1017] to-[#141b2b] relative overflow-hidden group ${
        isTheater ? "aspect-[9/16]" : "max-h-[580px]"
      }`}
    >
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:1.5s]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center">
            <Flame className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-black tracking-wider text-pink-300 uppercase">
            Sphera Short Reel
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>VIRAL FYP</span>
        </div>
      </div>

      <div className="my-auto z-10 max-w-sm space-y-3">
        <div className="w-8 h-1 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full" />
        <h4 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight drop-shadow-md">
          &ldquo;{post.content.slice(0, 140)}{post.content.length > 140 ? "..." : ""}&rdquo;
        </h4>
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.hashtags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs font-black text-cyan-300 drop-shadow">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="z-10 flex items-center justify-between pt-4 border-t border-white/10 bg-black/30 backdrop-blur-sm -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 px-6 sm:px-8">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-pink-400 animate-bounce" />
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-1 bg-pink-500 rounded-full animate-[ping_1.2s_ease-in-out_infinite]" style={{ height: "60%" }} />
            <span className="w-1 bg-cyan-400 rounded-full animate-[ping_0.9s_ease-in-out_infinite]" style={{ height: "100%" }} />
            <span className="w-1 bg-purple-400 rounded-full animate-[ping_1.4s_ease-in-out_infinite]" style={{ height: "40%" }} />
            <span className="w-1 bg-rose-400 rounded-full animate-[ping_0.8s_ease-in-out_infinite]" style={{ height: "80%" }} />
          </div>
          <span className="text-[11px] text-zinc-300 font-bold truncate max-w-[160px]">
            {post.musicTitle || "Sphera Trending Audio"}
          </span>
        </div>

        <span className="text-xs font-mono font-bold text-zinc-400">
          @{post.author.username}
        </span>
      </div>
    </div>
  );

  const activeMediaUrl = resolvedSrc || rawMediaUrl;

  if (hasError || !activeMediaUrl) {
    return renderFallbackCanvas();
  }

  return (
    <div
      onClick={handleClick}
      className={`relative w-full bg-black flex items-center justify-center overflow-hidden cursor-pointer select-none group ${
        isTheater ? "aspect-[9/16] h-full" : "min-h-[380px] max-h-[580px]"
      }`}
    >
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            src={activeMediaUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover max-h-[580px]"
          />

          {showFeedbackIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white border border-white/20 animate-in zoom-in-75 duration-200 shadow-2xl">
                {showFeedbackIcon === "pause" ? (
                  <Pause className="w-8 h-8 fill-white" />
                ) : (
                  <Play className="w-8 h-8 fill-white ml-1" />
                )}
              </div>
            </div>
          )}

          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition border border-white/10 shadow-lg"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeMediaUrl}
            alt={post.content.slice(0, 40) || "Creator post"}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover max-h-[580px]"
          />
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
    </div>
  );
}
