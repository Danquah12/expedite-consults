"use client"

import React from "react"
import {
  Github,
  Flame,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
  Radio,
  Award,
  Globe,
  Terminal,
  ShieldCheck,
  CheckCircle2
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"

interface BentoPortfolioViewProps {
  user: UserProfile
}

export function BentoPortfolioView({ user }: BentoPortfolioViewProps) {
  // Simulated 52-week GitHub commit activity array
  const weeks = Array.from({ length: 36 }, (_, i) =>
    Array.from({ length: 7 }, (_, j) => {
      const rand = (i * 7 + j) % 11
      if (rand > 8) return 3 // Dark green
      if (rand > 5) return 2 // Med green
      if (rand > 2) return 1 // Light green
      return 0 // Empty
    })
  )

  const techStack = [
    { name: "Next.js 16 / React 19", level: "Staff Level", color: "bg-black text-white" },
    { name: "Zero Trust Architecture", level: "Principal", color: "bg-blue-600 text-white" },
    { name: "AWS Firecracker MicroVMs", level: "Principal", color: "bg-amber-600 text-white" },
    { name: "eBPF Kernel Probes", level: "Senior Staff", color: "bg-emerald-600 text-white" },
    { name: "TypeScript & Rust", level: "Expert", color: "bg-indigo-600 text-white" },
    { name: "Kubernetes & Cilium", level: "Expert", color: "bg-sky-600 text-white" }
  ]

  return (
    <div className="space-y-4">
      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* CARD 1: Identity & Bio (Col 7) */}
        <div className="md:col-span-7 rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-sky-50/30 to-blue-50/40 p-6 shadow-xs dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-850 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[#0A66C2]/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </h2>
                <ShieldCheck className="h-5 w-5 text-[#0A66C2]" />
              </div>
              <p className="text-xs font-semibold text-[#0A66C2] mt-0.5">
                {user.headline.split('|')[0]}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {user.location} · {user.connectionsCount}+ connections
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {user.about}
          </p>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> #OPEN_TO_WORK (Staff/Principal)
            </span>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-[#0A66C2] dark:bg-sky-950 dark:text-sky-300">
              ⚡ Top 1% Architecture Reviewer
            </span>
          </div>
        </div>

        {/* CARD 2: Tech Stack Badges (Col 5) */}
        <div className="md:col-span-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-[#0A66C2]" /> Core Tech Stack
            </span>
            <span className="text-[10px] text-zinc-400">Verified by Git Commits</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-850 flex-1 min-w-[120px]"
              >
                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-[11px]">
                  {tech.name}
                </p>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">{tech.level}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD 3: Live GitHub Contribution Heatmap */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Github className="h-4 w-4" /> 1,482 Contributions in the last year
          </span>
          <span className="text-[11px] text-emerald-600 font-bold">github.com/alex-taylor-sec</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1 min-w-[600px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((lvl, dIdx) => (
                  <div
                    key={dIdx}
                    className={`h-3 w-3 rounded-xs transition-colors ${
                      lvl === 3
                        ? "bg-emerald-600"
                        : lvl === 2
                        ? "bg-emerald-400"
                        : lvl === 1
                        ? "bg-emerald-200 dark:bg-emerald-800"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
          <span>Jan 2025</span>
          <span>Aug 2025</span>
          <span>Jan 2026</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            <div className="h-2 w-2 rounded-xs bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-2 w-2 rounded-xs bg-emerald-200 dark:bg-emerald-800" />
            <div className="h-2 w-2 rounded-xs bg-emerald-400" />
            <div className="h-2 w-2 rounded-xs bg-emerald-600" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* CARD 4 & 5 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Featured Micro-App Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A66C2]">
            🚀 Featured Launch
          </span>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            VeritasLens: Kernel Observability Engine
          </h4>
          <p className="text-xs text-zinc-500">
            Built on eBPF and Cilium. #1 on ConnectIn Launchpad with 342 upvotes.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
              ▲ 342 Upvotes on Launchpad
            </span>
          </div>
        </div>

        {/* Currently Listening to Audio Podcast Card */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-950 text-white p-5 shadow-xs dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-red-400 font-bold">
              <Radio className="h-3.5 w-3.5 animate-pulse" /> Currently Listening
            </span>
            <span>Spotify API Sync</span>
          </div>
          <h4 className="font-bold text-sm text-white">
            Latent Space: Autonomous AI Agents in Production
          </h4>
          <p className="text-xs text-zinc-400">
            Episode 84 · Swyx & Alessio Fanelli with Harrison Chase
          </p>
        </div>
      </div>
    </div>
  )
}
