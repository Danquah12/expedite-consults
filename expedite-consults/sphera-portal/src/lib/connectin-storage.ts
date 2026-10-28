"use client"

import { Post, UserProfile, MessageThread, SuggestedConnection, initialPosts, currentUser, initialMessages, suggestedConnections } from "./connectln-data"
import { AdminUserRecord, ADMIN_USERS_DIRECTORY } from "./connectin-iam-data"
import {
  createUniqueUserProfile,
  generatePersonalSignatureAvatar,
  getKnownDemoPersonaAvatar,
  isForeignPersonaAvatar,
  isExactKwesiUser,
  isSuperAdminUser,
  isDedicatedAdminAccount
} from "./connectin-profile"
import { KWESI_ASIEDU_PARSED_DATA } from "./resume-parser"

export { generatePersonalSignatureAvatar, getKnownDemoPersonaAvatar, isForeignPersonaAvatar, isSuperAdminUser, isDedicatedAdminAccount }

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
  ACCOUNTS_VAULT: 'connectin_accounts_vault_v1',
  USER_ACTIVITY_LOGS: 'connectin_user_activity_logs_v1'
}

function getAccountKeysForUser(user?: Partial<UserProfile> & { email?: string; userId?: string } | null): string[] {
  if (!user) return []
  const keys: string[] = []
  const email = typeof (user as any).email === 'string' ? (user as any).email.trim().toLowerCase() : ''
  const name = typeof user.name === 'string' ? user.name.trim().toLowerCase() : ''
  const id = typeof (user.id || (user as any).userId) === 'string' ? String(user.id || (user as any).userId).trim().toLowerCase() : ''

  if (email && name) {
    keys.push(`acct:${email}::${name}`)
  }
  if (email) {
    keys.push(`email:${email}`)
    return keys
  }
  if (id && id !== 'user_alex_taylor') {
    keys.push(`id:${id}`)
  }
  if (name) {
    keys.push(`name:${name}`)
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
  return isExactKwesiUser(user as any)
}

export function getDefaultPortraitForUser(user?: Partial<UserProfile> | null): string {
  if (!user) {
    const stored = getRawCurrentStoredUser()
    if (stored) {
      return getKnownDemoPersonaAvatar(stored) || generatePersonalSignatureAvatar(stored)
    }
    return '/brand/kwesi-avatar.png'
  }
  return getKnownDemoPersonaAvatar(user as any) || generatePersonalSignatureAvatar(user as any)
}

export function isDefaultPlaceholderCover(url?: string | null): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return true
  return url.includes('photo-1550751827-4bd374c3f58b')
}

export function savePersistentAvatar(avatarUrl: string, user?: Partial<UserProfile> | null) {
  if (typeof window === 'undefined' || !avatarUrl) return
  try {
    const targetUser = user || getRawCurrentStoredUser()
    if (isForeignPersonaAvatar(avatarUrl, targetUser as any)) {
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
    } else {
      localStorage.removeItem(STORAGE_KEYS.AVATAR)
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
        if (candidate && !isDefaultPlaceholderAvatar(candidate) && !isForeignPersonaAvatar(candidate, targetUser as any)) {
          return candidate
        }
      }
    }
    if (isKwesi) {
      const directSaved = localStorage.getItem(STORAGE_KEYS.AVATAR)
      if (directSaved && !isDefaultPlaceholderAvatar(directSaved) && !isForeignPersonaAvatar(directSaved, targetUser as any)) {
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

  // 1. If user has a custom uploaded raster photo (jpeg/png/webp/gif) directly on the object, use it immediately
  if (
    targetUser?.avatar &&
    targetUser.avatar.startsWith('data:image/') &&
    !targetUser.avatar.startsWith('data:image/svg+xml')
  ) {
    return targetUser.avatar
  }
  // 2. Check persistent avatar storage strictly for this user
  const persistent = loadPersistentAvatar(targetUser)
  if (persistent && !isDefaultPlaceholderAvatar(persistent) && !isForeignPersonaAvatar(persistent, targetUser as any)) {
    return persistent
  }
  // 3. Check user.avatar if not a generic placeholder and not belonging to another persona
  if (targetUser?.avatar && !isDefaultPlaceholderAvatar(targetUser.avatar) && !isForeignPersonaAvatar(targetUser.avatar, targetUser as any)) {
    return targetUser.avatar
  }
  // 4. Check fallbackUrl if not a generic placeholder and not belonging to another persona
  if (fallbackUrl && !isDefaultPlaceholderAvatar(fallbackUrl) && !isForeignPersonaAvatar(fallbackUrl, targetUser as any)) {
    return fallbackUrl
  }
  // 5. Return the user's appropriate default portrait / personal signature avatar based strictly on who is logged in
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
  if (email && name) return `${email}__${name}`
  return email || id || name || 'anon_isolated'
}

export function getVaultProfileForUser(user?: Partial<UserProfile> | null): Partial<UserProfile> | null {
  if (typeof window === 'undefined' || !user) return null
  try {
    const keys = getAccountKeysForUser(user)
    const vault = readJsonMap<Partial<UserProfile>>(STORAGE_KEYS.ACCOUNTS_VAULT)
    const cleanEmail = ((user as any).email || '').toLowerCase().trim()
    const cleanName = (user.name || '').toLowerCase().trim()
    for (const k of keys) {
      const candidate = vault[k]
      if (!candidate) continue
      const candEmail = ((candidate as any).email || '').toLowerCase().trim()
      if (cleanEmail && candEmail && cleanEmail !== candEmail) continue
      // If user explicitly provided a different name than the stored candidate, do NOT merge that other person's vault entry
      if (cleanName && candidate.name && cleanName !== candidate.name.toLowerCase().trim()) {
        continue
      }
      // Never return a vault entry whose avatar belongs to another persona
      if (candidate.avatar && isForeignPersonaAvatar(candidate.avatar, { name: user.name || candidate.name, email: cleanEmail || candEmail })) {
        return { ...candidate, avatar: undefined }
      }
      return candidate
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
    const activeUser = getExplicitStoredUser() || currentUser
    const userPic = resolveUserProfilePicture(activeUser)
    // Ensure featured DSTRIKE shared video post is present and any user-authored posts use the active user's own name, headline, and profile picture
    const hasFeaturedVideo = parsed.some(p => p.id === 'post_dstrike_wheel_masterclass' || p.media?.type === 'video')
    const baseList = hasFeaturedVideo ? parsed : [initialPosts[0], ...parsed]
    return baseList.map(p => {
      if (p.author?.connectionDegree === 'You' || p.id === 'post_dstrike_wheel_masterclass') {
        return {
          ...p,
          professionEnclave: p.media?.type === 'video' ? 'all' : p.professionEnclave,
          author: {
            ...p.author,
            name: activeUser.name || p.author.name,
            headline: activeUser.headline || p.author.headline,
            avatar: userPic
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

      const isKwesi = isExactKwesiUser({ name: merged.name, email })
      const isAdmin = isSuperAdminUser({ name: merged.name, email })

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

      // Prioritize custom uploaded avatar strictly for this user account, rejecting any foreign persona portrait
      const validMergedAvatar = !isDefaultPlaceholderAvatar(merged.avatar) && !isForeignPersonaAvatar(merged.avatar, { name: merged.name, email })
        ? merged.avatar
        : null
      const validVaultAvatar = !isDefaultPlaceholderAvatar(vaultEntry?.avatar) && !isForeignPersonaAvatar(vaultEntry?.avatar, { name: merged.name, email })
        ? vaultEntry!.avatar!
        : null

      const resolvedAvatar =
        (merged.avatar && merged.avatar.startsWith('data:image/') && !isForeignPersonaAvatar(merged.avatar, { name: merged.name, email }))
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
      const sanitizedRole = isAdmin
        ? ((merged as any).role || 'admin')
        : (((merged as any).role === 'admin' ? 'personal' : (merged as any).role) || 'personal')
      const sanitizedRoles = isAdmin
        ? ((merged as any).roles || ['SUPER_ADMIN'])
        : ['NORMAL_USER']

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
        role: sanitizedRole,
        roles: sanitizedRoles,
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
    const userEmail = (user as any).email || (vaultEntry as any)?.email || ''
    const isAdmin = isSuperAdminUser({ name: user.name, email: userEmail })

    // Preserve custom avatar & cover photo strictly for this specific user account, never storing foreign persona portraits
    if (!isDefaultPlaceholderAvatar(user.avatar) && !isForeignPersonaAvatar(user.avatar, { name: user.name, email: userEmail })) {
      savePersistentAvatar(user.avatar, user)
    }
    if (!isDefaultPlaceholderCover(user.coverImage)) {
      savePersistentCover(user.coverImage!, user)
    }

    const existingAvatar = loadPersistentAvatar(user)
    const existingCover = loadPersistentCover(user)

    const safeAvatar = !isDefaultPlaceholderAvatar(user.avatar) && !isForeignPersonaAvatar(user.avatar, { name: user.name, email: userEmail })
      ? user.avatar
      : !isDefaultPlaceholderAvatar(vaultEntry?.avatar) && !isForeignPersonaAvatar(vaultEntry?.avatar, { name: user.name, email: userEmail })
      ? vaultEntry!.avatar!
      : (existingAvatar && !isForeignPersonaAvatar(existingAvatar, { name: user.name, email: userEmail })
          ? existingAvatar
          : getDefaultPortraitForUser({ ...user, email: userEmail } as any))

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

    const sanitizedRole = isAdmin
      ? ((user as any).role || 'admin')
      : (((user as any).role === 'admin' ? 'personal' : (user as any).role) || 'personal')
    const sanitizedRoles = isAdmin
      ? ((user as any).roles || ['SUPER_ADMIN'])
      : ['NORMAL_USER']

    const nowIso = new Date().toISOString()
    const authProvider = (user as any).authProvider || (vaultEntry as any)?.authProvider || undefined
    const safeUser: UserProfile = {
      ...(vaultEntry || {}),
      ...user,
      id: resolvedId,
      sessionId: resolvedSessionId,
      role: sanitizedRole,
      roles: sanitizedRoles,
      avatar: safeAvatar,
      ...(safeCover ? { coverImage: safeCover } : {}),
      ...(safeExperience ? { experience: safeExperience } : {}),
      ...(safeSkills ? { skills: safeSkills } : {}),
      ...(safeCertifications ? { certifications: safeCertifications } : {}),
      ...(authProvider ? { authProvider } : {}),
      registeredAt: (user as any).registeredAt || (vaultEntry as any)?.registeredAt || nowIso,
      lastLoginAt: nowIso
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

    const mfaLabel =
      authProvider === 'Google SSO'
        ? 'Google SSO ✓'
        : authProvider === 'Microsoft Entra ID'
        ? 'Microsoft SSO ✓'
        : 'Email 2FA ✓'
    const timeDisplay = new Date(nowIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const loginLabel = authProvider
      ? `Logged In via ${authProvider} (${timeDisplay})`
      : `Logged In (${timeDisplay})`

    // Automatically record this logged-in / newly registered user in the Admin Directory
    registerNewUserInDirectory({
      id: safeUser.id || resolvedId,
      name: safeUser.name,
      email: (safeUser as any).email || userEmail || `${safeUser.name.toLowerCase().replace(/\s+/g, '.')}@connectin.app`,
      avatar: safeUser.avatar,
      headline: safeUser.headline || safeUser.profession || 'Verified ConnectIn Member',
      roles: isAdmin ? ['SUPER_ADMIN', 'ADMIN'] : [String(sanitizedRole || 'personal').toUpperCase()],
      organization: safeUser.profession || safeUser.professionCategory || 'Verified ConnectIn Member',
      location: safeUser.location || 'United States · Verified',
      registeredAt: (safeUser as any).registeredAt || nowIso,
      lastLogin: loginLabel,
      mfaStatus: mfaLabel
    })

    // Async background sync to global cloud database for all authenticated users worldwide
    const clientTimezone =
      typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined
    const cloudAvatar =
      safeUser.avatar && !safeUser.avatar.startsWith('data:')
        ? safeUser.avatar
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(safeUser.name)}&backgroundColor=0a66c2`
    fetch('/api/connectin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: safeUser.id,
        userId: (safeUser as any).userId || safeUser.id,
        email: (safeUser as any).email,
        name: safeUser.name,
        role: sanitizedRole,
        headline: safeUser.headline,
        avatar: cloudAvatar,
        coverImage: safeUser.coverImage && !safeUser.coverImage.startsWith('data:') ? safeUser.coverImage : undefined,
        location: safeUser.location,
        about: safeUser.about,
        skills: Array.isArray(safeUser.skills)
          ? safeUser.skills.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
          : [],
        profession: safeUser.profession,
        professionId: safeUser.professionId,
        professionCategory: safeUser.professionCategory,
        professionEnclave: safeUser.professionEnclave,
        authProvider,
        clientTimezone
      })
    }).catch(() => {})
  } catch (e) {
    console.error('Failed to save user to storage', e)
  }
}

export function loadStoredSessionRoute(): { tab?: string; workspace?: 'personal' | 'enterprise' | 'creator' | 'seller' } {
  if (typeof window === 'undefined') return {}
  try {
    const activeUser = getExplicitStoredUser()
    const ns = getActiveUserNamespace(activeUser)
    let tab = localStorage.getItem(`${STORAGE_KEYS.TAB}_${ns}`) || undefined
    if (tab === 'adminiam' && !isSuperAdminUser(activeUser)) {
      tab = 'home'
    }
    const workspace = (localStorage.getItem(`${STORAGE_KEYS.WORKSPACE}_${ns}`) as any) || undefined
    return { tab, workspace }
  } catch (e) {
    return {}
  }
}

export function saveStoredSessionRoute(tab: string, workspace: string) {
  if (typeof window === 'undefined') return
  try {
    const activeUser = getExplicitStoredUser()
    const ns = getActiveUserNamespace(activeUser)
    const safeTab = tab === 'adminiam' && !isSuperAdminUser(activeUser) ? 'home' : tab
    localStorage.setItem(`${STORAGE_KEYS.TAB}_${ns}`, safeTab)
    localStorage.setItem(`${STORAGE_KEYS.WORKSPACE}_${ns}`, workspace)
    localStorage.setItem(STORAGE_KEYS.TAB, safeTab)
    localStorage.setItem(STORAGE_KEYS.WORKSPACE, workspace)
  } catch (e) {
    console.error('Failed to save session route', e)
  }
}

export function loadStoredAdminUsers(): AdminUserRecord[] {
  if (typeof window === 'undefined') return ADMIN_USERS_DIRECTORY
  try {
    const savedRaw = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)
    const savedList: AdminUserRecord[] = savedRaw ? JSON.parse(savedRaw) : []

    // Also harvest all accounts that have ever signed in or registered in ACCOUNTS_VAULT (sorted newest first)
    const vault = readJsonMap<Partial<UserProfile>>(STORAGE_KEYS.ACCOUNTS_VAULT)
    const vaultEntries = Object.values(vault).sort((a: any, b: any) => {
      const ta = new Date(a?.lastLoginAt || a?.registeredAt || 0).getTime()
      const tb = new Date(b?.lastLoginAt || b?.registeredAt || 0).getTime()
      return tb - ta
    })
    const vaultRecords: AdminUserRecord[] = []

    vaultEntries.forEach((u) => {
      if (!u || !u.name) return
      const email = String((u as any).email || `${u.name.toLowerCase().replace(/\s+/g, '.')}@connectin.app`).trim()
      const isAdmin = isSuperAdminUser({ name: u.name, email })
      const roleStr = isAdmin ? 'SUPER_ADMIN' : String((u as any).role || 'PERSONAL').toUpperCase()
      const provider = (u as any).authProvider
      const mfaLabel =
        provider === 'Google SSO'
          ? 'Google SSO ✓'
          : provider === 'Microsoft Entra ID'
          ? 'Microsoft SSO ✓'
          : 'Email 2FA ✓'
      const loginTime = (u as any).lastLoginAt
        ? new Date((u as any).lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : ''
      vaultRecords.push({
        id: u.id || (u as any).userId || `USR-${email.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()}`,
        name: u.name,
        email,
        avatar: u.avatar || getDefaultPortraitForUser({ name: u.name, email }),
        headline: u.headline || u.profession || 'Verified ConnectIn Member',
        roles: [roleStr],
        enforcementStatus: 'Active',
        verificationLevel: 'Email Verified',
        mfaStatus: mfaLabel,
        riskLevel: 'Low',
        organization: u.profession || u.professionCategory || 'Verified ConnectIn Member',
        location: u.location || 'United States · Verified',
        connectionsCount: u.connectionsCount || 0,
        registeredAt: (u as any).registeredAt
          ? new Date((u as any).registeredAt).toLocaleString()
          : 'Recent Sign-Up',
        lastLogin: loginTime
          ? `Logged In${provider ? ' via ' + provider : ''} (${loginTime})`
          : 'Active Now · Logged In',
        reportsCount: 0
      })
    })

    // Deduplicate by composite Name + Email key so users who tested with a new name & same email both appear!
    const dedupedMap = new Map<string, AdminUserRecord>()
    const getKey = (item: AdminUserRecord) =>
      `${String(item.name || '').toLowerCase().trim()}::${String(item.email || '').toLowerCase().trim()}`

    const staticEmails = new Set([
      'alex.taylor@expedite-consults.com',
      'alex.taylor@connectin.com',
      'dmitri.v@unknown-proxy.io',
      'spam_lead_gen@crawler.net',
      'elena.rostova@stanford.edu',
      'marcus.vance@cloudscaleglobal.io',
      'marcus.vance@defense-systems.com',
      'sarah.chen@defense-studio.tv',
      'david.k@expedite-labs.io',
      'sec-admin@connectin.internal',
      'commander.robert.hayes@connectin.com'
    ])
    const isRealUser = (item: AdminUserRecord) =>
      !staticEmails.has(String(item.email || '').toLowerCase().trim())

    const allCandidates = [...ADMIN_USERS_DIRECTORY.filter(isRealUser), ...savedList, ...vaultRecords, ...ADMIN_USERS_DIRECTORY]
    ;[
      ...allCandidates.filter(isRealUser),
      ...allCandidates.filter(i => !isRealUser(i))
    ].forEach((item) => {
      if (!item || !item.email) return
      const key = getKey(item)
      if (!dedupedMap.has(key)) {
        dedupedMap.set(key, item)
      }
    })

    return Array.from(dedupedMap.values())
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
  avatar?: string
  headline?: string
  roles: string[]
  organization: string
  location?: string
  registeredAt?: string
  lastLogin?: string
  mfaStatus?: string
}) {
  if (typeof window === 'undefined') return
  try {
    const savedRaw = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)
    const current: AdminUserRecord[] = savedRaw ? JSON.parse(savedRaw) : []
    const newRecord: AdminUserRecord = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar || getDefaultPortraitForUser({ name: newUser.name, email: newUser.email }),
      headline: newUser.headline || 'Verified ConnectIn Member',
      roles: newUser.roles,
      enforcementStatus: 'Active',
      verificationLevel: 'Email Verified',
      mfaStatus: (newUser.mfaStatus as any) || 'Email 2FA ✓',
      riskLevel: 'Low',
      organization: newUser.organization || 'Verified ConnectIn Member',
      location: newUser.location || 'United States · Verified',
      connectionsCount: 0,
      registeredAt: newUser.registeredAt
        ? new Date(newUser.registeredAt).toLocaleString()
        : new Date().toLocaleString(),
      lastLogin: newUser.lastLogin || 'Active Now · Logged In',
      reportsCount: 0
    }
    const targetKey = `${newUser.name.toLowerCase().trim()}::${newUser.email.toLowerCase().trim()}`
    const updated = [
      newRecord,
      ...current.filter(
        u => `${String(u.name || '').toLowerCase().trim()}::${String(u.email || '').toLowerCase().trim()}` !== targetKey
      )
    ]
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
    if (!saved) return suggestedConnections
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return suggestedConnections
    const seenNames = new Set<string>()
    const seenIds = new Set<string>()
    const sanitized: SuggestedConnection[] = []
    for (const item of parsed) {
      if (!item || !item.name) continue
      const normName = String(item.name).toLowerCase().trim()
      if (seenNames.has(normName)) continue
      seenNames.add(normName)
      const uniqueId = seenIds.has(item.id)
        ? `${item.id}_${normName.replace(/[^a-z0-9]/g, '')}`
        : item.id || `conn_${normName.replace(/[^a-z0-9]/g, '')}`
      seenIds.add(uniqueId)
      const safeCaps = Array.isArray(item.capabilities)
        ? item.capabilities
            .map((c: any) => (typeof c === 'string' ? c : c?.name ? String(c.name) : ''))
            .filter(Boolean)
        : []
      const safeBadges = Array.isArray(item.verifiedBadges)
        ? item.verifiedBadges.map((b: any) => String(b || '')).filter(Boolean)
        : []
      sanitized.push({
        ...item,
        id: uniqueId,
        capabilities: safeCaps,
        verifiedBadges: safeBadges
      })
    }
    return sanitized
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

export type UserActivityActionType =
  | 'USER_LOGIN'
  | 'USER_REGISTERED'
  | 'USER_LOGOUT'
  | 'POST_CREATED'
  | 'POST_LIKED'
  | 'POST_UNLIKED'
  | 'POST_COMMENTED'
  | 'COMMENT_REPLIED'
  | 'POST_REPOSTED'
  | 'POST_SHARED'
  | 'POST_SAVED'
  | 'POLL_VOTED'
  | 'USER_CONNECTED'
  | 'USER_FOLLOWED'
  | 'RESUME_UPLOADED'
  | 'PROFILE_UPDATED'
  | 'JOB_APPLIED'
  | 'MESSAGE_SENT'
  | 'TAB_VIEWED'

export interface UserActivityEvent {
  id: string
  userId: string
  userName: string
  userEmail: string
  userAvatar: string
  userRole: string
  actionType: UserActivityActionType
  actionLabel: string
  category: 'auth' | 'engagement' | 'content' | 'network' | 'profile'
  targetId?: string
  targetTitle?: string
  details?: string
  timestampIso: string
  timestampDisplay: string
}

const INITIAL_SEEDED_ACTIVITY_LOGS: UserActivityEvent[] = [
  {
    id: 'ACT-SEED-101',
    userId: 'USR-89401',
    userName: 'Kwesi Asiedu',
    userEmail: 'asiedudanquah@gmail.com',
    userAvatar: '/brand/kwesi-avatar.png',
    userRole: 'SUPER_ADMIN',
    actionType: 'USER_LOGIN',
    actionLabel: 'Signed In (Email 2FA Verified)',
    category: 'auth',
    targetTitle: 'ConnectLn Platform',
    details: 'Authenticated via Zero-Trust 2FA Session',
    timestampIso: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    timestampDisplay: '15 mins ago'
  },
  {
    id: 'ACT-SEED-102',
    userId: 'USR-89412',
    userName: 'Dr. Elena Rostova',
    userEmail: 'elena.nurse@connectin.com',
    userAvatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=400&auto=format&fit=crop&q=80',
    userRole: 'PERSONAL',
    actionType: 'POST_LIKED',
    actionLabel: 'Liked a Post (❤️ Love)',
    category: 'engagement',
    targetTitle: 'Post by Kwesi Asiedu',
    details: 'Reacted ❤️ Love to "D-Strike: Automated Zero-Trust Penetration Testing & Telemetry"',
    timestampIso: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    timestampDisplay: '28 mins ago'
  },
  {
    id: 'ACT-SEED-103',
    userId: 'USR-89415',
    userName: 'Marcus Miller',
    userEmail: 'marcus.mechanic@connectin.com',
    userAvatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
    userRole: 'PERSONAL',
    actionType: 'POST_COMMENTED',
    actionLabel: 'Commented on a Post',
    category: 'engagement',
    targetTitle: 'Post by Kwesi Asiedu',
    details: 'Comment: "Outstanding breakdown of real-world field verification and safety standards!"',
    timestampIso: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    timestampDisplay: '42 mins ago'
  },
  {
    id: 'ACT-SEED-104',
    userId: 'USR-89418',
    userName: 'Tariq Al-Mansoor',
    userEmail: 'tariq.cyber@connectin.com',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    userRole: 'ENTERPRISE',
    actionType: 'POST_REPOSTED',
    actionLabel: 'Reposted to Network Feed',
    category: 'engagement',
    targetTitle: 'Post by Kwesi Asiedu',
    details: 'Reposted "Zero-Trust Cloud Security & eBPF Kernel Telemetry Architecture" to 1,420 followers',
    timestampIso: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    timestampDisplay: '55 mins ago'
  },
  {
    id: 'ACT-SEED-105',
    userId: 'USR-89420',
    userName: 'Sarah Chen',
    userEmail: 'sarah.chen@defense-studio.tv',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    userRole: 'CREATOR',
    actionType: 'POST_SHARED',
    actionLabel: 'Shared Post via WhatsApp',
    category: 'engagement',
    targetTitle: 'Post by Kwesi Asiedu',
    details: 'Shared ConnectLn Masterclass Card via WhatsApp external share link',
    timestampIso: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    timestampDisplay: '1 hr ago'
  }
]

export function trackUserActivity(params: {
  actionType: UserActivityActionType
  actionLabel: string
  category: 'auth' | 'engagement' | 'content' | 'network' | 'profile'
  targetId?: string
  targetTitle?: string
  details?: string
  user?: Partial<UserProfile> & { email?: string; role?: string }
}) {
  if (typeof window === 'undefined') return
  try {
    const activeUser = params.user || getExplicitStoredUser() || currentUser
    const userEmail = String((activeUser as any).email || `${String(activeUser.name || 'member').toLowerCase().replace(/\s+/g, '.')}@connectin.app`).trim()
    const userName = activeUser.name || 'ConnectIn Member'
    const isAdmin = isSuperAdminUser({ name: userName, email: userEmail })
    const userRole = isAdmin ? 'SUPER_ADMIN' : String((activeUser as any).role || 'PERSONAL').toUpperCase()
    const userAvatar = resolveUserProfilePicture(activeUser as UserProfile)
    const now = new Date()

    const newEvent: UserActivityEvent = {
      id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      userId: activeUser.id || (activeUser as any).userId || `USR-${userEmail.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()}`,
      userName,
      userEmail,
      userAvatar,
      userRole,
      actionType: params.actionType,
      actionLabel: params.actionLabel,
      category: params.category,
      targetId: params.targetId,
      targetTitle: params.targetTitle,
      details: params.details,
      timestampIso: now.toISOString(),
      timestampDisplay: now.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const raw = localStorage.getItem(STORAGE_KEYS.USER_ACTIVITY_LOGS)
    const existing: UserActivityEvent[] = raw ? JSON.parse(raw) : []
    const updated = [newEvent, ...existing].slice(0, 500)
    localStorage.setItem(STORAGE_KEYS.USER_ACTIVITY_LOGS, JSON.stringify(updated))

    // Sync asynchronously to server activity telemetry endpoint
    fetch('/api/connectin/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    }).catch(() => {})
  } catch (e) {
    console.warn('Failed to track user activity:', e)
  }
}

export function loadStoredUserActivityLogs(): UserActivityEvent[] {
  if (typeof window === 'undefined') return INITIAL_SEEDED_ACTIVITY_LOGS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_ACTIVITY_LOGS)
    const saved: UserActivityEvent[] = raw ? JSON.parse(raw) : []

    // Also synthesize login/registration events from ACCOUNTS_VAULT for any users who signed in previously
    const vault = readJsonMap<Partial<UserProfile>>(STORAGE_KEYS.ACCOUNTS_VAULT)
    const vaultEvents: UserActivityEvent[] = []
    Object.values(vault).forEach((u) => {
      if (!u || !u.name) return
      const email = String((u as any).email || `${u.name.toLowerCase().replace(/\s+/g, '.')}@connectin.app`).trim()
      const isAdmin = isSuperAdminUser({ name: u.name, email })
      const loginIso = (u as any).lastLoginAt || (u as any).registeredAt || new Date().toISOString()
      const synthId = `ACT-VAULT-${u.name.toLowerCase().replace(/\s+/g, '_')}-${email.toLowerCase()}`
      if (!saved.some(s => s.id === synthId || (s.actionType === 'USER_LOGIN' && s.userName.toLowerCase() === u.name!.toLowerCase() && s.userEmail.toLowerCase() === email.toLowerCase()))) {
        vaultEvents.push({
          id: synthId,
          userId: u.id || `USR-${email.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()}`,
          userName: u.name,
          userEmail: email,
          userAvatar: u.avatar || getDefaultPortraitForUser({ name: u.name, email }),
          userRole: isAdmin ? 'SUPER_ADMIN' : String((u as any).role || 'PERSONAL').toUpperCase(),
          actionType: 'USER_LOGIN',
          actionLabel: 'Signed In & Verified Session',
          category: 'auth',
          targetTitle: 'ConnectLn Workspace',
          details: `Authenticated as ${u.name} (${email}) · ${u.profession || u.headline || 'Verified Member'}`,
          timestampIso: loginIso,
          timestampDisplay: new Date(loginIso).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        })
      }
    })

    const combined = [...saved, ...vaultEvents, ...INITIAL_SEEDED_ACTIVITY_LOGS]
    const deduped = new Map<string, UserActivityEvent>()
    combined.forEach(ev => {
      if (ev && ev.id && !deduped.has(ev.id)) {
        deduped.set(ev.id, ev)
      }
    })
    return Array.from(deduped.values())
  } catch {
    return INITIAL_SEEDED_ACTIVITY_LOGS
  }
}

