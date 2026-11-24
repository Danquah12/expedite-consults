import {
  encodeMongoUserKey,
  getConnectLnMongoDb,
  isConnectLnMongoConfigured,
  safeAvatarForCloud,
} from "./connectln-mongodb"
import { firebaseKvGetItem, firebaseKvSetItem } from "./connectin-firebase-kv"

export interface LessonTimestampNote {
  id: string
  timeSeconds: number
  text: string
  createdAtIso: string
}

export interface LessonQaReply {
  id: string
  authorName: string
  authorRole: string
  authorAvatar: string
  text: string
  createdAtIso: string
}

export interface LessonQaItem {
  id: string
  authorName: string
  authorRole: string
  authorAvatar: string
  question: string
  createdAtIso: string
  replies: LessonQaReply[]
}

export type RegionalTipCode = "US / NEC" | "UK / EU" | "Africa / ECOWAS" | "Global Metric"

export interface LessonRegionalTip {
  id: string
  region: RegionalTipCode
  title: string
  detail: string
  authorName: string
  createdAtIso: string
}

export interface LessonProofOfWork {
  id: string
  authorKey: string
  authorName: string
  authorHeadline: string
  authorAvatar: string
  notes: string
  photoDataUrl?: string
  lessonTitle: string
  category: string
  vouchedByUserKeys: string[]
  feedPostId?: string
  createdAtIso: string
}

export type CredentialTier = "Apprentice" | "Practitioner" | "Master-Ready"

export interface LessonSkillCredential {
  id: string
  userKey: string
  holderName: string
  lessonId: string
  lessonTitle: string
  category: string
  tier: CredentialTier
  vouchCount: number
  issuedAtIso: string
}

export interface LessonMentorRequest {
  id: string
  requesterKey: string
  requesterName: string
  channel: "audio" | "video" | "message"
  question: string
  category: string
  createdAtIso: string
}

export interface PersistedLessonWorkspaceDoc {
  lessonId: string
  notesByUser: Record<string, LessonTimestampNote[]>
  qaItems: LessonQaItem[]
  regionalTips: LessonRegionalTip[]
  proofsOfWork: LessonProofOfWork[]
  credentials: LessonSkillCredential[]
  mentorRequests: LessonMentorRequest[]
  updatedAtMs: number
}

export interface LessonWorkspaceClientPayload {
  lessonId: string
  notes: LessonTimestampNote[]
  qaItems: LessonQaItem[]
  regionalTips: LessonRegionalTip[]
  proofsOfWork: LessonProofOfWork[]
  credentials: LessonSkillCredential[]
  mentorRequestsCount: number
  mongoConnected: boolean
}

const COLLECTION_NAME = "connectln_lesson_workspace"
const FB_WORKSPACE_MAP = "connectln_lesson_workspace_v1"
const MAX_PROOF_PHOTO_CHARS = 240_000

function normalizeLessonId(raw: string): string {
  const clean = String(raw || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 120)
  return clean || "lesson_default"
}

function emptyWorkspaceDoc(lessonId: string): PersistedLessonWorkspaceDoc {
  return {
    lessonId,
    notesByUser: {},
    qaItems: [],
    regionalTips: [],
    proofsOfWork: [],
    credentials: [],
    mentorRequests: [],
    updatedAtMs: 0,
  }
}

function normalizeWorkspaceDoc(
  raw: Record<string, any> | null | undefined,
  lessonId: string
): PersistedLessonWorkspaceDoc {
  const rawNotesMap =
    raw?.notesByUser && typeof raw.notesByUser === "object" ? raw.notesByUser : {}
  const notesByUser: Record<string, LessonTimestampNote[]> = {}
  for (const [k, v] of Object.entries(rawNotesMap)) {
    if (Array.isArray(v)) {
      notesByUser[k] = v as LessonTimestampNote[]
    }
  }

  return {
    lessonId: String(raw?.lessonId || raw?._id || lessonId),
    notesByUser,
    qaItems: Array.isArray(raw?.qaItems) ? (raw.qaItems as LessonQaItem[]) : [],
    regionalTips: Array.isArray(raw?.regionalTips)
      ? (raw.regionalTips as LessonRegionalTip[])
      : [],
    proofsOfWork: Array.isArray(raw?.proofsOfWork)
      ? (raw.proofsOfWork as LessonProofOfWork[])
      : [],
    credentials: Array.isArray(raw?.credentials)
      ? (raw.credentials as LessonSkillCredential[])
      : [],
    mentorRequests: Array.isArray(raw?.mentorRequests)
      ? (raw.mentorRequests as LessonMentorRequest[])
      : [],
    updatedAtMs: Number(raw?.updatedAtMs || 0),
  }
}

function toClientPayload(
  doc: PersistedLessonWorkspaceDoc,
  userKey: string,
  mongoConnected: boolean
): LessonWorkspaceClientPayload {
  const safeKey = encodeMongoUserKey(userKey)
  const rawNotes = doc.notesByUser[safeKey] || []
  const sortedNotes = [...rawNotes].sort((a, b) => a.timeSeconds - b.timeSeconds)

  return {
    lessonId: doc.lessonId,
    notes: sortedNotes,
    qaItems: doc.qaItems,
    regionalTips: doc.regionalTips,
    proofsOfWork: doc.proofsOfWork,
    credentials: doc.credentials,
    mentorRequestsCount: doc.mentorRequests.length,
    mongoConnected,
  }
}

async function mutateWorkspaceDoc(
  rawLessonId: string,
  userKey: string,
  mutator: (doc: PersistedLessonWorkspaceDoc) => void
): Promise<LessonWorkspaceClientPayload> {
  const lessonId = normalizeLessonId(rawLessonId)
  const nowMs = Date.now()

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        const col = db.collection<Record<string, any>>(COLLECTION_NAME)
        const existingRaw = await col.findOne({ _id: lessonId as any })
        const doc = normalizeWorkspaceDoc(existingRaw, lessonId)
        mutator(doc)
        doc.updatedAtMs = nowMs
        await col.updateOne(
          { _id: lessonId as any },
          { $set: { ...doc, _id: lessonId } },
          { upsert: true }
        )
        return toClientPayload(doc, userKey, true)
      }
    } catch (err) {
      console.warn(
        "[connectln-learning-workspace] Mongo write fallback:",
        (err as any)?.message
      )
    }
  }

  try {
    const existingRaw = await firebaseKvGetItem<Record<string, any>>(
      FB_WORKSPACE_MAP,
      lessonId
    )
    const doc = normalizeWorkspaceDoc(existingRaw, lessonId)
    mutator(doc)
    doc.updatedAtMs = nowMs
    await firebaseKvSetItem(FB_WORKSPACE_MAP, lessonId, doc)
    return toClientPayload(doc, userKey, false)
  } catch {
    return toClientPayload(emptyWorkspaceDoc(lessonId), userKey, false)
  }
}

export async function getLessonWorkspace(
  rawLessonId: string,
  userKey: string
): Promise<LessonWorkspaceClientPayload> {
  const lessonId = normalizeLessonId(rawLessonId)

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        const docRaw = await db
          .collection<Record<string, any>>(COLLECTION_NAME)
          .findOne({ _id: lessonId as any })
        return toClientPayload(
          normalizeWorkspaceDoc(docRaw, lessonId),
          userKey,
          true
        )
      }
    } catch (err) {
      console.warn(
        "[connectln-learning-workspace] Mongo read fallback:",
        (err as any)?.message
      )
    }
  }

  try {
    const existingRaw = await firebaseKvGetItem<Record<string, any>>(
      FB_WORKSPACE_MAP,
      lessonId
    )
    return toClientPayload(
      normalizeWorkspaceDoc(existingRaw, lessonId),
      userKey,
      false
    )
  } catch {
    return toClientPayload(emptyWorkspaceDoc(lessonId), userKey, false)
  }
}

export async function addLessonNote(
  lessonId: string,
  userKey: string,
  note: LessonTimestampNote
): Promise<LessonWorkspaceClientPayload> {
  const safeUser = encodeMongoUserKey(userKey)
  const cleanNote: LessonTimestampNote = {
    id: String(note.id || `note_${Date.now()}`),
    timeSeconds: Math.max(0, Math.floor(Number(note.timeSeconds) || 0)),
    text: String(note.text || "").trim().slice(0, 600),
    createdAtIso: note.createdAtIso || new Date().toISOString(),
  }

  return mutateWorkspaceDoc(lessonId, userKey, (doc) => {
    const current = Array.isArray(doc.notesByUser[safeUser])
      ? doc.notesByUser[safeUser]
      : []
    doc.notesByUser[safeUser] = [cleanNote, ...current].slice(0, 60)
  })
}

export async function deleteLessonNote(
  lessonId: string,
  userKey: string,
  noteId: string
): Promise<LessonWorkspaceClientPayload> {
  const safeUser = encodeMongoUserKey(userKey)
  return mutateWorkspaceDoc(lessonId, userKey, (doc) => {
    const current = Array.isArray(doc.notesByUser[safeUser])
      ? doc.notesByUser[safeUser]
      : []
    doc.notesByUser[safeUser] = current.filter((n) => n.id !== noteId)
  })
}

export async function addLessonQa(
  lessonId: string,
  userKey: string,
  qaItem: Omit<LessonQaItem, "replies">
): Promise<LessonWorkspaceClientPayload> {
  const authorName = String(qaItem.authorName || "ConnectLn Member").trim().slice(0, 80)
  const cleanQa: LessonQaItem = {
    id: String(qaItem.id || `qa_${Date.now()}`),
    authorName,
    authorRole: String(qaItem.authorRole || "Skilled Pro").trim().slice(0, 80),
    authorAvatar: safeAvatarForCloud(qaItem.authorAvatar, authorName),
    question: String(qaItem.question || "").trim().slice(0, 800),
    createdAtIso: qaItem.createdAtIso || new Date().toISOString(),
    replies: [],
  }

  return mutateWorkspaceDoc(lessonId, userKey, (doc) => {
    doc.qaItems = [cleanQa, ...doc.qaItems].slice(0, 80)
  })
}

export async function addLessonQaReply(
  lessonId: string,
  userKey: string,
  qaId: string,
  reply: LessonQaReply
): Promise<LessonWorkspaceClientPayload> {
  const authorName = String(reply.authorName || "ConnectLn Member").trim().slice(0, 80)
  const cleanReply: LessonQaReply = {
    id: String(reply.id || `reply_${Date.now()}`),
    authorName,
    authorRole: String(reply.authorRole || "Peer Pro").trim().slice(0, 80),
    authorAvatar: safeAvatarForCloud(reply.authorAvatar, authorName),
    text: String(reply.text || "").trim().slice(0, 800),
    createdAtIso: reply.createdAtIso || new Date().toISOString(),
  }

  return mutateWorkspaceDoc(lessonId, userKey, (doc) => {
    doc.qaItems = doc.qaItems.map((q) =>
      q.id === qaId
        ? { ...q, replies: [...(q.replies || []), cleanReply].slice(-40) }
        : q
    )
  })
}

export async function addLessonRegionalTip(
  lessonId: string,
  userKey: string,
  tip: LessonRegionalTip
): Promise<LessonWorkspaceClientPayload> {
  const allowedRegions: RegionalTipCode[] = [
    "US / NEC",
    "UK / EU",
    "Africa / ECOWAS",
    "Global Metric",
  ]
  const safeRegion = allowedRegions.includes(tip.region)
    ? tip.region
    : "Global Metric"
  const cleanTip: LessonRegionalTip = {
    id: String(tip.id || `tip_${Date.now()}`),
    region: safeRegion,
    title: String(tip.title || "Regional Pro Standard").trim().slice(0, 120),
    detail: String(tip.detail || "").trim().slice(0, 700),
    authorName: String(tip.authorName || "ConnectLn Member").trim().slice(0, 80),
    createdAtIso: tip.createdAtIso || new Date().toISOString(),
  }

  return mutateWorkspaceDoc(lessonId, userKey, (doc) => {
    doc.regionalTips = [cleanTip, ...doc.regionalTips].slice(0, 60)
  })
}

export async function publishLessonProofOfWork(
  lessonId: string,
  userKey: string,
  proof: Omit<LessonProofOfWork, "authorKey" | "vouchedByUserKeys">
): Promise<LessonWorkspaceClientPayload> {
  const safeAuthorKey = encodeMongoUserKey(userKey)
  const authorName = String(proof.authorName || "ConnectLn Member").trim().slice(0, 80)
  const rawPhoto = typeof proof.photoDataUrl === "string" ? proof.photoDataUrl.trim() : ""
  const safePhoto =
    rawPhoto && rawPhoto.startsWith("data:image/") && rawPhoto.length <= MAX_PROOF_PHOTO_CHARS
      ? rawPhoto
      : undefined

  const cleanProof: LessonProofOfWork = {
    id: String(proof.id || `pow_${Date.now()}`),
    authorKey: safeAuthorKey,
    authorName,
    authorHeadline: String(proof.authorHeadline || "Verified Learner").trim().slice(0, 100),
    authorAvatar: safeAvatarForCloud(proof.authorAvatar, authorName),
    notes: String(proof.notes || "").trim().slice(0, 1200),
    photoDataUrl: safePhoto,
    lessonTitle: String(proof.lessonTitle || "Hands-On Lesson").trim().slice(0, 140),
    category: String(proof.category || "Skilled Trades").trim().slice(0, 60),
    vouchedByUserKeys: [],
    feedPostId: proof.feedPostId,
    createdAtIso: proof.createdAtIso || new Date().toISOString(),
  }

  return mutateWorkspaceDoc(lessonId, userKey, (doc) => {
    doc.proofsOfWork = [cleanProof, ...doc.proofsOfWork].slice(0, 50)
  })
}

export async function toggleProofOfWorkVouch(
  lessonId: string,
  proofId: string,
  userKey: string
): Promise<LessonWorkspaceClientPayload> {
  const safeVoter = encodeMongoUserKey(userKey)

  return mutateWorkspaceDoc(lessonId, userKey, (doc) => {
    doc.proofsOfWork = doc.proofsOfWork.map((item) => {
      if (item.id !== proofId) return item
      const vouches = Array.isArray(item.vouchedByUserKeys)
        ? [...item.vouchedByUserKeys]
        : []
      const idx = vouches.indexOf(safeVoter)
      if (idx >= 0) {
        vouches.splice(idx, 1)
      } else {
        vouches.push(safeVoter)
      }
      return { ...item, vouchedByUserKeys: vouches }
    })
  })
}

export async function issueLessonCredential(
  lessonId: string,
  credential: Omit<LessonSkillCredential, "userKey"> & { rawUserKey: string }
): Promise<LessonWorkspaceClientPayload> {
  const safeUser = encodeMongoUserKey(credential.rawUserKey)
  const normalizedLessonId = normalizeLessonId(lessonId)
  const cleanCred: LessonSkillCredential = {
    id: String(credential.id || `cred_${normalizedLessonId}_${safeUser}`),
    userKey: safeUser,
    holderName: String(credential.holderName || "ConnectLn Member").trim().slice(0, 80),
    lessonId: normalizedLessonId,
    lessonTitle: String(credential.lessonTitle || "Hands-On Lesson").trim().slice(0, 140),
    category: String(credential.category || "Skilled Trades").trim().slice(0, 60),
    tier: credential.tier || "Practitioner",
    vouchCount: Math.max(0, Number(credential.vouchCount) || 0),
    issuedAtIso: credential.issuedAtIso || new Date().toISOString(),
  }

  return mutateWorkspaceDoc(normalizedLessonId, credential.rawUserKey, (doc) => {
    const filtered = doc.credentials.filter(
      (c) => !(c.userKey === safeUser && c.lessonId === normalizedLessonId)
    )
    doc.credentials = [cleanCred, ...filtered].slice(0, 100)
  })
}

export async function recordLessonMentorRequest(
  lessonId: string,
  userKey: string,
  request: Omit<LessonMentorRequest, "requesterKey">
): Promise<LessonWorkspaceClientPayload> {
  const safeUser = encodeMongoUserKey(userKey)
  const cleanReq: LessonMentorRequest = {
    id: String(request.id || `mreq_${Date.now()}`),
    requesterKey: safeUser,
    requesterName: String(request.requesterName || "ConnectLn Member").trim().slice(0, 80),
    channel:
      request.channel === "video" || request.channel === "audio"
        ? request.channel
        : "message",
    question: String(request.question || "").trim().slice(0, 600),
    category: String(request.category || "Skilled Trades").trim().slice(0, 60),
    createdAtIso: request.createdAtIso || new Date().toISOString(),
  }

  return mutateWorkspaceDoc(lessonId, userKey, (doc) => {
    doc.mentorRequests = [cleanReq, ...doc.mentorRequests].slice(0, 50)
  })
}
