"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  RefreshCw,
  Lock,
  Smartphone,
  Bell,
  Share2,
  CheckCircle2,
  Download,
  Copy,
  UserPlus,
  Users,
  Search,
  X,
} from "lucide-react"
import {
  normalizeClientPhone,
  looksLikeClientPhone,
  prettyClientPhone,
} from "./ConnectLnCellPhoneSoftphone"
import { registerConnectLnPushSubscription } from "@/lib/connectin-native-callkit-bridge"
import {
  startLiveVoiceChunkCapture,
  GaplessRemoteVoicePlayer,
  EncodedVoiceChunk,
} from "@/lib/vibe-voice-codec"

export const MY_LINKED_PHONE_STORAGE_KEY = "connectln_my_whatsapp_phone_v1"

export const COUNTRY_DIAL_CODES = [
  { code: "+1", label: "🇺🇸/🇨🇦 +1 (US/CA)" },
  { code: "+233", label: "🇬🇭 +233 (Ghana)" },
  { code: "+44", label: "🇬🇧 +44 (UK)" },
  { code: "+234", label: "🇳🇬 +234 (Nigeria)" },
  { code: "+27", label: "🇿🇦 +27 (S. Africa)" },
  { code: "+254", label: "🇰🇪 +254 (Kenya)" },
  { code: "+91", label: "🇮🇳 +91 (India)" },
  { code: "+49", label: "🇩🇪 +49 (Germany)" },
  { code: "+33", label: "🇫🇷 +33 (France)" },
  { code: "+971", label: "🇦🇪 +971 (UAE)" },
  { code: "+61", label: "🇦🇺 +61 (Australia)" },
  { code: "+55", label: "🇧🇷 +55 (Brazil)" },
]

export function getMyLinkedConnectLnPhone(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(MY_LINKED_PHONE_STORAGE_KEY) || ""
  } catch {
    return ""
  }
}

export function buildInternationalPhone(countryCode: string, localDigitsRaw: string): string {
  const trimmed = String(localDigitsRaw || "").trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("+")) return normalizeClientPhone(trimmed)
  const digits = trimmed.replace(/[^\d]/g, "").replace(/^0+/, "")
  if (!digits) return ""
  const ccDigits = countryCode.replace(/[^\d]/g, "") || "1"
  if (ccDigits === "1" && digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }
  return `+${ccDigits}${digits}`
}

/**
 * Top card inside `Messaging -> Studio (Calls)` allowing any user in any country
 * to link their mobile number & enable background Web Push incoming call ringing (just like WhatsApp!).
 */
export function ConnectLnMyPhoneNumberCard({
  userName,
  userEmail,
  userAvatar,
  userHeadline,
}: {
  userName: string
  userEmail?: string
  userAvatar?: string
  userHeadline?: string
}) {
  const [countryCode, setCountryCode] = useState<string>("+1")
  const [localNum, setLocalNum] = useState<string>("")
  const [linkedPhone, setLinkedPhone] = useState<string>("")
  const [pushEnabled, setPushEnabled] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [statusMsg, setStatusMsg] = useState<string>("")
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null)
  const [showEdit, setShowEdit] = useState<boolean>(false)

  useEffect(() => {
    const saved = getMyLinkedConnectLnPhone()
    if (saved) {
      setLinkedPhone(saved)
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredInstallPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall)

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => reg.pushManager?.getSubscription?.())
        .then((sub) => {
          if (sub) setPushEnabled(true)
        })
        .catch(() => {})
    }

    const qs = new URLSearchParams()
    if (saved) qs.set("viewerPhone", saved)
    else if (userEmail) qs.set("email", userEmail)
    else if (userName) qs.set("name", userName)

    fetch(`/api/connectin/calls/whatsapp?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const foundPhone =
          data?.myRegistration?.phone || data?.lookup?.member?.phone || ""
        if (foundPhone && !saved) {
          setLinkedPhone(foundPhone)
          try {
            window.localStorage.setItem(MY_LINKED_PHONE_STORAGE_KEY, foundPhone)
          } catch {}
        }
        if (data?.myRegistration?.pushDevicesCount > 0 || data?.lookup?.member?.hasPushEnabled) {
          setPushEnabled(true)
        }
      })
      .catch(() => {})

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
    }
  }, [userEmail, userName])

  const handleLinkNumberAndEnablePush = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullE164 = localNum.trim()
      ? buildInternationalPhone(countryCode, localNum)
      : linkedPhone
    if (!looksLikeClientPhone(fullE164)) {
      setStatusMsg("Enter your mobile number (e.g. 240-260-7898 or 20-555-0412).")
      return
    }

    setIsSaving(true)
    setStatusMsg("Linking number & activating incoming call ringing...")
    try {
      const cfgRes = await fetch("/api/connectin/calls/whatsapp", { cache: "no-store" })
      const cfgData = await cfgRes.json()
      const vapidPublicKey = cfgData?.vapidPublicKey || ""

      const pushSub = vapidPublicKey
        ? await registerConnectLnPushSubscription(vapidPublicKey)
        : null

      const saveRes = await fetch("/api/connectin/calls/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          phone: fullE164,
          name: userName,
          email: userEmail,
          avatar: userAvatar,
          headline: userHeadline,
          pushSubscription: pushSub,
          deviceLabel:
            typeof navigator !== "undefined" && /iPhone|Android|Mobile/i.test(navigator.userAgent)
              ? "Mobile Phone"
              : "Desktop Browser",
        }),
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok || !saveData?.ok) {
        throw new Error(saveData?.error || "Could not link number.")
      }

      const confirmed = saveData.member.phone
      setLinkedPhone(confirmed)
      setPushEnabled(Boolean(pushSub) || saveData.member.pushDevicesCount > 0)
      setLocalNum("")
      setShowEdit(false)
      try {
        window.localStorage.setItem(MY_LINKED_PHONE_STORAGE_KEY, confirmed)
        window.dispatchEvent(new Event("connectln_phone_linked"))
      } catch {}
      setStatusMsg(
        pushSub
          ? `✓ Linked ${prettyClientPhone(confirmed)} — Phone push ringing is ACTIVE!`
          : `✓ Linked ${prettyClientPhone(confirmed)} for ConnectLn direct voice & video calls!`
      )
    } catch (err: any) {
      setStatusMsg(err?.message || "Failed to link mobile number.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-lg mb-5 rounded-2xl bg-[#FBF8F3] border border-[#D5BBA3] px-4 py-3.5 shadow-2xs text-left">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-8 w-8 rounded-xl bg-[#7C4225] text-white flex items-center justify-center shrink-0">
            <Smartphone className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-[#1C1917] truncate">
              {linkedPhone
                ? `My ConnectLn Number: ${prettyClientPhone(linkedPhone)}`
                : "Link Your Phone Number (WhatsApp-Style Direct Calling)"}
            </p>
            <p className="text-[11px] text-[#57534E] truncate">
              {linkedPhone
                ? pushEnabled
                  ? "🟢 Incoming voice & video call push ringing active across countries"
                  : "Linked! Click 'Enable Ringing' so your phone rings when closed"
                : "Anyone on ConnectLn can voice or video call your number directly over Wi-Fi/5G"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {linkedPhone && !pushEnabled && (
            <button
              type="button"
              onClick={handleLinkNumberAndEnablePush}
              disabled={isSaving}
              style={{ color: "#FFFFFF" }}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Bell className="h-3 w-3" />
              <span>Enable Ringing</span>
            </button>
          )}
          {deferredInstallPrompt && (
            <button
              type="button"
              onClick={async () => {
                try {
                  deferredInstallPrompt.prompt()
                  await deferredInstallPrompt.userChoice
                  setDeferredInstallPrompt(null)
                } catch {}
              }}
              className="rounded-lg bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] px-2.5 py-1.5 text-[11px] font-bold text-[#5E3119] flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3 w-3" />
              <span>Install App</span>
            </button>
          )}
          {linkedPhone && (
            <button
              type="button"
              onClick={() => setShowEdit((v) => !v)}
              className="rounded-lg bg-[#EFE8DA] hover:bg-[#E2D9C8] px-2.5 py-1 text-[11px] font-semibold text-[#5E3119] cursor-pointer"
            >
              {showEdit ? "Cancel" : "Change"}
            </button>
          )}
        </div>
      </div>

      {(!linkedPhone || showEdit) && (
        <form onSubmit={handleLinkNumberAndEnablePush} className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="rounded-lg border border-[#D0C4AE] bg-[#F8F4EC] px-2 py-1.5 text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
          >
            {COUNTRY_DIAL_CODES.map((c) => (
              <option key={c.label} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            type="tel"
            value={localNum}
            onChange={(e) => setLocalNum(e.target.value)}
            placeholder="Mobile number (e.g. 240-260-7898)"
            className="flex-1 min-w-[160px] rounded-lg border border-[#D0C4AE] bg-[#F8F4EC] px-3 py-1.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
          />
          <button
            type="submit"
            disabled={isSaving}
            style={{ color: "#FFFFFF" }}
            className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] px-3.5 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Linking..." : "Link & Enable Ringing"}
          </button>
        </form>
      )}

      {statusMsg && (
        <p className="mt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{statusMsg}</span>
        </p>
      )}
    </div>
  )
}

function RemoteStreamVideoRenderer({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [hasFrames, setHasFrames] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !stream) return
    if (el.srcObject !== stream) {
      el.srcObject = stream
    }
    el.muted = true
    const checkReady = () => {
      if (el.videoWidth > 0 && el.readyState >= 2) {
        setHasFrames(true)
      }
    }
    el.addEventListener("loadeddata", checkReady)
    el.addEventListener("playing", checkReady)
    el.addEventListener("timeupdate", checkReady)
    el.play().then(checkReady).catch(() => {})
    return () => {
      el.removeEventListener("loadeddata", checkReady)
      el.removeEventListener("playing", checkReady)
      el.removeEventListener("timeupdate", checkReady)
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity: hasFrames ? 1 : 0, zIndex: 8, backgroundColor: "#090D16" }}
    />
  )
}

function RemoteStreamAudioPlayer({ stream }: { stream: MediaStream }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    const el = audioRef.current
    if (!el || !stream) return
    if (el.srcObject !== stream) el.srcObject = stream
    el.muted = false
    el.volume = 1.0
    const tryPlay = () => {
      if (!audioRef.current) return
      audioRef.current.muted = false
      audioRef.current.play().catch(() => {})
    }
    tryPlay()
    window.addEventListener("pointerdown", tryPlay, { passive: true })
    window.addEventListener("touchstart", tryPlay, { passive: true })
    return () => {
      window.removeEventListener("pointerdown", tryPlay)
      window.removeEventListener("touchstart", tryPlay)
    }
  }, [stream])

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      style={{ position: "fixed", width: 1, height: 1, opacity: 0.01, pointerEvents: "none" }}
    />
  )
}

interface RemoteWebRtcParticipant {
  userId: string
  peerId?: string
  name: string
  isVideoOn: boolean
  isMuted: boolean
  liveFrame?: string | null
}

interface ConferenceCellLeg {
  id: string
  callSid?: string
  name: string
  phone: string
  avatar?: string
  status: "dialing" | "ringing" | "in-progress" | "ended"
}

interface DirectoryContactOption {
  name: string
  phone: string
  prettyPhone: string
  email?: string
  avatar?: string
  headline?: string
}

export interface ConnectLnWhatsAppCallModalProps {
  open: boolean
  onClose: () => void
  initialCallId?: string
  initialMode: "audio" | "video"
  isIncomingAnswer?: boolean
  targetLabel: string
  targetPhone?: string
  targetEmail?: string
  targetAvatar?: string
  callerName: string
  callerEmail?: string
  callerAvatar?: string
  onBridgeCarrierFallback?: (phoneOrName: string) => void
}

/**
 * Full-Screen Multi-Person WhatsApp-Style Direct & Group Voice/Video Call Experience:
 * - Supports 1-on-1 AND Multi-Person Group Calls (`➕ Add Person` mid-call!)
 * - Bridges unlimited WebRTC video/voice peers AND multiple physical cell phones via Twilio `<Conference>`
 * - Seamless handoff: if a cell participant taps their Camera Link, their duplicate SIM leg drops & upgrades to HD Video!
 */
export function ConnectLnWhatsAppCallModal({
  open,
  onClose,
  initialCallId,
  initialMode,
  isIncomingAnswer = false,
  targetLabel,
  targetPhone,
  targetEmail,
  targetAvatar,
  callerName,
  callerEmail,
  callerAvatar,
  onBridgeCarrierFallback,
}: ConnectLnWhatsAppCallModalProps) {
  const [callId, setCallId] = useState<string>(
    () => initialCallId || `wa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  )
  const [isVideoOn, setIsVideoOn] = useState<boolean>(initialMode === "video")
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user")
  const [recipientName, setRecipientName] = useState<string>(targetLabel || "ConnectLn Call")
  const [recipientPhone, setRecipientPhone] = useState<string>(targetPhone || "")
  const [recipientAvatar, setRecipientAvatar] = useState<string>(targetAvatar || "")
  const [callStatus, setCallStatus] = useState<"calling" | "ringing" | "connected" | "ended">("calling")
  const [elapsedSec, setElapsedSec] = useState<number>(0)

  // Multi-peer WebRTC streams + Multi-leg Cell Phone Conference participants
  const [remoteStreamsMap, setRemoteStreamsMap] = useState<Record<string, MediaStream>>({})
  const [remoteWebRtcPeers, setRemoteWebRtcPeers] = useState<RemoteWebRtcParticipant[]>([])
  const [cellLegs, setCellLegs] = useState<ConferenceCellLeg[]>([])

  // Add People Drawer state
  const [showAddPeopleDrawer, setShowAddPeopleDrawer] = useState<boolean>(false)
  const [addCountryCode, setAddCountryCode] = useState<string>("+1")
  const [addPhoneInput, setAddPhoneInput] = useState<string>("")
  const [contactSearch, setContactSearch] = useState<string>("")
  const [directoryContacts, setDirectoryContacts] = useState<DirectoryContactOption[]>([])
  const [isAddingPerson, setIsAddingPerson] = useState<boolean>(false)
  const [addFeedbackMsg, setAddFeedbackMsg] = useState<string>("")

  const [showShareSheet, setShowShareSheet] = useState<boolean>(false)
  const [joinLinkUrl, setJoinLinkUrl] = useState<string>("")
  const [whatsappShareUrl, setWhatsappShareUrl] = useState<string>("")
  const [nativeSmsHref, setNativeSmsHref] = useState<string>("")
  const [pushBannerNote, setPushBannerNote] = useState<string>("")

  const [localPeerUid] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const s = sessionStorage.getItem("vibe_call_participant_id")
      if (s) return s
      const created = `peer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      sessionStorage.setItem("vibe_call_participant_id", created)
      return created
    }
    return `peer-${Date.now()}`
  })

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const gridLocalVideoRef = useRef<HTMLVideoElement | null>(null)
  const offscreenVideoRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null)
  const peerRef = useRef<any>(null)
  const myPeerIdRef = useRef<string>("")
  const activeMediaCallsRef = useRef<Map<string, any>>(new Map())
  const knownRemotePeerIdsRef = useRef<Set<string>>(new Set())
  const dialPeerNowRef = useRef<((pid: string, force?: boolean) => void) | null>(null)
  const hasLiveRemoteVideoRef = useRef<boolean>(false)
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastCapturedFrameRef = useRef<string | null>(null)
  const latestAudioChunkRef = useRef<EncodedVoiceChunk | undefined>(undefined)
  const recentAudioChunksRef = useRef<EncodedVoiceChunk[]>([])
  const voicePlayerRef = useRef<GaplessRemoteVoicePlayer | null>(null)

  // Twilio Browser Conference Host Connection (`ConferenceRoom = conf_<callId>`)
  const pstnDeviceRef = useRef<any>(null)
  const pstnConferenceCallRef = useRef<any>(null)
  const isJoiningConfRef = useRef<boolean>(false)
  const cachedVoiceTokenRef = useRef<string>("")
  const cellLegsRef = useRef<ConferenceCellLeg[]>([])

  useEffect(() => {
    cellLegsRef.current = cellLegs
  }, [cellLegs])

  useEffect(() => {
    if (initialCallId) setCallId(initialCallId)
  }, [initialCallId])

  useEffect(() => {
    setIsVideoOn(initialMode === "video")
  }, [initialMode, open])

  const hangupBrowserConferenceConnection = useCallback(() => {
    try {
      if (pstnConferenceCallRef.current) {
        pstnConferenceCallRef.current.disconnect?.()
        pstnConferenceCallRef.current = null
      }
    } catch {}
    try {
      if (pstnDeviceRef.current) {
        pstnDeviceRef.current.destroy?.()
        pstnDeviceRef.current = null
      }
    } catch {}
    isJoiningConfRef.current = false
  }, [])

  const stopAllMedia = useCallback(() => {
    hangupBrowserConferenceConnection()
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    setLocalStreamState(null)
    activeMediaCallsRef.current.forEach((c) => {
      try {
        c.close?.()
      } catch {}
    })
    activeMediaCallsRef.current.clear()
    if (peerRef.current) {
      try {
        peerRef.current.destroy?.()
      } catch {}
      peerRef.current = null
    }
  }, [hangupBrowserConferenceConnection])

  const ensureBrowserJoinedTwilioConference = useCallback(
    async (conferenceName: string, providedJwt?: string) => {
      if (pstnConferenceCallRef.current || isJoiningConfRef.current) return
      isJoiningConfRef.current = true
      try {
        let jwt = providedJwt || cachedVoiceTokenRef.current
        if (!jwt) {
          const qs = new URLSearchParams({
            identity: callerEmail || callerName || "connectln_host",
          })
          const r = await fetch(`/api/connectin/voice/token?${qs.toString()}`, {
            cache: "no-store",
          })
          const d = await r.json()
          jwt = d?.token || ""
        }
        if (!jwt) {
          isJoiningConfRef.current = false
          return
        }
        cachedVoiceTokenRef.current = jwt

        const { Device } = await import("@twilio/voice-sdk")
        const device = new Device(jwt, {
          codecPreferences: ["opus", "pcmu"] as any,
          enableImprovedSignalingErrorPrecision: true,
        })
        pstnDeviceRef.current = device

        const confCall = await device.connect({
          params: {
            ConferenceRoom: conferenceName,
            CallerName: callerName,
          },
        })
        pstnConferenceCallRef.current = confCall
        if (isMicMuted) {
          try {
            confCall.mute?.(true)
          } catch {}
        }
        confCall.on("disconnect", () => {
          pstnConferenceCallRef.current = null
          isJoiningConfRef.current = false
        })
      } catch (err: any) {
        console.warn("[ConnectLn Conference Audio] notice:", err?.message)
      } finally {
        isJoiningConfRef.current = false
      }
    },
    [callerEmail, callerName, isMicMuted]
  )

  const addPersonToActiveCall = useCallback(
    async (params: {
      targetPhone?: string
      targetName?: string
      targetEmail?: string
      targetAvatar?: string
      forceCellSim?: boolean
    }) => {
      setIsAddingPerson(true)
      setAddFeedbackMsg("")
      try {
        const myPhone = getMyLinkedConnectLnPhone()
        const res = await fetch("/api/connectin/voice/conference-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            callId,
            callMode: isVideoOn ? "video" : "audio",
            hostUserId: localPeerUid,
            callerName,
            callerPhone: myPhone || undefined,
            callerEmail,
            callerAvatar,
            targetPhone: params.targetPhone,
            targetName: params.targetName,
            targetEmail: params.targetEmail,
            forceCellSim: params.forceCellSim,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data?.ok) {
          setAddFeedbackMsg(data?.error || "Could not ring participant.")
          return data
        }

        if (data.carrierVoiceToken) {
          cachedVoiceTokenRef.current = data.carrierVoiceToken
        }
        if (data.joinUrl) setJoinLinkUrl(data.joinUrl)
        if (data.whatsappShareUrl) setWhatsappShareUrl(data.whatsappShareUrl)
        if (data.nativeSmsHref) setNativeSmsHref(data.nativeSmsHref)

        const addedName = data.recipient?.name || params.targetName || "Participant"
        const addedPhone = data.recipient?.phone || params.targetPhone || ""
        const addedAvatar = data.recipient?.avatar || params.targetAvatar || ""

        if (data.cellCallSid && data.conferenceName) {
          // Connect our browser mic/speaker into the shared Twilio `<Conference>` room and track this cell leg!
          void ensureBrowserJoinedTwilioConference(data.conferenceName, data.carrierVoiceToken)

          setCellLegs((prev) => {
            const filtered = prev.filter((l) => l.phone !== addedPhone && l.callSid !== data.cellCallSid)
            return [
              ...filtered,
              {
                id: data.cellCallSid,
                callSid: data.cellCallSid,
                name: addedName,
                phone: addedPhone,
                avatar: addedAvatar,
                status: "ringing",
              },
            ]
          })
          setCallStatus((prev) => (prev === "connected" ? "connected" : "ringing"))
          setPushBannerNote(
            `📱 Ringing ${addedName} (${prettyClientPhone(addedPhone)}) + sent Camera Link!`
          )
          setAddFeedbackMsg(
            `✓ Ringing ${addedName}'s cell phone (${prettyClientPhone(addedPhone)}) & sent Camera Link!`
          )
        } else {
          setCallStatus((prev) => (prev === "connected" ? "connected" : "ringing"))
          setPushBannerNote(`Ringing ${addedName} on ConnectLn...`)
          setAddFeedbackMsg(
            data.mobilePushDeliveredCount > 0 || data.emailAlertSent
              ? `✓ Ringing ${addedName} on ConnectLn & sent instant mobile invite!`
              : `✓ Invited ${addedName} — share link below if they aren't online yet.`
          )
        }
        return data
      } catch {
        setAddFeedbackMsg("Network error while adding participant.")
        return null
      } finally {
        setIsAddingPerson(false)
      }
    },
    [
      callId,
      callerAvatar,
      callerEmail,
      callerName,
      ensureBrowserJoinedTwilioConference,
      isVideoOn,
      localPeerUid,
    ]
  )

  const removeCellLegParticipant = useCallback(
    async (leg: ConferenceCellLeg) => {
      setCellLegs((prev) => prev.filter((l) => l.id !== leg.id))
      if (leg.callSid) {
        await fetch("/api/connectin/voice/conference-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "hangup_participant",
            callSid: leg.callSid,
          }),
        }).catch(() => {})
      }
    },
    []
  )

  const acquireCameraAndMic = useCallback(
    async (wantVideo: boolean, facing: "user" | "environment") => {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop())
        localStreamRef.current = null
      }

      let stream: MediaStream | null = null
      if (wantVideo) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facing },
              width: { ideal: 640, max: 1280 },
              height: { ideal: 480, max: 720 },
              frameRate: { ideal: 24, max: 30 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          })
        } catch {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: facing },
              audio: false,
            })
          } catch {
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            } catch {}
          }
          if (stream && stream.getAudioTracks().length === 0) {
            try {
              const mic = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
              })
              mic.getAudioTracks().forEach((at) => stream!.addTrack(at))
            } catch {}
          }
        }
      }

      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          })
        } catch {}
      }

      if (!stream) return
      stream.getAudioTracks().forEach((t) => {
        t.enabled = !isMicMuted
      })
      localStreamRef.current = stream
      setLocalStreamState(stream)

      for (const el of [localVideoRef.current, gridLocalVideoRef.current]) {
        if (el) {
          el.srcObject = stream
          el.muted = true
          el.play().catch(() => {})
        }
      }
      if (typeof document !== "undefined") {
        if (!offscreenVideoRef.current) {
          const v = document.createElement("video")
          v.muted = true
          v.autoplay = true
          v.playsInline = true
          v.setAttribute("playsinline", "true")
          offscreenVideoRef.current = v
        }
        offscreenVideoRef.current.srcObject = stream
        offscreenVideoRef.current.play().catch(() => {})
      }

      const vTrack = stream.getVideoTracks()[0]
      const aTrack = stream.getAudioTracks()[0]
      activeMediaCallsRef.current.forEach((mc, pid) => {
        const pc: RTCPeerConnection | undefined = mc?.peerConnection
        if (!pc || typeof pc.getSenders !== "function") return
        const senders = pc.getSenders()
        const vSender = senders.find((s) => s.track && s.track.kind === "video")
        const aSender = senders.find((s) => s.track && s.track.kind === "audio")
        if (vTrack && vSender) vSender.replaceTrack(vTrack).catch(() => {})
        if (aTrack && aSender) aSender.replaceTrack(aTrack).catch(() => {})
        if ((vTrack && !vSender) || (aTrack && !aSender)) {
          dialPeerNowRef.current?.(pid, true)
        }
      })
      knownRemotePeerIdsRef.current.forEach((pid) => {
        if (!activeMediaCallsRef.current.has(pid)) {
          dialPeerNowRef.current?.(pid, true)
        }
      })
    },
    [isMicMuted]
  )

  // Load ConnectLn directory contacts when `Add People` drawer opens
  useEffect(() => {
    if (!open || !showAddPeopleDrawer) return
    fetch("/api/connectin/calls/whatsapp?list=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.directoryMembers)) {
          setDirectoryContacts(data.directoryMembers)
        }
      })
      .catch(() => {})
  }, [open, showAddPeopleDrawer])

  // Initialize initial call recipient on open
  useEffect(() => {
    if (!open) {
      stopAllMedia()
      setRemoteStreamsMap({})
      setRemoteWebRtcPeers([])
      setCellLegs([])
      setShowAddPeopleDrawer(false)
      setElapsedSec(0)
      setCallStatus("calling")
      setPushBannerNote("")
      setAddFeedbackMsg("")
      return
    }

    let cancelled = false
    setRecipientName(
      looksLikeClientPhone(targetLabel) ? prettyClientPhone(targetLabel) : targetLabel || "ConnectLn Call"
    )
    setRecipientPhone(targetPhone || (looksLikeClientPhone(targetLabel) ? normalizeClientPhone(targetLabel) : ""))
    setRecipientAvatar(targetAvatar || "")
    setCallStatus(isIncomingAnswer ? "connected" : "calling")

    acquireCameraAndMic(initialMode === "video", "user")

    if (!isIncomingAnswer) {
      addPersonToActiveCall({
        targetPhone: targetPhone || (looksLikeClientPhone(targetLabel) ? targetLabel : undefined),
        targetName: targetLabel,
        targetEmail,
        targetAvatar,
      }).then((data) => {
        if (cancelled || !data?.ok) return
        if (data.recipient?.name) setRecipientName(data.recipient.name)
        if (data.recipient?.phone) setRecipientPhone(data.recipient.phone)
        if (data.recipient?.avatar) setRecipientAvatar(data.recipient.avatar)
      })
    } else {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://conectln.com"
      setJoinLinkUrl(`${origin}/connectin?waCall=${encodeURIComponent(callId)}&mode=${initialMode}&autoAnswer=1`)
    }

    return () => {
      cancelled = true
      stopAllMedia()
    }
  }, [open, callId])

  // Poll live Twilio `<Conference>` cell leg statuses (`ringing` -> `in-progress` -> `completed`)
  useEffect(() => {
    if (!open || cellLegs.length === 0) return
    const activeSids = cellLegs
      .filter((l) => l.callSid && l.status !== "ended")
      .map((l) => l.callSid!)
    if (activeSids.length === 0) return

    const pollCellStatuses = async () => {
      try {
        const res = await fetch("/api/connectin/voice/conference-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", callSids: activeSids }),
        })
        const data = await res.json()
        const statuses = data?.statuses || {}
        setCellLegs((prev) => {
          const next: ConferenceCellLeg[] = []
          for (const leg of prev) {
            const st = leg.callSid ? statuses[leg.callSid]?.status : undefined
            if (
              st === "completed" ||
              st === "canceled" ||
              st === "busy" ||
              st === "no-answer" ||
              st === "failed"
            ) {
              continue
            }
            if (st === "in-progress") {
              setCallStatus("connected")
              next.push({ ...leg, status: "in-progress" })
            } else {
              next.push(leg)
            }
          }
          if (next.length === 0 && prev.length > 0) {
            hangupBrowserConferenceConnection()
          }
          return next
        })
      } catch {}
    }

    const interval = window.setInterval(pollCellStatuses, 2600)
    return () => window.clearInterval(interval)
  }, [open, cellLegs, hangupBrowserConferenceConnection])

  // Duration clock once connected
  useEffect(() => {
    if (!open || callStatus !== "connected") return
    const t = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [open, callStatus])

  // Multi-Peer PeerJS WebRTC Mesh (with Twilio TURN/STUN)
  useEffect(() => {
    if (!open || typeof window === "undefined") return
    let cancelled = false
    let peerInstance: any = null
    let meshInterval: ReturnType<typeof setInterval> | null = null
    const lastAttemptMap = new Map<string, number>()

    const cleanKey = callId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20) || "waroom"
    const cleanUid = localPeerUid.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(-8) || "u"
    const myUniquePeerId = `vibe-${cleanKey}-${cleanUid}-${Math.random().toString(36).slice(2, 6)}`

    const bindMediaCall = (mc: any) => {
      if (!mc?.peer) return
      knownRemotePeerIdsRef.current.add(mc.peer)
      activeMediaCallsRef.current.set(mc.peer, mc)

      mc.on("stream", (rStream: MediaStream) => {
        if (cancelled) return
        activeMediaCallsRef.current.set(mc.peer, mc)
        const hasVid = rStream.getVideoTracks().some((t) => t.readyState === "live" && t.enabled)
        if (hasVid) hasLiveRemoteVideoRef.current = true
        setRemoteStreamsMap((prev) => {
          const existing = prev[mc.peer]
          const prevVid = Boolean(
            existing && existing.getVideoTracks().some((t) => t.readyState === "live")
          )
          if (prevVid && !hasVid) return prev
          return { ...prev, [mc.peer]: rStream }
        })
        setCallStatus("connected")
      })

      mc.on("close", () => {
        if (activeMediaCallsRef.current.get(mc.peer) !== mc) return
        activeMediaCallsRef.current.delete(mc.peer)
        setRemoteStreamsMap((prev) => {
          const next = { ...prev }
          delete next[mc.peer]
          hasLiveRemoteVideoRef.current = Object.values(next).some((s) =>
            s.getVideoTracks().some((t) => t.readyState === "live" && t.enabled)
          )
          return next
        })
      })
    }

    const dialPeerNow = (targetPid: string, force = false) => {
      if (cancelled || !peerInstance || peerInstance.destroyed || !targetPid || targetPid === peerInstance.id) {
        return
      }
      const stream = localStreamRef.current
      if (!stream) return
      const now = Date.now()
      const last = lastAttemptMap.get(targetPid) || 0
      const existing = activeMediaCallsRef.current.get(targetPid)
      const pc: RTCPeerConnection | undefined = existing?.peerConnection
      const senders = pc && typeof pc.getSenders === "function" ? pc.getSenders() : []
      const hasV = senders.some((s) => s.track && s.track.kind === "video")
      const hasA = senders.some((s) => s.track && s.track.kind === "audio")
      const needs =
        !existing ||
        (stream.getVideoTracks().length > 0 && !hasV) ||
        (stream.getAudioTracks().length > 0 && !hasA)

      if (needs && (force || now - last > 4000)) {
        lastAttemptMap.set(targetPid, now)
        try {
          const out = peerInstance.call(targetPid, stream, {
            metadata: { participantId: localPeerUid, name: callerName },
          })
          if (out) bindMediaCall(out)
        } catch {}
      }
    }

    dialPeerNowRef.current = dialPeerNow

    ;(async () => {
      try {
        const PeerMod = await import("peerjs")
        const PeerClass = PeerMod.Peer || PeerMod.default
        if (!PeerClass || cancelled) return
        let iceServers: any[] | null = null
        try {
          const iceRes = await fetch("/api/v1/calls?ice=1", { cache: "no-store" })
          const iceData = await iceRes.json()
          if (Array.isArray(iceData?.ice_servers) && iceData.ice_servers.length > 0) {
            iceServers = iceData.ice_servers
          }
        } catch {}
        if (cancelled) return

        const peer = new PeerClass(myUniquePeerId, {
          debug: 0,
          config: {
            iceCandidatePoolSize: 4,
            iceServers: iceServers || [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun.cloudflare.com:3478" },
            ],
          },
        })

        peer.on("open", (id: string) => {
          if (cancelled) {
            peer.destroy()
            return
          }
          peerInstance = peer
          peerRef.current = peer
          myPeerIdRef.current = id
          knownRemotePeerIdsRef.current.forEach((pid) => dialPeerNow(pid, true))
          meshInterval = setInterval(() => {
            knownRemotePeerIdsRef.current.forEach((pid) => dialPeerNow(pid, false))
          }, 1500)
        })

        peer.on("call", (inc: any) => {
          try {
            inc.answer(localStreamRef.current || undefined)
          } catch {}
          bindMediaCall(inc)
        })
      } catch {}
    })()

    return () => {
      cancelled = true
      dialPeerNowRef.current = null
      if (meshInterval) clearInterval(meshInterval)
      if (peerInstance) {
        try {
          peerInstance.destroy()
        } catch {}
      }
    }
  }, [open, callId, localPeerUid, callerName])

  const hasAnyWebRtcStream = Object.keys(remoteStreamsMap).length > 0

  // Fallback voice chunk capture while WebRTC stream is negotiating
  useEffect(() => {
    if (!open || !localStreamState || hasAnyWebRtcStream) {
      latestAudioChunkRef.current = undefined
      recentAudioChunksRef.current = []
      return
    }
    if (!voicePlayerRef.current) {
      voicePlayerRef.current = new GaplessRemoteVoicePlayer()
    }
    voicePlayerRef.current.unlock()
    const stop = startLiveVoiceChunkCapture(
      localStreamState,
      () => isMicMuted,
      (latest, windowChunks) => {
        latestAudioChunkRef.current = latest
        recentAudioChunksRef.current = windowChunks
      },
      480
    )
    return () => stop()
  }, [open, localStreamState, isMicMuted, hasAnyWebRtcStream])

  // Room presence + multi-participant camera frame sync (`/api/v1/calls`)
  useEffect(() => {
    if (!open) return
    let mounted = true
    let timer: ReturnType<typeof setTimeout> | null = null
    let isFirst = true
    let lastCapMs = 0

    const syncBeat = async () => {
      if (!mounted) return
      const now = Date.now()
      const vidEl =
        [localVideoRef.current, gridLocalVideoRef.current, offscreenVideoRef.current].find(
          (v) => v && v.readyState >= 2 && v.videoWidth > 0
        ) || null

      const throttleMs = hasLiveRemoteVideoRef.current ? 1400 : 500
      if (isVideoOn && vidEl && (now - lastCapMs >= throttleMs || !lastCapturedFrameRef.current)) {
        try {
          if (!captureCanvasRef.current) {
            const c = document.createElement("canvas")
            c.width = 280
            c.height = 200
            captureCanvasRef.current = c
          }
          const ctx = captureCanvasRef.current.getContext("2d")
          if (ctx) {
            ctx.drawImage(vidEl, 0, 0, 280, 200)
            const jpeg = captureCanvasRef.current.toDataURL("image/jpeg", 0.45)
            if (jpeg && jpeg.length > 800) {
              lastCapMs = now
              lastCapturedFrameRef.current = jpeg
            }
          }
        } catch {}
      }

      const reopenFlag = isFirst
      isFirst = false
      try {
        const res = await fetch("/api/v1/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "heartbeat",
            reopen: reopenFlag,
            call_id: callId,
            user_id: localPeerUid,
            peer_id: myPeerIdRef.current || undefined,
            conversation_id: callId,
            call_type: isVideoOn ? "video" : "audio",
            target_recipient_name: !isIncomingAnswer ? recipientName : undefined,
            target_recipient_email: !isIncomingAnswer ? targetEmail : undefined,
            target_recipient_phone: !isIncomingAnswer ? recipientPhone : undefined,
            initiator_phone: getMyLinkedConnectLnPhone() || undefined,
            display_name: callerName,
            is_muted: isMicMuted,
            is_video_on: isVideoOn,
            webrtc_connected: hasLiveRemoteVideoRef.current,
            live_frame: isVideoOn ? lastCapturedFrameRef.current : null,
            live_audio_chunk: !hasAnyWebRtcStream && !isMicMuted ? latestAudioChunkRef.current : undefined,
            recent_audio_chunks: !hasAnyWebRtcStream && !isMicMuted ? recentAudioChunksRef.current : undefined,
          }),
        })
        const data = await res.json()
        if (!mounted) return

        if ((data?.call?.state === "ENDED" || data?.event_type === "call.ended") && !reopenFlag) {
          setCallStatus("ended")
          stopAllMedia()
          setTimeout(() => onClose(), 500)
          return
        }

        const remotes = (data?.call?.participants || []).filter(
          (p: any) => p.user_id && p.user_id !== localPeerUid
        )
        if (remotes.length > 0) {
          setCallStatus("connected")
          setPushBannerNote("")

          const mappedPeers: RemoteWebRtcParticipant[] = remotes.map((rp: any) => ({
            userId: rp.user_id,
            peerId: rp.peer_id,
            name: rp.display_name || "Connected Participant",
            isVideoOn: Boolean(rp.is_video_on),
            isMuted: Boolean(rp.is_muted),
            liveFrame:
              typeof rp.live_frame === "string" && rp.live_frame.length > 800
                ? rp.live_frame
                : null,
          }))
          setRemoteWebRtcPeers(mappedPeers)

          // If any cell-phone participant opened their Camera Link on WebRTC, drop ONLY their duplicate cell SIM leg so there is zero echo!
          const currentCellLegs = cellLegsRef.current
          if (currentCellLegs.length > 0) {
            for (const leg of currentCellLegs) {
              const matchedWebRtc = mappedPeers.some(
                (mp) =>
                  mp.name.trim().toLowerCase() === leg.name.trim().toLowerCase() ||
                  (currentCellLegs.length === 1 && mappedPeers.length === 1)
              )
              if (matchedWebRtc) {
                void removeCellLegParticipant(leg)
              }
            }
          }

          for (const rp of remotes) {
            if (rp.peer_id && rp.peer_id !== myPeerIdRef.current) {
              knownRemotePeerIdsRef.current.add(rp.peer_id)
              dialPeerNowRef.current?.(rp.peer_id, false)
            }
            const peerStream = rp.peer_id ? remoteStreamsMap[rp.peer_id] : undefined
            if (!peerStream && (rp.recent_audio_chunks?.length || rp.live_audio_chunk)) {
              if (!voicePlayerRef.current) {
                voicePlayerRef.current = new GaplessRemoteVoicePlayer()
              }
              if (rp.recent_audio_chunks?.length) {
                voicePlayerRef.current.enqueueChunks(rp.user_id, rp.recent_audio_chunks, Boolean(rp.is_muted))
              } else if (rp.live_audio_chunk) {
                voicePlayerRef.current.enqueueChunk(rp.user_id, rp.live_audio_chunk, Boolean(rp.is_muted))
              }
            }
          }
        } else {
          setRemoteWebRtcPeers([])
        }
      } catch {}

      if (mounted) {
        timer = setTimeout(syncBeat, hasLiveRemoteVideoRef.current ? 1400 : 520)
      }
    }

    syncBeat()
    return () => {
      mounted = false
      if (timer) clearTimeout(timer)
    }
  }, [
    open,
    callId,
    localPeerUid,
    isVideoOn,
    isMicMuted,
    callerName,
    recipientName,
    recipientPhone,
    targetEmail,
    isIncomingAnswer,
    hasAnyWebRtcStream,
    remoteStreamsMap,
    removeCellLegParticipant,
    onClose,
    stopAllMedia,
  ])

  const totalRemoteCount = remoteWebRtcPeers.length + cellLegs.length
  const isGroupGridMode = totalRemoteCount >= 2

  // Bind local video refs whenever stream or layout changes
  useEffect(() => {
    for (const el of [localVideoRef.current, gridLocalVideoRef.current]) {
      if (el && localStreamState) {
        if (el.srcObject !== localStreamState) el.srcObject = localStreamState
        el.muted = true
        el.play().catch(() => {})
      }
    }
  }, [localStreamState, isVideoOn, isGroupGridMode])

  const handleFlipCamera = async () => {
    const nextFacing = cameraFacing === "user" ? "environment" : "user"
    setCameraFacing(nextFacing)
    setIsVideoOn(true)
    await acquireCameraAndMic(true, nextFacing)
  }

  const handleToggleVideo = async () => {
    const next = !isVideoOn
    setIsVideoOn(next)
    if (next) {
      await acquireCameraAndMic(true, cameraFacing)
    } else if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = false
        t.stop()
      })
    }
  }

  const handleToggleMute = () => {
    setIsMicMuted((prev) => {
      const next = !prev
      localStreamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = !next
      })
      try {
        pstnConferenceCallRef.current?.mute?.(next)
      } catch {}
      return next
    })
  }

  const handleHangup = () => {
    const activeCellSids = cellLegsRef.current
      .map((l) => l.callSid)
      .filter((s): s is string => Boolean(s))
    if (activeCellSids.length > 0) {
      fetch("/api/connectin/voice/conference-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ action: "end_all", callSids: activeCellSids }),
      }).catch(() => {})
    }
    fetch("/api/v1/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        action: "end",
        call_id: callId,
        user_id: localPeerUid,
      }),
    }).catch(() => {})
    stopAllMedia()
    onClose()
  }

  if (!open) return null

  const mins = String(Math.floor(elapsedSec / 60)).padStart(2, "0")
  const secs = String(elapsedSec % 60).padStart(2, "0")
  const primaryPeer = remoteWebRtcPeers[0]
  const primaryStream =
    (primaryPeer?.peerId ? remoteStreamsMap[primaryPeer.peerId] : undefined) ||
    Object.values(remoteStreamsMap)[0]
  const primaryName =
    primaryPeer?.name || cellLegs[0]?.name || recipientName || "ConnectLn Call"
  const primaryAvatarSrc =
    recipientAvatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      primaryName || "CL"
    )}&backgroundColor=075e54`

  const filteredContacts = directoryContacts.filter((c) => {
    if (!contactSearch.trim()) return true
    const q = contactSearch.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.prettyPhone.toLowerCase().includes(q)
    )
  })

  return (
    <div className="fixed inset-0 z-[90] bg-[#0B141A] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Global Opus WebRTC Audio Output for ALL Connected Peers */}
      {Object.entries(remoteStreamsMap).map(([pid, st]) => (
        <RemoteStreamAudioPlayer key={pid} stream={st} />
      ))}

      {/* STAGE A: MULTI-PERSON WHATSAPP GROUP CALL SPLIT GRID (2+ Remote Participants) */}
      {isGroupGridMode ? (
        <div className="flex-1 pt-16 pb-24 px-3 sm:px-5 overflow-y-auto">
          <div
            className={`h-full min-h-[70vh] grid gap-3 ${
              totalRemoteCount + 1 <= 4
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {/* Local Self Tile */}
            <div className="relative rounded-2xl overflow-hidden bg-[#111B21] border border-emerald-500/40 min-h-[200px] flex items-center justify-center">
              {isVideoOn ? (
                <video
                  ref={gridLocalVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: cameraFacing === "user" ? "scaleX(-1)" : "none" }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center text-xl font-extrabold">
                    {callerName.slice(0, 2).toUpperCase()}
                  </div>
                </div>
              )}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between bg-black/65 px-2.5 py-1 rounded-lg">
                <span className="text-xs font-bold truncate">You ({callerName})</span>
                <span className="text-[11px]">{isMicMuted ? "🔇" : "🎙️"}</span>
              </div>
            </div>

            {/* WebRTC Video/Voice Participant Tiles */}
            {remoteWebRtcPeers.map((rp, idx) => {
              const st =
                (rp.peerId ? remoteStreamsMap[rp.peerId] : undefined) ||
                (idx === 0 ? Object.values(remoteStreamsMap)[0] : undefined)
              return (
                <div
                  key={rp.userId}
                  className="relative rounded-2xl overflow-hidden bg-[#111B21] border border-emerald-500/50 min-h-[200px] flex items-center justify-center"
                >
                  {rp.isVideoOn && rp.liveFrame && (
                    <img
                      src={rp.liveFrame}
                      alt={rp.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ zIndex: 5 }}
                    />
                  )}
                  {st && rp.isVideoOn && <RemoteStreamVideoRenderer stream={st} />}
                  {(!rp.isVideoOn || (!st && !rp.liveFrame)) && (
                    <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          rp.name
                        )}&backgroundColor=075e54`}
                        alt={rp.name}
                        className="w-18 h-18 rounded-full border-2 border-emerald-400"
                      />
                      <p className="text-sm font-bold text-white">{rp.name}</p>
                    </div>
                  )}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between bg-black/65 px-2.5 py-1 rounded-lg">
                    <span className="text-xs font-bold truncate">{rp.name}</span>
                    <span className="text-[11px] text-emerald-300">
                      {rp.isMuted ? "🔇 Muted" : "🟢 Live"}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Bridged Physical Cell Phone Participant Tiles */}
            {cellLegs.map((leg) => (
              <div
                key={leg.id}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F2922] to-[#111B21] border border-emerald-400/50 min-h-[200px] flex flex-col items-center justify-center p-4 text-center"
              >
                <button
                  type="button"
                  onClick={() => removeCellLegParticipant(leg)}
                  className="absolute top-2.5 right-2.5 z-20 h-7 w-7 rounded-full bg-black/50 hover:bg-rose-600 text-white flex items-center justify-center text-xs cursor-pointer"
                  title="Remove from call"
                >
                  ✕
                </button>
                <div className="relative mb-2.5">
                  {leg.status === "ringing" && (
                    <span className="absolute -inset-2 rounded-full border-2 border-amber-400/60 animate-ping" />
                  )}
                  <img
                    src={
                      leg.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        leg.name
                      )}&backgroundColor=7c4225`
                    }
                    alt={leg.name}
                    className="relative w-16 h-16 rounded-full object-cover border-2 border-emerald-400"
                  />
                </div>
                <p className="text-sm font-extrabold text-white truncate max-w-full">{leg.name}</p>
                <p className="text-xs font-mono text-emerald-300">
                  {prettyClientPhone(leg.phone)}
                </p>
                <span
                  className={`mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                    leg.status === "in-progress"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : "bg-amber-500/20 text-amber-200 border border-amber-400/40"
                  }`}
                >
                  {leg.status === "in-progress" ? "🟢 Cell Phone Bridged" : "📱 Ringing Cell..."}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* STAGE B: CLASSIC 1-ON-1 FULL-SCREEN WHATSAPP VIEW */
        <div className="absolute inset-0 bg-gradient-to-b from-[#071E1A] via-[#0B141A] to-[#060B0E]">
          {callStatus === "connected" && primaryPeer?.isVideoOn && primaryPeer.liveFrame && (
            <img
              src={primaryPeer.liveFrame}
              alt={primaryName}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ zIndex: 5 }}
            />
          )}

          {primaryStream && (primaryPeer?.isVideoOn ?? true) && (
            <RemoteStreamVideoRenderer stream={primaryStream} />
          )}

          {(callStatus !== "connected" ||
            (!primaryStream && !primaryPeer?.liveFrame) ||
            primaryPeer?.isVideoOn === false) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
              <div className="relative mb-5">
                {callStatus !== "connected" && (
                  <span className="absolute -inset-3 rounded-full border-2 border-emerald-400/45 animate-ping" />
                )}
                <img
                  src={primaryAvatarSrc}
                  alt={primaryName}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-emerald-500/70 shadow-2xl"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {primaryName}
              </h2>
              {recipientPhone && (
                <p className="mt-1 text-sm font-mono text-emerald-300 font-semibold">
                  {prettyClientPhone(recipientPhone)}
                </p>
              )}
              <p className="mt-2 text-sm text-slate-300 font-medium">
                {callStatus === "calling" && "Calling on ConnectLn..."}
                {callStatus === "ringing" && "Ringing..."}
                {callStatus === "connected" && `${mins}:${secs} · Connected`}
                {callStatus === "ended" && "Call Ended"}
              </p>
              {pushBannerNote && (
                <p className="mt-3 max-w-sm text-xs text-emerald-200/90 bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-3.5 py-2">
                  {pushBannerNote}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOP WHATSAPP E2EE HEADER WITH `➕ ADD PERSON` BUTTON */}
      <div className="fixed top-0 left-0 right-0 z-30 pt-3.5 px-4 sm:px-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
            <Lock className="h-3 w-3 shrink-0" />
            <span className="truncate">
              End-to-end encrypted · {totalRemoteCount + 1} in call
            </span>
          </div>
          {callStatus === "connected" && (
            <p className="text-xs font-mono text-white/90 mt-0.5">
              {mins}:{secs} · {isGroupGridMode ? "Group Call Live" : primaryName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowAddPeopleDrawer((v) => !v)
              setShowShareSheet(false)
            }}
            style={{ color: "#FFFFFF" }}
            className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer"
            title="Add more people or phone numbers to this call"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Person</span>
          </button>

          <button
            type="button"
            onClick={handleHangup}
            className="h-9 w-9 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 flex items-center justify-center text-white cursor-pointer"
            title="Close Call"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* FLOATING PICTURE-IN-PICTURE LOCAL SELF-VIEW (1-on-1 Mode Only) */}
      {!isGroupGridMode && isVideoOn && (
        <div className="fixed top-16 right-4 sm:right-6 z-25 w-28 h-40 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-white/30 bg-black shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: cameraFacing === "user" ? "scaleX(-1)" : "none" }}
          />
          <button
            type="button"
            onClick={handleFlipCamera}
            className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center cursor-pointer border border-white/20"
            title="Flip Front / Back Camera"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* SLIDE-OVER `➕ ADD PEOPLE TO CALL` DRAWER (Call Continues Live Behind!) */}
      {showAddPeopleDrawer && (
        <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[94vw] max-w-lg rounded-3xl bg-[#111B21]/98 border-2 border-emerald-500/50 p-4 shadow-2xl max-h-[68vh] flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">
                Add People to This Call ({totalRemoteCount + 1} Active)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPeopleDrawer(false)}
              className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* 1. Dial & Merge Any Phone Number (Any Country Code) */}
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!addPhoneInput.trim()) return
              const raw = addPhoneInput.trim()
              const dialTarget =
                raw.startsWith("+") || /[a-zA-Z]/.test(raw)
                  ? raw
                  : buildInternationalPhone(addCountryCode, raw)
              setAddPhoneInput("")
              await addPersonToActiveCall({
                targetPhone: looksLikeClientPhone(dialTarget) ? dialTarget : undefined,
                targetName: dialTarget,
                forceCellSim: looksLikeClientPhone(dialTarget),
              })
            }}
            className="flex flex-wrap items-center gap-1.5 bg-[#0B141A] border border-white/15 rounded-2xl p-2"
          >
            <select
              value={addCountryCode}
              onChange={(e) => setAddCountryCode(e.target.value)}
              className="rounded-xl bg-[#1F2C34] border border-white/15 px-2 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              {COUNTRY_DIAL_CODES.map((c) => (
                <option key={c.label} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={addPhoneInput}
              onChange={(e) => setAddPhoneInput(e.target.value)}
              placeholder="Phone # or @name to merge in..."
              className="flex-1 min-w-[140px] rounded-xl bg-[#1F2C34] border border-white/15 px-3 py-2 text-xs font-mono text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={isAddingPerson}
              style={{ color: "#FFFFFF" }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-extrabold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{isAddingPerson ? "Ringing..." : "Ring & Add"}</span>
            </button>
          </form>

          {addFeedbackMsg && (
            <p className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-3 py-1.5">
              {addFeedbackMsg}
            </p>
          )}

          {/* 2. Search & 1-Tap Add From ConnectLn Contacts */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Search ConnectLn contacts to add..."
              className="w-full rounded-xl bg-[#1F2C34] border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-48">
            {filteredContacts.map((c) => {
              const alreadyInCall =
                cellLegs.some((l) => l.phone === c.phone) ||
                remoteWebRtcPeers.some((p) => p.name.toLowerCase() === c.name.toLowerCase())
              return (
                <div
                  key={c.phone + c.name}
                  className="flex items-center justify-between gap-2 rounded-xl bg-[#1F2C34]/75 hover:bg-[#1F2C34] px-3 py-2 border border-white/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        c.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          c.name
                        )}&backgroundColor=075e54`
                      }
                      alt={c.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{c.name}</p>
                      <p className="text-[10.5px] font-mono text-emerald-300 truncate">
                        {c.prettyPhone}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isAddingPerson || alreadyInCall}
                    onClick={() =>
                      addPersonToActiveCall({
                        targetPhone: c.phone,
                        targetName: c.name,
                        targetEmail: c.email,
                        targetAvatar: c.avatar,
                      })
                    }
                    style={{ color: "#FFFFFF" }}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-extrabold shrink-0 cursor-pointer ${
                      alreadyInCall
                        ? "bg-slate-700 text-slate-300 cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
                  >
                    {alreadyInCall ? "In Call" : "+ Add"}
                  </button>
                </div>
              )
            })}
          </div>

          {/* 3. Quick Copy Group Invite Link */}
          {joinLinkUrl && (
            <div className="pt-1 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-300 truncate font-mono">{joinLinkUrl}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(joinLinkUrl).catch(() => {})
                  setAddFeedbackMsg("✓ Copied group call link! Anyone who taps it joins live.")
                }}
                className="rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[11px] font-bold text-white shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="h-3 w-3" />
                <span>Copy Group Link</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* OPTIONAL INVITE / HYBRID CARRIER FALLBACK DRAWER */}
      {showShareSheet && (
        <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[92vw] max-w-md rounded-2xl bg-[#111B21]/95 border border-emerald-500/40 p-3.5 shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-emerald-300">
              Share Group Call Link or Bridge Carrier SIM
            </p>
            <button
              type="button"
              onClick={() => setShowShareSheet(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {whatsappShareUrl && (
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-700 hover:bg-emerald-600 px-3 py-2 text-xs font-bold text-white no-underline"
              >
                🟢 Send on WhatsApp
              </a>
            )}
            {nativeSmsHref && (
              <a
                href={nativeSmsHref}
                className="rounded-xl bg-sky-700 hover:bg-sky-600 px-3 py-2 text-xs font-bold text-white no-underline"
              >
                💬 Send via SMS
              </a>
            )}
            {joinLinkUrl && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(joinLinkUrl).catch(() => {})
                  setPushBannerNote("✓ Copied direct video call link!")
                  setShowShareSheet(false)
                }}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 px-3 py-2 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Link</span>
              </button>
            )}
            {onBridgeCarrierFallback && (
              <button
                type="button"
                onClick={() => {
                  const target = recipientPhone || targetLabel
                  handleHangup()
                  onBridgeCarrierFallback(target)
                }}
                className="rounded-xl bg-[#7C4225] hover:bg-[#5E3119] px-3 py-2 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Open Keypad Dialer</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM WHATSAPP FLOATING CALL CONTROLS PILL */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pb-6 pt-4 px-4 bg-gradient-to-t from-black/85 to-transparent flex items-center justify-center">
        <div className="rounded-full bg-[#1F2C34]/95 border border-white/15 px-4 sm:px-5 py-2.5 shadow-2xl flex items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              setShowAddPeopleDrawer((v) => !v)
              setShowShareSheet(false)
            }}
            className={`h-11 w-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              showAddPeopleDrawer
                ? "bg-emerald-600 text-white"
                : "bg-emerald-600/25 hover:bg-emerald-600/45 text-emerald-300 border border-emerald-400/40"
            }`}
            title="Add Person to Call"
          >
            <UserPlus className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleFlipCamera}
            className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
            title="Flip Front / Rear Camera"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleToggleVideo}
            className={`h-11 w-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              isVideoOn ? "bg-white/15 hover:bg-white/25 text-white" : "bg-white text-slate-950"
            }`}
            title={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className={`h-11 w-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              isMicMuted ? "bg-white text-slate-950" : "bg-white/15 hover:bg-white/25 text-white"
            }`}
            title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowShareSheet((v) => !v)
              setShowAddPeopleDrawer(false)
            }}
            className={`h-11 w-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              showShareSheet ? "bg-emerald-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title="Share Group Call Link"
          >
            <Share2 className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleHangup}
            style={{ color: "#FFFFFF" }}
            className="h-11 w-13 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-95"
            title="End Call for All"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
