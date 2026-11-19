import crypto from "crypto"
import { connectinDb } from "./connectin-db"
import { pullCloudUsersIntoDb } from "./connectin-cloud-sync"
import { formatE164Phone } from "./connectin-sms"

const VOICE_CONFIG_MAP_NAME = "connectln_voice_config_map_v1"
const VOICE_CREDS_ITEM_KEY = "softphone_creds_v1"
const MEMBER_PHONES_MAP_NAME = "connectln_member_phones_map_v1"

const PUBLIC_PRODUCTION_ORIGIN = "https://conectln.com"
const TWIML_APP_FRIENDLY_NAME = "ConnectLn_Browser_Softphone_App"
const API_KEY_FRIENDLY_NAME = "ConnectLn_Browser_Softphone_Key"

export interface ProvisionedVoiceCredentials {
  accountSid: string
  apiKeySid: string
  apiKeySecret: string
  twimlAppSid: string
  callerId: string
  voiceUrl: string
}

const globalForVoice = globalThis as unknown as {
  __connectlnVoiceCreds?: ProvisionedVoiceCredentials
  __connectlnVoiceCredsCheckedAt?: number
  __connectlnMemberPhonesCache?: Map<string, string>
}

if (!globalForVoice.__connectlnMemberPhonesCache) {
  globalForVoice.__connectlnMemberPhonesCache = new Map<string, string>()
}

function getTwilioAuth(): { accountSid: string; authHeader: string; callerId: string } | null {
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim()
  const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim()
  const callerId = formatE164Phone(process.env.TWILIO_PHONE_NUMBER || "+12402623543")
  if (!accountSid || !authToken) return null
  const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
  return { accountSid, authHeader, callerId }
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

export function looksLikePhoneNumber(raw: string | undefined | null): boolean {
  if (!raw) return false
  const trimmed = String(raw).trim()
  if (!trimmed || trimmed.includes("@")) return false
  // Strip common phone separators
  const compact = trimmed.replace(/[\s().\-]/g, "")
  return /^\+?\d{7,15}$/.test(compact)
}

export function normalizeDialablePhone(raw: string): string {
  const trimmed = String(raw || "").trim()
  const compact = trimmed.replace(/[^\d+]/g, "")
  if (!compact) return ""
  if (compact.startsWith("00") && compact.length > 9) {
    return `+${compact.slice(2)}`
  }
  if (compact.startsWith("+")) {
    return compact
  }
  if (compact.length === 10) {
    return `+1${compact}`
  }
  if (compact.length === 11 && compact.startsWith("1")) {
    return `+${compact}`
  }
  return `+${compact}`
}

export function formatPrettyPhoneDisplay(raw: string): string {
  const e164 = normalizeDialablePhone(raw)
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/)
  if (m) {
    return `+1 (${m[1]}) ${m[2]}-${m[3]}`
  }
  return e164 || raw
}

async function ensureSyncMap(authHeader: string, mapName: string): Promise<void> {
  await fetch("https://sync.twilio.com/v1/Services/default/Maps", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ UniqueName: mapName }).toString(),
  }).catch(() => {})
}

async function readSyncMapItem<T>(authHeader: string, mapName: string, key: string): Promise<T | null> {
  try {
    const res = await fetch(
      `https://sync.twilio.com/v1/Services/default/Maps/${mapName}/Items/${encodeURIComponent(key)}`,
      {
        method: "GET",
        headers: { Authorization: authHeader },
        cache: "no-store",
      }
    )
    if (!res.ok) return null
    const json: any = await res.json()
    return (json?.data as T) || null
  } catch {
    return null
  }
}

async function writeSyncMapItem(
  authHeader: string,
  mapName: string,
  key: string,
  dataObj: unknown
): Promise<boolean> {
  try {
    const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${mapName}`
    const serialized = JSON.stringify(dataObj)
    const upd = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ Data: serialized }).toString(),
    })
    if (upd.ok) return true
    if (upd.status === 404) {
      await ensureSyncMap(authHeader, mapName)
      const crt = await fetch(`${baseUrl}/Items`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ Key: key, Data: serialized }).toString(),
      })
      return crt.ok || crt.status === 409
    }
    return false
  } catch {
    return false
  }
}

async function ensureTwimlApplication(
  accountSid: string,
  authHeader: string,
  desiredVoiceUrl: string,
  desiredStatusUrl: string
): Promise<string> {
  const listRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Applications.json?FriendlyName=${encodeURIComponent(
      TWIML_APP_FRIENDLY_NAME
    )}`,
    {
      method: "GET",
      headers: { Authorization: authHeader },
      cache: "no-store",
    }
  )
  if (listRes.ok) {
    const listJson: any = await listRes.json()
    const existing = Array.isArray(listJson?.applications) ? listJson.applications[0] : null
    if (existing?.sid) {
      if (existing.voice_url !== desiredVoiceUrl || existing.voice_method !== "POST") {
        await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Applications/${existing.sid}.json`,
          {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              VoiceUrl: desiredVoiceUrl,
              VoiceMethod: "POST",
              StatusCallback: desiredStatusUrl,
              StatusCallbackMethod: "POST",
            }).toString(),
          }
        ).catch(() => {})
      }
      return existing.sid as string
    }
  }

  const createRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Applications.json`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        FriendlyName: TWIML_APP_FRIENDLY_NAME,
        VoiceUrl: desiredVoiceUrl,
        VoiceMethod: "POST",
        StatusCallback: desiredStatusUrl,
        StatusCallbackMethod: "POST",
      }).toString(),
    }
  )
  const createJson: any = await createRes.json()
  if (!createRes.ok || !createJson?.sid) {
    throw new Error(createJson?.message || "Failed to create Twilio TwiML Application")
  }
  return createJson.sid as string
}

async function verifyApiKeyExists(
  accountSid: string,
  authHeader: string,
  apiKeySid: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Keys/${apiKeySid}.json`,
      {
        method: "GET",
        headers: { Authorization: authHeader },
        cache: "no-store",
      }
    )
    return res.ok
  } catch {
    return false
  }
}

async function createTwilioSigningKey(
  accountSid: string,
  authHeader: string
): Promise<{ sid: string; secret: string }> {
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Keys.json`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ FriendlyName: API_KEY_FRIENDLY_NAME }).toString(),
    }
  )
  const json: any = await res.json()
  if (!res.ok || !json?.sid || !json?.secret) {
    throw new Error(json?.message || "Failed to create Twilio Voice API Signing Key")
  }
  return { sid: json.sid as string, secret: json.secret as string }
}

/**
 * Automatically provisions & caches the Twilio TwiML Application + Signing Key in Twilio Sync
 * so Browser-to-Cell-Phone WebRTC calling works across all serverless instances with zero manual console setup.
 */
export async function ensureConnectLnTwilioVoiceCredentials(): Promise<ProvisionedVoiceCredentials> {
  const twilio = getTwilioAuth()
  if (!twilio) {
    throw new Error("Twilio credentials (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN) are not configured.")
  }

  const webhookOrigin = (process.env.CONNECTLN_VOICE_WEBHOOK_ORIGIN || PUBLIC_PRODUCTION_ORIGIN).replace(
    /\/+$/,
    ""
  )
  const desiredVoiceUrl = `${webhookOrigin}/api/connectin/voice/twiml`
  const desiredStatusUrl = `${webhookOrigin}/api/connectin/voice/status`

  const nowMs = Date.now()
  if (
    globalForVoice.__connectlnVoiceCreds &&
    globalForVoice.__connectlnVoiceCreds.voiceUrl === desiredVoiceUrl &&
    nowMs - (globalForVoice.__connectlnVoiceCredsCheckedAt || 0) < 20 * 60 * 1000
  ) {
    return globalForVoice.__connectlnVoiceCreds
  }

  // 1. Check Twilio Sync persisted credentials first
  const stored = await readSyncMapItem<ProvisionedVoiceCredentials>(
    twilio.authHeader,
    VOICE_CONFIG_MAP_NAME,
    VOICE_CREDS_ITEM_KEY
  )

  const twimlAppSid = await ensureTwimlApplication(
    twilio.accountSid,
    twilio.authHeader,
    desiredVoiceUrl,
    desiredStatusUrl
  )

  if (
    stored?.apiKeySid &&
    stored?.apiKeySecret &&
    stored?.accountSid === twilio.accountSid &&
    (await verifyApiKeyExists(twilio.accountSid, twilio.authHeader, stored.apiKeySid))
  ) {
    const updated: ProvisionedVoiceCredentials = {
      accountSid: twilio.accountSid,
      apiKeySid: stored.apiKeySid,
      apiKeySecret: stored.apiKeySecret,
      twimlAppSid,
      callerId: twilio.callerId,
      voiceUrl: desiredVoiceUrl,
    }
    if (stored.twimlAppSid !== twimlAppSid || stored.voiceUrl !== desiredVoiceUrl) {
      await writeSyncMapItem(twilio.authHeader, VOICE_CONFIG_MAP_NAME, VOICE_CREDS_ITEM_KEY, updated)
    }
    globalForVoice.__connectlnVoiceCreds = updated
    globalForVoice.__connectlnVoiceCredsCheckedAt = nowMs
    return updated
  }

  // 2. Mint a fresh Twilio Signing Key once and persist in Twilio Sync
  const newKey = await createTwilioSigningKey(twilio.accountSid, twilio.authHeader)
  const provisioned: ProvisionedVoiceCredentials = {
    accountSid: twilio.accountSid,
    apiKeySid: newKey.sid,
    apiKeySecret: newKey.secret,
    twimlAppSid,
    callerId: twilio.callerId,
    voiceUrl: desiredVoiceUrl,
  }

  await writeSyncMapItem(twilio.authHeader, VOICE_CONFIG_MAP_NAME, VOICE_CREDS_ITEM_KEY, provisioned)
  globalForVoice.__connectlnVoiceCreds = provisioned
  globalForVoice.__connectlnVoiceCredsCheckedAt = nowMs
  return provisioned
}

/**
 * Signs an official Twilio Programmable Voice AccessToken (JWT `twilio-fpa;v=1`) for `@twilio/voice-sdk`.
 */
export async function mintTwilioVoiceAccessToken(rawIdentity: string): Promise<{
  token: string
  identity: string
  callerId: string
  twimlAppSid: string
}> {
  const creds = await ensureConnectLnTwilioVoiceCredentials()
  const cleanIdentity =
    String(rawIdentity || "connectln_caller")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 48) || "connectln_caller"

  const nowSec = Math.floor(Date.now() / 1000)
  const header = {
    cty: "twilio-fpa;v=1",
    typ: "JWT",
    alg: "HS256",
  }
  const payload = {
    jti: `${creds.apiKeySid}-${nowSec}-${Math.floor(Math.random() * 10000)}`,
    iss: creds.apiKeySid,
    sub: creds.accountSid,
    nbf: nowSec - 5,
    exp: nowSec + 3600,
    grants: {
      identity: cleanIdentity,
      voice: {
        incoming: { allow: true },
        outgoing: {
          application_sid: creds.twimlAppSid,
        },
      },
    },
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = base64UrlEncode(
    crypto.createHmac("sha256", creds.apiKeySecret).update(signingInput).digest()
  )

  return {
    token: `${signingInput}.${signature}`,
    identity: cleanIdentity,
    callerId: creds.callerId,
    twimlAppSid: creds.twimlAppSid,
  }
}

function makeContactKey(raw: string): string {
  return String(raw || "")
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64)
}

export async function saveContactPhoneMapping(params: {
  contactName?: string
  contactEmail?: string
  phone: string
}): Promise<string> {
  const normalized = normalizeDialablePhone(params.phone)
  if (!looksLikePhoneNumber(normalized)) return ""
  const nameKey = makeContactKey(params.contactName || "")
  const emailKey = makeContactKey(params.contactEmail || "")

  if (nameKey) globalForVoice.__connectlnMemberPhonesCache?.set(nameKey, normalized)
  if (emailKey) globalForVoice.__connectlnMemberPhonesCache?.set(emailKey, normalized)

  const twilio = getTwilioAuth()
  if (twilio) {
    const entry = {
      phone: normalized,
      contactName: params.contactName || "",
      contactEmail: params.contactEmail || "",
      updatedAtIso: new Date().toISOString(),
    }
    if (nameKey) {
      await writeSyncMapItem(twilio.authHeader, MEMBER_PHONES_MAP_NAME, `name_${nameKey}`, entry)
    }
    if (emailKey) {
      await writeSyncMapItem(twilio.authHeader, MEMBER_PHONES_MAP_NAME, `email_${emailKey}`, entry)
    }
  }
  return normalized
}

/**
 * Resolves a phone number for either a raw phone string ("2402607898") OR a ConnectLn member's name/email/@username.
 */
export async function resolveRecipientCellPhone(params: {
  targetPhone?: string
  targetName?: string
  targetEmail?: string
}): Promise<{
  resolvedPhone: string
  matchedMemberName: string
}> {
  const candidateDirect = (params.targetPhone || "").trim()
  if (looksLikePhoneNumber(candidateDirect)) {
    const norm = normalizeDialablePhone(candidateDirect)
    return {
      resolvedPhone: norm,
      matchedMemberName: params.targetName || formatPrettyPhoneDisplay(norm),
    }
  }

  const candidateFromName = (params.targetName || "").trim()
  if (looksLikePhoneNumber(candidateFromName)) {
    const norm = normalizeDialablePhone(candidateFromName)
    return {
      resolvedPhone: norm,
      matchedMemberName: formatPrettyPhoneDisplay(norm),
    }
  }

  // Check if targetName contains an embedded phone number like "Boat (+1 240-260-7898)"
  const embeddedDigitsMatch = candidateFromName.match(/(\+?\d[\d\s().\-]{8,16}\d)/)
  if (embeddedDigitsMatch && looksLikePhoneNumber(embeddedDigitsMatch[1])) {
    return {
      resolvedPhone: normalizeDialablePhone(embeddedDigitsMatch[1]),
      matchedMemberName: candidateFromName,
    }
  }

  const cleanEmail = (params.targetEmail || "").toLowerCase().trim()
  const cleanName = candidateFromName.toLowerCase().replace(/^@+/, "").trim()
  const nameKey = makeContactKey(cleanName)
  const emailKey = makeContactKey(cleanEmail)

  // Check in-memory / Cloud Sync saved contact phone book
  const cachedByEmail = emailKey ? globalForVoice.__connectlnMemberPhonesCache?.get(emailKey) : undefined
  if (cachedByEmail) {
    return { resolvedPhone: cachedByEmail, matchedMemberName: candidateFromName || cleanEmail }
  }
  const cachedByName = nameKey ? globalForVoice.__connectlnMemberPhonesCache?.get(nameKey) : undefined
  if (cachedByName) {
    return { resolvedPhone: cachedByName, matchedMemberName: candidateFromName }
  }

  const twilio = getTwilioAuth()
  if (twilio) {
    if (emailKey) {
      const cloudByEmail = await readSyncMapItem<{ phone?: string; contactName?: string }>(
        twilio.authHeader,
        MEMBER_PHONES_MAP_NAME,
        `email_${emailKey}`
      )
      if (cloudByEmail?.phone) {
        globalForVoice.__connectlnMemberPhonesCache?.set(emailKey, cloudByEmail.phone)
        return {
          resolvedPhone: cloudByEmail.phone,
          matchedMemberName: cloudByEmail.contactName || candidateFromName || cleanEmail,
        }
      }
    }
    if (nameKey) {
      const cloudByName = await readSyncMapItem<{ phone?: string; contactName?: string }>(
        twilio.authHeader,
        MEMBER_PHONES_MAP_NAME,
        `name_${nameKey}`
      )
      if (cloudByName?.phone) {
        globalForVoice.__connectlnMemberPhonesCache?.set(nameKey, cloudByName.phone)
        return {
          resolvedPhone: cloudByName.phone,
          matchedMemberName: cloudByName.contactName || candidateFromName,
        }
      }
    }
  }

  // Check ConnectLn registered users DB + Cloud Users
  try {
    await pullCloudUsersIntoDb()
    const allUsers = connectinDb.getAllUsersWithProfiles()
    for (const u of allUsers) {
      const uEmail = (u.email || "").toLowerCase().trim()
      const uName = (u.name || "").toLowerCase().trim()
      const uPhone = (u.phone || "").trim()
      if (!uPhone || !looksLikePhoneNumber(uPhone)) continue

      if (
        (cleanEmail && uEmail === cleanEmail) ||
        (cleanName &&
          (uName === cleanName ||
            uName.includes(cleanName) ||
            cleanName.includes(uName)))
      ) {
        return {
          resolvedPhone: normalizeDialablePhone(uPhone),
          matchedMemberName: u.name || candidateFromName,
        }
      }
    }
  } catch {
    // ignore lookup failure
  }

  // Known founder profile phone fallback
  if (cleanName.includes("kwesi") || cleanEmail.includes("asiedu")) {
    return {
      resolvedPhone: "+12402607898",
      matchedMemberName: "Kwesi Asiedu",
    }
  }

  return {
    resolvedPhone: "",
    matchedMemberName: candidateFromName || cleanEmail || "ConnectLn Contact",
  }
}

export function escapeXml(unsafe: string): string {
  return String(unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
