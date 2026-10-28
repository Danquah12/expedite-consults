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
  saveStoredCustomVideo,
  getMatchedWheelVideoForUser
} from "@/lib/connectin-videos"
import { PROFESSION_ENCLAVES, ALL_PROFESSIONS, findEnclaveById } from "@/lib/connectin-professions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { UserProfile } from "@/lib/linkedin-data"
import { resolveUserProfilePicture } from "@/lib/connectin-storage"
import { VideoShareBanner } from "./VideoShareBanner"

interface ConnectInVideoWheelProps {
  className?: string
  defaultCategory?: string
  activeEnclaveId?: string
  user?: UserProfile
  title?: string
  subtitle?: string
  onOpenVideoGuide?: () => void
  onShareVideoToFeed?: (video: WheelVideoTalk) => void
}

export function ConnectInVideoWheel({
  className = "",
  defaultCategory = "all",
  activeEnclaveId,
  user,
  title = "The Wheel — Multi-Profession Masterclasses & Briefings",
  subtitle = "Expedite Consults educational talks, trade apprenticeship standards, and verified professional briefings across every profession.",
  onOpenVideoGuide,
  onShareVideoToFeed
}: ConnectInVideoWheelProps) {
  const [allTalks, setAllTalks] = useState<WheelVideoTalk[]>(EDUCATIONAL_WHEEL_TALKS)
  const userProfilePic = resolveUserProfilePicture(user)

  useEffect(() => {
    try {
      const custom = getStoredCustomVideos()
      const combined = custom && custom.length > 0 ? [...custom, ...EDUCATIONAL_WHEEL_TALKS] : EDUCATIONAL_WHEEL_TALKS
      if (custom && custom.length > 0) {
        setAllTalks(combined)
      }
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search)
        const sharedVideoId = params.get("video")
        const sharedPlate = params.get("plate")
        if (sharedVideoId || sharedPlate) {
          const found = combined.find(
            t => (sharedVideoId && t.youtubeId === sharedVideoId) || (sharedPlate && t.serialPlate === sharedPlate)
          )
          if (found) {
            setActiveVideo(found)
          }
        }
      }
    } catch (e) {
      console.error("Failed to load custom wheel videos:", e)
    }
  }, [])

  const effectiveEnclaveId = activeEnclaveId || user?.professionEnclave || 'trades_construction'
  const activeEnclave = findEnclaveById(effectiveEnclaveId)

  const [selectedFilter, setSelectedFilter] = useState<string>(defaultCategory)
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>("all")
  const [professionSearchQuery, setProfessionSearchQuery] = useState<string>("")
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

  // Video assigned to the logged-in user based on the profession selected at registration
  const assignedUserVideo = useMemo(
    () => getMatchedWheelVideoForUser(user),
    [user?.professionId, user?.profession, user?.professionEnclave, user?.headline]
  )

  // Professions available in current selected enclave filter
  const availableProfessions = useMemo(() => {
    if (selectedFilter === "all") return ALL_PROFESSIONS
    const targetEnclaveId = selectedFilter === "my_enclave" ? effectiveEnclaveId : selectedFilter
    return ALL_PROFESSIONS.filter(p => p.enclaveId === targetEnclaveId)
  }, [selectedFilter, effectiveEnclaveId])

  // Filter talks based on selected enclave, profession, and search query — always placing the user's assigned profession video first
  const filteredTalks = useMemo(() => {
    let list = allTalks
    if (selectedFilter === "my_enclave") {
      list = list.filter(t => t.enclaveId === effectiveEnclaveId)
    } else if (selectedFilter !== "all") {
      list = list.filter(t => t.enclaveId === selectedFilter || t.category === selectedFilter)
    }
    if (selectedProfessionId !== "all") {
      list = list.filter(t => t.professionId === selectedProfessionId)
    }
    const q = professionSearchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.speakerTitle.toLowerCase().includes(q) ||
          t.categoryLabel.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      )
    }

    // Place the user's assigned profession video #1 first when in default view or matching enclave/profession
    if (
      assignedUserVideo &&
      !q &&
      selectedProfessionId === "all" &&
      (selectedFilter === "all" || selectedFilter === "my_enclave" || selectedFilter === assignedUserVideo.enclaveId)
    ) {
      const rest = list.filter(t => t.id !== assignedUserVideo.id)
      return [assignedUserVideo, ...rest]
    }

    return list
  }, [allTalks, selectedFilter, effectiveEnclaveId, selectedProfessionId, professionSearchQuery, assignedUserVideo])

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
  }, [])

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

  // Social Share Payload Generator — uses ConnectLn OpenGraph Card URL so WhatsApp, LinkedIn, Facebook, and X render the Profile Picture + ConnectLn Logo Card
  const getVideoSharePayload = (video: WheelVideoTalk) => {
    const connectInUrl = `https://www.connectln.app/connectin?video=${encodeURIComponent(video.youtubeId)}&plate=${encodeURIComponent(video.serialPlate)}&v=connectln8`
    const ytUrl = video.searchUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`
    const takeaways = video.takeaways.map(t => `• ${t}`).join('\n')
    const hashtags = (video.tags || []).join(' ')
    const sharerName = user?.name || "Kwesi Asiedu"
    const shareText = `🎬 ConnectLn Masterclass: "${video.title}" (${video.serialPlate})\n👤 Shared by: ${sharerName} · Speaker: ${video.speaker} (${video.speakerTitle})\n🔨 Discipline: ${video.categoryLabel} · ⏱ ${video.duration}\n\n💡 Key Takeaways:\n${takeaways}\n\n🔗 Watch Masterclass on ConnectLn:\n${connectInUrl}\n\n${hashtags}`

    return { connectInUrl, ytUrl, shareText }
  }

  const handleShareToWhatsApp = (video: WheelVideoTalk) => {
    const { shareText } = getVideoSharePayload(video)
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {})
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    window.open(whatsappUrl, "_blank")
    setShareFeedback("Opening WhatsApp with your Profile Picture + ConnectLn Logo Card preview!")
    setTimeout(() => setShareFeedback(null), 3500)
  }

  const handleShareToLinkedIn = (video: WheelVideoTalk) => {
    const { connectInUrl } = getVideoSharePayload(video)
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(connectInUrl)}`
    window.open(linkedinUrl, "_blank", "width=600,height=500")
  }

  const handleShareToFacebook = (video: WheelVideoTalk) => {
    const { connectInUrl, shareText } = getVideoSharePayload(video)
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(connectInUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(fbUrl, "_blank", "width=600,height=500")
  }

  const handleShareToTwitter = (video: WheelVideoTalk) => {
    const { connectInUrl } = getVideoSharePayload(video)
    const tweetText = `🎬 ConnectLn Masterclass on The Wheel: "${video.title}" (${video.serialPlate}) — Shared by ${user?.name || "Kwesi Asiedu"}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(connectInUrl)}`
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
    const subject = `[ConnectLn Masterclass] ${video.title} (${video.serialPlate})`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`, "_blank")
  }

  const handleCopyLink = async (video: WheelVideoTalk) => {
    const { connectInUrl } = getVideoSharePayload(video)
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(connectInUrl)
      setCopyFeedback(true)
      setShareFeedback("ConnectLn Video Card link copied to clipboard!")
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
    if (onShareVideoToFeed) {
      onShareVideoToFeed(newTalk)
    }
    setSubmitSuccessMsg(`Successfully added "${newTalk.title}" to The Wheel & shared to your Feed with your Profile Picture!`)
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

  // Filter Categories with Counts across ALL Profession Enclaves
  const filterChips = [
    { id: "all", label: `All Briefings (${allTalks.length})`, icon: "🎡" },
    {
      id: "my_enclave",
      label: `My Enclave: ${activeEnclave?.shortName || 'Current'} (${allTalks.filter(t => t.enclaveId === effectiveEnclaveId).length})`,
      icon: activeEnclave?.icon || "🔨"
    },
    ...PROFESSION_ENCLAVES.map(enc => ({
      id: enc.id,
      label: `${enc.shortName} (${allTalks.filter(t => t.enclaveId === enc.id).length})`,
      icon: enc.icon
    }))
  ]

  return (
    <section className={`overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#1C1916] text-[#EFE8DC] p-4 sm:p-5 shadow-lg relative ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#35302B] pb-3.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              🎡
            </span>
            <h2 className="font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2 flex-wrap">
              <span>{title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 font-semibold">
                {allTalks.length} Videos Active · {ALL_PROFESSIONS.length} Professions Covered
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
          Disciplines ({PROFESSION_ENCLAVES.length}):
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
                onClick={() => {
                  setSelectedFilter(chip.id)
                  setSelectedProfessionId("all")
                }}
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

      {/* Profession Selector & Search Bar across All Professions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-1 border-b border-[#35302B] text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/90 shrink-0">
            Profession Filter:
          </span>
          <select
            value={selectedProfessionId}
            onChange={(e) => setSelectedProfessionId(e.target.value)}
            className="rounded-xl bg-[#25211D] border border-amber-500/30 px-3 py-1.5 text-[11px] font-semibold text-white focus:border-amber-400 focus:outline-none max-w-xs sm:max-w-sm cursor-pointer"
          >
            <option value="all">
              All Professions in View ({availableProfessions.length} Professions · {filteredTalks.length} Videos)
            </option>
            {availableProfessions.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.title}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={professionSearchQuery}
            onChange={(e) => setProfessionSearchQuery(e.target.value)}
            placeholder="Search any profession, trade, or skill (e.g. Plumber, Nurse, CNC, Pilot, Chef)..."
            className="flex-1 min-w-[180px] rounded-xl bg-[#25211D] border border-white/15 px-3 py-1.5 text-[11px] text-white placeholder:text-[#EFE8DC]/40 focus:border-amber-400 focus:outline-none"
          />

          {(selectedFilter !== "all" || selectedProfessionId !== "all" || professionSearchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedFilter("all")
                setSelectedProfessionId("all")
                setProfessionSearchQuery("")
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-semibold text-amber-300 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
        <span className="text-[10px] font-mono text-[#EFE8DC]/60 shrink-0">
          Showing {filteredTalks.length} Masterclass{filteredTalks.length === 1 ? "" : "es"}
        </span>
      </div>

      {/* Assigned Profession Video Highlight Bar — Matches User's Registered Profession */}
      {assignedUserVideo && (
        <div
          onClick={() => setActiveVideo(assignedUserVideo)}
          className="mb-2.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-[#26201A] via-[#2B241D] to-[#1F1B18] p-2.5 sm:px-3.5 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 cursor-pointer hover:border-amber-400 transition-all shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-[#0066FF] shrink-0 bg-zinc-900">
              <img
                src={userProfilePic}
                alt={user?.name || "Member"}
                onError={(e) => {
                  e.currentTarget.src = "/brand/kwesi-avatar.png"
                }}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                  🎯 Assigned to Your Profession
                </span>
                <span className="rounded bg-[#A64532] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                  {assignedUserVideo.serialPlate}
                </span>
                {user?.profession && (
                  <span className="text-[10px] font-semibold text-sky-300">
                    · {user.profession}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-white leading-snug break-words mt-0.5">
                {assignedUserVideo.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setActiveVideo(assignedUserVideo)
              }}
              style={{ backgroundColor: "#A64532", color: "#FFFFFF" }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>{assignedUserVideo.searchUrl ? "Find Videos for My Profession" : "Watch My Profession Video"}</span>
            </button>
          </div>
        </div>
      )}

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
            const isAssignedToUser = assignedUserVideo?.id === talk.id
            return (
              <div
                key={talk.id}
                onClick={() => setActiveVideo(talk)}
                className={`group relative h-[19.5rem] w-[14.5rem] sm:w-[16rem] shrink-0 snap-center rounded-2xl overflow-hidden border bg-[#25211D] hover:border-[#0066FF] transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between shadow-md ${
                  isAssignedToUser ? "border-amber-400 ring-1 ring-amber-400/50" : "border-[#3E3832]"
                }`}
              >
                {/* Top Serial Plate Badge */}
                <div className="p-2.5 flex items-center justify-between border-b border-[#35302B] bg-[#1F1B18]/90 z-10">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border"
                      style={{ backgroundColor: '#0F172A', color: '#FBBF24', borderColor: '#F59E0B' }}
                    >
                      {talk.serialPlate}
                    </span>
                    {talk.isCommunitySubmission && (
                      <span
                        className="text-[8px] font-mono px-1 py-0.2 rounded border"
                        style={{ backgroundColor: '#1E1B4B', color: '#A5B4FC', borderColor: '#4338CA' }}
                        title="Submitted by verified member"
                      >
                        Guild
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Direct 1-Click WhatsApp Share on Card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShareToWhatsApp(talk)
                      }}
                      style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
                      className="px-1.5 py-0.5 rounded-full hover:opacity-90 text-[9px] font-bold flex items-center gap-1 transition-opacity shadow-xs cursor-pointer"
                      title="Share directly to WhatsApp"
                    >
                      <svg className="w-2.5 h-2.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setVideoToShare(talk)
                        setIsShareModalOpen(true)
                      }}
                      style={{ backgroundColor: '#0066FF', color: '#FFFFFF' }}
                      className="px-2 py-0.5 rounded-full hover:opacity-90 text-[9px] font-bold flex items-center gap-1 transition-opacity shadow-xs cursor-pointer"
                      title="Share with your Profile Picture + ConnectLn Logo Card"
                    >
                      <Share2 className="h-2.5 w-2.5" />
                      <span>Share</span>
                    </button>
                    {talk.duration ? (
                      <span className="text-[10px] font-bold text-[#EFE8DC]/75 px-1.5 py-0.5 rounded bg-white/5">
                        ⏱ {talk.duration}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Video Thumbnail with Play Button Overlay + Circular Blue-Ringed Profile Picture */}
                <div className="relative flex-1 overflow-hidden bg-black/40">
                  {talk.thumbnailUrl ? (
                    <img
                      src={talk.thumbnailUrl}
                      alt={talk.title}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-1 bg-linear-to-br from-[#2a2420] to-[#3a1f19]">
                      <span className="text-4xl">{talkEnclave?.icon || "🎓"}</span>
                      <span className="text-[10px] text-[#EFE8DC]/70">No verified video yet</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-[#1C1916] via-[#1C1916]/40 to-transparent" />

                  {/* Signature Left Circular Profile Picture with ConnectLn Logo Pill */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full bg-[#171513]/90 pr-2.5 p-0.5 border border-[#A64532]/70 backdrop-blur-xs shadow-md">
                    <img
                      src={userProfilePic}
                      alt={user?.name || "Kwesi Asiedu"}
                      onError={(e) => {
                        e.currentTarget.src = "/brand/kwesi-avatar.png"
                      }}
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-[#0066FF]"
                    />
                    <img
                      src="/brand/connectln-icon.png"
                      alt="ConnectLn"
                      className="h-4 w-4 rounded-xs object-contain"
                    />
                    <span className="text-[9px] font-extrabold tracking-tight text-[#F5F0EB]">
                      ConnectLn
                    </span>
                  </div>

                  {/* Centered Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-11 w-11 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform group-hover:bg-amber-400">
                      {talk.searchUrl ? <span className="text-base">🔎</span> : <Play className="h-5 w-5 fill-current ml-0.5" />}
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
          <span>🎓</span>
          <span>
            Covers all 20 professional enclaves: {allTalks.filter((t) => !t.searchUrl).length} with a verified video, and a YouTube career search for the other {allTalks.filter((t) => t.searchUrl).length}. Every shared video inserts your Profile Picture into the ConnectLn Logo Card.
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
        <DialogContent
          className="max-w-3xl max-h-[92vh] flex flex-col p-0 border rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
        >
          {activeVideo && (
            <div className="flex flex-col max-h-[92vh] overflow-hidden">
              {/* Header: Top Title Row + Post to ConnectLn Feed + Close X */}
              <div
                className="shrink-0 p-3 sm:p-3.5 border-b"
                style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
              >
                <div className="flex items-center justify-between gap-2.5 pr-6 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={userProfilePic}
                      alt={user?.name || "Kwesi Asiedu"}
                      onError={(e) => {
                        e.currentTarget.src = "/brand/kwesi-avatar.png"
                      }}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-[#0066FF] shrink-0"
                    />
                    <span
                      className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md border shrink-0 shadow-2xs"
                      style={{ backgroundColor: '#0F172A', color: '#FBBF24', borderColor: '#F59E0B' }}
                    >
                      {activeVideo.serialPlate}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2
                        className="font-extrabold text-xs sm:text-sm leading-snug break-words"
                        style={{ color: '#0F172A' }}
                      >
                        {activeVideo.title}
                      </h2>
                      <p className="text-[11px] font-medium leading-snug break-words" style={{ color: '#475569' }}>
                        {activeVideo.speaker} · {activeVideo.speakerTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onShareVideoToFeed && (
                      <button
                        type="button"
                        onClick={() => {
                          onShareVideoToFeed(activeVideo)
                          setShareFeedback("✓ Posted to your ConnectLn Feed with your Profile Picture + ConnectLn Card!")
                          setTimeout(() => setShareFeedback(null), 3500)
                          setActiveVideo(null)
                        }}
                        style={{ backgroundColor: '#0066FF', color: '#FFFFFF' }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer hover:opacity-95"
                        title="Share video to ConnectLn Feed with your profile picture banner"
                      >
                        <Send className="h-3 w-3" />
                        <span>Post to ConnectLn Feed</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveVideo(null)}
                      style={{ backgroundColor: '#1E293B', color: '#FFFFFF' }}
                      className="p-1.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Modal Body */}
              <div
                className="flex-1 overflow-y-auto"
                style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}
              >
                {/* Balanced YouTube Video Player */}
                <div className="relative h-[220px] sm:h-[260px] w-full bg-black">
                  {activeVideo.searchUrl ? (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-3 p-4 text-center bg-linear-to-br from-[#1C1916] to-[#3a1f19]">
                      <p className="text-sm font-bold text-[#EFE8DC]">No verified video for this career yet</p>
                      <p className="text-xs text-[#EFE8DC]/70 max-w-xs">Watch real career videos for {activeVideo.title.replace(/ — Career Masterclass.*$/, '')} on YouTube.</p>
                      <button
                        onClick={() => window.open(activeVideo.searchUrl, '_blank', 'noopener,noreferrer')}
                        className="rounded-full bg-[#A64532] hover:bg-[#8c3a2a] text-white px-4 py-2 text-xs font-bold cursor-pointer"
                      >
                        ▶ Find career videos on YouTube
                      </button>
                    </div>
                  ) : (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  )}
                </div>

                {/* Video Notes, Signature Profile Picture + ConnectLn Card, Takeaways & Single Bottom Share Bar */}
                <div
                  className="p-3.5 sm:p-5 space-y-4"
                  style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}
                >
                  {/* Signature Profile Picture + ConnectLn Video Share Card (Middle duplicate share bar hidden) */}
                  {!activeVideo.searchUrl && (
                  <VideoShareBanner
                    compact
                    hideShareBar
                    avatarUrl={userProfilePic}
                    authorName={user?.name || "Kwesi Asiedu"}
                    authorHeadline={user?.headline || activeVideo.speakerTitle}
                    brandName="ConnectLn"
                    videoTitle={activeVideo.title}
                    videoSubtitle={`${activeVideo.speaker} · ${activeVideo.categoryLabel}`}
                    youtubeId={activeVideo.youtubeId}
                    thumbnailUrl={activeVideo.thumbnailUrl}
                    videoUrl={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                    duration={activeVideo.duration}
                    serialPlate={activeVideo.serialPlate}
                    takeaways={activeVideo.takeaways}
                  />
                  )}

                <div>
                  <h3
                    className="text-xs font-mono font-extrabold uppercase tracking-wider"
                    style={{ color: '#0066FF' }}
                  >
                    Executive Briefing Summary
                  </h3>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed mt-1" style={{ color: '#1E293B' }}>
                    {activeVideo.summary}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div
                  className="rounded-2xl p-3.5 sm:p-4 border space-y-2"
                  style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}
                >
                  <h4 className="text-xs font-extrabold flex items-center gap-1.5" style={{ color: '#0F172A' }}>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Masterclass Key Takeaways</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs font-medium" style={{ color: '#1E293B' }}>
                    {activeVideo.takeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-extrabold shrink-0 mt-0.5" style={{ color: '#0066FF' }}>•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* BOTTOM SECTION: High-Contrast Hashtags + Single Clean Multi-Platform Sharing Bar + Action Buttons */}
                <div
                  className="pt-3 border-t space-y-3"
                  style={{ borderColor: '#CBD5E1' }}
                >
                  {/* 1. High-Contrast Hashtags Row + Action Buttons (Copy Link, YouTube, Next Talk) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {activeVideo.tags.map(tag => (
                        <span
                          key={tag}
                          style={{ backgroundColor: '#DBEAFE', color: '#1E3A8A', border: '1px solid #93C5FD' }}
                          className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full shadow-2xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(activeVideo)}
                        style={{ backgroundColor: '#1E293B', color: '#FFFFFF', border: '1px solid #0F172A' }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                      >
                        {copyFeedback ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span style={{ color: '#FFFFFF' }}>{copyFeedback ? "Copied!" : "Copy Link"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(activeVideo.searchUrl || `https://www.youtube.com/watch?v=${activeVideo.youtubeId}`, '_blank', 'noopener,noreferrer')}
                        style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span style={{ color: '#FFFFFF' }}>YouTube</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePlayNext}
                        style={{ backgroundColor: '#0066FF', color: '#FFFFFF' }}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                      >
                        <span style={{ color: '#FFFFFF' }}>Next Talk in Wheel</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* 2. Single Dedicated Bottom Multi-Platform Sharing Strip (WhatsApp, LinkedIn, X, Facebook, Instagram, Email) */}
                  <div
                    className="p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2"
                    style={{ backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }}
                  >
                    <span className="text-xs font-extrabold flex items-center gap-1.5" style={{ color: '#0F172A' }}>
                      <Share2 className="h-3.5 w-3.5" style={{ color: '#0066FF' }} />
                      <span>Share to Other Platforms:</span>
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* WhatsApp */}
                      <button
                        type="button"
                        onClick={() => handleShareToWhatsApp(activeVideo)}
                        style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
                        </svg>
                        <span style={{ color: '#FFFFFF' }}>WhatsApp</span>
                      </button>

                      {/* LinkedIn */}
                      <button
                        type="button"
                        onClick={() => handleShareToLinkedIn(activeVideo)}
                        style={{ backgroundColor: '#0A66C2', color: '#FFFFFF' }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <span style={{ color: '#FFFFFF' }}>LinkedIn</span>
                      </button>

                      {/* X (Twitter) */}
                      <button
                        type="button"
                        onClick={() => handleShareToTwitter(activeVideo)}
                        style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <span style={{ color: '#FFFFFF' }}>X (Twitter)</span>
                      </button>

                      {/* Facebook */}
                      <button
                        type="button"
                        onClick={() => handleShareToFacebook(activeVideo)}
                        style={{ backgroundColor: '#1877F2', color: '#FFFFFF' }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <span style={{ color: '#FFFFFF' }}>Facebook</span>
                      </button>

                      {/* Instagram */}
                      <button
                        type="button"
                        onClick={() => handleShareToInstagram(activeVideo)}
                        style={{ backgroundColor: '#E1306C', color: '#FFFFFF' }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <span style={{ color: '#FFFFFF' }}>Instagram</span>
                      </button>

                      {/* Email */}
                      <button
                        type="button"
                        onClick={() => handleShareToEmail(activeVideo)}
                        style={{ backgroundColor: '#4F46E5', color: '#FFFFFF' }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span style={{ color: '#FFFFFF' }}>Email</span>
                      </button>
                    </div>
                  </div>
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
        <DialogContent
          className="max-w-2xl max-h-[92vh] flex flex-col p-0 border rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
        >
          <DialogHeader
            className="shrink-0 p-4 sm:p-5 border-b"
            style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="p-2 rounded-xl border text-sm"
                style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
              >
                📢
              </span>
              <div>
                <DialogTitle className="text-base font-extrabold flex items-center gap-2" style={{ color: '#0F172A' }}>
                  <span>Share Masterclass Video with Your ConnectLn Profile Card</span>
                </DialogTitle>
                <DialogDescription className="text-xs font-medium mt-0.5" style={{ color: '#475569' }}>
                  Your shared video automatically inserts your circular profile picture into the official ConnectLn logo card.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {videoToShare && (
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>
              {/* Signature Profile Picture + ConnectLn Video Share Banner Preview */}
              <VideoShareBanner
                compact
                hideShareBar
                avatarUrl={userProfilePic}
                authorName={user?.name || "Kwesi Asiedu"}
                authorHeadline={user?.headline || videoToShare.speakerTitle}
                brandName="ConnectLn"
                videoTitle={videoToShare.title}
                videoSubtitle={`${videoToShare.speaker} · ${videoToShare.categoryLabel}`}
                youtubeId={videoToShare.youtubeId}
                thumbnailUrl={videoToShare.thumbnailUrl}
                videoUrl={`https://www.youtube.com/watch?v=${videoToShare.youtubeId}`}
                duration={videoToShare.duration}
                serialPlate={videoToShare.serialPlate}
                takeaways={videoToShare.takeaways}
              />

              {/* Primary 1-Click Share to ConnectIn Feed Button */}
              {onShareVideoToFeed && (
                <button
                  type="button"
                  onClick={() => {
                    onShareVideoToFeed(videoToShare)
                    setShareFeedback("✓ Shared to your ConnectIn Feed with your Profile Picture + Video Banner!")
                    setTimeout(() => {
                      setShareFeedback(null)
                      setIsShareModalOpen(false)
                    }, 1800)
                  }}
                  style={{ backgroundColor: '#0066FF', color: '#FFFFFF' }}
                  className="w-full py-3 px-4 rounded-2xl hover:opacity-95 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-opacity cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span style={{ color: '#FFFFFF' }}>Post Video Card to My ConnectIn Feed Now</span>
                </button>
              )}

              {/* Feedback Alert Toast */}
              {shareFeedback && (
                <div
                  className="p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in"
                  style={{ backgroundColor: '#ECFDF5', borderColor: '#6EE7B7', color: '#065F46' }}
                >
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{shareFeedback}</span>
                </div>
              )}

              {/* 6 Social Channels Grid with High-Contrast Explicit Colors */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* 1. WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleShareToWhatsApp(videoToShare)}
                  style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
                  className="p-3 rounded-xl flex items-center gap-2.5 transition-transform hover:scale-[1.02] cursor-pointer shadow-sm text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold" style={{ color: '#FFFFFF' }}>WhatsApp</p>
                    <p className="text-[10px] font-medium" style={{ color: '#ECFDF5' }}>Share to crew / chat</p>
                  </div>
                </button>

                {/* 2. LinkedIn */}
                <button
                  type="button"
                  onClick={() => handleShareToLinkedIn(videoToShare)}
                  style={{ backgroundColor: '#0A66C2', color: '#FFFFFF' }}
                  className="p-3 rounded-xl flex items-center gap-2.5 transition-transform hover:scale-[1.02] cursor-pointer shadow-sm text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold" style={{ color: '#FFFFFF' }}>LinkedIn</p>
                    <p className="text-[10px] font-medium" style={{ color: '#E0F2FE' }}>Post to network</p>
                  </div>
                </button>

                {/* 3. X (Twitter) */}
                <button
                  type="button"
                  onClick={() => handleShareToTwitter(videoToShare)}
                  style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}
                  className="p-3 rounded-xl flex items-center gap-2.5 transition-transform hover:scale-[1.02] cursor-pointer shadow-sm text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold" style={{ color: '#FFFFFF' }}>X (Twitter)</p>
                    <p className="text-[10px] font-medium" style={{ color: '#CBD5E1' }}>Tweet briefing</p>
                  </div>
                </button>

                {/* 4. Facebook */}
                <button
                  type="button"
                  onClick={() => handleShareToFacebook(videoToShare)}
                  style={{ backgroundColor: '#1877F2', color: '#FFFFFF' }}
                  className="p-3 rounded-xl flex items-center gap-2.5 transition-transform hover:scale-[1.02] cursor-pointer shadow-sm text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold" style={{ color: '#FFFFFF' }}>Facebook</p>
                    <p className="text-[10px] font-medium" style={{ color: '#DBEAFE' }}>Share to timeline</p>
                  </div>
                </button>

                {/* 5. Instagram */}
                <button
                  type="button"
                  onClick={() => handleShareToInstagram(videoToShare)}
                  style={{ backgroundColor: '#E1306C', color: '#FFFFFF' }}
                  className="p-3 rounded-xl flex items-center gap-2.5 transition-transform hover:scale-[1.02] cursor-pointer shadow-sm text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold" style={{ color: '#FFFFFF' }}>Instagram</p>
                    <p className="text-[10px] font-medium" style={{ color: '#FCE7F3' }}>Copy caption &amp; open</p>
                  </div>
                </button>

                {/* 6. Email */}
                <button
                  type="button"
                  onClick={() => handleShareToEmail(videoToShare)}
                  style={{ backgroundColor: '#4F46E5', color: '#FFFFFF' }}
                  className="p-3 rounded-xl flex items-center gap-2.5 transition-transform hover:scale-[1.02] cursor-pointer shadow-sm text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold" style={{ color: '#FFFFFF' }}>Email</p>
                    <p className="text-[10px] font-medium" style={{ color: '#E0E7FF' }}>Send notes &amp; link</p>
                  </div>
                </button>
              </div>

              {/* Direct Copy Video Share Card Link Bar */}
              <div className="pt-3 border-t space-y-1.5" style={{ borderColor: '#E2E8F0' }}>
                <label className="text-[11px] font-extrabold" style={{ color: '#0F172A' }}>
                  Direct Share Card Link (Includes Profile Picture + ConnectLn Logo Card Preview)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://www.connectln.app/connectin?video=${videoToShare.youtubeId}&plate=${videoToShare.serialPlate}&v=connectln5`}
                    style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                    className="flex-1 rounded-xl border px-3 py-2 text-xs font-mono font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(videoToShare)}
                    style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}
                    className="px-4 py-2 rounded-xl hover:opacity-90 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                  >
                    {copyFeedback ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span style={{ color: '#FFFFFF' }}>{copyFeedback ? "Copied" : "Copy"}</span>
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
        <DialogContent
          className="max-w-xl p-0 border rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
        >
          <DialogHeader
            className="p-5 border-b"
            style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="p-2 rounded-xl border text-sm"
                style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
              >
                🎡
              </span>
              <div>
                <DialogTitle className="text-base font-extrabold flex items-center gap-2" style={{ color: '#0F172A' }}>
                  <span>Add Masterclass Video to The Wheel</span>
                  <span
                    className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border"
                    style={{ backgroundColor: '#0F172A', color: '#FBBF24', borderColor: '#F59E0B' }}
                  >
                    All Disciplines
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs font-medium mt-0.5" style={{ color: '#475569' }}>
                  Paste any YouTube tutorial, trade seminar, code briefing, or guild lecture to make it part of The Wheel rotation.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleAddVideoSubmit}
            className="p-5 space-y-4 max-h-[75vh] overflow-y-auto"
            style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}
          >
            {submitSuccessMsg && (
              <div
                className="p-3 rounded-xl border text-xs font-bold flex items-center gap-2"
                style={{ backgroundColor: '#ECFDF5', borderColor: '#6EE7B7', color: '#065F46' }}
              >
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{submitSuccessMsg}</span>
              </div>
            )}

            {submitError && (
              <div
                className="p-3 rounded-xl border text-xs font-bold flex items-center gap-2"
                style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', color: '#991B1B' }}
              >
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Discipline / Enclave Target */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold flex items-center justify-between" style={{ color: '#0F172A' }}>
                <span>1. Select Profession / Enclave Discipline</span>
                <span className="text-[10px] font-mono" style={{ color: '#475569' }}>15 Enclaves Available</span>
              </label>
              <select
                value={submitEnclaveId}
                onChange={(e) => setSubmitEnclaveId(e.target.value)}
                style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                className="w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0066FF]"
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
              <label className="text-xs font-extrabold flex items-center justify-between" style={{ color: '#0F172A' }}>
                <span>2. YouTube URL or 11-Digit Video ID *</span>
                <span className="text-[10px]" style={{ color: '#475569' }}>e.g. https://youtu.be/... or ID</span>
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=VM8DODp68Oc"
                value={submitUrl}
                onChange={(e) => setSubmitUrl(e.target.value)}
                required
                style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                className="w-full rounded-xl border px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:border-[#0066FF]"
              />

              {/* Instant Signature Profile Picture + DSTRIKE Video Banner Live Preview */}
              {extractedVideoId && (
                <div className="pt-1 space-y-1.5">
                  <p className="text-[11px] font-extrabold flex items-center gap-1" style={{ color: '#059669' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Valid Video Identified — Your Signature Profile + Video Share Card Preview:</span>
                  </p>
                  <VideoShareBanner
                    compact
                    avatarUrl={userProfilePic}
                    authorName={submitSpeaker.trim() || user?.name || "Kwesi Asiedu"}
                    authorHeadline={submitSpeakerTitle.trim() || user?.headline || "Verified Guild Master"}
                    brandName="DSTRIKE"
                    videoTitle={submitTitle.trim() || "Masterclass Technical Briefing"}
                    videoSubtitle={submitSummary.trim() || "ConnectIn Verified Video Masterclass"}
                    youtubeId={extractedVideoId}
                    thumbnailUrl={`https://i.ytimg.com/vi/${extractedVideoId}/hqdefault.jpg`}
                    videoUrl={`https://www.youtube.com/watch?v=${extractedVideoId}`}
                    duration={submitDuration.trim() || "5:00"}
                    serialPlate="CLN-NEW"
                    takeaways={[takeaway1, takeaway2, takeaway3].filter(Boolean)}
                  />
                </div>
              )}
            </div>

            {/* Masterclass Title */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold" style={{ color: '#0F172A' }}>
                3. Masterclass / Briefing Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Field Pipe Radiography & Welding Inspection"
                value={submitTitle}
                onChange={(e) => setSubmitTitle(e.target.value)}
                required
                style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                className="w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            {/* Speaker & Guild / Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-extrabold" style={{ color: '#0F172A' }}>
                  4. Instructor / Speaker Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova or IBEW Master Trainer"
                  value={submitSpeaker}
                  onChange={(e) => setSubmitSpeaker(e.target.value)}
                  style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                  className="w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold" style={{ color: '#0F172A' }}>
                  Duration (approx)
                </label>
                <input
                  type="text"
                  placeholder="5:15"
                  value={submitDuration}
                  onChange={(e) => setSubmitDuration(e.target.value)}
                  style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                  className="w-full rounded-xl border px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>

            {/* Brief Summary */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold" style={{ color: '#0F172A' }}>
                5. Executive Briefing Summary
              </label>
              <textarea
                rows={2}
                placeholder="High-level overview of what the craftsman or practitioner will learn..."
                value={submitSummary}
                onChange={(e) => setSubmitSummary(e.target.value)}
                style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                className="w-full rounded-xl border px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0066FF] leading-relaxed resize-none"
              />
            </div>

            {/* 3 Key Takeaways */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold flex items-center justify-between" style={{ color: '#0F172A' }}>
                <span>6. Key Takeaways (Bullet points)</span>
                <span className="text-[10px]" style={{ color: '#475569' }}>Core operational takeaways</span>
              </label>
              <input
                type="text"
                placeholder="• Takeaway 1 (e.g. Critical safety step or code requirement)"
                value={takeaway1}
                onChange={(e) => setTakeaway1(e.target.value)}
                style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                className="w-full rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0066FF]"
              />
              <input
                type="text"
                placeholder="• Takeaway 2 (e.g. Equipment calibration or tool usage)"
                value={takeaway2}
                onChange={(e) => setTakeaway2(e.target.value)}
                style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                className="w-full rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0066FF]"
              />
              <input
                type="text"
                placeholder="• Takeaway 3 (e.g. Best field practice or documentation checklist)"
                value={takeaway3}
                onChange={(e) => setTakeaway3(e.target.value)}
                style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                className="w-full rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold" style={{ color: '#0F172A' }}>
                7. Hashtags
              </label>
              <input
                type="text"
                placeholder="#TradeTech #Masterclass #SafetyStandards"
                value={submitTags}
                onChange={(e) => setSubmitTags(e.target.value)}
                style={{ backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
                className="w-full rounded-xl border px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t" style={{ borderColor: '#E2E8F0' }}>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                style={{ backgroundColor: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1' }}
                className="px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!extractedVideoId || !submitTitle.trim()}
                style={{ backgroundColor: '#0066FF', color: '#FFFFFF' }}
                className="px-5 py-2 rounded-xl hover:opacity-90 font-extrabold text-xs shadow-md transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
                <span style={{ color: '#FFFFFF' }}>Add to The Wheel Rotation</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
