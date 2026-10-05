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
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── Search Header Bar ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 pb-4 border-b border-zinc-800">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search discussions, campus, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "FOR_YOU", label: "For you" },
            { id: "CAMPUS", label: "Campus" },
            { id: "GOSPEL", label: "Faith & Reflection" },
            { id: "TECH", label: "Engineering" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                category === cat.id
                  ? "bg-white text-zinc-950 font-semibold shadow-xs"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Trending Section ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            Trending Community Topics
          </h2>
          <span className="text-xs text-zinc-500">Updated in real-time</span>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {trendingTopics.map((topic, i) => (
            <div
              key={i}
              className="py-3.5 flex items-center justify-between group hover:bg-zinc-800/40 transition-colors rounded-xl px-3 cursor-pointer"
            >
              <div className="space-y-0.5">
                <span className="text-[11px] text-zinc-500">{topic.category}</span>
                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors flex items-center gap-2">
                  {topic.tag}
                  {topic.isHot && (
                    <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 rounded font-medium">
                      Trending
                    </span>
                  )}
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">{topic.posts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
