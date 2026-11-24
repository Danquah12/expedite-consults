import { NextRequest, NextResponse } from "next/server"
import { getConnectLnMongoDb, isConnectLnMongoConfigured } from "@/lib/connectln-mongodb"

export const dynamic = "force-dynamic"
export const revalidate = 0

const CHUNK_COLLECTION = "connectln_creator_video_chunks"

function toBuffer(raw: any): Buffer {
  if (!raw) return Buffer.alloc(0)
  if (Buffer.isBuffer(raw)) return raw
  if (raw instanceof Uint8Array) return Buffer.from(raw.buffer, raw.byteOffset, raw.byteLength)
  if (raw?.buffer && Buffer.isBuffer(raw.buffer)) return raw.buffer
  if (raw?.value && typeof raw.value === "function") return raw.value(true) as Buffer
  return Buffer.from(raw)
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ uploadId: string }> }
) {
  try {
    if (!isConnectLnMongoConfigured()) {
      return NextResponse.json({ error: "Video storage unavailable" }, { status: 503 })
    }
    const db = await getConnectLnMongoDb()
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
    }

    const { uploadId: rawUploadId } = await context.params
    const uploadId = String(rawUploadId || "").trim().replace(/[^a-zA-Z0-9_-]/g, "")
    if (!uploadId) {
      return NextResponse.json({ error: "Invalid uploadId" }, { status: 400 })
    }

    const col = db.collection<Record<string, any>>(CHUNK_COLLECTION)
    const metaDoc = await col.findOne({ _id: `${uploadId}::meta` as any })
    if (!metaDoc) {
      return NextResponse.json({ error: "Uploaded video not found" }, { status: 404 })
    }

    const totalBytes = Number(metaDoc.totalBytes || 0)
    const mimeType = String(metaDoc.mimeType || "video/mp4")
    const chunkSizes: number[] = Array.isArray(metaDoc.chunkSizes)
      ? metaDoc.chunkSizes.map((n: unknown) => Number(n || 0))
      : []

    if (totalBytes <= 0 || chunkSizes.length === 0) {
      return NextResponse.json({ error: "Empty video stream" }, { status: 404 })
    }

    // Build cumulative byte offsets for each chunk index
    const chunkRanges: Array<{ index: number; start: number; end: number }> = []
    let cursor = 0
    for (let i = 0; i < chunkSizes.length; i++) {
      const sz = chunkSizes[i]
      chunkRanges.push({ index: i, start: cursor, end: cursor + sz - 1 })
      cursor += sz
    }

    const rangeHeader = req.headers.get("range")
    let reqStart = 0
    let reqEnd = Math.min(totalBytes - 1, 2 * 1024 * 1024 - 1)
    let isPartial = true

    if (rangeHeader) {
      const m = rangeHeader.match(/bytes=(\d*)-(\d*)/)
      if (m) {
        const s = m[1] ? Number(m[1]) : 0
        const e = m[2] ? Number(m[2]) : Math.min(totalBytes - 1, s + 2 * 1024 * 1024 - 1)
        if (!Number.isFinite(s) || !Number.isFinite(e) || s < 0 || s >= totalBytes || s > e) {
          return new NextResponse(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${totalBytes}` },
          })
        }
        reqStart = s
        reqEnd = Math.min(totalBytes - 1, e)
      }
    } else if (totalBytes <= 4 * 1024 * 1024) {
      reqStart = 0
      reqEnd = totalBytes - 1
      isPartial = false
    }

    const neededIndices = chunkRanges
      .filter((r) => r.end >= reqStart && r.start <= reqEnd)
      .map((r) => r.index)

    const chunkIds = neededIndices.map((idx) => `${uploadId}::${idx}`)
    const docs = await col
      .find({ _id: { $in: chunkIds as any[] } })
      .sort({ chunkIndex: 1 })
      .toArray()

    const docMap = new Map<number, Buffer>()
    for (const d of docs) {
      docMap.set(Number(d.chunkIndex), toBuffer(d.data))
    }

    const slices: Buffer[] = []
    for (const r of chunkRanges) {
      if (r.end < reqStart || r.start > reqEnd) continue
      const buf = docMap.get(r.index)
      if (!buf || buf.length === 0) continue
      const localStart = Math.max(0, reqStart - r.start)
      const localEnd = Math.min(buf.length, reqEnd - r.start + 1)
      if (localEnd > localStart) {
        slices.push(buf.subarray(localStart, localEnd))
      }
    }

    const combined = Buffer.concat(slices)
    const headers: Record<string, string> = {
      "Content-Type": mimeType,
      "Content-Length": String(combined.length),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    }

    if (isPartial) {
      headers["Content-Range"] = `bytes ${reqStart}-${reqStart + combined.length - 1}/${totalBytes}`
      return new NextResponse(new Uint8Array(combined), { status: 206, headers })
    }

    return new NextResponse(new Uint8Array(combined), { status: 200, headers })
  } catch (err) {
    console.error("[GET /api/connectin/learning-videos/stream] error:", err)
    return NextResponse.json({ error: "Failed to stream uploaded lesson" }, { status: 500 })
  }
}
