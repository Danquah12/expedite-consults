"use client"

import React, { useEffect, useRef, useState } from "react"
import { Video, Phone, PhoneOff, Bell, X, PictureInPicture2, Lock } from "lucide-react"

function getCallerInitials(name: string): string {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return "CL"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase()
}
import {
  getMyLinkedConnectLnPhone,
  MY_LINKED_PHONE_STORAGE_KEY,
  isConnectLnCallHandled,
  markConnectLnCallHandled,
} from "./ConnectLnWhatsAppCallModal"
import {
  prettyClientPhone,
  looksLikeClientPhone,
  normalizeClientPhone,
} from "./ConnectLnCellPhoneSoftphone"
import {
  reportIncomingCallToNativeOS,
  registerConnectLnPushSubscription,
  registerNativeFcmForCalls,
} from "@/lib/connectin-native-callkit-bridge"
import {
  unlockBackgroundRingingSession,
  isBackgroundAudioUnlocked,
  onBackgroundUnlockChange,
  startLoudPhoneRingtone,
  stopLoudPhoneRingtone,
  startTitleCallFlash,
  stopTitleCallFlash,
  triggerSystemIncomingCallAlert,
  dismissFloatingCallPopups,
  closeStandbyPipForLocalCall,
  isDocumentPipSupported,
  isAlwaysOnTopReceiverOpen,
  openAlwaysOnTopCallStandbyPiP,
  setForegroundCallPollCallback,
  createUnthrottledCallPollWorker,
  setCallMediaSilenceActive,
  isIncomingRingtoneAudiblyPlaying,
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
  viewerPhone,
  isAlreadyInCallStudio,
  onAcceptIncomingCall,
}: {
  viewerName?: string
  viewerEmail?: string
  viewerPhone?: string
  isAlreadyInCallStudio?: boolean
  onAcceptIncomingCall: (
    callId: string,
    callerName: string,
    mode: "audio" | "video",
    callerPhone?: string
  ) => void
}) {
  const [incomingCall, setIncomingCall] = useState<IncomingCallSummary | null>(null)
  const [myPhone, setMyPhone] = useState<string>(() =>
    viewerPhone && looksLikeClientPhone(viewerPhone)
      ? normalizeClientPhone(viewerPhone)
      : getMyLinkedConnectLnPhone()
  )
  const [hasOpenModal, setHasOpenModal] = useState<boolean>(false)
  const [hideSetupBanner, setHideSetupBanner] = useState<boolean>(false)
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false)
  const [notifGranted, setNotifGranted] = useState<boolean>(false)
  const [supportsDocPip, setSupportsDocPip] = useState<boolean>(false)
  const [pipReceiverActive, setPipReceiverActive] = useState<boolean>(false)
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false)
  const [isIosBrowserTab, setIsIosBrowserTab] = useState<boolean>(false)
  const [vapidKey, setVapidKey] = useState<string>("")
  const [isEnablingPush, setIsEnablingPush] = useState<boolean>(false)

  const declinedIdsRef = useRef<Set<string>>(new Set())
  const seenInServerPollRef = useRef<Set<string>>(new Set())
  const realtimeRingRef = useRef<{ call: IncomingCallSummary; untilMs: number } | null>(null)
  const vapidKeyRef = useRef<string>("")
  const myPhoneRef = useRef<string>("")
  const viewerNameRef = useRef<string>(viewerName || "")
  const viewerEmailRef = useRef<string>(viewerEmail || "")
  const autoPushAttemptedRef = useRef<boolean>(false)
  const onAcceptIncomingCallRef = useRef(onAcceptIncomingCall)
  const lastAcceptedCallRef = useRef<{ id: string; ts: number } | null>(null)

  useEffect(() => {
    onAcceptIncomingCallRef.current = onAcceptIncomingCall
  }, [onAcceptIncomingCall])

  const acceptIncomingCallNow = (
    targetCallId: string,
    callerNameLabel: string,
    mode: "audio" | "video",
    callerPhoneVal?: string
  ) => {
    const cleanId = String(targetCallId || "").trim()
    if (!cleanId) return
    const now = Date.now()
    if (lastAcceptedCallRef.current?.id === cleanId && now - lastAcceptedCallRef.current.ts < 10000) {
      return
    }
    lastAcceptedCallRef.current = { id: cleanId, ts: now }
    if (realtimeRingRef.current?.call.id === cleanId) {
      realtimeRingRef.current = null
    }
    markConnectLnCallHandled(cleanId)
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const ackMsg = { type: "CONNECTLN_ANSWER_ACK", callId: cleanId }
      try {
        navigator.serviceWorker.controller?.postMessage(ackMsg)
      } catch {}
      navigator.serviceWorker.ready
        .then((reg) => {
          reg?.active?.postMessage(ackMsg)
        })
        .catch(() => {})
    }
    setCallMediaSilenceActive(true, "whatsapp-call-modal")
    setCallMediaSilenceActive(false, "incoming-call-banner")
    stopLoudPhoneRingtone()
    stopTitleCallFlash()
    closeStandbyPipForLocalCall()
    setIncomingCall(null)
    onAcceptIncomingCallRef.current(cleanId, callerNameLabel, mode, callerPhoneVal)
  }

  const declineAndEndIncomingCall = (targetCallId: string, notifyServer = true) => {
    const cleanId = String(targetCallId || "").trim()
    if (!cleanId) return
    declinedIdsRef.current.add(cleanId)
    if (realtimeRingRef.current?.call.id === cleanId) {
      realtimeRingRef.current = null
    }
    markConnectLnCallHandled(cleanId)
    setCallMediaSilenceActive(false, "incoming-call-banner")
    stopLoudPhoneRingtone()
    stopTitleCallFlash()
    dismissFloatingCallPopups()
    setIncomingCall((prev) => (prev && prev.id === cleanId ? null : prev))
    if (notifyServer) {
      let localPeerId = "declined_recipient"
      try {
        localPeerId = sessionStorage.getItem("vibe_call_participant_id") || "declined_recipient"
      } catch {}
      fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          action: "decline",
          call_id: cleanId,
          user_id: localPeerId,
          participant_phone: myPhoneRef.current || undefined,
          display_name: viewerNameRef.current || undefined,
        }),
      }).catch(() => {})
    }
  }

  // Synchronously triggers ringtone, title flash, Always-On-Top PiP, and OS Notification without waiting
  // for React's deferred commit/useEffect cycle when the browser window is minimized (`document.hidden`).
  const triggerImmediateIncomingCallRinging = (call: IncomingCallSummary) => {
    if (!call?.id || isLocalTabHostingOpenCall()) return
    setCallMediaSilenceActive(true, "incoming-call-banner")

    const cName =
      call.participants?.[0]?.display_name ||
      call.initiator_name ||
      "ConnectLn Caller"
    const cPhone = call.initiator_phone ? prettyClientPhone(call.initiator_phone) : undefined
    const mode: "audio" | "video" = call.call_type === "audio" ? "audio" : "video"

    startLoudPhoneRingtone()
    if (
      isIncomingRingtoneAudiblyPlaying() &&
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      const swMsg = { type: "CONNECTLN_PAGE_AUDIO_RINGING", callId: call.id }
      try {
        navigator.serviceWorker.controller?.postMessage(swMsg)
      } catch {}
      navigator.serviceWorker.ready
        .then((reg) => {
          reg?.active?.postMessage(swMsg)
        })
        .catch(() => {})
    }
    startTitleCallFlash(cName)

    if (
      typeof document !== "undefined" &&
      (document.hidden || !document.hasFocus() || isAlwaysOnTopReceiverOpen())
    ) {
      void triggerSystemIncomingCallAlert({
        callId: call.id,
        callerName: cName,
        callerPhone: cPhone,
        callMode: mode,
        onAnswer: () => {
          acceptIncomingCallNow(call.id, cName, mode, call.initiator_phone)
        },
        onDecline: () => {
          declineAndEndIncomingCall(call.id, true)
        },
      })
    }
  }

  useEffect(() => {
    vapidKeyRef.current = vapidKey
  }, [vapidKey])

  useEffect(() => {
    myPhoneRef.current = myPhone
  }, [myPhone])

  useEffect(() => {
    viewerNameRef.current = viewerName || ""
    viewerEmailRef.current = viewerEmail || ""
  }, [viewerName, viewerEmail])

  useEffect(() => {
    if (viewerPhone && looksLikeClientPhone(viewerPhone)) {
      const norm = normalizeClientPhone(viewerPhone)
      setMyPhone((prev) => prev || norm)
    }
  }, [viewerPhone])

  const syncPushSubscriptionToServer = async () => {
    try {
      let key = vapidKeyRef.current
      let phone = myPhoneRef.current || getMyLinkedConnectLnPhone()

      if (!key || !phone) {
        const qs = new URLSearchParams()
        if (viewerEmailRef.current) qs.set("viewerEmail", viewerEmailRef.current)
        if (viewerNameRef.current) qs.set("viewerName", viewerNameRef.current)
        const cfgRes = await fetch(`/api/connectin/calls/whatsapp?${qs.toString()}`, {
          cache: "no-store",
        })
        if (cfgRes.ok) {
          const cfgData = await cfgRes.json()
          if (cfgData?.vapidPublicKey) {
            key = cfgData.vapidPublicKey
            setVapidKey(key)
          }
          const verified = cfgData?.verifiedAccountPhone || cfgData?.myRegistration?.phone || phone
          if (verified && looksLikeClientPhone(verified)) {
            phone = normalizeClientPhone(verified)
            setMyPhone(phone)
          }
        }
      }

      if (!key || !phone) return
      const sub = await registerConnectLnPushSubscription(key)
      if (!sub) return
      const isMob = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent || "")
      await fetch("/api/connectin/calls/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          phone,
          name: viewerNameRef.current || "ConnectLn Member",
          email: viewerEmailRef.current,
          pushSubscription: sub,
          deviceLabel: isMob ? "Mobile Phone" : "Desktop Browser",
        }),
      })
    } catch {}
  }

  // 1. Unlock Continuous Hardware Audio + Auto-Arm Desktop Always-On-Top Call Receiver + Synchronous Push Registration on First Click!
  useEffect(() => {
    unlockBackgroundRingingSession()
    const ua = navigator.userAgent || ""
    const mob = /iPhone|iPad|iPod|Android|Mobile/i.test(ua)
    setIsMobileDevice(mob)
    setSupportsDocPip(isDocumentPipSupported() && !mob)
    setAudioUnlocked(isBackgroundAudioUnlocked())
    setPipReceiverActive(isAlwaysOnTopReceiverOpen())
    setHideSetupBanner(sessionStorage.getItem("connectln_hide_ring_prompt") === "1")

    if (typeof Notification !== "undefined") {
      setNotifGranted(Notification.permission === "granted")
    }

    const unsubUnlock = onBackgroundUnlockChange(() => {
      setAudioUnlocked(isBackgroundAudioUnlocked())
      setPipReceiverActive(isAlwaysOnTopReceiverOpen())
    })

    const onFirstUserClick = (ev: Event) => {
      const targetEl = ev.target as HTMLElement | null
      if (targetEl?.closest("[data-connectln-call-action]")) return

      // 1) Synchronously unlock 20 Hz hardware audio keep-alive & screen wake lock!
      unlockBackgroundRingingSession()
      setAudioUnlocked(isBackgroundAudioUnlocked())

      // 2) On Desktop Edge/Chrome, auto-open the compact Always-On-Top Call Standby Receiver
      //    so minimizing the browser IMMEDIATELY keeps the Pop-Up Call Screen ready on top of desktop!
      //    (Skip only if user clicked an outgoing call button or manually dismissed the PiP window.)
      const btnText = (targetEl?.closest("button")?.textContent || "").trim()
      const isStartingOutgoingCallClick =
        isLocalTabHostingOpenCall() ||
        (/\b(Start call|Call a number|Call|Video|Answer|Decline)\b/i.test(btnText) &&
          !/Activate|Enable Ringing|Enable Minimized/i.test(btnText))

      if (
        ev.type === "click" &&
        !mob &&
        isDocumentPipSupported() &&
        !isAlwaysOnTopReceiverOpen() &&
        !isStartingOutgoingCallClick &&
        sessionStorage.getItem("connectln_pip_dismissed") !== "1"
      ) {
        openAlwaysOnTopCallStandbyPiP(false)
          .then((opened) => {
            if (opened) setPipReceiverActive(true)
          })
          .catch(() => {})
      }

      // 3) Synchronously request Notification permission (before any `await`!) or sync existing granted subscription!
      if (!autoPushAttemptedRef.current && typeof Notification !== "undefined") {
        if (Notification.permission === "default") {
          autoPushAttemptedRef.current = true
          Notification.requestPermission()
            .then((perm) => {
              setNotifGranted(perm === "granted")
              if (perm === "granted") {
                void syncPushSubscriptionToServer()
              }
            })
            .catch(() => {})
        } else if (Notification.permission === "granted") {
          autoPushAttemptedRef.current = true
          void syncPushSubscriptionToServer()
        }
      }
    }

    window.addEventListener("click", onFirstUserClick, { capture: true })
    window.addEventListener("touchstart", onFirstUserClick, { capture: true, passive: true })
    window.addEventListener("pointerdown", onFirstUserClick, { capture: true, passive: true })
    return () => {
      unsubUnlock()
      window.removeEventListener("click", onFirstUserClick, { capture: true })
      window.removeEventListener("touchstart", onFirstUserClick, { capture: true })
      window.removeEventListener("pointerdown", onFirstUserClick, { capture: true })
    }
  }, [])

  useEffect(() => {
    const syncPhone = () =>
      setMyPhone(
        getMyLinkedConnectLnPhone() ||
          (viewerPhone && looksLikeClientPhone(viewerPhone) ? normalizeClientPhone(viewerPhone) : "")
      )
    const syncModalOpen = () => {
      const openNow = isLocalTabHostingOpenCall()
      setHasOpenModal(openNow)
      if (openNow) {
        setIncomingCall(null)
        stopLoudPhoneRingtone()
        stopTitleCallFlash()
        // Close any standby PiP window cleanly while user is in an active call on this tab!
        closeStandbyPipForLocalCall()
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
        if (!declinedIdsRef.current.has(p.callId) && !isConnectLnCallHandled(p.callId)) {
          const callObj: IncomingCallSummary = {
            id: p.callId,
            call_type: p.callMode === "audio" ? "audio" : "video",
            initiator_name: p.callerName,
            initiator_phone: p.callerPhone,
          }
          realtimeRingRef.current = { call: callObj, untilMs: Date.now() + 8000 }
          triggerImmediateIncomingCallRinging(callObj)
          setIncomingCall(callObj)
          void reportIncomingCallToNativeOS({
            callId: p.callId,
            callerName: p.callerName || "ConnectLn Caller",
            callerPhone: p.callerPhone,
            hasVideo: p.callMode !== "audio",
          })
        }
      } else if (msg.type === "CONNECTLN_ANSWER_CALL_FROM_NOTIFICATION" && msg.payload?.callId) {
        const p = msg.payload
        acceptIncomingCallNow(
          p.callId,
          p.callerName || "ConnectLn Caller",
          p.callMode === "audio" ? "audio" : "video",
          p.callerPhone
        )
      } else if (msg.type === "CONNECTLN_DECLINE_CALL_FROM_NOTIFICATION" && msg.payload?.callId) {
        declineAndEndIncomingCall(msg.payload.callId, false)
      }
    }

    const requestPendingSwAnswerCheck = () => {
      if (!("serviceWorker" in navigator)) return
      const checkMsg = { type: "CONNECTLN_CHECK_PENDING_ANSWER" }
      try {
        navigator.serviceWorker.controller?.postMessage(checkMsg)
      } catch {}
      navigator.serviceWorker.ready
        .then((reg) => {
          reg?.active?.postMessage(checkMsg)
        })
        .catch(() => {})
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {})
      navigator.serviceWorker.addEventListener("message", onSwMessage)
      requestPendingSwAnswerCheck()
    }

    return () => {
      window.removeEventListener("connectln_phone_linked", syncPhone)
      window.removeEventListener("storage", syncPhone)
      window.removeEventListener("connectln_call_modal_change", syncModalOpen)
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onSwMessage)
      }
    }
  }, [])

  // Hydrate verified phone & sync existing push subscription on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const ua = navigator.userAgent || ""
    const isMob = /iPhone|iPad|iPod|Android|Mobile/i.test(ua)
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
        const storedLocalPhone = myPhone || getMyLinkedConnectLnPhone()
        if (storedLocalPhone) qs.set("viewerPhone", storedLocalPhone)
        const res = await fetch(`/api/connectin/calls/whatsapp?${qs.toString()}`, {
          cache: "no-store",
        })
        if (!res.ok) return
        const data = await res.json()
        if (data?.vapidPublicKey) setVapidKey(data.vapidPublicKey)

        const verified =
          storedLocalPhone || data?.verifiedAccountPhone || data?.myRegistration?.phone || getMyLinkedConnectLnPhone()
        if (verified && looksLikeClientPhone(verified)) {
          const norm = normalizeClientPhone(verified)
          if (norm !== myPhone) setMyPhone(norm)
          try {
            window.localStorage.setItem(MY_LINKED_PHONE_STORAGE_KEY, norm)
          } catch {}

          const permGranted =
            typeof Notification !== "undefined" && Notification.permission === "granted"
          setNotifGranted(permGranted)

          // Native ConnectLn Android app: auto-register FCM (no Activate step, rings full-screen when closed)
          void registerNativeFcmForCalls({ phone: norm, name: viewerName, email: viewerEmail })

          if ("serviceWorker" in navigator && permGranted && data?.vapidPublicKey) {
            const sub = await registerConnectLnPushSubscription(data.vapidPublicKey).catch(
              () => null
            )
            if (sub) {
              fetch("/api/connectin/calls/whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "register",
                  phone: norm,
                  name: viewerName || "ConnectLn Member",
                  email: viewerEmail,
                  pushSubscription: sub,
                  deviceLabel: isMob ? "Mobile Phone" : "Desktop Browser",
                }),
              }).catch(() => {})
            }
          }
        }
      } catch {}
    })()
  }, [viewerEmail, viewerName, myPhone])

  const handleManualActivateClick = async () => {
    setIsEnablingPush(true)
    unlockBackgroundRingingSession()
    setAudioUnlocked(true)

    const permPromise =
      typeof Notification !== "undefined" && Notification.permission === "default"
        ? Notification.requestPermission().catch(() => "default" as NotificationPermission)
        : Promise.resolve(
            typeof Notification !== "undefined"
              ? Notification.permission
              : ("default" as NotificationPermission)
          )

    if (supportsDocPip) {
      const opened = await openAlwaysOnTopCallStandbyPiP(true)
      setPipReceiverActive(opened)
    }

    const perm = await permPromise
    setNotifGranted(perm === "granted")
    if (perm === "granted") {
      await syncPushSubscriptionToServer()
    }
    setIsEnablingPush(false)
  }

  // 2. Unthrottled Web Worker Polling (runs every 1.2s EVEN WHEN MINIMIZED OR IN BACKGROUND!)
  useEffect(() => {
    const cleanName = (viewerName || "").trim()
    const cleanEmail = (viewerEmail || "").trim()
    const cleanPhone = (myPhone || "").trim()

    const postSwWatchState = (activeFlag: boolean) => {
      try {
        if (!("serviceWorker" in navigator)) return
        const localPeerId = sessionStorage.getItem("vibe_call_participant_id") || ""
        const qs = new URLSearchParams({
          incoming_for: cleanName,
          incoming_email: cleanEmail,
          incoming_phone: cleanPhone,
          viewer_peer_id: localPeerId,
        })
        const pollUrl = activeFlag ? `/api/v1/calls?${qs.toString()}` : ""
        const payload = { type: "CONNECTLN_SW_WATCH_CALLS", pollUrl, active: activeFlag }
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage(payload)
        } else {
          navigator.serviceWorker.ready
            .then((reg) => {
              reg?.active?.postMessage(payload)
            })
            .catch(() => {})
        }
      } catch {}
    }

    if ((!cleanName && !cleanEmail && !cleanPhone) || isAlreadyInCallStudio || hasOpenModal) {
      postSwWatchState(false)
      setIncomingCall(null)
      stopLoudPhoneRingtone()
      stopTitleCallFlash()
      if (isAlreadyInCallStudio || hasOpenModal) {
        closeStandbyPipForLocalCall()
      } else {
        dismissFloatingCallPopups()
      }
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
        const endedIds: string[] = Array.isArray(data?.ended_call_ids)
          ? data.ended_call_ids
          : []
        for (const eid of endedIds) {
          if (eid) {
            declinedIdsRef.current.add(eid)
            markConnectLnCallHandled(eid)
            if (realtimeRingRef.current?.call.id === eid) {
              realtimeRingRef.current = null
            }
          }
        }
        const list: IncomingCallSummary[] = Array.isArray(data?.incoming_calls)
          ? data.incoming_calls
          : []
        for (const item of list) {
          if (item?.id) seenInServerPollRef.current.add(item.id)
        }
        let active =
          list.find(
            (c) =>
              c?.id && !declinedIdsRef.current.has(c.id) && !isConnectLnCallHandled(c.id)
          ) || null
        // A pushed/real-time pre-ring covers the startup window (<8s) before server poll sees the call.
        // Clear when ended, declined, handled, or startup window expires.
        const rt = realtimeRingRef.current
        if (!active && rt) {
          const rtId = rt.call.id
          if (
            declinedIdsRef.current.has(rtId) ||
            isConnectLnCallHandled(rtId) ||
            endedIds.includes(rtId) ||
            rt.untilMs <= Date.now()
          ) {
            realtimeRingRef.current = null
          } else {
            active = rt.call
          }
        }
        if (active) {
          triggerImmediateIncomingCallRinging(active)
        } else {
          setCallMediaSilenceActive(false, "incoming-call-banner")
          stopLoudPhoneRingtone()
          stopTitleCallFlash()
          dismissFloatingCallPopups()
        }
        setIncomingCall((prev) => {
          if (!active) return null
          if (
            prev &&
            prev.id === active.id &&
            prev.call_type === active.call_type &&
            (prev.invited_roster?.length || 0) === (active.invited_roster?.length || 0) &&
            (prev.participants?.[0]?.display_name || "") ===
              (active.participants?.[0]?.display_name || "")
          ) {
            return prev
          }
          return active
        })
      } catch {
        // ignore transient network errors
      } finally {
        inFlight = false
      }
    }

    // Real-time push (Pusher): ring instantly / stop instantly. Polling stays as a safety net.
    let rtClient: any = null
    if (cleanPhone) {
      ;(async () => {
        try {
          const cfg = await fetch("/api/connectin/realtime", { cache: "no-store" }).then((r) => r.json())
          if (cancelled || !cfg?.enabled) return
          const PusherJs = (await import("pusher-js")).default
          rtClient = new PusherJs(cfg.key, {
            cluster: cfg.cluster,
            channelAuthorization: { endpoint: "/api/connectin/realtime", transport: "ajax" },
          })
          const ch = rtClient.subscribe(`private-ring-${cleanPhone.replace(/[^\d]/g, "")}`)
          ch.bind("incoming-call", (d: any) => {
            if (
              !d?.callId ||
              declinedIdsRef.current.has(d.callId) ||
              isConnectLnCallHandled(d.callId) ||
              isLocalTabHostingOpenCall()
            ) {
              return
            }
            const call: IncomingCallSummary = {
              id: String(d.callId),
              call_type: d.callMode === "audio" ? "audio" : "video",
              initiator_name: d.callerName || "ConnectLn Caller",
              initiator_phone: d.callerPhone || "",
            }
            realtimeRingRef.current = { call, untilMs: Date.now() + 8000 }
            triggerImmediateIncomingCallRinging(call)
            setIncomingCall((prev) => prev || call)
            void checkIncoming()
          })
          ch.bind("call-ended", (d: any) => {
            if (d?.callId) {
              declinedIdsRef.current.add(String(d.callId))
              markConnectLnCallHandled(String(d.callId))
            }
            if (realtimeRingRef.current?.call.id === d?.callId) realtimeRingRef.current = null
            setIncomingCall((prev) => (prev && prev.id === d?.callId ? null : prev))
            setCallMediaSilenceActive(false, "incoming-call-banner")
            stopLoudPhoneRingtone()
            stopTitleCallFlash()
            dismissFloatingCallPopups()
            void checkIncoming()
          })
        } catch {}
      })()
    }

    checkIncoming()
    postSwWatchState(true)
    setForegroundCallPollCallback(checkIncoming)
    const stopWorker = createUnthrottledCallPollWorker(1200, checkIncoming)
    const onVisOrFocus = () => {
      setPipReceiverActive(isAlwaysOnTopReceiverOpen())
      if (typeof document !== "undefined" && document.hidden) {
        postSwWatchState(true)
      } else if ("serviceWorker" in navigator) {
        const checkMsg = { type: "CONNECTLN_CHECK_PENDING_ANSWER" }
        try {
          navigator.serviceWorker.controller?.postMessage(checkMsg)
        } catch {}
        navigator.serviceWorker.ready
          .then((reg) => {
            reg?.active?.postMessage(checkMsg)
          })
          .catch(() => {})
      }
      void checkIncoming()
    }
    document.addEventListener("visibilitychange", onVisOrFocus)
    window.addEventListener("focus", onVisOrFocus)

    return () => {
      cancelled = true
      try {
        rtClient?.disconnect()
      } catch {}
      postSwWatchState(false)
      setForegroundCallPollCallback(null)
      stopWorker()
      document.removeEventListener("visibilitychange", onVisOrFocus)
      window.removeEventListener("focus", onVisOrFocus)
    }
  }, [viewerName, viewerEmail, myPhone, isAlreadyInCallStudio, hasOpenModal])

  // 3. Hardware-Thread Ringtone + Always-On-Top Pop-Up Call Screen + OS Notification fallback on React commit!
  useEffect(() => {
    if (!incomingCall || hasOpenModal) {
      setCallMediaSilenceActive(false, "incoming-call-banner")
      stopLoudPhoneRingtone()
      stopTitleCallFlash()
      dismissFloatingCallPopups()
      return
    }

    triggerImmediateIncomingCallRinging(incomingCall)
  }, [incomingCall?.id, hasOpenModal])

  useEffect(() => {
    return () => {
      stopLoudPhoneRingtone()
      stopTitleCallFlash()
    }
  }, [])

  useEffect(() => {
    if (!incomingCall || hasOpenModal || isAlreadyInCallStudio) return
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        declineAndEndIncomingCall(incomingCall.id, true)
      } else if (e.key === "Enter") {
        e.preventDefault()
        const cName =
          incomingCall.participants?.[0]?.display_name ||
          incomingCall.initiator_name ||
          "ConnectLn Caller"
        acceptIncomingCallNow(
          incomingCall.id,
          cName,
          incomingCall.call_type === "audio" ? "audio" : "video",
          incomingCall.initiator_phone
        )
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [incomingCall, hasOpenModal, isAlreadyInCallStudio])

  if (hasOpenModal || isAlreadyInCallStudio) return null

  if (!incomingCall) {
    const isFullyArmed = audioUnlocked && (notifGranted || isIosBrowserTab)

    if (hideSetupBanner || isFullyArmed || (!myPhone && !viewerName && !viewerEmail)) {
      return null
    }

    return (
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[88] w-[94vw] max-w-xl rounded-2xl bg-[#071E1A] border-2 border-emerald-400 shadow-2xl px-4 py-2.5 text-[#FBF8F3] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
            <PictureInPicture2 className="h-4 w-4 shrink-0" />
            <span>Enable Pop-Up Call Screen &amp; Ringing When Minimized</span>
          </p>
          <p className="text-[11px] text-zinc-200 leading-snug mt-0.5">
            {isIosBrowserTab
              ? "iPhone: Tap Activate to unlock minimized ringing (or Share ⬆️ → Add to Home Screen for lock-screen calls)."
              : supportsDocPip
              ? "Click Activate once before minimizing your browser so incoming calls ring out loud and pop up on top of your screen!"
              : `Tap Activate once before minimizing so calls to ${prettyClientPhone(myPhone)} ring out loud.`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={isEnablingPush}
            onClick={handleManualActivateClick}
            style={{ color: "#FFFFFF" }}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Bell className="h-3.5 w-3.5" />
            <span>{isEnablingPush ? "..." : "Activate"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem("connectln_hide_ring_prompt", "1")
              setHideSetupBanner(true)
            }}
            className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            title="Dismiss"
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
  const callerInitials = getCallerInitials(callerName)
  const isVideo = incomingCall.call_type !== "audio"
  const activeInvitesCount = (incomingCall.invited_roster || []).filter(
    (m) => m.status !== "removed"
  ).length

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Incoming ${isVideo ? "Video" : "Voice"} Call from ${callerName}`}
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/80 backdrop-blur-xl sm:p-4"
    >
      <div
        className="w-screen h-[100dvh] rounded-none sm:w-full sm:max-w-[420px] sm:h-auto sm:min-h-[600px] sm:rounded-[36px] overflow-hidden flex flex-col justify-between shadow-[0_28px_90px_rgba(0,0,0,0.85)] border-0 sm:border sm:border-white/15 text-white relative"
        style={{
          background:
            "radial-gradient(circle at 50% 36%, rgba(37, 211, 102, 0.22) 0%, rgba(14, 44, 39, 0.92) 38%, #0B141A 78%)",
        }}
      >
        {/* Top WhatsApp Header Section */}
        <div className="pt-12 sm:pt-8 px-6 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-white/65">
            <Lock className="h-3.5 w-3.5" />
            <span>End-to-end encrypted</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#25D366]">
            {isVideo ? "ConnectLn Video Call" : "ConnectLn Voice Call"}
            {activeInvitesCount >= 2 ? ` · Group (${activeInvitesCount + 1})` : ""}
          </p>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight break-words pt-1">
            {callerName}
          </p>
          <p className="text-base font-medium text-[#A3B8B2] truncate">
            {callerPhone || "Ringing…"}
          </p>
        </div>

        {/* Center Hero Monogram Crest with Concentric Ripple Rings */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="relative flex items-center justify-center">
            <span className="absolute -inset-6 rounded-full bg-[#25D366]/25 animate-ping" />
            <span className="absolute -inset-3 rounded-full border-2 border-[#25D366]/35" />
            <div className="relative h-[136px] w-[136px] rounded-full bg-gradient-to-br from-[#128C7E] to-[#075E54] border-[3px] border-[#25D366]/80 shadow-[0_0_50px_rgba(37,211,102,0.35)] flex items-center justify-center">
              <span className="text-5xl font-bold text-white select-none">
                {callerInitials}
              </span>
              <span className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-[#25D366] border-[3px] border-[#0B141A] flex items-center justify-center shadow-lg">
                {isVideo ? (
                  <Video className="h-5 w-5 text-white" />
                ) : (
                  <Phone className="h-5 w-5 text-white" />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Frosted WhatsApp Action Dock */}
        <div className="px-8 pt-6 pb-12 sm:pb-9 bg-white/[0.05] backdrop-blur-md border-t border-white/10">
          <p className="text-center text-xs font-medium text-white/70 mb-5">
            Tap Accept to answer
          </p>
          <div className="flex items-center justify-around gap-8 max-w-[320px] mx-auto">
            <button
              type="button"
              data-connectln-call-action="decline"
              onClick={(e) => {
                e.stopPropagation()
                declineAndEndIncomingCall(incomingCall.id, true)
              }}
              style={{ color: "#FFFFFF" }}
              className="group flex flex-col items-center cursor-pointer touch-manipulation focus:outline-none"
              title="Decline Call"
            >
              <span className="h-[76px] w-[76px] rounded-full bg-[#FF3B30] hover:bg-[#FF5147] group-active:scale-95 shadow-[0_12px_32px_rgba(255,59,48,0.5)] flex items-center justify-center transition-all">
                <PhoneOff className="h-8 w-8 text-white" />
              </span>
              <span className="text-base font-bold text-white mt-2.5">Decline</span>
            </button>

            <button
              type="button"
              data-connectln-call-action="answer"
              onClick={(e) => {
                e.stopPropagation()
                acceptIncomingCallNow(
                  incomingCall.id,
                  callerName,
                  isVideo ? "video" : "audio",
                  incomingCall.initiator_phone
                )
              }}
              style={{ color: "#FFFFFF" }}
              className="group flex flex-col items-center cursor-pointer touch-manipulation focus:outline-none"
              title={isVideo ? "Accept Video Call" : "Accept Call"}
            >
              <span className="relative h-[82px] w-[82px] rounded-full bg-[#25D366] hover:bg-[#2EE070] group-active:scale-95 shadow-[0_0_42px_rgba(37,211,102,0.8)] flex items-center justify-center transition-all">
                <span className="absolute -inset-2 rounded-full border-2 border-[#25D366]/60 animate-ping" />
                {isVideo ? (
                  <Video className="relative h-9 w-9 text-white" />
                ) : (
                  <Phone className="relative h-9 w-9 text-white" />
                )}
              </span>
              <span className="text-base font-extrabold text-white mt-2.5">Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
