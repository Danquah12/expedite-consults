import { NextRequest, NextResponse } from "next/server"
import { Binary } from "mongodb"
import { getConnectLnMongoDb, isConnectLnMongoConfigured } from "@/lib/connectln-mongodb"
import {
  buildCategoryMetadataDefaults,
  insertCreatorLearningLesson,
  verifyVimeoOembed,
  verifyYoutubeEmbeddable,
} from "@/lib/connectln-learning-video-sync"
import {
  LEARN_CATEGORY_META,
  type LearnByDoingLesson,
  type LearnVideoSourceProvider,
  type SkilledTradesCategory,
} from "@/lib/skilled-trades-learn-by-doing-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

const CHUNK_COLLECTION = "connectln_creator_video_chunks"
const MAX_CHUNK_BYTES = 4 * 1024 * 1024 // 4 MB per chunk safely below Vercel 4.5 MB limit
const MAX_TOTAL_CHUNKS = 16
const MAX_TOTAL_BYTES = 36 * 1024 * 1024 // 36 MB total per creator upload

function isValidCategory(cat: string): cat is SkilledTradesCategory {
  return Object.prototype.hasOwnProperty.call(LEARN_CATEGORY_META, cat)
}

function detectExternalProvider(rawUrl: string): {
  provider: LearnVideoSourceProvider
  youtubeId?: string
  vimeoId?: string
  embedUrl?: string
  directVideoUrl?: string
  thumbnailUrl?: string
  licenseLabel: string
} | null {
  try {
    const u = new URL(rawUrl.trim())
    if (u.protocol !== "https:" && u.protocol !== "http:") return null
    const host = u.hostname.replace(/^www\./, "").toLowerCase()

    if (host.includes("youtube.com") || host.includes("youtu.be") || host.includes("youtube-nocookie.com")) {
      const m =
        rawUrl.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/) ||
        [null, u.searchParams.get("v")]
      const vid = m?.[1]
      if (!vid) return null
      return {
        provider: "youtube",
        youtubeId: vid,
        thumbnailUrl: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
        licenseLabel: "Standard YouTube License · Embedded via Official Player",
      }
    }

    if (host.includes("vimeo.com")) {
      const m = u.pathname.match(/\/(\d{6,12})/)
      if (!m?.[1]) return null
      return {
        provider: "vimeo",
        vimeoId: m[1],
        embedUrl: `https://player.vimeo.com/video/${m[1]}`,
        licenseLabel: "Standard Vimeo Embed · Creator Attributed",
      }
    }

    if (host.includes("archive.org")) {
      const m = u.pathname.match(/\/(?:details|embed|download)\/([^/?#]+)/)
      const ident = m?.[1]
      if (!ident) return null
      const isDirectMp4 = /\.mp4(\?|$)/i.test(rawUrl)
      return {
        provider: "archive_org",
        directVideoUrl: isDirectMp4 ? rawUrl.trim() : undefined,
        embedUrl: `https://archive.org/embed/${ident}`,
        thumbnailUrl: `https://archive.org/services/img/${ident}`,
        licenseLabel: "Internet Archive Open / Creative Commons",
      }
    }

    if (host.includes("dailymotion.com") || host === "dai.ly") {
      const m = u.pathname.match(/\/(?:video\/)?([a-zA-Z0-9]+)$/) || u.pathname.match(/^\/([a-zA-Z0-9]+)$/)
      const vid = m?.[1]
      if (!vid) return null
      return {
        provider: "dailymotion",
        embedUrl: `https://geo.dailymotion.com/player.html?video=${vid}`,
        thumbnailUrl: `https://www.dailymotion.com/thumbnail/video/${vid}`,
        licenseLabel: "Standard Dailymotion Embed · Creator Attributed",
      }
    }

    if (host.includes("makertube.net") || host.includes("tilvids.com") || host.includes("peertube")) {
      const m = u.pathname.match(/\/(?:w|videos\/embed|videos\/watch)\/([a-zA-Z0-9-]{8,40})/)
      const uuid = m?.[1]
      if (!uuid) return null
      return {
        provider: "peertube",
        embedUrl: `https://${host}/videos/embed/${uuid}`,
        licenseLabel: "PeerTube Federated Embed · Creator Attributed",
      }
    }

    if (host.includes("ted.com")) {
      const slug = u.pathname.replace(/^\/+|\/+$/g, "")
      return {
        provider: "ted",
        embedUrl: `https://embed.ted.com/${slug}`,
        licenseLabel: "TED Talks Embed · Creator Attributed",
      }
    }

    if (/\.(mp4|webm|mov)(\?|$)/i.test(u.pathname)) {
      return {
        provider: "connectln_native",
        directVideoUrl: rawUrl.trim(),
        licenseLabel: "ConnectLn Direct Creator Stream",
      }
    }

    return null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""

    // 1. Multipart Chunk Upload
    if (contentType.includes("multipart/form-data")) {
      if (!isConnectLnMongoConfigured()) {
        return NextResponse.json(
          { ok: false, error: "MongoDB chunk storage is not configured in this environment." },
          { status: 503 }
        )
      }
      const db = await getConnectLnMongoDb()
      if (!db) {
        return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 })
      }

      const formData = await req.formData()
      const uploadId = String(formData.get("uploadId") || "").trim().replace(/[^a-zA-Z0-9_-]/g, "")
      const chunkIndex = Number(formData.get("chunkIndex"))
      const totalChunks = Number(formData.get("totalChunks"))
      const file = formData.get("chunk") as File | null

      if (
        !uploadId ||
        !Number.isInteger(chunkIndex) ||
        chunkIndex < 0 ||
        !Number.isInteger(totalChunks) ||
        totalChunks < 1 ||
        totalChunks > MAX_TOTAL_CHUNKS ||
        !file
      ) {
        return NextResponse.json({ ok: false, error: "Invalid chunk upload payload." }, { status: 400 })
      }

      const buf = Buffer.from(await file.arrayBuffer())
      if (buf.length === 0 || buf.length > MAX_CHUNK_BYTES) {
        return NextResponse.json(
          { ok: false, error: "Chunk size exceeds allowed 4 MB segment limit." },
          { status: 400 }
        )
      }

      await db.collection<Record<string, any>>(CHUNK_COLLECTION).updateOne(
        { _id: `${uploadId}::${chunkIndex}` as any },
        {
          $set: {
            _id: `${uploadId}::${chunkIndex}`,
            docType: "chunk",
            uploadId,
            chunkIndex,
            size: buf.length,
            data: new Binary(buf),
            createdAtMs: Date.now(),
          },
        },
        { upsert: true }
      )

      return NextResponse.json({
        ok: true,
        uploadId,
        chunkIndex,
        storedBytes: buf.length,
      })
    }

    // 2. JSON Actions: finalize_upload OR submit_external_link
    const body = await req.json()
    const action = String(body?.action || "").trim()

    if (!body?.rightsAttested) {
      return NextResponse.json(
        { ok: false, error: "You must confirm creator rights or open-license permission before publishing." },
        { status: 400 }
      )
    }

    const title = String(body?.title || "").trim().slice(0, 120)
    const rawCategory = String(body?.category || "Carpentry").trim()
    const category: SkilledTradesCategory = isValidCategory(rawCategory) ? rawCategory : "Carpentry"
    const creatorName = String(body?.creatorName || "ConnectLn Creator").trim().slice(0, 90)
    const creatorEmail = body?.creatorEmail ? String(body.creatorEmail).trim().toLowerCase() : undefined
    const description = String(body?.description || "").trim().slice(0, 600)
    const practicePrompt = String(body?.practiceActivity || "").trim().slice(0, 400)
    const sourceLanguage = String(body?.sourceLanguage || "en").trim().toLowerCase()

    if (!title) {
      return NextResponse.json({ ok: false, error: "Lesson title is required." }, { status: 400 })
    }

    const defaults = buildCategoryMetadataDefaults(category)

    if (action === "finalize_upload") {
      if (!isConnectLnMongoConfigured()) {
        return NextResponse.json({ ok: false, error: "MongoDB unavailable for video finalization." }, { status: 503 })
      }
      const db = await getConnectLnMongoDb()
      if (!db) {
        return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 })
      }

      const uploadId = String(body?.uploadId || "").trim().replace(/[^a-zA-Z0-9_-]/g, "")
      const totalChunks = Number(body?.totalChunks || 0)
      const totalBytes = Number(body?.totalBytes || 0)
      const rawMime = String(body?.mimeType || "video/mp4").toLowerCase()
      const allowedMime = rawMime.includes("webm")
        ? "video/webm"
        : rawMime.includes("quicktime")
        ? "video/quicktime"
        : "video/mp4"

      if (
        !uploadId ||
        !Number.isInteger(totalChunks) ||
        totalChunks < 1 ||
        totalChunks > MAX_TOTAL_CHUNKS ||
        !Number.isFinite(totalBytes) ||
        totalBytes <= 0 ||
        totalBytes > MAX_TOTAL_BYTES
      ) {
        return NextResponse.json({ ok: false, error: "Invalid finalized upload metadata (max 36 MB)." }, { status: 400 })
      }

      const col = db.collection<Record<string, any>>(CHUNK_COLLECTION)
      const chunkDocs = await col
        .find(
          { uploadId, docType: "chunk" },
          { projection: { chunkIndex: 1, size: 1 } }
        )
        .sort({ chunkIndex: 1 })
        .toArray()

      if (chunkDocs.length !== totalChunks) {
        return NextResponse.json(
          {
            ok: false,
            error: `Upload incomplete: expected ${totalChunks} chunks, found ${chunkDocs.length}.`,
          },
          { status: 400 }
        )
      }

      const chunkSizes = chunkDocs.map((c) => Number(c.size || 0))
      const computedBytes = chunkSizes.reduce((s, n) => s + n, 0)

      await col.updateOne(
        { _id: `${uploadId}::meta` as any },
        {
          $set: {
            _id: `${uploadId}::meta`,
            docType: "upload_meta",
            uploadId,
            totalChunks,
            totalBytes: computedBytes,
            chunkSizes,
            mimeType: allowedMime,
            createdAtMs: Date.now(),
          },
        },
        { upsert: true }
      )

      const nowMs = Date.now()
      const lessonId = `lbd_native_${uploadId}`
      const lesson: LearnByDoingLesson = {
        id: lessonId,
        lessonNumber: 200 + Math.floor((nowMs % 100000) / 100),
        videoLabel: `ConnectLn Original (${category}): ${title.slice(0, 48)}`,
        title,
        category,
        enclaveId: defaults.enclaveId,
        professionId: defaults.professionId,
        level: "Intermediate",
        originalCreator: `${creatorName} · ConnectLn Creator`,
        creatorDomain: "conectln.com",
        sourceProvider: "connectln_native",
        directVideoUrl: `/api/connectin/learning-videos/stream/${encodeURIComponent(uploadId)}`,
        sourceVideoUrl: "https://conectln.com/connectin?tab=learning",
        referenceArticleUrl: "https://conectln.com/connectin?tab=learning",
        licenseLabel: "ConnectLn Creator Original",
        uploadedByEmail: creatorEmail,
        lastVerifiedAtMs: nowMs,
        sourceLanguage: sourceLanguage || "en",
        youtubeId: "",
        embedAvailable: true,
        duration: String(body?.durationLabel || "").slice(0, 16),
        thumbnailUrl: "/brand/connectln-icon-256.png",
        description:
          description ||
          `Original ${category} field tutorial uploaded directly by ${creatorName} on ConnectLn.`,
        skillsCovered: defaults.skillsCovered,
        practiceActivity: practicePrompt || defaults.practiceActivity,
        practiceDeliverablePrompt: defaults.practiceDeliverablePrompt,
        knowledgeCheck: defaults.knowledgeCheck,
      }

      const saved = await insertCreatorLearningLesson(lesson)
      return NextResponse.json({ ok: saved.ok, lesson, mongoConnected: saved.mongoConnected })
    }

    if (action === "submit_external_link") {
      const sourceUrl = String(body?.sourceUrl || "").trim()
      const parsed = detectExternalProvider(sourceUrl)
      if (!parsed) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Enter a valid video link from YouTube, Vimeo, Internet Archive, PeerTube, Dailymotion, TED, or direct MP4/WebM.",
          },
          { status: 400 }
        )
      }

      let verifiedThumb = parsed.thumbnailUrl || "/brand/connectln-icon-256.png"
      let verifiedCreator = creatorName

      if (parsed.provider === "youtube" && parsed.youtubeId) {
        const ytCheck = await verifyYoutubeEmbeddable(parsed.youtubeId)
        if (!ytCheck.ok) {
          return NextResponse.json(
            {
              ok: false,
              error:
                "YouTube embedding is disabled by the creator or this video could not be verified as public.",
            },
            { status: 400 }
          )
        }
        verifiedCreator = ytCheck.authorName || creatorName
      } else if (parsed.provider === "vimeo") {
        const vCheck = await verifyVimeoOembed(sourceUrl)
        if (!vCheck?.ok) {
          return NextResponse.json(
            { ok: false, error: "This Vimeo video has embedding disabled or could not be verified." },
            { status: 400 }
          )
        }
        if (vCheck.thumbnailUrl) verifiedThumb = vCheck.thumbnailUrl
        if (vCheck.authorName) verifiedCreator = `${vCheck.authorName} · Vimeo`
      }

      const nowMs = Date.now()
      const lessonId = `lbd_native_ext_${nowMs}_${Math.random().toString(36).slice(2, 6)}`
      const lesson: LearnByDoingLesson = {
        id: lessonId,
        lessonNumber: 200 + Math.floor((nowMs % 100000) / 100),
        videoLabel: `Community Lesson (${category}): ${title.slice(0, 48)}`,
        title,
        category,
        enclaveId: defaults.enclaveId,
        professionId: defaults.professionId,
        level: "Intermediate",
        originalCreator: verifiedCreator,
        creatorDomain: new URL(sourceUrl).hostname.replace(/^www\./, ""),
        sourceProvider: parsed.provider,
        embedUrl: parsed.embedUrl,
        directVideoUrl: parsed.directVideoUrl,
        sourceVideoUrl: sourceUrl,
        referenceArticleUrl: sourceUrl,
        licenseLabel: parsed.licenseLabel,
        uploadedByEmail: creatorEmail,
        lastVerifiedAtMs: nowMs,
        sourceLanguage: sourceLanguage || "en",
        youtubeId: parsed.youtubeId || "",
        embedAvailable: true,
        duration: "",
        thumbnailUrl: verifiedThumb,
        description:
          description ||
          `Verified ${category} community training contributed by ${creatorName}.`,
        skillsCovered: defaults.skillsCovered,
        practiceActivity: practicePrompt || defaults.practiceActivity,
        practiceDeliverablePrompt: defaults.practiceDeliverablePrompt,
        knowledgeCheck: defaults.knowledgeCheck,
      }

      const saved = await insertCreatorLearningLesson(lesson)
      return NextResponse.json({ ok: saved.ok, lesson, mongoConnected: saved.mongoConnected })
    }

    return NextResponse.json({ ok: false, error: "Unsupported action." }, { status: 400 })
  } catch (err: any) {
    console.error("[POST /api/connectin/learning-videos/upload] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to publish lesson video." },
      { status: 500 }
    )
  }
}
