"use client"

import React, { useState, useEffect } from "react"
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
import { DEMO_AUTH_PERSONAS, AuthPersona } from "@/components/connectln/ConnectInAuthModal"
import { saveStoredUser, saveStoredSessionRoute, getVaultProfileForUser, getDefaultPortraitForUser } from "@/lib/connectin-storage"
import { createUniqueUserProfile, createFreshInvitedUserProfile, generatePersonalSignatureAvatar, resolveDisplayName, isSuperAdminUser, isDedicatedAdminAccount, isExactKwesiUser, isForeignPersonaAvatar } from "@/lib/connectin-profile"
import { PROFESSION_ENCLAVES, findProfessionById, findEnclaveById, getProfessionsByEnclave } from "@/lib/connectin-professions"
import { ProfessionSearchPopout } from "@/components/connectln/ProfessionSearchPopout"
import { ThemeColorSwitcher } from "@/components/theme/ThemeColorSwitcher"
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher"
import { useLanguage } from "@/context/LanguageContext"
import { GoogleAuthModal } from "@/components/auth/GoogleAuthModal"
import { MicrosoftAuthModal } from "@/components/auth/MicrosoftAuthModal"

import { signIn } from "next-auth/react"

export default function ConnectInLoginPage() {
  const router = useRouter()
  const { t } = useLanguage()

  // Main Mode: 'signin' (Sign in) vs 'join' (Join now / Register)
  const [activeView, setActiveView] = useState<'signin' | 'join'>('signin')

  // Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false)

  // Sign In Form State
  const [signInName, setSignInName] = useState("")
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPhone, setSignInPhone] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInProfessionId, setSignInProfessionId] = useState<string>("auto_detect")
  const [signInStep, setSignInStep] = useState<'credentials' | '2fa'>('credentials')
  const [signIn2FACode, setSignIn2FACode] = useState("")
  const [activeSignInTarget, setActiveSignInTarget] = useState("")

  // Challenge token for stateless OTP verification across serverless lambdas
  const [otpChallengeToken, setOtpChallengeToken] = useState<string | null>(null)

  // Join Now (Registration) Form State — Least Privilege Profession & Enclave Segregation
  const [joinFirstName, setJoinFirstName] = useState("")
  const [joinLastName, setJoinLastName] = useState("")
  const [joinEmail, setJoinEmail] = useState("")
  const [joinPassword, setJoinPassword] = useState("")
  const [joinEnclaveId, setJoinEnclaveId] = useState<string>("trades_construction")
  const [joinProfessionId, setJoinProfessionId] = useState<string>("carpenter")
  const [joinRole, setJoinRole] = useState<'personal' | 'enterprise' | 'creator' | 'seller' | 'developer'>('personal')
  const [joinStep, setJoinStep] = useState<'form' | '2fa'>('form')
  const [join2FACode, setJoin2FACode] = useState("")

  // UI Feedback States
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeDispatchedCode, setActiveDispatchedCode] = useState<string | null>(null)

  // Demo Persona Drawer Toggle
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SIGN IN FLOW (Email & Password -> 2FA -> Instant Login)
  // ─────────────────────────────────────────────────────────────────────────────
  const [signInChannel, setSignInChannel] = useState<'email' | 'sms' | 'call'>('email')
  const [joinChannel, setJoinChannel] = useState<'email' | 'sms' | 'call'>('email')
  const [joinPhone, setJoinPhone] = useState("")

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [isMicrosoftModalOpen, setIsMicrosoftModalOpen] = useState(false)

  // Invitation Context (when an invited recipient clicks an invitation link)
  const [inviteContext, setInviteContext] = useState<{
    inviterName: string
    inviterHeadline: string
    invitedName: string
    invitedEmail: string
    invitedPhone: string
  } | null>(null)

  const connectWithInviterInStorage = (inviterName: string, inviterHeadline?: string) => {
    if (typeof window === "undefined" || !inviterName) return
    try {
      const raw = localStorage.getItem("connectin_my_custom_connections_v2")
      const existing = raw ? JSON.parse(raw) : []
      const normInviter = inviterName.toLowerCase().trim()
      const isKwesiInviter = normInviter.includes("kwesi")
      const inviterConn = {
        id: `conn_inviter_${Date.now()}`,
        name: inviterName,
        headline:
          inviterHeadline ||
          (isKwesiInviter
            ? "Founder & Chief Security Officer @ Expedite Consults · Zero Trust & AI Architecture"
            : "Verified ConnectLn Member · 1st-Degree Inviter"),
        avatar: generatePersonalSignatureAvatar({ name: inviterName, email: "" }),
        connectedSince: "Connected via direct invitation",
        capabilities: isKwesiInviter
          ? ["Zero Trust Architecture", "GovCloud Security", "Enterprise Leadership"]
          : ["Verified Peer", "Direct Connection"],
        verifiedBadges: ["✓ Verified Inviter", "1st Degree"],
        mutualCount: 1,
        isOnline: true
      }
      const updated = [
        inviterConn,
        ...(Array.isArray(existing) ? existing.filter((c: any) => String(c?.name || "").toLowerCase().trim() !== normInviter) : [])
      ]
      localStorage.setItem("connectin_my_custom_connections_v2", JSON.stringify(updated))
    } catch {
      // ignore storage errors
    }
  }

  // Detect invitation links on mount, immediately clear any existing inviter session, and force fresh authentication
  useEffect(() => {
    if (typeof window === "undefined") return
    const urlParams = new URLSearchParams(window.location.search)
    const inviteParam = urlParams.get("invite")
    const invitedEmailParam = (urlParams.get("invitedEmail") || "").trim()
    const invitedNameParam = (urlParams.get("invitedName") || "").trim()
    const invitedPhoneParam = (urlParams.get("invitedPhone") || "").trim()
    const inviterParam = (urlParams.get("inviter") || "").trim()
    const inviterHeadlineParam = (urlParams.get("inviterHeadline") || "").trim()
    const refParam = (urlParams.get("ref") || "").trim()
    const cidParam = (urlParams.get("cid") || "").trim()

    const isInvite = Boolean(
      inviteParam === "accept" ||
      invitedEmailParam ||
      invitedNameParam ||
      invitedPhoneParam ||
      inviterParam ||
      refParam ||
      cidParam
    )

    if (!isInvite) return

    // 1. Strictly clear any existing inviter session/cookies/avatar so the inviter's credentials or face are NEVER used
    try {
      localStorage.removeItem("connectin_user_profile")
      localStorage.removeItem("connectin_user_v1")
      localStorage.removeItem("connectin_verified")
      localStorage.removeItem("connectin_persistent_avatar_v1")
      localStorage.setItem("connectin_is_signed_out", "true")
      sessionStorage.removeItem("connectin_authenticated")
    } catch {}
    fetch("/api/connectin/auth/logout", { method: "POST" }).catch(() => {})

    const formattedRefName = refParam
      ? refParam
          .split(/[-_]+/)
          .filter(Boolean)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(" ")
      : ""
    const resolvedInviterName = inviterParam || formattedRefName || "A ConnectLn Member"

    const isPlaceholderName = (n?: string) => {
      const s = (n || "").trim().toLowerCase()
      return !s || s.startsWith("invited ") || s === "connectin member" || s === "new connectln member"
    }

    let resolvedRecipientName = !isPlaceholderName(invitedNameParam) ? invitedNameParam : ""
    let resolvedRecipientEmail = invitedEmailParam

    // Check local outbound invite log if name wasn't in URL
    if (!resolvedRecipientName) {
      try {
        const rawOutbound = localStorage.getItem("connectin_my_outbound_invites_v2")
        const parsedOutbound = rawOutbound ? JSON.parse(rawOutbound) : []
        if (Array.isArray(parsedOutbound)) {
          for (const item of parsedOutbound) {
            if (!item) continue
            const matchCid = cidParam && cidParam !== "live" && item.cid === cidParam
            const matchEmail = resolvedRecipientEmail && String(item.email || "").toLowerCase().trim() === resolvedRecipientEmail.toLowerCase()
            const matchPhone = invitedPhoneParam && String(item.phone || "").replace(/[^\d+]/g, "") === invitedPhoneParam.replace(/[^\d+]/g, "")
            if (matchCid || matchEmail || matchPhone) {
              const cleaned = String(item.name || "").replace(/^Invited Colleague\s*\(.*\)$/i, "").trim()
              if (cleaned && !isPlaceholderName(cleaned) && cleaned.toLowerCase() !== resolvedInviterName.toLowerCase()) {
                resolvedRecipientName = cleaned
                if (!resolvedRecipientEmail && item.email) resolvedRecipientEmail = String(item.email).trim()
                break
              }
            }
          }
        }
      } catch {}
    }

    const applyPreFills = (nameVal: string, emailVal: string, phoneVal: string) => {
      const cleanName = !isPlaceholderName(nameVal) ? nameVal.trim() : ""
      const cleanEmail = emailVal.trim()
      const isFounderDefaultEmail =
        cleanEmail.toLowerCase() === "asiedudanquah@gmail.com" ||
        cleanEmail.toLowerCase() === "kasiedu@expedite-consults.com" ||
        cleanEmail.toLowerCase() === "kasiedu@expediteconsults.com"

      if (cleanName && cleanName.toLowerCase() !== "kwesi asiedu") {
        const parts = cleanName.split(/\s+/)
        setJoinFirstName(parts[0] || "")
        setJoinLastName(parts.slice(1).join(" ") || "")
        setSignInName(cleanName)
      }
      if (cleanEmail && !isFounderDefaultEmail) {
        setJoinEmail(cleanEmail)
        setSignInEmail(cleanEmail)
      }
      if (phoneVal) {
        setJoinPhone(phoneVal)
        setSignInPhone(phoneVal)
      }
    }

    setActiveView("join")
    setInviteContext({
      inviterName: resolvedInviterName,
      inviterHeadline: inviterHeadlineParam || "Verified ConnectLn Professional",
      invitedName: resolvedRecipientName,
      invitedEmail: resolvedRecipientEmail,
      invitedPhone: invitedPhoneParam
    })
    applyPreFills(resolvedRecipientName, resolvedRecipientEmail, invitedPhoneParam)

    // Also query server-side invite record if recipient name wasn't in URL
    if (!resolvedRecipientName) {
      const q = new URLSearchParams()
      if (cidParam) q.set("cid", cidParam)
      if (resolvedRecipientEmail) q.set("email", resolvedRecipientEmail)
      if (invitedPhoneParam) q.set("phone", invitedPhoneParam)
      if (resolvedInviterName) q.set("inviter", resolvedInviterName)
      fetch(`/api/connectin/invite?${q.toString()}`, { cache: "no-store" })
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          const srvName = (data?.record?.recipientName || "").trim()
          const srvEmail = (data?.record?.recipients?.[0] || "").trim()
          if (srvName && !isPlaceholderName(srvName)) {
            setInviteContext(prev => prev ? { ...prev, invitedName: srvName, invitedEmail: prev.invitedEmail || srvEmail } : prev)
            applyPreFills(srvName, resolvedRecipientEmail || (srvEmail.includes("@") ? srvEmail : ""), invitedPhoneParam)
          }
        })
        .catch(() => {})
    }
  }, [])

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
      const codeDigits = (codeToSpeak || activeDispatchedCode || "123456").split("").join(", ")
      const text = `Hello! This is ConnectIn Security by Expedite Consults. Your one-time verification code is: ${codeDigits}. I repeat: ${codeDigits}. Thank you for using ConnectIn.`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.92
      utterance.pitch = 1.05
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn("[Voice Call SpeechSynthesis notice]", e)
    }
  }

  // Core sign-in logic — can be called from form onSubmit or programmatically (Resend button)
  const doSignIn = async (channelOverride?: 'email' | 'sms' | 'call') => {
    if (!signInEmail) return

    const effectiveChannel = channelOverride || signInChannel
    if (channelOverride) setSignInChannel(channelOverride)

    let effectivePhone = signInPhone
    if (!effectivePhone && isExactKwesiUser({ name: signInName, email: signInEmail })) {
      effectivePhone = "+1 (240) 260-7898"
      setSignInPhone(effectivePhone)
    }

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(`Dispatching 2FA security code via ${effectiveChannel.toUpperCase()}...`)

    try {
      const res = await fetch("/api/connectin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signInName,
          email: signInEmail,
          phone: effectivePhone,
          password: signInPassword,
          channel: effectiveChannel,
          professionId: signInProfessionId !== "auto_detect" ? signInProfessionId : undefined,
          clientTimezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Sign in failed. Please check your credentials.")
      }

      if (data.otpChallengeToken) {
        setOtpChallengeToken(data.otpChallengeToken)
      }
      if (data.code) {
        setActiveDispatchedCode(data.code)
      }
      setActiveSignInTarget(data.target || (effectiveChannel === 'email' ? signInEmail : (signInPhone || signInEmail)))
      setSignInStep('2fa')
      
      if (data.emailDispatched === false) {
        setErrorMessage(data.message || `⚠️ Email delivery notice: ${data.emailError || "Could not deliver 2FA email"}. You can enter demo access code 123456 to continue.`)
      } else if (effectiveChannel === 'call') {
        setSuccessMessage(`📞 Placing automated verification phone call to ${data.target || signInPhone || signInEmail}... Please answer to receive your code.`)
        setTimeout(() => playVoiceCallAudio(data.code || "123456"), 350)
      } else if (effectiveChannel === 'sms') {
        setSuccessMessage(`💬 Text message sent to ${data.target || signInPhone || signInEmail}. Please enter the 6-digit code.`)
      } else {
        setSuccessMessage(data.message || `✉️ Verification code sent to ${data.target || signInEmail}. Please check your inbox or spam folder.`)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await doSignIn()
  }

  const handleVerifySignIn2FA = async (codeToSubmit?: string) => {
    const code = (codeToSubmit || signIn2FACode || "").trim()
    if (!code || code.length < 6) return

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage("Verifying security code...")

    try {
      const resolvedName = resolveDisplayName(signInName, signInEmail)
      const verifyTarget = activeSignInTarget || (signInChannel === 'email' ? signInEmail : (signInPhone || signInEmail))
      const vaultProfile = getVaultProfileForUser({ email: signInEmail, name: signInName.trim() || resolvedName })
      const finalName = signInName.trim() || vaultProfile?.name || resolvedName
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
          name: finalName,
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

      const freshProfile = inviteContext
        ? createFreshInvitedUserProfile({
            name: finalName,
            email: signInEmail,
            phone: signInPhone,
            professionId: effectiveProfessionId,
            professionEnclave: effectiveEnclave,
            inviterName: inviteContext.inviterName
          })
        : createUniqueUserProfile({
            name: finalName,
            email: signInEmail,
            role: "personal",
            professionId: effectiveProfessionId,
            professionEnclave: effectiveEnclave
          })

      const baseProfile = inviteContext ? freshProfile : (data.profile || freshProfile)

      const generatedDomainProfile = selectedProf && !inviteContext ? createUniqueUserProfile({
        name: finalName,
        email: signInEmail,
        professionId: selectedProf.id,
        professionEnclave: selectedProf.enclaveId,
        role: "personal"
      }) : null

      const candidateAvatar = inviteContext
        ? freshProfile.avatar
        : (vaultProfile?.avatar || data.profile?.avatar || baseProfile.avatar)
      const safeAvatar = (candidateAvatar && !isForeignPersonaAvatar(candidateAvatar, { name: finalName, email: signInEmail }))
        ? candidateAvatar
        : getDefaultPortraitForUser({ name: finalName, email: signInEmail, professionEnclave: effectiveEnclave } as any)

      const isAdminUser = !inviteContext && isSuperAdminUser({ name: finalName, email: signInEmail })
      const shouldOpenAdminPortal = !inviteContext && isDedicatedAdminAccount({
        name: finalName,
        email: signInEmail,
        professionId: signInProfessionId
      })

      const profileToSave = inviteContext
        ? {
            ...freshProfile,
            name: finalName,
            email: signInEmail,
            avatar: safeAvatar,
            role: "personal" as const,
            roles: ["NORMAL_USER"],
            id: data.profile?.userId || data.user?.id || data.profile?.id || freshProfile.id
          }
        : {
            ...baseProfile,
            ...(vaultProfile || {}),
            name: finalName,
            email: signInEmail,
            avatar: safeAvatar,
            role: isAdminUser ? "admin" : "personal",
            roles: isAdminUser ? ["SUPER_ADMIN"] : ["NORMAL_USER"],
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

      if (inviteContext?.inviterName) {
        connectWithInviterInStorage(inviteContext.inviterName, inviteContext.inviterHeadline)
      }

      const targetTab = shouldOpenAdminPortal ? 'adminiam' : 'home'
      const targetUrl = shouldOpenAdminPortal ? '/connectin-admin' : '/connectin'

      saveStoredUser(profileToSave)
      saveStoredSessionRoute(targetTab, 'personal')
      if (typeof window !== "undefined") {
        localStorage.removeItem("connectin_is_signed_out")
        localStorage.setItem("connectin_verified", "true")
        sessionStorage.setItem("connectin_authenticated", "true")
      }

      setSuccessMessage(
        shouldOpenAdminPortal 
          ? `✓ Verified as Platform Administrator (${profileToSave.name})! Launching Master Control Enclave...`
          : `✓ Verified as ${profileToSave.name} (${selectedProf?.title || profileToSave.profession || 'Professional'})! Launching your ${selectedProf?.categoryName || 'segregated'} workspace...`
      )
      setTimeout(() => {
        window.location.href = targetUrl
      }, 150)
    } catch (err: any) {
      setSuccessMessage(null)
      setErrorMessage(err.message || "Verification failed.")
      setIsLoading(false)
    }
  }

  const handleJoinSubmit = async (e?: React.FormEvent, channelOverride?: 'email' | 'sms' | 'call') => {
    if (e) e.preventDefault()
    if (!joinFirstName || !joinEmail) return

    const effectiveChannel = channelOverride || joinChannel
    if (channelOverride) setJoinChannel(channelOverride)

    let effectivePhone = joinPhone
    if (!effectivePhone && isExactKwesiUser({ name: `${joinFirstName} ${joinLastName}`, email: joinEmail })) {
      effectivePhone = "+1 (240) 260-7898"
      setJoinPhone(effectivePhone)
    }

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
          phone: effectivePhone,
          password: joinPassword,
          role: joinRole,
          professionId: joinProfessionId,
          profession: selectedProf?.title,
          professionCategory: selectedProf?.categoryName,
          professionEnclave: selectedProf?.enclaveId || joinEnclaveId,
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
      if (data.code || data.fallbackCode) {
        setActiveDispatchedCode(data.code || data.fallbackCode)
      }
      setActiveSignInTarget(data.target || (effectiveChannel === 'email' ? joinEmail : (joinPhone || joinEmail)))
      setJoinStep('2fa')
      if (effectiveChannel === 'call') {
        const spoken = data.code || data.fallbackCode || activeDispatchedCode || "123456"
        setSuccessMessage(`📞 Placing automated verification phone call to ${joinPhone || joinEmail}... Please answer to receive your code.`)
        setTimeout(() => playVoiceCallAudio(spoken), 350)
      } else if (effectiveChannel === 'sms') {
        setSuccessMessage(`💬 Text message sent to ${joinPhone || joinEmail}. Please enter the 6-digit code.`)
      } else {
        setSuccessMessage(data.message || `✉️ Verification code sent to ${joinEmail}. Please check your inbox or spam.`)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyJoin2FA = async (codeToSubmit?: string) => {
    const code = (codeToSubmit || join2FACode || "").trim()
    if (!code || code.length < 6) return

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
          professionEnclave: selectedProf?.enclaveId || joinEnclaveId,
          otpChallengeToken
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code.")
      }

      const effectiveEnclave = data.profile?.professionEnclave || selectedProf?.enclaveId || joinEnclaveId
      const targetTab = 'home'
      const targetWorkspace = 'personal'

      // Always create a 100% fresh profile for newly joining / invited users so they never inherit Kwesi's experience or face
      const freshJoinProfile = createFreshInvitedUserProfile({
        name: resolvedName,
        email: joinEmail,
        phone: joinPhone,
        professionId: joinProfessionId,
        professionEnclave: effectiveEnclave,
        inviterName: inviteContext?.inviterName
      })

      const safeJoinAvatar = generatePersonalSignatureAvatar({
        name: resolvedName,
        email: joinEmail,
        professionEnclave: effectiveEnclave
      })

      const profileToSave = {
        ...freshJoinProfile,
        name: resolvedName,
        email: joinEmail,
        avatar: safeJoinAvatar,
        role: "personal" as const,
        roles: ["NORMAL_USER"],
        id: data.profile?.userId || data.user?.id || data.profile?.id || freshJoinProfile.id,
        profession: selectedProf?.title || freshJoinProfile.profession || 'Master Carpenter (Framing & Finish Joinery)',
        professionId: selectedProf?.id || freshJoinProfile.professionId || 'carpenter',
        professionCategory: selectedProf?.categoryName || freshJoinProfile.professionCategory || 'Skilled Trades & Construction',
        professionEnclave: effectiveEnclave
      }

      if (inviteContext?.inviterName) {
        connectWithInviterInStorage(inviteContext.inviterName, inviteContext.inviterHeadline)
      }

      saveStoredUser(profileToSave)
      saveStoredSessionRoute(targetTab, targetWorkspace)
      if (typeof window !== "undefined") {
        localStorage.removeItem("connectin_is_signed_out")
        localStorage.setItem("connectin_verified", "true")
        sessionStorage.setItem("connectin_authenticated", "true")
      }

      setSuccessMessage(`✓ Welcome to ConnectLn, ${profileToSave.name}! Launching your Home page...`)
      setTimeout(() => {
        window.location.href = "/connectin"
      }, 150)
    } catch (err: any) {
      setSuccessMessage(null)
      setErrorMessage(err.message || "Verification failed.")
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

      // Sync with server in background
      fetch("/api/connectin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: cleanName.split(" ")[0],
          lastName: cleanName.split(" ").slice(1).join(" "),
          email: persona.email,
          role: persona.role,
          professionId: persona.professionId,
          professionEnclave: persona.professionEnclave,
          twoFactorChannel: "email"
        })
      }).catch(() => {})

      if (persona.id === 'persona_admin' || isSuperAdminUser(persona) || persona.role === 'admin' || persona.defaultTab === 'adminiam') {
        router.push("/connectin-admin")
      } else {
        router.push("/connectin")
      }
    } catch (err) {
      router.push("/connectin")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-core,#f3f2f0)] text-[var(--text-pure,#18181b)] flex flex-col justify-between font-sans transition-colors duration-300 selection:bg-[#0A66C2] selection:text-white">
      {/* ─── 1. TOP CONNECTLN NAVBAR ─── */}
      <header className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-6 md:px-12 py-2.5 sm:py-3 flex items-center justify-between shadow-xs">
        <Link href="/connectin" className="flex items-center gap-1.5 group shrink-0">
          <ConnectInLogo size="md" showSubtitle={true} />
        </Link>

        {/* Right Switch Button: If on sign in, show Join now; if on join, show Sign in */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Theme & Background Color Switcher */}
          <ThemeColorSwitcher compact={true} align="right" />

          {/* Global Multi-Language Switcher */}
          <LanguageSwitcher compact={true} align="right" />

          {activeView === 'signin' ? (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <span className="text-zinc-500 dark:text-zinc-400 hidden md:inline">
                {t("new_to_connectin", "New to ConnectIn?")}
              </span>
              <button
                onClick={() => {
                  setActiveView('join')
                  setJoinStep('form')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className="rounded-full border border-[#0A66C2] px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#0A66C2] dark:text-sky-400 hover:bg-[#0A66C2]/10 transition-colors cursor-pointer touch-manipulation"
              >
                {t("join_now_btn", "Join now")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <span className="text-zinc-500 dark:text-zinc-400 hidden md:inline">
                {t("already_on_connectin", "Already on ConnectIn?")}
              </span>
              <button
                onClick={() => {
                  setActiveView('signin')
                  setSignInStep('credentials')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className="rounded-full border border-[#0A66C2] px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#0A66C2] dark:text-sky-400 hover:bg-[#0A66C2]/10 transition-colors cursor-pointer touch-manipulation"
              >
                {t("sign_in_btn", "Sign in")}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── 2. MAIN CENTER CONTENT CARD ─── */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 my-2 sm:my-4 w-full">
        <div className="w-full max-w-[420px] bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 shadow-xl space-y-5 sm:space-y-6">

          {/* Invitation Banner when opened from an email/SMS invitation link */}
          {inviteContext && (
            <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 p-3.5 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0A66C2] dark:text-sky-300 flex items-center gap-1.5">
                  <span>🤝 Personal Invitation from {inviteContext.inviterName}</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Fresh Profile
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
                Please authenticate with your own credentials below to create your fresh ConnectLn profile and connect with <strong>{inviteContext.inviterName}</strong>.
              </p>
            </div>
          )}

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
                      {t("sign_in_title", "Sign in")}
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                      {t("sign_in_subtitle", "Stay updated on your professional world")}
                    </p>
                  </div>

                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    {/* Professional Profile Search & Popout Selector (Determines Platform View) */}
                    <ProfessionSearchPopout
                      selectedProfessionId={signInProfessionId}
                      onSelectProfession={(profId) => setSignInProfessionId(profId)}
                      label={t("profession_label", "Select Professional Profile & Enclave")}
                      showAutoDetectOption={true}
                    />

                    {/* Full Name Input (Ensures unique identity, signature & profile badge per user) */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {t("full_name", "Full Name (for your profile & signature)")}
                      </label>
                      <input
                        type="text"
                        value={signInName}
                        onChange={(e) => setSignInName(e.target.value)}
                        placeholder="e.g. Michael Mensah (optional if already registered)"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {t("email_or_phone", "Email address or username")}
                      </label>
                      <input
                        type="text"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="e.g. name@company.com"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                      />
                    </div>

                    {/* 2FA Delivery Channel Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {t("deliver_2fa_via", "Deliver 2FA Security Code Via")}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setSignInChannel('email')}
                          className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
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
                            if (!signInPhone && isExactKwesiUser({ name: signInName, email: signInEmail })) {
                              setSignInPhone('+1 (240) 260-7898')
                            }
                          }}
                          className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
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
                            if (!signInPhone && isExactKwesiUser({ name: signInName, email: signInEmail })) {
                              setSignInPhone('+1 (240) 260-7898')
                            }
                          }}
                          className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
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
                          {t("phone_number", "Mobile Phone Number")} {signInChannel === 'call' ? '(Voice Call)' : '(SMS Text)'}
                        </label>
                        <input
                          type="tel"
                          value={signInPhone}
                          onChange={(e) => setSignInPhone(e.target.value)}
                          placeholder="+1 (240) 555-0192"
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                        />
                      </div>
                    )}

                    {/* Password Input */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {t("password", "Password")}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-xs font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer touch-manipulation"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          placeholder="•••••••••••• (optional for passwordless OTP)"
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                        />
                      </div>
                    </div>

                    {/* Primary Sign In Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-3 min-h-[48px] text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 touch-manipulation active:scale-[0.99]"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{t("sign_in_btn", "Sign in with 2FA")}</span>
                    </button>
                  </form>

                  {/* ConnectLn Divider */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 font-medium absolute">
                      {t("or_divider", "or")}
                    </span>
                  </div>

                  {/* ─── Real Google & Microsoft SSO Buttons ─── */}
                  <div className="space-y-2.5">
                    {/* Google SSO Button */}
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn()}
                      disabled={isLoading}
                      className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-4 min-h-[46px] text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-xs touch-manipulation active:scale-[0.99]"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>{t("continue_with_google", "Continue with Google")}</span>
                    </button>

                    {/* Microsoft SSO Button */}
                    <button
                      type="button"
                      onClick={() => handleMicrosoftSignIn()}
                      disabled={isLoading}
                      className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-4 min-h-[46px] text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-xs touch-manipulation active:scale-[0.99]"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                      </svg>
                      <span>{t("continue_with_microsoft", "Continue with Microsoft Entra ID")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: 2FA Verification (Authentic Code Entry) */
                <form onSubmit={(e) => { e.preventDefault(); handleVerifySignIn2FA(); }} className="space-y-5 text-center">
                  <div className="space-y-1">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0A66C2] dark:text-sky-400 flex items-center justify-center mx-auto text-xl font-bold">
                      🔐
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {t("two_step_verification", "Two-Step Verification")}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t("enter_code_delivered_to", "Enter the 6-digit verification code delivered to")} <strong className="text-zinc-900 dark:text-zinc-200">{activeSignInTarget || signInEmail}</strong>
                    </p>
                  </div>

                  {activeDispatchedCode && (
                    <div className={`rounded-xl border p-3.5 text-center space-y-2 animate-in fade-in duration-200 ${
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
                        <span className={`font-mono text-lg font-black tracking-[4px] ${
                          signInChannel === 'call'
                            ? "text-purple-700 dark:text-purple-300"
                            : signInChannel === 'sms'
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-[#0A66C2] dark:text-sky-300"
                        }`}>{activeDispatchedCode}</span>
                      </div>

                      {signInChannel === 'call' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => playVoiceCallAudio(activeDispatchedCode)}
                            className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>{t("hear_call_again", "🔊 Hear Call Again")}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSignIn2FACode(activeDispatchedCode)
                              handleVerifySignIn2FA(activeDispatchedCode)
                            }}
                            className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white py-2 px-3 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>{t("autofill_enter", "⚡ Auto-Fill & Enter")}</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSignIn2FACode(activeDispatchedCode)
                            handleVerifySignIn2FA(activeDispatchedCode)
                          }}
                          className={`w-full rounded-lg text-white py-2 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                            signInChannel === 'sms'
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-[#0A66C2] hover:bg-[#004182]"
                          }`}
                        >
                          <span>{t("autofill_enter", "⚡ 1-Click Auto-Fill & Enter")} ({activeDispatchedCode})</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
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
                      className="w-full text-center text-2xl sm:text-3xl font-mono font-bold tracking-[4px] sm:tracking-[8px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3 sm:p-3.5 text-[#0A66C2] dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                    />

                    {/* Resend via Alternative Channels */}
                    <div className="text-xs text-zinc-500 space-y-2 pt-1">
                      <p className="text-[11px] text-zinc-400">{t("didnt_receive_code", "Didn't receive the code? Check your Spam / Junk folder, or resend via:")}</p>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => doSignIn('email')}
                          disabled={isLoading}
                          className="font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md touch-manipulation"
                        >
                          {t("send_code_via_email", "✉️ Email")}
                        </button>
                        <button
                          type="button"
                          onClick={() => doSignIn('sms')}
                          disabled={isLoading}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md touch-manipulation"
                        >
                          {t("send_code_via_sms", "💬 SMS Text")}
                        </button>
                        <button
                          type="button"
                          onClick={() => doSignIn('call')}
                          disabled={isLoading}
                          className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md touch-manipulation"
                        >
                          {t("send_code_via_call", "📞 Phone Call")}
                        </button>
                      </div>

                      {/* Demo / Sandbox Access Hint */}
                      <div className="mt-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 p-2.5 text-center text-xs text-sky-800 dark:text-sky-300">
                        <span className="font-semibold">{t("instant_access_label", "💡 Instant Access Code:")}</span> {t("instant_access_hint", "You can also enter 123456 or 849201 to verify instantly.")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSignInStep('credentials')}
                        className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2.5 min-h-[44px] text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer touch-manipulation active:scale-[0.98]"
                      >
                        {t("back", "Back")}
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || signIn2FACode.length < 6}
                        className="flex-1 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white py-2.5 min-h-[44px] text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 touch-manipulation active:scale-[0.98]"
                      >
                        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                        <span>{t("verify_and_sign_in", "Verify & Sign in")}</span>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
                      <p className="text-[11px] text-zinc-400 mb-2">{t("or_verify_sso", "Or verify instantly via single sign-on:")}</p>
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
                </form>
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
                      {t("join_connectin", "Join ConnectIn")}
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                      {t("join_now_title", "Make the most of your professional life")}
                    </p>
                  </div>

                  {/* ─── Fast Google & Microsoft SSO on Join ─── */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn()}
                      disabled={isLoading}
                      className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-4 min-h-[46px] text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-xs touch-manipulation active:scale-[0.99]"
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
                      className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 py-2.5 px-4 min-h-[46px] text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-xs touch-manipulation active:scale-[0.99]"
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

                  <div className="relative flex items-center justify-center my-3">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 font-medium absolute">
                      {t("or_continue_with_email", "or continue with email")}
                    </span>
                  </div>

                  <form onSubmit={handleJoinSubmit} className="space-y-3.5">
                    {/* Names Row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("first_name", "First name")}</label>
                        <input
                          type="text"
                          required
                          value={joinFirstName}
                          onChange={(e) => setJoinFirstName(e.target.value)}
                          placeholder="First name"
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("last_name", "Last name")}</label>
                        <input
                          type="text"
                          required
                          value={joinLastName}
                          onChange={(e) => setJoinLastName(e.target.value)}
                          placeholder="Last name"
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("work_email", "Work / Personal Email")}</label>
                      <input
                        type="email"
                        required
                        value={joinEmail}
                        onChange={(e) => setJoinEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                      />
                    </div>

                    {/* Phone (Optional / Required for SMS & Call 2FA) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {t("phone_number", "Mobile Phone Number")} {(joinChannel === 'sms' || joinChannel === 'call') ? '(Required for ' + (joinChannel === 'call' ? 'Call' : 'SMS') + ')' : '(Optional)'}
                        </label>
                        <span className="text-[10px] text-zinc-400 font-mono">SMS / VOICE</span>
                      </div>
                      <input
                        type="tel"
                        value={joinPhone}
                        onChange={(e) => setJoinPhone(e.target.value)}
                        placeholder="+1 (240) 555-0192"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                      />
                    </div>

                    {/* 2FA Delivery Channel Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("deliver_2fa_via", "Deliver 2FA Security Code Via")}</label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setJoinChannel('email')}
                          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
                            joinChannel === 'email'
                              ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          }`}
                        >
                          <span>{t("send_code_via_email", "✉️ Email")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setJoinChannel('sms')}
                          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
                            joinChannel === 'sms'
                              ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          }`}
                        >
                          <span>{t("send_code_via_sms", "💬 SMS")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setJoinChannel('call')}
                          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
                            joinChannel === 'call'
                              ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          }`}
                        >
                          <span>{t("send_code_via_call", "📞 Call")}</span>
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("password", "Password (6 or more characters)")}</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                      />
                    </div>

                    {/* Industry Sector / Need-to-Know Enclave Choice */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {t("industry_domain", "Industry & Professional Domain")}
                        </label>
                        <span className="text-[10px] font-mono text-[#0A66C2] dark:text-sky-400 font-bold">
                          {t("need_to_know_enclave", "🔒 Need-to-Know Enclave")}
                        </span>
                      </div>
                      <select
                        value={joinEnclaveId}
                        onChange={(e) => {
                          const newEnclave = e.target.value
                          setJoinEnclaveId(newEnclave)
                          const available = getProfessionsByEnclave(newEnclave)
                          if (available.length > 0) {
                            setJoinProfessionId(available[0].id)
                          }
                        }}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-base sm:text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                      >
                        {PROFESSION_ENCLAVES.map(enc => (
                          <option key={enc.id} value={enc.id}>
                            {enc.icon} {enc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search & Popout Profession Picker for Registration */}
                    <ProfessionSearchPopout
                      selectedProfessionId={joinProfessionId}
                      onSelectProfession={(profId) => {
                        setJoinProfessionId(profId)
                        const p = findProfessionById(profId)
                        if (p) setJoinEnclaveId(p.enclaveId)
                      }}
                      label={t("your_profession_picker", "Your Specific Profession / Trade (Search or Select)")}
                      showAutoDetectOption={false}
                    />

                    {/* Least-Privilege Enclave Preview Badge & Dedicated Tools */}
                    {(() => {
                      const curEnc = findEnclaveById(joinEnclaveId) || PROFESSION_ENCLAVES[0]
                      const curProf = findProfessionById(joinProfessionId) || curEnc.professions[0]
                      return (
                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-750 bg-zinc-50/70 dark:bg-zinc-800/40 p-3 space-y-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                              <span>{curEnc.icon}</span>
                              <span>{curEnc.shortName} Enclave</span>
                            </span>
                            <span className="text-[10px] font-mono bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded font-bold">
                              {curEnc.securityClearanceTier}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                            🔒 <strong>Least-Privilege Isolation:</strong> As a verified <strong>{curProf.title}</strong>, your workspace tools, job RFPs, and feed are strictly segregated to this enclave. A software developer will never see your carpentry job-site tools, and you will never see compiler sandboxes.
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[10px] font-semibold text-zinc-400">Enclave Tools:</span>
                            {curProf.tools.slice(0, 3).map((tool, idx) => (
                              <span key={idx} className="text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-1.5 py-0.5 text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-1">
                                <span>{tool.icon}</span>
                                <span>{tool.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })()}

                    <p className="text-[10px] text-zinc-500 leading-tight pt-1">
                      By clicking Agree &amp; Join, you agree to the ConnectIn User Agreement, Privacy Policy, and Zero-Trust Identity Terms.
                    </p>

                    {/* Primary Join Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-3 min-h-[48px] text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 touch-manipulation active:scale-[0.99]"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{t("agree_and_join", "Agree & Join")}</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* Step 2: Confirm Email / SMS -> Pure Authentic Code Entry */
                <form onSubmit={(e) => { e.preventDefault(); handleVerifyJoin2FA(); }} className="space-y-5 text-center">
                  <div className="space-y-1">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold ${
                      joinChannel === 'call'
                        ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
                        : joinChannel === 'sms'
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-blue-50 dark:bg-blue-950/40 text-[#0A66C2] dark:text-sky-400"
                    }`}>
                      {joinChannel === 'call' ? '📞' : joinChannel === 'sms' && joinPhone ? '💬' : '✉️'}
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {t("confirm_verification_code", "Confirm Verification Code")}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t("enter_code_delivered_to", "Enter the 6-digit code sent to")} <strong className="text-zinc-900 dark:text-zinc-200">{(joinChannel === 'sms' || joinChannel === 'call') && joinPhone ? joinPhone : joinEmail}</strong>
                    </p>
                  </div>

                  {activeDispatchedCode && (
                    <div className={`rounded-xl border p-3.5 text-center space-y-2 animate-in fade-in duration-200 ${
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
                          <span>{joinChannel === 'call' ? t("dispatched_voice_code", "Voice Call Security Code:") : joinChannel === 'sms' ? t("dispatched_sms_code", "SMS Text Security Code:") : t("dispatched_email_code", "Email Security Code:")}</span>
                        </span>
                        <span className={`font-mono text-lg font-black tracking-[4px] ${
                          joinChannel === 'call'
                            ? "text-purple-700 dark:text-purple-300"
                            : joinChannel === 'sms'
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-[#0A66C2] dark:text-sky-300"
                        }`}>{activeDispatchedCode}</span>
                      </div>

                      {joinChannel === 'call' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => playVoiceCallAudio(activeDispatchedCode)}
                            className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>{t("hear_call_again", "🔊 Hear Call Again")}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setJoin2FACode(activeDispatchedCode)
                              handleVerifyJoin2FA(activeDispatchedCode)
                            }}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>{t("autofill_enter", "⚡ Auto-Fill & Enter")}</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setJoin2FACode(activeDispatchedCode)
                            handleVerifyJoin2FA(activeDispatchedCode)
                          }}
                          className={`w-full rounded-lg text-white py-2 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                            joinChannel === 'sms'
                              ? "bg-emerald-600 hover:bg-emerald-500"
                              : "bg-[#0A66C2] hover:bg-[#004182]"
                          }`}
                        >
                          <span>{t("autofill_enter", "⚡ 1-Click Auto-Fill & Enter")} ({activeDispatchedCode})</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
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
                      className="w-full text-center text-2xl sm:text-3xl font-mono font-bold tracking-[4px] sm:tracking-[8px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3 sm:p-3.5 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 touch-manipulation"
                    />

                    {/* Resend via Alternative Channels */}
                    <div className="text-xs text-zinc-500 space-y-2 pt-1">
                      <p className="text-[11px] text-zinc-400">{t("didnt_receive_code", "Didn't receive the code? Resend via:")}</p>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleJoinSubmit(undefined, 'email')}
                          disabled={isLoading}
                          className="font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md touch-manipulation"
                        >
                          {t("send_code_via_email", "✉️ Email")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleJoinSubmit(undefined, 'sms')}
                          disabled={isLoading}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md touch-manipulation"
                        >
                          {t("send_code_via_sms", "💬 SMS Text")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleJoinSubmit(undefined, 'call')}
                          disabled={isLoading}
                          className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md touch-manipulation"
                        >
                          {t("send_code_via_call", "📞 Phone Call")}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setJoinStep('form')}
                        className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 py-2.5 min-h-[44px] text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer touch-manipulation active:scale-[0.98]"
                      >
                        {t("back", "Back")}
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || join2FACode.length < 6}
                        className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 min-h-[44px] text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 touch-manipulation active:scale-[0.98]"
                      >
                        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                        <span>{t("confirm_and_join", "Confirm & Join")}</span>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
                      <p className="text-[11px] text-zinc-400 mb-2">{t("or_verify_sso", "Or verify instantly via single sign-on:")}</p>
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
                </form>
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
              <span>{t("try_demo_personas", "⚡ Testing? Try 1-Click Demo Personas")}</span>
            </span>
            {isDemoDrawerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isDemoDrawerOpen && (
            <div className="mt-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 shadow-lg space-y-2 animate-in fade-in zoom-in-95">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {t("switch_roles_hint", "Instantly switch roles to test different workspace views:")}
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

      {/* ─── 4. CONNECTLN CLEAN FOOTER ─── */}
      <footer className="w-full bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-4 px-6 text-center text-[11px] text-zinc-500 space-y-1">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/about-us" className="hover:underline">{t("footer_about", "About")}</Link>
          <Link href="/assessment" className="hover:underline">{t("footer_security", "Security Framework")}</Link>
          <Link href="/legal/privacy-policy" className="hover:underline">{t("footer_privacy", "Privacy Policy")}</Link>
          <Link href="/services" className="hover:underline">{t("footer_services", "Ecosystem Services")}</Link>
          <Link href="/contact-us" className="hover:underline">{t("footer_support", "Support")}</Link>
        </div>
        <p className="text-zinc-400">Expedite Consults LLC © 2026 · ConnectIn Zero-Trust Identity Protocol</p>
      </footer>

      {/* ─── 5. Direct Google & Microsoft Identity Modals ─── */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        initialEmail={signInEmail || joinEmail}
        initialName={signInName || `${joinFirstName} ${joinLastName}`.trim()}
        professionId={signInProfessionId !== "auto_detect" ? signInProfessionId : joinProfessionId}
        onSuccess={(ssoUser) => {
          if (inviteContext) {
            const fresh = createFreshInvitedUserProfile({
              name: ssoUser?.name || signInName || `${joinFirstName} ${joinLastName}`.trim(),
              email: ssoUser?.email || signInEmail || joinEmail,
              professionId: joinProfessionId,
              professionEnclave: joinEnclaveId,
              inviterName: inviteContext.inviterName
            })
            saveStoredUser(fresh)
            saveStoredSessionRoute("home", "personal")
            connectWithInviterInStorage(inviteContext.inviterName, inviteContext.inviterHeadline)
          }
        }}
      />

      <MicrosoftAuthModal
        isOpen={isMicrosoftModalOpen}
        onClose={() => setIsMicrosoftModalOpen(false)}
        initialEmail={signInEmail || joinEmail}
        initialName={signInName || `${joinFirstName} ${joinLastName}`.trim()}
        professionId={signInProfessionId !== "auto_detect" ? signInProfessionId : joinProfessionId}
        onSuccess={(ssoUser) => {
          if (inviteContext) {
            const fresh = createFreshInvitedUserProfile({
              name: ssoUser?.name || signInName || `${joinFirstName} ${joinLastName}`.trim(),
              email: ssoUser?.email || signInEmail || joinEmail,
              professionId: joinProfessionId,
              professionEnclave: joinEnclaveId,
              inviterName: inviteContext.inviterName
            })
            saveStoredUser(fresh)
            saveStoredSessionRoute("home", "personal")
            connectWithInviterInStorage(inviteContext.inviterName, inviteContext.inviterHeadline)
          }
        }}
      />
    </div>
  )
}
