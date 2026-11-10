"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  ChevronUp,
  ChevronDown,
  X,
  Edit3,
  Search,
  CheckCheck,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Paperclip
} from "lucide-react"
import { UserProfile } from "@/lib/connectln-data"
import { getEnclaveB2BThreads, B2BConversationThread, B2BMessageItem } from "@/lib/b2b-messaging-data"
import { resolveUserProfilePicture } from "@/lib/connectin-storage"
import {
  getLocalBilateralThreadsForViewer,
  mergeBilateralAndServerThreads,
  recordLocalBilateralDirectMessage,
  recordLocalBilateralMessageReaction,
  markLocalBilateralConversationRead,
  doesDmParticipantMatch,
  normalizeDmName,
  formatMessageSentDateTime
} from "@/lib/direct-mailbox-sync"

export interface DirectMessageRecipient {
  id?: string
  name: string
  headline?: string
  avatar?: string
  company?: string
}

interface FloatingMessagingDockProps {
  currentUser: UserProfile
  onOpenFullMessaging?: () => void
  onNavigateJobs?: () => void
  composeRecipient?: DirectMessageRecipient | null
  onCloseComposeRecipient?: () => void
  /** When true (e.g. the full Messaging page is open) incoming messages do not auto-open this popup. */
  suppressAutoOpen?: boolean
}

const MELISSA_TORRES_AVATAR =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80"

export function FloatingMessagingDock({
  currentUser,
  onOpenFullMessaging,
  onNavigateJobs,
  composeRecipient,
  onCloseComposeRecipient,
  suppressAutoOpen = false,
}: FloatingMessagingDockProps) {
  const suppressAutoOpenRef = useRef(suppressAutoOpen)
  suppressAutoOpenRef.current = suppressAutoOpen
  const enclaveId = currentUser?.professionEnclave || "trades_construction"
  const viewerName = currentUser?.name || ""
  const viewerEmail = (currentUser as any)?.email || ""
  const viewerFirstName = (currentUser?.name || "Kwesi").split(" ")[0]

  const [isDockOpen, setIsDockOpen] = useState(false)
  const [isMelissaOfferOpen, setIsMelissaOfferOpen] = useState(true)
  const [isMelissaMinimized, setIsMelissaMinimized] = useState(true)
  const [melissaResponseState, setMelissaResponseState] = useState<'pending' | 'get_started' | 'not_today' | 'not_interested'>('pending')
  const [melissaAlertEnabled, setMelissaAlertEnabled] = useState(true)
  const [melissaTargetRole, setMelissaTargetRole] = useState(
    currentUser?.profession || "AI Automation Consultant & Lead Specialist"
  )
  const [melissaTargetLocation, setMelissaTargetLocation] = useState(
    currentUser?.location || "Laurel, MD & Remote"
  )
  const [melissaAlertFreq, setMelissaAlertFreq] = useState<'Instant' | 'Daily' | 'Weekly'>('Instant')
  const [threads, setThreads] = useState<B2BConversationThread[]>(() =>
    getEnclaveB2BThreads(enclaveId)
  )
  const [activeChatThread, setActiveChatThread] = useState<B2BConversationThread | null>(null)
  const [subjectInput, setSubjectInput] = useState("")
  const [miniMessageInput, setMiniMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isExpandedBox, setIsExpandedBox] = useState(false)
  const [showWhyFreeTooltip, setShowWhyFreeTooltip] = useState(false)
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null)
  const [sentConfirmation, setSentConfirmation] = useState<string | null>(null)
  const [incomingAlertBanner, setIncomingAlertBanner] = useState<string | null>(null)

  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const autoOpenedMsgIdsRef = useRef<Set<string>>(new Set())
  // Always points at the conversation currently open, so background syncs never hijack it
  const activeChatThreadRef = useRef<B2BConversationThread | null>(null)
  activeChatThreadRef.current = activeChatThread

  const syncMailbox = useCallback(async () => {
    const localBilateral = getLocalBilateralThreadsForViewer(viewerName, viewerEmail, enclaveId)
    const encThreads = getEnclaveB2BThreads(enclaveId)
    const initialMerged = mergeBilateralAndServerThreads(localBilateral, encThreads)

    try {
      const res = await fetch(
        `/api/connectin/messages?enclave=${encodeURIComponent(enclaveId)}&viewerName=${encodeURIComponent(viewerName)}&viewerEmail=${encodeURIComponent(viewerEmail)}`,
        { cache: "no-store" }
      )
      if (res.ok) {
        const data = await res.json()
        if (data?.threads && Array.isArray(data.threads) && data.threads.length > 0) {
          const finalMerged = mergeBilateralAndServerThreads(localBilateral, data.threads)
          setThreads(finalMerged)

          // Update activeChatThread if currently open so live incoming messages appear immediately
          setActiveChatThread((prev) => {
            if (!prev) return null
            const updatedMatch = finalMerged.find(
              (t) =>
                t.id === prev.id ||
                normalizeDmName(t.title) === normalizeDmName(prev.title)
            )
            return updatedMatch
              ? {
                  ...updatedMatch,
                  title: prev.title,
                  subtitle: prev.subtitle || updatedMatch.subtitle,
                  avatar: prev.avatar || updatedMatch.avatar,
                }
              : prev
          })

          // If the current user has a new unread direct message (dm_pair__...), pop open the message box automatically!
          const unreadDirectThread = finalMerged.find(
            (t) => t.id.startsWith("dm_pair__") && (t.unreadCount || 0) > 0
          )
          if (unreadDirectThread) {
            const latestMsg = unreadDirectThread.messages[unreadDirectThread.messages.length - 1]
            const triggerKey = `${viewerName}__${unreadDirectThread.id}__${latestMsg?.id || "init"}`
            if (!autoOpenedMsgIdsRef.current.has(triggerKey)) {
              autoOpenedMsgIdsRef.current.add(triggerKey)
              // The full Messaging page already shows this message, so don't open the popup a second time
              if (suppressAutoOpenRef.current) return
              // If the member is already writing in another conversation, don't switch it: just announce the new message
              if (!activeChatThreadRef.current) {
                setActiveChatThread(unreadDirectThread)
              }
              setIncomingAlertBanner(
                `📩 New message received from ${unreadDirectThread.title}`
              )
              setTimeout(() => setIncomingAlertBanner(null), 6000)
            }
          }
          return
        }
      }
    } catch {
      // Fallback to local merged threads
    }

    setThreads(initialMerged)
  }, [enclaveId, viewerName, viewerEmail])

  useEffect(() => {
    syncMailbox()
    const interval = setInterval(syncMailbox, 4000)
    const handleStorageOrCustom = () => {
      syncMailbox()
    }
    window.addEventListener("connectin_dm_updated", handleStorageOrCustom)
    window.addEventListener("storage", handleStorageOrCustom)
    return () => {
      clearInterval(interval)
      window.removeEventListener("connectin_dm_updated", handleStorageOrCustom)
      window.removeEventListener("storage", handleStorageOrCustom)
    }
  }, [syncMailbox])

  // Whenever composeRecipient is triggered from Network, Profile, Feed, or Analytics, open the "New message" user box immediately
  useEffect(() => {
    if (!composeRecipient || !composeRecipient.name) return

    const targetNameNorm = composeRecipient.name.toLowerCase().trim()
    const localBilateral = getLocalBilateralThreadsForViewer(viewerName, viewerEmail, enclaveId)
    const combined = mergeBilateralAndServerThreads(localBilateral, threads)

    const existing = combined.find(
      (t) => t.title.toLowerCase().trim() === targetNameNorm
    )

    if (existing) {
      setActiveChatThread({
        ...existing,
        title: composeRecipient.name,
        subtitle: composeRecipient.headline || existing.subtitle,
        avatar:
          composeRecipient.avatar ||
          existing.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(composeRecipient.name)}&backgroundColor=0a66c2`,
      })
      markLocalBilateralConversationRead(composeRecipient.name, viewerName)
    } else {
      const safeAvatar =
        composeRecipient.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(composeRecipient.name)}&backgroundColor=0a66c2`

      const newThread: B2BConversationThread = {
        id: `dm_${targetNameNorm.replace(/[^a-z0-9]/g, "_")}_${Date.now()}`,
        channelType: "People",
        title: composeRecipient.name,
        subtitle:
          composeRecipient.headline ||
          "Verified Professional · Championing Culture, Compliance & Connection",
        avatar: safeAvatar,
        onlineStatus: "online",
        unreadCount: 0,
        lastMessage: "New conversation",
        lastMessageTime: "Now",
        verifiedBadge: "✓ Free Message",
        messages: [],
      }
      setThreads((prev) => [newThread, ...prev])
      setActiveChatThread(newThread)
    }

    setSubjectInput("")
    setMiniMessageInput("")
    setAttachedFileName(null)
    setShowWhyFreeTooltip(false)
  }, [composeRecipient])

  const totalUnread = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0)

  const handleCloseChatBox = () => {
    if (activeChatThread && viewerName) {
      markLocalBilateralConversationRead(activeChatThread.title, viewerName)
      fetch("/api/connectin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_read",
          enclave: enclaveId,
          threadId: activeChatThread.id,
          viewerName,
        }),
      }).catch(() => {})
    }
    setActiveChatThread(null)
    setShowWhyFreeTooltip(false)
    if (onCloseComposeRecipient) {
      onCloseComposeRecipient()
    }
  }

  const handleSendMiniMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = miniMessageInput.trim()
    if ((!trimmed && !attachedFileName) || !activeChatThread) return

    const currentSubject = subjectInput.trim()
    const currentAttachment = attachedFileName

    const composedBody = [
      currentSubject ? `Subject: ${currentSubject}` : "",
      trimmed,
      currentAttachment ? `📎 Attached: ${currentAttachment}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    const senderDisplayName = currentUser?.name || "You"
    const senderPic = resolveUserProfilePicture(currentUser, currentUser?.avatar)
    const recipientName = activeChatThread.title
    const recipientSubtitle = activeChatThread.subtitle
    const recipientAvatar = activeChatThread.avatar

    // 1. Persist immediately to shared bilateral local mailbox so recipient sees it in 0ms on same browser/tabs
    recordLocalBilateralDirectMessage({
      senderName: senderDisplayName,
      senderEmail: viewerEmail,
      senderAvatar: senderPic,
      senderRole: currentUser?.headline || "Verified ConnectLn Member",
      recipientName,
      recipientAvatar,
      recipientSubtitle,
      subject: currentSubject || undefined,
      text: composedBody,
      attachment: currentAttachment || undefined,
    })

    const nowIso = new Date().toISOString()
    const nowFormatted = formatMessageSentDateTime(nowIso)

    const newMsg: B2BMessageItem = {
      id: "mini_msg_" + Date.now(),
      sender: {
        id: "me",
        name: senderDisplayName,
        avatar: senderPic,
        role: currentUser?.headline || "Verified ConnectLn Member",
      },
      text: composedBody,
      timestamp: nowFormatted,
      createdAtIso: nowIso,
      attachments: currentAttachment
        ? [{ name: currentAttachment, type: "Document" }]
        : undefined,
    }

    const targetId = activeChatThread.id

    setThreads((prev) =>
      prev.map((t) =>
        t.id === targetId || normalizeDmName(t.title) === normalizeDmName(recipientName)
          ? {
              ...t,
              unreadCount: 0,
              lastMessage: trimmed || `Attached ${currentAttachment}`,
              lastMessageTime: nowFormatted,
              messages: [...t.messages, newMsg],
            }
          : t
      )
    )
    setActiveChatThread((prev) =>
      prev
        ? {
            ...prev,
            lastMessage: trimmed || `Attached ${currentAttachment}`,
            lastMessageTime: nowFormatted,
            messages: [...prev.messages, newMsg],
          }
        : null
    )
    setSubjectInput("")
    setMiniMessageInput("")
    setAttachedFileName(null)
    setSentConfirmation(`Delivered to ${recipientName}'s Inbox ✓✓`)
    setTimeout(() => setSentConfirmation(null), 4000)

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)

    // 2. Sync to global cloud backend (/api/connectin/messages -> Twilio Sync Map) so recipient receives it on any device
    try {
      const res = await fetch("/api/connectin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          enclave: enclaveId,
          threadId: targetId,
          text: composedBody,
          subject: currentSubject || undefined,
          attachment: currentAttachment || undefined,
          senderName: senderDisplayName,
          senderEmail: viewerEmail,
          senderAvatar: senderPic,
          senderRole: currentUser?.headline,
          recipientName,
          recipientSubtitle,
          recipientAvatar,
          channelType: "People",
        }),
      })
      const data = await res.json()
      if (data?.ok) {
        if (data.threadId && data.threadId !== targetId) {
          setActiveChatThread((prev) =>
            prev ? { ...prev, id: data.threadId } : null
          )
        }
        if (data.autoReply) {
          setTimeout(() => {
            setThreads((prev) =>
              prev.map((t) =>
                t.id === targetId ||
                t.id === data.threadId ||
                normalizeDmName(t.title) === normalizeDmName(recipientName)
                  ? {
                      ...t,
                      lastMessage: data.autoReply.text,
                      lastMessageTime: "Just now",
                      messages: [...t.messages, data.autoReply],
                    }
                  : t
              )
            )
            setActiveChatThread((prev) =>
              prev &&
              (prev.id === targetId ||
                prev.id === data.threadId ||
                normalizeDmName(prev.title) === normalizeDmName(recipientName))
                ? {
                    ...prev,
                    lastMessage: data.autoReply.text,
                    lastMessageTime: "Just now",
                    messages: [...prev.messages, data.autoReply],
                  }
                : prev
            )
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }, 100)
          }, 800)
        }
      }
    } catch {
      // Local mailbox already saved
    }
  }

  const filteredThreads = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed bottom-0 right-2 sm:right-4 z-[70] flex items-end gap-3 pointer-events-none">
      {/* Hidden File & Image Inputs for the Compose Toolbar */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) setAttachedFileName(file.name)
          e.target.value = ""
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) setAttachedFileName(file.name)
          e.target.value = ""
        }}
      />

      {/* 0. ConnectLn Job Alert Request (Positioned right beside the Messaging box) */}
      {isMelissaOfferOpen && !activeChatThread && (
        isMelissaMinimized ? (
          <button
            type="button"
            onClick={() => setIsMelissaMinimized(false)}
            className="pointer-events-auto flex items-center gap-2.5 rounded-t-xl border border-zinc-300 bg-white px-3.5 py-2.5 shadow-2xl hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <img
              src="/brand/connectln-icon.png"
              alt="ConnectLn"
              className="h-7 w-7 rounded-lg object-contain bg-[#1a1917] shrink-0"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-zinc-900 leading-none">ConnectLn Job Alert Request</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Instant Job &amp; Project Match Radar</p>
            </div>
            <ChevronUp className="h-4 w-4 text-zinc-500 ml-1" />
          </button>
        ) : (
          <div className="pointer-events-auto flex flex-col w-[92vw] sm:w-[390px] max-h-[545px] rounded-t-xl border border-zinc-300 bg-white text-zinc-900 shadow-[0_8px_36px_rgba(0,0,0,0.22)] overflow-hidden animate-in slide-in-from-bottom-4">
            {/* Top Bar: ConnectLn Job Alert Request + ... + Minimize + X */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-3.5 py-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsMelissaMinimized(true)}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                title="Minimize ConnectLn Job Alert Request"
              >
                <img
                  src="/brand/connectln-icon.png"
                  alt="ConnectLn"
                  className="h-8 w-8 rounded-lg object-contain bg-[#1a1917] shrink-0"
                />
                <span className="font-bold text-sm text-zinc-900 truncate">
                  ConnectLn Job Alert Request
                </span>
              </button>
              <div className="flex items-center gap-1 text-zinc-600">
                <button
                  type="button"
                  onClick={() => setIsMelissaMinimized(true)}
                  className="rounded-full p-1.5 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                  title="More options"
                >
                  <span className="text-sm font-bold leading-none px-0.5">•••</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMelissaMinimized(true)}
                  className="rounded-full p-1.5 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMelissaOfferOpen(false)}
                  className="rounded-full p-1.5 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Subheader: ConnectLn Opportunity Radar | Nov 10 */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-4 py-1.5 text-xs text-zinc-500 shrink-0">
              <span>ConnectLn Opportunity Radar</span>
              <span>Nov 10</span>
            </div>

            {/* Content Area — Single Clean View (Zero Repetition) */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {melissaResponseState === 'get_started' ? (
                <div className="rounded-2xl border-2 border-[#0A66C2] bg-blue-50/90 p-3.5 space-y-3 text-xs text-zinc-900 shadow-xs animate-in fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[#0A66C2] uppercase tracking-wider text-[11px]">
                      🔔 Job Search Alert Active
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !melissaAlertEnabled
                        setMelissaAlertEnabled(next)
                        try {
                          localStorage.setItem('connectln_job_search_alert_enabled', String(next))
                          window.dispatchEvent(new Event('connectln-job-alert-updated'))
                        } catch {}
                      }}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-zinc-800">
                        {melissaAlertEnabled ? 'Alert ON' : 'Alert OFF'}
                      </span>
                      <span
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          melissaAlertEnabled ? 'bg-emerald-600' : 'bg-zinc-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            melissaAlertEnabled ? 'translate-x-4.5' : 'translate-x-1'
                          }`}
                        />
                      </span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">
                        Target Role / Trade / Company
                      </label>
                      <input
                        type="text"
                        value={melissaTargetRole}
                        onChange={(e) => setMelissaTargetRole(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">
                          Location
                        </label>
                        <input
                          type="text"
                          value={melissaTargetLocation}
                          onChange={(e) => setMelissaTargetLocation(e.target.value)}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">
                          Frequency
                        </label>
                        <select
                          value={melissaAlertFreq}
                          onChange={(e) => setMelissaAlertFreq(e.target.value as any)}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs font-semibold text-zinc-900"
                        >
                          <option value="Instant">Instant</option>
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.setItem('connectln_job_search_alert_enabled', String(melissaAlertEnabled))
                        localStorage.setItem(
                          'connectln_job_search_alert_config',
                          JSON.stringify({
                            enabled: melissaAlertEnabled,
                            role: melissaTargetRole,
                            location: melissaTargetLocation,
                            frequency: melissaAlertFreq
                          })
                        )
                        window.dispatchEvent(new Event('connectln-job-alert-updated'))
                      } catch {}
                      setIsMelissaMinimized(true)
                      if (onNavigateJobs) {
                        onNavigateJobs()
                      }
                      setTimeout(() => {
                        const el = document.getElementById('connectln-job-search-alert-top-bar')
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }, 200)
                    }}
                    className="w-full rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white py-2 px-3 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    ✓ Save Alert &amp; Open Matching Jobs →
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-[13.5px] text-zinc-800 leading-relaxed">
                  <p className="font-semibold text-zinc-900">Hi {viewerFirstName},</p>

                  <p>
                    Want a heads-up when new roles open? Set up a job alert to get notified as soon as new jobs get posted at companies you like.
                  </p>

                  <p>
                    To create an alert, click <strong>Get started</strong> below or turn the job search alert toggle to &ldquo;on&rdquo; in the <strong>Alerts</strong> tab.
                  </p>

                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMelissaResponseState('get_started')
                        setMelissaAlertEnabled(true)
                        try {
                          localStorage.setItem('connectln_job_search_alert_enabled', 'true')
                          localStorage.setItem(
                            'connectln_job_search_alert_config',
                            JSON.stringify({
                              enabled: true,
                              role: melissaTargetRole,
                              location: melissaTargetLocation,
                              frequency: melissaAlertFreq
                            })
                          )
                          window.dispatchEvent(new Event('connectln-job-alert-updated'))
                        } catch {}
                      }}
                      className="rounded-full border-2 border-[#0A66C2] bg-[#0A66C2] hover:bg-[#004182] px-5 py-1.5 text-sm font-bold text-white transition-colors cursor-pointer"
                    >
                      Get started
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* 1. ConnectLn Style "New message" User Compose Pop-up Box */}
      {activeChatThread && (
        <div
          className={`pointer-events-auto flex flex-col rounded-t-xl border border-zinc-300 bg-white text-zinc-900 shadow-[0_8px_36px_rgba(0,0,0,0.22)] overflow-hidden transition-all duration-200 animate-in slide-in-from-bottom-4 ${
            isExpandedBox
              ? "w-[95vw] sm:w-[500px] h-[590px]"
              : "w-[92vw] sm:w-[410px] h-[535px]"
          }`}
        >
          {/* Top Header Bar: "New message" + Minimize/Expand + Close */}
          <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 shrink-0">
            <span className="font-semibold text-[15px] text-zinc-900 tracking-tight">
              New message
            </span>

            <div className="flex items-center gap-1.5 text-zinc-600">
              <button
                type="button"
                onClick={() => setIsExpandedBox(!isExpandedBox)}
                className="rounded-full p-1.5 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                title={isExpandedBox ? "Restore default size" : "Expand message window"}
              >
                {isExpandedBox ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleCloseChatBox}
                className="rounded-full p-1.5 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                title="Close message window"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {incomingAlertBanner && (
            <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between shrink-0">
              <span>{incomingAlertBanner}</span>
              <button
                type="button"
                onClick={() => setIncomingAlertBanner(null)}
                className="text-white/80 hover:text-white ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Recipient Info Row: Avatar + Bold Name + Multi-line Headline */}
          <div className="flex items-start gap-3 border-b border-zinc-200 bg-white px-4 py-3 shrink-0">
            <div className="relative shrink-0">
              <img
                src={
                  activeChatThread.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeChatThread.title)}&backgroundColor=0a66c2`
                }
                alt={activeChatThread.title}
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeChatThread.title)}&backgroundColor=0a66c2`
                }}
                className="h-12 w-12 rounded-full object-cover border border-zinc-200"
              />
              {activeChatThread.onlineStatus === "online" && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-[15px] text-zinc-900 leading-snug">
                {activeChatThread.title}
              </h4>
              <p className="text-xs text-zinc-700 leading-snug mt-0.5 line-clamp-2">
                {activeChatThread.subtitle}
              </p>
            </div>
          </div>

          {/* Premium | Free message | Why? Strip */}
          <div className="relative flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 shrink-0">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded-[3px] shrink-0 shadow-2xs"
                style={{
                  background: "linear-gradient(135deg, #C37D16 50%, #E7A33E 50%)",
                }}
              />
              <span className="font-bold text-[13px] text-zinc-900">Premium</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <span>Free message</span>
              <span>|</span>
              <button
                type="button"
                onClick={() => setShowWhyFreeTooltip(!showWhyFreeTooltip)}
                className="font-bold text-[#0A66C2] hover:underline cursor-pointer"
              >
                Why?
              </button>
            </div>

            {showWhyFreeTooltip && (
              <div className="absolute right-3 top-9 z-20 w-72 rounded-xl border border-zinc-200 bg-white p-3 text-[11px] text-zinc-700 shadow-xl animate-in fade-in">
                <div className="flex items-start justify-between gap-2">
                  <p className="leading-relaxed">
                    <strong className="text-zinc-900">Free Open Profile Message:</strong>{" "}
                    {activeChatThread.title} has enabled Open Profile messaging on ConnectLn, allowing you to message them directly for free.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowWhyFreeTooltip(false)}
                    className="text-zinc-400 hover:text-zinc-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Subject (optional) Input Row */}
          <div className="border-b border-zinc-200 bg-white px-3.5 py-2.5 shrink-0">
            <input
              type="text"
              placeholder="Subject (optional)"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              className="w-full rounded-[6px] border border-zinc-500 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-[#0A66C2] focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
            />
          </div>

          {/* Message History (if any messages sent or received) + Warm Cream "Write a message..." Textarea */}
          <div className="flex-1 flex flex-col overflow-y-auto px-3.5 py-3 bg-white gap-2.5">
            {activeChatThread.messages.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 border-b border-zinc-100 pb-2 text-xs">
                {activeChatThread.messages.map((msg) => {
                  const isMe =
                    msg.sender.id === "me" ||
                    msg.sender.name === "You" ||
                    doesDmParticipantMatch(msg.sender.name, viewerName)
                  const myPic = resolveUserProfilePicture(currentUser, msg.sender.avatar)
                  const senderPic = isMe
                    ? myPic
                    : msg.sender.avatar ||
                      activeChatThread.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(msg.sender.name)}&backgroundColor=0a66c2`

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed whitespace-pre-line ${
                          isMe
                            ? "bg-[#0A66C2] text-white rounded-br-xs"
                            : "bg-emerald-50 text-zinc-900 border border-emerald-200 rounded-bl-xs shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <img
                            src={senderPic}
                            alt={isMe ? "You" : msg.sender.name}
                            onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(msg.sender.name || "User")}&backgroundColor=0a66c2`
                            }}
                            className="h-4 w-4 rounded-full object-cover"
                          />
                          <span className="font-bold text-[10px] opacity-95">
                            {isMe ? currentUser?.name || "You" : msg.sender.name}
                          </span>
                          {!isMe && (
                            <span className="ml-auto rounded bg-emerald-600 text-white px-1.5 py-0.2 text-[9px] font-bold">
                              Received
                            </span>
                          )}
                        </div>
                        <p className="text-xs">{msg.text}</p>
                        {/* Live Reaction Chips & 1-Tap Reactions in Mini Dock */}
                        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1">
                            {(
                              [
                                { kind: "like" as const, emoji: "❤️", label: "Like" },
                                { kind: "up" as const, emoji: "👍", label: "Thumbs up" },
                                { kind: "down" as const, emoji: "👎", label: "Thumbs down" }
                              ]
                            ).map((r) => {
                              const myKey = normalizeDmName(viewerName)
                              const list = msg.reactions?.[r.kind] || []
                              const mine = Boolean(myKey && list.includes(myKey))
                              return (
                                <button
                                  key={r.kind}
                                  type="button"
                                  title={
                                    list.length > 0
                                      ? `${r.label} (${list.length}): ${list.join(", ")}`
                                      : r.label
                                  }
                                  onClick={() => {
                                    if (!viewerName) return
                                    recordLocalBilateralMessageReaction({
                                      messageId: msg.id,
                                      messageText: msg.text,
                                      actorName: viewerName,
                                      reaction: r.kind,
                                      partnerName: activeChatThread.title
                                    })
                                    fetch("/api/connectin/messages", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        action: "react_message",
                                        enclave: enclaveId,
                                        threadId: activeChatThread.id,
                                        recipientName: activeChatThread.title,
                                        recipientSubtitle: activeChatThread.subtitle,
                                        recipientAvatar: activeChatThread.avatar,
                                        messageId: msg.id,
                                        messageText: msg.text,
                                        messageSenderName: isMe ? viewerName : msg.sender.name,
                                        reaction: r.kind,
                                        viewerName,
                                        senderName: viewerName,
                                        senderEmail: viewerEmail,
                                        senderAvatar: currentUser?.avatar || ""
                                      })
                                    }).catch(() => {})
                                    syncMailbox()
                                  }}
                                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                                    mine
                                      ? "bg-amber-300 text-zinc-900 ring-1 ring-amber-500"
                                      : list.length > 0
                                      ? "bg-white text-zinc-900 shadow-2xs border border-zinc-200"
                                      : isMe
                                      ? "bg-white/15 text-white hover:bg-white/25"
                                      : "bg-white/80 text-zinc-700 hover:bg-white border border-zinc-200/70"
                                  }`}
                                >
                                  <span>{r.emoji}</span>
                                  {list.length > 0 && <span>{list.length}</span>}
                                </button>
                              )
                            })}
                          </div>
                          <div className="text-[9px] text-right flex items-center justify-end gap-1 opacity-75">
                            <span>{formatMessageSentDateTime(msg, msg.timestamp)}</span>
                            {isMe && <CheckCheck className="h-2.5 w-2.5" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Warm Cream/Beige Rounded Textarea Box matching screenshot */}
            <div className="flex-1 flex flex-col rounded-xl bg-[#F4F2EE] p-3.5 focus-within:ring-1 focus-within:ring-[#0A66C2]/50">
              <textarea
                placeholder="Write a message..."
                value={miniMessageInput}
                onChange={(e) => setMiniMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    handleSendMiniMessage()
                  }
                }}
                autoFocus
                className="w-full flex-1 resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none leading-relaxed"
              />

              {attachedFileName && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-xs border border-zinc-200 shadow-2xs">
                  <span className="truncate font-medium text-zinc-700">
                    📎 {attachedFileName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachedFileName(null)}
                    className="ml-2 text-zinc-400 hover:text-red-500 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {sentConfirmation && (
                <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  ✓ {sentConfirmation}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Bar: Image Icon + Paperclip Icon + Send Button */}
          <form
            onSubmit={handleSendMiniMessage}
            className="flex items-center justify-between border-t border-zinc-200 bg-white px-4 py-2.5 shrink-0"
          >
            <div className="flex items-center gap-1 text-zinc-600">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="rounded-full p-2 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                title="Attach an image"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full p-2 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                title="Attach a file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {onOpenFullMessaging && (
                <button
                  type="button"
                  onClick={() => {
                    handleCloseChatBox()
                    onOpenFullMessaging()
                  }}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-[#0A66C2] px-2 py-1 cursor-pointer"
                >
                  Full Inbox
                </button>
              )}
              <button
                type="submit"
                disabled={!miniMessageInput.trim() && !attachedFileName}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182] disabled:bg-zinc-200 disabled:text-zinc-400 px-5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer shadow-2xs"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Collapsible Messaging Dock Drawer (Desktop Right Corner) */}
      <div className="hidden sm:block pointer-events-auto w-72 rounded-t-xl border border-zinc-300 bg-white shadow-2xl overflow-hidden">
        {/* Dock Header Bar */}
        <div
          onClick={() => setIsDockOpen(!isDockOpen)}
          className="flex items-center justify-between px-3.5 py-2.5 bg-white cursor-pointer border-b border-zinc-200 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt="Me"
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
            <span className="font-bold text-xs text-zinc-900">Messaging</span>
            {totalUnread > 0 && (
              <span
                className="rounded-full bg-[#0A66C2] px-1.5 py-0.2 text-[10px] font-bold"
                style={{ color: "#FFFFFF" }}
              >
                {totalUnread}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-zinc-500">
            {onOpenFullMessaging && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenFullMessaging()
                }}
                className="p-1 hover:text-[#0A66C2]"
                title="Open Full Messaging Tab"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setActiveChatThread(threads[0] || null)
              }}
              className="p-1 hover:text-[#0A66C2]"
              title="New message"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            {isDockOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Expanded Drawer Body */}
        {isDockOpen && (
          <div className="h-80 flex flex-col bg-white animate-in fade-in">
            {/* Search Input */}
            <div className="p-2 border-b border-zinc-100">
              <div className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
              {/* Pinned ConnectLn Offer Row */}
              <div
                onClick={() => {
                  setActiveChatThread(null)
                  setIsMelissaOfferOpen(true)
                  setIsMelissaMinimized(false)
                }}
                className="flex items-start gap-2.5 p-2.5 bg-blue-50/40 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="relative shrink-0">
                  <img
                    src="/brand/connectln-icon.png"
                    alt="ConnectLn"
                    className="h-8 w-8 rounded-lg object-contain bg-[#1a1917]"
                  />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-xs text-zinc-900 truncate">
                      ConnectLn Job Alerts
                    </p>
                    <span className="text-[10px] font-semibold text-[#0A66C2]">
                      Nov 10
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-zinc-800 truncate mt-0.5">
                    Want a heads-up when new roles open? Set up a job alert...
                  </p>
                </div>
              </div>
              {filteredThreads.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveChatThread({ ...t, unreadCount: 0 })
                    markLocalBilateralConversationRead(t.title, viewerName)
                    setThreads((prev) =>
                      prev.map((th) =>
                        th.id === t.id ? { ...th, unreadCount: 0 } : th
                      )
                    )
                    fetch("/api/connectin/messages", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "mark_read",
                        enclave: enclaveId,
                        threadId: t.id,
                        viewerName,
                      }),
                    }).catch(() => {})
                  }}
                  className={`flex items-start gap-2.5 p-2.5 hover:bg-zinc-50 cursor-pointer transition-colors ${
                    (t.unreadCount || 0) > 0 ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={t.avatar}
                      alt={t.title}
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.title)}&backgroundColor=0a66c2`
                      }}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    {t.onlineStatus === "online" && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-xs text-zinc-900 truncate">
                        {t.title}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        {(t.unreadCount || 0) > 0 && (
                          <span
                            className="rounded-full bg-[#0A66C2] px-1.5 py-0.2 text-[9px] font-bold"
                            style={{ color: "#FFFFFF" }}
                          >
                            {t.unreadCount}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400">
                          {formatMessageSentDateTime(t.messages?.[t.messages.length - 1], t.lastMessageTime)}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        (t.unreadCount || 0) > 0
                          ? "font-bold text-zinc-900"
                          : "text-zinc-500"
                      }`}
                    >
                      {t.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
