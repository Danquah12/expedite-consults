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
      {/* 0. NOCTIS EMBEDDED Q&A CARD (https://dstrike.app/noctis) */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <a
            href="https://dstrike.app/noctis"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group min-w-0"
            title="Open Noctis — https://dstrike.app/noctis"
          >
            <div className="h-7 w-7 rounded-lg bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center text-[#0A66C2] dark:text-[#70B5F9] shrink-0 group-hover:bg-[#0A66C2] group-hover:text-white transition-colors">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] dark:group-hover:text-[#70B5F9] flex items-center gap-1.5 transition-colors">
                <span>{t("ask_vibe_ai", "Ask Noctis")}</span>
                <span className="rounded bg-amber-100 dark:bg-amber-950/50 text-[#7A4B00] dark:text-amber-300 text-[9px] font-bold px-1.5 py-0.2 border border-amber-300/40">
                  {t("qa_badge", "Q&A")}
                </span>
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                {t("vibe_ai_desc", "Campus & Professional Intelligence")}
              </p>
            </div>
          </a>
          <a
            href="https://dstrike.app/noctis"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0 transition-colors"
            title="Launch https://dstrike.app/noctis"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t("vibe_online", "Online")}</span>
          </a>
        </div>

        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {t("noctis_question_help", "Ask Noctis about DoD Zero Trust, RMF ATO, career strategy, tools, certifications, or code.")}
        </p>

        {/* Query Input */}
        <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700/80 focus-within:border-[#0A66C2] focus-within:ring-1 focus-within:ring-[#0A66C2]/20 transition-all">
          <input
            type="text"
            placeholder={t("ask_noctis_placeholder", "Ask Noctis a question...")}
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (onOpenAIAssistant) {
                  onOpenAIAssistant(sidebarQuery)
                  setSidebarQuery("")
                } else {
                  window.open("https://dstrike.app/noctis", "_blank", "noopener,noreferrer")
                }
              }
            }}
            className="flex-1 bg-transparent px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            onClick={() => {
              if (sidebarQuery.trim() && onOpenAIAssistant) {
                onOpenAIAssistant(sidebarQuery)
                setSidebarQuery("")
              } else {
                window.open("https://dstrike.app/noctis", "_blank", "noopener,noreferrer")
              }
            }}
            className="rounded-md bg-[#0A66C2] hover:bg-[#004182] px-2.5 py-1 text-xs font-semibold text-white transition-colors shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
          >
            {t("search_button", "Ask")} <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        {/* Quick prompt sparks */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {[
            { label: "🛡️ DoD Zero Trust", q: "Explain DoD Zero Trust" },
            { label: "📄 Resume Tips", q: "Resume optimization tips" },
            { label: "💼 Top Cyber Jobs", q: "Senior Cyber roles" },
            { label: "⚙️ NIST 800-53", q: "NIST 800-53 controls" },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onOpenAIAssistant && onOpenAIAssistant(chip.q)}
              className="text-[10px] rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 transition-colors border border-zinc-200 dark:border-zinc-700/60 cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. CONTEXTUAL COMMERCIAL RECOMMENDATION (POWERED BY CONNECTIN AI) */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[9px] font-semibold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            {t("recommended_for_you", "Recommended for you")}
          </span>
          <span className="text-[10px] font-semibold text-[#0A66C2] dark:text-sky-400">92% {t("match_rate", "Match")}</span>
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Because you follow <strong className="text-zinc-800 dark:text-zinc-200">Cloud Security &amp; Zero Trust</strong>:
        </p>

        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2.5 border border-zinc-200 dark:border-zinc-700/80 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <div>
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">AXIOM Cyber Suite</h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Autonomous Zero-Trust &amp; cATO</p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-600 dark:text-zinc-300 leading-normal">
            Deploy identity perimeters and continuous OSCAL compliance across AWS GovCloud in 1 click.
          </p>
          <button
            onClick={() => onNavigateTab && onNavigateTab('marketplace')}
            className="w-full rounded-md bg-[#0A66C2] hover:bg-[#004182] py-1.5 text-center text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
          >
            {t("start_trial", "Start 14-Day Free Trial →")}
          </button>
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

      {/* 4. UPCOMING DEMOS & WEBINARS FOR YOU */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-50/50 p-3 dark:bg-sky-950/20 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1 text-[11px]">
            <Calendar className="h-3.5 w-3.5 text-[#0A66C2]" />
            {t("upcoming_demo", "Upcoming Live Demo")}
          </span>
          <span className="text-[10px] text-zinc-400">Wed 2 PM EST</span>
        </div>
        <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
          AXIOM Enterprise Security Teardown &amp; cATO Sandbox
        </p>
        <button
          onClick={() => onNavigateTab && onNavigateTab('events')}
          className="text-xs font-bold text-[#0A66C2] hover:underline block text-right pt-0.5 cursor-pointer"
        >
          {t("register_free", "Register for Free →")}
        </button>
      </div>
    </aside>
  )
}
