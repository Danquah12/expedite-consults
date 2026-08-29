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
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'sso'>('signin')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)

  const handleLogin = (persona: AuthPersona) => {
    setIsAuthenticating(true)
    setStatusFeedback(
      `✓ FIDO2 Identity Verified: ${persona.name} (${persona.badge}). Directing to: ${persona.defaultTab.toUpperCase()}...`
    )

    setTimeout(() => {
      // Direct user to ConnectIn platform
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
            Universal role-aware authentication. Your identity dynamically routes your workspace and permissions.
          </p>
        </div>

        {statusFeedback && (
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-3.5 text-xs font-bold text-emerald-300 text-center animate-in zoom-in-95 flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs justify-center">
          <button
            onClick={() => setAuthMode('signin')}
            className={`rounded-xl px-4 py-2 font-bold transition-all ${
              authMode === 'signin'
                ? "bg-[#0A66C2] text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            🔑 1-Click Role Logins
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`rounded-xl px-4 py-2 font-bold transition-all ${
              authMode === 'register'
                ? "bg-[#0A66C2] text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            ✉️ Email &amp; Passkeys
          </button>
          <button
            onClick={() => setAuthMode('sso')}
            className={`rounded-xl px-4 py-2 font-bold transition-all ${
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

        {/* Mode 2: Form */}
        {authMode === 'register' && (
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

        {/* Mode 3: SSO */}
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
