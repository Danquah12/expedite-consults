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
import { saveStoredUser, saveStoredSessionRoute, getVaultProfileForUser } from "@/lib/connectin-storage"
import { createUniqueUserProfile, resolveDisplayName, isSuperAdminUser } from "@/lib/connectin-profile"
import { findProfessionById, PROFESSION_ENCLAVES } from "@/lib/connectin-professions"
import { ProfessionSearchPopout } from "@/components/linkedin/ProfessionSearchPopout"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
import { signIn } from "next-auth/react"
import { useLanguage } from "@/context/LanguageContext"
import { GoogleAuthModal } from "@/components/auth/GoogleAuthModal"
import { MicrosoftAuthModal } from "@/components/auth/MicrosoftAuthModal"

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
  professionId?: string
  professionEnclave?: string
}

export const DEMO_AUTH_PERSONAS: AuthPersona[] = [
  {
    id: 'persona_carpenter',
    name: 'David Miller (Master Carpenter)',
    email: 'david.carpenter@timbercraft.io',
    title: 'Master Carpenter & Heavy Timber Framing Specialist',
    role: 'personal',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'home',
    defaultWorkspace: 'personal',
    badge: '🔨 Master Carpenter',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    redirectDescription: 'Trades & Construction Enclave · Zero Bleed-Through',
    professionId: 'carpenter',
    professionEnclave: 'trades_construction'
  },
  {
    id: 'persona_nurse',
    name: 'Elena Rostova, RN (Trauma Nurse Lead)',
    email: 'elena.nurse@hopkinsmedicine.org',
    title: 'Lead Trauma Clinical Nurse Specialist (BSN, CCRN, TCRN)',
    role: 'personal',
    avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'home',
    defaultWorkspace: 'personal',
    badge: '🩺 Trauma Nurse Lead',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    redirectDescription: 'Healthcare & Medicine Enclave · Clinical & Patient Care',
    professionId: 'er_trauma_nurse',
    professionEnclave: 'healthcare_medicine'
  },
  {
    id: 'persona_doctor',
    name: 'Dr. Angela Vance, MD (Orthopedic Surgeon)',
    email: 'angela.vance@clevelandclinic.org',
    title: 'Chief of Orthopedic Trauma Surgery · Board Certified FAAOS',
    role: 'personal',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'home',
    defaultWorkspace: 'personal',
    badge: '🩺 Orthopedic Surgeon',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    redirectDescription: 'Healthcare & Medicine Enclave · Surgical Specialties',
    professionId: 'orthopedic_trauma_surgeon',
    professionEnclave: 'healthcare_medicine'
  },
  {
    id: 'persona_mechanic',
    name: 'Marcus Miller (ASE Master Auto Tech)',
    email: 'marcus.mechanic@precisionauto.com',
    title: 'ASE Master Certified & High-Voltage EV Diagnostic Technician (L1/L3)',
    role: 'personal',
    avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'home',
    defaultWorkspace: 'personal',
    badge: '⚡ Master Auto Tech',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    redirectDescription: 'Automotive & Mechanics Enclave · EV Diagnostic Rig',
    professionId: 'ase_master_auto_tech',
    professionEnclave: 'automotive_mechanics'
  },
  {
    id: 'persona_cyber',
    name: 'Tariq Al-Mansoor (Red Team Lead)',
    email: 'tariq.cyber@mandiant-cyber.io',
    title: 'Principal Offensive Security & Red Team Lead (OSCP, OSCE3, GXPN)',
    role: 'personal',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    defaultTab: 'home',
    defaultWorkspace: 'personal',
    badge: '🛡️ Red Team Lead',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    redirectDescription: 'Cybersecurity Enclave · Zero Trust & Offensive Ops',
    professionId: 'red_team_lead',
    professionEnclave: 'tech_cybersecurity'
  },
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
    redirectDescription: 'Founder Workspace · Full Network Access',
    professionId: 'corporate_attorney',
    professionEnclave: 'law_gov_defense'
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
    redirectDescription: 'Personal Workspace · Home Feed & Skills',
    professionId: 'software_engineer',
    professionEnclave: 'tech_cybersecurity'
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
  const { t } = useLanguage()
  const [activeView, setActiveView] = useState<'signin' | 'join'>('signin')
  const [showPassword, setShowPassword] = useState(false)

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPhone, setSignInPhone] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInProfessionId, setSignInProfessionId] = useState<string>("auto_detect")
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
  const [joinProfessionId, setJoinProfessionId] = useState<string>("carpenter")
  const [joinChannel, setJoinChannel] = useState<'email' | 'sms' | 'call'>('email')
  const [joinStep, setJoinStep] = useState<'form' | '2fa'>('form')
  const [join2FACode, setJoin2FACode] = useState("")

  // Challenge token for stateless OTP verification across serverless lambdas
  const [otpChallengeToken, setOtpChallengeToken] = useState<string | null>(null)
  const [dispatchedOtpCode, setDispatchedOtpCode] = useState<string | null>(null)
  const [fallbackDemoCode, setFallbackDemoCode] = useState<string>("123456")

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Demo Drawer
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false)

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [isMicrosoftModalOpen, setIsMicrosoftModalOpen] = useState(false)

  // Direct Google Identity Services Authentication (accounts.google.com)
  const handleGoogleSignIn = () => {
    setErrorMessage(null)
    setIsGoogleModalOpen(true)
  }

  // Direct Microsoft Entra ID (Azure AD) Authentication (login.microsoftonline.com)
  const handleMicrosoftSignIn = () => {
    setErrorMessage(null)
    setIsMicrosoftModalOpen(true)
  }

  // Web Speech API Voice Call Engine (Speaks 6-digit code for automated voice call simulation & verification)
  const playVoiceCallAudio = (codeToSpeak?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    try {
      window.speechSynthesis.cancel() // Stop any previous playback
      const codeDigits = (codeToSpeak || dispatchedOtpCode || fallbackDemoCode || "123456").split("").join(", ")
      const text = `Hello! This is ConnectIn Security by Expedite Consults. Your one-time verification code is: ${codeDigits}. I repeat: ${codeDigits}. Thank you for using ConnectIn.`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.92
      utterance.pitch = 1.05
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn("[Voice Call SpeechSynthesis notice]", e)
    }
  }

  // 1. Sign In Dispatch
  const handleSignInSubmit = async (e?: React.FormEvent, channelOverride?: 'email' | 'sms' | 'call') => {
    if (e) e.preventDefault()
    if (!signInEmail) return

    const effectiveChannel = channelOverride || signInChannel
    if (channelOverride) setSignInChannel(channelOverride)

    let effectivePhone = signInPhone
    if (!effectivePhone && (signInEmail.includes("kasiedu") || signInEmail.includes("asiedu"))) {
      effectivePhone = "+1 (240) 260-7898"
      setSignInPhone(effectivePhone)
    }

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(`Dispatching verification code via ${effectiveChannel.toUpperCase()}...`)

    try {
      const res = await fetch("/api/connectin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInEmail,
          phone: effectivePhone,
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
      if (data.code) {
        setDispatchedOtpCode(data.code)
      }
      if (data.fallbackCode) {
        setFallbackDemoCode(data.fallbackCode)
      }
      setActiveTargetDisplay(data.target || (effectiveChannel === 'email' ? signInEmail : (effectivePhone || signInEmail)))
      setSignInStep('2fa')
      
      if (effectiveChannel === 'call') {
        const spoken = data.code || data.fallbackCode || '123456'
        setSuccessMessage(`📞 Automated voice call placed to ${data.target || effectivePhone || signInEmail}... Please answer your phone to hear your code.`)
        setTimeout(() => playVoiceCallAudio(spoken), 350)
      } else if (effectiveChannel === 'sms') {
        setSuccessMessage(`💬 Text message sent to ${data.target || effectivePhone || signInEmail}. Please enter the 6-digit code.`)
      } else if (data.emailError) {
        setSuccessMessage(`✉️ Email notice: ${data.emailError}. You may use code ${data.code || data.fallbackCode || '123456'} below.`)
      } else {
        setSuccessMessage(`✉️ Verification code sent to ${data.target || signInEmail}. Please check your inbox and Spam/Junk folder (sent from auth@expediteconsults.com).`)
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
      const vaultProfile = getVaultProfileForUser({ email: signInEmail, name: resolvedName })
      const explicitProf = signInProfessionId !== "auto_detect" ? findProfessionById(signInProfessionId) : null
      const vaultProf = (!explicitProf && vaultProfile?.professionId) ? findProfessionById(vaultProfile.professionId) : null
      const selectedProf = explicitProf || vaultProf

      const res = await fetch("/api/connectin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: verifyTarget,
          email: signInEmail,
          phone: signInPhone,
          code,
          name: vaultProfile?.name || resolvedName,
          professionId: selectedProf?.id || vaultProfile?.professionId,
          profession: selectedProf?.title || vaultProfile?.profession,
          professionCategory: selectedProf?.categoryName || vaultProfile?.professionCategory,
          professionEnclave: selectedProf?.enclaveId || vaultProfile?.professionEnclave,
          headline: explicitProf ? explicitProf.defaultHeadline : vaultProfile?.headline,
          otpChallengeToken
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code.")
      }

      const effectiveProfessionId = selectedProf?.id || vaultProfile?.professionId || data.profile?.professionId
      const effectiveEnclave = selectedProf?.enclaveId || vaultProfile?.professionEnclave || data.profile?.professionEnclave

      const baseProfile = data.profile || createUniqueUserProfile({
        name: vaultProfile?.name || resolvedName,
        email: signInEmail,
        role: "personal",
        professionId: effectiveProfessionId,
        professionEnclave: effectiveEnclave
      })

      const generatedDomainProfile = selectedProf ? createUniqueUserProfile({
        name: vaultProfile?.name || resolvedName,
        email: signInEmail,
        professionId: selectedProf.id,
        professionEnclave: selectedProf.enclaveId,
        role: "personal"
      }) : null

      // Always inject email — API's UserProfileRecord has no email field
      const profileToSave = {
        ...baseProfile,
        ...(vaultProfile || {}),
        email: signInEmail,
        id: data.profile?.userId || data.user?.id || data.profile?.id || vaultProfile?.id || baseProfile.id,
        ...(selectedProf && generatedDomainProfile ? {
          profession: selectedProf.title,
          professionId: selectedProf.id,
          professionCategory: selectedProf.categoryName,
          professionEnclave: selectedProf.enclaveId,
          headline: explicitProf ? selectedProf.defaultHeadline : (vaultProfile?.headline || selectedProf.defaultHeadline),
          experience: (vaultProfile?.experience && vaultProfile.experience.length > 0 && !explicitProf) ? vaultProfile.experience : generatedDomainProfile.experience,
          certifications: (vaultProfile?.certifications && vaultProfile.certifications.length > 0 && !explicitProf) ? vaultProfile.certifications : generatedDomainProfile.certifications,
          skills: (vaultProfile?.skills && vaultProfile.skills.length > 0 && !explicitProf) ? vaultProfile.skills : generatedDomainProfile.skills,
          coverImage: vaultProfile?.coverImage || generatedDomainProfile.coverImage,
          about: (vaultProfile?.about && !explicitProf) ? vaultProfile.about : generatedDomainProfile.about
        } : {})
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
      const selectedProf = findProfessionById(joinProfessionId)

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
          professionId: joinProfessionId,
          profession: selectedProf?.title,
          professionCategory: selectedProf?.categoryName,
          professionEnclave: selectedProf?.enclaveId,
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
      if (data.code) {
        setDispatchedOtpCode(data.code)
      }
      if (data.fallbackCode) {
        setFallbackDemoCode(data.fallbackCode)
      }
      setJoinStep('2fa')
      if (effectiveChannel === 'call') {
        const spoken = data.code || data.fallbackCode || '123456'
        setSuccessMessage(`📞 Automated voice call placed to ${data.target || joinPhone || joinEmail}... Please answer your phone to hear your code.`)
        setTimeout(() => playVoiceCallAudio(spoken), 350)
      } else if (effectiveChannel === 'sms') {
        setSuccessMessage(`💬 Verification text message sent to ${joinPhone || joinEmail}.`)
      } else if (data.emailError) {
        setSuccessMessage(`✉️ Email notice: ${data.emailError}. You may use code ${data.code || data.fallbackCode || '123456'} below.`)
      } else {
        setSuccessMessage(`✉️ Verification code sent to ${joinEmail}. Please check your inbox and Spam/Junk folder (sent from auth@expediteconsults.com).`)
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
      const selectedProf = findProfessionById(joinProfessionId)

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
          professionId: joinProfessionId,
          profession: selectedProf?.title,
          professionCategory: selectedProf?.categoryName,
          professionEnclave: selectedProf?.enclaveId,
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

      // Always inject email and registered profession
      const profileToSave = {
        ...(data.profile || createUniqueUserProfile({
          name: resolvedName,
          email: joinEmail,
          role: joinRole,
          professionId: selectedProf?.id || joinProfessionId,
          professionEnclave: selectedProf?.enclaveId
        })),
        email: joinEmail,
        id: data.profile?.userId || data.user?.id || data.profile?.id,
        profession: data.profile?.profession || selectedProf?.title || 'Master Carpenter (Framing & Finish Joinery)',
        professionId: data.profile?.professionId || selectedProf?.id || joinProfessionId,
        professionCategory: data.profile?.professionCategory || selectedProf?.categoryName || 'Skilled Trades & Construction',
        professionEnclave: data.profile?.professionEnclave || selectedProf?.enclaveId || 'trades_construction'
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
        headline: persona.title,
        professionId: persona.professionId,
        professionEnclave: persona.professionEnclave
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] max-h-[92dvh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 text-zinc-900 dark:text-zinc-100 shadow-2xl space-y-4 sm:space-y-5">
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
            {t("sign_in_btn", "Sign in")}
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
            {t("join_now_btn", "Join now")}
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
                {/* Professional Profile Search & Popout Selector */}
                <ProfessionSearchPopout
                  selectedProfessionId={signInProfessionId}
                  onSelectProfession={(profId) => setSignInProfessionId(profId)}
                  label={t("profession_label", "Professional Profile & Enclave")}
                  showAutoDetectOption={true}
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("email_or_phone", "Email address or username")}</label>
                  <input
                    type="text"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="e.g. asiedudanquah@gmail.com"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                  />
                </div>

                {/* 2FA Delivery Channel Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("deliver_2fa_via", "Send 2FA Security Code Via")}</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSignInChannel('email')}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
                        signInChannel === 'email'
                          ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      <span>{t("send_code_via_email", "✉️ Email")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignInChannel('sms')
                        if (!signInPhone && (signInEmail.includes('kasiedu') || signInEmail.includes('asiedu'))) {
                          setSignInPhone('+1 (240) 260-7898')
                        }
                      }}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
                        signInChannel === 'sms'
                          ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      <span>{t("send_code_via_sms", "💬 SMS")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignInChannel('call')
                        if (!signInPhone && (signInEmail.includes('kasiedu') || signInEmail.includes('asiedu'))) {
                          setSignInPhone('+1 (240) 260-7898')
                        }
                      }}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
                        signInChannel === 'call'
                          ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      <span>{t("send_code_via_call", "📞 Call")}</span>
                    </button>
                  </div>
                </div>

                {/* Phone Number Input (if SMS or Call selected) */}
                {(signInChannel === 'sms' || signInChannel === 'call') && (
                  <div className="space-y-1 animate-in fade-in duration-150">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {t("phone_number", "Mobile Phone Number")} {signInChannel === 'call' ? 'for Voice Call' : 'for SMS'}
                    </label>
                    <input
                      type="tel"
                      value={signInPhone}
                      onChange={(e) => setSignInPhone(e.target.value)}
                      placeholder="+1 (240) 555-0192"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("password", "Password")}</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline touch-manipulation"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="•••••••••••• (optional for passwordless OTP)"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-2.5 min-h-[46px] text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 touch-manipulation active:scale-[0.99]"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{t("sign_in_btn", "Sign in with 2FA")}</span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  <span className="bg-white dark:bg-zinc-900 px-2 text-[11px] text-zinc-400 font-medium absolute">
                    {t("or_divider", "or")}
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn()}
                    disabled={isLoading}
                    className="w-full rounded-full border-2 border-[#0A66C2] bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 py-2.5 px-3 min-h-[46px] text-xs font-bold text-zinc-800 dark:text-zinc-100 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-[0.99] shadow-xs"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{t("continue_with_google", "Continue with Google")}</span>
                    <span className="text-[10px] bg-[#0A66C2] text-white px-2 py-0.5 rounded-full font-semibold">Fast &amp; Easy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMicrosoftSignIn()}
                    disabled={isLoading}
                    className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-3 min-h-[46px] text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer touch-manipulation active:scale-[0.99]"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                    </svg>
                    <span>{t("continue_with_microsoft", "Continue with Microsoft")}</span>
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
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{t("two_step_verification", "Enter Security Code")}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t("enter_code_delivered_to", "Enter the 6-digit code delivered to")} <strong className="text-zinc-900 dark:text-zinc-200">{activeTargetDisplay || signInEmail}</strong>
                  </p>
                </div>

                {(dispatchedOtpCode || signInChannel === 'call' || fallbackDemoCode) && (
                  <div className={`rounded-xl border p-3 text-center space-y-2 animate-in fade-in duration-200 ${
                    signInChannel === 'call'
                      ? "border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40"
                      : signInChannel === 'sms'
                      ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40"
                  }`}>
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className={`font-semibold flex items-center gap-1.5 ${
                        signInChannel === 'call'
                          ? "text-purple-900 dark:text-purple-200"
                          : signInChannel === 'sms'
                          ? "text-emerald-900 dark:text-emerald-200"
                          : "text-sky-900 dark:text-sky-200"
                      }`}>
                        <span>{signInChannel === 'call' ? '📞' : signInChannel === 'sms' ? '💬' : '✉️'}</span>
                        <span>{signInChannel === 'call' ? t("dispatched_voice_code", "Voice Call Dispatched Code:") : signInChannel === 'sms' ? t("dispatched_sms_code", "SMS Text Dispatched Code:") : t("dispatched_email_code", "Email Dispatched Code:")}</span>
                      </span>
                      <span className={`font-mono text-base font-black tracking-[3px] ${
                        signInChannel === 'call'
                          ? "text-purple-700 dark:text-purple-300"
                          : signInChannel === 'sms'
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-[#0A66C2] dark:text-sky-300"
                      }`}>{dispatchedOtpCode || fallbackDemoCode || "123456"}</span>
                    </div>

                    {signInChannel === 'call' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => playVoiceCallAudio(dispatchedOtpCode || fallbackDemoCode || "123456")}
                          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>{t("hear_call_again", "🔊 Hear Call Again")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const c = dispatchedOtpCode || fallbackDemoCode || "123456"
                            setSignIn2FACode(c)
                            handleVerifySignIn2FA(c)
                          }}
                          className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white py-1.5 px-2.5 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>{t("autofill_enter", "⚡ Auto-Fill & Enter")}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const c = dispatchedOtpCode || fallbackDemoCode || "123456"
                          setSignIn2FACode(c)
                          handleVerifySignIn2FA(c)
                        }}
                        className={`w-full rounded-lg text-white py-1.5 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          signInChannel === 'sms'
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-[#0A66C2] hover:bg-[#004182]"
                        }`}
                      >
                        <span>{t("autofill_enter", "⚡ 1-Click Auto-Fill & Enter")} ({dispatchedOtpCode || fallbackDemoCode || "123456"})</span>
                      </button>
                    )}
                  </div>
                )}

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
                    className="w-full text-center text-2xl sm:text-3xl font-mono font-bold tracking-[4px] sm:tracking-[8px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 sm:p-3 text-[#0A66C2] dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                  />

                  {/* Resend via Alternative Channels */}
                  <div className="text-xs text-zinc-500 space-y-1.5 pt-1">
                    <p className="text-[11px] text-zinc-400">{t("didnt_receive_code", "Didn't receive the code? Resend via:")}</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSignInSubmit(undefined, 'email')}
                        disabled={isLoading}
                        className="font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md"
                      >
                        {t("send_code_via_email", "✉️ Email")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSignInSubmit(undefined, 'sms')}
                        disabled={isLoading}
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md"
                      >
                        {t("send_code_via_sms", "💬 SMS Text")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSignInSubmit(undefined, 'call')}
                        disabled={isLoading}
                        className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md"
                      >
                        {t("send_code_via_call", "📞 Phone Call")}
                      </button>
                    </div>
                  </div>

                  {/* Spam Folder Notice & Instant Verification Helper */}
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 text-left space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <span>✉️ Check Spam &amp; Junk Folders</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">auth@expediteconsults.com</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-normal">
                      Security emails from automated transactional gateways are often filtered by Gmail, Outlook, or corporate firewalls into <strong>Spam</strong> or <strong>Promotions</strong>.
                    </p>
                    <div className="pt-1.5 border-t border-amber-300/40 dark:border-amber-700/40 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Delayed or filtered?</span>
                      <button
                        type="button"
                        onClick={() => {
                          const codeToFill = dispatchedOtpCode || fallbackDemoCode || "123456"
                          setSignIn2FACode(codeToFill)
                          handleVerifySignIn2FA(codeToFill)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Instant Auto-Fill ({dispatchedOtpCode || fallbackDemoCode || "123456"})</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSignInStep('credentials')}
                      className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2.5 min-h-[44px] text-xs font-semibold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 touch-manipulation active:scale-[0.98]"
                    >
                      {t("back", "Back")}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || signIn2FACode.length < 6}
                      className="flex-1 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white py-2.5 min-h-[44px] text-xs font-bold cursor-pointer disabled:opacity-50 touch-manipulation active:scale-[0.98]"
                    >
                      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                      <span>{t("verify_and_sign_in", "Verify & Sign in")}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                    <p className="text-[11px] text-zinc-400 mb-1.5">{t("or_verify_sso", "Or verify instantly via single sign-on:")}</p>
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
                    className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-3 min-h-[46px] text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer touch-manipulation active:scale-[0.99]"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{t("join_with_google", "Join with Google")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMicrosoftSignIn()}
                    disabled={isLoading}
                    className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-3 min-h-[46px] text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer touch-manipulation active:scale-[0.99]"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                    </svg>
                    <span>{t("join_with_microsoft", "Join with Microsoft")}</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  <span className="bg-white dark:bg-zinc-900 px-2 text-[11px] text-zinc-400 font-medium absolute">
                    {t("or_continue_with_email", "or continue with email")}
                  </span>
                </div>

                <form onSubmit={handleJoinSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("first_name", "First name")}</label>
                      <input
                        type="text"
                        required
                        value={joinFirstName}
                        onChange={(e) => setJoinFirstName(e.target.value)}
                        placeholder="Kwesi"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("last_name", "Last name")}</label>
                      <input
                        type="text"
                        required
                        value={joinLastName}
                        onChange={(e) => setJoinLastName(e.target.value)}
                        placeholder="Asiedu"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("email_or_phone", "Email Address")}</label>
                    <input
                      type="email"
                      required
                      value={joinEmail}
                      onChange={(e) => setJoinEmail(e.target.value)}
                      placeholder="asiedudanquah@gmail.com"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                    />
                  </div>

                  {/* 2FA Delivery Channel Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("deliver_2fa_via", "Deliver 2FA Code Via")}</label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setJoinChannel('email')}
                        className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
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
                        className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
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
                        className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
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
                        {t("phone_number", "Mobile Phone Number")} {joinChannel === 'call' ? '(Voice Call)' : '(SMS Text)'}
                      </label>
                      <input
                        type="tel"
                        value={joinPhone}
                        onChange={(e) => setJoinPhone(e.target.value)}
                        placeholder="+1 (240) 555-0192"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("password", "Password")} (6+ chars)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                    />
                  </div>

                  <div>
                    <ProfessionSearchPopout
                      value={joinProfessionId}
                      onChange={(profId) => setJoinProfessionId(profId)}
                      label="Your Profession (Assigns Your Enclave & Video)"
                      compact
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("primary_workspace", "Primary Role")}</label>
                    <select
                      value={joinRole}
                      onChange={(e) => setJoinRole(e.target.value as any)}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                    >
                      <option value="personal">👤 {t("workspace_individual", "Individual Professional (Feed & Skills)")}</option>
                      <option value="enterprise">🏢 {t("workspace_enterprise", "Enterprise Buyer (Procurement & RFPs)")}</option>
                      <option value="creator">🎬 {t("workspace_creator", "Creator & Studio Host (Video & Podcasts)")}</option>
                      <option value="seller">💼 {t("workspace_seller", "Marketplace Seller (Storefront & Licenses)")}</option>
                      <option value="developer">🧑‍💻 Defense & Kernel Developer (Code & Labs)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-2.5 min-h-[46px] text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 touch-manipulation active:scale-[0.99]"
                  >
                    {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{t("agree_and_join", "Agree & Join")}</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Join 2FA -> Direct Launch */
              <form onSubmit={(e) => { e.preventDefault(); handleVerifyJoin2FA(); }} className="space-y-4 text-center">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{t("confirm_verification_code", "Confirm Your Code")}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t("enter_code_delivered_to", "Enter the 6-digit code sent to")} <strong className="text-zinc-900 dark:text-zinc-200">{joinPhone || joinEmail}</strong>
                  </p>
                </div>

                {(dispatchedOtpCode || joinChannel === 'call' || fallbackDemoCode) && (
                  <div className={`rounded-xl border p-3 text-center space-y-2 animate-in fade-in duration-200 ${
                    joinChannel === 'call'
                      ? "border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40"
                      : joinChannel === 'sms'
                      ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40"
                  }`}>
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className={`font-semibold flex items-center gap-1.5 ${
                        joinChannel === 'call'
                          ? "text-purple-900 dark:text-purple-200"
                          : joinChannel === 'sms'
                          ? "text-emerald-900 dark:text-emerald-200"
                          : "text-sky-900 dark:text-sky-200"
                      }`}>
                        <span>{joinChannel === 'call' ? '📞' : joinChannel === 'sms' ? '💬' : '✉️'}</span>
                        <span>{joinChannel === 'call' ? t("dispatched_voice_code", "Voice Call Dispatched Code:") : joinChannel === 'sms' ? t("dispatched_sms_code", "SMS Text Dispatched Code:") : t("dispatched_email_code", "Email Dispatched Code:")}</span>
                      </span>
                      <span className={`font-mono text-base font-black tracking-[3px] ${
                        joinChannel === 'call'
                          ? "text-purple-700 dark:text-purple-300"
                          : joinChannel === 'sms'
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-sky-600 dark:text-sky-300"
                      }`}>{dispatchedOtpCode || fallbackDemoCode || "123456"}</span>
                    </div>

                    {joinChannel === 'call' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => playVoiceCallAudio(dispatchedOtpCode || fallbackDemoCode || "123456")}
                          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>{t("hear_call_again", "🔊 Hear Call Again")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const c = dispatchedOtpCode || fallbackDemoCode || "123456"
                            setJoin2FACode(c)
                            handleVerifyJoin2FA(c)
                          }}
                          className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white py-1.5 px-2.5 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>{t("autofill_enter", "⚡ Auto-Fill & Enter")}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const c = dispatchedOtpCode || fallbackDemoCode || "123456"
                          setJoin2FACode(c)
                          handleVerifyJoin2FA(c)
                        }}
                        className={`w-full rounded-lg text-white py-1.5 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          joinChannel === 'sms'
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-[#0A66C2] hover:bg-[#004182]"
                        }`}
                      >
                        <span>{t("autofill_enter", "⚡ 1-Click Auto-Fill & Enter")} ({dispatchedOtpCode || fallbackDemoCode || "123456"})</span>
                      </button>
                    )}
                  </div>
                )}

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
                    className="w-full text-center text-2xl sm:text-3xl font-mono font-bold tracking-[4px] sm:tracking-[8px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 sm:p-3 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 touch-manipulation"
                  />

                  <div className="text-xs text-zinc-500 space-y-1.5 pt-1">
                    <p className="text-[11px] text-zinc-400">{t("didnt_receive_code", "Didn't receive the code? Resend via:")}</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleJoinSubmit(undefined, 'email')}
                        disabled={isLoading}
                        className="font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md touch-manipulation"
                      >
                        {t("send_code_via_email", "✉️ Email")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleJoinSubmit(undefined, 'sms')}
                        disabled={isLoading}
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md touch-manipulation"
                      >
                        {t("send_code_via_sms", "💬 SMS Text")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleJoinSubmit(undefined, 'call')}
                        disabled={isLoading}
                        className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md touch-manipulation"
                      >
                        {t("send_code_via_call", "📞 Phone Call")}
                      </button>
                    </div>
                  </div>

                  {/* Spam Folder Notice & Instant Verification Helper */}
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 text-left space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <span>{t("check_spam_folders", "✉️ Check Spam & Junk Folders")}</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">auth@expediteconsults.com</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-normal">
                      {t("spam_notice_desc", "Security emails from automated transactional gateways are often filtered by Gmail, Outlook, or corporate firewalls into Spam or Promotions.")}
                    </p>
                    <div className="pt-1.5 border-t border-amber-300/40 dark:border-amber-700/40 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t("delayed_or_filtered", "Delayed or filtered?")}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const codeToFill = dispatchedOtpCode || fallbackDemoCode || "123456"
                          setJoin2FACode(codeToFill)
                          handleVerifyJoin2FA(codeToFill)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition-colors flex items-center gap-1 cursor-pointer touch-manipulation active:scale-[0.98]"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{t("instant_access_label", "Instant Auto-Fill")} ({dispatchedOtpCode || fallbackDemoCode || "123456"})</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setJoinStep('form')}
                      className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2.5 min-h-[44px] text-xs font-semibold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 touch-manipulation active:scale-[0.98]"
                    >
                      {t("back", "Back")}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || join2FACode.length < 6}
                      className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 min-h-[44px] text-xs font-bold cursor-pointer disabled:opacity-50 touch-manipulation active:scale-[0.98]"
                    >
                      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                      <span>{t("confirm_and_join", "Confirm & Join")}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                    <p className="text-[11px] text-zinc-400 mb-1.5">{t("or_verify_sso", "Or verify instantly via single sign-on:")}</p>
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
              <span>{t("try_demo_personas", "⚡ Try 1-Click Demo Personas")}</span>
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
                  <span className="text-[10px] font-mono text-[#0A66C2] font-bold">{t("sign_in_btn", "Log In")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ─── Direct Google & Microsoft Identity Modals ─── */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        initialEmail={signInEmail || joinEmail}
        professionId={signInProfessionId !== "auto_detect" ? signInProfessionId : undefined}
        onSuccess={(user) => {
          onLoginSuccess(user, user.role === 'admin' ? 'adminiam' : 'home', 'personal')
          onClose()
        }}
      />

      <MicrosoftAuthModal
        isOpen={isMicrosoftModalOpen}
        onClose={() => setIsMicrosoftModalOpen(false)}
        initialEmail={signInEmail || joinEmail}
        professionId={signInProfessionId !== "auto_detect" ? signInProfessionId : undefined}
        onSuccess={(user) => {
          onLoginSuccess(user, user.role === 'admin' ? 'adminiam' : 'home', 'personal')
          onClose()
        }}
      />
    </div>
  )
}
