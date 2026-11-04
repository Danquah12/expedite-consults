"use client"

export interface EncodedVoiceChunk {
  seq: number
  data_url: string
  ts: number
}

const TARGET_SAMPLE_RATE = 6000 // 6.0 kHz crisp voice band (~4,500 bytes per 750ms chunk = ~6.0 KB base64)
const DEFAULT_CHUNK_DURATION_MS = 750

function encodeUint8PcmToWavDataUrl(samples: Uint8Array, sampleRate: number): string {
  const dataLen = samples.length
  const buffer = new ArrayBuffer(44 + dataLen)
  const view = new DataView(buffer)

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  // Standard 44-byte RIFF WAVE header (8-bit unsigned mono PCM — supported natively by every browser & OS)
  writeStr(0, "RIFF")
  view.setUint32(4, 36 + dataLen, true)
  writeStr(8, "WAVE")
  writeStr(12, "fmt ")
  view.setUint32(16, 16, true) // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true)  // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true)  // NumChannels (1 = mono)
  view.setUint32(24, sampleRate, true) // SampleRate
  view.setUint32(28, sampleRate, true) // ByteRate (SampleRate * 1 * 1)
  view.setUint16(32, 1, true)  // BlockAlign (1)
  view.setUint16(34, 8, true)  // BitsPerSample (8-bit unsigned)
  writeStr(36, "data")
  view.setUint32(40, dataLen, true)

  const outBytes = new Uint8Array(buffer)
  outBytes.set(samples, 44)

  let binary = ""
  const chunkSize = 0x8000
  for (let i = 0; i < outBytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(outBytes.subarray(i, i + chunkSize))
    )
  }
  return `data:audio/wav;base64,${typeof window !== "undefined" ? window.btoa(binary) : ""}`
}

/**
 * Dual-engine live microphone voice chunk capture:
 * 1. Primary WebAudio ScriptProcessorNode -> 6.0 kHz 8-bit RIFF WAVE PCM with Automatic Gain Control (AGC)
 *    so even quiet laptop/mobile microphones are transmitted loud and clear across Chrome, Safari, iOS, Android, Edge, and Firefox.
 * 2. Automatic MediaRecorder parallel fallback whenever the browser's AudioContext starts in "suspended" state
 *    (e.g., when a guest joins via invite link without clicking inside the page yet), guaranteeing zero-click voice transmission.
 */
export function startLiveVoiceChunkCapture(
  stream: MediaStream,
  isMutedGetter: () => boolean,
  onChunk: (latest: EncodedVoiceChunk, recentChunks: EncodedVoiceChunk[]) => void,
  chunkDurationMs: number = DEFAULT_CHUNK_DURATION_MS
): () => void {
  if (typeof window === "undefined") return () => {}
  const audioTracks = stream.getAudioTracks().filter((t) => t.readyState === "live")
  if (audioTracks.length === 0) return () => {}

  let stopped = false
  let seq = Math.floor(Date.now() / 100) * 10
  let lastWebAudioChunkAtMs = 0
  const recentQueue: EncodedVoiceChunk[] = []

  const emitChunk = (dataUrl: string) => {
    if (stopped || !dataUrl || !dataUrl.startsWith("data:audio/")) return
    seq += 1
    const chunk: EncodedVoiceChunk = {
      seq,
      data_url: dataUrl,
      ts: Date.now(),
    }
    recentQueue.push(chunk)
    while (recentQueue.length > 2) {
      recentQueue.shift()
    }
    onChunk(chunk, [...recentQueue])
  }

  let audioCtx: AudioContext | null = null
  let sourceNode: MediaStreamAudioSourceNode | null = null
  let processorNode: ScriptProcessorNode | null = null
  let silentGainNode: GainNode | null = null

  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (Ctx) {
      audioCtx = new Ctx()
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {})
      }
      const inputRate = audioCtx.sampleRate || 48000
      const ratio = inputRate / TARGET_SAMPLE_RATE
      const samplesPerChunk = Math.floor((TARGET_SAMPLE_RATE * chunkDurationMs) / 1000)
      let floatSamples = new Float32Array(samplesPerChunk)
      let writeIdx = 0
      let sumSq = 0
      let peakAbs = 0
      let resamplePos = 0

      sourceNode = audioCtx.createMediaStreamSource(new MediaStream([audioTracks[0]]))
      processorNode = audioCtx.createScriptProcessor(2048, 1, 1)
      silentGainNode = audioCtx.createGain()
      silentGainNode.gain.value = 0

      processorNode.onaudioprocess = (e) => {
        if (stopped || isMutedGetter() || !audioTracks[0].enabled) {
          writeIdx = 0
          sumSq = 0
          peakAbs = 0
          return
        }
        const input = e.inputBuffer.getChannelData(0)
        if (!input || input.length === 0) return

        while (resamplePos < input.length) {
          const idx = Math.min(input.length - 1, Math.floor(resamplePos))
          const rawSample = input[idx]
          sumSq += rawSample * rawSample
          const absVal = Math.abs(rawSample)
          if (absVal > peakAbs) peakAbs = absVal
          floatSamples[writeIdx++] = rawSample

          if (writeIdx >= samplesPerChunk) {
            const rms = Math.sqrt(sumSq / samplesPerChunk)
            lastWebAudioChunkAtMs = Date.now()

            // Transmit unless pure digital zero (e.g. hardware muted at OS level)
            if (peakAbs > 0.00015 || rms > 0.00008) {
              // Automatic Gain Control (AGC): normalize quiet mics toward target RMS 0.20 (clamped between 2.2x and 9.0x)
              const targetGain = rms > 0.0005 ? Math.min(9.0, Math.max(2.2, 0.22 / rms)) : 3.5
              const pcmBytes = new Uint8Array(samplesPerChunk)
              for (let i = 0; i < samplesPerChunk; i++) {
                const boosted = Math.tanh(floatSamples[i] * targetGain)
                pcmBytes[i] = Math.max(0, Math.min(255, Math.round((boosted + 1) * 127.5)))
              }
              const wavDataUrl = encodeUint8PcmToWavDataUrl(pcmBytes, TARGET_SAMPLE_RATE)
              emitChunk(wavDataUrl)
            }
            floatSamples = new Float32Array(samplesPerChunk)
            writeIdx = 0
            sumSq = 0
            peakAbs = 0
          }

          resamplePos += ratio
        }
        resamplePos -= input.length
        if (resamplePos < 0) resamplePos = 0
      }

      sourceNode.connect(processorNode)
      processorNode.connect(silentGainNode)
      silentGainNode.connect(audioCtx.destination)
    }
  } catch {
    // Fallback handled by MediaRecorder below
  }

  // Engine 2: MediaRecorder fallback that automatically captures & converts/transmits voice whenever AudioContext is suspended
  let fallbackIntervalId: ReturnType<typeof setInterval> | null = null
  let activeRecorder: MediaRecorder | null = null

  if (typeof MediaRecorder !== "undefined") {
    const audioOnlyStream = new MediaStream([audioTracks[0]])
    const mimeCandidates = [
      "audio/mp4",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
    ]
    const supportedMime =
      mimeCandidates.find((m) => {
        try {
          return typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(m)
        } catch {
          return false
        }
      }) || ""

    const recordFallbackSlice = () => {
      if (stopped || isMutedGetter() || !audioTracks[0].enabled) return
      // Try resuming AudioContext on every tick
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {})
      }
      // If WebAudio ScriptProcessorNode is actively emitting WAV chunks, no fallback slice needed
      if (Date.now() - lastWebAudioChunkAtMs < chunkDurationMs + 350) return

      try {
        const options: MediaRecorderOptions = supportedMime
          ? { mimeType: supportedMime, audioBitsPerSecond: 14000 }
          : { audioBitsPerSecond: 14000 }
        const rec = new MediaRecorder(audioOnlyStream, options)
        activeRecorder = rec
        const parts: BlobPart[] = []
        rec.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) parts.push(ev.data)
        }
        rec.onstop = () => {
          if (stopped || parts.length === 0) return
          if (Date.now() - lastWebAudioChunkAtMs < chunkDurationMs + 250) return
          const blob = new Blob(parts, { type: rec.mimeType || supportedMime || "audio/webm" })
          if (blob.size < 60 || blob.size > 12000) return
          const reader = new FileReader()
          reader.onloadend = () => {
            if (stopped) return
            const dataUrl = typeof reader.result === "string" ? reader.result : ""
            if (dataUrl.startsWith("data:audio/")) {
              emitChunk(dataUrl)
            }
          }
          reader.readAsDataURL(blob)
        }
        rec.start()
        setTimeout(() => {
          if (rec.state === "recording") {
            try {
              rec.stop()
            } catch {
              // ignore
            }
          }
        }, Math.min(720, chunkDurationMs))
      } catch {
        // ignore
      }
    }

    fallbackIntervalId = setInterval(recordFallbackSlice, chunkDurationMs + 50)
  }

  const resumeOnAnyActivity = () => {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {})
    }
  }

  window.addEventListener("pointerdown", resumeOnAnyActivity)
  window.addEventListener("pointermove", resumeOnAnyActivity, { passive: true })
  window.addEventListener("mousemove", resumeOnAnyActivity, { passive: true })
  window.addEventListener("touchstart", resumeOnAnyActivity, { passive: true })
  window.addEventListener("keydown", resumeOnAnyActivity)
  window.addEventListener("click", resumeOnAnyActivity)

  return () => {
    stopped = true
    if (fallbackIntervalId) clearInterval(fallbackIntervalId)
    if (activeRecorder && activeRecorder.state === "recording") {
      try {
        activeRecorder.stop()
      } catch {
        // ignore
      }
    }
    window.removeEventListener("pointerdown", resumeOnAnyActivity)
    window.removeEventListener("pointermove", resumeOnAnyActivity)
    window.removeEventListener("mousemove", resumeOnAnyActivity)
    window.removeEventListener("touchstart", resumeOnAnyActivity)
    window.removeEventListener("keydown", resumeOnAnyActivity)
    window.removeEventListener("click", resumeOnAnyActivity)
    try {
      processorNode?.disconnect()
      sourceNode?.disconnect()
      silentGainNode?.disconnect()
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {})
      }
    } catch {
      // ignore cleanup errors
    }
  }
}

/**
 * Gapless multi-peer voice chunk player.
 * Directly reconstructs Float32 AudioBuffers from `data:audio/wav;base64,...` (with smooth fade-in/out)
 * AND decodes `MediaRecorder` `data:audio/webm` / `data:audio/mp4` chunks, scheduling them back-to-back per speaker
 * on a shared AudioContext with an HTML5 <audio> element pool fallback.
 */
export class GaplessRemoteVoicePlayer {
  private ctx: AudioContext | null = null
  private lastPlayedSeqByPeer = new Map<string, number>()
  private nextStartTimeByPeer = new Map<string, number>()
  private htmlAudioPool: HTMLAudioElement[] = []
  private htmlAudioPoolIdx = 0

  public ensureUnlocked(): AudioContext | null {
    if (typeof window === "undefined") return null
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (Ctx && (!this.ctx || this.ctx.state === "closed")) {
        this.ctx = new Ctx()
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {})
      }
    } catch {
      // ignore
    }
    return this.ctx
  }

  public unlock(): void {
    this.ensureUnlocked()
    // Pre-warm HTML5 Audio pool during user interaction so mobile Safari / Chrome never block fallback playback
    if (typeof window !== "undefined" && this.htmlAudioPool.length === 0) {
      for (let i = 0; i < 4; i++) {
        try {
          const a = new Audio()
          a.preload = "auto"
          a.volume = 1.0
          this.htmlAudioPool.push(a)
        } catch {
          // ignore
        }
      }
    }
  }

  public enqueueChunks(
    peerKey: string,
    chunks: Array<EncodedVoiceChunk | { seq: number; data_url: string; ts?: number | string } | null | undefined>,
    isRemoteMuted?: boolean
  ): void {
    this.playChunksForPeer(peerKey, chunks, isRemoteMuted)
  }

  public enqueueChunk(
    peerKey: string,
    chunk: EncodedVoiceChunk | { seq: number; data_url: string; ts?: number | string } | null | undefined,
    isRemoteMuted?: boolean
  ): void {
    if (chunk) {
      this.playChunksForPeer(peerKey, [chunk], isRemoteMuted)
    }
  }

  public playChunksForPeer(
    peerKey: string,
    chunks: Array<EncodedVoiceChunk | { seq: number; data_url: string; ts?: number | string } | null | undefined>,
    isRemoteMuted?: boolean
  ): void {
    if (isRemoteMuted || !chunks || chunks.length === 0) return
    const valid = chunks
      .filter(
        (c): c is { seq: number; data_url: string; ts?: number | string } =>
          Boolean(c && typeof c.seq === "number" && typeof c.data_url === "string" && c.data_url.startsWith("data:audio/"))
      )
      .sort((a, b) => a.seq - b.seq)

    if (valid.length === 0) return

    const lastSeq = this.lastPlayedSeqByPeer.get(peerKey) ?? -1
    for (const chunk of valid) {
      if (chunk.seq <= lastSeq) continue
      // When joining a room, skip older buffered chunks and start cleanly with the freshest chunk
      if (lastSeq === -1 && valid.length > 1 && chunk !== valid[valid.length - 1]) {
        this.lastPlayedSeqByPeer.set(peerKey, chunk.seq)
        continue
      }
      this.lastPlayedSeqByPeer.set(peerKey, chunk.seq)
      this.playSingleChunk(peerKey, chunk.data_url)
    }
  }

  private playViaHtmlAudioElement(dataUrl: string): void {
    try {
      let audio: HTMLAudioElement
      if (this.htmlAudioPool.length > 0) {
        audio = this.htmlAudioPool[this.htmlAudioPoolIdx % this.htmlAudioPool.length]
        this.htmlAudioPoolIdx += 1
        audio.src = dataUrl
      } else {
        audio = new Audio(dataUrl)
      }
      audio.volume = 1.0
      audio.play().catch(() => {})
    } catch {
      // ignore
    }
  }

  private scheduleAudioBuffer(peerKey: string, ctx: AudioContext, audioBuffer: AudioBuffer, gainValue = 1.85): void {
    const src = ctx.createBufferSource()
    src.buffer = audioBuffer
    const gain = ctx.createGain()
    gain.gain.value = gainValue
    src.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    const prevEnd = this.nextStartTimeByPeer.get(peerKey) || 0
    const startAt = prevEnd > now && prevEnd - now < 1.6 ? prevEnd : now + 0.008
    src.start(startAt)
    this.nextStartTimeByPeer.set(peerKey, startAt + audioBuffer.duration)
  }

  private playSingleChunk(peerKey: string, dataUrl: string): void {
    const ctx = this.ensureUnlocked()

    // 1. Fast synchronous WAV PCM direct synthesis (works identically on Safari, Chrome, Firefox, Edge, iOS, Android)
    if (ctx && dataUrl.startsWith("data:audio/wav;base64,")) {
      try {
        const b64 = dataUrl.slice("data:audio/wav;base64,".length)
        const binary = window.atob(b64)
        if (binary.length > 48) {
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }
          const view = new DataView(bytes.buffer)
          const sampleRate = view.getUint32(24, true) || TARGET_SAMPLE_RATE
          const bitsPerSample = view.getUint16(34, true) || 8
          const pcmBytes = bytes.subarray(44)

          if (bitsPerSample === 8 && pcmBytes.length > 0) {
            const numSamples = pcmBytes.length
            const audioBuffer = ctx.createBuffer(1, numSamples, sampleRate)
            const channel = audioBuffer.getChannelData(0)
            const fadeSamples = Math.min(72, Math.floor(numSamples / 12))

            for (let i = 0; i < numSamples; i++) {
              let sample = (pcmBytes[i] - 127.5) / 127.5
              if (i < fadeSamples) {
                sample *= i / fadeSamples
              } else if (i > numSamples - fadeSamples) {
                sample *= (numSamples - i) / fadeSamples
              }
              channel[i] = sample
            }

            if (ctx.state === "running") {
              this.scheduleAudioBuffer(peerKey, ctx, audioBuffer, 1.85)
              return
            } else {
              ctx.resume().catch(() => {})
              this.scheduleAudioBuffer(peerKey, ctx, audioBuffer, 1.85)
              this.playViaHtmlAudioElement(dataUrl)
              return
            }
          }
        }
      } catch {
        // Fallback below
      }
    }

    // 2. Non-WAV audio chunks (e.g. MediaRecorder webm/mp4 fallback when sender's AudioContext was suspended)
    if (ctx && ctx.state === "running") {
      try {
        const commaIdx = dataUrl.indexOf(",")
        if (commaIdx !== -1) {
          const b64 = dataUrl.slice(commaIdx + 1)
          const binary = window.atob(b64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }
          ctx
            .decodeAudioData(bytes.buffer.slice(0))
            .then((decoded) => {
              this.scheduleAudioBuffer(peerKey, ctx, decoded, 1.75)
            })
            .catch(() => {
              this.playViaHtmlAudioElement(dataUrl)
            })
          return
        }
      } catch {
        // Fallback to HTML5 <audio> below
      }
    }

    this.playViaHtmlAudioElement(dataUrl)
  }
}
