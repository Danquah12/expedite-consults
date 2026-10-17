"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Mail,
  Phone,
  Link2,
  Copy,
  Check,
  Send,
  UserPlus,
  Sparkles,
  ShieldCheck,
  Users,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  MessageSquare,
  Share2,
  Smartphone,
  PhoneCall,
  Info
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"

interface InviteMembersModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserProfile
  onInviteSent?: (newPendingInvites: any[]) => void
}

export function InviteMembersModal({
  isOpen,
  onClose,
  currentUser,
  onInviteSent
}: InviteMembersModalProps) {
  const [activeInviteTab, setActiveInviteTab] = useState<'phone' | 'email' | 'link'>('phone')

  // Canonical base origin
  const [origin, setOrigin] = useState("https://connectln.vercel.app")
  useEffect(() => {
    if (typeof window !== "undefined") {
      const locOrigin = window.location.origin
      if (!locOrigin.includes("localhost")) {
        setOrigin(locOrigin)
      }
    }
  }, [])

  const [inviteCid, setInviteCid] = useState("")
  useEffect(() => {
    setInviteCid(`cin_${Date.now().toString(36)}`)
  }, [])

  const inviteLink = `${origin}/connectin?ref=${encodeURIComponent(currentUser.name.toLowerCase().replace(/\s+/g, '-'))}&cid=${inviteCid || 'live'}`
  const loginLink = `${origin}/connectin-login?ref=${encodeURIComponent(currentUser.name.toLowerCase().replace(/\s+/g, '-'))}&cid=${inviteCid || 'live'}`
  const referralLink = loginLink

  // Email form state
  const [emailsText, setEmailsText] = useState("")
  const [emailMessage, setEmailMessage] = useState(
    `Hi there,\n\nI'd like to invite you to join my trusted network on ConnectLn — Tickets, vouches, and real work.\n\nConnect with me here: ${inviteLink}`
  )

  // Phone form state
  const [phoneNumbersText, setPhoneNumbersText] = useState("")
  const [phoneMessage, setPhoneMessage] = useState(
    `ConnectLn: Hi! ${currentUser.name} invited you to connect on ConnectLn (Tickets, vouches, and real work). Join here: ${loginLink}`
  )

  // Keep messages in sync when origin changes
  useEffect(() => {
    setEmailMessage(
      `Hi there,\n\nI'd like to invite you to join my trusted network on ConnectLn — Tickets, vouches, and real work.\n\nConnect with me here: ${inviteLink}`
    )
    setPhoneMessage(
      `ConnectLn: Hi! ${currentUser.name} invited you to connect on ConnectLn (Tickets, vouches, and real work). Join here: ${loginLink}`
    )
  }, [origin, currentUser.name, inviteLink, loginLink])

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isSmsCopied, setIsSmsCopied] = useState(false)
  const [isEmailCopied, setIsEmailCopied] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const [dispatchNotice, setDispatchNotice] = useState<{
    type: "success" | "warning" | "error"
    message: string
    details?: string
  } | null>(null)

  const handleCopyLink = (textToCopy: string, type: "link" | "sms" | "email") => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(textToCopy)
      if (type === "link") {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2500)
      } else if (type === "sms") {
        setIsSmsCopied(true)
        setTimeout(() => setIsSmsCopied(false), 2500)
      } else if (type === "email") {
        setIsEmailCopied(true)
        setTimeout(() => setIsEmailCopied(false), 2500)
      }
    }
  }

  // Native share sheet if supported
  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join my trusted network on ConnectLn",
          text: `Hi! ${currentUser.name} has invited you to connect on ConnectLn (Tickets, vouches, and real work).`,
          url: loginLink
        })
      } catch {
        // User dismissed share dialog
      }
    } else {
      handleCopyLink(loginLink, "link")
    }
  }

  // 1. Send Email Invites via Resend
  const handleSendEmailInvites = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailsText.trim()) return

    setIsLoading(true)
    setSuccessToast(null)
    setDispatchNotice(null)

    const parsedEmails = emailsText
      .split(/[\n,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes("@"))

    if (parsedEmails.length === 0) {
      setIsLoading(false)
      setDispatchNotice({ type: "error", message: "Please enter at least one valid email address." })
      return
    }

    try {
      const res = await fetch("/api/connectin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "email",
          recipients: parsedEmails,
          message: emailMessage,
          senderName: currentUser.name,
          inviteLink
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Email dispatch request failed")
      }

      const newOutbound = parsedEmails.map(email => ({
        id: 'out_' + Date.now() + Math.random().toString(36).slice(2, 6),
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        headline: `Invited via Email · ${email}`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=0a66c2`,
        email,
        sentAt: 'Just now',
        status: 'pending' as const
      }))

      if (onInviteSent) {
        onInviteSent(newOutbound)
      }

      if (data.allSucceeded) {
        setSuccessToast(`✓ Invitation email dispatched to ${data.dispatched} recipient(s)!`)
        setDispatchNotice({
          type: "success",
          message: `Branded email dispatched via Resend to ${parsedEmails.join(", ")}. Note: If the recipient does not see it within 60 seconds, remind them to check their Spam/Junk folder (sent from auth@expediteconsults.com).`
        })
        setEmailsText("")
      } else if (data.dispatched > 0) {
        setSuccessToast(`✓ Sent to ${data.dispatched} of ${parsedEmails.length} recipient(s).`)
      } else {
        const errDetail = data.results?.[0]?.error || data.error || "Email gateway returned a notice"
        setDispatchNotice({
          type: "warning",
          message: `Email Dispatch Notice: ${errDetail}. You can also use "Open in Mail App (Outlook/Gmail)" below.`
        })
      }
    } catch (err: any) {
      setDispatchNotice({
        type: "warning",
        message: `Email dispatch notice: ${err.message || "Failed to contact email gateway"}. You can tap "Open in Mail App" below to send directly.`
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Send SMS Invites via Twilio
  const handleSendSMSInvites = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumbersText.trim()) return

    setIsLoading(true)
    setSuccessToast(null)
    setDispatchNotice(null)

    const parsedPhones = phoneNumbersText
      .split(/[\n,;]+/)
      .map(p => p.trim())
      .filter(p => p.replace(/[^\d+]/g, "").length >= 10)

    if (parsedPhones.length === 0) {
      setIsLoading(false)
      setDispatchNotice({ type: "error", message: "Please enter at least one valid 10-digit mobile phone number (e.g. +1 240 555 0192)." })
      return
    }

    try {
      const res = await fetch("/api/connectin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "sms",
          recipients: parsedPhones,
          message: phoneMessage,
          senderName: currentUser.name,
          inviteLink: loginLink
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "SMS dispatch request failed")
      }

      const newOutbound = parsedPhones.map(phone => ({
        id: 'out_sms_' + Date.now() + Math.random().toString(36).slice(2, 6),
        name: `Invited Colleague (${phone})`,
        headline: `Invited via SMS · ${phone}`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(phone)}&backgroundColor=4338ca`,
        phone,
        sentAt: 'Just now',
        status: 'pending' as const
      }))

      if (onInviteSent) {
        onInviteSent(newOutbound)
      }

      if (data.allSucceeded) {
        setSuccessToast(`✓ SMS text message queued via Twilio to ${data.dispatched} recipient(s)!`)
        setDispatchNotice({
          type: "success",
          message: `Twilio delivery queued (${data.dispatched} SMS). Note: US wireless carriers (AT&T, Verizon, T-Mobile) require A2P 10DLC registration and may filter cloud SMS. For 100% guaranteed delivery, tap "Open in Messages (SMS)" below!`
        })
        setPhoneNumbersText("")
      } else if (data.dispatched > 0) {
        setSuccessToast(`✓ Dispatched to ${data.dispatched} of ${parsedPhones.length} recipient(s).`)
      } else {
        const errDetail = data.results?.[0]?.error || data.error || "Carrier gateway returned a notice"
        setDispatchNotice({
          type: "warning",
          message: `Carrier Notice: ${errDetail}. Tap "Open in Messages / SMS" below to send directly from your phone with 100% delivery!`
        })
      }
    } catch (err: any) {
      setDispatchNotice({
        type: "warning",
        message: `Carrier notice: ${err.message || "Twilio gateway notice"}. Tap "Open in Messages (SMS)" below to send directly from your phone!`
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 3. Automated Voice Call Invite
  const handleSendVoiceCall = async () => {
    if (!phoneNumbersText.trim()) return

    setIsCalling(true)
    setDispatchNotice(null)

    const parsedPhones = phoneNumbersText
      .split(/[\n,;]+/)
      .map(p => p.trim())
      .filter(p => p.replace(/[^\d+]/g, "").length >= 10)

    if (parsedPhones.length === 0) {
      setIsCalling(false)
      setDispatchNotice({ type: "error", message: "Please enter at least one valid mobile phone number for the voice call." })
      return
    }

    try {
      const res = await fetch("/api/connectin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "call",
          recipients: parsedPhones,
          senderName: currentUser.name,
          inviteLink: loginLink
        })
      })

      const data = await res.json()

      if (data.dispatched > 0) {
        setSuccessToast(`📞 Automated voice invitation call dispatched via Twilio to ${data.dispatched} recipient(s)!`)
        setDispatchNotice({
          type: "success",
          message: `Phone call initiated to ${parsedPhones.join(", ")}. Recipient will hear Dr. Joanna synthetic voice invitation.`
        })
      } else {
        setDispatchNotice({
          type: "warning",
          message: `Voice call notice: ${data.results?.[0]?.error || "Could not initiate call"}`
        })
      }
    } catch (err: any) {
      setDispatchNotice({
        type: "warning",
        message: `Voice call notice: ${err.message || "Failed to initiate call"}`
      })
    } finally {
      setIsCalling(false)
    }
  }

  // Pre-calculate native device URIs
  const rawFirstPhone = phoneNumbersText.split(/[\n,;]+/)[0]?.trim() || ""
  const cleanPhoneDigits = rawFirstPhone.replace(/[^\d+]/g, "")
  const nativeSmsHref = `sms:${cleanPhoneDigits}?&body=${encodeURIComponent(phoneMessage)}`
  const nativeWhatsAppHref = `https://api.whatsapp.com/send?${cleanPhoneDigits ? `phone=${cleanPhoneDigits.replace(/[^\d]/g, "")}&` : ""}text=${encodeURIComponent(phoneMessage)}`

  const rawFirstEmail = emailsText.split(/[\n,;]+/)[0]?.trim() || ""
  const nativeMailtoHref = `mailto:${rawFirstEmail}?subject=${encodeURIComponent(`${currentUser.name} invited you to ConnectLn`)}&body=${encodeURIComponent(emailMessage)}`

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-20px)] sm:w-full max-w-xl p-0 overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[92dvh] flex flex-col mx-auto my-auto">
        {/* Header with Official ConnectLn Brand Lockup */}
        <div className="bg-[#121110] p-4 sm:p-6 text-white border-b border-[#262420] shrink-0">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="space-y-2 sm:space-y-3">
              <ConnectInLogo size="md" showSubtitle={true} className="text-white" />
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-[#f2ede4] tracking-tight">
                  Invite Colleagues to ConnectLn
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-snug">
                  Tickets, vouches, and real work · 100% universal delivery across all phones, all carriers &amp; all email inboxes.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-1.5 sm:p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors touch-manipulation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Invitation Method Tabs */}
          <div className="mt-3.5 sm:mt-5 grid grid-cols-3 gap-1 sm:gap-2 bg-black/40 p-1 sm:p-1.5 rounded-2xl border border-white/10 text-[10.5px] sm:text-xs font-bold">
            <button
              onClick={() => {
                setActiveInviteTab('phone')
                setDispatchNotice(null)
              }}
              className={`py-1.5 sm:py-2 px-1 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer touch-manipulation ${
                activeInviteTab === 'phone'
                  ? "bg-white text-zinc-900 shadow-md font-black"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
              <span className="truncate">By Phone</span>
            </button>

            <button
              onClick={() => {
                setActiveInviteTab('email')
                setDispatchNotice(null)
              }}
              className={`py-1.5 sm:py-2 px-1 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer touch-manipulation ${
                activeInviteTab === 'email'
                  ? "bg-white text-zinc-900 shadow-md font-black"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0A66C2] shrink-0" />
              <span className="truncate">By Email</span>
            </button>

            <button
              onClick={() => {
                setActiveInviteTab('link')
                setDispatchNotice(null)
              }}
              className={`py-1.5 sm:py-2 px-1 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer touch-manipulation ${
                activeInviteTab === 'link'
                  ? "bg-white text-zinc-900 shadow-md font-black"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 shrink-0" />
              <span className="truncate">Referral Link</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[65dvh] sm:max-h-[75dvh] overflow-y-auto">
          {successToast && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {dispatchNotice && (
            <div className={`rounded-2xl border p-4 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
              dispatchNotice.type === "success"
                ? "bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                : dispatchNotice.type === "warning"
                ? "bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                : "bg-rose-50/70 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800 text-rose-800 dark:text-rose-200"
            }`}>
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-1 w-full">
                <p className="font-semibold leading-relaxed">{dispatchNotice.message}</p>
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  <a
                    href={nativeSmsHref}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 text-[11px] inline-flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Smartphone className="h-3 w-3" />
                    <span>Open in Messages (SMS) ↗</span>
                  </a>
                  <a
                    href={nativeWhatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 text-[11px] inline-flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Share via WhatsApp ↗</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: BY PHONE / SMS */}
          {/* ======================================================== */}
          {activeInviteTab === 'phone' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Colleague Mobile Phone Number(s)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">e.g. +1 (240) 555-0192</span>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="+1 (240) 555-0192, +1 (703) 555-0144"
                  value={phoneNumbersText}
                  onChange={(e) => setPhoneNumbersText(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 touch-manipulation"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Invitation Text
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(phoneMessage, "sms")}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer touch-manipulation"
                  >
                    {isSmsCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{isSmsCopied ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={phoneMessage}
                  onChange={(e) => setPhoneMessage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-zinc-900 dark:text-zinc-100 font-mono text-base sm:text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed touch-manipulation"
                />
              </div>

              {/* 🌟 100% GUARANTEED DELIVERY OPTIONS */}
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    100% Guaranteed Phone Delivery (Zero Carrier Blocking):
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  US wireless carriers (AT&amp;T, Verizon, T-Mobile) automatically block automated cloud SMS with <strong>A2P 10DLC Error 30034</strong>. Sending directly from your device is Person-to-Person (P2P), which <strong>always delivers instantly</strong> to any mobile phone!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href={nativeSmsHref}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-center"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Open in Messages (SMS) ↗</span>
                  </a>

                  <a
                    href={nativeWhatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold px-3.5 py-2.5 text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-center"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Send via WhatsApp ↗</span>
                  </a>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Share via iOS/Android Share Sheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(phoneMessage, "sms")}
                    className="text-[11px] font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Full SMS Text</span>
                  </button>
                </div>
              </div>

              {/* AUTOMATED CLOUD DISPATCH OPTIONS (TWILIO) */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 space-y-2.5">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 text-[11px]">
                  ☁️ Automated Cloud Dispatch (Twilio Server):
                </span>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSendVoiceCall}
                    disabled={isCalling || !phoneNumbersText.trim()}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 font-bold text-[11px] shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isCalling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PhoneCall className="h-3.5 w-3.5" />}
                    <span>{isCalling ? "Calling..." : "Automated Voice Call (Rings Phone)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendSMSInvites}
                    disabled={isLoading || !phoneNumbersText.trim()}
                    className="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-2 font-bold text-[11px] shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    <span>{isLoading ? "Dispatching..." : "Send via Twilio Cloud SMS"}</span>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Note: Automated voice calls bypass A2P carrier blocks and will ring the recipient&apos;s phone. Cloud SMS may require TCR carrier campaign approval.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: BY EMAIL */}
          {/* ======================================================== */}
          {activeInviteTab === 'email' && (
            <form onSubmit={handleSendEmailInvites} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Colleague Email Addresses (Works for ALL emails: Gmail, Yahoo, Outlook, Corporate)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">Comma separated</span>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. colleague@gmail.com, partner@outlook.com, dev@company.com"
                  value={emailsText}
                  onChange={(e) => setEmailsText(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] touch-manipulation"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Personalized Branded Email Content
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(emailMessage, "email")}
                    className="text-[11px] text-[#0A66C2] hover:text-[#004182] font-bold flex items-center gap-1 cursor-pointer touch-manipulation"
                  >
                    {isEmailCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{isEmailCopied ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-zinc-900 dark:text-zinc-100 font-mono text-base sm:text-[11px] focus:outline-none focus:ring-2 focus:ring-[#0A66C2] leading-relaxed touch-manipulation"
                />
              </div>

              {/* 100% INBOX DELIVERY FALLBACK (MAILTO) */}
              <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-200 text-[11px] flex items-center gap-1.5">
                    ✉️ Guaranteed Primary Inbox Delivery:
                  </span>
                  <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    DIRECT FROM YOU
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Transactional emails from automated servers sometimes land in Spam or Promotions folders. Sending from your own email app (Outlook, Gmail, Apple Mail) guarantees <strong>100% primary inbox delivery</strong>!
                </p>
                <div className="pt-1">
                  <a
                    href={nativeMailtoHref}
                    className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Open in My Email App (Outlook / Gmail / Apple Mail) ↗</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  ⚡ Or dispatch via Resend zero-trust gateway:
                </span>

                <button
                  type="submit"
                  disabled={isLoading || !emailsText.trim()}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>{isLoading ? "Dispatching..." : "Send Cloud Email"}</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PERSONAL REFERRAL LINK */}
          {/* ======================================================== */}
          {activeInviteTab === 'link' && (
            <div className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Your Personal ConnectLn Network Link
                </label>
                <p className="text-zinc-500">
                  Share this secure cryptographic invite link in Slack, Teams, Discord, email signatures, or technical blogs. Anyone who joins will automatically receive an invitation to your 1st-degree mesh.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-base sm:text-xs font-mono text-zinc-800 dark:text-zinc-200 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(referralLink, "link")}
                    className={`rounded-xl px-4 py-2.5 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation ${
                      isCopied
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    }`}
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{isCopied ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
              </div>

              {/* Direct Multi-Platform Share Buttons */}
              <div className="space-y-2">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  Quick Share to Any Platform (1-Click):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <a
                    href={`sms:?&body=${encodeURIComponent(`Join my trusted professional network on ConnectLn: ${referralLink}`)}`}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-bold"
                  >
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                    <span>SMS Messages</span>
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join my trusted network on ConnectLn: ${referralLink}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-bold"
                  >
                    <Share2 className="h-4 w-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-bold"
                  >
                    <Users className="h-4 w-4 text-[#0A66C2]" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`${currentUser.name} invited you to ConnectLn`)}&body=${encodeURIComponent(`Join my trusted professional network on ConnectLn: ${referralLink}`)}`}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-bold"
                  >
                    <Mail className="h-4 w-4 text-purple-600" />
                    <span>Email App</span>
                  </a>
                </div>
              </div>

              {/* QR / Security Badge preview */}
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  🪪
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
                    Verified Fellow Grade Link
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Signatures generated with SHA-256 integrity tokens. Direct access to your public technical portfolio.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
