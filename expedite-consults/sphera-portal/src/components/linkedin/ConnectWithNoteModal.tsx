"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog"
import {
  Sparkles,
  Send,
  X,
  ShieldCheck,
  MessageSquare
} from "lucide-react"
import { SuggestedConnection, UserProfile } from "@/lib/linkedin-data"

interface ConnectWithNoteModalProps {
  isOpen: boolean
  onClose: () => void
  targetPerson: SuggestedConnection | null
  currentUser?: UserProfile
  onSendInvite: (personId: string, note?: string) => void
}

const AI_ICEBREAKER_PRESETS = [
  "Hi, I noticed your work in Cloud Security & Zero Trust. I'd love to connect and exchange insights on modern defense architecture.",
  "Hello! I saw we share mutual connections in the cyber engineering space. Looking forward to following your technical updates.",
  "Hi there, impressed by your recent contributions to enterprise security. Would appreciate having you in my professional network!"
]

export function ConnectWithNoteModal({
  isOpen,
  onClose,
  targetPerson,
  currentUser,
  onSendInvite
}: ConnectWithNoteModalProps) {
  const [noteText, setNoteText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)

  if (!isOpen || !targetPerson) return null

  const maxChars = 300
  const charsRemaining = maxChars - noteText.length

  const handleSend = async (includeNote: boolean) => {
    setIsSending(true)
    await new Promise((r) => setTimeout(r, 450))
    onSendInvite(targetPerson.id, includeNote ? noteText : undefined)
    setIsSending(false)
    setNoteText("")
    setShowNoteInput(false)
    onClose()
  }

  const applyIcebreaker = (text: string) => {
    setNoteText(text)
    setShowNoteInput(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={targetPerson.avatar}
                alt={targetPerson.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-white/40 shadow-sm"
              />
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>Connect with {targetPerson.name}</span>
                  <ShieldCheck className="h-4 w-4 text-sky-400" />
                </h3>
                <p className="text-xs text-zinc-300 line-clamp-1">
                  {targetPerson.headline}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            You can add an optional note to personalize your connection invitation to{" "}
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{targetPerson.name}</strong>.
          </p>

          {!showNoteInput ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0A66C2] dark:text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    AI Smart Icebreaker Suggestions
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">1-Click Insert</span>
                </div>
                <div className="space-y-2">
                  {AI_ICEBREAKER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyIcebreaker(preset)}
                      className="w-full text-left p-2.5 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:border-[#0A66C2] hover:bg-blue-50/30 dark:hover:bg-blue-950/50 transition-all leading-snug"
                    >
                      &quot;{preset}&quot;
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteInput(true)}
                  className="w-full sm:w-1/2 rounded-full border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Add a custom note</span>
                </button>

                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => handleSend(false)}
                  className="w-full sm:w-1/2 rounded-full bg-[#0A66C2] px-4 py-2 text-xs font-bold text-white hover:bg-[#004182] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send without note</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  rows={4}
                  maxLength={maxChars}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={`Ex: Hi ${targetPerson.name.split(" ")[0]}, I would love to connect with you regarding...`}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A66C2] dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:bg-zinc-900 resize-none transition-all"
                />
                <div className="flex justify-between items-center px-1 mt-1 text-[11px] text-zinc-400 font-mono">
                  <span>Custom invitation message</span>
                  <span className={charsRemaining < 20 ? "text-amber-500 font-bold" : ""}>
                    {charsRemaining} characters left
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteInput(false)
                    setNoteText("")
                  }}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel Note
                </button>

                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => handleSend(true)}
                  className="rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Invitation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
