"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Play,
  Bookmark,
  BookmarkCheck,
  Compass,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Hammer,
  Wrench,
  Paintbrush,
  Camera,
  Check,
  HelpCircle,
  BookOpen,
  Award,
  FileText,
  X
} from "lucide-react"
import {
  SkilledTradesCategory,
  LearnByDoingLesson,
  LearnByDoingLessonTelemetry,
  SKILLED_TRADES_COLLECTION_META,
  SKILLED_TRADES_LEARN_BY_DOING_LESSONS,
  RUNNING_YOUR_TRADE_BUSINESS_PATH,
  PROPOSED_NEXT_TRADE_PROFESSIONS,
  loadAllLearnByDoingTelemetry,
  saveAllLearnByDoingTelemetry,
  computeLessonProgress,
  createInitialLessonTelemetry
} from "@/lib/skilled-trades-learn-by-doing-data"

interface SkilledTradesLearnByDoingSectionProps {
  onTelemetryChange?: (summary: {
    savedLessonIds: string[]
    journeyLessonIds: string[]
    completedLessonIds: string[]
    overallProgressPercent: number
  }) => void
  onClaimCertificate?: (certTitle: string) => void
}

type CategoryFilter = 'All' | SkilledTradesCategory | 'Saved' | 'Learning Journey'

export function SkilledTradesLearnByDoingSection({
  onTelemetryChange,
  onClaimCertificate
}: SkilledTradesLearnByDoingSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All')
  const [telemetryMap, setTelemetryMap] = useState<Record<string, LearnByDoingLessonTelemetry>>(() =>
    loadAllLearnByDoingTelemetry()
  )
  const [activeVideoLessonId, setActiveVideoLessonId] = useState<string | null>(null)
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(
    SKILLED_TRADES_LEARN_BY_DOING_LESSONS[0]?.id || null
  )
  // Tracks whether each YouTube video ID has been verified playable via oEmbed / runtime check
  const [embedPlayabilityMap, setEmbedPlayabilityMap] = useState<
    Record<string, 'checking' | 'playable' | 'unavailable'>
  >({})
  // Tracks Lesson 6 active variant ('primary' = Sherwin-Williams Brush & Roller, 'companion' = FrogTape Clean Paint Edges)
  const [lesson6Variant, setLesson6Variant] = useState<'primary' | 'companion'>('primary')
  const [outboundNoticeByLesson, setOutboundNoticeByLesson] = useState<Record<string, string>>({})
  const [practiceDrafts, setPracticeDrafts] = useState<Record<string, string>>({})
  const [practiceSavedBanner, setPracticeSavedBanner] = useState<Record<string, boolean>>({})
  const [businessAnswers, setBusinessAnswers] = useState<Record<string, number>>({})
  const [bookmarkedProposedIds, setBookmarkedProposedIds] = useState<Record<string, boolean>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Load persisted telemetry on mount
  useEffect(() => {
    const loaded = loadAllLearnByDoingTelemetry()
    setTelemetryMap(loaded)
    const drafts: Record<string, string> = {}
    for (const [id, item] of Object.entries(loaded)) {
      drafts[id] = item.practiceNotes || ''
    }
    setPracticeDrafts(drafts)
  }, [])

  // Verify playability of each lesson's YouTube video before enabling the embedded player
  useEffect(() => {
    let cancelled = false
    async function verifyVideos() {
      for (const lesson of SKILLED_TRADES_LEARN_BY_DOING_LESSONS) {
        if (!lesson.embedAvailable || !lesson.youtubeId) {
          if (!cancelled) {
            setEmbedPlayabilityMap(prev => ({ ...prev, [lesson.id]: 'unavailable' }))
          }
          continue
        }

        if (!cancelled) {
          setEmbedPlayabilityMap(prev => ({ ...prev, [lesson.id]: 'checking' }))
        }

        try {
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
            `https://www.youtube.com/watch?v=${lesson.youtubeId}`
          )}&format=json`
          const res = await fetch(oembedUrl)
          if (!cancelled) {
            setEmbedPlayabilityMap(prev => ({
              ...prev,
              [lesson.id]: res.ok ? 'playable' : 'unavailable'
            }))
          }
        } catch {
          // If browser blocks cross-origin oEmbed or offline, fallback to thumbnail probe
          const img = new Image()
          img.onload = () => {
            if (!cancelled) {
              setEmbedPlayabilityMap(prev => ({
                ...prev,
                [lesson.id]: img.naturalWidth > 120 ? 'playable' : 'unavailable'
              }))
            }
          }
          img.onerror = () => {
            if (!cancelled) {
              setEmbedPlayabilityMap(prev => ({ ...prev, [lesson.id]: 'unavailable' }))
            }
          }
          img.src = `https://i.ytimg.com/vi/${lesson.youtubeId}/hqdefault.jpg`
        }
      }
    }
    verifyVideos()
    return () => {
      cancelled = true
    }
  }, [])

  // Notify parent LearningView whenever telemetry updates
  useEffect(() => {
    const entries = Object.values(telemetryMap)
    const savedLessonIds = entries.filter(e => e.isSaved).map(e => e.lessonId)
    const journeyLessonIds = entries.filter(e => e.inLearningJourney).map(e => e.lessonId)
    const completedLessonIds = entries.filter(e => e.isCompleted).map(e => e.lessonId)
    const totalPct = entries.reduce((acc, item) => acc + (item.progressPercent || 0), 0)
    const overallProgressPercent =
      entries.length > 0 ? Math.round(totalPct / entries.length) : 0

    if (onTelemetryChange) {
      onTelemetryChange({
        savedLessonIds,
        journeyLessonIds,
        completedLessonIds,
        overallProgressPercent
      })
    }
  }, [telemetryMap, onTelemetryChange])

  const updateLessonTelemetry = (
    lessonId: string,
    updater: (current: LearnByDoingLessonTelemetry) => LearnByDoingLessonTelemetry
  ) => {
    setTelemetryMap(prev => {
      const current = prev[lessonId] || createInitialLessonTelemetry(lessonId)
      const updatedRaw = updater(current)
      const computed = computeLessonProgress(updatedRaw)
      const finalRecord: LearnByDoingLessonTelemetry = {
        ...updatedRaw,
        progressPercent: computed.progressPercent,
        isCompleted: computed.isCompleted,
        lastUpdatedAt: new Date().toISOString()
      }
      const nextMap = {
        ...prev,
        [lessonId]: finalRecord
      }
      saveAllLearnByDoingTelemetry(nextMap)
      return nextMap
    })
  }

  // Action 1: Watch (Embedded verified video vs. opening video panel)
  const handleWatchAction = (lesson: LearnByDoingLesson) => {
    setExpandedLessonId(lesson.id)
    const playability = embedPlayabilityMap[lesson.id] || (lesson.embedAvailable ? 'playable' : 'unavailable')
    if (lesson.embedAvailable && lesson.youtubeId && playability === 'playable') {
      setActiveVideoLessonId(lesson.id)
      // Record a verified embedded video view when user launches and plays the verified embedded player
      updateLessonTelemetry(lesson.id, curr => ({
        ...curr,
        verifiedVideoViews: curr.verifiedVideoViews + 1,
        videoReviewed: true,
        interactionsCount: curr.interactionsCount + 1
      }))
    } else {
      setActiveVideoLessonId(lesson.id)
      updateLessonTelemetry(lesson.id, curr => ({
        ...curr,
        interactionsCount: curr.interactionsCount + 1
      }))
    }
  }

  // Outbound link click: MUST NOT automatically count as a completed lesson or a verified video view!
  const handleOutboundVideoClick = (lesson: LearnByDoingLesson, creatorName: string) => {
    updateLessonTelemetry(lesson.id, curr => ({
      ...curr,
      outboundLinkClicks: curr.outboundLinkClicks + 1,
      interactionsCount: curr.interactionsCount + 1
      // Intentionally does NOT increment verifiedVideoViews or set videoReviewed / isCompleted
    }))
    setOutboundNoticeByLesson(prev => ({
      ...prev,
      [lesson.id]: `Opened on ${creatorName}. Outbound link clicks are logged separately and do not automatically count as a verified video view or completed lesson. Complete the Practice Activity & Knowledge Check (or confirm below after watching) to record lesson progress.`
    }))
  }

  // Explicit user confirmation after watching an external non-embeddable video on the creator's site
  const handleConfirmExternalVideoReviewed = (lessonId: string) => {
    updateLessonTelemetry(lessonId, curr => ({
      ...curr,
      videoReviewed: !curr.videoReviewed,
      interactionsCount: curr.interactionsCount + 1
    }))
  }

  // Action 2: Save to user's saved content
  const handleToggleSave = (lessonId: string) => {
    updateLessonTelemetry(lessonId, curr => {
      const nextSaved = !curr.isSaved
      return {
        ...curr,
        isSaved: nextSaved,
        savesCount: nextSaved ? 1 : 0,
        interactionsCount: curr.interactionsCount + 1
      }
    })
  }

  // Action 3: Add to Learning Journey
  const handleToggleLearningJourney = (lessonId: string) => {
    updateLessonTelemetry(lessonId, curr => ({
      ...curr,
      inLearningJourney: !curr.inLearningJourney,
      interactionsCount: curr.interactionsCount + 1
    }))
  }

  // Practice Activity submission
  const handleSavePracticeActivity = (lessonId: string) => {
    const notes = (practiceDrafts[lessonId] || '').trim()
    updateLessonTelemetry(lessonId, curr => ({
      ...curr,
      practiceNotes: notes,
      practiceCompletedAt:
        notes.length > 0 || Boolean(curr.practicePhotoDataUrl)
          ? new Date().toISOString()
          : undefined,
      interactionsCount: curr.interactionsCount + 1
    }))
    setPracticeSavedBanner(prev => ({ ...prev, [lessonId]: true }))
    setTimeout(() => {
      setPracticeSavedBanner(prev => ({ ...prev, [lessonId]: false }))
    }, 3500)
  }

  // Optional Photo Upload for Practice Activity (e.g., photographing speed square markings on scrap wood)
  const handlePracticePhotoUpload = (
    lessonId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) return
      updateLessonTelemetry(lessonId, curr => ({
        ...curr,
        practicePhotoName: file.name,
        practicePhotoDataUrl: dataUrl,
        practiceCompletedAt: new Date().toISOString(),
        interactionsCount: curr.interactionsCount + 1
      }))
    }
    reader.readAsDataURL(file)
  }

  // Knowledge Check submission
  const handleSelectKnowledgeAnswer = (
    lesson: LearnByDoingLesson,
    optionIndex: number,
    correctIndex: number
  ) => {
    const passed = optionIndex === correctIndex
    updateLessonTelemetry(lesson.id, curr => ({
      ...curr,
      knowledgeCheckSelectedOption: optionIndex,
      knowledgeCheckPassed: passed,
      interactionsCount: curr.interactionsCount + 1
    }))
  }

  // Filtered lessons
  const filteredLessons = SKILLED_TRADES_LEARN_BY_DOING_LESSONS.filter(lesson => {
    const t = telemetryMap[lesson.id] || createInitialLessonTelemetry(lesson.id)
    if (selectedCategory === 'All') return true
    if (selectedCategory === 'Saved') return t.isSaved
    if (selectedCategory === 'Learning Journey') return t.inLearningJourney
    return lesson.category === selectedCategory
  })

  // Real user activity totals (zero seeded numbers)
  const allTelemetry = Object.values(telemetryMap)
  const totalVerifiedViews = allTelemetry.reduce((sum, t) => sum + t.verifiedVideoViews, 0)
  const totalSavedCount = allTelemetry.filter(t => t.isSaved).length
  const totalJourneyCount = allTelemetry.filter(t => t.inLearningJourney).length
  const totalCompletedCount = allTelemetry.filter(t => t.isCompleted).length
  const totalInteractions = allTelemetry.reduce((sum, t) => sum + t.interactionsCount, 0)
  const overallCollectionProgress =
    allTelemetry.length > 0
      ? Math.round(
          allTelemetry.reduce((sum, t) => sum + t.progressPercent, 0) / allTelemetry.length
        )
      : 0

  const totalLessonsCount = SKILLED_TRADES_LEARN_BY_DOING_LESSONS.length

  const getCategoryIcon = (cat: SkilledTradesCategory) => {
    switch (cat) {
      case 'Carpentry':
        return <Hammer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      case 'Auto Mechanics':
        return <Wrench className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
      case 'Painting & Decorating':
        return <Paintbrush className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      case 'Plumbing':
        return <Wrench className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
      case 'Electrical Fundamentals':
        return <Sparkles className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
      case 'Welding':
        return <Hammer className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
      case 'HVAC':
        return <Compass className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
    }
  }

  return (
    <section
      id="skilled-trades-learn-by-doing"
      className="rounded-2xl border-2 border-amber-500/40 dark:border-amber-500/30 bg-white dark:bg-zinc-900 shadow-md overflow-hidden"
    >
      {/* Top Collection Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 p-5 sm:p-6 text-white border-b border-amber-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-amber-400 text-slate-950 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Hammer className="h-3.5 w-3.5" />
                Featured Collection
              </span>
              <span className="rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
                Carpentry · Auto Mechanics · Painting · Plumbing · Electrical · Welding · HVAC
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                100% Real User Activity Telemetry · Zero Seeded Counts
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {SKILLED_TRADES_COLLECTION_META.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
              {SKILLED_TRADES_COLLECTION_META.subtitle}
            </p>
          </div>

          {/* Live User Activity & Learning Journey Counters (Strictly from actual user actions) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300 block">
                Verified Views
              </span>
              <span className="text-lg font-black text-amber-300">{totalVerifiedViews}</span>
              <span className="text-[10px] text-zinc-400 block">Actual Plays</span>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300 block">
                Saved Lessons
              </span>
              <span className="text-lg font-black text-sky-300">{totalSavedCount}</span>
              <span className="text-[10px] text-zinc-400 block">In Saved List</span>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300 block">
                Learning Journey
              </span>
              <span className="text-lg font-black text-emerald-300">
                {totalJourneyCount} / {totalLessonsCount}
              </span>
              <span className="text-[10px] text-zinc-400 block">Enrolled</span>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300 block">
                Your Progress
              </span>
              <span className="text-lg font-black text-white">{overallCollectionProgress}%</span>
              <span className="text-[10px] text-zinc-400 block">
                {totalCompletedCount}/{totalLessonsCount} Completed
              </span>
            </div>
          </div>
        </div>

        {/* Category & Saved / Learning Journey Filter Tabs */}
        <div className="mt-4 pt-3.5 border-t border-white/15 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(
              [
                { id: 'All', label: `All ${totalLessonsCount} Lessons`, count: totalLessonsCount },
                { id: 'Carpentry', label: '🪚 Carpentry', count: 2 },
                { id: 'Auto Mechanics', label: '🔧 Auto Mechanics', count: 2 },
                { id: 'Painting & Decorating', label: '🎨 Painting & Decorating', count: 2 },
                { id: 'Plumbing', label: '🚰 Plumbing', count: 2 },
                { id: 'Electrical Fundamentals', label: '⚡ Electrical Fundamentals', count: 1 },
                { id: 'Welding', label: '🔥 Welding', count: 2 },
                { id: 'HVAC', label: '❄️ HVAC', count: 2 },
                { id: 'Saved', label: '🔖 Saved Content', count: totalSavedCount },
                { id: 'Learning Journey', label: '🧭 My Learning Journey', count: totalJourneyCount }
              ] as { id: CategoryFilter; label: string; count: number }[]
            ).map(tab => {
              const isSelected = selectedCategory === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-white/10 text-zinc-200 hover:bg-white/20 border border-white/15'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-black/30 text-amber-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="text-[11px] text-zinc-300 font-medium">
            Recorded User Interactions: <strong className="text-amber-300">{totalInteractions}</strong>
          </div>
        </div>
      </div>

      {/* Main Lessons Grid */}
      <div className="p-5 sm:p-6 space-y-5 bg-zinc-50/60 dark:bg-zinc-950/40">
        {filteredLessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 text-center space-y-2">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {selectedCategory === 'Saved'
                ? 'You have not saved any lessons in this collection yet.'
                : selectedCategory === 'Learning Journey'
                ? 'You have not added any lessons to your Learning Journey yet.'
                : 'No lessons match the current filter.'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Use the &ldquo;Save&rdquo; or &ldquo;Add to Learning Journey&rdquo; buttons on any lesson card to track your personal progress.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="mt-2 rounded-full bg-[#0A66C2] hover:bg-[#004182] px-4 py-1.5 text-xs font-bold text-white cursor-pointer"
            >
              Show All 6 Beginner Lessons
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredLessons.map(lesson => {
              const t = telemetryMap[lesson.id] || createInitialLessonTelemetry(lesson.id)
              const isLesson6 = lesson.id === 'lbd_painting_brush_roller_6' && Boolean(lesson.companionVariant)
              const activeVariant =
                isLesson6 && lesson6Variant === 'companion' && lesson.companionVariant
                  ? lesson.companionVariant
                  : null

              const displayVideoLabel = activeVariant ? activeVariant.videoLabel : lesson.videoLabel
              const displayTitle = activeVariant ? activeVariant.title : lesson.title
              const displayCreator = activeVariant ? activeVariant.originalCreator : lesson.originalCreator
              const displayCreatorDomain = activeVariant ? activeVariant.creatorDomain : lesson.creatorDomain
              const displayDescription = activeVariant ? activeVariant.description : lesson.description
              const displaySkills = activeVariant ? activeVariant.skillsCovered : lesson.skillsCovered
              const displaySourceUrl = activeVariant ? activeVariant.sourceVideoUrl : lesson.sourceVideoUrl
              const displayRefUrl = activeVariant ? activeVariant.referenceArticleUrl : lesson.referenceArticleUrl
              const displayPractice = activeVariant ? activeVariant.practiceActivity : lesson.practiceActivity
              const displayDeliverablePrompt = activeVariant
                ? activeVariant.practiceDeliverablePrompt
                : lesson.practiceDeliverablePrompt
              const displayKnowledgeCheck = activeVariant
                ? activeVariant.knowledgeCheck
                : lesson.knowledgeCheck
              const displayDuration = activeVariant ? activeVariant.duration : lesson.duration

              const playability =
                embedPlayabilityMap[lesson.id] ||
                (lesson.embedAvailable && lesson.youtubeId ? 'playable' : 'unavailable')
              const canEmbed =
                !activeVariant &&
                lesson.embedAvailable &&
                Boolean(lesson.youtubeId) &&
                playability === 'playable'
              const isPlayingInline = activeVideoLessonId === lesson.id && canEmbed
              const isExpanded = expandedLessonId === lesson.id

              return (
                <div
                  key={lesson.id}
                  className={`rounded-2xl border transition-all flex flex-col justify-between bg-white dark:bg-zinc-900 shadow-xs overflow-hidden ${
                    t.isCompleted
                      ? 'border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-400/30'
                      : isExpanded
                      ? 'border-[#0A66C2] dark:border-sky-600 ring-1 ring-[#0A66C2]/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div>
                    {/* Top Metadata Ribbon */}
                    <div className="px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                          {getCategoryIcon(lesson.category)}
                          <span>{lesson.category}</span>
                        </span>
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                          {lesson.level} Lesson
                        </span>
                        <span className="text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                          {displayVideoLabel}
                        </span>
                        {/* Only display duration if verified and non-empty */}
                        {displayDuration && displayDuration.trim().length > 0 && (
                          <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                            {displayDuration}
                          </span>
                        )}
                      </div>

                      {/* Original Creator Attribution Pill */}
                      <a
                        href={displayRefUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleOutboundVideoClick(lesson, displayCreator)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-300/80 dark:border-amber-700 px-3 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-200 transition-colors"
                        title={`Original Creator: ${displayCreator} (${displayCreatorDomain})`}
                      >
                        <span>Creator: {displayCreator}</span>
                        <ExternalLink className="h-3 w-3 opacity-75" />
                      </a>
                    </div>

                    {/* Optional Companion Switcher on Lesson 6 (Sherwin-Williams Brush & Roller + FrogTape Clean Paint Edges) */}
                    {isLesson6 && lesson.companionVariant && (
                      <div className="px-5 py-2 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                          Painting &amp; Decorating Lesson 2 Topic:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setLesson6Variant('primary')}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer transition-all ${
                              lesson6Variant === 'primary'
                                ? 'bg-emerald-700 text-white'
                                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                            }`}
                          >
                            Brush &amp; Roller (Sherwin-Williams)
                          </button>
                          <button
                            type="button"
                            onClick={() => setLesson6Variant('companion')}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer transition-all ${
                              lesson6Variant === 'companion'
                                ? 'bg-emerald-700 text-white'
                                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                            }`}
                          >
                            Using Painter&apos;s Tape Cleanly (FrogTape)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Video Player / Source Video Area */}
                    <div className="relative bg-slate-950">
                      {isPlayingInline && lesson.youtubeId ? (
                        <div className="relative aspect-video w-full bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${lesson.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                            title={`${displayTitle} — ${displayCreator}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full border-0"
                            onError={() =>
                              setEmbedPlayabilityMap(prev => ({
                                ...prev,
                                [lesson.id]: 'unavailable'
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <div className="relative h-52 sm:h-56 w-full overflow-hidden">
                          <img
                            src={lesson.thumbnailUrl}
                            alt={displayTitle}
                            className="h-full w-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                          {/* Top-left Playability / Source Status Pill */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                            {canEmbed ? (
                              <span className="rounded-full bg-emerald-500/90 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide flex items-center gap-1 shadow-xs">
                                <Play className="h-2.5 w-2.5 fill-slate-950" />
                                Verified Inline Video Player
                              </span>
                            ) : playability === 'checking' ? (
                              <span className="rounded-full bg-zinc-800/90 text-zinc-200 px-2.5 py-0.5 text-[10px] font-semibold">
                                Checking video playback...
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-500/95 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide flex items-center gap-1 shadow-xs">
                                <ExternalLink className="h-2.5 w-2.5" />
                                Hosted on {displayCreator} ({displayCreatorDomain})
                              </span>
                            )}
                          </div>

                          {/* Top-right User Progress Pill */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {t.inLearningJourney && (
                              <span className="rounded-full bg-sky-500/90 text-white px-2.5 py-0.5 text-[10px] font-bold">
                                In Journey
                              </span>
                            )}
                            {t.isCompleted && (
                              <span className="rounded-full bg-emerald-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed
                              </span>
                            )}
                          </div>

                          {/* Center Watch / External Source Controls */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            {canEmbed ? (
                              <button
                                type="button"
                                onClick={() => handleWatchAction(lesson)}
                                className="group rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                              >
                                <Play className="h-4 w-4 fill-slate-950" />
                                <span>Watch Lesson Video ({displayCreator})</span>
                              </button>
                            ) : (
                              <div className="max-w-md rounded-xl bg-slate-950/90 border border-white/15 p-3.5 text-white space-y-2 backdrop-blur-md">
                                <div className="flex items-center justify-center gap-1.5 text-amber-300 text-[11px] font-bold">
                                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                  <span>
                                    {lesson.embedAvailable && playability === 'unavailable'
                                      ? 'Source video is currently unavailable for inline playback'
                                      : `Inline embedding unavailable for ${displayCreator}`}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-300 leading-snug">
                                  {lesson.embedAvailable && playability === 'unavailable'
                                    ? 'This source video could not be loaded in the embedded player. Use the link below to watch directly on the original creator’s site.'
                                    : lesson.embedUnavailableReason ||
                                      `This video is hosted directly on ${displayCreator} (${displayCreatorDomain}). Open it on the original site below.`}
                                </p>
                                <div className="flex items-center justify-center gap-2 pt-0.5 flex-wrap">
                                  <a
                                    href={displaySourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleOutboundVideoClick(lesson, displayCreator)}
                                    className="rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-1.5 text-xs font-black inline-flex items-center gap-1.5 transition-colors"
                                  >
                                    <span>Watch on original site ({displayCreator})</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Bottom Title Overlay */}
                          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-bold text-amber-300">
                                {displayVideoLabel} · Creator: {displayCreator}
                              </p>
                              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                                {displayTitle}
                              </h3>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Primary Action Bar: Watch, Save, Add to Learning Journey, Watch on Original Site */}
                    <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {canEmbed ? (
                          <button
                            type="button"
                            onClick={() => handleWatchAction(lesson)}
                            className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Play className="h-3.5 w-3.5 fill-white" />
                            <span>{isPlayingInline ? 'Playing Inline' : 'Watch'}</span>
                          </button>
                        ) : (
                          <a
                            href={displaySourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleOutboundVideoClick(lesson, displayCreator)}
                            className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Play className="h-3.5 w-3.5 fill-white" />
                            <span>Watch on original site</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleSave(lesson.id)}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-bold border inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                            t.isSaved
                              ? 'bg-amber-50 text-amber-900 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
                              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:border-[#0A66C2]'
                          }`}
                        >
                          {t.isSaved ? (
                            <>
                              <BookmarkCheck className="h-3.5 w-3.5 text-amber-600" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="h-3.5 w-3.5" />
                              <span>Save</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleLearningJourney(lesson.id)}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-bold border inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                            t.inLearningJourney
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700'
                              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:border-emerald-600'
                          }`}
                        >
                          <Compass className="h-3.5 w-3.5" />
                          <span>
                            {t.inLearningJourney
                              ? 'In Learning Journey ✓'
                              : '+ Add to Learning Journey'}
                          </span>
                        </button>
                      </div>

                      {/* Always provide working "Watch on original site" link */}
                      <a
                        href={displaySourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleOutboundVideoClick(lesson, displayCreator)}
                        className="text-[11px] font-bold text-[#0A66C2] dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Watch on original site ({displayCreator})</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {/* Outbound Click Integrity Notice (when user clicks an outbound link) */}
                    {outboundNoticeByLesson[lesson.id] && (
                      <div className="mx-5 mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-3 flex items-start justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
                        <div className="space-y-1.5">
                          <p className="leading-snug">{outboundNoticeByLesson[lesson.id]}</p>
                          {!canEmbed && (
                            <button
                              type="button"
                              onClick={() => handleConfirmExternalVideoReviewed(lesson.id)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1.5 ${
                                t.videoReviewed
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-900 text-white hover:bg-amber-800'
                              }`}
                            >
                              <Check className="h-3 w-3" />
                              <span>
                                {t.videoReviewed
                                  ? 'External Video Review Confirmed ✓'
                                  : `Confirm I Finished Watching on ${displayCreator}`}
                              </span>
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setOutboundNoticeByLesson(prev => {
                              const next = { ...prev }
                              delete next[lesson.id]
                              return next
                            })
                          }
                          className="text-amber-700 dark:text-amber-300 hover:opacity-75 p-0.5 cursor-pointer"
                          title="Dismiss notice"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Lesson Content Body: Description, Skills Covered, Practice Activity & Knowledge Check */}
                    <div className="p-5 space-y-4">
                      {/* Description */}
                      <div className="space-y-1.5">
                        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {displayDescription}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span>
                            Original Creator: <strong className="text-zinc-800 dark:text-zinc-200">{displayCreator}</strong>
                          </span>
                          <span>·</span>
                          <a
                            href={displayRefUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleOutboundVideoClick(lesson, displayCreator)}
                            className="text-[#0A66C2] dark:text-sky-400 font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            <span>Reference Guide ({displayCreatorDomain})</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {!canEmbed && (
                            <>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={() => handleConfirmExternalVideoReviewed(lesson.id)}
                                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                              >
                                {t.videoReviewed
                                  ? '✓ Video Reviewed on Original Site'
                                  : 'Mark Video Reviewed After Watching'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Skills Covered */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                          Skills Covered:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {displaySkills.map(skill => (
                            <span
                              key={skill}
                              className="rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Practice Activity Box */}
                      <div className="rounded-xl border border-amber-300/80 dark:border-amber-800/70 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Suggested Practice Activity</span>
                          </span>
                          {t.practiceCompletedAt && (
                            <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                              <Check className="h-2.5 w-2.5" />
                              Practice Logged
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                          {displayPractice}
                        </p>

                        <div className="space-y-2 pt-1">
                          <textarea
                            rows={2}
                            value={practiceDrafts[lesson.id] ?? t.practiceNotes ?? ''}
                            onChange={e =>
                              setPracticeDrafts(prev => ({
                                ...prev,
                                [lesson.id]: e.target.value
                              }))
                            }
                            placeholder={displayDeliverablePrompt}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#0A66C2]"
                          />

                          {t.practicePhotoDataUrl && (
                            <div className="flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={t.practicePhotoDataUrl}
                                  alt="Practice submission"
                                  className="h-10 w-14 rounded object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">
                                    {t.practicePhotoName || 'Practice Photo Attached'}
                                  </p>
                                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                    Saved to your lesson practice log
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  updateLessonTelemetry(lesson.id, curr => ({
                                    ...curr,
                                    practicePhotoName: undefined,
                                    practicePhotoDataUrl: undefined
                                  }))
                                }
                                className="text-[11px] text-rose-600 hover:underline px-2 cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <input
                                ref={el => {
                                  fileInputRefs.current[lesson.id] = el
                                }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handlePracticePhotoUpload(lesson.id, e)}
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[lesson.id]?.click()}
                                className="rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Camera className="h-3.5 w-3.5 text-zinc-500" />
                                <span>Attach Practice Photo</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSavePracticeActivity(lesson.id)}
                                className="rounded-lg bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                Save Practice Log
                              </button>
                            </div>

                            {practiceSavedBanner[lesson.id] && (
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                ✓ Practice activity saved to your progress
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Knowledge Check Box */}
                      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Knowledge Check</span>
                          </span>
                          {t.knowledgeCheckPassed && (
                            <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                              <Check className="h-2.5 w-2.5" />
                              Passed
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {displayKnowledgeCheck.question}
                        </p>

                        <div className="space-y-1.5 pt-0.5">
                          {displayKnowledgeCheck.options.map((opt, idx) => {
                            const isSelected = t.knowledgeCheckSelectedOption === idx
                            const isCorrect = idx === displayKnowledgeCheck.correctIndex
                            const showResult = typeof t.knowledgeCheckSelectedOption === 'number'

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  handleSelectKnowledgeAnswer(
                                    lesson,
                                    idx,
                                    displayKnowledgeCheck.correctIndex
                                  )
                                }
                                className={`w-full text-left rounded-lg border px-3 py-2 text-xs transition-all cursor-pointer flex items-start justify-between gap-2 ${
                                  showResult && isSelected && isCorrect
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-bold'
                                    : showResult && isSelected && !isCorrect
                                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/50 text-rose-950 dark:text-rose-200 font-semibold'
                                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-400 text-zinc-800 dark:text-zinc-200'
                                }`}
                              >
                                <span>{opt}</span>
                                {showResult && isSelected && (
                                  <span className="shrink-0 text-[10px] font-black uppercase">
                                    {isCorrect ? '✓ Correct' : 'Try Again'}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {typeof t.knowledgeCheckSelectedOption === 'number' && (
                          <div
                            className={`rounded-lg p-2.5 text-[11px] leading-relaxed ${
                              t.knowledgeCheckPassed
                                ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {t.knowledgeCheckPassed ? (
                              <>
                                <strong>Correct:</strong> {displayKnowledgeCheck.explanation}
                              </>
                            ) : (
                              <>
                                <strong>Not quite:</strong> Review the video or reference guide from{' '}
                                {displayCreator} and select another answer.
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Real User Telemetry & Progress Bar */}
                  <div className="px-5 py-3 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/90 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-3 flex-wrap text-zinc-600 dark:text-zinc-400">
                        <span>
                          Verified Views: <strong className="text-zinc-900 dark:text-zinc-100">{t.verifiedVideoViews}</strong>
                        </span>
                        <span>·</span>
                        <span>
                          Outbound Link Clicks: <strong className="text-zinc-900 dark:text-zinc-100">{t.outboundLinkClicks}</strong>
                        </span>
                        <span>·</span>
                        <span>
                          Saves: <strong className="text-zinc-900 dark:text-zinc-100">{t.savesCount}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          Progress: {t.progressPercent}%
                        </span>
                        {t.isCompleted && onClaimCertificate && (
                          <button
                            type="button"
                            onClick={() =>
                              onClaimCertificate(
                                `${displayTitle} (${SKILLED_TRADES_COLLECTION_META.title})`
                              )
                            }
                            className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Award className="h-3 w-3" />
                            <span>Add Badge</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0A66C2] to-emerald-500 transition-all duration-300"
                        style={{ width: `${t.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ===================================================================== */}
        {/* UNIVERSAL "RUNNING YOUR BUSINESS" LEARNING PATH FOR EVERY TRADE       */}
        {/* ===================================================================== */}
        <div className="mt-8 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-900 p-5 sm:p-6 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-emerald-400 text-slate-950 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Universal Trade Career Track
                </span>
                <span className="rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-200">
                  Estimates · Customer Communication · Scheduling · Job Documentation · Presenting Completed Work
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Running Your Business — Practical Learning Path for Every Trade
              </h3>
              <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
                Connect your hands-on trade mastery with real business opportunities on ConnectLn. Master service estimates, client communication, scheduling, job documentation, and portfolio presentation.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 px-3.5 py-2 text-center shrink-0">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                Milestones Passed
              </span>
              <span className="text-lg font-black text-white">
                {
                  RUNNING_YOUR_TRADE_BUSINESS_PATH.filter(
                    m => businessAnswers[m.id] === m.knowledgeCheck.correctIndex
                  ).length
                }{' '}
                / {RUNNING_YOUR_TRADE_BUSINESS_PATH.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {RUNNING_YOUR_TRADE_BUSINESS_PATH.map(milestone => {
              const selectedAns = businessAnswers[milestone.id]
              const passed = selectedAns === milestone.knowledgeCheck.correctIndex
              return (
                <div
                  key={milestone.id}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between space-y-3 ${
                    passed
                      ? 'border-emerald-400 bg-emerald-950/60'
                      : 'border-white/15 bg-black/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="rounded bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                        Step {milestone.stepNumber}
                      </span>
                      {passed && (
                        <span className="text-[10px] font-black text-emerald-300 flex items-center gap-0.5">
                          <Check className="h-3 w-3" /> Passed
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-white leading-snug">
                      {milestone.title}
                    </h4>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {milestone.summary}
                    </p>
                    <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-[10px] text-amber-200">
                      <strong className="block text-amber-300 mb-0.5">Practice Activity:</strong>
                      {milestone.practiceActivity}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <p className="text-[10px] font-bold text-emerald-200 leading-snug">
                      Check: {milestone.knowledgeCheck.question}
                    </p>
                    <div className="space-y-1">
                      {milestone.knowledgeCheck.options.slice(0, 2).map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setBusinessAnswers(prev => ({ ...prev, [milestone.id]: idx }))
                          }
                          className={`w-full text-left rounded px-2 py-1 text-[10px] border transition-colors cursor-pointer ${
                            selectedAns === idx && idx === milestone.knowledgeCheck.correctIndex
                              ? 'border-emerald-400 bg-emerald-500/30 text-white font-bold'
                              : selectedAns === idx
                              ? 'border-rose-400 bg-rose-500/30 text-rose-100'
                              : 'border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* PROPOSED NEXT PROFESSIONS & LESSON TOPICS (VIDEO SELECTION PENDING)   */}
        {/* ===================================================================== */}
        <div className="mt-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  Upcoming Curriculum Roadmap
                </span>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Proposed lesson topics · Source videos not yet selected
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">
                More Professions Covered Next in &ldquo;Skilled Trades: Learn by Doing&rdquo;
              </h3>
            </div>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
              Bookmarked Topics: {Object.values(bookmarkedProposedIds).filter(Boolean).length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2.5 px-3.5 font-black">Profession or Skill</th>
                  <th className="py-2.5 px-3.5 font-black">First Video Topic</th>
                  <th className="py-2.5 px-3.5 font-black">Second Video Topic</th>
                  <th className="py-2.5 px-3.5 font-black">Practice Activity Preview</th>
                  <th className="py-2.5 px-3.5 font-black text-right">Journey Queue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
                {PROPOSED_NEXT_TRADE_PROFESSIONS.map(item => {
                  const isBookmarked = Boolean(bookmarkedProposedIds[item.id])
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                        <div>{item.professionOrSkill}</div>
                        <span className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-zinc-700 dark:text-zinc-300 font-medium">
                        {item.firstVideoTopic}
                      </td>
                      <td className="py-2.5 px-3.5 text-zinc-700 dark:text-zinc-300 font-medium">
                        {item.secondVideoTopic}
                      </td>
                      <td className="py-2.5 px-3.5 text-zinc-600 dark:text-zinc-400 max-w-xs">
                        {item.suggestedPracticePreview}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setBookmarkedProposedIds(prev => ({
                              ...prev,
                              [item.id]: !prev[item.id]
                            }))
                          }
                          className={`rounded-full px-3 py-1 text-[11px] font-bold border cursor-pointer transition-colors ${
                            isBookmarked
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700'
                              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-[#0A66C2]'
                          }`}
                        >
                          {isBookmarked ? 'Queued ✓' : '+ Queue Topic'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
