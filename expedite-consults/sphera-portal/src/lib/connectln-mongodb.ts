import { Db, MongoClient, MongoClientOptions } from "mongodb"
import type { CategorizedNotificationItem } from "./notifications-engine-data"

interface ConnectLnMongoGlobalCache {
  __connectlnMongoPromise?: Promise<MongoClient> | null
  __connectlnMongoUri?: string
  __connectlnMongoIndexesReady?: boolean
}

const g = globalThis as unknown as ConnectLnMongoGlobalCache

/**
 * Serverless Connection Pool Configuration for Vercel Functions (iad1) -> MongoDB Atlas M0 (iad1).
 *
 * Rationale per parameter (following MongoDB Serverless Connection Guidelines):
 * - maxPoolSize: 5 — Each warm Vercel serverless function instance maintains its own pool;
 *   (5 + 2 monitoring) * 3 replica set members = 21 sockets/instance, keeping burst concurrency
 *   safely within the Atlas M0 500-connection ceiling.
 * - minPoolSize: 0 — Allows idle function instances to scale down to 0 open sockets (~1 MB RAM/conn on Atlas).
 * - maxIdleTimeMS: 20_000 — Releases idle pooled sockets after 20s between request bursts (10-30s serverless window).
 * - connectTimeoutMS: 5_000 — Same-region (iad1 -> iad1) TCP+TLS handshakes complete in <100ms; 5s fails fast.
 * - socketTimeoutMS: 25_000 — Ensures short OLTP document reads/upserts never hang sockets indefinitely.
 * - serverSelectionTimeoutMS: 5_000 — Fast replica-set primary election / failover detection.
 */
const SERVERLESS_MONGO_OPTIONS: MongoClientOptions = {
  appName: "connectln-alerts-platform",
  maxPoolSize: 5,
  minPoolSize: 0,
  maxIdleTimeMS: 20_000,
  connectTimeoutMS: 5_000,
  socketTimeoutMS: 25_000,
  serverSelectionTimeoutMS: 5_000,
}

export function isConnectLnMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().startsWith("mongodb"))
}

export async function getConnectLnMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri || !uri.startsWith("mongodb")) {
    return null
  }

  // Initialize MongoClient outside handler scope on globalThis for serverless reuse
  if (!g.__connectlnMongoPromise || g.__connectlnMongoUri !== uri) {
    const client = new MongoClient(uri, SERVERLESS_MONGO_OPTIONS)
    g.__connectlnMongoUri = uri
    g.__connectlnMongoPromise = client.connect().catch((err) => {
      g.__connectlnMongoPromise = null
      throw err
    })
  }

  const client = await g.__connectlnMongoPromise
  const dbName = (process.env.MONGODB_DB_NAME || "connectln").trim()
  const db = client.db(dbName)

  if (!g.__connectlnMongoIndexesReady) {
    g.__connectlnMongoIndexesReady = true
    Promise.all([
      db
        .collection("connectln_alerts")
        .createIndex({ category: 1, priority: 1, syncedAt: -1 }, { background: true }),
      db
        .collection("connectln_posts")
        .createIndex({ createdAt: -1 }, { background: true }),
      db
        .collection("connectln_admin_users")
        .createIndex({ email: 1 }, { background: true }),
      db
        .collection("connectln_admin_audit_logs")
        .createIndex({ syncedAt: -1 }, { background: true }),
      db
        .collection("connectln_admin_activity_logs")
        .createIndex({ timestampMs: -1 }, { background: true }),
    ]).catch(() => {
      g.__connectlnMongoIndexesReady = false
    })
  }

  return db
}

/**
 * Syncs the current 24-hour additive alerts schedule + custom dispatched alerts into MongoDB Atlas
 * (`connectln.connectln_alerts`) and returns the merged authoritative alert stream.
 */
export async function syncAndLoadConnectLnAlertsFromMongo(
  scheduledAlerts: CategorizedNotificationItem[],
  localMemoryAlerts: CategorizedNotificationItem[] = []
): Promise<{
  alerts: CategorizedNotificationItem[]
  mongoConnected: boolean
  databaseName: string
  storedCount: number
}> {
  const dbName = (process.env.MONGODB_DB_NAME || "connectln").trim()
  const combinedSeed = [
    ...localMemoryAlerts,
    ...scheduledAlerts.filter((s) => !localMemoryAlerts.some((m) => m.id === s.id)),
  ]

  if (!isConnectLnMongoConfigured()) {
    return {
      alerts: combinedSeed,
      mongoConnected: false,
      databaseName: dbName,
      storedCount: 0,
    }
  }

  try {
    const db = await getConnectLnMongoDb()
    if (!db) {
      return {
        alerts: combinedSeed,
        mongoConnected: false,
        databaseName: dbName,
        storedCount: 0,
      }
    }

    const col = db.collection<CategorizedNotificationItem & { _id: string; syncedAt: string }>(
      "connectln_alerts"
    )

    // Upsert all active 24h scheduled & dispatched alerts (strictly additive — never deletes prior cycles)
    if (combinedSeed.length > 0) {
      const nowIso = new Date().toISOString()
      const ops = combinedSeed.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: {
            $set: {
              ...item,
              _id: item.id,
              syncedAt: nowIso,
            },
          },
          upsert: true,
        },
      }))
      await col.bulkWrite(ops, { ordered: false })
    }

    const mongoDocs = await col.find({}).limit(200).toArray()
    const mongoMap = new Map<string, CategorizedNotificationItem>()
    for (const doc of mongoDocs) {
      const { _id, syncedAt, ...rest } = doc as any
      mongoMap.set(rest.id || _id, rest as CategorizedNotificationItem)
    }

    // Preserve ordering: newest 24h scheduled/dispatched alerts first, followed by any historical MongoDB alerts
    const orderedIds = new Set<string>()
    const merged: CategorizedNotificationItem[] = []
    for (const item of combinedSeed) {
      orderedIds.add(item.id)
      merged.push(mongoMap.get(item.id) || item)
    }
    for (const [id, docItem] of mongoMap.entries()) {
      if (!orderedIds.has(id)) {
        orderedIds.add(id)
        merged.push(docItem)
      }
    }

    return {
      alerts: merged,
      mongoConnected: true,
      databaseName: dbName,
      storedCount: merged.length,
    }
  } catch {
    return {
      alerts: combinedSeed,
      mongoConnected: false,
      databaseName: dbName,
      storedCount: 0,
    }
  }
}

export async function insertConnectLnAlertToMongo(
  alert: CategorizedNotificationItem
): Promise<boolean> {
  if (!isConnectLnMongoConfigured()) return false
  try {
    const db = await getConnectLnMongoDb()
    if (!db) return false
    const col = db.collection<CategorizedNotificationItem & { _id: string; syncedAt: string }>(
      "connectln_alerts"
    )
    await col.updateOne(
      { _id: alert.id },
      {
        $set: {
          ...alert,
          _id: alert.id,
          syncedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    )
    return true
  } catch {
    return false
  }
}

async function syncAdminCollectionDocs<T extends Record<string, any>>(
  db: Db,
  collectionName: string,
  items: T[],
  keyFn: (item: T, idx: number) => string,
  readLimit = 250
): Promise<T[]> {
  const col = db.collection<Record<string, any>>(collectionName)
  const nowIso = new Date().toISOString()

  if (items.length > 0) {
    const ops = items.map((item, idx) => {
      const docId = keyFn(item, idx)
      return {
        updateOne: {
          filter: { _id: docId as any },
          update: {
            $set: {
              ...item,
              _id: docId,
              syncedAt: nowIso,
            },
          },
          upsert: true,
        },
      }
    })
    await col.bulkWrite(ops, { ordered: false })
  }

  const mongoDocs = await col.find({}).limit(readLimit).toArray()
  const mongoMap = new Map<string, T>()
  for (const doc of mongoDocs) {
    const { _id, syncedAt, ...rest } = doc as Record<string, any>
    const key = String(_id || rest.id || rest.phone || rest.email || '')
    if (key) mongoMap.set(key, rest as T)
  }

  const seenKeys = new Set<string>()
  const merged: T[] = []
  items.forEach((item, idx) => {
    const key = keyFn(item, idx)
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      merged.push(item)
    }
  })
  for (const [key, docItem] of mongoMap.entries()) {
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      merged.push(docItem)
    }
  }
  return merged
}

export interface ConnectLnAdminMongoPayload<
  U extends Record<string, any> = any,
  P extends Record<string, any> = any,
  V extends Record<string, any> = any,
  A extends Record<string, any> = any,
  L extends Record<string, any> = any,
> {
  users: U[]
  registeredPhones: P[]
  verifications: V[]
  auditLogs: A[]
  activityLogs: L[]
}

/**
 * Syncs and reads ConnectLn Admin Console collections (users, calling phones,
 * verifications, audit logs, and activity logs) with MongoDB Atlas when MONGODB_URI is set.
 */
export async function syncAndLoadConnectLnAdminFromMongo<
  U extends Record<string, any>,
  P extends Record<string, any>,
  V extends Record<string, any>,
  A extends Record<string, any>,
  L extends Record<string, any>,
>(
  payload: ConnectLnAdminMongoPayload<U, P, V, A, L>
): Promise<
  ConnectLnAdminMongoPayload<U, P, V, A, L> & {
    mongoConnected: boolean
    databaseName: string
  }
> {
  const dbName = (process.env.MONGODB_DB_NAME || "connectln").trim()
  if (!isConnectLnMongoConfigured()) {
    return {
      ...payload,
      mongoConnected: false,
      databaseName: dbName,
    }
  }

  try {
    const db = await getConnectLnMongoDb()
    if (!db) {
      return {
        ...payload,
        mongoConnected: false,
        databaseName: dbName,
      }
    }

    const [users, registeredPhones, verifications, auditLogs, activityLogs] = await Promise.all([
      syncAdminCollectionDocs(
        db,
        "connectln_admin_users",
        payload.users,
        (u, idx) => String(u.id || u.email || `user_${idx}`).toLowerCase()
      ),
      syncAdminCollectionDocs(
        db,
        "connectln_admin_phones",
        payload.registeredPhones,
        (p, idx) => String(p.phone || p.email || `phone_${idx}`)
      ),
      syncAdminCollectionDocs(
        db,
        "connectln_admin_verifications",
        payload.verifications,
        (v, idx) => String(v.id || v.email || `ver_${idx}`)
      ),
      syncAdminCollectionDocs(
        db,
        "connectln_admin_audit_logs",
        payload.auditLogs,
        (a, idx) => String(a.id || `audit_${idx}`)
      ),
      syncAdminCollectionDocs(
        db,
        "connectln_admin_activity_logs",
        payload.activityLogs.slice(0, 100),
        (l, idx) => String(l.id || `${l.timestampMs || idx}_${l.actorEmail || 'act'}`),
        200
      ),
    ])

    return {
      users,
      registeredPhones,
      verifications,
      auditLogs,
      activityLogs,
      mongoConnected: true,
      databaseName: dbName,
    }
  } catch {
    return {
      ...payload,
      mongoConnected: false,
      databaseName: dbName,
    }
  }
}

/** Upserts a single Admin action audit entry into MongoDB Atlas (`connectln_admin_audit_logs`). */
export async function insertConnectLnAdminAuditToMongo(auditEntry: Record<string, any>): Promise<boolean> {
  if (!isConnectLnMongoConfigured()) return false
  try {
    const db = await getConnectLnMongoDb()
    if (!db) return false
    const col = db.collection<Record<string, any>>("connectln_admin_audit_logs")
    const docId = String(auditEntry?.id || `LOG-${Date.now()}`)
    await col.updateOne(
      { _id: docId as any },
      {
        $set: {
          ...auditEntry,
          _id: docId,
          syncedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    )
    return true
  } catch {
    return false
  }
}
