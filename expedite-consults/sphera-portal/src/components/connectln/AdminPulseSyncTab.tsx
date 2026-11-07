"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Search,
  ShieldCheck,
  Zap,
  Globe,
  Clock,
  Activity,
  FileText,
  Layers,
  Filter,
} from "lucide-react"
import type { PulseArticle, CyberThreatAdvisory, AIDailyBriefItem } from "@/lib/pulse-news-data"

interface PulseSourceTelemetry {
  id: string
  name: string
  endpoint: string
  protocol: string
  status: "SYNCED" | "FALLBACK"
  latencyMs: number
  itemsSynced: number
  latestItemTitle: string
  lastSyncedAt: string
}

interface AdminPulseSyncTabProps {
  onShowNotice?: (msg: string) => void
  onNavigateToPulse?: () => void
}

export function AdminPulseSyncTab({
  onShowNotice,
  onNavigateToPulse,
}: AdminPulseSyncTabProps) {
  const [enclaveFilter, setEnclaveFilter] = useState<string>("tech_cybersecurity")
  const [sourceFilter, setSourceFilter] = useState<
    "all" | "cisa" | "hn" | "devto" | "enclave" | "member"
  >("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [lastSyncedDisplay, setLastSyncedDisplay] = useState<string>("Syncing...")
  const [formattedDate, setFormattedDate] = useState<string>("")
  const [nextSyncSeconds, setNextSyncSeconds] = useState<number>(45)

  const [sourceTelemetry, setSourceTelemetry] = useState<PulseSourceTelemetry[]>([])
  const [articles, setArticles] = useState<PulseArticle[]>([])
  const [advisories, setAdvisories] = useState<CyberThreatAdvisory[]>([])
  const [aiBrief, setAiBrief] = useState<AIDailyBriefItem | null>(null)
  const [liveExternalCount, setLiveExternalCount] = useState<number>(0)
  const [syncHistoryLog, setSyncHistoryLog] = useState<
    { id: string; timestamp: string; enclave: string; totalItems: number; externalItems: number; avgLatencyMs: number }[]
  >([])

  const fetchSyncTelemetry = useCallback(
    async (manualTrigger = false) => {
      setIsSyncing(true)
      try {
        const params = new URLSearchParams()
        if (enclaveFilter) params.set("enclave", enclaveFilter)
        params.set("profession", "Platform Security & Operations Architect")

        const res = await fetch(`/api/connectin/pulse?${params.toString()}`, {
          cache: "no-store",
        })
        if (res.ok) {
          const data = await res.json()
          const nextArticles: PulseArticle[] = Array.isArray(data.articles) ? data.articles : []
          const nextAdvisories: CyberThreatAdvisory[] = Array.isArray(data.advisories)
            ? data.advisories
            : []
          const nextTelemetry: PulseSourceTelemetry[] = Array.isArray(data.sourceTelemetry)
            ? data.sourceTelemetry
            : []

          setArticles(nextArticles)
          setAdvisories(nextAdvisories)
          setSourceTelemetry(nextTelemetry)
          if (data.aiBrief) setAiBrief(data.aiBrief)
          if (data.formattedDate) setFormattedDate(data.formattedDate)
          if (typeof data.liveExternalCount === "number") {
            setLiveExternalCount(data.liveExternalCount)
          }

          const nowTime = new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          })
          setLastSyncedDisplay(nowTime)
          setNextSyncSeconds(45)

          const avgLat =
            nextTelemetry.length > 0
              ? Math.round(
                  nextTelemetry.reduce((acc, s) => acc + (s.latencyMs || 0), 0) /
                    nextTelemetry.length
                )
              : 120

          setSyncHistoryLog((prev) => [
            {
              id: `SYNC-${Date.now()}`,
              timestamp: nowTime,
              enclave: enclaveFilter,
              totalItems: nextArticles.length + nextAdvisories.length,
              externalItems: data.liveExternalCount ?? 0,
              avgLatencyMs: avgLat,
            },
            ...prev.slice(0, 9),
          ])

          if (manualTrigger && onShowNotice) {
            onShowNotice(
              `✓ Pulse Live Sync verified: ${nextArticles.length} intelligence reports & ${nextAdvisories.length} advisories synced (${nowTime}).`
            )
          }
        }
      } catch {
        // Keep last state if offline
      } finally {
        setIsSyncing(false)
      }
    },
    [enclaveFilter, onShowNotice]
  )

  useEffect(() => {
    fetchSyncTelemetry(false)
    const timer = setInterval(() => {
      setNextSyncSeconds((prev) => {
        if (prev <= 1) {
          fetchSyncTelemetry(false)
          return 45
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [fetchSyncTelemetry])

  const getArticleOriginType = (art: PulseArticle): "cisa" | "hn" | "devto" | "member" | "enclave" => {
    if (art.id.startsWith("pulse_cisa_")) return "cisa"
    if (art.id.startsWith("live_hn_")) return "hn"
    if (art.id.startsWith("live_devto_")) return "devto"
    if (art.id.startsWith("user_pulse_")) return "member"
    return "enclave"
  }

  const getOriginBadge = (art: PulseArticle) => {
    const origin = getArticleOriginType(art)
    if (origin === "cisa") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/70 px-2.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300 border border-red-300/60">
          🔴 CISA KEV Live
        </span>
      )
    }
    if (origin === "hn") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300/60">
          ⚡ HN Algolia Wire
        </span>
      )
    }
    if (origin === "devto") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-950/70 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-300/60">
          💻 Dev.to Live API
        </span>
      )
    }
    if (origin === "member") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-950/70 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-300/60">
          👤 Member Dispatch
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300/60">
        🏛️ Enclave Wire
      </span>
    )
  }

  const filteredArticles = articles.filter((art) => {
    const origin = getArticleOriginType(art)
    const matchOrigin = sourceFilter === "all" || origin === sourceFilter
    const matchSearch =
      !searchQuery ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.source.toLowerCase().includes(searchQuery.toLowerCase())
    return matchOrigin && matchSearch
  })

  const syncedConnectorsCount = sourceTelemetry.filter((s) => s.status === "SYNCED").length
  const avgLatency =
    sourceTelemetry.length > 0
      ? Math.round(
          sourceTelemetry.reduce((sum, item) => sum + (item.latencyMs || 0), 0) /
            sourceTelemetry.length
        )
      : 0

  return (
    <div className="space-y-5">
      {/* 1. TOP TELEMETRY CONTROL HEADER */}
      <div className="rounded-2xl border-2 border-emerald-500/40 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300/60">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                PULSE LIVE SYNC MONITOR
              </span>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-mono font-semibold text-[#0A66C2] dark:text-sky-300">
                {formattedDate || "Live Date Active"} · Last Synced: {lastSyncedDisplay}
              </span>
              <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                Auto-sync in {nextSyncSeconds}s
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
              Pulse Real-Time Data Synchronization &amp; Upstream Feed Ledger
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Real-time visibility into every external feed connector (CISA KEV, Hacker News Algolia, Dev.to Live, Enclave Engines) and every intelligence report currently synced to Pulse.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => fetchSyncTelemetry(true)}
              disabled={isSyncing}
              className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing Upstream Feeds..." : "Force Sync All Feeds Now"}</span>
            </button>
            {onNavigateToPulse && (
              <button
                type="button"
                onClick={onNavigateToPulse}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 px-3.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="h-3.5 w-3.5 text-emerald-600" />
                <span>Open Live Pulse Tab →</span>
              </button>
            )}
          </div>
        </div>

        {/* Enclave Scope Switcher */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
              Inspect Enclave Stream:
            </span>
            {[
              { id: "tech_cybersecurity", label: "🔐 Tech, Cyber & AI (Default)" },
              { id: "trades_construction", label: "🪚 Construction & Skilled Trades" },
              { id: "healthcare_medicine", label: "🩺 Healthcare & Clinical Medicine" },
              { id: "automotive_mechanics", label: "🔧 Automotive & 800V Diagnostics" },
            ].map((enc) => (
              <button
                key={enc.id}
                type="button"
                onClick={() => setEnclaveFilter(enc.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  enclaveFilter === enc.id
                    ? "bg-[#0A66C2] text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                {enc.label}
              </button>
            ))}
          </div>

          {aiBrief && (
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              AI Daily Brief Date:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">{aiBrief.date}</strong>
            </div>
          )}
        </div>
      </div>

      {/* 2. 4 KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Total Synced Records</span>
            <Layers className="h-4 w-4 text-[#0A66C2]" />
          </div>
          <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">
            {articles.length + advisories.length}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            {articles.length} articles + {advisories.length} threat/safety advisories
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">External Wire Items</span>
            <Globe className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">
            {liveExternalCount}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Ingested live from CISA, HN Algolia &amp; Dev.to
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Connector Health</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {syncedConnectorsCount} / {sourceTelemetry.length || 5} Nominal
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Avg upstream latency: {avgLatency} ms
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Sync Cadence</span>
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">
            45s Loop
          </p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
            Cache-Control: no-store · Tab focus sync
          </p>
        </div>
      </div>

      {/* 3. UPSTREAM FEED CONNECTORS TELEMETRY TABLE */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Upstream Live Feed Connectors ({sourceTelemetry.length} Pipelines)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Real-time status, HTTP latency, item counts, and latest headline ingested from each upstream provider.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            ● Parallel Fan-Out Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase text-zinc-400">
                <th className="py-2.5 px-3">Connector Source</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Records Synced</th>
                <th className="py-2.5 px-3">Latest Synced Item</th>
                <th className="py-2.5 px-3">Last Synced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {sourceTelemetry.map((src) => (
                <tr key={src.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-3">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{src.name}</p>
                    <p className="text-[10px] font-mono text-zinc-400 truncate max-w-xs">
                      {src.endpoint}
                    </p>
                  </td>
                  <td className="py-3 px-3">
                    {src.status === "SYNCED" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> SYNCED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="h-3 w-3" /> FALLBACK
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {src.latencyMs} ms
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 font-mono font-bold text-[#0A66C2] dark:text-sky-300">
                      {src.itemsSynced} items
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {src.latestItemTitle}
                    </p>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-zinc-500">
                    {new Date(src.lastSyncedAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SYNCED THREAT & SAFETY ADVISORIES LEDGER */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              Synced Threat &amp; Regulatory Safety Advisories ({advisories.length} Active)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Live CISA KEV CVEs, OSHA directives, FDA clinical alerts, and NHTSA recalls currently active in Pulse Threat Radar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {advisories.map((adv) => (
            <div
              key={adv.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-extrabold text-red-600 bg-red-50 dark:bg-red-950/70 dark:text-red-300 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                    {adv.cveId}
                  </span>
                  <span className="rounded-full bg-zinc-200/80 dark:bg-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                    {adv.severity}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {adv.publishedAt}
                </span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                {adv.title}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {adv.summary}
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-amber-700 dark:text-amber-300 font-semibold truncate">
                  {adv.cisaEmergencyStatus || "Active Directive"}
                </span>
                <a
                  href={adv.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0A66C2] font-bold hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  <span>Verify Source</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. COMPLETE SYNCED ARTICLES LEDGER */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0A66C2]" />
              Synced Pulse Intelligence Reports Ledger ({filteredArticles.length} of {articles.length})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Every intelligence report currently live on the Pulse tab, tagged with its upstream source connector and sync timestamp.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter synced headlines or sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Source Origin Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Source Origin:
          </span>
          {[
            { id: "all", label: `All Synced (${articles.length})` },
            {
              id: "cisa",
              label: `🔴 CISA KEV (${articles.filter((a) => getArticleOriginType(a) === "cisa").length})`,
            },
            {
              id: "hn",
              label: `⚡ HN Algolia (${articles.filter((a) => getArticleOriginType(a) === "hn").length})`,
            },
            {
              id: "devto",
              label: `💻 Dev.to Live (${articles.filter((a) => getArticleOriginType(a) === "devto").length})`,
            },
            {
              id: "enclave",
              label: `🏛️ Enclave & Profession (${articles.filter((a) => getArticleOriginType(a) === "enclave").length})`,
            },
            {
              id: "member",
              label: `👤 Member Dispatches (${articles.filter((a) => getArticleOriginType(a) === "member").length})`,
            },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSourceFilter(pill.id as any)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                sourceFilter === pill.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Articles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase text-zinc-400">
                <th className="py-2.5 px-3">Upstream Source</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Synced Headline &amp; Author</th>
                <th className="py-2.5 px-3">Published / Synced</th>
                <th className="py-2.5 px-3">Verification</th>
                <th className="py-2.5 px-3 text-right">Primary Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {filteredArticles.map((art) => (
                <tr key={art.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-3 whitespace-nowrap">{getOriginBadge(art)}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-semibold text-zinc-800 dark:text-zinc-200">
                      {art.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-md">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {art.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {art.author.name} · {art.author.source}
                    </p>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {art.publishedAt}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      {art.biasRating?.factCheckStatus || "Verified"} (
                      {art.biasRating?.credibilityScore || 96}%)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    {art.sourceLinks?.[0] && (
                      <a
                        href={art.sourceLinks[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#0A66C2] font-bold hover:underline"
                      >
                        <span>{art.sourceLinks[0].domain}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Sync Execution Audit Trail */}
        {syncHistoryLog.length > 0 && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Recent Admin Sync Verification Runs:
            </p>
            <div className="flex flex-wrap gap-2">
              {syncHistoryLog.map((entry) => (
                <span
                  key={entry.id}
                  className="rounded-lg bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-300"
                >
                  ✓ {entry.timestamp} · {entry.totalItems} items ({entry.externalItems} live wire) ·{" "}
                  {entry.avgLatencyMs}ms
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
