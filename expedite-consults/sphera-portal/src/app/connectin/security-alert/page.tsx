"use client"

import React, { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock,
  MailCheck,
  MapPin,
  Monitor,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"

interface AlertDetail {
  alertId: string
  email: string
  fullName: string
  firstName?: string
  eventType?: string
  subject?: string
  headline: string
  summary: string
  locationDisplay: string
  deviceDisplay: string
  timestampDisplay: string
  mapImageUrl: string
  profiles: string[]
  status: "pending" | "secured_locked" | "confirmed_me"
  actionedAtIso?: string
  emailSent?: boolean
}

function SecurityAlertContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const initialEmail = searchParams.get("email") || ""
  const isCheckMode = searchParams.get("check") === "1" || !token

  const [loading, setLoading] = useState(Boolean(token))
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [alertData, setAlertData] = useState<AlertDetail | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [actionResult, setActionResult] = useState<{
    status: "secured_locked" | "confirmed_me"
    message: string
    sessionsRevokedCount?: number
  } | null>(null)

  const [checkEmailInput, setCheckEmailInput] = useState(initialEmail)
  const [checkingEmails, setCheckingEmails] = useState(false)
  const [checkedEmailTarget, setCheckedEmailTarget] = useState("")
  const [officialEmails, setOfficialEmails] = useState<AlertDetail[]>([])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let mounted = true
    setLoading(true)
    setErrorMsg(null)
    fetch(`/api/connectin/security-alert?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => null)
        if (!mounted) return
        if (!res.ok || !data?.valid || !data?.alert) {
          setErrorMsg(data?.error || "This security alert link is invalid or has expired.")
        } else {
          setAlertData(data.alert)
        }
      })
      .catch(() => {
        if (mounted) setErrorMsg("Unable to verify security alert token. Please try again.")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [token])

  const runCheckEmails = useCallback(async (emailToCheck: string) => {
    const clean = emailToCheck.trim().toLowerCase()
    if (!clean) return
    setCheckingEmails(true)
    setCheckedEmailTarget(clean)
    try {
      const res = await fetch(
        `/api/connectin/security-alert?check=1&email=${encodeURIComponent(clean)}`,
        { cache: "no-store" }
      )
      const data = await res.json().catch(() => null)
      if (res.ok && Array.isArray(data?.emails)) {
        setOfficialEmails(data.emails)
      } else {
        setOfficialEmails([])
      }
    } catch {
      setOfficialEmails([])
    } finally {
      setCheckingEmails(false)
    }
  }, [])

  useEffect(() => {
    if (isCheckMode && initialEmail) {
      void runCheckEmails(initialEmail)
    }
  }, [isCheckMode, initialEmail, runCheckEmails])

  const handleRespond = async (action: "this_wasnt_me" | "this_was_me") => {
    if (!token || actionBusy) return
    setActionBusy(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/connectin/security-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, token }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) {
        setErrorMsg(data?.error || "Failed to process your response.")
        return
      }
      setAlertData((prev) => (prev ? { ...prev, status: data.status } : prev))
      setActionResult({
        status: data.status,
        message: data.message,
        sessionsRevokedCount: data.sessionsRevokedCount,
      })
    } catch {
      setErrorMsg("Network error while securing your account.")
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1c1e21]">
      <header className="border-b border-[#e4e6eb] bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href="/connectin"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1c1e21] hover:text-[#0064E0]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0064E0] text-xs font-black text-white">
              CL
            </span>
            <span>ConnectLn Security</span>
          </Link>
          <Link
            href="/connectin-login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4e6eb] px-3 py-1.5 text-xs font-semibold text-[#1c1e21] hover:bg-zinc-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[560px] px-4 py-8">
        {loading && (
          <div className="rounded-xl border border-[#e4e6eb] bg-white p-8 text-center text-sm text-[#65676b]">
            Verifying cryptographic security alert token...
          </div>
        )}

        {!loading && errorMsg && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Security Alert Verification Error</p>
              <p className="text-xs mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {!loading && token && alertData && (
          <div className="space-y-6" data-testid="security-alert-token-view">
            <div>
              <h1 className="text-[26px] font-bold tracking-tight text-[#1c1e21] leading-tight">
                {alertData.headline || "Security alert: password change"}
              </h1>
              <p className="mt-4 text-[15px] text-[#1c1e21]">
                Hi {alertData.firstName || alertData.fullName.split(/\s+/)[0] || "there"},
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#1c1e21]">
                {alertData.summary}
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-[15px] font-bold text-[#1c1e21]">Was this you?</h2>
              <div className="rounded-xl border border-[#e4e6eb] bg-white p-3.5 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={alertData.mapImageUrl}
                  alt={`Location map for ${alertData.locationDisplay}`}
                  className="mb-3.5 w-full rounded-[10px] border border-zinc-200 object-cover"
                />
                <div className="space-y-2.5 text-[15px] text-[#1c1e21]">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 shrink-0 text-[#1c1e21]" />
                    <span>{alertData.locationDisplay}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 shrink-0 text-[#1c1e21]" />
                    <span>{alertData.deviceDisplay}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 shrink-0 text-[#1c1e21]" />
                    <span>{alertData.timestampDisplay}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[15px] text-[#1c1e21]">Profiles in this account:</p>
              <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-[#1c1e21]">
                {alertData.profiles.map((prof) => (
                  <li key={prof}>{prof}</li>
                ))}
              </ul>
            </div>

            {alertData.status === "pending" && (
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  disabled={actionBusy}
                  data-testid="security-alert-lock-btn"
                  onClick={() => handleRespond("this_wasnt_me")}
                  className="w-full cursor-pointer rounded-lg bg-[#0064E0] px-5 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#0052ba] disabled:opacity-60"
                >
                  {actionBusy
                    ? "Locking account & revoking sessions..."
                    : "This wasn't me — Lock Account & Revoke Sessions"}
                </button>
                <button
                  type="button"
                  disabled={actionBusy}
                  data-testid="security-alert-confirm-me-btn"
                  onClick={() => handleRespond("this_was_me")}
                  className="w-full cursor-pointer rounded-lg border border-[#e4e6eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#1c1e21] transition-colors hover:bg-zinc-50 disabled:opacity-60"
                >
                  Yes, this was me
                </button>
              </div>
            )}

            {alertData.status === "secured_locked" && (
              <div
                data-testid="security-alert-locked-confirmation"
                className="rounded-xl border border-rose-300 bg-rose-50 p-5 space-y-2"
              >
                <div className="flex items-center gap-2 text-rose-900 font-bold text-base">
                  <Lock className="h-5 w-5 text-rose-600" />
                  <span>Account Locked &amp; Protected</span>
                </div>
                <p className="text-sm text-rose-800 leading-relaxed">
                  {actionResult?.message ||
                    "Your ConnectLn account has been immediately locked, all active sessions were revoked, and sign-ins are blocked until an administrator completes identity recovery."}
                </p>
                {typeof actionResult?.sessionsRevokedCount === "number" && (
                  <p className="text-xs font-mono text-rose-700">
                    Revoked active sessions: {actionResult.sessionsRevokedCount} · Alert ID: {alertData.alertId}
                  </p>
                )}
              </div>
            )}

            {alertData.status === "confirmed_me" && (
              <div
                data-testid="security-alert-confirmed-me-banner"
                className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 space-y-1.5"
              >
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Confirmed — No Action Needed</span>
                </div>
                <p className="text-sm text-emerald-800">
                  {actionResult?.message ||
                    "Thank you for confirming. Your ConnectLn account remains active with no lockout."}
                </p>
              </div>
            )}

            <div className="border-t border-[#e4e6eb] pt-5 text-xs text-[#65676b] space-y-1">
              <p>
                Thanks,
                <br />
                <strong className="text-[#1c1e21]">ConnectLn Security</strong>
              </p>
              <p className="pt-2">
                Wondering if this email is really from us?{" "}
                <Link
                  href={`/connectin/security-alert?check=1&email=${encodeURIComponent(alertData.email)}`}
                  className="text-[#0064E0] hover:underline"
                >
                  Check official security emails sent to {alertData.email}
                </Link>
              </p>
            </div>
          </div>
        )}

        {!loading && isCheckMode && (
          <div className="space-y-6" data-testid="check-official-emails-section">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0064E0] border border-blue-200">
                <MailCheck className="h-3.5 w-3.5" />
                ConnectLn Help Center · Email Authenticity Log
              </span>
              <h1 className="mt-3 text-2xl font-bold text-[#1c1e21]">
                Check Official ConnectLn Security Emails
              </h1>
              <p className="mt-2 text-sm text-[#65676b] leading-relaxed">
                Every security email ConnectLn sends is recorded here. Enter your account email to confirm whether an alert truly came from ConnectLn Security (<span className="font-mono text-xs text-[#1c1e21]">auth@expediteconsults.com</span>).
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                void runCheckEmails(checkEmailInput)
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                required
                value={checkEmailInput}
                onChange={(e) => setCheckEmailInput(e.target.value)}
                placeholder="Enter your ConnectLn account email..."
                className="flex-1 rounded-lg border border-[#ccd0d5] px-3.5 py-2.5 text-sm text-[#1c1e21] focus:border-[#0064E0] focus:outline-none"
              />
              <button
                type="submit"
                disabled={checkingEmails}
                data-testid="check-official-emails-btn"
                className="cursor-pointer rounded-lg bg-[#0064E0] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0052ba] disabled:opacity-60"
              >
                {checkingEmails ? "Checking..." : "Verify Emails Sent to Me"}
              </button>
            </form>

            {checkedEmailTarget && (
              <div className="space-y-3" data-testid="check-official-emails-results">
                <p className="text-xs font-semibold text-[#65676b]">
                  Recent ConnectLn Security emails for <span className="font-mono text-[#1c1e21]">{checkedEmailTarget}</span> ({officialEmails.length})
                </p>

                {officialEmails.length === 0 ? (
                  <div className="rounded-xl border border-[#e4e6eb] bg-zinc-50 p-5 text-sm text-[#65676b]">
                    No recent ConnectLn security emails were found for this address. If you received a suspicious message claiming to be from ConnectLn, do not click its links or forward it.
                  </div>
                ) : (
                  officialEmails.map((item) => (
                    <div
                      key={item.alertId}
                      className="rounded-xl border border-[#e4e6eb] bg-white p-4 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-[#1c1e21]">{item.headline}</h3>
                          <p className="text-[11px] font-mono text-[#65676b]">ID: {item.alertId}</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            item.status === "secured_locked"
                              ? "bg-rose-100 text-rose-800"
                              : item.status === "confirmed_me"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-[#0064E0]"
                          }`}
                        >
                          {item.status === "secured_locked"
                            ? "Secured & Locked"
                            : item.status === "confirmed_me"
                            ? "Confirmed by User"
                            : "Alert Sent"}
                        </span>
                      </div>
                      <div className="text-xs text-[#65676b] space-y-1">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#1c1e21]" />
                          {item.locationDisplay}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Monitor className="h-3.5 w-3.5 text-[#1c1e21]" />
                          {item.deviceDisplay}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#1c1e21]" />
                          {item.timestampDisplay}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-[#1c1e21] space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-[#0064E0]">
                <ShieldCheck className="h-4 w-4" />
                Anti-Phishing Verification Standard
              </p>
              <p className="text-[#65676b]">
                Legitimate ConnectLn security alerts always come from <span className="font-mono text-[#1c1e21]">auth@expediteconsults.com</span>, link exclusively to <span className="font-mono text-[#1c1e21]">conectln.com</span>, and appear in this log immediately upon dispatch.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function ConnectInSecurityAlertPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-sm text-[#65676b]">
          Loading ConnectLn Security Center...
        </div>
      }
    >
      <SecurityAlertContent />
    </Suspense>
  )
}
