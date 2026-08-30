"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ShieldCheck,
  Lock,
  Key,
  Mail,
  User,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Fingerprint
} from "lucide-react"
import { DEMO_AUTH_PERSONAS, AuthPersona } from "@/components/linkedin/ConnectInAuthModal"

export default function ConnectInLoginPage() {
  const router = useRouter()
  const [selectedPersona, setSelectedPersona] = useState<AuthPersona>(DEMO_AUTH_PERSONAS[0])
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'credentials' | 'sso'>('signin')

  // Registration State
  const [regFirstName, setRegFirstName] = useState("")
  const [regLastName, setRegLastName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regRole, setRegRole] = useState<'personal' | 'enterprise' | 'creator' | 'seller' | 'developer'>('personal')
  const [regStep, setRegStep] = useState<'form' | 'verify'>('form')
  const [verificationCode, setVerificationCode] = useState("749204")

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)

  const handleLogin = (persona: AuthPersona) => {
    setIsAuthenticating(true)
    setStatusFeedback(
      `✓ FIDO2 Identity Verified: ${persona.name} (${persona.badge}). Session ID: sess_${Date.now().toString(36)}. Directing to: ${persona.defaultTab.toUpperCase()}...`
    )

    setTimeout(() => {
      router.push(`/connectin`)
    }, 1200)
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regEmail || !regFirstName) return
    setRegStep('verify')
  }

  const handleVerifyRegistrationCode = () => {
    setIsAuthenticating(true)
    const fullName = `${regFirstName} ${regLastName}`.trim() || "New ConnectIn Member"
    setStatusFeedback(
      `✓ Email verified & FIDO2 Passkey initialized for ${fullName}! Session created: sess_${Date.now().toString(36)}. Launching platform...`
    )

    setTimeout(() => {
      router.push(`/connectin`)
    }, 1200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let matched = DEMO_AUTH_PERSONAS.find(p => p.email.toLowerCase() === emailInput.toLowerCase())
    if (!matched) {
      if (emailInput.includes('admin')) matched = DEMO_AUTH_PERSONAS[4]
      else if (emailInput.includes('procurement') || emailInput.includes('corp')) matched = DEMO_AUTH_PERSONAS[1]
      else if (emailInput.includes('creator') || emailInput.includes('media')) matched = DEMO_AUTH_PERSONAS[2]
      else if (emailInput.includes('seller') || emailInput.includes('vendor')) matched = DEMO_AUTH_PERSONAS[3]
      else if (emailInput.includes('dev') || emailInput.includes('code')) matched = DEMO_AUTH_PERSONAS[5]
      else matched = DEMO_AUTH_PERSONAS[0]
    }
    handleLogin(matched)
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
            ConnectIn Identity &amp; Access Gate
          </h1>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Universal role-aware authentication. Your identity dynamically routes your workspace and active sessions.
          </p>
        </div>

        {statusFeedback && (
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-3.5 text-xs font-bold text-emerald-300 text-center animate-in zoom-in-95 flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 border-b border-white/10 pb-3 text-xs justify-center overflow-x-auto">
          <button
            onClick={() => setAuthMode('signin')}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'signin'
                ? "bg-[#0A66C2] text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            🔑 1-Click Role Logins
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'register'
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            🆕 Register Account
          </button>
          <button
            onClick={() => setAuthMode('credentials')}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'credentials'
                ? "bg-[#0A66C2] text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            ✉️ Email &amp; Passkeys
          </button>
          <button
            onClick={() => setAuthMode('sso')}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'sso'
                ? "bg-[#0A66C2] text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            🏛️ Enterprise SSO
          </button>
        </div>

        {/* Mode 1: 1-Click Persona Logins */}
        {authMode === 'signin' && (
          <div className="space-y-3">
            <p className="text-[11px] text-zinc-400 text-center">
              Select a persona to experience tailored role-based redirection:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {DEMO_AUTH_PERSONAS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleLogin(p)}
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

        {/* Mode 2: Register Account */}
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

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Work / Personal Email</label>
                  <input
                    type="email"
                    placeholder="e.g. kwesi@expedite-consults.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-xs"
                    required
                  />
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
                  <label className="block text-zinc-300 font-bold mb-1">Account Role &amp; Workspace</label>
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
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 shadow-lg transition-all"
                  >
                    Create Account &amp; Send Code →
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center py-2 animate-in zoom-in-95">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto text-xl">
                  ✉️
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white">We sent a 6-digit verification code</h3>
                  <p className="text-zinc-400 text-[11px]">Sent to: <strong className="text-white">{regEmail}</strong></p>
                </div>

                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full text-center text-xl font-mono font-bold tracking-widest rounded-xl bg-white/10 border border-emerald-400/40 p-2 text-emerald-300 focus:outline-none"
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
                    onClick={handleVerifyRegistrationCode}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2 shadow-lg"
                  >
                    Verify &amp; Launch Session 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode 3: Form */}
        {authMode === 'credentials' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Corporate Email / Username</label>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3 py-2.5">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="sec-admin@connectin.internal or marcus.vance@defense.com"
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
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleLogin(DEMO_AUTH_PERSONAS[0])}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold text-xs"
              >
                <Fingerprint className="h-4 w-4" />
                <span>Use Passkey</span>
              </button>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-black px-5 py-2.5 shadow-lg transition-all"
              >
                Sign In &amp; Launch →
              </button>
            </div>
          </form>
        )}

        {/* Mode 4: SSO */}
        {authMode === 'sso' && (
          <div className="space-y-3 text-xs">
            <button
              onClick={() => handleLogin(DEMO_AUTH_PERSONAS[1])}
              className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 text-left flex items-center justify-between transition-all"
            >
              <div>
                <p className="font-bold text-white text-xs">🪟 Microsoft Entra ID (Azure AD GovCloud)</p>
                <p className="text-[10px] text-zinc-400">Direct SAML 2.0 Identity Provider Federation</p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400" />
            </button>

            <button
              onClick={() => handleLogin(DEMO_AUTH_PERSONAS[0])}
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
