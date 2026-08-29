"use client"

import React, { useState } from "react"
import {
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Briefcase,
  X,
  Sparkles
} from "lucide-react"
import {
  RECRUITER_INBOUND_BOUNTIES_DATA,
  RecruiterInboundBounty
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface InboundBountiesModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function InboundBountiesModal({
  isOpen,
  onClose,
  currentUser,
  onNavigateTab
}: InboundBountiesModalProps) {
  const [bounties, setBounties] = useState<RecruiterInboundBounty[]>(RECRUITER_INBOUND_BOUNTIES_DATA)
  const [payoutClaimed, setPayoutClaimed] = useState(false)

  if (!isOpen) return null

  const handleAcceptBounty = (bountyId: string) => {
    setBounties(prev =>
      prev.map(b => (b.id === bountyId ? { ...b, status: 'Accepted & Paid' } : b))
    )
    setPayoutClaimed(true)
    setTimeout(() => {
      setPayoutClaimed(false)
      onClose()
      onNavigateTab('wallet')
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black text-sm shadow-md">
              $
            </span>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Paid Inbound Recruiter Bounties</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  Escrow Protected
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">Guaranteed Compensation for 30-Min Talent Screens</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {payoutClaimed && (
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-4 text-xs font-bold text-emerald-300 text-center animate-in zoom-in-95">
            ✓ Bounty Accepted! +$250.00 transferred directly to your ConnectIn Wallet!
          </div>
        )}

        {/* Bounties List */}
        <div className="space-y-4">
          {bounties.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-md space-y-4 shadow-inner text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{b.companyLogo}</span>
                    <h4 className="font-bold text-sm text-white">{b.roleTitle}</h4>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    From <strong>{b.recruiterName}</strong> @ {b.companyName}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono font-bold">
                    Target Comp: {b.compensationOffer}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 text-center shrink-0">
                  <span className="text-[9px] uppercase font-mono text-zinc-400 block">Inbound Bounty</span>
                  <span className="font-mono font-black text-sm text-emerald-400">+$250.00</span>
                </div>
              </div>

              <div className="rounded-xl bg-black/40 p-3 border border-white/10 text-zinc-300 text-[11px] leading-relaxed">
                "{b.message}"
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-400 font-mono">{b.date}</span>

                {b.status === 'Accepted & Paid' ? (
                  <span className="rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Bounty Claimed (+$250)
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 px-3 py-1.5 font-bold"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptBounty(b.id)}
                      className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-1.5 shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>Accept &amp; Claim $250 →</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
