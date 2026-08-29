"use client"

import React, { useState } from "react"
import {
  Rocket,
  DollarSign,
  TrendingUp,
  MapPin,
  Building,
  Send,
  Sparkles,
  Percent,
  CheckCircle,
  Plus,
  Briefcase,
  Users,
  Check
} from "lucide-react"
import { startupJobsData, StartupJobItem } from "@/lib/nextgen-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface StartupVentureViewProps {
  currentUser: UserProfile
}

export function StartupVentureView({ currentUser }: StartupVentureViewProps) {
  const [startups, setStartups] = useState<StartupJobItem[]>(startupJobsData)
  const [selectedStage, setSelectedStage] = useState<string>("All")
  const [pitchStartup, setPitchStartup] = useState<StartupJobItem | null>(null)
  const [pitchText, setPitchText] = useState("")
  const [isPitchSent, setIsPitchSent] = useState(false)

  const stages = ["All", "Seed", "Series A", "Series B", "Bootstrapped"]

  const handleSendPitch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsPitchSent(true)
  }

  const handleClose = () => {
    setPitchStartup(null)
    setPitchText("")
    setIsPitchSent(false)
  }

  const filtered = startups.filter(
    s => selectedStage === "All" || s.fundingStage === selectedStage
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-violet-950 via-purple-950 to-slate-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-purple-400/20 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-400/40 flex items-center gap-1.5 w-fit">
              <Rocket className="h-3.5 w-3.5 text-purple-300" /> ConnectIn Venture & Startup Matchmaker
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              High-Growth Startups, Equity Grants & Direct Founder InMail
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-purple-200 max-w-xl">
              Discover breakout VC-backed ventures, transparent equity ranges, and pitch directly to founders without recruiter gatekeepers.
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-xs text-center border border-white/10 min-w-[170px]">
            <p className="text-[11px] text-purple-200 uppercase tracking-wider font-semibold">
              Equity Transparency
            </p>
            <p className="text-xl font-bold text-purple-300 mt-0.5">
              1.0% - 4.0% Ranges
            </p>
          </div>
        </div>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {stages.map((stg) => (
          <button
            key={stg}
            onClick={() => setSelectedStage(stg)}
            className={`rounded-full px-4 py-1.5 transition-all ${
              selectedStage === stg
                ? "bg-purple-600 text-white font-bold shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
            }`}
          >
            {stg}
          </button>
        ))}
      </div>

      {/* Startup Job Cards */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-purple-500/50 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={item.companyLogo}
                  alt={item.companyName}
                  className="h-12 w-12 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                />
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {item.roleTitle}
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                      {item.fundingStage}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500">{item.companyName} · {item.totalRaised} · {item.workplace}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {item.salaryRange}
                </span>
                <span className="rounded-full bg-purple-50 px-3 py-1 font-mono text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  {item.equityRange}
                </span>
              </div>
            </div>

            {/* Founder Pitch Box */}
            <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3">
              <img
                src={item.founderAvatar}
                alt={item.founderName}
                className="h-9 w-9 rounded-full object-cover shrink-0 ring-1 ring-purple-500"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  Founder Note from {item.founderName}:
                </span>
                <p className="text-zinc-600 dark:text-zinc-300 italic">
                  &ldquo;{item.founderPitch}&rdquo;
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                100% Direct to Founder InMail · No recruiter gatekeeper
              </span>

              <button
                onClick={() => setPitchStartup(item)}
                className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-1.5 text-xs font-bold text-white hover:from-purple-700 hover:to-indigo-700 shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Pitch Direct to Founder
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Pitch Modal */}
      <Dialog open={Boolean(pitchStartup)} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-xl">
          {pitchStartup && !isPitchSent && (
            <>
              <DialogHeader className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <img
                    src={pitchStartup.founderAvatar}
                    alt={pitchStartup.founderName}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500"
                  />
                  <div>
                    <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Pitch Directly to {pitchStartup.founderName}
                    </DialogTitle>
                    <p className="text-xs text-zinc-500">{pitchStartup.roleTitle} @ {pitchStartup.companyName}</p>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleSendPitch} className="p-6 space-y-4 text-xs">
                <div className="rounded-lg bg-purple-50/70 p-3 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300">
                  <p className="font-bold">✨ CareerTwin™ Auto-Attached Artifacts:</p>
                  <p className="text-[11px] mt-0.5 text-purple-700 dark:text-purple-400">
                    Your verified <strong>Veritas Proof™ Architecture Sandbox</strong> and GitHub contribution heatmap will be bundled with this pitch.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200">
                    Why are you the ideal founding architect for {pitchStartup.companyName}?
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your background scaling zero-trust architectures and why you're energized by their mission..."
                    value={pitchText}
                    onChange={(e) => setPitchText(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white p-3 text-zinc-900 focus:border-purple-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full px-4 py-1.5 font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-purple-600 px-6 py-1.5 font-bold text-white hover:bg-purple-700 shadow-xs"
                  >
                    Send Direct Pitch
                  </button>
                </div>
              </form>
            </>
          )}

          {pitchStartup && isPitchSent && (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Direct Pitch Delivered!
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Your pitch and interactive architecture sandbox have been delivered directly to <span className="font-bold text-zinc-800 dark:text-zinc-200">{pitchStartup.founderName}&apos;s</span> personal priority inbox.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="rounded-full bg-purple-600 px-6 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
