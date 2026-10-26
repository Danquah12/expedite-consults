"use client"

import { Post, UserProfile, MessageThread, SuggestedConnection, initialPosts, currentUser, initialMessages, suggestedConnections } from "./linkedin-data"
import { AdminUserRecord, ADMIN_USERS_DIRECTORY } from "./connectin-iam-data"
import { createUniqueUserProfile } from "./connectin-profile"
import { KWESI_ASIEDU_PARSED_DATA } from "./resume-parser"

const STORAGE_KEYS = {
  POSTS: 'connectin_posts_v1',
  USER: 'connectin_user_profile',
  MESSAGES: 'connectin_messages_v1',
  CONNECTIONS: 'connectin_connections_v1',
  THEME: 'connectin_theme_v1',
  TAB: 'connectin_active_tab_v1',
  WORKSPACE: 'connectin_active_workspace_v1',
  ADMIN_USERS: 'connectin_admin_users_v1',
  AVATAR: 'connectin_persistent_avatar_v1',
  COVER: 'connectin_persistent_cover_v1',
  AVATAR_MAP: 'connectin_avatar_map_v1',
  COVER_MAP: 'connectin_cover_map_v1',
  ACCOUNTS_VAULT: 'connectin_accounts_vault_v1'
}

function getAccountKeysForUser(user?: Partial<UserProfile> & { email?: string; userId?: string } | null): string[] {
  if (!user) return []
  const keys: string[] = []
  const email = (user as any).email
  const id = user.id || (user as any).userId
  const name = user.name
  if (email && typeof email === 'string' && email.trim()) {
    keys.push(`email:${email.trim().toLowerCase()}`)
  }
  if (id && typeof id === 'string' && id.trim()) {
    keys.push(`id:${id.trim().toLowerCase()}`)
  }
  if (name && typeof name === 'string' && name.trim()) {
    keys.push(`name:${name.trim().toLowerCase()}`)
  }
  return keys
}

function readJsonMap<T>(storageKey: string): Record<string, T> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeJsonMap<T>(storageKey: string, map: Record<string, T>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey, JSON.stringify(map))
  } catch (e) {
    console.error(`Failed to write map ${storageKey}`, e)
  }
}

export function isDefaultPlaceholderAvatar(url?: string | null): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return true
  return url.includes('api.dicebear.com')
}

export function isKwesiAccount(user?: Partial<UserProfile> | null): boolean {
  if (!user) return true
  const email = String((user as any).email || '').toLowerCase().trim()
  const name = String(user.name || '').toLowerCase().trim()
  if (!email && !name) return true
  return (
    email === 'kasiedu@expedite-consults.com' ||
    email === 'asiedudanquah@gmail.com' ||
    email.includes('kasiedu') ||
    email.includes('asiedudanquah') ||
    name.includes('kwesi asiedu') ||
    name.includes('emmanuel asiedu')
  )
}

export function getDefaultPortraitForUser(user?: Partial<UserProfile> | null): string {
  if (!user || isKwesiAccount(user)) {
    return '/brand/kwesi-avatar.png'
  }
  const cleanName = String(user.name || '').toLowerCase().trim()
  const cleanEmail = String((user as any).email || '').toLowerCase().trim()
  const enclaveId = String(user.professionEnclave || '').toLowerCase().trim()
  const professionId = String(user.professionId || user.profession || '').toLowerCase().trim()

  if (cleanName.includes('robert hayes') || cleanEmail.includes('robert.hayes') || cleanEmail === 'sec-admin@connectin.internal') {
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80'
  }
  if (cleanName.includes('alex taylor') || cleanEmail.includes('alex.taylor')) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  }
  if (cleanName.includes('elena rostova') || cleanEmail.includes('elena.nurse')) {
    return 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=400&auto=format&fit=crop&q=80'
  }
  if (cleanName.includes('angela vance') || cleanEmail.includes('angela.vance')) {
    return 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
  }
  if (cleanName.includes('david miller') || cleanEmail.includes('david.miller') || cleanName.includes('yaw appiah')) {
    return 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
  }
  if (cleanName.includes('marcus miller') || cleanEmail.includes('marcus.mechanic')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80'
  }
  if (cleanName.includes('tariq') || cleanEmail.includes('tariq.cyber')) {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  }
  if (cleanName.includes('kowalski') || cleanEmail.includes('kowalski')) {
    return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  }

  if (enclaveId === 'trades_construction' || professionId.includes('welder') || professionId.includes('carpenter') || professionId.includes('electrician') || professionId.includes('plumber')) {
    return 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'automotive_mechanics' || professionId.includes('mechanic') || professionId.includes('diesel')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'healthcare_medicine') {
    return professionId.includes('nurse')
      ? 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=400&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'tech_cybersecurity') {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'tech_software') {
    return 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'law_gov_defense') {
    return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'finance_accounting') {
    return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'agriculture_natural_resources') {
    return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'personal_services_wellness') {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'culinary_hospitality_events') {
    return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'commerce_small_business') {
    return 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'creative_media_arts') {
    return 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'education_workforce') {
    return 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80'
  }
  if (enclaveId === 'community_civic_security') {
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80'
  }
  return 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
}

export function isDefaultPlaceholderCover(url?: string | null): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return true
  return url.includes('photo-1550751827-4bd374c3f58b')
}

export function savePersistentAvatar(avatarUrl: string, user?: Partial<UserProfile> | null) {
  if (typeof window === 'undefined' || !avatarUrl) return
  try {
    const targetUser = user || getRawCurrentStoredUser()
    if (!isKwesiAccount(targetUser) && avatarUrl === '/brand/kwesi-avatar.png') {
      return
    }
    const keys = getAccountKeysForUser(targetUser)
    if (keys.length > 0) {
      const avatarMap = readJsonMap<string>(STORAGE_KEYS.AVATAR_MAP)
      keys.forEach(k => { avatarMap[k] = avatarUrl })
      writeJsonMap(STORAGE_KEYS.AVATAR_MAP, avatarMap)
    }
    if (isKwesiAccount(targetUser)) {
      localStorage.setItem(STORAGE_KEYS.AVATAR, avatarUrl)
    }
  } catch (e) {
    console.error('Failed to save persistent avatar', e)
  }
}

export function loadPersistentAvatar(user?: Partial<UserProfile> | null): string | null {
  if (typeof window === 'undefined') return null
  try {
    const targetUser = user || getRawCurrentStoredUser()
    const isKwesi = isKwesiAccount(targetUser)
    const keys = getAccountKeysForUser(targetUser)
    if (keys.length > 0) {
      const avatarMap = readJsonMap<string>(STORAGE_KEYS.AVATAR_MAP)
      for (const k of keys) {
        const candidate = avatarMap[k]
        if (candidate && !isDefaultPlaceholderAvatar(candidate)) {
          if (!isKwesi && candidate === '/brand/kwesi-avatar.png') continue
          return candidate
        }
      }
    }
    if (isKwesi) {
      const directSaved = localStorage.getItem(STORAGE_KEYS.AVATAR)
      if (directSaved && !isDefaultPlaceholderAvatar(directSaved)) {
        return directSaved
      }
    }
    return null
  } catch {
    return null
  }
}

export function resolveUserProfilePicture(user?: Partial<UserProfile> | null, fallbackUrl?: string | null): string {
  const targetUser = user || getRawCurrentStoredUser()
  const isKwesi = isKwesiAccount(targetUser)

  // 1. If user has a custom data:image/ photo directly on the object, use it immediately
  if (targetUser?.avatar && targetUser.avatar.startsWith('data:image/')) {
    return targetUser.avatar
  }
  // 2. Check persistent avatar storage strictly for this user
  const persistent = loadPersistentAvatar(targetUser)
  if (persistent && !isDefaultPlaceholderAvatar(persistent)) {
    if (isKwesi || persistent !== '/brand/kwesi-avatar.png') {
      return persistent
    }
  }
  // 3. Check user.avatar if not a generic placeholder (and not stale kwesi-avatar for non-Kwesi user)
  if (targetUser?.avatar && !isDefaultPlaceholderAvatar(targetUser.avatar)) {
    if (isKwesi || targetUser.avatar !== '/brand/kwesi-avatar.png') {
      return targetUser.avatar
    }
  }
  // 4. Check fallbackUrl if not a generic placeholder (and not stale kwesi-avatar for non-Kwesi user)
  if (fallbackUrl && !isDefaultPlaceholderAvatar(fallbackUrl)) {
    if (isKwesi || fallbackUrl !== '/brand/kwesi-avatar.png') {
      return fallbackUrl
    }
  }
  // 5. Return the user's appropriate default portrait based on who is logged in
  return getDefaultPortraitForUser(targetUser)
}

export function savePersistentCover(coverUrl: string, user?: Partial<UserProfile> | null) {
  if (typeof window === 'undefined' || !coverUrl) return
  try {
    const targetUser = user || getRawCurrentStoredUser()
    const keys = getAccountKeysForUser(targetUser)
    if (keys.length > 0) {
      const coverMap = readJsonMap<string>(STORAGE_KEYS.COVER_MAP)
      keys.forEach(k => { coverMap[k] = coverUrl })
      writeJsonMap(STORAGE_KEYS.COVER_MAP, coverMap)
    }
  } catch (e) {
    console.error('Failed to save persistent cover', e)
  }
}

export function loadPersistentCover(user?: Partial<UserProfile> | null): string | null {
  if (typeof window === 'undefined') return null
  try {
    const targetUser = user || getRawCurrentStoredUser()
    const keys = getAccountKeysForUser(targetUser)
    if (keys.length > 0) {
      const coverMap = readJsonMap<string>(STORAGE_KEYS.COVER_MAP)
      for (const k of keys) {
        if (coverMap[k] && !isDefaultPlaceholderCover(coverMap[k])) {
          return coverMap[k]
        }
      }
    }
    return null
  } catch {
    return null
  }
}

function getRawCurrentStoredUser(): any | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem('connectin_user_v1')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getActiveUserNamespace(user?: Partial<UserProfile> | null): string {
  const raw = user || getRawCurrentStoredUser()
  if (!raw) return 'anon_isolated'
  const email = ((raw as any).email || '').toLowerCase().trim()
  const id = (raw.id || (raw as any).userId || '').toLowerCase().trim()
  const name = (raw.name || '').toLowerCase().trim().replace(/\s+/g, '_')
  return email || id || name || 'anon_isolated'
}

export function getVaultProfileForUser(user?: Partial<UserProfile> | null): Partial<UserProfile> | null {
  if (typeof window === 'undefined' || !user) return null
  try {
    const keys = getAccountKeysForUser(user)
    const vault = readJsonMap<Partial<UserProfile>>(STORAGE_KEYS.ACCOUNTS_VAULT)
    for (const k of keys) {
      if (vault[k]) return vault[k]
    }
    return null
  } catch {
    return null
  }
}

export function loadStoredPosts(): Post[] {
  if (typeof window === 'undefined') return initialPosts
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS)
    const parsed: Post[] = saved ? JSON.parse(saved) : initialPosts
    const userPic = resolveUserProfilePicture()
    // Ensure featured DSTRIKE shared video post is present and any user-authored posts use the resolved profile picture
    const hasFeaturedVideo = parsed.some(p => p.id === 'post_dstrike_wheel_masterclass' || p.media?.type === 'video')
    const baseList = hasFeaturedVideo ? parsed : [initialPosts[0], ...parsed]
    return baseList.map(p => {
      if (p.author?.connectionDegree === 'You' || p.id === 'post_dstrike_wheel_masterclass') {
        return {
          ...p,
          professionEnclave: p.media?.type === 'video' ? 'all' : p.professionEnclave,
          author: {
            ...p.author,
            avatar: !isDefaultPlaceholderAvatar(p.author?.avatar) ? p.author.avatar : userPic
          }
        }
      }
      return p
    })
  } catch (e) {
    console.error('Failed to load posts from storage', e)
    return initialPosts
  }
}

export function saveStoredPosts(posts: Post[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts))
  } catch (e) {
    console.error('Failed to save posts to storage', e)
  }
}

export function getExplicitStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem('connectin_user_v1')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Only require name — email may be missing from API UserProfileRecord
    if (parsed && parsed.name) {
      const email = parsed.email || `${parsed.name.toLowerCase().replace(/\s+/g, '.')}@connectin.com`
      const vaultEntry = getVaultProfileForUser({ ...parsed, email })
      const merged = { ...(vaultEntry || {}), ...parsed }

      const isKwesi =
        email.toLowerCase() === "kasiedu@expedite-consults.com" ||
        email.toLowerCase() === "asiedudanquah@gmail.com" ||
        merged.name.toLowerCase().includes("kwesi asiedu") ||
        merged.name.toLowerCase().includes("emmanuel asiedu")

      const finalExp = (merged.experience && merged.experience.length > 0)
        ? merged.experience
        : (vaultEntry?.experience && vaultEntry.experience.length > 0)
        ? vaultEntry.experience
        : isKwesi
        ? KWESI_ASIEDU_PARSED_DATA.experiences
        : []

      const finalHeadline = (isKwesi && (!merged.headline || merged.headline.includes("Master Carpenter") || merged.headline.includes("Verified ConnectIn Member")))
        ? KWESI_ASIEDU_PARSED_DATA.headline
        : (merged.headline || vaultEntry?.headline || 'Verified ConnectIn Member')

      const finalAbout = (isKwesi && (!merged.about || merged.about.includes("Practicing") || merged.about.length < 50))
        ? KWESI_ASIEDU_PARSED_DATA.about
        : (merged.about || vaultEntry?.about)

      const persistentAvatar = loadPersistentAvatar({ ...merged, email })
      const persistentCover = loadPersistentCover({ ...merged, email })

      // Prioritize custom uploaded avatar strictly for this user account, with profession-aware portrait fallback
      const validMergedAvatar = !isDefaultPlaceholderAvatar(merged.avatar) && (isKwesi || merged.avatar !== '/brand/kwesi-avatar.png')
        ? merged.avatar
        : null
      const validVaultAvatar = !isDefaultPlaceholderAvatar(vaultEntry?.avatar) && (isKwesi || vaultEntry?.avatar !== '/brand/kwesi-avatar.png')
        ? vaultEntry!.avatar!
        : null

      const resolvedAvatar =
        (merged.avatar && merged.avatar.startsWith('data:image/'))
          ? merged.avatar
          : persistentAvatar
          ? persistentAvatar
          : validMergedAvatar
          ? validMergedAvatar
          : validVaultAvatar
          ? validVaultAvatar
          : getDefaultPortraitForUser({ ...merged, email })

      const resolvedCover = !isDefaultPlaceholderCover(merged.coverImage)
        ? merged.coverImage
        : !isDefaultPlaceholderCover(vaultEntry?.coverImage)
        ? vaultEntry!.coverImage
        : (persistentCover || merged.coverImage)

      const resolvedId = merged.id || (merged as any).userId || `USR-${email.replace(/[^a-z0-9]/gi, '').slice(0, 10).toUpperCase()}`
      const resolvedSessionId = (merged as any).sessionId || `sess_iso_${resolvedId}_${Date.now().toString(36)}`

      return {
        ...merged,
        email,
        id: resolvedId,
        sessionId: resolvedSessionId,
        name: merged.name,
        headline: finalHeadline,
        about: finalAbout,
        experience: finalExp,
        avatar: resolvedAvatar,
        ...(resolvedCover ? { coverImage: resolvedCover } : {}),
        role: (merged as any).role || 'personal',
      } as UserProfile
    }
    return null
  } catch (e) {
    return null
  }
}

export function loadStoredUser(): UserProfile {
  if (typeof window === 'undefined') return currentUser
  try {
    const explicit = getExplicitStoredUser()
    if (explicit) return explicit
    return currentUser
  } catch (e) {
    console.error('Failed to load user from storage', e)
    return currentUser
  }
}

export function saveStoredUser(user: UserProfile) {
  if (typeof window === 'undefined') return
  try {
    const vaultEntry = getVaultProfileForUser(user)

    // Preserve custom avatar & cover photo strictly for this specific user account
    if (!isDefaultPlaceholderAvatar(user.avatar)) {
      savePersistentAvatar(user.avatar, user)
    }
    if (!isDefaultPlaceholderCover(user.coverImage)) {
      savePersistentCover(user.coverImage!, user)
    }

    const existingAvatar = loadPersistentAvatar(user)
    const existingCover = loadPersistentCover(user)

    const safeAvatar = !isDefaultPlaceholderAvatar(user.avatar)
      ? user.avatar
      : !isDefaultPlaceholderAvatar(vaultEntry?.avatar)
      ? vaultEntry!.avatar!
      : (existingAvatar || user.avatar)

    const safeCover = !isDefaultPlaceholderCover(user.coverImage)
      ? user.coverImage
      : !isDefaultPlaceholderCover(vaultEntry?.coverImage)
      ? vaultEntry!.coverImage
      : (existingCover || user.coverImage)

    const safeExperience = (user.experience && user.experience.length > 0)
      ? user.experience
      : (vaultEntry?.experience && vaultEntry.experience.length > 0 ? vaultEntry.experience : user.experience)

    const safeSkills = (user.skills && user.skills.length > 0)
      ? user.skills
      : (vaultEntry?.skills && vaultEntry.skills.length > 0 ? vaultEntry.skills : user.skills)

    const safeCertifications = (user.certifications && user.certifications.length > 0)
      ? user.certifications
      : (vaultEntry?.certifications && vaultEntry.certifications.length > 0 ? vaultEntry.certifications : user.certifications)

    const resolvedId = user.id || (user as any).userId || (vaultEntry as any)?.id || `USR-${Date.now()}`
    const resolvedSessionId =
      (user as any).sessionId ||
      (vaultEntry as any)?.sessionId ||
      `sess_iso_${resolvedId}_${Date.now().toString(36)}`

    const safeUser: UserProfile = {
      ...(vaultEntry || {}),
      ...user,
      id: resolvedId,
      sessionId: resolvedSessionId,
      avatar: safeAvatar,
      ...(safeCover ? { coverImage: safeCover } : {}),
      ...(safeExperience ? { experience: safeExperience } : {}),
      ...(safeSkills ? { skills: safeSkills } : {}),
      ...(safeCertifications ? { certifications: safeCertifications } : {})
    } as UserProfile

    // Save into per-user accounts vault so every user who creates an account retains their own isolated profile & picture permanently
    const keys = getAccountKeysForUser(safeUser)
    if (keys.length > 0) {
      const vault = readJsonMap<Partial<UserProfile>>(STORAGE_KEYS.ACCOUNTS_VAULT)
      keys.forEach(k => { vault[k] = safeUser })
      writeJsonMap(STORAGE_KEYS.ACCOUNTS_VAULT, vault)
    }

    const serialized = JSON.stringify(safeUser)
    localStorage.setItem(STORAGE_KEYS.USER, serialized)
    localStorage.setItem('connectin_user_v1', serialized)
    // Persistent auth flag — survives page reloads and new tab opens
    localStorage.setItem('connectin_verified', 'true')

    // Async background sync to server database for all authenticated users
    fetch('/api/connectin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: safeUser.id,
        userId: (safeUser as any).userId || safeUser.id,
        email: (safeUser as any).email,
        name: safeUser.name,
        headline: safeUser.headline,
        avatar: safeUser.avatar,
        coverImage: safeUser.coverImage,
        location: safeUser.location,
        about: safeUser.about,
        skills: safeUser.skills,
        profession: safeUser.profession,
        professionId: safeUser.professionId,
        professionCategory: safeUser.professionCategory,
        professionEnclave: safeUser.professionEnclave
      })
    }).catch(() => {})
  } catch (e) {
    console.error('Failed to save user to storage', e)
  }
}

export function loadStoredSessionRoute(): { tab?: string; workspace?: 'personal' | 'enterprise' | 'creator' | 'seller' } {
  if (typeof window === 'undefined') return {}
  try {
    const ns = getActiveUserNamespace()
    const tab = localStorage.getItem(`${STORAGE_KEYS.TAB}_${ns}`) || localStorage.getItem(STORAGE_KEYS.TAB) || undefined
    const workspace = (localStorage.getItem(`${STORAGE_KEYS.WORKSPACE}_${ns}`) || localStorage.getItem(STORAGE_KEYS.WORKSPACE) as any) || undefined
    return { tab, workspace }
  } catch (e) {
    return {}
  }
}

export function saveStoredSessionRoute(tab: string, workspace: string) {
  if (typeof window === 'undefined') return
  try {
    const ns = getActiveUserNamespace()
    localStorage.setItem(`${STORAGE_KEYS.TAB}_${ns}`, tab)
    localStorage.setItem(`${STORAGE_KEYS.WORKSPACE}_${ns}`, workspace)
    localStorage.setItem(STORAGE_KEYS.TAB, tab)
    localStorage.setItem(STORAGE_KEYS.WORKSPACE, workspace)
  } catch (e) {
    console.error('Failed to save session route', e)
  }
}

export function loadStoredAdminUsers(): AdminUserRecord[] {
  if (typeof window === 'undefined') return ADMIN_USERS_DIRECTORY
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)
    return saved ? JSON.parse(saved) : ADMIN_USERS_DIRECTORY
  } catch (e) {
    return ADMIN_USERS_DIRECTORY
  }
}

export function saveStoredAdminUsers(users: AdminUserRecord[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users))
  } catch (e) {
    console.error('Failed to save admin users to storage', e)
  }
}

export function registerNewUserInDirectory(newUser: {
  id: string
  name: string
  email: string
  roles: string[]
  organization: string
}) {
  if (typeof window === 'undefined') return
  try {
    const current = loadStoredAdminUsers()
    const newRecord: AdminUserRecord = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newUser.name)}&backgroundColor=0a66c2`,
      headline: 'Verified Member',
      roles: newUser.roles,
      enforcementStatus: 'Active',
      verificationLevel: 'Email Verified',
      mfaStatus: 'FIDO2 Passkey ✓',
      riskLevel: 'Low',
      organization: newUser.organization,
      location: 'Washington DC / Metro',
      connectionsCount: 0,
      registeredAt: new Date().toISOString(),
      lastLogin: 'Active Now',
      reportsCount: 0
    }
    const updated = [newRecord, ...current.filter(u => u.email !== newUser.email)]
    saveStoredAdminUsers(updated)
  } catch (e) {
    console.error('Failed to register new user in directory', e)
  }
}

export function loadStoredMessages(): MessageThread[] {
  if (typeof window === 'undefined') return initialMessages
  try {
    const ns = getActiveUserNamespace()
    const saved = localStorage.getItem(`${STORAGE_KEYS.MESSAGES}_${ns}`)
    return saved ? JSON.parse(saved) : initialMessages
  } catch (e) {
    console.error('Failed to load messages from storage', e)
    return initialMessages
  }
}

export function saveStoredMessages(messages: MessageThread[]) {
  if (typeof window === 'undefined') return
  try {
    const ns = getActiveUserNamespace()
    localStorage.setItem(`${STORAGE_KEYS.MESSAGES}_${ns}`, JSON.stringify(messages))
  } catch (e) {
    console.error('Failed to save messages to storage', e)
  }
}

export function loadStoredConnections(): SuggestedConnection[] {
  if (typeof window === 'undefined') return suggestedConnections
  try {
    const ns = getActiveUserNamespace()
    const saved = localStorage.getItem(`${STORAGE_KEYS.CONNECTIONS}_${ns}`)
    return saved ? JSON.parse(saved) : suggestedConnections
  } catch (e) {
    console.error('Failed to load connections from storage', e)
    return suggestedConnections
  }
}

export function saveStoredConnections(connections: SuggestedConnection[]) {
  if (typeof window === 'undefined') return
  try {
    const ns = getActiveUserNamespace()
    localStorage.setItem(`${STORAGE_KEYS.CONNECTIONS}_${ns}`, JSON.stringify(connections))
  } catch (e) {
    console.error('Failed to save connections to storage', e)
  }
}

