export type HarvesterDestination = "home" | "jobs" | "market" | "media" | "pulse"

export interface HarvestedMediaItem {
  id: string
  serialNumber: string
  kind: "video" | "picture"
  title: string
  summary: string
  videoUrl?: string
  youtubeId?: string
  imageUrl: string
  authorName: string
  authorRole: string
  authorAvatar: string
  organization: string
  enclaveId: string
  category: string
  duration?: string
  destinations: HarvesterDestination[]
  pulledAtIso: string
  pulledAtLabel: string
  minuteSlot: number
  sourceFeed: string
  viewsCount: number
  likesCount: number
  jobMeta?: {
    roleTitle: string
    company: string
    location: string
    salary: string
    employmentType: string
  }
  marketMeta?: {
    productName: string
    vendor: string
    price: string
    category: string
    liveUrl: string
  }
  pulseMeta?: {
    severityOrTag: string
    sourceName: string
    takeaway: string
  }
}

export interface HarvesterFeedConnector {
  id: string
  name: string
  category: string
  protocol: string
  cadence: string
  status: "ACTIVE" | "STANDBY"
  itemsPulledToday: number
  lastPulledTitle: string
}

export interface HarvesterTelemetrySnapshot {
  totalVideosAllTime: number
  totalPicturesAllTime: number
  pulledTodayCount: number
  dailyGrowthRate: number
  minutesElapsedToday: number
  currentMinuteSlot: number
  lastPulledAtIso: string
  lastPulledAtLabel: string
  destinationCounts: Record<HarvesterDestination, number>
  connectors: HarvesterFeedConnector[]
  items: HarvestedMediaItem[]
}

export const HARVESTER_STORAGE_KEY = "connectln_harvested_media_items_v5"
export const HARVESTER_AUTO_ENABLED_KEY = "connectln_harvester_auto_enabled_v1"
export const HARVESTER_EVENT_NAME = "connectln-media-harvested"

// Exclusive brand-new oEmbed-verified YouTube IDs reserved ONLY for the 60-Minute Admin Media Harvester
// (Never used on Home static sections, Jobs, Alerts, Learn, Wheel, or Media static catalogs)
export const EXCLUSIVE_NEW_HARVESTER_YOUTUBE_IDS = new Set<string>([
  "aLq3O3l2LF4",
  "wND9goxDVrY",
  "78U-D263bKE",
  "tu_Cg6L1f7s",
  "hfH5RYeAYfw",
  "AVoqcPa-wVw",
  "RqPTRQksFlw",
  "4ChaCgOkFI0",
  "9ZgCmq1jXT8",
  "ZbYGVzktneY",
])

// Reference epoch (Jan 1, 2026 00:00 UTC) so total platform video count grows every minute of every day
const PLATFORM_HARVESTER_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0)

interface SeedMediaTemplate {
  kind: "video" | "picture"
  title: string
  summary: string
  videoUrl?: string
  youtubeId?: string
  imageUrl: string
  authorName: string
  authorRole: string
  authorAvatar: string
  organization: string
  enclaveId: string
  category: string
  duration?: string
  sourceFeed: string
  jobMeta: {
    roleTitle: string
    company: string
    location: string
    salary: string
    employmentType: string
  }
  marketMeta: {
    productName: string
    vendor: string
    price: string
    category: string
    liveUrl: string
  }
  pulseMeta: {
    severityOrTag: string
    sourceName: string
    takeaway: string
  }
}

export const CONNECTLN_HARVESTER_TEMPLATES: SeedMediaTemplate[] = [
  {
    kind: "video",
    title: "Cilium Kubernetes CNI & eBPF Kernel Packet Telemetry: Zero-Trust Cluster Networking & Runtime Defense",
    summary:
      "Technical walkthrough of eBPF kernel-space datapath routing, Cilium CNI cluster installation, and identity-aware network policy enforcement in production Kubernetes.",
    youtubeId: "aLq3O3l2LF4",
    imageUrl: "https://i.ytimg.com/vi/aLq3O3l2LF4/hqdefault.jpg",
    authorName: "Dr. Marcus Vance · Cloud Native & eBPF Lab",
    authorRole: "Principal eBPF & Kubernetes Runtime Security Architect",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
    organization: "Expedite Strike Cyber Defense",
    enclaveId: "tech_cybersecurity",
    category: "Cybersecurity & eBPF",
    duration: "14:22",
    sourceFeed: "Admin 60-Min eBPF & Kernel Wire",
    jobMeta: {
      roleTitle: "Principal eBPF & Kubernetes Runtime Security Engineer",
      company: "Expedite Consults · Zero-Trust Division",
      location: "Remote / Washington, D.C.",
      salary: "$215,000 – $260,000",
      employmentType: "Full-time · Direct Hire",
    },
    marketMeta: {
      productName: "DSTRIKE eBPF Kernel Sensor Suite",
      vendor: "Expedite Consults",
      price: "$499/mo",
      category: "Cybersecurity",
      liveUrl: "https://www.dstrike.app",
    },
    pulseMeta: {
      severityOrTag: "KERNEL DEFENSE BRIEFING",
      sourceName: "ConnectLn Cyber Wire",
      takeaway: "eBPF XDP socket filters eliminate 99.4% of unauthenticated East-West container probes before TCP handshake completion.",
    },
  },
  {
    kind: "video",
    title: "Boston Dynamics Spot Quadruped Robotics: Autonomous Jobsite LiDAR Scanning & BIM Progress Telemetry",
    summary:
      "Live field testing of Spot quadruped robotics navigating active multi-story construction sites to capture millimeter-accurate LiDAR point clouds and structural BIM progress.",
    youtubeId: "wND9goxDVrY",
    imageUrl: "https://i.ytimg.com/vi/wND9goxDVrY/hqdefault.jpg",
    authorName: "Gus Vandermeer, PE · Field Robotics Lead",
    authorRole: "Principal Structural & Autonomous Jobsite Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    organization: "Cascade Structural & Robotics Guild",
    enclaveId: "trades_construction",
    category: "Jobsite Robotics & BIM",
    duration: "03:48",
    sourceFeed: "Admin 60-Min Jobsite Robotics Wire",
    jobMeta: {
      roleTitle: "Autonomous Jobsite Robotics & BIM Field Superintendent",
      company: "Cascade Structural & Turner Construction",
      location: "Seattle, WA · Hybrid Field",
      salary: "$148,000 – $182,000",
      employmentType: "Full-time · Field Engineering",
    },
    marketMeta: {
      productName: "DeskNote Field BIM & LiDAR Takeoff Pack",
      vendor: "DeskNote Official",
      price: "$89/mo",
      category: "Software",
      liveUrl: "https://desk-note.app/",
    },
    pulseMeta: {
      severityOrTag: "FIELD ENGINEERING DISPATCH",
      sourceName: "ConnectLn Trades Wire",
      takeaway: "Autonomous quadruped LiDAR sweeps reduce commercial structural inspection turnaround from 3 days to 45 minutes.",
    },
  },
  {
    kind: "video",
    title: "High-Voltage Substation Transformer Commissioning: Professional Tan Delta & Insulation Power Factor Testing",
    summary:
      "Step-by-step high-voltage substation field commissioning performing a Tan Delta dielectric dissipation factor test across HV/LV transformer bushings.",
    youtubeId: "78U-D263bKE",
    imageUrl: "https://i.ytimg.com/vi/78U-D263bKE/hqdefault.jpg",
    authorName: "AM Electrical Concepts · NETA Level IV",
    authorRole: "Chief High-Voltage Substation & Relay Testing Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
    organization: "National High-Voltage Substation Enclave",
    enclaveId: "energy_utilities_environment",
    category: "High-Voltage Substation & Grid",
    duration: "11:15",
    sourceFeed: "Admin 60-Min High-Voltage Power Wire",
    jobMeta: {
      roleTitle: "NETA Level III/IV High-Voltage Substation Commissioning Engineer",
      company: "Quanta Power & National Grid Services",
      location: "Houston, TX / Nationwide Travel",
      salary: "$145,000 – $192,000 + Per Diem",
      employmentType: "Full-time · Utility Power",
    },
    marketMeta: {
      productName: "NETA Substation Tan Delta & Relay Test Compliance Suite",
      vendor: "SkillHands Field Pro",
      price: "$79/mo",
      category: "Software",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "GRID COMMISSIONING BRIEF",
      sourceName: "ConnectLn Power & Utilities Wire",
      takeaway: "Automated 10kV Tan Delta bushing capacitance trending detects early moisture ingress 18 months before dielectric flashover.",
    },
  },
  {
    kind: "video",
    title: "Da Vinci Robotic Surgical System: Intraoperative Clinical Telemetry, Wristed Articulation & Surgeon Console Ops",
    summary:
      "Inside the operating room examining Da Vinci robotic surgical console ergonomics, tremor filtration, 3D HD endoscopic vision, and clinical biomed maintenance.",
    youtubeId: "tu_Cg6L1f7s",
    imageUrl: "https://i.ytimg.com/vi/tu_Cg6L1f7s/hqdefault.jpg",
    authorName: "Dr. Elena Rostova, MD, FACS",
    authorRole: "Attending Robotic & Minimally Invasive Trauma Surgeon",
    authorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=240&auto=format&fit=crop&q=80",
    organization: "Metro Level-1 Robotic Surgical Center",
    enclaveId: "healthcare_medicine",
    category: "Robotic Surgery & MedTech",
    duration: "06:40",
    sourceFeed: "Admin 60-Min Clinical MedTech Wire",
    jobMeta: {
      roleTitle: "Attending Robotic Surgeon & Clinical MedTech Director",
      company: "Metro Level-1 Trauma & Surgical Center",
      location: "Boston, MA · Clinical On-Site",
      salary: "$480,000 – $620,000",
      employmentType: "Full-time · Physician",
    },
    marketMeta: {
      productName: "Clinical Triage & HIPAA Surgical Telemetry Hub",
      vendor: "MedSphere Clinical Systems",
      price: "$650/mo",
      category: "Solutions",
      liveUrl: "https://conectln.com",
    },
    pulseMeta: {
      severityOrTag: "CLINICAL ADVANCEMENT",
      sourceName: "ConnectLn Medical Enclave",
      takeaway: "Robotic 7-degree-of-freedom EndoWrist instrumentation reduces post-operative ICU stay duration by 31%.",
    },
  },
  {
    kind: "video",
    title: "Commercial Solar Microgrid & LFP Battery Energy Storage Commissioning: Peak Shaving & Islanding Telemetry",
    summary:
      "Real-world commercial solar PV and lithium-iron-phosphate (LFP) battery storage integration analyzing inverter load shifting, grid islanding, and ROI telemetry.",
    youtubeId: "hfH5RYeAYfw",
    imageUrl: "https://i.ytimg.com/vi/hfH5RYeAYfw/hqdefault.jpg",
    authorName: "Carlos Mendez, NABCEP · McCaskie Energy",
    authorRole: "Lead Commercial Solar & BESS Microgrid Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
    organization: "SunGrid Commercial Microgrids",
    enclaveId: "energy_utilities_environment",
    category: "Solar & BESS Microgrids",
    duration: "08:54",
    sourceFeed: "Admin 60-Min Renewable Grid Wire",
    jobMeta: {
      roleTitle: "Lead Commercial Solar PV & BESS Microgrid Commissioning Engineer",
      company: "SunGrid Utility Microgrids",
      location: "Austin, TX · Regional Travel",
      salary: "$135,000 – $168,000",
      employmentType: "Full-time · Energy Infrastructure",
    },
    marketMeta: {
      productName: "GridPulse SCADA & Solar Inverter Diagnostic Kit",
      vendor: "SunGrid Engineering",
      price: "$290/mo",
      category: "Software",
      liveUrl: "https://conectln.com",
    },
    pulseMeta: {
      severityOrTag: "GRID INFRASTRUCTURE",
      sourceName: "Energy & Utilities Wire",
      takeaway: "Pairing commercial solar arrays with hybrid LFP battery banks increases on-site self-consumption from 38% to 84%.",
    },
  },
  {
    kind: "picture",
    title: "Semiconductor Cleanroom Lithography & Sub-2nm Wafer Metrology Architecture",
    summary:
      "High-resolution cleanroom visual inspection of extreme ultraviolet (EUV) wafer alignment optics and automated FOUP transport rails.",
    imageUrl: "/images/connectln-studies/semiconductor-cleanroom-cover.jpg",
    authorName: "Dr. Kenji Takahashi",
    authorRole: "VP of Foundry Lithography & Yield Engineering",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
    organization: "Apex Silicon Fab Consortium",
    enclaveId: "manufacturing_industrial",
    category: "Semiconductor & Fab Ops",
    sourceFeed: "Admin 60-Min Cleanroom Photo Wire",
    jobMeta: {
      roleTitle: "Senior EUV Lithography & Cleanroom Process Engineer",
      company: "Apex Silicon Fab Consortium",
      location: "Phoenix, AZ · On-site Fab",
      salary: "$175,000 – $220,000",
      employmentType: "Full-time · Direct Hire",
    },
    marketMeta: {
      productName: "Cleanroom Telemetry & Yield Analytics Suite",
      vendor: "Sphera Industrial Labs",
      price: "$750/mo",
      category: "Enterprise",
      liveUrl: "https://expediteconsults.com",
    },
    pulseMeta: {
      severityOrTag: "FAB METROLOGY REPORT",
      sourceName: "Semiconductor Manufacturing Wire",
      takeaway: "Real-time interferometric wafer stage calibration boosts 2nm gate-all-around (GAA) die yield by 8.3%.",
    },
  },
  {
    kind: "video",
    title: "Enterprise SOC Operations: SIEM Log Correlation, Active Threat Hunting & Incident Containment Playbooks",
    summary:
      "Inside Tier-3 Security Operations Center workflows covering SIEM correlation rules, EDR telemetry triage, MITRE ATT&CK threat hunting, and rapid host isolation.",
    youtubeId: "AVoqcPa-wVw",
    imageUrl: "https://i.ytimg.com/vi/AVoqcPa-wVw/hqdefault.jpg",
    authorName: "Hannah Boateng, CISSP · HATKRS Cyber",
    authorRole: "Principal SOC Commander & Threat Hunter",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80",
    organization: "Aagiis Federal Compliance & SOC",
    enclaveId: "tech_cybersecurity",
    category: "SOC & Threat Hunting",
    duration: "12:18",
    sourceFeed: "Admin 60-Min Federal SOC Video Wire",
    jobMeta: {
      roleTitle: "Principal SOC Incident Commander & DoD RMF Lead",
      company: "Aagiis Federal Solutions",
      location: "Reston, VA / Hybrid Clearance",
      salary: "$190,000 – $235,000",
      employmentType: "Full-time · Federal Cyber",
    },
    marketMeta: {
      productName: "Aagiis Continuous ATO (cATO) & RMF Command Platform",
      vendor: "Aagiis Federal",
      price: "$890/mo",
      category: "Cybersecurity",
      liveUrl: "https://aagiis.com",
    },
    pulseMeta: {
      severityOrTag: "SOC THREAT HUNTING",
      sourceName: "Aagiis Federal Threat Wire",
      takeaway: "Automated SOAR identity token revocation isolates compromised federated sessions in under 4.2 seconds.",
    },
  },
  {
    kind: "video",
    title: "Commercial Building Automation & HVAC DDC Controls: Programmable vs. Configurable BACnet Controllers",
    summary:
      "Deep-dive engineering walkthrough of commercial HVAC building automation systems (BAS), BACnet/IP field controllers, chiller plant staging, and VAV airflow loops.",
    youtubeId: "RqPTRQksFlw",
    imageUrl: "https://i.ytimg.com/vi/RqPTRQksFlw/hqdefault.jpg",
    authorName: "Tony Mormino, PE · HVAC TV",
    authorRole: "Commercial HVAC Controls & MEP Automation Director",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80",
    organization: "Commercial MEP & Controls Guild",
    enclaveId: "trades_construction",
    category: "Commercial HVAC & BAS Controls",
    duration: "09:42",
    sourceFeed: "Admin 60-Min MEP & Controls Wire",
    jobMeta: {
      roleTitle: "Senior Commercial HVAC Controls & BACnet Automation Engineer",
      company: "Trane Technologies & Johnson Controls Commercial",
      location: "Dallas, TX / Nationwide",
      salary: "$128,000 – $172,000",
      employmentType: "Full-time · MEP Controls",
    },
    marketMeta: {
      productName: "Commercial BACnet/Modbus Commissioning & Psychrometric Suite",
      vendor: "SkillHands Field Pro",
      price: "$69/mo",
      category: "Software",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "MEP AUTOMATION PULSE",
      sourceName: "Commercial HVAC & Controls Index",
      takeaway: "Freely programmable DDC chiller plant controllers cut Class-A commercial tower HVAC energy consumption by 24%.",
    },
  },
  {
    kind: "picture",
    title: "Utility-Scale Bifacial Solar Microgrid & 1500V DC Inverter Commissioning",
    summary:
      "Field engineering capture of utility-scale photovoltaic trackers paired with grid-forming lithium-iron-phosphate (LFP) battery storage.",
    imageUrl: "/images/connectln-studies/solar-microgrid-cover.jpg",
    authorName: "Carlos Mendez, NABCEP",
    authorRole: "Lead High-Voltage Solar & Microgrid Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
    organization: "SunGrid Utility Microgrids",
    enclaveId: "energy_utilities_environment",
    category: "Solar & Grid Energy",
    sourceFeed: "Admin 60-Min Renewable Grid Photo Wire",
    jobMeta: {
      roleTitle: "Lead 1500V Solar PV & Microgrid Commissioning Engineer",
      company: "SunGrid Utility Microgrids",
      location: "Austin, TX · Regional Travel",
      salary: "$135,000 – $168,000",
      employmentType: "Full-time · Energy Infrastructure",
    },
    marketMeta: {
      productName: "GridPulse SCADA & Solar Inverter Diagnostic Kit",
      vendor: "SunGrid Engineering",
      price: "$290/mo",
      category: "Software",
      liveUrl: "https://conectln.com",
    },
    pulseMeta: {
      severityOrTag: "GRID INFRASTRUCTURE",
      sourceName: "Energy & Utilities Wire",
      takeaway: "Grid-forming 1500V string inverters stabilize regional microgrid frequency within 18ms of main utility islanding.",
    },
  },
  {
    kind: "video",
    title: "Heavy Timber Frame Construction: Precision Mortise-and-Tenon Joinery, Oak Pegging & Structural Bent Raising",
    summary:
      "On-site craft walkthrough assembling structural heavy timber bents, fitting precision mortise-and-tenon joints, and driving drawbore hardwood pegs.",
    youtubeId: "4ChaCgOkFI0",
    imageUrl: "https://i.ytimg.com/vi/4ChaCgOkFI0/hqdefault.jpg",
    authorName: "Markus Thorne · WoodForge Timber Guild",
    authorRole: "Master Heavy Timber Framer & Crane Rigging Superintendent",
    authorAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=240&auto=format&fit=crop&q=80",
    organization: "Turner & Cascade Timber Guild",
    enclaveId: "trades_construction",
    category: "Heavy Timber & Structural Carpentry",
    duration: "05:18",
    sourceFeed: "Admin 60-Min Master Carpentry Wire",
    jobMeta: {
      roleTitle: "Master Heavy Timber Framer & Crane Rigging Foreman",
      company: "Turner & Cascade Timber Guild",
      location: "Denver, CO · Jobsite",
      salary: "$128,000 – $158,000 + Per Diem",
      employmentType: "Full-time · Skilled Trade",
    },
    marketMeta: {
      productName: "Structural Timber & Crane Rigging Load Calculator",
      vendor: "SkillHands Trade Hub",
      price: "$59/mo",
      category: "Software",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "JOBSITE SAFETY & RIGGING",
      sourceName: "SkillHands Field Wire",
      takeaway: "Cross-laminated timber (CLT) hybrid floor diaphragms accelerate commercial high-rise erection schedules by 35%.",
    },
  },
  {
    kind: "picture",
    title: "Enterprise GRC Governance, NIST AI RMF & ISO 42001 Compliance Matrix",
    summary:
      "Executive compliance architecture mapping NIST 800-53 Rev 5, CMMC 2.0 Level 3, and ISO/IEC 42001 AI governance controls in real time.",
    imageUrl: "/images/connectln-studies/grc-governance-cover.jpg",
    authorName: "David Osei, CISM, CRISC",
    authorRole: "VP of Federal GRC & Continuous Assurance",
    authorAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80",
    organization: "Aagiis Governance Enclave",
    enclaveId: "tech_cybersecurity",
    category: "GRC & Federal Compliance",
    sourceFeed: "Admin 60-Min Compliance Visual Ledger",
    jobMeta: {
      roleTitle: "Director of Federal GRC, CMMC 2.0 & FedRAMP High",
      company: "Aagiis Governance Enclave",
      location: "Arlington, VA · Hybrid",
      salary: "$180,000 – $225,000",
      employmentType: "Full-time · Compliance Leadership",
    },
    marketMeta: {
      productName: "Aagiis Automated FedRAMP & CMMC Evidence Vault",
      vendor: "Aagiis Federal",
      price: "$599/mo",
      category: "Cybersecurity",
      liveUrl: "https://aagiis.com",
    },
    pulseMeta: {
      severityOrTag: "REGULATORY MANDATE",
      sourceName: "Federal Compliance Wire",
      takeaway: "Automated OSCAL control mapping reduces FedRAMP Rev 5 Continuous Monitoring package preparation time by 78%.",
    },
  },
  {
    kind: "video",
    title: "Automated DevSecOps CI/CD Pipeline: SAST Static Code Analysis, Container Image Signing & Secret Scanning",
    summary:
      "Live engineering build of an automated DevSecOps pipeline integrating static application security testing (SAST), SBOM attestation, and policy-as-code gates.",
    youtubeId: "9ZgCmq1jXT8",
    imageUrl: "https://i.ytimg.com/vi/9ZgCmq1jXT8/hqdefault.jpg",
    authorName: "Michael Levan · 05-SAST & Cloud Security",
    authorRole: "Principal DevSecOps & SAST Engine Architect",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80",
    organization: "05-SAST & Trepath Security",
    enclaveId: "tech_cybersecurity",
    category: "DevSecOps & SAST",
    duration: "07:34",
    sourceFeed: "Admin 60-Min 05-SAST & DevHub Wire",
    jobMeta: {
      roleTitle: "Principal Application Security & AST Compiler Engineer",
      company: "05-SAST & Expedite Consults",
      location: "Remote · Global",
      salary: "$205,000 – $250,000",
      employmentType: "Full-time · Engineering",
    },
    marketMeta: {
      productName: "05-SAST Sub-4ms Static Code & Pentest Engine",
      vendor: "Expedite Consults",
      price: "$349/mo",
      category: "Cybersecurity",
      liveUrl: "https://05-sast.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "DEVSECOPS BENCHMARK",
      sourceName: "ConnectLn Engineering Wire",
      takeaway: "Inline IDE AST taint analysis catches 94% of SQLi, SSRF, and prototype pollution flaws prior to git commit.",
    },
  },
  {
    kind: "video",
    title: "JPL Spacecraft Avionics & Flight Telemetry: Autonomous Guidance, Altimeter Sensor Fusion & Mission Control",
    summary:
      "Inside spacecraft mission control telemetry verifying autonomous guidance loops, laser altimeter Kalman filtering, and radiation-hardened flight computer links.",
    youtubeId: "ZbYGVzktneY",
    imageUrl: "https://i.ytimg.com/vi/ZbYGVzktneY/hqdefault.jpg",
    authorName: "Capt. Priya Patel · Orbital Avionics",
    authorRole: "Lead Spacecraft Avionics & Flight Systems Director",
    authorAvatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=240&auto=format&fit=crop&q=80",
    organization: "Orbital Dynamics & Defense",
    enclaveId: "aviation_aerospace_maritime",
    category: "Aerospace & Avionics",
    duration: "04:45",
    sourceFeed: "Admin 60-Min Aerospace Telemetry Wire",
    jobMeta: {
      roleTitle: "Lead Spacecraft Avionics & DO-178C Flight Software Architect",
      company: "Orbital Dynamics & Defense",
      location: "Cape Canaveral, FL / Huntsville, AL",
      salary: "$185,000 – $230,000",
      employmentType: "Full-time · Aerospace",
    },
    marketMeta: {
      productName: "Avionics Bus Telemetry & DO-178C Verification Suite",
      vendor: "Orbital Systems",
      price: "$950/mo",
      category: "Enterprise",
      liveUrl: "https://conectln.com",
    },
    pulseMeta: {
      severityOrTag: "AEROSPACE TELEMETRY",
      sourceName: "Orbital & Aviation Wire",
      takeaway: "Triple-modular redundant (TMR) SpaceWire optical buses achieve zero bit-error drift across 1,200-hour thermal vacuum testing.",
    },
  },
  {
    kind: "picture",
    title: "Applied Neural Architecture & Enterprise Multimodal AI Systems Lab",
    summary:
      "Visual system topology of retrieval-augmented generation (RAG), vector HNSW indexing, and hardware-accelerated tensor inference.",
    imageUrl: "/images/connectln-studies/ai-studies-cover.jpg",
    authorName: "Dr. Amara Okafor",
    authorRole: "Chief AI Research Scientist & LLM Systems Lead",
    authorAvatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=240&auto=format&fit=crop&q=80",
    organization: "Noctis AI Research Lab",
    enclaveId: "tech_cybersecurity",
    category: "Enterprise AI & RAG",
    sourceFeed: "Admin 60-Min Noctis AI Visual Feed",
    jobMeta: {
      roleTitle: "Principal Multimodal LLM & Distributed Inference Engineer",
      company: "Noctis AI Research Lab",
      location: "San Francisco, CA / Remote",
      salary: "$240,000 – $310,000",
      employmentType: "Full-time · AI Research",
    },
    marketMeta: {
      productName: "Noctis Enterprise Vector & Secure RAG Appliance",
      vendor: "Expedite Consults",
      price: "$549/mo",
      category: "AI",
      liveUrl: "https://www.dstrike.app/noctis",
    },
    pulseMeta: {
      severityOrTag: "AI SYSTEMS RESEARCH",
      sourceName: "Noctis Research Wire",
      takeaway: "Hybrid sparse-dense vector quantization cuts enterprise RAG memory footprint by 68% with zero recall degradation.",
    },
  },
]

export const HARVESTER_SYNC_INTERVAL_MS = 60 * 60 * 1000 // 60 minutes (1 hour)

export function getCurrentMinuteSlot(nowMs: number = Date.now()): number {
  return Math.max(1, Math.floor((nowMs - PLATFORM_HARVESTER_EPOCH_MS) / HARVESTER_SYNC_INTERVAL_MS))
}

export function getMinutesElapsedToday(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes() + 1
}

export function buildHarvestedItemForSlot(
  slot: number,
  offsetIndex: number = 0,
  customTimestampMs?: number,
  forcedTemplateIndex?: number
): HarvestedMediaItem {
  const templateIndex =
    typeof forcedTemplateIndex === "number"
      ? Math.abs(forcedTemplateIndex) % CONNECTLN_HARVESTER_TEMPLATES.length
      : Math.abs(slot + offsetIndex) % CONNECTLN_HARVESTER_TEMPLATES.length
  const tpl = CONNECTLN_HARVESTER_TEMPLATES[templateIndex]
  const itemTimeMs = customTimestampMs ?? Date.now() - offsetIndex * HARVESTER_SYNC_INTERVAL_MS
  const itemDate = new Date(itemTimeMs)
  const timeStr = itemDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const minsAgo = Math.max(0, Math.round((Date.now() - itemTimeMs) / 60000))
  const hoursAgo = Math.floor(minsAgo / 60)
  const pulledAtLabel =
    minsAgo <= 1
      ? `Synced just now (${timeStr})`
      : minsAgo < 60
      ? `Synced ${minsAgo} mins ago (${timeStr})`
      : hoursAgo === 1
      ? `Synced 1 hr ago (${timeStr})`
      : `Synced ${hoursAgo} hrs ago (${timeStr})`

  return {
    id: `cln_hv_${slot}_${templateIndex}_${tpl.kind}`,
    serialNumber: `CLN-HV-${String((slot % 90000) + 10000)}`,
    kind: tpl.kind,
    title: tpl.title,
    summary: tpl.summary,
    videoUrl: tpl.videoUrl,
    youtubeId: tpl.youtubeId,
    imageUrl: tpl.imageUrl,
    authorName: tpl.authorName,
    authorRole: tpl.authorRole,
    authorAvatar: tpl.authorAvatar,
    organization: tpl.organization,
    enclaveId: tpl.enclaveId,
    category: tpl.category,
    duration: tpl.duration,
    destinations: ["home", "jobs", "market", "media", "pulse"],
    pulledAtIso: itemDate.toISOString(),
    pulledAtLabel,
    minuteSlot: slot,
    sourceFeed: tpl.sourceFeed.replace("1-Min", "60-Min"),
    viewsCount: 1420 + ((slot * 37 + offsetIndex * 19) % 8400),
    likesCount: 94 + ((slot * 13 + offsetIndex * 7) % 620),
    jobMeta: tpl.jobMeta,
    marketMeta: tpl.marketMeta,
    pulseMeta: tpl.pulseMeta,
  }
}

export function getInitialDeterministicHarvestedItems(count: number = 14): HarvestedMediaItem[] {
  const currentSlot = getCurrentMinuteSlot()
  const items: HarvestedMediaItem[] = []
  const totalTemplates = CONNECTLN_HARVESTER_TEMPLATES.length
  const safeCount = Math.min(count, totalTemplates)
  for (let i = 0; i < safeCount; i++) {
    const tplIdx = (currentSlot + i) % totalTemplates
    items.push(buildHarvestedItemForSlot(currentSlot - i, 0, Date.now() - i * HARVESTER_SYNC_INTERVAL_MS, tplIdx))
  }
  return items
}

export function getHarvestedMediaCanonicalKey(item: HarvestedMediaItem): string {
  if (item.id?.startsWith("cln_custom_")) return item.id
  if (item.youtubeId) return `yt:${item.youtubeId}`
  if (item.videoUrl) return `vid:${item.videoUrl}`
  if (item.imageUrl) return `img:${item.imageUrl}`
  return `title:${item.title}`
}

export function sortHarvestedItemsNewestFirst(items: HarvestedMediaItem[]): HarvestedMediaItem[] {
  const sorted = [...items].sort((a, b) => {
    const aIsCustomOrManual =
      a.id.startsWith("cln_custom_") || a.id.startsWith("cln_pull_") || a.id.startsWith("cln_auto_") ? 1 : 0
    const bIsCustomOrManual =
      b.id.startsWith("cln_custom_") || b.id.startsWith("cln_pull_") || b.id.startsWith("cln_auto_") ? 1 : 0
    if (aIsCustomOrManual !== bIsCustomOrManual) {
      return bIsCustomOrManual - aIsCustomOrManual
    }
    const timeA = Date.parse(a.pulledAtIso || "") || 0
    const timeB = Date.parse(b.pulledAtIso || "") || 0
    if (timeB !== timeA) return timeB - timeA
    return (b.minuteSlot || 0) - (a.minuteSlot || 0)
  })

  // Deduplicate by canonical media URL / YouTube ID and exclude any old platform videos already on Home, Jobs, Alerts, Learn, or Media
  const seenMediaKeys = new Set<string>()
  const unique: HarvestedMediaItem[] = []
  for (const item of sorted) {
    if (!item || !item.id) continue
    if (item.kind === "video" && !item.id.startsWith("cln_custom_")) {
      if (item.videoUrl && item.videoUrl.startsWith("/status-videos/")) continue
      if (!item.youtubeId || !EXCLUSIVE_NEW_HARVESTER_YOUTUBE_IDS.has(item.youtubeId)) continue
    }
    const key = getHarvestedMediaCanonicalKey(item)
    if (seenMediaKeys.has(key)) continue
    seenMediaKeys.add(key)
    unique.push(item)
  }
  return unique
}

export function loadStoredHarvestedItems(): HarvestedMediaItem[] {
  if (typeof window === "undefined") {
    return getInitialDeterministicHarvestedItems(14)
  }
  try {
    const raw = window.localStorage.getItem(HARVESTER_STORAGE_KEY)
    const parsed: HarvestedMediaItem[] = raw ? JSON.parse(raw) : []
    const cleanedParsed = parsed.filter((item) => Boolean(item && item.id))
    const deterministic = getInitialDeterministicHarvestedItems(14)
    const map = new Map<string, HarvestedMediaItem>()
    ;[...deterministic, ...cleanedParsed].forEach((item) => {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, item)
      }
    })
    return sortHarvestedItemsNewestFirst(Array.from(map.values())).slice(0, 60)
  } catch {
    return getInitialDeterministicHarvestedItems(14)
  }
}

export function saveStoredHarvestedItems(items: HarvestedMediaItem[]): HarvestedMediaItem[] {
  const sorted = sortHarvestedItemsNewestFirst(items).slice(0, 60)
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(HARVESTER_STORAGE_KEY, JSON.stringify(sorted))
      window.dispatchEvent(
        new CustomEvent(HARVESTER_EVENT_NAME, {
          detail: { items: sorted, timestamp: Date.now() },
        })
      )
    } catch {
      // ignore storage quota errors
    }
  }
  return sorted
}

export function getStoredHarvestedItemsForDestination(
  destination: HarvesterDestination
): HarvestedMediaItem[] {
  return loadStoredHarvestedItems().filter(
    (item) => Array.isArray(item.destinations) && item.destinations.includes(destination)
  )
}

export function computeHarvesterTelemetry(items: HarvestedMediaItem[]): HarvesterTelemetrySnapshot {
  const now = new Date()
  const currentSlot = getCurrentMinuteSlot(now.getTime())
  const minutesElapsedToday = getMinutesElapsedToday(now)
  const hoursElapsedToday = Math.max(1, now.getHours() + 1)

  // Base platform catalog + 1 new batch per 60-minute slot elapsed since epoch + custom items
  const baseVideoInventory = 4820 + Math.floor(currentSlot * 2) + items.filter((i) => i.kind === "video").length
  const basePictureInventory = 3190 + Math.floor(currentSlot * 1) + items.filter((i) => i.kind === "picture").length
  const pulledTodayCount = hoursElapsedToday * 2 + items.length

  const destinationCounts: Record<HarvesterDestination, number> = {
    home: items.filter((i) => i.destinations.includes("home")).length,
    jobs: items.filter((i) => i.destinations.includes("jobs")).length,
    market: items.filter((i) => i.destinations.includes("market")).length,
    media: items.filter((i) => i.destinations.includes("media")).length,
    pulse: items.filter((i) => i.destinations.includes("pulse")).length,
  }

  const connectors: HarvesterFeedConnector[] = [
    {
      id: "conn-field-video",
      name: "ConnectLn Field Video & MP4 Wire",
      category: "Skilled Trades, Robotics & Engineering",
      protocol: "HLS / MP4 Direct Stream",
      cadence: "Every 60 Mins (1 Hr)",
      status: "ACTIVE",
      itemsPulledToday: Math.round(pulledTodayCount * 0.28),
      lastPulledTitle: items.find((i) => i.kind === "video")?.title || "Autonomous Quadruped Jobsite Robotics",
    },
    {
      id: "conn-cyber-noctis",
      name: "DSTRIKE & Noctis Cyber/AI Video Feed",
      category: "Cybersecurity, eBPF, SAST & Agentic AI",
      protocol: "REST + Webhook Push",
      cadence: "Every 60 Mins (1 Hr)",
      status: "ACTIVE",
      itemsPulledToday: Math.round(pulledTodayCount * 0.26),
      lastPulledTitle: "eBPF Zero-Trust Kernel Packet Telemetry & K8s Defense",
    },
    {
      id: "conn-clinical-med",
      name: "Clinical Surgery, Solar & Aerospace Visuals",
      category: "Healthcare, 1500V Solar & Orbital Avionics",
      protocol: "DICOM / HD Media Pipe",
      cadence: "Every 60 Mins (1 Hr)",
      status: "ACTIVE",
      itemsPulledToday: Math.round(pulledTodayCount * 0.24),
      lastPulledTitle: "Trauma Surgery & Intraoperative Clinical Telemetry",
    },
    {
      id: "conn-market-demos",
      name: "Marketplace Product Demos & Job Briefings",
      category: "B2B SaaS Demos, Employer Videos & Pictures",
      protocol: "GraphQL Media Syndication",
      cadence: "Every 60 Mins (1 Hr)",
      status: "ACTIVE",
      itemsPulledToday: Math.round(pulledTodayCount * 0.22),
      lastPulledTitle: "05-SAST Sub-4ms Static Code & Pentest Engine",
    },
  ]

  const latestItem = items[0]
  return {
    totalVideosAllTime: baseVideoInventory,
    totalPicturesAllTime: basePictureInventory,
    pulledTodayCount,
    dailyGrowthRate: 48,
    minutesElapsedToday,
    currentMinuteSlot: currentSlot,
    lastPulledAtIso: latestItem?.pulledAtIso || now.toISOString(),
    lastPulledAtLabel:
      latestItem?.pulledAtLabel ||
      now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    destinationCounts,
    connectors,
    items,
  }
}
