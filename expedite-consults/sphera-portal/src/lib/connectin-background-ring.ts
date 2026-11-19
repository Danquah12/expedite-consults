"use client"

/**
 * ConnectLn Background & Minimized Call Ringing Engine
 * Ensures ConnectLn rings audibly and surfaces an OS-level Answer popup even when the browser/PWA is minimized or behind other apps:
 * 1. Inaudible PCM Keep-Alive `<audio loop>` prevents Chrome/Edge/Safari/Mobile OS from freezing JS when ConnectLn is minimized.
 * 2. Pre-unlocked PCM WAV Phone Ringtone `<audio loop>` plays loud & clear while minimized (bypassing suspended AudioContext blocks).
 * 3. Dedicated Web Worker timer runs every 1.6s without background-tab `setInterval` throttling.
 * 4. Service Worker OS Notification + Taskbar Title Flash lets the user pick up from anywhere with 1 click/tap.
 */

let keepAliveAudio: HTMLAudioElement | null = null
let ringtoneAudio: HTMLAudioElement | null = null
let sharedAudioCtx: AudioContext | null = null
let sessionUnlocked = false
let ringVibrateTimer: ReturnType<typeof setInterval> | null = null
let titleFlashTimer: ReturnType<typeof setInterval> | null = null
let savedOriginalTitle: string = ""
const notifiedCallIds = new Set<string>()

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
  view.setUint32(16, 16, true) // PCM chunk size
  view.setUint16(20, 1, true) // PCM format = 1
  view.setUint16(22, 1, true) // Mono = 1 channel
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

let cachedSilentUri: string | null = null
function getSilentKeepAliveWavUri(): string {
  if (cachedSilentUri) return cachedSilentUri
  const sampleRate = 8000
  const samples = new Int16Array(sampleRate) // 1.0s
  for (let i = 0; i < samples.length; i++) {
    // Amplitude 1 out of 32767 (-90 dB, completely inaudible) so browser audio pipeline stays active when minimized
    samples[i] = i % 2 === 0 ? 1 : -1
  }
  cachedSilentUri = encodeMonoPcm16WavDataUri(samples, sampleRate)
  return cachedSilentUri
}

let cachedRingtoneUri: string | null = null
function getPhoneRingtoneWavUri(): string {
  if (cachedRingtoneUri) return cachedRingtoneUri
  const sampleRate = 16000
  const durationSec = 2.6
  const totalSamples = Math.floor(sampleRate * durationSec)
  const samples = new Int16Array(totalSamples)

  // Crisp WhatsApp/Modern Phone Dual-Burst Harmonic Ringtone:
  // Burst 1: 0.00s - 0.55s, Burst 2: 0.72s - 1.32s, Pause: 1.32s - 2.60s
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
    // Smooth attack & release envelope (no clicks)
    const attack = Math.min(1, localT / 0.025)
    const release = Math.min(1, (burstLen - localT) / 0.04)
    const env = Math.max(0, Math.min(attack, release))

    // Pleasant musical cadence (C5 523.25Hz + E5 659.25Hz + G5 783.99Hz modulated gently at 18Hz)
    const warble = 0.82 + 0.18 * Math.sin(2 * Math.PI * 18 * localT)
    const wave =
      0.45 * Math.sin(2 * Math.PI * 523.25 * t) +
      0.35 * Math.sin(2 * Math.PI * 659.25 * t) +
      0.2 * Math.sin(2 * Math.PI * 783.99 * t)

    samples[i] = Math.round(wave * warble * env * 19500)
  }

  cachedRingtoneUri = encodeMonoPcm16WavDataUri(samples, sampleRate)
  return cachedRingtoneUri
}

/**
 * Unlocks background audio & keep-alive on the user's first click/tap/keypress inside ConnectLn.
 * Once unlocked, minimized tabs stay awake and can play the loud phone ringtone anytime an incoming call arrives.
 */
export function unlockBackgroundRingingSession(onFirstUnlock?: () => void): void {
  if (typeof window === "undefined") return

  if (!keepAliveAudio) {
    keepAliveAudio = new Audio(getSilentKeepAliveWavUri())
    keepAliveAudio.loop = true
    keepAliveAudio.volume = 0.01
    keepAliveAudio.setAttribute("playsinline", "true")
  }

  if (!ringtoneAudio) {
    ringtoneAudio = new Audio(getPhoneRingtoneWavUri())
    ringtoneAudio.loop = true
    ringtoneAudio.volume = 1.0
    ringtoneAudio.preload = "auto"
    ringtoneAudio.setAttribute("playsinline", "true")
  }

  const tryUnlockNow = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx && !sharedAudioCtx) {
        sharedAudioCtx = new AudioCtx()
      }
      if (sharedAudioCtx?.state === "suspended") {
        sharedAudioCtx.resume().catch(() => {})
      }
    } catch {}

    if (keepAliveAudio && keepAliveAudio.paused) {
      keepAliveAudio.play().catch(() => {})
    }

    if (ringtoneAudio && !sessionUnlocked) {
      const wasPaused = ringtoneAudio.paused
      if (wasPaused) {
        ringtoneAudio.muted = true
        ringtoneAudio
          .play()
          .then(() => {
            ringtoneAudio!.pause()
            ringtoneAudio!.currentTime = 0
            ringtoneAudio!.muted = false
            sessionUnlocked = true
            onFirstUnlock?.()
          })
          .catch(() => {
            ringtoneAudio!.muted = false
          })
      }
    }
  }

  tryUnlockNow()

  const gestureEvents = ["pointerdown", "touchstart", "keydown", "click"] as const
  const onGesture = () => {
    tryUnlockNow()
    if (sessionUnlocked && keepAliveAudio && !keepAliveAudio.paused) {
      gestureEvents.forEach((ev) => window.removeEventListener(ev, onGesture))
    }
  }
  gestureEvents.forEach((ev) => window.addEventListener(ev, onGesture, { passive: true }))
}

export function startLoudPhoneRingtone(): void {
  if (typeof window === "undefined") return

  if (!ringtoneAudio) {
    ringtoneAudio = new Audio(getPhoneRingtoneWavUri())
    ringtoneAudio.loop = true
    ringtoneAudio.volume = 1.0
    ringtoneAudio.setAttribute("playsinline", "true")
  }

  ringtoneAudio.muted = false
  ringtoneAudio.volume = 1.0
  ringtoneAudio.play().catch(() => {
    // Fallback to WebAudio oscillator if HTMLAudioElement hasn't been gesture-primed yet
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx()
      if (sharedAudioCtx.state === "suspended") sharedAudioCtx.resume().catch(() => {})
      const now = sharedAudioCtx.currentTime
      ;[523.25, 659.25, 783.99].forEach((freq, i) => {
        if (!sharedAudioCtx) return
        const osc = sharedAudioCtx.createOscillator()
        const gain = sharedAudioCtx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + i * 0.14)
        gain.gain.setValueAtTime(0.001, now + i * 0.14)
        gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.14 + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.32)
        osc.connect(gain)
        gain.connect(sharedAudioCtx.destination)
        osc.start(now + i * 0.14)
        osc.stop(now + i * 0.14 + 0.35)
      })
    } catch {}
  })

  if (!ringVibrateTimer) {
    try {
      navigator.vibrate?.([500, 220, 500, 220, 700])
    } catch {}
    ringVibrateTimer = setInterval(() => {
      try {
        navigator.vibrate?.([500, 220, 500, 220, 700])
      } catch {}
    }, 2400)
  }
}

export function stopLoudPhoneRingtone(): void {
  if (ringtoneAudio) {
    try {
      ringtoneAudio.pause()
      ringtoneAudio.currentTime = 0
    } catch {}
  }
  if (ringVibrateTimer) {
    clearInterval(ringVibrateTimer)
    ringVibrateTimer = null
  }
  try {
    navigator.vibrate?.(0)
  } catch {}
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
  }, 900)
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

/**
 * Pops up an OS-level Incoming Call Notification on top of minimized/other windows
 * with 1-click "Answer Call" and "Decline" buttons.
 */
export async function triggerSystemIncomingCallAlert(params: {
  callId: string
  callerName: string
  callerPhone?: string
  callMode: "audio" | "video"
  onAnswerClick: () => void
}): Promise<void> {
  if (typeof window === "undefined") return
  if (notifiedCallIds.has(params.callId)) return
  notifiedCallIds.add(params.callId)

  const isVideo = params.callMode === "video"
  const title = isVideo
    ? `📹 Incoming Video Call · ${params.callerName}`
    : `📞 Incoming Voice Call · ${params.callerName}`
  const body = `Calling${
    params.callerPhone ? ` (${params.callerPhone})` : ""
  } on ConnectLn — Tap to bring up ConnectLn & answer`

  // 1. Prefer Service Worker notification (supports `Answer` / `Decline` action buttons + `client.focus()` from minimized state)
  try {
    if ("serviceWorker" in navigator && typeof Notification !== "undefined" && Notification.permission === "granted") {
      const reg = await navigator.serviceWorker.getRegistration("/")
      if (reg?.active) {
        reg.active.postMessage({
          type: "SHOW_LOCAL_CALL_NOTIFICATION",
          payload: {
            callId: params.callId,
            callMode: params.callMode,
            callerName: params.callerName,
            callerPhone: params.callerPhone || "",
          },
        })
        return
      }
    }
  } catch {}

  // 2. Direct Window Notification API fallback
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      const n = new Notification(title, {
        body,
        icon: "/brand/connectln-icon-256.png",
        tag: `connectln-call-${params.callId}`,
        requireInteraction: true,
      })
      n.onclick = () => {
        try {
          window.focus()
        } catch {}
        n.close()
        params.onAnswerClick()
      }
    }
  } catch {}
}

/**
 * Creates a dedicated Web Worker interval timer that is NOT throttled to 60s when the browser window is minimized!
 */
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
