"use client"

import React, { useEffect, useRef, useState } from "react"
import { Video, Phone, PhoneOff, Bell, X } from "lucide-react"
import {
  getMyLinkedConnectLnPhone,
  MY_LINKED_PHONE_STORAGE_KEY,
} from "./ConnectLnWhatsAppCallModal"
import {
  prettyClientPhone,
  looksLikeClientPhone,
  normalizeClientPhone,
} from "./ConnectLnCellPhoneSoftphone"
import {
  reportIncomingCallToNativeOS,
  registerConnectLnPushSubscription,
} from "@/lib/connectin-native-callkit-bridge"
import {
  unlockBackgroundRingingSession,
  startLoudPhoneRingtone,
  stopLoudPhoneRingtone,
  startTitleCallFlash,
  stopTitleCallFlash,
  triggerSystemIncomingCallAlert,
  createUnthrottledCallPollWorker,
} from "@/lib/connectin-background-ring"

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
  const [showMobileRingPrompt, setShowMobileRingPrompt] = useState<boolean>(false)
  const [isIosBrowserTab, setIsIosBrowserTab] = useState<boolean>(false)
  const [vapidKey, setVapidKey] = useState<string>("")
  const [isEnablingPush, setIsEnablingPush] = useState<boolean>(false)
  const declinedIdsRef = useRef<Set<string>>(new Set())
  const vapidKeyRef = useRef<string>("")
  const myPhoneRef = useRef<string>("")
  const autoPushAttemptedRef = useRef<boolean>(false)

  useEffect(() => {
    vapidKeyRef.current = vapidKey
  }, [vapidKey])

  useEffect(() => {
    myPhoneRef.current = myPhone
  }, [myPhone])

  // 1. Unlock Always-On Background Audio Keep-Alive + Loud Ringtone on first user interaction,
  //    AND auto-subscribe Web Push if notification permission is granted or requested on first gesture!
  useEffect(() => {
    unlockBackgroundRingingSession(() => {
      if (
        !autoPushAttemptedRef.current &&
        myPhoneRef.current &&
        vapidKeyRef.current &&
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      ) {
        autoPushAttemptedRef.current = true
        registerConnectLnPushSubscription(vapidKeyRef.current)
          .then((sub) => {
            if (!sub || !myPhoneRef.current) return
            const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent || "")
            fetch("/api/connectin/calls/whatsapp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "register",
                phone: myPhoneRef.current,
                name: viewerName || "ConnectLn Member",
                email: viewerEmail,
                pushSubscription: sub,
                deviceLabel: isMobile ? "Mobile Phone" : "Desktop Browser",
              }),
            }).catch(() => {})
            setShowMobileRingPrompt(false)
          })
          .catch(() => {})
      }
    })
  }, [viewerEmail, viewerName])

  useEffect(() => {
    const syncPhone = () => setMyPhone(getMyLinkedConnectLnPhone())
    const syncModalOpen = () => {
      const openNow = isLocalTabHostingOpenCall()
      setHasOpenModal(openNow)
      if (openNow) {
        setIncomingCall(null)
        stopLoudPhoneRingtone()
        stopTitleCallFlash()
      }
    }
    syncPhone()
    syncModalOpen()
    window.addEventListener("connectln_phone_linked", syncPhone)
    window.addEventListener("storage", syncPhone)
    window.addEventListener("connectln_call_modal_change", syncModalOpen)

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
          startLoudPhoneRingtone()
          startTitleCallFlash(p.callerName || "ConnectLn Caller")
          void reportIncomingCallToNativeOS({
            callId: p.callId,
            callerName: p.callerName || "ConnectLn Caller",
            callerPhone: p.callerPhone,
            hasVideo: p.callMode !== "audio",
          })
        }
      } else if (msg.type === "CONNECTLN_ANSWER_CALL_FROM_NOTIFICATION" && msg.payload?.callId) {
        const p = msg.payload
        stopLoudPhoneRingtone()
        stopTitleCallFlash()
        setIncomingCall(null)
        onAcceptIncomingCall(
          p.callId,
          p.callerName || "ConnectLn Caller",
          p.callMode === "audio" ? "audio" : "video",
          p.callerPhone
        )
      } else if (msg.type === "CONNECTLN_DECLINE_CALL_FROM_NOTIFICATION" && msg.payload?.callId) {
        declinedIdsRef.current.add(msg.payload.callId)
        stopLoudPhoneRingtone()
        stopTitleCallFlash()
        setIncomingCall(null)
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

  // Auto-hydrate verified phone & sync push subscription for this device
  useEffect(() => {
    if (typeof window === "undefined") return
    const ua = navigator.userAgent || ""
    const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(ua)
    const isIos = /iPhone|iPad|iPod/i.test(ua)
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      Boolean((navigator as any).standalone)
    setIsIosBrowserTab(isIos && !isStandalone)

    ;(async () => {
      try {
        const qs = new URLSearchParams()
        if (viewerEmail) qs.set("viewerEmail", viewerEmail)
        if (viewerName) qs.set("viewerName", viewerName)
        const res = await fetch(`/api/connectin/calls/whatsapp?${qs.toString()}`, {
          cache: "no-store",
        })
        if (!res.ok) return
        const data = await res.json()
        if (data?.vapidPublicKey) setVapidKey(data.vapidPublicKey)

        const verified =
          data?.verifiedAccountPhone || data?.myRegistration?.phone || getMyLinkedConnectLnPhone()
        if (verified && looksLikeClientPhone(verified)) {
          const norm = normalizeClientPhone(verified)
          setMyPhone(norm)
          try {
            window.localStorage.setItem(MY_LINKED_PHONE_STORAGE_KEY, norm)
          } catch {}

          if ("serviceWorker" in navigator) {
            const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => null)
            let existingSub = await reg?.pushManager?.getSubscription?.().catch(() => null)
            if (
              !existingSub &&
              data?.vapidPublicKey &&
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              const autoSub = await registerConnectLnPushSubscription(data.vapidPublicKey).catch(
                () => null
              )
              if (autoSub) {
                existingSub = await reg?.pushManager?.getSubscription?.().catch(() => null)
              }
            }
            if (existingSub) {
              fetch("/api/connectin/calls/whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "register",
                  phone: norm,
                  name: viewerName || "ConnectLn Member",
                  email: viewerEmail,
                  pushSubscription: existingSub.toJSON(),
                  deviceLabel: isMobile ? "Mobile Phone" : "Desktop Browser",
                }),
              }).catch(() => {})
              setShowMobileRingPrompt(false)
            } else if (isMobile && sessionStorage.getItem("connectln_hide_ring_prompt") !== "1") {
              setShowMobileRingPrompt(true)
            }
          } else if (isIos && !isStandalone && sessionStorage.getItem("connectln_hide_ring_prompt") !== "1") {
            setShowMobileRingPrompt(true)
          }
        }
      } catch {}
    })()
  }, [viewerEmail, viewerName])

  const handleEnableMobileRingingNow = async () => {
    if (!myPhone) return
    setIsEnablingPush(true)
    unlockBackgroundRingingSession()
    try {
      const sub = vapidKey ? await registerConnectLnPushSubscription(vapidKey) : null
      if (sub) {
        await fetch("/api/connectin/calls/whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register",
            phone: myPhone,
            name: viewerName || "ConnectLn Member",
            email: viewerEmail,
            pushSubscription: sub,
            deviceLabel: /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent || "")
              ? "Mobile Phone"
              : "Desktop Browser",
          }),
        })
        setShowMobileRingPrompt(false)
      }
    } catch {}
    setIsEnablingPush(false)
  }

  // 2. Unthrottled Web Worker Polling (runs every 1.6s EVEN WHEN MINIMIZED OR IN BACKGROUND TAB!)
  useEffect(() => {
    const cleanName = (viewerName || "").trim()
    const cleanEmail = (viewerEmail || "").trim()
    const cleanPhone = (myPhone || "").trim()
    if ((!cleanName && !cleanEmail && !cleanPhone) || isAlreadyInCallStudio || hasOpenModal) {
      setIncomingCall(null)
      stopLoudPhoneRingtone()
      stopTitleCallFlash()
      return
    }

    let cancelled = false
    let inFlight = false

    const checkIncoming = async () => {
      if (cancelled || inFlight || isLocalTabHostingOpenCall()) return
      inFlight = true
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

        if (!active) {
          stopLoudPhoneRingtone()
          stopTitleCallFlash()
        }
      } catch {
        // ignore transient network errors
      } finally {
        inFlight = false
      }
    }

    checkIncoming()
    const stopWorker = createUnthrottledCallPollWorker(1600, checkIncoming)
    const onVisOrFocus = () => {
      void checkIncoming()
    }
    document.addEventListener("visibilitychange", onVisOrFocus)
    window.addEventListener("focus", onVisOrFocus)

    return () => {
      cancelled = true
      stopWorker()
      document.removeEventListener("visibilitychange", onVisOrFocus)
      window.removeEventListener("focus", onVisOrFocus)
    }
  }, [viewerName, viewerEmail, myPhone, isAlreadyInCallStudio, hasOpenModal])

  // 3. Loud Background-Safe Ringtone + Taskbar Flash + OS Notification Popup when call arrives (Minimized OR Visible!)
  useEffect(() => {
    if (!incomingCall || hasOpenModal) {
      stopLoudPhoneRingtone()
      stopTitleCallFlash()
      return
    }

    const cName =
      incomingCall.participants?.[0]?.display_name ||
      incomingCall.initiator_name ||
      "ConnectLn Caller"
    const cPhone = incomingCall.initiator_phone
      ? prettyClientPhone(incomingCall.initiator_phone)
      : undefined
    const mode: "audio" | "video" = incomingCall.call_type === "audio" ? "audio" : "video"

    startLoudPhoneRingtone()
    startTitleCallFlash(cName)

    // Pop up OS-level notification whenever minimized, unfocused, or in another tab so user can click to pick up immediately!
    if (typeof document !== "undefined" && (document.hidden || !document.hasFocus())) {
      void triggerSystemIncomingCallAlert({
        callId: incomingCall.id,
        callerName: cName,
        callerPhone: cPhone,
        callMode: mode,
        onAnswerClick: () => {
          const targetId = incomingCall.id
          stopLoudPhoneRingtone()
          stopTitleCallFlash()
          setIncomingCall(null)
          onAcceptIncomingCall(targetId, cName, mode, incomingCall.initiator_phone)
        },
      })
    }

    return () => {
      stopLoudPhoneRingtone()
      stopTitleCallFlash()
    }
  }, [incomingCall?.id, hasOpenModal, onAcceptIncomingCall])

  if (hasOpenModal) return null

  if (!incomingCall) {
    if (!showMobileRingPrompt || !myPhone) return null
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[90] w-[94vw] max-w-md rounded-2xl bg-[#181411] border border-emerald-400/60 shadow-2xl px-3.5 py-2.5 text-[#FBF8F3] flex items-center justify-between gap-2.5">
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-emerald-300 truncate">
            📱 Enable Background Ringing on This Phone
          </p>
          <p className="text-[11px] text-zinc-300 leading-snug">
            {isIosBrowserTab
              ? "iPhone tip: Tap Share (⬆️) → Add to Home Screen so ConnectLn rings even when minimized or locked."
              : `Tap Enable so calls to ${prettyClientPhone(myPhone)} ring even when ConnectLn is minimized.`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!isIosBrowserTab && (
            <button
              type="button"
              disabled={isEnablingPush}
              onClick={handleEnableMobileRingingNow}
              style={{ color: "#FFFFFF" }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>{isEnablingPush ? "..." : "Enable"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem("connectln_hide_ring_prompt", "1")
              setShowMobileRingPrompt(false)
            }}
            className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    )
  }

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
              stopLoudPhoneRingtone()
              stopTitleCallFlash()
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
              stopLoudPhoneRingtone()
              stopTitleCallFlash()
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
