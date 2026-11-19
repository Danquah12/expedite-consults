import * as webPush from "web-push"
import { connectinDb } from "./connectin-db"
import { pullCloudUsersIntoDb } from "./connectin-cloud-sync"
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
  pushSubscriptions: StoredPushSubscription[]
  registeredAtIso: string
  updatedAtIso: string
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
  __connectlnWhatsAppCacheLoadedAt?: number
}

if (!globalForWhatsAppDir.__connectlnWhatsAppPhoneCache) {
  globalForWhatsAppDir.__connectlnWhatsAppPhoneCache = new Map<string, WhatsAppDirectoryMember>()
}

function getTwilioAuthHeader(): string | null {
  const sid = (process.env.TWILIO_ACCOUNT_SID || "").trim()
  const token = (process.env.TWILIO_AUTH_TOKEN || "").trim()
  if (!sid || !token) return null
  return `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`
}

function makePhoneItemKey(e164: string): string {
  const digits = String(e164 || "").replace(/[^\d]/g, "")
  return `phone__${digits}`
}

async function ensureSyncMap(authHeader: string): Promise<void> {
  try {
    const check = await fetch(
      `https://sync.twilio.com/v1/Services/default/Maps/${WHATSAPP_DIR_MAP}`,
      { headers: { Authorization: authHeader }, cache: "no-store" }
    )
    if (check.ok) return
    if (check.status === 404) {
      await fetch("https://sync.twilio.com/v1/Services/default/Maps", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ UniqueName: WHATSAPP_DIR_MAP }).toString(),
      })
    }
  } catch {
    // non-fatal
  }
}

async function readDirItem<T = any>(authHeader: string, key: string): Promise<T | null> {
  try {
    const res = await fetch(
      `https://sync.twilio.com/v1/Services/default/Maps/${WHATSAPP_DIR_MAP}/Items/${encodeURIComponent(
        key
      )}`,
      { headers: { Authorization: authHeader }, cache: "no-store" }
    )
    if (!res.ok) return null
    const json: any = await res.json()
    return (json?.data as T) || null
  } catch {
    return null
  }
}

async function writeDirItem(authHeader: string, key: string, dataObj: any): Promise<boolean> {
  await ensureSyncMap(authHeader)
  const serialized = JSON.stringify(dataObj)
  const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${WHATSAPP_DIR_MAP}`
  try {
    const updateRes = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ Data: serialized }).toString(),
    })
    if (updateRes.ok) return true
    if (updateRes.status === 404) {
      const createRes = await fetch(`${baseUrl}/Items`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ Key: key, Data: serialized }).toString(),
      })
      return createRes.ok
    }
    return false
  } catch {
    return false
  }
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

  // 1. Seed registered ConnectLn users who have phones in DB / Cloud Users
  try {
    await pullCloudUsersIntoDb()
    const users = connectinDb.getAllUsersWithProfiles()
    for (const u of users) {
      if (u.phone && looksLikePhoneNumber(u.phone)) {
        const norm = normalizeDialablePhone(u.phone)
        if (!cache.has(norm)) {
          const nowIso = new Date().toISOString()
          cache.set(norm, {
            phone: norm,
            prettyPhone: formatPrettyPhoneDisplay(norm),
            name: u.name || norm,
            email: u.email,
            avatar: u.avatar,
            headline: u.headline,
            pushSubscriptions: [],
            registeredAtIso: nowIso,
            updatedAtIso: nowIso,
          })
        }
      }
    }
  } catch {
    // non-fatal
  }

  // 2. Pull cloud WhatsApp directory items (`phone__*`) including Web Push subscriptions
  const auth = getTwilioAuthHeader()
  if (auth) {
    try {
      const res = await fetch(
        `https://sync.twilio.com/v1/Services/default/Maps/${WHATSAPP_DIR_MAP}/Items?PageSize=100`,
        { headers: { Authorization: auth }, cache: "no-store" }
      )
      if (res.ok) {
        const json: any = await res.json()
        const items = Array.isArray(json?.items) ? json.items : []
        for (const item of items) {
          const key = String(item?.key || "")
          if (!key.startsWith("phone__")) continue
          const data = item?.data as WhatsAppDirectoryMember | undefined
          if (data?.phone && looksLikePhoneNumber(data.phone)) {
            const norm = normalizeDialablePhone(data.phone)
            cache.set(norm, {
              ...data,
              phone: norm,
              prettyPhone: formatPrettyPhoneDisplay(norm),
              pushSubscriptions: Array.isArray(data.pushSubscriptions)
                ? data.pushSubscriptions
                : [],
            })
          }
        }
      }
    } catch {
      // non-fatal
    }
  }

  return cache
}

export async function registerWhatsAppMemberNumber(params: {
  phone: string
  name: string
  email?: string
  avatar?: string
  headline?: string
  pushSubscription?: StoredPushSubscription | null
  deviceLabel?: string
}): Promise<WhatsAppDirectoryMember | null> {
  if (!looksLikePhoneNumber(params.phone)) return null
  const normPhone = normalizeDialablePhone(params.phone)
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

  const record: WhatsAppDirectoryMember = {
    phone: normPhone,
    prettyPhone: formatPrettyPhoneDisplay(normPhone),
    name: params.name?.trim() || existing?.name || formatPrettyPhoneDisplay(normPhone),
    email: params.email?.trim().toLowerCase() || existing?.email,
    avatar: params.avatar || existing?.avatar,
    headline: params.headline || existing?.headline,
    pushSubscriptions: subs,
    registeredAtIso: existing?.registeredAtIso || nowIso,
    updatedAtIso: nowIso,
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

  return record
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
  const cache = await refreshWhatsAppDirectoryCache()
  const rawPhone = (params.targetPhone || "").trim()
  const rawName = (params.targetName || "").replace(/^@+/, "").trim()
  const normName = rawName.toLowerCase()
  const normEmail = (params.targetEmail || "").trim().toLowerCase()

  const candidatePhone = looksLikePhoneNumber(rawPhone)
    ? normalizeDialablePhone(rawPhone)
    : looksLikePhoneNumber(rawName)
    ? normalizeDialablePhone(rawName)
    : ""

  if (candidatePhone && cache.has(candidatePhone)) {
    const found = cache.get(candidatePhone)!
    return {
      isRegisteredOnConnectLn: true,
      member: found,
      dialablePhone: found.phone,
    }
  }

  // Search directory by email or name
  for (const member of cache.values()) {
    const mEmail = (member.email || "").toLowerCase()
    const mName = (member.name || "").toLowerCase()
    if (
      (normEmail && mEmail && mEmail === normEmail) ||
      (normName &&
        mName &&
        !looksLikePhoneNumber(rawName) &&
        (mName === normName || mName.includes(normName) || normName.includes(mName)))
    ) {
      return {
        isRegisteredOnConnectLn: true,
        member,
        dialablePhone: member.phone,
      }
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

/**
 * Sends a high-priority RFC 8291 Web Push notification to all subscribed phones/browsers
 * of the target ConnectLn member so their phone wakes up & rings even when the browser is closed.
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
  const subs = params.member.pushSubscriptions || []
  if (subs.length === 0) {
    return { deliveredCount: 0, mobileDeliveredCount: 0, attemptedCount: 0 }
  }

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
  const validSubs: StoredPushSubscription[] = []
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
        validSubs.push(sub)
      } catch (err: any) {
        const code = Number(err?.statusCode || 0)
        if (code === 404 || code === 410) {
          prunedAny = true
        } else {
          validSubs.push(sub)
        }
      }
    })
  )

  if (prunedAny) {
    const auth = getTwilioAuthHeader()
    const updated: WhatsAppDirectoryMember = {
      ...params.member,
      pushSubscriptions: validSubs,
      updatedAtIso: new Date().toISOString(),
    }
    globalForWhatsAppDir.__connectlnWhatsAppPhoneCache?.set(params.member.phone, updated)
    if (auth) {
      await writeDirItem(auth, makePhoneItemKey(params.member.phone), updated).catch(() => {})
    }
  }

  return { deliveredCount, mobileDeliveredCount, attemptedCount: subs.length }
}
