"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Camera,
  Repeat2,
  Zap,
  Users,
  Compass,
  FileText,
  Briefcase,
  ShieldCheck,
  ExternalLink,
  Eye,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import {
  FeedPost,
  StoryItem,
  LiveStreamItem,
  initialFeedPosts,
  initialStories,
  initialLiveStreams,
} from "@/lib/feed-store";
import { VideoRecorderModal } from "@/components/feed/VideoRecorderModal";
import { StoryViewerModal } from "@/components/feed/StoryViewerModal";
import { LiveBroadcastModal } from "@/components/feed/LiveBroadcastModal";
import { PostComposerModal } from "@/components/feed/PostComposerModal";
import { FeedMediaCard } from "@/components/feed/FeedMediaCard";
import { SpheraPulseComposer } from "@/components/post/SpheraPulseComposer";
import { SpheraPulseThreadCard } from "@/components/post/SpheraPulseThreadCard";
import { useAppStore, FeedStreamType } from "@/store/useAppStore";
import type { PostWithDetails } from "@/types";

const SPHERA_LOCAL_POSTS_KEY = "sphera_feed_posts_v3";

export default function FeedPage() {
  const { activeFeedStream, setFeedStream, openUniversalCreate } = useAppStore();
  const [viewStyle, setViewStyle] = useState<"standard" | "immersive_theater">("standard");
  const [posts, setPosts] = useState<FeedPost[]>(initialFeedPosts);
  const [stories, setStories] = useState<StoryItem[]>(initialStories);
  const [liveStreams, setLiveStreams] = useState<LiveStreamItem[]>(initialLiveStreams);
  const [isLoading, setIsLoading] = useState(false);
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

  // 1. Instantly load locally cached posts on mount so user never loses recorded videos on refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(SPHERA_LOCAL_POSTS_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
          }
        }
      } catch (err) {
        console.warn("Local feed cache read notice:", err);
      }
    }
  }, []);

  // 2. Fetch live feed data from API and synchronize
  const fetchFeed = async (stream: FeedStreamType) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/feed?mode=${stream}`);
      if (res.ok) {
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          setPosts((current) => {
            // Keep any locally created posts that aren't yet in server list, and merge
            const serverIds = new Set(data.posts.map((p: FeedPost) => p.id));
            const localOnly = current.filter((p) => !serverIds.has(p.id) && (p.id.startsWith("p-") || p.id.startsWith("post-")));
            const merged = [...localOnly, ...data.posts];
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(SPHERA_LOCAL_POSTS_KEY, JSON.stringify(merged));
              } catch (e) {}
            }
            return merged;
          });
        }
        if (data.stories && data.stories.length > 0) setStories(data.stories);
        if (data.liveStreams && data.liveStreams.length > 0) setLiveStreams(data.liveStreams);
      }
    } catch (e) {
      // Local fallback in store
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(activeFeedStream);
  }, [activeFeedStream]);

  const handleAddNewPost = (newPost: FeedPost) => {
    setPosts((prev) => {
      const filtered = prev.filter((p) => p.id !== newPost.id);
      const updated = [newPost, ...filtered];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(SPHERA_LOCAL_POSTS_KEY, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

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
      // Offline fallback
    }
  };

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
      // Offline fallback
    }
  };

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
      // Offline fallback
    }
  };

  const handleAddNewPulsePost = (newPost: Partial<PostWithDetails>) => {
    const converted: FeedPost = {
      id: newPost.id || `pulse-${Date.now()}`,
      type: "pulse_thread",
      streamCategory: "pulse",
      author: {
        id: newPost.author?.id || "u_me",
        name: newPost.author?.profile?.displayName || "Kwesi Asiedu",
        username: newPost.author?.profile?.username || "kwesi",
        avatarUrl: newPost.author?.profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        verified: true,
        timeAgo: "Just now",
        isFollowed: true,
        isFriend: true,
      },
      content: newPost.content || "",
      imageUrl: newPost.mediaUrls?.[0],
      likes: 1,
      commentsCount: 0,
      sharesCount: 0,
      repostsCount: 0,
      viewsCount: 1,
      isLiked: true,
      isThread: newPost.isThread,
      threadIndex: newPost.threadIndex,
      threadTotal: newPost.threadTotal,
      threadReplies: newPost.threadReplies?.map((r, idx) => ({
        id: r.id || `reply-${idx}`,
        content: r.content || "",
        mediaUrl: r.mediaUrls?.[0],
        author: {
          id: r.author?.id || "u_me",
          name: r.author?.profile?.displayName || "Kwesi Asiedu",
          username: r.author?.profile?.username || "kwesi",
          avatarUrl: r.author?.profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          verified: true,
          timeAgo: "Just now",
        },
      })),
      communityNote: newPost.communityNote
        ? {
            content: newPost.communityNote.content,
            sources: newPost.communityNote.sources,
            helpfulCount: newPost.communityNote.helpfulCount,
          }
        : undefined,
      bounty: newPost.bounty
        ? {
            title: newPost.bounty.title,
            reward: newPost.bounty.reward,
            sponsor: newPost.bounty.sponsor,
            clearanceRequired: newPost.bounty.clearanceRequired,
            difficulty: newPost.bounty.difficulty,
            tags: newPost.bounty.tags,
          }
        : undefined,
      article: newPost.article
        ? {
            title: newPost.article.title,
            subtitle: newPost.article.subtitle,
            coverImage: newPost.article.coverImage,
            readTimeMinutes: newPost.article.readTimeMinutes,
            slug: newPost.article.slug,
          }
        : undefined,
      createdAt: new Date().toISOString(),
    };

    handleAddNewPost(converted);

    // Broadcast to server
    try {
      fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: converted.content,
          type: converted.type,
          imageUrl: converted.imageUrl,
          authorName: converted.author.name,
          authorUsername: converted.author.username,
        }),
      }).catch(() => {});
    } catch (e) {}
  };

  // 5-Stream Filter Logic
  const filteredPosts = posts.filter((p) => {
    if (activeFeedStream === "following") {
      return p.author.isFollowed;
    }
    if (activeFeedStream === "friends") {
      return p.author.isFriend || p.streamCategory === "friends";
    }
    if (activeFeedStream === "pulse") {
      return p.type === "pulse_thread" || p.streamCategory === "pulse" || p.isThread;
    }
    if (activeFeedStream === "live") {
      return p.type === "immersive_video" || p.videoUrl;
    }
    return true;
  });

  const activeTheaterPost = filteredPosts[theaterIndex % (filteredPosts.length || 1)] || filteredPosts[0];

  const streamTabs: { id: FeedStreamType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "for_you", label: "For You", icon: <Flame className="w-3.5 h-3.5 text-amber-300" /> },
    { id: "following", label: "Following", icon: <Users className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: "friends", label: "Friends", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: "pulse", label: "Pulse (X)", icon: <Zap className="w-3.5 h-3.5 text-cyan-300" />, badge: "HOT" },
    { id: "live", label: "Live Stage", icon: <Radio className="w-3.5 h-3.5 text-rose-400" /> },
  ];

  return (
    <div className="w-full flex justify-center gap-6 text-slate-100 font-sans pb-16">
      
      {/* ── Toast Gift Alert ────────────────────────────────────────── */}
      {giftNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl font-black text-sm animate-bounce flex items-center gap-2 border border-white/20">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{giftNotification}</span>
        </div>
      )}

      {/* ── Heart Burst Double-Tap Animation ───────────────────────── */}
      {showHeartBurst && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{ left: showHeartBurst.x, top: showHeartBurst.y }}
        >
          <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
        </div>
      )}

      {/* ── IMMERSIVE THEATER VIEW ──────────────────────────────────── */}
      {viewStyle === "immersive_theater" ? (
        <div className="w-full max-w-[500px] flex flex-col items-center gap-4">
          <div className="relative w-full aspect-[9/16] max-h-[82vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex items-center justify-center select-none group">
            <FeedMediaCard
              post={activeTheaterPost}
              onDoubleClick={(e) => toggleLike(activeTheaterPost.id, e)}
              isTheater={true}
            />

            {/* Top 5-Stream Switcher in Theater */}
            <div className="absolute top-4 left-0 right-0 z-30 flex items-center justify-center gap-3 text-xs font-black drop-shadow-md">
              <button
                onClick={() => setFeedStream("for_you")}
                className={`transition ${activeFeedStream === "for_you" ? "text-white scale-110 underline underline-offset-8" : "text-white/60 hover:text-white"}`}
              >
                For You
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={() => setFeedStream("pulse")}
                className={`transition ${activeFeedStream === "pulse" ? "text-cyan-300 scale-110 underline underline-offset-8" : "text-white/60 hover:text-white"}`}
              >
                ⚡ Pulse
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={() => setFeedStream("following")}
                className={`transition ${activeFeedStream === "following" ? "text-white scale-110 underline underline-offset-8" : "text-white/60 hover:text-white"}`}
              >
                Following
              </button>
            </div>

            {/* Bottom Caption & Author Details */}
            <div className="absolute bottom-6 left-4 right-20 z-20 space-y-2 pointer-events-auto">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white drop-shadow-md">@{activeTheaterPost?.author.username}</span>
                {activeTheaterPost?.author.verified && <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400" />}
                {!activeTheaterPost?.author.isFollowed && (
                  <button
                    onClick={() => toggleFollow(activeTheaterPost.author.username)}
                    className="px-2.5 py-0.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-black shadow-md"
                  >
                    Follow
                  </button>
                )}
              </div>
              <p className="text-xs text-white/95 line-clamp-3 drop-shadow-md font-medium">
                {activeTheaterPost?.content}
              </p>
            </div>

            {/* Right Engagement Rail */}
            <div className="absolute right-3 bottom-6 z-30 flex flex-col items-center gap-5">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={(e) => toggleLike(activeTheaterPost.id, e)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition transform hover:scale-125 ${
                    activeTheaterPost?.isLiked ? "bg-pink-600 text-white shadow-pink-500/50" : "bg-black/60 text-white hover:bg-black/80"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${activeTheaterPost?.isLiked ? "fill-white" : ""}`} />
                </button>
                <span className="text-[11px] font-black text-white drop-shadow-md">
                  {formatNumber(activeTheaterPost?.likes || 0)}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => setActiveCommentPostId(activeCommentPostId === activeTheaterPost.id ? null : activeTheaterPost.id)}
                  className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition transform hover:scale-110"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <span className="text-[11px] font-black text-white drop-shadow-md">
                  {formatNumber(activeTheaterPost?.commentsCount || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheaterIndex((prev) => (prev > 0 ? prev - 1 : filteredPosts.length - 1))}
              className="px-4 py-2 rounded-2xl bg-zinc-800 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1 shadow-xl border border-zinc-700 transition"
            >
              <ChevronUp className="w-4 h-4" /> Prev Reel
            </button>
            <button
              onClick={() => setViewStyle("standard")}
              className="px-4 py-2 rounded-2xl bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold transition"
            >
              Exit Full Screen
            </button>
            <button
              onClick={() => setTheaterIndex((prev) => (prev + 1) % filteredPosts.length)}
              className="px-4 py-2 rounded-2xl bg-zinc-800 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1 shadow-xl border border-zinc-700 transition"
            >
              Next Reel <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ── Main Center Feed Column ─────────────────────────────────── */
        <div className="w-full max-w-[620px] flex flex-col gap-4">

          {/* 1. UNIVERSAL 5-STREAM MULTI-FEED SELECTOR */}
          <div className="bg-[#18191a] border border-zinc-800/80 rounded-2xl p-2 flex items-center justify-between shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              {streamTabs.map((tab) => {
                const isActive = activeFeedStream === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setFeedStream(tab.id);
                      if (tab.id === "live" && liveStreams.length > 0) {
                        setActiveLiveStream(liveStreams[0]);
                        setIsLiveModalOpen(true);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 text-white shadow-lg shadow-cyan-500/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="bg-pink-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 pl-2">
              <button
                onClick={() => setViewStyle("immersive_theater")}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center border border-zinc-700 transition"
                title="Toggle Immersive Full-Screen TikTok View"
              >
                <Layers className="w-3.5 h-3.5 text-pink-400" />
              </button>
            </div>
          </div>

          {/* QUICK STUDIO ACTION ROW */}
          <div className="grid grid-cols-3 gap-2 bg-[#121318] border border-zinc-800/80 rounded-2xl p-2.5 shadow-lg">
            <button
              onClick={() => setIsRecorderOpen(true)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-md transition transform hover:scale-[1.02]"
            >
              <Camera className="w-4 h-4" />
              <span>Record Short</span>
            </button>
            <button
              onClick={() => setIsComposerOpen(true)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs font-bold border border-zinc-700 transition transform hover:scale-[1.02]"
            >
              <Video className="w-4 h-4 text-cyan-400" />
              <span>Post Media</span>
            </button>
            <button
              onClick={() => {
                setActiveLiveStream(liveStreams[0] || null);
                setIsLiveModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-300 text-xs font-bold border border-zinc-700 transition transform hover:scale-[1.02]"
            >
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Go Live</span>
            </button>
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

          {/* 3. INLINE SPHERA PULSE 1/N THREAD & UNIVERSAL COMPOSER */}
          <SpheraPulseComposer
            inline={true}
            onPublish={handleAddNewPulsePost}
            onConvertToArticle={() => {
              openUniversalCreate("article");
            }}
          />

          {/* 4. MULTI-FORMAT FEED STREAM CARDS */}
          {filteredPosts.map((post) => {
            // Render Sphera Pulse Thread Card
            if (post.type === "pulse_thread" || post.isThread) {
              const convertedPulsePost: PostWithDetails = {
                id: post.id,
                type: "THREAD",
                content: post.content,
                visibility: "PUBLIC",
                mediaUrls: post.imageUrl ? [post.imageUrl] : [],
                createdAt: new Date(post.createdAt),
                updatedAt: new Date(post.createdAt),
                deletedAt: null,
                author: {
                  id: post.author.id,
                  role: "USER",
                  profile: {
                    username: post.author.username,
                    displayName: post.author.name,
                    avatar: post.author.avatarUrl,
                    bio: null,
                    isVerified: !!post.author.verified,
                    profileVisibility: "PUBLIC",
                  },
                },
                _count: {
                  reactions: post.likes,
                  comments: post.commentsCount,
                  saves: post.savesCount || 0,
                  shares: post.sharesCount,
                },
                isLiked: post.isLiked,
                isSaved: post.isSaved,
                viewsCount: post.viewsCount,
                repostsCount: post.repostsCount,
                isThread: post.isThread,
                threadIndex: post.threadIndex,
                threadTotal: post.threadTotal,
                threadReplies: post.threadReplies?.map((r) => ({
                  id: r.id,
                  type: "THREAD",
                  content: r.content,
                  visibility: "PUBLIC",
                  mediaUrls: r.mediaUrl ? [r.mediaUrl] : [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                  author: {
                    id: r.author.id,
                    role: "USER",
                    profile: {
                      username: r.author.username,
                      displayName: r.author.name,
                      avatar: r.author.avatarUrl,
                      bio: null,
                      isVerified: !!r.author.verified,
                      profileVisibility: "PUBLIC",
                    },
                  },
                  _count: { reactions: 0, comments: 0, saves: 0 },
                })),
                communityNote: post.communityNote
                  ? {
                      id: "cn-1",
                      postId: post.id,
                      authorId: "verifier",
                      content: post.communityNote.content,
                      sources: post.communityNote.sources,
                      status: "CURRENTLY_RATED_HELPFUL",
                      helpfulCount: post.communityNote.helpfulCount,
                      createdAt: new Date(),
                    }
                  : undefined,
              };

              return (
                <SpheraPulseThreadCard
                  key={post.id}
                  post={convertedPulsePost}
                  onLike={(id) => toggleLike(id)}
                  onRepost={() => {}}
                  onSave={(id) => toggleSave(id)}
                />
              );
            }

            // Render Proof-of-Work Bounty Card
            if (post.type === "bounty" && post.bounty) {
              return (
                <article
                  key={post.id}
                  className="bg-[#18191a] border border-zinc-800/80 rounded-2xl p-5 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-emerald-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.author.avatarUrl} alt={post.author.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-white">{post.author.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                        </div>
                        <span className="text-xs text-zinc-500">@{post.author.username} · {post.author.timeAgo}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-black rounded-full">
                      {post.bounty.reward}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-200">{post.content}</p>

                  {/* Bounty Box */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-sm font-black text-white">{post.bounty.title}</h4>
                      </div>
                      <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {post.bounty.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1">
                      <span>Sponsor: <strong className="text-zinc-200">{post.bounty.sponsor}</strong></span>
                      <span>•</span>
                      <span className="text-cyan-400 font-semibold">{post.bounty.clearanceRequired}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.bounty.tags.map((tag) => (
                        <span key={tag} className="text-[11px] bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-md font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-bold text-zinc-400">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 ${post.isLiked ? "text-pink-500" : "hover:text-white"}`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? "fill-pink-500" : ""}`} />
                      <span>{formatNumber(post.likes)}</span>
                    </button>
                    <Link
                      href="/career"
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs shadow-md"
                    >
                      Apply for Bounty →
                    </Link>
                  </div>
                </article>
              );
            }

            // Render Longform Article Card
            if (post.type === "article" && post.article) {
              return (
                <article
                  key={post.id}
                  className="bg-[#18191a] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl space-y-3"
                >
                  <div className="flex items-center justify-between px-5 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.author.avatarUrl} alt={post.author.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-white">{post.author.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                        </div>
                        <span className="text-xs text-zinc-500">@{post.author.username} · {post.author.timeAgo}</span>
                      </div>
                    </div>

                    <span className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full font-bold">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{post.article.readTimeMinutes} min read</span>
                    </span>
                  </div>

                  {post.article.coverImage && (
                    <div className="w-full h-48 overflow-hidden bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.article.coverImage} alt={post.article.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="px-5 space-y-1.5 pb-2">
                    <h3 className="text-base font-black text-white hover:text-cyan-400 cursor-pointer transition">
                      {post.article.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{post.article.subtitle}</p>
                  </div>

                  <div className="px-5 pb-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs font-bold text-zinc-400">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 ${post.isLiked ? "text-pink-500" : "hover:text-white"}`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? "fill-pink-500" : ""}`} />
                      <span>{formatNumber(post.likes)}</span>
                    </button>
                    <span className="text-cyan-400 font-bold hover:underline cursor-pointer">
                      Read Full Article →
                    </span>
                  </div>
                </article>
              );
            }

            // Standard Reel / Media Card (TikTok / IG Style)
            return (
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

                {/* Immersive Video Frame with Floating Engagement Rail */}
                <div className="relative w-full bg-black flex justify-center items-center overflow-hidden min-h-[380px] max-h-[580px] select-none">
                  <FeedMediaCard
                    post={post}
                    onDoubleClick={(e) => toggleLike(post.id, e)}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* SIDE ENGAGEMENT RAIL */}
                  <div className="absolute right-3 bottom-6 flex flex-col items-center gap-4 z-20">
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

                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => toggleSave(post.id)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition transform hover:scale-125 shadow-2xl ${
                          post.isSaved ? "bg-cyan-500 text-zinc-950" : "bg-black/60 text-white hover:bg-black/80"
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${post.isSaved ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Global Modals ────────────────────────────────────────── */}
      <VideoRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onPostCreated={(newPost) => {
          handleAddNewPost(newPost);
          setIsRecorderOpen(false);
        }}
      />
      <StoryViewerModal
        isOpen={isStoryViewerOpen}
        stories={stories}
        initialIndex={selectedStoryIndex}
        onClose={() => setIsStoryViewerOpen(false)}
        onAddStory={(newStory) => {
          setStories((prev) => [newStory, ...prev]);
          setIsStoryViewerOpen(false);
        }}
      />
      {activeLiveStream && (
        <LiveBroadcastModal
          isOpen={isLiveModalOpen}
          stream={activeLiveStream}
          onClose={() => setIsLiveModalOpen(false)}
          onSendGift={(giftName, recipient) => {
            setGiftNotification(`✨ Sent ${giftName} to @${recipient}!`);
            setTimeout(() => setGiftNotification(null), 3500);
          }}
        />
      )}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onPostCreated={(newPost) => {
          handleAddNewPost(newPost);
          setIsComposerOpen(false);
        }}
      />
    </div>
  );
}
