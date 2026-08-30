"use client"

import React, { useState } from "react"
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
  X,
  Laptop,
  Fingerprint,
  Briefcase,
  Video,
  ShieldAlert,
  Code,
  RotateCcw
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"
import {
  saveStoredUser,
  saveStoredSessionRoute,
  registerNewUserInDirectory
} from "@/lib/connectin-storage"

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
    redirectDescription: 'Redirects to Personal Workspace · Home Feed, Verified Skill Passport (94.8%) & Career Missions'
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
    redirectDescription: 'Redirects to Enterprise Desk · $2.4M Spend Desk, Active RFPs & GovCloud Vendor Bids'
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
    redirectDescription: 'Redirects to ConnectIn Studio · $92.4K Attribution Revenue, Video Feeds & Podcasts Hub'
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
    redirectDescription: 'Redirects to Seller Center · $122.7K MRR Storefront, Escrow Invoices & Software Licenses'
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
    redirectDescription: 'Redirects to Admin IAM Enclave · 4.28M User Directory, Moderation Queue & 4-Eyes Approvals'
  },
  {
    id: 'persona_dev',
    name: 'Elena Rostova (Kernel Fellow)',
    email: 'elena.rostova@ebpf-labs.org',
    title: 'Principal eBPF Kernel Engineer',
    role: 'developer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'code',
    defaultWorkspace: 'personal',
    badge: '🧑‍💻 Defense Developer',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    redirectDescription: 'Redirects to ConnectIn Code · GitHub Repositories, Sandbox Labs & TS/SCI Cleared Guilds'
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
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'credentials' | 'sso'>('credentials')
  const [selectedPersona, setSelectedPersona] = useState<AuthPersona>(DEMO_AUTH_PERSONAS[0])

  // Sign In State
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [loginStep, setLoginStep] = useState<'credentials' | 'mfa'>('credentials')
  const [login2faChannel, setLogin2faChannel] = useState<'email' | 'sms'>('email')
  const [login2faCode, setLogin2faCode] = useState("749204")

  // Registration State
  const [regFirstName, setRegFirstName] = useState("")
  const [regLastName, setRegLastName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPhone, setRegPhone] = useState("+1 (240) 555-0192")
  const [regPassword, setRegPassword] = useState("")
  const [regRole, setRegRole] = useState<'personal' | 'enterprise' | 'creator' | 'seller' | 'developer'>('personal')
  const [reg2faChannel, setReg2faChannel] = useState<'email' | 'sms'>('email')
  const [regStep, setRegStep] = useState<'form' | 'verify' | 'confirmed'>('form')
  const [verificationCode, setVerificationCode] = useState("749204")

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleExecuteLogin = (personaToLogin: AuthPersona) => {
    setIsAuthenticating(true)
    setAuthSuccessMessage(
      `✓ 2FA Verified via ${login2faChannel.toUpperCase()}. Identity: ${personaToLogin.name}. Session: sess_${Date.now().toString(36)}. Launching...`
    )

    setTimeout(() => {
      setIsAuthenticating(false)
      setAuthSuccessMessage(null)
      onClose()

      const authenticatedUser: UserProfile = {
        name: personaToLogin.name,
        headline: personaToLogin.title,
        avatar: personaToLogin.avatar,
        coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        location: 'Washington DC-Baltimore Area · TS/SCI Polygraph Cleared',
        connectionsCount: 14820,
        followersCount: 38910,
        profileViews: 4120,
        postImpressions: 128900,
        clearanceLevel: 'TS/SCI with Full Scope Polygraph',
        fido2MfaVerified: true,
        cryptoVerificationBadge: '0xED25519_GOVCLOUD_AUTH_VERIFIED',
        skillMatrixScore: 94.8,
        about: `Verified ${personaToLogin.title} with high-assurance multi-factor cryptographic identity on ConnectIn.`,
        skills: ['AWS GovCloud Security', 'Kubernetes Zero Trust', 'cATO OSCAL Automation', 'eBPF Security Probes'],
        experience: [],
        education: []
      }

      saveStoredUser(authenticatedUser)
      saveStoredSessionRoute(personaToLogin.defaultTab, personaToLogin.defaultWorkspace)
      registerNewUserInDirectory({
        id: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
        name: personaToLogin.name,
        email: personaToLogin.email,
        roles: [personaToLogin.title],
        organization: 'Verified ConnectIn Enclave'
      })

      onLoginSuccess(authenticatedUser, personaToLogin.defaultTab, personaToLogin.defaultWorkspace)
    }, 1200)
  }

  // Registration Submit: Moves to 2FA confirmation
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regEmail || !regFirstName) return
    setRegStep('verify')
  }

  // Confirming Email/SMS code
  const handleConfirm2FACode = () => {
    const fullName = `${regFirstName} ${regLastName}`.trim() || "New ConnectIn Member"
    const targetTab =
      regRole === 'enterprise' ? 'procurement' :
      regRole === 'creator' ? 'media' :
      regRole === 'seller' ? 'sellercenter' :
      regRole === 'developer' ? 'code' : 'home'

    const targetWorkspace: 'personal' | 'enterprise' | 'creator' | 'seller' =
      regRole === 'enterprise' ? 'enterprise' :
      regRole === 'creator' ? 'creator' :
      regRole === 'seller' ? 'seller' : 'personal'

    const newRegisteredUser: UserProfile = {
      name: fullName,
      headline: `${regRole.charAt(0).toUpperCase() + regRole.slice(1)} Professional · Verified ConnectIn Identity`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=0a66c2`,
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
      location: 'United States · Cryptographically Verified Member',
      connectionsCount: 1,
      followersCount: 5,
      profileViews: 1,
      postImpressions: 12,
      clearanceLevel: 'Standard Verified Identity (Level 2)',
      fido2MfaVerified: true,
      cryptoVerificationBadge: '0xED25519_SESSION_INITIALIZED',
      skillMatrixScore: 88.0,
      about: `Registered as ${regRole} on ConnectIn Identity platform.`,
      skills: ['Cloud Engineering', 'Security Operations', 'Zero Trust Architecture'],
      experience: [],
      education: []
    }

    saveStoredUser(newRegisteredUser)
    saveStoredSessionRoute(targetTab, targetWorkspace)
    registerNewUserInDirectory({
      id: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
      name: fullName,
      email: regEmail,
      roles: [`${regRole.charAt(0).toUpperCase() + regRole.slice(1)}`],
      organization: 'Verified ConnectIn Enterprise'
    })

    // Show Confirmation Step with "Return to Login" button!
    setRegStep('confirmed')
  }

  // Return to Login with registered credentials prefilled
  const handleReturnToLogin = () => {
    setEmailInput(regEmail)
    setPasswordInput("")
    setAuthMode('credentials')
    setLoginStep('credentials')
  }

  // Handle Credentials Sign In Submit -> Requires 2FA
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput || !passwordInput) return
    // Proceed to Step 2: 2FA Verification code (Email / SMS)
    setLoginStep('mfa')
  }

  const handleVerifyLoginMFA = () => {
    let matched = DEMO_AUTH_PERSONAS.find(p => p.email.toLowerCase() === emailInput.toLowerCase())
    if (!matched) {
      if (emailInput.includes('admin')) matched = DEMO_AUTH_PERSONAS[4]
      else if (emailInput.includes('procurement') || emailInput.includes('corp')) matched = DEMO_AUTH_PERSONAS[1]
      else if (emailInput.includes('creator') || emailInput.includes('media')) matched = DEMO_AUTH_PERSONAS[2]
      else if (emailInput.includes('seller') || emailInput.includes('vendor')) matched = DEMO_AUTH_PERSONAS[3]
      else if (emailInput.includes('dev') || emailInput.includes('code')) matched = DEMO_AUTH_PERSONAS[5]
      else {
        // Use registered custom user name if matched
        const customName = regFirstName ? `${regFirstName} ${regLastName}` : emailInput.split('@')[0]
        matched = {
          ...DEMO_AUTH_PERSONAS[0],
          name: customName,
          email: emailInput
        }
      }
    }
    handleExecuteLogin(matched)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A66C2] to-indigo-600 text-white font-black text-lg shadow-lg">
                in
              </span>
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>ConnectIn Identity &amp; Auth Gate</span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-400/30">
                    2FA Email &amp; SMS Active
                  </span>
                </h2>
                <p className="text-xs text-zinc-300">
                  Two-Factor Authentication · Registration &amp; Credential Login
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Feedback Toast */}
        {authSuccessMessage && (
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-3.5 text-xs font-bold text-emerald-300 text-center animate-in zoom-in-95 flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0 animate-bounce" />
            <span>{authSuccessMessage}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 border-b border-white/10 pb-3 text-xs overflow-x-auto">
          <button
            onClick={() => { setAuthMode('credentials'); setLoginStep('credentials'); }}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'credentials'
                ? "bg-[#0A66C2] text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            🔑 Sign In (Username &amp; Password)
          </button>
          <button
            onClick={() => { setAuthMode('register'); setRegStep('form'); }}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'register'
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            🆕 Register Account
          </button>
          <button
            onClick={() => setAuthMode('signin')}
            className={`rounded-xl px-3.5 py-2 font-bold transition-all shrink-0 ${
              authMode === 'signin'
                ? "bg-[#0A66C2] text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            ⚡ 1-Click Personas
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

        {/* TAB 1: SIGN IN WITH USERNAME, PASSWORD & 2FA STEP */}
        {authMode === 'credentials' && (
          <div className="space-y-4 text-xs">
            {loginStep === 'credentials' ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Username / Corporate Email</label>
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
                    Don't have an account? Register →
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-black px-5 py-2.5 shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <span>Proceed to 2FA Verification →</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Second Factor Authentication (2FA Email or SMS) */
              <div className="space-y-4 text-center py-2 animate-in zoom-in-95">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">Second Factor Authentication (2FA)</h3>
                  <p className="text-zinc-400 text-xs">
                    Choose your verification method to confirm identity for: <strong className="text-white">{emailInput}</strong>
                  </p>
                </div>

                {/* 2FA Channel Selector */}
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
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2 shadow-lg transition-all"
                  >
                    Verify &amp; Sign In 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REGISTER ACCOUNT WITH EMAIL/TEXT 2FA & RETURN TO LOGIN */}
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
                    <label className="block text-zinc-300 font-bold mb-1">Email Address</label>
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
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <span>Proceed to 2FA Setup →</span>
                  </button>
                </div>
              </form>
            ) : regStep === 'verify' ? (
              /* Step 2: 2FA Verification Channel (Email or SMS Text) */
              <div className="space-y-4 text-center py-2 animate-in zoom-in-95">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white">Choose Your 2FA Verification Channel</h3>
                  <p className="text-zinc-400 text-[11px]">We will send a one-time 6-digit confirmation code:</p>
                </div>

                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => setReg2faChannel('email')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      reg2faChannel === 'email'
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Verify via Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReg2faChannel('sms')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      reg2faChannel === 'sms'
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Verify via Text (SMS)</span>
                  </button>
                </div>

                <div className="max-w-xs mx-auto space-y-1">
                  <span className="text-[10px] text-zinc-400 font-mono block">
                    {reg2faChannel === 'email' ? `Code dispatched to ${regEmail}` : `Code dispatched to ${regPhone}`}
                  </span>
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
                    onClick={handleConfirm2FACode}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2 shadow-lg"
                  >
                    Confirm &amp; Register Identity ✓
                  </button>
                </div>
              </div>
            ) : (
              /* Step 3: Registration Confirmed -> Click Button to Return to Sign In Screen! */
              <div className="space-y-4 text-center py-4 animate-in zoom-in-95">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto text-2xl">
                  🎉
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">Registration &amp; 2FA Verified!</h3>
                  <p className="text-zinc-300 text-xs max-w-md mx-auto leading-relaxed">
                    Your ConnectIn account for <strong className="text-emerald-300">{regEmail}</strong> is fully verified and registered in the platform IAM directory.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 max-w-sm mx-auto text-left text-[11px] font-mono space-y-1">
                  <p className="text-emerald-400">✓ Email &amp; SMS 2FA Attestation: Validated</p>
                  <p className="text-zinc-300">✓ Assigned Role: {regRole.toUpperCase()}</p>
                  <p className="text-zinc-400">✓ Ready for Username &amp; Password Sign In</p>
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

        {/* TAB 3: 1-CLICK PERSONA LOGIN */}
        {authMode === 'signin' && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Select any pre-configured identity below to authenticate instantly:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {DEMO_AUTH_PERSONAS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleExecuteLogin(p)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 group hover:scale-[1.02] ${
                    selectedPersona.id === p.id
                      ? "bg-white/15 border-[#0A66C2] ring-1 ring-[#0A66C2]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={p.avatar} alt="" className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/20" />
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-xs text-white truncate group-hover:text-sky-300 transition-colors">
                        {p.name}
                      </h4>
                      <span className={`inline-block rounded-full px-2 py-0.2 text-[9px] font-bold border mt-0.5 ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-300 line-clamp-2 leading-relaxed bg-black/30 p-2 rounded-lg border border-white/5 font-mono">
                    ➔ {p.redirectDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ENTERPRISE SSO / SAML */}
        {authMode === 'sso' && (
          <div className="space-y-4 text-xs">
            <p className="text-zinc-300 leading-relaxed">
              Authenticate via your organization's Identity Provider (IdP) with automated SCIM user provisioning:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleExecuteLogin(DEMO_AUTH_PERSONAS[1])}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-left space-y-1 transition-all"
              >
                <p className="font-bold text-white text-xs">🪟 Microsoft Entra ID (Azure AD)</p>
                <p className="text-[10px] text-zinc-400">Direct SAML 2.0 GovCloud SSO</p>
              </button>
              <button
                onClick={() => handleExecuteLogin(DEMO_AUTH_PERSONAS[0])}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-left space-y-1 transition-all"
              >
                <p className="font-bold text-white text-xs">🔍 Google Workspace Enterprise</p>
                <p className="text-[10px] text-zinc-400">OpenID Connect &amp; PKCE Flow</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
