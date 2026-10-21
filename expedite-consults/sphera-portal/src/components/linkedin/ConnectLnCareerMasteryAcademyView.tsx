"use client"

import React, { useState, useRef, useMemo, useEffect } from "react"
import {
  GraduationCap,
  BookOpen,
  FileText,
  CheckCircle2,
  Award,
  Sparkles,
  Download,
  Printer,
  ExternalLink,
  Compass,
  Shield,
  Wrench,
  Cpu,
  Building2,
  Briefcase,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Search,
  Layers,
  Play,
  Sliders,
  Map,
  Rocket,
  FolderCheck,
  Video,
  GitBranch,
  ClipboardCheck,
  TrendingUp,
  Clock,
  RotateCcw
} from "lucide-react"
import {
  MASTER_CURRICULUM_9_COMPONENTS,
  MASTER_INDUSTRY_CATEGORIES,
  BUSINESS_OWNERSHIP_TRACKS,
  PRIORITY_6_CAREER_PATHWAYS,
  ACADEMY_REFERENCE_LIBRARY,
  PriorityCareerPathway,
  PathwayMilestoneUnit,
  CareerSpecGeneratorInput,
  generateDynamicCareerPathway
} from "@/lib/connectln-career-mastery-academy"
import {
  TEN_COMPONENT_PRODUCTION_STANDARD,
  FIVE_PRIORITY_ACADEMIES,
  SpecializedTangibleCareerSpec,
  buildSpecializedCareerPathway
} from "@/lib/connectln-33-specialized-careers"
import {
  ACADEMY_TRAINING_VIDEOS,
  ALL_60_SPECIALIST_CAREER_SPECS,
  ALL_60_SPECIALIST_CAREER_PATHWAYS,
  FIVE_CAREER_SELECTION_CRITERIA,
  AcademyTrainingVideoItem
} from "@/lib/connectln-60-specialist-careers"
import {
  SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY,
  SEMICONDUCTOR_TWELVE_WEEK_SCHEDULE,
  SEMICONDUCTOR_FINAL_QUIZ_10,
  SEMICONDUCTOR_QA_REVIEW_TABLE,
  SEMICONDUCTOR_SAFETY_LEVELS,
  SEMICONDUCTOR_CAREER_PROGRESSION,
  getTrainingImplementationPlanAndWalkthrough
} from "@/lib/connectln-semiconductor-and-walkthroughs"
import {
  WATCH_TELEMETRY_STORAGE_KEY,
  DEFAULT_INITIAL_WATCH_TELEMETRY,
  WatchTelemetryState,
  WatchEventLogItem,
  recordVideoWatchTelemetry,
  computeWatchBasedRecommendations,
  formatWatchDuration
} from "@/lib/connectln-watch-recommendation-engine"
import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

const ConnectLnMultiSignalWorkbenches = dynamic(
  () =>
    import("@/components/linkedin/ConnectLnMultiSignalWorkbenches").then(
      (m) => m.ConnectLnMultiSignalWorkbenches
    ),
  { ssr: false }
)

const ConnectLnChangeProfessionInfrastructure = dynamic(
  () =>
    import("@/components/linkedin/ConnectLnChangeProfessionInfrastructure").then(
      (m) => m.ConnectLnChangeProfessionInfrastructure
    ),
  { ssr: false }
)

interface ConnectLnCareerMasteryAcademyViewProps {
  onClaimCertificate?: (title: string) => void
  initialCareerNumber?: number | null
  initialSubView?: AcademySubView
}

export type AcademySubView =
  | "change_profession"
  | "recommendations"
  | "classroom"
  | "specialist_60"
  | "training_videos_hub"
  | "priority_pathways"
  | "industry_map"
  | "business_and_builder"
  | "passport_and_refs"
  | "all_combined"

export const ALL_7_FLAGSHIP_PATHWAYS: PriorityCareerPathway[] = [
  SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY,
  ...PRIORITY_6_CAREER_PATHWAYS
]

export function ConnectLnCareerMasteryAcademyView({
  onClaimCertificate,
  initialCareerNumber,
  initialSubView
}: ConnectLnCareerMasteryAcademyViewProps) {
  // Top-level UX Sub-View Map (Default to classroom for fast, lightweight initial render)
  const [activeSubView, setActiveSubView] = useState<AcademySubView>(
    initialSubView || "classroom"
  )

  // Global Quick Search across all 60 specialist careers + 108+ industry careers
  const [globalCareerSearch, setGlobalCareerSearch] = useState<string>("")
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false)

  // Active Career Pathway in the 9-Milestone Classroom (Defaults to Flagship #7: Semiconductor Manufacturing Technology)
  const [activePathway, setActivePathway] = useState<PriorityCareerPathway>(
    SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY
  )
  const [activeMilestoneNum, setActiveMilestoneNum] = useState<number>(1)
  const [activeComponentTab, setActiveComponentTab] = useState<
    | "lessons"
    | "worked_lab"
    | "assessment"
    | "rubric_deliverable"
    | "plan_pathway_walkthrough"
    | "training_videos"
  >("lessons")

  // Interactive 6-Step Operational Walkthrough state (per training)
  const [activeWalkthroughStep, setActiveWalkthroughStep] = useState<number>(1)
  const [completedWalkthroughSteps, setCompletedWalkthroughSteps] = useState<
    Record<string, boolean>
  >({})

  // Related Training Videos & Interactive Simulators state
  const [selectedVideo, setSelectedVideo] = useState<AcademyTrainingVideoItem>(
    ACADEMY_TRAINING_VIDEOS[0]
  )

  // Watch-History & Telemetry Recommendation Engine State
  const [watchTelemetry, setWatchTelemetry] = useState<WatchTelemetryState>(
    DEFAULT_INITIAL_WATCH_TELEMETRY
  )
  const [watchToastMessage, setWatchToastMessage] = useState<string | null>(null)
  const lastPlaybackTickRef = useRef<Record<string, number>>({})

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WATCH_TELEMETRY_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.videoWatchSeconds) {
          setWatchTelemetry(parsed)
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    if (initialCareerNumber) {
      const spec = ALL_60_SPECIALIST_CAREER_SPECS.find(
        (c) => c.careerNumber === initialCareerNumber
      )
      if (spec) {
        if (spec.careerNumber === 42) {
          setActivePathway(SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY)
        } else {
          const found = buildSpecializedCareerPathway(spec)
          setActivePathway(found)
        }
        setActiveMilestoneNum(1)
        setActiveComponentTab("plan_pathway_walkthrough")
        setActiveSubView("classroom")
      }
    }
  }, [initialCareerNumber])

  const updateAndPersistWatchTelemetry = (
    updater: (prev: WatchTelemetryState) => WatchTelemetryState
  ) => {
    setWatchTelemetry((prev) => {
      const next = updater(prev)
      try {
        window.localStorage.setItem(
          WATCH_TELEMETRY_STORAGE_KEY,
          JSON.stringify(next)
        )
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  // 60 Specialist Tangible-Competence Careers Explorer Filter State
  const [specialistDomainFilter, setSpecialistDomainFilter] = useState<number | "all">("all")
  const [specialistAcademyFilter, setSpecialistAcademyFilter] = useState<string | "all">("all")
  const [specialistSearchQuery, setSpecialistSearchQuery] = useState<string>("")

  // Semiconductor 10-Question Final Knowledge Check State
  const [semiFinalAnswers, setSemiFinalAnswers] = useState<Record<string, number>>({})
  const [semiFinalSubmitted, setSemiFinalSubmitted] = useState<boolean>(false)

  // Semiconductor Interactive Cleanroom & Metrology Calculator State
  const [semiLambda, setSemiLambda] = useState<number>(0.02)
  const [semiAreaCm2, setSemiAreaCm2] = useState<number>(100)
  const [semiSite1, setSemiSite1] = useState<number>(101)
  const [semiSite2, setSemiSite2] = useState<number>(100)
  const [semiSite3, setSemiSite3] = useState<number>(102)
  const [semiSite4, setSemiSite4] = useState<number>(104)
  const [semiSite5, setSemiSite5] = useState<number>(100)

  // Category filter state
  const [categoryGroupFilter, setCategoryGroupFilter] = useState<
    "all" | "core_categories" | "vibe_differentiators"
  >("all")
  const [selectedCategoryNumber, setSelectedCategoryNumber] = useState<number | "all">("all")

  // Quiz state keyed by `${pathway.id}-m${milestoneNumber}-${questionId}`
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [submittedMilestones, setSubmittedMilestones] = useState<Record<string, boolean>>({})
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({
    "pathway-7-semiconductor-manufacturing-technology-m1": true,
    "pathway-1-app-pentest-m1": true
  })

  // Interactive Lab Simulator States (Live Calculators for Construction, Solar/Microgrid, PLC, and Security/AI)
  const [slabLengthM, setSlabLengthM] = useState<number>(12)
  const [slabWidthM, setSlabWidthM] = useState<number>(8)
  const [slabThickM, setSlabThickM] = useState<number>(0.15)
  const [slabWastePct, setSlabWastePct] = useState<number>(8)
  const [drawingMmInput, setDrawingMmInput] = useState<number>(60)
  const [drawingScaleFactor, setDrawingScaleFactor] = useState<number>(50)

  // 2. Solar & Microgrid Calculator State
  const [mgHouseholds, setMgHouseholds] = useState<number>(1000)
  const [mgKwhPerDay, setMgKwhPerDay] = useState<number>(10)
  const [mgSunHours, setMgSunHours] = useState<number>(5)
  const [mgPerfRatio, setMgPerfRatio] = useState<number>(0.8)
  const [mgOutageDays, setMgOutageDays] = useState<number>(2)
  const [mgDod, setMgDod] = useState<number>(0.8)
  const [mgEfficiency, setMgEfficiency] = useState<number>(0.9)

  // 3. PLC Boolean Conveyor Simulator State
  const [plcAutoMode, setPlcAutoMode] = useState<boolean>(true)
  const [plcStartCmd, setPlcStartCmd] = useState<boolean>(false)
  const [plcStopCmd, setPlcStopCmd] = useState<boolean>(false)
  const [plcPermissives, setPlcPermissives] = useState<boolean>(true)
  const [plcFaultLatched, setPlcFaultLatched] = useState<boolean>(false)
  const [plcRunSealIn, setPlcRunSealIn] = useState<boolean>(false)

  // 4. Interactive Lab Task Checkboxes
  const [checkedLabTasks, setCheckedLabTasks] = useState<Record<string, boolean>>({})

  // 10-Page Technical Learning Guide Modal State
  const [whitePaperModalOpen, setWhitePaperModalOpen] = useState<boolean>(false)
  const [activeWpPage, setActiveWpPage] = useState<number>(1)
  const [wpContinuousScroll, setWpContinuousScroll] = useState<boolean>(false)

  // Career-Path Specification Generator State (Vibe Career Pathway Generator)
  const [specCareerTitle, setSpecCareerTitle] = useState<string>(
    "Semiconductor Manufacturing Technology"
  )
  const [specCategoryTitle, setSpecCategoryTitle] = useState<string>(
    "10. Semiconductor manufacturing and advanced materials"
  )
  const [specLearnerLevel, setSpecLearnerLevel] = useState<
    CareerSpecGeneratorInput["learnerLevel"]
  >("Beginner to advanced")
  const [specDuration, setSpecDuration] = useState<
    CareerSpecGeneratorInput["programDuration"]
  >("12 weeks — intensive pathway")
  const [specDelivery, setSpecDelivery] = useState<
    CareerSpecGeneratorInput["deliveryMethod"]
  >("Hybrid: online and hands-on")
  const [specOutcome, setSpecOutcome] = useState<
    CareerSpecGeneratorInput["targetOutcome"]
  >("Job readiness and professional portfolio")
  const [generatedBriefToast, setGeneratedBriefToast] = useState<string | null>(null)

  // AI Career Tutor interactive prompt state
  const [tutorQuestion, setTutorQuestion] = useState<string>("")
  const [tutorResponse, setTutorResponse] = useState<string | null>(null)

  const topMapRef = useRef<HTMLDivElement | null>(null)
  const classroomRef = useRef<HTMLDivElement | null>(null)
  const recommendationsRef = useRef<HTMLDivElement | null>(null)

  // Compute Watch-History & Telemetry-Driven Recommendations in Real Time
  const watchRecommendations = useMemo(
    () => computeWatchBasedRecommendations(watchTelemetry, ALL_7_FLAGSHIP_PATHWAYS),
    [watchTelemetry]
  )

  const handleVideoPlayTelemetry = (vid: AcademyTrainingVideoItem) => {
    lastPlaybackTickRef.current[vid.id] = 0
    updateAndPersistWatchTelemetry((prev) =>
      recordVideoWatchTelemetry(prev, vid, 15, "live_playback", true)
    )
  }

  const handleVideoTimeUpdateTelemetry = (
    vid: AcademyTrainingVideoItem,
    currentTimeSec: number
  ) => {
    const prevTick = lastPlaybackTickRef.current[vid.id] || 0
    const delta = currentTimeSec - prevTick
    if (delta >= 5) {
      lastPlaybackTickRef.current[vid.id] = currentTimeSec
      updateAndPersistWatchTelemetry((prev) =>
        recordVideoWatchTelemetry(
          prev,
          vid,
          Math.min(30, Math.round(delta)),
          "live_playback",
          false
        )
      )
    } else if (delta < 0) {
      lastPlaybackTickRef.current[vid.id] = currentTimeSec
    }
  }

  const handleBoostVideoWatchTime = (
    vid: AcademyTrainingVideoItem,
    secondsToAdd = 300,
    source: WatchEventLogItem["source"] = "watch_simulator"
  ) => {
    updateAndPersistWatchTelemetry((prev) =>
      recordVideoWatchTelemetry(prev, vid, secondsToAdd, source, true)
    )
    setWatchToastMessage(
      `+${formatWatchDuration(secondsToAdd)} watch time logged on "${vid.careerTitle}" (${vid.domainTitle}) — Recommendations re-ranked in real time!`
    )
    setTimeout(() => {
      setWatchToastMessage(null)
    }, 4500)
  }

  const handleResetWatchTelemetry = () => {
    setWatchTelemetry(DEFAULT_INITIAL_WATCH_TELEMETRY)
    try {
      window.localStorage.setItem(
        WATCH_TELEMETRY_STORAGE_KEY,
        JSON.stringify(DEFAULT_INITIAL_WATCH_TELEMETRY)
      )
    } catch {
      // ignore storage errors
    }
    setWatchToastMessage(
      "Watch telemetry reset to baseline profile — Recommendations updated."
    )
    setTimeout(() => {
      setWatchToastMessage(null)
    }, 3500)
  }

  const handleWatchRecommendedVideoInClassroom = (vid: AcademyTrainingVideoItem) => {
    setSelectedVideo(vid)
    updateAndPersistWatchTelemetry((prev) =>
      recordVideoWatchTelemetry(prev, vid, 45, "live_playback", true)
    )
    const spec = ALL_60_SPECIALIST_CAREER_SPECS.find(
      (s) => s.careerNumber === vid.careerNumber
    )
    if (spec) {
      if (spec.careerNumber === 42) {
        selectPathwayAndOpenClassroom(
          SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY,
          1,
          "training_videos"
        )
        return
      }
      const found =
        ALL_60_SPECIALIST_CAREER_PATHWAYS.find((p) => p.id === spec.id) ||
        buildSpecializedCareerPathway(spec)
      selectPathwayAndOpenClassroom(found, 1, "training_videos")
      return
    }
    selectPathwayAndOpenClassroom(activePathway, 1, "training_videos")
  }

  // Find matching Specialist Career Spec (#1–#60) if activePathway corresponds to one
  const activeSpecialistSpec: SpecializedTangibleCareerSpec | undefined = useMemo(() => {
    if (activePathway.id === "pathway-7-semiconductor-manufacturing-technology") {
      return ALL_60_SPECIALIST_CAREER_SPECS.find((s) => s.careerNumber === 42)
    }
    return ALL_60_SPECIALIST_CAREER_SPECS.find(
      (s) =>
        s.id === activePathway.id ||
        activePathway.title.toLowerCase().includes(s.title.toLowerCase())
    )
  }, [activePathway])

  // Compute Implementation Plan, 5-Stage Career Pathway & 6-Step Operational Walkthrough FOR EACH TRAINING
  const activeTrainingPlanAndWalkthrough = useMemo(
    () => getTrainingImplementationPlanAndWalkthrough(activePathway, activeSpecialistSpec),
    [activePathway, activeSpecialistSpec]
  )

  // Flatten all 60 Specialist Careers + 108+ Industry Careers for instant global search
  const allSearchableCareers = useMemo(() => {
    const list: {
      careerTitle: string
      categoryTitle: string
      categoryNumber: number
      specialistSpec?: SpecializedTangibleCareerSpec
    }[] = []
    ALL_60_SPECIALIST_CAREER_SPECS.forEach((spec) => {
      list.push({
        careerTitle: `#${spec.careerNumber} ${spec.title}`,
        categoryTitle: spec.domainTitle,
        categoryNumber: spec.domainNumber,
        specialistSpec: spec
      })
    })
    MASTER_INDUSTRY_CATEGORIES.forEach((cat) => {
      cat.careers.forEach((c) => {
        list.push({
          careerTitle: c,
          categoryTitle: cat.title,
          categoryNumber: cat.categoryNumber
        })
      })
    })
    return list
  }, [])

  const matchingSearchCareers = useMemo(() => {
    const q = globalCareerSearch.trim().toLowerCase()
    if (!q) return allSearchableCareers.slice(0, 14)
    return allSearchableCareers.filter(
      (item) =>
        item.careerTitle.toLowerCase().includes(q) ||
        item.categoryTitle.toLowerCase().includes(q)
    )
  }, [globalCareerSearch, allSearchableCareers])

  // Filtered 60 Specialist Careers
  const filtered60SpecialistSpecs = useMemo(() => {
    const q = specialistSearchQuery.trim().toLowerCase()
    return ALL_60_SPECIALIST_CAREER_SPECS.filter((spec) => {
      const matchDomain =
        specialistDomainFilter === "all" || spec.domainNumber === specialistDomainFilter
      const matchAcademy =
        specialistAcademyFilter === "all" || spec.academyId === specialistAcademyFilter
      const matchText =
        !q ||
        spec.title.toLowerCase().includes(q) ||
        spec.domainTitle.toLowerCase().includes(q) ||
        spec.tangibleEvidenceType.toLowerCase().includes(q) ||
        spec.capstoneProject.toLowerCase().includes(q)
      return matchDomain && matchAcademy && matchText
    })
  }, [specialistDomainFilter, specialistAcademyFilter, specialistSearchQuery])

  const activeMilestone: PathwayMilestoneUnit =
    activePathway.milestones.find((m) => m.milestoneNumber === activeMilestoneNum) ||
    activePathway.milestones[0]

  const selectPathwayAndOpenClassroom = (
    pathway: PriorityCareerPathway,
    milestone = 1,
    tab:
      | "lessons"
      | "worked_lab"
      | "assessment"
      | "rubric_deliverable"
      | "plan_pathway_walkthrough"
      | "training_videos" = "lessons"
  ) => {
    setActivePathway(pathway)
    setActiveMilestoneNum(milestone)
    setActiveComponentTab(tab)
    setActiveWalkthroughStep(1)
    if (activeSubView !== "all_combined") {
      setActiveSubView("classroom")
    }
    setShowSearchDropdown(false)
    setTimeout(() => {
      classroomRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 60)
  }

  const handleLoadSpecialistCareer = (
    spec: SpecializedTangibleCareerSpec,
    openTab:
      | "lessons"
      | "plan_pathway_walkthrough"
      | "worked_lab" = "lessons"
  ) => {
    const linkedVid = ACADEMY_TRAINING_VIDEOS.find(
      (v) => v.careerNumber === spec.careerNumber || v.domainNumber === spec.domainNumber
    )
    if (linkedVid) {
      updateAndPersistWatchTelemetry((prev) =>
        recordVideoWatchTelemetry(prev, linkedVid, 30, "pathway_study", false)
      )
    }
    if (spec.careerNumber === 42) {
      selectPathwayAndOpenClassroom(
        SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY,
        1,
        openTab
      )
      return
    }
    const found =
      ALL_60_SPECIALIST_CAREER_PATHWAYS.find((p) => p.id === spec.id) ||
      buildSpecializedCareerPathway(spec)
    selectPathwayAndOpenClassroom(found, 1, openTab)
  }

  const handleLoadCareerFromCatalog = (
    careerTitle: string,
    categoryTitle: string,
    outcomeOverride?: CareerSpecGeneratorInput["targetOutcome"],
    openTab: "lessons" | "plan_pathway_walkthrough" = "lessons"
  ) => {
    const matchingSpec = ALL_60_SPECIALIST_CAREER_SPECS.find(
      (s) =>
        careerTitle.toLowerCase().includes(s.title.toLowerCase()) ||
        s.title.toLowerCase().includes(careerTitle.toLowerCase())
    )
    if (matchingSpec) {
      handleLoadSpecialistCareer(matchingSpec, openTab)
      return
    }
    const generated = generateDynamicCareerPathway({
      careerTitle,
      categoryTitle,
      learnerLevel: specLearnerLevel,
      programDuration: specDuration,
      deliveryMethod: specDelivery,
      targetOutcome: outcomeOverride || specOutcome
    })
    selectPathwayAndOpenClassroom(generated, 1, openTab)
  }

  const handleGenerateCustomCareerSpec = () => {
    const matchingSpec = ALL_60_SPECIALIST_CAREER_SPECS.find(
      (s) =>
        specCareerTitle.toLowerCase().includes(s.title.toLowerCase()) ||
        s.title.toLowerCase().includes(specCareerTitle.toLowerCase())
    )
    if (matchingSpec) {
      setGeneratedBriefToast(
        `Loaded Full 9-Milestone Curriculum, Implementation Plan & Operational Walkthrough for "#${matchingSpec.careerNumber} ${matchingSpec.title}".`
      )
      handleLoadSpecialistCareer(matchingSpec, "lessons")
      return
    }
    const generated = generateDynamicCareerPathway({
      careerTitle: specCareerTitle.trim() || "Custom Technical Specialist",
      categoryTitle: specCategoryTitle,
      learnerLevel: specLearnerLevel,
      programDuration: specDuration,
      deliveryMethod: specDelivery,
      targetOutcome: specOutcome
    })
    setGeneratedBriefToast(
      `Generated 9-Milestone Curriculum, Implementation Plan & Operational Walkthrough for "${generated.title}" (${specDuration} · ${specDelivery}).`
    )
    selectPathwayAndOpenClassroom(generated, 1, "lessons")
  }

  const handleDownloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadCareerSpecBrief = () => {
    const md = `# Career-Path Curriculum Specification Brief\n\n- **Career or Specialization**: ${activePathway.title}\n- **Category**: ${activePathway.categoryTitle}\n- **Learner Level**: ${activePathway.level}\n- **Program Duration**: ${activePathway.suggestedDuration}\n- **Delivery Method**: ${activePathway.deliveryFormat}\n- **Capstone Requirement**: ${activePathway.capstoneSummary}\n- **Regulatory & Licensure Notice**: ${activePathway.safetyOrRegulatoryNotice}\n\n## 9-Milestone Progression Blueprint\n${activePathway.milestones
      .map(
        (m) =>
          `### Milestone ${m.milestoneNumber}: ${m.title}\n- **Summary**: ${m.summary}\n- **Objectives**: ${m.learningObjectives.join("; ")}\n- **Practical Lab**: ${m.practicalLab.title}\n- **Deliverable**: ${m.professionalDeliverable.title}\n`
      )
      .join("\n")}\n\n## Authoritative References\n${activePathway.principalReferences
      .map((r) => `- **${r.title}** (${r.organization}): ${r.url}`)
      .join("\n")}\n`
    handleDownloadTextFile(
      `${activePathway.id}-curriculum-specification.md`,
      md
    )
  }

  // Calculate quiz score for active milestone
  const milestoneQuizKey = `${activePathway.id}-m${activeMilestone.milestoneNumber}`
  const questions = activeMilestone.assessmentQuestions
  const correctCount = questions.reduce((acc, q) => {
    const k = `${milestoneQuizKey}-${q.id}`
    return selectedAnswers[k] === q.correctIndex ? acc + 1 : acc
  }, 0)
  const scorePercent =
    questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100
  const isQuizSubmitted = !!submittedMilestones[milestoneQuizKey]

  const handleGradeQuiz = () => {
    setSubmittedMilestones((prev) => ({ ...prev, [milestoneQuizKey]: true }))
    if (scorePercent >= 80) {
      setCompletedMilestones((prev) => ({ ...prev, [milestoneQuizKey]: true }))
      if (onClaimCertificate) {
        onClaimCertificate(
          `${activePathway.title} — Milestone ${activeMilestone.milestoneNumber}: ${activeMilestone.title}`
        )
      }
    }
  }

  const handleAskTutor = (presetPrompt?: string) => {
    const q = (presetPrompt || tutorQuestion).trim()
    if (!q) return
    setTutorQuestion(q)
    const refList = activePathway.principalReferences
      .map((r) => `${r.title} (${r.url})`)
      .join(" and ")
    setTutorResponse(
      `Grounded Tutor Response for [${activePathway.title} · Milestone ${activeMilestone.milestoneNumber}: ${activeMilestone.title}]:\n\n` +
        `1. Core Concept & Worked Application: ${activeMilestone.workedExample.engineeringConclusion}\n` +
        `2. Practical Lab Rubric Check: Ensure your submission (${activeMilestone.professionalDeliverable.title}) explicitly documents scope assumptions, unit-checked calculations or reproducible sandbox traces, and escalates any missing data formally rather than guessing.\n` +
        `3. Verified Authoritative Sources: Consult ${refList} for primary technical standards. Remember that platform rubrics measure task execution in this training module and are distinct from statutory licensure.`
    )
  }

  // Live Calculator Computations
  const realMetersFromScale = (drawingMmInput * drawingScaleFactor) / 1000
  const slabTheoreticalVol = Number(
    (slabLengthM * slabWidthM * slabThickM).toFixed(2)
  )
  const slabGrossVolWithWaste = Number(
    (slabTheoreticalVol * (1 + slabWastePct / 100)).toFixed(2)
  )

  const mgDailyEnergyKwh = mgHouseholds * mgKwhPerDay
  const mgDailyEnergyMwh = Number((mgDailyEnergyKwh / 1000).toFixed(2))
  const mgSolarKw = Number(
    (mgDailyEnergyKwh / (mgSunHours * mgPerfRatio)).toFixed(1)
  )
  const mgSolarMw = Number((mgSolarKw / 1000).toFixed(2))
  const mgDeliveredOutageMwh = Number((mgDailyEnergyMwh * mgOutageDays).toFixed(2))
  const mgBatteryNominalMwh = Number(
    (mgDeliveredOutageMwh / (mgDod * mgEfficiency)).toFixed(2)
  )

  // PLC Boolean Scan Evaluation (Stop-dominant seal-in logic)
  const effectivePlcRun =
    plcAutoMode &&
    (plcStartCmd || plcRunSealIn) &&
    !plcStopCmd &&
    plcPermissives &&
    !plcFaultLatched

  const filteredCategories = MASTER_INDUSTRY_CATEGORIES.filter((cat) => {
    const matchGroup =
      categoryGroupFilter === "all" ? true : cat.groupLabel === categoryGroupFilter
    const matchNum =
      selectedCategoryNumber === "all"
        ? true
        : cat.categoryNumber === selectedCategoryNumber
    return matchGroup && matchNum
  })

  const completedMilestoneCount = activePathway.milestones.filter(
    (m) => completedMilestones[`${activePathway.id}-m${m.milestoneNumber}`]
  ).length

  return (
    <div ref={topMapRef} className="space-y-6">
      {/* ===================================================================== */}
      {/* STICKY INTERACTIVE UX COMMAND BAR & STEP-BY-STEP ACADEMY NAVIGATOR    */}
      {/* ===================================================================== */}
      <div className="sticky top-2 z-30 rounded-2xl border-2 border-[#0A66C2]/40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3.5 sm:p-4 shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Brand + Active Pathway Pill */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="rounded-xl bg-gradient-to-r from-[#0A66C2] to-indigo-600 text-white px-3 py-1.5 text-xs font-black flex items-center gap-1.5 shadow-xs">
              <GraduationCap className="h-4 w-4 text-amber-300" />
              <span>Career Mastery Academy</span>
            </span>
            <div className="flex items-center gap-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700">
              <span className="text-zinc-500 dark:text-zinc-400">Active Career:</span>
              <strong className="text-zinc-900 dark:text-white">
                {activePathway.title}
              </strong>
              <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-mono font-bold">
                M0{activeMilestone.milestoneNumber}/09
              </span>
            </div>
          </div>

          {/* Instant 108-Career Search & Quick Switcher */}
          <div className="relative flex-1 max-w-md">
            <div className="flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/90 px-3 py-1.5">
              <Search className="h-4 w-4 text-[#0A66C2] mr-2 shrink-0" />
              <input
                type="text"
                value={globalCareerSearch}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setGlobalCareerSearch(e.target.value)
                  setShowSearchDropdown(true)
                }}
                placeholder="Quick-jump any of 108+ careers (e.g. Timber, Pentest, Solar, PLC, RAG)..."
                className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />
              {globalCareerSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalCareerSearch("")
                    setShowSearchDropdown(false)
                  }}
                  className="text-[11px] font-bold text-zinc-400 hover:text-zinc-600 ml-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl p-2 z-50 space-y-1">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase text-zinc-400">
                  <span>
                    {matchingSearchCareers.length} Matching Careers — Click to Load 9 Milestones
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSearchDropdown(false)}
                    className="text-zinc-500 hover:text-zinc-800 cursor-pointer"
                  >
                    Close ✕
                  </button>
                </div>
                {matchingSearchCareers.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      handleLoadCareerFromCatalog(
                        item.careerTitle,
                        item.categoryTitle
                      )
                    }
                    className="w-full rounded-xl px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-sky-950/40 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.careerTitle}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        Category {item.categoryNumber}: {item.categoryTitle}
                      </p>
                    </div>
                    <span className="rounded-lg bg-[#0A66C2] text-white px-2 py-0.5 text-[10px] font-bold shrink-0">
                      Open 9 Milestones →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visual Navigation Map Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          {[
            {
              id: "change_profession",
              step: "Mobility",
              label: "🔄 Change or Upgrade Profession (Vibe AI)",
              badge: "Grade & Pivot",
              icon: GitBranch
            },
            {
              id: "recommendations",
              step: "Recommended",
              label: "🎯 Recommended For You (Most Watched)",
              badge: watchRecommendations.totalWatchFormatted,
              icon: TrendingUp
            },
            {
              id: "classroom",
              step: "Step 1",
              label: "Active 9-Milestone Classroom",
              badge: `M${activeMilestone.milestoneNumber}`,
              icon: BookOpen
            },
            {
              id: "specialist_60",
              step: "Step 2",
              label: "60 Specialist Tangible Careers (#1–#60)",
              badge: "14 Domains",
              icon: Cpu
            },
            {
              id: "training_videos_hub",
              step: "Step 3",
              label: "Related Training Videos & Simulators",
              badge: `${ACADEMY_TRAINING_VIDEOS.length} Videos`,
              icon: Video
            },
            {
              id: "priority_pathways",
              step: "Step 4",
              label: "7 Flagship Launch Pathways",
              badge: "7 Flagships",
              icon: Rocket
            },
            {
              id: "industry_map",
              step: "Step 5",
              label: "13 Industry Categories (108+ Careers)",
              badge: "13 Industries",
              icon: Map
            },
            {
              id: "business_and_builder",
              step: "Step 6",
              label: "Business Ownership & Vibe Generator",
              badge: "AI Builder",
              icon: Briefcase
            },
            {
              id: "passport_and_refs",
              step: "Step 7",
              label: "Skill Passport & Reference Library",
              badge: `${completedMilestoneCount}/9 Done`,
              icon: FolderCheck
            },
            {
              id: "all_combined",
              step: "All",
              label: "Full Single-Page View",
              badge: "Everything",
              icon: Layers
            }
          ].map((nav) => {
            const Icon = nav.icon
            const isActive = activeSubView === nav.id
            const isRec = nav.id === "recommendations"
            const isMobility = nav.id === "change_profession"
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveSubView(nav.id as AcademySubView)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? "bg-[#0A66C2] text-white border-[#0A66C2] shadow-sm"
                    : isMobility
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-400/80 hover:border-emerald-500"
                    : isRec
                    ? "bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-400/70 hover:border-amber-500"
                    : "bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700 hover:border-[#0A66C2]"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{nav.label}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isMobility
                      ? "bg-emerald-600 text-white font-black"
                      : isRec
                      ? "bg-amber-500 text-slate-950 font-black"
                      : "bg-zinc-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {nav.badge}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* QUICK 7 FLAGSHIP PATHWAYS RIBBON (INCLUDING SEMICONDUCTOR #7)         */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Rocket className="h-3.5 w-3.5 text-amber-500" />
            1-Click Switch Between the 7 Flagship Pathways (Each Includes Full 9 Milestones + Implementation Plan, Career Pathway &amp; Operational Walkthrough):
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                selectPathwayAndOpenClassroom(
                  activePathway,
                  activeMilestone.milestoneNumber,
                  "plan_pathway_walkthrough"
                )
              }
              className="text-xs font-black text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              🗺️ Open Active Training Implementation Plan &amp; Walkthrough →
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView("specialist_60")}
              className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
            >
              Explore All 60 Specialist Careers (#1–#60) →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {ALL_7_FLAGSHIP_PATHWAYS.map((pathway) => {
            const isSelected = activePathway.id === pathway.id
            const isSemi = pathway.id === "pathway-7-semiconductor-manufacturing-technology"
            return (
              <div
                key={pathway.id}
                className={`rounded-xl p-2.5 text-left border transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "border-[#0A66C2] bg-blue-50/70 dark:bg-sky-950/40 ring-2 ring-[#0A66C2]/25"
                    : isSemi
                    ? "border-amber-400/70 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-indigo-400"
                }`}
              >
                <div
                  onClick={() => selectPathwayAndOpenClassroom(pathway, 1, "lessons")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-black ${
                        isSemi
                          ? "bg-amber-500 text-slate-950"
                          : "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {isSemi ? "NEW FLAGSHIP #7" : `Priority #${pathway.priorityRank}`}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-[#0A66C2]" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                    {pathway.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => selectPathwayAndOpenClassroom(pathway, 1, "lessons")}
                    className="flex-1 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white py-1 px-1.5 text-[10px] font-bold cursor-pointer text-center"
                  >
                    Classroom
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      selectPathwayAndOpenClassroom(
                        pathway,
                        1,
                        "plan_pathway_walkthrough"
                      )
                    }
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-1.5 text-[10px] font-bold cursor-pointer"
                    title="Open Implementation Plan, Career Pathway & Operational Walkthrough"
                  >
                    Plan &amp; Map
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 0A: CHANGE OR UPGRADE PROFESSION — VIBE AI DECISION ENGINE       */}
      {/* ===================================================================== */}
      {(activeSubView === "change_profession" || activeSubView === "all_combined") && (
        <ConnectLnChangeProfessionInfrastructure
          onLaunchTargetCareerInClassroom={(pathway, _spec, preferredTab) =>
            selectPathwayAndOpenClassroom(pathway, 1, preferredTab || "lessons")
          }
          onClaimCertificate={onClaimCertificate}
        />
      )}

      {/* ===================================================================== */}
      {/* VIEW 0: WATCH-HISTORY & TELEMETRY-DRIVEN RECOMMENDATION SYSTEM        */}
      {/* ("RECOMMENDED FOR YOU — BASED ON WHAT YOU WATCH MOST")                */}
      {/* ===================================================================== */}
      {(activeSubView === "recommendations" || activeSubView === "all_combined") && (
        <div
          ref={recommendationsRef}
          className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-5 sm:p-6 text-white shadow-xl space-y-6"
        >
          {/* Top Recommendation Engine Header & Live Telemetry KPIs */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/15 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-amber-500 text-slate-950 px-3 py-0.5 text-xs font-black flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  PERSONALIZED WATCH-HISTORY RECOMMENDATION ENGINE
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-300">
                  ● LIVE VIDEO TELEMETRY ACTIVE
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Recommended For You — Dynamically Ranked Based on What You Watch Most
              </h3>
              <p className="text-xs text-sky-100/90 max-w-4xl leading-relaxed">
                Every second you watch a training video (or simulate watch time below), this engine computes real-time domain affinity scores across all <strong>12 Technical Training Videos</strong>, <strong>60 Specialist Tangible-Competence Careers (#1–#60)</strong>, and <strong>7 Flagship Launch Pathways</strong>, surfacing your highest-match next videos, 9-milestone curricula, and implementation walkthroughs.
              </p>
            </div>

            {/* Live Watch Telemetry Summary Pill Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
              <div className="rounded-2xl bg-white/10 border border-white/15 p-3">
                <div className="text-[10px] font-mono uppercase text-sky-300 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Total Watch Time
                </div>
                <div className="text-base sm:text-lg font-black text-amber-300 mt-0.5">
                  {watchRecommendations.totalWatchFormatted}
                </div>
                <div className="text-[10px] text-sky-100/80 truncate">
                  Tracked across {ACADEMY_TRAINING_VIDEOS.length} lab videos
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/15 p-3">
                <div className="text-[10px] font-mono uppercase text-emerald-300">
                  #1 Most-Watched Domain
                </div>
                <div className="text-xs sm:text-sm font-black text-white line-clamp-1 mt-0.5">
                  {watchRecommendations.topWatchedDomain?.domainTitle}
                </div>
                <div className="text-[10px] text-emerald-300 font-mono">
                  {watchRecommendations.topWatchedDomain?.watchedFormatted} (
                  {watchRecommendations.topWatchedDomain?.sharePercent}% share)
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/10 border border-white/15 p-3">
                <div className="text-[10px] font-mono uppercase text-amber-300">
                  #1 Most-Watched Video
                </div>
                <div className="text-xs font-black text-white line-clamp-1 mt-0.5">
                  {watchRecommendations.topWatchedVideo.careerTitle}
                </div>
                <div className="text-[10px] text-sky-200 font-mono">
                  Career #{watchRecommendations.topWatchedVideo.careerNumber} ·{" "}
                  {
                    watchRecommendations.topWatchedVideosLeaderboard[0]
                      ?.watchedFormatted
                  }{" "}
                  watched
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Watch-Signal Simulator Bar (Test Recommendations Live!) */}
          <div className="rounded-2xl bg-slate-900/90 border border-white/15 p-4 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-200">
                  INTERACTIVE WATCH-SIGNAL SIMULATOR
                </span>
                <span className="text-xs font-bold text-white">
                  Click any topic below to simulate +5 Minutes of video watch time &amp; watch your recommendations re-rank live:
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetWatchTelemetry}
                className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-[11px] font-bold text-sky-200 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Watch Baseline
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {ACADEMY_TRAINING_VIDEOS.slice(0, 8).map((vid) => {
                const watchedSec = watchTelemetry.videoWatchSeconds[vid.id] || 0
                const isTop =
                  watchRecommendations.topWatchedVideo.id === vid.id
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => handleBoostVideoWatchTime(vid, 300)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isTop
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                        : "bg-white/10 hover:bg-white/20 text-white border-white/15"
                    }`}
                  >
                    <span>+5m: {vid.careerTitle}</span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                        isTop
                          ? "bg-slate-950/20 text-slate-950 font-black"
                          : "bg-black/40 text-amber-300"
                      }`}
                    >
                      {formatWatchDuration(watchedSec)}
                    </span>
                  </button>
                )
              })}
            </div>

            {watchToastMessage && (
              <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/50 px-3.5 py-2 text-xs font-bold text-emerald-200 flex items-center justify-between">
                <span>✓ {watchToastMessage}</span>
                <button
                  type="button"
                  onClick={() => setWatchToastMessage(null)}
                  className="text-[11px] underline ml-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* SECTION A: RECOMMENDED TRAINING VIDEOS ("BECAUSE YOU WATCHED MOST") */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                  1 · Video Recommendations Ranked by Watch-Time Affinity
                </span>
                <h4 className="text-base sm:text-lg font-black text-white">
                  Recommended Training Videos &amp; Visual Walkthroughs For You
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubView("training_videos_hub")}
                className="text-xs font-bold text-amber-300 hover:underline cursor-pointer self-start sm:self-auto"
              >
                Open Full 12-Video Training Hub →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchRecommendations.recommendedNextVideos
                .slice(0, 6)
                .map((rec, idx) => {
                  const vid = rec.video
                  const matchingSpec = ALL_60_SPECIALIST_CAREER_SPECS.find(
                    (s) => s.careerNumber === vid.careerNumber
                  )
                  return (
                    <div
                      key={vid.id}
                      className={`rounded-2xl p-4 flex flex-col justify-between gap-3 border transition-all ${
                        idx === 0
                          ? "bg-amber-500/15 border-amber-400/80 ring-2 ring-amber-400/30"
                          : "bg-white/5 hover:bg-white/10 border-white/15"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="rounded-full bg-emerald-500 text-slate-950 px-2.5 py-0.5 text-[11px] font-mono font-black">
                            {rec.matchPercent}% Match
                          </span>
                          <span className="rounded-full bg-white/15 text-amber-200 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                            {rec.recommendationTag}
                          </span>
                        </div>

                        <div className="rounded-xl bg-slate-950/75 border border-amber-400/30 px-3 py-2 text-[11px] text-amber-200 font-medium">
                          <strong className="text-amber-400">Why Recommended:</strong>{" "}
                          {rec.becauseYouWatchedReason}
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-sky-300 uppercase">
                            Career #{vid.careerNumber} · {vid.domainTitle}
                          </span>
                          <h5 className="text-sm sm:text-base font-black text-white mt-0.5 line-clamp-2">
                            {vid.title}
                          </h5>
                        </div>

                        <p className="text-xs text-sky-100/80 line-clamp-2">
                          {vid.summary}
                        </p>

                        {/* Watch Time Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-sky-200">
                            <span>
                              Watched: <strong>{rec.watchedFormatted}</strong> /{" "}
                              {vid.duration}
                            </span>
                            <span>
                              {rec.playCount} play{rec.playCount === 1 ? "" : "s"} ·{" "}
                              {rec.watchSharePercent}% share
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                              style={{
                                width: `${Math.max(8, rec.completionPercent)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() =>
                            handleWatchRecommendedVideoInClassroom(vid)
                          }
                          className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 px-2 text-[11px] font-black cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          Watch Now
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBoostVideoWatchTime(vid, 300)}
                          className="rounded-xl bg-white/10 hover:bg-white/20 text-white py-2 px-2 text-[11px] font-bold cursor-pointer text-center border border-white/15"
                        >
                          +5m Watch
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (matchingSpec) {
                              handleLoadSpecialistCareer(
                                matchingSpec,
                                "plan_pathway_walkthrough"
                              )
                            }
                          }}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-2 text-[11px] font-black cursor-pointer text-center"
                        >
                          🗺️ Plan
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* SECTION B: RECOMMENDED SPECIALIST CAREER PATHWAYS (#1–#60) & WALKTHROUGHS */}
          <div className="space-y-3 pt-2 border-t border-white/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  2 · Career Pathway &amp; Walkthrough Recommendations (From All 60 Specialist Careers)
                </span>
                <h4 className="text-base sm:text-lg font-black text-white">
                  Top 6 Specialist Career Pathways &amp; Implementation Walkthroughs Matched to Your Watch History
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubView("specialist_60")}
                className="text-xs font-bold text-emerald-300 hover:underline cursor-pointer self-start sm:self-auto"
              >
                Browse All 60 Specialist Careers (#1–#60) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchRecommendations.recommendedSpecialistCareers
                .slice(0, 6)
                .map((recCareer) => {
                  const { spec } = recCareer
                  return (
                    <div
                      key={spec.id}
                      className="rounded-2xl bg-slate-900/90 border border-white/15 hover:border-amber-400/70 p-4 flex flex-col justify-between gap-3 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-mono font-black">
                              Rank #{recCareer.rank} · {recCareer.matchPercent}% Match
                            </span>
                            <span className="rounded-full bg-[#0A66C2] text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                              Career #{spec.careerNumber}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-sky-300">
                            {recCareer.watchedFormattedInDomain} in domain
                          </span>
                        </div>

                        <h5 className="text-sm sm:text-base font-black text-white">
                          {spec.title}
                        </h5>

                        <div className="rounded-xl bg-indigo-950/70 border border-indigo-400/30 p-2.5 text-[11px] text-indigo-200">
                          <strong className="text-amber-300">
                            Why Recommended:
                          </strong>{" "}
                          {recCareer.becauseYouWatchedReason}
                        </div>

                        <p className="text-[11px] text-sky-100/90">
                          <strong className="text-emerald-300">
                            Tangible Portfolio Artifact:
                          </strong>{" "}
                          {spec.tangibleEvidenceType}
                        </p>

                        <div className="rounded-xl bg-black/50 border border-white/10 p-2 font-mono text-[10px] text-emerald-300 line-clamp-1">
                          📐 {spec.workedFormulaEquations[0]}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() =>
                            handleLoadSpecialistCareer(spec, "lessons")
                          }
                          className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white py-2 px-2.5 text-xs font-black cursor-pointer text-center"
                        >
                          Open 9 Milestones →
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleLoadSpecialistCareer(
                              spec,
                              "plan_pathway_walkthrough"
                            )
                          }
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-2.5 text-xs font-black cursor-pointer text-center"
                        >
                          🗺️ Plan &amp; Walkthrough
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* SECTION C: DOMAIN WATCH-TIME AFFINITY BREAKDOWN & LIVE TELEMETRY LOG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 border-t border-white/15">
            {/* Left 7 Cols: Top Watched Technical Domains Breakdown */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-white/15 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Your Watch-Time Distribution Across Technical Domains
                </span>
                <span className="text-[11px] font-mono text-sky-300">
                  Total: {watchRecommendations.totalWatchFormatted}
                </span>
              </div>

              <div className="space-y-2.5">
                {watchRecommendations.domainAffinityRanking
                  .slice(0, 6)
                  .map((dom) => (
                    <div key={dom.domainNumber} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setSpecialistDomainFilter(dom.domainNumber)
                            setActiveSubView("specialist_60")
                          }}
                          className="font-bold text-white hover:text-amber-300 text-left cursor-pointer"
                        >
                          {dom.domainTitle}{" "}
                          <span className="text-[10px] text-sky-300 font-normal">
                            ({dom.careerCount} careers)
                          </span>
                        </button>
                        <span className="font-mono text-[11px] text-emerald-300 shrink-0">
                          {dom.watchedFormatted} ({dom.sharePercent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400 transition-all duration-300"
                          style={{
                            width: `${Math.max(4, dom.sharePercent)}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right 5 Cols: Recent Watch-Telemetry Event Stream */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-white/15 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Live Watch-History Telemetry Log
                </span>
                <span className="text-[10px] font-mono text-sky-300">
                  Real-time signals
                </span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {watchTelemetry.recentWatchEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="rounded-xl bg-black/40 border border-white/10 p-2.5 text-[11px] flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-white line-clamp-1">
                        {evt.videoTitle}
                      </p>
                      <p className="text-[10px] text-sky-300">
                        {evt.domainTitle} · {evt.timestampIso}
                      </p>
                    </div>
                    <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-mono font-bold shrink-0">
                      +{formatWatchDuration(evt.secondsAdded)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 0B: ALL 8 MULTI-SIGNAL RECOMMENDATIONS + 6 CAREER WORKBENCHES    */}
      {/* ===================================================================== */}
      {(activeSubView === "recommendations" || activeSubView === "all_combined") && (
        <ConnectLnMultiSignalWorkbenches
          activePathway={activePathway}
          activeSpecialistSpec={activeSpecialistSpec}
          watchRecommendations={watchRecommendations}
          completedMilestoneCount={completedMilestoneCount}
          onLoadCareerByNumber={(careerNumber, tab = "lessons") => {
            const spec = ALL_60_SPECIALIST_CAREER_SPECS.find(
              (s) => s.careerNumber === careerNumber
            )
            if (spec) {
              if (spec.careerNumber === 42) {
                selectPathwayAndOpenClassroom(
                  SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY,
                  1,
                  tab
                )
                return
              }
              const found =
                ALL_60_SPECIALIST_CAREER_PATHWAYS.find((p) => p.id === spec.id) ||
                buildSpecializedCareerPathway(spec)
              selectPathwayAndOpenClassroom(found, 1, tab)
            }
          }}
          onWatchVideoInClassroom={handleWatchRecommendedVideoInClassroom}
          onOpenActiveClassroomTab={(tab) =>
            selectPathwayAndOpenClassroom(
              activePathway,
              activeMilestone.milestoneNumber,
              tab
            )
          }
          onClaimCertificate={onClaimCertificate}
        />
      )}

      {/* ===================================================================== */}
      {/* VIEW 1: INTERACTIVE SPLIT-PANE 9-MILESTONE CLASSROOM                  */}
      {/* ===================================================================== */}
      {(activeSubView === "classroom" || activeSubView === "all_combined") && (
        <div
          ref={classroomRef}
          className="rounded-3xl border-2 border-[#0A66C2]/40 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden"
        >
          {/* Top Classroom Header */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-5 sm:p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-amber-500 text-slate-950 px-3 py-0.5 text-xs font-black">
                    9-MILESTONE INTERACTIVE CLASSROOM
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-sky-200 border border-white/15">
                    {activePathway.categoryTitle}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                    {activePathway.level} · {activePathway.suggestedDuration}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {activePathway.title}
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200">
                  <strong>Delivery:</strong> {activePathway.deliveryFormat} ·{" "}
                  <strong>Capstone:</strong> {activePathway.capstoneSummary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveComponentTab("plan_pathway_walkthrough")}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <GitBranch className="h-4 w-4" />
                  <span>🗺️ Implementation Plan, Pathway &amp; Walkthrough</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveWpPage(1)
                    setWhitePaperModalOpen(true)
                  }}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FileText className="h-4 w-4" />
                  <span>📜 10-Page Technical Guide (M{activeMilestone.milestoneNumber})</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCareerSpecBrief}
                  className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Syllabus (.md)</span>
                </button>
              </div>
            </div>

            {/* SEMICONDUCTOR MANUFACTURING VERBATIM FLAGSHIP HERO & 12-WEEK OVERVIEW BANNER */}
            {activePathway.id === "pathway-7-semiconductor-manufacturing-technology" && (
              <div className="mt-5 pt-5 border-t border-white/15 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-5 rounded-2xl overflow-hidden border-2 border-amber-400/50 bg-slate-900 shadow-lg">
                  <img
                    src="/images/connectln-studies/semiconductor-cleanroom-bento.png"
                    alt="Semiconductor Manufacturing Cleanroom Technicians & Wafer Fab"
                    className="w-full h-52 sm:h-60 object-cover"
                  />
                  <div className="p-3 bg-slate-950/90 text-[11px] text-amber-200 flex items-center justify-between">
                    <span>📸 Cleanroom Wafer Inspection, FOUP Handling &amp; Photolithography Bay</span>
                    <span className="font-mono font-bold text-emerald-300">12 Weeks · 9 Milestones</span>
                  </div>
                </div>
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      "Semiconductor Manufacturing Technician",
                      "Wafer Fabrication Technician",
                      "Cleanroom Production Technician",
                      "Semiconductor Equipment Technician Trainee",
                      "Process Technician",
                      "Wafer Inspection / Metrology Trainee",
                      "Manufacturing Quality Technician"
                    ].map((role) => (
                      <span
                        key={role}
                        className="rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-sky-200"
                      >
                        ✓ {role}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    <strong>Important Distinction:</strong> Twelve weeks provides a rigorous foundation for entry-level technician roles (cleanroom practices, wafer metrology, lithography, etch/deposition, SPC, lot traceability, and nonconformance escalation), but does not guarantee employment or independently qualify a learner to operate live production equipment without employer tool qualification.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SEMICONDUCTOR_TWELVE_WEEK_SCHEDULE.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveMilestoneNum(idx + 1)
                          setActiveComponentTab("lessons")
                        }}
                        className={`rounded-xl p-2 text-left border transition-all cursor-pointer ${
                          activeMilestone.milestoneNumber === idx + 1
                            ? "bg-amber-500 text-slate-950 border-amber-300 font-bold"
                            : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                        }`}
                      >
                        <div className="text-[10px] font-mono opacity-80">
                          {item.week} · {item.milestone}
                        </div>
                        <div className="text-[11px] font-bold truncate">
                          {item.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Split-Pane Layout: Left 9-Milestone Roadmap Sidebar + Right Active Learning Unit */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT SIDEBAR: 9 Milestones Progression Map (3 cols on desktop) */}
            <div className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  9 Career Milestones
                </span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                  {completedMilestoneCount}/9 Completed
                </span>
              </div>

              <div className="space-y-1.5">
                {activePathway.milestones.map((m) => {
                  const isCurrent = m.milestoneNumber === activeMilestone.milestoneNumber
                  const mKey = `${activePathway.id}-m${m.milestoneNumber}`
                  const isDone = !!completedMilestones[mKey]
                  return (
                    <button
                      key={m.milestoneNumber}
                      type="button"
                      onClick={() => {
                        setActiveMilestoneNum(m.milestoneNumber)
                        if (
                          activeComponentTab === "plan_pathway_walkthrough" ||
                          activeComponentTab === "training_videos"
                        ) {
                          setActiveComponentTab("lessons")
                        }
                      }}
                      className={`w-full rounded-xl p-3 text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isCurrent
                          ? "bg-[#0A66C2] text-white border-[#0A66C2] shadow-md"
                          : isDone
                          ? "bg-emerald-50/70 dark:bg-emerald-950/20 text-zinc-900 dark:text-zinc-100 border-emerald-300 dark:border-emerald-800/60 hover:border-emerald-500"
                          : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-indigo-400"
                      }`}
                    >
                      <span
                        className={`rounded-lg px-2 py-1 text-[11px] font-mono font-black shrink-0 ${
                          isCurrent
                            ? "bg-white text-[#0A66C2]"
                            : isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        0{m.milestoneNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              isCurrent
                                ? "text-sky-200"
                                : "text-zinc-400 dark:text-zinc-500"
                            }`}
                          >
                            {m.milestoneNumber === 9 ? "Capstone" : `Milestone ${m.milestoneNumber}`}
                          </span>
                          {isDone && (
                            <CheckCircle2
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isCurrent ? "text-amber-300" : "text-emerald-600"
                              }`}
                            />
                          )}
                        </div>
                        <p className="text-xs font-bold leading-snug line-clamp-2 mt-0.5">
                          {m.title}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Quick Sidebar Button for Implementation Plan, Pathway & Walkthrough */}
              <button
                type="button"
                onClick={() => setActiveComponentTab("plan_pathway_walkthrough")}
                className={`w-full rounded-xl p-3 text-left border-2 transition-all cursor-pointer flex items-center justify-between ${
                  activeComponentTab === "plan_pathway_walkthrough"
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                    : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-400/60 hover:bg-emerald-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase">
                      FOR THIS TRAINING
                    </div>
                    <div className="text-xs font-black">
                      Implementation Plan, Pathway &amp; 6-Step Walkthrough
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>

              {/* 9 Standardized Components Legend inside Sidebar */}
              <div className="rounded-xl bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  9 Components in Every Milestone:
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {MASTER_CURRICULUM_9_COMPONENTS.map((c) => (
                    <div
                      key={c.number}
                      className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400"
                    >
                      <span className="font-mono font-bold text-[#0A66C2] dark:text-sky-400">
                        {c.number}
                      </span>
                      <span>{c.icon}</span>
                      <span className="truncate font-medium">{c.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT MAIN AREA: Active Milestone Content (9 cols on desktop) */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-between">
              <div>
                {/* Sub-Navigation Bar for Components 01-09 + Implementation Plan & Walkthrough + Videos */}
                <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveComponentTab("lessons")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeComponentTab === "lessons"
                          ? "bg-[#0A66C2] text-white shadow-xs"
                          : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>01–02. Lessons ({activeMilestone.lessons.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveComponentTab("worked_lab")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeComponentTab === "worked_lab"
                          ? "bg-[#0A66C2] text-white shadow-xs"
                          : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>04–05. Worked Example &amp; Live Lab</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveComponentTab("assessment")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeComponentTab === "assessment"
                          ? "bg-[#0A66C2] text-white shadow-xs"
                          : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>06. Quiz ({activeMilestone.assessmentQuestions.length} Qs)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveComponentTab("rubric_deliverable")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeComponentTab === "rubric_deliverable"
                          ? "bg-[#0A66C2] text-white shadow-xs"
                          : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      <Award className="h-3.5 w-3.5" />
                      <span>07–09. Deliverable &amp; Rubric</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveComponentTab("plan_pathway_walkthrough")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeComponentTab === "plan_pathway_walkthrough"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      <span>🗺️ Plan, Pathway &amp; Walkthrough</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveComponentTab("training_videos")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeComponentTab === "training_videos"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100"
                      }`}
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>🎬 Related Videos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveWpPage(1)
                        setWhitePaperModalOpen(true)
                      }}
                      className="rounded-xl px-3 py-2 text-xs font-bold bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-400/40 hover:bg-amber-500/25 cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>03. 10-Pg Guide ↗</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={activeMilestone.milestoneNumber <= 1}
                      onClick={() =>
                        setActiveMilestoneNum((n) => Math.max(1, n - 1))
                      }
                      className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      disabled={activeMilestone.milestoneNumber >= 9}
                      onClick={() =>
                        setActiveMilestoneNum((n) => Math.min(9, n + 1))
                      }
                      className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Active Milestone Body */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Milestone Header Card */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-[#0A66C2] dark:text-sky-400 uppercase">
                        Milestone {activeMilestone.milestoneNumber} of 9 · {activePathway.title}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                        {activeMilestone.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {activeMilestone.summary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadTextFile(
                          `${activePathway.id}-milestone-${activeMilestone.milestoneNumber}-deliverable.md`,
                          activeMilestone.professionalDeliverable.templateMarkdown
                        )
                      }
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-start md:self-auto"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Deliverable (.md)</span>
                    </button>
                  </div>

                  {/* TAB 1: 01 OBJECTIVES & 02 CORE TEACHING MATERIAL LESSONS */}
                  {activeComponentTab === "lessons" && (
                    <div className="space-y-6">
                      {/* 01 Learning Objectives */}
                      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#0A66C2] text-white px-2 py-0.5 text-xs font-mono font-black">
                              01
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                              Learning Objectives
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveComponentTab("worked_lab")}
                            className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            Next: Worked Example &amp; Live Lab →
                          </button>
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-200">
                          {activeMilestone.learningObjectives.map((obj, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 rounded-xl bg-white dark:bg-zinc-900 p-3 border border-blue-100 dark:border-blue-900/40"
                            >
                              <CheckCircle2 className="h-4 w-4 text-[#0A66C2] dark:text-sky-400 shrink-0 mt-0.5" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 02 Core Teaching Lessons */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-indigo-600 text-white px-2 py-0.5 text-xs font-mono font-black">
                            02
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                            Core Teaching Material — Lessons, Tables &amp; Engineering Formulas
                          </h4>
                        </div>

                        {activeMilestone.lessons.map((lesson, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4"
                          >
                            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                              <div>
                                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                  {lesson.lessonNumber}
                                </span>
                                <h5 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                                  {lesson.title}
                                </h5>
                              </div>
                            </div>

                            <div className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                              {lesson.paragraphs.map((p, pIdx) => (
                                <p key={pIdx} className="whitespace-pre-line">
                                  {p}
                                </p>
                              ))}
                            </div>

                            {lesson.table && (
                              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <table className="w-full text-left text-xs sm:text-sm">
                                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">
                                    <tr>
                                      {lesson.table.headers.map((h, hIdx) => (
                                        <th
                                          key={hIdx}
                                          className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-700"
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {lesson.table.rows.map((row, rIdx) => (
                                      <tr
                                        key={rIdx}
                                        className="bg-white dark:bg-zinc-900"
                                      >
                                        {row.map((cell, cIdx) => (
                                          <td
                                            key={cIdx}
                                            className={`px-4 py-2.5 ${
                                              cIdx === 0
                                                ? "font-bold text-zinc-900 dark:text-zinc-100"
                                                : "text-zinc-700 dark:text-zinc-300"
                                            }`}
                                          >
                                            {cell}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {lesson.orderedSteps && (
                              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 border border-zinc-200 dark:border-zinc-700 space-y-2">
                                <ol className="space-y-2 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
                                  {lesson.orderedSteps.map((stepText, sIdx) => (
                                    <li key={sIdx} className="flex items-start gap-2.5">
                                      <span className="rounded-full bg-[#0A66C2] text-white h-5 w-5 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                        {sIdx + 1}
                                      </span>
                                      <span>{stepText}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {lesson.bulletPoints && (
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                                {lesson.bulletPoints.map((bp, bIdx) => (
                                  <li
                                    key={bIdx}
                                    className="flex items-start gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 border border-zinc-200/70 dark:border-zinc-700/70"
                                  >
                                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{bp}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {lesson.mathFormulaBox && (
                              <div className="rounded-2xl border border-indigo-500/40 bg-slate-950 p-4 sm:p-5 text-white space-y-2.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                                  📐 {lesson.mathFormulaBox.title}
                                </span>
                                <div className="space-y-1.5 font-mono text-xs sm:text-sm bg-white/5 p-3 rounded-xl border border-white/10 text-emerald-300">
                                  {lesson.mathFormulaBox.equations.map((eq, eIdx) => (
                                    <div key={eIdx}>{eq}</div>
                                  ))}
                                </div>
                                <p className="text-xs text-indigo-100 leading-relaxed">
                                  {lesson.mathFormulaBox.explanation}
                                </p>
                              </div>
                            )}

                            {lesson.calloutNote && (
                              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3.5 text-xs text-amber-900 dark:text-amber-200">
                                <strong>Key Takeaway:</strong> {lesson.calloutNote}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: 04 WORKED EXAMPLE, 05 PRACTICAL LAB & LIVE INTERACTIVE CALCULATORS */}
                  {activeComponentTab === "worked_lab" && (
                    <div className="space-y-6">
                      {/* 04 Worked Example */}
                      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-indigo-600 text-white px-2 py-0.5 text-xs font-mono font-black">
                            04
                          </span>
                          <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                            Worked Example — {activeMilestone.workedExample.title}
                          </h4>
                        </div>
                        <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 border border-indigo-100 dark:border-indigo-900/40 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
                          <strong>Problem Statement:</strong>{" "}
                          {activeMilestone.workedExample.problemStatement}
                        </div>
                        <div className="space-y-2">
                          {activeMilestone.workedExample.stepByStepSolution.map(
                            (step, idx) => (
                              <div
                                key={idx}
                                className="rounded-xl bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200"
                              >
                                {step}
                              </div>
                            )
                          )}
                        </div>
                        <div className="rounded-xl bg-emerald-950 text-emerald-100 p-4 text-xs sm:text-sm">
                          <strong className="text-emerald-300">Conclusion:</strong>{" "}
                          {activeMilestone.workedExample.engineeringConclusion}
                        </div>
                      </div>

                      {/* LIVE INTERACTIVE ENGINEERING & DIAGNOSTIC SANDBOX CALCULATOR */}
                      <div className="rounded-2xl border-2 border-[#0A66C2]/40 bg-slate-950 text-white p-5 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Sliders className="h-4 w-4 text-amber-400" />
                            <h4 className="text-sm sm:text-base font-black text-white">
                              Interactive Engineering &amp; Diagnostic Sandbox
                            </h4>
                          </div>
                          <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-mono">
                            LIVE HANDS-ON SIMULATOR
                          </span>
                        </div>

                        {/* Pathway 3 / Construction Trades Live Calculator */}
                        {(activePathway.id === "pathway-3-construction-superintendent" ||
                          activePathway.categoryTitle.includes("Construction") ||
                          activePathway.categoryTitle.includes("Architecture")) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                              <p className="text-xs font-bold text-amber-300">
                                📐 1. Drawing Scale Converter (e.g., 1:50)
                              </p>
                              <div className="grid grid-cols-2 gap-2.5 text-xs">
                                <div>
                                  <label className="text-zinc-400 block mb-1">
                                    Measured on Drawing (mm)
                                  </label>
                                  <input
                                    type="number"
                                    value={drawingMmInput}
                                    onChange={(e) =>
                                      setDrawingMmInput(Number(e.target.value) || 0)
                                    }
                                    className="w-full rounded-lg bg-slate-900 border border-white/20 px-2.5 py-1.5 text-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-zinc-400 block mb-1">
                                    Scale Ratio (1 : N)
                                  </label>
                                  <input
                                    type="number"
                                    value={drawingScaleFactor}
                                    onChange={(e) =>
                                      setDrawingScaleFactor(Number(e.target.value) || 1)
                                    }
                                    className="w-full rounded-lg bg-slate-900 border border-white/20 px-2.5 py-1.5 text-white font-mono"
                                  />
                                </div>
                              </div>
                              <div className="rounded-lg bg-emerald-950/60 border border-emerald-500/30 p-2.5 font-mono text-xs text-emerald-300">
                                Real Length: {drawingMmInput} × {drawingScaleFactor} ={" "}
                                {drawingMmInput * drawingScaleFactor} mm ={" "}
                                <strong>{realMetersFromScale} m</strong>
                              </div>
                            </div>

                            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                              <p className="text-xs font-bold text-amber-300">
                                🧱 2. Concrete Slab Volume Takeoff (V = L × W × T)
                              </p>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div>
                                  <label className="text-zinc-400 block mb-1">L (m)</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={slabLengthM}
                                    onChange={(e) =>
                                      setSlabLengthM(Number(e.target.value) || 0)
                                    }
                                    className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-zinc-400 block mb-1">W (m)</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={slabWidthM}
                                    onChange={(e) =>
                                      setSlabWidthM(Number(e.target.value) || 0)
                                    }
                                    className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-zinc-400 block mb-1">T (m)</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={slabThickM}
                                    onChange={(e) =>
                                      setSlabThickM(Number(e.target.value) || 0)
                                    }
                                    className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-zinc-400 block mb-1">Waste %</label>
                                  <input
                                    type="number"
                                    value={slabWastePct}
                                    onChange={(e) =>
                                      setSlabWastePct(Number(e.target.value) || 0)
                                    }
                                    className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                  />
                                </div>
                              </div>
                              <div className="rounded-lg bg-emerald-950/60 border border-emerald-500/30 p-2.5 font-mono text-xs text-emerald-300">
                                Theoretical V = <strong>{slabTheoreticalVol} m³</strong> · With{" "}
                                {slabWastePct}% Allowance ={" "}
                                <strong>{slabGrossVolWithWaste} m³</strong>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Pathway 5 / Solar & Microgrid Live Calculator */}
                        {(activePathway.id === "pathway-5-solar-microgrid" ||
                          activePathway.title.toLowerCase().includes("solar") ||
                          activePathway.title.toLowerCase().includes("microgrid")) && (
                          <div className="space-y-3">
                            <p className="text-xs text-indigo-200">
                              Adjust community demand, peak sun hours, performance ratio, and outage parameters to compute preliminary solar and battery storage sizing:
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
                              <div>
                                <label className="text-zinc-400 block mb-1">Households</label>
                                <input
                                  type="number"
                                  value={mgHouseholds}
                                  onChange={(e) =>
                                    setMgHouseholds(Number(e.target.value) || 0)
                                  }
                                  className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 block mb-1">kWh/day/HH</label>
                                <input
                                  type="number"
                                  value={mgKwhPerDay}
                                  onChange={(e) =>
                                    setMgKwhPerDay(Number(e.target.value) || 0)
                                  }
                                  className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 block mb-1">Peak Sun Hrs</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={mgSunHours}
                                  onChange={(e) =>
                                    setMgSunHours(Number(e.target.value) || 1)
                                  }
                                  className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 block mb-1">Perf Ratio</label>
                                <input
                                  type="number"
                                  step="0.05"
                                  value={mgPerfRatio}
                                  onChange={(e) =>
                                    setMgPerfRatio(Number(e.target.value) || 0.8)
                                  }
                                  className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 block mb-1">Outage Days</label>
                                <input
                                  type="number"
                                  value={mgOutageDays}
                                  onChange={(e) =>
                                    setMgOutageDays(Number(e.target.value) || 1)
                                  }
                                  className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 block mb-1">DoD (0-1)</label>
                                <input
                                  type="number"
                                  step="0.05"
                                  value={mgDod}
                                  onChange={(e) =>
                                    setMgDod(Number(e.target.value) || 0.8)
                                  }
                                  className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 block mb-1">Eff η (0-1)</label>
                                <input
                                  type="number"
                                  step="0.05"
                                  value={mgEfficiency}
                                  onChange={(e) =>
                                    setMgEfficiency(Number(e.target.value) || 0.9)
                                  }
                                  className="w-full rounded-lg bg-slate-900 border border-white/20 px-2 py-1.5 text-white font-mono"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-mono text-xs">
                              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <span className="text-zinc-400 block">Daily Energy Demand (E_d)</span>
                                <strong className="text-base text-amber-300">
                                  {mgDailyEnergyKwh.toLocaleString()} kWh ({mgDailyEnergyMwh} MWh/day)
                                </strong>
                              </div>
                              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <span className="text-zinc-400 block">Preliminary Solar Array (P_solar)</span>
                                <strong className="text-base text-emerald-300">
                                  {mgSolarKw.toLocaleString()} kW ({mgSolarMw} MW)
                                </strong>
                              </div>
                              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <span className="text-zinc-400 block">
                                  {mgOutageDays * 24}-Hr Nominal Battery (E_battery)
                                </span>
                                <strong className="text-base text-sky-300">
                                  {mgBatteryNominalMwh} MWh (Delivered: {mgDeliveredOutageMwh} MWh)
                                </strong>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Pathway 6 / PLC Boolean Conveyor Simulator */}
                        {(activePathway.id === "pathway-6-industrial-plc" ||
                          activePathway.title.toLowerCase().includes("plc") ||
                          activePathway.title.toLowerCase().includes("automation") ||
                          activePathway.title.toLowerCase().includes("robotics")) && (
                          <div className="space-y-3">
                            <p className="text-xs text-indigo-200">
                              Toggle PLC inputs below to test{" "}
                              <code className="text-amber-300">
                                RunRequest = AutoMode ∧ (Start ∨ SealIn) ∧ ¬Stop ∧ Permissives ∧ ¬Fault
                              </code>{" "}
                              and verify stop-dominance and safe fault recovery:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setPlcAutoMode(!plcAutoMode)}
                                className={`rounded-xl px-3 py-2 text-xs font-mono font-bold cursor-pointer border ${
                                  plcAutoMode
                                    ? "bg-emerald-600 text-white border-emerald-400"
                                    : "bg-slate-900 text-zinc-400 border-white/15"
                                }`}
                              >
                                AutoMode = {plcAutoMode ? "1" : "0"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !plcStartCmd
                                  setPlcStartCmd(next)
                                  if (
                                    next &&
                                    plcAutoMode &&
                                    !plcStopCmd &&
                                    plcPermissives &&
                                    !plcFaultLatched
                                  ) {
                                    setPlcRunSealIn(true)
                                  }
                                }}
                                className={`rounded-xl px-3 py-2 text-xs font-mono font-bold cursor-pointer border ${
                                  plcStartCmd
                                    ? "bg-emerald-600 text-white border-emerald-400"
                                    : "bg-slate-900 text-zinc-400 border-white/15"
                                }`}
                              >
                                StartCommand = {plcStartCmd ? "1" : "0"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !plcStopCmd
                                  setPlcStopCmd(next)
                                  if (next) setPlcRunSealIn(false)
                                }}
                                className={`rounded-xl px-3 py-2 text-xs font-mono font-bold cursor-pointer border ${
                                  plcStopCmd
                                    ? "bg-rose-600 text-white border-rose-400"
                                    : "bg-slate-900 text-zinc-400 border-white/15"
                                }`}
                              >
                                StopCommand = {plcStopCmd ? "1 (STOP ASSERTED)" : "0"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !plcPermissives
                                  setPlcPermissives(next)
                                  if (!next) setPlcRunSealIn(false)
                                }}
                                className={`rounded-xl px-3 py-2 text-xs font-mono font-bold cursor-pointer border ${
                                  plcPermissives
                                    ? "bg-emerald-600 text-white border-emerald-400"
                                    : "bg-amber-600 text-white border-amber-400"
                                }`}
                              >
                                Permissives = {plcPermissives ? "1 (OK)" : "0 (BLOCKED)"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !plcFaultLatched
                                  setPlcFaultLatched(next)
                                  if (next) {
                                    setPlcRunSealIn(false)
                                    setPlcStartCmd(false)
                                  }
                                }}
                                className={`rounded-xl px-3 py-2 text-xs font-mono font-bold cursor-pointer border ${
                                  plcFaultLatched
                                    ? "bg-rose-600 text-white border-rose-400"
                                    : "bg-slate-900 text-zinc-400 border-white/15"
                                }`}
                              >
                                FaultLatched = {plcFaultLatched ? "1 (FAULT!)" : "0"}
                              </button>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 flex items-center justify-between font-mono text-xs">
                              <span>
                                Output Process Image:{" "}
                                <strong
                                  className={
                                    effectivePlcRun ? "text-emerald-400" : "text-rose-400"
                                  }
                                >
                                  ConveyorMotor_Out = {effectivePlcRun ? "1 (RUNNING)" : "0 (STOPPED — SAFE STATE)"}
                                </strong>
                              </span>
                              <span className="text-zinc-400">
                                SealIn_Bit = {plcRunSealIn ? "1" : "0"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Pathway 7 / Semiconductor Cleanroom Poisson & 5-Site Wafer SPC Calculator */}
                        {(activePathway.id ===
                          "pathway-7-semiconductor-manufacturing-technology" ||
                          activePathway.title
                            .toLowerCase()
                            .includes("semiconductor") ||
                          activePathway.categoryTitle
                            .toLowerCase()
                            .includes("semiconductor")) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                              <p className="text-xs font-bold text-amber-300">
                                🔬 1. Cleanroom Particle Poisson Calculator (μ = λ × A, P(0) = e^-μ)
                              </p>
                              <div className="grid grid-cols-2 gap-2.5 text-xs">
                                <div>
                                  <label className="text-zinc-400 block mb-1">
                                    Particle Density λ (/cm²)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.005"
                                    value={semiLambda}
                                    onChange={(e) =>
                                      setSemiLambda(Number(e.target.value) || 0)
                                    }
                                    className="w-full rounded-lg bg-slate-900 border border-white/20 px-2.5 py-1.5 text-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-zinc-400 block mb-1">
                                    Inspected Area A (cm²)
                                  </label>
                                  <input
                                    type="number"
                                    step="10"
                                    value={semiAreaCm2}
                                    onChange={(e) =>
                                      setSemiAreaCm2(Number(e.target.value) || 0)
                                    }
                                    className="w-full rounded-lg bg-slate-900 border border-white/20 px-2.5 py-1.5 text-white font-mono"
                                  />
                                </div>
                              </div>
                              <div className="rounded-lg bg-emerald-950/60 border border-emerald-500/30 p-2.5 font-mono text-xs text-emerald-300">
                                Expected Particles μ ={" "}
                                <strong>
                                  {(semiLambda * semiAreaCm2).toFixed(2)}
                                </strong>{" "}
                                · Zero-Defect Prob P(0) ={" "}
                                <strong>
                                  {(
                                    Math.exp(-(semiLambda * semiAreaCm2)) * 100
                                  ).toFixed(1)}
                                  %
                                </strong>
                              </div>
                            </div>

                            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                              <p className="text-xs font-bold text-amber-300">
                                📏 2. 5-Site Wafer Film Thickness &amp; Spec Check (Target 100 nm · Spec 97–103 nm)
                              </p>
                              <div className="grid grid-cols-5 gap-1.5 text-xs">
                                {[
                                  { label: "S1", val: semiSite1, set: setSemiSite1 },
                                  { label: "S2", val: semiSite2, set: setSemiSite2 },
                                  { label: "S3", val: semiSite3, set: setSemiSite3 },
                                  { label: "S4", val: semiSite4, set: setSemiSite4 },
                                  { label: "S5", val: semiSite5, set: setSemiSite5 }
                                ].map((site, idx) => (
                                  <div key={idx}>
                                    <label className="text-zinc-400 block mb-1">
                                      {site.label} (nm)
                                    </label>
                                    <input
                                      type="number"
                                      value={site.val}
                                      onChange={(e) =>
                                        site.set(Number(e.target.value) || 0)
                                      }
                                      className={`w-full rounded-lg bg-slate-900 border px-2 py-1.5 text-white font-mono ${
                                        site.val < 97 || site.val > 103
                                          ? "border-rose-500 text-rose-300"
                                          : "border-white/20"
                                      }`}
                                    />
                                  </div>
                                ))}
                              </div>
                              {(() => {
                                const arr = [
                                  semiSite1,
                                  semiSite2,
                                  semiSite3,
                                  semiSite4,
                                  semiSite5
                                ]
                                const mean = (
                                  arr.reduce((a, b) => a + b, 0) / 5
                                ).toFixed(2)
                                const range = Math.max(...arr) - Math.min(...arr)
                                const outOfSpec = arr.some(
                                  (v) => v < 97 || v > 103
                                )
                                return (
                                  <div
                                    className={`rounded-lg border p-2.5 font-mono text-xs ${
                                      outOfSpec
                                        ? "bg-rose-950/60 border-rose-500/40 text-rose-200"
                                        : "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
                                    }`}
                                  >
                                    Mean = <strong>{mean} nm</strong> · Range ={" "}
                                    <strong>{range} nm</strong> · Status:{" "}
                                    <strong>
                                      {outOfSpec
                                        ? "OUT OF SPEC (97–103 nm) → HOLD LOT & ESCALATE"
                                        : "WITHIN SPEC (97–103 nm) ✓"}
                                    </strong>
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Interactive Lab Task Completion Checklist (All Pathways) */}
                        <div className="pt-2 border-t border-white/10 space-y-2">
                          <p className="text-xs font-bold text-sky-300">
                            ✓ Interactive Lab Task Execution Checklist (Check off as you complete each step):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeMilestone.practicalLab.requiredTasks.map((t, i) => {
                              const tKey = `${activePathway.id}-m${activeMilestone.milestoneNumber}-t${i}`
                              const isChecked = !!checkedLabTasks[tKey]
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() =>
                                    setCheckedLabTasks((prev) => ({
                                      ...prev,
                                      [tKey]: !prev[tKey]
                                    }))
                                  }
                                  className={`rounded-xl p-2.5 text-left text-xs border transition-all cursor-pointer flex items-start gap-2 ${
                                    isChecked
                                      ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
                                      : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                                  }`}
                                >
                                  <span
                                    className={`h-4 w-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                                      isChecked
                                        ? "bg-emerald-500 border-emerald-400 text-slate-950 font-black"
                                        : "border-white/30"
                                    }`}
                                  >
                                    {isChecked ? "✓" : ""}
                                  </span>
                                  <span>{t}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* 05 Practical Lab Specification */}
                      <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/60 bg-white dark:bg-zinc-900 p-5 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-emerald-600 text-white px-2 py-0.5 text-xs font-mono font-black">
                              05
                            </span>
                            <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                              {activeMilestone.practicalLab.title}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveComponentTab("assessment")}
                            className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            Proceed to Graded Assessment →
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                          {activeMilestone.practicalLab.scenario}
                        </p>
                        <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200">
                          <strong>Required Deliverables:</strong>{" "}
                          {activeMilestone.practicalLab.submissionDeliverables.join(" · ")}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: 06 GRADED KNOWLEDGE ASSESSMENT */}
                  {activeComponentTab === "assessment" && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-amber-500 text-slate-950 px-2 py-0.5 text-xs font-mono font-black">
                                06
                              </span>
                              <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                                Milestone {activeMilestone.milestoneNumber} Knowledge &amp; Applied Reasoning Assessment
                              </h4>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {activeMilestone.passingCriterionNote}
                            </p>
                          </div>

                          {isQuizSubmitted && (
                            <div
                              className={`rounded-xl px-4 py-2 text-xs font-black border ${
                                scorePercent >= 80
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200"
                                  : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200"
                              }`}
                            >
                              Score: {scorePercent}% ({correctCount}/{questions.length}) —{" "}
                              {scorePercent >= 80
                                ? "PASSED (>= 80% Rubric) ✓"
                                : "Review Explanations & Retry"}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {questions.map((q, qIdx) => {
                            const key = `${milestoneQuizKey}-${q.id}`
                            const chosen = selectedAnswers[key]
                            return (
                              <div
                                key={q.id}
                                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 space-y-3"
                              >
                                <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                  Question {qIdx + 1}: {q.prompt}
                                </p>
                                <div className="space-y-2">
                                  {q.options.map((opt, oIdx) => {
                                    const isSelected = chosen === oIdx
                                    const isCorrect = q.correctIndex === oIdx
                                    let optionStyle =
                                      "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400"
                                    if (isSelected) {
                                      optionStyle =
                                        "border-[#0A66C2] bg-blue-50/70 dark:bg-sky-950/40 text-zinc-900 dark:text-white ring-1 ring-[#0A66C2]"
                                    }
                                    if (isQuizSubmitted) {
                                      if (isCorrect) {
                                        optionStyle =
                                          "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold"
                                      } else if (isSelected && !isCorrect) {
                                        optionStyle =
                                          "border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200"
                                      }
                                    }
                                    return (
                                      <button
                                        key={oIdx}
                                        type="button"
                                        onClick={() =>
                                          setSelectedAnswers((prev) => ({
                                            ...prev,
                                            [key]: oIdx
                                          }))
                                        }
                                        className={`w-full text-left rounded-xl border p-3 text-xs sm:text-sm transition-all cursor-pointer flex items-start gap-2.5 ${optionStyle}`}
                                      >
                                        <span className="font-mono font-bold shrink-0">
                                          {String.fromCharCode(65 + oIdx)}.
                                        </span>
                                        <span>{opt}</span>
                                      </button>
                                    )
                                  })}
                                </div>

                                {isQuizSubmitted && (
                                  <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 p-3 text-xs text-indigo-950 dark:text-indigo-200">
                                    <strong>Verified Explanation:</strong>{" "}
                                    {q.modelAnswerExplanation}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSubmittedMilestones((prev) => ({
                                ...prev,
                                [milestoneQuizKey]: false
                              }))
                            }
                            className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 cursor-pointer"
                          >
                            Reset Answers
                          </button>
                          <button
                            type="button"
                            onClick={handleGradeQuiz}
                            className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] px-5 py-2.5 text-xs font-black text-white shadow-md cursor-pointer"
                          >
                            Grade Assessment &amp; Save to Skill Passport
                          </button>
                        </div>
                      </div>

                      {/* VERBATIM 10-QUESTION FINAL KNOWLEDGE CHECK (WHEN SEMICONDUCTOR FLAGSHIP IS ACTIVE) */}
                      {activePathway.id ===
                        "pathway-7-semiconductor-manufacturing-technology" && (
                        <div className="rounded-2xl border-2 border-indigo-500/40 bg-white dark:bg-zinc-900 p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                            <div>
                              <span className="rounded bg-indigo-600 text-white px-2.5 py-0.5 text-[10px] font-mono font-black">
                                SECTION 11 · VERBATIM 10-QUESTION FINAL KNOWLEDGE CHECK &amp; ANSWER KEY
                              </span>
                              <h5 className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-1">
                                Semiconductor Manufacturing Technology — Comprehensive 10-Question Exam
                              </h5>
                            </div>
                            {semiFinalSubmitted && (
                              <span className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 px-3 py-1.5 text-xs font-black text-emerald-800 dark:text-emerald-200">
                                Final Score:{" "}
                                {
                                  SEMICONDUCTOR_FINAL_QUIZ_10.filter(
                                    (q) =>
                                      semiFinalAnswers[q.id] === q.correctIndex
                                  ).length
                                }{" "}
                                / 10
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {SEMICONDUCTOR_FINAL_QUIZ_10.map((q) => {
                              const chosen = semiFinalAnswers[q.id]
                              return (
                                <div
                                  key={q.id}
                                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-3.5 space-y-2.5"
                                >
                                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                    Q{q.number}. {q.question}
                                  </p>
                                  <div className="space-y-1.5">
                                    {q.options.map((opt, oIdx) => {
                                      const isSelected = chosen === oIdx
                                      const isCorrect = q.correctIndex === oIdx
                                      return (
                                        <button
                                          key={oIdx}
                                          type="button"
                                          onClick={() =>
                                            setSemiFinalAnswers((prev) => ({
                                              ...prev,
                                              [q.id]: oIdx
                                            }))
                                          }
                                          className={`w-full text-left rounded-lg border px-2.5 py-1.5 text-xs transition-all cursor-pointer flex items-start gap-2 ${
                                            semiFinalSubmitted
                                              ? isCorrect
                                                ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold"
                                                : isSelected
                                                ? "border-rose-500 bg-rose-50/80 text-rose-900"
                                                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                              : isSelected
                                              ? "border-[#0A66C2] bg-blue-50/70 dark:bg-sky-950/40 font-semibold"
                                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                          }`}
                                        >
                                          <span className="font-mono font-bold">
                                            {String.fromCharCode(65 + oIdx)}.
                                          </span>
                                          <span>{opt}</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                  {semiFinalSubmitted && (
                                    <div className="rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 p-2 text-[11px] text-indigo-900 dark:text-indigo-200">
                                      <strong>Answer Key:</strong>{" "}
                                      {q.explanation}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSemiFinalSubmitted(false)}
                              className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3.5 py-2 text-xs font-bold cursor-pointer"
                            >
                              Reset 10-Q Check
                            </button>
                            <button
                              type="button"
                              onClick={() => setSemiFinalSubmitted(true)}
                              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-black cursor-pointer"
                            >
                              Grade 10-Question Final Knowledge Check &amp; Show Answer Key
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: 07 DELIVERABLE, 08 RUBRIC & 09 CAREER APPLICATION */}
                  {activeComponentTab === "rubric_deliverable" && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-purple-600 text-white px-2 py-0.5 text-xs font-mono font-black">
                              07
                            </span>
                            <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                              Professional Deliverable —{" "}
                              {activeMilestone.professionalDeliverable.title}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadTextFile(
                                `${activePathway.id}-m${activeMilestone.milestoneNumber}-deliverable.md`,
                                activeMilestone.professionalDeliverable.templateMarkdown
                              )
                            }
                            className="rounded-xl bg-purple-600 hover:bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Template (.md)</span>
                          </button>
                        </div>
                        <pre className="rounded-xl bg-slate-950 text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                          {activeMilestone.professionalDeliverable.templateMarkdown}
                        </pre>
                      </div>

                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-emerald-600 text-white px-2 py-0.5 text-xs font-mono font-black">
                            08
                          </span>
                          <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                            Measurable Competency Rubric
                          </h4>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">
                              <tr>
                                <th className="p-3 border-b border-zinc-200 dark:border-zinc-700">
                                  Criterion
                                </th>
                                <th className="p-3 border-b border-zinc-200 dark:border-zinc-700 text-amber-700 dark:text-amber-300">
                                  Developing
                                </th>
                                <th className="p-3 border-b border-zinc-200 dark:border-zinc-700 text-emerald-700 dark:text-emerald-300">
                                  Competent (Pass)
                                </th>
                                <th className="p-3 border-b border-zinc-200 dark:border-zinc-700 text-indigo-700 dark:text-indigo-300">
                                  Advanced
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                              {activeMilestone.competencyRubric.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                                    {row.criterion}
                                  </td>
                                  <td className="p-3 text-zinc-600 dark:text-zinc-400">
                                    {row.developing}
                                  </td>
                                  <td className="p-3 text-zinc-800 dark:text-zinc-200 font-medium">
                                    {row.competent}
                                  </td>
                                  <td className="p-3 text-zinc-700 dark:text-zinc-300">
                                    {row.advanced}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-amber-500 text-slate-950 px-2 py-0.5 text-xs font-mono font-black">
                            09
                          </span>
                          <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                            Career Application &amp; Primary Standards
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>Workplace Usage:</strong>{" "}
                          {activeMilestone.careerApplication.workplaceUsage}
                        </p>
                        <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                          <strong>Supervision &amp; Licensure Boundary:</strong>{" "}
                          {activeMilestone.careerApplication.supervisionAndLicensingNote}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: PER-TRAINING IMPLEMENTATION PLAN, CAREER PATHWAY & 6-STEP OPERATIONAL WALKTHROUGH */}
                  {activeComponentTab === "plan_pathway_walkthrough" && (
                    <div className="space-y-6">
                      {/* Header Banner for Active Training's Implementation Plan & Walkthrough */}
                      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 p-5 text-white border border-emerald-500/40 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="rounded-full bg-emerald-400 text-slate-950 px-3 py-0.5 text-[10px] font-black uppercase">
                              DEDICATED IMPLEMENTATION PLAN, PATHWAY &amp; WALKTHROUGH FOR THIS TRAINING
                            </span>
                            <h4 className="text-lg sm:text-xl font-black text-white mt-1.5">
                              {activeTrainingPlanAndWalkthrough.trainingTitle}
                            </h4>
                            <p className="text-xs text-emerald-200">
                              <strong>Domain:</strong>{" "}
                              {activeTrainingPlanAndWalkthrough.domainTitle} ·{" "}
                              <strong>Primary Tangible Portfolio Artifact:</strong>{" "}
                              {activeTrainingPlanAndWalkthrough.tangibleArtifact}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadTextFile(
                                `${activeTrainingPlanAndWalkthrough.trainingId}-implementation-plan-and-walkthrough.md`,
                                activeTrainingPlanAndWalkthrough.fullExportMarkdown
                              )
                            }
                            className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 self-start"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download Plan &amp; Walkthrough (.md)</span>
                          </button>
                        </div>
                        <div className="rounded-xl bg-white/10 border border-white/15 p-3 text-xs text-emerald-100">
                          <strong>Regulatory &amp; Safety Notice:</strong>{" "}
                          {activeTrainingPlanAndWalkthrough.safetyAndRegulatoryNotice}
                        </div>
                      </div>

                      {/* PART A: 4-PHASE IMPLEMENTATION PLAN FOR THIS TRAINING */}
                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-emerald-600 text-white px-2.5 py-0.5 text-xs font-mono font-black">
                              PART A
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                              4-Phase Training Implementation Plan ({activePathway.title})
                            </h4>
                          </div>
                          <span className="text-xs font-mono text-zinc-500">
                            Structured 12-Week Execution Roadmap
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeTrainingPlanAndWalkthrough.implementationPhases.map(
                            (phase) => (
                              <div
                                key={phase.phaseNumber}
                                className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/15 p-4 flex flex-col justify-between space-y-3"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-mono font-black">
                                      PHASE {phase.phaseNumber} · {phase.weeks}
                                    </span>
                                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                                      {phase.milestonesCovered}
                                    </span>
                                  </div>
                                  <h5 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                                    {phase.phaseTitle}
                                  </h5>
                                  <div className="space-y-1">
                                    <p className="text-[11px] font-bold uppercase text-zinc-500">
                                      Key Implementation Activities:
                                    </p>
                                    <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                                      {phase.keyActivities.map((act, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-1.5"
                                        >
                                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                          <span>{act}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="space-y-1 pt-1">
                                    <p className="text-[11px] font-bold uppercase text-zinc-500">
                                      Required Tools &amp; Lab Setup:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {phase.requiredToolsAndSetup.map(
                                        (tool, tIdx) => (
                                          <span
                                            key={tIdx}
                                            className="rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-700 dark:text-zinc-300"
                                          >
                                            {tool}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="rounded-xl bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800 p-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                                  <strong>Phase Gate Deliverable:</strong>{" "}
                                  {phase.gateDeliverable}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* PART B: 5-STAGE CAREER & LEARNING PATHWAY PROGRESSION LADDER */}
                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#0A66C2] text-white px-2.5 py-0.5 text-xs font-mono font-black">
                              PART B
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                              5-Stage Career &amp; Learning Pathway Progression Map
                            </h4>
                          </div>
                          <span className="text-xs text-zinc-500">
                            From Trainee Foundations to Senior Specialist &amp; Leadership
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {activeTrainingPlanAndWalkthrough.careerPathwayStages.map(
                            (st) => (
                              <div
                                key={st.stageNumber}
                                className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 p-3.5 flex flex-col justify-between space-y-2.5"
                              >
                                <div className="space-y-1.5">
                                  <span className="inline-block rounded bg-[#0A66C2] text-white px-2 py-0.5 text-[10px] font-mono font-black">
                                    STAGE {st.stageNumber}
                                  </span>
                                  <h5 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
                                    {st.roleTitle}
                                  </h5>
                                  <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                                    {st.experienceWindow}
                                  </p>
                                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
                                    {st.coreCompetenciesUnlocked}
                                  </p>
                                </div>
                                <div className="space-y-1.5 pt-2 border-t border-blue-200/60 dark:border-blue-900/50 text-[11px]">
                                  <div className="text-emerald-800 dark:text-emerald-300">
                                    <strong>Evidence:</strong>{" "}
                                    {st.portfolioEvidenceRequired}
                                  </div>
                                  <div className="text-zinc-500 dark:text-zinc-400">
                                    <strong>Credentials:</strong>{" "}
                                    {st.credentialsAndContinuingEd}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* PART C: INTERACTIVE 6-STEP OPERATIONAL WALKTHROUGH FOR THIS TRAINING */}
                      <div className="rounded-2xl border-2 border-indigo-500/40 bg-white dark:bg-zinc-900 p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-indigo-600 text-white px-2.5 py-0.5 text-xs font-mono font-black">
                              PART C
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                              Interactive 6-Step Operational Walkthrough ({activePathway.title})
                            </h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            Click Steps 1–6 to Walk Through the Complete Professional Workflow
                          </span>
                        </div>

                        {/* 6-Step Selector Pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                          {activeTrainingPlanAndWalkthrough.interactiveWalkthroughSteps.map(
                            (wStep) => {
                              const isCurrent =
                                activeWalkthroughStep === wStep.stepNumber
                              const wKey = `${activePathway.id}-walkthrough-s${wStep.stepNumber}`
                              const isDone = !!completedWalkthroughSteps[wKey]
                              return (
                                <button
                                  key={wStep.stepNumber}
                                  type="button"
                                  onClick={() =>
                                    setActiveWalkthroughStep(wStep.stepNumber)
                                  }
                                  className={`rounded-xl p-2.5 text-left border transition-all cursor-pointer ${
                                    isCurrent
                                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                      : isDone
                                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-900 dark:text-emerald-200"
                                      : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-indigo-400"
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[10px] font-mono font-black mb-1">
                                    <span>STEP 0{wStep.stepNumber}</span>
                                    {isDone && <span>✓</span>}
                                  </div>
                                  <div className="text-xs font-bold line-clamp-2 leading-snug">
                                    {wStep.stepTitle.replace(
                                      /^Step \d+:\s*/i,
                                      ""
                                    )}
                                  </div>
                                </button>
                              )
                            }
                          )}
                        </div>

                        {/* Active Walkthrough Step Detail Card */}
                        {(() => {
                          const currentW =
                            activeTrainingPlanAndWalkthrough.interactiveWalkthroughSteps.find(
                              (s) => s.stepNumber === activeWalkthroughStep
                            ) ||
                            activeTrainingPlanAndWalkthrough
                              .interactiveWalkthroughSteps[0]
                          const wKey = `${activePathway.id}-walkthrough-s${currentW.stepNumber}`
                          const isStepDone = !!completedWalkthroughSteps[wKey]
                          return (
                            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 p-5 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                    Operational Walkthrough · Step{" "}
                                    {currentW.stepNumber} of 6
                                  </span>
                                  <h5 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                                    {currentW.stepTitle}
                                  </h5>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCompletedWalkthroughSteps((prev) => ({
                                      ...prev,
                                      [wKey]: !prev[wKey]
                                    }))
                                    if (currentW.stepNumber < 6) {
                                      setActiveWalkthroughStep(
                                        currentW.stepNumber + 1
                                      )
                                    }
                                  }}
                                  className={`rounded-xl px-4 py-2 text-xs font-black cursor-pointer transition-all ${
                                    isStepDone
                                      ? "bg-emerald-600 text-white"
                                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                  }`}
                                >
                                  {isStepDone
                                    ? "✓ Step Verified (Click to Advance)"
                                    : "Mark Step Verified & Continue →"}
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                                <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                                  <span className="text-[11px] font-mono font-bold uppercase text-[#0A66C2] dark:text-sky-400">
                                    1. Operational Objective
                                  </span>
                                  <p className="text-zinc-800 dark:text-zinc-200">
                                    {currentW.objective}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                                  <span className="text-[11px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                                    2. Inputs &amp; Preconditions
                                  </span>
                                  <p className="text-zinc-800 dark:text-zinc-200">
                                    {currentW.inputsAndPreconditions}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs border border-slate-800 space-y-1.5">
                                <span className="text-[11px] font-bold uppercase text-amber-300 block">
                                  3. Technical Action, Governing Equations &amp; Worked Execution
                                </span>
                                <pre className="whitespace-pre-wrap leading-relaxed">
                                  {currentW.technicalActionAndFormula}
                                </pre>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 p-3.5 text-emerald-950 dark:text-emerald-200">
                                  <strong>4. Verification Checkpoint:</strong>{" "}
                                  {currentW.verificationCheckpoint}
                                </div>
                                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 p-3.5 text-rose-950 dark:text-rose-200">
                                  <strong>5. Common Pitfall to Avoid:</strong>{" "}
                                  {currentW.commonPitfallToAvoid}
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>

                      {/* SEMICONDUCTOR 3-LEVEL SAFETY HIERARCHY & 7-ROW QA REVIEW TABLE */}
                      {activePathway.id ===
                        "pathway-7-semiconductor-manufacturing-technology" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                            <h5 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                              Section 13 · 3-Level Cleanroom &amp; Equipment Safety Hierarchy
                            </h5>
                            <div className="space-y-2">
                              {SEMICONDUCTOR_SAFETY_LEVELS.map((lvl, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 border border-zinc-200 dark:border-zinc-700 text-xs"
                                >
                                  <strong className="text-zinc-900 dark:text-zinc-100 block">
                                    {lvl.level}
                                  </strong>
                                  <span className="text-zinc-600 dark:text-zinc-300">
                                    {lvl.scope}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                            <h5 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                              Section 16 · Quality-Assurance &amp; Factual Verification Review
                            </h5>
                            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
                              <table className="w-full text-left text-[11px]">
                                <thead className="bg-zinc-100 dark:bg-zinc-800 font-bold">
                                  <tr>
                                    <th className="p-2">Review Area</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                  {SEMICONDUCTOR_QA_REVIEW_TABLE.map(
                                    (row, rIdx) => (
                                      <tr key={rIdx}>
                                        <td className="p-2 font-bold">
                                          {row.area}
                                        </td>
                                        <td className="p-2 text-emerald-600 font-bold">
                                          {row.status}
                                        </td>
                                        <td className="p-2 text-zinc-600 dark:text-zinc-400">
                                          {row.notes}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 6: RELATED TRAINING VIDEOS & INTERACTIVE VISUAL WALKTHROUGHS INSIDE CLASSROOM */}
                  {activeComponentTab === "training_videos" && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="rounded bg-indigo-600 text-white px-2.5 py-0.5 text-[10px] font-mono font-black">
                                CURATED TECHNICAL TRAINING VIDEOS &amp; VISUAL SIMULATORS
                              </span>
                              <span className="rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                                ● Watch Time Logged:{" "}
                                {formatWatchDuration(
                                  watchTelemetry.videoWatchSeconds[selectedVideo.id] || 0
                                )}{" "}
                                (Feeds Recommendation Engine)
                              </span>
                            </div>
                            <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">
                              {selectedVideo.title}
                            </h4>
                            <p className="text-xs text-zinc-600 dark:text-zinc-300">
                              {selectedVideo.careerTitle} · {selectedVideo.domainTitle} ·{" "}
                              <strong>Source:</strong> {selectedVideo.instructorOrSource} (
                              {selectedVideo.duration})
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleBoostVideoWatchTime(selectedVideo, 300)}
                            className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 text-xs font-black cursor-pointer self-start sm:self-auto shrink-0"
                          >
                            +5m Simulate Watch Time →
                          </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                          <div className="lg:col-span-7 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                            <video
                              key={selectedVideo.id}
                              src={selectedVideo.videoUrl}
                              poster={selectedVideo.thumbnailUrl}
                              controls
                              onPlay={() => handleVideoPlayTelemetry(selectedVideo)}
                              onTimeUpdate={(e) =>
                                handleVideoTimeUpdateTelemetry(
                                  selectedVideo,
                                  e.currentTarget.currentTime
                                )
                              }
                              className="w-full h-60 sm:h-72 object-cover bg-black"
                            />
                            <div className="p-3.5 text-xs text-slate-200 space-y-1">
                              <p>{selectedVideo.summary}</p>
                              <p className="text-emerald-300 font-mono text-[11px]">
                                <strong>Key Takeaway:</strong>{" "}
                                {selectedVideo.keyTechnicalTakeaway}
                              </p>
                            </div>
                          </div>

                          <div className="lg:col-span-5 space-y-2">
                            <p className="text-xs font-black uppercase text-zinc-700 dark:text-zinc-300">
                              Video Chapter Walkthrough &amp; Timestamps (Click to Log Chapter Study):
                            </p>
                            {selectedVideo.chapters.map((ch, cIdx) => (
                              <div
                                key={cIdx}
                                onClick={() =>
                                  handleBoostVideoWatchTime(
                                    selectedVideo,
                                    90,
                                    "chapter_jump"
                                  )
                                }
                                className="rounded-xl bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 space-y-1 cursor-pointer transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[11px] font-black text-indigo-600 dark:text-indigo-400">
                                    {ch.timestamp}
                                  </span>
                                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                    {ch.title}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                  {ch.takeaway}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                          {ACADEMY_TRAINING_VIDEOS.map((vid) => {
                            const watchedSec =
                              watchTelemetry.videoWatchSeconds[vid.id] || 0
                            return (
                              <button
                                key={vid.id}
                                type="button"
                                onClick={() => {
                                  setSelectedVideo(vid)
                                  updateAndPersistWatchTelemetry((prev) =>
                                    recordVideoWatchTelemetry(
                                      prev,
                                      vid,
                                      20,
                                      "live_playback",
                                      true
                                    )
                                  )
                                }}
                                className={`rounded-xl p-3 text-left border transition-all cursor-pointer ${
                                  selectedVideo.id === vid.id
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                    : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-indigo-400"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                                  <span>Career #{vid.careerNumber}</span>
                                  <span>
                                    {vid.duration} · Watched:{" "}
                                    {formatWatchDuration(watchedSec)}
                                  </span>
                                </div>
                                <div className="text-xs font-bold line-clamp-1">
                                  {vid.title}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Career Tutor Bar inside Classroom */}
                  <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        AI Career Tutor — Ask About {activeMilestone.title}
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            handleAskTutor(
                              `Explain the core equations and concepts in ${activeMilestone.title}.`
                            )
                          }
                          className="rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                        >
                          Explain Formulas
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAskTutor(
                              `How do I pass the Competency Rubric for ${activeMilestone.practicalLab.title}?`
                            )
                          }
                          className="rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                        >
                          Check Rubric Tips
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tutorQuestion}
                        onChange={(e) => setTutorQuestion(e.target.value)}
                        placeholder={`Ask a technical question about ${activeMilestone.title}...`}
                        className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleAskTutor()}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white cursor-pointer"
                      >
                        Ask Tutor
                      </button>
                    </div>
                    {tutorResponse && (
                      <div className="rounded-xl bg-white dark:bg-zinc-900 p-3.5 border border-indigo-200 dark:border-indigo-800 text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                        {tutorResponse}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1B: 60 SPECIALIST TANGIBLE-COMPETENCE CAREERS (#1–#60, 14 DOMAINS) */}
      {/* ===================================================================== */}
      {(activeSubView === "specialist_60" || activeSubView === "all_combined") && (
        <div className="rounded-3xl border-2 border-[#0A66C2]/35 bg-white dark:bg-zinc-900 p-6 shadow-md space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="space-y-1">
              <span className="rounded-full bg-[#0A66C2]/10 text-[#0A66C2] dark:text-sky-400 px-3 py-0.5 text-[11px] font-black uppercase">
                Specialist Career &amp; Technical Mastery Academy · 60 Tangible-Competence Careers (#1–#60)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                All 60 Specialized Careers Across 14 Technical Domains — Each With 9 Milestones, Implementation Plan, Pathway &amp; Walkthrough
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Every career pathway requires tangible evidence of competence (a working system, technical report, calculation sheet, design, simulation, or portfolio artifact) plus a dedicated 4-Phase Implementation Plan, 5-Stage Career Pathway, and 6-Step Operational Walkthrough.
              </p>
            </div>

            <div className="w-full lg:w-80">
              <div className="flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                <Search className="h-4 w-4 text-[#0A66C2] mr-2 shrink-0" />
                <input
                  type="text"
                  value={specialistSearchQuery}
                  onChange={(e) => setSpecialistSearchQuery(e.target.value)}
                  placeholder="Search 60 specialist careers (#1–#60)..."
                  className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5 Priority Deep-Dive Academies Filter Bar */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
              Filter by 5 Priority Deep-Dive Academies:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => setSpecialistAcademyFilter("all")}
                className={`rounded-xl p-3 text-left border transition-all cursor-pointer ${
                  specialistAcademyFilter === "all"
                    ? "bg-[#0A66C2] text-white border-[#0A66C2] shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <div className="text-[10px] font-mono font-bold uppercase opacity-80">
                  All Academies
                </div>
                <div className="text-xs font-black mt-0.5">
                  All 60 Specialist Careers
                </div>
              </button>
              {FIVE_PRIORITY_ACADEMIES.map((acad) => {
                const isSelected = specialistAcademyFilter === acad.id
                return (
                  <button
                    key={acad.id}
                    type="button"
                    onClick={() =>
                      setSpecialistAcademyFilter(
                        isSelected ? "all" : acad.id
                      )
                    }
                    className={`rounded-xl p-3 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0A66C2] text-white border-[#0A66C2] shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-indigo-400"
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold uppercase opacity-80">
                      Academy {acad.academyNumber}
                    </div>
                    <div className="text-xs font-black line-clamp-1 mt-0.5">
                      {acad.title}
                    </div>
                    <div className="text-[10px] opacity-75 truncate mt-0.5">
                      {acad.focusAreas}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 14 Domains Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSpecialistDomainFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold shrink-0 cursor-pointer ${
                specialistDomainFilter === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              All 14 Domains ({ALL_60_SPECIALIST_CAREER_SPECS.length})
            </button>
            {Array.from(
              new Map(
                ALL_60_SPECIALIST_CAREER_SPECS.map((s) => [
                  s.domainNumber,
                  s.domainTitle
                ])
              ).entries()
            ).map(([dNum, dTitle]) => (
              <button
                key={dNum}
                type="button"
                onClick={() =>
                  setSpecialistDomainFilter(
                    specialistDomainFilter === dNum ? "all" : dNum
                  )
                }
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold shrink-0 cursor-pointer ${
                  specialistDomainFilter === dNum
                    ? "bg-[#0A66C2] text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                {dTitle}
              </button>
            ))}
          </div>

          {/* 60 Specialist Career Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered60SpecialistSpecs.map((spec) => {
              const isSemi = spec.careerNumber === 42
              return (
                <div
                  key={spec.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                    isSemi
                      ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/15"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-[#0A66C2]"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-black ${
                          isSemi
                            ? "bg-amber-500 text-slate-950"
                            : "bg-[#0A66C2] text-white"
                        }`}
                      >
                        Career #{spec.careerNumber}{" "}
                        {isSemi ? "· 12-WK VERBATIM FLAGSHIP" : ""}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                        {spec.domainTitle}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                      {spec.title}
                    </h4>

                    <div className="rounded-xl bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        Tangible Portfolio Evidence:
                      </strong>{" "}
                      {spec.tangibleEvidenceType}
                    </div>

                    <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {spec.coreCurriculumBullets.slice(0, 3).map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#0A66C2] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="rounded-xl bg-slate-950 text-emerald-300 p-2.5 font-mono text-[11px] border border-slate-800">
                      <span className="text-amber-300 font-bold block">
                        📐 {spec.workedFormulaTitle}
                      </span>
                      <span className="line-clamp-1">
                        {spec.workedFormulaEquations[0]}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300">
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        Capstone:
                      </strong>{" "}
                      {spec.capstoneProject}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/70 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleLoadSpecialistCareer(spec, "lessons")}
                      className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white py-2 px-2.5 text-xs font-black cursor-pointer text-center"
                    >
                      Open 9 Milestones →
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleLoadSpecialistCareer(
                          spec,
                          "plan_pathway_walkthrough"
                        )
                      }
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2.5 text-xs font-black cursor-pointer text-center"
                    >
                      🗺️ Plan &amp; Walkthrough
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 10-Component Production Standard & 5 Selection Criteria Reference Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 space-y-2.5">
              <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-900 dark:text-zinc-100">
                10-Component Production Standard Included in Every Career Pathway
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TEN_COMPONENT_PRODUCTION_STANDARD.map((item) => (
                  <div
                    key={item.number}
                    className="rounded-xl bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-800 text-xs"
                  >
                    <span className="font-mono font-black text-[#0A66C2] dark:text-sky-400 mr-1.5">
                      {item.number}
                    </span>
                    <strong className="text-zinc-900 dark:text-zinc-100">
                      {item.component}:
                    </strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                      {item.whatToInclude}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 space-y-2.5">
              <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-900 dark:text-zinc-100">
                5-Criteria Model for Selecting High-Value Tangible-Competence Careers
              </h4>
              <div className="space-y-2">
                {FIVE_CAREER_SELECTION_CRITERIA.map((crit) => (
                  <div
                    key={crit.number}
                    className="rounded-xl bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-800 text-xs"
                  >
                    <span className="font-mono font-black text-emerald-600 mr-1.5">
                      0{crit.number}
                    </span>
                    <strong className="text-zinc-900 dark:text-zinc-100">
                      {crit.title}:
                    </strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {crit.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1C: RELATED TRAINING VIDEOS & VISUAL SIMULATORS HUB              */}
      {/* ===================================================================== */}
      {(activeSubView === "training_videos_hub" ||
        activeSubView === "all_combined") && (
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-400/40 px-3 py-0.5 text-xs font-bold text-indigo-300">
                Step 3 · Related Training Videos &amp; Interactive Visual Walkthroughs (All 12 Multi-Domain Videos Track Watch Telemetry)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Visual Lab Demonstrations, Cleanroom &amp; Field Walkthroughs Supporting the Training Tab
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubView("recommendations")}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-black cursor-pointer self-start sm:self-auto shrink-0"
            >
              🎯 View My Watch-Based Recommendations ({watchRecommendations.totalWatchFormatted}) →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACADEMY_TRAINING_VIDEOS.map((vid) => {
              const matchingSpec = ALL_60_SPECIALIST_CAREER_SPECS.find(
                (s) => s.careerNumber === vid.careerNumber
              )
              const watchedSec = watchTelemetry.videoWatchSeconds[vid.id] || 0
              const recEntry = watchRecommendations.recommendedNextVideos.find(
                (r) => r.video.id === vid.id
              )
              return (
                <div
                  key={vid.id}
                  className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full bg-black">
                      <video
                        src={vid.videoUrl}
                        poster={vid.thumbnailUrl}
                        controls
                        onPlay={() => handleVideoPlayTelemetry(vid)}
                        onTimeUpdate={(e) =>
                          handleVideoTimeUpdateTelemetry(
                            vid,
                            e.currentTarget.currentTime
                          )
                        }
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black pointer-events-none">
                        Career #{vid.careerNumber} · {vid.duration}
                      </span>
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-slate-950/90 border border-emerald-400/50 text-emerald-300 px-2.5 py-0.5 text-[10px] font-mono font-bold pointer-events-none">
                        Watched: {formatWatchDuration(watchedSec)}
                        {recEntry ? ` · ${recEntry.matchPercent}% Match` : ""}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-mono text-sky-300 uppercase">
                        {vid.domainTitle}
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white">
                        {vid.title}
                      </h4>
                      <p className="text-xs text-indigo-100 leading-relaxed">
                        {vid.summary}
                      </p>
                      <div className="rounded-xl bg-slate-950/80 border border-white/10 p-2.5 text-[11px] font-mono text-emerald-300">
                        {vid.keyTechnicalTakeaway}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex items-center gap-1.5">
                    {matchingSpec && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleLoadSpecialistCareer(matchingSpec, "lessons")
                          }
                          className="flex-1 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white py-2 px-2 text-xs font-black cursor-pointer"
                        >
                          Open Career #{vid.careerNumber} →
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleLoadSpecialistCareer(
                              matchingSpec,
                              "plan_pathway_walkthrough"
                            )
                          }
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2.5 text-xs font-black cursor-pointer"
                        >
                          🗺️ Plan
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleBoostVideoWatchTime(vid, 300)}
                      className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 px-2.5 text-xs font-black cursor-pointer"
                      title="Simulate +5 minutes of watch time on this video"
                    >
                      +5m Watch
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: SEVEN FLAGSHIP LAUNCH PATHWAYS SHOWCASE                       */}
      {/* ===================================================================== */}
      {(activeSubView === "priority_pathways" || activeSubView === "all_combined") && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A66C2] dark:text-sky-400">
                Step 4 · Seven Flagship Launch Pathways (Including Semiconductor Manufacturing Technology #7)
              </span>
              <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                Flagship 12-Week Career Systems — Full Teaching Material, Math, Labs, Assessments &amp; Implementation Walkthroughs
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_7_FLAGSHIP_PATHWAYS.map((pathway) => {
              const isSelected = activePathway.id === pathway.id
              return (
                <div
                  key={pathway.id}
                  className={`rounded-2xl border overflow-hidden transition-all flex flex-col justify-between group ${
                    isSelected
                      ? "border-[#0A66C2] ring-2 ring-[#0A66C2]/25 bg-blue-50/30 dark:bg-sky-950/20 shadow-md"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-indigo-400 hover:shadow-md"
                  }`}
                >
                  <div
                    onClick={() => selectPathwayAndOpenClassroom(pathway, 1, "lessons")}
                    className="cursor-pointer"
                  >
                    <div className="relative h-36 w-full overflow-hidden bg-slate-950">
                      <img
                        src={pathway.coverImage}
                        alt={pathway.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                      <div className="absolute top-2.5 left-2.5 rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black">
                        Flagship #{pathway.priorityRank}
                      </div>
                      <div className="absolute top-2.5 right-2.5 rounded-full bg-black/75 px-2.5 py-0.5 text-[10px] font-mono text-white border border-white/20">
                        {pathway.suggestedDuration} · 9 Milestones
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <span className="text-[10px] font-semibold text-sky-300 uppercase">
                          {pathway.categoryTitle}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white">
                          {pathway.title}
                        </h4>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{pathway.level}</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">
                          {pathway.bestLearningFormat}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                        <strong>Module 1:</strong> {pathway.milestones[0]?.title} —{" "}
                        {pathway.milestones[0]?.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2 bg-white/80 dark:bg-zinc-900/80">
                    <button
                      type="button"
                      onClick={() => selectPathwayAndOpenClassroom(pathway, 1, "lessons")}
                      className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-1.5 text-xs font-black cursor-pointer"
                    >
                      Open 9-Milestone Classroom →
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        selectPathwayAndOpenClassroom(
                          pathway,
                          1,
                          "plan_pathway_walkthrough"
                        )
                      }
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-black cursor-pointer"
                    >
                      🗺️ Plan &amp; Walkthrough
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: ALL 13 INDUSTRY CATEGORIES (108+ CLICKABLE CAREERS MAP)       */}
      {/* ===================================================================== */}
      {(activeSubView === "industry_map" || activeSubView === "all_combined") && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A66C2] dark:text-sky-400">
                Step 3 · Interactive 13-Industry &amp; 108-Career Directory
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                Click Any Career Below to Open Its 9-Milestone Classroom Immediately
              </h3>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", label: "All 13 Industries" },
                { id: "core_categories", label: "Categories 1–6 (Core Technical)" },
                { id: "vibe_differentiators", label: "Categories 7–13 (Differentiators)" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setCategoryGroupFilter(
                      tab.id as "all" | "core_categories" | "vibe_differentiators"
                    )
                    setSelectedCategoryNumber("all")
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer ${
                    categoryGroupFilter === tab.id
                      ? "bg-[#0A66C2] text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 13 Category Number Quick-Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategoryNumber("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold shrink-0 cursor-pointer ${
                selectedCategoryNumber === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Show All ({MASTER_INDUSTRY_CATEGORIES.length})
            </button>
            {MASTER_INDUSTRY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryNumber(cat.categoryNumber)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 cursor-pointer ${
                  selectedCategoryNumber === cat.categoryNumber
                    ? "bg-[#0A66C2] text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                {cat.categoryNumber}. {cat.title.split("&")[0].trim()}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                    <img
                      src={cat.coverImage}
                      alt={cat.title}
                      className="h-full w-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute top-2.5 left-3 flex items-center gap-2">
                      <span className="rounded-full bg-[#0A66C2] text-white px-2.5 py-0.5 text-[10px] font-black">
                        Category {cat.categoryNumber}
                      </span>
                      <span className="rounded-full bg-black/70 text-amber-300 px-2.5 py-0.5 text-[10px] font-mono">
                        {cat.careers.length} Careers
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h4 className="text-sm sm:text-base font-black text-white">
                        {cat.categoryNumber}. {cat.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {cat.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.careers.map((career) => {
                        const isCurrentlyActive =
                          activePathway.title.toLowerCase() === career.toLowerCase()
                        return (
                          <button
                            key={career}
                            type="button"
                            onClick={() =>
                              handleLoadCareerFromCatalog(career, cat.title)
                            }
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                              isCurrentlyActive
                                ? "bg-[#0A66C2] text-white shadow-xs"
                                : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2] hover:text-[#0A66C2]"
                            }`}
                          >
                            <span>{career}</span>
                            <ChevronRight className="h-3 w-3 opacity-60 shrink-0" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-1">
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      Capstone:
                    </strong>{" "}
                    {cat.capstoneRequirement}
                  </p>
                  {cat.regulatoryNotice && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                      ⚠️ {cat.regulatoryNotice}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 4: BUSINESS OWNERSHIP TRACKS & CAREER SPECIFICATION BUILDER      */}
      {/* ===================================================================== */}
      {(activeSubView === "business_and_builder" ||
        activeSubView === "all_combined") && (
        <div className="space-y-6">
          {/* 4 Independent Business Ownership Pathways */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl space-y-5">
            <div className="space-y-1">
              <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-0.5 text-xs font-bold text-amber-300">
                Step 4A · Career Paths That Lead to Business Ownership
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Become an Independent Contractor, Technical Consultant, or Specialist Founder
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {BUSINESS_OWNERSHIP_TRACKS.map((biz) => (
                <div
                  key={biz.id}
                  className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 p-4 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-900 relative">
                      <img
                        src={biz.coverImage}
                        alt={biz.title}
                        className="h-full w-full object-cover opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2.5 text-xs font-black text-amber-300">
                        {biz.title}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-100">{biz.tagline}</p>
                    <div className="flex flex-wrap gap-1">
                      {biz.coreCompetencies.map((comp) => (
                        <span
                          key={comp}
                          className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <p className="text-[11px] text-emerald-300">
                      <strong>Capstone:</strong> {biz.capstoneDeliverable}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleLoadCareerFromCatalog(
                          biz.title,
                          "Business Ownership & Independent Practice",
                          "Independent business ownership"
                        )
                      }
                      className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 text-xs font-black cursor-pointer"
                    >
                      Open 9-Milestone Ownership Track →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7 Reusable Career-Path Specification Generator */}
          <div className="rounded-3xl border-2 border-indigo-500/40 bg-white dark:bg-zinc-900 p-6 shadow-lg space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                  Step 4B · Reusable Career-Path Specification Generator
                </span>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                  Build Any Custom 9-Milestone Career Curriculum in Seconds
                </h3>
              </div>
              <button
                type="button"
                onClick={handleDownloadCareerSpecBrief}
                className="rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 cursor-pointer self-start"
              >
                <Download className="h-4 w-4" />
                <span>Download Spec Brief (.md)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  1. Career or specialization
                </label>
                <input
                  type="text"
                  value={specCareerTitle}
                  onChange={(e) => setSpecCareerTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  2. Industry Category
                </label>
                <select
                  value={specCategoryTitle}
                  onChange={(e) => setSpecCategoryTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
                >
                  {MASTER_INDUSTRY_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.title}>
                      {cat.categoryNumber}. {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  3. Learner level
                </label>
                <select
                  value={specLearnerLevel}
                  onChange={(e) =>
                    setSpecLearnerLevel(
                      e.target.value as CareerSpecGeneratorInput["learnerLevel"]
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Beginner to advanced">Beginner to advanced</option>
                  <option value="Intermediate to specialist">
                    Intermediate to specialist
                  </option>
                  <option value="Experienced professional to leadership">
                    Experienced professional to leadership
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  4. Program duration
                </label>
                <select
                  value={specDuration}
                  onChange={(e) =>
                    setSpecDuration(
                      e.target.value as CareerSpecGeneratorInput["programDuration"]
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
                >
                  <option value="4 weeks — introductory">4 weeks — introductory</option>
                  <option value="8 weeks — focused skills">8 weeks — focused skills</option>
                  <option value="12 weeks — intensive pathway">
                    12 weeks — intensive pathway
                  </option>
                  <option value="24 weeks — extended pathway">
                    24 weeks — extended pathway
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  5. Delivery method
                </label>
                <select
                  value={specDelivery}
                  onChange={(e) =>
                    setSpecDelivery(
                      e.target.value as CareerSpecGeneratorInput["deliveryMethod"]
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Online">Online</option>
                  <option value="Hybrid: online and hands-on">
                    Hybrid: online and hands-on
                  </option>
                  <option value="Instructor-led practical training">
                    Instructor-led practical training
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  6. Target outcome
                </label>
                <select
                  value={specOutcome}
                  onChange={(e) =>
                    setSpecOutcome(
                      e.target.value as CareerSpecGeneratorInput["targetOutcome"]
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Job readiness and professional portfolio">
                    Job readiness and professional portfolio
                  </option>
                  <option value="Advanced specialization">
                    Advanced specialization
                  </option>
                  <option value="Supervisory or leadership role">
                    Supervisory or leadership role
                  </option>
                  <option value="Independent business ownership">
                    Independent business ownership
                  </option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleGenerateCustomCareerSpec}
                className="rounded-xl bg-gradient-to-r from-[#0A66C2] to-indigo-600 hover:from-[#004182] hover:to-indigo-700 px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg cursor-pointer"
              >
                Generate 9-Milestone Specification &amp; Open in Classroom →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 5: VERIFIED SKILL PASSPORT & AUTHORITATIVE REFERENCE LIBRARY     */}
      {/* ===================================================================== */}
      {(activeSubView === "passport_and_refs" ||
        activeSubView === "all_combined") && (
        <div className="space-y-6">
          {/* Verified Skill Passport */}
          <div className="rounded-3xl border border-emerald-500/30 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 5A · Verified Skill Passport &amp; Portfolio Evidence
                </span>
                <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                  Completed Milestones &amp; Deliverable Artifacts for {activePathway.title}
                </h3>
                <p className="text-xs text-zinc-500">
                  Platform completion records are clearly distinguished from accredited academic qualifications and statutory professional licenses.
                </p>
              </div>
              <span className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                {completedMilestoneCount} of 9 Milestones Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activePathway.milestones.map((m) => {
                const mKey = `${activePathway.id}-m${m.milestoneNumber}`
                const isDone = !!completedMilestones[mKey]
                return (
                  <div
                    key={m.milestoneNumber}
                    className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${
                      isDone
                        ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold text-zinc-500">
                          MILESTONE 0{m.milestoneNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                          }`}
                        >
                          {isDone ? "Verified ✓" : "In Progress"}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Artifact: {m.professionalDeliverable.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMilestoneNum(m.milestoneNumber)
                        setActiveSubView("classroom")
                      }}
                      className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline text-left cursor-pointer"
                    >
                      Open Milestone {m.milestoneNumber} →
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Authoritative Reference Library */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A66C2] dark:text-sky-400">
                Step 5B · Authoritative Reference Library
              </span>
              <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                Primary Standards Linked Directly From Academy Lessons
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {ACADEMY_REFERENCE_LIBRARY.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-4 hover:border-[#0A66C2] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <span className="inline-block rounded bg-blue-100 dark:bg-blue-950/70 px-2 py-0.5 text-[9px] font-mono font-bold text-[#0A66C2] dark:text-sky-300">
                      {ref.badge}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2]">
                      {ref.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                      {ref.focus}
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px] font-bold text-[#0A66C2] dark:text-sky-400">
                    <span>{ref.organization}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 10-PAGE VERSIONED TECHNICAL LEARNING GUIDE MODAL                      */}
      {/* ===================================================================== */}
      <Dialog open={whitePaperModalOpen} onOpenChange={setWhitePaperModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <DialogHeader className="sticky top-0 z-20 bg-slate-950 text-white p-5 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="rounded bg-amber-500 text-slate-950 px-2 py-0.5 text-[10px] font-black">
                    COMPONENT 03 · VERSIONED TECHNICAL LEARNING GUIDE (10 PAGES)
                  </span>
                  <span className="text-[11px] font-mono text-sky-300">
                    {activePathway.title} · Milestone {activeMilestone.milestoneNumber}
                  </span>
                </div>
                <DialogTitle className="text-base sm:text-lg font-black text-white">
                  {activeMilestone.title} — Technical Reference &amp; Calculations
                </DialogTitle>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setWpContinuousScroll(!wpContinuousScroll)}
                  className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                >
                  {wpContinuousScroll ? "Paginated View" : "Continuous 10-Page Scroll"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadTextFile(
                      `${activePathway.id}-m${activeMilestone.milestoneNumber}-10page-technical-guide.md`,
                      activeMilestone.whitePaperFullMarkdown
                    )
                  }
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .MD</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {!wpContinuousScroll && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-3">
                {activeMilestone.whitePaperPages.map((p) => (
                  <button
                    key={p.pageNumber}
                    type="button"
                    onClick={() => setActiveWpPage(p.pageNumber)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold cursor-pointer shrink-0 ${
                      activeWpPage === p.pageNumber
                        ? "bg-amber-400 text-slate-950"
                        : "bg-white/10 text-zinc-300 hover:bg-white/20"
                    }`}
                  >
                    Pg {p.pageNumber}
                  </button>
                ))}
              </div>
            )}
          </DialogHeader>

          <div className="p-6 space-y-6">
            {(wpContinuousScroll
              ? activeMilestone.whitePaperPages
              : activeMilestone.whitePaperPages.filter(
                  (p) => p.pageNumber === activeWpPage
                )
            ).map((page) => (
              <div
                key={page.pageNumber}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <span className="text-[11px] font-mono font-bold text-zinc-500">
                    {page.runningHeader}
                  </span>
                  <span className="rounded-full bg-[#0A66C2]/10 text-[#0A66C2] dark:text-sky-400 px-3 py-0.5 text-xs font-bold">
                    Page {page.pageNumber} of 10
                  </span>
                </div>

                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {page.sectionTitle}
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {page.bodyParagraphs.map((bp, i) => (
                    <p key={i}>{bp}</p>
                  ))}
                </div>

                <div className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs border border-slate-800">
                  <strong>Specification / Formula:</strong> {page.keyEquationOrSpec}
                </div>

                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 text-xs text-amber-950 dark:text-amber-200">
                  <strong>{page.calloutBox.title}:</strong> {page.calloutBox.text}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
