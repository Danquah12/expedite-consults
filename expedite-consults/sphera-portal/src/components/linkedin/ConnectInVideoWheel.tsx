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
  AlertCircle,
  Copy,
  Mail,
  Send
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
  const [allTalks, setAllTalks] = useState<WheelVideoTalk[]>(EDUCATIONAL_WHEEL_TALKS)

  useEffect(() => {
    try {
      const custom = getStoredCustomVideos()
      if (custom && custom.length > 0) {
        setAllTalks([...custom, ...EDUCATIONAL_WHEEL_TALKS])
      }
    } catch (e) {
      console.error("Failed to load custom wheel videos:", e)
    }
  }, [])

  const effectiveEnclaveId = activeEnclaveId || user?.professionEnclave || 'trades_construction'
  const activeEnclave = findEnclaveById(effectiveEnclaveId)

  const [selectedFilter, setSelectedFilter] = useState<string>(defaultCategory)
  const [activeVideo, setActiveVideo] = useState<WheelVideoTalk | null>(null)
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(true)
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const disciplinesRef = useRef<HTMLDivElement>(null)
  const disciplinesPausedRef = useRef<boolean>(false)
  const disciplinesResumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Multi-Social Sharing State
  const [videoToShare, setVideoToShare] = useState<WheelVideoTalk | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)

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
    return allTalks.filter(t => t.enclaveId === selectedFilter || t.category === selectedFilter)
  }, [allTalks, selectedFilter, effectiveEnclaveId])

  // Smooth scroll left / right
  const scrollWheel = (direction: 'left' | 'right') => {
    if (!trackRef.current) return
    const offset = direction === 'left' ? -320 : 320
    trackRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  // Slow, continuous left-to-right auto-scroll for the Disciplines filter strip
  useEffect(() => {
    const el = disciplinesRef.current
    if (!el) return

    let rafId: number
    let pos = el.scrollWidth / 2
    el.scrollLeft = pos

    const step = () => {
      const node = disciplinesRef.current
      if (node && !disciplinesPausedRef.current) {
        const half = node.scrollWidth / 2
        if (half > 0) {
          pos -= 0.35 // Decrement scrollLeft so pills move visually from left to right slowly
          if (pos <= 0) {
            pos += half
          }
          node.scrollLeft = pos
        }
      } else if (node) {
        pos = node.scrollLeft
      }
      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(rafId)
      if (disciplinesResumeTimer.current) clearTimeout(disciplinesResumeTimer.current)
    }
  }, [filterChips.length])

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

  // Social Share Payload Generator
  const getVideoSharePayload = (video: WheelVideoTalk) => {
    const connectInUrl = `https://connectln.vercel.app/connectin`
    const ytUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`
    const takeaways = video.takeaways.map(t => `• ${t}`).join('\n')
    const hashtags = (video.tags || []).join(' ')
    const shareText = `🎬 ConnectIn Masterclass: "${video.title}" (${video.serialPlate})\n👤 Speaker: ${video.speaker} (${video.speakerTitle})\n🔨 Discipline: ${video.categoryLabel}\n⏱ Duration: ${video.duration}\n\n💡 Key Takeaways:\n${takeaways}\n\nWatch free on ConnectIn The Wheel: ${connectInUrl}\nOr on YouTube: ${ytUrl}\n\n${hashtags}`

    return { connectInUrl, ytUrl, shareText }
  }

  const handleShareToWhatsApp = (video: WheelVideoTalk) => {
    const { shareText } = getVideoSharePayload(video)
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {})
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    window.open(whatsappUrl, "_blank")
    setShareFeedback("Opening WhatsApp & copied briefing to clipboard!")
    setTimeout(() => setShareFeedback(null), 3500)
  }

  const handleShareToLinkedIn = (video: WheelVideoTalk) => {
    const { ytUrl } = getVideoSharePayload(video)
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(ytUrl)}`
    window.open(linkedinUrl, "_blank", "width=600,height=500")
  }

  const handleShareToFacebook = (video: WheelVideoTalk) => {
    const { ytUrl, shareText } = getVideoSharePayload(video)
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ytUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(fbUrl, "_blank", "width=600,height=500")
  }

  const handleShareToTwitter = (video: WheelVideoTalk) => {
    const { ytUrl } = getVideoSharePayload(video)
    const tweetText = `Check out this 5-min masterclass on ConnectIn The Wheel: "${video.title}" by ${video.speaker} (${video.serialPlate})`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(ytUrl)}`
    window.open(twitterUrl, "_blank", "width=600,height=500")
  }

  const handleShareToInstagram = async (video: WheelVideoTalk) => {
    const { shareText } = getVideoSharePayload(video)
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        setShareFeedback("Caption & takeaways copied! Paste into Instagram Story or DM.")
        setTimeout(() => setShareFeedback(null), 3500)
      }
    } catch (e) {
      // ignore
    }
    window.open("https://www.instagram.com", "_blank")
  }

  const handleShareToEmail = (video: WheelVideoTalk) => {
    const { shareText } = getVideoSharePayload(video)
    const subject = `[ConnectIn Masterclass] ${video.title} - ${video.speaker}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`, "_blank")
  }

  const handleCopyLink = async (video: WheelVideoTalk) => {
    const ytUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(ytUrl)
      setCopyFeedback(true)
      setShareFeedback("YouTube video link copied to clipboard!")
      setTimeout(() => {
        setCopyFeedback(false)
        setShareFeedback(null)
      }, 2500)
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

      {/* Multi-Profession Enclave Filter Chips — Slow Left-to-Right Auto-Scroll */}
      <div className="flex items-center gap-2 py-2.5 text-xs">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#EFE8DC]/50 shrink-0">
          Disciplines:
        </span>
        <div
          ref={disciplinesRef}
          onMouseEnter={() => {
            disciplinesPausedRef.current = true
            if (disciplinesResumeTimer.current) clearTimeout(disciplinesResumeTimer.current)
          }}
          onMouseLeave={() => {
            if (disciplinesResumeTimer.current) clearTimeout(disciplinesResumeTimer.current)
            disciplinesResumeTimer.current = setTimeout(() => {
              disciplinesPausedRef.current = false
            }, 600)
          }}
          onTouchStart={() => {
            disciplinesPausedRef.current = true
            if (disciplinesResumeTimer.current) clearTimeout(disciplinesResumeTimer.current)
          }}
          onTouchEnd={() => {
            if (disciplinesResumeTimer.current) clearTimeout(disciplinesResumeTimer.current)
            disciplinesResumeTimer.current = setTimeout(() => {
              disciplinesPausedRef.current = false
            }, 2500)
          }}
          onWheel={() => {
            disciplinesPausedRef.current = true
            if (disciplinesResumeTimer.current) clearTimeout(disciplinesResumeTimer.current)
            disciplinesResumeTimer.current = setTimeout(() => {
              disciplinesPausedRef.current = false
            }, 2000)
          }}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[0, 1].map(copyIdx =>
            filterChips.map(chip => (
              <button
                key={`${copyIdx}-${chip.id}`}
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
            ))
          )}
        </div>
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

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setVideoToShare(talk)
                        setIsShareModalOpen(true)
                      }}
                      className="p-1 rounded-md text-[#EFE8DC]/60 hover:text-white hover:bg-white/10 transition-colors"
                      title="Share this masterclass"
                    >
                      <Share2 className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] font-bold text-[#EFE8DC]/75 px-1.5 py-0.5 rounded bg-white/5">
                      ⏱ {talk.duration}
                    </span>
                  </div>
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
                  {/* Direct 1-Click WhatsApp Share Pill */}
                  <button
                    type="button"
                    onClick={() => handleShareToWhatsApp(activeVideo)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title="Share masterclass directly to WhatsApp"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
                    </svg>
                    <span>WhatsApp</span>
                  </button>

                  {/* Multi-Social Share Sheet Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setVideoToShare(activeVideo)
                      setIsShareModalOpen(true)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
                    title="Share to LinkedIn, Facebook, X, Instagram, Email"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share...</span>
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

                {/* Tags and Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeVideo.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(activeVideo)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copyFeedback ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copyFeedback ? "Copied!" : "Copy Link"}</span>
                    </button>
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
      {/* 2. MULTI-SOCIAL SHARE MODAL (WHATSAPP, LINKEDIN, FB, X...) */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md p-0 border border-zinc-700 bg-zinc-950 text-white rounded-3xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 border-b border-zinc-800 bg-zinc-900/80">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-sm">
                📢
              </span>
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  <span>Share Masterclass Video</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Distribute this technical briefing, blueprint guide, or guild tutorial to your professional network.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {videoToShare && (
            <div className="p-5 space-y-4">
              {/* Video Preview Card */}
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                <img
                  src={videoToShare.thumbnailUrl}
                  alt={videoToShare.title}
                  className="h-14 w-20 rounded-xl object-cover border border-zinc-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                      {videoToShare.serialPlate}
                    </span>
                    <span className="text-[10px] text-zinc-400">⏱ {videoToShare.duration}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-1">
                    {videoToShare.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {videoToShare.speaker} · {videoToShare.categoryLabel}
                  </p>
                </div>
              </div>

              {/* Feedback Alert Toast */}
              {shareFeedback && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{shareFeedback}</span>
                </div>
              )}

              {/* 6 Social Channels Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleShareToWhatsApp(videoToShare)}
                  className="p-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-emerald-200 flex items-center gap-2.5 transition-all cursor-pointer group text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">WhatsApp</p>
                    <p className="text-[10px] text-zinc-400">Share to crew / chat</p>
                  </div>
                </button>

                {/* 2. LinkedIn */}
                <button
                  type="button"
                  onClick={() => handleShareToLinkedIn(videoToShare)}
                  className="p-3 rounded-xl bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 border border-[#0A66C2]/40 text-sky-200 flex items-center gap-2.5 transition-all cursor-pointer group text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">LinkedIn</p>
                    <p className="text-[10px] text-zinc-400">Post to network</p>
                  </div>
                </button>

                {/* 3. X (Twitter) */}
                <button
                  type="button"
                  onClick={() => handleShareToTwitter(videoToShare)}
                  className="p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center gap-2.5 transition-all cursor-pointer group text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-sm border border-zinc-700 group-hover:scale-105">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">X (Twitter)</p>
                    <p className="text-[10px] text-zinc-400">Tweet briefing</p>
                  </div>
                </button>

                {/* 4. Facebook */}
                <button
                  type="button"
                  onClick={() => handleShareToFacebook(videoToShare)}
                  className="p-3 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 text-blue-200 flex items-center gap-2.5 transition-all cursor-pointer group text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Facebook</p>
                    <p className="text-[10px] text-zinc-400">Share to timeline</p>
                  </div>
                </button>

                {/* 5. Instagram */}
                <button
                  type="button"
                  onClick={() => handleShareToInstagram(videoToShare)}
                  className="p-3 rounded-xl bg-pink-950/30 hover:bg-pink-950/50 border border-pink-700/40 text-pink-200 flex items-center gap-2.5 transition-all cursor-pointer group text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Instagram</p>
                    <p className="text-[10px] text-zinc-400">Copy caption & open</p>
                  </div>
                </button>

                {/* 6. Email */}
                <button
                  type="button"
                  onClick={() => handleShareToEmail(videoToShare)}
                  className="p-3 rounded-xl bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-700/40 text-indigo-200 flex items-center gap-2.5 transition-all cursor-pointer group text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Email</p>
                    <p className="text-[10px] text-zinc-400">Send notes & link</p>
                  </div>
                </button>
              </div>

              {/* Direct Copy Video Link Bar */}
              <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300">
                  Direct Video Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://www.youtube.com/watch?v=${videoToShare.youtubeId}`}
                    className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(videoToShare)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                  >
                    {copyFeedback ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copyFeedback ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. SUBMIT / ADD VIDEO TO THE WHEEL MODAL                    */}
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
