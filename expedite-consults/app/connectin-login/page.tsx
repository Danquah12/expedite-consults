"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Users,
  Building2,
  Briefcase,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { DEMO_AUTH_PERSONAS, AuthPersona } from "@/components/linkedin/ConnectInAuthModal"
import { saveStoredUser, saveStoredSessionRoute } from "@/lib/connectin-storage"

export default function ConnectInLoginPage() {
  const router = useRouter()

  // Main Mode: 'signin' (Sign in) vs 'join' (Join now / Register)
  const [activeView, setActiveView] = useState<'signin' | 'join'>('signin')

  // Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false)

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInStep, setSignInStep] = useState<'credentials' | '2fa'>('credentials')
  const [signIn2FACode, setSignIn2FACode] = useState("")
  const [signInBackupCode, setSignInBackupCode] = useState<string | null>(null)

  // Join Now (Registration) Form State
  const [joinFirstName, setJoinFirstName] = useState("")
  const [joinLastName, setJoinLastName] = useState("")
  const [joinEmail, setJoinEmail] = useState("")
  const [joinPassword, setJoinPassword] = useState("")
  const [joinRole, setJoinRole] = useState<'personal' | 'enterprise' | 'creator' | 'seller' | 'developer'>('personal')
  const [joinStep, setJoinStep] = useState<'form' | '2fa'>('form')
  const [join2FACode, setJoin2FACode] = useState("")
  const [joinBackupCode, setJoinBackupCode] = useState<string | null>(null)

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Demo Personas Drawer (Collapsed by default for clean UX)
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SIGN IN FLOW (Email & Password -> 2FA -> Instant Login)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInEmail) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/connectin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInEmail,
          password: signInPassword,
          channel: "email"
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Sign in failed. Please check your credentials.")
      }

      setSignInBackupCode(data.backupCode || data.devCode || null)
      setSignInStep('2fa')
      setSuccessMessage(`Security code sent to ${data.target || signInEmail}`)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifySignIn2FA = async (codeToSubmit?: string) => {
    const code = codeToSubmit || signIn2FACode
    if (!code) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/connectin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: signInEmail,
          code
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code.")
      }

      if (data.profile) {
        saveStoredUser(data.profile)
      }

      setSuccessMessage("✓ Verified! Signing you in...")
      setTimeout(() => {
        router.push("/connectin")
      }, 500)
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed.")
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. JOIN NOW FLOW (Registration -> 2FA -> Direct Instant Login)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinFirstName || !joinEmail) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/connectin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: joinFirstName,
          lastName: joinLastName,
          email: joinEmail,
          password: joinPassword,
          role: joinRole,
          twoFactorChannel: "email"
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.")
      }

      setJoinBackupCode(data.backupCode || data.devCode || null)
      setJoinStep('2fa')
      setSuccessMessage(`Verification code sent to ${joinEmail}`)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyJoin2FA = async (codeToSubmit?: string) => {
    const code = codeToSubmit || join2FACode
    if (!code) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/connectin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: joinEmail,
          code
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code.")
      }

      const targetTab =
        joinRole === 'enterprise' ? 'procurement' :
        joinRole === 'creator' ? 'media' :
        joinRole === 'seller' ? 'sellercenter' :
        joinRole === 'developer' ? 'code' : 'home'

      const targetWorkspace: 'personal' | 'enterprise' | 'creator' | 'seller' =
        joinRole === 'enterprise' ? 'enterprise' :
        joinRole === 'creator' ? 'creator' :
        joinRole === 'seller' ? 'seller' : 'personal'

      if (data.profile) {
        saveStoredUser(data.profile)
      }
      saveStoredSessionRoute(targetTab, targetWorkspace)

      setSuccessMessage("✓ Welcome to ConnectIn! Launching your workspace...")
      setTimeout(() => {
        router.push("/connectin")
      }, 600)
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed.")
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. ONE-CLICK DEMO PERSONA LOGIN
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePersonaLogin = async (persona: AuthPersona) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/connectin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: persona.name.split(" ")[0],
          lastName: persona.name.split(" ").slice(1).join(" "),
          email: persona.email,
          role: persona.role,
          twoFactorChannel: "email"
        })
      })
      const data = await res.json()

      const targetCode = data.backupCode || data.devCode || "749204"
      const verifyRes = await fetch("/api/connectin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: persona.email,
          code: targetCode
        })
      })
      const verifyData = await verifyRes.json()

      if (verifyData.profile) {
        saveStoredUser(verifyData.profile)
        saveStoredSessionRoute(persona.defaultTab, persona.defaultWorkspace)
      }

      router.push("/connectin")
    } catch (err) {
      router.push("/connectin")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f2f0] dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between font-sans selection:bg-[#0A66C2] selection:text-white">
      {/* ─── 1. TOP LINKEDIN-STYLE NAVBAR ─── */}
      <header className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 sm:px-12 py-3 flex items-center justify-between shadow-xs">
        <Link href="/connectin" className="flex items-center gap-1.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A66C2] text-white font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
            in
          </span>
          <span className="font-bold text-xl tracking-tight text-[#0A66C2] dark:text-white">
            Connect<span className="text-[#0A66C2]">In</span>
          </span>
        </Link>

        {/* Right Switch Button: If on sign in, show Join now; if on join, show Sign in */}
        <div className="flex items-center gap-3">
          {activeView === 'signin' ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline">New to ConnectIn?</span>
              <button
                onClick={() => {
                  setActiveView('join')
                  setJoinStep('form')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className="rounded-full border border-[#0A66C2] px-4 py-1.5 text-sm font-semibold text-[#0A66C2] dark:text-sky-400 hover:bg-[#0A66C2]/10 transition-colors"
              >
                Join now
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline">Already on ConnectIn?</span>
              <button
                onClick={() => {
                  setActiveView('signin')
                  setSignInStep('credentials')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className="rounded-full border border-[#0A66C2] px-4 py-1.5 text-sm font-semibold text-[#0A66C2] dark:text-sky-400 hover:bg-[#0A66C2]/10 transition-colors"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── 2. MAIN CENTER CONTENT CARD ─── */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-[420px] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-7 sm:p-8 shadow-xl space-y-6">

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && !errorMessage && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* VIEW A: SIGN IN                                                    */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeView === 'signin' && (
            <>
              {signInStep === 'credentials' ? (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                      Sign in
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                      Stay updated on your professional world
                    </p>
                  </div>

                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Email or phone
                      </label>
                      <input
                        type="text"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="e.g. asiedudanquah@gmail.com"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-xs font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                        />
                      </div>
                    </div>

                    {/* Primary Sign In Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-3 text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>Sign in</span>
                    </button>
                  </form>

                  {/* LinkedIn-style Divider */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 font-medium absolute">
                      or
                    </span>
                  </div>

                  {/* Enterprise SSO / Google */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handlePersonaLogin(DEMO_AUTH_PERSONAS[0])}
                      className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>🌐 Continue with Google or Corporate SSO</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: 2FA Verification (Seamless Code Entry) */
                <div className="space-y-5 text-center">
                  <div className="space-y-1">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0A66C2] dark:text-sky-400 flex items-center justify-center mx-auto text-xl font-bold">
                      🔐
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      Two-Step Verification
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Enter the 6-digit verification code sent to <strong className="text-zinc-900 dark:text-zinc-200">{signInEmail}</strong>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      autoFocus
                      maxLength={6}
                      value={signIn2FACode}
                      onChange={(e) => setSignIn2FACode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full text-center text-2xl font-mono font-bold tracking-widest rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3 text-[#0A66C2] dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                    />

                    {/* Auto-Fill Helper */}
                    {signInBackupCode && (
                      <button
                        type="button"
                        onClick={() => {
                          setSignIn2FACode(signInBackupCode)
                          handleVerifySignIn2FA(signInBackupCode)
                        }}
                        className="w-full rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 p-2.5 text-xs text-[#0A66C2] dark:text-sky-300 font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>⚡ Click to Auto-Fill Code: <strong>{signInBackupCode}</strong></span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSignInStep('credentials')}
                        className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifySignIn2FA()}
                        disabled={isLoading}
                        className="flex-1 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white py-2.5 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                      >
                        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Verify &amp; Sign in</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* VIEW B: JOIN NOW (REGISTRATION)                                    */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeView === 'join' && (
            <>
              {joinStep === 'form' ? (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                      Join ConnectIn
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                      Make the most of your professional life
                    </p>
                  </div>

                  <form onSubmit={handleJoinSubmit} className="space-y-3.5">
                    {/* Names Row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">First name</label>
                        <input
                          type="text"
                          required
                          value={joinFirstName}
                          onChange={(e) => setJoinFirstName(e.target.value)}
                          placeholder="Kwesi"
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Last name</label>
                        <input
                          type="text"
                          required
                          value={joinLastName}
                          onChange={(e) => setJoinLastName(e.target.value)}
                          placeholder="Asiedu"
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Work / Personal Email</label>
                      <input
                        type="email"
                        required
                        value={joinEmail}
                        onChange={(e) => setJoinEmail(e.target.value)}
                        placeholder="asiedudanquah@gmail.com"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password (6 or more characters)</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      />
                    </div>

                    {/* Primary Role Choice */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Your Primary Role</label>
                      <select
                        value={joinRole}
                        onChange={(e) => setJoinRole(e.target.value as any)}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      >
                        <option value="personal">👤 Individual Professional (Feed &amp; Skills)</option>
                        <option value="enterprise">🏢 Enterprise Buyer (Procurement &amp; RFPs)</option>
                        <option value="creator">🎬 Creator &amp; Studio Host (Video &amp; Podcasts)</option>
                        <option value="seller">💼 Marketplace Seller (Storefront &amp; Licenses)</option>
                        <option value="developer">🧑‍💻 Defense &amp; Kernel Developer (Code &amp; Labs)</option>
                      </select>
                    </div>

                    <p className="text-[10px] text-zinc-500 leading-tight pt-1">
                      By clicking Agree &amp; Join, you agree to the ConnectIn User Agreement, Privacy Policy, and Zero-Trust Identity Terms.
                    </p>

                    {/* Primary Join Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-3 text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>Agree &amp; Join</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* Step 2: Confirm Email -> Immediately Log in & Launch */
                <div className="space-y-5 text-center">
                  <div className="space-y-1">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                      ✉️
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      Confirm Your Email
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Type in the 6-digit code sent to <strong className="text-zinc-900 dark:text-zinc-200">{joinEmail}</strong>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      autoFocus
                      maxLength={6}
                      value={join2FACode}
                      onChange={(e) => setJoin2FACode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full text-center text-2xl font-mono font-bold tracking-widest rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    {/* Instant Auto-Fill Helper */}
                    {joinBackupCode && (
                      <button
                        type="button"
                        onClick={() => {
                          setJoin2FACode(joinBackupCode)
                          handleVerifyJoin2FA(joinBackupCode)
                        }}
                        className="w-full rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>⚡ Click to Auto-Fill &amp; Join: <strong>{joinBackupCode}</strong></span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setJoinStep('form')}
                        className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifyJoin2FA()}
                        disabled={isLoading}
                        className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                      >
                        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Confirm &amp; Join</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* ─── 3. COLLAPSIBLE BOTTOM DRAWER: 1-CLICK DEMO PERSONAS ─── */}
        <div className="w-full max-w-[420px] mt-4">
          <button
            onClick={() => setIsDemoDrawerOpen(!isDemoDrawerOpen)}
            className="w-full py-2.5 px-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 font-semibold flex items-center justify-between transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#0A66C2]" />
              <span>⚡ Testing? Try 1-Click Demo Personas</span>
            </span>
            {isDemoDrawerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isDemoDrawerOpen && (
            <div className="mt-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 shadow-lg space-y-2 animate-in fade-in zoom-in-95">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Instantly switch roles to test different workspace views:
              </p>
              <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                {DEMO_AUTH_PERSONAS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handlePersonaLogin(p)}
                    className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between gap-2 transition-colors group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img src={p.avatar} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-zinc-300" />
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#0A66C2]">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">{p.title}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-[#0A66C2] shrink-0 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                      Log In →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── 4. LINKEDIN-STYLE CLEAN FOOTER ─── */}
      <footer className="w-full bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-4 px-6 text-center text-[11px] text-zinc-500 space-y-1">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/about-us" className="hover:underline">About</Link>
          <Link href="/assessment" className="hover:underline">Security Framework</Link>
          <Link href="/legal/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link href="/services" className="hover:underline">Ecosystem Services</Link>
          <Link href="/contact-us" className="hover:underline">Support</Link>
        </div>
        <p className="text-zinc-400">Expedite Consults LLC © 2026 · ConnectIn Zero-Trust Identity Protocol</p>
      </footer>
    </div>
  )
}
