"use client"

import React, { useState, useMemo } from "react"
import {
  Sparkles,
  Bot,
  Check,
  RefreshCw,
  Send
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  generateAIPost,
  getProfessionAITopics,
  AITone,
  AIGeneratedResult
} from "@/lib/ai-assistant"
import { UserProfile } from "@/lib/connectln-data"

interface AIPostModalProps {
  isOpen: boolean
  onClose: () => void
  user?: UserProfile
  onApplyGeneratedContent: (
    content: string,
    hashtags: string[],
    extra?: {
      suggestedPollQuestion?: string
      suggestedPollOptions?: string[]
      suggestedCelebration?: AIGeneratedResult["suggestedCelebration"]
    }
  ) => void
  onPublishDirect?: (
    content: string,
    hashtags: string[],
    extra?: {
      suggestedPollQuestion?: string
      suggestedPollOptions?: string[]
      suggestedCelebration?: AIGeneratedResult["suggestedCelebration"]
    }
  ) => void
}

export function AIPostModal({
  isOpen,
  onClose,
  user,
  onApplyGeneratedContent,
  onPublishDirect
}: AIPostModalProps) {
  const [topic, setTopic] = useState("")
  const [selectedTone, setSelectedTone] = useState<AITone>('thought_leader')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<AIGeneratedResult | null>(null)
  const [editableDraft, setEditableDraft] = useState("")

  const quickTopics = useMemo(
    () => getProfessionAITopics(user?.profession, user?.professionEnclave),
    [user?.profession, user?.professionEnclave]
  )

  const handleGenerate = (overrideTopic?: string, overrideTone?: AITone) => {
    const activeTopic = overrideTopic !== undefined ? overrideTopic : topic
    const activeTone = overrideTone !== undefined ? overrideTone : selectedTone
    setIsGenerating(true)

    setTimeout(() => {
      const result = generateAIPost(activeTopic, activeTone, {
        name: user?.name,
        profession: user?.profession,
        headline: user?.headline
      })
      setGeneratedResult(result)
      setEditableDraft(result.content)
      setIsGenerating(false)
    }, 350)
  }

  const handleApplyToComposer = () => {
    if (!generatedResult) return
    onApplyGeneratedContent(editableDraft.trim() || generatedResult.content, generatedResult.hashtags, {
      suggestedPollQuestion: generatedResult.suggestedPollQuestion,
      suggestedPollOptions: generatedResult.suggestedPollOptions,
      suggestedCelebration: generatedResult.suggestedCelebration
    })
    onClose()
  }

  const handleDirectPost = () => {
    if (!generatedResult) return
    if (onPublishDirect) {
      onPublishDirect(editableDraft.trim() || generatedResult.content, generatedResult.hashtags, {
        suggestedPollQuestion: generatedResult.suggestedPollQuestion,
        suggestedPollOptions: generatedResult.suggestedPollOptions,
        suggestedCelebration: generatedResult.suggestedCelebration
      })
      onClose()
    } else {
      handleApplyToComposer()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="border-b border-zinc-200 dark:border-zinc-800 bg-[#1B1F23] dark:bg-[#14181B] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A66C2]/20 border border-[#0A66C2]/40 text-[#70B5F9]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-white">
                ConnectLn AI Post Assistant
              </DialogTitle>
              <p className="text-xs text-zinc-400">
                Tailored for {user?.profession || "Verified Professionals"} · Draft posts, milestones &amp; polls in seconds
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          {/* Topic Input */}
          <div>
            <label className="font-bold text-zinc-800 dark:text-zinc-200">
              What topic, project, or milestone would you like to write about?
            </label>
            <input
              type="text"
              placeholder={`e.g. ${quickTopics[0] || "Key lessons from our latest project delivery"}...`}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Quick Profession-Aware Topic Chips */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-500 mb-1.5">
              Or tap a prompt tailored to your profession ({user?.profession || "ConnectLn"}):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickTopics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTopic(t)
                    handleGenerate(t, selectedTone)
                  }}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    topic === t
                      ? "bg-[#0A66C2] text-white font-semibold"
                      : "bg-zinc-100 text-zinc-700 hover:bg-sky-100 hover:text-[#0A66C2] dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tone & Format Selector */}
          <div>
            <label className="font-bold text-zinc-800 dark:text-zinc-200">
              Select Format &amp; Tone
            </label>
            <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'thought_leader', label: '🚀 Thought Leader', desc: 'Field Insights & Hook' },
                { id: 'technical', label: '⚡ Craft & Specs', desc: 'Standards & Checklist' },
                { id: 'executive', label: '📊 Project Brief', desc: 'ROI & Client Delivery' },
                { id: 'hiring', label: '📢 Hiring / Crew Call', desc: 'Recruit Talent & Bids' },
                { id: 'celebration', label: '🎉 Milestone Win', desc: 'Celebrate Great Work' },
                { id: 'poll_builder', label: '☑️ AI Poll + Post', desc: 'Auto-Builds 4-Option Poll' }
              ].map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => {
                    const nextTone = tone.id as AITone
                    setSelectedTone(nextTone)
                    handleGenerate(topic, nextTone)
                  }}
                  className={`rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
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
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0A66C2] hover:bg-[#004182] py-2.5 text-xs font-bold text-white shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating AI Draft...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" /> Generate Post with AI
                </>
              )}
            </button>
          </div>

          {/* Generated Result Editable Preview Box */}
          {generatedResult && (
            <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0A66C2] flex items-center gap-1.5">
                  <Bot className="h-4 w-4" /> AI Draft Ready (Editable)
                </span>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  className="flex items-center gap-1 text-[11px] font-semibold text-zinc-600 hover:text-[#0A66C2] cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </button>
              </div>

              <textarea
                rows={6}
                value={editableDraft}
                onChange={(e) => setEditableDraft(e.target.value)}
                className="w-full rounded-lg border border-sky-200 dark:border-sky-900 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed focus:outline-none focus:border-[#0A66C2]"
              />

              {generatedResult.suggestedPollQuestion && (
                <div className="rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 p-2.5 text-[11px] space-y-1">
                  <p className="font-bold text-indigo-900 dark:text-indigo-300">
                    ☑️ Attached AI Poll: {generatedResult.suggestedPollQuestion}
                  </p>
                  <p className="text-indigo-700 dark:text-indigo-400">
                    Options: {(generatedResult.suggestedPollOptions || []).join(" · ")}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {generatedResult.hashtags.map((h, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white dark:bg-zinc-800 border border-sky-200 dark:border-zinc-700 px-2.5 py-0.5 text-[11px] font-semibold text-[#0A66C2]"
                  >
                    {h}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={handleApplyToComposer}
                  className="flex items-center gap-1.5 rounded-full border border-[#0A66C2] bg-white dark:bg-zinc-900 px-4 py-2 font-bold text-[#0A66C2] hover:bg-sky-50 transition-colors cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" /> Edit in Composer
                </button>
                <button
                  type="button"
                  onClick={handleDirectPost}
                  className="flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182] shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> Publish Directly to Feed
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
