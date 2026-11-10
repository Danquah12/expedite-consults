"use client"

import React, { useState, useEffect } from "react"
import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Heart,
  MessageSquare,
  Sparkles,
  Award,
  Calendar,
  Filter,
  Check,
  AlertTriangle,
  Shield,
  ShoppingBag,
  GraduationCap,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag,
  Store,
  Layers
} from "lucide-react"
import {
  CategorizedNotificationItem,
  INITIAL_CATEGORIZED_NOTIFICATIONS
} from "@/lib/notifications-engine-data"
import {
  loadUserFollowBundle,
  syncUserFollowBundleFromCloud,
  getFollowRelationshipState,
  followMember,
  unfollowMember,
  markFollowNotificationsRead,
  UserFollowBundle
} from "@/lib/connectin-follow"
import {
  loadLiveUserTelemetry,
  syncLiveUserTelemetryFromCloud,
  getProfileTailoredAnalytics,
  markVouchAlertsRead,
  UserLiveTelemetryBundle
} from "@/lib/connectin-analytics"

interface NoctisAlertCardExplanation {
  alertId: string
  whatItRepresents: string
  whyItMatters: string
  recommendedActionPlan: string[]
  liveNoctisNote?: string
}

interface NotificationsViewProps {
  onNavigateTab?: (tab: string) => void
  currentUserName?: string
  currentUserProfession?: string
}

export interface SavedConnectLnJobAlert {
  id: string
  roleOrTrade: string
  companies: string
  location: string
  opportunityType: 'Employment' | 'Contract project' | 'Apprenticeship' | 'All Types'
  frequency: 'Instant' | 'Daily' | 'Weekly'
  enabled: boolean
  createdAt: string
}

export function NotificationsView({
  onNavigateTab,
  currentUserName = "Kwesi Asiedu",
  currentUserProfession = ""
}: NotificationsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Job Alerts' | 'Lookups & Vouches' | 'Security' | 'Career' | 'Marketplace' | 'Learning' | 'Social'>('All')
  const [jobAlertEnabled, setJobAlertEnabled] = useState<boolean>(true)
  const [newAlertRole, setNewAlertRole] = useState<string>(
    currentUserProfession || "AI Automation Consultant / Master Carpenter / Lead Specialist"
  )
  const [newAlertCompany, setNewAlertCompany] = useState<string>(
    "Verified Employers, Franchise Networks & Local Businesses"
  )
  const [newAlertLocation, setNewAlertLocation] = useState<string>("Laurel, MD · Remote & Local")
  const [newAlertOpportunityType, setNewAlertOpportunityType] = useState<'Employment' | 'Contract project' | 'Apprenticeship' | 'All Types'>('All Types')
  const [newAlertFrequency, setNewAlertFrequency] = useState<'Instant' | 'Daily' | 'Weekly'>('Instant')
  const [jobAlertSavedToast, setJobAlertSavedToast] = useState<string | null>(null)
  const [savedJobAlerts, setSavedJobAlerts] = useState<SavedConnectLnJobAlert[]>([
    {
      id: 'ja_default_1',
      roleOrTrade: currentUserProfession || 'AI Automation Consultant & Voice AI Solutions Lead',
      companies: 'Enterprise & Verified ConnectLn Employers',
      location: 'Laurel, MD · Remote / Hybrid',
      opportunityType: 'All Types',
      frequency: 'Instant',
      enabled: true,
      createdAt: 'Active · Instant notifications on'
    },
    {
      id: 'ja_default_2',
      roleOrTrade: 'Skilled Trades, Custom Joinery, Welding & Field Project Contracts',
      companies: 'Local Business Networks, General Contractors & Franchise Locations',
      location: 'Maryland, DC, Virginia & Nationwide',
      opportunityType: 'Contract project',
      frequency: 'Daily',
      enabled: true,
      createdAt: 'Active · Daily digest on'
    }
  ])

  useEffect(() => {
    try {
      const savedToggle = localStorage.getItem('connectln_job_search_alert_enabled')
      if (savedToggle !== null) setJobAlertEnabled(savedToggle === 'true')
      const rawAlerts = localStorage.getItem('connectln_saved_job_alerts_v1')
      if (rawAlerts) {
        const parsed = JSON.parse(rawAlerts)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedJobAlerts(parsed)
        }
      }
    } catch {}
  }, [])

  const handleCreateCustomJobAlert = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAlertRole.trim()) return
    const created: SavedConnectLnJobAlert = {
      id: 'ja_' + Date.now(),
      roleOrTrade: newAlertRole.trim(),
      companies: newAlertCompany.trim() || 'All Verified Employers',
      location: newAlertLocation.trim() || 'Remote & Local',
      opportunityType: newAlertOpportunityType,
      frequency: newAlertFrequency,
      enabled: true,
      createdAt: `Created just now · ${newAlertFrequency} alerts ON`
    }
    const updated = [created, ...savedJobAlerts]
    setSavedJobAlerts(updated)
    setJobAlertEnabled(true)
    try {
      localStorage.setItem('connectln_saved_job_alerts_v1', JSON.stringify(updated))
      localStorage.setItem('connectln_job_search_alert_enabled', 'true')
      window.dispatchEvent(new Event('connectln-job-alert-updated'))
    } catch {}
    setJobAlertSavedToast(`✓ Job alert created for "${created.roleOrTrade}" (${created.frequency})`)
    setTimeout(() => setJobAlertSavedToast(null), 4000)
  }

  const handleToggleSingleJobAlert = (id: string) => {
    const updated = savedJobAlerts.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    setSavedJobAlerts(updated)
    try {
      localStorage.setItem('connectln_saved_job_alerts_v1', JSON.stringify(updated))
    } catch {}
  }

  const handleDeleteSingleJobAlert = (id: string) => {
    const updated = savedJobAlerts.filter(a => a.id !== id)
    setSavedJobAlerts(updated)
    try {
      localStorage.setItem('connectln_saved_job_alerts_v1', JSON.stringify(updated))
    } catch {}
  }
  const [lookupVouchSubFilter, setLookupVouchSubFilter] = useState<'all' | 'lookups' | 'vouches'>('all')
  const [lookupActorTypeFilter, setLookupActorTypeFilter] = useState<'all' | 'search_appearance' | 'profile_click'>('all')
  const [notifications, setNotifications] = useState<CategorizedNotificationItem[]>(INITIAL_CATEGORIZED_NOTIFICATIONS)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [readDynamicAlertIds, setReadDynamicAlertIds] = useState<string[]>([])
  const [followBundle, setFollowBundle] = useState<UserFollowBundle>(() =>
    loadUserFollowBundle(currentUserName)
  )
  const [liveTelemetry, setLiveTelemetry] = useState<UserLiveTelemetryBundle>(() =>
    loadLiveUserTelemetry(currentUserName)
  )

  useEffect(() => {
    if (!currentUserName) return
    const refreshFollow = () => {
      setFollowBundle(loadUserFollowBundle(currentUserName))
    }
    const refreshTelemetry = () => {
      setLiveTelemetry(loadLiveUserTelemetry(currentUserName))
    }
    refreshFollow()
    refreshTelemetry()
    syncUserFollowBundleFromCloud(currentUserName).then((cloudBundle) => {
      setFollowBundle(cloudBundle)
    })
    syncLiveUserTelemetryFromCloud(currentUserName).then((cloudTelemetry) => {
      setLiveTelemetry(cloudTelemetry)
    })
    window.addEventListener('connectln-follow-updated', refreshFollow)
    window.addEventListener('connectln-telemetry-updated', refreshTelemetry)
    return () => {
      window.removeEventListener('connectln-follow-updated', refreshFollow)
      window.removeEventListener('connectln-telemetry-updated', refreshTelemetry)
    }
  }, [currentUserName])

  const tailoredAnalytics = React.useMemo(
    () =>
      getProfileTailoredAnalytics({
        name: currentUserName,
        profession: currentUserProfession || "Master Carpenter"
      } as any),
    [currentUserProfession, currentUserName, liveTelemetry]
  )

  const weeklyLookupsCount = tailoredAnalytics.discoveryData.weeklyLookupsCount
  const weeklySearchAppearances = tailoredAnalytics.discoveryData.weeklySearchAppearances
  const weeklyProfileClicks = tailoredAnalytics.discoveryData.weeklyProfileClicks
  const recentLookupActors = tailoredAnalytics.discoveryData.recentLookupActors || []
  const vouchEvents = tailoredAnalytics.vouchEvents || []

  // Convert Weekly Lookups & Who Tried to Lookup the User into Alert items
  const liveLookupAlertItems = React.useMemo<CategorizedNotificationItem[]>(() => {
    const items: CategorizedNotificationItem[] = []
    const uniqueSearcherNames: string[] = Array.from(
      new Set(recentLookupActors.map(a => String(a.searcherName || '')).filter(Boolean))
    )
    const topKeywords: string[] = Array.from(
      new Set(recentLookupActors.map(a => String(a.keyword || '')).filter(Boolean))
    ).slice(0, 3)

    if (weeklyLookupsCount > 0) {
      const digestId = `lookup_weekly_digest_${currentUserName.toLowerCase().replace(/\s+/g, '_')}`
      items.push({
        id: digestId,
        category: 'Career',
        subType: 'Weekly Lookup Digest',
        actor: {
          name: uniqueSearcherNames[0] || 'ConnectLn Directory Radar',
          role: `Weekly Search & Lookup Telemetry (${weeklyLookupsCount} Lookups in 7d)`,
          avatar:
            recentLookupActors[0]?.searcherAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(uniqueSearcherNames[0] || 'CL')}&backgroundColor=0a66c2`
        },
        title: `🔍 Weekly Lookup Report: You appeared in ${weeklyLookupsCount} lookups this week (${weeklySearchAppearances} search appearances · ${weeklyProfileClicks} direct profile lookups)`,
        description: `Who was trying to look you up: ${
          uniqueSearcherNames.length > 0 ? uniqueSearcherNames.join(', ') : 'Verified ConnectLn Members'
        }. Top lookup queries matching your profile: ${
          topKeywords.map(k => `"${k}"`).join(', ') || '"Verified Professional"'
        }.`,
        timestamp: 'Weekly Digest · Live',
        unread: !readDynamicAlertIds.includes(digestId),
        priority: 'high',
        actionText: 'Inspect Lookup Dossier',
        targetTab: 'profile'
      })
    }

    recentLookupActors.slice(0, 8).forEach((lookup, idx) => {
      const alertId = `lookup_actor_${lookup.id || idx}`
      const isDirectClick = lookup.discoveryType === 'profile_click'
      items.push({
        id: alertId,
        category: 'Career',
        subType: 'Who Looked You Up',
        actor: {
          name: lookup.searcherName,
          role: `${lookup.searcherHeadline} · ${lookup.searcherCompany}`,
          avatar:
            lookup.searcherAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lookup.searcherName)}&backgroundColor=0a66c2`
        },
        title: `🔍 ${lookup.searcherName} (${lookup.searcherCompany}) looked you up via "${lookup.keyword}"`,
        description: `${
          isDirectClick
            ? 'Direct Profile Lookup: Clicked your dossier directly from directory lookup results'
            : 'Search Lookup Appearance: Your profile appeared in their live directory lookup'
        } via ${lookup.source} · Role: ${lookup.searcherHeadline}. Counted in your ${weeklyLookupsCount} weekly lookups.`,
        timestamp: lookup.timeAgo || 'This week',
        unread: idx < 2 && !readDynamicAlertIds.includes(alertId),
        priority: 'normal',
        actionText: 'View Profile & Lookups',
        targetTab: 'profile'
      })
    })

    return items
  }, [weeklyLookupsCount, weeklySearchAppearances, weeklyProfileClicks, recentLookupActors, currentUserName, readDynamicAlertIds])

  // Convert Peer Vouches ("Who Vouched for a User") into Alert items
  const liveVouchAlertItems = React.useMemo<CategorizedNotificationItem[]>(() => {
    return vouchEvents.map((vouch) => {
      const alertId = `vouch_alert_${vouch.id}`
      const isUnread = Boolean(vouch.unread) && !readDynamicAlertIds.includes(alertId)
      return {
        id: alertId,
        category: 'Social',
        subType: 'Peer Vouch Received',
        actor: {
          name: vouch.voucherName,
          role: `${vouch.voucherHeadline} · ${vouch.voucherCompany}`,
          avatar:
            vouch.voucherAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(vouch.voucherName)}&backgroundColor=059669`
        },
        title: `🤝 ${vouch.voucherName} vouched for you in "${vouch.skillOrCredential}"`,
        description: `"${vouch.note}" — Verified ${vouch.voucherRelation} (${vouch.voucherHeadline} at ${vouch.voucherCompany}). Recorded on your ConnectLn Proof-of-Work & Endorsement Ledger.`,
        timestamp: vouch.timeAgo || 'Recently',
        unread: isUnread,
        priority: 'high',
        actionText: 'View Vouch on Profile',
        targetTab: 'profile'
      }
    })
  }, [vouchEvents, readDynamicAlertIds])

  // Convert live follower notifications into CategorizedNotificationItems (respecting notifyOnNewFollower preference)
  const liveFollowerNotificationItems = React.useMemo<CategorizedNotificationItem[]>(() => {
    if (!followBundle.settings?.notifyOnNewFollower) return []
    return (followBundle.notifications || []).map((fn) => ({
      id: fn.id,
      category: 'Social' as const,
      subType: 'New Follower',
      actor: {
        name: fn.followerName,
        role: fn.followerHeadline,
        avatar: fn.followerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fn.followerName)}&backgroundColor=0a66c2`
      },
      title: `${fn.followerName} started following you on ConnectLn`,
      description: `${fn.followerHeadline} · Following is one-way — they now receive your public updates in their feed. Click "+ Follow back" if you also want to receive their updates.`,
      timestamp: fn.timeAgo || 'Recently',
      unread: Boolean(fn.unread),
      priority: 'normal' as const,
      actionText: 'Manage Followers',
      targetTab: 'network'
    }))
  }, [followBundle])

  const tailoredCareerAlertItems = React.useMemo<CategorizedNotificationItem[]>(() => {
    const profLabel = (currentUserProfession || 'Master Carpenter & Heavy Timber Specialist').trim()
    return [
      {
        id: `career_tailored_prof_${profLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        category: 'Career',
        subType: 'Job Match',
        actor: {
          name: 'ConnectLn Direct-Hire Talent Radar',
          role: 'Verified Skills-First Career Matcher',
          avatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=80'
        },
        title: `💼 4 Direct-Hire & Contract Matches for ${profLabel} ($118K–$176K / yr)`,
        description: `Employers in United States, Africa, UK & Germany matched your verified Proof-of-Work dossier, OSHA/trade tickets, and peer vouches for immediate interview fast-track.`,
        timestamp: '22m ago',
        unread: !readDynamicAlertIds.includes(`career_tailored_prof_${profLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`),
        priority: 'high',
        actionText: 'View Matched Jobs',
        targetTab: 'jobs'
      },
      {
        id: 'career_cyber_essential_2026',
        category: 'Career',
        subType: 'Job Match',
        actor: {
          name: 'Cybersecurity & Essential Trades Hiring Enclave',
          role: '22-Enclave Live Requisition Feed',
          avatar: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80'
        },
        title: '🛡️🛠️ New Requisitions: Cybersecurity (SOC, Pentest, OT/ICS, CISO) & Essential Trades (Lineman, Elevator, CDL-A, Master Carpenter)',
        description: '48 new verified openings published with transparent pay bands, zero 4-year degree gatekeeping (STARs pathway), and 1-click CareerTwin™ application.',
        timestamp: '1h ago',
        unread: !readDynamicAlertIds.includes('career_cyber_essential_2026'),
        priority: 'high',
        actionText: 'Explore Live Jobs',
        targetTab: 'jobs'
      }
    ]
  }, [currentUserProfession, readDynamicAlertIds])

  const allCombinedNotifications = React.useMemo(() => {
    const dynamicItems = [
      ...liveLookupAlertItems,
      ...liveVouchAlertItems,
      ...tailoredCareerAlertItems,
      ...liveFollowerNotificationItems
    ]
    const existingIds = new Set(dynamicItems.map(i => i.id))
    return [
      ...dynamicItems,
      ...notifications.filter(n => !existingIds.has(n.id))
    ]
  }, [liveLookupAlertItems, liveVouchAlertItems, tailoredCareerAlertItems, liveFollowerNotificationItems, notifications])

  // Noctis Alerts Intelligence States (collapsed by default to avoid clutter)
  const [showNoctisOverview, setShowNoctisOverview] = useState<boolean>(false)
  const [isNoctisOverviewLoading, setIsNoctisOverviewLoading] = useState<boolean>(false)
  const [noctisOverviewText, setNoctisOverviewText] = useState<string>("")
  const [noctisUpdatedAtLabel, setNoctisUpdatedAtLabel] = useState<string>("Updated just now")
  const [noctisAlertQuestion, setNoctisAlertQuestion] = useState<string>("")
  const [noctisCustomAnswer, setNoctisCustomAnswer] = useState<string | null>(null)
  const [alertExplanationsMap, setAlertExplanationsMap] = useState<Record<string, NoctisAlertCardExplanation>>({})
  const [expandedAlertIds, setExpandedAlertIds] = useState<string[]>(['notif_sec_1'])
  const [loadingSingleAlertId, setLoadingSingleAlertId] = useState<string | null>(null)
  const [singleAlertQuestions, setSingleAlertQuestions] = useState<Record<string, string>>({})

  const isLookupAlert = (n: CategorizedNotificationItem) =>
    n.subType === 'Weekly Lookup Digest' ||
    n.subType === 'Who Looked You Up'

  const isVouchAlert = (n: CategorizedNotificationItem) =>
    n.subType === 'Peer Vouch Received'

  const isLookupOrVouchAlert = (n: CategorizedNotificationItem) =>
    isLookupAlert(n) || isVouchAlert(n)

  // Category counts (Lookups & Vouches are counted in their dedicated tab so Career & Social show distinct counts)
  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return allCombinedNotifications.length
    if (cat === 'Job Alerts') return savedJobAlerts.length
    if (cat === 'Lookups & Vouches') return allCombinedNotifications.filter(isLookupOrVouchAlert).length
    if (cat === 'Career') return allCombinedNotifications.filter(n => n.category === 'Career' && !isLookupOrVouchAlert(n)).length
    if (cat === 'Social') return allCombinedNotifications.filter(n => n.category === 'Social' && !isLookupOrVouchAlert(n)).length
    return allCombinedNotifications.filter(n => n.category === cat).length
  }

  const getUnreadCount = (cat: string) => {
    if (cat === 'All') return allCombinedNotifications.filter(n => n.unread).length
    if (cat === 'Job Alerts') return savedJobAlerts.filter(a => a.enabled).length
    if (cat === 'Lookups & Vouches') return allCombinedNotifications.filter(n => isLookupOrVouchAlert(n) && n.unread).length
    if (cat === 'Career') return allCombinedNotifications.filter(n => n.category === 'Career' && !isLookupOrVouchAlert(n) && n.unread).length
    if (cat === 'Social') return allCombinedNotifications.filter(n => n.category === 'Social' && !isLookupOrVouchAlert(n) && n.unread).length
    return allCombinedNotifications.filter(n => n.category === cat && n.unread).length
  }

  // Filtered Notifications
  const filteredNotifications = allCombinedNotifications.filter(n => {
    const matchCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Job Alerts'
        ? n.category === 'Career' && !isLookupOrVouchAlert(n)
        : selectedCategory === 'Lookups & Vouches'
        ? lookupVouchSubFilter === 'lookups'
          ? isLookupAlert(n)
          : lookupVouchSubFilter === 'vouches'
          ? isVouchAlert(n)
          : isLookupOrVouchAlert(n)
        : selectedCategory === 'Career'
        ? n.category === 'Career' && !isLookupOrVouchAlert(n)
        : selectedCategory === 'Social'
        ? n.category === 'Social' && !isLookupOrVouchAlert(n)
        : n.category === selectedCategory
    const matchUnread = !unreadOnly || n.unread
    return matchCategory && matchUnread
  })

  const filteredLookupActors = React.useMemo(() => {
    if (lookupActorTypeFilter === 'all') return recentLookupActors
    return recentLookupActors.filter(a => a.discoveryType === lookupActorTypeFilter)
  }, [recentLookupActors, lookupActorTypeFilter])

  const serializeAlertForNoctis = (n: CategorizedNotificationItem) => ({
    id: n.id,
    category: n.category,
    subType: n.subType,
    actorName: n.actor.name,
    actorRole: n.actor.role,
    title: n.title,
    description: n.description,
    timestamp: n.timestamp,
    unread: n.unread,
    priority: n.priority,
    actionText: n.actionText,
    externalLabel: n.externalLabel,
    externalUrl: n.externalUrl
  })

  const fetchNoctisAlertsBriefing = async (customQuestion?: string) => {
    setIsNoctisOverviewLoading(true)
    try {
      const targetAlerts = filteredNotifications.map(serializeAlertForNoctis)
      const res = await fetch('/api/connectin/noctis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'alerts_briefing',
          question: customQuestion || undefined,
          categoryFilter: selectedCategory,
          alerts: targetAlerts,
          profile: {
            name: currentUserName,
            profession: currentUserProfession
          }
        })
      })
      const data = await res.json().catch(() => null)
      if (data?.alertExplanations && typeof data.alertExplanations === 'object') {
        setAlertExplanationsMap(prev => ({ ...prev, ...data.alertExplanations }))
      }
      if (data?.text) {
        if (customQuestion) {
          setNoctisCustomAnswer(data.text)
        } else {
          setNoctisOverviewText(data.text)
        }
        setNoctisUpdatedAtLabel(
          `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        )
      }
    } catch {
      // Keep existing local explanation
    } finally {
      setIsNoctisOverviewLoading(false)
    }
  }

  const handleExplainSingleAlertWithNoctis = async (
    notif: CategorizedNotificationItem,
    customQuestion?: string
  ) => {
    if (!expandedAlertIds.includes(notif.id)) {
      setExpandedAlertIds(prev => [...prev, notif.id])
    } else if (!customQuestion) {
      // Toggle close if already open and no custom question submitted
      setExpandedAlertIds(prev => prev.filter(id => id !== notif.id))
      return
    }

    setLoadingSingleAlertId(notif.id)
    try {
      const res = await fetch('/api/connectin/noctis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explain_single_alert',
          question: customQuestion || undefined,
          selectedAlert: serializeAlertForNoctis(notif),
          profile: {
            name: currentUserName,
            profession: currentUserProfession
          }
        })
      })
      const data = await res.json().catch(() => null)
      if (data?.singleExplanation) {
        setAlertExplanationsMap(prev => ({
          ...prev,
          [notif.id]: data.singleExplanation
        }))
      }
    } catch {
      // Keep structured breakdown
    } finally {
      setLoadingSingleAlertId(null)
    }
  }

  useEffect(() => {
    fetchNoctisAlertsBriefing()
  }, [selectedCategory, unreadOnly])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    )
    setReadDynamicAlertIds(prev => (prev.includes(id) ? prev : [...prev, id]))
    if (currentUserName && id.startsWith('fnotif_')) {
      const next = markFollowNotificationsRead(currentUserName)
      setFollowBundle(next)
    }
    if (currentUserName && id.startsWith('vouch_alert_')) {
      const rawVouchId = id.replace('vouch_alert_', '')
      markVouchAlertsRead(currentUserName, rawVouchId)
      setLiveTelemetry(loadLiveUserTelemetry(currentUserName))
    }
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    setReadDynamicAlertIds(allCombinedNotifications.map(n => n.id))
    if (currentUserName) {
      const next = markFollowNotificationsRead(currentUserName)
      setFollowBundle(next)
      markVouchAlertsRead(currentUserName)
      setLiveTelemetry(loadLiveUserTelemetry(currentUserName))
    }
  }

  const handleNotificationAction = (item: CategorizedNotificationItem) => {
    handleMarkAsRead(item.id)
    if (onNavigateTab) {
      onNavigateTab(item.targetTab)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* 1. TOP NOTIFICATIONS BANNER */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-0.5 text-xs font-semibold text-[#0A66C2] dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5 w-fit">
              <Bell className="h-3.5 w-3.5" />
              Notifications &amp; Activity
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1.5">
              Updates, Weekly Lookups &amp; Peer Vouches
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Track who was trying to look you up this week, who vouched for your skills, peer connections, and career signals.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowNoctisOverview(prev => !prev)
                if (!showNoctisOverview) {
                  fetchNoctisAlertsBriefing()
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                showNoctisOverview
                  ? "bg-[#1967D2] text-white hover:bg-[#1557B0]"
                  : "bg-[#E8F0FE] text-[#1967D2] hover:bg-[#D2E3FC] border border-[#1967D2]/30"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{showNoctisOverview ? "Noctis Alert Intelligence: ON" : "✨ Explain Alerts with Noctis"}</span>
            </button>

            <button
              type="button"
              onClick={handleMarkAllRead}
              className="rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Check className="h-4 w-4 text-[#0A66C2]" />
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>

        {/* Featured ConnectLn Job Alert Request Card */}
        <div className="mt-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 px-4 py-2 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">ConnectLn Opportunity Radar · Job Alert Request</span>
            <span>Nov 10 · 10:49 AM</span>
          </div>
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
            <img
              src="/brand/connectln-icon.png"
              alt="ConnectLn"
              className="h-14 w-14 rounded-2xl object-contain bg-[#1a1917] border border-zinc-200 shrink-0 shadow-2xs"
            />
            <div className="min-w-0 flex-1 space-y-2 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    ConnectLn Job Alert Request
                  </span>
                  <span className="inline-flex items-center justify-center rounded bg-[#a64532] px-1.5 py-0.2 text-[10px] font-black text-white leading-tight">
                    CLn
                  </span>
                  <span className="text-xs text-zinc-500">
                    ConnectLn Opportunity Radar · Direct Job, Contract &amp; Apprenticeship Alerts
                  </span>
                </div>
              </div>

              <p>Hi {(currentUserName || "Kwesi").split(" ")[0]},</p>
              <p>
                Want a heads-up when new roles open? Set up a job alert to get notified as soon as new jobs get posted at companies you like.
              </p>
              <p>
                To create an alert, click <strong>Get started</strong> below or open the <strong>🔔 Set Up Job Alerts</strong> tab right here in Alerts.
              </p>

              <div className="pt-1.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Job Alerts')
                    setJobAlertEnabled(true)
                    try {
                      localStorage.setItem('connectln_job_search_alert_enabled', 'true')
                      window.dispatchEvent(new Event('connectln-job-alert-updated'))
                    } catch {}
                  }}
                  className="rounded-full border-2 border-[#0A66C2] bg-[#0A66C2] text-white hover:bg-[#004182] px-4 py-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  Get started
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Categories Filter Ribbon */}
        <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'All', label: 'All', count: getCategoryCount('All'), unread: getUnreadCount('All') },
              { id: 'Job Alerts', label: '🔔 Set Up Job Alerts', count: getCategoryCount('Job Alerts'), unread: getUnreadCount('Job Alerts') },
              { id: 'Lookups & Vouches', label: '🔍🤝 Lookups & Vouches', count: getCategoryCount('Lookups & Vouches'), unread: getUnreadCount('Lookups & Vouches') },
              { id: 'Career', label: '💼 Career', count: getCategoryCount('Career'), unread: getUnreadCount('Career') },
              { id: 'Social', label: '💬 Network & Community', count: getCategoryCount('Social'), unread: getUnreadCount('Social') },
              { id: 'Learning', label: '🎓 Learning', count: getCategoryCount('Learning'), unread: getUnreadCount('Learning') },
              { id: 'Marketplace', label: '🛍️ Solutions', count: getCategoryCount('Marketplace'), unread: getUnreadCount('Marketplace') },
              { id: 'Security', label: '🛡️ Account & Safety', count: getCategoryCount('Security'), unread: getUnreadCount('Security') }
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id as any)
                    setLookupVouchSubFilter('all')
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#0A66C2] text-white font-semibold shadow-xs ring-2 ring-[#0A66C2]/30"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.unread > 0 ? (
                    <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                      {cat.unread}
                    </span>
                  ) : (
                    <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${isSelected ? "bg-white/20 text-white" : "bg-zinc-200/70 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"}`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              unreadOnly
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{unreadOnly ? "Showing Unread Only" : "Show All"}</span>
          </button>
        </div>

        {/* Active Category Filter Status Bar & Sub-Filters */}
        {selectedCategory !== 'All' && (
          <div className="mt-3.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A66C2] text-white px-2.5 py-0.5 text-[11px] font-extrabold">
                <span>Active Filter: {selectedCategory}</span>
                <span>({filteredNotifications.length})</span>
              </span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {selectedCategory === 'Lookups & Vouches'
                  ? `Showing ${weeklyLookupsCount} Weekly Directory Lookups, ${vouchEvents.length} Verified Peer Vouches & ${filteredNotifications.length} Lookup/Vouch Alert Cards`
                  : selectedCategory === 'Career'
                  ? `Showing ${filteredNotifications.length} Direct-Hire Job Matches, Interview Schedules & Recruiter Outreach Signals`
                  : `Showing ${filteredNotifications.length} filtered ${selectedCategory} alerts`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {selectedCategory === 'Lookups & Vouches' && (
                <>
                  {[
                    { id: 'all', label: `All (${allCombinedNotifications.filter(isLookupOrVouchAlert).length})` },
                    { id: 'lookups', label: `🔍 Weekly Lookups Only (${allCombinedNotifications.filter(isLookupAlert).length})` },
                    { id: 'vouches', label: `🤝 Peer Vouches Only (${allCombinedNotifications.filter(isVouchAlert).length})` }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setLookupVouchSubFilter(sub.id as any)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                        lookupVouchSubFilter === sub.id
                          ? "bg-amber-600 text-white shadow-2xs"
                          : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-amber-50"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </>
              )}
              {selectedCategory === 'Career' && (
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('jobs')}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[11px] font-extrabold transition-all cursor-pointer"
                >
                  Open Live Jobs Board →
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All')
                  setLookupVouchSubFilter('all')
                }}
                className="rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
              >
                Reset to All ({getCategoryCount('All')}) ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1.15 SET UP ALERTS FOR JOBS YOU WANT (Shown only when user clicks '🔔 Set Up Job Alerts' tab or 'Get started' to keep default view uncluttered) */}
      {selectedCategory === 'Job Alerts' && (
        <div
          id="connectln-alerts-job-alert-studio"
          className="rounded-2xl border-2 border-[#0A66C2] bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A66C2] text-white text-base font-black shrink-0 shadow-xs">
                🔔
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    Set Up Alerts for Jobs You Want
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      jobAlertEnabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {jobAlertEnabled ? '✓ Master Alert Toggle ON' : 'Master Alert Toggle OFF'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Create custom alerts for roles, trades, projects, apprenticeships, and companies you want to follow. Get notified as soon as matching jobs are posted.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={jobAlertEnabled}
                onClick={() => {
                  const next = !jobAlertEnabled
                  setJobAlertEnabled(next)
                  try {
                    localStorage.setItem('connectln_job_search_alert_enabled', String(next))
                    window.dispatchEvent(new Event('connectln-job-alert-updated'))
                  } catch {}
                }}
                className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-1.5 cursor-pointer"
              >
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Job Search Alert: {jobAlertEnabled ? 'ON' : 'OFF'}
                </span>
                <span
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                    jobAlertEnabled ? 'bg-[#0A66C2]' : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      jobAlertEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('jobs')}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Open Jobs Board →
              </button>
            </div>
          </div>

          {/* Create New Job Alert Form */}
          <form onSubmit={handleCreateCustomJobAlert} className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A66C2] dark:text-sky-400">
                + Create a New Job Search Alert
              </span>
              {jobAlertSavedToast && (
                <span className="rounded-full bg-emerald-600 text-white px-3 py-0.5 text-xs font-bold">
                  {jobAlertSavedToast}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Job Title, Trade, or Skill You Want
                </label>
                <input
                  type="text"
                  value={newAlertRole}
                  onChange={(e) => setNewAlertRole(e.target.value)}
                  placeholder="e.g. AI Consultant, Carpenter, Mechanic, Nurse..."
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Companies or Employers You Like
                </label>
                <input
                  type="text"
                  value={newAlertCompany}
                  onChange={(e) => setNewAlertCompany(e.target.value)}
                  placeholder="e.g. Any Verified Employer, Franchise, Hospital..."
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Location / Remote Preference
                </label>
                <input
                  type="text"
                  value={newAlertLocation}
                  onChange={(e) => setNewAlertLocation(e.target.value)}
                  placeholder="e.g. Laurel, MD · Remote / Hybrid"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Opportunity Type
                  </label>
                  <select
                    value={newAlertOpportunityType}
                    onChange={(e) => setNewAlertOpportunityType(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Employment">Employment</option>
                    <option value="Contract project">Contract Project</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Alert Frequency
                  </label>
                  <select
                    value={newAlertFrequency}
                    onChange={(e) => setNewAlertFrequency(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="Instant">Instant</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                + Save &amp; Activate Job Alert
              </button>
            </div>
          </form>

          {/* Saved Job Alerts List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                Your Configured Job Search Alerts ({savedJobAlerts.length})
              </h3>
              <span className="text-[11px] text-zinc-500">
                Synced with ConnectLn Jobs &amp; Work Workspace
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedJobAlerts.map((alertItem) => (
                <div
                  key={alertItem.id}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-all ${
                    alertItem.enabled
                      ? 'border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-900 shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {alertItem.roleOrTrade}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                          alertItem.enabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {alertItem.enabled ? `${alertItem.frequency} ON` : 'Paused'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      <strong>Companies:</strong> {alertItem.companies}
                    </p>
                    <p className="text-xs text-zinc-500">
                      📍 {alertItem.location} · 💼 {alertItem.opportunityType} · {alertItem.createdAt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSingleJobAlert(alertItem.id)}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                      >
                        {alertItem.enabled ? 'Pause Alert' : 'Turn On'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSingleJobAlert(alertItem.id)}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 hover:text-red-600 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigateTab && onNavigateTab('jobs')}
                      className="text-xs font-bold text-[#0A66C2] hover:underline cursor-pointer"
                    >
                      View Matching Jobs →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1.25 WEEKLY DIRECTORY LOOKUPS & VERIFIED PEER VOUCHES ALERT HUB (Only shown in 'All' or 'Lookups & Vouches' so Career/Social/Learning/Solutions/Security show their cards immediately at the top!) */}
      {(selectedCategory === 'All' || selectedCategory === 'Lookups & Vouches') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT CARD: WEEKLY DIRECTORY LOOKUPS & WHO WAS TRYING TO LOOKUP THE USER */}
          {(lookupVouchSubFilter === 'all' || lookupVouchSubFilter === 'lookups') && (
          <div className={`rounded-2xl border border-amber-300/80 dark:border-amber-800/70 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 p-5 shadow-xs flex flex-col justify-between ${lookupVouchSubFilter === 'lookups' ? 'lg:col-span-2' : ''}`}>
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900 dark:text-amber-300">
                    <span>🔍</span>
                    <span>WEEKLY LOOKUPS RADAR (PAST 7 DAYS)</span>
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1.5">
                    You Appeared in {weeklyLookupsCount} Lookups This Week
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Real-time directory search telemetry showing <strong className="text-zinc-900 dark:text-zinc-200">who was trying to look you up</strong> and the exact search query used.
                  </p>
                </div>
                <div className="shrink-0 rounded-xl bg-amber-600 text-white px-3.5 py-2 text-center shadow-xs">
                  <div className="text-xl font-black leading-none">{weeklyLookupsCount}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Weekly</div>
                </div>
              </div>

              {/* Interactive Breakdown Filter Pills */}
              <div className="grid grid-cols-2 gap-2 mb-3.5">
                <button
                  type="button"
                  onClick={() =>
                    setLookupActorTypeFilter(prev =>
                      prev === 'search_appearance' ? 'all' : 'search_appearance'
                    )
                  }
                  className={`rounded-xl border px-3 py-2 flex items-center justify-between transition-all cursor-pointer ${
                    lookupActorTypeFilter === 'search_appearance'
                      ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                      : "bg-white/90 dark:bg-zinc-800/90 border-amber-200/80 dark:border-zinc-700 hover:border-amber-400"
                  }`}
                >
                  <span className={`text-[11px] font-bold ${lookupActorTypeFilter === 'search_appearance' ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
                    🔎 Search Appearances
                  </span>
                  <span className={`text-sm font-black ${lookupActorTypeFilter === 'search_appearance' ? 'text-white' : 'text-amber-700 dark:text-amber-400'}`}>
                    {weeklySearchAppearances}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLookupActorTypeFilter(prev =>
                      prev === 'profile_click' ? 'all' : 'profile_click'
                    )
                  }
                  className={`rounded-xl border px-3 py-2 flex items-center justify-between transition-all cursor-pointer ${
                    lookupActorTypeFilter === 'profile_click'
                      ? "bg-[#0A66C2] text-white border-[#004182] shadow-xs"
                      : "bg-white/90 dark:bg-zinc-800/90 border-amber-200/80 dark:border-zinc-700 hover:border-blue-400"
                  }`}
                >
                  <span className={`text-[11px] font-bold ${lookupActorTypeFilter === 'profile_click' ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
                    👆 Direct Profile Clicks
                  </span>
                  <span className={`text-sm font-black ${lookupActorTypeFilter === 'profile_click' ? 'text-white' : 'text-[#0A66C2] dark:text-sky-400'}`}>
                    {weeklyProfileClicks}
                  </span>
                </button>
              </div>

              {/* Who Was Trying to Lookup You List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center justify-between">
                  <span>
                    Who Was Trying to Lookup You ({filteredLookupActors.length})
                    {lookupActorTypeFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setLookupActorTypeFilter('all')}
                        className="ml-2 text-[10px] underline text-[#0A66C2] cursor-pointer"
                      >
                        Show All ({recentLookupActors.length})
                      </button>
                    )}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-500">Keyword &amp; Vector</span>
                </div>
                {filteredLookupActors.slice(0, 6).map((actor) => (
                  <div
                    key={actor.id}
                    className="rounded-xl bg-white dark:bg-zinc-800/90 border border-zinc-200/90 dark:border-zinc-700/80 p-2.5 flex items-start justify-between gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <img
                        src={
                          actor.searcherAvatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(actor.searcherName)}&backgroundColor=0a66c2`
                        }
                        alt={actor.searcherName}
                        className="h-9 w-9 rounded-lg object-cover shrink-0 ring-1 ring-amber-300/60"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                            {actor.searcherName}
                          </span>
                          <span className="rounded-full bg-amber-100 dark:bg-amber-950/70 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:text-amber-300">
                            {actor.discoveryType === 'profile_click' ? 'Direct Lookup' : 'Search Appearance'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {actor.searcherHeadline} · {actor.searcherCompany}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800 px-1.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                            Query: &ldquo;{actor.keyword}&rdquo;
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">{actor.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-amber-200/60 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                Weekly lookup digest is automatically sent to your Alerts stream.
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Lookups & Vouches')
                  setLookupVouchSubFilter('lookups')
                }}
                className="rounded-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 text-[11px] font-extrabold transition-all shrink-0 cursor-pointer"
              >
                {selectedCategory === 'Lookups & Vouches' && lookupVouchSubFilter === 'lookups'
                  ? '✓ Filtering Lookup Alerts Below'
                  : 'Filter Lookup Alerts →'}
              </button>
            </div>
          </div>
          )}

          {/* RIGHT CARD: WHO VOUCHED FOR YOU (PEER VOUCH LEDGER IN ALERTS) */}
          {(lookupVouchSubFilter === 'all' || lookupVouchSubFilter === 'vouches') && (
          <div className={`rounded-2xl border border-emerald-300/80 dark:border-emerald-800/70 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 p-5 shadow-xs flex flex-col justify-between ${lookupVouchSubFilter === 'vouches' ? 'lg:col-span-2' : ''}`}>
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300">
                    <span>🤝</span>
                    <span>VERIFIED PEER VOUCHES LEDGER</span>
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1.5">
                    Who Vouched for You ({vouchEvents.length} Verified Vouches)
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Peers, supervisors, and trade partners who attested to your <strong className="text-zinc-900 dark:text-zinc-200">Proof-of-Work &amp; Verified Skills</strong>.
                  </p>
                </div>
                <div className="shrink-0 rounded-xl bg-emerald-600 text-white px-3.5 py-2 text-center shadow-xs">
                  <div className="text-xl font-black leading-none">{vouchEvents.length}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Vouches</div>
                </div>
              </div>

              {/* Who Vouched For You List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                  <span>Recent Peer Vouches &amp; Attestations</span>
                  <span className="text-[10px] font-semibold text-zinc-500">Skill / Credential</span>
                </div>
                {vouchEvents.slice(0, 6).map((vouch) => (
                  <div
                    key={vouch.id}
                    className="rounded-xl bg-white dark:bg-zinc-800/90 border border-zinc-200/90 dark:border-zinc-700/80 p-2.5 flex items-start justify-between gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <img
                        src={
                          vouch.voucherAvatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(vouch.voucherName)}&backgroundColor=059669`
                        }
                        alt={vouch.voucherName}
                        className="h-9 w-9 rounded-lg object-cover shrink-0 ring-1 ring-emerald-300/60"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                            {vouch.voucherName}
                          </span>
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
                            ✓ {vouch.voucherRelation}
                          </span>
                          {vouch.unread && (
                            <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {vouch.voucherHeadline} · {vouch.voucherCompany}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                            🤝 Vouched Skill: {vouch.skillOrCredential}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">{vouch.timeAgo}</span>
                        </div>
                        {vouch.note && (
                          <p className="mt-1 text-[11px] italic text-zinc-600 dark:text-zinc-300 line-clamp-2">
                            &ldquo;{vouch.note}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-emerald-200/60 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                Every peer endorsement &amp; trade vouch alerts you immediately.
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Lookups & Vouches')
                    setLookupVouchSubFilter('vouches')
                  }}
                  className="rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-2.5 py-1 text-[11px] font-extrabold transition-all shrink-0 cursor-pointer"
                >
                  Filter Vouch Alerts
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('profile')
                  }}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[11px] font-extrabold transition-all shrink-0 cursor-pointer"
                >
                  Open Profile Vouches →
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* 1.5 NOCTIS ALERTS INTELLIGENCE & SIGNAL EXPLANATION PANEL (Shown in 'All' view or when explicitly toggled) */}
      {showNoctisOverview && selectedCategory === 'All' && (
        <div className="rounded-2xl border border-[#D3E3FD] bg-[#F8FAFD] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E8F0FE] text-[#1967D2] px-2.5 py-0.5 text-xs font-extrabold">
                <span>✨</span>
                <span>Noctis</span>
              </span>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#041E49]">
                Noctis Live Alert &amp; Signal Explanation ({filteredNotifications.length} Alerts in View)
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>API Connected · /api/connectin/noctis</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => fetchNoctisAlertsBriefing()}
              disabled={isNoctisOverviewLoading}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 px-3.5 py-1 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{isNoctisOverviewLoading ? "Analyzing alerts with Noctis..." : noctisUpdatedAtLabel}</span>
              <span className={isNoctisOverviewLoading ? "animate-spin" : ""}>↻</span>
            </button>
          </div>

          <div className="rounded-xl bg-white border border-blue-100 p-4 mb-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium max-h-72 overflow-y-auto">
            {noctisOverviewText ||
              `Noctis is analyzing ${filteredNotifications.length} alerts (${filteredNotifications.filter(n => n.unread).length} unread) across your ConnectLn feed to explain what each signal represents and what actions to take...`}
          </div>

          {noctisCustomAnswer && (
            <div className="mb-3.5 rounded-xl bg-white border border-blue-300 p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-extrabold text-[#1967D2]">
                  💬 Noctis Deep-Dive Alert Answer:
                </span>
                <button
                  type="button"
                  onClick={() => setNoctisCustomAnswer(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Dismiss ✕
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {noctisCustomAnswer}
              </p>
            </div>
          )}

          {/* Ask Noctis About Any Alert Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!noctisAlertQuestion.trim()) return
              fetchNoctisAlertsBriefing(noctisAlertQuestion.trim())
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={noctisAlertQuestion}
              onChange={(e) => setNoctisAlertQuestion(e.target.value)}
              placeholder="Ask Noctis what any alert represents (e.g. 'Explain CVE-2026-44921', 'Explain USP <797>/<800>', 'Summarize my unread Career Signals')..."
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0A66C2] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isNoctisOverviewLoading || !noctisAlertQuestion.trim()}
              className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] disabled:bg-slate-300 px-4 py-2 text-xs font-extrabold text-white transition-all cursor-pointer shrink-0"
            >
              {isNoctisOverviewLoading ? "Asking Noctis..." : "Ask Noctis →"}
            </button>
          </form>

          {/* 1-Click Quick Alert Prompts */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {[
              "Explain what my critical Security & Clinical Advisories represent",
              "Explain USP <797>/<800> & Sepsis Hour-1 Bundle alerts in detail",
              "Summarize my unread Career & Interview alerts",
              "Which alerts require immediate action within 24 hours?"
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setNoctisAlertQuestion(chip)
                  fetchNoctisAlertsBriefing(chip)
                }}
                className="rounded-full bg-white hover:bg-blue-50 text-[#0A66C2] border border-blue-200 px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
              >
                ✨ {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. NOTIFICATIONS STREAM */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => {
          const isCriticalSecurity = notif.priority === 'critical'
          const isExpanded = expandedAlertIds.includes(notif.id)
          const exp = alertExplanationsMap[notif.id]
          const isLoadingSingle = loadingSingleAlertId === notif.id

          return (
            <div
              key={notif.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col gap-3.5 ${
                isCriticalSecurity
                  ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 shadow-md ring-2 ring-red-500/20"
                  : notif.unread
                  ? "border-[#0A66C2]/40 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Category Icon / Actor Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    {notif.actor.avatar ? (
                      <img
                        src={notif.actor.avatar}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 text-xl font-black dark:bg-purple-950 dark:text-purple-300">
                        🔔
                      </div>
                    )}

                    {/* Channel Tag Badge */}
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] shadow-xs dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                      {notif.category === 'Security'
                        ? '🛡️'
                        : notif.category === 'Career'
                        ? '💼'
                        : notif.category === 'Marketplace'
                        ? '🛍️'
                        : notif.category === 'Learning'
                        ? '🎓'
                        : '💬'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.2 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {notif.subType}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {notif.timestamp}
                      </span>
                      {notif.unread && (
                        <span className="h-2 w-2 rounded-full bg-[#0A66C2] animate-ping" />
                      )}
                    </div>

                    <h3 className={`font-bold text-sm sm:text-base leading-snug ${
                      isCriticalSecurity ? "text-red-700 dark:text-red-300 font-black" : "text-zinc-900 dark:text-zinc-100"
                    }`}>
                      {notif.title}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </div>

                {/* 1-Click Action Button + Explain with Noctis + Optional Live External Link */}
                <div className="flex items-center gap-2 flex-wrap shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleExplainSingleAlertWithNoctis(notif)}
                    className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isExpanded
                        ? "bg-[#1967D2] text-white"
                        : "bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1967D2] border border-[#1967D2]/30"
                    }`}
                    title="Ask Noctis to explain what this alert represents in detail"
                  >
                    <span>✨</span>
                    <span>{isExpanded ? "Hide Noctis Explanation" : "Explain with Noctis"}</span>
                  </button>

                  {notif.externalUrl && (
                    <a
                      href={notif.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full px-3.5 py-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 transition-all flex items-center gap-1 shadow-xs"
                    >
                      <span>{notif.externalLabel || 'Live Portal'}</span>
                      <span>↗</span>
                    </a>
                  )}
                  {notif.subType === 'New Follower' && notif.actor?.name && (() => {
                    const rel = getFollowRelationshipState(currentUserName, notif.actor.name)
                    return rel.isFollowing ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUserName) return
                          const res = unfollowMember({
                            actorName: currentUserName,
                            targetName: notif.actor.name
                          })
                          setFollowBundle(res.actorBundle)
                        }}
                        className="rounded-full border border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 px-3.5 py-2 text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Following (Unfollow)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUserName) return
                          const res = followMember({
                            actorName: currentUserName,
                            actorHeadline: currentUserProfession || 'Verified ConnectLn Professional',
                            targetName: notif.actor.name,
                            targetHeadline: notif.actor.role,
                            targetAvatar: notif.actor.avatar
                          })
                          if (res.ok && res.actorBundle) {
                            setFollowBundle(res.actorBundle)
                          }
                        }}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-extrabold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>+ Follow back</span>
                      </button>
                    )
                  })()}

                  <button
                    onClick={() => handleNotificationAction(notif)}
                    className={`rounded-full px-4 py-2 text-xs font-extrabold text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                      isCriticalSecurity
                        ? "bg-red-600 hover:bg-red-700"
                        : notif.category === 'Marketplace'
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                        : "bg-[#0A66C2] hover:bg-[#004182]"
                    }`}
                  >
                    <span>{notif.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Noctis Detailed Alert Breakdown Drawer */}
              {isExpanded && (
                <div className="rounded-xl border border-[#D3E3FD] bg-[#F8FAFD] p-4 text-slate-900 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-blue-200/70 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E8F0FE] text-[#1967D2] px-2 py-0.5 text-[11px] font-extrabold">
                        ✨ Noctis Alert Breakdown
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Detailed Explanation of What This Signal Represents
                      </span>
                    </div>
                    {isLoadingSingle && (
                      <span className="text-[11px] font-bold text-[#1967D2] animate-pulse">
                        Syncing with Noctis API...
                      </span>
                    )}
                  </div>

                  {exp ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl bg-white border border-blue-100 p-3">
                        <div className="font-extrabold text-[#1967D2] mb-1">
                          🔍 What This Alert Represents
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {exp.whatItRepresents}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white border border-blue-100 p-3">
                        <div className="font-extrabold text-amber-800 mb-1">
                          ⚡ Why It Matters &amp; Impact
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {exp.whyItMatters}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white border border-blue-100 p-3">
                        <div className="font-extrabold text-emerald-800 mb-1">
                          ✅ Noctis Recommended Action Plan
                        </div>
                        <ul className="space-y-1 text-slate-700 list-disc pl-4">
                          {exp.recommendedActionPlan.map((step, idx) => (
                            <li key={idx} className="leading-snug">
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">
                      Loading Noctis explanation for {notif.title}...
                    </p>
                  )}

                  {exp?.liveNoctisNote && (
                    <div className="rounded-xl bg-white border border-blue-200 p-3 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      <span className="font-extrabold text-[#1967D2] block mb-1">
                        ✨ Noctis Deep-Dive Response:
                      </span>
                      {exp.liveNoctisNote}
                    </div>
                  )}

                  {/* Ask Noctis a specific question about THIS alert */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const q = (singleAlertQuestions[notif.id] || "").trim()
                      if (!q) return
                      handleExplainSingleAlertWithNoctis(notif, q)
                    }}
                    className="flex flex-col sm:flex-row gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={singleAlertQuestions[notif.id] || ""}
                      onChange={(e) =>
                        setSingleAlertQuestions(prev => ({
                          ...prev,
                          [notif.id]: e.target.value
                        }))
                      }
                      placeholder={`Ask Noctis a specific question about "${notif.title.slice(0, 48)}..."`}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#0A66C2] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoadingSingle || !(singleAlertQuestions[notif.id] || "").trim()}
                      className="rounded-lg bg-[#1967D2] hover:bg-[#1557B0] disabled:bg-slate-300 px-3.5 py-1.5 text-xs font-extrabold text-white transition-all cursor-pointer shrink-0"
                    >
                      {isLoadingSingle ? "Asking Noctis..." : "Ask Noctis About This Alert →"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )
        })}

        {filteredNotifications.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
            <Bell className="mx-auto h-8 w-8 text-zinc-400" />
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              No notifications in this category
            </h4>
            <p className="text-xs text-zinc-500">
              You are completely up to date with all signals.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
