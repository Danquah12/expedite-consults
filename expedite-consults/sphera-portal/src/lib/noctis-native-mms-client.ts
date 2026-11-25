"use client"

import type { LanguageCode } from "@/lib/translations"
import {
  getLanguageVoiceProfile,
  normalizeTextForMms,
  splitMmsSpeakableChunks,
} from "./noctis-voice-profiles"

// LRU cache of synthesized WAV blob URLs keyed by `${lang}::${normalizedText}`
const audioBlobCache = new Map<string, string>()
const MAX_BLOB_CACHE = 30
const readyLanguages = new Set<LanguageCode>()

interface PendingWorkerJob {
  resolve: (wavBuffer: ArrayBuffer) => void
  reject: (err: Error) => void
  onProgress?: (pct: number, stage: string) => void
}

let workerInstance: Worker | null = null
let nextRequestId = 1
const pendingJobs = new Map<number, PendingWorkerJob>()
const inFlightKeyPromises = new Map<string, Promise<string>>()

function getOrCreateWorker(): Worker {
  if (workerInstance) return workerInstance
  const worker = new Worker("/workers/noctis-mms-worker.js", { type: "module" })
  worker.onmessage = (event: MessageEvent) => {
    const msg = event.data
    if (!msg || typeof msg !== "object") return
    const job = pendingJobs.get(msg.requestId)
    if (!job) return

    if (msg.type === "progress") {
      job.onProgress?.(msg.pct, msg.stage)
      if (msg.pct === 100 && msg.stage === "ready" && msg.lang) {
        readyLanguages.add(msg.lang)
      }
      return
    }

    pendingJobs.delete(msg.requestId)
    if (msg.type === "result" && msg.wavBuffer) {
      job.resolve(msg.wavBuffer as ArrayBuffer)
    } else if (msg.type === "error") {
      job.reject(new Error(String(msg.message || "MMS worker error")))
    }
  }
  worker.onerror = (err) => {
    const errObj = new Error(err?.message || "MMS Web Worker failed")
    for (const [id, job] of pendingJobs.entries()) {
      pendingJobs.delete(id)
      job.reject(errObj)
    }
    try {
      worker.terminate()
    } catch {}
    workerInstance = null
  }
  workerInstance = worker
  return worker
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
  return readyLanguages.has(lang)
}

export function cancelPendingNativeMmsSpeech(): void {
  if (typeof window === "undefined" || !workerInstance) return
  try {
    workerInstance.postMessage({ type: "cancel" })
  } catch {}
  for (const [id, job] of pendingJobs.entries()) {
    pendingJobs.delete(id)
    job.reject(new Error("Cancelled"))
  }
}

async function runWorkerSynthesis(
  rawText: string,
  lang: LanguageCode,
  priority: "high" | "low",
  onProgress?: (pct: number, stage: string) => void
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
    onProgress?.(100, "ready")
    return cachedUrl
  }

  const existingInFlight = inFlightKeyPromises.get(cacheKey)
  if (existingInFlight) {
    return existingInFlight
  }

  const chunks = splitMmsSpeakableChunks(normalized)
  if (chunks.length === 0) {
    throw new Error("Nothing speakable after normalization")
  }

  const synthPromise = (async () => {
    const worker = getOrCreateWorker()
    const requestId = nextRequestId++

    // Cancel stale queued jobs before starting a new high-priority speech request
    if (priority === "high") {
      for (const [oldId, oldJob] of pendingJobs.entries()) {
        pendingJobs.delete(oldId)
        try {
          worker.postMessage({ type: "cancel", requestId: oldId })
        } catch {}
        oldJob.reject(new Error("Superseded by newer request"))
      }
    }

    const wavBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      pendingJobs.set(requestId, {
        resolve,
        reject,
        onProgress: (pct, stage) => {
          if (pct >= 100) readyLanguages.add(lang)
          onProgress?.(pct, stage)
        },
      })

      worker.postMessage({
        type: "synthesize",
        requestId,
        lang,
        profile,
        chunks,
        priority,
      })
    })

    readyLanguages.add(lang)
    const blob = new Blob([wavBuffer], { type: "audio/wav" })
    const blobUrl = URL.createObjectURL(blob)
    storeBlobCache(cacheKey, blobUrl)
    return blobUrl
  })()

  inFlightKeyPromises.set(cacheKey, synthPromise)
  try {
    return await synthPromise
  } finally {
    inFlightKeyPromises.delete(cacheKey)
  }
}

export async function synthesizeNativeMmsSpeech(
  rawText: string,
  lang: LanguageCode,
  opts?: { onProgress?: (pct: number, stage: string) => void }
): Promise<string> {
  return runWorkerSynthesis(rawText, lang, "high", opts?.onProgress)
}

export function prefetchNativeMmsSpeech(rawText: string, lang: LanguageCode): void {
  if (typeof window === "undefined") return
  if (!readyLanguages.has(lang)) return
  if (pendingJobs.size > 0) return
  const profile = getLanguageVoiceProfile(lang)
  if (profile.mode !== "client-mms-native") return
  const normalized = normalizeTextForMms(rawText, lang)
  if (!normalized || audioBlobCache.has(`${lang}::${normalized}`)) return
  runWorkerSynthesis(rawText, lang, "low").catch(() => {})
}
