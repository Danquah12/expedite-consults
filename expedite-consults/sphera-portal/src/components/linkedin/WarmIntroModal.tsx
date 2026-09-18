"use client"

import React, { useState } from "react"
import {
  Users,
  Share2,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Send,
  Link2,
  Copy
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SuggestedConnection, UserProfile } from "@/lib/linkedin-data"

interface WarmIntroModalProps {
  isOpen: boolean
  onClose: () => void
  targetPerson: SuggestedConnection | null
  currentUser: UserProfile
}

export function WarmIntroModal({
  isOpen,
  onClose,
  targetPerson,
  currentUser
}: WarmIntroModalProps) {
  const [introMessage, setIntroMessage] = useState(
    `Hi Elena! I noticed you are closely connected with ${targetPerson?.name || "Victoria"}. Given our joint research on Autonomous Defense Loops and her work scaling zero-trust FinTech systems, would you be open to making a quick warm introduction? I've attached a one-paragraph blurb below!`
  )
  const [isSent, setIsSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSent(true)
    setTimeout(() => {
      onClose()
      setIsSent(false)
    }, 1500)
  }

  const handleCopyCard = () => {
    navigator.clipboard?.writeText(introMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!targetPerson) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="border-b border-zinc-200 bg-gradient-to-r from-blue-900 via-sky-950 to-indigo-950 px-6 py-4 text-white dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-xs">
              <Share2 className="h-5 w-5 text-sky-300 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                Warm Intro Graph Engine™
              </DialogTitle>
              <p className="text-xs text-sky-200">
                Generate high-conviction forwardable introduction cards via mutual collaborators.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Connection Graph Pathway */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/50 dark:bg-sky-950/20">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                Warm Introduction Pathway (3 Hops)
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                94% Strength Score
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="text-center space-y-1">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-10 w-10 rounded-full object-cover mx-auto ring-2 ring-[#0A66C2]"
                />
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{currentUser.name}</p>
                <span className="text-[10px] text-zinc-400">You</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[9px] text-[#0A66C2] font-semibold">Mutual Co-Author</span>
                <ArrowRight className="h-4 w-4 text-[#0A66C2]" />
              </div>

              <div className="text-center space-y-1">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                  alt="Elena"
                  className="h-10 w-10 rounded-full object-cover mx-auto ring-2 ring-emerald-500"
                />
                <p className="font-bold text-zinc-900 dark:text-zinc-100">Dr. Elena Rostova</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Bridge Connection</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[9px] text-emerald-600 font-semibold">Advisor</span>
                <ArrowRight className="h-4 w-4 text-emerald-600" />
              </div>

              <div className="text-center space-y-1">
                <img
                  src={targetPerson.avatar}
                  alt={targetPerson.name}
                  className="h-10 w-10 rounded-full object-cover mx-auto ring-2 ring-indigo-500"
                />
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{targetPerson.name}</p>
                <span className="text-[10px] text-indigo-500 font-semibold">Target Contact</span>
              </div>
            </div>
          </div>

          {/* Forwardable Card Composer */}
          <form onSubmit={handleSendRequest} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                AI-Crafted Forwardable Blurb for Elena
              </label>
              <button
                type="button"
                onClick={handleCopyCard}
                className="flex items-center gap-1 text-[11px] text-[#0A66C2] font-semibold hover:underline"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy card"}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-400">
                Includes your verified Proof-of-Work portfolio badge
              </span>
              <button
                type="submit"
                disabled={isSent}
                className="flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182] transition-all shadow-xs"
              >
                {isSent ? (
                  <>
                    <Check className="h-4 w-4" /> Request Sent to Elena!
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Send Intro Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
