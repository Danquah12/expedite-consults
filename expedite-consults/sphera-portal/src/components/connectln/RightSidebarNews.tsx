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
import { NewsItem, SuggestedConnection } from "@/lib/connectln-data"
import { useLanguage } from "@/context/LanguageContext"

interface RightSidebarNewsProps {
  news: NewsItem[]
  suggestedPeople: SuggestedConnection[]
  onToggleConnect: (personId: string) => void
  onNewsClick?: (headline: string) => void
  onNavigateTab?: (tab: string) => void
  onOpenAIAssistant?: (initialQuery?: string) => void
  onSelectMember?: (member: any) => void
}

export function RightSidebarNews({
  news,
  suggestedPeople,
  onToggleConnect,
  onNewsClick,
  onNavigateTab,
  onOpenAIAssistant,
  onSelectMember
}: RightSidebarNewsProps) {
  const [showAllNews, setShowAllNews] = useState(false)
  const [sidebarQuery, setSidebarQuery] = useState("")
  const { t } = useLanguage()
  const displayedNews = showAllNews ? news : news.slice(0, 3)

  return (
    <aside className="space-y-3">
      {/* 1. COMPACT NOCTIS AI ASSISTANT BAR */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpenAIAssistant && onOpenAIAssistant()}
            className="flex items-center gap-2 group min-w-0 text-left cursor-pointer"
          >
            <div className="h-7 w-7 rounded-lg bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center text-[#0A66C2] dark:text-[#70B5F9] shrink-0 group-hover:bg-[#0A66C2] group-hover:text-white transition-colors">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] flex items-center gap-1.5 transition-colors">
                <span>{t("ask_vibe_ai", "Ask Noctis")}</span>
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                {t("vibe_ai_desc", "Career, Trade & Technical Intelligence")}
              </p>
            </div>
          </button>
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center gap-1 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{t("vibe_online", "Ready")}</span>
          </span>
        </div>

        {/* Query Input */}
        <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg p-1 border border-zinc-200/90 dark:border-zinc-700/80 focus-within:border-[#0A66C2] transition-all">
          <input
            type="text"
            placeholder={t("ask_noctis_placeholder", "Ask a question or search skills...")}
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onOpenAIAssistant) {
                onOpenAIAssistant(sidebarQuery)
                setSidebarQuery("")
              }
            }}
            className="flex-1 bg-transparent px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (onOpenAIAssistant) {
                onOpenAIAssistant(sidebarQuery)
                setSidebarQuery("")
              }
            }}
            className="rounded-md bg-[#0A66C2] hover:bg-[#004182] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors shrink-0 cursor-pointer"
          >
            {t("search_button", "Ask")}
          </button>
        </div>

        {/* Subtle 2-chip quick sparks */}
        <div className="flex items-center gap-1.5">
          {[
            { label: "✨ Resume Review", q: "Resume optimization tips" },
            { label: "🎯 Career & Pay Guide", q: "Top roles and compensation guide" },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenAIAssistant && onOpenAIAssistant(chip.q)}
              className="flex-1 text-[10px] font-medium rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 transition-colors border border-zinc-200/70 dark:border-zinc-700/60 truncate cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CONNECTIN NEWS & RESEARCH INTELLIGENCE */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            {t("news_and_pulse", "ConnectIn News & Pulse")}
          </h3>
          <Info className="h-4 w-4 text-zinc-400 cursor-pointer hover:text-zinc-600" />
        </div>

        <p className="text-xs font-semibold text-zinc-500 mb-2 dark:text-zinc-400">
          {t("top_stories", "Top stories & cyber intelligence")}
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
          className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 focus:outline-none cursor-pointer"
        >
          <span>{showAllNews ? t("show_less", "Show less") : t("show_more", "Show more")}</span>
          {showAllNews ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* 3. VERIFIED FELLOWS & PEOPLE TO FOLLOW */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            {t("verified_fellows", "Verified Fellows to Follow")}
          </h3>
          <Info className="h-4 w-4 text-zinc-400" />
        </div>

        <div className="space-y-3 mt-1">
          {suggestedPeople.slice(0, 2).map((person) => (
            <div key={person.id} className="flex items-start gap-2.5">
              <img
                src={person.avatar}
                alt={person.name}
                onClick={() => onSelectMember?.(person)}
                className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-800 cursor-pointer hover:ring-2 hover:ring-[#0A66C2] transition-all"
                title={`Open ${person.name}'s Workspace`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p
                    onClick={() => onSelectMember?.(person)}
                    className="font-bold text-xs text-zinc-900 hover:underline hover:text-[#0A66C2] cursor-pointer truncate dark:text-zinc-100"
                    title={`Open ${person.name}'s Workspace`}
                  >
                    {person.name}
                  </p>
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                </div>
                <p
                  onClick={() => onSelectMember?.(person)}
                  className="text-[11px] text-zinc-500 line-clamp-2 dark:text-zinc-400 leading-tight cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  {person.headline}
                </p>
                <button
                  onClick={() => onToggleConnect(person.id)}
                  className={`mt-1.5 flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    person.isConnected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-zinc-400 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-600 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {person.isConnected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  <span>{person.isConnected ? t("following", "Following") : t("follow", "Follow")}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
