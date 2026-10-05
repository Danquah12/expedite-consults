"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Volume2,
  VolumeX,
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
    { category: "Community · Trending", tag: "#FaithAndWork", posts: "14.2K posts" },
    { category: "Collegiate · Trending", tag: "#CampusConnect", posts: "18.2K posts" },
    { category: "Design · Trending", tag: "#Craftsmanship", posts: "9.5K posts" },
    { category: "Builders · Trending", tag: "#BuildInPublic", posts: "8.6K posts" },
  ];

  const suggestedUsers = [
    {
      name: "Pastor David Osei",
      username: "pastordavid",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "Community Pastor",
    },
    {
      name: "Amara Diallo",
      username: "amara_creates",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Product Designer",
    },
    {
      name: "Marcus Johnson",
      username: "mj_tech",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      role: "Software Engineer",
    },
  ];

  return (
    <div className="w-[300px] xl:w-[320px] p-4 space-y-4 text-neutral-200">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search community..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
        />
      </div>

      {/* Daily Thought / Scripture Card (Clean, Warm & Peaceful) */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
            Daily Verse
          </span>
          <button
            onClick={handleToggleAudio}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            title="Listen to Verse"
          >
            {isPlayingDailyVerse ? (
              <VolumeX className="w-3.5 h-3.5 text-neutral-300" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <p className="text-xs font-serif leading-relaxed text-neutral-200 italic">
          "{featuredVerse.text}"
        </p>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
          <span className="font-semibold text-neutral-300">{featuredVerse.reference}</span>
          <button
            onClick={onOpenGospel}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            Read More →
          </button>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Trending Topics
        </h3>

        <div className="space-y-2.5">
          {trendingTopics.map((topic) => (
            <div
              key={topic.tag}
              onClick={() => onTagClick && onTagClick(topic.tag)}
              className="cursor-pointer group flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] text-neutral-500 block">{topic.category}</span>
                <span className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors">
                  {topic.tag}
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">{topic.posts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested People to Follow */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Suggested People
        </h3>

        <div className="space-y-3">
          {suggestedUsers.map((u) => {
            const isFollowed = followedMap[u.username];
            return (
              <div key={u.username} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-700 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">@{u.username} · {u.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleFollow(u.username)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
                    isFollowed
                      ? "bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700"
                      : "bg-white text-neutral-950 hover:bg-neutral-200"
                  }`}
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean Footer */}
      <div className="px-1 text-[11px] text-neutral-500 leading-relaxed">
        <p>Terms of Service · Privacy Policy · Community Guidelines</p>
        <p className="mt-1">© 2026 Expedite Consults</p>
      </div>
    </div>
  );
}
