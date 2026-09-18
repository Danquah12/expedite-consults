"use client"

import React, { useState } from "react"
import {
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  UserPlus,
  ExternalLink,
  Shield,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  Calendar,
  Briefcase,
  ShieldCheck
} from "lucide-react"
import { NewsItem, SuggestedConnection } from "@/lib/linkedin-data"

interface RightSidebarNewsProps {
  news: NewsItem[]
  suggestedPeople: SuggestedConnection[]
  onToggleConnect: (personId: string) => void
  onNewsClick?: (headline: string) => void
  onNavigateTab?: (tab: string) => void
}

export function RightSidebarNews({
  news,
  suggestedPeople,
  onToggleConnect,
  onNewsClick,
  onNavigateTab
}: RightSidebarNewsProps) {
  const [showAllNews, setShowAllNews] = useState(false)
  const displayedNews = showAllNews ? news : news.slice(0, 3)

  return (
    <aside className="space-y-3">
      {/* 1. CONTEXTUAL COMMERCIAL RECOMMENDATION (POWERED BY CONNECTIN AI) */}
      <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/90 to-purple-950 p-3.5 text-white shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-purple-500/30 px-2 py-0.5 text-[9px] font-bold text-purple-200 border border-purple-400/30 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-300" />
            Recommended for you
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-400">92% Match</span>
        </div>

        <p className="text-[11px] text-zinc-300">
          Because you follow <strong>Cloud Security &amp; Zero Trust</strong>:
        </p>

        <div className="rounded-lg bg-white/10 p-2.5 border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <div>
              <h4 className="font-bold text-xs text-white">AXIOM Cyber Suite</h4>
              <p className="text-[10px] text-zinc-300">Autonomous Zero-Trust &amp; cATO</p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-300 leading-tight">
            Deploy identity perimeters and continuous OSCAL compliance across AWS GovCloud in 1 click.
          </p>
          <button
            onClick={() => onNavigateTab && onNavigateTab('marketplace')}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 py-1.5 text-center text-xs font-bold text-white shadow-xs transition-all"
          >
            Start 14-Day Free Trial →
          </button>
        </div>
      </div>

      {/* 2. CONNECTIN NEWS & RESEARCH INTELLIGENCE */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            ConnectIn News &amp; Pulse
          </h3>
          <Info className="h-4 w-4 text-zinc-400 cursor-pointer hover:text-zinc-600" />
        </div>

        <p className="text-xs font-semibold text-zinc-500 mb-2 dark:text-zinc-400">
          Top stories &amp; cyber intelligence
        </p>

        <div className="space-y-2.5">
          {displayedNews.map((item) => (
            <div
              key={item.id}
              onClick={() => onNewsClick && onNewsClick(item.headline)}
              className="group cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 group-hover:bg-[#0A66C2] transition-colors shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800 group-hover:text-[#0A66C2] group-hover:underline dark:text-zinc-200 leading-snug">
                    {item.headline}
                  </h4>
                  <p className="mt-0.5 text-[10px] text-zinc-400">
                    {item.timeAgo} · {item.readersCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAllNews(!showAllNews)}
          className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 focus:outline-none"
        >
          <span>{showAllNews ? "Show less" : "Show more"}</span>
          {showAllNews ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* 3. VERIFIED FELLOWS & PEOPLE TO FOLLOW */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Verified Fellows to Follow
          </h3>
          <Info className="h-4 w-4 text-zinc-400" />
        </div>

        <div className="space-y-3 mt-1">
          {suggestedPeople.slice(0, 2).map((person) => (
            <div key={person.id} className="flex items-start gap-2.5">
              <img
                src={person.avatar}
                alt={person.name}
                className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-800"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-xs text-zinc-900 hover:underline hover:text-[#0A66C2] cursor-pointer truncate dark:text-zinc-100">
                    {person.name}
                  </p>
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                </div>
                <p className="text-[11px] text-zinc-500 line-clamp-2 dark:text-zinc-400 leading-tight">
                  {person.headline}
                </p>
                <button
                  onClick={() => onToggleConnect(person.id)}
                  className={`mt-1.5 flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                    person.isConnected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-zinc-400 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-600 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {person.isConnected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  <span>{person.isConnected ? "Following" : "Follow"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. UPCOMING DEMOS & WEBINARS FOR YOU */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-50/50 p-3 dark:bg-sky-950/20 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1 text-[11px]">
            <Calendar className="h-3.5 w-3.5 text-[#0A66C2]" />
            Upcoming Live Demo
          </span>
          <span className="text-[10px] text-zinc-400">Wed 2 PM EST</span>
        </div>
        <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
          AXIOM Enterprise Security Teardown &amp; cATO Sandbox
        </p>
        <button
          onClick={() => onNavigateTab && onNavigateTab('events')}
          className="text-xs font-bold text-[#0A66C2] hover:underline block text-right pt-0.5"
        >
          Register for Free →
        </button>
      </div>
    </aside>
  )
}
