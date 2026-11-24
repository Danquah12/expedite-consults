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
        .collection("connectln_posts")
        .createIndex({ createdAtMs: -1 }, { background: true }),
      db
        .collection("connectln_post_interactions")
        .createIndex({ updatedAtMs: -1 }, { background: true }),
      db
        .collection("connectln_learning_videos")
        .createIndex({ category: 1, syncedAtMs: -1 }, { background: true }),
      db
        .collection("connectln_learning_videos")
        .createIndex({ youtubeId: 1 }, { unique: true, sparse: true, background: true }),
      db
        .collection("connectln_creator_video_chunks")
        .createIndex({ uploadId: 1, chunkIndex: 1 }, { unique: true, background: true }),
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

// =====================================================================
// PERSISTENT CROSS-USER FEED POSTS, COMMENTS & REACTIONS (MONGODB ATLAS)
// =====================================================================

export type FeedReactionKind = "like" | "celebrate" | "support" | "love" | "insightful" | "funny"

const VALID_FEED_REACTIONS = new Set<FeedReactionKind>([
  "like",
  "celebrate",
  "support",
  "love",
  "insightful",
  "funny",
])

export interface PersistedPostComment {
  id: string
  author: {
    name: string
    headline: string
    avatar: string
    email?: string
    connectionDegree: "1st" | "2nd" | "3rd" | "Following" | "You"
  }
  content: string
  timestamp: string
  createdAtMs: number
  likesCount: number
  replies?: PersistedPostComment[]
}

export interface PersistedPostInteractionDoc {
  postId: string
  reactionsByUser: Record<string, FeedReactionKind>
  comments: PersistedPostComment[]
  repliesByParentId: Record<string, PersistedPostComment[]>
  commentLikesById: Record<string, string[]>
  updatedAtMs: number
}

const FB_SHARED_POSTS_MAP = "connectln_shared_posts_v1"
const FB_POST_INTERACTIONS_MAP = "connectln_post_interactions_v1"

/** Converts a user identifier (email/id/name) into a MongoDB dot-safe field key. */
export function encodeMongoUserKey(raw: string): string {
  const clean = String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 96)
  return clean || "member"
}

/** Sanitizes a comment/parent ID so it never contains `.` or `$` inside MongoDB update paths. */
export function sanitizeMongoMapKey(raw: string): string {
  const clean = String(raw || "")
    .trim()
    .replace(/[.$]/g, "_")
    .slice(0, 120)
  return clean || "item"
}

function safeAvatarForCloud(rawAvatar: unknown, displayName: string): string {
  const s = typeof rawAvatar === "string" ? rawAvatar.trim() : ""
  if (s && (!s.startsWith("data:") || s.length <= 180_000)) {
    return s
  }
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    displayName || "ConnectLn Member"
  )}&backgroundColor=0a66c2`
}

function normalizeInteractionDoc(
  raw: Record<string, any> | null | undefined,
  postId: string
): PersistedPostInteractionDoc {
  const rawReactions =
    raw?.reactionsByUser && typeof raw.reactionsByUser === "object"
      ? raw.reactionsByUser
      : {}
  const reactionsByUser: Record<string, FeedReactionKind> = {}
  for (const [k, v] of Object.entries(rawReactions)) {
    if (typeof v === "string" && VALID_FEED_REACTIONS.has(v as FeedReactionKind)) {
      reactionsByUser[k] = v as FeedReactionKind
    }
  }

  const rawReplies =
    raw?.repliesByParentId && typeof raw.repliesByParentId === "object"
      ? raw.repliesByParentId
      : {}
  const repliesByParentId: Record<string, PersistedPostComment[]> = {}
  for (const [k, list] of Object.entries(rawReplies)) {
    if (Array.isArray(list)) {
      repliesByParentId[k] = list as PersistedPostComment[]
    }
  }

  const rawCommentLikes =
    raw?.commentLikesById && typeof raw.commentLikesById === "object"
      ? raw.commentLikesById
      : {}
  const commentLikesById: Record<string, string[]> = {}
  for (const [k, list] of Object.entries(rawCommentLikes)) {
    if (Array.isArray(list)) {
      commentLikesById[k] = list.map((x) => String(x)).filter(Boolean)
    }
  }

  return {
    postId: String(raw?.postId || raw?._id || postId),
    reactionsByUser,
    comments: Array.isArray(raw?.comments) ? (raw.comments as PersistedPostComment[]) : [],
    repliesByParentId,
    commentLikesById,
    updatedAtMs: Number(raw?.updatedAtMs || 0),
  }
}

export async function listConnectLnSharedPostsAndInteractions(): Promise<{
  posts: Record<string, any>[]
  interactions: Record<string, PersistedPostInteractionDoc>
  mongoConnected: boolean
}> {
  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        const [postDocs, interactionDocs] = await Promise.all([
          db
            .collection<Record<string, any>>("connectln_posts")
            .find({})
            .sort({ createdAtMs: -1 })
            .limit(150)
            .toArray(),
          db
            .collection<Record<string, any>>("connectln_post_interactions")
            .find({})
            .sort({ updatedAtMs: -1 })
            .limit(400)
            .toArray(),
        ])

        const posts = postDocs.map((doc) => {
          const { _id, ...rest } = doc
          return {
            ...rest,
            id: String(rest.id || _id || ""),
            isCloudSharedPost: true,
          }
        })

        const interactions: Record<string, PersistedPostInteractionDoc> = {}
        for (const doc of interactionDocs) {
          const pid = String(doc.postId || doc._id || "").trim()
          if (!pid) continue
          interactions[pid] = normalizeInteractionDoc(doc, pid)
        }

        return { posts, interactions, mongoConnected: true }
      }
    } catch (err) {
      console.warn("[connectln-mongodb] listConnectLnSharedPostsAndInteractions fallback:", (err as any)?.message)
    }
  }

  try {
    const { firebaseKvListItems } = await import("./connectin-firebase-kv")
    const [postEntries, interactionEntries] = await Promise.all([
      firebaseKvListItems<Record<string, any>>(FB_SHARED_POSTS_MAP, false),
      firebaseKvListItems<PersistedPostInteractionDoc>(FB_POST_INTERACTIONS_MAP, false),
    ])
    const posts = postEntries
      .map((e) => e?.data)
      .filter((p) => p && typeof p.id === "string")
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0))
      .slice(0, 150)
      .map((p) => ({ ...p, isCloudSharedPost: true }))

    const interactions: Record<string, PersistedPostInteractionDoc> = {}
    for (const entry of interactionEntries) {
      const pid = String(entry?.data?.postId || entry?.key || "").trim()
      if (!pid || !entry?.data) continue
      interactions[pid] = normalizeInteractionDoc(entry.data, pid)
    }
    return { posts, interactions, mongoConnected: false }
  } catch {
    return { posts: [], interactions: {}, mongoConnected: false }
  }
}

export async function upsertConnectLnSharedPost(
  postDoc: Record<string, any>
): Promise<{ ok: boolean; post: Record<string, any>; mongoConnected: boolean }> {
  const nowMs = Date.now()
  const authorName = String(postDoc?.author?.name || postDoc?.authorName || "ConnectLn Member").trim()
  const authorEmail =
    postDoc?.authorEmail ||
    postDoc?.author?.email ||
    undefined
  const sanitizedPost: Record<string, any> = {
    ...postDoc,
    id: String(postDoc?.id || `user_post_${nowMs}`),
    isUserCreated: true,
    isCloudSharedPost: true,
    authorEmail: authorEmail ? String(authorEmail).trim().toLowerCase() : undefined,
    createdAtMs: Number(postDoc?.createdAtMs || nowMs),
    author: {
      ...(postDoc?.author || {}),
      id: String(postDoc?.author?.id || postDoc?.authorId || `USR-${nowMs}`),
      name: authorName,
      headline: String(postDoc?.author?.headline || postDoc?.authorHeadline || "ConnectLn Professional"),
      avatar: safeAvatarForCloud(postDoc?.author?.avatar ?? postDoc?.authorAvatar, authorName),
      email: authorEmail ? String(authorEmail).trim().toLowerCase() : undefined,
      connectionDegree: "1st",
    },
  }

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        await db.collection<Record<string, any>>("connectln_posts").updateOne(
          { _id: sanitizedPost.id as any },
          { $set: { ...sanitizedPost, _id: sanitizedPost.id, syncedAt: new Date(nowMs).toISOString() } },
          { upsert: true }
        )
        return { ok: true, post: sanitizedPost, mongoConnected: true }
      }
    } catch (err) {
      console.warn("[connectln-mongodb] upsertConnectLnSharedPost fallback:", (err as any)?.message)
    }
  }

  try {
    const { firebaseKvSetItem } = await import("./connectin-firebase-kv")
    const ok = await firebaseKvSetItem(FB_SHARED_POSTS_MAP, sanitizedPost.id, sanitizedPost)
    return { ok, post: sanitizedPost, mongoConnected: false }
  } catch {
    return { ok: false, post: sanitizedPost, mongoConnected: false }
  }
}

export async function deleteConnectLnSharedPost(postId: string): Promise<boolean> {
  const pid = String(postId || "").trim()
  if (!pid) return false

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        await db.collection<Record<string, any>>("connectln_posts").deleteOne({ _id: pid as any })
        return true
      }
    } catch {}
  }

  try {
    const { firebaseKvDeleteItem } = await import("./connectin-firebase-kv")
    return await firebaseKvDeleteItem(FB_SHARED_POSTS_MAP, pid)
  } catch {
    return false
  }
}

export async function toggleConnectLnPostReaction(params: {
  postId: string
  userKey: string
  reaction: FeedReactionKind | null
}): Promise<{ interaction: PersistedPostInteractionDoc; mongoConnected: boolean }> {
  const pid = String(params.postId || "").trim()
  const safeUserKey = encodeMongoUserKey(params.userKey)
  const validReaction =
    params.reaction && VALID_FEED_REACTIONS.has(params.reaction) ? params.reaction : null
  const nowMs = Date.now()

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        const col = db.collection<Record<string, any>>("connectln_post_interactions")
        if (validReaction) {
          await col.updateOne(
            { _id: pid as any },
            {
              $set: {
                postId: pid,
                [`reactionsByUser.${safeUserKey}`]: validReaction,
                updatedAtMs: nowMs,
              },
              $setOnInsert: {
                comments: [],
                repliesByParentId: {},
                commentLikesById: {},
              },
            },
            { upsert: true }
          )
        } else {
          await col.updateOne(
            { _id: pid as any },
            {
              $unset: { [`reactionsByUser.${safeUserKey}`]: "" },
              $set: { postId: pid, updatedAtMs: nowMs },
              $setOnInsert: {
                comments: [],
                repliesByParentId: {},
                commentLikesById: {},
              },
            },
            { upsert: true }
          )
        }
        const doc = await col.findOne({ _id: pid as any })
        return { interaction: normalizeInteractionDoc(doc, pid), mongoConnected: true }
      }
    } catch (err) {
      console.warn("[connectln-mongodb] toggleConnectLnPostReaction fallback:", (err as any)?.message)
    }
  }

  try {
    const { firebaseKvGetItem, firebaseKvSetItem } = await import("./connectin-firebase-kv")
    const existing = await firebaseKvGetItem<PersistedPostInteractionDoc>(FB_POST_INTERACTIONS_MAP, pid)
    const base = normalizeInteractionDoc(existing, pid)
    if (validReaction) {
      base.reactionsByUser[safeUserKey] = validReaction
    } else {
      delete base.reactionsByUser[safeUserKey]
    }
    base.updatedAtMs = nowMs
    await firebaseKvSetItem(FB_POST_INTERACTIONS_MAP, pid, base)
    return { interaction: base, mongoConnected: false }
  } catch {
    return { interaction: normalizeInteractionDoc(null, pid), mongoConnected: false }
  }
}

export async function addConnectLnPostComment(params: {
  postId: string
  comment: PersistedPostComment
  parentCommentId?: string
}): Promise<{ interaction: PersistedPostInteractionDoc; mongoConnected: boolean }> {
  const pid = String(params.postId || "").trim()
  const nowMs = Date.now()
  const cleanComment: PersistedPostComment = {
    ...params.comment,
    author: {
      ...params.comment.author,
      avatar: safeAvatarForCloud(params.comment.author?.avatar, params.comment.author?.name || "Member"),
      connectionDegree: "1st",
    },
  }
  const safeParent = params.parentCommentId ? sanitizeMongoMapKey(params.parentCommentId) : ""

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        const col = db.collection<Record<string, any>>("connectln_post_interactions")
        if (safeParent) {
          await col.updateOne(
            { _id: pid as any },
            {
              $push: { [`repliesByParentId.${safeParent}`]: { $each: [cleanComment], $slice: -100 } },
              $set: { postId: pid, updatedAtMs: nowMs },
              $setOnInsert: {
                reactionsByUser: {},
                comments: [],
                commentLikesById: {},
              },
            },
            { upsert: true }
          )
        } else {
          await col.updateOne(
            { _id: pid as any },
            {
              $push: { comments: { $each: [cleanComment], $position: 0, $slice: 200 } },
              $set: { postId: pid, updatedAtMs: nowMs },
              $setOnInsert: {
                reactionsByUser: {},
                repliesByParentId: {},
                commentLikesById: {},
              },
            },
            { upsert: true }
          )
        }
        const doc = await col.findOne({ _id: pid as any })
        return { interaction: normalizeInteractionDoc(doc, pid), mongoConnected: true }
      }
    } catch (err) {
      console.warn("[connectln-mongodb] addConnectLnPostComment fallback:", (err as any)?.message)
    }
  }

  try {
    const { firebaseKvGetItem, firebaseKvSetItem } = await import("./connectin-firebase-kv")
    const existing = await firebaseKvGetItem<PersistedPostInteractionDoc>(FB_POST_INTERACTIONS_MAP, pid)
    const base = normalizeInteractionDoc(existing, pid)
    if (safeParent) {
      const list = Array.isArray(base.repliesByParentId[safeParent])
        ? [...base.repliesByParentId[safeParent]]
        : []
      list.push(cleanComment)
      base.repliesByParentId[safeParent] = list.slice(-100)
    } else {
      base.comments = [cleanComment, ...base.comments].slice(0, 200)
    }
    base.updatedAtMs = nowMs
    await firebaseKvSetItem(FB_POST_INTERACTIONS_MAP, pid, base)
    return { interaction: base, mongoConnected: false }
  } catch {
    return { interaction: normalizeInteractionDoc(null, pid), mongoConnected: false }
  }
}

export async function toggleConnectLnCommentLike(params: {
  postId: string
  commentId: string
  userKey: string
}): Promise<{ interaction: PersistedPostInteractionDoc; mongoConnected: boolean }> {
  const pid = String(params.postId || "").trim()
  const safeCommentId = sanitizeMongoMapKey(params.commentId)
  const safeUserKey = encodeMongoUserKey(params.userKey)
  const nowMs = Date.now()

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        const col = db.collection<Record<string, any>>("connectln_post_interactions")
        const existingDoc = await col.findOne({ _id: pid as any })
        const existing = normalizeInteractionDoc(existingDoc, pid)
        const current = Array.isArray(existing.commentLikesById[safeCommentId])
          ? [...existing.commentLikesById[safeCommentId]]
          : []
        const idx = current.indexOf(safeUserKey)
        if (idx >= 0) {
          current.splice(idx, 1)
        } else {
          current.push(safeUserKey)
        }
        await col.updateOne(
          { _id: pid as any },
          {
            $set: {
              postId: pid,
              [`commentLikesById.${safeCommentId}`]: current,
              updatedAtMs: nowMs,
            },
            $setOnInsert: {
              reactionsByUser: {},
              comments: [],
              repliesByParentId: {},
            },
          },
          { upsert: true }
        )
        const doc = await col.findOne({ _id: pid as any })
        return { interaction: normalizeInteractionDoc(doc, pid), mongoConnected: true }
      }
    } catch (err) {
      console.warn("[connectln-mongodb] toggleConnectLnCommentLike fallback:", (err as any)?.message)
    }
  }

  try {
    const { firebaseKvGetItem, firebaseKvSetItem } = await import("./connectin-firebase-kv")
    const existing = await firebaseKvGetItem<PersistedPostInteractionDoc>(FB_POST_INTERACTIONS_MAP, pid)
    const base = normalizeInteractionDoc(existing, pid)
    const current = Array.isArray(base.commentLikesById[safeCommentId])
      ? [...base.commentLikesById[safeCommentId]]
      : []
    const idx = current.indexOf(safeUserKey)
    if (idx >= 0) {
      current.splice(idx, 1)
    } else {
      current.push(safeUserKey)
    }
    base.commentLikesById[safeCommentId] = current
    base.updatedAtMs = nowMs
    await firebaseKvSetItem(FB_POST_INTERACTIONS_MAP, pid, base)
    return { interaction: base, mongoConnected: false }
  } catch {
    return { interaction: normalizeInteractionDoc(null, pid), mongoConnected: false }
  }
}
