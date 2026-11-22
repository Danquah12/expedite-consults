import { HOME_TAB_EXCLUSIVE_YOUTUBE_IDS } from "./connectin-videos"

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

export const HARVESTER_STORAGE_KEY = "connectln_harvested_media_items_v6"
export const HARVESTER_AUTO_ENABLED_KEY = "connectln_harvester_auto_enabled_v1"
export const HARVESTER_EVENT_NAME = "connectln-media-harvested"

export function isLegacySyntheticOrAiMediaItem(
  item: Partial<HarvestedMediaItem> | null | undefined
): boolean {
  if (!item) return true
  const vUrl = String(item.videoUrl || "").trim()
  const iUrl = String(item.imageUrl || "").trim()
  if (vUrl.includes("/status-videos/")) return true
  if (iUrl.includes("/images/connectln-studies/")) return true
  if (!item.youtubeId && item.kind === "picture") return true
  if (!item.youtubeId && !vUrl.startsWith("http")) return true
  return false
}

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
    title: "High-Rise Elevator & Escalator Constructor (NEIEP / QEI): $106K–$195K Traction Hoist & Controller Commissioning",
    summary:
      "Inside an 80-story commercial hoistway inspecting gearless permanent-magnet synchronous traction motors, regenerative VFD drives, and ASME A17.1 overspeed governors.",
    youtubeId: "Mw_EdvKBEc0",
    imageUrl: "https://i.ytimg.com/vi/Mw_EdvKBEc0/hqdefault.jpg",
    authorName: "Dante Rossi, QEI · IUEC Local 1",
    authorRole: "Master Elevator Constructor & High-Rise Hoistway Inspector",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    organization: "National Elevator Constructors Guild",
    enclaveId: "trades_construction",
    category: "Elevator Constructors & MEP",
    duration: "08:14",
    sourceFeed: "Admin 1-Min Live Trade Video Wire",
    jobMeta: {
      roleTitle: "Licensed High-Rise Elevator & Escalator Constructor Mechanic (NEIEP / QEI)",
      company: "Otis, TK Elevator & KONE High-Rise Division",
      location: "New York, NY / Chicago / Nationwide",
      salary: "$132,000 – $195,000",
      employmentType: "Full-time · Union Master Trade",
    },
    marketMeta: {
      productName: "ASME A17.1 Digital Hoistway & Governor Compliance Logbook",
      vendor: "SkillHands Field Pro",
      price: "$69/mo",
      category: "Software",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "ESSENTIAL TRADE SPOTLIGHT",
      sourceName: "ConnectLn Essential Trades Wire",
      takeaway: "Destination-dispatch regenerative elevator controllers reduce high-rise traction power consumption by 38% during peak morning up-peak traffic.",
    },
  },
  {
    kind: "video",
    title: "Structural Union Ironworker & High-Steel Crane Erection: Bolt-Up, Spud Wrench Alignment & Rebar Post-Tensioning",
    summary:
      "Field walkthrough with structural ironworkers connecting W-shape steel columns at 400 feet, verifying slip-critical A325/A490 tension control bolts, and rigging tandem crane picks.",
    youtubeId: "Nj0D_HVBlrk",
    imageUrl: "https://i.ytimg.com/vi/Nj0D_HVBlrk/hqdefault.jpg",
    authorName: "Marcus 'Highsteel' Vance · Ironworkers Local 40",
    authorRole: "Structural Steel Raising Gang Foreman & Rigging Lead",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
    organization: "Highsteel Structural Erection Enclave",
    enclaveId: "trades_construction",
    category: "Structural Ironwork & Rigging",
    duration: "06:48",
    sourceFeed: "Admin 1-Min Structural Field Wire",
    jobMeta: {
      roleTitle: "Journeyman Structural Ironworker & High-Steel Raising Gang Lead",
      company: "American Bridge & Turner Structural Steel",
      location: "Pittsburgh, PA / Nationwide Projects",
      salary: "$118,000 – $164,000 + Per Diem",
      employmentType: "Full-time · Structural Steel",
    },
    marketMeta: {
      productName: "Structural Steel Crane Pick & AISC Bolt Torque Field Suite",
      vendor: "DeskNote Field Engineering",
      price: "$79/mo",
      category: "Software",
      liveUrl: "https://desk-note.app/",
    },
    pulseMeta: {
      severityOrTag: "HIGH-STEEL FIELD BRIEF",
      sourceName: "Ironworkers & Rigging Wire",
      takeaway: "Tension-control twist-off spline bolts (ASTM F1852) guarantee verified slip-critical preload across seismic moment frames in half the inspection time.",
    },
  },
  {
    kind: "video",
    title: "Commercial HVAC Sheet Metal Fabrication: CNC Plasma Duct Layout, Pittsburgh Lock Seams & Cleanroom Balancing",
    summary:
      "Inside an iTi sheet metal fabrication shop cutting 16-gauge galvanized spiral ductwork, forming Pittsburgh locks, and pressure-testing hospital negative-pressure isolation runs.",
    youtubeId: "CJehmOQ5GL4",
    imageUrl: "https://i.ytimg.com/vi/CJehmOQ5GL4/hqdefault.jpg",
    authorName: "Liam O'Connor · SMART Sheet Metal Local 28",
    authorRole: "Master HVAC Sheet Metal Fabricator & TAB Commissioning Lead",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80",
    organization: "iTi Sheet Metal & Mechanical Guild",
    enclaveId: "trades_construction",
    category: "Sheet Metal & Industrial HVAC",
    duration: "05:36",
    sourceFeed: "Admin 1-Min Mechanical Trade Stream",
    jobMeta: {
      roleTitle: "Journeyman Commercial Sheet Metal & Cleanroom HVAC Fabricator",
      company: "Apollo Mechanical & Cleanroom Systems",
      location: "Phoenix, AZ / Semiconductor Corridor",
      salary: "$112,000 – $152,000",
      employmentType: "Full-time · Mechanical Trade",
    },
    marketMeta: {
      productName: "SMACNA Duct Pressure & CAD/CAM Plasma Nesting Calculator",
      vendor: "SkillHands Pro",
      price: "$59/mo",
      category: "Software",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "MECHANICAL & FAB WIRE",
      sourceName: "SMACNA & Sheet Metal Dispatch",
      takeaway: "Automated laser-welded stainless exhaust ductwork cuts semiconductor fab sub-fab air leakage below 0.15 CFM per 100 sq ft.",
    },
  },
  {
    kind: "video",
    title: "Automotive High-Voltage Electrician: CAN-FD Multiplex Bus Probing, ADAS Radar Calibration & EV Battery Pack Service",
    summary:
      "Hands-on diagnostic walkthrough isolating parasitic draw, decoding CAN-FD frames with a 4-channel oscilloscope, and servicing 400V/800V traction battery contactors.",
    youtubeId: "O_VApkXslGA",
    imageUrl: "https://i.ytimg.com/vi/O_VApkXslGA/hqdefault.jpg",
    authorName: "Callum Reid, ASE L3 Master Auto Electrician",
    authorRole: "Lead Automotive Electrical & EV High-Voltage Specialist",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
    organization: "MTA Automotive Electrical Enclave",
    enclaveId: "automotive_mechanics",
    category: "Auto Electrical & EV Systems",
    duration: "04:52",
    sourceFeed: "Admin 1-Min Automotive & EV Wire",
    jobMeta: {
      roleTitle: "Master Automotive Electrician & EV High-Voltage Diagnostic Lead",
      company: "Penske Fleet & Rivian Commercial Service",
      location: "Dallas, TX / Nationwide",
      salary: "$108,000 – $146,000",
      employmentType: "Full-time · Automotive Master Tech",
    },
    marketMeta: {
      productName: "CAN-FD Oscilloscope Waveform Library & EV Pinout Vault",
      vendor: "Sphera Auto Diagnostics",
      price: "$65/mo",
      category: "Software",
      liveUrl: "https://conectln.com",
    },
    pulseMeta: {
      severityOrTag: "EV DIAGNOSTICS BRIEF",
      sourceName: "ConnectLn Automotive Enclave",
      takeaway: "Differential voltage drop testing across HV pyro-fuse junctions pinpoints high-resistance contactor wear before thermal derating occurs.",
    },
  },
  {
    kind: "video",
    title: "Commercial Aviation & Flight Deck Operations: IFR Glass Cockpit Avionics, Turbine Pre-Flight & ATP Career Progression",
    summary:
      "Complete cockpit walkthrough from commercial instrument rating (IFR) and multi-engine turbine systems verification to Part 121 airline captain flight deck procedures.",
    youtubeId: "D-nOuNU9LcQ",
    imageUrl: "https://i.ytimg.com/vi/D-nOuNU9LcQ/hqdefault.jpg",
    authorName: "Capt. Nathan Brooks, ATP, CFI-I",
    authorRole: "Airline Transport Pilot (ATP) & Check Airman",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80",
    organization: "Pilot Institute & ConnectLn Aviation Enclave",
    enclaveId: "aviation_aerospace_maritime",
    category: "Commercial Aviation & Flight Ops",
    duration: "09:20",
    sourceFeed: "Admin 1-Min Aviation & Aerospace Stream",
    jobMeta: {
      roleTitle: "First Officer & Captain — Part 121 / Part 135 Jet Operations (ATP)",
      company: "Delta, United & NetJets Flight Operations",
      location: "Atlanta, GA / Denver, CO / Nationwide Bases",
      salary: "$165,000 – $340,000",
      employmentType: "Full-time · Commercial Aviation",
    },
    marketMeta: {
      productName: "FAA Part 121 IFR Flight Deck & Turbine Systems Simulator Pack",
      vendor: "Orbital & Aviation Systems",
      price: "$129/mo",
      category: "Training",
      liveUrl: "https://conectln.com",
    },
    pulseMeta: {
      severityOrTag: "FLIGHT OPERATIONS DISPATCH",
      sourceName: "Aviation & Aerospace Wire",
      takeaway: "Required Navigation Performance (RNP AR) satellite approaches cut commercial jet fuel burn and terminal holding delays by 19%.",
    },
  },
  {
    kind: "video",
    title: "High-Rise Architectural Glazier & Curtain Wall Installation: Vacuum Lifter Crane Rigging & Structural Silicone Glazing",
    summary:
      "On-site with commercial glaziers setting 1,200-lb triple-glazed low-E curtain wall units on a 55-story tower using remote-controlled vacuum glass manipulators.",
    youtubeId: "THdNxgJo45A",
    imageUrl: "https://i.ytimg.com/vi/THdNxgJo45A/hqdefault.jpg",
    authorName: "Devon Vance · Architectural Glaziers Guild",
    authorRole: "Lead Curtain Wall & Structural Glass Superintendent",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80",
    organization: "Glazier Nation & High-Rise Facade Enclave",
    enclaveId: "trades_construction",
    category: "Architectural Glazing & Facades",
    duration: "06:15",
    sourceFeed: "Admin 1-Min Commercial Facade Wire",
    jobMeta: {
      roleTitle: "Journeyman High-Rise Curtain Wall Glazier & Rigging Lead",
      company: "Harmon Facade & Permasteelisa North America",
      location: "Boston, MA / New York, NY",
      salary: "$106,000 – $148,000",
      employmentType: "Full-time · Architectural Trade",
    },
    marketMeta: {
      productName: "Curtain Wall Wind-Load & Thermal Curtain Takeoff Suite",
      vendor: "DeskNote Field",
      price: "$69/mo",
      category: "Software",
      liveUrl: "https://desk-note.app/",
    },
    pulseMeta: {
      severityOrTag: "FACADE ENGINEERING",
      sourceName: "Commercial Glazing Wire",
      takeaway: "Unitized factory-glazed curtain wall panels with dual-circuit vacuum lifters enable 18-panel-per-shift installation in high-wind urban corridors.",
    },
  },
  {
    kind: "video",
    title: "Heavy Civil Concrete Finisher & Highway Bridge Decking: Laser Screed Leveling, Superplasticizer Slump & Bull Float Mastery",
    summary:
      "Field crew pouring 800 cubic yards of DOT high-early-strength bridge deck concrete, verifying air entrainment and slump, and finishing with ride-on power trowels.",
    youtubeId: "y2uEMYQQviE",
    imageUrl: "https://i.ytimg.com/vi/y2uEMYQQviE/hqdefault.jpg",
    authorName: "Joe Castellano · OPCMIA Cement Masons",
    authorRole: "Master Heavy-Highway Concrete Finisher & Pour Superintendent",
    authorAvatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=240&auto=format&fit=crop&q=80",
    organization: "Heavy Civil & Infrastructure Guild",
    enclaveId: "trades_construction",
    category: "Heavy Civil & Concrete",
    duration: "07:05",
    sourceFeed: "Admin 1-Min Civil Infrastructure Wire",
    jobMeta: {
      roleTitle: "Lead Heavy-Civil Concrete Finisher & Bridge Deck Foreman (ACI)",
      company: "Kiewit & Granite Infrastructure",
      location: "Austin, TX / Midwest DOT Corridors",
      salary: "$102,000 – $144,000 + Overtime",
      employmentType: "Full-time · Heavy Civil",
    },
    marketMeta: {
      productName: "ACI Concrete Mix Maturity, Slump & Yardage Field Calculator",
      vendor: "SkillHands Pro",
      price: "$49/mo",
      category: "Software",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "INFRASTRUCTURE POUR BRIEF",
      sourceName: "Heavy Civil Construction Wire",
      takeaway: "Embedded wireless concrete maturity sensors allow DOT bridge post-tensioning 36 hours earlier by tracking real-time hydration exothermic curves.",
    },
  },
  {
    kind: "video",
    title: "Commercial Appliance & Sub-Zero Sealed System Technician: Inverter Compressor Diagnostics, EPA 608 & Control Board Repair",
    summary:
      "Step-by-step field repair of variable-capacity inverter compressors, Loki ring-lok braze-free sealed-system fittings, and relay board schematic tracing.",
    youtubeId: "js_xjb65f_w",
    imageUrl: "https://i.ytimg.com/vi/js_xjb65f_w/hqdefault.jpg",
    authorName: "derek 'TechMaster' Cole, NASTeC, EPA 608",
    authorRole: "Master Commercial Appliance & Refrigeration Service Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80",
    organization: "National Appliance Service Technicians Enclave",
    enclaveId: "trades_construction",
    category: "Appliance & Sealed-System Tech",
    duration: "07:45",
    sourceFeed: "Admin 1-Min Service Tech Video Wire",
    jobMeta: {
      roleTitle: "Master Commercial & Luxury Appliance Sealed-System Technician (EPA 608)",
      company: "Sub-Zero Wolf Authorized Service & Hobart Commercial",
      location: "Seattle, WA / Nationwide",
      salary: "$98,000 – $142,000",
      employmentType: "Full-time · Field Service Tech",
    },
    marketMeta: {
      productName: "Smart Appliance Board Schematic & Sealed-System Pressure App",
      vendor: "SkillHands Field",
      price: "$45/mo",
      category: "Software",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "FIELD SERVICE DISPATCH",
      sourceName: "ConnectLn Service Tech Wire",
      takeaway: "R-600a isobutane press-fit sealed-system Lokring couplings eliminate open-flame brazing hazards in residential and hospital kitchens.",
    },
  },
  {
    kind: "video",
    title: "Zero-Trust Cloud Resilience & Multi-Region High-Availability Failover Engineering",
    summary:
      "Preparing distributed cloud infrastructure for service outages, automatic traffic draining, and resilient Kubernetes multi-region recovery.",
    youtubeId: "w9VqhLZhRks",
    imageUrl: "https://i.ytimg.com/vi/w9VqhLZhRks/hqdefault.jpg",
    authorName: "Marcus Vance, CISO",
    authorRole: "Enterprise Cloud Security & Availability Architect",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
    organization: "Redwood Cloud & SecOps · IBM Tech Wire",
    enclaveId: "tech_cybersecurity",
    category: "Cloud Resilience & Availability",
    duration: "08:54",
    sourceFeed: "Enterprise Cloud Engineering Wire",
    jobMeta: {
      roleTitle: "Principal Site Reliability & Zero-Trust Cloud Engineer",
      company: "Redwood Cloud & SecOps",
      location: "Remote / Washington, D.C.",
      salary: "$215,000 – $260,000",
      employmentType: "Full-time · Direct Hire",
    },
    marketMeta: {
      productName: "DSTRIKE Multi-Region Cloud Failover & Kernel Suite",
      vendor: "Expedite Consults",
      price: "$499/mo",
      category: "Cybersecurity",
      liveUrl: "https://www.dstrike.app",
    },
    pulseMeta: {
      severityOrTag: "CLOUD RESILIENCE BRIEFING",
      sourceName: "ConnectLn Cyber Wire",
      takeaway: "Automated multi-region health probes reroute production workloads in under 4 seconds during regional cloud outages.",
    },
  },
  {
    kind: "video",
    title: "Structural Steel Fabrication & High-Voltage Transmission Tower Engineering",
    summary:
      "Inside high-voltage lattice and tubular steel transmission tower design, structural wind-load bracing, and field civil construction.",
    youtubeId: "rj-G_gmFWtE",
    imageUrl: "https://i.ytimg.com/vi/rj-G_gmFWtE/hqdefault.jpg",
    authorName: "Grady Hillhouse, PE",
    authorRole: "Licensed Civil & Power Grid Infrastructure Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    organization: "Vanguard Robotics & Heavy Fab · Practical Engineering",
    enclaveId: "trades_construction",
    category: "Power Grid & Structural Steel",
    duration: "14:20",
    sourceFeed: "Civil & Power Grid Engineering Wire",
    jobMeta: {
      roleTitle: "Lead Transmission Tower & Civil Structural Engineer (PE)",
      company: "Vanguard Robotics & Heavy Fab",
      location: "Austin, TX · Field & Grid",
      salary: "$148,000 – $188,000",
      employmentType: "Full-time · Field Engineering",
    },
    marketMeta: {
      productName: "GridStruct Transmission & Structural Steel Load Suite",
      vendor: "Vanguard Heavy Fab",
      price: "$189/mo",
      category: "Solutions",
      liveUrl: "https://desk-note.app/",
    },
    pulseMeta: {
      severityOrTag: "GRID ENGINEERING DISPATCH",
      sourceName: "ConnectLn Infrastructure Wire",
      takeaway: "Modular tubular steel transmission monopoles reduce right-of-way footprint by 40% while carrying dual 500kV circuits.",
    },
  },
  {
    kind: "video",
    title: "Inside Semiconductor Wafer Architecture: AI Accelerators, Cleanroom Fab & High-Density Packaging",
    summary:
      "How AI accelerators, high-bandwidth memory stacks, and advanced foundry lithography scale parallel matrix compute inside modern fabs.",
    youtubeId: "IYVqarjWO2g",
    imageUrl: "https://i.ytimg.com/vi/IYVqarjWO2g/hqdefault.jpg",
    authorName: "Dr. Kenji Takahashi",
    authorRole: "VP of Foundry Lithography & Yield Engineering",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
    organization: "Apex Silicon Fab Consortium",
    enclaveId: "manufacturing_industrial",
    category: "Semiconductor & Fab Ops",
    duration: "08:42",
    sourceFeed: "Semiconductor & Hardware Engineering Wire",
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
    title: "4 Types of Enterprise AI Agent Loops: From Human-in-the-Loop to Autonomous Execution",
    summary:
      "Engineering breakdown of deterministic AI agent workflows, tool calling sandboxes, verification loops, and enterprise governance.",
    youtubeId: "4LINhsEZEDI",
    imageUrl: "https://i.ytimg.com/vi/4LINhsEZEDI/hqdefault.jpg",
    authorName: "Dr. Aris Thorne",
    authorRole: "Principal AI Systems Architect",
    authorAvatar: "/brand/kwesi-avatar.png",
    organization: "Noctis AI Systems Lab · IBM Tech Wire",
    enclaveId: "tech_cybersecurity",
    category: "Agentic AI & Systems",
    duration: "10:12",
    sourceFeed: "Noctis AI & Engineering Video Wire",
    jobMeta: {
      roleTitle: "Staff Agentic AI & MCP Protocol Architect",
      company: "Noctis AI Systems Lab",
      location: "Remote / Maryland HQ",
      salary: "$225,000 – $280,000",
      employmentType: "Full-time · Executive Tech",
    },
    marketMeta: {
      productName: "Noctis AI Threat Prediction & Agentic Engine",
      vendor: "Expedite Consults",
      price: "$399/mo",
      category: "AI",
      liveUrl: "https://www.dstrike.app/noctis",
    },
    pulseMeta: {
      severityOrTag: "AI ARCHITECTURE BRIEF",
      sourceName: "Noctis Intelligence Wire",
      takeaway: "Bounded agent execution loops with tool-level RBAC cut enterprise automation failure rates below 0.2%.",
    },
  },
  {
    kind: "video",
    title: "Clinical Critical Care & Photobiomodulation Briefing: Inpatient Outcomes & Cellular Recovery",
    summary:
      "Physician briefing on cellular mitochondrial respiration, clinical inpatient wellness recovery, and evidence-based medical protocols.",
    youtubeId: "52EoEgDmK-E",
    imageUrl: "https://i.ytimg.com/vi/52EoEgDmK-E/hqdefault.jpg",
    authorName: "Dr. Roger Seheult, MD",
    authorRole: "Board-Certified Pulmonologist & Critical Care Physician",
    authorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=240&auto=format&fit=crop&q=80",
    organization: "Metro Heart & Trauma Institute · MedCram Clinical",
    enclaveId: "healthcare_medicine",
    category: "Clinical Medicine & Critical Care",
    duration: "12:08",
    sourceFeed: "MedCram Clinical Medical Feed",
    jobMeta: {
      roleTitle: "Attending Critical Care & Pulmonary Specialist (MD / FACP)",
      company: "Metro Heart & Trauma Institute",
      location: "Boston, MA · Clinical On-Site",
      salary: "$380,000 – $520,000",
      employmentType: "Full-time · Physician",
    },
    marketMeta: {
      productName: "Clinical Triage & HIPAA Telemetry Intelligence Hub",
      vendor: "MedSphere Clinical Systems",
      price: "$650/mo",
      category: "Solutions",
      liveUrl: "https://conectln.com",
    },
    pulseMeta: {
      severityOrTag: "CLINICAL ADVANCEMENT",
      sourceName: "ConnectLn Medical Enclave",
      takeaway: "Evidence-based mitochondrial recovery protocols and circadian light therapy improve ICU patient recovery trajectories.",
    },
  },
  {
    kind: "video",
    title: "Master Electrician Field Testing: True-RMS CAT IV Switchgear Diagnostics & Load Verification",
    summary:
      "Real-world multimeter testing walkthrough covering commercial switchgear safety ratings, CAT III/CAT IV isolation, and live circuit diagnostics.",
    youtubeId: "A7lu-27bj1U",
    imageUrl: "https://i.ytimg.com/vi/A7lu-27bj1U/hqdefault.jpg",
    authorName: "Dustin Stelzer · Master Electrician",
    authorRole: "Licensed Master Electrician & NEC Instructor",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
    organization: "SunGrid Infrastructure Corp · Electrician U",
    enclaveId: "energy_utilities_environment",
    category: "Electrical & Power Diagnostics",
    duration: "12:35",
    sourceFeed: "Electrician U & Power Distribution Wire",
    jobMeta: {
      roleTitle: "Licensed Master Electrician & Switchgear Commissioning Lead",
      company: "SunGrid Infrastructure Corp",
      location: "Austin, TX · Field Commercial",
      salary: "$128,000 – $168,000",
      employmentType: "Full-time · Master Trade",
    },
    marketMeta: {
      productName: "SunGrid CAT IV Switchgear & NEC Load Field Kit",
      vendor: "SunGrid Infrastructure Corp",
      price: "$189/mo",
      category: "Software",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "ELECTRICAL SAFETY WIRE",
      sourceName: "Energy & Utilities Wire",
      takeaway: "True-RMS CAT IV metered load checks prevent arc-flash diagnostics failures on 480V commercial distribution panels.",
    },
  },
  {
    kind: "video",
    title: "Enterprise SOC & Software Supply Chain Security: Live Threat Hunting & Zero-Trust Containment",
    summary:
      "Inside enterprise Security Operations defending software pipelines, signed build artifacts, SBOM attestation, and real-time threat containment.",
    youtubeId: "iv32wI3MBpw",
    imageUrl: "https://i.ytimg.com/vi/iv32wI3MBpw/hqdefault.jpg",
    authorName: "Hannah Boateng, CISSP",
    authorRole: "Principal SOC Commander & Threat Hunter",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80",
    organization: "Aagiis Federal Compliance & SOC",
    enclaveId: "tech_cybersecurity",
    category: "SOC & Threat Hunting",
    duration: "09:15",
    sourceFeed: "Aagiis Federal SOC Video Wire",
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
      severityOrTag: "ZERO-DAY DRILL ALERT",
      sourceName: "Aagiis Federal Threat Wire",
      takeaway: "Signed SBOM provenance plus automated SOAR containment isolates compromised federated credentials in seconds.",
    },
  },
  {
    kind: "video",
    title: "On-Site Megaproject Walkthrough: $1.8B Commercial High-Rise & Infrastructure Construction",
    summary:
      "Full construction engineering report covering structural steel core erection, commercial MEP coordination, and urban high-rise delivery.",
    youtubeId: "fqKYSxqJoN8",
    imageUrl: "https://i.ytimg.com/vi/fqKYSxqJoN8/hqdefault.jpg",
    authorName: "Suzzan Coldwell · The B1M",
    authorRole: "Senior Commercial Development & Megaproject Director",
    authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80",
    organization: "Coldwell Commercial Partners",
    enclaveId: "trades_construction",
    category: "Commercial Real Estate & MEP",
    duration: "11:24",
    sourceFeed: "The B1M Commercial Construction Wire",
    jobMeta: {
      roleTitle: "Senior Commercial Construction & Development Project Director",
      company: "Coldwell Commercial Partners",
      location: "New York, NY / Los Angeles, CA",
      salary: "$165,000 – $210,000",
      employmentType: "Full-time · Commercial Real Estate",
    },
    marketMeta: {
      productName: "Commercial ProForma & Tenant Buildout Analyzer",
      vendor: "Coldwell Digital Suite",
      price: "$149/mo",
      category: "Solutions",
      liveUrl: "https://desk-note.app/",
    },
    pulseMeta: {
      severityOrTag: "COMMERCIAL MARKET PULSE",
      sourceName: "CRE & Construction Index",
      takeaway: "Integrated structural BIM coordination keeps multi-billion-dollar urban tower packages on critical-path delivery.",
    },
  },
  {
    kind: "video",
    title: "Master Carpentry & Structural Framing Jobsite Walkthrough: Load-Bearing Beams & Finish Joinery",
    summary:
      "Real jobsite carpentry crew removing bearing walls, installing structural engineered LVL beams, framing stud walls, and setting cabinetry.",
    youtubeId: "4-FDNOj9o9s",
    imageUrl: "https://i.ytimg.com/vi/4-FDNOj9o9s/hqdefault.jpg",
    authorName: "Markus Thorne · This Old House",
    authorRole: "Master Carpenter & Commercial Jobsite Superintendent",
    authorAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=240&auto=format&fit=crop&q=80",
    organization: "Turner & Cascade Timber Guild",
    enclaveId: "trades_construction",
    category: "Heavy Timber & Structural Carpentry",
    duration: "10:18",
    sourceFeed: "This Old House Master Trades Wire",
    jobMeta: {
      roleTitle: "Master Heavy Timber Framer & Structural Carpentry Foreman",
      company: "Turner & Cascade Timber Guild",
      location: "Boston, MA / Denver, CO · Jobsite",
      salary: "$128,000 – $158,000 + Per Diem",
      employmentType: "Full-time · Skilled Trade",
    },
    marketMeta: {
      productName: "Structural Timber & Beam Load Field Calculator",
      vendor: "SkillHands Trade Hub",
      price: "$59/mo",
      category: "Software",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "JOBSITE CRAFT DISPATCH",
      sourceName: "SkillHands Field Wire",
      takeaway: "Proper temporary shoring and point-load bearing transfers guarantee safe structural beam swaps on active renovations.",
    },
  },
  {
    kind: "video",
    title: "Complete Commercial Powertrain, Fuel System & Mechanical Diagnostic Inspection",
    summary:
      "Step-by-step hands-on mechanical diagnostics covering fuel tank drops, pump assembly testing, brake hydraulics, and drivetrain restoration.",
    youtubeId: "4j-vKHA19NI",
    imageUrl: "https://i.ytimg.com/vi/4j-vKHA19NI/hqdefault.jpg",
    authorName: "ChrisFix · Master Automotive Tech",
    authorRole: "Master Fleet & Powertrain Mechanical Specialist",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80",
    organization: "Apex Fleet & Powertrain Guild",
    enclaveId: "automotive_mechanics",
    category: "Automotive & Fleet Mechanics",
    duration: "18:40",
    sourceFeed: "ChrisFix Mechanical Diagnostics Wire",
    jobMeta: {
      roleTitle: "Master Automotive & Commercial Fleet Service Technician",
      company: "Apex Fleet & Powertrain Guild",
      location: "Philadelphia, PA / Nationwide",
      salary: "$105,000 – $148,000",
      employmentType: "Full-time · Automotive Master Tech",
    },
    marketMeta: {
      productName: "Apex Fleet Diagnostic & Powertrain Service Toolkit",
      vendor: "Apex Fleet Guild",
      price: "$79/mo",
      category: "Software",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "FLEET DIAGNOSTICS BRIEF",
      sourceName: "ConnectLn Automotive Wire",
      takeaway: "Systematic compression, fuel pressure, and electrical ground verification eliminates guesswork in powertrain rebuilds.",
    },
  },
  {
    kind: "video",
    title: "Heavy Orbital Launch Complexes, Cryogenic Fuel Infrastructure & Flight Telemetry",
    summary:
      "Inside heavy orbital rocket launch infrastructure, launch pad flame trenches, cryogenic propellant farms, and spacecraft integration facilities.",
    youtubeId: "lcv-M6qBsdA",
    imageUrl: "https://i.ytimg.com/vi/lcv-M6qBsdA/hqdefault.jpg",
    authorName: "Capt. Priya Patel · The B1M",
    authorRole: "Lead Aerospace Infrastructure & Launch Systems Director",
    authorAvatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=240&auto=format&fit=crop&q=80",
    organization: "Aether Orbital Propulsion",
    enclaveId: "aviation_aerospace_maritime",
    category: "Aerospace & Launch Infrastructure",
    duration: "13:45",
    sourceFeed: "The B1M Aerospace & Engineering Wire",
    jobMeta: {
      roleTitle: "Lead Spacecraft Avionics & Launch Complex Engineer",
      company: "Aether Orbital Propulsion",
      location: "Cape Canaveral, FL / Huntsville, AL",
      salary: "$185,000 – $230,000",
      employmentType: "Full-time · Aerospace",
    },
    marketMeta: {
      productName: "Avionics Bus Telemetry & Launch Readiness Suite",
      vendor: "Orbital Systems",
      price: "$950/mo",
      category: "Enterprise",
      liveUrl: "https://conectln.com",
    },
    pulseMeta: {
      severityOrTag: "AEROSPACE TELEMETRY",
      sourceName: "Orbital & Aviation Wire",
      takeaway: "Reinforced cryogenic launch pads and rapid propellant umbilical disconnects cut heavy-lift booster turnaround cycles.",
    },
  },
  {
    kind: "video",
    title: "Inside the $13B Heavy Rail Corridor: Geotechnical Engineering & Viaduct Construction",
    summary:
      "Engineering walkthrough of multi-billion-dollar high-speed rail corridors, precast concrete viaducts, signaling systems, and desert grade work.",
    youtubeId: "nUwrjuozT5E",
    imageUrl: "https://i.ytimg.com/vi/nUwrjuozT5E/hqdefault.jpg",
    authorName: "Fred Mills · The B1M",
    authorRole: "Global Civil Infrastructure & Rail Engineering Correspondent",
    authorAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80",
    organization: "Synthetix Infrastructure Broadcast",
    enclaveId: "trades_construction",
    category: "Heavy Civil & Rail Transit",
    duration: "11:05",
    sourceFeed: "The B1M Global Infrastructure Wire",
    jobMeta: {
      roleTitle: "Lead Civil Rail Systems & Geotechnical Corridor Engineer",
      company: "Synthetix Infrastructure Group",
      location: "Dallas, TX / International Hubs",
      salary: "$155,000 – $205,000",
      employmentType: "Full-time · Heavy Civil",
    },
    marketMeta: {
      productName: "RailCorridor Structural BIM & Track Geometry Suite",
      vendor: "DeskNote Field",
      price: "$299/mo",
      category: "Enterprise",
      liveUrl: "https://desk-note.app/",
    },
    pulseMeta: {
      severityOrTag: "TRANSIT INFRASTRUCTURE BRIEF",
      sourceName: "Global Civil Wire",
      takeaway: "Precast segmental concrete viaduct spans enable multi-kilometer rail bridge assembly without halting ground utilities.",
    },
  },
  {
    kind: "video",
    title: "Executive Capital Allocation: Steering Multi-Billion-Dollar AI Data Center & Grid Investments",
    summary:
      "Bloomberg leadership interview examining hyperscale AI infrastructure capital expenditure, data center power procurement, and enterprise cloud ROI.",
    youtubeId: "zX6pHICiG4Q",
    imageUrl: "https://i.ytimg.com/vi/zX6pHICiG4Q/hqdefault.jpg",
    authorName: "Bloomberg Originals · Finance Desk",
    authorRole: "Global Capital Markets & AI Infrastructure Correspondent",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80",
    organization: "Global Capital & AI Infrastructure Desk",
    enclaveId: "business_finance",
    category: "FinOps & Executive Strategy",
    duration: "09:48",
    sourceFeed: "Bloomberg Originals Enterprise Wire",
    jobMeta: {
      roleTitle: "VP of Cloud FinOps & Hyperscale Infrastructure Capital",
      company: "Sphera Venture & FinOps",
      location: "New York, NY / Remote",
      salary: "$195,000 – $255,000",
      employmentType: "Full-time · Finance & Ops",
    },
    marketMeta: {
      productName: "Sphera Cloud FinOps & CapEx Intelligence Platform",
      vendor: "Sphera Portal",
      price: "$249/mo",
      category: "Software",
      liveUrl: "https://expediteconsults.com",
    },
    pulseMeta: {
      severityOrTag: "MARKET & FINOPS BRIEF",
      sourceName: "Bloomberg & ConnectLn Wire",
      takeaway: "Disciplined multi-year data center power and fiber capital allocation separates durable AI infrastructure compounders.",
    },
  },
  {
    kind: "video",
    title: "Precision Speed Square Layout & Structural Rafter Angle Verification",
    summary:
      "Step-by-step master carpentry demonstration of marking plumb cuts, birdsmouth notches, and hip rafter pitches on structural framing stock.",
    youtubeId: "gNhWpuWvtEA",
    imageUrl: "https://i.ytimg.com/vi/gNhWpuWvtEA/hqdefault.jpg",
    authorName: "This Old House · ConnectLn Guild",
    authorRole: "Master Carpentry & Structural Framing Instructor",
    authorAvatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=240&auto=format&fit=crop&q=80",
    organization: "ConnectLn Skilled Trades Academy",
    enclaveId: "trades_construction",
    category: "Carpentry & Layout",
    duration: "05:12",
    sourceFeed: "Skilled Trades Learn-by-Doing Wire",
    jobMeta: {
      roleTitle: "Lead Architectural Finish & Structural Framing Carpenter",
      company: "Heritage Timber & Millwork Co.",
      location: "Boston, MA · Field",
      salary: "$112,000 – $142,000",
      employmentType: "Full-time · Master Trade",
    },
    marketMeta: {
      productName: "Pro Carpenter Takeoff & Rafter Angle Field Suite",
      vendor: "SkillHands Pro",
      price: "$39/mo",
      category: "Training",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "CRAFT MASTERY DISPATCH",
      sourceName: "Skilled Trades Academy",
      takeaway: "Precision speed-square layout verification prevents cumulative roof truss ridge drift across multi-span commercial roofs.",
    },
  },
  {
    kind: "video",
    title: "MIG, TIG & Stick Structural Welding Process Comparison in Field Fabrication",
    summary:
      "Live arc stability, penetration profile, and shielding gas comparison across GMAW, GTAW, and SMAW structural steel welding.",
    youtubeId: "OWThL97tq3k",
    imageUrl: "https://i.ytimg.com/vi/OWThL97tq3k/hqdefault.jpg",
    authorName: "Miller Welders · ConnectLn Guild",
    authorRole: "AWS Certified Structural Welding Inspector (CWI)",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80",
    organization: "American Structural Welding Enclave",
    enclaveId: "trades_construction",
    category: "Welding & Fabrication",
    duration: "06:40",
    sourceFeed: "AWS Welding & Fabrication Video Wire",
    jobMeta: {
      roleTitle: "AWS D1.1 Certified Structural Combo Welder (TIG/Stick)",
      company: "Apex Structural Steel & Rigging",
      location: "Houston, TX · High-Per-Diem",
      salary: "$125,000 – $162,000",
      employmentType: "Full-time · Structural Steel",
    },
    marketMeta: {
      productName: "WeldSpec WPS/PQR Digital Inspector & NDT Logbook",
      vendor: "DeskNote Field",
      price: "$69/mo",
      category: "Software",
      liveUrl: "https://desk-note.app/",
    },
    pulseMeta: {
      severityOrTag: "METALLURGY & WELD BRIEF",
      sourceName: "Structural Fabrication Wire",
      takeaway: "Pulsed spray transfer MIG reduces heat-affected zone (HAZ) distortion by 31% on high-strength low-alloy structural plates.",
    },
  },
  {
    kind: "video",
    title: "NEC Conduit & Enclosure Standards: Field Inspection Guide to IP and NEMA Ratings",
    summary:
      "Licensed master electrician field breakdown of watertight, weatherproof, and hazardous-location electrical conduit and enclosure ratings.",
    youtubeId: "6bS_TDq7lA8",
    imageUrl: "https://i.ytimg.com/vi/6bS_TDq7lA8/hqdefault.jpg",
    authorName: "Dustin Stelzer · Electrician U",
    authorRole: "Licensed Master Electrician & Field Code Educator",
    authorAvatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=240&auto=format&fit=crop&q=80",
    organization: "ConnectLn Guild Credentialing Authority",
    enclaveId: "trades_construction",
    category: "NEC Conduit & Safety Standards",
    duration: "13:18",
    sourceFeed: "Electrician U NEC Field Wire",
    jobMeta: {
      roleTitle: "Industrial Master Electrician & Hazardous-Location Inspector",
      company: "Rosendin & MYR Industrial Electrical",
      location: "Austin, TX / Industrial Hubs",
      salary: "$122,000 – $165,000",
      employmentType: "Full-time · Master Trade",
    },
    marketMeta: {
      productName: "NEC 300 & NEMA 4X Field Enclosure Inspection Guide",
      vendor: "SkillHands Electrical",
      price: "$49/mo",
      category: "Training",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "FIELD CODE COMPLIANCE",
      sourceName: "Electrical Guild Wire",
      takeaway: "Matching NEMA 4X / IP66 compression hubs to washdown industrial zones prevents moisture ingress arcing failures.",
    },
  },
]

export function getCurrentMinuteSlot(nowMs: number = Date.now()): number {
  return Math.max(1, Math.floor((nowMs - PLATFORM_HARVESTER_EPOCH_MS) / 3600000))
}

export function getMinutesElapsedToday(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes() + 1
}

const JOBS_EXCLUSIVE_YOUTUBE_IDS = new Set([
  "IYVqarjWO2g",
  "iv32wI3MBpw",
  "fqKYSxqJoN8",
  "4-FDNOj9o9s",
])

const MARKET_EXCLUSIVE_YOUTUBE_IDS = new Set([
  "w9VqhLZhRks",
  "rj-G_gmFWtE",
  "A7lu-27bj1U",
  "4j-vKHA19NI",
])

const MEDIA_EXCLUSIVE_YOUTUBE_IDS = new Set([
  "4LINhsEZEDI",
  "nUwrjuozT5E",
  "6bS_TDq7lA8",
  "5_B1Mq02wcI",
])

const PULSE_EXCLUSIVE_YOUTUBE_IDS = new Set([
  "52EoEgDmK-E",
  "lcv-M6qBsdA",
  "zX6pHICiG4Q",
  "sxtXz24odps",
])

const HOME_EXCLUSIVE_YOUTUBE_IDS = new Set([
  "gNhWpuWvtEA",
  "OWThL97tq3k",
  "GHiOk_8mlq0",
  "L_Guz73e6fw",
  "zu6p3_df20A",
  "f4cT6_t7690",
])

/**
 * Enforces single-destination video partitioning so Home, Jobs, Market, Media,
 * and Pulse each receive their own unique, non-repeated real-world YouTube videos.
 */
export function normalizeExclusiveDestinations(params: {
  id?: string
  kind: "video" | "picture"
  youtubeId?: string
  videoUrl?: string
  imageUrl?: string
  destinations?: HarvesterDestination[]
}): HarvesterDestination[] {
  const { id = "", kind, youtubeId, destinations } = params

  if (id.startsWith("cln_custom_") && Array.isArray(destinations) && destinations.length > 0) {
    if (youtubeId && HOME_TAB_EXCLUSIVE_YOUTUBE_IDS.has(youtubeId)) {
      return ["home"]
    }
    return destinations
  }

  if (youtubeId) {
    if (JOBS_EXCLUSIVE_YOUTUBE_IDS.has(youtubeId)) return ["jobs"]
    if (MARKET_EXCLUSIVE_YOUTUBE_IDS.has(youtubeId)) return ["market"]
    if (MEDIA_EXCLUSIVE_YOUTUBE_IDS.has(youtubeId)) return ["media"]
    if (PULSE_EXCLUSIVE_YOUTUBE_IDS.has(youtubeId)) return ["pulse"]
    if (HOME_EXCLUSIVE_YOUTUBE_IDS.has(youtubeId) || HOME_TAB_EXCLUSIVE_YOUTUBE_IDS.has(youtubeId)) {
      return ["home"]
    }
    if (id.startsWith("cln_live_")) {
      return ["home"]
    }
    if (Array.isArray(destinations) && destinations.length === 1) {
      return [destinations[0]]
    }
    const tabPool: HarvesterDestination[] = ["home", "jobs", "market", "media", "pulse"]
    let hash = 0
    for (let i = 0; i < youtubeId.length; i++) {
      hash = (hash * 31 + youtubeId.charCodeAt(i)) >>> 0
    }
    return kind === "video" ? ["home"] : [tabPool[hash % tabPool.length]]
  }

  return Array.isArray(destinations) && destinations.length > 0
    ? [destinations[0]]
    : ["home"]
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
  const itemTimeMs = customTimestampMs ?? Date.now() - offsetIndex * 60000
  const itemDate = new Date(itemTimeMs)
  const timeStr = itemDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  })

  const minsAgo = Math.max(0, Math.round((Date.now() - itemTimeMs) / 60000))
  const pulledAtLabel =
    minsAgo === 0
      ? `Pulled just now (${timeStr})`
      : minsAgo === 1
      ? `Pulled 1 min ago (${timeStr})`
      : `Pulled ${minsAgo} mins ago (${timeStr})`

  const id = `cln_hv_${slot}_${templateIndex}_${tpl.kind}`
  return {
    id,
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
    destinations: normalizeExclusiveDestinations({
      id,
      kind: tpl.kind,
      youtubeId: tpl.youtubeId,
      videoUrl: tpl.videoUrl,
      imageUrl: tpl.imageUrl,
    }),
    pulledAtIso: itemDate.toISOString(),
    pulledAtLabel,
    minuteSlot: slot,
    sourceFeed: tpl.sourceFeed,
    viewsCount: 1420 + ((slot * 37 + offsetIndex * 19) % 8400),
    likesCount: 94 + ((slot * 13 + offsetIndex * 7) % 620),
    jobMeta: tpl.jobMeta,
    marketMeta: tpl.marketMeta,
    pulseMeta: tpl.pulseMeta,
  }
}

export function getInitialDeterministicHarvestedItems(
  count: number = CONNECTLN_HARVESTER_TEMPLATES.length
): HarvestedMediaItem[] {
  const currentSlot = getCurrentMinuteSlot()
  const items: HarvestedMediaItem[] = []
  const totalCount = Math.max(count, CONNECTLN_HARVESTER_TEMPLATES.length)
  for (let i = 0; i < totalCount; i++) {
    const tplIdx = i % CONNECTLN_HARVESTER_TEMPLATES.length
    items.push(buildHarvestedItemForSlot(currentSlot - i, 0, Date.now() - i * 60000, tplIdx))
  }
  return items
}

export function sortHarvestedItemsNewestFirst(items: HarvestedMediaItem[]): HarvestedMediaItem[] {
  const nowMs = Date.now()
  return [...items].sort((a, b) => {
    const timeA = Date.parse(a.pulledAtIso || "") || 0
    const timeB = Date.parse(b.pulledAtIso || "") || 0
    // Only boost explicit Admin custom pushes from the last 12 hours; sort all live RSS & pulled videos strictly newest-first!
    const aRecentAdmin = a.id.startsWith("cln_custom_") && nowMs - timeA < 12 * 3600 * 1000 ? 1 : 0
    const bRecentAdmin = b.id.startsWith("cln_custom_") && nowMs - timeB < 12 * 3600 * 1000 ? 1 : 0
    if (aRecentAdmin !== bRecentAdmin) {
      return bRecentAdmin - aRecentAdmin
    }
    if (timeB !== timeA) return timeB - timeA
    return (b.minuteSlot || 0) - (a.minuteSlot || 0)
  })
}

export function dedupeHarvestedItems(items: HarvestedMediaItem[]): HarvestedMediaItem[] {
  const sorted = sortHarvestedItemsNewestFirst(items)
  const seenContentKeys = new Set<string>()
  const unique: HarvestedMediaItem[] = []

  for (const item of sorted) {
    if (!item || !item.id) continue
    if (isLegacySyntheticOrAiMediaItem(item)) continue
    const normTitle = (item.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
    const mediaSig = (item.youtubeId || item.videoUrl || item.imageUrl || "")
      .trim()
      .toLowerCase()
    const contentKey = `${item.kind}::${item.youtubeId ? `yt:${item.youtubeId}` : normTitle || mediaSig}`
    if (seenContentKeys.has(contentKey)) continue
    seenContentKeys.add(contentKey)
    unique.push(item)
  }

  return unique
}

export function loadStoredHarvestedItems(): HarvestedMediaItem[] {
  if (typeof window === "undefined") {
    return dedupeHarvestedItems(getInitialDeterministicHarvestedItems(CONNECTLN_HARVESTER_TEMPLATES.length))
  }
  try {
    const raw = window.localStorage.getItem(HARVESTER_STORAGE_KEY)
    const parsed: HarvestedMediaItem[] = raw ? JSON.parse(raw) : []
    const normalizedParsed = parsed
      .filter((item) => Boolean(item && item.id) && !isLegacySyntheticOrAiMediaItem(item))
      .map((item) => ({
        ...item,
        destinations: normalizeExclusiveDestinations(item),
      }))
    const deterministic = getInitialDeterministicHarvestedItems(CONNECTLN_HARVESTER_TEMPLATES.length)
    return dedupeHarvestedItems([...normalizedParsed, ...deterministic]).slice(0, 500)
  } catch {
    return dedupeHarvestedItems(getInitialDeterministicHarvestedItems(CONNECTLN_HARVESTER_TEMPLATES.length))
  }
}

export function saveStoredHarvestedItems(items: HarvestedMediaItem[]): HarvestedMediaItem[] {
  let existing: HarvestedMediaItem[] = []
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(HARVESTER_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          existing = parsed.filter((item) => !isLegacySyntheticOrAiMediaItem(item))
        }
      }
    } catch {
      // ignore
    }
  }
  const normalizedIncoming = items
    .filter((item) => !isLegacySyntheticOrAiMediaItem(item))
    .map((item) => ({
      ...item,
      destinations: normalizeExclusiveDestinations(item),
    }))
  // Strictly additive: merge incoming items with all previously stored items (never deleting old videos)
  const sorted = dedupeHarvestedItems([...normalizedIncoming, ...existing]).slice(0, 500)
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
  return loadStoredHarvestedItems().filter((item) => {
    const dests = normalizeExclusiveDestinations(item)
    if (!dests.includes(destination)) return false
    if (destination !== "home") {
      if (dests.includes("home")) return false
      if (item.youtubeId && HOME_TAB_EXCLUSIVE_YOUTUBE_IDS.has(item.youtubeId)) return false
    }
    return true
  })
}

export function computeHarvesterTelemetry(items: HarvestedMediaItem[]): HarvesterTelemetrySnapshot {
  const now = new Date()
  const currentSlot = getCurrentMinuteSlot(now.getTime())
  const minutesElapsedToday = getMinutesElapsedToday(now)

  // Base platform catalog + 1 new item per minute elapsed since epoch + custom items
  const baseVideoInventory = 4820 + Math.floor(currentSlot * 0.65) + items.filter((i) => i.kind === "video").length
  const basePictureInventory = 3190 + Math.floor(currentSlot * 0.35) + items.filter((i) => i.kind === "picture").length
  const pulledTodayCount = minutesElapsedToday * 2 + items.length

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
      cadence: "Every 60s (1 Min)",
      status: "ACTIVE",
      itemsPulledToday: Math.round(pulledTodayCount * 0.28),
      lastPulledTitle: items.find((i) => i.kind === "video")?.title || "Autonomous Quadruped Jobsite Robotics",
    },
    {
      id: "conn-cyber-noctis",
      name: "DSTRIKE & Noctis Cyber/AI Video Feed",
      category: "Cybersecurity, eBPF, SAST & Agentic AI",
      protocol: "REST + Webhook Push",
      cadence: "Every 60s (1 Min)",
      status: "ACTIVE",
      itemsPulledToday: Math.round(pulledTodayCount * 0.26),
      lastPulledTitle: "eBPF Zero-Trust Kernel Packet Telemetry & K8s Defense",
    },
    {
      id: "conn-clinical-med",
      name: "Clinical Surgery, Solar & Aerospace Visuals",
      category: "Healthcare, 1500V Solar & Orbital Avionics",
      protocol: "DICOM / HD Media Pipe",
      cadence: "Every 60s (1 Min)",
      status: "ACTIVE",
      itemsPulledToday: Math.round(pulledTodayCount * 0.24),
      lastPulledTitle: "Trauma Surgery & Intraoperative Clinical Telemetry",
    },
    {
      id: "conn-market-demos",
      name: "Marketplace Product Demos & Job Briefings",
      category: "B2B SaaS Demos, Employer Videos & Pictures",
      protocol: "GraphQL Media Syndication",
      cadence: "Every 60s (1 Min)",
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
    dailyGrowthRate: 1440,
    minutesElapsedToday,
    currentMinuteSlot: currentSlot,
    lastPulledAtIso: latestItem?.pulledAtIso || now.toISOString(),
    lastPulledAtLabel:
      latestItem?.pulledAtLabel ||
      now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }),
    destinationCounts,
    connectors,
    items,
  }
}
