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
  const [idData] = useState<PortableProfessionalID>(USER_PROFESSIONAL_ID_DATA)
  const [hasCopied, setHasCopied] = useState(false)

  if (!isOpen) return null

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://connectin.com/id/${idData.customHandle}`)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0052cc] to-[#00c6ff] text-white font-black text-sm shadow-md">
              E
            </span>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>ConnectIn Portable Professional ID</span>
                <ShieldCheck className="h-4 w-4 text-sky-400" />
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">Cryptographically Attested Identity Dossier</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Identity Card Badge */}
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-md space-y-4 shadow-inner">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt=""
                className="h-14 w-14 rounded-2xl object-cover ring-2 ring-sky-400/50 shadow-md"
              />
              <div>
                <h4 className="font-black text-lg text-white flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="rounded-full bg-sky-500/20 px-2 py-0.2 text-[10px] font-bold text-sky-300 border border-sky-400/30">
                    ID: #{idData.customHandle}
                  </span>
                </h4>
                <p className="text-xs text-zinc-300 leading-snug">{idData.headline}</p>
              </div>
            </div>

            <div className="h-12 w-12 rounded-xl bg-white p-1 text-black shrink-0 flex items-center justify-center shadow-md">
              <QrCode className="h-10 w-10 text-slate-900" />
            </div>
          </div>

          {/* Clearance & Reputation */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
              <span className="text-[9px] uppercase font-mono text-zinc-400">Clearance Attestation</span>
              <p className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                {idData.verifiedClearance}
              </p>
              <span className="text-[9px] text-zinc-400 block">{idData.clearanceExpiry}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
              <span className="text-[9px] uppercase font-mono text-zinc-400">Research &amp; Citations</span>
              <p className="font-bold text-amber-300 text-xs font-mono">
                {idData.publicationsCount} Papers · {idData.citationsCount} Citations
              </p>
              <span className="text-[9px] text-zinc-400 block">{idData.activePatentsCount} Granted Patents</span>
            </div>
          </div>

          {/* Top Verified Skills */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Top Verified Skills:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {idData.topVerifiedSkills.map((sk, i) => (
                <span key={i} className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-200 border border-white/10">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Cryptographic Hash Proof */}
          <div className="rounded-lg bg-black/60 p-2 text-[9px] font-mono text-zinc-400 flex items-center justify-between">
            <span className="truncate pr-2">Proof: {idData.cryptographicHashProof}</span>
            <span className="text-emerald-400 font-bold shrink-0">✓ Ed25519 Signed</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={handleCopyLink}
            className="flex-1 rounded-xl bg-white text-zinc-950 font-black py-2.5 text-xs shadow-md hover:bg-zinc-100 transition-all flex items-center justify-center gap-1.5"
          >
            {hasCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{hasCopied ? "Copied ID Link!" : `connectin.com/id/${idData.customHandle}`}</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 text-xs border border-white/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
