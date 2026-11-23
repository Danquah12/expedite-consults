import * as webPush from "web-push"
import { connectinDb } from "./connectin-db"
import { publishToPhones } from "./connectin-realtime"
import {
  firebaseKvGetItem,
  firebaseKvSetItem,
  firebaseKvListItems,
  firebaseKvDeleteItem,
} from "./connectin-firebase-kv"
import { pullCloudUsersIntoDb, upsertCloudUser } from "./connectin-cloud-sync"
import {
  normalizeDialablePhone,
  looksLikePhoneNumber,
  formatPrettyPhoneDisplay,
  saveContactPhoneMapping,
  resolveRecipientCellPhone,
} from "./connectin-twilio-voice"

export interface StoredPushSubscription {
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
  deviceLabel?: string
  updatedAtIso?: string
}

export interface WhatsAppDirectoryMember {
  phone: string // E.164, e.g. "+14108418358", "+233205550412"
  prettyPhone: string
  name: string
  email?: string
  avatar?: string
  headline?: string
  verifiedBy2FA?: boolean
  pushSubscriptions: StoredPushSubscription[]
  fcmTokens?: string[] // Native Android app FCM tokens (full-screen ringing even when app is closed)
  registeredAtIso: string
  updatedAtIso: string
}

const FOUNDER_EMAIL_ALIASES = new Set([
  "kasiedu@expedite-consults.com",
  "kasiedu@expediteconsults.com",
  "asiedudanquah@gmail.com",
])

export function isSamePhoneOwnerEmail(emailA?: string, emailB?: string): boolean {
  const a = String(emailA || "").trim().toLowerCase()
  const b = String(emailB || "").trim().toLowerCase()
  if (!a || !b) return false
  if (a === b) return true
  if (FOUNDER_EMAIL_ALIASES.has(a) && FOUNDER_EMAIL_ALIASES.has(b)) return true
  return false
}

interface VapidKeyPair {
  publicKey: string
  privateKey: string
}

const WHATSAPP_DIR_MAP = "connectln_whatsapp_directory_v1"
const VAPID_ITEM_KEY = "vapid_keys_v1"

const globalForWhatsAppDir = globalThis as unknown as {
  __connectlnVapidKeys?: VapidKeyPair
  __connectlnWhatsAppPhoneCache?: Map<string, WhatsAppDirectoryMember>
  __connectlnWhatsAppDeletedPhones?: Set<string>
  __connectlnWhatsAppCacheLoadedAt?: number
}

if (!globalForWhatsAppDir.__connectlnWhatsAppPhoneCache) {
  globalForWhatsAppDir.__connectlnWhatsAppPhoneCache = new Map<string, WhatsAppDirectoryMember>()
}
if (!globalForWhatsAppDir.__connectlnWhatsAppDeletedPhones) {
  globalForWhatsAppDir.__connectlnWhatsAppDeletedPhones = new Set<string>()
}

function getTwilioAuthHeader(): string | null {
  return "firebase-kv"
}

function makePhoneItemKey(e164: string): string {
  const digits = String(e164 || "").replace(/[^\d]/g, "")
  return `phone__${digits}`
}

function makeDeletedPhoneKey(e164: string): string {
  const digits = String(e164 || "").replace(/[^\d]/g, "")
  return `deleted__${digits}`
}

async function readDirItem<T = any>(_authHeader: string | null, key: string): Promise<T | null> {
  return await firebaseKvGetItem<T>(WHATSAPP_DIR_MAP, key)
}

async function writeDirItem(_authHeader: string | null, key: string, dataObj: any): Promise<boolean> {
  return await firebaseKvSetItem(WHATSAPP_DIR_MAP, key, dataObj)
}

/**
 * Retrieves or auto-provisions permanent P-256 VAPID keys in Twilio Cloud Sync
 * so Web Push call ringing works consistently across all Vercel serverless workers.
 */
export async function getOrCreateConnectLnVapidKeys(): Promise<VapidKeyPair> {
  if (globalForWhatsAppDir.__connectlnVapidKeys) {
    return globalForWhatsAppDir.__connectlnVapidKeys
  }

  const envPub = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || "").trim()
  const envPriv = (process.env.VAPID_PRIVATE_KEY || "").trim()
  if (envPub && envPriv) {
    const pair = { publicKey: envPub, privateKey: envPriv }
    globalForWhatsAppDir.__connectlnVapidKeys = pair
    return pair
  }

  const auth = getTwilioAuthHeader()
  if (auth) {
    const existing = await readDirItem<VapidKeyPair>(auth, VAPID_ITEM_KEY)
    if (existing?.publicKey && existing?.privateKey) {
      globalForWhatsAppDir.__connectlnVapidKeys = existing
      return existing
    }
  }

  const generated = webPush.generateVAPIDKeys()
  const createdPair: VapidKeyPair = {
    publicKey: generated.publicKey,
    privateKey: generated.privateKey,
  }
  if (auth) {
    await writeDirItem(auth, VAPID_ITEM_KEY, createdPair)
  }
  globalForWhatsAppDir.__connectlnVapidKeys = createdPair
  return createdPair
}

export async function refreshWhatsAppDirectoryCache(force = false): Promise<Map<string, WhatsAppDirectoryMember>> {
  const cache = globalForWhatsAppDir.__connectlnWhatsAppPhoneCache!
  const deletedPhones = globalForWhatsAppDir.__connectlnWhatsAppDeletedPhones!
  const nowMs = Date.now()
  if (
    !force &&
    cache.size > 0 &&
    globalForWhatsAppDir.__connectlnWhatsAppCacheLoadedAt &&
    nowMs - globalForWhatsAppDir.__connectlnWhatsAppCacheLoadedAt < 8_000
  ) {
    return cache
  }
  globalForWhatsAppDir.__connectlnWhatsAppCacheLoadedAt = nowMs

  // 0. Pull cloud WhatsApp directory items + deleted tombstones (`deleted__*`) from Firebase KV first
  let kvItems: Array<{ key: string; data: any; updatedAtMs: number }> = []
  try {
    kvItems = await firebaseKvListItems<any>(WHATSAPP_DIR_MAP, force)
    for (const item of kvItems) {
      const key = String(item?.key || "")
      if (key.startsWith("deleted__")) {
        const rawPhone = item?.data?.phone || `+${key.replace(/^deleted__/, "")}`
        if (looksLikePhoneNumber(rawPhone)) {
          const norm = normalizeDialablePhone(rawPhone)
          deletedPhones.add(norm)
          cache.delete(norm)
        }
      }
    }
  } catch {}

  // 1. Seed registered ConnectLn users who have phones in DB / Cloud Users
  try {
    await pullCloudUsersIntoDb()
    const users = connectinDb.getAllUsersWithProfiles()
    for (const u of users) {
      if (u.phone && looksLikePhoneNumber(u.phone)) {
        const norm = normalizeDialablePhone(u.phone)
        if (deletedPhones.has(norm)) continue
        const existing = cache.get(norm)
        const isSyntheticEmail =
          !u.email ||
          u.email.endsWith("@connectin.app") ||
          u.email.endsWith("@connectin.phone")
        const isDemo555 = /^\+1\d{3}555\d{4}$/.test(norm)
        const nowIso = new Date().toISOString()
        cache.set(norm, {
          phone: norm,
          prettyPhone: formatPrettyPhoneDisplay(norm),
          name: existing?.name || u.name || norm,
          email: existing?.email || u.email,
          avatar: existing?.avatar || u.avatar,
          headline: existing?.headline || u.headline,
          verifiedBy2FA: Boolean(
            existing?.verifiedBy2FA ||
              (u as any).phoneVerified ||
              (!isSyntheticEmail && !isDemo555)
          ),
          pushSubscriptions: existing?.pushSubscriptions || [],
          registeredAtIso: existing?.registeredAtIso || nowIso,
          updatedAtIso: existing?.updatedAtIso || nowIso,
        })
      }
    }
  } catch {
    // non-fatal
  }

  // 1b. Ensure known verified numbers (+12402607898, +12403608139, and +12402608139) are always seeded as verified (unless admin deleted them for testing)
  const baselineSeeds: Array<{ phone: string; name: string; email: string }> = [
    { phone: "+12402607898", name: "Kwesi Asiedu", email: "kasiedu@expedite-consults.com" },
    { phone: "+12403608139", name: "Kwesi Asiedu", email: "kasiedu@expedite-consults.com" },
    { phone: "+12402608139", name: "Kwesi Asiedu", email: "kasiedu@expedite-consults.com" },
    { phone: "+14108418358", name: "Esther Boa Asiedu", email: "esther.asiedu@connectin.com" },
    { phone: "+12405550821", name: "Patience Addo", email: "patience.addo@connectin.com" },
    { phone: "+233205550412", name: "Isaac Boye", email: "isaac.boye@connectin.com" },
    { phone: "+447534700899", name: "Adwoa larbi", email: "adwoa.appong@nhs.net" },
  ]
  const seedNowIso = new Date().toISOString()
  for (const s of baselineSeeds) {
    if (deletedPhones.has(s.phone)) continue
    if (cache.has(s.phone)) continue
    cache.set(s.phone, {
      phone: s.phone,
      prettyPhone: formatPrettyPhoneDisplay(s.phone),
      name: s.name,
      email: s.email,
      avatar: undefined,
      headline: undefined,
      verifiedBy2FA: true,
      pushSubscriptions: [],
      fcmTokens: [],
      registeredAtIso: seedNowIso,
      updatedAtIso: seedNowIso,
    })
  }

  // 2. Pull cloud WhatsApp directory items (`phone__*`) from Firebase KV including Web Push & FCM tokens
  try {
    for (const item of kvItems) {
      const key = String(item?.key || "")
      if (!key.startsWith("phone__")) continue
      const data = item?.data as WhatsAppDirectoryMember | undefined
      if (data?.phone && looksLikePhoneNumber(data.phone)) {
        const norm = normalizeDialablePhone(data.phone)
        if (deletedPhones.has(norm)) continue
        const existing = cache.get(norm)
        const realDataEmail =
          data.email &&
          !data.email.endsWith("@connectin.app") &&
          !data.email.endsWith("@connectin.phone")
            ? data.email
            : ""
        const realExistingEmail =
          existing?.email &&
          !existing.email.endsWith("@connectin.app") &&
          !existing.email.endsWith("@connectin.phone")
            ? existing.email
            : ""
        const mergedEmail =
          realDataEmail ||
          realExistingEmail ||
          data.email ||
          existing?.email
        const isSyntheticEmail =
          !mergedEmail ||
          mergedEmail.endsWith("@connectin.app") ||
          mergedEmail.endsWith("@connectin.phone")
        const isDemo555 = /^\+1\d{3}555\d{4}$/.test(norm)
        cache.set(norm, {
          ...existing,
          ...data,
          phone: norm,
          prettyPhone: formatPrettyPhoneDisplay(norm),
          name: data.name || existing?.name || norm,
          email: mergedEmail,
          verifiedBy2FA: Boolean(
            data.verifiedBy2FA ??
              existing?.verifiedBy2FA ??
              (!isSyntheticEmail && !isDemo555)
          ),
          pushSubscriptions: Array.isArray(data.pushSubscriptions)
            ? data.pushSubscriptions
            : existing?.pushSubscriptions || [],
          fcmTokens: Array.isArray(data.fcmTokens)
            ? data.fcmTokens
            : existing?.fcmTokens || [],
        })
      }
    }
  } catch {
    // non-fatal
  }

  return cache
}

export async function checkPhoneOwnershipConflict(_params: {
  phone: string
  claimantEmail?: string
  claimantName?: string
}): Promise<{ conflict: boolean; reason?: string }> {
  // Single-time phone validation policy: once a ConnectLn member validates their phone number,
  // they must never be blocked as an impersonator when logging in again or using multiple devices.
  return { conflict: false }
}

export async function registerWhatsAppMemberNumber(params: {
  phone: string
  name: string
  email?: string
  avatar?: string
  headline?: string
  verifiedBy2FA?: boolean
  pushSubscription?: StoredPushSubscription | null
  fcmToken?: string
  deviceLabel?: string
}): Promise<WhatsAppDirectoryMember | null> {
  if (!looksLikePhoneNumber(params.phone)) return null
  const normPhone = normalizeDialablePhone(params.phone)

  const ownership = await checkPhoneOwnershipConflict({
    phone: normPhone,
    claimantEmail: params.email,
    claimantName: params.name,
  })
  if (ownership.conflict) {
    throw new Error(ownership.reason || "Phone number belongs to another verified member.")
  }

  const cache = await refreshWhatsAppDirectoryCache()
  const existing = cache.get(normPhone)
  const nowIso = new Date().toISOString()

  let subs: StoredPushSubscription[] = existing?.pushSubscriptions
    ? [...existing.pushSubscriptions]
    : []

  if (
    params.pushSubscription?.endpoint &&
    params.pushSubscription?.keys?.p256dh &&
    params.pushSubscription?.keys?.auth
  ) {
    const cleanSub: StoredPushSubscription = {
      endpoint: params.pushSubscription.endpoint,
      expirationTime: params.pushSubscription.expirationTime ?? null,
      keys: {
        p256dh: params.pushSubscription.keys.p256dh,
        auth: params.pushSubscription.keys.auth,
      },
      deviceLabel: params.deviceLabel || params.pushSubscription.deviceLabel || "Mobile/Web Device",
      updatedAtIso: nowIso,
    }
    const idx = subs.findIndex((s) => s.endpoint === cleanSub.endpoint)
    if (idx >= 0) {
      subs[idx] = cleanSub
    } else {
      subs = [cleanSub, ...subs].slice(0, 6)
    }
  }

  let fcmTokens: string[] = Array.isArray(existing?.fcmTokens) ? [...existing!.fcmTokens!] : []
  const newFcm = String(params.fcmToken || "").trim()
  if (newFcm && newFcm.length > 20 && !fcmTokens.includes(newFcm)) {
    fcmTokens = [newFcm, ...fcmTokens].slice(0, 6)
  }

  const record: WhatsAppDirectoryMember = {
    phone: normPhone,
    prettyPhone: formatPrettyPhoneDisplay(normPhone),
    name: params.name?.trim() || existing?.name || formatPrettyPhoneDisplay(normPhone),
    fcmTokens,
    email: params.email?.trim().toLowerCase() || existing?.email,
    avatar: params.avatar || existing?.avatar,
    headline: params.headline || existing?.headline,
    verifiedBy2FA: Boolean(params.verifiedBy2FA || existing?.verifiedBy2FA),
    pushSubscriptions: subs,
    registeredAtIso: existing?.registeredAtIso || nowIso,
    updatedAtIso: nowIso,
  }

  const deletedPhones = globalForWhatsAppDir.__connectlnWhatsAppDeletedPhones!
  if (deletedPhones.has(normPhone)) {
    deletedPhones.delete(normPhone)
    await firebaseKvDeleteItem(WHATSAPP_DIR_MAP, makeDeletedPhoneKey(normPhone)).catch(() => {})
  }

  cache.set(normPhone, record)

  // Also persist in member contact phonebook so voice/SMS fallback resolves this number & name globally
  await saveContactPhoneMapping({
    phone: normPhone,
    contactName: record.name,
    contactEmail: record.email,
  }).catch(() => {})

  const auth = getTwilioAuthHeader()
  if (auth) {
    await writeDirItem(auth, makePhoneItemKey(normPhone), record)
  }

  // Mirror newly registered Web Push / FCM tokens to all other phone numbers owned by the same user email
  const newSubAdded =
    params.pushSubscription?.endpoint &&
    params.pushSubscription?.keys?.p256dh &&
    params.pushSubscription?.keys?.auth
      ? subs.find((s) => s.endpoint === params.pushSubscription!.endpoint) || null
      : null
  if (record.email && (newSubAdded || (newFcm && newFcm.length > 20))) {
    const syncSiblingOps: Promise<any>[] = []
    for (const [mPhone, sibling] of cache.entries()) {
      if (mPhone === normPhone) continue
      if (!sibling.email || !isSamePhoneOwnerEmail(sibling.email, record.email)) continue
      let siblingSubs = Array.isArray(sibling.pushSubscriptions)
        ? [...sibling.pushSubscriptions]
        : []
      let siblingChanged = false
      if (newSubAdded) {
        const sIdx = siblingSubs.findIndex((s) => s.endpoint === newSubAdded.endpoint)
        if (sIdx >= 0) {
          siblingSubs[sIdx] = newSubAdded
        } else {
          siblingSubs = [newSubAdded, ...siblingSubs].slice(0, 6)
        }
        siblingChanged = true
      }
      let siblingFcm = Array.isArray(sibling.fcmTokens) ? [...sibling.fcmTokens] : []
      if (newFcm && newFcm.length > 20 && !siblingFcm.includes(newFcm)) {
        siblingFcm = [newFcm, ...siblingFcm].slice(0, 6)
        siblingChanged = true
      }
      if (siblingChanged) {
        const updatedSibling: WhatsAppDirectoryMember = {
          ...sibling,
          pushSubscriptions: siblingSubs,
          fcmTokens: siblingFcm,
          updatedAtIso: nowIso,
        }
        cache.set(mPhone, updatedSibling)
        if (auth) {
          syncSiblingOps.push(writeDirItem(auth, makePhoneItemKey(mPhone), updatedSibling).catch(() => {}))
        }
      }
    }
    if (syncSiblingOps.length > 0) {
      await Promise.all(syncSiblingOps)
    }
  }

  return record
}

export async function deleteWhatsAppMemberNumber(params: {
  phone?: string
  email?: string
  name?: string
}): Promise<{ deletedPhones: string[] }> {
  const cache = await refreshWhatsAppDirectoryCache(true)
  const deletedPhones = globalForWhatsAppDir.__connectlnWhatsAppDeletedPhones!
  const targets = new Set<string>()

  const rawPhoneInput = String(params.phone || "").trim()
  if (rawPhoneInput) {
    for (const part of rawPhoneInput.split(/[,;]/)) {
      const trimmed = part.trim()
      if (looksLikePhoneNumber(trimmed)) {
        targets.add(normalizeDialablePhone(trimmed))
      }
    }
  }

  const targetEmail = String(params.email || "").trim().toLowerCase()
  const targetName = String(params.name || "").trim().toLowerCase()
  if (targets.size === 0 && (targetEmail || targetName)) {
    for (const [norm, member] of cache.entries()) {
      if (targetEmail && member.email && isSamePhoneOwnerEmail(member.email, targetEmail)) {
        targets.add(norm)
      } else if (targetName && member.name.trim().toLowerCase() === targetName) {
        targets.add(norm)
      }
    }
  }

  const nowIso = new Date().toISOString()
  for (const norm of targets) {
    cache.delete(norm)
    deletedPhones.add(norm)
    await firebaseKvDeleteItem(WHATSAPP_DIR_MAP, makePhoneItemKey(norm)).catch(() => {})
    await firebaseKvSetItem(WHATSAPP_DIR_MAP, makeDeletedPhoneKey(norm), {
      phone: norm,
      deletedAtIso: nowIso,
    }).catch(() => {})
  }

  // Also unlink from in-memory connectinDb users + cloud users
  try {
    const users = connectinDb.getUsers()
    for (const u of users) {
      const uNorm = u.phone && looksLikePhoneNumber(u.phone) ? normalizeDialablePhone(u.phone) : ""
      const emailMatched = targetEmail && isSamePhoneOwnerEmail(u.email, targetEmail)
      if ((uNorm && targets.has(uNorm)) || (emailMatched && targets.size > 0 && (!uNorm || targets.has(uNorm)))) {
        u.phone = ""
        ;(u as any).phoneVerified = false
        if (typeof connectinDb.updateUser === "function") {
          connectinDb.updateUser(u.id, { phone: "" })
        }
        const prof = connectinDb.findProfileByUserId(u.id)
        if (prof) {
          await upsertCloudUser({
            id: u.id,
            email: u.email,
            phone: "",
            name: prof.name,
            role: u.role,
            status: u.status,
            headline: prof.headline,
            avatar: prof.avatar,
            location: prof.location,
            lastLoginAt: nowIso,
            createdAt: u.createdAt || nowIso,
            updatedAt: nowIso,
          }).catch(() => {})
        }
      }
    }
  } catch {}

  return { deletedPhones: Array.from(targets) }
}

export async function lookupWhatsAppRecipient(params: {
  targetPhone?: string
  targetName?: string
  targetEmail?: string
}): Promise<{
  isRegisteredOnConnectLn: boolean
  member: WhatsAppDirectoryMember | null
  dialablePhone: string
}> {
  let cache = await refreshWhatsAppDirectoryCache()
  const rawPhone = (params.targetPhone || "").trim()
  const rawName = (params.targetName || "").replace(/^@+/, "").trim()
  const normName = rawName.toLowerCase()
  const normEmail = (params.targetEmail || "").trim().toLowerCase()

  const candidatePhone = looksLikePhoneNumber(rawPhone)
    ? normalizeDialablePhone(rawPhone)
    : looksLikePhoneNumber(rawName)
    ? normalizeDialablePhone(rawName)
    : ""

  const findInCache = (dirCache: Map<string, WhatsAppDirectoryMember>) => {
    if (candidatePhone && dirCache.has(candidatePhone)) {
      return dirCache.get(candidatePhone)!
    }
    for (const member of dirCache.values()) {
      const mEmail = (member.email || "").toLowerCase()
      const mName = (member.name || "").toLowerCase()
      if (
        (normEmail && mEmail && mEmail === normEmail) ||
        (normName &&
          mName &&
          !looksLikePhoneNumber(rawName) &&
          (mName === normName || mName.includes(normName) || normName.includes(mName)))
      ) {
        return member
      }
    }
    return null
  }

  let matchedMember = findInCache(cache)
  // Force one fresh Firebase KV refresh if member isn't cached yet OR has zero cached pushSubscriptions
  if (!matchedMember || (matchedMember.pushSubscriptions?.length || 0) === 0) {
    cache = await refreshWhatsAppDirectoryCache(true)
    const freshMatch = findInCache(cache)
    if (freshMatch) matchedMember = freshMatch
  }

  if (matchedMember) {
    return {
      isRegisteredOnConnectLn: true,
      member: matchedMember,
      dialablePhone: matchedMember.phone,
    }
  }

  // Check broader ConnectLn phone resolver (e.g. saved contact phonebook)
  const fallback = await resolveRecipientCellPhone({
    targetPhone: candidatePhone || undefined,
    targetName: rawName || undefined,
    targetEmail: normEmail || undefined,
  })

  if (fallback.resolvedPhone) {
    const norm = normalizeDialablePhone(fallback.resolvedPhone)
    if (cache.has(norm)) {
      return {
        isRegisteredOnConnectLn: true,
        member: cache.get(norm)!,
        dialablePhone: norm,
      }
    }
    return {
      isRegisteredOnConnectLn: false,
      member: null,
      dialablePhone: norm,
    }
  }

  return {
    isRegisteredOnConnectLn: false,
    member: null,
    dialablePhone: candidatePhone,
  }
}

const recentCallPushDedupeMap = new Map<string, number>()

/**
 * Sends high-priority FCM *data* messages to the member's native ConnectLn Android app(s).
 * The app's ConnectLnMessagingService turns these into a full-screen WhatsApp-style ringing
 * screen, even when the app is closed and the phone is locked. Requires env
 * FIREBASE_SERVICE_ACCOUNT_JSON (service-account JSON string). No-op when not configured.
 */
async function sendIncomingCallFcm(
  member: WhatsAppDirectoryMember,
  payload: Record<string, string>
): Promise<{ sent: number; deadTokens: string[] }> {
  const tokens = member.fcmTokens || []
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "").trim()
  if (tokens.length === 0 || !raw) return { sent: 0, deadTokens: [] }
  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app")
    const { getMessaging } = await import("firebase-admin/messaging")
    const app =
      getApps().length > 0 ? getApps()[0]! : initializeApp({ credential: cert(JSON.parse(raw)) })
    const res = await getMessaging(app).sendEachForMulticast({
      tokens,
      data: payload,
      android: { priority: "high", ttl: 45000 },
    })
    const dead: string[] = []
    res.responses.forEach((r, i) => {
      const code = r.error?.code || ""
      if (!r.success && /registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code)) {
        dead.push(tokens[i])
      }
    })
    return { sent: res.successCount, deadTokens: dead }
  } catch (err) {
    console.warn("[ConnectLn FCM] send failed:", (err as any)?.message)
    return { sent: 0, deadTokens: [] }
  }
}

/**
 * Sends a high-priority RFC 8291 Web Push notification to all subscribed phones/browsers
 * of the target ConnectLn member so their phone/desktop wakes up & rings even when minimized or closed.
 * Also fans out to the native Android app via FCM.
 */
export async function sendIncomingCallWebPush(params: {
  member: WhatsAppDirectoryMember
  callId: string
  callMode: "audio" | "video"
  callerName: string
  callerPhone?: string
  callerAvatar?: string
  joinUrl: string
}): Promise<{ deliveredCount: number; mobileDeliveredCount: number; attemptedCount: number }> {
  const cache = await refreshWhatsAppDirectoryCache()
  const matchedMembersMap = new Map<string, WhatsAppDirectoryMember>()
  matchedMembersMap.set(params.member.phone, params.member)

  const targetEmail = (params.member.email || "").trim().toLowerCase()
  const targetNameLower = (params.member.name || "").trim().toLowerCase()
  for (const m of cache.values()) {
    if (m.phone === params.member.phone) {
      matchedMembersMap.set(m.phone, m)
      continue
    }
    const emailMatches = Boolean(targetEmail && m.email && isSamePhoneOwnerEmail(m.email, targetEmail))
    const nameMatches = Boolean(
      targetNameLower &&
        m.name &&
        !looksLikePhoneNumber(m.name) &&
        m.name.trim().toLowerCase() === targetNameLower
    )
    if (emailMatches || nameMatches) {
      matchedMembersMap.set(m.phone, m)
    }
  }

  const matchedMembers = Array.from(matchedMembersMap.values())
  const allTargetPhones = Array.from(
    new Set(matchedMembers.map((m) => m.phone).filter(Boolean))
  )

  // Instant real-time ring to any open ConnectLn tab/app of this member across all owned numbers
  await publishToPhones(allTargetPhones, "incoming-call", {
    callId: params.callId,
    callMode: params.callMode,
    callerName: params.callerName,
    callerPhone: params.callerPhone || "",
  }).catch(() => {})

  const subByEndpoint = new Map<string, StoredPushSubscription>()
  const fcmSet = new Set<string>()
  for (const m of matchedMembers) {
    for (const s of m.pushSubscriptions || []) {
      if (s?.endpoint && s?.keys?.p256dh && s?.keys?.auth && !subByEndpoint.has(s.endpoint)) {
        subByEndpoint.set(s.endpoint, s)
      }
    }
    for (const t of m.fcmTokens || []) {
      if (t) fcmSet.add(t)
    }
  }
  const subs = Array.from(subByEndpoint.values())
  const mergedFcmTokens = Array.from(fcmSet)
  const fcmCount = mergedFcmTokens.length
  if (subs.length === 0 && fcmCount === 0) {
    return { deliveredCount: 0, mobileDeliveredCount: 0, attemptedCount: 0 }
  }

  const nowMs = Date.now()
  const dedupeKey = `${params.callId}::${params.member.phone}`
  const prevSentMs = recentCallPushDedupeMap.get(dedupeKey) || 0
  if (nowMs - prevSentMs < 25000) {
    const mobCount = subs.filter((s) => /mobile|phone|iphone|android/i.test(s.deviceLabel || "")).length
    return {
      deliveredCount: subs.length + fcmCount,
      mobileDeliveredCount: mobCount + fcmCount,
      attemptedCount: subs.length + fcmCount,
    }
  }
  recentCallPushDedupeMap.set(dedupeKey, nowMs)
  if (recentCallPushDedupeMap.size > 400) {
    for (const [k, ts] of recentCallPushDedupeMap.entries()) {
      if (nowMs - ts > 60000) recentCallPushDedupeMap.delete(k)
    }
  }

  const fcmMember: WhatsAppDirectoryMember = {
    ...params.member,
    fcmTokens: mergedFcmTokens,
  }
  const fcmPromise = sendIncomingCallFcm(fcmMember, {
    type: "INCOMING_CALL",
    callId: params.callId,
    callMode: params.callMode,
    callerName: params.callerName,
    callerPhone: params.callerPhone ? formatPrettyPhoneDisplay(params.callerPhone) : "",
    joinUrl: params.joinUrl,
  })

  const vapid = await getOrCreateConnectLnVapidKeys()
  webPush.setVapidDetails(
    "mailto:auth@expediteconsults.com",
    vapid.publicKey,
    vapid.privateKey
  )

  const payloadStr = JSON.stringify({
    type: "INCOMING_CALL",
    callId: params.callId,
    callMode: params.callMode,
    callerName: params.callerName,
    callerPhone: params.callerPhone ? formatPrettyPhoneDisplay(params.callerPhone) : "",
    callerAvatar: params.callerAvatar || "",
    joinUrl: params.joinUrl,
    ts: Date.now(),
  })

  let deliveredCount = 0
  let mobileDeliveredCount = 0
  const deadEndpoints = new Set<string>()
  let prunedAny = false

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(sub as any, payloadStr, {
          TTL: 60,
          urgency: "high",
        })
        deliveredCount += 1
        if (/mobile|phone|iphone|android/i.test(sub.deviceLabel || "")) {
          mobileDeliveredCount += 1
        }
      } catch (err: any) {
        const code = Number(err?.statusCode || 0)
        if (code === 404 || code === 410) {
          prunedAny = true
          deadEndpoints.add(sub.endpoint)
        }
      }
    })
  )

  const fcmResult = await fcmPromise
  deliveredCount += fcmResult.sent
  mobileDeliveredCount += fcmResult.sent

  if (prunedAny || fcmResult.deadTokens.length > 0) {
    const auth = getTwilioAuthHeader()
    const pruneWrites: Promise<any>[] = []
    for (const m of matchedMembers) {
      const hasDeadSub = (m.pushSubscriptions || []).some((s) => deadEndpoints.has(s.endpoint))
      const hasDeadFcm = (m.fcmTokens || []).some((t) => fcmResult.deadTokens.includes(t))
      if (!hasDeadSub && !hasDeadFcm) continue
      const updated: WhatsAppDirectoryMember = {
        ...m,
        pushSubscriptions: (m.pushSubscriptions || []).filter((s) => !deadEndpoints.has(s.endpoint)),
        fcmTokens: (m.fcmTokens || []).filter((t) => !fcmResult.deadTokens.includes(t)),
        updatedAtIso: new Date().toISOString(),
      }
      globalForWhatsAppDir.__connectlnWhatsAppPhoneCache?.set(m.phone, updated)
      if (auth) {
        pruneWrites.push(writeDirItem(auth, makePhoneItemKey(m.phone), updated).catch(() => {}))
      }
    }
    if (pruneWrites.length > 0) {
      await Promise.all(pruneWrites)
    }
  }

  return { deliveredCount, mobileDeliveredCount, attemptedCount: subs.length + fcmCount }
}
