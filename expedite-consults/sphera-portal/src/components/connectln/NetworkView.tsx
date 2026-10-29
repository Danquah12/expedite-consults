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
  FollowedTopicItem,
  getEnclaveConnectedMembers,
  getEnclaveCompanies,
  getEnclaveOrganizations,
  getEnclaveCircles,
  getEnclaveTopics,
  getEnclaveInvitations
} from "@/lib/connectln-data"
import { WarmIntroModal } from "./WarmIntroModal"
import { InviteMembersModal } from "./InviteMembersModal"
import { ConnectWithNoteModal } from "./ConnectWithNoteModal"

interface NetworkViewProps {
  suggestedPeople: SuggestedConnection[]
  onToggleConnect: (personId: string) => void
  onSelectMember?: (member: any) => void
  currentUser?: UserProfile
  onNavigateMessaging?: (person?: any) => void
  onUpdateConnectionsCount?: (newCount: number) => void
}

export function getEnclaveCapabilityFilters(enclaveId?: string) {
  if (enclaveId === 'trades_construction') {
    return [
      { id: 'All', label: 'All Trade Disciplines', icon: '🌐' },
      { id: 'Timber Framing', label: 'Timber Framing', icon: '🌲' },
      { id: 'Architectural Joinery', label: 'Architectural Joinery', icon: '🪚' },
      { id: 'OSHA 30', label: 'OSHA 30 Safety Lead', icon: '🦺' },
      { id: 'Heavy Equipment', label: 'Heavy Equipment & Rigging', icon: '🏗️' },
      { id: 'Commercial Buildouts', label: 'Commercial Buildouts', icon: '🏢' },
      { id: 'Building Enclosures', label: 'Building Enclosures & Envelope', icon: '📐' }
    ]
  }
  if (enclaveId === 'healthcare_medicine') {
    return [
      { id: 'All', label: 'All Clinical & Health Roles', icon: '🌐' },
      { id: 'PharmD', label: 'Pharmacists (PharmD/BCPS)', icon: '💊' },
      { id: 'Physician', label: 'Physicians & Surgeons (MD/DO)', icon: '🩺' },
      { id: 'Critical Care', label: 'Nurses (RN/CCRN/NP)', icon: '🏥' },
      { id: 'Medical Assistant', label: 'Medical Aides & CNAs (CCMA/CNA)', icon: '🩹' },
      { id: 'Hospital Operations', label: 'Medical Administrators (MHA/FACHE)', icon: '📋' },
      { id: 'Trauma Surgery', label: 'Trauma & Emergency Triage', icon: '🚨' }
    ]
  }
  if (enclaveId === 'automotive_mechanics') {
    return [
      { id: 'All', label: 'All Master Diagnostics', icon: '🌐' },
      { id: 'CAN-Bus Oscilloscope', label: 'CAN-Bus Oscilloscope', icon: '⚡' },
      { id: '800V EV Lockout', label: '800V EV Safety & Inverters', icon: '🔋' },
      { id: 'Cummins Fleet', label: 'Cummins & Fleet Diesel', icon: '🚚' },
      { id: 'Automotive Diagnostics & EV', label: 'Automotive Diagnostics', icon: '🔧' },
      { id: 'Transmission Rebuild', label: 'Transmission Rebuild & Dyno', icon: '⚙️' }
    ]
  }
  return [
    { id: 'All', label: 'All Capabilities', icon: '🌐' },
    { id: 'Cloud Security', label: 'Cloud Security', icon: '🛡️' },
    { id: 'Penetration Testing', label: 'Penetration Testing', icon: '🎯' },
    { id: 'AI Security', label: 'AI Security', icon: '🤖' },
    { id: 'DevSecOps', label: 'DevSecOps', icon: '⚡' },
    { id: 'RMF', label: 'RMF (Risk Management Framework)', icon: '🏛️' },
    { id: 'Zero Trust', label: 'Zero Trust Architecture', icon: '🔒' }
  ]
}

export function NetworkView({
  suggestedPeople,
  onToggleConnect,
  onSelectMember,
  currentUser = defaultUser,
  onNavigateMessaging,
  onUpdateConnectionsCount
}: NetworkViewProps) {
  const enclaveId = currentUser?.professionEnclave
  const capabilityFilters = getEnclaveCapabilityFilters(enclaveId)

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

  // Persistent custom-added and removed 1st-degree connections
  const [customConnections, setCustomConnections] = useState<ConnectedMember[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem('connectin_my_custom_connections_v2')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [removedConnectionNames, setRemovedConnectionNames] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem('connectin_my_removed_connections_v2')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [outboundInvites, setOutboundInvites] = useState<OutboundInvitation[]>(initialOutboundInvitations)
  const [catchUpEvents, setCatchUpEvents] = useState<CatchUpEvent[]>(initialCatchUpEvents)
  const [companies, setCompanies] = useState<CompanyNetworkItem[]>(() => getEnclaveCompanies(enclaveId))
  const [organizations, setOrganizations] = useState<OrganizationNetworkItem[]>(() => getEnclaveOrganizations(enclaveId))
  const [circles, setCircles] = useState<ProfessionalCircleItem[]>(() => getEnclaveCircles(enclaveId))
  const [topics, setTopics] = useState<FollowedTopicItem[]>(() => getEnclaveTopics(enclaveId))
  const [invitations, setInvitations] = useState<any[]>(() => getEnclaveInvitations(enclaveId))

  useEffect(() => {
    setCompanies(getEnclaveCompanies(enclaveId))
    setOrganizations(getEnclaveOrganizations(enclaveId))
    setCircles(getEnclaveCircles(enclaveId))
    setTopics(getEnclaveTopics(enclaveId))
    setInvitations(getEnclaveInvitations(enclaveId))
    setSelectedCapability('All')
  }, [enclaveId])

  // Build unified, deduplicated 1st-degree connections list so count ALWAYS matches the exact items in My Connections
  const connections: ConnectedMember[] = React.useMemo(() => {
    const removedSet = new Set(removedConnectionNames.map(n => n.toLowerCase().trim()))
    const myNormName = String(currentUser?.name || '').toLowerCase().trim()
    const seenNames = new Set<string>()
    const list: ConnectedMember[] = []

    const pushUnique = (item: ConnectedMember) => {
      if (!item || !item.name) return
      const norm = item.name.toLowerCase().trim()
      if (!norm || norm === myNormName || removedSet.has(norm) || seenNames.has(norm)) return
      seenNames.add(norm)
      list.push(item)
    }

    // 1. Newly accepted / custom-added connections first
    for (const c of customConnections) {
      pushUnique(c)
    }

    // 2. Any member in suggestedPeople who is currently connected (isConnected === true)
    for (const p of suggestedPeople) {
      if (p.isConnected) {
        const safeCaps = (p.capabilities || []).map((cap: any) =>
          typeof cap === 'string' ? cap : String(cap?.name || cap || '')
        ).filter(Boolean)
        pushUnique({
          id: `conn_sug_${p.id}`,
          name: p.name,
          headline: p.headline,
          avatar: p.avatar,
          connectedSince: 'Connected on ConnectLn',
          capabilities: safeCaps.length > 0 ? safeCaps : ['Verified Specialist'],
          verifiedBadges: p.verifiedBadges || ['✓ Verified Member'],
          mutualCount: p.mutualConnections || 18,
          isOnline: true
        })
      }
    }

    // 3. Active enclave 1st-degree connections
    for (const c of getEnclaveConnectedMembers(enclaveId)) {
      pushUnique(c)
    }

    // 4. Healthcare, Clinical Pharmacy, Nursing, Medical Aide & Admin 1st-degree peers
    for (const c of getEnclaveConnectedMembers('healthcare_medicine')) {
      pushUnique(c)
    }

    // 5. Core global 1st-degree connections
    for (const c of initialConnectedMembers) {
      pushUnique(c)
    }

    return list
  }, [customConnections, suggestedPeople, enclaveId, removedConnectionNames, currentUser?.name])

  // Keep user profile connectionsCount synced with the exact count of My Connections
  useEffect(() => {
    if (onUpdateConnectionsCount && currentUser?.connectionsCount !== connections.length) {
      onUpdateConnectionsCount(connections.length)
    }
  }, [connections.length])

  const saveCustomConnections = (next: ConnectedMember[]) => {
    setCustomConnections(next)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('connectin_my_custom_connections_v2', JSON.stringify(next))
      } catch {}
    }
  }

  const saveRemovedConnectionNames = (next: string[]) => {
    setRemovedConnectionNames(next)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('connectin_my_removed_connections_v2', JSON.stringify(next))
      } catch {}
    }
  }

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

    const normInviteName = invite.name.toLowerCase().trim()
    if (removedConnectionNames.some(n => n.toLowerCase().trim() === normInviteName)) {
      saveRemovedConnectionNames(removedConnectionNames.filter(n => n.toLowerCase().trim() !== normInviteName))
    }

    // Add to 1st-degree connections
    const newConn: ConnectedMember = {
      id: 'conn_' + Date.now(),
      name: invite.name,
      headline: invite.headline,
      avatar: invite.avatar,
      connectedSince: 'Connected just now',
      capabilities: invite.capabilities || ['Verified Specialist'],
      verifiedBadges: ['✓ Verified Member'],
      mutualCount: invite.mutualCount || 15,
      isOnline: true,
      email: invite.email
    }

    saveCustomConnections([newConn, ...customConnections.filter(c => c.name.toLowerCase().trim() !== normInviteName)])
    showToast(`🎉 You and ${invite.name} are now connected! (${connections.length + 1} Connections)`)
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
  const handleResendOutbound = async (id: string) => {
    const inv = outboundInvites.find(i => i.id === id)
    if (!inv) return

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://connectln.vercel.app"

    if (inv.phone) {
      showToast(`Resending SMS invite to ${inv.phone}...`)
      try {
        const res = await fetch("/api/connectin/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "sms",
            recipients: [inv.phone],
            senderName: currentUser.name,
            inviteLink: `${baseUrl}/connectin-login`
          })
        })
        const data = await res.json()
        if (data.dispatched > 0) {
          showToast(`✓ Real SMS reminder dispatched via Twilio to ${inv.phone}!`)
        } else {
          showToast(`⚠️ Carrier notice: ${data.results?.[0]?.error || "Carrier filter active"}`)
        }
      } catch {
        showToast(`Reminder invitation dispatched to recipient.`)
      }
    } else if (inv.email) {
      showToast(`Resending email invite to ${inv.email}...`)
      try {
        const res = await fetch("/api/connectin/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "email",
            recipients: [inv.email],
            senderName: currentUser.name,
            inviteLink: `${baseUrl}/connectin`
          })
        })
        const data = await res.json()
        if (data.dispatched > 0) {
          showToast(`✓ Email invitation reminder dispatched via Resend to ${inv.email}!`)
        } else {
          showToast(`⚠️ Email notice: ${data.results?.[0]?.error || "Could not deliver email"}`)
        }
      } catch {
        showToast(`Reminder invitation dispatched to recipient.`)
      }
    } else {
      showToast(`Reminder invitation dispatched to recipient.`)
    }
  }

  // Handle Send Connection with optional note — immediately connects and adds to My Connections + logs in Invitations Sent
  const handleSendConnectionWithNote = (personId: string, note?: string) => {
    const person = suggestedPeople.find(p => p.id === personId)
    if (!person) return

    const normName = person.name.toLowerCase().trim()
    if (removedConnectionNames.some(n => n.toLowerCase().trim() === normName)) {
      saveRemovedConnectionNames(removedConnectionNames.filter(n => n.toLowerCase().trim() !== normName))
    }

    onToggleConnect(personId)

    const safeCaps = (person.capabilities || []).map((cap: any) =>
      typeof cap === 'string' ? cap : String(cap?.name || cap || '')
    ).filter(Boolean)

    const newConn: ConnectedMember = {
      id: `conn_${person.id}_${Date.now()}`,
      name: person.name,
      headline: person.headline,
      avatar: person.avatar,
      connectedSince: 'Connected just now',
      capabilities: safeCaps.length > 0 ? safeCaps : ['Verified Specialist'],
      verifiedBadges: person.verifiedBadges || ['✓ Verified Member'],
      mutualCount: person.mutualConnections || 18,
      isOnline: true
    }

    saveCustomConnections([
      newConn,
      ...customConnections.filter(c => c.name.toLowerCase().trim() !== normName)
    ])

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
    showToast(`✓ Connected with ${person.name}${note ? ' (Note delivered)' : ''}! Added to My Connections.`)
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

  // Remove connection — immediately removes from My Connections and decrements count
  const handleRemoveConnection = (connId: string, name: string) => {
    const normName = name.toLowerCase().trim()
    saveCustomConnections(customConnections.filter(c => c.id !== connId && c.name.toLowerCase().trim() !== normName))
    if (!removedConnectionNames.some(n => n.toLowerCase().trim() === normName)) {
      saveRemovedConnectionNames([...removedConnectionNames, normName])
    }
    const matchedSuggested = suggestedPeople.find(p => p.name.toLowerCase().trim() === normName && p.isConnected)
    if (matchedSuggested) {
      onToggleConnect(matchedSuggested.id)
    }
    showToast(`Removed ${name} from My Connections.`)
  }

  // Filtered Connections
  const filteredConnections = connections.filter(c => {
    const safeCaps = (c.capabilities || []).map((cap: any) => (typeof cap === 'string' ? cap : String(cap?.name || cap || '')))
    const matchCapability =
      selectedCapability === 'All' ||
      safeCaps.some(cap => cap.toLowerCase().includes(selectedCapability.toLowerCase())) ||
      c.headline.toLowerCase().includes(selectedCapability.toLowerCase())
    const matchSearch = !searchFilter || (
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchFilter.toLowerCase()) ||
      safeCaps.some(cap => cap.toLowerCase().includes(searchFilter.toLowerCase()))
    )
    return matchCapability && matchSearch
  }).sort((a, b) => {
    if (connectionsSort === 'name') return a.name.localeCompare(b.name)
    if (connectionsSort === 'mutual') return b.mutualCount - a.mutualCount
    return 0 // default recent
  })

  const connectedNamesSet = React.useMemo(
    () => new Set(connections.map(c => c.name.toLowerCase().trim())),
    [connections]
  )

  // Filter People based on Capability, Search, and Enclave Prioritization
  const filteredPeople = suggestedPeople
    .map(p => ({
      ...p,
      isConnected: p.isConnected || connectedNamesSet.has(String(p.name || '').toLowerCase().trim())
    }))
    .filter(p => {
      const safeCaps = (p.capabilities || []).map((cap: any) => (typeof cap === 'string' ? cap : String(cap?.name || cap || '')))
      const matchCapability =
        selectedCapability === 'All' ||
        safeCaps.some(cap => cap.toLowerCase().includes(selectedCapability.toLowerCase())) ||
        String(p.headline || '').toLowerCase().includes(selectedCapability.toLowerCase())
      const matchSearch = !searchFilter || (
        String(p.name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        String(p.headline || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        safeCaps.some(c => c.toLowerCase().includes(searchFilter.toLowerCase()))
      )
      return matchCapability && matchSearch
    })
    .sort((a, b) => {
      if (enclaveId) {
        const aCaps = (a.capabilities || []).map((cap: any) => (typeof cap === 'string' ? cap : String(cap?.name || cap || '')))
        const bCaps = (b.capabilities || []).map((cap: any) => (typeof cap === 'string' ? cap : String(cap?.name || cap || '')))
        const aMatches = capabilityFilters.some(cf => cf.id !== 'All' && aCaps.includes(cf.id))
        const bMatches = capabilityFilters.some(cf => cf.id !== 'All' && bCaps.includes(cf.id))
        if (aMatches && !bMatches) return -1
        if (!aMatches && bMatches) return 1
      }
      return 0
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

  // Exact 1-to-1 count matching the actual 1st-degree connections in My Connections
  const totalConnectionsDisplay = connections.length

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-xs font-bold text-white shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP PROFESSIONAL NETWORK BANNER */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full px-3 py-0.5 text-xs font-semibold border flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] dark:text-sky-300 border-blue-200/60 dark:border-blue-800/60">
                <Users className="h-3.5 w-3.5" />
                {enclaveId === 'trades_construction'
                  ? "Skilled Trades Community"
                  : enclaveId === 'healthcare_medicine'
                  ? "Clinical & Healthcare Community"
                  : enclaveId === 'automotive_mechanics'
                  ? "Automotive Technicians Network"
                  : "Professional Community"}
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                Verified Members
              </span>
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                {totalConnectionsDisplay.toLocaleString()}+ Connections
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {enclaveId === 'trades_construction'
                ? "Manage & Expand Your Trade Network"
                : enclaveId === 'healthcare_medicine'
                ? "Manage & Expand Your Clinical Network"
                : enclaveId === 'automotive_mechanics'
                ? "Manage & Expand Your Automotive Network"
                : "Manage & Expand Your Professional Network"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {enclaveId === 'trades_construction'
                ? "Invite colleagues, connect with master carpenters, superintendents, and trade specialists, and exchange direct messages."
                : enclaveId === 'healthcare_medicine'
                ? "Invite colleagues, discover verified clinicians and specialists across surgery, nursing, and critical care, and coordinate clinical practice."
                : enclaveId === 'automotive_mechanics'
                ? "Invite colleagues, connect with master technicians and specialists across diagnostics, EV powertrains, and fleet maintenance."
                : "Invite colleagues, discover verified specialists and industry leaders in your discipline, and build your professional community."}
            </p>
          </div>

          {/* Quick Actions & Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-4 py-2 text-xs font-semibold text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                className="w-full rounded-full bg-zinc-50 dark:bg-zinc-800 pl-9 pr-4 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
              />
            </div>
          </div>
        </div>

        {/* Capability Selection Ribbon */}
        <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0 mr-1 flex items-center gap-1">
            <Target className="h-3.5 w-3.5 text-[#0A66C2]" /> Specialties:
          </span>
          {capabilityFilters.map((cap) => {
            const isSelected = selectedCapability === cap.id
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => setSelectedCapability(cap.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
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
                      <span>
                        {filteredConnections.length === totalConnectionsDisplay
                          ? `${totalConnectionsDisplay} Connections`
                          : `${filteredConnections.length} of ${totalConnectionsDisplay} Connections`}
                      </span>
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
                          <div
                            onClick={() => onSelectMember?.(conn)}
                            className="relative shrink-0 cursor-pointer group"
                            title={`Open ${conn.name}'s Workspace`}
                          >
                            <img
                              src={conn.avatar}
                              alt={conn.name}
                              className="h-14 w-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 group-hover:ring-2 group-hover:ring-[#0A66C2] transition-all"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(conn.name)}&backgroundColor=0a66c2`
                              }}
                            />
                            {conn.isOnline && (
                              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" title="Online now" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                onClick={() => onSelectMember?.(conn)}
                                className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-[#0A66C2] hover:underline cursor-pointer"
                              >
                                {conn.name}
                              </h4>
                              {conn.verifiedBadges?.map((b, i) => (
                                <span key={i} className="rounded bg-sky-50 px-1.5 py-0.2 text-[9px] font-bold text-[#0A66C2] dark:bg-sky-950 dark:text-sky-300">
                                  {b}
                                </span>
                              ))}
                            </div>

                            <p
                              onClick={() => onSelectMember?.(conn)}
                              className="text-xs text-zinc-500 line-clamp-1 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
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
                            onClick={() => onSelectMember?.(conn)}
                            className="rounded-full border border-[#0A66C2] px-3.5 py-1.5 text-xs font-bold text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          >
                            View Workspace
                          </button>

                          <button
                            onClick={() => {
                              if (onNavigateMessaging) {
                                onNavigateMessaging(conn)
                              }
                            }}
                            className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
                      <div
                        onClick={() => onSelectMember?.(inv)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={inv.avatar}
                          alt={inv.name}
                          className="h-14 w-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 group-hover:ring-2 group-hover:ring-[#0A66C2] transition-all"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(inv.name)}&backgroundColor=0a66c2`
                          }}
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] group-hover:underline">
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
                          onClick={() => onSelectMember?.(inv)}
                          className="rounded-full border border-[#0A66C2] px-3.5 py-1.5 text-xs font-bold text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          View Workspace
                        </button>
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
                      <div
                        onClick={() => onSelectMember?.(inv)}
                        className="flex items-start gap-3 min-w-0 cursor-pointer group"
                      >
                        <img
                          src={inv.avatar}
                          alt={inv.name}
                          className="h-12 w-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 group-hover:ring-2 group-hover:ring-[#0A66C2] transition-all"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(inv.name)}&backgroundColor=0a66c2`
                          }}
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] group-hover:underline">
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
                          onClick={() => onSelectMember?.(inv)}
                          className="rounded-full border border-[#0A66C2] px-3 py-1.5 text-xs font-bold text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          View Workspace
                        </button>
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
                        <div
                          onClick={() => onSelectMember?.(inv)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img
                            src={inv.avatar}
                            alt={inv.name}
                            className="h-10 w-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 group-hover:ring-2 group-hover:ring-[#0A66C2] transition-all"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(inv.name)}&backgroundColor=0a66c2`
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] group-hover:underline">
                              {inv.name}
                            </h4>
                            <p className="text-[11px] text-zinc-500 truncate dark:text-zinc-400">
                              {inv.headline}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onSelectMember?.(inv)}
                            className="rounded-full border border-[#0A66C2] px-2.5 py-1 text-xs font-bold text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          >
                            Workspace
                          </button>
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

              {/* ═══════════════════════════════════════════════════════════════════════ */}
              {/* SECTION 1: ACTIVE TICKET ISSUERS & CONTRACTING LEADS                   */}
              {/* ═══════════════════════════════════════════════════════════════════════ */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#FAF8F5] dark:bg-zinc-900/90 p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1916] px-2.5 py-0.5 text-[10px] font-black text-amber-300 border border-[#A64532]">
                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded bg-[#A64532] text-[9px] font-black text-white">C</span>
                        <span>LIVE TICKET DESK</span>
                      </span>
                      <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                        Active Ticket Issuers &amp; Project Leads Seeking Your Specialty
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Verified directors, contracting leads, and guild principals issuing live work tickets in <strong className="text-[#A64532] dark:text-amber-400">{selectedCapability}</strong>.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#A64532]/10 border border-[#A64532]/30 px-3 py-1 text-[11px] font-extrabold text-[#A64532] dark:text-amber-300">
                    ⚡ {Math.min(4, filteredPeople.length)} Issuing Tickets Now
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredPeople.slice(0, 4).map((person, idx) => {
                    const ticketCount = 14 + ((idx * 7) % 19)
                    const vouchCount = person.mutualConnections || (9 + idx * 3)
                    const serialCode = `CLN-ISS-${String(idx + 1).padStart(2, '0')}`
                    const primaryCap = typeof person.capabilities?.[0] === 'string'
                      ? person.capabilities[0]
                      : (person.capabilities?.[0] as any)?.name || selectedCapability
                    const orgName = person.headline?.split('@')[1]?.trim() || person.headline?.split('·')[1]?.trim() || 'Verified Enterprise Partner'

                    return (
                      <div
                        key={`issuer_${person.id}`}
                        className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs hover:border-[#A64532] hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        {/* Top Dark ConnectLn Dossier Header Strip */}
                        <div className="bg-[#1C1916] px-3.5 py-2 flex items-center justify-between gap-2 text-white border-b border-zinc-800">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-[#A64532] text-[9px] font-black text-white">
                              C
                            </span>
                            <span className="font-mono text-[10px] font-bold text-amber-300">{serialCode}</span>
                            <span className="rounded-full bg-[#A64532] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                              ⚡ Issuing Tickets
                            </span>
                          </div>
                          {person.matchScore && (
                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                              🎯 {person.matchScore}% Scope Match
                            </span>
                          )}
                        </div>

                        {/* Horizontal Dossier Body (Squircle Avatar on Left + Details on Right) */}
                        <div className="p-3.5 space-y-3">
                          <div className="flex items-start gap-3.5">
                            <div
                              onClick={() => onSelectMember?.(person)}
                              className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-[#A64532] bg-zinc-900 shrink-0 cursor-pointer shadow-sm group-hover:scale-103 transition-transform"
                              title={`Inspect ${person.name}'s Dossier`}
                            >
                              <img
                                src={person.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.name)}&backgroundColor=a64532`}
                                alt={person.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.name)}&backgroundColor=a64532`
                                }}
                              />
                              <span className="absolute bottom-0 right-0 rounded-tl-md bg-[#1C1916] px-1 py-0.2 text-[8px] font-black text-amber-300 border-t border-l border-amber-500/40">
                                L4
                              </span>
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4
                                  onClick={() => onSelectMember?.(person)}
                                  className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 hover:text-[#A64532] cursor-pointer truncate"
                                >
                                  {person.name}
                                </h4>
                                <ShieldCheck className="h-4 w-4 text-[#0A66C2] shrink-0" />
                              </div>
                              <p
                                onClick={() => onSelectMember?.(person)}
                                className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-snug cursor-pointer"
                              >
                                {person.headline}
                              </p>
                            </div>
                          </div>

                          {/* Active Contract / Ticket Scope Box (Replaces LinkedIn's "Hiring at...") */}
                          <div className="rounded-xl bg-[#FAF6F0] dark:bg-zinc-900 border border-[#E6DEC8] dark:border-zinc-800 px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
                            <div className="min-w-0">
                              <span className="font-extrabold text-[#A64532] dark:text-amber-400 uppercase text-[9px] tracking-wider block">
                                Active Ticket Scope · {orgName}
                              </span>
                              <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                                Commissioning verified {primaryCap} deliverables
                              </p>
                            </div>
                            <span className="rounded-md bg-[#1C1916] text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 shrink-0">
                              {ticketCount} Tickets
                            </span>
                          </div>

                          {/* 3-Column ConnectLn Ticket & Vouch Ledger Strip */}
                          <div className="grid grid-cols-3 gap-1.5 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900/70 p-2 border border-zinc-200/60 dark:border-zinc-800 text-[10px]">
                            <div>
                              <span className="text-zinc-400 block">Issued Tickets</span>
                              <span className="font-black text-zinc-900 dark:text-white">🎫 {ticketCount} Verified</span>
                            </div>
                            <div className="border-x border-zinc-200 dark:border-zinc-800">
                              <span className="text-zinc-400 block">Peer Vouches</span>
                              <span className="font-black text-[#0A66C2] dark:text-sky-400">🤝 {vouchCount} Vouches</span>
                            </div>
                            <div>
                              <span className="text-zinc-400 block">Clearance</span>
                              <span className="font-black text-emerald-600 dark:text-emerald-400">✓ Guild Verified</span>
                            </div>
                          </div>
                        </div>

                        {/* Dossier Action Footer */}
                        <div className="px-3.5 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                          <button
                            onClick={() => onSelectMember?.(person)}
                            className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            Inspect Dossier
                          </button>
                          <button
                            onClick={() => onNavigateMessaging && onNavigateMessaging(person)}
                            className="rounded-xl border border-[#0A66C2] px-3 py-1.5 text-[11px] font-bold text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>➤ Dispatch DM</span>
                          </button>
                          <button
                            onClick={() => {
                              if (person.isConnected) {
                                setActiveTab('connections')
                                return
                              }
                              handleSendConnectionWithNote(person.id)
                            }}
                            className={`ml-auto rounded-xl px-3.5 py-1.5 text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                              person.isConnected
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : person.isPending
                                ? "border border-zinc-300 text-zinc-500"
                                : "bg-[#A64532] hover:bg-[#8E3929] text-white shadow-2xs"
                            }`}
                          >
                            {person.isConnected ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Vouched</span>
                              </>
                            ) : person.isPending ? (
                              <span>Pending</span>
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3" />
                                <span>Vouch &amp; Connect</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════════════ */}
              {/* SECTION 2: VERIFIED GUILD PEERS & VOUCH-READY SPECIALISTS              */}
              {/* ═══════════════════════════════════════════════════════════════════════ */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#0A66C2] text-[10px] font-black text-white">C</span>
                    <span>Verified Guild Peers &amp; Vouch-Ready Specialists in</span>
                    <span className="text-[#0A66C2] font-black">{selectedCapability}</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Practitioners matched by verified ticket history, trade licenses, and mutual guild vouches.
                  </p>
                </div>
                <span className="text-xs text-zinc-500 font-bold font-mono">
                  {filteredPeople.length} Verified Dossiers
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPeople.map((person, idx) => {
                  const completedTickets = 8 + ((idx * 5) % 22)
                  const peerVouches = person.mutualConnections || (6 + idx * 2)
                  const dossierId = `CLN-${String(104 + idx)}`

                  return (
                    <div
                      key={person.id}
                      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xs hover:border-[#0A66C2] hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between group"
                    >
                      <div>
                        {/* ConnectLn Dossier Top Status Strip (No LinkedIn Cover Photo + Overlapping Circle) */}
                        <div className="bg-[#171513] px-3.5 py-2 flex items-center justify-between text-white border-b border-zinc-800">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-[#0A66C2] text-[9px] font-black text-white">
                              C
                            </span>
                            <span className="font-mono text-[10px] font-bold text-zinc-300">{dossierId}</span>
                            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.2 text-[9px] font-extrabold text-emerald-300">
                              🛡️ Ready for Dispatch
                            </span>
                          </div>
                          {person.matchScore && (
                            <span className="text-[10px] font-mono font-bold text-amber-300">
                              {person.matchScore}% Match
                            </span>
                          )}
                        </div>

                        <div className="p-4 space-y-3">
                          {/* Side-by-Side Squircle Avatar + Identity */}
                          <div className="flex items-start gap-3">
                            <div
                              onClick={() => onSelectMember?.(person)}
                              className="relative h-14 w-14 rounded-2xl border-2 border-[#0A66C2] bg-zinc-900 overflow-hidden shrink-0 cursor-pointer shadow-xs group-hover:scale-103 transition-transform"
                              title={`Open ${person.name}'s Dossier`}
                            >
                              <img
                                src={person.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.name)}&backgroundColor=0a66c2`}
                                alt={person.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.name)}&backgroundColor=0a66c2`
                                }}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <h4
                                  onClick={() => onSelectMember?.(person)}
                                  className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 hover:text-[#0A66C2] cursor-pointer truncate"
                                  title={`Open ${person.name}'s Dossier`}
                                >
                                  {person.name}
                                </h4>
                                <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                              </div>
                              <p
                                onClick={() => onSelectMember?.(person)}
                                className="text-xs text-zinc-500 line-clamp-2 mt-0.5 dark:text-zinc-400 leading-snug cursor-pointer"
                              >
                                {person.headline}
                              </p>
                            </div>
                          </div>

                          {/* Ticket & Vouch Mini Ledger */}
                          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-2 border border-zinc-200/70 dark:border-zinc-800 text-[10px]">
                            <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                              <span>🎫</span>
                              <span>{completedTickets} Verified Tickets</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-[#0A66C2] dark:text-sky-400">
                              <span>🤝</span>
                              <span>{peerVouches} Peer Vouches</span>
                            </div>
                          </div>

                          {/* Verified Badges & Capabilities */}
                          {person.capabilities && (
                            <div className="flex flex-wrap gap-1">
                              {person.capabilities.slice(0, 3).map((rawCap: any, capIdx: number) => {
                                const cap = typeof rawCap === "string" ? rawCap : String(rawCap?.name || rawCap || "")
                                if (!cap) return null
                                return (
                                  <span
                                    key={`${cap}_${capIdx}`}
                                    onClick={() => setSelectedCapability(cap)}
                                    className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold cursor-pointer transition-colors ${
                                      selectedCapability === cap
                                        ? "bg-[#0A66C2] text-white font-bold"
                                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                                    }`}
                                  >
                                    {cap}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom ConnectLn Dossier Actions */}
                      <div className="p-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectMember?.(person)}
                          className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 py-1.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title={`Inspect ${person.name}'s Dossier`}
                        >
                          <span>Dossier</span>
                        </button>

                        <button
                          onClick={() => onNavigateMessaging && onNavigateMessaging(person)}
                          className="flex-1 rounded-xl border border-[#0A66C2] py-1.5 text-[11px] font-bold text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title={`Message ${person.name}`}
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>DM</span>
                        </button>

                        <button
                          onClick={() => {
                            if (person.isConnected) {
                              setActiveTab('connections')
                              return
                            }
                            handleSendConnectionWithNote(person.id)
                          }}
                          className={`flex-1 rounded-xl py-1.5 text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            person.isConnected
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : person.isPending
                              ? "border border-zinc-300 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
                              : "bg-[#0A66C2] text-white hover:bg-[#004182] shadow-2xs"
                          }`}
                        >
                          {person.isConnected ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Vouched</span>
                            </>
                          ) : person.isPending ? (
                            <span>Pending</span>
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3" />
                              <span>Vouch</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setWarmIntroTarget(person)
                            setIsWarmIntroOpen(true)
                          }}
                          className="rounded-xl bg-amber-50 p-1.5 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 shrink-0 cursor-pointer"
                          title="AI Warm Intro Request"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        </button>
                      </div>
                    </div>
                  )
                })}
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
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(evt.person.name)}&backgroundColor=0a66c2`
                        }}
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
          targetPerson={warmIntroTarget}
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
