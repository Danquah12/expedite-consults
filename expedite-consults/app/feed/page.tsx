"use client";

import { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  Video,
  Globe,
  Music,
  Flame,
  Volume2,
  VolumeX,
  Gift,
  Radio,
  Send,
  X,
  Sparkles,
  Layers,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Users,
  Camera,
} from "lucide-react";
import { FeedPost, StoryItem, LiveStreamItem, initialFeedPosts, initialStories, initialLiveStreams } from "@/lib/feed-store";
import { VideoRecorderModal } from "@/components/feed/VideoRecorderModal";
import { StoryViewerModal } from "@/components/feed/StoryViewerModal";
import { LiveBroadcastModal } from "@/components/feed/LiveBroadcastModal";
import { PostComposerModal } from "@/components/feed/PostComposerModal";
import { FeedMediaCard } from "@/components/feed/FeedMediaCard";
import { ShareModal } from "@/components/feed/ShareModal";
import { getLocalFeedPosts, saveLocalFeedPost } from "@/lib/indexed-db-media";

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function FeedPage() {
  const [feedMode, setFeedMode] = useState<"FYP" | "FOLLOWING" | "LIVE">("FYP");
  const [viewStyle, setViewStyle] = useState<"standard" | "immersive_theater">("standard");
  const [posts, setPosts] = useState<FeedPost[]>(initialFeedPosts);
  const [stories, setStories] = useState<StoryItem[]>(initialStories);
  const [liveStreams, setLiveStreams] = useState<LiveStreamItem[]>(initialLiveStreams);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [giftNotification, setGiftNotification] = useState<string | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState<{ x: number; y: number; id: string } | null>(null);
  const [theaterIndex, setTheaterIndex] = useState(0);

  // Modals state
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [activeLiveStream, setActiveLiveStream] = useState<LiveStreamItem | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Omnichannel Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState<FeedPost | null>(null);

  // Instantly hydrate locally cached posts from IndexedDB & localStorage on mount
  useEffect(() => {
    async function hydrateLocalData() {
      try {
        const localPosts = await getLocalFeedPosts();
        if (localPosts && localPosts.length > 0) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const freshLocal = localPosts.filter((lp) => !existingIds.has(lp.id));
            return [...freshLocal, ...prev];
          });
        }
      } catch (err) {
        console.warn("IndexedDB hydration notice:", err);
      }
    }

    hydrateLocalData();
  }, []);

  // Fetch live feed data from API and synchronize
  const fetchFeed = async (mode: "FYP" | "FOLLOWING" | "LIVE") => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/feed?mode=${mode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          setPosts((current) => {
            const serverIds = new Set(data.posts.map((p: FeedPost) => p.id));
            const localOnly = current.filter((p) => !serverIds.has(p.id) && (p.id.startsWith("p-") || p.id.startsWith("post-")));
            return [...localOnly, ...data.posts];
          });
        }
        if (data.stories && data.stories.length > 0) setStories(data.stories);
        if (data.liveStreams && data.liveStreams.length > 0) setLiveStreams(data.liveStreams);
      }
    } catch (e) {
      console.warn("Using local cache for feed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(feedMode);
  }, [feedMode]);

  const handleAddNewPost = (newPost: FeedPost) => {
    setPosts((prev) => {
      const filtered = prev.filter((p) => p.id !== newPost.id);
      return [newPost, ...filtered];
    });
  };

  // Open Share Modal
  const handleOpenShare = (post: FeedPost) => {
    setSelectedSharePost(post);
    setIsShareModalOpen(true);
  };

  const handleShareCompleted = (platform: string) => {
    if (!selectedSharePost) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedSharePost.id ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p
      )
    );
    setGiftNotification(`🚀 Shared to ${platform.toUpperCase()}!`);
    setTimeout(() => setGiftNotification(null), 3000);
  };

  // Double-tap or Heart Like action
  const toggleLike = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      setShowHeartBurst({ x: rect.left + rect.width / 2, y: rect.top, id });
      setTimeout(() => setShowHeartBurst(null), 1000);
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/feed/posts/${id}/like`, { method: "POST" });
    } catch (err) {
      console.error("Like sync error:", err);
    }
  };

  // Toggle Save Bookmark
  const toggleSave = async (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isSaved: !p.isSaved,
              savesCount: (p.savesCount || 0) + (p.isSaved ? -1 : 1),
            }
          : p
      )
    );

    try {
      await fetch(`/api/feed/posts/${id}/save`, { method: "POST" });
    } catch (err) {
      console.error("Save sync error:", err);
    }
  };

  // Toggle Follow Creator
  const toggleFollow = async (username: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.author.username === username
          ? { ...p, author: { ...p.author, isFollowed: !p.author.isFollowed } }
          : p
      )
    );

    try {
      await fetch(`/api/feed/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
    } catch (err) {
      console.error("Follow sync error:", err);
    }
  };

  // Send Virtual Gift
  const sendGift = async (giftName: string, recipient: string) => {
    setGiftNotification(`✨ Sent ${giftName} to @${recipient}!`);
    setTimeout(() => setGiftNotification(null), 3500);

    try {
      await fetch(`/api/feed/gift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftName, recipient }),
      });
    } catch (err) {
      console.error("Gift sync error:", err);
    }
  };

  // Submit Live Comment
  const handleAddComment = async (postId: string) => {
    if (!newCommentText.trim()) return;
    const textToSend = newCommentText.trim();
    setNewCommentText("");

    const newComment = {
      id: `c-${Date.now()}`,
      user: "Kwesi Asiedu (You)",
      username: "kwesi",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
      text: textToSend,
      time: "Just now",
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            commentsList: [newComment, ...(p.commentsList || [])],
          };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/feed/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend, user: "Kwesi Asiedu", username: "kwesi" }),
      });
    } catch (err) {
      console.error("Comment sync error:", err);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (feedMode === "FOLLOWING") return p.author.isFollowed;
    return true;
  });

  const activeTheaterPost = filteredPosts[theaterIndex % (filteredPosts.length || 1)] || filteredPosts[0];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-slate-100 font-sans">
      
      {/* ── Top Header / Brand Bar ──────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#121318]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                SpheraNet <span className="text-xs text-rose-400 uppercase tracking-widest font-mono font-bold">FYP</span>
              </span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecorderOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition transform hover:scale-105"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Record Short</span>
            </button>

            <a
              href="/campus"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-bold border border-zinc-700/60 transition"
            >
              🎓 Campus Hub
            </a>

            <button
              onClick={() => setViewStyle(viewStyle === "standard" ? "immersive_theater" : "standard")}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-pink-600/30 transition transform hover:scale-105"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{viewStyle === "standard" ? "Immersive FYP Mode" : "Standard Feed"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Global Toast Notification */}
      {giftNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>{giftNotification}</span>
        </div>
      )}

      {/* Double-tap Floating Heart Animation */}
      {showHeartBurst && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 animate-out fade-out zoom-out duration-700"
          style={{ left: showHeartBurst.x, top: showHeartBurst.y }}
        >
          <Heart className="w-24 h-24 text-pink-500 fill-pink-500 drop-shadow-[0_0_25px_rgba(236,72,153,0.8)] animate-bounce" />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          VIEW 1: IMMERSIVE FULL-SCREEN THEATER FYP
      ═══════════════════════════════════════════════════════════════════ */}
      {viewStyle === "immersive_theater" ? (
        <div className="relative h-[calc(100vh-57px)] w-full bg-black flex items-center justify-center overflow-hidden">
          {activeTheaterPost ? (
            <div className="relative w-full max-w-[440px] h-full flex items-center justify-center bg-zinc-950 shadow-2xl">
              
              {/* Media Renderer */}
              <FeedMediaCard
                post={activeTheaterPost}
                isTheater={true}
                onDoubleClick={(e) => toggleLike(activeTheaterPost.id, e)}
              />

              {/* Theater Navigation Controls */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
                <button
                  onClick={() => setTheaterIndex((prev) => (prev > 0 ? prev - 1 : filteredPosts.length - 1))}
                  className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition border border-white/10 shadow-lg"
                  title="Previous Short"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTheaterIndex((prev) => (prev + 1) % (filteredPosts.length || 1))}
                  className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition border border-white/10 shadow-lg"
                  title="Next Short"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Theater Side Interaction Rail */}
              <div className="absolute right-3 bottom-16 flex flex-col items-center gap-4 z-30">
                {/* Creator Avatar with follow trigger */}
                <div className="relative mb-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-pink-500 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeTheaterPost.author.avatarUrl} alt={activeTheaterPost.author.name} className="w-full h-full object-cover" />
                  </div>
                  {!activeTheaterPost.author.isFollowed && (
                    <button
                      onClick={() => toggleFollow(activeTheaterPost.author.username)}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg border border-black transition hover:scale-110"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  )}
                </div>

                {/* Heart Like */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => toggleLike(activeTheaterPost.id, e)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition transform hover:scale-125 active:scale-90 shadow-2xl ${
                      activeTheaterPost.isLiked ? "bg-pink-600 text-white" : "bg-black/60 text-white hover:bg-black/80"
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${activeTheaterPost.isLiked ? "fill-white text-white" : ""}`} />
                  </button>
                  <span className="text-xs font-black text-white drop-shadow-md">
                    {formatNumber(activeTheaterPost.likes)}
                  </span>
                </div>

                {/* Comments */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === activeTheaterPost.id ? null : activeTheaterPost.id)}
                    className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition transform hover:scale-110 shadow-2xl"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <span className="text-xs font-black text-white drop-shadow-md">
                    {formatNumber(activeTheaterPost.commentsCount)}
                  </span>
                </div>

                {/* Bookmark */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => toggleSave(activeTheaterPost.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition transform hover:scale-110 shadow-2xl ${
                      activeTheaterPost.isSaved ? "bg-amber-500 text-black" : "bg-black/60 text-white hover:bg-black/80"
                    }`}
                  >
                    <Bookmark className={`w-6 h-6 ${activeTheaterPost.isSaved ? "fill-black" : ""}`} />
                  </button>
                  <span className="text-xs font-black text-white drop-shadow-md">
                    {formatNumber(activeTheaterPost.savesCount || 1420)}
                  </span>
                </div>

                {/* Omnichannel Share Button */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleOpenShare(activeTheaterPost)}
                    className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition transform hover:scale-110 shadow-2xl"
                    title="Share to WhatsApp, Facebook, LinkedIn, TikTok"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                  <span className="text-xs font-black text-white drop-shadow-md">
                    {formatNumber(activeTheaterPost.sharesCount)}
                  </span>
                </div>

                {/* Send Gift */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => sendGift("💎 1,000 Diamonds Gift", activeTheaterPost.author.username)}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white flex items-center justify-center backdrop-blur-md transition transform hover:scale-125 shadow-2xl"
                  >
                    <Gift className="w-6 h-6" />
                  </button>
                  <span className="text-[10px] font-black text-amber-300 drop-shadow-md">Gift</span>
                </div>
              </div>

              {/* Theater Bottom Info Bar */}
              <div className="absolute bottom-4 left-4 right-16 z-30 space-y-2 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-white drop-shadow-md">@{activeTheaterPost.author.username}</span>
                  {activeTheaterPost.author.verified && <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400" />}
                </div>
                <p className="text-xs text-white/90 line-clamp-2 drop-shadow-md">{activeTheaterPost.content}</p>
                
                {/* Audio pill */}
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 w-fit text-[11px] text-zinc-300">
                  <Music className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                  <span className="truncate max-w-[200px]">{activeTheaterPost.musicTitle || "Original Sound"}</span>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      ) : (

        /* ═══════════════════════════════════════════════════════════════════
            VIEW 2: STANDARD IMMERSIVE SOCIAL FEED
        ═══════════════════════════════════════════════════════════════════ */
        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
          
          {/* ── Center Main Feed ────────────────────────────────────── */}
          <div className="flex-1 max-w-2xl mx-auto space-y-6">
            
            {/* 1. Feed Mode Switcher */}
            <div className="flex items-center justify-between bg-[#18191a] p-1.5 rounded-2xl border border-zinc-800/80 shadow-lg">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFeedMode("FYP")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                    feedMode === "FYP"
                      ? "bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>🔥 For You (FYP)</span>
                </button>

                <button
                  onClick={() => setFeedMode("FOLLOWING")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                    feedMode === "FOLLOWING"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-500 text-white shadow-md shadow-cyan-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <span>👥 Following</span>
                </button>

                <button
                  onClick={() => {
                    setFeedMode("LIVE");
                    if (liveStreams.length > 0) {
                      setActiveLiveStream(liveStreams[0]);
                      setIsLiveModalOpen(true);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                    feedMode === "LIVE"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-rose-300" />
                  <span>🔴 LIVE Now</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewStyle("immersive_theater")}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-pink-400 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition"
                  title="Toggle Immersive Full-Screen Mode"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>📱 Immersive FYP Mode</span>
                </button>
              </div>
            </div>

            {/* 2. STORIES & LIVE BROADCAST TRAY */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none py-1">
              {stories.map((story, idx) => (
                <div
                  key={story.id || idx}
                  onClick={() => {
                    setSelectedStoryIndex(idx);
                    setIsStoryViewerOpen(true);
                  }}
                  className="relative w-24 h-36 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer group shadow-lg border border-zinc-800/80 transition transform hover:scale-105"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={story.mediaUrl || story.avatar} alt={story.username} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {story.isUser ? (
                    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center border-2 border-zinc-900 shadow-md">
                      <Plus className="w-4 h-4 text-white font-bold" />
                    </div>
                  ) : (
                    <div className={`absolute top-2 left-2 w-8 h-8 rounded-full overflow-hidden p-0.5 ${story.hasLive ? "bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 animate-pulse" : "bg-cyan-500"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={story.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                    </div>
                  )}

                  {story.hasLive && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-rose-600 text-white font-mono text-[9px] font-black rounded-md animate-pulse">
                      LIVE
                    </span>
                  )}

                  <p className="absolute bottom-2 left-2 right-2 text-[11px] font-bold text-white truncate shadow-xs">
                    {story.displayName || story.username}
                  </p>
                </div>
              ))}
            </div>

            {/* 3. POST COMPOSER */}
            <div className="bg-[#18191a] border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-pink-500/50 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" alt="me" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="flex-1 text-left bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 rounded-full px-4 py-2.5 text-xs font-medium border border-zinc-700/60 transition"
                >
                  Share a Reel, Sound, or Creator Post to #FYP...
                </button>
              </div>

              <div className="flex items-center justify-around pt-2 border-t border-zinc-800/80 text-xs font-bold text-zinc-400">
                <button
                  onClick={() => setIsRecorderOpen(true)}
                  className="flex items-center gap-1.5 hover:text-pink-400 px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition"
                >
                  <Video className="w-4 h-4 text-rose-500" />
                  <span>Record Short</span>
                </button>
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="flex items-center gap-1.5 hover:text-cyan-400 px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition"
                >
                  <Music className="w-4 h-4 text-cyan-400" />
                  <span>Add Audio</span>
                </button>
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="flex items-center gap-1.5 hover:text-amber-400 px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Creator Studio</span>
                </button>
              </div>
            </div>

            {/* 4. POSTS & IMMERSIVE VIDEO CARDS */}
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-[#18191a] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl space-y-3 relative group"
              >
                {/* Author Header */}
                <div className="flex items-center justify-between px-5 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-pink-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.author.avatarUrl} alt={post.author.name} className="w-full h-full object-cover" />
                      </div>
                      {!post.author.isFollowed && (
                        <button
                          onClick={() => toggleFollow(post.author.username)}
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg border border-zinc-900 transition hover:scale-110"
                          title="Follow Creator"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white hover:underline cursor-pointer">{post.author.name}</span>
                        {post.author.verified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />}
                        <span className="text-xs text-zinc-500">@{post.author.username}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <span>{post.author.timeAgo}</span>
                        <span>•</span>
                        <Globe className="w-3 h-3 text-zinc-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFollow(post.author.username)}
                      className={`px-3 py-1 rounded-full text-xs font-black transition ${
                        post.author.isFollowed
                          ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          : "bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30"
                      }`}
                    >
                      {post.author.isFollowed ? "Following" : "+ Follow"}
                    </button>
                    <button className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Post Caption & Hashtags */}
                <div className="px-5 space-y-1.5">
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">{post.content}</p>
                  {post.hashtags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs font-bold text-pink-400 hover:underline cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Immersive Video Frame with Floating Interaction Rail */}
                <div className="relative w-full bg-black flex justify-center items-center overflow-hidden min-h-[380px] max-h-[580px] select-none">
                  <FeedMediaCard
                    post={post}
                    onDoubleClick={(e) => toggleLike(post.id, e)}
                  />

                  {/* Gradient Scrims */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* ── SIDE ENGAGEMENT RAIL ── */}
                  <div className="absolute right-3 bottom-6 flex flex-col items-center gap-4 z-20">
                    
                    {/* 1. Heart Like Button */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={(e) => toggleLike(post.id, e)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition transform hover:scale-125 active:scale-90 shadow-2xl ${
                          post.isLiked ? "bg-pink-600 text-white" : "bg-black/60 text-white hover:bg-black/80"
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? "fill-white text-white" : ""}`} />
                      </button>
                      <span className="text-[11px] font-black text-white drop-shadow-md">
                        {formatNumber(post.likes)}
                      </span>
                    </div>

                    {/* 2. Comments Button */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                        className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition transform hover:scale-110 shadow-2xl"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <span className="text-[11px] font-black text-white drop-shadow-md">
                        {formatNumber(post.commentsCount)}
                      </span>
                    </div>

                    {/* 3. Bookmark / Save Button */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => toggleSave(post.id)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition transform hover:scale-110 shadow-2xl ${
                          post.isSaved ? "bg-amber-500 text-black" : "bg-black/60 text-white hover:bg-black/80"
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${post.isSaved ? "fill-black" : ""}`} />
                      </button>
                      <span className="text-[11px] font-black text-white drop-shadow-md">
                        {formatNumber(post.savesCount || 1420)}
                      </span>
                    </div>

                    {/* 4. Omnichannel Share & Duet Button */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleOpenShare(post)}
                        className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition transform hover:scale-110 shadow-2xl"
                        title="Share to WhatsApp, Facebook, LinkedIn, TikTok"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <span className="text-[11px] font-black text-white drop-shadow-md">
                        {formatNumber(post.sharesCount)}
                      </span>
                    </div>

                    {/* 5. Virtual Gift Spark */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => sendGift("💎 1,000 Diamonds Gift", post.author.username)}
                        className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white flex items-center justify-center backdrop-blur-md transition transform hover:scale-125 shadow-2xl"
                        title="Send Creator Gift"
                      >
                        <Gift className="w-5 h-5" />
                      </button>
                      <span className="text-[10px] font-black text-amber-300 drop-shadow-md">Gift</span>
                    </div>

                  </div>
                </div>

                {/* Inline Expandable Comments Tray */}
                {activeCommentPostId === post.id && (
                  <div className="px-5 py-3 border-t border-zinc-800 space-y-3 bg-black/20 rounded-b-3xl">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                        placeholder="Add a comment or reaction..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-full px-4 py-2 text-xs focus:outline-none focus:border-pink-500 transition"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 rounded-full bg-pink-600 hover:bg-pink-500 text-white transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(post.commentsList || []).map((c) => (
                        <div key={c.id} className="flex items-start gap-2.5 text-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.avatar} alt={c.user} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                          <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-2.5 flex-1">
                            <div className="flex items-center justify-between font-bold text-white">
                              <span>{c.user}</span>
                              <span className="text-[10px] text-zinc-500">{c.time}</span>
                            </div>
                            <p className="text-zinc-200 mt-0.5">{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Action Ribbon */}
                <div className="px-5 py-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold text-zinc-400">
                  <button
                    onClick={() => sendGift("🔥 Super Fire", post.author.username)}
                    className="flex items-center gap-1 text-pink-400 hover:text-pink-300"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Send Creator Spark</span>
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-[11px]">🎵 {post.musicTitle ? "Audio Track Linked" : "Sphera Original"}</span>
                  </div>
                </div>
              </article>
            ))}

          </div>

          {/* ── Right Sidebar: Live Broadcasts & Trends ───────── */}
          <aside className="hidden lg:block w-[300px] flex-shrink-0 sticky top-20 space-y-4">
            
            {/* 1. Live Broadcasts Widget */}
            <div className="bg-[#18191a] border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span>LIVE Now on Sphera</span>
                </h3>
                <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                  {liveStreams.length} Streams
                </span>
              </div>

              <div className="space-y-2.5">
                {liveStreams.map((stream) => (
                  <div
                    key={stream.id}
                    onClick={() => {
                      setActiveLiveStream(stream);
                      setIsLiveModalOpen(true);
                    }}
                    className="flex items-center justify-between p-2 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 transition cursor-pointer border border-zinc-700/40 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-rose-500">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={stream.avatar} alt={stream.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 px-1 bg-rose-600 text-white font-mono text-[8px] font-black rounded-sm">
                          LIVE
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-pink-400 transition">{stream.name}</h4>
                        <p className="text-[10px] text-zinc-400 truncate max-w-[130px]">{stream.title}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-rose-400">{stream.viewers}</span>
                      <span className="text-[9px] text-zinc-500 block">viewers</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Trending Sounds & Hashtags */}
            <div className="bg-[#18191a] border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Trending on #FYP</span>
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  { tag: "#SpheraViral", views: "18.4M views", category: "Trending in Tech" },
                  { tag: "#CampusHacks2026", views: "9.2M views", category: "Education" },
                  { tag: "#CyberDefenseCTF", views: "4.8M views", category: "Gaming & Cyber" },
                  { tag: "#AfrobeatsDrop", views: "2.1M views", category: "Trending Sound" },
                ].map((t, idx) => (
                  <div key={idx} className="p-2 rounded-xl hover:bg-zinc-800/60 cursor-pointer transition">
                    <span className="text-[10px] text-zinc-500 block">{t.category}</span>
                    <span className="font-black text-white hover:text-pink-400">{t.tag}</span>
                    <span className="text-[11px] text-zinc-400 block font-mono">{t.views}</span>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>
      )}

      {/* ── MODALS ──────────────────────────────────────────────────── */}
      {/* 1. Camera & Short Video Recorder Modal */}
      <VideoRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onPostCreated={(newPost) => handleAddNewPost(newPost)}
      />

      {/* 2. Interactive 24-Hour Stories Viewer Modal */}
      <StoryViewerModal
        isOpen={isStoryViewerOpen}
        stories={stories}
        initialIndex={selectedStoryIndex}
        onClose={() => setIsStoryViewerOpen(false)}
        onAddStory={(newStory) => setStories((prev) => [newStory, ...prev])}
      />

      {/* 3. Live Broadcast Stage Room Modal */}
      <LiveBroadcastModal
        isOpen={isLiveModalOpen}
        stream={activeLiveStream}
        onClose={() => setIsLiveModalOpen(false)}
        onSendGift={(giftName, recipient) => sendGift(giftName, recipient)}
      />

      {/* 4. Creator Post Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onPostCreated={(newPost) => handleAddNewPost(newPost)}
      />

      {/* 5. Omnichannel Share Modal (WhatsApp, Facebook, LinkedIn, TikTok, X, Telegram, Reddit, Email) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={selectedSharePost}
        onShareCompleted={handleShareCompleted}
      />

    </div>
  );
}
