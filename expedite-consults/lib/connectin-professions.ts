export interface ProfessionTool {
  name: string
  icon: string
  description: string
  badge?: string
}

export interface ProfessionDefinition {
  id: string
  title: string
  enclaveId: string
  categoryName: string
  defaultHeadline: string
  typicalSkills: string[]
  tools: ProfessionTool[]
}

export interface ProfessionEnclave {
  id: string
  name: string
  shortName: string
  icon: string
  tagline: string
  description: string
  themeColor: string
  accentBorder: string
  badgeBg: string
  badgeText: string
  feedTags: string[]
  securityClearanceTier: string
  professions: ProfessionDefinition[]
}

export const PROFESSION_ENCLAVES: ProfessionEnclave[] = [
  {
    id: "trades_construction",
    name: "Skilled Trades, Construction & Craftsmanship",
    shortName: "Trades & Craftsmanship",
    icon: "🔨",
    tagline: "Job site blueprints, subcontractor RFPs, OSHA compliance, trade tools & material markets",
    description: "Dedicated workspace for carpenters, general contractors, electricians, plumbers, and master tradespeople. Strict segregation from software/clinical environments.",
    themeColor: "from-amber-600 to-orange-700",
    accentBorder: "border-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    badgeText: "text-amber-800 dark:text-amber-300",
    securityClearanceTier: "Master Tradesman & Site Superintendent (Level 2)",
    feedTags: ["#Carpentry", "#Construction", "#Woodworking", "#Framing", "#TradeTools", "#OSHAGuidelines", "#SubcontractorBids", "#LumberMarket"],
    professions: [
      {
        id: "carpenter",
        title: "Master Carpenter (Framing & Finish Joinery)",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Carpenter · Heavy Timber Framing, Custom Joinery & Job-Site Superintendent",
        typicalSkills: ["Timber Framing", "Architectural Joinery", "CNC Woodworking", "Blueprints & CAD", "OSHA 30", "Cabinetry", "Tool Rigging"],
        tools: [
          { name: "Blueprint & CAD Spec Viewer", icon: "📐", description: "Architectural drawings, load-bearing specs & timber takeoff sheets", badge: "Active" },
          { name: "Lumber & Material Cost Index", icon: "🌲", description: "Real-time 2x4 framing, plywood & exotic hardwood market futures", badge: "Live Data" },
          { name: "Subcontractor RFP & Job Board", icon: "📋", description: "Residential framing bids, commercial millwork & punch lists", badge: "8 Bids Open" },
          { name: "Tool & Equipment Vault", icon: "🧰", description: "Festool Domino, DeWalt rig calibrations & tool maintenance logs", badge: "Verified" },
          { name: "OSHA Fall Protection Locker", icon: "🦺", description: "Daily job-site safety checklists, harness inspections & toolbox talks", badge: "OSHA 30" }
        ]
      },
      {
        id: "general_contractor",
        title: "General Contractor / Construction Superintendent",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Licensed General Contractor · Commercial Buildouts, Permits & Subcontractor PM",
        typicalSkills: ["General Contracting", "OSHA Safety", "Subcontractor Vetting", "Cost Estimation", "Permit Acquisition", "Schedule Management"],
        tools: [
          { name: "Job-Site Manifest & Permits", icon: "🏗️", description: "City permit inspection scheduling, structural sign-offs & municipal approvals", badge: "Active" },
          { name: "Subcontractor Escrow & Draws", icon: "💳", description: "Milestone-based progress disbursements & lien waiver tracker", badge: "Escrow" },
          { name: "Commercial Bid Estimator", icon: "📊", description: "RSMeans cost index and takeoff spreadsheets for commercial bids", badge: "RSMeans" }
        ]
      },
      {
        id: "electrician",
        title: "Licensed Master Electrician",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Electrician · High-Voltage Distribution, Industrial Panels & Automation",
        typicalSkills: ["NEC Code Compliance", "Panel Upgrades", "Industrial Conduit", "Three-Phase Power", "Safety Lockout", "VFD Programming"],
        tools: [
          { name: "NEC 2026 Code Lookup & Calculator", icon: "⚡", description: "Conduit fill, voltage drop calculations & single-line schematics", badge: "NEC 2026" },
          { name: "Arc-Flash Safety Boundaries", icon: "⚠️", description: "NFPA 70E compliance calculation and PPE requirement matrix", badge: "NFPA 70E" }
        ]
      },
      {
        id: "plumber",
        title: "Master Plumber & Pipefitter",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Plumber · Commercial Hydronics, Gas Lines & Backflow Prevention",
        typicalSkills: ["Commercial Plumbing", "Hydronics", "Medical Gas Lines", "PEX/Copper Systems", "Backflow Certification"],
        tools: [
          { name: "Hydronic Sizing & Pressure Calc", icon: "🚰", description: "Flow rate (GPM), friction loss and pump head sizing calculator", badge: "Calculators" },
          { name: "Backflow Certification Log", icon: "📋", description: "Annual RPZ device inspection records and municipal reporting", badge: "Compliant" }
        ]
      },
      {
        id: "hvac_technician",
        title: "HVAC/R Master Technician & Controls Lead",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "HVAC/R Specialist · Commercial Chillers, VRF Systems & Building Automation",
        typicalSkills: ["EPA Universal 608", "Chillers", "VRF Heat Recovery", "BACnet Controls", "Psychrometrics"],
        tools: [
          { name: "Psychrometric & Load Calc", icon: "❄️", description: "Manual J/N commercial cooling tonnage & airflow diagnostics", badge: "ASHRAE" }
        ]
      }
    ]
  },
  {
    id: "tech_software",
    name: "Software Engineering, Cloud & Cyber Defense",
    shortName: "Software & Cyber Defense",
    icon: "🧑‍💻",
    tagline: "Autonomous compilers, GitHub auto-PRs, eBPF microVMs, CVE intelligence & cloud architectures",
    description: "Dedicated workspace for developers, kernel engineers, and cloud architects. Strict segregation from trades/clinical environments.",
    themeColor: "from-sky-600 to-indigo-700",
    accentBorder: "border-sky-500",
    badgeBg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    badgeText: "text-sky-800 dark:text-sky-300",
    securityClearanceTier: "Software & DevSecOps Verified (Level 3)",
    feedTags: ["#SoftwareEngineering", "#Kubernetes", "#NextJS", "#CyberSecurity", "#GitHubActions", "#RustLang", "#eBPF", "#CloudArchitecture"],
    professions: [
      {
        id: "software_engineer",
        title: "Full-Stack / Systems Software Engineer",
        enclaveId: "tech_software",
        categoryName: "Software Engineering & Cloud",
        defaultHeadline: "Senior Software Engineer · Distributed Systems, Next.js 16 & Rust microVMs",
        typicalSkills: ["TypeScript", "Next.js", "Rust", "Go", "Docker", "PostgreSQL", "Kafka", "CI/CD Hardening"],
        tools: [
          { name: "Proof of Work Sandbox", icon: "🧪", description: "Isolated WebAssembly & Firecracker microVM test execution", badge: "Sub-4ms" },
          { name: "GitHub Auto-PR Assist", icon: "🐙", description: "Automated vulnerability remediation PRs with unit test verification", badge: "Connected" },
          { name: "Architecture Diagram Engine", icon: "🏛️", description: "Live C4 and system dependency graph visualizer", badge: "Realtime" },
          { name: "Bug Bounty & CVE Radar", icon: "🛡️", description: "Real-time zero-day feeds and exploit verification payloads", badge: "CVE-2026" }
        ]
      },
      {
        id: "cloud_architect",
        title: "Cloud & DevSecOps Solutions Architect",
        enclaveId: "tech_software",
        categoryName: "Software Engineering & Cloud",
        defaultHeadline: "Principal Cloud Architect · Multi-Tenant Terraform & Zero-Trust Enclaves",
        typicalSkills: ["AWS GovCloud", "Kubernetes", "Terraform", "OpenTofu", "eBPF", "Istio Service Mesh"],
        tools: [
          { name: "Terraform Enclave Generator", icon: "☁️", description: "Automated NIST 800-53 compliant infrastructure manifests", badge: "Production" },
          { name: "Kubernetes Cluster Telemetry", icon: "☸️", description: "Real-time node pod density, ingress policies & mesh latency", badge: "Live" }
        ]
      },
      {
        id: "cybersecurity_analyst",
        title: "Cybersecurity & Offensive Security Specialist",
        enclaveId: "tech_software",
        categoryName: "Software Engineering & Cloud",
        defaultHeadline: "Cybersecurity Analyst · Adversary Emulation, Threat Hunting & SOC Defense",
        typicalSkills: ["Threat Modeling", "SIEM Telemetry", "Reverse Engineering", "MITRE ATT&CK", "Memory Forensics"],
        tools: [
          { name: "Adversary Emulation Engine", icon: "🎯", description: "Simulated nation-state offensive exploit blast radius validator", badge: "SOC Ready" },
          { name: "Strike & Fusion Scanner", icon: "⚡", description: "Autonomous pentest, ASPM & AI-BOM guardrails", badge: "Active" }
        ]
      },
      {
        id: "ai_researcher",
        title: "AI & Machine Learning Research Scientist",
        enclaveId: "tech_software",
        categoryName: "Software Engineering & Cloud",
        defaultHeadline: "AI Research Scientist · Multi-Agent Swarms, LLM Fine-Tuning & Memory Safety",
        typicalSkills: ["PyTorch", "Transformers", "RLHF", "Agentic Swarms", "CUDA Kernels", "Vector DBs"],
        tools: [
          { name: "Agent Swarm Sandbox", icon: "🤖", description: "Deterministic tool sandboxing and multi-agent coordination benchmark", badge: "Wasm" }
        ]
      }
    ]
  },
  {
    id: "healthcare_medicine",
    name: "Clinical Healthcare, Medicine & Life Sciences",
    shortName: "Healthcare & Medicine",
    icon: "🩺",
    tagline: "HIPAA-secure case rounds, clinical trials, pharmacology registries & patient outcome metrics",
    description: "Dedicated workspace for physicians, registered nurses, and clinicians. Strict segregation from trades/developer environments.",
    themeColor: "from-emerald-600 to-teal-700",
    accentBorder: "border-emerald-500",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    securityClearanceTier: "HIPAA Clinical Practitioner Verified (Level 3)",
    feedTags: ["#Healthcare", "#Medicine", "#ClinicalTrials", "#Nursing", "#Pharmacology", "#PatientCare", "#HIPAACompliance"],
    professions: [
      {
        id: "physician",
        title: "Attending Physician / Specialist",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "Board-Certified Physician · Clinical Research & Evidence-Based Therapeutics",
        typicalSkills: ["Internal Medicine", "Clinical Diagnostics", "Patient Care Protocols", "Medical Imaging", "HIPAA Compliance"],
        tools: [
          { name: "HIPAA Secure Case Consults", icon: "🏥", description: "Anonymized peer case reviews and differential diagnostic boards", badge: "HIPAA BAA" },
          { name: "Clinical Trials & PubMed Radar", icon: "📑", description: "Live ingestion of double-blind trial results and FDA approvals", badge: "PubMed" },
          { name: "CEU Credential Locker", icon: "🎖️", description: "Automated CME/CEU tracking for state medical board licenses", badge: "Active" }
        ]
      },
      {
        id: "registered_nurse",
        title: "Registered Nurse (RN / Critical Care)",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "Critical Care Registered Nurse (CCRN) · ICU Patient Advocacy & Clinical Triage",
        typicalSkills: ["Critical Care", "Patient Triage", "Emergency Response", "Medication Admin", "Clinical Documentation"],
        tools: [
          { name: "Shift Exchange & Scheduling", icon: "🕒", description: "Verified peer shift marketplace with credential cross-checks", badge: "Hospital" },
          { name: "ICU Protocol Reference", icon: "📋", description: "Evidence-based ventilator weaning, sepsis bundles & titration charts", badge: "Clinical" }
        ]
      },
      {
        id: "pharmacist",
        title: "Doctor of Pharmacy (PharmD) / Clinical Pharmacist",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "Clinical Pharmacist (PharmD) · Pharmacokinetics, Drug Interactions & Formulary",
        typicalSkills: ["Pharmacotherapy", "Drug Interaction Checks", "Formulary Management", "Sterile Compounding", "Oncology Protocols"],
        tools: [
          { name: "Drug Interaction Analyzer", icon: "💊", description: "Real-time CYP450 contraindication and renal dosing adjustor", badge: "FDA Daily" }
        ]
      }
    ]
  },
  {
    id: "law_gov_defense",
    name: "Legal, Defense Intelligence & Governance",
    shortName: "Law & Defense",
    icon: "⚖️",
    tagline: "Classified enclave briefs, CMMC compliance audits, federal RFP proposals & legal briefs",
    description: "Dedicated workspace for attorneys, defense contractors, and policy leaders. Strict segregation from trades/developer environments.",
    themeColor: "from-purple-600 to-slate-800",
    accentBorder: "border-purple-500",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    badgeText: "text-purple-800 dark:text-purple-300",
    securityClearanceTier: "DoD Secret / TS Clearance Enclave",
    feedTags: ["#GovCloud", "#DefenseIntelligence", "#LegalCompliance", "#CMMC", "#FederalProcurement", "#NationalSecurity"],
    professions: [
      {
        id: "corporate_attorney",
        title: "Corporate & Regulatory Attorney",
        enclaveId: "law_gov_defense",
        categoryName: "Legal & Governance",
        defaultHeadline: "Partner / Corporate Counsel · Cross-Border M&A, Intellectual Property & Tech Policy",
        typicalSkills: ["Corporate Law", "Contract Negotiation", "IP Protection", "Regulatory Compliance", "Dispute Resolution"],
        tools: [
          { name: "Legal Brief & Precedent Vault", icon: "📚", description: "Automated SEC & federal court ruling citation cross-referencing", badge: "Fast Search" },
          { name: "Contract Redline Engine", icon: "🖋️", description: "Deterministic liability exposure and indemnity audit engine", badge: "Automated" }
        ]
      },
      {
        id: "defense_analyst",
        title: "Defense Intelligence & CMMC Compliance Lead",
        enclaveId: "law_gov_defense",
        categoryName: "Defense & GovCloud",
        defaultHeadline: "Senior Defense Analyst · TS/SCI Cleared · CMMC 2.0 Level 3 & FedRAMP High",
        typicalSkills: ["CMMC 2.0", "FedRAMP High", "OSCAL", "NIST 800-171", "Defense Intelligence", "GovCloud Security"],
        tools: [
          { name: "Federal SAM.gov RFP Feed", icon: "🏛️", description: "Direct cleared defense contracting bids and award telemetry", badge: "SAM.gov Live" },
          { name: "CMMC 2.0 Audit Workspace", icon: "🛡️", description: "Level 3 control artifact evidence package and SPRS score calculator", badge: "Audit Ready" }
        ]
      }
    ]
  },
  {
    id: "finance_accounting",
    name: "Finance, Accounting & Private Equity",
    shortName: "Finance & Accounting",
    icon: "📊",
    tagline: "GAAP audits, valuation DCF models, private equity deal flow & corporate treasury",
    description: "Dedicated workspace for CPAs, investment bankers, and controllers. Strict segregation from trades/developer environments.",
    themeColor: "from-emerald-700 to-green-900",
    accentBorder: "border-emerald-600",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    securityClearanceTier: "Financial Fiduciary / SEC Clearance (Level 2)",
    feedTags: ["#Finance", "#Accounting", "#CPA", "#PrivateEquity", "#Valuation", "#CorporateTreasury", "#GAAP"],
    professions: [
      {
        id: "cpa_accountant",
        title: "Certified Public Accountant (CPA) / Controller",
        enclaveId: "finance_accounting",
        categoryName: "Finance & Accounting",
        defaultHeadline: "CPA · Corporate Financial Controller, Forensic Audit & Tax Strategy",
        typicalSkills: ["GAAP Audit", "Tax Strategy", "Forensic Accounting", "ERP Systems", "Financial Reporting", "IFRS"],
        tools: [
          { name: "GAAP Ledger Reconciler", icon: "📑", description: "Automated bank feed anomaly detection and tax schedule export", badge: "GAAP Ready" },
          { name: "Valuation DCF Engine", icon: "📈", description: "Monte Carlo simulated cash flow and enterprise multiplier modeler", badge: "Realtime" },
          { name: "SEC EDGAR 10-K Ingestion", icon: "🏛️", description: "Automated financial statement comparison across peer groups", badge: "EDGAR Live" }
        ]
      },
      {
        id: "investment_banker",
        title: "Investment Banking & Private Equity Analyst",
        enclaveId: "finance_accounting",
        categoryName: "Finance & Accounting",
        defaultHeadline: "Private Equity Associate · LBO Modeling, Deal Sourcing & Portfolio Operations",
        typicalSkills: ["LBO Modeling", "M&A Diligence", "Capital Markets", "Term Sheets", "EBITDA Bridge"],
        tools: [
          { name: "LBO & Returns Sensitivity Matrix", icon: "💼", description: "IRR and MOIC waterfall modeling with debt schedule sensitivity", badge: "Financial" }
        ]
      }
    ]
  }
]

export const ALL_PROFESSIONS: ProfessionDefinition[] = PROFESSION_ENCLAVES.flatMap(e => e.professions)

export function findEnclaveById(enclaveId: string): ProfessionEnclave | undefined {
  return PROFESSION_ENCLAVES.find(e => e.id === enclaveId)
}

export function findProfessionById(professionId: string): ProfessionDefinition | undefined {
  return ALL_PROFESSIONS.find(p => p.id === professionId)
}

export function getEnclaveForProfession(professionId: string): ProfessionEnclave {
  const profession = findProfessionById(professionId)
  if (profession) {
    const enclave = findEnclaveById(profession.enclaveId)
    if (enclave) return enclave
  }
  return PROFESSION_ENCLAVES[0] // Default to trades/construction
}

export function getProfessionsByEnclave(enclaveId: string): ProfessionDefinition[] {
  const enclave = findEnclaveById(enclaveId)
  return enclave ? enclave.professions : []
}
