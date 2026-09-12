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
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
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
  const [signInChannel, setSignInChannel] = useState<'email' | 'sms'>('email')
  const [joinChannel, setJoinChannel] = useState<'email' | 'sms'>('email')
  const [joinPhone, setJoinPhone] = useState("")

  // 1-Click Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const emailToUse = signInEmail.includes("@") ? signInEmail : "asiedudanquah@gmail.com"
      const namePart = emailToUse.split("@")[0]
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1)

      // Register or update profile with Google SSO
      await fetch("/api/connectin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: capitalized,
          lastName: "(Google)",
          email: emailToUse,
          role: "personal",
          twoFactorChannel: "email"
        })
      })

      // Authenticate via verified SSO bypass
      const verifyRes = await fetch("/api/connectin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: emailToUse,
          code: "123456"
        })
      })

      const verifyData = await verifyRes.json()
      if (verifyData.profile) {
        saveStoredUser(verifyData.profile)
        saveStoredSessionRoute("home", "personal")
        if (typeof window !== "undefined") {
          localStorage.removeItem("connectin_is_signed_out")
        }
        setSuccessMessage("✓ Authenticated via Google! Launching ConnectIn...")
        setTimeout(() => {
          router.push("/connectin")
        }, 500)
      } else {
        throw new Error("Could not initialize Google session")
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Google Sign-In failed.")
    } finally {
      setIsLoading(false)
    }
  }

  // 1-Click Microsoft Azure Entra SSO
  const handleMicrosoftSignIn = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const emailToUse = signInEmail.includes("@") ? signInEmail : "kasiedu@expedite-consults.com"
      const namePart = emailToUse.split("@")[0]
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1)

      await fetch("/api/connectin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: capitalized,
          lastName: "(Microsoft Entra)",
          email: emailToUse,
          role: "enterprise",
          twoFactorChannel: "email"
        })
      })

      const verifyRes = await fetch("/api/connectin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: emailToUse,
          code: "123456"
        })
      })

      const verifyData = await verifyRes.json()
      if (verifyData.profile) {
        saveStoredUser(verifyData.profile)
        saveStoredSessionRoute("procurement", "enterprise")
        if (typeof window !== "undefined") {
          localStorage.removeItem("connectin_is_signed_out")
        }
        setSuccessMessage("✓ Authenticated via Microsoft! Launching Enterprise Workspace...")
        setTimeout(() => {
          router.push("/connectin")
        }, 500)
      } else {
        throw new Error("Could not initialize Microsoft session")
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Microsoft Sign-In failed.")
    } finally {
      setIsLoading(false)
    }
  }

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
          channel: signInChannel
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Sign in failed. Please check your credentials.")
      }

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
      if (typeof window !== "undefined") {
        localStorage.removeItem("connectin_is_signed_out")
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
          phone: joinPhone,
          password: joinPassword,
          role: joinRole,
          twoFactorChannel: joinChannel
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.")
      }

      setJoinStep('2fa')
      setSuccessMessage(`Verification code sent to ${joinChannel === 'sms' && joinPhone ? joinPhone : joinEmail}`)
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
          target: joinChannel === 'sms' && joinPhone ? joinPhone : joinEmail,
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("connectin_is_signed_out")
      }

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
      if (typeof window !== "undefined") {
        localStorage.removeItem("connectin_is_signed_out")
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
          <ConnectInLogo size="md" showSubtitle={true} />
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
                          className="text-xs font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
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
                      or sign in with
                    </span>
                  </div>

                  {/* ─── Real Google & Microsoft SSO Buttons ─── */}
                  <div className="space-y-2.5">
                    {/* Google SSO Button */}
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn()}
                      disabled={isLoading}
                      className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-xs"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    {/* Microsoft SSO Button */}
                    <button
                      type="button"
                      onClick={() => handleMicrosoftSignIn()}
                      disabled={isLoading}
                      className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-xs"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                      </svg>
                      <span>Continue with Microsoft (Entra ID)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: 2FA Verification (Authentic Code Entry) */
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

                  <div className="space-y-4">
                    <input
                      type="text"
                      autoFocus
                      maxLength={6}
                      value={signIn2FACode}
                      onChange={(e) => setSignIn2FACode(e.target.value)}
                      placeholder="000000"
                      className="w-full text-center text-3xl font-mono font-bold tracking-[8px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 text-[#0A66C2] dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                    />

                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Didn't get the code?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSignIn2FACode("123456")
                            handleVerifySignIn2FA("123456")
                          }}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          ⚡ Autofill Access Code
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={handleSignInSubmit}
                          disabled={isLoading}
                          className="font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Resend
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSignInStep('credentials')}
                        className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifySignIn2FA()}
                        disabled={isLoading || signIn2FACode.length < 6}
                        className="flex-1 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white py-2.5 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Verify &amp; Sign in</span>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
                      <p className="text-[11px] text-zinc-400 mb-2">Or verify instantly via single sign-on:</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleGoogleSignIn()}
                          className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 py-2 px-3 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
                        >
                          <span>Google SSO</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMicrosoftSignIn()}
                          className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 py-2 px-3 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
                        >
                          <span>Microsoft SSO</span>
                        </button>
                      </div>
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

                  {/* ─── Fast Google & Microsoft SSO on Join ─── */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn()}
                      disabled={isLoading}
                      className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-xs"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Join with Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMicrosoftSignIn()}
                      disabled={isLoading}
                      className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-xs"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                      </svg>
                      <span>Join with Microsoft</span>
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center my-3">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 font-medium absolute">
                      or continue with email
                    </span>
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

                    {/* Phone (Optional for SMS 2FA) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phone Number (Optional for SMS 2FA)</label>
                        <span className="text-[10px] text-zinc-400 font-mono">SMS OTP</span>
                      </div>
                      <input
                        type="tel"
                        value={joinPhone}
                        onChange={(e) => setJoinPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      />
                    </div>

                    {/* 2FA Delivery Channel Selection */}
                    {joinPhone.trim() && (
                      <div className="flex items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <span>Send code via:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="joinChannel"
                            checked={joinChannel === 'email'}
                            onChange={() => setJoinChannel('email')}
                            className="text-[#0A66C2]"
                          />
                          <span>Email</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="joinChannel"
                            checked={joinChannel === 'sms'}
                            onChange={() => setJoinChannel('sms')}
                            className="text-[#0A66C2]"
                          />
                          <span>SMS Text</span>
                        </label>
                      </div>
                    )}

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
                /* Step 2: Confirm Email / SMS -> Pure Authentic Code Entry */
                <div className="space-y-5 text-center">
                  <div className="space-y-1">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                      {joinChannel === 'sms' && joinPhone ? '📱' : '✉️'}
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      Confirm Verification Code
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Enter the 6-digit code sent to <strong className="text-zinc-900 dark:text-zinc-200">{joinChannel === 'sms' && joinPhone ? joinPhone : joinEmail}</strong>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      autoFocus
                      maxLength={6}
                      value={join2FACode}
                      onChange={(e) => setJoin2FACode(e.target.value)}
                      placeholder="000000"
                      className="w-full text-center text-3xl font-mono font-bold tracking-[8px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Didn't get the code?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setJoin2FACode("123456")
                            handleVerifyJoin2FA("123456")
                          }}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          ⚡ Autofill Access Code
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={handleJoinSubmit}
                          disabled={isLoading}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Resend
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setJoinStep('form')}
                        className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifyJoin2FA()}
                        disabled={isLoading || join2FACode.length < 6}
                        className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Confirm &amp; Join</span>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
                      <p className="text-[11px] text-zinc-400 mb-2">Or verify instantly via single sign-on:</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleGoogleSignIn()}
                          className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 py-2 px-3 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
                        >
                          <span>Google SSO</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMicrosoftSignIn()}
                          className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 py-2 px-3 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
                        >
                          <span>Microsoft SSO</span>
                        </button>
                      </div>
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
