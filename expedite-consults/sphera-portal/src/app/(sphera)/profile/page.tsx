"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  Settings,
  BookOpen,
  Sparkles,
  Music,
} from "lucide-react";
import { XLeftNav } from "@/components/feed/XLeftNav";
import { XTrendingSidebar } from "@/components/feed/XTrendingSidebar";
import { initialLiveStreams, initialFeedPosts } from "@/lib/feed-store";
import { XPostCard } from "@/components/feed/XPostCard";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"POSTS" | "REPLIES" | "GOSPEL" | "MEDIA" | "LIKES">("POSTS");
  const posts = initialFeedPosts.filter((p) => p.author.username === "kwesi" || p.author.username === "pastordavid");

  return (
    <div className="w-full flex flex-col pb-12">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="pb-3 flex items-center gap-4 border-b border-zinc-800">
        <Link href="/feed" className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-1.5">
            Kwesi Asiedu
            <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
          </h1>
          <span className="text-xs text-zinc-500 font-medium">148 Posts</span>
        </div>
      </div>

      {/* ── Cover & Avatar Card ────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/50 mt-4">
        <div className="h-36 sm:h-44 bg-zinc-800" />

        <div className="p-6">
          <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-4">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
              alt="Kwesi Asiedu"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-zinc-900 shadow-md"
            />
            <button className="px-4 py-1.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer">
              Edit profile
            </button>
          </div>

          {/* Bio Details */}
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                Kwesi Asiedu
                <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
              </h2>
              <span className="text-xs text-zinc-500 font-medium">@kwesi</span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Founder & Engineering Director at Expedite Consults & SpheraNet 🚀 &middot; Passionate about sovereign systems, collegiate OS graphs, and gospel truth ✝️
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>Maryland, USA</span>
              </div>
              <div className="flex items-center gap-1 text-sky-400">
                <LinkIcon className="w-3.5 h-3.5" />
                <a href="https://portal.expediteconsults.com" target="_blank" rel="noreferrer" className="hover:underline">
                  portal.expediteconsults.com
                </a>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Joined March 2026</span>
              </div>
            </div>

            <div className="flex gap-4 text-xs pt-1">
              <div><span className="font-bold text-white">412</span> <span className="text-zinc-500">Following</span></div>
              <div><span className="font-bold text-white">2.8K</span> <span className="text-zinc-500">Followers</span></div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="grid grid-cols-5 text-center border-t border-zinc-800/80 bg-zinc-900/30">
          {(["POSTS", "REPLIES", "GOSPEL", "MEDIA", "LIKES"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative py-3 text-xs font-semibold transition hover:bg-zinc-800/40 cursor-pointer"
            >
              <span className={activeTab === tab ? "text-white font-bold" : "text-zinc-500 font-medium"}>
                {tab === "POSTS" ? "Posts" : tab === "REPLIES" ? "Replies" : tab === "GOSPEL" ? "Faith" : tab === "MEDIA" ? "Media" : "Likes"}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Stream */}
      <div className="divide-y divide-zinc-800/80 mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        {posts.map((p) => (
          <XPostCard
            key={p.id}
            post={p}
            onLike={() => {}}
            onRepost={() => {}}
            onBookmark={() => {}}
            onVotePoll={() => {}}
            onAddComment={() => {}}
            onShare={() => {}}
            onFollow={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
