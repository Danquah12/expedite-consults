"use client"

import React, { useState } from "react"
import {
  Code,
  Star,
  GitFork,
  GitCommit,
  ShieldCheck,
  Briefcase,
  Users,
  Terminal,
  ArrowRight,
  ExternalLink,
  Plus
} from "lucide-react"
import {
  DEVELOPER_REPOSITORIES_DATA,
  DeveloperRepository
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface DeveloperCodeViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function DeveloperCodeView({
  currentUser,
  onNavigateTab
}: DeveloperCodeViewProps) {
  const [repos, setRepos] = useState<DeveloperRepository[]>(DEVELOPER_REPOSITORIES_DATA)

  const toggleStar = (repoId: string) => {
    setRepos(prev =>
      prev.map(r => (r.id === repoId ? { ...r, stars: r.stars + 1 } : r))
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-[#0A66C2] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 w-fit">
            <Code className="h-3.5 w-3.5 text-[#0A66C2]" />
            ConnectIn Code &amp; Repositories
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Developer Projects &amp; Open Source Repositories
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
            Explore verified codebases, open-source repositories, and technical contributions showcased by developers and engineers.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('profile')}
          className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold px-4 py-2.5 text-xs shadow-xs transition-colors shrink-0"
        >
          View Full Portfolio →
        </button>
      </div>

      {/* REPOSITORIES LIST */}
      <div className="space-y-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-mono font-bold text-[#0A66C2] hover:underline cursor-pointer">
                    {repo.name}
                  </span>
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    Public Enclave
                  </span>
                  {repo.isVerifiedProject && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified Architecture
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {repo.description}
                </p>
              </div>

              {/* Action Cluster (Star, Fork) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleStar(repo.id)}
                  className="rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
                >
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>Star ({repo.stars})</span>
                </button>
                <button
                  className="rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
                >
                  <GitFork className="h-3.5 w-3.5" />
                  <span>Fork ({repo.forks})</span>
                </button>
              </div>
            </div>

            {/* Meta bar & Linked Requisition */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-zinc-500 font-mono text-[11px] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: repo.languageColor }} />
                  <strong className="text-zinc-700 dark:text-zinc-300">{repo.language}</strong>
                </span>
                <span>{repo.lastCommit}</span>
                <span>{repo.contributorsCount} Contributors</span>
              </div>

              {repo.connectedJobRole && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">Recruiting:</span>
                  <button
                    onClick={() => onNavigateTab('jobs')}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 transition-colors"
                  >
                    💼 {repo.connectedJobRole} →
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
