"use client"

import React, { useState, useEffect } from "react"
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
  Compass,
  Mail,
  Phone,
  Link2,
  Share2,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  ThumbsUp,
  Clock,
  ArrowRight
} from "lucide-react"
import {
  SuggestedConnection,
  ConnectedMember,
  OutboundInvitation,
  CatchUpEvent,
  initialCatchUpEvents,
  UserProfile,
  currentUser as defaultUser,
  initialConnectedMembers,
  initialOutboundInvitations,
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
import { InviteMembersModal } from "./InviteMembersModal"
import { ConnectWithNoteModal } from "./ConnectWithNoteModal"

interface NetworkViewProps {
  suggestedPeople: SuggestedConnection[]
  onToggleConnect: (personId: string) => void
  currentUser?: UserProfile
  onNavigateMessaging?: (personName?: string) => void
  onUpdateConnectionsCount?: (newCount: number) => void
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
  currentUser = defaultUser,
  onNavigateMessaging,
  onUpdateConnectionsCount
}: NetworkViewProps) {
  const [activeTab, setActiveTab] = useState<
    'people' | 'connections' | 'received_invites' | 'sent_invites' | 'companies' | 'organizations' | 'circles' | 'topics' | 'catchup'
  >('people')

  const [selectedCapability, setSelectedCapability] = useState<string>('All')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [connectionsSort, setConnectionsSort] = useState<'recent' | 'name' | 'mutual'>('recent')

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isWarmIntroOpen, setIsWarmIntroOpen] = useState(false)
  const [warmIntroTarget, setWarmIntroTarget] = useState<SuggestedConnection | null>(null)
  const [isConnectNoteModalOpen, setIsConnectNoteModalOpen] = useState(false)
  const [connectNoteTarget, setConnectNoteTarget] = useState<SuggestedConnection | null>(null)

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Live collections
  const [connections, setConnections] = useState<ConnectedMember[]>(initialConnectedMembers)
  const [outboundInvites, setOutboundInvites] = useState<OutboundInvitation[]>(initialOutboundInvitations)
  const [catchUpEvents, setCatchUpEvents] = useState<CatchUpEvent[]>(initialCatchUpEvents)
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
      timeAgo: '1 day ago',
      email: 'victoria.hastings@horizonfintech.io'
    },
    {
      id: 'inv_2',
      name: 'Dr. Liam O’Connor',
      headline: 'Head of Quantum Cryptography & RMF @ DARPA Partner Group',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      capabilities: ['RMF', 'AI Security'],
      mutualCount: 14,
      timeAgo: '3 days ago',
      email: 'l.oconnor@darpa-partner.sec'
    }
  ])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Accept Inbound Invitation
  const handleAcceptInvite = (id: string) => {
    const invite = invitations.find(inv => inv.id === id)
    if (!invite) return

    // Remove from invitations
    setInvitations(prev => prev.filter(inv => inv.id !== id))

    // Add to 1st-degree connections
    const newConn: ConnectedMember = {
      id: 'conn_' + Date.now(),
      name: invite.name,
      headline: invite.headline,
      avatar: invite.avatar,
      connectedSince: 'Connected just now',
      capabilities: invite.capabilities,
      verifiedBadges: ['✓ Verified Member'],
      mutualCount: invite.mutualCount,
      isOnline: true,
      email: invite.email
    }

    setConnections(prev => [newConn, ...prev])
    if (onUpdateConnectionsCount) {
      onUpdateConnectionsCount((currentUser?.connectionsCount || 842) + 1)
    }

    showToast(`🎉 You and ${invite.name} are now connected!`)
  }

  // Handle Ignore Inbound Invitation
  const handleIgnoreInvite = (id: string) => {
    const invite = invitations.find(inv => inv.id === id)
    setInvitations(prev => prev.filter(inv => inv.id !== id))
    if (invite) {
      showToast(`Invitation from ${invite.name} ignored.`)
    }
  }

  // Handle Withdraw Outbound Invite
  const handleWithdrawOutbound = (id: string) => {
    setOutboundInvites(prev => prev.filter(inv => inv.id !== id))
    showToast(`Invitation withdrawn successfully.`)
  }

  // Handle Resend Outbound Invite
  const handleResendOutbound = (id: string) => {
    showToast(`Reminder invitation dispatched to recipient.`)
  }

  // Handle Send Connection with optional note
  const handleSendConnectionWithNote = (personId: string, note?: string) => {
    const person = suggestedPeople.find(p => p.id === personId)
    if (!person) return

    onToggleConnect(personId)

    const newOutbound: OutboundInvitation = {
      id: 'out_' + Date.now(),
      name: person.name,
      headline: person.headline,
      avatar: person.avatar,
      sentAt: 'Just now',
      customNote: note,
      status: 'pending',
      type: 'person'
    }

    setOutboundInvites(prev => [newOutbound, ...prev])
    showToast(`✓ Invitation sent to ${person.name}${note ? ' with your custom note' : ''}!`)
  }

  // Handle New Invites from InviteModal (email / sms)
  const handleNewOutboundInvites = (newInvites: OutboundInvitation[]) => {
    setOutboundInvites(prev => [...newInvites, ...prev])
  }

  // Toggle company / org / circle / topic follows
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

  // Endorse connection skill
  const handleEndorseSkill = (connId: string, skill: string) => {
    showToast(`✓ Endorsed ${skill} for connection!`)
  }

  // Remove connection
  const handleRemoveConnection = (connId: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from your 1st-degree network?`)) {
      setConnections(prev => prev.filter(c => c.id !== connId))
      showToast(`Removed ${name} from connections.`)
    }
  }

  // Filtered Connections
  const filteredConnections = connections.filter(c => {
    const matchCapability = selectedCapability === 'All' || c.capabilities.includes(selectedCapability)
    const matchSearch = !searchFilter || (
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.capabilities.some(cap => cap.toLowerCase().includes(searchFilter.toLowerCase()))
    )
    return matchCapability && matchSearch
  }).sort((a, b) => {
    if (connectionsSort === 'name') return a.name.localeCompare(b.name)
    if (connectionsSort === 'mutual') return b.mutualCount - a.mutualCount
    return 0 // default recent
  })

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

  const totalConnectionsDisplay = (currentUser?.connectionsCount || 842) + (connections.length - initialConnectedMembers.length)

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-xs font-bold text-white shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
              <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/40">
                {totalConnectionsDisplay.toLocaleString()}+ 1st Degree Peers
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Manage & Expand Your Trusted Network
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Invite colleagues, discover verified specialists across Cloud Security, Zero Trust, FedRAMP, AI Defense, and exchange direct encrypted messages.
            </p>
          </div>

          {/* Quick Actions & Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-2.5 text-xs font-black text-zinc-950 hover:brightness-110 shadow-lg flex items-center justify-center gap-1.5 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Invite to ConnectIn</span>
            </button>

            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter by name, skill, agency..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full rounded-xl bg-black/40 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-400 border border-white/15 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
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
        {/* Left Rail: Network Navigation & Invitation Tools */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          {/* Manage my network directory */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#0A66C2]" />
                <span>Manage My Network</span>
              </span>
            </h3>

            <div className="space-y-1 text-xs">
              {/* 1. Connections */}
              <button
                onClick={() => setActiveTab('connections')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'connections'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>My Connections</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono font-bold ${
                  activeTab === 'connections' ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {totalConnectionsDisplay}
                </span>
              </button>

              {/* 2. Invitations Received */}
              <button
                onClick={() => setActiveTab('received_invites')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'received_invites'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Invitations Received</span>
                </span>
                {invitations.length > 0 ? (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {invitations.length}
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400">0</span>
                )}
              </button>

              {/* 3. Invitations Sent */}
              <button
                onClick={() => setActiveTab('sent_invites')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'sent_invites'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>Invitations Sent</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono ${
                  activeTab === 'sent_invites' ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {outboundInvites.length}
                </span>
              </button>

              {/* 4. People You May Know */}
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

              {/* 5. Companies */}
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

              {/* 6. Organizations */}
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
                  <span>GovTech & Standards</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${activeTab === 'organizations' ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"}`}>
                  {organizations.length}
                </span>
              </button>

              {/* 7. Circles */}
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

              {/* 8. Topics */}
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

              {/* 9. Catch-Up */}
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

          {/* Quick Invite Box */}
          <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-50 to-blue-50/50 p-4 dark:border-sky-900/30 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#0A66C2] p-1.5 text-white">
                <Sparkles className="h-4 w-4 text-amber-300" />
              </div>
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                Grow Your Professional Mesh
              </h4>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Connect with teammates & alumni via direct Email, SMS, or your custom referral link.
            </p>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="w-full rounded-xl bg-[#0A66C2] py-2 text-xs font-bold text-white hover:bg-[#004182] transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Invite New Members</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-4">
          {/* TAB 0: CONNECTIONS (MY 1ST DEGREE DIRECTORY) */}
          {activeTab === 'connections' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>{totalConnectionsDisplay} Connections</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                        1st Degree
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Direct cryptographic peers in your trusted network.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400 font-medium">Sort by:</span>
                    <select
                      value={connectionsSort}
                      onChange={(e) => setConnectionsSort(e.target.value as any)}
                      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 focus:outline-none"
                    >
                      <option value="recent">Recently added</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="mutual">Mutual connections</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 mt-2">
                  {filteredConnections.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500">
                      <p className="text-sm font-semibold">No connections match your filters.</p>
                      <button
                        onClick={() => {
                          setSelectedCapability('All')
                          setSearchFilter('')
                        }}
                        className="mt-2 text-xs text-[#0A66C2] font-bold hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    filteredConnections.map((conn) => (
                      <div key={conn.id} className="py-4 first:pt-2 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <img
                              src={conn.avatar}
                              alt={conn.name}
                              className="h-14 w-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                            />
                            {conn.isOnline && (
                              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" title="Online now" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-[#0A66C2] cursor-pointer">
                                {conn.name}
                              </h4>
                              {conn.verifiedBadges?.map((b, i) => (
                                <span key={i} className="rounded bg-sky-50 px-1.5 py-0.2 text-[9px] font-bold text-[#0A66C2] dark:bg-sky-950 dark:text-sky-300">
                                  {b}
                                </span>
                              ))}
                            </div>

                            <p className="text-xs text-zinc-500 line-clamp-1 dark:text-zinc-400">
                              {conn.headline}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 pt-0.5">
                              {conn.company && <span>🏢 {conn.company}</span>}
                              {conn.location && <span>📍 {conn.location}</span>}
                              <span>·</span>
                              <span>{conn.connectedSince}</span>
                            </div>

                            {/* Capabilities */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {conn.capabilities.map((cap) => (
                                <button
                                  key={cap}
                                  onClick={() => handleEndorseSkill(conn.id, cap)}
                                  className="rounded-full bg-zinc-100 hover:bg-blue-50 hover:text-[#0A66C2] px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 transition-colors flex items-center gap-1"
                                  title={`Endorse ${conn.name} for ${cap}`}
                                >
                                  <span>+ Endorse</span>
                                  <span className="font-bold">{cap}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => {
                              if (onNavigateMessaging) {
                                onNavigateMessaging(conn.name)
                              }
                            }}
                            className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Message</span>
                          </button>

                          <button
                            onClick={() => handleRemoveConnection(conn.id, conn.name)}
                            className="rounded-full p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Remove Connection"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: RECEIVED INVITATIONS */}
          {activeTab === 'received_invites' && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Received Invitations</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-sky-300">
                    {invitations.length}
                  </span>
                </h3>
              </div>

              {invitations.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <Mail className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm font-semibold">No pending received invitations.</p>
                  <p className="text-xs text-zinc-400 mt-1">You&apos;re all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-1 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={inv.avatar}
                          alt={inv.name}
                          className="h-14 w-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {inv.name}
                          </h4>
                          <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">
                            {inv.headline}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span>{inv.mutualCount} mutual connections</span>
                            <span>·</span>
                            <span>{inv.timeAgo}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
              )}
            </div>
          )}

          {/* TAB: SENT INVITATIONS */}
          {activeTab === 'sent_invites' && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Sent Invitations</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {outboundInvites.length}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Pending invitations awaiting acceptance.
                  </p>
                </div>

                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="rounded-full bg-[#0A66C2] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#004182] flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Invite</span>
                </button>
              </div>

              {outboundInvites.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <Send className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm font-semibold">No pending outbound invitations.</p>
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="mt-2 text-xs text-[#0A66C2] font-bold hover:underline"
                  >
                    + Invite colleagues via Email, SMS or Link
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {outboundInvites.map((inv) => (
                    <div key={inv.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-1 last:pb-0">
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={inv.avatar}
                          alt={inv.name}
                          className="h-12 w-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {inv.name}
                          </h4>
                          <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">
                            {inv.headline}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span>Sent {inv.sentAt}</span>
                            <span>·</span>
                            <span className="text-amber-600 dark:text-amber-400 font-medium">Pending Response</span>
                          </div>
                          {inv.customNote && (
                            <p className="text-xs text-zinc-600 dark:text-zinc-300 italic bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg mt-1 border border-zinc-200/60 dark:border-zinc-800">
                              &quot;{inv.customNote}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleResendOutbound(inv.id)}
                          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Resend</span>
                        </button>
                        <button
                          onClick={() => handleWithdrawOutbound(inv.id)}
                          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-red-600 hover:border-red-300 dark:border-zinc-700 dark:text-zinc-400"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: PEOPLE (CAPABILITY-BASED GRAPH) */}
          {activeTab === 'people' && (
            <div className="space-y-4">
              {/* Inbound invitations quick preview if any */}
              {invitations.length > 0 && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 p-4 shadow-xs dark:border-blue-900/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-900/40 pb-2">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#0A66C2]" />
                      <span>Pending Invitations ({invitations.length})</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('received_invites')}
                      className="text-xs font-bold text-[#0A66C2] hover:underline"
                    >
                      Manage all →
                    </button>
                  </div>

                  <div className="divide-y divide-blue-100/80 dark:divide-blue-900/40">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img
                            src={inv.avatar}
                            alt={inv.name}
                            className="h-10 w-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                              {inv.name}
                            </h4>
                            <p className="text-[11px] text-zinc-500 truncate dark:text-zinc-400">
                              {inv.headline}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleIgnoreInvite(inv.id)}
                            className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            Ignore
                          </button>
                          <button
                            onClick={() => handleAcceptInvite(inv.id)}
                            className="rounded-full bg-[#0A66C2] px-4 py-1 text-xs font-bold text-white hover:bg-[#004182] shadow-xs"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                        onClick={() => {
                          if (person.isConnected) return
                          if (person.isPending) {
                            onToggleConnect(person.id)
                          } else {
                            setConnectNoteTarget(person)
                            setIsConnectNoteModalOpen(true)
                          }
                        }}
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
                        showToast(`👏 Congratulated ${evt.person.name}!`)
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

      {/* Invite Members Modal (Email / SMS / Referral Link) */}
      <InviteMembersModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        currentUser={currentUser}
        onInviteSent={handleNewOutboundInvites}
      />

      {/* Connect With Note Modal */}
      {connectNoteTarget && (
        <ConnectWithNoteModal
          isOpen={isConnectNoteModalOpen}
          onClose={() => setIsConnectNoteModalOpen(false)}
          targetPerson={connectNoteTarget}
          currentUser={currentUser}
          onSendInvite={handleSendConnectionWithNote}
        />
      )}
    </div>
  )
}
