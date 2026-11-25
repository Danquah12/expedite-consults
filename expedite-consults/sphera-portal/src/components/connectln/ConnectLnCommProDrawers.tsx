"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  Camera,
  Check,
  Download,
  Eye,
  Lock,
  MapPin,
  Mic,
  MicOff,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  UserCheck,
  Video,
  X,
} from "lucide-react"
import type { B2BMessageItem } from "@/lib/b2b-messaging-data"
import {
  CommPrivacySettings,
  DisappearingDuration,
  LinkedDeviceSession,
  deriveE2eeSafetyCode,
  encodeContactMarker,
  encodeLocationMarker,
  encodePollMarker,
  encodeVideoNoteMarker,
  encodeViewOnceMarker,
  encodeVoiceNoteMarker,
  extractActionItemsFromThread,
  getLinkedDevices,
  isContactBlocked,
  linkNewDevice,
  markViewOnceOpened,
  parseRichMessage,
  polishDraftWithNoctis,
  reportContact,
  revokeLinkedDevice,
  scanThreadForScamRisks,
  summarizeThreadWithNoctis,
  toggleBlockContact,
  togglePollVote,
  updateCommPrivacySettings,
} from "@/lib/connectln-comm-pro"

export interface ShareTargetItem {
  id: string
  name: string
  avatar?: string
  subtitle?: string
  email?: string
}

export function ConnectLnRichBubbleContent({
  msg,
  isMe,
  viewerName,
  privacy,
  renderPlainText,
  onStartDirectChatOrCall,
}: {
  msg: B2BMessageItem
  isMe: boolean
  viewerName: string
  privacy: CommPrivacySettings
  renderPlainText: (txt: string, isOwnBubble: boolean) => React.ReactNode
  onStartDirectChatOrCall?: (name: string, email?: string) => void
}) {
  const parsed = parseRichMessage(msg.text || "")
  const [viewOncePreview, setViewOncePreview] = useState<{ label: string; dataUrl: string } | null>(
    null
  )

  const quoteBlock = parsed.reply ? (
    <div
      className={`mb-2 rounded-xl border-l-4 px-2.5 py-1.5 text-xs ${
        isMe
          ? "border-white/80 bg-white/15 text-white"
          : "border-[#0A66C2] bg-slate-100 text-slate-700"
      }`}
    >
      <p className="font-extrabold text-[10.5px] opacity-90 truncate">{parsed.reply.sender}</p>
      <p className="text-[11px] opacity-85 line-clamp-2 break-words [overflow-wrap:anywhere]">
        {parsed.reply.snippet}
      </p>
    </div>
  ) : null

  if (parsed.poll) {
    const votesByOption = privacy.pollVotesByMsgId[msg.id] || {}
    const totalVotes = parsed.poll.options.reduce(
      (sum, _, idx) => sum + (votesByOption[String(idx)]?.length || 0),
      0
    )
    const myKey = (viewerName || "You").trim()
    return (
      <div className="min-w-0 max-w-full space-y-2 break-words [overflow-wrap:anywhere]">
        {quoteBlock}
        <div
          className={`rounded-xl p-2.5 border ${
            isMe ? "bg-white/10 border-white/25" : "bg-slate-50 border-slate-200"
          }`}
        >
          <p className="text-xs font-extrabold mb-2">📊 {parsed.poll.question}</p>
          <div className="space-y-1.5">
            {parsed.poll.options.map((opt, idx) => {
              const voters = votesByOption[String(idx)] || []
              const votedByMe = voters.includes(myKey)
              const pct = totalVotes > 0 ? Math.round((voters.length / totalVotes) * 100) : 0
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => togglePollVote(msg.id, idx, myKey)}
                  className={`relative w-full overflow-hidden rounded-lg border px-2.5 py-1.5 text-left text-xs font-bold cursor-pointer transition-colors ${
                    isMe
                      ? votedByMe
                        ? "border-white bg-white/25 text-white"
                        : "border-white/30 bg-white/10 text-white hover:bg-white/20"
                      : votedByMe
                      ? "border-[#0A66C2] bg-blue-50 text-[#0A66C2]"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 pointer-events-none ${
                      isMe ? "bg-white/15" : "bg-blue-100/70"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                  <span className="relative flex items-center justify-between gap-2">
                    <span className="truncate">
                      {votedByMe ? "✓ " : ""}
                      {opt}
                    </span>
                    <span className="text-[10px] shrink-0 opacity-85">
                      {voters.length} ({pct}%)
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className={`mt-1.5 text-[10px] ${isMe ? "text-white/75" : "text-slate-500"}`}>
            {totalVotes} vote{totalVotes === 1 ? "" : "s"} · Tap an option to vote
          </p>
        </div>
      </div>
    )
  }

  if (parsed.location) {
    const mapHref = `https://www.openstreetmap.org/?mlat=${encodeURIComponent(
      parsed.location.lat
    )}&mlon=${encodeURIComponent(parsed.location.lng)}#map=15/${encodeURIComponent(
      parsed.location.lat
    )}/${encodeURIComponent(parsed.location.lng)}`
    return (
      <div className="min-w-0 max-w-full space-y-1.5 break-words [overflow-wrap:anywhere]">
        {quoteBlock}
        <div
          className={`rounded-xl p-2.5 border ${
            isMe ? "bg-white/15 border-white/25" : "bg-emerald-50/70 border-emerald-200 text-slate-800"
          }`}
        >
          <p className="text-xs font-extrabold flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{parsed.location.label}</span>
          </p>
          <p className={`text-[10.5px] font-mono mt-0.5 ${isMe ? "text-white/80" : "text-slate-600"}`}>
            {parsed.location.lat}, {parsed.location.lng}
          </p>
          <a
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block mt-1.5 text-[11px] font-extrabold underline ${
              isMe ? "text-white" : "text-[#0A66C2]"
            }`}
          >
            Open Map Pin ↗
          </a>
        </div>
      </div>
    )
  }

  if (parsed.contact) {
    return (
      <div className="min-w-0 max-w-full space-y-1.5 break-words [overflow-wrap:anywhere]">
        {quoteBlock}
        <div
          className={`rounded-xl p-2.5 border flex items-center justify-between gap-3 ${
            isMe ? "bg-white/15 border-white/25" : "bg-slate-50 border-slate-200 text-slate-800"
          }`}
        >
          <div className="min-w-0">
            <p className="text-xs font-extrabold flex items-center gap-1.5 truncate">
              <UserCheck className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{parsed.contact.name}</span>
            </p>
            <p className={`text-[10.5px] truncate ${isMe ? "text-white/80" : "text-slate-600"}`}>
              {parsed.contact.role}
            </p>
            {parsed.contact.email && (
              <p className={`text-[10px] font-mono truncate ${isMe ? "text-white/75" : "text-slate-500"}`}>
                {parsed.contact.email}
              </p>
            )}
          </div>
          {onStartDirectChatOrCall && (
            <button
              type="button"
              onClick={() => onStartDirectChatOrCall(parsed.contact!.name, parsed.contact!.email)}
              className={`rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold shrink-0 cursor-pointer ${
                isMe ? "bg-white text-[#0A66C2]" : "bg-[#0A66C2] text-white"
              }`}
              style={isMe ? undefined : { color: "#FFFFFF" }}
            >
              Message
            </button>
          )}
        </div>
      </div>
    )
  }

  if (parsed.viewOnce) {
    const alreadyOpened = privacy.viewedOnceIds.includes(msg.id)
    return (
      <div className="min-w-0 max-w-full space-y-1.5 break-words [overflow-wrap:anywhere]">
        {quoteBlock}
        <button
          type="button"
          disabled={alreadyOpened || !parsed.viewOnce.dataUrl}
          onClick={() => {
            if (!alreadyOpened && parsed.viewOnce?.dataUrl) {
              setViewOncePreview(parsed.viewOnce)
              markViewOnceOpened(msg.id)
            }
          }}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold cursor-pointer disabled:opacity-65 disabled:cursor-default ${
            isMe
              ? "bg-white/15 border-white/30 text-white"
              : "bg-indigo-50 border-indigo-200 text-indigo-900"
          }`}
        >
          <Eye className="h-4 w-4 shrink-0" />
          <span>
            {alreadyOpened
              ? `✓ Opened · ${parsed.viewOnce.label}`
              : `1x View-Once · Tap to view (${parsed.viewOnce.label})`}
          </span>
        </button>

        {viewOncePreview && (
          <div
            className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setViewOncePreview(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-slate-950 border border-white/20 p-4 text-white space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> View-Once Media · Closes Permanently
                </span>
                <button
                  type="button"
                  onClick={() => setViewOncePreview(null)}
                  className="h-7 w-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {viewOncePreview.dataUrl.startsWith("data:image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewOncePreview.dataUrl}
                  alt={viewOncePreview.label}
                  className="w-full max-h-[65vh] object-contain rounded-xl bg-black"
                />
              ) : (
                <div className="rounded-xl bg-white/10 p-4 text-xs">
                  <p className="font-bold">{viewOncePreview.label}</p>
                  <p className="text-slate-300 mt-1">View-once confidential attachment opened.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (parsed.voice) {
    return (
      <div className="min-w-0 max-w-full space-y-1.5 break-words [overflow-wrap:anywhere]">
        {quoteBlock}
        <div
          className={`rounded-xl p-2.5 border space-y-1.5 ${
            isMe ? "bg-white/15 border-white/25" : "bg-emerald-50/70 border-emerald-200 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between gap-2 text-xs font-extrabold">
            <span className="flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 shrink-0" />
              <span>Voice Note · {parsed.voice.durationSec}s</span>
            </span>
          </div>
          {parsed.voice.dataUrl && parsed.voice.dataUrl.startsWith("data:audio/") && (
            <audio controls src={parsed.voice.dataUrl} className="w-full h-9 max-w-[260px]" />
          )}
          {parsed.voice.transcript && (
            <p className={`text-xs ${isMe ? "text-white/90" : "text-slate-700"}`}>
              “{parsed.voice.transcript}”
            </p>
          )}
        </div>
      </div>
    )
  }

  if (parsed.videoNote) {
    return (
      <div className="min-w-0 max-w-full space-y-1.5 break-words [overflow-wrap:anywhere]">
        {quoteBlock}
        <div
          className={`rounded-xl p-2.5 border space-y-1.5 ${
            isMe ? "bg-white/15 border-white/25" : "bg-slate-50 border-slate-200 text-slate-800"
          }`}
        >
          <p className="text-xs font-extrabold flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 shrink-0" />
            <span>Video Note · {parsed.videoNote.durationSec}s</span>
          </p>
          {parsed.videoNote.dataUrl && parsed.videoNote.dataUrl.startsWith("data:video/") && (
            <video
              controls
              playsInline
              src={parsed.videoNote.dataUrl}
              className="w-56 max-w-full rounded-xl bg-black"
            />
          )}
          {parsed.videoNote.caption && (
            <p className={`text-xs ${isMe ? "text-white/90" : "text-slate-700"}`}>
              {parsed.videoNote.caption}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 max-w-full break-words [overflow-wrap:anywhere]">
      {quoteBlock}
      <p className={isMe && !(msg.text.includes("Meeting invitation from") || msg.text.includes("Meeting RSVP Response")) ? "text-white" : "text-slate-800"}>
        {renderPlainText(parsed.bodyText, isMe)}
        {msg.editedAtIso && (
          <span className={`ml-1.5 text-[10px] ${isMe ? "text-white/75" : "text-slate-400"}`}>
            (edited)
          </span>
        )}
      </p>
    </div>
  )
}

export function ConnectLnThreadControlsDrawer({
  open,
  onClose,
  threadId,
  threadTitle,
  threadSubtitle,
  recipientEmail,
  messages,
  privacy,
  isArchived,
  onToggleArchive,
  onUnlockThread,
  onAddActionItemsAsTask,
  onToast,
}: {
  open: boolean
  onClose: () => void
  threadId: string
  threadTitle: string
  threadSubtitle: string
  recipientEmail?: string
  messages: B2BMessageItem[]
  privacy: CommPrivacySettings
  isArchived: boolean
  onToggleArchive: () => void
  onUnlockThread: () => void
  onAddActionItemsAsTask?: (items: string[]) => void
  onToast: (msg: string) => void
}) {
  const [tab, setTab] = useState<"thread" | "noctis" | "privacy">("thread")
  const [pinDraft, setPinDraft] = useState("")
  const [summaryOut, setSummaryOut] = useState<{
    summary: string
    keyDecisions: string[]
    nextSteps: string[]
  } | null>(null)
  const [actionItemsOut, setActionItemsOut] = useState<string[] | null>(null)
  const [scamOut, setScamOut] = useState<{
    riskLevel: "low" | "medium" | "high"
    findings: string[]
  } | null>(null)
  const [devices, setDevices] = useState<LinkedDeviceSession[]>(() => getLinkedDevices())
  const [newDeviceName, setNewDeviceName] = useState("")

  useEffect(() => {
    if (open) {
      setDevices(getLinkedDevices())
    }
  }, [open])

  if (!open) return null

  const currentDisappearing: DisappearingDuration = privacy.disappearingByThread[threadId] || "off"
  const currentPin = privacy.lockedThreadPins[threadId] || ""
  const contactKey = recipientEmail || threadTitle
  const blockedNow = isContactBlocked(contactKey)
  const safetyCode = deriveE2eeSafetyCode(`${threadId}:${threadTitle}`)

  const handleExportChat = () => {
    const lines = messages.map(
      (m) => `[${m.timestamp || ""}] ${m.sender?.name || "Member"}: ${m.isDeleted ? "(deleted)" : m.text}`
    )
    const blob = new Blob([`ConnectLn Encrypted Thread Export — ${threadTitle}\n\n${lines.join("\n")}`], {
      type: "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${threadTitle.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_chat.txt`
    a.click()
    URL.revokeObjectURL(url)
    onToast("📥 Exported conversation transcript (.txt).")
  }

  return (
    <div className="fixed inset-0 z-[85] bg-black/45 backdrop-blur-[1px] flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-white text-slate-900 shadow-2xl border-l border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2 bg-[#FAF7F2]">
          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-900 truncate">{threadTitle}</h3>
            <p className="text-[11px] text-slate-500 truncate">{threadSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="h-4 w-4 text-slate-700" />
          </button>
        </div>

        {/* Clean 3-tab switcher */}
        <div className="px-4 py-2 border-b border-slate-200 flex items-center gap-1.5 bg-white">
          {(
            [
              { id: "thread", label: "🔒 Thread & Safety" },
              { id: "noctis", label: "✨ Noctis AI" },
              { id: "privacy", label: "📱 Privacy & Devices" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex-1 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold cursor-pointer transition-colors ${
                tab === item.id
                  ? "bg-[#0A66C2] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              style={tab === item.id ? { color: "#FFFFFF" } : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {tab === "thread" && (
            <>
              <div className="rounded-2xl border border-slate-200 p-3 space-y-2">
                <p className="font-extrabold text-slate-900">⏱️ Disappearing Messages</p>
                <p className="text-[11px] text-slate-500">
                  Auto-hide messages older than your chosen window in this conversation.
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["off", "24h", "7d", "90d"] as const).map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => {
                        updateCommPrivacySettings((prev) => ({
                          ...prev,
                          disappearingByThread: { ...prev.disappearingByThread, [threadId]: dur },
                        }))
                        onToast(`⏱️ Disappearing timer set to ${dur.toUpperCase()}.`)
                      }}
                      className={`rounded-xl py-1.5 font-extrabold border cursor-pointer ${
                        currentDisappearing === dur
                          ? "bg-[#0A66C2] border-[#0A66C2] text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                      style={currentDisappearing === dur ? { color: "#FFFFFF" } : undefined}
                    >
                      {dur === "off" ? "Off" : dur}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3 space-y-2">
                <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#0A66C2]" /> Chat Lock (4-Digit PIN)
                </p>
                {currentPin ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-emerald-700">
                      🔐 This chat is protected with a PIN.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateCommPrivacySettings((prev) => {
                          const nextPins = { ...prev.lockedThreadPins }
                          delete nextPins[threadId]
                          return { ...prev, lockedThreadPins: nextPins }
                        })
                        onUnlockThread()
                        onToast("🔓 Chat PIN lock removed.")
                      }}
                      className="rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 font-extrabold cursor-pointer"
                    >
                      Remove PIN
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={pinDraft}
                      onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="Enter 4-digit PIN"
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      disabled={pinDraft.length < 4}
                      onClick={() => {
                        updateCommPrivacySettings((prev) => ({
                          ...prev,
                          lockedThreadPins: { ...prev.lockedThreadPins, [threadId]: pinDraft },
                        }))
                        setPinDraft("")
                        onToast("🔐 Chat locked. Require PIN next open.")
                      }}
                      className="rounded-xl bg-[#0A66C2] disabled:bg-slate-200 px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                      style={pinDraft.length >= 4 ? { color: "#FFFFFF" } : undefined}
                    >
                      Lock Chat
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-1.5">
                <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" /> E2EE Encryption Safety Number
                </p>
                <p className="font-mono text-xs font-bold tracking-wider text-emerald-900 bg-white rounded-xl p-2 border border-emerald-200">
                  {safetyCode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onToggleArchive()
                    onToast(isArchived ? "📥 Restored from Archive." : "📦 Conversation archived.")
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 px-3 font-extrabold text-slate-800 cursor-pointer"
                >
                  {isArchived ? "📥 Unarchive" : "📦 Archive Chat"}
                </button>
                <button
                  type="button"
                  onClick={handleExportChat}
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 px-3 font-extrabold text-slate-800 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Export Chat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nowB = toggleBlockContact(contactKey)
                    onToast(nowB ? `🚫 Blocked ${threadTitle}.` : `✓ Unblocked ${threadTitle}.`)
                  }}
                  className={`rounded-xl border py-2 px-3 font-extrabold cursor-pointer ${
                    blockedNow
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  {blockedNow ? "Unblock Contact" : "🚫 Block Contact"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reportContact(contactKey)
                    onToast(`🛡️ Reported ${threadTitle} to Trust & Safety.`)
                  }}
                  className="rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 py-2 px-3 font-extrabold text-amber-900 cursor-pointer flex items-center justify-center gap-1"
                >
                  <ShieldAlert className="h-3.5 w-3.5" /> Report Abuse
                </button>
              </div>
            </>
          )}

          {tab === "noctis" && (
            <>
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3 text-[11px] text-slate-700">
                <p className="font-extrabold text-[#0A66C2] flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="h-3.5 w-3.5" /> Consent-First Noctis Privacy
                </p>
                Private messages are never auto-scanned in the background. Tools below run strictly on-demand when you click.
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setSummaryOut(summarizeThreadWithNoctis(messages, threadTitle))}
                  className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] py-2.5 px-3 font-extrabold text-xs cursor-pointer"
                  style={{ color: "#FFFFFF" }}
                >
                  ✨ Summarize Conversation
                </button>
                <button
                  type="button"
                  onClick={() => setActionItemsOut(extractActionItemsFromThread(messages))}
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 px-3 font-extrabold text-slate-800 cursor-pointer"
                >
                  ✅ Extract Action Items
                </button>
                <button
                  type="button"
                  onClick={() => setScamOut(scanThreadForScamRisks(messages))}
                  className="rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 py-2 px-3 font-extrabold text-amber-950 cursor-pointer"
                >
                  🛡️ Check for Scam / Phishing Risks
                </button>
              </div>

              {summaryOut && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <p className="font-extrabold text-slate-900">Thread Summary</p>
                  <p className="text-slate-700 leading-relaxed">{summaryOut.summary}</p>
                  <div>
                    <p className="font-bold text-slate-800">Key Decisions:</p>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                      {summaryOut.keyDecisions.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Next Steps:</p>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                      {summaryOut.nextSteps.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {actionItemsOut && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-emerald-950">Extracted Action Items</p>
                    {onAddActionItemsAsTask && actionItemsOut.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          onAddActionItemsAsTask(actionItemsOut)
                          onToast("✓ Copied action items summary.")
                        }}
                        className="text-[11px] font-extrabold text-[#0A66C2] underline cursor-pointer"
                      >
                        Copy to Clipboard
                      </button>
                    )}
                  </div>
                  {actionItemsOut.length === 0 ? (
                    <p className="text-slate-600">No explicit follow-up tasks detected yet.</p>
                  ) : (
                    <ul className="list-disc pl-4 text-slate-700 space-y-1">
                      {actionItemsOut.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {scamOut && (
                <div
                  className={`rounded-2xl border p-3 space-y-1 ${
                    scamOut.riskLevel === "high"
                      ? "border-rose-300 bg-rose-50 text-rose-900"
                      : scamOut.riskLevel === "medium"
                      ? "border-amber-300 bg-amber-50 text-amber-900"
                      : "border-emerald-200 bg-emerald-50 text-emerald-900"
                  }`}
                >
                  <p className="font-extrabold uppercase">Risk Level: {scamOut.riskLevel}</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {scamOut.findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {tab === "privacy" && (
            <>
              <div className="rounded-2xl border border-slate-200 p-3 space-y-2.5">
                <p className="font-extrabold text-slate-900">Global Privacy Controls</p>
                {(
                  [
                    {
                      key: "hideLastSeen",
                      label: "Hide Last Seen & Presence",
                      val: privacy.hideLastSeen,
                    },
                    {
                      key: "readReceiptsEnabled",
                      label: "Send Read Receipts (✓✓ Seen)",
                      val: privacy.readReceiptsEnabled,
                    },
                    {
                      key: "silenceUnknownCallers",
                      label: "Silence Unknown Callers",
                      val: privacy.silenceUnknownCallers,
                    },
                  ] as const
                ).map((row) => (
                  <label
                    key={row.key}
                    className="flex items-center justify-between gap-2 py-1 cursor-pointer"
                  >
                    <span className="font-bold text-slate-700">{row.label}</span>
                    <input
                      type="checkbox"
                      checked={row.val}
                      onChange={(e) =>
                        updateCommPrivacySettings({ [row.key]: e.target.checked } as any)
                      }
                      className="h-4 w-4 accent-[#0A66C2]"
                    />
                  </label>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 p-3 space-y-2.5">
                <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-[#0A66C2]" /> Linked Devices &amp; QR Sync
                </p>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-800">QR Pairing Token</p>
                    <p className="font-mono text-[10.5px] text-[#0A66C2]">
                      {safetyCode.slice(0, 17)}
                    </p>
                  </div>
                  <span className="rounded-lg bg-emerald-100 text-emerald-800 px-2 py-1 text-[10px] font-extrabold">
                    E2EE Ready
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    placeholder="Device name (e.g. iPad Field Unit)"
                    className="flex-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = linkNewDevice(newDeviceName || "Workstation Tablet")
                      setDevices(next)
                      setNewDeviceName("")
                      onToast("📱 Linked new companion device.")
                    }}
                    className="rounded-xl bg-[#0A66C2] px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                    style={{ color: "#FFFFFF" }}
                  >
                    + Link
                  </button>
                </div>
                <div className="space-y-1.5">
                  {devices.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 truncate">{d.name}</p>
                        <p className="text-[10.5px] text-slate-500 truncate">
                          {d.platform} · {d.location}
                        </p>
                      </div>
                      {d.isCurrent ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold shrink-0">
                          Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDevices(revokeLinkedDevice(d.id))}
                          className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 text-[10.5px] font-bold cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export type RichComposerMode = "voice" | "video" | "poll" | "location" | "contact" | "viewonce" | null

export function ConnectLnRichComposerModal({
  mode,
  onClose,
  contacts,
  onSendMarker,
  onPolishDraft,
}: {
  mode: RichComposerMode
  onClose: () => void
  contacts: ShareTargetItem[]
  onSendMarker: (markerText: string) => void
  onPolishDraft?: (polished: string) => void
}) {
  const [recording, setRecording] = useState(false)
  const [sec, setSec] = useState(0)
  const [mediaDataUrl, setMediaDataUrl] = useState("")
  const [transcript, setTranscript] = useState("")
  const [err, setErr] = useState("")
  const [pollQ, setPollQ] = useState("")
  const [pollOpts, setPollOpts] = useState(["Yes — Proceed", "Need Revision", "Schedule Review"])
  const [locLabel, setLocLabel] = useState("Jobsite / Office Check-In")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [voLabel, setVoLabel] = useState("Confidential Photo")

  const mrRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speechRef = useRef<any>(null)

  const stopTracks = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    try {
      speechRef.current?.stop?.()
    } catch {}
    if (mrRef.current && mrRef.current.state !== "inactive") {
      try {
        mrRef.current.stop()
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setRecording(false)
  }

  useEffect(() => {
    if (!mode) {
      stopTracks()
      setSec(0)
      setMediaDataUrl("")
      setTranscript("")
      setErr("")
    }
  }, [mode])

  useEffect(() => {
    return () => stopTracks()
  }, [])

  if (!mode) return null

  const startCapture = async (withVideo: boolean) => {
    setErr("")
    setMediaDataUrl("")
    setSec(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: withVideo })
      streamRef.current = stream
      if (withVideo && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.muted = true
        videoPreviewRef.current.play().catch(() => {})
      }
      const chunks: BlobPart[] = []
      const mr = new MediaRecorder(stream)
      mrRef.current = mr
      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data)
      }
      mr.onstop = () => {
        const blob = new Blob(chunks, {
          type: mr.mimeType || (withVideo ? "video/webm" : "audio/webm"),
        })
        const reader = new FileReader()
        reader.onload = () => setMediaDataUrl(String(reader.result || ""))
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start(250)
      setRecording(true)
      timerRef.current = setInterval(() => {
        setSec((s) => {
          if (withVideo && s >= 45) {
            stopTracks()
            return 45
          }
          return s + 1
        })
      }, 1000)

      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!withVideo && SpeechRec) {
        try {
          const sr = new SpeechRec()
          sr.continuous = true
          sr.interimResults = false
          sr.onresult = (e: any) => {
            const added = Array.from(e.results)
              .slice(e.resultIndex)
              .map((r: any) => r[0]?.transcript || "")
              .join(" ")
              .trim()
            if (added) setTranscript((p) => (p ? `${p} ${added}` : added))
          }
          sr.start()
          speechRef.current = sr
        } catch {}
      }
    } catch {
      setErr(
        withVideo
          ? "Camera unavailable here — enter a quick video note caption below instead."
          : "Microphone unavailable here — type a voice note transcript below instead."
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">
            {mode === "voice" && "🎙️ Record Voice Message"}
            {mode === "video" && "🎬 Record Short Video Note"}
            {mode === "poll" && "📊 Create Conversation Poll"}
            {mode === "location" && "📍 Share Location Pin"}
            {mode === "contact" && "👤 Share Verified Contact Card"}
            {mode === "viewonce" && "👁️ Send View-Once Media"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {(mode === "voice" || mode === "video") && (
          <div className="space-y-3">
            {mode === "video" && (
              <video
                ref={videoPreviewRef}
                playsInline
                className="w-full h-44 rounded-xl bg-slate-950 object-cover"
              />
            )}
            <div className="flex items-center justify-center">
              {!recording ? (
                <button
                  type="button"
                  onClick={() => void startCapture(mode === "video")}
                  className="rounded-full bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-extrabold flex items-center gap-2 cursor-pointer"
                  style={{ color: "#FFFFFF" }}
                >
                  {mode === "video" ? <Camera className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span>{mediaDataUrl ? "Re-record" : "Start Recording"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopTracks}
                  className="rounded-full bg-amber-500 px-5 py-2 text-xs font-extrabold text-slate-950 flex items-center gap-2 animate-pulse cursor-pointer"
                >
                  <MicOff className="h-4 w-4" />
                  <span>Stop Recording ({sec}s)</span>
                </button>
              )}
            </div>
            {mediaDataUrl && mode === "voice" && (
              <audio controls src={mediaDataUrl} className="w-full h-10" />
            )}
            {mediaDataUrl && mode === "video" && (
              <video controls src={mediaDataUrl} className="w-full max-h-44 rounded-xl bg-black" />
            )}
            <textarea
              rows={2}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={
                mode === "voice"
                  ? "Live speech transcript (or type your voice note)..."
                  : "Short caption for your video note..."
              }
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
            />
            {err && <p className="text-[11px] font-bold text-amber-700">{err}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!mediaDataUrl && !transcript.trim()}
                onClick={() => {
                  const marker =
                    mode === "voice"
                      ? encodeVoiceNoteMarker(sec || 3, transcript || "Voice message", mediaDataUrl)
                      : encodeVideoNoteMarker(sec || 3, transcript || "Video note", mediaDataUrl)
                  onSendMarker(marker)
                  onClose()
                }}
                className="rounded-xl bg-[#0A66C2] disabled:bg-slate-200 px-4 py-2 text-xs font-extrabold cursor-pointer"
                style={mediaDataUrl || transcript.trim() ? { color: "#FFFFFF" } : undefined}
              >
                Send ➤
              </button>
            </div>
          </div>
        )}

        {mode === "poll" && (
          <div className="space-y-2.5 text-xs">
            <input
              type="text"
              value={pollQ}
              onChange={(e) => setPollQ(e.target.value)}
              placeholder="Poll question (e.g. Confirm Thursday inspection time?)"
              className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
            />
            {pollOpts.map((opt, i) => (
              <input
                key={i}
                type="text"
                value={opt}
                onChange={(e) =>
                  setPollOpts((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                }
                placeholder={`Option ${i + 1}`}
                className="w-full rounded-xl border border-slate-200 p-2"
              />
            ))}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!pollQ.trim() || pollOpts.filter((o) => o.trim()).length < 2}
                onClick={() => {
                  onSendMarker(encodePollMarker(pollQ, pollOpts))
                  onClose()
                }}
                className="rounded-xl bg-[#0A66C2] disabled:bg-slate-200 px-4 py-2 font-extrabold cursor-pointer"
                style={pollQ.trim() ? { color: "#FFFFFF" } : undefined}
              >
                Send Poll
              </button>
            </div>
          </div>
        )}

        {mode === "location" && (
          <div className="space-y-3 text-xs">
            <input
              type="text"
              value={locLabel}
              onChange={(e) => setLocLabel(e.target.value)}
              placeholder="Location label"
              className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
            />
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) {
                  setCoords({ lat: 38.9072, lng: -77.0369 })
                  return
                }
                navigator.geolocation.getCurrentPosition(
                  (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                  () => setCoords({ lat: 38.9072, lng: -77.0369 }),
                  { timeout: 5000 }
                )
              }}
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 py-2 font-extrabold text-emerald-900 cursor-pointer"
            >
              📍 Detect Current GPS Coordinates
            </button>
            <p className="text-[11px] font-mono text-slate-600">
              Coordinates: {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "38.90720, -77.03690 (Default)"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const c = coords || { lat: 38.9072, lng: -77.0369 }
                  onSendMarker(encodeLocationMarker(c.lat, c.lng, locLabel))
                  onClose()
                }}
                className="rounded-xl bg-[#0A66C2] px-4 py-2 font-extrabold cursor-pointer"
                style={{ color: "#FFFFFF" }}
              >
                Send Location
              </button>
            </div>
          </div>
        )}

        {mode === "contact" && (
          <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
            {contacts.slice(0, 12).map((c) => (
              <button
                key={c.id + c.name}
                type="button"
                onClick={() => {
                  onSendMarker(encodeContactMarker(c.name, c.subtitle || "ConnectLn Member", c.email))
                  onClose()
                }}
                className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 px-3 py-2 text-left cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">{c.name}</p>
                  <p className="text-[10.5px] text-slate-500 truncate">{c.subtitle}</p>
                </div>
                <span className="text-[11px] font-extrabold text-[#0A66C2] shrink-0">Share</span>
              </button>
            ))}
          </div>
        )}

        {mode === "viewonce" && (
          <div className="space-y-3 text-xs">
            <input
              type="text"
              value={voLabel}
              onChange={(e) => setVoLabel(e.target.value)}
              placeholder="Label (e.g. Site Key Photo)"
              className="w-full rounded-xl border border-slate-200 p-2 font-bold"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => setMediaDataUrl(String(reader.result || ""))
                reader.readAsDataURL(file)
              }}
              className="w-full text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!mediaDataUrl}
                onClick={() => {
                  onSendMarker(encodeViewOnceMarker(voLabel, mediaDataUrl))
                  onClose()
                }}
                className="rounded-xl bg-[#0A66C2] disabled:bg-slate-200 px-4 py-2 font-extrabold cursor-pointer"
                style={mediaDataUrl ? { color: "#FFFFFF" } : undefined}
              >
                Send 1x Media
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
