"use client"

import React, { useState } from "react"
import {
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Sliders,
  Check,
  RefreshCw,
  Target
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PostImpactSimulatorProps {
  isOpen: boolean
  onClose: () => void
  currentContent: string
  onApplyPolishedContent: (polished: string) => void
}

export function PostImpactSimulator({
  isOpen,
  onClose,
  currentContent,
  onApplyPolishedContent
}: PostImpactSimulatorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [polishedVersion, setPolishedVersion] = useState<string | null>(null)

  // Dynamic calculations based on content
  const wordCount = currentContent.trim().split(/\s+/).filter(Boolean).length
  const hasHashtags = currentContent.includes('#')
  const hasBullets = currentContent.includes('•') || currentContent.includes('1️⃣') || currentContent.includes('-') || currentContent.includes('🔹')
  const hasQuestion = currentContent.includes('?')

  // Compute Scores
  const resonanceScore = Math.min(98, Math.max(62, (wordCount > 30 ? 25 : 10) + (hasHashtags ? 20 : 5) + (hasBullets ? 30 : 10) + (hasQuestion ? 20 : 5)))
  const hookStrength = wordCount > 15 ? 94 : 68
  const estimatedImpressions = (resonanceScore * 340).toLocaleString() + " - " + ((resonanceScore + 15) * 580).toLocaleString()

  const handleDeCringe = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      const deCringed = currentContent
        .replace(/I am extremely humbled and honored to announce that/gi, "Excited to share that")
        .replace(/synergy/gi, "operational alignment")
        .replace(/paradigm shift/gi, "fundamental architectural change")
        .replace(/game changer/gi, "10x efficiency multiplier")
        + (hasQuestion ? "" : "\n\nWhat is your team's perspective on this? Drop your thoughts below 👇")

      setPolishedVersion(deCringed)
      setIsAnalyzing(false)
    }, 500)
  }

  const handleApply = () => {
    if (polishedVersion) {
      onApplyPolishedContent(polishedVersion)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="border-b border-zinc-200 bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 px-6 py-4 text-white dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-xs">
              <Target className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                Pre-Flight Post Virality & Impact Simulator
              </DialogTitle>
              <p className="text-xs text-sky-200">
                Predict executive resonance, feed distribution, and polish your draft before posting.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Main Score Meters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-center dark:border-sky-900 dark:bg-sky-950/30">
              <p className="text-2xl font-black text-[#0A66C2]">
                {resonanceScore}%
              </p>
              <p className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5">
                Executive Resonance
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="text-2xl font-black text-emerald-600">
                {hookStrength}/100
              </p>
              <p className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5">
                Hook Strength
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-center dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-xl font-black text-amber-600 truncate">
                Grade 9
              </p>
              <p className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5">
                Readability Level
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-center dark:border-purple-900 dark:bg-purple-950/30">
              <p className="text-xl font-black text-purple-600">
                Top 5%
              </p>
              <p className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5">
                Feed Distribution
              </p>
            </div>
          </div>

          {/* Distribution Insights */}
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-850 space-y-2 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-[#0A66C2]" />
                Estimated 48h Organic Reach
              </span>
              <span className="font-bold text-[#0A66C2]">{estimatedImpressions} views</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-600" />
                Optimal Publishing Window
              </span>
              <span className="font-bold text-emerald-600">Tuesday · 8:30 AM EST</span>
            </div>
          </div>

          {/* Virality Checklist */}
          <div className="space-y-2">
            <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              Pre-Flight Optimization Checklist
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${hasBullets ? "text-emerald-500" : "text-zinc-300"}`} />
                <span className={hasBullets ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400"}>
                  Structured bullet hierarchy for executive scanability
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${hasQuestion ? "text-emerald-500" : "text-zinc-300"}`} />
                <span className={hasQuestion ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400"}>
                  Engaging question / Call to Action at conclusion
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${hasHashtags ? "text-emerald-500" : "text-zinc-300"}`} />
                <span className={hasHashtags ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400"}>
                  Targeted industry hashtags (3-5 recommended)
                </span>
              </div>
            </div>
          </div>

          {/* "De-Cringe" Enhancer CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDeCringe}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> De-Cringing & Polishing Voice...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-white" /> Polish Tone & Remove Buzzwords (De-Cringe)
                </>
              )}
            </button>
          </div>

          {/* Polished Preview */}
          {polishedVersion && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2 animate-in fade-in">
              <span className="font-bold text-xs text-emerald-700 dark:text-emerald-300">
                ✨ Polished High-Conviction Draft:
              </span>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed bg-white/70 dark:bg-zinc-900/70 p-3 rounded-lg border border-emerald-100">
                {polishedVersion}
              </p>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  <Check className="h-3.5 w-3.5" /> Apply Polished Draft
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
