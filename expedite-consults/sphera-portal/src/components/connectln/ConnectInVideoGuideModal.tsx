"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Play,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Layers,
  FileText,
  Bot,
  Share2,
  X
} from "lucide-react"
import { ONBOARDING_GUIDE_CHAPTERS, OnboardingGuideChapter } from "@/lib/connectin-videos"

interface ConnectInVideoGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigateTab?: (tab: string) => void
  onOpenResumeBuilder?: () => void
  onOpenAIAssistant?: () => void
  onSelectWorkspace?: (ws: 'personal' | 'enterprise' | 'creator' | 'seller') => void
}

export function ConnectInVideoGuideModal({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenResumeBuilder,
  onOpenAIAssistant,
  onSelectWorkspace
}: ConnectInVideoGuideModalProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0)
  const currentChapter = ONBOARDING_GUIDE_CHAPTERS[activeChapterIndex] || ONBOARDING_GUIDE_CHAPTERS[0]

  const handleFeatureAction = () => {
    onClose()
    if (currentChapter.id === "ch-enclaves") {
      if (onNavigateTab) onNavigateTab("home")
    } else if (currentChapter.id === "ch-resume") {
      if (onOpenResumeBuilder) onOpenResumeBuilder()
      else if (onNavigateTab) onNavigateTab("profile")
    } else if (currentChapter.id === "ch-workspaces") {
      if (onSelectWorkspace) onSelectWorkspace("enterprise")
    } else if (currentChapter.id === "ch-vibe") {
      if (onOpenAIAssistant) onOpenAIAssistant()
    } else if (currentChapter.id === "ch-sharing") {
      if (onNavigateTab) onNavigateTab("home")
    }
  }

  const getChapterIcon = (id: string) => {
    switch (id) {
      case "ch-enclaves":
        return <ShieldCheck className="h-4 w-4" />
      case "ch-resume":
        return <FileText className="h-4 w-4" />
      case "ch-workspaces":
        return <Layers className="h-4 w-4" />
      case "ch-vibe":
        return <Bot className="h-4 w-4" />
      default:
        return <Share2 className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl p-0 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-linear-to-tr from-indigo-600 to-[#0A66C2] text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>ConnectIn Masterclass & User Video Guide</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300/40">
                    Interactive Tour
                  </span>
                </DialogTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Step-by-step video walkthrough of Enclaves, AI Resume Auto-Build, Workspaces, and Vibe AI.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Content Body: Left Chapter Rail + Right Video & Description */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          {/* Chapter Navigation Rail */}
          <div className="md:col-span-4 border-r border-zinc-100 dark:border-zinc-800 p-3 sm:p-4 space-y-2 bg-zinc-50/40 dark:bg-zinc-900/30">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 px-2">
              Guide Chapters (5 Lessons)
            </p>
            <div className="space-y-1">
              {ONBOARDING_GUIDE_CHAPTERS.map((ch, idx) => {
                const isActive = idx === activeChapterIndex
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                      isActive
                        ? "bg-[#0A66C2] text-white shadow-sm"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isActive ? "bg-white/20 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                    }`}>
                      {getChapterIcon(ch.id)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-mono font-bold ${
                          isActive ? "text-white/80" : "text-zinc-400"
                        }`}>
                          Part 0{ch.stepNumber}
                        </span>
                        <span className={`text-[10px] font-medium ${
                          isActive ? "text-white/80" : "text-zinc-400"
                        }`}>
                          ⏱ {ch.duration}
                        </span>
                      </div>
                      <p className="text-xs font-bold leading-snug truncate mt-0.5">
                        {ch.title}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Quick Tip Box */}
            <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1 mt-4">
              <p className="font-bold flex items-center gap-1 text-[11px]">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Hands-On Learning</span>
              </p>
              <p className="text-[10px] text-amber-800 dark:text-amber-300/80 leading-relaxed">
                Click any chapter's action button below to instantly trigger that real feature in your ConnectIn workspace.
              </p>
            </div>
          </div>

          {/* Video Player & Chapter Details */}
          <div className="md:col-span-8 p-4 sm:p-6 space-y-4 overflow-y-auto">
            {/* 16:9 Video Embed */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-zinc-200 dark:border-zinc-800">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentChapter.youtubeId}?rel=0&modestbranding=1`}
                title={currentChapter.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>

            {/* Title and Subtitle */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                  Chapter {currentChapter.stepNumber} of 5
                </span>
                <span className="text-xs text-zinc-400">⏱ {currentChapter.duration}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {currentChapter.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {currentChapter.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {currentChapter.description}
            </p>

            {/* Highlights List */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Key Platform Capabilities</span>
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                {currentChapter.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#0A66C2] font-bold mt-0.5">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  if (activeChapterIndex > 0) {
                    setActiveChapterIndex(activeChapterIndex - 1)
                  }
                }}
                disabled={activeChapterIndex === 0}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                ← Previous Chapter
              </button>

              <div className="flex items-center gap-2">
                {currentChapter.featureActionLabel && (
                  <button
                    type="button"
                    onClick={handleFeatureAction}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0A66C2] hover:bg-[#084e96] text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <span>{currentChapter.featureActionLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}

                {activeChapterIndex < ONBOARDING_GUIDE_CHAPTERS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveChapterIndex(activeChapterIndex + 1)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Next Chapter →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                  >
                    Finish Guide ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
