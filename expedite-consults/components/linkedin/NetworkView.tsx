"use client"

import React, { useState } from "react"
import {
  Users,
  UserPlus,
  Check,
  X,
  Plus,
  Building,
  Building2,
  Calendar,
  Newspaper,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Award,
  Cake,
  Send,
  Filter,
  Shield,
  Zap,
  Lock,
  Tag,
  Radio,
  ExternalLink,
  Target,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Compass
} from "lucide-react"
import {
  SuggestedConnection,
  CatchUpEvent,
  initialCatchUpEvents,
  UserProfile,
  currentUser as defaultUser,
  companiesNetworkData,
  organizationsNetworkData,
  professionalCirclesData,
  followedTopicsData,
  CompanyNetworkItem,
  OrganizationNetworkItem,
  ProfessionalCircleItem,
  FollowedTopicItem
} from "@/lib/linkedin-data"
import { WarmIntroModal } from "./WarmIntroModal"

interface NetworkViewProps {
  suggestedPeople: SuggestedConnection[]
  onToggleConnect: (personId: string) => void
  currentUser?: UserProfile
}

const CAPABILITY_FILTERS = [
  { id: 'All', label: 'All Capabilities', icon: '🌐' },
  { id: 'Cloud Security', label: 'Cloud Security', icon: '🛡️' },
  { id: 'Penetration Testing', label: 'Penetration Testing', icon: '🎯' },
  { id: 'AI Security', label: 'AI Security', icon: '🤖' },
  { id: 'DevSecOps', label: 'DevSecOps', icon: '⚡' },
  { id: 'RMF', label: 'RMF (Risk Management Framework)', icon: '🏛️' },
  { id: 'Zero Trust', label: 'Zero Trust Architecture', icon: '🔒' }
]

export function NetworkView({
  suggestedPeople,
  onToggleConnect,
  currentUser = defaultUser
}: NetworkViewProps) {
  const [activeTab, setActiveTab] = useState<'people' | 'companies' | 'organizations' | 'circles' | 'topics' | 'catchup'>('people')
  const [selectedCapability, setSelectedCapability] = useState<string>('All')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [catchUpEvents, setCatchUpEvents] = useState<CatchUpEvent[]>(initialCatchUpEvents)
  const [warmIntroTarget, setWarmIntroTarget] = useState<SuggestedConnection | null>(null)
  const [isWarmIntroOpen, setIsWarmIntroOpen] = useState(false)
  const [companies, setCompanies] = useState<CompanyNetworkItem[]>(companiesNetworkData)
  const [organizations, setOrganizations] = useState<OrganizationNetworkItem[]>(organizationsNetworkData)
  const [circles, setCircles] = useState<ProfessionalCircleItem[]>(professionalCirclesData)
  const [topics, setTopics] = useState<FollowedTopicItem[]>(followedTopicsData)

  const [invitations, setInvitations] = useState([
    {
      id: 'inv_1',
      name: 'Victoria Hastings',
      headline: 'Chief Technology Officer @ Horizon FinTech Systems',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
      capabilities: ['Zero Trust', 'Cloud Security'],
      mutualCount: 31,
      timeAgo: '1 day ago'
    },
    {
      id: 'inv_2',
      name: 'Dr. Liam O’Connor',
      headline: 'Head of Quantum Cryptography & RMF @ DARPA Partner Group',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      capabilities: ['RMF', 'AI Security'],
      mutualCount: 14,
      timeAgo: '3 days ago'
    }
  ])

  const handleAcceptInvite = (id: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id))
  }

  const handleIgnoreInvite = (id: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id))
  }

  const toggleFollowCompany = (id: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, isFollowing: !c.isFollowing } : c))
  }

  const toggleFollowOrg = (id: string) => {
    setOrganizations(prev => prev.map(o => o.id === id ? { ...o, isFollowing: !o.isFollowing } : o))
  }

  const toggleJoinCircle = (id: string) => {
    setCircles(prev => prev.map(c => c.id === id ? { ...c, isJoined: !c.isJoined } : c))
  }

  const toggleFollowTopic = (id: string) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, isFollowing: !t.isFollowing } : t))
  }

  // Filter People based on Capability and Search
  const filteredPeople = suggestedPeople.filter(p => {
    const matchCapability = selectedCapability === 'All' || p.capabilities?.includes(selectedCapability)
    const matchSearch = !searchFilter || (
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.headline.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.capabilities?.some(c => c.toLowerCase().includes(searchFilter.toLowerCase()))
    )
    return matchCapability && matchSearch
  })

  // Filter Companies based on Capability
  const filteredCompanies = companies.filter(c => {
    const matchCapability = selectedCapability === 'All' || c.capabilities.includes(selectedCapability)
    const matchSearch = !searchFilter || c.name.toLowerCase().includes(searchFilter.toLowerCase()) || c.tagline.toLowerCase().includes(searchFilter.toLowerCase())
    return matchCapability && matchSearch
  })

  // Filter Organizations based on Capability
  const filteredOrganizations = organizations.filter(o => {
    const matchCapability = selectedCapability === 'All' || o.capabilities.includes(selectedCapability)
    const matchSearch = !searchFilter || o.name.toLowerCase().includes(searchFilter.toLowerCase())
    return matchCapability && matchSearch
  })

  // Filter Circles based on Capability
  const filteredCircles = circles.filter(c => {
    const matchCapability = selectedCapability === 'All' || c.primaryCapability === selectedCapability
    const matchSearch = !searchFilter || c.name.toLowerCase().includes(searchFilter.toLowerCase())
    return matchCapability && matchSearch
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* 1. TOP CAPABILITY-DRIVEN GRAPH BANNER */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-blue-500/20 px-3 py-0.5 text-xs font-bold text-sky-300 border border-blue-400/40 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Network Intelligence Mesh
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                Capability & Skill-Driven Graph
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Connect Across Real Technical Capabilities
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Discover and build relationships with verified specialists in Cloud Security, Penetration Testing, AI Safety, DevSecOps, FedRAMP/RMF, and Zero Trust.
            </p>
          </div>

          {/* Quick Search Box */}
          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by capability, name, agency..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-xl bg-black/40 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-400 border border-white/15 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>

        {/* Capability Selection Ribbon */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 shrink-0 mr-1 flex items-center gap-1">
            <Target className="h-3.5 w-3.5" /> Capabilities:
          </span>
          {CAPABILITY_FILTERS.map((cap) => {
            const isSelected = selectedCapability === cap.id
            return (
              <button
                key={cap.id}
                onClick={() => setSelectedCapability(cap.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-sky-400 to-blue-500 text-zinc-950 shadow-md font-extrabold"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                <span>{cap.icon}</span>
                <span>{cap.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Rail: Network Navigation & Circles */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#0A66C2]" />
              <span>Network Directory</span>
            </h3>

            <div className="space-y-1 text-xs">
              <button
                onClick={() => setActiveTab('people')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'people'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>People You May Know</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${activeTab === 'people' ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"}`}>
                  {suggestedPeople.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('companies')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'companies'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Companies & Vendors</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${activeTab === 'companies' ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"}`}>
                  {companies.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('organizations')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'organizations'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>GovTech & Standards Bodies</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${activeTab === 'organizations' ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"}`}>
                  {organizations.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('circles')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'circles'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Professional Circles</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${activeTab === 'circles' ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"}`}>
                  {circles.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('topics')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'topics'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>Followed Topics</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${activeTab === 'topics' ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"}`}>
                  {topics.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('catchup')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'catchup'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Catch-Up & Milestones</span>
                </span>
                <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-4">
          {/* Pending Invitations Section */}
          {invitations.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Invitations</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-sky-300">
                    {invitations.length}
                  </span>
                </h3>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {invitations.map((inv) => (
                  <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={inv.avatar}
                        alt={inv.name}
                        className="h-12 w-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {inv.name}
                        </h4>
                        <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">
                          {inv.headline}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span>{inv.mutualCount} mutual connections</span>
                          <span>·</span>
                          <span>{inv.timeAgo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleIgnoreInvite(inv.id)}
                        className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Ignore
                      </button>
                      <button
                        onClick={() => handleAcceptInvite(inv.id)}
                        className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#004182] shadow-xs"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: PEOPLE (CAPABILITY-BASED GRAPH) */}
          {activeTab === 'people' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>People You May Know in</span>
                    <span className="text-[#0A66C2] font-extrabold">{selectedCapability}</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Matches based on shared technical competencies, mutual circles, and security domains.
                  </p>
                </div>
                <span className="text-xs text-zinc-500 font-medium">
                  {filteredPeople.length} specialists
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPeople.map((person) => (
                  <div
                    key={person.id}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs hover:border-[#0A66C2] hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover & Avatar */}
                      <div className="relative h-14 w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800">
                        {person.coverImage && (
                          <img
                            src={person.coverImage}
                            alt=""
                            className="h-full w-full object-cover opacity-50"
                          />
                        )}
                      </div>

                      <div className="px-4 pb-3 pt-0">
                        <div className="-mt-8 mb-2 flex justify-between items-end">
                          <img
                            src={person.avatar}
                            alt={person.name}
                            className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm dark:border-zinc-900"
                          />
                          {person.matchScore && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                              🎯 {person.matchScore}% Match
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-[#0A66C2] cursor-pointer">
                          {person.name}
                        </h4>
                        <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5 dark:text-zinc-400 min-h-[32px]">
                          {person.headline}
                        </p>

                        {/* Verified Badges */}
                        {person.verifiedBadges && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {person.verifiedBadges.map((b, i) => (
                              <span
                                key={i}
                                className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-[#0A66C2] dark:bg-sky-950 dark:text-sky-300 font-mono"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Capabilities Tags */}
                        {person.capabilities && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {person.capabilities.map((cap) => (
                              <span
                                key={cap}
                                onClick={() => setSelectedCapability(cap)}
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium cursor-pointer transition-colors ${
                                  selectedCapability === cap
                                    ? "bg-[#0A66C2] text-white font-bold"
                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                                }`}
                              >
                                {cap}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Mutual Connection */}
                        <p className="text-[11px] text-zinc-400 mt-2 truncate">
                          {person.mutualName ? `${person.mutualName} & ${person.mutualConnections} other mutuals` : `${person.mutualConnections} mutual connections`}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-3 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onToggleConnect(person.id)}
                        className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          person.isConnected
                            ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
                            : person.isPending
                            ? "border border-zinc-300 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
                            : "bg-[#0A66C2] text-white hover:bg-[#004182] shadow-2xs"
                        }`}
                      >
                        {person.isConnected ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Connected</span>
                          </>
                        ) : person.isPending ? (
                          <span>Pending</span>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Connect</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setWarmIntroTarget(person)
                          setIsWarmIntroOpen(true)
                        }}
                        className="rounded-full bg-purple-50 p-2 text-purple-700 hover:bg-purple-100 border border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                        title="AI Warm Intro Request"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COMPANIES & VENDORS */}
          {activeTab === 'companies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    Companies & Technology Vendors
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Follow enterprise security leaders, AI model builders, and cloud platforms.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCompanies.map((comp) => (
                  <div
                    key={comp.id}
                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={comp.logo}
                        alt={comp.name}
                        className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {comp.name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400">{comp.industry}</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                          {comp.tagline}
                        </p>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {comp.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[9px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">{comp.followersCount} · {comp.jobOpeningsCount} jobs</span>
                      <button
                        onClick={() => toggleFollowCompany(comp.id)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                          comp.isFollowing
                            ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
                            : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                        }`}
                      >
                        {comp.isFollowing ? "Following" : "+ Follow"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORGANIZATIONS & GOVTECH */}
          {activeTab === 'organizations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    Federal Agencies & Standards Organizations
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Connect with regulatory authorities, NIST framework authors, and non-profit cyber consortiums.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {org.name}
                          </h4>
                          <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-sky-300">
                            {org.type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                          {org.tagline}
                        </p>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {org.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[9px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">{org.membersCount}</span>
                      <button
                        onClick={() => toggleFollowOrg(org.id)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                          org.isFollowing
                            ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
                            : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                        }`}
                      >
                        {org.isFollowing ? "Following" : "+ Follow"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROFESSIONAL CIRCLES */}
          {activeTab === 'circles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    Professional Circles & Guilds
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Peer groups organized around specific technical competencies and certifications.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCircles.map((circle) => (
                  <div
                    key={circle.id}
                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{circle.icon}</span>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {circle.name}
                          </h4>
                        </div>
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {circle.primaryCapability}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {circle.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">{circle.membersCount}</p>
                        <p className="text-[10px] text-zinc-400">{circle.recentActivity}</p>
                      </div>

                      <button
                        onClick={() => toggleJoinCircle(circle.id)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                          circle.isJoined
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                        }`}
                      >
                        {circle.isJoined ? "✓ Joined Circle" : "Join Circle"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FOLLOWED TOPICS */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    Followed Topics & Disciplines
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Hashtags and capability streams that tune your ConnectIn feed algorithms.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topics.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {t.name}
                      </h4>
                      <span className="font-mono text-xs font-semibold text-[#0A66C2]">
                        {t.hashtag}
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{t.followersCount}</p>
                    </div>

                    <button
                      onClick={() => toggleFollowTopic(t.id)}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                        t.isFollowing
                          ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                      }`}
                    >
                      {t.isFollowing ? "Following" : "+ Follow"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CATCH-UP & MILESTONES */}
          {activeTab === 'catchup' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    Catch-Up with Your Network
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Celebrate promotions, work anniversaries, and new credentials across your graph.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                {catchUpEvents.map((evt) => (
                  <div key={evt.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={evt.person.avatar}
                        alt={evt.person.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-800 dark:text-zinc-200">
                          <strong className="font-bold text-zinc-900 dark:text-zinc-100">{evt.person.name}</strong> {evt.details}
                        </p>
                        <p className="text-[11px] text-zinc-400">{evt.timeAgo}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCatchUpEvents(prev => prev.map(e => e.id === evt.id ? { ...e, hasCongratulated: true } : e))
                      }}
                      disabled={evt.hasCongratulated}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all shrink-0 ${
                        evt.hasCongratulated
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                      }`}
                    >
                      {evt.hasCongratulated ? "✓ Celebrated" : "Say Congrats 👏"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warm Intro AI Request Modal */}
      {warmIntroTarget && (
        <WarmIntroModal
          isOpen={isWarmIntroOpen}
          onClose={() => setIsWarmIntroOpen(false)}
          targetUser={warmIntroTarget}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}
