"use client"

import React, { useState } from "react"
import {
  Play,
  Pause,
  Tv,
  Film,
  Radio,
  Sparkles,
  Zap,
  Clock,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  ShieldCheck,
  ShoppingBag,
  Briefcase,
  Download,
  Github,
  BookOpen,
  CheckCircle2,
  Users,
  BarChart3,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Filter,
  Plus,
  Send,
  Volume2,
  Maximize2,
  Mic,
  Headphones,
  RotateCcw,
  RotateCw,
  Sliders,
  Sparkle
} from "lucide-react"
import {
  FEATURED_VIDEOS_DATA,
  MEDIA_CLIPS_DATA,
  LIVE_STREAMS_DATA,
  PODCAST_SHOWS_DATA,
  MediaVideoItem,
  MediaClipItem,
  LiveStreamEvent,
  PodcastShow,
  PodcastEpisode,
  VideoChapter,
  VideoTranscriptSegment
} from "@/lib/connectin-media-data"
import { UserProfile } from "@/lib/linkedin-data"

interface MediaViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function MediaView({
  currentUser,
  onNavigateTab
}: MediaViewProps) {
  const [activeMediaTab, setActiveMediaTab] = useState<
    'for_you' | 'following' | 'clips' | 'live' | 'learning' | 'podcasts' | 'studio'
  >('for_you')

  const [videos, setVideos] = useState<MediaVideoItem[]>(FEATURED_VIDEOS_DATA)
  const [selectedVideo, setSelectedVideo] = useState<MediaVideoItem | null>(FEATURED_VIDEOS_DATA[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlaybackSeconds, setCurrentPlaybackSeconds] = useState(0)
  const [aiSearchPrompt, setAiSearchPrompt] = useState("")
  const [aiSearchFeedback, setAiSearchFeedback] = useState<string | null>(null)
  const [liveChatMessages, setLiveChatMessages] = useState<string[]>([
    "Marcus Vance: Excited to see the eBPF kernel socket benchmark live!",
    "Elena Rostova: Does AXIOM support FIPS 140-3 cryptographic modules in AWS GovCloud?",
    "Alex Taylor: Yes Elena, all tokens are validated via FIPS 140-3 HSM enclaves."
  ])
  const [newChatText, setNewChatText] = useState("")

  // Podcast Suite State
  const [podcastShows, setPodcastShows] = useState<PodcastShow[]>(PODCAST_SHOWS_DATA)
  const [selectedShow, setSelectedShow] = useState<PodcastShow>(PODCAST_SHOWS_DATA[0])
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(PODCAST_SHOWS_DATA[0].episodes[0] || null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [audioProgressSeconds, setAudioProgressSeconds] = useState(45)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [isEpisodeVideoMode, setIsEpisodeVideoMode] = useState(false)
  const [podcastSearchQuery, setPodcastSearchQuery] = useState("")

  // Live Terminal Sandbox State
  const [isTerminalSandboxOpen, setIsTerminalSandboxOpen] = useState(false)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "root@microvm-govcloud:~# cilium status",
    "✓ Cilium kernel BPF filesystem mounted at /sys/fs/bpf",
    "✓ ClusterMesh: 4 nodes connected (Zero-Trust policy enforcement active)"
  ])

  const handleExecuteCommand = (cmd: string) => {
    setTerminalLogs(prev => [
      ...prev,
      `root@microvm-govcloud:~# ${cmd}`,
      cmd.includes('cilium')
        ? "✓ Cilium probe initialized. Micro-segmentation rule active across namespace default."
        : cmd.includes('ebpf')
        ? "✓ eBPF socket tracer sniffing AF_INET packets. 0 unauthorized egress packets detected."
        : "✓ OSCAL 1.0.0 JSON telemetry validated against NIST SP 800-53 Rev 5 control SC-13. Cryptographic hash verified.",
      "★ Earned +50 XP (Interactive Lab Milestone Completed!)"
    ])
  }

  const mediaNavTabs = [
    { id: 'for_you', label: '🔥 For You' },
    { id: 'following', label: '👥 Following' },
    { id: 'clips', label: '⚡ Clips (Shorts)' },
    { id: 'live', label: '🔴 Live & Webinars' },
    { id: 'podcasts', label: '🎙️ ConnectIn Podcasts' },
    { id: 'learning', label: '🎓 Learning Video' },
    { id: 'studio', label: '📊 ConnectIn Studio ($92.4K Rev)' }
  ]

  const handleSkipAudio = (delta: number) => {
    if (!selectedEpisode) return
    setAudioProgressSeconds(prev => Math.max(0, Math.min(selectedEpisode.durationSeconds, prev + delta)))
  }

  const handleCyclePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2]
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length
    setPlaybackSpeed(speeds[nextIdx])
  }

  const handleSeekPodcastChapter = (chapter: VideoChapter) => {
    setAudioProgressSeconds(chapter.seconds)
    setIsAudioPlaying(true)
  }

  const handleSeekChapter = (chapter: VideoChapter) => {
    setCurrentPlaybackSeconds(chapter.seconds)
    setIsPlaying(true)
    setAiSearchFeedback(`Jumping to chapter: "${chapter.title}" at ${chapter.timestamp}`)
  }

  const handleAiVideoQuery = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiSearchPrompt.trim() || !selectedVideo) return

    const lower = aiSearchPrompt.toLowerCase()
    let matchedSegment: VideoTranscriptSegment | undefined

    if (lower.includes('zero trust') || lower.includes('ingress')) {
      matchedSegment = selectedVideo.transcript[0]
    } else if (lower.includes('ebpf') || lower.includes('kernel') || lower.includes('socket')) {
      matchedSegment = selectedVideo.transcript[1]
    } else if (lower.includes('ai') || lower.includes('safety') || lower.includes('mcp') || lower.includes('prompt')) {
      matchedSegment = selectedVideo.transcript[2]
    } else if (lower.includes('cato') || lower.includes('oscal') || lower.includes('fedramp')) {
      matchedSegment = selectedVideo.transcript[3]
    } else {
      matchedSegment = selectedVideo.transcript[1]
    }

    if (matchedSegment) {
      setCurrentPlaybackSeconds(matchedSegment.seconds)
      setIsPlaying(true)
      setAiSearchFeedback(`ConnectIn AI matched your query! Jumping to ${matchedSegment.timestamp} — "${matchedSegment.text}"`)
    }
  }

  const handleSendLiveChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChatText.trim()) return
    setLiveChatMessages(prev => [...prev, `${currentUser.name}: ${newChatText.trim()}`])
    setNewChatText("")
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      {/* 1. MEDIA HUB BANNER & NAV */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-5 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40 flex items-center gap-1.5 w-fit">
              <Tv className="h-3.5 w-3.5 text-amber-300" />
              ConnectIn Media &amp; Professional Video Platform
            </span>
            <h1 className="text-2xl font-black text-white">
              ConnectIn Video, Clips, Live &amp; Studio
            </h1>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Technical walkthroughs, product teardowns, vertical clips, and live webinars deeply connected to **Marketplace trials, jobs, labs, and B2B revenue operations**.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveMediaTab('studio')}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-4 py-2 text-xs shadow-md flex items-center gap-1.5"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>ConnectIn Studio</span>
            </button>
          </div>
        </div>

        {/* Media Navigation Tabs */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {mediaNavTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMediaTab(tab.id as any)}
              className={`rounded-xl px-3.5 py-1.5 font-bold transition-all shrink-0 ${
                activeMediaTab === tab.id
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW: FOR YOU & FOLLOWING (THE INTERACTIVE PROFESSIONAL WATCH EXPERIENCE) */}
      {/* ========================================================================= */}
      {(activeMediaTab === 'for_you' || activeMediaTab === 'following' || activeMediaTab === 'learning') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Video Player & Commerce Funnel (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedVideo && (
              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-md dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                {/* Video Player Display Container */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden group">
                  <img
                    src={selectedVideo.thumbnail}
                    alt=""
                    className={`h-full w-full object-cover transition-opacity duration-300 ${isPlaying ? "opacity-75" : "opacity-90"}`}
                  />

                  {/* Player Overlay Controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-4 text-white">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold border border-white/20 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        {selectedVideo.visibility} Professional Video
                      </span>
                      <span className="rounded-full bg-purple-500/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-mono font-bold">
                        1080p 60fps
                      </span>
                    </div>

                    {/* Center Play/Pause Trigger */}
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-16 w-16 rounded-full bg-white/90 hover:bg-white text-zinc-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
                      >
                        {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current ml-1" />}
                      </button>
                    </div>

                    {/* Bottom Progress Bar & Time */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-white/30 rounded-full overflow-hidden cursor-pointer">
                        <div
                          className="h-full bg-[#0A66C2] transition-all duration-300"
                          style={{ width: `${Math.min(100, (currentPlaybackSeconds / selectedVideo.durationSeconds) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                        <span>{Math.floor(currentPlaybackSeconds / 60)}:{String(currentPlaybackSeconds % 60).padStart(2, '0')} / {selectedVideo.duration}</span>
                        <span className="flex items-center gap-2">
                          <Volume2 className="h-3.5 w-3.5" />
                          <Maximize2 className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Title & Channel Bar */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                      {selectedVideo.title}
                    </h2>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <div className="flex items-center gap-3">
                        <img src={selectedVideo.channelAvatar} alt="" className="h-11 w-11 rounded-full object-cover ring-1 ring-zinc-300" />
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{selectedVideo.channelName}</h4>
                            {selectedVideo.isVerifiedChannel && <ShieldCheck className="h-4 w-4 text-[#0A66C2]" />}
                          </div>
                          <p className="text-[11px] text-zinc-500">{selectedVideo.channelFollowers} · {selectedVideo.channelRole}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsTerminalSandboxOpen(!isTerminalSandboxOpen)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isTerminalSandboxOpen
                              ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400"
                              : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                          }`}
                        >
                          <Terminal className="h-3.5 w-3.5" />
                          <span>{isTerminalSandboxOpen ? "Close Sandbox" : "🖥️ Live Sandbox"}</span>
                        </button>
                        <button className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-1.5 text-xs font-bold shadow-xs">
                          Follow Channel
                        </button>
                        <button className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 p-2 text-zinc-700 dark:text-zinc-300">
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 p-2 text-zinc-700 dark:text-zinc-300">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 1.5. LIVE SIDE-BY-SIDE TERMINAL SANDBOX */}
                  {isTerminalSandboxOpen && (
                    <div className="rounded-2xl border border-zinc-700 bg-black p-4 text-white shadow-2xl space-y-3 font-mono text-xs animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-bold text-zinc-200 text-xs">Firecracker MicroVM · GovCloud Linux 6.8 (Follow Along Mode)</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">Status: Connected · +50 XP Active</span>
                      </div>

                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-emerald-400 font-mono text-[11px] leading-relaxed min-h-[120px] max-h-[220px] overflow-y-auto space-y-1">
                        <p className="text-zinc-400"># Welcome to ConnectIn Interactive Sandbox. Execute commands live alongside the video:</p>
                        {terminalLogs.map((log, i) => (
                          <p key={i}>{log}</p>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-zinc-400">Quick Commands:</span>
                        <button
                          onClick={() => handleExecuteCommand('cilium status --wait')}
                          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sky-300 px-2 py-1 text-[10px] font-mono border border-zinc-700"
                        >
                          $ cilium status
                        </button>
                        <button
                          onClick={() => handleExecuteCommand('ebpf-trace-sockets --enclave govcloud-prod')}
                          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-300 px-2 py-1 text-[10px] font-mono border border-zinc-700"
                        >
                          $ ebpf-trace-sockets
                        </button>
                        <button
                          onClick={() => handleExecuteCommand('oscal-validate --file /var/cato/nist-800-53.json')}
                          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 px-2 py-1 text-[10px] font-mono border border-zinc-700"
                        >
                          $ oscal-validate
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. CONNECTIN AI VIDEO INTELLIGENCE & JUMP TO TIMESTAMP */}
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-50/50 p-4 dark:bg-purple-950/20 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 dark:text-purple-300 flex items-center gap-1.5 text-xs">
                        <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                        ConnectIn AI Video Intelligence &amp; Segment Finder
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">Real-Time Searchable Transcript</span>
                    </div>

                    <form onSubmit={handleAiVideoQuery} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask anything: 'What did the speaker say about eBPF / AI safety / cATO?'..."
                        value={aiSearchPrompt}
                        onChange={(e) => setAiSearchPrompt(e.target.value)}
                        className="flex-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 text-xs font-bold transition-all shrink-0"
                      >
                        Ask AI →
                      </button>
                    </form>

                    {aiSearchFeedback && (
                      <p className="text-[11px] text-purple-900 dark:text-purple-200 bg-white/80 dark:bg-zinc-900/80 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                        {aiSearchFeedback}
                      </p>
                    )}
                  </div>

                  {/* 3. INTERACTIVE CHAPTERS BAR */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                      Video Chapters ({selectedVideo.chapters.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedVideo.chapters.map((ch, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSeekChapter(ch)}
                          className="flex items-center justify-between rounded-xl bg-zinc-50 hover:bg-zinc-100 p-2.5 text-left border border-zinc-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:border-zinc-700 transition-colors group cursor-pointer"
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-[11px] block">{ch.timestamp}</span>
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate block text-xs group-hover:text-[#0A66C2]">{ch.title}</span>
                          </div>
                          <Play className="h-3 w-3 text-zinc-400 group-hover:text-[#0A66C2] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. EMBEDDED COMMERCE & PRODUCT FUNNEL (CONNECTED TO MARKETPLACE) */}
                  {selectedVideo.embeddedProduct && (
                    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-5 text-white shadow-md space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{selectedVideo.embeddedProduct.icon}</span>
                          <div>
                            <span className="text-[10px] uppercase font-mono text-purple-300 font-bold block">Featured in Video</span>
                            <h4 className="font-black text-base text-white">{selectedVideo.embeddedProduct.name}</h4>
                            <p className="text-xs text-zinc-300">{selectedVideo.embeddedProduct.tagline}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-sm font-black text-emerald-400 block">{selectedVideo.embeddedProduct.price}</span>
                          <span className="text-[10px] text-zinc-400">14-Day Free Evaluation</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                        <button
                          onClick={() => onNavigateTab('marketplace')}
                          className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold px-4 py-1.5 text-xs shadow-md"
                        >
                          Launch 14-Day Free Sandbox →
                        </button>
                        <button
                          onClick={() => onNavigateTab('messaging')}
                          className="rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-1.5 text-xs border border-white/20"
                        >
                          Request Architecture Briefing
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 5. LINKED OPEN REQUISITIONS & HIRING */}
                  {selectedVideo.relatedJobs && selectedVideo.relatedJobs.length > 0 && (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2 text-xs">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-emerald-600" />
                        Companies Hiring for Skills Featured in This Video:
                      </span>
                      <div className="space-y-1.5">
                        {selectedVideo.relatedJobs.map((job) => (
                          <div key={job.id} className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700">
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">{job.title}</p>
                              <p className="text-[10px] text-zinc-500">{job.company} · {job.location} · <strong className="text-emerald-600 font-mono">{job.salary}</strong></p>
                            </div>
                            <button
                              onClick={() => onNavigateTab('jobs')}
                              className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Rail: Video Recommendations & Next Up (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Recommended &amp; Next Up
            </h3>

            <div className="space-y-3">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => {
                    setSelectedVideo(vid)
                    setCurrentPlaybackSeconds(0)
                    setIsPlaying(true)
                  }}
                  className={`rounded-2xl border p-3 cursor-pointer transition-all flex gap-3 ${
                    selectedVideo?.id === vid.id
                      ? "bg-purple-50/60 border-purple-400 dark:bg-purple-950/30 dark:border-purple-600 ring-2 ring-purple-500/20"
                      : "bg-white border-zinc-200 hover:border-[#0A66C2] dark:bg-zinc-900 dark:border-zinc-800"
                  }`}
                >
                  <div className="relative h-20 w-32 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                    <img src={vid.thumbnail} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 right-1 rounded-md bg-black/80 px-1.5 py-0.2 text-[9px] font-mono text-white">
                      {vid.duration}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1 text-xs">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                      {vid.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 truncate">{vid.channelName}</p>
                    <p className="text-[10px] text-zinc-400">{vid.views} · {vid.uploadTimeAgo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: CONNECTIN PODCASTS (AUDIO & VIDEO PODCASTS + CONNECTED ECOSYSTEM)  */}
      {/* ========================================================================= */}
      {activeMediaTab === 'podcasts' && (
        <div className="space-y-6">
          {/* Podcast Show Masthead */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={selectedShow.coverImage}
                alt=""
                className="h-28 w-28 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20 shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-200 border border-indigo-400/40">
                    🎙️ {selectedShow.category}
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">{selectedShow.rating} ({selectedShow.reviewsCount} reviews)</span>
                </div>
                <h2 className="text-2xl font-black text-white">{selectedShow.title}</h2>
                <p className="text-xs text-zinc-300 max-w-xl">{selectedShow.tagline}</p>
                <div className="flex items-center gap-2 pt-1">
                  <img src={selectedShow.hostAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                  <span className="text-xs text-zinc-300 font-medium">Hosted by <strong className="text-white">{selectedShow.hostName}</strong> ({selectedShow.hostRole})</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
              <span className="text-xs font-mono text-emerald-400 font-bold">{selectedShow.subscribersCount}</span>
              <button className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2 text-xs font-bold shadow-md transition-all">
                + Subscribe to Show
              </button>
              {selectedShow.monthlyMembershipPrice && (
                <button
                  onClick={() => onNavigateTab('messaging')}
                  className="rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 border border-purple-400/40 px-3.5 py-1.5 text-[11px] font-bold"
                >
                  ⭐ VIP Supporter Tier: {selectedShow.monthlyMembershipPrice}
                </button>
              )}
            </div>
          </div>

          {/* ACTIVE PODCAST EPISODE PLAYER & ECOSYSTEM MATRIX */}
          {selectedEpisode && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Player & Entity Graph (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
                  {/* Episode Title & Meta */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>Season {selectedEpisode.seasonNumber} · Episode {selectedEpisode.episodeNumber}</span>
                      <span>{selectedEpisode.releaseDate} · {selectedEpisode.listensCount}</span>
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">{selectedEpisode.title}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
                      {selectedEpisode.description}
                    </p>
                  </div>

                  {/* Audio Waveform & Player Deck */}
                  <div className="rounded-2xl border border-indigo-500/30 bg-slate-950 p-5 text-white shadow-inner space-y-4">
                    {/* Animated Waveform Visualizer */}
                    <div className="flex items-center justify-between gap-1 h-12 px-2 overflow-hidden">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isAudioPlaying
                              ? "bg-gradient-to-t from-indigo-500 to-sky-400 animate-pulse"
                              : "bg-zinc-700"
                          }`}
                          style={{
                            height: isAudioPlaying
                              ? `${Math.max(15, Math.sin(i * 0.4 + audioProgressSeconds) * 45 + 15)}%`
                              : `${(i % 5 + 1) * 14}%`
                          }}
                        />
                      ))}
                    </div>

                    {/* Scrubber Bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-200"
                          style={{ width: `${(audioProgressSeconds / selectedEpisode.durationSeconds) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>{Math.floor(audioProgressSeconds / 60)}:{String(audioProgressSeconds % 60).padStart(2, '0')}</span>
                        <span>{selectedEpisode.duration}</span>
                      </div>
                    </div>

                    {/* Master Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCyclePlaybackSpeed}
                          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-xs font-mono font-bold text-white border border-zinc-700"
                        >
                          {playbackSpeed}x
                        </button>
                        <button
                          onClick={() => setIsEpisodeVideoMode(!isEpisodeVideoMode)}
                          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-xs font-bold text-purple-300 border border-zinc-700 flex items-center gap-1"
                        >
                          <Film className="h-3 w-3" />
                          <span>{isEpisodeVideoMode ? "Audio Only" : "Video Mode"}</span>
                        </button>
                      </div>

                      {/* Main Playback Cluster */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleSkipAudio(-15)}
                          className="text-zinc-400 hover:text-white transition-colors"
                          title="Skip Back 15s"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                          className="h-12 w-12 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                        >
                          {isAudioPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
                        </button>
                        <button
                          onClick={() => handleSkipAudio(15)}
                          className="text-zinc-400 hover:text-white transition-colors"
                          title="Skip Forward 15s"
                        >
                          <RotateCw className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-400 text-xs">
                        <Volume2 className="h-4 w-4" />
                        <span className="font-mono text-[10px]">100%</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. THE CONNECTED ENTITY GRAPH MATRIX ("NO DEAD ENDS") */}
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-50/50 p-5 dark:bg-purple-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 dark:text-purple-200 text-xs flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        Connected Ecosystem Matrix for Episode {selectedEpisode.episodeNumber}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">Person → Company → Product → Job → Course</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {/* Person / Guest */}
                      <div className="p-3 rounded-xl bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] uppercase font-mono text-zinc-400 block">Featured Guest</span>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedEpisode.connectedEntityGraph.person.name}</p>
                        <p className="text-[10px] text-zinc-500">{selectedEpisode.connectedEntityGraph.person.role}</p>
                        <button onClick={() => onNavigateTab('profile')} className="text-[#0A66C2] text-[11px] font-bold hover:underline pt-1 block">
                          View Profile →
                        </button>
                      </div>

                      {/* Featured Product */}
                      <div className="p-3 rounded-xl bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] uppercase font-mono text-purple-600 dark:text-purple-400 font-bold block">Featured Product</span>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedEpisode.connectedEntityGraph.product.name}</p>
                        <button onClick={() => onNavigateTab('marketplace')} className="text-emerald-600 font-bold text-[11px] hover:underline pt-1 block">
                          {selectedEpisode.connectedEntityGraph.product.trialAction} →
                        </button>
                      </div>

                      {/* Matched Job Opening */}
                      <div className="p-3 rounded-xl bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] uppercase font-mono text-emerald-600 font-bold block">Hiring for Topic</span>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedEpisode.connectedEntityGraph.job.title}</p>
                        <p className="text-[10px] text-zinc-500">{selectedEpisode.connectedEntityGraph.job.company} · {selectedEpisode.connectedEntityGraph.job.salary}</p>
                        <button onClick={() => onNavigateTab('jobs')} className="text-[#0A66C2] font-bold text-[11px] hover:underline pt-1 block">
                          1-Click Apply →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4. INTERACTIVE CHAPTERS & TRANSCRIPT JUMPER */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                      Episode Chapters ({selectedEpisode.chapters.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedEpisode.chapters.map((ch, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSeekPodcastChapter(ch)}
                          className="flex items-center justify-between rounded-xl bg-zinc-50 hover:bg-zinc-100 p-2.5 text-left border border-zinc-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:border-zinc-700 transition-colors group cursor-pointer"
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px] block">{ch.timestamp}</span>
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate block text-xs group-hover:text-[#0A66C2]">{ch.title}</span>
                          </div>
                          <Play className="h-3 w-3 text-zinc-400 group-hover:text-[#0A66C2] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Rail: Season Episodes List (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Season 1 Episodes ({selectedShow.episodes.length})
                  </h3>
                  <button
                    onClick={() => onNavigateTab('messaging')}
                    className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300"
                  >
                    + Pitch Topic
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedShow.episodes.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => {
                        setSelectedEpisode(ep)
                        setAudioProgressSeconds(0)
                        setIsAudioPlaying(true)
                      }}
                      className={`rounded-2xl border p-3.5 cursor-pointer transition-all flex gap-3 ${
                        selectedEpisode.id === ep.id
                          ? "bg-indigo-50/60 border-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-600 ring-2 ring-indigo-500/20"
                          : "bg-white border-zinc-200 hover:border-[#0A66C2] dark:bg-zinc-900 dark:border-zinc-800"
                      }`}
                    >
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                        <img src={ep.videoThumbnail || selectedShow.coverImage} alt="" className="h-full w-full object-cover" />
                        <span className="absolute bottom-1 right-1 rounded-md bg-black/80 px-1 py-0.2 text-[8px] font-mono text-white">
                          {ep.duration}
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0 flex-1 text-xs">
                        <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block">
                          Episode {ep.episodeNumber}
                        </span>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                          {ep.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400">{ep.listensCount} · {ep.releaseDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: CLIPS (SHORT-FORM VERTICAL PROFESSIONAL VIDEOS) */}
      {/* ========================================================================= */}
      {activeMediaTab === 'clips' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {MEDIA_CLIPS_DATA.map((clip) => (
              <div
                key={clip.id}
                className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
              >
                {/* Vertical Clip Frame */}
                <div className="relative aspect-[9/14] w-full bg-slate-950 overflow-hidden group">
                  <img src={clip.thumbnail} alt="" className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 p-4 flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold border border-white/20">
                        ⚡ {clip.topic}
                      </span>
                      <span className="rounded-md bg-purple-600 px-1.5 py-0.2 text-[9px] font-mono font-bold">
                        {clip.duration}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-white leading-snug">
                        {clip.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <img src={clip.creatorAvatar} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-white" />
                        <span className="text-[11px] text-zinc-300 truncate">{clip.creatorName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clip Action Drawer */}
                <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-zinc-400">{clip.views} Views</span>
                  <button
                    onClick={() => onNavigateTab(clip.actionTargetTab)}
                    className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs flex items-center gap-1"
                  >
                    <span>{clip.actionLabel}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: LIVE STREAMS & WEBINAR STAGES */}
      {/* ========================================================================= */}
      {activeMediaTab === 'live' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Stream Stage (8 Cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-md dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
                <img src={LIVE_STREAMS_DATA[0].hostAvatar} alt="" className="h-full w-full object-cover opacity-60" />
                <div className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-0.5 text-xs font-black text-white animate-pulse flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5" />
                  <span>LIVE NOW · {LIVE_STREAMS_DATA[0].liveViewersCount} Viewers</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {LIVE_STREAMS_DATA[0].title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{LIVE_STREAMS_DATA[0].description}</p>

                {/* Instant Trial Box during Stream */}
                <div className="rounded-xl bg-purple-50 p-3.5 border border-purple-200 dark:bg-purple-950/30 dark:border-purple-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-purple-600 dark:text-purple-300">Live Interactive Demo CTA</span>
                    <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{LIVE_STREAMS_DATA[0].featuredProduct.name}</p>
                  </div>
                  <button
                    onClick={() => onNavigateTab('marketplace')}
                    className="rounded-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 text-xs font-bold shadow-xs"
                  >
                    Start Free Trial Key →
                  </button>
                </div>
              </div>
            </div>

            {/* Live Chat Panel (4 Cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between h-[450px]">
              <div className="space-y-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                  <span>Live Audience Q&amp;A Chat</span>
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 py-2 text-xs font-mono">
                {liveChatMessages.map((msg, i) => (
                  <div key={i} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-[11px]">
                    <span className="font-bold text-[#0A66C2]">{msg.split(':')[0]}:</span>
                    <span className="text-zinc-700 dark:text-zinc-300 ml-1">{msg.split(':')[1]}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendLiveChat} className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a live question..."
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                  className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs focus:outline-none"
                />
                <button type="submit" className="rounded-xl bg-[#0A66C2] text-white p-2">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: CONNECTIN STUDIO (CREATOR & B2B REVENUE ATTRIBUTION DASHBOARD) */}
      {/* ========================================================================= */}
      {activeMediaTab === 'studio' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 w-fit">
                  <BarChart3 className="h-3.5 w-3.5 text-amber-300" />
                  ConnectIn Studio · Measurable B2B Revenue Attribution
                </span>
                <h2 className="text-2xl font-black text-white">
                  Creator &amp; Enterprise Video Operations
                </h2>
                <p className="text-xs text-zinc-300 max-w-xl">
                  Not just vanity view counts. Track exact trial conversions, demo requests, and attributed enterprise ARR generated directly from your technical video broadcasts.
                </p>
              </div>

              <div className="rounded-xl bg-black/40 p-4 border border-white/15 text-center min-w-[160px] shrink-0">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Attributed Video ARR</span>
                <p className="text-2xl font-black text-emerald-400">$92,400</p>
                <span className="text-[10px] text-zinc-300">43 Purchases Closed</span>
              </div>
            </div>

            {/* 5 Funnel Stages */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-4 border-t border-white/10 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-zinc-400 text-[10px] font-mono uppercase">1. Video Views</span>
                <p className="text-lg font-black text-white">42,800</p>
                <span className="text-[10px] text-zinc-400">100% Top of Funnel</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-zinc-400 text-[10px] font-mono uppercase">2. Product Clicks</span>
                <p className="text-lg font-black text-sky-400">3,200</p>
                <span className="text-[10px] text-sky-300">7.4% CTR</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-zinc-400 text-[10px] font-mono uppercase">3. Trial Starts</span>
                <p className="text-lg font-black text-amber-400">840</p>
                <span className="text-[10px] text-amber-300">26.2% of Visits</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-zinc-400 text-[10px] font-mono uppercase">4. Demo Requests</span>
                <p className="text-lg font-black text-purple-300">127</p>
                <span className="text-[10px] text-purple-200">15.1% Demo Rate</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-zinc-400 text-[10px] font-mono uppercase">5. Purchases</span>
                <p className="text-lg font-black text-emerald-400">43 Deals</p>
                <span className="text-[10px] text-emerald-300 font-bold">$92.4K ARR</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
