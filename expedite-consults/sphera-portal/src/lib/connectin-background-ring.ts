"use client"

/**
 * ConnectLn Always-On Minimized & Background Ringing + Pop-Up Call Screen Engine
 * ------------------------------------------------------------------------------
 * Solves ALL browser & OS background blocks when ConnectLn is minimized on Desktop or Mobile:
 * 1. Hardware-Thread Audio Keep-Alive:
 *    - Plays a continuous 20 Hz sub-sonic wave (-36.7 dBFS: 100% below laptop/phone speaker
 *      cutoff & inaudible to human ears, yet well above Chromium/WebKit's -70 dBFS silence
 *      detector) via BOTH a looping `AudioBufferSourceNode` connected DIRECTLY to
 *      `AudioContext.destination` AND a DOM-attached `<audio loop>` + `MediaSession`.
 *    - Prevents Edge Sleeping Tabs, Chrome Intensive Throttling, and iOS/Android background
 *      suspension when the browser is minimized.
 * 2. Zero-Timer C++ Hardware Ringtone Loop:
 *    - Pre-decodes a 2.4s dual-burst phone ringtone `AudioBuffer` and plays it with
 *      `ringSource.loop = true` directly on `AudioContext.destination` (zero reliance on
 *      throttled main-thread `setInterval`!).
 * 3. Real Always-On-Top Pop-Up Call Screen Over Minimized Browser:
 *    - Opens a compact 320x215 `documentPictureInPicture` Standby Call Receiver on Desktop
 *      (and registers Chrome/Edge Auto-PiP `enterpictureinpicture` via MediaSession) that
 *      remains floating on top of the desktop even when Edge/Chrome is minimized to the taskbar,
 *      and transforms instantly into the pulsing Answer / Decline Call Screen when a call arrives!
 *    - Automatically closes whenever the user hosts an active call modal on this tab so zero
 *      extra boxes appear during calls.
 */

let liveAudioCtx: AudioContext | null = null
let keepAliveBuffer: AudioBuffer | null = null
let ringtoneBuffer: AudioBuffer | null = null
let keepAliveSource: AudioBufferSourceNode | null = null
let activeRingSource: AudioBufferSourceNode | null = null
let activeRingGain: GainNode | null = null

let keepAliveHtmlAudio: HTMLAudioElement | null = null
let fallbackWavRingAudio: HTMLAudioElement | null = null
let outgoingRingbackAudio: HTMLAudioElement | null = null
let outgoingRingbackBuffer: AudioBuffer | null = null
let activeOutgoingRingbackSource: AudioBufferSourceNode | null = null
let activeOutgoingRingbackGain: GainNode | null = null
let isIncomingRingtoneActive = false
let isOutgoingRingbackActive = false
let autoPipVideoEl: HTMLVideoElement | null = null
let autoPipCanvasTimer: ReturnType<typeof setInterval> | null = null

let ringVibrateTimer: ReturnType<typeof setInterval> | null = null
let titleFlashTimer: ReturnType<typeof setInterval> | null = null
let savedOriginalTitle = ""

let activePopupWin: Window | null = null
let activePipWin: Window | null = null
let pipForegroundPollTimer: any = null
let activeForegroundPollFn: (() => void) | null = null
let programmaticPipClose = false
const notifiedCallIds = new Set<string>()
const unlockListeners = new Set<() => void>()

export function setForegroundCallPollCallback(fn: (() => void) | null): void {
  activeForegroundPollFn = fn
}

export interface PopupIncomingCallSpec {
  callId: string
  callerName: string
  callerPhone?: string
  callMode: "audio" | "video"
  onAnswer: () => void
  onDecline: () => void
}

let currentRingingSpec: PopupIncomingCallSpec | null = null

function encodeMonoPcm16WavDataUri(samples: Int16Array, sampleRate: number): string {
  const dataBytes = samples.length * 2
  const buffer = new ArrayBuffer(44 + dataBytes)
  const view = new DataView(buffer)

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeStr(0, "RIFF")
  view.setUint32(4, 36 + dataBytes, true)
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
  view.setUint32(40, dataBytes, true)

  for (let i = 0; i < samples.length; i++) {
    view.setInt16(44 + i * 2, samples[i], true)
  }

  const bytes = new Uint8Array(buffer)
  let binary = ""
  const chunk = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return `data:audio/wav;base64,${btoa(binary)}`
}

let cachedSubSonicWavUri: string | null = null
function getSubSonicKeepAliveWavUri(): string {
  if (cachedSubSonicWavUri) return cachedSubSonicWavUri
  const sampleRate = 8000
  const totalSamples = sampleRate // exact 1.0s seamless 20 Hz cycle
  const samples = new Int16Array(totalSamples)
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate
    // Amplitude 480 / 32767 = -36.7 dBFS at 20 Hz:
    // Completely inaudible to humans & below laptop/phone speaker rolloff,
    // yet > -70 dBFS so Chromium AudioPowerMonitor & iOS/Android keep audio session awake!
    samples[i] = Math.round(Math.sin(2 * Math.PI * 20 * t) * 480)
  }
  cachedSubSonicWavUri = encodeMonoPcm16WavDataUri(samples, sampleRate)
  return cachedSubSonicWavUri
}

let cachedRingtoneUri: string | null = null
function getPhoneRingtoneWavUri(): string {
  if (cachedRingtoneUri) return cachedRingtoneUri
  const sampleRate = 16000
  const durationSec = 2.4
  const totalSamples = Math.floor(sampleRate * durationSec)
  const samples = new Int16Array(totalSamples)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate
    const inBurst1 = t >= 0.0 && t <= 0.55
    const inBurst2 = t >= 0.72 && t <= 1.32
    if (!inBurst1 && !inBurst2) {
      samples[i] = 0
      continue
    }
    const localT = inBurst1 ? t : t - 0.72
    const burstLen = inBurst1 ? 0.55 : 0.6
    const attack = Math.min(1, localT / 0.02)
    const release = Math.min(1, (burstLen - localT) / 0.04)
    const env = Math.max(0, Math.min(attack, release))
    const warble = 0.8 + 0.2 * Math.sin(2 * Math.PI * 20 * localT)
    const wave =
      0.45 * Math.sin(2 * Math.PI * 523.25 * t) +
      0.35 * Math.sin(2 * Math.PI * 659.25 * t) +
      0.2 * Math.sin(2 * Math.PI * 783.99 * t)
    samples[i] = Math.round(wave * warble * env * 24000)
  }

  cachedRingtoneUri = encodeMonoPcm16WavDataUri(samples, sampleRate)
  return cachedRingtoneUri
}

let cachedOutgoingRingbackUri: string | null = null
function getOutgoingRingbackWavUri(): string {
  if (cachedOutgoingRingbackUri) return cachedOutgoingRingbackUri
  const sampleRate = 16000
  const durationSec = 4.0 // Classic telephone ringback cadence: two dual-tone rings (0-0.65s, 0.85-1.5s) + 2.5s pause
  const totalSamples = Math.floor(sampleRate * durationSec)
  const samples = new Int16Array(totalSamples)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate
    const inPulse1 = t >= 0.0 && t <= 0.65
    const inPulse2 = t >= 0.85 && t <= 1.5
    if (!inPulse1 && !inPulse2) {
      samples[i] = 0
      continue
    }
    const localT = inPulse1 ? t : t - 0.85
    const pulseLen = 0.65
    const attack = Math.min(1, localT / 0.025)
    const release = Math.min(1, (pulseLen - localT) / 0.04)
    const env = Math.max(0, Math.min(attack, release))
    // Standard 440 Hz + 480 Hz North American / International ringback chord with warm harmonic overtone
    const wave =
      0.46 * Math.sin(2 * Math.PI * 440 * t) +
      0.46 * Math.sin(2 * Math.PI * 480 * t) +
      0.08 * Math.sin(2 * Math.PI * 880 * t)
    samples[i] = Math.round(wave * env * 19000)
  }

  cachedOutgoingRingbackUri = encodeMonoPcm16WavDataUri(samples, sampleRate)
  return cachedOutgoingRingbackUri
}

function buildAudioBuffers(ctx: AudioContext): void {
  if (!keepAliveBuffer) {
    const sr = ctx.sampleRate
    const len = sr // 1.0s exact cycle for 20 Hz
    const buf = ctx.createBuffer(1, len, sr)
    const ch = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      ch[i] = Math.sin((2 * Math.PI * 20 * i) / sr) * 0.014
    }
    keepAliveBuffer = buf
  }

  if (!ringtoneBuffer) {
    const sr = ctx.sampleRate
    const durationSec = 2.4
    const len = Math.floor(sr * durationSec)
    const buf = ctx.createBuffer(1, len, sr)
    const ch = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const t = i / sr
      const inBurst1 = t >= 0.0 && t <= 0.55
      const inBurst2 = t >= 0.72 && t <= 1.32
      if (!inBurst1 && !inBurst2) {
        ch[i] = 0
        continue
      }
      const localT = inBurst1 ? t : t - 0.72
      const burstLen = inBurst1 ? 0.55 : 0.6
      const attack = Math.min(1, localT / 0.02)
      const release = Math.min(1, (burstLen - localT) / 0.04)
      const env = Math.max(0, Math.min(attack, release))
      const warble = 0.8 + 0.2 * Math.sin(2 * Math.PI * 20 * localT)
      const wave =
        0.45 * Math.sin(2 * Math.PI * 523.25 * t) +
        0.35 * Math.sin(2 * Math.PI * 659.25 * t) +
        0.2 * Math.sin(2 * Math.PI * 783.99 * t)
      ch[i] = wave * warble * env * 0.82
    }
    ringtoneBuffer = buf
  }

  if (!outgoingRingbackBuffer) {
    const sr = ctx.sampleRate
    const durationSec = 4.0
    const len = Math.floor(sr * durationSec)
    const buf = ctx.createBuffer(1, len, sr)
    const ch = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const t = i / sr
      const inPulse1 = t >= 0.0 && t <= 0.65
      const inPulse2 = t >= 0.85 && t <= 1.5
      if (!inPulse1 && !inPulse2) {
        ch[i] = 0
        continue
      }
      const localT = inPulse1 ? t : t - 0.85
      const pulseLen = 0.65
      const attack = Math.min(1, localT / 0.025)
      const release = Math.min(1, (pulseLen - localT) / 0.04)
      const env = Math.max(0, Math.min(attack, release))
      const wave =
        0.46 * Math.sin(2 * Math.PI * 440 * t) +
        0.46 * Math.sin(2 * Math.PI * 480 * t) +
        0.08 * Math.sin(2 * Math.PI * 880 * t)
      ch[i] = wave * env * 0.55
    }
    outgoingRingbackBuffer = buf
  }
}

function setupMediaSessionAndAutoPip(): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return
  try {
    if ("mediaSession" in navigator && navigator.mediaSession) {
      if (typeof MediaMetadata !== "undefined") {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "ConnectLn Call Standby",
          artist: "Incoming voice & video call ringer active",
          album: "ConnectLn",
        })
      }
      navigator.mediaSession.playbackState = "playing"
      try {
        ;(navigator.mediaSession as any).setActionHandler("enterpictureinpicture", () => {
          void openAlwaysOnTopCallStandbyPiP()
        })
      } catch {}
    }

    // Create a lightweight 2fps offscreen `<video>` in top frame so Chrome/Edge Auto-PiP criteria are met
    if (
      isDocumentPipSupported() &&
      !autoPipVideoEl &&
      typeof document !== "undefined" &&
      document.body &&
      liveAudioCtx &&
      typeof liveAudioCtx.createMediaStreamDestination === "function"
    ) {
      const canvas = document.createElement("canvas")
      canvas.width = 160
      canvas.height = 90
      const c2d = canvas.getContext("2d")
      const drawStandby = () => {
        if (!c2d) return
        c2d.fillStyle = "#071E1A"
        c2d.fillRect(0, 0, 160, 90)
        c2d.fillStyle = "#34D399"
        c2d.font = "bold 12px sans-serif"
        c2d.fillText("ConnectLn Ready", 24, 48)
      }
      drawStandby()
      if (!autoPipCanvasTimer) {
        autoPipCanvasTimer = setInterval(drawStandby, 1500)
      }

      if (typeof canvas.captureStream === "function") {
        const vStream = canvas.captureStream(2)
        const aDest = liveAudioCtx.createMediaStreamDestination()
        if (keepAliveBuffer) {
          const src = liveAudioCtx.createBufferSource()
          src.buffer = keepAliveBuffer
          src.loop = true
          src.connect(aDest)
          src.start(0)
        }
        const combined = new MediaStream([
          ...vStream.getVideoTracks(),
          ...aDest.stream.getAudioTracks(),
        ])
        autoPipVideoEl = document.createElement("video")
        autoPipVideoEl.dataset.connectlnCallAudio = "true"
        autoPipVideoEl.srcObject = combined
        autoPipVideoEl.autoplay = true
        autoPipVideoEl.playsInline = true
        autoPipVideoEl.volume = 1.0
        autoPipVideoEl.setAttribute("aria-hidden", "true")
        autoPipVideoEl.style.cssText =
          "position:fixed;left:-9999px;top:-9999px;width:4px;height:4px;opacity:0.01;pointer-events:none;"
        document.body.appendChild(autoPipVideoEl)
        autoPipVideoEl.play().catch(() => {})
      }
    } else if (autoPipVideoEl && autoPipVideoEl.paused) {
      autoPipVideoEl.play().catch(() => {})
    }
  } catch {}
}

function notifyUnlockSubscribers(): void {
  unlockListeners.forEach((cb) => {
    try {
      cb()
    } catch {}
  })
}

function ensureLiveAudioPipelineStarted(): void {
  if (typeof window === "undefined") return
  try {
    if (!window.name) {
      window.name = "connectln_main_window"
    }

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (AudioCtx && !liveAudioCtx) {
      liveAudioCtx = new AudioCtx({ latencyHint: "playback" })
    }
    if (liveAudioCtx) {
      buildAudioBuffers(liveAudioCtx)
      if (liveAudioCtx.state === "suspended") {
        liveAudioCtx
          .resume()
          .then(() => notifyUnlockSubscribers())
          .catch(() => {})
      }
      // Connect looping 20 Hz keep-alive DIRECTLY to `liveAudioCtx.destination` (hardware speaker clock!)
      if (!keepAliveSource && keepAliveBuffer) {
        keepAliveSource = liveAudioCtx.createBufferSource()
        keepAliveSource.buffer = keepAliveBuffer
        keepAliveSource.loop = true
        keepAliveSource.connect(liveAudioCtx.destination)
        keepAliveSource.start(0)
      }
    }

    // Also attach a real `<audio loop>` element in `document.body` so OS MediaSession / mobile Safari keeps tab alive!
    if (!keepAliveHtmlAudio && typeof document !== "undefined") {
      keepAliveHtmlAudio = document.createElement("audio")
      keepAliveHtmlAudio.dataset.connectlnCallAudio = "true"
      keepAliveHtmlAudio.src = getSubSonicKeepAliveWavUri()
      keepAliveHtmlAudio.loop = true
      keepAliveHtmlAudio.autoplay = true
      keepAliveHtmlAudio.volume = 1.0
      keepAliveHtmlAudio.setAttribute("playsinline", "true")
      keepAliveHtmlAudio.setAttribute("aria-hidden", "true")
      keepAliveHtmlAudio.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0.01;pointer-events:none;"
      if (document.body) {
        document.body.appendChild(keepAliveHtmlAudio)
      }
    } else if (keepAliveHtmlAudio && typeof document !== "undefined" && document.body && !keepAliveHtmlAudio.isConnected) {
      document.body.appendChild(keepAliveHtmlAudio)
    }

    if (keepAliveHtmlAudio && keepAliveHtmlAudio.paused) {
      keepAliveHtmlAudio
        .play()
        .then(() => {
          setupMediaSessionAndAutoPip()
          notifyUnlockSubscribers()
        })
        .catch(() => {})
    } else if (keepAliveHtmlAudio && !keepAliveHtmlAudio.paused) {
      setupMediaSessionAndAutoPip()
      notifyUnlockSubscribers()
    }

    if (!fallbackWavRingAudio) {
      fallbackWavRingAudio = new Audio(getPhoneRingtoneWavUri())
      fallbackWavRingAudio.dataset.connectlnCallAudio = "true"
      fallbackWavRingAudio.loop = true
      fallbackWavRingAudio.volume = 1.0
      fallbackWavRingAudio.preload = "auto"
      fallbackWavRingAudio.setAttribute("playsinline", "true")
      fallbackWavRingAudio.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0.01;pointer-events:none;"
      if (typeof document !== "undefined" && document.body) {
        document.body.appendChild(fallbackWavRingAudio)
      }
    } else if (
      typeof document !== "undefined" &&
      document.body &&
      !fallbackWavRingAudio.isConnected
    ) {
      document.body.appendChild(fallbackWavRingAudio)
    }

    if (!outgoingRingbackAudio) {
      outgoingRingbackAudio = new Audio(getOutgoingRingbackWavUri())
      outgoingRingbackAudio.dataset.connectlnCallAudio = "true"
      outgoingRingbackAudio.loop = true
      outgoingRingbackAudio.volume = 0.65
      outgoingRingbackAudio.preload = "auto"
      outgoingRingbackAudio.setAttribute("playsinline", "true")
      outgoingRingbackAudio.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0.01;pointer-events:none;"
      if (typeof document !== "undefined" && document.body) {
        document.body.appendChild(outgoingRingbackAudio)
      }
    } else if (
      typeof document !== "undefined" &&
      document.body &&
      !outgoingRingbackAudio.isConnected
    ) {
      document.body.appendChild(outgoingRingbackAudio)
    }
  } catch {}
}

export function isBackgroundAudioUnlocked(): boolean {
  const ctxRunning = Boolean(liveAudioCtx && liveAudioCtx.state === "running")
  const htmlPlaying = Boolean(keepAliveHtmlAudio && !keepAliveHtmlAudio.paused)
  return ctxRunning || htmlPlaying
}

export function onBackgroundUnlockChange(cb: () => void): () => void {
  unlockListeners.add(cb)
  return () => {
    unlockListeners.delete(cb)
  }
}

/**
 * Unlocks the continuous hardware background audio pipeline on the user's first interaction.
 */
export function unlockBackgroundRingingSession(): void {
  if (typeof window === "undefined") return
  ensureLiveAudioPipelineStarted()

  const events = ["click", "pointerdown", "touchstart", "keydown"] as const
  const handler = () => {
    ensureLiveAudioPipelineStarted()
    if (liveAudioCtx?.state === "running" && keepAliveHtmlAudio && !keepAliveHtmlAudio.paused) {
      events.forEach((ev) => window.removeEventListener(ev, handler, true))
      notifyUnlockSubscribers()
    }
  }
  events.forEach((ev) => window.addEventListener(ev, handler, { capture: true, passive: true }))
}

export function startLoudPhoneRingtone(): void {
  if (typeof window === "undefined") return
  isIncomingRingtoneActive = true
  setCallMediaSilenceActive(true, "incoming-call-ringtone")
  ensureLiveAudioPipelineStarted()

  // 1. Hardware-thread C++ looping `AudioBufferSourceNode` (`loop = true`) — ZERO JS `setInterval` dependency!
  if (liveAudioCtx && ringtoneBuffer && !activeRingSource) {
    try {
      if (liveAudioCtx.state === "suspended") {
        liveAudioCtx.resume().catch(() => {})
      }
      const gain = liveAudioCtx.createGain()
      gain.gain.value = 1.0
      const src = liveAudioCtx.createBufferSource()
      src.buffer = ringtoneBuffer
      src.loop = true
      src.connect(gain)
      gain.connect(liveAudioCtx.destination)
      src.start(0)
      activeRingSource = src
      activeRingGain = gain
    } catch {}
  }

  // 2. Redundant HTML5 `<audio loop>` element for iOS Safari / Android Chrome / Desktop
  if (fallbackWavRingAudio) {
    fallbackWavRingAudio.muted = false
    fallbackWavRingAudio.volume = 1.0
    if (fallbackWavRingAudio.paused) {
      fallbackWavRingAudio.play().catch(() => {})
    }
  }

  // 3. If browser initially deferred audio before a user interaction, auto-resume ringtone on any pointer/touch/focus event!
  const resumeRingOnInteraction = () => {
    if (!isIncomingRingtoneActive) return
    if (liveAudioCtx && liveAudioCtx.state === "suspended") {
      liveAudioCtx.resume().catch(() => {})
    }
    if (fallbackWavRingAudio && fallbackWavRingAudio.paused) {
      fallbackWavRingAudio.muted = false
      fallbackWavRingAudio.volume = 1.0
      fallbackWavRingAudio.play().catch(() => {})
    }
  }
  window.addEventListener("pointerdown", resumeRingOnInteraction, { passive: true })
  window.addEventListener("touchstart", resumeRingOnInteraction, { passive: true })
  window.addEventListener("mousemove", resumeRingOnInteraction, { passive: true, once: true })
  window.addEventListener("focus", resumeRingOnInteraction, { passive: true })

  if (!ringVibrateTimer) {
    try {
      navigator.vibrate?.([550, 220, 550, 220, 750])
    } catch {}
    ringVibrateTimer = setInterval(() => {
      try {
        navigator.vibrate?.([550, 220, 550, 220, 750])
      } catch {}
    }, 2400)
  }
}

export function stopLoudPhoneRingtone(): void {
  isIncomingRingtoneActive = false
  if (activeRingSource) {
    try {
      activeRingSource.stop()
      activeRingSource.disconnect()
    } catch {}
    activeRingSource = null
  }
  if (activeRingGain) {
    try {
      activeRingGain.disconnect()
    } catch {}
    activeRingGain = null
  }
  if (fallbackWavRingAudio) {
    try {
      fallbackWavRingAudio.pause()
      fallbackWavRingAudio.currentTime = 0
    } catch {}
  }
  if (ringVibrateTimer) {
    clearInterval(ringVibrateTimer)
    ringVibrateTimer = null
  }
  try {
    navigator.vibrate?.(0)
  } catch {}
  setCallMediaSilenceActive(false, "incoming-call-ringtone")
}

/**
 * Plays the classic outgoing telephone ringback tone (`ring... ring...`) for the caller
 * while waiting for the recipient to answer. Uses BOTH Web Audio (`AudioBufferSourceNode`)
 * AND a DOM-attached `<audio loop>` WAV element so it works reliably on every desktop & mobile browser.
 */
export function startOutgoingCallerRingbackTone(): void {
  if (typeof window === "undefined") return
  isOutgoingRingbackActive = true
  ensureLiveAudioPipelineStarted()

  if (liveAudioCtx && outgoingRingbackBuffer && !activeOutgoingRingbackSource) {
    try {
      if (liveAudioCtx.state === "suspended") {
        liveAudioCtx.resume().catch(() => {})
      }
      const gain = liveAudioCtx.createGain()
      gain.gain.value = 0.55
      const src = liveAudioCtx.createBufferSource()
      src.buffer = outgoingRingbackBuffer
      src.loop = true
      src.connect(gain)
      gain.connect(liveAudioCtx.destination)
      src.start(0)
      activeOutgoingRingbackSource = src
      activeOutgoingRingbackGain = gain
    } catch {}
  }

  if (outgoingRingbackAudio) {
    outgoingRingbackAudio.muted = false
    outgoingRingbackAudio.volume = 0.65
    if (outgoingRingbackAudio.paused) {
      outgoingRingbackAudio.play().catch(() => {})
    }
  }
}

export function stopOutgoingCallerRingbackTone(): void {
  isOutgoingRingbackActive = false
  if (activeOutgoingRingbackSource) {
    try {
      activeOutgoingRingbackSource.stop()
      activeOutgoingRingbackSource.disconnect()
    } catch {}
    activeOutgoingRingbackSource = null
  }
  if (activeOutgoingRingbackGain) {
    try {
      activeOutgoingRingbackGain.disconnect()
    } catch {}
    activeOutgoingRingbackGain = null
  }
  if (outgoingRingbackAudio) {
    try {
      outgoingRingbackAudio.pause()
      outgoingRingbackAudio.currentTime = 0
    } catch {}
  }
}

export function startTitleCallFlash(callerName: string): void {
  if (typeof document === "undefined") return
  if (!savedOriginalTitle) {
    savedOriginalTitle = document.title || "ConnectLn"
  }
  if (titleFlashTimer) return
  let toggle = false
  document.title = `🔔 INCOMING CALL · ${callerName}`
  titleFlashTimer = setInterval(() => {
    toggle = !toggle
    document.title = toggle
      ? `📞 PICK UP CALL · ${callerName}`
      : `🔔 INCOMING CALL · ${callerName}`
  }, 850)
}

export function stopTitleCallFlash(): void {
  if (titleFlashTimer) {
    clearInterval(titleFlashTimer)
    titleFlashTimer = null
  }
  if (typeof document !== "undefined" && savedOriginalTitle) {
    document.title = savedOriginalTitle
  }
}

function renderIncomingCallDomIntoWindow(
  win: Window,
  spec: PopupIncomingCallSpec | null,
  isStandbyPiP = false
) {
  try {
    const doc = win.document
    if (!doc) return

    if (!spec) {
      if (!isStandbyPiP) {
        win.close()
        return
      }
      doc.title = "ConnectLn Call Receiver"
      doc.body.innerHTML = `
        <div style="margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:12px 16px;background:linear-gradient(180deg,#111B21 0%,#0B141A 100%);color:#FBF8F3;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;text-align:center;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="width:10px;height:10px;border-radius:999px;background:#10B981;box-shadow:0 0 12px #10B981;display:inline-block;"></span>
            <span style="font-size:13px;font-weight:800;color:#6EE7B7;">ConnectLn Call Pop-Up Active</span>
          </div>
          <div style="font-size:11px;color:#CBD5E1;line-height:1.35;">
            Leave this small receiver open when you minimize your browser — incoming calls will ring out loud &amp; pop up right here!
          </div>
        </div>
      `
      doc.body.style.margin = "0"
      doc.body.style.background = "#111B21"
      return
    }

    try {
      win.focus?.()
    } catch {}

    const safeName = String(spec.callerName || "ConnectLn Caller").replace(/[<>&"]/g, "")
    const safePhone = String(spec.callerPhone || "").replace(/[<>&"]/g, "")
    const isVideo = spec.callMode === "video"

    doc.title = `🔔 Incoming Call · ${safeName}`
    doc.body.style.margin = "0"
    doc.body.style.background = "#071E1A"
    doc.body.innerHTML = `
      <style>
        @keyframes pulseRing {
          0% { transform: scale(0.94); opacity: 0.85; }
          70% { transform: scale(1.25); opacity: 0; }
          100% { transform: scale(1.25); opacity: 0; }
        }
      </style>
      <div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(180deg,#071E1A 0%,#0B141A 100%);color:#FFFFFF;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;text-align:center;overflow:hidden;">
        <div style="font-size:10px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:#34D399;">
          ● CONNECTLN INCOMING ${isVideo ? "VIDEO" : "VOICE"} CALL
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
          <div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;margin-bottom:3px;">
            <span style="position:absolute;inset:-5px;border-radius:999px;border:2.5px solid #34D399;animation:pulseRing 1.4s infinite;"></span>
            <div style="width:48px;height:48px;border-radius:999px;background:#059669;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 8px 20px rgba(5,150,105,0.45);border:2px solid #6EE7B7;">
              ${isVideo ? "📹" : "📞"}
            </div>
          </div>
          <div style="font-size:17px;font-weight:800;line-height:1.15;max-width:285px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeName}</div>
          ${
            safePhone
              ? `<div style="font-size:11.5px;color:#6EE7B7;font-family:monospace;font-weight:700;">${safePhone}</div>`
              : `<div style="font-size:11px;color:#CBD5E1;">Ringing over ConnectLn Internet...</div>`
          }
        </div>

        <div style="display:flex;gap:8px;width:100%;justify-content:center;">
          <button id="btn-decline" style="flex:1;padding:10px 10px;border-radius:999px;border:none;background:#E11D48;color:#FFFFFF;font-weight:800;font-size:12px;cursor:pointer;box-shadow:0 4px 12px rgba(225,29,72,0.4);">
            ✕ Decline
          </button>
          <button id="btn-answer" style="flex:1.45;padding:10px 12px;border-radius:999px;border:none;background:#10B981;color:#FFFFFF;font-weight:800;font-size:12px;cursor:pointer;box-shadow:0 4px 14px rgba(16,185,129,0.5);">
            ${isVideo ? "📹 Answer Video" : "📞 Answer Call"}
          </button>
        </div>
        <audio id="popup-ring-audio" src="${getPhoneRingtoneWavUri()}" autoplay loop playsinline style="display:none;"></audio>
      </div>
    `

    // Play ringtone directly inside the foreground PiP/Popup window too so Edge Efficiency Mode can NEVER mute it!
    const popAudio = doc.getElementById("popup-ring-audio") as HTMLAudioElement | null
    if (popAudio) {
      popAudio.volume = 1.0
      popAudio
        .play()
        .then(() => {
          // Avoid echo: since foreground window audio is playing loud & clear, silence duplicate main-tab synth
          if (activeRingSource) {
            try {
              activeRingSource.stop()
              activeRingSource.disconnect()
            } catch {}
            activeRingSource = null
          }
          if (fallbackWavRingAudio && !fallbackWavRingAudio.paused) {
            fallbackWavRingAudio.pause()
          }
        })
        .catch(() => {})
    }

    const ansBtn = doc.getElementById("btn-answer")
    const decBtn = doc.getElementById("btn-decline")
    if (ansBtn) {
      ansBtn.onclick = () => {
        try {
          if (window.name) {
            win.open("", window.name)
          }
          ;(win.opener || window).focus()
          window.focus()
        } catch {}
        spec.onAnswer()
      }
    }
    if (decBtn) {
      decBtn.onclick = () => {
        spec.onDecline()
      }
    }
  } catch {}
}

export function isDocumentPipSupported(): boolean {
  return typeof window !== "undefined" && "documentPictureInPicture" in window
}

export function isAlwaysOnTopReceiverOpen(): boolean {
  return Boolean(activePipWin && !activePipWin.closed)
}

/**
 * Opens an Always-On-Top Document Picture-in-Picture Standby Receiver (Chrome / Edge Desktop).
 * Sized at 320x215 so the full Incoming Call Pop-Up Screen renders cleanly inside it when minimized!
 */
export async function openAlwaysOnTopCallStandbyPiP(manualUserAction = false): Promise<boolean> {
  if (!isDocumentPipSupported()) return false
  ensureLiveAudioPipelineStarted()
  if (manualUserAction) {
    try {
      sessionStorage.removeItem("connectln_pip_dismissed")
    } catch {}
  }
  try {
    if (activePipWin && !activePipWin.closed) {
      renderIncomingCallDomIntoWindow(activePipWin, currentRingingSpec, true)
      notifyUnlockSubscribers()
      return true
    }
    const dpip = (window as any).documentPictureInPicture
    const pipWindow: Window = await dpip.requestWindow({
      width: 320,
      height: 215,
    })
    activePipWin = pipWindow
    programmaticPipClose = false
    renderIncomingCallDomIntoWindow(pipWindow, currentRingingSpec, true)
    if (pipForegroundPollTimer) {
      try {
        clearInterval(pipForegroundPollTimer)
      } catch {}
    }
    // Run a 1.1s poll timer INSIDE the visible PiP window context — 100% exempt from minimized tab throttling!
    pipForegroundPollTimer = pipWindow.setInterval(() => {
      try {
        activeForegroundPollFn?.()
      } catch {}
    }, 1100)
    pipWindow.addEventListener("pagehide", () => {
      if (pipForegroundPollTimer) {
        try {
          pipWindow.clearInterval(pipForegroundPollTimer)
        } catch {}
        pipForegroundPollTimer = null
      }
      if (!programmaticPipClose) {
        try {
          sessionStorage.setItem("connectln_pip_dismissed", "1")
        } catch {}
      }
      programmaticPipClose = false
      activePipWin = null
      notifyUnlockSubscribers()
    })
    notifyUnlockSubscribers()
    return true
  } catch {
    return false
  }
}

/**
 * Closes any standby PiP or popup cleanly when the user opens an active call modal on this tab
 * so ZERO extra boxes overlap their active call!
 */
export function closeStandbyPipForLocalCall(): void {
  currentRingingSpec = null
  if (activePopupWin && !activePopupWin.closed) {
    try {
      activePopupWin.close()
    } catch {}
  }
  activePopupWin = null

  if (activePipWin && !activePipWin.closed) {
    programmaticPipClose = true
    try {
      activePipWin.close()
    } catch {}
    activePipWin = null
  }
  notifyUnlockSubscribers()
}

export function dismissFloatingCallPopups(): void {
  currentRingingSpec = null
  if (activePopupWin && !activePopupWin.closed) {
    try {
      activePopupWin.close()
    } catch {}
  }
  activePopupWin = null

  if (activePipWin && !activePipWin.closed) {
    renderIncomingCallDomIntoWindow(activePipWin, null, true)
  }
}

export async function triggerSystemIncomingCallAlert(
  spec: PopupIncomingCallSpec
): Promise<void> {
  if (typeof window === "undefined") return
  currentRingingSpec = spec

  // 1. If Always-On-Top Document PiP Receiver is open, transform it immediately into the Incoming Call Pop-Up Screen!
  if (activePipWin && !activePipWin.closed) {
    renderIncomingCallDomIntoWindow(activePipWin, spec, true)
  } else {
    // 2. Also attempt opening a standalone 380x460 Pop-Up Call Window (succeeds whenever popups are allowed!)
    try {
      const left = Math.max(20, Math.round((window.screen.availWidth - 380) / 2))
      const top = Math.max(30, Math.round((window.screen.availHeight - 460) / 2))
      if (!activePopupWin || activePopupWin.closed) {
        activePopupWin = window.open(
          "",
          "connectln_incoming_call_popup",
          `popup=yes,width=380,height=460,left=${left},top=${top}`
        )
      }
      if (activePopupWin && !activePopupWin.closed) {
        renderIncomingCallDomIntoWindow(activePopupWin, spec, false)
      }
    } catch {}
  }

  if (notifiedCallIds.has(spec.callId)) return
  notifiedCallIds.add(spec.callId)

  const isVideo = spec.callMode === "video"
  const title = isVideo
    ? `📹 Incoming Video Call · ${spec.callerName}`
    : `📞 Incoming Voice Call · ${spec.callerName}`
  const body = `Calling${
    spec.callerPhone ? ` (${spec.callerPhone})` : ""
  } on ConnectLn — Click Answer to open call screen`

  // 3. Direct ServiceWorkerRegistration.showNotification (`requireInteraction: true`)
  try {
    if (
      "serviceWorker" in navigator &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      const reg = await navigator.serviceWorker.getRegistration("/")
      if (reg && typeof reg.showNotification === "function") {
        const origin = window.location.origin || "https://conectln.com"
        const joinUrl = `${origin}/connectin?waCall=${encodeURIComponent(
          spec.callId
        )}&mode=${spec.callMode}&callerName=${encodeURIComponent(spec.callerName)}&autoAnswer=1`
        await reg.showNotification(title, {
          body,
          icon: "/brand/connectln-icon-256.png",
          badge: "/brand/connectln-icon.png",
          tag: `connectln-call-${spec.callId}`,
          renotify: true,
          requireInteraction: true,
          silent: false,
          vibrate: [600, 220, 600, 220, 800, 250, 800],
          data: {
            callId: spec.callId,
            callMode: spec.callMode,
            callerName: spec.callerName,
            callerPhone: spec.callerPhone || "",
            joinUrl,
          },
          actions: [
            {
              action: "answer",
              title: isVideo ? "📹 Answer Video" : "📞 Answer Call",
            },
            {
              action: "decline",
              title: "❌ Decline",
            },
          ],
        } as any)
        return
      }
    }
  } catch {}

  // 4. Fallback `new Notification(...)`
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      const n = new Notification(title, {
        body,
        icon: "/brand/connectln-icon-256.png",
        tag: `connectln-call-${spec.callId}`,
        requireInteraction: true,
      })
      n.onclick = () => {
        try {
          window.focus()
        } catch {}
        n.close()
        spec.onAnswer()
      }
    }
  } catch {}
}

export function createUnthrottledCallPollWorker(
  intervalMs: number,
  onTick: () => void
): () => void {
  if (typeof window === "undefined") return () => {}

  let worker: Worker | null = null
  let blobUrl: string | null = null
  let fallbackTimer: ReturnType<typeof setInterval> | null = null

  try {
    const workerCode = `
      let t = setInterval(() => postMessage("tick"), ${Math.max(800, intervalMs)});
      onmessage = (e) => { if (e.data === "stop") { clearInterval(t); close(); } };
    `
    const blob = new Blob([workerCode], { type: "application/javascript" })
    blobUrl = URL.createObjectURL(blob)
    worker = new Worker(blobUrl)
    worker.onmessage = () => onTick()
  } catch {
    fallbackTimer = setInterval(onTick, intervalMs)
  }

  return () => {
    if (worker) {
      try {
        worker.postMessage("stop")
        worker.terminate()
      } catch {}
      worker = null
    }
    if (blobUrl) {
      try {
        URL.revokeObjectURL(blobUrl)
      } catch {}
      blobUrl = null
    }
    if (fallbackTimer) {
      clearInterval(fallbackTimer)
      fallbackTimer = null
    }
  }
}

export const CONNECTLN_CALL_SILENCE_EVENT = "connectln:call-silence-change"

function isCallAudioExemptElement(el: HTMLMediaElement): boolean {
  if (!el) return true
  if (
    el === keepAliveHtmlAudio ||
    el === fallbackWavRingAudio ||
    el === outgoingRingbackAudio ||
    el === autoPipVideoEl
  ) {
    return true
  }
  if (el.dataset?.connectlnCallAudio === "true") return true
  if (el.srcObject) return true
  return false
}

function getTrackedMediaElements(): Set<HTMLMediaElement> {
  if (typeof window === "undefined") return new Set()
  const win = window as any
  if (!win.__connectlnTrackedMediaElements) {
    win.__connectlnTrackedMediaElements = new Set<HTMLMediaElement>()
  }
  return win.__connectlnTrackedMediaElements as Set<HTMLMediaElement>
}

function installGlobalCallSilenceMediaGuard(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return
  const win = window as any
  if (win.__connectlnCallSilenceGuardInstalled) return
  win.__connectlnCallSilenceGuardInstalled = true

  // 1. Hook HTMLMediaElement.prototype.play so even detached `new Audio()` instances
  //    (e.g. TTS, GospelHub, XTrendingSidebar) are tracked and paused during calls!
  try {
    const proto = typeof HTMLMediaElement !== "undefined" ? HTMLMediaElement.prototype : null
    if (proto && typeof proto.play === "function" && !(proto as any).__connectlnPlayHooked) {
      const origPlay = proto.play
      ;(proto as any).__connectlnPlayHooked = true
      proto.play = function (this: HTMLMediaElement) {
        try {
          getTrackedMediaElements().add(this)
          if (win.__connectlnCallSilenceActive && !isCallAudioExemptElement(this)) {
            this.dataset.pausedByConnectlnCall = "true"
            if (!this.dataset.preCallMutedSaved) {
              this.dataset.preCallMutedSaved = "true"
              this.dataset.preCallMuted = this.muted ? "1" : "0"
            }
            this.muted = true
            try {
              this.pause()
            } catch {}
            return Promise.resolve()
          }
        } catch {}
        return origPlay.apply(this)
      }
    }
  } catch {}

  // 2. Capture-phase 'play' event listener on document for any DOM `<video>` or `<audio>`
  document.addEventListener(
    "play",
    (e) => {
      const target = e.target
      if (target instanceof HTMLMediaElement) {
        getTrackedMediaElements().add(target)
        if (win.__connectlnCallSilenceActive && !isCallAudioExemptElement(target)) {
          target.dataset.pausedByConnectlnCall = "true"
          if (!target.dataset.preCallMutedSaved) {
            target.dataset.preCallMutedSaved = "true"
            target.dataset.preCallMuted = target.muted ? "1" : "0"
          }
          target.muted = true
          try {
            target.pause()
          } catch {}
        }
      }
    },
    true
  )
}

if (typeof window !== "undefined") {
  installGlobalCallSilenceMediaGuard()
}

export function isCallMediaSilenceActive(): boolean {
  if (typeof window === "undefined") return false
  return Boolean((window as any).__connectlnCallSilenceActive)
}

export function pauseAllNonCallMediaNow(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return
  installGlobalCallSilenceMediaGuard()
  const win = window as any

  // 1. Pause & mute all DOM `<video>` and `<audio>` elements + tracked detached `new Audio()` elements
  try {
    const allMedia = new Set<HTMLMediaElement>()
    document.querySelectorAll("video, audio").forEach((el) => {
      if (el instanceof HTMLMediaElement) allMedia.add(el)
    })
    getTrackedMediaElements().forEach((el) => allMedia.add(el))
    if (win.__noctisSharedAudioEl instanceof HTMLMediaElement) {
      allMedia.add(win.__noctisSharedAudioEl)
    }
    if (win.__noctisSharedPreloadAudioEl instanceof HTMLMediaElement) {
      allMedia.add(win.__noctisSharedPreloadAudioEl)
    }

    allMedia.forEach((el) => {
      if (isCallAudioExemptElement(el)) return
      if (!el.dataset.preCallMutedSaved) {
        el.dataset.preCallMutedSaved = "true"
        el.dataset.preCallMuted = el.muted ? "1" : "0"
      }
      el.muted = true
      if (!el.paused) {
        el.dataset.pausedByConnectlnCall = "true"
        try {
          el.pause()
        } catch {}
      }
    })
  } catch {}

  // 2. Stop Noctis Voice Interpreter sequence & browser speechSynthesis
  try {
    win.__noctisAudioPlaySeq = (win.__noctisAudioPlaySeq || 0) + 1
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    window.dispatchEvent(
      new CustomEvent("connectln:exclusive-noctis-interpreter", {
        detail: { instanceId: "__connectln_call_silence__" },
      })
    )
  } catch {}

  // 3. Pause & mute all YouTube / embed iframes and notify exclusive video coordinator
  try {
    win.__connectlnActiveVideoPlayerId = "__connectln_call_silence__"
    window.dispatchEvent(
      new CustomEvent("connectln:exclusive-video-play", {
        detail: { playerId: "__connectln_call_silence__" },
      })
    )
    const iframes = document.querySelectorAll("iframe")
    iframes.forEach((frame) => {
      const cw = frame.contentWindow
      if (!cw) return
      try {
        cw.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*")
        cw.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [0] }), "*")
        cw.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "*")
        cw.postMessage(JSON.stringify({ method: "pause" }), "*")
      } catch {}
    })
  } catch {}
}

function restorePausedMediaAfterCall(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return
  try {
    const allMedia = new Set<HTMLMediaElement>()
    document.querySelectorAll("video, audio").forEach((el) => {
      if (el instanceof HTMLMediaElement) allMedia.add(el)
    })
    getTrackedMediaElements().forEach((el) => allMedia.add(el))

    allMedia.forEach((el) => {
      if (isCallAudioExemptElement(el)) return
      if (el.dataset.preCallMutedSaved === "true") {
        el.muted = el.dataset.preCallMuted === "1"
        delete el.dataset.preCallMutedSaved
        delete el.dataset.preCallMuted
      }
      if (el.dataset.pausedByConnectlnCall === "true") {
        delete el.dataset.pausedByConnectlnCall
        // Only auto-resume DOM-connected media that was actively playing when the call arrived
        if (el.isConnected) {
          el.play().catch(() => {})
        }
      }
    })
  } catch {}
}

/**
 * Acquires or releases a global call-audio silence lock.
 * While ANY source (incoming ringtone, incoming call banner, or active call modal/studio)
 * holds a lock, ALL other page sounds (videos, YouTube embeds, Noctis voice interpreter,
 * music, TTS) remain paused & muted until the call is completed.
 */
export function setCallMediaSilenceActive(active: boolean, sourceId: string): void {
  if (typeof window === "undefined") return
  installGlobalCallSilenceMediaGuard()
  const win = window as any
  if (!win.__connectlnCallSilenceSources) {
    win.__connectlnCallSilenceSources = new Set<string>()
  }
  const sources: Set<string> = win.__connectlnCallSilenceSources
  const wasActive = Boolean(win.__connectlnCallSilenceActive)

  if (active) {
    sources.add(sourceId)
  } else {
    sources.delete(sourceId)
  }

  const nowActive = sources.size > 0
  win.__connectlnCallSilenceActive = nowActive

  if (nowActive) {
    pauseAllNonCallMediaNow()
  } else if (wasActive && !nowActive) {
    restorePausedMediaAfterCall()
  }

  if (wasActive !== nowActive) {
    window.dispatchEvent(
      new CustomEvent(CONNECTLN_CALL_SILENCE_EVENT, {
        detail: { active: nowActive },
      })
    )
  }
}
