"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  Mic,
  MicOff,
  Users,
  Sparkles,
  Headphones,
  Plus,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Share2,
  MessageSquare,
  Hand,
  Shield,
} from "lucide-react";
import { XLeftNav } from "@/components/feed/XLeftNav";
import { XTrendingSidebar } from "@/components/feed/XTrendingSidebar";

export default function SpacesPage() {
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>("sp1");
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [audioLevel, setAudioLevel] = useState(65);

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
      topic: "Midday Prayer, Grace & Scripture Meditation",
      activeSpeakers: [
        { name: "Pastor David", role: "Host", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", isSpeaking: true },
        { name: "Amara Diallo", role: "Speaker", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", isSpeaking: false },
        { name: "Kofi Mensah", role: "Speaker", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", isSpeaking: true },
      ],
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
      topic: "Zero-Knowledge Proofs & Enterprise Cyber Defense",
      activeSpeakers: [
        { name: "Dr. Evelyn Reed", role: "Host", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", isSpeaking: true },
      ],
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
      topic: "Next.js 16 AI Agents & Student Project Teams",
      activeSpeakers: [
        { name: "Amara Diallo", role: "Host", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", isSpeaking: false },
      ],
    },
  ];

  const activeSpace = spaces.find((s) => s.id === activeSpaceId) || spaces[0];

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
                <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                Spaces & Live Audio
              </h1>
              <p className="text-xs text-neutral-400">Join real-time audio rooms, collegiate prayer circles & discussions</p>
            </div>

            <button className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-400/20">
              <Plus className="w-4 h-4" />
              <span>Start Space</span>
            </button>
          </div>

          {/* ACTIVE LIVE AUDIO STAGE */}
          {activeSpace && (
            <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-6 shadow-2xl relative overflow-hidden space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black border border-red-500/30 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    LIVE AUDIO ROOM
                  </span>
                  <span className="text-xs text-amber-400 font-mono">{activeSpace.category}</span>
                </div>
                <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {activeSpace.listeners.toLocaleString()} listening
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-white">{activeSpace.title}</h2>
                <p className="text-xs text-neutral-300 mt-1">{activeSpace.topic}</p>
              </div>

              {/* SPEAKERS GRID */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {activeSpace.activeSpeakers.map((spk, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/5 relative">
                    <div className="relative">
                      <img
                        src={spk.avatar}
                        alt={spk.name}
                        className={`w-14 h-14 rounded-full object-cover border-2 ${
                          spk.isSpeaking ? "border-amber-400 ring-4 ring-amber-400/20 animate-pulse" : "border-white/20"
                        }`}
                      />
                      {spk.isSpeaking && (
                        <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-black">
                          <Mic className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white mt-2 truncate w-full">{spk.name}</span>
                    <span className="text-[10px] text-neutral-400">{spk.role}</span>
                  </div>
                ))}
              </div>

              {/* LIVE AUDIO CONTROLS */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full transition-all ${
                      isMuted ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title={isMuted ? "Unmute Mic" : "Mute Mic"}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => setIsHandRaised(!isHandRaised)}
                    className={`p-3 rounded-full transition-all ${
                      isHandRaised ? "bg-amber-400 text-black shadow-lg shadow-amber-400/30" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title="Raise Hand to Speak"
                  >
                    <Hand className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/feed?tab=GOSPEL&sub=music"
                    className="px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Gospel Music Hub</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ALL LIVE SPACES LIST */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">All Active Spaces</h3>
            {spaces.map((sp) => (
              <div
                key={sp.id}
                onClick={() => setActiveSpaceId(sp.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  activeSpaceId === sp.id
                    ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5"
                    : "bg-neutral-900/80 border-white/10 hover:border-white/20 hover:bg-neutral-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                    LIVE
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">{sp.listeners} listening</span>
                </div>
                <h4 className="text-sm font-bold text-white">{sp.title}</h4>
                <p className="text-xs text-neutral-400">Hosted by {sp.host}</p>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT TRENDING SIDEBAR */}
        <aside className="hidden lg:block w-[290px] xl:w-[350px] min-h-screen sticky top-0 p-4 flex-shrink-0">
          <XTrendingSidebar onOpenAuthModal={() => {}} />
        </aside>
      </div>
    </div>
  );
}
