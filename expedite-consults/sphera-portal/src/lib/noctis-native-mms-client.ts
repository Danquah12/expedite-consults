"use client"

import type { LanguageCode } from "@/lib/translations"
import {
  getLanguageVoiceProfile,
  normalizeTextForMms,
  splitMmsSpeakableChunks,
  type LanguageVoiceProfile,
} from "./noctis-voice-profiles"

const HF_RESOLVE_BASE = "https://huggingface.co"
const CACHE_NAME = "noctis-mms-onnx-v1"
const ORT_WASM_CDN =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/dist/"

interface LoadedMmsModel {
  ort: typeof import("onnxruntime-web")
  session: import("onnxruntime-web").InferenceSession
  vocab: Record<string, number>
  blankId: number
  isSherpa: boolean
  sampleRate: number
}

const loadedModels = new Map<LanguageCode, LoadedMmsModel>()
const inFlightLoads = new Map<LanguageCode, Promise<LoadedMmsModel>>()

// LRU cache of synthesized WAV blob URLs keyed by `${lang}::${normalizedText}`
const audioBlobCache = new Map<string, string>()
const MAX_BLOB_CACHE = 30

async function fetchWithPersistentCache(
  url: string,
  onProgress?: (loadedBytes: number, totalBytes: number) => void
): Promise<ArrayBuffer> {
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(url)
      if (cached && cached.ok) {
        const buf = await cached.arrayBuffer()
        if (buf.byteLength > 0) {
          onProgress?.(buf.byteLength, buf.byteLength)
          return buf
        }
      }
    } catch {
      // Cache API unavailable (e.g. private browsing); continue with network fetch
    }
  }

  const res = await fetch(url, { mode: "cors", credentials: "omit" })
  if (!res.ok) {
    throw new Error(`Failed to fetch MMS model asset (${res.status}): ${url}`)
  }

  const totalBytes = Number(res.headers.get("content-length") || "0")
  if (!res.body) {
    const buf = await res.arrayBuffer()
    onProgress?.(buf.byteLength, buf.byteLength)
    return buf
  }

  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      received += value.byteLength
      onProgress?.(received, totalBytes || received)
    }
  }

  const merged = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }

  const ab = merged.buffer
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(
        url,
        new Response(ab.slice(0), {
          status: 200,
          headers: { "Content-Type": "application/octet-stream" },
        })
      )
    } catch {
      // Ignore quota exceeded / private mode errors
    }
  }

  return ab
}

function parseSherpaTokensTxt(raw: string): { vocab: Record<string, number>; blankId: number } {
  const vocab: Record<string, number> = {}
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

async function loadMmsModelForLanguage(
  profile: LanguageVoiceProfile,
  onProgress?: (pct: number, stage: string) => void
): Promise<LoadedMmsModel> {
  const existing = loadedModels.get(profile.code)
  if (existing) {
    onProgress?.(100, "ready")
    return existing
  }

  const pending = inFlightLoads.get(profile.code)
  if (pending) {
    return pending
  }

  const loadPromise = (async (): Promise<LoadedMmsModel> => {
    if (!profile.mmsRepo || !profile.mmsOnnxFile) {
      throw new Error(`No MMS model configured for ${profile.code}`)
    }

    onProgress?.(5, "initializing runtime")
    const ort = await import("onnxruntime-web")
    // Force single-threaded WASM so Cross-Origin Isolation headers (COOP/COEP) are not required
    // and embedded media frames remain intact.
    ort.env.wasm.numThreads = 1
    ort.env.wasm.wasmPaths = ORT_WASM_CDN

    const isSherpa = profile.mmsFormat === "sherpa-vits"
    const tokFile = isSherpa ? profile.mmsTokensFile || "tokens.txt" : profile.mmsVocabFile || "vocab.json"
    const baseRepoUrl = `${HF_RESOLVE_BASE}/${profile.mmsRepo}/resolve/main`
    const onnxUrl = `${baseRepoUrl}/${profile.mmsOnnxFile}`
    const tokUrl = `${baseRepoUrl}/${tokFile}`

    onProgress?.(10, "downloading native voice model")
    const [tokBuf, onnxBuf] = await Promise.all([
      fetchWithPersistentCache(tokUrl),
      fetchWithPersistentCache(onnxUrl, (loaded, total) => {
        if (total > 0) {
          const pct = Math.min(92, Math.max(12, Math.round(12 + (loaded / total) * 80)))
          onProgress?.(pct, "downloading native voice model")
        }
      }),
    ])

    const tokText = new TextDecoder("utf-8").decode(tokBuf)
    let vocab: Record<string, number>
    let blankId = 0

    if (isSherpa) {
      const parsed = parseSherpaTokensTxt(tokText)
      vocab = parsed.vocab
      blankId = parsed.blankId
    } else {
      vocab = JSON.parse(tokText)
      blankId = "|" in vocab ? vocab["|"] : 0
    }

    onProgress?.(95, "warming up native speech engine")
    const session = await ort.InferenceSession.create(onnxBuf, {
      executionProviders: ["wasm"],
    })

    const model: LoadedMmsModel = {
      ort,
      session,
      vocab,
      blankId,
      isSherpa,
      sampleRate: 16000,
    }
    loadedModels.set(profile.code, model)
    onProgress?.(100, "ready")
    return model
  })()

  inFlightLoads.set(profile.code, loadPromise)
  try {
    return await loadPromise
  } finally {
    inFlightLoads.delete(profile.code)
  }
}

function tokenizeForVits(chunk: string, vocab: Record<string, number>, blankId: number): number[] {
  const chars = Array.from(chunk)
  const ids: number[] = [blankId]
  for (const ch of chars) {
    if (ch in vocab) {
      ids.push(vocab[ch], blankId)
    }
  }
  return ids
}

async function runVitsChunk(model: LoadedMmsModel, ids: number[]): Promise<Float32Array> {
  const { ort, session } = model
  const len = ids.length
  const idBig = BigInt64Array.from(ids.map((n) => BigInt(n)))
  const inputs: Record<string, import("onnxruntime-web").Tensor> = {}

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
  if (!raw || typeof (raw as Float32Array).length !== "number") {
    return new Float32Array(0)
  }

  const arr = raw as Float32Array
  const clean = new Float32Array(arr.length)
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]
    clean[i] = Number.isFinite(v) ? v : 0
  }
  return clean
}

function encodeFloat32ToWavBlobUrl(samples: Float32Array, sampleRate: number): string {
  // Peak normalize to -1 dBFS so speech is crisp without clipping
  let peak = 0
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i])
    if (abs > peak) peak = abs
  }
  const gain = peak > 0.001 ? Math.min(4.0, 0.89 / peak) : 1.0

  const dataByteLength = samples.length * 2
  const buffer = new ArrayBuffer(44 + dataByteLength)
  const view = new DataView(buffer)

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset + i, s.charCodeAt(i))
    }
  }

  writeStr(0, "RIFF")
  view.setUint32(4, 36 + dataByteLength, true)
  writeStr(8, "WAVE")
  writeStr(12, "fmt ")
  view.setUint32(16, 16, true) // PCM chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, 1, true) // Mono
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

  const blob = new Blob([buffer], { type: "audio/wav" })
  return URL.createObjectURL(blob)
}

function storeBlobCache(key: string, url: string) {
  if (audioBlobCache.has(key)) {
    const prev = audioBlobCache.get(key)
    if (prev && prev !== url) {
      try {
        URL.revokeObjectURL(prev)
      } catch {}
    }
    audioBlobCache.delete(key)
  }
  audioBlobCache.set(key, url)
  while (audioBlobCache.size > MAX_BLOB_CACHE) {
    const oldestKey = audioBlobCache.keys().next().value
    if (!oldestKey) break
    const oldestUrl = audioBlobCache.get(oldestKey)
    audioBlobCache.delete(oldestKey)
    if (oldestUrl) {
      try {
        URL.revokeObjectURL(oldestUrl)
      } catch {}
    }
  }
}

export function isNativeMmsModelLoaded(lang: LanguageCode): boolean {
  return loadedModels.has(lang)
}

export async function synthesizeNativeMmsSpeech(
  rawText: string,
  lang: LanguageCode,
  opts?: { onProgress?: (pct: number, stage: string) => void }
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Native MMS synthesis only runs in the browser")
  }
  const profile = getLanguageVoiceProfile(lang)
  if (profile.mode !== "client-mms-native") {
    throw new Error(`Language ${lang} does not use client-side MMS`)
  }

  const normalized = normalizeTextForMms(rawText, lang)
  const cacheKey = `${lang}::${normalized}`
  const cachedUrl = audioBlobCache.get(cacheKey)
  if (cachedUrl) {
    opts?.onProgress?.(100, "ready")
    return cachedUrl
  }

  const model = await loadMmsModelForLanguage(profile, opts?.onProgress)
  const chunks = splitMmsSpeakableChunks(normalized)
  if (chunks.length === 0) {
    throw new Error("Nothing speakable after normalization")
  }

  const chunkWaveforms: Float32Array[] = []
  for (const chunk of chunks) {
    const ids = tokenizeForVits(chunk, model.vocab, model.blankId)
    if (ids.length <= 1) continue
    const wave = await runVitsChunk(model, ids)
    if (wave.length > 0) {
      chunkWaveforms.push(wave)
    }
  }

  if (chunkWaveforms.length === 0) {
    throw new Error(`No audio waveform produced for ${lang}`)
  }

  // Inter-clause pause: 180ms at 16kHz
  const pauseSamples = Math.round(model.sampleRate * 0.18)
  const totalLength =
    chunkWaveforms.reduce((acc, w) => acc + w.length, 0) +
    Math.max(0, chunkWaveforms.length - 1) * pauseSamples

  const combined = new Float32Array(totalLength)
  let cursor = 0
  chunkWaveforms.forEach((wave, idx) => {
    combined.set(wave, cursor)
    cursor += wave.length
    if (idx < chunkWaveforms.length - 1) {
      cursor += pauseSamples
    }
  })

  const blobUrl = encodeFloat32ToWavBlobUrl(combined, model.sampleRate)
  storeBlobCache(cacheKey, blobUrl)
  return blobUrl
}

export function prefetchNativeMmsSpeech(rawText: string, lang: LanguageCode): void {
  if (typeof window === "undefined") return
  const profile = getLanguageVoiceProfile(lang)
  if (profile.mode !== "client-mms-native") return
  if (!loadedModels.has(lang)) return
  const normalized = normalizeTextForMms(rawText, lang)
  if (!normalized || audioBlobCache.has(`${lang}::${normalized}`)) return
  synthesizeNativeMmsSpeech(rawText, lang).catch(() => {})
}
