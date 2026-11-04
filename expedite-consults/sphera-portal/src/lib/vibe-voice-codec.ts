"use client"

export interface EncodedVoiceChunk {
  seq: number
  data_url: string
  ts: number
}

const TARGET_SAMPLE_RATE = 5500 // 5.5 kHz voice band (~2,640 bytes per 480ms chunk = ~3.5 KB base64)
const DEFAULT_CHUNK_DURATION_MS = 480

let sharedVoiceAudioCtx: AudioContext | null = null

export function getSharedVoiceAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (Ctx && (!sharedVoiceAudioCtx || sharedVoiceAudioCtx.state === "closed")) {
      sharedVoiceAudioCtx = new Ctx()
    }
    if (sharedVoiceAudioCtx && sharedVoiceAudioCtx.state === "suspended") {
      sharedVoiceAudioCtx.resume().catch(() => {})
    }
  } catch {
    // ignore
  }
  return sharedVoiceAudioCtx
}

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
  for (let i = 0; i < outBytes.length; i++) {
    binary += String.fromCharCode(outBytes[i])
  }
  return `data:audio/wav;base64,${typeof window !== "undefined" ? window.btoa(binary) : ""}`
}

/**
 * Lightweight single-AudioContext microphone voice capture & level meter.
 * Never invokes MediaRecorder (preventing macOS CoreAudio/AudioToolbox camera/mic freezes)
 * and reuses the single shared AudioContext across the studio.
 */
export function startLiveVoiceChunkCapture(
  stream: MediaStream,
  isMutedGetter: () => boolean,
  onChunk: (latest: EncodedVoiceChunk, recentChunks: EncodedVoiceChunk[]) => void,
  chunkDurationMs: number = DEFAULT_CHUNK_DURATION_MS,
  onMicLevel?: (level0to100: number) => void
): () => void {
  if (typeof window === "undefined") return () => {}
  const audioTracks = stream.getAudioTracks().filter((t) => t.readyState === "live")
  if (audioTracks.length === 0) return () => {}

  let stopped = false
  let seq = Math.floor(Date.now() / 100) * 10
  const recentQueue: EncodedVoiceChunk[] = []

  let sourceNode: MediaStreamAudioSourceNode | null = null
  let processorNode: ScriptProcessorNode | null = null
  let silentGainNode: GainNode | null = null

  const audioCtx = getSharedVoiceAudioContext()
  if (!audioCtx) return () => {}

  try {
    const inputRate = audioCtx.sampleRate || 48000
    const ratio = Math.max(1, inputRate / TARGET_SAMPLE_RATE)
    const samplesPerChunk = Math.floor((TARGET_SAMPLE_RATE * chunkDurationMs) / 1000)
    let floatSamples = new Float32Array(samplesPerChunk)
    let writeIdx = 0
    let sumSq = 0
    let peakAbs = 0
    let resamplePos = 0

    sourceNode = audioCtx.createMediaStreamSource(new MediaStream([audioTracks[0]]))
    processorNode = audioCtx.createScriptProcessor(4096, 1, 1)
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
          if (onMicLevel) {
            const uiLevel = Math.min(100, Math.max(8, Math.round(rms * 380)))
            onMicLevel(uiLevel)
          }

          if (peakAbs > 0.0002 || rms > 0.0001) {
            const targetGain = rms > 0.0006 ? Math.min(7.5, Math.max(2.0, 0.20 / rms)) : 3.2
            const pcmBytes = new Uint8Array(samplesPerChunk)
            for (let i = 0; i < samplesPerChunk; i++) {
              const boosted = Math.tanh(floatSamples[i] * targetGain)
              pcmBytes[i] = Math.max(0, Math.min(255, Math.round((boosted + 1) * 127.5)))
            }
            const wavDataUrl = encodeUint8PcmToWavDataUrl(pcmBytes, TARGET_SAMPLE_RATE)
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
  } catch {
    // ignore WebAudio setup error
  }

  const resumeOnGesture = () => {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {})
    }
  }

  window.addEventListener("pointerdown", resumeOnGesture, { passive: true })
  window.addEventListener("touchstart", resumeOnGesture, { passive: true })
  window.addEventListener("keydown", resumeOnGesture)
  window.addEventListener("click", resumeOnGesture, { passive: true })

  return () => {
    stopped = true
    window.removeEventListener("pointerdown", resumeOnGesture)
    window.removeEventListener("touchstart", resumeOnGesture)
    window.removeEventListener("keydown", resumeOnGesture)
    window.removeEventListener("click", resumeOnGesture)
    try {
      processorNode?.disconnect()
      sourceNode?.disconnect()
      silentGainNode?.disconnect()
    } catch {
      // ignore cleanup errors
    }
  }
}

/**
 * Gapless multi-peer voice chunk player using the shared AudioContext + HTML5 <audio> fallback.
 */
export class GaplessRemoteVoicePlayer {
  private lastPlayedSeqByPeer = new Map<string, number>()
  private nextStartTimeByPeer = new Map<string, number>()
  private htmlAudioPool: HTMLAudioElement[] = []
  private htmlAudioPoolIdx = 0

  public ensureUnlocked(): AudioContext | null {
    return getSharedVoiceAudioContext()
  }

  public unlock(): void {
    this.ensureUnlocked()
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
    const unplayed = valid.filter((c) => c.seq > lastSeq)
    if (unplayed.length === 0) return

    // If multiple chunks arrived in a burst or first time joining, only play the newest 1-2 chunks so voice never lags behind real-time
    const toPlay = lastSeq === -1 ? unplayed.slice(-1) : unplayed.slice(-2)
    if (unplayed.length > toPlay.length) {
      this.lastPlayedSeqByPeer.set(peerKey, unplayed[unplayed.length - toPlay.length - 1].seq)
    }

    for (const chunk of toPlay) {
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
    // Keep max buffered lookahead under 0.65s so audio stays tightly synchronized with live video
    const startAt = prevEnd > now && prevEnd - now < 0.65 ? prevEnd : now + 0.006
    src.start(startAt)
    this.nextStartTimeByPeer.set(peerKey, startAt + audioBuffer.duration)
  }

  private playSingleChunk(peerKey: string, dataUrl: string): void {
    const ctx = this.ensureUnlocked()

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

    this.playViaHtmlAudioElement(dataUrl)
  }
}
