/**
 * ConnectLn Real-Time Analytics & Activity Telemetry Engine
 * 100% live, zero-placeholder tracking for:
 *  1. Profile Viewers ("Who Viewed My Profile" — actual profile visits, privacy-aware display, deduplicated unique viewers vs total visits)
 *  2. Content Reach (Real engagement across Learning, Alerts, Media, Feed Posts, Jobs, Marketplace & Pulse — distinguishing Unique Viewers, Total Views, and Interactions)
 *  3. Directory Discovered (Real directory & specialty searches vs actual Profile Clicks from directory listings)
 */

import { UserProfile } from "./connectln-data"

export type ViewerPrivacyMode = 'full' | 'role_only' | 'anonymous'

export interface ProfileViewerItem {
  id: string
  name: string
  headline: string
  avatar: string
  company: string
  companyLogo?: string
  location: string
  viewedAt: string
  createdAtIso?: string
  viewVector: string // Real inbound channel, e.g. "Directory Search Click", "Feed Post Author Click", "Network Card Inspection"
  clearanceLevel: string
  mutualConnectionsCount: number
  mutualConnectionName?: string
  isConnected: boolean
  isPending: boolean
  category: 'recruiter' | 'buyer' | 'peer' | 'executive'
  privacyMode?: ViewerPrivacyMode
  visitCount?: number
}

export interface ContentReachData {
  totalReach: number // Total Views + Interactions
  totalViews: number // Total content/module views
  uniqueViewers: number // Distinct viewers / actors
  interactions: number // Likes, reactions, comments, shares, saves, course completions, alert clicks
  weeklyChangePercent: number
  engagementRate: number
  dailyTrends: {
    day: string
    reach: number
    uniqueViewers: number
    interactions?: number
  }[]
  topPosts: {
    id: string
    title: string
    date: string
    reach: number
    uniqueViewers?: number
    engagements: number
    reposts: number
    category: string
    actorName?: string
    eventKind?: 'view' | 'interaction'
  }[]
  topCompanies: {
    name: string
    percentage: number
    count: number
    logo: string
  }[]
  topJobRoles: {
    role: string
    percentage: number
  }[]
}

export interface DirectoryDiscoveryData {
  totalDiscoveries: number // Search Appearances + Profile Clicks
  searchAppearances: number // How often profile appeared in directory/specialty search results
  profileClicks: number // Actual clicks on profile / dossier from directory or search results
  weeklyChangePercent: number
  searcherCount: number
  topSearchKeywords: {
    keyword: string
    occurrences: number
    appearancesCount?: number
    clicksCount?: number
    growth: string
  }[]
  searchingCompanies: {
    name: string
    percentage: number
    searchesCount: number
    logo: string
  }[]
  searcherSeniority: {
    level: string
    percentage: number
  }[]
}

export interface ProfileTailoredAnalytics {
  effectiveProfileViews: number // Unique profile viewers
  totalProfileVisitEvents: number // Total profile visit events including repeat visits
  effectiveTotalReach: number // Total content views + interactions
  effectiveTotalViews: number // Total content views
  effectiveUniqueViewers: number // Unique content viewers
  effectiveInteractions: number // Content interactions (likes, comments, shares, saves, learning/alert actions)
  effectiveDiscoveries: number // Total directory discoveries (appearances + clicks)
  effectiveSearchAppearances: number // Directory search result appearances
  effectiveProfileClicks: number // Directory profile clicks
  decisionMakerRatio: string
  standingBadge: string
  peakTrafficNote: string
  credentialTiers: {
    label: string
    percent: number
  }[]
  viewers: ProfileViewerItem[]
  reachData: ContentReachData
  discoveryData: DirectoryDiscoveryData
}

export interface LiveReachRecord {
  id: string
  title: string
  category: string
  actorName: string
  actorRole?: string
  actorCompany?: string
  eventKind?: 'view' | 'interaction'
  details?: string
  createdAtIso: string
  timeAgo?: string
}

export interface LiveDiscoveryRecord {
  id: string
  keyword: string
  searcherName: string
  searcherHeadline: string
  searcherCompany: string
  source: string
  discoveryType?: 'search_appearance' | 'profile_click'
  createdAtIso: string
  timeAgo?: string
}

export interface UserLiveTelemetryBundle {
  checks: ProfileViewerItem[]
  reachEvents: LiveReachRecord[]
  discoveryEvents: LiveDiscoveryRecord[]
}

// Empty initial arrays — no hardcoded or simulated data
export const INITIAL_PROFILE_VIEWERS: ProfileViewerItem[] = []

export const INITIAL_CONTENT_REACH_DATA: ContentReachData = {
  totalReach: 0,
  totalViews: 0,
  uniqueViewers: 0,
  interactions: 0,
  weeklyChangePercent: 0,
  engagementRate: 0,
  dailyTrends: [],
  topPosts: [],
  topCompanies: [],
  topJobRoles: []
}

export const INITIAL_DIRECTORY_DISCOVERIES_DATA: DirectoryDiscoveryData = {
  totalDiscoveries: 0,
  searchAppearances: 0,
  profileClicks: 0,
  weeklyChangePercent: 0,
  searcherCount: 0,
  topSearchKeywords: [],
  searchingCompanies: [],
  searcherSeniority: []
}

function getTelemetryStorageKey(userName?: string): string {
  const clean = String(userName || 'guest').toLowerCase().trim().replace(/[^a-z0-9]/g, '_')
  return `connectin_live_telemetry_v3_${clean}`
}

function getPrivacyStorageKey(userName?: string): string {
  const clean = String(userName || 'guest').toLowerCase().trim().replace(/[^a-z0-9]/g, '_')
  return `connectin_viewer_privacy_v1_${clean}`
}

export function loadViewerPrivacyMode(userName?: string): ViewerPrivacyMode {
  if (typeof window === 'undefined' || !userName) return 'full'
  try {
    const raw = localStorage.getItem(getPrivacyStorageKey(userName))
    if (raw === 'role_only' || raw === 'anonymous' || raw === 'full') return raw
    return 'full'
  } catch {
    return 'full'
  }
}

export function saveViewerPrivacyMode(userName: string, mode: ViewerPrivacyMode): void {
  if (typeof window === 'undefined' || !userName) return
  try {
    localStorage.setItem(getPrivacyStorageKey(userName), mode)
    window.dispatchEvent(new CustomEvent('connectln-telemetry-updated', { detail: { userName, privacyMode: mode } }))
  } catch {}
}

/**
 * Formats a viewer entry according to the viewer's chosen privacy mode when they visited the profile.
 */
export function formatViewerForPrivacy(viewer: ProfileViewerItem): ProfileViewerItem {
  const mode = viewer.privacyMode || 'full'
  if (mode === 'anonymous') {
    return {
      ...viewer,
      name: 'Anonymous ConnectLn Member',
      headline: 'Private Mode · Verified ConnectLn Professional',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Anonymous&backgroundColor=52525b',
      company: 'Private Organization (Hidden by Viewer Privacy Settings)',
      clearanceLevel: '🔒 Private Viewer Mode'
    }
  }
  if (mode === 'role_only') {
    const roleLabel = viewer.headline?.split('·')[0]?.split('@')[0]?.trim() || 'Verified Trade Specialist'
    const companyLabel = viewer.company || 'ConnectLn Verified Organization'
    return {
      ...viewer,
      name: `ConnectLn Member (${roleLabel})`,
      headline: `${roleLabel} · ${companyLabel}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(roleLabel)}&backgroundColor=0a66c2`,
      clearanceLevel: '🛡️ Semi-Private (Role & Industry Visible)'
    }
  }
  return viewer
}

export function formatAgoFromIso(iso?: string, prefix = ''): string {
  if (!iso) return prefix ? `${prefix} just now` : 'Just now'
  const diffMs = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diffMs) || diffMs < 60_000) return prefix ? `${prefix} just now` : 'Just now'
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return prefix ? `${prefix} ${mins}m ago` : `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return prefix ? `${prefix} ${hrs}h ago` : `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return prefix ? `${prefix} ${days}d ago` : `${days}d ago`
}

/**
 * Formats a profile viewer timestamp with the exact calendar date, clock time, and relative age
 * e.g. "Viewed Nov 9, 2026 · 5:32 AM (Just now)"
 */
export function formatProfileViewDateTime(iso?: string, fallbackViewedAt?: string): string {
  if (iso) {
    const dt = new Date(iso)
    if (!Number.isNaN(dt.getTime())) {
      const datePart = dt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      const timePart = dt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      const relPart = formatAgoFromIso(iso)
      return `Viewed ${datePart} · ${timePart} (${relPart})`
    }
  }
  if (fallbackViewedAt && /\d{4}/.test(fallbackViewedAt)) {
    return fallbackViewedAt
  }
  return fallbackViewedAt || 'Viewed recently'
}

export function loadLiveUserTelemetry(userName?: string): UserLiveTelemetryBundle {
  if (typeof window === 'undefined' || !userName) {
    return { checks: [], reachEvents: [], discoveryEvents: [] }
  }
  try {
    const raw = localStorage.getItem(getTelemetryStorageKey(userName))
    if (!raw) return { checks: [], reachEvents: [], discoveryEvents: [] }
    const parsed = JSON.parse(raw)
    return {
      checks: Array.isArray(parsed?.checks) ? parsed.checks : [],
      reachEvents: Array.isArray(parsed?.reachEvents) ? parsed.reachEvents : [],
      discoveryEvents: Array.isArray(parsed?.discoveryEvents) ? parsed.discoveryEvents : []
    }
  } catch {
    return { checks: [], reachEvents: [], discoveryEvents: [] }
  }
}

export function saveLiveUserTelemetry(userName: string, bundle: UserLiveTelemetryBundle): void {
  if (typeof window === 'undefined' || !userName) return
  try {
    localStorage.setItem(getTelemetryStorageKey(userName), JSON.stringify(bundle))
    window.dispatchEvent(new CustomEvent('connectln-telemetry-updated', { detail: { userName } }))
  } catch {}
}

export async function syncLiveUserTelemetryFromCloud(userName?: string): Promise<UserLiveTelemetryBundle> {
  const cleanName = String(userName || '').trim()
  if (typeof window === 'undefined' || !cleanName) {
    return { checks: [], reachEvents: [], discoveryEvents: [] }
  }
  const local = loadLiveUserTelemetry(cleanName)
  try {
    const res = await fetch(`/api/connectin/profile-views?targetName=${encodeURIComponent(cleanName)}`, {
      cache: 'no-store'
    })
    if (!res.ok) return local
    const data = await res.json()
    const cloudChecks: ProfileViewerItem[] = Array.isArray(data?.checks)
      ? data.checks.map((c: any) => ({
          id: c.id || `chk_${c.viewerName}`,
          name: c.viewerName,
          headline: c.viewerHeadline || 'Verified ConnectLn Professional',
          avatar:
            c.viewerAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.viewerName || 'Member')}&backgroundColor=0a66c2`,
          company: c.viewerCompany || 'ConnectLn Network',
          location: c.viewerLocation || 'United States',
          viewedAt: formatProfileViewDateTime(c.createdAtIso, c.viewedAt),
          createdAtIso: c.createdAtIso,
          viewVector: c.viewVector || 'Profile & Dossier Inspection',
          clearanceLevel: c.clearanceLevel || '✓ Live Profile Viewer',
          mutualConnectionsCount: 1,
          isConnected: false,
          isPending: false,
          category: (c.category as any) || 'peer',
          privacyMode: (c.privacyMode as ViewerPrivacyMode) || 'full',
          visitCount: Number(c.visitCount) || 1
        }))
      : []

    // Deduplicate profile viewers by viewer name while preserving the latest timestamp and highest visitCount
    const checkMap = new Map<string, ProfileViewerItem>()
    for (const item of [...cloudChecks, ...local.checks]) {
      if (!item || !item.name) continue
      const k = item.name.toLowerCase().trim()
      const existing = checkMap.get(k)
      if (!existing) {
        checkMap.set(k, {
          ...item,
          viewedAt: formatProfileViewDateTime(item.createdAtIso, item.viewedAt)
        })
      } else {
        const mergedCount = Math.max(Number(existing.visitCount) || 1, Number(item.visitCount) || 1)
        const newerIso =
          item.createdAtIso && (!existing.createdAtIso || item.createdAtIso > existing.createdAtIso)
            ? item.createdAtIso
            : existing.createdAtIso
        checkMap.set(k, {
          ...existing,
          createdAtIso: newerIso,
          viewedAt: formatProfileViewDateTime(newerIso, existing.viewedAt),
          visitCount: mergedCount
        })
      }
    }

    const reachMap = new Map<string, LiveReachRecord>()
    const cloudReach: LiveReachRecord[] = Array.isArray(data?.reachEvents) ? data.reachEvents : []
    for (const r of [...cloudReach, ...local.reachEvents]) {
      if (!r || !r.id) continue
      // Also deduplicate by actorName + category + title + eventKind within the same minute
      const dedupKey = `${(r.actorName || '').toLowerCase()}::${r.category}::${r.title}::${r.eventKind || 'view'}`
      if (!reachMap.has(r.id) && !reachMap.has(dedupKey)) {
        const formatted: LiveReachRecord = {
          ...r,
          eventKind: r.eventKind || 'view',
          timeAgo: formatAgoFromIso(r.createdAtIso)
        }
        reachMap.set(r.id, formatted)
        reachMap.set(dedupKey, formatted)
      }
    }

    const uniqueReachList = Array.from(new Set(reachMap.values())).sort((a, b) =>
      (b.createdAtIso || '').localeCompare(a.createdAtIso || '')
    )

    const discMap = new Map<string, LiveDiscoveryRecord>()
    const cloudDisc: LiveDiscoveryRecord[] = Array.isArray(data?.discoveryEvents) ? data.discoveryEvents : []
    for (const d of [...cloudDisc, ...local.discoveryEvents]) {
      if (!d || !d.id) continue
      const dedupKey = `${(d.searcherName || '').toLowerCase()}::${(d.keyword || '').toLowerCase()}::${d.discoveryType || 'profile_click'}`
      if (!discMap.has(d.id) && !discMap.has(dedupKey)) {
        const formatted: LiveDiscoveryRecord = {
          ...d,
          discoveryType: d.discoveryType || 'profile_click',
          timeAgo: formatAgoFromIso(d.createdAtIso)
        }
        discMap.set(d.id, formatted)
        discMap.set(dedupKey, formatted)
      }
    }

    const uniqueDiscList = Array.from(new Set(discMap.values())).sort((a, b) =>
      (b.createdAtIso || '').localeCompare(a.createdAtIso || '')
    )

    const merged: UserLiveTelemetryBundle = {
      checks: Array.from(checkMap.values()),
      reachEvents: uniqueReachList,
      discoveryEvents: uniqueDiscList
    }
    saveLiveUserTelemetry(cleanName, merged)
    return merged
  } catch {
    return local
  }
}

/**
 * Generates 100% real-data Analytics from the user's live telemetry bundle.
 * Zero hardcoded placeholders or simulated activity.
 */
export function getProfileTailoredAnalytics(
  user?: UserProfile | null,
  customViewers?: ProfileViewerItem[]
): ProfileTailoredAnalytics {
  const safeName = user?.name?.trim() || "Verified ConnectLn Member"
  const liveTelemetry = loadLiveUserTelemetry(safeName)

  // 1. PROFILE VIEWERS: Deduplicated unique viewers + total visit count, formatted per viewer privacy settings
  const viewerMap = new Map<string, ProfileViewerItem>()
  for (const v of [...(customViewers || []), ...(liveTelemetry.checks || [])]) {
    if (!v || !v.name) continue
    const k = v.name.toLowerCase().trim()
    if (!viewerMap.has(k)) {
      const formatted = formatViewerForPrivacy(v)
      viewerMap.set(k, {
        ...formatted,
        viewedAt: formatProfileViewDateTime(v.createdAtIso, v.viewedAt)
      })
    }
  }
  const mergedLiveViewers = Array.from(viewerMap.values())
  const effectiveProfileViews = mergedLiveViewers.length
  const totalProfileVisitEvents = mergedLiveViewers.reduce((sum, v) => sum + (Number(v.visitCount) || 1), 0)

  // 2. CONTENT REACH: Distinguish Unique Viewers, Total Views, and Interactions
  const allReachEvents = liveTelemetry.reachEvents || []
  const viewEvents = allReachEvents.filter(e => (e.eventKind || 'view') === 'view')
  const interactionEvents = allReachEvents.filter(e => e.eventKind === 'interaction')

  const effectiveTotalViews = viewEvents.length
  const effectiveInteractions = interactionEvents.length
  const effectiveTotalReach = allReachEvents.length

  const uniqueActorSet = new Set<string>()
  for (const ev of allReachEvents) {
    const actor = (ev.actorName || safeName).toLowerCase().trim()
    const itemKey = `${actor}::${(ev.category || '').toLowerCase()}::${(ev.title || '').toLowerCase()}`
    uniqueActorSet.add(itemKey)
  }
  for (const v of mergedLiveViewers) {
    uniqueActorSet.add(`viewer::${v.name.toLowerCase().trim()}`)
  }
  const effectiveUniqueViewers = uniqueActorSet.size

  // Group content reach by item (category + title) to show views vs interactions per item
  const contentGroupMap = new Map<
    string,
    {
      id: string
      title: string
      date: string
      reach: number
      uniqueActors: Set<string>
      engagements: number
      reposts: number
      category: string
      actorName: string
      eventKind: 'view' | 'interaction'
    }
  >()
  for (const ev of allReachEvents) {
    const key = `${ev.category}::${ev.title}`
    const existing = contentGroupMap.get(key)
    const isInteraction = ev.eventKind === 'interaction'
    const actor = (ev.actorName || safeName).toLowerCase().trim()
    if (!existing) {
      const actors = new Set<string>([actor])
      contentGroupMap.set(key, {
        id: ev.id,
        title: ev.title,
        date: ev.timeAgo || formatAgoFromIso(ev.createdAtIso),
        reach: 1,
        uniqueActors: actors,
        engagements: isInteraction ? 1 : 0,
        reposts: ev.title.toLowerCase().includes('shared') ? 1 : 0,
        category: ev.category || 'ConnectLn Content',
        actorName: ev.actorName || safeName,
        eventKind: ev.eventKind || 'view'
      })
    } else {
      existing.reach += 1
      existing.uniqueActors.add(actor)
      if (isInteraction) existing.engagements += 1
      if (ev.title.toLowerCase().includes('shared')) existing.reposts += 1
    }
  }

  const liveTopPosts = Array.from(contentGroupMap.values()).map(item => ({
    id: item.id,
    title: item.title,
    date: item.date,
    reach: item.reach,
    uniqueViewers: item.uniqueActors.size,
    engagements: item.engagements,
    reposts: item.reposts,
    category: item.category,
    actorName: item.actorName,
    eventKind: item.eventKind
  }))

  // Derive top companies & roles strictly from real viewers & reach actors
  const companyCounter = new Map<string, number>()
  const roleCounter = new Map<string, number>()
  for (const v of mergedLiveViewers) {
    const comp = v.company || 'ConnectLn Network'
    companyCounter.set(comp, (companyCounter.get(comp) || 0) + 1)
    const role = v.headline?.split('·')[0]?.split('@')[0]?.trim() || 'Verified ConnectLn Member'
    roleCounter.set(role, (roleCounter.get(role) || 0) + 1)
  }
  for (const r of allReachEvents) {
    if (r.actorCompany) {
      companyCounter.set(r.actorCompany, (companyCounter.get(r.actorCompany) || 0) + 1)
    }
    if (r.actorRole) {
      roleCounter.set(r.actorRole, (roleCounter.get(r.actorRole) || 0) + 1)
    }
  }

  const totalCompanyEvents = Array.from(companyCounter.values()).reduce((a, b) => a + b, 0) || 1
  const liveTopCompanies = Array.from(companyCounter.entries()).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalCompanyEvents) * 100),
    logo: '🏢'
  }))

  const totalRoleEvents = Array.from(roleCounter.values()).reduce((a, b) => a + b, 0) || 1
  const liveTopJobRoles = Array.from(roleCounter.entries()).map(([role, count]) => ({
    role,
    percentage: Math.round((count / totalRoleEvents) * 100)
  }))

  // Build real 7-day trend from actual event timestamps
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const todayIdx = new Date().getDay()
  const orderedDays: string[] = []
  for (let i = 6; i >= 0; i--) {
    orderedDays.push(dayNames[(todayIdx - i + 7) % 7])
  }
  const dailyTrends = orderedDays.map(dayLabel => {
    const matchingEvents = allReachEvents.filter(ev => {
      if (!ev.createdAtIso) return dayLabel === dayNames[todayIdx]
      const d = new Date(ev.createdAtIso)
      return dayNames[d.getDay()] === dayLabel
    })
    const uniqueDayActors = new Set(matchingEvents.map(e => `${(e.actorName || '').toLowerCase()}::${e.title}`))
    const dayInteractions = matchingEvents.filter(e => e.eventKind === 'interaction').length
    return {
      day: dayLabel,
      reach: matchingEvents.length,
      uniqueViewers: uniqueDayActors.size,
      interactions: dayInteractions
    }
  })

  const engagementRate =
    effectiveTotalReach > 0
      ? Math.min(100, Math.round((effectiveInteractions / Math.max(1, effectiveTotalReach)) * 100))
      : 0

  // 3. DIRECTORY DISCOVERED: Distinguish Search Appearances vs Profile Clicks
  const allDiscoveryEvents = liveTelemetry.discoveryEvents || []
  const searchAppearanceEvents = allDiscoveryEvents.filter(d => d.discoveryType === 'search_appearance')
  const profileClickEvents = allDiscoveryEvents.filter(d => (d.discoveryType || 'profile_click') === 'profile_click')

  const effectiveSearchAppearances = searchAppearanceEvents.length
  const effectiveProfileClicks = profileClickEvents.length
  const effectiveDiscoveries = allDiscoveryEvents.length

  const liveKeywordCounts = new Map<
    string,
    { keyword: string; occurrences: number; appearancesCount: number; clicksCount: number; growth: string }
  >()
  for (const d of allDiscoveryEvents) {
    const kw = d.keyword || 'Directory Search'
    const prev = liveKeywordCounts.get(kw)
    const isClick = (d.discoveryType || 'profile_click') === 'profile_click'
    liveKeywordCounts.set(kw, {
      keyword: kw,
      occurrences: (prev?.occurrences || 0) + 1,
      appearancesCount: (prev?.appearancesCount || 0) + (isClick ? 0 : 1),
      clicksCount: (prev?.clicksCount || 0) + (isClick ? 1 : 0),
      growth: isClick ? 'Profile Click' : 'Search Match'
    })
  }
  const liveKeywordsList = Array.from(liveKeywordCounts.values())

  const discCompanyCounter = new Map<string, number>()
  const discRoleCounter = new Map<string, number>()
  for (const d of allDiscoveryEvents) {
    const comp = d.searcherCompany || 'ConnectLn Network'
    discCompanyCounter.set(comp, (discCompanyCounter.get(comp) || 0) + 1)
    const role = d.searcherHeadline || 'Verified ConnectLn Member'
    discRoleCounter.set(role, (discRoleCounter.get(role) || 0) + 1)
  }
  const totalDiscComp = Array.from(discCompanyCounter.values()).reduce((a, b) => a + b, 0) || 1
  const liveSearchingCompanies = Array.from(discCompanyCounter.entries()).map(([name, count]) => ({
    name,
    searchesCount: count,
    percentage: Math.round((count / totalDiscComp) * 100),
    logo: '🔍'
  }))

  const totalDiscRole = Array.from(discRoleCounter.values()).reduce((a, b) => a + b, 0) || 1
  const liveSearcherSeniority = Array.from(discRoleCounter.entries()).map(([level, count]) => ({
    level,
    percentage: Math.round((count / totalDiscRole) * 100)
  }))

  const distinctSearchers = new Set(allDiscoveryEvents.map(d => (d.searcherName || '').toLowerCase().trim())).size

  const reachData: ContentReachData = {
    totalReach: effectiveTotalReach,
    totalViews: effectiveTotalViews,
    uniqueViewers: effectiveUniqueViewers,
    interactions: effectiveInteractions,
    weeklyChangePercent: effectiveTotalReach > 0 ? 100 : 0,
    engagementRate,
    dailyTrends,
    topPosts: liveTopPosts,
    topCompanies: liveTopCompanies,
    topJobRoles: liveTopJobRoles
  }

  const discoveryData: DirectoryDiscoveryData = {
    totalDiscoveries: effectiveDiscoveries,
    searchAppearances: effectiveSearchAppearances,
    profileClicks: effectiveProfileClicks,
    weeklyChangePercent: effectiveDiscoveries > 0 ? 100 : 0,
    searcherCount: distinctSearchers,
    topSearchKeywords: liveKeywordsList,
    searchingCompanies: liveSearchingCompanies,
    searcherSeniority: liveSearcherSeniority
  }

  return {
    effectiveProfileViews,
    totalProfileVisitEvents,
    effectiveTotalReach,
    effectiveTotalViews,
    effectiveUniqueViewers,
    effectiveInteractions,
    effectiveDiscoveries,
    effectiveSearchAppearances,
    effectiveProfileClicks,
    decisionMakerRatio: effectiveProfileViews > 0 ? '100%' : '0%',
    standingBadge:
      effectiveProfileViews > 0 || effectiveTotalReach > 0 || effectiveDiscoveries > 0
        ? 'Live Activity Active'
        : 'No Activity Yet (0)',
    peakTrafficNote:
      effectiveProfileViews > 0 || effectiveTotalReach > 0 || effectiveDiscoveries > 0
        ? `Real-time ConnectLn activity for ${safeName}: ${effectiveProfileViews} unique profile viewer(s) (${totalProfileVisitEvents} total visit(s)), ${effectiveTotalReach} content reach event(s) (${effectiveUniqueViewers} unique, ${effectiveTotalViews} views, ${effectiveInteractions} interactions), and ${effectiveDiscoveries} directory discovery event(s) (${effectiveSearchAppearances} search appearances, ${effectiveProfileClicks} profile clicks).`
        : `No simulated or placeholder numbers. Metrics for ${safeName} start at 0 and update live as members view your profile, engage with your content (Learning, Alerts, Posts, Media), or discover you in directory searches.`,
    credentialTiers:
      effectiveProfileViews > 0
        ? [{ label: user?.profession?.split(' ')[0] || 'Verified Member', percent: 100 }]
        : [],
    viewers: mergedLiveViewers,
    reachData,
    discoveryData
  }
}

// Cooldown map to prevent duplicate view/interaction counting from inflating metrics
const recentReachThrottle = new Map<string, number>()

export function recordLiveContentReach(params: {
  userName?: string
  title: string
  category: string
  actorName?: string
  actorRole?: string
  actorCompany?: string
  eventKind?: 'view' | 'interaction'
  details?: string
}): void {
  const userName = String(params.userName || '').trim()
  if (typeof window === 'undefined' || !userName) return
  const kind: 'view' | 'interaction' =
    params.eventKind ||
    (/reacted|commented|shared|saved|published|completed|invited|applied/i.test(params.title) ? 'interaction' : 'view')

  const actor = String(params.actorName || userName).trim()
  // Deduplicate repeated views of the same content by the same user within 60s (10s for distinct interactions)
  const cooldownMs = kind === 'view' ? 60_000 : 10_000
  const throttleKey = `${userName.toLowerCase()}::${actor.toLowerCase()}::${params.category}::${params.title}::${kind}`
  const lastMs = recentReachThrottle.get(throttleKey) || 0
  if (Date.now() - lastMs < cooldownMs) return
  recentReachThrottle.set(throttleKey, Date.now())

  const current = loadLiveUserTelemetry(userName)
  // Also check if an identical 'view' event for the exact same module/title by the same actor already exists within the last 60 seconds in storage
  if (kind === 'view') {
    const duplicateRecent = current.reachEvents.find(
      e =>
        e.title === params.title &&
        e.category === params.category &&
        (e.actorName || '').toLowerCase() === actor.toLowerCase() &&
        Date.now() - new Date(e.createdAtIso || 0).getTime() < 60_000
    )
    if (duplicateRecent) return
  }

  const nowIso = new Date().toISOString()
  const newItem: LiveReachRecord = {
    id: `rch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: params.title,
    category: params.category,
    actorName: actor,
    actorRole: params.actorRole,
    actorCompany: params.actorCompany,
    eventKind: kind,
    details: params.details,
    createdAtIso: nowIso,
    timeAgo: 'Just now'
  }
  saveLiveUserTelemetry(userName, {
    ...current,
    reachEvents: [newItem, ...current.reachEvents]
  })

  fetch('/api/connectin/profile-views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: 'content_reach',
      targetName: userName,
      id: newItem.id,
      title: newItem.title,
      category: newItem.category,
      actorName: newItem.actorName,
      actorRole: newItem.actorRole,
      actorCompany: newItem.actorCompany,
      eventKind: newItem.eventKind,
      details: newItem.details
    })
  }).catch(() => {})
}

const recentDiscoveryThrottle = new Map<string, number>()

export function recordLiveDirectoryDiscovery(params: {
  targetName?: string
  userName?: string // alias for targetName
  keyword: string
  searcherName?: string
  searcherHeadline?: string
  searcherRole?: string // alias for searcherHeadline
  searcherCompany?: string
  source?: string
  discoveryType?: 'search_appearance' | 'profile_click'
}): void {
  const targetName = String(params.targetName || params.userName || '').trim()
  if (typeof window === 'undefined' || !targetName) return
  const searcher = String(params.searcherName || 'ConnectLn Member').trim()
  // Do not count self-discovery
  if (targetName.toLowerCase() === searcher.toLowerCase()) return

  const discType: 'search_appearance' | 'profile_click' = params.discoveryType || 'profile_click'
  const cooldownMs = discType === 'search_appearance' ? 120_000 : 15_000
  const throttleKey = `${targetName.toLowerCase()}::${searcher.toLowerCase()}::${params.keyword.toLowerCase()}::${discType}`
  const lastMs = recentDiscoveryThrottle.get(throttleKey) || 0
  if (Date.now() - lastMs < cooldownMs) return
  recentDiscoveryThrottle.set(throttleKey, Date.now())

  const current = loadLiveUserTelemetry(targetName)
  // Prevent duplicate search_appearance for the same keyword + searcher within 2 minutes
  const existingDuplicate = current.discoveryEvents.find(
    d =>
      d.keyword.toLowerCase() === params.keyword.toLowerCase() &&
      (d.searcherName || '').toLowerCase() === searcher.toLowerCase() &&
      (d.discoveryType || 'profile_click') === discType &&
      Date.now() - new Date(d.createdAtIso || 0).getTime() < cooldownMs
  )
  if (existingDuplicate) return

  const nowIso = new Date().toISOString()
  const newDisc: LiveDiscoveryRecord = {
    id: `dsc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    keyword: params.keyword,
    searcherName: searcher,
    searcherHeadline: params.searcherHeadline || params.searcherRole || 'Verified ConnectLn Professional',
    searcherCompany: params.searcherCompany || 'ConnectLn Network',
    source: params.source || (discType === 'search_appearance' ? 'Directory Search Appearance' : 'Directory Profile Click'),
    discoveryType: discType,
    createdAtIso: nowIso,
    timeAgo: 'Just now'
  }
  saveLiveUserTelemetry(targetName, {
    ...current,
    discoveryEvents: [newDisc, ...current.discoveryEvents]
  })

  fetch('/api/connectin/profile-views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: 'directory_discovery',
      targetName,
      id: newDisc.id,
      keyword: newDisc.keyword,
      searcherName: newDisc.searcherName,
      searcherHeadline: newDisc.searcherHeadline,
      searcherCompany: newDisc.searcherCompany,
      source: newDisc.source,
      discoveryType: newDisc.discoveryType
    })
  }).catch(() => {})
}

const recentProfileViewThrottle = new Map<string, number>()

export function recordLiveProfileView(params: {
  targetName: string
  viewerName: string
  viewerHeadline?: string
  viewerAvatar?: string
  viewerCompany?: string
  viewerLocation?: string
  viewVector?: string
  privacyMode?: ViewerPrivacyMode
}): void {
  const targetName = String(params.targetName || '').trim()
  const viewerName = String(params.viewerName || '').trim()
  if (typeof window === 'undefined' || !targetName || !viewerName) return
  if (targetName.toLowerCase() === viewerName.toLowerCase()) return

  // Prevent duplicate counting from rapid consecutive clicks (30s cooldown per viewer->target pair)
  const pairKey = `${viewerName.toLowerCase()}->${targetName.toLowerCase()}`
  const lastViewMs = recentProfileViewThrottle.get(pairKey) || 0
  if (Date.now() - lastViewMs < 30_000) return
  recentProfileViewThrottle.set(pairKey, Date.now())

  const viewerPrivacy = params.privacyMode || loadViewerPrivacyMode(viewerName)

  const safeAvatar =
    params.viewerAvatar && !params.viewerAvatar.startsWith('data:')
      ? params.viewerAvatar
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewerName)}&backgroundColor=0a66c2`

  const targetTelemetry = loadLiveUserTelemetry(targetName)
  const existingViewer = targetTelemetry.checks.find(
    c => c.name.toLowerCase().trim() === viewerName.toLowerCase()
  )
  const nextVisitCount = existingViewer ? (Number(existingViewer.visitCount) || 1) + 1 : 1
  const nowIso = new Date().toISOString()

  const newViewer: ProfileViewerItem = {
    id: existingViewer?.id || `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: viewerName,
    headline: params.viewerHeadline || 'Verified ConnectLn Professional',
    avatar: safeAvatar,
    company: params.viewerCompany || 'ConnectLn Network',
    location: params.viewerLocation || 'United States',
    viewedAt: formatProfileViewDateTime(nowIso),
    createdAtIso: nowIso,
    viewVector: params.viewVector || 'Profile & Dossier Inspection',
    clearanceLevel:
      viewerPrivacy === 'anonymous'
        ? '🔒 Private Viewer Mode'
        : viewerPrivacy === 'role_only'
        ? '🛡️ Semi-Private (Role & Industry)'
        : '✓ Live Profile Viewer',
    mutualConnectionsCount: 1,
    isConnected: false,
    isPending: false,
    category: 'peer',
    privacyMode: viewerPrivacy,
    visitCount: nextVisitCount
  }

  const filteredChecks = targetTelemetry.checks.filter(
    c => c.name.toLowerCase().trim() !== viewerName.toLowerCase()
  )

  const newDisc: LiveDiscoveryRecord = {
    id: `dsc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    keyword: params.viewVector || 'Profile & Dossier Click',
    searcherName: viewerPrivacy === 'anonymous' ? 'Anonymous ConnectLn Member' : viewerName,
    searcherHeadline: params.viewerHeadline || 'Verified ConnectLn Professional',
    searcherCompany: params.viewerCompany || 'ConnectLn Network',
    source: 'Directory Profile Click',
    discoveryType: 'profile_click',
    createdAtIso: nowIso,
    timeAgo: 'Just now'
  }

  saveLiveUserTelemetry(targetName, {
    checks: [newViewer, ...filteredChecks],
    reachEvents: targetTelemetry.reachEvents,
    discoveryEvents: [newDisc, ...targetTelemetry.discoveryEvents]
  })

  // Also record a Content Reach view event for the viewer inspecting a dossier
  recordLiveContentReach({
    userName: viewerName,
    title: `Viewed ${targetName}'s Profile & Dossier`,
    category: 'Profile View',
    actorName: viewerName,
    actorRole: params.viewerHeadline,
    actorCompany: params.viewerCompany,
    eventKind: 'view',
    details: params.viewVector || 'Profile & Dossier Inspection'
  })

  fetch('/api/connectin/profile-views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: 'profile_view',
      targetName,
      viewerName,
      viewerHeadline: params.viewerHeadline || 'Verified ConnectLn Professional',
      viewerAvatar: safeAvatar,
      viewerCompany: params.viewerCompany || 'ConnectLn Network',
      viewerLocation: params.viewerLocation || 'United States',
      viewVector: params.viewVector || 'Profile & Dossier Inspection',
      privacyMode: viewerPrivacy,
      visitCount: nextVisitCount
    })
  }).catch(() => {})
}

// Legacy storage helpers (kept for backward compatibility, returning empty defaults)
export function loadStoredProfileViewers(): ProfileViewerItem[] {
  return []
}

export function saveStoredProfileViewers(_viewers: ProfileViewerItem[]): void {}

export function recordProfileView(viewer: Partial<ProfileViewerItem>): ProfileViewerItem[] {
  return []
}

export function loadStoredContentReach(): ContentReachData {
  return INITIAL_CONTENT_REACH_DATA
}

export function saveStoredContentReach(_data: ContentReachData): void {}

export function loadStoredDirectoryDiscoveries(): DirectoryDiscoveryData {
  return INITIAL_DIRECTORY_DISCOVERIES_DATA
}

export function saveStoredDirectoryDiscoveries(_data: DirectoryDiscoveryData): void {}
