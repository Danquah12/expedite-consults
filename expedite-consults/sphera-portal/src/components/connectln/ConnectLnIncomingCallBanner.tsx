"use client"

import React, { useEffect, useRef, useState } from "react"
import { Video, Phone, PhoneOff } from "lucide-react"
import { getMyLinkedConnectLnPhone } from "./ConnectLnWhatsAppCallModal"
import { prettyClientPhone } from "./ConnectLnCellPhoneSoftphone"
import { reportIncomingCallToNativeOS } from "@/lib/connectin-native-callkit-bridge"

interface IncomingCallSummary {
  id: string
  call_type: "audio" | "video" | "screenshare"
  initiator_name?: string
  initiator_phone?: string
  invited_roster?: Array<{
    id: string
    name: string
    status: string
  }>
  participants?: Array<{
    user_id: string
    display_name: string
    is_video_on?: boolean
  }>
}

function isLocalTabHostingOpenCall(): boolean {
  if (typeof window === "undefined") return false
  return Number((window as any).__connectlnOpenCallModalCount || 0) > 0
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
  onAcceptIncomingCall: (
    callId: string,
    callerName: string,
    mode: "audio" | "video",
    callerPhone?: string
  ) => void
}) {
  const [incomingCall, setIncomingCall] = useState<IncomingCallSummary | null>(null)
  const [myPhone, setMyPhone] = useState<string>("")
  const [hasOpenModal, setHasOpenModal] = useState<boolean>(false)
  const declinedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const syncPhone = () => setMyPhone(getMyLinkedConnectLnPhone())
    const syncModalOpen = () => {
      const openNow = isLocalTabHostingOpenCall()
      setHasOpenModal(openNow)
      if (openNow) setIncomingCall(null)
    }
    syncPhone()
    syncModalOpen()
    window.addEventListener("connectln_phone_linked", syncPhone)
    window.addEventListener("storage", syncPhone)
    window.addEventListener("connectln_call_modal_change", syncModalOpen)

    // Listen for instant Service Worker push messages (`public/sw.js`) so ringing starts in <50ms!
    const onSwMessage = (ev: MessageEvent) => {
      const msg = ev?.data
      if (!msg) return
      if (isLocalTabHostingOpenCall()) return
      if (msg.type === "CONNECTLN_PUSH_INCOMING_CALL" && msg.payload?.callId) {
        const p = msg.payload
        if (!declinedIdsRef.current.has(p.callId)) {
          setIncomingCall({
            id: p.callId,
            call_type: p.callMode === "audio" ? "audio" : "video",
            initiator_name: p.callerName,
            initiator_phone: p.callerPhone,
          })
          void reportIncomingCallToNativeOS({
            callId: p.callId,
            callerName: p.callerName || "ConnectLn Caller",
            callerPhone: p.callerPhone,
            hasVideo: p.callMode !== "audio",
          })
        }
      } else if (msg.type === "CONNECTLN_ANSWER_CALL_FROM_NOTIFICATION" && msg.payload?.callId) {
        const p = msg.payload
        setIncomingCall(null)
        onAcceptIncomingCall(
          p.callId,
          p.callerName || "ConnectLn Caller",
          p.callMode === "audio" ? "audio" : "video",
          p.callerPhone
        )
      }
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {})
      navigator.serviceWorker.addEventListener("message", onSwMessage)
    }

    return () => {
      window.removeEventListener("connectln_phone_linked", syncPhone)
      window.removeEventListener("storage", syncPhone)
      window.removeEventListener("connectln_call_modal_change", syncModalOpen)
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onSwMessage)
      }
    }
  }, [onAcceptIncomingCall])

  useEffect(() => {
    const cleanName = (viewerName || "").trim()
    const cleanEmail = (viewerEmail || "").trim()
    const cleanPhone = (myPhone || "").trim()
    if ((!cleanName && !cleanEmail && !cleanPhone) || isAlreadyInCallStudio || hasOpenModal) {
      setIncomingCall(null)
      return
    }

    let cancelled = false
    const checkIncoming = async () => {
      if (cancelled || document.visibilityState === "hidden" || isLocalTabHostingOpenCall()) return
      try {
        const localPeerId = sessionStorage.getItem("vibe_call_participant_id") || ""
        const qs = new URLSearchParams({
          incoming_for: cleanName,
          incoming_email: cleanEmail,
          incoming_phone: cleanPhone,
          viewer_peer_id: localPeerId,
        })
        const res = await fetch(`/api/v1/calls?${qs.toString()}`, { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled || isLocalTabHostingOpenCall()) return
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
    const timer = window.setInterval(checkIncoming, 2500)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [viewerName, viewerEmail, myPhone, isAlreadyInCallStudio, hasOpenModal])

  // WhatsApp-style pleasant dual-tone incoming call chime via WebAudio API
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
        ;[523.25, 659.25, 783.99].forEach((freq, i) => {
          if (!ctx) return
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = "sine"
          osc.frequency.setValueAtTime(freq, now + i * 0.14)
          gain.gain.setValueAtTime(0.001, now + i * 0.14)
          gain.gain.exponentialRampToValueAtTime(0.09, now + i * 0.14 + 0.03)
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.28)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + i * 0.14)
          osc.stop(now + i * 0.14 + 0.3)
        })
      } catch {}
    }
    playChime()
    const ringInterval = window.setInterval(playChime, 2400)
    return () => {
      window.clearInterval(ringInterval)
      if (ctx) ctx.close().catch(() => {})
    }
  }, [incomingCall?.id])

  if (!incomingCall || hasOpenModal) return null

  const callerName =
    incomingCall.participants?.[0]?.display_name ||
    incomingCall.initiator_name ||
    "ConnectLn Caller"
  const callerPhone = incomingCall.initiator_phone
    ? prettyClientPhone(incomingCall.initiator_phone)
    : ""
  const isVideo = incomingCall.call_type !== "audio"
  const activeInvitesCount = (incomingCall.invited_roster || []).filter(
    (m) => m.status !== "removed"
  ).length

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[95] w-[94vw] max-w-md rounded-3xl bg-[#111B21] border-2 border-emerald-400 shadow-2xl px-4 py-4 text-[#FBF8F3]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <span className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping" />
            <div className="relative h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm border-2 border-emerald-300">
              {isVideo ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
              ● ConnectLn {isVideo ? "Video" : "Voice"} Call
              {activeInvitesCount >= 2 ? ` · Group (${activeInvitesCount + 1})` : ""}
            </p>
            <p className="text-base font-extrabold text-white truncate">{callerName}</p>
            <p className="text-[11px] text-emerald-200/90 font-mono truncate">
              {callerPhone || (isVideo ? "Tap Answer Video to turn on camera" : "Incoming voice call")}
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
            className="h-11 w-11 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-md cursor-pointer"
            title="Decline Call"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const targetId = incomingCall.id
              setIncomingCall(null)
              onAcceptIncomingCall(
                targetId,
                callerName,
                isVideo ? "video" : "audio",
                incomingCall.initiator_phone
              )
            }}
            style={{ color: "#FFFFFF" }}
            className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            {isVideo ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            <span>{isVideo ? "Answer Video" : "Answer"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
