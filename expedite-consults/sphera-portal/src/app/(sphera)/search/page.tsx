"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Settings,
  TrendingUp,
  Sparkles,
  Flame,
  Radio,
  BookOpen,
} from "lucide-react";
import { XLeftNav } from "@/components/feed/XLeftNav";
import { XTrendingSidebar } from "@/components/feed/XTrendingSidebar";
import { initialLiveStreams } from "@/lib/feed-store";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"FOR_YOU" | "CAMPUS" | "GOSPEL" | "TECH">("FOR_YOU");

  const trendingTopics = [
    { tag: "#Revival2026", posts: "48.2K posts", category: "Faith & Gospel", isHot: true },
    { tag: "Towson Spring Fest", posts: "14.1K posts", category: "Campus Life" },
    { tag: "#CeCeWinans", posts: "22.5K posts", category: "Gospel Music", isHot: true },
    { tag: "UMD CS Hackathon", posts: "8.9K posts", category: "Technology" },
    { tag: "Philippians 4:6", posts: "12.4K posts", category: "Scripture Trending" },
    { tag: "Cook Library Study Pods", posts: "3.2K posts", category: "Towson University" },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <div className="max-w-[1300px] mx-auto flex justify-center min-h-screen">
        {/* LEFT NAVIGATION RAIL */}
        <aside className="w-16 sm:w-20 xl:w-[275px] h-screen sticky top-0 flex-shrink-0 border-r border-neutral-800/80 z-30">
          <XLeftNav
            activeTab="EXPLORE"
            onSelectTab={() => {}}
            onOpenCompose={() => {}}
          />
        </aside>

        {/* CENTER COLUMN */}
        <main className="flex-1 max-w-[620px] min-h-screen border-r border-neutral-800/80">
          {/* Search Header */}
          <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-neutral-800/80 p-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search SpheraNet, Campus, Scriptures..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3">
              {[
                { id: "FOR_YOU", label: "For you" },
                { id: "CAMPUS", label: "🎓 Campus" },
                { id: "GOSPEL", label: "✝️ Gospel & Faith" },
                { id: "TECH", label: "💻 Technology" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    category === cat.id
                      ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </header>

          {/* Trending Banner */}
          <div className="p-4 border-b border-neutral-800/80 bg-gradient-to-b from-amber-950/20 to-black">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Trending Topics
              </h2>
            </div>

            <div className="divide-y divide-neutral-900">
              {trendingTopics.map((topic, i) => (
                <div key={i} className="py-3 flex items-center justify-between group hover:bg-white/[0.02] transition-colors rounded-xl px-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-neutral-500">{topic.category}</span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      {topic.tag}
                      {topic.isHot && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                          HOT
                        </span>
                      )}
                    </h3>
                    <span className="text-[11px] text-neutral-400 font-mono">{topic.posts}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* RIGHT TRENDING SIDEBAR */}
        <aside className="hidden lg:block w-[350px] xl:w-[390px] sticky top-0 h-screen p-4 flex-shrink-0">
          <XTrendingSidebar
            liveStreams={initialLiveStreams}
            onWatchLive={() => {}}
            onFollowUser={() => {}}
          />
        </aside>
      </div>
    </div>
  );
}
