"use client"

import React from "react"
import Link from "next/link"
import {
  House,
  MessageSquare,
  PhoneCall,
  Users,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Tv,
  Radio,
  Building2,
  Sparkles,
  Download,
  ShieldCheck,
  PlayCircle,
  Zap,
  FileText,
  LayoutGrid,
  Table2,
  Presentation,
} from "lucide-react"

interface ConnectLn360LeftRailProps {
  activeTab: string
  onSelectTab: (tabId: string) => void
  unreadMessagesCount?: number
  onOpenAIAssistant?: () => void
  isAdminUser?: boolean
}

const RAIL_ITEMS: Array<{
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  accentClass: string
}> = [
  { id: "home", label: "Home", icon: House, accentClass: "text-[#0067B8] dark:text-sky-400" },
  { id: "messaging", label: "Mail & Chat", icon: MessageSquare, accentClass: "text-[#0F6CBD] dark:text-blue-400" },
  { id: "vibecomms", label: "Calls", icon: PhoneCall, accentClass: "text-emerald-600 dark:text-emerald-400" },
  { id: "network", label: "Network", icon: Users, accentClass: "text-indigo-600 dark:text-indigo-400" },
  { id: "jobs", label: "Jobs", icon: Briefcase, accentClass: "text-sky-700 dark:text-sky-400" },
  { id: "learning", label: "Learn", icon: GraduationCap, accentClass: "text-amber-600 dark:text-amber-400" },
  { id: "marketplace", label: "Market", icon: ShoppingBag, accentClass: "text-violet-600 dark:text-violet-400" },
  { id: "media", label: "Media", icon: Tv, accentClass: "text-rose-600 dark:text-rose-400" },
  { id: "pulserooms", label: "Pulse", icon: Radio, accentClass: "text-teal-600 dark:text-teal-400" },
  { id: "workbusiness", label: "Business", icon: Building2, accentClass: "text-[#0B1F3A] dark:text-zinc-200" },
]

export function ConnectLn360LeftRail({
  activeTab,
  onSelectTab,
  unreadMessagesCount = 0,
  onOpenAIAssistant,
  isAdminUser = false,
}: ConnectLn360LeftRailProps) {
  return (
    <aside
      aria-label="ConnectLn 360 App Rail"
      className="hidden lg:flex fixed left-0 top-[52px] bottom-0 z-40 w-[68px] flex-col justify-between border-r border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/95 dark:bg-zinc-950/95 backdrop-blur-md py-2 select-none"
    >
      <nav className="flex flex-col items-center gap-0.5 overflow-y-auto no-scrollbar px-1">
        {RAIL_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            activeTab === item.id ||
            (item.id === "vibecomms" && activeTab === "vibe")
          const badge = item.id === "messaging" ? unreadMessagesCount : 0

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              className={`group relative flex w-full flex-col items-center justify-center rounded-xl py-2 px-1 transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-zinc-900 shadow-[0_2px_10px_rgba(11,31,58,0.06)] border border-[#E7E2DA] dark:border-zinc-700 text-[#0B1F3A] dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-white/70 dark:hover:bg-zinc-900/70 hover:text-[#0B1F3A] dark:hover:text-white border border-transparent"
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#0067B8] dark:bg-sky-400"
                />
              )}
              <div className="relative">
                <Icon
                  strokeWidth={isActive ? 2.2 : 1.75}
                  className={`h-[18px] w-[18px] transition-colors ${
                    isActive ? item.accentClass : "group-hover:text-[#0067B8] dark:group-hover:text-sky-400"
                  }`}
                />
                {badge > 0 && (
                  <span
                    style={{ backgroundColor: "#CB112D", color: "#FFFFFF" }}
                    className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9.5px] font-bold leading-none"
                  >
                    {badge}
                  </span>
                )}
              </div>
              <span
                className={`mt-1 text-[10px] leading-tight tracking-tight truncate max-w-full ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}

        {/* ConnectLn 360 Studio — Proprietary Docs, Sheets & Slides */}
        <div className="w-full pt-1.5 mt-1 border-t border-[#E7E2DA] dark:border-zinc-800 flex flex-col items-center gap-0.5">
          <span className="text-[8.5px] font-extrabold tracking-widest uppercase text-[#0B5CAD] dark:text-sky-400">
            STUDIO
          </span>
          {[
            {
              id: "docs",
              shortLabel: "Docs",
              title: "ConnectLn Docs — Proprietary rich document studio",
              icon: FileText,
              accentClass: "text-[#0B5CAD] dark:text-sky-400",
            },
            {
              id: "sheets",
              shortLabel: "Sheets",
              title: "ConnectLn Sheets — Proprietary formula spreadsheets",
              icon: Table2,
              accentClass: "text-[#107C41] dark:text-emerald-400",
            },
            {
              id: "slides",
              shortLabel: "Slides",
              title: "ConnectLn Slides — Proprietary presentation decks",
              icon: Presentation,
              accentClass: "text-[#C84B28] dark:text-orange-400",
            },
            {
              id: "powerapps",
              shortLabel: "Power",
              title: "ConnectLn Power Apps — All Apps",
              icon: LayoutGrid,
              accentClass: "text-[#4338CA] dark:text-indigo-400",
            },
          ].map((sItem) => {
            const SIcon = sItem.icon
            const isSActive =
              activeTab === sItem.id ||
              (sItem.id === "powerapps" &&
                (activeTab === "sign" ||
                  activeTab === "invoice" ||
                  activeTab === "boards" ||
                  activeTab === "forms"))
            return (
              <button
                key={sItem.id}
                type="button"
                onClick={() => onSelectTab(sItem.id)}
                title={sItem.title}
                className={`group relative flex w-full flex-col items-center justify-center rounded-xl py-2 px-1 transition-all cursor-pointer ${
                  isSActive
                    ? "bg-white dark:bg-zinc-900 shadow-[0_2px_10px_rgba(11,31,58,0.06)] border border-[#E7E2DA] dark:border-zinc-700 text-[#0B1F3A] dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-white/70 dark:hover:bg-zinc-900/70 hover:text-[#0B1F3A] dark:hover:text-white border border-transparent"
                }`}
              >
                {isSActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#0067B8] dark:bg-sky-400"
                  />
                )}
                <SIcon
                  strokeWidth={isSActive ? 2.2 : 1.85}
                  className={`h-[18px] w-[18px] transition-colors ${sItem.accentClass}`}
                />
                <span
                  className={`mt-1 text-[10px] leading-tight tracking-tight truncate max-w-full ${
                    isSActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {sItem.shortLabel}
                </span>
              </button>
            )
          })}
        </div>

        {/* ConnectLn 360 Universe */}
        <div className="w-full pt-1.5 mt-1 border-t border-[#E7E2DA] dark:border-zinc-800 flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#0067B8] dark:text-sky-400">
            360
          </span>
          {[
            {
              id: "noctissocial",
              shortLabel: "Social",
              title: "Noctis Social (https://noctis.social) — Create, learn & connect in 60s",
              icon: PlayCircle,
              accentClass: "text-fuchsia-600 dark:text-fuchsia-400",
            },
            {
              id: "noctisclinic",
              shortLabel: "Clinic",
              title: "Noctis Clinic (https://www.dstrike.app/noctis) — Sparks, Drills & Stamps",
              icon: Zap,
              accentClass: "text-cyan-600 dark:text-cyan-400",
            },
          ].map((uItem) => {
            const UIcon = uItem.icon
            const isUActive = activeTab === uItem.id
            return (
              <button
                key={uItem.id}
                type="button"
                onClick={() => onSelectTab(uItem.id)}
                title={uItem.title}
                className={`group relative flex w-full flex-col items-center justify-center rounded-xl py-2 px-1 transition-all cursor-pointer ${
                  isUActive
                    ? "bg-white dark:bg-zinc-900 shadow-[0_2px_10px_rgba(11,31,58,0.06)] border border-[#E7E2DA] dark:border-zinc-700 text-[#0B1F3A] dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-white/70 dark:hover:bg-zinc-900/70 hover:text-[#0B1F3A] dark:hover:text-white border border-transparent"
                }`}
              >
                {isUActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#0067B8] dark:bg-sky-400"
                  />
                )}
                <UIcon
                  strokeWidth={isUActive ? 2.2 : 1.85}
                  className={`h-[18px] w-[18px] transition-colors ${uItem.accentClass}`}
                />
                <span
                  className={`mt-1 text-[10px] leading-tight tracking-tight truncate max-w-full ${
                    isUActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {uItem.shortLabel}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="flex flex-col items-center gap-1 border-t border-[#E7E2DA] dark:border-zinc-800 pt-2 px-1 shrink-0">
        {onOpenAIAssistant && (
          <button
            type="button"
            onClick={onOpenAIAssistant}
            title="Ask Noctis AI"
            className="flex w-full flex-col items-center justify-center rounded-xl py-2 px-1 text-[#0067B8] dark:text-sky-400 hover:bg-white dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <Sparkles strokeWidth={2} className="h-[18px] w-[18px]" />
            <span className="mt-1 text-[10px] font-bold leading-tight">Noctis</span>
          </button>
        )}

        <Link
          href="/connectin-portal#download-app"
          title="ConnectLn 360 Portal & Mobile App Downloads"
          className="flex w-full flex-col items-center justify-center rounded-xl py-2 px-1 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-[#0B1F3A] dark:hover:text-white transition-colors"
        >
          <Download strokeWidth={1.85} className="h-[18px] w-[18px]" />
          <span className="mt-1 text-[10px] font-medium leading-tight">Get App</span>
        </Link>

        <button
          type="button"
          onClick={() => onSelectTab(isAdminUser ? "adminiam" : "accountsecurity")}
          title={isAdminUser ? "Admin & Security" : "Account & Security"}
          className={`flex w-full flex-col items-center justify-center rounded-xl py-2 px-1 transition-colors cursor-pointer ${
            activeTab === "accountsecurity" || activeTab === "adminiam"
              ? "bg-white dark:bg-zinc-900 text-[#0067B8] dark:text-sky-400 font-bold border border-[#E7E2DA] dark:border-zinc-700"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-[#0B1F3A] dark:hover:text-white"
          }`}
        >
          <ShieldCheck strokeWidth={1.85} className="h-[18px] w-[18px]" />
          <span className="mt-1 text-[10px] font-medium leading-tight">
            {isAdminUser ? "Admin" : "Security"}
          </span>
        </button>
      </div>
    </aside>
  )
}
