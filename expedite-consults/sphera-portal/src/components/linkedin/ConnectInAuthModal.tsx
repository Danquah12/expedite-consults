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
import { createUniqueUserProfile, resolveDisplayName, isSuperAdminUser } from "@/lib/connectin-profile"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
import { signIn } from "next-auth/react"

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
    id: 'persona_kwesi',
    name: 'Kwesi Asiedu (Founder)',
    email: 'kasiedu@expedite-consults.com',
    title: 'Founder & Chief Security Officer @ Expedite Consults',
    role: 'personal',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'home',
    defaultWorkspace: 'personal',
    badge: '👑 Founder & CSO',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    redirectDescription: 'Founder Workspace · Full Network Access'
  },
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
  const [signInPhone, setSignInPhone] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInChannel, setSignInChannel] = useState<'email' | 'sms' | 'call'>('email')
  const [signInStep, setSignInStep] = useState<'credentials' | '2fa'>('credentials')
  const [signIn2FACode, setSignIn2FACode] = useState("")
  const [activeTargetDisplay, setActiveTargetDisplay] = useState("")

  // Join Now State
  const [joinFirstName, setJoinFirstName] = useState("")
  const [joinLastName, setJoinLastName] = useState("")
  const [joinEmail, setJoinEmail] = useState("")
  const [joinPhone, setJoinPhone] = useState("")
  const [joinPassword, setJoinPassword] = useState("")
  const [joinRole, setJoinRole] = useState<'personal' | 'enterprise' | 'creator' | 'seller' | 'developer'>('personal')
  const [joinChannel, setJoinChannel] = useState<'email' | 'sms' | 'call'>('email')
  const [joinStep, setJoinStep] = useState<'form' | '2fa'>('form')
  const [join2FACode, setJoin2FACode] = useState("")

  // Challenge token for stateless OTP verification across serverless lambdas
  const [otpChallengeToken, setOtpChallengeToken] = useState<string | null>(null)

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Demo Drawer
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false)

  // Real Google OAuth 2.0 Redirect (accounts.google.com)
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage("Redirecting to Google Identity Services...")
    try {
      await signIn("google", { callbackUrl: "/connectin" })
    } catch (err: any) {
      window.location.href = "/api/auth/signin/google?callbackUrl=/connectin"
    }
  }

  // Real Microsoft Entra ID (Azure AD) OAuth 2.0 Redirect (login.microsoftonline.com)
  const handleMicrosoftSignIn = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage("Redirecting to Microsoft Entra ID (Azure AD)...")
    try {
      await signIn("microsoft-entra-id", { callbackUrl: "/connectin" })
    } catch (err: any) {
      window.location.href = "/api/auth/signin/microsoft-entra-id?callbackUrl=/connectin"
    }
  }

  // 1. Sign In Dispatch
  const handleSignInSubmit = async (e?: React.FormEvent, channelOverride?: 'email' | 'sms' | 'call') => {
    if (e) e.preventDefault()
    if (!signInEmail) return

    const effectiveChannel = channelOverride || signInChannel
    if (channelOverride) setSignInChannel(channelOverride)

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(`Dispatching verification code via ${effectiveChannel.toUpperCase()}...`)

    try {
      const res = await fetch("/api/connectin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInEmail,
          phone: signInPhone,
          password: signInPassword,
          channel: effectiveChannel
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Sign in failed.")
      }

      if (data.otpChallengeToken) {
        setOtpChallengeToken(data.otpChallengeToken)
      }
      setActiveTargetDisplay(data.target || (effectiveChannel === 'email' ? signInEmail : (signInPhone || signInEmail)))
      setSignInStep('2fa')
      
      if (effectiveChannel === 'call') {
        setSuccessMessage(`📞 Calling ${data.target || signInPhone || signInEmail}... Please answer to hear your verification code.`)
      } else if (effectiveChannel === 'sms') {
        setSuccessMessage(`💬 Text message sent to ${data.target || signInPhone || signInEmail}. Please enter the 6-digit code.`)
      } else {
        setSuccessMessage(`✉️ Verification code sent to ${data.target || signInEmail}. Please check your inbox or spam.`)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to dispatch 2FA code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifySignIn2FA = async (codeToSubmit?: string) => {
    const code = (codeToSubmit || signIn2FACode || "").trim()
    if (!code || code.length < 6 || isLoading) return

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage("Verifying security code...")

    try {
      const resolvedName = resolveDisplayName("", signInEmail)
      const verifyTarget = activeTargetDisplay || (signInChannel === 'email' ? signInEmail : (signInPhone || signInEmail))
      const res = await fetch("/api/connectin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: verifyTarget,
          email: signInEmail,
          phone: signInPhone,
          code,
          name: resolvedName,
          otpChallengeToken
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code.")
      }

      // Always inject email — API's UserProfileRecord has no email field
      const profileToSave = {
        ...(data.profile || createUniqueUserProfile({
          name: resolvedName,
          email: signInEmail,
          role: "personal"
        })),
        email: signInEmail,
        id: data.profile?.userId || data.user?.id || data.profile?.id
      }

      const isAdminUser = isSuperAdminUser({ ...profileToSave, email: signInEmail })

      const targetTab = isAdminUser ? 'adminiam' : 'home'

      saveStoredUser(profileToSave)
      saveStoredSessionRoute(targetTab, 'personal')
      if (typeof window !== "undefined") {
        localStorage.removeItem("connectin_is_signed_out")
      }

      setSuccessMessage(
        isAdminUser
          ? `✓ Authenticated as Administrator! Opening Control Center...`
          : `✓ Authenticated! Welcome, ${profileToSave.name}`
      )
      setTimeout(() => {
        onLoginSuccess(profileToSave, targetTab, 'personal')
        onClose()
      }, 150)
    } catch (err: any) {
      setSuccessMessage(null)
      setErrorMessage(err.message || "Verification failed.")
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Join Now (Register -> 2FA -> Direct Login)
  const handleJoinSubmit = async (e?: React.FormEvent, channelOverride?: 'email' | 'sms' | 'call') => {
    if (e) e.preventDefault()
    if (!joinFirstName || !joinEmail) return

    const effectiveChannel = channelOverride || joinChannel
    if (channelOverride) setJoinChannel(channelOverride)

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(`Dispatching verification code via ${effectiveChannel.toUpperCase()}...`)

    try {
      const fullName = `${joinFirstName} ${joinLastName}`.trim()
      const resolvedName = resolveDisplayName(fullName, joinEmail)

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
          twoFactorChannel: effectiveChannel
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.")
      }

      if (data.otpChallengeToken) {
        setOtpChallengeToken(data.otpChallengeToken)
      }
      setJoinStep('2fa')
      if (effectiveChannel === 'call') {
        setSuccessMessage(`📞 Calling ${joinPhone || joinEmail}... Please answer to hear your verification code.`)
      } else if (effectiveChannel === 'sms') {
        setSuccessMessage(`💬 Verification text message sent to ${joinPhone || joinEmail}.`)
      } else {
        setSuccessMessage(`✉️ Verification code sent to ${joinEmail}. Please check your inbox or spam.`)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyJoin2FA = async (codeToSubmit?: string) => {
    const code = (codeToSubmit || join2FACode || "").trim()
    if (!code || code.length < 6 || isLoading) return

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage("Verifying security code...")

    try {
      const fullName = `${joinFirstName} ${joinLastName}`.trim()
      const resolvedName = resolveDisplayName(fullName, joinEmail)
      const verifyTarget = joinChannel === 'email' ? joinEmail : (joinPhone || joinEmail)

      const res = await fetch("/api/connectin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: verifyTarget,
          email: joinEmail,
          phone: joinPhone,
          code,
          name: resolvedName,
          role: joinRole,
          otpChallengeToken
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

      // Always inject email — API's UserProfileRecord has no email field
      const profileToSave = {
        ...(data.profile || createUniqueUserProfile({
          name: resolvedName,
          email: joinEmail,
          role: joinRole
        })),
        email: joinEmail,
        id: data.profile?.userId || data.user?.id || data.profile?.id
      }

      saveStoredUser(profileToSave)
      saveStoredSessionRoute(targetTab, targetWorkspace)
      if (typeof window !== "undefined") {
        localStorage.removeItem("connectin_is_signed_out")
      }

      setSuccessMessage(`✓ Account verified! Welcome, ${profileToSave.name}`)
      setTimeout(() => {
        onLoginSuccess(profileToSave, targetTab, targetWorkspace)
        onClose()
      }, 150)
    } catch (err: any) {
      setSuccessMessage(null)
      setErrorMessage(err.message || "Verification failed.")
    } finally {
      setIsLoading(false)
    }
  }

  // 3. Demo Persona
  const handlePersonaLogin = async (persona: AuthPersona) => {
    setIsLoading(true)
    try {
      const cleanName = persona.name.replace(/\s*\([^)]*\)/g, "").trim()
      const richProfile = createUniqueUserProfile({
        id: persona.id,
        name: cleanName,
        email: persona.email,
        role: persona.role,
        avatar: persona.avatar,
        headline: persona.title
      })

      saveStoredUser(richProfile)
      saveStoredSessionRoute(persona.defaultTab, persona.defaultWorkspace)
      if (typeof window !== "undefined") {
        localStorage.removeItem("connectin_is_signed_out")
      }

      // Notify parent app immediately for instant reactivity
      onLoginSuccess(richProfile, persona.defaultTab, persona.defaultWorkspace)

      // Sync in background
      fetch("/api/connectin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: cleanName.split(" ")[0],
          lastName: cleanName.split(" ").slice(1).join(" "),
          email: persona.email,
          role: persona.role,
          twoFactorChannel: "email"
        })
      }).catch(() => {})

      onClose()
    } catch {
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

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
              <form onSubmit={(e) => handleSignInSubmit(e)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email address or username</label>
                  <input
                    type="text"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="e.g. asiedudanquah@gmail.com"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>

                {/* 2FA Delivery Channel Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Send 2FA Security Code Via</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSignInChannel('email')}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        signInChannel === 'email'
                          ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      <span>✉️ Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignInChannel('sms')}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        signInChannel === 'sms'
                          ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      <span>💬 SMS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignInChannel('call')}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        signInChannel === 'call'
                          ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      <span>📞 Call</span>
                    </button>
                  </div>
                </div>

                {/* Phone Number Input (if SMS or Call selected) */}
                {(signInChannel === 'sms' || signInChannel === 'call') && (
                  <div className="space-y-1 animate-in fade-in duration-150">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Mobile Phone Number {signInChannel === 'call' ? 'for Voice Call' : 'for SMS'}
                    </label>
                    <input
                      type="tel"
                      value={signInPhone}
                      onChange={(e) => setSignInPhone(e.target.value)}
                      placeholder="+1 (240) 555-0192"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                    />
                  </div>
                )}

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
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="•••••••••••• (optional for passwordless OTP)"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-2.5 text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Sign in with 2FA</span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  <span className="bg-white dark:bg-zinc-900 px-2 text-[11px] text-zinc-400 font-medium absolute">
                    or sign in with
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn()}
                    disabled={isLoading}
                    className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMicrosoftSignIn()}
                    disabled={isLoading}
                    className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                    </svg>
                    <span>Continue with Microsoft</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Sign In 2FA */
              <form onSubmit={(e) => { e.preventDefault(); handleVerifySignIn2FA(); }} className="space-y-4 text-center">
                <div className="space-y-1">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0A66C2] dark:text-sky-400 flex items-center justify-center mx-auto text-lg font-bold">
                    🔒
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Enter Security Code</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Enter the 6-digit code delivered to <strong className="text-zinc-900 dark:text-zinc-200">{activeTargetDisplay || signInEmail}</strong>
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={signIn2FACode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "")
                      setSignIn2FACode(val)
                      if (val.length === 6) {
                        handleVerifySignIn2FA(val)
                      }
                    }}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-mono font-bold tracking-[8px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3 text-[#0A66C2] dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />

                  {/* Resend via Alternative Channels */}
                  <div className="text-xs text-zinc-500 space-y-1.5 pt-1">
                    <p className="text-[11px] text-zinc-400">Didn't receive the code? Resend via:</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSignInSubmit(undefined, 'email')}
                        disabled={isLoading}
                        className="font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md"
                      >
                        ✉️ Email
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSignInSubmit(undefined, 'sms')}
                        disabled={isLoading}
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md"
                      >
                        💬 SMS Text
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSignInSubmit(undefined, 'call')}
                        disabled={isLoading}
                        className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md"
                      >
                        📞 Phone Call
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSignInStep('credentials')}
                      className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2 text-xs font-semibold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || signIn2FACode.length < 6}
                      className="flex-1 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                      <span>Verify &amp; Sign in</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                    <p className="text-[11px] text-zinc-400 mb-1.5">Or verify instantly via single sign-on:</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGoogleSignIn()}
                        className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 py-1.5 px-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
                      >
                        <span>Google SSO</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMicrosoftSignIn()}
                        className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 py-1.5 px-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
                      >
                        <span>Microsoft SSO</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </>
        )}

        {/* ─── VIEW 2: JOIN NOW ─── */}
        {activeView === 'join' && (
          <>
            {joinStep === 'form' ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn()}
                    disabled={isLoading}
                    className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
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
                    className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                    </svg>
                    <span>Join with Microsoft</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  <span className="bg-white dark:bg-zinc-900 px-2 text-[11px] text-zinc-400 font-medium absolute">
                    or continue with email
                  </span>
                </div>

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

                  {/* 2FA Delivery Channel Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Deliver 2FA Code Via</label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setJoinChannel('email')}
                        className={`py-1 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                          joinChannel === 'email'
                            ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        }`}
                      >
                        <span>✉️ Email</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setJoinChannel('sms')}
                        className={`py-1 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                          joinChannel === 'sms'
                            ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        }`}
                      >
                        <span>💬 SMS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setJoinChannel('call')}
                        className={`py-1 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                          joinChannel === 'call'
                            ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        }`}
                      >
                        <span>📞 Call</span>
                      </button>
                    </div>
                  </div>

                  {/* Phone Number Input (if SMS or Call selected) */}
                  {(joinChannel === 'sms' || joinChannel === 'call') && (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Mobile Phone Number {joinChannel === 'call' ? 'for Voice Call' : 'for SMS Text'}
                      </label>
                      <input
                        type="tel"
                        value={joinPhone}
                        onChange={(e) => setJoinPhone(e.target.value)}
                        placeholder="+1 (240) 555-0192"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      />
                    </div>
                  )}

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
              </div>
            ) : (
              /* Join 2FA -> Direct Launch */
              <form onSubmit={(e) => { e.preventDefault(); handleVerifyJoin2FA(); }} className="space-y-4 text-center">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Confirm Your Code</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Enter the 6-digit code sent to <strong className="text-zinc-900 dark:text-zinc-200">{joinEmail}</strong>
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={join2FACode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "")
                      setJoin2FACode(val)
                      if (val.length === 6) {
                        handleVerifyJoin2FA(val)
                      }
                    }}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-mono font-bold tracking-[8px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="text-xs text-zinc-500 space-y-1.5 pt-1">
                    <p className="text-[11px] text-zinc-400">Didn't receive the code? Resend via:</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleJoinSubmit(undefined, 'email')}
                        disabled={isLoading}
                        className="font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md"
                      >
                        ✉️ Email
                      </button>
                      <button
                        type="button"
                        onClick={() => handleJoinSubmit(undefined, 'sms')}
                        disabled={isLoading}
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md"
                      >
                        💬 SMS Text
                      </button>
                      <button
                        type="button"
                        onClick={() => handleJoinSubmit(undefined, 'call')}
                        disabled={isLoading}
                        className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md"
                      >
                        📞 Phone Call
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setJoinStep('form')}
                      className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2 text-xs font-semibold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || join2FACode.length < 6}
                      className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                      <span>Confirm &amp; Join</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                    <p className="text-[11px] text-zinc-400 mb-1.5">Or verify instantly via single sign-on:</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGoogleSignIn()}
                        className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 py-1.5 px-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
                      >
                        <span>Google SSO</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMicrosoftSignIn()}
                        className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 py-1.5 px-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
                      >
                        <span>Microsoft SSO</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
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
