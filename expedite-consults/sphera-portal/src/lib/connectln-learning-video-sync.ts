import {
  SKILLED_TRADES_LEARN_BY_DOING_LESSONS,
  LEARN_CATEGORY_META,
  type LearnByDoingLesson,
  type LearnVideoSourceProvider,
  type SkilledTradesCategory,
} from "./skilled-trades-learn-by-doing-data"
import { getConnectLnMongoDb, isConnectLnMongoConfigured } from "./connectln-mongodb"

export interface LearningChannelConfig {
  channelId: string
  creatorName: string
  category: SkilledTradesCategory
  enclaveId: string
  professionId: string
  defaultSkills: string[]
  defaultPractice: string
  defaultDeliverable: string
  defaultQuizQuestion: string
  defaultQuizCorrect: string
  defaultQuizExplanation: string
}

export interface LearningVideoSyncMeta {
  lastSyncIso: string
  nextSyncIso: string
  lastAddedCount: number
  totalSyncedCount: number
  cadenceHours: number
  triggeredBy: string
  sourceBreakdown?: Record<string, number>
  prunedStaleYouTubeCount?: number
}

export const LEARNING_YOUTUBE_RSS_CHANNELS: LearningChannelConfig[] = [
  {
    channelId: "UCUtWNBWbFL9We-cdXkiAuJA",
    creatorName: "This Old House",
    category: "Carpentry",
    enclaveId: "trades_construction",
    professionId: "carpenter",
    defaultSkills: ["Precision Measuring & Layout", "Finish Carpentry & Framing", "Jobsite Tool Safety"],
    defaultPractice: "Write down the sequence of cuts, fastener spacing, and moisture/squareness checks shown in this field lesson.",
    defaultDeliverable: "Summarize two quality-control checks that keep structural or finish woodwork true over time.",
    defaultQuizQuestion: "What habit prevents costly material waste before making structural or trim carpentry cuts?",
    defaultQuizCorrect: "Measure twice against a reliable square reference datum and verify fit before fastening",
    defaultQuizExplanation: "Confirming reference edges and layout checks eliminates cumulative measurement drift.",
  },
  {
    channelId: "UCzr30osBdTmuFUS8IfXtXmg",
    creatorName: "Essential Craftsman",
    category: "Carpentry",
    enclaveId: "trades_construction",
    professionId: "carpenter",
    defaultSkills: ["Heavy Timber & GC Field Craft", "Ergonomic Tool Control", "Jobsite Sequencing"],
    defaultPractice: "Identify the safety setup and load-path logic demonstrated before applying tool force on the workpiece.",
    defaultDeliverable: "List key tool-control habits that protect accuracy and prevent fatigue on full-shift jobs.",
    defaultQuizQuestion: "Why do master builders emphasize body positioning and secure clamping before starting a cut?",
    defaultQuizCorrect: "Controlled balance and solid workholding prevent kickback and produce cleaner, safer cuts",
    defaultQuizExplanation: "Safe tool ergonomics and positive workholding directly raise both safety and craft quality.",
  },
  {
    channelId: "UCc3EpWncNq5QL0QhwUNQb7w",
    creatorName: "Paul Sellers",
    category: "Carpentry",
    enclaveId: "trades_construction",
    professionId: "carpenter",
    defaultSkills: ["Fine Hand-Tool Joinery", "Edge Tuning & Honing", "Reference Face Layout"],
    defaultPractice: "Practice inspecting squareness and edge keenness on a hand tool before scribing joinery lines.",
    defaultDeliverable: "Note how sharp blades reduce physical force and stop tear-out on fine woodworking joinery.",
    defaultQuizQuestion: "What separates crisp hand-cut joinery from sloppy loose joints?",
    defaultQuizCorrect: "Accurate reference faces, keen cutting edges, and cutting carefully on the waste side of knife lines",
    defaultQuizExplanation: "Knife walls register chisels and saws cleanly for tight, durable mechanical joints.",
  },
  {
    channelId: "UCd8v3SbzGP9_wuSOr_xk_eA",
    creatorName: "Thomas Johnson Antique Furniture Restoration",
    category: "Carpentry",
    enclaveId: "trades_construction",
    professionId: "carpenter",
    defaultSkills: ["Furniture Structural Assessment", "Reversible Conservation Repair", "Veneer & Finish Matching"],
    defaultPractice: "Trace how existing joinery damage and historical finish coatings are evaluated before removing fasteners.",
    defaultDeliverable: "Document one conservative repair technique that preserves original patina while restoring strength.",
    defaultQuizQuestion: "Why do furniture restorers inspect existing construction and old glue lines before clamping joints?",
    defaultQuizCorrect: "Removing failed adhesive and matching historic materials prevents veneer splitting and weak bonds",
    defaultQuizExplanation: "Clean wood-to-wood contact and reversible finishes keep restored furniture durable.",
  },
  {
    channelId: "UCB3jUEyCLRbCw7QED0vnXYg",
    creatorName: "Electrician U",
    category: "Electrical Fundamentals",
    enclaveId: "trades_construction",
    professionId: "electrician",
    defaultSkills: ["NEC Code Compliance", "Multimeter & Continuity Verification", "Safe Circuit Termination"],
    defaultPractice: "Log every de-energize, lockout, and Live-Dead-Live meter test check demonstrated in the circuit workflow.",
    defaultDeliverable: "Describe the NEC safety requirement or diagnostic test logic applied in this electrical training.",
    defaultQuizQuestion: "What must be confirmed with a rated meter before handling any isolated electrical conductor?",
    defaultQuizCorrect: "Verify zero voltage using the Live-Dead-Live procedure with properly CAT-rated leads",
    defaultQuizExplanation: "Testing a known live source before and after confirming dead protects against faulty test instruments.",
  },
  {
    channelId: "UCqq70AnPkj4-UApS_m_6mPw",
    creatorName: "weldingtipsandtricks",
    category: "Welding",
    enclaveId: "trades_construction",
    professionId: "welder",
    defaultSkills: ["Arc Length & Travel Angle", "Weld Puddle Penetration Control", "Cleaning & Shielding Gas Setup"],
    defaultPractice: "Record amperage, polarity/gas rate, and joint cleanliness prep before laying test stringer passes.",
    defaultDeliverable: "Identify two puddle visual indicators confirming steady fusion without undercut or porosity.",
    defaultQuizQuestion: "How do skilled welders prevent atmospheric contamination and porosity in the molten weld pool?",
    defaultQuizCorrect: "Clean mill scale/oxides thoroughly, set proper shielding gas/flux coverage, and hold a tight steady arc",
    defaultQuizExplanation: "Gas shielding plus clean base metal keeps oxygen and nitrogen out of solidifying weld beads.",
  },
  {
    channelId: "UCtxLpSnpxNiHAchvCX-4Dsg",
    creatorName: "Got2Learn",
    category: "Plumbing",
    enclaveId: "trades_construction",
    professionId: "plumber",
    defaultSkills: ["DWV Grading & Venting", "Leak-Free Sweat & PEX Joints", "Backflow & Seal Safety"],
    defaultPractice: "Trace water flow or DWV air venting paths in the assembly and note fitting orientation rules.",
    defaultDeliverable: "Explain the code-compliant plumbing reason why fittings, slopes, or seals were arranged as shown.",
    defaultQuizQuestion: "Why do plumbing drain lines require proper vent connections and continuous downhill slope?",
    defaultQuizCorrect: "To carry solids cleanly while equalizing pressure so P-trap water seals never siphon dry",
    defaultQuizExplanation: "Balanced DWV airflow preserves P-trap barriers against hazardous sewer gases.",
  },
  {
    channelId: "UC5Pnrxqqg4BLTsfsUzWw5Pw",
    creatorName: "HVACR Videos",
    category: "HVAC",
    enclaveId: "trades_construction",
    professionId: "hvac_technician",
    defaultSkills: ["Refrigeration Cycle Diagnostics", "Low-Voltage Control Tracing", "Airflow & Electrical Checks"],
    defaultPractice: "Map the diagnostic progression shown—verifying power, control signals, airflow, and refrigeration readings cleanly.",
    defaultDeliverable: "List the measurements taken before condemning any HVAC compressor, board, or metering device.",
    defaultQuizQuestion: "Why should HVAC technicians verify airflow and electrical supply before adjusting refrigerant charge?",
    defaultQuizCorrect: "Restricted airflow or failed fan motors mimic charge issues and distort pressure-temperature gauges",
    defaultQuizExplanation: "Systematic ABC checks (Airflow, Voltage/Controls, Charge) avoid unnecessary part replacements.",
  },
  {
    channelId: "UCIYngkTOI-3hpgQAQM2-xhw",
    creatorName: "TileCoach",
    category: "Masonry & Tile",
    enclaveId: "trades_construction",
    professionId: "construction_worker",
    defaultSkills: ["Waterproofing Membrane Integrity", "Substrate Flatness & Mortar Coverage", "Lippage-Free Layout"],
    defaultPractice: "Record substrate prep requirements, trowel notch choice, and perimeter expansion gap checks from the tutorial.",
    defaultDeliverable: "Explain one wet-area waterproofing step critical for preventing costly tile shower leaks.",
    defaultQuizQuestion: "What happens when thin-set mortar lacks proper trowel ridge collapse and 80–95% back coverage?",
    defaultQuizCorrect: "Hollow voids trap water, crack unsupported tile corners, and risk premature bond failure",
    defaultQuizExplanation: "Directional troweling and back-buttering ensure full structural mortar support.",
  },
  {
    channelId: "UC1By4oBZiv9u8qnkcdCgdqw",
    creatorName: "Mike Haduck Masonry",
    category: "Masonry & Tile",
    enclaveId: "trades_construction",
    professionId: "local_artisan",
    defaultSkills: ["Mortar Consistency & Curing", "Brick/Stone Coursing", "Substrate Parging Bond"],
    defaultPractice: "Inspect mortar batching ratios, masonry joint tooling timing, and freeze-thaw drainage details.",
    defaultDeliverable: "Note how proper joint finishing sheds rain and extends exterior masonry lifespan.",
    defaultQuizQuestion: "Why do masons wait until mortar reaches 'thumbprint hard' before tooling bed and head joints?",
    defaultQuizCorrect: "Compacting semi-stiff mortar seals the edge tightly against brick/stone without smearing faces",
    defaultQuizExplanation: "Proper strike timing compresses surface pores and boosts weather resistance.",
  },
  {
    channelId: "UCWXEQsK3UiHszjwgGN5HUeQ",
    creatorName: "RR Buildings",
    category: "Roofing & Drywall",
    enclaveId: "trades_construction",
    professionId: "roofer",
    defaultSkills: ["Shingle-Lap Flashing Order", "Structural Trim Squaring", "Weathertight Envelope Seals"],
    defaultPractice: "Trace every layer of flashing, closure strip, and fastener seal protecting the roof/wall envelope.",
    defaultDeliverable: "Summarize how upper flashing overlaps prevent capillary wind-driven water intrusion.",
    defaultQuizQuestion: "What fundamental water-management rule governs exterior roof and wall flashing laps?",
    defaultQuizCorrect: "Upper layers always lap shingle-style over lower layers so gravity sheds water outside",
    defaultQuizExplanation: "Shingle-lapping eliminates reverse-slope catch points that channel water into framing.",
  },
  {
    channelId: "UCnorhjQR4zJkT7AVNhu395Q",
    creatorName: "Home RenoVision DIY",
    category: "Painting & Decorating",
    enclaveId: "trades_construction",
    professionId: "painter",
    defaultSkills: ["Surface Prep & Primer Bonding", "Smooth Cut-In Lines", "Drywall Seam Skimming & Sanding"],
    defaultPractice: "Note surface degreasing, caulk/spackle sanding grit choices, and primer sealing steps shown.",
    defaultDeliverable: "Explain why thorough wall prep dictates 80% of the final coated finish appearance.",
    defaultQuizQuestion: "Why should glossy or stained surfaces be deglossed and primed before applying finish coats?",
    defaultQuizCorrect: "Mechanical tooth and stain-blocking primer prevent peeling and tannin bleed-through",
    defaultQuizExplanation: "Proper surface profiling and primer selection give topcoats durable long-term adhesion.",
  },
  {
    channelId: "UCoj6RxIAQq8kmJme-5dnN0Q",
    creatorName: "DIY Solar Power with Will Prowse",
    category: "Solar & Energy",
    enclaveId: "energy_utilities_environment",
    professionId: "solar_installer",
    defaultSkills: ["MPPT Solar Array Sizing", "DC Breaker & Fuse Protection", "LiFePO4 Battery Safety"],
    defaultPractice: "Verify open-circuit solar voltage limits, copper conductor sizing, and DC overcurrent disconnect layout.",
    defaultDeliverable: "Describe the overcurrent and voltage safety margins needed for reliable off-grid/hybrid solar systems.",
    defaultQuizQuestion: "Why must solar array Voc remain safely below the charge controller's maximum input voltage rating in cold climates?",
    defaultQuizCorrect: "Freezing temperatures cause solar panel Voc to spike well above nameplate STC specs",
    defaultQuizExplanation: "Cold-weather voltage margin calculations prevent irreversible MPPT electronics damage.",
  },
  {
    channelId: "UCes1EvRjcKU4sY_UEavndBw",
    creatorName: "ChrisFix",
    category: "Auto Mechanics",
    enclaveId: "automotive_mechanics",
    professionId: "auto_mechanic",
    defaultSkills: ["Systematic Vehicle Diagnostics", "Safe Jack Stand Support", "Torque Spec Verification"],
    defaultPractice: "Write a pre-repair checklist covering chocks, jack stands, symptom isolation, and final test verification.",
    defaultDeliverable: "List two safety or torque steps critical before releasing a serviced vehicle back to road duty.",
    defaultQuizQuestion: "What safety rule applies immediately after raising a vehicle with a hydraulic floor jack?",
    defaultQuizCorrect: "Lower the frame/pinch weld securely onto rated jack stands and chock wheels before going underneath",
    defaultQuizExplanation: "Hydraulic seals can fail suddenly—mechanical jack stands are mandatory before any under-car work.",
  },
  {
    channelId: "UC7Jf7t6BL4e74O53dL6arSw",
    creatorName: "Blondihacks",
    category: "Machining & Repair",
    enclaveId: "manufacturing_industrial",
    professionId: "cnc_machinist",
    defaultSkills: ["Datum Reference Squaring", "Lathe/Mill Setup Tolerance", "Tool Lubrication & Chip Control"],
    defaultPractice: "Note datum edge selection, indicator zeroing, and feed/speed adjustment principles from the machining sequence.",
    defaultDeliverable: "Explain how maintaining consistent datum surfaces preserves concentricity across multiple operations.",
    defaultQuizQuestion: "Why do machinists carefully deburr edges and stone vises clean between machining setups?",
    defaultQuizCorrect: "A single raised burr or metal chip can cock the workpiece and throw tolerances off across the entire part",
    defaultQuizExplanation: "Spotless reference faces are essential for holding thousandth-of-an-inch machining repeatability.",
  },
  {
    channelId: "UCSbyncU597LMwb3HhnAI_4w",
    creatorName: "Epic Gardening",
    category: "Agriculture & Landscaping",
    enclaveId: "agriculture_natural_resources",
    professionId: "agronomist",
    defaultSkills: ["Soil Biology & Drainage", "Seasonal Crop Planning", "Organic Nutrient Management"],
    defaultPractice: "Assess soil structure, sunlight hours, and moisture retention for a bed in your local hardiness zone.",
    defaultDeliverable: "Identify one soil amendment or irrigation practice that boosts plant vigor sustainably.",
    defaultQuizQuestion: "Why does adding mature organic compost improve both sandy soils and heavy clay soils?",
    defaultQuizCorrect: "Humus binds sandy grains to hold moisture while opening clay aggregates for drainage and aeration",
    defaultQuizExplanation: "Healthy organic matter balances moisture, oxygen pores, and beneficial root microbiology.",
  },
  {
    channelId: "UC2QSX1z7lvF3bWXv6sK0UXw",
    creatorName: "Professor Pincushion",
    category: "Tailoring & Sewing",
    enclaveId: "trades_construction",
    professionId: "tailor",
    defaultSkills: ["Pattern Allowance Precision", "Seam Pressing & Grainline", "Garment Fit Adjustment"],
    defaultPractice: "Practice matching grainline marks, pinning curves carefully, and pressing every seam open cleanly.",
    defaultDeliverable: "Explain why pressing each seam before crossing it with another seam produces tailor-grade garments.",
    defaultQuizQuestion: "Why is steam-pressing each sewn seam flat or open before stitching the next intersecting seam essential?",
    defaultQuizCorrect: "Flattening thread tension and shaping contours early avoids puckered bulk trapped inside finished corners",
    defaultQuizExplanation: "Clean pressing throughout assembly turns amateur hems into crisp tailored construction.",
  },
  {
    channelId: "UC9deX25Xus0U-Znt3_ILSpw",
    creatorName: "360Jeezy",
    category: "Barbering & Beauty",
    enclaveId: "personal_services_wellness",
    professionId: "barber",
    defaultSkills: ["Growth Pattern Mapping", "Fade Lever Progression", "Instrument Sanitization"],
    defaultPractice: "Trace guideline spacing and natural growth directions across crown, sides, and nape zones.",
    defaultDeliverable: "Note two lever/guard blending controls plus blade disinfection checkpoints between clients.",
    defaultQuizQuestion: "Why must metal clippers, guards, and combs be sanitized with EPA-registered disinfectant between every service?",
    defaultQuizCorrect: "To eliminate bacteria, fungi, and skin irritation risks safely across all client appointments",
    defaultQuizExplanation: "Strict tool sanitation protects client health and upholds state barbering board standards.",
  },
  {
    channelId: "UCGozdt7Wbd15k7dWhvlmLUw",
    creatorName: "Clean My Space",
    category: "Safety & Civic Ops",
    enclaveId: "community_civic_security",
    professionId: "safety_officer",
    defaultSkills: ["Color-Coded Cloth Hygiene", "Disinfectant Contact Times", "Efficient Surface Workflows"],
    defaultPractice: "Draft a room-by-room cleaning pass keeping chemistry safe per stone/glass/metal surface.",
    defaultDeliverable: "Summarize why microfiber quality and non-cross-contaminated cloths cut re-cleaning time.",
    defaultQuizQuestion: "Why should different-colored microfiber cloths be assigned strictly per zone (e.g., restrooms vs. desks)?",
    defaultQuizCorrect: "Color coding guarantees toilet-zone pathogens never transfer onto sinks, kitchens, or dining counters",
    defaultQuizExplanation: "Strict zone separation enforces hygienic commercial and residential standards.",
  },
  {
    channelId: "UCVhScPcuVSTlxwpsq1H_KKw",
    creatorName: "PrepMedic",
    category: "Safety & Civic Ops",
    enclaveId: "community_civic_security",
    professionId: "safety_officer",
    defaultSkills: ["Scene Size-Up & PPE", "Emergency Equipment Readiness", "Checklist-Driven Response"],
    defaultPractice: "Walk through gear inspection and structured response prioritization before staging emergency equipment.",
    defaultDeliverable: "Document one pre-shift readiness habit that keeps critical medical/safety kits dependable.",
    defaultQuizQuestion: "What comes immediately BEFORE approaching an emergency patient or hazard scene?",
    defaultQuizCorrect: "Confirm scene safety, wear appropriate BSI/PPE, and identify environmental threats first",
    defaultQuizExplanation: "Rescuer safety prevents secondary casualties and sustains effective response.",
  },
  {
    channelId: "UCLGNeElk4sNgzUrZr0c9krA",
    creatorName: "Chef Jean-Pierre",
    category: "Culinary & Hospitality",
    enclaveId: "culinary_hospitality_events",
    professionId: "chef",
    defaultSkills: ["Mise en Place Readiness", "Temperature & Maillard Control", "Tasting & Sauce Balance"],
    defaultPractice: "Stage ingredients pre-measured in prep bowls (\"mise en place\") before turning on burner heat.",
    defaultDeliverable: "Note how controlling pan heat and acid/salt timing elevates texture and flavor clarity.",
    defaultQuizQuestion: "Why do commercial chefs enforce strict 'mise en place' prep before service begins?",
    defaultQuizCorrect: "Having prepped, portioned ingredients at arm's reach stops frantic mistakes during high-heat cooking windows",
    defaultQuizExplanation: "Organized stations ensure consistent plating speed and food safety temperature control.",
  },
  {
    channelId: "UCPyMN8DzkFl2__xnTEiGZ1w",
    creatorName: "RegisteredNurseRN",
    category: "Healthcare & Nursing",
    enclaveId: "healthcare_medicine",
    professionId: "nurse",
    defaultSkills: ["Patient Assessment Landmarks", "Medication & Vitals Safety", "Clear Clinical Shift Handover"],
    defaultPractice: "Build a concise clinical memory cue summarizing assessment priorities and red-flag escalation triggers.",
    defaultDeliverable: "List two observable patient signs that warrant immediate reassessment and provider notification.",
    defaultQuizQuestion: "Which priority framework guides safe clinical triage when multiple patient findings appear simultaneously?",
    defaultQuizCorrect: "Airway, Breathing, and Circulation (ABCs) safety escalation before routine non-urgent tasks",
    defaultQuizExplanation: "Life-threatening physiological deficits always take immediate clinical priority.",
  },
  {
    channelId: "UC8butISFwT-Wl7EV0hUK0BQ",
    creatorName: "freeCodeCamp.org",
    category: "Software & AI",
    enclaveId: "tech_software",
    professionId: "software_engineer",
    defaultSkills: ["Clean Architecture & Modularity", "Algorithmic Complexity Control", "Automated Verification"],
    defaultPractice: "Break down the code structure shown into small, testable single-responsibility functions with clear types.",
    defaultDeliverable: "Identify one edge-case failure mode and explain how input validation prevents production crashes.",
    defaultQuizQuestion: "Why do software teams write focused small helpers with strict validation instead of giant nested functions?",
    defaultQuizCorrect: "Small, cohesive functions simplify debugging, automated testing, and safe long-term maintenance",
    defaultQuizExplanation: "Modular separation limits blast radius and speeds up code reviews cleanly.",
  },
  {
    channelId: "UCkefXKtInZ9PLsoGRtml2FQ",
    creatorName: "Professor Messer",
    category: "Cybersecurity & IT",
    enclaveId: "tech_cybersecurity",
    professionId: "security_analyst",
    defaultSkills: ["Least-Privilege Access Control", "Threat Triage & Defense-in-Depth", "Cryptographic Verification"],
    defaultPractice: "Map the security concept demonstrated to real enterprise controls (IAM policies, MFA, encryption, monitoring).",
    defaultDeliverable: "Explain how layered defenses detect or block an attacker even if one outer layer fails.",
    defaultQuizQuestion: "Why do modern security operations combine preventative, detective, and corrective controls together?",
    defaultQuizCorrect: "Defense-in-depth ensures no single bypassed control exposes critical data undetected",
    defaultQuizExplanation: "Layered security overlaps reduce dwell time and contain breach impact rapidly.",
  },
  {
    channelId: "UC9x0AN7BWHpCDHSm9NiJFJQ",
    creatorName: "NetworkChuck",
    category: "Telecom & Fiber Optics",
    enclaveId: "telecom_digital_infrastructure",
    professionId: "network_technician",
    defaultSkills: ["OSI Layer Fault Isolation", "Encrypted Remote Protocols", "Bandwidth & Latency Testing"],
    defaultPractice: "Walk bottom-up through physical link, IP addressing, routing, DNS, and port reachability during network troubleshooting.",
    defaultDeliverable: "Describe how isolating Layer 1–3 reachability from Layer 7 app faults halves outage resolution time.",
    defaultQuizQuestion: "Which protocol verification step proves whether a service issue is DNS name resolution vs. raw IP routing?",
    defaultQuizCorrect: "Test direct IP reachability separately from hostname lookup using ping/nslookup/dig",
    defaultQuizExplanation: "Testing IP vs. DNS isolates network transport from naming failures immediately.",
  },
  {
    channelId: "UCFCEuCsyWP0YkP3CZ3Mr01Q",
    creatorName: "The Plain Bagel",
    category: "Finance & Business",
    enclaveId: "finance_accounting",
    professionId: "accountant",
    defaultSkills: ["Cash Flow Statement Literacy", "Risk-Adjusted Valuation", "Margin & Pricing Discipline"],
    defaultPractice: "Extract key cash-flow drivers, debt commitments, and profit margins for an enterprise case study.",
    defaultDeliverable: "Explain why positive operating cash flow matters alongside headline net income.",
    defaultQuizQuestion: "Why can profitable-on-paper businesses still run into sudden liquidity crunches?",
    defaultQuizCorrect: "High accounts receivable or heavy short-term inventory/debt obligations tie up actual cash despite accrued paper profit",
    defaultQuizExplanation: "Cash flow timing governs payroll, vendor reliability, and operational survival.",
  },
  {
    channelId: "UCpa-Zb0ZcQjTCPP1Dx_1M8Q",
    creatorName: "LegalEagle",
    category: "Law & Legal",
    enclaveId: "law_gov_defense",
    professionId: "lawyer",
    defaultSkills: ["Statutory & Procedural Reading", "Primary Source Verification", "Issue-Rule-Application Analysis"],
    defaultPractice: "Outline the governing jurisdictional rule, key procedural posture, and controlling facts discussed in the briefing.",
    defaultDeliverable: "Summarize why citing verified primary statutory/case authority protects client advocacy cleanly.",
    defaultQuizQuestion: "What separates verified legal analysis from casual commentary in courtroom practice?",
    defaultQuizCorrect: "Checking exact jurisdiction, procedural standard of review, and verified primary statutes/opinions",
    defaultQuizExplanation: "Precision on governing rules and record facts drives reliable legal outcomes.",
  },
  {
    channelId: "UCOKHwx1VCdgnxwbjyb9Iu1g",
    creatorName: "Blender Guru",
    category: "Creative Media & Design",
    enclaveId: "creative_media_arts",
    professionId: "video_editor",
    defaultSkills: ["Visual Composition & Contrast", "Lighting Key/Fill Balance", "Iterative Portfolio Polish"],
    defaultPractice: "Deconstruct how key light direction, foreground-background separation, and color palette guide viewer attention.",
    defaultDeliverable: "Note one lighting or framing change that noticeably elevates visual storytelling clarity.",
    defaultQuizQuestion: "Why do visual designers establish lighting mood and main focal silhouette BEFORE obsessing over fine surface details?",
    defaultQuizCorrect: "Strong composition and readable light contrast carry the viewer's eye cleanly regardless of texture micro-detail",
    defaultQuizExplanation: "Getting light, hierarchy, and proportion right first prevents polishing a weak composition.",
  },
  {
    channelId: "UCwpHKudUkP5tNgmMdexB3ow",
    creatorName: "Mentour Pilot",
    category: "Aviation & Maritime",
    enclaveId: "aviation_aerospace_maritime",
    professionId: "pilot",
    defaultSkills: ["CRM Mutual Crosschecking", "Checklist Discipline", "Threat & Error Management (TEM)"],
    defaultPractice: "Trace each Threat and Error Management barrier highlighted between preflight briefing and phase execution.",
    defaultDeliverable: "Explain how open cockpit/bridge communication empowers any crew member to catch drift early.",
    defaultQuizQuestion: "What core benefit does Crew Resource Management (CRM) deliver in high-consequence transport operations?",
    defaultQuizCorrect: "Structured assertive communication and independent crosschecking catch human error before safety margins erode",
    defaultQuizExplanation: "Safety culture turns individual skill into resilient multi-person verification.",
  },
  {
    channelId: "UCEBb1b_L6zDS3xTUrIALZOw",
    creatorName: "MIT OpenCourseWare",
    category: "Science & Lab Tech",
    enclaveId: "science_laboratory_research",
    professionId: "lab_technician",
    defaultSkills: ["Controlled Experimental Calibration", "Quantitative Data Analysis", "Lab Safety & Documentation"],
    defaultPractice: "Record controlled vs. independent variables, measurement error bounds, and reproducibility notes from the lecture.",
    defaultDeliverable: "Explain why instrument calibration and uncertainty bounds accompany credible scientific measurements.",
    defaultQuizQuestion: "Why do analytical labs calibrate instruments with known reference standards prior to sample measurement?",
    defaultQuizCorrect: "To detect drift and guarantee accurate, reproducible quantitative readings across test runs",
    defaultQuizExplanation: "Traceable calibration standards keep experimental results trustworthy and comparable.",
  },
  {
    channelId: "UCX6b17PVsYBQ0ip5gyeme-Q",
    creatorName: "CrashCourse",
    category: "Education & Training",
    enclaveId: "education_workforce",
    professionId: "educator",
    defaultSkills: ["Clear Systems Explanation", "Analogy & Evidence Structuring", "Learner Engagement Pacing"],
    defaultPractice: "Adapt one concept from the lesson into a 2-minute micro-explanation paired with a visual check-for-understanding question.",
    defaultDeliverable: "Describe how pairing concrete examples with visual models improves recall for new learners.",
    defaultQuizQuestion: "What makes technical instruction stick when teaching unfamiliar systems to apprentices or students?",
    defaultQuizCorrect: "Connecting structured mental models directly to real visual examples and short active practice checks",
    defaultQuizExplanation: "Concrete scaffolding plus quick feedback checks builds lasting mastery faster.",
  },
]

const MONGO_COLLECTION = "connectln_learning_videos"
const META_DOC_ID = "__meta_24h_learning_sync__"
const FB_LEARNING_KV_MAP = "connectln_learning_videos_v1"
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000
const YOUTUBE_REFRESH_AGE_MS = 25 * 24 * 60 * 60 * 1000
const MAX_RSS_CANDIDATES_PER_SYNC = 10

function decodeXmlEntities(raw: string): string {
  return String(raw || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim()
}

function cleanRssDescription(rawDesc: string, title: string, category: string, creator: string): string {
  const lines = decodeXmlEntities(rawDesc)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((line) => {
      if (!line || line.length < 12) return false
      if (/^https?:\/\//i.test(line)) return false
      if (/^(subscribe|follow|join|sponsored|merch|patreon|instagram|twitter|tiktok|facebook|linkedin|affiliate|use code|business inquiries)/i.test(line)) {
        return false
      }
      if (/^(#[a-z0-9_]+\s*)+$/i.test(line)) return false
      if (/^\d{1,2}:\d{2}\s+/.test(line)) return false
      return true
    })
  const picked = lines.slice(0, 3).join(" ").replace(/\s+/g, " ").trim()
  if (picked.length >= 36) {
    return picked.length > 300 ? `${picked.slice(0, 297).trim()}...` : picked
  }
  return `Verified ${category} hands-on training session by ${creator}: "${title}". Synced via the ConnectLn 24-hour multi-source curriculum pipeline.`
}

const OFF_TOPIC_TITLE_RE =
  /(#shorts?\b|\bgiveaway\b|\bblack friday\b|\bcyber monday\b|\bmerch drop\b|\bunboxing\b|\bvlog\b|\bpodcast ep\b|\bgenshin\b|\bsmash bros\b|\bnintendo\b|\bminecraft\b|\bfortnite\b|\bfactorio\b|\bwarlock\b|\btouhou\b|\barchon quest\b|\bclass quests?\b|\bepic loot\b|\bgaming\b|\blet'?s play\b|\blet'?s rock\b|\bblind reaction\b|\btrailer\b|\bpublic domain movies\b|\b1951\b|\bpublicit[eé]\b|\badvertising\b|\btintin\b|\bmilitant\b|\bth[eé][aâ]tre\b|\bskandal\b|\btrump\b|\bgnostic jesus\b|\bghoul\b|\bdigital circus\b|\bsecond life\b|\broleplay\b|\bpiano cover\b|\bgorillaz\b|\braekwon\b|\bbj[oö]rk\b|\bepic fail\b|\bsci club\b|\bbarony bar\b|\bsinging\b|\bdancing\b|\bnew york, new york\b|\btrilogia\b|\bel documental\b|\blive streams?\b|\bhard mode\b|\baliexpress\b)/i

const OFF_TOPIC_CREATOR_RE =
  /\b(gaming|public domain movies|reacts|live streams|tintin|ghoul|raekwon|ruby hornet|vegan|battle)\b/i

function isCleanLearningCandidateTitle(title: string, creator?: string): boolean {
  const cleanTitle = String(title || "").trim()
  if (!cleanTitle || cleanTitle.length < 10) return false
  if (OFF_TOPIC_TITLE_RE.test(cleanTitle)) return false
  if (creator && OFF_TOPIC_CREATOR_RE.test(creator)) return false
  return true
}

function normalizeUrlDedupeKey(raw?: string): string {
  if (!raw) return ""
  return String(raw).trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "")
}

/**
 * Strip empty `youtubeId` before inserting into MongoDB because `connectln_learning_videos`
 * carries a unique sparse index on `youtubeId` (`""` would collide across non-YouTube docs!).
 */
function prepareLessonDocForMongo(lesson: LearnByDoingLesson, syncedAtMs: number): Record<string, any> {
  const { youtubeId, ...rest } = lesson
  const doc: Record<string, any> = {
    ...rest,
    _id: lesson.id,
    docType: "lesson",
    syncedAtMs,
  }
  if (youtubeId && youtubeId.trim().length > 0) {
    doc.youtubeId = youtubeId.trim()
  }
  return doc
}

export function buildCategoryMetadataDefaults(category: SkilledTradesCategory): {
  enclaveId: string
  professionId: string
  skillsCovered: string[]
  practiceActivity: string
  practiceDeliverablePrompt: string
  knowledgeCheck: LearnByDoingLesson["knowledgeCheck"]
} {
  const matchingChannel = LEARNING_YOUTUBE_RSS_CHANNELS.find((c) => c.category === category)
  const enclaveId = LEARN_CATEGORY_META[category]?.enclaveIds?.[0] || "trades_construction"
  if (matchingChannel) {
    return {
      enclaveId: matchingChannel.enclaveId,
      professionId: matchingChannel.professionId,
      skillsCovered: matchingChannel.defaultSkills,
      practiceActivity: matchingChannel.defaultPractice,
      practiceDeliverablePrompt: matchingChannel.defaultDeliverable,
      knowledgeCheck: {
        question: matchingChannel.defaultQuizQuestion,
        options: [
          matchingChannel.defaultQuizCorrect,
          "Skip verification checks completely to save 3 minutes",
          "Guess measurements without checking manufacturers' or code limits",
          "Bypass protective gear and isolate procedures permanently",
        ],
        correctIndex: 0,
        explanation: matchingChannel.defaultQuizExplanation,
      },
    }
  }
  return {
    enclaveId,
    professionId: "skilled_professional",
    skillsCovered: [
      `${category} Core Principles`,
      "Safe Field & Lab Execution",
      "Quality Verification & Documentation",
    ],
    practiceActivity: `Review the demonstration in this ${category} session and document the key workflow steps cleanly.`,
    practiceDeliverablePrompt: `Summarize two practical quality or safety standards essential for this ${category} task.`,
    knowledgeCheck: {
      question: `Why are structured inspection and step-by-step verification essential in ${category} workflows?`,
      options: [
        "They prevent preventable mistakes, ensure safe execution, and maintain repeatable quality",
        "Verification checks double waste and slow reliable delivery permanently",
        "Safety standards only apply once equipment fails",
        "Documentation never helps teams troubleshoot future issues",
      ],
      correctIndex: 0,
      explanation: `Disciplined ${category} workflows protect craftspeople, clients, and long-term outcomes.`,
    },
  }
}

function mapKeywordsToCategoryStrict(text: string): SkilledTradesCategory | null {
  const lower = String(text || "").toLowerCase()
  if (/\b(wood|carpenter|carpentry|joinery|cabinet|timber|furniture|chisel|woodwork)\b/.test(lower)) return "Carpentry"
  if (/\b(weld|welding|tig|mig|stick weld|arc weld)\b/.test(lower)) return "Welding"
  if (/\b(plumb|plumbing|pipe|drain|p-trap|venting|toilet|flapper|faucet|solder)\b/.test(lower)) return "Plumbing"
  if (/\b(electric|electrical|circuit|volt|voltage|amp|wiring|multimeter|electronics|breaker)\b/.test(lower)) return "Electrical Fundamentals"
  if (/\b(hvac|air condition|refriger|furnace|heat pump|chiller|thermostat|mep)\b/.test(lower)) return "HVAC"
  if (/\b(auto|automotive|engine|brake|coolant|mechanic|transmission|obd)\b/.test(lower)) return "Auto Mechanics"
  if (/\b(solar|battery|lifepo4|photovoltaic|inverter|mppt|wind turbine|renewable)\b/.test(lower)) return "Solar & Energy"
  if (/\b(masonry|brick|tile|mortar|grout|concrete|trowel)\b/.test(lower)) return "Masonry & Tile"
  if (/\b(roof|roofing|shingle|flashing|drywall|framing)\b/.test(lower)) return "Roofing & Drywall"
  if (/\b(paint|painting|primer|stain|varnish|roller|brush)\b/.test(lower)) return "Painting & Decorating"
  if (/\b(machin|cnc|lathe|milling|caliper|micrometer|tolerance)\b/.test(lower)) return "Machining & Repair"
  if (/\b(agricult|garden|compost|soil|prun|crop|hydroponic|farm)\b/.test(lower)) return "Agriculture & Landscaping"
  if (/\b(barber|haircut|fade|clipper|salon|cosmetolog)\b/.test(lower)) return "Barbering & Beauty"
  if (/\b(tailor|sewing|seam|stitch|pattern|garment|fabric)\b/.test(lower)) return "Tailoring & Sewing"
  if (/\b(cyber|security|debian|cve|linux|encryption|firewall|https|reverse proxy|caddy|nginx|self-hosted)\b/.test(lower)) return "Cybersecurity & IT"
  if (/\b(router|network|switch|fiber|vlan|ethernet|tcp|dns|ssh|bgp)\b/.test(lower)) return "Telecom & Fiber Optics"
  if (/\b(python|code|algorithm|software|programming|computer science|ai|vector|typescript|api|database)\b/.test(lower)) return "Software & AI"
  if (/\b(cook|kitchen|chef|culinary|recipe|food rules|baking|serviceware)\b/.test(lower)) return "Culinary & Hospitality"
  if (/\b(nurse|clinical|medical|health|patient|vitals|first aid|cpr)\b/.test(lower)) return "Healthcare & Nursing"
  if (/\b(finance|accounting|cash flow|valuation|pricing|margin|invoice|small business)\b/.test(lower)) return "Finance & Business"
  if (/\b(law|legal|contract|statute|permit|compliance|osha)\b/.test(lower)) return "Law & Legal"
  if (/\b(aviation|aircraft|pilot|cockpit|maritime|hull|navigation)\b/.test(lower)) return "Aviation & Maritime"
  if (/\b(safety|lockout|loto|ppe|hazard|disinfect|respirator)\b/.test(lower)) return "Safety & Civic Ops"
  if (/\b(lighting|design|architecture|3d|blender|film|photo|typography)\b/.test(lower)) return "Creative Media & Design"
  if (/\b(teach|linear algebra|lecture|pedagogy|education|calculus|differential|courseware|mit)\b/.test(lower)) return "Education & Training"
  if (/\b(physics|chemistry|fluid|lab|viscosity|experiment|science|microscope)\b/.test(lower)) return "Science & Lab Tech"
  return null
}

function mapKeywordsToCategory(text: string, fallback: SkilledTradesCategory): SkilledTradesCategory {
  return mapKeywordsToCategoryStrict(text) ?? fallback
}

// =====================================================================
// SOURCE ADAPTER 1: YOUTUBE RSS + OEMBED (POLICY-COMPLIANT)
// =====================================================================

interface RawRssCandidate {
  youtubeId: string
  title: string
  publishedIso: string
  description: string
  channel: LearningChannelConfig
}

async function fetchChannelRssCandidates(channel: LearningChannelConfig): Promise<RawRssCandidate[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel.channelId)}`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ConnectLnLearningSync/1.0)" },
        signal: AbortSignal.timeout(4500),
        cache: "no-store",
      }
    )
    if (!res.ok) return []
    const xml = await res.text()
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []
    const out: RawRssCandidate[] = []

    for (const block of entries.slice(0, 5)) {
      const vidMatch = block.match(/<yt:videoId>([a-zA-Z0-9_-]{8,16})<\/yt:videoId>/)
      const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/)
      const pubMatch = block.match(/<published>([\s\S]*?)<\/published>/)
      const descMatch = block.match(/<media:description>([\s\S]*?)<\/media:description>/)
      if (!vidMatch?.[1] || !titleMatch?.[1]) continue

      const title = decodeXmlEntities(titleMatch[1]).replace(/\s+/g, " ").trim()
      if (!isCleanLearningCandidateTitle(title)) continue

      out.push({
        youtubeId: vidMatch[1].trim(),
        title,
        publishedIso: pubMatch?.[1]?.trim() || new Date().toISOString(),
        description: cleanRssDescription(descMatch?.[1] || "", title, channel.category, channel.creatorName),
        channel,
      })
    }
    return out
  } catch {
    return []
  }
}

export async function verifyYoutubeEmbeddable(
  youtubeId: string
): Promise<{ ok: boolean; permanentlyUnavailable?: boolean; authorName?: string; title?: string }> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${youtubeId}`)}&format=json`,
      {
        signal: AbortSignal.timeout(3500),
        cache: "no-store",
      }
    )
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      return { ok: false, permanentlyUnavailable: true }
    }
    if (!res.ok) return { ok: false }
    const json: any = await res.json().catch(() => null)
    if (!json) return { ok: false }
    return {
      ok: true,
      authorName: typeof json.author_name === "string" ? json.author_name.trim() : undefined,
      title: typeof json.title === "string" ? json.title.trim() : undefined,
    }
  } catch {
    return { ok: false }
  }
}

async function syncYouTubeSource(
  seenYtIds: Set<string>,
  baseLessonNum: number
): Promise<LearnByDoingLesson[]> {
  const rssResults = await Promise.all(
    LEARNING_YOUTUBE_RSS_CHANNELS.map((ch) => fetchChannelRssCandidates(ch))
  )

  const candidates: RawRssCandidate[] = []
  for (const chEntries of rssResults) {
    const fresh = chEntries
      .filter((e) => !seenYtIds.has(e.youtubeId))
      .sort((a, b) => Date.parse(b.publishedIso || "") - Date.parse(a.publishedIso || ""))
    if (fresh[0]) {
      seenYtIds.add(fresh[0].youtubeId)
      candidates.push(fresh[0])
    }
  }

  const picked = candidates.slice(0, MAX_RSS_CANDIDATES_PER_SYNC)
  const checks = await Promise.all(
    picked.map(async (cand) => ({ cand, check: await verifyYoutubeEmbeddable(cand.youtubeId) }))
  )

  const nowMs = Date.now()
  const out: LearnByDoingLesson[] = []
  let idx = 0
  for (const { cand, check } of checks) {
    if (!check.ok) continue
    const finalTitle = (check.title || cand.title).replace(/\s+/g, " ").trim().slice(0, 115)
    const finalCreator = check.authorName || cand.channel.creatorName
    const shortTitle = finalTitle.length > 52 ? `${finalTitle.slice(0, 49).trim()}...` : finalTitle
    out.push({
      id: `lbd_sync_${cand.youtubeId}`,
      lessonNumber: baseLessonNum + idx,
      videoLabel: `Synced (YouTube · ${cand.channel.category}): ${shortTitle}`,
      title: finalTitle,
      category: cand.channel.category,
      enclaveId: cand.channel.enclaveId,
      professionId: cand.channel.professionId,
      level: idx % 2 === 0 ? "Intermediate" : "Beginner",
      originalCreator: finalCreator,
      creatorDomain: "youtube.com",
      sourceProvider: "youtube",
      licenseLabel: "Standard YouTube License · Embedded via Official Player",
      lastVerifiedAtMs: nowMs,
      description: cand.description,
      skillsCovered: cand.channel.defaultSkills,
      sourceVideoUrl: `https://www.youtube.com/watch?v=${cand.youtubeId}`,
      referenceArticleUrl: `https://www.youtube.com/watch?v=${cand.youtubeId}`,
      youtubeId: cand.youtubeId,
      embedAvailable: true,
      duration: "",
      thumbnailUrl: `https://i.ytimg.com/vi/${cand.youtubeId}/hqdefault.jpg`,
      practiceActivity: cand.channel.defaultPractice,
      practiceDeliverablePrompt: cand.channel.defaultDeliverable,
      knowledgeCheck: {
        question: cand.channel.defaultQuizQuestion,
        options: [
          cand.channel.defaultQuizCorrect,
          "Skip verification checks completely to save 3 minutes",
          "Guess measurements without checking manufacturers' or code limits",
          "Bypass protective gear and isolate procedures permanently",
        ],
        correctIndex: 0,
        explanation: cand.channel.defaultQuizExplanation,
      },
    })
    idx += 1
  }
  return out
}

// =====================================================================
// SOURCE ADAPTER 2: VIMEO PUBLIC CHANNELS + OEMBED
// =====================================================================

const VIMEO_CHANNEL_FEEDS: Array<{ slug: string; fallbackCategory: SkilledTradesCategory }> = [
  { slug: "channels/craft/videos/rss", fallbackCategory: "Carpentry" },
  { slug: "channels/architecture/videos/rss", fallbackCategory: "Roofing & Drywall" },
  { slug: "channels/design/videos/rss", fallbackCategory: "Creative Media & Design" },
  { slug: "channels/science/videos/rss", fallbackCategory: "Science & Lab Tech" },
]

export async function verifyVimeoPlayerEmbeddable(videoId: string): Promise<boolean> {
  const cleanId = String(videoId || "").trim()
  if (!/^\d+$/.test(cleanId)) return false
  try {
    const res = await fetch(`https://player.vimeo.com/video/${cleanId}`, {
      headers: { Referer: "https://conectln.com/" },
      signal: AbortSignal.timeout(3500),
      cache: "no-store",
    })
    if (res.status !== 200) return false
    const snippet = (await res.text()).slice(0, 1200)
    if (/not rated|privacy|sorry|cannot be played|unable to find/i.test(snippet)) {
      return false
    }
    return true
  } catch {
    return false
  }
}

export async function verifyVimeoOembed(
  url: string
): Promise<{
  ok: boolean
  videoId?: string
  title?: string
  authorName?: string
  thumbnailUrl?: string
  duration?: number
} | null> {
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(3500), cache: "no-store" }
    )
    if (!res.ok) return null
    const d: any = await res.json().catch(() => null)
    if (!d?.video_id) return null
    const videoId = String(d.video_id)
    const canEmbed = await verifyVimeoPlayerEmbeddable(videoId)
    if (!canEmbed) return null
    return {
      ok: true,
      videoId,
      title: typeof d.title === "string" ? d.title.trim() : undefined,
      authorName: typeof d.author_name === "string" ? d.author_name.trim() : undefined,
      thumbnailUrl: typeof d.thumbnail_url === "string" ? d.thumbnail_url.trim() : undefined,
      duration: typeof d.duration === "number" ? d.duration : undefined,
    }
  } catch {
    return null
  }
}

async function syncVimeoSource(
  seenIds: Set<string>,
  seenUrls: Set<string>,
  baseLessonNum: number
): Promise<LearnByDoingLesson[]> {
  const collectedLinks: Array<{ link: string; title: string; fallbackCat: SkilledTradesCategory }> = []
  await Promise.all(
    VIMEO_CHANNEL_FEEDS.map(async (feed) => {
      try {
        const res = await fetch(`https://vimeo.com/${feed.slug}`, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ConnectLnLearningSync/1.0)" },
          signal: AbortSignal.timeout(4000),
          cache: "no-store",
        })
        if (!res.ok) return
        const xml = await res.text()
        const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
        for (const item of items.slice(0, 5)) {
          const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/)
          const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/)
          const link = decodeXmlEntities(linkMatch?.[1] || "").trim()
          const title = decodeXmlEntities(titleMatch?.[1] || "").trim()
          if (!link || !title || !isCleanLearningCandidateTitle(title)) continue
          const norm = normalizeUrlDedupeKey(link)
          if (seenUrls.has(norm)) continue
          collectedLinks.push({ link, title, fallbackCat: feed.fallbackCategory })
        }
      } catch {}
    })
  )

  const out: LearnByDoingLesson[] = []
  for (const cand of collectedLinks.slice(0, 6)) {
    if (out.length >= 3) break
    const oe = await verifyVimeoOembed(cand.link)
    if (!oe?.ok || !oe.videoId || !oe.thumbnailUrl) continue
    const lessonId = `lbd_sync_vimeo_${oe.videoId}`
    const norm = normalizeUrlDedupeKey(cand.link)
    if (seenIds.has(lessonId) || seenUrls.has(norm)) continue

    const finalTitle = (oe.title || cand.title).slice(0, 115)
    const creator = oe.authorName || "Vimeo Creator"
    if (!isCleanLearningCandidateTitle(finalTitle, creator)) continue
    const strictCat = mapKeywordsToCategoryStrict(finalTitle)
    if (!strictCat) continue

    seenIds.add(lessonId)
    seenUrls.add(norm)

    const cat = strictCat
    const defaults = buildCategoryMetadataDefaults(cat)
    const mins = oe.duration ? `${Math.floor(oe.duration / 60)}:${String(oe.duration % 60).padStart(2, "0")}` : ""

    out.push({
      id: lessonId,
      lessonNumber: baseLessonNum + out.length,
      videoLabel: `Synced (Vimeo · ${cat}): ${finalTitle.slice(0, 48)}`,
      title: finalTitle,
      category: cat,
      enclaveId: defaults.enclaveId,
      professionId: defaults.professionId,
      level: "Intermediate",
      originalCreator: `${creator} · Vimeo`,
      creatorDomain: "vimeo.com",
      sourceProvider: "vimeo",
      sourceVideoUrl: cand.link,
      referenceArticleUrl: cand.link,
      embedUrl: `https://player.vimeo.com/video/${oe.videoId}`,
      licenseLabel: "Standard Vimeo Embed · Creator Attributed",
      lastVerifiedAtMs: Date.now(),
      youtubeId: "",
      embedAvailable: true,
      duration: mins,
      thumbnailUrl: oe.thumbnailUrl,
      description: `Verified Vimeo ${cat} feature by ${creator}. Synced via the ConnectLn 24-hour multi-source curriculum feed.`,
      skillsCovered: defaults.skillsCovered,
      practiceActivity: defaults.practiceActivity,
      practiceDeliverablePrompt: defaults.practiceDeliverablePrompt,
      knowledgeCheck: defaults.knowledgeCheck,
    })
  }
  return out
}

// =====================================================================
// SOURCE ADAPTER 3: INTERNET ARCHIVE / MIT OCW (OPEN MP4)
// =====================================================================

async function syncInternetArchiveSource(
  seenIds: Set<string>,
  seenUrls: Set<string>,
  baseLessonNum: number
): Promise<LearnByDoingLesson[]> {
  try {
    const q = encodeURIComponent('collection:mit_ocw AND mediatype:movies AND format:"MPEG4"')
    const res = await fetch(
      `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=description&sort[]=downloads+desc&rows=12&page=1&output=json`,
      { signal: AbortSignal.timeout(5000), cache: "no-store" }
    )
    if (!res.ok) return []
    const json: any = await res.json().catch(() => null)
    const docs: any[] = Array.isArray(json?.response?.docs) ? json.response.docs : []

    const out: LearnByDoingLesson[] = []
    for (const d of docs) {
      if (out.length >= 3) break
      const ident = String(d?.identifier || "").trim()
      if (!ident) continue
      const safeIdent = ident.replace(/[^a-zA-Z0-9._-]/g, "_")
      const lessonId = `lbd_sync_archive_${safeIdent}`
      const detailsUrl = `https://archive.org/details/${ident}`
      if (seenIds.has(lessonId) || seenUrls.has(normalizeUrlDedupeKey(detailsUrl))) continue

      const metaRes = await fetch(`https://archive.org/metadata/${encodeURIComponent(ident)}`, {
        signal: AbortSignal.timeout(4000),
        cache: "no-store",
      }).catch(() => null)
      if (!metaRes?.ok) continue
      const metaJson: any = await metaRes.json().catch(() => null)
      const files: any[] = Array.isArray(metaJson?.files) ? metaJson.files : []
      const mp4File = files.find((f) => String(f?.name || "").toLowerCase().endsWith(".mp4"))
      if (!mp4File?.name) continue

      seenIds.add(lessonId)
      seenUrls.add(normalizeUrlDedupeKey(detailsUrl))

      const title = String(d?.title || ident).trim().slice(0, 115)
      const cat = mapKeywordsToCategory(title, "Science & Lab Tech")
      const defaults = buildCategoryMetadataDefaults(cat)
      const creator = String(d?.creator || "MIT OpenCourseWare").trim()
      const rawDesc = Array.isArray(d?.description)
        ? String(d.description[0] || "")
        : String(d?.description || "")
      const cleanDesc =
        rawDesc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 260) ||
        `Open-licensed MIT / Internet Archive training lecture: "${title}".`

      out.push({
        id: lessonId,
        lessonNumber: baseLessonNum + out.length,
        videoLabel: `Synced (Open Archive · ${cat}): ${title.slice(0, 45)}`,
        title,
        category: cat,
        enclaveId: defaults.enclaveId,
        professionId: defaults.professionId,
        level: "Intermediate",
        originalCreator: `${creator} · Internet Archive`,
        creatorDomain: "archive.org",
        sourceProvider: "archive_org",
        sourceVideoUrl: detailsUrl,
        referenceArticleUrl: detailsUrl,
        directVideoUrl: `https://archive.org/download/${encodeURIComponent(ident)}/${encodeURIComponent(String(mp4File.name))}`,
        embedUrl: `https://archive.org/embed/${encodeURIComponent(ident)}`,
        licenseLabel: "CC BY-NC-SA 4.0 · Internet Archive Open MP4",
        lastVerifiedAtMs: Date.now(),
        youtubeId: "",
        embedAvailable: true,
        duration: "",
        thumbnailUrl: `https://archive.org/services/img/${encodeURIComponent(ident)}`,
        description: cleanDesc,
        skillsCovered: defaults.skillsCovered,
        practiceActivity: defaults.practiceActivity,
        practiceDeliverablePrompt: defaults.practiceDeliverablePrompt,
        knowledgeCheck: defaults.knowledgeCheck,
      })
    }
    return out
  } catch {
    return []
  }
}

// =====================================================================
// SOURCE ADAPTER 4: PEERTUBE (FEDERATED) & DAILYMOTION PUBLIC API
// =====================================================================

async function syncPeerTubeAndDailymotionSource(
  seenIds: Set<string>,
  seenUrls: Set<string>,
  baseLessonNum: number
): Promise<LearnByDoingLesson[]> {
  const out: LearnByDoingLesson[] = []

  // A. PeerTube (MakerTube + TILvids — strictly local, How To / Education / Science & Technology)
  const ptHosts = ["makertube.net", "tilvids.com"]
  const disallowedPtCategoryRe = /gaming|music|entertainment|films|art|sport|animals|politics|news/i
  for (const host of ptHosts) {
    if (out.length >= 3) break
    try {
      const res = await fetch(
        `https://${host}/api/v1/videos?count=12&sort=-views&isLocal=true&nsfw=false&categoryOneOf=12&categoryOneOf=13&categoryOneOf=15`,
        { signal: AbortSignal.timeout(4000), cache: "no-store" }
      )
      if (!res.ok) continue
      const json: any = await res.json().catch(() => null)
      const list: any[] = Array.isArray(json?.data) ? json.data : []
      for (const v of list) {
        if (out.length >= 3) break
        const uuid = String(v?.shortUUID || v?.uuid || "").trim()
        const name = String(v?.name || "").trim()
        const dur = Number(v?.duration || 0)
        const creator = String(v?.channel?.displayName || "PeerTube Creator").trim()
        const ptCatLabel = String(v?.category?.label || "").trim()
        if (disallowedPtCategoryRe.test(ptCatLabel)) continue
        if (!uuid || !name || dur < 120 || !isCleanLearningCandidateTitle(name, creator)) continue

        const strictCat = mapKeywordsToCategoryStrict(`${name} ${v?.description || ""}`)
        if (!strictCat) continue

        const lessonId = `lbd_sync_pt_${uuid}`
        const watchUrl = `https://${host}/w/${uuid}`
        if (seenIds.has(lessonId) || seenUrls.has(normalizeUrlDedupeKey(watchUrl))) continue
        const rawThumb = String(v?.thumbnailPath || v?.previewPath || "").trim()
        const thumbUrl = rawThumb.startsWith("/") ? `https://${host}${rawThumb}` : rawThumb
        if (!thumbUrl) continue

        const embedCheck = await fetch(`https://${host}/videos/embed/${uuid}`, {
          method: "HEAD",
          signal: AbortSignal.timeout(2500),
          cache: "no-store",
        }).catch(() => null)
        if (!embedCheck?.ok) continue

        seenIds.add(lessonId)
        seenUrls.add(normalizeUrlDedupeKey(watchUrl))

        const cat = strictCat
        const defaults = buildCategoryMetadataDefaults(cat)
        const lic = String(v?.licence?.label || "PeerTube Federated Embed")

        out.push({
          id: lessonId,
          lessonNumber: baseLessonNum + out.length,
          videoLabel: `Synced (PeerTube · ${cat}): ${name.slice(0, 48)}`,
          title: name.slice(0, 115),
          category: cat,
          enclaveId: defaults.enclaveId,
          professionId: defaults.professionId,
          level: "Intermediate",
          originalCreator: `${creator} · PeerTube`,
          creatorDomain: host,
          sourceProvider: "peertube",
          sourceVideoUrl: watchUrl,
          referenceArticleUrl: watchUrl,
          embedUrl: `https://${host}/videos/embed/${uuid}`,
          licenseLabel: lic,
          lastVerifiedAtMs: Date.now(),
          youtubeId: "",
          embedAvailable: true,
          duration: `${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, "0")}`,
          thumbnailUrl: thumbUrl,
          description: `Verified federated PeerTube ${cat} session by ${creator}. Synced daily to the ConnectLn Learning Hub.`,
          skillsCovered: defaults.skillsCovered,
          practiceActivity: defaults.practiceActivity,
          practiceDeliverablePrompt: defaults.practiceDeliverablePrompt,
          knowledgeCheck: defaults.knowledgeCheck,
        })
      }
    } catch {}
  }

  // B. Dailymotion rotating trade queries
  const dmQueries: Array<{ q: string; cat: SkilledTradesCategory }> = [
    { q: "carpentry woodworking tutorial", cat: "Carpentry" },
    { q: "plumbing hvac repair tutorial", cat: "Plumbing" },
    { q: "welding electrical tutorial", cat: "Welding" },
    { q: "cybersecurity software engineering tutorial", cat: "Cybersecurity & IT" },
  ]
  const daySlot = Math.floor(Date.now() / TWENTY_FOUR_HOURS_MS) % dmQueries.length
  const dmPick = dmQueries[daySlot]
  try {
    const dmRes = await fetch(
      `https://api.dailymotion.com/videos?search=${encodeURIComponent(dmPick.q)}&fields=id,title,owner.screenname,thumbnail_480_url,duration,allow_embed,private&limit=10&sort=relevance`,
      { signal: AbortSignal.timeout(4500), cache: "no-store" }
    )
    if (dmRes.ok) {
      const dmJson: any = await dmRes.json().catch(() => null)
      const list: any[] = Array.isArray(dmJson?.list) ? dmJson.list : []
      let dmAdded = 0
      for (const v of list) {
        if (dmAdded >= 3) break
        const id = String(v?.id || "").trim()
        const title = String(v?.title || "").trim()
        const dur = Number(v?.duration || 0)
        const thumb = String(v?.thumbnail_480_url || "").trim()
        const creator = String(v?.["owner.screenname"] || "Dailymotion Creator").trim()
        if (v?.allow_embed !== true || v?.private === true) continue
        if (!id || !title || dur < 120 || !thumb || !isCleanLearningCandidateTitle(title, creator)) continue
        const strictCat = mapKeywordsToCategoryStrict(title)
        if (!strictCat) continue
        const lessonId = `lbd_sync_dm_${id}`
        const watchUrl = `https://www.dailymotion.com/video/${id}`
        if (seenIds.has(lessonId) || seenUrls.has(normalizeUrlDedupeKey(watchUrl))) continue
        seenIds.add(lessonId)
        seenUrls.add(normalizeUrlDedupeKey(watchUrl))

        const cat = strictCat
        const defaults = buildCategoryMetadataDefaults(cat)

        out.push({
          id: lessonId,
          lessonNumber: baseLessonNum + out.length,
          videoLabel: `Synced (Dailymotion · ${cat}): ${title.slice(0, 48)}`,
          title: title.slice(0, 115),
          category: cat,
          enclaveId: defaults.enclaveId,
          professionId: defaults.professionId,
          level: "Beginner",
          originalCreator: `${creator} · Dailymotion`,
          creatorDomain: "dailymotion.com",
          sourceProvider: "dailymotion",
          sourceVideoUrl: watchUrl,
          referenceArticleUrl: watchUrl,
          embedUrl: `https://geo.dailymotion.com/player.html?video=${id}`,
          licenseLabel: "Standard Dailymotion Embed · Creator Attributed",
          lastVerifiedAtMs: Date.now(),
          youtubeId: "",
          embedAvailable: true,
          duration: `${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, "0")}`,
          thumbnailUrl: thumb,
          description: `Verified Dailymotion ${cat} tutorial by ${creator}. Synced automatically every 24 hours.`,
          skillsCovered: defaults.skillsCovered,
          practiceActivity: defaults.practiceActivity,
          practiceDeliverablePrompt: defaults.practiceDeliverablePrompt,
          knowledgeCheck: defaults.knowledgeCheck,
        })
        dmAdded += 1
      }
    }
  } catch {}

  return out
}

// =====================================================================
// ARCHIVE READ/WRITE & 30-DAY YOUTUBE COMPLIANCE REFRESH
// =====================================================================

async function readExistingSyncedArchive(): Promise<{
  lessons: LearnByDoingLesson[]
  meta: LearningVideoSyncMeta | null
  mongoConnected: boolean
}> {
  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        const docs = await db
          .collection<Record<string, any>>(MONGO_COLLECTION)
          .find({})
          .sort({ syncedAtMs: -1 })
          .limit(450)
          .toArray()

        let meta: LearningVideoSyncMeta | null = null
        const lessons: LearnByDoingLesson[] = []
        for (const doc of docs) {
          if (doc._id === META_DOC_ID || doc.docType === "meta") {
            const { _id, docType, ...rest } = doc
            meta = rest as LearningVideoSyncMeta
          } else if (doc.id && doc.title) {
            const { _id, docType, syncedAtMs, publishedAtIso, ...lesson } = doc
            lessons.push({
              ...(lesson as LearnByDoingLesson),
              youtubeId: typeof lesson.youtubeId === "string" ? lesson.youtubeId : "",
              sourceProvider:
                lesson.sourceProvider ||
                (lesson.directVideoUrl
                  ? "connectln_native"
                  : lesson.youtubeId
                  ? "youtube"
                  : undefined),
            })
          }
        }
        return { lessons, meta, mongoConnected: true }
      }
    } catch (err) {
      console.warn("[learning-video-sync] MongoDB read fallback:", (err as any)?.message)
    }
  }

  try {
    const { firebaseKvListItems } = await import("./connectin-firebase-kv")
    const entries = await firebaseKvListItems<any>(FB_LEARNING_KV_MAP, false)
    let meta: LearningVideoSyncMeta | null = null
    const lessons: LearnByDoingLesson[] = []
    for (const entry of entries) {
      if (!entry?.data) continue
      if (entry.key === META_DOC_ID) {
        meta = entry.data as LearningVideoSyncMeta
      } else if (entry.data.id && entry.data.title) {
        lessons.push({
          ...(entry.data as LearnByDoingLesson),
          youtubeId: typeof entry.data.youtubeId === "string" ? entry.data.youtubeId : "",
        })
      }
    }
    return { lessons, meta, mongoConnected: false }
  } catch {
    return { lessons: [], meta: null, mongoConnected: false }
  }
}

async function pruneBlockedAndOffTopicSyncedDocs(
  existingLessons: LearnByDoingLesson[]
): Promise<{ surviving: LearnByDoingLesson[]; prunedCount: number }> {
  const nowMs = Date.now()
  const prunedIds = new Set<string>()
  const refreshedMap = new Map<string, LearnByDoingLesson>()

  // 1. Immediately flag off-topic external synced entries (never touch native creator uploads)
  const survivingAfterTitleFilter: LearnByDoingLesson[] = []
  for (const item of existingLessons) {
    if (item.id.startsWith("lbd_native_") || item.sourceProvider === "connectln_native") {
      survivingAfterTitleFilter.push(item)
      continue
    }
    const prov = item.sourceProvider || (item.youtubeId ? "youtube" : undefined)
    if (prov === "peertube" || prov === "vimeo" || prov === "dailymotion") {
      if (!isCleanLearningCandidateTitle(item.title, item.originalCreator)) {
        prunedIds.add(item.id)
        continue
      }
      if (
        (prov === "peertube" || prov === "vimeo") &&
        !mapKeywordsToCategoryStrict(`${item.title} ${item.description || ""}`)
      ) {
        prunedIds.add(item.id)
        continue
      }
    }
    survivingAfterTitleFilter.push(item)
  }

  // 2. Verify all remaining Vimeo synced items actually embed cleanly on player.vimeo.com
  const vimeoDocs = survivingAfterTitleFilter.filter((l) => l.sourceProvider === "vimeo")
  const staleYouTubeCandidates = survivingAfterTitleFilter
    .filter((l) => {
      if (l.id.startsWith("lbd_native_") || l.sourceProvider === "connectln_native") return false
      const isYt = (l.sourceProvider || (l.youtubeId ? "youtube" : undefined)) === "youtube"
      if (!isYt || !l.youtubeId) return false
      return !l.lastVerifiedAtMs || nowMs - Number(l.lastVerifiedAtMs) >= YOUTUBE_REFRESH_AGE_MS
    })
    .slice(0, 20)

  await Promise.all([
    ...vimeoDocs.map(async (item) => {
      const m = String(item.embedUrl || item.sourceVideoUrl || "").match(/\/(\d+)(?:$|[?#])/)
      const vidId = m?.[1] || item.id.replace("lbd_sync_vimeo_", "")
      const ok = await verifyVimeoPlayerEmbeddable(vidId)
      if (!ok) {
        prunedIds.add(item.id)
      }
    }),
    ...staleYouTubeCandidates.map(async (item) => {
      const check = await verifyYoutubeEmbeddable(item.youtubeId || "")
      if (check.permanentlyUnavailable) {
        prunedIds.add(item.id)
      } else if (check.ok) {
        refreshedMap.set(item.id, {
          ...item,
          sourceProvider: "youtube",
          title: check.title || item.title,
          originalCreator: check.authorName || item.originalCreator,
          lastVerifiedAtMs: nowMs,
        })
      }
    }),
  ])

  if (prunedIds.size > 0 || refreshedMap.size > 0) {
    if (isConnectLnMongoConfigured()) {
      try {
        const db = await getConnectLnMongoDb()
        if (db) {
          const col = db.collection<Record<string, any>>(MONGO_COLLECTION)
          if (prunedIds.size > 0) {
            await col.deleteMany({ _id: { $in: Array.from(prunedIds) as any[] } })
          }
          if (refreshedMap.size > 0) {
            await col.bulkWrite(
              Array.from(refreshedMap.values()).map((l) => ({
                updateOne: {
                  filter: { _id: l.id as any },
                  update: {
                    $set: {
                      title: l.title,
                      originalCreator: l.originalCreator,
                      sourceProvider: "youtube",
                      lastVerifiedAtMs: nowMs,
                    },
                  },
                },
              })),
              { ordered: false }
            )
          }
        }
      } catch {}
    } else if (prunedIds.size > 0) {
      try {
        const { firebaseKvDeleteItem } = await import("./connectin-firebase-kv")
        for (const id of prunedIds) {
          await firebaseKvDeleteItem(FB_LEARNING_KV_MAP, id)
        }
      } catch {}
    }
  }

  const surviving = existingLessons
    .filter((l) => !prunedIds.has(l.id))
    .map((l) => refreshedMap.get(l.id) || l)

  return { surviving, prunedCount: prunedIds.size }
}

function computeSourceBreakdown(allSynced: LearnByDoingLesson[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const l of allSynced) {
    const prov: LearnVideoSourceProvider =
      l.sourceProvider || (l.directVideoUrl ? "connectln_native" : "youtube")
    counts[prov] = (counts[prov] || 0) + 1
  }
  return counts
}

async function saveNewSyncedArchive(
  newLessons: LearnByDoingLesson[],
  meta: LearningVideoSyncMeta
): Promise<boolean> {
  const nowMs = Date.now()

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        const col = db.collection<Record<string, any>>(MONGO_COLLECTION)
        if (newLessons.length > 0) {
          const ops = newLessons.map((lesson, idx) => ({
            updateOne: {
              filter: { _id: lesson.id as any },
              update: {
                $setOnInsert: prepareLessonDocForMongo(lesson, nowMs - idx),
              },
              upsert: true,
            },
          }))
          await col.bulkWrite(ops, { ordered: false })
        }

        await col.updateOne(
          { _id: META_DOC_ID as any },
          {
            $set: {
              ...meta,
              _id: META_DOC_ID,
              docType: "meta",
              updatedAtMs: nowMs,
            },
          },
          { upsert: true }
        )
        return true
      }
    } catch (err) {
      console.warn("[learning-video-sync] MongoDB write fallback:", (err as any)?.message)
    }
  }

  try {
    const { firebaseKvSetItem } = await import("./connectin-firebase-kv")
    for (const l of newLessons) {
      await firebaseKvSetItem(FB_LEARNING_KV_MAP, l.id, l)
    }
    await firebaseKvSetItem(FB_LEARNING_KV_MAP, META_DOC_ID, meta)
    return true
  } catch {
    return false
  }
}

export async function insertCreatorLearningLesson(
  lesson: LearnByDoingLesson
): Promise<{ ok: boolean; mongoConnected: boolean }> {
  const nowMs = Date.now()
  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb()
      if (db) {
        const doc = prepareLessonDocForMongo(lesson, nowMs)
        await db
          .collection<Record<string, any>>(MONGO_COLLECTION)
          .updateOne({ _id: lesson.id as any }, { $set: doc }, { upsert: true })
        return { ok: true, mongoConnected: true }
      }
    } catch (err) {
      console.warn("[learning-video-sync] insertCreatorLearningLesson fallback:", (err as any)?.message)
    }
  }

  try {
    const { firebaseKvSetItem } = await import("./connectin-firebase-kv")
    const ok = await firebaseKvSetItem(FB_LEARNING_KV_MAP, lesson.id, lesson)
    return { ok, mongoConnected: false }
  } catch {
    return { ok: false, mongoConnected: false }
  }
}

/**
 * Loads permanently archived 24h-synced + native creator Learning videos from MongoDB Atlas,
 * runs multi-source additive discovery (YouTube, Vimeo, Internet Archive MIT OCW, PeerTube, Dailymotion),
 * and refreshes/prunes cached YouTube links <30 days old per YouTube API policy.
 */
export async function getOrSync24HourLearningVideos(params?: {
  forceSync?: boolean
  triggeredBy?: string
}): Promise<{
  lessons: LearnByDoingLesson[]
  addedCount: number
  meta: LearningVideoSyncMeta
  mongoConnected: boolean
}> {
  const forceSync = Boolean(params?.forceSync)
  const triggeredBy = params?.triggeredBy || "auto-24h-learning-check"
  const { lessons: rawExisting, meta: existingMeta, mongoConnected } =
    await readExistingSyncedArchive()

  const lastSyncMs = existingMeta?.lastSyncIso ? Date.parse(existingMeta.lastSyncIso) : 0
  const due24h = !lastSyncMs || Number.isNaN(lastSyncMs) || Date.now() - lastSyncMs >= TWENTY_FOUR_HOURS_MS
  const hasNonYouTubeSynced = rawExisting.some(
    (l) => l.sourceProvider && l.sourceProvider !== "youtube"
  )
  const shouldFetchNow = forceSync || due24h || rawExisting.length === 0 || !hasNonYouTubeSynced

  if (!shouldFetchNow && existingMeta) {
    return {
      lessons: rawExisting,
      addedCount: 0,
      meta: {
        ...existingMeta,
        sourceBreakdown: existingMeta.sourceBreakdown || computeSourceBreakdown(rawExisting),
      },
      mongoConnected,
    }
  }

  // Enforce <30 day YouTube metadata freshness & prune blocked Vimeo / off-topic PeerTube clips
  const { surviving: existingSynced, prunedCount } =
    await pruneBlockedAndOffTopicSyncedDocs(rawExisting)

  const seenIds = new Set<string>()
  const seenYtIds = new Set<string>()
  const seenUrls = new Set<string>()

  for (const base of SKILLED_TRADES_LEARN_BY_DOING_LESSONS) {
    seenIds.add(base.id)
    if (base.youtubeId) seenYtIds.add(base.youtubeId)
    if (base.companionVariant?.youtubeId) seenYtIds.add(base.companionVariant.youtubeId)
    if (base.sourceVideoUrl) seenUrls.add(normalizeUrlDedupeKey(base.sourceVideoUrl))
  }
  for (const synced of existingSynced) {
    seenIds.add(synced.id)
    if (synced.youtubeId) seenYtIds.add(synced.youtubeId)
    if (synced.sourceVideoUrl) seenUrls.add(normalizeUrlDedupeKey(synced.sourceVideoUrl))
  }

  const baseLessonNumber =
    SKILLED_TRADES_LEARN_BY_DOING_LESSONS.length + existingSynced.length + 1

  const [ytRes, vimeoRes, archiveRes, ptDmRes] = await Promise.allSettled([
    syncYouTubeSource(seenYtIds, baseLessonNumber),
    syncVimeoSource(seenIds, seenUrls, baseLessonNumber + 20),
    syncInternetArchiveSource(seenIds, seenUrls, baseLessonNumber + 30),
    syncPeerTubeAndDailymotionSource(seenIds, seenUrls, baseLessonNumber + 40),
  ])

  const combinedNew: LearnByDoingLesson[] = []
  for (const res of [vimeoRes, archiveRes, ptDmRes, ytRes]) {
    if (res.status === "fulfilled" && Array.isArray(res.value)) {
      for (const item of res.value) {
        if (!combinedNew.some((x) => x.id === item.id)) {
          combinedNew.push(item)
        }
      }
    }
  }

  // Re-number sequentially for clean shelf labels
  const numberedNew = combinedNew.map((l, idx) => ({
    ...l,
    lessonNumber: baseLessonNumber + idx,
  }))

  const allSynced = [...numberedNew, ...existingSynced]
  const nowIso = new Date().toISOString()
  const nextIso = new Date(Date.now() + TWENTY_FOUR_HOURS_MS).toISOString()
  const updatedMeta: LearningVideoSyncMeta = {
    lastSyncIso: nowIso,
    nextSyncIso: nextIso,
    lastAddedCount: numberedNew.length,
    totalSyncedCount: allSynced.length,
    cadenceHours: 24,
    triggeredBy,
    sourceBreakdown: computeSourceBreakdown(allSynced),
    prunedStaleYouTubeCount: prunedCount,
  }

  await saveNewSyncedArchive(numberedNew, updatedMeta)

  return {
    lessons: allSynced,
    addedCount: numberedNew.length,
    meta: updatedMeta,
    mongoConnected,
  }
}
