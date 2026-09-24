"use client";

import { useState } from "react";
import {
  Search,
  Sparkles,
  TrendingUp,
  MoreHorizontal,
  CheckCircle2,
  BookOpen,
  Volume2,
  VolumeX,
  Plus,
  Share2,
} from "lucide-react";
import { dailyVerses, feedStore } from "@/lib/feed-store";

interface XTrendingSidebarProps {
  onTagClick?: (tag: string) => void;
  onOpenGospel?: () => void;
  onFollowUser?: (username: string) => void;
}

export function XTrendingSidebar({
  onTagClick,
  onOpenGospel,
  onFollowUser,
}: XTrendingSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlayingDailyVerse, setIsPlayingDailyVerse] = useState(false);
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({
    pastordavid: true,
    campus_fellowship: true,
    amara_creates: false,
    mj_tech: true,
  });

  const featuredVerse = dailyVerses[0];

  const handleToggleAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isPlayingDailyVerse) {
      window.speechSynthesis.cancel();
      setIsPlayingDailyVerse(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `${featuredVerse.reference}. ${featuredVerse.text}`
      );
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingDailyVerse(false);
      utterance.onerror = () => setIsPlayingDailyVerse(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingDailyVerse(true);
    }
  };

  const handleFollow = (username: string) => {
    const nextState = feedStore.toggleFollow(username);
    setFollowedMap((prev) => ({ ...prev, [username]: nextState }));
    onFollowUser && onFollowUser(username);
  };

  const trendingTopics = [
    { category: "Gospel & Faith · Trending", tag: "#GospelHope", posts: "24.8K", badge: "✝️" },
    { category: "Collegiate Tech · Trending", tag: "#HackUMD", posts: "18.2K", badge: "🔥" },
    { category: "Campus Life · Trending", tag: "#CampusPulse", posts: "12.5K" },
    { category: "Scripture & Devotionals · Trending", tag: "#DailyBread", posts: "9.6K", badge: "📖" },
    { category: "Athletics · Trending", tag: "#TowsonTigers", posts: "8.4K" },
    { category: "Next.js & AI · Trending", tag: "#BuildInPublic", posts: "6.2K" },
  ];

  const suggestedUsers = [
    {
      name: "Pastor David Osei",
      username: "pastordavid",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      bio: "Collegiate campus pastor & author. Grace over performance 🕊️",
      isGospel: true,
    },
    {
      name: "Campus Fellowship",
      username: "campus_fellowship",
      avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
      bio: "Inter-collegiate Christian student union (UMD · Towson · Hopkins)",
      isGospel: true,
    },
    {
      name: "Amara Diallo",
      username: "amara_creates",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "AI Engineer & SpheraNet Core Contributor 🚀",
      isVerified: true,
    },
    {
      name: "Marcus Johnson",
      username: "mj_tech",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      bio: "Fullstack dev & open-source builder 💻",
      isVerified: true,
    },
  ];

  return (
    <aside className="w-full space-y-4 text-white">
      {/* Search Input */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SpheraNet & Gospel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:bg-black transition-all"
          />
        </div>
      </div>

      {/* Verse of the Day Card (Gospel Menu Shortcut) */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-neutral-900 via-neutral-950 to-amber-950/30 p-4 relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-sm">✝️</span>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Verse of the Day
            </span>
          </div>
          <button
            onClick={handleToggleAudio}
            className={`p-1.5 rounded-full text-xs transition-colors ${
              isPlayingDailyVerse ? "bg-amber-400 text-black animate-pulse" : "bg-white/10 text-neutral-300 hover:text-white"
            }`}
            title="Listen to Verse"
          >
            {isPlayingDailyVerse ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-xs font-serif text-neutral-100 italic leading-relaxed">
          “{featuredVerse.text}”
        </p>

        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-xs font-bold text-amber-400">
            {featuredVerse.reference}
          </span>
          <button
            onClick={onOpenGospel}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 hover:underline"
          >
            Open Gospel Hub →
          </button>
        </div>
      </div>

      {/* What's Happening (Trends) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          What's happening
        </h3>

        <div className="space-y-3 divide-y divide-white/5">
          {trendingTopics.map((trend, i) => (
            <div
              key={i}
              onClick={() => onTagClick && onTagClick(trend.tag)}
              className="pt-2.5 first:pt-0 cursor-pointer group flex items-start justify-between gap-2"
            >
              <div>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {trend.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white group-hover:underline">
                    {trend.tag}
                  </h4>
                  {trend.badge && <span className="text-xs">{trend.badge}</span>}
                </div>
                <span className="text-[11px] text-neutral-500">
                  {trend.posts} posts
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick && onTagClick(trend.tag);
                }}
                className="text-neutral-500 hover:text-neutral-300 p-1"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Who to Follow */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
        <h3 className="text-base font-black text-white">Who to follow</h3>

        <div className="space-y-3 divide-y divide-white/5">
          {suggestedUsers.map((user) => {
            const isFollowing = !!followedMap[user.username];
            return (
              <div key={user.username} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-white truncate hover:underline cursor-pointer">
                        {user.name}
                      </h4>
                      {user.isGospel ? (
                        <span className="text-amber-400 text-[10px]">✝️</span>
                      ) : user.isVerified ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
                      ) : null}
                    </div>
                    <span className="text-[11px] text-neutral-500 block truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleFollow(user.username)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isFollowing
                      ? "border border-white/20 text-white hover:border-rose-500 hover:text-rose-500 hover:bg-rose-500/10"
                      : "bg-white text-black hover:bg-neutral-200"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Links */}
      <div className="px-3 text-[11px] text-neutral-500 space-y-1 leading-relaxed">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
          <a href="#" className="hover:underline">Accessibility</a>
          <a href="#" className="hover:underline">Gospel Safety</a>
        </div>
        <p>© 2026 Expedite Consults &middot; SpheraNet</p>
      </div>
    </aside>
  );
}
