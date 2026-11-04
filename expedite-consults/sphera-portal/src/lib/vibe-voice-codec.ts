"use client"

export interface EncodedVoiceChunk {
  seq: number
  data_url: string
  ts: number
}

const TARGET_SAMPLE_RATE = 5500 // 5.5 kHz voice band (~4,950 bytes per 900ms chunk = ~6.6 KB base64)
const CHUNK_DURATION_MS = 900

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
 * Starts capturing live voice from a MediaStream, downsampling to 5.5 kHz mono WAV chunks every 900ms,
 * and invoking `onChunk` with both the latest chunk and the rolling 2-chunk history.
 */
export function startLiveVoiceChunkCapture(
  stream: MediaStream,
  isMutedGetter: () => boolean,
  onChunk: (latest: EncodedVoiceChunk, recentChunks: EncodedVoiceChunk[]) => void,
  chunkDurationMs: number = CHUNK_DURATION_MS
): () => void {
  if (typeof window === "undefined") return () => {}
  const audioTracks = stream.getAudioTracks().filter((t) => t.readyState === "live")
  if (audioTracks.length === 0) return () => {}

  let stopped = false
  let seq = Math.floor(Date.now() / 1000) * 10
  const recentQueue: EncodedVoiceChunk[] = []

  // Primary WebAudio PCM -> WAV pipeline (100% cross-browser compatible: Chrome, Safari, iOS, Android, Firefox)
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
      let currentBuffer = new Uint8Array(samplesPerChunk)
      let writeIdx = 0
      let sumSq = 0
      let sampleCount = 0
      let resamplePos = 0

      sourceNode = audioCtx.createMediaStreamSource(new MediaStream([audioTracks[0]]))
      processorNode = audioCtx.createScriptProcessor(4096, 1, 1)
      silentGainNode = audioCtx.createGain()
      silentGainNode.gain.value = 0 // Do not echo local mic to local speakers

      processorNode.onaudioprocess = (e) => {
        if (stopped || isMutedGetter() || !audioTracks[0].enabled) {
          writeIdx = 0
          sumSq = 0
          sampleCount = 0
          return
        }
        const input = e.inputBuffer.getChannelData(0)
        if (!input || input.length === 0) return

        while (resamplePos < input.length) {
          const idx = Math.min(input.length - 1, Math.floor(resamplePos))
          const rawSample = input[idx]
          sumSq += rawSample * rawSample
          sampleCount += 1

          // Soft voice pre-emphasis & 2.4x gain with smooth tanh limiter so speech is loud and clear
          const boosted = Math.tanh(rawSample * 2.4)
          const byteVal = Math.max(0, Math.min(255, Math.round((boosted + 1) * 127.5)))
          currentBuffer[writeIdx++] = byteVal

          if (writeIdx >= samplesPerChunk) {
            const rms = sampleCount > 0 ? Math.sqrt(sumSq / sampleCount) : 0
            // Transmit whenever voice/sound energy is above complete silence (> 0.0025 RMS)
            if (rms > 0.0025) {
              const wavDataUrl = encodeUint8PcmToWavDataUrl(currentBuffer, TARGET_SAMPLE_RATE)
              seq += 1
              const chunk: EncodedVoiceChunk = {
                seq,
                data_url: wavDataUrl,
                ts: Date.now(),
              }
              recentQueue.push(chunk)
              while (recentQueue.length > 2) {
                recentQueue.shift()
              }
              onChunk(chunk, [...recentQueue])
            }
            currentBuffer = new Uint8Array(samplesPerChunk)
            writeIdx = 0
            sumSq = 0
            sampleCount = 0
          }

          resamplePos += ratio
        }
        resamplePos -= input.length
        if (resamplePos < 0) resamplePos = 0
      }

      sourceNode.connect(processorNode)
      processorNode.connect(silentGainNode)
      silentGainNode.connect(audioCtx.destination)

      const resumeOnGesture = () => {
        if (audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume().catch(() => {})
        }
      }
      window.addEventListener("pointerdown", resumeOnGesture)
      window.addEventListener("touchstart", resumeOnGesture)
      window.addEventListener("keydown", resumeOnGesture)

      return () => {
        stopped = true
        window.removeEventListener("pointerdown", resumeOnGesture)
        window.removeEventListener("touchstart", resumeOnGesture)
        window.removeEventListener("keydown", resumeOnGesture)
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
  } catch {
    // Fallback handled below
  }

  return () => {
    stopped = true
  }
}

/**
 * Gapless multi-peer voice chunk player.
 * Directly reconstructs Float32 AudioBuffers from `data:audio/wav;base64,...` (with smooth fade-in/out)
 * and schedules them back-to-back per speaker on a shared AudioContext, with HTML5 <audio> fallback.
 */
export class GaplessRemoteVoicePlayer {
  private ctx: AudioContext | null = null
  private lastPlayedSeqByPeer = new Map<string, number>()
  private nextStartTimeByPeer = new Map<string, number>()

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
      // If we just joined a room, don't replay a chunk older than 8 seconds
      if (lastSeq === -1 && valid.length > 1 && chunk !== valid[valid.length - 1]) {
        this.lastPlayedSeqByPeer.set(peerKey, chunk.seq)
        continue
      }
      this.lastPlayedSeqByPeer.set(peerKey, chunk.seq)
      this.playSingleChunk(peerKey, chunk.data_url)
    }
  }

  private playSingleChunk(peerKey: string, dataUrl: string): void {
    const ctx = this.ensureUnlocked()

    // Fast synchronous WAV PCM direct synthesis (works identically on Safari, Chrome, Firefox, Edge, iOS, Android)
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
            const fadeSamples = Math.min(80, Math.floor(numSamples / 10))

            for (let i = 0; i < numSamples; i++) {
              let sample = (pcmBytes[i] - 127.5) / 127.5
              // Smooth 14ms fade-in and fade-out to eliminate any boundary clicks between chunks
              if (i < fadeSamples) {
                sample *= i / fadeSamples
              } else if (i > numSamples - fadeSamples) {
                sample *= (numSamples - i) / fadeSamples
              }
              channel[i] = sample
            }

            const src = ctx.createBufferSource()
            src.buffer = audioBuffer
            const gain = ctx.createGain()
            gain.gain.value = 1.45
            src.connect(gain)
            gain.connect(ctx.destination)

            const now = ctx.currentTime
            const prevEnd = this.nextStartTimeByPeer.get(peerKey) || 0
            // Schedule seamlessly back-to-back (or immediately if queue drained or drifted > 1.8s)
            const startAt = prevEnd > now && prevEnd - now < 1.8 ? prevEnd : now + 0.01
            src.start(startAt)
            this.nextStartTimeByPeer.set(peerKey, startAt + audioBuffer.duration)

            // If AudioContext was still suspended, also trigger HTML5 <audio> fallback so audio is heard immediately
            if (ctx.state === "suspended") {
              ctx.resume().catch(() => {})
              const fallbackAudio = new Audio(dataUrl)
              fallbackAudio.volume = 1.0
              fallbackAudio.play().catch(() => {})
            }
            return
          }
        }
      } catch {
        // Fallback to decodeAudioData / HTMLAudioElement below
      }
    }

    // Fallback for non-WAV audio chunks (e.g. webm/mp4)
    try {
      const audio = new Audio(dataUrl)
      audio.volume = 1.0
      audio.play().catch(() => {})
    } catch {
      // ignore
    }
  }
}
