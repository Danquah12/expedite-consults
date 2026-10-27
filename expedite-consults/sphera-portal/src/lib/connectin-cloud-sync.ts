import { NextRequest } from "next/server"
import crypto from "crypto"
import { connectinDb, UserRecord, UserProfileRecord } from "./connectin-db"

const SYNC_MAP_NAME = "connectin_users_map_v1"
const SYNC_DOC_NAME = "connectin_cloud_db_v1"

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

/**
 * Appends live telemetry events (activity, audit, SOC, verification) to `connectin_cloud_db_v1`
 * so all tabs in the Admin Console reflect global users in real time.
 */
export async function appendCloudTelemetry(partial: {
  activityLog?: any
  auditLog?: any
  socEvent?: any
  verification?: any
}): Promise<void> {
  const auth = getTwilioAuthHeader()
  if (!auth) return

  try {
    const current = await fetchCloudTelemetry()

    const dedupeById = (arr: any[], max: number) => {
      const seen = new Set<string>()
      const out: any[] = []
      for (const item of arr) {
        if (!item) continue
        const k = String(item.id || `${item.userEmail || ""}_${item.timestamp || ""}`)
        if (!seen.has(k)) {
          seen.add(k)
          out.push(item)
        }
        if (out.length >= max) break
      }
      return out
    }

    const updated: CloudTelemetryState = {
      activityLogs: dedupeById(
        partial.activityLog ? [partial.activityLog, ...current.activityLogs] : current.activityLogs,
        35
      ),
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
