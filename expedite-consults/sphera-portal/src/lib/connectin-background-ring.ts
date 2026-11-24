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
let ringSessionSeq = 0
const CALL_STOP_RING_STORAGE_KEY = "connectln_stop_ring_broadcast_v1"
let callStopControlChannel: BroadcastChannel | null = null
let callControlListenersBound = false
let isOutgoingRingbackActive = false
let autoPipVideoEl: HTMLVideoElement | null = null
let autoPipCanvasTimer: ReturnType<typeof setInterval> | null = null

let ringVibrateTimer: ReturnType<typeof setInterval> | null = null
let titleFlashTimer: ReturnType<typeof setInterval> | null = null
let savedOriginalTitle = ""

let keepAliveClockNode: ScriptProcessorNode | null = null
let lastAudioPollTickMs = 0
let activePopupWin: Window | null = null
let activePipWin: Window | null = null
let pipForegroundPollTimer: any = null
let activeForegroundPollFn: (() => void) | null = null
let programmaticPipClose = false
const notifiedCallAtMsMap = new Map<string, number>()
const unlockListeners = new Set<() => void>()
let activeWakeLock: any = null
let wakeLockVisibilityBound = false

async function requestScreenWakeLock(): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return
  if (document.visibilityState !== "visible") return
  if (activeWakeLock) return
  try {
    const wl = (navigator as any).wakeLock
    if (wl && typeof wl.request === "function") {
      const sentinel = await wl.request("screen")
      activeWakeLock = sentinel
      sentinel?.addEventListener?.("release", () => {
        if (activeWakeLock === sentinel) {
          activeWakeLock = null
        }
      })
    }
  } catch {}
}

export function setForegroundCallPollCallback(fn: (() => void) | null): void {
  activeForegroundPollFn = fn
}

export interface PopupIncomingCallSpec {
  callId: string
  callerName: string
  callerPhone?: string
  callerAvatar?: string
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
  const sampleRate = 44100
  const totalSamples = sampleRate // exact 1.0s seamless cycle (20 Hz + 18500 Hz pilot)
  const samples = new Int16Array(totalSamples)
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate
    // Combine 20 Hz (0.022) + 18.5 kHz pilot (0.0025): inaudible on speakers/ears,
    // yet prevents Chromium AudioPowerMonitor from treating a minimized tab as silent!
    const val =
      Math.sin(2 * Math.PI * 20 * t) * 0.022 +
      Math.sin(2 * Math.PI * 18500 * t) * 0.0025
    samples[i] = Math.round(val * 32767)
  }
  cachedSubSonicWavUri = encodeMonoPcm16WavDataUri(samples, sampleRate)
  return cachedSubSonicWavUri
}

export type ConnectLnRingtoneId =
  | "connectln-marimba"
  | "crystal-chime"
  | "executive-piano"
  | "gentle-kalimba"
  | "classic-bell"
  | "studio-acoustic"
  | "device-custom"

export interface ConnectLnRingtoneOption {
  id: ConnectLnRingtoneId
  label: string
  description: string
  badge: string
}

export const CONNECTLN_RINGTONE_PRESETS: ConnectLnRingtoneOption[] = [
  {
    id: "connectln-marimba",
    label: "ConnectLn Marimba Melody",
    description: "Warm ascending marimba chime (clear & upbeat)",
    badge: "Default",
  },
  {
    id: "crystal-chime",
    label: "Crystal Harp Chime",
    description: "Soothing crystal bell & harp arpeggio",
    badge: "Harp",
  },
  {
    id: "executive-piano",
    label: "Executive Warm Piano",
    description: "Studio electric piano melody",
    badge: "Piano",
  },
  {
    id: "gentle-kalimba",
    label: "Gentle Sunrise Kalimba",
    description: "Soft rhythmic thumb-piano notes",
    badge: "Kalimba",
  },
  {
    id: "classic-bell",
    label: "Classic Single Telephone Ring",
    description: "Single long ring cadence (never sounds busy)",
    badge: "Classic",
  },
  {
    id: "studio-acoustic",
    label: "Studio Acoustic Guitar",
    description: "Real acoustic track (/status-videos/hot-swing.mp3)",
    badge: "Music",
  },
  {
    id: "device-custom",
    label: "My Device Ringtone (Custom File)",
    description: "Use an audio / ringtone file from your phone or PC",
    badge: "Device",
  },
]

const RINGTONE_CHOICE_STORAGE_KEY = "connectln_selected_ringtone_id_v1"
const CUSTOM_RINGTONE_DATA_KEY = "connectln_custom_device_ringtone_data_v1"
const CUSTOM_RINGTONE_NAME_KEY = "connectln_custom_device_ringtone_name_v1"

export function getSelectedConnectLnRingtoneId(): ConnectLnRingtoneId {
  if (typeof window === "undefined") return "connectln-marimba"
  try {
    const raw = window.localStorage.getItem(RINGTONE_CHOICE_STORAGE_KEY) as ConnectLnRingtoneId | null
    if (raw && CONNECTLN_RINGTONE_PRESETS.some((p) => p.id === raw)) {
      return raw
    }
  } catch {}
  return "connectln-marimba"
}

export function getCustomDeviceRingtoneName(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(CUSTOM_RINGTONE_NAME_KEY) || ""
  } catch {
    return ""
  }
}

export function getCustomDeviceRingtoneDataUrl(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(CUSTOM_RINGTONE_DATA_KEY) || ""
  } catch {
    return ""
  }
}

export function setSelectedConnectLnRingtoneId(id: ConnectLnRingtoneId): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(RINGTONE_CHOICE_STORAGE_KEY, id)
    window.dispatchEvent(new CustomEvent("connectln_ringtone_changed", { detail: id }))
  } catch {}
  // Invalidate cached synthesized buffer so next ring uses the newly picked tone
  ringtoneBuffer = null
  cachedRingtoneUriMap.clear()
  if (fallbackWavRingAudio) {
    try {
      fallbackWavRingAudio.dataset.ringtonePresetId = ""
      fallbackWavRingAudio.src = getRingtoneAudioSourceUri(id)
      fallbackWavRingAudio.dataset.ringtonePresetId = id
    } catch {}
  }
}

export function saveCustomDeviceRingtoneDataUrl(dataUrl: string, fileName: string): void {
  if (typeof window === "undefined" || !dataUrl) return
  try {
    window.localStorage.setItem(CUSTOM_RINGTONE_DATA_KEY, dataUrl)
    window.localStorage.setItem(CUSTOM_RINGTONE_NAME_KEY, fileName || "Device Ringtone")
  } catch {}
  setSelectedConnectLnRingtoneId("device-custom")
}

let activePreviewAudio: HTMLAudioElement | null = null
let activePreviewTimer: ReturnType<typeof setTimeout> | null = null

export function stopPreviewConnectLnRingtone(): void {
  if (activePreviewTimer) {
    clearTimeout(activePreviewTimer)
    activePreviewTimer = null
  }
  if (activePreviewAudio) {
    try {
      activePreviewAudio.pause()
      activePreviewAudio.currentTime = 0
    } catch {}
    activePreviewAudio = null
  }
}

export function previewConnectLnRingtone(id?: ConnectLnRingtoneId, durationMs = 4500): void {
  if (typeof window === "undefined") return
  stopPreviewConnectLnRingtone()
  const targetId = id || getSelectedConnectLnRingtoneId()
  try {
    const a = new Audio(getRingtoneAudioSourceUri(targetId))
    a.dataset.connectlnCallAudio = "true"
    a.volume = 0.85
    a.setAttribute("playsinline", "true")
    a.play().catch(() => {})
    activePreviewAudio = a
    activePreviewTimer = setTimeout(() => {
      stopPreviewConnectLnRingtone()
    }, durationMs)
  } catch {}
}

/**
 * Standard telephone calling/ringback tone (North America / ITU-T cadence):
 * Dual 440 Hz + 480 Hz sine wave with subtle warm harmonic clarity (1.8s ON / 2.2s OFF, 4.0s cycle)
 * so laptop and mobile speakers project the calling tone clearly even during mic capture/AEC.
 */
function synthesizeStandardPhoneRingbackSample(t: number): number {
  if (t < 0.02 || t > 1.82) return 0
  const localT = t - 0.02
  const attack = Math.min(1, localT / 0.02)
  const release = Math.min(1, (1.8 - localT) / 0.035)
  const env = Math.max(0, Math.min(attack, release))
  const wave =
    0.46 * Math.sin(2 * Math.PI * 440 * localT) +
    0.46 * Math.sin(2 * Math.PI * 480 * localT) +
    0.09 * Math.sin(2 * Math.PI * 880 * localT) +
    0.07 * Math.sin(2 * Math.PI * 960 * localT)
  return Math.tanh(wave * 1.15) * env
}

function synthesizeMelodicRingtoneSamples(
  presetId: ConnectLnRingtoneId,
  sampleRate: number
): Float32Array {
  if (presetId === "classic-bell") {
    const durationSec = 6.0
    const totalSamples = Math.floor(sampleRate * durationSec)
    const out = new Float32Array(totalSamples)
    for (let i = 0; i < totalSamples; i++) {
      out[i] = synthesizeStandardPhoneRingbackSample(i / sampleRate) * 0.72
    }
    return out
  }

  const noteMaps: Record<string, Array<{ freq: number; start: number; len: number }>> = {
    "crystal-chime": [
      { freq: 587.33, start: 0.0, len: 0.42 },  // D5
      { freq: 739.99, start: 0.2, len: 0.42 },  // F#5
      { freq: 880.0, start: 0.4, len: 0.45 },   // A5
      { freq: 1174.66, start: 0.62, len: 0.65 }, // D6
      { freq: 880.0, start: 0.96, len: 0.48 },  // A5
      { freq: 1174.66, start: 1.24, len: 0.8 }, // D6
    ],
    "executive-piano": [
      { freq: 329.63, start: 0.0, len: 0.55 },  // E4
      { freq: 415.3, start: 0.18, len: 0.55 },  // G#4
      { freq: 493.88, start: 0.36, len: 0.55 }, // B4
      { freq: 659.25, start: 0.54, len: 0.75 }, // E5
      { freq: 587.33, start: 0.92, len: 0.45 }, // D5
      { freq: 659.25, start: 1.18, len: 0.85 }, // E5
    ],
    "gentle-kalimba": [
      { freq: 392.0, start: 0.0, len: 0.4 },   // G4
      { freq: 493.88, start: 0.22, len: 0.4 }, // B4
      { freq: 587.33, start: 0.44, len: 0.4 }, // D5
      { freq: 783.99, start: 0.66, len: 0.6 }, // G5
      { freq: 659.25, start: 1.0, len: 0.5 },  // E5
      { freq: 783.99, start: 1.3, len: 0.7 },  // G5
    ],
    "connectln-marimba": [
      { freq: 523.25, start: 0.0, len: 0.34 },  // C5
      { freq: 659.25, start: 0.18, len: 0.34 }, // E5
      { freq: 783.99, start: 0.36, len: 0.34 }, // G5
      { freq: 987.77, start: 0.54, len: 0.42 }, // B5
      { freq: 1046.5, start: 0.74, len: 0.65 }, // C6
      { freq: 783.99, start: 1.08, len: 0.36 }, // G5
      { freq: 659.25, start: 1.28, len: 0.36 }, // E5
      { freq: 1046.5, start: 1.48, len: 0.78 }, // C6
    ],
  }

  const notes = noteMaps[presetId] || noteMaps["connectln-marimba"]
  const durationSec = 3.1
  const totalSamples = Math.floor(sampleRate * durationSec)
  const out = new Float32Array(totalSamples)

  for (const n of notes) {
    const startIdx = Math.floor(n.start * sampleRate)
    const endIdx = Math.min(totalSamples, Math.floor((n.start + n.len) * sampleRate))
    for (let i = startIdx; i < endIdx; i++) {
      const localT = (i - startIdx) / sampleRate
      const attack = Math.min(1, localT / 0.012)
      const decay = Math.exp(-3.4 * (localT / n.len))
      const tailFade = Math.min(1, ((endIdx - i) / sampleRate) / 0.04)
      const env = attack * decay * tailFade
      const tone =
        0.65 * Math.sin(2 * Math.PI * n.freq * localT) +
        0.24 * Math.sin(2 * Math.PI * n.freq * 2 * localT) * Math.exp(-5 * localT) +
        0.11 * Math.sin(2 * Math.PI * n.freq * 3 * localT) * Math.exp(-7 * localT)
      out[i] += tone * env * 0.55
    }
  }

  for (let i = 0; i < totalSamples; i++) {
    out[i] = Math.tanh(out[i]) * 0.86
  }
  return out
}

const cachedRingtoneUriMap = new Map<string, string>()

function getRingtoneAudioSourceUri(presetOverride?: ConnectLnRingtoneId): string {
  const preset = presetOverride || getSelectedConnectLnRingtoneId()
  if (preset === "device-custom") {
    const customUrl = getCustomDeviceRingtoneDataUrl()
    if (customUrl) return customUrl
  }
  if (preset === "studio-acoustic") {
    return "/status-videos/hot-swing.mp3"
  }
  const existing = cachedRingtoneUriMap.get(preset)
  if (existing) return existing
  const sampleRate = 16000
  const floats = synthesizeMelodicRingtoneSamples(preset, sampleRate)
  const samples = new Int16Array(floats.length)
  for (let i = 0; i < floats.length; i++) {
    samples[i] = Math.round(Math.max(-1, Math.min(1, floats[i])) * 26000)
  }
  const uri = encodeMonoPcm16WavDataUri(samples, sampleRate)
  cachedRingtoneUriMap.set(preset, uri)
  return uri
}

function getPhoneRingtoneWavUri(): string {
  return getRingtoneAudioSourceUri()
}

let cachedOutgoingRingbackUri: string | null = null
function getOutgoingRingbackWavUri(): string {
  if (cachedOutgoingRingbackUri) return cachedOutgoingRingbackUri
  const sampleRate = 16000
  const durationSec = 4.0 // Authentic 440 Hz + 480 Hz telephone ringback: 1.8s ON / 2.2s OFF
  const totalSamples = Math.floor(sampleRate * durationSec)
  const samples = new Int16Array(totalSamples)

  for (let i = 0; i < totalSamples; i++) {
    samples[i] = Math.round(Math.max(-1, Math.min(1, synthesizeStandardPhoneRingbackSample(i / sampleRate))) * 27500)
  }

  cachedOutgoingRingbackUri = encodeMonoPcm16WavDataUri(samples, sampleRate)
  return cachedOutgoingRingbackUri
}

function buildAudioBuffers(ctx: AudioContext): void {
  if (!keepAliveBuffer) {
    const sr = ctx.sampleRate
    const len = sr // 1.0s exact cycle for 20 Hz + 18500 Hz pilot
    const buf = ctx.createBuffer(1, len, sr)
    const ch = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const t = i / sr
      ch[i] =
        Math.sin(2 * Math.PI * 20 * t) * 0.022 +
        Math.sin(2 * Math.PI * 18500 * t) * 0.0025
    }
    keepAliveBuffer = buf
  }

  if (!ringtoneBuffer) {
    const sr = ctx.sampleRate
    const preset = getSelectedConnectLnRingtoneId()
    const floats = synthesizeMelodicRingtoneSamples(preset, sr)
    const buf = ctx.createBuffer(1, floats.length, sr)
    const ch = buf.getChannelData(0)
    ch.set(floats)
    ringtoneBuffer = buf
  }

  if (!outgoingRingbackBuffer) {
    const sr = ctx.sampleRate
    const durationSec = 4.0
    const len = Math.floor(sr * durationSec)
    const buf = ctx.createBuffer(1, len, sr)
    const ch = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      ch[i] = synthesizeStandardPhoneRingbackSample(i / sr) * 0.85
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
      // Hardware audio-thread clock tick: immune to minimized browser timer throttling
      if (!keepAliveClockNode && typeof liveAudioCtx.createScriptProcessor === "function") {
        try {
          keepAliveClockNode = liveAudioCtx.createScriptProcessor(4096, 1, 1)
          keepAliveClockNode.onaudioprocess = () => {
            if (typeof document !== "undefined" && document.hidden) {
              const now = Date.now()
              if (now - lastAudioPollTickMs >= 1100) {
                lastAudioPollTickMs = now
                activeForegroundPollFn?.()
              }
            }
          }
          keepAliveClockNode.connect(liveAudioCtx.destination)
        } catch {}
      }
      // Connect looping 20 Hz + 18.5 kHz keep-alive to `liveAudioCtx.destination` AND `keepAliveClockNode`
      if (!keepAliveSource && keepAliveBuffer) {
        keepAliveSource = liveAudioCtx.createBufferSource()
        keepAliveSource.buffer = keepAliveBuffer
        keepAliveSource.loop = true
        keepAliveSource.connect(liveAudioCtx.destination)
        if (keepAliveClockNode) {
          try {
            keepAliveSource.connect(keepAliveClockNode)
          } catch {}
        }
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
      keepAliveHtmlAudio.addEventListener("timeupdate", () => {
        const now = Date.now()
        if (now - lastAudioPollTickMs >= 1100) {
          lastAudioPollTickMs = now
          activeForegroundPollFn?.()
        }
      })
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
      const initialPreset = getSelectedConnectLnRingtoneId()
      fallbackWavRingAudio = new Audio(getRingtoneAudioSourceUri(initialPreset))
      fallbackWavRingAudio.dataset.connectlnCallAudio = "true"
      fallbackWavRingAudio.dataset.connectlnRingtone = "true"
      fallbackWavRingAudio.dataset.ringtonePresetId = initialPreset
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
      outgoingRingbackAudio.volume = 0.92
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

let fallbackAudioGestureUnlocked = false
let outgoingRingbackGestureUnlocked = false

/**
 * Unlocks the continuous hardware background audio pipeline on the user's first interaction.
 */
export function unlockBackgroundRingingSession(): void {
  if (typeof window === "undefined") return
  ensureLiveAudioPipelineStarted()
  void requestScreenWakeLock()

  if (!wakeLockVisibilityBound && typeof document !== "undefined") {
    wakeLockVisibilityBound = true
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void requestScreenWakeLock()
      }
    })
  }

  const events = ["click", "pointerdown", "touchstart", "keydown"] as const
  const handler = () => {
    ensureLiveAudioPipelineStarted()
    void requestScreenWakeLock()
    if (fallbackWavRingAudio && !fallbackAudioGestureUnlocked && !isIncomingRingtoneActive) {
      fallbackWavRingAudio.muted = true
      fallbackWavRingAudio
        .play()
        .then(() => {
          fallbackAudioGestureUnlocked = true
          if (!isIncomingRingtoneActive && fallbackWavRingAudio) {
            fallbackWavRingAudio.pause()
            fallbackWavRingAudio.currentTime = 0
            fallbackWavRingAudio.muted = false
          }
        })
        .catch(() => {})
    }
    if (outgoingRingbackAudio && !outgoingRingbackGestureUnlocked && !isOutgoingRingbackActive) {
      outgoingRingbackAudio.muted = true
      outgoingRingbackAudio
        .play()
        .then(() => {
          outgoingRingbackGestureUnlocked = true
          if (!isOutgoingRingbackActive && outgoingRingbackAudio) {
            outgoingRingbackAudio.pause()
            outgoingRingbackAudio.currentTime = 0
            outgoingRingbackAudio.muted = false
          }
        })
        .catch(() => {})
    }
    if (
      liveAudioCtx?.state === "running" &&
      keepAliveHtmlAudio &&
      !keepAliveHtmlAudio.paused &&
      (!fallbackWavRingAudio || fallbackAudioGestureUnlocked) &&
      (!outgoingRingbackAudio || outgoingRingbackGestureUnlocked)
    ) {
      events.forEach((ev) => window.removeEventListener(ev, handler, true))
      notifyUnlockSubscribers()
    }
  }
  events.forEach((ev) => window.addEventListener(ev, handler, { capture: true, passive: true }))
}

let ringInteractionListenersBound = false

function stopWebAudioRingSource(): void {
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
}

function stopPipWindowRingAudio(win: Window | null | undefined): void {
  if (!win || win.closed) return
  try {
    const audioEls = win.document?.querySelectorAll("audio")
    audioEls?.forEach((audioEl) => {
      try {
        audioEl.muted = true
        audioEl.pause()
        audioEl.currentTime = 0
        audioEl.removeAttribute("src")
        audioEl.load()
        audioEl.remove()
      } catch {}
    })
  } catch {}
}

function stopLoudPhoneRingtoneLocalOnly(): void {
  ringSessionSeq++
  isIncomingRingtoneActive = false
  stopWebAudioRingSource()
  if (fallbackWavRingAudio) {
    try {
      fallbackWavRingAudio.muted = true
      fallbackWavRingAudio.pause()
      fallbackWavRingAudio.currentTime = 0
    } catch {}
  }
  if (typeof document !== "undefined") {
    try {
      document.querySelectorAll('audio[data-connectln-ringtone="true"]').forEach((el) => {
        if (el instanceof HTMLAudioElement) {
          el.muted = true
          el.pause()
          el.currentTime = 0
        }
      })
    } catch {}
  }
  stopPipWindowRingAudio(activePipWin)
  stopPipWindowRingAudio(activePopupWin)
  if (ringVibrateTimer) {
    clearInterval(ringVibrateTimer)
    ringVibrateTimer = null
  }
  try {
    navigator.vibrate?.(0)
  } catch {}
  try {
    if ("mediaSession" in navigator) {
      const ms = (navigator as any).mediaSession
      ms.playbackState = "none"
      ms.setActionHandler?.("play", null)
      ms.setActionHandler?.("pause", null)
      ms.setActionHandler?.("stop", null)
    }
  } catch {}
  setCallMediaSilenceActive(false, "incoming-call-ringtone")
}

function ensureCallStopControlListeners(): void {
  if (typeof window === "undefined" || callControlListenersBound) return
  callControlListenersBound = true
  try {
    if ("BroadcastChannel" in window) {
      callStopControlChannel = new BroadcastChannel("connectln_call_control")
      callStopControlChannel.onmessage = (ev) => {
        if (ev?.data?.type === "STOP_RING") {
          stopLoudPhoneRingtoneLocalOnly()
          if (ev?.data?.stopOutgoingRingback === true) {
            stopOutgoingCallerRingbackTone()
          }
          stopTitleCallFlash()
          dismissFloatingCallPopups()
        }
      }
    }
  } catch {}
  window.addEventListener("storage", (ev) => {
    if (ev.key === CALL_STOP_RING_STORAGE_KEY && ev.newValue) {
      let stopOutgoing = false
      try {
        const parsed = JSON.parse(ev.newValue)
        stopOutgoing = parsed?.stopOutgoingRingback === true
      } catch {}
      stopLoudPhoneRingtoneLocalOnly()
      if (stopOutgoing) {
        stopOutgoingCallerRingbackTone()
      }
      stopTitleCallFlash()
      dismissFloatingCallPopups()
    }
  })
}

if (typeof window !== "undefined") {
  ensureCallStopControlListeners()
}

export function broadcastStopRingtoneAcrossTabs(
  callId?: string,
  stopOutgoingRingback = false
): void {
  if (typeof window === "undefined") return
  ensureCallStopControlListeners()
  const payload = {
    type: "STOP_RING",
    callId: callId || "",
    stopOutgoingRingback,
    ts: Date.now(),
  }
  try {
    callStopControlChannel?.postMessage(payload)
  } catch {}
  try {
    window.localStorage.setItem(CALL_STOP_RING_STORAGE_KEY, JSON.stringify(payload))
  } catch {}
}

export function isIncomingRingtoneAudiblyPlaying(): boolean {
  return Boolean(
    isIncomingRingtoneActive &&
      ((activeRingSource && liveAudioCtx?.state === "running") ||
        (fallbackWavRingAudio && !fallbackWavRingAudio.paused && !fallbackWavRingAudio.muted))
  )
}

function startWebAudioRingBuffer(expectedSeq?: number): boolean {
  if (expectedSeq !== undefined && (!isIncomingRingtoneActive || expectedSeq !== ringSessionSeq)) {
    return false
  }
  if (!liveAudioCtx || !ringtoneBuffer || liveAudioCtx.state !== "running") return false
  if (activeRingSource) return true
  try {
    if (fallbackWavRingAudio && !fallbackWavRingAudio.paused) {
      fallbackWavRingAudio.pause()
      fallbackWavRingAudio.currentTime = 0
    }
    const gain = liveAudioCtx.createGain()
    gain.gain.value = 0.95
    const src = liveAudioCtx.createBufferSource()
    src.buffer = ringtoneBuffer
    src.loop = true
    src.connect(gain)
    gain.connect(liveAudioCtx.destination)
    src.start(0)
    activeRingSource = src
    activeRingGain = gain
    return true
  } catch {
    return false
  }
}

export function startLoudPhoneRingtone(): void {
  if (typeof window === "undefined") return
  if (Number((window as any).__connectlnOpenCallModalCount || 0) > 0) {
    stopLoudPhoneRingtoneLocalOnly()
    return
  }
  ensureCallStopControlListeners()
  const mySeq = ++ringSessionSeq
  isIncomingRingtoneActive = true
  setCallMediaSilenceActive(true, "incoming-call-ringtone")
  ensureLiveAudioPipelineStarted()

  if (liveAudioCtx && !ringtoneBuffer) {
    buildAudioBuffers(liveAudioCtx)
  }

  const selectedId = getSelectedConnectLnRingtoneId()
  const useExternalAudioFile =
    selectedId === "studio-acoustic" ||
    (selectedId === "device-custom" && Boolean(getCustomDeviceRingtoneDataUrl()))

  // Strict Single-Player Guard: never start or layer a second ringtone while one is playing
  if (!useExternalAudioFile && activeRingSource && liveAudioCtx?.state === "running") {
    if (fallbackWavRingAudio && !fallbackWavRingAudio.paused) {
      try {
        fallbackWavRingAudio.muted = true
        fallbackWavRingAudio.pause()
        fallbackWavRingAudio.currentTime = 0
      } catch {}
    }
    return
  }
  if (fallbackWavRingAudio && !fallbackWavRingAudio.paused && !fallbackWavRingAudio.muted) {
    stopWebAudioRingSource()
    return
  }

  let startedWebAudio = false
  if (!useExternalAudioFile && liveAudioCtx && ringtoneBuffer) {
    if (liveAudioCtx.state === "suspended") {
      liveAudioCtx
        .resume()
        .then(() => {
          if (!isIncomingRingtoneActive || mySeq !== ringSessionSeq) return
          if (
            !activeRingSource &&
            (!fallbackWavRingAudio || fallbackWavRingAudio.paused || fallbackWavRingAudio.muted)
          ) {
            startWebAudioRingBuffer(mySeq)
          }
        })
        .catch(() => {})
    }
    if (liveAudioCtx.state === "running") {
      startedWebAudio = startWebAudioRingBuffer(mySeq)
    }
  }

  if (useExternalAudioFile || !startedWebAudio) {
    stopWebAudioRingSource()
    if (fallbackWavRingAudio) {
      if (fallbackWavRingAudio.dataset.ringtonePresetId !== selectedId) {
        fallbackWavRingAudio.src = getRingtoneAudioSourceUri(selectedId)
        fallbackWavRingAudio.dataset.ringtonePresetId = selectedId
      }
      fallbackWavRingAudio.muted = false
      fallbackWavRingAudio.volume = 0.98
      if (fallbackWavRingAudio.paused) {
        const refEl = fallbackWavRingAudio
        refEl
          .play()
          .then(() => {
            if (!isIncomingRingtoneActive || mySeq !== ringSessionSeq) {
              try {
                refEl.muted = true
                refEl.pause()
                refEl.currentTime = 0
              } catch {}
            }
          })
          .catch(() => {
            if (
              isIncomingRingtoneActive &&
              mySeq === ringSessionSeq &&
              liveAudioCtx &&
              ringtoneBuffer &&
              liveAudioCtx.state === "running"
            ) {
              startWebAudioRingBuffer(mySeq)
            }
          })
      }
    }
  }

  try {
    if ("mediaSession" in navigator) {
      const ms = (navigator as any).mediaSession
      if (currentRingingSpec && typeof (window as any).MediaMetadata === "function" && !ms.metadata) {
        ms.metadata = new (window as any).MediaMetadata({
          title: "Incoming ConnectLn Call",
          artist: currentRingingSpec.callerName || "ConnectLn Caller",
          album: "Tap Answer to pick up",
          artwork: [{ src: "/brand/connectln-icon-256.png", sizes: "256x256", type: "image/png" }],
        })
      }
      ms.playbackState = "playing"
    }
  } catch {}

  // If browser initially deferred audio before a user interaction, resume cleanly without ever layering two players
  if (!ringInteractionListenersBound) {
    ringInteractionListenersBound = true
    const resumeRingOnInteraction = (ev?: Event) => {
      if (!isIncomingRingtoneActive) return
      if (Number((window as any).__connectlnOpenCallModalCount || 0) > 0) {
        stopLoudPhoneRingtoneLocalOnly()
        return
      }
      if (ev?.target instanceof Element && ev.target.closest("[data-connectln-call-action]")) {
        return
      }
      if (activeRingSource && liveAudioCtx?.state === "running") return
      if (fallbackWavRingAudio && !fallbackWavRingAudio.paused && !fallbackWavRingAudio.muted) return
      if (liveAudioCtx && liveAudioCtx.state === "suspended") {
        const interactionSeq = ringSessionSeq
        liveAudioCtx
          .resume()
          .then(() => {
            if (isIncomingRingtoneActive && interactionSeq === ringSessionSeq) {
              startLoudPhoneRingtone()
            }
          })
          .catch(() => {})
      }
      startLoudPhoneRingtone()
    }
    window.addEventListener("pointerdown", resumeRingOnInteraction, { passive: true })
    window.addEventListener("touchstart", resumeRingOnInteraction, { passive: true })
    window.addEventListener("keydown", resumeRingOnInteraction, { passive: true })
    window.addEventListener("focus", resumeRingOnInteraction, { passive: true })
  }

  if (!ringVibrateTimer) {
    try {
      navigator.vibrate?.([550, 220, 550, 220, 750])
    } catch {}
    ringVibrateTimer = setInterval(() => {
      if (!isIncomingRingtoneActive) return
      try {
        navigator.vibrate?.([550, 220, 550, 220, 750])
      } catch {}
    }, 2400)
  }
}

export function stopLoudPhoneRingtone(broadcastToOtherTabs = false): void {
  stopLoudPhoneRingtoneLocalOnly()
  if (broadcastToOtherTabs) {
    broadcastStopRingtoneAcrossTabs()
  }
}

/**
 * Plays the classic outgoing telephone ringback tone (`ring... ring...`) for the caller
 * while waiting for the recipient to answer. Handles suspended/interrupted Web Audio,
 * gesture-unlocks HTML `<audio loop>` fallback, and recovers if `getUserMedia()` interrupts playback.
 */
let outgoingRingbackSeq = 0
let outgoingRingbackWatchdogTimer: ReturnType<typeof setInterval> | null = null
let outgoingRingbackInteractionBound = false

function stopWebAudioOutgoingRingbackSource(): void {
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
}

function startWebAudioOutgoingRingback(expectedSeq: number): boolean {
  if (
    !isOutgoingRingbackActive ||
    expectedSeq !== outgoingRingbackSeq ||
    !liveAudioCtx ||
    !outgoingRingbackBuffer ||
    liveAudioCtx.state !== "running"
  ) {
    return false
  }
  if (activeOutgoingRingbackSource) return true
  try {
    if (outgoingRingbackAudio && !outgoingRingbackAudio.paused) {
      outgoingRingbackAudio.muted = true
      outgoingRingbackAudio.pause()
      outgoingRingbackAudio.currentTime = 0
    }
    const gain = liveAudioCtx.createGain()
    gain.gain.value = 0.88
    const src = liveAudioCtx.createBufferSource()
    src.buffer = outgoingRingbackBuffer
    src.loop = true
    src.connect(gain)
    gain.connect(liveAudioCtx.destination)
    src.start(0)
    activeOutgoingRingbackSource = src
    activeOutgoingRingbackGain = gain
    return true
  } catch {
    return false
  }
}

function startHtmlAudioOutgoingRingback(expectedSeq: number): void {
  if (!outgoingRingbackAudio || !isOutgoingRingbackActive || expectedSeq !== outgoingRingbackSeq) {
    return
  }
  const rbEl = outgoingRingbackAudio
  rbEl.muted = false
  rbEl.volume = 0.92
  if (rbEl.paused) {
    rbEl
      .play()
      .then(() => {
        if (!isOutgoingRingbackActive || expectedSeq !== outgoingRingbackSeq) {
          try {
            rbEl.muted = true
            rbEl.pause()
            rbEl.currentTime = 0
          } catch {}
        }
      })
      .catch(() => {
        if (
          isOutgoingRingbackActive &&
          expectedSeq === outgoingRingbackSeq &&
          liveAudioCtx &&
          outgoingRingbackBuffer &&
          liveAudioCtx.state === "running"
        ) {
          startWebAudioOutgoingRingback(expectedSeq)
        }
      })
  }
}

export function isOutgoingRingbackAudiblyPlaying(): boolean {
  return Boolean(
    isOutgoingRingbackActive &&
      ((activeOutgoingRingbackSource && liveAudioCtx?.state === "running") ||
        (outgoingRingbackAudio && !outgoingRingbackAudio.paused && !outgoingRingbackAudio.muted))
  )
}

export function resumeOutgoingCallerRingbackIfActive(): void {
  if (typeof window === "undefined" || !isOutgoingRingbackActive) return
  if (isOutgoingRingbackAudiblyPlaying()) return
  const seq = outgoingRingbackSeq
  ensureLiveAudioPipelineStarted()
  if (liveAudioCtx && !outgoingRingbackBuffer) {
    buildAudioBuffers(liveAudioCtx)
  }
  if (activeOutgoingRingbackSource && liveAudioCtx?.state !== "running") {
    stopWebAudioOutgoingRingbackSource()
  }
  if (liveAudioCtx && outgoingRingbackBuffer) {
    if (liveAudioCtx.state === "running") {
      if (startWebAudioOutgoingRingback(seq)) return
    } else {
      liveAudioCtx
        .resume()
        .then(() => {
          if (
            isOutgoingRingbackActive &&
            seq === outgoingRingbackSeq &&
            !isOutgoingRingbackAudiblyPlaying()
          ) {
            if (!startWebAudioOutgoingRingback(seq)) {
              startHtmlAudioOutgoingRingback(seq)
            }
          }
        })
        .catch(() => {})
    }
  }
  startHtmlAudioOutgoingRingback(seq)
}

export function startOutgoingCallerRingbackTone(): void {
  if (typeof window === "undefined") return
  ensureLiveAudioPipelineStarted()
  if (liveAudioCtx && !outgoingRingbackBuffer) {
    buildAudioBuffers(liveAudioCtx)
  }

  // Only treat as already playing if audio output is genuinely active & running
  if (activeOutgoingRingbackSource && liveAudioCtx?.state === "running") {
    isOutgoingRingbackActive = true
    if (outgoingRingbackAudio && !outgoingRingbackAudio.paused) {
      try {
        outgoingRingbackAudio.muted = true
        outgoingRingbackAudio.pause()
        outgoingRingbackAudio.currentTime = 0
      } catch {}
    }
    return
  }
  if (activeOutgoingRingbackSource && liveAudioCtx?.state !== "running") {
    stopWebAudioOutgoingRingbackSource()
  }
  if (outgoingRingbackAudio && !outgoingRingbackAudio.paused && !outgoingRingbackAudio.muted) {
    isOutgoingRingbackActive = true
    return
  }

  const myRingbackSeq = ++outgoingRingbackSeq
  isOutgoingRingbackActive = true

  let startedWebAudio = false
  if (liveAudioCtx && outgoingRingbackBuffer) {
    if (liveAudioCtx.state === "running") {
      startedWebAudio = startWebAudioOutgoingRingback(myRingbackSeq)
    } else {
      liveAudioCtx
        .resume()
        .then(() => {
          if (!isOutgoingRingbackActive || myRingbackSeq !== outgoingRingbackSeq) return
          if (
            !activeOutgoingRingbackSource &&
            (!outgoingRingbackAudio || outgoingRingbackAudio.paused || outgoingRingbackAudio.muted)
          ) {
            startWebAudioOutgoingRingback(myRingbackSeq)
          }
        })
        .catch(() => {})
    }
  }

  if (!startedWebAudio) {
    startHtmlAudioOutgoingRingback(myRingbackSeq)
  }

  if (!outgoingRingbackInteractionBound) {
    outgoingRingbackInteractionBound = true
    const resumeRingbackOnGesture = (ev?: Event) => {
      if (!isOutgoingRingbackActive) return
      if (
        ev?.target instanceof Element &&
        ev.target.closest("[data-connectln-call-action='hangup'], [data-connectln-call-action='decline']")
      ) {
        return
      }
      resumeOutgoingCallerRingbackIfActive()
    }
    window.addEventListener("pointerdown", resumeRingbackOnGesture, { capture: true, passive: true })
    window.addEventListener("click", resumeRingbackOnGesture, { capture: true, passive: true })
    window.addEventListener("touchstart", resumeRingbackOnGesture, { capture: true, passive: true })
    window.addEventListener("keydown", resumeRingbackOnGesture, { capture: true, passive: true })
  }

  if (!outgoingRingbackWatchdogTimer) {
    outgoingRingbackWatchdogTimer = setInterval(() => {
      if (!isOutgoingRingbackActive) {
        if (outgoingRingbackWatchdogTimer) {
          clearInterval(outgoingRingbackWatchdogTimer)
          outgoingRingbackWatchdogTimer = null
        }
        return
      }
      resumeOutgoingCallerRingbackIfActive()
    }, 950)
  }
}

export function stopOutgoingCallerRingbackTone(): void {
  outgoingRingbackSeq++
  isOutgoingRingbackActive = false
  if (outgoingRingbackWatchdogTimer) {
    clearInterval(outgoingRingbackWatchdogTimer)
    outgoingRingbackWatchdogTimer = null
  }
  stopWebAudioOutgoingRingbackSource()
  if (outgoingRingbackAudio) {
    try {
      outgoingRingbackAudio.muted = true
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
    if (!doc || !doc.body) return

    if (
      spec &&
      doc.body.dataset.renderedCallId === spec.callId &&
      doc.body.dataset.renderedAvatar === (spec.callerAvatar || "") &&
      doc.getElementById("btn-answer")
    ) {
      return
    }

    stopPipWindowRingAudio(win)

    if (!spec) {
      doc.body.dataset.renderedCallId = ""
      doc.body.dataset.renderedAvatar = ""
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

    doc.body.dataset.renderedCallId = spec.callId
    doc.body.dataset.renderedAvatar = spec.callerAvatar || ""

    try {
      win.resizeTo?.(460, 440)
      win.focus?.()
    } catch {}

    const safeName = String(spec.callerName || "ConnectLn Caller").replace(/[<>&"]/g, "")
    const safePhone = String(spec.callerPhone || "").replace(/[<>&"]/g, "")
    const rawAvatar = String(spec.callerAvatar || "").trim()
    const safeAvatar =
      rawAvatar &&
      (rawAvatar.startsWith("https://") ||
        rawAvatar.startsWith("http://") ||
        rawAvatar.startsWith("/") ||
        rawAvatar.startsWith("data:image/"))
        ? rawAvatar.replace(/[<>"']/g, "")
        : ""
    const isVideo = spec.callMode === "video"
    const nameParts = safeName.trim().split(/\s+/).filter(Boolean)
    const safeInitials = (
      nameParts.length >= 2
        ? `${nameParts[0][0] || ""}${nameParts[nameParts.length - 1][0] || ""}`
        : safeName.slice(0, 2) || "CL"
    ).toUpperCase()

    doc.title = `🔔 INCOMING CALL · ${safeName}`
    doc.body.style.margin = "0"
    doc.body.style.background = "#0B141A"
    doc.body.innerHTML = `
      <style>
        @keyframes waRipple {
          0% { transform: scale(0.95); opacity: 0.78; }
          75% { transform: scale(1.42); opacity: 0; }
          100% { transform: scale(1.42); opacity: 0; }
        }
        @keyframes waAcceptGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 28px rgba(37, 211, 102, 0.7); }
          50% { transform: scale(1.02); box-shadow: 0 0 46px rgba(37, 211, 102, 0.98); }
        }
        #btn-answer:hover { filter: brightness(1.08); }
        #btn-decline:hover { filter: brightness(1.08); }
      </style>
      <div style="height:100vh;width:100vw;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:14px 20px;background:radial-gradient(circle at 50% 35%, rgba(37,211,102,0.22) 0%, rgba(14,44,39,0.94) 42%, #0B141A 84%);color:#FFFFFF;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;text-align:center;overflow:hidden;border:2px solid rgba(37,211,102,0.45);">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#25D366;letter-spacing:0.12em;text-transform:uppercase;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>End-to-end encrypted · CONNECTLN ${isVideo ? "VIDEO" : "VOICE"} CALL</span>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:center;gap:14px;padding:4px 0;">
          <div style="position:relative;width:72px;height:72px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
            <span style="position:absolute;inset:-8px;border-radius:999px;border:2px solid rgba(37,211,102,0.55);animation:waRipple 1.5s ease-out infinite;"></span>
            <div style="position:relative;width:72px;height:72px;border-radius:999px;overflow:hidden;background:linear-gradient(135deg,#128C7E 0%,#075E54 100%);border:3px solid #25D366;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#FFFFFF;box-shadow:0 0 28px rgba(37,211,102,0.45);">
              ${
                safeAvatar
                  ? `<img src="${safeAvatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:999px;display:block;" onerror="this.style.display='none';var s=this.nextElementSibling;if(s)s.style.display='flex';" /><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;">${safeInitials}</span>`
                  : safeInitials
              }
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-start;text-align:left;min-width:0;max-width:290px;">
            <div style="font-size:24px;font-weight:900;line-height:1.15;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#FFFFFF;">${safeName}</div>
            <div style="font-size:14px;color:#86EFAC;font-weight:700;margin-top:2px;">${safePhone || "Ringing…"}</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;width:100%;box-sizing:border-box;">
          <button id="btn-answer" type="button" style="width:100%;min-height:68px;padding:14px 18px;border-radius:999px;border:3px solid #BBF7D0;background:#25D366;color:#FFFFFF;font-size:20px;font-weight:900;letter-spacing:0.03em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;box-shadow:0 0 36px rgba(37,211,102,0.85);animation:waAcceptGlow 1.2s ease-in-out infinite;">
            ${
              isVideo
                ? `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg><span>ACCEPT VIDEO CALL</span>`
                : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span>ACCEPT CALL</span>`
            }
          </button>

          <button id="btn-decline" type="button" style="width:100%;min-height:48px;padding:10px 16px;border-radius:999px;border:2px solid rgba(255,255,255,0.28);background:#FF3B30;color:#FFFFFF;font-size:16px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
            <span>DECLINE CALL</span>
          </button>
        </div>
      </div>
    `

    if (isIncomingRingtoneActive && !isIncomingRingtoneAudiblyPlaying()) {
      try {
        const myPipSeq = ringSessionSeq
        const pipAudio = doc.createElement("audio")
        pipAudio.id = "pip-ring-audio"
        pipAudio.dataset.connectlnCallAudio = "true"
        pipAudio.src = getRingtoneAudioSourceUri(getSelectedConnectLnRingtoneId())
        pipAudio.loop = true
        pipAudio.autoplay = true
        pipAudio.volume = 0.98
        pipAudio.setAttribute("playsinline", "true")
        pipAudio.style.cssText = "position:fixed;left:-9999px;width:1px;height:1px;opacity:0.01;"
        doc.body.appendChild(pipAudio)
        pipAudio
          .play()
          .then(() => {
            if (!isIncomingRingtoneActive || myPipSeq !== ringSessionSeq) {
              try {
                pipAudio.muted = true
                pipAudio.pause()
                pipAudio.currentTime = 0
                pipAudio.removeAttribute("src")
                pipAudio.remove()
              } catch {}
            }
          })
          .catch(() => {})
      } catch {}
    }

    const ansBtn = doc.getElementById("btn-answer")
    const decBtn = doc.getElementById("btn-decline")
    let handled = false
    const handleAnswerAction = () => {
      if (handled) return
      handled = true
      const liveSpec = currentRingingSpec || spec
      stopLoudPhoneRingtone(true)
      liveSpec?.onAnswer?.()
      try {
        ;(win.opener || window).focus()
        window.focus()
      } catch {}
    }
    const handleDeclineAction = () => {
      if (handled) return
      handled = true
      const liveSpec = currentRingingSpec || spec
      stopLoudPhoneRingtone(true)
      liveSpec?.onDecline?.()
    }
    if (ansBtn) {
      ansBtn.onclick = handleAnswerAction
    }
    if (decBtn) {
      decBtn.onclick = handleDeclineAction
    }
    doc.onkeydown = (ev: KeyboardEvent) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault()
        handleAnswerAction()
      } else if (ev.key === "Escape") {
        ev.preventDefault()
        handleDeclineAction()
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
 * Sized at 440x380 so the large centered WhatsApp Accept pill never clips on any laptop screen!
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
      width: 440,
      height: 380,
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
 * Returns any open standby PiP window to clean standby mode when the user opens an active
 * call modal on this tab so ZERO extra incoming call boxes overlap their active call,
 * while keeping the Always-On-Top receiver alive across calls without needing a fresh click gesture!
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
    renderIncomingCallDomIntoWindow(activePipWin, null, true)
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
  const notifIconSrc =
    spec.callerAvatar &&
    (spec.callerAvatar.startsWith("https://") ||
      spec.callerAvatar.startsWith("http://") ||
      spec.callerAvatar.startsWith("/"))
      ? spec.callerAvatar
      : "/brand/connectln-icon-256.png"

  try {
    if ("mediaSession" in navigator) {
      const ms = (navigator as any).mediaSession
      if (typeof (window as any).MediaMetadata === "function") {
        ms.metadata = new (window as any).MediaMetadata({
          title: "Incoming ConnectLn Call",
          artist: spec.callerName || "ConnectLn Caller",
          album: "Tap Answer to pick up",
          artwork: [{ src: notifIconSrc, sizes: "256x256", type: "image/png" }],
        })
      }
      ms.playbackState = "playing"
      ms.setActionHandler?.("play", () => currentRingingSpec?.onAnswer?.())
      ms.setActionHandler?.("pause", () => currentRingingSpec?.onDecline?.())
      ms.setActionHandler?.("stop", () => currentRingingSpec?.onDecline?.())
    }
  } catch {}

  // 1. If Always-On-Top Document PiP Receiver is open, transform it immediately into the Incoming Call Pop-Up Screen!
  if (activePipWin && !activePipWin.closed) {
    renderIncomingCallDomIntoWindow(activePipWin, spec, true)
  } else {
    // 2. Also attempt opening a standalone 460x440 Pop-Up Call Window (succeeds whenever popups are allowed!)
    try {
      const left = Math.max(20, Math.round((window.screen.availWidth - 460) / 2))
      const top = Math.max(30, Math.round((window.screen.availHeight - 440) / 2))
      if (!activePopupWin || activePopupWin.closed) {
        activePopupWin = window.open(
          "",
          "connectln_incoming_call_popup",
          `popup=yes,width=460,height=440,left=${left},top=${top}`
        )
      }
      if (activePopupWin && !activePopupWin.closed) {
        renderIncomingCallDomIntoWindow(activePopupWin, spec, false)
      }
    } catch {}
  }

  const nowMs = Date.now()
  if (notifiedCallAtMsMap.has(spec.callId)) return
  notifiedCallAtMsMap.set(spec.callId, nowMs)
  if (notifiedCallAtMsMap.size > 100) {
    for (const [cid, ts] of notifiedCallAtMsMap.entries()) {
      if (nowMs - ts > 300000) notifiedCallAtMsMap.delete(cid)
    }
  }

  const isVideo = spec.callMode === "video"
  const title = isVideo
    ? `🔔 INCOMING VIDEO CALL · ${spec.callerName}`
    : `🔔 INCOMING CALL · ${spec.callerName}`
  const body = `TAP THIS BANNER OR PRESS ACCEPT CALL BELOW${
    spec.callerPhone ? ` (${spec.callerPhone})` : ""
  }`

  // 3. Direct ServiceWorkerRegistration.showNotification (`requireInteraction: true`) — skip if SW already holds a notification for this tag
  try {
    if (
      "serviceWorker" in navigator &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      const reg = await navigator.serviceWorker.getRegistration("/")
      if (reg && typeof reg.showNotification === "function") {
        const existing =
          typeof reg.getNotifications === "function"
            ? await reg.getNotifications({ tag: `connectln-call-${spec.callId}` }).catch(() => [])
            : []
        if (existing && existing.length > 0) {
          return
        }
        const origin = window.location.origin || "https://conectln.com"
        const joinUrl = `${origin}/connectin?waCall=${encodeURIComponent(
          spec.callId
        )}&mode=${spec.callMode}&callerName=${encodeURIComponent(spec.callerName)}&autoAnswer=1`
        const bannerImageUrl = `${origin}/api/connectin/call-banner?caller=${encodeURIComponent(
          spec.callerName
        )}&mode=${spec.callMode}${
          spec.callerPhone ? `&phone=${encodeURIComponent(spec.callerPhone)}` : ""
        }`
        const isTabHidden = typeof document !== "undefined" && document.hidden
        const isAnyAudioActivelyPlaying = isIncomingRingtoneAudiblyPlaying()
        await reg.showNotification(title, {
          body,
          icon: notifIconSrc,
          badge: "/brand/connectln-icon.png",
          image: bannerImageUrl,
          tag: `connectln-call-${spec.callId}`,
          renotify: false,
          requireInteraction: true,
          silent: isTabHidden ? false : isAnyAudioActivelyPlaying,
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
              title: isVideo ? "✅ ACCEPT VIDEO CALL" : "✅ ACCEPT CALL",
            },
            {
              action: "decline",
              title: "❌ DECLINE",
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
        icon: notifIconSrc,
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
