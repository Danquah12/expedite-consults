"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Activity,
  ArrowLeft,
  Briefcase,
  Building2,
  Car,
  ClipboardList,
  Code2,
  Database,
  Download,
  Dumbbell,
  ExternalLink,
  FileSignature,
  Globe,
  Kanban,
  LayoutGrid,
  MailCheck,
  Plane,
  Receipt,
  Rocket,
  Search,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react"
import {
  CONNECTLN_POWER_APPS,
  ConnectLnPowerApp,
  loadPinnedPowerAppIds,
  POWER_APP_CATEGORIES,
  PowerAppCategory,
  PowerAppIconKey,
  savePinnedPowerAppIds,
} from "@/lib/connectln-power-apps"
import { filterAndRankMembers } from "@/lib/connectin-search-match"

const ICON_MAP: Record<PowerAppIconKey, React.ComponentType<{ className?: string }>> = {
  sign: FileSignature,
  invoice: Receipt,
  boards: Kanban,
  forms: ClipboardList,
  fetch: Download,
  services: Wrench,
  studio: Rocket,
  shield: ShieldCheck,
  leadgen: Target,
  mobility: Plane,
  venues: Building2,
  talent: Briefcase,
  cards: MailCheck,
  fitness: Dumbbell,
  markets: TrendingUp,
  openindex: Database,
  motors: Car,
  pulse: Activity,
  social: Globe,
  devhub: Code2,
}

interface ConnectLnPowerAppsHubProps {
  initialAppId?: string | null
  onOpenStudioTab: (tab: "sign" | "invoice" | "boards" | "forms") => void
  onReturnHome: () => void
}

export function ConnectLnPowerAppsHub({
  initialAppId,
  onOpenStudioTab,
  onReturnHome,
}: ConnectLnPowerAppsHubProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<PowerAppCategory>("All")
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [activeExternalApp, setActiveExternalApp] = useState<ConnectLnPowerApp | null>(() =>
    initialAppId
      ? CONNECTLN_POWER_APPS.find((a) => a.id === initialAppId && a.kind === "external") || null
      : null
  )

  useEffect(() => {
    setPinnedIds(loadPinnedPowerAppIds())
    const syncPins = () => setPinnedIds(loadPinnedPowerAppIds())
    window.addEventListener("connectln_pinned_power_apps_change", syncPins)
    return () => window.removeEventListener("connectln_pinned_power_apps_change", syncPins)
  }, [])

  useEffect(() => {
    if (!initialAppId) return
    const target = CONNECTLN_POWER_APPS.find((a) => a.id === initialAppId)
    if (!target) return
    if (target.kind === "studio" && target.studioTab) {
      onOpenStudioTab(target.studioTab)
    } else if (target.kind === "external") {
      setActiveExternalApp(target)
    }
  }, [initialAppId, onOpenStudioTab])

  useEffect(() => {
    const handleOpenEvent = (ev: Event) => {
      const appId = (ev as CustomEvent<{ appId?: string }>)?.detail?.appId
      if (!appId) return
      const target = CONNECTLN_POWER_APPS.find((a) => a.id === appId)
      if (!target) return
      if (target.kind === "studio" && target.studioTab) {
        onOpenStudioTab(target.studioTab)
      } else if (target.kind === "external") {
        setActiveExternalApp(target)
      }
    }
    window.addEventListener("connectln_open_power_app", handleOpenEvent)
    return () => window.removeEventListener("connectln_open_power_app", handleOpenEvent)
  }, [onOpenStudioTab])

  const togglePin = (appId: string) => {
    const next = pinnedIds.includes(appId)
      ? pinnedIds.filter((id) => id !== appId)
      : [appId, ...pinnedIds.filter((id) => id !== appId)]
    setPinnedIds(next)
    savePinnedPowerAppIds(next)
  }

  const handleLaunchApp = (app: ConnectLnPowerApp) => {
    if (app.kind === "studio" && app.studioTab) {
      onOpenStudioTab(app.studioTab)
      return
    }
    setActiveExternalApp(app)
  }

  const pinnedApps = useMemo(
    () =>
      pinnedIds
        .map((id) => CONNECTLN_POWER_APPS.find((a) => a.id === id))
        .filter((a): a is ConnectLnPowerApp => Boolean(a))
        .slice(0, 6),
    [pinnedIds]
  )

  const filteredApps = useMemo(() => {
    const byCat =
      activeCategory === "All"
        ? CONNECTLN_POWER_APPS
        : CONNECTLN_POWER_APPS.filter((a) => a.category === activeCategory)
    return filterAndRankMembers(byCat, searchQuery, (a) => [
      a.name,
      a.category,
      a.tagline,
      ...a.keywords,
    ])
  }, [activeCategory, searchQuery])

  // Embedded Active Power App View (clean single header + full app canvas)
  if (activeExternalApp && activeExternalApp.liveUrl) {
    const ActiveIcon = ICON_MAP[activeExternalApp.iconKey] || LayoutGrid
    const isPinned = pinnedIds.includes(activeExternalApp.id)

    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#EFECE6] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950/60">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setActiveExternalApp(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 hover:bg-slate-50 cursor-pointer shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All {CONNECTLN_POWER_APPS.length} Power Apps</span>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${activeExternalApp.tintClass}`}
              >
                <ActiveIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-[#0B1F3A] dark:text-zinc-100 truncate">
                  {activeExternalApp.name}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {activeExternalApp.tagline}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => togglePin(activeExternalApp.id)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                isPinned
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-50"
              }`}
              title={isPinned ? "Unpin from 9-Dot Launcher" : "Pin to 9-Dot Launcher"}
            >
              <Star className={`h-3.5 w-3.5 ${isPinned ? "fill-amber-500 text-amber-500" : ""}`} />
              <span>{isPinned ? "Pinned" : "Pin"}</span>
            </button>

            <a
              href={activeExternalApp.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] hover:bg-[#163259] text-white px-3 py-1.5 text-xs font-bold transition-colors"
            >
              <span>Open Full Screen</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <iframe
          src={activeExternalApp.liveUrl}
          title={activeExternalApp.name}
          className="w-full h-[calc(100vh-185px)] min-h-[680px] border-0 bg-white"
          allow="clipboard-read; clipboard-write; microphone; camera; geolocation"
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Clean Header + Search + 6 Calm Category Pills */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200/80 text-[#4338CA] flex items-center justify-center shrink-0">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-[#0B1F3A] dark:text-zinc-100">
                  ConnectLn Power Apps
                </h1>
                <span className="rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  {CONNECTLN_POWER_APPS.length} Apps
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Launch any app cleanly from one hub. Pin your daily favorites to the 9-dot menu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${CONNECTLN_POWER_APPS.length} Power Apps (e.g. Fetch, SkillHands, Shield)...`}
                className="w-full rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:bg-white focus:border-[#0A66C2] pl-9 pr-8 py-2 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Clear Power Apps search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onReturnHome}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-zinc-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 cursor-pointer"
            >
              Feed
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {POWER_APP_CATEGORIES.map((cat) => {
            const active = activeCategory === cat
            const count =
              cat === "All"
                ? CONNECTLN_POWER_APPS.length
                : CONNECTLN_POWER_APPS.filter((a) => a.category === cat).length
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer shrink-0 ${
                  active
                    ? "bg-[#0B1F3A] border-[#0B1F3A] text-white"
                    : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Compact Pinned Favorites Row (Only shown when unfiltered to keep canvas calm) */}
      {!searchQuery.trim() && activeCategory === "All" && pinnedApps.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 px-4 py-3 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Pinned Shortcuts
            </span>
            <span className="text-[11px] text-slate-400">
              Also in your top-left 9-dot App Launcher
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pinnedApps.map((app) => {
              const Icon = ICON_MAP[app.iconKey] || LayoutGrid
              return (
                <button
                  key={`pin_${app.id}`}
                  type="button"
                  onClick={() => handleLaunchApp(app)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-800/80 hover:border-[#0A66C2] hover:bg-white px-3 py-1.5 text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 transition-colors cursor-pointer"
                >
                  <span
                    className={`h-6 w-6 rounded-lg border flex items-center justify-center ${app.tintClass}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span>{app.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Clean Minimal 4-Column Grid */}
      {filteredApps.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 p-10 text-center space-y-2">
          <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">
            No Power Apps match &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("")
              setActiveCategory("All")
            }}
            className="rounded-lg bg-[#0A66C2] text-white px-4 py-1.5 text-xs font-bold cursor-pointer"
          >
            Show all {CONNECTLN_POWER_APPS.length} apps
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredApps.map((app) => {
            const Icon = ICON_MAP[app.iconKey] || LayoutGrid
            const isPinned = pinnedIds.includes(app.id)
            return (
              <div
                key={app.id}
                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 hover:border-[#0A66C2]/60 p-4 flex flex-col justify-between gap-3.5 shadow-2xs hover:shadow-md transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${app.tintClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-[#0B1F3A] dark:text-zinc-100 truncate">
                          {app.name}
                        </h3>
                        <p className="text-[10.5px] font-semibold text-slate-400 truncate">
                          {app.category}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePin(app.id)}
                      title={isPinned ? "Unpin app" : "Pin to shortcuts"}
                      className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-400 cursor-pointer shrink-0"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          isPinned ? "fill-amber-500 text-amber-500" : "hover:text-slate-600"
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {app.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleLaunchApp(app)}
                    className="flex-1 rounded-xl bg-[#0B1F3A] hover:bg-[#0A66C2] text-white py-1.5 px-3 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Launch
                  </button>
                  {app.kind === "external" && app.liveUrl && (
                    <a
                      href={app.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Open ${app.name} in new tab`}
                      className="h-8 w-8 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-800 shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
