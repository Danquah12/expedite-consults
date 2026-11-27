"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react"

interface ConnectLnPortalRequestSectionProps {
  showFooter?: boolean
  sourcePage?: string
  defaultName?: string
  defaultEmail?: string
  onNavigateTab?: (tab: string) => void
}

const PLACEHOLDER_NAMES = new Set(["", "guest", "guest user", "connectln member", "member"])

function isRealDefaultName(name?: string): boolean {
  const clean = String(name || "").trim()
  if (!clean) return false
  return !PLACEHOLDER_NAMES.has(clean.toLowerCase())
}

function isRealDefaultEmail(email?: string): boolean {
  const clean = String(email || "").trim().toLowerCase()
  if (!clean || !clean.includes("@")) return false
  return !clean.endsWith("@connectin.phone") && !clean.startsWith("guest@")
}

export function ConnectLnPortalRequestSection({
  showFooter = false,
  sourcePage = "/connectin",
  defaultName = "",
  defaultEmail = "",
  onNavigateTab,
}: ConnectLnPortalRequestSectionProps) {
  const [fullName, setFullName] = useState(() => (isRealDefaultName(defaultName) ? defaultName.trim() : ""))
  const [email, setEmail] = useState(() => (isRealDefaultEmail(defaultEmail) ? defaultEmail.trim() : ""))
  const [phoneOrOrg, setPhoneOrOrg] = useState("")
  const [message, setMessage] = useState("")
  const [hasEditedName, setHasEditedName] = useState(false)
  const [hasEditedEmail, setHasEditedEmail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submittedRecord, setSubmittedRecord] = useState<{ requestId: string; email: string } | null>(null)

  useEffect(() => {
    if (!hasEditedName && isRealDefaultName(defaultName)) {
      setFullName(defaultName.trim())
    }
  }, [defaultName, hasEditedName])

  useEffect(() => {
    if (!hasEditedEmail && isRealDefaultEmail(defaultEmail)) {
      setEmail(defaultEmail.trim())
    }
  }, [defaultEmail, hasEditedEmail])

  const handleNavigateModule = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab)
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      return
    }
    if (typeof window !== "undefined") {
      window.location.href = `/connectin?tab=${encodeURIComponent(tab)}`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const cleanName = fullName.trim()
    const cleanEmail = email.trim()
    if (cleanName.length < 2) {
      setErrorMsg("Please enter your full name (at least 2 characters).")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg("Please enter a valid work or personal email address.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/connectin/portal-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          phoneOrOrg: phoneOrOrg.trim(),
          message: message.trim(),
          sourcePage,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Could not send request. Please try again.")
      }
      setSubmittedRecord({
        requestId: String(data.requestId || `REQ-${Date.now().toString(36).toUpperCase().slice(-6)}`),
        email: cleanEmail,
      })
      setPhoneOrOrg("")
      setMessage("")
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not send request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div id="portal-request-section" className="w-full">
      {/* ─── SAGE OUTER BAND + CENTERED DARK EMERALD REQUEST CARD ─── */}
      <section className="bg-[#DDE5DE] dark:bg-[#0D1A15] py-14 sm:py-16 px-4 sm:px-6 border-t border-emerald-950/10 dark:border-emerald-900/40">
        <div className="mx-auto max-w-4xl rounded-2xl bg-[#041E14] bg-gradient-to-b from-[#06261A] to-[#03170F] border border-emerald-900/60 px-6 sm:px-12 py-10 sm:py-12 shadow-[0_24px_60px_rgba(3,23,15,0.28)] text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight max-w-2xl mx-auto">
            Ready to elevate your workspace &amp; business with ConnectLn?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#A9C2B6] max-w-xl mx-auto leading-relaxed">
            Send a request, book a consultation, or launch custom workflows across 23+ Power Apps on
            ConnectLn anytime, anywhere.
          </p>

          {submittedRecord ? (
            <div className="mt-7 mx-auto max-w-xl rounded-xl border border-emerald-500/40 bg-[#072A1E] p-5 text-left shadow-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">
                    Request received — Reference{" "}
                    <span className="font-mono text-emerald-300">{submittedRecord.requestId}</span>
                  </p>
                  <p className="mt-1 text-xs text-[#A9C2B6] leading-relaxed">
                    Our ConnectLn team has logged your request and sent a confirmation to{" "}
                    <span className="font-semibold text-white">{submittedRecord.email}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRecord(null)
                      setErrorMsg(null)
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#F1F5F2] hover:bg-white text-[#041E14] px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Send another request
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  aria-label="Your Full Name"
                  placeholder="Your Full Name *"
                  value={fullName}
                  onChange={(e) => {
                    setHasEditedName(true)
                    setFullName(e.target.value)
                  }}
                  className="w-full rounded-lg border border-[#1E5C45] bg-[#072A1E]/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#6E9484] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
                />
                <input
                  type="email"
                  required
                  aria-label="Work or Personal Email"
                  placeholder="Work or Personal Email *"
                  value={email}
                  onChange={(e) => {
                    setHasEditedEmail(true)
                    setEmail(e.target.value)
                  }}
                  className="w-full rounded-lg border border-[#1E5C45] bg-[#072A1E]/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#6E9484] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
                />
                <input
                  type="text"
                  aria-label="Phone Number or Organization"
                  placeholder="Phone Number or Organization"
                  value={phoneOrOrg}
                  onChange={(e) => setPhoneOrOrg(e.target.value)}
                  className="w-full rounded-lg border border-[#1E5C45] bg-[#072A1E]/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#6E9484] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
                />
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  aria-label="Request details"
                  placeholder="How can we help? (Request details, custom app, or consultation topic)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-[#1E5C45] bg-[#072A1E]/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#6E9484] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
                />
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="mt-3 rounded-lg border border-red-400/40 bg-red-950/50 px-3.5 py-2 text-xs font-semibold text-red-200"
                >
                  {errorMsg}
                </div>
              )}

              <div className="mt-5 flex justify-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F1F5F2] hover:bg-white text-[#041E14] px-7 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <span>Send Request &amp; Schedule Consultation</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ─── MATCHING 3-COLUMN PORTAL FOOTER (SHOWN ON /connectin WORKSPACE) ─── */}
      {showFooter && (
        <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-12 pb-24 sm:pb-16 px-6 sm:px-10">
          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Column 1: Brand & Mission */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-[#064E3B] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  C
                </span>
                <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                  ConnectLn
                </span>
              </div>
              <p className="text-base sm:text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug max-w-[260px]">
                Empowering your work &amp; decisions with real-time answers.
              </p>
            </div>

            {/* Column 2: ConnectLn Modules */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                ConnectLn Modules
              </h3>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigateModule("home")}
                    className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Home &amp; Network Feed
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigateModule("powerapps")}
                    className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer text-left"
                  >
                    <span>Power Apps Hub (23 Live Apps)</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigateModule("messaging")}
                    className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Mail &amp; Sovereign Chat
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigateModule("vibecomms")}
                    className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Vibe Calls &amp; Broadcast Studio
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigateModule("jobs")}
                    className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Verified Jobs &amp; Academy
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Workspace & Enterprise Tools */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Workspace &amp; Enterprise Tools
              </h3>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigateModule("workbusiness")}
                    className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Business &amp; RFP Hub
                  </button>
                </li>
                <li>
                  <Link
                    href="/connectin-portal"
                    className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    ConnectLn 360 Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/connectin-portal/admin"
                    className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Administration Guide
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigateModule("accountsecurity")}
                    className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Trust &amp; Passkey Security
                  </button>
                </li>
                <li>
                  <Link
                    href="/connectin-login"
                    className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <span>Register / Sign In to Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
