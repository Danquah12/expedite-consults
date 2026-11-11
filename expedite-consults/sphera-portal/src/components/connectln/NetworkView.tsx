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
  ArrowRight,
  Eye,
  TrendingUp
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
import {
  loadLiveUserTelemetry,
  syncLiveUserTelemetryFromCloud,
  recordLiveContentReach,
  recordLiveDirectoryDiscovery,
  loadViewerPrivacyMode,
  saveViewerPrivacyMode,
  formatViewerForPrivacy,
  formatProfileViewDateTime,
  ViewerPrivacyMode,
  getProfileTailoredAnalytics
} from "@/lib/connectin-analytics"
import {
  loadUserFollowBundle,
  syncUserFollowBundleFromCloud,
  getFollowRelationshipState,
  followMember,
  unfollowMember,
  blockMemberForFollow,
  unblockMemberForFollow,
  updateFollowPrivacySettings,
  normalizeFollowKey
} from "@/lib/connectin-follow"

interface NetworkViewProps {
  suggestedPeople: SuggestedConnection[]
  onToggleConnect: (personId: string) => void
  onSelectMember?: (member: any) => void
  currentUser?: UserProfile
  onNavigateMessaging?: (person?: any) => void
  onUpdateConnectionsCount?: (newCount: number) => void
  initialSubTab?:
    | 'people'
    | 'connections'
    | 'followers'
    | 'following'
    | 'received_invites'
    | 'sent_invites'
    | 'profile_viewers'
    | 'pymk'
    | 'invitations'
    | 'sent'
  resetTrigger?: number
}

export function getEnclaveCapabilityFilters(enclaveId?: string) {
  const sharedCrossPills = [
    { id: 'Professions LinkedIn Ignored', label: 'Professions LinkedIn Ignored (CDL, Lineman, Elevator, EVS)', icon: '🛠️' },
    { id: 'Veterans & DoD SkillBridge', label: 'Veterans, SkillBridge & SDVOSB', icon: '🎖️' },
    { id: 'Cloud Security', label: 'Cybersecurity, SOC & Red Team', icon: '🛡️' },
  ]
  if (enclaveId === 'trades_construction') {
    return [
      { id: 'All', label: 'All Trade & Essential Disciplines', icon: '🌐' },
      ...sharedCrossPills,
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
      ...sharedCrossPills,
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
      ...sharedCrossPills,
      { id: 'CAN-Bus Oscilloscope', label: 'CAN-Bus Oscilloscope', icon: '⚡' },
      { id: '800V EV Lockout', label: '800V EV Safety & Inverters', icon: '🔋' },
      { id: 'Cummins Fleet', label: 'Cummins & Fleet Diesel', icon: '🚚' },
      { id: 'Automotive Diagnostics & EV', label: 'Automotive Diagnostics', icon: '🔧' },
      { id: 'Transmission Rebuild', label: 'Transmission Rebuild & Dyno', icon: '⚙️' }
    ]
  }
  return [
    { id: 'All', label: 'All Capabilities', icon: '🌐' },
    { id: 'Professions LinkedIn Ignored', label: 'Professions LinkedIn Ignored (CDL, Lineman, Elevator, EVS)', icon: '🛠️' },
    { id: 'Veterans & DoD SkillBridge', label: 'Veterans, SkillBridge & SDVOSB', icon: '🎖️' },
    { id: 'Cloud Security', label: 'Cloud Security & Zero Trust', icon: '🛡️' },
    { id: 'Penetration Testing', label: 'Penetration Testing & Red Team', icon: '🎯' },
    { id: 'SOC SIEM & Sigma Threat Hunting', label: 'SOC SIEM & DFIR Forensics', icon: '🔍' },
    { id: 'AI Security', label: 'AI & LLM Security', icon: '🤖' },
    { id: 'DevSecOps', label: 'AppSec & DevSecOps', icon: '⚡' },
    { id: 'RMF', label: 'GRC, CMMC & DoD RMF', icon: '🏛️' },
    { id: 'SCADA / OT Security', label: 'OT / ICS / SCADA Security', icon: '🏭' }
  ]
}

export function NetworkView({
  suggestedPeople,
  onToggleConnect,
  onSelectMember,
  currentUser = defaultUser,
  onNavigateMessaging,
  onUpdateConnectionsCount,
  initialSubTab,
  resetTrigger
}: NetworkViewProps) {
  const enclaveId = currentUser?.professionEnclave
  const capabilityFilters = getEnclaveCapabilityFilters(enclaveId)

  const normalizeSubTab = (
    tab?: NetworkViewProps['initialSubTab']
  ):
    | 'people'
    | 'connections'
    | 'followers'
    | 'following'
    | 'received_invites'
    | 'sent_invites'
    | 'profile_viewers' => {
    if (!tab || tab === 'connections') return 'connections'
    if (tab === 'pymk' || tab === 'people') return 'people'
    if (tab === 'invitations' || tab === 'received_invites') return 'received_invites'
    if (tab === 'sent' || tab === 'sent_invites') return 'sent_invites'
    return tab
  }

  const [activeTab, setActiveTab] = useState<
    | 'people'
    | 'connections'
    | 'followers'
    | 'following'
    | 'received_invites'
    | 'sent_invites'
    | 'profile_viewers'
    | 'companies'
    | 'organizations'
    | 'circles'
    | 'topics'
    | 'catchup'
  >(() => normalizeSubTab(initialSubTab))
  const [followBundle, setFollowBundle] = useState(() => loadUserFollowBundle(currentUser?.name))
  const [telemetryViewSubTab, setTelemetryViewSubTab] = useState<'viewers' | 'reach' | 'discoveries'>('viewers')
  const [reachKindFilter, setReachKindFilter] = useState<'all' | 'view' | 'interaction'>('all')
  const [discoveryTypeFilter, setDiscoveryTypeFilter] = useState<'all' | 'search_appearance' | 'profile_click'>('all')
  const [viewerPrivacyMode, setViewerPrivacyMode] = useState<ViewerPrivacyMode>(() => loadViewerPrivacyMode(currentUser?.name))
  const [liveTelemetry, setLiveTelemetry] = useState(() => loadLiveUserTelemetry(currentUser?.name))
  const tailoredTelemetry = React.useMemo(
    () => getProfileTailoredAnalytics(currentUser),
    [currentUser, liveTelemetry]
  )

  useEffect(() => {
    setActiveTab(normalizeSubTab(initialSubTab))
  }, [initialSubTab, resetTrigger])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const refreshFollow = () => setFollowBundle(loadUserFollowBundle(currentUser?.name))
    refreshFollow()
    window.addEventListener('connectln-follow-updated', refreshFollow)
    if (currentUser?.name) {
      syncUserFollowBundleFromCloud(currentUser.name).then(b => setFollowBundle(b)).catch(() => {})
    }
    const followTimer = setInterval(() => {
      if (currentUser?.name) {
        syncUserFollowBundleFromCloud(currentUser.name).then(b => setFollowBundle(b)).catch(() => {})
      }
    }, 5000)
    return () => {
      window.removeEventListener('connectln-follow-updated', refreshFollow)
      clearInterval(followTimer)
    }
  }, [currentUser?.name])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const refresh = () => setLiveTelemetry(loadLiveUserTelemetry(currentUser?.name))
    refresh()
    window.addEventListener('connectln-telemetry-updated', refresh)
    if (currentUser?.name) {
      syncLiveUserTelemetryFromCloud(currentUser.name).then(b => setLiveTelemetry(b)).catch(() => {})
    }
    const timer = setInterval(() => {
      if (currentUser?.name) {
        syncLiveUserTelemetryFromCloud(currentUser.name).then(b => setLiveTelemetry(b)).catch(() => {})
      }
    }, 5000)
    return () => {
      window.removeEventListener('connectln-telemetry-updated', refresh)
      clearInterval(timer)
    }
  }, [currentUser?.name])

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

  // Per-User Scoped Storage Namespace so every new user starts with 0 Connections, 0 Sent Invites, and 0 Received Invites
  const userScopeKey = React.useMemo(() => {
    const emailPart = String((currentUser as any)?.email || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_')
    const namePart = String(currentUser?.name || 'guest')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_')
    return `${emailPart}__${namePart}`
  }, [(currentUser as any)?.email, currentUser?.name])

  // Persistent Accepted Connections (Strictly: Invitations Sent & Accepted + Invitations Received & Accepted)
  const [customConnections, setCustomConnections] = useState<ConnectedMember[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(`connectin_accepted_v7_${userScopeKey}`)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [cloudAcceptedConnections, setCloudAcceptedConnections] = useState<ConnectedMember[]>([])
  const [cloudReceivedInvites, setCloudReceivedInvites] = useState<any[]>([])

  const [removedConnectionNames, setRemovedConnectionNames] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(`connectin_removed_v6_${userScopeKey}`)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [handledInviteNames, setHandledInviteNames] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(`connectin_handled_v6_${userScopeKey}`)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const saveHandledInviteNames = (next: string[]) => {
    setHandledInviteNames(next)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`connectin_handled_v6_${userScopeKey}`, JSON.stringify(next))
      } catch {}
    }
  }

  const [outboundInvites, setOutboundInvites] = useState<OutboundInvitation[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(`connectin_outbound_v6_${userScopeKey}`)
      const parsed = raw ? JSON.parse(raw) : []
      if (!Array.isArray(parsed)) return []
      return parsed.filter(
        (inv: any) =>
          inv &&
          inv.id !== 'out_1' &&
          inv.id !== 'out_2' &&
          inv.status !== 'accepted'
      )
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const rawAccepted = localStorage.getItem(`connectin_accepted_v7_${userScopeKey}`)
      setCustomConnections(rawAccepted ? JSON.parse(rawAccepted) : [])

      const rawOutbound = localStorage.getItem(`connectin_outbound_v6_${userScopeKey}`)
      setOutboundInvites(rawOutbound ? JSON.parse(rawOutbound) : [])

      const rawHandled = localStorage.getItem(`connectin_handled_v6_${userScopeKey}`)
      setHandledInviteNames(rawHandled ? JSON.parse(rawHandled) : [])

      const rawRemoved = localStorage.getItem(`connectin_removed_v6_${userScopeKey}`)
      setRemovedConnectionNames(rawRemoved ? JSON.parse(rawRemoved) : [])

      setCloudReceivedInvites([])
      setCloudAcceptedConnections([])
    } catch {
      // ignore
    }
  }, [userScopeKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`connectin_outbound_v6_${userScopeKey}`, JSON.stringify(outboundInvites))
    } catch {
      // ignore
    }
  }, [outboundInvites, userScopeKey])

  const [catchUpEvents, setCatchUpEvents] = useState<CatchUpEvent[]>(initialCatchUpEvents)
  const [companies, setCompanies] = useState<CompanyNetworkItem[]>(() => getEnclaveCompanies(enclaveId))
  const [organizations, setOrganizations] = useState<OrganizationNetworkItem[]>(() => getEnclaveOrganizations(enclaveId))
  const [circles, setCircles] = useState<ProfessionalCircleItem[]>(() => getEnclaveCircles(enclaveId))
  const [topics, setTopics] = useState<FollowedTopicItem[]>(() => getEnclaveTopics(enclaveId))
  const [baseEnclaveInvitations, setBaseEnclaveInvitations] = useState<any[]>(() => getEnclaveInvitations(enclaveId))

  useEffect(() => {
    setCompanies(getEnclaveCompanies(enclaveId))
    setOrganizations(getEnclaveOrganizations(enclaveId))
    setCircles(getEnclaveCircles(enclaveId))
    setTopics(getEnclaveTopics(enclaveId))
    setBaseEnclaveInvitations(getEnclaveInvitations(enclaveId))
    setSelectedCapability('All')
  }, [enclaveId])

  // Sync local outbound invites to cloud & fetch live received/sent/accepted invitations from /api/connectin/invite
  const syncInvitationsWithCloud = React.useCallback(async () => {
    if (typeof window === 'undefined') return
    const userName = String(currentUser?.name || '').trim()
    const userEmail = String((currentUser as any)?.email || '').trim()
    try {
      const res = await fetch(
        `/api/connectin/invite?user=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}`,
        { cache: 'no-store' }
      )
      if (!res.ok) return
      const data = await res.json()

      if (Array.isArray(data.receivedInvites)) {
        setCloudReceivedInvites(data.receivedInvites)
      }
      const nextCloudAccepted: ConnectedMember[] = Array.isArray(data.acceptedConnections)
        ? data.acceptedConnections
        : []
      if (Array.isArray(data.acceptedConnections)) {
        setCloudAcceptedConnections(nextCloudAccepted)
      }
      if (Array.isArray(data.sentInvites)) {
        const handledSet = new Set(handledInviteNames.map(n => n.toLowerCase().trim()))
        const acceptedNameSet = new Set(
          [...customConnections, ...nextCloudAccepted]
            .map(c => String(c?.name || '').toLowerCase().trim())
            .filter(Boolean)
        )
        const acceptedEmailSet = new Set(
          [...customConnections, ...nextCloudAccepted]
            .map(c => String((c as any)?.email || '').toLowerCase().trim())
            .filter(Boolean)
        )
        const map = new Map<string, OutboundInvitation>()
        for (const item of data.sentInvites) {
          if (!item || !item.name || item.id === 'out_1' || item.id === 'out_2') continue
          const norm = String(item.name).toLowerCase().trim()
          const normEmail = String(item.email || '').toLowerCase().trim()
          if (
            !norm ||
            handledSet.has(norm) ||
            acceptedNameSet.has(norm) ||
            (normEmail && acceptedEmailSet.has(normEmail)) ||
            item.status === 'accepted'
          ) {
            continue
          }
          if (!map.has(norm)) {
            map.set(norm, item)
          }
        }
        setOutboundInvites(Array.from(map.values()))
      }
    } catch {
      // ignore network error
    }
  }, [currentUser?.name, (currentUser as any)?.email, handledInviteNames, customConnections])

  useEffect(() => {
    syncInvitationsWithCloud()
    const timer = setInterval(syncInvitationsWithCloud, 4000)
    return () => clearInterval(timer)
  }, [syncInvitationsWithCloud])

  // Build unified, deduplicated 1st-degree connections list:
  // STRICTLY EQUAL TO: (Invitations Sent & Accepted) + (Invitations Received & Accepted)
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

    // 1. Local Accepted Invitations (Sent & Accepted + Received & Accepted)
    for (const c of customConnections) {
      pushUnique(c)
    }

    // 2. Cloud-Synced Accepted Invitations (Sent & Accepted + Received & Accepted)
    for (const c of cloudAcceptedConnections) {
      pushUnique(c)
    }

    return list
  }, [customConnections, cloudAcceptedConnections, removedConnectionNames, currentUser?.name])

  const connectedNamesSet = React.useMemo(
    () => new Set(connections.map(c => c.name.toLowerCase().trim())),
    [connections]
  )

  // Guarantee that any user in My Connections is immediately purged from Invitations Sent (-1)
  useEffect(() => {
    if (connections.length === 0) return
    const connNames = new Set(connections.map(c => String(c.name || '').toLowerCase().trim()).filter(Boolean))
    const connEmails = new Set(connections.map(c => String((c as any).email || '').toLowerCase().trim()).filter(Boolean))
    setOutboundInvites(prev => {
      const filtered = prev.filter(inv => {
        const n = String(inv?.name || '').toLowerCase().trim()
        const e = String(inv?.email || '').toLowerCase().trim()
        if (n && connNames.has(n)) return false
        if (e && connEmails.has(e)) return false
        return true
      })
      return filtered.length === prev.length ? prev : filtered
    })
  }, [connections])

  const sentAcceptedCount = React.useMemo(
    () =>
      connections.filter(
        c =>
          (c as any).originType === 'sent_accepted' ||
          String(c.connectedSince || '').toLowerCase().includes('sent')
      ).length,
    [connections]
  )

  const receivedAcceptedCount = React.useMemo(
    () => Math.max(0, connections.length - sentAcceptedCount),
    [connections.length, sentAcceptedCount]
  )

  // Build live LinkedIn-style Invitations Received list: ONLY invitations sent TO currentUser by other users
  const invitations: any[] = React.useMemo(() => {
    const handledSet = new Set(handledInviteNames.map(n => n.toLowerCase().trim()))
    const myNorm = String(currentUser?.name || '').toLowerCase().trim()
    const seen = new Set<string>()
    const list: any[] = []

    const pushInvite = (inv: any) => {
      if (!inv || !inv.name) return
      const norm = String(inv.name).toLowerCase().trim()
      if (!norm || norm === myNorm || connectedNamesSet.has(norm) || handledSet.has(norm) || seen.has(norm)) return
      seen.add(norm)
      list.push(inv)
    }

    for (const inv of cloudReceivedInvites) {
      pushInvite(inv)
    }

    return list
  }, [cloudReceivedInvites, connectedNamesSet, handledInviteNames, currentUser?.name])

  const receivedInviteByNameMap = React.useMemo(() => {
    const m = new Map<string, any>()
    for (const inv of invitations) {
      if (inv?.name) m.set(String(inv.name).toLowerCase().trim(), inv)
    }
    return m
  }, [invitations])

  const pendingNamesSet = React.useMemo(() => {
    const s = new Set<string>()
    for (const o of outboundInvites) {
      if (o?.name) s.add(o.name.toLowerCase().trim())
    }
    return s
  }, [outboundInvites])

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
        localStorage.setItem(`connectin_accepted_v7_${userScopeKey}`, JSON.stringify(next))
      } catch {}
    }
  }

  const saveRemovedConnectionNames = (next: string[]) => {
    setRemovedConnectionNames(next)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`connectin_removed_v6_${userScopeKey}`, JSON.stringify(next))
      } catch {}
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Accept Inbound Invitation -> Moves from Invitations Received to My Connections
  const handleAcceptInvite = (id: string) => {
    const invite = invitations.find(inv => inv.id === id)
    if (!invite) return

    const normInviteName = invite.name.toLowerCase().trim()
    const wasSentByMe =
      Boolean(invite.isFromOutbound) ||
      outboundInvites.some(o => o.name.toLowerCase().trim() === normInviteName) ||
      (invite.senderName && String(invite.senderName).toLowerCase().trim() === String(currentUser?.name || '').toLowerCase().trim())

    // Mark as handled so it leaves pending lists
    if (!handledInviteNames.some(n => n.toLowerCase().trim() === normInviteName)) {
      saveHandledInviteNames([...handledInviteNames, normInviteName])
    }
    setOutboundInvites(prev => prev.filter(o => o.name.toLowerCase().trim() !== normInviteName))
    setCloudReceivedInvites(prev => prev.filter(i => i.id !== id && String(i.name || '').toLowerCase().trim() !== normInviteName))

    if (removedConnectionNames.some(n => n.toLowerCase().trim() === normInviteName)) {
      saveRemovedConnectionNames(removedConnectionNames.filter(n => n.toLowerCase().trim() !== normInviteName))
    }

    // Add to My Connections (1st-degree)
    const newConn: ConnectedMember = {
      id: 'conn_' + Date.now(),
      name: invite.name,
      headline: invite.headline,
      avatar: invite.avatar,
      connectedSince: wasSentByMe ? 'Invitation Sent · Accepted' : 'Invitation Received · Accepted',
      capabilities: invite.capabilities || ['Verified Specialist'],
      verifiedBadges: [wasSentByMe ? '✓ Invitation Sent & Accepted' : '✓ Invitation Received & Accepted'],
      mutualCount: invite.mutualCount || 15,
      isOnline: true,
      email: invite.email,
      ...(wasSentByMe ? { originType: 'sent_accepted' } : { originType: 'received_accepted' })
    } as ConnectedMember

    saveCustomConnections([newConn, ...customConnections.filter(c => c.name.toLowerCase().trim() !== normInviteName)])

    // Also remove currentUser from the sender's local Invitations Sent if on the same browser
    if (typeof window !== 'undefined' && currentUser?.name) {
      try {
        const senderSlug = normInviteName.replace(/[^a-z0-9]/g, '_')
        const myNormName = String(currentUser.name || '').toLowerCase().trim()
        const myNormEmail = String((currentUser as any)?.email || '').toLowerCase().trim()
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (!k) continue
          if (k.startsWith('connectin_outbound_v6_') && k.endsWith(`__${senderSlug}`)) {
            const rawOut = localStorage.getItem(k)
            const outList = rawOut ? JSON.parse(rawOut) : []
            if (Array.isArray(outList)) {
              const nextOut = outList.filter((item: any) => {
                const n = String(item?.name || '').toLowerCase().trim()
                const e = String(item?.email || '').toLowerCase().trim()
                if (n && n === myNormName) return false
                if (myNormEmail && e && e === myNormEmail) return false
                return true
              })
              localStorage.setItem(k, JSON.stringify(nextOut))
            }
          }
        }
      } catch {}
    }

    fetch('/api/connectin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_status',
        cid: invite.cid || invite.id,
        senderName: invite.senderName || invite.name,
        recipientName: currentUser?.name || invite.recipientName || invite.name,
        recipientEmail: (currentUser as any)?.email || '',
        recipientHeadline: currentUser?.headline || '',
        status: 'accepted'
      })
    })
      .then(() => syncInvitationsWithCloud())
      .catch(() => {})

    showToast(`🎉 Invitation accepted! ${invite.name} is now in My Connections (${connections.length + 1} Connections).`)
  }

  // Handle Accept Outbound Invitation -> Moves from Invitations Sent to My Connections
  const handleAcceptOutboundInvite = (id: string) => {
    const inv = outboundInvites.find(i => i.id === id)
    if (!inv) return

    const normName = inv.name.toLowerCase().trim()
    if (!handledInviteNames.some(n => n.toLowerCase().trim() === normName)) {
      saveHandledInviteNames([...handledInviteNames, normName])
    }
    setOutboundInvites(prev => prev.filter(i => i.id !== id && i.name.toLowerCase().trim() !== normName))
    setCloudReceivedInvites(prev => prev.filter(i => String(i.name || '').toLowerCase().trim() !== normName))

    if (removedConnectionNames.some(n => n.toLowerCase().trim() === normName)) {
      saveRemovedConnectionNames(removedConnectionNames.filter(n => n.toLowerCase().trim() !== normName))
    }

    const newConn: ConnectedMember = {
      id: 'conn_sent_' + Date.now(),
      name: inv.name,
      headline: inv.headline,
      avatar: inv.avatar,
      connectedSince: 'Invitation Sent · Accepted',
      capabilities: ['Verified Specialist'],
      verifiedBadges: ['✓ Invitation Sent & Accepted'],
      mutualCount: 18,
      isOnline: true,
      email: inv.email,
      originType: 'sent_accepted'
    } as ConnectedMember

    saveCustomConnections([newConn, ...customConnections.filter(c => c.name.toLowerCase().trim() !== normName)])

    fetch('/api/connectin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_status',
        cid: (inv as any).cid || inv.id,
        senderName: currentUser?.name || 'Member',
        recipientName: inv.name,
        recipientEmail: inv.email || '',
        status: 'accepted'
      })
    })
      .then(() => syncInvitationsWithCloud())
      .catch(() => {})

    showToast(`🎉 Invitation Sent to ${inv.name} Accepted! Added to My Connections (${connections.length + 1} Connections).`)
  }

  // Handle Ignore Inbound Invitation
  const handleIgnoreInvite = (id: string) => {
    const invite = invitations.find(inv => inv.id === id)
    if (invite) {
      const normName = invite.name.toLowerCase().trim()
      if (!handledInviteNames.some(n => n.toLowerCase().trim() === normName)) {
        saveHandledInviteNames([...handledInviteNames, normName])
      }
      setOutboundInvites(prev => prev.filter(o => o.name.toLowerCase().trim() !== normName))
      setCloudReceivedInvites(prev => prev.filter(i => i.id !== id && String(i.name || '').toLowerCase().trim() !== normName))
      fetch('/api/connectin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          cid: invite.cid || invite.id,
          senderName: invite.senderName || invite.name,
          recipientName: currentUser?.name || invite.recipientName || invite.name,
          recipientEmail: (currentUser as any)?.email || '',
          status: 'ignored'
        })
      })
        .then(() => syncInvitationsWithCloud())
        .catch(() => {})
      showToast(`Invitation from ${invite.name} ignored.`)
    }
  }

  // Handle Withdraw Outbound Invite
  const handleWithdrawOutbound = (id: string) => {
    const inv = outboundInvites.find(i => i.id === id)
    setOutboundInvites(prev => prev.filter(i => i.id !== id))
    if (inv) {
      const normName = inv.name.toLowerCase().trim()
      if (!handledInviteNames.some(n => n.toLowerCase().trim() === normName)) {
        saveHandledInviteNames([...handledInviteNames, normName])
      }
      setCloudReceivedInvites(prev => prev.filter(i => String(i.name || '').toLowerCase().trim() !== normName))
      fetch('/api/connectin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          cid: (inv as any).cid || inv.id,
          senderName: currentUser?.name || 'Member',
          recipientName: inv.name,
          recipientEmail: inv.email || '',
          status: 'withdrawn'
        })
      })
        .then(() => syncInvitationsWithCloud())
        .catch(() => {})
    }
    showToast(`Invitation withdrawn successfully.`)
  }

  // Handle Resend Outbound Invite
  const handleResendOutbound = async (id: string) => {
    const inv = outboundInvites.find(i => i.id === id)
    if (!inv) return

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.connectln.app"
    const cleanInvName = (inv.name || "").replace(/^Invited Colleague\s*\(.*\)$/i, "").trim()

    if (inv.phone) {
      showToast(`Resending SMS invite to ${inv.phone}...`)
      try {
        const q = new URLSearchParams({
          invite: "accept",
          inviter: currentUser.name,
          invitedPhone: inv.phone,
          ...(cleanInvName ? { invitedName: cleanInvName } : {})
        })
        const res = await fetch("/api/connectin/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "sms",
            recipients: [inv.phone],
            recipientName: cleanInvName,
            senderName: currentUser.name,
            senderHeadline: currentUser.headline,
            inviteLink: `${baseUrl}/connectin-login?${q.toString()}`
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
        const q = new URLSearchParams({
          invite: "accept",
          inviter: currentUser.name,
          invitedEmail: inv.email,
          ...(cleanInvName ? { invitedName: cleanInvName } : {})
        })
        const res = await fetch("/api/connectin/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "email",
            recipients: [inv.email],
            recipientName: cleanInvName,
            senderName: currentUser.name,
            senderHeadline: currentUser.headline,
            inviteLink: `${baseUrl}/connectin-login?${q.toString()}`
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
      showToast(`Reminder invitation dispatched to ${inv.name}.`)
    }
  }

  // Handle Send Connection Invitation — adds to Invitations Sent & syncs to Invitations Received (moves to My Connections when Accepted!)
  const handleSendConnectionWithNote = (personId: string, note?: string) => {
    const person = suggestedPeople.find(p => p.id === personId)
    if (!person) return

    const normName = person.name.toLowerCase().trim()
    // Remove from handled/ignored set if re-inviting
    if (handledInviteNames.some(n => n.toLowerCase().trim() === normName)) {
      saveHandledInviteNames(handledInviteNames.filter(n => n.toLowerCase().trim() !== normName))
    }

    const itemCid = `cin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`
    const newOutbound: OutboundInvitation = {
      id: `out_${itemCid}`,
      name: person.name,
      headline: person.headline,
      avatar: person.avatar,
      sentAt: 'Just now',
      customNote: note,
      status: 'pending',
      type: 'person',
      ...( { cid: itemCid } as any )
    }

    setOutboundInvites(prev => {
      const next = [newOutbound, ...prev.filter(p => p.name.toLowerCase().trim() !== normName)]
      try {
        localStorage.setItem(`connectin_outbound_v6_${userScopeKey}`, JSON.stringify(next))
      } catch {}
      return next
    })

    const safeSenderAvatar =
      currentUser?.avatar && !currentUser.avatar.startsWith('data:')
        ? currentUser.avatar
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || 'Member')}&backgroundColor=0a66c2`
    const safeRecipAvatar =
      person.avatar && !person.avatar.startsWith('data:')
        ? person.avatar
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.name || 'Member')}&backgroundColor=0a66c2`

    fetch("/api/connectin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "member_connect",
        cid: itemCid,
        recipientName: person.name,
        recipientHeadline: person.headline,
        recipientAvatar: safeRecipAvatar,
        recipients: (person as any).email ? [(person as any).email] : [],
        senderName: currentUser.name,
        senderEmail: (currentUser as any).email || "",
        senderHeadline: currentUser.headline,
        senderAvatar: safeSenderAvatar,
        customNote: note || ""
      })
    })
      .then(() => syncInvitationsWithCloud())
      .catch(() => {})

    recordLiveDirectoryDiscovery({
      targetName: person.name,
      keyword: selectedCapability !== 'All' ? `Specialty: ${selectedCapability}` : 'People You May Know Directory',
      searcherName: currentUser.name,
      searcherHeadline: currentUser.headline,
      searcherCompany: currentUser.profession || 'ConnectLn Network',
      source: 'Connection Invitation Sent'
    })
    recordLiveContentReach({
      userName: currentUser.name,
      title: `Sent Connection Invitation to ${person.name}`,
      category: 'Network Invite',
      actorName: currentUser.name,
      details: person.headline
    })

    showToast(`✓ Invitation sent to ${person.name}${note ? ' with note' : ''}! Added to Invitations Sent.`)
  }

  // Handle New Invites from InviteModal (email / sms / link)
  const handleNewOutboundInvites = (newInvites: OutboundInvitation[]) => {
    const newNames = new Set(newInvites.map(i => String(i.name || '').toLowerCase().trim()).filter(Boolean))
    if (newNames.size > 0) {
      saveHandledInviteNames(handledInviteNames.filter(n => !newNames.has(n.toLowerCase().trim())))
    }
    setOutboundInvites(prev => {
      const existingFiltered = prev.filter(p => !newNames.has(p.name.toLowerCase().trim()))
      return [...newInvites, ...existingFiltered]
    })
    setTimeout(() => syncInvitationsWithCloud(), 400)
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

  // Filter People based on Capability, Search, and Enclave Prioritization
  const filteredPeople = suggestedPeople
    .map(p => {
      const norm = String(p.name || '').toLowerCase().trim()
      return {
        ...p,
        isConnected: connectedNamesSet.has(norm),
        isPending: !connectedNamesSet.has(norm) && pendingNamesSet.has(norm)
      }
    })
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

  // Record real Directory Search Appearances (`search_appearance`) when a user searches or filters specialties in Network
  useEffect(() => {
    const trimmedSearch = searchFilter.trim()
    const hasActiveSpecialty = selectedCapability && selectedCapability !== 'All'
    if (!trimmedSearch && !hasActiveSpecialty) return
    if (trimmedSearch && trimmedSearch.length < 2) return
    if (!currentUser?.name) return

    const timer = setTimeout(() => {
      const keywordLabel = trimmedSearch
        ? `Directory Search: "${trimmedSearch}"`
        : `Specialty Filter: "${selectedCapability}"`
      for (const person of filteredPeople.slice(0, 6)) {
        if (!person?.name) continue
        recordLiveDirectoryDiscovery({
          targetName: person.name,
          keyword: keywordLabel,
          searcherName: currentUser.name,
          searcherHeadline: currentUser.headline || currentUser.profession || 'Verified ConnectLn Member',
          searcherCompany: currentUser.profession || 'ConnectLn Network',
          source: 'Directory Search Appearance',
          discoveryType: 'search_appearance'
        })
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [searchFilter, selectedCapability, currentUser?.name])

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

              {/* 1b. Followers (People who follow you — one-way inbound) */}
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'followers'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  <span>Followers</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono font-bold ${
                  activeTab === 'followers'
                    ? "bg-white/20 text-white"
                    : followBundle.followers.length > 0
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {followBundle.followers.length}
                </span>
              </button>

              {/* 1c. Following (People whose updates you follow — one-way outbound) */}
              <button
                onClick={() => setActiveTab('following')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'following'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Following</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono font-bold ${
                  activeTab === 'following'
                    ? "bg-white/20 text-white"
                    : followBundle.following.length > 0
                    ? "bg-[#0A66C2] text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {followBundle.following.length}
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

              {/* 4. Who Viewed My Profile (under Connections) */}
              <button
                onClick={() => setActiveTab('profile_viewers')}
                className={`flex w-full items-center justify-between py-2 px-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'profile_viewers'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Who Viewed My Profile</span>
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono font-bold ${
                  activeTab === 'profile_viewers'
                    ? "bg-white/20 text-white"
                    : liveTelemetry.checks.length > 0
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {liveTelemetry.checks.length}
                </span>
              </button>

              {/* 5. People You May Know */}
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
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 flex-wrap">
                      <span>
                        {filteredConnections.length === totalConnectionsDisplay
                          ? `${totalConnectionsDisplay} Connections`
                          : `${filteredConnections.length} of ${totalConnectionsDisplay} Connections`}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                        1st Degree
                      </span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] border border-blue-200 dark:bg-blue-950 dark:text-sky-300">
                        {sentAcceptedCount} Sent &amp; Accepted + {receivedAcceptedCount} Received &amp; Accepted = {totalConnectionsDisplay}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Strictly equals Invitations Sent &amp; Accepted ({sentAcceptedCount}) + Invitations Received &amp; Accepted ({receivedAcceptedCount}).
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
                              <span
                                className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full flex items-center justify-center"
                                title="Online now"
                              >
                                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                                <span className="relative h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 online-dot-blink" />
                              </span>
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

          {/* TAB: FOLLOWERS & FOLLOWING (ONE-WAY FOLLOW GRAPH, PRIVACY & BLOCKING) */}
          {(activeTab === 'followers' || activeTab === 'following') && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              {/* Top Header + Sub-Tab Switcher (Followers vs Following) */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 flex-wrap">
                    <Radio className="h-4 w-4 text-[#0A66C2]" />
                    <span>
                      {activeTab === 'followers'
                        ? `People Following You (${followBundle.followers.length})`
                        : `People You Follow (${followBundle.following.length})`}
                    </span>
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-sky-300">
                      One-Way Follow Graph · Separate from Connections
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {activeTab === 'followers'
                      ? 'People who choose to receive your public updates in their feed. Following is one-way — click "+ Follow back" if you also want to receive their updates.'
                      : 'People whose public posts and articles you choose to receive in your feed without needing a mutual connection invitation.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('followers')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'followers'
                        ? "bg-[#0A66C2] text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                  >
                    Followers ({followBundle.followers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('following')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'following'
                        ? "bg-[#0A66C2] text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                  >
                    Following ({followBundle.following.length})
                  </button>
                </div>
              </div>

              {/* LinkedIn-Style 3-Relationship Distinction Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#0A66C2] dark:text-sky-400">Following ({followBundle.following.length})</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-500">One-Way Outbound</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                    People whose public updates you choose to receive (e.g., You follow John Sianaa).
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">Followers ({followBundle.followers.length})</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-500">One-Way Inbound</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                    People who choose to receive your public updates (e.g., John follows you).
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-zinc-900 dark:text-zinc-100">Connections ({totalConnectionsDisplay})</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-500">Two-Way Mutual</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                    A relationship both people accept via a connection invitation.
                  </p>
                </div>
              </div>

              {/* Follow Privacy, Visibility, Notifications & Blocking Controls */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#0A66C2]" />
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      Follow Privacy, Notifications &amp; Blocking Settings
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                      <span>Who can follow me:</span>
                      <select
                        value={followBundle.settings.whoCanFollow}
                        onChange={(e) => {
                          if (!currentUser?.name) return
                          const next = updateFollowPrivacySettings(currentUser.name, {
                            whoCanFollow: e.target.value as 'everyone' | 'connections_only'
                          })
                          setFollowBundle(next)
                          setToastMessage(`Follow permission updated: ${e.target.value === 'everyone' ? 'Everyone on ConnectLn' : 'Only 1st-Degree Connections'}`)
                          setTimeout(() => setToastMessage(null), 3000)
                        }}
                        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
                      >
                        <option value="everyone">Everyone on ConnectLn</option>
                        <option value="connections_only">Only 1st-Degree Connections</option>
                      </select>
                    </label>

                    <label className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                      <span>List visibility:</span>
                      <select
                        value={followBundle.settings.whoCanSeeFollowLists}
                        onChange={(e) => {
                          if (!currentUser?.name) return
                          const next = updateFollowPrivacySettings(currentUser.name, {
                            whoCanSeeFollowLists: e.target.value as 'everyone' | 'connections' | 'only_me'
                          })
                          setFollowBundle(next)
                        }}
                        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
                      >
                        <option value="everyone">Everyone</option>
                        <option value="connections">Connections Only</option>
                        <option value="only_me">Only Me</option>
                      </select>
                    </label>

                    <label className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={followBundle.settings.notifyOnNewFollower}
                        onChange={(e) => {
                          if (!currentUser?.name) return
                          const next = updateFollowPrivacySettings(currentUser.name, {
                            notifyOnNewFollower: e.target.checked
                          })
                          setFollowBundle(next)
                        }}
                        className="rounded border-zinc-300 text-[#0A66C2] focus:ring-[#0A66C2]"
                      />
                      <span>Alert on new followers</span>
                    </label>
                  </div>
                </div>

                {/* Blocked Users List (if any) */}
                {followBundle.blockedUsers.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-700/80 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                      Blocked Accounts ({followBundle.blockedUsers.length}):
                    </span>
                    {followBundle.blockedUsers.map((b) => (
                      <span
                        key={b.name}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 dark:text-red-300"
                      >
                        <span>{b.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentUser?.name) return
                            const next = unblockMemberForFollow({
                              actorName: currentUser.name,
                              targetName: b.name
                            })
                            setFollowBundle(next)
                            setToastMessage(`Unblocked ${b.name}.`)
                            setTimeout(() => setToastMessage(null), 3000)
                          }}
                          className="text-[10px] font-extrabold underline hover:text-red-900 cursor-pointer"
                        >
                          Unblock
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* VIEW A: FOLLOWERS LIST (People following you, with Follow back or Following / Unfollow buttons) */}
              {activeTab === 'followers' && (
                <div>
                  {followBundle.followers.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      <Radio className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">0 Followers so far</p>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                        When another member clicks &ldquo;+ Follow&rdquo; on your profile or card, they appear here immediately and you can choose to &ldquo;+ Follow back&rdquo;.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {followBundle.followers.map((follower) => {
                        const rel = getFollowRelationshipState(currentUser?.name, follower.name)
                        const isConn = connectedNamesSet.has(normalizeFollowKey(follower.name))
                        return (
                          <div key={follower.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-1 last:pb-0">
                            <div
                              onClick={() => onSelectMember?.(follower)}
                              className="flex items-start gap-3 cursor-pointer group min-w-0"
                            >
                              <img
                                src={follower.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(follower.name)}&backgroundColor=0a66c2`}
                                alt={follower.name}
                                className="h-12 w-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 group-hover:ring-2 group-hover:ring-[#0A66C2] transition-all"
                              />
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] group-hover:underline">
                                    {follower.name}
                                  </h4>
                                  <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                    Follows you · {follower.followedAgo || 'Recently'}
                                  </span>
                                  {isConn && (
                                    <span className="rounded bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                                      1st-Degree Connection
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">
                                  {follower.headline}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                              <button
                                type="button"
                                onClick={() => onSelectMember?.(follower)}
                                className="rounded-full border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 cursor-pointer"
                              >
                                View Workspace
                              </button>
                              {rel.isFollowing ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!currentUser?.name) return
                                    const res = unfollowMember({
                                      actorName: currentUser.name,
                                      targetName: follower.name
                                    })
                                    setFollowBundle(res.actorBundle)
                                    setToastMessage(`Unfollowed ${follower.name}.`)
                                    setTimeout(() => setToastMessage(null), 3000)
                                  }}
                                  className="rounded-full border border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 px-3.5 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  title={`Click to unfollow ${follower.name}`}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Following (Unfollow)</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!currentUser?.name) return
                                    const res = followMember({
                                      actorId: currentUser.id,
                                      actorName: currentUser.name,
                                      actorHeadline: currentUser.headline,
                                      actorAvatar: currentUser.avatar,
                                      actorProfession: currentUser.profession,
                                      actorLocation: currentUser.location,
                                      targetId: follower.id,
                                      targetName: follower.name,
                                      targetHeadline: follower.headline,
                                      targetAvatar: follower.avatar,
                                      isConnectedWithTarget: isConn
                                    })
                                    if (res.ok && res.actorBundle) {
                                      setFollowBundle(res.actorBundle)
                                      setToastMessage(`You are now following ${follower.name} back!`)
                                    } else if (res.error) {
                                      setToastMessage(res.error)
                                    }
                                    setTimeout(() => setToastMessage(null), 3000)
                                  }}
                                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-3.5 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>Follow back</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (!currentUser?.name) return
                                  const next = blockMemberForFollow({
                                    actorName: currentUser.name,
                                    targetName: follower.name,
                                    targetHeadline: follower.headline,
                                    targetAvatar: follower.avatar
                                  })
                                  setFollowBundle(next)
                                  setToastMessage(`Blocked ${follower.name} and removed follow relationship.`)
                                  setTimeout(() => setToastMessage(null), 3000)
                                }}
                                className="rounded-full border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-500 hover:text-red-600 hover:border-red-300 cursor-pointer"
                                title={`Block ${follower.name}`}
                              >
                                Block
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW B: FOLLOWING LIST (People you follow, with Unfollow option) */}
              {activeTab === 'following' && (
                <div>
                  {followBundle.following.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      <CheckCircle2 className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">You aren&apos;t following anyone yet (0)</p>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                        Click &ldquo;+ Follow&rdquo; beside any member in &ldquo;Verified Fellows to Follow&rdquo; or on member cards below to receive their public updates in your feed.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {followBundle.following.map((followed) => {
                        const rel = getFollowRelationshipState(currentUser?.name, followed.name)
                        const targetBundle = loadUserFollowBundle(followed.name)
                        return (
                          <div key={followed.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-1 last:pb-0">
                            <div
                              onClick={() => onSelectMember?.(followed)}
                              className="flex items-start gap-3 cursor-pointer group min-w-0"
                            >
                              <img
                                src={followed.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(followed.name)}&backgroundColor=0a66c2`}
                                alt={followed.name}
                                className="h-12 w-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 group-hover:ring-2 group-hover:ring-[#0A66C2] transition-all"
                              />
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] group-hover:underline">
                                    {followed.name}
                                  </h4>
                                  <span className="rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                                    ✓ Following · {followed.followedAgo || 'Recently'}
                                  </span>
                                  {rel.followsYou && (
                                    <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                      Follows you too
                                    </span>
                                  )}
                                  <span className="text-[10px] font-semibold text-zinc-400">
                                    {targetBundle.followers.length} {targetBundle.followers.length === 1 ? 'follower' : 'followers'}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">
                                  {followed.headline}
                                </p>
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                  📰 Public posts &amp; articles from {followed.name} are active in your Feed
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                              <button
                                type="button"
                                onClick={() => onSelectMember?.(followed)}
                                className="rounded-full border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 cursor-pointer"
                              >
                                View Workspace
                              </button>
                              <button
                                type="button"
                                onClick={() => onNavigateMessaging && onNavigateMessaging(followed)}
                                className="rounded-full border border-[#0A66C2] px-3 py-1.5 text-xs font-bold text-[#0A66C2] hover:bg-blue-50 cursor-pointer"
                              >
                                Message
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!currentUser?.name) return
                                  const res = unfollowMember({
                                    actorName: currentUser.name,
                                    targetName: followed.name
                                  })
                                  setFollowBundle(res.actorBundle)
                                  setToastMessage(`Unfollowed ${followed.name}. Both counts updated.`)
                                  setTimeout(() => setToastMessage(null), 3000)
                                }}
                                className="rounded-full border border-red-300 dark:border-red-800 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 px-3.5 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                              >
                                Unfollow
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
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

          {/* TAB: WHO VIEWED MY PROFILE (UNDER CONNECTIONS + LIVE CONTENT REACH & DIRECTORY DISCOVERED) */}
          {activeTab === 'profile_viewers' && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 flex-wrap">
                    <Eye className="h-4 w-4 text-[#0A66C2]" />
                    <span>Who Viewed My Profile</span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      ● Real Activity Data (No Placeholders)
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Real-time record of members who visited your profile, content &amp; modules you reached (Learning, Alerts, Media, Feed), and directory search appearances vs. profile clicks.
                  </p>
                </div>

                {/* Viewer Privacy Settings Control */}
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 shrink-0">
                  <Lock className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                  <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    My Viewing Privacy:
                  </span>
                  <select
                    value={viewerPrivacyMode}
                    onChange={(e) => {
                      const nextMode = e.target.value as ViewerPrivacyMode
                      setViewerPrivacyMode(nextMode)
                      if (currentUser?.name) {
                        saveViewerPrivacyMode(currentUser.name, nextMode)
                      }
                    }}
                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  >
                    <option value="full">Full Profile (Name, Role &amp; Photo)</option>
                    <option value="role_only">Semi-Private (Role &amp; Organization Only)</option>
                    <option value="anonymous">Private Mode (Anonymous Member)</option>
                  </select>
                </div>
              </div>

              {/* 3 Live Telemetry Sub-Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 p-1 text-xs font-bold">
                <button
                  onClick={() => setTelemetryViewSubTab('viewers')}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    telemetryViewSubTab === 'viewers'
                      ? "bg-white dark:bg-zinc-900 text-[#0A66C2] shadow-xs"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Who Viewed My Profile ({tailoredTelemetry.effectiveProfileViews})</span>
                </button>
                <button
                  onClick={() => setTelemetryViewSubTab('reach')}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    telemetryViewSubTab === 'reach'
                      ? "bg-white dark:bg-zinc-900 text-purple-600 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Content Reach ({tailoredTelemetry.effectiveTotalReach})</span>
                </button>
                <button
                  onClick={() => setTelemetryViewSubTab('discoveries')}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    telemetryViewSubTab === 'discoveries'
                      ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Directory Discovered ({tailoredTelemetry.effectiveDiscoveries})</span>
                </button>
              </div>

              {/* SUB-TAB 1: WHO VIEWED MY PROFILE */}
              {telemetryViewSubTab === 'viewers' && (
                <div className="space-y-4">
                  {/* Summary Breakdown: Unique Viewers vs Total Visits */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Unique Profile Viewers</p>
                      <p className="text-xl font-extrabold text-[#0A66C2] dark:text-sky-400 mt-0.5">
                        {tailoredTelemetry.effectiveProfileViews}
                      </p>
                      <p className="text-[10px] text-zinc-500">Deduplicated by member</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Profile Visits</p>
                      <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                        {tailoredTelemetry.totalProfileVisitEvents}
                      </p>
                      <p className="text-[10px] text-zinc-500">Includes repeat dossier checks</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Privacy Compliance</p>
                      <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                        ✓ Respects Viewer Privacy Mode
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Full, Role-Only, or Anonymous</p>
                    </div>
                  </div>

                  {tailoredTelemetry.viewers.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      <Eye className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">No Profile Viewers Yet (0)</p>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                        Whenever a member on ConnectLn visits your profile or clicks Inspect Dossier, their visit is recorded here live with their privacy-adjusted identity, timestamp, and entry channel.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {tailoredTelemetry.viewers.map((rawViewer) => {
                        const viewer = formatViewerForPrivacy(rawViewer)
                        const isAnon = viewer.privacyMode === 'anonymous'
                        const vNorm = String(rawViewer.name || '').toLowerCase().trim()
                        const isAlreadyConn = connectedNamesSet.has(vNorm)
                        const isAlreadyPending = pendingNamesSet.has(vNorm)
                        const matchedSuggestion = suggestedPeople.find(p => p.name.toLowerCase().trim() === vNorm)
                        return (
                          <div key={viewer.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-1 last:pb-0">
                            <div
                              onClick={() => !isAnon && onSelectMember?.(rawViewer)}
                              className={`flex items-start gap-3 min-w-0 ${isAnon ? "cursor-default" : "cursor-pointer group"}`}
                            >
                              <img
                                src={viewer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewer.name)}&backgroundColor=0a66c2`}
                                alt={viewer.name}
                                className="h-12 w-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 group-hover:ring-2 group-hover:ring-[#0A66C2] transition-all"
                              />
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] group-hover:underline">
                                    {viewer.name}
                                  </h4>
                                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/70 px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    <span>{formatProfileViewDateTime(viewer.createdAtIso, viewer.viewedAt)}</span>
                                  </span>
                                  {(viewer.visitCount || 1) > 1 && (
                                    <span className="rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                      {viewer.visitCount} visits
                                    </span>
                                  )}
                                  <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                                    {viewer.clearanceLevel}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">
                                  {viewer.headline}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                    👁️ Source: {viewer.viewVector || 'Profile & Dossier Inspection'}
                                  </span>
                                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                                    🗓️ {formatProfileViewDateTime(viewer.createdAtIso, viewer.viewedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {!isAnon && (
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  onClick={() => onSelectMember?.(rawViewer)}
                                  className="rounded-full border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 cursor-pointer"
                                >
                                  View Workspace
                                </button>
                                <button
                                  onClick={() => onNavigateMessaging && onNavigateMessaging(rawViewer)}
                                  className="rounded-full border border-[#0A66C2] px-3 py-1.5 text-xs font-bold text-[#0A66C2] hover:bg-blue-50 cursor-pointer"
                                >
                                  Message
                                </button>
                                {!isAlreadyConn && !isAlreadyPending && matchedSuggestion && (
                                  <button
                                    onClick={() => handleSendConnectionWithNote(matchedSuggestion.id)}
                                    className="rounded-full bg-[#0A66C2] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#004182] flex items-center gap-1 cursor-pointer"
                                  >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    <span>Connect</span>
                                  </button>
                                )}
                                {isAlreadyPending && (
                                  <span className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-500">
                                    Invite Sent
                                  </span>
                                )}
                                {isAlreadyConn && (
                                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                    ✓ Connected
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: LIVE CONTENT REACH (UNIQUE VIEWERS vs TOTAL VIEWS vs INTERACTIONS) */}
              {telemetryViewSubTab === 'reach' && (
                <div className="space-y-4">
                  {/* 3 Distinct Content Reach Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-purple-200/70 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Unique Viewers</p>
                      <p className="text-xl font-extrabold text-purple-700 dark:text-purple-300 mt-0.5">
                        {tailoredTelemetry.effectiveUniqueViewers}
                      </p>
                      <p className="text-[10px] text-zinc-500">Distinct viewers &amp; content reaches</p>
                    </div>
                    <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Views</p>
                      <p className="text-xl font-extrabold text-[#0A66C2] dark:text-sky-400 mt-0.5">
                        {tailoredTelemetry.effectiveTotalViews}
                      </p>
                      <p className="text-[10px] text-zinc-500">Learning, Alerts, Media &amp; Profile views</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Interactions</p>
                      <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                        {tailoredTelemetry.effectiveInteractions}
                      </p>
                      <p className="text-[10px] text-zinc-500">Posts, reactions, comments, shares &amp; saves</p>
                    </div>
                  </div>

                  {/* Filter pills: All vs Views vs Interactions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-zinc-500">Filter Activity:</span>
                    {[
                      { id: 'all' as const, label: `All Reach (${liveTelemetry.reachEvents.length})` },
                      { id: 'view' as const, label: `Views (${tailoredTelemetry.effectiveTotalViews})` },
                      { id: 'interaction' as const, label: `Interactions (${tailoredTelemetry.effectiveInteractions})` }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setReachKindFilter(f.id)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                          reachKindFilter === f.id
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {liveTelemetry.reachEvents.filter(e => reachKindFilter === 'all' || (e.eventKind || 'view') === reachKindFilter).length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      <TrendingUp className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">No Content Reach Activity Yet (0)</p>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                        Open Learning courses, check Alerts, watch Media briefings, or publish/react/comment on Feed posts to see real-time Views and Interactions recorded here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {liveTelemetry.reachEvents
                        .filter(e => reachKindFilter === 'all' || (e.eventKind || 'view') === reachKindFilter)
                        .map((ev) => {
                          const isInteraction = ev.eventKind === 'interaction'
                          return (
                            <div key={ev.id} className="py-3.5 flex items-center justify-between gap-3">
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                                    isInteraction
                                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                      : "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-[#0A66C2] dark:text-sky-300"
                                  }`}>
                                    {isInteraction ? '⚡ Interaction' : '👁️ View'}
                                  </span>
                                  <span className="rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                                    {ev.category}
                                  </span>
                                  <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                    {ev.title}
                                  </p>
                                </div>
                                <p className="text-xs text-zinc-500 truncate">
                                  Actor: {ev.actorName || currentUser?.name} {ev.details ? `· ${ev.details}` : ''}
                                </p>
                              </div>
                              <span className="text-[11px] font-semibold text-zinc-400 shrink-0">
                                {ev.timeAgo || 'Just now'}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 3: LIVE DIRECTORY DISCOVERED (SEARCH APPEARANCES vs PROFILE CLICKS) */}
              {telemetryViewSubTab === 'discoveries' && (
                <div className="space-y-4">
                  {/* 3 Distinct Directory Discovery Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Discoveries</p>
                      <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                        {tailoredTelemetry.effectiveDiscoveries}
                      </p>
                      <p className="text-[10px] text-zinc-500">Combined search appearances &amp; clicks</p>
                    </div>
                    <div className="rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Search Appearances</p>
                      <p className="text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">
                        {tailoredTelemetry.effectiveSearchAppearances}
                      </p>
                      <p className="text-[10px] text-zinc-500">Matched in directory &amp; specialty filters</p>
                    </div>
                    <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Profile Clicks</p>
                      <p className="text-xl font-extrabold text-[#0A66C2] dark:text-sky-400 mt-0.5">
                        {tailoredTelemetry.effectiveProfileClicks}
                      </p>
                      <p className="text-[10px] text-zinc-500">Direct clicks on profile or Connect from directory</p>
                    </div>
                  </div>

                  {/* Filter pills: All vs Search Appearances vs Profile Clicks */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-zinc-500">Filter Discovery Type:</span>
                    {[
                      { id: 'all' as const, label: `All Discoveries (${tailoredTelemetry.effectiveDiscoveries})` },
                      { id: 'search_appearance' as const, label: `Search Appearances (${tailoredTelemetry.effectiveSearchAppearances})` },
                      { id: 'profile_click' as const, label: `Profile Clicks (${tailoredTelemetry.effectiveProfileClicks})` }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setDiscoveryTypeFilter(f.id)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                          discoveryTypeFilter === f.id
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {liveTelemetry.discoveryEvents.filter(d => discoveryTypeFilter === 'all' || (d.discoveryType || 'profile_click') === discoveryTypeFilter).length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      <Search className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">No Directory Discoveries Yet (0)</p>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                        Whenever your profile appears in a directory/specialty search or someone clicks your profile from directory listings, each event is logged here with its exact keyword and searcher.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {liveTelemetry.discoveryEvents
                        .filter(d => discoveryTypeFilter === 'all' || (d.discoveryType || 'profile_click') === discoveryTypeFilter)
                        .map((disc) => {
                          const isClick = (disc.discoveryType || 'profile_click') === 'profile_click'
                          return (
                            <div key={disc.id} className="py-3.5 flex items-center justify-between gap-3">
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                                    isClick
                                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-[#0A66C2] dark:text-sky-300"
                                      : "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                                  }`}>
                                    {isClick ? '👆 Profile Click' : '🔍 Search Appearance'}
                                  </span>
                                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                    {disc.keyword}
                                  </span>
                                  <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                    By {disc.searcherName}
                                  </p>
                                </div>
                                <p className="text-xs text-zinc-500 truncate">
                                  {disc.searcherHeadline} · {disc.source}
                                </p>
                              </div>
                              <span className="text-[11px] font-semibold text-zinc-400 shrink-0">
                                {disc.timeAgo || 'Just now'}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  )}
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
                              const incoming = receivedInviteByNameMap.get(String(person.name || '').toLowerCase().trim())
                              if (incoming) {
                                handleAcceptInvite(incoming.id)
                                return
                              }
                              if (person.isConnected) {
                                setActiveTab('connections')
                                return
                              }
                              if (person.isPending) {
                                setActiveTab('sent_invites')
                                return
                              }
                              handleSendConnectionWithNote(person.id)
                            }}
                            className={`ml-auto rounded-xl px-3.5 py-1.5 text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                              receivedInviteByNameMap.has(String(person.name || '').toLowerCase().trim())
                                ? "bg-[#0A66C2] hover:bg-[#004182] text-white shadow-sm ring-2 ring-blue-300"
                                : person.isConnected
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : person.isPending
                                ? "border border-zinc-300 text-zinc-500"
                                : "bg-[#A64532] hover:bg-[#8E3929] text-white shadow-2xs"
                            }`}
                          >
                            {receivedInviteByNameMap.has(String(person.name || '').toLowerCase().trim()) ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Accept Invite</span>
                              </>
                            ) : person.isConnected ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Connected</span>
                              </>
                            ) : person.isPending ? (
                              <span>Invite Sent</span>
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3" />
                                <span>Connect</span>
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
              {/* SECTION 2: VERIFIED GUILD PEERS & SPECIALISTS YOU MAY KNOW             */}
              {/* ═══════════════════════════════════════════════════════════════════════ */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#0A66C2] text-[10px] font-black text-white">C</span>
                    <span>Verified Guild Peers &amp; Specialists You May Know in</span>
                    <span className="text-[#0A66C2] font-black">{selectedCapability}</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Practitioners matched by verified ticket history, trade licenses, and shared specialties.
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

                        {/* One-way Follow / Follow back / Following button (separate from Connect) */}
                        {(() => {
                          const rel = getFollowRelationshipState(currentUser?.name, person.name)
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                if (!currentUser?.name) return
                                if (rel.isFollowing) {
                                  const res = unfollowMember({
                                    actorName: currentUser.name,
                                    targetName: person.name
                                  })
                                  setFollowBundle(res.actorBundle)
                                  setToastMessage(`Unfollowed ${person.name}.`)
                                  setTimeout(() => setToastMessage(null), 3000)
                                  return
                                }
                                const res = followMember({
                                  actorId: currentUser.id,
                                  actorName: currentUser.name,
                                  actorHeadline: currentUser.headline,
                                  actorAvatar: currentUser.avatar,
                                  actorProfession: currentUser.profession,
                                  actorLocation: currentUser.location,
                                  targetId: person.id,
                                  targetName: person.name,
                                  targetHeadline: person.headline,
                                  targetAvatar: person.avatar,
                                  isConnectedWithTarget: Boolean(person.isConnected)
                                })
                                if (res.ok && res.actorBundle) {
                                  setFollowBundle(res.actorBundle)
                                  setToastMessage(`Now following ${person.name}. Their public posts will appear in your feed.`)
                                } else if (res.error) {
                                  setToastMessage(res.error)
                                }
                                setTimeout(() => setToastMessage(null), 3000)
                              }}
                              className={`flex-1 rounded-xl py-1.5 text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                rel.isFollowing
                                  ? "border border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : rel.followsYou
                                  ? "border border-[#0A66C2] bg-blue-50 text-[#0A66C2] hover:bg-blue-100"
                                  : "border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-[#0A66C2] hover:text-[#0A66C2]"
                              }`}
                              title={
                                rel.isFollowing
                                  ? `Following ${person.name} — click to Unfollow`
                                  : rel.followsYou
                                  ? `${person.name} follows you — click to Follow back`
                                  : `Follow ${person.name} (one-way updates)`
                              }
                            >
                              {rel.isFollowing ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span>Following</span>
                                </>
                              ) : rel.followsYou ? (
                                <>
                                  <Plus className="h-3 w-3" />
                                  <span>Follow back</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3" />
                                  <span>Follow</span>
                                </>
                              )}
                            </button>
                          )
                        })()}

                        <button
                          onClick={() => {
                            const incoming = receivedInviteByNameMap.get(String(person.name || '').toLowerCase().trim())
                            if (incoming) {
                              handleAcceptInvite(incoming.id)
                              return
                            }
                            if (person.isConnected) {
                              setActiveTab('connections')
                              return
                            }
                            if (person.isPending) {
                              setActiveTab('sent_invites')
                              return
                            }
                            handleSendConnectionWithNote(person.id)
                          }}
                          className={`flex-1 rounded-xl py-1.5 text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            receivedInviteByNameMap.has(String(person.name || '').toLowerCase().trim())
                              ? "bg-[#0A66C2] text-white hover:bg-[#004182] shadow-sm ring-2 ring-blue-300"
                              : person.isConnected
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : person.isPending
                              ? "border border-zinc-300 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
                              : "bg-[#0A66C2] text-white hover:bg-[#004182] shadow-2xs"
                          }`}
                        >
                          {receivedInviteByNameMap.has(String(person.name || '').toLowerCase().trim()) ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Accept Invite</span>
                            </>
                          ) : person.isConnected ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Connected</span>
                            </>
                          ) : person.isPending ? (
                            <span>Invite Sent</span>
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3" />
                              <span>Connect</span>
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
