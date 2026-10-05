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
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <div className="max-w-[1300px] mx-auto flex justify-center min-h-screen">
        {/* LEFT NAVIGATION RAIL */}
        <aside className="w-16 sm:w-20 xl:w-[275px] h-screen sticky top-0 flex-shrink-0 border-r border-neutral-800/80 z-30">
          <XLeftNav
            activeTab="PROFILE"
            onSelectTab={() => {}}
            onOpenCompose={() => {}}
          />
        </aside>

        {/* CENTER TIMELINE */}
        <main className="flex-1 max-w-[620px] min-h-screen border-r border-neutral-800/80">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-neutral-800/80 px-4 py-2 flex items-center gap-6">
            <Link href="/feed" className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-white flex items-center gap-1.5">
                Kwesi Asiedu
                <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
              </h1>
              <span className="text-xs text-neutral-500 font-mono">148 Posts</span>
            </div>
          </header>

          {/* Cover & Avatar Header */}
          <div className="relative">
            <div className="h-36 sm:h-44 bg-gradient-to-r from-amber-600 via-amber-800 to-indigo-950" />
            
            <div className="px-4 pb-4">
              <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
                  alt="Kwesi Asiedu"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-black"
                />
                <button className="px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/10 text-xs font-bold text-white transition-colors">
                  Edit profile
                </button>
              </div>

              {/* Bio Details */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-1.5">
                    Kwesi Asiedu
                    <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                  </h2>
                  <span className="text-xs text-neutral-500">@kwesi</span>
                </div>

                <p className="text-xs text-neutral-200 leading-relaxed">
                  Founder & Engineering Director at Expedite Consults & SpheraNet 🚀 &middot; Passionate about sovereign systems, collegiate OS graphs, and gospel truth ✝️
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-neutral-400 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Maryland, USA</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <a href="https://portal.expediteconsults.com" target="_blank" rel="noreferrer">
                      portal.expediteconsults.com
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined March 2026</span>
                  </div>
                </div>

                <div className="flex gap-4 text-xs">
                  <div><span className="font-bold text-white">412</span> <span className="text-neutral-500">Following</span></div>
                  <div><span className="font-bold text-white">2.8K</span> <span className="text-neutral-500">Followers</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="grid grid-cols-5 text-center border-t border-b border-neutral-800/80">
            {(["POSTS", "REPLIES", "GOSPEL", "MEDIA", "LIKES"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative py-3 text-xs font-bold transition hover:bg-white/5"
              >
                <span className={activeTab === tab ? "text-white" : "text-neutral-500 font-medium"}>
                  {tab === "POSTS" ? "Posts" : tab === "REPLIES" ? "Replies" : tab === "GOSPEL" ? "✝️ Gospel" : tab === "MEDIA" ? "Media" : "Likes"}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-amber-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Posts Stream */}
          <div className="divide-y divide-neutral-900">
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
