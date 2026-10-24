"use client"

import React, { useState } from "react"
import {
  FileText,
  Sparkles,
  Rocket,
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Award,
  Sliders,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"

interface CareerSuiteViewProps {
  currentUser: UserProfile
}

export function CareerSuiteView({ currentUser }: CareerSuiteViewProps) {
  const [iframeKey, setIframeKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[80] bg-zinc-950/95 p-3 sm:p-5 flex flex-col gap-3 overflow-y-auto"
          : "mx-auto max-w-7xl space-y-4 pb-12"
      }
    >
      {/* Header Banner */}
      <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-800/70 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-sky-50/90 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-sky-950/40 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Expedite CareerSuite™ Live Studio
              </span>
              <span className="text-[11px] font-mono font-semibold text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-zinc-900/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                https://tuhousing.vercel.app/
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              AI Resume Preparation, Tailoring &amp; Profile Maximizer ({currentUser?.name || "Verified Member"})
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Corporate &amp; Federal USAJOBS KSAs · ATS Fit Score · Profile Maximizer · Job Tracker · .DOCX Export
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setIframeKey((prev) => prev + 1)}
              className="rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reload App</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              {isFullscreen ? "Exit Fullscreen" : "⛶ Expand Fullscreen"}
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Live Resume Preparation App (https://tuhousing.vercel.app/) */}
      <div
        className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-lg bg-white dark:bg-zinc-900 ${
          isFullscreen ? "flex-1 min-h-[78vh]" : "h-[840px]"
        }`}
      >
        <iframe
          key={iframeKey}
          src="https://tuhousing.vercel.app/"
          title="Expedite CareerSuite — AI-Powered Resume Preparation & Tailoring App (https://tuhousing.vercel.app/)"
          className="w-full h-full border-0"
          allow="camera; microphone; clipboard-write; clipboard-read; downloads"
        />
      </div>
    </div>
  )
}
