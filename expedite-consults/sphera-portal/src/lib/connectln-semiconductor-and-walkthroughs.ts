import {
  PriorityCareerPathway,
  PathwayMilestoneUnit,
  buildTenPageTechnicalGuide
} from "@/lib/connectln-career-mastery-academy"
import { SpecializedTangibleCareerSpec } from "@/lib/connectln-33-specialized-careers"

// ============================================================================
// 1. VERBATIM SEMICONDUCTOR MANUFACTURING TECHNOLOGY FLAGSHIP DATA
// ============================================================================

export const SEMICONDUCTOR_TWELVE_WEEK_SCHEDULE = [
  { week: "Week 1", milestone: "Milestone 1", title: "Semiconductor foundations and cleanroom awareness", summary: "Industry, wafer basics, safety, contamination control." },
  { week: "Week 2", milestone: "Milestone 2", title: "Materials, wafers and measurement", summary: "Silicon, wafer geometry, crystal orientation and inspection." },
  { week: "Week 3–4", milestone: "Milestone 3", title: "Fabrication process flow", summary: "Oxidation, lithography, etching, doping and deposition." },
  { week: "Week 5", milestone: "Milestone 4", title: "Photolithography", summary: "Photoresist, alignment, exposure, development and pattern defects." },
  { week: "Week 6", milestone: "Milestone 5", title: "Etching, deposition and thermal processes", summary: "Material removal, film formation and process purpose." },
  { week: "Week 7", milestone: "Milestone 6", title: "Equipment and facilities", summary: "Tool modules, vacuum, gases, utilities, alarms and maintenance boundaries." },
  { week: "Week 8–9", milestone: "Milestone 7", title: "Metrology and process control", summary: "Measurements, specifications, trends, SPC and defect classification." },
  { week: "Week 10–11", milestone: "Milestone 8", title: "Quality, yield and manufacturing systems", summary: "Yield, traceability, documentation, nonconformance and shift handover." },
  { week: "Week 12", milestone: "Milestone 9", title: "Capstone and competency review", summary: "Analyze a simulated production lot and defend recommendations." }
]

export const SEMICONDUCTOR_FINAL_QUIZ_10 = [
  {
    id: "semi-q1",
    number: 1,
    question: "What is the primary purpose of a silicon wafer in integrated-circuit manufacturing?",
    options: [
      "A. To serve as a substrate on which device structures are fabricated",
      "B. To act only as a protective package",
      "C. To replace all metal interconnects",
      "D. To measure cleanroom pressure"
    ],
    correctIndex: 0,
    explanation: "A silicon wafer serves as the thin, crystalline substrate on which microscopic device layers and structures are fabricated."
  },
  {
    id: "semi-q2",
    number: 2,
    question: "Which process transfers a designed pattern into a photosensitive resist?",
    options: [
      "A. Dicing",
      "B. Photolithography",
      "C. Final electrical test",
      "D. Packaging"
    ],
    correctIndex: 1,
    explanation: "Photolithography coats the wafer with photoresist, aligns a mask/reticle, exposes the resist, and develops the transferred pattern."
  },
  {
    id: "semi-q3",
    number: 3,
    question: "A film target is 200 nm and the measured thickness is 206 nm. What is the percentage deviation from target?",
    options: ["A. 2%", "B. 3%", "C. 6%", "D. 12%"],
    correctIndex: 1,
    explanation: "Absolute error = 206 - 200 = 6 nm. Percentage deviation = (6 / 200) × 100% = 3%."
  },
  {
    id: "semi-q4",
    number: 4,
    question: "Which action is appropriate when a process alarm indicates a potentially unsafe equipment condition?",
    options: [
      "A. Bypass the alarm",
      "B. Restart the process immediately",
      "C. Follow the approved response procedure and escalate",
      "D. Delete the alarm record"
    ],
    correctIndex: 2,
    explanation: "Technicians must never bypass alarms or interlocks; follow the approved response procedure, preserve traceability, and escalate."
  },
  {
    id: "semi-q5",
    number: 5,
    question: "What does metrology mean?",
    options: [
      "A. The science of measurement",
      "B. A method of wafer packaging",
      "C. A type of photoresist",
      "D. A wafer transport mechanism"
    ],
    correctIndex: 0,
    explanation: "Metrology is the science of measurement, used in fabs to verify film thickness, critical dimensions, overlay, particles, and electrical parameters."
  },
  {
    id: "semi-q6",
    number: 6,
    question: "A lot has 920 accepted units out of 1,000 evaluated. What is the yield?",
    options: ["A. 8%", "B. 90%", "C. 92%", "D. 98%"],
    correctIndex: 2,
    explanation: "Yield = (920 / 1000) × 100% = 92%."
  },
  {
    id: "semi-q7",
    number: 7,
    question: "What is the main purpose of lot traceability?",
    options: [
      "A. To remove the need for inspections",
      "B. To connect a product with its processing and quality history",
      "C. To guarantee every wafer passes",
      "D. To shorten every process step"
    ],
    correctIndex: 1,
    explanation: "Lot traceability links every wafer and lot to the exact tools, recipes, operators, timestamps, and inspection records across its manufacturing history."
  },
  {
    id: "semi-q8",
    number: 8,
    question: "A measurement is above the specified upper limit. What should a trainee do?",
    options: [
      "A. Change the recipe independently",
      "B. Discard the record",
      "C. Follow the documented hold and escalation procedure",
      "D. Repeat measurements until one passes"
    ],
    correctIndex: 2,
    explanation: "Out-of-specification measurements require recording the true observation and following the documented hold and escalation procedure."
  },
  {
    id: "semi-q9",
    number: 9,
    question: "Which statement correctly distinguishes specification limits from control limits?",
    options: [
      "A. They always mean the same thing",
      "B. Specification limits define requirements; control limits are derived from process behavior",
      "C. Control limits are always set by the customer",
      "D. Specification limits are calculated from every new measurement"
    ],
    correctIndex: 1,
    explanation: "Specification limits define engineering/product requirements; control limits are statistically calculated from process data to detect abnormal variation."
  },
  {
    id: "semi-q10",
    number: 10,
    question: "A required equipment identifier is missing from a process record. What is the best response?",
    options: [
      "A. Invent a likely identifier",
      "B. Leave the record unchanged without reporting it",
      "C. Resolve the gap through the authorized traceability procedure",
      "D. Release the lot because measurements passed"
    ],
    correctIndex: 2,
    explanation: "Never guess or fabricate missing identifiers; flag the traceability deficiency and resolve it through the authorized quality/traceability procedure."
  }
]

export const SEMICONDUCTOR_QA_REVIEW_TABLE = [
  { area: "Semiconductor process accuracy", reviewer: "Semiconductor process engineer or qualified subject-matter expert" },
  { area: "Workplace safety", reviewer: "Qualified EHS professional; verify current applicable OSHA requirements" },
  { area: "Measurement and SPC", reviewer: "Metrology or quality engineer" },
  { area: "Production documentation", reviewer: "Manufacturing or quality systems professional" },
  { area: "Assessment answer keys", reviewer: "Independent technical review and test execution" },
  { area: "Career requirements", reviewer: "Employer or workforce-development partner" },
  { area: "References and permissions", reviewer: "Source verification, licensing review, and citation checks" }
]

export const SEMICONDUCTOR_SAFETY_LEVELS = [
  {
    level: "Level 1 — Online learning",
    description: "Use diagrams, videos, fictional datasets, virtual equipment, and simulated alarms. No hazardous materials or production tools are required."
  },
  {
    level: "Level 2 — Supervised training laboratory",
    description: "Use approved training equipment, suitable PPE, documented procedures, and instructor oversight. Restrict work to the tasks authorized by the training facility."
  },
  {
    level: "Level 3 — Employer-supervised production environment",
    description: "Require site orientation, equipment-specific qualification, authorization, and completion of the employer's safety and operational requirements before assigned work."
  }
]

export const SEMICONDUCTOR_CAREER_PROGRESSION = [
  { step: 1, role: "Entry-level manufacturing trainee", detail: "Learn cleanroom practices, process flow, documentation, and basic quality procedures." },
  { step: 2, role: "Semiconductor processing technician", detail: "Perform assigned production and inspection tasks after employer training and qualification." },
  { step: 3, role: "Senior technician or equipment specialist", detail: "Develop deeper tool knowledge, troubleshooting skills, and process expertise." },
  { step: 4, role: "Process, metrology or equipment engineering pathway", detail: "Pursue the additional technical education, experience, and qualifications required for specialized roles." },
  { step: 5, role: "Technical leadership or manufacturing engineering management", detail: "Progress toward advanced process ownership, team leadership, reliability, or production improvement." }
]

// ============================================================================
// 2. IMPLEMENTATION PLAN, PATHWAYS & WALKTHROUGHS ENGINE FOR EACH TRAINING
// ============================================================================

export interface TrainingImplementationPhase {
  phaseNumber: number
  weeks: string
  phaseTitle: string
  milestonesCovered: string
  keyActivities: string[]
  requiredToolsAndSetup: string[]
  gateDeliverable: string
}

export interface TrainingPathwayStage {
  stageNumber: number
  roleTitle: string
  levelBadge: string
  coreCompetenciesUnlocked: string[]
  evidenceArtifactRequired: string
  credentialsAndNextStep: string
}

export interface TrainingWalkthroughStep {
  stepNumber: number
  stepTitle: string
  objective: string
  inputsAndPreconditions: string
  technicalActionAndFormula: string
  verificationCheckpoint: string
  commonPitfallToAvoid: string
}

export interface CompleteTrainingPlanAndWalkthrough {
  trainingId: string
  trainingTitle: string
  domainTitle: string
  tangibleArtifact: string
  capstoneGoal: string
  safetyAndRegulatoryNotice: string
  implementationPhases: TrainingImplementationPhase[]
  careerPathwayStages: TrainingPathwayStage[]
  interactiveWalkthroughSteps: TrainingWalkthroughStep[]
  fullExportMarkdown: string
}

export function getTrainingImplementationPlanAndWalkthrough(
  pathway: PriorityCareerPathway,
  spec?: SpecializedTangibleCareerSpec
): CompleteTrainingPlanAndWalkthrough {
  const m1 = pathway.milestones[0]
  const m3 = pathway.milestones[2] || m1
  const m5 = pathway.milestones[4] || m1
  const m7 = pathway.milestones[6] || m1
  const m9 = pathway.milestones[8] || m1

  const formulaTitle =
    spec?.workedFormulaTitle ||
    m1.lessons[0]?.mathFormulaBox?.title ||
    m1.workedExample.title
  const formulaEqs =
    spec?.workedFormulaEquations ||
    m1.lessons[0]?.mathFormulaBox?.equations || [
      "Verify input units → Execute governed calculation → Compare against specification limits"
    ]
  const tangibleArtifact =
    spec?.tangibleEvidenceType || pathway.bestLearningFormat || m1.professionalDeliverable.title

  const implementationPhases: TrainingImplementationPhase[] = [
    {
      phaseNumber: 1,
      weeks: "Weeks 1–2 (Foundation & Safety Gate)",
      phaseTitle: `Phase 1: Environment Setup, Safety Controls & System Foundations`,
      milestonesCovered: "Milestones 1 & 2",
      keyActivities: [
        `Complete Level 1 online safety & regulatory boundary orientation for ${pathway.title}.`,
        `Master foundational system architecture: ${m1.title}.`,
        `Configure measurement units, calibration logs, and baseline data templates (Milestone 2).`
      ],
      requiredToolsAndSetup: [
        "Interactive ConnectLn Classroom & 10-Page Technical Handbook",
        "Standardized Unit Conversion & Calibration Worksheet",
        "Authoritative Reference Manuals (" +
          pathway.principalReferences.map((r) => r.organization).join(", ") +
          ")"
      ],
      gateDeliverable: `Milestone 1–2 Safety Qualification & Baseline Inspection Record`
    },
    {
      phaseNumber: 2,
      weeks: "Weeks 3–6 (Core Execution & Quantitative Modeling)",
      phaseTitle: `Phase 2: Core Technical Workflows, Calculations & Practical Labs`,
      milestonesCovered: "Milestones 3, 4 & 5",
      keyActivities: [
        `Execute quantitative modeling and governing calculations: ${formulaTitle}.`,
        `Complete hands-on workflow execution across ${m3.title} and ${m5.title}.`,
        `Validate step-by-step worked examples and record reproducible lab measurements.`
      ],
      requiredToolsAndSetup: [
        `Calculation Engine & Formula Sheet (${formulaEqs[0]})`,
        "Sandbox Simulation Dataset & Practical Lab Workbench",
        "Versioned Technical Deliverable Templates"
      ],
      gateDeliverable: `Verified Quantitative Calculation Sheet & Milestones 3–5 Lab Logs`
    },
    {
      phaseNumber: 3,
      weeks: "Weeks 7–10 (Diagnostics, Quality Control & Escalation)",
      phaseTitle: `Phase 3: Troubleshooting, SPC/Quality Verification & Risk Controls`,
      milestonesCovered: "Milestones 6, 7 & 8",
      keyActivities: [
        `Isolate faults, out-of-tolerance readings, and process anomalies without bypassing safety interlocks.`,
        `Distinguish specification limits from statistical control trends (${m7.title}).`,
        `Audit traceability records, document nonconformances, and author shift/project handovers.`
      ],
      requiredToolsAndSetup: [
        "Fault-Isolation & Root-Cause Diagnostic Matrix",
        "Statistical Process Control (SPC) / Quality Audit Log",
        "Traceability & Escalation Protocol Checklist"
      ],
      gateDeliverable: `Diagnostic Root-Cause Investigation & Quality Traceability Audit`
    },
    {
      phaseNumber: 4,
      weeks: "Weeks 11–12+ (Capstone Defense & Mentor Sign-Off)",
      phaseTitle: `Phase 4: End-to-End Capstone Execution, Rubric Scoring & Portfolio Publication`,
      milestonesCovered: "Milestone 9 (Capstone)",
      keyActivities: [
        `Execute the full Capstone Project: ${pathway.capstoneSummary}`,
        `Compile the final ${tangibleArtifact} separating confirmed evidence from assumptions.`,
        `Pass the comprehensive knowledge check (>= 80%) and complete the Mentor Review sign-off.`
      ],
      requiredToolsAndSetup: [
        "Capstone Multi-Scenario Dataset & Evidence Bundle",
        "3-Tier Instructor Competency Rubric (Developing / Competent / Advanced)",
        "Human SME / Mentor Review Sign-Off Checklist"
      ],
      gateDeliverable: `Complete Capstone Portfolio Package: ${tangibleArtifact}`
    }
  ]

  const careerPathwayStages: TrainingPathwayStage[] = [
    {
      stageNumber: 1,
      roleTitle: `Stage 1: Trainee / Foundation Candidate (${pathway.title})`,
      levelBadge: "Level 1 — Online & Simulation Ready",
      coreCompetenciesUnlocked: [
        "Terminology, system architecture, and unit conversions",
        "Hazard recognition, contamination/safety rules, and stop-work triggers",
        "Reading SOPs, drawings, travelers, and schematics accurately"
      ],
      evidenceArtifactRequired: "Completed Milestones 1–2 Worksheets & 100% Safety Check",
      credentialsAndNextStep: spec?.careerGuidance.prerequisites || "High school / technical foundation; ready for supervised lab exercises."
    },
    {
      stageNumber: 2,
      roleTitle: `Stage 2: Applied Laboratory & Junior Practitioner`,
      levelBadge: "Level 2 — Supervised Lab & Project Ready",
      coreCompetenciesUnlocked: [
        `Executing ${formulaTitle} without unit or order-of-magnitude errors`,
        "Completing structured practical labs and recording As-Found / As-Left data",
        "Identifying missing traceability fields and escalating out-of-spec findings"
      ],
      evidenceArtifactRequired: `Verified Lab Logs & Calculation Sheets (Milestones 3–6)`,
      credentialsAndNextStep: "Eligible for employer internship, Registered Apprenticeship, or supervised field placement."
    },
    {
      stageNumber: 3,
      roleTitle: `Stage 3: Job-Ready Technician / Associate Specialist`,
      levelBadge: "Level 3 — Employer Qualification Track",
      coreCompetenciesUnlocked: [
        spec?.careerGuidance.targetRoles || `Entry-to-Mid roles in ${pathway.title}`,
        "Troubleshooting complex multi-variable faults and writing technical handover reports",
        "Defending technical decisions and limitations using empirical data"
      ],
      evidenceArtifactRequired: `Capstone Portfolio Artifact: ${tangibleArtifact}`,
      credentialsAndNextStep: spec?.careerGuidance.qualificationsAndNextSteps || "Employer site qualification + industry associate certification."
    },
    {
      stageNumber: 4,
      roleTitle: `Stage 4: Senior Specialist / Lead Systems Practitioner`,
      levelBadge: "Advanced Specialization",
      coreCompetenciesUnlocked: [
        "Designing preventive controls, reliability programs, and cross-system optimizations",
        "Leading root-cause investigations (CAPA / DFIR / FMEA / HAZOP) and mentoring trainees",
        "Reviewing peer deliverables against regulatory and engineering standards"
      ],
      evidenceArtifactRequired: "Multi-System Optimization & Preventive Control Architecture",
      credentialsAndNextStep: "Professional certification / statutory licensure (where applicable) and senior technical ownership."
    },
    {
      stageNumber: 5,
      roleTitle: `Stage 5: Technical Authority, Operations Lead or Independent Practice`,
      levelBadge: "Leadership & Business Ownership",
      coreCompetenciesUnlocked: [
        "Scoping projects, estimating TCO/budgets, managing quality systems, and regulatory audits",
        "Signing off on competency rubrics as a Subject-Matter Expert (SME) mentor",
        "Operating an independent consulting/contracting practice or leading an enterprise department"
      ],
      evidenceArtifactRequired: "Full Commercial/Enterprise Governance & Audit Defense Binder",
      credentialsAndNextStep: "Continuous professional development and industry standards leadership."
    }
  ]

  const interactiveWalkthroughSteps: TrainingWalkthroughStep[] = [
    {
      stepNumber: 1,
      stepTitle: "Step 1 — Scope, Safety & Precondition Verification",
      objective: `Establish safe operating boundaries, verify authorization/SOP revision, and inventory all input data for ${pathway.title}.`,
      inputsAndPreconditions: `Approved SOP / drawing / dataset, calibrated measurement reference, and safety/regulatory checklist (${pathway.principalReferences[0]?.organization || "Standard"}).`,
      technicalActionAndFormula: `Inspect input records for completeness (Lot/Asset ID, Tool ID, Timestamps, Calibration status). Verify zero safety interlock bypasses.`,
      verificationCheckpoint: "100% of required identifiers and safety prerequisites are verified; any missing critical spec is flagged for formal escalation.",
      commonPitfallToAvoid: "Never guess a missing equipment ID, dimension, or permission, and never start physical/live work without verifying energy isolation or authorization."
    },
    {
      stepNumber: 2,
      stepTitle: "Step 2 — Unit Normalization & Baseline Data Preparation",
      objective: "Convert all raw measurements, logs, or coordinates into consistent engineering units before calculation.",
      inputsAndPreconditions: "Raw sensor logs, inspection sheets, financial/epidemiological tables, or CAD/network parameters.",
      technicalActionAndFormula: `Apply dimensional analysis and baseline normalization (e.g., SI/metric conversions, UTC timestamp alignment, or per-unit base scaling).`,
      verificationCheckpoint: "All inputs share consistent units and precision; raw original records remain preserved in read-only form.",
      commonPitfallToAvoid: "Mixing incompatible units (e.g., µm vs. mm, dB vs. dBm, local time vs. UTC, or unprojected degrees vs. meters) causes severe calculation errors."
    },
    {
      stepNumber: 3,
      stepTitle: `Step 3 — Execute Governing Quantitative Calculation (${formulaTitle})`,
      objective: `Solve the core technical problem step-by-step using the pathway's governing mathematical relations.`,
      inputsAndPreconditions: `Normalized parameters from Step 2 and governing equations: ${formulaEqs.join("  |  ")}`,
      technicalActionAndFormula: `${m1.workedExample.problemStatement}\n${m1.workedExample.stepByStepSolution.join("\n")}`,
      verificationCheckpoint: `Calculation result matches verified conclusion: ${m1.workedExample.engineeringConclusion}`,
      commonPitfallToAvoid: "Reporting a raw number without stating the engineering tolerance, confidence interval, or physical meaning."
    },
    {
      stepNumber: 4,
      stepTitle: "Step 4 — Compare Against Specification & Control Limits",
      objective: "Evaluate every individual measurement and calculated metric against approved acceptance criteria.",
      inputsAndPreconditions: "Calculated outputs from Step 3, Engineering Specification Limits (LSL/USL), and Statistical Control Limits (LCL/UCL).",
      technicalActionAndFormula: `Check both mean performance AND individual point excursions/ranges. Flag any reading exceeding specification or control thresholds.`,
      verificationCheckpoint: "All out-of-specification or out-of-control observations are explicitly isolated by asset/lot/wafer/node ID.",
      commonPitfallToAvoid: "Assuming a lot or system passes solely because the 'average' looks normal while an individual reading exceeds the upper specification limit."
    },
    {
      stepNumber: 5,
      stepTitle: "Step 5 — Diagnostic Root-Cause Analysis, Hold & Escalation",
      objective: "Separate observable physical/log evidence from hypotheses and execute the documented hold/escalation workflow.",
      inputsAndPreconditions: `Practical Lab Scenario: ${m1.practicalLab.scenario}`,
      technicalActionAndFormula: `Execute required lab tasks:\n${m1.practicalLab.requiredTasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
      verificationCheckpoint: "Affected lots/systems are placed on formal Hold where required, and root-cause hypotheses are backed by empirical evidence.",
      commonPitfallToAvoid: "Making unauthorized production recipe/configuration changes or stating an unverified hypothesis as a proven fact."
    },
    {
      stepNumber: 6,
      stepTitle: `Step 6 — Assemble Portfolio Deliverable & Mentor Rubric Defense`,
      objective: `Produce the final ${tangibleArtifact}, document shift/project handover, and verify against the 3-tier competency rubric.`,
      inputsAndPreconditions: `All verified calculations, defect/nonconformance logs, traceability gap reports, and reference citations.`,
      technicalActionAndFormula: `Compile the ${tangibleArtifact} and verify each Mentor Review criterion:\n${(spec?.mentorReviewCriteria || ["Accurate calculations", "Complete traceability", "Safe escalation"]).map((c) => `• ${c}`).join("\n")}`,
      verificationCheckpoint: `Achieves >= 80% on knowledge check and 'Competent' or 'Advanced' rating across all rubric rows.`,
      commonPitfallToAvoid: "Omitting the 'Limitations & Uncertainty' section or releasing a deliverable with unresolved traceability gaps."
    }
  ]

  const fullExportMarkdown = `# ${pathway.title} — Implementation Plan, Career Pathway & Operational Walkthrough
- **Category / Domain**: ${pathway.categoryTitle}
- **Suggested Duration**: ${pathway.suggestedDuration}
- **Tangible Portfolio Artifact**: ${tangibleArtifact}
- **Capstone Objective**: ${pathway.capstoneSummary}

> [!IMPORTANT]
> **Safety & Regulatory Boundary Notice**: ${pathway.safetyOrRegulatoryNotice}

---

## 1. Phased Implementation Plan
${implementationPhases
  .map(
    (p) => `### ${p.phaseTitle} (${p.weeks} · ${p.milestonesCovered})
- **Gate Deliverable**: ${p.gateDeliverable}
- **Key Implementation Activities**:
${p.keyActivities.map((a) => `  - ${a}`).join("\n")}
- **Required Tools & Setup**:
${p.requiredToolsAndSetup.map((t) => `  - ${t}`).join("\n")}`
  )
  .join("\n\n")}

---

## 2. 5-Stage Career & Learning Pathway Progression
${careerPathwayStages
  .map(
    (s) => `### ${s.roleTitle} [${s.levelBadge}]
- **Required Evidence Artifact**: ${s.evidenceArtifactRequired}
- **Competencies Unlocked**: ${s.coreCompetenciesUnlocked.join("; ")}
- **Credentials & Next Step**: ${s.credentialsAndNextStep}`
  )
  .join("\n\n")}

---

## 3. Step-by-Step Operational Walkthrough
${interactiveWalkthroughSteps
  .map(
    (w) => `### ${w.stepTitle}
- **Objective**: ${w.objective}
- **Inputs & Preconditions**: ${w.inputsAndPreconditions}
- **Technical Action & Worked Method**:
\`\`\`text
${w.technicalActionAndFormula}
\`\`\`
- **Verification Checkpoint**: ${w.verificationCheckpoint}
- **Common Pitfall to Avoid**: ${w.commonPitfallToAvoid}`
  )
  .join("\n\n")}
`

  return {
    trainingId: pathway.id,
    trainingTitle: pathway.title,
    domainTitle: pathway.categoryTitle,
    tangibleArtifact,
    capstoneGoal: pathway.capstoneSummary,
    safetyAndRegulatoryNotice: pathway.safetyOrRegulatoryNotice,
    implementationPhases,
    careerPathwayStages,
    interactiveWalkthroughSteps,
    fullExportMarkdown
  }
}

// ============================================================================
// 3. VERBATIM 9-MILESTONE FLAGSHIP PATHWAY FOR SEMICONDUCTOR MANUFACTURING (#42)
// ============================================================================

export const SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY: PriorityCareerPathway = {
  id: "pathway-7-semiconductor-manufacturing-technology",
  priorityRank: 7,
  title: "Semiconductor Manufacturing Technology (12-Week Verbatim Flagship)",
  categoryTitle: "10. Semiconductor manufacturing and advanced materials",
  level: "Beginner pathway",
  suggestedDuration: "12 weeks (9 milestones · Hybrid preferred)",
  deliveryFormat: "Full lessons, worked examples, practical assignments, 10-question exam & Lot A/B/C capstone",
  bestLearningFormat: "Cleanroom simulation, wafer inspection records, process travelers, SPC charts & capstone case study",
  coverImage: "/images/connectln-studies/semiconductor-cleanroom-bento.png",
  capstoneSummary:
    "Analyze a simulated semiconductor production dataset across Lots A, B, and C (DEP-01 & DEP-02 film thickness, particle defect, and missing equipment ID traceability gap) and defend hold/escalation recommendations.",
  safetyOrRegulatoryNotice:
    "Important distinction: Twelve weeks can provide a foundation for entry-level technician roles, but it does not guarantee employment or independently qualify a learner to operate production equipment. Successful completion means the learner has completed the educational curriculum and its specified assessments; it is not an accredited qualification, an employer-issued equipment authorization, an OSHA certification, or a license to operate semiconductor manufacturing equipment.",
  principalReferences: [
    {
      title: "OSHA — Semiconductor Manufacturing Safety (Silicon Device Manufacturing & Device Fabrication)",
      organization: "Occupational Safety and Health Administration (OSHA)",
      url: "https://www.osha.gov/semiconductors/silicon",
      summary: "Hazards, process descriptions, chemical safety, equipment and workplace controls."
    },
    {
      title: "NIST — CHIPS R&D Metrology Program & 2024 International Roadmap for Devices and Systems: Metrology",
      organization: "National Institute of Standards and Technology (NIST)",
      url: "https://www.nist.gov/chips/research-development-programs/metrology-program",
      summary: "Measurement science, process characterization, and semiconductor manufacturing metrology challenges."
    },
    {
      title: "SEMI Standards & SEMI S19 Equipment-Support Safety Training Guideline",
      organization: "SEMI",
      url: "https://www.semi.org/en/products-services/standards",
      summary: "Industry standards covering equipment safety, materials, manufacturing automation, and equipment support training."
    },
    {
      title: "ECE 444 — Microelectronics Fabrication",
      organization: "University of Illinois Urbana-Champaign",
      url: "https://courses.grainger.illinois.edu/ECE444/sp2026/",
      summary: "Academic curriculum covering wafer processing, lithography, etching, deposition, implantation, and process integration."
    },
    {
      title: "Semiconductor Processing Technicians — Occupational Outlook Handbook",
      organization: "U.S. Bureau of Labor Statistics (BLS)",
      url: "https://www.bls.gov/ooh/production/semiconductor-processing-technicians.htm",
      summary: "Occupational duties, work environments, training, and education for semiconductor processing technicians."
    }
  ],
  milestones: [
    {
      milestoneNumber: 1,
      title: "Semiconductor foundations and cleanroom awareness (Week 1)",
      summary: "What a semiconductor is, from raw silicon to finished chip, contamination control, Poisson particle defect model, and cleanroom safety.",
      learningObjectives: [
        "Explain what a semiconductor is.",
        "Describe how integrated circuits are manufactured.",
        "Identify basic cleanroom hazards and contamination risks.",
        "Explain why standard operating procedures and traceability matter."
      ],
      lessons: [
        {
          lessonNumber: "Lesson 1.1",
          title: "What is a semiconductor?",
          paragraphs: [
            "A semiconductor is a material whose electrical conductivity can be controlled through its composition, structure, temperature, electric fields, and other conditions.",
            "Silicon is widely used in integrated-circuit manufacturing because its electrical properties can be engineered and because it supports the formation of useful insulating and conducting structures.",
            "A modern chip may contain billions of microscopic components. Manufacturing requires the repeated formation, modification, measurement, and patterning of thin layers on a silicon wafer.",
            "Silicon is not the only semiconductor material. Gallium arsenide, silicon carbide, gallium nitride, and other materials are used for different applications."
          ],
          bulletPoints: [
            "Conductors: materials that allow electric charge to move relatively easily.",
            "Insulators: materials that strongly restrict charge flow under normal operating conditions.",
            "Semiconductors: materials whose electrical behavior can be deliberately modified for electronic functions."
          ]
        },
        {
          lessonNumber: "Lesson 1.2",
          title: "From raw silicon to a finished chip",
          paragraphs: [
            "Actual production flows vary by device type, process technology, and manufacturer. Many fabrication steps are repeated dozens or hundreds of times, and some operations are reordered or omitted depending on the design."
          ],
          orderedSteps: [
            "Silicon and wafer preparation: Produce and inspect the substrate.",
            "Wafer fabrication: Build device structures through repeated processing steps.",
            "Wafer inspection and electrical testing: Identify defects and assess device performance.",
            "Dicing and packaging: Separate individual dies and package selected devices.",
            "Final testing: Verify required electrical and functional performance."
          ]
        },
        {
          lessonNumber: "Lesson 1.3 & 1.4",
          title: "Contamination control & Safety as a production requirement",
          paragraphs: [
            "A particle that is invisible to the naked eye can damage a microscopic device structure. Contamination may come from people, clothing fibers, tools, surfaces, chemicals, or other process materials.",
            "A cleanroom is not simply a room that looks clean. It is a controlled environment with specified limits and monitoring for particles and other contaminants.",
            "Semiconductor manufacturing can involve corrosive chemicals, toxic gases, high voltage, vacuum systems, high temperatures, moving equipment, radiation sources, and specialized exhaust systems. Learners must recognize warning labels, follow approved procedures, and know when to stop work and escalate."
          ],
          bulletPoints: [
            "Wear only the facility-approved cleanroom garments and protective equipment.",
            "Follow the site's gowning sequence and entry procedure.",
            "Handle wafers only with approved tools and techniques.",
            "Keep clean and non-clean materials separated.",
            "Follow material-transfer and labeling procedures.",
            "Never bypass an equipment interlock or improvise a cleaning procedure.",
            "Report damaged wafers, spills, abnormal tool conditions, and suspected contamination immediately."
          ],
          mathFormulaBox: {
            title: "Worked example — Why particles matter (Poisson Model)",
            equations: [
              "Expected Particle Count:  μ = λ × A = 0.02 /cm² × 100 cm² = 2",
              "Zero-Particle Probability: P(0) = e^(-2) ≈ 0.1353 (13.5%)"
            ],
            explanation:
              "Educational statistical model: actual contamination is not necessarily uniform, independent, or equally harmful, and not every particle causes a device failure."
          }
        }
      ],
      workedExample: {
        title: "Why particles matter — Poisson Contamination Model",
        problemStatement: "If the modeled defect-causing particle density is λ = 0.02 per cm² and the inspected area is A = 100 cm², find the expected particle count μ and the Poisson probability P(0) of observing zero particles.",
        stepByStepSolution: [
          "1. Compute expected particle count: μ = λ × A = 0.02 × 100 = 2 particles.",
          "2. Apply the Poisson zero-count formula: P(0) = e^(-μ) = e^(-2) ≈ 0.1353 (13.5%).",
          "3. Note model limitations: Real wafer contamination is not necessarily uniform or independent."
        ],
        engineeringConclusion: "Even at 0.02 particles/cm², there is only a 13.5% chance of zero particles across 100 cm², illustrating why strict cleanroom discipline is mandatory."
      },
      practicalLab: {
        title: "Practical assignment — Cleanroom entry simulation",
        scenario: "Learners receive a set of illustrated entry steps, a simulated gowning checklist, and a scenario containing five mistakes.",
        requiredTasks: [
          "Identify each procedural mistake.",
          "Explain its contamination or safety consequence.",
          "Put the approved steps in the correct order.",
          "Complete a sample incident report for a damaged wafer carrier.",
          "Identify when the correct action is to stop and notify a supervisor."
        ],
        submissionDeliverables: ["Ordered Gowning Sequence", "5-Mistake Consequence Analysis", "Damaged Wafer Carrier Incident Report"],
        interactiveSimulatorHint: "Assessment: at least 80% on the knowledge check, with all critical safety violations correctly identified."
      },
      assessmentQuestions: [
        {
          id: "semi-m1-q1",
          prompt: SEMICONDUCTOR_FINAL_QUIZ_10[0].question,
          options: SEMICONDUCTOR_FINAL_QUIZ_10[0].options,
          correctIndex: SEMICONDUCTOR_FINAL_QUIZ_10[0].correctIndex,
          modelAnswerExplanation: SEMICONDUCTOR_FINAL_QUIZ_10[0].explanation
        }
      ],
      passingCriterionNote: "At least 80% on the knowledge check, with all critical safety violations correctly identified.",
      professionalDeliverable: {
        title: "Cleanroom Entry Verification & Damaged Wafer Carrier Incident Report",
        format: "Structured Cleanroom SOP Log",
        templateMarkdown: `# Milestone 1 Deliverable — Cleanroom Entry & Incident Report\n## 1. 5 Procedural Mistakes Identified\n1.\n2.\n3.\n4.\n5.\n\n## 2. Damaged Wafer Carrier Incident Report & Supervisor Escalation\n- Carrier/Lot ID:\n- Observed Damage:\n- Immediate Hold & Notification Action:\n`
      },
      competencyRubric: [
        {
          criterion: "Cleanroom Contamination & Safety Escalation",
          developing: "Misses critical safety or gowning sequence violation.",
          competent: "Identifies all 5 mistakes, orders steps correctly, and escalates damaged carrier.",
          advanced: "Connects contamination sources to yield impact and OSHA safety controls."
        }
      ],
      careerApplication: {
        workplaceUsage: "Used daily by Cleanroom Production Technicians and Wafer Fab Technicians upon entering ISO-classified cleanrooms.",
        supervisionAndLicensingNote: "Technicians must never handle hazardous chemicals or service energized equipment without site authorization."
      },
      whitePaperPages: [],
      whitePaperFullMarkdown: "# Milestone 1: Semiconductor Foundations and Cleanroom Awareness"
    },
    {
      milestoneNumber: 2,
      title: "Materials, wafers and measurement (Week 2)",
      summary: "Wafer structure and identification (diameter, thickness, orientation, resistivity, doping, ID) and calibrated metrology unit conversions.",
      learningObjectives: [
        "Identify the principal features of a silicon wafer.",
        "Distinguish wafer diameter, thickness, orientation, and surface condition.",
        "Use metric units and simple conversions.",
        "Explain the importance of calibrated measurement instruments."
      ],
      lessons: [
        {
          lessonNumber: "Lesson 2.1",
          title: "Wafer structure and identification",
          paragraphs: [
            "A wafer is a thin, usually circular substrate on which semiconductor devices are fabricated.",
            "Wafer diameter and thickness are specified by the applicable product and process requirements. Learners should never assume that all production wafers have the same dimensions."
          ],
          bulletPoints: [
            "Diameter: the width of the circular wafer.",
            "Thickness: the distance between the wafer's two main surfaces.",
            "Crystal orientation: the crystallographic plane presented by the surface.",
            "Resistivity: a measure of how strongly the material resists electric current.",
            "Doping type: whether the semiconductor is primarily n-type or p-type.",
            "Surface quality: roughness, particles, scratches, chips, and other defects.",
            "Identification: a unique identifier used to connect the wafer to its lot and processing history."
          ]
        },
        {
          lessonNumber: "Lesson 2.2",
          title: "Measurement and calibration",
          paragraphs: [
            "A measurement is useful only when the instrument, method, conditions, and required accuracy are appropriate for the task.",
            "A digital display with many decimal places does not automatically mean the instrument is accurate."
          ],
          bulletPoints: [
            "Accuracy: closeness to the accepted reference value.",
            "Precision: closeness among repeated measurements.",
            "Resolution: the smallest displayed or distinguishable increment.",
            "Calibration: establishing the relationship between an instrument's indications and reference values.",
            "Measurement uncertainty: the quantified doubt associated with a measurement result."
          ],
          mathFormulaBox: {
            title: "Worked example — Unit conversion (Micrometres to Millimetres)",
            equations: [
              "1 mm = 1,000 µm  ⇒  775 µm = 775 / 1000 = 0.775 mm",
              "Deviation from Target:  778 µm - 775 µm = +3 µm"
            ],
            explanation: "Whether a +3 µm deviation is acceptable depends on the actual specification limits, measurement uncertainty, and approved decision rule."
          }
        }
      ],
      workedExample: {
        title: "Wafer Thickness Unit Conversion & Deviation",
        problemStatement: "A hypothetical wafer thickness specification is 775 µm and the measured thickness is 778 µm. Convert 775 µm to mm and calculate the deviation.",
        stepByStepSolution: [
          "1. Convert micrometres to millimetres: 775 / 1,000 = 0.775 mm.",
          "2. Compute deviation from target: 778 µm - 775 µm = 3 µm above target.",
          "3. Compare against approved specification limits and measurement uncertainty."
        ],
        engineeringConclusion: "The wafer is 0.778 mm (+3 µm from target); disposition requires checking the specification tolerance and instrument calibration."
      },
      practicalLab: {
        title: "Practical assignment — Wafer inspection record",
        scenario: "Learners receive a fictional wafer inspection sheet containing diameter, thickness, identification, and surface-defect observations.",
        requiredTasks: [
          "Convert all dimensions to the required units.",
          "Identify missing or inconsistent identifiers.",
          "Determine whether measurements fall within provided limits.",
          "Record observations without guessing missing values.",
          "Explain why a scratched wafer may require a hold and engineering review."
        ],
        submissionDeliverables: ["Completed Wafer Inspection Sheet", "Traceability & Scratch Hold Justification"],
        interactiveSimulatorHint: "Never guess missing values; flag missing identifiers for traceability resolution."
      },
      assessmentQuestions: [
        {
          id: "semi-m2-q1",
          prompt: "Why does a digital measuring instrument displaying four decimal places NOT automatically guarantee an accurate measurement?",
          options: [
            "Number of displayed decimal places reflects resolution, whereas accuracy requires valid calibration against a reference standard and controlled measurement uncertainty.",
            "Digital displays never need calibration.",
            "Precision and accuracy are identical to battery voltage.",
            "All silicon wafers have the exact same thickness."
          ],
          correctIndex: 0,
          modelAnswerExplanation: "Display digits show resolution, not calibrated accuracy."
        }
      ],
      passingCriterionNote: "Correct unit conversions, correct comparison against specifications, and complete traceability documentation.",
      professionalDeliverable: {
        title: "Wafer Incoming Inspection & Metrology Verification Record",
        format: "Metrology Worksheet",
        templateMarkdown: `# Milestone 2 — Wafer Inspection Record\n- Wafer ID & Lot ID:\n- Converted Thickness (mm & µm):\n- Surface Defect / Scratch Hold Recommendation:\n`
      },
      competencyRubric: [
        {
          criterion: "Unit Conversions & Traceability Integrity",
          developing: "Conversion errors or guesses missing wafer IDs.",
          competent: "100% accurate µm/mm conversions and flags missing IDs/scratches for hold.",
          advanced: "Accounts for calibration status and measurement uncertainty."
        }
      ],
      careerApplication: {
        workplaceUsage: "Incoming wafer quality inspection and substrate verification.",
        supervisionAndLicensingNote: "Scratched or out-of-spec wafers require engineering hold rather than operator release."
      },
      whitePaperPages: [],
      whitePaperFullMarkdown: "# Milestone 2: Materials, Wafers and Measurement"
    },
    {
      milestoneNumber: 3,
      title: "Semiconductor fabrication process flow (Weeks 3–4)",
      summary: "The 9-step repeated fabrication cycle, major processes (Oxidation, Photolithography, Etching, Deposition, Doping/Implantation, CMP), and process traveler control.",
      learningObjectives: [
        "Explain the purpose of the main wafer fabrication processes.",
        "Recognize how individual steps affect later manufacturing operations.",
        "Read a simplified process flow.",
        "Identify why process order and recipe control matter."
      ],
      lessons: [
        {
          lessonNumber: "Lesson 3.1 & 3.2",
          title: "The repeated process cycle & Major fabrication processes",
          paragraphs: [
            "Semiconductor fabrication is a sequence of controlled transformations: Oxidation, Photolithography, Etching (wet/dry), Deposition (CVD, PVD, ALD), Doping and ion implantation (followed by annealing), and Chemical mechanical planarization (CMP)."
          ],
          orderedSteps: [
            "Prepare and clean the wafer surface.",
            "Form a film or modify the material.",
            "Apply a photosensitive material when patterning is needed.",
            "Expose the material through a patterning system.",
            "Develop the resist to reveal the pattern.",
            "Etch selected material or use the pattern to define another operation.",
            "Remove remaining resist when required.",
            "Measure and inspect the resulting structure.",
            "Repeat the appropriate steps to build additional structures."
          ],
          mathFormulaBox: {
            title: "Worked example — Film thickness and uniformity (Mean & Range)",
            equations: [
              "5-Site Measurements:  98, 100, 101, 99, 102 nm",
              "Mean Thickness (x̄):   (98 + 100 + 101 + 99 + 102) / 5 = 100 nm",
              "Range (R):            102 - 98 = 4 nm"
            ],
            explanation: "Mean and range must be evaluated together with the approved specification, measurement method, sampling plan, and uniformity formula."
          }
        },
        {
          lessonNumber: "Lesson 3.3",
          title: "Why process order matters (The Process Traveler)",
          paragraphs: [
            "If a film must be deposited before a patterned opening can be etched and the wafer is sent to the wrong step, the required material may be absent or the wrong layer exposed. A technician must follow the released process traveler rather than inventing a sequence based on memory."
          ],
          bulletPoints: [
            "Approved process sequence & Wafer/lot identification",
            "Recipe version and authorized tool",
            "Required pre-process and post-process checks",
            "Hold points, engineering approvals, and disposition decisions"
          ]
        }
      ],
      workedExample: {
        title: "5-Site Wafer Film Thickness Mean & Range",
        problemStatement: "Five measurement sites on a fictional wafer report film thicknesses of 98, 100, 101, 99, and 102 nm. Calculate the mean thickness and range.",
        stepByStepSolution: [
          "1. Sum the 5 site measurements: 98 + 100 + 101 + 99 + 102 = 500 nm.",
          "2. Divide by 5 sites: Mean x̄ = 500 / 5 = 100 nm.",
          "3. Subtract minimum from maximum: Range R = 102 - 98 = 4 nm."
        ],
        engineeringConclusion: "Mean thickness is 100 nm and range is 4 nm; compare both against the released process traveler acceptance criteria."
      },
      practicalLab: {
        title: "Practical assignment — Build a process traveler",
        scenario: "Build a simplified fictional process traveler requiring a film, a patterned opening, material removal, and final inspection.",
        requiredTasks: [
          "Specify step number, operation, required input condition, and equipment category.",
          "Define verification steps, acceptance criteria, and traceability fields.",
          "Specify hold and escalation conditions without introducing unauthorized recipes."
        ],
        submissionDeliverables: ["Controlled Wafer Process Traveler Document"],
        interactiveSimulatorHint: "Verify logical process order: Clean → Deposit Film → Coat/Expose/Develop Resist → Etch Opening → Strip Resist → Inspect."
      },
      assessmentQuestions: [
        {
          id: "semi-m3-q1",
          prompt: "Why must a wafer fabrication technician strictly follow the released Process Traveler rather than reordering steps from memory?",
          options: [
            "Each fabrication layer depends physically on prior films and patterns; executing steps out of order or on an unauthorized recipe damages the device structure and breaks traceability.",
            "Because process steps can be performed in any random order.",
            "Because etching always occurs before a wafer is created.",
            "Process travelers are only used in shipping."
          ],
          correctIndex: 0,
          modelAnswerExplanation: "Device integration depends on exact sequence, authorized tool qualification, and recipe version control."
        }
      ],
      passingCriterionNote: "Logical process order, complete traceability fields, and zero unauthorized recipes.",
      professionalDeliverable: {
        title: "Wafer Fabrication Process Traveler",
        format: "Controlled Traveler Table",
        templateMarkdown: `# Milestone 3 — Wafer Process Traveler\n| Step | Operation | Input Condition | Tool Category | Verification & Acceptance | Hold/Escalation Trigger |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n`
      },
      competencyRubric: [
        {
          criterion: "Process Sequence & Traveler Traceability",
          developing: "Out-of-order steps or missing verification gates.",
          competent: "Logically ordered traveler with complete traceability and hold triggers.",
          advanced: "Includes pre/post-metrology gates and recipe revision locks."
        }
      ],
      careerApplication: {
        workplaceUsage: "Used across all cleanroom bays to track wafer lots through hundreds of sequential steps.",
        supervisionAndLicensingNote: "Recipe changes require authorized process engineering approval."
      },
      whitePaperPages: [],
      whitePaperFullMarkdown: "# Milestone 3: Semiconductor Fabrication Process Flow"
    },
    {
      milestoneNumber: 4,
      title: "Photolithography and pattern transfer (Week 5)",
      summary: "Lithography sequence (prep, coat, soft bake, align/expose, develop, inspect), positive vs. negative resist, defect recognition, and CD error calculation.",
      learningObjectives: [
        "Explain the function of photoresist.",
        "Describe coating, exposure, development, and inspection.",
        "Recognize common pattern defects.",
        "Understand why alignment and focus affect results."
      ],
      lessons: [
        {
          lessonNumber: "Lesson 4.1, 4.2 & 4.3",
          title: "The lithography sequence, Positive/Negative resist & Pattern defects",
          paragraphs: [
            "In a positive-tone resist, exposed regions typically become more soluble in the developer. In a negative-tone resist, exposure typically makes exposed regions less soluble.",
            "A technician's role is to recognize, document, and escalate defects using the site's procedures—not to alter a production recipe without authorization."
          ],
          orderedSteps: [
            "Surface preparation: achieve required surface condition and resist adhesion.",
            "Photoresist coating: apply light-sensitive polymer via spin coating.",
            "Soft bake: controlled heating removes solvent.",
            "Alignment and exposure: align wafer to reference and expose pattern.",
            "Development: remove selected portions of resist.",
            "Post-development inspection (ADI): examine pattern for defects and conformance."
          ],
          bulletPoints: [
            "Misalignment, Incomplete development, Pattern collapse, Particles, Resist nonuniformity, and Critical-dimension (CD) variation."
          ],
          mathFormulaBox: {
            title: "Worked example — Pattern dimensional error",
            equations: [
              "Target Line Width: 200 nm  ;  Measured: 206 nm",
              "Absolute Error:    206 - 200 = 6 nm",
              "Percentage Error:  (6 / 200) × 100 = 3%"
            ],
            explanation: "Compare the 3% error against the actual acceptance limits rather than assuming 3% is automatically acceptable or unacceptable."
          }
        }
      ],
      workedExample: {
        title: "Photolithography Critical Dimension (CD) Percentage Error",
        problemStatement: "A fictional pattern has a target line width of 200 nm and inspection measures 206 nm. Calculate the absolute error and percentage error relative to target.",
        stepByStepSolution: [
          "1. Subtract target from measured value: 206 nm - 200 nm = 6 nm absolute error.",
          "2. Divide by target (200 nm) and multiply by 100%: (6 / 200) × 100 = 3%.",
          "3. Check against the product's CD specification limits before disposition."
        ],
        engineeringConclusion: "The line is 6 nm (3%) wider than target and must be evaluated against the specification limits."
      },
      practicalLab: {
        title: "Practical assignment — Defect classification (12 Simulated Images)",
        scenario: "Classify 12 simulated microscope images showing pattern defects and acceptable patterns, record lot/wafer IDs, describe visible evidence, and recommend proceed, hold, or escalate.",
        requiredTasks: [
          "Classify each of the 12 inspection images accurately.",
          "Record affected lot and wafer identifiers and objective visual evidence.",
          "Recommend Proceed, Hold, or Escalate under supplied rules without recommending unauthorized recipe changes."
        ],
        submissionDeliverables: ["12-Image Lithography Defect Classification Log"],
        interactiveSimulatorHint: "At least 10 of 12 correct classifications and zero unauthorized process-change recommendations."
      },
      assessmentQuestions: [
        {
          id: "semi-m4-q1",
          prompt: SEMICONDUCTOR_FINAL_QUIZ_10[1].question,
          options: SEMICONDUCTOR_FINAL_QUIZ_10[1].options,
          correctIndex: SEMICONDUCTOR_FINAL_QUIZ_10[1].correctIndex,
          modelAnswerExplanation: SEMICONDUCTOR_FINAL_QUIZ_10[1].explanation
        },
        {
          id: "semi-m4-q2",
          prompt: SEMICONDUCTOR_FINAL_QUIZ_10[2].question,
          options: SEMICONDUCTOR_FINAL_QUIZ_10[2].options,
          correctIndex: SEMICONDUCTOR_FINAL_QUIZ_10[2].correctIndex,
          modelAnswerExplanation: SEMICONDUCTOR_FINAL_QUIZ_10[2].explanation
        }
      ],
      passingCriterionNote: "At least 10 of 12 correct defect classifications and no unauthorized recipe changes.",
      professionalDeliverable: {
        title: "Post-Development Inspection (ADI) Defect Classification Report",
        format: "Inspection Log",
        templateMarkdown: `# Milestone 4 — Lithography ADI Defect Log\n- Target CD: 200 nm | Measured CD: 206 nm (+3%)\n- Defect Classifications & Hold Recommendations:\n`
      },
      competencyRubric: [
        {
          criterion: "Pattern Defect Recognition & CD Math",
          developing: "Misclassifies critical bridging/collapse defects or recommends tweaking exposure dose independently.",
          competent: "Correctly classifies >= 10/12 cases, computes 3% CD error, and follows hold rules.",
          advanced: "Separates visual observations clearly from root-cause hypotheses."
        }
      ],
      careerApplication: {
        workplaceUsage: "Photolithography bay operation and After-Develop Inspection (ADI).",
        supervisionAndLicensingNote: "Technicians never adjust exposure dose or developer chemistry without engineering authorization."
      },
      whitePaperPages: [],
      whitePaperFullMarkdown: "# Milestone 4: Photolithography and Pattern Transfer"
    },
    {
      milestoneNumber: 5,
      title: "Etching, deposition and thermal processing (Week 6)",
      summary: "Material removal (etch rate, selectivity, anisotropy, endpoint) vs. material addition (deposition rate) and thermal processing.",
      learningObjectives: [
        "Differentiate material removal from material addition.",
        "Explain the purpose of thermal processing.",
        "Interpret simple film thickness and etch-rate measurements.",
        "Recognize process uniformity and material-compatibility concerns."
      ],
      lessons: [
        {
          lessonNumber: "Lesson 5.1 & 5.2",
          title: "Etching, Selectivity, Deposition & Thermal Processing",
          paragraphs: [
            "Etching removes material from selected regions while preserving underlying/masking layers (selectivity). Deposition creates a conductive, insulating, or semiconducting film on a substrate.",
            "Thermal processing is used for oxidation, dopant activation, or material densification."
          ],
          bulletPoints: [
            "Etch rate: amount of material removed per unit time (nm/min).",
            "Selectivity: relative removal rate of one material compared with another.",
            "Anisotropy: degree to which material removal depends on direction.",
            "Endpoint: criterion used to determine when etching should stop.",
            "Uniformity: consistency across the wafer or lot."
          ],
          mathFormulaBox: {
            title: "Worked examples — Etch Rate & Deposition Rate",
            equations: [
              "Etch Rate:        (500 nm - 380 nm) / 4 min = 120 / 4 = 30 nm/min",
              "Deposition Rate:  (240 nm - 0 nm) / 6 min   = 240 / 6 = 40 nm/min"
            ],
            explanation: "Average rate calculations describe the observed run and must not be used to set a production recipe without an approved process specification."
          }
        }
      ],
      workedExample: {
        title: "Average Etch Rate & Deposition Rate Calculation",
        problemStatement: "A film decreases from 500 nm to 380 nm during a 4-minute etch, and a second film grows from 0 nm to 240 nm during a 6-minute deposition. Calculate both average rates.",
        stepByStepSolution: [
          "1. Etch material removed: 500 - 380 = 120 nm; Average etch rate = 120 nm / 4 min = 30 nm/min.",
          "2. Deposition thickness grown: 240 nm; Average deposition rate = 240 nm / 6 min = 40 nm/min."
        ],
        engineeringConclusion: "Average etch rate is 30 nm/min and average deposition rate is 40 nm/min."
      },
      practicalLab: {
        title: "Practical assignment — Process comparison (2 Etch Tools & 2 Deposition Tools)",
        scenario: "Calculate average rates and variation across two etch tools and two deposition tools, flag out-of-limit values, and write a technical summary.",
        requiredTasks: [
          "Calculate average etch and deposition rates for each tool.",
          "Compare run-to-run variation and flag values outside provided specification limits.",
          "Prepare a concise technical summary without recommending unapproved recipe changes."
        ],
        submissionDeliverables: ["Etch & Deposition Tool Rate Comparison Worksheet"],
        interactiveSimulatorHint: "Verify all calculations and flag every out-of-specification run."
      },
      assessmentQuestions: [
        {
          id: "semi-m5-q1",
          prompt: "If a film decreases from 500 nm to 380 nm during a 4-minute etch process, what is the average etch rate?",
          options: ["30 nm/min", "40 nm/min", "120 nm/min", "95 nm/min"],
          correctIndex: 0,
          modelAnswerExplanation: "(500 - 380) nm / 4 min = 120 / 4 = 30 nm/min."
        }
      ],
      passingCriterionNote: "Correct rate calculations, all out-of-spec values identified, and no unapproved tool/recipe changes.",
      professionalDeliverable: {
        title: "Etch & Deposition Rate Qualification Summary",
        format: "Process Rate Worksheet",
        templateMarkdown: `# Milestone 5 — Etch & Deposition Tool Comparison\n- Etch Rate Calculation: 30 nm/min\n- Deposition Rate Calculation: 40 nm/min\n- Out-of-Spec Flags & Escalation:\n`
      },
      competencyRubric: [
        {
          criterion: "Rate Calculations & Process Control",
          developing: "Incorrect rate math or misses out-of-spec tool runs.",
          competent: "Accurate nm/min calculations and proper escalation of out-of-spec tools.",
          advanced: "Evaluates both average rate drift and within-wafer non-uniformity."
        }
      ],
      careerApplication: {
        workplaceUsage: "Monitoring thin-film deposition and plasma/wet etch tool stability.",
        supervisionAndLicensingNote: "No process chemistry is handled in beginner training; recipe adjustments require engineering sign-off."
      },
      whitePaperPages: [],
      whitePaperFullMarkdown: "# Milestone 5: Etching, Deposition and Thermal Processing"
    },
    {
      milestoneNumber: 6,
      title: "Manufacturing equipment and facilities (Week 7)",
      summary: "Equipment subsystems (load locks, chambers, vacuum, gas delivery, sensors, interlocks), tool status states, alarm response, and SEMI S19 maintenance boundaries.",
      learningObjectives: [
        "Identify the main subsystems of semiconductor manufacturing equipment.",
        "Read basic equipment status indicators.",
        "Recognize abnormal alarms and maintenance boundaries.",
        "Explain the role of facilities systems and preventive maintenance."
      ],
      lessons: [
        {
          lessonNumber: "Lesson 6.1, 6.2 & 6.3",
          title: "Equipment subsystems, Status/Alarms & Maintenance boundaries (SEMI S19)",
          paragraphs: [
            "Equipment Status Model: Available, Busy, Idle, Down, and Engineering hold.",
            "When an alarm occurs, the technician must follow the approved response procedure, record the alarm information, protect product traceability, and notify the responsible team. An alarm must never be bypassed simply to keep production moving.",
            "Routine operator checks and equipment servicing are not the same task. Opening a chamber, working with hazardous chemicals, servicing electrical systems, or modifying control settings requires specialized authorization, isolation (LOTO), and SEMI S19 safety training."
          ],
          bulletPoints: [
            "Wafer-loading and transfer mechanisms & Process chambers",
            "Vacuum pumps, pressure controls, temperature heaters, and gas/chemical delivery",
            "Sensors, control software, alarms, and hardware safety interlocks"
          ]
        }
      ],
      workedExample: {
        title: "Abnormal Chamber Pressure Alarm Response Protocol",
        problemStatement: "A deposition tool triggers an abnormal chamber pressure alarm while processing Lot LOT-EX-1042. What actions must the trainee take and avoid?",
        stepByStepSolution: [
          "1. Do NOT bypass the alarm, do NOT abort/vent the chamber manually unless instructed by the emergency SOP, and do NOT restart the run.",
          "2. Record Tool ID, Lot ID, Wafer IDs, Timestamp, and exact Alarm Code/Text.",
          "3. Transition or verify the tool is placed in Down / Engineering Hold status per site procedure.",
          "4. Escalate immediately to Equipment Engineering and Process Engineering and write a clear shift handover note."
        ],
        engineeringConclusion: "Preserving equipment state and lot traceability while escalating prevents safety hazards and scrap."
      },
      practicalLab: {
        title: "Practical assignment — Alarm-response scenario",
        scenario: "A simulated deposition tool reports an abnormal pressure condition while a wafer lot is being processed.",
        requiredTasks: [
          "Identify the equipment status and the information needed.",
          "Explain why the process should not be restarted without authorization.",
          "Document the lot, wafer, tool, time, and alarm identifier.",
          "Identify the proper escalation contact from a supplied role chart.",
          "Write a concise handover note."
        ],
        submissionDeliverables: ["Equipment Alarm Escalation & Shift Handover Record"],
        interactiveSimulatorHint: "Never bypass an alarm or open a process chamber without authorization."
      },
      assessmentQuestions: [
        {
          id: "semi-m6-q1",
          prompt: SEMICONDUCTOR_FINAL_QUIZ_10[3].question,
          options: SEMICONDUCTOR_FINAL_QUIZ_10[3].options,
          correctIndex: SEMICONDUCTOR_FINAL_QUIZ_10[3].correctIndex,
          modelAnswerExplanation: SEMICONDUCTOR_FINAL_QUIZ_10[3].explanation
        }
      ],
      passingCriterionNote: "Correct escalation, complete traceability, no unauthorized intervention, and clear technical documentation.",
      professionalDeliverable: {
        title: "Equipment Alarm Escalation & Handover Log",
        format: "Operations Handover Record",
        templateMarkdown: `# Milestone 6 — Equipment Alarm & Handover Log\n- Tool ID & Status:\n- Alarm ID & Timestamp:\n- Affected Lot/Wafer IDs:\n- Escalation Contact & Handover Summary:\n`
      },
      competencyRubric: [
        {
          criterion: "Alarm Response & Maintenance Boundary Compliance",
          developing: "Attempts unauthorized restart or omits lot/alarm traceability.",
          competent: "Follows approved alarm protocol, logs all identifiers, and escalates to proper role.",
          advanced: "Provides structured handover protecting both wafer integrity and equipment safety."
        }
      ],
      careerApplication: {
        workplaceUsage: "Fab equipment monitoring, alarm escalation, and cross-shift coordination.",
        supervisionAndLicensingNote: "Guided by OSHA regulations and SEMI S19 equipment-support safety guidelines."
      },
      whitePaperPages: [],
      whitePaperFullMarkdown: "# Milestone 6: Manufacturing Equipment and Facilities"
    },
    {
      milestoneNumber: 7,
      title: "Metrology, statistical process control and defect analysis (Weeks 8–9)",
      summary: "Semiconductor metrology (NIST), Specification Limits vs. Control Limits, SPC trends, and separating factual defect observations from root-cause hypotheses.",
      learningObjectives: [
        "Explain the purpose of metrology in semiconductor production.",
        "Calculate mean, range, and percentage deviation.",
        "Recognize the difference between specification limits and control limits.",
        "Interpret a simple process trend.",
        "Document and escalate abnormal measurements."
      ],
      lessons: [
        {
          lessonNumber: "Lesson 7.1, 7.2, 7.3 & 7.4",
          title: "Metrology, Specification vs. Control Limits, SPC & Defect Classification",
          paragraphs: [
            "Specification limits describe the acceptable product or process range defined by an engineering requirement. Control limits are statistically derived from process data and help indicate whether process behavior may have changed.",
            "In a fictional process with a center line at 100 nm and control limits at 97 nm and 103 nm, a measurement of 104 nm exceeds the upper control limit. The appropriate response is to flag the result and follow the prescribed reaction plan — never repeat the measurement until a passing result appears.",
            "A technician should describe the evidence separately from the suspected cause: 'particle-like defect observed near the wafer edge' is an observation; 'caused by the deposition chamber' is a hypothesis requiring evidence."
          ],
          mathFormulaBox: {
            title: "Worked example — Mean, range and deviation (99, 100, 101, 100, 105 nm)",
            equations: [
              "Mean (x̄):         (99 + 100 + 101 + 100 + 105) / 5 = 101 nm",
              "Range (R):        105 - 99 = 6 nm",
              "Mean Deviation:   ((101 - 100) / 100) × 100 = 1%  (Note: 105 nm individual point requires review!)"
            ],
            explanation: "The mean alone (101 nm) cannot establish acceptance when an individual observation (105 nm) exceeds control/specification limits."
          }
        }
      ],
      workedExample: {
        title: "Metrology Mean, Range & Individual Excursion Check",
        problemStatement: "A metrology tool reports film thickness values of 99, 100, 101, 100, and 105 nm (target = 100 nm, upper control limit = 103 nm). Compute mean, range, mean % deviation, and evaluate the 105 nm reading.",
        stepByStepSolution: [
          "1. Compute mean: x̄ = (99 + 100 + 101 + 100 + 105) / 5 = 101 nm (1% above 100 nm target).",
          "2. Compute range: R = 105 - 99 = 6 nm.",
          "3. Inspect individual values: 105 nm exceeds the 103 nm upper limit and must be flagged for the reaction plan even though the mean is 101 nm."
        ],
        engineeringConclusion: "Always check both sample mean/range and individual point excursions against control and specification limits."
      },
      practicalLab: {
        title: "Practical assignment — Analyze a 20-point process dataset",
        scenario: "Analyze 20 simulated film-thickness measurements against supplied upper and lower control limits (97–103 nm).",
        requiredTasks: [
          "Calculate the mean and range.",
          "Flag individual values outside the supplied control limits.",
          "Identify any obvious trends or shifts.",
          "Separate observations from possible causes.",
          "Complete a quality escalation record."
        ],
        submissionDeliverables: ["20-Point SPC Chart Analysis", "Quality Escalation Record"],
        interactiveSimulatorHint: "Do not claim a suspected cause has been proven without empirical verification."
      },
      assessmentQuestions: [
        {
          id: "semi-m7-q1",
          prompt: SEMICONDUCTOR_FINAL_QUIZ_10[4].question,
          options: SEMICONDUCTOR_FINAL_QUIZ_10[4].options,
          correctIndex: SEMICONDUCTOR_FINAL_QUIZ_10[4].correctIndex,
          modelAnswerExplanation: SEMICONDUCTOR_FINAL_QUIZ_10[4].explanation
        },
        {
          id: "semi-m7-q2",
          prompt: SEMICONDUCTOR_FINAL_QUIZ_10[8].question,
          options: SEMICONDUCTOR_FINAL_QUIZ_10[8].options,
          correctIndex: SEMICONDUCTOR_FINAL_QUIZ_10[8].correctIndex,
          modelAnswerExplanation: SEMICONDUCTOR_FINAL_QUIZ_10[8].explanation
        }
      ],
      passingCriterionNote: "Correct calculations, all control-limit violations identified, and strict separation of observation vs. hypothesis.",
      professionalDeliverable: {
        title: "SPC Trend Analysis & Metrology Escalation Report",
        format: "SPC Worksheet",
        templateMarkdown: `# Milestone 7 — Metrology & SPC Escalation Report\n- Calculated Mean & Range:\n- Control Limit Excursions Flagged:\n- Factual Observations vs. Unverified Hypotheses:\n`
      },
      competencyRubric: [
        {
          criterion: "SPC Calculations & Observation vs. Hypothesis Separation",
          developing: "Confuses spec limits with control limits or states unverified causes as fact.",
          competent: "Accurately computes mean/range, flags excursions, and separates observations from hypotheses.",
          advanced: "Identifies multi-point drift trends early and documents complete reaction steps."
        }
      ],
      careerApplication: {
        workplaceUsage: "Inline wafer metrology and Statistical Process Control monitoring.",
        supervisionAndLicensingNote: "Aligned with NIST CHIPS R&D Metrology principles."
      },
      whitePaperPages: [],
      whitePaperFullMarkdown: "# Milestone 7: Metrology, Statistical Process Control and Defect Analysis"
    },
    {
      milestoneNumber: 8,
      title: "Quality, yield and manufacturing systems (Weeks 10–11)",
      summary: "Lot traceability (LOT-EX-1042), Yield (92%) and First-Pass Yield (96.0%), nonconformance disposition, and structured shift handover.",
      learningObjectives: [
        "Explain lot traceability and manufacturing records.",
        "Calculate basic yield and defect percentages.",
        "Recognize nonconformance and hold procedures.",
        "Prepare a clear shift handover.",
        "Understand the relationship between quality, throughput, and scrap."
      ],
      lessons: [
        {
          lessonNumber: "Lesson 8.1, 8.2, 8.3, 8.4 & 8.5",
          title: "Lot Traceability, Yield, First-Pass Yield, Nonconformance & Shift Handover",
          paragraphs: [
            "Traceability connects a product to its processing history, including tools used, process steps completed, inspection results, deviations, and final disposition.",
            "A technician must not independently release a held lot or substitute an unapproved rework procedure."
          ],
          table: {
            headers: ["Field", "Example"],
            rows: [
              ["Lot ID", "LOT-EX-1042"],
              ["Wafer ID", "W07"],
              ["Process step", "Film inspection"],
              ["Tool ID", "MET-03"],
              ["Recipe revision", "R05"],
              ["Measurement", "101 nm"],
              ["Disposition", "Hold pending review"]
            ]
          },
          mathFormulaBox: {
            title: "Worked examples — Yield & First-Pass Yield (FPY)",
            equations: [
              "Overall Yield:     Yield = (920 Accepted / 1,000 Evaluated) × 100% = 92%",
              "First-Pass Yield:  FPY   = (912 Passed First Time / 950 Entered) × 100% ≈ 96.0%"
            ],
            explanation: "Rework, retest, scrap, and downstream failures must never be hidden by changing the denominator."
          }
        }
      ],
      workedExample: {
        title: "Lot Yield & First-Pass Yield (FPY) Calculation",
        problemStatement: "In Lot 1, 920 units pass testing out of 1,000 evaluated. In Operation 2, 950 units enter and 912 pass the first time without rework. Calculate Yield and First-Pass Yield.",
        stepByStepSolution: [
          "1. Overall Yield = (920 / 1,000) × 100% = 92.0%.",
          "2. First-Pass Yield (FPY) = (912 / 950) × 100% ≈ 96.0%."
        ],
        engineeringConclusion: "Yield is 92.0% and First-Pass Yield is 96.0%; investigating the 8% / 4% nonconforming units requires full lot traceability."
      },
      practicalLab: {
        title: "Practical assignment — Manufacturing quality investigation",
        scenario: "Analyze three lots across two equipment tools where one lot has an abnormal measurement and incomplete documentation.",
        requiredTasks: [
          "Identify all affected records and traceability gaps.",
          "Calculate lot yield and first-pass yield.",
          "Recommend a hold or escalation per supplied quality rules.",
          "Write a comprehensive shift handover note."
        ],
        submissionDeliverables: ["3-Lot Quality Investigation & Shift Handover Package"],
        interactiveSimulatorHint: "Preserve traceability and never invent missing documentation."
      },
      assessmentQuestions: [
        {
          id: "semi-m8-q1",
          prompt: SEMICONDUCTOR_FINAL_QUIZ_10[5].question,
          options: SEMICONDUCTOR_FINAL_QUIZ_10[5].options,
          correctIndex: SEMICONDUCTOR_FINAL_QUIZ_10[5].correctIndex,
          modelAnswerExplanation: SEMICONDUCTOR_FINAL_QUIZ_10[5].explanation
        },
        {
          id: "semi-m8-q2",
          prompt: SEMICONDUCTOR_FINAL_QUIZ_10[6].question,
          options: SEMICONDUCTOR_FINAL_QUIZ_10[6].options,
          correctIndex: SEMICONDUCTOR_FINAL_QUIZ_10[6].correctIndex,
          modelAnswerExplanation: SEMICONDUCTOR_FINAL_QUIZ_10[6].explanation
        }
      ],
      passingCriterionNote: "All affected records identified, accurate yield math, and compliant shift handover.",
      professionalDeliverable: {
        title: "Lot Traceability Audit, Yield Report & Shift Handover",
        format: "MES Quality Handover",
        templateMarkdown: `# Milestone 8 — Quality, Yield & Shift Handover\n- Yield: 92.0% | FPY: 96.0%\n- Nonconformance & Hold Status:\n- Shift Handover Checklist (Equipment, Active Lots, Alarms, Holds, Safety, Follow-Up):\n`
      },
      competencyRubric: [
        {
          criterion: "Yield Math, Nonconformance Control & Shift Handover",
          developing: "Releases a held lot or omits incomplete traceability records.",
          competent: "Computes yield/FPY accurately, holds nonconforming lot, and writes complete handover.",
          advanced: "Links tool history across lots to scope potential containment boundaries."
        }
      ],
      careerApplication: {
        workplaceUsage: "Manufacturing Execution System (MES) lot tracking, quality disposition, and shift changeovers.",
        supervisionAndLicensingNote: "Only authorized quality/engineering personnel may release a held lot."
      },
      whitePaperPages: [],
      whitePaperFullMarkdown: "# Milestone 8: Quality, Yield and Manufacturing Systems"
    },
    {
      milestoneNumber: 9,
      title: "Capstone: semiconductor manufacturing case study (Week 12)",
      summary: "Review three wafer lots (Lot A, Lot B, Lot C on tools DEP-01 & DEP-02) after film deposition and inspection, calculate mean/range, identify Lot B's 104 nm excursion + particle defect and Lot C's missing equipment ID gap, and submit the 7-part evidence package.",
      learningObjectives: [
        "Calculate the mean thickness and range for Lots A, B, and C.",
        "Identify Lot B's out-of-specification reading (104 nm vs. 97–103 nm spec) and particle defect.",
        "Identify Lot C's missing equipment identifier traceability deficiency.",
        "Produce the 7-part professional evidence package and explain the limits of the evidence."
      ],
      lessons: [
        {
          lessonNumber: "Lesson 9.1",
          title: "Capstone Dataset & Case Study Analysis (Lots A, B, and C)",
          paragraphs: [
            "A fictional semiconductor fabrication facility has asked a trainee technician to review three wafer lots after a routine film deposition and inspection sequence (Target = 100 nm, Specified range = 97–103 nm).",
            "The learner must determine what the data demonstrates, what remains uncertain, and which records or lots require review under the supplied procedures."
          ],
          table: {
            headers: ["Lot", "Tool", "Film measurements (nm)", "Target", "Specified range", "Additional Records & Expected Findings"],
            rows: [
              ["Lot A", "DEP-01", "99, 100, 101, 100, 100", "100 nm", "97–103 nm", "Mean = 100 nm; Range = 2 nm. Within spec; no particle reported (other quality checks may still apply)."],
              ["Lot B", "DEP-01", "100, 101, 104, 100, 102", "100 nm", "97–103 nm", "Mean = 101.4 nm; Range = 4 nm. 104 nm exceeds 103 nm upper limit + 1 particle defect ⇒ Hold & Escalate."],
              ["Lot C", "DEP-02", "99, 100, 100, 101, 100", "100 nm", "97–103 nm", "Mean = 100 nm; Range = 2 nm. Measurements pass, but missing equipment ID is a traceability gap requiring authorized correction."]
            ]
          },
          mathFormulaBox: {
            title: "Capstone Task 1 — Exact Lot Mean & Range Calculations",
            equations: [
              "Lot A:  x̄_A = (99+100+101+100+100)/5 = 100 nm   ;   R_A = 101 - 99 = 2 nm",
              "Lot B:  x̄_B = (100+101+104+100+102)/5 = 101.4 nm ;  R_B = 104 - 100 = 4 nm",
              "Lot C:  x̄_C = (99+100+100+101+100)/5 = 100 nm   ;   R_C = 101 - 99 = 2 nm"
            ],
            explanation: "Completion criteria: 80/100 overall, no critical safety failure, correct identification of Lot B's 104 nm excursion + particle defect, and correct identification of Lot C's missing equipment ID traceability gap."
          }
        }
      ],
      workedExample: {
        title: "Capstone Answer Key — Lots A, B, and C Disposition",
        problemStatement: "Evaluate Lots A, B, and C against the 100 nm target (97–103 nm specified range) and traceability rules.",
        stepByStepSolution: [
          "1. Lot A (DEP-01): Mean = 100 nm, Range = 2 nm. All five readings fall within 97–103 nm; do not assume full release until all other required checks are verified.",
          "2. Lot B (DEP-01): Mean = 101.4 nm, Range = 4 nm. The 104 nm reading exceeds the 103 nm upper specification limit, and 1 particle defect was documented ⇒ Record nonconformance, place on Hold, and escalate.",
          "3. Lot C (DEP-02): Mean = 100 nm, Range = 2 nm. Measurements pass, but one required record is missing its equipment ID ⇒ Hold record completion and resolve the traceability gap through the authorized procedure."
        ],
        engineeringConclusion: "Lot B requires Hold/Escalation for the 104 nm excursion and particle defect; Lot C requires authorized traceability correction for the missing tool ID."
      },
      practicalLab: {
        title: "Capstone Task 3 — Produce the 7-part professional evidence package",
        scenario: "Submit the complete capstone investigation package for Lots A, B, and C graded on the 100-point rubric (20 pts each across 5 areas).",
        requiredTasks: [
          "1. Completed measurement worksheet (Lot A: 100 nm / 2 nm; Lot B: 101.4 nm / 4 nm; Lot C: 100 nm / 2 nm).",
          "2. Lot-by-lot findings table.",
          "3. Defect and nonconformance record (Lot B 104 nm + particle defect).",
          "4. Traceability-gap report (Lot C missing equipment identifier).",
          "5. Proposed escalation and hold recommendation based on supplied procedures.",
          "6. Shift handover note.",
          "7. Short presentation explaining the results and limitations of the evidence."
        ],
        submissionDeliverables: [
          "Measurement Worksheet & Lot Findings Table",
          "Defect/Nonconformance Record (Lot B) & Traceability-Gap Report (Lot C)",
          "Escalation/Hold Recommendation, Shift Handover Note & Limitations Presentation"
        ],
        interactiveSimulatorHint: "100-Point Grading Rubric: 20 pts Calculations, 20 pts Spec/Defect Recognition, 20 pts Traceability, 20 pts Safety/Hold/Escalation, 20 pts Presentation."
      },
      assessmentQuestions: [
        {
          id: "semi-m9-q1",
          prompt: SEMICONDUCTOR_FINAL_QUIZ_10[7].question,
          options: SEMICONDUCTOR_FINAL_QUIZ_10[7].options,
          correctIndex: SEMICONDUCTOR_FINAL_QUIZ_10[7].correctIndex,
          modelAnswerExplanation: SEMICONDUCTOR_FINAL_QUIZ_10[7].explanation
        },
        {
          id: "semi-m9-q2",
          prompt: SEMICONDUCTOR_FINAL_QUIZ_10[9].question,
          options: SEMICONDUCTOR_FINAL_QUIZ_10[9].options,
          correctIndex: SEMICONDUCTOR_FINAL_QUIZ_10[9].correctIndex,
          modelAnswerExplanation: SEMICONDUCTOR_FINAL_QUIZ_10[9].explanation
        }
      ],
      passingCriterionNote: "Proposed completion criteria: 80/100 overall, no critical safety failure, correct identification of Lot B's out-of-spec reading, and correct identification of Lot C's traceability gap.",
      professionalDeliverable: {
        title: "Semiconductor Manufacturing 7-Part Capstone Evidence Package (Lots A, B, C)",
        format: "100-Point Graded Capstone Portfolio",
        templateMarkdown: `# Semiconductor Manufacturing Capstone — Lots A, B & C\n## 1. Measurement Worksheet\n- **Lot A (DEP-01)**: Mean = 100 nm, Range = 2 nm (Within 97–103 nm spec)\n- **Lot B (DEP-01)**: Mean = 101.4 nm, Range = 4 nm (104 nm OUT OF SPEC + 1 Particle Defect)\n- **Lot C (DEP-02)**: Mean = 100 nm, Range = 2 nm (Missing Equipment ID Traceability Gap)\n\n## 2. Hold, Escalation & Shift Handover\n- **Lot B Action**: Place on Hold; log nonconformance and particle defect; escalate to Process/Quality Engineering.\n- **Lot C Action**: Resolve missing equipment ID via authorized traceability procedure before release.\n`
      },
      competencyRubric: [
        {
          criterion: "1. Measurement calculations and unit handling (20 pts)",
          developing: "Calculation or unit errors on Lots A, B, or C.",
          competent: "Exact Mean (100, 101.4, 100 nm) and Range (2, 4, 2 nm) with correct nm units.",
          advanced: "Includes full step-by-step verification and uncertainty notes."
        },
        {
          criterion: "2. Specification comparison and defect recognition (20 pts)",
          developing: "Misses the 104 nm excursion on Lot B or ignores the particle observation.",
          competent: "Flags Lot B's 104 nm reading (>103 nm USL) and documents the particle defect.",
          advanced: "Notes that Lot A's passing film thickness alone does not waive other required inspections."
        },
        {
          criterion: "3. Traceability and documentation (20 pts)",
          developing: "Invents a tool ID for Lot C or ignores the missing field.",
          competent: "Identifies Lot C's missing equipment ID and initiates authorized traceability resolution.",
          advanced: "Maintains complete lot/wafer/tool/recipe linkage across all 7 deliverables."
        },
        {
          criterion: "4. Safety, hold, and escalation decisions (20 pts)",
          developing: "Recommends unauthorized recipe changes or releases Lot B/C.",
          competent: "Follows documented hold and escalation procedures with zero safety violations.",
          advanced: "Provides clear cross-shift containment and handover."
        },
        {
          criterion: "5. Technical explanation and presentation (20 pts)",
          developing: "Confuses observations with unverified root-cause guesses.",
          competent: "Clearly explains what the data demonstrates and what remains uncertain.",
          advanced: "Executive-ready presentation defending all findings and evidence boundaries."
        }
      ],
      careerApplication: {
        workplaceUsage: "Directly prepares candidates for Semiconductor Manufacturing, Wafer Fab, Metrology, and Quality Technician trainee assessments.",
        supervisionAndLicensingNote: "Completion signifies completing the educational curriculum and assessments; employer tool qualification is required for production work."
      },
      whitePaperPages: [],
      whitePaperFullMarkdown: "# Milestone 9: Capstone — Semiconductor Manufacturing Case Study"
    }
  ]
}

// Populate 10-Page Versioned Technical Learning Guide for all 9 Semiconductor Milestones
SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY.milestones.forEach((m) => {
  const guide = buildTenPageTechnicalGuide(
    SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY.title,
    m.milestoneNumber,
    m.title,
    m.summary,
    m.learningObjectives,
    m.lessons,
    m.workedExample,
    m.practicalLab,
    m.competencyRubric,
    m.professionalDeliverable.title,
    m.careerApplication.supervisionAndLicensingNote,
    SEMICONDUCTOR_MANUFACTURING_FLAGSHIP_PATHWAY.principalReferences
  )
  m.whitePaperPages = guide.pages
  m.whitePaperFullMarkdown = guide.fullMarkdown
})

