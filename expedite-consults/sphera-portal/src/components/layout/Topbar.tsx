"use client";

import { useState } from "react";
import { Search, Bell, MessageCircle, Plus, ChevronDown, Sparkles, Command, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

interface TopbarProps {
  user?: {
    name: string;
    username: string;
    avatar?: string;
  };
  notificationCount?: number;
  messageCount?: number;
}

export function Topbar({
  user,
  notificationCount = 12,
  messageCount = 3,
}: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="fixed top-0 right-0 left-[280px] h-16 border-b border-white/10 bg-[#060c1d]/85 backdrop-blur-2xl z-30 flex items-center justify-between px-6 gap-6">
      {/* ── Search Command Bar ────────────────────────────────────── */}
      <div className="flex-1 max-w-2xl relative">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-4 text-[#00d4ff]" />
          <input
            placeholder="Search across 15 SpheraNet worlds... people, posts, reels, marketplace, bounties"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-11 pr-28 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/20 transition-all shadow-inner"
          />
          <div className="absolute right-3.5 flex items-center gap-1.5 text-[10px] text-[#94a3b8] bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/10 font-mono">
            <Command size={10} /> K
          </div>
        </div>
      </div>

      {/* ── Action Hub ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Create Post Button */}
        <Link href="/feed">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full gradient-btn-primary text-xs font-black shadow-[0_0_15px_rgba(0,212,255,0.35)]">
            <Plus size={15} />
            <span>Create</span>
          </button>
        </Link>

        {/* Sphera AI Quick Trigger */}
        <Link href="/ai">
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#a855f7]/15 to-[#6366f1]/15 border border-[#a855f7]/30 text-[#c084fc] hover:border-[#a855f7] text-xs font-bold transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles size={14} className="text-[#a855f7]" />
            <span className="hidden sm:inline">AI Agent</span>
          </button>
        </Link>

        {/* Messages */}
        <Link href="/messages">
          <button className="relative h-10 w-10 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 text-[#cbd5e1] hover:text-white hover:border-[#00d4ff]/40 hover:bg-white/[0.08] transition-all">
            <MessageCircle size={18} />
            {messageCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[17px] px-1 flex items-center justify-center rounded-full bg-[#00d4ff] text-[#030712] text-[9px] font-black shadow-[0_0_8px_#00d4ff]">
                {messageCount}
              </span>
            )}
          </button>
        </Link>

        {/* Notifications */}
        <Link href="/notifications">
          <button className="relative h-10 w-10 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 text-[#cbd5e1] hover:text-white hover:border-[#ec4899]/40 hover:bg-white/[0.08] transition-all">
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[17px] px-1 flex items-center justify-center rounded-full bg-[#ef4444] text-white text-[9px] font-black shadow-[0_0_8px_#ef4444]">
                {notificationCount}
              </span>
            )}
          </button>
        </Link>

        {/* User Pill */}
        {user && (
          <Link href="/profile" className="flex items-center gap-2.5 pl-2 hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#00d4ff] via-[#818cf8] to-[#ec4899] p-0.5 shadow-sm">
              <div className="w-full h-full bg-[#060c1d] rounded-full flex items-center justify-center text-xs font-black text-white">
                {user.name[0]}
              </div>
            </div>
            <ChevronDown size={14} className="text-[#64748b]" />
          </Link>
        )}
      </div>
    </header>
  );
}
