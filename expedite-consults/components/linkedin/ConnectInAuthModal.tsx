"use client"

import React, { useState } from "react"
import {
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"
import { saveStoredUser, saveStoredSessionRoute } from "@/lib/connectin-storage"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"

export interface AuthPersona {
  id: string
  name: string
  email: string
  title: string
  role: 'personal' | 'enterprise' | 'creator' | 'seller' | 'admin' | 'developer'
  avatar: string
  defaultTab: string
  defaultWorkspace: 'personal' | 'enterprise' | 'creator' | 'seller'
  badge: string
  badgeColor: string
  redirectDescription: string
}

export const DEMO_AUTH_PERSONAS: AuthPersona[] = [
  {
    id: 'persona_individual',
    name: 'Alex Taylor (Fellow)',
    email: 'alex.taylor@connectin.com',
    title: 'Lead AI & Cloud Security Architect',
    role: 'personal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'home',
    defaultWorkspace: 'personal',
    badge: '👤 Individual Fellow',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    redirectDescription: 'Personal Workspace · Home Feed & Skills'
  },
  {
    id: 'persona_enterprise',
    name: 'Marcus Vance (VP Procurement)',
    email: 'marcus.vance@defense-systems.com',
    title: 'VP Enterprise Procurement & Spend',
    role: 'enterprise',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'procurement',
    defaultWorkspace: 'enterprise',
    badge: '🏢 Enterprise Buyer',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    redirectDescription: 'Enterprise Desk · $2.4M Spend Desk & RFPs'
  },
  {
    id: 'persona_creator',
    name: 'Sarah Chen (Host & Creator)',
    email: 'sarah.chen@defense-studio.tv',
    title: 'Executive Producer @ ConnectIn TV',
    role: 'creator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'media',
    defaultWorkspace: 'creator',
    badge: '🎬 Creator Studio',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    redirectDescription: 'ConnectIn Studio · Video & Podcasts'
  },
  {
    id: 'persona_seller',
    name: 'David K. (Software Vendor)',
    email: 'david.k@expedite-labs.io',
    title: 'Head of Commercial Marketplace',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'sellercenter',
    defaultWorkspace: 'seller',
    badge: '💼 Verified Seller',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    redirectDescription: 'Seller Center · $122.7K MRR Storefront'
  },
  {
    id: 'persona_admin',
    name: 'Commander Robert Hayes',
    email: 'sec-admin@connectin.internal',
    title: 'Platform IAM & Super Administrator',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'adminiam',
    defaultWorkspace: 'personal',
    badge: '🛡️ Platform Admin',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    redirectDescription: 'Admin IAM Enclave · 4.28M User Directory'
  }
]

interface ConnectInAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (
    user: UserProfile,
    targetTab: string,
    targetWorkspace: 'personal' | 'enterprise' | 'creator' | 'seller'
  ) => void
}

export function ConnectInAuthModal({
  isOpen,
  onClose,
  onLoginSuccess
}: ConnectInAuthModalProps) {
  const [activeView, setActiveView] = useState<'signin' | 'join'>('signin')
  const [showPassword, setShowPassword] = useState(false)

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInStep, setSignInStep] = useState<'credentials' | '2fa'>('credentials')
  const [signIn2FACode, setSignIn2FACode] = useState("")
  const [signInBackupCode, setSignInBackupCode] = useState<string | null>(null)

  // Join Now State
  const [joinFirstName, setJoinFirstName] = useState("")
  const [joinLastName, setJoinLastName] = useState("")
  const [joinEmail, setJoinEmail] = useState("")
  const [joinPassword, setJoinPassword] = useState("")
  const [joinRole, setJoinRole] = useState<'personal' | 'enterprise' | 'creator' | 'seller' | 'developer'>('personal')
  const [joinStep, setJoinStep] = useState<'form' | '2fa'>('form')
  const [join2FACode, setJoin2FACode] = useState("")
  const [joinBackupCode, setJoinBackupCode] = useState<string | null>(null)

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Demo Drawer
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false)

  if (!isOpen) return null

  // 1. Sign In
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
        throw new Error(data.error || "Sign in failed.")
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
        throw new Error(data.error || "Invalid code.")
      }

      if (data.profile) {
        saveStoredUser(data.profile)
        if (typeof window !== "undefined") {
          localStorage.removeItem("connectin_is_signed_out")
        }
        onLoginSuccess(data.profile, 'home', 'personal')
      }

      onClose()
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed.")
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Join Now (Register -> 2FA -> Direct Login)
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
      setErrorMessage(err.message || "Registration failed.")
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
        throw new Error(data.error || "Invalid code.")
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
        saveStoredSessionRoute(targetTab, targetWorkspace)
        if (typeof window !== "undefined") {
          localStorage.removeItem("connectin_is_signed_out")
        }
        onLoginSuccess(data.profile, targetTab, targetWorkspace)
      }

      onClose()
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed.")
    } finally {
      setIsLoading(false)
    }
  }

  // 3. Demo Persona
  const handlePersonaLogin = async (persona: AuthPersona) => {
    setIsLoading(true)
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
        if (typeof window !== "undefined") {
          localStorage.removeItem("connectin_is_signed_out")
        }
        onLoginSuccess(verifyData.profile, persona.defaultTab, persona.defaultWorkspace)
      }
      onClose()
    } catch {
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-7 sm:p-8 text-zinc-900 dark:text-zinc-100 shadow-2xl space-y-5">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <ConnectInLogo size="sm" showSubtitle={true} />

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher (LinkedIn Style) */}
        <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveView('signin')
              setSignInStep('credentials')
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`flex-1 rounded-lg py-2 transition-all ${
              activeView === 'signin'
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => {
              setActiveView('join')
              setJoinStep('form')
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`flex-1 rounded-lg py-2 transition-all ${
              activeView === 'join'
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Join now
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && !errorMessage && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ─── VIEW 1: SIGN IN ─── */}
        {activeView === 'signin' && (
          <>
            {signInStep === 'credentials' ? (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email or phone</label>
                  <input
                    type="text"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="e.g. asiedudanquah@gmail.com"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-2.5 text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Sign in</span>
                </button>
              </form>
            ) : (
              /* Sign In 2FA */
              <div className="space-y-4 text-center">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Two-Step Verification</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Code sent to <strong className="text-zinc-900 dark:text-zinc-200">{signInEmail}</strong>
                  </p>
                </div>

                <input
                  type="text"
                  autoFocus
                  maxLength={6}
                  value={signIn2FACode}
                  onChange={(e) => setSignIn2FACode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full text-center text-2xl font-mono font-bold tracking-widest rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 text-[#0A66C2] dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />

                {signInBackupCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setSignIn2FACode(signInBackupCode)
                      handleVerifySignIn2FA(signInBackupCode)
                    }}
                    className="w-full rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 p-2 text-xs text-[#0A66C2] dark:text-sky-300 font-mono font-semibold"
                  >
                    ⚡ Auto-Fill Code: {signInBackupCode}
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSignInStep('credentials')}
                    className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifySignIn2FA()}
                    disabled={isLoading}
                    className="flex-1 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white py-2 text-xs font-bold"
                  >
                    Verify &amp; Sign in
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── VIEW 2: JOIN NOW ─── */}
        {activeView === 'join' && (
          <>
            {joinStep === 'form' ? (
              <form onSubmit={handleJoinSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">First name</label>
                    <input
                      type="text"
                      required
                      value={joinFirstName}
                      onChange={(e) => setJoinFirstName(e.target.value)}
                      placeholder="Kwesi"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Last name</label>
                    <input
                      type="text"
                      required
                      value={joinLastName}
                      onChange={(e) => setJoinLastName(e.target.value)}
                      placeholder="Asiedu"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={joinEmail}
                    onChange={(e) => setJoinEmail(e.target.value)}
                    placeholder="asiedudanquah@gmail.com"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password (6+ chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Primary Role</label>
                  <select
                    value={joinRole}
                    onChange={(e) => setJoinRole(e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  >
                    <option value="personal">👤 Individual Professional (Feed &amp; Skills)</option>
                    <option value="enterprise">🏢 Enterprise Buyer (Procurement &amp; RFPs)</option>
                    <option value="creator">🎬 Creator &amp; Studio Host (Video &amp; Podcasts)</option>
                    <option value="seller">💼 Marketplace Seller (Storefront &amp; Licenses)</option>
                    <option value="developer">🧑‍💻 Defense &amp; Kernel Developer (Code &amp; Labs)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-2.5 text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Agree &amp; Join</span>
                </button>
              </form>
            ) : (
              /* Join 2FA -> Direct Launch */
              <div className="space-y-4 text-center">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Confirm Your Email</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Code sent to <strong className="text-zinc-900 dark:text-zinc-200">{joinEmail}</strong>
                  </p>
                </div>

                <input
                  type="text"
                  autoFocus
                  maxLength={6}
                  value={join2FACode}
                  onChange={(e) => setJoin2FACode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full text-center text-2xl font-mono font-bold tracking-widest rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {joinBackupCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setJoin2FACode(joinBackupCode)
                      handleVerifyJoin2FA(joinBackupCode)
                    }}
                    className="w-full rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 p-2 text-xs text-emerald-700 dark:text-emerald-300 font-mono font-semibold"
                  >
                    ⚡ Auto-Fill &amp; Join: {joinBackupCode}
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setJoinStep('form')}
                    className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyJoin2FA()}
                    disabled={isLoading}
                    className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-bold"
                  >
                    Confirm &amp; Join
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── 1-CLICK DEMO ACCORDION ─── */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setIsDemoDrawerOpen(!isDemoDrawerOpen)}
            className="w-full py-1.5 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-[#0A66C2]" />
              <span>⚡ Try 1-Click Demo Personas</span>
            </span>
            {isDemoDrawerOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {isDemoDrawerOpen && (
            <div className="mt-2 space-y-1 max-h-[160px] overflow-y-auto pr-1">
              {DEMO_AUTH_PERSONAS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handlePersonaLogin(p)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <img src={p.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                    <span className="font-semibold truncate">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#0A66C2] font-bold">Log In</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
