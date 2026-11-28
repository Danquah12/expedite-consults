"use client"

import React, { useMemo, useState } from "react"
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
  Compass,
  User,
  MoreHorizontal,
  Search,
  ChevronDown,
  ChevronUp,
  Wallet,
  X,
} from "lucide-react"

interface ConnectLn360LeftRailProps {
  activeTab: string
  onSelectTab: (tabId: string) => void
  unreadMessagesCount?: number
  unreadNotificationsCount?: number
  onOpenAIAssistant?: () => void
  isAdminUser?: boolean
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

interface LeftNavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  badgeText?: string
  badgeStyle?: "shop" | "count"
  accentClass: string
}

export function ConnectLn360LeftRail({
  activeTab,
  onSelectTab,
  unreadMessagesCount = 0,
  onOpenAIAssistant,
  isAdminUser = false,
  mobileOpen = false,
  onCloseMobile,
}: ConnectLn360LeftRailProps) {
  const [quickFilter, setQuickFilter] = useState("")
  const [showMoreItems, setShowMoreItems] = useState(false)

  const primaryItems: LeftNavItem[] = useMemo(
    () => [
      { id: "home", label: "For You", icon: House, accentClass: "text-sky-400" },
      {
        id: "marketplace",
        label: "Market",
        icon: ShoppingBag,
        badgeText: "SHOP",
        badgeStyle: "shop",
        accentClass: "text-emerald-400",
      },
      { id: "powerapps", label: "Explore", icon: Compass, accentClass: "text-indigo-400" },
      { id: "network", label: "Following", icon: Users, accentClass: "text-violet-400" },
      { id: "vibecomms", label: "Calls", icon: PhoneCall, accentClass: "text-emerald-400" },
      { id: "media", label: "Media", icon: Tv, accentClass: "text-rose-400" },
      { id: "pulserooms", label: "LIVE Hub", icon: Radio, accentClass: "text-teal-400" },
      {
        id: "messaging",
        label: "Messages",
        icon: MessageSquare,
        badgeText: unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined,
        badgeStyle: "count",
        accentClass: "text-sky-400",
      },
      { id: "jobs", label: "Jobs", icon: Briefcase, accentClass: "text-blue-400" },
      { id: "learning", label: "Learn", icon: GraduationCap, accentClass: "text-amber-400" },
      { id: "profile", label: "Profile", icon: User, accentClass: "text-zinc-200" },
      {
        id: isAdminUser ? "adminiam" : "accountsecurity",
        label: "Security",
        icon: ShieldCheck,
        accentClass: "text-cyan-400",
      },
    ],
    [unreadMessagesCount, isAdminUser]
  )

  const moreItems: LeftNavItem[] = useMemo(
    () => [
      { id: "docs", label: "Docs Studio", icon: FileText, accentClass: "text-sky-400" },
      { id: "sheets", label: "Sheets Studio", icon: Table2, accentClass: "text-emerald-400" },
      { id: "slides", label: "Slides Studio", icon: Presentation, accentClass: "text-orange-400" },
      { id: "noctissocial", label: "Noctis Social", icon: PlayCircle, accentClass: "text-fuchsia-400" },
      { id: "noctisclinic", label: "Noctis Clinic", icon: Zap, accentClass: "text-cyan-400" },
      { id: "workbusiness", label: "Business Hub", icon: Building2, accentClass: "text-indigo-300" },
      { id: "plans", label: "Wallet & Plans", icon: Wallet, accentClass: "text-amber-400" },
      ...(isAdminUser
        ? [{ id: "accountsecurity", label: "My Security", icon: LayoutGrid, accentClass: "text-sky-400" }]
        : []),
    ],
    [isAdminUser]
  )

  const normalizedQuery = quickFilter.trim().toLowerCase()
  const filteredPrimary = normalizedQuery
    ? primaryItems.filter((item) => item.label.toLowerCase().includes(normalizedQuery))
    : primaryItems
  const filteredMore = normalizedQuery
    ? moreItems.filter((item) => item.label.toLowerCase().includes(normalizedQuery))
    : showMoreItems
    ? moreItems
    : []

  const isTabActive = (itemId: string) => {
    if (itemId === "vibecomms" && (activeTab === "vibecomms" || activeTab === "vibe")) return true
    if (
      itemId === "powerapps" &&
      ["powerapps", "sign", "invoice", "boards", "forms"].includes(activeTab)
    ) {
      return true
    }
    return activeTab === itemId
  }

  const handleSelect = (tabId: string) => {
    onSelectTab(tabId)
    onCloseMobile?.()
  }

  const renderNavBody = (isMobileDrawer: boolean) => (
    <>
      <div className="flex flex-col min-h-0 flex-1 space-y-2.5">
        {isMobileDrawer && (
          <div className="flex items-center justify-between px-1 pb-1 border-b border-zinc-200 dark:border-indigo-400/15">
            <span className="text-xs font-extrabold tracking-wide text-zinc-900 dark:text-slate-100">
              ConnectLn Quick Nav
            </span>
            <button
              type="button"
              onClick={() => onCloseMobile?.()}
              aria-label="Close navigation menu"
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-white/10 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Top Quick Nav Filter Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-slate-400" />
          <input
            type="text"
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            placeholder="Quick nav filter..."
            data-testid={isMobileDrawer ? "mobile-rail-quick-filter" : "left-rail-quick-filter"}
            className="w-full rounded-full border border-zinc-200 dark:border-indigo-400/20 bg-zinc-100/80 dark:bg-[#080b16] pl-8 pr-7 py-1.5 text-xs text-zinc-900 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
          />
          {quickFilter && (
            <button
              type="button"
              onClick={() => setQuickFilter("")}
              aria-label="Clear filter"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 hover:text-zinc-700 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Scrollable Primary + Overflow Nav List */}
        <nav
          aria-label={isMobileDrawer ? "Mobile ConnectLn Navigation" : "Desktop ConnectLn Navigation"}
          className="flex-1 overflow-y-auto no-scrollbar space-y-1 pr-0.5"
        >
          {filteredPrimary.map((item) => {
            const Icon = item.icon
            const active = isTabActive(item.id)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-all cursor-pointer border ${
                  active
                    ? "bg-blue-50 text-[#0A66C2] border-blue-200 font-bold dark:bg-gradient-to-r dark:from-[#122042] dark:to-[#1a183b] dark:border-sky-400/45 dark:text-sky-300 dark:shadow-[0_0_16px_rgba(56,189,248,0.14)]"
                    : "border-transparent text-zinc-700 hover:bg-zinc-100/80 dark:text-slate-200 dark:hover:bg-white/[0.06] font-semibold"
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    strokeWidth={active ? 2.2 : 1.85}
                    className={`h-[17px] w-[17px] shrink-0 ${
                      active ? "text-[#0A66C2] dark:text-sky-300" : `text-zinc-500 dark:text-slate-300 group-hover:${item.accentClass}`
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badgeText && item.badgeStyle === "shop" && (
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-400/35 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-emerald-700 dark:text-emerald-300">
                    {item.badgeText}
                  </span>
                )}
                {item.badgeText && item.badgeStyle === "count" && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0A66C2] dark:bg-sky-500 px-1 text-[10px] font-bold text-white">
                    {item.badgeText}
                  </span>
                )}
              </button>
            )
          })}

          {!normalizedQuery && (
            <button
              type="button"
              data-testid={isMobileDrawer ? "mobile-rail-more-btn" : "left-rail-more-btn"}
              onClick={() => setShowMoreItems((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-white/[0.06] cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <MoreHorizontal className="h-[17px] w-[17px]" />
                <span>More</span>
              </span>
              {showMoreItems ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}

          {filteredMore.length > 0 && (
            <div className="pt-1 mt-1 border-t border-zinc-200 dark:border-indigo-400/15 space-y-1">
              {filteredMore.map((item) => {
                const Icon = item.icon
                const active = isTabActive(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs transition-all cursor-pointer border ${
                      active
                        ? "bg-blue-50 text-[#0A66C2] border-blue-200 font-bold dark:bg-sky-500/15 dark:border-sky-400/40 dark:text-sky-300"
                        : "border-transparent text-zinc-600 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-white/[0.06] font-medium"
                    }`}
                  >
                    <Icon strokeWidth={1.85} className={`h-4 w-4 shrink-0 ${item.accentClass}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Compact Action Pills */}
      <div className="pt-2.5 mt-2 border-t border-zinc-200 dark:border-indigo-400/15 space-y-2 shrink-0">
        <div className="grid grid-cols-2 gap-1.5">
          {onOpenAIAssistant ? (
            <button
              type="button"
              onClick={() => {
                onOpenAIAssistant()
                onCloseMobile?.()
              }}
              className="flex items-center justify-center gap-1 rounded-xl border border-amber-400/35 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:text-amber-300 px-2 py-1.5 text-[11px] font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Noctis AI</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSelect("powerapps")}
              className="flex items-center justify-center gap-1 rounded-xl border border-indigo-400/25 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 px-2 py-1.5 text-[11px] font-bold cursor-pointer"
            >
              <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Apps</span>
            </button>
          )}
          <Link
            href="/connectin-portal#download-app"
            onClick={() => onCloseMobile?.()}
            className="flex items-center justify-center gap-1 rounded-xl border border-sky-400/35 bg-sky-50 hover:bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:hover:bg-sky-500/25 dark:text-sky-200 px-2 py-1.5 text-[11px] font-bold transition-colors"
          >
            <Download className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Get App</span>
          </Link>
        </div>
        <p className="px-1 text-[10px] font-medium text-zinc-400 dark:text-slate-500 truncate">
          ConnectLn · 360 Universe
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Floating Midnight-Glass Sidebar */}
      <aside
        aria-label="ConnectLn 360 App Rail"
        className="hidden lg:flex fixed left-3 top-[64px] bottom-3 z-40 w-[224px] flex-col justify-between rounded-2xl border border-zinc-200 dark:border-indigo-400/15 bg-white/95 dark:bg-[#101324]/95 shadow-[0_12px_40px_rgba(3,7,18,0.45)] backdrop-blur-xl p-3 select-none"
      >
        {renderNavBody(false)}
      </aside>

      {/* Mobile & Tablet Slide-Over Drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          data-testid="mobile-left-rail-drawer"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={() => onCloseMobile?.()}
          />
          <aside className="relative z-10 flex h-full w-[276px] max-w-[84vw] flex-col justify-between border-r border-zinc-200 dark:border-indigo-400/20 bg-white dark:bg-[#101324] p-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
            {renderNavBody(true)}
          </aside>
        </div>
      )}
    </>
  )
}
