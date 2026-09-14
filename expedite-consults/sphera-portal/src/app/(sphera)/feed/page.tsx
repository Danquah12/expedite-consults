"use client";

import { useState } from "react";
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
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Post {
  id: string;
  type?: "standard" | "immersive_video";
  author: {
    name: string;
    username: string;
    avatarUrl: string;
    verified?: boolean;
    timeAgo: string;
    privacy?: string;
    isFollowed?: boolean;
  };
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  musicTitle?: string;
  musicAuthor?: string;
  hashtags?: string[];
  likes: number;
  commentsCount: number;
  sharesCount: number;
  savesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  likedByFriend?: string;
  commentsList?: { id: string; user: string; avatar: string; text: string; time: string; likes: number }[];
}

const mockFeedPosts: Post[] = [
  {
    id: "p1",
    type: "immersive_video",
    author: {
      name: "Amara Diallo",
      username: "amara_creates",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "2h ago",
      privacy: "Public",
      isFollowed: false,
    },
    content: "3 years of building in the dark, and today our largest platform update is finally live across SpheraNet! 🚀✨ Full breakdown dropping on Reels tonight. Tag a friend who needs to see this! 💫",
    videoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    musicTitle: "Afrobeats Synthwave Future Mix Vol. 4",
    musicAuthor: "DJ Khaled x Sphera Sound",
    hashtags: ["#SpheraViral", "#FYP", "#TechPulse", "#BuildInPublic", "#AI2026"],
    likes: 184200,
    commentsCount: 3210,
    sharesCount: 8900,
    savesCount: 12400,
    isLiked: true,
    likedByFriend: "Marcus Johnson",
    commentsList: [
      { id: "c1", user: "Marcus Johnson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", text: "This UI is next level! The sound synchronization is insane 🔥", time: "1h ago", likes: 242 },
      { id: "c2", user: "Zara Williams", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", text: "Proud of you Amara! Collegiate hackathons will never be the same 👏", time: "45m ago", likes: 118 },
    ]
  },
  {
    id: "p2",
    type: "immersive_video",
    author: {
      name: "Marcus Johnson",
      username: "mj_tech",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "4h ago",
      privacy: "Public",
      isFollowed: true,
    },
    content: "5 VS Code & AI shortcuts that changed my development workflow in 2026. Number 3 will save you 2 hours every single day 🤯 Try this right now and thank me later! 🦾💻",
    videoUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1000&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1000&auto=format&fit=crop&q=80",
    musicTitle: "Lo-Fi Study Beats & Cyber Bass",
    musicAuthor: "ChillHop Cafe Records",
    hashtags: ["#CodingHacks", "#VSCode", "#DevLife", "#Productivity", "#Nextjs"],
    likes: 94200,
    commentsCount: 1780,
    sharesCount: 14200,
    savesCount: 31000,
    likedByFriend: "Zara Williams",
    commentsList: [
      { id: "c3", user: "Elena Vasquez", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", text: "Shortcut #3 just fixed my entire terminal layout thank you!", time: "2h ago", likes: 89 },
    ]
  },
  {
    id: "p3",
    type: "standard",
    author: {
      name: "Zara Williams",
      username: "zara.w",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "1d ago",
      privacy: "Public",
      isFollowed: true,
    },
    content: "Collegiate hackathon kickoff at University of Maryland! Over 600 builders here hacking on autonomous AI agents, robotics, and next-gen gaming protocols 🔥 The energy in the Iribe Center is unbelievable.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    likes: 3410,
    commentsCount: 142,
    sharesCount: 58,
    savesCount: 312,
    likedByFriend: "Kwesi Asiedu",
  },
];

const mockLiveStreams = [
  { id: "l1", name: "Amara Diallo", viewers: "4.2K", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", title: "Live Coding & UI Architecture" },
  { id: "l2", name: "Cyber Club Live", viewers: "1.8K", avatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80", title: "CTF Ethical Hacking Speedrun" },
  { id: "l3", name: "DJ Chillhop", viewers: "920", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", title: "Midnight Coding Beats & Q&A" },
];

const mockStories = [
  {
    username: "Your Story",
    img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
    isUser: true,
  },
  {
    username: "Amara Diallo",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    hasLive: true,
  },
  {
    username: "Marcus J.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  },
  {
    username: "Zara W.",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
  },
  {
    username: "Elena V.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
  },
];

export default function FeedPage() {
  const [feedMode, setFeedMode] = useState<"FYP" | "FOLLOWING" | "LIVE">("FYP");
  const [viewStyle, setViewStyle] = useState<"standard" | "immersive_theater">("standard");
  const [posts, setPosts] = useState(mockFeedPosts);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [giftNotification, setGiftNotification] = useState<string | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState<{ x: number; y: number; id: string } | null>(null);
  const [theaterIndex, setTheaterIndex] = useState(0);

  const toggleLike = (id: string, e?: React.MouseEvent) => {
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
            likes: nextLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const toggleSave = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved, savesCount: (p.savesCount || 0) + (p.isSaved ? -1 : 1) } : p))
    );
  };

  const toggleFollow = (username: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.author.username === username
          ? { ...p, author: { ...p.author, isFollowed: !p.author.isFollowed } }
          : p
      )
    );
  };

  const sendGift = (giftName: string, recipient: string) => {
    setGiftNotification(`✨ Sent ${giftName} to @${recipient}!`);
    setTimeout(() => setGiftNotification(null), 3000);
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newC = {
            id: `c-${Date.now()}`,
            user: "Kwesi Asiedu (You)",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
            text: newCommentText.trim(),
            time: "Just now",
            likes: 0,
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            commentsList: [newC, ...(p.commentsList || [])],
          };
        }
        return p;
      })
    );
    setNewCommentText("");
  };

  const filteredPosts = posts.filter((p) => {
    if (feedMode === "FOLLOWING") return p.author.isFollowed;
    return true;
  });

  const activeTheaterPost = filteredPosts[theaterIndex % (filteredPosts.length || 1)] || filteredPosts[0];

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeTheaterPost?.videoUrl || activeTheaterPost?.imageUrl}
              alt="Immersive Reel"
              className="w-full h-full object-cover cursor-pointer"
              onDoubleClick={(e) => toggleLike(activeTheaterPost.id, e)}
            />

            {/* Top FYP / Following Tabs */}
            <div className="absolute top-4 left-0 right-0 z-30 flex items-center justify-center gap-4 text-sm font-black drop-shadow-md">
              <button
                onClick={() => setFeedMode("FOLLOWING")}
                className={`transition ${feedMode === "FOLLOWING" ? "text-white scale-110 underline underline-offset-8" : "text-white/60 hover:text-white"}`}
              >
                Following
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={() => setFeedMode("FYP")}
                className={`transition ${feedMode === "FYP" ? "text-white scale-110 underline underline-offset-8" : "text-white/60 hover:text-white"}`}
              >
                For You
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
              {activeTheaterPost?.hashtags && (
                <div className="flex flex-wrap gap-1">
                  {activeTheaterPost.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs font-black text-pink-400 drop-shadow-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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

              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => sendGift("💎 1,000 Diamonds", activeTheaterPost.author.username)}
                  className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 text-white flex items-center justify-center backdrop-blur-md transition transform hover:scale-125"
                >
                  <Gift className="w-5 h-5" />
                </button>
                <span className="text-[10px] font-black text-amber-300 drop-shadow-md">Gift</span>
              </div>

              <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center animate-spin [animation-duration:4s] shadow-2xl">
                <div className="w-4 h-4 rounded-full bg-pink-500 border border-white" />
              </div>
            </div>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
          </div>

          {/* Navigation Controls */}
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

          {/* 1. FYP / FOLLOWING / LIVE TOP NAVIGATION TABS */}
          <div className="bg-[#18191a] border border-zinc-800/80 rounded-2xl p-2.5 flex items-center justify-between shadow-xl backdrop-blur-md">
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
                <span>For You (FYP)</span>
              </button>

              <button
                onClick={() => setFeedMode("FOLLOWING")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  feedMode === "FOLLOWING"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-500 text-white shadow-md shadow-cyan-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <span>Following</span>
              </button>

              <button
                onClick={() => setFeedMode("LIVE")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  feedMode === "LIVE"
                    ? "bg-rose-600 text-white animate-pulse"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-rose-300" />
                <span>LIVE Now</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewStyle("immersive_theater")}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition"
                title="Toggle Immersive Full-Screen View"
              >
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                <span>📱 Immersive FYP Mode</span>
              </button>
            </div>
          </div>

          {/* 2. STORIES & LIVE BROADCAST TRAY */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none py-1">
            {mockStories.map((story, idx) => (
              <div
                key={idx}
                className="relative w-24 h-36 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer group shadow-lg border border-zinc-800/80 transition transform hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={story.img} alt={story.username} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {story.isUser ? (
                  <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center border-2 border-zinc-900 shadow-md">
                    <Plus className="w-4 h-4 text-white font-bold" />
                  </div>
                ) : (
                  <div className={`absolute top-2 left-2 w-8 h-8 rounded-full overflow-hidden p-0.5 ${story.hasLive ? "bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 animate-pulse" : "bg-cyan-500"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={story.img} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  </div>
                )}

                {story.hasLive && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-rose-600 text-white font-mono text-[9px] font-black rounded-md animate-pulse">
                    LIVE
                  </span>
                )}

                <p className="absolute bottom-2 left-2 right-2 text-[11px] font-bold text-white truncate shadow-xs">
                  {story.username}
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
                onClick={() => {}}
                className="flex-1 text-left bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 rounded-full px-4 py-2.5 text-xs font-medium border border-zinc-700/60 transition"
              >
                Share a Reel, Sound, or Creator Post to #FYP...
              </button>
            </div>

            <div className="flex items-center justify-around pt-2 border-t border-zinc-800/80 text-xs font-bold text-zinc-400">
              <button className="flex items-center gap-1.5 hover:text-pink-400 px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition">
                <Video className="w-4 h-4 text-rose-500" />
                <span>Record Short</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-cyan-400 px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition">
                <Music className="w-4 h-4 text-cyan-400" />
                <span>Add Audio Track</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-amber-400 px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Duet / Filter</span>
              </button>
            </div>
          </div>

          {/* 4. POSTS & IMMERSIVE VIDEO CARDS */}
          {posts.map((post) => (
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

              {/* Immersive Video / Media Frame with Floating Interaction Rail */}
              <div className="relative w-full bg-black flex justify-center items-center overflow-hidden min-h-[380px] max-h-[580px] select-none">
                {/* Media Graphic */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl || post.videoUrl}
                  alt="Creator post"
                  className="w-full h-full object-cover max-h-[580px] cursor-pointer"
                  onDoubleClick={(e) => toggleLike(post.id, e)}
                />

                {/* Gradient Scrims */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* ── SIDE ENGAGEMENT RAIL (Right Side) ── */}
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

                  {/* 4. Share & Duet Button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => sendGift("Shared Link", post.author.username)}
                      className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition transform hover:scale-110 shadow-2xl"
                      title="Share / Duet / Stitch"
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

                  {/* 6. Spinning Vinyl Sound Disc */}
                  <div className="mt-1 relative">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center animate-spin [animation-duration:4s] shadow-2xl">
                      <div className="w-4 h-4 rounded-full bg-pink-500 border border-white" />
                    </div>
                    <Music className="w-3.5 h-3.5 text-pink-400 absolute -top-2 -left-2 animate-bounce" />
                  </div>

                </div>

                {/* ── AUDIO & SOUND SCROLLING MARQUEE (Bottom Left) ── */}
                {post.musicTitle && (
                  <div className="absolute left-4 bottom-4 z-20 flex items-center gap-2 max-w-[65%] bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <Music className="w-3.5 h-3.5 text-pink-400 flex-shrink-0 animate-pulse" />
                    <div className="overflow-hidden whitespace-nowrap text-[11px] font-black text-white">
                      <span className="inline-block animate-marquee">{post.musicTitle} • {post.musicAuthor}</span>
                    </div>
                  </div>
                )}

                {/* Sound Mute Toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* ── INTERACTIVE COMMENTS DRAWER ── */}
              {activeCommentPostId === post.id && (
                <div className="px-5 py-3 border-t border-zinc-800 bg-[#141517] space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-300">
                      💬 Live Comments ({post.commentsCount.toLocaleString()})
                    </span>
                    <button onClick={() => setActiveCommentPostId(null)} className="text-zinc-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Add a nice comment or tag @friend..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                      className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="bg-pink-600 hover:bg-pink-500 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1 shadow-md"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {post.commentsList?.map((c) => (
                      <div key={c.id} className="flex gap-2.5 items-start text-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.avatar} alt={c.user} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 bg-zinc-800/50 p-2 rounded-xl">
                          <div className="flex items-center justify-between font-bold text-zinc-300 text-[11px]">
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
      )}

      {/* ── Right Sidebar: Live Broadcasts & Trends ───────────── */}
      <aside className="hidden lg:block w-[300px] flex-shrink-0 sticky top-20 space-y-4">
        
        {/* 1. Live Broadcasts Widget */}
        <div className="bg-[#18191a] border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>LIVE Now on Sphera</span>
            </h3>
            <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full font-bold">12 Streams</span>
          </div>

          <div className="space-y-2.5">
            {mockLiveStreams.map((stream) => (
              <div
                key={stream.id}
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
  );
}
