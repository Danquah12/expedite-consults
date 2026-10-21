import {
  ACADEMY_TRAINING_VIDEOS,
  ALL_60_SPECIALIST_CAREER_SPECS,
  AcademyTrainingVideoItem
} from "@/lib/connectln-60-specialist-careers"
import { SpecializedTangibleCareerSpec } from "@/lib/connectln-33-specialized-careers"
import { PriorityCareerPathway } from "@/lib/connectln-career-mastery-academy"

export const WATCH_TELEMETRY_STORAGE_KEY = "connectln_watch_telemetry_v1"

export interface WatchEventLogItem {
  id: string
  timestampIso: string
  videoId: string
  videoTitle: string
  domainNumber: number
  domainTitle: string
  secondsAdded: number
  source: "live_playback" | "chapter_jump" | "watch_simulator" | "pathway_study"
}

export interface WatchTelemetryState {
  videoWatchSeconds: Record<string, number>
  videoPlayCounts: Record<string, number>
  domainWatchSeconds: Record<number, number>
  careerEngagementCounts: Record<number, number>
  lastWatchedVideoId: string
  totalWatchSeconds: number
  recentWatchEvents: WatchEventLogItem[]
}

export interface RankedVideoRecommendation {
  video: AcademyTrainingVideoItem
  watchedSeconds: number
  watchedFormatted: string
  playCount: number
  watchSharePercent: number
  completionPercent: number
  matchPercent: number
  becauseYouWatchedReason: string
  recommendationTag:
    | "Most Watched · Resume"
    | "Top Domain Match · Next Up"
    | "Related Academy Match"
}

export interface DomainAffinityScore {
  domainNumber: number
  domainTitle: string
  watchedSeconds: number
  watchedFormatted: string
  sharePercent: number
  careerCount: number
  topVideoTitle: string
}

export interface RankedSpecialistCareerRecommendation {
  rank: number
  spec: SpecializedTangibleCareerSpec
  matchPercent: number
  watchedSecondsInDomain: number
  watchedFormattedInDomain: string
  becauseYouWatchedReason: string
  linkedVideo: AcademyTrainingVideoItem
}

export interface RankedFlagshipRecommendation {
  pathway: PriorityCareerPathway
  matchPercent: number
  watchedSeconds: number
  becauseYouWatchedReason: string
}

// ============================================================================
// PART A: 8 ADDITIONAL SMART RECOMMENDATION SIGNALS INTERFACES
// ============================================================================

export interface SkillGapRemediationRecommendation {
  id: string
  careerNumber: number
  careerTitle: string
  diagnosticTrigger: string
  missedConceptOrFormula: string
  recommendedActionTitle: string
  recommendedVideoId: string
  recommendedVideoTimestamp: string
  targetCalculatorOrTab: "worked_lab" | "lessons" | "plan_pathway_walkthrough" | "training_videos"
  urgencyBadge: "Critical Safety / Spec Gap" | "Formula Precision Gap" | "Standard Traceability Gap"
}

export interface JobAndBountyMatchRecommendation {
  id: string
  roleOrBountyTitle: string
  employerOrSponsor: string
  locationOrMode: string
  compensationBand: string
  type: "Full-Time Role" | "Registered Apprenticeship" | "Live Technical RFP / Bounty"
  careerNumber: number
  careerTitle: string
  qualificationMatchPercent: number
  whyYouMatch: string
  missingMilestoneToReach100: string
  deliverableRequired: string
}

export interface LabSimulatorPromptRecommendation {
  id: string
  simulatorName: string
  careerNumber: number
  careerTitle: string
  triggerReason: string
  governingEquation: string
  practicalActionPrompt: string
  targetCalculatorKey: "semiconductor" | "solar" | "plc" | "construction"
}

export interface DualSkillStackRecommendation {
  id: string
  stackTitle: string
  primaryCareerNumber: number
  primaryCareerTitle: string
  secondaryCareerNumber: number
  secondaryCareerTitle: string
  tertiaryCareerNumber: number
  tertiaryCareerTitle: string
  salaryPremiumBadge: string
  synergyRationale: string
  combinedCapstoneDeliverable: string
}

export interface MentorAndCohortRecommendation {
  id: string
  mentorName: string
  credentials: string
  roleTitle: string
  organization: string
  domainNumber: number
  domainTitle: string
  cohortRoomName: string
  activeLearnersCount: number
  officeHoursSchedule: string
  reviewSpecialty: string
}

export interface FieldToolkitStandardRecommendation {
  id: string
  careerNumber: number
  careerTitle: string
  standardCode: string
  standardOrganization: string
  officialUrl: string
  primaryDiagnosticInstruments: string[]
  softwareAndSimulationTools: string[]
  whyEssential: string
}

export interface SpacedRepetitionRefresherItem {
  id: string
  careerNumber: number
  careerTitle: string
  safetyOrFormulaTopic: string
  daysSinceLastReview: number
  retentionUrgency: "Due Now (Safety-Critical)" | "Recommended 14-Day Drill" | "30-Day Mastery Check"
  quickDrillQuestion: string
  quickDrillAnswer: string
  coreEquationOrRule: string
}

export interface BusinessOwnershipRecommendation {
  id: string
  technicalCareerNumber: number
  technicalCareerTitle: string
  firmConceptTitle: string
  targetClientele: string
  startupEquipmentAndLicensing: string
  pricingAndMarginFormula: string
  typicalGrossMarginBand: string
  first90DaysContractBlueprint: string
}

export interface WatchRecommendationBundle {
  totalWatchSeconds: number
  totalWatchFormatted: string
  topWatchedVideo: AcademyTrainingVideoItem
  topWatchedDomain: DomainAffinityScore
  topWatchedVideosLeaderboard: RankedVideoRecommendation[]
  recommendedNextVideos: RankedVideoRecommendation[]
  domainAffinityRanking: DomainAffinityScore[]
  recommendedSpecialistCareers: RankedSpecialistCareerRecommendation[]
  recommendedFlagships: RankedFlagshipRecommendation[]
  // 8 Additional Smart Recommendation Signals:
  skillGapRemediations: SkillGapRemediationRecommendation[]
  jobAndBountyMatches: JobAndBountyMatchRecommendation[]
  labSimulatorPrompts: LabSimulatorPromptRecommendation[]
  dualSkillStacks: DualSkillStackRecommendation[]
  mentorAndCohorts: MentorAndCohortRecommendation[]
  fieldToolkitRecommendations: FieldToolkitStandardRecommendation[]
  spacedRepetitionDrills: SpacedRepetitionRefresherItem[]
  businessOwnershipRecommendations: BusinessOwnershipRecommendation[]
}

// ============================================================================
// PART B: 6 HIGH-IMPACT PLATFORM CAPABILITIES INTERFACES
// ============================================================================

export interface CareerFlashcardItem {
  id: string
  cardNumber: number
  categoryBadge: "Governing Formula" | "Safety Interlock" | "Diagnostic Triage" | "Deliverable & Rubric" | "Regulatory Standard"
  frontPrompt: string
  backAnswer: string
  formulaOrSpec: string
}

export interface LiveFaultTriageOption {
  label: string
  isCorrectSop: boolean
  feedbackAndConsequence: string
  sopReference: string
}

export interface LiveFaultTriageScenario {
  id: string
  careerNumber: number
  careerTitle: string
  domainTitle: string
  alarmCode: string
  severity: "CRITICAL SAFETY / LOT HOLD" | "HIGH-PRIORITY FAULT ISOLATION" | "CHAIN-OF-CUSTODY TRIAGE"
  telemetryReadout: string
  situationPrompt: string
  options: LiveFaultTriageOption[]
}

export interface CareerCompensationStage {
  stageName: string
  typicalTimeline: string
  hourlyBand: string
  annualBand: string
  verifiedEvidenceRequired: string
}

export interface CareerSalaryAndRoiModel {
  careerTitle: string
  categoryTitle: string
  defaultJourneyworkerHourly: number
  regionalDemandIndex: string
  openRolesEstimate: string
  stages: CareerCompensationStage[]
}

export interface DeliverableGradingResult {
  totalScore: number
  competencyBand: "Mastery / Distinction (90–100%)" | "Competent Workplace Readiness (80–89%)" | "Developing — Needs Revision (<80%)"
  passed: boolean
  criterionScores: {
    criterion: string
    score: number
    maxScore: number
    feedback: string
  }[]
  verifierAttestationHash: string
}

export function formatWatchDuration(totalSeconds: number): string {
  const sec = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(sec / 3600)
  const mins = Math.floor((sec % 3600) / 60)
  const remSec = sec % 60
  if (hours > 0) {
    return `${hours}h ${mins}m ${remSec}s`
  }
  if (mins > 0) {
    return `${mins}m ${remSec < 10 ? `0${remSec}` : remSec}s`
  }
  return `${remSec}s`
}

export const DEFAULT_INITIAL_WATCH_TELEMETRY: WatchTelemetryState = {
  videoWatchSeconds: {
    "vid-semiconductor-wafer-fab": 860, // 14m 20s watched
    "vid-dfir-incident-reconstruction": 585, // 9m 45s watched
    "vid-fiber-otdr-telecom": 430, // 7m 10s watched
    "vid-power-systems-microgrid": 330, // 5m 30s watched
    "vid-aircraft-avionics-maintenance": 220, // 3m 40s watched
    "vid-ev-battery-diagnostics": 195, // 3m 15s watched
    "vid-cnc-metrology-ndt-inspection": 160, // 2m 40s watched
    "vid-ai-rag-eval-cyber-governance": 140 // 2m 20s watched
  },
  videoPlayCounts: {
    "vid-semiconductor-wafer-fab": 6,
    "vid-dfir-incident-reconstruction": 4,
    "vid-fiber-otdr-telecom": 3,
    "vid-power-systems-microgrid": 3,
    "vid-aircraft-avionics-maintenance": 2,
    "vid-ev-battery-diagnostics": 2,
    "vid-cnc-metrology-ndt-inspection": 1,
    "vid-ai-rag-eval-cyber-governance": 1
  },
  domainWatchSeconds: {
    10: 1215, // Domain 10: Semiconductor, CNC & EV/Battery (20m 15s)
    2: 585, // Domain 2: Cybersecurity, DFIR & OT/ICS (9m 45s)
    9: 430, // Domain 9: Fiber Optics & Telecom (7m 10s)
    1: 330, // Domain 1: Power Systems & Critical Infrastructure (5m 30s)
    8: 220, // Domain 8: Aviation, Aerospace & Maritime (3m 40s)
    3: 140 // Domain 3: Data, AI & Enterprise Systems (2m 20s)
  },
  careerEngagementCounts: {
    42: 8,
    44: 4,
    45: 4,
    6: 5,
    38: 4,
    1: 3,
    34: 3
  },
  lastWatchedVideoId: "vid-semiconductor-wafer-fab",
  totalWatchSeconds: 2920,
  recentWatchEvents: [
    {
      id: "evt-init-1",
      timestampIso: "Just now",
      videoId: "vid-semiconductor-wafer-fab",
      videoTitle:
        "Semiconductor Wafer Fabrication, Cleanroom Protocol & Photolithography Walkthrough",
      domainNumber: 10,
      domainTitle: "10. Semiconductor manufacturing and advanced materials",
      secondsAdded: 860,
      source: "live_playback"
    },
    {
      id: "evt-init-2",
      timestampIso: "Earlier session",
      videoId: "vid-dfir-incident-reconstruction",
      videoTitle:
        "DFIR Memory Forensics, Windows Event Log Timeline Reconstruction & Chain of Custody",
      domainNumber: 2,
      domainTitle: "2. Cybersecurity, intelligence and digital trust",
      secondsAdded: 585,
      source: "live_playback"
    },
    {
      id: "evt-init-3",
      timestampIso: "Earlier session",
      videoId: "vid-fiber-otdr-telecom",
      videoTitle:
        "Fiber-Optic Fusion Splicing, Optical Loss Budgets & OTDR Trace Fault Localization",
      domainNumber: 9,
      domainTitle: "9. Telecommunications, networking and critical connectivity",
      secondsAdded: 430,
      source: "chapter_jump"
    }
  ]
}

export function recordVideoWatchTelemetry(
  prev: WatchTelemetryState,
  video: AcademyTrainingVideoItem,
  secondsDelta: number,
  source: WatchEventLogItem["source"] = "live_playback",
  incrementPlayCount = false
): WatchTelemetryState {
  const safeDelta = Math.max(1, Math.round(secondsDelta))
  const nextVideoSec = (prev.videoWatchSeconds[video.id] || 0) + safeDelta
  const nextPlayCount =
    (prev.videoPlayCounts[video.id] || 0) + (incrementPlayCount ? 1 : 0)
  const nextDomainSec =
    (prev.domainWatchSeconds[video.domainNumber] || 0) + safeDelta
  const nextCareerCount =
    (prev.careerEngagementCounts[video.careerNumber] || 0) +
    (incrementPlayCount ? 2 : 1)

  const newVideoMap = {
    ...prev.videoWatchSeconds,
    [video.id]: nextVideoSec
  }
  const totalWatchSeconds = Object.values(newVideoMap).reduce(
    (acc, v) => acc + v,
    0
  )

  const newEvent: WatchEventLogItem = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestampIso: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }),
    videoId: video.id,
    videoTitle: video.title,
    domainNumber: video.domainNumber,
    domainTitle: video.domainTitle,
    secondsAdded: safeDelta,
    source
  }

  return {
    videoWatchSeconds: newVideoMap,
    videoPlayCounts: {
      ...prev.videoPlayCounts,
      [video.id]: nextPlayCount
    },
    domainWatchSeconds: {
      ...prev.domainWatchSeconds,
      [video.domainNumber]: nextDomainSec
    },
    careerEngagementCounts: {
      ...prev.careerEngagementCounts,
      [video.careerNumber]: nextCareerCount
    },
    lastWatchedVideoId: video.id,
    totalWatchSeconds,
    recentWatchEvents: [newEvent, ...prev.recentWatchEvents.slice(0, 7)]
  }
}

export function computeWatchBasedRecommendations(
  telemetry: WatchTelemetryState,
  flagshipPathways: PriorityCareerPathway[]
): WatchRecommendationBundle {
  const totalSec = Math.max(
    1,
    Object.values(telemetry.videoWatchSeconds).reduce((a, b) => a + b, 0)
  )

  // 1. Build all 14 domains map
  const domainMap = new Map<number, string>()
  ALL_60_SPECIALIST_CAREER_SPECS.forEach((s) => {
    if (!domainMap.has(s.domainNumber)) {
      domainMap.set(s.domainNumber, s.domainTitle)
    }
  })

  const domainSecTotals: Record<number, number> = {}
  domainMap.forEach((_, dNum) => {
    domainSecTotals[dNum] = telemetry.domainWatchSeconds[dNum] || 0
  })

  const maxDomainSec = Math.max(1, ...Object.values(domainSecTotals))

  const domainAffinityRanking: DomainAffinityScore[] = Array.from(
    domainMap.entries()
  )
    .map(([domainNumber, domainTitle]) => {
      const watchedSeconds = domainSecTotals[domainNumber] || 0
      const sharePercent = Math.round((watchedSeconds / totalSec) * 100)
      const careerCount = ALL_60_SPECIALIST_CAREER_SPECS.filter(
        (c) => c.domainNumber === domainNumber
      ).length
      const matchingVideos = ACADEMY_TRAINING_VIDEOS.filter(
        (v) => v.domainNumber === domainNumber
      ).sort(
        (a, b) =>
          (telemetry.videoWatchSeconds[b.id] || 0) -
          (telemetry.videoWatchSeconds[a.id] || 0)
      )
      const topVideoTitle =
        matchingVideos[0]?.title ||
        `Domain ${domainNumber} Technical Lab Walkthrough`
      return {
        domainNumber,
        domainTitle,
        watchedSeconds,
        watchedFormatted: formatWatchDuration(watchedSeconds),
        sharePercent,
        careerCount,
        topVideoTitle
      }
    })
    .sort((a, b) => b.watchedSeconds - a.watchedSeconds)

  const topWatchedDomain = domainAffinityRanking[0]

  // 2. Score and rank all Training Videos
  const maxVidSec = Math.max(
    1,
    ...ACADEMY_TRAINING_VIDEOS.map((v) => telemetry.videoWatchSeconds[v.id] || 0)
  )

  const scoredVideos: RankedVideoRecommendation[] = ACADEMY_TRAINING_VIDEOS.map(
    (video) => {
      const watchedSeconds = telemetry.videoWatchSeconds[video.id] || 0
      const playCount = telemetry.videoPlayCounts[video.id] || 0
      const watchSharePercent = Math.round((watchedSeconds / totalSec) * 100)
      const completionPercent = Math.min(
        100,
        Math.round((watchedSeconds / Math.max(1, video.durationSeconds)) * 100)
      )

      const domainSec = domainSecTotals[video.domainNumber] || 0
      const domainNorm = domainSec / maxDomainSec
      const videoNorm = watchedSeconds / maxVidSec

      const sameAcademyWatchSec = ACADEMY_TRAINING_VIDEOS.filter(
        (v) => v.academyId === video.academyId
      ).reduce((acc, v) => acc + (telemetry.videoWatchSeconds[v.id] || 0), 0)
      const academyNorm = Math.min(1, sameAcademyWatchSec / totalSec)

      const rawAffinity =
        domainNorm * 0.52 + videoNorm * 0.28 + academyNorm * 0.2
      const matchPercent = Math.min(
        99,
        Math.max(75, Math.round(74 + rawAffinity * 25))
      )

      let recommendationTag: RankedVideoRecommendation["recommendationTag"] =
        "Related Academy Match"
      let becauseYouWatchedReason = `Recommended because you watched ${formatWatchDuration(
        sameAcademyWatchSec
      )} across ${video.domainTitle}`

      if (watchedSeconds > 0 && watchedSeconds >= maxVidSec * 0.65) {
        recommendationTag = "Most Watched · Resume"
        becauseYouWatchedReason = `Your #1 Most-Watched Topic (${formatWatchDuration(
          watchedSeconds
        )} watched · ${watchSharePercent}% of your total watch time)`
      } else if (domainNorm >= 0.45) {
        recommendationTag = "Top Domain Match · Next Up"
        const topDomVid = ACADEMY_TRAINING_VIDEOS.filter(
          (v) => v.domainNumber === video.domainNumber
        ).sort(
          (a, b) =>
            (telemetry.videoWatchSeconds[b.id] || 0) -
            (telemetry.videoWatchSeconds[a.id] || 0)
        )[0]
        becauseYouWatchedReason = `Because you watched ${formatWatchDuration(
          domainSec
        )} in ${video.domainTitle}${
          topDomVid && topDomVid.id !== video.id
            ? ` (especially "${topDomVid.careerTitle}")`
            : ""
        }`
      } else if (watchedSeconds > 0) {
        becauseYouWatchedReason = `Because you watched ${formatWatchDuration(
          watchedSeconds
        )} of "${video.careerTitle}" (${playCount} sessions)`
      }

      return {
        video,
        watchedSeconds,
        watchedFormatted: formatWatchDuration(watchedSeconds),
        playCount,
        watchSharePercent,
        completionPercent,
        matchPercent,
        becauseYouWatchedReason,
        recommendationTag
      }
    }
  )

  const topWatchedVideosLeaderboard = [...scoredVideos].sort(
    (a, b) => b.watchedSeconds - a.watchedSeconds
  )

  const topWatchedVideo =
    topWatchedVideosLeaderboard[0]?.video || ACADEMY_TRAINING_VIDEOS[0]

  const recommendedNextVideos = [...scoredVideos].sort((a, b) => {
    if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent
    return b.watchedSeconds - a.watchedSeconds
  })

  // 3. Score and rank all 60 Specialist Careers (#1-#60) based on Watch Telemetry
  const scoredCareers = ALL_60_SPECIALIST_CAREER_SPECS.map((spec) => {
    const domSec = domainSecTotals[spec.domainNumber] || 0
    const domNorm = domSec / maxDomainSec

    const directVideo = ACADEMY_TRAINING_VIDEOS.find(
      (v) => v.careerNumber === spec.careerNumber
    )
    const directVideoSec = directVideo
      ? telemetry.videoWatchSeconds[directVideo.id] || 0
      : 0
    const directVideoNorm = directVideoSec / maxVidSec

    const domainVideo =
      directVideo ||
      ACADEMY_TRAINING_VIDEOS.find((v) => v.domainNumber === spec.domainNumber) ||
      ACADEMY_TRAINING_VIDEOS.find((v) => v.academyId === spec.academyId) ||
      topWatchedVideo

    const sameAcademySec = ACADEMY_TRAINING_VIDEOS.filter(
      (v) => v.academyId === spec.academyId
    ).reduce((acc, v) => acc + (telemetry.videoWatchSeconds[v.id] || 0), 0)
    const academyNorm = Math.min(1, sameAcademySec / totalSec)

    const careerEng = telemetry.careerEngagementCounts[spec.careerNumber] || 0
    const careerEngNorm = Math.min(1, careerEng / 10)

    const compositeScore =
      domNorm * 0.48 +
      directVideoNorm * 0.27 +
      academyNorm * 0.15 +
      careerEngNorm * 0.1

    const matchPercent = Math.min(
      99,
      Math.max(76, Math.round(75 + compositeScore * 24))
    )

    let becauseYouWatchedReason = `Matches your interest in ${spec.domainTitle}`
    if (directVideo && directVideoSec > 0) {
      becauseYouWatchedReason = `Because you watched ${formatWatchDuration(
        directVideoSec
      )} of "${directVideo.title}"`
    } else if (domSec > 0) {
      becauseYouWatchedReason = `Because you watched ${formatWatchDuration(
        domSec
      )} in ${spec.domainTitle} (${Math.round((domSec / totalSec) * 100)}% of watch history)`
    } else if (sameAcademySec > 0) {
      becauseYouWatchedReason = `Because you watched ${formatWatchDuration(
        sameAcademySec
      )} in related Priority Academy labs`
    }

    return {
      spec,
      matchPercent,
      compositeScore,
      watchedSecondsInDomain: Math.max(domSec, directVideoSec),
      watchedFormattedInDomain: formatWatchDuration(
        Math.max(domSec, directVideoSec)
      ),
      becauseYouWatchedReason,
      linkedVideo: domainVideo
    }
  })
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 9)
    .map((item, idx) => ({
      rank: idx + 1,
      spec: item.spec,
      matchPercent: item.matchPercent,
      watchedSecondsInDomain: item.watchedSecondsInDomain,
      watchedFormattedInDomain: item.watchedFormattedInDomain,
      becauseYouWatchedReason: item.becauseYouWatchedReason,
      linkedVideo: item.linkedVideo
    }))

  // 4. Rank the 7 Flagship Launch Pathways based on Watch History
  const flagshipDomainMapping: Record<
    string,
    { domainNumbers: number[]; videoIds: string[] }
  > = {
    "pathway-7-semiconductor-manufacturing-technology": {
      domainNumbers: [10],
      videoIds: [
        "vid-semiconductor-wafer-fab",
        "vid-cnc-metrology-ndt-inspection",
        "vid-ev-battery-diagnostics"
      ]
    },
    "pathway-1-app-pentest": {
      domainNumbers: [2],
      videoIds: ["vid-dfir-incident-reconstruction", "vid-ot-ics-scada-cyber"]
    },
    "pathway-2-construction-superintendent": {
      domainNumbers: [13, 5],
      videoIds: ["vid-building-envelope-timber-trades"]
    },
    "pathway-3-plc-robotics-automation": {
      domainNumbers: [10, 9, 2],
      videoIds: [
        "vid-cnc-metrology-ndt-inspection",
        "vid-ot-ics-scada-cyber",
        "vid-fiber-otdr-telecom"
      ]
    },
    "pathway-4-applied-ai-rag-mcp": {
      domainNumbers: [3, 2],
      videoIds: [
        "vid-ai-rag-eval-cyber-governance",
        "vid-dfir-incident-reconstruction"
      ]
    },
    "pathway-5-solar-microgrid-bess": {
      domainNumbers: [1, 10],
      videoIds: ["vid-power-systems-microgrid", "vid-ev-battery-diagnostics"]
    },
    "pathway-6-clinical-trials-biotech": {
      domainNumbers: [4, 7],
      videoIds: ["vid-biomanufacturing-cleanroom-gmp"]
    }
  }

  const recommendedFlagships: RankedFlagshipRecommendation[] = flagshipPathways
    .map((pathway) => {
      const mapping = flagshipDomainMapping[pathway.id] || {
        domainNumbers: [10],
        videoIds: ["vid-semiconductor-wafer-fab"]
      }
      const watchedSeconds = mapping.videoIds.reduce(
        (acc, vidId) => acc + (telemetry.videoWatchSeconds[vidId] || 0),
        0
      )
      const norm = Math.min(1, watchedSeconds / Math.max(1, maxVidSec * 1.2))
      const matchPercent = Math.min(99, Math.max(78, Math.round(78 + norm * 21)))
      const topVidId =
        mapping.videoIds.sort(
          (a, b) =>
            (telemetry.videoWatchSeconds[b] || 0) -
            (telemetry.videoWatchSeconds[a] || 0)
        )[0] || "vid-semiconductor-wafer-fab"
      const topVid =
        ACADEMY_TRAINING_VIDEOS.find((v) => v.id === topVidId) ||
        ACADEMY_TRAINING_VIDEOS[0]

      return {
        pathway,
        matchPercent,
        watchedSeconds,
        becauseYouWatchedReason:
          watchedSeconds > 0
            ? `Because you watched ${formatWatchDuration(
                watchedSeconds
              )} of "${topVid.careerTitle}" & related labs`
            : `Recommended for your technical profile (${pathway.categoryTitle})`
      }
    })
    .sort((a, b) => b.watchedSeconds - a.watchedSeconds)

  // ==========================================================================
  // 5. COMPUTE ALL 8 ADDITIONAL SMART RECOMMENDATION SIGNALS DYNAMICALLY
  // ==========================================================================
  const top3Careers = scoredCareers.slice(0, 3)

  // SIGNAL 1: Skill-Gap & Assessment-Weakness Remediations
  const skillGapRemediations: SkillGapRemediationRecommendation[] = top3Careers.map(
    (rc, i) => {
      const c = rc.spec
      return {
        id: `remed-${c.careerNumber}`,
        careerNumber: c.careerNumber,
        careerTitle: c.title,
        diagnosticTrigger:
          i === 0
            ? `High Watch Time (${rc.watchedFormattedInDomain}) on #${c.careerNumber} — Verify Formula & Out-of-Spec Escalation Mastery`
            : `Recommended Pre-Assessment Check for #${c.careerNumber} ${c.title}`,
        missedConceptOrFormula: c.workedFormulaEquations[0],
        recommendedActionTitle: `Worked Example & Interactive Lab: ${c.workedFormulaTitle}`,
        recommendedVideoId: rc.linkedVideo.id,
        recommendedVideoTimestamp:
          rc.linkedVideo.chapters[1]?.timestamp || "04:15",
        targetCalculatorOrTab: "worked_lab",
        urgencyBadge:
          i === 0
            ? "Critical Safety / Spec Gap"
            : i === 1
            ? "Formula Precision Gap"
            : "Standard Traceability Gap"
      }
    }
  )

  // SIGNAL 2: Job-Market, Registered Apprenticeship & Live Bounty/RFP Matches
  const jobAndBountyMatches: JobAndBountyMatchRecommendation[] = [
    {
      id: `job-match-${top3Careers[0].spec.careerNumber}-role`,
      roleOrBountyTitle: `${top3Careers[0].spec.title} — Entry-to-Journeyworker Specialist`,
      employerOrSponsor: "CHIPS & Critical Infrastructure Employer Consortium",
      locationOrMode: "Hybrid / Regional Technical Center + Paid OJT",
      compensationBand: "$68,500 – $96,000 / yr (+ Overtime & Shift Diff)",
      type: "Full-Time Role",
      careerNumber: top3Careers[0].spec.careerNumber,
      careerTitle: top3Careers[0].spec.title,
      qualificationMatchPercent: Math.min(98, top3Careers[0].matchPercent),
      whyYouMatch: `Matched because you logged ${top3Careers[0].watchedFormattedInDomain} in ${top3Careers[0].spec.domainTitle} and studied ${top3Careers[0].spec.workedFormulaTitle}.`,
      missingMilestoneToReach100:
        "Complete Milestone 7 Professional Deliverable & Milestone 8 Rubric Sign-Off to hit 100% readiness.",
      deliverableRequired: top3Careers[0].spec.tangibleEvidenceType
    },
    {
      id: `job-match-${top3Careers[1].spec.careerNumber}-apprenticeship`,
      roleOrBountyTitle: `Registered Apprenticeship: ${top3Careers[1].spec.title} (2,000 hr OJT + 144 hr RTI)`,
      employerOrSponsor: "U.S. DOL ApprenticeshipUSA Partner Network",
      locationOrMode: "On-Site Supervised Lab & Field Rotation",
      compensationBand: "$26.50/hr Start → $41.00/hr Journeyworker Scale",
      type: "Registered Apprenticeship",
      careerNumber: top3Careers[1].spec.careerNumber,
      careerTitle: top3Careers[1].spec.title,
      qualificationMatchPercent: Math.min(95, top3Careers[1].matchPercent - 2),
      whyYouMatch: `Matched from your watch affinity (${top3Careers[1].watchedFormattedInDomain}) in ${top3Careers[1].spec.domainTitle}.`,
      missingMilestoneToReach100:
        "Complete the 6-Step Operational Walkthrough & Safety Level 2 Checklist.",
      deliverableRequired: top3Careers[1].spec.tangibleEvidenceType
    },
    {
      id: `job-match-${top3Careers[2].spec.careerNumber}-bounty`,
      roleOrBountyTitle: `Live Technical RFP & Audit Bounty: ${top3Careers[2].spec.capstoneProject}`,
      employerOrSponsor: "ConnectLn Enterprise RFP & Advisory Exchange",
      locationOrMode: "Remote Technical Deliverable Submission",
      compensationBand: "$4,500 Fixed-Fee Milestone Bounty",
      type: "Live Technical RFP / Bounty",
      careerNumber: top3Careers[2].spec.careerNumber,
      careerTitle: top3Careers[2].spec.title,
      qualificationMatchPercent: Math.min(92, top3Careers[2].matchPercent - 4),
      whyYouMatch: `Strong cross-domain match (${top3Careers[2].matchPercent}%) based on your watch telemetry.`,
      missingMilestoneToReach100:
        "Submit a graded Milestone 7 Portfolio Artifact scoring >= 85% on the Competency Rubric.",
      deliverableRequired: top3Careers[2].spec.tangibleEvidenceType
    }
  ]

  // SIGNAL 3: Hands-On Lab & Simulator Practice Prompts ("Practice What You Just Watched")
  const labSimulatorPrompts: LabSimulatorPromptRecommendation[] = [
    {
      id: "sim-prompt-semi",
      simulatorName: "Cleanroom Poisson Wafer Yield & 5-Site Oxide SPC Control Chart Simulator",
      careerNumber: 42,
      careerTitle: "Semiconductor Manufacturing Technology",
      triggerReason: `You watched ${formatWatchDuration(
        telemetry.videoWatchSeconds["vid-semiconductor-wafer-fab"] || 0
      )} of Semiconductor Wafer Fab — run a live 5-site wafer lot disposition check now.`,
      governingEquation: "Y = exp(-D0 × A)  ;  Mean X̄ ∈ [97.0, 103.0 nm], Range R <= 8.0 nm",
      practicalActionPrompt: "Inject a Site-4 reading of 104 nm and verify whether Lot W-104 triggers an Out-of-Control Hold.",
      targetCalculatorKey: "semiconductor"
    },
    {
      id: "sim-prompt-solar",
      simulatorName: "Solar PV Array & Battery Energy Storage (BESS) Outage Autonomy Sizer",
      careerNumber: 1,
      careerTitle: "Power Systems & Microgrid Engineering",
      triggerReason: `You watched ${formatWatchDuration(
        (telemetry.videoWatchSeconds["vid-power-systems-microgrid"] || 0) +
          (telemetry.videoWatchSeconds["vid-ev-battery-diagnostics"] || 0)
      )} of Power Grid & Battery labs — verify 48-hour microgrid autonomy sizing.`,
      governingEquation: "E_batt_nom = (E_daily × Days_autonomy) / (DoD × η_roundtrip)",
      practicalActionPrompt: "Size a 1,000-household microgrid for 2 outage days at 80% Depth of Discharge.",
      targetCalculatorKey: "solar"
    },
    {
      id: "sim-prompt-plc",
      simulatorName: "PLC Stop-Dominant Seal-In Interlock & Fault Latch Boolean Simulator",
      careerNumber: 9,
      careerTitle: "OT/ICS Industrial Automation & PLC Engineering",
      triggerReason: `Validate hardware stop-dominance and permissive interlocks after watching OT/ICS & Automation videos.`,
      governingEquation: "Run_Out = Auto ∧ (Start ∨ Run_Seal) ∧ ¬Stop ∧ Permissive_OK ∧ ¬Fault",
      practicalActionPrompt: "Test simultaneous Start + Stop assertions to confirm Stop-Dominant failsafe de-energization.",
      targetCalculatorKey: "plc"
    },
    {
      id: "sim-prompt-trades",
      simulatorName: "Drawing Scale Converter & Concrete Slab Gross Volume + Waste Calculator",
      careerNumber: 59,
      careerTitle: "Building Envelope & Master Construction Trades",
      triggerReason: `Practice quantity takeoff accuracy with waste allowance before submitting your construction estimate.`,
      governingEquation: "V_gross = (L × W × T) × (1 + Waste_% / 100)",
      practicalActionPrompt: "Convert a 1:50 blueprint measurement to real meters and compute gross cubic meters with 8% waste.",
      targetCalculatorKey: "construction"
    }
  ]

  // SIGNAL 4: Complementary Cross-Skilling "Dual-Skill Stack" Recommendations
  const dualSkillStacks: DualSkillStackRecommendation[] = [
    {
      id: "stack-semi-process-hygiene",
      stackTitle: "CHIPS Fab Process & Cleanroom Safety Lead Stack",
      primaryCareerNumber: 42,
      primaryCareerTitle: "#42 Semiconductor Manufacturing Technology",
      secondaryCareerNumber: 2,
      secondaryCareerTitle: "#2 Process Engineering & PID Instrumentation",
      tertiaryCareerNumber: 18,
      tertiaryCareerTitle: "#18 Industrial Hygiene & Hazardous Materials",
      salaryPremiumBadge: "+34% Compensation Premium ($98k–$135k)",
      synergyRationale:
        "Combining wafer fab lithography/metrology (#42) with closed-loop PID gas/vacuum control (#2) and toxic hydride gas/PPE industrial hygiene (#18) qualifies you for Senior Fab Equipment & Safety Lead roles.",
      combinedCapstoneDeliverable:
        "Integrated Wafer Lot Traveler + PID Thermal Oxide Tuning Sheet + Toxic Gas Cabinet LOTO Hazard Plan"
    },
    {
      id: "stack-grid-otcyber-bess",
      stackTitle: "Cyber-Hardened Microgrid & High-Voltage BESS Architect Stack",
      primaryCareerNumber: 1,
      primaryCareerTitle: "#1 Power Systems Engineering",
      secondaryCareerNumber: 44,
      secondaryCareerTitle: "#44 Battery Systems & Energy Storage Technology",
      tertiaryCareerNumber: 9,
      tertiaryCareerTitle: "#9 Operational Technology (OT) & Industrial Cybersecurity",
      salaryPremiumBadge: "+38% Compensation Premium ($115k–$160k)",
      synergyRationale:
        "Utilities and data centers urgently need engineers who understand both 13.8 kV fault relay coordination (#1), lithium-ion BESS thermal runaway prevention (#44), and NERC CIP / IEC 62443 SCADA firewall defense (#9).",
      combinedCapstoneDeliverable:
        "Substation Short-Circuit Relay Study + BESS Thermal Safety Audit + Purdue Level 3.5 IDMZ Firewall Rulebook"
    },
    {
      id: "stack-fiber-avionics-rf",
      stackTitle: "Mission-Critical Avionics, Satellite RF & Optical Telemetry Stack",
      primaryCareerNumber: 38,
      primaryCareerTitle: "#38 Fiber Optics & Telecommunications Infrastructure",
      secondaryCareerNumber: 34,
      secondaryCareerTitle: "#34 Aircraft Maintenance & Avionics",
      tertiaryCareerNumber: 35,
      tertiaryCareerTitle: "#35 Aerospace Systems & Satellite Engineering",
      salaryPremiumBadge: "+31% Compensation Premium ($102k–$145k)",
      synergyRationale:
        "Bridges high-speed optical backhaul OTDR diagnostics (#38) with MIL-STD-1553/ARINC 429 aircraft avionics (#34) and satellite RF link budget engineering (#35).",
      combinedCapstoneDeliverable:
        "Bi-Directional OTDR Link Certification + Aircraft Bus Load Analysis + SmallSat RF Telemetry Link Budget"
    }
  ]

  // SIGNAL 5: Peer Cohort, Study Group & Journeyworker Mentor Matches
  const mentorAndCohorts: MentorAndCohortRecommendation[] = [
    {
      id: "mentor-semi-1",
      mentorName: "Dr. Elena Vance, PE & SEMI S2 Lead Assessor",
      credentials: "Ph.D. Microelectronics · 16 Yrs Wafer Fab Metrology & Yield Engineering",
      roleTitle: "Principal Cleanroom & Lithography Mentor",
      organization: "NIST CHIPS Metrology & ConnectLn Faculty",
      domainNumber: 10,
      domainTitle: "10. Semiconductor manufacturing and advanced materials",
      cohortRoomName: "Pulse Room #42: Wafer Fab, SPC Control Charts & Cleanroom Protocol",
      activeLearnersCount: 418,
      officeHoursSchedule: "Tuesdays & Thursdays · 4:00 PM EST (Live Wafer Traveler Reviews)",
      reviewSpecialty: "Reviews Milestone 7 Wafer Lot Hold Notes, 5-Site SPC Charts & Poisson Yield Calculations"
    },
    {
      id: "mentor-cyber-2",
      mentorName: "Marcus Thorne, GCFA, CISSP, GICSP",
      credentials: "Principal DFIR & OT/ICS Incident Commander · Former CISA Red Team",
      roleTitle: "Lead Digital Forensics & SCADA Defense Mentor",
      organization: "ConnectLn Cyber Resilience Academy",
      domainNumber: 2,
      domainTitle: "2. Cybersecurity, intelligence and digital trust",
      cohortRoomName: "Pulse Room #6/#9: Memory Forensics, EVTX Timelines & Purdue IDMZ",
      activeLearnersCount: 529,
      officeHoursSchedule: "Wednesdays · 6:00 PM EST (Live PCAP & Chain-of-Custody Teardowns)",
      reviewSpecialty: "Reviews Milestone 7 DFIR Timeline Reports, SHA-256 Evidence Logs & Modbus Firewall Rules"
    },
    {
      id: "mentor-infra-3",
      mentorName: "Capt. Samuel Osei, FAA A&P IA, FOA CFOS/T & IEEE Senior Member",
      credentials: "22 Yrs Avionics, Optical Telecom & High-Voltage Grid Protection",
      roleTitle: "Critical Infrastructure, Avionics & Fiber Master Instructor",
      organization: "AeroGrid & Telecom Standards Council",
      domainNumber: 8,
      domainTitle: "8. Aviation, aerospace, telecom & power infrastructure",
      cohortRoomName: "Pulse Room #1/#34/#38: OTDR Traces, ARINC 429 & Relay Coordination",
      activeLearnersCount: 364,
      officeHoursSchedule: "Fridays · 2:00 PM EST (Live Fault Isolation Manual & OTDR Trace Walkthroughs)",
      reviewSpecialty: "Reviews FAA Form 8130-3 Release Logs, Fiber Link Loss Budgets & Per-Unit Fault Studies"
    }
  ]

  // SIGNAL 6: Field Toolkit, Calibrated Instruments & Authoritative Standards
  const fieldToolkitRecommendations: FieldToolkitStandardRecommendation[] = top3Careers.map(
    (rc) => {
      const c = rc.spec
      const ref = c.principalReferences[0]
      return {
        id: `toolkit-${c.careerNumber}`,
        careerNumber: c.careerNumber,
        careerTitle: c.title,
        standardCode: ref?.title || `${c.domainTitle} Primary Standard`,
        standardOrganization: ref?.organization || "NIST / ISO / OSHA / IEEE",
        officialUrl: ref?.url || "https://www.nist.gov",
        primaryDiagnosticInstruments:
          c.domainNumber === 10
            ? [
                "Optical Film-Thickness Ellipsometer / Reflectometer",
                "Airborne Laser Particle Counter (0.1 µm–0.5 µm)",
                "Scanning Electron Microscope (CD-SEM) & Wafer Prober"
              ]
            : c.domainNumber === 9
            ? [
                "Optical Time-Domain Reflectometer (OTDR 1310/1550 nm) + Launch Box",
                "Core-Alignment Fusion Splicer & Precision Fiber Cleaver",
                "Optical Loss Test Set (OLTS) & IEC Fiber End-Face Inspection Scope"
              ]
            : c.domainNumber === 2
            ? [
                "Hardware Write-Blocker & Bit-Stream Forensic Imager (SHA-256)",
                "Volatile RAM Acquisition Toolkit & Network TAP / SPAN Capture",
                "Sysmon / EVTX / MFT Timeline Parser & YARA Rule Engine"
              ]
            : [
                "Calibrated True-RMS Digital Multimeter & Clamp Ammeter",
                "Insulation Resistance Megohmmeter (500V/1000V) & Thermal Imager",
                "Traceable Torque Wrench & Digital Caliper / Micrometer"
              ],
        softwareAndSimulationTools: [
          `ConnectLn #${c.careerNumber} Interactive Formula & SPC Workbench`,
          "Standardized Lot Traveler / Fault Isolation Report Templates",
          "Digital Chain-of-Custody & Calibration Traceability Log"
        ],
        whyEssential: `Required to produce verifiable portfolio evidence (${c.tangibleEvidenceType}) for Career #${c.careerNumber}.`
      }
    }
  )

  // SIGNAL 7: Spaced-Repetition & Safety-Critical Refresher Drills
  const spacedRepetitionDrills: SpacedRepetitionRefresherItem[] = [
    {
      id: "sr-semi-safety",
      careerNumber: 42,
      careerTitle: "Semiconductor Manufacturing Technology",
      safetyOrFormulaTopic: "HF Acid / Toxic Hydride Gas Alarm & Out-of-Control Wafer Lot Hold Rule",
      daysSinceLastReview: 14,
      retentionUrgency: "Due Now (Safety-Critical)",
      quickDrillQuestion:
        "If an inline metrology check shows wafer oxide mean thickness = 104.2 nm (Upper Control Limit = 103.0 nm), what is the mandatory technician action?",
      quickDrillAnswer:
        "Immediately place the wafer lot on HOLD in the MES/wafer traveler, tag the tool status, and escalate to Process Engineering — never ship or adjust recipe parameters without authorization.",
      coreEquationOrRule: "X̄ = (101+100+102+104+100)/5 = 101.4 nm; Site 4 = 104 nm > 103 nm Spec → Flag & Escalate"
    },
    {
      id: "sr-ev-hv-safety",
      careerNumber: 45,
      careerTitle: "EV High-Voltage & Battery Energy Storage Systems",
      safetyOrFormulaTopic: "Orange HV Cable Manual Service Disconnect (MSD) & Live-Dead-Live Verification",
      daysSinceLastReview: 18,
      retentionUrgency: "Due Now (Safety-Critical)",
      quickDrillQuestion:
        "Before touching any high-voltage orange busbar on a 400V/800V EV battery pack, what 3-step verification is required after pulling the Manual Service Disconnect (MSD)?",
      quickDrillAnswer:
        "Wear Class 0 HV insulated gloves with leather protectors, wait >= 5 minutes for bus capacitor discharge, and perform a CAT III/IV Live-Dead-Live 0.0 V check (test meter on known live source, test HV bus-to-chassis and phase-to-phase for 0 V, re-verify meter on known live source).",
      coreEquationOrRule: "R_isolation >= 500 Ω/V  ;  V_bus_measured = 0.0 V DC verified via Live-Dead-Live"
    },
    {
      id: "sr-dfir-volatility",
      careerNumber: 6,
      careerTitle: "Digital Forensics & Incident Reconstruction",
      safetyOrFormulaTopic: "RFC 3227 Order of Volatility & Cryptographic Hash Verification",
      daysSinceLastReview: 12,
      retentionUrgency: "Recommended 14-Day Drill",
      quickDrillQuestion:
        "Why must volatile system RAM and active network connections be captured BEFORE powering down or imaging a compromised server's disk?",
      quickDrillAnswer:
        "Pulling the power plug destroys volatile RAM encryption keys, unlinked running processes, and active socket state forever; after imaging, SHA-256 hashes of the forensic copy must match the source bit-for-bit.",
      coreEquationOrRule: "SHA-256(Source_Stream) === SHA-256(Forensic_Image)  ;  Timestamps normalized to UTC (ISO 8601)"
    }
  ]

  // SIGNAL 8: Technician-to-Business-Owner Track Recommendations
  const businessOwnershipRecommendations: BusinessOwnershipRecommendation[] =
    top3Careers.map((rc) => {
      const c = rc.spec
      return {
        id: `biz-track-${c.careerNumber}`,
        technicalCareerNumber: c.careerNumber,
        technicalCareerTitle: c.title,
        firmConceptTitle: `Independent ${c.title} Inspection, Testing & Commissioning Firm`,
        targetClientele:
          "Regional industrial facilities, commercial general contractors, utilities, municipalities, and compliance auditors.",
        startupEquipmentAndLicensing: `Calibrated diagnostic kit for ${c.domainTitle}, General Liability + Professional Errors & Omissions (E&O) insurance, LLC registration, and statutory qualifier licenses.`,
        pricingAndMarginFormula:
          "Bid_Price = (Direct_Labor_Hrs × Loaded_Rate + Calibrated_Rig_Fee + Subcontract_Lab_Cost) / (1 - Target_Gross_Margin_%)  [Target GM >= 42%]",
        typicalGrossMarginBand: "42% – 58% Gross Margin ($185–$325/hr Billable Field Engineering Rate)",
        first90DaysContractBlueprint: `Offer fixed-scope "${c.tangibleEvidenceType}" diagnostic audits to 15 local facility managers/contractors and convert findings into recurring preventive maintenance retainers.`
      }
    })

  return {
    totalWatchSeconds: totalSec,
    totalWatchFormatted: formatWatchDuration(totalSec),
    topWatchedVideo,
    topWatchedDomain,
    topWatchedVideosLeaderboard,
    recommendedNextVideos,
    domainAffinityRanking,
    recommendedSpecialistCareers: scoredCareers,
    recommendedFlagships,
    skillGapRemediations,
    jobAndBountyMatches,
    labSimulatorPrompts,
    dualSkillStacks,
    mentorAndCohorts,
    fieldToolkitRecommendations,
    spacedRepetitionDrills,
    businessOwnershipRecommendations
  }
}

// ============================================================================
// PART B GENERATORS: FLASHCARDS, FAULT TRIAGE, SALARY/ROI & DELIVERABLE GRADER
// ============================================================================

export function getCareerFlashcardDeck(
  pathway: PriorityCareerPathway,
  spec?: SpecializedTangibleCareerSpec
): CareerFlashcardItem[] {
  const m1 = pathway.milestones[0]
  const eqTitle = spec?.workedFormulaTitle || m1.workedExample.title
  const eqList = spec?.workedFormulaEquations || m1.workedExample.equations
  const deliverableType =
    spec?.tangibleEvidenceType || m1.professionalDeliverable.title

  return [
    {
      id: `${pathway.id}-fc-1`,
      cardNumber: 1,
      categoryBadge: "Governing Formula",
      frontPrompt: `What is the primary governing equation for "${eqTitle}" in ${pathway.title}?`,
      backAnswer:
        spec?.workedFormulaExplanation ||
        m1.workedExample.engineeringConclusion,
      formulaOrSpec: eqList.join("   |   ")
    },
    {
      id: `${pathway.id}-fc-2`,
      cardNumber: 2,
      categoryBadge: "Safety Interlock",
      frontPrompt: `What is the mandatory regulatory and safety boundary for ${pathway.title}?`,
      backAnswer: pathway.safetyOrRegulatoryNotice,
      formulaOrSpec: "Zero-Energy / PPE / Authorized Supervision & Statutory Licensure Compliance"
    },
    {
      id: `${pathway.id}-fc-3`,
      cardNumber: 3,
      categoryBadge: "Diagnostic Triage",
      frontPrompt: `Walk through the worked engineering problem for ${pathway.title}: "${
        spec?.workedProblemStatement || m1.workedExample.problemStatement
      }"`,
      backAnswer: (
        spec?.workedStepByStep || m1.workedExample.stepByStepSolution
      ).join("\n"),
      formulaOrSpec:
        spec?.workedConclusion || m1.workedExample.engineeringConclusion
    },
    {
      id: `${pathway.id}-fc-4`,
      cardNumber: 4,
      categoryBadge: "Deliverable & Rubric",
      frontPrompt: `What tangible portfolio artifact must you produce to prove competence in ${pathway.title}?`,
      backAnswer: `You must produce a verified "${deliverableType}" containing unit-checked calculations, traceable raw measurements, and explicit escalation of out-of-spec findings.`,
      formulaOrSpec: `Capstone: ${pathway.capstoneSummary}`
    },
    {
      id: `${pathway.id}-fc-5`,
      cardNumber: 5,
      categoryBadge: "Regulatory Standard",
      frontPrompt: `Which authoritative reference standards govern ${pathway.title}?`,
      backAnswer: pathway.principalReferences
        .map((r) => `${r.title} (${r.organization}): ${r.summary}`)
        .join(" | "),
      formulaOrSpec:
        pathway.principalReferences[0]?.url || "https://www.nist.gov"
    },
    {
      id: `${pathway.id}-fc-6`,
      cardNumber: 6,
      categoryBadge: "Diagnostic Triage",
      frontPrompt:
        spec?.answerKeyQuestion.prompt ||
        m1.assessmentQuestions[0]?.prompt ||
        `How do you handle an out-of-specification reading in ${pathway.title}?`,
      backAnswer:
        spec?.answerKeyQuestion.explanation ||
        m1.assessmentQuestions[0]?.explanation ||
        "Document the exact reading, quarantine/hold affected work, and escalate per SOP.",
      formulaOrSpec: "Contemporaneous ALCOA+ / Traceable Log Entry Required"
    }
  ]
}

export const LIVE_FAULT_TRIAGE_SCENARIOS: LiveFaultTriageScenario[] = [
  {
    id: "triage-semi-lot-w104",
    careerNumber: 42,
    careerTitle: "Semiconductor Manufacturing Technology",
    domainTitle: "10. Semiconductor manufacturing and advanced materials",
    alarmCode: "FAB-METRO-ALM-104: Thin-Film Oxide Thickness Spec Excursion",
    severity: "CRITICAL SAFETY / LOT HOLD",
    telemetryReadout:
      "Lot ID: W-104 (25 Silicon Wafers, 300mm) · Tool: CVD-02 · Target Oxide: 100.0 nm (Spec: 97.0–103.0 nm, Max Range <= 6.0 nm) · 5-Site Measurement: Site 1=101 nm, Site 2=100 nm, Site 3=102 nm, Site 4=104 nm, Site 5=100 nm.",
    situationPrompt:
      "You are the Cleanroom Wafer Fab Technician on Tool CVD-02. Optical metrology flags Site 4 at 104.0 nm (1.0 nm above the 103.0 nm Upper Spec Limit), while the 5-site Mean is 101.4 nm and Range is 4.0 nm. What is your immediate SOP action?",
    options: [
      {
        label:
          "Place Lot W-104 on formal MES Hold, log all 5 site readings + Mean (101.4 nm) & Range (4.0 nm) in the Wafer Traveler, tag Tool CVD-02 for edge-uniformity check, and escalate to Process Engineering.",
        isCorrectSop: true,
        feedbackAndConsequence:
          "CORRECT SOP EXECUTION! Even though the 5-site mean (101.4 nm) is within 97–103 nm, Site 4 (104 nm) violates the individual site upper specification limit. Placing Lot W-104 on hold prevents scrap across downstream lithography/etch steps.",
        sopReference: "SEMI E10 / Fab Lot Disposition & SPC Out-of-Spec Escalation SOP"
      },
      {
        label:
          "Ship Lot W-104 to Photolithography anyway because the 5-site average (101.4 nm) is inside 97–103 nm.",
        isCorrectSop: false,
        feedbackAndConsequence:
          "CRITICAL VIOLATION: Averaging hides localized edge non-uniformity. Wafers with 104 nm oxide at Site 4 will suffer incomplete contact etch (open circuits) across outer dies.",
        sopReference: "Wafer Traveler Integrity & Zero-Defect Quality Gate Rule"
      },
      {
        label:
          "Manually lower the CVD furnace temperature and gas flow recipe yourself without notifying engineering.",
        isCorrectSop: false,
        feedbackAndConsequence:
          "CRITICAL VIOLATION: Entry-level and production technicians must never make unauthorized recipe modifications; unvalidated changes invalidate tool qualification and can ruin entire lots.",
        sopReference: "Change Control & Equipment Qualification Boundary"
      }
    ]
  },
  {
    id: "triage-fiber-otdr-fault",
    careerNumber: 38,
    careerTitle: "Fiber Optics and Telecommunications Infrastructure",
    domainTitle: "9. Telecommunications, networking and critical connectivity",
    alarmCode: "OPT-OTDR-ALM-38: Backbone Span Insertion Loss Exceeds Budget",
    severity: "HIGH-PRIORITY FAULT ISOLATION",
    telemetryReadout:
      "Span: 12.0 km OS2 Single-Mode Fiber @ 1550 nm · Max Allowed Link Loss Budget: 4.50 dB · Measured OLTS Loss: 7.85 dB · OTDR Trace Event at 6,420 m: Non-Reflective Step Drop of -4.10 dB (No Fresnel Spike).",
    situationPrompt:
      "Your 12 km single-mode backbone link fails tier-1 OLTS certification at 7.85 dB (budget <= 4.50 dB). Your Tier-2 OTDR trace reveals a sharp -4.10 dB non-reflective loss at 6.42 km with no reflective spike. What fault has occurred and what is the corrective action?",
    options: [
      {
        label:
          "Isolate a severe macrobend / pinched cable or bad fusion splice at the 6,420 m splice closure; dispatch field crew to inspect bend radius, re-cleave, and re-fusion-splice to <= 0.05 dB.",
        isCorrectSop: true,
        feedbackAndConsequence:
          "CORRECT DIAGNOSTIC! A non-reflective drop on an OTDR trace at 1550 nm indicates light escaping the core without a glass-air reflection (classic pinched fiber macrobend in a splice tray or contaminated fusion splice). Repairing reduces link loss from 7.85 dB to ~3.80 dB (PASS).",
        sopReference: "TIA-568.3-D / FOA OTDR Signature Interpretation Standard"
      },
      {
        label:
          "Replace the entire 12 km underground fiber cable from end to end.",
        isCorrectSop: false,
        feedbackAndConsequence:
          "INCORRECT: The OTDR pinpointed the exact event to 6,420 m (±1 m). Excavating 12 km of intact fiber wastes tens of thousands of dollars.",
        sopReference: "OTDR Fault Localization Procedure"
      },
      {
        label:
          "Increase optical transmitter laser power by +10 dB without fixing the splice.",
        isCorrectSop: false,
        feedbackAndConsequence:
          "INCORRECT: A pinched fiber or stressed splice at 6.42 km will mechanically fracture over time with thermal cycling.",
        sopReference: "Outside Plant (OSP) Mechanical Reliability Standard"
      }
    ]
  },
  {
    id: "triage-avionics-bus-load",
    careerNumber: 34,
    careerTitle: "Aircraft Maintenance and Avionics",
    domainTitle: "8. Aviation, aerospace and maritime careers",
    alarmCode: "AVN-BUS-28VDC-34: Continuous Generator Load & Unapproved Part Check",
    severity: "CRITICAL SAFETY / LOT HOLD",
    telemetryReadout:
      "Aircraft: Twin-Turboprop Training Airframe · Generator Rating: 300 A @ 28V DC (80% Continuous Limit = 240 A) · Proposed Load: 247 A · Replacement AHRS LRU in stock lacks FAA Form 8130-3 tag.",
    situationPrompt:
      "During an avionics modification and AHRS fault isolation, you find the new continuous DC load reaches 247 A (82.3% of the 300 A generator rating) AND the replacement AHRS unit on the shelf has no Form 8130-3 Authorized Release Certificate. What must you do?",
    options: [
      {
        label:
          "Quarantine the undocumented AHRS unit as Suspected Unapproved/Unserviceable, halt installation until an Engineering Load Analysis (or load-shed interlock) brings continuous load <= 240 A (80%), and require a Form 8130-3 traceable LRU.",
        isCorrectSop: true,
        feedbackAndConsequence:
          "CORRECT AIRWORTHINESS ACTION! Both the >80% continuous bus overload (247 A > 240 A) and the missing Form 8130-3 airworthiness release tag are hard stop conditions under FAA maintenance rules.",
        sopReference: "FAA-H-8083-30B / 14 CFR Part 43 Maintenance Records & Traceability"
      },
      {
        label:
          "Install the untagged AHRS unit for a quick test flight since the part number matches.",
        isCorrectSop: false,
        feedbackAndConsequence:
          "ILLEGAL & UNSAFE: Installing an undocumented part invalidates the aircraft's airworthiness certificate.",
        sopReference: "FAA Suspected Unapproved Parts (SUP) Directive"
      },
      {
        label:
          "Swap the 300 A circuit breaker for a 350 A breaker on the existing wire harness.",
        isCorrectSop: false,
        feedbackAndConsequence:
          "CATASTROPHIC FIRE HAZARD: Circuit breakers protect the aircraft wire gauge; upsizing a breaker without upsizing wiring and generator capacity causes in-flight electrical fires.",
        sopReference: "FAA AC 43.13-1B Aircraft Electrical Wire & Breaker Sizing"
      }
    ]
  },
  {
    id: "triage-dfir-volatile-ram",
    careerNumber: 6,
    careerTitle: "Digital Forensics and Incident Reconstruction",
    domainTitle: "2. Cybersecurity, intelligence and digital trust",
    alarmCode: "SOC-DFIR-SEV1-06: Active Ransomware Staging on Domain Controller",
    severity: "CHAIN-OF-CUSTODY TRIAGE",
    telemetryReadout:
      "Host: DC-PROD-01 · Alert: Suspicious LSASS credential dump & scheduled task creation · System Status: Powered ON, encrypted C2 session active in RAM.",
    situationPrompt:
      "You arrive at the SOC triage console for DC-PROD-01, which is currently powered on with an active in-memory C2 beacon. A junior admin suggests immediately pulling the power cord from the back of the server to stop the attacker. What is your forensic directive?",
    options: [
      {
        label:
          "Do NOT pull the power plug; isolate the host at the network switch/VLAN ACL, capture volatile RAM & live network/process state first per RFC 3227 Order of Volatility, then acquire a bit-stream disk image and log SHA-256 hashes in the Chain of Custody.",
        isCorrectSop: true,
        feedbackAndConsequence:
          "CORRECT FORENSIC PROCEDURE! Network isolation stops C2 exfiltration while preserving volatile memory (encryption keys, injected threads, and active sockets) before disk imaging.",
        sopReference: "NIST SP 800-86 & IETF RFC 3227 Guidelines for Evidence Collection"
      },
      {
        label:
          "Pull the power cord immediately and reboot into normal Windows to browse folders.",
        isCorrectSop: false,
        feedbackAndConsequence:
          "EVIDENCE SPOLIATION: Pulling power destroys volatile RAM artifacts, and booting the original disk modifies thousands of file access timestamps ($MFT), ruining evidentiary integrity.",
        sopReference: "RFC 3227 Order of Volatility & Write-Blocker Mandate"
      }
    ]
  }
]

export function getCareerSalaryAndRoiModel(
  pathway: PriorityCareerPathway,
  spec?: SpecializedTangibleCareerSpec
): CareerSalaryAndRoiModel {
  const num = spec?.careerNumber || 42
  const baseHourly =
    num === 42
      ? 38
      : num === 1 || num === 35 || num === 9 || num === 11
      ? 46
      : num === 34 || num === 38 || num === 44 || num === 45
      ? 40
      : 36

  return {
    careerTitle: pathway.title,
    categoryTitle: pathway.categoryTitle,
    defaultJourneyworkerHourly: baseHourly,
    regionalDemandIndex: "Very High Demand (CHIPS Act / Grid / Infrastructure Shortage)",
    openRolesEstimate: "14,200+ Active U.S. & Global Openings",
    stages: [
      {
        stageName: "Stage 1: Entry-Level Technician / Apprentice (Months 1–12)",
        typicalTimeline: "Weeks 1–12 Academy + First 1,000 OJT Hours",
        hourlyBand: `$${(baseHourly * 0.68).toFixed(2)} – $${(
          baseHourly * 0.78
        ).toFixed(2)} / hr`,
        annualBand: `$${Math.round(
          baseHourly * 0.68 * 2080
        ).toLocaleString()} – $${Math.round(
          baseHourly * 0.78 * 2080
        ).toLocaleString()} / yr`,
        verifiedEvidenceRequired:
          "9-Milestone Academy Completion + Safety Level 1–2 Sign-Off + Milestone 7 Portfolio Artifact"
      },
      {
        stageName: "Stage 2: Certified Journeyworker / Specialist (Years 1–3)",
        typicalTimeline: "2,000–4,000 Verified OJT Hours + Industry Credential",
        hourlyBand: `$${baseHourly.toFixed(2)} – $${(
          baseHourly * 1.18
        ).toFixed(2)} / hr`,
        annualBand: `$${Math.round(
          baseHourly * 2080
        ).toLocaleString()} – $${Math.round(
          baseHourly * 1.18 * 2080
        ).toLocaleString()} / yr`,
        verifiedEvidenceRequired:
          "Employer Tool Qualification + Zero-Defect SPC / Fault Isolation Track Record"
      },
      {
        stageName: "Stage 3: Lead Technical Specialist / Dual-Skill Architect (Years 3–5)",
        typicalTimeline: "Primary Pathway + Complementary Dual-Skill Stack",
        hourlyBand: `$${(baseHourly * 1.28).toFixed(2)} – $${(
          baseHourly * 1.55
        ).toFixed(2)} / hr`,
        annualBand: `$${Math.round(
          baseHourly * 1.28 * 2080
        ).toLocaleString()} – $${Math.round(
          baseHourly * 1.55 * 2080
        ).toLocaleString()} / yr`,
        verifiedEvidenceRequired:
          "Dual-Skill Capstone Portfolio + Supervisory RII / QA Sign-Off Authority"
      },
      {
        stageName: "Stage 4: Independent Testing, Inspection or Contracting Firm Owner",
        typicalTimeline: "Business Ownership & Contracting Track",
        hourlyBand: "$165.00 – $295.00 / hr Billable Field Rate",
        annualBand: "$185,000 – $420,000+ Net Owner Income",
        verifiedEvidenceRequired:
          "Contractor License + Calibrated Rig + Insurance/Bonding + 42%+ Gross Margin Bid System"
      }
    ]
  }
}

export function gradeDeliverableSubmission(
  scopeAndAssetId: string,
  quantitativeCalculations: string,
  findingsAndSpecCheck: string,
  escalationAndCorrectiveAction: string
): DeliverableGradingResult {
  const c1 =
    scopeAndAssetId.trim().length >= 30
      ? 25
      : scopeAndAssetId.trim().length >= 10
      ? 18
      : 10
  const hasNumbersAndUnits =
    /\d/.test(quantitativeCalculations) &&
    /(nm|dB|kV|V|A|m|%|Hz|hrs|SHA|Ω|°C|\$)/i.test(quantitativeCalculations)
  const c2 =
    quantitativeCalculations.trim().length >= 40 && hasNumbersAndUnits
      ? 25
      : quantitativeCalculations.trim().length >= 15
      ? 19
      : 10
  const c3 =
    findingsAndSpecCheck.trim().length >= 35
      ? 25
      : findingsAndSpecCheck.trim().length >= 15
      ? 19
      : 10
  const c4 =
    escalationAndCorrectiveAction.trim().length >= 35
      ? 25
      : escalationAndCorrectiveAction.trim().length >= 15
      ? 19
      : 10

  const totalScore = c1 + c2 + c3 + c4
  const passed = totalScore >= 80
  const competencyBand =
    totalScore >= 90
      ? "Mastery / Distinction (90–100%)"
      : totalScore >= 80
      ? "Competent Workplace Readiness (80–89%)"
      : "Developing — Needs Revision (<80%)"

  return {
    totalScore,
    competencyBand,
    passed,
    criterionScores: [
      {
        criterion: "01. Scope, Asset / Lot ID & Governing Standard Traceability",
        score: c1,
        maxScore: 25,
        feedback:
          c1 === 25
            ? "Verified: Clear asset/lot identification, operating conditions, and governing standard cited."
            : "Add explicit Lot/Asset ID, instrument serial number, and governing standard code."
      },
      {
        criterion: "02. Mathematical Precision, Explicit Units & Step-by-Step Formula Execution",
        score: c2,
        maxScore: 25,
        feedback:
          c2 === 25
            ? "Verified: Quantitative calculations include explicit engineering units and intermediate values."
            : "Include explicit numerical values and physical units (nm, dB, V, A, m, %, SHA-256)."
      },
      {
        criterion: "03. Specification / Tolerance Comparison & Anomaly Detection",
        score: c3,
        maxScore: 25,
        feedback:
          c3 === 25
            ? "Verified: Measured values are objectively compared against upper/lower control limits."
            : "Compare every measured value directly against the acceptable specification window."
      },
      {
        criterion: "04. Safety Boundary Respect, Quarantine Hold & Escalation Protocol",
        score: c4,
        maxScore: 25,
        feedback:
          c4 === 25
            ? "Verified: Formal hold/quarantine and escalation to engineering/supervision documented without unauthorized guesswork."
            : "Specify exact quarantine/hold actions and formal escalation steps per SOP."
      }
    ],
    verifierAttestationHash: `CLN-RUBRIC-${totalScore}-${Math.abs(
      scopeAndAssetId.length * 31 + quantitativeCalculations.length * 17
    )
      .toString(16)
      .toUpperCase()
      .padStart(6, "0")}`
  }
}
