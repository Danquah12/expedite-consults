import { cert } from "firebase-admin/app"
import { getConnectLnMongoDb, isConnectLnMongoConfigured } from "./connectln-mongodb"

/**
 * ConnectLn Zero-Cost Cloud KV Store (MongoDB Atlas atomic per-key primary + Firebase Remote Config backup)
 * ---------------------------------------------------------------------------------------------------------
 * Persists ConnectLn calling state, directory lookups, Web Push subscriptions, and Android FCM tokens
 * across all Vercel serverless workers atomically per-key in MongoDB (`connectln_kv_items`), falling back
 * to Firebase Project `connectln-2ab9b` when MongoDB is unconfigured.
 */

interface KvEnvelope<T = any> {
  data: T
  updatedAtMs: number
  expiresAtMs?: number | null
}

interface KvMongoDoc {
  _id: string
  mapName: string
  key: string
  data: any
  updatedAtMs: number
  expiresAtMs: number | null
}

type KvMapDict = Record<string, KvEnvelope<any>>

const KV_MONGO_COLLECTION = "connectln_kv_items"

const globalForFbKv = globalThis as unknown as {
  __connectlnFbOAuth?: { token: string; projectId: string; expiresAtMs: number }
  __connectlnFbMapsCache?: Record<string, KvMapDict>
  __connectlnFbEtag?: string
  __connectlnFbLastFetchMs?: number
  __connectlnFbWriteLock?: Promise<void>
  __connectlnKvMongoIndexReady?: boolean
  __connectlnFbDirBackfilled?: boolean
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
    const tok = await Promise.race([
      credential.getAccessToken(),
      new Promise<null>((r) => setTimeout(() => r(null), 3000)),
    ])
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
      signal: AbortSignal.timeout(4000),
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
  const now = Date.now()
  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        const doc = await db.collection<KvMongoDoc>(KV_MONGO_COLLECTION).findOne(
          { _id: `${mapName}::${key}` },
          { readPreference: "primary" }
        )
        if (doc) {
          if (doc.expiresAtMs && doc.expiresAtMs < now) return null
          return (doc.data as T) ?? null
        }
      }
    } catch {
      // Fallback to Firebase below
    }
  }

  const maps = await pullAllMapsFromFirebase()
  const dict = maps[mapName]
  if (!dict) return null
  const env = dict[key]
  if (!env) return null
  if (env.expiresAtMs && env.expiresAtMs < now) return null

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        await db.collection<KvMongoDoc>(KV_MONGO_COLLECTION).updateOne(
          { _id: `${mapName}::${key}` },
          {
            $setOnInsert: {
              mapName,
              key,
              data: env.data,
              updatedAtMs: env.updatedAtMs || now,
              expiresAtMs: env.expiresAtMs ?? null,
            },
          },
          { upsert: true }
        )
      }
    } catch {}
  }

  return (env.data as T) ?? null
}

export async function firebaseKvListItems<T = any>(
  mapName: string,
  forceRefresh = false
): Promise<Array<{ key: string; data: T; updatedAtMs: number }>> {
  const now = Date.now()
  const byKey = new Map<string, { key: string; data: T; updatedAtMs: number }>()
  let mongoLoaded = false

  if (isConnectLnMongoConfigured()) {
    for (let attempt = 0; attempt < 2 && !mongoLoaded; attempt++) {
      try {
        const db = await getConnectLnMongoDb()
        if (db) {
          const docs = await db
            .collection<KvMongoDoc>(KV_MONGO_COLLECTION)
            .find(
              {
                mapName,
                $or: [{ expiresAtMs: null }, { expiresAtMs: { $gt: now } }],
              },
              { readPreference: "primary" }
            )
            .toArray()
          mongoLoaded = true
          for (const doc of docs) {
            if (!doc?.key) continue
            byKey.set(doc.key, {
              key: doc.key,
              data: doc.data as T,
              updatedAtMs: doc.updatedAtMs || now,
            })
          }
        }
      } catch {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 50))
        }
      }
    }
  }

  const shouldBackfillDir =
    mapName === "connectln_whatsapp_directory_v1" && !globalForFbKv.__connectlnFbDirBackfilled
  if (!mongoLoaded || byKey.size === 0 || shouldBackfillDir) {
    if (shouldBackfillDir) {
      globalForFbKv.__connectlnFbDirBackfilled = true
    }
    const maps =
      shouldBackfillDir && mongoLoaded && byKey.size > 0
        ? await Promise.race([
            pullAllMapsFromFirebase(false),
            new Promise<Record<string, KvMapDict>>((r) => setTimeout(() => r({}), 2500)),
          ])
        : await pullAllMapsFromFirebase(forceRefresh)
    const dict = maps[mapName] || {}
    const fbOnlyEntries: Array<{ key: string; env: KvEnvelope<any> }> = []
    for (const [k, env] of Object.entries(dict)) {
      if (!env || typeof env !== "object") continue
      if (env.expiresAtMs && env.expiresAtMs < now) continue
      if (!byKey.has(k)) {
        byKey.set(k, { key: k, data: env.data as T, updatedAtMs: env.updatedAtMs || now })
        if (mongoLoaded && isConnectLnMongoConfigured()) {
          fbOnlyEntries.push({ key: k, env })
        }
      }
    }
    if (fbOnlyEntries.length > 0) {
      void getConnectLnMongoDb()
        .then((mdb) => {
          if (!mdb) return
          return Promise.allSettled(
            fbOnlyEntries.map(({ key, env }) =>
              mdb.collection<KvMongoDoc>(KV_MONGO_COLLECTION).updateOne(
                { _id: `${mapName}::${key}` },
                {
                  $setOnInsert: {
                    mapName,
                    key,
                    data: env.data,
                    updatedAtMs: env.updatedAtMs || now,
                    expiresAtMs: env.expiresAtMs ?? null,
                  },
                },
                { upsert: true }
              )
            )
          )
        })
        .catch(() => {})
    }
  }

  return Array.from(byKey.values())
}

async function writeFirebaseKeyWithFreshPull(
  mapName: string,
  key: string,
  envelope: KvEnvelope<any> | null
): Promise<boolean> {
  const auth = await getFirebaseAccessToken()
  if (!auth) return false

  const runWrite = async (): Promise<boolean> => {
    const now = Date.now()
    const maps = await pullAllMapsFromFirebase(true)
    const currentMap = pruneExpiredFromMap(maps[mapName] || {}, now)
    if (envelope) {
      currentMap[key] = envelope
    } else if (key in currentMap) {
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
      signal: AbortSignal.timeout(4500),
    })
    if (putRes.ok) {
      globalForFbKv.__connectlnFbEtag = putRes.headers.get("etag") || "*"
      globalForFbKv.__connectlnFbMapsCache = maps
      globalForFbKv.__connectlnFbLastFetchMs = Date.now()
      return true
    }
    return false
  }

  const prevLock = globalForFbKv.__connectlnFbWriteLock || Promise.resolve()
  let result = false
  const nextLock = Promise.race([
    prevLock.catch(() => {}),
    new Promise<void>((resolve) => setTimeout(resolve, 6500)),
  ])
    .then(async () => {
      result = await Promise.race([
        runWrite().catch(() => false),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 6000)),
      ])
    })
    .catch(() => {})
    .finally(() => {
      if (globalForFbKv.__connectlnFbWriteLock === nextLock) {
        globalForFbKv.__connectlnFbWriteLock = undefined
      }
    })
  globalForFbKv.__connectlnFbWriteLock = nextLock
  await Promise.race([
    nextLock,
    new Promise<void>((resolve) => setTimeout(resolve, 6500)),
  ])
  return result
}

export async function firebaseKvSetItem(
  mapName: string,
  key: string,
  dataObj: any,
  ttlSeconds?: number
): Promise<boolean> {
  const now = Date.now()
  const expiresAtMs = ttlSeconds && ttlSeconds > 0 ? now + ttlSeconds * 1000 : null
  const envelope: KvEnvelope<any> = {
    data: dataObj,
    updatedAtMs: now,
    expiresAtMs,
  }

  if (!globalForFbKv.__connectlnFbMapsCache) {
    globalForFbKv.__connectlnFbMapsCache = {}
  }
  if (!globalForFbKv.__connectlnFbMapsCache[mapName]) {
    globalForFbKv.__connectlnFbMapsCache[mapName] = {}
  }
  globalForFbKv.__connectlnFbMapsCache[mapName][key] = envelope

  let mongoOk = false
  if (isConnectLnMongoConfigured()) {
    for (let attempt = 0; attempt < 2 && !mongoOk; attempt++) {
      try {
        const db = await getConnectLnMongoDb()
        if (db) {
          if (!globalForFbKv.__connectlnKvMongoIndexReady) {
            globalForFbKv.__connectlnKvMongoIndexReady = true
            db.collection<KvMongoDoc>(KV_MONGO_COLLECTION)
              .createIndex({ mapName: 1, expiresAtMs: 1 }, { background: true })
              .catch(() => {
                globalForFbKv.__connectlnKvMongoIndexReady = false
              })
          }
          await db.collection<KvMongoDoc>(KV_MONGO_COLLECTION).updateOne(
            { _id: `${mapName}::${key}` },
            {
              $set: {
                mapName,
                key,
                data: dataObj,
                updatedAtMs: now,
                expiresAtMs,
              },
            },
            { upsert: true }
          )
          mongoOk = true
        }
      } catch {
        mongoOk = false
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 50))
        }
      }
    }
  }

  if (!mongoOk) {
    const fbOk = await writeFirebaseKeyWithFreshPull(mapName, key, envelope)
    return mongoOk || fbOk
  }

  return true
}

export async function firebaseKvDeleteItem(mapName: string, key: string): Promise<boolean> {
  if (globalForFbKv.__connectlnFbMapsCache?.[mapName]) {
    delete globalForFbKv.__connectlnFbMapsCache[mapName][key]
  }

  let mongoOk = false
  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        await db.collection<KvMongoDoc>(KV_MONGO_COLLECTION).deleteOne({
          _id: `${mapName}::${key}`,
        })
        mongoOk = true
      }
    } catch {
      mongoOk = false
    }
  }

  if (!mongoOk) {
    const fbOk = await writeFirebaseKeyWithFreshPull(mapName, key, null)
    return mongoOk || fbOk
  }

  return true
}
