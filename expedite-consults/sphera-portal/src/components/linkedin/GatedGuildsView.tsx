"use client"

import React, { useState } from "react"
import {
  ShieldCheck,
  Lock,
  Users,
  DollarSign,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2
} from "lucide-react"
import {
  GATED_GUILDS_DATA,
  GatedGuild
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface GatedGuildsViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function GatedGuildsView({
  currentUser,
  onNavigateTab
}: GatedGuildsViewProps) {
  const [guilds, setGuilds] = useState<GatedGuild[]>(GATED_GUILDS_DATA)
  const [activeGuild, setActiveGuild] = useState<GatedGuild | null>(guilds[0])

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-400/40 flex items-center gap-1.5 w-fit">
            <Lock className="h-3.5 w-3.5 text-amber-300" />
            ConnectIn Token &amp; Clearance-Gated Guilds
          </span>
          <h1 className="text-2xl font-black text-white">
            High-Signal Professional Enclaves
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
            Cryptographically gated roundtables for TS/SCI Cleared CISOs, Series A+ AI Founders, and Staff Kernel Engineers with shared group treasuries.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('collaboration')}
          className="rounded-xl bg-white text-zinc-950 font-black px-4 py-2.5 text-xs shadow-md hover:bg-zinc-100 shrink-0"
        >
          Explore Ideas Incubator →
        </button>
      </div>

      {/* GUILDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {guilds.map((guild) => (
          <div
            key={guild.id}
            onClick={() => setActiveGuild(guild)}
            className={`rounded-2xl border p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
              activeGuild?.id === guild.id
                ? "border-indigo-500 bg-white dark:bg-zinc-900 ring-2 ring-indigo-500/20"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-2xl shadow-xs">
                  {guild.badgeIcon}
                </div>
                {guild.isMember ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Verified Member
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                    <Lock className="h-3 w-3" /> Verification Req.
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {guild.name}
                </h3>
                <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                  Req: {guild.entryRequirement}
                </p>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {guild.description}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>{guild.membersCount} Peers</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{guild.treasuryBalance}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE GUILD CONFIDENTIAL WORKSPACE */}
      {activeGuild && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeGuild.badgeIcon}</span>
              <div>
                <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{activeGuild.name}</span>
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                    Private Enclave
                  </span>
                </h3>
                <p className="text-xs text-zinc-500">Group Treasury: <strong className="text-emerald-600">{activeGuild.treasuryBalance}</strong> · {activeGuild.activeDiscussions} Active Technical Threads</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('messaging')}
              className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold px-4 py-2 text-xs shadow-xs transition-colors shrink-0"
            >
              Enter Live Enclave War Room 💬
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] font-mono">Active Guild Solicitations &amp; Collaborative RFPs:</p>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Collaborative RFP: Joint AWS GovCloud ATO Defense Syndicate</h4>
                <p className="text-[11px] text-zinc-500">Pooling 4 verified Fellows to submit a joint $140,000 cATO readiness proposal.</p>
              </div>
              <button
                onClick={() => onNavigateTab('procurement')}
                className="rounded-lg bg-white dark:bg-zinc-700 px-3 py-1.5 font-bold text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 text-xs hover:bg-zinc-100"
              >
                Join Syndicate →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
