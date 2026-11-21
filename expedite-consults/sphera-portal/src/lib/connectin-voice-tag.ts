"use client"

/**
 * ConnectLn Human VOICE-TAG Engine
 *
 * Completely eliminates robotic browser `window.speechSynthesis` TTS.
 * Priority:
 *  1. Member's own live microphone recording (`data:audio/...`) saved locally & in cloud KV.
 *  2. Fallback to ConnectLn Studio Natural Human Voice Actor (`/api/connectin/tts` — 24kHz neural studio human voice actor).
 */

let activeVoiceTagAudio: HTMLAudioElement | null = null

export function stopActiveVoiceTagAudio(): void {
  if (activeVoiceTagAudio) {
    try {
      activeVoiceTagAudio.pause()
      activeVoiceTagAudio.currentTime = 0
    } catch {}
    activeVoiceTagAudio = null
  }
}

export function getVoiceTagStorageKey(userName: string): string {
  return `connectln_voicetag_audio_v1__${String(userName || "").trim().toLowerCase()}`
}

export function loadRecordedHumanVoiceTag(userName: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const val = localStorage.getItem(getVoiceTagStorageKey(userName))
    return val && val.startsWith("data:audio/") ? val : null
  } catch {
    return null
  }
}

export function hasRecordedHumanVoiceTag(userName: string): boolean {
  return Boolean(loadRecordedHumanVoiceTag(userName))
}

export async function playHumanVoiceTag(opts: {
  userName: string
  userHeadline?: string
  customPhrase?: string
  audioDataUrl?: string
}): Promise<"recorded_human" | "studio_human"> {
  if (typeof window === "undefined") return "studio_human"
  stopActiveVoiceTagAudio()

  const userKey = String(opts.userName || "").trim().toLowerCase()
  const recorded =
    (opts.audioDataUrl && opts.audioDataUrl.startsWith("data:audio/") ? opts.audioDataUrl : null) ||
    loadRecordedHumanVoiceTag(opts.userName)

  if (recorded) {
    try {
      const audio = new Audio(recorded)
      audio.volume = 1.0
      activeVoiceTagAudio = audio
      await audio.play()
      return "recorded_human"
    } catch {
      // fall through to Studio Natural Human Voice Actor
    }
  }

  let savedPhrase = ""
  try {
    savedPhrase = localStorage.getItem(`connectln_voicetag_v1__${userKey}`) || ""
  } catch {}

  const spokenText = (
    opts.customPhrase ||
    savedPhrase ||
    `${opts.userName}. ${opts.userHeadline || "Verified ConnectLn Member"}`
  )
    .trim()
    .slice(0, 220)

  const ttsUrl = `/api/connectin/tts?text=${encodeURIComponent(
    spokenText
  )}&speaker=${encodeURIComponent(opts.userName || "Kwesi Asiedu")}&lang=en`

  try {
    const audio = new Audio(ttsUrl)
    audio.volume = 1.0
    activeVoiceTagAudio = audio
    await audio.play()
  } catch {}

  return "studio_human"
}

export async function recordRealHumanVoiceTag(
  userName: string,
  durationMs = 4000,
  onProgress?: (label: string) => void
): Promise<string | null> {
  if (
    typeof window === "undefined" ||
    !navigator?.mediaDevices?.getUserMedia ||
    typeof MediaRecorder === "undefined"
  ) {
    onProgress?.("Microphone recording not supported in this browser")
    return null
  }

  let stream: MediaStream | null = null
  try {
    onProgress?.("Requesting microphone...")
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const preferredMime = MediaRecorder.isTypeSupported?.("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported?.("audio/mp4")
      ? "audio/mp4"
      : ""

    const recorder = preferredMime
      ? new MediaRecorder(stream, { mimeType: preferredMime })
      : new MediaRecorder(stream)

    const chunks: BlobPart[] = []
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunks.push(ev.data)
    }

    const recordedBlob = await new Promise<Blob>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        if (recorder.state !== "inactive") {
          try {
            recorder.stop()
          } catch {}
        }
      }, durationMs)

      recorder.onstop = () => {
        window.clearTimeout(timer)
        const mime = recorder.mimeType || "audio/webm"
        resolve(new Blob(chunks, { type: mime }))
      }
      recorder.onerror = () => {
        window.clearTimeout(timer)
        reject(new Error("Microphone recording failed"))
      }

      onProgress?.(`Recording your real voice (${Math.round(durationMs / 1000)}s)...`)
      recorder.start()
    })

    if (!recordedBlob || recordedBlob.size < 100) {
      onProgress?.("No audio captured")
      return null
    }

    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(String(reader.result || ""))
      reader.readAsDataURL(recordedBlob)
    })

    if (dataUrl && dataUrl.startsWith("data:audio/")) {
      try {
        localStorage.setItem(getVoiceTagStorageKey(userName), dataUrl)
        window.dispatchEvent(new Event("connectln-voicetag-updated"))
      } catch {}

      try {
        await fetch("/api/connectin/sovereign-suite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_voice_tag_audio",
            actorName: userName,
            audioDataUrl: dataUrl,
          }),
        })
      } catch {}

      onProgress?.("Saved real human VOICE-TAG!")
      await playHumanVoiceTag({ userName, audioDataUrl: dataUrl })
      return dataUrl
    }

    return null
  } catch {
    onProgress?.("Microphone permission denied or unavailable")
    return null
  } finally {
    if (stream) {
      stream.getTracks().forEach((t) => {
        try {
          t.stop()
        } catch {}
      })
    }
  }
}
