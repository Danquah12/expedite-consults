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
import { UserProfile } from "@/lib/linkedin-data"
import {
  ProfileViewerItem,
  ContentReachData,
  DirectoryDiscoveryData,
  loadStoredProfileViewers,
  saveStoredProfileViewers,
  loadStoredContentReach,
  loadStoredDirectoryDiscoveries,
  recordProfileView
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
  const [viewers, setViewers] = useState<ProfileViewerItem[]>([])
  const [reachData, setReachData] = useState<ContentReachData | null>(null)
  const [discoveryData, setDiscoveryData] = useState<DirectoryDiscoveryData | null>(null)
  const [viewerCategoryFilter, setViewerCategoryFilter] = useState<'all' | 'recruiter' | 'buyer' | 'peer' | 'executive'>('all')
  const [searchFilter, setSearchFilter] = useState("")

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setViewers(loadStoredProfileViewers())
      setReachData(loadStoredContentReach())
      setDiscoveryData(loadStoredDirectoryDiscoveries())
    }
  }, [isOpen, initialTab])

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
      { name: "Col. Gregory Vance", title: "Principal Defense Fellow @ DARPA Cyber Directorate", company: "DARPA", clearance: "TS/SCI Polygraph (Q Cleared)", category: "executive" as const },
      { name: "Amanda Sterling", title: "Global VP Technology Sourcing @ Northrop Grumman", company: "Northrop Grumman", clearance: "Enterprise Procurement Buyer", category: "buyer" as const },
      { name: "Liam O'Connor", title: "Lead Threat Intelligence Architect @ Cisco Talos", company: "Cisco Systems", clearance: "Level 4 Verified Fellow", category: "peer" as const },
      { name: "Maya Patel", title: "Senior Strategic Talent Partner @ Google DeepMind Gov", company: "Google", clearance: "Cleared Talent Partner", category: "recruiter" as const }
    ]
    const chosen = demoNames[Math.floor(Math.random() * demoNames.length)]
    const updated = recordProfileView({
      name: chosen.name,
      headline: chosen.title,
      company: chosen.company,
      clearanceLevel: chosen.clearance,
      category: chosen.category,
      viewVector: "Real-Time Enclave Profile Discovery",
      mutualConnectionsCount: Math.floor(8 + Math.random() * 20),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=400&auto=format&fit=crop&q=80`
    })
    setViewers([...updated])
  }

  const filteredViewers = viewers.filter(v => {
    if (viewerCategoryFilter !== 'all' && v.category !== viewerCategoryFilter) return false
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

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-bold text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  ConnectIn Intelligence Radar
                </span>
                <span className="text-xs text-zinc-400 font-mono">Zero-Trust Analytics</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Analytics &amp; Network Intelligence</span>
              </h2>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                Inspect real-time member profile views with full identity visibility, monitor multi-channel broadcast reach, and track recruiting discovery queries.
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
          <div className="mt-5 grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveTab('viewers')}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'viewers'
                  ? "bg-white text-zinc-900 shadow-md font-black"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Eye className="h-4 w-4 text-[#0A66C2]" />
              <span>Profile Viewers</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'viewers' ? "bg-blue-100 text-[#0A66C2]" : "bg-white/10 text-zinc-300"
              }`}>
                {(currentUser.profileViews || 1428).toLocaleString()}
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
                {(currentUser.postImpressions || 9840).toLocaleString()}
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
                {(currentUser.searchAppearances || 342).toLocaleString()}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: PROFILE VIEWERS (WHO VIEWED YOUR PROFILE)                   */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'viewers' && (
            <div className="space-y-6">
              {/* Executive Summary Metric Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Total Profile Views</span>
                    <Eye className="h-4 w-4 text-[#0A66C2]" />
                  </div>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {(currentUser.profileViews || 1428).toLocaleString()}
                  </p>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> +14.8% past 7 days
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Unique Enterprises</span>
                    <Building2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">84 Orgs</p>
                  <span className="text-[11px] text-zinc-500">DoD, AWS, Lockheed, Cisco</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Cleared Personnel</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">92.4%</p>
                  <span className="text-[11px] text-zinc-500">TS/SCI &amp; Poly Verified</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Executive Ratio</span>
                    <Award className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">58%</p>
                  <span className="text-[11px] text-zinc-500">CTOs, CISOs &amp; VP Buyers</span>
                </div>
              </div>

              {/* Viewers Filter Ribbon & Real-time trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                  {[
                    { id: 'all', label: `All Viewers (${viewers.length})` },
                    { id: 'executive', label: '🏛️ Executives & CTOs' },
                    { id: 'buyer', label: '🏢 Enterprise Buyers' },
                    { id: 'recruiter', label: '💼 Cleared Recruiters' },
                    { id: 'peer', label: '🛡️ Fellow Architects' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setViewerCategoryFilter(cat.id as any)}
                      className={`rounded-full px-3 py-1.5 transition-all shrink-0 ${
                        viewerCategoryFilter === cat.id
                          ? "bg-[#0A66C2] text-white font-bold shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSimulateNewViewer}
                  className="rounded-xl bg-gradient-to-r from-sky-600 to-[#0A66C2] hover:from-sky-500 hover:to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs flex items-center gap-1.5 shrink-0 self-end"
                  title="Simulate a real-time incoming profile view"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>+ Simulate Inbound View</span>
                </button>
              </div>

              {/* Viewers Cards List */}
              <div className="space-y-3">
                {filteredViewers.map((viewer) => (
                  <div
                    key={viewer.id}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4 shadow-xs hover:border-[#0A66C2]/60 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="relative h-13 w-13 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                          <img src={viewer.avatar} alt={viewer.name} className="h-full w-full object-cover" />
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500" />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-[#0A66C2] cursor-pointer">
                              {viewer.name}
                            </h4>
                            <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-2 py-0.2 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                              {viewer.clearanceLevel}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-snug line-clamp-2">
                            {viewer.headline}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-zinc-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {viewer.company}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {viewer.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                        <button
                          onClick={() => {
                            if (onNavigateMessaging) {
                              onNavigateMessaging(viewer.name)
                              onClose()
                            }
                          }}
                          className="rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-[#0A66C2]" />
                          <span>Message</span>
                        </button>

                        <button
                          onClick={() => handleToggleConnect(viewer.id)}
                          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                            viewer.isConnected
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                              : viewer.isPending
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-[#0A66C2] hover:bg-[#004182] text-white shadow-xs"
                          }`}
                        >
                          {viewer.isConnected ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Connected</span>
                            </>
                          ) : viewer.isPending ? (
                            <>
                              <Clock className="h-3.5 w-3.5" />
                              <span>Pending</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3.5 w-3.5" />
                              <span>Connect</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Bottom Viewer Channel Metadata Strip */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 px-2 py-0.5 text-[#0A66C2] dark:text-indigo-300 font-semibold flex items-center gap-1">
                          <Search className="h-3 w-3" /> Inbound: {viewer.viewVector}
                        </span>
                        {viewer.mutualConnectionName && (
                          <span className="hidden sm:inline">
                            · Mutual with <strong>{viewer.mutualConnectionName}</strong> +{viewer.mutualConnectionsCount} others
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-zinc-400 flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" /> {viewer.viewedAt}
                      </span>
                    </div>
                  </div>
                ))}
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
                    {(currentUser.postImpressions || reachData.totalReach).toLocaleString()}
                  </p>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> +{reachData.weeklyChangePercent}% this week
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Unique Professionals</span>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {reachData.uniqueViewers.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-zinc-500">Across 6 Enterprise Sectors</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Engagement Velocity</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {reachData.engagementRate}%
                  </p>
                  <span className="text-[11px] text-zinc-500">Likes, Comments &amp; Reposts</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Syndicated Re-shares</span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">245 Units</p>
                  <span className="text-[11px] text-zinc-500">Cross-Guild Broadcasts</span>
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
                    {(currentUser.searchAppearances || discoveryData.totalDiscoveries).toLocaleString()}
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
                    "Zero Trust"
                  </p>
                  <span className="text-[11px] text-zinc-500">114 Direct Index Hits</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-zinc-500">Index Placement</span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">#1 Result</p>
                  <span className="text-[11px] text-zinc-500">For Cloud AppSec Lead</span>
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
