"use client"

import React, { useState, useMemo } from "react"
import {
  Sparkles,
  Briefcase,
  Wrench,
  Shield,
  Award,
  CheckCircle2,
  AlertTriangle,
  Play,
  Download,
  ExternalLink,
  Users,
  Clock,
  TrendingUp,
  RotateCcw,
  Layers,
  Check,
  FileText,
  Sliders,
  Compass
} from "lucide-react"
import { PriorityCareerPathway } from "@/lib/connectln-career-mastery-academy"
import { SpecializedTangibleCareerSpec } from "@/lib/connectln-33-specialized-careers"
import {
  ALL_60_SPECIALIST_CAREER_SPECS,
  ACADEMY_TRAINING_VIDEOS,
  AcademyTrainingVideoItem
} from "@/lib/connectln-60-specialist-careers"
import {
  WatchRecommendationBundle,
  LIVE_FAULT_TRIAGE_SCENARIOS,
  getCareerFlashcardDeck,
  getCareerSalaryAndRoiModel,
  gradeDeliverableSubmission,
  DeliverableGradingResult
} from "@/lib/connectln-watch-recommendation-engine"

interface ConnectLnMultiSignalWorkbenchesProps {
  activePathway: PriorityCareerPathway
  activeSpecialistSpec?: SpecializedTangibleCareerSpec
  watchRecommendations: WatchRecommendationBundle
  completedMilestoneCount: number
  onLoadCareerByNumber: (
    careerNumber: number,
    tab?:
      | "lessons"
      | "worked_lab"
      | "assessment"
      | "rubric_deliverable"
      | "plan_pathway_walkthrough"
      | "training_videos"
  ) => void
  onWatchVideoInClassroom: (vid: AcademyTrainingVideoItem) => void
  onOpenActiveClassroomTab: (
    tab:
      | "lessons"
      | "worked_lab"
      | "assessment"
      | "rubric_deliverable"
      | "plan_pathway_walkthrough"
      | "training_videos"
  ) => void
  onClaimCertificate?: (title: string) => void
}

export function ConnectLnMultiSignalWorkbenches({
  activePathway,
  activeSpecialistSpec,
  watchRecommendations,
  completedMilestoneCount,
  onLoadCareerByNumber,
  onWatchVideoInClassroom,
  onOpenActiveClassroomTab,
  onClaimCertificate
}: ConnectLnMultiSignalWorkbenchesProps) {
  // Navigation for Part A (8 Smart Recommendation Signals)
  const [activeSignalTab, setActiveSignalTab] = useState<
    | "all_signals"
    | "skill_gaps"
    | "jobs_bounties"
    | "lab_prompts"
    | "dual_stacks"
    | "mentors_cohorts"
    | "field_toolkit"
    | "spaced_repetition"
    | "business_tracks"
  >("all_signals")

  // Navigation for Part B (6 High-Impact Interactive Workbenches)
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<
    | "all_workbenches"
    | "deliverable_grader"
    | "salary_roi"
    | "flashcards"
    | "fault_triage"
    | "skill_passport"
  >("all_workbenches")

  // Signal 5 & 7 Interactive States
  const [joinedCohorts, setJoinedCohorts] = useState<Record<string, boolean>>({
    "mentor-semi-1": true
  })
  const [requestedReviews, setRequestedReviews] = useState<
    Record<string, boolean>
  >({})
  const [revealedDrills, setRevealedDrills] = useState<Record<string, boolean>>(
    {}
  )
  const [completedDrills, setCompletedDrills] = useState<
    Record<string, boolean>
  >({})
  const [checkedToolkitItems, setCheckedToolkitItems] = useState<
    Record<string, boolean>
  >({})
  const [actionBannerToast, setActionBannerToast] = useState<string | null>(
    null
  )

  const triggerToast = (msg: string) => {
    setActionBannerToast(msg)
    setTimeout(() => {
      setActionBannerToast(null)
    }, 4500)
  }

  // ==========================================================================
  // WORKBENCH 1 STATE: INTERACTIVE MILESTONE 7 DELIVERABLE GRADER
  // ==========================================================================
  const defaultScopeText = `Lot / Asset ID: W-104 (300mm Silicon Wafer Lot, 25 Wafers) · Tool: CVD-02 Thermal Oxide · Governing Standard: ${
    activePathway.principalReferences[0]?.title || "SEMI E10 / NIST Metrology"
  }`
  const defaultCalcText = `${
    activeSpecialistSpec?.workedFormulaEquations[0] ||
    activePathway.milestones[0].workedExample.equations[0]
  } · Raw 5-Site Readings: [101 nm, 100 nm, 102 nm, 104 nm, 100 nm] → Sample Mean X̄ = 101.4 nm, Range R = 4.0 nm, Poisson Yield Y = exp(-0.02 × 100) = 13.53% (or 85.2% at A=8 cm²)`
  const defaultFindingsText = `Target Oxide Window: 97.0 nm to 103.0 nm (Max Range <= 6.0 nm). While Lot Mean (101.4 nm) and Range (4.0 nm) are within nominal bounds, Site 4 (Wafer Edge) measured 104.0 nm, exceeding the 103.0 nm Upper Specification Limit by +1.0 nm.`
  const defaultEscalationText = `1. Place Wafer Lot W-104 on formal HOLD in MES and attach physical Hold Tag to FOUP carrier. 2. Do NOT advance lot to Photolithography. 3. Flag Tool CVD-02 for Zone-4 edge gas-flow/temperature uniformity inspection and escalate to Process Engineering.`

  const [delivScope, setDelivScope] = useState<string>(defaultScopeText)
  const [delivCalc, setDelivCalc] = useState<string>(defaultCalcText)
  const [delivFindings, setDelivFindings] =
    useState<string>(defaultFindingsText)
  const [delivEscalation, setDelivEscalation] = useState<string>(
    defaultEscalationText
  )
  const [gradingResult, setGradingResult] =
    useState<DeliverableGradingResult | null>(() =>
      gradeDeliverableSubmission(
        defaultScopeText,
        defaultCalcText,
        defaultFindingsText,
        defaultEscalationText
      )
    )

  const handleLoadExemplarForActivePathway = () => {
    const s1 = `Asset / Lot ID: ${activePathway.id.toUpperCase()}-LOT-01 · Pathway: ${
      activePathway.title
    } · Standard: ${
      activePathway.principalReferences[0]?.title || "NIST / ISO / OSHA"
    }`
    const s2 = `${
      activeSpecialistSpec?.workedFormulaTitle ||
      activePathway.milestones[0].workedExample.title
    }: ${(
      activeSpecialistSpec?.workedStepByStep ||
      activePathway.milestones[0].workedExample.stepByStepSolution
    ).join(" ")}`
    const s3 = `Conclusion & Spec Verification: ${
      activeSpecialistSpec?.workedConclusion ||
      activePathway.milestones[0].workedExample.engineeringConclusion
    }`
    const s4 = `Mandatory Safety & Escalation Action: Place out-of-spec lot/system in safe quarantine state, log contemporaneous ALCOA+ traceability record with instrument serial ID, and escalate to Engineering/Supervision per ${activePathway.title} SOP.`
    setDelivScope(s1)
    setDelivCalc(s2)
    setDelivFindings(s3)
    setDelivEscalation(s4)
    const res = gradeDeliverableSubmission(s1, s2, s3, s4)
    setGradingResult(res)
    triggerToast(
      `Loaded & graded exemplar Milestone 7 Deliverable for "${activePathway.title}" (${res.totalScore}/100 — ${res.competencyBand}).`
    )
  }

  const handleGradeDeliverableNow = () => {
    const res = gradeDeliverableSubmission(
      delivScope,
      delivCalc,
      delivFindings,
      delivEscalation
    )
    setGradingResult(res)
    if (res.passed && onClaimCertificate) {
      onClaimCertificate(
        `${activePathway.title} — Verified Milestone 7 Deliverable (${res.totalScore}/100)`
      )
    }
    triggerToast(
      `Graded Milestone 7 Deliverable: ${res.totalScore}/100 (${res.competencyBand}) · Attestation: ${res.verifierAttestationHash}`
    )
  }

  const handleDownloadText = (filename: string, content: string) => {
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

  // ==========================================================================
  // WORKBENCH 2 STATE: SALARY, PAID APPRENTICESHIP & 5-YEAR ROI CALCULATOR
  // ==========================================================================
  const salaryModel = useMemo(
    () => getCareerSalaryAndRoiModel(activePathway, activeSpecialistSpec),
    [activePathway, activeSpecialistSpec]
  )
  const [customBaseHourly, setCustomBaseHourly] = useState<number>(38)
  const [weeklyOvertimeHours, setWeeklyOvertimeHours] = useState<number>(5)
  const [dualSkillStackBonusPct, setDualSkillStackBonusPct] =
    useState<number>(28)

  const regularAnnualEarnings = Math.round(customBaseHourly * 2080)
  const overtimeAnnualEarnings = Math.round(
    weeklyOvertimeHours * 50 * (customBaseHourly * 1.5)
  )
  const dualSkillLoadedAnnual = Math.round(
    (regularAnnualEarnings + overtimeAnnualEarnings) *
      (1 + dualSkillStackBonusPct / 100)
  )
  const twoYearPaidApprenticeshipTotal = Math.round(
    customBaseHourly * 0.78 * 4000
  )
  const fiveYearCumulativeEarnings = Math.round(
    twoYearPaidApprenticeshipTotal + dualSkillLoadedAnnual * 3
  )

  // ==========================================================================
  // WORKBENCH 3 STATE: INTERACTIVE FLASHCARD & FORMULA DRILL DECK
  // ==========================================================================
  const flashcardDeck = useMemo(
    () => getCareerFlashcardDeck(activePathway, activeSpecialistSpec),
    [activePathway, activeSpecialistSpec]
  )
  const [currentCardIdx, setCurrentCardIdx] = useState<number>(0)
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false)
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({
    [`${activePathway.id}-fc-1`]: true
  })

  const currentFlashcard =
    flashcardDeck[currentCardIdx % flashcardDeck.length] || flashcardDeck[0]
  const masteredFlashcardCount = flashcardDeck.filter(
    (c) => masteredCards[c.id]
  ).length

  // ==========================================================================
  // WORKBENCH 4 STATE: LIVE FAULT TRIAGE MODE (BRANCHING SCENARIO SIMULATOR)
  // ==========================================================================
  const [activeTriageIdx, setActiveTriageIdx] = useState<number>(0)
  const [selectedTriageOption, setSelectedTriageOption] = useState<
    Record<string, number>
  >({})
  const currentTriageScenario =
    LIVE_FAULT_TRIAGE_SCENARIOS[
      activeTriageIdx % LIVE_FAULT_TRIAGE_SCENARIOS.length
    ]
  const chosenOptionIdx = selectedTriageOption[currentTriageScenario.id]

  // ==========================================================================
  // WORKBENCH 5 STATE: EMPLOYER VERIFIED SKILL PASSPORT
  // ==========================================================================
  const [copiedPassportLink, setCopiedPassportLink] = useState<boolean>(false)
  const readinessScorePercent = Math.min(
    100,
    Math.round(
      55 +
        completedMilestoneCount * 4 +
        (gradingResult?.passed ? 15 : 5) +
        Math.min(15, Math.round(watchRecommendations.totalWatchSeconds / 300))
    )
  )

  return (
    <div className="space-y-6">
      {actionBannerToast && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-950/95 text-emerald-100 px-4 py-3 text-xs font-bold shadow-xl flex items-center justify-between">
          <span>✓ {actionBannerToast}</span>
          <button
            type="button"
            onClick={() => setActionBannerToast(null)}
            className="underline ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PART A: 8 MULTI-SIGNAL SMART RECOMMENDATIONS HUB                      */}
      {/* ===================================================================== */}
      <div className="rounded-3xl border-2 border-indigo-500/40 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-indigo-600 text-white px-3 py-0.5 text-[11px] font-black uppercase">
                Part A · 8 Multi-Signal Smart Recommendation Engines
              </span>
              <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-mono font-bold">
                Synced With Watch History ({watchRecommendations.totalWatchFormatted})
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              360° Career Intelligence: Skill-Gap Diagnostics, Live Jobs/Bounties, Dual-Skill Stacks, Mentors, Toolkits &amp; Business Tracks
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Goes beyond video watch history to recommend targeted formula remediation, live employer roles &amp; apprenticeships you qualify for, interactive lab prompts, +38% salary dual-skill combinations, peer cohorts, calibrated toolkits, spaced-repetition safety drills, and contracting business blueprints.
            </p>
          </div>
        </div>

        {/* Filter Pills for the 8 Smart Recommendation Signals */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all_signals", label: "All 8 Recommendation Signals" },
            { id: "skill_gaps", label: "1. Skill-Gap & Formula Remediation" },
            { id: "jobs_bounties", label: "2. Jobs, Apprenticeships & Bounties" },
            { id: "lab_prompts", label: "3. Hands-On Simulator Prompts" },
            { id: "dual_stacks", label: "4. Dual-Skill Salary Stacks (+38%)" },
            { id: "mentors_cohorts", label: "5. Mentors & Peer Study Rooms" },
            { id: "field_toolkit", label: "6. Field Toolkit & Standards" },
            { id: "spaced_repetition", label: "7. Spaced-Repetition Safety Drills" },
            { id: "business_tracks", label: "8. Technician-to-Business-Owner" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSignalTab(tab.id as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 cursor-pointer border transition-all ${
                activeSignalTab === tab.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SIGNAL 1: SKILL-GAP & ASSESSMENT-WEAKNESS REMEDIATIONS */}
        {(activeSignalTab === "all_signals" ||
          activeSignalTab === "skill_gaps") && (
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="rounded bg-rose-600 text-white px-2 py-0.5 text-[10px] font-mono">
                SIGNAL 01
              </span>
              Skill-Gap &amp; Formula Remediation Recommendations ("Fix Weak Spots Before Final Rubric")
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {watchRecommendations.skillGapRemediations.map((rem) => {
                const vid =
                  ACADEMY_TRAINING_VIDEOS.find(
                    (v) => v.id === rem.recommendedVideoId
                  ) || ACADEMY_TRAINING_VIDEOS[0]
                return (
                  <div
                    key={rem.id}
                    className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/15 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-rose-600 text-white px-2.5 py-0.5 text-[10px] font-mono font-bold">
                          {rem.urgencyBadge}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-zinc-500">
                          Career #{rem.careerNumber}
                        </span>
                      </div>
                      <h5 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                        {rem.careerTitle}
                      </h5>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        <strong>Diagnostic Trigger:</strong>{" "}
                        {rem.diagnosticTrigger}
                      </p>
                      <div className="rounded-xl bg-slate-950 text-emerald-300 p-2.5 font-mono text-[11px] border border-slate-800">
                        {rem.missedConceptOrFormula}
                      </div>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                        Recommended Action: {rem.recommendedActionTitle} (Video
                        Chapter @ {rem.recommendedVideoTimestamp})
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/40">
                      <button
                        type="button"
                        onClick={() =>
                          onLoadCareerByNumber(rem.careerNumber, "worked_lab")
                        }
                        className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white py-2 px-2 text-xs font-black cursor-pointer"
                      >
                        Open Worked Lab →
                      </button>
                      <button
                        type="button"
                        onClick={() => onWatchVideoInClassroom(vid)}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-2 text-xs font-black cursor-pointer"
                      >
                        ▶ Jump to {rem.recommendedVideoTimestamp}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SIGNAL 2: JOB-MARKET, APPRENTICESHIP & LIVE BOUNTY/RFP MATCHES */}
        {(activeSignalTab === "all_signals" ||
          activeSignalTab === "jobs_bounties") && (
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="rounded bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-mono">
                SIGNAL 02
              </span>
              Live Job-Market, Registered Apprenticeship &amp; Technical RFP/Bounty Matches ("Roles You Qualify For Now")
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {watchRecommendations.jobAndBountyMatches.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/25 dark:bg-emerald-950/15 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-mono font-black">
                        {job.qualificationMatchPercent}% Qualified
                      </span>
                      <span className="rounded bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {job.type}
                      </span>
                    </div>
                    <h5 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {job.roleOrBountyTitle}
                    </h5>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {job.compensationBand} · {job.employerOrSponsor}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {job.whyYouMatch}
                    </p>
                    <div className="rounded-xl bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-800 text-[11px]">
                      <strong className="text-amber-600 dark:text-amber-400">
                        To Reach 100% Qualification:
                      </strong>{" "}
                      {job.missingMilestoneToReach100}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
                    <button
                      type="button"
                      onClick={() =>
                        onLoadCareerByNumber(
                          job.careerNumber,
                          "rubric_deliverable"
                        )
                      }
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 text-xs font-black cursor-pointer"
                    >
                      Complete Milestone →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDownloadText(
                          `connectln-job-packet-career-${job.careerNumber}.md`,
                          `# ConnectLn Verified Candidate Application Packet\n\n- **Target Role / Bounty**: ${job.roleOrBountyTitle}\n- **Sponsor**: ${job.employerOrSponsor}\n- **Compensation Band**: ${job.compensationBand}\n- **Current Qualification Match**: ${job.qualificationMatchPercent}%\n- **Required Tangible Portfolio Evidence**: ${job.deliverableRequired}\n- **Watch Telemetry Logged**: ${watchRecommendations.totalWatchFormatted}\n`
                        )
                        triggerToast(
                          `Exported Verified Candidate Application Packet for "${job.roleOrBountyTitle}".`
                        )
                      }}
                      className="rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white py-2 px-2 text-xs font-bold cursor-pointer"
                    >
                      ⬇ Apply Packet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIGNAL 3: HANDS-ON LAB & SIMULATOR PRACTICE PROMPTS */}
        {(activeSignalTab === "all_signals" ||
          activeSignalTab === "lab_prompts") && (
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="rounded bg-[#0A66C2] text-white px-2 py-0.5 text-[10px] font-mono">
                SIGNAL 03
              </span>
              Hands-On Lab &amp; Simulator Prompts ("Practice What You Just Watched")
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {watchRecommendations.labSimulatorPrompts.map((sim) => (
                <div
                  key={sim.id}
                  className="rounded-2xl border border-blue-200 dark:border-sky-900/50 bg-blue-50/30 dark:bg-sky-950/15 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <span className="rounded bg-[#0A66C2] text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                      Career #{sim.careerNumber} Lab Workbench
                    </span>
                    <h5 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {sim.simulatorName}
                    </h5>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                      {sim.triggerReason}
                    </p>
                    <div className="rounded-xl bg-slate-950 text-emerald-300 p-2 font-mono text-[10px]">
                      {sim.governingEquation}
                    </div>
                    <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                      Lab Task: {sim.practicalActionPrompt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onLoadCareerByNumber(sim.careerNumber, "worked_lab")
                    }
                    className="w-full rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white py-2 text-xs font-black cursor-pointer"
                  >
                    Launch Interactive Simulator →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIGNAL 4: COMPLEMENTARY CROSS-SKILLING DUAL-SKILL STACKS */}
        {(activeSignalTab === "all_signals" ||
          activeSignalTab === "dual_stacks") && (
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="rounded bg-amber-500 text-slate-950 px-2 py-0.5 text-[10px] font-mono font-black">
                SIGNAL 04
              </span>
              High-Paying Complementary "Dual-Skill Stacks" (+31% to +38% Compensation Premium)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {watchRecommendations.dualSkillStacks.map((stack) => (
                <div
                  key={stack.id}
                  className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/15 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <span className="rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-mono font-black">
                      {stack.salaryPremiumBadge}
                    </span>
                    <h5 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {stack.stackTitle}
                    </h5>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {stack.synergyRationale}
                    </p>
                    <div className="rounded-xl bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        Combined 3-Pathway Stack (Click to Open):
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onLoadCareerByNumber(
                            stack.primaryCareerNumber,
                            "lessons"
                          )
                        }
                        className="block text-left text-[#0A66C2] dark:text-sky-400 font-bold hover:underline cursor-pointer"
                      >
                        1. {stack.primaryCareerTitle} →
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onLoadCareerByNumber(
                            stack.secondaryCareerNumber,
                            "lessons"
                          )
                        }
                        className="block text-left text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        2. {stack.secondaryCareerTitle} →
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onLoadCareerByNumber(
                            stack.tertiaryCareerNumber,
                            "lessons"
                          )
                        }
                        className="block text-left text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        3. {stack.tertiaryCareerTitle} →
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300">
                      <strong>Combined Portfolio Deliverable:</strong>{" "}
                      {stack.combinedCapstoneDeliverable}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIGNAL 5: PEER COHORTS (PULSE ROOMS) & JOURNEYWORKER MENTORS */}
        {(activeSignalTab === "all_signals" ||
          activeSignalTab === "mentors_cohorts") && (
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="rounded bg-purple-600 text-white px-2 py-0.5 text-[10px] font-mono">
                SIGNAL 05
              </span>
              Peer Study Cohorts (Pulse Rooms) &amp; Verified Journeyworker Mentors Matched to Your Watch History
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {watchRecommendations.mentorAndCohorts.map((mc) => {
                const isJoined = !!joinedCohorts[mc.id]
                const isRequested = !!requestedReviews[mc.id]
                return (
                  <div
                    key={mc.id}
                    className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/20 dark:bg-purple-950/15 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="rounded bg-purple-600 text-white px-2 py-0.5 font-bold">
                          {mc.activeLearnersCount} Active Learners
                        </span>
                        <span className="text-zinc-500">
                          Domain #{mc.domainNumber}
                        </span>
                      </div>
                      <h5 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                        {mc.mentorName}
                      </h5>
                      <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {mc.roleTitle} · {mc.organization}
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        {mc.credentials}
                      </p>
                      <div className="rounded-xl bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1">
                        <div>
                          <strong>Cohort:</strong> {mc.cohortRoomName}
                        </div>
                        <div>
                          <strong>Office Hours:</strong>{" "}
                          {mc.officeHoursSchedule}
                        </div>
                        <div className="text-emerald-700 dark:text-emerald-400">
                          <strong>Rubric Review:</strong> {mc.reviewSpecialty}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200/60 dark:border-purple-900/40">
                      <button
                        type="button"
                        onClick={() => {
                          setJoinedCohorts((p) => ({ ...p, [mc.id]: !p[mc.id] }))
                          triggerToast(
                            isJoined
                              ? `Left cohort ${mc.cohortRoomName}`
                              : `Joined ${mc.cohortRoomName}! Office hours reminders enabled.`
                          )
                        }}
                        className={`rounded-xl py-2 px-2 text-xs font-black cursor-pointer ${
                          isJoined
                            ? "bg-emerald-600 text-white"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
                      >
                        {isJoined ? "✓ In Study Cohort" : "Join Study Cohort"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRequestedReviews((p) => ({ ...p, [mc.id]: true }))
                          triggerToast(
                            `Submitted Milestone 7 Deliverable to ${mc.mentorName} for Journeyworker Rubric Review!`
                          )
                        }}
                        className="rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white py-2 px-2 text-xs font-bold cursor-pointer"
                      >
                        {isRequested ? "✓ Review Queued" : "Request Review"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SIGNAL 6: FIELD TOOLKIT, CALIBRATED INSTRUMENTS & AUTHORITATIVE STANDARDS */}
        {(activeSignalTab === "all_signals" ||
          activeSignalTab === "field_toolkit") && (
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="rounded bg-slate-900 text-white px-2 py-0.5 text-[10px] font-mono">
                SIGNAL 06
              </span>
              Field Toolkit, Calibrated Diagnostic Instruments &amp; Official Reference Standards
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {watchRecommendations.fieldToolkitRecommendations.map((tk) => (
                <div
                  key={tk.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <span className="rounded bg-[#0A66C2]/15 text-[#0A66C2] dark:text-sky-400 px-2.5 py-0.5 text-[10px] font-mono font-black">
                      Career #{tk.careerNumber} · {tk.standardOrganization}
                    </span>
                    <h5 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {tk.careerTitle} Toolkit
                    </h5>
                    <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                      Standard: {tk.standardCode}
                    </p>
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                        Calibrated Hardware &amp; Metrology Instruments:
                      </span>
                      {tk.primaryDiagnosticInstruments.map((inst, iIdx) => {
                        const k = `${tk.id}-inst-${iIdx}`
                        const checked = !!checkedToolkitItems[k]
                        return (
                          <label
                            key={k}
                            className="flex items-start gap-2 cursor-pointer text-[11px] text-zinc-700 dark:text-zinc-300"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setCheckedToolkitItems((p) => ({
                                  ...p,
                                  [k]: !p[k]
                                }))
                              }
                              className="mt-0.5 rounded"
                            />
                            <span className={checked ? "line-through opacity-70" : ""}>
                              {inst}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <a
                      href={tk.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-black text-[#0A66C2] dark:text-sky-400 hover:underline flex items-center gap-1"
                    >
                      Official Standard <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        onLoadCareerByNumber(
                          tk.careerNumber,
                          "plan_pathway_walkthrough"
                        )
                      }
                      className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                    >
                      🗺️ Walkthrough
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIGNAL 7: SPACED-REPETITION & SAFETY-CRITICAL REFRESHER DRILLS */}
        {(activeSignalTab === "all_signals" ||
          activeSignalTab === "spaced_repetition") && (
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="rounded bg-amber-600 text-white px-2 py-0.5 text-[10px] font-mono">
                SIGNAL 07
              </span>
              Spaced-Repetition &amp; Safety-Critical 3-Minute Refresher Drills ("Prevent Skill Decay")
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {watchRecommendations.spacedRepetitionDrills.map((drill) => {
                const isRevealed = !!revealedDrills[drill.id]
                const isDone = !!completedDrills[drill.id]
                return (
                  <div
                    key={drill.id}
                    className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/25 dark:bg-amber-950/15 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 font-black">
                          {drill.retentionUrgency}
                        </span>
                        <span className="text-zinc-500">
                          {drill.daysSinceLastReview}d since review
                        </span>
                      </div>
                      <h5 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                        {drill.safetyOrFormulaTopic}
                      </h5>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        <strong>Drill Prompt:</strong> {drill.quickDrillQuestion}
                      </p>
                      <div className="rounded-xl bg-slate-950 text-emerald-300 p-2 font-mono text-[10px]">
                        {drill.coreEquationOrRule}
                      </div>
                      {isRevealed && (
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-2.5 text-xs text-emerald-950 dark:text-emerald-200">
                          <strong>Verified SOP Answer:</strong>{" "}
                          {drill.quickDrillAnswer}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedDrills((p) => ({
                            ...p,
                            [drill.id]: !p[drill.id]
                          }))
                        }
                        className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 py-2 px-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
                      >
                        {isRevealed ? "Hide Answer" : "Reveal SOP Answer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCompletedDrills((p) => ({
                            ...p,
                            [drill.id]: true
                          }))
                          triggerToast(
                            `Completed 3-Minute Safety & Formula Refresher Drill for Career #${drill.careerNumber}!`
                          )
                        }}
                        className={`rounded-xl py-2 px-2 text-xs font-black text-white cursor-pointer ${
                          isDone
                            ? "bg-emerald-600"
                            : "bg-[#0A66C2] hover:bg-[#004182]"
                        }`}
                      >
                        {isDone ? "✓ Drill Logged" : "Mark Refreshed ✓"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SIGNAL 8: TECHNICIAN-TO-BUSINESS-OWNER CONTRACTING BLUEPRINTS */}
        {(activeSignalTab === "all_signals" ||
          activeSignalTab === "business_tracks") && (
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="rounded bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-mono">
                SIGNAL 08
              </span>
              Technician-to-Business-Owner Contracting &amp; Testing Firm Blueprints
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {watchRecommendations.businessOwnershipRecommendations.map(
                (biz) => (
                  <div
                    key={biz.id}
                    className="rounded-2xl border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/15 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-mono font-black">
                        {biz.typicalGrossMarginBand}
                      </span>
                      <h5 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                        {biz.firmConceptTitle}
                      </h5>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        <strong>Target Clients:</strong> {biz.targetClientele}
                      </p>
                      <div className="rounded-xl bg-slate-950 text-amber-300 p-2.5 font-mono text-[10px]">
                        {biz.pricingAndMarginFormula}
                      </div>
                      <p className="text-[11px] text-zinc-700 dark:text-zinc-300">
                        <strong>First 90-Day Contract Plan:</strong>{" "}
                        {biz.first90DaysContractBlueprint}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onLoadCareerByNumber(
                          biz.technicalCareerNumber,
                          "plan_pathway_walkthrough"
                        )
                      }
                      className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-black cursor-pointer"
                    >
                      Open Career #{biz.technicalCareerNumber} Business Roadmap →
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* PART B: 6 HIGH-IMPACT INTERACTIVE WORKBENCHES                         */}
      {/* (DELIVERABLE GRADER, SALARY/ROI, FLASHCARDS, FAULT TRIAGE, PASSPORT)  */}
      {/* ===================================================================== */}
      <div className="rounded-3xl border-2 border-[#0A66C2]/45 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-[#0A66C2] text-white px-3 py-0.5 text-[11px] font-black uppercase">
                Part B · Interactive Career Mastery Workbenches
              </span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-mono font-bold">
                Active Training: {activePathway.title}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Deliverable Auto-Grader, Salary/ROI Calculator, Formula Flashcard Deck, Live Fault Triage Simulator &amp; Employer Skill Passport
            </h3>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all_workbenches", label: "All Workbenches" },
              { id: "deliverable_grader", label: "1. Deliverable Grader" },
              { id: "salary_roi", label: "2. Salary & ROI Sizer" },
              { id: "flashcards", label: "3. Formula Flashcards" },
              { id: "fault_triage", label: "4. Live Fault Triage" },
              { id: "skill_passport", label: "5. Employer Passport" }
            ].map((wb) => (
              <button
                key={wb.id}
                type="button"
                onClick={() => setActiveWorkbenchTab(wb.id as any)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer border transition-all ${
                  activeWorkbenchTab === wb.id
                    ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {wb.label}
              </button>
            ))}
          </div>
        </div>

        {/* WORKBENCH 1: INTERACTIVE PORTFOLIO & MILESTONE 7 DELIVERABLE GRADER */}
        {(activeWorkbenchTab === "all_workbenches" ||
          activeWorkbenchTab === "deliverable_grader") && (
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/25 dark:bg-indigo-950/15 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="rounded bg-indigo-600 text-white px-2.5 py-0.5 text-[10px] font-mono font-black">
                  WORKBENCH 01 · MILESTONE 7 PROFESSIONAL DELIVERABLE &amp; RUBRIC AUTO-GRADER
                </span>
                <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">
                  Build, Score &amp; Export Your Tangible Portfolio Artifact for {activePathway.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleLoadExemplarForActivePathway}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 text-xs font-black cursor-pointer"
                >
                  ✨ Auto-Fill Exemplar for Active Career
                </button>
                <button
                  type="button"
                  onClick={handleGradeDeliverableNow}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-black cursor-pointer"
                >
                  ✓ Score Against 4-Level Rubric
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 7 Cols: 4 Structured Engineering Report Inputs */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-300">
                    1. Scope, Lot / Asset ID &amp; Standard
                  </label>
                  <textarea
                    rows={3}
                    value={delivScope}
                    onChange={(e) => setDelivScope(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-300">
                    2. Quantitative Calculations &amp; Units
                  </label>
                  <textarea
                    rows={3}
                    value={delivCalc}
                    onChange={(e) => setDelivCalc(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-300">
                    3. Spec / Control-Limit Comparison
                  </label>
                  <textarea
                    rows={3}
                    value={delivFindings}
                    onChange={(e) => setDelivFindings(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-300">
                    4. Quarantine Hold &amp; Escalation SOP
                  </label>
                  <textarea
                    rows={3}
                    value={delivEscalation}
                    onChange={(e) => setDelivEscalation(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Right 5 Cols: Live Scored Competency Rubric Breakdown */}
              {gradingResult && (
                <div className="lg:col-span-5 rounded-2xl bg-slate-950 text-white p-4 border border-slate-800 flex flex-col justify-between gap-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-emerald-500 text-slate-950 px-3 py-0.5 text-xs font-black">
                        Score: {gradingResult.totalScore} / 100
                      </span>
                      <span className="text-[11px] font-mono text-amber-300">
                        {gradingResult.verifierAttestationHash}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-emerald-300">
                      {gradingResult.competencyBand}
                    </div>
                    <div className="space-y-2">
                      {gradingResult.criterionScores.map((cs, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-white/5 border border-white/10 p-2 text-[11px]"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>{cs.criterion}</span>
                            <span className="text-emerald-400 font-mono">
                              {cs.score}/{cs.maxScore}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300 mt-0.5">
                            {cs.feedback}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleDownloadText(
                        `${activePathway.id}-graded-milestone7-deliverable.md`,
                        `# Verified Milestone 7 Professional Deliverable Artifact\n\n- **Pathway**: ${activePathway.title}\n- **Rubric Score**: ${gradingResult.totalScore}/100 (${gradingResult.competencyBand})\n- **Attestation Hash**: ${gradingResult.verifierAttestationHash}\n\n## 1. Scope & Asset Identification\n${delivScope}\n\n## 2. Quantitative Calculations & Engineering Units\n\`\`\`\n${delivCalc}\n\`\`\`\n\n## 3. Specification Comparison & Anomaly Findings\n${delivFindings}\n\n## 4. Quarantine Hold & Escalation Action\n${delivEscalation}\n`
                      )
                    }}
                    className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 text-xs font-black cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export Signed Portfolio Artifact (.md)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORKBENCH 2: LIVE CAREER COMPENSATION, APPRENTICESHIP WAGE & 5-YEAR ROI CALCULATOR */}
        {(activeWorkbenchTab === "all_workbenches" ||
          activeWorkbenchTab === "salary_roi") && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/15 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="rounded bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-mono font-black">
                  WORKBENCH 02 · LIVE COMPENSATION, PAID APPRENTICESHIP &amp; 5-YEAR ROI CALCULATOR
                </span>
                <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">
                  Earnings Progression for {salaryModel.careerTitle} ({salaryModel.openRolesEstimate})
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Sliders & Live KPIs */}
              <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Base Journeyworker Hourly Rate:</span>
                    <span className="text-[#0A66C2] font-mono">
                      ${customBaseHourly}/hr
                    </span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={75}
                    value={customBaseHourly}
                    onChange={(e) =>
                      setCustomBaseHourly(Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Weekly Overtime Hours (1.5× Rate):</span>
                    <span className="text-indigo-600 font-mono">
                      {weeklyOvertimeHours} hrs/wk
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    value={weeklyOvertimeHours}
                    onChange={(e) =>
                      setWeeklyOvertimeHours(Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Dual-Skill Stack Premium Bonus:</span>
                    <span className="text-emerald-600 font-mono">
                      +{dualSkillStackBonusPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={45}
                    value={dualSkillStackBonusPct}
                    onChange={(e) =>
                      setDualSkillStackBonusPct(Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="rounded-xl bg-slate-950 text-white p-3">
                    <div className="text-[10px] font-mono text-sky-300 uppercase">
                      2-Yr Paid Apprenticeship
                    </div>
                    <div className="text-sm sm:text-base font-black text-amber-300">
                      ${twoYearPaidApprenticeshipTotal.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      4,000 OJT Hours Earned Debt-Free
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-950 text-white p-3">
                    <div className="text-[10px] font-mono text-emerald-300 uppercase">
                      Dual-Skill Annual Comp
                    </div>
                    <div className="text-sm sm:text-base font-black text-emerald-400">
                      ${dualSkillLoadedAnnual.toLocaleString()}/yr
                    </div>
                    <div className="text-[10px] text-slate-400">
                      5-Yr Total: ${fiveYearCumulativeEarnings.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Stage Career Compensation Progression Table */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {salaryModel.stages.map((st, sIdx) => (
                  <div
                    key={sIdx}
                    className="rounded-xl bg-white dark:bg-zinc-900 p-3.5 border border-zinc-200 dark:border-zinc-800 space-y-1.5"
                  >
                    <span className="text-[10px] font-mono font-bold text-[#0A66C2] dark:text-sky-400">
                      {st.typicalTimeline}
                    </span>
                    <h5 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                      {st.stageName}
                    </h5>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {st.annualBand}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500">
                      {st.hourlyBand}
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      <strong>Unlock Requirement:</strong>{" "}
                      {st.verifiedEvidenceRequired}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKBENCH 3: INTERACTIVE FLASHCARDS & FORMULA DRILL DECK */}
        {(activeWorkbenchTab === "all_workbenches" ||
          activeWorkbenchTab === "flashcards") && (
          <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/25 dark:bg-amber-950/15 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="rounded bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-mono font-black">
                  WORKBENCH 03 · INTERACTIVE FORMULA, SAFETY &amp; DIAGNOSTIC FLASHCARD DECK
                </span>
                <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">
                  Active Recall Drill Deck for {activePathway.title} ({masteredFlashcardCount}/{flashcardDeck.length} Mastered)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                {flashcardDeck.map((fc, idx) => (
                  <button
                    key={fc.id}
                    type="button"
                    onClick={() => {
                      setCurrentCardIdx(idx)
                      setIsCardFlipped(false)
                    }}
                    className={`h-7 w-7 rounded-lg text-xs font-mono font-black cursor-pointer ${
                      currentCardIdx === idx
                        ? "bg-[#0A66C2] text-white"
                        : masteredCards[fc.id]
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white p-6 border border-white/15 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="rounded-full bg-amber-500 text-slate-950 px-3 py-0.5 font-black">
                  Card {currentFlashcard.cardNumber} of {flashcardDeck.length} ·{" "}
                  {currentFlashcard.categoryBadge}
                </span>
                <span className="text-sky-300">
                  {isCardFlipped
                    ? "Showing Answer (Click Card to Flip)"
                    : "Showing Prompt (Click Card to Flip Answer)"}
                </span>
              </div>

              {!isCardFlipped ? (
                <div className="space-y-3 py-2">
                  <h5 className="text-base sm:text-lg font-black text-white">
                    {currentFlashcard.frontPrompt}
                  </h5>
                  <div className="rounded-xl bg-black/50 border border-white/10 p-3 font-mono text-xs text-amber-300">
                    Governing Equation / Spec: {currentFlashcard.formulaOrSpec}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <div className="text-xs font-mono uppercase text-emerald-300 font-bold">
                    ✓ Verified Engineering &amp; SOP Answer:
                  </div>
                  <p className="text-sm text-sky-100 whitespace-pre-line leading-relaxed">
                    {currentFlashcard.backAnswer}
                  </p>
                  <div className="rounded-xl bg-black/60 border border-emerald-400/30 p-3 font-mono text-xs text-emerald-300">
                    {currentFlashcard.formulaOrSpec}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentCardIdx(
                      (currentCardIdx - 1 + flashcardDeck.length) %
                        flashcardDeck.length
                    )
                    setIsCardFlipped(false)
                  }}
                  className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3.5 py-2 text-xs font-bold cursor-pointer"
                >
                  ← Previous Card
                </button>
                <button
                  type="button"
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className="rounded-xl bg-[#0A66C2] text-white px-4 py-2 text-xs font-black cursor-pointer"
                >
                  {isCardFlipped ? "Flip to Question" : "Flip to Answer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentCardIdx(
                      (currentCardIdx + 1) % flashcardDeck.length
                    )
                    setIsCardFlipped(false)
                  }}
                  className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3.5 py-2 text-xs font-bold cursor-pointer"
                >
                  Next Card →
                </button>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMasteredCards((p) => ({
                    ...p,
                    [currentFlashcard.id]: !p[currentFlashcard.id]
                  }))
                }
                className={`rounded-xl px-4 py-2 text-xs font-black cursor-pointer ${
                  masteredCards[currentFlashcard.id]
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-900 dark:bg-zinc-700 text-white"
                }`}
              >
                {masteredCards[currentFlashcard.id]
                  ? "✓ Card Mastered"
                  : "Mark Card Mastered"}
              </button>
            </div>
          </div>
        )}

        {/* WORKBENCH 4: LIVE FAULT TRIAGE MODE (BRANCHING SCENARIO TROUBLESHOOTER) */}
        {(activeWorkbenchTab === "all_workbenches" ||
          activeWorkbenchTab === "fault_triage") && (
          <div className="rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/15 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="rounded bg-rose-600 text-white px-2.5 py-0.5 text-[10px] font-mono font-black">
                  WORKBENCH 04 · LIVE FAULT TRIAGE MODE (BRANCHING SOP TROUBLESHOOTER)
                </span>
                <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">
                  Simulated Control-Room &amp; Field Alarm Scenarios — Make the Right SOP Call
                </h4>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {LIVE_FAULT_TRIAGE_SCENARIOS.map((sc, idx) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setActiveTriageIdx(idx)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer border ${
                      activeTriageIdx === idx
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    Scenario #{idx + 1}: Career #{sc.careerNumber}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 text-white p-4 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="rounded bg-rose-600 text-white px-2.5 py-0.5 text-[10px] font-mono font-black">
                  {currentTriageScenario.severity}
                </span>
                <span className="text-xs font-mono text-amber-300">
                  {currentTriageScenario.alarmCode}
                </span>
              </div>
              <div className="rounded-xl bg-black/60 border border-white/10 p-3 font-mono text-xs text-emerald-300">
                LIVE TELEMETRY: {currentTriageScenario.telemetryReadout}
              </div>
              <p className="text-xs sm:text-sm text-sky-100 font-semibold">
                {currentTriageScenario.situationPrompt}
              </p>
            </div>

            <div className="space-y-2">
              {currentTriageScenario.options.map((opt, oIdx) => {
                const isSelected = chosenOptionIdx === oIdx
                return (
                  <div
                    key={oIdx}
                    onClick={() =>
                      setSelectedTriageOption((p) => ({
                        ...p,
                        [currentTriageScenario.id]: oIdx
                      }))
                    }
                    className={`rounded-xl p-3.5 border cursor-pointer transition-all ${
                      isSelected
                        ? opt.isCorrectSop
                          ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40"
                          : "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-black">
                        Option {oIdx + 1}
                      </span>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {opt.label}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-200/70 dark:border-zinc-800 text-xs space-y-1">
                        <p
                          className={
                            opt.isCorrectSop
                              ? "text-emerald-800 dark:text-emerald-300 font-bold"
                              : "text-rose-800 dark:text-rose-300 font-bold"
                          }
                        >
                          {opt.feedbackAndConsequence}
                        </p>
                        <p className="text-[11px] font-mono text-zinc-500">
                          Governing SOP Reference: {opt.sopReference}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* WORKBENCH 5: AUTOMATED EMPLOYER VERIFIED SKILL PASSPORT & SHARE DOSSIER */}
        {(activeWorkbenchTab === "all_workbenches" ||
          activeWorkbenchTab === "skill_passport") && (
          <div className="rounded-2xl border border-[#0A66C2]/50 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-5 text-white space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="rounded-full bg-amber-500 text-slate-950 px-3 py-0.5 text-[10px] font-mono font-black">
                  WORKBENCH 05 · EMPLOYER-VERIFIABLE SKILL PASSPORT &amp; SHAREABLE DOSSIER
                </span>
                <h4 className="text-lg sm:text-xl font-black text-white">
                  Verified Competency Passport — {activePathway.title} ({readinessScorePercent}% Job-Ready Index)
                </h4>
                <p className="text-xs text-sky-200 max-w-3xl">
                  Combines your live video watch telemetry ({watchRecommendations.totalWatchFormatted}), completed classroom milestones ({completedMilestoneCount}/9), graded Milestone 7 deliverable ({gradingResult?.totalScore || 100}/100), and #1 domain specialty into a single employer-verifiable credential dossier.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(
                        `https://connectln.vercel.app/connectin?passport=${activePathway.id}&score=${readinessScorePercent}`
                      )
                    } catch {
                      // ignore clipboard error
                    }
                    setCopiedPassportLink(true)
                    triggerToast(
                      "Copied Verifiable Employer Skill Passport URL to clipboard!"
                    )
                    setTimeout(() => setCopiedPassportLink(false), 3500)
                  }}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs font-black cursor-pointer"
                >
                  {copiedPassportLink
                    ? "✓ Employer Link Copied!"
                    : "🔗 Copy Employer Share Link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadText(
                      `connectln-verified-skill-passport-${activePathway.id}.md`,
                      `# ConnectLn Official Employer-Verifiable Skill Passport\n\n- **Primary Pathway**: ${activePathway.title}\n- **Overall Job-Readiness Score**: ${readinessScorePercent}%\n- **Total Video Telemetry Logged**: ${watchRecommendations.totalWatchFormatted}\n- **Top Watched Technical Domain**: ${watchRecommendations.topWatchedDomain?.domainTitle} (${watchRecommendations.topWatchedDomain?.watchedFormatted})\n- **Milestones Verified**: ${completedMilestoneCount} of 9\n- **Milestone 7 Deliverable Score**: ${gradingResult?.totalScore || 100}/100 (${gradingResult?.verifierAttestationHash})\n- **Capstone Requirement**: ${activePathway.capstoneSummary}\n`
                    )
                  }}
                  className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Employer Dossier (.md)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
