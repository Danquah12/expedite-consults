"use client"

import React, { useState } from "react"
import {
  Users,
  Lightbulb,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Hammer,
  DollarSign,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check
} from "lucide-react"
import {
  COLLABORATION_DATA,
  COMMUNITY_IDEAS_DATA,
  CollaborationPost,
  IdeaItem
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface CollaborationIdeasViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function CollaborationIdeasView({
  currentUser,
  onNavigateTab
}: CollaborationIdeasViewProps) {
  const [activeTab, setActiveTab] = useState<'collaboration' | 'ideas'>('ideas')
  const [ideas, setIdeas] = useState<IdeaItem[]>(COMMUNITY_IDEAS_DATA)
  const [collabs] = useState<CollaborationPost[]>(COLLABORATION_DATA)

  const toggleSupport = (ideaId: string) => {
    setIdeas(prev =>
      prev.map(i =>
        i.id === ideaId
          ? {
              ...i,
              hasSupported: !i.hasSupported,
              supportCount: i.hasSupported ? i.supportCount - 1 : i.supportCount + 1
            }
          : i
      )
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40 flex items-center gap-1.5 w-fit">
            <Lightbulb className="h-3.5 w-3.5 text-amber-300" />
            ConnectIn Collaboration &amp; Ideas Incubation Ecosystem
          </span>
          <h1 className="text-2xl font-black text-white">
            Build, Fund &amp; Co-Found the Next Big Thing
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl">
            Crowdsource technical innovation, support breakout ideas, find co-founders and security researchers, and incubate startups.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'ideas' ? "bg-white text-zinc-950 shadow-md font-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            💡 Trending Ideas ({ideas.length})
          </button>
          <button
            onClick={() => setActiveTab('collaboration')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'collaboration' ? "bg-white text-zinc-950 shadow-md font-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            🤝 Co-Founder Match ({collabs.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: IDEAS INCUBATOR */}
      {activeTab === 'ideas' && (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <img src={idea.authorAvatar} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{idea.title}</h3>
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {idea.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">Proposed by {idea.author}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                    {idea.supportCount.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-zinc-400 uppercase font-mono">Supporters</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {idea.pitch}
              </p>

              {/* Looking for tags */}
              <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                <span className="text-zinc-400 text-[11px] font-mono">Looking for:</span>
                {idea.lookingFor.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    🔍 {item}
                  </span>
                ))}
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSupport(idea.id)}
                    className={`rounded-full px-4 py-1.5 font-bold transition-all flex items-center gap-1.5 ${
                      idea.hasSupported
                        ? "bg-purple-600 text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{idea.hasSupported ? "Supported ✓" : "Support Idea"}</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('messaging')}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-4 py-1.5 font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Discuss ({idea.commentsCount})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateTab('messaging')}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Hammer className="h-3.5 w-3.5" />
                    <span>Join as Builder</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: CO-FOUNDER & COLLABORATION MATCH */}
      {activeTab === 'collaboration' && (
        <div className="space-y-4">
          {collabs.map((collab) => (
            <div
              key={collab.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <img src={collab.authorAvatar} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{collab.authorName}</h4>
                    <p className="text-xs text-zinc-500">{collab.authorRole}</p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                  Seeking: {collab.seekingRole}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{collab.projectTitle}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{collab.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {collab.requiredSkills.map((sk, sIdx) => (
                    <span key={sIdx} className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                      {sk}
                    </span>
                  ))}
                </div>
                <span className="font-bold text-emerald-600 font-mono text-xs">{collab.equityOrComp}</span>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => onNavigateTab('messaging')}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2 text-xs font-bold shadow-xs"
                >
                  Send Collaboration Pitch →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
