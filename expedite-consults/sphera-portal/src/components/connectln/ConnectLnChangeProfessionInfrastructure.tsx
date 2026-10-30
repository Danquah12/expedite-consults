"use client"

import React, { useState, useMemo } from "react"
import {
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Download,
  GraduationCap,
  Sliders,
  Rocket,
  Check,
  GitBranch
} from "lucide-react"
import {
  ALL_60_SPECIALIST_CAREER_SPECS,
  ALL_60_SPECIALIST_CAREER_PATHWAYS
} from "@/lib/connectln-60-specialist-careers"
import {
  PriorityCareerPathway
} from "@/lib/connectln-career-mastery-academy"
import {
  SpecializedTangibleCareerSpec,
  buildSpecializedCareerPathway
} from "@/lib/connectln-33-specialized-careers"

export type MobilityMode = "upgrade_level" | "change_profession"

export interface GradeTierOption {
  id: string
  levelNumber: number
  shortLabel: string
  gradeEquivalent: string
  typicalPayBand: string
  hourlyRange: [number, number]
  annualMultiplier: number
  authorityScope: string
  requiredProofDeliverable: string
}

export const GRADE_AND_POSITION_TIERS: GradeTierOption[] = [
  {
    id: "tier_1_trainee",
    levelNumber: 1,
    shortLabel: "Level 1 — Trainee / Apprentice / Entry Operator",
    gradeEquivalent: "GS-5 to GS-6 · Trade Year 1–2 · Band I",
    typicalPayBand: "$44,000 – $58,000/yr",
    hourlyRange: [21, 28],
    annualMultiplier: 1.0,
    authorityScope: "Executes standard operating procedures (SOPs) under direct journeyworker or supervisor sign-off; logs traveler/ticket data.",
    requiredProofDeliverable: "Milestone 1–2 Safety & Measurement Logs + Cleanroom/Jobsite SOP Checklist"
  },
  {
    id: "tier_2_associate",
    levelNumber: 2,
    shortLabel: "Level 2 — Associate Technician / Junior Specialist",
    gradeEquivalent: "GS-7 to GS-9 · Trade Year 3–4 · Band II",
    typicalPayBand: "$58,000 – $74,000/yr",
    hourlyRange: [28, 36],
    annualMultiplier: 1.24,
    authorityScope: "Independently operates calibrated instruments, performs first-line fault isolation, and executes Preventive Maintenance (PM).",
    requiredProofDeliverable: "Milestone 3–5 Worked Diagnostic Lab + Calibrated Instrument Traceability Record"
  },
  {
    id: "tier_3_journeyworker",
    levelNumber: 3,
    shortLabel: "Level 3 — Journeyworker / Mid-Level Practitioner",
    gradeEquivalent: "GS-9 to GS-11 · Licensed Journeyworker · Band III",
    typicalPayBand: "$74,000 – $94,000/yr",
    hourlyRange: [36, 45],
    annualMultiplier: 1.52,
    authorityScope: "Full autonomous execution of complex assemblies, root-cause troubleshooting, SPC trend interpretation, and apprentice mentoring.",
    requiredProofDeliverable: "Milestone 6–7 SPC & Root-Cause Fault Isolation Dossier + Statutory Journeyworker Exam Prep"
  },
  {
    id: "tier_4_senior_lead",
    levelNumber: 4,
    shortLabel: "Level 4 — Senior Specialist / Lead Technical Authority",
    gradeEquivalent: "GS-12 to GS-13 · Master Technician / Lead · Band IV",
    typicalPayBand: "$94,000 – $122,000/yr",
    hourlyRange: [45, 59],
    annualMultiplier: 1.88,
    authorityScope: "Signs off on Non-Conformance Reports (NCRs), authors Commissioning & Acceptance Test Procedures (ATP), leads cross-shift escalations.",
    requiredProofDeliverable: "Milestone 8–9 Full Production Lot / System Acceptance Test Report & NCR Disposition Defense"
  },
  {
    id: "tier_5_supervisor",
    levelNumber: 5,
    shortLabel: "Level 5 — Shift Supervisor / Field Foreman / Team Lead",
    gradeEquivalent: "GS-13 · General Foreman / SOC Watch Commander · Band V",
    typicalPayBand: "$108,000 – $138,000/yr",
    hourlyRange: [52, 66],
    annualMultiplier: 2.15,
    authorityScope: "Directs 8–25 technicians, manages shift handover traceability, labor scheduling, OSHA/LOTO safety compliance, and KPI throughput.",
    requiredProofDeliverable: "Multi-Crew Turnaround Schedule, Shift Handover Audit Ledger & Safety Incident Root-Cause Brief"
  },
  {
    id: "tier_6_superintendent",
    levelNumber: 6,
    shortLabel: "Level 6 — Superintendent / Principal Engineer / Ops Manager",
    gradeEquivalent: "GS-14 · General Superintendent / Principal · Band VI",
    typicalPayBand: "$128,000 – $168,000/yr",
    hourlyRange: [62, 81],
    annualMultiplier: 2.55,
    authorityScope: "Owns multi-million-dollar capital equipment uptime, multi-discipline commissioning, regulatory audit defense, and capex budgeting.",
    requiredProofDeliverable: "Facility/Fleet Reliability Architecture, Capital Commissioning Plan & Regulatory Compliance Matrix"
  },
  {
    id: "tier_7_director",
    levelNumber: 7,
    shortLabel: "Level 7 — Director / Chief Inspector / Regulatory Authority",
    gradeEquivalent: "GS-15 / SES · VP Technical Operations · Band VII",
    typicalPayBand: "$155,000 – $210,000/yr",
    hourlyRange: [75, 101],
    annualMultiplier: 3.05,
    authorityScope: "Enterprise quality systems governance, statutory airworthiness/maritime/grid sign-off coordination, and multi-site workforce strategy.",
    requiredProofDeliverable: "Enterprise Quality Management System (QMS) Charter & Multi-Site Risk Governance Dossier"
  },
  {
    id: "tier_8_business_owner",
    levelNumber: 8,
    shortLabel: "Level 8 — Independent Contracting Firm Owner / Founder",
    gradeEquivalent: "Licensed Qualifier / Principal Contractor / Equity Owner",
    typicalPayBand: "$145,000 – $320,000+/yr (Net Owner Income)",
    hourlyRange: [70, 155],
    annualMultiplier: 3.4,
    authorityScope: "Bids commercial/federal contracts, holds qualifier licenses, bonds & insures crews, manages estimating, cashflow, and client SLAs.",
    requiredProofDeliverable: "Complete Commercial Bid Takeoff, Overhead & Margin Model, Bonding/Insurance Packet & Service SLA"
  }
]

export interface StartingBackgroundPreset {
  id: string
  title: string
  sector: string
  typicalCurrentPay: number
  coreExistingSkills: string[]
  naturalTargetCareerNumbers: number[]
  transferableStrengthSummary: string
}

export const STARTING_BACKGROUND_PRESETS: StartingBackgroundPreset[] = [
  {
    id: "bg_electrician_trades",
    title: "Electrician / HVAC / Construction Tradesperson",
    sector: "Skilled Trades & Construction",
    typicalCurrentPay: 64000,
    coreExistingSkills: [
      "Multimeter & clamp-meter diagnostics",
      "Blueprint & schematic reading",
      "NEC wiring, conduit & LOTO safety",
      "Jobsite hazard recognition & hand/power tool mastery"
    ],
    naturalTargetCareerNumbers: [1, 3, 4, 34, 38, 41, 46],
    transferableStrengthSummary: "Your physical electrical safety, schematic literacy, and LOTO discipline transfer at 75%+ into Building Automation (#1), Industrial Robotics (#4), Substation Relay Testing (#41), and Aircraft Avionics (#34)."
  },
  {
    id: "bg_military_veteran",
    title: "Military / Veteran Technician (Avionics, Comms, Navy Nuke/Engineman)",
    sector: "Defense, Aviation & Maritime",
    typicalCurrentPay: 68000,
    coreExistingSkills: [
      "Strict SOP compliance & maintenance traceability",
      "RF/comms or propulsion/electrical fault isolation",
      "High-pressure watchstanding & shift turnover logs",
      "Security clearance / regulatory readiness"
    ],
    naturalTargetCareerNumbers: [34, 35, 36, 39, 43, 44, 46],
    transferableStrengthSummary: "Your watchstanding discipline and technical manual adherence give you an immediate fast-track into Aircraft Avionics (#34), Satellite Systems (#35), Marine Engineering (#36), and Defense Mission Assurance (#44)."
  },
  {
    id: "bg_it_helpdesk",
    title: "IT Helpdesk / Desktop Support / Network Admin",
    sector: "Information Technology",
    typicalCurrentPay: 56000,
    coreExistingSkills: [
      "TCP/IP networking, VLANs & packet basics",
      "Ticketing systems, SLA documentation & escalation",
      "OS administration (Linux/Windows) & scripting",
      "Hardware troubleshooting & rack/cable dressing"
    ],
    naturalTargetCareerNumbers: [15, 38, 39, 40, 42, 43, 19],
    transferableStrengthSummary: "Your TCP/IP and troubleshooting foundation bridges directly into Critical Infrastructure OT/ICS Cyber (#42), Data Center Critical Facilities (#15), Wireless RF (#39), and OSINT/Threat Analysis (#43)."
  },
  {
    id: "bg_manufacturing_operator",
    title: "Manufacturing Line Operator / Machine Tender / Warehouse Lead",
    sector: "Manufacturing & Logistics",
    typicalCurrentPay: 46000,
    coreExistingSkills: [
      "Production traveler & lot number tracking",
      "5S, GMP, and basic statistical quality checks",
      "Material handling, forklift/pallet safety & SOPs",
      "Shift handover communication & cycle-time awareness"
    ],
    naturalTargetCareerNumbers: [4, 5, 37, 45, 46, 47, 50],
    transferableStrengthSummary: "Your familiarity with production travelers and shift discipline gives you a natural launchpad into Semiconductor & Cleanroom Operations (#42 / #46), CNC Precision Machining (#45), Nondestructive Testing (#5), and Port Logistics (#37)."
  },
  {
    id: "bg_automotive_mechanic",
    title: "Automotive Mechanic / Diesel Fleet Technician",
    sector: "Automotive & Heavy Equipment",
    typicalCurrentPay: 59000,
    coreExistingSkills: [
      "CAN-bus & oscilloscope waveform diagnostics",
      "Hydraulic, pneumatic & thermal fluid systems",
      "Precision torque, micrometer & runout measurement",
      "Preventive maintenance scheduling & parts teardown"
    ],
    naturalTargetCareerNumbers: [2, 34, 36, 40, 45, 46, 5],
    transferableStrengthSummary: "Your mechanical-electrical diagnostic mindset transfers at 80%+ into EV High-Voltage Systems (#2), Aircraft Maintenance (#34), Rail Signaling & Rolling Stock (#40), and Marine Vessel Systems (#36)."
  },
  {
    id: "bg_healthcare_clinical",
    title: "Nurse (RN/LPN) / EMT / Paramedic / Lab Phlebotomist",
    sector: "Healthcare & Emergency Services",
    typicalCurrentPay: 66000,
    coreExistingSkills: [
      "Aseptic technique, contamination control & PPE",
      "Patient/instrument monitoring & alarm triage",
      "HIPAA/FDA regulatory documentation & chain of custody",
      "High-stakes incident command & triage under pressure"
    ],
    naturalTargetCareerNumbers: [7, 8, 9, 10, 56, 57, 58],
    transferableStrengthSummary: "Your clinical documentation, contamination control, and biomedical alarm experience map directly to Biomedical Equipment Technology (#7), Clinical Trials Coordination (#9), Biomanufacturing (#8), and Emergency Management (#56)."
  },
  {
    id: "bg_retail_hospitality_admin",
    title: "Retail Manager / Customer Operations / Admin / Paralegal Assistant",
    sector: "Operations, Legal & Administration",
    typicalCurrentPay: 45000,
    coreExistingSkills: [
      "Vendor coordination, scheduling & inventory audits",
      "Document review, contract/compliance checklists",
      "High-volume client communication & dispute resolution",
      "Spreadsheet auditing & KPI reporting"
    ],
    naturalTargetCareerNumbers: [29, 30, 37, 51, 52, 53, 54],
    transferableStrengthSummary: "Your audit, scheduling, and documentation rigor bridges smoothly into Legal Operations & eDiscovery (#51), Regulatory Compliance (#52), Patents/IP Support (#53), Customs/Trade Compliance (#30), and Construction Estimating (#29)."
  }
]

interface ConnectLnChangeProfessionInfrastructureProps {
  onLaunchTargetCareerInClassroom: (
    pathway: PriorityCareerPathway,
    careerSpec?: SpecializedTangibleCareerSpec,
    preferredTab?: "lessons" | "worked_lab" | "assessment" | "rubric_deliverable" | "plan_pathway_walkthrough" | "training_videos"
  ) => void
  onClaimCertificate?: (title: string) => void
}

export function ConnectLnChangeProfessionInfrastructure({
  onLaunchTargetCareerInClassroom,
  onClaimCertificate
}: ConnectLnChangeProfessionInfrastructureProps) {
  // 1. Core Mode: Vertical Level/Grade Upgrade vs. Complete Profession Pivot
  const [mobilityMode, setMobilityMode] = useState<MobilityMode>("upgrade_level")

  // 2. Shared & Mode-Specific State
  const [selectedCurrentPresetId, setSelectedCurrentPresetId] = useState<string>(
    STARTING_BACKGROUND_PRESETS[0].id
  )
  const [customCurrentProfession, setCustomCurrentProfession] = useState<string>("")
  const [currentGradeId, setCurrentGradeId] = useState<string>("tier_2_associate")
  const [targetGradeId, setTargetGradeId] = useState<string>("tier_4_senior_lead")
  const [customTargetPositionTitle, setCustomTargetPositionTitle] = useState<string>("")

  // Selected Target Specialist Career (#1 - #60)
  const [targetCareerNumber, setTargetCareerNumber] = useState<number>(34)
  const [careerSearchFilter, setCareerSearchFilter] = useState<string>("")

  // Financial & Timeline Inputs
  const [currentAnnualPay, setCurrentAnnualPay] = useState<number>(62000)
  const [yearsExperience, setYearsExperience] = useState<number>(3)
  const [targetTimelineWeeks, setTargetTimelineWeeks] = useState<number>(12)

  // Interactive Competency & Promotion Checklist State
  const [checkedCompetencies, setCheckedCompetencies] = useState<Record<string, boolean>>({
    comp_0: true,
    comp_1: true
  })

  // Noctis Interactive Co-Pilot State
  const [vibeCustomQuestion, setVibeCustomQuestion] = useState<string>("")
  const [activeVibePromptKey, setActiveVibePromptKey] = useState<string>("optimal_decision")
  const [vibeConversationLog, setVibeConversationLog] = useState<
    Array<{ role: "user" | "vibe"; title?: string; body: string; timestamp: string }>
  >([])

  const currentPreset = useMemo(
    () =>
      STARTING_BACKGROUND_PRESETS.find((p) => p.id === selectedCurrentPresetId) ||
      STARTING_BACKGROUND_PRESETS[0],
    [selectedCurrentPresetId]
  )

  const currentGrade = useMemo(
    () =>
      GRADE_AND_POSITION_TIERS.find((g) => g.id === currentGradeId) ||
      GRADE_AND_POSITION_TIERS[1],
    [currentGradeId]
  )

  const targetGrade = useMemo(
    () =>
      GRADE_AND_POSITION_TIERS.find((g) => g.id === targetGradeId) ||
      GRADE_AND_POSITION_TIERS[3],
    [targetGradeId]
  )

  const targetCareerSpec = useMemo(
    () =>
      ALL_60_SPECIALIST_CAREER_SPECS.find((c) => c.careerNumber === targetCareerNumber) ||
      ALL_60_SPECIALIST_CAREER_SPECS[33],
    [targetCareerNumber]
  )

  const targetCareerPathway = useMemo(
    () =>
      ALL_60_SPECIALIST_CAREER_PATHWAYS.find((p) => p.id === targetCareerSpec.id) ||
      buildSpecializedCareerPathway(targetCareerSpec),
    [targetCareerSpec]
  )

  // Filtered 60 Careers for Dropdown / Picker
  const filtered60Careers = useMemo(() => {
    const q = careerSearchFilter.trim().toLowerCase()
    if (!q) return ALL_60_SPECIALIST_CAREER_SPECS
    return ALL_60_SPECIALIST_CAREER_SPECS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.domainTitle.toLowerCase().includes(q) ||
        c.capstoneProject.toLowerCase().includes(q) ||
        String(c.careerNumber) === q
    )
  }, [careerSearchFilter])

  // Compute Transferable Skill Overlap, Fast-Track Milestones, and Financials
  const decisionMetrics = useMemo(() => {
    const isRecommendedMatch = currentPreset.naturalTargetCareerNumbers.includes(
      targetCareerSpec.careerNumber
    )
    const baseOverlap =
      mobilityMode === "upgrade_level"
        ? Math.min(88, 52 + yearsExperience * 5 + currentGrade.levelNumber * 4)
        : isRecommendedMatch
        ? Math.min(82, 58 + yearsExperience * 3)
        : Math.min(68, 42 + yearsExperience * 2)

    // Milestones credited vs bridge milestones needed
    const creditedMilestonesCount =
      mobilityMode === "upgrade_level"
        ? Math.min(5, Math.max(2, currentGrade.levelNumber + 1))
        : isRecommendedMatch
        ? 3
        : 2

    const creditedMilestones = Array.from(
      { length: creditedMilestonesCount },
      (_, i) => i + 1
    )
    const bridgeMilestones = Array.from(
      { length: 9 - creditedMilestonesCount },
      (_, i) => i + 1 + creditedMilestonesCount
    )

    // Target compensation calculation
    const targetUpgradeAnnualPay = Math.round(
      Math.max(
        currentAnnualPay * 1.18,
        52000 * targetGrade.annualMultiplier + yearsExperience * 1800
      )
    )

    const targetPivotAnnualPay = Math.round(
      Math.max(
        currentAnnualPay * 1.15,
        64000 * (targetGrade.annualMultiplier * 0.88) +
          (targetCareerSpec.careerNumber >= 34 ? 9500 : 5500)
      )
    )

    const chosenTargetAnnualPay =
      mobilityMode === "upgrade_level" ? targetUpgradeAnnualPay : targetPivotAnnualPay

    const annualPayDelta = chosenTargetAnnualPay - currentAnnualPay
    const fiveYearNetGain = annualPayDelta * 5
    const hourlyTarget = Math.round(chosenTargetAnnualPay / 2080)
    const hourlyCurrent = Math.round(currentAnnualPay / 2080)

    // Dynamic Readiness Score from checklist
    const totalChecklistItems = 6
    const checkedCount = Object.values(checkedCompetencies).filter(Boolean).length
    const checklistReadinessPct = Math.round(
      baseOverlap * 0.55 + (checkedCount / totalChecklistItems) * 45
    )

    return {
      isRecommendedMatch,
      skillOverlapPct: baseOverlap,
      creditedMilestones,
      bridgeMilestones,
      targetUpgradeAnnualPay,
      targetPivotAnnualPay,
      chosenTargetAnnualPay,
      annualPayDelta,
      fiveYearNetGain,
      hourlyTarget,
      hourlyCurrent,
      checklistReadinessPct
    }
  }, [
    currentPreset,
    targetCareerSpec,
    mobilityMode,
    yearsExperience,
    currentGrade,
    targetGrade,
    currentAnnualPay,
    checkedCompetencies
  ])

  // Top 3 Noctis Recommended Careers for Current Background
  const vibeTop3CareerRecommendations = useMemo(() => {
    const nums = currentPreset.naturalTargetCareerNumbers.slice(0, 3)
    return nums
      .map((n) => ALL_60_SPECIALIST_CAREER_SPECS.find((c) => c.careerNumber === n))
      .filter((c): c is SpecializedTangibleCareerSpec => Boolean(c))
  }, [currentPreset])

  // Dynamic 6-Item Promotion / Transition Competency Checklist
  const requiredBridgeCompetencies = useMemo(() => {
    const effectiveCurrentTitle =
      customCurrentProfession.trim() ||
      (mobilityMode === "upgrade_level" ? targetCareerSpec.title : currentPreset.title)

    return [
      {
        id: "comp_0",
        category: "Prior Foundation & SOP Traceability",
        title: `Verified baseline experience in ${effectiveCurrentTitle} (${currentGrade.gradeEquivalent})`,
        detail: `Demonstrate transferable logbook discipline, safety compliance, and standard operating procedure execution.`
      },
      {
        id: "comp_1",
        category: "Core Domain Instrumentation & Math",
        title: `Master ${targetCareerSpec.coreCurriculumBullets[0]} & ${targetCareerSpec.coreCurriculumBullets[1] || "Quantitative Calculations"}`,
        detail: `Complete Milestone 2–4 worked numeric calculations (${targetCareerSpec.workedFormulaTitle}) with zero tolerance errors.`
      },
      {
        id: "comp_2",
        category: "Fault Isolation & Diagnostic Triage",
        title: `Execute autonomous fault isolation in ${targetCareerSpec.coreCurriculumBullets[2] || targetCareerSpec.title}`,
        detail: `Isolate simulated out-of-spec hardware/process anomalies using decision trees without premature module replacement.`
      },
      {
        id: "comp_3",
        category: "Grade Authority & Escalation Boundaries",
        title: `Meet ${targetGrade.shortLabel} authority standard (${targetGrade.gradeEquivalent})`,
        detail: targetGrade.authorityScope
      },
      {
        id: "comp_4",
        category: "Quality Assurance & Non-Conformance (NCR)",
        title: `Author compliant QA / Traceability & Regulatory Records (${targetCareerSpec.coreCurriculumBullets[4] || "Compliance"})`,
        detail: `Produce audit-ready shift handover, chain-of-custody, or Non-Conformance disposition reports (${targetCareerSpec.tangibleEvidenceType}).`
      },
      {
        id: "comp_5",
        category: "Capstone Proof Artifact for Promotion / Hiring Panel",
        title: `Complete Capstone Deliverable: ${targetCareerSpec.capstoneProject}`,
        detail: `Required proof artifact: ${targetGrade.requiredProofDeliverable}`
      }
    ]
  }, [
    customCurrentProfession,
    mobilityMode,
    targetCareerSpec,
    currentPreset,
    currentGrade,
    targetGrade
  ])

  // Noctis Co-Pilot Generated Analysis
  const activeVibeAnalysis = useMemo(() => {
    const startRole =
      customCurrentProfession.trim() ||
      (mobilityMode === "upgrade_level"
        ? `${targetCareerSpec.title} (${currentGrade.shortLabel})`
        : `${currentPreset.title} (${currentGrade.shortLabel})`)

    const destRole =
      customTargetPositionTitle.trim() ||
      `${targetCareerSpec.title} — ${targetGrade.shortLabel}`

    if (activeVibePromptKey === "grade_justification") {
      return {
        headline: `Noctis Promotion & Grade-Step Justification Memorandum (${currentGrade.gradeEquivalent} → ${targetGrade.gradeEquivalent})`,
        summary: `To move from ${currentGrade.shortLabel} to ${targetGrade.shortLabel} in ${targetCareerSpec.title}, promotion boards and hiring managers evaluate whether you have crossed from "following SOPs" to "owning fault isolation, QA disposition, and shift/system accountability."`,
        bulletPoints: [
          `1. Credit Your Existing Milestones (${decisionMetrics.creditedMilestones.map((m) => `M${m}`).join(", ")}): Your ${yearsExperience} yrs of experience already satisfy ${decisionMetrics.skillOverlapPct}% of foundational safety and baseline operating requirements.`,
          `2. Close the Authority Gap (${targetGrade.gradeEquivalent}): Focus your next ${targetTimelineWeeks} weeks on Milestones ${decisionMetrics.bridgeMilestones.map((m) => `M${m}`).join(", ")}, specifically mastering "${targetCareerSpec.coreCurriculumBullets[3] || "Fault Isolation"}" and "${targetCareerSpec.coreCurriculumBullets[4] || "Regulatory Traceability"}".`,
          `3. Present Tangible Evidence: Submit your completed "${targetCareerSpec.capstoneProject}" (${targetCareerSpec.tangibleEvidenceType}) alongside ${targetGrade.requiredProofDeliverable} during your performance / promotion review to justify a +$${decisionMetrics.annualPayDelta.toLocaleString()}/yr compensation step.`
        ]
      }
    }

    if (activeVibePromptKey === "compare_upgrade_vs_pivot") {
      return {
        headline: `Noctis Strategic Tradeoff: Vertical Upgrade vs. Cross-Industry Profession Change`,
        summary: `Comparing a vertical promotion inside your current track against a complete profession pivot into Career #${targetCareerSpec.careerNumber} (${targetCareerSpec.title}):`,
        bulletPoints: [
          `• Vertical Upgrade Path (${currentGrade.shortLabel.split("—")[0]} → ${targetGrade.shortLabel.split("—")[0]}): Fastest time-to-promotion (${Math.max(4, targetTimelineWeeks - 4)} weeks), retains 100% of domain seniority, and yields ~$${decisionMetrics.targetUpgradeAnnualPay.toLocaleString()}/yr (+$${(decisionMetrics.targetUpgradeAnnualPay - currentAnnualPay).toLocaleString()}/yr lift).`,
          `• Complete Profession Change to #${targetCareerSpec.careerNumber} ${targetCareerSpec.title}: Transfers ${decisionMetrics.skillOverlapPct}% of your prior skills, credits Milestones ${decisionMetrics.creditedMilestones.map((m) => `M${m}`).join(", ")}, and positions you in ${targetCareerSpec.domainTitle} (${targetCareerSpec.careerGuidance.targetRoles}) at ~$${decisionMetrics.targetPivotAnnualPay.toLocaleString()}/yr.`,
          `• Noctis Verdict: ${
            decisionMetrics.isRecommendedMatch
              ? `Because Career #${targetCareerSpec.careerNumber} (${targetCareerSpec.title}) is a high-affinity match for your ${currentPreset.sector} background, you can execute either path or combine them into a Dual-Skill Specialist Stack for top-decile pay!`
              : `If you need immediate cashflow within 60 days, execute the Vertical Grade Upgrade first; if you want higher long-term ceiling and industry resilience, start the 12-week Bridge Curriculum for #${targetCareerSpec.careerNumber} ${targetCareerSpec.title} while employed.`
          }`
        ]
      }
    }

    if (activeVibePromptKey === "fastest_100k_path") {
      return {
        headline: `Noctis Fastest Route to $100,000+ / Year from ${startRole}`,
        summary: `In technical, trade, aviation, maritime, semiconductor, and infrastructure fields, crossing $100K/yr is achieved fastest by combining Level 4/5 Sign-Off Authority with a high-scarcity technical specialization:`,
        bulletPoints: [
          `• Step 1 (Weeks 1–4): Claim Credit-for-Prior-Learning (CPL) on Milestones ${decisionMetrics.creditedMilestones.map((m) => `M${m}`).join(", ")} so you do not repeat entry-level material.`,
          `• Step 2 (Weeks 5–9): Complete the Worked Numeric Labs (${targetCareerSpec.workedFormulaTitle}) & Fault Isolation Simulator for #${targetCareerSpec.careerNumber} ${targetCareerSpec.title}.`,
          `• Step 3 (Weeks 10–12): Package your Milestone 9 Capstone ("${targetCareerSpec.capstoneProject}") + Verified Skill Passport to qualify for Level 4 Senior Lead ($94K–$122K) or Level 5 Supervisor ($108K–$138K).`
        ]
      }
    }

    return {
      headline: `Noctis Personalized Mobility Blueprint: ${startRole} → ${destRole}`,
      summary: `Noctis analyzed your starting profile (${yearsExperience} yrs experience, $${currentAnnualPay.toLocaleString()}/yr current pay) against Career #${targetCareerSpec.careerNumber} (${targetCareerSpec.title}) at ${targetGrade.shortLabel}:`,
      bulletPoints: [
        `• Transferable Skill Overlap: ${decisionMetrics.skillOverlapPct}% match — You automatically fast-track Milestones ${decisionMetrics.creditedMilestones.map((m) => `M${m}`).join(", ")} and focus your ${targetTimelineWeeks}-week bridge plan on Milestones ${decisionMetrics.bridgeMilestones.map((m) => `M${m}`).join(", ")}.`,
        `• Compensation & 5-Year ROI Lift: Projected move from $${currentAnnualPay.toLocaleString()}/yr ($${decisionMetrics.hourlyCurrent}/hr) to $${decisionMetrics.chosenTargetAnnualPay.toLocaleString()}/yr ($${decisionMetrics.hourlyTarget}/hr) — a +$${decisionMetrics.annualPayDelta.toLocaleString()}/yr annual increase and +$${decisionMetrics.fiveYearNetGain.toLocaleString()} cumulative 5-year gain.`,
        `• Required Proof of Competence: Complete "${targetCareerSpec.capstoneProject}" (${targetCareerSpec.tangibleEvidenceType}) and "${targetGrade.requiredProofDeliverable}" inside the 9-Milestone Classroom to validate readiness.`
      ]
    }
  }, [
    customCurrentProfession,
    customTargetPositionTitle,
    mobilityMode,
    targetCareerSpec,
    currentGrade,
    targetGrade,
    currentPreset,
    activeVibePromptKey,
    decisionMetrics,
    yearsExperience,
    targetTimelineWeeks,
    currentAnnualPay
  ])

  const handleAskCustomVibeQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vibeCustomQuestion.trim()) return
    const q = vibeCustomQuestion.trim()
    const startRole =
      customCurrentProfession.trim() ||
      (mobilityMode === "upgrade_level"
        ? `${targetCareerSpec.title} (${currentGrade.shortLabel})`
        : currentPreset.title)
    const destRole =
      customTargetPositionTitle.trim() ||
      `${targetCareerSpec.title} (${targetGrade.shortLabel})`

    const reply = `Based on your transition from **${startRole}** to **${destRole}** (${targetGrade.gradeEquivalent}):\n1. **Skill Transfer (${decisionMetrics.skillOverlapPct}%)**: Your existing strengths (${currentPreset.coreExistingSkills.slice(0, 2).join(", ")}) fast-track Milestones ${decisionMetrics.creditedMilestones.map((m) => `M${m}`).join(", ")}.\n2. **Bridge Focus (Milestones ${decisionMetrics.bridgeMilestones.map((m) => `M${m}`).join(", ")})**: Concentrate on *${targetCareerSpec.coreCurriculumBullets.slice(2, 5).join(", ")}* and build your Capstone portfolio artifact (*${targetCareerSpec.capstoneProject}*).\n3. **Financial Outcome**: Moves your baseline from $${currentAnnualPay.toLocaleString()}/yr to ~$${decisionMetrics.chosenTargetAnnualPay.toLocaleString()}/yr (+$${decisionMetrics.fiveYearNetGain.toLocaleString()} over 5 years).`

    setVibeConversationLog((prev) => [
      {
        role: "vibe",
        title: `Noctis Response to: "${q}"`,
        body: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      },
      ...prev
    ])
    setVibeCustomQuestion("")
  }

  const handleDownloadTransitionDossier = () => {
    const startRole =
      customCurrentProfession.trim() ||
      (mobilityMode === "upgrade_level"
        ? `${targetCareerSpec.title} (${currentGrade.shortLabel})`
        : `${currentPreset.title} (${currentGrade.shortLabel})`)
    const destRole =
      customTargetPositionTitle.trim() ||
      `${targetCareerSpec.title} (${targetGrade.shortLabel})`

    const md = `# CONNECTLN & NOCTIS — CAREER UPGRADE & PROFESSION TRANSITION DOSSIER
Generated: ${new Date().toISOString().slice(0, 10)}
Mobility Mode: ${mobilityMode === "upgrade_level" ? "Vertical Level / Grade / Position Upgrade" : "Complete Cross-Industry Profession Change"}

## 1. CANDIDATE TRANSITION PROFILE
- **Current Profession / Role**: ${startRole}
- **Current Grade / Tier**: ${currentGrade.shortLabel} (${currentGrade.gradeEquivalent})
- **Target Profession / Role**: #${targetCareerSpec.careerNumber} ${destRole}
- **Target Grade / Tier**: ${targetGrade.shortLabel} (${targetGrade.gradeEquivalent})
- **Current Compensation**: $${currentAnnualPay.toLocaleString()}/yr ($${decisionMetrics.hourlyCurrent}/hr)
- **Projected Target Compensation**: $${decisionMetrics.chosenTargetAnnualPay.toLocaleString()}/yr ($${decisionMetrics.hourlyTarget}/hr)
- **Annual Pay Lift**: +$${decisionMetrics.annualPayDelta.toLocaleString()}/yr
- **5-Year Cumulative Net Income Gain**: +$${decisionMetrics.fiveYearNetGain.toLocaleString()}
- **Target Readiness Timeline**: ${targetTimelineWeeks} Weeks

## 2. TRANSFERABLE SKILL OVERLAP & CREDIT FOR PRIOR LEARNING (CPL)
- **Calculated Skill Transferability**: ${decisionMetrics.skillOverlapPct}%
- **Current Readiness Index**: ${decisionMetrics.checklistReadinessPct}%
- **Fast-Tracked / Credited Milestones**: Milestones ${decisionMetrics.creditedMilestones.join(", ")}
- **Required Bridge Training Milestones**: Milestones ${decisionMetrics.bridgeMilestones.join(", ")}
- **Existing Core Competencies Transferred**:
${currentPreset.coreExistingSkills.map((s) => `  - ${s}`).join("\n")}

## 3. TARGET PROFESSION TECHNICAL COMPETENCIES (#${targetCareerSpec.careerNumber} ${targetCareerSpec.title})
- **Domain Category**: ${targetCareerSpec.domainTitle}
- **Target Employer Roles**: ${targetCareerSpec.careerGuidance.targetRoles}
- **Core Technical Topics Required**:
${targetCareerSpec.coreCurriculumBullets.map((t) => `  - ${t}`).join("\n")}
- **Target Grade Authority Scope**: ${targetGrade.authorityScope}
- **Mandatory Capstone Portfolio Proof**: ${targetCareerSpec.capstoneProject} (${targetCareerSpec.tangibleEvidenceType})
- **Mandatory Grade Promotion Deliverable**: ${targetGrade.requiredProofDeliverable}

## 4. NOCTIS STRATEGIC DECISION BRIEFING
**${activeVibeAnalysis.headline}**
${activeVibeAnalysis.summary}

${activeVibeAnalysis.bulletPoints.join("\n\n")}
`
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vibe-career-${mobilityMode}-career-${targetCareerSpec.careerNumber}-dossier.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* 1. HERO HEADER & DUAL-MODE SWITCHER (UPGRADE GRADE vs CHANGE CAREER)  */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-0.5 text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                NOCTIS CAREER MOBILITY &amp; DECISION INFRASTRUCTURE
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-300">
                8 Grade Tiers · 60 Specialist Professions · Credit-for-Prior-Learning
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Change or Upgrade Your Profession — Level, Grade &amp; Cross-Industry Decision Engine
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Specify your current profession, level, grade, or position and choose whether you want to{" "}
              <strong className="text-amber-300">upgrade vertically to a higher grade/position</strong> (e.g., Apprentice → Journeyworker → Senior Lead / GS-13 → Superintendent → Business Owner) or{" "}
              <strong className="text-emerald-300">completely pivot into a new specialist profession</strong>. Noctis calculates your transferable skill overlap, fast-tracked milestones, 5-year income delta, and generates your bridge pathway.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                onLaunchTargetCareerInClassroom(
                  targetCareerPathway,
                  targetCareerSpec,
                  "plan_pathway_walkthrough"
                )
              }
              className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Rocket className="h-4 w-4" />
              <span>Launch Bridge Pathway in Classroom →</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadTransitionDossier}
              className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-4 py-2 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-amber-300" />
              <span>Download Transition Dossier (.md)</span>
            </button>
          </div>
        </div>

        {/* Two Primary Mobility Modes Switcher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setMobilityMode("upgrade_level")}
            className={`rounded-xl p-4 text-left border transition-all cursor-pointer flex items-start gap-3.5 ${
              mobilityMode === "upgrade_level"
                ? "border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/30 shadow-lg"
                : "border-white/15 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300 font-black">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  MODE A · VERTICAL ADVANCEMENT
                </span>
                {mobilityMode === "upgrade_level" && (
                  <span className="rounded bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[10px] font-black">
                    ACTIVE MODE
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Upgrade My Level, Grade, Pay Band, or Position
              </h3>
              <p className="text-xs text-indigo-100/80 leading-snug">
                Stay within your current or closely related field and step up from Trainee / Apprentice / Level 1 to Journeyworker, Senior Lead (GS-13), Foreman, Superintendent, or Contracting Business Owner.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMobilityMode("change_profession")}
            className={`rounded-xl p-4 text-left border transition-all cursor-pointer flex items-start gap-3.5 ${
              mobilityMode === "change_profession"
                ? "border-emerald-400 bg-emerald-400/15 ring-2 ring-emerald-400/30 shadow-lg"
                : "border-white/15 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300 font-black">
              <GitBranch className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  MODE B · COMPLETE CAREER PIVOT
                </span>
                {mobilityMode === "change_profession" && (
                  <span className="rounded bg-emerald-400 text-slate-950 px-1.5 py-0.2 text-[10px] font-black">
                    ACTIVE MODE
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Completely Change My Profession to a New Industry
              </h3>
              <p className="text-xs text-indigo-100/80 leading-snug">
                Pivot from your current occupation (Trades, Military, IT, Retail, Healthcare, Auto, Logistics) into any of our 60 Tangible-Competence Specialist Careers with Credit-for-Prior-Learning.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. STEP-BY-STEP ORIGIN → DESTINATION CONFIGURATOR                     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN (6 COLS): CURRENT PROFESSION, GRADE & COMPENSATION */}
        <div className="lg:col-span-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                1
              </span>
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                  Your Current Profession, Level, Grade &amp; Baseline
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Specify where you are starting today so Noctis can audit your transferable skills.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300">
              ORIGIN PROFILE
            </span>
          </div>

          {/* Preset Background Sector Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
              Select Your Current Industry / Occupational Background:
            </label>
            <select
              value={selectedCurrentPresetId}
              onChange={(e) => {
                const newPreset = STARTING_BACKGROUND_PRESETS.find(
                  (p) => p.id === e.target.value
                )
                setSelectedCurrentPresetId(e.target.value)
                if (newPreset) {
                  setCurrentAnnualPay(newPreset.typicalCurrentPay)
                  if (mobilityMode === "change_profession" && newPreset.naturalTargetCareerNumbers[0]) {
                    setTargetCareerNumber(newPreset.naturalTargetCareerNumbers[0])
                  }
                }
              }}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
            >
              {STARTING_BACKGROUND_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.title} ({preset.sector}) — Typical ${preset.typicalCurrentPay.toLocaleString()}/yr
                </option>
              ))}
            </select>
          </div>

          {/* Custom Exact Current Job Title / Grade Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
              Or Type Your Exact Current Job Title / MOS / Grade (Optional):
            </label>
            <input
              type="text"
              value={customCurrentProfession}
              onChange={(e) => setCustomCurrentProfession(e.target.value)}
              placeholder="e.g., Level 2 HVAC Controls Tech, Navy ET2, GS-9 IT Specialist, Staff RN..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>

          {/* Current Level / Grade / Position Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
              Your Current Level, Grade, or Position Tier:
            </label>
            <select
              value={currentGradeId}
              onChange={(e) => {
                setCurrentGradeId(e.target.value)
                const chosen = GRADE_AND_POSITION_TIERS.find((g) => g.id === e.target.value)
                if (chosen && chosen.levelNumber >= targetGrade.levelNumber) {
                  const nextHigher =
                    GRADE_AND_POSITION_TIERS.find(
                      (g) => g.levelNumber === Math.min(8, chosen.levelNumber + 2)
                    ) || GRADE_AND_POSITION_TIERS[GRADE_AND_POSITION_TIERS.length - 1]
                  setTargetGradeId(nextHigher.id)
                }
              }}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
            >
              {GRADE_AND_POSITION_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.shortLabel} ({tier.gradeEquivalent}) — {tier.typicalPayBand}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-200/70 dark:border-zinc-700/70">
              <strong className="text-zinc-700 dark:text-zinc-200">Current Scope:</strong>{" "}
              {currentGrade.authorityScope}
            </p>
          </div>

          {/* Current Compensation & Experience Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 border border-zinc-200/70 dark:border-zinc-700/70 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Current Annual Pay:</span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                  ${currentAnnualPay.toLocaleString()}/yr (${decisionMetrics.hourlyCurrent}/hr)
                </span>
              </div>
              <input
                type="range"
                min={32000}
                max={160000}
                step={2000}
                value={currentAnnualPay}
                onChange={(e) => setCurrentAnnualPay(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 border border-zinc-200/70 dark:border-zinc-700/70 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Years of Experience:</span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                  {yearsExperience} {yearsExperience === 1 ? "Year" : "Years"}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Existing Transferable Skills Detected */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Transferable Skills Detected from Your Background
              </span>
              <span className="rounded bg-indigo-600 text-white px-2 py-0.5 text-[10px] font-mono font-black">
                {decisionMetrics.skillOverlapPct}% OVERLAP
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentPreset.coreExistingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 text-[11px] font-medium text-zinc-800 dark:text-zinc-200"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-indigo-950/80 dark:text-indigo-200/80 leading-snug">
              {currentPreset.transferableStrengthSummary}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN (6 COLS): TARGET UPGRADE LEVEL / TARGET NEW PROFESSION */}
        <div className="lg:col-span-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                  {mobilityMode === "upgrade_level"
                    ? "Target Level, Grade, or Position Upgrade"
                    : "Target New Profession & Destination Grade"}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {mobilityMode === "upgrade_level"
                    ? "Choose the specialist track and higher grade/position you want to reach."
                    : "Select any of the 60 Specialist Careers or pick a Noctis Top-3 Match."}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
              DESTINATION TARGET
            </span>
          </div>

          {/* Noctis Top 3 Recommended Professions Ribbon */}
          <div className="rounded-xl border border-amber-300/80 dark:border-amber-800/70 bg-amber-50/60 dark:bg-amber-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Noctis Top-3 Highest-Transfer Professions for Your Background:
              </span>
              <span className="text-[10px] font-mono text-amber-800 dark:text-amber-300">
                1-Click Select
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {vibeTop3CareerRecommendations.map((rec) => {
                const isSelected = rec.careerNumber === targetCareerNumber
                return (
                  <button
                    key={rec.careerNumber}
                    type="button"
                    onClick={() => setTargetCareerNumber(rec.careerNumber)}
                    className={`rounded-lg p-2 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-600 bg-amber-500/20 dark:bg-amber-500/20 ring-2 ring-amber-500/30"
                        : "border-amber-200 dark:border-amber-800/60 bg-white dark:bg-zinc-900 hover:border-amber-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black text-amber-800 dark:text-amber-300">
                        Career #{rec.careerNumber}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                        High Fit ✓
                      </span>
                    </div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mt-0.5">
                      {rec.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {rec.domainTitle}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search & Select Target Profession (#1 to #60) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {mobilityMode === "upgrade_level"
                  ? "Select Your Specialist Profession Track (#1–#60):"
                  : "Select Your Target New Profession (#1–#60):"}
              </label>
              <input
                type="text"
                value={careerSearchFilter}
                onChange={(e) => setCareerSearchFilter(e.target.value)}
                placeholder="Filter 60 careers (e.g. avionics, fiber, marine)..."
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-900 dark:text-zinc-100 w-56"
              />
            </div>
            <select
              value={targetCareerNumber}
              onChange={(e) => setTargetCareerNumber(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
            >
              {filtered60Careers.map((c) => (
                <option key={c.careerNumber} value={c.careerNumber}>
                  #{c.careerNumber} — {c.title} ({c.domainTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Target Level / Grade / Position Tier Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
              Target Upgrade Level, Grade, or Position Tier:
            </label>
            <select
              value={targetGradeId}
              onChange={(e) => setTargetGradeId(e.target.value)}
              className="w-full rounded-xl border border-emerald-400 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/30 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100"
            >
              {GRADE_AND_POSITION_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.shortLabel} ({tier.gradeEquivalent}) — {tier.typicalPayBand}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-emerald-950 dark:text-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/70">
              <strong>Target Grade Authority ({targetGrade.gradeEquivalent}):</strong>{" "}
              {targetGrade.authorityScope}
            </p>
          </div>

          {/* Custom Target Position Title & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                Custom Target Title / Grade (Optional):
              </label>
              <input
                type="text"
                value={customTargetPositionTitle}
                onChange={(e) => setCustomTargetPositionTitle(e.target.value)}
                placeholder="e.g., GS-13 Lead Avionics Inspector..."
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                Target Completion Timeline:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[4, 8, 12, 24].map((wks) => (
                  <button
                    key={wks}
                    type="button"
                    onClick={() => setTargetTimelineWeeks(wks)}
                    className={`rounded-lg py-2 text-xs font-bold border transition-all cursor-pointer ${
                      targetTimelineWeeks === wks
                        ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {wks} Wks
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fast-Track Credit-for-Prior-Learning (CPL) Visual Milestone Bar */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                9-Milestone Bridge Plan (Credit for Prior Learning Applied)
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {decisionMetrics.creditedMilestones.length} Credited ·{" "}
                {decisionMetrics.bridgeMilestones.length} Bridge Milestones
              </span>
            </div>
            <div className="grid grid-cols-9 gap-1.5">
              {Array.from({ length: 9 }, (_, i) => i + 1).map((mNum) => {
                const isCredited = decisionMetrics.creditedMilestones.includes(mNum)
                return (
                  <div
                    key={mNum}
                    className={`rounded-lg p-1.5 text-center border ${
                      isCredited
                        ? "bg-emerald-600 text-white border-emerald-700"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-amber-400 dark:border-amber-700"
                    }`}
                  >
                    <p className="text-[10px] font-mono font-black">M{mNum}</p>
                    <p className="text-[9px] font-bold">
                      {isCredited ? "Credit ✓" : "Bridge"}
                    </p>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
              <strong className="text-emerald-700 dark:text-emerald-400">
                Milestones {decisionMetrics.creditedMilestones.map((m) => `M${m}`).join(", ")}
              </strong>{" "}
              are fast-tracked via your prior experience. Your bridge training focuses on{" "}
              <strong className="text-amber-700 dark:text-amber-400">
                Milestones {decisionMetrics.bridgeMilestones.map((m) => `M${m}`).join(", ")}
              </strong>{" "}
              and Capstone Deliverable: <em>{targetCareerSpec.capstoneProject}</em>.
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. NOCTIS DECISION MATRIX: STAY vs. UPGRADE LEVEL vs. CHANGE CAREER  */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#0A66C2]" />
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                Side-by-Side Career Decision Matrix (Status Quo vs. Grade Upgrade vs. Profession Change)
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Compare compensation, 5-year cumulative earnings, skill transferability, and required proof artifacts before committing.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-black text-[#0A66C2] dark:text-sky-300">
            Projected 5-Year Gain: +${decisionMetrics.fiveYearNetGain.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                <th className="p-3 font-black">Decision Dimension</th>
                <th className="p-3 font-bold text-zinc-500">
                  Option 1: Stay at Current Grade ({currentGrade.shortLabel.split("—")[0].trim()})
                </th>
                <th
                  className={`p-3 font-black ${
                    mobilityMode === "upgrade_level"
                      ? "bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300"
                      : ""
                  }`}
                >
                  Option 2: Vertical Grade / Position Upgrade ({targetGrade.gradeEquivalent})
                </th>
                <th
                  className={`p-3 font-black ${
                    mobilityMode === "change_profession"
                      ? "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300"
                      : ""
                  }`}
                >
                  Option 3: Complete Pivot to #{targetCareerSpec.careerNumber} {targetCareerSpec.title}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                  Annual &amp; Hourly Compensation
                </td>
                <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">
                  ${currentAnnualPay.toLocaleString()}/yr (${decisionMetrics.hourlyCurrent}/hr)
                </td>
                <td className="p-3 font-mono font-black text-amber-700 dark:text-amber-300">
                  ${decisionMetrics.targetUpgradeAnnualPay.toLocaleString()}/yr ($
                  {Math.round(decisionMetrics.targetUpgradeAnnualPay / 2080)}/hr)
                </td>
                <td className="p-3 font-mono font-black text-emerald-700 dark:text-emerald-300">
                  ${decisionMetrics.targetPivotAnnualPay.toLocaleString()}/yr ($
                  {Math.round(decisionMetrics.targetPivotAnnualPay / 2080)}/hr)
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                  5-Year Cumulative Income Delta
                </td>
                <td className="p-3 font-mono text-zinc-500">$0 Baseline</td>
                <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-300">
                  +$
                  {(
                    (decisionMetrics.targetUpgradeAnnualPay - currentAnnualPay) *
                    5
                  ).toLocaleString()}{" "}
                  over 5 yrs
                </td>
                <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  +$
                  {(
                    (decisionMetrics.targetPivotAnnualPay - currentAnnualPay) *
                    5
                  ).toLocaleString()}{" "}
                  over 5 yrs
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                  Skill Transferability &amp; CPL Credit
                </td>
                <td className="p-3 text-zinc-500">100% (No new credentials)</td>
                <td className="p-3 font-semibold text-zinc-800 dark:text-zinc-200">
                  {Math.min(90, decisionMetrics.skillOverlapPct + 10)}% Transfer · Credits M1–M
                  {Math.min(5, decisionMetrics.creditedMilestones.length + 1)}
                </td>
                <td className="p-3 font-semibold text-zinc-800 dark:text-zinc-200">
                  {decisionMetrics.skillOverlapPct}% Transfer · Credits{" "}
                  {decisionMetrics.creditedMilestones.map((m) => `M${m}`).join(", ")}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                  Scope of Sign-Off &amp; Target Roles
                </td>
                <td className="p-3 text-zinc-500">{currentGrade.authorityScope}</td>
                <td className="p-3 text-zinc-700 dark:text-zinc-300">
                  {targetGrade.authorityScope}
                </td>
                <td className="p-3 text-zinc-700 dark:text-zinc-300">
                  <strong>{targetCareerSpec.careerGuidance.targetRoles}</strong> ({targetCareerSpec.domainTitle})
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                  Mandatory Proof Deliverable
                </td>
                <td className="p-3 text-zinc-500">Standard shift attendance</td>
                <td className="p-3 font-medium text-amber-900 dark:text-amber-200">
                  {targetGrade.requiredProofDeliverable}
                </td>
                <td className="p-3 font-medium text-emerald-900 dark:text-emerald-200">
                  {targetCareerSpec.capstoneProject} ({targetCareerSpec.tangibleEvidenceType})
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. INTERACTIVE GRADE / PROFESSION COMPETENCY CHECKLIST & NOCTIS      */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT (6 COLS): INTERACTIVE PROMOTION & TRANSITION READINESS CHECKLIST */}
        <div className="lg:col-span-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                <span>Interactive Grade Promotion &amp; Career Transition Readiness Audit</span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Check off competencies you can already demonstrate to compute your live Readiness Score.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                LIVE READINESS
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {decisionMetrics.checklistReadinessPct}%
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {requiredBridgeCompetencies.map((item) => {
              const isChecked = !!checkedCompetencies[item.id]
              return (
                <div
                  key={item.id}
                  onClick={() =>
                    setCheckedCompetencies((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id]
                    }))
                  }
                  className={`rounded-xl p-3 border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? "border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-zinc-400"
                  }`}
                >
                  <div
                    className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center shrink-0 border ${
                      isChecked
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    {isChecked && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {item.category}
                    </span>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                      {item.detail}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT (6 COLS): NOCTIS CAREER MOBILITY CO-PILOT & DECISION ADVISOR */}
        <div className="lg:col-span-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Noctis Career Decision Co-Pilot
                  </h3>
                  <p className="text-[11px] text-indigo-200/80">
                    Real-time decision synthesis for your grade upgrade or profession pivot
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                ● NOCTIS ONLINE
              </span>
            </div>

            {/* 4 Quick Vibe Decision Prompts */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "optimal_decision", label: "✨ Optimal Mobility Blueprint" },
                { id: "grade_justification", label: "📈 Grade Promotion Justification" },
                { id: "compare_upgrade_vs_pivot", label: "⚖️ Upgrade vs. Pivot Tradeoff" },
                { id: "fastest_100k_path", label: "💰 Fastest Path to $100K+/yr" }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setActiveVibePromptKey(btn.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                    activeVibePromptKey === btn.id
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "bg-white/10 text-indigo-100 hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Active Noctis Decision Briefing Box */}
            <div className="rounded-xl bg-black/35 border border-white/15 p-4 space-y-2.5">
              <h4 className="text-xs sm:text-sm font-black text-amber-300">
                {activeVibeAnalysis.headline}
              </h4>
              <p className="text-xs text-indigo-100/90 leading-relaxed">
                {activeVibeAnalysis.summary}
              </p>
              <div className="space-y-1.5 pt-1">
                {activeVibeAnalysis.bulletPoints.map((bp, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-white/90 bg-white/5 rounded-lg p-2.5 border border-white/10 leading-relaxed"
                  >
                    {bp}
                  </p>
                ))}
              </div>
            </div>

            {/* Custom Question Input to Noctis */}
            <form onSubmit={handleAskCustomVibeQuestion} className="space-y-2">
              <label className="text-[11px] font-bold text-indigo-200 block">
                Ask Noctis a Specific Career Upgrade or Transition Question:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={vibeCustomQuestion}
                  onChange={(e) => setVibeCustomQuestion(e.target.value)}
                  placeholder="e.g., How do I move from Level 2 Tech to GS-13 Supervisor in 12 weeks?"
                  className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-xs text-white placeholder:text-indigo-200/50 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2 text-xs shrink-0 cursor-pointer"
                >
                  Ask Vibe
                </button>
              </div>
            </form>

            {/* Custom Q&A History */}
            {vibeConversationLog.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {vibeConversationLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-indigo-950/80 border border-indigo-400/30 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-amber-300 font-mono">
                      <span>{entry.title}</span>
                      <span>{entry.timestamp}</span>
                    </div>
                    <p className="text-indigo-100 whitespace-pre-line leading-relaxed">
                      {entry.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom 1-Click Classroom Launch Bar */}
          <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] text-indigo-200">
              Ready to execute your{" "}
              <strong className="text-white">
                #{targetCareerSpec.careerNumber} {targetCareerSpec.title}
              </strong>{" "}
              bridge plan?
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  onLaunchTargetCareerInClassroom(
                    targetCareerPathway,
                    targetCareerSpec,
                    "lessons"
                  )
                }
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Open 9-Milestone Bridge Classroom →</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClaimCertificate) {
                    onClaimCertificate(
                      `${targetCareerSpec.title} — ${targetGrade.shortLabel} Mobility Plan`
                    )
                  }
                }}
                className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-3 py-2 text-xs cursor-pointer"
              >
                Pin Goal to Profile ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
