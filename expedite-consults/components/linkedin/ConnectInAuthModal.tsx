"use client"

import React, { useState } from "react"
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
  AlertCircle,
  X,
  Laptop,
  Fingerprint,
  Briefcase,
  Video,
  ShieldAlert,
  Code
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"

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
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'credentials' | 'sso'>('signin')
  const [selectedPersona, setSelectedPersona] = useState<AuthPersona>(DEMO_AUTH_PERSONAS[0])
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")

  // Registration State
  const [regFirstName, setRegFirstName] = useState("")
  const [regLastName, setRegLastName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regRole, setRegRole] = useState<'personal' | 'enterprise' | 'creator' | 'seller' | 'developer'>('personal')
  const [regStep, setRegStep] = useState<'form' | 'verify'>('form')
  const [verificationCode, setVerificationCode] = useState("749204")

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleExecuteLogin = (personaToLogin: AuthPersona) => {
    setIsAuthenticating(true)
    setAuthSuccessMessage(
      `✓ Authenticated via FIDO2 Passkey. Identity verified: ${personaToLogin.name} (${personaToLogin.badge}). Session ID: sess_${Date.now().toString(36)}. Redirecting...`
    )

    setTimeout(() => {
      setIsAuthenticating(false)
      setAuthSuccessMessage(null)
      onClose()

      // Construct verified UserProfile based on persona
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

      onLoginSuccess(authenticatedUser, personaToLogin.defaultTab, personaToLogin.defaultWorkspace)
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
    const targetTab =
      regRole === 'enterprise' ? 'procurement' :
      regRole === 'creator' ? 'media' :
      regRole === 'seller' ? 'sellercenter' :
      regRole === 'developer' ? 'code' : 'home'

    const targetWorkspace: 'personal' | 'enterprise' | 'creator' | 'seller' =
      regRole === 'enterprise' ? 'enterprise' :
      regRole === 'creator' ? 'creator' :
      regRole === 'seller' ? 'seller' : 'personal'

    setAuthSuccessMessage(
      `✓ Email verified & FIDO2 Passkey initialized for ${fullName}! Session created: sess_${Date.now().toString(36)}. Launching ${regRole.toUpperCase()} workspace...`
    )

    setTimeout(() => {
      setIsAuthenticating(false)
      setAuthSuccessMessage(null)
      setRegStep('form')
      onClose()

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
        about: `New registered ${regRole} on ConnectIn Identity platform with active session registry.`,
        skills: ['Cloud Engineering', 'Security Operations', 'Zero Trust Architecture'],
        experience: [],
        education: []
      }

      onLoginSuccess(newRegisteredUser, targetTab, targetWorkspace)
    }, 1300)
  }

  const handleManualFormSubmit = (e: React.FormEvent) => {
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
                    FIDO2 / RBAC Active
                  </span>
                </h2>
                <p className="text-xs text-zinc-300">
                  Register New Session · Role-Aware Authentication Gate
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
            ✉️ Credentials &amp; Passkeys
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

        {/* TAB 1: 1-CLICK PERSONA LOGIN */}
        {authMode === 'signin' && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Select any pre-configured identity below to authenticate instantly and launch its dedicated workspace:
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

        {/* TAB 2: REGISTER NEW USER ACCOUNT & MINT SESSION */}
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
                  <label className="block text-zinc-300 font-bold mb-1">Password / Passkey</label>
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
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <span>Create Account &amp; Send Code →</span>
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

        {/* TAB 3: CREDENTIALS & PASSKEYS FORM */}
        {authMode === 'credentials' && (
          <form onSubmit={handleManualFormSubmit} className="space-y-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Email / Corporate ID</label>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3 py-2.5">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="e.g. sec-admin@connectin.internal or marcus.vance@defense.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Password / Passkey Challenge</label>
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
                onClick={() => handleExecuteLogin(DEMO_AUTH_PERSONAS[0])}
                className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold text-xs"
              >
                <Fingerprint className="h-4 w-4" />
                <span>Use Biometric Passkey</span>
              </button>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-black px-5 py-2.5 shadow-lg transition-all flex items-center gap-1.5"
              >
                <span>Sign In &amp; Route Role →</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: ENTERPRISE SSO / SAML */}
        {authMode === 'sso' && (
          <div className="space-y-4 text-xs">
            <p className="text-zinc-300 leading-relaxed">
              Authenticate via your organization's Identity Provider (IdP) with automated SCIM user provisioning and group mapping:
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
