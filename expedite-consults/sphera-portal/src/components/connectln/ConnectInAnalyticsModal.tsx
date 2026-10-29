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
  getProfileTailoredAnalytics
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
  const tailored = React.useMemo(() => getProfileTailoredAnalytics(currentUser), [
    currentUser.id,
    currentUser.name,
    currentUser.headline,
    currentUser.profession,
    currentUser.professionEnclave,
    currentUser.skills,
    currentUser.profileViews,
    currentUser.postImpressions,
    currentUser.searchAppearances
  ])
  const [viewers, setViewers] = useState<ProfileViewerItem[]>(() => getProfileTailoredAnalytics(currentUser).viewers)
  const [liveChecksCount, setLiveChecksCount] = useState<number>(0)
  const reachData: ContentReachData = tailored.reachData
  const discoveryData: DirectoryDiscoveryData = tailored.discoveryData
  const [viewerCategoryFilter, setViewerCategoryFilter] = useState<'all' | 'recruiter' | 'buyer' | 'peer' | 'executive'>('all')
  const [timeWindow, setTimeWindow] = useState<'90d' | '30d' | '7d'>('90d')
  const [sortOrder, setSortOrder] = useState<'recent' | 'relevant'>('recent')
  const [showMoreTelemetry, setShowMoreTelemetry] = useState<boolean>(false)
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState("")

  const formatRelativeCheckTime = (iso?: string) => {
    if (!iso) return 'Checked recently'
    const diffMs = Date.now() - new Date(iso).getTime()
    const mins = Math.max(0, Math.floor(diffMs / 60000))
    if (mins < 1) return 'Checked just now'
    if (mins < 60) return `Checked ${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Checked ${hours}h ago`
    const days = Math.floor(hours / 24)
    return `Checked ${days}d ago`
  }

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      const baseViewers = getProfileTailoredAnalytics(currentUser).viewers
      setViewers(baseViewers)

      if (currentUser?.name) {
        fetch(`/api/connectin/profile-views?targetName=${encodeURIComponent(currentUser.name)}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && Array.isArray(data.checks) && data.checks.length > 0) {
              setLiveChecksCount(data.checks.length)
              const cloudMapped: ProfileViewerItem[] = data.checks.map((c: any) => ({
                id: c.id || `chk_${c.viewerName}`,
                name: c.viewerName,
                headline: c.viewerHeadline || 'Verified ConnectLn Professional',
                company: c.viewerCompany || 'ConnectLn Network',
                location: c.viewerLocation || 'United States',
                viewedAt: formatRelativeCheckTime(c.checkedAt),
                clearanceLevel: c.viewerClearance || 'Verified Member · 1st',
                category: (c.viewerCategory as any) || 'peer',
                viewVector: c.viewVector || 'Ticket Scouting & Dossier Lookup',
                mutualConnectionsCount: 12,
                isConnected: true,
                isPending: false,
                avatar: c.viewerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.viewerName || 'CL')}&background=0A66C2&color=fff&bold=true`
              }))
              const cloudNames = new Set(cloudMapped.map(v => v.name.toLowerCase()))
              setViewers([...cloudMapped, ...baseViewers.filter(v => !cloudNames.has(v.name.toLowerCase()))])
            }
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

  const handleSimulateNewViewer = () => {
    const demoNames = [
      { name: "Col. Gregory Vance", title: `Principal Executive Director · ${currentUser.profession || 'Operations'}`, company: reachData.topCompanies[0]?.name || "Enterprise Group", clearance: tailored.credentialTiers[0]?.label || "Verified Executive", category: "executive" as const },
      { name: "Amanda Sterling", title: "Global VP Technology & Contract Sourcing", company: reachData.topCompanies[1]?.name || "Global Enterprise", clearance: "Enterprise Procurement Buyer", category: "buyer" as const },
      { name: "Liam O'Connor", title: `Lead ${currentUser.profession || 'Domain'} Specialist`, company: reachData.topCompanies[2]?.name || "Partner Network", clearance: "Level 4 Verified Fellow", category: "peer" as const },
      { name: "Maya Patel", title: `Senior Strategic Talent Partner (${currentUser.profession || 'Specialist'})`, company: reachData.topCompanies[3]?.name || "Talent Partners", clearance: "Verified Talent Partner", category: "recruiter" as const }
    ]
    const chosen = demoNames[Math.floor(Math.random() * demoNames.length)]
    const newItem: ProfileViewerItem = {
      id: 'view_' + Date.now(),
      name: chosen.name,
      headline: chosen.title,
      company: chosen.company,
      location: currentUser.location?.split('·')[0]?.trim() || 'United States',
      viewedAt: 'Just now',
      clearanceLevel: chosen.clearance,
      category: chosen.category,
      viewVector: `Real-Time Query: "${discoveryData.topSearchKeywords[0]?.keyword || currentUser.profession || 'Verified'}"`,
      mutualConnectionsCount: Math.floor(8 + Math.random() * 20),
      isConnected: false,
      isPending: false,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80`
    }
    setViewers(prev => [newItem, ...prev])
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

  const totalChecksDisplay = React.useMemo(() => {
    const baseTotal = tailored.effectiveProfileViews + liveChecksCount
    if (timeWindow === '7d') return Math.max(viewers.length, Math.round(baseTotal * 0.22))
    if (timeWindow === '30d') return Math.max(viewers.length, Math.round(baseTotal * 0.58))
    return baseTotal
  }, [tailored.effectiveProfileViews, liveChecksCount, timeWindow, viewers.length])

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

                <button
                  onClick={handleSimulateNewViewer}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  title="Simulate a live incoming credential check"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>+ Simulate Check</span>
                </button>
              </div>

              {/* 90-Day Credential & Dossier Checks Line Chart Card */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {totalChecksDisplay.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Credential &amp; dossier checks
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                      <span>▲ 14.8%</span>
                      <span className="text-zinc-400 font-normal">vs. prior 7 days</span>
                    </p>
                  </div>

                  {liveChecksCount > 0 && (
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 self-start">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      {liveChecksCount} Real-Time Member {liveChecksCount === 1 ? 'Check' : 'Checks'} Recorded
                    </span>
                  )}
                </div>

                {/* SVG Trend Line Chart (Aug 6 - Oct 29) */}
                <div className="pt-2">
                  <svg viewBox="0 0 640 135" className="w-full h-32 overflow-visible">
                    {/* Horizontal Reference Grid Lines */}
                    <line x1="32" y1="15" x2="625" y2="15" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" />
                    <line x1="32" y1="55" x2="625" y2="55" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" />
                    <line x1="32" y1="95" x2="625" y2="95" stroke="currentColor" className="text-zinc-300 dark:text-zinc-700" strokeWidth="1" />

                    {/* Y-Axis Labels */}
                    <text x="0" y="19" className="fill-zinc-400 text-[10px] font-mono">40</text>
                    <text x="0" y="59" className="fill-zinc-400 text-[10px] font-mono">20</text>
                    <text x="8" y="99" className="fill-zinc-400 text-[10px] font-mono">0</text>

                    {/* Area Gradient Fill */}
                    <defs>
                      <linearGradient id="credentialCheckGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f766e" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 32,55 L 82,26 L 132,29 L 182,68 L 232,60 L 282,64 L 332,78 L 382,68 L 432,60 L 482,58 L 532,64 L 582,56 L 625,52 L 625,95 L 32,95 Z"
                      fill="url(#credentialCheckGrad)"
                    />

                    {/* Smooth Trend Polyline */}
                    <polyline
                      fill="none"
                      stroke="#0f766e"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="32,55 82,26 132,29 182,68 232,60 282,64 332,78 382,68 432,60 482,58 532,64 582,56 625,52"
                    />

                    {/* Data Points */}
                    {[
                      [32, 55], [82, 26], [132, 29], [182, 68], [232, 60], [282, 64],
                      [332, 78], [382, 68], [432, 60], [482, 58], [532, 64], [582, 56], [625, 52]
                    ].map(([cx, cy], idx) => (
                      <circle key={idx} cx={cx} cy={cy} r="3" className="fill-white dark:fill-zinc-900 stroke-[#0f766e]" strokeWidth="2" />
                    ))}

                    {/* X-Axis Date Ticks */}
                    <text x="32" y="118" className="fill-zinc-500 text-[10px]">Aug 6</text>
                    <text x="140" y="118" className="fill-zinc-500 text-[10px]">Aug 22</text>
                    <text x="255" y="118" className="fill-zinc-500 text-[10px]">Sep 7</text>
                    <text x="368" y="118" className="fill-zinc-500 text-[10px]">Sep 23</text>
                    <text x="482" y="118" className="fill-zinc-500 text-[10px]">Oct 9</text>
                    <text x="585" y="118" className="fill-zinc-500 text-[10px]">Oct 29</text>
                  </svg>
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
                      <span className="text-[11px] text-zinc-500">Ticket Scoutings</span>
                      <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{Math.round(totalChecksDisplay * 0.42)}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Verified project leads</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 space-y-0.5">
                      <span className="text-[11px] text-zinc-500">Hiring Lookups</span>
                      <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{Math.round(totalChecksDisplay * 0.36)}</p>
                      <span className="text-[10px] text-purple-600 font-semibold">Talent &amp; Contracting Desks</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 space-y-0.5">
                      <span className="text-[11px] text-zinc-500">Credential Trust Rate</span>
                      <p className="text-lg font-black text-emerald-600">94.2%</p>
                      <span className="text-[10px] text-zinc-500">{tailored.credentialTiers[0]?.label || 'Verified Domain ID'}</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 space-y-0.5">
                      <span className="text-[11px] text-zinc-500">Decision-Makers</span>
                      <p className="text-lg font-black text-amber-600">{tailored.decisionMakerRatio}</p>
                      <span className="text-[10px] text-zinc-500">{tailored.standingBadge}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-tabs: Most recent | Most relevant (Modeled on Screenshot) */}
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

                {/* Hiring Scouts & Ticket Auditors Highlight Row */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/40">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-black text-[#0A66C2] shrink-0 shadow-2xs">
                      CLN
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {Math.max(12, Math.round(totalChecksDisplay * 0.6))} hiring scouts &amp; ticket auditors checked your credentials
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        From {reachData.topCompanies[0]?.name || 'Enterprise Partners'} and other verified organizations
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewerCategoryFilter(prev => prev === 'recruiter' ? 'all' : 'recruiter')}
                    className="rounded-full border border-zinc-400 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white px-4 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 shrink-0 transition-colors cursor-pointer"
                  >
                    {viewerCategoryFilter === 'recruiter' ? 'Show all checks' : 'View all scouts'}
                  </button>
                </div>

                {/* Individual Credential Check Rows */}
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

                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap pt-0.5">
                            <span>{viewer.viewedAt.startsWith('Checked') ? viewer.viewedAt : `Checked ${viewer.viewedAt}`}</span>
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
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: CONTENT REACH (POST IMPRESSIONS SYNONYM)                    */}
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
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> +{reachData.weeklyChangePercent}% this week
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Unique Professionals</span>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {tailored.effectiveUniqueViewers.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-zinc-500">Across {reachData.topCompanies.length} Enterprise Sectors</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Engagement Velocity</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {reachData.engagementRate}%
                  </p>
                  <span className="text-[11px] text-zinc-500">Likes, Comments &amp; Reposts</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Verified Skills Indexed</span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{Math.max(4, currentUser.skills?.length || 0)} Skills</p>
                  <span className="text-[11px] text-zinc-500">{currentUser.profession || 'Guild Verified'}</span>
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
                  <span>Top Performing Content &amp; Technical Transmissions</span>
                </h3>

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
                        <p className="text-[11px] text-zinc-400 font-mono">Published {post.date}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-zinc-400">Total Reach</span>
                          <p className="text-base font-black text-purple-600 dark:text-purple-400">{post.reach.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-zinc-400">Reactions</span>
                          <p className="text-base font-black text-zinc-900 dark:text-zinc-100">{post.engagements}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
          {/* TAB 3: DIRECTORY DISCOVERIES (SEARCH APPEARANCES SYNONYM)          */}
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
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> +{discoveryData.weeklyChangePercent}% this week
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Unique Searchers</span>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {discoveryData.searcherCount} Searchers
                  </p>
                  <span className="text-[11px] text-zinc-500">Recruiters &amp; Buyers</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Top Matched Query</span>
                  <p className="text-base font-black text-[#0A66C2] truncate">
                    &ldquo;{discoveryData.topSearchKeywords[0]?.keyword || currentUser.profession || 'Verified Specialist'}&rdquo;
                  </p>
                  <span className="text-[11px] text-zinc-500">{discoveryData.topSearchKeywords[0]?.occurrences || 114} Direct Index Hits</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Index Placement</span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">#1 Result</p>
                  <span className="text-[11px] text-zinc-500 truncate block">For {currentUser.profession || currentUser.headline || 'Guild Specialist'}</span>
                </div>
              </div>

              {/* Exact Search Queries Table */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Search className="h-4 w-4 text-emerald-600" />
                  <span>Exact Keywords &amp; Competency Queries That Surfaced You</span>
                </h3>

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
                          <span className="text-[11px] text-zinc-400">Enterprise Talent Directory Filter</span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">{kw.occurrences} hits</p>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">{kw.growth}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
