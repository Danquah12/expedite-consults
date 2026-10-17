"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  X,
  Sparkles,
  Share2,
  CheckCircle2,
  Tv,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  Plus,
  Video,
  Film,
  Check,
  AlertCircle
} from "lucide-react"
import {
  EDUCATIONAL_WHEEL_TALKS,
  WheelVideoTalk,
  extractYouTubeId,
  getStoredCustomVideos,
  saveStoredCustomVideo
} from "@/lib/connectin-videos"
import { PROFESSION_ENCLAVES, findEnclaveById } from "@/lib/connectin-professions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { UserProfile } from "@/lib/linkedin-data"

interface ConnectInVideoWheelProps {
  className?: string
  defaultCategory?: string
  activeEnclaveId?: string
  user?: UserProfile
  title?: string
  subtitle?: string
  onOpenVideoGuide?: () => void
}

export function ConnectInVideoWheel({
  className = "",
  defaultCategory = "all",
  activeEnclaveId,
  user,
  title = "The Wheel — Multi-Profession Masterclasses & Briefings",
  subtitle = "Expedite Consults educational talks, trade apprenticeship standards, and verified professional briefings.",
  onOpenVideoGuide
}: ConnectInVideoWheelProps) {
  const [allTalks, setAllTalks] = useState<WheelVideoTalk[]>(() => {
    const custom = getStoredCustomVideos()
    return [...custom, ...EDUCATIONAL_WHEEL_TALKS]
  })

  const effectiveEnclaveId = activeEnclaveId || user?.professionEnclave || 'trades_construction'
  const activeEnclave = findEnclaveById(effectiveEnclaveId)

  const [selectedFilter, setSelectedFilter] = useState<string>(defaultCategory)
  const [activeVideo, setActiveVideo] = useState<WheelVideoTalk | null>(null)
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(true)
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // Submit Video Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [submitEnclaveId, setSubmitEnclaveId] = useState(effectiveEnclaveId)
  const [submitUrl, setSubmitUrl] = useState("")
  const [submitTitle, setSubmitTitle] = useState("")
  const [submitSpeaker, setSubmitSpeaker] = useState(user?.name || "")
  const [submitSpeakerTitle, setSubmitSpeakerTitle] = useState(user?.headline || "Verified Guild Master")
  const [submitDuration, setSubmitDuration] = useState("5:00")
  const [submitSummary, setSubmitSummary] = useState("")
  const [takeaway1, setTakeaway1] = useState("")
  const [takeaway2, setTakeaway2] = useState("")
  const [takeaway3, setTakeaway3] = useState("")
  const [submitTags, setSubmitTags] = useState("#Masterclass #Training")
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const extractedVideoId = useMemo(() => extractYouTubeId(submitUrl), [submitUrl])

  // Filter talks based on selected tab
  const filteredTalks = useMemo(() => {
    if (selectedFilter === "all") return allTalks
    if (selectedFilter === "my_enclave") {
      return allTalks.filter(t => t.enclaveId === effectiveEnclaveId)
    }
    // Filter by specific enclave or category
    return allTalks.filter(t => t.enclaveId === selectedFilter || t.category === selectedFilter)
  }, [allTalks, selectedFilter, effectiveEnclaveId])

  // Smooth scroll left / right
  const scrollWheel = (direction: 'left' | 'right') => {
    if (!trackRef.current) return
    const offset = direction === 'left' ? -320 : 320
    trackRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  // Auto-scroll loop when auto-play is enabled
  useEffect(() => {
    if (!isPlayingAuto) return
    const interval = setInterval(() => {
      if (trackRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = trackRef.current
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          trackRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          trackRef.current.scrollBy({ left: 240, behavior: 'smooth' })
        }
      }
    }, 6000)

    return () => clearInterval(interval)
  }, [isPlayingAuto])

  const handleShareVideo = (video: WheelVideoTalk) => {
    const url = `https://www.youtube.com/watch?v=${video.youtubeId}`
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2500)
    }
  }

  const handlePlayNext = () => {
    if (!activeVideo || filteredTalks.length === 0) return
    const currentIndex = filteredTalks.findIndex(t => t.id === activeVideo.id)
    const nextIndex = (currentIndex + 1) % filteredTalks.length
    setActiveVideo(filteredTalks[nextIndex])
  }

  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!extractedVideoId) {
      setSubmitError("Please enter a valid YouTube video link or 11-character video ID.")
      return
    }

    if (!submitTitle.trim()) {
      setSubmitError("Please enter a title for the masterclass briefing.")
      return
    }

    const enclaveObj = findEnclaveById(submitEnclaveId)
    const newTalk: WheelVideoTalk = {
      id: `wheel-user-${Date.now()}`,
      serialPlate: `CLN-USR${Math.floor(100 + Math.random() * 900)}`,
      title: submitTitle.trim(),
      speaker: submitSpeaker.trim() || user?.name || "Verified Member",
      speakerTitle: submitSpeakerTitle.trim() || enclaveObj?.shortName || "Professional",
      youtubeId: extractedVideoId,
      duration: submitDuration.trim() || "5:00",
      category: submitEnclaveId,
      categoryLabel: enclaveObj?.shortName || "Peer Masterclass",
      enclaveId: submitEnclaveId,
      thumbnailUrl: `https://i.ytimg.com/vi/${extractedVideoId}/hqdefault.jpg`,
      summary: submitSummary.trim() || `Professional peer walkthrough for ${enclaveObj?.name || 'verified specialists'}.`,
      takeaways: [
        takeaway1.trim() || "Key practical methodology and operational standard",
        takeaway2.trim() || "Safety, code compliance, and precision guidelines",
        takeaway3.trim() || "Peer field recommendations and best practices"
      ].filter(Boolean),
      tags: submitTags.split(/\s+/).filter(t => t.startsWith("#") || t.length > 2),
      isCommunitySubmission: true,
      submittedBy: user?.name || "Verified Member"
    }

    const updated = saveStoredCustomVideo(newTalk)
    setAllTalks(updated)
    setSubmitSuccessMsg(`Successfully added "${newTalk.title}" to The Wheel!`)
    setActiveVideo(newTalk)

    setTimeout(() => {
      setIsSubmitModalOpen(false)
      setSubmitSuccessMsg(null)
      setSubmitUrl("")
      setSubmitTitle("")
      setSubmitSummary("")
      setTakeaway1("")
      setTakeaway2("")
      setTakeaway3("")
    }, 1500)
  }

  // Filter Categories with Counts
  const filterChips = [
    { id: "all", label: `All Briefings (${allTalks.length})`, icon: "🎡" },
    {
      id: "my_enclave",
      label: `My Enclave: ${activeEnclave?.shortName || 'Current'} (${allTalks.filter(t => t.enclaveId === effectiveEnclaveId).length})`,
      icon: activeEnclave?.icon || "🔨"
    },
    { id: "trades_construction", label: "Trades & Craft", icon: "🔨" },
    { id: "auto_mechanics_transport", label: "Auto & Heavy Fleet", icon: "🚛" },
    { id: "healthcare_medicine", label: "Healthcare & Clinical", icon: "🩺" },
    { id: "tech_cybersecurity", label: "Cybersecurity & Infosec", icon: "🛡️" },
    { id: "tech_software", label: "Software & Cloud", icon: "💻" },
    { id: "finance_accounting", label: "Finance & Treasury", icon: "📈" },
    { id: "law_gov_defense", label: "Law, Gov & Defense", icon: "⚖️" },
    { id: "agriculture_natural_resources", label: "Agri & Natural Resources", icon: "🌾" },
    { id: "culinary_hospitality_services", label: "Culinary & Kitchens", icon: "🍳" },
    { id: "beauty_wellness_fitness", label: "Beauty & Wellness", icon: "💆" },
    { id: "creative_arts_media", label: "Creative Arts & Media", icon: "🎬" },
    { id: "higher_ed_campus", label: "Higher Ed & Research", icon: "🏛️" }
  ]

  return (
    <section className={`overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#1C1916] text-[#EFE8DC] p-4 sm:p-5 shadow-lg relative ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#35302B] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              🎡
            </span>
            <h2 className="font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 font-semibold">
                {allTalks.length} Videos Active
              </span>
            </h2>
          </div>
          <p className="text-xs text-[#EFE8DC]/70 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Carousel & Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          {/* Submit New Video to Wheel Button */}
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Submit a masterclass video for any profession"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Video to Wheel</span>
          </button>

          {onOpenVideoGuide && (
            <button
              type="button"
              onClick={onOpenVideoGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-all cursor-pointer"
            >
              <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
              <span>Platform Guide</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPlayingAuto(!isPlayingAuto)}
            className={`h-8 px-2.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border ${
              isPlayingAuto
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-white/10 border-white/20 text-[#EFE8DC]/80 hover:bg-white/15"
            }`}
            title={isPlayingAuto ? "Pause rotation" : "Resume auto-rotation"}
          >
            {isPlayingAuto ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span className="text-[11px]">{isPlayingAuto ? "Rotation: On" : "Paused"}</span>
          </button>

          <button
            type="button"
            onClick={() => scrollWheel('left')}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous plate"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollWheel('right')}
            className="h-8 w-8 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 transition-colors cursor-pointer font-bold"
            aria-label="Next plate"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Multi-Profession Enclave Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar text-xs">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#EFE8DC]/50 shrink-0 mr-1">
          Disciplines:
        </span>
        {filterChips.map(chip => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setSelectedFilter(chip.id)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === chip.id
                ? "bg-amber-500 text-zinc-950 font-bold shadow-xs scale-102"
                : "bg-white/5 text-[#EFE8DC]/70 hover:bg-white/10 border border-white/10"
            }`}
          >
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* The Wheel Horizontal Scrolling Track */}
      <div
        ref={trackRef}
        className="flex gap-3.5 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {filteredTalks.length === 0 ? (
          <div className="w-full py-12 text-center space-y-3 bg-[#25211D] rounded-2xl border border-[#3E3832]">
            <Film className="h-8 w-8 text-amber-400 mx-auto opacity-70" />
            <p className="text-sm font-bold text-white">No videos found for this discipline yet.</p>
            <p className="text-xs text-[#EFE8DC]/60 max-w-sm mx-auto">
              Be the first master or craftsman to submit a verified educational talk for this enclave!
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitEnclaveId(selectedFilter !== "all" && selectedFilter !== "my_enclave" ? selectedFilter : effectiveEnclaveId)
                setIsSubmitModalOpen(true)
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Submit Video for This Discipline</span>
            </button>
          </div>
        ) : (
          filteredTalks.map((talk) => {
            const talkEnclave = talk.enclaveId ? findEnclaveById(talk.enclaveId) : null
            return (
              <div
                key={talk.id}
                onClick={() => setActiveVideo(talk)}
                className="group relative h-[19rem] w-[14rem] sm:w-[15.5rem] shrink-0 snap-center rounded-2xl overflow-hidden border border-[#3E3832] bg-[#25211D] hover:border-amber-500/70 transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between shadow-md"
              >
                {/* Top Serial Plate Badge */}
                <div className="p-2.5 flex items-center justify-between border-b border-[#35302B] bg-[#1F1B18]/90 z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold tracking-wider text-amber-300/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                      {talk.serialPlate}
                    </span>
                    {talk.isCommunitySubmission && (
                      <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50" title="Submitted by verified member">
                        Guild
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-[#EFE8DC]/75 px-1.5 py-0.5 rounded bg-white/5">
                    ⏱ {talk.duration}
                  </span>
                </div>

                {/* Video Thumbnail with Play Button Overlay */}
                <div className="relative flex-1 overflow-hidden bg-black/40">
                  <img
                    src={talk.thumbnailUrl}
                    alt={talk.title}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#1C1916] via-[#1C1916]/40 to-transparent" />

                  {/* Centered Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-11 w-11 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform group-hover:bg-amber-400">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Category & Enclave Pill Over Thumbnail */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-black/75 px-2 py-0.5 rounded border border-amber-500/30 backdrop-blur-xs truncate">
                      <span>{talkEnclave?.icon || "🎓"}</span>
                      <span className="truncate">{talk.categoryLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Meta & Card Title */}
                <div className="p-3 bg-[#1C1916] border-t border-[#35302B] space-y-1">
                  <h3 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                    {talk.title}
                  </h3>
                  <p className="text-[10px] text-[#EFE8DC]/60 truncate">
                    {talk.speaker}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Bottom Footer Callout */}
      <div className="mt-3 pt-3 border-t border-[#35302B] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#EFE8DC]/60">
        <p className="text-[11px] flex items-center gap-1.5">
          <span>🔒</span>
          <span>
            Curated across all 12+ professional enclaves. Free for all verified ConnectIn members.
          </span>
        </p>
        <button
          type="button"
          onClick={() => setIsSubmitModalOpen(true)}
          className="text-[10px] font-mono text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>Have a great video for your trade? Submit to The Wheel →</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. VIDEO MODAL PLAYER DIALOG                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => { if (!open) setActiveVideo(null) }}>
        <DialogContent className="max-w-3xl p-0 border border-zinc-700 bg-zinc-950 text-white rounded-3xl overflow-hidden shadow-2xl">
          {activeVideo && (
            <div className="space-y-0">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 backdrop-blur-md">
                <div className="flex items-center gap-2.5 pr-4">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                    {activeVideo.serialPlate}
                  </span>
                  <div>
                    <h2 className="font-bold text-sm sm:text-base text-white truncate max-w-md sm:max-w-xl">
                      {activeVideo.title}
                    </h2>
                    <p className="text-xs text-zinc-400 truncate">
                      {activeVideo.speaker} · {activeVideo.speakerTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleShareVideo(activeVideo)}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors relative cursor-pointer"
                    title="Copy video link"
                  >
                    <Share2 className="h-4 w-4" />
                    {copyFeedback && (
                      <span className="absolute -top-7 -right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                        Copied!
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVideo(null)}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Responsive 16:9 YouTube Video Player */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>

              {/* Video Notes & Takeaways */}
              <div className="p-5 space-y-4 max-h-[35vh] overflow-y-auto">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    Executive Briefing Summary
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed mt-1">
                    {activeVideo.summary}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Masterclass Key Takeaways</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {activeVideo.takeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags and Next Plate Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeVideo.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`, '_blank', 'noopener,noreferrer')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>YouTube</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePlayNext}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Next Talk in Wheel</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. SUBMIT / ADD VIDEO TO THE WHEEL MODAL                    */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="max-w-xl p-0 border border-zinc-700 bg-zinc-950 text-white rounded-3xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 border-b border-zinc-800 bg-zinc-900/80">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-sm">
                🎡
              </span>
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  <span>Add Masterclass Video to The Wheel</span>
                  <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                    All Disciplines
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Paste any YouTube tutorial, trade seminar, code briefing, or guild lecture to make it part of The Wheel rotation.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddVideoSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {submitSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{submitSuccessMsg}</span>
              </div>
            )}

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Discipline / Enclave Target */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                <span>1. Select Profession / Enclave Discipline</span>
                <span className="text-[10px] text-zinc-400 font-mono">15 Enclaves Available</span>
              </label>
              <select
                value={submitEnclaveId}
                onChange={(e) => setSubmitEnclaveId(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                {PROFESSION_ENCLAVES.map(enc => (
                  <option key={enc.id} value={enc.id}>
                    {enc.icon} {enc.name} ({enc.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* YouTube Link / Video ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                <span>2. YouTube URL or 11-Digit Video ID *</span>
                <span className="text-[10px] text-zinc-400">e.g. https://youtu.be/... or ID</span>
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=VM8DODp68Oc"
                value={submitUrl}
                onChange={(e) => setSubmitUrl(e.target.value)}
                required
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
              />

              {/* Instant Thumbnail Live Preview */}
              {extractedVideoId && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 flex items-center gap-3">
                  <div className="relative h-14 w-24 rounded-lg overflow-hidden bg-black shrink-0 border border-zinc-700">
                    <img
                      src={`https://i.ytimg.com/vi/${extractedVideoId}/hqdefault.jpg`}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-4 w-4 text-white fill-current" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Valid Video Identified</span>
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 truncate">
                      ID: {extractedVideoId}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Masterclass Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-200">
                3. Masterclass / Briefing Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Field Pipe Radiography & Welding Inspection"
                value={submitTitle}
                onChange={(e) => setSubmitTitle(e.target.value)}
                required
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Speaker & Guild / Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-200">
                  4. Instructor / Speaker Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova or IBEW Master Trainer"
                  value={submitSpeaker}
                  onChange={(e) => setSubmitSpeaker(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-200">
                  Duration (approx)
                </label>
                <input
                  type="text"
                  placeholder="5:15"
                  value={submitDuration}
                  onChange={(e) => setSubmitDuration(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Brief Summary */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-200">
                5. Executive Briefing Summary
              </label>
              <textarea
                rows={2}
                placeholder="High-level overview of what the craftsman or practitioner will learn..."
                value={submitSummary}
                onChange={(e) => setSubmitSummary(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
              />
            </div>

            {/* 3 Key Takeaways */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                <span>6. Key Takeaways (Bullet points)</span>
                <span className="text-[10px] text-zinc-400">Core operational takeaways</span>
              </label>
              <input
                type="text"
                placeholder="• Takeaway 1 (e.g. Critical safety step or code requirement)"
                value={takeaway1}
                onChange={(e) => setTakeaway1(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="• Takeaway 2 (e.g. Equipment calibration or tool usage)"
                value={takeaway2}
                onChange={(e) => setTakeaway2(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="• Takeaway 3 (e.g. Best field practice or documentation checklist)"
                value={takeaway3}
                onChange={(e) => setTakeaway3(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-200">
                7. Hashtags
              </label>
              <input
                type="text"
                placeholder="#TradeTech #Masterclass #SafetyStandards"
                value={submitTags}
                onChange={(e) => setSubmitTags(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!extractedVideoId || !submitTitle.trim()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add to The Wheel Rotation</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
