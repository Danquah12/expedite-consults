"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Film,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle2,
  Play,
  PlusCircle,
  Radio,
  Briefcase,
  ShoppingBag,
  Tv,
  House,
  Zap,
  Clock,
  Layers,
  Search,
  Send,
  Pause,
  TrendingUp,
  ExternalLink,
  Check,
} from "lucide-react"
import {
  HarvestedMediaItem,
  HarvesterDestination,
  HarvesterTelemetrySnapshot,
  loadStoredHarvestedItems,
  saveStoredHarvestedItems,
  computeHarvesterTelemetry,
  HARVESTER_EVENT_NAME,
} from "@/lib/connectin-media-harvester"

interface AdminMediaHarvesterTabProps {
  onShowNotice?: (msg: string) => void
  onNavigateTab?: (tab: string) => void
}

const DESTINATION_META: {
  id: HarvesterDestination
  label: string
  navTab: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    id: "home",
    label: "Home Feed",
    navTab: "home",
    desc: "Main member feed & live video stream",
    icon: House,
  },
  {
    id: "jobs",
    label: "Jobs Board",
    navTab: "jobs",
    desc: "Video job briefings & site previews",
    icon: Briefcase,
  },
  {
    id: "market",
    label: "Marketplace",
    navTab: "marketplace",
    desc: "Product demo videos & solution visuals",
    icon: ShoppingBag,
  },
  {
    id: "media",
    label: "Media Studio",
    navTab: "media",
    desc: "ConnectLn video stage & clips library",
    icon: Tv,
  },
  {
    id: "pulse",
    label: "Pulse Wire",
    navTab: "pulserooms",
    desc: "Breaking video & photo intelligence",
    icon: Radio,
  },
]

const QUICK_PRESET_VIDEOS = [
  { label: "Cilium Kubernetes CNI & eBPF Defense (YouTube)", url: "https://www.youtube.com/watch?v=aLq3O3l2LF4", kind: "video" as const },
  { label: "Boston Dynamics Spot Construction LiDAR (YouTube)", url: "https://www.youtube.com/watch?v=wND9goxDVrY", kind: "video" as const },
  { label: "HV Substation Tan Delta Transformer Test (YouTube)", url: "https://www.youtube.com/watch?v=78U-D263bKE", kind: "video" as const },
  { label: "Da Vinci Robotic Surgical System (YouTube)", url: "https://www.youtube.com/watch?v=tu_Cg6L1f7s", kind: "video" as const },
  { label: "Solar Microgrid & LFP Battery Storage (YouTube)", url: "https://www.youtube.com/watch?v=hfH5RYeAYfw", kind: "video" as const },
  { label: "Enterprise SOC SIEM & Threat Hunting (YouTube)", url: "https://www.youtube.com/watch?v=AVoqcPa-wVw", kind: "video" as const },
  { label: "Commercial HVAC BACnet Controls (YouTube)", url: "https://www.youtube.com/watch?v=RqPTRQksFlw", kind: "video" as const },
  { label: "JPL Spacecraft Avionics Telemetry (YouTube)", url: "https://www.youtube.com/watch?v=ZbYGVzktneY", kind: "video" as const },
]

export function AdminMediaHarvesterTab({
  onShowNotice,
  onNavigateTab,
}: AdminMediaHarvesterTabProps) {
  const [items, setItems] = useState<HarvestedMediaItem[]>(() => loadStoredHarvestedItems())
  const [telemetry, setTelemetry] = useState<HarvesterTelemetrySnapshot>(() =>
    computeHarvesterTelemetry(loadStoredHarvestedItems())
  )
  const [isAutoPullEnabled, setIsAutoPullEnabled] = useState<boolean>(true)
  const [secondsToNextPull, setSecondsToNextPull] = useState<number>(3600)
  const [isPulling, setIsPulling] = useState<boolean>(false)
  const [kindFilter, setKindFilter] = useState<"all" | "video" | "picture">("all")
  const [destFilter, setDestFilter] = useState<"all" | HarvesterDestination>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null)

  // Custom Push Form State
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false)
  const [customKind, setCustomKind] = useState<"video" | "picture">("video")
  const [customTitle, setCustomTitle] = useState<string>("")
  const [customSummary, setCustomSummary] = useState<string>("")
  const [customMediaUrl, setCustomMediaUrl] = useState<string>("https://www.youtube.com/watch?v=aLq3O3l2LF4")
  const [customCategory, setCustomCategory] = useState<string>("Cybersecurity & Agentic AI")
  const [customDestinations, setCustomDestinations] = useState<HarvesterDestination[]>([
    "home",
    "jobs",
    "market",
    "media",
    "pulse",
  ])

  const mergeAndPersistItems = useCallback((serverItems: HarvestedMediaItem[]) => {
    const local = loadStoredHarvestedItems()
    const map = new Map<string, HarvestedMediaItem>()
    ;[...serverItems, ...local].forEach((item) => {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, item)
      }
    })
    const combined = Array.from(map.values()).slice(0, 60)
    saveStoredHarvestedItems(combined)
    setItems(combined)
    setTelemetry(computeHarvesterTelemetry(combined))
    return combined
  }, [])

  const triggerBackendPull = useCallback(
    async (count: number = 2, manualTrigger: boolean = false) => {
      setIsPulling(true)
      try {
        const res = await fetch("/api/connectin/media-harvester", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "pull_now",
            count,
            destinations: ["home", "jobs", "market", "media", "pulse"],
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const nextItems: HarvestedMediaItem[] = Array.isArray(data?.telemetry?.items)
            ? data.telemetry.items
            : []
          const combined = mergeAndPersistItems(nextItems)
          setSecondsToNextPull(3600)
          if (manualTrigger && onShowNotice) {
            onShowNotice(
              `⚡ Pulled ${count} new ConnectLn video(s) & picture(s) and pushed live to Home, Jobs, Market, Media & Pulse! (Total active batch: ${combined.length})`
            )
          }
        }
      } catch {
        // Fallback offline local pull
        const current = loadStoredHarvestedItems()
        setTelemetry(computeHarvesterTelemetry(current))
      } finally {
        setIsPulling(false)
      }
    },
    [mergeAndPersistItems, onShowNotice]
  )

  // Initial load + listen for global 60-minute harvester events
  useEffect(() => {
    fetch("/api/connectin/media-harvester", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.items)) {
          mergeAndPersistItems(data.items)
        }
      })
      .catch(() => {})

    const handleGlobalHarvest = () => {
      const updated = loadStoredHarvestedItems()
      setItems(updated)
      setTelemetry(computeHarvesterTelemetry(updated))
    }
    window.addEventListener(HARVESTER_EVENT_NAME, handleGlobalHarvest)
    return () => window.removeEventListener(HARVESTER_EVENT_NAME, handleGlobalHarvest)
  }, [mergeAndPersistItems])

  // 60-Minute (3,600-Second) Auto-Pull Countdown Timer
  useEffect(() => {
    if (!isAutoPullEnabled) return
    const timer = setInterval(() => {
      setSecondsToNextPull((prev) => {
        if (prev <= 1) {
          triggerBackendPull(2, false)
          return 3600
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isAutoPullEnabled, triggerBackendPull])

  const handleToggleDestinationOnItem = async (
    item: HarvestedMediaItem,
    dest: HarvesterDestination
  ) => {
    const exists = item.destinations.includes(dest)
    const nextDests: HarvesterDestination[] = exists
      ? item.destinations.filter((d) => d !== dest)
      : [...item.destinations, dest]

    if (nextDests.length === 0) return

    const updatedList = items.map((i) =>
      i.id === item.id ? { ...i, destinations: nextDests } : i
    )
    saveStoredHarvestedItems(updatedList)
    setItems(updatedList)
    setTelemetry(computeHarvesterTelemetry(updatedList))

    try {
      await fetch("/api/connectin/media-harvester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_destinations",
          itemId: item.id,
          destinations: nextDests,
        }),
      })
    } catch {
      // ignore network error
    }

    if (onShowNotice) {
      onShowNotice(
        `✓ Updated push targets for "${item.title.slice(0, 42)}..." → [${nextDests
          .map((d) => d.toUpperCase())
          .join(", ")}]`
      )
    }
  }

  const handleCustomPushSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customTitle.trim()) return
    setIsPulling(true)
    try {
      const res = await fetch("/api/connectin/media-harvester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "push_custom",
          kind: customKind,
          title: customTitle.trim(),
          summary:
            customSummary.trim() ||
            "Verified ConnectLn video & visual briefing pushed directly from the Administrative Media Backend.",
          mediaUrl: customMediaUrl.trim(),
          category: customCategory.trim(),
          destinations: customDestinations,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data?.telemetry?.items)) {
          mergeAndPersistItems(data.telemetry.items)
        }
        setCustomTitle("")
        setCustomSummary("")
        setShowCustomForm(false)
        if (onShowNotice) {
          onShowNotice(
            `🚀 Pushed custom ${customKind.toUpperCase()} "${customTitle.trim()}" live to ${customDestinations
              .map((d) => d.toUpperCase())
              .join(", ")}!`
          )
        }
      }
    } finally {
      setIsPulling(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchKind = kindFilter === "all" || item.kind === kindFilter
    const matchDest = destFilter === "all" || item.destinations.includes(destFilter)
    const matchQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchKind && matchDest && matchQuery
  })

  return (
    <div className="space-y-5">
      {/* 1. MASTER 60-MINUTE AUTO-PULL BACKEND HEADER */}
      <div className="rounded-2xl border-2 border-[#C8B99E] dark:border-zinc-700 bg-[#FAF6EE] dark:bg-zinc-900 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3A2818] px-3 py-1 text-xs font-bold text-[#FAF6EE]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                ⚡ 60-MINUTE VIDEO &amp; PICTURE HARVESTER BACKEND
              </span>
              <span className="rounded-full bg-[#EFE7D6] dark:bg-zinc-800 border border-[#D5C8B0] dark:border-zinc-700 px-3 py-1 text-xs font-mono font-bold text-[#3A2818] dark:text-zinc-200">
                {isAutoPullEnabled
                  ? `Next Auto-Sync in ${Math.floor(secondsToNextPull / 60)}m ${String(secondsToNextPull % 60).padStart(2, "0")}s (Every 60 Mins)`
                  : "Auto-Sync Paused"}
              </span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/70 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                +{telemetry.dailyGrowthRate.toLocaleString()} New Videos &amp; Pictures / Day
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
              ConnectLn Automated Video &amp; Visual Syndication Engine (60-Minute Cadence)
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Automatically pulls brand-new ConnectLn-relevant professional videos and high-resolution pictures every{" "}
              <strong>60 minutes (1 hour)</strong> and pushes them simultaneously to{" "}
              <strong>Home</strong>, <strong>Jobs</strong>, <strong>Market</strong>, <strong>Media</strong>, and{" "}
              <strong>Pulse</strong>—excluding any old videos already on Home, Jobs, Alerts, Learn, or Media.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => triggerBackendPull(2, true)}
              disabled={isPulling}
              className="rounded-xl bg-[#6B4423] hover:bg-[#523319] px-4 py-2.5 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPulling ? "animate-spin" : ""}`} />
              <span>{isPulling ? "Pulling & Pushing..." : "⚡ Pull & Push Now (+2)"}</span>
            </button>

            <button
              type="button"
              onClick={() => triggerBackendPull(5, true)}
              disabled={isPulling}
              className="rounded-xl bg-[#3A2818] hover:bg-zinc-800 px-3.5 py-2.5 text-xs font-bold text-[#FAF6EE] flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span>Bulk Pull (+5)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomForm((prev) => !prev)}
              className="rounded-xl border border-[#C8B99E] dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-[#EFE7D6] px-3.5 py-2.5 text-xs font-bold text-[#3A2818] dark:text-zinc-100 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5 text-[#6B4423]" />
              <span>{showCustomForm ? "Close Custom Push" : "Push Custom Video / Picture"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAutoPullEnabled((prev) => !prev)}
              className={`rounded-xl px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border cursor-pointer ${
                isAutoPullEnabled
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300"
                  : "bg-amber-50 border-amber-300 text-amber-800"
              }`}
            >
              {isAutoPullEnabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isAutoPullEnabled ? "60-Min Timer: ON" : "Resume 60-Min Timer"}</span>
            </button>
          </div>
        </div>

        {/* 2. DAILY & ALL-TIME VIDEO GROWTH METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#DFD4C0] dark:border-zinc-800">
          <div className="rounded-xl bg-white dark:bg-zinc-950 border border-[#DFD4C0] dark:border-zinc-800 p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
              <span>TOTAL VIDEOS ON PLATFORM</span>
              <Film className="h-3.5 w-3.5 text-[#6B4423]" />
            </div>
            <p className="text-xl font-black text-zinc-950 dark:text-white mt-1 font-mono">
              {telemetry.totalVideosAllTime.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
              ↑ Synced every 60 minutes (new only)
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-zinc-950 border border-[#DFD4C0] dark:border-zinc-800 p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
              <span>TOTAL PICTURES ON PLATFORM</span>
              <ImageIcon className="h-3.5 w-3.5 text-[#6B4423]" />
            </div>
            <p className="text-xl font-black text-zinc-950 dark:text-white mt-1 font-mono">
              {telemetry.totalPicturesAllTime.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
              ↑ Synchronized across 5 tabs
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-zinc-950 border border-[#DFD4C0] dark:border-zinc-800 p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
              <span>PULLED TODAY (60-MIN SLOTS)</span>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-zinc-950 dark:text-white mt-1 font-mono">
              +{telemetry.pulledTodayCount.toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Hourly Slot #{telemetry.currentMinuteSlot.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-zinc-950 border border-[#DFD4C0] dark:border-zinc-800 p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
              <span>NEXT 60-MIN SYNC COUNTDOWN</span>
              <Clock className="h-3.5 w-3.5 text-[#6B4423]" />
            </div>
            <p className="text-xl font-black text-[#6B4423] dark:text-amber-300 mt-1 font-mono">
              {String(Math.floor(secondsToNextPull / 60)).padStart(2, "0")}:{String(secondsToNextPull % 60).padStart(2, "0")}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
              Last: {telemetry.lastPulledAtLabel}
            </p>
          </div>
        </div>
      </div>

      {/* 3. CUSTOM PUSH FORM (OPTIONAL EXPANDABLE PANEL) */}
      {showCustomForm && (
        <form
          onSubmit={handleCustomPushSubmit}
          className="rounded-2xl border-2 border-[#6B4423] bg-white dark:bg-zinc-900 p-5 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Push Custom ConnectLn Video or Picture to Platform Tabs
              </h3>
              <p className="text-xs text-zinc-500">
                Select a video (MP4 or YouTube URL) or picture and push it immediately to Home, Jobs, Market, Media, and Pulse.
              </p>
            </div>
            <span className="rounded-full bg-[#FAF6EE] border border-[#C8B99E] px-3 py-1 text-[11px] font-bold text-[#3A2818]">
              Instant Multi-Tab Syndication
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Media Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomKind("video")}
                  className={`rounded-xl py-2 px-3 font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                    customKind === "video"
                      ? "bg-[#3A2818] text-white border-[#3A2818]"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200"
                  }`}
                >
                  <Film className="h-3.5 w-3.5" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomKind("picture")}
                  className={`rounded-xl py-2 px-3 font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                    customKind === "picture"
                      ? "bg-[#3A2818] text-white border-[#3A2818]"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Picture</span>
                </button>
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Title (Shown on Home, Jobs, Market, Media &amp; Pulse)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Zero-Trust eBPF Kernel Telemetry & Field Robotics Walkthrough"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Video URL (.mp4 / YouTube ID) or Picture URL
              </label>
              <input
                type="text"
                required
                value={customMediaUrl}
                onChange={(e) => setCustomMediaUrl(e.target.value)}
                placeholder="/status-videos/k8s_ebpf.mp4 or YouTube URL"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {QUICK_PRESET_VIDEOS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setCustomKind(preset.kind)
                      setCustomMediaUrl(preset.url)
                      if (!customTitle) setCustomTitle(preset.label.replace(" (MP4)", ""))
                    }}
                    className="rounded-lg bg-[#FAF6EE] hover:bg-[#EFE7D6] border border-[#D5C8B0] px-2 py-0.5 text-[10px] font-semibold text-[#3A2818] cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">ConnectLn Domain / Category</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white"
              />
            </div>

            <div className="space-y-1 md:col-span-3">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Summary / Briefing Description</label>
              <input
                type="text"
                value={customSummary}
                onChange={(e) => setCustomSummary(e.target.value)}
                placeholder="Brief description for members across Home, Jobs, Market, Media & Pulse..."
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-zinc-600 mr-1">Push To Tabs:</span>
              {DESTINATION_META.map((dest) => {
                const selected = customDestinations.includes(dest.id)
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => {
                      setCustomDestinations((prev) =>
                        prev.includes(dest.id)
                          ? prev.length > 1
                            ? prev.filter((d) => d !== dest.id)
                            : prev
                          : [...prev, dest.id]
                      )
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 border cursor-pointer ${
                      selected
                        ? "bg-[#3A2818] text-white border-[#3A2818]"
                        : "bg-zinc-100 text-zinc-600 border-zinc-200"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" />}
                    <span>{dest.label}</span>
                  </button>
                )
              })}
            </div>

            <button
              type="submit"
              disabled={isPulling}
              className="rounded-xl bg-[#6B4423] hover:bg-[#523319] px-5 py-2.5 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Push Live to Selected Tabs →</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. FIVE TARGET PLATFORM DESTINATION CARDS (HOME, JOBS, MARKET, MEDIA, PULSE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {DESTINATION_META.map((dest) => {
          const Icon = dest.icon
          const count = telemetry.destinationCounts[dest.id] || items.length
          const isFiltered = destFilter === dest.id
          return (
            <div
              key={dest.id}
              className={`rounded-2xl border p-4 transition-all flex flex-col justify-between gap-3 ${
                isFiltered
                  ? "border-[#6B4423] bg-[#FAF6EE] dark:bg-zinc-800 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                    <Icon className="h-4 w-4 text-[#6B4423]" />
                    <span>{dest.label}</span>
                  </span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    LIVE PUSH
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{dest.desc}</p>
              </div>

              <div className="flex items-end justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-lg font-black font-mono text-zinc-950 dark:text-white">
                    {count} <span className="text-[10px] font-normal text-zinc-500">active batch</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    +{(telemetry.minutesElapsedToday + count).toLocaleString()} pushed today
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDestFilter(isFiltered ? "all" : dest.id)}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                  >
                    {isFiltered ? "All" : "Filter"}
                  </button>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab(dest.navTab)}
                      className="rounded-lg bg-[#3A2818] hover:bg-[#523319] px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 5. UPSTREAM PIPELINE CONNECTORS */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#6B4423]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Active 1-Minute Upstream Video &amp; Picture Connectors
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
            ● All 4 Media Pipelines Polling at 60-Second Cadence
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {telemetry.connectors.map((conn) => (
            <div
              key={conn.id}
              className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-[#FAF6EE]/60 dark:bg-zinc-950 p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {conn.name}
                </span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                  {conn.cadence}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate">{conn.category}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                <span>{conn.protocol}</span>
                <span className="font-bold text-[#6B4423] dark:text-amber-300">
                  {conn.itemsPulledToday.toLocaleString()} today
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. LIVE PULLED VIDEOS & PICTURES LEDGER WITH INLINE PLAYER & DESTINATION CONTROLS */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">
              Live Harvested Videos &amp; Pictures Stream ({filteredItems.length} Shown)
            </h3>
            <p className="text-xs text-zinc-500">
              Every item below is automatically pushed to Home, Jobs, Market, Media, and Pulse. Click any destination badge to toggle routing.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pulled videos/pictures..."
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>

            {(["all", "video", "picture"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKindFilter(k)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize cursor-pointer ${
                  kindFilter === k
                    ? "bg-[#3A2818] text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {k === "all" ? `All (${items.length})` : `${k}s (${items.filter((i) => i.kind === k).length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.slice(0, 16).map((item) => {
            const isPlayingThis = activePreviewId === item.id
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#DFD4C0] dark:border-zinc-800 bg-[#FAF6EE]/40 dark:bg-zinc-950 overflow-hidden flex flex-col justify-between shadow-2xs"
              >
                <div>
                  {/* Media Stage */}
                  <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                    {item.kind === "video" && isPlayingThis ? (
                      item.videoUrl ? (
                        <video
                          src={item.videoUrl}
                          controls
                          autoPlay
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : item.youtubeId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
                          title={item.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full border-0"
                        />
                      ) : null
                    ) : (
                      <>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        {item.kind === "video" && (
                          <button
                            type="button"
                            onClick={() => setActivePreviewId(item.id)}
                            className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                          >
                            <div className="h-12 w-12 rounded-full bg-[#6B4423]/95 group-hover:bg-[#3A2818] text-white flex items-center justify-center shadow-xl ring-2 ring-white/70 transition-transform group-hover:scale-105">
                              <Play className="h-5 w-5 fill-current ml-0.5" />
                            </div>
                          </button>
                        )}
                      </>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap pointer-events-none">
                      <span className="rounded-full bg-[#3A2818]/90 px-2.5 py-0.5 text-[10px] font-bold text-[#FAF6EE] border border-white/15">
                        {item.kind === "video" ? `🎬 VIDEO ${item.duration || "03:20"}` : "🖼️ HIGH-RES PICTURE"}
                      </span>
                      <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                        {item.serialNumber}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white/90 pointer-events-none">
                      <span className="font-semibold truncate">{item.sourceFeed}</span>
                      <span className="font-mono bg-black/60 px-2 py-0.5 rounded">
                        {item.pulledAtLabel}
                      </span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B4423] dark:text-amber-400">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {item.authorName} · {item.organization}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-950 dark:text-white leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>

                {/* Destination Routing Controls */}
                <div className="px-4 py-3 bg-[#EFE7D6]/60 dark:bg-zinc-900 border-t border-[#DFD4C0] dark:border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Pushed To Destinations (Click to Toggle):
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Synced Live
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {DESTINATION_META.map((dest) => {
                      const active = item.destinations.includes(dest.id)
                      return (
                        <button
                          key={dest.id}
                          type="button"
                          onClick={() => handleToggleDestinationOnItem(item, dest.id)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                            active
                              ? "bg-[#3A2818] text-[#FAF6EE] border-[#3A2818]"
                              : "bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          {active && <Check className="h-2.5 w-2.5 text-emerald-400" />}
                          <span>{dest.label.replace(" Feed", "").replace(" Board", "").replace(" Studio", "").replace(" Wire", "")}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
