"use client"

import React, { useEffect, useState } from "react"
import { Smartphone, Lock, LogOut } from "lucide-react"
import {
  GLOBAL_COUNTRY_DIAL_CODES,
  buildGlobalE164Phone,
} from "@/lib/connectin-international-phones"
import {
  MY_LINKED_PHONE_STORAGE_KEY,
  getMyLinkedConnectLnPhone,
} from "./ConnectLnWhatsAppCallModal"
import {
  registerNativeFcmForCalls,
  getCachedNativeFcmToken,
  registerConnectLnPushSubscription,
} from "@/lib/connectin-native-callkit-bridge"

/**
 * Mandatory phone + 2FA gate for every signed-in ConnectLn account (including
 * "Continue with Google" and "Continue with Microsoft Entra ID"). Blocks the app until the
 * user verifies a mobile number they own; that number becomes their calling identity and
 * is what others dial to ring them. Cannot be dismissed (only signed out).
 */
export function ConnectLnPhoneVerificationGate({
  viewerName,
  viewerEmail,
  viewerPhone,
  viewerId,
  onSignOut,
}: {
  viewerName?: string
  viewerEmail?: string
  viewerPhone?: string
  viewerId?: string
  onSignOut: () => void
}) {
  const [needsPhone, setNeedsPhone] = useState(false)
  const [countryIso, setCountryIso] = useState("US")
  const [localNum, setLocalNum] = useState("")
  const [channel, setChannel] = useState<"all" | "sms" | "call" | "email">("all")
  const [step, setStep] = useState<"input" | "code">("input")
  const [pendingPhone, setPendingPhone] = useState("")
  const [challenge, setChallenge] = useState("")
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    // Never block guests joining a call from a shared link
    const sp = new URLSearchParams(window.location.search)
    if (sp.get("waCall") || sp.get("joinCall") || sp.get("call")) return
    if (String(viewerId || "").startsWith("guest-")) return

    const rawEmail = (viewerEmail || "").trim()
    const isRealEmail =
      Boolean(rawEmail) && !rawEmail.endsWith("@connectin.app") && !rawEmail.endsWith("@connectin.phone")
    const phone = (viewerPhone || getMyLinkedConnectLnPhone() || "").trim()

    // Pre-arm native Android FCM token even before phone verification finishes
    void registerNativeFcmForCalls({ phone: phone || "", name: viewerName, email: viewerEmail })

    // No real email AND no phone on the profile or device -> must verify a phone.
    if (!isRealEmail && !phone) {
      setNeedsPhone(true)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const qs = new URLSearchParams({ viewerName: viewerName || "" })
        if (isRealEmail) qs.set("viewerEmail", rawEmail)
        if (phone) qs.set("viewerPhone", phone)
        const res = await fetch(`/api/connectin/calls/whatsapp?${qs.toString()}`, { cache: "no-store" })
        if (!res.ok || cancelled) return
        const data = await res.json()
        const verified = Boolean(data?.myRegistration?.verifiedBy2FA && data?.myRegistration?.phone)
        if (!cancelled) setNeedsPhone(!verified)
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [viewerEmail, viewerName, viewerPhone, viewerId])

  if (!needsPhone) return null

  const rawEmail = (viewerEmail || "").trim().toLowerCase()
  const isRealEmail =
    Boolean(rawEmail) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) &&
    !rawEmail.endsWith(".conectln.com") &&
    !rawEmail.endsWith("@conectln.com") &&
    !rawEmail.endsWith("@connectin.app") &&
    !rawEmail.endsWith("@connectin.phone")
  const country = GLOBAL_COUNTRY_DIAL_CODES.find((c) => c.iso === countryIso) || GLOBAL_COUNTRY_DIAL_CODES[0]

  const sendCode = async () => {
    const e164 = buildGlobalE164Phone(country.code, localNum)
    if (!e164 || e164.replace(/\D/g, "").length < 8) {
      setError("Enter a valid mobile number.")
      return
    }
    setBusy(true)
    setError("")
    setInfo("")
    try {
      const res = await fetch("/api/connectin/calls/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_phone_2fa",
          phone: e164,
          name: viewerName,
          email: viewerEmail,
          channel,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Could not send verification code.")
      setPendingPhone(data.phone || e164)
      setChallenge(data.otpChallengeToken || "")
      setStep("code")
      setInfo(data.message || "Enter the 6-digit code we sent you.")
    } catch (err: any) {
      setError(err?.message || "Could not send verification code.")
    } finally {
      setBusy(false)
    }
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code.")
      return
    }
    setBusy(true)
    setError("")
    const permPromise =
      typeof window !== "undefined" && "Notification" in window && Notification.permission === "default"
        ? Notification.requestPermission().catch(() => "default" as NotificationPermission)
        : Promise.resolve(
            typeof window !== "undefined" && "Notification" in window
              ? Notification.permission
              : ("default" as NotificationPermission)
          )
    try {
      await permPromise
      const cfgRes = await fetch("/api/connectin/calls/whatsapp", { cache: "no-store" }).catch(() => null)
      const cfgData = cfgRes && cfgRes.ok ? await cfgRes.json().catch(() => null) : null
      const pushSub = cfgData?.vapidPublicKey
        ? await registerConnectLnPushSubscription(cfgData.vapidPublicKey).catch(() => null)
        : null

      const res = await fetch("/api/connectin/calls/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_phone_2fa",
          phone: pendingPhone,
          code: code.trim(),
          otpChallengeToken: challenge,
          name: viewerName,
          email: viewerEmail,
          pushSubscription: pushSub || undefined,
          fcmToken: getCachedNativeFcmToken() || undefined,
          deviceLabel:
            typeof navigator !== "undefined" && /iPhone|Android|Mobile/i.test(navigator.userAgent)
              ? "Mobile Phone"
              : "Desktop Browser",
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Invalid or expired code.")
      const confirmed = data?.member?.phone || pendingPhone
      try {
        window.localStorage.setItem(MY_LINKED_PHONE_STORAGE_KEY, confirmed)
        window.dispatchEvent(new Event("connectln_phone_linked"))
      } catch {}
      // Immediately register Native Android FCM + Web Push for the newly verified phone!
      void registerNativeFcmForCalls({ phone: confirmed, name: viewerName, email: viewerEmail })
      setNeedsPhone(false)
    } catch (err: any) {
      setError(err?.message || "Verification failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#FBF8F3] border border-[#D5BBA3] shadow-2xl p-5 text-[#1C1917]">
        <div className="flex items-center gap-2.5">
          <span className="h-10 w-10 rounded-xl bg-[#7C4225] text-white flex items-center justify-center">
            <Smartphone className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-extrabold">Verify your mobile number</h2>
            <p className="text-[11.5px] text-[#57534E]">Required for every ConnectLn account</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-[#44403C] leading-relaxed">
          Your verified number is your ConnectLn calling identity. People call you on it, and it
          prevents anyone from impersonating your number.
        </p>

        {step === "input" ? (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <select
                value={countryIso}
                onChange={(e) => setCountryIso(e.target.value)}
                className="w-[44%] rounded-lg border border-[#D0C4AE] bg-white px-2 py-2 text-xs"
              >
                {GLOBAL_COUNTRY_DIAL_CODES.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="tel"
                autoFocus
                value={localNum}
                onChange={(e) => setLocalNum(e.target.value)}
                placeholder="Mobile number"
                className="flex-1 rounded-lg border border-[#D0C4AE] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-bold">
              {(
                [
                  { id: "all", label: isRealEmail ? "🔔 All 3" : "🔔 SMS + Call" },
                  { id: "sms", label: "💬 SMS" },
                  { id: "call", label: "📞 Call" },
                  ...(isRealEmail ? ([{ id: "email", label: "✉️ Email" }] as const) : []),
                ] as const
              ).map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch.id)}
                  className={`rounded-lg px-2 py-1.5 border cursor-pointer ${
                    channel === ch.id ? "bg-[#7C4225] text-white border-[#7C4225]" : "bg-white border-[#D0C4AE]"
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
            <p className="text-[10.5px] text-[#57534E]">
              {channel === "all"
                ? isRealEmail
                  ? "Sends your 6-digit code via Email, SMS, and an automated Phone Call."
                  : "Sends your 6-digit code via SMS and an automated Phone Call."
                : channel === "call"
                  ? "Places an automated voice call speaking your 6-digit code."
                  : channel === "email"
                    ? `Sends your 6-digit code to ${rawEmail}.`
                    : "Sends your 6-digit code via SMS text message."}
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={sendCode}
              style={{ color: "#FFFFFF" }}
              className="w-full rounded-xl bg-[#7C4225] hover:bg-[#5E3119] py-2.5 text-sm font-extrabold cursor-pointer disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send verification code"}
            </button>
          </div>
        ) : (
          <form onSubmit={verifyCode} className="mt-4 space-y-3">
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              className="w-full rounded-lg border border-[#D0C4AE] bg-white px-3 py-2.5 text-center text-lg tracking-[0.4em] font-mono"
            />
            <button
              type="submit"
              disabled={busy}
              style={{ color: "#FFFFFF" }}
              className="w-full rounded-xl bg-[#7C4225] hover:bg-[#5E3119] py-2.5 text-sm font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Lock className="h-4 w-4" />
              {busy ? "Verifying..." : "Verify & continue"}
            </button>
            <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5 text-[11px] font-semibold">
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setChannel("call")
                  setBusy(true)
                  setError("")
                  try {
                    const res = await fetch("/api/connectin/calls/whatsapp", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "send_phone_2fa",
                        phone: pendingPhone,
                        name: viewerName,
                        email: viewerEmail,
                        channel: "call",
                      }),
                    })
                    const data = await res.json()
                    if (!res.ok || !data?.ok) throw new Error(data?.error || "Could not place call.")
                    if (data.otpChallengeToken) setChallenge(data.otpChallengeToken)
                    setInfo(data.message || "Automated phone call placed.")
                  } catch (err: any) {
                    setError(err?.message || "Could not place call.")
                  } finally {
                    setBusy(false)
                  }
                }}
                className="rounded-md bg-[#EFE8DA] px-2.5 py-1 text-[#5E3119] cursor-pointer disabled:opacity-50"
              >
                📞 Resend via Call
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setChannel("sms")
                  setBusy(true)
                  setError("")
                  try {
                    const res = await fetch("/api/connectin/calls/whatsapp", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "send_phone_2fa",
                        phone: pendingPhone,
                        name: viewerName,
                        email: viewerEmail,
                        channel: "sms",
                      }),
                    })
                    const data = await res.json()
                    if (!res.ok || !data?.ok) throw new Error(data?.error || "Could not send SMS.")
                    if (data.otpChallengeToken) setChallenge(data.otpChallengeToken)
                    setInfo(data.message || "SMS sent.")
                  } catch (err: any) {
                    setError(err?.message || "Could not send SMS.")
                  } finally {
                    setBusy(false)
                  }
                }}
                className="rounded-md bg-[#EFE8DA] px-2.5 py-1 text-[#5E3119] cursor-pointer disabled:opacity-50"
              >
                💬 Resend SMS
              </button>
              {isRealEmail && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setChannel("email")
                    setBusy(true)
                    setError("")
                    try {
                      const res = await fetch("/api/connectin/calls/whatsapp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "send_phone_2fa",
                          phone: pendingPhone,
                          name: viewerName,
                          email: viewerEmail,
                          channel: "email",
                        }),
                      })
                      const data = await res.json()
                      if (!res.ok || !data?.ok) throw new Error(data?.error || "Could not send Email.")
                      if (data.otpChallengeToken) setChallenge(data.otpChallengeToken)
                      setInfo(data.message || "Email sent.")
                    } catch (err: any) {
                      setError(err?.message || "Could not send Email.")
                    } finally {
                      setBusy(false)
                    }
                  }}
                  className="rounded-md bg-[#EFE8DA] px-2.5 py-1 text-[#5E3119] cursor-pointer disabled:opacity-50"
                >
                  ✉️ Resend Email
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("input")
                setCode("")
                setInfo("")
              }}
              className="w-full text-[11px] font-semibold text-[#5E3119] underline cursor-pointer"
            >
              Change number / resend code
            </button>
          </form>
        )}

        {info && <p className="mt-3 text-[11.5px] text-emerald-800">{info}</p>}
        {error && <p className="mt-3 text-[11.5px] font-semibold text-rose-700">{error}</p>}

        <button
          type="button"
          onClick={onSignOut}
          className="mt-4 w-full flex items-center justify-center gap-1.5 text-[11px] text-[#78716C] hover:text-[#1C1917] cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out instead
        </button>
      </div>
    </div>
  )
}
