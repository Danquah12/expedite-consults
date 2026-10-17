export interface WheelVideoTalk {
  id: string
  serialPlate: string
  title: string
  speaker: string
  speakerTitle: string
  youtubeId: string
  duration: string
  category: string
  categoryLabel: string
  enclaveId?: string
  professionId?: string
  thumbnailUrl: string
  summary: string
  takeaways: string[]
  tags: string[]
  isCommunitySubmission?: boolean
  submittedBy?: string
}

export interface OnboardingGuideChapter {
  id: string
  stepNumber: number
  title: string
  subtitle: string
  description: string
  youtubeId: string
  duration: string
  targetTab?: string
  featureActionLabel?: string
  highlights: string[]
}

/**
 * Robust YouTube ID extractor from full URL, short link, or raw ID
 */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

const STORAGE_KEY = "connectin_custom_wheel_videos_v2"

export function getStoredCustomVideos(): WheelVideoTalk[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error("Failed to load custom wheel videos:", e)
    return []
  }
}

export function saveStoredCustomVideo(video: WheelVideoTalk): WheelVideoTalk[] {
  if (typeof window === "undefined") return []
  try {
    const current = getStoredCustomVideos()
    const updated = [video, ...current.filter(v => v.id !== video.id)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch (e) {
    console.error("Failed to save custom wheel video:", e)
    return []
  }
}

export function getAllWheelTalks(activeEnclaveId?: string): WheelVideoTalk[] {
  const custom = getStoredCustomVideos()
  const combined = [...custom, ...EDUCATIONAL_WHEEL_TALKS]
  if (!activeEnclaveId || activeEnclaveId === "all") {
    return combined
  }
  return combined.filter(v => !v.enclaveId || v.enclaveId === activeEnclaveId)
}

export const EDUCATIONAL_WHEEL_TALKS: WheelVideoTalk[] = [
  // ─── 1. SKILLED TRADES & CRAFTSMANSHIP (trades_construction) ──────
  {
    id: "wheel-lineman-apprentice",
    serialPlate: "CLN-TRD01",
    title: "Lineman Apprenticeship & High-Voltage Linework",
    speaker: "Master Lineworker Brotherhood",
    speakerTitle: "IBEW / NECA Journeyman Trainer",
    youtubeId: "Tsok2MiPtHY",
    duration: "5:20",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "lineman",
    thumbnailUrl: "https://i.ytimg.com/vi/Tsok2MiPtHY/hqdefault.jpg",
    summary: "Rigorous standards of the union electrical lineman apprenticeship: climbing certification, hot-stick training, substation safety, and storm restoration.",
    takeaways: [
      "Minimum 7,000 on-the-job training hours required for Journeyman ticket",
      "Zero-tolerance arc flash PPE standards (NFPA 70E)",
      "Emergency bucket truck rescue and pole-top CPR protocol"
    ],
    tags: ["#Lineman", "#HighVoltage", "#IBEW", "#ElectricalTrade", "#Apprenticeship"]
  },
  {
    id: "wheel-service-panel",
    serialPlate: "CLN-TRD02",
    title: "200A & 400A Electrical Service Panel Upgrades",
    speaker: "Master Electrician Institute",
    speakerTitle: "NEC Code Authority",
    youtubeId: "Xo284DSmZto",
    duration: "4:35",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "electrician",
    thumbnailUrl: "https://i.ytimg.com/vi/Xo284DSmZto/hqdefault.jpg",
    summary: "Step-by-step master electrician walkthrough of upgrading aging 100A panels to 200A/400A with whole-home surge suppression and EV charger capacity.",
    takeaways: [
      "Proper grounding electrode system (GES) bonding per NEC Article 250",
      "Load calculation worksheets for heat pumps and Level 2 EV charging",
      "Safe coordination with utility drop crews for hot service disconnects"
    ],
    tags: ["#ElectricalPanel", "#NEC2023", "#Grounding", "#Electrician"]
  },
  {
    id: "wheel-joinery-framing",
    serialPlate: "CLN-TRD03",
    title: "Master Carpenter Joinery & Heavy Timber Framing",
    speaker: "Craftsman Timber & Joinery",
    speakerTitle: "Master Joiner & Framer",
    youtubeId: "g6lcLQMy42E",
    duration: "4:48",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "carpenter",
    thumbnailUrl: "https://i.ytimg.com/vi/g6lcLQMy42E/hqdefault.jpg",
    summary: "Precision mortise and tenon timber framing, laser layout techniques for plumb shear walls, and custom architectural finish millwork.",
    takeaways: [
      "Tension and compression joint engineering in timber truss construction",
      "Laser transit leveling for framing straight walls over uneven slabs",
      "Moisture meter reading calibration before high-end hardwood installs"
    ],
    tags: ["#Carpentry", "#TimberFraming", "#Woodworking", "#FinishJoinery"]
  },
  {
    id: "wheel-pipe-welding",
    serialPlate: "CLN-TRD04",
    title: "Certified 6G Pipe Welding & Non-Destructive Testing",
    speaker: "American Welding Society (AWS) Masters",
    speakerTitle: "Certified Welding Inspector (CWI)",
    youtubeId: "VMCdHzpmy1I",
    duration: "5:15",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "pipefitter_welder",
    thumbnailUrl: "https://i.ytimg.com/vi/VMCdHzpmy1I/hqdefault.jpg",
    summary: "Mastering the 6G inclined pipe test with GTAW (TIG) root pass and SMAW (stick) fill and cap, passing 100% radiographic x-ray inspection.",
    takeaways: [
      "Feathering tack welds and managing keyhole penetration on schedule 80 pipe",
      "Interpass temperature control to prevent grain boundary embrittlement",
      "Passing AWS D1.1 and ASME Section IX hydrostatic pressure tests"
    ],
    tags: ["#PipeWelding", "#6GTest", "#AWS", "#TIGWelding", "#Metallurgy"]
  },
  {
    id: "wheel-hvac-commercial",
    serialPlate: "CLN-TRD05",
    title: "Commercial HVAC Blueprint & Chiller Diagnostics",
    speaker: "Advanced Mechanical Guild",
    speakerTitle: "HVAC/R Senior Superintendent",
    youtubeId: "Pe3n9-r8TP0",
    duration: "5:04",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "hvac_technician",
    thumbnailUrl: "https://i.ytimg.com/vi/Pe3n9-r8TP0/hqdefault.jpg",
    summary: "Reading complex MEP mechanical schematics, troubleshooting variable refrigerant flow (VRF) circuits, and EPA 608 universal compliance.",
    takeaways: [
      "Psychrometric chart analysis for commercial enthalpy optimization",
      "Superheat and subcooling verification on dual-stage compressor systems",
      "Building automation system (BAS) BACnet protocol commissioning"
    ],
    tags: ["#HVAC", "#CommercialRefrigeration", "#MEPBlueprints", "#EPA608"]
  },
  {
    id: "wheel-solar-interconnect",
    serialPlate: "CLN-TRD06",
    title: "Utility-Scale Solar PV Inverter & Grid Interconnection",
    speaker: "Clean Energy Electrical Engineers",
    speakerTitle: "Renewable Interconnection Lead",
    youtubeId: "RVITn9lWfOY",
    duration: "4:58",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "solar_installer",
    thumbnailUrl: "https://i.ytimg.com/vi/RVITn9lWfOY/hqdefault.jpg",
    summary: "Connecting multi-megawatt string inverters, rapid shutdown compliance, utility interconnect studies, and battery energy storage system (BESS) integration.",
    takeaways: [
      "NEC 690 and 705 grid-tied interconnect protection protocols",
      "Commissioning IEEE 1547 compliant anti-islanding relays",
      "BESS thermal runaway suppression and NFPA 855 life-safety integration"
    ],
    tags: ["#SolarEnergy", "#Inverters", "#GridInterconnect", "#CleanTech"]
  },
  {
    id: "wheel-osha30-fall",
    serialPlate: "CLN-CMP01",
    title: "OSHA 30 Jobsite Fall Protection & Subpart M Compliance",
    speaker: "Expedite Safety Directorate",
    speakerTitle: "Authorized OSHA 500 Instructor",
    youtubeId: "OWNXI09WI14",
    duration: "4:22",
    category: "compliance",
    categoryLabel: "Safety & Compliance",
    enclaveId: "trades_construction",
    thumbnailUrl: "https://i.ytimg.com/vi/OWNXI09WI14/hqdefault.jpg",
    summary: "Complete review of OSHA Subpart M requirements: 6-foot trigger height, 5,000-lb anchor points, daily harness inspection, and leading-edge guardrails.",
    takeaways: [
      "Calculating total fall clearance including deceleration distance and stretch",
      "Daily pre-shift inspection checklist for synthetic harnesses and lanyards",
      "Competent person site authority to stop work on unsafe scaffolds"
    ],
    tags: ["#OSHA30", "#FallProtection", "#SafetyCompliance", "#JobsiteSuperintendent"]
  },

  // ─── 2. AUTO, FLEET & TRANSPORT (auto_mechanics_transport) ────────
  {
    id: "wheel-heavy-diesel",
    serialPlate: "CLN-AUT01",
    title: "Heavy-Duty Commercial Diesel Diagnostics & J1939 CAN Bus",
    speaker: "Fleet Maintenance Technicians Guild",
    speakerTitle: "Master ASE Heavy Truck Specialist",
    youtubeId: "Xo284DSmZto",
    duration: "5:30",
    category: "auto",
    categoryLabel: "Auto & Heavy Fleet",
    enclaveId: "auto_mechanics_transport",
    professionId: "diesel_mechanic",
    thumbnailUrl: "https://i.ytimg.com/vi/Xo284DSmZto/hqdefault.jpg",
    summary: "Oscilloscope diagnostics on SAE J1939 powertrain CAN networks, DPF regeneration cycles, and high-pressure common rail fuel delivery troubleshooting.",
    takeaways: [
      "Isolating terminating resistor faults on 250k/500k baud CAN communication lines",
      "SCR/DEF NOx sensor calibration and aftertreatment derate recovery",
      "DOT annual out-of-service criteria for commercial air brake systems"
    ],
    tags: ["#DieselTech", "#J1939", "#FleetMaintenance", "#ASECertified", "#Aftertreatment"]
  },
  {
    id: "wheel-ev-high-voltage",
    serialPlate: "CLN-AUT02",
    title: "800V EV Battery Pack De-Energization & NFPA 790 Safety",
    speaker: "Advanced EV Powertrain Academy",
    speakerTitle: "High-Voltage Safety Director",
    youtubeId: "RVITn9lWfOY",
    duration: "5:10",
    category: "auto",
    categoryLabel: "Auto & Heavy Fleet",
    enclaveId: "auto_mechanics_transport",
    professionId: "ev_technician",
    thumbnailUrl: "https://i.ytimg.com/vi/RVITn9lWfOY/hqdefault.jpg",
    summary: "Safe isolation protocols for 400V/800V commercial electric vehicles, manual service disconnect (MSD) removal, and thermal runway suppression.",
    takeaways: [
      "Class 0 (1,000V rated) insulated gloves and CAT IV multimeter zero-voltage test",
      "Lockout/Tagout (LOTO) protocols for multi-pack electric buses and delivery trucks",
      "Contact resistance testing across lithium iron phosphate (LFP) busbars"
    ],
    tags: ["#ElectricVehicles", "#HighVoltage", "#NFPA790", "#BatteryDiagnostics", "#EVTech"]
  },

  // ─── 3. HEALTHCARE & MEDICINE (healthcare_medicine) ───────────────
  {
    id: "wheel-trauma-resuscitation",
    serialPlate: "CLN-MED01",
    title: "Level 1 Trauma Resuscitation & TNCC Primary Assessment",
    speaker: "Emergency Nurses Association (ENA)",
    speakerTitle: "Trauma Critical Care Specialist (TNCC/CCRN)",
    youtubeId: "VM8DODp68Oc",
    duration: "5:45",
    category: "health",
    categoryLabel: "Healthcare & Clinical",
    enclaveId: "healthcare_medicine",
    professionId: "trauma_nurse",
    thumbnailUrl: "https://i.ytimg.com/vi/VM8DODp68Oc/hqdefault.jpg",
    summary: "Systematic rapid trauma assessment: airway with cervical spine restriction, rapid infuser protocols, massive transfusion activation, and closed-loop communication.",
    takeaways: [
      "A-to-I systematic primary survey under high-acuity resuscitation",
      "TEG-guided massive transfusion protocol (1:1:1 PRBC, FFP, platelets)",
      "Continuous capnography interpretation during emergency intubation"
    ],
    tags: ["#TraumaNursing", "#TNCC", "#CriticalCare", "#EmergencyMedicine", "#ACLS"]
  },
  {
    id: "wheel-surgical-asepsis",
    serialPlate: "CLN-MED02",
    title: "Operating Room Sterile Field & Infection Prevention Standards",
    speaker: "Association of periOperative Registered Nurses (AORN)",
    speakerTitle: "Surgical Services Clinical Director",
    youtubeId: "FZNCce1spHQ",
    duration: "4:50",
    category: "health",
    categoryLabel: "Healthcare & Clinical",
    enclaveId: "healthcare_medicine",
    professionId: "surgical_technologist",
    thumbnailUrl: "https://i.ytimg.com/vi/FZNCce1spHQ/hqdefault.jpg",
    summary: "Strict environmental controls in laminar flow surgical suites, surgical scrub rub timing, drape barriers, and maintaining sterile boundaries.",
    takeaways: [
      "Positive pressure airflow maintenance and door-opening minimization",
      "Sterility maintenance when draping robotic surgical arms",
      "Immediate corrective action for intraoperative micro-perforations"
    ],
    tags: ["#SurgicalTech", "#AORN", "#InfectionControl", "#OperatingRoom", "#Perioperative"]
  },

  // ─── 4. CYBERSECURITY & INFOSEC (tech_cybersecurity) ──────────────
  {
    id: "wheel-red-team-lateral",
    serialPlate: "CLN-SEC01",
    title: "Active Directory Lateral Movement & Kerberos Defense",
    speaker: "Offensive Security Guild",
    speakerTitle: "Principal Red Team Architect (OSCP/CRTO)",
    youtubeId: "RkmWCI-JtL8",
    duration: "5:15",
    category: "security",
    categoryLabel: "Cybersecurity & Infosec",
    enclaveId: "tech_cybersecurity",
    professionId: "red_team_operator",
    thumbnailUrl: "https://i.ytimg.com/vi/RkmWCI-JtL8/hqdefault.jpg",
    summary: "Deep dive into Kerberoasting, AS-REP roasting, BloodHound graph analysis, and defensive Tiered Administrative Model isolation in enterprise enclaves.",
    takeaways: [
      "Enforcing AES-256 Kerberos ticket encryption and 25+ character service account passwords",
      "Deploying honeypot SPNs to detect automated reconnaissance within seconds",
      "Implementing Protected Users security groups to eliminate credential caching"
    ],
    tags: ["#RedTeam", "#ActiveDirectory", "#Kerberos", "#CyberDefense", "#ZeroTrust"]
  },
  {
    id: "wheel-scada-ics-defense",
    serialPlate: "CLN-SEC02",
    title: "Critical Infrastructure SCADA/ICS Air-Gap Security",
    speaker: "Industrial Cyber Defense Institute",
    speakerTitle: "Operational Technology (OT) Security Lead",
    youtubeId: "Tsok2MiPtHY",
    duration: "5:00",
    category: "security",
    categoryLabel: "Cybersecurity & Infosec",
    enclaveId: "tech_cybersecurity",
    professionId: "ot_security_engineer",
    thumbnailUrl: "https://i.ytimg.com/vi/Tsok2MiPtHY/hqdefault.jpg",
    summary: "Purdue Model architecture, unidirectional security gateways (data diodes), and defending Modbus/DNP3 programmable logic controllers from network tampering.",
    takeaways: [
      "Level 0–3 Purdue model segmentation via hardware unidirectional data diodes",
      "Detecting anomalous PLC ladder logic writes without interrupting plant operations",
      "Air-gapped firmware signature verification and supply chain validation"
    ],
    tags: ["#SCADA", "#ICS", "#CriticalInfrastructure", "#OperationalTechnology", "#DataDiodes"]
  },

  // ─── 5. SOFTWARE & CLOUD ENGINEERING (tech_software) ───────────────
  {
    id: "wheel-distributed-consensus",
    serialPlate: "CLN-DEV01",
    title: "Distributed Consensus, Raft & Event-Driven Microservices",
    speaker: "Cloud Architecture Council",
    speakerTitle: "Staff Distributed Systems Engineer",
    youtubeId: "3zmzQgWs-YI",
    duration: "5:40",
    category: "tech",
    categoryLabel: "Software & Cloud",
    enclaveId: "tech_software",
    professionId: "distributed_systems_eng",
    thumbnailUrl: "https://i.ytimg.com/vi/3zmzQgWs-YI/hqdefault.jpg",
    summary: "Mechanics of leader election, log replication, and partition tolerance in Raft clusters, combined with idempotent Kafka event streams.",
    takeaways: [
      "Why quorum size (N/2 + 1) guarantees linearized reads during network partitions",
      "Designing idempotent consumer pipelines using transactional outbox tables",
      "Mitigating split-brain states with lease-based cluster orchestration"
    ],
    tags: ["#DistributedSystems", "#RaftConsensus", "#Microservices", "#Kafka", "#HighScale"]
  },
  {
    id: "wheel-k8s-production",
    serialPlate: "CLN-DEV02",
    title: "Production Kubernetes Hardening & eBPF Observability",
    speaker: "Cloud Native Computing Guild",
    speakerTitle: "Principal Platform SRE",
    youtubeId: "zM61V4PuQ8w",
    duration: "4:55",
    category: "tech",
    categoryLabel: "Software & Cloud",
    enclaveId: "tech_software",
    professionId: "devops_platform_eng",
    thumbnailUrl: "https://i.ytimg.com/vi/zM61V4PuQ8w/hqdefault.jpg",
    summary: "Implementing Cilium eBPF network security policies, zero-privilege pod security standards (PSS), and real-time kernel-level syscall tracing.",
    takeaways: [
      "Eliminating iptables overhead by switching to eBPF socket-level proxy routing",
      "Enforcing Restricted Pod Security Standards to block root escalations",
      "Automated canary deployments with Istio service mesh and Prometheus metrics"
    ],
    tags: ["#Kubernetes", "#eBPF", "#Cilium", "#CloudNative", "#PlatformEngineering"]
  },

  // ─── 6. FINANCE, ACCOUNTING & TREASURY (finance_accounting) ─────────
  {
    id: "wheel-deposit-ins",
    serialPlate: "CLN-EXP01",
    title: "Deposit Insurance & Liquidity Safeguards",
    speaker: "Expedite Consults Financial Advisory",
    speakerTitle: "Treasury & Risk Management",
    youtubeId: "VM8DODp68Oc",
    duration: "4:52",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    enclaveId: "finance_accounting",
    professionId: "corporate_treasurer",
    thumbnailUrl: "https://i.ytimg.com/vi/VM8DODp68Oc/hqdefault.jpg",
    summary: "Comprehensive guide to FDIC, DIF, and private commercial deposit insurance limits, sweep accounts, and protecting business operating liquidity.",
    takeaways: [
      "Understand the $250,000 baseline per depositor per ownership category",
      "How multi-institution CDARS/ICS sweeps protect balances up to $50M",
      "Mitigating counterparty exposure for contractor payroll reserves"
    ],
    tags: ["#DepositInsurance", "#Treasury", "#RiskManagement", "#PayrollSecurity"]
  },
  {
    id: "wheel-broker-adviser",
    serialPlate: "CLN-EXP02",
    title: "Broker vs. Investment Adviser: Fiduciary Standard",
    speaker: "Expedite Consults Corporate Counsel",
    speakerTitle: "Fiduciary Compliance Practice",
    youtubeId: "FZNCce1spHQ",
    duration: "4:15",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    enclaveId: "finance_accounting",
    professionId: "investment_fiduciary",
    thumbnailUrl: "https://i.ytimg.com/vi/FZNCce1spHQ/hqdefault.jpg",
    summary: "Clear legal breakdown of the suitability standard governing broker-dealers versus the strict fiduciary duty binding registered investment advisers (RIAs).",
    takeaways: [
      "Fiduciary duty legally requires putting the client's interests first at all times",
      "Suitability standard only requires reasonable suitability at the time of sale",
      "Fee-only vs commission-based advisory compensation disclosure"
    ],
    tags: ["#FiduciaryDuty", "#InvestmentAdviser", "#BrokerDealer", "#Compliance"]
  },
  {
    id: "wheel-life-insurance",
    serialPlate: "CLN-EXP03",
    title: "Understanding Business & Key-Person Insurance",
    speaker: "Expedite Consults Underwriting",
    speakerTitle: "Enterprise Risk Solutions",
    youtubeId: "zM61V4PuQ8w",
    duration: "5:08",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    enclaveId: "finance_accounting",
    thumbnailUrl: "https://i.ytimg.com/vi/zM61V4PuQ8w/hqdefault.jpg",
    summary: "Structuring key-person life insurance, buy-sell agreements, and executive term policies to ensure uninterrupted business continuity.",
    takeaways: [
      "How key-person insurance protects bank lines of credit and bonding capacity",
      "Funding cross-purchase buy-sell agreements among business partners",
      "Tax treatment of corporate life insurance premiums vs benefit proceeds"
    ],
    tags: ["#KeyPersonInsurance", "#BusinessContinuity", "#BuySell", "#CommercialCoverage"]
  },
  {
    id: "wheel-free-tax-prep",
    serialPlate: "CLN-EXP04",
    title: "Tax Credits, Section 179 & Contractor Write-Offs",
    speaker: "Expedite Tax Intelligence",
    speakerTitle: "Corporate Tax Strategist",
    youtubeId: "3zmzQgWs-YI",
    duration: "4:40",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    enclaveId: "finance_accounting",
    thumbnailUrl: "https://i.ytimg.com/vi/3zmzQgWs-YI/hqdefault.jpg",
    summary: "Maximizing Section 179 depreciation for heavy machinery, tool write-offs, mileage tracking, and qualifying for federal clean energy commercial credits.",
    takeaways: [
      "Immediate 100% write-offs for capital equipment under Section 179",
      "Segregating personal and business vehicle mileage for IRS audit defense",
      "State-specific pass-through entity (PTE) tax credits"
    ],
    tags: ["#Section179", "#TaxDeductions", "#TradeMachinery", "#IRSCompliance"]
  },
  {
    id: "wheel-loan-approval",
    serialPlate: "CLN-EXP05",
    title: "The Commercial Loan Underwriting Process",
    speaker: "Expedite Lending Desk",
    speakerTitle: "Commercial Credit Syndicate",
    youtubeId: "RkmWCI-JtL8",
    duration: "5:12",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    enclaveId: "finance_accounting",
    thumbnailUrl: "https://i.ytimg.com/vi/RkmWCI-JtL8/hqdefault.jpg",
    summary: "Behind-the-scenes view of credit committees: Debt Service Coverage Ratio (DSCR), personal guarantees, and building an unassailable loan package.",
    takeaways: [
      "Targeting a minimum 1.25x DSCR for commercial lines of credit",
      "Presenting audited work-in-progress (WIP) schedules to bank underwriters",
      "SBA 7(a) vs 504 financing for contractor real estate acquisition"
    ],
    tags: ["#CommercialLending", "#DSCR", "#Underwriting", "#CreditLines"]
  },

  // ─── 7. LAW, GOVERNMENT & DEFENSE (law_gov_defense) ───────────────
  {
    id: "wheel-cmmc-compliance",
    serialPlate: "CLN-LAW01",
    title: "DoD CMMC 2.0 Level 2 Cybersecurity Compliance",
    speaker: "Defense Contractors Council",
    speakerTitle: "CMMC Certified Assessor (CCA)",
    youtubeId: "FZNCce1spHQ",
    duration: "5:25",
    category: "gov",
    categoryLabel: "Law, Gov & Defense",
    enclaveId: "law_gov_defense",
    professionId: "defense_contractor",
    thumbnailUrl: "https://i.ytimg.com/vi/FZNCce1spHQ/hqdefault.jpg",
    summary: "Navigating the 110 NIST SP 800-171 controls required for CMMC Level 2, protecting Controlled Unclassified Information (CUI) in GovCloud.",
    takeaways: [
      "Defining the CUI boundary to minimize audit scope and compliance costs",
      "Mandatory FIPS 140-3 validated encryption for data in transit and at rest",
      "Documenting System Security Plans (SSP) and Plans of Action & Milestones (POAMs)"
    ],
    tags: ["#CMMC2", "#DoDContracting", "#NIST800171", "#GovCon", "#DefenseIndustrialBase"]
  },

  // ─── 8. AGRI, FOOD & NATURAL RESOURCES (agriculture_natural_resources)
  {
    id: "wheel-precision-agronomy",
    serialPlate: "CLN-AGR01",
    title: "Precision Agronomy & Variable Rate Soil Telematics",
    speaker: "Regenerative Agriculture Institute",
    speakerTitle: "Senior Precision Agronomist",
    youtubeId: "Pe3n9-r8TP0",
    duration: "5:00",
    category: "agri",
    categoryLabel: "Agri & Natural Resources",
    enclaveId: "agriculture_natural_resources",
    professionId: "precision_agronomist",
    thumbnailUrl: "https://i.ytimg.com/vi/Pe3n9-r8TP0/hqdefault.jpg",
    summary: "Utilizing multispectral satellite imagery, RTK GPS auto-steer, and electroconductivity soil mapping to optimize nitrogen and phosphorus application.",
    takeaways: [
      "EC zone mapping to identify cation-exchange capacity variations across fields",
      "Prescription maps for variable-rate seeders and automated sprayer boom shutoffs",
      "Soil organic matter (SOM) regeneration metrics for carbon credit verification"
    ],
    tags: ["#PrecisionAg", "#Agronomy", "#SoilHealth", "#SmartFarming", "#AgTech"]
  },

  // ─── 9. CULINARY, EVENTS & HOSPITALITY (culinary_hospitality_services)
  {
    id: "wheel-haccp-culinary",
    serialPlate: "CLN-CUL01",
    title: "Commercial Kitchen HACCP Plan & Cold-Chain Safety",
    speaker: "Culinary Masters Guild",
    speakerTitle: "Certified Executive Chef (CEC)",
    youtubeId: "g6lcLQMy42E",
    duration: "4:45",
    category: "culinary",
    categoryLabel: "Culinary & Hospitality",
    enclaveId: "culinary_hospitality_services",
    professionId: "executive_chef",
    thumbnailUrl: "https://i.ytimg.com/vi/g6lcLQMy42E/hqdefault.jpg",
    summary: "Developing FDA-compliant Hazard Analysis Critical Control Points (HACCP) for sous-vide, vacuum packaging, and high-volume banquet production.",
    takeaways: [
      "Monitoring Critical Control Point (CCP) logs with calibrated digital dataloggers",
      "Blast chilling protocols: cooling from 135°F to 41°F within 6 hours",
      "Allergen cross-contact separation in commercial production lines"
    ],
    tags: ["#ExecutiveChef", "#HACCP", "#FoodSafety", "#CommercialKitchen", "#Hospitality"]
  },

  // ─── 10. BEAUTY, WELLNESS & FITNESS (beauty_wellness_fitness) ──────
  {
    id: "wheel-athletic-force",
    serialPlate: "CLN-WEL01",
    title: "Biomechanical Force Curve Conditioning & Injury Prevention",
    speaker: "National Strength & Conditioning Institute",
    speakerTitle: "Lead Performance Physiologist (CSCS)",
    youtubeId: "OWNXI09WI14",
    duration: "5:10",
    category: "wellness",
    categoryLabel: "Beauty & Wellness",
    enclaveId: "beauty_wellness_fitness",
    professionId: "strength_coach",
    thumbnailUrl: "https://i.ytimg.com/vi/OWNXI09WI14/hqdefault.jpg",
    summary: "Periodization models, velocity-based training (VBT) with linear transducers, and correcting asymmetric force production in elite athletes.",
    takeaways: [
      "Using bar velocity meters to adjust daily training loads based on central fatigue",
      "Eccentric overload protocols for patellar and hamstring tendon remodeling",
      "Dynamic warm-up sequencing that activates glute medius and scapular stabilizers"
    ],
    tags: ["#StrengthAndConditioning", "#CSCS", "#Kinesiology", "#InjuryPrevention", "#Fitness"]
  },

  // ─── 11. CREATIVE ARTS, MEDIA & DESIGN (creative_arts_media) ────────
  {
    id: "wheel-cinematic-lighting",
    serialPlate: "CLN-ART01",
    title: "Cinematic Lighting Ratios & ACES Color Pipeline",
    speaker: "American Cinematographers Circle",
    speakerTitle: "Director of Photography (DP)",
    youtubeId: "VMCdHzpmy1I",
    duration: "5:05",
    category: "creative",
    categoryLabel: "Creative Arts & Media",
    enclaveId: "creative_arts_media",
    professionId: "cinematographer",
    thumbnailUrl: "https://i.ytimg.com/vi/VMCdHzpmy1I/hqdefault.jpg",
    summary: "Sculpting light with negative fill, softbox grids, false color exposure for skin tones, and mastering the ACES linear color grading workflow.",
    takeaways: [
      "Exposing skin tones between 42 and 55 IRE on false color monitors",
      "Creating depth with 4:1 key-to-fill ratios and subtle rim lighting",
      "Preserving wide color gamut using ACEScc in DaVinci Resolve color suites"
    ],
    tags: ["#Cinematography", "#LightingDesign", "#ColorGrading", "#ACES", "#Filmmaking"]
  },

  // ─── 12. HIGHER ED, CAMPUS & RESEARCH (higher_ed_campus) ───────────
  {
    id: "wheel-grant-writing",
    serialPlate: "CLN-RES01",
    title: "NIH & NSF Major Federal Research Grant Architecture",
    speaker: "University Research Directorate",
    speakerTitle: "Principal Investigator & Grant Reviewer",
    youtubeId: "VM8DODp68Oc",
    duration: "5:35",
    category: "campus",
    categoryLabel: "Higher Ed & Campus",
    enclaveId: "higher_ed_campus",
    professionId: "university_researcher",
    thumbnailUrl: "https://i.ytimg.com/vi/VM8DODp68Oc/hqdefault.jpg",
    summary: "Structuring winning Specific Aims pages, preliminary data validation, institutional resource justification, and addressing peer review critiques.",
    takeaways: [
      "Structuring the 1-page Specific Aims document with hook, hypothesis, and aims",
      "Addressing reproducibility and rigor requirements for federal reviewers",
      "Formulating realistic multi-year research project personnel budgets"
    ],
    tags: ["#AcademicResearch", "#GrantWriting", "#NIHGrants", "#NSF", "#HigherEd"]
  }
]

export const ONBOARDING_GUIDE_CHAPTERS: OnboardingGuideChapter[] = [
  {
    id: "ch-enclaves",
    stepNumber: 1,
    title: "Least-Privilege Need-to-Know Enclaves",
    subtitle: "Complete professional isolation and verified trade integrity",
    description: "ConnectIn organizes your professional universe into 12 verified Need-to-Know enclaves. Trade specifications, blueprints, and bids never leak into software sandboxes, and corporate tech jargon stays out of your jobsite workspace.",
    youtubeId: "VM8DODp68Oc",
    duration: "1:45",
    targetTab: "home",
    featureActionLabel: "Auditor Switcher: Test Multi-Enclave View",
    highlights: [
      "12 Verified Professional Disciplines (Trades, Tech, Healthcare, GovCloud, Legal)",
      "Strict data segregation: software developers never see subcontractor bids",
      "Super Admin Auditor Switcher allows cross-discipline multi-highlight viewing"
    ]
  },
  {
    id: "ch-resume",
    stepNumber: 2,
    title: "AI Resume Auto-Builder & Instant Workspace Experience",
    subtitle: "Upload PDF or DOCX to build your career timeline in seconds",
    description: "Skip tedious profile typing. ConnectIn's AI Resume Parser extracts your exact job titles, employers, date ranges, and verified skills, and immediately persists them directly into your Workspace Experience tab with one click.",
    youtubeId: "FZNCce1spHQ",
    duration: "1:30",
    targetTab: "profile",
    featureActionLabel: "Open AI Resume Upload Modal",
    highlights: [
      "PDF, DOCX, and raw text extraction powered by specialized parsing NLP",
      "1-click 'Save & Apply to My Profile Experience'",
      "Automatic return to your workspace with smooth scroll to your new roles"
    ]
  },
  {
    id: "ch-workspaces",
    stepNumber: 3,
    title: "4 Dedicated Active Workspaces",
    subtitle: "Switch between Personal, Enterprise, Creator & Seller personas",
    description: "A single professional wears multiple hats. ConnectIn gives you four completely independent workspaces: Personal for individual networking, Enterprise for procurement & RFPs, Creator for publishing & reels, and Seller for marketplace storefronts.",
    youtubeId: "zM61V4PuQ8w",
    duration: "2:00",
    targetTab: "profile",
    featureActionLabel: "Open Persona Switcher",
    highlights: [
      "Personal: Identity card, vouches, peer recommendations and career timeline",
      "Enterprise: Corporate bidding, verified subcontractor RFPs and ISO/SOC 2 trust",
      "Creator & Seller: Monetized course storefronts, advisory hours and reels"
    ]
  },
  {
    id: "ch-vibe",
    stepNumber: 4,
    title: "Vibe AI Global Assistant & Campus Intelligence",
    subtitle: "Instant interactive Q&A, trade specs, and policy answers",
    description: "Ask Vibe AI anything across all 12 disciplines. Get instant code snippets, OSHA compliance regulations, electrical load calculations, or university campus policies without searching through thousands of pages.",
    youtubeId: "3zmzQgWs-YI",
    duration: "1:15",
    targetTab: "vibe",
    featureActionLabel: "Launch Vibe AI Assistant",
    highlights: [
      "Voice & text interactive intelligence tuned for trades and enterprise IAM",
      "Context-aware answers referencing your active enclave and workspace",
      "Direct action buttons to draft RFPs, create polls, or launch courses"
    ]
  },
  {
    id: "ch-sharing",
    stepNumber: 5,
    title: "Multi-Social 1-Click Sharing & Public Verification",
    subtitle: "Distribute your credentials and posts across WhatsApp, X, Facebook & IG",
    description: "Share your professional accomplishments, jobsite milestones, or profile card instantly with verified direct links to WhatsApp, Facebook, X (Twitter), LinkedIn, Instagram, and Email.",
    youtubeId: "RkmWCI-JtL8",
    duration: "1:20",
    targetTab: "home",
    featureActionLabel: "Explore Post Sharing",
    highlights: [
      "1-click WhatsApp messaging to subcontractor crews and business partners",
      "Branded public credentials preview card for social feeds",
      "Quick link copy with clipboard feedback and audit timestamp"
    ]
  }
]
