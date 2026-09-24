"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Mic,
  Users,
  Sparkles,
  Headphones,
  Plus,
} from "lucide-react";
import { XLeftNav } from "@/components/feed/XLeftNav";
import { XTrendingSidebar } from "@/components/feed/XTrendingSidebar";
import { initialLiveStreams, initialGospelRadios } from "@/lib/feed-store";

export default function SpacesPage() {
  const [activeSpace, setActiveSpace] = useState<string | null>(null);

  const spaces = [
    {
      id: "sp1",
      title: "Inter-Collegiate Worship & Prayer Circle ✝️",
      host: "Campus Faith Network",
      hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      listeners: 1420,
      speakers: 4,
      isLive: true,
      category: "Gospel & Faith",
    },
    {
      id: "sp2",
      title: "Decentralized Systems & Cryptographic Verification",
      host: "Dr. Evelyn Reed",
      hostAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      listeners: 890,
      speakers: 3,
      isLive: true,
      category: "Technology",
    },
    {
      id: "sp3",
      title: "Towson & UMD Campus Hackathon Prep Session",
      host: "Amara Diallo",
      hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      listeners: 540,
      speakers: 2,
      isLive: true,
      category: "Student Life",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <div className="max-w-[1300px] mx-auto flex justify-center min-h-screen">
        {/* LEFT NAVIGATION RAIL */}
        <aside className="w-16 sm:w-20 xl:w-[275px] h-screen sticky top-0 flex-shrink-0 border-r border-neutral-800/80 z-30">
          <XLeftNav
            activeTab="SPACES"
            onSelectTab={() => {}}
            onOpenCompose={() => {}}
          />
        </aside>

        {/* CENTER TIMELINE */}
        <main className="flex-1 max-w-[620px] min-h-screen border-r border-neutral-800/80 p-4 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400" />
                Spaces & Live Audio
              </h1>
              <p className="text-xs text-neutral-400">Join live discussions and faith soaking rooms</p>
            </div>

            <button className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-400/20">
              <Plus className="w-4 h-4" />
              <span>Start Space</span>
            </button>
          </div>

          <div className="space-y-4">
            {spaces.map((sp) => (
              <div
                key={sp.id}
                className="p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-neutral-900 to-black hover:border-amber-500/30 transition-all space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    LIVE SPACE
                  </span>
                  <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {sp.listeners.toLocaleString()} listening
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {sp.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={sp.hostAvatar}
                      alt={sp.host}
                      className="w-6 h-6 rounded-full object-cover border border-white/10"
                    />
                    <span className="text-xs text-neutral-300 font-medium">Hosted by {sp.host}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-amber-400 font-semibold">{sp.category}</span>
                  <button
                    onClick={() => {
                      setActiveSpace(sp.id);
                      alert(`🎙️ Joined Space: ${sp.title}`);
                    }}
                    className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black text-xs font-bold text-white transition-all flex items-center gap-1.5"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Join Room</span>
                  </button>
                </div>
              </div>
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
