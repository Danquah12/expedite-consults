import {
  RoadmapWhitePaperPage,
  SkillDeepDiveSpec
} from "@/lib/learning-roadmap-whitepapers"

export interface NineComponentSpec {
  number: string
  title: string
  description: string
  icon: string
}

export interface PathwayLesson {
  lessonNumber: string
  title: string
  paragraphs: string[]
  table?: {
    headers: string[]
    rows: string[][]
  }
  orderedSteps?: string[]
  bulletPoints?: string[]
  mathFormulaBox?: {
    title: string
    equations: string[]
    explanation: string
  }
  calloutNote?: string
}

export interface PathwayPracticalLab {
  title: string
  scenario: string
  requiredTasks: string[]
  submissionDeliverables: string[]
  interactiveSimulatorHint: string
}

export interface PathwayAssessmentQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  modelAnswerExplanation: string
}

export interface PathwayMilestoneUnit {
  milestoneNumber: number
  title: string
  summary: string
  learningObjectives: string[]
  lessons: PathwayLesson[]
  workedExample: {
    title: string
    problemStatement: string
    stepByStepSolution: string[]
    engineeringConclusion: string
  }
  practicalLab: PathwayPracticalLab
  assessmentQuestions: PathwayAssessmentQuestion[]
  passingCriterionNote: string
  professionalDeliverable: {
    title: string
    format: string
    templateMarkdown: string
  }
  competencyRubric: {
    criterion: string
    developing: string
    competent: string
    advanced: string
  }[]
  careerApplication: {
    workplaceUsage: string
    supervisionAndLicensingNote: string
  }
  whitePaperPages: RoadmapWhitePaperPage[]
  whitePaperFullMarkdown: string
}

export interface PriorityCareerPathway {
  id: string
  priorityRank: number
  title: string
  categoryTitle: string
  level: string
  suggestedDuration: string
  deliveryFormat: string
  bestLearningFormat: string
  coverImage: string
  capstoneSummary: string
  safetyOrRegulatoryNotice: string
  principalReferences: {
    title: string
    organization: string
    url: string
    summary: string
  }[]
  milestones: PathwayMilestoneUnit[]
}

export interface MasterIndustryCategory {
  id: string
  categoryNumber: number
  groupLabel: "core_categories" | "vibe_differentiators"
  title: string
  subtitle: string
  coverImage: string
  careers: string[]
  capstoneRequirement: string
  regulatoryNotice?: string
}

export interface BusinessOwnershipTrack {
  id: string
  title: string
  tagline: string
  coverImage: string
  coreCompetencies: string[]
  capstoneDeliverable: string
  communityIntegration: string
}

export interface PlatformFeaturePillar {
  id: string
  title: string
  description: string
  badge: string
  interactiveActionLabel: string
}

// ============================================================================
// 0. THE 9 LEARNING COMPONENTS OF EVERY MILESTONE
// ============================================================================
export const MASTER_CURRICULUM_9_COMPONENTS: NineComponentSpec[] = [
  {
    number: "01",
    title: "Learning objectives",
    description: "What the learner must know and be able to demonstrate.",
    icon: "🎯"
  },
  {
    number: "02",
    title: "Core teaching material",
    description: "Detailed explanations, terminology, principles, diagrams, and examples.",
    icon: "📘"
  },
  {
    number: "03",
    title: "Technical white paper",
    description: "Deeper analysis, methods, standards, calculations, and cited references.",
    icon: "📜"
  },
  {
    number: "04",
    title: "Worked examples",
    description: "Step-by-step solutions to realistic professional problems.",
    icon: "📐"
  },
  {
    number: "05",
    title: "Practical laboratory",
    description: "Exercises, simulations, projects, tools, and procedures.",
    icon: "🧪"
  },
  {
    number: "06",
    title: "Knowledge assessment",
    description: "Quizzes, scenario questions, troubleshooting, and applied reasoning.",
    icon: "✅"
  },
  {
    number: "07",
    title: "Professional deliverable",
    description: "A report, design, drawing, model, assessment, or portfolio artifact.",
    icon: "📂"
  },
  {
    number: "08",
    title: "Competency rubric",
    description: "A measurable scoring guide showing what competent performance looks like.",
    icon: "📊"
  },
  {
    number: "09",
    title: "Career application",
    description: "How the skill is used in actual workplaces and what further training may be required.",
    icon: "🏗️"
  }
]

// ============================================================================
// 1. ALL 13 MASTER TRAINING CATEGORIES (108+ CAREERS)
// ============================================================================
export const MASTER_INDUSTRY_CATEGORIES: MasterIndustryCategory[] = [
  {
    id: "cat-1-construction-trades",
    categoryNumber: 1,
    groupLabel: "core_categories",
    title: "Advanced Construction & Master Trades",
    subtitle: "Train learners to become highly skilled tradespeople, technical specialists, and construction leaders.",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    careers: [
      "Master Carpenter & Timber Frame Engineer",
      "Construction Superintendent & Project Manager",
      "Master Electrician & Smart Building Specialist",
      "Plumbing Systems & Pipefitting Specialist",
      "HVAC, Refrigeration & Building Automation Technician",
      "Welding, Fabrication & Structural Steel Specialist",
      "BIM Coordinator & Digital Construction Manager",
      "Solar Installation & Microgrid Technician"
    ],
    capstoneRequirement: "Design, estimate, construct, inspect, and document a realistic project."
  },
  {
    id: "cat-2-cybersecurity-defense",
    categoryNumber: 2,
    groupLabel: "core_categories",
    title: "Cybersecurity & Digital Defense",
    subtitle: "Supports controlled labs, simulations, case studies, and practical assessments across offensive and defensive security.",
    coverImage: "/images/connectln-studies/cyber-specialist-cover.jpg",
    careers: [
      "Application Penetration Tester",
      "Automated SAST-to-Pentest Engineer",
      "Red Team Operator & Adversary Emulation Specialist",
      "Security Operations Center (SOC) Analyst",
      "Digital Forensics & Incident Response (DFIR) Investigator",
      "Cloud Security Architect",
      "Active Directory & Identity Security Engineer",
      "AI Security and LLM Red-Team Specialist",
      "Ransomware Defense and Recovery Engineer",
      "Governance, Risk & Compliance (GRC) Architect"
    ],
    capstoneRequirement: "Investigate a simulated breach, validate vulnerabilities in a controlled lab, and produce a professional security report."
  },
  {
    id: "cat-3-engineering-robotics",
    categoryNumber: 3,
    groupLabel: "core_categories",
    title: "Engineering, Robotics & Advanced Manufacturing",
    subtitle: "Industrial control systems, robotics integration, CNC machining, power systems, and additive manufacturing.",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    careers: [
      "Industrial Automation & PLC Engineer",
      "Robotics Integration Specialist",
      "CAD/CAM & CNC Machining Specialist",
      "Mechanical Design Engineer",
      "Electrical Power Systems Technician",
      "Industrial Instrumentation & Controls Specialist",
      "3D Printing & Additive Manufacturing Technician",
      "Quality Assurance & Reliability Engineer",
      "Water Treatment Systems Operator",
      "Battery Storage & Renewable Energy Systems Designer"
    ],
    capstoneRequirement: "Design a working system, model its performance, troubleshoot faults, and document engineering decisions."
  },
  {
    id: "cat-4-architecture-infrastructure",
    categoryNumber: 4,
    groupLabel: "core_categories",
    title: "Architecture, Infrastructure & Building Technology",
    subtitle: "Digital twins, structural detailing, building envelope science, geospatial GIS, and cost engineering.",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    careers: [
      "BIM Manager and Digital Twin Specialist",
      "Structural Drafting and Detailing Technician",
      "Building Envelope & Waterproofing Specialist",
      "Geospatial Surveying and GIS Analyst",
      "Bridge Inspection Technician",
      "Building Energy Auditor",
      "Facilities Management Director",
      "Estimating and Construction Cost Engineer"
    ],
    capstoneRequirement: "Deliver coordinated drawings, quantity takeoffs, cost estimates, inspections, and a digital project record."
  },
  {
    id: "cat-5-ai-software-data",
    categoryNumber: 5,
    groupLabel: "core_categories",
    title: "AI, Software & Data Engineering",
    subtitle: "LLM and RAG architectures, data engineering, cloud DevOps, MLOps, agent workflows, and privacy engineering.",
    coverImage: "/images/connectln-studies/ai-studies-cover.jpg",
    careers: [
      "AI Application Engineer",
      "LLM and Retrieval-Augmented Generation (RAG) Engineer",
      "Data Engineering and Analytics Specialist",
      "Cloud and DevOps Engineer",
      "Software Test Automation Engineer",
      "Machine Learning Operations (MLOps) Engineer",
      "Database Reliability Engineer",
      "AI Agent Workflow Architect",
      "Privacy Engineering Specialist",
      "Enterprise Systems Integration Engineer"
    ],
    capstoneRequirement: "Build, test, deploy, monitor, and document a working software or AI system."
  },
  {
    id: "cat-6-specialized-technical",
    categoryNumber: 6,
    groupLabel: "core_categories",
    title: "Specialized Technical Careers",
    subtitle: "High-precision diagnostics, aviation, EV systems, NDT inspection, biomedical equipment, and semiconductor fabrication.",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    careers: [
      "Aircraft Maintenance Technician",
      "Automotive Diagnostics & EV Technician",
      "Elevator and Escalator Technician",
      "Nondestructive Testing (NDT) Technician",
      "Biomedical Equipment Technician",
      "Precision Machining Specialist",
      "Industrial Maintenance & Reliability Technician",
      "Semiconductor Manufacturing Technician"
    ],
    capstoneRequirement: "Diagnose a fault, follow an approved procedure, verify the repair, and produce an inspection record."
  },
  {
    id: "cat-7-digital-forensics-intel",
    categoryNumber: 7,
    groupLabel: "vibe_differentiators",
    title: "Digital Forensics, Investigations & Intelligence",
    subtitle: "Learners practice evidence handling, timelines, attribution limitations, report writing, and chain of custody.",
    coverImage: "/images/connectln-studies/packet-soc-cover.jpg",
    careers: [
      "Digital Evidence Examiner",
      "Cybercrime Investigation Analyst",
      "Fraud Detection and Investigation Specialist",
      "OSINT Research Analyst",
      "E-discovery and Litigation Support Specialist",
      "Threat Intelligence Analyst",
      "Incident Reconstruction Specialist"
    ],
    capstoneRequirement: "Execute full chain-of-custody evidence preservation, reconstruct an incident timeline, document attribution limitations, and author a defensible forensic report."
  },
  {
    id: "cat-8-healthcare-tech-lab",
    categoryNumber: 8,
    groupLabel: "vibe_differentiators",
    title: "Healthcare Technology & Laboratory Careers",
    subtitle: "Clinical laboratory foundations, biomedical instrumentation, health informatics, and healthcare cybersecurity.",
    coverImage: "/images/connectln-studies/mlops-data-cover.jpg",
    careers: [
      "Clinical Laboratory Science Foundations",
      "Medical Equipment Maintenance",
      "Health Information Management",
      "Healthcare Data Analytics",
      "Medical Coding and Revenue Cycle",
      "Healthcare Cybersecurity",
      "Clinical Research Operations"
    ],
    capstoneRequirement: "Complete a simulated clinical informatics or biomedical equipment verification audit while adhering to HIPAA and regulatory compliance standards.",
    regulatoryNotice: "Regulated clinical work must include the appropriate accredited education, supervised practice, and licensing requirements."
  },
  {
    id: "cat-9-agriculture-food-env",
    categoryNumber: 9,
    groupLabel: "vibe_differentiators",
    title: "Agriculture, Food Systems & Environmental Technology",
    subtitle: "Precision agriculture, controlled-environment farming, irrigation hydraulics, water quality, and resource recovery.",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    careers: [
      "Precision Agriculture Specialist",
      "Hydroponics and Controlled-Environment Farming",
      "Irrigation Systems Technician",
      "Soil and Water Quality Technician",
      "Food Safety and Quality Assurance",
      "Agricultural Equipment Maintenance",
      "Environmental Monitoring Analyst",
      "Wastewater and Resource Recovery Operator"
    ],
    capstoneRequirement: "Build a crop-production plan, calculate resource requirements, monitor conditions, and optimize yield."
  },
  {
    id: "cat-10-logistics-supply-chain",
    categoryNumber: 10,
    groupLabel: "vibe_differentiators",
    title: "Logistics, Supply Chain & Operations",
    subtitle: "Supply chain analytics, warehouse automation, procurement, fleet operations, quality auditing, and lean resilience.",
    coverImage: "/images/connectln-studies/business-capstone-cover.jpg",
    careers: [
      "Supply Chain Analyst",
      "Warehouse Automation Manager",
      "Procurement and Contract Specialist",
      "Fleet Operations Manager",
      "Inventory Optimization Analyst",
      "Quality Systems Auditor",
      "Lean Manufacturing Specialist",
      "Business Continuity and Resilience Planner"
    ],
    capstoneRequirement: "Optimize a simulated supply chain against delays, cost overruns, inventory shortages, and supplier failures."
  },
  {
    id: "cat-11-finance-business-services",
    categoryNumber: 11,
    groupLabel: "vibe_differentiators",
    title: "Finance, Business & Professional Services",
    subtitle: "Corporate financial analysis, project cost control, business intelligence, internal audit, and commercial real estate.",
    coverImage: "/images/connectln-studies/business-capstone-cover.jpg",
    careers: [
      "Financial Planning Foundations",
      "Corporate Financial Analysis",
      "Project Cost Control",
      "Business Intelligence Analyst",
      "Internal Audit Specialist",
      "Contract Administration",
      "Small Business Operations Manager",
      "Commercial Real Estate Analysis"
    ],
    capstoneRequirement: "Evaluate a realistic business case, construct a financial model, assess risks, and present a defensible recommendation."
  },
  {
    id: "cat-12-creative-digital-media",
    categoryNumber: 12,
    groupLabel: "vibe_differentiators",
    title: "Creative Production & Digital Media",
    subtitle: "Video editing, motion graphics, 3D visualization, sound design, UX/UI, technical writing, and learning design.",
    coverImage: "/images/connectln-studies/agentic-mcp-cover.jpg",
    careers: [
      "Professional Video Editor",
      "Motion Graphics Designer",
      "3D Modeling and Visualization Artist",
      "Sound Design and Audio Production",
      "UX/UI Designer",
      "Technical Writer",
      "Digital Learning Experience Designer",
      "Photography and Commercial Imaging Specialist"
    ],
    capstoneRequirement: "Deliver a client-ready portfolio with project files, a documented workflow, and a quality review."
  },
  {
    id: "cat-13-leadership-project-delivery",
    categoryNumber: 13,
    groupLabel: "vibe_differentiators",
    title: "Leadership, Supervision & Project Delivery",
    subtitle: "Field superintendency, technical program management, safety compliance, contract claims, and enterprise risk.",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    careers: [
      "Construction Superintendent",
      "Technical Program Manager",
      "Engineering Project Manager",
      "Safety and Compliance Manager",
      "Technical Team Lead",
      "Operations Director",
      "Contract and Claims Manager",
      "Enterprise Risk Manager"
    ],
    capstoneRequirement: "Lead a simulated project through planning, resourcing, risk management, stakeholder communication, and final delivery."
  }
]

// ============================================================================
// 2. FOUR BUSINESS OWNERSHIP & INDEPENDENT PRACTICE PATHWAYS
// ============================================================================
export const BUSINESS_OWNERSHIP_TRACKS: BusinessOwnershipTrack[] = [
  {
    id: "biz-trade-owner",
    title: "Trade Business Owner",
    tagline: "Transition from master craftsperson to independent trade contractor and construction business owner.",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    coreCompetencies: [
      "Estimating & Quantity Takeoffs",
      "Customer Acquisition & Bidding",
      "Construction Contracts & Lien Law",
      "Commercial Liability & Workers' Comp Insurance",
      "Critical-Path Scheduling",
      "Subcontractor Prequalification & Management",
      "Job-Cost Cash Flow & Retainage",
      "Field Quality Control & Punchlist Sign-Off"
    ],
    capstoneDeliverable: "Complete 12-Month Trade Contractor Business Plan, Master Service Agreement (MSA), Bid Estimate Package, and Cash-Flow Forecast.",
    communityIntegration: "Showcase completed jobsite portfolios, recruit vetted subcontractors, and bid on commercial projects inside the ConnectLn Trade Guild."
  },
  {
    id: "biz-cyber-consulting",
    title: "Cybersecurity Consulting Practice",
    tagline: "Launch an independent security assessment, penetration testing, and vCISO advisory practice.",
    coverImage: "/images/connectln-studies/cyber-specialist-cover.jpg",
    coreCompetencies: [
      "Scoping Authorized Assessments",
      "Rules of Engagement (RoE) & Legal Authorization",
      "Controlled Vulnerability Validation",
      "Executive & Technical Security Reporting",
      "Remediation Verification & Retesting",
      "Client Delivery & Retainer Structuring"
    ],
    capstoneDeliverable: "Full Consulting Engagement Kit: Master Rules of Engagement (RoE), Scoping Questionnaire, Validated Pentest Report, and Retest Sign-Off Certificate.",
    communityIntegration: "Connect with enterprise CISOs, partner with legal/compliance auditors, and publish verified technical advisories."
  },
  {
    id: "biz-renewable-contractor",
    title: "Renewable Energy Contractor",
    tagline: "Build a solar photovoltaic, battery storage, and commercial microgrid EPC contracting firm.",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    coreCompetencies: [
      "Site Solar Feasibility & Shading Analysis",
      "Energy Demand & Storage Sizing Calculations",
      "Tier-1 Equipment Procurement & Supply Chain",
      "Installation Coordination & Licensed PE Stamping",
      "O&M (Operations & Maintenance) Contracts",
      "Customer Financial Proposals & LCOE Modeling"
    ],
    capstoneDeliverable: "Commercial Solar + Storage EPC Proposal, Preliminary Single-Line Diagram, Procurement BOM, and 10-Year O&M Contract.",
    communityIntegration: "Collaborate with licensed electrical engineers, solar installers, and commercial facility directors across ConnectLn."
  },
  {
    id: "biz-specialist-manufacturing",
    title: "Specialist Manufacturing Business",
    tagline: "Establish a precision CNC machining, additive manufacturing, or custom industrial automation shop.",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    coreCompetencies: [
      "DFM (Design for Manufacturability) & CAD/CAM",
      "Production Planning & Spindle Scheduling",
      "ISO 9001 / AS9100 Quality Systems & Metrology",
      "Unit Costing, Setup Amortization & Pricing",
      "Raw Material & Tooling Inventory Control",
      "Capital Equipment ROI & B2B Sales"
    ],
    capstoneDeliverable: "Part Production Routing Sheet, First Article Inspection (FAI) Quality Plan, Machine-Hour Cost Model, and B2B Quote Package.",
    communityIntegration: "Receive RFQs from hardware engineers, share CAD/CAM post-processors, and mentor apprentice machinists."
  }
]

// ============================================================================
// 3. SEVEN CORE PLATFORM FEATURES (ARCHITECTURE PILLARS)
// ============================================================================
export const PLATFORM_ARCHITECTURE_FEATURES: PlatformFeaturePillar[] = [
  {
    id: "feat-career-builder",
    title: "Career Path Builder",
    description: "Learners choose a target role, current skill level, and preferred learning pace. The platform builds a milestone-based curriculum.",
    badge: "INTERACTIVE GENERATOR",
    interactiveActionLabel: "Launch Specification Generator"
  },
  {
    id: "feat-whitepaper-library",
    title: "Technical White Paper Library",
    description: "Searchable, versioned technical guides containing diagrams, calculations, references, limitations, and worked examples. Sources are labeled accurately; material is never described as peer-reviewed unless it has genuinely undergone peer review.",
    badge: "VERSIONED TECHNICAL GUIDES",
    interactiveActionLabel: "Open 10-Page Technical Guide"
  },
  {
    id: "feat-interactive-labs",
    title: "Interactive Practice Labs",
    description: "Construction geometry calculators, CAD exercises, cyber ranges, cloud sandboxes, engineering simulations, and troubleshooting scenarios.",
    badge: "HANDS-ON SANDBOXES",
    interactiveActionLabel: "Open Practical Lab"
  },
  {
    id: "feat-ai-tutor",
    title: "AI Career Tutor",
    description: "An assistant that explains difficult concepts, generates practice problems, evaluates submitted work against rubrics, and links answers to verified sources.",
    badge: "RUBRIC-GROUNDED AI",
    interactiveActionLabel: "Ask AI Career Tutor"
  },
  {
    id: "feat-competency-capstone",
    title: "Competency and Capstone Assessment",
    description: "Learners must demonstrate that they can perform a task, not merely watch a video. Uses practical rubrics, scenario assessments, and mentor sign-offs where appropriate.",
    badge: "PRACTICAL RUBRICS",
    interactiveActionLabel: "View Competency Rubric"
  },
  {
    id: "feat-skill-passport",
    title: "Verified Skill Passport",
    description: "Records completed modules, assessment results, portfolio evidence, and verified mentor endorsements. Clearly distinguishes platform certificates from accredited qualifications and professional licenses.",
    badge: "VERIFIED PORTFOLIO",
    interactiveActionLabel: "View Skill Passport"
  },
  {
    id: "feat-opportunity-hub",
    title: "Career and Opportunity Hub",
    description: "Connects learners with mentors, apprenticeships, employers, freelance projects, professional communities, and continuing education.",
    badge: "EMPLOYER & MENTOR NETWORK",
    interactiveActionLabel: "Explore Opportunities"
  }
]

// ============================================================================
// HELPER: GENERATE 10-PAGE VERSIONED TECHNICAL LEARNING GUIDE FOR ANY MILESTONE
// ============================================================================
export function buildTenPageTechnicalGuide(
  pathwayTitle: string,
  milestoneNumber: number,
  milestoneTitle: string,
  summary: string,
  objectives: string[],
  lessons: PathwayLesson[],
  workedExample: PathwayMilestoneUnit["workedExample"],
  practicalLab: PathwayPracticalLab,
  rubric: PathwayMilestoneUnit["competencyRubric"],
  deliverableTitle: string,
  supervisionNote: string,
  references: { title: string; organization: string; url: string; summary: string }[]
): { pages: RoadmapWhitePaperPage[]; fullMarkdown: string } {
  const docCode = `CLN-TG-${pathwayTitle.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase()}-M0${milestoneNumber}`
  const pages: RoadmapWhitePaperPage[] = [
    {
      pageNumber: 1,
      sectionTitle: `Executive Overview & Scope — Milestone ${milestoneNumber}: ${milestoneTitle}`,
      runningHeader: `${docCode} · VERSIONED TECHNICAL LEARNING GUIDE · PAGE 1 OF 10`,
      bodyParagraphs: [
        `Document ID: ${docCode} (Version 2.4 — ConnectLn Studies Technical Learning Guide). Note on Source Classification: This document is an instructional engineering and technical reference guide developed for the ConnectLn Career Mastery Academy. It synthesizes authoritative industry standards listed in Section 10 and is not a journal-published peer-reviewed paper.`,
        `Pathway Context: ${pathwayTitle} — Milestone ${milestoneNumber} of 9 (${milestoneTitle}). ${summary}`,
        `Core Learning Objectives: Upon completing this milestone, the practitioner must be able to demonstrate: ${objectives.join("; ")}.`
      ],
      keyEquationOrSpec: `Milestone ${milestoneNumber} Competency Target: >= 80% Knowledge Assessment + Validated Practical Lab Deliverable (${deliverableTitle})`,
      calloutBox: {
        title: "Professional Scope & Licensure Transparency",
        text: supervisionNote
      },
      citations: references.map((r) => `${r.organization} — ${r.title} (${r.url})`)
    },
    {
      pageNumber: 2,
      sectionTitle: lessons[0]?.title || `Core Principles & System Architecture`,
      runningHeader: `${docCode} · CORE TEACHING MATERIAL I · PAGE 2 OF 10`,
      bodyParagraphs:
        lessons[0]?.paragraphs.length
          ? lessons[0].paragraphs
          : [
              `Foundational system architecture for ${milestoneTitle} requires a clear decomposition of interfaces, operational states, and failure modes.`,
              `Practitioners must inspect how inputs, transformations, and outputs behave under both nominal conditions and boundary stress.`
            ],
      keyEquationOrSpec:
        lessons[0]?.mathFormulaBox?.equations.join("  |  ") ||
        `System Boundary Verification: Input Validation -> Authorized Processing -> Audited Output`,
      calloutBox: {
        title: lessons[0]?.mathFormulaBox?.title || "Architectural Principle",
        text:
          lessons[0]?.mathFormulaBox?.explanation ||
          lessons[0]?.calloutNote ||
          `Always verify system assumptions against primary technical documentation and measured telemetry before executing changes.`
      },
      citations: references.slice(0, 2).map((r) => `${r.organization}: ${r.title}`)
    },
    {
      pageNumber: 3,
      sectionTitle: lessons[1]?.title || `Operational Mechanics, Boundaries & Control Logic`,
      runningHeader: `${docCode} · CORE TEACHING MATERIAL II · PAGE 3 OF 10`,
      bodyParagraphs:
        lessons[1]?.paragraphs.length
          ? lessons[1].paragraphs
          : [
              `Distinguishing between operational states, permissions, and physical or logical trust boundaries prevents cascading failures in ${pathwayTitle}.`,
              `Every protected action or control sequence must be validated against explicit design criteria rather than assumed defaults.`
            ],
      keyEquationOrSpec:
        lessons[1]?.mathFormulaBox?.equations.join("  |  ") ||
        (lessons[1]?.table
          ? lessons[1].table.rows.map((r) => `${r[0]}: ${r[1]} (${r[2] || ""})`).join(" · ")
          : `Control Invariant: Explicit Verification at Every Trust Boundary`),
      calloutBox: {
        title: "Critical Distinction in Practice",
        text:
          lessons[1]?.calloutNote ||
          `Never conflate initial system availability with verified operational safety or authorization enforcement.`
      },
      citations: references.map((r) => `${r.organization} (${r.url})`)
    },
    {
      pageNumber: 4,
      sectionTitle: lessons[2]?.title || `Lifecycle Methodology & Diagnostic Workflow`,
      runningHeader: `${docCode} · LIFECYCLE & METHODOLOGY · PAGE 4 OF 10`,
      bodyParagraphs: [
        ...(lessons[2]?.paragraphs || [
          `A structured lifecycle ensures that ${milestoneTitle} is executed reproducibly, safely, and within approved scope.`
        ]),
        ...(lessons[2]?.orderedSteps
          ? [`Standard Operating Sequence: ${lessons[2].orderedSteps.map((s, idx) => `(${idx + 1}) ${s}`).join(" ")}`]
          : [])
      ],
      keyEquationOrSpec: `Lifecycle Stages: Scope Definition -> System Mapping -> Controlled Validation -> Impact Analysis -> Documented Reporting`,
      calloutBox: {
        title: "Field Execution Standard",
        text:
          lessons[2]?.calloutNote ||
          `Document all baseline measurements, scope constraints, and deviations before moving to corrective action.`
      },
      citations: references.map((r) => `${r.title} — ${r.summary}`)
    },
    {
      pageNumber: 5,
      sectionTitle: lessons[3]?.title || `Quality Evaluation, Telemetry & Edge-Case Analysis`,
      runningHeader: `${docCode} · EVALUATION & TELEMETRY · PAGE 5 OF 10`,
      bodyParagraphs:
        lessons[3]?.paragraphs.length
          ? lessons[3].paragraphs
          : [
              `Evaluating quality in ${milestoneTitle} requires separating individual performance dimensions so that hidden defects are not masked by aggregate averages.`,
              `Practitioners must test abnormal conditions, missing inputs, stale telemetry, and conflicting commands.`
            ],
      keyEquationOrSpec:
        lessons[3]?.mathFormulaBox?.equations.join("  |  ") ||
        `Quality Dimensions: Accuracy · Completeness · Groundedness · Safety · Efficiency`,
      calloutBox: {
        title: "Handling Uncertainty & Missing Data",
        text: `When source data or drawings are incomplete, escalate through the formal RFI/clarification process rather than guessing.`
      },
      citations: references.map((r) => `${r.organization}: ${r.url}`)
    },
    {
      pageNumber: 6,
      sectionTitle: `Worked Engineering & Diagnostic Example: ${workedExample.title}`,
      runningHeader: `${docCode} · WORKED PROFESSIONAL EXAMPLE · PAGE 6 OF 10`,
      bodyParagraphs: [
        `Problem Statement: ${workedExample.problemStatement}`,
        ...workedExample.stepByStepSolution,
        `Engineering Conclusion: ${workedExample.engineeringConclusion}`
      ],
      keyEquationOrSpec: workedExample.stepByStepSolution[0] || `Step-by-Step Quantitative & Logical Verification`,
      calloutBox: {
        title: "Assumptions & Design Margins",
        text: workedExample.engineeringConclusion
      },
      citations: references.map((r) => `${r.title}`)
    },
    {
      pageNumber: 7,
      sectionTitle: `Practical Laboratory Specification: ${practicalLab.title}`,
      runningHeader: `${docCode} · PRACTICAL LABORATORY PROCEDURE · PAGE 7 OF 10`,
      bodyParagraphs: [
        `Laboratory Scenario: ${practicalLab.scenario}`,
        `Required Tasks: ${practicalLab.requiredTasks.map((t, i) => `${i + 1}. ${t}`).join(" ")}`,
        `Required Submissions: ${practicalLab.submissionDeliverables.join("; ")}.`
      ],
      keyEquationOrSpec: `Lab Submission Artifacts: ${practicalLab.submissionDeliverables.join(" + ")}`,
      calloutBox: {
        title: "Controlled Sandbox & Safety Protocol",
        text: practicalLab.interactiveSimulatorHint
      },
      citations: references.map((r) => `${r.organization} Reference Standard`)
    },
    {
      pageNumber: 8,
      sectionTitle: `Professional Deliverable Specification: ${deliverableTitle}`,
      runningHeader: `${docCode} · DELIVERABLE ARTIFACT SPECIFICATION · PAGE 8 OF 10`,
      bodyParagraphs: [
        `Every learner completing Milestone ${milestoneNumber} produces a portfolio-ready deliverable: ${deliverableTitle}.`,
        `This artifact must include clear scope boundaries, quantitative calculations or reproducible test evidence, identified limitations, and actionable recommendations.`,
        `Deliverables are stored in the learner's Verified Skill Passport alongside assessment results and mentor review notes.`
      ],
      keyEquationOrSpec: `Deliverable Structure: Scope & Assumptions -> Technical Analysis -> Evidence/Calculations -> Risk Register -> Recommendations`,
      calloutBox: {
        title: "Portfolio & Employer Verification Value",
        text: `Employers and mentors evaluate your ability to produce clear, defensible documentation—not merely watch instructional videos.`
      },
      citations: references.map((r) => `${r.title} (${r.url})`)
    },
    {
      pageNumber: 9,
      sectionTitle: `Measurable Competency Rubric & Scoring Guide`,
      runningHeader: `${docCode} · COMPETENCY RUBRIC · PAGE 9 OF 10`,
      bodyParagraphs: rubric.map(
        (r) =>
          `Criterion [${r.criterion}] — Developing: ${r.developing} | Competent (Pass): ${r.competent} | Advanced: ${r.advanced}`
      ),
      keyEquationOrSpec: `Passing Standard: Competent or Advanced rating across all rubric criteria + >= 80% on Knowledge Assessment`,
      calloutBox: {
        title: "Rubric Classification Notice",
        text: `This competency rubric is a ConnectLn Studies platform evaluation standard designed to measure practical task execution; it is distinct from external statutory licensing or third-party certification exams.`
      },
      citations: references.map((r) => `${r.organization}`)
    },
    {
      pageNumber: 10,
      sectionTitle: `Workplace Application, Supervision Boundaries & Authoritative References`,
      runningHeader: `${docCode} · CAREER APPLICATION & REFERENCES · PAGE 10 OF 10`,
      bodyParagraphs: [
        `Workplace Application: In professional practice, the competencies developed in ${milestoneTitle} are applied within multidisciplinary project teams under formal change control, quality assurance, and safety governance.`,
        `Supervision & Regulatory Boundary: ${supervisionNote}`,
        `Primary Authoritative References: ${references.map((r) => `${r.title} (${r.organization}) — ${r.summary} [${r.url}]`).join(" | ")}`
      ],
      keyEquationOrSpec: `Next Progression Step: Advance to Milestone ${Math.min(milestoneNumber + 1, 9)} upon verified rubric sign-off.`,
      calloutBox: {
        title: "Authoritative Reference Library",
        text: references.map((r) => `${r.title}: ${r.url}`).join(" • ")
      },
      citations: references.map((r) => `${r.title} — ${r.url}`)
    }
  ]

  const fullMarkdown = pages
    .map(
      (p) =>
        `# Page ${p.pageNumber}: ${p.sectionTitle}\n*${p.runningHeader}*\n\n${p.bodyParagraphs.join("\n\n")}\n\n**Key Specification / Formula:** \`${p.keyEquationOrSpec}\`\n\n> **${p.calloutBox.title}:** ${p.calloutBox.text}\n`
    )
    .join("\n---\n\n")

  return { pages, fullMarkdown }
}

// ============================================================================
// 4. SIX PRIORITY FLAGSHIP PATHWAYS (WITH FULL VERBATIM MODULE 1 + MILESTONES 2-9)
// ============================================================================
export const PRIORITY_6_CAREER_PATHWAYS: PriorityCareerPathway[] = [
  // --------------------------------------------------------------------------
  // PATHWAY 1: APPLICATION PENETRATION TESTING
  // --------------------------------------------------------------------------
  {
    id: "pathway-1-app-pentest",
    priorityRank: 1,
    title: "Application Penetration Testing",
    categoryTitle: "Cybersecurity & Digital Defense",
    level: "Beginner to intermediate",
    suggestedDuration: "12 weeks",
    deliveryFormat: "Online lessons, controlled labs, and mentor review",
    bestLearningFormat: "Controlled labs and assessment reports",
    coverImage: "/images/connectln-studies/packet-soc-cover.jpg",
    capstoneSummary: "Assess an authorized sandbox application and produce a reproducible professional security report with remediation verification.",
    safetyOrRegulatoryNotice: "All security testing must be conducted strictly within authorized lab environments or under a signed Rules of Engagement (RoE) agreement. Passing criteria represent platform rubrics, not an industry certification standard.",
    principalReferences: [
      {
        title: "OWASP Web Security Testing Guide (WSTG)",
        organization: "OWASP Foundation",
        url: "https://owasp.org/www-project-web-security-testing-guide/",
        summary: "Principal methodology reference for web application security testing procedures, authorization verification, and reporting."
      },
      {
        title: "NIST NICE Workforce Framework for Cybersecurity",
        organization: "NIST",
        url: "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center",
        summary: "Workforce tasks, knowledge, and skill statements for vulnerability assessment and exploitation analysts."
      }
    ],
    milestones: [
      {
        milestoneNumber: 1,
        title: "Foundations of application security",
        summary: "How web applications work across client, web server, application layer, and database; authentication versus authorization; and the six-stage application testing lifecycle.",
        learningObjectives: [
          "Decompose a modern web application into client, web server, application layer, and database/external services.",
          "Distinguish authentication, authorization, session management, and accountability, and identify failure modes for each.",
          "Execute the 6-stage application testing lifecycle starting with explicit scope definition.",
          "Construct a complete application inventory, role authorization matrix, and prioritized security test plan."
        ],
        lessons: [
          {
            lessonNumber: "Lesson 1.1",
            title: "How web applications work",
            paragraphs: [
              "A web application is a system through which users interact with services over a network. A typical application has four main components:",
              "• Client: the browser or mobile application that sends requests.\n• Web server: receives requests and routes them to application logic.\n• Application layer: processes business rules, authentication, authorization, and data operations.\n• Database and external services: store information and provide functions such as payments, email, or identity verification.",
              "For example, when a user signs in to an online banking application, the browser sends credentials over an encrypted connection. The application verifies the credentials, establishes a session, and determines which accounts the user is allowed to access.",
              "Security testing must examine more than whether the login page works. It must also determine whether the application correctly enforces permissions, protects sensitive data, validates input, and handles errors."
            ],
            calloutNote: "Security testing examines whether permissions, sensitive data protection, input validation, and error handling hold across every request."
          },
          {
            lessonNumber: "Lesson 1.2",
            title: "Authentication versus authorization",
            paragraphs: [
              "These concepts are related but fundamentally different.",
              "A valid login does not prove that the application is secure. Authorization must be checked at each protected operation, on the server side, against the user's identity, role, and resource permissions."
            ],
            table: {
              headers: ["Concept", "Question answered", "Example failure"],
              rows: [
                ["Authentication", "Who are you?", "An attacker can sign in as another user."],
                ["Authorization", "What are you allowed to do?", "A normal user can access an administrator function."],
                ["Session management", "Which authenticated interaction is this?", "A stolen or improperly invalidated session remains usable."],
                ["Accountability", "What actions occurred, and when?", "Security-relevant activity cannot be reconstructed."]
              ]
            },
            calloutNote: "Authorization must be enforced on the server side at every protected operation against the user's identity, role, and resource ownership."
          },
          {
            lessonNumber: "Lesson 1.3",
            title: "The application testing lifecycle",
            paragraphs: [
              "Professional application security assessments follow a disciplined six-stage lifecycle to ensure safety, authorization, and reproducibility:"
            ],
            orderedSteps: [
              "Define scope. Identify approved hosts, applications, test accounts, excluded systems, and permitted testing methods.",
              "Map the application. Document endpoints, roles, input fields, APIs, trust boundaries, and sensitive data flows.",
              "Identify candidate weaknesses. Combine source-code review, configuration review, automated scanner results, and manual testing.",
              "Validate findings safely. Reproduce suspected weaknesses using controlled, minimal-impact tests.",
              "Assess impact. Establish what an attacker could actually access or change, and distinguish demonstrated impact from hypothetical impact.",
              "Report and retest. Provide reproducible evidence, remediation advice, and verification results."
            ]
          }
        ],
        workedExample: {
          title: "Server-Side Authorization Bypass (IDOR / BOLA) Analysis",
          problemStatement: "An online banking portal authenticates user 'alice_retail' (Role: Standard Customer, Account #10042). When viewing statements, the browser sends GET /api/v2/statements?account_id=10042 with a valid session cookie. How do you test whether authorization is properly enforced without exposing sensitive customer data?",
          stepByStepSolution: [
            "1. Verify Scope & Test Accounts: Confirm that two dedicated sandbox test accounts (Account #10042 owned by Test User A and Account #10043 owned by Test User B) are provisioned in the Rules of Engagement.",
            "2. Capture Baseline Authenticated Request: Authenticate as Test User A (#10042) and record the HTTP GET request to /api/v2/statements?account_id=10042.",
            "3. Controlled Parameter Substitution: Replay the request using Test User A's session token while modifying account_id=10043 (belonging to Test User B, a controlled test account).",
            "4. Evaluate Server Response: If the server returns HTTP 200 OK with Test User B's statement metadata instead of HTTP 403 Forbidden, server-side object-level authorization is missing.",
            "5. Document Minimal-Impact Evidence: Record the HTTP request/response headers and synthetic test account identifiers without extracting real customer PII."
          ],
          engineeringConclusion: "Authentication succeeded (the session cookie was valid), but Authorization failed because the server did not verify that the authenticated identity owned resource #10043."
        },
        practicalLab: {
          title: "Practical lab 1 — Build an application inventory",
          scenario: "You are provided a deliberately vulnerable training application in a purpose-built sandbox. Before running any active exploit payloads, you must map the application's attack surface and authorization boundaries.",
          requiredTasks: [
            "Document three user roles and their permissions (e.g., Unauthenticated Guest, Standard Member, System Administrator).",
            "Catalog ten application routes or API endpoints across web and REST/GraphQL interfaces.",
            "Identify the sensitive information handled by each endpoint (credentials, session tokens, financial records, PII).",
            "Specify the expected server-side authorization rule for each operation.",
            "Design five controlled security tests and their expected secure vs. vulnerable results."
          ],
          submissionDeliverables: [
            "Application Inventory Table (10 Endpoints)",
            "Role-to-Endpoint Authorization Matrix (3 Roles)",
            "Prioritized 5-Test Validation Plan"
          ],
          interactiveSimulatorHint: "Use the OWASP WSTG Information Gathering & Configuration Management checklist to structure your endpoint inventory."
        },
        assessmentQuestions: [
          {
            id: "p1-m1-q1",
            prompt: "Why does a successful login not guarantee authorization is working?",
            options: [
              "Because login only establishes authentication ('Who are you?'), whereas authorization ('What are you allowed to do?') must be checked independently on the server side at each protected operation.",
              "Because login pages only work over HTTP and never use TLS encryption.",
              "Because databases automatically grant administrator privileges to all logged-in users.",
              "Because session cookies cannot be sent after the initial login request."
            ],
            correctIndex: 0,
            modelAnswerExplanation: "Authentication verifies identity, while authorization enforces resource and role permissions on every subsequent server-side request."
          },
          {
            id: "p1-m1-q2",
            prompt: "What is the difference between a suspected vulnerability and a validated finding?",
            options: [
              "A suspected vulnerability is any port that is open; a validated finding is any closed port.",
              "A suspected vulnerability is a candidate weakness flagged by code review or a scanner; a validated finding has been safely reproduced in a controlled test with demonstrated impact.",
              "There is no difference; all automated scanner alerts are validated findings.",
              "A suspected vulnerability requires no evidence, whereas a validated finding is based on guesswork."
            ],
            correctIndex: 1,
            modelAnswerExplanation: "Automated scanners produce candidate weaknesses (often including false positives). Validation requires safe, controlled reproduction and impact verification."
          },
          {
            id: "p1-m1-q3",
            prompt: "Why should a penetration tester define the scope before running tools?",
            options: [
              "To ensure tests only target authorized hosts and accounts using permitted methods, preventing accidental disruption or unlawful access to excluded systems.",
              "To make automated scanners run faster by skipping DNS resolution.",
              "Because scope definition replaces the need for a final security report.",
              "So that developers can disable all logging during the assessment."
            ],
            correctIndex: 0,
            modelAnswerExplanation: "Defining scope establishes legal and operational boundaries—approved hosts, test accounts, excluded production systems, and permitted testing methods."
          },
          {
            id: "p1-m1-q4",
            prompt: "What evidence should be collected to support a finding without unnecessarily exposing personal data?",
            options: [
              "Download the entire production customer database to prove access.",
              "Collect sanitized HTTP request/response pairs, timestamps, and synthetic test-account proofs (or redacted metadata) that demonstrate the flaw reproducibly without exfiltrating real PII.",
              "Only take a verbal note with no technical logs or HTTP requests.",
              "Publish customer credit card numbers in the executive summary."
            ],
            correctIndex: 1,
            modelAnswerExplanation: "Controlled minimal-impact testing uses dedicated test accounts or redacted headers/metadata to prove reproducibility without exposing real personal data."
          }
        ],
        passingCriterionNote: "Passing criterion: 80% on the knowledge check and successful completion of the application inventory. This is a proposed platform rubric, not an industry certification standard.",
        professionalDeliverable: {
          title: "Application Attack Surface Inventory & Authorization Matrix",
          format: "Markdown / PDF Technical Report Artifact",
          templateMarkdown: `# Application Security Inventory & Authorization Matrix\n\n## 1. Scope & Authorized Test Accounts\n- Target Sandbox Environment: \`https://sandbox-bank.connectln.internal\`\n- Roles Tested: Guest, Standard Customer, Administrator\n\n## 2. Ten-Endpoint Inventory & Data Classification\n| # | Endpoint / Route | Method | Sensitive Data Handled | Expected Server-Side Auth Rule |\n|---|---|---|---|---|\n| 1 | \`/api/v1/auth/login\` | POST | Password Hash / Session Token | Public (Rate-Limited) |\n| 2 | \`/api/v1/accounts/{id}/statements\` | GET | Financial Statements (PII) | Authenticated + Owner Match (\`user.id == account.owner_id\`) |\n| 3 | \`/api/v1/admin/users\` | GET/POST | All User Records & Roles | Authenticated + Role == \`ADMIN\` |\n\n## 3. Five Prioritized Security Validation Tests\n1. **BOLA/IDOR on Statement Retrieval**: Substitute \`{id}\` across two sandbox test accounts.\n2. **Vertical Privilege Escalation**: Invoke \`/api/v1/admin/users\` using a Standard Customer session token.\n3. **Session Invalidation Check**: Replay session token after explicit \`POST /api/v1/auth/logout\`.\n4. **Unauthenticated Direct Route Access**: Request protected API routes with no \`Authorization\` header.\n5. **Verbose Error Handling Inspection**: Submit malformed JSON to inspect stack trace leakage.\n`
        },
        competencyRubric: [
          {
            criterion: "Application Decomposition & Endpoint Inventory",
            developing: "Lists fewer than 10 endpoints or omits sensitive data classifications.",
            competent: "Accurately documents all 10 endpoints, 3 user roles, sensitive data types, and trust boundaries.",
            advanced: "Includes complete API parameter schemas, state transitions, and downstream microservice dependencies."
          },
          {
            criterion: "Authorization Matrix Accuracy",
            developing: "Confuses authentication (login) with object-level or role-level authorization.",
            competent: "Clearly specifies server-side identity, role, and ownership rules for every operation.",
            advanced: "Identifies horizontal (IDOR/BOLA) and vertical privilege escalation test vectors for each endpoint."
          },
          {
            criterion: "Controlled Test Plan & Scope Hygiene",
            developing: "Proposes disruptive tests or fails to use dedicated test accounts.",
            competent: "Designs 5 safe, minimal-impact validation tests with clear expected results and PII protection.",
            advanced: "Maps every test directly to OWASP WSTG test IDs with reproducible curl/HTTP templates."
          }
        ],
        careerApplication: {
          workplaceUsage: "Used at the kickoff of every web application penetration test, bug bounty triage, and pre-release security architecture review.",
          supervisionAndLicensingNote: "Application penetration testing against non-sandbox systems requires explicit written authorization from the system owner."
        },
        ...(() => {
          const g = buildTenPageTechnicalGuide(
            "Application Penetration Testing",
            1,
            "Foundations of application security",
            "How web applications work, authentication vs. authorization, and the 6-stage application testing lifecycle.",
            [
              "Decompose web applications into client, web server, application layer, and database/external services",
              "Differentiate authentication, authorization, session management, and accountability",
              "Apply the 6-stage application testing lifecycle",
              "Build an application inventory and authorization matrix"
            ],
            [],
            {
              title: "Server-Side Authorization Bypass (IDOR / BOLA) Analysis",
              problemStatement: "Verify whether GET /api/v2/statements?account_id=10042 enforces object-level authorization.",
              stepByStepSolution: [
                "Provision two sandbox test accounts (#10042 and #10043).",
                "Capture baseline request as User A (#10042).",
                "Replay with User A's session token against #10043.",
                "Verify whether server returns HTTP 403 Forbidden or leaks User B's test record."
              ],
              engineeringConclusion: "Authorization must be verified on the server side at each protected operation."
            },
            {
              title: "Practical lab 1 — Build an application inventory",
              scenario: "Document 3 roles, 10 endpoints, sensitive data handled, expected authorization rules, and 5 security tests.",
              requiredTasks: ["Document 3 roles", "Map 10 endpoints", "Define expected auth rules", "Design 5 safe validation tests"],
              submissionDeliverables: ["Application inventory", "Authorization matrix", "Prioritized test plan"],
              interactiveSimulatorHint: "Never test outside approved sandbox scope."
            },
            [
              {
                criterion: "Inventory & Authorization Matrix",
                developing: "Incomplete mapping",
                competent: "10 endpoints + 3 roles + 5 tests accurately documented",
                advanced: "Full OWASP WSTG alignment"
              }
            ],
            "Application Inventory & Authorization Matrix",
            "Passing criterion is a proposed platform rubric (80% quiz + inventory), not an industry certification standard.",
            [
              {
                title: "OWASP Web Security Testing Guide (WSTG)",
                organization: "OWASP",
                url: "https://owasp.org/www-project-web-security-testing-guide/",
                summary: "Comprehensive web application security testing framework."
              }
            ]
          )
          return { whitePaperPages: g.pages, whitePaperFullMarkdown: g.fullMarkdown }
        })()
      },
      ...[
        { num: 2, title: "HTTP, APIs, cookies, tokens, sessions, and application mapping", focus: "Inspect HTTP request/response state mechanisms, cookie flags (HttpOnly, Secure, SameSite), JWT claims verification, and comprehensive API endpoint enumeration." },
        { num: 3, title: "Input validation, injection risks, and secure data handling", focus: "Identify and safely validate SQL injection, command injection, stored/reflected XSS, and parameterized query defenses." },
        { num: 4, title: "Broken access control and identity testing", focus: "Test horizontal (BOLA/IDOR) and vertical privilege escalation, multi-tenant isolation, and session fixation/invalidation weaknesses." },
        { num: 5, title: "Business logic and workflow abuse", focus: "Analyze multi-step checkout, state-machine skipping, race conditions (TOCTOU), and negative quantity/price manipulation." },
        { num: 6, title: "Source-code review and SAST finding validation", focus: "Correlate static application security testing (SAST) alerts with manual source-to-sink taint tracing and dynamic sandbox reproduction." },
        { num: 7, title: "API security, file handling, and configuration weaknesses", focus: "Assess REST/GraphQL rate limiting, mass assignment, unrestricted file uploads, path traversal, and CORS/CSP misconfigurations." },
        { num: 8, title: "Risk scoring, evidence, remediation, and retesting", focus: "Calculate contextual CVSS / business risk scores, assemble sanitized proof-of-concept evidence, write actionable remediation guidance, and verify patches." },
        { num: 9, title: "Capstone: assess an authorized sandbox and produce a professional report", focus: "Execute a complete end-to-end assessment against an authorized multi-role web application sandbox and defend your findings before a review panel." }
      ].map((m) => {
        const g = buildTenPageTechnicalGuide(
          "Application Penetration Testing",
          m.num,
          m.title,
          m.focus,
          [
            `Master the core technical principles of ${m.title}`,
            `Execute controlled validation tests in the OWASP WSTG sandbox`,
            `Produce reproducible evidence and remediation guidance for ${m.title}`
          ],
          [
            {
              lessonNumber: `Lesson ${m.num}.1`,
              title: m.title,
              paragraphs: [m.focus, "Every candidate weakness must be validated safely using minimal-impact proofs within the authorized lab scope."]
            }
          ],
          {
            title: `${m.title} — Controlled Sandbox Validation`,
            problemStatement: `How do you systematically test and document findings for ${m.title} in an authorized environment?`,
            stepByStepSolution: [
              "1. Review authorized scope and baseline application behavior.",
              "2. Formulate a testable security hypothesis mapped to OWASP WSTG.",
              "3. Execute minimal-impact validation using dedicated sandbox test accounts.",
              "4. Record reproducible HTTP evidence and specify root-cause remediation."
            ],
            engineeringConclusion: "Validated findings distinguish demonstrated impact from theoretical scanner noise."
          },
          {
            title: `Practical Lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: [
              `Map the target components relevant to ${m.title}.`,
              "Execute controlled validation tests using two role accounts.",
              "Document reproducible evidence and remediation steps."
            ],
            submissionDeliverables: [`Milestone ${m.num} Technical Lab Report`, "Sanitized HTTP Evidence Log", "Remediation Verification Checklist"],
            interactiveSimulatorHint: "Consult the OWASP Web Security Testing Guide (WSTG) section corresponding to this milestone."
          },
          [
            {
              criterion: `${m.title} Execution & Reporting`,
              developing: "Relies on unverified scanner output without manual validation.",
              competent: "Safely validates findings with reproducible evidence and clear remediation advice.",
              advanced: "Provides root-cause code fixes and regression test specifications."
            }
          ],
          `Milestone ${m.num} Security Assessment Deliverable`,
          "All testing must remain within authorized sandbox boundaries.",
          [
            {
              title: "OWASP Web Security Testing Guide (WSTG)",
              organization: "OWASP",
              url: "https://owasp.org/www-project-web-security-testing-guide/",
              summary: "Principal methodology reference for web application security testing."
            }
          ]
        )
        return {
          milestoneNumber: m.num,
          title: m.title,
          summary: m.focus,
          learningObjectives: [
            `Understand and apply ${m.title} methodology.`,
            `Validate candidate weaknesses safely in an authorized sandbox.`,
            `Produce a professional deliverable with remediation verification.`
          ],
          lessons: [
            {
              lessonNumber: `Lesson ${m.num}.1`,
              title: `Core Methodology: ${m.title}`,
              paragraphs: [
                m.focus,
                "In accordance with the OWASP Web Security Testing Guide, testers combine configuration inspection, code review, and controlled manual requests to confirm whether controls hold under adversarial input."
              ]
            }
          ],
          workedExample: {
            title: `Worked Example — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: [
              "1. Establish baseline HTTP traffic with an authorized test account.",
              "2. Modify target parameters or tokens within sandbox boundaries.",
              "3. Compare server response codes, body lengths, and state changes.",
              "4. Formulate defense-in-depth remediation and regression tests."
            ],
            engineeringConclusion: "Reproducible evidence and server-side root-cause fixes are required for sign-off."
          },
          practicalLab: {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: [
              "Identify target endpoints and trust boundaries.",
              "Run controlled validation tests and capture sanitized HTTP traces.",
              "Write remediation guidance and retest verification procedures."
            ],
            submissionDeliverables: [`Milestone ${m.num} Assessment Artifact`, "Reproducible PoC Trace", "Remediation Plan"],
            interactiveSimulatorHint: "Reference OWASP WSTG for standardized test case identifiers."
          },
          assessmentQuestions: [
            {
              id: `p1-m${m.num}-q1`,
              prompt: `When conducting ${m.title}, what distinguishes a validated finding from a theoretical risk?`,
              options: [
                "Controlled, reproducible evidence demonstrating actual impact within the authorized test environment.",
                "An unverified warning banner from an automated port scanner.",
                "Assuming that all inputs are vulnerable without sending test requests.",
                "Modifying production data without authorization."
              ],
              correctIndex: 0,
              modelAnswerExplanation: "Validated findings require safe, controlled reproduction that demonstrates actual impact."
            }
          ],
          passingCriterionNote: "Passing criterion: 80% on the knowledge check and successful completion of the practical lab deliverable.",
          professionalDeliverable: {
            title: `Milestone ${m.num} Deliverable — ${m.title} Report`,
            format: "Markdown / PDF Security Deliverable",
            templateMarkdown: `# Milestone ${m.num}: ${m.title}\n\n## 1. Test Scope & Methodology\n- Reference Standard: OWASP WSTG\n- Focus Area: ${m.focus}\n\n## 2. Validated Findings & Sanitized Evidence\n- Request / Response Proof:\n- Demonstrated Impact:\n\n## 3. Remediation & Retest Plan\n- Root-Cause Fix:\n- Verification Procedure:\n`
          },
          competencyRubric: [
            {
              criterion: "Technical Validation & Evidence Quality",
              developing: "Incomplete evidence or unverified scanner claims.",
              competent: "Reproducible, sanitized evidence with accurate impact assessment and remediation.",
              advanced: "Includes patch code diff and automated regression test."
            }
          ],
          careerApplication: {
            workplaceUsage: `Applied directly during commercial web/API penetration tests and red-team engagements.`,
            supervisionAndLicensingNote: "Always operate under signed Rules of Engagement (RoE)."
          },
          whitePaperPages: g.pages,
          whitePaperFullMarkdown: g.fullMarkdown
        }
      })
    ]
  },

  // --------------------------------------------------------------------------
  // PATHWAY 2: AI AND LLM ENGINEERING
  // --------------------------------------------------------------------------
  {
    id: "pathway-2-ai-llm-eng",
    priorityRank: 2,
    title: "AI and LLM Engineering",
    categoryTitle: "AI, Software & Data Engineering",
    level: "Beginner to intermediate",
    suggestedDuration: "12 weeks",
    deliveryFormat: "Coding projects and model evaluation",
    bestLearningFormat: "Projects, coding exercises, deployed applications",
    coverImage: "/images/connectln-studies/ai-studies-cover.jpg",
    capstoneSummary: "Deploy a documented knowledge assistant with a full retrieval and groundedness evaluation suite.",
    safetyOrRegulatoryNotice: "LLMs estimate token probabilities and do not automatically guarantee truth. Production AI systems must enforce document access controls during retrieval and evaluate groundedness, correctness, and safety continuously.",
    principalReferences: [
      {
        title: "NIST AI Risk Management Framework (AI RMF 1.0)",
        organization: "NIST",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        summary: "Framework for managing AI risks across Govern, Map, Measure, and Manage functions throughout design, development, use, and evaluation."
      },
      {
        title: "NIST Generative AI Profile (NIST AI 600-1)",
        organization: "NIST",
        url: "https://www.nist.gov/itl/ai-risk-management-framework/ai-risk-management-framework-resources",
        summary: "Generative-AI risk considerations including confabulation/hallucination, data privacy, information integrity, and value-chain security."
      }
    ],
    milestones: [
      {
        milestoneNumber: 1,
        title: "Understanding how AI applications work",
        summary: "How large language models process and generate token sequences, the 6 main components of an AI application, Retrieval-Augmented Generation (RAG), and measuring answer quality across 6 dimensions.",
        learningObjectives: [
          "Explain how an LLM estimates next-token probability distributions conditioned on context and why confident confabulations occur.",
          "Architect the 6 main components of a production AI application with security checks throughout the request lifecycle.",
          "Implement an 8-stage Retrieval-Augmented Generation (RAG) pipeline with source citations.",
          "Evaluate an AI assistant across retrieval quality, groundedness, correctness, completeness, safety, and latency/cost."
        ],
        lessons: [
          {
            lessonNumber: "Lesson 1.1",
            title: "What is a large language model?",
            paragraphs: [
              "A large language model (LLM) is a machine-learning model trained to process and generate sequences of tokens. A token may represent a word, part of a word, punctuation, or another text unit.",
              "During generation, the model estimates a distribution over possible next tokens, conditioned on the context it has received. The selected token is appended to the context, and the process repeats.",
              "The model does not automatically know whether every generated statement is true. A well-designed AI application must therefore combine generation with relevant source material, validation, evaluation, and appropriate safeguards."
            ],
            calloutNote: "Because LLMs predict token sequences probabilistically rather than querying a verified truth table, applications must pair generation with retrieval, validation, and safeguards."
          },
          {
            lessonNumber: "Lesson 1.2",
            title: "The main components of an AI application",
            paragraphs: [
              "This architecture is a useful starting point for Vibe's AI assistant. In production, retrieval is optional for some tasks, and security checks should apply throughout the request lifecycle—not only at the final response."
            ],
            table: {
              headers: ["Component", "Primary Function & Responsibility"],
              rows: [
                ["User interface", "Question, uploaded document, or task"],
                ["Application orchestration", "Authentication, permissions, prompt construction"],
                ["LLM", "Reasoning and generation"],
                ["Retrieval", "Documents and knowledge sources"],
                ["Validation and evaluation", "Source checks, permissions, tests, and safety controls"],
                ["Grounded response", "Answer with supporting references and limitations"]
              ]
            }
          },
          {
            lessonNumber: "Lesson 1.3",
            title: "Retrieval-Augmented Generation (RAG)",
            paragraphs: [
              "RAG combines a language model with an external information retrieval system. A typical RAG pipeline works as follows:",
              "Example: A learner asks Vibe, “What are the prerequisites for this cloud security course?” Instead of inventing an answer, the system retrieves the course's approved prerequisite document and answers from that material.",
              "Retrieval improves access to relevant information, but it does not guarantee truth. Documents can be outdated, retrieval can miss important passages, and models can misinterpret source content."
            ],
            orderedSteps: [
              "Collect approved documents and extract their text.",
              "Split documents into meaningful passages.",
              "Convert passages into vector embeddings.",
              "Store the vectors and associated metadata in a searchable index.",
              "Retrieve passages relevant to a user's question.",
              "Give the retrieved passages to the model as context.",
              "Generate an answer and connect its claims to the supporting sources.",
              "Evaluate whether the answer is relevant, accurate, and supported."
            ]
          },
          {
            lessonNumber: "Lesson 1.4",
            title: "Measuring answer quality",
            paragraphs: [
              "Teach learners to evaluate AI applications on separate dimensions:"
            ],
            bulletPoints: [
              "Retrieval quality: Did the system retrieve the right material?",
              "Groundedness: Are claims supported by the retrieved material?",
              "Correctness: Is the answer factually correct?",
              "Completeness: Does it address the entire question?",
              "Safety: Does it respect access controls and prevent harmful behavior?",
              "Latency and cost: Is the system efficient enough for its intended use?"
            ]
          }
        ],
        workedExample: {
          title: "RAG Chunking, Permission Filtering & Abstention Evaluation",
          problemStatement: "A corpus of 20 approved training documents contains 18 public course syllabi and 2 instructor-only grading keys. A student asks: (A) 'What is the passing score for Module 1?' and (B) 'What is the instructor's private home address?' Walk through how the RAG pipeline processes both queries safely.",
          stepByStepSolution: [
            "1. Ingestion & Metadata Tagging: Split the 20 documents into 400-token passages with 50-token overlap. Attach metadata `access_role: 'student'` to the 18 syllabi and `access_role: 'instructor'` to the 2 grading keys.",
            "2. Pre-Retrieval Permission Filter: When the student's request arrives, application orchestration enforces `WHERE access_role == 'student'` at the vector index query layer before similarity search.",
            "3. Query A Execution (Answerable): Top-3 passages from the Module 1 syllabus are retrieved (`score = 0.89`). The LLM generates: 'The passing criterion is 80% on the knowledge check and completion of the inventory [Source: Module 1 Syllabus, §Assessment].'",
            "4. Query B Execution (Unanswerable / Out-of-Corpus): Vector search returns low-similarity passages (`max_score = 0.21`). The system prompt instructs the model to abstain when retrieved passages do not contain the answer: 'I cannot answer this question from the approved course documentation.'"
          ],
          engineeringConclusion: "Enforcing metadata permissions during retrieval prevents unauthorized data leakage, while explicit abstention logic prevents hallucination on unanswerable queries."
        },
        practicalLab: {
          title: "Practical lab 1 — Build a small RAG assistant",
          scenario: "You are provided a set of 20 approved training documents. Create a RAG assistant that answers learner questions strictly using those documents and abstains when the corpus does not contain the answer.",
          requiredTasks: [
            "Build a document ingestion and passage chunking pipeline for the 20 approved documents.",
            "Implement search or vector retrieval with document metadata preservation.",
            "Implement answer generation that connects every claim to supporting source citations.",
            "Construct an evaluation test set of at least 30 questions, explicitly including unanswerable questions.",
            "Record quantitative evaluation results across retrieval quality, groundedness, correctness, and failed-answer analysis."
          ],
          submissionDeliverables: [
            "Ingestion & Retrieval Pipeline Code",
            "30-Question Evaluation Dataset (with Answerable & Unanswerable Splits)",
            "Evaluation Report & Failure-Mode Analysis"
          ],
          interactiveSimulatorHint: "Consult the NIST AI Risk Management Framework (Measure function) when documenting your 30-question evaluation benchmark."
        },
        assessmentQuestions: [
          {
            id: "p2-m1-q1",
            prompt: "Why can an LLM give a confident but incorrect answer?",
            options: [
              "Because an LLM generates text by estimating probability distributions over next tokens based on context rather than verifying factual truth against an authoritative source.",
              "Because LLMs intentionally lie whenever a user asks a technical question.",
              "Because vector databases corrupt all text into random numbers.",
              "Because Python APIs strip out punctuation."
            ],
            correctIndex: 0,
            modelAnswerExplanation: "LLMs are probabilistic next-token predictors; plausible-sounding token sequences can be statistically likely even when factually false."
          },
          {
            id: "p2-m1-q2",
            prompt: "What is the difference between embeddings and generated text?",
            options: [
              "Embeddings are numerical vector representations of text passages used for semantic similarity search, whereas generated text is the sequence of tokens produced by the LLM as an output response.",
              "Embeddings are HTML files, whereas generated text is a SQL database.",
              "There is no difference; embeddings are shown directly to the end user as the final answer.",
              "Generated text is stored in the vector index before chunking."
            ],
            correctIndex: 0,
            modelAnswerExplanation: "Embeddings map semantic meaning into dense numerical vectors for retrieval; generated text is the natural-language output synthesized by the language model."
          },
          {
            id: "p2-m1-q3",
            prompt: "What should an AI assistant do when its knowledge base does not contain the answer?",
            options: [
              "Guess the most creative answer possible without mentioning any uncertainty.",
              "Clearly state that the approved knowledge base does not contain the information (abstain) rather than fabricating an unsupported claim.",
              "Disable authentication checks and search restricted administrator files.",
              "Return an empty HTTP 500 crash page."
            ],
            correctIndex: 1,
            modelAnswerExplanation: "Grounded AI assistants must abstain or state their source limitations when retrieved passages do not support an answer."
          },
          {
            id: "p2-m1-q4",
            prompt: "Why must document permissions be enforced during retrieval?",
            options: [
              "Because if restricted passages are retrieved into the LLM's context window, the model may include confidential information in its generated response even if the user lacks permission to view the source file.",
              "To make vector embeddings have fewer dimensions.",
              "Because LLMs cannot read English text without permission headers.",
              "Document permissions only matter after the user logs out."
            ],
            correctIndex: 0,
            modelAnswerExplanation: "Once unauthorized text enters the prompt context, the LLM cannot reliably enforce ACLs; access control must filter documents at the retrieval query stage."
          }
        ],
        passingCriterionNote: "Passing criterion: working prototype, documented evaluation across 30+ test questions, and correct handling of questions that cannot be answered from the source collection.",
        professionalDeliverable: {
          title: "RAG Knowledge Assistant Prototype & 30-Question Evaluation Suite",
          format: "Repository + Evaluation Report (Markdown/JSON)",
          templateMarkdown: `# RAG Assistant Evaluation Report\n\n## 1. Pipeline Architecture\n- Corpus: 20 Approved ConnectLn Training Documents\n- Chunking Strategy: 400 tokens, 50-token overlap, section-header aware\n- Permission Enforcement: Pre-retrieval ACL metadata filter\n\n## 2. 30-Question Benchmark Summary\n| Metric Dimension | Score (%) | Notes |\n|---|---|---|\n| Retrieval Recall@5 | 93.3% | 28/30 relevant passages retrieved |\n| Groundedness | 96.7% | Claims linked to [DocID, Section] |\n| Unanswerable Abstention Rate | 100.0% | 8/8 out-of-scope queries properly abstained |\n\n## 3. Documented Failure Examples & Mitigations\n- **Failure Case #14**: Multi-table comparison truncated across chunk boundary -> Fixed by keeping markdown tables intact during chunking.\n`
        },
        competencyRubric: [
          {
            criterion: "Ingestion, Chunking & Retrieval Implementation",
            developing: "Splits text arbitrarily mid-sentence or omits document metadata.",
            competent: "Preserves passage semantics and document metadata; retrieves relevant context with citations.",
            advanced: "Implements hybrid (BM25 + dense vector) retrieval with pre-query ACL permission filtering."
          },
          {
            criterion: "30-Question Evaluation & Unanswerable Handling",
            developing: "Tests fewer than 30 questions or hallucinates on unanswerable queries.",
            competent: "Evaluates >= 30 questions including unanswerable queries; documents failed answers transparently.",
            advanced: "Automates evaluation metrics for retrieval recall, groundedness, correctness, and latency."
          }
        ],
        careerApplication: {
          workplaceUsage: "Core architecture for enterprise knowledge assistants, technical documentation copilots, and customer support RAG systems.",
          supervisionAndLicensingNote: "Align production deployments with the NIST AI Risk Management Framework (AI RMF 1.0) and Generative AI Profile (NIST AI 600-1)."
        },
        ...(() => {
          const g = buildTenPageTechnicalGuide(
            "AI and LLM Engineering",
            1,
            "Understanding how AI applications work",
            "LLM token generation, the 6 main components of an AI application, RAG pipelines, and 6-dimension evaluation.",
            [
              "Understand probabilistic token generation in LLMs",
              "Design the 6 components of an AI application",
              "Build an 8-stage RAG pipeline with citations",
              "Evaluate retrieval quality, groundedness, correctness, completeness, safety, and latency/cost"
            ],
            [],
            {
              title: "RAG Permission Filtering & Unanswerable Abstention",
              problemStatement: "Ensure a 20-document RAG assistant enforces role permissions during retrieval and abstains on out-of-scope questions.",
              stepByStepSolution: [
                "Chunk documents with role metadata.",
                "Filter retrieval queries by authenticated user permissions.",
                "Require source citations for every generated claim.",
                "Abstain when retrieval similarity or source coverage is insufficient."
              ],
              engineeringConclusion: "RAG improves access to relevant documents but requires continuous evaluation and ACL enforcement."
            },
            {
              title: "Practical lab 1 — Build a small RAG assistant",
              scenario: "Ingest 20 approved documents, implement vector retrieval + citations, and evaluate on 30+ questions including unanswerable prompts.",
              requiredTasks: ["Ingestion & chunking", "Vector retrieval", "Cited generation", "30-question evaluation + failure analysis"],
              submissionDeliverables: ["RAG Prototype", "30-Question Test Suite", "Evaluation & Failure Report"],
              interactiveSimulatorHint: "Use NIST AI RMF 1.0 Measure guidelines."
            },
            [
              {
                criterion: "RAG Prototype & Evaluation",
                developing: "Hallucinates on unanswerable questions",
                competent: "Working RAG pipeline with citations and 30-question evaluation",
                advanced: "Automated groundedness and ACL verification"
              }
            ],
            "RAG Prototype & 30-Question Evaluation Report",
            "Align AI risk management with NIST AI RMF 1.0 and NIST Generative AI Profile.",
            [
              {
                title: "NIST AI Risk Management Framework",
                organization: "NIST",
                url: "https://www.nist.gov/itl/ai-risk-management-framework",
                summary: "Resource for managing AI risks throughout design, development, use, and evaluation."
              }
            ]
          )
          return { whitePaperPages: g.pages, whitePaperFullMarkdown: g.fullMarkdown }
        })()
      },
      ...[
        { num: 2, title: "Python, APIs, JSON, and model inference", focus: "Build typed Python inference clients, structured JSON schema outputs, retry/backoff resilience, and streaming token handlers." },
        { num: 3, title: "Tokenization, embeddings, and semantic search", focus: "Analyze BPE tokenization, cosine similarity vs. dot-product distance, embedding model selection, and lexical vs. semantic retrieval trade-offs." },
        { num: 4, title: "Document ingestion, chunking, and vector databases", focus: "Parse PDFs/Markdown/tables, design structure-aware chunking strategies, and index vectors with HNSW/IVF metadata filtering." },
        { num: 5, title: "RAG pipelines, citations, and retrieval evaluation", focus: "Implement cross-encoder reranking, inline citation verification, Recall@K / MRR metrics, and unanswerable query abstention." },
        { num: 6, title: "Tool calling and AI workflow orchestration", focus: "Build deterministic tool-calling schemas, Model Context Protocol (MCP) integrations, state graphs, and human-in-the-loop approval gates." },
        { num: 7, title: "Authentication, prompt injection, privacy, and access control", focus: "Defend against direct and indirect prompt injection, enforce document-level ACLs at retrieval, redact PII, and validate tool arguments." },
        { num: 8, title: "Evaluation, monitoring, latency, and cost optimization", focus: "Instrument token budgets, semantic caching, TTFT (Time to First Token) telemetry, drift detection, and regression evaluation harnesses." },
        { num: 9, title: "Capstone: deploy a documented knowledge assistant with an evaluation suite", focus: "Build, test, deploy, monitor, and document a production-grade RAG knowledge assistant with a comprehensive evaluation and safety report." }
      ].map((m) => {
        const g = buildTenPageTechnicalGuide(
          "AI and LLM Engineering",
          m.num,
          m.title,
          m.focus,
          [`Master ${m.title}`, "Build tested code artifacts", "Evaluate quality and safety using NIST AI RMF principles"],
          [{ lessonNumber: `Lesson ${m.num}.1`, title: m.title, paragraphs: [m.focus] }],
          {
            title: `Worked Example — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: ["1. Define input/output schemas.", "2. Implement modular pipeline stage.", "3. Run quantitative benchmark.", "4. Document failure modes and mitigations."],
            engineeringConclusion: "Every AI pipeline stage must be measured on accuracy, groundedness, safety, and latency."
          },
          {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: ["Implement module code", "Run evaluation suite", "Document failure cases"],
            submissionDeliverables: [`Milestone ${m.num} Code & Evaluation Artifact`],
            interactiveSimulatorHint: "Reference NIST AI RMF 1.0 and Generative AI Profile."
          },
          [{ criterion: m.title, developing: "Untested code", competent: "Working implementation with evaluation metrics", advanced: "Production-hardened with safety guardrails" }],
          `Milestone ${m.num} Engineering Deliverable`,
          "Follow NIST AI RMF 1.0 risk management practices.",
          [{ title: "NIST AI RMF", organization: "NIST", url: "https://www.nist.gov/itl/ai-risk-management-framework", summary: "AI risk management standard." }]
        )
        return {
          milestoneNumber: m.num,
          title: m.title,
          summary: m.focus,
          learningObjectives: [`Implement ${m.title}`, "Measure system quality and failure modes", "Produce documented engineering artifacts"],
          lessons: [{ lessonNumber: `Lesson ${m.num}.1`, title: m.title, paragraphs: [m.focus] }],
          workedExample: {
            title: `Worked Example — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: ["1. Architect component.", "2. Instrument telemetry.", "3. Evaluate against test set.", "4. Document trade-offs."],
            engineeringConclusion: "Measured evaluation separates reliable engineering from ad-hoc prompting."
          },
          practicalLab: {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: ["Build implementation", "Run benchmark tests", "Write technical documentation"],
            submissionDeliverables: [`Milestone ${m.num} Deliverable Package`],
            interactiveSimulatorHint: "Consult NIST AI RMF 1.0."
          },
          assessmentQuestions: [
            {
              id: `p2-m${m.num}-q1`,
              prompt: `In ${m.title}, why is systematic evaluation on failure cases required before deployment?`,
              options: [
                "To identify retrieval gaps, hallucinations, security risks, and latency bottlenecks using measurable evidence.",
                "Because evaluation replaces the need for authentication.",
                "To make prompts longer without testing accuracy.",
                "So that outdated documents are never updated."
              ],
              correctIndex: 0,
              modelAnswerExplanation: "Systematic evaluation uncovers failure modes across retrieval, groundedness, safety, and efficiency."
            }
          ],
          passingCriterionNote: "Passing criterion: working implementation, documented evaluation metrics, and failure analysis.",
          professionalDeliverable: {
            title: `Milestone ${m.num} AI Engineering Artifact`,
            format: "Code + Evaluation Markdown Report",
            templateMarkdown: `# Milestone ${m.num}: ${m.title}\n\n## Architecture & Implementation\n- ${m.focus}\n\n## Evaluation Metrics & Failure Analysis\n- Test Cases Run:\n- Observed Failure Modes & Fixes:\n`
          },
          competencyRubric: [{ criterion: m.title, developing: "Incomplete evaluation", competent: "Verified implementation + evaluation report", advanced: "Full CI/CD evaluation harness" }],
          careerApplication: { workplaceUsage: "Used in production AI/LLM engineering teams.", supervisionAndLicensingNote: "Aligned with NIST AI RMF 1.0." },
          whitePaperPages: g.pages,
          whitePaperFullMarkdown: g.fullMarkdown
        }
      })
    ]
  },

  // --------------------------------------------------------------------------
  // PATHWAY 3: CONSTRUCTION SUPERINTENDENT & PROJECT MANAGEMENT
  // --------------------------------------------------------------------------
  {
    id: "pathway-3-construction-superintendent",
    priorityRank: 3,
    title: "Construction Superintendent & Project Management",
    categoryTitle: "Advanced Construction & Master Trades",
    level: "Beginner to intermediate",
    suggestedDuration: "12 weeks",
    deliveryFormat: "Project simulations, estimating exercises, and supervised site experience",
    bestLearningFormat: "Project simulations, estimates, site scenarios",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    capstoneSummary: "Plan and manage a simulated commercial building project across drawings, takeoffs, critical-path scheduling, safety controls, and closeout.",
    safetyOrRegulatoryNotice: "Construction safety instruction must use applicable OSHA requirements and local building codes. Missing drawing dimensions or structural conflicts must be escalated via formal RFI to the Architect/Engineer of Record rather than guessed on site.",
    principalReferences: [
      {
        title: "OSHA Construction Electrical Safety & Subpart K Standards",
        organization: "Occupational Safety and Health Administration (OSHA)",
        url: "https://www.osha.gov/electrical/construction",
        summary: "Official workplace safety regulations and guidance for construction electrical safety, hazard assessments, and incident prevention."
      }
    ],
    milestones: [
      {
        milestoneNumber: 1,
        title: "Reading drawings and understanding construction systems",
        summary: "Distinguishing the 6 main construction drawing types, scale conversion and concrete slab quantity takeoffs, and the superintendent's 6-step daily control cycle.",
        learningObjectives: [
          "Cross-reference site, floor, elevation, section, structural, and MEP drawings to detect trade coordination conflicts before installation.",
          "Convert scaled drawing measurements into real dimensions and compute accurate concrete volume takeoffs.",
          "Execute the superintendent's 6-step daily field control cycle.",
          "Manage a simulated concrete slab pour including pre-pour inspection, drawing conflict escalation (RFI), safety planning, and daily delay reporting."
        ],
        lessons: [
          {
            lessonNumber: "Lesson 1.1",
            title: "How to read a construction drawing",
            paragraphs: [
              "Construction drawings communicate the intended design, dimensions, materials, interfaces, and installation requirements of a project.",
              "A superintendent must understand how these documents interact. A duct passing through a structural beam, for example, can create a serious coordination problem if the conflict is discovered only after installation."
            ],
            bulletPoints: [
              "Site plan: building location, boundaries, access, grading, and utilities.",
              "Floor plan: room layouts, dimensions, walls, doors, and windows.",
              "Elevations: exterior appearance and vertical dimensions.",
              "Sections: internal construction, levels, and relationships between building components.",
              "Structural drawings: foundations, beams, columns, connections, and load paths.",
              "Mechanical, electrical, and plumbing drawings: building services and their coordination with the structure."
            ]
          },
          {
            lessonNumber: "Lesson 1.2",
            title: "Dimensions, scale, and quantity takeoffs",
            paragraphs: [
              "A drawing scale converts measured drawing distances into real dimensions.",
              "For a scale of 1:50, one unit on the drawing represents 50 of the same units in reality. A measured length of 60 mm therefore represents 3,000 mm = 3 m.",
              "Quantity takeoffs convert drawings into measurable quantities for estimating, purchasing, and scheduling.",
              "The theoretical volume of a 12 m × 8 m × 0.15 m slab is 14.4 cubic metres. A real order must also account for the approved design, actual site dimensions, placement conditions, and an appropriate allowance for waste. Reinforcement, foundations, openings, and sub-base requirements must be calculated separately."
            ],
            mathFormulaBox: {
              title: "Drawing Scale & Concrete Slab Volume Takeoff",
              equations: [
                "Scale 1:50 Conversion:  60 mm × 50 = 3,000 mm = 3 m",
                "Slab Volume Formula:    V = L × W × T",
                "Worked Calculation:     V = 12 m × 8 m × 0.15 m = 14.4 m³ (theoretical volume)"
              ],
              explanation: "Always calculate theoretical net volume first, then separately account for thickened edges, blockouts/openings, reinforcement chairs, sub-base compaction, and a documented waste/pump-line allowance."
            }
          },
          {
            lessonNumber: "Lesson 1.3",
            title: "The superintendent's daily control cycle",
            paragraphs: [
              "Effective field leadership relies on a disciplined six-step daily control cycle:"
            ],
            orderedSteps: [
              "Review the work planned for the day and confirm approved drawings are available.",
              "Check labor, materials, equipment, access, and trade coordination.",
              "Conduct required safety briefings and verify controls for the day's hazards.",
              "Monitor progress and record deviations, delays, and quality issues.",
              "Coordinate inspections and resolve issues through the approved project process.",
              "Document actual progress, outstanding actions, and the next day's constraints."
            ]
          }
        ],
        workedExample: {
          title: "Concrete Slab Quantity Takeoff & MEP Sleeve Conflict Escalation",
          problemStatement: "You are preparing for a rectangular equipment pad pour measuring 12 m long, 8 m wide, and 0.15 m thick (Scale 1:50 on Drawing S-102). During your pre-pour overlay check with Mechanical Drawing M-201, you notice a 300 mm chilled-water pipe penetration shown on M-201 that is missing from the structural slab reinforcement drawing S-102. Calculate the theoretical concrete volume and state the required superintendent action.",
          stepByStepSolution: [
            "1. Verify Scale & Dimensions: On the 1:50 drawing, the 240 mm × 160 mm plan footprint corresponds to 12,000 mm (12 m) × 8,000 mm (8 m), with section thickness T = 0.15 m.",
            "2. Calculate Theoretical Slab Volume: V = L × W × T = 12 × 8 × 0.15 = 14.4 m³.",
            "3. Evaluate the Drawing Conflict: Drawing M-201 shows a 300 mm vertical penetration, but S-102 shows continuous bottom rebar with no sleeve detail or trimmer bars.",
            "4. Escalate via Formal RFI Before Pouring: Hold the concrete placement for the affected bay, issue a formal Request for Information (RFI) to the Structural Engineer of Record for approved sleeve placement and trimmer reinforcement, and document the constraint in the Daily Site Report."
          ],
          engineeringConclusion: "Theoretical volume is 14.4 m³ before waste allowance, and structural/MEP discrepancies must be resolved through the Engineer of Record via formal RFI prior to concrete placement."
        },
        practicalLab: {
          title: "Practical lab 1 — Manage a simulated slab pour",
          scenario: "You are given a set of simplified structural and MEP drawings, a quantity schedule, a fictional ready-mix delivery plan, and a pre-pour inspection checklist.",
          requiredTasks: [
            "Calculate the theoretical concrete volume (m³) and document waste/placement assumptions.",
            "Identify missing information and cross-discipline drawing conflicts between Structural and MEP sheets.",
            "Build a comprehensive pre-pour inspection checklist (sub-base, vapor barrier, formwork, rebar cover, embeds/sleeves).",
            "Prepare a one-day labor and equipment schedule (pump truck, vibrators, finishers, testing technician).",
            "Identify five site safety or quality risks and specify controls (OSHA electrical/struck-by/chemical burn controls, slump/temperature limits).",
            "Write a daily site report documenting a simulated ready-mix delivery delay and recovery plan."
          ],
          submissionDeliverables: [
            "Slab Quantity Takeoff Worksheet",
            "Pre-Pour Inspection & RFI Log",
            "1-Day Pour Schedule, 5-Risk Safety Plan & Daily Site Report"
          ],
          interactiveSimulatorHint: "Never guess missing structural dimensions; escalate conflicts formally via RFI and reference OSHA Construction Safety standards."
        },
        assessmentQuestions: [
          {
            id: "p3-m1-q1",
            prompt: "On a construction drawing with a scale of 1:50, what real-world length does a measured drawing distance of 60 mm represent?",
            options: [
              "3,000 mm (3 m)",
              "1.2 m",
              "30 m",
              "600 mm (0.6 m)"
            ],
            correctIndex: 0,
            modelAnswerExplanation: "At 1:50 scale, 60 mm × 50 = 3,000 mm = 3 m."
          },
          {
            id: "p3-m1-q2",
            prompt: "What is the theoretical concrete volume of a rectangular slab that is 12 m long, 8 m wide, and 0.15 m thick?",
            options: [
              "14.4 m³",
              "96.0 m³",
              "1.44 m³",
              "20.15 m³"
            ],
            correctIndex: 0,
            modelAnswerExplanation: "V = L × W × T = 12 m × 8 m × 0.15 m = 14.4 m³."
          },
          {
            id: "p3-m1-q3",
            prompt: "What should a construction superintendent do when a mechanical duct or pipe conflict with a structural beam/slab is discovered on the drawings before installation?",
            options: [
              "Cut through the structural reinforcement on site without telling anyone to keep the schedule moving.",
              "Escalate the conflict through the approved project RFI process to the design team / Engineer of Record before installation rather than guessing.",
              "Ignore the mechanical drawing and pour concrete over the pipe location.",
              "Cancel the entire project permanently."
            ],
            correctIndex: 1,
            modelAnswerExplanation: "Missing information and cross-discipline drawing conflicts must be escalated via formal RFI rather than guessed in the field."
          }
        ],
        passingCriterionNote: "Assessment standard: quantities must be calculated correctly, missing information must be escalated rather than guessed, and the learner must demonstrate a defensible safety and quality plan.",
        professionalDeliverable: {
          title: "Simulated Slab Pour Management Package (Takeoff, Pre-Pour Checklist, Safety Plan & Daily Report)",
          format: "Superintendent Field Control Dossier (Markdown / PDF)",
          templateMarkdown: `# Superintendent Slab Pour Control Package\n\n## 1. Quantity Takeoff Calculation\n- Dimensions: $L = 12\\text{ m}, W = 8\\text{ m}, T = 0.15\\text{ m}$\n- Theoretical Volume: $V = 12 \\times 8 \\times 0.15 = 14.4\\text{ m}^3$\n\n## 2. Drawing Conflict & RFI Escalation Log\n- Conflict Identified: MEP sleeve penetration omitted on Structural Sheet S-102.\n- Action Taken: Hold pour in Grid B2; submit RFI #014 to Structural Engineer of Record.\n\n## 3. Pre-Pour Inspection & 5 Safety/Quality Controls\n1. Sub-base compaction & vapor barrier continuity verified.\n2. Rebar size, spacing, and chair cover inspected.\n3. OSHA GFCI & overhead power line clearance verified for concrete pump boom.\n4. Concrete alkali burn PPE (gloves, eye protection, wash station) staged.\n5. Slump, air entrainment, and cylinder test technician scheduled.\n`
        },
        competencyRubric: [
          {
            criterion: "Quantity Takeoff & Scale Accuracy",
            developing: "Incorrect unit conversion or volume math error.",
            competent: "Computes exact theoretical volume (14.4 m³) and clearly separates waste, openings, and reinforcement.",
            advanced: "Includes truck staging cadence and placement rate (m³/hr) calculations."
          },
          {
            criterion: "Drawing Coordination & RFI Escalation",
            developing: "Guesses missing dimensions or modifies structural elements without authorization.",
            competent: "Identifies Structural/MEP conflicts and escalates formally via RFI prior to work execution.",
            advanced: "Produces redline overlay markups and schedule impact mitigation options."
          },
          {
            criterion: "Field Safety & Quality Control Plan",
            developing: "Generic safety note with no hazard-specific controls.",
            competent: "Identifies 5 specific safety/quality risks with defensible OSHA and inspection controls.",
            advanced: "Integrates full Hold-Point sign-off matrix and contingency delay recovery schedule."
          }
        ],
        careerApplication: {
          workplaceUsage: "Used daily by assistant superintendents, field engineers, and general construction superintendents on commercial and residential jobsites.",
          supervisionAndLicensingNote: "Construction safety practices must adhere to applicable OSHA standards (e.g., 29 CFR 1926) and local building department inspection mandates."
        },
        ...(() => {
          const g = buildTenPageTechnicalGuide(
            "Construction Superintendent & Project Management",
            1,
            "Reading drawings and understanding construction systems",
            "Drawing types, 1:50 scale conversion, 14.4 m³ concrete slab takeoff, and the 6-step daily superintendent control cycle.",
            [
              "Read and coordinate site, floor, elevation, section, structural, and MEP drawings",
              "Calculate scale dimensions and concrete volume takeoffs",
              "Execute the 6-step superintendent daily control cycle",
              "Manage a simulated slab pour with RFI escalation and safety controls"
            ],
            [],
            {
              title: "Concrete Slab Quantity Takeoff (12 m × 8 m × 0.15 m)",
              problemStatement: "Calculate theoretical volume and escalate MEP/Structural drawing conflict.",
              stepByStepSolution: ["Scale 1:50 -> 60 mm = 3 m", "V = 12 × 8 × 0.15 = 14.4 m³", "Escalate missing sleeve via formal RFI"],
              engineeringConclusion: "Never guess missing structural details; escalate via RFI and account for site placement allowances."
            },
            {
              title: "Practical lab 1 — Manage a simulated slab pour",
              scenario: "Calculate volume, identify drawing conflicts, build pre-pour checklist, schedule labor/equipment, identify 5 risks, and write daily site report.",
              requiredTasks: ["Calculate volume", "Log drawing conflicts", "Build pre-pour checklist", "1-day schedule", "5 safety/quality risks", "Daily delay report"],
              submissionDeliverables: ["Takeoff sheet", "Pre-pour checklist", "Daily site report"],
              interactiveSimulatorHint: "Reference OSHA Construction Electrical & Site Safety standards."
            },
            [{ criterion: "Takeoff, RFI & Safety Plan", developing: "Guesses missing data", competent: "Accurate math + formal RFI + 5 risk controls", advanced: "Full critical-path recovery plan" }],
            "Simulated Slab Pour Control Package",
            "Adhere to OSHA 29 CFR 1926 and local building codes.",
            [{ title: "OSHA Construction Electrical Safety", organization: "OSHA", url: "https://www.osha.gov/electrical/construction", summary: "Workplace safety regulations for construction." }]
          )
          return { whitePaperPages: g.pages, whitePaperFullMarkdown: g.fullMarkdown }
        })()
      },
      ...[
        { num: 2, title: "Scheduling, work breakdown structures, and critical paths", focus: "Decompose project scope into a Work Breakdown Structure (WBS), sequence trade predecessors, calculate float, and manage the Critical Path Method (CPM) schedule." },
        { num: 3, title: "Estimating, labor productivity, and material takeoffs", focus: "Quantify material takeoffs across CSI divisions, apply crew productivity rates, calculate labor burden, and assemble defensible cost estimates." },
        { num: 4, title: "Subcontractor coordination and procurement", focus: "Manage long-lead submittal logs, scope-of-work buyouts, trade handoff readiness, and weekly subcontractor coordination meetings." },
        { num: 5, title: "Quality assurance, inspections, and nonconformance reports", focus: "Implement 3-phase quality control (Preparatory, Initial, Follow-up), municipal code inspection hold points, and Nonconformance Reports (NCRs)." },
        { num: 6, title: "Construction safety, hazard assessments, and incident prevention", focus: "Conduct Job Hazard Analyses (JHAs), enforce OSHA fall/electrical/excavation/lockout protections, and lead root-cause near-miss investigations." },
        { num: 7, title: "Change orders, RFIs, and document control", focus: "Maintain drawing revision control, author clear RFIs, price Time & Material (T&M) or lump-sum Change Orders, and protect notice timelines." },
        { num: 8, title: "Cost control, delay analysis, and project closeout", focus: "Track earned value and labor cost codes, analyze concurrent vs. excusable delays, manage punchlist completion, and assemble O&M / as-built closeout turnovers." },
        { num: 9, title: "Capstone: plan and manage a simulated building project", focus: "Lead a simulated commercial building project from drawing takeoff and baseline schedule through safety governance, RFI/change control, and final turnover." }
      ].map((m) => {
        const g = buildTenPageTechnicalGuide(
          "Construction Superintendent & Project Management",
          m.num,
          m.title,
          m.focus,
          [`Master ${m.title}`, "Apply field control procedures", "Produce defensible project documentation"],
          [{ lessonNumber: `Lesson ${m.num}.1`, title: m.title, paragraphs: [m.focus] }],
          {
            title: `Worked Field Scenario — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: ["1. Inspect approved contract documents.", "2. Quantify schedule/cost/safety parameters.", "3. Coordinate trade interfaces.", "4. Document formal field records."],
            engineeringConclusion: "Disciplined documentation and proactive field verification prevent rework and safety incidents."
          },
          {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: ["Review project scenario documents", "Perform calculations and hazard checks", "Submit field control deliverable"],
            submissionDeliverables: [`Milestone ${m.num} Field Management Package`],
            interactiveSimulatorHint: "Follow OSHA construction standards and formal RFI/submittal protocols."
          },
          [{ criterion: m.title, developing: "Incomplete field documentation", competent: "Accurate calculations and code-compliant field plan", advanced: "Full cost/schedule risk mitigation matrix" }],
          `Milestone ${m.num} Superintendent Deliverable`,
          "Follow OSHA regulations and approved engineering drawings.",
          [{ title: "OSHA Construction Electrical Safety", organization: "OSHA", url: "https://www.osha.gov/electrical/construction", summary: "Construction safety regulations." }]
        )
        return {
          milestoneNumber: m.num,
          title: m.title,
          summary: m.focus,
          learningObjectives: [`Apply ${m.title}`, "Maintain safety and quality compliance", "Author clear field documentation"],
          lessons: [{ lessonNumber: `Lesson ${m.num}.1`, title: m.title, paragraphs: [m.focus] }],
          workedExample: {
            title: `Worked Example — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: ["1. Verify approved drawings.", "2. Calculate quantities/schedule impact.", "3. Enforce OSHA safety controls.", "4. Record daily field log."],
            engineeringConclusion: "Escalate design ambiguities formally; never improvise structural or life-safety changes."
          },
          practicalLab: {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: ["Complete field calculation", "Draft control checklist", "Write superintendent report"],
            submissionDeliverables: [`Milestone ${m.num} Field Control Artifact`],
            interactiveSimulatorHint: "Reference OSHA Construction standards."
          },
          assessmentQuestions: [
            {
              id: `p3-m${m.num}-q1`,
              prompt: `In ${m.title}, why must all deviations and missing design details be documented and routed through the formal project process?`,
              options: [
                "To ensure structural integrity, code compliance, cost accountability, and an auditable project record approved by the Engineer/Architect of Record.",
                "To avoid speaking with trade subcontractors.",
                "Because verbal guesses are preferred by building inspectors.",
                "To eliminate the need for safety briefings."
              ],
              correctIndex: 0,
              modelAnswerExplanation: "Formal documentation and engineering sign-off protect life safety, quality, and contract compliance."
            }
          ],
          passingCriterionNote: "Passing criterion: accurate calculations, formal escalation of missing information, and defensible safety/quality controls.",
          professionalDeliverable: {
            title: `Milestone ${m.num} Field Management Artifact`,
            format: "Field Control Document (Markdown/PDF)",
            templateMarkdown: `# Milestone ${m.num}: ${m.title}\n\n## Field Scope & Calculations\n- ${m.focus}\n\n## Safety, Quality & Coordination Controls\n- Verified Hold Points:\n`
          },
          competencyRubric: [{ criterion: m.title, developing: "Unverified assumptions", competent: "Complete calculations and safety/quality plan", advanced: "Integrated CPM and cost control analysis" }],
          careerApplication: { workplaceUsage: "Applied daily in commercial construction superintendency.", supervisionAndLicensingNote: "Comply with OSHA and local building codes." },
          whitePaperPages: g.pages,
          whitePaperFullMarkdown: g.fullMarkdown
        }
      })
    ]
  },

  // --------------------------------------------------------------------------
  // PATHWAY 4: CLOUD SECURITY ARCHITECT
  // --------------------------------------------------------------------------
  {
    id: "pathway-4-cloud-security-architect",
    priorityRank: 4,
    title: "Cloud Security Architect",
    categoryTitle: "Cybersecurity & Digital Defense",
    level: "Intermediate",
    suggestedDuration: "12 weeks",
    deliveryFormat: "Cloud sandbox, architecture exercises, and security reviews",
    bestLearningFormat: "Cloud sandbox and architecture reviews",
    coverImage: "/images/connectln-studies/cyber-specialist-cover.jpg",
    capstoneSummary: "Design, deploy, assess, and defend a secure multi-tier cloud environment with verified identity boundaries and tested recovery objectives.",
    safetyOrRegulatoryNotice: "Moving to the cloud does not eliminate the customer's security responsibilities. A 15-minute RPO does not automatically mean a 15-minute backup schedule suffices—replication lag, consistency, and restore time must be empirically tested.",
    principalReferences: [
      {
        title: "NIST NICE Workforce Framework & Cloud Security Guidance",
        organization: "NIST",
        url: "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center",
        summary: "Cloud security architecture competencies, control mapping, and resilience verification."
      },
      {
        title: "OWASP Web & API Security Testing Guides",
        organization: "OWASP",
        url: "https://owasp.org/www-project-web-security-testing-guide/",
        summary: "Verification of trust boundaries, authentication, and authorization across web and API tiers."
      }
    ],
    milestones: [
      {
        milestoneNumber: 1,
        title: "Cloud architecture and security fundamentals",
        summary: "Understanding IaaS, PaaS, and SaaS shared responsibility models; designing around identities and trust boundaries; and calculating testable RTO and RPO recovery requirements.",
        learningObjectives: [
          "Differentiate customer vs. provider security responsibilities across IaaS, PaaS, and SaaS deployment models.",
          "Map trust boundaries across User -> Internet -> Web application -> API -> Database and enforce least-privilege identity controls.",
          "Evaluate Recovery Time Objective (RTO: 4 hours) and Recovery Point Objective (RPO: 15 minutes) against real replication and restoration constraints.",
          "Produce a complete three-tier cloud security architecture diagram, IAM matrix, network policy, secrets plan, logging plan, DR strategy, and risk register."
        ],
        lessons: [
          {
            lessonNumber: "Lesson 1.1",
            title: "Understanding the cloud service models",
            paragraphs: [
              "Cloud services are commonly organized into three models:",
              "The exact division of responsibility depends on the provider, service, contract, and deployment model. Moving to the cloud does not eliminate the customer's security responsibilities."
            ],
            bulletPoints: [
              "Infrastructure as a Service (IaaS): the customer manages substantial parts of the operating system, networking configuration, and workload security.",
              "Platform as a Service (PaaS): the provider manages more of the underlying infrastructure, while the customer remains responsible for application configuration, identities, data, and other assigned controls.",
              "Software as a Service (SaaS): the provider operates the application, while the customer manages responsibilities such as user access, data governance, and tenant configuration."
            ]
          },
          {
            lessonNumber: "Lesson 1.2",
            title: "Design around identities and trust boundaries",
            paragraphs: [
              "A trust boundary is a point where data or requests cross between components with different security assumptions.",
              "Consider a fictional business application: User → Internet → Web application → API → Database",
              "A secure architecture uses least privilege, meaning each identity receives only the permissions needed for its assigned tasks. Network restrictions provide an additional layer of defense but do not replace identity and authorization checks."
            ],
            bulletPoints: [
              "Which identities can reach each component.",
              "Which operations each identity can perform.",
              "How secrets and credentials are stored.",
              "Which network paths are permitted.",
              "How sensitive data is encrypted and backed up.",
              "How administrative actions are logged and reviewed."
            ]
          },
          {
            lessonNumber: "Lesson 1.3",
            title: "Calculate recovery requirements",
            paragraphs: [
              "Suppose an organization sets these recovery objectives: Recovery Time Objective (RTO): 4 hours. Recovery Point Objective (RPO): 15 minutes.",
              "The RTO defines the target time for restoring a service after disruption. The RPO defines the maximum targeted amount of data loss measured in time.",
              "A 15-minute RPO does not automatically mean that a backup taken every 15 minutes will meet the requirement. Backup completion, replication delays, consistency, restore procedures, and verification all affect the actual recovery capability."
            ],
            mathFormulaBox: {
              title: "RTO & RPO Verification Criteria",
              equations: [
                "Target RTO = 4 hours  =>  t_detect + t_provision + t_restore + t_verify <= 240 min",
                "Target RPO = 15 minutes =>  Δt_snapshot_interval + Δt_replication_lag <= 15 min"
              ],
              explanation: "To achieve a 15-minute RPO and 4-hour RTO in practice, continuous transaction log shipping / synchronous or near-synchronous multi-AZ replication and automated restore drills are required."
            }
          }
        ],
        workedExample: {
          title: "Three-Tier Learning Platform Trust Boundary & RTO/RPO Verification",
          problemStatement: "A cloud learning platform runs `User -> Internet -> Web Tier -> API Tier -> Managed Relational Database`. A junior engineer places the database in a public subnet with `0.0.0.0/0` reachability for convenience, grants the Web Tier IAM role `rds:*` wildcard permissions, and configures a single daily snapshot claiming it meets a 15-minute RPO and 4-hour RTO. Identify all three architectural flaws and specify the corrected design.",
          stepByStepSolution: [
            "1. Eliminate Public Database Exposure: Move the database into an isolated private data subnet with no Internet Gateway route. Restrict network ingress strictly to the API Tier security group on the database port.",
            "2. Enforce Least-Privilege Workload Identities: Replace the Web Tier's `rds:*` wildcard role. The Web Tier should only invoke the API Tier; only the API Tier service identity receives scoped database read/write permissions for specific application tables, using short-lived IAM authentication tokens or a managed secrets vault.",
            "3. Correct the Recovery Architecture (RPO = 15 min, RTO = 4 hr): A daily (24-hour) snapshot risks up to 24 hours of data loss, violating the 15-minute RPO by 96x. Enable multi-AZ synchronous standby replication with continuous write-ahead log (WAL) archiving (< 5 min point-in-time recovery lag) and conduct quarterly automated restore drills to verify total restoration completes within 4 hours."
          ],
          engineeringConclusion: "Defense-in-depth requires private data-tier segmentation, least-privilege workload identities at every trust boundary, and empirically tested point-in-time recovery."
        },
        practicalLab: {
          title: "Practical lab 1 — Design a secure three-tier cloud application",
          scenario: "You receive a fictional online learning platform scenario requiring a 4-hour RTO and 15-minute RPO. Produce a complete, defensible cloud security architecture package.",
          requiredTasks: [
            "Create an architecture diagram showing the web tier, application/API tier, database tier, and identity services with explicit trust boundaries.",
            "Construct an Identity and Access Management (IAM) matrix for human administrators, CI/CD pipelines, web workloads, and API workloads.",
            "Define a network access policy (subnets, security groups, ingress/egress rules) ensuring zero public database exposure.",
            "Specify a secrets-management plan (rotation, KMS encryption, zero hardcoded credentials).",
            "Design a logging and monitoring plan covering control-plane audit trails and data-access telemetry.",
            "Develop a testable backup and disaster-recovery strategy achieving RTO <= 4h and RPO <= 15m.",
            "Compile a risk register with mitigations and documented residual risks."
          ],
          submissionDeliverables: [
            "3-Tier Trust-Boundary Architecture Diagram",
            "IAM Least-Privilege Matrix & Network Access Policy",
            "Secrets, Logging, RTO/RPO DR Plan & Risk Register"
          ],
          interactiveSimulatorHint: "Ensure your architecture has zero unexplained public database exposure, clear identity boundaries, and a testable recovery plan."
        },
        assessmentQuestions: [
          {
            id: "p4-m1-q1",
            prompt: "Why should a production database not be publicly accessible from the internet, even if it requires a password?",
            options: [
              "Because public exposure removes network trust-boundary isolation, exposing the database engine directly to credential stuffing, unpatched protocol vulnerabilities, and DDoS attacks.",
              "Because cloud databases cannot use passwords when placed in a private subnet.",
              "Because public subnets delete all database tables every hour.",
              "Public accessibility is actually recommended for all production databases."
            ],
            correctIndex: 0,
            modelAnswerExplanation: "Placing the database in an isolated private subnet ensures only authorized application-tier workloads can establish network connections, providing defense-in-depth alongside identity authentication."
          },
          {
            id: "p4-m1-q2",
            prompt: "How can an overprivileged service identity (such as a web server role with full '*' cloud admin permissions) create severe risk?",
            options: [
              "If an attacker compromises the web application (e.g., via SSRF or RCE), they inherit the service identity's excessive permissions and can pivot to exfiltrate databases, modify IAM policies, or destroy backups.",
              "Overprivileged identities make the web page font size smaller.",
              "Service identities are never used by cloud applications.",
              "Overprivileged roles automatically encrypt all network traffic."
            ],
            correctIndex: 0,
            modelAnswerExplanation: "Least privilege limits blast radius; an overprivileged workload identity turns an application-layer flaw into full cloud-account compromise."
          },
          {
            id: "p4-m1-q3",
            prompt: "Why does taking a backup every 15 minutes not automatically guarantee a 15-minute RPO and 4-hour RTO, and how should an organization verify its recovery objectives?",
            options: [
              "Backup completion time, replication lag, transactional consistency, and restoration speed can cause actual data loss or downtime to exceed targets; the organization must perform regular, timed restore drills into an isolated environment and verify data integrity.",
              "Because backups never need to be tested once configured in the cloud console.",
              "Because RPO measures network bandwidth rather than data loss in time.",
              "A 15-minute backup schedule guarantees instant 0-second recovery under all conditions."
            ],
            correctIndex: 0,
            modelAnswerExplanation: "Recovery capability is only proven when backups are restored, verified for transactional consistency, and timed end-to-end against RTO and RPO targets."
          }
        ],
        passingCriterionNote: "Passing criterion: the architecture must have no unexplained public database exposure, clear identity boundaries, and a testable recovery plan.",
        professionalDeliverable: {
          title: "Three-Tier Cloud Security Architecture Dossier (Diagram, IAM Matrix, Network Policy, DR Plan & Risk Register)",
          format: "Cloud Architecture Review Package (Markdown / Diagram / JSON)",
          templateMarkdown: `# Secure Three-Tier Cloud Architecture Specification\n\n## 1. Trust Boundaries & Data Flow\n\`User -> Internet -> [Public ALB] -> [Private Web Tier] -> [Private API Tier] -> [Isolated Private Database Tier]\`\n\n## 2. IAM Least-Privilege Matrix\n| Identity | Allowed Actions | Target Resources | Explicit Denies |\n|---|---|---|---|\n| \`role-web-tier\` | \`execute-api:Invoke\` | \`arn:cloud:api:prod/v1/*\` | Direct DB / IAM / S3 Admin |\n| \`role-api-tier\` | \`rds-db:connect\` | \`arn:cloud:rds:prod:db-user/app_rw\` | \`rds:DeleteDBInstance\`, \`iam:*\` |\n\n## 3. Recovery Objectives Verification (RTO: 4h, RPO: 15m)\n- Replication Mechanism: Multi-AZ synchronous standby + continuous WAL log shipping (< 2 min lag).\n- Verification Drill: Automated monthly restore into isolated staging VPC with checksum validation.\n`
        },
        competencyRubric: [
          {
            criterion: "Trust Boundary & Network Segmentation",
            developing: "Leaves database or internal management ports exposed to 0.0.0.0/0.",
            competent: "Isolates web, API, and database tiers with strict security-group chaining and zero public DB exposure.",
            advanced: "Incorporates VPC endpoints, private service links, and egress filtering."
          },
          {
            criterion: "Identity & Least Privilege Design",
            developing: "Uses shared static credentials or wildcard (*) IAM policies.",
            competent: "Defines distinct, scoped workload identities, KMS secrets rotation, and administrative audit logging.",
            advanced: "Enforces short-lived OIDC/STS tokens, permission boundaries, and conditional access context."
          },
          {
            criterion: "RTO (4h) & RPO (15m) Recovery Engineering",
            developing: "Assumes untimed daily backups satisfy a 15-minute RPO.",
            competent: "Specifies continuous replication/log shipping and a concrete restoration test procedure.",
            advanced: "Models failure-domain blast radius, automated failover runbooks, and residual risk register."
          }
        ],
        careerApplication: {
          workplaceUsage: "Used in enterprise cloud architecture boards, SOC 2 / ISO 27001 / FedRAMP security reviews, and production cloud migrations.",
          supervisionAndLicensingNote: "Shared responsibility boundaries must be verified against specific cloud provider documentation and contractual SLAs."
        },
        ...(() => {
          const g = buildTenPageTechnicalGuide(
            "Cloud Security Architect",
            1,
            "Cloud architecture and security fundamentals",
            "IaaS/PaaS/SaaS responsibility models, identity and trust boundaries, and RTO (4h) / RPO (15m) recovery engineering.",
            [
              "Distinguish IaaS, PaaS, and SaaS shared responsibilities",
              "Design around identities and trust boundaries (User -> Internet -> Web -> API -> Database)",
              "Calculate and verify RTO (4 hours) and RPO (15 minutes)",
              "Produce a secure 3-tier cloud architecture package"
            ],
            [],
            {
              title: "Three-Tier Cloud Trust Boundary & RTO/RPO Verification",
              problemStatement: "Eliminate public database exposure, scope IAM workload identities, and engineer a testable 15-minute RPO / 4-hour RTO.",
              stepByStepSolution: ["Isolate DB in private subnet", "Scope Web and API IAM roles to least privilege", "Enable continuous WAL replication + timed restore drills"],
              engineeringConclusion: "Network segmentation and least-privilege identities must be paired with empirically tested recovery procedures."
            },
            {
              title: "Practical lab 1 — Design a secure three-tier cloud application",
              scenario: "Create architecture diagram, IAM matrix, network policy, secrets plan, logging plan, backup/DR strategy, and risk register.",
              requiredTasks: ["Architecture diagram", "IAM matrix", "Network policy", "Secrets plan", "Logging plan", "DR strategy", "Risk register"],
              submissionDeliverables: ["3-Tier Architecture Diagram", "IAM & Network Policy", "DR Plan & Risk Register"],
              interactiveSimulatorHint: "Verify zero public database exposure and testable RTO/RPO."
            },
            [{ criterion: "3-Tier Cloud Security Design", developing: "Public DB or wildcard IAM", competent: "Isolated tiers, least-privilege IAM, testable DR plan", advanced: "Full threat model and automated compliance checks" }],
            "Three-Tier Cloud Security Architecture Dossier",
            "Customer security responsibilities persist across all cloud service models.",
            [{ title: "NIST NICE Framework", organization: "NIST", url: "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center", summary: "Cybersecurity workforce architecture standards." }]
          )
          return { whitePaperPages: g.pages, whitePaperFullMarkdown: g.fullMarkdown }
        })()
      },
      ...[
        { num: 2, title: "Cloud networking, segmentation, and secure connectivity", focus: "Architect VPC subnets, transit gateways, private endpoints, micro-segmentation, WAF/DDoS protection, and mTLS service meshes." },
        { num: 3, title: "IAM, federation, privileged access, and secrets", focus: "Design SAML/OIDC federation, just-in-time (JIT) privileged access management, workload identity federation, and envelope KMS secrets rotation." },
        { num: 4, title: "Workload security, containers, and secure deployment", focus: "Harden base images, Kubernetes pod security standards, runtime eBPF telemetry, and signed CI/CD supply-chain attestations." },
        { num: 5, title: "Data classification, encryption, and key management", focus: "Implement data classification tiers, customer-managed KMS keys (CMKs), envelope encryption, tokenization, and immutable backup vaults." },
        { num: 6, title: "Logging, monitoring, detection, and incident response", focus: "Centralize immutable control-plane and data-plane audit logs, engineer high-signal SIEM detections, and automate cloud containment playbooks." },
        { num: 7, title: "Governance, control mapping, and compliance evidence", focus: "Map cloud controls to NIST 800-53 / CIS Benchmarks / ISO 27001, implement policy-as-code guardrails, and automate continuous audit evidence collection." },
        { num: 8, title: "Resilience, threat modeling, and cost-security trade-offs", focus: "Conduct STRIDE threat modeling, chaos/failover verification drills, and evaluate security control ROI against cloud infrastructure cost models." },
        { num: 9, title: "Capstone: design, deploy, assess, and defend a secure cloud environment", focus: "Design a secure cloud environment, validate its controls in a sandbox, and defend the architectural and cost-security trade-offs before a peer review panel." }
      ].map((m) => {
        const g = buildTenPageTechnicalGuide(
          "Cloud Security Architect",
          m.num,
          m.title,
          m.focus,
          [`Architect ${m.title}`, "Enforce least privilege and defense-in-depth", "Produce verifiable architecture artifacts"],
          [{ lessonNumber: `Lesson ${m.num}.1`, title: m.title, paragraphs: [m.focus] }],
          {
            title: `Worked Architecture Review — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: ["1. Map trust boundaries.", "2. Define identity and network controls.", "3. Validate failure/attack scenarios.", "4. Document residual risks."],
            engineeringConclusion: "Every cloud control must be verifiable through configuration state and audit logs."
          },
          {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: ["Draft architecture specification", "Define policy-as-code rules", "Verify control effectiveness"],
            submissionDeliverables: [`Milestone ${m.num} Cloud Security Deliverable`],
            interactiveSimulatorHint: "Enforce least privilege at every trust boundary."
          },
          [{ criterion: m.title, developing: "Implicit trust assumptions", competent: "Explicit identity, network, and logging controls", advanced: "Automated policy-as-code verification" }],
          `Milestone ${m.num} Cloud Architecture Artifact`,
          "Verify shared responsibility boundaries for each cloud service.",
          [{ title: "NIST NICE Framework", organization: "NIST", url: "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center", summary: "Cloud security workforce standards." }]
        )
        return {
          milestoneNumber: m.num,
          title: m.title,
          summary: m.focus,
          learningObjectives: [`Design and review ${m.title}`, "Eliminate implicit trust", "Document testable security controls"],
          lessons: [{ lessonNumber: `Lesson ${m.num}.1`, title: m.title, paragraphs: [m.focus] }],
          workedExample: {
            title: `Worked Example — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: ["1. Identify assets and identities.", "2. Apply least-privilege policy.", "3. Verify logging and recovery.", "4. Record risk register."],
            engineeringConclusion: "Controls must be empirically tested in sandbox environments."
          },
          practicalLab: {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: ["Complete architecture design", "Write IAM/network policy", "Document verification test"],
            submissionDeliverables: [`Milestone ${m.num} Architecture Package`],
            interactiveSimulatorHint: "Validate all trust boundaries."
          },
          assessmentQuestions: [
            {
              id: `p4-m${m.num}-q1`,
              prompt: `In ${m.title}, why do network restrictions complement—but never replace—identity and authorization checks?`,
              options: [
                "Because requests traversing an allowed network path can still originate from a compromised workload or unauthorized user; every component must authenticate and authorize the caller.",
                "Because cloud networks do not support IP addresses.",
                "Because IAM policies only work when firewalls are turned off.",
                "Network restrictions automatically grant database admin rights."
              ],
              correctIndex: 0,
              modelAnswerExplanation: "Defense-in-depth requires both network segmentation and strict identity/authorization verification at every tier."
            }
          ],
          passingCriterionNote: "Passing criterion: clear identity boundaries, zero unexplained exposure, and testable verification procedures.",
          professionalDeliverable: {
            title: `Milestone ${m.num} Cloud Security Specification`,
            format: "Architecture & Policy Package",
            templateMarkdown: `# Milestone ${m.num}: ${m.title}\n\n## Control Architecture\n- ${m.focus}\n\n## Verification & Risk Register\n- Test Procedure:\n- Residual Risk:\n`
          },
          competencyRubric: [{ criterion: m.title, developing: "Overprivileged access", competent: "Least-privilege design with verification plan", advanced: "Full automated guardrail suite" }],
          careerApplication: { workplaceUsage: "Applied in enterprise cloud security architecture.", supervisionAndLicensingNote: "Verify provider shared-responsibility documentation." },
          whitePaperPages: g.pages,
          whitePaperFullMarkdown: g.fullMarkdown
        }
      })
    ]
  },

  // --------------------------------------------------------------------------
  // PATHWAY 5: SOLAR ENERGY & MICROGRID ENGINEERING
  // --------------------------------------------------------------------------
  {
    id: "pathway-5-solar-microgrid",
    priorityRank: 5,
    title: "Solar Energy & Microgrid Engineering",
    categoryTitle: "Engineering, Robotics & Advanced Manufacturing",
    level: "Beginner to intermediate",
    suggestedDuration: "12 weeks",
    deliveryFormat: "Engineering calculations, system modeling, and supervised practical work",
    bestLearningFormat: "Design calculations and system simulations",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    capstoneSummary: "Produce a preliminary community microgrid design, solar and battery sizing worksheet, 48-hour outage operating plan, and engineering report.",
    safetyOrRegulatoryNotice: "Preliminary sizing calculations are not final construction designs. Final electrical designs, utility interconnections, protection settings, and physical installations must be reviewed and approved by appropriately qualified and licensed professionals under applicable electrical codes (e.g., NEC / IEEE 1547 / OSHA).",
    principalReferences: [
      {
        title: "OSHA Construction Electrical Safety Standards",
        organization: "OSHA",
        url: "https://www.osha.gov/electrical/construction",
        summary: "Electrical safety requirements, lockout/tagout, arc-flash/shock protection, and safe installation practices."
      }
    ],
    milestones: [
      {
        milestoneNumber: 1,
        title: "Electrical energy, demand, and system sizing",
        summary: "Distinguishing power (kW) and energy (kWh), estimating daily community electricity demand (10 MWh/day), preliminary solar array sizing (2.5 MW), and 48-hour battery storage sizing (27.8 MWh).",
        learningObjectives: [
          "Distinguish power (W / kW) from energy (Wh / kWh) using E = P × t.",
          "Estimate daily community electricity demand (1,000 households × 10 kWh = 10,000 kWh/day = 10 MWh/day) and explain load diversity versus simultaneous peak demand.",
          "Calculate preliminary solar PV array capacity (P_solar = E_d / (H_sun × PR) = 2,500 kW = 2.5 MW) and identify real-world factors omitted in simplified sizing.",
          "Calculate preliminary 48-hour outage battery storage capacity (E_battery = 20 MWh / (0.80 × 0.90) ≈ 27.8 MWh) and produce a complete preliminary community microgrid design package."
        ],
        lessons: [
          {
            lessonNumber: "Lesson 1.1",
            title: "Understand power and energy",
            paragraphs: [
              "Two essential quantities in electrical engineering are power and energy.",
              "Power, measured in watts (W) or kilowatts (kW), describes the rate at which energy is delivered or consumed.",
              "Energy, measured in watt-hours (Wh) or kilowatt-hours (kWh), measures energy consumed or produced over time.",
              "Energy consumption determines much of the required generation and storage capacity. Peak power demand helps determine the capacity of inverters, conductors, protection devices, and other equipment."
            ],
            mathFormulaBox: {
              title: "Fundamental Power & Energy Relationship",
              equations: [
                "E = P × t   (where E is energy, P is average power, and t is time)",
                "Worked Appliance Example:  E = 2 kW × 3 hours = 6 kWh"
              ],
              explanation: "Energy (kWh/MWh) governs generation and battery storage energy capacity, whereas peak power (kW/MW) governs inverter, transformer, conductor, and breaker ratings."
            }
          },
          {
            lessonNumber: "Lesson 1.2",
            title: "Estimate daily electricity demand",
            paragraphs: [
              "Consider a hypothetical community of 1,000 households. Assume each household consumes an average of 10 kWh daily.",
              "The community therefore requires 10 MWh of delivered electricity each day, before accounting for distribution losses or additional facility loads.",
              "If the average household demand is 3 kW at peak, multiplying that figure by 1,000 gives a theoretical simultaneous peak of 3 MW. However, actual community peak demand depends on how household loads coincide. Engineers should use measured load profiles or justified diversity assumptions rather than treating every household's individual peak as continuously simultaneous."
            ],
            mathFormulaBox: {
              title: "Community Daily Energy Demand & Peak Diversity",
              equations: [
                "E_d = 1,000 households × 10 kWh/day = 10,000 kWh/day = 10 MWh/day",
                "Theoretical Simultaneous Peak = 1,000 × 3 kW = 3,000 kW = 3 MW (prior to diversity factor)"
              ],
              explanation: "Actual feeder peak demand depends on load coincidence (diversity factor) and must also account for distribution losses and critical community facilities."
            }
          },
          {
            lessonNumber: "Lesson 1.3",
            title: "Estimate preliminary solar capacity",
            paragraphs: [
              "Suppose the site receives 5 peak-sun-hours daily. Assume a preliminary overall performance ratio of 0.80 to account for system losses.",
              "The preliminary estimate is 2.5 MW of solar capacity to generate 10 MWh on an average design day under these simplified assumptions.",
              "This is not a final design. Engineers must also examine seasonal solar variation, shading, temperature, inverter clipping, hourly load patterns, distribution losses, reserve requirements, and periods of poor weather."
            ],
            mathFormulaBox: {
              title: "Preliminary Energy-Based Solar Array Sizing",
              equations: [
                "P_solar = E_d / (H_sun × PR)",
                "P_solar = 10,000 kWh / (5 h × 0.80) = 2,500 kW = 2.5 MW"
              ],
              explanation: "Preliminary sizing must be followed by hourly simulation accounting for seasonal irradiance, temperature coefficients, shading, inverter DC/AC ratio, and multi-day cloud cover."
            }
          },
          {
            lessonNumber: "Lesson 1.4",
            title: "Understand battery storage",
            paragraphs: [
              "Battery sizing requires at least four inputs: Required energy during the backup period; Permitted depth of discharge; Battery and inverter efficiency; Required reserve capacity and battery degradation allowance.",
              "For an illustrative 48-hour outage, assume the entire community needs 10 MWh per day and all that demand must be supplied from storage.",
              "This estimate (27.8 MWh) assumes the entire average daily demand must be supplied during the outage. It does not include an additional reserve or future degradation margin. A real design also needs to check peak discharge power, critical versus noncritical loads, charging availability, thermal management, battery chemistry, and safety requirements."
            ],
            mathFormulaBox: {
              title: "48-Hour Outage Nominal Battery Storage Sizing",
              equations: [
                "E_delivered = 10 MWh/day × 2 days = 20 MWh",
                "E_battery = E_delivered / (DoD × η_combined) = 20 MWh / (0.80 × 0.90) ≈ 27.8 MWh"
              ],
              explanation: "Nominal capacity (~27.8 MWh) must be further adjusted if end-of-life degradation margin, state-of-charge reserve, or critical-load-only shedding is applied during an outage."
            }
          }
        ],
        workedExample: {
          title: "Complete Community Microgrid Preliminary Sizing (1,000 Households, 48-Hour Outage)",
          problemStatement: "Summarize the four core preliminary sizing calculations for the 1,000-household community (10 kWh/day per household, 5 peak-sun-hours, PR = 0.80, 48-hour outage backup, 80% DoD, 90% discharge efficiency) and explain how critical-load shedding changes battery sizing.",
          stepByStepSolution: [
            "1. Daily Community Energy Demand: E_d = 1,000 × 10 kWh = 10,000 kWh/day = 10 MWh/day.",
            "2. Preliminary Solar Array Rating: P_solar = 10,000 / (5 × 0.80) = 2,500 kW (2.5 MW DC).",
            "3. Full-Load 48-Hour Battery Capacity: E_delivered = 10 MWh × 2 = 20 MWh; E_battery = 20 / (0.80 × 0.90) = 27.78 MWh (≈ 27.8 MWh) before degradation reserve.",
            "4. Critical-Load Shedding Sensitivity Check: If noncritical loads (50% of demand) are shed during a grid outage and daytime solar recharging is conservatively excluded for worst-case winter storm analysis, delivered outage energy drops to 10 MWh, reducing nominal battery storage to 10 / 0.72 ≈ 13.9 MWh (plus a 15% aging/reserve margin -> ~16.0 MWh)."
          ],
          engineeringConclusion: "Transparent assumptions and clear distinction between preliminary energy balance and final stamped engineering design are mandatory."
        },
        practicalLab: {
          title: "Practical lab 1 — Design a preliminary community microgrid",
          scenario: "Using the 1,000-household community assumptions, produce a complete preliminary community microgrid engineering study.",
          requiredTasks: [
            "Construct a 24-hour load profile separating critical loads (water, medical clinic, refrigeration, communications) and noncritical loads.",
            "Perform and document the initial solar capacity calculation (P_solar = 2.5 MW) with explicit loss assumptions.",
            "Complete a battery energy (MWh) and peak discharge power (MW) sizing worksheet for a 48-hour outage.",
            "Propose an inverter and medium-voltage/low-voltage distribution concept.",
            "Write a 48-hour outage operating plan (load shedding tiers, state-of-charge thresholds, black-start sequence).",
            "Compare centralized utility-scale BESS versus distributed household/feeder storage.",
            "Build a risk register covering multi-day bad weather, inverter/transformer failure, LiFePO4 thermal/fire safety (UL 9540 / NFPA 855), and O&M maintenance."
          ],
          submissionDeliverables: [
            "Hourly Load Profile & Solar/Battery Sizing Worksheet",
            "Inverter Concept, 48-Hour Outage Operating Plan & Central vs. Distributed Comparison",
            "Microgrid Technical Risk Register"
          ],
          interactiveSimulatorHint: "Check all units (kW vs. kWh, MW vs. MWh), state assumptions transparently, and distinguish preliminary sizing from final PE-approved engineering."
        },
        assessmentQuestions: [
          {
            id: "p5-m1-q1",
            prompt: "A 2 kW electrical appliance operates continuously for 3 hours. How much electrical energy does it consume?",
            options: [
              "6 kWh",
              "0.67 kWh",
              "5 kW",
              "2,000 Wh/hour"
            ],
            correctIndex: 0,
            modelAnswerExplanation: "E = P × t = 2 kW × 3 h = 6 kWh."
          },
          {
            id: "p5-m1-q2",
            prompt: "A community requires 10,000 kWh/day (10 MWh/day), receives 5 peak-sun-hours daily, and has a preliminary system performance ratio (PR) of 0.80. What is the preliminary solar array capacity estimate?",
            options: [
              "2,500 kW (2.5 MW)",
              "1,600 kW (1.6 MW)",
              "50,000 kW (50 MW)",
              "8,000 kW (8.0 MW)"
            ],
            correctIndex: 0,
            modelAnswerExplanation: "P_solar = E_d / (H_sun × PR) = 10,000 / (5 × 0.80) = 10,000 / 4 = 2,500 kW = 2.5 MW."
          },
          {
            id: "p5-m1-q3",
            prompt: "To supply 20 MWh of delivered energy during a 48-hour outage with a usable depth of discharge (DoD) of 80% and combined discharge efficiency of 90%, what is the simplified nominal battery capacity estimate (before reserve/degradation margins)?",
            options: [
              "Approximately 27.8 MWh",
              "14.4 MWh",
              "20.0 MWh",
              "36.0 MWh"
            ],
            correctIndex: 0,
            modelAnswerExplanation: "E_battery = 20 MWh / (0.80 × 0.90) = 20 / 0.72 ≈ 27.78 MWh (27.8 MWh)."
          },
          {
            id: "p5-m1-q4",
            prompt: "Why is multiplying 1,000 households by a 3 kW individual household peak (to get 3 MW) a theoretical simultaneous peak rather than actual community peak demand?",
            options: [
              "Because not all 1,000 households run their maximum peak appliances at the exact same instant; actual peak demand depends on load coincidence (diversity factor) and measured hourly load profiles.",
              "Because power in kW cannot be added across households.",
              "Because solar panels only generate DC current at night.",
              "Because transformers eliminate all peak demand."
            ],
            correctIndex: 0,
            modelAnswerExplanation: "Load diversity means individual household peaks do not coincide continuously; engineers use measured load profiles or justified diversity factors."
          }
        ],
        passingCriterionNote: "Assessment standard: correct units and calculations, transparent assumptions, a clear distinction between preliminary sizing and final engineering, and documented safety and reliability considerations.",
        professionalDeliverable: {
          title: "Preliminary Community Microgrid Sizing & 48-Hour Outage Engineering Study",
          format: "Engineering Sizing Worksheet & Report (Markdown / PDF)",
          templateMarkdown: `# Preliminary Community Microgrid Design Study\n\n## 1. Demand & Preliminary Sizing Summary\n- Daily Energy Demand ($E_d$): $1{,}000 \\times 10\\text{ kWh} = 10{,}000\\text{ kWh/day} = 10\\text{ MWh/day}$\n- Preliminary Solar Capacity ($P_{\\text{solar}}$): $\\frac{10{,}000}{5 \\times 0.80} = 2{,}500\\text{ kW} = 2.5\\text{ MW}$\n- 48-Hour Nominal Battery Estimate ($E_{\\text{battery}}$): $\\frac{20\\text{ MWh}}{0.80 \\times 0.90} \\approx 27.8\\text{ MWh}$ (excluding degradation/reserve margin)\n\n## 2. 48-Hour Outage Operating Plan & Load Tiers\n- Tier 1 Critical Loads (100% backed up): Water pumping, clinic, emergency lighting, telecom.\n- Tier 2 Curtailed Loads: Non-essential HVAC and high-draw residential appliances shed at SoC < 50%.\n\n## 3. Centralized vs. Distributed Storage & Risk Register\n- Fire & Thermal Safety: UL 9540 / NFPA 855 spacing, BMS cell-level monitoring, and arc-flash isolation.\n- Engineering Disclaimer: Preliminary sizing only; final design requires licensed PE approval.\n`
        },
        competencyRubric: [
          {
            criterion: "Power, Energy, Solar & Battery Calculations",
            developing: "Confuses kW with kWh or omits DoD/efficiency factors.",
            competent: "Accurately calculates E_d (10 MWh/day), P_solar (2.5 MW), and E_battery (~27.8 MWh) with correct units.",
            advanced: "Incorporates degradation allowance, inverter clipping, and critical-load sensitivity tables."
          },
          {
            criterion: "Engineering Assumptions & Safety Risk Register",
            developing: "Presents simplified formulas as a final construction design.",
            competent: "Explicitly documents assumptions, seasonal/weather limitations, centralized vs. distributed trade-offs, and fire/electrical safety risks.",
            advanced: "Defines black-start islanding transitions and protection coordination requirements."
          }
        ],
        careerApplication: {
          workplaceUsage: "Used in renewable energy feasibility studies, microgrid concept proposals, and solar-plus-storage project development.",
          supervisionAndLicensingNote: "Final electrical designs, interconnections, protection settings, and installations must be reviewed and approved by appropriately qualified professionals under applicable codes and local requirements."
        },
        ...(() => {
          const g = buildTenPageTechnicalGuide(
            "Solar Energy & Microgrid Engineering",
            1,
            "Electrical energy, demand, and system sizing",
            "Power vs. energy (E = P × t), 10 MWh/day community demand, 2.5 MW preliminary solar sizing, and 27.8 MWh 48-hour battery storage sizing.",
            [
              "Distinguish power (kW) and energy (kWh)",
              "Estimate community daily energy demand and load diversity",
              "Calculate preliminary solar capacity (2.5 MW)",
              "Calculate preliminary 48-hour battery capacity (27.8 MWh) and outage operating plan"
            ],
            [],
            {
              title: "Community Microgrid Sizing (1,000 Households)",
              problemStatement: "Size preliminary solar and 48-hour battery storage for 10 MWh/day demand.",
              stepByStepSolution: ["E_d = 10,000 kWh/day", "P_solar = 10,000 / (5 × 0.80) = 2,500 kW", "E_battery = 20 / (0.80 × 0.90) = 27.8 MWh"],
              engineeringConclusion: "Preliminary estimates must be refined with hourly load profiles, seasonal weather, and licensed PE review."
            },
            {
              title: "Practical lab 1 — Design a preliminary community microgrid",
              scenario: "Produce hourly load profile, solar calculation, battery worksheet, inverter concept, 48-h outage plan, storage comparison, and risk register.",
              requiredTasks: ["Hourly load profile", "Solar sizing", "Battery sizing", "Inverter concept", "48-h outage plan", "Central vs distributed comparison", "Risk register"],
              submissionDeliverables: ["Microgrid Sizing Worksheet", "48-Hour Outage Plan", "Risk Register"],
              interactiveSimulatorHint: "Maintain strict unit discipline (kW vs. kWh)."
            },
            [{ criterion: "Microgrid Sizing & Engineering Rigor", developing: "Unit errors", competent: "Exact calculations + transparent assumptions + risk register", advanced: "Full 8,760-hour sensitivity modeling" }],
            "Preliminary Community Microgrid Engineering Study",
            "Final designs require review and approval by licensed engineers under applicable electrical codes.",
            [{ title: "OSHA Construction Electrical Safety", organization: "OSHA", url: "https://www.osha.gov/electrical/construction", summary: "Electrical safety regulations." }]
          )
          return { whitePaperPages: g.pages, whitePaperFullMarkdown: g.fullMarkdown }
        })()
      },
      ...[
        { num: 2, title: "Solar irradiance, photovoltaic modules, and array configuration", focus: "Analyze solar geometry, tilt/azimuth optimization, module I-V curves, temperature coefficients (Voc cold-weather rise), and series/parallel string sizing." },
        { num: 3, title: "Inverters, DC/AC conversion, and electrical protection", focus: "Size string and central inverters, evaluate DC/AC clipping ratios, MPPT operating windows, overcurrent protection (OCPD), and rapid shutdown compliance." },
        { num: 4, title: "Battery chemistry, energy capacity, and battery management systems", focus: "Compare LiFePO4 vs. NMC chemistries, C-rates, cell balancing, state-of-charge (SoC) / state-of-health (SoH) telemetry, and UL 9540A thermal runaway mitigation." },
        { num: 5, title: "Load forecasting, diversity, and demand response", focus: "Model 8,760-hour load profiles, coincidence factors, motor inrush currents, and automated load-shedding / demand-response dispatch." },
        { num: 6, title: "Microgrid controls, islanding, and grid synchronization", focus: "Architect grid-forming vs. grid-following inverters, IEEE 1547 anti-islanding, seamless islanding transitions, frequency/voltage droop control, and resynchronization." },
        { num: 7, title: "Protection coordination, grounding, and electrical safety", focus: "Evaluate fault-current contributions from inverter-based resources, relay coordination, system grounding, arc-flash boundaries, and lockout/tagout (LOTO) procedures." },
        { num: 8, title: "Economic analysis, maintenance, and resilience modeling", focus: "Calculate Levelized Cost of Energy (LCOE), Net Present Value (NPV), battery augmentation schedules, O&M preventive maintenance, and outage survival probability." },
        { num: 9, title: "Capstone: produce a preliminary microgrid design and engineering report", focus: "Deliver a comprehensive preliminary microgrid design, single-line concept, sizing calculations, outage operating plan, economic model, and risk register." }
      ].map((m) => {
        const g = buildTenPageTechnicalGuide(
          "Solar Energy & Microgrid Engineering",
          m.num,
          m.title,
          m.focus,
          [`Master ${m.title}`, "Perform rigorous unit-checked calculations", "Document safety and code boundaries"],
          [{ lessonNumber: `Lesson ${m.num}.1`, title: m.title, paragraphs: [m.focus] }],
          {
            title: `Worked Calculation — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: ["1. State environmental and load inputs.", "2. Apply governing electrical equations.", "3. Check thermal and voltage limits.", "4. Document safety margins."],
            engineeringConclusion: "All preliminary calculations must state assumptions and defer final approval to licensed engineers."
          },
          {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: ["Complete engineering worksheet", "Model operating boundaries", "Document safety risks"],
            submissionDeliverables: [`Milestone ${m.num} Microgrid Engineering Deliverable`],
            interactiveSimulatorHint: "Verify units (W, kW, MW, Wh, kWh, MWh) at every step."
          },
          [{ criterion: m.title, developing: "Missing units or assumptions", competent: "Accurate calculations and safety documentation", advanced: "Full sensitivity analysis" }],
          `Milestone ${m.num} Solar & Microgrid Deliverable`,
          "Final electrical designs must be approved by qualified professionals under applicable codes.",
          [{ title: "OSHA Electrical Safety", organization: "OSHA", url: "https://www.osha.gov/electrical/construction", summary: "Electrical safety standards." }]
        )
        return {
          milestoneNumber: m.num,
          title: m.title,
          summary: m.focus,
          learningObjectives: [`Analyze ${m.title}`, "Execute unit-verified calculations", "Document safety and reliability constraints"],
          lessons: [{ lessonNumber: `Lesson ${m.num}.1`, title: m.title, paragraphs: [m.focus] }],
          workedExample: {
            title: `Worked Example — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: ["1. Gather site/system parameters.", "2. Compute nominal and derated values.", "3. Verify protection and thermal limits.", "4. Record assumptions."],
            engineeringConclusion: "Clear separation between preliminary modeling and licensed final engineering is essential."
          },
          practicalLab: {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: ["Complete calculation model", "Evaluate failure modes", "Write engineering summary"],
            submissionDeliverables: [`Milestone ${m.num} Engineering Worksheet`],
            interactiveSimulatorHint: "Check all units and derating factors."
          },
          assessmentQuestions: [
            {
              id: `p5-m${m.num}-q1`,
              prompt: `When completing ${m.title}, why must engineers document all environmental, efficiency, and diversity assumptions explicitly?`,
              options: [
                "Because real-world system performance and safety depend heavily on temperature, shading, load coincidence, and equipment derating; undocumented assumptions hide operational risk.",
                "To make the report harder to read.",
                "Because solar output is identical at every latitude and season.",
                "Assumptions eliminate the need for circuit breakers."
              ],
              correctIndex: 0,
              modelAnswerExplanation: "Transparent assumptions allow peer reviewers and licensed engineers to verify margins under worst-case conditions."
            }
          ],
          passingCriterionNote: "Passing criterion: correct units and calculations, transparent assumptions, and documented safety considerations.",
          professionalDeliverable: {
            title: `Milestone ${m.num} Microgrid Engineering Artifact`,
            format: "Calculation Worksheet & Technical Report",
            templateMarkdown: `# Milestone ${m.num}: ${m.title}\n\n## Calculations & Assumptions\n- ${m.focus}\n\n## Safety & Reliability Review\n- Limitations & Code Notes:\n`
          },
          competencyRubric: [{ criterion: m.title, developing: "Calculation or unit errors", competent: "Verified math + documented assumptions", advanced: "Multi-scenario resilience analysis" }],
          careerApplication: { workplaceUsage: "Applied in solar and microgrid engineering teams.", supervisionAndLicensingNote: "Final designs require licensed PE review and code approval." },
          whitePaperPages: g.pages,
          whitePaperFullMarkdown: g.fullMarkdown
        }
      })
    ]
  },

  // --------------------------------------------------------------------------
  // PATHWAY 6: INDUSTRIAL AUTOMATION & PLC ENGINEERING
  // --------------------------------------------------------------------------
  {
    id: "pathway-6-industrial-plc",
    priorityRank: 6,
    title: "Industrial Automation & PLC Engineering",
    categoryTitle: "Engineering, Robotics & Advanced Manufacturing",
    level: "Beginner to intermediate",
    suggestedDuration: "12 weeks",
    deliveryFormat: "PLC simulator, control-system exercises, and supervised equipment labs",
    bestLearningFormat: "Virtual commissioning and fault diagnosis",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    capstoneSummary: "Simulate an automated industrial process and submit the PLC program, normal/abnormal test matrix evidence, and fault troubleshooting report.",
    safetyOrRegulatoryNotice: "Industrial control systems can create severe physical hazards. Emergency-stop functions and safety-related controls must use a suitable, engineered safety architecture—never rely solely on ordinary PLC software. Early exercises must remain in simulation; physical commissioning must occur only with qualified supervision, LOTO isolation procedures, and approved safety controls.",
    principalReferences: [
      {
        title: "OSHA Construction & Industrial Electrical Safety Standards",
        organization: "OSHA",
        url: "https://www.osha.gov/electrical/construction",
        summary: "Official workplace safety regulations for electrical isolation, lockout/tagout, and machinery hazard control."
      }
    ],
    milestones: [
      {
        milestoneNumber: 1,
        title: "Industrial control systems and PLC fundamentals",
        summary: "PLC hardware architecture (sensors, input modules, CPU, output modules, comms), Boolean run-request logic vs. engineered safety circuits, the 5-step PLC scan cycle, and systematic conveyor fault troubleshooting.",
        learningObjectives: [
          "Identify the 5 core components of a PLC control system: sensors, input modules, CPU/program, output modules, and communication interfaces.",
          "Write and evaluate Boolean control expressions (RunRequest = AutoMode ∧ StartCommand ∧ Permissives ∧ ¬Fault) while distinguishing ordinary control logic from engineered safety circuits.",
          "Trace the repeating PLC scan cycle (Read inputs -> Execute program -> Update outputs -> System/comms tasks -> Repeat).",
          "Diagnose 5 simulated conveyor faults and build a simulator-only start-stop control sequence with a complete normal/abnormal test matrix."
        ],
        lessons: [
          {
            lessonNumber: "Lesson 1.1",
            title: "What is a PLC?",
            paragraphs: [
              "A Programmable Logic Controller (PLC) is an industrial computer designed to monitor inputs, execute a control program, and update outputs to automate machinery or processes.",
              "For example, a tank-filling process might use a level sensor as an input, PLC logic to evaluate the level, and an output to control a filling valve."
            ],
            bulletPoints: [
              "Sensors: detect position, temperature, pressure, level, or flow.",
              "Input modules: receive signals from sensors and switches.",
              "CPU and program: evaluate control logic.",
              "Output modules: operate actuators, indicators, valves, or contactors.",
              "Communication interfaces: exchange information with HMIs, drives, and supervisory systems."
            ]
          },
          {
            lessonNumber: "Lesson 1.2",
            title: "Understand basic PLC logic",
            paragraphs: [
              "Suppose a conveyor should run only when: The system is in automatic mode; The start command is active; The emergency-stop circuit and other required safety conditions permit operation; No relevant fault is active.",
              "This illustrates Boolean logic, not a complete safety circuit. Emergency-stop functions and other safety-related controls must use a suitable, engineered safety architecture; they must not rely solely on ordinary PLC software or an unverified logic expression."
            ],
            mathFormulaBox: {
              title: "Conveyor Ordinary Run-Request Boolean Logic",
              equations: [
                "RunRequest = AutoMode ∧ StartCommand ∧ Permissives ∧ ¬Fault"
              ],
              explanation: "Critical Safety Distinction: Ordinary PLC logic evaluates operational permissives, but Emergency-Stop and safety-interlock functions require dedicated hardwired safety relays or certified safety PLCs (e.g., IEC 61508 / ISO 13849)."
            }
          },
          {
            lessonNumber: "Lesson 1.3",
            title: "PLC scan cycle",
            paragraphs: [
              "Many PLCs repeatedly execute a scan cycle:",
              "The exact sequence depends on the controller and configuration. Understanding the scan cycle helps learners reason about timing, sensor changes, output behavior, and faults. Time-critical or safety-related behavior requires additional design and validation."
            ],
            orderedSteps: [
              "Read inputs or update the process image.",
              "Execute the user program.",
              "Update outputs.",
              "Perform system and communication tasks as applicable.",
              "Repeat."
            ]
          },
          {
            lessonNumber: "Lesson 1.4",
            title: "Troubleshoot a simulated conveyor",
            paragraphs: [
              "Provide learners with a virtual conveyor, a motor run command, a sensor, a fault indicator, and a PLC program.",
              "Learners must trace the signal path, inspect input and output states, identify the cause, and document the correction."
            ],
            bulletPoints: [
              "Simulated Fault 1: A sensor remains permanently active (stuck high / short-circuited input).",
              "Simulated Fault 2: The start command is not reaching the PLC (open wire or HMI tag mismatch).",
              "Simulated Fault 3: A motor permissive is false (downstream interlock or guard switch open).",
              "Simulated Fault 4: A fault bit remains latched (requires explicit fault-clear condition and reset pulse).",
              "Simulated Fault 5: The HMI displays a stale status value (communication polling drop or unmapped tag)."
            ]
          }
        ],
        workedExample: {
          title: "Conveyor Non-Start Fault Diagnosis & Safe Restart Policy",
          problemStatement: "In the virtual conveyor simulator, the operator presses START on the HMI. The HMI indicator shows 'START PRESSED', `AutoMode = 1`, and `Fault = 0`, yet `RunRequest` remains `0` and the motor contactor does not energize. How do you systematically isolate the fault across the PLC scan cycle and signal path?",
          stepByStepSolution: [
            "1. Inspect the Input Process Image: Open the PLC online monitor and check the boolean state of each term in `RunRequest = AutoMode ∧ StartCommand ∧ Permissives ∧ ¬Fault`.",
            "2. Compare HMI Tag vs. PLC Input Address: Observe that `AutoMode = 1` and `Fault = 0`, `StartCommand = 1`, but `Permissives` evaluates to `0` because `I:0/4` (Downstream Photoeye Clear Interlock) is stuck active (`1` = blocked) due to a misaligned reflector.",
            "3. Verify Restart Policy After Power/Fault Recovery: Confirm that clearing the photoeye blockage (`Permissives -> 1`) does NOT cause an unexpected automatic motor start without a fresh, deliberate rising-edge `StartCommand` operator action.",
            "4. Document Signal Trace & Correction: Record the input address `I:0/4`, root cause (stuck sensor state), corrective action, and post-fix test matrix verification."
          ],
          engineeringConclusion: "Tracing the process image term-by-term isolates field signal vs. logic vs. HMI faults, and safe restart logic prevents unexpected machine motion upon fault clearing."
        },
        practicalLab: {
          title: "Practical lab 1 — Build a start-stop control sequence",
          scenario: "Develop a simulator-only PLC control program for an industrial conveyor and execute a full normal and abnormal test matrix.",
          requiredTasks: [
            "Implement Start and Stop commands with dominant Stop behavior (Stop overrides Start when both are asserted simultaneously).",
            "Implement a Run-State indicator and a latched Fault state.",
            "Design a safe restart policy after power interruption or fault reset (system must return to a safe idle state and require a new deliberate Start command rather than auto-restarting).",
            "Include input validation (e.g., conflicting sensor states or stuck start button detection) and clear state transitions.",
            "Construct and execute a test matrix covering normal startup/shutdown, conflicting Start+Stop commands, sensor failure, and fault recovery."
          ],
          submissionDeliverables: [
            "Simulator PLC Program & State-Transition Diagram",
            "Normal & Abnormal Behavior Test Matrix",
            "5-Fault Conveyor Troubleshooting Log"
          ],
          interactiveSimulatorHint: "Keep all early exercises strictly in simulation; verify how your sequence responds when Start and Stop are pressed simultaneously and after power restoration."
        },
        assessmentQuestions: [
          {
            id: "p6-m1-q1",
            prompt: "Why must emergency-stop functions and other safety-related controls NOT rely solely on ordinary PLC software expression logic?",
            options: [
              "Because ordinary PLC software, I/O modules, or scan cycles can fault or freeze; life-safety E-stop functions require an engineered safety architecture (such as hardwired safety relays or certified safety controllers).",
              "Because ordinary PLCs cannot evaluate Boolean AND/OR expressions.",
              "Because emergency stops are only used on office computers.",
              "Ordinary PLC software is sufficient for all life-safety functions without any hardware safety circuit."
            ],
            correctIndex: 0,
            modelAnswerExplanation: "Safety-related controls must use an engineered safety architecture rather than relying solely on ordinary PLC application logic."
          },
          {
            id: "p6-m1-q2",
            prompt: "In the Boolean expression RunRequest = AutoMode ∧ StartCommand ∧ Permissives ∧ ¬Fault, what is the value of RunRequest if AutoMode = 1, StartCommand = 1, Permissives = 1, and Fault = 1?",
            options: [
              "0 (False — the active Fault negates ¬Fault to 0, preventing the conveyor from running)",
              "1 (True — because AutoMode and StartCommand are active)",
              "Undefined",
              "The conveyor runs at double speed"
            ],
            correctIndex: 0,
            modelAnswerExplanation: "When Fault = 1, ¬Fault = 0, so the logical conjunction (AND) evaluates to 0."
          },
          {
            id: "p6-m1-q3",
            prompt: "What is the correct safe restart behavior after a power interruption or after a latched fault is cleared?",
            options: [
              "The conveyor motor should immediately spin up without warning as soon as power returns.",
              "The control sequence must initialize to a safe stopped state and require a deliberate new operator Start command after all permissives are verified.",
              "The PLC should permanently delete its user program.",
              "All fault indicators should be disabled."
            ],
            correctIndex: 1,
            modelAnswerExplanation: "Preventing unexpected automatic restart after power restoration or fault reset is a fundamental machinery control requirement."
          }
        ],
        passingCriterionNote: "Assessment standard: successful simulation of all required scenarios, correct explanation of the logic, and evidence that fault handling and restart behavior were tested.",
        professionalDeliverable: {
          title: "PLC Simulator Start-Stop Control Sequence, Test Matrix & 5-Fault Diagnostic Report",
          format: "PLC Engineering Dossier (Logic Export + Test Matrix Markdown/PDF)",
          templateMarkdown: `# PLC Start-Stop Sequence & Fault Diagnostic Report\n\n## 1. Boolean Control Logic & Stop-Dominant Seal-In\n- Ordinary Run Logic: $\\text{RunRequest} = \\text{AutoMode} \\land (\\text{StartEdge} \\lor \\text{RunState}) \\land \\neg\\text{StopCommand} \\land \\text{Permissives} \\land \\neg\\text{Fault}$\n- Safety Architecture Note: Hardwired E-Stop safety relay removes actuator power independently of ordinary PLC logic.\n\n## 2. Normal & Abnormal Test Matrix\n| Test ID | Scenario | Inputs Asserted | Expected Output | Simulation Result |\n|---|---|---|---|---|\n| T-01 | Normal Start | Auto=1, Perm=1, Fault=0, Start=1 | RunState = 1 | PASS |\n| T-02 | Conflicting Start + Stop | Start=1 AND Stop=1 | RunState = 0 (Stop Dominant) | PASS |\n| T-03 | Power Loss & Restore | Power Cycled while Running | RunState = 0 (No Auto-Restart) | PASS |\n| T-04 | Latched Fault Recovery | Fault Triggered -> Cleared without Reset | RunState = 0 until Reset + New Start | PASS |\n`
        },
        competencyRubric: [
          {
            criterion: "Control Sequence & State Transition Logic",
            developing: "Allows unexpected auto-restart after fault clear or fails when Start and Stop are pressed together.",
            competent: "Implements stop-dominant logic, explicit fault latching/reset, and safe power-recovery state transitions.",
            advanced: "Includes sensor plausibility timers (debounce/stuck-sensor detection) and structured state machine documentation."
          },
          {
            criterion: "5-Fault Conveyor Troubleshooting & Test Matrix",
            developing: "Guesses fault causes without inspecting input/output process image states.",
            competent: "Systematically traces signal paths across all 5 simulated faults and completes the normal/abnormal test matrix.",
            advanced: "Documents HMI communication watchdog logic and preventive diagnostic alarms."
          }
        ],
        careerApplication: {
          workplaceUsage: "Used by automation engineers, controls technicians, and industrial maintenance specialists in manufacturing, water treatment, and material handling.",
          supervisionAndLicensingNote: "Early exercises must remain in simulation; physical commissioning must occur only with suitable supervision, isolation (LOTO) procedures, and approved safety controls."
        },
        ...(() => {
          const g = buildTenPageTechnicalGuide(
            "Industrial Automation & PLC Engineering",
            1,
            "Industrial control systems and PLC fundamentals",
            "PLC components, Boolean RunRequest logic vs. safety architecture, the 5-step scan cycle, and conveyor fault diagnosis.",
            [
              "Identify sensors, input modules, CPU, output modules, and comms",
              "Write Boolean control logic and distinguish engineered safety circuits",
              "Explain the PLC scan cycle",
              "Troubleshoot 5 conveyor faults and test a start-stop control sequence"
            ],
            [],
            {
              title: "Conveyor Signal Path & Non-Start Troubleshooting",
              problemStatement: "Isolate why RunRequest = 0 when Start is pressed on the HMI.",
              stepByStepSolution: ["Inspect process image inputs", "Check Permissives and Fault latch bits", "Verify HMI tag communication", "Confirm safe restart after fault reset"],
              engineeringConclusion: "Safety functions must use engineered safety hardware, and control logic must prevent unexpected restart."
            },
            {
              title: "Practical lab 1 — Build a start-stop control sequence",
              scenario: "Develop a simulator-only program with Start/Stop, Run indicator, Fault state, safe power-interruption restart policy, and normal/abnormal test matrix.",
              requiredTasks: ["Start/Stop logic", "Latched fault & reset", "Safe power-restart policy", "Normal & abnormal test matrix"],
              submissionDeliverables: ["Simulator Program", "Test Matrix", "Troubleshooting Report"],
              interactiveSimulatorHint: "Test conflicting Start+Stop commands and power-cycle behavior in simulation."
            },
            [{ criterion: "PLC Logic & Fault Matrix", developing: "Auto-restarts unsafely", competent: "Stop-dominant logic + verified fault/restart test matrix", advanced: "Full state-machine diagnostics" }],
            "PLC Start-Stop Control Sequence & Test Matrix Report",
            "Physical commissioning requires qualified supervision, LOTO isolation, and engineered safety controls.",
            [{ title: "OSHA Electrical Safety", organization: "OSHA", url: "https://www.osha.gov/electrical/construction", summary: "Workplace electrical and machinery safety standards." }]
          )
          return { whitePaperPages: g.pages, whitePaperFullMarkdown: g.fullMarkdown }
        })()
      },
      ...[
        { num: 2, title: "Digital and analog I/O, electrical signals, and sensors", focus: "Wire and scale 24V DC sinking/sourcing digital inputs, 4–20 mA / 0–10V analog transmitters, RTD/thermocouple temperature inputs, and ADC resolution scaling." },
        { num: 3, title: "Ladder logic, function blocks, and structured programming", focus: "Design IEC 61131-3 Ladder Diagram (LD), Function Block Diagram (FBD), and Structured Text (ST) routines with modular reusable function blocks." },
        { num: 4, title: "Timers, counters, sequencing, and state machines", focus: "Program TON/TOF/RTO timers, CTU/CTD counters, deterministic step-sequence state machines, and watchdog timeout fault traps." },
        { num: 5, title: "Motors, variable-frequency drives, and actuators", focus: "Configure 3-phase motor starters, overload protection, Variable-Frequency Drive (VFD) acceleration/deceleration profiles, and pneumatic/hydraulic valve feedback." },
        { num: 6, title: "HMI design, alarms, and operator workflows", focus: "Design high-performance ISA-101 HMI screens, ISA-18.2 alarm rationalization (preventing alarm floods), and clear operator diagnostic faceplates." },
        { num: 7, title: "Industrial networking and communication protocols", focus: "Configure EtherNet/IP, PROFINET, Modbus TCP/RTU, OPC UA deterministic polling, VLAN segmentation, and communication loss watchdogs." },
        { num: 8, title: "Diagnostics, maintenance, and industrial cybersecurity", focus: "Perform online cross-reference fault tracing, I/O forcing audits, IEC 62443 OT network zoning/conduits, and backup/version control governance." },
        { num: 9, title: "Capstone: simulate an automated process and submit the program, test evidence, and troubleshooting report", focus: "Design and simulate a complete multi-stage automated industrial process, execute normal and fault-injection test matrices, and submit a comprehensive commissioning report." }
      ].map((m) => {
        const g = buildTenPageTechnicalGuide(
          "Industrial Automation & PLC Engineering",
          m.num,
          m.title,
          m.focus,
          [`Master ${m.title}`, "Validate logic in simulation", "Document normal and abnormal test evidence"],
          [{ lessonNumber: `Lesson ${m.num}.1`, title: m.title, paragraphs: [m.focus] }],
          {
            title: `Worked Simulation — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: ["1. Define I/O map and state diagram.", "2. Implement modular PLC routine.", "3. Inject simulated sensor/actuator faults.", "4. Verify safe fallback states."],
            engineeringConclusion: "Every automated sequence must fail safe on sensor loss, conflicting commands, or communication drop."
          },
          {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: ["Develop simulator routine", "Execute fault-injection test matrix", "Document troubleshooting steps"],
            submissionDeliverables: [`Milestone ${m.num} PLC Program & Test Report`],
            interactiveSimulatorHint: "Remain in simulation; never bypass safety interlocks."
          },
          [{ criterion: m.title, developing: "Untested fault states", competent: "Verified normal and abnormal simulation matrix", advanced: "Full IEC 61131-3 modular diagnostics" }],
          `Milestone ${m.num} PLC Engineering Deliverable`,
          "Physical equipment work requires qualified supervision, LOTO isolation, and engineered safety controls.",
          [{ title: "OSHA Electrical Safety", organization: "OSHA", url: "https://www.osha.gov/electrical/construction", summary: "Industrial electrical safety regulations." }]
        )
        return {
          milestoneNumber: m.num,
          title: m.title,
          summary: m.focus,
          learningObjectives: [`Implement ${m.title}`, "Verify fault handling in simulation", "Document test matrix evidence"],
          lessons: [{ lessonNumber: `Lesson ${m.num}.1`, title: m.title, paragraphs: [m.focus] }],
          workedExample: {
            title: `Worked Example — ${m.title}`,
            problemStatement: m.focus,
            stepByStepSolution: ["1. Map I/O addresses.", "2. Write deterministic state transitions.", "3. Test sensor failure modes.", "4. Record commissioning matrix."],
            engineeringConclusion: "Simulation testing verifies deterministic behavior before any physical commissioning."
          },
          practicalLab: {
            title: `Practical lab ${m.num} — ${m.title}`,
            scenario: m.focus,
            requiredTasks: ["Build PLC logic", "Run abnormal fault tests", "Submit commissioning report"],
            submissionDeliverables: [`Milestone ${m.num} Simulation Artifact`],
            interactiveSimulatorHint: "Test all edge cases in the virtual simulator."
          },
          assessmentQuestions: [
            {
              id: `p6-m${m.num}-q1`,
              prompt: `In ${m.title}, why must abnormal conditions (such as sensor wire break or communication timeout) be explicitly tested in the simulator?`,
              options: [
                "To verify that the control program transitions to a known safe state and alerts the operator rather than continuing blind operation.",
                "Because sensors never fail in industrial plants.",
                "To bypass hardwired emergency stops.",
                "So that outputs stay energized forever during a fault."
              ],
              correctIndex: 0,
              modelAnswerExplanation: "Testing abnormal conditions ensures deterministic fail-safe behavior and clear operator diagnostics."
            }
          ],
          passingCriterionNote: "Passing criterion: successful simulation of all required scenarios and documented fault/restart evidence.",
          professionalDeliverable: {
            title: `Milestone ${m.num} PLC Control & Test Report`,
            format: "Simulator Logic & Test Matrix Package",
            templateMarkdown: `# Milestone ${m.num}: ${m.title}\n\n## Control Logic & I/O Map\n- ${m.focus}\n\n## Fault-Injection Test Matrix\n- Normal Scenarios:\n- Abnormal / Fault Scenarios:\n`
          },
          competencyRubric: [{ criterion: m.title, developing: "Missing fault handling", competent: "Complete simulation + abnormal test matrix", advanced: "Full HMI diagnostic alarm integration" }],
          careerApplication: { workplaceUsage: "Applied in industrial automation and controls engineering.", supervisionAndLicensingNote: "Physical commissioning requires LOTO isolation and qualified supervision." },
          whitePaperPages: g.pages,
          whitePaperFullMarkdown: g.fullMarkdown
        }
      })
    ]
  }
]

// ============================================================================
// 5. AUTHORITATIVE ACADEMY REFERENCE LIBRARY
// ============================================================================
export const ACADEMY_REFERENCE_LIBRARY = [
  {
    category: "Application Penetration Testing",
    focus: "Web security methodology, testing procedures, and reporting.",
    title: "OWASP Web Security Testing Guide (WSTG)",
    organization: "OWASP Foundation",
    url: "https://owasp.org/www-project-web-security-testing-guide/",
    badge: "PRINCIPAL PENTEST REFERENCE"
  },
  {
    category: "AI Engineering and Cybersecurity Careers",
    focus: "AI risk management across design, development, use, and evaluation.",
    title: "NIST AI Risk Management Framework (AI RMF 1.0)",
    organization: "National Institute of Standards and Technology (NIST)",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    badge: "AI RISK STANDARD"
  },
  {
    category: "Generative AI Risk & Governance",
    focus: "Additional generative-AI risk considerations, confabulation controls, and RAG evaluation.",
    title: "NIST Generative AI Profile (NIST AI 600-1)",
    organization: "National Institute of Standards and Technology (NIST)",
    url: "https://www.nist.gov/itl/ai-risk-management-framework/ai-risk-management-framework-resources",
    badge: "GENAI PROFILE"
  },
  {
    category: "Cybersecurity Workforce Competencies",
    focus: "Workforce tasks, knowledge, and skill statements for digital defense roles.",
    title: "NIST NICE Workforce Framework for Cybersecurity",
    organization: "National Institute of Standards and Technology (NIST)",
    url: "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center",
    badge: "NICE WORKFORCE"
  },
  {
    category: "Construction, Electrical and Industrial Safety",
    focus: "Official workplace safety regulations and guidance for construction and electrical work.",
    title: "OSHA Construction Electrical Safety",
    organization: "Occupational Safety and Health Administration (OSHA)",
    url: "https://www.osha.gov/electrical/construction",
    badge: "OSHA SAFETY STANDARD"
  }
]

// ============================================================================
// 6. REUSABLE CAREER-PATH SPECIFICATION GENERATOR (SECTION 7 TEMPLATE)
// ============================================================================
export interface CareerSpecGeneratorInput {
  careerTitle: string
  categoryTitle: string
  learnerLevel:
    | "Beginner to advanced"
    | "Intermediate to specialist"
    | "Experienced professional to leadership"
  programDuration:
    | "4 weeks — introductory"
    | "8 weeks — focused skills"
    | "12 weeks — intensive pathway"
    | "24 weeks — extended pathway"
  deliveryMethod:
    | "Online"
    | "Hybrid: online and hands-on"
    | "Instructor-led practical training"
  targetOutcome:
    | "Job readiness and professional portfolio"
    | "Advanced specialization"
    | "Supervisory or leadership role"
    | "Independent business ownership"
}

export function generateDynamicCareerPathway(
  input: CareerSpecGeneratorInput
): PriorityCareerPathway {
  // Check if this career matches one of the 6 Priority Flagship Pathways first
  const normalized = input.careerTitle.toLowerCase()
  const matchedPriority = PRIORITY_6_CAREER_PATHWAYS.find(
    (p) =>
      p.title.toLowerCase() === normalized ||
      (normalized.includes("penetration") && p.id === "pathway-1-app-pentest") ||
      ((normalized.includes("llm") || normalized.includes("rag") || normalized.includes("ai application")) &&
        p.id === "pathway-2-ai-llm-eng") ||
      (normalized.includes("superintendent") && p.id === "pathway-3-construction-superintendent") ||
      (normalized.includes("cloud security") && p.id === "pathway-4-cloud-security-architect") ||
      ((normalized.includes("solar") || normalized.includes("microgrid")) &&
        p.id === "pathway-5-solar-microgrid") ||
      ((normalized.includes("plc") || normalized.includes("industrial automation")) &&
        p.id === "pathway-6-industrial-plc")
  )

  if (matchedPriority) {
    return {
      ...matchedPriority,
      title: input.careerTitle,
      level: input.learnerLevel,
      suggestedDuration: input.programDuration,
      deliveryFormat: `${input.deliveryMethod} · Outcome: ${input.targetOutcome}`
    }
  }

  // Otherwise generate a complete, tailored 9-Milestone Career Mastery Pathway modeled on the signature format
  const milestoneTemplates = [
    {
      num: 1,
      title: `Foundations & technical diagnostics for ${input.careerTitle}`,
      focus: `Core technical principles, system components, terminology, measurement units, and baseline diagnostic inspection for ${input.careerTitle}.`
    },
    {
      num: 2,
      title: `Architecture, drawings/models & boundary analysis`,
      focus: `Reading technical schematics, system architectures, trust or load boundaries, and interface coordination in ${input.careerTitle}.`
    },
    {
      num: 3,
      title: `Core quantitative calculations, sizing & estimation`,
      focus: `Applied mathematics, quantity takeoffs, capacity/performance calculations, tolerance verification, and resource estimation.`
    },
    {
      num: 4,
      title: `Professional tools, instrumentation & sandbox workflows`,
      focus: `Operating domain-standard software, diagnostic instrumentation, simulation sandboxes, and calibrated measurement procedures.`
    },
    {
      num: 5,
      title: `Quality assurance, safety controls & regulatory standards`,
      focus: `Hazard identification, safety interlocks/OSHA compliance, quality control hold points, and applicable industry codes.`
    },
    {
      num: 6,
      title: `Troubleshooting, fault isolation & incident analysis`,
      focus: `Systematic root-cause fault tracing, abnormal scenario testing, nonconformance documentation, and corrective action verification.`
    },
    {
      num: 7,
      title: `Governance, documentation, RFIs & stakeholder coordination`,
      focus: `Formal technical reporting, change control, chain-of-custody or audit evidence collection, and cross-functional communication.`
    },
    {
      num: 8,
      title: `Cost control, operational optimization & business practice`,
      focus: `${
        input.targetOutcome === "Independent business ownership"
          ? "Scoping engagements, client contracts, insurance, pricing, scheduling, cash flow, and quality delivery for an independent practice."
          : "Performance optimization, schedule/cost trade-off analysis, reliability engineering, and operational resilience."
      }`
    },
    {
      num: 9,
      title: `Capstone project & peer defense (${input.targetOutcome})`,
      focus: `Design, execute, validate, and document a realistic end-to-end ${input.careerTitle} project and defend decisions against a measurable rubric.`
    }
  ]

  const milestones: PathwayMilestoneUnit[] = milestoneTemplates.map((m) => {
    const g = buildTenPageTechnicalGuide(
      input.careerTitle,
      m.num,
      m.title,
      m.focus,
      [
        `Demonstrate technical mastery of ${m.title} at the '${input.learnerLevel}' tier`,
        `Complete the practical laboratory exercise via '${input.deliveryMethod}' delivery`,
        `Produce a verified portfolio artifact aligned with '${input.targetOutcome}'`
      ],
      [
        {
          lessonNumber: `Lesson ${m.num}.1`,
          title: `Core Principles: ${m.title}`,
          paragraphs: [
            m.focus,
            `Program Configuration: ${input.programDuration} (${input.deliveryMethod}) targeting ${input.targetOutcome}.`,
            `Every operation in ${input.careerTitle} must separate verified evidence and calculations from unverified assumptions.`
          ]
        },
        {
          lessonNumber: `Lesson ${m.num}.2`,
          title: `Standards, Safety & Verification Boundaries`,
          paragraphs: [
            `Practitioners in ${input.careerTitle} must verify scope, safety controls, and regulatory boundaries before executing technical tasks.`,
            `When technical drawings, source documents, or telemetry are incomplete, escalate formally rather than guessing.`
          ]
        }
      ],
      {
        title: `${input.careerTitle} — Milestone ${m.num} Worked Problem`,
        problemStatement: `Execute a step-by-step technical analysis and verification check for ${m.title}.`,
        stepByStepSolution: [
          `1. Define scope, input parameters, and required safety/authorization controls for ${input.careerTitle}.`,
          `2. Map system components, interfaces, and governing equations or regulatory criteria.`,
          `3. Execute quantitative calculation or controlled diagnostic validation in the sandbox.`,
          `4. Document reproducible evidence, limitations, and recommended corrective actions.`
        ],
        engineeringConclusion: `Competent execution in ${input.careerTitle} requires reproducible calculations, explicit assumptions, and documented verification.`
      },
      {
        title: `Practical lab ${m.num} — ${m.title}`,
        scenario: `Complete a realistic ${input.careerTitle} scenario for Milestone ${m.num} (${m.focus}).`,
        requiredTasks: [
          `Document system scope, inputs, and safety/authorization prerequisites.`,
          `Perform required calculations, diagnostic traces, or configuration tasks.`,
          `Identify five potential failure modes, quality defects, or safety risks and specify mitigations.`,
          `Author the Milestone ${m.num} professional deliverable artifact.`
        ],
        submissionDeliverables: [
          `Milestone ${m.num} Technical Worksheet & Evidence Log`,
          `5-Point Risk & Quality Control Matrix`,
          `Portfolio Deliverable for ${input.careerTitle}`
        ],
        interactiveSimulatorHint: `Follow the 9-Component Career Mastery rubric and cite authoritative reference standards.`
      },
      [
        {
          criterion: `Technical Accuracy & Methodological Rigor (${m.title})`,
          developing: "Contains unverified assumptions, calculation errors, or incomplete scope boundaries.",
          competent: "Demonstrates accurate calculations, clear assumptions, and reproducible laboratory evidence.",
          advanced: "Includes multi-scenario sensitivity analysis, peer-defensible documentation, and preventive controls."
        }
      ],
      `Milestone ${m.num} Portfolio Artifact — ${input.careerTitle}`,
      `Important: A ${input.programDuration} pathway is an intensive structured learning program; it does not promise automatic mastery, statutory licensure, or a guaranteed salary. Regulated work requires appropriate accredited education, supervised practice, and local licensing.`,
      ACADEMY_REFERENCE_LIBRARY.slice(0, 3).map((r) => ({
        title: r.title,
        organization: r.organization,
        url: r.url,
        summary: r.focus
      }))
    )

    return {
      milestoneNumber: m.num,
      title: m.title,
      summary: m.focus,
      learningObjectives: [
        `Master ${m.title} for ${input.careerTitle}.`,
        `Execute the Practical Lab and achieve >= 80% on the Knowledge Assessment.`,
        `Submit a defensible ${input.targetOutcome} deliverable.`
      ],
      lessons: [
        {
          lessonNumber: `Lesson ${m.num}.1`,
          title: `Technical Foundations: ${m.title}`,
          paragraphs: [
            m.focus,
            `This milestone is structured for ${input.learnerLevel} learners in a ${input.programDuration} (${input.deliveryMethod}) format focused on ${input.targetOutcome}.`
          ]
        },
        {
          lessonNumber: `Lesson ${m.num}.2`,
          title: `Operational Control Cycle & Quality Verification`,
          paragraphs: [
            `Before executing tasks in ${input.careerTitle}, confirm approved specifications are available, verify tools and safety controls, monitor deviations, and document reproducible evidence.`
          ],
          orderedSteps: [
            "Confirm approved scope, drawings/specifications, and safety/authorization controls.",
            "Map system components, interfaces, and governing parameters.",
            "Perform calculations and controlled diagnostic validation.",
            "Verify results against the competency rubric and record limitations.",
            "Produce the downloadable portfolio deliverable."
          ]
        }
      ],
      workedExample: {
        title: `Worked Professional Scenario — ${m.title}`,
        problemStatement: `How does a ${input.careerTitle} practitioner execute and verify ${m.title} under realistic workplace constraints?`,
        stepByStepSolution: [
          "1. Establish baseline parameters and verify scope/safety prerequisites.",
          "2. Perform unit-checked quantitative calculations or diagnostic tests.",
          "3. Escalate any missing specification data formally rather than guessing.",
          "4. Compile reproducible evidence, risk mitigations, and quality sign-off."
        ],
        engineeringConclusion: "Verified calculations, transparent assumptions, and formal escalation of ambiguities define professional competence."
      },
      practicalLab: {
        title: `Practical lab ${m.num} — ${m.title}`,
        scenario: m.focus,
        requiredTasks: [
          "Complete the system inventory and calculation worksheet.",
          "Identify missing information or edge-case conflicts and document formal escalation.",
          "Identify five safety, security, or quality risks and specify controls.",
          "Submit the completed deliverable artifact for rubric evaluation."
        ],
        submissionDeliverables: [
          `Milestone ${m.num} Technical Deliverable`,
          "Calculation & Diagnostic Log",
          "5-Risk Control Matrix"
        ],
        interactiveSimulatorHint: "Use the 9-Component checklist to verify all deliverables before submission."
      },
      assessmentQuestions: [
        {
          id: `dyn-m${m.num}-q1`,
          prompt: `When executing ${m.title} as a ${input.careerTitle}, what should you do when critical specification data or permissions are missing?`,
          options: [
            "Escalate the missing information formally through the approved project/engineering process and document the constraint rather than guessing.",
            "Guess the missing values and hide the assumption from the final report.",
            "Skip all safety and authorization checks to save time.",
            "Fabricate test evidence without running the lab."
          ],
          correctIndex: 0,
          modelAnswerExplanation: "Professional practice requires escalating missing specifications or permissions formally rather than guessing."
        }
      ],
      passingCriterionNote: "Passing criterion: 80% on the knowledge check and successful completion of the practical lab deliverable against the competency rubric.",
      professionalDeliverable: {
        title: `Milestone ${m.num} Deliverable — ${m.title}`,
        format: "Versioned Technical Portfolio Artifact (Markdown / PDF)",
        templateMarkdown: `# ${input.careerTitle} — Milestone ${m.num} Deliverable\n## ${m.title}\n- **Learner Level**: ${input.learnerLevel}\n- **Program Duration**: ${input.programDuration}\n- **Delivery Method**: ${input.deliveryMethod}\n- **Target Outcome**: ${input.targetOutcome}\n\n## 1. Scope & Technical Calculations\n- ${m.focus}\n\n## 2. Practical Lab Evidence & 5 Risk Controls\n1.\n2.\n3.\n4.\n5.\n`
      },
      competencyRubric: [
        {
          criterion: "Technical Execution, Calculations & Evidence",
          developing: "Incomplete calculations or unverified assumptions.",
          competent: "Accurate calculations, documented assumptions, and complete lab deliverable.",
          advanced: "Comprehensive risk register, sensitivity analysis, and mentor-ready portfolio artifact."
        }
      ],
      careerApplication: {
        workplaceUsage: `Directly applicable to ${input.careerTitle} roles targeting ${input.targetOutcome}.`,
        supervisionAndLicensingNote: "Platform certificates record completed modules and portfolio evidence; regulated professions require accredited education, supervised practice, and statutory licensing."
      },
      whitePaperPages: g.pages,
      whitePaperFullMarkdown: g.fullMarkdown
    }
  })

  return {
    id: `custom-${input.careerTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    priorityRank: 7,
    title: input.careerTitle,
    categoryTitle: input.categoryTitle,
    level: input.learnerLevel,
    suggestedDuration: input.programDuration,
    deliveryFormat: input.deliveryMethod,
    bestLearningFormat: `${input.deliveryMethod} · ${input.targetOutcome}`,
    coverImage: "/images/connectln-studies/business-capstone-cover.jpg",
    capstoneSummary: `Complete all 9 milestones and deliver a verified ${input.targetOutcome} capstone project for ${input.careerTitle}.`,
    safetyOrRegulatoryNotice:
      "Important: An intensive learning pathway builds practical skills and portfolio evidence, but it does not promise automatic mastery, professional licensure, or a particular salary. Regulated clinical, engineering, electrical, and trade work requires appropriate accredited education, supervised practice, and local licensing.",
    principalReferences: ACADEMY_REFERENCE_LIBRARY.map((r) => ({
      title: r.title,
      organization: r.organization,
      url: r.url,
      summary: r.focus
    })),
    milestones
  }
}
