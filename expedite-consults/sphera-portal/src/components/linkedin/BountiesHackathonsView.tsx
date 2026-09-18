"use client"

import React, { useState } from "react"
import {
  Trophy,
  DollarSign,
  ShieldCheck,
  GitPullRequest,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus
} from "lucide-react"
import {
  ENTERPRISE_BOUNTIES_DATA,
  EnterpriseBounty
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface BountiesHackathonsViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function BountiesHackathonsView({
  currentUser,
  onNavigateTab
}: BountiesHackathonsViewProps) {
  const [bounties, setBounties] = useState<EnterpriseBounty[]>(ENTERPRISE_BOUNTIES_DATA)
  const [selectedBounty, setSelectedBounty] = useState<EnterpriseBounty | null>(null)
  const [prUrl, setPrUrl] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmitPR = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prUrl.trim() || !selectedBounty) return

    setSubmitSuccess(true)
    setTimeout(() => {
      setSubmitSuccess(false)
      setSelectedBounty(null)
      setPrUrl("")
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/40 flex items-center gap-1.5 w-fit">
            <Trophy className="h-3.5 w-3.5 text-amber-300" />
            ConnectIn Enterprise Bounties &amp; Hackathon Escrow
          </span>
          <h1 className="text-2xl font-black text-white">
            Solve Hard Problems &amp; Earn Direct Escrow Payouts
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
            Enterprise sponsors deposit $15,000–$50,000 in escrow for zero-day mitigation, AI jailbreak defense, and automated OSCAL telemetry benchmarks.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('wallet')}
          className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 text-xs shadow-md transition-all shrink-0"
        >
          View My Wallet ($2,430) →
        </button>
      </div>

      {submitSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200">
          ✓ Pull Request successfully submitted to {selectedBounty?.company}! Automated regression test suite initiated.
        </div>
      )}

      {/* BOUNTIES LIST */}
      <div className="space-y-4">
        {bounties.map((bounty) => (
          <div
            key={bounty.id}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{bounty.companyLogo}</span>
                  <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                    {bounty.title}
                  </h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {bounty.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-semibold">
                  Sponsored by <strong>{bounty.company}</strong> · {bounty.deadline}
                </p>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
                  {bounty.description}
                </p>
              </div>

              {/* Reward Block */}
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-3.5 text-center min-w-[170px] shrink-0 space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Escrow Bounty</span>
                <p className="text-lg font-black text-amber-600 dark:text-amber-300">{bounty.bountyAmount}</p>
                <span className="text-[10px] text-zinc-500 block">{bounty.submissionsCount} Submissions</span>
              </div>
            </div>

            {/* Tags & Action CTA */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {bounty.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setSelectedBounty(bounty)}
                className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-4 py-1.5 text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <GitPullRequest className="h-3.5 w-3.5" />
                <span>Submit Solution PR →</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SUBMISSION MODAL DRAWER */}
      {selectedBounty && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-amber-500" />
            <span>Submit Solution for: {selectedBounty.title}</span>
          </h3>

          <form onSubmit={handleSubmitPR} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">GitHub Repository / PR Link</label>
              <input
                type="url"
                placeholder="https://github.com/danquah/mcp-firewall/pull/14"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBounty(null)}
                className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 font-bold shadow-xs"
              >
                Submit Solution for Evaluation ({selectedBounty.bountyAmount}) →
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
