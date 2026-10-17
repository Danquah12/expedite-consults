"use client"

import React, { useState } from "react"
import {
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Share2,
  Lock,
  ExternalLink,
  Award,
  BookOpen,
  Sparkles,
  X
} from "lucide-react"
import {
  USER_PROFESSIONAL_ID_DATA,
  PortableProfessionalID
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface ProfessionalIDModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserProfile
}

export function ProfessionalIDModal({
  isOpen,
  onClose,
  currentUser
}: ProfessionalIDModalProps) {
  const [hasCopied, setHasCopied] = useState(false)

  if (!isOpen) return null

  const customHandle = currentUser.name ? currentUser.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'member'
  const proofHash = `0x${currentUser.id.replace(/[^a-f0-9]/gi, '').padEnd(32, 'a').slice(0, 32)}...`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://connectin.com/id/${customHandle}`)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#0A66C2] dark:text-blue-400 font-bold text-sm shadow-xs border border-blue-200 dark:border-blue-800">
              ID
            </span>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>ConnectIn Verified Member ID</span>
                <ShieldCheck className="h-4 w-4 text-[#0A66C2]" />
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Shareable Digital Professional Card</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Identity Card Badge */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-5 space-y-4 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt=""
                className="h-14 w-14 rounded-2xl object-cover ring-2 ring-[#0A66C2]/30 shadow-xs"
              />
              <div>
                <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-semibold text-[#0A66C2] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    ID: #{customHandle}
                  </span>
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-snug">{currentUser.headline}</p>
              </div>
            </div>

            <div className="h-12 w-12 rounded-xl bg-white p-1 text-black shrink-0 flex items-center justify-center border border-zinc-200 shadow-xs">
              <QrCode className="h-10 w-10 text-zinc-800" />
            </div>
          </div>

          {/* Clearance & Reputation */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-0.5">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Verification Level</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Professional
              </p>
              <span className="text-[10px] text-zinc-400 block">Verified Specialist</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-0.5">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Professional Network</span>
              <p className="font-bold text-zinc-900 dark:text-white text-xs">
                {currentUser.connectionsCount || 840} Connections
              </p>
              <span className="text-[10px] text-zinc-400 block">{currentUser.followersCount || 2400} Followers</span>
            </div>
          </div>

          {/* Top Verified Skills */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-zinc-500">Verified Skills:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(currentUser.skills && currentUser.skills.length > 0 ? currentUser.skills.map(s => typeof s === 'string' ? s : s.name) : ["Zero Trust", "Cloud Architecture", "Enterprise Security", "Next.js"]).slice(0, 5).map((sk, i) => (
                <span key={i} className="rounded-full bg-white dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={handleCopyLink}
            className="flex-1 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold py-2.5 text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{hasCopied ? "Copied Link!" : `Copy Profile Link (connectin.com/id/${customHandle})`}</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200 font-semibold px-5 py-2.5 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
