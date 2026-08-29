"use client"

import React, { useState } from "react"
import {
  Image as ImageIcon,
  Calendar,
  Sparkles,
  FileText,
  Smile,
  Globe,
  Users,
  X,
  Send,
  Plus,
  Vote,
  Award,
  BookOpen
} from "lucide-react"
import { UserProfile, Post, PollData } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AIPostModal } from "./AIPostModal"
import { PostImpactSimulator } from "./PostImpactSimulator"

interface PostCreatorProps {
  user: UserProfile
  onAddPost: (post: Omit<Post, 'id' | 'timestamp' | 'stats' | 'comments'>) => void
}

export function PostCreator({ user, onAddPost }: PostCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [activeMode, setActiveMode] = useState<'standard' | 'poll' | 'celebrate' | 'document'>('standard')
  const [content, setContent] = useState("")
  const [selectedVisibility, setSelectedVisibility] = useState<'Public' | 'Connections'>('Public')
  const [mediaUrl, setMediaUrl] = useState("")
  const [showMediaInput, setShowMediaInput] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Poll Form State
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""])
  const [pollDuration, setPollDuration] = useState("1 week")

  // Celebration Form State
  const [celebrationBadge, setCelebrationBadge] = useState("🎉")
  const [celebrationHeadline, setCelebrationHeadline] = useState("Started a new position at Expedite Consults")

  // Document Form State
  const [docTitle, setDocTitle] = useState("Cloud_Security_Zero_Trust_Blueprint_2026.pdf")
  const [slide1Title, setSlide1Title] = useState("01 / Ephemeral Sandbox Containers")
  const [slide1Content, setSlide1Content] = useState("Execute all untrusted agent tool invocations in isolated microVMs.")

  const suggestedHashtags = [
    '#CyberSecurity',
    '#CloudArchitecture',
    '#Nextjs',
    '#AI',
    '#ZeroTrust',
    '#Poll'
  ]

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()

    let pollData: PollData | undefined = undefined
    if (activeMode === 'poll' && pollQuestion.trim()) {
      const validOptions = pollOptions.filter(o => o.trim().length > 0)
      if (validOptions.length >= 2) {
        pollData = {
          id: 'poll_' + Date.now(),
          question: pollQuestion.trim(),
          options: validOptions.map((opt, idx) => ({
            id: 'opt_' + idx + '_' + Date.now(),
            text: opt.trim(),
            votes: 0
          })),
          totalVotes: 0,
          userVotedOptionId: null,
          timeRemaining: pollDuration + ' left'
        }
      }
    }

    let celebrationData = undefined
    if (activeMode === 'celebrate') {
      celebrationData = {
        type: 'new_job' as const,
        badge: celebrationBadge,
        headline: celebrationHeadline
      }
    }

    let documentData = undefined
    if (activeMode === 'document') {
      documentData = {
        title: docTitle,
        totalPages: 2,
        slides: [
          {
            slideNumber: 1,
            title: slide1Title,
            content: slide1Content,
            visualTag: 'ARCHITECTURE',
            bgColor: 'from-blue-600 to-indigo-900'
          },
          {
            slideNumber: 2,
            title: '02 / Policy Engine Invalidation',
            content: 'Verify session identity against distributed policy stores on every mutation.',
            visualTag: 'SECURITY RESILIENCE',
            bgColor: 'from-sky-600 to-cyan-900'
          }
        ]
      }
    }

    onAddPost({
      author: {
        id: user.id,
        name: user.name,
        headline: user.headline,
        avatar: user.avatar,
        connectionDegree: 'You',
        isFollowing: false
      },
      visibility: selectedVisibility,
      content: content.trim(),
      hashtags: selectedTags,
      postType: activeMode,
      poll: pollData,
      celebration: celebrationData,
      document: documentData,
      media: mediaUrl
        ? {
            type: 'image',
            url: mediaUrl,
            aspectRatio: '16:9'
          }
        : undefined,
      userReaction: null,
      isSaved: false
    })

    // Reset Form
    setContent("")
    setMediaUrl("")
    setSelectedTags([])
    setShowMediaInput(false)
    setActiveMode('standard')
    setPollQuestion("")
    setPollOptions(["", ""])
    setIsOpen(false)
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""])
    }
  }

  return (
    <>
      {/* Quick Creator Box */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-11 w-11 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
          />
          <button
            onClick={() => {
              setActiveMode('standard')
              setIsOpen(true)
            }}
            className="flex-1 rounded-full border border-zinc-300 bg-zinc-50/70 px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-zinc-500 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Start a post, share insights or milestones...
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 text-xs font-semibold text-zinc-600 dark:border-zinc-800/80 dark:text-zinc-400">
          <button
            onClick={() => {
              setActiveMode('standard')
              setShowMediaInput(true)
              setIsOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-md p-2 hover:bg-zinc-100 transition-colors text-sky-600 dark:hover:bg-zinc-800"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Media</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('poll')
              setIsOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-md p-2 hover:bg-zinc-100 transition-colors text-indigo-600 dark:hover:bg-zinc-800"
          >
            <Vote className="h-4 w-4" />
            <span className="hidden sm:inline">Create a Poll</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('celebrate')
              setIsOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-md p-2 hover:bg-zinc-100 transition-colors text-emerald-600 dark:hover:bg-zinc-800"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Celebrate</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('document')
              setIsOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-md p-2 hover:bg-zinc-100 transition-colors text-orange-600 dark:hover:bg-zinc-800"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Document</span>
          </button>

          <button
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span>Write with AI</span>
          </button>

          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-sky-600/40 bg-sky-50 px-3 py-1.5 text-xs font-bold text-[#0A66C2] hover:bg-sky-100 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300 transition-all"
          >
            <span>🔮 Virality Simulator</span>
          </button>
        </div>
      </div>

      {/* AI Post Modal */}
      <AIPostModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onApplyGeneratedContent={(aiContent, aiTags) => {
          setContent(aiContent)
          setSelectedTags(aiTags)
          setActiveMode('standard')
          setIsOpen(true)
        }}
      />

      {/* Post Impact & Virality Simulator */}
      <PostImpactSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        currentContent={content || "Autonomous agentic systems are entering production at record speed. Here are 4 critical architectural guardrails every enterprise AI engineering team should enforce: 1️⃣ Ephemeral Sandboxing 2️⃣ HMAC Verification Nonces"}
        onApplyPolishedContent={(polished) => {
          setContent(polished)
          setIsOpen(true)
        }}
      />

      {/* Full Post Composer Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-[#0A66C2]/20"
                />
                <div>
                  <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </DialogTitle>
                  <div className="mt-1 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedVisibility(
                          selectedVisibility === 'Public' ? 'Connections' : 'Public'
                        )
                      }
                      className="flex items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      {selectedVisibility === 'Public' ? (
                        <>
                          <Globe className="h-3 w-3 text-zinc-500" />
                          <span>Anyone</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-3 w-3 text-zinc-500" />
                          <span>Connections only</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mode Selector Pill */}
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0A66C2] dark:bg-blue-950/40">
                {activeMode === 'poll' && '📊 Poll Mode'}
                {activeMode === 'celebrate' && '🎉 Celebrate Mode'}
                {activeMode === 'document' && '📑 Document Mode'}
                {activeMode === 'standard' && '✍️ Post'}
              </span>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreatePost} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <textarea
              placeholder={
                activeMode === 'poll'
                  ? "Ask your network an engaging question..."
                  : activeMode === 'celebrate'
                  ? "Share what you are celebrating with your community..."
                  : "What do you want to talk about?"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
              autoFocus
            />

            {/* 1. POLL BUILDER WIDGET */}
            {activeMode === 'poll' && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-3">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  Poll Configuration
                </p>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    Poll Question
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Which cloud architecture framework do you prefer?"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    Options
                  </label>
                  {pollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions]
                        updated[idx] = e.target.value
                        setPollOptions(updated)
                      }}
                      required={idx < 2}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                  ))}

                  {pollOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="flex items-center gap-1 text-xs font-semibold text-[#0A66C2] hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add option
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 2. CELEBRATION BUILDER */}
            {activeMode === 'celebrate' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-3">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Select Milestone Type
                </p>
                <div className="flex gap-2">
                  {[
                    { badge: '🎉', label: 'New Position' },
                    { badge: '🏆', label: 'Award' },
                    { badge: '📜', label: 'Certification' },
                    { badge: '🚀', label: 'Project Launch' }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setCelebrationBadge(item.badge)
                        setCelebrationHeadline(`${item.label}: Milestone celebration`)
                      }}
                      className={`flex-1 rounded-lg border p-2 text-center text-xs font-semibold transition-all ${
                        celebrationBadge === item.badge
                          ? "border-amber-600 bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200"
                          : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      }`}
                    >
                      <span className="text-lg block">{item.badge}</span>
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DOCUMENT BUILDER */}
            {activeMode === 'document' && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900/50 dark:bg-orange-950/20 space-y-3">
                <p className="text-xs font-bold text-orange-900 dark:text-orange-300">
                  Document Presentation Details
                </p>
                <input
                  type="text"
                  placeholder="Document Title (e.g. Zero_Trust_Architecture_2026.pdf)"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}

            {/* Media URL Input if standard */}
            {showMediaInput && activeMode === 'standard' && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Attach Image URL
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl("")
                      setShowMediaInput(false)
                    }}
                    className="text-zinc-400 hover:text-zinc-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}

            {/* Suggested Hashtags */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Suggested Hashtags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedHashtags.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                        isSelected
                          ? "bg-[#0A66C2] text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('standard')
                    setShowMediaInput(!showMediaInput)
                  }}
                  className="rounded-full p-2 hover:bg-zinc-100 text-[#0A66C2] transition-colors dark:hover:bg-zinc-800"
                  title="Add image"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode(activeMode === 'poll' ? 'standard' : 'poll')}
                  className="rounded-full p-2 hover:bg-zinc-100 text-indigo-600 transition-colors dark:hover:bg-zinc-800"
                  title="Toggle poll mode"
                >
                  <Vote className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode(activeMode === 'celebrate' ? 'standard' : 'celebrate')}
                  className="rounded-full p-2 hover:bg-zinc-100 text-emerald-600 transition-colors dark:hover:bg-zinc-800"
                  title="Celebrate milestone"
                >
                  <Sparkles className="h-5 w-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!content.trim() && !mediaUrl && !pollQuestion.trim()}
                className="flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs sm:text-sm font-semibold text-white transition-opacity hover:bg-[#004182] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Post</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
