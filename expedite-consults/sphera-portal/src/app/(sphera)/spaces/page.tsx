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
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500" />
            Audio Spaces & Discussions
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Join live student audio rooms, prayer circles, and founder breakout discussions.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Start a Space</span>
        </button>
      </div>

      {/* ACTIVE LIVE AUDIO STAGE */}
      {activeSpace && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[11px] font-semibold border border-rose-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Live Room
              </span>
              <span className="text-xs text-zinc-400 font-medium">{activeSpace.category}</span>
            </div>
            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              {activeSpace.listeners.toLocaleString()} listening
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{activeSpace.title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{activeSpace.topic}</p>
          </div>

          {/* SPEAKERS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {activeSpace.activeSpeakers.map((spk, i) => (
              <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 relative">
                <div className="relative">
                  <img
                    src={spk.avatar}
                    alt={spk.name}
                    className={`w-14 h-14 rounded-full object-cover border-2 ${
                      spk.isSpeaking ? "border-emerald-400 ring-2 ring-emerald-400/20" : "border-zinc-700"
                    }`}
                  />
                  {spk.isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-black">
                      <Mic className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-white mt-2 truncate w-full">{spk.name}</span>
                <span className="text-[11px] text-zinc-400">{spk.role}</span>
              </div>
            ))}
          </div>

          {/* LIVE AUDIO CONTROLS */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isMuted ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => setIsHandRaised(!isHandRaised)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isHandRaised ? "bg-amber-400 text-zinc-950 font-semibold" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
                }`}
                title="Raise Hand to Speak"
              >
                <Hand className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/feed?tab=GOSPEL&sub=music"
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors"
              >
                <Headphones className="w-3.5 h-3.5 text-zinc-400" />
                <span>Gospel Music Hub</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ALL LIVE SPACES LIST */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">All Active Spaces</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spaces.map((sp) => (
            <div
              key={sp.id}
              onClick={() => setActiveSpaceId(sp.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                activeSpaceId === sp.id
                  ? "bg-zinc-900 border-zinc-600 shadow-xs"
                  : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-semibold border border-rose-500/20">
                  Live
                </span>
                <span className="text-xs text-zinc-400">{sp.listeners} listening</span>
              </div>
              <h4 className="text-sm font-semibold text-white">{sp.title}</h4>
              <p className="text-xs text-zinc-400">Hosted by {sp.host}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
