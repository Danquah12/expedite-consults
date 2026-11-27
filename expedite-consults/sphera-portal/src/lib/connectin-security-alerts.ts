import crypto from "crypto"
import { NextRequest } from "next/server"
import { signPayload, verifySignedPayload } from "@/lib/connectin-crypto"
import { resolveRequestGeoLocation, recordGlobalUserActivity } from "@/lib/connectin-cloud-sync"
import { firebaseKvGetItem, firebaseKvSetItem } from "@/lib/connectin-firebase-kv"
import { sendConnectLnSecurityAlertEmail } from "@/lib/connectin-email"

export const SECURITY_EMAILS_KV_MAP = "connectln_security_emails_v1"
export const CANONICAL_APP_ORIGIN = "https://conectln.com"
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

export type SecurityAlertEventType =
  | "password_change"
  | "phone_change"
  | "passkey_added"
  | "security_check"

export type SecurityAlertActionStatus = "pending" | "secured_locked" | "confirmed_me"

export interface SecurityAlertRecord {
  alertId: string
  email: string
  userId?: string
  fullName: string
  firstName: string
  eventType: SecurityAlertEventType
  subject: string
  headline: string
  summary: string
  city: string
  region: string
  countryCode: string
  locationDisplay: string
  deviceDisplay: string
  timestampDisplay: string
  timestampIso: string
  ipAddress: string
  mapImageUrl: string
  profiles: string[]
  status: SecurityAlertActionStatus
  actionedAtIso?: string
  emailSent: boolean
  emailMessageId?: string
  emailError?: string
}

export interface SecurityAlertActionTokenPayload {
  alertId: string
  email: string
  phone?: string
  userId?: string
  fullName: string
  eventType: SecurityAlertEventType
  locationDisplay: string
  deviceDisplay: string
  timestampDisplay: string
  mapImageUrl: string
  profiles: string[]
  issuedAtMs: number
  expiresAtMs: number
}

const US_STATE_NAMES: Record<string, string> = {
  AL: "ALABAMA",
  AK: "ALASKA",
  AZ: "ARIZONA",
  AR: "ARKANSAS",
  CA: "CALIFORNIA",
  CO: "COLORADO",
  CT: "CONNECTICUT",
  DE: "DELAWARE",
  DC: "DISTRICT OF COLUMBIA",
  FL: "FLORIDA",
  GA: "GEORGIA",
  HI: "HAWAII",
  ID: "IDAHO",
  IL: "ILLINOIS",
  IN: "INDIANA",
  IA: "IOWA",
  KS: "KANSAS",
  KY: "KENTUCKY",
  LA: "LOUISIANA",
  ME: "MAINE",
  MD: "MARYLAND",
  MA: "MASSACHUSETTS",
  MI: "MICHIGAN",
  MN: "MINNESOTA",
  MS: "MISSISSIPPI",
  MO: "MISSOURI",
  MT: "MONTANA",
  NE: "NEBRASKA",
  NV: "NEVADA",
  NH: "NEW HAMPSHIRE",
  NJ: "NEW JERSEY",
  NM: "NEW MEXICO",
  NY: "NEW YORK",
  NC: "NORTH CAROLINA",
  ND: "NORTH DAKOTA",
  OH: "OHIO",
  OK: "OKLAHOMA",
  OR: "OREGON",
  PA: "PENNSYLVANIA",
  RI: "RHODE ISLAND",
  SC: "SOUTH CAROLINA",
  SD: "SOUTH DAKOTA",
  TN: "TENNESSEE",
  TX: "TEXAS",
  UT: "UTAH",
  VT: "VERMONT",
  VA: "VIRGINIA",
  WA: "WASHINGTON",
  WV: "WEST VIRGINIA",
  WI: "WISCONSIN",
  WY: "WYOMING",
}

const TIMEZONE_FALLBACK_CITY_REGION: Record<string, { city: string; region: string; countryCode: string }> = {
  "America/New_York": { city: "Maryland City", region: "MARYLAND", countryCode: "US" },
  "America/Chicago": { city: "Chicago", region: "ILLINOIS", countryCode: "US" },
  "America/Denver": { city: "Denver", region: "COLORADO", countryCode: "US" },
  "America/Los_Angeles": { city: "San Francisco", region: "CALIFORNIA", countryCode: "US" },
  "Africa/Accra": { city: "Accra", region: "GREATER ACCRA", countryCode: "GH" },
  "Europe/London": { city: "London", region: "ENGLAND", countryCode: "GB" },
}

export function parseDeviceAndOs(userAgent: string): string {
  const ua = String(userAgent || "")
  let browser = "Web Browser"
  if (/Edg\//i.test(ua)) browser = "Edge"
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "Opera"
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome"
  else if (/Firefox\//i.test(ua)) browser = "Firefox"
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari"

  let os = "Desktop"
  if (/Windows NT/i.test(ua) || /Windows/i.test(ua)) os = "Windows"
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS"
  else if (/Android/i.test(ua)) os = "Android"
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS"
  else if (/Linux/i.test(ua)) os = "Linux"

  if (browser === "Web Browser" && os === "Desktop") {
    return "Chrome, Windows"
  }
  return `${browser}, ${os}`
}

export function formatMetaStyleLocation(
  req?: NextRequest | null,
  clientTimezone?: string,
  fallbackLocation?: string
): {
  city: string
  region: string
  countryCode: string
  locationDisplay: string
  ipAddress: string
  userAgent: string
} {
  const geo = resolveRequestGeoLocation(req, clientTimezone, fallbackLocation)
  let rawCity = ""
  try {
    rawCity = decodeURIComponent(req?.headers.get("x-vercel-ip-city") || "").trim()
  } catch {
    rawCity = (req?.headers.get("x-vercel-ip-city") || "").trim()
  }
  const rawRegionCode = (req?.headers.get("x-vercel-ip-country-region") || "").trim().toUpperCase()
  const rawCountryCode = (req?.headers.get("x-vercel-ip-country") || "").trim().toUpperCase()

  const tzDefault = clientTimezone ? TIMEZONE_FALLBACK_CITY_REGION[clientTimezone] : undefined

  const countryCode = rawCountryCode || geo.countryCode || tzDefault?.countryCode || "US"
  let city = rawCity || ""
  if (!city && fallbackLocation && !fallbackLocation.includes("Enclave") && !fallbackLocation.includes("Cryptographic")) {
    city = fallbackLocation.split(",")[0].trim()
  }
  if (!city) {
    city = tzDefault?.city || (geo.city && geo.city !== "Washington, DC" ? geo.city : "Maryland City")
  }

  let region = ""
  if (rawRegionCode) {
    region = US_STATE_NAMES[rawRegionCode] || rawRegionCode
  } else if (tzDefault?.region) {
    region = tzDefault.region
  } else if (countryCode === "US") {
    region = "MARYLAND"
  } else {
    region = geo.countryName.toUpperCase()
  }

  const locationDisplay = `${city}, ${region}, ${countryCode}`
  return {
    city,
    region,
    countryCode,
    locationDisplay,
    ipAddress: geo.ipAddress,
    userAgent: geo.userAgent,
  }
}

export function formatMetaStyleTimestamp(date: Date = new Date(), timeZone?: string): string {
  const candidateTz = String(timeZone || "").trim() || "America/New_York"
  const formatWithTz = (tz: string) => {
    const datePart = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)
    const timePart = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
    return `${datePart} at ${timePart}`
  }

  try {
    return formatWithTz(candidateTz)
  } catch {
    return formatWithTz("America/New_York")
  }
}

export function buildAccountProfilesList(params: {
  fullName: string
  email: string
  phone?: string
  role?: string
}): string[] {
  const cleanEmail = String(params.email || "").trim().toLowerCase()
  const emailHandle = cleanEmail.includes("@") ? cleanEmail.split("@")[0].replace(/[^a-z0-9._-]/gi, "") : ""
  const cleanName = String(params.fullName || "").trim() || "ConnectLn Member"
  const handle = emailHandle || cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")
  const digits = String(params.phone || "").replace(/[^\d]/g, "")
  const maskedPhone = digits.length >= 4 ? `ending in ${digits.slice(-4)}` : ""

  const profiles = [
    `${handle} (ConnectLn Profile)`,
    maskedPhone ? `a ConnectLn Calling & Messaging account (${maskedPhone})` : "a ConnectLn Calling & Messaging account",
    `${cleanName} (ConnectLn Studio & VibeLoop)`,
    `${handle} (ConnectLn Power Apps)`,
  ]
  if (String(params.role || "").toLowerCase() === "admin") {
    profiles.push(`${cleanName} (Expedite Admin & SOC Enclave)`)
  }
  return profiles
}

export function signSecurityAlertToken(payload: SecurityAlertActionTokenPayload): string {
  return signPayload(payload)
}

export function verifySecurityAlertToken(token: string): SecurityAlertActionTokenPayload | null {
  const payload = verifySignedPayload<SecurityAlertActionTokenPayload>(token)
  if (!payload) return null
  if (!payload.alertId || !payload.email) return null
  if (payload.expiresAtMs && Date.now() > payload.expiresAtMs) return null
  return payload
}

function userLogKey(email: string): string {
  return `user:${String(email || "").trim().toLowerCase()}`
}

function alertRecordKey(alertId: string): string {
  return `alert:${String(alertId || "").trim()}`
}

export async function recordSecurityAlertEmail(record: SecurityAlertRecord): Promise<void> {
  const cleanEmail = String(record.email || "").trim().toLowerCase()
  await firebaseKvSetItem(SECURITY_EMAILS_KV_MAP, alertRecordKey(record.alertId), record, 60 * 60 * 24 * 30)
  if (cleanEmail) {
    const existing = await firebaseKvGetItem<SecurityAlertRecord[]>(SECURITY_EMAILS_KV_MAP, userLogKey(cleanEmail))
    const list = Array.isArray(existing) ? existing : []
    const next = [record, ...list.filter((item) => item && item.alertId !== record.alertId)].slice(0, 25)
    await firebaseKvSetItem(SECURITY_EMAILS_KV_MAP, userLogKey(cleanEmail), next, 60 * 60 * 24 * 30)
  }
}

export async function getSecurityAlertById(alertId: string): Promise<SecurityAlertRecord | null> {
  if (!alertId) return null
  return await firebaseKvGetItem<SecurityAlertRecord>(SECURITY_EMAILS_KV_MAP, alertRecordKey(alertId))
}

export async function listSecurityAlertEmails(email: string): Promise<SecurityAlertRecord[]> {
  const cleanEmail = String(email || "").trim().toLowerCase()
  if (!cleanEmail) return []
  const stored = await firebaseKvGetItem<SecurityAlertRecord[]>(SECURITY_EMAILS_KV_MAP, userLogKey(cleanEmail))
  return Array.isArray(stored) ? stored : []
}

export async function updateSecurityAlertStatus(
  alertId: string,
  email: string,
  status: SecurityAlertActionStatus
): Promise<SecurityAlertRecord | null> {
  const actionedAtIso = new Date().toISOString()
  const cleanEmail = String(email || "").trim().toLowerCase()
  const existingAlert = await getSecurityAlertById(alertId)
  let updatedAlert: SecurityAlertRecord | null = null

  if (existingAlert) {
    updatedAlert = { ...existingAlert, status, actionedAtIso }
    await firebaseKvSetItem(SECURITY_EMAILS_KV_MAP, alertRecordKey(alertId), updatedAlert, 60 * 60 * 24 * 30)
  }

  if (cleanEmail) {
    const existingList = await listSecurityAlertEmails(cleanEmail)
    if (existingList.length > 0) {
      const nextList = existingList.map((item) =>
        item.alertId === alertId ? { ...item, status, actionedAtIso } : item
      )
      await firebaseKvSetItem(SECURITY_EMAILS_KV_MAP, userLogKey(cleanEmail), nextList, 60 * 60 * 24 * 30)
      if (!updatedAlert) {
        updatedAlert = nextList.find((item) => item.alertId === alertId) || null
      }
    }
  }

  return updatedAlert
}

function resolveEventCopy(eventType: SecurityAlertEventType): {
  subject: string
  headline: string
  summary: string
} {
  switch (eventType) {
    case "phone_change":
      return {
        subject: "Security alert: calling phone number changed",
        headline: "Security alert: phone number change",
        summary:
          "Someone just updated the calling phone number on your ConnectLn Account. If this wasn't you, we're here to help you take some simple steps to secure your account.",
      }
    case "passkey_added":
      return {
        subject: "Security alert: new passkey added",
        headline: "Security alert: passkey added",
        summary:
          "Someone just registered a new passkey on your ConnectLn Account. If this wasn't you, we're here to help you take some simple steps to secure your account.",
      }
    case "security_check":
      return {
        subject: "Security alert: password change",
        headline: "Security alert: password change",
        summary:
          "Someone just changed your ConnectLn Account password. If this wasn't you, we're here to help you take some simple steps to secure your account.",
      }
    case "password_change":
    default:
      return {
        subject: "Security alert: password change",
        headline: "Security alert: password change",
        summary:
          "Someone just changed your ConnectLn Account password. If this wasn't you, we're here to help you take some simple steps to secure your account.",
      }
  }
}

export async function dispatchConnectLnSecurityAlert(
  req: NextRequest | null,
  params: {
    email: string
    fullName: string
    userId?: string
    phone?: string
    role?: string
    eventType?: SecurityAlertEventType
    clientTimezone?: string
    clientLocation?: string
    originOverride?: string
    sendEmail?: boolean
  }
): Promise<{
  alert: SecurityAlertRecord
  actionToken: string
  notMeUrl: string
  checkEmailUrl: string
  emailSent: boolean
  emailMessageId?: string
  emailError?: string
}> {
  const cleanEmail = String(params.email || "").trim().toLowerCase()
  const fullName = String(params.fullName || "").trim() || (cleanEmail.split("@")[0] || "Member")
  const firstName = fullName.split(/\s+/)[0] || fullName
  const eventType: SecurityAlertEventType = params.eventType || "password_change"
  const copy = resolveEventCopy(eventType)

  const origin = (
    params.originOverride ||
    process.env.NEXT_PUBLIC_APP_URL ||
    CANONICAL_APP_ORIGIN
  ).replace(/\/$/, "")

  const loc = formatMetaStyleLocation(req, params.clientTimezone, params.clientLocation)
  const deviceDisplay = parseDeviceAndOs(loc.userAgent)
  const now = new Date()
  const timestampIso = now.toISOString()
  const timestampDisplay = formatMetaStyleTimestamp(now, params.clientTimezone)
  const profiles = buildAccountProfilesList({
    fullName,
    email: cleanEmail,
    phone: params.phone,
    role: params.role,
  })

  const alertId = `SEC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
  const mapImageUrl = `${origin}/api/connectin/security-alert/map-image?city=${encodeURIComponent(
    loc.city
  )}&region=${encodeURIComponent(loc.region)}&country=${encodeURIComponent(loc.countryCode)}`

  const issuedAtMs = now.getTime()
  const tokenPayload: SecurityAlertActionTokenPayload = {
    alertId,
    email: cleanEmail,
    phone: params.phone || undefined,
    userId: params.userId,
    fullName,
    eventType,
    locationDisplay: loc.locationDisplay,
    deviceDisplay,
    timestampDisplay,
    mapImageUrl,
    profiles,
    issuedAtMs,
    expiresAtMs: issuedAtMs + TOKEN_TTL_MS,
  }
  const actionToken = signSecurityAlertToken(tokenPayload)
  const notMeUrl = `${origin}/connectin/security-alert?token=${encodeURIComponent(actionToken)}`
  const checkEmailUrl = `${origin}/connectin/security-alert?check=1&email=${encodeURIComponent(cleanEmail)}`

  let emailSent = false
  let emailMessageId: string | undefined
  let emailError: string | undefined

  if (params.sendEmail !== false) {
    const emailRes = await sendConnectLnSecurityAlertEmail({
      toEmail: cleanEmail,
      firstName,
      subject: copy.subject,
      headline: copy.headline,
      summaryText: copy.summary,
      locationDisplay: loc.locationDisplay,
      deviceDisplay,
      timestampDisplay,
      mapImageUrl,
      profiles,
      notMeUrl,
      checkEmailUrl,
    })
    emailSent = emailRes.success
    emailMessageId = emailRes.id
    emailError = emailRes.error
  }

  const alert: SecurityAlertRecord = {
    alertId,
    email: cleanEmail,
    userId: params.userId,
    fullName,
    firstName,
    eventType,
    subject: copy.subject,
    headline: copy.headline,
    summary: copy.summary,
    city: loc.city,
    region: loc.region,
    countryCode: loc.countryCode,
    locationDisplay: loc.locationDisplay,
    deviceDisplay,
    timestampDisplay,
    timestampIso,
    ipAddress: loc.ipAddress,
    mapImageUrl,
    profiles,
    status: "pending",
    emailSent,
    emailMessageId,
    emailError,
  }

  await recordSecurityAlertEmail(alert)

  void recordGlobalUserActivity({
    id: `act_sec_${alertId}`,
    userId: params.userId || `USR-${cleanEmail.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`,
    userName: fullName,
    userEmail: cleanEmail,
    userAvatar: "",
    userRole: String(params.role || "PERSONAL").toUpperCase(),
    actionType: eventType === "password_change" ? "SECURITY_ALERT_PASSWORD_CHANGE" : "SECURITY_ALERT_DISPATCHED",
    actionLabel: copy.headline,
    category: "auth",
    targetId: alertId,
    targetTitle: `${loc.locationDisplay} · ${deviceDisplay}`,
    details: `${copy.subject} dispatched (${emailSent ? "Email sent" : "Logged"})`,
    timestampIso,
  }).catch(() => {})

  return {
    alert,
    actionToken,
    notMeUrl,
    checkEmailUrl,
    emailSent,
    emailMessageId,
    emailError,
  }
}
