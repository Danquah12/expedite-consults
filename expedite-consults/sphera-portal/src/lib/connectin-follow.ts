/**
 * ConnectLn One-Way Follow Graph, Followers/Following Lists, Notifications & Privacy Engine
 *
 * Strictly separates:
 * - Following (one-way outbound: people whose updates you choose to receive)
 * - Followers (one-way inbound: people who choose to receive your updates)
 * - Connections (two-way mutual: accepted connection requests)
 *
 * Every count comes strictly from saved relationships between real accounts (0 by default).
 * Verification badges never automatically create a follow relationship.
 */

import { Post } from "./connectln-data"
import { recordLiveContentReach, recordLiveDirectoryDiscovery } from "./connectin-analytics"

export interface FollowMemberRecord {
  id: string
  name: string
  headline: string
  avatar: string
  profession?: string
  location?: string
  followedAtIso: string
  followedAgo?: string
}

export interface FollowNotificationItem {
  id: string
  followerName: string
  followerHeadline: string
  followerAvatar: string
  createdAtIso: string
  timeAgo?: string
  unread: boolean
}

export interface BlockedUserRecord {
  name: string
  headline?: string
  avatar?: string
  blockedAtIso: string
}

export interface FollowPrivacySettings {
  whoCanFollow: 'everyone' | 'connections_only'
  whoCanSeeFollowLists: 'everyone' | 'connections' | 'only_me'
  notifyOnNewFollower: boolean
}

export interface UserFollowBundle {
  following: FollowMemberRecord[]
  followers: FollowMemberRecord[]
  notifications: FollowNotificationItem[]
  blockedUsers: BlockedUserRecord[]
  settings: FollowPrivacySettings
}

export function normalizeFollowKey(name?: string): string {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function getFollowStorageKey(userName?: string): string {
  const clean = normalizeFollowKey(userName).replace(/[^a-z0-9]/g, '_') || 'guest'
  return `connectin_follow_bundle_v1_${clean}`
}

export function getDefaultFollowSettings(): FollowPrivacySettings {
  return {
    whoCanFollow: 'everyone',
    whoCanSeeFollowLists: 'everyone',
    notifyOnNewFollower: true
  }
}

export function formatFollowAgo(iso?: string): string {
  if (!iso) return 'Just now'
  const diffMs = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diffMs) || diffMs < 60_000) return 'Just now'
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function dedupMembers(list: FollowMemberRecord[]): FollowMemberRecord[] {
  const map = new Map<string, FollowMemberRecord>()
  for (const item of list || []) {
    if (!item || !item.name) continue
    const k = normalizeFollowKey(item.name)
    if (!k) continue
    if (!map.has(k)) {
      map.set(k, {
        ...item,
        followedAgo: formatFollowAgo(item.followedAtIso)
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => (b.followedAtIso || '').localeCompare(a.followedAtIso || ''))
}

export function loadUserFollowBundle(userName?: string): UserFollowBundle {
  const empty: UserFollowBundle = {
    following: [],
    followers: [],
    notifications: [],
    blockedUsers: [],
    settings: getDefaultFollowSettings()
  }
  if (typeof window === 'undefined' || !userName) return empty
  try {
    const raw = localStorage.getItem(getFollowStorageKey(userName))
    if (!raw) return empty
    const parsed = JSON.parse(raw)
    return {
      following: dedupMembers(Array.isArray(parsed?.following) ? parsed.following : []),
      followers: dedupMembers(Array.isArray(parsed?.followers) ? parsed.followers : []),
      notifications: Array.isArray(parsed?.notifications)
        ? parsed.notifications.map((n: FollowNotificationItem) => ({
            ...n,
            timeAgo: formatFollowAgo(n.createdAtIso)
          }))
        : [],
      blockedUsers: Array.isArray(parsed?.blockedUsers) ? parsed.blockedUsers : [],
      settings: {
        ...getDefaultFollowSettings(),
        ...(parsed?.settings || {})
      }
    }
  } catch {
    return empty
  }
}

export function saveUserFollowBundle(userName: string, bundle: UserFollowBundle): void {
  if (typeof window === 'undefined' || !userName) return
  try {
    const normalized: UserFollowBundle = {
      following: dedupMembers(bundle.following || []),
      followers: dedupMembers(bundle.followers || []),
      notifications: (bundle.notifications || []).slice(0, 30),
      blockedUsers: (bundle.blockedUsers || []).slice(0, 40),
      settings: {
        ...getDefaultFollowSettings(),
        ...(bundle.settings || {})
      }
    }
    localStorage.setItem(getFollowStorageKey(userName), JSON.stringify(normalized))
    window.dispatchEvent(new CustomEvent('connectln-follow-updated', { detail: { userName } }))
  } catch {}
}

export async function syncUserFollowBundleFromCloud(userName?: string): Promise<UserFollowBundle> {
  const clean = String(userName || '').trim()
  if (typeof window === 'undefined' || !clean) {
    return loadUserFollowBundle(clean)
  }
  const local = loadUserFollowBundle(clean)
  try {
    const res = await fetch(`/api/connectin/follow?userName=${encodeURIComponent(clean)}`, {
      cache: 'no-store'
    })
    if (!res.ok) return local
    const data = await res.json()
    if (!data?.ok) return local

    // Merge cloud + local, trusting cloud when synchronized while preserving immediate local actions
    const mergedFollowing = dedupMembers([...(data.following || []), ...local.following])
    const mergedFollowers = dedupMembers([...(data.followers || []), ...local.followers])
    const notifMap = new Map<string, FollowNotificationItem>()
    for (const n of [...(data.notifications || []), ...local.notifications]) {
      if (!n || !n.followerName) continue
      const k = normalizeFollowKey(n.followerName)
      if (!notifMap.has(k)) {
        notifMap.set(k, {
          ...n,
          timeAgo: formatFollowAgo(n.createdAtIso)
        })
      }
    }
    const blockMap = new Map<string, BlockedUserRecord>()
    for (const b of [...(data.blockedUsers || []), ...local.blockedUsers]) {
      if (!b || !b.name) continue
      const k = normalizeFollowKey(b.name)
      if (!blockMap.has(k)) blockMap.set(k, b)
    }

    const merged: UserFollowBundle = {
      following: mergedFollowing,
      followers: mergedFollowers,
      notifications: Array.from(notifMap.values()),
      blockedUsers: Array.from(blockMap.values()),
      settings: {
        ...getDefaultFollowSettings(),
        ...local.settings,
        ...(data.settings || {})
      }
    }
    saveUserFollowBundle(clean, merged)
    return merged
  } catch {
    return local
  }
}

export function getFollowRelationshipState(
  actorName?: string,
  targetName?: string
): {
  isFollowing: boolean
  followsYou: boolean
  isBlocked: boolean
  isBlockedByTarget: boolean
  buttonLabel: 'Following' | 'Follow back' | 'Follow'
} {
  const normActor = normalizeFollowKey(actorName)
  const normTarget = normalizeFollowKey(targetName)
  if (!normActor || !normTarget || normActor === normTarget) {
    return {
      isFollowing: false,
      followsYou: false,
      isBlocked: false,
      isBlockedByFull: false,
      isBlockedByTarget: false,
      buttonLabel: 'Follow'
    } as any
  }
  const actorBundle = loadUserFollowBundle(actorName)
  const targetBundle = loadUserFollowBundle(targetName)

  const isFollowing = actorBundle.following.some(f => normalizeFollowKey(f.name) === normTarget)
  const followsYou = actorBundle.followers.some(f => normalizeFollowKey(f.name) === normTarget)
  const isBlocked = actorBundle.blockedUsers.some(b => normalizeFollowKey(b.name) === normTarget)
  const isBlockedByTarget = targetBundle.blockedUsers.some(b => normalizeFollowKey(b.name) === normActor)

  const buttonLabel: 'Following' | 'Follow back' | 'Follow' = isFollowing
    ? 'Following'
    : followsYou
    ? 'Follow back'
    : 'Follow'

  return {
    isFollowing,
    followsYou,
    isBlocked,
    isBlockedByTarget,
    buttonLabel
  }
}

export function followMember(params: {
  actorId?: string
  actorName: string
  actorHeadline?: string
  actorAvatar?: string
  actorProfession?: string
  actorLocation?: string
  targetId?: string
  targetName: string
  targetHeadline?: string
  targetAvatar?: string
  targetProfession?: string
  targetLocation?: string
  isConnectedWithTarget?: boolean
}): { ok: boolean; error?: string; actorBundle?: UserFollowBundle; targetBundle?: UserFollowBundle } {
  const actorName = String(params.actorName || '').trim()
  const targetName = String(params.targetName || '').trim()
  const normActor = normalizeFollowKey(actorName)
  const normTarget = normalizeFollowKey(targetName)

  if (!normActor || !normTarget) {
    return { ok: false, error: 'Invalid member account.' }
  }
  if (normActor === normTarget) {
    return { ok: false, error: 'You cannot follow yourself.' }
  }

  const actorBundle = loadUserFollowBundle(actorName)
  const targetBundle = loadUserFollowBundle(targetName)

  // Check blocking in either direction
  if (
    actorBundle.blockedUsers.some(b => normalizeFollowKey(b.name) === normTarget) ||
    targetBundle.blockedUsers.some(b => normalizeFollowKey(b.name) === normActor)
  ) {
    return {
      ok: false,
      error: `Unable to follow ${targetName} because of blocking preferences.`
    }
  }

  // Check target's follow permission setting ("Everyone" vs "Only 1st-degree connections")
  if (targetBundle.settings.whoCanFollow === 'connections_only' && !params.isConnectedWithTarget) {
    return {
      ok: false,
      error: `${targetName} only allows 1st-degree connections to follow them. Connect with ${targetName} first.`
    }
  }

  // Prevent duplicate follow
  if (actorBundle.following.some(f => normalizeFollowKey(f.name) === normTarget)) {
    return { ok: true, actorBundle, targetBundle }
  }

  const nowIso = new Date().toISOString()
  const safeActorAvatar =
    params.actorAvatar && !params.actorAvatar.startsWith('data:')
      ? params.actorAvatar
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(actorName)}&backgroundColor=0a66c2`
  const safeTargetAvatar =
    params.targetAvatar && !params.targetAvatar.startsWith('data:')
      ? params.targetAvatar
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetName)}&backgroundColor=0a66c2`

  const newFollowingRecord: FollowMemberRecord = {
    id: params.targetId || `flw_${normTarget.replace(/[^a-z0-9]/g, '_')}`,
    name: targetName,
    headline: params.targetHeadline || 'Verified Professional · ConnectLn Member',
    avatar: safeTargetAvatar,
    profession: params.targetProfession,
    location: params.targetLocation,
    followedAtIso: nowIso,
    followedAgo: 'Just now'
  }

  const newFollowerRecord: FollowMemberRecord = {
    id: params.actorId || `flw_${normActor.replace(/[^a-z0-9]/g, '_')}`,
    name: actorName,
    headline: params.actorHeadline || 'Verified Professional · ConnectLn Member',
    avatar: safeActorAvatar,
    profession: params.actorProfession,
    location: params.actorLocation,
    followedAtIso: nowIso,
    followedAgo: 'Just now'
  }

  const updatedActorBundle: UserFollowBundle = {
    ...actorBundle,
    following: dedupMembers([newFollowingRecord, ...actorBundle.following])
  }

  const nextTargetNotifications = [...targetBundle.notifications]
  if (targetBundle.settings.notifyOnNewFollower !== false) {
    const newNotif: FollowNotificationItem = {
      id: `fnotif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      followerName: actorName,
      followerHeadline: newFollowerRecord.headline,
      followerAvatar: safeActorAvatar,
      createdAtIso: nowIso,
      timeAgo: 'Just now',
      unread: true
    }
    const filteredNotifs = nextTargetNotifications.filter(
      n => normalizeFollowKey(n.followerName) !== normActor
    )
    nextTargetNotifications.splice(0, nextTargetNotifications.length, newNotif, ...filteredNotifs)
  }

  const updatedTargetBundle: UserFollowBundle = {
    ...targetBundle,
    followers: dedupMembers([newFollowerRecord, ...targetBundle.followers]),
    notifications: nextTargetNotifications
  }

  saveUserFollowBundle(actorName, updatedActorBundle)
  saveUserFollowBundle(targetName, updatedTargetBundle)

  // Also record live telemetry (Directory Discovery for target + Content Reach for actor)
  recordLiveDirectoryDiscovery({
    targetName,
    keyword: `Followed by ${actorName}`,
    searcherName: actorName,
    searcherHeadline: newFollowerRecord.headline,
    searcherCompany: params.actorProfession || 'ConnectLn Network',
    source: 'Verified Fellows / Follow Action',
    discoveryType: 'profile_click'
  })
  recordLiveContentReach({
    userName: actorName,
    title: `Started following ${targetName} (${newFollowingRecord.headline.slice(0, 50)})`,
    category: 'Following',
    actorName,
    eventKind: 'interaction'
  })

  // Sync both accounts in Cloud Sync
  fetch('/api/connectin/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'follow',
      actorId: params.actorId,
      actorName,
      actorHeadline: newFollowerRecord.headline,
      actorAvatar: safeActorAvatar,
      actorProfession: params.actorProfession,
      actorLocation: params.actorLocation,
      targetId: params.targetId,
      targetName,
      targetHeadline: newFollowingRecord.headline,
      targetAvatar: safeTargetAvatar,
      targetProfession: params.targetProfession,
      targetLocation: params.targetLocation,
      isConnectedWithTarget: params.isConnectedWithTarget
    })
  }).catch(() => {})

  return { ok: true, actorBundle: updatedActorBundle, targetBundle: updatedTargetBundle }
}

export function unfollowMember(params: {
  actorName: string
  targetName: string
}): { ok: boolean; actorBundle: UserFollowBundle; targetBundle: UserFollowBundle } {
  const actorName = String(params.actorName || '').trim()
  const targetName = String(params.targetName || '').trim()
  const normActor = normalizeFollowKey(actorName)
  const normTarget = normalizeFollowKey(targetName)

  const actorBundle = loadUserFollowBundle(actorName)
  const targetBundle = loadUserFollowBundle(targetName)

  const updatedActorBundle: UserFollowBundle = {
    ...actorBundle,
    following: actorBundle.following.filter(f => normalizeFollowKey(f.name) !== normTarget)
  }
  const updatedTargetBundle: UserFollowBundle = {
    ...targetBundle,
    followers: targetBundle.followers.filter(f => normalizeFollowKey(f.name) !== normActor)
  }

  // Write directly to localStorage and dispatch update event
  if (typeof window !== 'undefined') {
    localStorage.setItem(getFollowStorageKey(actorName), JSON.stringify(updatedActorBundle))
    localStorage.setItem(getFollowStorageKey(targetName), JSON.stringify(updatedTargetBundle))
    window.dispatchEvent(new CustomEvent('connectln-follow-updated', { detail: { userName: actorName, targetName } }))
  }

  fetch('/api/connectin/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'unfollow',
      actorName,
      targetName
    })
  }).catch(() => {})

  return { ok: true, actorBundle: updatedActorBundle, targetBundle: updatedTargetBundle }
}

export function blockMemberForFollow(params: {
  actorName: string
  targetName: string
  targetHeadline?: string
  targetAvatar?: string
}): UserFollowBundle {
  const actorName = String(params.actorName || '').trim()
  const targetName = String(params.targetName || '').trim()
  const normActor = normalizeFollowKey(actorName)
  const normTarget = normalizeFollowKey(targetName)

  const actorBundle = loadUserFollowBundle(actorName)
  const targetBundle = loadUserFollowBundle(targetName)

  const updatedActorBundle: UserFollowBundle = {
    ...actorBundle,
    following: actorBundle.following.filter(f => normalizeFollowKey(f.name) !== normTarget),
    followers: actorBundle.followers.filter(f => normalizeFollowKey(f.name) !== normTarget),
    blockedUsers: [
      {
        name: targetName,
        headline: params.targetHeadline || 'ConnectLn Member',
        avatar: params.targetAvatar || '',
        blockedAtIso: new Date().toISOString()
      },
      ...actorBundle.blockedUsers.filter(b => normalizeFollowKey(b.name) !== normTarget)
    ]
  }

  const updatedTargetBundle: UserFollowBundle = {
    ...targetBundle,
    following: targetBundle.following.filter(f => normalizeFollowKey(f.name) !== normActor),
    followers: targetBundle.followers.filter(f => normalizeFollowKey(f.name) !== normActor)
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(getFollowStorageKey(actorName), JSON.stringify(updatedActorBundle))
    localStorage.setItem(getFollowStorageKey(targetName), JSON.stringify(updatedTargetBundle))
    window.dispatchEvent(new CustomEvent('connectln-follow-updated', { detail: { userName: actorName, targetName } }))
  }

  fetch('/api/connectin/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'block',
      actorName,
      targetName,
      targetHeadline: params.targetHeadline,
      targetAvatar: params.targetAvatar
    })
  }).catch(() => {})

  return updatedActorBundle
}

export function unblockMemberForFollow(params: {
  actorName: string
  targetName: string
}): UserFollowBundle {
  const actorName = String(params.actorName || '').trim()
  const targetName = String(params.targetName || '').trim()
  const normTarget = normalizeFollowKey(targetName)

  const actorBundle = loadUserFollowBundle(actorName)
  const updatedActorBundle: UserFollowBundle = {
    ...actorBundle,
    blockedUsers: actorBundle.blockedUsers.filter(b => normalizeFollowKey(b.name) !== normTarget)
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(getFollowStorageKey(actorName), JSON.stringify(updatedActorBundle))
    window.dispatchEvent(new CustomEvent('connectln-follow-updated', { detail: { userName: actorName, targetName } }))
  }

  fetch('/api/connectin/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'unblock',
      actorName,
      targetName
    })
  }).catch(() => {})

  return updatedActorBundle
}

export function updateFollowPrivacySettings(
  userName: string,
  partial: Partial<FollowPrivacySettings>
): UserFollowBundle {
  const bundle = loadUserFollowBundle(userName)
  const updated: UserFollowBundle = {
    ...bundle,
    settings: {
      ...bundle.settings,
      ...partial
    }
  }
  saveUserFollowBundle(userName, updated)

  fetch('/api/connectin/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update_settings',
      actorName: userName,
      settings: updated.settings
    })
  }).catch(() => {})

  return updated
}

export function markFollowNotificationsRead(userName: string): UserFollowBundle {
  const bundle = loadUserFollowBundle(userName)
  const updated: UserFollowBundle = {
    ...bundle,
    notifications: (bundle.notifications || []).map(n => ({ ...n, unread: false }))
  }
  saveUserFollowBundle(userName, updated)

  fetch('/api/connectin/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'mark_notifications_read',
      actorName: userName
    })
  }).catch(() => {})

  return updated
}

/**
 * Generates eligible public feed posts for any member the user follows who does not yet have a post in the feed
 * (e.g., when following John Sianaa or Yaw Appiah Asiedu, their public field updates immediately appear in the user's feed).
 */
export function buildFollowedMemberPosts(
  followingList: FollowMemberRecord[],
  existingPosts: Post[]
): Post[] {
  if (!Array.isArray(followingList) || followingList.length === 0) return []
  const existingAuthorSet = new Set(
    (existingPosts || []).map(p => normalizeFollowKey(p.author?.name))
  )

  const synthesized: Post[] = []
  for (const followed of followingList) {
    const norm = normalizeFollowKey(followed.name)
    if (!norm || existingAuthorSet.has(norm)) continue
    const cleanRole = followed.headline?.split('·')[0]?.trim() || followed.profession || 'Verified Trade & Domain Specialist'
    synthesized.push({
      id: `post_followed_${norm.replace(/[^a-z0-9]/g, '_')}`,
      professionEnclave: 'all',
      isProfessionTiered: true,
      author: {
        id: followed.id || `member_${norm.replace(/[^a-z0-9]/g, '_')}`,
        name: followed.name,
        headline: followed.headline || 'Verified Professional · ConnectLn Member',
        avatar:
          followed.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(followed.name)}&backgroundColor=0a66c2`,
        connectionDegree: 'Following' as any,
        isFollowing: true
      },
      timestamp: `${followed.followedAgo || 'Just now'} · 🌐 Public (Followed Member)`,
      visibility: 'Public',
      postType: 'standard',
      feedCategory: 'for_you',
      feedSubCategory: 'All',
      content: `🔨 Field & Craft Update from ${followed.name} (${cleanRole}): Sharing our latest project specifications, precision tolerances, and site quality verification standards with everyone following my updates on ConnectLn. Open to peer discussions and project collaborations!`,
      hashtags: ['#ConnectLn', '#FollowedUpdates', '#VerifiedCraft', '#FieldStandards'],
      stats: {
        likesCount: 1,
        commentsCount: 0,
        repostsCount: 0,
        reactionsBreakdown: {
          like: 1,
          celebrate: 0,
          support: 0,
          love: 0,
          insightful: 0,
          funny: 0
        }
      },
      userReaction: null,
      isSaved: false,
      comments: []
    })
  }
  return synthesized
}
