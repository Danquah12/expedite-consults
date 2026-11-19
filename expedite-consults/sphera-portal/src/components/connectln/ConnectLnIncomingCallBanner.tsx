"use client"

import React, { useEffect, useRef, useState } from "react"
import { Video, Phone, PhoneOff } from "lucide-react"

interface IncomingCallSummary {
  id: string
  call_type: "audio" | "video" | "screenshare"
  initiator_name?: string
  participants?: Array<{
    user_id: string
    display_name: string
    is_video_on?: boolean
  }>
}

export function ConnectLnIncomingCallBanner({
  viewerName,
  viewerEmail,
  isAlreadyInCallStudio,
  onAcceptIncomingCall,
}: {
  viewerName?: string
  viewerEmail?: string
  isAlreadyInCallStudio?: boolean
  onAcceptIncomingCall: (callId: string, callerName: string, mode: "audio" | "video") => void
}) {
  const [incomingCall, setIncomingCall] = useState<IncomingCallSummary | null>(null)
  const declinedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const cleanName = (viewerName || "").trim()
    const cleanEmail = (viewerEmail || "").trim()
    if ((!cleanName && !cleanEmail) || isAlreadyInCallStudio) {
      setIncomingCall(null)
      return
    }

    let cancelled = false
    const checkIncoming = async () => {
      if (cancelled || document.visibilityState === "hidden") return
      try {
        const localPeerId = sessionStorage.getItem("vibe_call_participant_id") || ""
        const qs = new URLSearchParams({
          incoming_for: cleanName,
          incoming_email: cleanEmail,
          viewer_peer_id: localPeerId,
        })
        const res = await fetch(`/api/v1/calls?${qs.toString()}`, { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        const list: IncomingCallSummary[] = Array.isArray(data?.incoming_calls)
          ? data.incoming_calls
          : []
        const active = list.find((c) => c?.id && !declinedIdsRef.current.has(c.id)) || null
        setIncomingCall(active)
      } catch {
        // ignore transient network errors
      }
    }

    checkIncoming()
    const timer = window.setInterval(checkIncoming, 3500)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [viewerName, viewerEmail, isAlreadyInCallStudio])

  // Gentle incoming call ringtone pulse via WebAudio API while ringing
  useEffect(() => {
    if (!incomingCall) return
    let ctx: AudioContext | null = null
    const playChime = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioCtx) return
        if (!ctx) ctx = new AudioCtx()
        if (ctx.state === "suspended") ctx.resume().catch(() => {})
        const now = ctx.currentTime
        ;[523.25, 659.25].forEach((freq, i) => {
          if (!ctx) return
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = "sine"
          osc.frequency.setValueAtTime(freq, now + i * 0.16)
          gain.gain.setValueAtTime(0.001, now + i * 0.16)
          gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.16 + 0.03)
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.28)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + i * 0.16)
          osc.stop(now + i * 0.16 + 0.3)
        })
      } catch {}
    }
    playChime()
    const ringInterval = window.setInterval(playChime, 2600)
    return () => {
      window.clearInterval(ringInterval)
      if (ctx) ctx.close().catch(() => {})
    }
  }, [incomingCall?.id])

  if (!incomingCall) return null

  const callerName =
    incomingCall.participants?.[0]?.display_name ||
    incomingCall.initiator_name ||
    "ConnectLn Member"
  const isVideo = incomingCall.call_type !== "audio"

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[95] w-[94vw] max-w-md rounded-2xl bg-[#181411] border-2 border-emerald-400 shadow-2xl px-4 py-3.5 text-[#FBF8F3]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <span className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping" />
            <div className="relative h-11 w-11 rounded-full bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm border-2 border-emerald-300">
              {isVideo ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
              ● Incoming Live {isVideo ? "Video" : "Voice"} Call
            </p>
            <p className="text-sm font-extrabold text-white truncate">{callerName}</p>
            <p className="text-[11px] text-[#D8CBB8] truncate">
              {isVideo ? "Answer to turn on your camera & mic" : "Tap to answer live voice call"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              declinedIdsRef.current.add(incomingCall.id)
              setIncomingCall(null)
            }}
            style={{ color: "#FFFFFF" }}
            className="h-10 w-10 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-md cursor-pointer"
            title="Decline Call"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const targetId = incomingCall.id
              setIncomingCall(null)
              onAcceptIncomingCall(targetId, callerName, isVideo ? "video" : "audio")
            }}
            style={{ color: "#FFFFFF" }}
            className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            {isVideo ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            <span>{isVideo ? "Answer Camera" : "Answer"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
