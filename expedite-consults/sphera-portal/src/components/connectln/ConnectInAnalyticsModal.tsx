"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Eye,
  TrendingUp,
  Search,
  Users,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  UserPlus,
  Check,
  Sparkles,
  Filter,
  BarChart3,
  Layers,
  Zap,
  Globe,
  Share2,
  Award,
  ChevronRight,
  X
} from "lucide-react"
import { UserProfile } from "@/lib/connectln-data"
import {
  ProfileViewerItem,
  ContentReachData,
  DirectoryDiscoveryData,
  saveStoredProfileViewers,
  recordProfileView,
  getProfileTailoredAnalytics,
  syncLiveUserTelemetryFromCloud,
  formatProfileViewDateTime
} from "@/lib/connectin-analytics"

interface ConnectInAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'viewers' | 'reach' | 'discoveries'
  currentUser: UserProfile
  onNavigateMessaging?: (personName?: string) => void
  onNavigateTab?: (tab: string) => void
}

export function ConnectInAnalyticsModal({
  isOpen,
  onClose,
  initialTab = 'viewers',
  currentUser,
  onNavigateMessaging,
  onNavigateTab
}: ConnectInAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState<'viewers' | 'reach' | 'discoveries'>(initialTab)
  const [telemetryTick, setTelemetryTick] = useState(0)
  const tailored = React.useMemo(() => getProfileTailoredAnalytics(currentUser), [
    currentUser.id,
    currentUser.name,
    currentUser.headline,
    currentUser.profession,
    currentUser.professionEnclave,
    currentUser.skills,
    currentUser.profileViews,
    currentUser.postImpressions,
    currentUser.searchAppearances,
    telemetryTick
  ])
  const [viewers, setViewers] = useState<ProfileViewerItem[]>(() => getProfileTailoredAnalytics(currentUser).viewers)
  const reachData: ContentReachData = tailored.reachData
  const discoveryData: DirectoryDiscoveryData = tailored.discoveryData
  const [viewerCategoryFilter, setViewerCategoryFilter] = useState<'all' | 'recruiter' | 'buyer' | 'peer' | 'executive'>('all')
  const [timeWindow, setTimeWindow] = useState<'90d' | '30d' | '7d'>('90d')
  const [sortOrder, setSortOrder] = useState<'recent' | 'relevant'>('recent')
  const [showMoreTelemetry, setShowMoreTelemetry] = useState<boolean>(false)
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState("")

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleUpdate = () => {
      setTelemetryTick(v => v + 1)
      setViewers(getProfileTailoredAnalytics(currentUser).viewers)
    }
    window.addEventListener('connectln-telemetry-updated', handleUpdate)
    return () => window.removeEventListener('connectln-telemetry-updated', handleUpdate)
  }, [currentUser])

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setViewers(getProfileTailoredAnalytics(currentUser).viewers)

      if (currentUser?.name) {
        syncLiveUserTelemetryFromCloud(currentUser.name)
          .then(() => {
            setTelemetryTick(v => v + 1)
            setViewers(getProfileTailoredAnalytics(currentUser).viewers)
          })
          .catch(() => {})
      }
    }
  }, [isOpen, initialTab, currentUser.id, currentUser.name, currentUser.professionEnclave])

  const handleToggleConnect = (viewerId: string) => {
    setViewers(prev => {
      const updated = prev.map(v => {
        if (v.id !== viewerId) return v
        if (v.isConnected) return { ...v, isConnected: false, isPending: false }
        if (v.isPending) return { ...v, isPending: false }
        return { ...v, isPending: true }
      })
      saveStoredProfileViewers(updated)
      return updated
    })
  }

  const filteredViewers = React.useMemo(() => {
    const base = viewers.filter(v => {
      if (viewerCategoryFilter !== 'all' && v.category !== viewerCategoryFilter) return false
      if (companyFilter !== 'all' && !v.company.toLowerCase().includes(companyFilter.toLowerCase())) return false
      if (!searchFilter) return true
      const q = searchFilter.toLowerCase()
      return (
        v.name.toLowerCase().includes(q) ||
        v.headline.toLowerCase().includes(q) ||
        v.company.toLowerCase().includes(q) ||
        v.clearanceLevel.toLowerCase().includes(q) ||
        v.viewVector.toLowerCase().includes(q)
      )
    })
    if (sortOrder === 'relevant') {
      const rank: Record<string, number> = { recruiter: 1, buyer: 2, executive: 3, peer: 4 }
      return [...base].sort((a, b) => (rank[a.category] || 5) - (rank[b.category] || 5))
    }
    return base
  }, [viewers, viewerCategoryFilter, companyFilter, searchFilter, sortOrder])

  const totalChecksDisplay = viewers.length

  const uniqueCompanies = React.useMemo(() => {
    const set = new Set<string>()
    viewers.forEach(v => { if (v.company) set.add(v.company) })
    return Array.from(set).slice(0, 6)
  }, [viewers])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Modal Top Header - ConnectLn Executive Slate */}
        <div className="bg-[#1B1F23] dark:bg-[#14181B] p-6 text-white border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                  ConnectLn Verified Dossier Telemetry
                </span>
                <span className="text-xs text-zinc-400 font-mono">{currentUser.name} · {currentUser.profession || 'Verified Profile'}</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Who&apos;s Checked Your Credentials</span>
              </h2>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                Track Ticket Scoutings, Hiring Lookups, and Peer Dossier Audits across {currentUser.headline || currentUser.name}.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 3 Analytics Category Navigation Tabs */}
          <div className="mt-5 grid grid-cols-3 gap-2 bg-zinc-900/90 p-1 rounded-xl border border-zinc-700/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('viewers')}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'viewers'
                  ? "bg-white text-zinc-900 shadow-md font-black"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-[#0A66C2]" />
              <span>Credential Checks</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'viewers' ? "bg-blue-100 text-[#0A66C2]" : "bg-white/10 text-zinc-300"
              }`}>
                {totalChecksDisplay.toLocaleString()}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reach')}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'reach'
                  ? "bg-white text-zinc-900 shadow-md font-black"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span>Content Reach</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'reach' ? "bg-purple-100 text-purple-700" : "bg-white/10 text-zinc-300"
              }`}>
                {tailored.effectiveTotalReach.toLocaleString()}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('discoveries')}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'discoveries'
                  ? "bg-white text-zinc-900 shadow-md font-black"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Search className="h-4 w-4 text-emerald-600" />
              <span>Directory Discoveries</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'discoveries' ? "bg-emerald-100 text-emerald-700" : "bg-white/10 text-zinc-300"
              }`}>
                {tailored.effectiveDiscoveries.toLocaleString()}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: CREDENTIAL & DOSSIER CHECKS (WHO'S CHECKED YOUR CREDENTIALS) */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'viewers' && (
            <div className="space-y-5">
              {/* Top Filter Pill Bar (Modeled on Screenshot: Past 90 days | Scout Type | Organization | Reset) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Time Window Pill */}
                  <button
                    onClick={() => setTimeWindow(prev => prev === '90d' ? '30d' : prev === '30d' ? '7d' : '90d')}
                    className="rounded-full bg-[#01754F] hover:bg-[#015C3E] text-white px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>{timeWindow === '90d' ? 'Past 90 days' : timeWindow === '30d' ? 'Past 30 days' : 'Past 7 days'}</span>
                    <span className="text-[10px]">▾</span>
                  </button>

                  {/* Scout Category Pills */}
                  {[
                    { id: 'all', label: 'All Credential Checks' },
                    { id: 'recruiter', label: 'Hiring Lookups' },
                    { id: 'buyer', label: 'Ticket Scoutings' },
                    { id: 'peer', label: 'Peer Audits' },
                    { id: 'executive', label: 'Executive Reviews' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setViewerCategoryFilter(cat.id as any)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                        viewerCategoryFilter === cat.id
                          ? "border-[#01754F] bg-[#01754F]/10 text-[#01754F] dark:text-emerald-300 font-bold"
                          : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}

                  {/* Organization Filter Dropdown */}
                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    aria-label="Filter by organization"
                    className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer outline-none"
                  >
                    <option value="all">Organization ▾</option>
                    {uniqueCompanies.map(comp => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>

                  {(viewerCategoryFilter !== 'all' || companyFilter !== 'all' || timeWindow !== '90d' || searchFilter) && (
                    <button
                      onClick={() => {
                        setViewerCategoryFilter('all')
                        setCompanyFilter('all')
                        setTimeWindow('90d')
                        setSearchFilter('')
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                  ● 100% Real Activity Data
                </span>
              </div>

              {/* Real-Time Profile Viewers Summary Card */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {tailored.effectiveProfileViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Unique profile viewers ({tailored.totalProfileVisitEvents} total profile visit(s))
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                      <span>{tailored.standingBadge}</span>
                      <span className="text-zinc-400 font-normal">· Deduplicated by member</span>
                    </p>
                  </div>
                </div>

                {/* Expandable Dossier Telemetry Toggle */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                  <button
                    onClick={() => setShowMoreTelemetry(prev => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white py-1 cursor-pointer"
                  >
                    <span>{showMoreTelemetry ? 'Hide dossier telemetry' : 'Show more dossier telemetry'}</span>
                    <span className={`transition-transform ${showMoreTelemetry ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                </div>

                {showMoreTelemetry && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 space-y-0.5">
                      <span className="text-[11px] text-zinc-500">Unique Viewers</span>
                      <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{tailored.effectiveProfileViews}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Deduplicated members</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 space-y-0.5">
                      <span className="text-[11px] text-zinc-500">Total Profile Visits</span>
                      <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{tailored.totalProfileVisitEvents}</p>
                      <span className="text-[10px] text-purple-600 font-semibold">Includes repeat visits</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 space-y-0.5">
                      <span className="text-[11px] text-zinc-500">Content Interactions</span>
                      <p className="text-lg font-black text-emerald-600">{tailored.effectiveInteractions}</p>
                      <span className="text-[10px] text-zinc-500">Real reactions &amp; shares</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 space-y-0.5">
                      <span className="text-[11px] text-zinc-500">Activity Status</span>
                      <p className="text-sm font-black text-amber-600">{tailored.standingBadge}</p>
                      <span className="text-[10px] text-zinc-500">Zero placeholders</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-tabs: Most recent | Most relevant */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
                <div className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold">
                  <button
                    onClick={() => setSortOrder('recent')}
                    className={`py-3.5 text-center transition-colors border-b-2 cursor-pointer ${
                      sortOrder === 'recent'
                        ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-black'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Most recent
                  </button>
                  <button
                    onClick={() => setSortOrder('relevant')}
                    className={`py-3.5 text-center transition-colors border-b-2 cursor-pointer ${
                      sortOrder === 'relevant'
                        ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-black'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Most relevant
                  </button>
                </div>

                {/* Live Summary Row */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/40">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-black text-[#0A66C2] shrink-0 shadow-2xs">
                      CLN
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {tailored.effectiveProfileViews} unique member(s) viewed your profile ({tailored.totalProfileVisitEvents} total visit(s))
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {tailored.effectiveProfileViews > 0
                          ? `Latest from ${reachData.topCompanies[0]?.name || 'ConnectLn Network'}`
                          : 'No simulated viewers — real profile visits appear here as they happen'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Individual Credential Check Rows or Empty State */}
                {filteredViewers.length === 0 ? (
                  <div className="p-10 text-center text-zinc-500">
                    <Eye className="h-9 w-9 mx-auto text-zinc-300 mb-2" />
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">No Profile Viewers Yet (0)</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                      When another ConnectLn member visits your profile or clicks Inspect Dossier, their visit is recorded here live according to their privacy settings.
                    </p>
                  </div>
                ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {filteredViewers.map((viewer) => (
                    <div
                      key={viewer.id}
                      className="p-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                          <img src={viewer.avatar} alt={viewer.name} className="h-full w-full object-cover" />
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500" />
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-[#0A66C2] cursor-pointer">
                              {viewer.name}
                            </h4>
                            <ShieldCheck className="h-4 w-4 text-zinc-500 shrink-0" />
                            <span className="text-xs text-zinc-400">· {viewer.isConnected ? '1st' : '2nd'}</span>
                            <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-2 py-0.2 text-[10px] font-semibold text-[#0A66C2] dark:text-sky-300">
                              {viewer.clearanceLevel}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-snug line-clamp-1">
                            {viewer.headline}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex-wrap pt-0.5">
                            <span className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/70 px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>{formatProfileViewDateTime(viewer.createdAtIso, viewer.viewedAt)}</span>
                            </span>
                            <span>·</span>
                            <span className="text-[#0A66C2] dark:text-sky-400 font-medium">
                              {viewer.viewVector}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Button: ➤ Message */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => {
                            if (onNavigateMessaging) {
                              onNavigateMessaging(viewer.name)
                              onClose()
                            }
                          }}
                          className="rounded-full border border-zinc-400 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span className="text-xs">➤</span>
                          <span>Message</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: CONTENT REACH (UNIQUE VIEWERS vs TOTAL VIEWS vs INTERACTIONS) */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'reach' && reachData && (
            <div className="space-y-6">
              {/* Reach Executive Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-1">
                  <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold">Total Content Reach</span>
                  <p className="text-2xl font-black text-purple-900 dark:text-purple-100">
                    {tailored.effectiveTotalReach.toLocaleString()}
                  </p>
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    Views + Interactions
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Unique Viewers</span>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {tailored.effectiveUniqueViewers.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-zinc-500">Deduplicated viewers</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Total Views</span>
                  <p className="text-2xl font-black text-[#0A66C2] dark:text-sky-400">
                    {tailored.effectiveTotalViews.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-zinc-500">Learning, Alerts, Media &amp; Feed</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Interactions</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {tailored.effectiveInteractions.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-zinc-500">Likes, Comments, Shares &amp; Saves</span>
                </div>
              </div>

              {/* 7-Day Day-by-Day Reach Histogram */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <span>7-Day Broadcast Reach Volume</span>
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">Daily Impressions</span>
                </div>

                <div className="grid grid-cols-7 gap-2 items-end pt-4 h-36 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  {reachData.dailyTrends.map((d) => {
                    const maxVal = 2500
                    const heightPercent = Math.min(100, Math.round((d.reach / maxVal) * 100))
                    return (
                      <div key={d.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[10px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.reach}
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-indigo-600 to-purple-500 group-hover:from-indigo-500 group-hover:to-purple-400 transition-all shadow-xs"
                        />
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{d.day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top Performing Broadcasts */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Live Content &amp; Module Activity History</span>
                </h3>

                {reachData.topPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500">
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">No Content Reach Activity Yet (0)</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Visit Learning, Alerts, Media, or engage with Feed posts to see real Views and Interactions recorded here.
                    </p>
                  </div>
                ) : (
                <div className="space-y-2.5">
                  {reachData.topPosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {post.title}
                          </h4>
                          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.2 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                            {post.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">{post.date}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-zinc-400">Total Views</span>
                          <p className="text-base font-black text-purple-600 dark:text-purple-400">{post.reach.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-zinc-400">Interactions</span>
                          <p className="text-base font-black text-zinc-900 dark:text-zinc-100">{post.engagements}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>

              {/* Audience Demographics Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#0A66C2]" />
                    <span>Top Companies Reached</span>
                  </h4>
                  <div className="space-y-2">
                    {reachData.topCompanies.map((c) => (
                      <div key={c.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium">{c.logo} {c.name}</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">{c.percentage}% ({c.count})</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div style={{ width: `${c.percentage}%` }} className="h-full bg-purple-600 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-600" />
                    <span>Audience Seniority &amp; Job Roles</span>
                  </h4>
                  <div className="space-y-2">
                    {reachData.topJobRoles.map((r) => (
                      <div key={r.role} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium">{r.role}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{r.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div style={{ width: `${r.percentage}%` }} className="h-full bg-emerald-500 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: DIRECTORY DISCOVERIES (SEARCH APPEARANCES vs PROFILE CLICKS) */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'discoveries' && discoveryData && (
            <div className="space-y-6">
              {/* Discoveries Header KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-1">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Total Discoveries</span>
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                    {tailored.effectiveDiscoveries.toLocaleString()}
                  </p>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Appearances + Clicks
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Search Appearances</span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {tailored.effectiveSearchAppearances.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-zinc-500">Directory &amp; specialty results</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Profile Clicks</span>
                  <p className="text-2xl font-black text-[#0A66C2] dark:text-sky-400">
                    {tailored.effectiveProfileClicks.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-zinc-500">Direct clicks from listings</span>
                </div>

                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-1">
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold">Weekly Lookups (7d)</span>
                  <p className="text-2xl font-black text-amber-900 dark:text-amber-100">
                    {(discoveryData.weeklyLookupsCount ?? tailored.effectiveDiscoveries).toLocaleString()}
                  </p>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    Sent to your Alerts Tab
                  </span>
                </div>
              </div>

              {/* Who Was Trying to Lookup You This Week (Live Searcher Log) */}
              {discoveryData.recentLookupActors && discoveryData.recentLookupActors.length > 0 && (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-800/70 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30 dark:from-zinc-900 dark:to-amber-950/20 p-5 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Users className="h-4 w-4 text-amber-600" />
                      <span>Who Was Trying to Lookup You This Week ({discoveryData.recentLookupActors.length} Lookup Events)</span>
                    </h3>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900 dark:text-amber-300">
                      🔔 Synced with Alerts Tab
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {discoveryData.recentLookupActors.slice(0, 8).map((actor) => (
                      <div
                        key={actor.id}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-start gap-3 shadow-2xs"
                      >
                        <img
                          src={
                            actor.searcherAvatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(actor.searcherName)}&backgroundColor=0a66c2`
                          }
                          alt={actor.searcherName}
                          className="h-10 w-10 rounded-xl object-cover shrink-0 ring-1 ring-amber-300/60"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <p className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                              {actor.searcherName}
                            </p>
                            <span className="text-[10px] font-mono text-zinc-400 shrink-0">{actor.timeAgo}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {actor.searcherHeadline} · {actor.searcherCompany}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                            <span className="rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                              Query: &ldquo;{actor.keyword}&rdquo;
                            </span>
                            <span className="rounded bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:text-amber-300">
                              {actor.discoveryType === 'profile_click' ? 'Direct Lookup Click' : 'Search Appearance'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exact Search Queries Table */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Search className="h-4 w-4 text-emerald-600" />
                  <span>Exact Keywords, Specialty Filters &amp; Profile Clicks That Surfaced You</span>
                </h3>

                {discoveryData.topSearchKeywords.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">No Directory Discoveries Yet (0)</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      When members search for your specialty or click your profile in the directory, each appearance and click is recorded here.
                    </p>
                  </div>
                ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {discoveryData.topSearchKeywords.map((kw, i) => (
                    <div key={kw.keyword} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                            "{kw.keyword}"
                          </p>
                          <span className="text-[11px] text-zinc-400">
                            {kw.appearancesCount || 0} search appearance(s) · {kw.clicksCount || 0} profile click(s)
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">{kw.occurrences} total</p>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">{kw.growth}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>

              {/* Searching Organizations & Seniority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-sky-600" />
                    <span>Top Searching Organizations</span>
                  </h4>
                  <div className="space-y-2.5">
                    {discoveryData.searchingCompanies.map((c) => (
                      <div key={c.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium">{c.logo} {c.name}</span>
                          <span className="font-bold text-sky-600 dark:text-sky-400">{c.percentage}% ({c.searchesCount})</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div style={{ width: `${c.percentage}%` }} className="h-full bg-sky-500 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span>Searcher Seniority Breakdown</span>
                  </h4>
                  <div className="space-y-2.5">
                    {discoveryData.searcherSeniority.map((s) => (
                      <div key={s.level} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium">{s.level}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div style={{ width: `${s.percentage}%` }} className="h-full bg-emerald-500 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
