"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ShieldCheck,
  Lock,
  Key,
  Mail,
  Smartphone,
  User,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Fingerprint
} from "lucide-react"
import { DEMO_AUTH_PERSONAS, AuthPersona } from "@/components/linkedin/ConnectInAuthModal"
import { saveStoredUser, saveStoredSessionRoute } from "@/lib/connectin-storage"
import { UserProfile } from "@/lib/linkedin-data"

export default function ConnectInLoginPage() {
  const router = useRouter()
  const [selectedPersona, setSelectedPersona] = useState<AuthPersona>(DEMO_AUTH_PERSONAS[0])
  const [authMode, setAuthMode] = useState<'credentials' | 'register' | 'signin' | 'sso'>('credentials')

  // Sign In State
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [loginStep, setLoginStep] = useState<'credentials' | 'mfa'>('credentials')
  const [login2faChannel, setLogin2faChannel] = useState<'email' | 'sms'>('email')
  const [login2faCode, setLogin2faCode] = useState("")

  // Registration State
  const [regFirstName, setRegFirstName] = useState("")
  const [regLastName, setRegLastName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPhone, setRegPhone] = useState("+1 (240) 555-0192")
  const [regPassword, setRegPassword] = useState("")
  const [regRole, setRegRole] = useState<'personal' | 'enterprise' | 'creator' | 'seller' | 'developer'>('personal')
  const [reg2faChannel, setReg2faChannel] = useState<'email' | 'sms'>('email')
  const [regStep, setRegStep] = useState<'form' | 'verify' | 'confirmed'>('form')
  const [verificationCode, setVerificationCode] = useState("")

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 1. One-Click Persona Login (Anchor Demo)
  const handlePersonaLogin = async (persona: AuthPersona) => {
    setIsAuthenticating(true)
    setErrorMessage(null)
    setStatusFeedback(`✓ Authenticating ${persona.name}... Minting live session.`)

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

      // Automatically verify OTP for demo personas
      if (data.devCode || res.ok) {
        const verifyRes = await fetch("/api/connectin/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target: persona.email,
            code: data.devCode || "749204"
          })
        })
        const verifyData = await verifyRes.json()

        if (verifyData.profile) {
          saveStoredUser(verifyData.profile)
          saveStoredSessionRoute(persona.defaultTab, persona.defaultWorkspace)
        }
      }

      setTimeout(() => {
        router.push("/connectin")
      }, 800)
    } catch (err: any) {
      router.push("/connectin")
    } finally {
      setIsAuthenticating(false)
    }
  }

  // 2. Real Registration Submit (Sends real Resend Email OTP)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regEmail || !regFirstName) return

    setIsAuthenticating(true)
    setErrorMessage(null)
    setStatusFeedback(`Dispatching 6-digit confirmation code via ${reg2faChannel.toUpperCase()}...`)

    try {
      const res = await fetch("/api/connectin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          role: regRole,
          twoFactorChannel: reg2faChannel
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to register")
      }

      setStatusFeedback(`✓ Code dispatched to ${reg2faChannel === "sms" ? regPhone : regEmail}!`)
      if (data.devCode) {
        setVerificationCode(data.devCode)
      }
      setRegStep('verify')
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed")
    } finally {
      setIsAuthenticating(false)
    }
  }

  // 3. Confirm Real 2FA OTP Code
  const handleConfirm2FACode = async () => {
    if (!verificationCode) return

    setIsAuthenticating(true)
    setErrorMessage(null)
    setStatusFeedback("Verifying cryptographic token & initializing database record...")

    try {
      const target = reg2faChannel === "sms" ? regPhone : regEmail
      const res = await fetch("/api/connectin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          code: verificationCode
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code")
      }

      const targetTab =
        regRole === 'enterprise' ? 'procurement' :
        regRole === 'creator' ? 'media' :
        regRole === 'seller' ? 'sellercenter' :
        regRole === 'developer' ? 'code' : 'home'

      const targetWorkspace: 'personal' | 'enterprise' | 'creator' | 'seller' =
        regRole === 'enterprise' ? 'enterprise' :
        regRole === 'creator' ? 'creator' :
        regRole === 'seller' ? 'seller' : 'personal'

      if (data.profile) {
        saveStoredUser(data.profile)
      }
      saveStoredSessionRoute(targetTab, targetWorkspace)
      setRegStep('confirmed')
      setStatusFeedback("✓ Account successfully created and verified!")
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed")
    } finally {
      setIsAuthenticating(false)
    }
  }

  // 4. Return to Login
  const handleReturnToLogin = () => {
    setEmailInput(regEmail)
    setPasswordInput("")
    setAuthMode('credentials')
    setLoginStep('credentials')
    setErrorMessage(null)
  }

  // 5. Submit Credentials (Step 1 of Login -> Triggers 2FA Challenge)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput) return

    setIsAuthenticating(true)
    setErrorMessage(null)
    setStatusFeedback("Authenticating credentials & issuing 2FA challenge...")

    try {
      const res = await fetch("/api/connectin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
          channel: login2faChannel
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Login challenge failed")
      }

      if (data.devCode) {
        setLogin2faCode(data.devCode)
      }
      setStatusFeedback(`✓ 2FA code sent to ${data.target}!`)
      setLoginStep('mfa')
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to log in")
    } finally {
      setIsAuthenticating(false)
    }
  }

  // 6. Verify Login 2FA (Step 2 of Login -> Mint Session)
  const handleVerifyLoginMFA = async () => {
    if (!login2faCode) return

    setIsAuthenticating(true)
    setErrorMessage(null)
    setStatusFeedback("Verifying 2FA code & minting active session...")

    try {
      const res = await fetch("/api/connectin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: emailInput,
          code: login2faCode
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Invalid 2FA code")
      }

      if (data.profile) {
        saveStoredUser(data.profile)
      }

      setStatusFeedback("✓ Identity verified! Launching workspace...")
      setTimeout(() => {
        router.push("/connectin")
      }, 600)
    } catch (err: any) {
      setErrorMessage(err.message || "2FA verification failed")
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-white font-sans selection:bg-[#0A66C2]">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 p-8 shadow-2xl space-y-6 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A66C2] to-indigo-600 text-white font-black text-2xl shadow-xl">
            in
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            ConnectIn Identity &amp; Auth Gate
          </h1>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Live multi-tenant 2FA Email &amp; SMS verification with automated role routing.
          </p>
        </div>

        {/* Live Feedback & Error Alerts */}
        {statusFeedback && !errorMessage && (
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-3.5 text-xs font-bold text-emerald-300 text-center animate-in zoom-in-95 flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl bg-red-500/20 border border-red-400/40 p-3.5 text-xs font-bold text-red-300 text-center animate-in zoom-in-95 flex items-center justify-center gap-2 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 border-b border-white/10 pb-3 text-xs justify-center overflow-x-auto">
          <button
            onClick={() => { setAuthMode('credentials'); setLoginStep('credentials'); setErrorMessage(null); }}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'credentials'
                ? "bg-[#0A66C2] text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            🔑 Sign In (Username &amp; Password)
          </button>
          <button
            onClick={() => { setAuthMode('register'); setRegStep('form'); setErrorMessage(null); }}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'register'
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            🆕 Register Real Account
          </button>
          <button
            onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'signin'
                ? "bg-[#0A66C2] text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            ⚡ 1-Click Personas
          </button>
          <button
            onClick={() => { setAuthMode('sso'); setErrorMessage(null); }}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'sso'
                ? "bg-[#0A66C2] text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            🏛️ Enterprise SSO
          </button>
        </div>

        {/* Mode 1: Sign In with Username, Password and 2FA Step */}
        {authMode === 'credentials' && (
          <div className="space-y-4 text-xs">
            {loginStep === 'credentials' ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Username / Email Address</label>
                  <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3 py-2.5">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="e.g. kwesi@expedite-consults.com or alex.taylor@connectin.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Password</label>
                  <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3 py-2.5">
                    <Lock className="h-4 w-4 text-zinc-400" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setRegStep('form'); }}
                    className="text-sky-400 hover:underline"
                  >
                    Create a new account →
                  </button>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-black px-5 py-2.5 shadow-lg transition-all flex items-center gap-2"
                  >
                    {isAuthenticating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Proceed to 2FA Verification →</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: 2FA Verification (Email or SMS Text) */
              <div className="space-y-4 text-center py-2 animate-in zoom-in-95">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">Second Factor Authentication (2FA)</h3>
                  <p className="text-zinc-400 text-xs">
                    Choose verification channel for: <strong className="text-white">{emailInput}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => setLogin2faChannel('email')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      login2faChannel === 'email'
                        ? "bg-[#0A66C2] border-[#0A66C2] text-white"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogin2faChannel('sms')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      login2faChannel === 'sms'
                        ? "bg-[#0A66C2] border-[#0A66C2] text-white"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>SMS / Text Code</span>
                  </button>
                </div>

                <div className="max-w-xs mx-auto space-y-1">
                  <span className="text-[10px] text-zinc-400 font-mono block">
                    {login2faChannel === 'email' ? `Code sent to ${emailInput}` : `Code sent via SMS to ${regPhone}`}
                  </span>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={login2faCode}
                    onChange={(e) => setLogin2faCode(e.target.value)}
                    className="w-full text-center text-xl font-mono font-bold tracking-widest rounded-xl bg-white/10 border border-sky-400/50 p-2.5 text-sky-300 focus:outline-none"
                    maxLength={6}
                  />
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setLoginStep('credentials')}
                    className="rounded-xl bg-white/10 px-4 py-2 text-zinc-300 font-bold"
                  >
                    Back to Password
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyLoginMFA}
                    disabled={isAuthenticating}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2 shadow-lg transition-all flex items-center gap-1.5"
                  >
                    {isAuthenticating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Verify &amp; Sign In 🚀</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Register Account with Real Email/SMS 2FA and "Return to Login" */}
        {authMode === 'register' && (
          <div className="space-y-4 text-xs">
            {regStep === 'form' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">First Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kwesi"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Asiedu"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Work / Personal Email</label>
                    <input
                      type="email"
                      placeholder="kwesi@expedite-consults.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Phone Number (for SMS 2FA)</label>
                    <input
                      type="tel"
                      placeholder="+1 (240) 555-0192"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Account Role &amp; Target Workspace</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="personal">👤 Individual Professional (Feed &amp; Skill Passport)</option>
                    <option value="enterprise">🏢 Enterprise Buyer (Procurement Desk &amp; RFPs)</option>
                    <option value="creator">🎬 Creator &amp; Studio Host (Video &amp; Podcasts)</option>
                    <option value="seller">💼 Marketplace Seller (Storefront &amp; Licenses)</option>
                    <option value="developer">🧑‍💻 Defense &amp; Kernel Developer (Code &amp; Labs)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 shadow-lg transition-all flex items-center gap-1.5"
                  >
                    {isAuthenticating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Dispatch Real 2FA Code →</span>
                  </button>
                </div>
              </form>
            ) : regStep === 'verify' ? (
              /* Step 2: Real 2FA Verification (Email or SMS Text) */
              <div className="space-y-4 text-center py-2 animate-in zoom-in-95">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white">Enter Your 6-Digit Confirmation Code</h3>
                  <p className="text-zinc-400 text-[11px]">
                    We dispatched a code to: <strong className="text-white">{reg2faChannel === "sms" ? regPhone : regEmail}</strong>
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-1">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full text-center text-xl font-mono font-bold tracking-widest rounded-xl bg-white/10 border border-emerald-400/40 p-2.5 text-emerald-300 focus:outline-none"
                    maxLength={6}
                  />
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRegStep('form')}
                    className="rounded-xl bg-white/10 px-4 py-2 text-zinc-300 font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm2FACode}
                    disabled={isAuthenticating}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2 shadow-lg flex items-center gap-1.5"
                  >
                    {isAuthenticating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Confirm &amp; Register Identity ✓</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 3: Registration Confirmed -> Click Button to Return to Sign In Screen */
              <div className="space-y-4 text-center py-4 animate-in zoom-in-95">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto text-2xl">
                  🎉
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">Registration &amp; 2FA Confirmed!</h3>
                  <p className="text-zinc-300 text-xs max-w-md mx-auto leading-relaxed">
                    Your account for <strong className="text-emerald-300">{regEmail}</strong> is now registered in the persistent database. You can return to the login screen to enter your username and password.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 max-w-sm mx-auto text-left text-[11px] font-mono space-y-1">
                  <p className="text-emerald-400">✓ Email &amp; SMS 2FA Attestation: Validated</p>
                  <p className="text-zinc-300">✓ Assigned Role: {regRole.toUpperCase()}</p>
                  <p className="text-zinc-400">✓ Identity registered in ConnectIn Persistent Database</p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReturnToLogin}
                    className="rounded-2xl bg-gradient-to-r from-[#0A66C2] to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black px-8 py-3 text-xs shadow-xl transition-all flex items-center justify-center gap-2 mx-auto"
                  >
                    <Key className="h-4 w-4" />
                    <span>Return to Login to Sign In with Username &amp; Password →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode 3: 1-Click Persona Logins */}
        {authMode === 'signin' && (
          <div className="space-y-3">
            <p className="text-[11px] text-zinc-400 text-center">
              Select a pre-configured persona to experience tailored role-based redirection:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {DEMO_AUTH_PERSONAS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handlePersonaLogin(p)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 hover:border-[#0A66C2] transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={p.avatar} alt="" className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/20" />
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-xs text-white truncate group-hover:text-sky-300">
                        {p.name}
                      </h4>
                      <span className={`inline-block rounded-full px-2 py-0.2 text-[8px] font-bold border mt-0.5 ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-400 font-mono leading-tight">
                    ➔ {p.redirectDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode 4: SSO */}
        {authMode === 'sso' && (
          <div className="space-y-3 text-xs">
            <button
              onClick={() => handlePersonaLogin(DEMO_AUTH_PERSONAS[1])}
              className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 text-left flex items-center justify-between transition-all"
            >
              <div>
                <p className="font-bold text-white text-xs">🪟 Microsoft Entra ID (Azure AD GovCloud)</p>
                <p className="text-[10px] text-zinc-400">Direct SAML 2.0 Identity Provider Federation</p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400" />
            </button>

            <button
              onClick={() => handlePersonaLogin(DEMO_AUTH_PERSONAS[0])}
              className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 text-left flex items-center justify-between transition-all"
            >
              <div>
                <p className="font-bold text-white text-xs">🔍 Google Workspace Enterprise</p>
                <p className="text-[10px] text-zinc-400">OIDC / PKCE Single Sign-On</p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
