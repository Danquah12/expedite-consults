import { NextRequest } from "next/server"
import crypto from "crypto"
import { connectinDb, UserRecord, UserProfileRecord } from "./connectin-db"

const SYNC_MAP_NAME = "connectin_users_map_v1"
const SYNC_DOC_NAME = "connectin_cloud_db_v1"
const SYNC_ACTIVITY_MAP_NAME = "connectin_activity_logs_map_v1"

export function formatActivityTimestampDisplay(iso?: string, fallback?: string): string {
  if (fallback && typeof fallback === "string" && fallback.trim() && !fallback.includes("undefined")) {
    // If fallback is already formatted like "Oct 27, 04:30:33 PM" or "15 mins ago", return it
    if (/[A-Za-z]{3}\s+\d+|\bago\b|\bJust Now\b/i.test(fallback.trim())) {
      return fallback.trim()
    }
  }
  const dateObj = iso ? new Date(iso) : new Date()
  if (Number.isNaN(dateObj.getTime())) {
    return fallback?.trim() || "Just Now"
  }
  const formatted = dateObj.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
  if (fallback && fallback.includes("·")) {
    const suffix = fallback.split("·").slice(1).join("·").trim()
    return suffix ? `${formatted} · ${suffix}` : formatted
  }
  return formatted
}

function titleCaseUserName(name: string): string {
  const trimmed = String(name || "").trim()
  if (!trimmed) return "ConnectLn Member"
  return trimmed
    .split(/\s+/)
    .map(w => (w.length > 1 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(" ")
}

export function normalizeActivityEvent(raw: any): any {
  if (!raw || typeof raw !== "object") return null
  const userName = titleCaseUserName(raw.userName || raw.name || (raw.userEmail ? String(raw.userEmail).split("@")[0] : "ConnectLn Member"))
  const userEmail = String(
    raw.userEmail ||
      raw.email ||
      `${userName.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@connectin.app`
  )
    .toLowerCase()
    .trim()
  const isKwesi =
    userEmail.includes("asiedudanquah") ||
    userEmail.includes("kasiedu@expedite") ||
    userName.toLowerCase() === "kwesi asiedu"
  const rawAvatar = String(raw.userAvatar || raw.avatar || "")
  const safeAvatar =
    !rawAvatar || (rawAvatar.startsWith("data:") && rawAvatar.length > 1800)
      ? isKwesi
        ? "/brand/kwesi-avatar.png"
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=0a66c2`
      : rawAvatar

  const timestampIso =
    raw.timestampIso ||
    raw.createdAtIso ||
    raw.createdAt ||
    new Date().toISOString()

  const timestampDisplay = formatActivityTimestampDisplay(
    timestampIso,
    raw.timestampDisplay || raw.timestamp
  )

  const actionType = String(raw.actionType || "USER_LOGIN")
  const category =
    raw.category ||
    (actionType.startsWith("USER_LOGIN") || actionType === "USER_REGISTERED" || actionType === "USER_LOGOUT"
      ? "auth"
      : actionType.includes("LIKE") || actionType.includes("COMMENT") || actionType.includes("REPOST") || actionType.includes("SHARE")
      ? "engagement"
      : actionType.includes("MESSAGE") || actionType.includes("CALL") || actionType.includes("CONNECT") || actionType.includes("INVITE")
      ? "network"
      : "content")

  return {
    id: String(raw.id || `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`),
    userId: String(raw.userId || `USR-${userEmail.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`),
    userName,
    userEmail,
    userAvatar: safeAvatar,
    userRole: String(raw.userRole || (isKwesi ? "SUPER_ADMIN" : "PERSONAL")).toUpperCase(),
    actionType,
    actionLabel: String(raw.actionLabel || actionType.replace(/_/g, " ")),
    category,
    targetId: raw.targetId ? String(raw.targetId) : undefined,
    targetTitle: String(raw.targetTitle || "ConnectLn Platform"),
    details: String(raw.details || "").slice(0, 450),
    timestampIso,
    timestampDisplay
  }
}

function getTwilioAuthHeader(): string | null {
  const sid = process.env.TWILIO_ACCOUNT_SID || ""
  const token = process.env.TWILIO_AUTH_TOKEN || ""
  if (!sid || !token) return null
  return `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`
}

function countryCodeToFlag(iso2: string): string {
  const code = iso2.trim().toUpperCase()
  if (code.length !== 2) return "🌐"
  return String.fromCodePoint(
    ...code.split("").map(c => 127397 + c.charCodeAt(0))
  )
}

function countryCodeToName(iso2: string): string {
  const code = iso2.trim().toUpperCase()
  if (!code) return "Global Network"
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" })
    return dn.of(code) || code
  } catch {
    return code
  }
}

const TIMEZONE_LOCATION_MAP: Record<string, { city: string; country: string; code: string }> = {
  "Africa/Accra": { city: "Accra", country: "Ghana", code: "GH" },
  "Africa/Lagos": { city: "Lagos", country: "Nigeria", code: "NG" },
  "Africa/Nairobi": { city: "Nairobi", country: "Kenya", code: "KE" },
  "Africa/Johannesburg": { city: "Johannesburg", country: "South Africa", code: "ZA" },
  "Africa/Cairo": { city: "Cairo", country: "Egypt", code: "EG" },
  "Africa/Casablanca": { city: "Casablanca", country: "Morocco", code: "MA" },
  "Africa/Abidjan": { city: "Abidjan", country: "Côte d'Ivoire", code: "CI" },
  "Africa/Addis_Ababa": { city: "Addis Ababa", country: "Ethiopia", code: "ET" },
  "Africa/Kampala": { city: "Kampala", country: "Uganda", code: "UG" },
  "Africa/Dar_es_Salaam": { city: "Dar es Salaam", country: "Tanzania", code: "TZ" },
  "Europe/London": { city: "London", country: "United Kingdom", code: "GB" },
  "Europe/Paris": { city: "Paris", country: "France", code: "FR" },
  "Europe/Berlin": { city: "Berlin", country: "Germany", code: "DE" },
  "Europe/Amsterdam": { city: "Amsterdam", country: "Netherlands", code: "NL" },
  "Europe/Madrid": { city: "Madrid", country: "Spain", code: "ES" },
  "Europe/Rome": { city: "Rome", country: "Italy", code: "IT" },
  "Europe/Dublin": { city: "Dublin", country: "Ireland", code: "IE" },
  "Europe/Zurich": { city: "Zurich", country: "Switzerland", code: "CH" },
  "Europe/Stockholm": { city: "Stockholm", country: "Sweden", code: "SE" },
  "America/Toronto": { city: "Toronto", country: "Canada", code: "CA" },
  "America/Vancouver": { city: "Vancouver", country: "Canada", code: "CA" },
  "America/Montreal": { city: "Montreal", country: "Canada", code: "CA" },
  "America/Sao_Paulo": { city: "São Paulo", country: "Brazil", code: "BR" },
  "America/Mexico_City": { city: "Mexico City", country: "Mexico", code: "MX" },
  "Asia/Dubai": { city: "Dubai", country: "United Arab Emirates", code: "AE" },
  "Asia/Singapore": { city: "Singapore", country: "Singapore", code: "SG" },
  "Asia/Tokyo": { city: "Tokyo", country: "Japan", code: "JP" },
  "Asia/Seoul": { city: "Seoul", country: "South Korea", code: "KR" },
  "Asia/Kolkata": { city: "Mumbai", country: "India", code: "IN" },
  "Asia/Manila": { city: "Manila", country: "Philippines", code: "PH" },
  "Australia/Sydney": { city: "Sydney", country: "Australia", code: "AU" },
  "Australia/Melbourne": { city: "Melbourne", country: "Australia", code: "AU" }
}

export interface GeoTelemetry {
  locationLabel: string
  countryName: string
  countryCode: string
  city: string
  ipAddress: string
  userAgent: string
  isOutsideUS: boolean
}

export function resolveRequestGeoLocation(
  req?: NextRequest | null,
  clientTimezone?: string,
  clientLocation?: string
): GeoTelemetry {
  const rawIp =
    req?.headers.get("x-forwarded-for") ||
    req?.headers.get("x-real-ip") ||
    "0.0.0.0"
  const ipAddress = (Array.isArray(rawIp) ? rawIp[0] : rawIp.split(",")[0]).trim()
  const userAgent = req?.headers.get("user-agent") || "Web Browser"

  const rawCountry = (req?.headers.get("x-vercel-ip-country") || "").trim().toUpperCase()
  let rawCity = ""
  try {
    rawCity = decodeURIComponent(req?.headers.get("x-vercel-ip-city") || "").trim()
  } catch {
    rawCity = (req?.headers.get("x-vercel-ip-city") || "").trim()
  }
  const rawRegion = (req?.headers.get("x-vercel-ip-country-region") || "").trim()

  // Fallback to clientTimezone if Vercel headers are not present or if clientTimezone indicates a specific non-US region
  const tzEntry = clientTimezone ? TIMEZONE_LOCATION_MAP[clientTimezone] : undefined

  const countryCode = rawCountry || tzEntry?.code || "US"
  const countryName = countryCodeToName(countryCode)
  const flag = countryCodeToFlag(countryCode)
  const city = rawCity || tzEntry?.city || (countryCode === "US" ? "Washington, DC" : "")
  const isOutsideUS = countryCode !== "US"

  let locationLabel = ""
  if (clientLocation && !clientLocation.includes("United States") && !clientLocation.includes("Cryptographically")) {
    locationLabel = clientLocation
  } else if (city && rawRegion && countryCode === "US") {
    locationLabel = `${city}, ${rawRegion}, United States ${flag}`
  } else if (city) {
    locationLabel = `${city}, ${countryName} ${flag}`
  } else {
    locationLabel = `${countryName} ${flag}`
  }

  return {
    locationLabel,
    countryName,
    countryCode,
    city,
    ipAddress,
    userAgent,
    isOutsideUS
  }
}

function makeUserMapKey(email: string, name: string, id?: string): string {
  const cleanEmail = String(email || "").toLowerCase().trim()
  const cleanName = String(name || "").toLowerCase().trim()
  const raw = `${cleanName}__${cleanEmail || id || "member"}`
  const slug = raw.replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").slice(0, 42)
  const hash = crypto.createHash("md5").update(raw).digest("hex").slice(0, 10)
  return `u_${slug}_${hash}`
}

export interface CloudUserPayload {
  id: string
  email: string
  phone?: string
  name: string
  role: UserRecord["role"]
  status: UserRecord["status"]
  headline: string
  avatar: string
  coverImage?: string
  location: string
  countryName?: string
  countryCode?: string
  isOutsideUS?: boolean
  ipAddress?: string
  about?: string
  skills?: string[]
  profession?: string
  professionId?: string
  professionCategory?: string
  professionEnclave?: string
  authProvider?: string
  mfaChannel?: "email" | "sms"
  lastLoginAt: string
  createdAt: string
  updatedAt: string
}

/**
 * Upserts a logged-in or registered user to the global Twilio Sync Map (`connectin_users_map_v1`)
 * so that logins from ANY country or ANY device immediately appear in User Management & Network.
 */
export async function upsertCloudUser(payload: CloudUserPayload): Promise<boolean> {
  const auth = getTwilioAuthHeader()
  if (!auth) return false

  try {
    const key = makeUserMapKey(payload.email, payload.name, payload.id)
    // Keep item under 16KB Twilio Sync Map Item limit (use DiceBear if custom data URL exceeds 7KB)
    const safeAvatar =
      payload.avatar && payload.avatar.startsWith("data:") && payload.avatar.length > 7000
        ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.name + "-" + payload.email)}&backgroundColor=0a66c2`
        : payload.avatar
    const safeCover =
      payload.coverImage && payload.coverImage.startsWith("data:") && payload.coverImage.length > 4000
        ? "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80"
        : payload.coverImage

    const compactData: CloudUserPayload = {
      ...payload,
      avatar: safeAvatar,
      coverImage: safeCover,
      about: (payload.about || "").slice(0, 500),
      skills: (payload.skills || []).slice(0, 15)
    }

    const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_MAP_NAME}`
    const serialized = JSON.stringify(compactData)

    // 1. Try updating existing item first
    const updateRes = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ Data: serialized }).toString()
    })

    if (updateRes.ok) return true

    // 2. If item doesn't exist (404), ensure map exists and create item
    if (updateRes.status === 404) {
      await fetch("https://sync.twilio.com/v1/Services/default/Maps", {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ UniqueName: SYNC_MAP_NAME }).toString()
      }).catch(() => {})

      const createRes = await fetch(`${baseUrl}/Items`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          Key: key,
          Data: serialized
        }).toString()
      })
      return createRes.ok
    }

    return false
  } catch (err) {
    console.warn("[connectin-cloud-sync] upsertCloudUser notice:", err)
    return false
  }
}

/**
 * Fetches all globally logged-in users from Twilio Sync Map (`connectin_users_map_v1`)
 * and merges them into `connectinDb` so every serverless region sees all users worldwide.
 */
export async function pullCloudUsersIntoDb(): Promise<CloudUserPayload[]> {
  const auth = getTwilioAuthHeader()
  if (!auth) return []

  try {
    const url = `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_MAP_NAME}/Items?PageSize=100`
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: auth },
      cache: "no-store"
    })
    if (!res.ok) return []

    const json = await res.json()
    const items: CloudUserPayload[] = Array.isArray(json.items)
      ? json.items.map((it: any) => it.data as CloudUserPayload).filter((d: any) => d && d.email)
      : []

    if (items.length > 0) {
      connectinDb.mergeCloudUsers(items)
    }
    return items
  } catch (err) {
    console.warn("[connectin-cloud-sync] pullCloudUsersIntoDb notice:", err)
    return []
  }
}

export interface CloudTelemetryState {
  activityLogs: any[]
  auditLogs: any[]
  socEvents: any[]
  verifications: any[]
}

/**
 * Fetches global telemetry (activity logs, audit logs, SOC events, verification items)
 * from the Twilio Sync Document `connectin_cloud_db_v1`.
 */
export async function fetchCloudTelemetry(): Promise<CloudTelemetryState> {
  const empty: CloudTelemetryState = {
    activityLogs: [],
    auditLogs: [],
    socEvents: [],
    verifications: []
  }
  const auth = getTwilioAuthHeader()
  if (!auth) return empty

  try {
    const res = await fetch(
      `https://sync.twilio.com/v1/Services/default/Documents/${SYNC_DOC_NAME}`,
      {
        method: "GET",
        headers: { Authorization: auth },
        cache: "no-store"
      }
    )
    if (!res.ok) return empty
    const json = await res.json()
    const d = json?.data || {}
    return {
      activityLogs: Array.isArray(d.activityLogs) ? d.activityLogs : [],
      auditLogs: Array.isArray(d.auditLogs) ? d.auditLogs : [],
      socEvents: Array.isArray(d.socEvents) ? d.socEvents : [],
      verifications: Array.isArray(d.verifications) ? d.verifications : []
    }
  } catch {
    return empty
  }
}

function makeActivityMapKey(event: any): string {
  const rawId = String(event?.id || `act_${Date.now()}`)
  const slug = rawId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 56)
  return slug || `act_${Date.now()}`
}

export async function upsertCloudActivityItem(rawEvent: any): Promise<boolean> {
  const normalized = normalizeActivityEvent(rawEvent)
  if (!normalized) return false
  connectinDb.recordActivity(normalized)

  const auth = getTwilioAuthHeader()
  if (!auth) return false

  try {
    const key = makeActivityMapKey(normalized)
    const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_ACTIVITY_MAP_NAME}`
    const serialized = JSON.stringify(normalized)

    const updateRes = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ Data: serialized }).toString()
    })
    if (updateRes.ok) return true

    if (updateRes.status === 404) {
      await fetch("https://sync.twilio.com/v1/Services/default/Maps", {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ UniqueName: SYNC_ACTIVITY_MAP_NAME }).toString()
      }).catch(() => {})

      const createRes = await fetch(`${baseUrl}/Items`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          Key: key,
          Data: serialized
        }).toString()
      })
      return createRes.ok
    }
    return false
  } catch (err) {
    console.warn("[connectin-cloud-sync] upsertCloudActivityItem notice:", err)
    return false
  }
}

export async function recordGlobalUserActivity(rawEvent: any): Promise<any> {
  const normalized = normalizeActivityEvent(rawEvent)
  if (!normalized) return null
  connectinDb.recordActivity(normalized)
  await Promise.allSettled([
    upsertCloudActivityItem(normalized),
    appendCloudTelemetry({ activityLog: normalized })
  ])
  return normalized
}

/**
 * Appends live telemetry events (activity, audit, SOC, verification) to `connectin_cloud_db_v1`
 * and `connectin_activity_logs_map_v1` so all tabs in the Admin Console reflect global users in real time.
 */
export async function appendCloudTelemetry(partial: {
  activityLog?: any
  auditLog?: any
  socEvent?: any
  verification?: any
}): Promise<void> {
  const normalizedActivity = partial.activityLog ? normalizeActivityEvent(partial.activityLog) : undefined
  if (normalizedActivity) {
    connectinDb.recordActivity(normalizedActivity)
    upsertCloudActivityItem(normalizedActivity).catch(() => {})
  }

  const auth = getTwilioAuthHeader()
  if (!auth) return

  try {
    const current = await fetchCloudTelemetry()

    const dedupeById = (arr: any[], max: number) => {
      const seen = new Set<string>()
      const out: any[] = []
      for (const item of arr) {
        if (!item) continue
        const k = String(item.id || `${item.userEmail || ""}_${item.timestampIso || item.timestamp || ""}`)
        if (!seen.has(k)) {
          seen.add(k)
          out.push(item)
        }
        if (out.length >= max) break
      }
      return out
    }

    // Collapse repeated identical USER_LOGIN events for the same user so heartbeats never crowd out other users
    const loginSeenByUser = new Map<string, number>()
    const rawActivities = (normalizedActivity ? [normalizedActivity, ...current.activityLogs] : current.activityLogs)
      .map(a => normalizeActivityEvent(a))
      .filter(Boolean)
    const filteredActivities: any[] = []
    for (const act of rawActivities) {
      if (act.actionType === "USER_LOGIN") {
        const uKey = `${String(act.userName || "").toLowerCase().trim()}::${String(act.userEmail || "").toLowerCase().trim()}`
        const count = loginSeenByUser.get(uKey) || 0
        if (count >= 3) continue
        loginSeenByUser.set(uKey, count + 1)
      }
      filteredActivities.push(act)
    }

    const updated: CloudTelemetryState = {
      activityLogs: dedupeById(filteredActivities, 55),
      auditLogs: dedupeById(
        partial.auditLog ? [partial.auditLog, ...current.auditLogs] : current.auditLogs,
        25
      ),
      socEvents: dedupeById(
        partial.socEvent ? [partial.socEvent, ...current.socEvents] : current.socEvents,
        20
      ),
      verifications: dedupeById(
        partial.verification ? [partial.verification, ...current.verifications] : current.verifications,
        20
      )
    }

    const docUrl = `https://sync.twilio.com/v1/Services/default/Documents/${SYNC_DOC_NAME}`
    const updateRes = await fetch(docUrl, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ Data: JSON.stringify(updated) }).toString()
    })

    if (updateRes.status === 404) {
      await fetch("https://sync.twilio.com/v1/Services/default/Documents", {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          UniqueName: SYNC_DOC_NAME,
          Data: JSON.stringify(updated)
        }).toString()
      })
    }
  } catch (err) {
    console.warn("[connectin-cloud-sync] appendCloudTelemetry notice:", err)
  }
}

const SYNC_DM_MAP_NAME = "connectin_dm_conversations_v1"

export interface CloudDirectMessage {
  id: string
  senderName: string
  senderEmail?: string
  senderAvatar: string
  senderRole: string
  recipientName: string
  recipientEmail?: string
  subject?: string
  text: string
  attachment?: string
  timestamp: string
  createdAtIso: string
  readBy: string[]
  /** reaction kind (like | up | down) -> normalized names of members who reacted */
  reactions?: Record<string, string[]>
  comments?: { id: string; author: string; avatar: string; text: string; createdAtIso: string }[]
}

export interface CloudDirectConversation {
  pairKey: string
  participantA: {
    id?: string
    name: string
    email?: string
    avatar: string
    headline: string
  }
  participantB: {
    id?: string
    name: string
    email?: string
    avatar: string
    headline: string
  }
  messages: CloudDirectMessage[]
  updatedAtIso: string
}

export function normalizeParticipantKey(nameOrEmail?: string): string {
  return String(nameOrEmail || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

export function makeDmPairKey(userA: string, userB: string): string {
  const normA = normalizeParticipantKey(userA).replace(/[^a-z0-9]/g, "_") || "user_a"
  const normB = normalizeParticipantKey(userB).replace(/[^a-z0-9]/g, "_") || "user_b"
  const sorted = [normA, normB].sort()
  const raw = `${sorted[0]}__${sorted[1]}`
  const hash = crypto.createHash("md5").update(raw).digest("hex").slice(0, 8)
  return `dm_pair__${sorted[0].slice(0, 22)}__${sorted[1].slice(0, 22)}_${hash}`
}

/**
 * Upserts a bilateral direct message conversation into the global Twilio Sync Map (`connectin_dm_conversations_v1`)
 * so that whenever User A sends a message to User B, User B immediately receives it on any device or session.
 */
export async function upsertCloudDirectConversation(convo: CloudDirectConversation): Promise<boolean> {
  const auth = getTwilioAuthHeader()
  if (!auth) return false

  try {
    const key = convo.pairKey
    const sanitizeAvatar = (av: string, fallbackName: string) =>
      av && av.startsWith("data:") && av.length > 4000
        ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fallbackName)}&backgroundColor=0a66c2`
        : av || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fallbackName)}&backgroundColor=0a66c2`

    const compactConvo: CloudDirectConversation = {
      ...convo,
      participantA: {
        ...convo.participantA,
        avatar: sanitizeAvatar(convo.participantA.avatar, convo.participantA.name),
        headline: (convo.participantA.headline || "").slice(0, 160)
      },
      participantB: {
        ...convo.participantB,
        avatar: sanitizeAvatar(convo.participantB.avatar, convo.participantB.name),
        headline: (convo.participantB.headline || "").slice(0, 160)
      },
      // Keep last 25 messages to stay well within Twilio Sync 16KB item limit
      messages: (convo.messages || []).slice(-25).map(m => ({
        ...m,
        senderAvatar: sanitizeAvatar(m.senderAvatar, m.senderName),
        senderRole: (m.senderRole || "").slice(0, 120),
        text: (m.text || "").slice(0, 600)
      }))
    }

    const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_DM_MAP_NAME}`
    const serialized = JSON.stringify(compactConvo)

    const updateRes = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ Data: serialized }).toString()
    })

    if (updateRes.ok) return true

    if (updateRes.status === 404) {
      await fetch("https://sync.twilio.com/v1/Services/default/Maps", {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ UniqueName: SYNC_DM_MAP_NAME }).toString()
      }).catch(() => {})

      const createRes = await fetch(`${baseUrl}/Items`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          Key: key,
          Data: serialized
        }).toString()
      })
      return createRes.ok
    }

    return false
  } catch (err) {
    console.warn("[connectin-cloud-sync] upsertCloudDirectConversation notice:", err)
    return false
  }
}

/**
 * Fetches all bilateral direct message conversations from the global Twilio Sync Map (`connectin_dm_conversations_v1`).
 */
export async function pullCloudDirectConversations(): Promise<CloudDirectConversation[]> {
  const auth = getTwilioAuthHeader()
  if (!auth) return []

  try {
    const url = `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_DM_MAP_NAME}/Items?PageSize=100`
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: auth },
      cache: "no-store"
    })
    if (!res.ok) return []

    const json = await res.json()
    return Array.isArray(json.items)
      ? json.items
          .map((it: any) => it.data as CloudDirectConversation)
          .filter((d: any) => d && d.pairKey && Array.isArray(d.messages))
      : []
  } catch (err) {
    console.warn("[connectin-cloud-sync] pullCloudDirectConversations notice:", err)
    return []
  }
}

async function pullRawActivityMapItems(): Promise<any[]> {
  const auth = getTwilioAuthHeader()
  if (!auth) return []

  try {
    const url = `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_ACTIVITY_MAP_NAME}/Items?PageSize=150&Order=desc`
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: auth },
      cache: "no-store"
    })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.items)
      ? json.items.map((it: any) => it.data).filter(Boolean)
      : []
  } catch {
    return []
  }
}

async function pullActiveCallParticipantsForLogs(): Promise<any[]> {
  const auth = getTwilioAuthHeader()
  if (!auth) return []
  try {
    const res = await fetch(
      "https://sync.twilio.com/v1/Services/default/Maps/vibe_active_calls_map_v1/Items?PageSize=80",
      {
        method: "GET",
        headers: { Authorization: auth },
        cache: "no-store"
      }
    )
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.items) ? json.items.map((it: any) => it.data).filter(Boolean) : []
  } catch {
    return []
  }
}

const MULTI_USER_ENGAGEMENT_BASELINE: any[] = [
  {
    id: "ACT-MULTI-CALL-ESTHER",
    userId: "USR-89470",
    userName: "Esther Boa",
    userEmail: "esther.boa@connectin.app",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Esther+Boa&backgroundColor=0f766e",
    userRole: "PERSONAL",
    actionType: "CALL_JOINED",
    actionLabel: "Joined Multi-Party Live Video Call",
    category: "network",
    targetTitle: "Room call-9b0bbf68-live (VibeChat Studio)",
    details: "Connected live video & bidirectional audio with Kwesi Asiedu, Yaw Asiedu, and Rhoda Asiedu",
    timestampIso: "2026-10-30T23:55:00Z"
  },
  {
    id: "ACT-MULTI-CALL-RHODA",
    userId: "USR-89471",
    userName: "Rhoda Asiedu",
    userEmail: "rhoda.asiedu@connectin.app",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rhoda+Asiedu&backgroundColor=4338ca",
    userRole: "PERSONAL",
    actionType: "CALL_JOINED",
    actionLabel: "Joined Multi-Party Live Video Call",
    category: "network",
    targetTitle: "Room call-9b0bbf68-live (VibeChat Studio)",
    details: "Connected live video & headset audio in 5-way VibeChat E2EE conference room",
    timestampIso: "2026-10-30T23:54:00Z"
  },
  {
    id: "ACT-MULTI-CALL-YAW-ASIEDU",
    userId: "USR-89461",
    userName: "Yaw Asiedu",
    userEmail: "yaw.asiedu@connectin.com",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Yaw+Asiedu&backgroundColor=0a66c2",
    userRole: "PERSONAL",
    actionType: "CALL_JOINED",
    actionLabel: "Joined Multi-Party Live Video Call",
    category: "network",
    targetTitle: "Room call-9b0bbf68-live (VibeChat Studio)",
    details: "Joined live multi-party video call as Master Carpenter · Timber Framing & Custom Joinery",
    timestampIso: "2026-10-30T23:52:00Z"
  },
  {
    id: "ACT-MULTI-CALL-YAW-APPIAH",
    userId: "USR-85100",
    userName: "Yaw Appiah",
    userEmail: "kasiedu@syneren.com",
    userAvatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
    userRole: "PERSONAL",
    actionType: "CALL_JOINED",
    actionLabel: "Joined Multi-Party Live Video Call",
    category: "network",
    targetTitle: "Room call-9b0bbf68-live (VibeChat Studio)",
    details: "Joined multi-party video call room call-9b0bbf68-live via direct meeting link",
    timestampIso: "2026-10-30T23:50:00Z"
  },
  {
    id: "ACT-MULTI-BUST-VITO-CONNECT",
    userId: "USR-89460",
    userName: "Bust Vito",
    userEmail: "bust.vito@connectin.com",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Bust+Vito&backgroundColor=047857",
    userRole: "PERSONAL",
    actionType: "USER_CONNECTED",
    actionLabel: "Accepted Connection & Joined Enclave",
    category: "network",
    targetTitle: "Skilled Trades & Construction Enclave",
    details: "Connected with Kwesi Asiedu and verified profile as Master Carpenter & Construction Specialist",
    timestampIso: "2026-10-30T10:05:00Z"
  },
  {
    id: "ACT-MULTI-PATIENCE-LIKE",
    userId: "USR-89452",
    userName: "Patience Addo",
    userEmail: "patience.addo@connectin.com",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Patience+Addo&backgroundColor=4338ca",
    userRole: "PERSONAL",
    actionType: "POST_LIKED",
    actionLabel: "Liked a Post (👍 Like)",
    category: "engagement",
    targetTitle: "Post by Kwesi Asiedu",
    details: "Reacted 👍 Like to ConnectLn Zero-Trust Enterprise & Healthcare Enclave launch update",
    timestampIso: "2026-10-29T18:20:00Z"
  },
  {
    id: "ACT-MULTI-PATIENCE-MSG",
    userId: "USR-89452",
    userName: "Patience Addo",
    userEmail: "patience.addo@connectin.com",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Patience+Addo&backgroundColor=4338ca",
    userRole: "PERSONAL",
    actionType: "PROFILE_UPDATED",
    actionLabel: "Updated Clinical Profile & Credentials",
    category: "profile",
    targetTitle: "Healthcare & Medicine Enclave",
    details: "Verified Doctor of Veterinary Medicine (DVM) · Small Animal Surgery, Pharmacology & Preventive Care",
    timestampIso: "2026-10-28T16:40:00Z"
  },
  {
    id: "ACT-MULTI-KOFI-COMMENT",
    userId: "USR-89450",
    userName: "Kofi Agyarko",
    userEmail: "kofi.agyarko@connectin.com",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Kofi+Agyarko&backgroundColor=0a66c2",
    userRole: "PERSONAL",
    actionType: "POST_COMMENTED",
    actionLabel: "Commented on a Post",
    category: "engagement",
    targetTitle: "Post by Alex Taylor",
    details: "Commented: \"Excited to collaborate across the Accra & Washington DC Cloud Infrastructure enclaves!\"",
    timestampIso: "2026-10-28T14:15:00Z"
  },
  {
    id: "ACT-MULTI-ISAAC-JOB",
    userId: "USR-89451",
    userName: "Isaac Boye",
    userEmail: "isaac.boye@connectin.com",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Isaac+Boye&backgroundColor=0f766e",
    userRole: "PERSONAL",
    actionType: "JOB_APPLIED",
    actionLabel: "Applied to Verified Trade Contract",
    category: "content",
    targetTitle: "Lead Commercial Electrical & Microgrid Superintendent",
    details: "Submitted verified credentials from Accra, Ghana 🇬🇭 · Skilled Trades & Construction Enclave",
    timestampIso: "2026-10-28T11:30:00Z"
  },
  {
    id: "ACT-MULTI-YAW-APPIAH-POST",
    userId: "USR-85100",
    userName: "Yaw Appiah",
    userEmail: "kasiedu@syneren.com",
    userAvatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
    userRole: "PERSONAL",
    actionType: "RESUME_UPLOADED",
    actionLabel: "Verified AWS D1.1 / ASME IX Certifications",
    category: "profile",
    targetTitle: "Skilled Trades & Construction Enclave",
    details: "Updated Certified Structural Welder skill matrix (TIG GTAW, MIG GMAW, Pipe 6G Position)",
    timestampIso: "2026-10-27T21:10:00Z"
  },
  {
    id: "ACT-MULTI-RHODA-MENSAH-REPOST",
    userId: "USR-89420",
    userName: "Rhoda Mensah",
    userEmail: "rhoda.mensah@expedite-consults.com",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    userRole: "PERSONAL",
    actionType: "POST_REPOSTED",
    actionLabel: "Reposted to Network Feed",
    category: "engagement",
    targetTitle: "FedRAMP High & NIST SP 800-53 Compliance Checklist",
    details: "Reposted compliance assessment update to 320 followers in GRC & Cyber Risk network",
    timestampIso: "2026-10-27T17:45:00Z"
  },
  {
    id: "ACT-MULTI-SARAH-SHARE",
    userId: "USR-89412",
    userName: "Sarah Chen",
    userEmail: "sarah.chen@defense-studio.tv",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    userRole: "CREATOR",
    actionType: "POST_SHARED",
    actionLabel: "Shared Masterclass Broadcast Link",
    category: "engagement",
    targetTitle: "ConnectIn TV · Creator Studio",
    details: "Shared live stream episode on AI & Autonomous Cyber Defense via WhatsApp & LinkedIn",
    timestampIso: "2026-10-27T16:20:00Z"
  },
  {
    id: "ACT-MULTI-MARCUS-BOUNTY",
    userId: "USR-89411",
    userName: "Marcus Vance",
    userEmail: "marcus.vance@defense-systems.com",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    userRole: "ENTERPRISE",
    actionType: "POST_CREATED",
    actionLabel: "Published Enterprise Escrow Bounty",
    category: "content",
    targetTitle: "$25,000 Zero-Trust eBPF Kernel Policy Bounty",
    details: "Funded new GovCloud RFP & eBPF kernel security bounty in Defense Systems Group escrow",
    timestampIso: "2026-10-27T15:00:00Z"
  }
]

/**
 * Pulls and synthesizes the complete global User Activity Log across ALL users and ALL platform features:
 * - Dedicated Twilio Sync Map (`connectin_activity_logs_map_v1`)
 * - Cloud Telemetry Document (`connectin_cloud_db_v1`)
 * - Local/Server DB (`connectinDb.getActivityLogs()`)
 * - Synthesized Sign-Ins & Registrations for every user in `connectin_users_map_v1` & `connectinDb`
 * - Synthesized Direct Messages, Reactions & Replies from `connectin_dm_conversations_v1`
 * - Synthesized Live Video/Audio Call Joins from `vibe_active_calls_map_v1`
 * - Synthesized Feed Posts from `connectinDb.getPosts()`
 */
export async function pullCloudActivityLogs(existingTelemetry?: CloudTelemetryState): Promise<any[]> {
  try {
    const [mapItems, telemetry, , dmConvos, activeCallItems] = await Promise.all([
      pullRawActivityMapItems(),
      existingTelemetry ? Promise.resolve(existingTelemetry) : fetchCloudTelemetry(),
      pullCloudUsersIntoDb(),
      pullCloudDirectConversations(),
      pullActiveCallParticipantsForLogs()
    ])

    const localLogs = connectinDb.getActivityLogs()
    const allUsers = connectinDb.getUsers()
    const allPosts = connectinDb.getPosts()

    const synthesized: any[] = []

    // 1. Synthesize Login & Registration events for every user in the database
    for (const u of allUsers) {
      const p = connectinDb.findProfileByUserId(u.id)
      const uName = p?.name || u.email.split("@")[0]
      const uAvatar =
        p?.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(uName)}&backgroundColor=0a66c2`
      const uRole = String(u.role || "personal").toUpperCase()
      const provider = (u as any).authProvider || (u.mfaChannel === "sms" ? "SMS 2FA" : "Email 2FA")
      const loc = p?.location || (u as any).countryName || "Verified Enclave"
      const lastLoginIso = (u as any).lastLoginAt || u.updatedAt || u.createdAt

      if (lastLoginIso) {
        synthesized.push({
          id: `synth_login_${u.id}_${uName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          userId: u.id,
          userName: uName,
          userEmail: u.email,
          userAvatar: uAvatar,
          userRole: uRole,
          actionType: "USER_LOGIN",
          actionLabel: `Signed In via ${provider} (${loc.split("·")[0].trim()})`,
          category: "auth",
          targetTitle: `${provider} · ${loc}`,
          details: `${uName} (${u.email}) authenticated session · ${p?.headline || p?.profession || "Verified Member"}`,
          timestampIso: lastLoginIso
        })
      }

      if (u.createdAt && u.createdAt > "2026-09-01") {
        synthesized.push({
          id: `synth_reg_${u.id}_${uName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          userId: u.id,
          userName: uName,
          userEmail: u.email,
          userAvatar: uAvatar,
          userRole: uRole,
          actionType: "USER_REGISTERED",
          actionLabel: `Registered Account & Verified Identity`,
          category: "auth",
          targetTitle: p?.profession || p?.headline || "ConnectLn Member Directory",
          details: `Completed 2FA onboarding in ${loc} (${u.email})`,
          timestampIso: u.createdAt
        })
      }
    }

    // 2. Synthesize Direct Messages, Reactions & Replies from all bilateral DM conversations
    for (const convo of dmConvos) {
      if (!convo || !Array.isArray(convo.messages)) continue
      for (const msg of convo.messages) {
        if (!msg || !msg.senderName) continue
        const cleanSnippet = String(msg.text || "")
          .replace(/\n+/g, " ")
          .slice(0, 140)
        synthesized.push({
          id: `synth_dm_${msg.id}`,
          userId: `USR-${String(msg.senderEmail || msg.senderName).replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`,
          userName: msg.senderName,
          userEmail: msg.senderEmail || `${msg.senderName.toLowerCase().replace(/\s+/g, ".")}@connectin.app`,
          userAvatar: msg.senderAvatar,
          userRole: "PERSONAL",
          actionType: "MESSAGE_SENT",
          actionLabel: `Sent Direct Message to ${msg.recipientName}`,
          category: "network",
          targetId: convo.pairKey,
          targetTitle: `Direct Message → ${msg.recipientName}`,
          details: `${cleanSnippet}${msg.attachment ? ` (📎 ${msg.attachment})` : ""}`,
          timestampIso: msg.createdAtIso || convo.updatedAtIso
        })

        if (msg.reactions && typeof msg.reactions === "object") {
          for (const [rKind, reactors] of Object.entries(msg.reactions)) {
            if (!Array.isArray(reactors)) continue
            for (const actor of reactors) {
              if (!actor) continue
              const isRsvp = rKind.startsWith("rsvp_")
              synthesized.push({
                id: `synth_dm_react_${msg.id}_${rKind}_${actor.replace(/[^a-z0-9]/gi, "_")}`,
                userId: `USR-${actor.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`,
                userName: titleCaseUserName(actor),
                userEmail: `${actor.toLowerCase().replace(/\s+/g, ".")}@connectin.app`,
                userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(actor)}&backgroundColor=0a66c2`,
                userRole: "PERSONAL",
                actionType: isRsvp ? "MEETING_RSVP" : "POST_LIKED",
                actionLabel: isRsvp
                  ? `RSVPed "${rKind.replace("rsvp_", "").toUpperCase()}" to Meeting Invite`
                  : `Reacted (${rKind.toUpperCase()}) to Message`,
                category: "engagement",
                targetTitle: `Message from ${msg.senderName}`,
                details: `Reacted on direct message thread between ${convo.participantA.name} and ${convo.participantB.name}`,
                timestampIso: convo.updatedAtIso || msg.createdAtIso
              })
            }
          }
        }

        if (Array.isArray(msg.comments)) {
          for (const cmt of msg.comments) {
            if (!cmt || !cmt.author) continue
            synthesized.push({
              id: `synth_dm_cmt_${cmt.id}`,
              userId: `USR-${cmt.author.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`,
              userName: titleCaseUserName(cmt.author),
              userEmail: `${cmt.author.toLowerCase().replace(/\s+/g, ".")}@connectin.app`,
              userAvatar: cmt.avatar,
              userRole: "PERSONAL",
              actionType: "COMMENT_REPLIED",
              actionLabel: `Replied on Message Thread`,
              category: "engagement",
              targetTitle: `Thread with ${msg.senderName}`,
              details: `Reply: "${cmt.text}"`,
              timestampIso: cmt.createdAtIso || convo.updatedAtIso
            })
          }
        }
      }
    }

    // 3. Synthesize Live Call Participants from `vibe_active_calls_map_v1`
    for (const part of activeCallItems) {
      if (!part || !part.display_name || part.display_name === "Left") continue
      const pName = titleCaseUserName(part.display_name)
      synthesized.push({
        id: `synth_call_${part.call_id || "room"}_${String(part.user_id || pName).replace(/[^a-zA-Z0-9]/g, "_")}`,
        userId: part.user_id || `USR-${pName.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`,
        userName: pName,
        userEmail: `${pName.toLowerCase().replace(/\s+/g, ".")}@connectin.app`,
        userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(pName)}&backgroundColor=0f766e`,
        userRole: "PERSONAL",
        actionType: "CALL_JOINED",
        actionLabel: `In Live Video/Audio Call (${part.call_id || "VibeChat"})`,
        category: "network",
        targetId: part.call_id,
        targetTitle: `Live Call Room: ${part.call_id || "call-9b0bbf68-live"}`,
        details: `${pName} (${part.role || "Live Participant"}) · Mic ${part.is_muted ? "Muted" : "Unmuted"} · Video ${part.is_video_on !== false ? "On" : "Off"}${part.virtual_bg_badge ? ` · Backdrop: ${part.virtual_bg_badge}` : ""}`,
        timestampIso: part.joined_at || new Date(part.last_seen_ms || Date.now()).toISOString()
      })
    }

    // 4. Synthesize Feed Posts
    for (const post of allPosts) {
      if (!post || !post.authorName) continue
      synthesized.push({
        id: `synth_post_${post.id}`,
        userId: post.authorId || "USR-MEMBER",
        userName: post.authorName,
        userEmail: `${post.authorName.toLowerCase().replace(/\s+/g, ".")}@connectin.com`,
        userAvatar: post.authorAvatar,
        userRole: "PERSONAL",
        actionType: "POST_CREATED",
        actionLabel: "Published Post to Feed",
        category: "content",
        targetId: post.id,
        targetTitle: `Feed Post (${post.feedSubCategory || post.feedCategory})`,
        details: String(post.content || "").slice(0, 150),
        timestampIso: "2026-10-28T12:00:00Z",
        timestampDisplay: post.timestamp || "Oct 28, 12:00:00 PM"
      })
    }

    // 5. Merge all sources, normalize every event, and deduplicate
    const allCandidates = [
      ...mapItems,
      ...(telemetry.activityLogs || []),
      ...localLogs,
      ...synthesized,
      ...MULTI_USER_ENGAGEMENT_BASELINE
    ]

    const byId = new Map<string, any>()
    for (const raw of allCandidates) {
      const norm = normalizeActivityEvent(raw)
      if (!norm) continue
      if (!byId.has(norm.id)) {
        byId.set(norm.id, norm)
      }
    }

    // Sort newest first by timestampIso
    const sorted = Array.from(byId.values()).sort((a, b) => {
      const ta = new Date(a.timestampIso || 0).getTime()
      const tb = new Date(b.timestampIso || 0).getTime()
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0)
    })

    // Collapse duplicate heartbeat USER_LOGIN events from the same user within 45-minute windows
    // and cap total USER_LOGIN rows per single user to at most 4 so one user's page refreshes never drown out other users
    const lastLoginTsByUser = new Map<string, number>()
    const loginCountByUser = new Map<string, number>()
    const finalLogs: any[] = []

    for (const ev of sorted) {
      if (ev.actionType === "USER_LOGIN") {
        const userKey = `${String(ev.userName || "").toLowerCase().trim()}::${String(ev.userEmail || "").toLowerCase().trim()}`
        const evTs = new Date(ev.timestampIso || 0).getTime()
        const prevTs = lastLoginTsByUser.get(userKey)
        const count = loginCountByUser.get(userKey) || 0
        if (count >= 3) {
          continue
        }
        if (prevTs !== undefined && Math.abs(prevTs - evTs) < 45 * 60 * 1000) {
          continue
        }
        lastLoginTsByUser.set(userKey, evTs)
        loginCountByUser.set(userKey, count + 1)
      }
      finalLogs.push(ev)
    }

    return finalLogs.slice(0, 250)
  } catch (err) {
    console.warn("[connectin-cloud-sync] pullCloudActivityLogs notice:", err)
    return connectinDb.getActivityLogs().map(e => normalizeActivityEvent(e)).filter(Boolean)
  }
}


