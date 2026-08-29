"use client"

import React, { useState } from "react"
import {
  Sparkles,
  Bot,
  Zap,
  Check,
  RefreshCw,
  Send,
  Sliders,
  Layers,
  ArrowRight
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { generateAIPost, AITone, AIGeneratedResult } from "@/lib/ai-assistant"

interface AIPostModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyGeneratedContent: (content: string, hashtags: string[]) => void
}

export function AIPostModal({
  isOpen,
  onClose,
  onApplyGeneratedContent
}: AIPostModalProps) {
  const [topic, setTopic] = useState("")
  const [selectedTone, setSelectedTone] = useState<AITone>('thought_leader')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<AIGeneratedResult | null>(null)

  const quickTopics = [
    "Autonomous AI Defense Loops & Sandboxing",
    "Zero Trust Architecture on AWS & Kubernetes",
    "Next.js 16 & React Server Actions Performance",
    "Hiring Lead Cloud Security Architects",
    "Promotion to Principal Advisory Partner"
  ]

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsGenerating(true)

    setTimeout(() => {
      const result = generateAIPost(topic, selectedTone)
      setGeneratedResult(result)
      setIsGenerating(false)
    }, 600)
  }

  const handleApply = () => {
    if (generatedResult) {
      onApplyGeneratedContent(generatedResult.content, generatedResult.hashtags)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="border-b border-zinc-200 bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 text-white dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-xs">
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                ConnectIn AI Post Assistant
              </DialogTitle>
              <p className="text-xs text-sky-200">
                Draft viral, professional LinkedIn posts in seconds with Google Gemini intelligence.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Topic Input */}
          <div>
            <label className="font-bold text-zinc-800 dark:text-zinc-200">
              What topic or idea would you like to post about?
            </label>
            <input
              type="text"
              placeholder="e.g. Scaling Zero Trust microservices or Team Milestone..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Quick Topic Chips */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-500 mb-1.5">
              Or pick a popular industry prompt:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickTopics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-sky-100 hover:text-[#0A66C2] transition-colors dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="font-bold text-zinc-800 dark:text-zinc-200">
              Select Tone & Target Audience
            </label>
            <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'thought_leader', label: '🚀 Thought Leader', desc: 'Inspiring & Engaging' },
                { id: 'technical', label: '⚡ Technical Deep-Dive', desc: 'Code & Architecture' },
                { id: 'executive', label: '📊 Executive Brief', desc: 'C-Suite & Board ROI' },
                { id: 'hiring', label: '📢 Hiring Announcement', desc: 'Talent Acquisition' },
                { id: 'celebration', label: '🎉 Team Milestone', desc: 'Awards & Culture' }
              ].map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setSelectedTone(tone.id as AITone)}
                  className={`rounded-lg border p-2.5 text-left transition-all ${
                    selectedTone === tone.id
                      ? "border-[#0A66C2] bg-sky-50 dark:bg-sky-950/40 text-[#0A66C2]"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-bold text-xs">{tone.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{tone.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0A66C2] to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-[#004182] hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" /> Generate Post with AI
                </>
              )}
            </button>
          </div>

          {/* Generated Result Preview Box */}
          {generatedResult && (
            <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/20 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0A66C2] flex items-center gap-1.5">
                  <Bot className="h-4 w-4" /> AI Generated Draft
                </span>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800"
                >
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </button>
              </div>

              <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed bg-white/70 dark:bg-zinc-900/70 p-3 rounded-lg border border-sky-100 dark:border-sky-950">
                {generatedResult.content}
              </p>

              <div className="flex flex-wrap gap-1">
                {generatedResult.hashtags.map((h, i) => (
                  <span key={i} className="text-[11px] font-semibold text-[#0A66C2]">
                    {h}
                  </span>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182] shadow-xs"
                >
                  <Check className="h-3.5 w-3.5" /> Insert into Post
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
