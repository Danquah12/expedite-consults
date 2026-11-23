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
  MessageSquare,
  FolderUp,
  Palette,
  Crown,
  Send,
  MonitorUp,
  VolumeX,
  Volume2,
  FileText,
  Music,
} from "lucide-react"
import {
  normalizeClientPhone,
  looksLikeClientPhone,
  prettyClientPhone,
} from "./ConnectLnCellPhoneSoftphone"
import { registerConnectLnPushSubscription } from "@/lib/connectin-native-callkit-bridge"
import {
  unlockBackgroundRingingSession,
  isDocumentPipSupported,
  openAlwaysOnTopCallStandbyPiP,
  setCallMediaSilenceActive,
  startOutgoingCallerRingbackTone,
  stopOutgoingCallerRingbackTone,
  CONNECTLN_RINGTONE_PRESETS,
  ConnectLnRingtoneId,
  getSelectedConnectLnRingtoneId,
  setSelectedConnectLnRingtoneId,
  saveCustomDeviceRingtoneDataUrl,
  getCustomDeviceRingtoneName,
  previewConnectLnRingtone,
  stopPreviewConnectLnRingtone,
} from "@/lib/connectin-background-ring"
import {
  GLOBAL_COUNTRY_DIAL_CODES,
  buildGlobalE164Phone,
} from "@/lib/connectin-international-phones"
import {
  startLiveVoiceChunkCapture,
  GaplessRemoteVoicePlayer,
  EncodedVoiceChunk,
} from "@/lib/vibe-voice-codec"

export const MY_LINKED_PHONE_STORAGE_KEY = "connectln_my_whatsapp_phone_v1"

export const COUNTRY_DIAL_CODES = GLOBAL_COUNTRY_DIAL_CODES

export function getMyLinkedConnectLnPhone(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(MY_LINKED_PHONE_STORAGE_KEY) || ""
  } catch {
    return ""
  }
}

export function buildInternationalPhone(countryCode: string, localDigitsRaw: string): string {
  return buildGlobalE164Phone(countryCode, localDigitsRaw)
}

/**
 * Top card inside `Messaging -> Studio (Calls)`:
 * - Automatically defaults & locks to the user's 2FA-verified login/registration phone number!
 * - Prevents phone number impersonation: no unverified phone number can ever be linked or used to call.
 */
export function ConnectLnMyPhoneNumberCard({
  userName,
  userEmail,
  userAvatar,
  userHeadline,
  verifiedUserPhone,
  onVerifiedPhoneReady,
}: {
  userName: string
  userEmail?: string
  userAvatar?: string
  userHeadline?: string
  verifiedUserPhone?: string
  onVerifiedPhoneReady?: (e164Phone: string) => void
}) {
  const [countryCode, setCountryCode] = useState<string>("+1")
  const [localNum, setLocalNum] = useState<string>("")
  const [linkedPhone, setLinkedPhone] = useState<string>(() =>
    verifiedUserPhone && looksLikeClientPhone(verifiedUserPhone)
      ? normalizeClientPhone(verifiedUserPhone)
      : ""
  )
  const [pushEnabled, setPushEnabled] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [statusMsg, setStatusMsg] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null)

  // Strict 2FA verification flow if legacy/SSO user has no verified phone yet or switches personal SIM
  const [show2FAVerifyPanel, setShow2FAVerifyPanel] = useState<boolean>(false)
  const [otpStep, setOtpStep] = useState<"input" | "code">("input")
  const [pendingPhone, setPendingPhone] = useState<string>("")
  const [otpChallengeToken, setOtpChallengeToken] = useState<string>("")
  const [otpCode, setOtpCode] = useState<string>("")

  useEffect(() => {
    if (verifiedUserPhone && looksLikeClientPhone(verifiedUserPhone)) {
      const norm = normalizeClientPhone(verifiedUserPhone)
      setLinkedPhone(norm)
      onVerifiedPhoneReady?.(norm)
      try {
        window.localStorage.setItem(MY_LINKED_PHONE_STORAGE_KEY, norm)
        window.dispatchEvent(new Event("connectln_phone_linked"))
      } catch {}
    }
  }, [verifiedUserPhone, onVerifiedPhoneReady])

  useEffect(() => {
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

    // Hydrate user's 2FA-verified phone from `/api/connectin/auth/me` + `/api/connectin/calls/whatsapp`
    ;(async () => {
      try {
        let authPhone =
          verifiedUserPhone && looksLikeClientPhone(verifiedUserPhone)
            ? normalizeClientPhone(verifiedUserPhone)
            : ""

        if (!authPhone) {
          const meRes = await fetch("/api/connectin/auth/me", { cache: "no-store" }).catch(() => null)
          if (meRes?.ok) {
            const meData = await meRes.json()
            const candidate = meData?.user?.phone || meData?.profile?.phone || ""
            if (candidate && looksLikeClientPhone(candidate)) {
              authPhone = normalizeClientPhone(candidate)
            }
          }
        }

        const qs = new URLSearchParams()
        if (userEmail) qs.set("viewerEmail", userEmail)
        if (userName) qs.set("viewerName", userName)
        if (authPhone) qs.set("viewerPhone", authPhone)

        const dirRes = await fetch(`/api/connectin/calls/whatsapp?${qs.toString()}`, {
          cache: "no-store",
        })
        const data = await dirRes.json()
        const resolvedVerified =
          data?.verifiedAccountPhone ||
          data?.myRegistration?.phone ||
          authPhone ||
          ""

        if (resolvedVerified && looksLikeClientPhone(resolvedVerified)) {
          const norm = normalizeClientPhone(resolvedVerified)
          setLinkedPhone(norm)
          onVerifiedPhoneReady?.(norm)
          try {
            window.localStorage.setItem(MY_LINKED_PHONE_STORAGE_KEY, norm)
            window.dispatchEvent(new Event("connectln_phone_linked"))
          } catch {}
        } else {
          // Clear any stale localStorage phone that does not belong to this authenticated user!
          try {
            window.localStorage.removeItem(MY_LINKED_PHONE_STORAGE_KEY)
          } catch {}
        }

        // IMPORTANT: Only mark `pushEnabled = true` if THIS specific device/phone has an active Web Push subscription!
        // Never assume this phone can ring just because the user's Desktop Browser subscribed earlier.
        if (
          resolvedVerified &&
          looksLikeClientPhone(resolvedVerified) &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted" &&
          data?.vapidPublicKey
        ) {
          const existingOrNewSub = await registerConnectLnPushSubscription(data.vapidPublicKey).catch(
            () => null
          )
          if (existingOrNewSub) {
            setPushEnabled(true)
            fetch("/api/connectin/calls/whatsapp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "register",
                phone: normalizeClientPhone(resolvedVerified),
                name: userName,
                email: userEmail,
                avatar: userAvatar,
                headline: userHeadline,
                pushSubscription: existingOrNewSub,
                deviceLabel:
                  typeof navigator !== "undefined" &&
                  /iPhone|Android|Mobile/i.test(navigator.userAgent)
                    ? "Mobile Phone"
                    : "Desktop Browser",
              }),
            }).catch(() => {})
          }
        }
      } catch {}
    })()

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
    }
  }, [userEmail, userName, verifiedUserPhone, onVerifiedPhoneReady])

  // 1-Click `Link & Enable Ringing` for the user's ALREADY 2FA-verified account phone!
  const handleEnableRingingOnVerifiedPhone = async () => {
    if (!linkedPhone || !looksLikeClientPhone(linkedPhone)) return
    setIsSaving(true)
    setErrorMsg("")
    setStatusMsg("Activating incoming voice & video call ringing for your 2FA-verified number...")

    // CRITICAL: Synchronously unlock audio, Notification permission, and Always-On-Top Call Receiver BEFORE any `await fetch`!
    unlockBackgroundRingingSession()
    const permPromise =
      typeof window !== "undefined" && "Notification" in window && Notification.permission === "default"
        ? Notification.requestPermission().catch(() => "default" as NotificationPermission)
        : Promise.resolve(
            typeof window !== "undefined" && "Notification" in window
              ? Notification.permission
              : ("default" as NotificationPermission)
          )
    const pipPromise =
      isDocumentPipSupported() &&
      typeof navigator !== "undefined" &&
      !/iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent || "")
        ? openAlwaysOnTopCallStandbyPiP(true).catch(() => false)
        : Promise.resolve(false)

    try {
      await Promise.all([permPromise, pipPromise])
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
          phone: linkedPhone,
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
        if (saveData?.requires2FA) {
          setShow2FAVerifyPanel(true)
        }
        throw new Error(saveData?.error || "Could not activate ringing.")
      }

      const confirmed = saveData.member.phone
      setLinkedPhone(confirmed)
      onVerifiedPhoneReady?.(confirmed)
      setPushEnabled(true)
      try {
        window.localStorage.setItem(MY_LINKED_PHONE_STORAGE_KEY, confirmed)
        window.dispatchEvent(new Event("connectln_phone_linked"))
      } catch {}
      setStatusMsg(
        `✓ ${prettyClientPhone(confirmed)} linked & incoming call ringing is ACTIVE!`
      )
    } catch (err: any) {
      setStatusMsg("")
      setErrorMsg(err?.message || "Failed to activate ringing.")
    } finally {
      setIsSaving(false)
    }
  }

  // Send 6-digit 2FA OTP to verify ownership of a phone number (anti-impersonation)
  const handleSendPhone2FA = async (channel: "sms" | "call") => {
    const fullE164 = buildInternationalPhone(countryCode, localNum)
    if (!looksLikeClientPhone(fullE164)) {
      setErrorMsg("Select your country and enter a valid mobile number.")
      return
    }
    setIsSaving(true)
    setErrorMsg("")
    setStatusMsg(`Sending 6-digit 2FA verification code via ${channel === "call" ? "Phone Call" : "SMS"}...`)
    try {
      const res = await fetch("/api/connectin/calls/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_phone_2fa",
          phone: fullE164,
          name: userName,
          email: userEmail,
          channel,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Could not send 2FA verification code.")
      }
      setPendingPhone(data.phone || fullE164)
      setOtpChallengeToken(data.otpChallengeToken || "")
      setOtpStep("code")
      setStatusMsg(data.message || `Enter the 6-digit code sent to ${prettyClientPhone(fullE164)}.`)
    } catch (err: any) {
      setStatusMsg("")
      setErrorMsg(err?.message || "Could not send 2FA code.")
    } finally {
      setIsSaving(false)
    }
  }

  // Confirm 6-digit 2FA OTP & lock verified number + activate ringing
  const handleVerifyPhone2FACode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingPhone || otpCode.trim().length < 6) return
    setIsSaving(true)
    setErrorMsg("")
    setStatusMsg("Verifying 6-digit 2FA code & locking your calling identity...")
    unlockBackgroundRingingSession()
    const permPromise =
      typeof window !== "undefined" && "Notification" in window && Notification.permission === "default"
        ? Notification.requestPermission().catch(() => "default" as NotificationPermission)
        : Promise.resolve("default" as NotificationPermission)
    try {
      await permPromise
      const cfgRes = await fetch("/api/connectin/calls/whatsapp", { cache: "no-store" })
      const cfgData = await cfgRes.json()
      const pushSub = cfgData?.vapidPublicKey
        ? await registerConnectLnPushSubscription(cfgData.vapidPublicKey)
        : null

      const res = await fetch("/api/connectin/calls/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_phone_2fa",
          phone: pendingPhone,
          code: otpCode.trim(),
          otpChallengeToken,
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
      const data = await res.json()
      if (!res.ok || !data?.ok || !data?.member?.phone) {
        throw new Error(data?.error || "Invalid 6-digit 2FA code.")
      }

      const confirmed = data.member.phone
      setLinkedPhone(confirmed)
      onVerifiedPhoneReady?.(confirmed)
      setPushEnabled(true)
      setShow2FAVerifyPanel(false)
      setOtpStep("input")
      setOtpCode("")
      setLocalNum("")
      try {
        window.localStorage.setItem(MY_LINKED_PHONE_STORAGE_KEY, confirmed)
        window.dispatchEvent(new Event("connectln_phone_linked"))
      } catch {}
      setStatusMsg(
        `✓ 2FA Verified! ${prettyClientPhone(confirmed)} is locked as your ConnectLn Calling & Ringing number.`
      )
    } catch (err: any) {
      setStatusMsg("")
      setErrorMsg(err?.message || "Verification failed.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-lg mb-5 rounded-2xl bg-[#FBF8F3] border border-[#D5BBA3] px-4 py-3.5 shadow-2xs text-left">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-9 w-9 rounded-xl bg-[#7C4225] text-white flex items-center justify-center shrink-0">
            <Smartphone className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs font-extrabold text-[#1C1917] truncate">
                {linkedPhone
                  ? `My Calling Number: ${prettyClientPhone(linkedPhone)}`
                  : "Verify Your Mobile Number (2FA Required to Call)"}
              </p>
              {linkedPhone && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                  <Lock className="h-2.5 w-2.5" />
                  <span>2FA Verified</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#57534E] truncate mt-0.5">
              {linkedPhone
                ? pushEnabled
                  ? "🟢 Defaulted from your 2FA login · Incoming call ringing is ACTIVE"
                  : "Defaulted from your 2FA login · Click 'Link & Enable Ringing' to activate ringing"
                : "Anti-impersonation security: verify your own number via 2FA to enable calling"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {linkedPhone && (
            <button
              type="button"
              onClick={handleEnableRingingOnVerifiedPhone}
              disabled={isSaving}
              style={{ color: "#FFFFFF" }}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer ${
                pushEnabled
                  ? "bg-emerald-700 hover:bg-emerald-600"
                  : "bg-[#7C4225] hover:bg-[#5E3119]"
              }`}
            >
              <Bell className="h-3 w-3" />
              <span>
                {pushEnabled ? "Ringing Active on This Device ✓" : "Enable Ringing on This Device"}
              </span>
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
              onClick={() => {
                setShow2FAVerifyPanel((v) => !v)
                setOtpStep("input")
                setErrorMsg("")
              }}
              className="rounded-lg bg-[#EFE8DA] hover:bg-[#E2D9C8] px-2 py-1 text-[10.5px] font-semibold text-[#5E3119] cursor-pointer"
              title="Switching SIM? Requires 2FA code verification"
            >
              {show2FAVerifyPanel ? "Cancel" : "Verify New SIM (2FA)"}
            </button>
          )}
        </div>
      </div>

      {/* 2FA Verification Panel (Shown ONLY if user has no verified phone yet or explicitly verifies a new SIM with 2FA) */}
      {(!linkedPhone || show2FAVerifyPanel) && (
        <div className="mt-3 pt-3 border-t border-[#E0D6C5] space-y-2.5">
          {otpStep === "input" ? (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="max-w-[175px] rounded-lg border border-[#D0C4AE] bg-[#F8F4EC] px-2 py-1.5 text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
              >
                {COUNTRY_DIAL_CODES.map((c) => (
                  <option key={`${c.iso}-${c.code}`} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={localNum}
                onChange={(e) => setLocalNum(e.target.value)}
                placeholder="Your mobile number (2FA verified)"
                className="flex-1 min-w-[155px] rounded-lg border border-[#D0C4AE] bg-[#F8F4EC] px-3 py-1.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
              />
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSendPhone2FA("sms")}
                style={{ color: "#FFFFFF" }}
                className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] px-3 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Sending..." : "💬 Send 2FA SMS"}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSendPhone2FA("call")}
                className="rounded-lg bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] px-2.5 py-1.5 text-xs font-bold text-[#5E3119] cursor-pointer disabled:opacity-50"
              >
                📞 Call Me
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyPhone2FACode} className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#5E3119]">
                6-digit code sent to {prettyClientPhone(pendingPhone)}:
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-28 text-center rounded-lg border border-[#7C4225] bg-white px-2.5 py-1.5 text-sm font-mono font-extrabold tracking-widest text-[#1C1917]"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSaving || otpCode.length < 6}
                style={{ color: "#FFFFFF" }}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-extrabold cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Verifying..." : "Verify 2FA & Enable Ringing"}
              </button>
              <button
                type="button"
                onClick={() => handleSendPhone2FA("call")}
                disabled={isSaving}
                className="rounded-lg bg-[#EFE8DA] px-2.5 py-1.5 text-[11px] font-bold text-[#5E3119] cursor-pointer"
              >
                📞 Resend via Call
              </button>
            </form>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="mt-2 text-[11px] font-semibold text-rose-700">
          ⚠️ {errorMsg}
        </p>
      )}

      {statusMsg && !errorMsg && (
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
  const [hasFrames, setHasFrames] = useState(
    () => stream?.getVideoTracks?.().length > 0
  )

  useEffect(() => {
    const el = videoRef.current
    if (!el || !stream) return
    if (el.srcObject !== stream) {
      el.srcObject = stream
    }
    el.muted = true
    const checkReady = () => {
      if (el.videoWidth > 0 || el.readyState >= 2 || stream.getVideoTracks().length > 0) {
        setHasFrames(true)
      }
    }
    el.addEventListener("loadedmetadata", checkReady)
    el.addEventListener("loadeddata", checkReady)
    el.addEventListener("playing", checkReady)
    el.play().then(checkReady).catch(() => {})
    return () => {
      el.removeEventListener("loadedmetadata", checkReady)
      el.removeEventListener("loadeddata", checkReady)
      el.removeEventListener("playing", checkReady)
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="absolute inset-0 w-full h-full object-cover"
      style={{
        opacity: hasFrames ? 1 : 0,
        zIndex: 8,
        backgroundColor: "#090D16",
        transform: "translateZ(0)",
      }}
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
      data-connectln-call-audio="true"
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
  phone?: string
  email?: string
  isVideoOn: boolean
  isMuted: boolean
  isCoHost?: boolean
  hostMuted?: boolean
  virtualBgId?: string
  virtualBgBadge?: string
  liveFrame?: string | null
}

interface ConferenceCellLeg {
  id: string
  callSid?: string
  name: string
  phone: string
  email?: string
  avatar?: string
  isCoHost?: boolean
  hostMuted?: boolean
  status: "dialing" | "ringing" | "in-progress" | "invited" | "unanswered"
  // false = not a ConnectLn member / no registered device: nothing can ring, user must send link or use own SIM
  reachable?: boolean
}

export interface InCallChatMessageItem {
  id: string
  sender_id: string
  sender_name: string
  text: string
  attachment_name?: string
  attachment_mime?: string
  attachment_data_url?: string
  recipient_scope?: "everyone" | "individual" | "selected"
  recipient_ids?: string[]
  recipient_names?: string[]
  sent_at: string
}

export interface InCallSharedStageItem {
  active: boolean
  sharer_user_id: string
  sharer_name: string
  mode: "screen" | "file" | "snapshot" | "presentation"
  title: string
  mime_type?: string
  file_name?: string
  file_size_label?: string
  recipient_scope?: "everyone" | "individual" | "selected"
  recipient_ids?: string[]
  recipient_names?: string[]
  use_webrtc_stream?: boolean
  frame_or_data_url: string | null
  updated_at_ms: number
}

interface CallTargetMemberOption {
  key: string
  userId?: string
  name: string
  phone?: string
  email?: string
  isCoHost?: boolean
  isMuted?: boolean
}

const CALL_BACKGROUND_THEMES: Array<{
  id: string
  label: string
  badge: string
  stageClass: string
  previewGradient: string
}> = [
  {
    id: "none",
    label: "Classic Emerald Studio",
    badge: "Default",
    stageClass: "bg-gradient-to-b from-[#071E1A] via-[#0B141A] to-[#060B0E]",
    previewGradient: "linear-gradient(135deg, #071E1A 0%, #0B141A 60%, #059669 100%)",
  },
  {
    id: "espresso",
    label: "Warm Desk Note Espresso",
    badge: "Desk Note",
    stageClass: "bg-gradient-to-br from-[#2B1810] via-[#1C120E] to-[#4A2717]",
    previewGradient: "linear-gradient(135deg, #2B1810 0%, #5E3119 55%, #8D5535 100%)",
  },
  {
    id: "executive-boardroom",
    label: "Executive Conference Suite",
    badge: "Executive",
    stageClass: "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#312E81]",
    previewGradient: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #4338CA 100%)",
  },
  {
    id: "cyber-soc",
    label: "Zero-Trust Cyber SOC",
    badge: "Security",
    stageClass: "bg-gradient-to-br from-[#020617] via-[#06283D] to-[#0E7490]",
    previewGradient: "linear-gradient(135deg, #020617 0%, #0F4C75 65%, #06B6D4 100%)",
  },
  {
    id: "blueprint",
    label: "Engineering Blueprint",
    badge: "Studio",
    stageClass: "bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#0C2D57]",
    previewGradient: "linear-gradient(135deg, #0B192C 0%, #1D4ED8 100%)",
  },
  {
    id: "clinical-hub",
    label: "Clinical Command Hub",
    badge: "Healthcare",
    stageClass: "bg-gradient-to-br from-[#042F2E] via-[#0F4C4A] to-[#065F46]",
    previewGradient: "linear-gradient(135deg, #042F2E 0%, #0D9488 100%)",
  },
  {
    id: "bokeh-blur",
    label: "Soft Amber Bokeh Studio",
    badge: "Blur",
    stageClass: "bg-gradient-to-br from-[#1F122B] via-[#3B185F] to-[#7C4225]",
    previewGradient: "linear-gradient(135deg, #240B36 0%, #C31432 100%)",
  },
]

function buildMemberIdentityTokens(entry: {
  userId?: string
  phone?: string
  email?: string
  name?: string
}): string[] {
  const tokens: string[] = []
  const uid = String(entry.userId || "").trim()
  if (uid) tokens.push(`uid:${uid}`)
  const digits = String(entry.phone || "").replace(/[^\d]/g, "")
  if (digits.length >= 7) tokens.push(`tel:${digits.slice(-10)}`)
  const em = String(entry.email || "").trim().toLowerCase()
  if (em) tokens.push(`em:${em}`)
  const nm = String(entry.name || "").trim().toLowerCase()
  if (nm && nm !== "connectln call" && nm !== "participant") tokens.push(`nm:${nm}`)
  return tokens
}

function doesIdentityMatchAnyKey(
  entry: { userId?: string; phone?: string; email?: string; name?: string },
  keys: string[]
): boolean {
  if (!Array.isArray(keys) || keys.length === 0) return false
  const keySet = new Set(keys)
  return buildMemberIdentityTokens(entry).some((t) => keySet.has(t))
}

function makeClientInviteeKey(entry: { id?: string; phone?: string; email?: string; name?: string }): string {
  const digits = String(entry.phone || "").replace(/[^\d]/g, "")
  if (digits.length >= 7) return `tel_${digits}`
  if (entry.id && String(entry.id).trim()) return String(entry.id).trim()
  const em = String(entry.email || "").trim().toLowerCase()
  if (em) return `em_${em.replace(/[^a-z0-9@._-]/g, "_")}`
  return `nm_${String(entry.name || "guest")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 48)}`
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
 * - Bridges unlimited WebRTC video/voice peers AND multiple physical cell phones
 * - Supports Studio Backgrounds & Custom Device Backgrounds, Selectable Ringtones,
 *   Team/Individual/Selected-Member In-Call Chat, Device Material Sharing, Host Member Mute & Co-Host Permissions.
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

  // Studio Background & Ringtone Drawer state
  const [showBackgroundDrawer, setShowBackgroundDrawer] = useState<boolean>(false)
  const [selectedBgId, setSelectedBgId] = useState<string>("none")
  const [customBgDataUrl, setCustomBgDataUrl] = useState<string>("")
  const [selectedRingtoneId, setSelectedRingtoneId] = useState<ConnectLnRingtoneId>(() =>
    getSelectedConnectLnRingtoneId()
  )
  const [customRingtoneName, setCustomRingtoneName] = useState<string>(() =>
    getCustomDeviceRingtoneName()
  )

  // In-Call Chat (Everyone, Individual, or Selected Members)
  const [showChatDrawer, setShowChatDrawer] = useState<boolean>(false)
  const [chatMessages, setChatMessages] = useState<InCallChatMessageItem[]>([])
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0)
  const [chatInput, setChatInput] = useState<string>("")
  const [chatRecipientScope, setChatRecipientScope] = useState<"everyone" | "individual" | "selected">("everyone")
  const [selectedChatRecipientKeys, setSelectedChatRecipientKeys] = useState<string[]>([])
  const [chatAttachment, setChatAttachment] = useState<{
    name: string
    mime: string
    dataUrl: string
  } | null>(null)
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false)

  // Device Material Sharing & Live Stage
  const [showMaterialDrawer, setShowMaterialDrawer] = useState<boolean>(false)
  const [activeSharedStage, setActiveSharedStage] = useState<InCallSharedStageItem | null>(null)
  const [isStageMinimized, setIsStageMinimized] = useState<boolean>(false)
  const [materialRecipientScope, setMaterialRecipientScope] = useState<"everyone" | "selected">("everyone")
  const [selectedMaterialRecipientKeys, setSelectedMaterialRecipientKeys] = useState<string[]>([])
  const [isLocalScreenSharing, setIsLocalScreenSharing] = useState<boolean>(false)
  const [materialStatusNote, setMaterialStatusNote] = useState<string>("")

  // Host Mute & Co-Host Permissions Drawer
  const [showHostMembersDrawer, setShowHostMembersDrawer] = useState<boolean>(false)
  const [cohostKeys, setCohostKeys] = useState<string[]>([])
  const [hostMutedKeys, setHostMutedKeys] = useState<string[]>([])
  const [wasMutedByHostBanner, setWasMutedByHostBanner] = useState<boolean>(false)
  const [isModerating, setIsModerating] = useState<boolean>(false)

  const [showShareSheet, setShowShareSheet] = useState<boolean>(false)
  const [joinLinkUrl, setJoinLinkUrl] = useState<string>("")
  const [whatsappShareUrl, setWhatsappShareUrl] = useState<string>("")
  const [nativeSmsHref, setNativeSmsHref] = useState<string>("")
  const [nativeTelHref, setNativeTelHref] = useState<string>("")
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
  const [hasLocalVideoTrack, setHasLocalVideoTrack] = useState<boolean>(false)
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
  const screenStreamRef = useRef<MediaStream | null>(null)
  const materialFileInputRef = useRef<HTMLInputElement | null>(null)
  const chatFileInputRef = useRef<HTMLInputElement | null>(null)
  const bgFileInputRef = useRef<HTMLInputElement | null>(null)
  const ringtoneFileInputRef = useRef<HTMLInputElement | null>(null)
  const clearHostMuteFlagRef = useRef<boolean>(false)
  const showChatDrawerRef = useRef<boolean>(false)
  const lastSeenChatMsgIdsRef = useRef<Set<string>>(new Set())
  const selectedBgIdRef = useRef<string>("none")

  // Twilio Browser Conference Host Connection (`ConferenceRoom = conf_<callId>`)
  const pstnDeviceRef = useRef<any>(null)
  const pstnConferenceCallRef = useRef<any>(null)
  const isJoiningConfRef = useRef<boolean>(false)
  const cachedVoiceTokenRef = useRef<string>("")
  const cellLegsRef = useRef<ConferenceCellLeg[]>([])
  const remoteWebRtcPeersRef = useRef<RemoteWebRtcParticipant[]>([])

  useEffect(() => {
    cellLegsRef.current = cellLegs
  }, [cellLegs])

  useEffect(() => {
    remoteWebRtcPeersRef.current = remoteWebRtcPeers
  }, [remoteWebRtcPeers])

  useEffect(() => {
    showChatDrawerRef.current = showChatDrawer
    if (showChatDrawer) setUnreadChatCount(0)
  }, [showChatDrawer])

  useEffect(() => {
    selectedBgIdRef.current = selectedBgId
  }, [selectedBgId])

  // Register open call modal on `window` so `<ConnectLnIncomingCallBanner />` never overlaps an active call on this tab,
  // and pause/mute all background page media (videos, YouTube embeds, Noctis TTS, music) until the call is completed!
  useEffect(() => {
    if (!open || typeof window === "undefined") {
      setCallMediaSilenceActive(false, "whatsapp-call-modal")
      return
    }
    setCallMediaSilenceActive(true, "whatsapp-call-modal")
    ;(window as any).__connectlnOpenCallModalCount =
      Number((window as any).__connectlnOpenCallModalCount || 0) + 1
    window.dispatchEvent(new Event("connectln_call_modal_change"))
    return () => {
      setCallMediaSilenceActive(false, "whatsapp-call-modal")
      ;(window as any).__connectlnOpenCallModalCount = Math.max(
        0,
        Number((window as any).__connectlnOpenCallModalCount || 1) - 1
      )
      window.dispatchEvent(new Event("connectln_call_modal_change"))
    }
  }, [open])

  const wasOpenRef = useRef<boolean>(open)
  useEffect(() => {
    if (initialCallId) {
      setCallId(initialCallId)
    } else if (open && !wasOpenRef.current) {
      // Guarantee every new outbound call gets its own fresh room ID (never pulling old tiles from previous calls!)
      setCallId(`wa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`)
    }
    wasOpenRef.current = open
  }, [initialCallId, open])

  useEffect(() => {
    setIsVideoOn(initialMode === "video")
  }, [initialMode, open])

  const stopAllMedia = useCallback(() => {
    stopPreviewConnectLnRingtone()
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
      setIsLocalScreenSharing(false)
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    setLocalStreamState(null)
    setHasLocalVideoTrack(false)
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
  }, [])

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
            targetAvatar: params.targetAvatar,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data?.ok) {
          setAddFeedbackMsg(data?.error || "Could not ring participant.")
          return data
        }

        if (data.joinUrl) setJoinLinkUrl(data.joinUrl)
        if (data.whatsappShareUrl) setWhatsappShareUrl(data.whatsappShareUrl)
        if (data.nativeSmsHref) setNativeSmsHref(data.nativeSmsHref)
        if (data.nativeTelHref) setNativeTelHref(data.nativeTelHref)

        const addedName = data.recipient?.name || params.targetName || "Participant"
        const addedPhone = data.recipient?.phone || params.targetPhone || ""
        const addedEmail = data.recipient?.email || params.targetEmail || ""
        const addedAvatar = data.recipient?.avatar || params.targetAvatar || ""
        const legKey = makeClientInviteeKey({
          phone: addedPhone,
          email: addedEmail,
          name: addedName,
        })

        // Keep invited ConnectLn internet participant visible in the group grid ($0.00 WebRTC Internet Call)!
        setCellLegs((prev) => {
          const existing = prev.find((l) => l.id === legKey || (addedPhone && l.phone === addedPhone))
          if (existing && (existing.status === "ringing" || existing.status === "in-progress")) {
            return prev
          }
          const filtered = prev.filter((l) => l.id !== legKey && (!addedPhone || l.phone !== addedPhone))
          return [
            ...filtered,
            {
              id: legKey,
              name: addedName,
              phone: addedPhone,
              email: addedEmail,
              avatar: addedAvatar,
              status: "invited",
              reachable: Boolean(data.isRegisteredOnConnectLn && Number(data.pushDeliveredCount || 0) > 0),
            },
          ]
        })
        setCallStatus((prev) => (prev === "connected" ? "connected" : "ringing"))

        if (data.isRegisteredOnConnectLn) {
          if (Number(data.mobilePushDeliveredCount || 0) > 0) {
            setPushBannerNote(
              isVideoOn
                ? `📱 Ringing ${addedName}'s Phone & ConnectLn over Internet (100% Free Wi-Fi / Data)...`
                : `📱 Ringing ${addedName}'s Phone & ConnectLn over Internet (100% Free Wi-Fi / Data)...`
            )
          } else {
            setPushBannerNote(
              `🔔 Ringing ${addedName} on open ConnectLn tabs — if their phone browser is closed, open conectln.com/connectin on the phone once & tap Activate/Install App (or send the Free Call Link via SMS/WhatsApp below).`
            )
          }
          setAddFeedbackMsg(`✓ Ringing ${addedName} free over ConnectLn Internet!`)
        } else {
          setPushBannerNote(
            `🌐 ${addedName} isn't online on ConnectLn yet — send the Free Internet Call Link from your phone.`
          )
          setAddFeedbackMsg(
            `✓ Internet room ready! Send the free call link to ${addedName} via your SMS/WhatsApp.`
          )
        }

        return data
      } catch {
        setAddFeedbackMsg("Network error while ringing participant over internet.")
        return null
      } finally {
        setIsAddingPerson(false)
      }
    },
    [callId, callerAvatar, callerEmail, callerName, isVideoOn, localPeerUid]
  )

  const removeCellLegParticipant = useCallback(
    async (leg: ConferenceCellLeg, syncRemoveToRoom = true) => {
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
      if (syncRemoveToRoom) {
        await fetch("/api/v1/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "upsert_invitee",
            call_id: callId,
            user_id: localPeerUid,
            display_name: callerName,
            invited_member: {
              id: leg.id,
              name: leg.name,
              phone: leg.phone || undefined,
              email: leg.email || undefined,
              status: "removed",
              callSid: "",
              updated_at_ms: Date.now(),
            },
          }),
        }).catch(() => {})
      }
    },
    [callId, callerName, localPeerUid]
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
              width: { ideal: 640, max: 960 },
              height: { ideal: 480, max: 540 },
              frameRate: { ideal: 30, max: 30 },
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

      if (!stream) {
        setHasLocalVideoTrack(false)
        return
      }
      const liveVid = stream.getVideoTracks().some((t) => t.readyState === "live")
      stream.getVideoTracks().forEach((vt) => {
        try {
          if ("contentHint" in vt) (vt as any).contentHint = "motion"
        } catch {}
      })
      setHasLocalVideoTrack(liveVid)

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
      setShowBackgroundDrawer(false)
      setShowChatDrawer(false)
      setShowMaterialDrawer(false)
      setShowHostMembersDrawer(false)
      setChatMessages([])
      setUnreadChatCount(0)
      setActiveSharedStage(null)
      setCohostKeys([])
      setHostMutedKeys([])
      setWasMutedByHostBanner(false)
      lastSeenChatMsgIdsRef.current.clear()
      setElapsedSec(0)
      setCallStatus("calling")
      setPushBannerNote("")
      setAddFeedbackMsg("")
      setMaterialStatusNote("")
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

  // Duration clock once connected
  useEffect(() => {
    if (!open || callStatus !== "connected") return
    const t = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [open, callStatus])

  // Multi-Peer PeerJS WebRTC Mesh (Free STUN + OpenRelay Global TURN · Smooth 30 FPS RTP)
  useEffect(() => {
    if (!open || typeof window === "undefined") return
    let cancelled = false
    let peerInstance: any = null
    let meshInterval: ReturnType<typeof setInterval> | null = null
    const lastAttemptMap = new Map<string, number>()
    const firstSeenMap = new Map<string, number>()
    const streamingPeersSet = new Set<string>()

    const cleanKey = callId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20) || "waroom"
    const cleanUid = localPeerUid.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(-8) || "u"
    const myUniquePeerId = `vibe-${cleanKey}-${cleanUid}-${Math.random().toString(36).slice(2, 6)}`

    const tunePeerConnectionForSmooth30Fps = (pc?: RTCPeerConnection) => {
      if (!pc || typeof pc.getSenders !== "function") return
      try {
        for (const sender of pc.getSenders()) {
          if (sender.track?.kind === "video" && typeof sender.getParameters === "function") {
            const params = sender.getParameters()
            ;(params as any).degradationPreference = "maintain-framerate"
            if (Array.isArray(params.encodings) && params.encodings.length > 0) {
              params.encodings[0].maxBitrate = 950_000
              params.encodings[0].maxFramerate = 30
            }
            sender.setParameters(params).catch(() => {})
          }
        }
      } catch {}
    }

    const bindMediaCall = (mc: any) => {
      if (!mc?.peer) return
      knownRemotePeerIdsRef.current.add(mc.peer)
      // Never overwrite a MediaConnection that is already actively streaming RTP video/audio!
      if (!streamingPeersSet.has(mc.peer) || !activeMediaCallsRef.current.has(mc.peer)) {
        activeMediaCallsRef.current.set(mc.peer, mc)
      }
      tunePeerConnectionForSmooth30Fps(mc.peerConnection)

      mc.on("stream", (rStream: MediaStream) => {
        if (cancelled) return
        streamingPeersSet.add(mc.peer)
        activeMediaCallsRef.current.set(mc.peer, mc)
        tunePeerConnectionForSmooth30Fps(mc.peerConnection)
        const hasVid = rStream.getVideoTracks().length > 0
        if (hasVid) hasLiveRemoteVideoRef.current = true
        setRemoteStreamsMap((prev) => {
          const existing = prev[mc.peer]
          if (existing === rStream) return prev
          const prevVid = Boolean(existing && existing.getVideoTracks().length > 0)
          if (prevVid && !hasVid) return prev
          return { ...prev, [mc.peer]: rStream }
        })
        setCallStatus("connected")
      })

      mc.on("close", () => {
        if (activeMediaCallsRef.current.get(mc.peer) !== mc) return
        streamingPeersSet.delete(mc.peer)
        activeMediaCallsRef.current.delete(mc.peer)
        setRemoteStreamsMap((prev) => {
          const next = { ...prev }
          delete next[mc.peer]
          hasLiveRemoteVideoRef.current = Object.values(next).some(
            (s) => s.getVideoTracks().length > 0
          )
          return next
        })
      })
    }

    const dialPeerNow = (targetPid: string, force = false) => {
      if (
        cancelled ||
        !peerInstance ||
        peerInstance.destroyed ||
        !targetPid ||
        targetPid === peerInstance.id
      ) {
        return
      }
      // Once RTP stream is live with this peer, do not re-dial or reset the connection!
      if (streamingPeersSet.has(targetPid) && !force) return

      const stream = localStreamRef.current
      if (!stream) return
      const now = Date.now()
      if (!firstSeenMap.has(targetPid)) firstSeenMap.set(targetPid, now)
      const seenAge = now - (firstSeenMap.get(targetPid) || now)

      // Deterministic glare-prevention: smaller peerId initiates immediately; larger peerId waits 3.2s as backup
      const isPrimaryInitiator = peerInstance.id < targetPid
      if (!force && !isPrimaryInitiator && seenAge < 3200) {
        return
      }

      const last = lastAttemptMap.get(targetPid) || 0
      const existing = activeMediaCallsRef.current.get(targetPid)
      const pc: RTCPeerConnection | undefined = existing?.peerConnection
      const iceState = pc?.iceConnectionState
      const connHealthy =
        existing &&
        (streamingPeersSet.has(targetPid) ||
          iceState === "checking" ||
          iceState === "connected" ||
          iceState === "completed")

      if ((!connHealthy || force) && (force || now - last > 4500)) {
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

    const defaultFreeIce = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun.cloudflare.com:3478" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turns:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ]

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
            iceCandidatePoolSize: 6,
            iceServers: iceServers || defaultFreeIce,
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
          knownRemotePeerIdsRef.current.forEach((pid) => dialPeerNow(pid, false))
          meshInterval = setInterval(() => {
            knownRemotePeerIdsRef.current.forEach((pid) => dialPeerNow(pid, false))
          }, 1600)
        })

        peer.on("call", async (inc: any) => {
          // Wait briefly if local camera/mic is still opening so our 30fps video track is included in the initial answer!
          let waitCount = 0
          while (!localStreamRef.current && waitCount < 18 && !cancelled) {
            await new Promise((r) => setTimeout(r, 100))
            waitCount++
          }
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

  // Room presence + fallback preview sync (`/api/v1/calls`) — stops CPU/bandwidth frame encoding once 30fps WebRTC connects!
  useEffect(() => {
    if (!open) return
    let mounted = true
    let timer: ReturnType<typeof setTimeout> | null = null
    let isFirst = true
    let lastCapMs = 0

    const syncBeat = async () => {
      if (!mounted) return
      const now = Date.now()
      const webrtcActiveNow = hasLiveRemoteVideoRef.current || Object.keys(remoteStreamsMap).length > 0

      if (webrtcActiveNow) {
        // Zero CPU/network contention: native 30fps WebRTC video is live, so skip canvas encoding completely!
        lastCapturedFrameRef.current = null
      } else {
        const vidEl =
          [localVideoRef.current, gridLocalVideoRef.current, offscreenVideoRef.current].find(
            (v) => v && v.readyState >= 2 && v.videoWidth > 0
          ) || null

        if (isVideoOn && vidEl && (now - lastCapMs >= 280 || !lastCapturedFrameRef.current)) {
          try {
            if (!captureCanvasRef.current) {
              const c = document.createElement("canvas")
              c.width = 224
              c.height = 160
              captureCanvasRef.current = c
            }
            const ctx = captureCanvasRef.current.getContext("2d")
            if (ctx) {
              ctx.drawImage(vidEl, 0, 0, 224, 160)
              const webpOrJpeg = captureCanvasRef.current.toDataURL("image/webp", 0.42)
              if (webpOrJpeg && webpOrJpeg.length > 400) {
                lastCapMs = now
                lastCapturedFrameRef.current = webpOrJpeg
              }
            }
          } catch {}
        }
      }

      const reopenFlag = isFirst
      isFirst = false
      try {
        const myLinkedPhone = getMyLinkedConnectLnPhone()
        const shouldClearHostMute = clearHostMuteFlagRef.current
        clearHostMuteFlagRef.current = false
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
            initiator_phone: !isIncomingAnswer ? myLinkedPhone || undefined : undefined,
            participant_phone: myLinkedPhone || undefined,
            display_name: callerName,
            is_muted: isMicMuted,
            clear_host_mute: shouldClearHostMute || undefined,
            is_video_on: isVideoOn && hasLocalVideoTrack,
            is_screen_sharing: isLocalScreenSharing,
            virtual_bg_id: selectedBgIdRef.current,
            webrtc_connected: webrtcActiveNow,
            live_frame:
              !webrtcActiveNow && isVideoOn && hasLocalVideoTrack
                ? lastCapturedFrameRef.current
                : null,
            live_audio_chunk: !webrtcActiveNow && !isMicMuted ? latestAudioChunkRef.current : undefined,
            recent_audio_chunks: !webrtcActiveNow && !isMicMuted ? recentAudioChunksRef.current : undefined,
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

        // Sync Host/Co-Host moderation keys & enforce host_muted on local mic
        const srvCohostKeys: string[] = Array.isArray(data?.call?.cohost_keys)
          ? data.call.cohost_keys
          : []
        const srvMutedKeys: string[] = Array.isArray(data?.call?.muted_keys)
          ? data.call.muted_keys
          : []
        setCohostKeys(srvCohostKeys)
        setHostMutedKeys(srvMutedKeys)

        const meSrv = (data?.call?.participants || []).find(
          (p: any) => p?.user_id === localPeerUid
        )
        const mySelfEntry = {
          userId: localPeerUid,
          phone: myLinkedPhone,
          email: callerEmail,
          name: callerName,
        }
        const localIsHostMuted =
          !shouldClearHostMute &&
          (Boolean(meSrv?.host_muted) || doesIdentityMatchAnyKey(mySelfEntry, srvMutedKeys))
        if (localIsHostMuted && !isMicMuted) {
          setIsMicMuted(true)
          setWasMutedByHostBanner(true)
          localStreamRef.current?.getAudioTracks().forEach((t) => {
            t.enabled = false
          })
        }

        // Sync Shared Stage / Device Material (filtered by recipient_scope if targeted)
        const srvStage: InCallSharedStageItem | null = data?.call?.shared_stage || null
        if (srvStage && srvStage.active) {
          const isStageVisibleToSelf =
            !srvStage.recipient_scope ||
            srvStage.recipient_scope === "everyone" ||
            srvStage.sharer_user_id === localPeerUid ||
            (Array.isArray(srvStage.recipient_ids) &&
              doesIdentityMatchAnyKey(mySelfEntry, srvStage.recipient_ids)) ||
            (Array.isArray(srvStage.recipient_ids) &&
              srvStage.recipient_ids.includes(localPeerUid))
          if (isStageVisibleToSelf) {
            setActiveSharedStage((prev) =>
              prev && prev.updated_at_ms === srvStage.updated_at_ms ? prev : srvStage
            )
          }
        } else if (srvStage && srvStage.active === false) {
          setActiveSharedStage((prev) =>
            prev && srvStage.updated_at_ms >= prev.updated_at_ms ? null : prev
          )
        }

        // Sync In-Call Chat Messages (Team / Individual / Selected Members)
        if (Array.isArray(data?.call?.shared_messages)) {
          const msgs: InCallChatMessageItem[] = data.call.shared_messages
          setChatMessages(msgs)
          let newlyUnread = 0
          for (const m of msgs) {
            if (!m?.id || lastSeenChatMsgIdsRef.current.has(m.id)) continue
            lastSeenChatMsgIdsRef.current.add(m.id)
            if (m.sender_id === localPeerUid) continue
            const isVisibleToSelf =
              !m.recipient_scope ||
              m.recipient_scope === "everyone" ||
              (Array.isArray(m.recipient_ids) &&
                (m.recipient_ids.includes(localPeerUid) ||
                  doesIdentityMatchAnyKey(mySelfEntry, m.recipient_ids)))
            if (isVisibleToSelf && !showChatDrawerRef.current) {
              newlyUnread += 1
            }
          }
          if (newlyUnread > 0) {
            setUnreadChatCount((c) => c + newlyUnread)
          }
        }

        const myPhoneDigits = myLinkedPhone.replace(/[^\d]/g, "")
        const callerNameLower = callerName.trim().toLowerCase()
        const initialTargetDigits = String(targetPhone || targetLabel || "").replace(/[^\d]/g, "")
        const initialTargetNameLower = String(targetLabel || "").trim().toLowerCase()
        const isIntentionalSelfCall =
          !isIncomingAnswer &&
          Boolean(
            (myPhoneDigits.length >= 7 &&
              initialTargetDigits.length >= 7 &&
              myPhoneDigits.slice(-10) === initialTargetDigits.slice(-10)) ||
              (!initialTargetDigits &&
                callerNameLower &&
                initialTargetNameLower &&
                initialTargetNameLower === callerNameLower)
          )

        const rawRemotes = (data?.call?.participants || []).filter((p: any) => {
          if (!p?.user_id || p.user_id === localPeerUid) return false
          // Unless intentionally calling your own phone to test, exclude ghost/other open browser tabs of yourself!
          if (!isIntentionalSelfCall) {
            const pDigits = String(p.phone || p.display_name || "").replace(/[^\d]/g, "")
            const pNameLower = String(p.display_name || "").trim().toLowerCase()
            if (
              myPhoneDigits.length >= 7 &&
              pDigits.length >= 7 &&
              myPhoneDigits.slice(-10) === pDigits.slice(-10)
            ) {
              return false
            }
            if (!pDigits && callerNameLower && pNameLower === callerNameLower) {
              return false
            }
          }
          return true
        })

        // Deduplicate multiple tabs/reconnects of the same remote person so one person = one box!
        const dedupedPeersMap = new Map<string, { raw: any; mapped: RemoteWebRtcParticipant }>()
        for (const rp of rawRemotes) {
          const peerEntryForMod = {
            userId: rp.user_id,
            phone: rp.phone,
            name: rp.display_name,
          }
          const isPeerCohost =
            Boolean(rp.is_cohost) || doesIdentityMatchAnyKey(peerEntryForMod, srvCohostKeys)
          const isPeerHostMuted =
            Boolean(rp.host_muted) || doesIdentityMatchAnyKey(peerEntryForMod, srvMutedKeys)
          const mapped: RemoteWebRtcParticipant = {
            userId: rp.user_id,
            peerId: rp.peer_id,
            name: rp.display_name || "Connected Participant",
            phone: rp.phone || undefined,
            isVideoOn: Boolean(rp.is_video_on),
            isMuted: Boolean(rp.is_muted || isPeerHostMuted),
            isCoHost: isPeerCohost,
            hostMuted: isPeerHostMuted,
            virtualBgId: rp.virtual_bg_id,
            virtualBgBadge: rp.virtual_bg_badge,
            liveFrame:
              typeof rp.live_frame === "string" && rp.live_frame.length > 800
                ? rp.live_frame
                : null,
          }
          const rpDigits = String(mapped.phone || mapped.name || "").replace(/[^\d]/g, "")
          const identityKey =
            rpDigits.length >= 7
              ? `ph_${rpDigits.slice(-10)}`
              : `nm_${mapped.name.trim().toLowerCase() || mapped.userId}`
          const prevEntry = dedupedPeersMap.get(identityKey)
          if (
            !prevEntry ||
            (mapped.liveFrame && !prevEntry.mapped.liveFrame) ||
            (mapped.isVideoOn && !prevEntry.mapped.isVideoOn)
          ) {
            dedupedPeersMap.set(identityKey, { raw: rp, mapped })
          }
        }

        const remotes = Array.from(dedupedPeersMap.values()).map((x) => x.raw)
        const mappedPeers: RemoteWebRtcParticipant[] = Array.from(dedupedPeersMap.values()).map(
          (x) => x.mapped
        )

        const hostNameLower = String(data?.call?.initiator_name || "").trim().toLowerCase()
        const peerMatchesLeg = (mp: RemoteWebRtcParticipant, legName: string, legPhone?: string) => {
          const mpDigits = String(mp.phone || mp.name || "").replace(/[^\d]/g, "")
          const lDigits = String(legPhone || legName || "").replace(/[^\d]/g, "")
          if (mpDigits.length >= 7 && lDigits.length >= 7) {
            return mpDigits === lDigits || mpDigits.slice(-10) === lDigits.slice(-10)
          }
          const mpName = mp.name.trim().toLowerCase()
          const lName = String(legName || "").trim().toLowerCase()
          if (!mpName || !lName) return false
          // If intentionally calling your own phone from desktop, match your answered mobile peer against your own ringing tile!
          if (
            isIntentionalSelfCall &&
            mpName === callerNameLower &&
            (lName === callerNameLower ||
              (myPhoneDigits.length >= 7 &&
                lDigits.length >= 7 &&
                myPhoneDigits.slice(-10) === lDigits.slice(-10)))
          ) {
            return true
          }
          if (
            lName === hostNameLower &&
            myPhoneDigits.length >= 7 &&
            lDigits.length >= 7 &&
            myPhoneDigits.slice(-10) !== lDigits.slice(-10)
          ) {
            return false
          }
          return mpName === lName && lName !== callerNameLower
        }

        // Sync `invited_roster` across devices while filtering out self-duplicates & already-connected WebRTC peers!
        const serverRoster: any[] = Array.isArray(data?.call?.invited_roster)
          ? data.call.invited_roster
          : []
        const activeNonRemovedRoster = serverRoster.filter((r) => r && r.status !== "removed")

        if (serverRoster.length > 0 || mappedPeers.length > 0) {
          setCellLegs((prev) => {
            const prevById = new Map<string, ConferenceCellLeg>()
            for (const p of prev) prevById.set(p.id, p)

            const mergedById = new Map<string, ConferenceCellLeg>()
            for (const p of prev) {
              const srv = serverRoster.find((r) => r?.id === p.id)
              if (srv?.status === "removed") continue
              const pDigits = String(p.phone || p.name || "").replace(/[^\d]/g, "")
              if (!isIntentionalSelfCall) {
                if (
                  myPhoneDigits.length >= 7 &&
                  pDigits.length >= 7 &&
                  myPhoneDigits.slice(-10) === pDigits.slice(-10)
                ) {
                  continue
                }
                if (!pDigits && callerNameLower && p.name.trim().toLowerCase() === callerNameLower) {
                  continue
                }
              }
              mergedById.set(p.id, p)
            }

            for (const inv of serverRoster) {
              if (!inv || inv.status === "removed") continue
              const key = makeClientInviteeKey(inv)
              const invDigits = String(inv.phone || inv.name || "").replace(/[^\d]/g, "")
              const invNameLower = String(inv.name || "").trim().toLowerCase()

              // Never show a duplicate box for "You" (either as caller calling someone else, or as incoming recipient)
              const isSelfByPhone =
                myPhoneDigits.length >= 7 &&
                invDigits.length >= 7 &&
                myPhoneDigits.slice(-10) === invDigits.slice(-10)
              const isSelfByName = !invDigits && callerNameLower && invNameLower === callerNameLower
              if ((isIncomingAnswer || !isIntentionalSelfCall) && (isSelfByPhone || isSelfByName)) {
                mergedById.delete(key)
                continue
              }

              // Hide invitee placeholder once that person is live on WebRTC (or in a 1-on-1 call when the sole invitee connects)
              const isOneOnOneSoleInviteeConnected =
                activeNonRemovedRoster.length <= 1 && prev.length <= 1 && mappedPeers.length === 1
              if (
                isOneOnOneSoleInviteeConnected ||
                mappedPeers.some((mp) => peerMatchesLeg(mp, inv.name, inv.phone))
              ) {
                mergedById.delete(key)
                continue
              }

              const localExisting = prevById.get(key)
              const resolvedStatus: ConferenceCellLeg["status"] =
                localExisting?.status === "in-progress" || inv.status === "in-progress"
                  ? "in-progress"
                  : inv.status === "ringing" || inv.status === "unanswered" || inv.status === "invited"
                  ? inv.status
                  : "invited"

              mergedById.set(key, {
                id: key,
                callSid: localExisting?.callSid || inv.callSid || undefined,
                name: inv.name || localExisting?.name || "Invited Participant",
                phone: inv.phone || localExisting?.phone || "",
                email: inv.email || localExisting?.email || "",
                avatar: inv.avatar || localExisting?.avatar || "",
                isCoHost:
                  Boolean(inv.is_cohost) ||
                  doesIdentityMatchAnyKey(
                    { phone: inv.phone, email: inv.email, name: inv.name },
                    srvCohostKeys
                  ),
                hostMuted:
                  Boolean(inv.host_muted) ||
                  doesIdentityMatchAnyKey(
                    { phone: inv.phone, email: inv.email, name: inv.name },
                    srvMutedKeys
                  ),
                status: resolvedStatus,
              })
            }

            // Also ensure local-only 1-on-1 placeholder clears once the 1-on-1 WebRTC peer connects
            if (activeNonRemovedRoster.length <= 1 && mergedById.size === 1 && mappedPeers.length === 1) {
              mergedById.clear()
            }

            return Array.from(mergedById.values())
          })
        }

        if (remotes.length > 0) {
          setCallStatus("connected")
          setPushBannerNote("")
          setRemoteWebRtcPeers(mappedPeers)

          // If a ringing (NOT already answered `in-progress`!) cell leg just opened their Camera Link on WebRTC, drop ONLY that exact person's ringing SIM leg
          const currentCellLegs = cellLegsRef.current
          if (currentCellLegs.length > 0) {
            for (const leg of currentCellLegs) {
              if (leg.status === "in-progress") continue
              const matchedWebRtc = mappedPeers.some((mp) =>
                peerMatchesLeg(mp, leg.name, leg.phone)
              )
              if (matchedWebRtc) {
                void removeCellLegParticipant(leg, false)
              }
            }
          }

          for (const rp of remotes) {
            if (rp.peer_id && rp.peer_id !== myPeerIdRef.current) {
              knownRemotePeerIdsRef.current.add(rp.peer_id)
              dialPeerNowRef.current?.(rp.peer_id, false)
            }
            const peerStream = rp.peer_id ? remoteStreamsMap[rp.peer_id] : undefined
            const peerSilencedByHost = Boolean(
              rp.host_muted ||
                doesIdentityMatchAnyKey(
                  { userId: rp.user_id, phone: rp.phone, name: rp.display_name },
                  srvMutedKeys
                )
            )
            if (!peerStream && !peerSilencedByHost && (rp.recent_audio_chunks?.length || rp.live_audio_chunk)) {
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
        const fastWebRtc = hasLiveRemoteVideoRef.current || Object.keys(remoteStreamsMap).length > 0
        timer = setTimeout(syncBeat, fastWebRtc ? 2400 : 320)
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
    hasLocalVideoTrack,
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
  }, [localStreamState, isVideoOn, hasLocalVideoTrack, isGroupGridMode])

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
      setHasLocalVideoTrack(false)
    }
  }

  const handleToggleMute = () => {
    setIsMicMuted((prev) => {
      const next = !prev
      if (!next) {
        clearHostMuteFlagRef.current = true
        setWasMutedByHostBanner(false)
      }
      localStreamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = !next
      })
      return next
    })
  }

  // WhatsApp-style: outgoing call that nobody answers ends automatically after 60s
  // (prevents a forgotten tab from ringing the recipient for hours).
  const remotePeerCountRef = useRef(0)
  remotePeerCountRef.current = remoteWebRtcPeers.length
  useEffect(() => {
    if (!open || isIncomingAnswer) return
    const t = window.setTimeout(() => {
      if (remotePeerCountRef.current > 0) return
      fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          action: "end",
          call_id: callId,
          user_id: localPeerUid,
          target_recipient_phone: recipientPhone || undefined,
          invited_phones: cellLegsRef.current.map((l) => l.phone).filter(Boolean),
        }),
      }).catch(() => {})
      setCallStatus("ended")
      setPushBannerNote("No answer. Call ended after 60 seconds.")
      stopAllMedia()
      window.setTimeout(() => onClose(), 2500)
    }, 60000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isIncomingAnswer, callId])

  // Play audible telephone ringtone on BOTH sides (caller waiting for answer & recipient connecting)
  // until the remote WebRTC peer stream connects (`remoteWebRtcPeers.length > 0`) or the call ends.
  const isWaitingForAnswer =
    open &&
    callStatus !== "ended" &&
    remoteWebRtcPeers.length === 0 &&
    !hasAnyWebRtcStream
  useEffect(() => {
    if (!isWaitingForAnswer || typeof window === "undefined") {
      stopOutgoingCallerRingbackTone()
      return
    }
    startOutgoingCallerRingbackTone()
    return () => {
      stopOutgoingCallerRingbackTone()
    }
  }, [isWaitingForAnswer])

  const handleHangup = () => {
    stopOutgoingCallerRingbackTone()
    fetch("/api/v1/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        action: "end",
        call_id: callId,
        user_id: localPeerUid,
        display_name: callerName,
        target_recipient_phone: recipientPhone || undefined,
        invited_phones: cellLegs.map((l) => l.phone).filter(Boolean),
      }),
    }).catch(() => {})
    stopAllMedia()
    onClose()
  }

  const closeAllCallDrawers = () => {
    setShowAddPeopleDrawer(false)
    setShowBackgroundDrawer(false)
    setShowChatDrawer(false)
    setShowMaterialDrawer(false)
    setShowHostMembersDrawer(false)
    setShowShareSheet(false)
  }

  const mySelfTokens = buildMemberIdentityTokens({
    userId: localPeerUid,
    phone: getMyLinkedConnectLnPhone(),
    email: callerEmail,
    name: callerName,
  })
  const isLocalHost = !isIncomingAnswer
  const isLocalCoHost = doesIdentityMatchAnyKey(
    {
      userId: localPeerUid,
      phone: getMyLinkedConnectLnPhone(),
      email: callerEmail,
      name: callerName,
    },
    cohostKeys
  )
  const canModerateCall = isLocalHost || isLocalCoHost

  const allCallTargetMembers: CallTargetMemberOption[] = (() => {
    const out: CallTargetMemberOption[] = []
    const seen = new Set<string>()
    for (const rp of remoteWebRtcPeers) {
      const k = rp.userId || `nm:${rp.name.toLowerCase()}`
      if (seen.has(k)) continue
      seen.add(k)
      out.push({
        key: k,
        userId: rp.userId,
        name: rp.name,
        phone: rp.phone,
        email: rp.email,
        isCoHost: rp.isCoHost,
        isMuted: rp.isMuted || rp.hostMuted,
      })
    }
    for (const leg of cellLegs) {
      const tokens = buildMemberIdentityTokens({
        phone: leg.phone,
        email: leg.email,
        name: leg.name,
      })
      const alreadyLive = out.some(
        (m) =>
          (m.phone && leg.phone && m.phone.replace(/\D/g, "").slice(-10) === leg.phone.replace(/\D/g, "").slice(-10)) ||
          m.name.toLowerCase() === leg.name.toLowerCase()
      )
      if (alreadyLive) continue
      const k = tokens[0] || leg.id
      if (seen.has(k)) continue
      seen.add(k)
      out.push({
        key: k,
        userId: leg.id,
        name: leg.name,
        phone: leg.phone,
        email: leg.email,
        isCoHost: leg.isCoHost,
        isMuted: leg.hostMuted,
      })
    }
    if (out.length === 0 && (recipientName || recipientPhone)) {
      const k =
        buildMemberIdentityTokens({ phone: recipientPhone, email: targetEmail, name: recipientName })[0] ||
        `nm:${recipientName.toLowerCase()}`
      out.push({
        key: k,
        name: recipientName,
        phone: recipientPhone || undefined,
        email: targetEmail || undefined,
        isCoHost: doesIdentityMatchAnyKey(
          { phone: recipientPhone, email: targetEmail, name: recipientName },
          cohostKeys
        ),
        isMuted: doesIdentityMatchAnyKey(
          { phone: recipientPhone, email: targetEmail, name: recipientName },
          hostMutedKeys
        ),
      })
    }
    return out
  })()

  const buildTokensForTargetOption = (m: CallTargetMemberOption): string[] =>
    buildMemberIdentityTokens({
      userId: m.userId,
      phone: m.phone,
      email: m.email,
      name: m.name,
    })

  const visibleChatMessages = chatMessages.filter((m) => {
    if (!m.recipient_scope || m.recipient_scope === "everyone") return true
    if (m.sender_id === localPeerUid) return true
    const ids = Array.isArray(m.recipient_ids) ? m.recipient_ids : []
    return ids.includes(localPeerUid) || mySelfTokens.some((t) => ids.includes(t))
  })

  const handleModerateMember = async (params: {
    targetUserId?: string
    targetName?: string
    targetPhone?: string
    targetEmail?: string
    subAction: "mute_member" | "unmute_member" | "mute_all" | "toggle_cohost"
    isCohost?: boolean
  }) => {
    setIsModerating(true)
    try {
      const res = await fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moderate_participant",
          sub_action: params.subAction,
          call_id: callId,
          user_id: localPeerUid,
          actor_user_id: localPeerUid,
          display_name: callerName,
          target_user_id: params.targetUserId,
          target_name: params.targetName,
          target_phone: params.targetPhone,
          target_email: params.targetEmail,
          is_cohost: params.isCohost,
        }),
      })
      const data = await res.json().catch(() => null)
      if (data?.call) {
        if (Array.isArray(data.call.cohost_keys)) setCohostKeys(data.call.cohost_keys)
        if (Array.isArray(data.call.muted_keys)) setHostMutedKeys(data.call.muted_keys)
      }
      if (params.subAction === "mute_all") {
        setPushBannerNote("🔇 Host muted all call members.")
      } else if (params.subAction === "mute_member") {
        setPushBannerNote(`🔇 Muted ${params.targetName || "member"}.`)
      } else if (params.subAction === "unmute_member") {
        setPushBannerNote(`🎙️ Unmuted ${params.targetName || "member"}.`)
      } else if (params.subAction === "toggle_cohost") {
        setPushBannerNote(
          params.isCohost !== false
            ? `👑 Granted Co-Host permission to ${params.targetName || "member"}!`
            : `Removed Co-Host permission from ${params.targetName || "member"}.`
        )
      }
    } catch {}
    setIsModerating(false)
  }

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!chatInput.trim() && !chatAttachment) return

    let recipientIds: string[] | undefined
    let recipientNames: string[] | undefined
    if (chatRecipientScope !== "everyone") {
      const chosen = allCallTargetMembers.filter((m) =>
        selectedChatRecipientKeys.includes(m.key)
      )
      if (chosen.length === 0) {
        setPushBannerNote("Select at least one member to send this targeted chat.")
        return
      }
      const tokenSet = new Set<string>()
      chosen.forEach((m) => {
        if (m.userId) tokenSet.add(m.userId)
        buildTokensForTargetOption(m).forEach((t) => tokenSet.add(t))
      })
      recipientIds = Array.from(tokenSet)
      recipientNames = chosen.map((m) => m.name)
    }

    setIsSendingChat(true)
    const msgId = `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`
    const localMsg: InCallChatMessageItem = {
      id: msgId,
      sender_id: localPeerUid,
      sender_name: callerName,
      text: chatInput.trim(),
      attachment_name: chatAttachment?.name,
      attachment_mime: chatAttachment?.mime,
      attachment_data_url: chatAttachment?.dataUrl,
      recipient_scope: chatRecipientScope,
      recipient_ids: recipientIds,
      recipient_names: recipientNames,
      sent_at: new Date().toISOString(),
    }
    lastSeenChatMsgIdsRef.current.add(msgId)
    setChatMessages((prev) => [...prev, localMsg])
    setChatInput("")
    setChatAttachment(null)

    try {
      await fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat_message",
          call_id: callId,
          user_id: localPeerUid,
          display_name: callerName,
          participant_phone: getMyLinkedConnectLnPhone() || undefined,
          chat_message: localMsg,
        }),
      })
    } catch {}
    setIsSendingChat(false)
  }

  const handleShareMaterialFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    if (file.size > 4.5 * 1024 * 1024) {
      setMaterialStatusNote("Please choose a device file under 4.5 MB so it syncs instantly to members.")
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = String(reader.result || "")
      if (!dataUrl) return

      let recipientIds: string[] | undefined
      let recipientNames: string[] | undefined
      if (materialRecipientScope === "selected") {
        const chosen = allCallTargetMembers.filter((m) =>
          selectedMaterialRecipientKeys.includes(m.key)
        )
        if (chosen.length === 0) {
          setMaterialStatusNote("Select at least one member, or switch target to Everyone.")
          return
        }
        const tokenSet = new Set<string>()
        chosen.forEach((m) => {
          if (m.userId) tokenSet.add(m.userId)
          buildTokensForTargetOption(m).forEach((t) => tokenSet.add(t))
        })
        recipientIds = Array.from(tokenSet)
        recipientNames = chosen.map((m) => m.name)
      }

      const sizeKb =
        file.size < 1024 * 1024
          ? `${Math.max(1, Math.round(file.size / 1024))} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      const stagePayload: InCallSharedStageItem = {
        active: true,
        sharer_user_id: localPeerUid,
        sharer_name: callerName,
        mode: "file",
        title: file.name,
        mime_type: file.type || "application/octet-stream",
        file_name: file.name,
        file_size_label: sizeKb,
        recipient_scope: materialRecipientScope,
        recipient_ids: recipientIds,
        recipient_names: recipientNames,
        frame_or_data_url: dataUrl,
        updated_at_ms: Date.now(),
      }
      setActiveSharedStage(stagePayload)
      setIsStageMinimized(false)
      setMaterialStatusNote(
        `✓ Shared "${file.name}" (${sizeKb}) with ${
          materialRecipientScope === "everyone"
            ? "Everyone in call"
            : recipientNames?.join(", ") || "Selected Members"
        }!`
      )
      await fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "share_stage",
          call_id: callId,
          user_id: localPeerUid,
          display_name: callerName,
          shared_stage: stagePayload,
        }),
      }).catch(() => {})
    }
    reader.readAsDataURL(file)
  }

  const handleToggleDeviceScreenShare = async () => {
    if (isLocalScreenSharing && screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
      setIsLocalScreenSharing(false)
      const vidTrack = localStreamRef.current?.getVideoTracks()[0]
      if (vidTrack) {
        activeMediaCallsRef.current.forEach((mc) => {
          const vs = mc?.peerConnection?.getSenders?.()?.find((s: any) => s.track?.kind === "video")
          if (vs) vs.replaceTrack(vidTrack).catch(() => {})
        })
      }
      await fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "share_stage",
          call_id: callId,
          user_id: localPeerUid,
          display_name: callerName,
          shared_stage: { active: false },
        }),
      }).catch(() => {})
      setActiveSharedStage(null)
      return
    }
    try {
      const scr = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 20, max: 30 } },
        audio: false,
      })
      const scrTrack = scr.getVideoTracks()[0]
      if (!scrTrack) return
      screenStreamRef.current = scr
      setIsLocalScreenSharing(true)
      activeMediaCallsRef.current.forEach((mc) => {
        const vs = mc?.peerConnection?.getSenders?.()?.find((s: any) => s.track?.kind === "video")
        if (vs) vs.replaceTrack(scrTrack).catch(() => {})
      })
      scrTrack.onended = () => {
        screenStreamRef.current = null
        setIsLocalScreenSharing(false)
        const camTrack = localStreamRef.current?.getVideoTracks()[0]
        if (camTrack) {
          activeMediaCallsRef.current.forEach((mc) => {
            const vs = mc?.peerConnection?.getSenders?.()?.find((s: any) => s.track?.kind === "video")
            if (vs) vs.replaceTrack(camTrack).catch(() => {})
          })
        }
        setActiveSharedStage(null)
        fetch("/api/v1/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "share_stage",
            call_id: callId,
            user_id: localPeerUid,
            display_name: callerName,
            shared_stage: { active: false },
          }),
        }).catch(() => {})
      }
      const stagePayload: InCallSharedStageItem = {
        active: true,
        sharer_user_id: localPeerUid,
        sharer_name: callerName,
        mode: "screen",
        title: `${callerName}'s Live Device Screen`,
        use_webrtc_stream: true,
        frame_or_data_url: null,
        updated_at_ms: Date.now(),
      }
      setActiveSharedStage(stagePayload)
      setIsStageMinimized(false)
      setMaterialStatusNote("✓ Sharing your live screen with everyone in call!")
      await fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "share_stage",
          call_id: callId,
          user_id: localPeerUid,
          display_name: callerName,
          shared_stage: stagePayload,
        }),
      }).catch(() => {})
    } catch {
      setMaterialStatusNote("Screen share was cancelled or is unavailable on this browser.")
    }
  }

  const handleStopSharedStage = async () => {
    if (isLocalScreenSharing && screenStreamRef.current) {
      await handleToggleDeviceScreenShare()
      return
    }
    setActiveSharedStage(null)
    await fetch("/api/v1/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "share_stage",
        call_id: callId,
        user_id: localPeerUid,
        display_name: callerName,
        shared_stage: { active: false },
      }),
    }).catch(() => {})
  }

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result || "")
      if (url.startsWith("data:image/")) {
        setCustomBgDataUrl(url)
        setSelectedBgId("custom-image")
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDeviceRingtoneUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    if (file.size > 3 * 1024 * 1024) {
      setPushBannerNote("Please pick a device ringtone file under 3 MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result || "")
      if (url) {
        saveCustomDeviceRingtoneDataUrl(url, file.name)
        setSelectedRingtoneId("device-custom")
        setCustomRingtoneName(file.name)
        previewConnectLnRingtone("device-custom", 4000)
      }
    }
    reader.readAsDataURL(file)
  }

  const activeBgTheme =
    CALL_BACKGROUND_THEMES.find((b) => b.id === selectedBgId) || CALL_BACKGROUND_THEMES[0]

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

  const activeBgBackgroundStyle: React.CSSProperties =
    selectedBgId === "custom-image" && customBgDataUrl
      ? {
          backgroundImage: `linear-gradient(rgba(6, 11, 14, 0.35), rgba(6, 11, 14, 0.45)), url(${customBgDataUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}

  return (
    <div
      className={`fixed inset-0 z-[90] text-white flex flex-col justify-between overflow-hidden select-none ${
        selectedBgId === "custom-image" ? "bg-[#0B141A]" : activeBgTheme.stageClass
      }`}
      style={activeBgBackgroundStyle}
    >
      {/* Hidden device pickers for Background, Ringtone, Device Materials & Chat Attachments */}
      <input
        ref={bgFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCustomBgUpload}
      />
      <input
        ref={ringtoneFileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
        className="hidden"
        onChange={handleDeviceRingtoneUpload}
      />
      <input
        ref={materialFileInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={handleShareMaterialFile}
      />
      <input
        ref={chatFileInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          e.target.value = ""
          if (file.size > 3.5 * 1024 * 1024) {
            setPushBannerNote("Please attach files under 3.5 MB in call chat.")
            return
          }
          const r = new FileReader()
          r.onload = () => {
            setChatAttachment({
              name: file.name,
              mime: file.type || "application/octet-stream",
              dataUrl: String(r.result || ""),
            })
          }
          r.readAsDataURL(file)
        }}
      />

      {/* Global Opus WebRTC Audio Output for ALL Connected Peers */}
      {Object.entries(remoteStreamsMap).map(([pid, st]) => (
        <RemoteStreamAudioPlayer key={pid} stream={st} />
      ))}

      {/* HOST MUTED YOUR MIC BANNER */}
      {wasMutedByHostBanner && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 px-4 w-full max-w-md flex justify-center"
          style={{ zIndex: 46 }}
        >
          <div className="rounded-2xl bg-amber-950/95 border border-amber-400/60 px-4 py-2 text-xs font-bold text-amber-200 shadow-2xl flex items-center gap-2">
            <VolumeX className="h-4 w-4 text-amber-300 shrink-0" />
            <span>Host muted your microphone. Tap the Mic button to unmute when ready.</span>
            <button
              type="button"
              onClick={() => setWasMutedByHostBanner(false)}
              className="ml-1 text-white/75 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* GUARANTEED MOBILE RECIPIENT CAMERA ACTIVATION PILL (If mobile Safari/Chrome deferred camera until user tap!) */}
      {isVideoOn && !hasLocalVideoTrack && (
        <div
          className="fixed top-18 left-1/2 -translate-x-1/2 px-4 w-full max-w-sm flex justify-center"
          style={{ zIndex: 45 }}
        >
          <button
            type="button"
            onClick={async () => {
              voicePlayerRef.current?.unlock()
              await acquireCameraAndMic(true, cameraFacing)
            }}
            style={{ color: "#FFFFFF" }}
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-300 px-4 py-3 text-sm font-extrabold shadow-2xl flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            <Video className="h-5 w-5 shrink-0" />
            <span>Tap to Turn On Your Camera</span>
          </button>
        </div>
      )}

      {/* SHARED DEVICE MATERIAL LIVE STAGE OVERLAY */}
      {activeSharedStage?.active && !isStageMinimized && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 w-[94vw] max-w-2xl rounded-2xl bg-[#0D171D]/95 border-2 border-emerald-400/60 shadow-2xl overflow-hidden">
          <div className="px-3.5 py-2 bg-[#13222A] border-b border-white/10 flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white truncate">
                  {activeSharedStage.file_name || activeSharedStage.title}
                </p>
                <p className="text-[10px] text-emerald-300 truncate">
                  Shared by {activeSharedStage.sharer_name}
                  {activeSharedStage.file_size_label ? ` · ${activeSharedStage.file_size_label}` : ""}
                  {activeSharedStage.recipient_scope === "selected" &&
                  activeSharedStage.recipient_names?.length
                    ? ` · To: ${activeSharedStage.recipient_names.join(", ")}`
                    : " · Shared with Everyone"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {activeSharedStage.frame_or_data_url && (
                <a
                  href={activeSharedStage.frame_or_data_url}
                  download={activeSharedStage.file_name || activeSharedStage.title || "material"}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-[11px] font-extrabold text-white no-underline flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setIsStageMinimized(true)}
                className="rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-[11px] font-bold text-white cursor-pointer"
              >
                Hide
              </button>
              {(activeSharedStage.sharer_user_id === localPeerUid || canModerateCall) && (
                <button
                  type="button"
                  onClick={handleStopSharedStage}
                  className="rounded-lg bg-rose-600/80 hover:bg-rose-600 px-2 py-1 text-[11px] font-bold text-white cursor-pointer"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
          <div className="p-3 max-h-[38vh] overflow-auto flex items-center justify-center bg-black/40">
            {activeSharedStage.mode === "screen" ? (
              <p className="text-xs text-emerald-200 py-4 font-semibold">
                🖥️ Live screen share active from {activeSharedStage.sharer_name}
              </p>
            ) : activeSharedStage.frame_or_data_url &&
              activeSharedStage.mime_type?.startsWith("image/") ? (
              <img
                src={activeSharedStage.frame_or_data_url}
                alt={activeSharedStage.file_name || "Shared material"}
                className="max-h-[34vh] rounded-xl object-contain"
              />
            ) : activeSharedStage.frame_or_data_url &&
              activeSharedStage.mime_type?.startsWith("video/") ? (
              <video
                src={activeSharedStage.frame_or_data_url}
                controls
                className="max-h-[34vh] rounded-xl"
              />
            ) : activeSharedStage.frame_or_data_url &&
              activeSharedStage.mime_type?.startsWith("audio/") ? (
              <audio
                src={activeSharedStage.frame_or_data_url}
                controls
                data-connectln-call-audio="true"
                className="w-full max-w-md"
              />
            ) : activeSharedStage.frame_or_data_url &&
              activeSharedStage.mime_type?.includes("pdf") ? (
              <iframe
                src={activeSharedStage.frame_or_data_url}
                title={activeSharedStage.file_name || "PDF Preview"}
                className="w-full h-[32vh] rounded-xl bg-white"
              />
            ) : (
              <div className="py-4 px-6 text-center space-y-2">
                <FileText className="h-10 w-10 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">
                  {activeSharedStage.file_name || activeSharedStage.title}
                </p>
                <p className="text-[11px] text-slate-300">
                  Ready on device stage — click Download above to open or save this material.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSharedStage?.active && isStageMinimized && (
        <button
          type="button"
          onClick={() => setIsStageMinimized(false)}
          className="fixed top-16 left-4 z-30 rounded-full bg-emerald-700/90 hover:bg-emerald-600 border border-emerald-400/50 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Show Shared Material</span>
        </button>
      )}

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
            <div
              className={`relative rounded-2xl overflow-hidden border border-emerald-500/40 min-h-[200px] flex items-center justify-center ${
                selectedBgId === "custom-image" ? "bg-[#111B21]/60" : activeBgTheme.stageClass
              }`}
              style={
                selectedBgId === "custom-image" && customBgDataUrl
                  ? {
                      backgroundImage: `url(${customBgDataUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {isVideoOn && hasLocalVideoTrack ? (
                <video
                  ref={gridLocalVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: cameraFacing === "user" ? "scaleX(-1)" : "none" }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2.5 p-3 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center text-xl font-extrabold shadow-lg border-2 border-emerald-400/50">
                    {callerName.slice(0, 2).toUpperCase()}
                  </div>
                  {isVideoOn && !hasLocalVideoTrack && (
                    <button
                      type="button"
                      onClick={() => acquireCameraAndMic(true, cameraFacing)}
                      style={{ color: "#FFFFFF" }}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Turn On Camera</span>
                    </button>
                  )}
                </div>
              )}
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
                {isLocalHost && (
                  <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                    👑 Host
                  </span>
                )}
                {!isLocalHost && isLocalCoHost && (
                  <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                    🛡️ Co-Host
                  </span>
                )}
                {selectedBgId !== "none" && (
                  <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-emerald-200 border border-white/15">
                    🎨 {selectedBgId === "custom-image" ? "Custom BG" : activeBgTheme.badge}
                  </span>
                )}
              </div>
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
              const peerBg = CALL_BACKGROUND_THEMES.find((b) => b.id === rp.virtualBgId)
              return (
                <div
                  key={rp.userId}
                  className={`relative rounded-2xl overflow-hidden border border-emerald-500/50 min-h-[200px] flex items-center justify-center ${
                    peerBg ? peerBg.stageClass : "bg-[#111B21]"
                  }`}
                >
                  {!st && rp.isVideoOn && rp.liveFrame && (
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

                  {/* Co-Host / Host Controls & Direct Chat on Each Tile */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {rp.isCoHost && (
                        <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                          🛡️ Co-Host
                        </span>
                      )}
                      {rp.hostMuted && (
                        <span className="rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-extrabold text-white">
                          🔇 Host Muted
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          closeAllCallDrawers()
                          setChatRecipientScope("individual")
                          setSelectedChatRecipientKeys([rp.userId])
                          setShowChatDrawer(true)
                        }}
                        className="h-7 px-2 rounded-full bg-black/65 hover:bg-emerald-600 text-[10px] font-bold text-white cursor-pointer border border-white/15"
                        title={`Chat privately with ${rp.name}`}
                      >
                        💬
                      </button>
                      {canModerateCall && (
                        <button
                          type="button"
                          disabled={isModerating}
                          onClick={() =>
                            handleModerateMember({
                              targetUserId: rp.userId,
                              targetName: rp.name,
                              targetPhone: rp.phone,
                              targetEmail: rp.email,
                              subAction: rp.isMuted ? "unmute_member" : "mute_member",
                            })
                          }
                          className={`h-7 px-2 rounded-full text-[10px] font-bold cursor-pointer border border-white/15 ${
                            rp.isMuted
                              ? "bg-rose-600 hover:bg-emerald-600 text-white"
                              : "bg-black/65 hover:bg-rose-600 text-white"
                          }`}
                          title={rp.isMuted ? `Unmute ${rp.name}` : `Mute ${rp.name}`}
                        >
                          {rp.isMuted ? "🎙️ Unmute" : "🔇 Mute"}
                        </button>
                      )}
                      {isLocalHost && (
                        <button
                          type="button"
                          disabled={isModerating}
                          onClick={() =>
                            handleModerateMember({
                              targetUserId: rp.userId,
                              targetName: rp.name,
                              targetPhone: rp.phone,
                              targetEmail: rp.email,
                              subAction: "toggle_cohost",
                              isCohost: !rp.isCoHost,
                            })
                          }
                          className={`h-7 px-2 rounded-full text-[10px] font-bold cursor-pointer border border-white/15 ${
                            rp.isCoHost
                              ? "bg-amber-500 text-slate-950"
                              : "bg-black/65 hover:bg-amber-500 hover:text-slate-950 text-white"
                          }`}
                          title={rp.isCoHost ? "Remove Co-Host" : "Make Co-Host"}
                        >
                          👑
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between bg-black/65 px-2.5 py-1 rounded-lg">
                    <span className="text-xs font-bold truncate">{rp.name}</span>
                    <span className="text-[11px] text-emerald-300">
                      {rp.isMuted ? "🔇 Muted" : "🟢 Live"}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Invited ConnectLn Internet Participant Tiles (+ User-Borne SIM/SMS Handoff) */}
            {cellLegs.map((leg) => {
              const legDigits = (leg.phone || "").replace(/[^\d]/g, "")
              const legCamLink =
                joinLinkUrl ||
                `${
                  typeof window !== "undefined" ? window.location.origin : "https://conectln.com"
                }/connectin?waCall=${encodeURIComponent(callId)}&mode=${
                  isVideoOn ? "video" : "audio"
                }&invitedName=${encodeURIComponent(leg.name)}&autoAnswer=1`
              const legInviteBody = `${
                isVideoOn ? "📹" : "📞"
              } ${callerName} is calling you on ConnectLn (Free Internet ${
                isVideoOn ? "Video" : "Voice"
              } Call)! Tap to join live: ${legCamLink}`
              const legSmsHref = legDigits
                ? `sms:+${legDigits}?&body=${encodeURIComponent(legInviteBody)}`
                : ""
              const legWaHref = legDigits
                ? `https://wa.me/${legDigits}?text=${encodeURIComponent(legInviteBody)}`
                : ""
              const legTelHref = "" // Internet-only: no carrier/SIM dialing

              return (
                <div
                  key={leg.id}
                  className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F2922] to-[#111B21] border border-emerald-400/50 min-h-[200px] flex flex-col items-center justify-center p-4 text-center"
                >
                  <button
                    type="button"
                    onClick={() => removeCellLegParticipant(leg, true)}
                    className="absolute top-2.5 right-2.5 z-20 h-7 w-7 rounded-full bg-black/50 hover:bg-rose-600 text-white flex items-center justify-center text-xs cursor-pointer"
                    title="Remove from call"
                  >
                    ✕
                  </button>
                  <div className="relative mb-2">
                    {(leg.status === "ringing" || leg.status === "invited") && (
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
                      className="relative w-15 h-15 rounded-full object-cover border-2 border-emerald-400"
                    />
                  </div>
                  <p className="text-sm font-extrabold text-white truncate max-w-full">{leg.name}</p>
                  {leg.phone && (
                    <p className="text-xs font-mono text-emerald-300">
                      {prettyClientPhone(leg.phone)}
                    </p>
                  )}
                  <span
                    className={`mt-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                      leg.status === "in-progress"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                        : leg.status === "unanswered" || leg.reachable === false
                        ? "bg-rose-500/20 text-rose-200 border border-rose-400/40"
                        : "bg-amber-500/20 text-amber-200 border border-amber-400/40"
                    }`}
                  >
                    {leg.status === "in-progress" && "🟢 Connected (Free Internet)"}
                    {(leg.status === "ringing" || leg.status === "dialing" || leg.status === "invited") &&
                      (leg.reachable === false
                        ? "⚠️ Not on ConnectLn — send them the free call link"
                        : "🔔 Ringing on ConnectLn Internet")}
                    {leg.status === "unanswered" && "🔔 Waiting to Join"}
                  </span>

                  <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 z-20">
                    <button
                      type="button"
                      disabled={isAddingPerson}
                      onClick={() =>
                        addPersonToActiveCall({
                          targetPhone: leg.phone || undefined,
                          targetName: leg.name,
                          targetEmail: leg.email || undefined,
                          targetAvatar: leg.avatar || undefined,
                        })
                      }
                      style={{ color: "#FFFFFF" }}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-[10.5px] font-extrabold cursor-pointer"
                      title="Ring again over ConnectLn Internet ($0.00)"
                    >
                      🔄 Ring Again
                    </button>
                    {legSmsHref && (
                      <a
                        href={legSmsHref}
                        className="rounded-lg bg-sky-700 hover:bg-sky-600 px-2.5 py-1 text-[10.5px] font-extrabold text-white no-underline"
                        title="Send free internet call link using your own phone SMS"
                      >
                        💬 My SMS Link
                      </a>
                    )}
                    {legWaHref && (
                      <a
                        href={legWaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-emerald-800 hover:bg-emerald-700 px-2.5 py-1 text-[10.5px] font-extrabold text-white no-underline"
                        title="Invite via WhatsApp ($0.00)"
                      >
                        🟢 WhatsApp
                      </a>
                    )}
                    {legTelHref && (
                      <a
                        href={legTelHref}
                        className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] px-2.5 py-1 text-[10.5px] font-extrabold text-white no-underline"
                        title="Dial via your own device SIM plan ($0 ConnectLn fee)"
                      >
                        📞 My SIM
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* STAGE B: CLASSIC 1-ON-1 FULL-SCREEN WHATSAPP INTERNET CALL VIEW */
        <div
          className={`absolute inset-0 ${
            selectedBgId === "custom-image" ? "" : activeBgTheme.stageClass
          }`}
          style={activeBgBackgroundStyle}
        >
          {!primaryStream && callStatus === "connected" && primaryPeer?.isVideoOn && primaryPeer.liveFrame && (
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                <span>{primaryName}</span>
                {primaryPeer?.isCoHost && (
                  <span className="rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-extrabold text-slate-950">
                    🛡️ Co-Host
                  </span>
                )}
              </h2>
              {recipientPhone && (
                <p className="mt-1 text-sm font-mono text-emerald-300 font-semibold">
                  {prettyClientPhone(recipientPhone)}
                </p>
              )}
              <p className="mt-2 text-sm text-slate-300 font-medium">
                {callStatus === "calling" && "Calling over ConnectLn Internet (Free Wi-Fi / Data)..."}
                {callStatus === "ringing" && "Ringing over ConnectLn Internet (Free)..."}
                {callStatus === "connected" && `${mins}:${secs} · Connected (Free Internet E2EE)`}
                {callStatus === "ended" && "Call Ended"}
              </p>
              {pushBannerNote && (
                <p className="mt-3 max-w-sm text-xs text-emerald-200/90 bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-3.5 py-2">
                  {pushBannerNote}
                </p>
              )}

              {/* User-Borne SIM & Native SMS/WhatsApp Free Link Handoff ($0.00 ConnectLn Cost) */}
              {!isIncomingAnswer && remoteWebRtcPeers.length === 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-lg">
                  {nativeSmsHref && (
                    <a
                      href={nativeSmsHref}
                      className="rounded-xl bg-sky-700 hover:bg-sky-600 px-3.5 py-2 text-xs font-extrabold text-white no-underline shadow-md"
                      title="Sends the free internet call link from your own phone's SMS app"
                    >
                      💬 Send Free Call Link (My SMS)
                    </a>
                  )}
                  {whatsappShareUrl && (
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-emerald-700 hover:bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white no-underline shadow-md"
                    >
                      🟢 Invite on WhatsApp
                    </a>
                  )}
                  {joinLinkUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(joinLinkUrl).catch(() => {})
                        setPushBannerNote("✓ Copied free internet call link! Paste anywhere for instant Wi-Fi/Data calling.")
                      }}
                      className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 px-3.5 py-2 text-xs font-extrabold text-white cursor-pointer shadow-md flex items-center gap-1"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Call Link</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOP WHATSAPP E2EE HEADER WITH `👑 HOST / MEMBERS` & `➕ ADD PERSON` BUTTONS */}
      <div className="fixed top-0 left-0 right-0 z-30 pt-3.5 px-4 sm:px-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
            <Lock className="h-3 w-3 shrink-0" />
            <span className="truncate">
              End-to-end encrypted · {totalRemoteCount + 1} in call
            </span>
            {isLocalHost && (
              <span className="ml-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[9.5px] font-extrabold text-slate-950">
                👑 Host
              </span>
            )}
            {!isLocalHost && isLocalCoHost && (
              <span className="ml-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9.5px] font-extrabold text-slate-950">
                🛡️ Co-Host
              </span>
            )}
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
              const next = !showHostMembersDrawer
              closeAllCallDrawers()
              setShowHostMembersDrawer(next)
            }}
            style={{ color: "#FFFFFF" }}
            className="rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer"
            title="Host Controls: Mute members & grant Co-Host"
          >
            <Crown className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden sm:inline">Host &amp; Members</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !showAddPeopleDrawer
              closeAllCallDrawers()
              setShowAddPeopleDrawer(next)
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
      {!isGroupGridMode && isVideoOn && hasLocalVideoTrack && (
        <div
          className="fixed top-16 right-4 sm:right-6 z-30 w-28 h-40 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-white/30 bg-black shadow-2xl"
          style={{ zIndex: 35 }}
        >
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

      {/* SLIDE-OVER `🎨 BACKGROUND & RINGTONE` DRAWER */}
      {showBackgroundDrawer && (
        <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[95vw] max-w-lg rounded-3xl bg-[#111B21]/98 border-2 border-emerald-500/50 p-4 shadow-2xl max-h-[70vh] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">
                Call Background &amp; Ringtone Studio
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                stopPreviewConnectLnRingtone()
                setShowBackgroundDrawer(false)
              }}
              className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-emerald-300">
                1. Choose Call Background
              </p>
              <button
                type="button"
                onClick={() => bgFileInputRef.current?.click()}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-[11px] font-extrabold text-white cursor-pointer"
              >
                🖼️ Upload Photo From Device
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CALL_BACKGROUND_THEMES.map((bg) => {
                const active = selectedBgId === bg.id
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setSelectedBgId(bg.id)}
                    className={`rounded-xl p-2 text-left border transition-all cursor-pointer ${
                      active
                        ? "border-emerald-400 ring-2 ring-emerald-400/50 bg-white/10"
                        : "border-white/15 bg-black/30 hover:bg-white/10"
                    }`}
                  >
                    <div
                      className="h-10 w-full rounded-lg mb-1.5 border border-white/15"
                      style={{ background: bg.previewGradient }}
                    />
                    <p className="text-[11px] font-bold text-white truncate">{bg.label}</p>
                  </button>
                )
              })}
              {customBgDataUrl && (
                <button
                  type="button"
                  onClick={() => setSelectedBgId("custom-image")}
                  className={`rounded-xl p-2 text-left border transition-all cursor-pointer ${
                    selectedBgId === "custom-image"
                      ? "border-emerald-400 ring-2 ring-emerald-400/50 bg-white/10"
                      : "border-white/15 bg-black/30 hover:bg-white/10"
                  }`}
                >
                  <img
                    src={customBgDataUrl}
                    alt="Custom background"
                    className="h-10 w-full rounded-lg mb-1.5 object-cover"
                  />
                  <p className="text-[11px] font-bold text-emerald-300 truncate">My Device Photo</p>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5" />
                <span>2. Select Call Ringtone</span>
              </p>
              <button
                type="button"
                onClick={() => ringtoneFileInputRef.current?.click()}
                className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] px-2.5 py-1 text-[11px] font-extrabold text-white cursor-pointer"
              >
                🎵 Use Audio From Device
              </button>
            </div>
            <div className="space-y-1.5">
              {CONNECTLN_RINGTONE_PRESETS.map((tone) => {
                const isSelected = selectedRingtoneId === tone.id
                return (
                  <div
                    key={tone.id}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 border ${
                      isSelected
                        ? "bg-emerald-950/60 border-emerald-400"
                        : "bg-[#1F2C34]/70 border-white/10"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (tone.id === "device-custom" && !customRingtoneName) {
                          ringtoneFileInputRef.current?.click()
                          return
                        }
                        setSelectedConnectLnRingtoneId(tone.id)
                        setSelectedRingtoneId(tone.id)
                        previewConnectLnRingtone(tone.id, 3800)
                      }}
                      className="flex-1 text-left cursor-pointer min-w-0"
                    >
                      <p className="text-xs font-bold text-white truncate">
                        {isSelected ? "✓ " : ""}
                        {tone.label}
                        {tone.id === "device-custom" && customRingtoneName
                          ? ` (${customRingtoneName})`
                          : ""}
                      </p>
                      <p className="text-[10.5px] text-slate-300 truncate">{tone.description}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => previewConnectLnRingtone(tone.id, 3800)}
                      className="rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[11px] font-bold text-white shrink-0 cursor-pointer"
                    >
                      ▶️ Play
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER `💬 IN-CALL CHAT` DRAWER (EVERYONE, INDIVIDUAL, OR SELECTED MEMBERS) */}
      {showChatDrawer && (
        <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[95vw] max-w-lg rounded-3xl bg-[#111B21]/98 border-2 border-emerald-500/50 p-4 shadow-2xl max-h-[72vh] flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">
                In-Call Chat (Team &amp; Direct)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowChatDrawer(false)}
              className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Recipient Targeting Selector */}
          <div className="rounded-2xl bg-[#0B141A] border border-white/15 p-2.5 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-300 mr-1">Send To:</span>
              {(
                [
                  { id: "everyone", label: "🌐 Everyone (Whole Team)" },
                  { id: "individual", label: "👤 Individual Member" },
                  { id: "selected", label: "🎯 Selected Members" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setChatRecipientScope(opt.id)
                    if (
                      opt.id === "individual" &&
                      selectedChatRecipientKeys.length !== 1 &&
                      allCallTargetMembers[0]
                    ) {
                      setSelectedChatRecipientKeys([allCallTargetMembers[0].key])
                    }
                  }}
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold cursor-pointer ${
                    chatRecipientScope === opt.id
                      ? "bg-emerald-600 text-white"
                      : "bg-[#1F2C34] text-slate-300 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {chatRecipientScope !== "everyone" && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allCallTargetMembers.length === 0 ? (
                  <span className="text-[11px] text-amber-300">
                    Waiting for members to join this call to target directly.
                  </span>
                ) : (
                  allCallTargetMembers.map((m) => {
                    const isChecked = selectedChatRecipientKeys.includes(m.key)
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          if (chatRecipientScope === "individual") {
                            setSelectedChatRecipientKeys([m.key])
                          } else {
                            setSelectedChatRecipientKeys((prev) =>
                              prev.includes(m.key)
                                ? prev.filter((k) => k !== m.key)
                                : [...prev, m.key]
                            )
                          }
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border cursor-pointer flex items-center gap-1 ${
                          isChecked
                            ? "bg-emerald-700 border-emerald-400 text-white"
                            : "bg-[#1F2C34] border-white/10 text-slate-300"
                        }`}
                      >
                        <span>{isChecked ? "☑️" : "⬜"}</span>
                        <span>{m.name}</span>
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Messages List */}
          <div className="flex-1 min-h-[160px] max-h-60 overflow-y-auto space-y-2 pr-1">
            {visibleChatMessages.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">
                Send a message or file to Everyone, one person, or selected members.
              </p>
            ) : (
              visibleChatMessages.map((m) => {
                const isMine = m.sender_id === localPeerUid
                return (
                  <div
                    key={m.id}
                    className={`rounded-2xl px-3 py-2 max-w-[88%] ${
                      isMine
                        ? "ml-auto bg-emerald-800/80 border border-emerald-500/40"
                        : "bg-[#1F2C34] border border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[11px] font-extrabold text-emerald-300">
                        {isMine ? "You" : m.sender_name}
                      </span>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-black/35 text-slate-200">
                        {!m.recipient_scope || m.recipient_scope === "everyone"
                          ? "🌐 Everyone"
                          : m.recipient_names?.length
                          ? `🔒 To ${m.recipient_names.join(", ")}`
                          : "🔒 Private"}
                      </span>
                    </div>
                    {m.text && <p className="text-xs text-white whitespace-pre-wrap">{m.text}</p>}
                    {m.attachment_name && m.attachment_data_url && (
                      <a
                        href={m.attachment_data_url}
                        download={m.attachment_name}
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-black/40 hover:bg-black/60 px-2.5 py-1 text-[11px] font-bold text-emerald-200 no-underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{m.attachment_name}</span>
                      </a>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {chatAttachment && (
            <div className="flex items-center justify-between rounded-xl bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 text-xs">
              <span className="truncate text-emerald-200 font-semibold">
                📎 {chatAttachment.name}
              </span>
              <button
                type="button"
                onClick={() => setChatAttachment(null)}
                className="text-white/75 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSendChatMessage} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => chatFileInputRef.current?.click()}
              className="h-9 w-9 rounded-xl bg-[#1F2C34] hover:bg-[#2A3942] border border-white/15 flex items-center justify-center text-emerald-300 cursor-pointer shrink-0"
              title="Attach material from device"
            >
              <FolderUp className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                chatRecipientScope === "everyone"
                  ? "Message everyone in this call..."
                  : "Message selected recipient(s) privately..."
              }
              className="flex-1 rounded-xl bg-[#1F2C34] border border-white/15 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={isSendingChat}
              style={{ color: "#FFFFFF" }}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* SLIDE-OVER `📁 SHARE MATERIAL FROM DEVICE` DRAWER */}
      {showMaterialDrawer && (
        <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[95vw] max-w-lg rounded-3xl bg-[#111B21]/98 border-2 border-emerald-500/50 p-4 shadow-2xl max-h-[70vh] overflow-y-auto space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <FolderUp className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">
                Share Material From Your Device
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowMaterialDrawer(false)}
              className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="rounded-2xl bg-[#0B141A] border border-white/15 p-3 space-y-2">
            <p className="text-[11px] font-bold text-slate-300">Who should receive this material?</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setMaterialRecipientScope("everyone")}
                className={`rounded-full px-3 py-1 text-[11px] font-extrabold cursor-pointer ${
                  materialRecipientScope === "everyone"
                    ? "bg-emerald-600 text-white"
                    : "bg-[#1F2C34] text-slate-300"
                }`}
              >
                🌐 Everyone in Call (Live Stage)
              </button>
              <button
                type="button"
                onClick={() => setMaterialRecipientScope("selected")}
                className={`rounded-full px-3 py-1 text-[11px] font-extrabold cursor-pointer ${
                  materialRecipientScope === "selected"
                    ? "bg-emerald-600 text-white"
                    : "bg-[#1F2C34] text-slate-300"
                }`}
              >
                🎯 Selected Members Only
              </button>
            </div>
            {materialRecipientScope === "selected" && allCallTargetMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allCallTargetMembers.map((m) => {
                  const isChecked = selectedMaterialRecipientKeys.includes(m.key)
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() =>
                        setSelectedMaterialRecipientKeys((prev) =>
                          prev.includes(m.key)
                            ? prev.filter((k) => k !== m.key)
                            : [...prev, m.key]
                        )
                      }
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border cursor-pointer ${
                        isChecked
                          ? "bg-emerald-700 border-emerald-400 text-white"
                          : "bg-[#1F2C34] border-white/10 text-slate-300"
                      }`}
                    >
                      {isChecked ? "☑️ " : "⬜ "}
                      {m.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => materialFileInputRef.current?.click()}
              style={{ color: "#FFFFFF" }}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 p-3.5 text-left shadow-lg cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-2 font-extrabold text-xs">
                <FolderUp className="h-4 w-4 shrink-0" />
                <span>Choose File From Device</span>
              </div>
              <p className="text-[10.5px] text-emerald-100">
                PDFs, Word/Excel docs, photos, diagrams, audio or video clips
              </p>
            </button>

            <button
              type="button"
              onClick={handleToggleDeviceScreenShare}
              style={{ color: "#FFFFFF" }}
              className={`rounded-2xl p-3.5 text-left shadow-lg cursor-pointer space-y-1 border ${
                isLocalScreenSharing
                  ? "bg-rose-600 hover:bg-rose-500 border-rose-300"
                  : "bg-[#1F2C34] hover:bg-[#2A3942] border-white/20"
              }`}
            >
              <div className="flex items-center gap-2 font-extrabold text-xs">
                <MonitorUp className="h-4 w-4 shrink-0" />
                <span>
                  {isLocalScreenSharing ? "Stop Live Screen Share" : "Share Live Screen"}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-300">
                Present slides, browser window, or live desktop application
              </p>
            </button>
          </div>

          {materialStatusNote && (
            <p className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-3 py-2">
              {materialStatusNote}
            </p>
          )}
        </div>
      )}

      {/* SLIDE-OVER `👑 HOST & MEMBERS (MUTE & CO-HOST PERMISSIONS)` DRAWER */}
      {showHostMembersDrawer && (
        <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[95vw] max-w-lg rounded-3xl bg-[#111B21]/98 border-2 border-amber-400/50 p-4 shadow-2xl max-h-[70vh] flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-extrabold text-white">
                Call Members, Mute &amp; Co-Host Permissions
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowHostMembersDrawer(false)}
              className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#0B141A] border border-white/10 px-3 py-2">
            <div className="text-xs">
              <p className="font-extrabold text-white">
                {isLocalHost
                  ? "👑 You are the Host"
                  : isLocalCoHost
                  ? "🛡️ You are a Co-Host"
                  : "Participant View"}
              </p>
              <p className="text-[10.5px] text-slate-300">
                {isLocalHost
                  ? "Mute any member, Mute All, or promote members to Co-Host."
                  : isLocalCoHost
                  ? "Host granted you Co-Host permission to mute & manage members."
                  : "Ask the Host to grant you Co-Host permission for moderation."}
              </p>
            </div>
            {canModerateCall && (
              <button
                type="button"
                disabled={isModerating}
                onClick={() => handleModerateMember({ subAction: "mute_all" })}
                style={{ color: "#FFFFFF" }}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-extrabold cursor-pointer shrink-0 flex items-center gap-1 disabled:opacity-50"
              >
                <VolumeX className="h-3.5 w-3.5" />
                <span>Mute All Members</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-60 pr-1">
            {/* Local Self Row */}
            <div className="flex items-center justify-between gap-2 rounded-xl bg-[#1F2C34] px-3 py-2 border border-white/10">
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white truncate">
                  {callerName} (You)
                </p>
                <p className="text-[10.5px] text-emerald-300">
                  {isLocalHost ? "👑 Host" : isLocalCoHost ? "🛡️ Co-Host" : "Member"} ·{" "}
                  {isMicMuted ? "🔇 Muted" : "🎙️ Unmuted"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleMute}
                className="rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer"
              >
                {isMicMuted ? "Unmute Self" : "Mute Self"}
              </button>
            </div>

            {allCallTargetMembers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No other members connected yet. Use Add Person to bring team members in.
              </p>
            ) : (
              allCallTargetMembers.map((m) => (
                <div
                  key={m.key}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#1F2C34]/80 px-3 py-2 border border-white/10"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                      <span>{m.name}</span>
                      {m.isCoHost && (
                        <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9.5px] font-extrabold text-slate-950">
                          Co-Host
                        </span>
                      )}
                    </p>
                    <p className="text-[10.5px] text-slate-300">
                      {m.phone ? prettyClientPhone(m.phone) : "In Call"} ·{" "}
                      {m.isMuted ? "🔇 Muted" : "🎙️ Live"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        closeAllCallDrawers()
                        setChatRecipientScope("individual")
                        setSelectedChatRecipientKeys([m.key])
                        setShowChatDrawer(true)
                      }}
                      className="rounded-lg bg-sky-700 hover:bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer"
                    >
                      💬 Chat
                    </button>
                    {canModerateCall && (
                      <button
                        type="button"
                        disabled={isModerating}
                        onClick={() =>
                          handleModerateMember({
                            targetUserId: m.userId,
                            targetName: m.name,
                            targetPhone: m.phone,
                            targetEmail: m.email,
                            subAction: m.isMuted ? "unmute_member" : "mute_member",
                          })
                        }
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold cursor-pointer flex items-center gap-1 ${
                          m.isMuted
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-rose-600 hover:bg-rose-500 text-white"
                        }`}
                      >
                        {m.isMuted ? (
                          <>
                            <Volume2 className="h-3 w-3" />
                            <span>Unmute</span>
                          </>
                        ) : (
                          <>
                            <VolumeX className="h-3 w-3" />
                            <span>Mute</span>
                          </>
                        )}
                      </button>
                    )}
                    {isLocalHost && (
                      <button
                        type="button"
                        disabled={isModerating}
                        onClick={() =>
                          handleModerateMember({
                            targetUserId: m.userId,
                            targetName: m.name,
                            targetPhone: m.phone,
                            targetEmail: m.email,
                            subAction: "toggle_cohost",
                            isCohost: !m.isCoHost,
                          })
                        }
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold cursor-pointer ${
                          m.isCoHost
                            ? "bg-amber-500 text-slate-950"
                            : "bg-white/15 hover:bg-amber-500 hover:text-slate-950 text-white"
                        }`}
                      >
                        {m.isCoHost ? "✓ Co-Host" : "👑 Make Co-Host"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
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
              })
            }}
            className="flex flex-wrap items-center gap-1.5 bg-[#0B141A] border border-white/15 rounded-2xl p-2"
          >
            <select
              value={addCountryCode}
              onChange={(e) => setAddCountryCode(e.target.value)}
              className="max-w-[165px] rounded-xl bg-[#1F2C34] border border-white/15 px-2 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              {COUNTRY_DIAL_CODES.map((c) => (
                <option key={`add-${c.iso}-${c.code}`} value={c.code}>
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

      {/* OPTIONAL INVITE / USER-BORNE CARRIER SIM HANDOFF DRAWER */}
      {showShareSheet && (
        <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[92vw] max-w-md rounded-2xl bg-[#111B21]/95 border border-emerald-500/40 p-3.5 shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-emerald-300">
              Free Internet Call Link
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
                💬 Send via My SMS
              </a>
            )}
            {joinLinkUrl && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(joinLinkUrl).catch(() => {})
                  setPushBannerNote("✓ Copied free internet call link!")
                  setShowShareSheet(false)
                }}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 px-3 py-2 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Link</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM WHATSAPP FLOATING CALL CONTROLS PILL */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pb-5 pt-4 px-2 sm:px-4 bg-gradient-to-t from-black/85 to-transparent flex items-center justify-center">
        <div className="rounded-full bg-[#1F2C34]/95 border border-white/15 px-3 sm:px-4 py-2 shadow-2xl flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto max-w-[96vw]">
          <button
            type="button"
            onClick={() => {
              const next = !showAddPeopleDrawer
              closeAllCallDrawers()
              setShowAddPeopleDrawer(next)
            }}
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              showAddPeopleDrawer
                ? "bg-emerald-600 text-white"
                : "bg-emerald-600/25 hover:bg-emerald-600/45 text-emerald-300 border border-emerald-400/40"
            }`}
            title="Add Person to Call"
          >
            <UserPlus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !showBackgroundDrawer
              closeAllCallDrawers()
              setShowBackgroundDrawer(next)
            }}
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              showBackgroundDrawer
                ? "bg-emerald-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title="Change Call Background & Ringtone"
          >
            <Palette className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !showChatDrawer
              closeAllCallDrawers()
              setShowChatDrawer(next)
            }}
            className={`relative h-10 w-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              showChatDrawer
                ? "bg-emerald-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title="In-Call Chat (Everyone, Individual, or Selected)"
          >
            <MessageSquare className="h-4 w-4" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-[9px] font-extrabold text-white flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !showMaterialDrawer
              closeAllCallDrawers()
              setShowMaterialDrawer(next)
            }}
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              showMaterialDrawer || isLocalScreenSharing
                ? "bg-emerald-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title="Share Material From Device or Screen"
          >
            <FolderUp className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !showHostMembersDrawer
              closeAllCallDrawers()
              setShowHostMembersDrawer(next)
            }}
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              showHostMembersDrawer
                ? "bg-amber-500 text-slate-950"
                : "bg-white/10 hover:bg-white/20 text-amber-300"
            }`}
            title="Host Controls: Mute Members & Co-Host Permissions"
          >
            <Crown className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleFlipCamera}
            className="h-10 w-10 shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
            title="Flip Front / Rear Camera"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleVideo}
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              isVideoOn ? "bg-white/15 hover:bg-white/25 text-white" : "bg-white text-slate-950"
            }`}
            title={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
          >
            {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              isMicMuted ? "bg-white text-slate-950" : "bg-white/15 hover:bg-white/25 text-white"
            }`}
            title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !showShareSheet
              closeAllCallDrawers()
              setShowShareSheet(next)
            }}
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              showShareSheet ? "bg-emerald-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title="Share Group Call Link"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleHangup}
            style={{ color: "#FFFFFF" }}
            className="h-10 w-12 shrink-0 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-95"
            title="End Call for All"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
