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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-sm shadow-xs border border-emerald-200 dark:border-emerald-800">
              $
            </span>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Inbound Recruiter Compensation Bounties</span>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Escrow Protected
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Guaranteed Compensation for Professional Talent Screens</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {payoutClaimed && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-center animate-in zoom-in-95">
            ✓ Invitation Accepted! $250.00 transferred directly to your ConnectIn Wallet.
          </div>
        )}

        {/* Bounties List */}
        <div className="space-y-4">
          {bounties.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-5 space-y-3.5 shadow-xs text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{b.companyLogo}</span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{b.roleTitle}</h4>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                    From <strong>{b.recruiterName}</strong> · {b.companyName}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    Target Comp: {b.compensationOffer}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-center shrink-0">
                  <span className="text-[9px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 block">Inbound Reward</span>
                  <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">+$250.00</span>
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                "{b.message}"
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-400">{b.date}</span>

                {b.status === 'Accepted & Paid' ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Claimed (+$250)
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 px-3 py-1.5 font-semibold transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptBounty(b.id)}
                      className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold px-4 py-1.5 shadow-xs transition-colors flex items-center gap-1.5"
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
