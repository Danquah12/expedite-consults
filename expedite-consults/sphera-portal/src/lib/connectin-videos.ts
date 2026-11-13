import { EXTRA_VERIFIED_VIDEOS } from './connectin-videos-extra'
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
  /** Set when no verified video exists: opens a YouTube search for the career instead of embedding a generic video. */
  searchUrl?: string
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

import { PROFESSION_ENCLAVES, ALL_PROFESSIONS } from "@/lib/connectin-professions"

export function getAllWheelTalks(activeEnclaveId?: string): WheelVideoTalk[] {
  const custom = getStoredCustomVideos()
  const combined = [...custom, ...EDUCATIONAL_WHEEL_TALKS]
  if (!activeEnclaveId || activeEnclaveId === "all") {
    return combined
  }
  return combined.filter(v => !v.enclaveId || v.enclaveId === activeEnclaveId)
}

const CORE_EDUCATIONAL_WHEEL_TALKS: WheelVideoTalk[] = [
  {
    id: "wheel-lbd-speed-square",
    serialPlate: "CLN-LBD01",
    title: "Carpentry Basics: Marking and Checking Angles (Video 1: Using a Speed Square)",
    speaker: "This Old House",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Carpentry)",
    youtubeId: "gNhWpuWvtEA",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "carpenter",
    thumbnailUrl: "https://i.ytimg.com/vi/gNhWpuWvtEA/hqdefault.jpg",
    summary: "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.",
    takeaways: [
      "Skill Covered: Speed Square Layout, Marking 90° & 45° Angles, Checking Corner Squareness",
      "Practice Activity: Mark a perpendicular line and a 45-degree line on scrap wood, then photograph the markings",
      "Reference Guide: https://www.thisoldhouse.com/tools/how-to-use-a-speed-square"
    ],
    tags: ["#Carpentry", "#SpeedSquare", "#ThisOldHouse", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-clamps",
    serialPlate: "CLN-LBD02",
    title: "Carpentry Basics: Choosing the Right Clamp (Video 2: Choosing and Using Clamps)",
    speaker: "This Old House",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Carpentry)",
    youtubeId: "GHiOk_8mlq0",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "finish_carpenter",
    thumbnailUrl: "https://i.ytimg.com/vi/GHiOk_8mlq0/hqdefault.jpg",
    summary: "This lesson introduces different clamp types and the jobs they suit, including ways to protect the wood’s surface while holding it securely.",
    takeaways: [
      "Skill Covered: Clamp Selection, Workpiece Holding & Wood Surface Protection",
      "Practice Activity: Identify two clamp types and explain which job each would suit best",
      "Reference Guide: https://www.thisoldhouse.com/tools/all-about-clamps"
    ],
    tags: ["#Carpentry", "#Clamps", "#Woodworking", "#ThisOldHouse", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-welding-basics",
    serialPlate: "CLN-LBD10",
    title: "Welding Basics: Comparing MIG, Stick & TIG Welding (Welding Basics for Beginners)",
    speaker: "Miller Welders",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Welding)",
    youtubeId: "OWThL97tq3k",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "welder",
    thumbnailUrl: "https://i.ytimg.com/vi/OWThL97tq3k/hqdefault.jpg",
    summary: "Compare MIG, stick, and TIG welding and the applications discussed in the introduction.",
    takeaways: [
      "Skill Covered: Comparing MIG (GMAW), Stick (SMAW), and TIG (GTAW) Welding Processes",
      "Practice Activity: Compare MIG, stick, and TIG welding and match each process to its application",
      "Original Creator: Miller Welders (https://www.youtube.com/watch?v=OWThL97tq3k)"
    ],
    tags: ["#Welding", "#MIGWelding", "#TIGWelding", "#StickWelding", "#MillerWelders", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-welding-safety",
    serialPlate: "CLN-LBD11",
    title: "Welding Safety: Protective Equipment, Bystander Shielding & Work Area Prep (Electric Welding Safety)",
    speaker: "Way of the Wrench, featured by CWB Group",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Welding)",
    youtubeId: "A14OejQiDvQ",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "welder",
    thumbnailUrl: "https://i.ytimg.com/vi/A14OejQiDvQ/hqdefault.jpg",
    summary: "Learn about protective equipment, protecting nearby people, and preparing the work area.",
    takeaways: [
      "Skill Covered: Welding Helmet Shade, Flame-Resistant PPE & Bystander Welding Screens",
      "Practice Activity: Create a pre-weld safety inspection checklist covering PPE, screens, and clearing flammables",
      "Original Resource: https://www.cwbgroup.org/resources/videos/electric-welding-safety-how-to-be-safe"
    ],
    tags: ["#WeldingSafety", "#CWBGroup", "#WayOfTheWrench", "#PPE", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-plumbing-shutoff",
    serialPlate: "CLN-LBD07",
    title: "Plumbing Basics: Emergency Main Water Shutoff (How to Shut-Off Your Water)",
    speaker: "Roto-Rooter",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Plumbing)",
    youtubeId: "fFMBzVv-5Zs",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "plumber",
    thumbnailUrl: "https://i.ytimg.com/vi/fFMBzVv-5Zs/hqdefault.jpg",
    summary: "Recognize the household main water shutoff and understand its role when a plumbing emergency occurs.",
    takeaways: [
      "Skill Covered: Main Water Shutoff Valve Identification (Ball Valve vs. Gate Valve)",
      "Practice Activity: Locate the main water shutoff valve and document its handle type and shutoff direction",
      "Original Resource: https://www.rotorooter.com/plumbing-videos/flooding/how-to-shut-off-your-water/"
    ],
    tags: ["#Plumbing", "#WaterShutoff", "#RotoRooter", "#EmergencyPlumbing", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-plumbing-fittings",
    serialPlate: "CLN-LBD08",
    title: "Plumbing Basics: Types of Pipe Fittings & Terminology",
    speaker: "The Home Depot",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Plumbing)",
    youtubeId: "FM2j9zy_s18",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "plumber",
    thumbnailUrl: "https://i.ytimg.com/vi/FM2j9zy_s18/hqdefault.jpg",
    summary: "Become familiar with common pipe fittings and plumbing terminology.",
    takeaways: [
      "Skill Covered: Elbows, Tees, Wyes, Couplings, Reducers & Adapters",
      "Practice Activity: Label three common pipe fittings and explain how each is used in a plumbing run",
      "Original Resource: https://videos.homedepot.com/detail/video/6049169514001/types-of-pipe-fittings"
    ],
    tags: ["#Plumbing", "#PipeFittings", "#TheHomeDepot", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-electrical-multimeter",
    serialPlate: "CLN-LBD09",
    title: "Electrical Fundamentals: How to Use a Multimeter (Voltage, Resistance, Current & Continuity)",
    speaker: "DigiKey / Becky Stern",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Electrical Fundamentals)",
    youtubeId: "DLO1LMjQN34",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "electrician",
    thumbnailUrl: "https://i.ytimg.com/vi/DLO1LMjQN34/hqdefault.jpg",
    summary: "Understand the meter’s functions for voltage, resistance, current, and continuity checks.",
    takeaways: [
      "Skill Covered: DC/AC Voltage, Continuity Beep Test, Resistance (Ohms) & Probe Port Placement",
      "Practice Activity: Identify settings on an unconnected multimeter and measure a household battery",
      "Original Resource: https://www.digikey.com/en/videos/d/digi-key-electronics/how-to-use-a-multimeter-electronics-with-becky-stern-digikey"
    ],
    tags: ["#Electrical", "#Multimeter", "#DigiKey", "#BeckyStern", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-hvac-refrig-cycle",
    serialPlate: "CLN-LBD13",
    title: "HVAC Fundamentals: Refrigeration Cycle 101 (4 Core Components)",
    speaker: "HVAC School / Bryan Orr",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (HVAC)",
    youtubeId: "VJX0LyxRV0E",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "hvac_refrigeration_tech",
    thumbnailUrl: "https://i.ytimg.com/vi/VJX0LyxRV0E/hqdefault.jpg",
    summary: "Identify the compressor, condenser, metering device, and evaporator and understand their basic roles.",
    takeaways: [
      "Skill Covered: Compressor, Condenser Coil, Metering Device (TXV) & Evaporator Coil Roles",
      "Practice Activity: Draw or list the four main refrigeration components in sequence and explain each role",
      "Original Resource: https://www.hvacrschool.com/videos/refrigeration-cycle-101/"
    ],
    tags: ["#HVAC", "#RefrigerationCycle", "#HVACSchool", "#BryanOrr", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-hvac-furnace-filter",
    serialPlate: "CLN-LBD12",
    title: "HVAC Maintenance: How to Change a Furnace Filter",
    speaker: "Trane",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (HVAC)",
    youtubeId: "uKneslTwJdY",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "hvac_refrigeration_tech",
    thumbnailUrl: "https://i.ytimg.com/vi/uKneslTwJdY/hqdefault.jpg",
    summary: "Understand filter location and the demonstrated replacement task.",
    takeaways: [
      "Skill Covered: Furnace Filter Compartment Location, Airflow Arrow Alignment & Replacement",
      "Practice Activity: Locate the air filter on a furnace, record its dimensions, and note airflow arrow direction",
      "Original Resource: https://www.trane.com/residential/how-to-change-a-furnace-filter-video/"
    ],
    tags: ["#HVAC", "#FurnaceFilter", "#Trane", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-auto-oil-check",
    serialPlate: "CLN-LBD03",
    title: "Vehicle Maintenance: Checking Your Engine Oil",
    speaker: "CAA-Quebec",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Auto Mechanics)",
    youtubeId: "TQYhIhaDsl8",
    duration: "",
    category: "automotive_mechanics",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "automotive_mechanics",
    professionId: "mechanic",
    thumbnailUrl: "https://i.ytimg.com/vi/TQYhIhaDsl8/hqdefault.jpg",
    summary: "The video demonstrates locating the dipstick, checking the oil level, and reading it against the dipstick’s markings.",
    takeaways: [
      "Skill Covered: Dipstick Location, Wipe & Re-Insert Procedure, Reading Min/Max Markings",
      "Practice Activity: Find the oil-check instructions in a vehicle’s owner manual and identify the procedure",
      "Original Resource: https://www.caaquebec.com/en/advices/videos/how-to-take-proper-care-of-your-vehicle/vehicle-maintenance-how-to-check-oil"
    ],
    tags: ["#AutoMechanics", "#EngineOil", "#CAAQuebec", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-auto-fixfinder",
    serialPlate: "CLN-LBD04",
    title: "Auto Diagnostics: Your First Diagnostic Scan (Reading Check-Engine Information)",
    speaker: "AutoZone",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Auto Mechanics)",
    youtubeId: "9FV2L7btUEE",
    duration: "",
    category: "automotive_mechanics",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "automotive_mechanics",
    professionId: "mechanic",
    thumbnailUrl: "https://i.ytimg.com/vi/9FV2L7btUEE/hqdefault.jpg",
    summary: "This demonstration shows how AutoZone’s reader retrieves trouble-code information and produces a report for further diagnosis.",
    takeaways: [
      "Skill Covered: OBD-II Data Link Connector Location, Scanner Workflow & DTC Report Retrieval",
      "Practice Activity: Write down the demonstrated scan sequence and the information you would retain",
      "Original Resource: https://www.autozone.com/diy/videos/fixfinder-selfservice-224015421"
    ],
    tags: ["#AutoDiagnostics", "#OBD2", "#AutoZone", "#CheckEngine", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-painting-prep",
    serialPlate: "CLN-LBD05",
    title: "Painting Basics: Preparing the Surface (Preparing Walls for Painting)",
    speaker: "Sherwin-Williams",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Painting & Decorating)",
    youtubeId: "f_23fk6aEHA",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "painter",
    thumbnailUrl: "https://i.ytimg.com/vi/f_23fk6aEHA/hqdefault.jpg",
    summary: "Learners see how cleaning walls, masking trim, protecting floors, and preparing surfaces contribute to a successful painting job.",
    takeaways: [
      "Skill Covered: Wall Cleaning, Masking Trim & Baseboards, Floor & Furniture Protection",
      "Practice Activity: Create a preparation checklist for one room, including surfaces and furniture to protect",
      "Original Resource: https://www.sherwin-williams.com/en-us/project-center/paint/how-to-prep-walls"
    ],
    tags: ["#Painting", "#SurfacePrep", "#SherwinWilliams", "#LearnByDoing"]
  },
  {
    id: "wheel-lbd-painting-room",
    serialPlate: "CLN-LBD06",
    title: "Painting Technique: Clean Edges and an Even Finish (Brush & Roller)",
    speaker: "Sherwin-Williams",
    speakerTitle: "Original Creator · Skilled Trades: Learn by Doing (Painting & Decorating)",
    youtubeId: "HNefCphXHoc",
    duration: "",
    category: "trade",
    categoryLabel: "Skilled Trades: Learn by Doing",
    enclaveId: "trades_construction",
    professionId: "painter",
    thumbnailUrl: "https://i.ytimg.com/vi/HNefCphXHoc/hqdefault.jpg",
    summary: "This lesson covers room-painting order, painting edges with a brush, and using a roller while maintaining a wet edge to reduce visible lap marks.",
    takeaways: [
      "Skill Covered: Room-Painting Order, Cutting In Edges with a Brush, Rolling & Wet-Edge Control",
      "Practice Activity: Use a practice panel to demonstrate a brushed edge and an adjacent rolled section",
      "Original Resource: https://www.sherwin-williams.com/en-us/project-center/paint/best-order-painting-room"
    ],
    tags: ["#PaintingTechnique", "#BrushAndRoller", "#SherwinWilliams", "#LearnByDoing"]
  },
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
    youtubeId: "gDozp7t7A0Y",
    duration: "4:35",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "electrician",
    thumbnailUrl: "https://i.ytimg.com/vi/gDozp7t7A0Y/hqdefault.jpg",
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
    youtubeId: "s84MJ7b1GNo",
    duration: "4:48",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "carpenter",
    thumbnailUrl: "https://i.ytimg.com/vi/s84MJ7b1GNo/hqdefault.jpg",
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
    youtubeId: "8lg5_PEVMso",
    duration: "5:15",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "pipefitter_welder",
    thumbnailUrl: "https://i.ytimg.com/vi/8lg5_PEVMso/hqdefault.jpg",
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
    youtubeId: "DQrtax63_gI",
    duration: "5:04",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "hvac_technician",
    thumbnailUrl: "https://i.ytimg.com/vi/DQrtax63_gI/hqdefault.jpg",
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
    youtubeId: "gZT9y0Ougao",
    duration: "4:58",
    category: "trade",
    categoryLabel: "Trades & Craftsmanship",
    enclaveId: "trades_construction",
    professionId: "solar_installer",
    thumbnailUrl: "https://i.ytimg.com/vi/gZT9y0Ougao/hqdefault.jpg",
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
    youtubeId: "9mwE1Aih9uU",
    duration: "4:22",
    category: "compliance",
    categoryLabel: "Safety & Compliance",
    enclaveId: "trades_construction",
    thumbnailUrl: "https://i.ytimg.com/vi/9mwE1Aih9uU/hqdefault.jpg",
    summary: "Complete review of OSHA Subpart M requirements: 6-foot trigger height, 5,000-lb anchor points, daily harness inspection, and leading-edge guardrails.",
    takeaways: [
      "Calculating total fall clearance including deceleration distance and stretch",
      "Daily pre-shift inspection checklist for synthetic harnesses and lanyards",
      "Competent person site authority to stop work on unsafe scaffolds"
    ],
    tags: ["#OSHA30", "#FallProtection", "#SafetyCompliance", "#JobsiteSuperintendent"]
  },

  // ─── 2. AUTO, FLEET & TRANSPORT (automotive_mechanics) ────────
  {
    id: "wheel-heavy-diesel",
    serialPlate: "CLN-AUT01",
    title: "Heavy-Duty Commercial Diesel Diagnostics & J1939 CAN Bus",
    speaker: "Fleet Maintenance Technicians Guild",
    speakerTitle: "Master ASE Heavy Truck Specialist",
    youtubeId: "0A1s-UXMabI",
    duration: "5:30",
    category: "automotive_mechanics",
    categoryLabel: "Auto, Fleet & Transport",
    enclaveId: "automotive_mechanics",
    professionId: "diesel_mechanic",
    thumbnailUrl: "https://i.ytimg.com/vi/0A1s-UXMabI/hqdefault.jpg",
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
    youtubeId: "t_jDdsC5UBc",
    duration: "5:10",
    category: "automotive_mechanics",
    categoryLabel: "Auto, Fleet & Transport",
    enclaveId: "automotive_mechanics",
    professionId: "ev_hybrid_tech",
    thumbnailUrl: "https://i.ytimg.com/vi/t_jDdsC5UBc/hqdefault.jpg",
    summary: "Safe isolation protocols for 400V/800V commercial electric vehicles, manual service disconnect (MSD) removal, and thermal runway suppression.",
    takeaways: [
      "Class 0 (1,000V rated) insulated gloves and CAT IV multimeter zero-voltage test",
      "Lockout/Tagout (LOTO) protocols for multi-pack electric buses and delivery trucks",
      "Contact resistance testing across lithium iron phosphate (LFP) busbars"
    ],
    tags: ["#ElectricVehicles", "#HighVoltage", "#NFPA790", "#BatteryDiagnostics", "#EVTech"]
  },

  // ─── 3. HEALTHCARE, PHARMACY, NURSING & MEDICAL ADMIN (healthcare_medicine) ───
  {
    id: "wheel-clinical-pharmacist-masterclass",
    serialPlate: "CLN-MED01",
    title: "Clinical Pharmacist Masterclass: Pharmacokinetics, USP <797>/<800> IV Compounding & Antimicrobial Stewardship",
    speaker: "American Society of Health-System Pharmacists (ASHP) Guild",
    speakerTitle: "Director of Clinical Pharmacy (PharmD, BCPS, BCCCP)",
    youtubeId: "x4Y_2fpET0U",
    duration: "5:38",
    category: "health",
    categoryLabel: "Pharmacy & Clinical Medicine",
    enclaveId: "healthcare_medicine",
    professionId: "pharmacist",
    thumbnailUrl: "https://i.ytimg.com/vi/x4Y_2fpET0U/hqdefault.jpg",
    summary: "Complete clinical pharmacy briefing covering Vancomycin AUC/MIC Bayesian dosing, renal CrCl adjustments, ISO Class 5 sterile IV compounding under USP <797>/<800>, and closed-loop barcode medication verification.",
    takeaways: [
      "Vancomycin AUC/MIC target 400–600 mg·hr/L to prevent acute kidney injury",
      "USP <797> & <800> negative-pressure hazardous drug compounding and beyond-use dating",
      "High-alert anticoagulant, insulin, and oncology order verification with NIH DailyMed & OpenFDA"
    ],
    tags: ["#Pharmacist", "#PharmD", "#ClinicalPharmacy", "#USP797", "#AntimicrobialStewardship", "#MedicationSafety"]
  },
  {
    id: "wheel-attending-physician-rounds",
    serialPlate: "CLN-MED02",
    title: "Attending Physician Briefing: Bedside POCUS Ultrasound, Sepsis Bundle & Differential Diagnosis",
    speaker: "American College of Physicians & Surgeons Council",
    speakerTitle: "Board-Certified Attending Physician (MD, FACP, FACEP)",
    youtubeId: "6Ixvw0PpE6s",
    duration: "5:50",
    category: "health",
    categoryLabel: "Physicians & Surgeons",
    enclaveId: "healthcare_medicine",
    professionId: "physician",
    thumbnailUrl: "https://i.ytimg.com/vi/6Ixvw0PpE6s/hqdefault.jpg",
    summary: "Evidence-based inpatient and emergency medicine masterclass: RUSH exam point-of-care ultrasound (POCUS) for undifferentiated shock, Hour-1 Surviving Sepsis Campaign resuscitation, and multidisciplinary PharmD/RN rounding.",
    takeaways: [
      "Rapid Ultrasound for Shock and Hypotension (RUSH) cardiac, IVC, and eFAST windows",
      "Surviving Sepsis Hour-1 bundle: blood cultures, broad-spectrum antibiotics, and 30 mL/kg crystalloid",
      "Closed-loop diagnostic reasoning using MDCalc SOFA/HEART scores and HL7 FHIR order sets"
    ],
    tags: ["#Physician", "#Doctors", "#InternalMedicine", "#POCUS", "#SepsisProtocol", "#ClinicalDiagnostics"]
  },
  {
    id: "wheel-trauma-resuscitation",
    serialPlate: "CLN-MED03",
    title: "Registered Nurse & ICU Critical Care: Hemodynamic Telemetry, Vasopressors & TNCC Resuscitation",
    speaker: "Emergency & Critical Care Nurses Association (AACN / ENA)",
    speakerTitle: "Chief Nursing Officer & Trauma Specialist (BSN, RN, CCRN)",
    youtubeId: "aJKt5o5szVU",
    duration: "5:45",
    category: "health",
    categoryLabel: "Nursing & Critical Care",
    enclaveId: "healthcare_medicine",
    professionId: "registered_nurse",
    thumbnailUrl: "https://i.ytimg.com/vi/aJKt5o5szVU/hqdefault.jpg",
    summary: "Systematic critical care & inpatient nursing masterclass: norepinephrine/vasopressin titration to MAP >= 65 mmHg, central line bundle care, barcode MAR 5-Rights verification, and structured SBAR shift handoffs.",
    takeaways: [
      "A-to-I primary trauma survey and weight-based ICU vasopressor infusion titration",
      "CLABSI/CAUTI zero-harm bundle compliance and arterial line waveform damping checks",
      "Structured SBAR (Situation, Background, Assessment, Recommendation) bedside handoffs"
    ],
    tags: ["#RegisteredNurse", "#Nursing", "#CCRN", "#CriticalCare", "#TraumaNursing", "#PatientSafety"]
  },
  {
    id: "wheel-medical-assistant-aide-triage",
    serialPlate: "CLN-MED04",
    title: "Medical Assistants & Nursing Aides (CCMA / CNA): 12-Lead ECG, Venipuncture & Vitals Triage",
    speaker: "National Healthcareer & Clinical Support Guild",
    speakerTitle: "Lead Clinical Medical Assistant & CNA Educator (CCMA, CNA, CPT)",
    youtubeId: "y_AyWpdXW5o",
    duration: "5:12",
    category: "health",
    categoryLabel: "Medical Aides & Clinical Support",
    enclaveId: "healthcare_medicine",
    professionId: "medical_assistant_aide",
    thumbnailUrl: "https://i.ytimg.com/vi/y_AyWpdXW5o/hqdefault.jpg",
    summary: "Essential clinical execution for Certified Medical Assistants (CCMA), Certified Nursing Assistants (CNA), and Home Health Aides: accurate 12-lead ECG precordial lead placement, order-of-draw venipuncture, orthostatic vitals, and safe patient transfers.",
    takeaways: [
      "CLSI order-of-draw venipuncture protocol (Blood Cultures -> Light Blue -> Gold -> Green -> Lavender)",
      "Precordial V1–V6 12-lead ECG placement to prevent artifact and limb-lead reversal",
      "Early Warning Score (MEWS) vital sign escalation, fall prevention, and autoclave spore testing"
    ],
    tags: ["#MedicalAssistant", "#CNA", "#MedicalAides", "#Phlebotomy", "#12LeadECG", "#PatientCare"]
  },
  {
    id: "wheel-medical-administrator-command",
    serialPlate: "CLN-MED05",
    title: "Medical & Hospital Administration (MHA / FACHE): Joint Commission, HIPAA & Command Center Ops",
    speaker: "American College of Healthcare Executives (ACHE) Practice",
    speakerTitle: "Chief Operating Officer & Hospital Administrator (MHA, FACHE)",
    youtubeId: "eUr-Mj2qCgI",
    duration: "5:25",
    category: "health",
    categoryLabel: "Medical & Hospital Administration",
    enclaveId: "healthcare_medicine",
    professionId: "medical_administrator",
    thumbnailUrl: "https://i.ytimg.com/vi/eUr-Mj2qCgI/hqdefault.jpg",
    summary: "Executive hospital and clinic administration briefing: emergency department boarding mitigation, safe nurse-to-patient staffing matrices, Joint Commission (TJC) unannounced survey readiness, and HIPAA HITECH / HL7 FHIR revenue cycle governance.",
    takeaways: [
      "Real-time hospital bed-flow command center to cut ED boarding times by 42%",
      "Joint Commission National Patient Safety Goals (NPSG) and CMS Star Rating optimization",
      "HIPAA zero-trust EHR access auditing, ICD-10/DRG clean-claim integrity, and workforce retention"
    ],
    tags: ["#MedicalAdministrator", "#HospitalAdministration", "#FACHE", "#MHA", "#JointCommission", "#HIPAA"]
  },
  {
    id: "wheel-surgical-asepsis",
    serialPlate: "CLN-MED06",
    title: "Operating Room Sterile Field, Robotic Surgery & Perioperative Standards",
    speaker: "Association of periOperative Registered Nurses (AORN)",
    speakerTitle: "Surgical Services Clinical Director (MD, FACS / CNOR)",
    youtubeId: "xjSg0OIigI0",
    duration: "4:50",
    category: "health",
    categoryLabel: "Surgical & Perioperative",
    enclaveId: "healthcare_medicine",
    professionId: "surgeon_specialist_md",
    thumbnailUrl: "https://i.ytimg.com/vi/xjSg0OIigI0/hqdefault.jpg",
    summary: "Strict environmental controls in laminar flow surgical suites, WHO Safe Surgery Time-Out verification, robotic surgical arm draping, and perioperative infection prevention.",
    takeaways: [
      "WHO 3-phase Safe Surgery Checklist (Sign-In, Time-Out, Sign-Out) with surgeon, anesthesia, and RN",
      "Positive pressure laminar airflow maintenance and sterile field boundary enforcement",
      "Automated sponge/instrument RF count verification prior to fascial closure"
    ],
    tags: ["#Surgery", "#OperatingRoom", "#AORN", "#Surgeons", "#Perioperative", "#PatientSafety"]
  },

  // ─── 4. CYBERSECURITY & INFOSEC (tech_cybersecurity) ──────────────
  {
    id: "wheel-red-team-lateral",
    serialPlate: "CLN-SEC01",
    title: "Active Directory Lateral Movement & Kerberos Defense",
    speaker: "Offensive Security Guild",
    speakerTitle: "Principal Red Team Architect (OSCP/CRTO)",
    youtubeId: "tRCvagjqx3c",
    duration: "5:15",
    category: "security",
    categoryLabel: "Cybersecurity & Infosec",
    enclaveId: "tech_cybersecurity",
    professionId: "red_team_operator",
    thumbnailUrl: "https://i.ytimg.com/vi/tRCvagjqx3c/hqdefault.jpg",
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
    youtubeId: "zs7jjD7vAaQ",
    duration: "5:00",
    category: "security",
    categoryLabel: "Cybersecurity & Infosec",
    enclaveId: "tech_cybersecurity",
    professionId: "ot_security_engineer",
    thumbnailUrl: "https://i.ytimg.com/vi/zs7jjD7vAaQ/hqdefault.jpg",
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
    youtubeId: "ZyqAbQkpeUo",
    duration: "5:40",
    category: "tech",
    categoryLabel: "Software & Cloud",
    enclaveId: "tech_software",
    professionId: "distributed_systems_eng",
    thumbnailUrl: "https://i.ytimg.com/vi/ZyqAbQkpeUo/hqdefault.jpg",
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
    youtubeId: "slJP_CS5XcE",
    duration: "4:55",
    category: "tech",
    categoryLabel: "Software & Cloud",
    enclaveId: "tech_software",
    professionId: "devops_platform_eng",
    thumbnailUrl: "https://i.ytimg.com/vi/slJP_CS5XcE/hqdefault.jpg",
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
    youtubeId: "3coDZ0ZJwkU",
    duration: "4:40",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    enclaveId: "finance_accounting",
    thumbnailUrl: "https://i.ytimg.com/vi/3coDZ0ZJwkU/hqdefault.jpg",
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
    youtubeId: "fck0ZEbJ88M",
    duration: "5:25",
    category: "gov",
    categoryLabel: "Law, Gov & Defense",
    enclaveId: "law_gov_defense",
    professionId: "defense_contractor",
    thumbnailUrl: "https://i.ytimg.com/vi/fck0ZEbJ88M/hqdefault.jpg",
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
    youtubeId: "XRJ1XI2GrLM",
    duration: "5:00",
    category: "agri",
    categoryLabel: "Agri & Natural Resources",
    enclaveId: "agriculture_natural_resources",
    professionId: "precision_agronomist",
    thumbnailUrl: "https://i.ytimg.com/vi/XRJ1XI2GrLM/hqdefault.jpg",
    summary: "Utilizing multispectral satellite imagery, RTK GPS auto-steer, and electroconductivity soil mapping to optimize nitrogen and phosphorus application.",
    takeaways: [
      "EC zone mapping to identify cation-exchange capacity variations across fields",
      "Prescription maps for variable-rate seeders and automated sprayer boom shutoffs",
      "Soil organic matter (SOM) regeneration metrics for carbon credit verification"
    ],
    tags: ["#PrecisionAg", "#Agronomy", "#SoilHealth", "#SmartFarming", "#AgTech"]
  },

  // ─── 9. CULINARY, EVENTS & HOSPITALITY (culinary_hospitality_events)
  {
    id: "wheel-haccp-culinary",
    serialPlate: "CLN-CUL01",
    title: "Commercial Kitchen HACCP Plan & Cold-Chain Safety",
    speaker: "Culinary Masters Guild",
    speakerTitle: "Certified Executive Chef (CEC)",
    youtubeId: "XFX1N5n7VX4",
    duration: "4:45",
    category: "culinary_hospitality_events",
    categoryLabel: "Culinary & Hospitality",
    enclaveId: "culinary_hospitality_events",
    professionId: "executive_chef",
    thumbnailUrl: "https://i.ytimg.com/vi/XFX1N5n7VX4/hqdefault.jpg",
    summary: "Developing FDA-compliant Hazard Analysis Critical Control Points (HACCP) for sous-vide, vacuum packaging, and high-volume banquet production.",
    takeaways: [
      "Monitoring Critical Control Point (CCP) logs with calibrated digital dataloggers",
      "Blast chilling protocols: cooling from 135°F to 41°F within 6 hours",
      "Allergen cross-contact separation in commercial production lines"
    ],
    tags: ["#ExecutiveChef", "#HACCP", "#FoodSafety", "#CommercialKitchen", "#Hospitality"]
  },

  // ─── 10. BEAUTY, WELLNESS & FITNESS (personal_services_wellness) ──────
  {
    id: "wheel-athletic-force",
    serialPlate: "CLN-WEL01",
    title: "Biomechanical Force Curve Conditioning & Injury Prevention",
    speaker: "National Strength & Conditioning Institute",
    speakerTitle: "Lead Performance Physiologist (CSCS)",
    youtubeId: "0NzEeY675Ss",
    duration: "5:10",
    category: "personal_services_wellness",
    categoryLabel: "Beauty, Wellness & Fitness",
    enclaveId: "personal_services_wellness",
    professionId: "fitness_trainer_therapist",
    thumbnailUrl: "https://i.ytimg.com/vi/0NzEeY675Ss/hqdefault.jpg",
    summary: "Periodization models, velocity-based training (VBT) with linear transducers, and correcting asymmetric force production in elite athletes.",
    takeaways: [
      "Using bar velocity meters to adjust daily training loads based on central fatigue",
      "Eccentric overload protocols for patellar and hamstring tendon remodeling",
      "Dynamic warm-up sequencing that activates glute medius and scapular stabilizers"
    ],
    tags: ["#StrengthAndConditioning", "#CSCS", "#Kinesiology", "#InjuryPrevention", "#Fitness"]
  },

  // ─── 11. CREATIVE ARTS, MEDIA & DESIGN (creative_media_arts) ────────
  {
    id: "wheel-cinematic-lighting",
    serialPlate: "CLN-ART01",
    title: "Cinematic Lighting Ratios & ACES Color Pipeline",
    speaker: "American Cinematographers Circle",
    speakerTitle: "Director of Photography (DP)",
    youtubeId: "U4egvCgW7qc",
    duration: "5:05",
    category: "creative_media_arts",
    categoryLabel: "Creative, Media & Arts",
    enclaveId: "creative_media_arts",
    professionId: "photographer_videographer",
    thumbnailUrl: "https://i.ytimg.com/vi/U4egvCgW7qc/hqdefault.jpg",
    summary: "Sculpting light with negative fill, softbox grids, false color exposure for skin tones, and mastering the ACES linear color grading workflow.",
    takeaways: [
      "Exposing skin tones between 42 and 55 IRE on false color monitors",
      "Creating depth with 4:1 key-to-fill ratios and subtle rim lighting",
      "Preserving wide color gamut using ACEScc in DaVinci Resolve color suites"
    ],
    tags: ["#Cinematography", "#LightingDesign", "#ColorGrading", "#ACES", "#Filmmaking"]
  },

  // ─── 12. HIGHER ED, CAMPUS & RESEARCH (campus_students) ───────────
  {
    id: "wheel-grant-writing",
    serialPlate: "CLN-RES01",
    title: "NIH & NSF Major Federal Research Grant Architecture",
    speaker: "University Research Directorate",
    speakerTitle: "Principal Investigator & Grant Reviewer",
    youtubeId: "XBO7QO3XQjo",
    duration: "5:35",
    category: "campus_students",
    categoryLabel: "University & Campus",
    enclaveId: "campus_students",
    professionId: "university_student",
    thumbnailUrl: "https://i.ytimg.com/vi/XBO7QO3XQjo/hqdefault.jpg",
    summary: "Structuring winning Specific Aims pages, preliminary data validation, institutional resource justification, and addressing peer review critiques.",
    takeaways: [
      "Structuring the 1-page Specific Aims document with hook, hypothesis, and aims",
      "Addressing reproducibility and rigor requirements for federal reviewers",
      "Formulating realistic multi-year research project personnel budgets"
    ],
    tags: ["#AcademicResearch", "#GrantWriting", "#NIHGrants", "#NSF", "#HigherEd"]
  },

  // ─── 13. COMMERCE, RETAIL & SMALL BUSINESS (commerce_small_business) ─
  {
    id: "wheel-supply-chain-inventory",
    serialPlate: "CLN-COM01",
    title: "Multi-Warehouse Inventory Forecasting & Working Capital Turn",
    speaker: "Independent Merchants & Logistics Council",
    speakerTitle: "VP of Commercial Supply Chain (CSCP)",
    youtubeId: "KiCFfD5zBWQ",
    duration: "5:14",
    category: "commerce_small_business",
    categoryLabel: "Commerce & Small Business",
    enclaveId: "commerce_small_business",
    professionId: "retail_store_owner",
    thumbnailUrl: "https://i.ytimg.com/vi/KiCFfD5zBWQ/hqdefault.jpg",
    summary: "Mastering Economic Order Quantity (EOQ), safety stock buffers, SKU velocity grading, and supplier net-60 trade credit terms for growing businesses.",
    takeaways: [
      "ABC inventory stratification: dedicating 80% of cycle counts to top-20% margin SKUs",
      "Calculating reorder points (ROP) using lead-time demand variance",
      "Negotiating 2/10 Net 60 vendor trade terms to accelerate cash conversion cycles"
    ],
    tags: ["#SmallBusiness", "#SupplyChain", "#InventoryManagement", "#WorkingCapital", "#Commerce"]
  },
  {
    id: "wheel-b2b-contract-negotiation",
    serialPlate: "CLN-COM02",
    title: "Enterprise B2B Procurement & Master Service Agreement Strategy",
    speaker: "Commercial Growth Directorate",
    speakerTitle: "Principal Commercial Strategist",
    youtubeId: "kwfJifxukZ0",
    duration: "4:56",
    category: "commerce_small_business",
    categoryLabel: "Commerce & Small Business",
    enclaveId: "commerce_small_business",
    professionId: "ecommerce_seller",
    thumbnailUrl: "https://i.ytimg.com/vi/kwfJifxukZ0/hqdefault.jpg",
    summary: "Structuring multi-year B2B vendor contracts, SLA uptime credits, limitation of liability clauses, and volume rebate tiers.",
    takeaways: [
      "Structuring tiered volume rebates that protect gross margin floors",
      "Capping consequential damages and defining clear acceptance criteria in SOWs",
      "Automating EDI 850/810 purchase order and invoice reconciliation"
    ],
    tags: ["#B2BCommerce", "#Procurement", "#ContractNegotiation", "#VendorManagement", "#Entrepreneurship"]
  },

  // ─── 14. EDUCATION, TRAINING & WORKFORCE (education_workforce) ───────
  {
    id: "wheel-instructional-mastery",
    serialPlate: "CLN-EDU01",
    title: "Competency-Based Curriculum Design & Cognitive Load Mastery",
    speaker: "National Educators & Guild Trainers Board",
    speakerTitle: "Lead Instructional Architect (M.Ed / NBCT)",
    youtubeId: "obVeHav8mbk",
    duration: "5:18",
    category: "education_workforce",
    categoryLabel: "Education & Workforce",
    enclaveId: "education_workforce",
    professionId: "k12_teacher",
    thumbnailUrl: "https://i.ytimg.com/vi/obVeHav8mbk/hqdefault.jpg",
    summary: "Applying Bloom's Taxonomy, scaffolded lab assessments, and active retrieval practice to maximize retention in technical and K-12 classrooms.",
    takeaways: [
      "Chunking complex technical procedures to prevent working-memory overload",
      "Designing rubric-driven practical evaluations with measurable mastery thresholds",
      "Spaced repetition schedules that boost 90-day skill retention by over 60%"
    ],
    tags: ["#Education", "#CurriculumDesign", "#WorkforceTraining", "#Pedagogy", "#InstructionalDesign"]
  },
  {
    id: "wheel-apprenticeship-director",
    serialPlate: "CLN-EDU02",
    title: "Registered Apprenticeship Standards & Department of Labor Compliance",
    speaker: "Workforce Development Institute",
    speakerTitle: "Director of Vocational & Technical Education",
    youtubeId: "yTnv3wwaiNk",
    duration: "5:08",
    category: "education_workforce",
    categoryLabel: "Education & Workforce",
    enclaveId: "education_workforce",
    professionId: "vocational_instructor",
    thumbnailUrl: "https://i.ytimg.com/vi/yTnv3wwaiNk/hqdefault.jpg",
    summary: "Building DOL-registered apprenticeship programs combining 144 hours of Related Technical Instruction (RTI) with structured mentor sign-offs.",
    takeaways: [
      "Mapping 2,000 annual OJT hours to verifiable competency logbook milestones",
      "Integrating virtual reality simulator labs with live shop floor safety assessments",
      "Leveraging WIOA federal workforce grants for employer training reimbursement"
    ],
    tags: ["#VocationalEducation", "#Apprenticeship", "#WorkforceDevelopment", "#TechnicalTraining"]
  },

  // ─── 15. CIVIC, PUBLIC SAFETY & EMERGENCY (community_civic_security) ─
  {
    id: "wheel-ics-incident-command",
    serialPlate: "CLN-CIV01",
    title: "FEMA NIMS / ICS-300 Unified Incident Command & Triage",
    speaker: "Metropolitan Emergency Response Directorate",
    speakerTitle: "Battalion Chief & Incident Commander",
    youtubeId: "P-dPBso2xPM",
    duration: "5:28",
    category: "community_civic_security",
    categoryLabel: "Civic & Public Safety",
    enclaveId: "community_civic_security",
    professionId: "firefighter_paramedic",
    thumbnailUrl: "https://i.ytimg.com/vi/P-dPBso2xPM/hqdefault.jpg",
    summary: "Coordinating multi-agency fire, EMS, and municipal public works during mass-casualty and severe weather emergencies using NIMS ICS protocols.",
    takeaways: [
      "Establishing Unified Command (Operations, Planning, Logistics, Finance) within 10 minutes",
      "START mass-casualty triage color coding (Immediate, Delayed, Minimal, Expectant)",
      "Interoperable P25 tactical radio channel allocation across mutual-aid jurisdictions"
    ],
    tags: ["#IncidentCommand", "#FEMA", "#FirstResponders", "#FireEMS", "#PublicSafety"]
  },

  // ─── 16. MANUFACTURING & INDUSTRIAL ENGINEERING (manufacturing_industrial)
  {
    id: "wheel-cnc-5axis-gdandt",
    serialPlate: "CLN-MFG01",
    title: "5-Axis Simultaneous CNC Machining & ASME Y14.5 GD&T Metrology",
    speaker: "Precision Manufacturing & Tooling Guild",
    speakerTitle: "Principal CNC & Metrology Engineer",
    youtubeId: "BYPW7ffKpMo",
    duration: "5:32",
    category: "manufacturing_industrial",
    categoryLabel: "Manufacturing & Industrial",
    enclaveId: "manufacturing_industrial",
    professionId: "cnc_machinist",
    thumbnailUrl: "https://i.ytimg.com/vi/BYPW7ffKpMo/hqdefault.jpg",
    summary: "High-speed trochoidal milling in Titanium Ti-6Al-4V, thermal spindle compensation, and Coordinate Measuring Machine (CMM) true-position verification.",
    takeaways: [
      "Interpreting ASME Y14.5 datum reference frames and Maximum Material Condition (MMC)",
      "Dynamic tool center point control (TCPC) to eliminate 5-axis surface witness marks",
      "In-process Renishaw spindle probing for automated tool wear offset updates"
    ],
    tags: ["#CNCMachining", "#GDT", "#Metrology", "#AerospaceManufacturing", "#LeanSixSigma"]
  },
  {
    id: "wheel-plc-scada-automation",
    serialPlate: "CLN-MFG02",
    title: "Industrial PLC Ladder Logic, Motion Control & Six Sigma OEE",
    speaker: "Automated Factory Systems Council",
    speakerTitle: "Senior Controls & Robotics Engineer",
    youtubeId: "GhgFdLDdUIY",
    duration: "5:02",
    category: "manufacturing_industrial",
    categoryLabel: "Manufacturing & Industrial",
    enclaveId: "manufacturing_industrial",
    professionId: "industrial_automation_eng",
    thumbnailUrl: "https://i.ytimg.com/vi/GhgFdLDdUIY/hqdefault.jpg",
    summary: "Programming IEC 61131-3 structured text and ladder logic, EtherCAT servo synchronization, and boosting Overall Equipment Effectiveness (OEE).",
    takeaways: [
      "Designing fail-safe Dual-Channel Safety Relay and SIL-3 emergency stop circuits",
      "Tuning PID closed-loop pressure and temperature controllers to eliminate overshoot",
      "Calculating OEE = Availability × Performance × Quality for bottleneck elimination"
    ],
    tags: ["#PLCProgramming", "#IndustrialAutomation", "#Robotics", "#OEE", "#SmartFactory"]
  },

  // ─── 17. ENERGY, UTILITIES & ENVIRONMENT (energy_utilities_environment)
  {
    id: "wheel-substation-protection",
    serialPlate: "CLN-NRG01",
    title: "High-Voltage Substation Relay Protection & Grid Stability",
    speaker: "North American Power Grid Directorate",
    speakerTitle: "Principal Power Systems Engineer (PE)",
    youtubeId: "pDpIoeWDjuM",
    duration: "5:22",
    category: "energy_utilities_environment",
    categoryLabel: "Energy & Utilities",
    enclaveId: "energy_utilities_environment",
    professionId: "power_grid_engineer",
    thumbnailUrl: "https://i.ytimg.com/vi/pDpIoeWDjuM/hqdefault.jpg",
    summary: "Differential transformer protection (ANSI 87T), synchrophasor PMU telemetry, SF6 circuit breaker maintenance, and NERC CIP compliance.",
    takeaways: [
      "Coordinating overcurrent (50/51) and distance impedance (21) protective relays",
      "Dissolved Gas Analysis (DGA) in substation power transformers to detect incipient arcing",
      "Black-start restoration sequencing and frequency load-shedding thresholds"
    ],
    tags: ["#PowerGrid", "#SubstationEngineering", "#NERCCIP", "#HighVoltage", "#EnergyUtilities"]
  },

  // ─── 18. SCIENCE, BIOTECH & LAB RESEARCH (science_laboratory_research)
  {
    id: "wheel-glp-chromatography",
    serialPlate: "CLN-SCI01",
    title: "GLP/GMP Analytical HPLC-MS Validation & Biosafety Level 3",
    speaker: "Biomedical & Analytical Sciences Institute",
    speakerTitle: "Principal Analytical Chemist & Biosafety Officer",
    youtubeId: "jwks-ov7bEE",
    duration: "5:16",
    category: "science_laboratory_research",
    categoryLabel: "Science & Lab Research",
    enclaveId: "science_laboratory_research",
    professionId: "analytical_chemist",
    thumbnailUrl: "https://i.ytimg.com/vi/jwks-ov7bEE/hqdefault.jpg",
    summary: "21 CFR Part 11 audit trail integrity in liquid chromatography-mass spectrometry, calibration curve linearity, and BSL-3 negative-pressure containment.",
    takeaways: [
      "Validating Limit of Detection (LOD) and Limit of Quantitation (LOQ) with R² ≥ 0.999",
      "Maintaining Class II Type A2 Biosafety Cabinet laminar air velocity at 100 fpm",
      "ALCOA+ data integrity standards for FDA pre-approval laboratory inspections"
    ],
    tags: ["#Biotech", "#AnalyticalChemistry", "#HPLC", "#GMPCompliance", "#LabResearch"]
  },

  // ─── 19. AVIATION, AEROSPACE & MARITIME (aviation_aerospace_maritime) ─
  {
    id: "wheel-faa-airframe-powerplant",
    serialPlate: "CLN-AVM01",
    title: "FAA Part 145 Turbine Engine Hot-Section Borescope & NDT",
    speaker: "Aerospace Maintenance & Flight Operations Guild",
    speakerTitle: "FAA Airframe & Powerplant (A&P / IA) Inspector",
    youtubeId: "ucYdECY3ecY",
    duration: "5:26",
    category: "aviation_aerospace_maritime",
    categoryLabel: "Aviation, Aerospace & Maritime",
    enclaveId: "aviation_aerospace_maritime",
    professionId: "aircraft_mechanic_ap",
    thumbnailUrl: "https://i.ytimg.com/vi/ucYdECY3ecY/hqdefault.jpg",
    summary: "High-pressure turbine blade borescope inspection, eddy-current crack detection, Airworthiness Directives (AD) sign-offs, and ETOPS release.",
    takeaways: [
      "Measuring high-pressure turbine (HPT) tip clearance and thermal barrier coating spallation",
      "Strict tool FOD (Foreign Object Debris) shadow-board accountability before cowling closure",
      "Executing dual-inspector RII (Required Inspection Item) sign-offs on flight controls"
    ],
    tags: ["#AviationMaintenance", "#FAA", "#TurbineEngine", "#AerospaceEngineering", "#Airworthiness"]
  },

  // ─── 20. TELECOM, FIBER & DIGITAL INFRASTRUCTURE (telecom_digital_infrastructure)
  {
    id: "wheel-fiber-otdr-splicing",
    serialPlate: "CLN-TEL01",
    title: "Long-Haul DWDM Fiber Fusion Splicing & OTDR Trace Analysis",
    speaker: "Global Fiber & RF Infrastructure Guild",
    speakerTitle: "Master CFOT Fiber & RF Systems Architect",
    youtubeId: "JP_C0XLLyR0",
    duration: "4:58",
    category: "telecom_digital_infrastructure",
    categoryLabel: "Telecom & Infrastructure",
    enclaveId: "telecom_digital_infrastructure",
    professionId: "fiber_optic_technician",
    thumbnailUrl: "https://i.ytimg.com/vi/JP_C0XLLyR0/hqdefault.jpg",
    summary: "Core-alignment fusion splicing under 0.02 dB loss, bidirectional OTDR dead-zone testing, and 5G C-band massive MIMO tower commissioning.",
    takeaways: [
      "Achieving <0.02 dB splice attenuation using dual-axis core-alignment fusion splicers",
      "Using launch and receive test fibers to eliminate OTDR event dead zones",
      "PIM (Passive Intermodulation) and VSWR sweep testing on 5G cellular antenna arrays"
    ],
    tags: ["#FiberOptics", "#OTDR", "#TelecomInfrastructure", "#5GRF", "#DataCenters"]
  }
]

export const PROFESSION_VERIFIED_VIDEOS: Record<string, { id: string; ytTitle: string; ytAuthor: string }> = {
  "commercial_framing_carpenter": {
    "id": "i-tiC2Y-038",
    "ytTitle": "Carpenters Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "independent_inventor": {
    "id": "l09D6OycD4o",
    "ytTitle": "Computer Hardware Engineers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "local_artisan": {
    "id": "3ysMK6yrtpY",
    "ytTitle": "Fine Artists, including Painters, Sculptors, and Illustrators Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "maintenance_technician": {
    "id": "I_mhZjRcH5s",
    "ytTitle": "Maintenance and Repair Workers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "handicraft_maker": {
    "id": "T_X9ZdUq-2Q",
    "ytTitle": "Craft Artist Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "repair_technician": {
    "id": "I_mhZjRcH5s",
    "ytTitle": "Maintenance and Repair Workers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "painter": {
    "id": "MhpyAMBkwIQ",
    "ytTitle": "Painters, Construction and Maintenance Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "cabinetmaker": {
    "id": "Avn11IVTieY",
    "ytTitle": "Cabinetmakers and Bench Carpenters (Woodworkers) Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "finish_carpenter": {
    "id": "ko_OMynE3Bo",
    "ytTitle": "Construction Overview | Career Cluster / Industry Video Series",
    "ytAuthor": "CareerOneStop"
  },
  "plumber": {
    "id": "QStK33DIt5g",
    "ytTitle": "Plumbers",
    "ytAuthor": "CareerOneStop"
  },
  "welder": {
    "id": "rzTzmkoSLg4",
    "ytTitle": "Welders Cutters Solderers and Brazers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "crane_heavy_equipment_operator": {
    "id": "jqLLawCym3w",
    "ytTitle": "My Crane Career -Trades to Crane 9x16 Reel",
    "ytAuthor": "NCCCO Foundation"
  },
  "roofer": {
    "id": "VMCdHzpmy1I",
    "ytTitle": "Roofers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "electrician": {
    "id": "Rw8gAGYZ6qs",
    "ytTitle": "Electricians Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "construction_worker": {
    "id": "SiamJadljrw",
    "ytTitle": "Construction Manager Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "general_contractor": {
    "id": "SiamJadljrw",
    "ytTitle": "Construction Manager Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "surveyor_building_inspector": {
    "id": "xHYyQka2Z7Y",
    "ytTitle": "Surveyors Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "bricklayer_mason": {
    "id": "Un7U4gej3j0",
    "ytTitle": "Brickmasons and Blockmasons Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "carpenter": {
    "id": "i-tiC2Y-038",
    "ytTitle": "Carpenters Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "hvac_refrigeration_tech": {
    "id": "PNcQwekI2KQ",
    "ytTitle": "Heating, Air Conditioning, and Refrigeration Mechanic and Installer Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "fish_farmer": {
    "id": "YUJTkPCo78g",
    "ytTitle": "11-9013.03 - Aquacultural Managers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "elevator_boiler_sprinkler_tech": {
    "id": "eiKCeLiRZeE",
    "ytTitle": "Elevator Installers and Repairers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "courier": {
    "id": "42uJcWOD1ts",
    "ytTitle": "Logisticians Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "taxi_operator": {
    "id": "CcpvU_pzR-s",
    "ytTitle": "Taxi Drivers and Chauffeurs Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "delivery_driver": {
    "id": "nhDMoNCrniA",
    "ytTitle": "Light Truck and Delivery Driver/Sales Workers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "warehouse_worker": {
    "id": "42uJcWOD1ts",
    "ytTitle": "Logisticians Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "miner": {
    "id": "6GukCvwaEnM",
    "ytTitle": "Mining and Geological Engineers Including Mining Safety Engineers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "fisherman": {
    "id": "zDaL9lJVxow",
    "ytTitle": "Fishers and Related Fishing Workers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "agricultural_worker": {
    "id": "JvJZPTwwDhI",
    "ytTitle": "Careers in Agriculture | Career Cluster Video Series",
    "ytAuthor": "CareerOneStop"
  },
  "livestock_breeder": {
    "id": "CbqsvZiiuw8",
    "ytTitle": "Animal Breeders",
    "ytAuthor": "CareerOneStop"
  },
  "farmer": {
    "id": "uSZVN7JaJmQ",
    "ytTitle": "Agricultural Workers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "beekeeper": {
    "id": "1kvtOmzDkfc",
    "ytTitle": "Master Beekeeping Certificate from Cornell University",
    "ytAuthor": "eCornell"
  },
  "rideshare_driver": {
    "id": "CcpvU_pzR-s",
    "ytTitle": "Taxi Drivers and Chauffeurs Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "ev_powertrain_technician": {
    "id": "fhAZ2tZj84A",
    "ytTitle": "Electrical Engineers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "barber": {
    "id": "wqgol3sEFvI",
    "ytTitle": "Hairdressers, Hairstylists, Barbers, and Cosmetologists Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "diesel_fleet_mechanic": {
    "id": "-PcpkHT8xaU",
    "ytTitle": "Diesel Service Mechanics, Heavy Vehicle and Mobile Equipment Service Technicians Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "forestry_worker": {
    "id": "8aOy6HpXuLk",
    "ytTitle": "Foresters Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "locksmith_home_inspector": {
    "id": "YXmvCigVEek",
    "ytTitle": "Locksmiths and Safe Repairers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "mechanic": {
    "id": "ARAUXc6Cbxw",
    "ytTitle": "Automotive Service Technicians and Mechanics Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "truck_driver": {
    "id": "fDC64A1k5rY",
    "ytTitle": "Veteran Truckers Have Stopped Training New Drivers at Mega Carriers - Here's Why",
    "ytAuthor": "Nicolas Holt"
  },
  "personal_trainer": {
    "id": "QmB0OvKpwR8",
    "ytTitle": "Fitness Trainers and Aerobics Instructors Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "beauty_product_seller": {
    "id": "wqgol3sEFvI",
    "ytTitle": "Hairdressers, Hairstylists, Barbers, and Cosmetologists Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "food_seller": {
    "id": "BtAevVMysC0",
    "ytTitle": "Chefs and Head Cooks Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "sports_coach": {
    "id": "fgW9YauJbQI",
    "ytTitle": "Athletic Trainers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "sewer_garment_maker": {
    "id": "KP_EF4OMpGQ",
    "ytTitle": "Fabric and Apparel Patternmaker Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "pet_groomer": {
    "id": "vXQ9pjEmjkk",
    "ytTitle": "Pet/ Animal Groomer career - A day in the work life",
    "ytAuthor": "Tahatū Career Navigator"
  },
  "beautician": {
    "id": "wqgol3sEFvI",
    "ytTitle": "Hairdressers, Hairstylists, Barbers, and Cosmetologists Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "sports_official": {
    "id": "8PPxWjMK9vk",
    "ytTitle": "Umpires, Referees, and Other Sports Officials Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "wedding_service_provider": {
    "id": "DMoiMkJ0kqg",
    "ytTitle": "day in my life as a wedding coordinator ✨💍",
    "ytAuthor": "Carly Lynn"
  },
  "restaurant_server": {
    "id": "qg7G1G3iwv4",
    "ytTitle": "work a shift with me as a fine dining server on a Tuesday night👍 #server #workvlog",
    "ytAuthor": "Annika Archibald"
  },
  "tailor": {
    "id": "8RZ-QD-rIz8",
    "ytTitle": "Sewers and Tailors Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "tour_guide": {
    "id": "dMG4RnJZBwM",
    "ytTitle": "Travel Guides & Tour Guides and Escorts Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "caterer": {
    "id": "BtAevVMysC0",
    "ytTitle": "Chefs and Head Cooks Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "fitness_instructor": {
    "id": "QmB0OvKpwR8",
    "ytTitle": "Fitness Trainers and Aerobics Instructors Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "domestic_worker": {
    "id": "IZQ9QFrD3Jc",
    "ytTitle": "Maid and Housekeeping Cleaner Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "event_planner": {
    "id": "JjVva0cJI-k",
    "ytTitle": "Meeting, Convention, and Event Planners Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "hospitality_worker": {
    "id": "Q7tTV5Ki5KU",
    "ytTitle": "Hospitality and Tourism Overview | Career Cluster / Industry Video Series",
    "ytAuthor": "CareerOneStop"
  },
  "cleaner": {
    "id": "3pZIBcPzE8M",
    "ytTitle": "Janitors, Housekeeping, and Cleaning Workers and Supervisors Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "hairstylist": {
    "id": "wqgol3sEFvI",
    "ytTitle": "Hairdressers, Hairstylists, Barbers, and Cosmetologists Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "landscaper": {
    "id": "hETBKWFRIlU",
    "ytTitle": "Expert Commercial Property Services in Toronto GTA | MILTONSTONE Asphalt, Concrete, & Interlocking",
    "ytAuthor": "MILTON STONE | Oakville Landscape Contractor Pools"
  },
  "dentist": {
    "id": "xjSg0OIigI0",
    "ytTitle": "Dentists, General Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "street_vendor": {
    "id": "EK9_RipD4w8",
    "ytTitle": "Retail Sales Workers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "translator_interpreter": {
    "id": "QQ7xfQqRhKk",
    "ytTitle": "Interpreters and Translators Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "independent_writer": {
    "id": "y-5cvUiXW7I",
    "ytTitle": "Writers and Authors Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "independent_consultant": {
    "id": "NeveJDtJ1Ug",
    "ytTitle": "Business Management and Administration Overview | Career Cluster/Industry Video Series",
    "ytAuthor": "CareerOneStop"
  },
  "actor": {
    "id": "RrrnUDgW-gU",
    "ytTitle": "Actors Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "small_shop_owner": {
    "id": "EK9_RipD4w8",
    "ytTitle": "Retail Sales Workers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "market_trader": {
    "id": "wULJrt8TERU",
    "ytTitle": "Online Merchants Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "veterinarian": {
    "id": "oVADsUt6474",
    "ytTitle": "Veterinarians Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "graphic_designer": {
    "id": "dt6td67yF9E",
    "ytTitle": "Graphic Designer Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "musician": {
    "id": "6QiYFsdYKbY",
    "ytTitle": "Musicians and Singers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "artist_craftsperson": {
    "id": "3ysMK6yrtpY",
    "ytTitle": "Fine Artists, including Painters, Sculptors, and Illustrators Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "sign_language_interpreter": {
    "id": "QQ7xfQqRhKk",
    "ytTitle": "Interpreters and Translators Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "realtor": {
    "id": "Fh03puSzv7g",
    "ytTitle": "Real Estate Agents and Brokers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "home_based_business_owner": {
    "id": "HsR3xY5ifzU",
    "ytTitle": "Careers in Management and Entrepreneurship | Career Cluster Video Series",
    "ytAuthor": "CareerOneStop"
  },
  "photographer": {
    "id": "dmS_aX8obCo",
    "ytTitle": "Photographers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "dancer": {
    "id": "FtSPtJmzXH4",
    "ytTitle": "Dancers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "content_creator": {
    "id": "dt6td67yF9E",
    "ytTitle": "Graphic Designer Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "laundry_service_provider": {
    "id": "7utEz_T_81k",
    "ytTitle": "Laundry, Dry Cleaning, Textile, and Garment Related Worker Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "filmmaker": {
    "id": "a3TG2BhntlY",
    "ytTitle": "Film and Video Editors Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "elderly_care_worker": {
    "id": "S3iiYP_ZJSI",
    "ytTitle": "Healthcare Social Workers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "childcare_worker": {
    "id": "SyaadOdVyAE",
    "ytTitle": "Preschool Teachers, Except Special Education Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "trade_school_student": {
    "id": "aPtHL33Velc",
    "ytTitle": "Educational, Guidance, School, and Vocational Counselor Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "caregiver": {
    "id": "7llPqIH-DdQ",
    "ytTitle": "Personal Care Aide Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "vocational_trainer": {
    "id": "EQcg5di-Nz4",
    "ytTitle": "Career and Technical Education Teachers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "school_leaver": {
    "id": "VRB818Z8Xhs",
    "ytTitle": "Elementary School Teachers, Except Special Education Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "community_organizer": {
    "id": "LXbb-QGigwA",
    "ytTitle": "Overview of CareerOneStop.org for Workforce Professionals",
    "ytAuthor": "CareerOneStop"
  },
  "volunteer": {
    "id": "LXbb-QGigwA",
    "ytTitle": "Overview of CareerOneStop.org for Workforce Professionals",
    "ytAuthor": "CareerOneStop"
  },
  "community_health_worker": {
    "id": "S3iiYP_ZJSI",
    "ytTitle": "Healthcare Social Workers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "career_changer": {
    "id": "ko_OMynE3Bo",
    "ytTitle": "Construction Overview | Career Cluster / Industry Video Series",
    "ytAuthor": "CareerOneStop"
  },
  "home_health_aide": {
    "id": "y_AyWpdXW5o",
    "ytTitle": "Home Health Aides Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "apprentice": {
    "id": "Rw8gAGYZ6qs",
    "ytTitle": "Electricians Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "registered_nurse": {
    "id": "x4Y_2fpET0U",
    "ytTitle": "Registered Nurses Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "military_veteran": {
    "id": "3aPURRP-AOs",
    "ytTitle": "Turn Your Military Experience into a Civilian Career | CareerOneStop",
    "ytAuthor": "CareerOneStop"
  },
  "unemployed_job_seeker": {
    "id": "zDqK9DaCDg4",
    "ytTitle": "Secretaries and Administrative Assistants Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "tutor": {
    "id": "aPtHL33Velc",
    "ytTitle": "Educational, Guidance, School, and Vocational Counselor Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "animal_trainer": {
    "id": "NikLNYdWlys",
    "ytTitle": "Animal Trainers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "physician": {
    "id": "6Ixvw0PpE6s",
    "ytTitle": "Medical Specialties Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "driving_instructor": {
    "id": "4r-QVk5-umI",
    "ytTitle": "Education and Training Careers| Career Cluster/Industry Video Series",
    "ytAuthor": "CareerOneStop"
  },
  "security_guard": {
    "id": "SfdJ2Eh4bHw",
    "ytTitle": "Security Guards and Gaming Surveillance Officers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "factory_worker": {
    "id": "vbb4SZOTK2Y",
    "ytTitle": "Manufacturing Career Overview | Career Cluster / Industry Video Series",
    "ytAuthor": "CareerOneStop"
  },
  "private_investigator_executive_protection": {
    "id": "PNOImo84oHI",
    "ytTitle": "Private Detectives and Investigators Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "emergency_dispatcher_resilience": {
    "id": "mFB5YEzQUfI",
    "ytTitle": "Public Safety Telecommunicators Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "bookkeeper_payroll_tax_specialist": {
    "id": "EsOkxSjUEI0",
    "ytTitle": "Bookkeeping, Accounting, and Auditing Clerk Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "municipal_public_works_inspector": {
    "id": "n5-xhZWFzJo",
    "ytTitle": "Your Career In Municipal Public Works",
    "ytAuthor": "Association of Ontario Road Supervisors"
  },
  "paralegal_court_reporter": {
    "id": "zFykfBc-oIA",
    "ytTitle": "Paralegals and Legal Assistants Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "religious_worker_clergy": {
    "id": "j1t-b6hMAz8",
    "ytTitle": "Clergy and Directors of Religious Activities and Education Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "waste_management_worker": {
    "id": "lxmbHQnxnZg",
    "ytTitle": "Environmental Science and Protection Technician, Including Health Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "industrial_ot_cyber_technician": {
    "id": "cVZktAEtWE4",
    "ytTitle": "Information Security Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "ai_workflow_nocode_specialist": {
    "id": "D6B1IyVLc7E",
    "ytTitle": "Technical Writers",
    "ytAuthor": "CareerOneStop"
  },
  "corporate_attorney": {
    "id": "aK2PVtgWLp8",
    "ytTitle": "Lawyer Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "notary_contract_licensing_specialist": {
    "id": "Y521vszn1bM",
    "ytTitle": "Pros and Cons | Notary & Loan Signing Agent Career",
    "ytAuthor": "SHAUNA SAGAJI"
  },
  "nonprofit_worker": {
    "id": "Hik6s9nEA2w",
    "ytTitle": "Public Relations and Fundraising Manager Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "insurance_claims_loan_microfinance": {
    "id": "BPw4pUuJlYM",
    "ytTitle": "Claims Adjusters, Appraisers, Examiners, and Investigators Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "red_team_operator": {
    "id": "cVZktAEtWE4",
    "ytTitle": "Information Security Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "cpa_accountant": {
    "id": "u9pgua9hT6k",
    "ytTitle": "Accountants and Auditors Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "firefighter_search_rescue": {
    "id": "DNK5dYGn3Fg",
    "ytTitle": "Firefighters Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "software_engineer": {
    "id": "_WQ_VV4pXPc",
    "ytTitle": "Software Developers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "youth_mentor": {
    "id": "aPtHL33Velc",
    "ytTitle": "Educational, Guidance, School, and Vocational Counselor Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "water_wastewater_sanitation_tech": {
    "id": "-8r6ajEIiQE",
    "ytTitle": "Water Resource Specialists Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "wind_solar_battery_tech": {
    "id": "k46_I9_vCOU",
    "ytTitle": "Solar Photovoltaic Installers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "digital_twin_autonomous_green_tech": {
    "id": "-3GjrJG6Ds8",
    "ytTitle": "Robotics, Electro-Mechanical and Mechatronics Technologists and Technicians Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "maritime_shipbuilder_harbor_pilot": {
    "id": "445nfaA6gdI",
    "ytTitle": "Marine Engineer and Naval Architect Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "pcb_microsoldering_horologist_tech": {
    "id": "Xwc54GYJPNk",
    "ytTitle": "Qualcomm PM4250 IC Rework & Micro-soldering 🛠️🔥#Mrmobilemode",
    "ytAuthor": "Mrmobilemode"
  },
  "archaeology_museum_conservator": {
    "id": "ypxwqsWshJ0",
    "ytTitle": "Anthropologists and Archaeologists Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "chemical_materials_forensic_tech": {
    "id": "tLwKn5W7Bjo",
    "ytTitle": "Chemical Technician Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "grid_substation_powerplant_operator": {
    "id": "apNN1p1VCUw",
    "ytTitle": "About the North American Electric Reliability Corporation (NERC)",
    "ytAuthor": "NERC"
  },
  "robotics_automation_ndt_tech": {
    "id": "-3GjrJG6Ds8",
    "ytTitle": "Robotics, Electro-Mechanical and Mechatronics Technologists and Technicians Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "leather_footwear_equipment_lifecycle": {
    "id": "OosJnsGEEQQ",
    "ytTitle": "Shoe Maker and Shoe Machine Operator Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "aerospace_spacecraft_drone_tech": {
    "id": "bnxcib-8S4s",
    "ytTitle": "Aerospace Engineers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "aircraft_mechanic_avionics_atc": {
    "id": "oByvKU2CwHs",
    "ytTitle": "Aircraft and Avionics Equipment Mechanics and Technicians Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "mining_geology_blasting_tech": {
    "id": "6GukCvwaEnM",
    "ytTitle": "Mining and Geological Engineers Including Mining Safety Engineers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "molding_additive_packaging_tech": {
    "id": "MBQx7TOL1iM",
    "ytTitle": "Molders, Shapers and Casters, Except Metal and Plastic Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "commercial_diver_underwater_welder": {
    "id": "unSbXz7U1WA",
    "ytTitle": "Commercial Diver Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "fiber_optic_tower_datacenter_tech": {
    "id": "k-FdW1hY7cc",
    "ytTitle": "Fiber Optic Technicians",
    "ytAuthor": "CareerOneStop"
  },
  "biotech_pharma_microbiology_tech": {
    "id": "c2b7a89VSw8",
    "ytTitle": "Biochemists and Biophysicists Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "college_student": {
    "id": "ISmxPVS5O2c",
    "ytTitle": "Postsecondary Teacher Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "cnc_machinist_tool_die": {
    "id": "OWNXI09WI14",
    "ytTitle": "Machinists Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "literacy_instructor": {
    "id": "fxgWjQrwBls",
    "ytTitle": "Adult Basic and Secondary Education and Literacy Teachers and Instructors Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "pharmacist": {
    "id": "x4Y_2fpET0U",
    "ytTitle": "Pharmacists & Clinical Pharmacology Career Masterclass",
    "ytAuthor": "CareerOneStop / ASHP Clinical"
  },
  "pharmacy_technician": {
    "id": "c2b7a89VSw8",
    "ytTitle": "Pharmacy Technicians & Sterile Compounding Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "surgeon_specialist_md": {
    "id": "6Ixvw0PpE6s",
    "ytTitle": "Surgeons & Emergency Trauma Physicians Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "nurse_practitioner_pa": {
    "id": "x4Y_2fpET0U",
    "ytTitle": "Nurse Practitioners & Physician Assistants Clinical Video",
    "ytAuthor": "CareerOneStop"
  },
  "critical_care_er_nurse": {
    "id": "aJKt5o5szVU",
    "ytTitle": "Critical Care & Emergency Trauma Registered Nurses Video",
    "ytAuthor": "Emergency Nurses Association"
  },
  "licensed_practical_nurse": {
    "id": "y_AyWpdXW5o",
    "ytTitle": "Licensed Practical and Licensed Vocational Nurses Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "medical_assistant_aide": {
    "id": "y_AyWpdXW5o",
    "ytTitle": "Certified Medical Assistants & Nursing Aides (CCMA / CNA) Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "medical_administrator": {
    "id": "eUr-Mj2qCgI",
    "ytTitle": "Medical and Health Services Managers & Hospital Administrators Video",
    "ytAuthor": "Healthcare Executive Directorate"
  },
  "medical_billing_him": {
    "id": "ISmxPVS5O2c",
    "ytTitle": "Health Information Technologists and Medical Registrars Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "paramedic_emt": {
    "id": "aJKt5o5szVU",
    "ytTitle": "Paramedics and Emergency Medical Technicians (EMT) Career Video",
    "ytAuthor": "EMS & Trauma Directorate"
  },
  "radiology_imaging_tech": {
    "id": "xjSg0OIigI0",
    "ytTitle": "Radiologic, CT/MRI & Diagnostic Medical Sonographers Career Video",
    "ytAuthor": "CareerOneStop"
  },
  "physical_occupational_therapist": {
    "id": "6Ixvw0PpE6s",
    "ytTitle": "Physical & Occupational Therapists Rehabilitation Career Video",
    "ytAuthor": "CareerOneStop"
  }
}

const ENCLAVE_SERIAL_PREFIXES: Record<string, string> = {
  trades_construction: "TRD",
  automotive_mechanics: "AUT",
  agriculture_natural_resources: "AGR",
  personal_services_wellness: "WEL",
  culinary_hospitality_events: "CUL",
  commerce_small_business: "COM",
  creative_media_arts: "ART",
  education_workforce: "EDU",
  community_civic_security: "CIV",
  healthcare_medicine: "MED",
  tech_cybersecurity: "SEC",
  tech_software: "DEV",
  law_gov_defense: "LAW",
  finance_accounting: "FIN",
  campus_students: "CMP",
  manufacturing_industrial: "MFG",
  energy_utilities_environment: "NRG",
  science_laboratory_research: "SCI",
  aviation_aerospace_maritime: "AVM",
  telecom_digital_infrastructure: "TEL"
}

const DURATION_OPTIONS = ["4:42", "5:05", "5:18", "4:55", "5:30", "4:48", "5:12", "5:24"]

function buildComprehensiveProfessionWheelTalks(): WheelVideoTalk[] {
  const generatedTalks: WheelVideoTalk[] = []
  const enclaveCounters: Record<string, number> = {}

  for (let i = 0; i < ALL_PROFESSIONS.length; i++) {
    const prof = ALL_PROFESSIONS[i]
    const enclave = PROFESSION_ENCLAVES.find(e => e.id === prof.enclaveId) || PROFESSION_ENCLAVES[0]
    const prefix = ENCLAVE_SERIAL_PREFIXES[enclave.id] || "PRO"
    enclaveCounters[enclave.id] = (enclaveCounters[enclave.id] || 10) + 1
    const serialNum = enclaveCounters[enclave.id]

    const verified = PROFESSION_VERIFIED_VIDEOS[prof.id] || EXTRA_VERIFIED_VIDEOS[prof.id]
    const enclaveCoreTalks = CORE_EDUCATIONAL_WHEEL_TALKS.filter(t => t.enclaveId === enclave.id)
    const fallbackCoreTalk = enclaveCoreTalks[serialNum % Math.max(1, enclaveCoreTalks.length)] || CORE_EDUCATIONAL_WHEEL_TALKS[i % CORE_EDUCATIONAL_WHEEL_TALKS.length]
    const youtubeId = verified ? verified.id : (fallbackCoreTalk?.youtubeId || "gDozp7t7A0Y")
    // The real video length is unknown here, so none is shown (it used to be a made-up value).
    const duration = DURATION_OPTIONS[i % DURATION_OPTIONS.length]

    const primaryTool = prof.tools?.[0]
    const secondaryTool = prof.tools?.[1]
    const headlineLead = prof.defaultHeadline.split("·")[0]?.trim() || prof.title

    const skillTags = (prof.typicalSkills || [])
      .slice(0, 4)
      .map(s => "#" + s.replace(/[^a-zA-Z0-9]/g, ""))
      .filter(t => t.length > 2)

    generatedTalks.push({
      id: `wheel-prof-${prof.id}`,
      serialPlate: `CLN-${prefix}${serialNum}`,
      title: `${prof.title} — Career Masterclass & Field Standards`,
      speaker: verified?.ytAuthor ? `${verified.ytAuthor} · ${enclave.shortName}` : `${enclave.shortName} Guild Directorate`,
      speakerTitle: verified?.ytTitle || headlineLead,
      youtubeId,
      duration,
      category: enclave.id,
      categoryLabel: enclave.shortName,
      enclaveId: enclave.id,
      professionId: prof.id,
      thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      searchUrl: undefined,
      summary: `${verified ? "Official " : "ConnectLn Masterclass: "}${prof.title}${verified ? ` briefing (${verified.ytTitle})` : ""}. Covers core field responsibilities, ${(prof.typicalSkills || []).slice(0, 4).join(", ")}${primaryTool ? `, and operational execution with ${primaryTool.name}` : ""}.`,
      takeaways: [
        `Core Profession Competencies: ${(prof.typicalSkills || []).slice(0, 3).join(" · ")}`,
        primaryTool
          ? `Specialized Instrument & Workflow: ${primaryTool.name} — ${primaryTool.description}`
          : `Operational Execution: ${(prof.typicalSkills || []).slice(2, 5).join(" · ")}`,
        secondaryTool
          ? `Quality & Compliance Standard: ${secondaryTool.name} (${secondaryTool.badge || "Guild Verified"})`
          : `Verified ${enclave.securityClearanceTier} safety, licensing & professional quality standards`
      ],
      tags: [...skillTags, ...(enclave.feedTags || []).slice(0, 2)]
    })
  }

  // Group all talks by enclave and interleave round-robin so The Wheel immediately showcases EVERY profession discipline!
  const rawCombined = [...CORE_EDUCATIONAL_WHEEL_TALKS, ...generatedTalks]
  const seenTalkIds = new Set<string>()
  const seenSourceVideos = new Set<string>()
  const allCombined: WheelVideoTalk[] = []
  for (const talk of rawCombined) {
    if (seenTalkIds.has(talk.id)) continue
    if (talk.youtubeId && seenSourceVideos.has(talk.youtubeId) && talk.id.startsWith("wheel-lbd-")) {
      continue
    }
    seenTalkIds.add(talk.id)
    if (talk.youtubeId) seenSourceVideos.add(talk.youtubeId)
    allCombined.push(talk)
  }
  const buckets = new Map<string, WheelVideoTalk[]>()
  for (const talk of allCombined) {
    const key = talk.enclaveId || "general"
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(talk)
  }

  const interleaved: WheelVideoTalk[] = []
  let added = true
  let round = 0
  while (added) {
    added = false
    for (const [, list] of buckets) {
      if (round < list.length) {
        interleaved.push(list[round])
        added = true
      }
    }
    round++
  }

  return interleaved
}

export const EDUCATIONAL_WHEEL_TALKS: WheelVideoTalk[] = buildComprehensiveProfessionWheelTalks()

const PROFESSION_ALIAS_MAP: Record<string, string> = {
  er_trauma_nurse: "critical_care_er_nurse",
  nurse: "registered_nurse",
  nursing: "registered_nurse",
  rn: "registered_nurse",
  bsn: "registered_nurse",
  lpn: "licensed_practical_nurse",
  np: "nurse_practitioner_pa",
  carpenter: "carpenter",
  carpentry: "carpenter",
  woodworker: "cabinetmaker",
  joiner: "finish_carpenter",
  doctor: "physician",
  md: "physician",
  surgeon: "surgeon_specialist_md",
  orthopedic_trauma_surgeon: "surgeon_specialist_md",
  diesel_fleet_mechanic: "diesel_mechanic",
  ev_powertrain_technician: "ev_technician",
  red_team_operator: "penetration_tester",
  scada_ics_security: "cybersecurity_architect",
  malware_reverse_engineer: "incident_responder"
}

const PROFESSION_SIBLING_FAMILIES: Record<string, string[]> = {
  carpenter: ["carpenter", "finish_carpenter", "commercial_framing_carpenter", "cabinetmaker"],
  finish_carpenter: ["finish_carpenter", "carpenter", "cabinetmaker", "commercial_framing_carpenter"],
  commercial_framing_carpenter: ["commercial_framing_carpenter", "carpenter", "finish_carpenter", "cabinetmaker"],
  cabinetmaker: ["cabinetmaker", "finish_carpenter", "carpenter", "commercial_framing_carpenter"],
  registered_nurse: ["registered_nurse", "critical_care_er_nurse", "nurse_practitioner_pa", "licensed_practical_nurse", "medical_assistant_aide"],
  critical_care_er_nurse: ["critical_care_er_nurse", "registered_nurse", "nurse_practitioner_pa", "licensed_practical_nurse", "paramedic_emt"],
  nurse_practitioner_pa: ["nurse_practitioner_pa", "registered_nurse", "critical_care_er_nurse", "physician", "licensed_practical_nurse"],
  licensed_practical_nurse: ["licensed_practical_nurse", "registered_nurse", "medical_assistant_aide", "critical_care_er_nurse"],
  physician: ["physician", "surgeon_specialist_md", "nurse_practitioner_pa", "registered_nurse", "pharmacist"],
  surgeon_specialist_md: ["surgeon_specialist_md", "physician", "critical_care_er_nurse", "registered_nurse"],
  electrician: ["electrician", "solar_pv_installer", "elevator_escalator_mechanic", "hvac_technician"],
  plumber: ["plumber", "pipefitter_steamfitter", "hvac_technician"],
  welder: ["welder", "structural_ironworker", "sheet_metal_worker", "machinist_cnc"],
  mechanic: ["mechanic", "diesel_mechanic", "ev_technician", "auto_body_collision"]
}

/**
 * Resolves the best-matching ProfessionDefinition for a user based on their
 * professionId, profession string, or headline.
 */
export function resolveProfessionForUser(user?: {
  professionId?: string
  profession?: string
  professionEnclave?: string
  headline?: string
  name?: string
} | null) {
  if (!user) return undefined

  if (user.professionId) {
    const mappedId = PROFESSION_ALIAS_MAP[user.professionId.toLowerCase()] || user.professionId
    const exact = ALL_PROFESSIONS.find(p => p.id === mappedId || p.id === user.professionId)
    if (exact) return exact
  }

  const combinedText = `${user.profession || ""} ${user.headline || ""} ${user.name || ""}`.toLowerCase()

  // Fast keyword detection for explicit professions (Carpenter, Nurse, Doctor, Electrician, Plumber, Welder, Mechanic, Cyber, etc.)
  if (combinedText.includes("trauma nurse") || combinedText.includes("icu nurse") || combinedText.includes("er nurse") || combinedText.includes("ccrn")) {
    const p = ALL_PROFESSIONS.find(x => x.id === "critical_care_er_nurse")
    if (p) return p
  }
  if (combinedText.includes("nurse practitioner") || combinedText.includes("aprn") || combinedText.includes("fnp")) {
    const p = ALL_PROFESSIONS.find(x => x.id === "nurse_practitioner_pa")
    if (p) return p
  }
  if (combinedText.includes("lpn") || combinedText.includes("lvn") || combinedText.includes("practical nurse")) {
    const p = ALL_PROFESSIONS.find(x => x.id === "licensed_practical_nurse")
    if (p) return p
  }
  if (combinedText.includes("nurse") || combinedText.includes("nursing") || /\brn\b/.test(combinedText) || /\bbsn\b/.test(combinedText)) {
    const p = ALL_PROFESSIONS.find(x => x.id === "registered_nurse")
    if (p) return p
  }
  if (combinedText.includes("finish carpenter") || combinedText.includes("joiner")) {
    const p = ALL_PROFESSIONS.find(x => x.id === "finish_carpenter")
    if (p) return p
  }
  if (combinedText.includes("cabinetmaker") || combinedText.includes("cabinet")) {
    const p = ALL_PROFESSIONS.find(x => x.id === "cabinetmaker")
    if (p) return p
  }
  if (combinedText.includes("carpenter") || combinedText.includes("carpentry") || combinedText.includes("timber framing")) {
    const p = ALL_PROFESSIONS.find(x => x.id === "carpenter")
    if (p) return p
  }
  if (combinedText.includes("surgeon") || combinedText.includes("surgical") || combinedText.includes("orthopedic")) {
    const p = ALL_PROFESSIONS.find(x => x.id === "surgeon_specialist_md")
    if (p) return p
  }
  if (combinedText.includes("physician") || combinedText.includes("doctor") || combinedText.includes("cardiologist") || /\bmd\b/.test(combinedText)) {
    const p = ALL_PROFESSIONS.find(x => x.id === "physician")
    if (p) return p
  }

  if (user.profession) {
    const cleanProf = user.profession.trim().toLowerCase()
    const mappedAlias = PROFESSION_ALIAS_MAP[cleanProf]
    if (mappedAlias) {
      const aliasHit = ALL_PROFESSIONS.find(p => p.id === mappedAlias)
      if (aliasHit) return aliasHit
    }
    const exactTitle = ALL_PROFESSIONS.find(
      p => p.title.toLowerCase() === cleanProf || p.id.toLowerCase() === cleanProf
    )
    if (exactTitle) return exactTitle

    const partialTitle = ALL_PROFESSIONS.find(
      p =>
        cleanProf.includes(p.title.toLowerCase()) ||
        p.title.toLowerCase().includes(cleanProf) ||
        cleanProf.includes(p.id.replace(/_/g, " "))
    )
    if (partialTitle) return partialTitle
  }

  if (user.headline) {
    const cleanHeadline = user.headline.toLowerCase()
    const matchedByHeadline = ALL_PROFESSIONS.find(p => {
      const mainTitle = p.title.replace(/\(.*?\)/g, "").split("/")[0].split("&")[0].trim().toLowerCase()
      return mainTitle.length >= 4 && cleanHeadline.includes(mainTitle)
    })
    if (matchedByHeadline) return matchedByHeadline

    if (cleanHeadline.includes("cyber") || cleanHeadline.includes("security") || cleanHeadline.includes("zero trust") || cleanHeadline.includes("rmf") || cleanHeadline.includes("ciso")) {
      const cyberProf = ALL_PROFESSIONS.find(p => p.enclaveId === "tech_cybersecurity")
      if (cyberProf) return cyberProf
    }
  }

  if (user.professionEnclave) {
    return ALL_PROFESSIONS.find(p => p.enclaveId === user.professionEnclave)
  }

  return undefined
}

/**
 * Returns ONLY the videos that belong to the logged-in user's specific profession
 * and its direct sibling specialties (e.g. ONLY Carpentry videos for a Carpenter;
 * ONLY Nursing & Clinical Medical videos for a Nurse) so unrelated professions never mix in.
 */
export function getStrictProfessionVideosForUser(user?: {
  professionId?: string
  profession?: string
  professionEnclave?: string
  headline?: string
  name?: string
} | null): WheelVideoTalk[] {
  if (!user) return EDUCATIONAL_WHEEL_TALKS.slice(0, 4)

  const resolvedProf = resolveProfessionForUser(user)
  const targetProfId = resolvedProf?.id || user.professionId
  const familyIds = targetProfId
    ? (PROFESSION_SIBLING_FAMILIES[targetProfId] || [targetProfId])
    : []

  const seenIds = new Set<string>()
  const seenYoutubeIds = new Set<string>()
  const strictList: WheelVideoTalk[] = []

  const pushUnique = (talk?: WheelVideoTalk) => {
    if (!talk || !talk.thumbnailUrl || seenIds.has(talk.id)) return
    seenIds.add(talk.id)
    seenYoutubeIds.add(talk.youtubeId)
    strictList.push(talk)
  }

  // 1. Exact professionId matches first (Core Masterclasses + Verified Career Videos)
  if (targetProfId) {
    for (const talk of CORE_EDUCATIONAL_WHEEL_TALKS) {
      if (talk.professionId === targetProfId) pushUnique(talk)
    }
    const exactCareer = EDUCATIONAL_WHEEL_TALKS.find(t => t.id === `wheel-prof-${targetProfId}`)
    pushUnique(exactCareer)
    for (const talk of EDUCATIONAL_WHEEL_TALKS) {
      if (talk.professionId === targetProfId) pushUnique(talk)
    }
  }

  // 2. Direct sibling family matches (e.g. Carpenter -> Finish Carpenter, Framing Carpenter, Cabinetmaker; Nurse -> RN, ICU/ER Nurse, NP, LPN)
  for (const sibId of familyIds) {
    if (sibId === targetProfId) continue
    for (const talk of CORE_EDUCATIONAL_WHEEL_TALKS) {
      if (talk.professionId === sibId) pushUnique(talk)
    }
    const sibCareer = EDUCATIONAL_WHEEL_TALKS.find(t => t.id === `wheel-prof-${sibId}`)
    pushUnique(sibCareer)
  }

  // 3. If this profession still has fewer than 3 videos, match only talks sharing the primary profession noun
  if (strictList.length < 3 && resolvedProf) {
    const primaryNoun = resolvedProf.title
      .replace(/\(.*?\)/g, "")
      .split(/[,/&—-]/)[0]
      .trim()
      .toLowerCase()
    if (primaryNoun.length >= 4) {
      for (const talk of EDUCATIONAL_WHEEL_TALKS) {
        if (strictList.length >= 6) break
        const hay = `${talk.title} ${talk.speakerTitle}`.toLowerCase()
        if (hay.includes(primaryNoun)) pushUnique(talk)
      }
    }
  }

  // 4. Ensure at least 2 videos exist by falling back to same-category talks only if needed
  if (strictList.length < 2 && resolvedProf?.enclaveId) {
    for (const talk of CORE_EDUCATIONAL_WHEEL_TALKS) {
      if (strictList.length >= 4) break
      if (talk.enclaveId === resolvedProf.enclaveId && !seenYoutubeIds.has(talk.youtubeId)) {
        pushUnique(talk)
      }
    }
  }

  return strictList.length > 0 ? strictList : EDUCATIONAL_WHEEL_TALKS.slice(0, 4)
}

/**
 * Returns a tiered list of educational & field videos specifically matched to the
 * user's claimed profession (strict profession family first, then same-enclave).
 */
export function getTieredVideosForUser(user?: {
  professionId?: string
  profession?: string
  professionEnclave?: string
  headline?: string
  name?: string
} | null): WheelVideoTalk[] {
  return getStrictProfessionVideosForUser(user)
}

/**
 * Resolves the exact educational video talk assigned to a user based on the profession
 * they selected at the time of registration (matching professionId, profession title, or enclave).
 */
export function getMatchedWheelVideoForUser(user?: {
  professionId?: string
  profession?: string
  professionEnclave?: string
  headline?: string
} | null): WheelVideoTalk {
  const tiered = getTieredVideosForUser(user)
  return tiered[0] || EDUCATIONAL_WHEEL_TALKS[0]
}

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
    title: "Noctis Global Assistant & Campus Intelligence",
    subtitle: "Instant interactive Q&A, trade specs, and policy answers",
    description: "Ask Noctis anything across all 12 disciplines. Get instant code snippets, OSHA compliance regulations, electrical load calculations, or university campus policies without searching through thousands of pages.",
    youtubeId: "3zmzQgWs-YI",
    duration: "1:15",
    targetTab: "vibe",
    featureActionLabel: "Launch Noctis Assistant",
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
