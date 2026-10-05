"use client";

import { useState } from "react";
import {
  Gamepad2, Trophy, Flame, Play, Eye, Users,
  Sparkles, Radio, Swords, ChevronRight, ShieldCheck,
  Award, TrendingUp, Filter, CheckCircle2
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface StreamItem {
  id: string;
  creator: { name: string; handle: string; avatar: string; verified?: boolean };
  title: string;
  game: string;
  viewers: number;
  thumbnail: string;
  isLive?: boolean;
}

interface Tournament {
  id: string;
  title: string;
  game: string;
  gameBanner: string;
  prizePool: string;
  registeredSquads: number;
  maxSquads: number;
  status: "LIVE NOW" | "REGISTRATION OPEN" | "STARTS SOON";
  date: string;
  organizer: string;
}

const mockStreams: StreamItem[] = [
  {
    id: "st-1",
    creator: { name: "Kai Nakamura", handle: "@kai_fps", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", verified: true },
    title: "Radiant Ranked 1v1s + Custom AI Bot Arena Builds",
    game: "Valorant",
    viewers: 2840,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    isLive: true,
  },
  {
    id: "st-2",
    creator: { name: "Zara Williams", handle: "@zara.w", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", verified: true },
    title: "Speedrun Any% WR Attempts · Lo-Fi Beats & Chat Q&A",
    game: "Cyberpunk 2077",
    viewers: 1420,
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
    isLive: true,
  },
  {
    id: "st-3",
    creator: { name: "Elena Vasquez", handle: "@elena_v", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", verified: true },
    title: "Apex Legends Predator Ranked Grind w/ Pro Collegiate Squad",
    game: "Apex Legends",
    viewers: 4050,
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    isLive: true,
  },
];

const mockTournaments: Tournament[] = [
  {
    id: "tourn-1",
    title: "Sphera Collegiate Champions Cup — Season 4 Grand Finals",
    game: "Valorant",
    gameBanner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
    prizePool: "$5,000 USD",
    registeredSquads: 32,
    maxSquads: 32,
    status: "LIVE NOW",
    date: "Grand Finals Bo5 · Live Now",
    organizer: "UMD Esports & Sphera Gaming",
  },
  {
    id: "tourn-2",
    title: "DMV Regional Campus Showdown 2026",
    game: "Super Smash Bros. Ultimate",
    gameBanner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80",
    prizePool: "$1,500 USD",
    registeredSquads: 58,
    maxSquads: 64,
    status: "REGISTRATION OPEN",
    date: "Saturday · 4:00 PM EST",
    organizer: "DMV Smash Collegiate League",
  },
  {
    id: "tourn-3",
    title: "Tri-State 3v3 Weekend Invitational",
    game: "Rocket League",
    gameBanner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80",
    prizePool: "$800 USD",
    registeredSquads: 18,
    maxSquads: 24,
    status: "REGISTRATION OPEN",
    date: "Sunday · 2:00 PM EST",
    organizer: "Sphera Gaming Guild",
  },
  {
    id: "tourn-4",
    title: "Collegiate Predator Trios Championship",
    game: "Apex Legends",
    gameBanner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
    prizePool: "$2,500 USD",
    registeredSquads: 19,
    maxSquads: 20,
    status: "STARTS SOON",
    date: "Next Friday · 7:00 PM EST",
    organizer: "East Coast Esports Alliance",
  },
];

export default function GamingPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Games");

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── Match Score Ticker Bar ───────────────────────────────── */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-4 overflow-x-auto text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-semibold text-rose-400 uppercase text-[11px]">Live Matches</span>
        </div>

        <div className="flex items-center gap-5 flex-1 overflow-x-auto">
          <div className="flex items-center gap-2.5 whitespace-nowrap">
            <span className="font-semibold text-white">UMD Terrapins</span>
            <span className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded font-bold">13</span>
            <span className="text-zinc-500">vs</span>
            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-bold">9</span>
            <span className="font-semibold text-white">Towson Tigers</span>
            <span className="text-[11px] text-zinc-500">(Valorant Finals)</span>
          </div>

          <div className="w-px h-4 bg-zinc-800" />

          <div className="flex items-center gap-2.5 whitespace-nowrap">
            <span className="font-semibold text-white">Johns Hopkins</span>
            <span className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded font-bold">2</span>
            <span className="text-zinc-500">vs</span>
            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-bold">1</span>
            <span className="font-semibold text-white">UMBC Dawgs</span>
            <span className="text-[11px] text-zinc-500">(Smash Finals)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            Radiant Tier 2450 MMR
          </span>
        </div>
      </div>

      {/* ── Grand Finals Hero Stage ───────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-sm">
        {/* Background Image */}
        <div className="h-64 sm:h-72 w-full relative">
          <img
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80"
            alt="Esports Arena"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
        </div>

        {/* Hero Overlay Content */}
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5">
              <Radio size={12} className="animate-pulse" /> Live Grand Finals
            </span>
            <span className="bg-black/60 backdrop-blur-md text-zinc-300 border border-white/15 px-2.5 py-0.5 rounded-md text-[11px] font-medium">
              Collegiate Valorant Season 4
            </span>
          </div>

          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Collegiate Champions Cup — <span className="text-zinc-200">Grand Finals</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              32 university squads battling for the campus championship trophy and community prize pool.
            </p>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <div className="flex gap-5 items-center">
              <div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Prize Pool</p>
                <p className="text-lg font-bold text-emerald-400">$5,000 USD</p>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Live Viewers</p>
                <p className="text-lg font-bold text-white">14.8K Watching</p>
              </div>
            </div>

            <button className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
              <Play size={14} fill="currentColor" /> Watch Broadcast
            </button>
          </div>
        </div>
      </div>

      {/* ── Live Creator Streams ─────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-rose-500" />
            <h2 className="text-base font-bold text-white">Live Creator Streams</h2>
          </div>
          <span className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer">Browse All Channels →</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mockStreams.map((st) => (
            <div
              key={st.id}
              className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-xs flex flex-col cursor-pointer transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative w-full h-44 bg-zinc-950 overflow-hidden">
                <img src={st.thumbnail} alt={st.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
                  LIVE
                </div>
                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded text-[11px] font-medium">
                  {formatNumber(st.viewers)} viewers
                </div>
                <div className="absolute bottom-2.5 left-2.5 bg-zinc-950/80 backdrop-blur-md text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded text-[10px] font-medium">
                  {st.game}
                </div>
              </div>

              {/* Creator Info */}
              <div className="p-3.5 flex gap-3 items-start">
                <div className="h-9 w-9 rounded-full overflow-hidden border border-zinc-800 shrink-0">
                  <img src={st.creator.avatar} alt={st.creator.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-white truncate">
                    {st.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-zinc-400">{st.creator.name}</span>
                    {st.creator.verified && <CheckCircle2 size={12} className="text-sky-400 fill-sky-400/20" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Tournaments & Brackets Grid ────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Swords size={16} className="text-zinc-400" />
            <h2 className="text-base font-bold text-white">Active Tournaments & Brackets</h2>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto">
            {["All Games", "Valorant", "Smash", "Rocket League", "Apex"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-white text-zinc-950 font-semibold border-white shadow-xs"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockTournaments.map((t) => {
            const isLive = t.status === "LIVE NOW";
            const progress = (t.registeredSquads / t.maxSquads) * 100;

            return (
              <div
                key={t.id}
                className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between transition-all"
              >
                <div className="p-5 flex flex-col gap-3.5">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isLive ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">{t.game}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white">{t.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1">Hosted by {t.organizer} · {t.date}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-zinc-500 font-medium uppercase">Prize Pool</p>
                      <p className="text-base font-bold text-emerald-400">{t.prizePool}</p>
                    </div>
                  </div>

                  {/* Registered Squads Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Squads Registered</span>
                      <span className="font-semibold text-white">{t.registeredSquads} / {t.maxSquads}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-400 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/30 flex justify-between items-center">
                  <span className="text-xs text-zinc-500">
                    Bracket: <strong className="text-zinc-300">Double Elimination</strong>
                  </span>

                  <button
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isLive
                        ? "bg-white text-zinc-950 hover:bg-zinc-200 shadow-xs"
                        : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700"
                    }`}
                  >
                    {isLive ? "Watch Finals ▶" : "Register Squad"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
