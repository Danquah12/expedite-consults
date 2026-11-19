"use client"

/**
 * ConnectLn Always-On Minimized & Background Ringing + Pop-Up Call Screen Engine
 * ------------------------------------------------------------------------------
 * Solves ALL 3 browser background blocks when ConnectLn is minimized or behind other apps:
 * 1. Continuous `AudioContext -> MediaStreamDestination -> <audio autoplay>` feeding an
 *    inaudible 18 Hz sub-sonic keep-alive (-42 dBFS) prevents Chromium/Edge/Safari/Mobile
 *    from classifying the tab as silent or freezing it when minimized, AND mixes the loud
 *    phone ringtone directly into the already-playing stream so `.play()` is NEVER blocked!
 * 2. Spawns a real 390x520 Floating Pop-Up Call Screen (`window.open`), updates any active
 *    Always-On-Top Document Picture-in-Picture Call Receiver, AND fires direct
 *    `ServiceWorkerRegistration.showNotification` (`requireInteraction: true`).
 * 3. Dedicated Web Worker interval runs every 1.4s without background-tab throttling.
 */

let liveAudioCtx: AudioContext | null = null
let streamDest: MediaStreamAudioDestinationNode | null = null
let liveStreamAudioEl: HTMLAudioElement | null = null
let subSonicOsc: OscillatorNode | null = null
let fallbackWavRingAudio: HTMLAudioElement | null = null
let ringSynthInterval: ReturnType<typeof setInterval> | null = null
let ringVibrateTimer: ReturnType<typeof setInterval> | null = null
let titleFlashTimer: ReturnType<typeof setInterval> | null = null
let savedOriginalTitle: string = ""
let activePopupWin: Window | null = null
let activePipWin: Window | null = null
const notifiedCallIds = new Set<string>()

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
    samples[i] = Math.round(wave * warble * env * 22000)
  }

  cachedRingtoneUri = encodeMonoPcm16WavDataUri(samples, sampleRate)
  return cachedRingtoneUri
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
    if (liveAudioCtx && liveAudioCtx.state === "suspended") {
      liveAudioCtx.resume().catch(() => {})
    }
    if (liveAudioCtx && !streamDest && typeof liveAudioCtx.createMediaStreamDestination === "function") {
      streamDest = liveAudioCtx.createMediaStreamDestination()

      // 18 Hz sub-sonic keep-alive at -42 dBFS: completely inaudible to humans (<20 Hz & below speaker cutoff),
      // but above Chromium AudioPowerMonitor's -70 dBFS threshold so minimized tabs NEVER freeze!
      subSonicOsc = liveAudioCtx.createOscillator()
      const subGain = liveAudioCtx.createGain()
      subSonicOsc.type = "sine"
      subSonicOsc.frequency.value = 18
      subGain.gain.value = 0.008
      subSonicOsc.connect(subGain)
      subGain.connect(streamDest)
      subSonicOsc.start()
    }

    if (streamDest && !liveStreamAudioEl) {
      liveStreamAudioEl = document.createElement("audio")
      liveStreamAudioEl.srcObject = streamDest.stream
      liveStreamAudioEl.autoplay = true
      liveStreamAudioEl.volume = 1.0
      liveStreamAudioEl.setAttribute("playsinline", "true")
      liveStreamAudioEl.setAttribute("aria-hidden", "true")
      liveStreamAudioEl.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0.01;pointer-events:none;"
      if (document.body && !liveStreamAudioEl.isConnected) {
        document.body.appendChild(liveStreamAudioEl)
      }
    } else if (liveStreamAudioEl && document.body && !liveStreamAudioEl.isConnected) {
      document.body.appendChild(liveStreamAudioEl)
    }

    if (liveStreamAudioEl && liveStreamAudioEl.paused) {
      liveStreamAudioEl.play().catch(() => {})
    }

    if (!fallbackWavRingAudio) {
      fallbackWavRingAudio = new Audio(getPhoneRingtoneWavUri())
      fallbackWavRingAudio.loop = true
      fallbackWavRingAudio.volume = 1.0
      fallbackWavRingAudio.preload = "auto"
      fallbackWavRingAudio.setAttribute("playsinline", "true")
      // Prime & pause once so mobile Safari also unlocks standalone WAV element
      fallbackWavRingAudio.muted = true
      fallbackWavRingAudio
        .play()
        .then(() => {
          if (!ringSynthInterval && fallbackWavRingAudio) {
            fallbackWavRingAudio.pause()
            fallbackWavRingAudio.currentTime = 0
          }
          if (fallbackWavRingAudio) fallbackWavRingAudio.muted = false
        })
        .catch(() => {
          if (fallbackWavRingAudio) fallbackWavRingAudio.muted = false
        })
    }
  } catch {}
}

/**
 * Unlocks the continuous background audio pipeline on the user's first interaction.
 */
export function unlockBackgroundRingingSession(): void {
  if (typeof window === "undefined") return
  ensureLiveAudioPipelineStarted()

  const events = ["click", "pointerdown", "touchstart", "keydown"] as const
  const handler = () => {
    ensureLiveAudioPipelineStarted()
    if (liveAudioCtx?.state === "running" && liveStreamAudioEl && !liveStreamAudioEl.paused) {
      events.forEach((ev) => window.removeEventListener(ev, handler, true))
    }
  }
  events.forEach((ev) => window.addEventListener(ev, handler, { capture: true, passive: true }))
}

function scheduleOneRingCadenceOnLiveGraph(): void {
  ensureLiveAudioPipelineStarted()
  if (!liveAudioCtx) return
  try {
    if (liveAudioCtx.state === "suspended") {
      liveAudioCtx.resume().catch(() => {})
    }
    const now = liveAudioCtx.currentTime
    // Schedule two crisp classic phone bursts (0.00-0.52s and 0.68-1.22s) routed to BOTH streamDest AND hardware destination
    const bursts = [
      { start: 0.0, len: 0.52 },
      { start: 0.68, len: 0.54 },
    ]
    const freqs = [
      { f: 523.25, w: 0.24 },
      { f: 659.25, w: 0.2 },
      { f: 783.99, w: 0.14 },
    ]

    for (const b of bursts) {
      for (const { f, w } of freqs) {
        const osc = liveAudioCtx.createOscillator()
        const gain = liveAudioCtx.createGain()
        osc.type = "triangle"
        osc.frequency.setValueAtTime(f, now + b.start)
        gain.gain.setValueAtTime(0.0001, now + b.start)
        gain.gain.linearRampToValueAtTime(w, now + b.start + 0.025)
        gain.gain.setValueAtTime(w, now + b.start + b.len - 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + b.start + b.len)

        osc.connect(gain)
        if (streamDest) gain.connect(streamDest)
        gain.connect(liveAudioCtx.destination)

        osc.start(now + b.start)
        osc.stop(now + b.start + b.len + 0.02)
      }
    }
  } catch {}
}

export function startLoudPhoneRingtone(): void {
  if (typeof window === "undefined") return
  ensureLiveAudioPipelineStarted()

  if (!ringSynthInterval) {
    scheduleOneRingCadenceOnLiveGraph()
    ringSynthInterval = setInterval(scheduleOneRingCadenceOnLiveGraph, 2200)
  }

  // Also trigger WAV element as redundant backup for mobile Safari
  if (fallbackWavRingAudio) {
    fallbackWavRingAudio.muted = false
    fallbackWavRingAudio.volume = 1.0
    if (fallbackWavRingAudio.paused) {
      fallbackWavRingAudio.play().catch(() => {})
    }
  }

  if (!ringVibrateTimer) {
    try {
      navigator.vibrate?.([550, 220, 550, 220, 750])
    } catch {}
    ringVibrateTimer = setInterval(() => {
      try {
        navigator.vibrate?.([550, 220, 550, 220, 750])
      } catch {}
    }, 2200)
  }
}

export function stopLoudPhoneRingtone(): void {
  if (ringSynthInterval) {
    clearInterval(ringSynthInterval)
    ringSynthInterval = null
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

function renderIncomingCallDomIntoWindow(win: Window, spec: PopupIncomingCallSpec | null, isStandbyPiP = false) {
  try {
    const doc = win.document
    if (!doc) return

    if (!spec) {
      if (!isStandbyPiP) {
        win.close()
        return
      }
      doc.title = "ConnectLn Call Standby"
      doc.body.innerHTML = `
        <div style="margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px 18px;background:linear-gradient(180deg,#111B21 0%,#0B141A 100%);color:#FBF8F3;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;text-align:center;">
          <div style="width:42px;height:42px;border-radius:999px;background:rgba(16,185,129,0.16);border:2px solid #34D399;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 18px rgba(16,185,129,0.28);">
            📞
          </div>
          <div style="font-size:13px;font-weight:800;color:#6EE7B7;">ConnectLn Call Receiver Ready</div>
          <div style="font-size:11px;color:#CBD5E1;line-height:1.35;">
            You can minimize your browser — incoming voice &amp; video calls will ring out loud and appear right here!
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
      <div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:14px 16px;background:linear-gradient(180deg,#071E1A 0%,#0B141A 100%);color:#FFFFFF;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;text-align:center;overflow:hidden;">
        <div style="font-size:10.5px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:#34D399;">
          ● CONNECTLN INCOMING ${isVideo ? "VIDEO" : "VOICE"} CALL
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="position:relative;width:58px;height:58px;display:flex;align-items:center;justify-content:center;margin-bottom:4px;">
            <span style="position:absolute;inset:-6px;border-radius:999px;border:2.5px solid #34D399;animation:pulseRing 1.4s infinite;"></span>
            <div style="width:54px;height:54px;border-radius:999px;background:#059669;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 8px 22px rgba(5,150,105,0.45);border:2.5px solid #6EE7B7;">
              ${isVideo ? "📹" : "📞"}
            </div>
          </div>
          <div style="font-size:18px;font-weight:800;line-height:1.15;max-width:295px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeName}</div>
          ${safePhone ? `<div style="font-size:12px;color:#6EE7B7;font-family:monospace;font-weight:700;">${safePhone}</div>` : `<div style="font-size:11.5px;color:#CBD5E1;">Ringing over ConnectLn Internet...</div>`}
        </div>

        <div style="display:flex;gap:10px;width:100%;justify-content:center;">
          <button id="btn-decline" style="flex:1;padding:11px 12px;border-radius:999px;border:none;background:#E11D48;color:#FFFFFF;font-weight:800;font-size:12.5px;cursor:pointer;box-shadow:0 5px 14px rgba(225,29,72,0.4);">
            ✕ Decline
          </button>
          <button id="btn-answer" style="flex:1.4;padding:11px 14px;border-radius:999px;border:none;background:#10B981;color:#FFFFFF;font-weight:800;font-size:12.5px;cursor:pointer;box-shadow:0 5px 16px rgba(16,185,129,0.5);">
            ${isVideo ? "📹 Answer Video" : "📞 Answer Call"}
          </button>
        </div>
      </div>
    `

    const ansBtn = doc.getElementById("btn-answer")
    const decBtn = doc.getElementById("btn-decline")
    if (ansBtn) {
      ansBtn.onclick = () => {
        // Restore & un-minimize the named main ConnectLn browser window using this click's user gesture!
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
 * Sized at 340x245 so the full Incoming Call Pop-Up Screen renders cleanly inside it when minimized without needing user-gesture resize!
 */
export async function openAlwaysOnTopCallStandbyPiP(): Promise<boolean> {
  if (!isDocumentPipSupported()) return false
  ensureLiveAudioPipelineStarted()
  try {
    if (activePipWin && !activePipWin.closed) {
      activePipWin.focus()
      return true
    }
    const dpip = (window as any).documentPictureInPicture
    const pipWindow: Window = await dpip.requestWindow({
      width: 340,
      height: 245,
    })
    activePipWin = pipWindow
    renderIncomingCallDomIntoWindow(pipWindow, currentRingingSpec, true)
    pipWindow.addEventListener("pagehide", () => {
      activePipWin = null
    })
    return true
  } catch {
    return false
  }
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

/**
 * Launches BOTH:
 * 1. Real Floating Pop-Up Call Screen Window (via Always-On-Top PiP if open, or `window.open` standalone popup window), AND
 * 2. Direct OS System Call Notification (`reg.showNotification` with `requireInteraction: true` + `Answer` / `Decline` buttons).
 */
export async function triggerSystemIncomingCallAlert(
  spec: PopupIncomingCallSpec
): Promise<void> {
  if (typeof window === "undefined") return
  currentRingingSpec = spec

  // 1. If Always-On-Top Document PiP Receiver is open, expand it immediately into the Incoming Call Screen!
  if (activePipWin && !activePipWin.closed) {
    renderIncomingCallDomIntoWindow(activePipWin, spec, true)
  } else {
    // 2. Attempt opening a real 390x500 standalone Pop-Up Call Window on top of the minimized browser!
    try {
      const left = Math.max(20, Math.round((window.screen.availWidth - 390) / 2))
      const top = Math.max(30, Math.round((window.screen.availHeight - 500) / 2))
      if (!activePopupWin || activePopupWin.closed) {
        activePopupWin = window.open(
          "",
          "connectln_incoming_call_popup",
          `popup=yes,width=390,height=500,left=${left},top=${top}`
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

  // 3. Call `reg.showNotification(...)` DIRECTLY on ServiceWorkerRegistration (works reliably in Edge/Chrome/Android!)
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

  // 4. Fallback to `new Notification(...)`
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
