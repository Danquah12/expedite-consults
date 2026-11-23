import { cert } from "firebase-admin/app"

/**
 * ConnectLn Zero-Cost Cloud KV Store (backed by Firebase Project `connectln-2ab9b`)
 * ---------------------------------------------------------------------------------
 * Replaces Twilio Sync (`sync.twilio.com`) completely so ConnectLn calling, directory
 * lookups, Web Push subscriptions, and Android FCM tokens work 100% independently of
 * Twilio account status or balance ($0.00 cost on Firebase Spark plan).
 */

interface KvEnvelope<T = any> {
  data: T
  updatedAtMs: number
  expiresAtMs?: number | null
}

type KvMapDict = Record<string, KvEnvelope<any>>

const globalForFbKv = globalThis as unknown as {
  __connectlnFbOAuth?: { token: string; projectId: string; expiresAtMs: number }
  __connectlnFbMapsCache?: Record<string, KvMapDict>
  __connectlnFbEtag?: string
  __connectlnFbLastFetchMs?: number
  __connectlnFbWriteLock?: Promise<void>
}

if (!globalForFbKv.__connectlnFbMapsCache) {
  globalForFbKv.__connectlnFbMapsCache = {}
}

async function getFirebaseAccessToken(): Promise<{ token: string; projectId: string } | null> {
  const now = Date.now()
  if (globalForFbKv.__connectlnFbOAuth && globalForFbKv.__connectlnFbOAuth.expiresAtMs > now + 60000) {
    return {
      token: globalForFbKv.__connectlnFbOAuth.token,
      projectId: globalForFbKv.__connectlnFbOAuth.projectId,
    }
  }
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "").trim()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const projectId = String(parsed.project_id || "connectln-2ab9b")
    const credential = cert(parsed)
    const tok = await credential.getAccessToken()
    if (!tok?.access_token) return null
    globalForFbKv.__connectlnFbOAuth = {
      token: tok.access_token,
      projectId,
      expiresAtMs: now + 50 * 60 * 1000,
    }
    return { token: tok.access_token, projectId }
  } catch (err) {
    console.warn("[ConnectLn Firebase KV] OAuth token error:", (err as any)?.message)
    return null
  }
}

async function pullAllMapsFromFirebase(force = false): Promise<Record<string, KvMapDict>> {
  const now = Date.now()
  if (
    !force &&
    globalForFbKv.__connectlnFbLastFetchMs &&
    now - globalForFbKv.__connectlnFbLastFetchMs < 800 &&
    globalForFbKv.__connectlnFbMapsCache
  ) {
    return globalForFbKv.__connectlnFbMapsCache
  }

  const auth = await getFirebaseAccessToken()
  if (!auth) return globalForFbKv.__connectlnFbMapsCache || {}

  try {
    const url = `https://firebaseremoteconfig.googleapis.com/v1/projects/${auth.projectId}/remoteConfig`
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: "no-store",
    })
    if (!res.ok) return globalForFbKv.__connectlnFbMapsCache || {}
    const etag = res.headers.get("etag") || "*"
    globalForFbKv.__connectlnFbEtag = etag
    globalForFbKv.__connectlnFbLastFetchMs = now

    const json: any = await res.json()
    const params = json?.parameters || {}
    const cache: Record<string, KvMapDict> = {}

    for (const [paramKey, paramVal] of Object.entries<any>(params)) {
      const rawStr = paramVal?.defaultValue?.value
      if (typeof rawStr === "string" && rawStr.startsWith("{")) {
        try {
          cache[paramKey] = JSON.parse(rawStr)
        } catch {}
      }
    }
    globalForFbKv.__connectlnFbMapsCache = cache
    return cache
  } catch {
    return globalForFbKv.__connectlnFbMapsCache || {}
  }
}

function pruneExpiredFromMap(dict: KvMapDict, nowMs: number): KvMapDict {
  const clean: KvMapDict = {}
  const entries = Object.entries(dict)
  for (const [k, env] of entries) {
    if (!env || typeof env !== "object") continue
    if (env.expiresAtMs && env.expiresAtMs < nowMs) continue
    clean[k] = env
  }
  return clean
}

export async function firebaseKvGetItem<T = any>(mapName: string, key: string): Promise<T | null> {
  const maps = await pullAllMapsFromFirebase()
  const dict = maps[mapName]
  if (!dict) return null
  const env = dict[key]
  if (!env) return null
  if (env.expiresAtMs && env.expiresAtMs < Date.now()) return null
  return (env.data as T) ?? null
}

export async function firebaseKvListItems<T = any>(
  mapName: string,
  forceRefresh = false
): Promise<Array<{ key: string; data: T; updatedAtMs: number }>> {
  const maps = await pullAllMapsFromFirebase(forceRefresh)
  const dict = maps[mapName] || {}
  const now = Date.now()
  const out: Array<{ key: string; data: T; updatedAtMs: number }> = []
  for (const [k, env] of Object.entries(dict)) {
    if (!env || typeof env !== "object") continue
    if (env.expiresAtMs && env.expiresAtMs < now) continue
    out.push({ key: k, data: env.data as T, updatedAtMs: env.updatedAtMs || now })
  }
  return out
}

export async function firebaseKvSetItem(
  mapName: string,
  key: string,
  dataObj: any,
  ttlSeconds?: number
): Promise<boolean> {
  const auth = await getFirebaseAccessToken()
  if (!auth) return false

  const runWrite = async (): Promise<boolean> => {
    const now = Date.now()
    const hasFreshCache =
      globalForFbKv.__connectlnFbMapsCache &&
      globalForFbKv.__connectlnFbLastFetchMs &&
      now - globalForFbKv.__connectlnFbLastFetchMs < 8000
    const maps = hasFreshCache
      ? globalForFbKv.__connectlnFbMapsCache!
      : await pullAllMapsFromFirebase(true)
    const currentMap = pruneExpiredFromMap(maps[mapName] || {}, now)

    currentMap[key] = {
      data: dataObj,
      updatedAtMs: now,
      expiresAtMs: ttlSeconds && ttlSeconds > 0 ? now + ttlSeconds * 1000 : null,
    }
    maps[mapName] = currentMap

    const parameters: Record<string, { defaultValue: { value: string } }> = {}
    for (const [mKey, mDict] of Object.entries(maps)) {
      parameters[mKey] = {
        defaultValue: { value: JSON.stringify(pruneExpiredFromMap(mDict, now)) },
      }
    }

    const url = `https://firebaseremoteconfig.googleapis.com/v1/projects/${auth.projectId}/remoteConfig`
    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
        "If-Match": "*",
      },
      body: JSON.stringify({ parameters }),
      cache: "no-store",
    })
    if (putRes.ok) {
      globalForFbKv.__connectlnFbEtag = putRes.headers.get("etag") || "*"
      globalForFbKv.__connectlnFbLastFetchMs = Date.now()
      return true
    }
    return false
  }

  const prevLock = globalForFbKv.__connectlnFbWriteLock || Promise.resolve()
  let result = false
  const nextLock = prevLock
    .then(async () => {
      result = await runWrite()
    })
    .catch(() => {})
  globalForFbKv.__connectlnFbWriteLock = nextLock
  await nextLock
  return result
}

export async function firebaseKvDeleteItem(mapName: string, key: string): Promise<boolean> {
  const auth = await getFirebaseAccessToken()
  if (!auth) return false

  const runDelete = async (): Promise<boolean> => {
    const now = Date.now()
    const maps = await pullAllMapsFromFirebase(true)
    const currentMap = pruneExpiredFromMap(maps[mapName] || {}, now)
    if (key in currentMap) {
      delete currentMap[key]
    }
    maps[mapName] = currentMap

    const parameters: Record<string, { defaultValue: { value: string } }> = {}
    for (const [mKey, mDict] of Object.entries(maps)) {
      parameters[mKey] = {
        defaultValue: { value: JSON.stringify(pruneExpiredFromMap(mDict, now)) },
      }
    }

    const url = `https://firebaseremoteconfig.googleapis.com/v1/projects/${auth.projectId}/remoteConfig`
    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
        "If-Match": "*",
      },
      body: JSON.stringify({ parameters }),
      cache: "no-store",
    })
    if (putRes.ok) {
      globalForFbKv.__connectlnFbEtag = putRes.headers.get("etag") || "*"
      globalForFbKv.__connectlnFbLastFetchMs = Date.now()
      return true
    }
    return false
  }

  const prevLock = globalForFbKv.__connectlnFbWriteLock || Promise.resolve()
  let result = false
  const nextLock = prevLock
    .then(async () => {
      result = await runDelete()
    })
    .catch(() => {})
  globalForFbKv.__connectlnFbWriteLock = nextLock
  await nextLock
  return result
}
