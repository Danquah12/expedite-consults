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
  Smartphone
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"

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
  const [activeInviteTab, setActiveInviteTab] = useState<'email' | 'phone' | 'link'>('phone')

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

  const inviteLink = `${origin}/connectin?ref=${encodeURIComponent(currentUser.name.toLowerCase().replace(/\s+/g, '-'))}&cid=cin_${Date.now().toString(36)}`
  const loginLink = `${origin}/connectin-login?ref=${encodeURIComponent(currentUser.name.toLowerCase().replace(/\s+/g, '-'))}`

  // Email form state
  const [emailsText, setEmailsText] = useState("")
  const [emailMessage, setEmailMessage] = useState(
    `Hi there,\n\nI'd like to invite you to join my trusted network on ConnectIn — the zero-trust professional network for cloud, cybersecurity, trades & enterprise specialists.\n\nConnect with me here: ${inviteLink}`
  )

  // Phone form state
  const [phoneNumbersText, setPhoneNumbersText] = useState("")
  const [phoneMessage, setPhoneMessage] = useState(
    `ConnectIn: Hi! ${currentUser.name} has invited you to connect on ConnectIn Zero-Trust Network. Join here: ${loginLink}`
  )

  // Keep messages in sync when origin changes
  useEffect(() => {
    setEmailMessage(
      `Hi there,\n\nI'd like to invite you to join my trusted network on ConnectIn — the zero-trust professional network for cloud, cybersecurity, trades & enterprise specialists.\n\nConnect with me here: ${inviteLink}`
    )
    setPhoneMessage(
      `ConnectIn: Hi! ${currentUser.name} has invited you to connect on ConnectIn Zero-Trust Network. Join here: ${loginLink}`
    )
  }, [origin, currentUser.name])

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
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

  // 1. Send Email Invites
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
          message: `Branded email dispatched via Resend to ${parsedEmails.join(", ")}. Recipient will receive it in their inbox shortly.`
        })
        setEmailsText("")
      } else if (data.dispatched > 0) {
        setSuccessToast(`✓ Sent to ${data.dispatched} of ${parsedEmails.length} recipient(s).`)
      } else {
        const errDetail = data.results?.[0]?.error || data.error || "Email gateway returned a notice"
        setDispatchNotice({
          type: "warning",
          message: `Email Dispatch Notice: ${errDetail}. You can also use "Open in Mail App" or copy the message below.`
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

  // 2. Send SMS Invites
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
        setSuccessToast(`✓ Real SMS text message dispatched via Twilio to ${data.dispatched} recipient(s)!`)
        setDispatchNotice({
          type: "success",
          message: `Twilio delivery confirmed (${data.dispatched} SMS). Recipient cellular device will receive the invitation text shortly.`
        })
        setPhoneNumbersText("")
      } else if (data.dispatched > 0) {
        setSuccessToast(`✓ Dispatched to ${data.dispatched} of ${parsedPhones.length} recipient(s).`)
        const failed = data.results?.filter((r: any) => !r.success) || []
        setDispatchNotice({
          type: "warning",
          message: `Delivered to ${data.dispatched} recipient(s). Carrier notice on remaining: ${failed[0]?.error || "Carrier filter active"}. You can also use "Open in Messages (SMS)" below.`
        })
      } else {
        const errDetail = data.results?.[0]?.error || data.error || "Carrier gateway returned a notice"
        setDispatchNotice({
          type: "warning",
          message: `Carrier Notice: ${errDetail}. Tap "Open in Messages / SMS" or "Share on WhatsApp" below to send directly from your phone!`
        })
      }
    } catch (err: any) {
      setDispatchNotice({
        type: "warning",
        message: `Carrier API notice: ${err.message || "Failed to reach Twilio gateway"}. You can tap "Open in Messages (SMS)" below to send directly from your device!`
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Pre-calculate native device URIs
  const rawFirstPhone = phoneNumbersText.split(/[\n,;]+/)[0]?.trim() || ""
  const cleanPhoneDigits = rawFirstPhone.replace(/[^\d+]/g, "")
  const nativeSmsHref = `sms:${cleanPhoneDigits}?&body=${encodeURIComponent(phoneMessage)}`
  const nativeWhatsAppHref = `https://api.whatsapp.com/send?${cleanPhoneDigits ? `phone=${cleanPhoneDigits.replace(/[^\d]/g, "")}&` : ""}text=${encodeURIComponent(phoneMessage)}`

  const rawFirstEmail = emailsText.split(/[\n,;]+/)[0]?.trim() || ""
  const nativeMailtoHref = `mailto:${rawFirstEmail}?subject=${encodeURIComponent(`${currentUser.name} invited you to ConnectIn`)}&body=${encodeURIComponent(emailMessage)}`

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-bold text-sky-300 border border-sky-400/30 flex items-center gap-1.5 w-fit">
                <UserPlus className="h-3.5 w-3.5" />
                Grow Your Professional Mesh
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Invite Colleagues to ConnectIn
              </h2>
              <p className="text-xs text-zinc-300">
                Expand your 1st-degree cryptographic network across enterprise teams, alumni, and defense specialists.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Invitation Method Tabs */}
          <div className="mt-5 grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => {
                setActiveInviteTab('phone')
                setDispatchNotice(null)
              }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeInviteTab === 'phone'
                  ? "bg-white text-zinc-900 shadow-md font-black"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Phone className="h-4 w-4 text-emerald-600" />
              <span>By Phone / SMS</span>
            </button>

            <button
              onClick={() => {
                setActiveInviteTab('email')
                setDispatchNotice(null)
              }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeInviteTab === 'email'
                  ? "bg-white text-zinc-900 shadow-md font-black"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Mail className="h-4 w-4 text-[#0A66C2]" />
              <span>By Email</span>
            </button>

            <button
              onClick={() => {
                setActiveInviteTab('link')
                setDispatchNotice(null)
              }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeInviteTab === 'link'
                  ? "bg-white text-zinc-900 shadow-md font-black"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Link2 className="h-4 w-4 text-purple-600" />
              <span>Referral Link</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
              <div className="space-y-1">
                <p className="font-semibold leading-relaxed">{dispatchNotice.message}</p>
                {dispatchNotice.type === "warning" && (
                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                    <a
                      href={nativeSmsHref}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 text-[11px] inline-flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Smartphone className="h-3 w-3" />
                      <span>Open in Device Messages (SMS) ↗</span>
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
                )}
              </div>
            </div>
          )}

          {/* TAB 1: BY PHONE / SMS */}
          {activeInviteTab === 'phone' && (
            <form onSubmit={handleSendSMSInvites} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Mobile Phone Numbers (E.164 format e.g. +1 240 555 0192)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">Multiple numbers allowed</span>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="+1 (240) 555-0192, +1 (703) 555-0144"
                  value={phoneNumbersText}
                  onChange={(e) => setPhoneNumbersText(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    SMS Text Content (Ready for Cellular Delivery)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(phoneMessage, "sms")}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isSmsCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{isSmsCopied ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={phoneMessage}
                  onChange={(e) => setPhoneMessage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-zinc-900 dark:text-zinc-100 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
                />
              </div>

              {/* 1-Click Native Phone & WhatsApp Action Bar */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  📱 Or send directly from your device:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={nativeSmsHref}
                    className="rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Open in Messages (SMS)</span>
                  </a>
                  <a
                    href={nativeWhatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 text-[11px] font-bold border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  💬 Dispatches real SMS via Twilio cellular carrier API
                </span>

                <button
                  type="submit"
                  disabled={isLoading || !phoneNumbersText.trim()}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>{isLoading ? "Dispatching SMS..." : "Send SMS Invites"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: BY EMAIL */}
          {activeInviteTab === 'email' && (
            <form onSubmit={handleSendEmailInvites} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Colleague Email Addresses (separated by commas or new lines)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">Multiple emails allowed</span>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. sarah.jenkins@defense.gov, alex.novak@raytheon.com, col.vance@darpa.mil"
                  value={emailsText}
                  onChange={(e) => setEmailsText(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
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
                    className="text-[11px] text-[#0A66C2] hover:text-[#004182] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isEmailCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{isEmailCopied ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-zinc-900 dark:text-zinc-100 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-[#0A66C2] leading-relaxed"
                />
              </div>

              {/* 1-Click Native Mail Client Action Bar */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  ✉️ Or send directly from your personal mail client:
                </span>
                <a
                  href={nativeMailtoHref}
                  className="rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
                >
                  <Mail className="h-3.5 w-3.5 text-[#0A66C2]" />
                  <span>Open in Mail App (Outlook / Gmail)</span>
                </a>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-400">
                  ⚡ Out-of-band email dispatch via Resend zero-trust gateway
                </span>

                <button
                  type="submit"
                  disabled={isLoading || !emailsText.trim()}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2.5 font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>{isLoading ? "Dispatching Email..." : "Send Invitations"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PERSONAL REFERRAL LINK */}
          {activeInviteTab === 'link' && (
            <div className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Your Personal ConnectIn Network Link
                </label>
                <p className="text-zinc-500">
                  Share this secure cryptographic invite link in Slack, Teams, Discord, email signatures, or technical blogs. Anyone who joins will automatically receive an invitation to your 1st-degree mesh.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs font-mono text-zinc-800 dark:text-zinc-200 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(referralLink, "link")}
                    className={`rounded-xl px-4 py-2.5 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
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
                  Quick Share to Channels:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <a
                    href={`sms:?&body=${encodeURIComponent(`Join my trusted professional network on ConnectIn: ${referralLink}`)}`}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-bold"
                  >
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                    <span>SMS Messages</span>
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join my trusted network on ConnectIn: ${referralLink}`)}`}
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
                    href={`mailto:?subject=${encodeURIComponent(`${currentUser.name} invited you to ConnectIn`)}&body=${encodeURIComponent(`Join my trusted professional network on ConnectIn: ${referralLink}`)}`}
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
