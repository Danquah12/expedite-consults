"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Award,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  FileText,
  HelpCircle,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import {
  LEARN_CATEGORY_META,
  LEARN_INDUSTRY_GROUPS,
  LearnByDoingLesson,
  LearnByDoingLessonTelemetry,
  LearnIndustryGroupId,
  PROPOSED_NEXT_TRADE_PROFESSIONS,
  RUNNING_YOUR_TRADE_BUSINESS_PATH,
  SKILLED_TRADES_COLLECTION_META,
  SkilledTradesCategory,
  createInitialLessonTelemetry,
  getIndustryGroupForCategory,
} from "@/lib/skilled-trades-learn-by-doing-data"
import { UserProfile } from "@/lib/connectln-data"
import { ConnectLnStudioPlayer } from "./ConnectLnStudioPlayer"

export type ShelfCategoryFilter =
  | "All"
  | "Global Interpreted"
  | SkilledTradesCategory
  | "Saved"
  | "Learning Journey"

export interface LinkedInLearningShelfHubProps {
  user?: UserProfile | null
  lessons: LearnByDoingLesson[]
  telemetryMap: Record<string, LearnByDoingLessonTelemetry>
  currentLanguage: { flag: string; localName: string; code?: string }
  recommendedCategory: SkilledTradesCategory | "All"
  selectedIndustryGroup: LearnIndustryGroupId
  setSelectedIndustryGroup: (g: LearnIndustryGroupId) => void
  selectedCategory: ShelfCategoryFilter
  setSelectedCategory: (c: ShelfCategoryFilter) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  initialLessonId?: string | null
  lesson6Variant: "primary" | "companion"
  setLesson6Variant: (v: "primary" | "companion") => void
  outboundNoticeByLesson: Record<string, string>
  onDismissOutboundNotice?: (lessonId: string) => void
  practiceDrafts: Record<string, string>
  setPracticeDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  practiceSavedBanner: Record<string, boolean>
  businessAnswers: Record<string, number>
  setBusinessAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>
  bookmarkedProposedIds: Record<string, boolean>
  onToggleBookmarkedProposed: (id: string) => void
  onWatchLesson: (lesson: LearnByDoingLesson) => void
  onOutboundVideoClick: (lesson: LearnByDoingLesson, creatorName: string) => void
  onToggleSave: (lessonId: string) => void
  onToggleLearningJourney: (lessonId: string) => void
  onSavePractice: (lessonId: string) => void
  onPracticePhotoUpload: (lessonId: string, e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectKnowledgeAnswer: (
    lesson: LearnByDoingLesson,
    optionIdx: number,
    correctIdx: number
  ) => void
  onMarkVideoReviewed: (lessonId: string) => void
  onClaimCertificate?: (certTitle: string) => void
  resolveInstructorProfile: (
    lessonId: string,
    creator: string,
    category: SkilledTradesCategory
  ) => {
    instructorName: string
    role: string
    avatarUrl: string
    ringColor: string
  }
}

const LIVE_ROADMAP_CATEGORY_MAP: Record<string, SkilledTradesCategory> = {
  prop_masonry_bricklaying: "Masonry & Tile",
  prop_tile_installation: "Masonry & Tile",
  prop_appliance_maintenance: "Machining & Repair",
  prop_landscaping_gardening: "Agriculture & Landscaping",
  prop_tailoring_sewing: "Tailoring & Sewing",
  prop_barbering_hairdressing: "Barbering & Beauty",
  prop_cooking_catering: "Culinary & Hospitality",
  prop_small_business_trades: "Finance & Business",
}

function formatDurationPill(raw?: string): string {
  const clean = String(raw || "").trim()
  if (!clean) return "Hands-On"
  const parts = clean.split(":")
  if (parts.length === 2) {
    const mins = Number(parts[0])
    const secs = Number(parts[1])
    if (Number.isFinite(mins) && Number.isFinite(secs)) {
      return `${mins}m ${String(secs).padStart(2, "0")}s`
    }
  }
  return clean
}

function getLessonVariantView(
  lesson: LearnByDoingLesson,
  lesson6Variant: "primary" | "companion"
) {
  const isLesson6 =
    lesson.id === "lbd_painting_brush_roller_6" && Boolean(lesson.companionVariant)
  const v =
    isLesson6 && lesson6Variant === "companion" && lesson.companionVariant
      ? lesson.companionVariant
      : null
  const youtubeId = v?.youtubeId || lesson.youtubeId
  return {
    isLesson6,
    videoLabel: v ? v.videoLabel : lesson.videoLabel,
    title: v ? v.title : lesson.title,
    creator: v ? v.originalCreator : lesson.originalCreator,
    creatorDomain: v ? v.creatorDomain : lesson.creatorDomain,
    description: v ? v.description : lesson.description,
    skills: v ? v.skillsCovered : lesson.skillsCovered,
    sourceUrl: v ? v.sourceVideoUrl : lesson.sourceVideoUrl,
    refUrl: v ? v.referenceArticleUrl : lesson.referenceArticleUrl,
    practice: v ? v.practiceActivity : lesson.practiceActivity,
    deliverablePrompt: v ? v.practiceDeliverablePrompt : lesson.practiceDeliverablePrompt,
    knowledgeCheck: v ? v.knowledgeCheck : lesson.knowledgeCheck,
    duration: v ? v.duration : lesson.duration,
    youtubeId,
    embedAvailable: v ? v.embedAvailable : lesson.embedAvailable,
    thumbnailUrl: youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
      : lesson.thumbnailUrl,
  }
}

interface CoursePopOutCardProps {
  lesson: LearnByDoingLesson
  telemetry: LearnByDoingLessonTelemetry
  lesson6Variant: "primary" | "companion"
  layout: "shelf" | "grid"
  onOpenModal: (lesson: LearnByDoingLesson) => void
  onToggleSave: (lessonId: string) => void
  onToggleJourney: (lessonId: string) => void
}

function CoursePopOutCard({
  lesson,
  telemetry,
  lesson6Variant,
  layout,
  onOpenModal,
  onToggleSave,
  onToggleJourney,
}: CoursePopOutCardProps) {
  const view = getLessonVariantView(lesson, lesson6Variant)
  const durationBadge = formatDurationPill(view.duration)

  const badge = telemetry.isCompleted
    ? { label: "Completed ✓", cls: "bg-emerald-500/95 text-white" }
    : telemetry.inLearningJourney
      ? { label: "In Journey", cls: "bg-[#0A66C2]/95 text-white" }
      : lesson.sourceLanguage && lesson.sourceLanguage !== "en"
        ? { label: lesson.sourceLanguageLabel || "🌍 Global", cls: "bg-amber-400/95 text-slate-950" }
        : { label: "Popular", cls: "bg-white/95 text-slate-800" }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenModal(lesson)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpenModal(lesson)
        }
      }}
      className={`group relative flex flex-col justify-between rounded-xl bg-white dark:bg-zinc-900 p-2 -m-2 transition-all duration-200 ease-out hover:scale-[1.06] hover:-translate-y-2 hover:z-30 focus-within:scale-[1.06] focus-within:-translate-y-2 focus-within:z-30 hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.28)] focus-within:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.28)] border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus-within:border-[#0A66C2] focus-within:ring-2 focus-within:ring-[#0A66C2]/25 focus:outline-none cursor-pointer ${
        layout === "shelf" ? "w-[264px] sm:w-[276px] shrink-0 snap-start" : "w-full"
      }`}
    >
      <div>
        {/* 16:9 Rounded Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800">
          <img
            src={view.thumbnailUrl}
            alt={view.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Top-Left Status / Popular Frosted Badge */}
          <span
            className={`absolute top-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-xs ${badge.cls}`}
          >
            {badge.label}
          </span>

          {/* Bottom-Right Duration Badge */}
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white font-mono">
            {durationBadge}
          </span>

          {/* Hover / Focus Center Play Scrim */}
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 text-slate-950 px-3 py-1.5 text-[11px] font-extrabold shadow-lg">
              <Play className="h-3.5 w-3.5 fill-slate-950" />
              <span>Watch Lesson</span>
            </span>
          </div>
        </div>

        {/* Clean Resting Card Body */}
        <div className="pt-2.5 px-0.5 space-y-1">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
            Course · {lesson.category}
          </p>
          <h4 className="text-[13.5px] font-bold leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-[2.4rem]">
            {view.title}
          </h4>
          <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 truncate">
            By: {view.creator}
          </p>

          {telemetry.progressPercent > 0 && (
            <div className="pt-1 space-y-0.5">
              <div className="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    telemetry.isCompleted ? "bg-emerald-500" : "bg-[#0A66C2]"
                  }`}
                  style={{ width: `${telemetry.progressPercent}%` }}
                />
              </div>
              <span className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                {telemetry.progressPercent}% complete
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pop-Out Hover / Focus Action Tray */}
      <div className="mt-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-24 group-focus-within:opacity-100 group-focus-within:max-h-24 transition-all duration-200 space-y-1.5 px-0.5">
        <div className="flex flex-wrap gap-1">
          {view.skills.slice(0, 2).map((sk) => (
            <span
              key={sk}
              className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[9.5px] font-semibold text-zinc-600 dark:text-zinc-300 truncate max-w-[125px]"
            >
              {sk}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenModal(lesson)
            }}
            className="flex-1 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white py-1 px-2.5 text-[10.5px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <Play className="h-3 w-3 fill-white" />
            <span>Watch</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSave(lesson.id)
            }}
            className={`rounded-full border py-1 px-2 text-[10.5px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
              telemetry.isSaved
                ? "bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200"
                : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-[#0A66C2]"
            }`}
          >
            {telemetry.isSaved ? (
              <BookmarkCheck className="h-3 w-3" />
            ) : (
              <Bookmark className="h-3 w-3" />
            )}
            <span>{telemetry.isSaved ? "Saved" : "Save"}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleJourney(lesson.id)
            }}
            className={`rounded-full border py-1 px-2 text-[10.5px] font-semibold cursor-pointer transition-colors ${
              telemetry.inLearningJourney
                ? "bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200"
                : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-emerald-600"
            }`}
          >
            {telemetry.inLearningJourney ? "Journey ✓" : "+ Journey"}
          </button>
        </div>
      </div>
    </div>
  )
}

interface LearningCarouselShelfProps {
  title: string
  subtitle?: string
  lessons: LearnByDoingLesson[]
  telemetryMap: Record<string, LearnByDoingLessonTelemetry>
  lesson6Variant: "primary" | "companion"
  onOpenModal: (lesson: LearnByDoingLesson) => void
  onToggleSave: (lessonId: string) => void
  onToggleJourney: (lessonId: string) => void
  onSeeAll?: () => void
  seeAllLabel?: string
  pillsSlot?: React.ReactNode
}

function LearningCarouselShelf({
  title,
  subtitle,
  lessons,
  telemetryMap,
  lesson6Variant,
  onOpenModal,
  onToggleSave,
  onToggleJourney,
  onSeeAll,
  seeAllLabel = "See all",
  pillsSlot,
}: LearningCarouselShelfProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: direction === "left" ? -840 : 840,
      behavior: "smooth",
    })
  }

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-3">
      {/* Shelf Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline mr-1 cursor-pointer"
            >
              {seeAllLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label={`Scroll ${title} left`}
            className="h-8 w-8 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label={`Scroll ${title} right`}
            className="h-8 w-8 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Optional Skill Filter Pills Slot */}
      {pillsSlot}

      {/* Horizontal Pop-Out Rail (extra py-5 -my-3 prevents vertical hover clipping) */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto py-5 -my-3 px-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {lessons.map((lesson) => (
          <CoursePopOutCard
            key={lesson.id}
            lesson={lesson}
            telemetry={telemetryMap[lesson.id] || createInitialLessonTelemetry(lesson.id)}
            lesson6Variant={lesson6Variant}
            layout="shelf"
            onOpenModal={onOpenModal}
            onToggleSave={onToggleSave}
            onToggleJourney={onToggleJourney}
          />
        ))}
      </div>
    </div>
  )
}

export function LinkedInLearningShelfHub({
  user,
  lessons,
  telemetryMap,
  currentLanguage,
  recommendedCategory,
  selectedIndustryGroup,
  setSelectedIndustryGroup,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  initialLessonId = null,
  lesson6Variant,
  setLesson6Variant,
  outboundNoticeByLesson,
  onDismissOutboundNotice,
  practiceDrafts,
  setPracticeDrafts,
  practiceSavedBanner,
  businessAnswers,
  setBusinessAnswers,
  bookmarkedProposedIds,
  onToggleBookmarkedProposed,
  onWatchLesson,
  onOutboundVideoClick,
  onToggleSave,
  onToggleLearningJourney,
  onSavePractice,
  onPracticePhotoUpload,
  onSelectKnowledgeAnswer,
  onMarkVideoReviewed,
  onClaimCertificate,
  resolveInstructorProfile,
}: LinkedInLearningShelfHubProps) {
  const [explicitViewMode, setExplicitViewMode] = useState<"shelves" | "grid">("shelves")
  const [skillShelfFilter, setSkillShelfFilter] = useState<
    LearnIndustryGroupId | "global"
  >(() =>
    recommendedCategory !== "All"
      ? getIndustryGroupForCategory(recommendedCategory)
      : "trades"
  )
  const [skillShelfSubCategory, setSkillShelfSubCategory] = useState<
    SkilledTradesCategory | "all"
  >("all")
  const [focusedLessonId, setFocusedLessonId] = useState<string | null>(
    initialLessonId || null
  )
  const [modalTab, setModalTab] = useState<"overview" | "practice" | "quiz" | "upnext">(
    "overview"
  )
  const [showBusinessPath, setShowBusinessPath] = useState<boolean>(false)
  const [showRoadmap, setShowRoadmap] = useState<boolean>(false)
  const modalPhotoInputRef = useRef<HTMLInputElement | null>(null)
  const hubTopRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (initialLessonId) {
      setFocusedLessonId(initialLessonId)
      setModalTab("overview")
    }
  }, [initialLessonId])

  useEffect(() => {
    if (recommendedCategory !== "All") {
      setSkillShelfFilter(getIndustryGroupForCategory(recommendedCategory))
    }
  }, [recommendedCategory])

  useEffect(() => {
    if (!focusedLessonId || typeof window === "undefined") return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFocusedLessonId(null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [focusedLessonId])

  const totalLessonsCount = lessons.length
  const allTelemetry = Object.values(telemetryMap)
  const totalVerifiedViews = allTelemetry.reduce((sum, t) => sum + t.verifiedVideoViews, 0)
  const totalSavedCount = allTelemetry.filter((t) => t.isSaved).length
  const totalJourneyCount = allTelemetry.filter((t) => t.inLearningJourney).length
  const overallProgress =
    allTelemetry.length > 0
      ? Math.round(allTelemetry.reduce((sum, t) => sum + t.progressPercent, 0) / allTelemetry.length)
      : 0
  const globalInterpretedCount = useMemo(
    () => lessons.filter((l) => Boolean(l.sourceLanguage && l.sourceLanguage !== "en")).length,
    [lessons]
  )

  const hasActiveFilter =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedIndustryGroup !== "all"

  const effectiveViewMode: "shelves" | "grid" = hasActiveFilter ? "grid" : explicitViewMode

  const activeGroupObj =
    selectedIndustryGroup !== "all"
      ? LEARN_INDUSTRY_GROUPS.find((g) => g.id === selectedIndustryGroup)
      : undefined

  const filteredGridLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return lessons.filter((lesson) => {
      const t = telemetryMap[lesson.id] || createInitialLessonTelemetry(lesson.id)
      const matchesCat =
        selectedCategory === "All"
          ? activeGroupObj
            ? activeGroupObj.categories.includes(lesson.category)
            : true
          : selectedCategory === "Global Interpreted"
            ? Boolean(lesson.sourceLanguage && lesson.sourceLanguage !== "en")
            : selectedCategory === "Saved"
              ? t.isSaved
              : selectedCategory === "Learning Journey"
                ? t.inLearningJourney
                : lesson.category === selectedCategory
      if (!matchesCat) return false
      if (!q) return true
      const haystack = [
        lesson.title,
        lesson.category,
        lesson.description,
        lesson.originalCreator,
        lesson.enclaveId,
        lesson.professionId,
        ...(lesson.skillsCovered || []),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [lessons, telemetryMap, selectedCategory, activeGroupObj, searchQuery])

  // User Display Names
  const rawName = String(user?.name || "Member").trim()
  const firstName = rawName.split(/\s+/)[0] || "Member"
  const rawRole = String(user?.profession || "").trim()
  const userRoleTitle =
    rawRole ||
    (recommendedCategory !== "All"
      ? `${recommendedCategory} Specialist`
      : "Certified Trade & Career Specialist")

  // Shelf 1: Grow and advance as a <Role>
  const shelf1Lessons = useMemo(() => {
    const targetCat: SkilledTradesCategory =
      recommendedCategory !== "All" ? recommendedCategory : "Carpentry"
    const targetGroupId = getIndustryGroupForCategory(targetCat)
    const groupCats =
      LEARN_INDUSTRY_GROUPS.find((g) => g.id === targetGroupId)?.categories || []

    const exact = lessons.filter((l) => l.category === targetCat)
    const sector = lessons.filter(
      (l) => l.category !== targetCat && groupCats.includes(l.category)
    )
    const extra = lessons.filter(
      (l) => l.category !== targetCat && !groupCats.includes(l.category)
    )
    return [...exact, ...sector, ...extra].slice(0, 14)
  }, [lessons, recommendedCategory])

  // Shelf 2: Top picks for <First Name> (diverse flagship lessons across all enclaves)
  const shelf2Lessons = useMemo(() => {
    const frontIds = new Set(shelf1Lessons.slice(0, 4).map((l) => l.id))
    const byCategory = new Map<SkilledTradesCategory, LearnByDoingLesson>()
    for (const l of lessons) {
      if (!byCategory.has(l.category)) {
        byCategory.set(l.category, l)
      }
    }
    const diverse = Array.from(byCategory.values()).filter((l) => !frontIds.has(l.id))
    const remainder = lessons.filter(
      (l) => !frontIds.has(l.id) && !diverse.some((d) => d.id === l.id)
    )
    return [...diverse, ...remainder].slice(0, 14)
  }, [lessons, shelf1Lessons])

  // Shelf 3: Because of skills you follow (green-pill controlled shelf)
  const activeSkillGroupObj =
    skillShelfFilter !== "all" && skillShelfFilter !== "global"
      ? LEARN_INDUSTRY_GROUPS.find((g) => g.id === skillShelfFilter)
      : undefined

  const shelf3Lessons = useMemo(() => {
    if (skillShelfFilter === "global") {
      return lessons.filter((l) => Boolean(l.sourceLanguage && l.sourceLanguage !== "en"))
    }
    if (activeSkillGroupObj) {
      if (
        skillShelfSubCategory !== "all" &&
        activeSkillGroupObj.categories.includes(skillShelfSubCategory)
      ) {
        return lessons.filter((l) => l.category === skillShelfSubCategory)
      }
      return lessons.filter((l) => activeSkillGroupObj.categories.includes(l.category))
    }
    return lessons.slice(0, 16)
  }, [lessons, skillShelfFilter, activeSkillGroupObj, skillShelfSubCategory])

  // Shelf 4: See what your community is learning this week
  const shelf4Lessons = useMemo(() => {
    const sorted = [...lessons].sort((a, b) => b.lessonNumber - a.lessonNumber)
    return sorted.slice(0, 16)
  }, [lessons])

  const handleOpenClassroomModal = (lesson: LearnByDoingLesson) => {
    setFocusedLessonId(lesson.id)
    setModalTab("overview")
    onWatchLesson(lesson)
  }

  const resetAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All")
    setSelectedIndustryGroup("all")
    setExplicitViewMode("shelves")
  }

  const focusedLesson = useMemo(
    () => lessons.find((l) => l.id === focusedLessonId) || null,
    [lessons, focusedLessonId]
  )

  const upNextLessons = useMemo(() => {
    if (!focusedLesson) return []
    const sameCat = lessons.filter(
      (l) => l.id !== focusedLesson.id && l.category === focusedLesson.category
    )
    const groupCats =
      LEARN_INDUSTRY_GROUPS.find(
        (g) => g.id === getIndustryGroupForCategory(focusedLesson.category)
      )?.categories || []
    const sameGroup = lessons.filter(
      (l) =>
        l.id !== focusedLesson.id &&
        l.category !== focusedLesson.category &&
        groupCats.includes(l.category)
    )
    return [...sameCat, ...sameGroup].slice(0, 8)
  }, [focusedLesson, lessons])

  return (
    <section
      id="skilled-trades-learn-by-doing"
      ref={hubTopRef}
      className="space-y-5"
    >
      {/* Clean Slim Top Search & Quick Filter Bar */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${totalLessonsCount} hands-on lessons by trade, profession, skill, or instructor...`}
              className="w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-8 pr-8 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#0A66C2]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                title="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Grouped 26-Profession Dropdown */}
          <select
            aria-label="Filter by trade or profession"
            value={
              selectedCategory === "All" ||
              selectedCategory === "Global Interpreted" ||
              selectedCategory === "Saved" ||
              selectedCategory === "Learning Journey"
                ? ""
                : selectedCategory
            }
            onChange={(e) => {
              const val = e.target.value as SkilledTradesCategory | ""
              if (!val) {
                setSelectedCategory("All")
                setSelectedIndustryGroup("all")
              } else {
                setSelectedCategory(val)
                setSelectedIndustryGroup(getIndustryGroupForCategory(val))
                setExplicitViewMode("grid")
              }
            }}
            className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-[#0A66C2] lg:w-64 shrink-0 cursor-pointer"
          >
            <option value="">All 26 Professions ({totalLessonsCount})</option>
            {LEARN_INDUSTRY_GROUPS.map((group) => (
              <optgroup key={group.id} label={`${group.emoji} ${group.label}`}>
                {group.categories.map((cat) => {
                  const cnt = lessons.filter((l) => l.category === cat).length
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({cnt})
                    </option>
                  )
                })}
              </optgroup>
            ))}
          </select>

          {/* Compact View & Collection Pills */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={resetAllFilters}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                effectiveViewMode === "shelves"
                  ? "bg-[#01754F] text-white border-[#01754F]"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-[#01754F]"
              }`}
            >
              All Shelves
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
                setSelectedIndustryGroup("all")
                setExplicitViewMode("grid")
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                effectiveViewMode === "grid" && !hasActiveFilter
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
              }`}
            >
              Browse All ({totalLessonsCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedIndustryGroup("all")
                if (selectedCategory === "Saved") {
                  setSelectedCategory("All")
                } else {
                  setSelectedCategory("Saved")
                  setExplicitViewMode("grid")
                }
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                selectedCategory === "Saved"
                  ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2]"
              }`}
            >
              🔖 Saved ({totalSavedCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedIndustryGroup("all")
                if (selectedCategory === "Learning Journey") {
                  setSelectedCategory("All")
                } else {
                  setSelectedCategory("Learning Journey")
                  setExplicitViewMode("grid")
                }
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                selectedCategory === "Learning Journey"
                  ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2]"
              }`}
            >
              🧭 My Journey ({totalJourneyCount})
            </button>
          </div>
        </div>

        {/* Inline Metrics Strip */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>
            {SKILLED_TRADES_COLLECTION_META.subtitle}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-0.5 font-semibold text-zinc-700 dark:text-zinc-200 shrink-0">
            <span>Views: {totalVerifiedViews}</span>
            <span>·</span>
            <span className="text-[#01754F] dark:text-emerald-400">
              Progress: {overallProgress}%
            </span>
          </span>
        </div>
      </div>

      {/* Main Content: LinkedIn Learning Horizontal Shelves OR Filtered 4-Column Pop-Out Grid */}
      {effectiveViewMode === "shelves" ? (
        <div className="space-y-5">
          {/* Shelf 1: Grow and advance as a <Role> */}
          <LearningCarouselShelf
            title={`Grow and advance as a ${userRoleTitle}`}
            subtitle="Tailored to your active profession & industry pathway — click any card to open the classroom"
            lessons={shelf1Lessons}
            telemetryMap={telemetryMap}
            lesson6Variant={lesson6Variant}
            onOpenModal={handleOpenClassroomModal}
            onToggleSave={onToggleSave}
            onToggleJourney={onToggleLearningJourney}
          />

          {/* Shelf 2: Top picks for <First Name> */}
          <LearningCarouselShelf
            title={`Top picks for ${firstName}`}
            subtitle="Cross-discipline essentials curated across ConnectLn’s 26 professions"
            lessons={shelf2Lessons}
            telemetryMap={telemetryMap}
            lesson6Variant={lesson6Variant}
            onOpenModal={handleOpenClassroomModal}
            onToggleSave={onToggleSave}
            onToggleJourney={onToggleLearningJourney}
          />

          {/* Shelf 3: Because of skills you follow */}
          <LearningCarouselShelf
            title="Because of skills you follow"
            lessons={shelf3Lessons}
            telemetryMap={telemetryMap}
            lesson6Variant={lesson6Variant}
            onOpenModal={handleOpenClassroomModal}
            onToggleSave={onToggleSave}
            onToggleJourney={onToggleLearningJourney}
            pillsSlot={
              <div className="space-y-2 pb-1">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {LEARN_INDUSTRY_GROUPS.map((group) => {
                    const isActive = skillShelfFilter === group.id
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          setSkillShelfFilter(group.id)
                          setSkillShelfSubCategory("all")
                        }}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer border ${
                          isActive
                            ? "bg-[#01754F] text-white border-[#01754F] shadow-2xs"
                            : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:border-[#01754F]"
                        }`}
                      >
                        {group.emoji} {group.label}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setSkillShelfFilter("global")
                      setSkillShelfSubCategory("all")
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer border ${
                      skillShelfFilter === "global"
                        ? "bg-[#01754F] text-white border-[#01754F] shadow-2xs"
                        : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:border-[#01754F]"
                    }`}
                  >
                    🌍 Global → {currentLanguage.flag} {currentLanguage.localName} ({globalInterpretedCount})
                  </button>
                </div>

                {activeSkillGroupObj && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSkillShelfSubCategory("all")}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border cursor-pointer transition-colors ${
                        skillShelfSubCategory === "all"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-[#01754F] text-[#01754F] dark:text-emerald-300"
                          : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-[#01754F]"
                      }`}
                    >
                      All in {activeSkillGroupObj.shortLabel}
                    </button>
                    {activeSkillGroupObj.categories.map((cat) => {
                      const cnt = lessons.filter((l) => l.category === cat).length
                      const isSub = skillShelfSubCategory === cat
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSkillShelfSubCategory(cat)}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border cursor-pointer transition-colors ${
                            isSub
                              ? "bg-emerald-50 dark:bg-emerald-950/60 border-[#01754F] text-[#01754F] dark:text-emerald-300"
                              : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-[#01754F]"
                          }`}
                        >
                          {LEARN_CATEGORY_META[cat]?.emoji} {cat} ({cnt})
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            }
          />

          {/* Shelf 4: See what your community is learning this week */}
          <LearningCarouselShelf
            title="See what your community is learning this week"
            subtitle={`Newest verified masterclasses across ConnectLn (${totalLessonsCount} total videos available)`}
            lessons={shelf4Lessons}
            telemetryMap={telemetryMap}
            lesson6Variant={lesson6Variant}
            onOpenModal={handleOpenClassroomModal}
            onToggleSave={onToggleSave}
            onToggleJourney={onToggleLearningJourney}
            onSeeAll={() => setExplicitViewMode("grid")}
            seeAllLabel={`Browse all ${totalLessonsCount} lessons →`}
          />
        </div>
      ) : (
        /* Filtered / Search / Browse-All 4-Column Pop-Out Grid View */
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-800 dark:text-zinc-100 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Back to Shelves</span>
              </button>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                Showing <strong className="text-zinc-900 dark:text-zinc-100">{filteredGridLessons.length}</strong> of{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">{totalLessonsCount}</strong> lessons
              </span>
              {selectedCategory !== "All" && (
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-[11px] font-bold text-[#0A66C2] dark:text-sky-300">
                  {selectedCategory}
                </span>
              )}
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredGridLessons.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {selectedCategory === "Saved"
                  ? "You have not saved any lessons yet."
                  : selectedCategory === "Learning Journey"
                    ? "You have not added any lessons to your Learning Journey yet."
                    : "No lessons match the current search or filter."}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hover over any course card in the shelves to Save or add to your Learning Journey.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-2 rounded-full bg-[#01754F] hover:bg-[#015e3f] px-4 py-1.5 text-xs font-bold text-white cursor-pointer"
              >
                Explore All Shelves
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-3">
              {filteredGridLessons.map((lesson) => (
                <CoursePopOutCard
                  key={lesson.id}
                  lesson={lesson}
                  telemetry={telemetryMap[lesson.id] || createInitialLessonTelemetry(lesson.id)}
                  lesson6Variant={lesson6Variant}
                  layout="grid"
                  onOpenModal={handleOpenClassroomModal}
                  onToggleSave={onToggleSave}
                  onToggleJourney={onToggleLearningJourney}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clean Collapsible Footer Accordions (Zero Clutter Below Shelves) */}
      <div className="space-y-3">
        {/* Accordion 1: Running Your Business Path */}
        <div
          id="lbd-running-your-business"
          className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setShowBusinessPath((p) => !p)}
            className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">💼</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Running Your Trade Business Path (5 Interactive Steps)
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Estimating, client communication, job costing, and portfolio standards
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-zinc-500 transition-transform ${
                showBusinessPath ? "rotate-180" : ""
              }`}
            />
          </button>

          {showBusinessPath && (
            <div className="p-5 pt-2 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-5 gap-3 bg-zinc-50/60 dark:bg-zinc-950/30">
              {RUNNING_YOUR_TRADE_BUSINESS_PATH.map((milestone) => {
                const selectedAns = businessAnswers[milestone.id]
                return (
                  <div
                    key={milestone.id}
                    className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 flex flex-col justify-between space-y-2.5"
                  >
                    <div className="space-y-1.5">
                      <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                        Step {milestone.stepNumber}
                      </span>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 leading-snug">
                        {milestone.title}
                      </h4>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {milestone.summary}
                      </p>
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 p-2 text-[10px] text-amber-900 dark:text-amber-200">
                        <strong className="block mb-0.5">Practice Activity:</strong>
                        {milestone.practiceActivity}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                      <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 leading-snug">
                        Check: {milestone.knowledgeCheck.question}
                      </p>
                      <div className="space-y-1">
                        {milestone.knowledgeCheck.options.slice(0, 2).map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setBusinessAnswers((prev) => ({
                                ...prev,
                                [milestone.id]: idx,
                              }))
                            }
                            className={`w-full text-left rounded px-2 py-1 text-[10px] border transition-colors cursor-pointer ${
                              selectedAns === idx && idx === milestone.knowledgeCheck.correctIndex
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold"
                                : selectedAns === idx
                                  ? "border-rose-400 bg-rose-50 text-rose-800"
                                  : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-[#0A66C2] text-zinc-700 dark:text-zinc-200"
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
          )}
        </div>

        {/* Accordion 2: Curriculum Roadmap & Upcoming Professions */}
        <div
          id="lbd-next-professions-catalogue"
          className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setShowRoadmap((p) => !p)}
            className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🗺️</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Curriculum Roadmap &amp; Upcoming Professions ({PROPOSED_NEXT_TRADE_PROFESSIONS.length} Topics)
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Jump directly to live profession lessons or queue upcoming modules
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-zinc-500 transition-transform ${
                showRoadmap ? "rotate-180" : ""
              }`}
            />
          </button>

          {showRoadmap && (
            <div className="p-5 pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                      <th className="py-2.5 px-3.5 font-black">Profession or Skill</th>
                      <th className="py-2.5 px-3.5 font-black">First Video Topic</th>
                      <th className="py-2.5 px-3.5 font-black">Second Video Topic</th>
                      <th className="py-2.5 px-3.5 font-black">Practice Activity Preview</th>
                      <th className="py-2.5 px-3.5 font-black text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
                    {PROPOSED_NEXT_TRADE_PROFESSIONS.map((item) => {
                      const isLive = item.status === "Live Now · Available Above"
                      const liveCategory = LIVE_ROADMAP_CATEGORY_MAP[item.id]
                      const isBookmarked = Boolean(bookmarkedProposedIds[item.id])
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                            <div>{item.professionOrSkill}</div>
                            <span
                              className={`text-[10px] font-semibold ${
                                isLive
                                  ? "text-[#01754F] dark:text-emerald-400"
                                  : "text-zinc-500 dark:text-zinc-400"
                              }`}
                            >
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
                            {isLive && liveCategory ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchQuery("")
                                  setSelectedCategory(liveCategory)
                                  setSelectedIndustryGroup(
                                    getIndustryGroupForCategory(liveCategory)
                                  )
                                  setExplicitViewMode("grid")
                                  hubTopRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  })
                                }}
                                className="rounded-full px-3 py-1 text-[11px] font-bold bg-[#01754F] hover:bg-[#015e3f] text-white cursor-pointer transition-colors"
                              >
                                Watch Lessons ↑
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onToggleBookmarkedProposed(item.id)}
                                className={`rounded-full px-3 py-1 text-[11px] font-bold border cursor-pointer transition-colors ${
                                  isBookmarked
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700"
                                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-[#0A66C2]"
                                }`}
                              >
                                {isBookmarked ? "Queued ✓" : "+ Queue Topic"}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Focused Pop-Out Classroom Modal */}
      {focusedLesson && (() => {
        const t =
          telemetryMap[focusedLesson.id] ||
          createInitialLessonTelemetry(focusedLesson.id)
        const view = getLessonVariantView(focusedLesson, lesson6Variant)
        const canEmbed = Boolean(view.embedAvailable && view.youtubeId)
        const instructor = resolveInstructorProfile(
          focusedLesson.id,
          view.creator,
          focusedLesson.category
        )
        const serialPlate = `CLN-LBD${String(focusedLesson.lessonNumber).padStart(2, "0")}`
        const outboundMsg = outboundNoticeByLesson[focusedLesson.id]

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={view.title}
            onClick={() => setFocusedLessonId(null)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                      {LEARN_CATEGORY_META[focusedLesson.category]?.emoji} {focusedLesson.category}
                    </span>
                    <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                      {t.progressPercent}% Complete
                    </span>
                    {t.isCompleted && (
                      <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-bold">
                        Completed ✓
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {view.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <a
                    href={view.refUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onOutboundVideoClick(focusedLesson, view.creator)}
                    className="rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:border-[#0A66C2] inline-flex items-center gap-1"
                  >
                    <span>{view.creator}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onToggleSave(focusedLesson.id)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                      t.isSaved
                        ? "bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200"
                        : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
                    }`}
                  >
                    {t.isSaved ? (
                      <BookmarkCheck className="h-3.5 w-3.5" />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5" />
                    )}
                    <span>{t.isSaved ? "Saved" : "Save"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleLearningJourney(focusedLesson.id)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-bold cursor-pointer ${
                      t.inLearningJourney
                        ? "bg-[#01754F] text-white border-[#01754F]"
                        : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
                    }`}
                  >
                    {t.inLearningJourney ? "In Journey ✓" : "+ Journey"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusedLessonId(null)}
                    aria-label="Close classroom modal"
                    className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 2-Column Classroom Body */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Embedded Video Stage */}
                <div className="lg:col-span-7 space-y-3">
                  {canEmbed && view.youtubeId ? (
                    <div className="rounded-xl overflow-hidden bg-black border border-zinc-200 dark:border-zinc-800">
                      <ConnectLnStudioPlayer
                        key={`modal-player-${focusedLesson.id}-${view.youtubeId}-${lesson6Variant}`}
                        youtubeId={view.youtubeId}
                        title={view.title}
                        serialPlate={serialPlate}
                        speaker={instructor.instructorName}
                        speakerRole={view.creator}
                        speakerAvatarUrl={instructor.avatarUrl}
                        description={view.description}
                        takeaways={view.skills}
                        sourceLanguage={focusedLesson.sourceLanguage}
                        sourceLanguageLabel={focusedLesson.sourceLanguageLabel}
                        durationLabel={view.duration}
                        autoPlay={true}
                        initialMuted={false}
                        playerId={`lbd-player-${focusedLesson.id}`}
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-6 text-center text-white space-y-3">
                      <p className="text-sm font-bold">{view.title}</p>
                      <a
                        href={view.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onOutboundVideoClick(focusedLesson, view.creator)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-4 py-2 text-xs font-bold text-white"
                      >
                        <span>Watch on {view.creator}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Optional Lesson 6 Variant Switcher */}
                  {view.isLesson6 && focusedLesson.companionVariant && (
                    <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                        Painting Lesson Topic:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setLesson6Variant("primary")}
                          className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold cursor-pointer ${
                            lesson6Variant === "primary"
                              ? "bg-[#01754F] text-white"
                              : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          Brush &amp; Roller (Sherwin-Williams)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLesson6Variant("companion")}
                          className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold cursor-pointer ${
                            lesson6Variant === "companion"
                              ? "bg-[#01754F] text-white"
                              : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          Painter&apos;s Tape (FrogTape)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Video Review & External Link Bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={() => onMarkVideoReviewed(focusedLesson.id)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold border inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                        t.videoReviewed
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200"
                          : "bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-emerald-600"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>
                        {t.videoReviewed ? "Video Watched (34% ✓)" : "Mark Video Watched"}
                      </span>
                    </button>

                    <a
                      href={view.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onOutboundVideoClick(focusedLesson, view.creator)}
                      className="text-xs font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Watch on original site ({view.creator})</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {outboundMsg && (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-3 flex items-start justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
                      <p className="leading-snug">{outboundMsg}</p>
                      {onDismissOutboundNotice && (
                        <button
                          type="button"
                          onClick={() => onDismissOutboundNotice(focusedLesson.id)}
                          className="shrink-0 p-0.5 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: 4-Tab Classroom Study Panel */}
                <div className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex flex-col overflow-hidden">
                  {/* Tab Switcher */}
                  <div className="grid grid-cols-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-bold">
                    {(
                      [
                        { id: "overview", label: "Overview" },
                        { id: "practice", label: "Practice" },
                        { id: "quiz", label: "Quiz" },
                        { id: "upnext", label: "Up Next" },
                      ] as const
                    ).map((tb) => (
                      <button
                        key={tb.id}
                        type="button"
                        onClick={() => setModalTab(tb.id)}
                        className={`py-2.5 px-2 text-center border-b-2 transition-colors cursor-pointer ${
                          modalTab === tb.id
                            ? "border-[#01754F] text-[#01754F] dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20"
                            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                      >
                        {tb.label}
                      </button>
                    ))}
                  </div>

                  {/* Active Tab Content */}
                  <div className="p-4 space-y-4 overflow-y-auto max-h-[520px] flex-1">
                    {modalTab === "overview" && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            Lesson Overview
                          </span>
                          <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                            {view.description}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                            Skills Covered
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {view.skills.map((sk) => (
                              <span
                                key={sk}
                                className="rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800 px-2.5 py-0.5 text-[11px] font-semibold text-[#0A66C2] dark:text-sky-300 inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3 w-3 text-[#01754F] dark:text-emerald-400" />
                                <span>{sk}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {focusedLesson.detailedStudyNotes &&
                          focusedLesson.detailedStudyNotes.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <BookOpen className="h-3 w-3 text-[#0A66C2]" />
                                <span>Detailed Study Notes</span>
                              </span>
                              <div className="space-y-1.5">
                                {focusedLesson.detailedStudyNotes.map((note, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed flex gap-2"
                                  >
                                    <span className="h-4 w-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span>{note}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {focusedLesson.fieldTip && (
                          <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-[11.5px] text-emerald-950 dark:text-emerald-200">
                            <strong className="block mb-0.5">💡 Pro Field Tip</strong>
                            {focusedLesson.fieldTip}
                          </div>
                        )}
                      </div>
                    )}

                    {modalTab === "practice" && (
                      <div className="space-y-3">
                        <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-amber-950 dark:text-amber-200 inline-flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              <span>Guided Practice Activity</span>
                            </span>
                            {t.practiceCompletedAt && (
                              <span className="rounded-full bg-[#01754F] text-white px-2 py-0.5 text-[10px] font-bold">
                                Logged ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                            {view.practice}
                          </p>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                            {view.deliverablePrompt}
                          </p>
                        </div>

                        <textarea
                          rows={4}
                          value={practiceDrafts[focusedLesson.id] ?? t.practiceNotes ?? ""}
                          onChange={(e) =>
                            setPracticeDrafts((prev) => ({
                              ...prev,
                              [focusedLesson.id]: e.target.value,
                            }))
                          }
                          placeholder="Write your hands-on practice deliverable notes here..."
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0A66C2]"
                        />

                        {t.practicePhotoDataUrl && (
                          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900 p-2 space-y-1">
                            <p className="text-[10px] font-semibold text-zinc-500 truncate">
                              Attached photo: {t.practicePhotoName}
                            </p>
                            <img
                              src={t.practicePhotoDataUrl}
                              alt="Practice deliverable"
                              className="w-full max-h-36 object-cover rounded"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <input
                            ref={modalPhotoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onPracticePhotoUpload(focusedLesson.id, e)}
                          />
                          <button
                            type="button"
                            onClick={() => modalPhotoInputRef.current?.click()}
                            className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:border-[#0A66C2] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            <span>Attach Photo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onSavePractice(focusedLesson.id)}
                            className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-1.5 text-[11px] font-bold cursor-pointer"
                          >
                            Save Practice Deliverable
                          </button>
                        </div>

                        {practiceSavedBanner[focusedLesson.id] && (
                          <p className="text-[11px] font-bold text-[#01754F] dark:text-emerald-400">
                            ✓ Practice deliverable saved cleanly (+33% progress)
                          </p>
                        )}
                      </div>
                    )}

                    {modalTab === "quiz" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          <HelpCircle className="h-4 w-4 text-[#0A66C2]" />
                          <span>Mastery Knowledge Check</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                          {view.knowledgeCheck.question}
                        </p>

                        <div className="space-y-2">
                          {view.knowledgeCheck.options.map((opt, idx) => {
                            const selected = t.knowledgeCheckSelectedOption === idx
                            const isCorrect = idx === view.knowledgeCheck.correctIndex
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  onSelectKnowledgeAnswer(
                                    focusedLesson,
                                    idx,
                                    view.knowledgeCheck.correctIndex
                                  )
                                }
                                className={`w-full text-left rounded-xl p-2.5 text-xs border transition-colors cursor-pointer ${
                                  selected && isCorrect
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold"
                                    : selected
                                      ? "border-rose-400 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200"
                                      : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#0A66C2] text-zinc-800 dark:text-zinc-200"
                                }`}
                              >
                                {opt}
                              </button>
                            )
                          })}
                        </div>

                        {t.knowledgeCheckSelectedOption !== undefined && (
                          <div
                            className={`rounded-xl p-3 text-[11.5px] border ${
                              t.knowledgeCheckPassed
                                ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 text-emerald-900 dark:text-emerald-200"
                                : "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 text-amber-900 dark:text-amber-200"
                            }`}
                          >
                            <strong className="block mb-0.5">
                              {t.knowledgeCheckPassed
                                ? "✓ Correct! (+33% Knowledge Check complete)"
                                : "Try again — review the reasoning below:"}
                            </strong>
                            {view.knowledgeCheck.explanation}
                          </div>
                        )}

                        {t.isCompleted && onClaimCertificate && (
                          <button
                            type="button"
                            onClick={() =>
                              onClaimCertificate(
                                `${view.title} (${SKILLED_TRADES_COLLECTION_META.title})`
                              )
                            }
                            className="w-full rounded-full bg-[#01754F] hover:bg-[#015e3f] text-white py-2 px-4 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Award className="h-4 w-4" />
                            <span>Claim Verified Completion Certificate</span>
                          </button>
                        )}
                      </div>
                    )}

                    {modalTab === "upnext" && (
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                          Up Next in {focusedLesson.category} &amp; Related Fields
                        </span>
                        {upNextLessons.length === 0 ? (
                          <p className="text-xs text-zinc-500">
                            No additional lessons queued in this track.
                          </p>
                        ) : (
                          upNextLessons.map((nextL) => {
                            const nv = getLessonVariantView(nextL, lesson6Variant)
                            return (
                              <button
                                key={nextL.id}
                                type="button"
                                onClick={() => handleOpenClassroomModal(nextL)}
                                className="w-full flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0A66C2] p-2 text-left transition-colors cursor-pointer"
                              >
                                <img
                                  src={nv.thumbnailUrl}
                                  alt={nv.title}
                                  className="w-20 h-12 rounded-md object-cover shrink-0 bg-zinc-100"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-semibold text-zinc-500 truncate">
                                    {nextL.category} · {formatDurationPill(nv.duration)}
                                  </p>
                                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                                    {nv.title}
                                  </p>
                                </div>
                              </button>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </section>
  )
}
