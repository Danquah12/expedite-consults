"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Award,
  BookOpen,
  Briefcase,
  Calculator,
  Camera,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  MessageSquare,
  PhoneCall,
  Printer,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react"
import {
  LEARN_CATEGORY_META,
  LearnByDoingKnowledgeCheck,
  LearnByDoingLesson,
  LearnByDoingLessonTelemetry,
  SKILLED_TRADES_COLLECTION_META,
  SkilledTradesCategory,
} from "@/lib/skilled-trades-learn-by-doing-data"
import {
  getCrossPlatformStudyLinks,
  getProfessionTruthBlueprint,
} from "@/lib/connectln-source-of-truth"
import { UserProfile } from "@/lib/connectln-data"
import { GLOBAL_JOBS_CATALOG, GlobalJobItem } from "@/lib/global-jobs-data"
import {
  BaselineRegionalTip,
  TradeCalculatorMode,
  buildLessonChecklist,
  buildPrintableFieldSheetHtml,
  formatSecondsLabel,
  getBaselineRegionalTips,
  getDefaultCalculatorForCategory,
  getJobsiteScenarioForLesson,
} from "@/lib/connectln-learning-tools"
import type {
  CredentialTier,
  LessonWorkspaceClientPayload,
  RegionalTipCode,
} from "@/lib/connectln-learning-workspace-db"

export interface ClassroomResolvedLessonView {
  isLesson6: boolean
  videoLabel: string
  title: string
  creator: string
  creatorDomain: string
  description: string
  skills: string[]
  sourceUrl: string
  refUrl: string
  practice: string
  deliverablePrompt: string
  knowledgeCheck: LearnByDoingKnowledgeCheck
  duration: string
  youtubeId?: string
  embedAvailable: boolean
  thumbnailUrl: string
}

export interface ClassroomValueWorkspaceProps {
  lesson: LearnByDoingLesson
  view: ClassroomResolvedLessonView
  telemetry: LearnByDoingLessonTelemetry
  user?: UserProfile | null
  currentLanguage: { flag: string; localName: string; code?: string }
  currentPlaybackSeconds: number
  onSeekToSeconds: (seconds: number) => void
  practiceDraft: string
  onChangePracticeDraft: (val: string) => void
  practiceSavedBanner: boolean
  onPracticePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSavePractice: () => void
  onSelectKnowledgeAnswer: (optionIdx: number, correctIdx: number) => void
  onClaimCertificate?: (certTitle: string) => void
  allLessons: LearnByDoingLesson[]
  telemetryMap: Record<string, LearnByDoingLessonTelemetry>
  upNextLessons: LearnByDoingLesson[]
  onOpenLesson: (lesson: LearnByDoingLesson) => void
  getUpNextPreview: (lesson: LearnByDoingLesson) => {
    title: string
    duration: string
    thumbnailUrl: string
  }
}

type ClassroomMainTab = "overview" | "practice" | "quiz" | "coach" | "jobs"
type CoachSubTab = "ai" | "notes" | "community"
type CoachMessage = { role: "user" | "assistant"; content: string; source?: string }

function formatDur(raw?: string): string {
  const clean = String(raw || "").trim()
  if (!clean) return "Hands-On"
  const parts = clean.split(":")
  if (parts.length === 2) {
    const m = Number(parts[0])
    const s = Number(parts[1])
    if (Number.isFinite(m) && Number.isFinite(s)) {
      return `${m}m ${String(s).padStart(2, "0")}s`
    }
  }
  return clean
}

function normalizeUserKeyLocal(raw?: string | null): string {
  const clean = String(raw || "guest")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 96)
  return clean || "member"
}

async function compressDataUrlForCloud(dataUrl?: string): Promise<string | undefined> {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) return undefined
  if (dataUrl.length <= 210_000) return dataUrl
  if (typeof window === "undefined") return undefined

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const maxSide = 720
        const scale = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1))
        const w = Math.max(1, Math.round((img.width || 640) * scale))
        const h = Math.max(1, Math.round((img.height || 480) * scale))
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(undefined)
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        const out = canvas.toDataURL("image/jpeg", 0.72)
        resolve(out.length <= 235_000 ? out : undefined)
      } catch {
        resolve(undefined)
      }
    }
    img.onerror = () => resolve(undefined)
    img.src = dataUrl
  })
}

function TradeCalculatorPanel({
  category,
}: {
  category: SkilledTradesCategory
}) {
  const [mode, setMode] = useState<TradeCalculatorMode>(() =>
    getDefaultCalculatorForCategory(category)
  )
  // Electrical
  const [volts, setVolts] = useState("120")
  const [watts, setWatts] = useState("1800")
  // Area / Materials
  const [lengthFt, setLengthFt] = useState("14")
  const [widthFt, setWidthFt] = useState("12")
  const [wastePct, setWastePct] = useState("10")
  // Slope / Units
  const [runFt, setRunFt] = useState("12")
  const [slopeInPerFt, setSlopeInPerFt] = useState("0.25")
  const [unitInput, setUnitInput] = useState("45")
  // Quote / Business
  const [matCost, setMatCost] = useState("240")
  const [laborHrs, setLaborHrs] = useState("4")
  const [hourlyRate, setHourlyRate] = useState("85")
  const [markupPct, setMarkupPct] = useState("25")

  useEffect(() => {
    setMode(getDefaultCalculatorForCategory(category))
  }, [category])

  const vNum = Math.max(1, Number(volts) || 120)
  const wNum = Math.max(0, Number(watts) || 0)
  const amps = wNum / vNum
  const ohms = amps > 0 ? vNum / amps : 0
  const wireRec =
    amps <= 12
      ? "14 AWG Cu · 15A breaker (80% cont = 12A)"
      : amps <= 16
        ? "12 AWG Cu · 20A breaker (80% cont = 16A)"
        : amps <= 24
          ? "10 AWG Cu · 30A breaker (80% cont = 24A)"
          : amps <= 40
            ? "8 AWG Cu · 50A breaker"
            : "6 AWG+ Cu · Verify NEC Table 310.16"

  const lNum = Math.max(0, Number(lengthFt) || 0)
  const wiNum = Math.max(0, Number(widthFt) || 0)
  const wstNum = Math.max(0, Number(wastePct) || 0)
  const netSqFt = lNum * wiNum
  const grossSqFt = netSqFt * (1 + wstNum / 100)
  const grossSqM = grossSqFt * 0.092903
  const paintGal = Math.max(1, Math.ceil(grossSqFt / 350))
  const tileBoxes = Math.max(1, Math.ceil(grossSqFt / 15))
  const mortarBags = Math.max(1, Math.ceil(grossSqFt / 50))

  const rNum = Math.max(0, Number(runFt) || 0)
  const sNum = Math.max(0, Number(slopeInPerFt) || 0)
  const totalDropIn = rNum * sNum
  const totalDropMm = totalDropIn * 25.4
  const uVal = Number(unitInput) || 0

  const mCost = Math.max(0, Number(matCost) || 0)
  const lCost = Math.max(0, Number(laborHrs) || 0) * Math.max(0, Number(hourlyRate) || 0)
  const baseCost = mCost + lCost
  const mkFactor = Math.max(0, Number(markupPct) || 0) / 100
  const quoteTotal = baseCost * (1 + mkFactor)
  const profit = quoteTotal - baseCost
  const grossMarginPct = quoteTotal > 0 ? (profit / quoteTotal) * 100 : 0

  return (
    <div className="space-y-2.5 pt-2">
      <div className="flex flex-wrap gap-1">
        {(
          [
            { id: "electrical", label: "Ohm / Wire" },
            { id: "area_material", label: "Area / Material" },
            { id: "slope_units", label: "Slope / Units" },
            { id: "quote_margin", label: "Quote / Margin" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border cursor-pointer transition-colors ${
              mode === m.id
                ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "electrical" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10.5px] font-semibold text-zinc-600 dark:text-zinc-300">
              Voltage (V)
              <input
                type="number"
                value={volts}
                onChange={(e) => setVolts(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="text-[10.5px] font-semibold text-zinc-600 dark:text-zinc-300">
              Load Power (W)
              <input
                type="number"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>
          <div className="rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2 text-[11px] space-y-0.5 text-amber-950 dark:text-amber-100">
            <p className="font-bold">
              Current: {amps.toFixed(1)} A · Resistance: {ohms.toFixed(1)} Ω
            </p>
            <p className="text-[10.5px] opacity-90">{wireRec}</p>
          </div>
        </div>
      )}

      {mode === "area_material" && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <label className="text-[10.5px] font-semibold text-zinc-600 dark:text-zinc-300">
              Length (ft)
              <input
                type="number"
                value={lengthFt}
                onChange={(e) => setLengthFt(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="text-[10.5px] font-semibold text-zinc-600 dark:text-zinc-300">
              Width (ft)
              <input
                type="number"
                value={widthFt}
                onChange={(e) => setWidthFt(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="text-[10.5px] font-semibold text-zinc-600 dark:text-zinc-300">
              Waste %
              <input
                type="number"
                value={wastePct}
                onChange={(e) => setWastePct(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>
          <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2 text-[11px] space-y-0.5 text-emerald-950 dark:text-emerald-100">
            <p className="font-bold">
              Net: {netSqFt.toFixed(0)} sq ft · With Waste: {grossSqFt.toFixed(1)} sq ft ({grossSqM.toFixed(1)} m²)
            </p>
            <p className="text-[10.5px] opacity-90">
              Est. ~{paintGal} gal paint (1 coat) · ~{tileBoxes} tile/flooring boxes · ~{mortarBags} mortar/thinset bags
            </p>
          </div>
        </div>
      )}

      {mode === "slope_units" && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <label className="text-[10.5px] font-semibold text-zinc-600 dark:text-zinc-300">
              Run (ft)
              <input
                type="number"
                value={runFt}
                onChange={(e) => setRunFt(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="text-[10.5px] font-semibold text-zinc-600 dark:text-zinc-300">
              Slope (in/ft)
              <select
                value={slopeInPerFt}
                onChange={(e) => setSlopeInPerFt(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="0.125">1/8 in/ft</option>
                <option value="0.25">1/4 in/ft (Std)</option>
                <option value="0.5">1/2 in/ft</option>
              </select>
            </label>
            <label className="text-[10.5px] font-semibold text-zinc-600 dark:text-zinc-300">
              Convert Val
              <input
                type="number"
                value={unitInput}
                onChange={(e) => setUnitInput(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>
          <div className="rounded-lg bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 p-2 text-[11px] space-y-0.5 text-sky-950 dark:text-sky-100">
            <p className="font-bold">
              Total Pipe Fall: {totalDropIn.toFixed(2)} in ({totalDropMm.toFixed(0)} mm)
            </p>
            <p className="text-[10.5px] opacity-90">
              {uVal} ft-lb = {(uVal * 1.3558).toFixed(1)} N·m · {uVal} PSI = {(uVal * 0.06895).toFixed(2)} bar · {uVal}°F = {(((uVal - 32) * 5) / 9).toFixed(1)}°C
            </p>
          </div>
        </div>
      )}

      {mode === "quote_margin" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <label className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              Materials ($)
              <input
                type="number"
                value={matCost}
                onChange={(e) => setMatCost(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              Hours
              <input
                type="number"
                value={laborHrs}
                onChange={(e) => setLaborHrs(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              Rate ($/hr)
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              Markup %
              <input
                type="number"
                value={markupPct}
                onChange={(e) => setMarkupPct(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>
          <div className="rounded-lg bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 p-2 text-[11px] space-y-0.5 text-teal-950 dark:text-teal-100">
            <p className="font-bold">
              Client Quote: ${quoteTotal.toFixed(2)} · Net Profit: ${profit.toFixed(2)} ({grossMarginPct.toFixed(1)}% margin)
            </p>
            <p className="text-[10.5px] opacity-90">
              Direct Cost: ${baseCost.toFixed(2)} (Mat ${mCost.toFixed(0)} + Labor ${lCost.toFixed(0)})
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function ClassroomValueWorkspace({
  lesson,
  view,
  telemetry,
  user,
  currentLanguage,
  currentPlaybackSeconds,
  onSeekToSeconds,
  practiceDraft,
  onChangePracticeDraft,
  practiceSavedBanner,
  onPracticePhotoUpload,
  onSavePractice,
  onSelectKnowledgeAnswer,
  onClaimCertificate,
  allLessons,
  telemetryMap,
  upNextLessons,
  onOpenLesson,
  getUpNextPreview,
}: ClassroomValueWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ClassroomMainTab>("overview")
  const [coachSubTab, setCoachSubTab] = useState<CoachSubTab>("ai")

  const userEmailOrId = user?.email || user?.id || user?.name || "member"
  const normalizedVoterKey = useMemo(
    () => normalizeUserKeyLocal(userEmailOrId),
    [userEmailOrId]
  )
  const displayName = user?.name || "ConnectLn Member"
  const displayHeadline = user?.headline || user?.profession || `${lesson.category} Practitioner`
  const displayAvatar = user?.avatar || ""

  const [workspace, setWorkspace] = useState<LessonWorkspaceClientPayload | null>(null)
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState<boolean>(false)

  // Overview progressive disclosure drawers
  const [showChecklist, setShowChecklist] = useState<boolean>(false)
  const [showCalculator, setShowCalculator] = useState<boolean>(false)
  const [showTruthStandards, setShowTruthStandards] = useState<boolean>(false)
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({})

  // Practice proof-of-work state
  const [alsoPostToFeed, setAlsoPostToFeed] = useState<boolean>(true)
  const [isPublishingProof, setIsPublishingProof] = useState<boolean>(false)
  const [proofBanner, setProofBanner] = useState<string | null>(null)
  const modalPhotoInputRef = useRef<HTMLInputElement | null>(null)

  // Scenario drill & Credential state
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<number, number>>({})
  const [isIssuingCred, setIsIssuingCred] = useState<boolean>(false)
  const [credCopied, setCredCopied] = useState<boolean>(false)

  // Coach AI state
  const [coachInput, setCoachInput] = useState<string>("")
  const [isAskingCoach, setIsAskingCoach] = useState<boolean>(false)
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([
    {
      role: "assistant",
      content: `Hi ${displayName.split(" ")[0]}! Ask me anything about "${view.title}" (${lesson.category}) — tools, measurements, safety checks, or troubleshooting in ${currentLanguage.localName}.`,
    },
  ])

  // Timestamp Notes state
  const [noteInput, setNoteInput] = useState<string>("")
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false)

  // Community Q&A, Regional Tips & Mentor Call state
  const [qaInput, setQaInput] = useState<string>("")
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [regionFilter, setRegionFilter] = useState<"ALL" | RegionalTipCode>("ALL")
  const [showAddTipForm, setShowAddTipForm] = useState<boolean>(false)
  const [tipRegion, setTipRegion] = useState<RegionalTipCode>("US / NEC")
  const [tipTitle, setTipTitle] = useState<string>("")
  const [tipDetail, setTipDetail] = useState<string>("")
  const [showMentorBox, setShowMentorBox] = useState<boolean>(false)
  const [mentorChannel, setMentorChannel] = useState<"audio" | "video" | "message">("video")
  const [mentorQuestion, setMentorQuestion] = useState<string>("")
  const [mentorSentBanner, setMentorSentBanner] = useState<string | null>(null)

  // Learn -> Earn live jobs state (instant local catalog match + live refresh)
  const primaryEnclave = LEARN_CATEGORY_META[lesson.category]?.enclaveIds?.[0] || "trades_construction"
  const instantCatalogJobs = useMemo(() => {
    const enclaves = new Set(LEARN_CATEGORY_META[lesson.category]?.enclaveIds || [])
    const catWords = lesson.category
      .toLowerCase()
      .split(/[\s&/]+/)
      .filter((w) => w.length > 3)

    const scored = GLOBAL_JOBS_CATALOG.map((job) => {
      let score = 0
      if (job.professionEnclave && enclaves.has(job.professionEnclave)) score += 3
      const hay = `${job.title} ${job.description} ${(job.tags || []).join(" ")}`.toLowerCase()
      for (const w of catWords) {
        if (hay.includes(w)) score += 4
      }
      return { job, score }
    })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((x) => x.job)

    return scored.length > 0 ? scored : GLOBAL_JOBS_CATALOG.slice(0, 5)
  }, [lesson.category])

  const [matchingJobs, setMatchingJobs] = useState<GlobalJobItem[]>(instantCatalogJobs)

  const checklist = useMemo(() => buildLessonChecklist(lesson), [lesson])
  const scenarioDrill = useMemo(() => getJobsiteScenarioForLesson(lesson), [lesson])
  const baselineRegionalTips = useMemo(
    () => getBaselineRegionalTips(lesson.category),
    [lesson.category]
  )
  const truthBlueprint = useMemo(
    () => getProfessionTruthBlueprint(lesson.category),
    [lesson.category]
  )
  const crossPlatformStudyLinks = useMemo(
    () => getCrossPlatformStudyLinks(`${view.title} ${lesson.category}`),
    [view.title, lesson.category]
  )

  // Reset ephemeral state cleanly when lesson changes
  useEffect(() => {
    setActiveTab("overview")
    setProofBanner(null)
    setCredCopied(false)
    setScenarioAnswers({})
    setCoachMessages([
      {
        role: "assistant",
        content: `Ready to coach you on "${view.title}" (${lesson.category}). Tap a quick prompt below or ask any jobsite question!`,
      },
    ])
    setMatchingJobs(instantCatalogJobs)

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(`connectln_lbd_checklist_v1:${lesson.id}`)
        setCheckedMap(raw ? (JSON.parse(raw) as Record<string, boolean>) : {})
      } catch {
        setCheckedMap({})
      }
    }
  }, [lesson.id, lesson.category, view.title, instantCatalogJobs])

  // Load persistent workspace data from MongoDB
  useEffect(() => {
    let active = true
    setIsLoadingWorkspace(true)
    fetch(
      `/api/connectin/learning-workspace?lessonId=${encodeURIComponent(lesson.id)}&userKey=${encodeURIComponent(userEmailOrId)}`,
      { cache: "no-store" }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.ok && data.workspace) {
          setWorkspace(data.workspace as LessonWorkspaceClientPayload)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoadingWorkspace(false)
      })

    return () => {
      active = false
    }
  }, [lesson.id, userEmailOrId])

  // Refresh matching jobs lazily from /api/connectin/jobs
  useEffect(() => {
    let active = true
    fetch(`/api/connectin/jobs?enclave=${encodeURIComponent(primaryEnclave)}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.jobs) && data.jobs.length > 0) {
          setMatchingJobs((data.jobs as GlobalJobItem[]).slice(0, 6))
        }
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [primaryEnclave, lesson.id])

  const totalChecklistCount =
    checklist.ppe.length + checklist.tools.length + checklist.steps.length
  const checkedCount = Object.values(checkedMap).filter(Boolean).length

  const toggleChecklistItem = (key: string) => {
    setCheckedMap((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            `connectln_lbd_checklist_v1:${lesson.id}`,
            JSON.stringify(next)
          )
        } catch {
          // ignore quota error
        }
      }
      return next
    })
  }

  const handleOpenPrintableFieldSheet = () => {
    if (typeof window === "undefined") return
    const html = buildPrintableFieldSheetHtml(
      lesson,
      view.title,
      view.creator,
      checklist,
      workspace?.notes || []
    )
    const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=920")
    if (popup && !popup.closed) {
      popup.document.open()
      popup.document.write(html)
      popup.document.close()
      return
    }
    // Safe downloadable HTML fallback if popup blocker is active
    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${lesson.id}-field-sheet.html`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }

  const postWorkspaceAction = async (payload: Record<string, any>) => {
    const res = await fetch("/api/connectin/learning-workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: lesson.id,
        userKey: userEmailOrId,
        ...payload,
      }),
    })
    const data = await res.json().catch(() => null)
    if (data?.ok && data.workspace) {
      setWorkspace(data.workspace as LessonWorkspaceClientPayload)
    }
    return data
  }

  const handlePublishProofOfWork = async () => {
    const notesText = (practiceDraft ?? telemetry.practiceNotes ?? "").trim()
    if (!notesText && !telemetry.practicePhotoDataUrl) {
      setProofBanner("Add practice notes or attach a project photo first.")
      return
    }
    setIsPublishingProof(true)
    setProofBanner(null)
    try {
      onSavePractice()
      const compressedPhoto = await compressDataUrlForCloud(telemetry.practicePhotoDataUrl)
      const data = await postWorkspaceAction({
        action: "publish_proof",
        authorId: user?.id,
        authorName: displayName,
        authorHeadline: displayHeadline,
        authorAvatar: displayAvatar,
        notes: notesText,
        photoDataUrl: compressedPhoto,
        lessonTitle: view.title,
        category: lesson.category,
        alsoPublishToFeed: alsoPostToFeed,
      })
      if (data?.ok) {
        setProofBanner(
          alsoPostToFeed
            ? "✓ Proof-of-Work published to Classroom Gallery & Community Feed!"
            : "✓ Proof-of-Work published to Classroom Gallery!"
        )
      } else {
        setProofBanner(data?.error || "Could not publish Proof-of-Work.")
      }
    } finally {
      setIsPublishingProof(false)
    }
  }

  const handleToggleVouch = async (proofId: string) => {
    await postWorkspaceAction({ action: "vouch_proof", proofId })
  }

  const handleAskCoach = async (promptOverride?: string) => {
    const q = (promptOverride ?? coachInput).trim()
    if (!q || isAskingCoach) return
    setCoachInput("")
    const historySnapshot = coachMessages.slice(-4)
    setCoachMessages((prev) => [...prev, { role: "user", content: q }])
    setIsAskingCoach(true)
    try {
      const res = await fetch("/api/connectin/learning-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ask_coach",
          lessonId: lesson.id,
          userKey: userEmailOrId,
          lessonTitle: view.title,
          category: lesson.category,
          description: view.description,
          skills: view.skills,
          fieldTip: lesson.fieldTip,
          studyNotes: lesson.detailedStudyNotes,
          language: currentLanguage.localName || "English",
          question: q,
          history: historySnapshot,
        }),
      })
      const data = await res.json().catch(() => null)
      const answer =
        data?.answer ||
        `Focus on PPE, verified measurements, and final quality checks for "${view.title}".`
      setCoachMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer, source: data?.source },
      ])
    } catch {
      setCoachMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Coach connection paused — review the Overview Study Notes and Pro Field Tip while offline.",
        },
      ])
    } finally {
      setIsAskingCoach(false)
    }
  }

  const handleAddTimestampNote = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = noteInput.trim()
    if (!clean || isSavingNote) return
    setIsSavingNote(true)
    try {
      const res = await postWorkspaceAction({
        action: "add_note",
        timeSeconds: currentPlaybackSeconds,
        text: clean,
      })
      if (res?.ok) setNoteInput("")
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleAddQaQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = qaInput.trim()
    if (!clean) return
    const res = await postWorkspaceAction({
      action: "add_qa",
      authorName: displayName,
      authorRole: displayHeadline,
      authorAvatar: displayAvatar,
      question: clean,
    })
    if (res?.ok) setQaInput("")
  }

  const handleAddQaReply = async (qaId: string) => {
    const clean = (replyDrafts[qaId] || "").trim()
    if (!clean) return
    const res = await postWorkspaceAction({
      action: "add_reply",
      qaId,
      authorName: displayName,
      authorRole: displayHeadline,
      authorAvatar: displayAvatar,
      text: clean,
    })
    if (res?.ok) {
      setReplyDrafts((prev) => ({ ...prev, [qaId]: "" }))
    }
  }

  const handleAddRegionalTip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipTitle.trim() || !tipDetail.trim()) return
    const res = await postWorkspaceAction({
      action: "add_regional_tip",
      region: tipRegion,
      title: tipTitle.trim(),
      detail: tipDetail.trim(),
      authorName: displayName,
    })
    if (res?.ok) {
      setTipTitle("")
      setTipDetail("")
      setShowAddTipForm(false)
    }
  }

  const handleRequestMentor = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await postWorkspaceAction({
      action: "request_mentor",
      requesterName: displayName,
      channel: mentorChannel,
      question: mentorQuestion.trim() || `Help requested on ${view.title}`,
      category: lesson.category,
    })
    if (res?.ok) {
      setMentorQuestion("")
      setMentorSentBanner("✓ Request logged! A verified trade mentor in Messaging can follow up.")
    }
  }

  // Compute credential tier & scenario completion
  const myProofs = (workspace?.proofsOfWork || []).filter(
    (p) => p.authorKey === normalizedVoterKey
  )
  const totalMyVouches = myProofs.reduce(
    (sum, p) => sum + (p.vouchedByUserKeys?.length || 0),
    0
  )
  const scenarioAllCorrect = scenarioDrill.steps.every(
    (st, idx) => scenarioAnswers[idx] === st.correctIndex
  )
  const earnedTier: CredentialTier =
    telemetry.isCompleted && (totalMyVouches >= 1 || scenarioAllCorrect)
      ? "Master-Ready"
      : telemetry.knowledgeCheckPassed || Boolean(telemetry.practiceCompletedAt)
        ? "Practitioner"
        : "Apprentice"

  const existingCredential = (workspace?.credentials || []).find(
    (c) => c.userKey === normalizedVoterKey
  )

  const handleIssueCredential = async () => {
    setIsIssuingCred(true)
    try {
      await postWorkspaceAction({
        action: "issue_credential",
        holderName: displayName,
        lessonTitle: view.title,
        category: lesson.category,
        tier: earnedTier,
        vouchCount: totalMyVouches,
      })
      onClaimCertificate?.(
        `${view.title} · ${earnedTier} (${SKILLED_TRADES_COLLECTION_META.title})`
      )
    } finally {
      setIsIssuingCred(false)
    }
  }

  const handleCopyCredentialLink = () => {
    if (typeof window === "undefined") return
    const credParam = existingCredential?.id
      ? `&cred=${encodeURIComponent(existingCredential.id)}`
      : ""
    const shareUrl = `${window.location.origin}/connectin?tab=learning&lesson=${encodeURIComponent(lesson.id)}${credParam}`
    navigator.clipboard?.writeText(shareUrl).catch(() => {})
    setCredCopied(true)
    setTimeout(() => setCredCopied(false), 2500)
  }

  // Merge regional tips cleanly
  const combinedRegionalTips: Array<BaselineRegionalTip & { isCommunity?: boolean }> = useMemo(() => {
    const community = (workspace?.regionalTips || []).map((t) => ({
      id: t.id,
      region: t.region,
      title: t.title,
      detail: t.detail,
      authorName: t.authorName,
      isCommunity: true,
    }))
    const all = [...community, ...baselineRegionalTips]
    return regionFilter === "ALL" ? all : all.filter((t) => t.region === regionFilter)
  }, [workspace?.regionalTips, baselineRegionalTips, regionFilter])

  // Track progress in current lesson category
  const trackStats = useMemo(() => {
    const inCategory = allLessons.filter((l) => l.category === lesson.category)
    const completed = inCategory.filter(
      (l) => telemetryMap[l.id]?.isCompleted
    ).length
    const pct = inCategory.length > 0 ? Math.round((completed / inCategory.length) * 100) : 0
    return { total: inCategory.length, completed, pct }
  }, [allLessons, lesson.category, telemetryMap])

  return (
    <div className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex flex-col overflow-hidden">
      {/* Crisp 5-Tab Bar */}
      <div className="grid grid-cols-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-bold">
        {(
          [
            { id: "overview", label: "Overview" },
            { id: "practice", label: "Practice" },
            { id: "quiz", label: "Quiz" },
            { id: "coach", label: "Coach" },
            { id: "jobs", label: "Jobs" },
          ] as const
        ).map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setActiveTab(tb.id)}
            className={`py-2.5 px-1 text-center border-b-2 transition-colors cursor-pointer truncate ${
              activeTab === tb.id
                ? "border-[#01754F] text-[#01754F] dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Scrollable Classroom Panel Body */}
      <div className="p-4 space-y-3.5 overflow-y-auto max-h-[540px] flex-1">
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === "overview" && (
          <div className="space-y-3.5">
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

            {lesson.detailedStudyNotes && lesson.detailedStudyNotes.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-[#0A66C2]" />
                  <span>Detailed Study Notes</span>
                </span>
                <div className="space-y-1.5">
                  {lesson.detailedStudyNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed flex gap-2"
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

            {lesson.fieldTip && (
              <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2.5 text-[11px] text-emerald-950 dark:text-emerald-200">
                <strong className="block mb-0.5">💡 Pro Field Tip</strong>
                {lesson.fieldTip}
              </div>
            )}

            {/* Collapsible Jobsite Tool / PPE Checklist + 1-Click Field Sheet */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowChecklist((v) => !v)}
                  className="flex items-center gap-1.5 text-left text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-[#01754F]" />
                  <span>
                    Tools, PPE &amp; Checklist ({checkedCount}/{totalChecklistCount})
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${
                      showChecklist ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleOpenPrintableFieldSheet}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-2.5 py-1 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Printer className="h-3 w-3" />
                  <span>Field Sheet</span>
                </button>
              </div>

              {showChecklist && (
                <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  {(
                    [
                      { keyPrefix: "ppe", title: "Safety & PPE", items: checklist.ppe },
                      { keyPrefix: "tools", title: "Tools & Materials", items: checklist.tools },
                      { keyPrefix: "steps", title: "Execution Steps", items: checklist.steps },
                    ] as const
                  ).map((group) => (
                    <div key={group.keyPrefix} className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 block">
                        {group.title}
                      </span>
                      {group.items.map((item, idx) => {
                        const itemKey = `${group.keyPrefix}_${idx}`
                        const isChecked = Boolean(checkedMap[itemKey])
                        return (
                          <label
                            key={itemKey}
                            className="flex items-start gap-2 text-[11px] text-zinc-700 dark:text-zinc-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleChecklistItem(itemKey)}
                              className="mt-0.5 accent-[#01754F]"
                            />
                            <span className={isChecked ? "line-through text-zinc-400" : ""}>
                              {item}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Collapsible Context-Aware Trade Calculator */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5">
              <button
                type="button"
                onClick={() => setShowCalculator((v) => !v)}
                className="w-full flex items-center justify-between gap-2 text-left text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5 text-[#0A66C2]" />
                  <span>Trade Calculator · {lesson.category}</span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${
                    showCalculator ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showCalculator && <TradeCalculatorPanel category={lesson.category} />}
            </div>

            {/* Collapsible Primary Standards, OER Textbooks & BLS Career Truth Drawer */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900 p-2.5">
              <button
                type="button"
                onClick={() => setShowTruthStandards((v) => !v)}
                className="w-full flex items-center justify-between gap-2 text-left text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#01754F]" />
                  <span>Standards, OER Textbooks &amp; BLS Career Truth</span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${
                    showTruthStandards ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showTruthStandards && (
                <div className="space-y-2.5 pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={truthBlueprint.onetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 p-2 hover:border-[#0A66C2]"
                    >
                      <span className="text-[9.5px] font-bold uppercase text-zinc-500 block">
                        O*NET SOC {truthBlueprint.onetSocCode}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-1">
                        {truthBlueprint.onetTitle}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    </a>
                    <a
                      href={truthBlueprint.blsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2 hover:border-[#01754F]"
                    >
                      <span className="text-[9.5px] font-bold uppercase text-zinc-500 block">
                        BLS Pay ({truthBlueprint.blsGrowth2025_2035})
                      </span>
                      <span className="font-bold text-[#01754F] dark:text-emerald-300 inline-flex items-center gap-1">
                        {truthBlueprint.blsMedianPay}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    </a>
                  </div>

                  <div>
                    <span className="text-[9.5px] font-bold uppercase text-zinc-500 block mb-1">
                      Career Progression: {truthBlueprint.careerLadder.join(" → ")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] font-bold uppercase text-zinc-500 block">
                      Governing Codes &amp; Primary Standards
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {truthBlueprint.governingStandards.map((st) => (
                        <a
                          key={st.url + st.title}
                          href={st.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-200 inline-flex items-center gap-1 hover:border-amber-500"
                        >
                          <span>{st.title}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] font-bold uppercase text-zinc-500 block">
                      Free Open Textbooks &amp; U.S. DOL OER
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {truthBlueprint.openTextbooksAndOer.map((oer) => (
                        <a
                          key={oer.url + oer.title}
                          href={oer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300 inline-flex items-center gap-1 hover:border-[#0A66C2]"
                        >
                          <span>{oer.title}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] font-bold uppercase text-zinc-500 block">
                      Cross-Platform Verification Links
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {crossPlatformStudyLinks.slice(0, 6).map((cp) => (
                        <a
                          key={cp.id}
                          href={cp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[9.5px] font-semibold text-zinc-700 dark:text-zinc-200 hover:border-[#0A66C2] inline-flex items-center gap-0.5"
                        >
                          <span>{cp.label}</span>
                          <ExternalLink className="h-2 w-2" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= PRACTICE TAB ================= */}
        {activeTab === "practice" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200 inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Guided Practice Activity</span>
                </span>
                {telemetry.practiceCompletedAt && (
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
              rows={3}
              value={practiceDraft ?? telemetry.practiceNotes ?? ""}
              onChange={(e) => onChangePracticeDraft(e.target.value)}
              placeholder="Write your hands-on measurements, test readings, or deliverable notes..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0A66C2]"
            />

            {telemetry.practicePhotoDataUrl && (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900 p-2 space-y-1">
                <p className="text-[10px] font-semibold text-zinc-500 truncate">
                  Attached photo: {telemetry.practicePhotoName}
                </p>
                <img
                  src={telemetry.practicePhotoDataUrl}
                  alt="Practice deliverable"
                  className="w-full max-h-32 object-cover rounded"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <input
                ref={modalPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPracticePhotoUpload}
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
                onClick={onSavePractice}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-3.5 py-1.5 text-[11px] font-bold cursor-pointer"
              >
                Save Deliverable
              </button>
            </div>

            {practiceSavedBanner && (
              <p className="text-[11px] font-bold text-[#01754F] dark:text-emerald-400">
                ✓ Practice deliverable saved cleanly (+33% progress)
              </p>
            )}

            {/* Proof-of-Work Portfolio Publisher & Community Peer Vouching */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alsoPostToFeed}
                    onChange={(e) => setAlsoPostToFeed(e.target.checked)}
                    className="accent-[#01754F]"
                  />
                  <span>Also post to Community Feed</span>
                </label>

                <button
                  type="button"
                  disabled={isPublishingProof}
                  onClick={handlePublishProofOfWork}
                  className="rounded-full bg-[#01754F] hover:bg-[#015e3f] disabled:opacity-60 text-white px-3.5 py-1.5 text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>
                    {isPublishingProof ? "Publishing…" : "Publish Proof-of-Work"}
                  </span>
                </button>
              </div>
              {proofBanner && (
                <p className="text-[11px] font-bold text-[#01754F] dark:text-emerald-300">
                  {proofBanner}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Peer Proof-of-Work &amp; Technique Vouches
                </span>
                {isLoadingWorkspace && (
                  <span className="text-[10px] text-zinc-400">Syncing…</span>
                )}
              </div>

              {(workspace?.proofsOfWork || []).length === 0 ? (
                <p className="text-[11px] text-zinc-500 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-2.5">
                  Be the first to publish Proof-of-Work for this lesson and earn Master Peer vouches.
                </p>
              ) : (
                (workspace?.proofsOfWork || []).slice(0, 8).map((pow) => {
                  const hasVouched = (pow.vouchedByUserKeys || []).includes(
                    normalizedVoterKey
                  )
                  const vouchCount = pow.vouchedByUserKeys?.length || 0
                  return (
                    <div
                      key={pow.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11.5px] font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {pow.authorName}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            {pow.authorHeadline}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleVouch(pow.id)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0 transition-colors ${
                            hasVouched
                              ? "bg-[#01754F] text-white border-[#01754F]"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:border-[#01754F]"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>Vouch Technique ({vouchCount})</span>
                        </button>
                      </div>
                      {pow.notes && (
                        <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {pow.notes}
                        </p>
                      )}
                      {pow.photoDataUrl && (
                        <img
                          src={pow.photoDataUrl}
                          alt={`${pow.authorName} proof`}
                          className="w-full max-h-36 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800"
                        />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ================= QUIZ & DRILL TAB ================= */}
        {activeTab === "quiz" && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <HelpCircle className="h-4 w-4 text-[#0A66C2]" />
                <span>Mastery Knowledge Check</span>
              </div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {view.knowledgeCheck.question}
              </p>

              <div className="space-y-1.5">
                {view.knowledgeCheck.options.map((opt, idx) => {
                  const selected = telemetry.knowledgeCheckSelectedOption === idx
                  const isCorrect = idx === view.knowledgeCheck.correctIndex
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        onSelectKnowledgeAnswer(idx, view.knowledgeCheck.correctIndex)
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

              {telemetry.knowledgeCheckSelectedOption !== undefined && (
                <div
                  className={`rounded-xl p-2.5 text-[11px] border ${
                    telemetry.knowledgeCheckPassed
                      ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 text-emerald-900 dark:text-emerald-200"
                      : "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 text-amber-900 dark:text-amber-200"
                  }`}
                >
                  <strong className="block mb-0.5">
                    {telemetry.knowledgeCheckPassed
                      ? "✓ Correct! (+33% Knowledge Check complete)"
                      : "Try again — review the reasoning:"}
                  </strong>
                  {view.knowledgeCheck.explanation}
                </div>
              )}
            </div>

            {/* Interactive "What Would You Do?" Jobsite Scenario Drill */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-2.5">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0A66C2]">
                  What Would You Do? · Jobsite Scenario Drill
                </span>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {scenarioDrill.title}
                </p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {scenarioDrill.situation}
                </p>
              </div>

              {scenarioDrill.steps.map((step, sIdx) => {
                const chosen = scenarioAnswers[sIdx]
                const answered = chosen !== undefined
                const right = chosen === step.correctIndex
                return (
                  <div
                    key={sIdx}
                    className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <p className="text-[11.5px] font-bold text-zinc-800 dark:text-zinc-200">
                      Step {sIdx + 1}: {step.prompt}
                    </p>
                    <div className="space-y-1">
                      {step.options.map((opt, oIdx) => {
                        const isPicked = chosen === oIdx
                        const isRightOpt = oIdx === step.correctIndex
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() =>
                              setScenarioAnswers((prev) => ({ ...prev, [sIdx]: oIdx }))
                            }
                            className={`w-full text-left rounded-lg px-2.5 py-1.5 text-[11px] border cursor-pointer transition-colors ${
                              isPicked && isRightOpt
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold"
                                : isPicked
                                  ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200"
                                  : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 hover:border-[#0A66C2] text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    {answered && (
                      <p
                        className={`text-[10.5px] leading-snug rounded-lg p-2 ${
                          right
                            ? "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
                            : "bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200"
                        }`}
                      >
                        <strong>{right ? "Master Move ✓: " : "Watch Out: "}</strong>
                        {step.debrief}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Verified Skill Credential & Shareable Link */}
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  <Award className="h-4 w-4 text-[#01754F]" />
                  <span>Skill Credential · {earnedTier}</span>
                </span>
                {existingCredential && (
                  <span className="rounded-full bg-[#01754F] text-white px-2 py-0.5 text-[10px] font-bold">
                    Issued ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-900/90 dark:text-emerald-200">
                Complete the video, scenario/quiz &amp; Proof-of-Work ({totalMyVouches} peer vouches) to unlock Master-Ready verification.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isIssuingCred}
                  onClick={handleIssueCredential}
                  className="flex-1 rounded-full bg-[#01754F] hover:bg-[#015e3f] disabled:opacity-60 text-white py-1.5 px-3 text-[11px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>
                    {isIssuingCred
                      ? "Issuing…"
                      : existingCredential
                        ? "Refresh Verified Credential"
                        : "Issue & Claim Credential"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyCredentialLink}
                  className="rounded-full border border-emerald-400 dark:border-emerald-700 bg-white dark:bg-zinc-900 text-emerald-900 dark:text-emerald-200 py-1.5 px-3 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{credCopied ? "Copied ✓" : "Copy Link"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= COACH & Q&A TAB ================= */}
        {activeTab === "coach" && (
          <div className="space-y-3">
            {/* Slim 3-Pill Sub-Switcher (Progressive Disclosure: 1 Tool Visible) */}
            <div className="grid grid-cols-3 gap-1 rounded-full bg-zinc-200/70 dark:bg-zinc-800 p-1 text-[11px] font-bold">
              {(
                [
                  { id: "ai", label: "Noctis Coach" },
                  { id: "notes", label: `Notes (${workspace?.notes.length || 0})` },
                  { id: "community", label: `Q&A & Tips (${workspace?.qaItems.length || 0})` },
                ] as const
              ).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setCoachSubTab(sub.id)}
                  className={`rounded-full py-1 px-2 text-center cursor-pointer transition-colors truncate ${
                    coachSubTab === sub.id
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {coachSubTab === "ai" && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10.5px] text-zinc-500">
                  <span className="inline-flex items-center gap-1 font-bold text-[#01754F] dark:text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Noctis Trade Coach</span>
                  </span>
                  <span>
                    {currentLanguage.flag} {currentLanguage.localName}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    "What PPE & tools do I need?",
                    "Common mistakes to avoid?",
                    "How do I verify inspection pass?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleAskCoach(prompt)}
                      className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#0A66C2] px-2.5 py-1 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {coachMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-2.5 text-[11.5px] leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-[#0A66C2] text-white ml-6"
                          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 mr-4"
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isAskingCoach && (
                    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 text-[11px] text-zinc-500 mr-6">
                      Noctis Trade Coach is thinking…
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAskCoach()
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={coachInput}
                    onChange={(e) => setCoachInput(e.target.value)}
                    placeholder={`Ask Noctis about ${lesson.category}...`}
                    className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0A66C2]"
                  />
                  <button
                    type="submit"
                    disabled={isAskingCoach || !coachInput.trim()}
                    className="h-8 w-8 rounded-full bg-[#01754F] hover:bg-[#015e3f] disabled:opacity-50 text-white flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            )}

            {coachSubTab === "notes" && (
              <div className="space-y-2.5">
                <form onSubmit={handleAddTimestampNote} className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 inline-flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" />
                      <span>@ {formatSecondsLabel(currentPlaybackSeconds)}</span>
                    </span>
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Type timestamp note for this moment..."
                      className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0A66C2]"
                    />
                    <button
                      type="submit"
                      disabled={isSavingNote || !noteInput.trim()}
                      className="rounded-full bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 text-white px-3 py-1.5 text-[11px] font-bold cursor-pointer shrink-0"
                    >
                      + Note
                    </button>
                  </div>
                </form>

                {(workspace?.notes || []).length === 0 ? (
                  <p className="text-[11px] text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                    Save personal timestamp bookmarks while watching. Clicking any timestamp jumps directly to that spot.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {(workspace?.notes || []).map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 flex items-start justify-between gap-2"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() => onSeekToSeconds(note.timeSeconds)}
                            className="rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10.5px] font-bold text-[#0A66C2] dark:text-sky-300 hover:bg-blue-100 cursor-pointer shrink-0"
                          >
                            @ {formatSecondsLabel(note.timeSeconds)}
                          </button>
                          <p className="text-[11.5px] text-zinc-800 dark:text-zinc-200 leading-snug">
                            {note.text}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Delete note"
                          onClick={() =>
                            postWorkspaceAction({ action: "delete_note", noteId: note.id })
                          }
                          className="text-zinc-400 hover:text-rose-500 p-0.5 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {coachSubTab === "community" && (
              <div className="space-y-3">
                {/* Regional Code & Pro Tips */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase text-zinc-600 dark:text-zinc-300">
                      <Globe className="h-3.5 w-3.5 text-[#01754F]" />
                      <span>Regional Codes &amp; Pro Tips</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddTipForm((v) => !v)}
                      className="text-[10.5px] font-bold text-[#0A66C2] hover:underline cursor-pointer"
                    >
                      {showAddTipForm ? "Close" : "+ Add Regional Tip"}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(
                      ["ALL", "US / NEC", "UK / EU", "Africa / ECOWAS", "Global Metric"] as const
                    ).map((reg) => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setRegionFilter(reg)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold border cursor-pointer ${
                          regionFilter === reg
                            ? "bg-[#01754F] text-white border-[#01754F]"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        {reg === "ALL" ? "All Regions" : reg}
                      </button>
                    ))}
                  </div>

                  {showAddTipForm && (
                    <form onSubmit={handleAddRegionalTip} className="space-y-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="grid grid-cols-2 gap-1.5">
                        <select
                          value={tipRegion}
                          onChange={(e) => setTipRegion(e.target.value as RegionalTipCode)}
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[11px] text-zinc-900 dark:text-zinc-100"
                        >
                          <option value="US / NEC">US / NEC</option>
                          <option value="UK / EU">UK / EU</option>
                          <option value="Africa / ECOWAS">Africa / ECOWAS</option>
                          <option value="Global Metric">Global Metric</option>
                        </select>
                        <input
                          type="text"
                          required
                          value={tipTitle}
                          onChange={(e) => setTipTitle(e.target.value)}
                          placeholder="Local standard / title..."
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[11px] text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={tipDetail}
                        onChange={(e) => setTipDetail(e.target.value)}
                        placeholder="Share local wire colors, voltage, pipe sizes, or climate tip..."
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[11px] text-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-[#01754F] text-white px-3 py-1 text-[10.5px] font-bold cursor-pointer"
                      >
                        Save Regional Tip
                      </button>
                    </form>
                  )}

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {combinedRegionalTips.map((tip) => (
                      <div
                        key={tip.id}
                        className="rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 p-2 text-[11px]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-zinc-900 dark:text-zinc-100">
                            {tip.title}
                          </strong>
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[9.5px] font-bold shrink-0">
                            {tip.region}
                          </span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-snug">
                          {tip.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Persistent Lesson Q&A Thread */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-[#0A66C2]" />
                    <span>Lesson Q&amp;A Thread</span>
                  </span>
                  <form onSubmit={handleAddQaQuestion} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={qaInput}
                      onChange={(e) => setQaInput(e.target.value)}
                      placeholder="Ask peers & master pros a question..."
                      className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0A66C2]"
                    />
                    <button
                      type="submit"
                      disabled={!qaInput.trim()}
                      className="rounded-full bg-[#0A66C2] disabled:opacity-50 text-white px-3 py-1.5 text-[11px] font-bold cursor-pointer shrink-0"
                    >
                      Ask
                    </button>
                  </form>

                  {(workspace?.qaItems || []).map((qa) => (
                    <div
                      key={qa.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 space-y-1.5"
                    >
                      <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                        {qa.authorName}{" "}
                        <span className="font-normal text-zinc-500">· {qa.authorRole}</span>
                      </p>
                      <p className="text-[11.5px] text-zinc-800 dark:text-zinc-200">
                        {qa.question}
                      </p>
                      {(qa.replies || []).length > 0 && (
                        <div className="pl-2.5 border-l-2 border-emerald-400 space-y-1">
                          {qa.replies.map((rep) => (
                            <p
                              key={rep.id}
                              className="text-[11px] text-zinc-700 dark:text-zinc-300"
                            >
                              <strong>{rep.authorName}:</strong> {rep.text}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <input
                          type="text"
                          value={replyDrafts[qa.id] || ""}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({
                              ...prev,
                              [qa.id]: e.target.value,
                            }))
                          }
                          placeholder="Write a helpful peer reply..."
                          className="flex-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-900 dark:text-zinc-100"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddQaReply(qa.id)}
                          className="rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-200 hover:border-[#0A66C2] cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compact Verified Pro / Mentor Call Footer */}
                <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/20 p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowMentorBox((v) => !v)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0A66C2] dark:text-sky-300 cursor-pointer"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>Ask a Verified Pro / Request Mentor Call</span>
                    </button>
                    <Link
                      href="/connectin?tab=messaging"
                      className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#01754F] hover:underline"
                    >
                      <Video className="h-3 w-3" />
                      <span>Open Messaging</span>
                    </Link>
                  </div>

                  {showMentorBox && (
                    <form onSubmit={handleRequestMentor} className="space-y-1.5 pt-1 border-t border-sky-200/70 dark:border-sky-800">
                      <div className="flex items-center gap-1.5">
                        {(["video", "audio", "message"] as const).map((ch) => (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setMentorChannel(ch)}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize border cursor-pointer ${
                              mentorChannel === ch
                                ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
                            }`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={mentorQuestion}
                          onChange={(e) => setMentorQuestion(e.target.value)}
                          placeholder="What stuck point would you like a pro to review?"
                          className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1 text-[11px] text-zinc-900 dark:text-zinc-100"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-[#01754F] text-white px-3 py-1 text-[10.5px] font-bold cursor-pointer shrink-0"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  )}

                  {mentorSentBanner && (
                    <p className="text-[10.5px] font-bold text-[#01754F] dark:text-emerald-300">
                      {mentorSentBanner}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= JOBS & NEXT TAB ================= */}
        {activeTab === "jobs" && (
          <div className="space-y-3.5">
            {/* Learn -> Earn Track Progress */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-emerald-100">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#01754F]" />
                  <span>Learn → Earn · {lesson.category}</span>
                </span>
                <span>
                  {trackStats.completed}/{trackStats.total} ({trackStats.pct}%)
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-emerald-200/70 dark:bg-emerald-950 overflow-hidden">
                <div
                  className="h-full bg-[#01754F] transition-all"
                  style={{ width: `${trackStats.pct}%` }}
                />
              </div>
            </div>

            {/* Live Matched Open Jobs & Gigs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Matching Open Roles &amp; Gigs
                </span>
                <Link
                  href="/connectin?tab=jobs"
                  className="text-[10.5px] font-bold text-[#0A66C2] hover:underline"
                >
                  Explore All Jobs →
                </Link>
              </div>

              {matchingJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {job.title}
                    </p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                      {job.company} · {job.location}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="rounded bg-emerald-50 dark:bg-emerald-950/50 text-[#01754F] dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-bold">
                        {job.salaryRange}
                      </span>
                      {job.easyApply && (
                        <span className="rounded bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] dark:text-sky-300 px-1.5 py-0.5 text-[10px] font-semibold">
                          Easy Apply
                        </span>
                      )}
                    </div>
                  </div>
                  {job.applyUrl ? (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-2.5 py-1 text-[10px] font-bold inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Apply</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ) : (
                    <Link
                      href="/connectin?tab=jobs"
                      className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-2.5 py-1 text-[10px] font-bold shrink-0"
                    >
                      View
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Up Next Lessons Preserved Below */}
            <div className="space-y-2 pt-1 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                Up Next in {lesson.category} &amp; Related Fields
              </span>
              {upNextLessons.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  No additional lessons queued in this track.
                </p>
              ) : (
                upNextLessons.slice(0, 5).map((nextL) => {
                  const preview = getUpNextPreview(nextL)
                  return (
                    <button
                      key={nextL.id}
                      type="button"
                      onClick={() => onOpenLesson(nextL)}
                      className="w-full flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0A66C2] p-2 text-left transition-colors cursor-pointer"
                    >
                      <img
                        src={preview.thumbnailUrl}
                        alt={preview.title}
                        className="w-16 h-10 rounded-md object-cover shrink-0 bg-zinc-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-zinc-500 truncate">
                          {nextL.category} · {formatDur(preview.duration)}
                        </p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {preview.title}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
