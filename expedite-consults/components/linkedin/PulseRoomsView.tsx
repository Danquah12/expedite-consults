"use client"

import React, { useState } from "react"
import {
  Radio,
  Mic,
  MicOff,
  Hand,
  Users,
  MessageSquare,
  Sparkles,
  Share2,
  X,
  Send,
  Volume2,
  Play,
  Pause,
  CheckCircle2,
  Plus,
  Newspaper,
  Shield,
  Clock,
  ExternalLink,
  ThumbsUp,
  Bookmark,
  TrendingUp,
  Award,
  BookOpen,
  Filter,
  Check,
  AlertTriangle,
  Zap,
  Target,
  FileText,
  Search,
  Globe,
  SlidersHorizontal
} from "lucide-react"
import {
  PulseArticle,
  PULSE_CATEGORIES,
  PULSE_ARTICLES_DATA,
  TODAY_AI_BRIEF,
  TODAY_CYBER_ADVISORIES,
  AIDailyBriefItem,
  CyberThreatAdvisory
} from "@/lib/pulse-news-data"
import { pulseRoomsData, PulseRoom } from "@/lib/nextgen-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PulseRoomsViewProps {
  currentUser: UserProfile
  onNavigateTab?: (tab: string) => void
}

export function PulseRoomsView({ currentUser }: PulseRoomsViewProps) {
  // Master View Mode
  const [pulseMode, setPulseMode] = useState<'news' | 'ai_brief' | 'cyber_threats' | 'audio_rooms'>('news')

  // News Filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [articles, setArticles] = useState<PulseArticle[]>(PULSE_ARTICLES_DATA)
  const [selectedArticle, setSelectedArticle] = useState<PulseArticle | null>(null)

  // Audio Playback Simulation for AI Brief
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false)

  // Upvotes & Bookmark state
  const [upvotedIds, setUpvotedIds] = useState<string[]>([])
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([])

  // Audio Stage / Room State
  const [rooms, setRooms] = useState<PulseRoom[]>(pulseRoomsData)
  const [activeRoom, setActiveRoom] = useState<PulseRoom | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "Samantha Wei", text: "Great point regarding vector index isolation Elena!" },
    { sender: "Devon Hughes", text: "Are you benchmarking on AWS Graviton4 or x86?" }
  ])
  const [chatInput, setChatInput] = useState("")

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { sender: currentUser.name, text: chatInput.trim() }])
    setChatInput("")
  }

  const toggleUpvote = (id: string) => {
    setUpvotedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
    setArticles(prev =>
      prev.map(art => {
        if (art.id !== id) return art
        const isUpvoted = upvotedIds.includes(id)
        return {
          ...art,
          upvotesCount: isUpvoted ? art.upvotesCount - 1 : art.upvotesCount + 1
        }
      })
    )
  }

  const toggleSaveArticle = (id: string) => {
    setSavedArticleIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Filtered Articles
  const filteredArticles = articles.filter(art => {
    const matchCategory = selectedCategory === 'All' || art.category === selectedCategory
    const matchSearch = !searchQuery || (
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    return matchCategory && matchSearch
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* 1. TOP PULSE HERO BANNER */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-bold text-sky-300 border border-sky-400/40 flex items-center gap-1.5">
                <Newspaper className="h-3.5 w-3.5 text-amber-300" />
                ConnectIn Pulse · Professional Media Layer
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                LinkedIn + TechCrunch + Research Intelligence
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Professional News, AI Briefings & Threat Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Synthesizing breakthrough papers, CISA emergency security directives, enterprise cloud architectures, and venture rounds with source-grounded citations.
            </p>
          </div>

          {/* 4-Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/15 shrink-0 flex-wrap">
            <button
              onClick={() => setPulseMode('news')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                pulseMode === 'news'
                  ? "bg-[#0A66C2] text-white shadow-md font-extrabold"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Newspaper className="h-3.5 w-3.5" />
              <span>Intelligence Feed</span>
            </button>

            <button
              onClick={() => setPulseMode('ai_brief')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                pulseMode === 'ai_brief'
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-extrabold"
                  : "text-purple-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>⚡ AI Daily Brief</span>
            </button>

            <button
              onClick={() => setPulseMode('cyber_threats')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                pulseMode === 'cyber_threats'
                  ? "bg-red-600 text-white shadow-md font-extrabold"
                  : "text-red-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Cyber Threat Radar</span>
            </button>

            <button
              onClick={() => setPulseMode('audio_rooms')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                pulseMode === 'audio_rooms'
                  ? "bg-emerald-600 text-white shadow-md font-extrabold"
                  : "text-emerald-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-red-400 animate-pulse" />
              <span>Live Audio ({rooms.length})</span>
            </button>
          </div>
        </div>

        {/* 9 Category Filter Ribbon (Visible in News Feed) */}
        {pulseMode === 'news' && (
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter Feed:
            </span>
            {PULSE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-sky-400 to-blue-500 text-zinc-950 shadow-md font-extrabold"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: PROFESSIONAL NEWS & RESEARCH FEED */}
      {/* ========================================================================= */}
      {pulseMode === 'news' && (
        <div className="space-y-5">
          {/* Search Header */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
            <div className="relative flex-1 flex items-center rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/80">
              <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search across cybersecurity, AI models, cloud benchmarks, FedRAMP, and venture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
              />
            </div>
            <span className="text-xs text-zinc-500 font-semibold shrink-0">
              {filteredArticles.length} intelligence reports
            </span>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredArticles.map((article) => {
              const isUpvoted = upvotedIds.includes(article.id)
              const isSaved = savedArticleIds.includes(article.id)

              return (
                <div
                  key={article.id}
                  className="rounded-2xl border border-zinc-200 bg-white shadow-xs hover:border-[#0A66C2] hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Article Image Banner */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                      <img
                        src={article.coverImage}
                        alt=""
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="rounded-full bg-black/70 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/20">
                          {article.category}
                        </span>
                        {article.isBreaking && (
                          <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-pulse">
                            🔥 BREAKING
                          </span>
                        )}
                      </div>

                      {article.biasRating && (
                        <div className="absolute bottom-3 right-3 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                          {article.biasRating.factCheckStatus}
                        </div>
                      )}
                    </div>

                    {/* Article Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <img
                          src={article.author.avatar}
                          alt=""
                          className="h-5 w-5 rounded-full object-cover"
                        />
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {article.author.name}
                        </span>
                        <span>·</span>
                        <span>{article.publishedAt}</span>
                        <span>·</span>
                        <span>{article.readTime}</span>
                      </div>

                      <h3
                        onClick={() => setSelectedArticle(article)}
                        className="font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] cursor-pointer leading-snug"
                      >
                        {article.title}
                      </h3>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>

                      {/* AI Key Takeaways Box */}
                      <div className="rounded-xl bg-purple-50/70 border border-purple-200/80 p-3 dark:bg-purple-950/20 dark:border-purple-900/40 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          AI Key Takeaways:
                        </span>
                        <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                          {article.aiKeyTakeaways.slice(0, 2).map((takeaway, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-purple-600 font-bold">•</span>
                              <span className="line-clamp-1">{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Interaction Bar */}
                  <div className="p-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleUpvote(article.id)}
                        className={`flex items-center gap-1.5 font-bold transition-colors ${
                          isUpvoted
                            ? "text-[#0A66C2]"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${isUpvoted ? "fill-[#0A66C2]" : ""}`} />
                        <span>{article.upvotesCount}</span>
                      </button>

                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{article.commentsCount} comments</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSaveArticle(article.id)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isSaved
                            ? "text-[#0A66C2] bg-sky-50 dark:bg-sky-950"
                            : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                        }`}
                      >
                        <Bookmark className={`h-4 w-4 ${isSaved ? "fill-[#0A66C2]" : ""}`} />
                      </button>

                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="rounded-full bg-[#0A66C2] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors"
                      >
                        Read Full Analysis →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: AI DAILY BRIEF */}
      {/* ========================================================================= */}
      {pulseMode === 'ai_brief' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40 flex items-center gap-1.5 w-fit">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  ConnectIn AI Daily Briefing
                </span>
                <p className="text-xs text-purple-300 font-mono mt-1">{TODAY_AI_BRIEF.date}</p>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {TODAY_AI_BRIEF.headline}
                </h2>
              </div>

              {/* Audio Playback Simulator */}
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-md shrink-0"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="h-4 w-4 text-amber-300" />
                    <span>Pause Audio Brief ({TODAY_AI_BRIEF.audioDuration})</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 text-emerald-300 fill-emerald-300" />
                    <span>🎧 Listen to Brief ({TODAY_AI_BRIEF.audioDuration})</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed max-w-3xl pt-1">
              {TODAY_AI_BRIEF.executiveSummary}
            </p>
          </div>

          {/* The 3 Core Pillars with Grounded Source Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TODAY_AI_BRIEF.keyPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-purple-400 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{pillar.emoji}</span>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {pillar.pillar}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {pillar.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Grounded Source:
                  </span>
                  <a
                    href={pillar.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#0A66C2] hover:underline flex items-center gap-1"
                  >
                    <span>{pillar.primarySource}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: TODAY'S CYBERSECURITY THREAT RADAR */}
      {/* ========================================================================= */}
      {pulseMode === 'cyber_threats' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-slate-900 via-red-950 to-indigo-950 p-6 text-white shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-500/30 px-3 py-0.5 text-xs font-bold text-red-200 border border-red-400/40 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-red-400" />
                Live Cyber Threat Intelligence Radar
              </span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                Direct CISA / NIST Feed Sync
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Today's Critical Vulnerabilities & Zero-Day Threat Advisories
            </h2>
            <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
              Actionable threat briefs for Security Architects, CISOs, and DevSecOps squads with immediate remediation playbooks and affected component breakdowns.
            </p>
          </div>

          <div className="space-y-4">
            {TODAY_CYBER_ADVISORIES.map((adv) => (
              <div
                key={adv.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 dark:bg-red-950 dark:text-red-400">
                        {adv.cveId}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {adv.severity}
                      </span>
                      <span className="text-xs text-zinc-400">{adv.publishedAt}</span>
                    </div>

                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 pt-1">
                      {adv.title}
                    </h3>
                  </div>

                  <a
                    href={adv.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 px-3 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 flex items-center gap-1 shrink-0"
                  >
                    <span>CISA Advisory</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {adv.summary}
                </p>

                {adv.cisaEmergencyStatus && (
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">
                    {adv.cisaEmergencyStatus}
                  </p>
                )}

                <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800/60 space-y-1.5">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    Recommended Remediation Playbook:
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    {adv.mitigationAction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: LIVE AUDIO ROOMS (DROP-IN PODCAST STAGES) */}
      {/* ========================================================================= */}
      {pulseMode === 'audio_rooms' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-950 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="rounded-full bg-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-400/40 flex items-center gap-1.5 w-fit">
                <Radio className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                ConnectIn Live Audio Stages
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Drop-In Architecture Teardowns & Debate Rooms
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mt-0.5">
                Join live audio discussions with Principal Architects, CISOs, and fellow engineers with real-time AI transcript summaries.
              </p>
            </div>

            <button
              onClick={() => setActiveRoom(rooms[0])}
              className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" /> Start a Pulse Stage
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-[#0A66C2] hover:shadow-lg transition-all cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-600 dark:bg-red-950 dark:text-red-400">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                    LIVE NOW · {room.listenersCount} listening
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">{room.category}</span>
                </div>

                <h3 className="font-bold text-base text-zinc-900 leading-snug dark:text-zinc-100">
                  {room.title}
                </h3>

                {/* Speakers Cluster */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex -space-x-3">
                    {room.speakers.map((spk) => (
                      <img
                        key={spk.id}
                        src={spk.avatar}
                        alt={spk.name}
                        className="h-10 w-10 rounded-full border-2 border-white object-cover dark:border-zinc-900"
                        title={spk.name}
                      />
                    ))}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">
                      {room.speakers.map(s => s.name.split(' ')[0]).join(', ')}
                    </p>
                    <p className="text-zinc-400 text-[11px]">Hosting Stage</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Started {room.startedAt}</span>
                  <span className="font-bold text-[#0A66C2] flex items-center gap-1">
                    <span>Join Stage</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL ARTICLE DETAIL MODAL */}
      <Dialog
        open={!!selectedArticle}
        onOpenChange={(open) => {
          if (!open) setSelectedArticle(null)
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
          {selectedArticle && (
            <div>
              <div className="relative h-48 w-full bg-slate-950">
                <img
                  src={selectedArticle.coverImage}
                  alt=""
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="rounded-full bg-black/75 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/20">
                    {selectedArticle.category}
                  </span>
                  {selectedArticle.biasRating && (
                    <span className="rounded-full bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                      {selectedArticle.biasRating.factCheckStatus} (Score: {selectedArticle.biasRating.credibilityScore}/100)
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedArticle.author.avatar}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {selectedArticle.author.name}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      {selectedArticle.author.role} · {selectedArticle.author.source}
                    </p>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                  {selectedArticle.title}
                </h1>

                {/* AI Executive Takeaways */}
                <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    AI Executive Key Takeaways:
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                    {selectedArticle.aiKeyTakeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Full Text Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                  {selectedArticle.fullContent}
                </div>

                {/* Grounded Source Citations */}
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    Grounded Source References & Statutory Citations:
                  </h4>
                  <div className="space-y-1.5">
                    {selectedArticle.sourceLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between text-xs font-semibold text-[#0A66C2] hover:underline p-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
                      >
                        <span className="truncate">{link.title}</span>
                        <span className="text-[10px] text-zinc-400 font-mono ml-2 shrink-0">{link.domain}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* THE MASTER INTERCONNECTED FLYWHEEL (CONTENT -> PROBLEM -> SOLUTION -> PRODUCT -> DEMO -> TRIAL -> PURCHASE -> SUPPORT -> REVIEW) */}
                <div className="rounded-2xl border border-sky-500/40 bg-gradient-to-br from-slate-900 via-sky-950/90 to-indigo-950 p-5 text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-bold text-sky-300 border border-sky-400/30 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        ConnectIn Interconnected Flywheel
                      </span>
                      <span className="text-[11px] text-zinc-400 hidden sm:inline">
                        Content → Problem → Solution → Product
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">
                      ● Contextual Action Match
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white">
                      Identified Professional Context: Cloud Security &amp; AppSec Threat
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed mt-0.5">
                      Since you are researching this vulnerability, ConnectIn has mapped solutions, training labs, peer reviews, and open roles:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                    {/* 1. Marketplace & Solutions */}
                    <div className="rounded-xl bg-white/10 p-3 border border-white/10 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                          🛍️ Marketplace &amp; Solutions
                        </span>
                        <h5 className="font-bold text-white text-xs">AXIOM &amp; Expedite Strike</h5>
                        <p className="text-[11px] text-zinc-300">Automated zero-trust scanner &amp; cATO pipeline defense.</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedArticle(null)
                          if (onNavigateTab) onNavigateTab('marketplace')
                        }}
                        className="rounded-lg bg-purple-600 hover:bg-purple-700 py-1.5 px-2 text-center font-bold text-white text-[11px] transition-colors"
                      >
                        Try Free Trial →
                      </button>
                    </div>

                    {/* 2. Hands-On Learning */}
                    <div className="rounded-xl bg-white/10 p-3 border border-white/10 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
                          🎓 Interactive Learning
                        </span>
                        <h5 className="font-bold text-white text-xs">Zero Trust Sandbox Lab</h5>
                        <p className="text-[11px] text-zinc-300">Hands-on interactive lab: "Defending Multi-Cloud Ingress".</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedArticle(null)
                          if (onNavigateTab) onNavigateTab('learning')
                        }}
                        className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] py-1.5 px-2 text-center font-bold text-white text-[11px] transition-colors"
                      >
                        Launch Lab →
                      </button>
                    </div>

                    {/* 3. Peer Review */}
                    <div className="rounded-xl bg-white/10 p-3 border border-white/10 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                          ⭐ Peer Validation
                        </span>
                        <h5 className="font-bold text-white text-xs">Expert Architecture Review</h5>
                        <p className="text-[11px] text-zinc-300">127 verified architects discussing this remediation patch.</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedArticle(null)
                          if (onNavigateTab) onNavigateTab('peerreview')
                        }}
                        className="rounded-lg bg-amber-600 hover:bg-amber-700 py-1.5 px-2 text-center font-bold text-white text-[11px] transition-colors"
                      >
                        Explore Reviews →
                      </button>
                    </div>

                    {/* 4. Active Job Openings */}
                    <div className="rounded-xl bg-white/10 p-3 border border-white/10 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                          💼 Active Hiring Matches
                        </span>
                        <h5 className="font-bold text-white text-xs">Lead Cloud Security Architect</h5>
                        <p className="text-[11px] text-zinc-300">$195K - $225K TC · 14 Open Defense Positions.</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedArticle(null)
                          if (onNavigateTab) onNavigateTab('jobs')
                        }}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 py-1.5 px-2 text-center font-bold text-white text-[11px] transition-colors"
                      >
                        View Jobs →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* LIVE AUDIO STAGE ACTIVE MODAL */}
      <Dialog
        open={!!activeRoom}
        onOpenChange={(open) => {
          if (!open) setActiveRoom(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          {activeRoom && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    Pulse Live Audio Stage
                  </span>
                </div>
                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {activeRoom.title}
                </DialogTitle>
              </DialogHeader>

              {/* Stage Speakers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
                {activeRoom.speakers.map((spk) => (
                  <div
                    key={spk.id}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center space-y-1 relative"
                  >
                    <div className="relative">
                      <img
                        src={spk.avatar}
                        alt=""
                        className={`h-12 w-12 rounded-full object-cover border-2 ${
                          spk.isSpeaking ? "border-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" : "border-zinc-200"
                        }`}
                      />
                      {spk.isSpeaking && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>
                    <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate w-full">
                      {spk.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate w-full">{spk.role}</p>
                  </div>
                ))}
              </div>

              {/* Live Chat Box */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-2 bg-zinc-50 dark:bg-zinc-900/50">
                <p className="font-bold text-xs text-zinc-700 dark:text-zinc-300">Stage Chat:</p>
                <div className="max-h-28 overflow-y-auto space-y-1.5 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <strong className="font-bold text-zinc-900 dark:text-zinc-100">{msg.sender}:</strong>
                      <span className="text-zinc-600 dark:text-zinc-300">{msg.text}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Ask a speaker or share insights..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:bg-zinc-800 dark:border-zinc-700"
                  />
                  <button type="submit" className="rounded-lg bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white">
                    Send
                  </button>
                </form>
              </div>

              {/* Stage Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`rounded-full p-2.5 text-xs font-bold transition-colors ${
                      isMuted ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={() => setHandRaised(!handRaised)}
                    className={`rounded-full p-2.5 text-xs font-bold transition-colors ${
                      handRaised ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    <Hand className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => setActiveRoom(null)}
                  className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700"
                >
                  Leave Stage Quietly
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
