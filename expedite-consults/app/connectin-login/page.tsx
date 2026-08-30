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
  Fingerprint
} from "lucide-react"
import { DEMO_AUTH_PERSONAS, AuthPersona } from "@/components/linkedin/ConnectInAuthModal"
import {
  saveStoredUser,
  saveStoredSessionRoute,
  registerNewUserInDirectory
} from "@/lib/connectin-storage"
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
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)

  const handleLogin = (persona: AuthPersona) => {
    setIsAuthenticating(true)
    setStatusFeedback(
      `✓ 2FA Verified via ${login2faChannel.toUpperCase()}: ${persona.name}. Session: sess_${Date.now().toString(36)}. Launching workspace...`
    )

    const authenticatedUser: UserProfile = {
      name: persona.name,
      headline: persona.title,
      avatar: persona.avatar,
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
      about: `Verified ${persona.title} with high-assurance multi-factor cryptographic identity on ConnectIn.`,
      skills: ['AWS GovCloud Security', 'Kubernetes Zero Trust', 'cATO OSCAL Automation', 'eBPF Security Probes'],
      experience: [],
      education: []
    }

    saveStoredUser(authenticatedUser)
    saveStoredSessionRoute(persona.defaultTab, persona.defaultWorkspace)
    registerNewUserInDirectory({
      id: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
      name: persona.name,
      email: persona.email,
      roles: [persona.title],
      organization: 'Verified ConnectIn Enclave'
    })

    setTimeout(() => {
      router.push(`/connectin`)
    }, 1000)
  }

  // Registration step 1: submit to 2FA verification channel
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regEmail || !regFirstName) return
    setRegStep('verify')
  }

  // Registration step 2: confirm code & transition to confirmed state with "Return to Login" button
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

    setRegStep('confirmed')
  }

  // Return to Login with registered credentials prefilled
  const handleReturnToLogin = () => {
    setEmailInput(regEmail)
    setPasswordInput("")
    setAuthMode('credentials')
    setLoginStep('credentials')
  }

  // Sign In Step 1: Submit Credentials -> Prompt for 2FA Email / SMS
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput || !passwordInput) return
    setLoginStep('mfa')
  }

  // Sign In Step 2: Verify 2FA and login
  const handleVerifyLoginMFA = () => {
    let matched = DEMO_AUTH_PERSONAS.find(p => p.email.toLowerCase() === emailInput.toLowerCase())
    if (!matched) {
      if (emailInput.includes('admin')) matched = DEMO_AUTH_PERSONAS[4]
      else if (emailInput.includes('procurement') || emailInput.includes('corp')) matched = DEMO_AUTH_PERSONAS[1]
      else if (emailInput.includes('creator') || emailInput.includes('media')) matched = DEMO_AUTH_PERSONAS[2]
      else if (emailInput.includes('seller') || emailInput.includes('vendor')) matched = DEMO_AUTH_PERSONAS[3]
      else if (emailInput.includes('dev') || emailInput.includes('code')) matched = DEMO_AUTH_PERSONAS[5]
      else {
        const customName = regFirstName ? `${regFirstName} ${regLastName}` : emailInput.split('@')[0]
        matched = {
          ...DEMO_AUTH_PERSONAS[0],
          name: customName,
          email: emailInput
        }
      }
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
            ConnectIn Identity &amp; Auth Gate
          </h1>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Universal 2FA Email &amp; SMS verification with automated role routing.
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
                      placeholder="kwesi@expedite-consults.com"
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
                    className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-black px-5 py-2.5 shadow-lg transition-all"
                  >
                    Proceed to 2FA Verification →
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

        {/* Mode 2: Register Account with Email/SMS 2FA and "Return to Login" */}
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
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 shadow-lg transition-all"
                  >
                    Proceed to 2FA Setup →
                  </button>
                </div>
              </form>
            ) : regStep === 'verify' ? (
              /* Step 2: 2FA Verification Channel Choice (Email or SMS Text) */
              <div className="space-y-4 text-center py-2 animate-in zoom-in-95">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white">Choose Your 2FA Verification Channel</h3>
                  <p className="text-zinc-400 text-[11px]">We will send a 6-digit confirmation code:</p>
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
                  <h3 className="font-bold text-base text-white">Registration &amp; 2FA Confirmed!</h3>
                  <p className="text-zinc-300 text-xs max-w-md mx-auto leading-relaxed">
                    Your account for <strong className="text-emerald-300">{regEmail}</strong> is now registered. You can now return to the login screen to enter your username and password.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 max-w-sm mx-auto text-left text-[11px] font-mono space-y-1">
                  <p className="text-emerald-400">✓ Email &amp; SMS 2FA Attestation: Validated</p>
                  <p className="text-zinc-300">✓ Assigned Role: {regRole.toUpperCase()}</p>
                  <p className="text-zinc-400">✓ Identity registered in Admin IAM Directory</p>
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
