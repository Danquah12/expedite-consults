"use client"

import React, { useState, useMemo, useRef } from "react"
import {
  Image as ImageIcon,
  Sparkles,
  FileText,
  Globe,
  Users,
  X,
  Send,
  Plus,
  Vote,
  BookOpen,
  Video,
  Upload,
  Check,
  Trash2
} from "lucide-react"
import { UserProfile, Post, PollData, DocumentSlide } from "@/lib/connectln-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AIPostModal } from "./AIPostModal"
import { PostImpactSimulator } from "./PostImpactSimulator"
import { useLanguage } from "@/context/LanguageContext"
import { VideoShareBanner } from "./VideoShareBanner"
import { extractYouTubeId } from "@/lib/connectin-videos"

interface PostCreatorProps {
  user: UserProfile
  onAddPost: (post: Omit<Post, 'id' | 'timestamp' | 'stats' | 'comments'>) => void
}

const SLIDE_BG_COLORS = [
  "from-blue-600 to-indigo-900",
  "from-sky-600 to-cyan-900",
  "from-emerald-600 to-teal-900",
  "from-amber-600 to-orange-900",
  "from-purple-600 to-indigo-950",
  "from-zinc-700 to-zinc-950"
]

export function PostCreator({ user, onAddPost }: PostCreatorProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [activeMode, setActiveMode] = useState<'standard' | 'poll' | 'celebrate' | 'document'>('standard')
  const [content, setContent] = useState("")
  const [selectedVisibility, setSelectedVisibility] = useState<'Public' | 'Connections'>('Public')
  const [mediaUrl, setMediaUrl] = useState("")
  const [mediaKind, setMediaKind] = useState<'image' | 'video'>('video')
  const [imageVisualStyle, setImageVisualStyle] = useState<'standard' | 'poster_frame' | 'editorial_podium' | 'news_portrait'>('standard')
  const [imageOverlayTitle, setImageOverlayTitle] = useState("")
  const [imageOverlaySubtitle, setImageOverlaySubtitle] = useState("")
  const [videoTitleInput, setVideoTitleInput] = useState("")
  const [videoBrandInput, setVideoBrandInput] = useState("ConnectLn")
  const [videoDurationInput, setVideoDurationInput] = useState("4:30")
  const [showMediaInput, setShowMediaInput] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [publishNotice, setPublishNotice] = useState<string | null>(null)

  // File Input Refs
  const imageFileInputRef = useRef<HTMLInputElement | null>(null)
  const videoFileInputRef = useRef<HTMLInputElement | null>(null)
  const docFileInputRef = useRef<HTMLInputElement | null>(null)

  // Poll Form State
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""])
  const [pollDuration, setPollDuration] = useState("1 week")

  // Celebration Form State
  const defaultProfTitle = user.profession || "Verified Specialist"
  const [celebrationType, setCelebrationType] = useState<'new_job' | 'anniversary' | 'certificate' | 'project'>('project')
  const [celebrationBadge, setCelebrationBadge] = useState("🎉")
  const [celebrationHeadline, setCelebrationHeadline] = useState(`Completed a Major ${defaultProfTitle} Milestone`)

  // Document Form State
  const [docTitle, setDocTitle] = useState(`${defaultProfTitle.replace(/\s+/g, "_")}_Field_Standards_2026.pdf`)
  const [docFileUrl, setDocFileUrl] = useState<string | undefined>(undefined)
  const [docFileSize, setDocFileSize] = useState<string | undefined>(undefined)
  const [docSlides, setDocSlides] = useState<DocumentSlide[]>([
    {
      slideNumber: 1,
      title: `01 / ${defaultProfTitle} Scope & Precision Standards`,
      content: "Verify all layout measurements, material specifications, and safety tolerances prior to execution.",
      visualTag: "FIELD STANDARD",
      bgColor: "from-blue-600 to-indigo-900"
    },
    {
      slideNumber: 2,
      title: "02 / Quality Control & Final Sign-Off",
      content: "Complete multi-point inspection checklist and document proof-of-work deliverables for client handoff.",
      visualTag: "VERIFICATION",
      bgColor: "from-sky-600 to-cyan-900"
    }
  ])

  const suggestedHashtags = useMemo(() => {
    const profTag = `#${(user.profession || "ConnectLn").replace(/[^a-zA-Z0-9]/g, "")}`
    return Array.from(
      new Set([
        profTag,
        "#ConnectLn",
        "#ProofOfWork",
        "#Craftsmanship",
        "#Leadership",
        "#ProfessionalStandards",
        "#Hiring"
      ])
    )
  }, [user.profession])

  // Automatically detect if user pasted a video link inside post content or mediaUrl
  const detectedYoutubeId = useMemo(() => {
    const fromMedia = extractYouTubeId(mediaUrl)
    if (fromMedia) return fromMedia
    const urlMatch = content.match(
      /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    )
    return urlMatch ? urlMatch[1] : null
  }, [mediaUrl, content])

  const isVideoDetected = useMemo(() => {
    if (detectedYoutubeId) return true
    if (
      mediaUrl &&
      (mediaKind === 'video' ||
        mediaUrl.startsWith('blob:') ||
        mediaUrl.startsWith('data:video/') ||
        mediaUrl.endsWith('.mp4') ||
        mediaUrl.endsWith('.webm') ||
        mediaUrl.includes('youtube') ||
        mediaUrl.includes('youtu.be') ||
        mediaUrl.includes('vimeo'))
    ) {
      return true
    }
    return false
  }, [detectedYoutubeId, mediaUrl, mediaKind])

  const validPollOptions = useMemo(
    () => pollOptions.map((o) => o.trim()).filter((o) => o.length > 0),
    [pollOptions]
  )

  const canSubmit = useMemo(() => {
    if (activeMode === 'poll') {
      return pollQuestion.trim().length > 0 && validPollOptions.length >= 2
    }
    if (activeMode === 'celebrate') {
      return celebrationHeadline.trim().length > 0 || content.trim().length > 0
    }
    if (activeMode === 'document') {
      return docTitle.trim().length > 0 && docSlides.some((s) => s.title.trim().length > 0)
    }
    return Boolean(content.trim().length > 0 || mediaUrl.trim().length > 0 || detectedYoutubeId)
  }, [activeMode, pollQuestion, validPollOptions, celebrationHeadline, content, docTitle, docSlides, mediaUrl, detectedYoutubeId])

  const triggerPublishToast = (label: string) => {
    setPublishNotice(label)
    setTimeout(() => {
      setPublishNotice((prev) => (prev === label ? null : prev))
    }, 4000)
  }

  // Handle Image Upload from Computer/Phone (Compressed Data URL for persistent storage)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const rawDataUrl = String(reader.result || "")
      const img = new window.Image()
      img.onload = () => {
        try {
          const maxDim = 1200
          let w = img.width
          let h = img.height
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w)
              w = maxDim
            } else {
              w = Math.round((w * maxDim) / h)
              h = maxDim
            }
          }
          const canvas = document.createElement("canvas")
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h)
            const compressed = canvas.toDataURL("image/jpeg", 0.85)
            setMediaKind('image')
            setMediaUrl(compressed)
            setShowMediaInput(true)
            if (!imageOverlayTitle) {
              setImageOverlayTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
            }
            return
          }
        } catch {}
        setMediaKind('image')
        setMediaUrl(rawDataUrl)
        setShowMediaInput(true)
      }
      img.onerror = () => {
        setMediaKind('image')
        setMediaUrl(rawDataUrl)
        setShowMediaInput(true)
      }
      img.src = rawDataUrl
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // Handle Video File Upload from Computer/Phone
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setMediaKind('video')
    setMediaUrl(objectUrl)
    setShowMediaInput(true)
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
    if (!videoTitleInput.trim()) {
      setVideoTitleInput(cleanName)
    }
    e.target.value = ""
  }

  // Handle Document File Upload from Computer/Phone (.pdf, .docx, .pptx, .txt, .md, .csv)
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDocTitle(file.name)
    const sizeKb = Math.max(1, Math.round(file.size / 1024))
    setDocFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`)
    const objectUrl = URL.createObjectURL(file)
    setDocFileUrl(objectUrl)

    const cleanBaseTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
    if (file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name)) {
      const reader = new FileReader()
      reader.onload = () => {
        const text = String(reader.result || "").trim()
        if (text) {
          const paragraphs = text
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .slice(0, 4)
          if (paragraphs.length > 0) {
            setDocSlides(
              paragraphs.map((para, idx) => ({
                slideNumber: idx + 1,
                title: `0${idx + 1} / ${cleanBaseTitle} — Section ${idx + 1}`,
                content: para.slice(0, 280),
                visualTag: idx === 0 ? "EXECUTIVE SUMMARY" : `SECTION 0${idx + 1}`,
                bgColor: SLIDE_BG_COLORS[idx % SLIDE_BG_COLORS.length]
              }))
            )
          }
        }
      }
      reader.readAsText(file)
    } else {
      setDocSlides((prev) => [
        {
          slideNumber: 1,
          title: `01 / ${cleanBaseTitle} — Overview`,
          content: `Uploaded document (${file.name} · ${sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`}). Use the slide arrows to review key highlights or download the full specification.`,
          visualTag: "ATTACHED DOCUMENT",
          bgColor: "from-blue-600 to-indigo-900"
        },
        ...prev.slice(1)
      ])
    }
    e.target.value = ""
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    let pollData: PollData | undefined = undefined
    if (activeMode === 'poll' && pollQuestion.trim() && validPollOptions.length >= 2) {
      pollData = {
        id: 'poll_' + Date.now(),
        question: pollQuestion.trim(),
        options: validPollOptions.map((opt, idx) => ({
          id: 'opt_' + idx + '_' + Date.now(),
          text: opt,
          votes: 0
        })),
        totalVotes: 0,
        userVotedOptionId: null,
        timeRemaining: pollDuration + ' left'
      }
    }

    let celebrationData: Post["celebration"] = undefined
    if (activeMode === 'celebrate') {
      celebrationData = {
        type: celebrationType,
        badge: celebrationBadge,
        headline: celebrationHeadline.trim() || `Milestone Celebration · ${defaultProfTitle}`
      }
    }

    let documentData: Post["document"] = undefined
    if (activeMode === 'document') {
      const normalizedSlides = docSlides
        .filter((s) => s.title.trim() || s.content.trim())
        .map((s, idx) => ({
          slideNumber: idx + 1,
          title: s.title.trim() || `0${idx + 1} / Key Specification`,
          content: s.content.trim() || "Verified ConnectLn project documentation and field standard.",
          visualTag: s.visualTag || "DOCUMENT",
          bgColor: s.bgColor || SLIDE_BG_COLORS[idx % SLIDE_BG_COLORS.length]
        }))
      documentData = {
        title: docTitle.trim() || "ConnectLn_Specification_2026.pdf",
        totalPages: normalizedSlides.length,
        slides: normalizedSlides,
        fileUrl: docFileUrl,
        fileSize: docFileSize || "420 KB"
      }
    }

    const finalMedia: Post["media"] =
      mediaUrl.trim() || detectedYoutubeId
        ? isVideoDetected
          ? {
              type: 'video' as const,
              url: mediaUrl.trim() || `https://www.youtube.com/watch?v=${detectedYoutubeId}`,
              youtubeId: detectedYoutubeId || undefined,
              thumbnailUrl: detectedYoutubeId
                ? `https://i.ytimg.com/vi/${detectedYoutubeId}/hqdefault.jpg`
                : undefined,
              title:
                videoTitleInput.trim() ||
                content.trim().split('\n')[0]?.slice(0, 75) ||
                `${user.name} — ${defaultProfTitle} Video Briefing`,
              brandName: videoBrandInput.trim() || "ConnectLn",
              duration: videoDurationInput.trim() || "4:30",
              serialPlate: `CLN-VID${Math.floor(100 + Math.random() * 900)}`,
              aspectRatio: '16:9'
            }
          : {
              type: 'image' as const,
              url: mediaUrl.trim(),
              aspectRatio: '16:9',
              visualStyle: imageVisualStyle === 'standard' ? undefined : imageVisualStyle,
              overlayTitle: imageOverlayTitle.trim() || undefined,
              overlaySubtitle: imageOverlaySubtitle.trim() || undefined,
              title: imageOverlayTitle.trim() || undefined
            }
        : undefined

    const resolvedContent =
      content.trim() ||
      (activeMode === 'poll'
        ? `📊 Cast your vote in our ${defaultProfTitle} community poll below:`
        : activeMode === 'celebrate'
        ? `${celebrationBadge} Thrilled to share a milestone with the ConnectLn community: ${celebrationHeadline.trim()}!`
        : activeMode === 'document'
        ? `📑 Shared a multi-slide specification deck: ${docTitle.trim()}`
        : finalMedia?.type === 'video'
        ? `🎬 Shared a video briefing: ${finalMedia.title}`
        : `📷 Shared a field photo update from ${user.name}`)

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
      content: resolvedContent,
      hashtags:
        selectedTags.length > 0
          ? selectedTags
          : [suggestedHashtags[0] || '#ConnectLn', '#RealWork'],
      postType: activeMode === 'celebrate' ? 'celebration' : activeMode,
      poll: pollData,
      celebration: celebrationData,
      document: documentData,
      media: finalMedia,
      userReaction: null,
      isSaved: false
    })

    const modeSummary =
      activeMode === 'poll'
        ? "Poll published to the top of your Home Feed!"
        : activeMode === 'celebrate'
        ? "Celebration milestone published to your Home Feed!"
        : activeMode === 'document'
        ? "Document slide deck published to your Home Feed!"
        : finalMedia?.type === 'video'
        ? "Video briefing shared to your Home Feed!"
        : finalMedia?.type === 'image'
        ? "Media post shared to your Home Feed!"
        : "Post published to your Home Feed!"

    // Reset Form
    setContent("")
    setMediaUrl("")
    setVideoTitleInput("")
    setImageOverlayTitle("")
    setImageOverlaySubtitle("")
    setImageVisualStyle('standard')
    setSelectedTags([])
    setShowMediaInput(false)
    setActiveMode('standard')
    setPollQuestion("")
    setPollOptions(["", ""])
    setIsOpen(false)
    triggerPublishToast(modeSummary)
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((item) => item !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""])
    }
  }

  const removePollOption = (idx: number) => {
    if (pollOptions.length <= 2) return
    setPollOptions(pollOptions.filter((_, i) => i !== idx))
  }

  const addDocSlide = () => {
    if (docSlides.length >= 6) return
    const nextNum = docSlides.length + 1
    setDocSlides([
      ...docSlides,
      {
        slideNumber: nextNum,
        title: `0${nextNum} / Additional Field Standard`,
        content: "Key operational requirement, tolerance check, or project milestone detail.",
        visualTag: `SLIDE 0${nextNum}`,
        bgColor: SLIDE_BG_COLORS[(nextNum - 1) % SLIDE_BG_COLORS.length]
      }
    ])
  }

  const removeDocSlide = (idx: number) => {
    if (docSlides.length <= 1) return
    const next = docSlides
      .filter((_, i) => i !== idx)
      .map((s, i) => ({ ...s, slideNumber: i + 1 }))
    setDocSlides(next)
  }

  return (
    <>
      {/* Hidden Native File Pickers for Video, Image, and Document Upload */}
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        className="hidden"
        onChange={handleVideoFileUpload}
      />
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileUpload}
      />
      <input
        ref={docFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.csv,.xlsx"
        className="hidden"
        onChange={handleDocFileUpload}
      />

      {/* Quick Creator Box */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-[#0066FF] shrink-0"
          />
          <button
            type="button"
            onClick={() => {
              setActiveMode('standard')
              setShowMediaInput(false)
              setIsOpen(true)
            }}
            className="flex-1 rounded-full border border-zinc-300 bg-zinc-50/70 px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-zinc-500 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
          >
            {t("start_post_placeholder", "Start a post, share insights or milestones...")}
          </button>
        </div>

        {/* 6 Primary Action Buttons (Share Video, Media, Create a Poll, Celebrate, Document, Write with AI) */}
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5 text-xs font-semibold text-zinc-600 dark:border-zinc-800/80 dark:text-zinc-400 flex-wrap gap-1.5">
          {/* 1. Share Video */}
          <button
            type="button"
            onClick={() => {
              setActiveMode('standard')
              setMediaKind('video')
              setShowMediaInput(true)
              setIsOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-blue-50 transition-colors text-[#0066FF] dark:hover:bg-zinc-800 font-bold cursor-pointer"
          >
            <Video className="h-4 w-4 shrink-0" />
            <span>Share Video</span>
          </button>

          {/* 2. Media (Photos & Visual Poster Cards) */}
          <button
            type="button"
            onClick={() => {
              setActiveMode('standard')
              setMediaKind('image')
              setShowMediaInput(true)
              setIsOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-zinc-100 transition-colors text-amber-800 dark:text-amber-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <ImageIcon className="h-4 w-4 shrink-0" />
            <span>{t("action_media", "Media")}</span>
          </button>

          {/* 3. Create a Poll */}
          <button
            type="button"
            onClick={() => {
              setActiveMode('poll')
              setShowMediaInput(false)
              if (!pollQuestion.trim()) {
                setPollQuestion(`What is your #1 priority on ${defaultProfTitle} projects this quarter?`)
                setPollOptions([
                  "Precision & Quality Standards",
                  "Faster Turnaround & Scheduling",
                  "Crew Training & Safety",
                  "Better Tools & Materials"
                ])
              }
              setIsOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-zinc-100 transition-colors text-stone-700 dark:text-stone-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Vote className="h-4 w-4 shrink-0" />
            <span>{t("action_poll", "Create a Poll")}</span>
          </button>

          {/* 4. Celebrate */}
          <button
            type="button"
            onClick={() => {
              setActiveMode('celebrate')
              setShowMediaInput(false)
              setIsOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-emerald-50/70 transition-colors text-emerald-700 dark:text-emerald-400 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{t("action_celebrate", "Celebrate")}</span>
          </button>

          {/* 5. Document */}
          <button
            type="button"
            onClick={() => {
              setActiveMode('document')
              setShowMediaInput(false)
              setIsOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-amber-50/70 transition-colors text-amber-900 dark:text-amber-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>{t("action_document", "Document")}</span>
          </button>

          {/* 6. Write with AI */}
          <button
            type="button"
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/80 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-3 py-1.5 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{t("action_ai", "Write with AI")}</span>
          </button>
        </div>

        {/* Instant Confirmation Banner After Publishing */}
        {publishNotice && (
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{publishNotice}</span>
            </span>
            <button
              type="button"
              onClick={() => setPublishNotice(null)}
              className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* AI Post Modal */}
      <AIPostModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        user={user}
        onApplyGeneratedContent={(aiContent, aiTags, extra) => {
          setContent(aiContent)
          setSelectedTags(aiTags)
          if (extra?.suggestedPollQuestion && extra.suggestedPollOptions) {
            setActiveMode('poll')
            setPollQuestion(extra.suggestedPollQuestion)
            setPollOptions(extra.suggestedPollOptions)
          } else if (extra?.suggestedCelebration) {
            setActiveMode('celebrate')
            setCelebrationType(extra.suggestedCelebration.type)
            setCelebrationBadge(extra.suggestedCelebration.badge)
            setCelebrationHeadline(extra.suggestedCelebration.headline)
          } else {
            setActiveMode('standard')
          }
          setIsOpen(true)
        }}
        onPublishDirect={(aiContent, aiTags, extra) => {
          const isPoll = Boolean(extra?.suggestedPollQuestion && extra?.suggestedPollOptions)
          const isCeleb = Boolean(extra?.suggestedCelebration)
          onAddPost({
            author: {
              id: user.id,
              name: user.name,
              headline: user.headline,
              avatar: user.avatar,
              connectionDegree: 'You',
              isFollowing: false
            },
            visibility: 'Public',
            content: aiContent,
            hashtags: aiTags,
            postType: isPoll ? 'poll' : isCeleb ? 'celebration' : 'standard',
            poll: isPoll
              ? {
                  id: 'poll_ai_' + Date.now(),
                  question: extra!.suggestedPollQuestion!,
                  options: extra!.suggestedPollOptions!.map((opt, idx) => ({
                    id: `opt_ai_${idx}_${Date.now()}`,
                    text: opt,
                    votes: 0
                  })),
                  totalVotes: 0,
                  userVotedOptionId: null,
                  timeRemaining: '1 week left'
                }
              : undefined,
            celebration: isCeleb ? extra!.suggestedCelebration : undefined,
            userReaction: null,
            isSaved: false
          })
          triggerPublishToast("AI-crafted post published to the top of your Home Feed!")
        }}
      />

      {/* Post Impact & Virality Simulator */}
      <PostImpactSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        currentContent={
          content ||
          `Precision execution and verified standards in ${defaultProfTitle} projects drive lasting client trust.`
        }
        onApplyPolishedContent={(polished) => {
          setContent(polished)
          setIsOpen(true)
        }}
      />

      {/* Full Post Composer Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-[#0066FF]"
                />
                <div>
                  <DialogTitle className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </DialogTitle>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedVisibility(
                          selectedVisibility === 'Public' ? 'Connections' : 'Public'
                        )
                      }
                      className="flex items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      {selectedVisibility === 'Public' ? (
                        <>
                          <Globe className="h-3 w-3 text-zinc-500" />
                          <span>Anyone (Public)</span>
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

              {/* Quick Write with AI Trigger Inside Composer Header */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setIsAIOpen(true)
                }}
                className="rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 px-3 py-1 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Write with AI</span>
              </button>
            </div>

            {/* Interactive 5-Mode Switcher Tabs Inside Modal */}
            <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('standard')
                  setMediaKind('video')
                  setShowMediaInput(true)
                }}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeMode === 'standard' && showMediaInput && mediaKind === 'video'
                    ? "bg-[#0066FF] text-white shadow-2xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Share Video</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('standard')
                  setMediaKind('image')
                  setShowMediaInput(true)
                }}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeMode === 'standard' && showMediaInput && mediaKind === 'image'
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Media / Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('poll')
                  setShowMediaInput(false)
                }}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeMode === 'poll'
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                <Vote className="h-3.5 w-3.5" />
                <span>Create a Poll</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('celebrate')
                  setShowMediaInput(false)
                }}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeMode === 'celebrate'
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Celebrate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('document')
                  setShowMediaInput(false)
                }}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeMode === 'document'
                    ? "bg-amber-700 text-white shadow-2xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Document</span>
              </button>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreatePost} className="p-5 sm:p-6 space-y-4 max-h-[76vh] overflow-y-auto">
            <textarea
              placeholder={
                activeMode === 'poll'
                  ? "Add context or a question for your network above the poll (optional)..."
                  : activeMode === 'celebrate'
                  ? "Share the story behind this milestone or tag teammates who helped make it happen..."
                  : activeMode === 'document'
                  ? "Add an executive summary or instructions for your attached document/slide deck..."
                  : mediaKind === 'video' && showMediaInput
                  ? "Add commentary for your video briefing, or paste any YouTube URL..."
                  : "What do you want to share with your professional community today?"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 p-3 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#0A66C2] focus:outline-none dark:text-zinc-100"
            />

            {/* =============================================================== */}
            {/* MODE 1: POLL BUILDER WIDGET                                     */}
            {/* =============================================================== */}
            {activeMode === 'poll' && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Vote className="h-4 w-4 text-indigo-600" />
                    <span>Interactive Poll Configuration</span>
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-zinc-500 font-semibold">Duration:</span>
                    <select
                      value={pollDuration}
                      onChange={(e) => setPollDuration(e.target.value)}
                      className="rounded-md border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300"
                    >
                      <option value="1 day">1 day</option>
                      <option value="3 days">3 days</option>
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                    </select>
                  </div>
                </div>

                {/* Quick Poll Templates */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase text-indigo-500">Templates:</span>
                  {[
                    {
                      label: "Project Priority",
                      q: `What is your #1 priority on ${defaultProfTitle} projects this quarter?`,
                      opts: ["Precision & Quality Control", "Schedule & Speed", "Crew Safety & Training", "Cost & Material Efficiency"]
                    },
                    {
                      label: "Work Schedule",
                      q: "Which contract & shift structure works best for your crew?",
                      opts: ["Dedicated Full-Project Contract", "4x10 Day Shifts", "Milestone / Draw Based", "On-Call Advisory & Inspection"]
                    }
                  ].map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => {
                        setPollQuestion(tpl.q)
                        setPollOptions(tpl.opts)
                      }}
                      className="rounded-full bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer"
                    >
                      + {tpl.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Poll Question *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Which joinery or structural framing standard do you prefer?"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Poll Options (Minimum 2, up to 4)
                  </label>
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}${idx < 2 ? " *" : ""}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions]
                          updated[idx] = e.target.value
                          setPollOptions(updated)
                        }}
                        required={idx < 2}
                        className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(idx)}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                          title="Remove option"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {pollOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="flex items-center gap-1 text-xs font-bold text-[#0A66C2] hover:underline cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add option ({pollOptions.length}/4)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODE 2: CELEBRATION / MILESTONE BUILDER                         */}
            {/* =============================================================== */}
            {activeMode === 'celebrate' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>Select Milestone Category</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => imageFileInputRef.current?.click()}
                    className="rounded-full bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="h-3 w-3" />
                    <span>+ Attach Milestone Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    {
                      badge: '🔨',
                      type: 'project' as const,
                      label: 'Project Completed',
                      defaultHeadline: `Completed a Major ${defaultProfTitle} Project`,
                      defaultText: `Proud to share that we have officially completed our latest ${defaultProfTitle} project on schedule and to full specification!`
                    },
                    {
                      badge: '📜',
                      type: 'certificate' as const,
                      label: 'License / Certification',
                      defaultHeadline: `Earned Verified ${defaultProfTitle} Credential`,
                      defaultText: `Excited to announce that I have earned a new verified license & certification in ${defaultProfTitle}!`
                    },
                    {
                      badge: '🎉',
                      type: 'new_job' as const,
                      label: 'New Position / Role',
                      defaultHeadline: `Started a New Role as ${defaultProfTitle}`,
                      defaultText: `Thrilled to share that I am starting a new chapter as ${defaultProfTitle}!`
                    },
                    {
                      badge: '🏆',
                      type: 'project' as const,
                      label: 'Award / Recognition',
                      defaultHeadline: `Recognized for Excellence in ${defaultProfTitle}`,
                      defaultText: `Honored to receive industry recognition for our recent work and craftsmanship.`
                    },
                    {
                      badge: '🤝',
                      type: 'project' as const,
                      label: 'New Client / Contract',
                      defaultHeadline: `Signed a New Commercial ${defaultProfTitle} Contract`,
                      defaultText: `Grateful for the trust of our newest client partner as we kick off this upcoming build!`
                    },
                    {
                      badge: '🎂',
                      type: 'anniversary' as const,
                      label: 'Work Anniversary',
                      defaultHeadline: `Celebrating Another Year of Craft & Leadership`,
                      defaultText: `Grateful to celebrate another year of building, mentoring, and delivering great work with this community!`
                    }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setCelebrationBadge(item.badge)
                        setCelebrationType(item.type)
                        setCelebrationHeadline(item.defaultHeadline)
                        if (!content.trim()) {
                          setContent(item.defaultText)
                        }
                      }}
                      className={`rounded-lg border p-2 text-left text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        celebrationHeadline === item.defaultHeadline || celebrationBadge === item.badge
                          ? "border-emerald-600 bg-emerald-100/80 text-emerald-950 dark:bg-emerald-900/60 dark:text-emerald-100 shadow-2xs"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      }`}
                    >
                      <span className="text-lg shrink-0">{item.badge}</span>
                      <span className="text-[11px] leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Celebration Banner Headline (Editable)
                  </label>
                  <input
                    type="text"
                    value={celebrationHeadline}
                    onChange={(e) => setCelebrationHeadline(e.target.value)}
                    placeholder="e.g. Completed 12,000 sq. ft. Custom Heavy Timber Frame Installation"
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {mediaUrl && mediaKind === 'image' && (
                  <div className="relative rounded-lg overflow-hidden border border-emerald-300 max-h-44">
                    <img src={mediaUrl} alt="Milestone preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaUrl("")}
                      className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white hover:bg-black cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* MODE 3: DOCUMENT & SLIDE DECK BUILDER                           */}
            {/* =============================================================== */}
            {activeMode === 'document' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-amber-700" />
                    <span>Document &amp; Interactive Slide Deck Builder</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => docFileInputRef.current?.click()}
                    className="rounded-full bg-amber-700 hover:bg-amber-800 px-3 py-1 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload File (.PDF, .DOCX, .TXT)</span>
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Document File Name / Title
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Heavy_Timber_Load_Specs_2026.pdf"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                    {docFileSize && (
                      <span className="rounded-md bg-amber-100 dark:bg-amber-900/50 px-2 py-1 text-[10px] font-bold text-amber-900 dark:text-amber-200 shrink-0">
                        {docFileSize}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      Carousel Slides ({docSlides.length} {docSlides.length === 1 ? "page" : "pages"})
                    </label>
                    {docSlides.length < 6 && (
                      <button
                        type="button"
                        onClick={addDocSlide}
                        className="text-xs font-bold text-[#0A66C2] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Slide
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {docSlides.map((slide, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-amber-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                            Slide {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={slide.visualTag || ""}
                            onChange={(e) => {
                              const next = [...docSlides]
                              next[idx] = { ...next[idx], visualTag: e.target.value }
                              setDocSlides(next)
                            }}
                            placeholder="Tag (e.g. BLUEPRINT)"
                            className="w-36 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase"
                          />
                          {docSlides.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDocSlide(idx)}
                              className="text-zinc-400 hover:text-red-600 cursor-pointer"
                              title="Remove slide"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            const next = [...docSlides]
                            next[idx] = { ...next[idx], title: e.target.value }
                            setDocSlides(next)
                          }}
                          placeholder={`Slide ${idx + 1} Headline`}
                          className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-100"
                        />
                        <textarea
                          rows={2}
                          value={slide.content}
                          onChange={(e) => {
                            const next = [...docSlides]
                            next[idx] = { ...next[idx], content: e.target.value }
                            setDocSlides(next)
                          }}
                          placeholder="Key specification, checklist item, or slide takeaway..."
                          className="w-full resize-none rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODE 4 & 5: SHARE VIDEO OR MEDIA / PHOTO CARD                   */}
            {/* =============================================================== */}
            {(showMediaInput || isVideoDetected) && activeMode === 'standard' && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaKind('video')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                        mediaKind === 'video'
                          ? "bg-[#0066FF] text-white shadow-2xs"
                          : "bg-white text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      🎬 Share Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaKind('image')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                        mediaKind === 'image'
                          ? "bg-[#0A66C2] text-white shadow-2xs"
                          : "bg-white text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      🖼️ Photo / Visual Card
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {mediaKind === 'video' ? (
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        className="rounded-full bg-[#0066FF] hover:bg-[#0052CC] px-3 py-1 text-[11px] font-bold text-white flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Upload className="h-3 w-3" />
                        <span>Upload Video File</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => imageFileInputRef.current?.click()}
                        className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-3 py-1 text-[11px] font-bold text-white flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Upload className="h-3 w-3" />
                        <span>Upload Photo from Device</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl("")
                        setShowMediaInput(false)
                      }}
                      className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                      title="Close media panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* URL Input */}
                <input
                  type="text"
                  placeholder={
                    mediaKind === 'video'
                      ? "Paste YouTube link, video ID, or MP4 URL (or click 'Upload Video File' above)..."
                      : "Paste image URL or click 'Upload Photo from Device' above..."
                  }
                  value={mediaUrl.startsWith("data:") ? "✓ Local photo uploaded from device" : mediaUrl}
                  onChange={(e) => {
                    if (!e.target.value.startsWith("✓ Local")) {
                      setMediaUrl(e.target.value)
                    }
                  }}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-[#0066FF] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 font-mono"
                />

                {/* Video Presets & Metadata */}
                {mediaKind === 'video' ? (
                  <>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase text-[#0066FF]">Quick Briefings:</span>
                      {[
                        {
                          label: "🔨 Timber Framing & Joinery",
                          yt: "9mwE1Aih9uU",
                          title: `${defaultProfTitle} — Precision Joinery & Field Execution Briefing`
                        },
                        {
                          label: "📐 Blueprint & Load Specs",
                          yt: "f4bJ211169A",
                          title: `${defaultProfTitle} — Commercial Blueprint & Contract Standards`
                        },
                        {
                          label: "⚡ Systems & Safety Walkthrough",
                          yt: "aircAruvnKk",
                          title: `${defaultProfTitle} — Jobsite Safety & Quality Verification`
                        }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setMediaUrl(`https://www.youtube.com/watch?v=${preset.yt}`)
                            setVideoTitleInput(preset.title)
                          }}
                          className="rounded-full bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-[10px] font-bold text-[#0066FF] hover:bg-blue-50 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Video Title (e.g. Precision Joinery Walkthrough)"
                        value={videoTitleInput}
                        onChange={(e) => setVideoTitleInput(e.target.value)}
                        className="sm:col-span-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-[#0066FF] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 4:30)"
                        value={videoDurationInput}
                        onChange={(e) => setVideoDurationInput(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-[#0066FF] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 font-semibold"
                      />
                    </div>

                    {/* Live Preview of the Signature Profile Picture + ConnectLn Logo Banner */}
                    <div className="pt-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#0066FF] mb-1.5">
                        Live ConnectLn Share Preview (Your Profile Picture + ConnectLn Video Card):
                      </p>
                      <VideoShareBanner
                        compact
                        avatarUrl={user.avatar}
                        authorName={user.name}
                        authorHeadline={user.headline}
                        brandName={videoBrandInput || "ConnectLn"}
                        videoTitle={
                          videoTitleInput.trim() ||
                          content.trim().split('\n')[0] ||
                          `${user.name} — Featured ${defaultProfTitle} Video Briefing`
                        }
                        videoSubtitle={user.headline}
                        youtubeId={detectedYoutubeId || undefined}
                        videoUrl={mediaUrl}
                        duration={videoDurationInput || "4:30"}
                        serialPlate="CLN-LIVE"
                      />
                    </div>
                  </>
                ) : (
                  /* Image / Visual Card Options & Presets */
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase text-[#0A66C2]">Sample Field Photos:</span>
                      {[
                        {
                          label: "🪵 Heavy Timber & Craft",
                          url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80",
                          title: `${defaultProfTitle} Field Execution`
                        },
                        {
                          label: "🏢 Commercial Build",
                          url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80",
                          title: "7 Contract & Practice Growth Streams"
                        },
                        {
                          label: "🎙️ Keynote Podium",
                          url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80",
                          title: "2026 Industry Standards & Leadership Address"
                        }
                      ].map((sample) => (
                        <button
                          key={sample.label}
                          type="button"
                          onClick={() => {
                            setMediaUrl(sample.url)
                            if (!imageOverlayTitle) setImageOverlayTitle(sample.title)
                          }}
                          className="rounded-full bg-white dark:bg-zinc-800 border border-sky-200 dark:border-sky-800 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] hover:bg-sky-50 cursor-pointer"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>

                    {/* Visual Card Layout Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'standard', label: '📷 Standard Photo' },
                        { id: 'poster_frame', label: '📕 Red-Framed Poster' },
                        { id: 'editorial_podium', label: '🎙️ Keynote Podium' },
                        { id: 'news_portrait', label: '📰 News Card' }
                      ].map((styleOpt) => (
                        <button
                          key={styleOpt.id}
                          type="button"
                          onClick={() => setImageVisualStyle(styleOpt.id as any)}
                          className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                            imageVisualStyle === styleOpt.id
                              ? "border-[#0A66C2] bg-[#0A66C2] text-white"
                              : "border-zinc-200 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {styleOpt.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Optional Card Headline Overlay..."
                        value={imageOverlayTitle}
                        onChange={(e) => setImageOverlayTitle(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                      <input
                        type="text"
                        placeholder="Optional Subtitle / Kicker..."
                        value={imageOverlaySubtitle}
                        onChange={(e) => setImageOverlaySubtitle(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    {mediaUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-950 max-h-56">
                        <img
                          src={mediaUrl}
                          alt="Selected media preview"
                          className="w-full h-48 object-cover"
                        />
                        {imageOverlayTitle && (
                          <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs px-3 py-1.5 rounded text-white">
                            <p className="text-xs font-bold truncate">{imageOverlayTitle}</p>
                            {imageOverlaySubtitle && (
                              <p className="text-[10px] text-zinc-300 truncate">{imageOverlaySubtitle}</p>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setMediaUrl("")}
                          className="absolute top-2 right-2 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-black flex items-center gap-1 cursor-pointer"
                        >
                          <X className="h-3 w-3" /> Remove Photo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Suggested Hashtags */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Suggested Hashtags (Tap to toggle)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedHashtags.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer ${
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
              <div className="flex items-center gap-1.5 text-zinc-500">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('standard')
                    setMediaKind('video')
                    setShowMediaInput(true)
                  }}
                  className="rounded-full p-2 hover:bg-blue-50 text-[#0066FF] transition-colors dark:hover:bg-zinc-800 cursor-pointer"
                  title="Share video with Profile Picture card"
                >
                  <Video className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('standard')
                    setMediaKind('image')
                    setShowMediaInput(true)
                  }}
                  className="rounded-full p-2 hover:bg-zinc-100 text-[#0A66C2] transition-colors dark:hover:bg-zinc-800 cursor-pointer"
                  title="Upload or attach photo"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode(activeMode === 'poll' ? 'standard' : 'poll')
                    setShowMediaInput(false)
                  }}
                  className="rounded-full p-2 hover:bg-zinc-100 text-indigo-600 transition-colors dark:hover:bg-zinc-800 cursor-pointer"
                  title="Create a Poll"
                >
                  <Vote className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode(activeMode === 'celebrate' ? 'standard' : 'celebrate')
                    setShowMediaInput(false)
                  }}
                  className="rounded-full p-2 hover:bg-zinc-100 text-emerald-600 transition-colors dark:hover:bg-zinc-800 cursor-pointer"
                  title="Celebrate milestone"
                >
                  <Sparkles className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode(activeMode === 'document' ? 'standard' : 'document')
                    setShowMediaInput(false)
                  }}
                  className="rounded-full p-2 hover:bg-zinc-100 text-amber-700 transition-colors dark:hover:bg-zinc-800 cursor-pointer"
                  title="Attach Document or Slide Deck"
                >
                  <BookOpen className="h-5 w-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex items-center gap-1.5 rounded-full bg-[#0066FF] px-5 py-2 text-xs sm:text-sm font-bold text-white transition-opacity hover:bg-[#0052CC] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Post to ConnectLn</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
