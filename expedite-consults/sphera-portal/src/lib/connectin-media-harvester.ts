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

export const HARVESTER_STORAGE_KEY = "connectln_harvested_media_items_v4"
export const HARVESTER_AUTO_ENABLED_KEY = "connectln_harvester_auto_enabled_v1"
export const HARVESTER_EVENT_NAME = "connectln-media-harvested"

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
    title: "eBPF Zero-Trust Kernel Packet Telemetry & Kubernetes Runtime Defense",
    summary:
      "Live kernel-space eBPF socket inspection blocking lateral container movement in sub-millisecond production Kubernetes clusters.",
    videoUrl: "/status-videos/k8s_ebpf.mp4",
    imageUrl: "/images/connectln-studies/packet-soc-cover.jpg",
    authorName: "Dr. Marcus Vance",
    authorRole: "Principal eBPF & Cloud Security Architect",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
    organization: "Expedite Strike Cyber Defense",
    enclaveId: "tech_cybersecurity",
    category: "Cybersecurity & eBPF",
    duration: "03:42",
    sourceFeed: "DSTRIKE & Kernel Defense Video Wire",
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
    title: "Autonomous Quadruped Jobsite Robotics & LiDAR Structural Inspection",
    summary:
      "Field deployment of autonomous robotics scanning 40-foot structural steel and heavy timber bents for millimeter-level BIM tolerance verification.",
    videoUrl: "/status-videos/spot.mp4",
    imageUrl: "/images/connectln-studies/robotics-plc-cover.jpg",
    authorName: "Gus Vandermeer, PE",
    authorRole: "Principal Structural & Robotics Field Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    organization: "Cascade Structural Engineering",
    enclaveId: "trades_construction",
    category: "Skilled Trades & Robotics",
    duration: "02:55",
    sourceFeed: "Skilled Trades & Jobsite Cam Wire",
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
    sourceFeed: "Industrial & Cleanroom Photo Wire",
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
    title: "Agentic AI Flywheel & Multi-Agent MCP Enterprise Orchestration",
    summary:
      "Walkthrough of autonomous AI agents executing tool calls, DAST security verification, and zero-trust compliance checks across enterprise enclaves.",
    videoUrl: "/status-videos/agentic_flywheel.mp4",
    imageUrl: "/images/connectln-studies/agentic-mcp-cover.jpg",
    authorName: "Kwesi Asiedu",
    authorRole: "Chief AI & Cybersecurity Architect · ConnectLn",
    authorAvatar: "/brand/kwesi-avatar.png",
    organization: "Expedite Consults",
    enclaveId: "tech_cybersecurity",
    category: "Agentic AI & MCP",
    duration: "04:18",
    sourceFeed: "Noctis AI & MCP Studio Feed",
    jobMeta: {
      roleTitle: "Staff Agentic AI & MCP Protocol Architect",
      company: "Expedite Consults · Noctis AI",
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
      takeaway: "Deterministic MCP tool sandboxes cut enterprise autonomous agent hallucination rates below 0.2% in production workflows.",
    },
  },
  {
    kind: "video",
    title: "Trauma Surgery & Intraoperative Clinical Telemetry Walkthrough",
    summary:
      "Attending surgical team demonstrating real-time hemodynamic monitoring, orthopedic fixation alignment, and rapid emergency triage workflows.",
    videoUrl: "/status-videos/physician.mp4",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&auto=format&fit=crop&q=80",
    authorName: "Dr. Elena Rostova, MD, FACS",
    authorRole: "Attending Orthopedic Trauma Surgeon",
    authorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=240&auto=format&fit=crop&q=80",
    organization: "Metro Level-1 Trauma & Surgical Center",
    enclaveId: "healthcare_medicine",
    category: "Healthcare & Surgery",
    duration: "03:15",
    sourceFeed: "Clinical & MedTech Visual Feed",
    jobMeta: {
      roleTitle: "Attending Orthopedic Trauma Surgeon & Clinical Lead",
      company: "Metro Level-1 Trauma Center",
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
      takeaway: "Intraoperative AI fluoroscopy guidance reduces pelvic reconstruction fixation time by 28 minutes per case.",
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
    sourceFeed: "Renewable Grid & Field Photo Wire",
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
    title: "Live Red-Team Breach Drill & SOC Incident Containment Simulation",
    summary:
      "Inside an active Security Operations Center executing automated playbook containment against simulated zero-day credential harvesting.",
    videoUrl: "/status-videos/scenario_drill.mp4",
    imageUrl: "/images/connectln-studies/cyber-specialist-cover.jpg",
    authorName: "Hannah Boateng, CISSP",
    authorRole: "Principal SOC Commander & Threat Hunter",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80",
    organization: "Aagiis Federal Compliance & SOC",
    enclaveId: "tech_cybersecurity",
    category: "SOC & Threat Hunting",
    duration: "03:50",
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
      takeaway: "Automated SOAR identity token revocation isolates compromised federated sessions in under 4.2 seconds.",
    },
  },
  {
    kind: "video",
    title: "Commercial Real Estate Development & Luxury Architectural Walkthrough",
    summary:
      "On-site executive tour of mixed-use commercial construction, curtain-wall glazing installation, and smart building MEP automation.",
    videoUrl: "/status-videos/realtor.mp4",
    imageUrl: "/images/connectln-studies/business-capstone-cover.jpg",
    authorName: "Suzzan Coldwell",
    authorRole: "Senior Commercial Development & Brokerage Director",
    authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80",
    organization: "Coldwell Commercial Partners",
    enclaveId: "trades_construction",
    category: "Commercial Real Estate & MEP",
    duration: "02:38",
    sourceFeed: "Commercial Property & Build Wire",
    jobMeta: {
      roleTitle: "Senior Commercial Construction & Development Project Director",
      company: "Coldwell Commercial Partners",
      location: "New York, NY / Hybrid",
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
      takeaway: "Class-A commercial retrofits integrating automated HVAC heat-recovery chillers cut tenant operating expenses by 24%.",
    },
  },
  {
    kind: "picture",
    title: "Heavy Timber Framing & Commercial Superintendent Blueprint Review",
    summary:
      "Master carpenters and site superintendents verifying mortise-and-tenon drawbore tolerances and structural crane pick rigging schedules.",
    imageUrl: "/images/connectln-studies/trades-superintendent-cover.jpg",
    authorName: "Markus Thorne",
    authorRole: "Commercial Framing & Craft Superintendent",
    authorAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=240&auto=format&fit=crop&q=80",
    organization: "Turner & Cascade Timber Guild",
    enclaveId: "trades_construction",
    category: "Heavy Timber & Rigging",
    sourceFeed: "Master Tradesmen Photo Dispatch",
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
    kind: "video",
    title: "Full-Stack Cloud IDE, AST Static Code Analysis & Live DevSecOps Pipeline",
    summary:
      "Real-time demonstration of sub-4ms abstract syntax tree (AST) vulnerability scanning and automated pull-request remediation inside ConnectLn DevHub.",
    videoUrl: "/status-videos/developer.mp4",
    imageUrl: "/images/connectln-studies/mlops-data-cover.jpg",
    authorName: "Alex Taylor",
    authorRole: "Principal DevSecOps & SAST Engine Architect",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80",
    organization: "05-SAST & Trepath Security",
    enclaveId: "tech_cybersecurity",
    category: "DevSecOps & SAST",
    duration: "03:24",
    sourceFeed: "05-SAST & DevHub Live Stream",
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
    title: "Aerospace Orbital Telemetry & Deep-Space Avionics Systems Briefing",
    summary:
      "Mission control avionics verification, radiation-hardened flight computer buses, and cryogenic propulsion valve diagnostics.",
    videoUrl: "/status-videos/nasa_space.mp4",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop&q=80",
    authorName: "Capt. Priya Patel",
    authorRole: "Lead Spacecraft Avionics & Flight Systems Director",
    authorAvatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=240&auto=format&fit=crop&q=80",
    organization: "Orbital Dynamics & Defense",
    enclaveId: "aviation_aerospace_maritime",
    category: "Aerospace & Avionics",
    duration: "03:10",
    sourceFeed: "Aerospace & Avionics Video Wire",
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
    sourceFeed: "Aagiis Compliance Visual Ledger",
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
    title: "Quantitative Financial Modeling, Compensation Benchmarking & Cap-Table Engine",
    summary:
      "Live actuarial breakdown of total direct compensation, equity refresh modeling, and B2B SaaS unit economics across global tiers.",
    videoUrl: "/status-videos/calc.mp4",
    imageUrl: "/images/connectln-studies/certifications-hub-cover.jpg",
    authorName: "Michael Koomson, CFA",
    authorRole: "Managing Partner · Quantitative FinOps & Valuation",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80",
    organization: "Sphera Venture & FinOps",
    enclaveId: "tech_cybersecurity",
    category: "FinOps & Executive Strategy",
    duration: "02:48",
    sourceFeed: "Enterprise FinOps & Market Wire",
    jobMeta: {
      roleTitle: "VP of Cloud FinOps & Quantitative Revenue Operations",
      company: "Sphera Venture & FinOps",
      location: "New York, NY / Remote",
      salary: "$195,000 – $245,000",
      employmentType: "Full-time · Finance & Ops",
    },
    marketMeta: {
      productName: "Sphera Cloud FinOps & Unit Economics Intelligence",
      vendor: "Sphera Portal",
      price: "$249/mo",
      category: "Software",
      liveUrl: "https://expediteconsults.com",
    },
    pulseMeta: {
      severityOrTag: "MARKET & FINOPS BRIEF",
      sourceName: "ConnectLn Executive Wire",
      takeaway: "Dynamic GPU cluster spot-instance rightsizing saves enterprise AI teams an average of 41% on monthly inference spend.",
    },
  },
  {
    kind: "video",
    title: "Commercial Drywall Finishing & Level-5 Architectural Skim Coat Mastery",
    summary:
      "Union drywall tapers and finishers operating automatic bazooka tapers, flat boxes, and laser-lit Level-5 skim coat inspections on commercial hospital corridors.",
    youtubeId: "GUx4NwOXYzw",
    imageUrl: "https://i.ytimg.com/vi/GUx4NwOXYzw/hqdefault.jpg",
    authorName: "IUPAT Commercial Finishing Guild",
    authorRole: "Master Drywall Taper & Level-5 Acoustic Finish Specialist",
    authorAvatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=240&auto=format&fit=crop&q=80",
    organization: "International Union of Painters & Allied Trades",
    enclaveId: "trades_construction",
    category: "Drywall & Interior Systems",
    duration: "05:12",
    sourceFeed: "Admin 1-Min Interior Systems Wire",
    jobMeta: {
      roleTitle: "Lead Commercial Drywall Finisher & Acoustic Ceiling Foreman",
      company: "Performance Contracting & IUPAT Guild",
      location: "Chicago, IL · Commercial Field",
      salary: "$108,000 – $142,000",
      employmentType: "Full-time · Master Trade",
    },
    marketMeta: {
      productName: "Commercial Drywall Takeoff & Level-5 QA Estimator",
      vendor: "SkillHands Pro",
      price: "$39/mo",
      category: "Training",
      liveUrl: "https://skillhands-client.vercel.app",
    },
    pulseMeta: {
      severityOrTag: "CRAFT MASTERY DISPATCH",
      sourceName: "Interior Finishing Wire",
      takeaway: "Automated bazooka taping and pneumatic corner rollers increase commercial corridor Level-4/Level-5 output by 42%.",
    },
  },
  {
    kind: "video",
    title: "Master Tile & Large-Format Porcelain Substrate Layout, Mortar Troweling & Lippage Control",
    summary:
      "Step-by-step TCNA substrate flatness verification, directional 1/2-inch notch troweling, and mechanical lippage tuning for gauged porcelain panels.",
    youtubeId: "NgmmTMUmdPY",
    imageUrl: "https://i.ytimg.com/vi/NgmmTMUmdPY/hqdefault.jpg",
    authorName: "Marco Bellini, CTI · Tile Setters Guild",
    authorRole: "Certified Tile Installer (CTI) & Stone Masonry Lead",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80",
    organization: "National Tile & Terrazzo Enclave",
    enclaveId: "trades_construction",
    category: "Tile & Architectural Stone",
    duration: "06:40",
    sourceFeed: "Admin 1-Min Tile & Masonry Wire",
    jobMeta: {
      roleTitle: "Certified Large-Format Porcelain & Architectural Stone Setter (CTI)",
      company: "Artisan Stone & Commercial Terrazzo",
      location: "Miami, FL / Las Vegas, NV",
      salary: "$112,000 – $154,000",
      employmentType: "Full-time · Architectural Craft",
    },
    marketMeta: {
      productName: "TCNA Substrate Deflection & Thinset Coverage Calculator",
      vendor: "DeskNote Field",
      price: "$49/mo",
      category: "Software",
      liveUrl: "https://desk-note.app/",
    },
    pulseMeta: {
      severityOrTag: "ARCHITECTURAL FINISH BRIEF",
      sourceName: "Tile & Stone Guild Wire",
      takeaway: "Back-buttering gauged porcelain slabs with parallel trowel ridges achieves >95% ANSI A108.5 mortar contact in wet commercial zones.",
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
    sourceFeed: "Noctis AI Visual Research Feed",
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

  // Deduplicate by canonical media URL / YouTube ID so the same video never repeats across minute slots
  const seenMediaKeys = new Set<string>()
  const unique: HarvestedMediaItem[] = []
  for (const item of sorted) {
    if (!item || !item.id) continue
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
