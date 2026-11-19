"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Mic,
  MicOff,
  Video,
  MessageSquare,
  Hash,
  X,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  RotateCcw,
  QrCode,
  Copy,
  UserPlus,
} from "lucide-react"

const LOCAL_PHONEBOOK_KEY = "connectln_contact_phonebook_v1"

export function looksLikeClientPhone(raw?: string | null): boolean {
  if (!raw) return false
  const trimmed = String(raw).trim()
  if (!trimmed || trimmed.includes("@")) return false
  const compact = trimmed.replace(/[\s().\-]/g, "")
  return /^\+?\d{7,15}$/.test(compact)
}

export function normalizeClientPhone(raw: string): string {
  let compact = String(raw || "").trim().replace(/[^\d+]/g, "")
  if (!compact) return ""
  if (compact.startsWith("00") && compact.length > 9) {
    compact = `+${compact.slice(2)}`
  } else if (!compact.startsWith("+")) {
    if (compact.length === 10 && /^[2-9]/.test(compact)) {
      compact = `+1${compact}`
    } else if (compact.length === 10 && /^0[25]\d{8}$/.test(compact)) {
      compact = `+233${compact.slice(1)}`
    } else if (compact.length === 11 && compact.startsWith("1")) {
      compact = `+${compact}`
    } else {
      compact = `+${compact}`
    }
  }
  compact = compact.replace(
    /^\+(233|234|254|27|44|33|49|61|225|221|228|250|256|255)0(\d{7,10})$/,
    "+$1$2"
  )
  return compact
}

export function prettyClientPhone(raw: string): string {
  const e164 = normalizeClientPhone(raw)
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/)
  if (m) return `+1 (${m[1]}) ${m[2]}-${m[3]}`
  const gh = e164.match(/^\+233(\d{2})(\d{3})(\d{4})$/)
  if (gh) return `+233 ${gh[1]} ${gh[2]} ${gh[3]}`
  return e164 || raw
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

type SoftphonePhase =
  | "resolving"
  | "needs_number"
  | "connecting"
  | "ringing"
  | "in_call"
  | "ended"
  | "error"

function formatDurationClock(sec: number): string {
  const mins = Math.floor(sec / 60)
  const rem = sec % 60
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`
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
  roomJoinUrl?: string
  onUpgradeToVideoHuddle?: (targetLabel: string) => void
}

/**
 * Full Live Browser-to-Cell-Phone Softphone Console (`@twilio/voice-sdk`).
 * Rings any US or international mobile phone directly on the carrier network with live two-way voice audio.
 */
export function ConnectLnCellPhoneSoftphoneModal({
  open,
  onClose,
  targetLabel,
  targetPhone,
  targetEmail,
  targetAvatar,
  callerName = "Kwesi Asiedu",
  callerEmail,
  roomJoinUrl,
  onUpgradeToVideoHuddle,
}: ConnectLnCellPhoneSoftphoneModalProps) {
  const [phase, setPhase] = useState<SoftphonePhase>("resolving")
  const [phoneInput, setPhoneInput] = useState<string>("")
  const [activeDialedPhone, setActiveDialedPhone] = useState<string>("")
  const [displayName, setDisplayName] = useState<string>(targetLabel || "Mobile Call")
  const [callerIdDisplay, setCallerIdDisplay] = useState<string>("+1 (240) 262-3543")
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [showKeypad, setShowKeypad] = useState<boolean>(false)
  const [dtmfSent, setDtmfSent] = useState<string>("")
  const [elapsedSec, setElapsedSec] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [smsStatusNote, setSmsStatusNote] = useState<string>("")
  const [isSendingSms, setIsSendingSms] = useState<boolean>(false)
  const [showAddPersonPanel, setShowAddPersonPanel] = useState<boolean>(false)
  const [addPersonInput, setAddPersonInput] = useState<string>("")
  const [isAddingPerson, setIsAddingPerson] = useState<boolean>(false)
  const [extraLegs, setExtraLegs] = useState<
    Array<{ callSid: string; name: string; phone: string; status: string }>
  >([])
  const extraLegsRef = useRef<Array<{ callSid: string; name: string; phone: string; status: string }>>([])
  useEffect(() => {
    extraLegsRef.current = extraLegs
  }, [extraLegs])
  const [softphoneConfRoom] = useState<string>(
    () => `conf_sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  )
  const primaryLegSidRef = useRef<string>("")

  const deviceRef = useRef<any>(null)
  const activeCallRef = useRef<any>(null)
  const cachedTokenRef = useRef<string>("")

  const cleanupActiveCall = useCallback(() => {
    const allSids = [
      primaryLegSidRef.current,
      ...extraLegsRef.current.map((l) => l.callSid),
    ].filter(Boolean)
    if (allSids.length > 0) {
      fetch("/api/connectin/voice/conference-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ action: "end_all", callSids: allSids }),
      }).catch(() => {})
      primaryLegSidRef.current = ""
      setExtraLegs([])
    }
    try {
      if (activeCallRef.current) {
        activeCallRef.current.disconnect?.()
        activeCallRef.current = null
      }
    } catch {}
    try {
      if (deviceRef.current) {
        deviceRef.current.destroy?.()
        deviceRef.current = null
      }
    } catch {}
  }, [])

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

  // Call duration timer once answered
  useEffect(() => {
    if (phase !== "in_call") return
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [phase])

  const startCellularCall = useCallback(
    async (rawPhoneToDial: string, providedToken?: string) => {
      const cleanPhone = normalizeClientPhone(rawPhoneToDial)
      if (!looksLikeClientPhone(cleanPhone)) {
        setPhase("needs_number")
        setErrorMsg("Enter a 10-digit mobile number (e.g. 240-260-7898) or +country code.")
        return
      }

      cleanupActiveCall()
      setErrorMsg("")
      setIsMuted(false)
      setElapsedSec(0)
      setDtmfSent("")
      setActiveDialedPhone(cleanPhone)
      setPhoneInput(cleanPhone)
      setPhase("connecting")

      // Save mapping locally & in Cloud Sync if associated with a named contact
      if (targetLabel && !looksLikeClientPhone(targetLabel)) {
        saveContactPhoneLocal(cleanPhone, targetLabel, targetEmail)
        fetch("/api/connectin/voice/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_contact_phone",
            contactName: targetLabel,
            contactEmail: targetEmail,
            phone: cleanPhone,
            identity: callerEmail || callerName,
          }),
        }).catch(() => {})
      }

      try {
        let jwt = providedToken || cachedTokenRef.current
        if (!jwt) {
          const qs = new URLSearchParams({
            identity: callerEmail || callerName || "connectln_caller",
            targetPhone: cleanPhone,
          })
          const res = await fetch(`/api/connectin/voice/token?${qs.toString()}`, {
            cache: "no-store",
          })
          const data = await res.json()
          if (!res.ok || !data?.ok || !data?.token) {
            throw new Error(data?.error || "Unable to initialize ConnectLn carrier voice token.")
          }
          jwt = data.token
          cachedTokenRef.current = jwt
          if (data.callerId) {
            setCallerIdDisplay(prettyClientPhone(data.callerId))
          }
        }

        const { Device } = await import("@twilio/voice-sdk")
        const device = new Device(jwt, {
          codecPreferences: ["opus", "pcmu"] as any,
          enableImprovedSignalingErrorPrecision: true,
        })
        deviceRef.current = device

        device.on("error", (twErr: any) => {
          console.error("[ConnectLn Softphone Device Error]", twErr)
          setErrorMsg(twErr?.message || "Carrier signaling error. Check microphone permission and retry.")
          setPhase("error")
        })

        const call = await device.connect({
          params: {
            ConferenceRoom: softphoneConfRoom,
            CallerName: callerName,
          },
        })
        activeCallRef.current = call
        setPhase("ringing")

        // Dial the first cell phone into the shared conference bridge so more people can be merged anytime!
        const confRes = await fetch("/api/connectin/voice/conference-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            callId: softphoneConfRoom,
            conferenceName: softphoneConfRoom,
            callMode: "audio",
            callerName,
            callerEmail,
            targetPhone: cleanPhone,
            targetName: targetLabel,
            targetEmail,
            forceCellSim: true,
          }),
        }).then((r) => r.json())

        if (confRes?.cellCallSid) {
          primaryLegSidRef.current = confRes.cellCallSid
        } else if (confRes?.cellDialError) {
          throw new Error(confRes.cellDialError)
        }

        call.on("accept", () => {
          setElapsedSec(0)
          setPhase("in_call")
        })

        call.on("disconnect", () => {
          activeCallRef.current = null
          setPhase("ended")
        })

        call.on("cancel", () => {
          activeCallRef.current = null
          setPhase("ended")
        })

        call.on("reject", () => {
          activeCallRef.current = null
          setPhase("ended")
        })

        call.on("error", (callErr: any) => {
          console.error("[ConnectLn Softphone Call Error]", callErr)
          setErrorMsg(callErr?.message || "Call could not be completed.")
          setPhase("error")
        })
      } catch (err: any) {
        console.error("[startCellularCall] error:", err)
        setErrorMsg(
          err?.message ||
            "Microphone permission is required in your browser to talk on a live cell phone call."
        )
        setPhase("error")
      }
    },
    [callerEmail, callerName, cleanupActiveCall, targetEmail, targetLabel]
  )

  // Resolve target's phone number & auto-dial on open
  useEffect(() => {
    if (!open) {
      cleanupActiveCall()
      cachedTokenRef.current = ""
      setSmsStatusNote("")
      return
    }

    let cancelled = false
    setDisplayName(
      looksLikeClientPhone(targetLabel) ? prettyClientPhone(targetLabel) : targetLabel || "Mobile Call"
    )
    setErrorMsg("")
    setSmsStatusNote("")

    const immediatePhone =
      (looksLikeClientPhone(targetPhone) && normalizeClientPhone(targetPhone!)) ||
      (looksLikeClientPhone(targetLabel) && normalizeClientPhone(targetLabel)) ||
      getSavedContactPhoneLocal(targetLabel, targetEmail)

    if (immediatePhone) {
      setPhoneInput(immediatePhone)
      startCellularCall(immediatePhone)
      return () => {
        cancelled = true
        cleanupActiveCall()
      }
    }

    // Query backend user directory + Cloud Sync for this ConnectLn member's cell number
    setPhase("resolving")
    const qs = new URLSearchParams({
      identity: callerEmail || callerName || "connectln_caller",
      targetName: targetLabel || "",
      targetEmail: targetEmail || "",
    })
    fetch(`/api/connectin/voice/token?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data?.token) cachedTokenRef.current = data.token
        if (data?.callerId) setCallerIdDisplay(prettyClientPhone(data.callerId))
        if (data?.matchedMemberName && !looksLikeClientPhone(targetLabel)) {
          setDisplayName(data.matchedMemberName)
        }
        if (data?.resolvedPhone && looksLikeClientPhone(data.resolvedPhone)) {
          setPhoneInput(data.resolvedPhone)
          startCellularCall(data.resolvedPhone, data.token)
        } else {
          setPhase("needs_number")
        }
      })
      .catch(() => {
        if (!cancelled) setPhase("needs_number")
      })

    return () => {
      cancelled = true
      cleanupActiveCall()
    }
  }, [
    open,
    targetLabel,
    targetPhone,
    targetEmail,
    callerName,
    callerEmail,
    cleanupActiveCall,
    startCellularCall,
  ])

  const handleToggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    try {
      activeCallRef.current?.mute?.(next)
    } catch {}
  }

  const handleHangup = () => {
    cleanupActiveCall()
    setPhase("ended")
  }

  const handlePressDigit = (digit: string) => {
    if (phase === "in_call" || phase === "ringing") {
      try {
        activeCallRef.current?.sendDigits?.(digit)
        setDtmfSent((prev) => `${prev}${digit}`)
      } catch {}
    } else {
      setPhoneInput((prev) => `${prev}${digit}`)
    }
  }

  const handleSendSmsJoinLink = async () => {
    const targetNum = activeDialedPhone || phoneInput
    if (!looksLikeClientPhone(targetNum)) {
      setSmsStatusNote("Enter a valid mobile phone number first.")
      return
    }
    setIsSendingSms(true)
    setSmsStatusNote("")
    try {
      const joinUrl =
        roomJoinUrl ||
        `https://conectln.com/connectin?tab=vibecomms&joinCall=${encodeURIComponent(
          `call_${Date.now().toString(36)}`
        )}`
      const res = await fetch("/api/connectin/voice/ring-cell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhone: targetNum,
          targetName: displayName,
          callerName,
          callMode: "video",
          joinUrl,
          placeAlertCall: false,
        }),
      })
      const data = await res.json()
      if (data?.ok && data?.smsSent) {
        setSmsStatusNote(`✓ Texted live join link to ${prettyClientPhone(targetNum)}`)
      } else {
        setSmsStatusNote(data?.smsError || "Copied call link — paste in SMS if carrier blocks links")
        navigator.clipboard?.writeText(joinUrl).catch(() => {})
      }
    } catch {
      setSmsStatusNote("Could not send SMS right now.")
    } finally {
      setIsSendingSms(false)
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
      <div className="w-full max-w-md rounded-3xl border border-[#7C4225]/60 bg-[#181411] text-[#FBF8F3] shadow-2xl overflow-hidden">
        {/* Top Carrier Status Ribbon */}
        <div className="px-5 py-3.5 bg-[#241E19] border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                phase === "in_call"
                  ? "bg-emerald-400 animate-pulse"
                  : phase === "ringing" || phase === "connecting" || phase === "resolving"
                  ? "bg-amber-400 animate-ping"
                  : phase === "error"
                  ? "bg-rose-500"
                  : "bg-zinc-400"
              }`}
            />
            <span className="text-xs font-bold tracking-wide uppercase text-[#E7D8C5] truncate">
              {phase === "resolving" && "Looking up mobile number..."}
              {phase === "needs_number" && "ConnectLn Mobile Phone Bridge"}
              {phase === "connecting" && "Connecting Carrier Voice Line..."}
              {phase === "ringing" && "Ringing Cell Phone..."}
              {phase === "in_call" && `Connected Live · ${formatDurationClock(elapsedSec)}`}
              {phase === "ended" && "Call Ended"}
              {phase === "error" && "Call Connection Notice"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              cleanupActiveCall()
              onClose()
            }}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            title="Close Softphone"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Center Contact / Number Stage */}
        <div className="px-6 py-6 text-center space-y-4">
          <div className="relative mx-auto w-20 h-20">
            {(phase === "ringing" || phase === "in_call") && (
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping" />
            )}
            <img
              src={avatarSrc}
              alt={displayName}
              className="relative w-20 h-20 rounded-full object-cover border-2 border-[#BC9675] shadow-lg mx-auto"
            />
            <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#7C4225] border-2 border-[#181411] flex items-center justify-center">
              <Smartphone className="h-3.5 w-3.5 text-white" />
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white leading-tight">{displayName}</h3>
            {activeDialedPhone && (
              <p className="text-sm font-mono text-emerald-300 font-semibold">
                {prettyClientPhone(activeDialedPhone)}
              </p>
            )}
            <p className="text-[11px] text-[#C8B9A6]">
              Outbound Caller ID: <span className="font-mono">{callerIdDisplay}</span>
            </p>
          </div>

          {/* Live Voice Waveform When Ringing or In Call */}
          {(phase === "ringing" || phase === "in_call") && (
            <div className="flex items-center justify-center gap-1.5 h-7 py-1">
              {[35, 75, 55, 100, 65, 90, 45, 80, 50].map((h, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 rounded-full ${
                    phase === "in_call" ? "bg-emerald-400 animate-pulse" : "bg-amber-300 animate-pulse"
                  }`}
                  style={{ height: `${h}%`, animationDelay: `${idx * 110}ms` }}
                />
              ))}
            </div>
          )}

          {/* Prompt to enter or edit cell phone number when calling a contact without a saved number, or after call ends */}
          {(phase === "needs_number" || phase === "ended" || phase === "error") && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                startCellularCall(phoneInput)
              }}
              className="space-y-2.5 text-left bg-[#241E19] border border-white/10 rounded-2xl p-3.5"
            >
              <label className="block text-[11px] font-bold text-[#E7D8C5]">
                {phase === "needs_number"
                  ? `Enter ${displayName}'s cell phone number to ring their mobile directly:`
                  : "Dial or redial mobile phone number:"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. 240-260-7898 or +12402607898"
                  className="flex-1 rounded-xl bg-[#14110E] border border-[#7C4225] px-3.5 py-2 text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400"
                  autoFocus
                />
                <button
                  type="submit"
                  style={{ color: "#FFFFFF" }}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{phase === "ended" ? "Redial" : "Ring Cell"}</span>
                </button>
              </div>
              <p className="text-[10.5px] text-[#B8A998]">
                Rings their real cell phone on any US or international carrier with live two-way voice audio.
              </p>
            </form>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-rose-950/70 border border-rose-500/40 px-3.5 py-2.5 text-xs text-rose-200 flex items-start gap-2 text-left">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {dtmfSent && (
            <p className="text-xs font-mono text-amber-300">Keypad tones sent: {dtmfSent}</p>
          )}

          {/* Optional 12-Button DTMF Touch-Tone Keypad */}
          {showKeypad && (
            <div className="grid grid-cols-3 gap-2 max-w-[230px] mx-auto pt-1">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handlePressDigit(d)}
                  className="h-10 rounded-xl bg-[#29221C] hover:bg-[#3A3028] border border-white/10 text-sm font-mono font-bold text-white cursor-pointer active:scale-95 transition-transform"
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {smsStatusNote && (
            <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/40 px-3 py-2 text-xs text-emerald-200 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{smsStatusNote}</span>
            </div>
          )}

          {/* Extra Conferenced Cell Participants List */}
          {extraLegs.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {extraLegs.map((leg) => (
                <span
                  key={leg.callSid}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 text-[11px] font-bold text-emerald-200"
                >
                  <span>🟢 {leg.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setExtraLegs((prev) => prev.filter((x) => x.callSid !== leg.callSid))
                      fetch("/api/connectin/voice/conference-add", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "hangup_participant",
                          callSid: leg.callSid,
                        }),
                      }).catch(() => {})
                    }}
                    className="text-rose-300 hover:text-white ml-0.5 cursor-pointer"
                    title="Remove from call"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Inline `➕ Add Another Person / Number` Conference Panel */}
          {showAddPersonPanel && (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!addPersonInput.trim()) return
                setIsAddingPerson(true)
                const rawTarget = addPersonInput.trim()
                setAddPersonInput("")
                try {
                  const res = await fetch("/api/connectin/voice/conference-add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "add",
                      callId: softphoneConfRoom,
                      conferenceName: softphoneConfRoom,
                      callMode: "audio",
                      callerName,
                      callerEmail,
                      targetPhone: looksLikeClientPhone(rawTarget) ? rawTarget : undefined,
                      targetName: rawTarget,
                      forceCellSim: true,
                    }),
                  })
                  const d = await res.json()
                  if (d?.cellCallSid) {
                    const label =
                      d.recipient?.name || prettyClientPhone(d.recipient?.phone || rawTarget)
                    setExtraLegs((prev) => [
                      ...prev,
                      {
                        callSid: d.cellCallSid,
                        name: label,
                        phone: d.recipient?.phone || rawTarget,
                        status: "ringing",
                      },
                    ])
                    setSmsStatusNote(`✓ Ringing & merging ${label} into your call!`)
                  } else {
                    setSmsStatusNote(d?.cellDialError || d?.error || "Invited participant on ConnectLn!")
                  }
                } catch {
                  setSmsStatusNote("Could not add participant right now.")
                } finally {
                  setIsAddingPerson(false)
                }
              }}
              className="flex items-center gap-2 bg-[#241E19] border border-emerald-500/40 rounded-2xl p-2.5"
            >
              <input
                type="tel"
                value={addPersonInput}
                onChange={(e) => setAddPersonInput(e.target.value)}
                placeholder="Phone # or @name to merge in..."
                className="flex-1 rounded-xl bg-[#14110E] border border-[#7C4225] px-3 py-1.5 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={isAddingPerson}
                style={{ color: "#FFFFFF" }}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-extrabold cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isAddingPerson ? "Ringing..." : "+ Merge"}
              </button>
            </form>
          )}
        </div>

        {/* Bottom Softphone Action Bar */}
        <div className="px-5 py-4 bg-[#241E19] border-t border-white/10 flex flex-wrap items-center justify-center gap-2.5">
          {(phase === "connecting" || phase === "ringing" || phase === "in_call") && (
            <>
              <button
                type="button"
                onClick={handleToggleMute}
                className={`rounded-full px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                  isMuted
                    ? "bg-amber-600 border-amber-400 text-white"
                    : "bg-white/10 hover:bg-white/15 border-white/15 text-white"
                }`}
              >
                {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                <span>{isMuted ? "Unmute" : "Mute"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddPersonPanel((v) => !v)}
                style={{ color: "#FFFFFF" }}
                className={`rounded-full px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer border ${
                  showAddPersonPanel
                    ? "bg-emerald-600 border-emerald-400"
                    : "bg-emerald-700/80 hover:bg-emerald-600 border-emerald-400/50"
                }`}
                title="Add another person or phone number into this call"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add Person</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowKeypad((prev) => !prev)}
            className={`rounded-full px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              showKeypad
                ? "bg-[#7C4225] border-[#BC9675] text-white"
                : "bg-white/10 hover:bg-white/15 border-white/15 text-white"
            }`}
          >
            <Hash className="h-3.5 w-3.5" />
            <span>Keypad</span>
          </button>

          <button
            type="button"
            onClick={handleSendSmsJoinLink}
            disabled={isSendingSms}
            className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3.5 py-2 text-xs font-bold text-sky-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Send a 1-tap video room link to their cell phone via SMS"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{isSendingSms ? "Texting..." : "Text Video Link"}</span>
          </button>

          {onUpgradeToVideoHuddle && (
            <button
              type="button"
              onClick={() => {
                onUpgradeToVideoHuddle(displayName)
              }}
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Video Room</span>
            </button>
          )}

          {phase === "connecting" || phase === "ringing" || phase === "in_call" ? (
            <button
              type="button"
              onClick={handleHangup}
              style={{ color: "#FFFFFF" }}
              className="rounded-full bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <PhoneOff className="h-4 w-4" />
              <span>End Call</span>
            </button>
          ) : activeDialedPhone ? (
            <button
              type="button"
              onClick={() => startCellularCall(activeDialedPhone)}
              style={{ color: "#FFFFFF" }}
              className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Call Again</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * Compact Live Cell Phone Bridge Bar embedded inside Messaging Huddle & Live Video Studio
 * so any voice or video call can simultaneously ring & bridge the recipient's physical cell phone!
 */
export function ConnectLnInlineCellBridgeBar({
  targetName,
  targetEmail,
  callerName = "Kwesi Asiedu",
  callerEmail,
  roomJoinUrl,
  autoDialOnMount = false,
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
  const [phase, setPhase] = useState<"idle" | "connecting" | "ringing" | "in_call" | "ended" | "error">("idle")
  const [elapsedSec, setElapsedSec] = useState<number>(0)
  const [statusNote, setStatusNote] = useState<string>("")
  const [showQrModal, setShowQrModal] = useState<boolean>(false)
  const [bridgedLegs, setBridgedLegs] = useState<
    Array<{ callSid: string; label: string; phone: string }>
  >([])
  const bridgedLegsRef = useRef<Array<{ callSid: string; label: string; phone: string }>>([])
  useEffect(() => {
    bridgedLegsRef.current = bridgedLegs
  }, [bridgedLegs])
  const [inlineConfName] = useState<string>(
    () => `conf_inline_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  )
  const deviceRef = useRef<any>(null)
  const callRef = useRef<any>(null)
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

  const hangupCell = useCallback(() => {
    if (bridgedLegsRef.current.length > 0) {
      fetch("/api/connectin/voice/conference-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          action: "end_all",
          callSids: bridgedLegsRef.current.map((b) => b.callSid),
        }),
      }).catch(() => {})
      setBridgedLegs([])
    }
    try {
      callRef.current?.disconnect?.()
      callRef.current = null
    } catch {}
    try {
      deviceRef.current?.destroy?.()
      deviceRef.current = null
    } catch {}
  }, [])

  useEffect(() => {
    if (phase !== "in_call") return
    const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [phase])

  const dispatchCameraInvitePush = useCallback(
    async (phoneCandidate?: string, alsoPlaceAlertCall = false) => {
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
            placeAlertCall: alsoPlaceAlertCall,
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

  const dialCellNow = useCallback(
    async (numToDial: string) => {
      const clean = normalizeClientPhone(numToDial)
      if (!looksLikeClientPhone(clean)) {
        setStatusNote("Enter a 10-digit mobile number (e.g. 240-260-7898) first.")
        return
      }
      setPhase((prev) => (prev === "in_call" ? "in_call" : "connecting"))
      setStatusNote(
        `Ringing & merging ${prettyClientPhone(clean)} into this call${
          videoCallMode ? " + sending Camera Link" : ""
        }...`
      )
      saveContactPhoneLocal(clean, targetName, targetEmail)

      try {
        // Ensure host browser is connected once to `inlineConfName` so unlimited numbers can be merged in!
        if (!callRef.current) {
          const res = await fetch("/api/connectin/voice/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_contact_phone",
              contactName: targetName,
              contactEmail: targetEmail,
              phone: clean,
              identity: callerEmail || callerName,
            }),
          })
          const data = await res.json()
          if (!res.ok || !data?.token) {
            throw new Error(data?.error || "Could not initialize carrier call.")
          }
          const { Device } = await import("@twilio/voice-sdk")
          const device = new Device(data.token, { codecPreferences: ["opus", "pcmu"] as any })
          deviceRef.current = device
          const call = await device.connect({
            params: { ConferenceRoom: inlineConfName, CallerName: callerName },
          })
          callRef.current = call
          call.on("accept", () => {
            setElapsedSec(0)
            setPhase("in_call")
          })
          call.on("disconnect", () => {
            callRef.current = null
            setPhase("ended")
            setStatusNote("Cell phone conference ended.")
          })
          call.on("error", (e: any) => {
            setPhase("error")
            setStatusNote(e?.message || "Carrier call failed.")
          })
        }

        const addRes = await fetch("/api/connectin/voice/conference-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            callId: inlineConfName,
            conferenceName: inlineConfName,
            callMode: videoCallMode ? "video" : "audio",
            callerName,
            callerEmail,
            targetPhone: clean,
            targetName: bridgedLegsRef.current.length === 0 ? targetName : clean,
            forceCellSim: true,
          }),
        }).then((r) => r.json())

        if (addRes?.cellCallSid) {
          const legLabel = addRes.recipient?.name || prettyClientPhone(clean)
          setBridgedLegs((prev) => [
            ...prev.filter((p) => p.phone !== clean),
            { callSid: addRes.cellCallSid, label: legLabel, phone: clean },
          ])
          setPhoneInput("")
          setPhase("in_call")
          setStatusNote(
            `🟢 Merged ${prettyClientPhone(clean)}! Enter another number & click "+ Add Person" to add more people.`
          )
        } else {
          setStatusNote(addRes?.cellDialError || "Invited participant on ConnectLn!")
        }
      } catch (err: any) {
        setPhase("error")
        setStatusNote(err?.message || "Allow microphone access to ring cell phone.")
      }
    },
    [callerEmail, callerName, inlineConfName, targetEmail, targetName, videoCallMode]
  )

  useEffect(() => {
    let cancelled = false
    const qs = new URLSearchParams({
      identity: callerEmail || callerName || "connectln_caller",
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

        // Automatically dispatch instant mobile Camera Invite Push once when opening a Video Call!
        const pushKey = `${targetName}__${targetEmail || ""}__${effectiveJoinUrl}`
        if (videoCallMode && autoPushedTargetRef.current !== pushKey) {
          autoPushedTargetRef.current = pushKey
          const pushRes = await dispatchCameraInvitePush(foundPhone || undefined, false)
          if (!cancelled && pushRes?.emailSent) {
            setStatusNote(
              `✓ Sent instant 1-tap Camera Link to ${pushRes.recipientEmail || targetName}'s phone!`
            )
          }
        }

        if (foundPhone && (autoDialOnMount || (!videoCallMode && looksLikeClientPhone(targetName)))) {
          dialCellNow(foundPhone)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
      hangupCell()
    }
  }, [
    targetName,
    targetEmail,
    callerName,
    callerEmail,
    autoDialOnMount,
    videoCallMode,
    effectiveJoinUrl,
    dispatchCameraInvitePush,
    dialCellNow,
    hangupCell,
  ])

  const handlePushCameraLink = async () => {
    const clean = looksLikeClientPhone(phoneInput) ? normalizeClientPhone(phoneInput) : ""
    if (clean) saveContactPhoneLocal(clean, targetName, targetEmail)
    setStatusNote(`Sending 1-tap Camera Link to ${targetName || "recipient"}...`)
    const data = await dispatchCameraInvitePush(clean || undefined, false)
    if (data?.ok) {
      const channels: string[] = []
      if (data.emailSent) channels.push(`Email (${data.recipientEmail})`)
      if (data.smsSent) channels.push("SMS")
      navigator.clipboard?.writeText(effectiveJoinUrl).catch(() => {})
      setStatusNote(
        channels.length > 0
          ? `✓ Sent Camera Link via ${channels.join(" + ")} (also copied to clipboard!)`
          : `✓ Camera Link copied! Tap WhatsApp or SMS App to send directly to their phone.`
      )
    } else {
      navigator.clipboard?.writeText(effectiveJoinUrl).catch(() => {})
      setStatusNote("✓ Copied Camera Link! Tap WhatsApp or SMS App to send to their phone.")
    }
  }

  const cleanDigits = normalizeClientPhone(phoneInput).replace(/[^\d]/g, "")
  const shareBody = `📹 Live Video Call from ${callerName} on ConnectLn! Tap to turn on your camera & join live: ${effectiveJoinUrl}`
  const whatsappHref = cleanDigits
    ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(shareBody)}`
    : `https://wa.me/?text=${encodeURIComponent(shareBody)}`
  const nativeSmsHref = cleanDigits
    ? `sms:+${cleanDigits}?&body=${encodeURIComponent(shareBody)}`
    : `sms:?&body=${encodeURIComponent(shareBody)}`

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
              {videoCallMode
                ? "Ring Cell Phone + Bring Up Recipient's Mobile Camera"
                : "Ring Recipient's Cell Phone Live"}
              {phase === "in_call" ? ` · ${formatDurationClock(elapsedSec)}` : ""}
            </p>
            <p className="text-[10.5px] text-emerald-300 truncate">
              {statusNote ||
                (videoCallMode
                  ? "Phone calls carry voice only — recipient taps the Camera Link on their phone to stream live video!"
                  : "Dial their mobile number for live two-way cell audio")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder={
              bridgedLegs.length > 0
                ? "Add another # (e.g. 410-841-8358)"
                : "Cell # (e.g. 410-841-8358)"
            }
            className="w-42 rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
          />

          <button
            type="button"
            onClick={() => dialCellNow(phoneInput)}
            style={{ color: "#FFFFFF" }}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
          >
            {bridgedLegs.length > 0 ? (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                <span>+ Add Person</span>
              </>
            ) : (
              <>
                <Phone className="h-3.5 w-3.5" />
                <span>{videoCallMode ? "Ring Cell + Link" : "Ring Cell Live"}</span>
              </>
            )}
          </button>

          {(phase === "connecting" || phase === "ringing" || phase === "in_call") && (
            <button
              type="button"
              onClick={() => {
                hangupCell()
                setPhase("ended")
                setStatusNote("All cell phone lines disconnected.")
              }}
              style={{ color: "#FFFFFF" }}
              className="rounded-lg bg-rose-600 hover:bg-rose-500 px-2.5 py-1.5 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              <span>End Cell ({bridgedLegs.length || 1})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePushCameraLink}
            className="rounded-lg bg-sky-900/80 hover:bg-sky-800 border border-sky-400/40 px-2.5 py-1.5 text-[11px] font-bold text-sky-200 cursor-pointer"
            title="Push 1-tap Camera Link to their Email & SMS + Copy Link"
          >
            📲 Push Camera Link
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-400/40 px-2.5 py-1.5 text-[11px] font-bold text-emerald-200 cursor-pointer no-underline"
            title="Send 1-tap Camera Link via WhatsApp"
          >
            🟢 WhatsApp
          </a>

          <a
            href={nativeSmsHref}
            className="rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-400/40 px-2.5 py-1.5 text-[11px] font-bold text-indigo-200 cursor-pointer no-underline"
            title="Open device SMS app with 1-tap Camera Link pre-filled"
          >
            💬 SMS App
          </a>

          <button
            type="button"
            onClick={() => setShowQrModal((prev) => !prev)}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2 py-1.5 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer"
            title="Show scannable QR code to open camera on any phone"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR</span>
          </button>
        </div>
      </div>

      {bridgedLegs.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {bridgedLegs.map((leg) => (
            <span
              key={leg.callSid}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-200"
            >
              <span>🟢 {leg.label} ({prettyClientPhone(leg.phone)})</span>
              <button
                type="button"
                onClick={() => {
                  setBridgedLegs((prev) => prev.filter((x) => x.callSid !== leg.callSid))
                  fetch("/api/connectin/voice/conference-add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "hangup_participant",
                      callSid: leg.callSid,
                    }),
                  }).catch(() => {})
                }}
                className="text-rose-300 hover:text-white cursor-pointer"
                title="Remove this phone from call"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

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
                Scan with Phone Camera or Share Link to Enable Recipient Video:
              </p>
              <p className="text-[11px] text-slate-300 font-mono break-all">{effectiveJoinUrl}</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(effectiveJoinUrl).catch(() => {})
                  setStatusNote("✓ Copied direct mobile camera link!")
                }}
                className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <Copy className="h-3 w-3" />
                <span>Copy Camera Link</span>
              </button>
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
