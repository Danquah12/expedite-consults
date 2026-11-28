"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
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
  X,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  MoreHorizontal,
  Globe,
  ShieldCheck,
  SquarePen,
  RefreshCw,
  Search
} from "lucide-react"
import type { LearningVideoSyncMeta } from "@/lib/connectln-learning-video-sync"
import {
  SkilledTradesCategory,
  LearnByDoingLesson,
  LearnByDoingLessonTelemetry,
  LEARN_CATEGORY_META,
  LEARN_INDUSTRY_GROUPS,
  LearnIndustryGroupId,
  getIndustryGroupForCategory,
  SKILLED_TRADES_COLLECTION_META,
  SKILLED_TRADES_LEARN_BY_DOING_LESSONS,
  RUNNING_YOUR_TRADE_BUSINESS_PATH,
  PROPOSED_NEXT_TRADE_PROFESSIONS,
  loadAllLearnByDoingTelemetry,
  saveAllLearnByDoingTelemetry,
  computeLessonProgress,
  createInitialLessonTelemetry
} from "@/lib/skilled-trades-learn-by-doing-data"
import { UserProfile } from "@/lib/connectln-data"
import { useLanguage } from "@/context/LanguageContext"
import { ConnectLnStudioPlayer, CONNECTLN_VIDEO_PLAY_EVENT, notifyExclusiveVideoPlay } from "./ConnectLnStudioPlayer"
import { NoctisVideoInterpreterPopup } from "./NoctisVideoInterpreterPopup"
import { LinkedInLearningShelfHub } from "./LinkedInLearningShelfHub"
import {
  useAutoplayVideosPref,
  registerViewportVideoSlot,
  notifyManualVideoOverride,
  requestViewportAutoplayEvaluation,
} from "@/lib/connectln-settings"

interface SkilledTradesLearnByDoingSectionProps {
  user?: UserProfile | null
  mode?: 'full_academy' | 'home_videos_only'
  initialLessonId?: string | null
  initialCategory?: SkilledTradesCategory | null
  onOpenInLearnTab?: (lessonId?: string, category?: SkilledTradesCategory) => void
  onTelemetryChange?: (summary: {
    savedLessonIds: string[]
    journeyLessonIds: string[]
    completedLessonIds: string[]
    overallProgressPercent: number
  }) => void
  onClaimCertificate?: (certTitle: string) => void
}

type CategoryFilter = 'All' | 'Global Interpreted' | SkilledTradesCategory | 'Saved' | 'Learning Journey'

export function resolveLearnCategoryForUser(user?: UserProfile | null): CategoryFilter {
  const raw = `${user?.professionId || ''} ${user?.profession || ''} ${user?.headline || ''}`
    .toLowerCase()
    .trim()
  const enclaveRaw = String(user?.professionEnclave || '').toLowerCase().trim()
  if (!raw && !enclaveRaw) return 'All'

  const numMatch = (user?.professionId || '').match(/^h250_(\d+)_/)
  const folderNum = numMatch ? Number(numMatch[1]) : 0

  if (
    (folderNum >= 16 && folderNum <= 29) ||
    /plumb|drain|sewer|water_heater|pipefitter|septic|sump|irrigation_pipe|backflow/.test(raw)
  ) {
    return 'Plumbing'
  }
  if (/solar|photovoltaic|pv_install|renewable|wind_turb|water_treatment|utility|mining/.test(raw)) {
    return 'Solar & Energy'
  }
  if (
    (folderNum >= 30 && folderNum <= 43) ||
    /electri|lighting|ceiling_fan|generator|ev_charg|low_voltage|smart_home/.test(raw)
  ) {
    return 'Electrical Fundamentals'
  }
  if (
    (folderNum >= 44 && folderNum <= 56) ||
    /hvac|air_conditioning|heating|furnace|boiler|heat_pump|refrigeration|duct|thermostat|ventilation/.test(raw)
  ) {
    return 'HVAC'
  }
  if (/masonry|brick|stone_mason|tile|terrazzo|grout/.test(raw)) {
    return 'Masonry & Tile'
  }
  if (/roofer|roofing|drywall|sheetrock|shingle|stucco/.test(raw)) {
    return 'Roofing & Drywall'
  }
  if (
    (folderNum >= 71 && folderNum <= 82) ||
    /paint|wallpaper|plaster|texture|pressure_wash/.test(raw)
  ) {
    return 'Painting & Decorating'
  }
  if (
    (folderNum >= 193 && folderNum <= 204) ||
    /auto|mechanic|tire|brake|oil_change|windshield|roadside|small_engine|motorcycle/.test(raw)
  ) {
    return 'Auto Mechanics'
  }
  if (
    (folderNum >= 205 && folderNum <= 214) ||
    /weld|ironworker|metal_fab|steel|sheet_metal/.test(raw)
  ) {
    return 'Welding'
  }
  if (/cnc|machin|tool_and_die|appliance|repair_technician|lathe|milling/.test(raw)) {
    return 'Machining & Repair'
  }
  if (/tailor|seamstress|sew|apparel|fashion|textile|garment/.test(raw)) {
    return 'Tailoring & Sewing'
  }
  if (
    (folderNum >= 1 && folderNum <= 15) ||
    (folderNum >= 57 && folderNum <= 70) ||
    /carpent|handyman|cabinet|furniture|deck|fence|door|trim|stair|wood|framing/.test(raw)
  ) {
    return 'Carpentry'
  }
  if (/farm|agri|landscape|garden|forest|agronom|crop|fish|horticult/.test(raw)) {
    return 'Agriculture & Landscaping'
  }
  if (/chef|cook|culinary|hospitality|cater|baker|pastry|hotel|restaurant/.test(raw)) {
    return 'Culinary & Hospitality'
  }
  if (/barber|hair|beauty|salon|esthetic|cosmetol|wellness|fitness|massage/.test(raw)) {
    return 'Barbering & Beauty'
  }
  if (/nurse|doctor|health|medic|pharm|dental|clinical|emt|paramedic|surgeon|physician|\brn\b|\bbsn\b|\bmd\b|aprn/.test(raw)) {
    return 'Healthcare & Nursing'
  }
  if (/cyber|security|soc|pentest|penetration|red_team|infosec|ot_sec|threat|ciso|grc|incident_responder/.test(raw)) {
    return 'Cybersecurity & IT'
  }
  if (/software|developer|ai_eng|ml_eng|machine_learning|cloud|data_sci|python|devops|no-code|frontend|backend|fullstack/.test(raw)) {
    return 'Software & AI'
  }
  if (/account|finance|bookkeep|tax|insur|business|real_estate|franchise|broker|realtor|commerce/.test(raw)) {
    return 'Finance & Business'
  }
  if (/law|legal|attorney|lawyer|judge|paralegal|court|counsel/.test(raw)) {
    return 'Law & Legal'
  }
  if (/photo|video|graphic|design|media|journal|writer|music|artist/.test(raw)) {
    return 'Creative Media & Design'
  }
  if (/fiber|telecom|satellite|directv|broadband|network_tech|cabling|pro-av|av_tech/.test(raw)) {
    return 'Telecom & Fiber Optics'
  }
  if (/pilot|aviation|aerospace|aircraft|marine|maritime|boat|ship/.test(raw)) {
    return 'Aviation & Maritime'
  }
  if (/science|lab_|laboratory|biotech|chem|biologist|research_sci|metrology/.test(raw)) {
    return 'Science & Lab Tech'
  }
  if (/teach|educat|professor|instructor|coach|trainer|curriculum/.test(raw)) {
    return 'Education & Training'
  }
  if (/osha|safety|security_guard|veteran|military|police|firefighter|emergency|civic/.test(raw)) {
    return 'Safety & Civic Ops'
  }
  if (enclaveRaw) {
    const enclaveMatch = SKILLED_TRADES_COLLECTION_META.categories.find((cat) =>
      LEARN_CATEGORY_META[cat]?.enclaveIds.includes(enclaveRaw)
    )
    if (enclaveMatch) return enclaveMatch
  }
  return 'All'
}

export function SkilledTradesLearnByDoingSection({
  user,
  mode = 'full_academy',
  initialLessonId = null,
  initialCategory = null,
  onOpenInLearnTab,
  onTelemetryChange,
  onClaimCertificate
}: SkilledTradesLearnByDoingSectionProps) {
  const { currentLanguage } = useLanguage()
  // Home feed autoplay is OFF by default (Settings -> Behavior). In the Learn tab the academy keeps its own behavior.
  const [autoplayPref] = useAutoplayVideosPref()
  const isHomeVideos = mode === 'home_videos_only'
  const autoplayPrefRef = useRef(autoplayPref)
  autoplayPrefRef.current = autoplayPref
  const initialMatchedCat =
    initialCategory || (mode === 'home_videos_only' ? resolveLearnCategoryForUser(user) : 'All')
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState<LearnIndustryGroupId>(() =>
    initialMatchedCat !== 'All' &&
    initialMatchedCat !== 'Global Interpreted' &&
    initialMatchedCat !== 'Saved' &&
    initialMatchedCat !== 'Learning Journey'
      ? getIndustryGroupForCategory(initialMatchedCat as SkilledTradesCategory)
      : 'all'
  )
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(
    initialMatchedCat
  )
  const [recommendedCategory, setRecommendedCategory] = useState<SkilledTradesCategory | 'All'>(() => {
    const matched = initialCategory || resolveLearnCategoryForUser(user)
    return matched !== 'All' &&
      matched !== 'Global Interpreted' &&
      matched !== 'Saved' &&
      matched !== 'Learning Journey'
      ? (matched as SkilledTradesCategory)
      : 'All'
  })
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory)
      setSelectedIndustryGroup(getIndustryGroupForCategory(initialCategory))
    }
  }, [initialCategory])
  const [telemetryMap, setTelemetryMap] = useState<Record<string, LearnByDoingLessonTelemetry>>(() =>
    loadAllLearnByDoingTelemetry()
  )
  const [syncedLearningLessons, setSyncedLearningLessons] = useState<LearnByDoingLesson[]>([])
  const [learningSyncMeta, setLearningSyncMeta] = useState<LearningVideoSyncMeta | null>(null)
  const [isSyncingLearningVideos, setIsSyncingLearningVideos] = useState<boolean>(false)

  const allLessons = useMemo<LearnByDoingLesson[]>(() => {
    const seenIds = new Set<string>()
    const seenYt = new Set<string>()
    const seenUrls = new Set<string>()
    const merged: LearnByDoingLesson[] = []

    const normUrl = (u?: string) =>
      String(u || "").trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "")

    for (const l of SKILLED_TRADES_LEARN_BY_DOING_LESSONS) {
      seenIds.add(l.id)
      if (l.youtubeId) seenYt.add(l.youtubeId)
      if (l.companionVariant?.youtubeId) seenYt.add(l.companionVariant.youtubeId)
      if (l.sourceVideoUrl) seenUrls.add(normUrl(l.sourceVideoUrl))
      merged.push(l)
    }
    for (const sl of syncedLearningLessons) {
      if (!sl || !sl.id || seenIds.has(sl.id)) continue
      if (sl.youtubeId && sl.youtubeId.trim() && seenYt.has(sl.youtubeId.trim())) continue
      const nu = normUrl(sl.sourceVideoUrl)
      if (nu && !sl.directVideoUrl?.startsWith('/api/connectin/learning-videos/stream/') && seenUrls.has(nu)) {
        continue
      }
      seenIds.add(sl.id)
      if (sl.youtubeId && sl.youtubeId.trim()) seenYt.add(sl.youtubeId.trim())
      if (nu) seenUrls.add(nu)
      merged.push(sl)
    }
    return merged
  }, [syncedLearningLessons])

  const handleLessonPublished = (newLesson: LearnByDoingLesson) => {
    setSyncedLearningLessons((prev) => {
      const next = [newLesson, ...prev.filter((l) => l.id !== newLesson.id)]
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('connectln_synced_learning_videos_v1', JSON.stringify(next))
        } catch {}
      }
      return next
    })
    setTelemetryMap((prev) => {
      if (prev[newLesson.id]) return prev
      return {
        ...prev,
        [newLesson.id]: createInitialLessonTelemetry(newLesson.id),
      }
    })
  }

  const [activeVideoLessonId, setActiveVideoLessonId] = useState<string | null>(
    initialLessonId ||
      (mode === 'home_videos_only' ? null : SKILLED_TRADES_LEARN_BY_DOING_LESSONS[0]?.id) ||
      null
  )
  const [autoPlayRequested, setAutoPlayRequestedRaw] = useState<boolean>(true)
  // True while the active video was started automatically on scroll (it then starts muted with "Tap for Sound")
  const [autoPlayMuted, setAutoPlayMuted] = useState<boolean>(false)
  // Any explicit play request by the user (Watch / card click) plays with sound as before
  const setAutoPlayRequested = (value: boolean) => {
    setAutoPlayRequestedRaw(value)
    setAutoPlayMuted(false)
  }
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(
    initialLessonId || SKILLED_TRADES_LEARN_BY_DOING_LESSONS[0]?.id || null
  )
  const [homeVisibleLimit, setHomeVisibleLimit] = useState<number>(6)
  const [homeRotationOffset, setHomeRotationOffset] = useState<number>(0)

  // Rotate default Home trade lessons automatically every 15 minutes so the same 3 lessons don't repeat endlessly
  useEffect(() => {
    if (mode !== 'home_videos_only' || typeof window === 'undefined') return
    setHomeRotationOffset((Math.floor(Date.now() / 900000) * 3) % Math.max(1, allLessons.length))
  }, [mode, allLessons.length])

  // Continuous 24-Hour Additive Learning Video Sync (MongoDB Atlas + YouTube RSS)
  const SYNCED_VIDEOS_STORAGE_KEY = 'connectln_synced_learning_videos_v1'
  const LAST_LEARNING_24H_SYNC_KEY = 'connectln_learning_last_24h_sync_ms'
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

  const pullSyncedLearningVideos = async (forceRefresh: boolean) => {
    if (typeof window === 'undefined') return
    setIsSyncingLearningVideos(true)
    try {
      const url = forceRefresh
        ? '/api/connectin/learning-videos?force=1'
        : '/api/connectin/learning-videos'
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      const synced: LearnByDoingLesson[] = Array.isArray(data?.syncedLessons)
        ? data.syncedLessons
        : []
      if (synced.length > 0) {
        setSyncedLearningLessons(synced)
        try {
          localStorage.setItem(SYNCED_VIDEOS_STORAGE_KEY, JSON.stringify(synced))
        } catch {}
      }
      if (data?.meta) {
        setLearningSyncMeta(data.meta as LearningVideoSyncMeta)
      }
      try {
        localStorage.setItem(LAST_LEARNING_24H_SYNC_KEY, String(Date.now()))
      } catch {}
    } catch {
      // ignore transient network errors
    } finally {
      setIsSyncingLearningVideos(false)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cachedEmpty = true
    try {
      const raw = localStorage.getItem(SYNCED_VIDEOS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSyncedLearningLessons(parsed)
          cachedEmpty = false
        }
      }
    } catch {}

    const lastMs = Number(localStorage.getItem(LAST_LEARNING_24H_SYNC_KEY) || '0')
    const due24h = Date.now() - lastMs >= TWENTY_FOUR_HOURS_MS || cachedEmpty
    void pullSyncedLearningVideos(due24h)

    const onFocus = () => {
      const prevMs = Number(localStorage.getItem(LAST_LEARNING_24H_SYNC_KEY) || '0')
      if (Date.now() - prevMs >= TWENTY_FOUR_HOURS_MS) {
        void pullSyncedLearningVideos(true)
      }
    }
    window.addEventListener('focus', onFocus)
    const intervalId = window.setInterval(() => {
      void pullSyncedLearningVideos(true)
    }, TWENTY_FOUR_HOURS_MS)

    return () => {
      window.removeEventListener('focus', onFocus)
      window.clearInterval(intervalId)
    }
  }, [])

  // Ensure dynamically 24h-synced lessons have telemetry keys initialized cleanly
  useEffect(() => {
    if (syncedLearningLessons.length === 0) return
    setTelemetryMap((prev) => {
      let changed = false
      const next = { ...prev }
      for (const sl of syncedLearningLessons) {
        if (sl?.id && !next[sl.id]) {
          next[sl.id] = createInitialLessonTelemetry(sl.id)
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [syncedLearningLessons])

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory)
      setSelectedIndustryGroup(getIndustryGroupForCategory(initialCategory))
    }
  }, [initialCategory])

  useEffect(() => {
    if (initialLessonId) {
      setActiveVideoLessonId(initialLessonId)
      setExpandedLessonId(initialLessonId)
      if (typeof window !== 'undefined' && mode === 'full_academy') {
        setTimeout(() => {
          const el = document.getElementById(`lbd-lesson-card-${initialLessonId}`)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 180)
      }
    }
  }, [initialLessonId, mode])
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
  // LinkedIn Social Post Card state for Home Feed video cards
  const [likedLessonMap, setLikedLessonMap] = useState<Record<string, boolean>>({})
  const [repostedLessonMap, setRepostedLessonMap] = useState<Record<string, boolean>>({})
  const [expandedCaptionMap, setExpandedCaptionMap] = useState<Record<string, boolean>>({})
  const [dismissedLessonMap, setDismissedLessonMap] = useState<Record<string, boolean>>({})
  const [openCommentsLessonMap, setOpenCommentsLessonMap] = useState<Record<string, boolean>>({})
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({})
  const [userCommentsMap, setUserCommentsMap] = useState<
    Record<string, { id: string; author: string; text: string; time: string }[]>
  >({})
  const [sharedToastLessonId, setSharedToastLessonId] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const homeCardRefs = useRef<Record<string, HTMLElement | null>>({})

  // LinkedIn-style Auto-Play on Scroll / Focus across Home Feed & Academy Tabs
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    // Coordinate cleanly across BOTH Home Feed and Learning Academy via the central Viewport Arbiter & unmute speaker when in view!
    const cleanups: Array<() => void> = []
    const playerPrefix = mode === 'home_videos_only' ? 'lbd-home-player-' : 'lbd-player-'
    for (const lesson of allLessons) {
      if (!lesson.embedAvailable || (!lesson.youtubeId && !lesson.embedUrl && !lesson.directVideoUrl)) continue
      const slotId = `${playerPrefix}${lesson.id}`
      cleanups.push(
        registerViewportVideoSlot({
          id: slotId,
          getElement: () => homeCardRefs.current[lesson.id] || null,
          startAutoplay: () => {
            if (!autoplayPrefRef.current) return
            setAutoPlayRequestedRaw(true)
            setAutoPlayMuted(false)
            setActiveVideoLessonId(lesson.id)
          },
          stopAutoplay: () => {
            setActiveVideoLessonId((prev) => (prev === lesson.id ? null : prev))
          },
        })
      )
    }
    requestViewportAutoplayEvaluation()
    return () => {
      cleanups.forEach((fn) => fn())
    }
  }, [mode, selectedCategory, homeVisibleLimit, allLessons])

  // Unmount active Learn-by-Doing inline player whenever another video on the page claims exclusive play
  useEffect(() => {
    const playerPrefix = mode === 'home_videos_only' ? 'lbd-home-player-' : 'lbd-player-'
    const handleExclusivePlay = (e: Event) => {
      const activeId = (e as CustomEvent<{ playerId?: string }>).detail?.playerId
      if (!activeId) return
      setActiveVideoLessonId((prev) => {
        if (!prev) return null
        return activeId === `${playerPrefix}${prev}` ? prev : null
      })
    }
    window.addEventListener(CONNECTLN_VIDEO_PLAY_EVENT, handleExclusivePlay)
    return () => window.removeEventListener(CONNECTLN_VIDEO_PLAY_EVENT, handleExclusivePlay)
  }, [mode])

  // If autoplay is switched off in Settings, stop a Home video that was started automatically
  useEffect(() => {
    if (isHomeVideos && !autoplayPref && autoPlayMuted) {
      setActiveVideoLessonId(null)
    }
  }, [isHomeVideos, autoplayPref, autoPlayMuted])

  // Auto-sync the Learn a Trade or Profession video filter to the user's selected Logged-In Profession or Enclave
  useEffect(() => {
    if (initialCategory) return
    const nextCat = resolveLearnCategoryForUser(user)
    const resolvedTradeRec =
      nextCat !== 'All' &&
      nextCat !== 'Global Interpreted' &&
      nextCat !== 'Saved' &&
      nextCat !== 'Learning Journey'
        ? (nextCat as SkilledTradesCategory)
        : 'All'
    setRecommendedCategory(resolvedTradeRec)
    if (mode === 'home_videos_only') {
      setSelectedCategory(nextCat)
      setSelectedIndustryGroup(
        nextCat === 'All'
          ? 'all'
          : getIndustryGroupForCategory(nextCat as SkilledTradesCategory)
      )
    }
    setHomeRotationOffset(0)
  }, [user?.professionId, user?.profession, user?.professionEnclave, user?.headline, initialCategory, mode])

  // Load persisted telemetry and queued upcoming curriculum topics on mount
  useEffect(() => {
    const loaded = loadAllLearnByDoingTelemetry()
    setTelemetryMap(loaded)
    const drafts: Record<string, string> = {}
    for (const [id, item] of Object.entries(loaded)) {
      drafts[id] = item.practiceNotes || ''
    }
    setPracticeDrafts(drafts)
    if (typeof window !== 'undefined') {
      try {
        const queuedRaw = localStorage.getItem('connectln_queued_curriculum_topics_v1')
        if (queuedRaw) {
          const parsed = JSON.parse(queuedRaw)
          if (parsed && typeof parsed === 'object') {
            setBookmarkedProposedIds(parsed)
          }
        }
      } catch {}
    }
  }, [])

  const handleToggleBookmarkedProposed = (id: string) => {
    setBookmarkedProposedIds(prev => {
      const next = { ...prev, [id]: !prev[id] }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('connectln_queued_curriculum_topics_v1', JSON.stringify(next))
        } catch {}
      }
      return next
    })
  }

  // Mark all verified multi-source lesson videos playable immediately in a single pass
  useEffect(() => {
    const initialMap: Record<string, 'checking' | 'playable' | 'unavailable'> = {}
    for (const lesson of allLessons) {
      const hasPlayable = Boolean(
        lesson.embedAvailable && (lesson.youtubeId || lesson.embedUrl || lesson.directVideoUrl)
      )
      initialMap[lesson.id] = hasPlayable ? 'playable' : 'unavailable'
    }
    setEmbedPlayabilityMap(initialMap)
  }, [allLessons])

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

  // Action 1: Watch inside ConnectLn Studio Player
  const handleWatchAction = (lesson: LearnByDoingLesson) => {
    setExpandedLessonId(lesson.id)
    const activeVariant =
      lesson.id === 'lbd_painting_brush_roller_6' && lesson6Variant === 'companion'
        ? lesson.companionVariant
        : null
    const targetYoutubeId = activeVariant?.youtubeId || lesson.youtubeId
    const targetEmbedAvailable = activeVariant ? activeVariant.embedAvailable : lesson.embedAvailable
    const playability = embedPlayabilityMap[lesson.id] || (targetEmbedAvailable ? 'playable' : 'unavailable')
    if (targetEmbedAvailable && targetYoutubeId && playability === 'playable') {
      notifyExclusiveVideoPlay(
        mode === 'home_videos_only' ? `lbd-home-player-${lesson.id}` : `lbd-player-${lesson.id}`
      )
      setAutoPlayRequested(true)
      setActiveVideoLessonId(lesson.id)
      // Record a verified embedded video view when user launches and plays inside ConnectLn Studio Player
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

  // Filtered lessons (industry group + category + keyword search)
  const activeGroupObj =
    selectedIndustryGroup !== 'all'
      ? LEARN_INDUSTRY_GROUPS.find(g => g.id === selectedIndustryGroup)
      : undefined
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredLessons = allLessons.filter(lesson => {
    const t = telemetryMap[lesson.id] || createInitialLessonTelemetry(lesson.id)
    const categoryMatches =
      selectedCategory === 'All'
        ? activeGroupObj
          ? activeGroupObj.categories.includes(lesson.category)
          : true
        : selectedCategory === 'Global Interpreted'
          ? Boolean(lesson.sourceLanguage && lesson.sourceLanguage !== 'en')
          : selectedCategory === 'Saved'
            ? t.isSaved
            : selectedCategory === 'Learning Journey'
              ? t.inLearningJourney
              : lesson.category === selectedCategory

    if (!categoryMatches) return false
    if (!normalizedSearch || mode === 'home_videos_only') return true

    const haystack = [
      lesson.title,
      lesson.category,
      lesson.description,
      lesson.originalCreator,
      lesson.enclaveId,
      lesson.professionId,
      ...(lesson.skillsCovered || [])
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalizedSearch)
  })
  const globalInterpretedCount = allLessons.filter(
    l => Boolean(l.sourceLanguage && l.sourceLanguage !== 'en')
  ).length

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

  const totalLessonsCount = allLessons.length

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
      default: {
        const meta = LEARN_CATEGORY_META[cat]
        return <span className="text-xs leading-none">{meta?.emoji || '📚'}</span>
      }
    }
  }

  const getLessonInstructorProfile = (
    lessonId: string,
    creator: string,
    category: SkilledTradesCategory
  ): {
    instructorName: string
    role: string
    avatarUrl: string
    ringColor: string
  } => {
    switch (lessonId) {
      case 'lbd_carpentry_tools_1':
        return {
          instructorName: 'Master Tom Silva',
          role: 'Master Finish Carpenter · This Old House',
          avatarUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#D97706'
        }
      case 'lbd_carpentry_clamps_2':
        return {
          instructorName: 'Master Norm Abram',
          role: 'Master Woodworker & Joiner · This Old House',
          avatarUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#D97706'
        }
      case 'lbd_auto_hood_3':
        return {
          instructorName: 'Jean-Luc Moreau, ASE',
          role: 'Lead Automotive Instructor · CAA-Quebec',
          avatarUrl:
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#0284C7'
        }
      case 'lbd_auto_obd2_4':
        return {
          instructorName: 'Marcus Vance, ASE L1',
          role: 'Master OBD-II Diagnostician · AutoZone',
          avatarUrl:
            'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#0284C7'
        }
      case 'lbd_painting_prep_5':
        return {
          instructorName: 'Claire Beaumont',
          role: 'Master Architectural Painter · Sherwin-Williams',
          avatarUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#059669'
        }
      case 'lbd_painting_brush_roller_6':
        return {
          instructorName: 'Carlos Mendez',
          role: `Lead Finish Specialist · ${creator}`,
          avatarUrl:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#059669'
        }
      case 'lbd_plumbing_shutoff_7':
        return {
          instructorName: 'Master Devon Brooks',
          role: 'Licensed Master Plumber · Roto-Rooter',
          avatarUrl:
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#0891B2'
        }
      case 'lbd_plumbing_fittings_8':
        return {
          instructorName: 'Amara Osei, Master Plumber',
          role: 'Piping & Fittings Educator · The Home Depot',
          avatarUrl:
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#0891B2'
        }
      case 'lbd_electrical_multimeter_9':
        return {
          instructorName: 'Becky Stern',
          role: 'Lead Electronics & Multimeter Educator · DigiKey',
          avatarUrl:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#CA8A04'
        }
      case 'lbd_welding_compare_10':
        return {
          instructorName: 'Tim Miller, CWI',
          role: 'Certified Welding Educator · Miller Welders',
          avatarUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#EA580C'
        }
      case 'lbd_welding_mig_11':
        return {
          instructorName: 'Kwame Mensah, AWS CWI',
          role: 'Master MIG & Fabrication Instructor · TimWelds',
          avatarUrl:
            'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#EA580C'
        }
      case 'lbd_hvac_airflow_12':
        return {
          instructorName: 'Sarah Jenkins, NATE',
          role: 'Senior Airflow & Filtration Engineer · Trane',
          avatarUrl:
            'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#4F46E5'
        }
      case 'lbd_intl_es_carpentry_speedsquare_14':
        return {
          instructorName: 'Maestro Erick Morales',
          role: `Master Carpenter & Technical Educator · Taller de Ideas (🇪🇸 Español → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#B45309'
        }
      case 'lbd_intl_fr_carpentry_joinery_15':
        return {
          instructorName: 'Laurent Moreau, Compagnon',
          role: `Maître Ébéniste · Astuces Design France (🇫🇷 Français → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#B45309'
        }
      case 'lbd_intl_ja_carpentry_joinery_16':
        return {
          instructorName: 'Kenji Takahashi (高橋 健司)',
          role: `Master Miyadaiku Timberwright · 建築現場の教科書 (🇯🇵 日本語 → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#B45309'
        }
      case 'lbd_intl_pt_carpentry_marcenaria_17':
        return {
          instructorName: 'Leandro & Luciano · Empoeirados',
          role: `SENAI Woodworking & Marcenaria Educators (🇧🇷 Português → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#B45309'
        }
      case 'lbd_intl_sw_carpentry_veta_18':
        return {
          instructorName: 'Mwalimu Juma Bakari',
          role: `Senior Vocational Carpentry Instructor · VETA Tanzania (🇹🇿 Kiswahili → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#B45309'
        }
      case 'lbd_intl_fr_plumbing_copper_19':
        return {
          instructorName: 'Karim Mallekh',
          role: `Formateur Génie Climatique & Plomberie · AFPA (🇫🇷 Français → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#0284C7'
        }
      case 'lbd_intl_es_electrical_20':
        return {
          instructorName: 'Ing. Carlos Mendoza',
          role: `Residential & Industrial Electrical Instructor · Universo Eléctrico (🇪🇸 Español → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#D97706'
        }
      case 'lbd_intl_ar_electrical_schematics_21':
        return {
          instructorName: 'Eng. Haytham Saeid (م. هيثم سعيد)',
          role: `Principal Electrical Distribution Instructor (🇪🇬 العربية → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#D97706'
        }
      case 'lbd_intl_it_painting_22':
        return {
          instructorName: 'Marco Rossi · Leroy Merlin Italia',
          role: `Maestro Decoratore & Finishing Specialist (🇮🇹 Italiano → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#059669'
        }
      case 'lbd_intl_es_hvac_23':
        return {
          instructorName: 'Ing. Roberto Salazar · Electrotec',
          role: `HVACR & Thermal Systems Professor (🇵🇪 Español → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#4F46E5'
        }
      case 'lbd_intl_hi_automech_24':
        return {
          instructorName: 'Er. Rajesh Sharma, ITI',
          role: `Senior Automotive Powertrain Educator (🇮🇳 हिन्दी → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#0284C7'
        }
      case 'lbd_intl_vi_carpentry_25':
        return {
          instructorName: 'Nghệ Nhân Minh Tuấn · Vui Làm Mộc',
          role: `Master Vietnamese Joinery Craftsman (🇻🇳 Tiếng Việt → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#B45309'
        }
      case 'lbd_intl_vi_electrical_26':
        return {
          instructorName: 'Kỹ Sư Hoàng Nam · Điện Công Nghiệp',
          role: `Senior Industrial Electrical Instructor (🇻🇳 Tiếng Việt → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#D97706'
        }
      case 'lbd_intl_pl_electrical_27':
        return {
          instructorName: 'Inż. Marek Kowalski, SEP',
          role: `Master Electrical & Distribution Educator (🇵🇱 Polski → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#D97706'
        }
      case 'lbd_intl_zh_carpentry_28':
        return {
          instructorName: 'Master Chen Wei (陈伟 大师)',
          role: `Traditional Sunmao Joinery Master · 传统木工技艺 (🇨🇳 简体中文 → ${currentLanguage.flag} ${currentLanguage.localName})`,
          avatarUrl:
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#B45309'
        }
      case 'lbd_hvac_refrigeration_13':
        return {
          instructorName: 'Bryan Orr',
          role: `Founder & Master HVACR Educator · ${category}`,
          avatarUrl:
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          ringColor: '#4F46E5'
        }
      default: {
        const fallbackAvatars = [
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces&auto=format&q=85',
        ]
        const hash = lessonId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
        return {
          instructorName: creator,
          role: `${category} Instructor · ${creator}`,
          avatarUrl: fallbackAvatars[hash % fallbackAvatars.length],
          ringColor: LEARN_CATEGORY_META[category]?.ringColor || '#0A66C2'
        }
      }
    }
  }

  if (mode === 'home_videos_only') {
    const activeLesson =
      allLessons.find(l => l.id === activeVideoLessonId) ||
      filteredLessons[0] ||
      allLessons[0]

    const baseVisibleHomeLessons = filteredLessons.filter(l => !dismissedLessonMap[l.id])
    const effectiveOffset =
      baseVisibleHomeLessons.length > 0 ? homeRotationOffset % baseVisibleHomeLessons.length : 0
    const visibleHomeLessons =
      effectiveOffset > 0
        ? [
            ...baseVisibleHomeLessons.slice(effectiveOffset),
            ...baseVisibleHomeLessons.slice(0, effectiveOffset)
          ]
        : baseVisibleHomeLessons

    return (
      <section
        id="skilled-trades-learn-by-doing"
        className="space-y-3"
      >
        {/* Clean, Unobtrusive LinkedIn Feed Category Filter Strip */}
        <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(() => {
              const otherCats = SKILLED_TRADES_COLLECTION_META.categories.filter(
                (cat) => cat !== recommendedCategory
              )
              const orderedCats =
                recommendedCategory !== 'All'
                  ? [recommendedCategory, ...otherCats]
                  : SKILLED_TRADES_COLLECTION_META.categories
              const tabs: { id: CategoryFilter; label: string }[] = [
                ...(recommendedCategory !== 'All'
                  ? [
                      {
                        id: recommendedCategory as CategoryFilter,
                        label: `${LEARN_CATEGORY_META[recommendedCategory]?.emoji || '🎯'} ${
                          LEARN_CATEGORY_META[recommendedCategory]?.shortLabel || recommendedCategory
                        } · For You`,
                      },
                    ]
                  : []),
                { id: 'All', label: `All Videos (${totalLessonsCount})` },
                {
                  id: 'Global Interpreted',
                  label: `🌍 Global → ${currentLanguage.flag} ${currentLanguage.localName} (${globalInterpretedCount})`,
                },
                ...orderedCats
                  .filter((c) => c !== recommendedCategory)
                  .map((cat) => {
                    const meta = LEARN_CATEGORY_META[cat]
                    return {
                      id: cat as CategoryFilter,
                      label: `${meta?.emoji || '📚'} ${meta?.shortLabel || cat}`,
                    }
                  }),
              ]
              return tabs
            })().map(tab => {
              const isSelected = selectedCategory === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(tab.id)
                    setHomeVisibleLimit(3)
                    if (!autoplayPrefRef.current) {
                      setActiveVideoLessonId(null)
                      return
                    }
                    const firstMatch =
                      tab.id === 'All'
                        ? allLessons[0]
                        : tab.id === 'Global Interpreted'
                          ? allLessons.find(
                              l => Boolean(l.sourceLanguage && l.sourceLanguage !== 'en')
                            )
                          : allLessons.find(l => l.category === tab.id)
                    if (firstMatch) {
                      notifyExclusiveVideoPlay(`lbd-home-player-${firstMatch.id}`)
                      setActiveVideoLessonId(firstMatch.id)
                      setAutoPlayRequestedRaw(true)
                      setAutoPlayMuted(true)
                    }
                  }}
                  style={
                    isSelected
                      ? { backgroundColor: '#7C4323', color: '#FFFFFF' }
                      : undefined
                  }
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'shadow-2xs'
                      : 'bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 pl-1">
            <button
              type="button"
              onClick={() => {
                setHomeRotationOffset(prev => prev + 3)
                requestViewportAutoplayEvaluation()
              }}
              className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
              title="Rotate in the next set of trade video lessons"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Next Set</span>
            </button>
            {onOpenInLearnTab && (
              <button
                type="button"
                onClick={() => onOpenInLearnTab(activeLesson?.id, activeLesson?.category)}
                className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Notes &amp; Quizzes</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>

        {/* Vertical Stack of Native LinkedIn Feed Video Post Cards (Windowed on Home to prevent DOM bloat) */}
        <div className="space-y-3">
          {visibleHomeLessons.slice(0, homeVisibleLimit).map(lesson => {
            const isLesson6 =
              lesson.id === 'lbd_painting_brush_roller_6' && Boolean(lesson.companionVariant)
            const activeVariant =
              isLesson6 && lesson6Variant === 'companion' && lesson.companionVariant
                ? lesson.companionVariant
                : null
            const cardYoutubeId = activeVariant?.youtubeId || lesson.youtubeId
            const cardTitle = activeVariant ? activeVariant.title : lesson.title
            const cardCreator = activeVariant ? activeVariant.originalCreator : lesson.originalCreator
            const cardVideoLabel = activeVariant ? activeVariant.videoLabel : lesson.videoLabel
            const cardThumbUrl = cardYoutubeId
              ? `https://i.ytimg.com/vi/${cardYoutubeId}/hqdefault.jpg`
              : lesson.thumbnailUrl
            const serialPlate = `CLN-LBD${String(lesson.lessonNumber).padStart(2, '0')}`
            const isActiveCard = activeVideoLessonId === lesson.id

            const instructorProfile = getLessonInstructorProfile(
              lesson.id,
              cardCreator,
              lesson.category
            )
            const isCaptionExpanded = Boolean(expandedCaptionMap[lesson.id])
            const isLiked = Boolean(likedLessonMap[lesson.id])
            const isReposted = Boolean(repostedLessonMap[lesson.id])
            const isSaved = Boolean(telemetryMap[lesson.id]?.isSaved)
            const userComments = userCommentsMap[lesson.id] || []
            const isCommentsOpen = Boolean(openCommentsLessonMap[lesson.id])

            // Deterministic LinkedIn-style counts matching the screenshots (14, 110, 6, etc.)
            const baseLikes = 14 + ((lesson.lessonNumber * 19) % 96)
            const likesCount = baseLikes + (isLiked ? 1 : 0)
            const baseComments = 1 + ((lesson.lessonNumber * 7) % 24)
            const commentsCount = baseComments + userComments.length
            const baseReposts = 1 + ((lesson.lessonNumber * 5) % 18)
            const repostsCount = baseReposts + (isReposted ? 1 : 0)
            const submitsCount = 28 + lesson.lessonNumber * 7

            return (
              <article
                key={lesson.id}
                ref={el => {
                  if (el) {
                    homeCardRefs.current[lesson.id] = el
                  } else {
                    delete homeCardRefs.current[lesson.id]
                  }
                }}
                data-lbd-lesson-id={lesson.id}
                className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs transition-all"
              >
                {/* 1. CLEAN WSJ / LINKEDIN EDITORIAL AUTHOR HEADER */}
                <div className="px-4 pt-3.5 pb-1.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <img
                      src={instructorProfile.avatarUrl}
                      alt={instructorProfile.instructorName}
                      className="h-11 w-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 bg-zinc-100 dark:bg-zinc-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <h3 className="text-[14.5px] font-semibold text-[#191919] dark:text-zinc-100 truncate leading-[1.3]">
                          {cardCreator}
                        </h3>
                        <ShieldCheck className="h-3.5 w-3.5 text-[#666666] dark:text-zinc-300 shrink-0" />
                      </div>
                      <p className="text-[12px] text-[#666666] dark:text-zinc-400 truncate leading-[1.3]">
                        {instructorProfile.instructorName} · {lesson.category}
                      </p>
                      <p className="text-[12px] text-[#666666] dark:text-zinc-400 flex items-center gap-1 mt-0.5 leading-[1.3]">
                        <span>{lesson.lessonNumber}h</span>
                        <span>•</span>
                        <Globe className="h-3 w-3 inline text-[#666666] dark:text-zinc-400" />
                      </p>
                    </div>
                  </div>

                  {/* Right Header Icons: ••• (Save / Open Notes) + ✕ (Dismiss) */}
                  <div className="flex items-center gap-0.5 text-[#666666] dark:text-zinc-400 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenInLearnTab) {
                          onOpenInLearnTab(lesson.id, lesson.category)
                        } else {
                          handleToggleSave(lesson.id)
                        }
                      }}
                      title={onOpenInLearnTab ? 'Open Lesson Notes & Practice' : isSaved ? 'Saved to Learning Journey' : 'Save video lesson'}
                      className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDismissedLessonMap(prev => ({ ...prev, [lesson.id]: true }))
                      }
                      title="Hide post from feed"
                      className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 2. CLEAN EDITORIAL CAPTION ABOVE VIDEO (3 Lines + ... more — Zero Bracket Clutter) */}
                <div className="px-4 pb-2.5 text-[14px] text-[#191919] dark:text-zinc-100 leading-[1.42857]">
                  {!isCaptionExpanded ? (
                    <p>
                      {lesson.description.length > 195
                        ? `${lesson.description.slice(0, 195).trimEnd()}...`
                        : lesson.description}{' '}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCaptionMap(prev => ({ ...prev, [lesson.id]: true }))
                        }
                        className="text-[#666666] hover:text-[#0A66C2] hover:underline dark:text-zinc-400 font-normal cursor-pointer"
                      >
                        more
                      </button>
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p>{lesson.description}</p>
                      <div className="pl-3 border-l-2 border-zinc-300 dark:border-zinc-700 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                        {lesson.skillsCovered.map((sk, idx) => (
                          <p key={idx}>• {sk}</p>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCaptionMap(prev => ({ ...prev, [lesson.id]: false }))
                          }
                          className="text-xs text-[#666666] hover:underline cursor-pointer"
                        >
                          Show less
                        </button>
                        {onOpenInLearnTab && (
                          <button
                            type="button"
                            onClick={() => onOpenInLearnTab(lesson.id, lesson.category)}
                            className="text-xs font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            Open Lesson Notes &amp; Practice →
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Optional Lesson 6 Switcher (Sherwin-Williams vs FrogTape) */}
                  {isLesson6 && lesson.companionVariant && isCaptionExpanded && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-zinc-500">Topic:</span>
                      <button
                        type="button"
                        onClick={() => setLesson6Variant('primary')}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer ${
                          lesson6Variant === 'primary'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        Brush &amp; Roller (Sherwin-Williams)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLesson6Variant('companion')}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer ${
                          lesson6Variant === 'companion'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        Clean Paint Edges (FrogTape)
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. FULL-BLEED UNCLOUDED VIDEO STAGE (Multi-Source & YouTube Policy Compliant) */}
                <div className="relative w-full bg-black border-y border-zinc-100 dark:border-zinc-800">
                  {isActiveCard && (cardYoutubeId || lesson.embedUrl || lesson.directVideoUrl) ? (
                    <ConnectLnStudioPlayer
                      key={`home-card-${lesson.id}-${cardYoutubeId || lesson.sourceProvider || 'native'}-${lesson6Variant}`}
                      youtubeId={cardYoutubeId}
                      sourceProvider={lesson.sourceProvider}
                      embedUrl={lesson.embedUrl}
                      directVideoUrl={lesson.directVideoUrl}
                      sourceVideoUrl={lesson.sourceVideoUrl}
                      licenseLabel={lesson.licenseLabel}
                      posterImageUrl={lesson.thumbnailUrl}
                      title={cardTitle}
                      serialPlate={serialPlate}
                      speaker={instructorProfile.instructorName}
                      speakerRole={cardCreator}
                      speakerAvatarUrl={instructorProfile.avatarUrl}
                      description={lesson.description}
                      takeaways={lesson.skillsCovered}
                      sourceLanguage={lesson.sourceLanguage}
                      sourceLanguageLabel={lesson.sourceLanguageLabel}
                      durationLabel=""
                      autoPlay={autoPlayRequested}
                      initialMuted={false}
                      playerId={`lbd-home-player-${lesson.id}`}
                      onExclusiveStop={() => setActiveVideoLessonId(null)}
                      className="w-full"
                    />
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        notifyManualVideoOverride(`lbd-home-player-${lesson.id}`, homeCardRefs.current[lesson.id])
                        notifyExclusiveVideoPlay(`lbd-home-player-${lesson.id}`)
                        setAutoPlayRequested(true)
                        setActiveVideoLessonId(lesson.id)
                        handleWatchAction(lesson)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          notifyExclusiveVideoPlay(`lbd-home-player-${lesson.id}`)
                          setAutoPlayRequested(true)
                          setActiveVideoLessonId(lesson.id)
                          handleWatchAction(lesson)
                        }
                      }}
                      className="relative w-full max-w-[860px] mx-auto aspect-[860/496] overflow-hidden cursor-pointer group bg-zinc-950"
                    >
                      <img
                        src={cardThumbUrl}
                        alt={cardTitle}
                        className="h-full w-full object-cover group-hover:scale-[1.015] transition-transform duration-500"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                      {/* Subtle Center Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          style={{ color: '#FFFFFF' }}
                          className="h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-black/60 border border-white/30 flex items-center justify-center shadow-xl backdrop-blur-xs group-hover:scale-105 transition-transform"
                        >
                          <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* WSJ Editorial Lower-Third Serif Headline & Monogram */}
                      <div className="absolute inset-x-0 bottom-0 px-4 sm:px-5 pb-4 pt-8 flex items-end justify-between gap-4 pointer-events-none">
                        <h4
                          style={{
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: '#FFFFFF',
                          }}
                          className="text-lg sm:text-2xl font-bold leading-[1.15] tracking-tight line-clamp-2 max-w-[84%] drop-shadow-md text-left"
                        >
                          {cardTitle}
                        </h4>
                        <span
                          style={{
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: 'rgba(255,255,255,0.92)',
                          }}
                          className="text-sm sm:text-base font-bold tracking-tight shrink-0 select-none"
                        >
                          CLN
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. CLEAN SINGLE-ROW LINKEDIN SOCIAL REACTIONS & ENGAGEMENT BAR */}
                <div className="px-4 py-2.5 border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-5 text-zinc-600 dark:text-zinc-400">
                    {/* Like */}
                    <button
                      type="button"
                      onClick={() =>
                        setLikedLessonMap(prev => ({ ...prev, [lesson.id]: !prev[lesson.id] }))
                      }
                      className={`inline-flex items-center gap-1.5 text-xs font-medium hover:text-[#0A66C2] transition-colors cursor-pointer ${
                        isLiked ? 'text-[#0A66C2] dark:text-sky-400 font-bold' : ''
                      }`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likesCount}</span>
                    </button>

                    {/* Comment */}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenCommentsLessonMap(prev => ({
                          ...prev,
                          [lesson.id]: !prev[lesson.id]
                        }))
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-medium hover:text-[#0A66C2] transition-colors cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{commentsCount}</span>
                    </button>

                    {/* Repost */}
                    <button
                      type="button"
                      onClick={() =>
                        setRepostedLessonMap(prev => ({
                          ...prev,
                          [lesson.id]: !prev[lesson.id]
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 text-xs font-medium hover:text-emerald-600 transition-colors cursor-pointer ${
                        isReposted ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                      }`}
                    >
                      <Repeat2 className="h-4 w-4" />
                      <span>{repostsCount}</span>
                    </button>

                    {/* Send / Share */}
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(window.location.href).catch(() => {})
                        }
                        setSharedToastLessonId(lesson.id)
                        setTimeout(() => {
                          setSharedToastLessonId(prev => (prev === lesson.id ? null : prev))
                        }, 2000)
                      }}
                      title="Share video post"
                      className="inline-flex items-center gap-1 text-xs font-medium hover:text-[#0A66C2] transition-colors cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      {sharedToastLessonId === lesson.id && (
                        <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                      )}
                    </button>
                  </div>

                  {/* Right-Side Overlapping Reaction Badges (👍❤️💡 Matches Screenshots 1, 2 & 3) */}
                  <div className="flex items-center -space-x-1">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0A66C2] text-[10px] text-white ring-2 ring-white dark:ring-zinc-900">
                      👍
                    </span>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white ring-2 ring-white dark:ring-zinc-900">
                      ❤️
                    </span>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white ring-2 ring-white dark:ring-zinc-900">
                      💡
                    </span>
                  </div>
                </div>

                {/* Optional Inline Comment Box when Comment icon is clicked */}
                {isCommentsOpen && (
                  <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInputMap[lesson.id] || ''}
                        onChange={e =>
                          setCommentInputMap(prev => ({
                            ...prev,
                            [lesson.id]: e.target.value
                          }))
                        }
                        placeholder="Add a comment or field takeaway..."
                        className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0A66C2]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const text = (commentInputMap[lesson.id] || '').trim()
                          if (!text) return
                          setUserCommentsMap(prev => ({
                            ...prev,
                            [lesson.id]: [
                              ...(prev[lesson.id] || []),
                              {
                                id: `c_${Date.now()}`,
                                author: user?.name || 'Verified Member',
                                text,
                                time: 'Just now'
                              }
                            ]
                          }))
                          setCommentInputMap(prev => ({ ...prev, [lesson.id]: '' }))
                        }}
                        style={{ backgroundColor: '#0A66C2', color: '#FFFFFF' }}
                        className="rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer"
                      >
                        Post
                      </button>
                    </div>
                    {userComments.map(c => (
                      <div
                        key={c.id}
                        className="rounded-lg bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200/70 dark:border-zinc-800 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {c.author}
                          </span>
                          <span className="text-[10px] text-zinc-400">{c.time}</span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 mt-0.5">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
          {visibleHomeLessons.length > homeVisibleLimit && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setHomeVisibleLimit((prev) => prev + 6)}
                className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-2xs transition-colors cursor-pointer"
              >
                Show more {selectedCategory !== 'All' ? selectedCategory : 'profession'} video lessons ({visibleHomeLessons.length - homeVisibleLimit} remaining)
              </button>
              {onOpenInLearnTab && (
                <button
                  type="button"
                  onClick={() => onOpenInLearnTab(activeLesson?.id, activeLesson?.category)}
                  className="rounded-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 px-3.5 py-2 text-xs font-bold text-[#0A66C2] dark:text-sky-300 transition-colors cursor-pointer"
                >
                  Open All in Learn Tab →
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <LinkedInLearningShelfHub
      user={user}
      lessons={allLessons}
      telemetryMap={telemetryMap}
      currentLanguage={currentLanguage}
      syncMeta={learningSyncMeta}
      isSyncingVideos={isSyncingLearningVideos}
      onSyncVideosNow={() => void pullSyncedLearningVideos(true)}
      onLessonPublished={handleLessonPublished}
      recommendedCategory={recommendedCategory}
      selectedIndustryGroup={selectedIndustryGroup}
      setSelectedIndustryGroup={setSelectedIndustryGroup}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      initialLessonId={initialLessonId}
      lesson6Variant={lesson6Variant}
      setLesson6Variant={setLesson6Variant}
      outboundNoticeByLesson={outboundNoticeByLesson}
      onDismissOutboundNotice={(lessonId) =>
        setOutboundNoticeByLesson((prev) => {
          const next = { ...prev }
          delete next[lessonId]
          return next
        })
      }
      practiceDrafts={practiceDrafts}
      setPracticeDrafts={setPracticeDrafts}
      practiceSavedBanner={practiceSavedBanner}
      businessAnswers={businessAnswers}
      setBusinessAnswers={setBusinessAnswers}
      bookmarkedProposedIds={bookmarkedProposedIds}
      onToggleBookmarkedProposed={handleToggleBookmarkedProposed}
      onWatchLesson={handleWatchAction}
      onOutboundVideoClick={handleOutboundVideoClick}
      onToggleSave={handleToggleSave}
      onToggleLearningJourney={handleToggleLearningJourney}
      onSavePractice={handleSavePracticeActivity}
      onPracticePhotoUpload={handlePracticePhotoUpload}
      onSelectKnowledgeAnswer={handleSelectKnowledgeAnswer}
      onMarkVideoReviewed={handleConfirmExternalVideoReviewed}
      onClaimCertificate={onClaimCertificate}
      resolveInstructorProfile={getLessonInstructorProfile}
    />
  )
}
