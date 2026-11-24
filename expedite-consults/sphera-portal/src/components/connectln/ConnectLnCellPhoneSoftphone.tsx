"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Phone,
  PhoneCall,
  Video,
  MessageSquare,
  X,
  CheckCircle2,
  Smartphone,
  QrCode,
  Copy,
  Share2,
  Globe,
} from "lucide-react"
import {
  GLOBAL_COUNTRY_DIAL_CODES,
  looksLikeInternationalPhone,
  normalizeInternationalPhone,
  formatInternationalPhonePretty,
  buildGlobalE164Phone,
} from "@/lib/connectin-international-phones"
import { startOutgoingCallerRingbackTone } from "@/lib/connectin-background-ring"

const LOCAL_PHONEBOOK_KEY = "connectln_contact_phonebook_v1"

export function looksLikeClientPhone(raw?: string | null): boolean {
  return looksLikeInternationalPhone(raw)
}

export function normalizeClientPhone(raw: string, defaultCountryCode = "+1"): string {
  return normalizeInternationalPhone(raw, defaultCountryCode)
}

export function prettyClientPhone(raw: string): string {
  return formatInternationalPhonePretty(raw)
}

function makeLocalContactKey(raw?: string): string {
  return String(raw || "")
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export function getSavedContactPhoneLocal(name?: string, email?: string): string {
  if (typeof window === "undefined") return ""
  if (looksLikeClientPhone(name)) return normalizeClientPhone(name!)
  try {
    const raw = window.localStorage.getItem(LOCAL_PHONEBOOK_KEY)
    const map: Record<string, string> = raw ? JSON.parse(raw) : {}
    const ek = makeLocalContactKey(email)
    const nk = makeLocalContactKey(name)
    if (ek && map[`email_${ek}`]) return map[`email_${ek}`]
    if (nk && map[`name_${nk}`]) return map[`name_${nk}`]
  } catch {}
  return ""
}

export function saveContactPhoneLocal(phone: string, name?: string, email?: string) {
  if (typeof window === "undefined") return
  const norm = normalizeClientPhone(phone)
  if (!looksLikeClientPhone(norm)) return
  try {
    const raw = window.localStorage.getItem(LOCAL_PHONEBOOK_KEY)
    const map: Record<string, string> = raw ? JSON.parse(raw) : {}
    const ek = makeLocalContactKey(email)
    const nk = makeLocalContactKey(name)
    if (ek) map[`email_${ek}`] = norm
    if (nk) map[`name_${nk}`] = norm
    window.localStorage.setItem(LOCAL_PHONEBOOK_KEY, JSON.stringify(map))
  } catch {}
}

export interface ConnectLnCellPhoneSoftphoneModalProps {
  open: boolean
  onClose: () => void
  targetLabel: string
  targetPhone?: string
  targetEmail?: string
  targetAvatar?: string
  callerName?: string
  callerEmail?: string
  callerAvatar?: string
  roomJoinUrl?: string
  onUpgradeToVideoHuddle?: (targetLabel: string) => void
}

/**
 * 100% Internet Call & User-Borne SIM/SMS Handoff Console ($0.00 Twilio Voice / SMS Cost).
 * - Rings registered ConnectLn members free over Wi-Fi / 4G / 5G (WebRTC + Web Push).
 * - Lets callers send a Free Internet Call Link via their own SMS (`sms:`) or WhatsApp (`wa.me`),
 *   or dial via their own mobile SIM plan (`tel:`) so ConnectLn bears $0.00 carrier charges.
 */
export function ConnectLnCellPhoneSoftphoneModal({
  open,
  onClose,
  targetLabel,
  targetPhone,
  targetEmail,
  targetAvatar,
  callerName = "ConnectLn Member",
  callerEmail,
  callerAvatar,
  roomJoinUrl,
  onUpgradeToVideoHuddle,
}: ConnectLnCellPhoneSoftphoneModalProps) {
  const [softphoneCountryCode, setSoftphoneCountryCode] = useState<string>("+1")
  const [phoneInput, setPhoneInput] = useState<string>("")
  const [resolvedPhone, setResolvedPhone] = useState<string>("")
  const [displayName, setDisplayName] = useState<string>(targetLabel || "ConnectLn Call")
  const [statusNote, setStatusNote] = useState<string>("")
  const [isRingingInternet, setIsRingingInternet] = useState<boolean>(false)
  const [callLinkUrl, setCallLinkUrl] = useState<string>("")

  useEffect(() => {
    if (!open || typeof window === "undefined") return
    ;(window as any).__connectlnOpenCallModalCount =
      Number((window as any).__connectlnOpenCallModalCount || 0) + 1
    window.dispatchEvent(new Event("connectln_call_modal_change"))
    return () => {
      ;(window as any).__connectlnOpenCallModalCount = Math.max(
        0,
        Number((window as any).__connectlnOpenCallModalCount || 1) - 1
      )
      window.dispatchEvent(new Event("connectln_call_modal_change"))
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setStatusNote("")
      return
    }
    setDisplayName(
      looksLikeClientPhone(targetLabel) ? prettyClientPhone(targetLabel) : targetLabel || "ConnectLn Call"
    )
    const origin = typeof window !== "undefined" ? window.location.origin : "https://conectln.com"
    const generatedRoom =
      roomJoinUrl ||
      `${origin}/connectin?waCall=${encodeURIComponent(
        `wa_${Date.now().toString(36)}`
      )}&mode=video&callerName=${encodeURIComponent(callerName)}&autoAnswer=1`
    setCallLinkUrl(generatedRoom)

    const immediate =
      (looksLikeClientPhone(targetPhone) && normalizeClientPhone(targetPhone!)) ||
      (looksLikeClientPhone(targetLabel) && normalizeClientPhone(targetLabel)) ||
      getSavedContactPhoneLocal(targetLabel, targetEmail)

    if (immediate) {
      setResolvedPhone(immediate)
      setPhoneInput(immediate)
      return
    }

    const qs = new URLSearchParams({
      targetName: targetLabel || "",
      targetEmail: targetEmail || "",
    })
    fetch(`/api/connectin/voice/token?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.matchedMemberName && !looksLikeClientPhone(targetLabel)) {
          setDisplayName(data.matchedMemberName)
        }
        if (data?.resolvedPhone && looksLikeClientPhone(data.resolvedPhone)) {
          setResolvedPhone(data.resolvedPhone)
          setPhoneInput(data.resolvedPhone)
        }
      })
      .catch(() => {})
  }, [open, targetLabel, targetPhone, targetEmail, callerName, roomJoinUrl])

  const effectiveE164 = (() => {
    const raw = phoneInput.trim() || resolvedPhone
    if (!raw) return ""
    const candidate = raw.startsWith("+")
      ? normalizeClientPhone(raw)
      : buildGlobalE164Phone(softphoneCountryCode, raw)
    return looksLikeClientPhone(candidate) ? candidate : ""
  })()

  const digits = effectiveE164.replace(/[^\d]/g, "")
  const shareBody = `📹 ${callerName} is calling you on ConnectLn (Free Internet Voice & Video)! Tap to answer over Wi-Fi/Data: ${callLinkUrl}`
  const nativeSmsHref = effectiveE164
    ? `sms:${effectiveE164}?&body=${encodeURIComponent(shareBody)}`
    : `sms:?&body=${encodeURIComponent(shareBody)}`
  const whatsappHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(shareBody)}`
    : `https://wa.me/?text=${encodeURIComponent(shareBody)}`
  const nativeTelHref = "" // Internet-only: no carrier/SIM dialing

  const handleRingFreeInternet = async () => {
    setIsRingingInternet(true)
    setStatusNote("Ringing over ConnectLn Internet (100% Free Wi-Fi / Data)...")
    if (effectiveE164 && targetLabel && !looksLikeClientPhone(targetLabel)) {
      saveContactPhoneLocal(effectiveE164, targetLabel, targetEmail)
    }
    startOutgoingCallerRingbackTone()
    if (onUpgradeToVideoHuddle) {
      setIsRingingInternet(false)
      onUpgradeToVideoHuddle(effectiveE164 || displayName)
      return
    }
    try {
      const res = await fetch("/api/connectin/calls/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_call",
          callMode: "video",
          callerName,
          callerEmail,
          callerAvatar: callerAvatar || undefined,
          targetPhone: effectiveE164 || undefined,
          targetName: displayName,
          targetEmail,
        }),
      })
      const data = await res.json()
      if (data?.joinUrl) setCallLinkUrl(data.joinUrl)
      setStatusNote(
        data?.isRegisteredOnConnectLn
          ? `✓ Ringing ${displayName} free over ConnectLn Internet!`
          : `✓ Free internet room ready! Send the link below via your SMS or WhatsApp so ${displayName} joins free.`
      )
    } catch {
      setStatusNote("✓ Free internet call link ready below!")
    } finally {
      setIsRingingInternet(false)
    }
  }

  if (!open) return null

  const avatarSrc =
    targetAvatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      displayName || "CL"
    )}&backgroundColor=7c4225`

  return (
    <div className="fixed inset-0 z-[75] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-500/40 bg-[#181411] text-[#FBF8F3] shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 bg-[#241E19] border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-300 truncate">
              100% Free Internet Call
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6 text-center space-y-4">
          <div className="relative mx-auto w-20 h-20">
            <img
              src={avatarSrc}
              alt={displayName}
              className="relative w-20 h-20 rounded-full object-cover border-2 border-emerald-400 shadow-lg mx-auto"
            />
            <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-600 border-2 border-[#181411] flex items-center justify-center">
              <Globe className="h-3.5 w-3.5 text-white" />
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white leading-tight">{displayName}</h3>
            {effectiveE164 && (
              <p className="text-sm font-mono text-emerald-300 font-semibold">
                {prettyClientPhone(effectiveE164)}
              </p>
            )}
            <p className="text-[11px] text-[#C8B9A6]">
              ConnectLn Internet Calls are <strong>100% Free</strong> over Wi-Fi / Data. Offline SIM/SMS uses your own phone plan.
            </p>
          </div>

          <div className="space-y-2 text-left bg-[#241E19] border border-white/10 rounded-2xl p-3.5">
            <label className="block text-[11px] font-bold text-[#E7D8C5]">
              Recipient Mobile Number (215+ Countries):
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={softphoneCountryCode}
                onChange={(e) => setSoftphoneCountryCode(e.target.value)}
                className="max-w-[145px] rounded-xl bg-[#14110E] border border-[#7C4225] px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-400"
              >
                {GLOBAL_COUNTRY_DIAL_CODES.map((c) => (
                  <option key={`${c.iso}-${c.code}`} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Mobile number"
                className="flex-1 min-w-[130px] rounded-xl bg-[#14110E] border border-[#7C4225] px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {statusNote && (
            <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/40 px-3 py-2 text-xs text-emerald-200 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{statusNote}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              type="button"
              disabled={isRingingInternet}
              onClick={handleRingFreeInternet}
              style={{ color: "#FFFFFF" }}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Video className="h-4 w-4" />
              <span>
                {isRingingInternet
                  ? "Starting Free Internet Call..."
                  : "Start Free ConnectLn Internet Call (Wi-Fi / Data)"}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={nativeSmsHref}
                className="rounded-xl bg-sky-700 hover:bg-sky-600 py-2.5 px-3 text-xs font-bold text-white flex items-center justify-center gap-1.5 no-underline"
                title="Sends the free internet call link from your own device SMS"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Send Link (My SMS)</span>
              </a>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-800 hover:bg-emerald-700 py-2.5 px-3 text-xs font-bold text-white flex items-center justify-center gap-1.5 no-underline"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Invite on WhatsApp</span>
              </a>
            </div>

            {nativeTelHref && (
              <a
                href={nativeTelHref}
                className="w-full rounded-xl bg-[#7C4225] hover:bg-[#5E3119] py-2.5 px-4 text-xs font-extrabold text-white flex items-center justify-center gap-2 no-underline"
                title="Uses your own mobile carrier SIM plan — $0 ConnectLn fee"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Dial Using My Own Carrier SIM ({prettyClientPhone(effectiveE164)})</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact Internet Call Invite & User-SIM Handoff Bar embedded inside Messaging Huddle & Live Video Studio.
 * Zero Twilio PSTN voice minutes and zero Twilio server SMS ($0.00 platform cost).
 */
export function ConnectLnInlineCellBridgeBar({
  targetName,
  targetEmail,
  callerName = "ConnectLn Member",
  callerEmail,
  roomJoinUrl,
  videoCallMode = true,
}: {
  targetName: string
  targetEmail?: string
  callerName?: string
  callerEmail?: string
  roomJoinUrl?: string
  autoDialOnMount?: boolean
  videoCallMode?: boolean
}) {
  const [phoneInput, setPhoneInput] = useState<string>(() =>
    getSavedContactPhoneLocal(targetName, targetEmail)
  )
  const [statusNote, setStatusNote] = useState<string>("")
  const [showQrModal, setShowQrModal] = useState<boolean>(false)
  const autoPushedTargetRef = useRef<string>("")

  const effectiveJoinUrl = (() => {
    const base =
      roomJoinUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/connectin?tab=vibecomms`
        : "https://conectln.com/connectin?tab=vibecomms")
    if (targetName && !looksLikeClientPhone(targetName) && !base.includes("invitedName=")) {
      return `${base}${base.includes("?") ? "&" : "?"}invitedName=${encodeURIComponent(targetName)}`
    }
    return base
  })()

  const dispatchFreeInternetEmailAlert = useCallback(
    async (phoneCandidate?: string) => {
      try {
        const res = await fetch("/api/connectin/voice/ring-cell", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toPhone: phoneCandidate || undefined,
            targetName,
            targetEmail,
            callerName,
            callerEmail,
            callMode: videoCallMode ? "video" : "audio",
            joinUrl: effectiveJoinUrl,
          }),
        })
        const data = await res.json()
        if (data?.toPhone && looksLikeClientPhone(data.toPhone)) {
          setPhoneInput((prev) => prev || data.toPhone)
        }
        return data
      } catch {
        return null
      }
    },
    [callerEmail, callerName, effectiveJoinUrl, targetEmail, targetName, videoCallMode]
  )

  useEffect(() => {
    let cancelled = false
    const qs = new URLSearchParams({
      targetName: targetName || "",
      targetEmail: targetEmail || "",
    })
    fetch(`/api/connectin/voice/token?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(async (data) => {
        if (cancelled) return
        const foundPhone =
          data?.resolvedPhone && looksLikeClientPhone(data.resolvedPhone)
            ? data.resolvedPhone
            : ""
        if (foundPhone) {
          setPhoneInput((prev) => prev || foundPhone)
        }
        const pushKey = `${targetName}__${targetEmail || ""}__${effectiveJoinUrl}`
        if (autoPushedTargetRef.current !== pushKey) {
          autoPushedTargetRef.current = pushKey
          const pushRes = await dispatchFreeInternetEmailAlert(foundPhone || undefined)
          if (!cancelled && pushRes?.emailSent) {
            setStatusNote(
              `✓ Sent free Internet Call Link to ${pushRes.recipientEmail || targetName}!`
            )
          }
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [targetName, targetEmail, effectiveJoinUrl, dispatchFreeInternetEmailAlert])

  const normalizedPhone = looksLikeClientPhone(phoneInput) ? normalizeClientPhone(phoneInput) : ""
  const cleanDigits = normalizedPhone.replace(/[^\d]/g, "")
  const shareBody = `${
    videoCallMode ? "📹" : "📞"
  } Free Internet ${videoCallMode ? "Video" : "Voice"} Call from ${callerName} on ConnectLn! Tap to join over Wi-Fi/Data: ${effectiveJoinUrl}`
  const whatsappHref = cleanDigits
    ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(shareBody)}`
    : `https://wa.me/?text=${encodeURIComponent(shareBody)}`
  const nativeSmsHref = normalizedPhone
    ? `sms:${normalizedPhone}?&body=${encodeURIComponent(shareBody)}`
    : `sms:?&body=${encodeURIComponent(shareBody)}`
  const nativeTelHref = "" // Internet-only: no carrier/SIM dialing

  return (
    <div
      className="rounded-xl px-3.5 py-2.5 flex flex-col gap-2"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.94)",
        border: "1px solid rgba(52, 211, 153, 0.42)",
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone className="h-4 w-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-white truncate">
              100% Free Internet Call · Share the Call Link
            </p>
            <p className="text-[10.5px] text-emerald-300 truncate">
              {statusNote ||
                "Zero server carrier charges — invite via your SMS/WhatsApp for free Wi-Fi/Data calling or dial via your SIM."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Mobile # (+country code)"
            className="w-40 rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
          />

          <a
            href={nativeSmsHref}
            onClick={() => {
              if (normalizedPhone) saveContactPhoneLocal(normalizedPhone, targetName, targetEmail)
            }}
            className="rounded-lg bg-sky-700 hover:bg-sky-600 px-2.5 py-1.5 text-[11px] font-extrabold text-white no-underline"
            title="Send free internet call link from your own device SMS"
          >
            💬 My SMS Link
          </a>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-emerald-800 hover:bg-emerald-700 border border-emerald-400/40 px-2.5 py-1.5 text-[11px] font-bold text-emerald-100 no-underline"
          >
            🟢 WhatsApp
          </a>

          {nativeTelHref && (
            <a
              href={nativeTelHref}
              className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] px-2.5 py-1.5 text-[11px] font-extrabold text-white flex items-center gap-1 no-underline"
              title="Dial using your own phone SIM plan ($0 ConnectLn charge)"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>My SIM</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(effectiveJoinUrl).catch(() => {})
              setStatusNote("✓ Copied free internet call link!")
            }}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1.5 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer"
          >
            <Copy className="h-3 w-3" />
            <span>Copy Link</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal((prev) => !prev)}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2 py-1.5 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR</span>
          </button>
        </div>
      </div>

      {showQrModal && (
        <div className="rounded-xl bg-slate-950/95 border border-emerald-500/40 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                effectiveJoinUrl
              )}`}
              alt="Scan with Phone Camera"
              className="w-24 h-24 rounded-lg bg-white p-1.5 shrink-0"
            />
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-white">
                Scan with Phone Camera to Join Free Internet Video Call:
              </p>
              <p className="text-[11px] text-slate-300 font-mono break-all">{effectiveJoinUrl}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowQrModal(false)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
