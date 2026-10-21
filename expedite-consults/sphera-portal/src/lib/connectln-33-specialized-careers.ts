import {
  PriorityCareerPathway,
  PathwayMilestoneUnit,
  PathwayLesson
} from "@/lib/connectln-career-mastery-academy"
import { RoadmapWhitePaperPage } from "@/lib/learning-roadmap-whitepapers"

export interface TenComponentProductionItem {
  number: string
  component: string
  whatToInclude: string
}

export interface PriorityAcademyCluster {
  id: string
  academyNumber: number
  title: string
  focusAreas: string
  coverImage: string
  badgeColor: string
  careerNumbers: number[]
  flagshipPathwayIds: string[]
}

export interface SpecializedTangibleCareerSpec {
  careerNumber: number
  id: string
  title: string
  domainNumber: number
  domainTitle: string
  academyId: string
  coverImage: string
  tangibleEvidenceType: string
  coreCurriculumBullets: string[]
  capstoneProject: string
  workedFormulaTitle: string
  workedFormulaEquations: string[]
  workedFormulaExplanation: string
  workedProblemStatement: string
  workedStepByStep: string[]
  workedConclusion: string
  practicalLabScenario: string
  practicalLabTasks: string[]
  answerKeyQuestion: {
    prompt: string
    options: string[]
    correctIndex: number
    explanation: string
  }
  careerGuidance: {
    prerequisites: string
    targetRoles: string
    qualificationsAndNextSteps: string
  }
  mentorReviewCriteria: string[]
  regulatoryBoundaryNote?: string
  principalReferences: {
    title: string
    organization: string
    url: string
    summary: string
  }[]
}

// ============================================================================
// 1. THE 10-COMPONENT CONSISTENT PRODUCTION STANDARD
// ============================================================================

export const TEN_COMPONENT_PRODUCTION_STANDARD: TenComponentProductionItem[] = [
  {
    number: "01",
    component: "Technical handbook",
    whatToInclude: "Detailed explanations, terminology, diagrams, and references"
  },
  {
    number: "02",
    component: "Nine learning milestones",
    whatToInclude: "Ordered progression from foundations to capstone"
  },
  {
    number: "03",
    component: "Practical labs",
    whatToInclude: "Simulations, sample datasets, exercises, and tool-based tasks"
  },
  {
    number: "04",
    component: "Worked examples",
    whatToInclude: "Calculations or decisions explained step by step"
  },
  {
    number: "05",
    component: "Knowledge checks",
    whatToInclude: "Quizzes, scenario questions, and troubleshooting challenges"
  },
  {
    number: "06",
    component: "Portfolio project",
    whatToInclude: "A professional artifact demonstrating applied skills"
  },
  {
    number: "07",
    component: "Competency rubric",
    whatToInclude: "Transparent criteria and measurable pass requirements"
  },
  {
    number: "08",
    component: "Professional references",
    whatToInclude: "Relevant standards, official manuals, and reputable source material"
  },
  {
    number: "09",
    component: "Career guidance",
    whatToInclude: "Prerequisites, relevant experience, qualifications, and next steps"
  },
  {
    number: "10",
    component: "Mentor review",
    whatToInclude: "Human review where practical competence or professional judgment matters"
  }
]

// ============================================================================
// 2. THE 5 PRIORITY DEEP-DIVE ACADEMIES
// ============================================================================

export const FIVE_PRIORITY_ACADEMIES: PriorityAcademyCluster[] = [
  {
    id: "academy-1-cybersecurity-specialist",
    academyNumber: 1,
    title: "Cybersecurity Specialist Academy",
    focusAreas:
      "Penetration testing, DFIR, threat hunting, identity security, cloud security, AI security, and secure software supply chains.",
    coverImage: "/images/connectln-studies/cyber-specialist-cover.jpg",
    badgeColor: "from-sky-600 to-indigo-700",
    careerNumbers: [6, 7, 8, 9, 10],
    flagshipPathwayIds: ["pathway-1-application-penetration-tester", "pathway-4-soc-analyst-dfir"]
  },
  {
    id: "academy-2-engineering-critical-infrastructure",
    academyNumber: 2,
    title: "Engineering and Critical Infrastructure Academy",
    focusAreas:
      "Power systems, microgrids, industrial automation, water systems, infrastructure inspection, and building performance.",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    badgeColor: "from-amber-600 to-orange-700",
    careerNumbers: [1, 2, 3, 4, 5, 26, 28, 29],
    flagshipPathwayIds: ["pathway-5-industrial-automation-plc", "pathway-6-solar-microgrid"]
  },
  {
    id: "academy-3-ai-software-engineering",
    academyNumber: 3,
    title: "AI and Software Engineering Academy",
    focusAreas:
      "LLM engineering, RAG, data science, DevOps, robotics, GIS, embedded systems, databases, and digital twins.",
    coverImage: "/images/connectln-studies/ai-studies-cover.jpg",
    badgeColor: "from-violet-600 to-purple-700",
    careerNumbers: [11, 12, 13, 14, 15, 16, 27],
    flagshipPathwayIds: ["pathway-2-ai-llm-engineering"]
  },
  {
    id: "academy-4-master-trades-construction",
    academyNumber: 4,
    title: "Master Trades and Construction Academy",
    focusAreas:
      "Timber framing, electrical, HVAC, welding, BIM, infrastructure condition inspection, and construction management.",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    badgeColor: "from-emerald-600 to-teal-700",
    careerNumbers: [3, 5, 29],
    flagshipPathwayIds: ["pathway-3-construction-superintendent", "pathway-6-solar-microgrid"]
  },
  {
    id: "academy-5-professional-services",
    academyNumber: 5,
    title: "Professional Services, Healthcare & Media Academy",
    focusAreas:
      "Risk management, procurement, forensic accounting, technical writing, business continuity, clinical/lab quality, and instructional/media systems.",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    badgeColor: "from-rose-600 to-slate-800",
    careerNumbers: [17, 18, 19, 20, 21, 22, 23, 24, 25, 30, 31, 32, 33],
    flagshipPathwayIds: ["pathway-3-construction-superintendent"]
  }
]

// ============================================================================
// 3. THE 33 SPECIALIZED TANGIBLE-COMPETENCE CAREERS ACROSS 7 DOMAINS
// ============================================================================

export const SPECIALIZED_33_CAREER_SPECS: SpecializedTangibleCareerSpec[] = [
  // --------------------------------------------------------------------------
  // DOMAIN 1: ADVANCED ENGINEERING AND CRITICAL INFRASTRUCTURE (1-5)
  // --------------------------------------------------------------------------
  {
    careerNumber: 1,
    id: "spec-career-1-power-systems-engineering",
    title: "Power Systems Engineering",
    domainNumber: 1,
    domainTitle: "1. Advanced engineering and critical infrastructure",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    tangibleEvidenceType: "Distribution Network Load-Flow Model, Symmetrical Fault Calculation & Relay Coordination Report",
    coreCurriculumBullets: [
      "Electrical grid planning and load flow analysis",
      "Protection relays and fault analysis",
      "Substation design fundamentals",
      "Power quality and harmonics",
      "Grid stability and resilience",
      "Distributed energy resources and microgrids"
    ],
    capstoneProject: "Model a distribution network, analyze a fault scenario, and recommend improvements.",
    workedFormulaTitle: "Three-Phase Apparent Power, Per-Unit Impedance & Symmetrical Fault Current",
    workedFormulaEquations: [
      "Three-Phase Apparent Power:  S_3φ = √3 × V_LL × I_L",
      "Base Impedance:              Z_base = (V_LL,base)² / S_base",
      "Symmetrical Fault Current:   I_sc,pu = V_pre,pu / |Z_th,pu|  ⇒  I_sc = I_sc,pu × I_base"
    ],
    workedFormulaExplanation:
      "Power systems engineers convert transformer, feeder, and generator impedances to a common per-unit (pu) base to compute steady-state voltage drop and three-phase bolted fault currents for breaker interrupting capacity and ANSI 50/51 relay coordination.",
    workedProblemStatement:
      "A 13.8 kV radial distribution feeder (S_base = 10 MVA) has a Thevenin source + transformer + feeder impedance of Z_th = 0.20 pu at the faulted bus. Calculate the base current I_base and three-phase symmetrical short-circuit current I_sc.",
    workedStepByStep: [
      "1. Compute base current at 13.8 kV: I_base = 10,000,000 VA / (√3 × 13,800 V) ≈ 418.37 A.",
      "2. Assuming pre-fault voltage V_pre = 1.0 pu, compute per-unit fault current: I_sc,pu = 1.0 / 0.20 = 5.0 pu.",
      "3. Convert to physical amperes: I_sc = 5.0 × 418.37 A ≈ 2,091.85 A (2.09 kA symmetrical RMS).",
      "4. Verify downstream recloser/breaker interrupting rating exceeds asymmetrical peak requirements and coordinate inverse-time overcurrent (ANSI 51) curves with a minimum 0.30 s Coordination Time Interval (CTI)."
    ],
    workedConclusion:
      "The 13.8 kV bus experiences 2.09 kA symmetrical fault current; breaker duty and relay pickup/time-dial settings must be documented with CT saturation checks.",
    practicalLabScenario:
      "Model a 5-bus 13.8 kV distribution feeder with a 1.5 MW solar DER interconnect, execute steady-state load flow and a bolted 3-phase fault study, and specify relay coordination improvements.",
    practicalLabTasks: [
      "Construct a single-line diagram (SLD) and per-unit impedance table for all 5 buses.",
      "Run steady-state load flow at peak load and high-DER reverse power flow to check ±5% ANSI C84.1 voltage limits.",
      "Calculate 3-phase and line-to-ground fault currents and verify ANSI 50/51 relay selective coordination.",
      "Author the distribution protection and voltage-regulation improvement report."
    ],
    answerKeyQuestion: {
      prompt: "When high penetration of Distributed Energy Resources (DERs) is added to a radial distribution feeder, why must protection relay settings be re-evaluated?",
      options: [
        "Bidirectional power flow and inverter fault-current contributions can cause sympathetic tripping, blinding of overcurrent relays, and voltage rise outside ANSI C84.1 limits.",
        "DER inverters eliminate all short-circuit currents on the utility substation bus.",
        "Transformers no longer require overcurrent protection once solar PV is connected.",
        "Per-unit impedance calculations only apply to DC circuits."
      ],
      correctIndex: 0,
      explanation: "DER interconnections alter feeder voltage profiles and fault current paths, requiring directional overcurrent (ANSI 67), anti-islanding, and coordination studies."
    },
    careerGuidance: {
      prerequisites: "AC circuit theory, phasor algebra, three-phase power fundamentals, and engineering mathematics.",
      targetRoles: "Power Systems Engineer, Protection & Controls (P&C) Analyst, Distribution Planning Engineer, Microgrid Systems Engineer.",
      qualificationsAndNextSteps: "FE/EIT and PE (Electrical — Power) licensure for stamping utility/substation engineering documents; IEEE PES standards familiarity."
    },
    mentorReviewCriteria: [
      "Single-line diagram and per-unit base conversions are dimensionally consistent.",
      "Fault study covers both maximum and minimum generation scenarios.",
      "Protection coordination maintains >= 0.30 s CTI without relay blinding."
    ],
    principalReferences: [
      {
        title: "IEEE Std 1547 & Power Systems Protection Fundamentals",
        organization: "IEEE Power & Energy Society / NREL",
        url: "https://www.nrel.gov/grid/ieee-standard-1547.html",
        summary: "Standard for interconnection and interoperability of distributed energy resources with associated electric power systems interfaces."
      }
    ]
  },
  {
    careerNumber: 2,
    id: "spec-career-2-process-engineering-instrumentation",
    title: "Process Engineering and Industrial Instrumentation",
    domainNumber: 1,
    domainTitle: "1. Advanced engineering and critical infrastructure",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    tangibleEvidenceType: "Annotated P&ID Package, 4–20 mA Transmitter Scaling Sheet, PID Tuning Log & HAZOP Register",
    coreCurriculumBullets: [
      "Process flow diagrams and P&IDs",
      "Pressure, flow, temperature, and level measurement",
      "Control loops and PID tuning",
      "Process troubleshooting",
      "Equipment reliability",
      "Hazard analysis and process safety"
    ],
    capstoneProject: "Model and optimize a simulated water-treatment or manufacturing process.",
    workedFormulaTitle: "4–20 mA Transmitter Linear Scaling & Standard PID Controller Output",
    workedFormulaEquations: [
      "4–20 mA Current to PV:   PV = LRV + ((I_mA - 4) / 16) × (URV - LRV)",
      "PID Control Law:         u(t) = u_bias + K_p e(t) + (K_p / T_i) ∫ e(t) dt + K_p T_d (de(t)/dt)",
      "Differential Pressure Flow:  Q = K × √(ΔP)"
    ],
    workedFormulaExplanation:
      "Industrial instrumentation maps physical process variables (pressure, flow, level, temperature) into 4–20 mA current loops (where 4 mA = 0% live zero and < 3.6 mA signals a NAMUR NE43 broken-wire fault) for closed-loop PID control.",
    workedProblemStatement:
      "A pressure transmitter is calibrated for 0 to 250 kPa (LRV = 0 kPa, URV = 250 kPa) using a 4–20 mA loop. What pressure corresponds to a measured loop current of 13.6 mA, and why is 4 mA used instead of 0 mA for zero?",
    workedStepByStep: [
      "1. Compute fraction of span: (13.6 mA - 4.0 mA) / 16.0 mA = 9.6 / 16.0 = 0.60 (60% of span).",
      "2. Multiply by calibrated span (250 - 0 kPa): PV = 0 + 0.60 × 250 kPa = 150.0 kPa.",
      "3. Verify live-zero diagnostic benefit: 4.0 mA represents 0 kPa while powering 2-wire loop transmitters; a reading of 0 mA immediately indicates an open circuit or power loss."
    ],
    workedConclusion:
      "At 13.6 mA, the process pressure is 150.0 kPa (60% span), and NAMUR live-zero monitoring protects the control loop against silent wire-break failures.",
    practicalLabScenario:
      "Develop an ISA-5.1 compliant P&ID for a continuous neutralization tank, scale all 4–20 mA level/flow/pH transmitters, tune the dosing PID loop to eliminate overshoot, and complete a 5-node HAZOP table.",
    practicalLabTasks: [
      "Draw the P&ID tags (LT, FT, AT, LCV, FCV, LAHH) using ISA-5.1 instrumentation symbols.",
      "Create the instrument calibration and 4–20 mA PLC analog input scaling table.",
      "Perform step-test system identification (process gain K, dead time θ, time constant τ) and calculate Lambda tuning parameters.",
      "Document a HAZOP study (Guideword: MORE FLOW / LESS LEVEL / INSTRUMENT FAIL) with independent high-level interlocks."
    ],
    answerKeyQuestion: {
      prompt: "Why should a safety-critical high-high tank overflow trip (LAHH) use an independent level switch/transmitter rather than sharing the same level transmitter used by the basic regulatory PID control loop?",
      options: [
        "If the single regulatory transmitter fails frozen at 50%, both the PID loop and the high-high alarm will be blinded simultaneously (common-cause failure).",
        "Because 4–20 mA transmitters cannot measure liquid level above 50%.",
        "Because PID controllers only work with temperature sensors.",
        "Sharing a failed sensor increases independent Layers of Protection (LOPA)."
      ],
      correctIndex: 0,
      explanation: "Process safety standards (IEC 61511 / ISA-84) require separation between Basic Process Control Systems (BPCS) and independent safety interlocks to prevent common-cause failure."
    },
    careerGuidance: {
      prerequisites: "Fluid mechanics, thermodynamics, basic electrical circuits, and P&ID symbol literacy.",
      targetRoles: "Process Engineer, Instrumentation & Controls (I&C) Engineer, Process Safety Analyst, Plant Reliability Engineer.",
      qualificationsAndNextSteps: "ISA Certified Automation Professional (CAP), Certified Control Systems Technician (CCST), or PE Chemical/Control Systems."
    },
    mentorReviewCriteria: [
      "ISA-5.1 tag numbering and loop bubbles are consistent across the P&ID.",
      "4–20 mA scaling includes out-of-range fault handling (< 3.6 mA / > 21.0 mA) and fail-safe valve positions (FC/FO).",
      "HAZOP worksheet separates control loops from independent safety safeguards."
    ],
    principalReferences: [
      {
        title: "OSHA Process Safety Management (PSM) — 29 CFR 1910.119",
        organization: "OSHA",
        url: "https://www.osha.gov/process-safety-management",
        summary: "Requirements for process safety information, process hazard analysis (PHA/HAZOP), operating procedures, and mechanical integrity."
      }
    ]
  },
  {
    careerNumber: 3,
    id: "spec-career-3-infrastructure-inspection-asset-management",
    title: "Infrastructure Inspection and Asset Management",
    domainNumber: 1,
    domainTitle: "1. Advanced engineering and critical infrastructure",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    tangibleEvidenceType: "Structural Condition Assessment Report, Defect Map, NDT Test Log & Lifecycle Prioritization Matrix",
    coreCurriculumBullets: [
      "Bridge and concrete inspection fundamentals",
      "Corrosion and material deterioration",
      "Non-destructive testing methods",
      "Structural condition assessments",
      "GIS-based asset inventories",
      "Maintenance prioritization and lifecycle costs"
    ],
    capstoneProject: "Assess a simulated infrastructure asset and produce a condition and maintenance report.",
    workedFormulaTitle: "Equivalent Annual Cost (EAC) & Risk-Based Maintenance Priority Score",
    workedFormulaEquations: [
      "Present Worth of Lifecycle Cost:  NPV_cost = C_initial + Σ [ C_maint,t / (1 + r)^t ]",
      "Risk Priority Score:              RPN = Probability_of_Failure (PoF) × Consequence_of_Failure (CoF)",
      "Half-Cell Corrosion Threshold:    E_corr < -350 mV (CSE) ⇒ >90% probability of active rebar corrosion (ASTM C876)"
    ],
    workedFormulaExplanation:
      "Infrastructure asset managers combine physical condition ratings (crack width, spalling, section loss, NDT ultrasonic/rebound/half-cell readings) with lifecycle cost discounting and PoF × CoF risk scoring to prioritize capital budgets.",
    workedProblemStatement:
      "During a reinforced concrete bridge deck inspection, half-cell potential readings average -410 mV vs. Cu/CuSO4, delaminations cover 18% of Bay 3, and shear cracks appear near the bearing seat. How should the inspector classify and escalate these findings?",
    workedStepByStep: [
      "1. Interpret ASTM C876 half-cell data: -410 mV (< -350 mV threshold) indicates high (>90%) probability of active reinforcing steel corrosion.",
      "2. Map the 18% delamination area and measure crack widths, lengths, and locations relative to load-bearing supports.",
      "3. Distinguish routine surface spalling from structural shear cracks near the bearing seat — flag the shear crack for immediate licensed structural engineer evaluation.",
      "4. Compare lifecycle NPV of targeted patch repair vs. cathodic protection/deck overlay."
    ],
    workedConclusion:
      "Active corrosion and bearing-zone shear cracking require documented defect mapping, immediate escalation to a licensed structural engineer for load-rating review, and a prioritized rehabilitation plan.",
    practicalLabScenario:
      "Inspect a simulated 3-span reinforced concrete bridge dataset (visual photos, crack gauge logs, rebound hammer & half-cell potential grids), assign element-level condition states, and prepare a 10-year capital maintenance plan.",
    practicalLabTasks: [
      "Classify concrete and steel defects (flexural vs. shear cracking, efflorescence, spalling, rebar section loss).",
      "Plot the GIS/grid defect map and assign element condition states (CS-1 Good to CS-4 Severe).",
      "Identify structural red flags requiring immediate licensed engineer escalation.",
      "Compute 10-year Net Present Value (NPV) for three rehabilitation options and rank interventions by PoF × CoF."
    ],
    answerKeyQuestion: {
      prompt: "When an infrastructure inspector observes diagonal shear cracking near a bridge girder support or significant steel section loss in a primary tension member, what is the mandatory protocol?",
      options: [
        "Document exact measurements and photographs, flag as a critical structural finding, and escalate immediately to the licensed Structural Engineer of Record for load evaluation.",
        "Cover the crack with cosmetic mortar so water cannot enter before anyone sees it.",
        "Wait until the next scheduled biennial inspection cycle to mention it.",
        "Approve an increase in vehicle load limits on the bridge."
      ],
      correctIndex: 0,
      explanation: "Shear cracks near supports and primary member section loss can reduce load-carrying capacity and require immediate licensed structural engineering assessment."
    },
    careerGuidance: {
      prerequisites: "Construction materials (concrete/steel), structural mechanics fundamentals, technical drawing reading, and GIS basics.",
      targetRoles: "Infrastructure Inspector, Bridge/Asset Management Analyst, NDT Technician, Municipal Capital Planning Coordinator.",
      qualificationsAndNextSteps: "FHWA/NHI Safety Inspection of In-Service Bridges, ASNT NDT Level II, IAM Certificate in Asset Management, PE Civil/Structural."
    },
    mentorReviewCriteria: [
      "Defect classification accurately separates cosmetic shrinkage cracks from structural shear/flexural distress.",
      "NDT limitations (e.g., rebound hammer surface hardness vs. core strength) are explicitly noted.",
      "Lifecycle cost comparison documents discount rate assumptions and safety escalations."
    ],
    principalReferences: [
      {
        title: "FHWA National Bridge Inspection Standards (NBIS) & Bridge Inspector's Reference Manual",
        organization: "Federal Highway Administration (FHWA)",
        url: "https://www.fhwa.dot.gov/bridge/nbis.cfm",
        summary: "Federal standards and technical inspection procedures for highway structures, condition rating, and critical finding escalation."
      }
    ]
  },
  {
    careerNumber: 4,
    id: "spec-career-4-water-wastewater-systems-engineering",
    title: "Water and Wastewater Systems Engineering",
    domainNumber: 1,
    domainTitle: "1. Advanced engineering and critical infrastructure",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    tangibleEvidenceType: "Hydraulic Network Calculation Sheet, Treatment Mass-Balance Model & Disinfection Operating Plan",
    coreCurriculumBullets: [
      "Water distribution and hydraulic calculations",
      "Treatment processes and water quality",
      "Pump and pipeline selection",
      "Wastewater treatment operations",
      "Industrial discharge monitoring",
      "Emergency response and system resilience"
    ],
    capstoneProject: "Develop a preliminary treatment process and operating plan from a fictional water-quality dataset.",
    workedFormulaTitle: "Continuity, Hazen-Williams Friction Headloss, Pump Brake Power & CT Disinfection",
    workedFormulaEquations: [
      "Continuity Equation:          Q = A × v",
      "Pump Hydraulic/Shaft Power:   P_hyd = (ρ g Q H) / 1000 (kW)  ;  P_shaft = P_hyd / η_pump",
      "Disinfection CT Inactivation: CT_calc = Residual_Concentration (mg/L) × Baffled_Contact_Time_T10 (min)"
    ],
    workedFormulaExplanation:
      "Water engineers size pipelines and pumps using Total Dynamic Head (static lift + friction headloss + minor losses), verify Net Positive Suction Head Available (NPSHa > NPSHr), and validate pathogen log-inactivation using CT (Disinfectant Concentration × T10 Contact Time).",
    workedProblemStatement:
      "A municipal pump station delivers Q = 0.08 m³/s (80 L/s) against a Total Dynamic Head H = 45 m with a pump efficiency η_pump = 78% and motor efficiency η_motor = 94%. Calculate the hydraulic power, shaft brake power, and electrical input power.",
    workedStepByStep: [
      "1. Compute hydraulic water power: P_hyd = (1000 kg/m³ × 9.81 m/s² × 0.08 m³/s × 45 m) / 1000 = 35.32 kW.",
      "2. Divide by pump efficiency (0.78) to get pump shaft brake power: P_shaft = 35.32 / 0.78 = 45.28 kW.",
      "3. Divide by motor efficiency (0.94) to get electrical input power: P_elec = 45.28 / 0.94 = 48.17 kW.",
      "4. Select a standard 55 kW (75 HP) motor and verify NPSHa exceeds pump NPSHr by at least 1.5 m across the operating curve."
    ],
    workedConclusion:
      "The duty point requires 45.28 kW shaft power (48.17 kW electrical draw) and a 55 kW motor with verified suction cavitation margins.",
    practicalLabScenario:
      "Analyze a raw surface-water dataset (turbidity spikes to 85 NTU, TOC = 4.8 mg/L, pH = 7.4, temp = 10°C), size the coagulation/flocculation/sedimentation/filtration train, verify chlorine CT log-inactivation, and write an emergency high-turbidity SOP.",
    practicalLabTasks: [
      "Calculate plant hydraulic loading rates, detention times, and coagulant chemical dosing mass balances.",
      "Size the clearwell volume and baffle factor (T10/T_theoretical) to meet required Giardia and virus CT inactivation.",
      "Select the high-service pump duty point and plot the system head curve vs. pump curve.",
      "Draft an Emergency Response SOP for raw-water turbidity excursions and loss of primary chlorination."
    ],
    answerKeyQuestion: {
      prompt: "In drinking water disinfection, why is T10 contact time (the time for 10% of the water to pass through the clearwell) used instead of the theoretical mean detention time (Volume / Flow)?",
      options: [
        "Hydraulic short-circuiting causes a portion of water to exit faster than the average detention time; T10 ensures at least 90% of the flow receives the required minimum disinfectant exposure.",
        "Because chlorine only reacts with the first 10% of water entering a tank.",
        "Because T10 is always larger than theoretical detention time.",
        "To eliminate the need for filtration in surface water plants."
      ],
      correctIndex: 0,
      explanation: "Real tanks experience hydraulic short-circuiting; using baffling factor (T10/T) ensures conservative public-health protection."
    },
    careerGuidance: {
      prerequisites: "Chemistry fundamentals, fluid hydraulics, mass balance calculations, and environmental science.",
      targetRoles: "Water/Wastewater Process Engineer, Hydraulic Modeling Analyst, Utility Operations Specialist, Environmental Compliance Engineer.",
      qualificationsAndNextSteps: "State Water/Wastewater Operator Certification (Grades I–IV) for plant operation; FE/PE (Environmental or Civil-Water Resources) for engineering design."
    },
    mentorReviewCriteria: [
      "Mass balance and hydraulic detention calculations use consistent SI or US Customary units.",
      "CT disinfection calculation properly applies temperature, pH, and baffling factor (T10/T).",
      "Emergency SOP includes regulatory public notification and boil-water advisory triggers."
    ],
    principalReferences: [
      {
        title: "US EPA Drinking Water Treatment & Disinfection CT Guidance Manuals",
        organization: "U.S. Environmental Protection Agency (EPA)",
        url: "https://www.epa.gov/dwreginfo/surface-water-treatment-rules",
        summary: "Technical guidance on filtration, coagulation, disinfection profiling, and CT inactivation compliance."
      }
    ]
  },
  {
    careerNumber: 5,
    id: "spec-career-5-building-performance-energy-auditing",
    title: "Building Performance and Energy Auditing",
    domainNumber: 1,
    domainTitle: "1. Advanced engineering and critical infrastructure",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    tangibleEvidenceType: "ASHRAE Level 2 Energy Audit Report, Utility Baseline Model & ECM Retrofit Financial Package",
    coreCurriculumBullets: [
      "Building envelope diagnostics",
      "Thermal imaging and air leakage",
      "HVAC energy consumption",
      "Lighting and controls optimization",
      "Energy modeling and benchmarking",
      "Retrofit economics and measurement"
    ],
    capstoneProject: "Audit a sample building and propose improvements with estimated savings and assumptions.",
    workedFormulaTitle: "Energy Use Intensity (EUI), Conductive Heat Loss & Retrofit Net Present Value",
    workedFormulaEquations: [
      "Site EUI:                   EUI = Total_Annual_Energy (kWh_eq / yr) / Gross_Floor_Area (m²)",
      "Envelope Conductive Load:   Q_cond = U × A × ΔT  ;  Annual_Heat_Loss = U × A × HDD × 24",
      "Simple Payback & NPV:       Payback = C_cap / S_annual  ;  NPV = -C_cap + Σ [ S_t / (1 + r)^t ]"
    ],
    workedFormulaExplanation:
      "Energy auditors normalize whole-building utility bills against weather (Heating/Cooling Degree Days) and floor area (EUI), quantify envelope/HVAC/lighting end-use loads, and evaluate Energy Conservation Measures (ECMs) accounting for interactive effects (e.g., LED lighting retrofits reduce internal heat gains, slightly increasing winter heating load while reducing summer cooling load).",
    workedProblemStatement:
      "A 5,000 m² commercial office building consumes 620,000 kWh/yr of electricity and 280,000 kWh_eq/yr of natural gas. An ECM replaces constant-volume supply fans with VFD controls saving 85,000 kWh/yr at $0.16/kWh for a capital cost of $47,600. Compute Site EUI and Simple Payback.",
    workedStepByStep: [
      "1. Total annual site energy = 620,000 + 280,000 = 900,000 kWh_eq/yr.",
      "2. Compute Site EUI: 900,000 kWh_eq / 5,000 m² = 180 kWh_eq/(m²·yr).",
      "3. Compute annual cost savings from the VFD retrofit: S_annual = 85,000 kWh/yr × $0.16/kWh = $13,600/yr.",
      "4. Compute Simple Payback: $47,600 / $13,600/yr = 3.50 years."
    ],
    workedConclusion:
      "Baseline Site EUI is 180 kWh_eq/(m²·yr), and the VFD fan retrofit achieves a 3.5-year simple payback before utility incentives.",
    practicalLabScenario:
      "Conduct an ASHRAE Level 2 energy audit on a 5,000 m² commercial facility using 24 months of electric/gas utility bills, blower-door/infrared envelope findings, and HVAC/lighting schedules, then propose a ranked 4-ECM retrofit package with IPMVP M&V plan.",
    practicalLabTasks: [
      "Disaggregate 24-month utility bills into base load, heating slope, and cooling slope against HDD/CDD.",
      "Calculate energy and demand savings for 4 ECMs (LED + daylighting controls, VFD fan conversion, envelope air-sealing, and night setback schedules) including interactive effects.",
      "Compute Simple Payback, 10-year NPV, and Internal Rate of Return (IRR) for the bundled retrofit.",
      "Write an IPMVP Option C (Whole-Facility) or Option B (Retrofit Isolation) Measurement & Verification plan."
    ],
    answerKeyQuestion: {
      prompt: "When bundling an interior LED lighting retrofit with a high-efficiency chiller upgrade in the same energy audit, why can you NOT simply add the standalone chiller savings calculated under the old lighting heat load?",
      options: [
        "Interactive effects: LED lighting emits less waste heat into the conditioned space, which reduces the building's cooling load before the new chiller operates; adding standalone savings would double-count cooling reductions.",
        "Because LED lights consume natural gas instead of electricity.",
        "Because chillers only run during the winter heating season.",
        "Interactive effects always double the total energy savings of every measure."
      ],
      correctIndex: 0,
      explanation: "Energy auditors must account for interactive effects between lighting, envelope, and HVAC systems so bundled savings are not overstated."
    },
    careerGuidance: {
      prerequisites: "Thermodynamics/heat transfer basics, HVAC systems literacy, spreadsheet financial modeling, and building diagnostics.",
      targetRoles: "Building Energy Auditor, Commissioning (Cx) Engineer, Building Performance Analyst, Decarbonization Consultant.",
      qualificationsAndNextSteps: "AEE Certified Energy Manager (CEM), Certified Energy Auditor (CEA), ASHRAE Building Energy Assessment Professional (BEAP), BPI Building Analyst."
    },
    mentorReviewCriteria: [
      "Utility baseline model accounts for weather normalization (HDD/CDD) and occupancy.",
      "ECM calculations explicitly document engineering assumptions and interactive effects.",
      "IPMVP Measurement & Verification plan specifies baseline adjustment variables."
    ],
    principalReferences: [
      {
        title: "ASHRAE Procedures for Commercial Building Energy Audits & DOE Better Buildings",
        organization: "ASHRAE / U.S. Department of Energy",
        url: "https://betterbuildingssolutioncenter.energy.gov/",
        summary: "Industry standard framework for Level 1, Level 2, and Level 3 building energy audits and retrofit economic analysis."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 2: ADVANCED CYBERSECURITY AND DIGITAL TRUST (6-10)
  // --------------------------------------------------------------------------
  {
    careerNumber: 6,
    id: "spec-career-6-dfir-incident-response",
    title: "Digital Forensics and Incident Response",
    domainNumber: 2,
    domainTitle: "2. Advanced cybersecurity and digital trust",
    academyId: "academy-1-cybersecurity-specialist",
    coverImage: "/images/connectln-studies/packet-soc-cover.jpg",
    tangibleEvidenceType: "Chain-of-Custody Log, Super-Timeline Reconstruction & Forensic Incident Report",
    coreCurriculumBullets: [
      "Disk and memory forensics",
      "Windows and Linux artifact analysis",
      "Timeline reconstruction",
      "Log correlation and event analysis",
      "Evidence integrity and chain of custody",
      "Incident reports and remediation plans"
    ],
    capstoneProject: "Reconstruct a fictional security incident from a supplied evidence bundle.",
    workedFormulaTitle: "Cryptographic Evidence Integrity, Order of Volatility & UTC Timeline Normalization",
    workedFormulaEquations: [
      "Evidence Integrity Verification:  SHA-256(Raw_Acquisition_Stream) == SHA-256(Forensic_Working_Copy)",
      "UTC Timestamp Normalization:      t_UTC = t_local - ΔTZ_offset + ΔClock_Skew",
      "Order of Volatility (RFC 3227):   CPU/Registers → RAM → Network/Process State → Disk → Archival Backups"
    ],
    workedFormulaExplanation:
      "DFIR investigators preserve volatile memory before disk power-down, compute cryptographic SHA-256 hashes at acquisition to prove evidence integrity, and normalize all endpoint/network timestamps to UTC before correlating attack stages.",
    workedProblemStatement:
      "An endpoint telemetry alert fires on a Windows server in EDT (UTC-4) at 14:22:10 local time while the firewall logs in UTC show an outbound C2 connection at 18:22:14 UTC, and the server NTP clock was drifting +3 seconds fast. Normalize the endpoint event to true UTC and determine the exact sequence.",
    workedStepByStep: [
      "1. Convert endpoint local time (14:22:10 EDT, UTC-4) to nominal UTC: 14:22:10 + 04:00:00 = 18:22:10 UTC.",
      "2. Correct for the +3 second fast clock skew on the endpoint: 18:22:10 - 00:00:03 = 18:22:07 true UTC.",
      "3. Compare with firewall log (18:22:14 UTC): Process execution on the endpoint preceded the outbound C2 connection by 7.0 seconds.",
      "4. Record SHA-256 hashes of the memory image and EVTX logs in the Chain of Custody form."
    ],
    workedConclusion:
      "Normalizing time zones and NTP clock drift proves the local process spawned 7 seconds prior to the outbound C2 session.",
    practicalLabScenario:
      "Analyze a supplied forensic triage bundle (Windows Security/Sysmon EVTX, Prefetch, Amcache, MFT slice, and PCAP summary), build a UTC super-timeline, and write an executive + technical DFIR report.",
    practicalLabTasks: [
      "Verify SHA-256 hashes of all evidence artifacts and log acquisition metadata in the Chain of Custody record.",
      "Correlate initial access, execution, persistence, and lateral movement across Sysmon, Security EVTX (4624/4688/7045), and MFT timestamps.",
      "Distinguish confirmed artifact facts from analytical inferences and rule out benign administrative activity.",
      "Deliver a NIST SP 800-61 Rev. 2 Incident Response Report with containment and eradication actions."
    ],
    answerKeyQuestion: {
      prompt: "When responding to a suspected live ransomware staging incident on a virtual server, why should you capture volatile RAM and live network/process state before powering off the system?",
      options: [
        "Powering off immediately destroys volatile memory (RAM) containing unencrypted process memory, injected code, active network sockets, and encryption keys.",
        "Because disk drives are more volatile than CPU registers.",
        "Because SHA-256 hashes can only be calculated after a hard reboot.",
        "Powering off automatically writes all RAM contents into the Windows Registry."
      ],
      correctIndex: 0,
      explanation: "Following RFC 3227 Order of Volatility preserves ephemeral memory artifacts that vanish upon power loss."
    },
    careerGuidance: {
      prerequisites: "Windows/Linux OS internals, networking protocols (TCP/IP, DNS, HTTP, SMB), and log analysis fundamentals.",
      targetRoles: "DFIR Investigator, Incident Response Consultant, Senior SOC Forensics Analyst, Cyber Threat Responder.",
      qualificationsAndNextSteps: "GIAC GCFE / GCFA / GCIH, EnCE, or CCMF; practice with Velociraptor, Volatility 3, Zimmerman Tools, and Autopsy."
    },
    mentorReviewCriteria: [
      "Every timeline entry includes UTC timestamp, host source, artifact path, and event factual description.",
      "Chain-of-custody documentation includes SHA-256 verification.",
      "Report clearly separates confirmed forensic facts from analytical hypotheses."
    ],
    principalReferences: [
      {
        title: "NIST SP 800-86: Guide to Integrating Forensic Techniques into Incident Response",
        organization: "NIST",
        url: "https://csrc.nist.gov/pubs/sp/800/86/final",
        summary: "Official technical guidance on acquiring, preserving, analyzing, and reporting digital forensic evidence."
      }
    ]
  },
  {
    careerNumber: 7,
    id: "spec-career-7-identity-security-active-directory",
    title: "Identity Security and Active Directory Defense",
    domainNumber: 2,
    domainTitle: "2. Advanced cybersecurity and digital trust",
    academyId: "academy-1-cybersecurity-specialist",
    coverImage: "/images/connectln-studies/cyber-specialist-cover.jpg",
    tangibleEvidenceType: "Active Directory Attack-Path Graph Analysis, Tier-0 Hardening Plan & Kerberos Detection Pack",
    coreCurriculumBullets: [
      "Active Directory architecture",
      "Identity lifecycle and privileged access",
      "Kerberos and authentication fundamentals",
      "Identity attack-path analysis",
      "Hardening and detection engineering",
      "Identity recovery and incident response"
    ],
    capstoneProject: "Assess a deliberately vulnerable directory lab and prioritize defensive remediation.",
    workedFormulaTitle: "Identity Attack-Path Graph Choke Points & Privileged Tier Exposure Reduction",
    workedFormulaEquations: [
      "Path Exposure Score:  E_node = Σ (Inbound_Reachable_Principals × Edge_Exploitability) / Distance_to_Tier0",
      "Tier-0 Isolation Rule: Tier_0_Admins ∩ (Workstation_Logons ∪ Server_Logons) = ∅"
    ],
    workedFormulaExplanation:
      "Identity defenders model Active Directory and cloud IAM permissions as a directed graph where users, groups, computers, and GPOs are nodes and privileges (GenericAll, WriteDacl, MemberOf, HasSession, AllowedToDelegate) are directed edges leading to Tier-0 Domain Admin control.",
    workedProblemStatement:
      "An AD assessment reveals a standard Domain User has 'WriteDacl' over an IT Helpdesk group, which has 'ForceChangePassword' over a Backup Service Account that is a member of the 'Backup Operators' built-in group on a Domain Controller. Trace the 3-hop attack path to Tier-0 compromise and specify the highest-leverage choke-point fix.",
    workedStepByStep: [
      "1. Hop 1: Domain User abuses WriteDacl on the IT Helpdesk group to add themselves to the group.",
      "2. Hop 2: As an IT Helpdesk member, the user resets the password of the Backup Service Account.",
      "3. Hop 3: Membership in 'Backup Operators' grants SeBackupPrivilege on the Domain Controller, allowing extraction of NTDS.dit (all domain password hashes including krbtgt).",
      "4. Remediation: Remove the Backup Service Account from 'Backup Operators', enforce Tier-0 administrative isolation, and audit DACLs on all privileged groups."
    ],
    workedConclusion:
      "Severing the transitive privilege chain and isolating Tier-0 accounts eliminates the 3-hop path to full domain compromise.",
    practicalLabScenario:
      "Audit a simulated Active Directory + Entra ID hybrid environment containing 6 identity misconfigurations (Kerberoastable high-privilege SPNs, unconstrained delegation, ACL abuse edges, NTLMv1 fallback, and flat admin tiering) and deliver a prioritized hardening and detection plan.",
    practicalLabTasks: [
      "Map all multi-hop privilege escalation paths terminating at Domain Admins or Enterprise Admins.",
      "Design a Tier-0 / Tier-1 / Tier-2 administrative separation architecture and Protected Users group policy.",
      "Author SIEM detection rules for Event IDs 4768, 4769 (RC4 cipher 0x17 downgrade), 4662 (DCSync replication rights), and 5136 (Directory Service object modification).",
      "Document a Golden Ticket recovery procedure (double krbtgt password reset protocol with safe replication interval)."
    ],
    answerKeyQuestion: {
      prompt: "When recovering an Active Directory forest from a confirmed krbtgt compromise (Golden Ticket risk), why must the krbtgt account password be reset TWICE with a waiting period for replication between resets?",
      options: [
        "Domain Controllers retain both the current (N) and previous (N-1) krbtgt password hashes for ticket validation; a single reset leaves the compromised hash valid as N-1, whereas resetting twice too quickly without replication can break legitimate Kerberos authentication across the forest.",
        "Because Windows passwords must always be typed twice in the GUI.",
        "Because resetting krbtgt once deletes all user accounts in Active Directory.",
        "To convert Kerberos into NTLMv1."
      ],
      correctIndex: 0,
      explanation: "Active Directory validates tickets against both current and N-1 krbtgt keys; controlled double-reset invalidates forged TGTs while preserving replication health."
    },
    careerGuidance: {
      prerequisites: "Windows Server administration, LDAP/Kerberos protocols, Group Policy, and cloud IAM (Entra ID / OIDC / SAML).",
      targetRoles: "Identity Security Engineer, Active Directory Defense Architect, PAM Specialist, Hybrid Identity Responder.",
      qualificationsAndNextSteps: "Microsoft SC-300 (Identity and Access Administrator), GIAC GCIA/GCFA, BloodHound Enterprise / PingCastle defensive auditing."
    },
    mentorReviewCriteria: [
      "Attack-path remediation prioritizes high-impact choke points affecting Tier-0 assets.",
      "Kerberos hardening covers gMSA adoption, AES-256 enforcement, and RC4 deprecation.",
      "Detection rules account for legitimate domain controller replication vs. malicious DCSync."
    ],
    principalReferences: [
      {
        title: "Microsoft Securing Privileged Access & Active Directory Tier Model",
        organization: "Microsoft Security / CISA",
        url: "https://learn.microsoft.com/en-us/security/privileged-access-workstations/privileged-access-deployment",
        summary: "Enterprise architecture and hardening guidance for protecting Tier-0 identity infrastructure and preventing credential theft."
      }
    ]
  },
  {
    careerNumber: 8,
    id: "spec-career-8-secure-software-supply-chain",
    title: "Secure Software Supply Chain Engineering",
    domainNumber: 2,
    domainTitle: "2. Advanced cybersecurity and digital trust",
    academyId: "academy-1-cybersecurity-specialist",
    coverImage: "/images/connectln-studies/cyber-specialist-cover.jpg",
    tangibleEvidenceType: "Hardened CI/CD Pipeline Config, CycloneDX/SPDX SBOM, Signed SLSA Provenance Attestation & Release Gate Report",
    coreCurriculumBullets: [
      "Dependency and package risk",
      "Software bills of materials (SBOMs)",
      "Code signing and artifact provenance",
      "CI/CD pipeline security",
      "Secrets detection and remediation",
      "Software composition analysis"
    ],
    capstoneProject: "Secure a sample build pipeline and produce an auditable release evidence package.",
    workedFormulaTitle: "SLSA Build Provenance Verification & Reachable Vulnerability Risk Prioritization",
    workedFormulaEquations: [
      "Artifact Digest Binding:  Verify_Sig(PublicKey_OIDC, Attestation(SHA-256(Artifact), Commit_SHA, Builder_ID)) == TRUE",
      "Effective Dependency Risk: Risk_dep = CVSS_base × EPSS_prob × Is_Reachable_In_CallGraph(0 or 1)"
    ],
    workedFormulaExplanation:
      "Supply chain engineers bind compiled container/binary digests to ephemeral OIDC build identities (Sigstore Cosign / SLSA provenance), generate machine-readable CycloneDX/SPDX SBOMs, and prioritize transitive dependencies using call-graph reachability and EPSS.",
    workedProblemStatement:
      "A CI/CD pipeline pulls floating tags (`node:latest` and unpinned GitHub Actions `@main`), stores a long-lived cloud deployment token in repo secrets, and ships unsigned container images. Redesign the pipeline to meet NIST SSDF (SP 800-218) and SLSA Build Level 2+ controls.",
    workedStepByStep: [
      "1. Pin all base images and CI actions to immutable cryptographic SHA-256 digests (`@sha256:...`).",
      "2. Replace static cloud credentials with short-lived OpenID Connect (OIDC) federated workload tokens.",
      "3. Integrate automated pre-merge secrets scanning, SAST, and Software Composition Analysis (SCA) with lockfile verification.",
      "4. Generate a CycloneDX SBOM and sign the container digest + SLSA provenance attestation using keyless Cosign before admission to production."
    ],
    workedConclusion:
      "Immutable digest pinning, OIDC workload identity, SBOM generation, and cryptographic provenance verification prevent build tampering and dependency confusion.",
    practicalLabScenario:
      "Audit a vulnerable multi-stage CI/CD pipeline, remediate 5 supply-chain weaknesses (unpinned actions, leaked secret in git history, vulnerable transitive dependency, unsigned container, missing SBOM), and produce an auditable release evidence bundle.",
    practicalLabTasks: [
      "Pin all third-party CI workflows and base container images to cryptographic SHA-256 digests.",
      "Generate a CycloneDX JSON SBOM and triage transitive CVEs by call-graph reachability and VEX status.",
      "Configure cryptographic artifact signing and provenance attestation verification at deployment admission.",
      "Compile the Auditable Release Evidence Package for compliance sign-off."
    ],
    answerKeyQuestion: {
      prompt: "Why is pinning a third-party CI/CD action or container base image to a mutable version tag (such as `v1` or `latest`) insufficient against upstream supply-chain compromise?",
      options: [
        "An attacker who compromises the upstream maintainer account can force-push malicious code to the existing `v1` or `latest` tag, whereas pinning to a full cryptographic commit/image SHA-256 digest guarantees content immutability.",
        "Because mutable tags cannot be downloaded over HTTPS.",
        "Because SBOM generators only work on files named `latest`.",
        "Pinning to a SHA-256 digest automatically fixes SQL injection in application source code."
      ],
      correctIndex: 0,
      explanation: "Tags are mutable pointers; only full cryptographic hashes (commit SHA or image digest) guarantee that the exact reviewed code is executed."
    },
    careerGuidance: {
      prerequisites: "Git workflows, CI/CD pipelines (GitHub Actions / GitLab CI), Docker/OCI containers, and public-key cryptography.",
      targetRoles: "Software Supply Chain Security Engineer, DevSecOps Architect, Product Security Engineer, Platform Security Specialist.",
      qualificationsAndNextSteps: "Linux Foundation Secure Software Development / SLSA / Sigstore training, CSSLP, CKS (Certified Kubernetes Security Specialist)."
    },
    mentorReviewCriteria: [
      "CI/CD configuration eliminates static long-lived secrets and uses least-privilege permissions.",
      "SBOM includes complete transitive dependency tree and VEX reachability justifications.",
      "Admission policy rejects unsigned or tampered build artifacts."
    ],
    principalReferences: [
      {
        title: "NIST SP 800-218: Secure Software Development Framework (SSDF)",
        organization: "NIST",
        url: "https://csrc.nist.gov/pubs/sp/800/218/final",
        summary: "Core practices for securing software development environments, verifying third-party components, and maintaining artifact provenance."
      }
    ]
  },
  {
    careerNumber: 9,
    id: "spec-career-9-threat-hunting-detection-engineering",
    title: "Threat Hunting and Detection Engineering",
    domainNumber: 2,
    domainTitle: "2. Advanced cybersecurity and digital trust",
    academyId: "academy-1-cybersecurity-specialist",
    coverImage: "/images/connectln-studies/packet-soc-cover.jpg",
    tangibleEvidenceType: "Hypothesis-Driven Hunt Charter, Sigma/KQL Detection Pack, Precision/Recall Validation & ATT&CK Coverage Map",
    coreCurriculumBullets: [
      "Log sources and telemetry",
      "Hypothesis-driven threat hunting",
      "Detection rule development",
      "MITRE ATT&CK mapping",
      "False-positive analysis",
      "Detection coverage and validation"
    ],
    capstoneProject: "Develop and evaluate a detection pack against a simulated dataset.",
    workedFormulaTitle: "Detection Precision, Recall (Sensitivity), False Positive Rate & F1-Score",
    workedFormulaEquations: [
      "Precision (Alert Fidelity):  Precision = TP / (TP + FP)",
      "Recall (Detection Coverage): Recall = TP / (TP + FN)",
      "Harmonic F1-Score:           F1 = 2 × (Precision × Recall) / (Precision + Recall)"
    ],
    workedFormulaExplanation:
      "Detection engineers write behavioral rules (targeting adversary TTPs rather than brittle IP/hash indicators) and measure rule performance using True Positives (TP), False Positives (FP), and False Negatives (FN) against purple-team replay datasets.",
    workedProblemStatement:
      "A newly written detection rule for Living-off-the-Land credential dumping is tested against a 7-day enterprise dataset containing 12 simulated attack executions and 500,000 benign events. The rule fires 15 times: 11 are confirmed attack detections (TP = 11, FN = 1) and 4 are benign backup scripts (FP = 4). Calculate Precision, Recall, and F1-score.",
    workedStepByStep: [
      "1. Compute Precision: TP / (TP + FP) = 11 / (11 + 4) = 11 / 15 = 73.33%.",
      "2. Compute Recall: TP / (TP + FN) = 11 / (11 + 1) = 11 / 12 = 91.67%.",
      "3. Compute F1-Score: 2 × (0.7333 × 0.9167) / (0.7333 + 0.9167) = 1.3444 / 1.6500 = 81.48%.",
      "4. Tune the rule by excluding signed backup service parent-child process lineages while preserving command-line behavioral logic, raising Precision without sacrificing Recall."
    ],
    workedConclusion:
      "Quantitative evaluation (73.3% Precision, 91.7% Recall) guides targeted exclusion tuning to prevent SOC alert fatigue.",
    practicalLabScenario:
      "Formulate 3 MITRE ATT&CK threat-hunting hypotheses, author a 5-rule Sigma/KQL detection pack targeting process creation, scheduled task persistence, and LSASS credential access, and validate Precision/Recall against a labeled log dataset.",
    practicalLabTasks: [
      "Write structured Threat Hunt Hypotheses linking adversary TTPs to required Sysmon/EDR/CloudTrail log fields.",
      "Develop 5 behavioral Sigma rules focused on parent-child process anomalies and command-line flags rather than static file hashes.",
      "Evaluate the detection pack on the labeled replay dataset to compute TP, FP, FN, Precision, and Recall.",
      "Document an Analyst Triage Runbook and blind-spot / telemetry gap analysis for each rule."
    ],
    answerKeyQuestion: {
      prompt: "According to David Bianco's Pyramid of Pain, why are behavioral detections based on adversary TTPs (such as abnormal parent-child process relationships and LSASS memory access flags) far more durable than detections based on file hashes or IP addresses?",
      options: [
        "Attackers can trivially recompile binaries or rotate IP addresses in seconds, whereas changing core TTPs requires reinventing their operational tooling and tradecraft.",
        "Because SIEM platforms cannot index IP addresses or SHA-256 hashes.",
        "Because TTP detections never require endpoint telemetry.",
        "File hashes are at the very top of the Pyramid of Pain."
      ],
      correctIndex: 0,
      explanation: "Targeting behavioral TTPs forces adversaries to alter how they operate rather than simply swapping indicators."
    },
    careerGuidance: {
      prerequisites: "OS internals, SIEM query languages (KQL, SPL, SQL), regular expressions, and MITRE ATT&CK familiarity.",
      targetRoles: "Detection Engineer, Threat Hunter, Purple Team Analyst, Security Telemetry Architect.",
      qualificationsAndNextSteps: "GIAC GCIA / GCFA / GCTI, MITRE ATT&CK Defender (MAD), Sigma & Atomic Red Team open-source contributions."
    },
    mentorReviewCriteria: [
      "Detection rules avoid brittle single-hash or static filename dependencies where behavioral telemetry exists.",
      "Every rule includes documented false-positive tuning, data source prerequisites, and blind spots.",
      "Validation report provides reproducible TP/FP/FN counts and Precision/Recall metrics."
    ],
    principalReferences: [
      {
        title: "MITRE ATT&CK Enterprise Matrix & CISA Threat Hunting Guidance",
        organization: "MITRE / CISA",
        url: "https://attack.mitre.org/",
        summary: "Knowledge base of adversary tactics, techniques, and data sources for detection engineering and hypothesis-driven threat hunting."
      }
    ]
  },
  {
    careerNumber: 10,
    id: "spec-career-10-ai-security-model-assurance",
    title: "AI Security and Model Assurance",
    domainNumber: 2,
    domainTitle: "2. Advanced cybersecurity and digital trust",
    academyId: "academy-1-cybersecurity-specialist",
    coverImage: "/images/connectln-studies/agentic-mcp-cover.jpg",
    tangibleEvidenceType: "AI Threat Model, Adversarial Red-Team Evaluation Harness & Guardrail Remediation Report",
    coreCurriculumBullets: [
      "Prompt injection and unsafe tool use",
      "Retrieval and data leakage risks",
      "Model evaluation and red teaming",
      "Dataset quality and provenance",
      "Model supply chain risks",
      "Guardrail testing and monitoring"
    ],
    capstoneProject: "Assess an AI application in a controlled environment and create a risk-based remediation plan.",
    workedFormulaTitle: "Attack Success Rate (ASR), Cross-Tenant Retrieval Leakage & Tool Authorization Enforcement",
    workedFormulaEquations: [
      "Adversarial Attack Success Rate:  ASR = (Successful_Policy_Bypasses / Total_Adversarial_Probes) × 100%",
      "ACL Retrieval Invariant:          Retrieved_Chunks(User_u) ⊆ { d ∈ Corpus | Has_Permission(User_u, d) == TRUE }"
    ],
    workedFormulaExplanation:
      "AI security engineers evaluate LLM and agentic systems against direct/indirect prompt injection, unauthorized tool execution (excessive agency), cross-tenant RAG data leakage, and unsafe model serialization formats (e.g., Python pickle vs. Safetensors).",
    workedProblemStatement:
      "An enterprise AI customer-support agent can read incoming emails (untrusted input) and has an automatic tool `issue_refund(order_id, amount)` with no human confirmation or deterministic policy check. In red-team testing across 80 indirect prompt-injection emails, 18 trigger unauthorized refund calls. Calculate ASR and architect the deterministic defense.",
    workedStepByStep: [
      "1. Compute baseline Attack Success Rate (ASR): 18 / 80 × 100% = 22.5%.",
      "2. Identify root cause: Untrusted external data (email body) shares the same instruction channel as trusted system prompts and directly drives a high-impact state-changing tool (OWASP LLM01 + LLM06 Excessive Agency).",
      "3. Implement deterministic policy enforcement outside the LLM: require authenticated session ownership verification (`order.owner == current_user`), cap refund limits, and require human-in-the-loop approval for privileged actions.",
      "4. Re-run the 80-probe evaluation suite to verify ASR drops to 0% for unauthorized tool execution."
    ],
    workedConclusion:
      "System prompts alone are not security boundaries; deterministic authorization and human-in-the-loop gates must wrap all state-changing AI tools.",
    practicalLabScenario:
      "Audit a sandboxed RAG + Tool-Calling AI Assistant against 50 adversarial test cases (direct prompt injection, indirect injection via poisoned PDF chunks, cross-role document retrieval, PII exfiltration via markdown image links, and unsafe tool argument tampering) and build a layered guardrail remediation architecture.",
    practicalLabTasks: [
      "Execute the 50-case red-team evaluation harness and compute baseline ASR across each OWASP Top 10 for LLM category.",
      "Enforce pre-retrieval document ACL filtering so unauthorized chunks never enter the model context window.",
      "Add deterministic schema and authorization validation on all tool calls plus markdown image/link egress sanitization.",
      "Re-run the evaluation benchmark and publish the AI Assurance & Residual Risk Report aligned with NIST AI RMF 1.0."
    ],
    answerKeyQuestion: {
      prompt: "Why can you NOT rely solely on a system prompt instruction (such as 'Never reveal confidential HR documents or execute unauthorized tools') to enforce access control in a RAG + agentic application?",
      options: [
        "LLMs do not enforce cryptographic or deterministic separation between system instructions and untrusted retrieved data; access control must be enforced deterministically at the retrieval database and tool-execution layers.",
        "Because system prompts are deleted after the first token is generated.",
        "Because vector databases automatically encrypt all text in the browser.",
        "System prompts are 100% immune to indirect prompt injection if written in all-caps."
      ],
      correctIndex: 0,
      explanation: "Prompt instructions are probabilistic guidance, not deterministic security controls; ACLs must be enforced in application code before context assembly and before tool execution."
    },
    careerGuidance: {
      prerequisites: "Application security, Python APIs, LLM/RAG architectures, and threat modeling.",
      targetRoles: "AI Security Engineer, LLM Red Team Specialist, Model Assurance Analyst, Trustworthy AI Architect.",
      qualificationsAndNextSteps: "NIST AI RMF 1.0 & Generative AI Profile mastery, OWASP Top 10 for LLM Applications, MITRE ATLAS adversary framework."
    },
    mentorReviewCriteria: [
      "Red-team test suite measures both Attack Success Rate (ASR) and False Refusal Rate (FRR) on benign prompts.",
      "Remediation separates probabilistic prompt guardrails from deterministic application-layer authorization.",
      "Model supply chain check verifies Safetensors format and model weight provenance."
    ],
    principalReferences: [
      {
        title: "NIST AI 600-1: Artificial Intelligence Risk Management Framework — Generative AI Profile",
        organization: "NIST",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        summary: "Official guidance for identifying, measuring, and mitigating security, privacy, and trustworthiness risks in generative AI systems."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 3: EMERGING TECHNOLOGY AND SPECIALIST COMPUTING (11-16)
  // --------------------------------------------------------------------------
  {
    careerNumber: 11,
    id: "spec-career-11-robotics-autonomous-systems",
    title: "Robotics and Autonomous Systems",
    domainNumber: 3,
    domainTitle: "3. Emerging technology and specialist computing",
    academyId: "academy-3-ai-software-engineering",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    tangibleEvidenceType: "Kinematic Simulation Package, Trajectory Planner, Vision Calibration & ISO 10218 Safety Validation Report",
    coreCurriculumBullets: [
      "Robot kinematics, sensors, motion planning, machine vision, robotic integration, and system validation."
    ],
    capstoneProject: "Simulate a robot performing a defined manufacturing task.",
    workedFormulaTitle: "2-Link Planar Forward Kinematics & Cycle-Time Throughput Analysis",
    workedFormulaEquations: [
      "End-Effector X Position:  x = L_1 cos(θ_1) + L_2 cos(θ_1 + θ_2)",
      "End-Effector Y Position:  y = L_1 sin(θ_1) + L_2 sin(θ_1 + θ_2)",
      "Cell Throughput Rate:     Units_per_Hour = 3600 / (t_pick + t_move + t_place + t_vision_settle)"
    ],
    workedFormulaExplanation:
      "Robotics engineers use homogeneous transformation matrices and forward/inverse kinematics to map joint angles (θ_1, θ_2, ...) to Cartesian end-effector poses (x, y, z, roll, pitch, yaw) while enforcing joint velocity/torque limits and safety-rated monitored stop zones.",
    workedProblemStatement:
      "A 2-DOF planar SCARA-style arm has link lengths L_1 = 0.50 m and L_2 = 0.40 m. Compute the Cartesian (x, y) position of the gripper when joint angles are θ_1 = 0° and θ_2 = 90°.",
    workedStepByStep: [
      "1. Substitute θ_1 = 0° and θ_1 + θ_2 = 90° into the forward kinematics equations.",
      "2. Compute x = 0.50 × cos(0°) + 0.40 × cos(90°) = 0.50 × 1.0 + 0.40 × 0.0 = 0.50 m.",
      "3. Compute y = 0.50 × sin(0°) + 0.40 × sin(90°) = 0.50 × 0.0 + 0.40 × 1.0 = 0.40 m.",
      "4. Verify that (0.50 m, 0.40 m) lies within the collision-free workspace envelope and outside the operator light-curtain boundary."
    ],
    workedConclusion:
      "The end-effector pose is (x = 0.50 m, y = 0.40 m), verified within joint limits and safety zone clearances.",
    practicalLabScenario:
      "Simulate a robotic pick-and-place workcell that uses overhead machine vision to locate parts on an indexing conveyor, computes collision-free trajectories, interlocks with PLC safety gates, and validates cycle time and repeatability.",
    practicalLabTasks: [
      "Compute forward and inverse kinematic poses for pick, approach, depart, and place waypoints.",
      "Calibrate camera pixel-to-millimeter homography transform for part localization.",
      "Integrate emergency-stop, light-curtain, and vacuum-gripper part-present confirmation signals.",
      "Validate cycle-time throughput and pose repeatability across 50 simulated runs."
    ],
    answerKeyQuestion: {
      prompt: "In an industrial robotic workcell, why must collision avoidance and operator safeguarding rely on hardware safety-rated interlocks (ISO 10218 / ANSI/RIA R15.06) rather than only a software `if` statement in the motion planning script?",
      options: [
        "Software scripts can hang or receive corrupted sensor frames; safety-rated hardware interlocks provide deterministic, redundant power/motion removal when a light curtain or safety gate is breached.",
        "Because robots only move when software crashes.",
        "Because inverse kinematics cannot calculate Z-axis coordinates.",
        "Hardware safety relays increase robot speed above maximum joint limits."
      ],
      correctIndex: 0,
      explanation: "Industrial robot safety standards mandate independent, safety-rated safeguarding hardware for personnel protection."
    },
    careerGuidance: {
      prerequisites: "Linear algebra, trigonometry, Python/C++, control systems, and sensor integration.",
      targetRoles: "Robotics Systems Engineer, Autonomous Systems Developer, Robotic Workcell Integrator, Machine Vision Engineer.",
      qualificationsAndNextSteps: "ROS 2 (Robot Operating System) proficiency, FANUC/ABB/KUKA/UR simulation, ISO 10218 / RIA R15.06 robot safety training."
    },
    mentorReviewCriteria: [
      "Kinematic coordinate frames (Base, Tool Center Point, Camera, Workobject) are explicitly defined.",
      "Motion trajectories include smooth velocity profiling and singularity avoidance.",
      "Workcell validation includes safety interlock verification and recovery from dropped-part faults."
    ],
    principalReferences: [
      {
        title: "OSHA Industrial Robots and Robot System Safety",
        organization: "OSHA / ANSI/RIA R15.06",
        url: "https://www.osha.gov/robotics",
        summary: "Safety standards, hazard analysis, and safeguarding requirements for industrial robotic installations."
      }
    ]
  },
  {
    careerNumber: 12,
    id: "spec-career-12-gis-remote-sensing-geospatial",
    title: "GIS, Remote Sensing and Geospatial Intelligence",
    domainNumber: 3,
    domainTitle: "3. Emerging technology and specialist computing",
    academyId: "academy-3-ai-software-engineering",
    coverImage: "/images/connectln-studies/mlops-data-cover.jpg",
    tangibleEvidenceType: "Multi-Layer Spatial Database, Spectral Index Raster Analysis & Cartographic Decision Report",
    coreCurriculumBullets: [
      "Coordinate systems, spatial databases, satellite imagery, terrain analysis, geospatial modeling, and map production."
    ],
    capstoneProject: "Create a GIS analysis and map-based decision report.",
    workedFormulaTitle: "Normalized Difference Vegetation Index (NDVI) & Ground Sample Distance (GSD)",
    workedFormulaEquations: [
      "NDVI Spectral Index:     NDVI = (NIR - Red) / (NIR + Red)   ∈ [-1.0, +1.0]",
      "Map Scale & Ground Dist: Ground_Distance = Map_Distance × Scale_Denominator",
      "Raster Area Calculation: Area_total = Count_Pixels × (Cell_Resolution_m)²"
    ],
    workedFormulaExplanation:
      "Geospatial analysts project vector and raster datasets into a consistent Coordinate Reference System (CRS, e.g., WGS 84 / UTM zone metric projection) before calculating areas, buffers, terrain slopes, or multispectral indices like NDVI and NDWI.",
    workedProblemStatement:
      "A 10 m × 10 m Sentinel-2 satellite pixel has surface reflectance values of NIR (Band 8) = 0.52 and Red (Band 4) = 0.13. Compute the pixel's NDVI value and calculate the total land area in hectares of a flood/vegetation zone covering 4,500 pixels.",
    workedStepByStep: [
      "1. Compute NDVI = (0.52 - 0.13) / (0.52 + 0.13) = 0.39 / 0.65 = +0.60 (healthy dense vegetation).",
      "2. Area of one 10 m × 10 m pixel = 100 m².",
      "3. Total area of 4,500 pixels = 4,500 × 100 m² = 450,000 m².",
      "4. Convert to hectares (1 ha = 10,000 m²): 450,000 / 10,000 = 45.0 hectares."
    ],
    workedConclusion:
      "The spectral signature yields NDVI = 0.60 across a projected area of 45.0 hectares.",
    practicalLabScenario:
      "Perform a multi-criteria geospatial site-suitability and flood-risk analysis using DEM elevation rasters, multispectral imagery, hydrography vectors, and road networks in a PostGIS/QGIS workflow, and publish a map-based decision report.",
    practicalLabTasks: [
      "Reproject all vector and raster layers into a consistent metric UTM Coordinate Reference System (CRS) and verify datum alignment.",
      "Derive terrain slope and watershed flow accumulation from the Digital Elevation Model (DEM).",
      "Compute multispectral land-cover classification and run spatial buffer/intersection queries.",
      "Produce a publication-grade cartographic map layout (scale bar, north arrow, CRS metadata, legend, and uncertainty notes) and decision brief."
    ],
    answerKeyQuestion: {
      prompt: "What error occurs if you compute Euclidean buffer distances and polygon land areas directly on unprojected geographic coordinates (latitude/longitude in degrees, EPSG:4326) instead of reprojecting to an equal-area or local UTM metric CRS?",
      options: [
        "Degrees of longitude converge toward the poles, causing severe distortion in calculated distances and areas unless projected into a planar metric coordinate system or computed geodetically.",
        "Latitude and longitude coordinates are already measured in exact square meters everywhere on Earth.",
        "Satellite rasters cannot be displayed if they have a coordinate system.",
        "Reprojecting data deletes all attribute tables."
      ],
      correctIndex: 0,
      explanation: "Planar spatial measurements require an appropriate metric projection (such as UTM or Equal-Area) or geodesic calculation to avoid angular distortion."
    },
    careerGuidance: {
      prerequisites: "Geography/cartography basics, SQL (PostGIS), Python (`geopandas`, `rasterio`), and QGIS/ArcGIS.",
      targetRoles: "GIS Analyst, Remote Sensing Specialist, Geospatial Data Scientist, Urban/Infrastructure Spatial Planner.",
      qualificationsAndNextSteps: "GISCI GISP (Certified GIS Professional), Esri Technical Certifications, ASPRS Certified Mapping Scientist."
    },
    mentorReviewCriteria: [
      "All spatial layers share a documented, appropriate projected CRS before distance/area computation.",
      "Remote sensing analysis accounts for cloud masking and spatial resolution limits.",
      "Final map and report communicate data lineage, scale accuracy, and actionable recommendations."
    ],
    principalReferences: [
      {
        title: "USGS National Geospatial Program Standards & EarthExplorer Documentation",
        organization: "U.S. Geological Survey (USGS) / OGC",
        url: "https://www.usgs.gov/National-Geospatial-Program",
        summary: "Authoritative standards for digital elevation models, orthoimagery, coordinate systems, and geospatial metadata."
      }
    ]
  },
  {
    careerNumber: 13,
    id: "spec-career-13-data-science-predictive-analytics",
    title: "Data Science and Predictive Analytics",
    domainNumber: 3,
    domainTitle: "3. Emerging technology and specialist computing",
    academyId: "academy-3-ai-software-engineering",
    coverImage: "/images/connectln-studies/mlops-data-cover.jpg",
    tangibleEvidenceType: "Reproducible Forecasting Pipeline, Out-of-Time Validation Notebook, Subgroup Bias Audit & Executive Decision Brief",
    coreCurriculumBullets: [
      "Statistics, data cleaning, feature engineering, forecasting, model validation, bias analysis, and visualization."
    ],
    capstoneProject: "Develop a forecasting model and explain its limitations to a business stakeholder.",
    workedFormulaTitle: "Root Mean Squared Error (RMSE), Mean Absolute Percentage Error (MAPE) & Temporal Split Hygiene",
    workedFormulaEquations: [
      "RMSE:  RMSE = √[ (1/n) Σ (y_i - ŷ_i)² ]",
      "MAE:   MAE  = (1/n) Σ |y_i - ŷ_i|",
      "Temporal Split Rule:  max(t_train) < min(t_validation) < min(t_test)  (Zero future look-ahead leakage)"
    ],
    workedFormulaExplanation:
      "Predictive analytics requires strict temporal train/validation/test separation so future target information never leaks into historical features, paired with baseline comparisons (e.g., seasonal naive forecast) and subgroup error auditing.",
    workedProblemStatement:
      "A 4-week demand forecast predicts [100, 120, 90, 110] units while actual demand is [110, 114, 98, 102] units. A seasonal naive baseline achieves MAE = 9.5 units. Compute the model's MAE and RMSE and determine whether it beats the baseline.",
    workedStepByStep: [
      "1. Compute absolute errors |y_i - ŷ_i|: |110-100|=10, |114-120|=6, |98-90|=8, |102-110|=8.",
      "2. Compute MAE: (10 + 6 + 8 + 8) / 4 = 32 / 4 = 8.0 units.",
      "3. Compute squared errors: 10²=100, (-6)²=36, 8²=64, (-8)²=64; mean squared error = 264 / 4 = 66.0.",
      "4. Compute RMSE: √66.0 ≈ 8.12 units. Since MAE = 8.0 < 9.5 (naive baseline), the model reduces error by 15.8%."
    ],
    workedConclusion:
      "The model achieves MAE = 8.0 and RMSE = 8.12 units, outperforming the naive baseline by 15.8% on out-of-time validation.",
    practicalLabScenario:
      "Clean a noisy multi-year operational demand dataset, engineer lag/rolling-window features without target leakage, benchmark a gradient-boosted/time-series model against a seasonal naive baseline, audit subgroup residuals, and write a stakeholder decision brief.",
    practicalLabTasks: [
      "Perform exploratory data analysis (EDA) and document missingness, outliers, and schema constraints.",
      "Implement walk-forward temporal cross-validation and verify zero future data leakage.",
      "Compare model MAE/RMSE/prediction intervals against a naive baseline and evaluate subgroup fairness/bias.",
      "Write an Executive Stakeholder Memo translating prediction uncertainty into operational inventory decisions."
    ],
    answerKeyQuestion: {
      prompt: "Why does using random k-fold cross-validation on a time-series forecasting dataset produce artificially optimistic test metrics that fail in production?",
      options: [
        "Random shuffling places future observations into the training set and allows rolling averages or lag features to leak future information when predicting past dates.",
        "Because time-series datasets never contain more than 10 rows.",
        "Because RMSE can only be calculated on alphabetically sorted strings.",
        "Random k-fold cross-validation only works on images."
      ],
      correctIndex: 0,
      explanation: "Time-series forecasting requires chronological (out-of-time / walk-forward) splits so the model only learns from data available prior to the forecast horizon."
    },
    careerGuidance: {
      prerequisites: "Probability & statistics, linear algebra, SQL, Python (`pandas`, `scikit-learn`, `statsmodels`), and data visualization.",
      targetRoles: "Data Scientist, Predictive Analytics Specialist, Quantitative Business Analyst, Machine Learning Engineer.",
      qualificationsAndNextSteps: "INFORMS Certified Analytics Professional (CAP), cloud ML engineering credentials, reproducible Git + DVC portfolio."
    },
    mentorReviewCriteria: [
      "Feature engineering pipeline is fitted strictly on training folds with zero look-ahead leakage.",
      "Model is benchmarked against a simple, transparent baseline.",
      "Stakeholder brief clearly explains confidence intervals, failure modes, and business impact."
    ],
    principalReferences: [
      {
        title: "NIST/SEMATECH e-Handbook of Statistical Methods",
        organization: "National Institute of Standards and Technology (NIST)",
        url: "https://www.itl.nist.gov/div898/handbook/",
        summary: "Authoritative reference on exploratory data analysis, time-series modeling, uncertainty quantification, and statistical process control."
      }
    ]
  },
  {
    careerNumber: 14,
    id: "spec-career-14-embedded-systems-firmware",
    title: "Embedded Systems and Firmware Engineering",
    domainNumber: 3,
    domainTitle: "3. Emerging technology and specialist computing",
    academyId: "academy-3-ai-software-engineering",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    tangibleEvidenceType: "C/C++ Firmware Source, ADC/I2C/SPI Driver Suite, RTOS Timing Analysis & Secure Boot Verification Log",
    coreCurriculumBullets: [
      "Microcontrollers, C/C++, device drivers, real-time systems, hardware interfaces, debugging, and firmware security."
    ],
    capstoneProject: "Build and test a sensor-based embedded system using safe low-voltage equipment.",
    workedFormulaTitle: "ADC Quantization Resolution, Sampling Rate & RTOS CPU Utilization Bound",
    workedFormulaEquations: [
      "ADC LSB Resolution:     V_LSB = V_ref / (2^N - 1)  ;  Digital_Code = round((V_in / V_ref) × (2^N - 1))",
      "RTOS CPU Utilization:   U = Σ (C_i / T_i)  (where C_i = worst-case execution time, T_i = task period)"
    ],
    workedFormulaExplanation:
      "Embedded firmware engineers calculate Analog-to-Digital Converter (ADC) resolution, bound worst-case interrupt latency and RTOS task utilization, use hardware watchdog timers, and verify cryptographic firmware signatures before boot.",
    workedProblemStatement:
      "A 12-bit microcontroller ADC uses a precision reference voltage V_ref = 3.300 V. An analog temperature sensor outputs V_in = 1.650 V. Calculate the voltage resolution per LSB and the expected digital ADC count, and verify CPU utilization for two periodic tasks: Task A (C_1 = 2 ms, T_1 = 10 ms) and Task B (C_2 = 15 ms, T_2 = 50 ms).",
    workedStepByStep: [
      "1. Compute 12-bit ADC total steps: 2^12 - 1 = 4095.",
      "2. Compute voltage per LSB: V_LSB = 3.300 V / 4095 ≈ 0.8059 mV/count.",
      "3. Compute expected digital ADC reading at 1.650 V: (1.650 / 3.300) × 4095 = 2047.5 ⇒ 2048 counts (0x800).",
      "4. Compute RTOS CPU utilization: U = (2 / 10) + (15 / 50) = 0.20 + 0.30 = 0.50 (50.0% CPU utilization, safely below the Rate Monotonic bound of 82.8% for 2 tasks)."
    ],
    workedConclusion:
      "The 12-bit ADC resolves 0.81 mV/count (reading 2048 at mid-scale), and the periodic task schedule runs deterministically at 50% CPU utilization.",
    practicalLabScenario:
      "Develop C/C++ firmware for a safe low-voltage (3.3 V / 5 V) environmental telemetry node that reads an I2C/SPI sensor and analog ADC channel, schedules periodic acquisition and UART/CAN reporting tasks, services a hardware watchdog timer, and verifies signed OTA firmware images.",
    practicalLabTasks: [
      "Write non-blocking interrupt-driven I2C/UART peripheral drivers with timeout and bus-hang recovery.",
      "Implement fixed-point ADC scaling and digital low-pass filtering without dynamic heap fragmentation.",
      "Measure Worst-Case Execution Time (WCET) and stack high-water marks for all tasks.",
      "Implement cryptographic image hash/signature verification in the bootloader specification."
    ],
    answerKeyQuestion: {
      prompt: "Why should Interrupt Service Routines (ISRs) in real-time embedded C firmware be kept short and never call blocking delay loops or non-reentrant heap allocation (`malloc`)?",
      options: [
        "Long or blocking ISRs starve lower-priority interrupts, break deterministic real-time deadlines, and can cause race conditions or heap corruption.",
        "Because microcontrollers execute ISRs in the cloud.",
        "Because `malloc` automatically resets the watchdog timer.",
        "Interrupts can only run once per hour on ARM Cortex-M processors."
      ],
      correctIndex: 0,
      explanation: "ISRs should capture minimal hardware state, clear the interrupt flag, and signal a deferred RTOS task or ring buffer so real-time determinism is preserved."
    },
    careerGuidance: {
      prerequisites: "C/C++ programming, digital logic, microcontroller architecture (ARM Cortex-M / RISC-V / ESP32), and multimeter/logic-analyzer usage.",
      targetRoles: "Embedded Firmware Engineer, Real-Time Systems Developer, IoT Hardware/Firmware Integrator, Embedded Security Engineer.",
      qualificationsAndNextSteps: "MISRA C coding standards, FreeRTOS/Zephyr RTOS mastery, hardware-in-the-loop (HIL) automated testing."
    },
    mentorReviewCriteria: [
      "Firmware uses `volatile` qualifiers properly on memory-mapped hardware registers and ISR-shared flags.",
      "No unbounded `while(1)` polling loops without hardware timeout and error handling.",
      "Lab stays strictly within safe low-voltage (< 12 V DC) bench equipment limits."
    ],
    principalReferences: [
      {
        title: "NIST IR 8259: Foundational Cybersecurity Activities for IoT Device Manufacturers",
        organization: "NIST",
        url: "https://csrc.nist.gov/pubs/ir/8259/final",
        summary: "Baseline security capabilities for embedded and IoT devices including device identity, configuration protection, and secure software updates."
      }
    ]
  },
  {
    careerNumber: 15,
    id: "spec-career-15-database-data-platform-engineering",
    title: "Database and Data Platform Engineering",
    domainNumber: 3,
    domainTitle: "3. Emerging technology and specialist computing",
    academyId: "academy-3-ai-software-engineering",
    coverImage: "/images/connectln-studies/mlops-data-cover.jpg",
    tangibleEvidenceType: "Normalized Schema DDL, Query Execution Plan Optimization Log, PITR Restore Drill & RBAC Audit Package",
    coreCurriculumBullets: [
      "SQL, schema design, query optimization, database replication, recovery, access control, and data pipeline reliability."
    ],
    capstoneProject: "Build a reliable data platform and demonstrate backup restoration and performance testing.",
    workedFormulaTitle: "B-Tree Index Selectivity, IOPS Throughput & Recovery Point / Time Objectives (RPO / RTO)",
    workedFormulaEquations: [
      "Column Cardinality Selectivity:  S = Distinct_Values / Total_Rows   (High selectivity → S close to 1.0)",
      "Recovery Point Objective (RPO):  Max_Data_Loss_Window = t_failure - t_last_durable_WAL_archive",
      "Recovery Time Objective (RTO):   Total_Outage_Duration = t_detect + t_restore_base + t_replay_WAL + t_verify"
    ],
    workedFormulaExplanation:
      "Data platform engineers design 3NF transactional schemas and partitioned analytical tables, optimize slow queries using `EXPLAIN ANALYZE` and composite B-Tree indexes, enforce Row-Level Security (RLS) and least-privilege roles, and regularly test Point-in-Time Recovery (PITR).",
    workedProblemStatement:
      "A 20-million-row `orders` table executes `SELECT * FROM orders WHERE tenant_id = 42 AND status = 'OPEN' ORDER BY created_at DESC LIMIT 50` in 4,200 ms via a full sequential table scan. Design the optimal composite B-Tree index and calculate whether a backup restore taking 18 minutes of base copy + 7 minutes of WAL replay + 3 minutes of verification meets a 30-minute RTO.",
    workedStepByStep: [
      "1. Analyze query predicates (`tenant_id = 42 AND status = 'OPEN'`) and sort order (`created_at DESC`).",
      "2. Create composite index: `CREATE INDEX idx_orders_tenant_status_created ON orders (tenant_id, status, created_at DESC);` to satisfy both equality filtering and ordered limit via a single Index Scan without an in-memory sort.",
      "3. Calculate total recovery duration (RTO): 18 min (base backup restore) + 7 min (WAL log replay) + 3 min (checksum & row verification) = 28 minutes.",
      "4. Since 28 minutes <= 30-minute target RTO, the recovery procedure passes SLA verification."
    ],
    workedConclusion:
      "The composite index eliminates sequential scanning and external sorting, while the verified PITR drill completes in 28 minutes (within the 30-minute RTO).",
    practicalLabScenario:
      "Architect a multi-tenant PostgreSQL data platform, optimize 4 bottleneck queries using `EXPLAIN (ANALYZE, BUFFERS)`, configure streaming replication and automated WAL archiving, enforce least-privilege RBAC/RLS, and execute a live Point-in-Time Recovery (PITR) drill.",
    practicalLabTasks: [
      "Design the 3NF relational schema with foreign keys, check constraints, and idempotent migration scripts.",
      "Capture before-and-after `EXPLAIN (ANALYZE, BUFFERS)` plans showing page reads and latency reductions.",
      "Configure role-based access control (RBAC) and Row-Level Security (RLS) policies for tenant isolation.",
      "Simulate accidental table corruption at timestamp T_0 and perform a documented PITR restore to T_0 - 1 second."
    ],
    answerKeyQuestion: {
      prompt: "Why is an untested automated backup schedule considered an incomplete disaster recovery strategy in database engineering?",
      options: [
        "Backups can silently fail, omit Write-Ahead Logs (WAL), or exceed RTO during restoration; only periodic, timed restore drills onto an isolated target verify data integrity and actual recovery time.",
        "Because SQL databases never need backups if they use B-Tree indexes.",
        "Because `DROP TABLE` is automatically blocked by RAID-10 disks.",
        "Replication copies accidental `DELETE` queries slower than backups."
      ],
      correctIndex: 0,
      explanation: "Remember that replication is not a backup (replication immediately propagates accidental `DROP/DELETE` commands), and a backup is only valid once restoration is tested and timed."
    },
    careerGuidance: {
      prerequisites: "Relational algebra, SQL, Linux storage/networking basics, and transactional ACID principles.",
      targetRoles: "Database Engineer, Data Platform Engineer, Site Reliability Engineer (Database), Analytics Infrastructure Engineer.",
      qualificationsAndNextSteps: "PostgreSQL / Snowflake / Databricks / AWS Database Specialty certifications, dbt & Airflow pipeline orchestration."
    },
    mentorReviewCriteria: [
      "Index selection is justified by `EXPLAIN (ANALYZE, BUFFERS)` execution plans rather than indexing every column.",
      "PITR runbook proves exact row counts and cryptographic checksums after restoration.",
      "Access control separates migration admin roles from read/write application service accounts."
    ],
    principalReferences: [
      {
        title: "PostgreSQL Official Documentation: High Availability, Load Balancing, and Replication",
        organization: "PostgreSQL Global Development Group",
        url: "https://www.postgresql.org/docs/current/high-availability.html",
        summary: "Authoritative technical manual on Write-Ahead Logging (WAL), Point-in-Time Recovery (PITR), indexing, and transaction isolation."
      }
    ]
  },
  {
    careerNumber: 16,
    id: "spec-career-16-digital-twin-simulation-engineering",
    title: "Digital Twin and Simulation Engineering",
    domainNumber: 3,
    domainTitle: "3. Emerging technology and specialist computing",
    academyId: "academy-3-ai-software-engineering",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    tangibleEvidenceType: "Calibrated Digital Twin State-Space Model, Real-Time Telemetry Sync Pipeline & Predictive Maintenance Report",
    coreCurriculumBullets: [
      "System modeling, sensor integration, simulation, real-time telemetry, model calibration, and predictive maintenance."
    ],
    capstoneProject: "Build a digital representation of a simulated factory, building, or energy system.",
    workedFormulaTitle: "Thermal/Mechanical State-Space Update, Residual Anomaly Score & Remaining Useful Life (RUL)",
    workedFormulaEquations: [
      "Discrete State Update:     x_{k+1} = A x_k + B u_k + w_k",
      "Twin Residual Error:       r_k = | y_measured,k - ŷ_twin,k |",
      "Normalized Calibration Error (NRMSE):  NRMSE = RMSE / (y_max - y_min)"
    ],
    workedFormulaExplanation:
      "A Digital Twin couples a physics-informed or data-driven simulation model (`ŷ_twin`) with real-time IoT/SCADA sensor telemetry (`y_measured`). When the physical asset degrades (bearing wear, heat-exchanger fouling), the residual divergence `r_k` between the calibrated twin and physical sensor triggers predictive maintenance before catastrophic failure.",
    workedProblemStatement:
      "A calibrated pump-motor digital twin predicts a steady-state bearing housing temperature of ŷ_twin = 62.0°C at 80% load and 25°C ambient temperature (normal residual σ = 1.2°C). Live telemetry reports y_measured = 71.6°C while load and ambient temperature remain unchanged. Compute the residual z-score and diagnose the condition.",
    workedStepByStep: [
      "1. Compute absolute residual divergence: r_k = 71.6°C - 62.0°C = +9.6°C.",
      "2. Normalize by baseline residual standard deviation (σ = 1.2°C): z = 9.6 / 1.2 = 8.0σ.",
      "3. Cross-check sensor health (verify RTD sensor isn't drifting via redundant vibration/current telemetry).",
      "4. Since motor current and vibration RMS also rose 18%, schedule a predictive bearing lubrication/replacement work order before thermal trip."
    ],
    workedConclusion:
      "An 8.0σ residual divergence between the calibrated physics twin and live sensor telemetry isolates physical mechanical degradation early.",
    practicalLabScenario:
      "Construct a digital twin of a simulated industrial cooling-water loop (pump, heat exchanger, control valve, and thermal load), stream live MQTT/OPC-UA telemetry into the model, calibrate heat-transfer coefficients against historical runs, and detect injected fouling and cavitation faults.",
    practicalLabTasks: [
      "Formulate the mass and energy conservation equations for the cooling loop digital twin.",
      "Ingest simulated real-time sensor streams (flow, differential pressure, inlet/outlet temperatures, motor power) and synchronize timestamps.",
      "Calibrate model parameters to achieve < 3% NRMSE on healthy baseline operation.",
      "Run fault-injection scenarios (heat-exchanger fouling, sensor drift, valve stiction) and generate predictive maintenance alerts."
    ],
    answerKeyQuestion: {
      prompt: "What distinguishes a true operational Digital Twin from a static 3D CAD model or a one-time offline simulation?",
      options: [
        "A Digital Twin maintains a continuous, synchronized data link with telemetry from the physical asset, allowing real-time state estimation, calibration, and what-if/predictive maintenance analysis.",
        "A Digital Twin is simply a higher-resolution PNG rendering of a building.",
        "Digital Twins never use physical laws or sensor measurements.",
        "Offline CAD files automatically update themselves when a physical pump bearing wears out."
      ],
      correctIndex: 0,
      explanation: "Bidirectional or continuous real-time telemetry synchronization and model calibration define an operational Digital Twin."
    },
    careerGuidance: {
      prerequisites: "Physics/system dynamics, Python/MATLAB/Simulink, time-series databases, and industrial protocols (MQTT, OPC-UA).",
      targetRoles: "Digital Twin Engineer, Simulation & Modeling Specialist, Predictive Maintenance Engineer, Cyber-Physical Systems Architect.",
      qualificationsAndNextSteps: "Modelica / FMI (Functional Mock-up Interface) standards, Azure Digital Twins / AWS IoT TwinMaker / NVIDIA Omniverse."
    },
    mentorReviewCriteria: [
      "Simulation model clearly documents physical boundary conditions and calibration error (NRMSE).",
      "Diagnostic logic distinguishes physical asset degradation from single-sensor drift.",
      "What-if simulation demonstrates actionable operational optimization."
    ],
    principalReferences: [
      {
        title: "NIST Digital Twin Framework & Smart Manufacturing Standards (ISO 23247)",
        organization: "NIST / ISO",
        url: "https://www.nist.gov/el/systems-integration-division/digital-twin-framework-smart-manufacturing",
        summary: "Reference architecture and interoperability standards for building, calibrating, and validating industrial digital twins."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 4: HEALTHCARE, LABORATORY AND LIFE SCIENCES (17-20)
  // --------------------------------------------------------------------------
  {
    careerNumber: 17,
    id: "spec-career-17-biomedical-equipment-technology",
    title: "Biomedical Equipment Technology",
    domainNumber: 4,
    domainTitle: "4. Healthcare, laboratory and life sciences",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/certifications-hub-cover.jpg",
    tangibleEvidenceType: "Preventive Maintenance Checklist, Electrical Safety Analyzer Log, Calibration Certificate & CMMS Lifecycle Record",
    coreCurriculumBullets: [
      "Medical device fundamentals, preventive maintenance, calibration concepts, electrical safety, service records, and equipment lifecycle management."
    ],
    capstoneProject: "Complete a simulated preventive maintenance, electrical safety verification, and CMMS service lifecycle package for a non-invasive biomedical instrument dataset.",
    regulatoryBoundaryNote:
      "Regulatory Boundary Notice: These healthcare, laboratory, and life-science pathways teach foundational technical knowledge and professional documentation workflows. Course completion alone does NOT qualify or license an individual to perform regulated clinical duties, service life-support devices on patients, or practice clinical medicine without accredited training, manufacturer authorization, and institutional credentialing.",
    workedFormulaTitle: "Chassis Ground Resistance, Leakage Current & Calibration Error Percentage",
    workedFormulaEquations: [
      "Calibration Relative Error:  %Error = ((Measured_Output - True_Standard) / True_Standard) × 100%",
      "Ohm's Law Ground Fault Check: V_touch = I_leakage × R_ground"
    ],
    workedFormulaExplanation:
      "Biomedical Equipment Technicians (BMETs) verify medical device electrical safety (protective earth resistance and chassis/patient lead leakage currents per IEC 60601 / NFPA 99), compare device outputs against NIST-traceable standards, and log complete service histories in the hospital CMMS.",
    workedProblemStatement:
      "During a bench simulation of an infusion pump calibration check against a NIST-traceable flow analyzer at a target rate of 100.0 mL/hr, the measured flow is 93.2 mL/hr, while the manufacturer's allowed tolerance is ±5.0%. Calculate the percentage error and determine the required disposition.",
    workedStepByStep: [
      "1. Compute relative calibration error: ((93.2 - 100.0) / 100.0) × 100% = -6.80%.",
      "2. Compare |-6.80%| against the manufacturer's ±5.0% specification limit: 6.80% > 5.0% (OUT OF TOLERANCE).",
      "3. Tag the device 'Out of Service — Do Not Use' and quarantine it from clinical circulation.",
      "4. Document the As-Found reading (-6.80%) in the CMMS before performing manufacturer-specified recalibration/repair and recording As-Left verification."
    ],
    workedConclusion:
      "Because the -6.80% error exceeds the ±5.0% limit, the device fails inspection, must be tagged out of clinical service, and requires documented As-Found / As-Left calibration records.",
    practicalLabScenario:
      "Evaluate a simulated hospital inventory of 12 diagnostic and monitoring devices, review electrical safety and calibration test logs, identify out-of-tolerance instruments, and complete CMMS preventive maintenance and recall documentation.",
    practicalLabTasks: [
      "Evaluate protective ground resistance and leakage current test datasets against IEC 60601 / NFPA 99 limits.",
      "Calculate As-Found and As-Left calibration tolerances and flag out-of-tolerance equipment for quarantine.",
      "Prioritize a risk-based Preventive Maintenance (PM) schedule based on device criticality, failure history, and manufacturer intervals.",
      "Complete a simulated FDA medical device safety alert / recall quarantine workflow in the CMMS log."
    ],
    answerKeyQuestion: {
      prompt: "When a biomedical device fails an 'As-Found' calibration check during routine preventive maintenance, why must the technician record the exact 'As-Found' out-of-tolerance values in the CMMS BEFORE adjusting or repairing the device?",
      options: [
        "Recording 'As-Found' data provides essential traceability to evaluate whether prior measurements or usage were affected by device drift and satisfies quality audit requirements.",
        "Because recalibrating a device is never allowed once it drifts.",
        "So the technician can skip the 'As-Left' verification test after repair.",
        "Because NIST standards only measure broken devices."
      ],
      correctIndex: 0,
      explanation: "Both As-Found and As-Left measurements are mandatory in quality systems to track instrument drift and assess potential impact on prior operations."
    },
    careerGuidance: {
      prerequisites: "Electronics fundamentals, anatomy/physiology terminology, measurement metrology, and technical documentation.",
      targetRoles: "Biomedical Equipment Technician (BMET), Clinical Engineering Support Specialist, Field Service Technician (Medical Devices).",
      qualificationsAndNextSteps: "AAS in Biomedical Equipment Technology, AAMI Credentials Institute CBET (Certified Biomedical Equipment Technician), OEM service training."
    },
    mentorReviewCriteria: [
      "Service records clearly document test standard serial numbers, calibration due dates, As-Found, and As-Left values.",
      "Out-of-tolerance or electrically unsafe devices are immediately quarantined from service.",
      "Explicit adherence to regulatory and institutional credentialing boundaries."
    ],
    principalReferences: [
      {
        title: "FDA Medical Device Safety & AAMI HTM Standards Overview",
        organization: "U.S. Food and Drug Administration (FDA) / AAMI",
        url: "https://www.fda.gov/medical-devices/medical-device-safety",
        summary: "Regulatory guidance on medical device quality systems, safety alerts, adverse event reporting, and healthcare technology management."
      }
    ]
  },
  {
    careerNumber: 18,
    id: "spec-career-18-laboratory-quality-compliance",
    title: "Laboratory Quality and Compliance",
    domainNumber: 4,
    domainTitle: "4. Healthcare, laboratory and life sciences",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    tangibleEvidenceType: "Controlled SOP Document, Levey-Jennings QC Chart Analysis, Deviation Investigation & CAPA Package",
    coreCurriculumBullets: [
      "Quality management systems, standard operating procedures, measurement traceability, calibration records, deviations, and corrective actions."
    ],
    capstoneProject: "Investigate a simulated laboratory quality control deviation, perform root-cause analysis, and author a compliant CAPA and controlled SOP update.",
    regulatoryBoundaryNote:
      "Regulatory Boundary Notice: This pathway teaches foundational Quality Management System (QMS), ISO/IEC 17025 / GLP, and CAPA documentation workflows. It does NOT confer clinical laboratory licensure (such as ASCP/CLIA clinical scientist certification) or authorize diagnostic patient testing.",
    workedFormulaTitle: "Levey-Jennings QC Z-Score (SDI) & Coefficient of Variation (%CV)",
    workedFormulaEquations: [
      "Standard Deviation Index (Z-Score):  Z = (x_QC - μ_target) / s",
      "Coefficient of Variation (%CV):      %CV = (s / μ_target) × 100%"
    ],
    workedFormulaExplanation:
      "Laboratory quality specialists monitor analytical precision and bias using daily Quality Control (QC) control materials plotted on Levey-Jennings charts (±1s, ±2s, ±3s limits) and Westgard rules (e.g., 1_3s rejection rule when a control exceeds ±3s), backed by ALCOA+ data integrity principles (Attributable, Legible, Contemporaneous, Original, Accurate).",
    workedProblemStatement:
      "An analytical assay QC control has an established target mean μ = 50.0 mg/L and standard deviation s = 1.5 mg/L. Today's QC run measures x_QC = 55.1 mg/L. Calculate the %CV of the method, the Z-score of today's run, and state the required Westgard QC action.",
    workedStepByStep: [
      "1. Compute method Coefficient of Variation: %CV = (1.5 / 50.0) × 100% = 3.0%.",
      "2. Compute today's QC Z-score: Z = (55.1 - 50.0) / 1.5 = +5.1 / 1.5 = +3.40s.",
      "3. Apply Westgard 1_3s rule: Because |Z| = 3.40s > 3.0s, the analytical run is REJECTED (out-of-control).",
      "4. Halt sample release, open a formal Deviation Record, inspect reagent lot/pipette calibration/temperature logs, and re-run QC after corrective action."
    ],
    workedConclusion:
      "A +3.40s QC excursion triggers a Westgard 1_3s run rejection; sample results cannot be released until the root cause is resolved and QC passes.",
    practicalLabScenario:
      "Audit a 30-day laboratory QC and calibration dataset containing a systematic reagent-degradation trend and a 1_3s excursion, conduct a 5-Why / Ishikawa root-cause investigation, and write a Corrective and Preventive Action (CAPA) report and revised SOP.",
    practicalLabTasks: [
      "Plot and analyze the 30-day Levey-Jennings QC chart to detect systematic shift vs. random error.",
      "Verify ALCOA+ data integrity compliance across bench worksheets and audit trails.",
      "Complete a structured Deviation Investigation separating immediate containment/correction from systemic root cause.",
      "Author a measurable CAPA plan with effectiveness-check criteria and a version-controlled SOP revision."
    ],
    answerKeyQuestion: {
      prompt: "In laboratory quality management, what is the critical difference between an immediate 'Correction' and a systemic 'Preventive/Corrective Action (CAPA)'?",
      options: [
        "A Correction fixes the immediate isolated symptom (e.g., quarantining a degraded reagent bottle and repeating the run), whereas a CAPA eliminates the underlying systemic root cause (e.g., adding automated refrigerator temperature alarms and receiving inspection checks) so the failure does not recur.",
        "Correction and CAPA mean the exact same thing and require no root-cause analysis.",
        "CAPA means rewriting failed QC numbers so they fall inside ±2s.",
        "Human error should always be listed as the final systemic root cause without checking procedures or equipment."
      ],
      correctIndex: 0,
      explanation: "Effective quality systems never stop at 'retrain operator'; they address systemic process, environmental, or procedural root causes and verify CAPA effectiveness."
    },
    careerGuidance: {
      prerequisites: "General science/chemistry fundamentals, descriptive statistics, and technical writing.",
      targetRoles: "Laboratory Quality Assurance (QA) Specialist, Quality Compliance Analyst, GLP/GMP Document Control Coordinator, Metrology/Calibration Coordinator.",
      qualificationsAndNextSteps: "ASQ Certified Quality Auditor (CQA) / Certified Pharmaceutical GMP Professional, ISO/IEC 17025 & ISO 9001 internal auditor training."
    },
    mentorReviewCriteria: [
      "Levey-Jennings Z-scores and Westgard rule violations are accurately identified.",
      "Root-cause analysis moves beyond superficial 'human error' to systemic process controls.",
      "CAPA includes specific, time-bound effectiveness verification criteria."
    ],
    principalReferences: [
      {
        title: "FDA Guidance for Industry: Quality Systems Approach to Pharmaceutical CGMP Regulations",
        organization: "U.S. Food and Drug Administration (FDA) / WHO",
        url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/quality-systems-approach-pharmaceutical-cgmp-regulations",
        summary: "Foundational principles for laboratory and manufacturing quality management systems, deviations, CAPA, and data integrity."
      }
    ]
  },
  {
    careerNumber: 19,
    id: "spec-career-19-clinical-research-operations",
    title: "Clinical Research Operations",
    domainNumber: 4,
    domainTitle: "4. Healthcare, laboratory and life sciences",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    tangibleEvidenceType: "Trial Master File (TMF) Audit Log, Informed Consent Verification Checklist, Source Data Verification (SDV) Report & SAE Narrative",
    coreCurriculumBullets: [
      "Study protocols, informed consent, research documentation, data integrity, adverse-event reporting, and research ethics."
    ],
    capstoneProject: "Perform a simulated clinical site monitoring review (informed consent audit, protocol deviation log, eCRF source data verification, and safety reporting timeline check) on a fictional dataset.",
    regulatoryBoundaryNote:
      "Regulatory Boundary Notice: This pathway teaches clinical trial operations, ICH E6 Good Clinical Practice (GCP) documentation, and research ethics workflows. It does NOT qualify learners to provide medical care, make clinical diagnoses, or serve as a licensed Principal Investigator.",
    workedFormulaTitle: "Protocol Visit Window Compliance, Source Data Verification (SDV) Rate & SAE Reporting Clock",
    workedFormulaEquations: [
      "Query Resolution Rate:   QRR = (Resolved_eCRF_Queries / Total_Opened_Queries) × 100%",
      "SAE Sponsor Reporting:   t_report - t_site_awareness <= 24 hours (ICH E6 GCP / Protocol standard)"
    ],
    workedFormulaExplanation:
      "Clinical Research Associates (CRAs) and Clinical Research Coordinators (CRCs) safeguard human subject rights, safety, and well-being and ensure trial data credibility under ICH E6 Good Clinical Practice (GCP), verifying that written Informed Consent is signed and dated by the participant PRIOR to any study-specific screening procedure.",
    workedProblemStatement:
      "During a simulated site monitoring visit, Subject 04-102's source chart shows a study-specific screening blood draw occurred on May 10 at 09:15, while the Informed Consent Form (ICF) was signed on May 10 at 10:45. In addition, the site learned of a hospitalization (Serious Adverse Event) on June 2 at 14:00 and reported it to the Sponsor on June 5 at 11:00. Identify both GCP findings.",
    workedStepByStep: [
      "1. Finding 1 (Major Informed Consent Deviation): Study screening blood draw (09:15) occurred 90 minutes BEFORE the participant signed the ICF (10:45), violating ICH E6 GCP requirement that informed consent be obtained prior to any study-specific procedure.",
      "2. Finding 2 (Late SAE Reporting): The hospitalization meets the regulatory definition of a Serious Adverse Event (SAE). The site reported it 69 hours after awareness, exceeding the mandatory 24-hour initial SAE reporting window.",
      "3. Required Actions: Document both protocol deviations, notify the IRB/IEC per institutional policy, complete CAPA training on pre-procedure consent verification and 24-hour SAE escalation."
    ],
    workedConclusion:
      "Chronological verification of source timestamps exposes a pre-consent procedure violation and a late 24-hour SAE safety report, both requiring IRB notification and site CAPA.",
    practicalLabScenario:
      "Audit a fictional clinical study site binder containing 8 participant records (Informed Consent Forms, source clinic notes, eCRF entries, investigational product temperature logs, and Adverse Event logs) and prepare a Site Monitoring Visit Report.",
    practicalLabTasks: [
      "Verify 100% of Informed Consent Forms for correct IRB-approved version, participant signature/date prior to screening, and documentation of the consent process.",
      "Perform Source Data Verification (SDV) comparing source medical records against eCRF data entries and issue clear data queries.",
      "Classify Adverse Events (AE vs. SAE) and verify 24-hour safety reporting compliance.",
      "Write the Monitoring Visit Follow-Up Letter and Protocol Deviation / CAPA log."
    ],
    answerKeyQuestion: {
      prompt: "Under ICH E6 Good Clinical Practice (GCP), when must a clinical trial participant personally sign and date the IRB/IEC-approved Informed Consent Form (ICF)?",
      options: [
        "Before ANY study-specific procedures, including screening labs or washout of prior medications, are performed.",
        "At the end of the clinical trial after all data has been analyzed.",
        "Within 30 days after the first dose of investigational product.",
        "Only if the participant experiences an adverse event."
      ],
      correctIndex: 0,
      explanation: "ICH E6 GCP strictly requires voluntary, documented informed consent prior to performing any study-related procedure."
    },
    careerGuidance: {
      prerequisites: "Life sciences or healthcare administration foundation, attention to regulatory detail, and ethical research principles.",
      targetRoles: "Clinical Research Coordinator (CRC), Clinical Trial Assistant (CTA), Junior Clinical Research Associate (CRA), Regulatory Document Specialist.",
      qualificationsAndNextSteps: "ICH E6(R3) GCP training, CITI Human Subjects Research training, ACRP (CCRC/CCRA) or SoCRA (CCRP) certification after required supervised hours."
    },
    mentorReviewCriteria: [
      "Informed consent audit checks IRB version number, chronological timestamps, and source note corroboration.",
      "SAE vs. non-serious AE classification strictly follows ICH E2A/E6 criteria (death, life-threatening, inpatient hospitalization, persistent disability, congenital anomaly).",
      "Clear statement of clinical vs. administrative scope boundaries."
    ],
    principalReferences: [
      {
        title: "ICH E6 Good Clinical Practice (GCP) & FDA Clinical Trials Guidance",
        organization: "FDA / International Council for Harmonisation (ICH)",
        url: "https://www.fda.gov/science-research/clinical-trials-and-human-subject-protection/ich-guidance-documents",
        summary: "International ethical and scientific quality standard for designing, conducting, recording, and reporting trials involving human participants."
      }
    ]
  },
  {
    careerNumber: 20,
    id: "spec-career-20-public-health-analytics",
    title: "Public Health Analytics",
    domainNumber: 4,
    domainTitle: "4. Healthcare, laboratory and life sciences",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/mlops-data-cover.jpg",
    tangibleEvidenceType: "Epidemiological Line-List Analysis, Epidemic Curve (Epi Curve), Relative Risk Table & Outbreak Situation Report",
    coreCurriculumBullets: [
      "Epidemiological measures, surveillance data, statistical interpretation, outbreak investigation fundamentals, and evidence-based reporting."
    ],
    capstoneProject: "Analyze a simulated foodborne/waterborne outbreak surveillance dataset, calculate attack rates and relative risks, plot the epidemic curve, and author an evidence-based Public Health Situation Report.",
    regulatoryBoundaryNote:
      "Regulatory Boundary Notice: This pathway teaches epidemiological statistics, surveillance data analysis, and public-health reporting methods. It does NOT constitute clinical medical advice or statutory public-health authority.",
    workedFormulaTitle: "Incidence Rate, Attack Rate, Relative Risk (RR) & Odds Ratio (OR)",
    workedFormulaEquations: [
      "Attack Rate (Exposed):   AR_exp = a / (a + b)   ;   AR_unexp = c / (c + d)",
      "Relative Risk (Cohort):  RR = AR_exp / AR_unexp = [a / (a + b)] / [c / (c + d)]",
      "Odds Ratio (Case-Ctrl):  OR = (a × d) / (b × c)"
    ],
    workedFormulaExplanation:
      "Public health analysts construct 2×2 contingency tables (Exposed Cases `a`, Exposed Non-Cases `b`, Unexposed Cases `c`, Unexposed Non-Cases `d`) to compute Attack Rates, Relative Risk (RR), and 95% confidence intervals, while plotting Epidemic Curves (cases by symptom onset time) to distinguish point-source vs. propagated transmission.",
    workedProblemStatement:
      "In a retrospective cohort investigation of 200 conference attendees following an acute gastrointestinal cluster, 120 attendees ate the unpasteurized herb sauce (60 became ill: a = 60, b = 60), while 80 attendees did not eat the sauce (8 became ill: c = 8, d = 72). Calculate the Attack Rate in each group and the Relative Risk (RR).",
    workedStepByStep: [
      "1. Compute Attack Rate among exposed (ate sauce): AR_exp = 60 / (60 + 60) = 60 / 120 = 50.0%.",
      "2. Compute Attack Rate among unexposed (did not eat sauce): AR_unexp = 8 / (8 + 72) = 8 / 80 = 10.0%.",
      "3. Compute Relative Risk: RR = 50.0% / 10.0% = 5.0.",
      "4. Interpretation: Attendees who consumed the unpasteurized herb sauce had 5.0 times the risk of developing illness compared to those who did not."
    ],
    workedConclusion:
      "An exposed attack rate of 50.0% vs. 10.0% unexposed (RR = 5.0) strongly implicates the herb sauce as the vehicle of exposure, subject to environmental and laboratory confirmation.",
    practicalLabScenario:
      "Clean a de-identified line-list dataset of 250 suspected outbreak cases, establish a tiered Case Definition (Confirmed, Probable, Possible), plot the Epidemic Curve by 6-hour onset intervals, calculate food/water exposure Relative Risks with 95% CIs, and draft an Epidemiological Situation Report.",
    practicalLabTasks: [
      "Apply a standardized Case Definition (clinical symptoms + person, place, time + laboratory confirmation) to classify the line list.",
      "Plot the Epidemic Curve and calculate median incubation period from the sharp single-peak distribution.",
      "Construct 2×2 exposure tables for 6 candidate exposures and compute AR_exp, AR_unexp, Relative Risk (RR), and 95% confidence intervals.",
      "Write an evidence-based Situation Report detailing surveillance biases, confounding factors, and prevention recommendations."
    ],
    answerKeyQuestion: {
      prompt: "In an outbreak investigation, what does an Epidemic Curve (histogram of case counts by date/hour of symptom onset) with a rapid rise to a single sharp peak followed by a gradual tail within one incubation period indicate?",
      options: [
        "A point-source exposure (individuals were exposed to the same source over a brief, shared time window).",
        "Continuous person-to-person propagated transmission over many months.",
        "That no exposure occurred.",
        "That incidence rate and prevalence are identical."
      ],
      correctIndex: 0,
      explanation: "A single sharp peak clustered within one pathogen incubation period is the classic signature of a common point-source exposure."
    },
    careerGuidance: {
      prerequisites: "Biostatistics, R or Python data analysis, spreadsheet modeling, and public health principles.",
      targetRoles: "Public Health Data Analyst, Epidemiological Surveillance Analyst, Health Informatics Specialist, Biostatistical Analyst.",
      qualificationsAndNextSteps: "MPH / MS in Epidemiology or Biostatistics, CPH (Certified in Public Health), CDC Field Epidemiology & R for Applied Epidemiology."
    },
    mentorReviewCriteria: [
      "2×2 contingency tables and RR/OR calculations are mathematically verified.",
      "Report distinguishes statistical association from confirmed microbiological causation.",
      "De-identification and HIPAA/privacy protections are strictly maintained."
    ],
    principalReferences: [
      {
        title: "CDC Principles of Epidemiology in Public Health Practice (3rd Edition)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/csels/dsepd/ss1978/index.html",
        summary: "Foundational textbook on epidemiological measures, public health surveillance, outbreak investigation steps, and epidemic curves."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 5: BUSINESS, GOVERNANCE AND PROFESSIONAL SERVICES (21-25)
  // --------------------------------------------------------------------------
  {
    careerNumber: 21,
    id: "spec-career-21-enterprise-risk-business-continuity",
    title: "Enterprise Risk and Business Continuity",
    domainNumber: 5,
    domainTitle: "5. Business, governance and professional services",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    tangibleEvidenceType: "Business Impact Analysis (BIA), Enterprise Risk Register, ISO 22301 Continuity Plan & Tabletop Exercise After-Action Report",
    coreCurriculumBullets: [
      "Enterprise risk identification, Business Impact Analysis (BIA), RTO/RPO/MTPD definition, continuity strategies, tabletop exercises, and crisis communications."
    ],
    capstoneProject: "Develop and exercise a continuity plan for a fictional organization.",
    workedFormulaTitle: "Annualized Loss Expectancy (ALE), Recovery Timing Hierarchy & Control ROI",
    workedFormulaEquations: [
      "Single Loss Expectancy:      SLE = Asset_Value × Exposure_Factor (EF)",
      "Annualized Loss Expectancy:  ALE = SLE × Annualized_Rate_of_Occurrence (ARO)",
      "Continuity Timing Invariant: RPO <= RTO < Maximum_Tolerable_Period_of_Disruption (MTPD)"
    ],
    workedFormulaExplanation:
      "Business continuity and risk practitioners quantify financial/operational outage impact over time via a Business Impact Analysis (BIA), ensuring that Recovery Time Objectives (RTO) plus work-backlog recovery never exceed the Maximum Tolerable Period of Disruption (MTPD).",
    workedProblemStatement:
      "A regional logistics hub generates $60,000/hour in gross margin and incurs a $150,000 contractual SLA penalty if order fulfillment is down for more than 12 hours (MTPD = 12 hours). An outage of the primary warehouse management system occurs 0.25 times per year (once every 4 years) and lasts 8 hours without a warm standby (SLE = $480,000). A warm failover cluster costs $45,000/year and cuts outage duration to 0.5 hours (SLE_new = $30,000). Compute baseline ALE, post-control ALE, and net annual risk value.",
    workedStepByStep: [
      "1. Baseline ALE = SLE_pre × ARO = $480,000 × 0.25 = $120,000/year.",
      "2. Post-control ALE = SLE_post × ARO = $30,000 × 0.25 = $7,500/year.",
      "3. Annualized risk reduction = $120,000 - $7,500 = $112,500/year.",
      "4. Net annual benefit after $45,000/year failover cost = $112,500 - $45,000 = +$67,500/year, while reducing RTO to 0.5 hr << 12 hr MTPD."
    ],
    workedConclusion:
      "The warm failover architecture satisfies the 12-hour MTPD constraint and delivers a net positive risk reduction of $67,500/year.",
    practicalLabScenario:
      "Conduct a Business Impact Analysis (BIA) across 6 core business functions of a fictional mid-sized organization, build a quantified Enterprise Risk Register, author an ISO 22301 Business Continuity Plan (BCP), and facilitate a 3-inject Tabletop Exercise with an After-Action Report.",
    practicalLabTasks: [
      "Determine MTPD, RTO, RPO, and minimum staffing/third-party dependencies for all 6 business functions.",
      "Quantify top 10 enterprise risks using likelihood, financial/operational impact, inherent risk, controls, and residual risk.",
      "Write the Business Continuity & Disaster Recovery activation playbook, role succession matrix, and crisis communication templates.",
      "Execute a simulated ransomware + facility power loss tabletop exercise and document corrective action items in an After-Action Report (AAR)."
    ],
    answerKeyQuestion: {
      prompt: "In Business Continuity Planning (ISO 22301), why must a process's Recovery Time Objective (RTO) always be strictly LESS than its Maximum Tolerable Period of Disruption (MTPD)?",
      options: [
        "MTPD is the point at which irreversible harm occurs; the system must be restored at RTO with enough buffer time before MTPD to validate data integrity, clear the backlog of interrupted transactions, and resume safe operations.",
        "Because RTO is measured in years while MTPD is measured in milliseconds.",
        "Because RPO is always larger than MTPD.",
        "MTPD only applies to marketing brochures."
      ],
      correctIndex: 0,
      explanation: "RTO must leave sufficient operational recovery buffer before the organization hits its Maximum Tolerable Period of Disruption (MTPD)."
    },
    careerGuidance: {
      prerequisites: "Operations management, risk assessment fundamentals, IT/infrastructure literacy, and stakeholder communication.",
      targetRoles: "Enterprise Risk Manager, Business Continuity Planner, Operational Resilience Analyst, GRC Consultant.",
      qualificationsAndNextSteps: "DRI International CBCP (Certified Business Continuity Professional), BCI MBCI, ISO 22301 Lead Implementer, ISACA CRISC."
    },
    mentorReviewCriteria: [
      "BIA maps upstream/downstream IT and third-party vendor dependencies for each process.",
      "RPO, RTO, and MTPD values are realistic and aligned with technical backup/failover capabilities.",
      "Tabletop After-Action Report identifies concrete gaps and assigned owners."
    ],
    principalReferences: [
      {
        title: "NIST SP 800-34 Rev. 1: Contingency Planning Guide for Federal Information Systems",
        organization: "NIST / ISO 22301",
        url: "https://csrc.nist.gov/pubs/sp/800/34/r1/final",
        summary: "Comprehensive methodology for Business Impact Analysis (BIA), recovery strategies, contingency plan development, and testing exercises."
      }
    ]
  },
  {
    careerNumber: 22,
    id: "spec-career-22-forensic-accounting-fraud-analytics",
    title: "Forensic Accounting and Fraud Analytics",
    domainNumber: 5,
    domainTitle: "5. Business, governance and professional services",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    tangibleEvidenceType: "General Ledger Anomaly Detection Script, Vendor Master Cross-Match Audit, Evidence Schedule & Forensic Investigation Report",
    coreCurriculumBullets: [
      "Financial statement & billing schemes, general ledger data analytics, Benford's Law & threshold-splitting detection, internal controls, evidence preservation, and factual investigation reporting."
    ],
    capstoneProject: "Investigate a simulated set of suspicious transactions and document evidence-based conclusions.",
    workedFormulaTitle: "Benford's Law First-Digit Distribution & Approval-Threshold Split Detection",
    workedFormulaEquations: [
      "Benford's Law First Digit d ∈ {1..9}:  P(d) = log_10(1 + 1/d)",
      "Split-Purchase Rule:  Σ Invoices(Vendor_v, Window_Δt) > Limit_Approval  AND  max(Invoice_i) < Limit_Approval"
    ],
    workedFormulaExplanation:
      "Forensic accountants combine data analytics (duplicate payment fuzzy matching, employee-to-vendor bank/address cross-matching, approval-threshold splitting, weekend manual journal entries, and Benford's Law digit distribution tests) with voucher/contract source inspection and strict factual objectivity.",
    workedProblemStatement:
      "Company policy requires CFO sign-off for any purchase over $10,000. An automated SQL audit of the Accounts Payable subledger flags Vendor 'Apex Consulting LLC': 4 invoices of $9,850, $9,900, $9,750, and $9,900 were submitted within 5 days by the same department manager, and the vendor's bank routing/account number matches the manager's payroll direct-deposit account. Quantify the exposure and classify the control breakdown.",
    workedStepByStep: [
      "1. Sum the 4 split invoices: $9,850 + $9,900 + $9,750 + $9,900 = $39,400 total disbursements.",
      "2. Identify the procurement anomaly: All 4 invoices fall within 2.5% below the $10,000 CFO approval threshold (structured split-purchasing to bypass secondary review).",
      "3. Corroborate Master File red flag: Exact match between Vendor bank account and Employee payroll direct-deposit account indicates a conflicted/shell vendor billing scheme.",
      "4. Preserve immutable read-only exports of AP logs, invoice PDFs, and vendor master audit trails, and document strictly factual findings without expressing a legal verdict of guilt."
    ],
    workedConclusion:
      "$39,400 in structured invoices below the $10,000 approval limit routed to an employee-matched bank account demonstrates segregation-of-duties and vendor-onboarding control failures.",
    practicalLabScenario:
      "Analyze a 15,000-row Accounts Payable and General Ledger dataset together with Vendor Master and Employee HR tables to detect shell vendors, duplicate payments, split purchases, and unapproved weekend journal entries, and author a Forensic Accounting Investigation Report.",
    practicalLabTasks: [
      "Run SQL/Python entity-resolution checks comparing Employee addresses, phone numbers, and bank accounts against the Vendor Master file.",
      "Detect duplicate payments (same amount/date/invoice pattern) and structured split-invoices just below approval thresholds.",
      "Analyze manual journal entries posted on weekends/holidays without supporting source documentation.",
      "Compile an indexed Schedule of Exhibits and write an objective Forensic Investigation Report with COSO internal-control remediation recommendations."
    ],
    answerKeyQuestion: {
      prompt: "When writing a professional Forensic Accounting Investigation Report, how should the investigator state conclusions regarding suspected fraudulent transactions?",
      options: [
        "Present objective, verifiable facts, transaction schedules, and control discrepancies supported by exhibits, without stating a legal conclusion that an individual is 'guilty of criminal fraud' (which is reserved for a court of law).",
        "Declare the suspect criminally guilty in the report title before interviewing anyone or checking source invoices.",
        "Alter the original General Ledger database tables to delete the suspicious rows.",
        "Rely solely on Benford's Law without inspecting a single invoice, contract, or bank record."
      ],
      correctIndex: 0,
      explanation: "Forensic accounting standards (AICPA FVS / ACFE) require strict objectivity: document factual evidence and control findings while leaving legal determinations of guilt to courts."
    },
    careerGuidance: {
      prerequisites: "Financial accounting (debits/credits, GL/AP/AR subledgers), auditing fundamentals, SQL/Excel/Python analytics, and internal controls.",
      targetRoles: "Forensic Accountant, Fraud Data Analyst, Internal Audit Investigator, Financial Crime Compliance Specialist.",
      qualificationsAndNextSteps: "ACFE Certified Fraud Examiner (CFE), CPA (Certified Public Accountant), AICPA Certified in Financial Forensics (CFF)."
    },
    mentorReviewCriteria: [
      "Every analytical flag (e.g., Benford anomaly or split invoice) is corroborated against underlying source vouchers/records.",
      "Report language is strictly factual, objective, and exhibit-referenced.",
      "Internal control recommendations enforce Segregation of Duties (vendor creation vs. invoice approval vs. payment release)."
    ],
    principalReferences: [
      {
        title: "COSO Internal Control — Integrated Framework & ACFE Fraud Examiners Manual Principles",
        organization: "COSO / AICPA / ACFE",
        url: "https://www.coso.org/internal-control",
        summary: "Industry standard framework for designing internal controls, segregation of duties, and anti-fraud governance."
      }
    ]
  },
  {
    careerNumber: 23,
    id: "spec-career-23-procurement-contracts-vendor-risk",
    title: "Procurement, Contracts and Vendor Risk",
    domainNumber: 5,
    domainTitle: "5. Business, governance and professional services",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/business-capstone-cover.jpg",
    tangibleEvidenceType: "RFP Scoring Matrix, 5-Year Total Cost of Ownership (TCO) Model, Third-Party Risk Assessment & Defensible Award Recommendation",
    coreCurriculumBullets: [
      "Strategic sourcing & RFP design, Total Cost of Ownership (TCO) modeling, contract terms & SLA/KPI structuring, vendor financial/cyber/operational risk assessment, and defensible award governance."
    ],
    capstoneProject: "Evaluate competing supplier bids and prepare a defensible award recommendation.",
    workedFormulaTitle: "5-Year Total Cost of Ownership (TCO) & Weighted Multi-Criteria Supplier Score",
    workedFormulaEquations: [
      "Total Cost of Ownership:  TCO = C_acquisition + C_implementation + Σ_t [ (C_ops,t + C_maint,t + E[C_risk,t]) / (1 + r)^t ]",
      "Weighted Supplier Score:  Score_j = Σ_i (w_i × s_{i,j})   where Σ w_i = 1.0"
    ],
    workedFormulaExplanation:
      "Strategic procurement evaluates suppliers on Total Cost of Ownership (upfront price + onboarding + multi-year licensing/maintenance + transition + risk-adjusted downtime cost) and pre-published weighted evaluation criteria (Technical, Security/Risk, Delivery SLA, and Commercial TCO) to prevent lowest-bid traps and ensure audit defensibility.",
    workedProblemStatement:
      "Supplier A bids $180,000 upfront with $55,000/yr annual support over 3 years (undiscounted) and scores 88/100 on Technical/Security (weight 60%) and 75/100 on Commercial (weight 40%). Supplier B bids $150,000 upfront with $75,000/yr annual support over 3 years and scores 70/100 on Technical/Security and 72/100 on Commercial. Compute 3-year TCO and weighted scores for both suppliers.",
    workedStepByStep: [
      "1. Compute 3-year TCO for Supplier A: $180,000 + (3 × $55,000) = $180,000 + $165,000 = $345,000.",
      "2. Compute 3-year TCO for Supplier B: $150,000 + (3 × $75,000) = $150,000 + $225,000 = $375,000 (despite lower initial price, Supplier B is $30,000 more expensive over 3 years).",
      "3. Compute Weighted Score for Supplier A: (0.60 × 88) + (0.40 × 75) = 52.8 + 30.0 = 82.8 / 100.",
      "4. Compute Weighted Score for Supplier B: (0.60 × 70) + (0.40 × 72) = 42.0 + 28.8 = 70.8 / 100."
    ],
    workedConclusion:
      "Supplier A delivers both a lower 3-year TCO ($345,000 vs. $375,000) and a higher weighted technical/commercial score (82.8 vs. 70.8).",
    practicalLabScenario:
      "Evaluate 3 competing vendor proposals for a mission-critical enterprise software/equipment contract, build a 5-year discounted TCO model, assess vendor financial stability and SOC 2 / ISO 27001 supply-chain risk, redline SLA/indemnity/termination clauses, and write an Audit-Defensible Award Recommendation Memo.",
    practicalLabTasks: [
      "Build the 5-year TCO spreadsheet comparing acquisition, implementation, recurring support, change-order risk, and exit/transition costs.",
      "Score all 3 bids against a locked, conflict-of-interest-cleared Weighted Evaluation Matrix.",
      "Complete the Third-Party Risk Management (TPRM) review covering financial health, single-source dependency, and data protection.",
      "Author the Defensible Award Recommendation Memo and SLA service-credit schedule."
    ],
    answerKeyQuestion: {
      prompt: "Why must the evaluation criteria and percentage weights in a formal RFP be locked and documented BEFORE supplier bids are opened?",
      options: [
        "Locking criteria and weights prior to bid opening prevents post-hoc manipulation of weights to favor a specific vendor, ensuring fairness, transparency, and audit/bid-protest defensibility.",
        "Because suppliers are not allowed to know what products the buyer wants.",
        "So that the buyer is legally forced to pick the vendor with the highest 5-year TCO.",
        "Because conflict-of-interest declarations are only signed after the contract expires."
      ],
      correctIndex: 0,
      explanation: "Pre-established evaluation criteria and conflict-of-interest disclosures are foundational to ethical, protest-defensible procurement governance."
    },
    careerGuidance: {
      prerequisites: "Financial analysis, commercial contract literacy, supply chain fundamentals, and negotiation.",
      targetRoles: "Strategic Sourcing Manager, Procurement & Contracts Specialist, Third-Party Risk (TPRM) Analyst, Vendor Governance Manager.",
      qualificationsAndNextSteps: "ISM CPSM (Certified Professional in Supply Management), CIPS Diploma, WorldCC Contract & Commercial Management (CCMP), NIGP-CPP."
    },
    mentorReviewCriteria: [
      "TCO calculation captures hidden lifecycle costs (integration, training, support escalations, and exit migration).",
      "Contract SLA definitions specify measurable uptime/delivery metrics, measurement intervals, and remedies.",
      "Award memo documents conflict-of-interest clearance and risk mitigations."
    ],
    principalReferences: [
      {
        title: "NIST SP 800-161 Rev. 1: Cybersecurity Supply Chain Risk Management Practices",
        organization: "NIST",
        url: "https://csrc.nist.gov/pubs/sp/800/161/r1/final",
        summary: "Guidance on identifying, assessing, and mitigating supplier and acquisition risks across the procurement lifecycle."
      }
    ]
  },
  {
    careerNumber: 24,
    id: "spec-career-24-technical-writing-knowledge-engineering",
    title: "Technical Writing and Knowledge Engineering",
    domainNumber: 5,
    domainTitle: "5. Business, governance and professional services",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/ai-studies-cover.jpg",
    tangibleEvidenceType: "Docs-as-Code Operating Manual, Information Architecture Taxonomy, ANSI Z535 Hazard Callouts & Usability Verification Log",
    coreCurriculumBullets: [
      "Audience & task analysis, structured authoring (Docs-as-Code / DITA), API & system documentation, safety hazard callouts (DANGER/WARNING/CAUTION), taxonomy design, and procedural usability testing."
    ],
    capstoneProject: "Turn a complex technical process into a verified, usable operating manual.",
    workedFormulaTitle: "Procedural Task Completion Rate, Time-on-Task & Document Maintainability",
    workedFormulaEquations: [
      "First-Attempt Task Success Rate:  TSR = (Users_Completing_Procedure_Without_Error / Total_Test_Users) × 100%",
      "Hazard Signal Hierarchy (ANSI Z535 / ISO 3864):  DANGER (Imminent death/severe injury) > WARNING (Potential death/severe injury) > CAUTION (Minor/moderate injury) > NOTICE (Property/data only)"
    ],
    workedFormulaExplanation:
      "Technical writers and knowledge engineers structure documentation into modular topic types (Concept, Task/Procedure, Reference, Troubleshooting), place safety warnings BEFORE the action step where the hazard occurs, and verify usability through hands-on procedural walk-throughs.",
    workedProblemStatement:
      "An unedited engineering draft reads: 'Flip the main bypass switch to ON to drain the manifold. Warning: Ensure pressure is vented below 5 psi first or scalding steam will spray out.' Identify the two critical technical-writing defects in this instruction and rewrite it correctly.",
    workedStepByStep: [
      "1. Defect 1 (Late Hazard Placement): The steam hazard warning appears AFTER the command to flip the switch; an operator reading sequentially may flip the switch before reading the warning.",
      "2. Defect 2 (Passive/Ambiguous Precondition): 'Ensure pressure is vented' lacks a verifiable gauge identifier and numbered sequence.",
      "3. Corrected Rewrite: Place a bold `WARNING: Scalding Steam Hazard` callout box BEFORE Step 1, followed by Step 1: 'Close inlet valve V-101, open vent valve V-102, and verify manifold gauge PI-104 reads < 5 psi (34 kPa) before touching bypass switch SW-1.' Step 2: 'Set main bypass switch SW-1 to ON.'"
    ],
    workedConclusion:
      "Placing ANSI Z535 hazard callouts prior to action steps and specifying verifiable instrument tags prevents operational injury and procedural errors.",
    practicalLabScenario:
      "Transform a raw, disorganized set of engineering notes, CLI logs, and schematic diagrams for a backup generator / server cutover system into a version-controlled, structured Operating & Troubleshooting Manual, and validate it via a 5-reader usability test.",
    practicalLabTasks: [
      "Conduct an Audience & Task Analysis separating Concept, Preconditions, Step-by-Step Procedure, Reference, and Troubleshooting sections.",
      "Rewrite all procedural steps in active voice (1 action per numbered step, paired with expected system feedback).",
      "Format all safety and data-loss alerts using ANSI Z535 signal words (`DANGER`, `WARNING`, `CAUTION`, `NOTICE`) positioned before the relevant step.",
      "Conduct a procedural walk-through verification test and log all ambiguities corrected."
    ],
    answerKeyQuestion: {
      prompt: "In safety-critical technical documentation, where must a `WARNING` or `CAUTION` notice be placed relative to the procedural step that introduces the hazard?",
      options: [
        "Immediately BEFORE the numbered action step so the operator reads and mitigates the hazard prior to performing the action.",
        "In an appendix at the very back of the manual.",
        "In a footnote after the step has already been executed.",
        "Hidden inside a marketing overview paragraph."
      ],
      correctIndex: 0,
      explanation: "Operators execute numbered steps sequentially; placing a hazard notice after the action step can cause injury or equipment damage before the warning is seen."
    },
    careerGuidance: {
      prerequisites: "Strong command of clear, concise language, Markdown/Git (Docs-as-Code), systems literacy, and information architecture.",
      targetRoles: "Technical Writer, Knowledge Engineer, Developer Documentation Specialist, SOP & Compliance Documentation Architect.",
      qualificationsAndNextSteps: "STC (Society for Technical Communication) CPTC, Docs-as-Code (Git, Markdown, OpenAPI/Swagger, Vale linter), DITA XML."
    },
    mentorReviewCriteria: [
      "Numbered steps contain a single clear actor, imperative verb, target control/command, and expected system response.",
      "Safety and data-loss callouts strictly precede hazardous steps.",
      "Manual includes a symptom → probable cause → verification → corrective action troubleshooting table."
    ],
    principalReferences: [
      {
        title: "Federal Plain Language Guidelines & Google Developer Documentation Style Guide",
        organization: "PlainLanguage.gov / Industry Technical Writing Standards",
        url: "https://www.plainlanguage.gov/guidelines/",
        summary: "Authoritative standards for task-oriented technical documentation, active-voice procedural writing, and information design."
      }
    ]
  },
  {
    careerNumber: 25,
    id: "spec-career-25-supply-chain-analytics-optimization",
    title: "Supply Chain Analytics and Optimization",
    domainNumber: 5,
    domainTitle: "5. Business, governance and professional services",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/business-capstone-cover.jpg",
    tangibleEvidenceType: "Inventory Optimization Model (EOQ/ROP/Safety Stock), Network Linear Programming Solver & Multi-Scenario Resilience Report",
    coreCurriculumBullets: [
      "Demand forecasting, Economic Order Quantity (EOQ), probabilistic safety stock & reorder points, linear programming network optimization, lead-time variability, and supply-chain resilience."
    ],
    capstoneProject: "Optimize a simulated supply chain while balancing cost, delivery time, and resilience.",
    workedFormulaTitle: "Economic Order Quantity (EOQ), Probabilistic Safety Stock & Reorder Point (ROP)",
    workedFormulaEquations: [
      "Economic Order Quantity:  EOQ = √[ (2 × D × S) / H ]",
      "Safety Stock (Variable Demand & Constant Lead Time):  SS = Z_α × σ_d × √L",
      "Reorder Point (ROP):      ROP = (d_avg × L) + SS"
    ],
    workedFormulaExplanation:
      "Supply chain analysts balance ordering cost (`S`) against holding cost (`H`) via EOQ, buffer against stockouts during replenishment lead time (`L`) using probabilistic safety stock (`Z_α` service factor), and use Linear Programming to route shipments across plants and distribution centers.",
    workedProblemStatement:
      "A critical industrial component has average daily demand d_avg = 40 units/day (annual demand D = 14,400 units/yr), daily demand standard deviation σ_d = 8 units/day, replenishment lead time L = 9 days, ordering cost S = $200/order, annual holding cost H = $16/unit/year, and target cycle service level of 95% (Z = 1.645). Calculate EOQ, Safety Stock (SS), and Reorder Point (ROP).",
    workedStepByStep: [
      "1. Compute EOQ: √[ (2 × 14,400 × 200) / 16 ] = √[ 5,760,000 / 16 ] = √360,000 = 600 units per order.",
      "2. Compute Safety Stock for 95% service level: SS = 1.645 × 8 × √9 = 1.645 × 8 × 3 = 39.48 ⇒ 40 units.",
      "3. Compute expected demand during lead time: d_avg × L = 40 units/day × 9 days = 360 units.",
      "4. Compute Reorder Point: ROP = 360 + 40 = 400 units (place an order for 600 units whenever inventory position drops to 400 units)."
    ],
    workedConclusion:
      "Ordering 600 units whenever inventory reaches 400 units (including 40 units of safety stock) minimizes total inventory cost while maintaining a 95% cycle service level.",
    practicalLabScenario:
      "Optimize a 3-factory, 2-distribution-center, 8-customer-region supply chain network facing port congestion and lead-time volatility, compute SKU-level EOQ/SS/ROP policies, and compare cost vs. service-level resilience under a single-supplier disruption.",
    practicalLabTasks: [
      "Segment 200 SKUs using ABC-XYZ matrix classification (value volume vs. demand volatility).",
      "Calculate EOQ, Safety Stock (accounting for both demand and lead-time variance), and Reorder Points for Class A/B items.",
      "Formulate and solve a Transportation Linear Program (minimizing freight + holding cost subject to factory capacity and customer SLA constraints).",
      "Simulate a 14-day primary port/supplier disruption and quantify the cost-resilience trade-off of dual-sourcing."
    ],
    answerKeyQuestion: {
      prompt: "What happens to required Safety Stock if a supplier's average replenishment lead time AND lead-time variability increase while the buyer leaves the Reorder Point (ROP) unchanged?",
      options: [
        "Actual cycle service level drops and stockout frequency increases because demand during lead time has both a higher mean and a wider probability distribution tail.",
        "Safety stock automatically becomes zero when lead time increases.",
        "Holding costs drop to zero without affecting customer delivery SLAs.",
        "EOQ is the only variable affected by lead-time variance."
      ],
      correctIndex: 0,
      explanation: "When both demand and lead time vary, variance of lead-time demand equals `L(σ_d)² + (d_avg)²(σ_L)²`, requiring higher safety stock or lead-time reduction to maintain service levels."
    },
    careerGuidance: {
      prerequisites: "Probability & statistics, spreadsheet optimization (Solver) or Python (`scipy.optimize` / `PuLP`), and operations management.",
      targetRoles: "Supply Chain Analyst, Inventory Optimization Specialist, Logistics Network Planner, S&OP Demand Planner.",
      qualificationsAndNextSteps: "ASCM CSCP (Certified Supply Chain Professional), CPIM (Certified in Planning and Inventory Management), MITx MicroMasters in Supply Chain Management."
    },
    mentorReviewCriteria: [
      "Safety stock formula includes lead-time variability (`σ_L`) where supplier delivery times fluctuate.",
      "Linear programming network model clearly states objective function, decision variables, and capacity constraints.",
      "Sensitivity analysis tests single-point-of-failure supplier disruptions."
    ],
    principalReferences: [
      {
        title: "NIST Manufacturing Extension Partnership (MEP) Supply Chain Optimization Resources",
        organization: "NIST MEP / ASCM",
        url: "https://www.nist.gov/mep/supply-chain",
        summary: "Practical frameworks for supply chain mapping, inventory optimization, total cost modeling, and resilience stress-testing."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 6: ENVIRONMENTAL, AGRICULTURAL AND RESOURCE CAREERS (26-29)
  // --------------------------------------------------------------------------
  {
    careerNumber: 26,
    id: "spec-career-26-environmental-monitoring-compliance",
    title: "Environmental Monitoring and Compliance",
    domainNumber: 6,
    domainTitle: "6. Environmental, agricultural and resource careers",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    tangibleEvidenceType: "Field Sampling QA/QC Plan, Chain-of-Custody Log, Contaminant Mass-Loading Worksheet & Regulatory Compliance Report",
    coreCurriculumBullets: [
      "Air, water, and soil sampling protocols, QA/QC field blanks & duplicates, chain of custody, contaminant mass-loading calculations, permit limit verification, and corrective action reporting."
    ],
    capstoneProject: "Analyze an industrial stormwater and groundwater monitoring dataset, validate QA/QC blanks and duplicates, compute pollutant mass loadings against permit limits, and prepare an Environmental Compliance & Corrective Action Report.",
    workedFormulaTitle: "Pollutant Mass Loading Rate & Relative Percent Difference (RPD) of Field Duplicates",
    workedFormulaEquations: [
      "Daily Pollutant Mass Load:  M (kg/day) = Concentration (mg/L) × Flow (m³/day) × 10^-3",
      "Duplicate Precision (RPD):  RPD = ( |C_1 - C_2| / ((C_1 + C_2) / 2) ) × 100%"
    ],
    workedFormulaExplanation:
      "Environmental compliance specialists verify that both concentration limits (mg/L) and daily mass-loading limits (kg/day) are met, while validating sample integrity using trip blanks, equipment rinsate blanks, and field duplicate Relative Percent Difference (RPD).",
    workedProblemStatement:
      "An industrial facility discharges Q = 1,500 m³/day of treated effluent with a measured Total Suspended Solids (TSS) concentration of C_1 = 28.0 mg/L (field duplicate C_2 = 30.0 mg/L). The discharge permit allows a daily maximum concentration of 35.0 mg/L AND a maximum daily mass load of 40.0 kg/day. Calculate the duplicate RPD and the daily TSS mass load, and determine compliance status.",
    workedStepByStep: [
      "1. Compute field duplicate RPD: (|28.0 - 30.0| / 29.0) × 100% = (2.0 / 29.0) × 100% = 6.90% (passes typical <= 20% aqueous duplicate precision criterion).",
      "2. Compute daily TSS mass load using primary sample (28.0 mg/L): M = 28.0 mg/L × 1,500 m³/day × 0.001 = 42.0 kg/day.",
      "3. Compare against permit limits: Concentration (28.0 mg/L <= 35.0 mg/L) passes, BUT Daily Mass Load (42.0 kg/day > 40.0 kg/day limit) EXCEEDS the permit mass limit by 2.0 kg/day.",
      "4. Trigger formal permit exceedance notification and flow/filtration corrective action."
    ],
    workedConclusion:
      "Even though effluent concentration (28.0 mg/L) is below the 35.0 mg/L cap, high flow pushes daily mass loading to 42.0 kg/day, exceeding the 40.0 kg/day permit limit.",
    practicalLabScenario:
      "Evaluate a quarterly environmental monitoring dataset (outfall flow meters, lab analytical certificates, trip/rinsate blanks, and field duplicates), flag QA/QC anomalies and permit exceedances, and author a Regulatory Compliance & Corrective Action Report.",
    practicalLabTasks: [
      "Audit Chain-of-Custody forms, holding times, sample preservation temperatures (<= 6°C), and blank contamination.",
      "Calculate daily and monthly average pollutant concentrations and mass loadings across all permitted outfalls.",
      "Identify a cross-contamination false positive caused by an uncleaned sampling pump (flagged by the equipment rinsate blank).",
      "Write the Regulatory Exceedance Notification and Corrective Action Plan."
    ],
    answerKeyQuestion: {
      prompt: "In environmental water sampling, if the target volatile organic compound (VOC) is detected at 15 µg/L in the environmental well sample AND at 14 µg/L in the Deionized Water Equipment Rinsate Blank, what does this indicate?",
      options: [
        "Cross-contamination during field sampling or decontamination (the sampling equipment was not properly decontaminated between wells), invalidating the positive result as a clean groundwater measurement.",
        "That the municipal deionized water factory is located inside the monitoring well.",
        "That field blanks should never be collected during environmental monitoring.",
        "That the well concentration is actually 29 µg/L."
      ],
      correctIndex: 0,
      explanation: "Equipment rinsate blanks specifically test whether reusable field sampling gear introduced cross-contamination."
    },
    careerGuidance: {
      prerequisites: "Environmental science, general chemistry, field instrumentation, GIS basics, and regulatory literacy.",
      targetRoles: "Environmental Compliance Specialist, Field Environmental Scientist, EHS (Environment, Health & Safety) Analyst, Stormwater/Wastewater Compliance Coordinator.",
      qualificationsAndNextSteps: "OSHA 40-Hour HAZWOPER (for contaminated sites), Qualified Industrial Stormwater Practitioner (QISP), Certified Environmental Scientist (CES)."
    },
    mentorReviewCriteria: [
      "Unit conversions between µg/L, mg/L, m³/day, and kg/day are verified without order-of-magnitude errors.",
      "QA/QC review checks holding times, thermal preservation, field blanks, and duplicate RPD.",
      "Exceedance reporting follows strict statutory timelines and factual accuracy."
    ],
    principalReferences: [
      {
        title: "US EPA NPDES Permit Writers' Manual & Field Branches Quality System and Technical Procedures",
        organization: "U.S. Environmental Protection Agency (EPA)",
        url: "https://www.epa.gov/npdes/npdes-permit-writers-manual",
        summary: "Authoritative standards for effluent monitoring, mass-loading calculations, QA/QC sampling procedures, and compliance reporting."
      }
    ]
  },
  {
    careerNumber: 27,
    id: "spec-career-27-precision-agriculture-agtech",
    title: "Precision Agriculture and Agricultural Technology",
    domainNumber: 6,
    domainTitle: "6. Environmental, agricultural and resource careers",
    academyId: "academy-3-ai-software-engineering",
    coverImage: "/images/connectln-studies/mlops-data-cover.jpg",
    tangibleEvidenceType: "Soil Moisture & Evapotranspiration Water Balance, Multi-Zone Prescription Map & Variable-Rate Application (VRA) Plan",
    coreCurriculumBullets: [
      "Soil moisture & EC sensors, crop evapotranspiration (ET_c) water balance, drone/satellite multispectral scouting, management zone delineation, Variable-Rate Application (VRA) prescriptions, and yield-map ROI analysis."
    ],
    capstoneProject: "Generate a 3-zone Variable-Rate Application (VRA) nutrient and irrigation prescription plan from soil sensor, yield monitor, and multispectral imagery datasets.",
    workedFormulaTitle: "Crop Evapotranspiration (ET_c), Net Irrigation Requirement & VRA Fertilizer Rate",
    workedFormulaEquations: [
      "Crop Evapotranspiration:   ET_c = ET_0 × K_c   (mm/day)",
      "Gross Irrigation Depth:    D_gross = (ET_c - P_eff) / η_irrigation",
      "Nutrient Application Rate: Rate_product = Target_Nutrient_N / (%Nutrient_Fraction_in_Product)"
    ],
    workedFormulaExplanation:
      "Precision agriculture specialists combine Reference Evapotranspiration (`ET_0`), growth-stage crop coefficients (`K_c`), soil Electrical Conductivity (EC) / moisture sensors, and historical yield maps to apply water and fertilizer selectively by management zone.",
    workedProblemStatement:
      "A 40-hectare irrigated field has a 7-day cumulative reference evapotranspiration ET_0 = 35.0 mm, mid-season crop coefficient K_c = 1.15, effective rainfall P_eff = 6.25 mm, and center-pivot application efficiency η = 85%. In Addition, Management Zone A (15 ha) requires 46 kg/ha of actual Nitrogen using Urea (46% N by weight). Calculate the required gross irrigation depth (mm) and total metric tons of Urea for Zone A.",
    workedStepByStep: [
      "1. Compute 7-day crop evapotranspiration: ET_c = 35.0 mm × 1.15 = 40.25 mm.",
      "2. Subtract effective rainfall to get net irrigation requirement: D_net = 40.25 - 6.25 = 34.00 mm.",
      "3. Divide by 85% pivot efficiency: D_gross = 34.00 / 0.85 = 40.00 mm of gross irrigation.",
      "4. Compute Urea product rate for Zone A: 46 kg N/ha / 0.46 = 100 kg Urea/ha × 15 ha = 1,500 kg = 1.50 metric tons."
    ],
    workedConclusion:
      "The 7-day irrigation schedule requires 40.0 mm gross water application, and Management Zone A requires 1.50 metric tons of Urea.",
    practicalLabScenario:
      "Analyze a 120-hectare farm dataset (soil grid tests, EC mapping, mid-season NDVI drone orthomosaic, and 3 years of combine yield monitor data), delineate 3 management zones, and produce an ISOXML/Shapefile Variable-Rate Application (VRA) prescription and economic ROI summary.",
    practicalLabTasks: [
      "Clean raw combine yield-monitor data (removing header turnarounds, grain-flow lag, and moisture outliers).",
      "Delineate 3 agronomic management zones using soil EC, topography, and multi-year normalized yield stability.",
      "Calculate zone-specific N-P-K and irrigation prescriptions based on soil test sufficiency and yield potential.",
      "Quantify input cost savings and environmental nutrient-runoff reduction compared to flat-rate application."
    ],
    answerKeyQuestion: {
      prompt: "Why should a low-NDVI / low-yield zone on a single drone flight NEVER automatically receive the highest nitrogen fertilizer rate without first checking soil and field diagnostics?",
      options: [
        "Low vigor in a zone may be caused by poor drainage, soil compaction, salinity, pest pressure, or low water-holding capacity rather than nitrogen deficiency; applying extra nitrogen to a waterlogged or compacted zone wastes money and increases nitrate leaching.",
        "Because plants with high NDVI have no chlorophyll.",
        "Because variable-rate spreaders can only apply fertilizer at night.",
        "Soil pH has no effect on nutrient uptake."
      ],
      correctIndex: 0,
      explanation: "Remote sensing identifies spatial variability, but ground-truthing and soil/hydrology data are required to diagnose the limiting factor."
    },
    careerGuidance: {
      prerequisites: "Agronomy/soil science basics, GIS spatial analysis, IoT telemetry, and agricultural equipment data formats.",
      targetRoles: "Precision Agriculture Specialist, Digital Agronomy Analyst, AgTech Field Systems Engineer, Irrigation & Nutrient Management Advisor.",
      qualificationsAndNextSteps: "ASA Certified Crop Adviser (CCA) + Precision Agriculture Specialty (PASp), FAA Part 107 Remote Pilot Certificate (for drone scouting)."
    },
    mentorReviewCriteria: [
      "Yield map cleaning removes combine fill/empty lag and GPS overlap artifacts.",
      "VRA prescriptions account for yield-limiting soil/drainage constraints rather than blind NDVI inversion.",
      "Water and nutrient mass balances use verified agronomic units."
    ],
    principalReferences: [
      {
        title: "USDA NRCS National Engineering Handbook: Irrigation & Nutrient Management (590 Standard)",
        organization: "USDA Natural Resources Conservation Service (NRCS) / FAO-56",
        url: "https://www.nrcs.usda.gov/getting-assistance/technical-assistance/conservation-planning",
        summary: "Authoritative technical guidelines for crop water requirements, soil moisture monitoring, and 4R nutrient stewardship (Right Source, Right Rate, Right Time, Right Place)."
      }
    ]
  },
  {
    careerNumber: 28,
    id: "spec-career-28-circular-economy-resource-recovery",
    title: "Circular Economy and Resource Recovery",
    domainNumber: 6,
    domainTitle: "6. Environmental, agricultural and resource careers",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    tangibleEvidenceType: "Material Flow Analysis (MFA) Sankey Model, MRF Mass-Balance Sheet, ISO 14040 Lifecycle Carbon Comparison & Circularity Business Case",
    coreCurriculumBullets: [
      "Material Flow Analysis (MFA), waste stream composition audits, Material Recovery Facility (MRF) sorting efficiency & purity, ISO 14040/14044 Life Cycle Assessment (LCA), industrial symbiosis, and circularity economics."
    ],
    capstoneProject: "Model the material flows of an industrial or municipal waste stream, design a resource recovery intervention, and quantify recovered material revenue and cradle-to-gate carbon reduction.",
    workedFormulaTitle: "Material Recovery Rate, Bale Purity & Net Circular Economic Value",
    workedFormulaEquations: [
      "Conservation of Mass:     M_input = Σ M_recovered_streams + M_residual_rejects + M_moisture_loss",
      "Target Capture Efficiency: η_capture = (M_target_in_bale / M_target_in_infeed) × 100%",
      "Product Bale Purity:       Purity = (M_target_in_bale / M_total_bale_mass) × 100%"
    ],
    workedFormulaExplanation:
      "Resource recovery engineers track both Capture Rate (how much of the recyclable material entering the facility is recovered) and Bale Purity (how clean the output bale is, since smelters and plastics reprocessors reject or heavily penalize bales exceeding contamination thresholds).",
    workedProblemStatement:
      "A Material Recovery Facility (MRF) processes 100.0 metric tons/day of mixed commingled stream containing 12.0% PET plastic (12.0 tons PET). The optical sorter outputs 10.5 tons/day of PET bales, which contain 9.9 tons of true PET and 0.6 tons of non-PET contaminants. Calculate PET Capture Efficiency, Bale Purity, and whether the bale meets a reprocessor's >= 94.0% purity specification.",
    workedStepByStep: [
      "1. Compute PET Capture Efficiency: η_capture = (9.9 tons recovered PET / 12.0 tons input PET) × 100% = 82.50%.",
      "2. Compute Output Bale Purity: Purity = (9.9 tons PET / 10.5 tons total bale mass) × 100% = 94.29%.",
      "3. Compare against reprocessor spec: 94.29% >= 94.0% specification (PASSES Grade-A commodity spec).",
      "4. Account for the remaining 2.1 tons of uncaptured PET in the residual stream for secondary sorting optimization."
    ],
    workedConclusion:
      "The optical sorting line achieves an 82.5% PET capture rate at 94.29% bale purity, meeting Grade-A reprocessor specifications.",
    practicalLabScenario:
      "Complete a Material Flow Analysis (MFA) and waste characterization audit for a manufacturing campus or municipal MRF, model an optical/eddy-current/composting recovery upgrade, calculate ISO 14040 avoided GHG emissions, and build a 5-year circularity business case.",
    practicalLabTasks: [
      "Close the 100% mass balance across all input streams, recovered commodity bales, organic diversion, and landfill/WTE residuals.",
      "Calculate capture rates, bale purity grades, and contamination penalties for metals, polymers, and fiber streams.",
      "Quantify avoided virgin material GHG emissions (kg CO2e/ton) using EPA WARM / ISO 14040 system boundaries.",
      "Develop a 5-year capital + operating cash-flow model factoring commodity price volatility and tipping-fee savings."
    ],
    answerKeyQuestion: {
      prompt: "In Material Recovery Facility (MRF) engineering, why is measuring ONLY total 'diversion weight leaving the tipping floor' misleading without measuring Bale Purity and Reprocessor Yield?",
      options: [
        "If sorted bales are heavily contaminated with non-target materials or moisture, downstream reprocessors will reject the load to landfill or downgrade its value; true circular recovery requires both high capture efficiency and verified commodity purity.",
        "Because contaminants always sell for a higher price than pure aluminum or PET.",
        "Because conservation of mass does not apply to recycling plants.",
        "Optical sorters cannot distinguish cardboard from steel."
      ],
      correctIndex: 0,
      explanation: "Gross diversion weight without purity accounting masks contamination that gets landfilled during reprocessing."
    },
    careerGuidance: {
      prerequisites: "Process mass balances, environmental engineering/sustainability fundamentals, lifecycle assessment (LCA), and financial modeling.",
      targetRoles: "Circular Economy Analyst, Resource Recovery Process Engineer, Sustainability & LCA Specialist, Zero-Waste Operations Manager.",
      qualificationsAndNextSteps: "SWANA Certified Recycling Systems Manager, TRUE Zero Waste Advisor, ISO 14040/14044 LCA practitioner (OpenLCA / SimaPro)."
    },
    mentorReviewCriteria: [
      "Material Flow Analysis (MFA) strictly obeys conservation of mass including moisture loss and process rejects.",
      "LCA comparison defines functional unit, system boundaries, and allocation assumptions transparently.",
      "Financial model tests sensitivity to recycled commodity market price swings."
    ],
    principalReferences: [
      {
        title: "US EPA Waste Reduction Model (WARM) & Sustainable Materials Management",
        organization: "U.S. Environmental Protection Agency (EPA) / ISO 14040",
        url: "https://www.epa.gov/warm",
        summary: "Lifecycle greenhouse gas, energy, and material flow modeling methodology for recycling, composting, and circular resource recovery."
      }
    ]
  },
  {
    careerNumber: 29,
    id: "spec-career-29-wind-energy-technology",
    title: "Wind Energy Technology",
    domainNumber: 6,
    domainTitle: "6. Environmental, agricultural and resource careers",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    tangibleEvidenceType: "Wind Power Curve & Capacity Factor Worksheet, SCADA Pitch/Yaw Fault Diagnosis & LOTO / Climb Safety Plan",
    coreCurriculumBullets: [
      "Wind resource & Betz power law, turbine aerodynamics & pitch/yaw control, drivetrain/gearbox/generator systems, power electronics & collector substation basics, SCADA fault diagnostics, and LOTO / working-at-heights safety."
    ],
    capstoneProject: "Analyze a 12-month wind turbine SCADA and meteorological dataset to compute Annual Energy Production (AEP) and Capacity Factor, diagnose underperforming turbines (yaw misalignment and pitch actuator faults), and prepare a Maintenance & Safety Work Package.",
    workedFormulaTitle: "Available Wind Power, Power Coefficient (C_p), Hub-Height Wind Shear & Capacity Factor",
    workedFormulaEquations: [
      "Extractable Wind Power:  P = 0.5 × ρ × A × v³ × C_p × η_drive   (Betz limit: C_p,max = 16/27 ≈ 0.5926)",
      "Power-Law Wind Shear:    v_2 = v_1 × (z_2 / z_1)^α",
      "Capacity Factor (CF):    CF = Actual_Annual_Energy_MWh / (P_rated_MW × 8760 hr)"
    ],
    workedFormulaExplanation:
      "Because wind power scales with the CUBE of wind speed (`v³`) and swept rotor area (`A = π R²`), small changes in hub-height wind speed or yaw alignment significantly impact power output (`cos³(θ_yaw)`), while above rated wind speed (~12 m/s) active blade pitch feathers the blades to cap mechanical and electrical load at rated power.",
    workedProblemStatement:
      "A utility-scale wind turbine has a rotor diameter D = 120 m (radius R = 60 m), air density ρ = 1.225 kg/m³, wind speed v = 10.0 m/s, aerodynamic power coefficient C_p = 0.45, and combined gearbox-generator-converter efficiency η_drive = 92%. Calculate the electrical power output in MW, and compute the Capacity Factor if this 3.6 MW rated turbine generates 12,928 MWh in a standard 8,760-hour year.",
    workedStepByStep: [
      "1. Compute rotor swept area: A = π × (60 m)² = 3.14159 × 3,600 = 11,309.7 m².",
      "2. Compute raw kinetic wind power at v = 10.0 m/s: P_wind = 0.5 × 1.225 × 11,309.7 × (10.0)³ = 6,927,191 W = 6.927 MW.",
      "3. Multiply by C_p (0.45) and drivetrain efficiency (0.92): P_elec = 6.927 MW × 0.45 × 0.92 = 2.868 MW.",
      "4. Compute Annual Capacity Factor: CF = 12,928 MWh / (3.6 MW × 8,760 hr) = 12,928 / 31,536 = 41.00%."
    ],
    workedConclusion:
      "At 10 m/s wind speed, the 120 m rotor generates 2.87 MW electrical output, and annual generation of 12,928 MWh corresponds to a 41.0% Capacity Factor.",
    practicalLabScenario:
      "Audit a 10-turbine wind farm SCADA dataset (10-minute wind speed, power output, nacelle yaw angle, blade pitch angle, and gearbox oil temperature), isolate two underperforming turbines, and prepare a Lockout/Tagout (LOTO) and Hub/Rotor Pinning Maintenance Work Package.",
    practicalLabTasks: [
      "Plot measured 10-minute SCADA power curves against the manufacturer's air-density-corrected warranty power curve.",
      "Calculate Annual Energy Production (AEP), Technical Availability, and Capacity Factor for each turbine.",
      "Diagnose a 9° static nacelle anemometer/vane yaw misalignment on Turbine WTG-04 and a hydraulic pitch-cylinder sluggish response on WTG-07.",
      "Author the High-Angle Rescue, Electrical LOTO, and Mechanical Rotor-Lock Pinning safety checklist required before entering the hub."
    ],
    answerKeyQuestion: {
      prompt: "Before a wind turbine technician enters the rotor hub or works near rotating drivetrain components, why is opening the electrical grid breaker ALONE completely insufficient for safety?",
      options: [
        "Even with the electrical breaker open, aerodynamic wind forces on the blades can rotate the rotor and drivetrain; technicians must pitch the blades to full feather, apply the service brake, AND engage the mechanical rotor-lock pin under full electrical + mechanical + hydraulic LOTO.",
        "Because wind turbines spin faster when the blades are removed.",
        "Because electrical breakers only control tower lighting.",
        "Mechanical rotor locks are only used during transport on highways."
      ],
      correctIndex: 0,
      explanation: "Wind acts as a live mechanical energy source on the rotor; both electrical LOTO and mechanical rotor-lock pinning (plus hydraulic accumulator depressurization) are mandatory."
    },
    careerGuidance: {
      prerequisites: "Electrical AC/DC circuits, hydraulic/mechanical systems, SCADA telemetry analysis, and physical climb/electrical safety.",
      targetRoles: "Wind Energy Technician, Renewable Performance Analyst, Wind SCADA Diagnostic Engineer, Wind Site Operations Lead.",
      qualificationsAndNextSteps: "GWO (Global Wind Organisation) Basic Safety Training (Working at Heights, First Aid, Manual Handling, Fire Awareness) & Basic Technical Training (BTT), OSHA 1910.269 electrical safety."
    },
    mentorReviewCriteria: [
      "Power curve calculations apply air-density normalization (IEC 61400-12-1).",
      "SCADA fault diagnosis correlates wind speed, pitch angle, rotor RPM, and generator temperatures.",
      "Safety plan enforces electrical LOTO, hydraulic energy release, mechanical rotor lock, and 100% tie-off fall protection."
    ],
    principalReferences: [
      {
        title: "NREL Wind Energy Research & IEC 61400 Wind Turbine Design and Testing Standards",
        organization: "National Renewable Energy Laboratory (NREL) / OSHA",
        url: "https://www.nrel.gov/wind/",
        summary: "Technical reference material for wind resource assessment, turbine aerodynamics, power curve verification, and wind energy safety."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 7: CREATIVE, EDUCATIONAL AND COMMUNICATION CAREERS (30-33)
  // --------------------------------------------------------------------------
  {
    careerNumber: 30,
    id: "spec-career-30-instructional-design-digital-education",
    title: "Instructional Design and Digital Education",
    domainNumber: 7,
    domainTitle: "7. Creative, educational and communication careers",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/certifications-hub-cover.jpg",
    tangibleEvidenceType: "Backward-Design Alignment Blueprint, Interactive Scenario Storyboard, Psychometric Item Analysis & WCAG 2.2 AA Accessibility Audit",
    coreCurriculumBullets: [
      "ADDIE & Backward Design, Bloom's Taxonomy measurable objectives, cognitive load management, scenario-based learning storyboards, psychometric item analysis (Item Difficulty & Discrimination), and WCAG 2.2 AA accessibility."
    ],
    capstoneProject: "Design, storyboard, build, and evaluate a complete digital learning module with measurable competency assessments, accessibility verification, and psychometric item analysis.",
    workedFormulaTitle: "Assessment Item Difficulty (p-value) & Item Discrimination Index (D)",
    workedFormulaEquations: [
      "Item Difficulty (p-value):       p = N_correct / N_total   ∈ [0.0, 1.0]",
      "Item Discrimination Index (D):   D = p_upper_27% - p_lower_27%   ∈ [-1.0, +1.0]"
    ],
    workedFormulaExplanation:
      "Instructional designers align every assessment item directly to an observable Bloom's Taxonomy action verb (Backward Design) and evaluate assessment quality using psychometric Item Difficulty (`p`, ideally 0.30–0.85 for criterion/competency testing) and Item Discrimination (`D >= 0.30`, verifying that high-performing learners answer the question correctly more often than low-performing learners).",
    workedProblemStatement:
      "A 100-learner cohort completes a competency assessment. On Question 14, 15 of the top 27 overall scorers (p_upper = 15/27 = 0.556) answered correctly, while 21 of the bottom 27 overall scorers (p_lower = 21/27 = 0.778) answered correctly. Compute the Item Discrimination Index (D) and diagnose the flaw in Question 14.",
    workedStepByStep: [
      "1. Compute p_upper = 15 / 27 = 0.556 and p_lower = 21 / 27 = 0.778.",
      "2. Compute Item Discrimination Index: D = 0.556 - 0.778 = -0.222 (negative discrimination).",
      "3. Diagnose: A negative discrimination index (D < 0) means learners who mastered the overall course got this specific question WRONG more often than learners who failed the overall course.",
      "4. Action: Inspect Question 14 for a mis-keyed answer key, double-negative stem, or trick distractor that penalizes deep technical understanding, and revise or replace the item."
    ],
    workedConclusion:
      "Negative item discrimination (D = -0.222) flags a defective or mis-keyed question stem that must be revised to maintain assessment validity.",
    practicalLabScenario:
      "Design a workplace technical training module using Backward Design, author an interactive branching scenario storyboard, audit WCAG 2.2 AA accessibility (captions, keyboard navigation, 4.5:1 contrast, alt text), and analyze a 20-item pilot assessment dataset.",
    practicalLabTasks: [
      "Write 5 observable learning objectives using Bloom's Application/Analysis/Creation verbs (avoiding vague terms like 'understand' or 'appreciate') and map each to a rubric criterion.",
      "Storyboard a 4-node branching decision scenario where each distractor models a realistic workplace mistake and triggers diagnostic feedback.",
      "Perform a psychometric analysis (p-value, Discrimination D, and distractor efficiency) on a 20-item pilot dataset.",
      "Complete a WCAG 2.2 Level AA accessibility audit checklist for the digital module."
    ],
    answerKeyQuestion: {
      prompt: "In instructional design, why is 'Learners will understand workplace electrical safety' considered a weak learning objective compared to 'Given a 480 V panel diagram, learners will execute the 6-step OSHA Lockout/Tagout verification procedure with 100% accuracy'?",
      options: [
        "'Understand' is an internal mental state that cannot be directly observed or measured, whereas 'execute the 6-step procedure given a panel diagram' specifies the condition, observable performance verb, and measurable passing criterion.",
        "Because electrical safety should never be taught with diagrams.",
        "Because Bloom's Taxonomy prohibits using more than three words in an objective.",
        "Vague objectives make grading rubrics easier to automate."
      ],
      correctIndex: 0,
      explanation: "Robert Mager's and Bloom's frameworks require observable action verbs, performance conditions, and measurable criteria so assessments directly test competence."
    },
    careerGuidance: {
      prerequisites: "Adult learning principles, structured writing, digital authoring tools (HTML/LMS/SCORM/xAPI), and basic statistics.",
      targetRoles: "Instructional Designer, Learning Experience Designer (LXD), Technical Curriculum Developer, Corporate Enablement Architect.",
      qualificationsAndNextSteps: "ATD CPTD (Certified Professional in Talent Development), xAPI / SCORM package engineering, WCAG 2.2 accessibility auditing."
    },
    mentorReviewCriteria: [
      "100% constructive alignment between Learning Objectives, Practice Activities, and Rubric/Assessment items.",
      "Branching scenarios test applied workplace decisions rather than trivial recall.",
      "WCAG 2.2 AA accessibility requirements (contrast, keyboard focus, captions, semantic headings) are verified."
    ],
    principalReferences: [
      {
        title: "W3C Web Content Accessibility Guidelines (WCAG) 2.2 & U.S. Section 508 Digital Learning Standards",
        organization: "W3C / U.S. Access Board",
        url: "https://www.w3.org/TR/WCAG22/",
        summary: "International accessibility standard ensuring digital learning content is perceivable, operable, understandable, and robust for all learners."
      }
    ]
  },
  {
    careerNumber: 31,
    id: "spec-career-31-3d-design-product-visualization",
    title: "3D Design and Product Visualization",
    domainNumber: 7,
    domainTitle: "7. Creative, educational and communication careers",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/ai-studies-cover.jpg",
    tangibleEvidenceType: "Clean Quad-Topology 3D Asset, UV Texel Density Map, Physically Based Rendering (PBR) Material Set & Real-Time Optimization Package",
    coreCurriculumBullets: [
      "Hard-surface & subdivision modeling, clean quad topology & edge flow, UV unwrapping & texel density standardization, Physically Based Rendering (PBR) metallic-roughness workflows, studio lighting/cameras, and glTF/USD real-time optimization."
    ],
    capstoneProject: "Model, UV-unwrap, texture with PBR materials, light, render, and export a real-time optimized 3D product asset (glTF/USDZ + 4K studio renders) that passes a strict technical geometry and texel-density QA checklist.",
    workedFormulaTitle: "UV Texel Density, Real-Time Frame Budget & VRAM Texture Memory Footprint",
    workedFormulaEquations: [
      "UV Texel Density:        TD = (Texture_Width_px × UV_Island_Width_0to1) / World_Length_m   (px/m)",
      "Frame Time Budget:       t_frame (ms) = 1000 / Target_FPS   (60 FPS ⇒ 16.67 ms ; 90 FPS XR ⇒ 11.11 ms)",
      "Uncompressed RGBA8 RAM:  Bytes = Width × Height × 4 × 1.333 (with mipmap chain)"
    ],
    workedFormulaExplanation:
      "3D visualization specialists maintain consistent UV texel density (pixels per meter) across all visible parts of a product so textures never look blurry next to sharp parts, enforce physically accurate PBR albedo/metallic/roughness ranges, and budget polygon counts and compressed texture mipmaps to hit 60–90 FPS in web/AR viewers.",
    workedProblemStatement:
      "A 3D product configurator requires a uniform texel density of TD = 2,048 px/m (20.48 px/cm) using a 2048 × 2048 texture atlas. A housing panel measures 0.50 m in real-world length. What proportion (0 to 1 UV space) of the 2048 px texture width must that 0.50 m panel occupy, and what is the VRAM footprint of one uncompressed 2048 × 2048 RGBA8 texture including mipmaps?",
    workedStepByStep: [
      "1. Required pixels for the 0.50 m panel at 2,048 px/m: 0.50 m × 2,048 px/m = 1,024 pixels.",
      "2. UV island width in [0, 1] space on a 2048 px texture: 1,024 px / 2048 px = 0.50 (50% of UV width).",
      "3. Base 2048 × 2048 RGBA8 memory: 2,048 × 2,048 × 4 bytes = 16,777,216 bytes (16.0 MiB).",
      "4. Multiply by 4/3 (1.333) for the full mipmap chain: 16.0 MiB × 1.333 ≈ 21.33 MiB (which can be reduced ~4× using KTX2/BasisU GPU block compression)."
    ],
    workedConclusion:
      "The 0.50 m panel spans 0.50 of the 2K UV sheet to maintain 2,048 px/m texel density, and KTX2 GPU texture compression is used to cut the 21.33 MiB mipmapped VRAM footprint for real-time web delivery.",
    practicalLabScenario:
      "Take an industrial product CAD/reference specification, build a subdivision-ready high-poly and baked low-poly real-time mesh, unwrap non-overlapping UVs at uniform texel density, author PBR Metallic-Roughness maps, render a 3-point studio turntable, and export a validated glTF 2.0 web asset.",
    practicalLabTasks: [
      "Verify mesh hygiene: 100% manifold geometry, zero flipped face normals, zero laminar/overlapping faces, real-world metric scale (1 unit = 1.0 m), and zeroed transforms.",
      "Unwrap UVs with proper seam placement, padding margins (to prevent mipmap bleeding), and uniform texel density.",
      "Bake tangent-space normal and ambient occlusion maps from high-poly to low-poly without cage projection skew.",
      "Export a glTF 2.0 / GLB package under 15 MB and verify 60 FPS playback and energy-conserving PBR reflectance."
    ],
    answerKeyQuestion: {
      prompt: "In a Physically Based Rendering (PBR) Metallic-Roughness workflow, why should raw ambient occlusion shadows or directional specular highlights NEVER be painted directly into the Base Color (Albedo) texture map?",
      options: [
        "Base Color represents pure intrinsic surface reflectance; baking directional lighting or shadows into Albedo breaks physical energy conservation and causes the object to look wrong when moved into different HDRI lighting environments.",
        "Because PBR shaders ignore Base Color maps completely.",
        "Because Normal maps only store black-and-white text.",
        "Painting highlights into Albedo makes the polygon count double."
      ],
      correctIndex: 0,
      explanation: "PBR separates intrinsic material properties (Base Color, Metallic, Roughness, Normal, AO) from scene lighting so assets respond accurately under any environment map."
    },
    careerGuidance: {
      prerequisites: "Spatial geometry, Blender / Maya / 3ds Max / Cinema 4D, Substance 3D Painter, and PBR shading theory.",
      targetRoles: "3D Product Visualization Artist, Technical 3D Asset Artist, Real-Time WebGL / XR Visualization Specialist, Digital Twin 3D Modeler.",
      qualificationsAndNextSteps: "Khronos glTF 2.0 & OpenUSD pipeline standards, Unreal Engine / Unity / Three.js real-time look-dev portfolio."
    },
    mentorReviewCriteria: [
      "Mesh passes automated check for non-manifold edges, inverted normals, unapplied scale, and N-gon shading artifacts on curved surfaces.",
      "UV layout maintains uniform texel density and adequate island padding.",
      "PBR Base Color values stay within physically plausible dielectric (30–240 sRGB) and conductor reflectance ranges."
    ],
    principalReferences: [
      {
        title: "Khronos Group glTF 2.0 Specification & Realtime PBR Asset Guidelines",
        organization: "The Khronos Group",
        url: "https://www.khronos.org/gltf/",
        summary: "Industry open standard for efficient transmission, PBR material representation, and real-time rendering of 3D scenes and models."
      }
    ]
  },
  {
    careerNumber: 32,
    id: "spec-career-32-audio-engineering-sound-production",
    title: "Audio Engineering and Sound Production",
    domainNumber: 7,
    domainTitle: "7. Creative, educational and communication careers",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/certifications-hub-cover.jpg",
    tangibleEvidenceType: "Gain-Staged Multitrack Session, Acoustic Room & Phase Analysis, Subtractive EQ/Dynamics Mix & ITU-R BS.1770 Loudness-Compliant Master",
    coreCurriculumBullets: [
      "Acoustics & microphone polar patterns, gain staging & signal-to-noise ratio, phase coherence & 3:1 rule, subtractive EQ & dynamic compression, spatial stereo/surround imaging, and ITU-R BS.1770 / EBU R128 loudness mastering."
    ],
    capstoneProject: "Record/edit, phase-align, mix, and master a multitrack dialogue, music, and sound-design production package that meets broadcast/streaming LUFS and True Peak loudness delivery specifications.",
    workedFormulaTitle: "Acoustic Wavelength, Decibel Voltage/Power Ratios, Nyquist Sampling & LUFS Headroom",
    workedFormulaEquations: [
      "Acoustic Wavelength:     λ = c / f   (where c ≈ 343 m/s in air at 20°C)",
      "Decibel Amplitude Ratio: ΔdB = 20 × log_10(V_2 / V_1)",
      "Nyquist Theorem:         f_s >= 2 × f_max   ;   24-bit Dynamic Range ≈ 6.02 × 24 = 144.5 dB"
    ],
    workedFormulaExplanation:
      "Audio engineers calculate room acoustic wavelengths (`λ = c/f`), enforce the 3:1 microphone spacing rule to prevent comb-filtering phase cancellation, maintain clean analog/digital gain staging (-18 dBFS RMS nominal / <= -6 dBFS peak during tracking), and master final deliverables to integrated loudness (LUFS) and True Peak (dBTP) broadcast standards.",
    workedProblemStatement:
      "A dialogue + music broadcast master is measured over its full program length at -18.5 LUFS Integrated with a Maximum True Peak of -2.8 dBTP. The target delivery specification is -14.0 LUFS Integrated (±0.5 LU) with a Maximum True Peak ceiling of -1.0 dBTP. How much makeup gain is required, and will a simple +4.5 dB linear gain boost clip the -1.0 dBTP ceiling?",
    workedStepByStep: [
      "1. Compute required integrated loudness increase: -14.0 LUFS - (-18.5 LUFS) = +4.5 LU (+4.5 dB).",
      "2. Check resulting True Peak if +4.5 dB linear gain is applied without limiting: -2.8 dBTP + 4.5 dB = +1.7 dBTP.",
      "3. Since +1.7 dBTP exceeds both the -1.0 dBTP delivery ceiling and 0.0 dBFS digital full scale (causing inter-sample clipping), a pure linear gain boost will fail QC.",
      "4. Solution: Apply transparent bus compression / True-Peak brickwall limiting (ceiling set to -1.0 dBTP with >= 4× oversampling) while bringing integrated loudness to -14.0 LUFS."
    ],
    workedConclusion:
      "Bringing the mix from -18.5 LUFS to -14.0 LUFS requires +4.5 dB of gain paired with oversampled True-Peak limiting at -1.0 dBTP to prevent inter-sample clipping.",
    practicalLabScenario:
      "Take a raw 16-track production session (boom + lavalier dialogue with phase offset, room HVAC rumble, acoustic instruments, and sound effects), phase-align the microphones, remove rumble/resonances, balance dynamics, and export stereo + stem masters compliant with -14 LUFS / -1.0 dBTP and -24 LKFS / -2.0 dBTP broadcast specs.",
    practicalLabTasks: [
      "Align time/phase offset between boom and lavalier dialogue tracks to eliminate hollow comb-filtering.",
      "Apply high-pass filtering and narrow-Q subtractive EQ to remove 60 Hz hum and room modes without thinning vocal fundamentals.",
      "Configure serial vocal compression (fast peak-catching compressor followed by smooth leveling compressor) and sidechain ducking on the music bed.",
      "Deliver final WAV masters accompanied by an ITU-R BS.1770-4 Loudness, True Peak, Phase Correlation, and Mono-Compatibility QC Report."
    ],
    answerKeyQuestion: {
      prompt: "When recording or mixing two microphones capturing the same sound source at slightly different distances (such as a boom mic and a lapel mic), what happens if both channels are summed together without aligning their arrival time/phase?",
      options: [
        "Acoustic path-length delay causes phase interference (comb filtering), canceling out frequencies whose half-wavelengths match the delay and creating a thin, hollow, phaser-like sound.",
        "The sampling rate automatically drops from 48 kHz to 8 kHz.",
        "Both microphones become immune to room reverberation.",
        "Phase cancellation only occurs above 100 kHz."
      ],
      correctIndex: 0,
      explanation: "Summing time-delayed copies of the same signal creates destructive interference notches (comb filtering) across the frequency spectrum."
    },
    careerGuidance: {
      prerequisites: "Wave physics, ear training, Digital Audio Workstation (Pro Tools, Reaper, Logic, Nuendo) proficiency, and signal-flow literacy.",
      targetRoles: "Audio Engineer, Broadcast/Podcast Sound Mixer, Post-Production Dialogue & Re-Recording Mixer, Live/Studio Sound Technician.",
      qualificationsAndNextSteps: "Avid Certified Operator: Pro Tools, Dante Level 1–3 Audio Networking Certification, AES (Audio Engineering Society) standards."
    },
    mentorReviewCriteria: [
      "Boom/lav and multi-mic tracks are phase-aligned and pass mono-sum compatibility checks (correlation >= 0).",
      "Dialogue intelligibility remains clear above background music/effects without pumping artifacts.",
      "Delivered WAV files strictly match target sample rate (48 kHz / 24-bit), Integrated LUFS, and True Peak dBTP ceiling."
    ],
    principalReferences: [
      {
        title: "ITU-R BS.1770-4: Algorithms to Measure Audio Programme Loudness and True-Peak Audio Level",
        organization: "International Telecommunication Union (ITU) / EBU R128",
        url: "https://www.itu.int/rec/R-REC-BS.1770",
        summary: "Global technical standard for K-weighted loudness measurement (LKFS/LUFS) and oversampled True-Peak metering."
      }
    ]
  },
  {
    careerNumber: 33,
    id: "spec-career-33-documentary-production-digital-storytelling",
    title: "Documentary Production and Digital Storytelling",
    domainNumber: 7,
    domainTitle: "7. Creative, educational and communication careers",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/ai-studies-cover.jpg",
    tangibleEvidenceType: "Archival & Fact-Verification Log, Paper Edit & Timecoded A/V Script, Rec.709 Color/Audio Master & Release/Clearance Binder",
    coreCurriculumBullets: [
      "Archival research & primary-source fact verification, interview cinematography & 180-degree spatial continuity, timecoded paper-edit story structure, B-roll visual evidence sequencing, Rec.709 color grading, and legal release/rights clearance."
    ],
    capstoneProject: "Produce a complete documentary production package (verified factual research dossier, signed appearance/location release templates, timecoded paper edit, and a color-graded, loudness-normalized short documentary cut with full source citations).",
    workedFormulaTitle: "180° Shutter Angle Rule, Uncompressed/Codec Bitrate Storage & Timecode Frame Math",
    workedFormulaEquations: [
      "180° Motion-Blur Shutter Speed:  t_shutter = 1 / (2 × Frame_Rate_fps)   (24 fps ⇒ 1/48 s)",
      "Storage Footprint (GB):          Size_GB = (Bitrate_Mbps × Duration_seconds) / (8 × 1024)",
      "SMPTE Timecode Frames (24 fps):  Total_Frames = ((HH × 3600 + MM × 60 + SS) × 24) + FF"
    ],
    workedFormulaExplanation:
      "Documentary producers combine rigorous journalistic fact-checking (corroborating interview claims against primary archival documents) with technical cinematography (180-degree shutter rule, zebra/false-color exposure, dual-system timecode sync), Rec.709 color accuracy, and complete chain-of-title legal clearances.",
    workedProblemStatement:
      "A 2-camera documentary shoot records at 24 fps in 4K ProRes 422 HQ (data rate ≈ 754 Mbps per camera) for 3.5 hours of raw footage per camera, plus 24-bit/48 kHz dual-system audio. What shutter speed satisfies the 180° shutter angle rule at 24 fps, and how many gigabytes (GiB) of storage are required for a 3-2-1 dual-card backup of the 2 cameras on set?",
    workedStepByStep: [
      "1. Compute 180° shutter speed at 24 fps: t_shutter = 1 / (2 × 24) = 1/48 second (or 1/50 s on consumer cameras).",
      "2. Compute total recording duration across both cameras: 2 cameras × 3.5 hours × 3,600 s/hr = 25,200 camera-seconds.",
      "3. Compute single-copy video data volume: (754 Mbps × 25,200 s) / 8 = 2,375,100 MB ÷ 1,024 ≈ 2,319.4 GiB (~2.32 TiB).",
      "4. For immediate on-set redundant backup onto two independent RAID/SSD shuttle drives (2 copies + original media): provision at least 2 × 2.5 TB rugged SSDs and verify xxHash64/MD5 checksums via offload software before formatting camera cards."
    ],
    workedConclusion:
      "Shooting 24 fps uses a 1/48 s shutter speed, and 7 total camera-hours of 4K ProRes 422 HQ requires ~2.32 TiB per copy with verified checksum offload.",
    practicalLabScenario:
      "Assemble a 5-minute investigative/educational documentary package from raw interview transcripts, primary public-record exhibits, archival stills/footage, and multi-cam logs: build the timecoded Paper Edit, verify every factual claim in an Annotated Fact-Check Matrix, complete the Chain-of-Title Release Binder, and pass broadcast QC.",
    practicalLabTasks: [
      "Build a timecoded Paper Edit (A-roll interview bites + B-roll visual evidence + archival documents) structured around a 3-act narrative arc.",
      "Create a line-by-line Annotated Fact-Check Matrix linking every narration/caption claim and interview statistic to at least two independent primary sources.",
      "Audit the Chain-of-Title Clearance Binder (Appearance Releases, Location Releases, Archival Licensing, or documented Fair Use legal analysis).",
      "Perform Rec.709 waveform/vectorscope color balancing (0–100 IRE legal luminance, natural skin-tone line on vectorscope) and -24 LKFS / -14 LUFS audio normalization with closed captions (`.srt`)."
    ],
    answerKeyQuestion: {
      prompt: "In documentary post-production and journalistic ethics, what is an 'Annotated Fact-Check Script' (or Source Verification Matrix) and why is it required before locked picture release?",
      options: [
        "It breaks down every factual assertion, date, statistic, and archival attribution in the film line-by-line and links each to verified primary source documents to prevent defamation, misinformation, and Errors & Omissions (E&O) insurance rejection.",
        "It is a marketing list of social media hashtags.",
        "It replaces the need for signed appearance releases or music licenses.",
        "It automatically color-grades log footage into Rec.709."
      ],
      correctIndex: 0,
      explanation: "Broadcasters, distributors, and E&O insurers require a documented fact-check binder and clear chain-of-title releases for every asset in a documentary."
    },
    careerGuidance: {
      prerequisites: "Non-linear video editing (DaVinci Resolve, Premiere Pro, Avid Media Composer), camera/lighting fundamentals, research ethics, and storytelling.",
      targetRoles: "Documentary Producer/Editor, Digital Storytelling Specialist, Investigative Media Producer, Technical & Science Communicator.",
      qualificationsAndNextSteps: "DaVinci Resolve Color/Fairlight Certification, archival rights & E&O clearance literacy, festival/broadcast technical delivery specs."
    },
    mentorReviewCriteria: [
      "Every factual claim and lower-third title is backed by a cited primary source in the Fact-Check Matrix.",
      "Editing avoids manipulative 'franken-biting' that distorts an interviewee's stated meaning.",
      "Final master passes Rec.709 video legal levels, audio loudness, and closed-caption timing checks."
    ],
    principalReferences: [
      {
        title: "Library of Congress Digital Preservation & PBS Editorial Standards and Practices",
        organization: "Library of Congress / Public Broadcasting Standards",
        url: "https://www.loc.gov/preservation/digital/",
        summary: "Authoritative standards for audiovisual digital preservation, metadata, archival citation, and documentary editorial integrity."
      }
    ]
  }
]

// ============================================================================
// 4. GENERATOR: CONVERT ANY OF THE 33 SPECIALIZED CAREERS INTO A FULL
//    9-MILESTONE CLASSROOM PATHWAY WITH 10-PAGE HANDBOOK, WORKED EXAMPLES,
//    PRACTICAL LABS, ANSWER-KEY QUIZZES, DELIVERABLES & INSTRUCTOR RUBRICS
// ============================================================================

const SPECIALIZED_PATHWAY_CACHE = new Map<string, PriorityCareerPathway>()

export function buildSpecializedCareerPathway(spec: SpecializedTangibleCareerSpec): PriorityCareerPathway {
  const cached = SPECIALIZED_PATHWAY_CACHE.get(spec.id)
  if (cached) return cached

  const milestoneBlueprints = [
    {
      num: 1,
      title: `Foundations, Core Principles & System Architecture (${spec.title})`,
      focus: `Core terminology, system boundaries, governing principles, and technical foundations across: ${spec.coreCurriculumBullets.join("; ")}.`
    },
    {
      num: 2,
      title: `Standards, Instrumentation, Telemetry & Data Acquisition`,
      focus: `Collecting, validating, calibrating, and normalizing primary measurements, logs, drawings, or source records for ${spec.title}.`
    },
    {
      num: 3,
      title: `Quantitative Modeling, Calculations & Worked Problem Solving`,
      focus: `Applying ${spec.workedFormulaTitle} (${spec.workedFormulaEquations[0]}) to solve realistic workplace sizing, diagnostic, and optimization problems.`
    },
    {
      num: 4,
      title: `Core Workflow Execution & Technical Implementation`,
      focus: `Hands-on implementation of primary ${spec.title} workflows, configurations, controls, and verification procedures.`
    },
    {
      num: 5,
      title: `Diagnostics, Troubleshooting & Failure-Mode Analysis`,
      focus: `Systematic root-cause analysis, anomaly isolation, edge-case testing, and corrective action planning in ${spec.title}.`
    },
    {
      num: 6,
      title: `Safety, Security, Quality Assurance & Regulatory Boundaries`,
      focus: `Enforcing safety interlocks, quality tolerances, data integrity, ethical standards, and statutory escalation boundaries.`
    },
    {
      num: 7,
      title: `Technical Documentation, Reporting & Stakeholder Communication`,
      focus: `Authoring clear, reproducible technical reports, evidence logs, diagrams, and decision briefs that separate facts from assumptions.`
    },
    {
      num: 8,
      title: `Lifecycle Economics, Risk Prioritization & Operational Resilience`,
      focus: `Evaluating cost, schedule, reliability, risk reduction, and operational trade-offs across the asset or project lifecycle.`
    },
    {
      num: 9,
      title: `Capstone Project & Mentor Competency Defense`,
      focus: `Capstone: ${spec.capstoneProject} Produce the complete ${spec.tangibleEvidenceType} and defend all engineering/professional decisions.`
    }
  ]

  const safetyNotice =
    spec.regulatoryBoundaryNote ||
    `Professional & Regulatory Boundary Notice: This ${spec.title} pathway builds demonstrable technical skills, calculations, and portfolio artifacts (${spec.tangibleEvidenceType}). Completion of online modules and simulations does not by itself confer statutory professional licensure, clinical privileges, or authority to perform regulated high-voltage, structural, or safety-critical work without required supervision and credentials.`

  const milestones: PathwayMilestoneUnit[] = milestoneBlueprints.map((m) => {
    const lessons: PathwayLesson[] = [
      {
        lessonNumber: `Lesson ${m.num}.1`,
        title: `${m.title}`,
        paragraphs: [
          m.focus,
          `In ${spec.title} (${spec.domainTitle}), employers and clients evaluate practitioners on tangible evidence of competence: ${spec.tangibleEvidenceType}.`,
          `${spec.workedFormulaExplanation} Capstone Requirement: ${spec.capstoneProject}`
        ],
        bulletPoints: spec.coreCurriculumBullets,
        mathFormulaBox: {
          title: spec.workedFormulaTitle,
          equations: spec.workedFormulaEquations,
          explanation: spec.workedFormulaExplanation
        },
        calloutNote: safetyNotice
      },
      {
        lessonNumber: `Lesson ${m.num}.2`,
        title: `10-Component Production Standard, Career Guidance & Mentor Review`,
        paragraphs: [
          `Target Roles: ${spec.careerGuidance.targetRoles}.`,
          `Prerequisites: ${spec.careerGuidance.prerequisites}.`,
          `Qualifications & Next Steps: ${spec.careerGuidance.qualificationsAndNextSteps}.`
        ],
        orderedSteps: [
          "Verify scope, input data integrity, and safety/regulatory prerequisites before starting work.",
          "Execute quantitative calculations or diagnostic tests and record every unit and assumption.",
          "Escalate missing specifications or out-of-scope safety hazards formally rather than guessing.",
          "Validate the deliverable against the 3-tier Competency Rubric and Mentor Review criteria."
        ],
        table: {
          headers: ["Component #", "Standard Component", "How It Applies in This Milestone"],
          rows: [
            ["01–04", "Handbook, Milestones, Labs & Worked Math", `${spec.workedFormulaTitle} + ${spec.practicalLabScenario}`],
            ["05–07", "Knowledge Checks, Portfolio & Rubric", `Deliverable: ${spec.tangibleEvidenceType}`],
            ["08–10", "References, Career Guidance & Mentor Sign-Off", spec.mentorReviewCriteria.join(" | ")]
          ]
        }
      }
    ]

    const rawPages = [
      {
        pageNumber: 1,
        title: "Cover, Scope & Professional Notice",
        subtitle: `${spec.title} — Milestone ${m.num} Technical Handbook`,
        markdown: `# ${spec.title}\n## Milestone ${m.num}: ${m.title}\n\n- **Career #**: ${spec.careerNumber} of 60 Specialized Tangible-Competence Careers\n- **Domain**: ${spec.domainTitle}\n- **Tangible Evidence Artifact**: ${spec.tangibleEvidenceType}\n- **Capstone Objective**: ${spec.capstoneProject}\n\n> [!IMPORTANT]\n> **Source & Regulatory Integrity Notice**: ${safetyNotice}`
      },
      {
        pageNumber: 2,
        title: "Core Curriculum & Learning Objectives",
        subtitle: "What the learner must know and demonstrate",
        markdown: `# Learning Objectives & Curriculum Scope\n\n## Core Topics Covered\n${spec.coreCurriculumBullets.map((b) => `- ${b}`).join("\n")}\n\n## Milestone ${m.num} Focus\n${m.focus}`
      },
      {
        pageNumber: 3,
        title: "Governing Equations & Quantitative Methods",
        subtitle: spec.workedFormulaTitle,
        markdown: `# ${spec.workedFormulaTitle}\n\n\`\`\`text\n${spec.workedFormulaEquations.join("\n")}\n\`\`\`\n\n## Methodological Explanation\n${spec.workedFormulaExplanation}`
      },
      {
        pageNumber: 4,
        title: "Step-by-Step Worked Professional Example",
        subtitle: "Complete calculation and decision walkthrough",
        markdown: `# Worked Example: ${spec.title}\n\n## Problem Statement\n${spec.workedProblemStatement}\n\n## Step-by-Step Solution\n${spec.workedStepByStep.map((s) => `- ${s}`).join("\n")}\n\n## Engineering / Professional Conclusion\n**${spec.workedConclusion}**`
      },
      {
        pageNumber: 5,
        title: "Practical Laboratory Exercise",
        subtitle: "Hands-on simulation, dataset analysis, and verification tasks",
        markdown: `# Practical Lab ${m.num} — ${spec.title}\n\n## Scenario\n${spec.practicalLabScenario}\n\n## Required Tasks\n${spec.practicalLabTasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      },
      {
        pageNumber: 6,
        title: "Knowledge Check & Model Answer Key",
        subtitle: "Applied reasoning and diagnostic verification",
        markdown: `# Knowledge Assessment & Answer Key\n\n**Question**: ${spec.answerKeyQuestion.prompt}\n\n${spec.answerKeyQuestion.options
          .map((opt, idx) => `- **${idx === spec.answerKeyQuestion.correctIndex ? "[CORRECT]" : "[OPTION]"}** ${opt}`)
          .join("\n")}\n\n**Model Explanation**: ${spec.answerKeyQuestion.explanation}`
      },
      {
        pageNumber: 7,
        title: "Portfolio Deliverable Template",
        subtitle: spec.tangibleEvidenceType,
        markdown: `# Portfolio Artifact: ${spec.tangibleEvidenceType}\n\n## Required Sections\n1. Executive Summary & Scope Boundaries\n2. Input Data Inventory & Verification Hashes/Calibrations\n3. Quantitative Calculations (${spec.workedFormulaTitle})\n4. Diagnostic Findings, Risk Matrix & Recommendations\n5. Explicit Assumptions, Limitations & Escalations`
      },
      {
        pageNumber: 8,
        title: "Competency Rubric & Pass Criteria",
        subtitle: "Developing vs. Competent vs. Advanced performance",
        markdown: `# Instructor Competency Rubric\n\n| Criterion | Developing (Needs Revision) | Competent (Pass) | Advanced (Distinction) |\n| :--- | :--- | :--- | :--- |\n| **Calculations & Technical Method** | Contains unit errors or unverified guesses | Accurately executes ${spec.workedFormulaTitle} with clear steps | Includes sensitivity analysis and edge-case verification |\n| **Deliverable Quality (${spec.tangibleEvidenceType})** | Incomplete evidence or missing sections | Complete, reproducible artifact ready for workplace review | Publication/audit-grade package with preventive controls |\n| **Safety, Ethics & Escalation** | Misses critical safety or regulatory limits | Properly identifies hazards and escalates out-of-scope issues | Designs defense-in-depth safeguards and verification checks |`
      },
      {
        pageNumber: 9,
        title: "Career Guidance & Mentor Review Checklist",
        subtitle: "Prerequisites, qualifications, and human mentor verification",
        markdown: `# Career Guidance & Mentor Review\n\n- **Prerequisites**: ${spec.careerGuidance.prerequisites}\n- **Target Roles**: ${spec.careerGuidance.targetRoles}\n- **Qualifications & Next Steps**: ${spec.careerGuidance.qualificationsAndNextSteps}\n\n## Human Mentor Review Sign-Off Criteria\n${spec.mentorReviewCriteria.map((c) => `- [x] ${c}`).join("\n")}`
      },
      {
        pageNumber: 10,
        title: "Authoritative Reference Standards",
        subtitle: "Official manuals, standards, and public source material",
        markdown: `# Principal References & Standards\n\n${spec.principalReferences
          .map((r) => `### ${r.title}\n- **Organization**: ${r.organization}\n- **URL**: ${r.url}\n- **Summary**: ${r.summary}`)
          .join("\n\n")}`
      }
    ]

    const whitePaperPages: RoadmapWhitePaperPage[] = rawPages.map((rp) => ({
      pageNumber: rp.pageNumber,
      sectionTitle: `${rp.title} — ${rp.subtitle}`,
      runningHeader: `CAREER #${spec.careerNumber} · ${spec.title.toUpperCase()} · M0${m.num} · PAGE ${rp.pageNumber} OF 10`,
      bodyParagraphs: rp.markdown.split("\n\n"),
      keyEquationOrSpec: spec.workedFormulaEquations.join("   |   "),
      calloutBox: {
        title: `Tangible Evidence Standard (${spec.tangibleEvidenceType})`,
        text: safetyNotice
      }
    }))

    return {
      milestoneNumber: m.num,
      title: m.title,
      summary: m.focus,
      learningObjectives: [
        `Master ${m.title} in the context of ${spec.title}.`,
        `Execute ${spec.workedFormulaTitle} accurately with explicit units and assumptions.`,
        `Complete the practical lab and produce the ${spec.tangibleEvidenceType}.`
      ],
      lessons,
      workedExample: {
        title: `${spec.title} — ${spec.workedFormulaTitle}`,
        problemStatement: spec.workedProblemStatement,
        stepByStepSolution: spec.workedStepByStep,
        engineeringConclusion: spec.workedConclusion
      },
      practicalLab: {
        title: `Practical Lab ${m.num} — ${spec.title}`,
        scenario: spec.practicalLabScenario,
        requiredTasks: spec.practicalLabTasks,
        submissionDeliverables: [
          spec.tangibleEvidenceType,
          `Milestone ${m.num} Calculation & Verification Log`,
          "Mentor Review Self-Audit Checklist"
        ],
        interactiveSimulatorHint: `Verify all calculations using ${spec.workedFormulaTitle} and check the Mentor Review criteria before submitting.`
      },
      assessmentQuestions: [
        {
          id: `${spec.id}-m${m.num}-q1`,
          prompt: spec.answerKeyQuestion.prompt,
          options: spec.answerKeyQuestion.options,
          correctIndex: spec.answerKeyQuestion.correctIndex,
          modelAnswerExplanation: spec.answerKeyQuestion.explanation
        },
        {
          id: `${spec.id}-m${m.num}-q2`,
          prompt: `When producing the ${spec.tangibleEvidenceType} for ${spec.title}, how should missing specification data or out-of-scope safety/regulatory issues be handled?`,
          options: [
            "Document the exact constraint, separate confirmed facts from assumptions, and escalate formally to the appropriate supervisor or licensed authority rather than guessing.",
            "Fabricate the missing measurements so the report looks complete.",
            "Delete the safety and limitations section from the deliverable.",
            "Skip verification checks whenever a deadline is close."
          ],
          correctIndex: 0,
          modelAnswerExplanation:
            "Every specialized tangible-competence career requires strict separation of verified evidence from assumptions and formal escalation of missing or safety-critical parameters."
        }
      ],
      passingCriterionNote:
        "Passing criterion: 80%+ on the knowledge assessment, verified mathematical calculations, and Competent or higher rating across all rubric dimensions.",
      professionalDeliverable: {
        title: `${spec.tangibleEvidenceType} (Milestone ${m.num})`,
        format: "Versioned Technical Portfolio Package (Markdown / PDF / Data Sheet)",
        templateMarkdown: `# ${spec.title} — Milestone ${m.num} Deliverable\n## Artifact: ${spec.tangibleEvidenceType}\n\n### 1. Scope & Curriculum Alignment\n${spec.coreCurriculumBullets.map((b) => `- ${b}`).join("\n")}\n\n### 2. Quantitative Analysis (${spec.workedFormulaTitle})\n- Equations Applied:\n  - \`${spec.workedFormulaEquations.join("`\n  - `")}\`\n- Calculation Steps & Units:\n\n### 3. Practical Lab Findings & Evidence\n- Scenario: ${spec.practicalLabScenario}\n- Verified Observations:\n\n### 4. Mentor Review Sign-Off Checklist\n${spec.mentorReviewCriteria.map((c) => `- [ ] ${c}`).join("\n")}\n`
      },
      competencyRubric: [
        {
          criterion: `Quantitative & Methodological Rigor (${spec.workedFormulaTitle})`,
          developing: "Contains unit conversion errors, unverified assumptions, or incomplete calculations.",
          competent: "Accurately solves the problem step-by-step with verified units and clear conclusions.",
          advanced: "Includes multi-scenario sensitivity analysis, error bounds, and automated verification."
        },
        {
          criterion: `Tangible Portfolio Evidence (${spec.tangibleEvidenceType})`,
          developing: "Missing key sections or fails to connect evidence to conclusions.",
          competent: "Complete, well-structured professional deliverable meeting workplace standards.",
          advanced: "Audit-defensible artifact ready for senior mentor sign-off and employer portfolio presentation."
        },
        {
          criterion: "Safety, Regulatory Boundaries & Professional Judgment",
          developing: "Oversteps licensing boundaries or ignores safety/quality controls.",
          competent: "Enforces all safety/quality checks and escalates ambiguities appropriately.",
          advanced: "Proactively designs preventive safeguards and documents residual risk."
        }
      ],
      careerApplication: {
        workplaceUsage: `${spec.careerGuidance.targetRoles} — Prerequisites: ${spec.careerGuidance.prerequisites}`,
        supervisionAndLicensingNote: `${spec.careerGuidance.qualificationsAndNextSteps}. ${safetyNotice}`
      },
      whitePaperPages,
      whitePaperFullMarkdown: rawPages.map((p) => p.markdown).join("\n\n---\n\n")
    }
  })

  const built: PriorityCareerPathway = {
    id: spec.id,
    priorityRank: spec.careerNumber,
    title: `#${spec.careerNumber} ${spec.title}`,
    categoryTitle: spec.domainTitle,
    level: "Beginner to Advanced Tangible-Competence Pathway",
    suggestedDuration: "12–24 weeks (9 Milestones + Capstone)",
    deliveryFormat: "Technical handbook, worked examples, practical labs, portfolio project & mentor review",
    bestLearningFormat: spec.tangibleEvidenceType,
    coverImage: spec.coverImage,
    capstoneSummary: spec.capstoneProject,
    safetyOrRegulatoryNotice: safetyNotice,
    principalReferences: spec.principalReferences,
    milestones
  }
  SPECIALIZED_PATHWAY_CACHE.set(spec.id, built)
  return built
}

export const SPECIALIZED_33_CAREER_PATHWAYS: PriorityCareerPathway[] = []


