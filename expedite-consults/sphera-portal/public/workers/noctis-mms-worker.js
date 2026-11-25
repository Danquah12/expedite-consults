import * as ort from "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/dist/ort.wasm.bundle.min.mjs"

const HF_RESOLVE_BASE = "https://huggingface.co"
const CACHE_NAME = "noctis-mms-onnx-v1"
const ORT_WASM_CDN =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/dist/"

ort.env.wasm.numThreads = 1
ort.env.wasm.wasmPaths = ORT_WASM_CDN

/** @type {Map<string, { session: any, vocab: Record<string, number>, blankId: number, sampleRate: number }>} */
const loadedModels = new Map()
/** @type {Map<string, Promise<any>>} */
const inFlightLoads = new Map()

let latestHighRequestId = 0
let cancelledRequestIds = new Set()
let workQueue = Promise.resolve()

function postProgress(requestId, pct, stage) {
  self.postMessage({ type: "progress", requestId, pct, stage })
}

async function fetchWithPersistentCache(url, onChunkProgress) {
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(url)
      if (cached && cached.ok) {
        const buf = await cached.arrayBuffer()
        if (buf.byteLength > 0) {
          onChunkProgress?.(buf.byteLength, buf.byteLength)
          return buf
        }
      }
    } catch {
      // Ignore Cache API read failure
    }
  }

  const res = await fetch(url, { mode: "cors", credentials: "omit" })
  if (!res.ok) {
    throw new Error(`Failed to fetch MMS asset (${res.status}): ${url}`)
  }

  // Persist to Browser Cache API via cloned Response so we don't duplicate 109MB buffers in memory
  if (typeof caches !== "undefined") {
    try {
      const resForCache = res.clone()
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.put(url, resForCache))
        .catch(() => {})
    } catch {
      // Ignore clone/cache errors
    }
  }

  const totalBytes = Number(res.headers.get("content-length") || "0")
  if (!res.body || !totalBytes) {
    const ab = await res.arrayBuffer()
    onChunkProgress?.(ab.byteLength, ab.byteLength)
    return ab
  }

  const reader = res.body.getReader()
  const merged = new Uint8Array(totalBytes)
  let offset = 0
  let lastReportedPct = -1

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue

    // Guard against servers returning more bytes than content-length
    if (offset + value.byteLength <= merged.byteLength) {
      merged.set(value, offset)
      offset += value.byteLength
    } else {
      const chunksFallback = [merged.subarray(0, offset), value]
      while (true) {
        const next = await reader.read()
        if (next.done) break
        if (next.value) chunksFallback.push(next.value)
      }
      const exactTotal = chunksFallback.reduce((acc, c) => acc + c.byteLength, 0)
      const rebuilt = new Uint8Array(exactTotal)
      let pos = 0
      for (const c of chunksFallback) {
        rebuilt.set(c, pos)
        pos += c.byteLength
      }
      onChunkProgress?.(exactTotal, exactTotal)
      return rebuilt.buffer
    }

    const pctNow = Math.round((offset / totalBytes) * 100)
    if (pctNow >= lastReportedPct + 5 || pctNow === 100) {
      lastReportedPct = pctNow
      onChunkProgress?.(offset, totalBytes)
    }
  }

  return offset === merged.byteLength ? merged.buffer : merged.buffer.slice(0, offset)
}

function parseSherpaTokensTxt(raw) {
  const vocab = {}
  const lines = raw.trim().split(/\r?\n/)
  for (const line of lines) {
    const m = line.match(/^(.+)\s+(\d+)$/)
    if (m) {
      vocab[m[1]] = Number(m[2])
    }
  }
  const blankId = "_" in vocab ? vocab["_"] : 0
  return { vocab, blankId }
}

async function ensureModelLoaded(lang, profile, requestId) {
  const existing = loadedModels.get(lang)
  if (existing) {
    postProgress(requestId, 100, "ready")
    return existing
  }

  const pending = inFlightLoads.get(lang)
  if (pending) {
    return pending
  }

  const loadPromise = (async () => {
    postProgress(requestId, 8, "downloading native voice model")
    const isSherpa = profile.mmsFormat === "sherpa-vits"
    const tokFile = isSherpa
      ? profile.mmsTokensFile || "tokens.txt"
      : profile.mmsVocabFile || "vocab.json"
    const baseRepoUrl = `${HF_RESOLVE_BASE}/${profile.mmsRepo}/resolve/main`
    const onnxUrl = `${baseRepoUrl}/${profile.mmsOnnxFile}`
    const tokUrl = `${baseRepoUrl}/${tokFile}`

    let lastPct = 8
    const [tokBuf, onnxBuf] = await Promise.all([
      fetchWithPersistentCache(tokUrl),
      fetchWithPersistentCache(onnxUrl, (loaded, total) => {
        if (total > 0) {
          const pct = Math.min(92, Math.max(10, Math.round(10 + (loaded / total) * 82)))
          if (pct >= lastPct + 5) {
            lastPct = pct
            postProgress(requestId, pct, "downloading native voice model")
          }
        }
      }),
    ])

    const tokText = new TextDecoder("utf-8").decode(tokBuf)
    let vocab
    let blankId = 0

    if (isSherpa) {
      const parsed = parseSherpaTokensTxt(tokText)
      vocab = parsed.vocab
      blankId = parsed.blankId
    } else {
      vocab = JSON.parse(tokText)
      blankId = "|" in vocab ? vocab["|"] : 0
    }

    postProgress(requestId, 95, "warming up native speech engine")
    const session = await ort.InferenceSession.create(onnxBuf, {
      executionProviders: ["wasm"],
    })

    const model = { session, vocab, blankId, sampleRate: 16000 }
    loadedModels.set(lang, model)
    postProgress(requestId, 100, "ready")
    return model
  })()

  inFlightLoads.set(lang, loadPromise)
  try {
    return await loadPromise
  } finally {
    inFlightLoads.delete(lang)
  }
}

function tokenizeForVits(chunk, vocab, blankId) {
  const chars = Array.from(chunk)
  const ids = [blankId]
  for (const ch of chars) {
    if (ch in vocab) {
      ids.push(vocab[ch], blankId)
    }
  }
  return ids
}

async function runVitsChunk(model, ids) {
  const { session } = model
  const len = ids.length
  const idBig = BigInt64Array.from(ids.map((n) => BigInt(n)))
  const inputs = {}

  if (session.inputNames.includes("input_ids")) {
    inputs.input_ids = new ort.Tensor("int64", idBig, [1, len])
    if (session.inputNames.includes("attention_mask")) {
      inputs.attention_mask = new ort.Tensor("int64", new BigInt64Array(len).fill(BigInt(1)), [1, len])
    }
  } else {
    const xName = session.inputNames.includes("x") ? "x" : session.inputNames[0]
    inputs[xName] = new ort.Tensor("int64", idBig, [1, len])
    if (session.inputNames.includes("x_length")) {
      inputs.x_length = new ort.Tensor("int64", BigInt64Array.from([BigInt(len)]), [1])
    }
    if (session.inputNames.includes("noise_scale")) {
      inputs.noise_scale = new ort.Tensor("float32", Float32Array.from([0.667]), [1])
    }
    if (session.inputNames.includes("length_scale")) {
      inputs.length_scale = new ort.Tensor("float32", Float32Array.from([1.05]), [1])
    }
    if (session.inputNames.includes("noise_scale_w")) {
      inputs.noise_scale_w = new ort.Tensor("float32", Float32Array.from([0.8]), [1])
    }
    if (session.inputNames.includes("sid")) {
      inputs.sid = new ort.Tensor("int64", BigInt64Array.from([BigInt(0)]), [1])
    }
  }

  const out = await session.run(inputs)
  const outName = session.outputNames[0]
  const raw = out[outName]?.data
  if (!raw || typeof raw.length !== "number" || raw.length === 0) {
    return new Float32Array(0)
  }

  // 1. Clean DC offset removal only (keep raw VITS harmonic spectrum intact without buzzing pre-emphasis)
  let sum = 0
  let validCount = 0
  for (let i = 0; i < raw.length; i++) {
    if (Number.isFinite(raw[i])) {
      sum += raw[i]
      validCount++
    }
  }
  const mean = validCount > 0 ? sum / validCount : 0

  const clean = new Float32Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    clean[i] = Number.isFinite(raw[i]) ? raw[i] - mean : 0
  }

  // 2. Gentle 4ms edge fades so trailing syllables are never clipped
  const fadeSamples = Math.min(64, Math.floor(clean.length / 10))
  for (let i = 0; i < fadeSamples; i++) {
    const ramp = i / fadeSamples
    clean[i] *= ramp
    clean[clean.length - 1 - i] *= ramp
  }

  return clean
}

function encodeFloat32ToWavArrayBuffer(samples, sampleRate) {
  let peak = 0
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i])
    if (abs > peak) peak = abs
  }
  const gain = peak > 0.001 ? Math.min(4.0, 0.89 / peak) : 1.0

  const dataByteLength = samples.length * 2
  const buffer = new ArrayBuffer(44 + dataByteLength)
  const view = new DataView(buffer)

  const writeStr = (offset, s) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset + i, s.charCodeAt(i))
    }
  }

  writeStr(0, "RIFF")
  view.setUint32(4, 36 + dataByteLength, true)
  writeStr(8, "WAVE")
  writeStr(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeStr(36, "data")
  view.setUint32(40, dataByteLength, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i] * gain))
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
    offset += 2
  }

  return buffer
}

async function handleSynthesize(msg) {
  const { requestId, lang, profile, chunks, priority } = msg
  if (cancelledRequestIds.has(requestId)) return
  if (priority === "high" && requestId < latestHighRequestId) return

  const model = await ensureModelLoaded(lang, profile, requestId)
  if (cancelledRequestIds.has(requestId)) return
  if (priority === "high" && requestId < latestHighRequestId) return

  /** @type {Array<{ wave: Float32Array, pauseAfterMs: number }>} */
  const chunkEntries = []
  for (const item of chunks) {
    if (cancelledRequestIds.has(requestId)) return
    if (priority === "high" && requestId < latestHighRequestId) return
    const chunkText = typeof item === "string" ? item : item?.text || ""
    const pauseAfterMs = typeof item === "object" && typeof item?.pauseAfterMs === "number" ? item.pauseAfterMs : 220
    const ids = tokenizeForVits(chunkText, model.vocab, model.blankId)
    if (ids.length <= 1) continue
    const wave = await runVitsChunk(model, ids)
    if (wave.length > 0) {
      chunkEntries.push({ wave, pauseAfterMs })
    }
  }

  if (cancelledRequestIds.has(requestId)) return
  if (chunkEntries.length === 0) {
    throw new Error(`No waveform produced for ${lang}`)
  }

  const trailingPadSamples = Math.round(model.sampleRate * 0.1)
  let totalLength = trailingPadSamples
  chunkEntries.forEach((entry, idx) => {
    totalLength += entry.wave.length
    if (idx < chunkEntries.length - 1) {
      totalLength += Math.round((model.sampleRate * entry.pauseAfterMs) / 1000)
    }
  })

  const combined = new Float32Array(totalLength)
  let cursor = 0
  chunkEntries.forEach((entry, idx) => {
    combined.set(entry.wave, cursor)
    cursor += entry.wave.length
    if (idx < chunkEntries.length - 1) {
      cursor += Math.round((model.sampleRate * entry.pauseAfterMs) / 1000)
    }
  })

  const wavBuffer = encodeFloat32ToWavArrayBuffer(combined, model.sampleRate)
  self.postMessage({ type: "result", requestId, wavBuffer }, [wavBuffer])
}

self.onmessage = (event) => {
  const msg = event.data
  if (!msg || typeof msg !== "object") return

  if (msg.type === "cancel") {
    if (typeof msg.requestId === "number") {
      cancelledRequestIds.add(msg.requestId)
    } else {
      latestHighRequestId += 1
      cancelledRequestIds.clear()
    }
    return
  }

  if (msg.type === "synthesize") {
    if (msg.priority === "high") {
      latestHighRequestId = Math.max(latestHighRequestId, msg.requestId)
    }
    workQueue = workQueue
      .then(() => handleSynthesize(msg))
      .catch((err) => {
        self.postMessage({
          type: "error",
          requestId: msg.requestId,
          message: err instanceof Error ? err.message : String(err || "MMS synthesis error"),
        })
      })
  }
}
