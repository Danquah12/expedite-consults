import {
  SpecializedTangibleCareerSpec,
  buildSpecializedCareerPathway,
  SPECIALIZED_33_CAREER_SPECS,
  SPECIALIZED_33_CAREER_PATHWAYS
} from "@/lib/connectln-33-specialized-careers"
import { PriorityCareerPathway } from "@/lib/connectln-career-mastery-academy"

export interface AcademyTrainingVideoItem {
  id: string
  title: string
  pathwayTitle: string
  careerTitle: string
  careerNumber: number
  domainNumber: number
  domainTitle: string
  academyId: string
  duration: string
  durationSeconds: number
  instructor: string
  sourceOrg: string
  instructorOrSource: string
  thumbnailUrl: string
  videoUrl: string
  youtubeEmbedUrl: string
  officialResourceUrl: string
  summary: string
  keyTechnicalTakeaway: string
  chapters: { timestamp: string; title: string; takeaway: string }[]
  keyChapters: { time: string; label: string; technicalPoint: string }[]
  interactiveSimType:
    | "cleanroom-litho"
    | "otdr-fiber"
    | "power-fault"
    | "dfir-timeline"
    | "ev-battery"
    | "avionics-bus"
}

export type TrainingVideoWalkthrough = AcademyTrainingVideoItem

export const ACADEMY_TRAINING_VIDEOS: AcademyTrainingVideoItem[] = [
  {
    id: "vid-semiconductor-wafer-fab",
    title: "Semiconductor Wafer Fabrication, Cleanroom Protocol & Photolithography Walkthrough",
    pathwayTitle: "#42 Semiconductor Manufacturing Technology",
    careerTitle: "Semiconductor Manufacturing Technology",
    careerNumber: 42,
    domainNumber: 10,
    domainTitle: "10. Semiconductor manufacturing and advanced materials",
    academyId: "academy-1-advanced-manufacturing",
    duration: "18:45",
    durationSeconds: 1125,
    instructor: "NIST CHIPS Metrology & Microfabrication Lab",
    sourceOrg: "NIST / SEMI / University Microfabrication Reference",
    instructorOrSource: "NIST CHIPS Metrology & SEMI Microfabrication Lab",
    thumbnailUrl: "/images/connectln-studies/semiconductor-cleanroom-bento.png",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/bor0qLifjz4",
    officialResourceUrl: "https://www.nist.gov/chips/research-development-programs/metrology-program",
    summary:
      "Visual walkthrough of silicon wafer preparation, ISO cleanroom gowning and particle control, spin-coating photoresist, EUV/DUV reticle alignment, plasma etching, CVD/ALD film deposition, and inline optical metrology.",
    keyTechnicalTakeaway:
      "Poisson Yield Y = exp(-D0 × A) & 5-Site Oxide SPC Control Limits (97–103 nm): a single 0.1 µm particle bridges adjacent metal interconnects.",
    chapters: [
      { timestamp: "00:00", title: "ISO Cleanroom Gowning & Particle Physics", takeaway: "Why a 0.1 µm airborne particle causes killer bridging defects (Poisson λA model)." },
      { timestamp: "04:15", title: "Thermal Oxidation & Thin-Film Deposition", takeaway: "Growing SiO2 insulating layers and CVD/PVD/ALD uniform film growth (nm/min)." },
      { timestamp: "08:50", title: "Photolithography: Coat, Align, Expose & Develop", takeaway: "Positive vs. negative resist, overlay alignment registration, and Critical Dimension (CD) control." },
      { timestamp: "13:20", title: "Dry Plasma Etching, Ion Implantation & CMP", takeaway: "Anisotropic profile control, etch selectivity, and Chemical Mechanical Planarization." },
      { timestamp: "16:10", title: "SPC Control Charts & Lot Traceability", takeaway: "Evaluating 5-site wafer film thickness (Mean & Range) against 97–103 nm control limits." }
    ],
    keyChapters: [
      { time: "00:00", label: "ISO Cleanroom Gowning & Particle Physics", technicalPoint: "Why a 0.1 µm airborne particle causes killer bridging defects (Poisson λA model)." },
      { time: "04:15", label: "Thermal Oxidation & Thin-Film Deposition", technicalPoint: "Growing SiO2 insulating layers and CVD/PVD/ALD uniform film growth (nm/min)." },
      { time: "08:50", label: "Photolithography: Coat, Align, Expose & Develop", technicalPoint: "Positive vs. negative resist, overlay alignment registration, and Critical Dimension (CD) control." },
      { time: "13:20", label: "Dry Plasma Etching, Ion Implantation & CMP", technicalPoint: "Anisotropic profile control, etch selectivity, and Chemical Mechanical Planarization." },
      { time: "16:10", label: "SPC Control Charts & Lot Traceability", technicalPoint: "Evaluating 5-site wafer film thickness (Mean & Range) against 97–103 nm control limits." }
    ],
    interactiveSimType: "cleanroom-litho"
  },
  {
    id: "vid-fiber-otdr-telecom",
    title: "Fiber-Optic Fusion Splicing, Optical Loss Budgets & OTDR Trace Fault Localization",
    pathwayTitle: "#38 Fiber Optics and Telecommunications Infrastructure",
    careerTitle: "Fiber Optics and Telecommunications Infrastructure",
    careerNumber: 38,
    domainNumber: 9,
    domainTitle: "9. Telecommunications, networking and critical connectivity",
    academyId: "academy-2-engineering-critical-infrastructure",
    duration: "14:20",
    durationSeconds: 860,
    instructor: "Telecommunications Infrastructure Lab",
    sourceOrg: "TIA-568 / FOA Reference Standard",
    instructorOrSource: "TIA-568 / FOA Optical Telecommunications Lab",
    thumbnailUrl: "/images/connectln-studies/robotics-plc-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/0MwMkBET_5I",
    officialResourceUrl: "https://www.nist.gov/communications-technology-laboratory",
    summary:
      "Step-by-step demonstration of single-mode OS2 fiber preparation, fusion splicing (<0.05 dB loss), OLTS bi-directional insertion loss testing at 1310/1550 nm, and reading OTDR Rayleigh backscatter and Fresnel reflection events.",
    keyTechnicalTakeaway:
      "Total Link Loss Budget (dB) = α_fiber × L_km + N_conn × L_conn + N_splice × L_splice; OTDR localizes macrobends and reflective breaks to ±1 m.",
    chapters: [
      { timestamp: "00:00", title: "Single-Mode vs. Multimode Optical Physics", takeaway: "Core/cladding refractive index (9/125 µm OS2) and total internal reflection." },
      { timestamp: "04:10", title: "Link Loss Budget Calculation", takeaway: "Summing fiber attenuation (dB/km), mated connectors (0.5 dB), and fusion splices (0.1 dB)." },
      { timestamp: "09:05", title: "OTDR Launch/Receive Cables & Dead Zones", takeaway: "Locating a high-loss macrobend or reflective break to the nearest meter." }
    ],
    keyChapters: [
      { time: "00:00", label: "Single-Mode vs. Multimode Optical Physics", technicalPoint: "Core/cladding refractive index (9/125 µm OS2) and total internal reflection." },
      { time: "04:10", label: "Link Loss Budget Calculation", technicalPoint: "Summing fiber attenuation (dB/km), mated connectors (0.5 dB), and fusion splices (0.1 dB)." },
      { time: "09:05", label: "OTDR Launch/Receive Cables & Dead Zones", technicalPoint: "Locating a high-loss macrobend or reflective break to the nearest meter." }
    ],
    interactiveSimType: "otdr-fiber"
  },
  {
    id: "vid-aircraft-avionics-maintenance",
    title: "Aircraft Electrical Distribution, ARINC 429 / MIL-STD-1553 Avionics & Fault Isolation",
    pathwayTitle: "#34 Aircraft Maintenance and Avionics",
    careerTitle: "Aircraft Maintenance and Avionics",
    careerNumber: 34,
    domainNumber: 8,
    domainTitle: "8. Aviation, aerospace and maritime careers",
    academyId: "academy-2-engineering-critical-infrastructure",
    duration: "16:30",
    durationSeconds: 990,
    instructor: "FAA AMT Airframe & Avionics Systems Division",
    sourceOrg: "FAA Aviation Maintenance Technician Handbook (FAA-H-8083-30B)",
    instructorOrSource: "FAA AMT Airframe & Avionics Systems Division",
    thumbnailUrl: "/images/connectln-studies/trades-superintendent-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/y5M3_N9-A8E",
    officialResourceUrl: "https://www.faa.gov/regulations_policies/handbooks_manuals/aviation",
    summary:
      "Covers 115V 400Hz AC and 28V DC split-bus aircraft electrical architectures, pitot-static & attitude instrumentation, ARINC 429 data bus troubleshooting, FIM fault isolation trees, and airworthiness logbook sign-off rules.",
    keyTechnicalTakeaway:
      "Continuous bus load must remain <= 80% of rated generator capacity; every installed LRU requires traceable FAA Form 8130-3 / EASA Form 1 documentation.",
    chapters: [
      { timestamp: "00:00", title: "28V DC & 115V 400Hz AC Essential Bus Architecture", takeaway: "Generator Control Units (GCU), bus tie breakers, and emergency battery load shedding." },
      { timestamp: "06:40", title: "Avionics Data Buses & Pitot-Static Instruments", takeaway: "Decoding ARINC 429 32-bit words (SDI, Data, SSM, Parity) and isolating Intermittent BITE faults." },
      { timestamp: "12:15", title: "Approved Maintenance Manuals & Traceability", takeaway: "Using the Fault Isolation Manual (FIM), calibrated torque/crimping tools, and Form 8130-3 tags." }
    ],
    keyChapters: [
      { time: "00:00", label: "28V DC & 115V 400Hz AC Essential Bus Architecture", technicalPoint: "Generator Control Units (GCU), bus tie breakers, and emergency battery load shedding." },
      { time: "06:40", label: "Avionics Data Buses & Pitot-Static Instruments", technicalPoint: "Decoding ARINC 429 32-bit words (SDI, Data, SSM, Parity) and isolating Intermittent BITE faults." },
      { time: "12:15", label: "Approved Maintenance Manuals & Traceability", technicalPoint: "Using the Fault Isolation Manual (FIM), calibrated torque/crimping tools, and Form 8130-3 tags." }
    ],
    interactiveSimType: "avionics-bus"
  },
  {
    id: "vid-power-systems-microgrid",
    title: "Power Systems Load Flow, Symmetrical Fault Analysis & Microgrid Relay Coordination",
    pathwayTitle: "#1 Power Systems Engineering & #44 Battery Energy Storage",
    careerTitle: "Power Systems Engineering",
    careerNumber: 1,
    domainNumber: 1,
    domainTitle: "1. Advanced engineering and critical infrastructure",
    academyId: "academy-2-engineering-critical-infrastructure",
    duration: "19:10",
    durationSeconds: 1150,
    instructor: "Grid Modernization & Protection Lab",
    sourceOrg: "IEEE 1547 / NREL Grid Integration",
    instructorOrSource: "IEEE 1547 / NREL Grid Modernization Lab",
    thumbnailUrl: "/images/connectln-studies/solar-microgrid-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/4oRT7PoXSS0",
    officialResourceUrl: "https://www.nrel.gov/grid/",
    summary:
      "Demonstrates per-unit impedance conversion on a 13.8 kV feeder, 3-phase short-circuit current calculation, ANSI 50/51/67 protection relay time-current coordination curves, and battery energy storage State of Health (SoH) thermal safety.",
    keyTechnicalTakeaway:
      "I_fault_3ph = I_base / |Z_pu_total|; circuit breaker interrupting rating and ANSI 51 inverse-time relay curves must clear faults before thermal damage.",
    chapters: [
      { timestamp: "00:00", title: "Per-Unit Impedance & Three-Phase Power", takeaway: "Converting MVA and kV bases across substation transformers." },
      { timestamp: "07:30", title: "Bolted 3-Phase & Line-to-Ground Fault Currents", takeaway: "Verifying circuit breaker asymmetrical interrupting duty." },
      { timestamp: "13:45", title: "DER Microgrid Islanding & BESS Thermal Runaway Prevention", takeaway: "IEEE 1547 ride-through settings and BMS cell voltage/temperature balancing." }
    ],
    keyChapters: [
      { time: "00:00", label: "Per-Unit Impedance & Three-Phase Power", technicalPoint: "Converting MVA and kV bases across substation transformers." },
      { time: "07:30", label: "Bolted 3-Phase & Line-to-Ground Fault Currents", technicalPoint: "Verifying circuit breaker asymmetrical interrupting duty." },
      { time: "13:45", label: "DER Microgrid Islanding & BESS Thermal Runaway Prevention", technicalPoint: "IEEE 1547 ride-through settings and BMS cell voltage/temperature balancing." }
    ],
    interactiveSimType: "power-fault"
  },
  {
    id: "vid-dfir-incident-reconstruction",
    title: "DFIR Memory Forensics, Windows Event Log Timeline Reconstruction & Chain of Custody",
    pathwayTitle: "#6 Digital Forensics & Incident Response / #51 Legal Tech E-Discovery",
    careerTitle: "Digital Forensics and Incident Reconstruction",
    careerNumber: 6,
    domainNumber: 2,
    domainTitle: "2. Cybersecurity, intelligence and digital trust",
    academyId: "academy-4-cyber-resilience-public-safety",
    duration: "15:50",
    durationSeconds: 950,
    instructor: "Cyber Defense & Forensic Triage Unit",
    sourceOrg: "NIST SP 800-86 & SP 800-61 Rev. 2",
    instructorOrSource: "NIST SP 800-86 Cyber Defense & Forensic Triage Unit",
    thumbnailUrl: "/images/connectln-studies/packet-soc-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/BMfcEB14a7M",
    officialResourceUrl: "https://csrc.nist.gov/pubs/sp/800/86/final",
    summary:
      "Walks through RFC 3227 Order of Volatility, SHA-256 cryptographic hashing of evidence images, normalizing Sysmon/EVTX/MFT timestamps to UTC, and producing a court-defensible E-Discovery / DFIR evidence schedule.",
    keyTechnicalTakeaway:
      "RFC 3227 Order of Volatility + SHA-256 bit-stream verification ensures zero evidence spoliation across UTC-normalized incident timelines.",
    chapters: [
      { timestamp: "00:00", title: "Order of Volatility & Cryptographic Hashing", takeaway: "Capturing volatile RAM before disk imaging and verifying SHA-256 digests." },
      { timestamp: "05:30", title: "Correlating EVTX 4624/4688, Sysmon & MFT", takeaway: "Reconstructing lateral movement and persistence across time zones." },
      { timestamp: "11:40", title: "Litigation Hold & Defensible Evidence Production", takeaway: "Separating confirmed artifact facts from analytical inferences." }
    ],
    keyChapters: [
      { time: "00:00", label: "Order of Volatility & Cryptographic Hashing", technicalPoint: "Capturing volatile RAM before disk imaging and verifying SHA-256 digests." },
      { time: "05:30", label: "Correlating EVTX 4624/4688, Sysmon & MFT", technicalPoint: "Reconstructing lateral movement and persistence across time zones." },
      { time: "11:40", label: "Litigation Hold & Defensible Evidence Production", technicalPoint: "Separating confirmed artifact facts from analytical inferences." }
    ],
    interactiveSimType: "dfir-timeline"
  },
  {
    id: "vid-ev-battery-diagnostics",
    title: "EV High-Voltage Safety, Battery Management Systems (BMS) & Charging Protocol Diagnostics",
    pathwayTitle: "#44 Battery Systems & #45 EV Diagnostics and Charging Infrastructure",
    careerTitle: "Electric Vehicle Diagnostics and Charging Infrastructure",
    careerNumber: 45,
    domainNumber: 10,
    domainTitle: "10. Semiconductor manufacturing and advanced materials",
    academyId: "academy-1-advanced-manufacturing",
    duration: "17:05",
    durationSeconds: 1025,
    instructor: "Advanced Mobility & Energy Storage Lab",
    sourceOrg: "NREL Energy Storage / SAE J1772 & CCS Standards",
    instructorOrSource: "NREL Energy Storage / SAE J1772 & CCS Lab",
    thumbnailUrl: "/images/connectln-studies/cyber-specialist-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/PXNKkcB0pI4",
    officialResourceUrl: "https://www.nrel.gov/transportation/energy-storage.html",
    summary:
      "Covers high-voltage orange-cable Manual Service Disconnect (MSD) zero-potential verification, lithium-ion cell State of Charge (SoC) and State of Health (SoH) internal resistance testing, and CCS/J1772 Control Pilot (CP) PWM charging handshake troubleshooting.",
    keyTechnicalTakeaway:
      "Live-Dead-Live 0 V verification after MSD removal + HV isolation resistance >= 500 Ω/V are mandatory before touching any orange HV busbar.",
    chapters: [
      { timestamp: "00:00", title: "High-Voltage Personal Protective Equipment & Zero-Energy Test", takeaway: "Class 0 insulated gloves, Manual Service Disconnect removal, and live-dead-live verification." },
      { timestamp: "06:15", title: "Cell Imbalance, Capacity Fade & State of Health (SoH)", takeaway: "Calculating SoH = C_measured / C_nominal and diagnosing DC internal resistance rise." },
      { timestamp: "12:00", title: "J1772 / CCS Control Pilot & Isolation Fault Isolation", takeaway: "Diagnosing ground-fault isolation loss (< 500 Ω/V) and contactor pre-charge failure." }
    ],
    keyChapters: [
      { time: "00:00", label: "High-Voltage Personal Protective Equipment & Zero-Energy Test", technicalPoint: "Class 0 insulated gloves, Manual Service Disconnect removal, and live-dead-live verification." },
      { time: "06:15", label: "Cell Imbalance, Capacity Fade & State of Health (SoH)", technicalPoint: "Calculating SoH = C_measured / C_nominal and diagnosing DC internal resistance rise." },
      { time: "12:00", label: "J1772 / CCS Control Pilot & Isolation Fault Isolation", technicalPoint: "Diagnosing ground-fault isolation loss (< 500 Ω/V) and contactor pre-charge failure." }
    ],
    interactiveSimType: "ev-battery"
  },
  {
    id: "vid-ot-ics-scada-cyber",
    title: "OT/ICS SCADA Network Segmentation, Purdue Model Conduits & PLC Ladder Logic Defense",
    pathwayTitle: "#9 Operational Technology (OT) and Industrial Cybersecurity",
    careerTitle: "Operational Technology (OT) and Industrial Cybersecurity",
    careerNumber: 9,
    domainNumber: 2,
    domainTitle: "2. Cybersecurity, intelligence and digital trust",
    academyId: "academy-4-cyber-resilience-public-safety",
    duration: "16:15",
    durationSeconds: 975,
    instructor: "CISA ICS-CERT & IEC 62443 Industrial Control Lab",
    sourceOrg: "NIST SP 800-82 Rev. 3 / ISA/IEC 62443",
    instructorOrSource: "NIST SP 800-82 / ISA-IEC 62443 Control Lab",
    thumbnailUrl: "/images/connectln-studies/cyber-specialist-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/RkmWCI-JtL8",
    officialResourceUrl: "https://csrc.nist.gov/pubs/sp/800/82/r3/final",
    summary:
      "Demonstrates Purdue Model Level 0–3.5 IDMZ segmentation, deep packet inspection of Modbus TCP / DNP3 function codes, passive asset discovery (never active-scanning safety PLCs), and stop-dominant seal-in interlock verification.",
    keyTechnicalTakeaway:
      "Enforce unidirectional or deep-packet-inspected Level 3.5 IDMZ conduits and passive taps; active SYN scans can fault legacy safety PLCs.",
    chapters: [
      { timestamp: "00:00", title: "Purdue Model Levels 0–4 & ISA/IEC 62443 Zones", takeaway: "Separating Enterprise IT from Level 1 Safety Instrumented Systems (SIS)." },
      { timestamp: "06:20", title: "Inspecting Unauthorized Modbus Write Function Codes", takeaway: "Blocking unauthenticated Function Code 06/16 register writes across conduits." },
      { timestamp: "11:50", title: "PLC Stop-Dominant Ladder Logic & Failsafe Recovery", takeaway: "Verifying hardware E-Stop and physical keyswitches override network commands." }
    ],
    keyChapters: [
      { time: "00:00", label: "Purdue Model Levels 0–4 & ISA/IEC 62443 Zones", technicalPoint: "Separating Enterprise IT from Level 1 Safety Instrumented Systems (SIS)." },
      { time: "06:20", label: "Inspecting Unauthorized Modbus Write Function Codes", technicalPoint: "Blocking unauthenticated Function Code 06/16 register writes across conduits." },
      { time: "11:50", label: "PLC Stop-Dominant Ladder Logic & Failsafe Recovery", technicalPoint: "Verifying hardware E-Stop and physical keyswitches override network commands." }
    ],
    interactiveSimType: "dfir-timeline"
  },
  {
    id: "vid-biomanufacturing-cleanroom-gmp",
    title: "Biomanufacturing cGMP Batch Records, Cleanroom Aseptic Gowning & Upstream Bioreactor Control",
    pathwayTitle: "#16 Biomanufacturing and Cleanroom Operations",
    careerTitle: "Biomanufacturing and Cleanroom Operations",
    careerNumber: 16,
    domainNumber: 4,
    domainTitle: "4. Healthcare, biomedical and laboratory operations",
    academyId: "academy-3-scientific-medical-environmental",
    duration: "15:10",
    durationSeconds: 910,
    instructor: "FDA 21 CFR Part 211 & Bioprocess Training Center",
    sourceOrg: "FDA cGMP / ISPE Biomanufacturing Standard",
    instructorOrSource: "FDA cGMP & Bioprocess Training Center",
    thumbnailUrl: "/images/connectln-studies/mlops-data-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/bor0qLifjz4",
    officialResourceUrl: "https://www.fda.gov/drugs/pharmaceutical-quality-resources/current-good-manufacturing-practice-cgmp-regulations",
    summary:
      "Walks through ISO Class 5/7 aseptic gowning, ALCOA+ contemporaneous Batch Production Record (BPR) entries, bioreactor dissolved oxygen (DO) and pH PID loops, and Out-of-Specification (OOS) CAPA investigations.",
    keyTechnicalTakeaway:
      "ALCOA+ Data Integrity (Attributable, Legible, Contemporaneous, Original, Accurate): never backdate, pre-fill, or obliterate a cGMP batch record entry.",
    chapters: [
      { timestamp: "00:00", title: "ISO Class 5/7 Cleanroom Pressure Cascades & Aseptic Technique", takeaway: "Maintaining +15 Pa positive pressure differential and unidirectional laminar airflow." },
      { timestamp: "05:45", title: "Upstream Bioreactor Mass Balance & Dissolved Oxygen Control", takeaway: "Monitoring specific growth rate µ, pH, temperature, and sterile filtration integrity." },
      { timestamp: "10:50", title: "ALCOA+ Batch Documentation & CAPA Root-Cause Investigation", takeaway: "Single-line cross-out with initials/date/reason and formal OOS deviation quarantine." }
    ],
    keyChapters: [
      { time: "00:00", label: "ISO Class 5/7 Cleanroom Pressure Cascades & Aseptic Technique", technicalPoint: "Maintaining +15 Pa positive pressure differential and unidirectional laminar airflow." },
      { time: "05:45", label: "Upstream Bioreactor Mass Balance & Dissolved Oxygen Control", technicalPoint: "Monitoring specific growth rate µ, pH, temperature, and sterile filtration integrity." },
      { time: "10:50", label: "ALCOA+ Batch Documentation & CAPA Root-Cause Investigation", technicalPoint: "Single-line cross-out with initials/date/reason and formal OOS deviation quarantine." }
    ],
    interactiveSimType: "cleanroom-litho"
  },
  {
    id: "vid-building-envelope-timber-trades",
    title: "Building Envelope Hygrothermal Control Layers, Timber-Frame Load Takeoff & Flashing Walkthrough",
    pathwayTitle: "#59 Building Envelope & #21 Building Commissioning",
    careerTitle: "Building Envelope, Waterproofing and Structural Restoration",
    careerNumber: 59,
    domainNumber: 13,
    domainTitle: "13. Construction specialties and high-value technical trades",
    academyId: "academy-1-advanced-manufacturing",
    duration: "14:55",
    durationSeconds: 895,
    instructor: "NIBS Whole Building Design Guide & Master Trades Lab",
    sourceOrg: "WBDG / ASHRAE 90.1 / ASTM E1105",
    instructorOrSource: "NIBS WBDG & Master Construction Trades Lab",
    thumbnailUrl: "/images/connectln-studies/trades-superintendent-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/y5M3_N9-A8E",
    officialResourceUrl: "https://www.wbdg.org/guides-specifications/building-envelope-design-guide",
    summary:
      "Demonstrates the 4 continuous enclosure control layers (water, air, vapor, thermal), shingle-lapped window sill pan flashing with end dams, psychrometric dew-point condensation analysis, and structural quantity takeoffs.",
    keyTechnicalTakeaway:
      "Maintain uninterrupted Water-Air-Vapor-Thermal control layer continuity and shingle-lap every horizontal flashing joint with gravity.",
    chapters: [
      { timestamp: "00:00", title: "The 4 Enclosure Control Layers (Water, Air, Vapor, Thermal)", takeaway: "Tracing red-pen continuity across foundation-to-wall, window-to-wall, and roof-to-parapet joints." },
      { timestamp: "05:20", title: "Shingle-Lapped Membrane Flashing & Sill Pan End Dams", takeaway: "Why reverse laps funnel bulk rainwater into structural cavities." },
      { timestamp: "10:15", title: "Infrared Thermography, Dew-Point Profile & Quantity Takeoff", takeaway: "Computing R-value temperature gradients and gross material volume with waste factors." }
    ],
    keyChapters: [
      { time: "00:00", label: "The 4 Enclosure Control Layers (Water, Air, Vapor, Thermal)", technicalPoint: "Tracing red-pen continuity across foundation-to-wall, window-to-wall, and roof-to-parapet joints." },
      { time: "05:20", label: "Shingle-Lapped Membrane Flashing & Sill Pan End Dams", technicalPoint: "Why reverse laps funnel bulk rainwater into structural cavities." },
      { time: "10:15", label: "Infrared Thermography, Dew-Point Profile & Quantity Takeoff", technicalPoint: "Computing R-value temperature gradients and gross material volume with waste factors." }
    ],
    interactiveSimType: "power-fault"
  },
  {
    id: "vid-cnc-metrology-ndt-inspection",
    title: "5-Axis CNC G-Code Toolpath Verification, GD&T CMM Metrology & Ultrasonic NDT Flaw Sizing",
    pathwayTitle: "#43 CNC Machining & #4 Non-Destructive Testing (NDT)",
    careerTitle: "CNC Machining, Precision Manufacturing and Toolmaking",
    careerNumber: 43,
    domainNumber: 10,
    domainTitle: "10. Semiconductor manufacturing and advanced materials",
    academyId: "academy-1-advanced-manufacturing",
    duration: "17:40",
    durationSeconds: 1060,
    instructor: "ASME Y14.5 Precision Metrology & ASNT NDT Lab",
    sourceOrg: "ASME Y14.5 / ISO 2768 / ASNT SNT-TC-1A",
    instructorOrSource: "ASME Y14.5 Precision Metrology & ASNT Lab",
    thumbnailUrl: "/images/connectln-studies/robotics-plc-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/0MwMkBET_5I",
    officialResourceUrl: "https://www.nist.gov/pml/dimensional-metrology",
    summary:
      "Covers spindle RPM and chip-load feedrate calculations, ASME Y14.5 datum reference frames (A|B|C), true-position bonus tolerance on a Coordinate Measuring Machine (CMM), and Ultrasonic time-of-flight weld defect sizing.",
    keyTechnicalTakeaway:
      "True Position Ø = 2 × sqrt(ΔX² + ΔY²); always verify dry-run Z-clearance and tool-length offsets before executing high-speed G-code.",
    chapters: [
      { timestamp: "00:00", title: "Surface Speed (SFM), Spindle RPM & Chip Load Feedrate", takeaway: "Calculating N = (1000 × V_c)/(π × D) and feedrate F = N × f_z × Z." },
      { timestamp: "06:30", title: "ASME Y14.5 Datum Reference Frames & CMM First-Article Inspection", takeaway: "Evaluating True Position tolerance zones and Maximum Material Condition (MMC)." },
      { timestamp: "12:20", title: "Ultrasonic Pulse-Echo NDT Depth & Snell's Law Shear Waves", takeaway: "Locating internal weld lack-of-fusion flaws without damaging the part." }
    ],
    keyChapters: [
      { time: "00:00", label: "Surface Speed (SFM), Spindle RPM & Chip Load Feedrate", technicalPoint: "Calculating N = (1000 × V_c)/(π × D) and feedrate F = N × f_z × Z." },
      { time: "06:30", label: "ASME Y14.5 Datum Reference Frames & CMM First-Article Inspection", technicalPoint: "Evaluating True Position tolerance zones and Maximum Material Condition (MMC)." },
      { time: "12:20", label: "Ultrasonic Pulse-Echo NDT Depth & Snell's Law Shear Waves", technicalPoint: "Locating internal weld lack-of-fusion flaws without damaging the part." }
    ],
    interactiveSimType: "cleanroom-litho"
  },
  {
    id: "vid-ics-emergency-disaster-response",
    title: "NIMS Incident Command System (ICS) Operational Period Planning, HazMat Plume & Mass-Care Logistics",
    pathwayTitle: "#48 Emergency Management, Disaster Response & Continuity",
    careerTitle: "Emergency Management, Disaster Response and Business Continuity",
    careerNumber: 48,
    domainNumber: 11,
    domainTitle: "11. Emergency management, public safety and resilience",
    academyId: "academy-4-cyber-resilience-public-safety",
    duration: "13:55",
    durationSeconds: 835,
    instructor: "FEMA Emergency Management Institute (EMI) & ISO 22301 Lab",
    sourceOrg: "FEMA NIMS / ICS-300 / ISO 22301",
    instructorOrSource: "FEMA NIMS / ISO 22301 Resilience Lab",
    thumbnailUrl: "/images/connectln-studies/grc-governance-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/FZNCce1spHQ",
    officialResourceUrl: "https://training.fema.gov/nims/",
    summary:
      "Walks through the Planning 'P' cycle to assemble an Incident Action Plan (ICS Forms 202, 203, 204, 205, 206, 208), span-of-control ratios (1:3 to 1:7), Business Impact Analysis (RTO/RPO), and emergency commodities burn-rate logistics.",
    keyTechnicalTakeaway:
      "Maintain NIMS 1:5 supervisory span of control and verify Recovery Time Objective (RTO) and Recovery Point Objective (RPO) through live failover exercises.",
    chapters: [
      { timestamp: "00:00", title: "NIMS ICS Command & General Staff Structure", takeaway: "Incident Commander, Operations, Planning, Logistics, and Finance/Admin sections." },
      { timestamp: "05:10", title: "Building the Incident Action Plan (IAP) & Safety Message (ICS-208)", takeaway: "Mapping Division/Group tactical assignments (ICS-204) and radio channels (ICS-205)." },
      { timestamp: "09:45", title: "Business Continuity BIA: Calculating RTO, RPO & MTPD", takeaway: "Sizing backup generators, water/meals logistics, and alternate site cutover." }
    ],
    keyChapters: [
      { time: "00:00", label: "NIMS ICS Command & General Staff Structure", technicalPoint: "Incident Commander, Operations, Planning, Logistics, and Finance/Admin sections." },
      { time: "05:10", label: "Building the Incident Action Plan (IAP) & Safety Message (ICS-208)", technicalPoint: "Mapping Division/Group tactical assignments (ICS-204) and radio channels (ICS-205)." },
      { time: "09:45", label: "Business Continuity BIA: Calculating RTO, RPO & MTPD", technicalPoint: "Sizing backup generators, water/meals logistics, and alternate site cutover." }
    ],
    interactiveSimType: "avionics-bus"
  },
  {
    id: "vid-ai-rag-eval-cyber-governance",
    title: "Production AI Evaluation, RAG Groundedness Auditing, Prompt-Injection Defense & ISO 42001 Governance",
    pathwayTitle: "#11 AI Governance & #30 Human-Factors AI Evaluation",
    careerTitle: "AI Governance, Risk and Compliance",
    careerNumber: 11,
    domainNumber: 3,
    domainTitle: "3. Data, AI and enterprise systems",
    academyId: "academy-5-professional-services",
    duration: "16:50",
    durationSeconds: 1010,
    instructor: "NIST AI RMF 1.0 & OWASP GenAI Red-Team Lab",
    sourceOrg: "NIST AI RMF / ISO/IEC 42001 / OWASP LLM Top 10",
    instructorOrSource: "NIST AI RMF & OWASP GenAI Lab",
    thumbnailUrl: "/images/connectln-studies/agentic-mcp-cover.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    youtubeEmbedUrl: "https://www.youtube.com/embed/RVITn9lWfOY",
    officialResourceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
    summary:
      "Demonstrates quantitative RAG precision@k and citation-faithfulness scoring, indirect prompt-injection sandboxing on MCP tool calls, demographic parity ratio checks, and building an ISO/IEC 42001 AI System Impact Assessment.",
    keyTechnicalTakeaway:
      "Never allow untrusted retrieved context to execute high-impact MCP tool calls without deterministic schema validation and human-in-the-loop approval.",
    chapters: [
      { timestamp: "00:00", title: "NIST AI RMF 1.0 (Govern, Map, Measure, Manage)", takeaway: "Inventorying model lineage, training data provenance, and deployment risk tiers." },
      { timestamp: "05:55", title: "RAG Citation Faithfulness & Hallucination Rate Benchmarking", takeaway: "Measuring Groundedness = Supported Claims / Total Claims across golden eval sets." },
      { timestamp: "11:30", title: "Defending Against Indirect Prompt Injection & Tool Privilege Escalation", takeaway: "Isolating system instructions from untrusted documents and enforcing least-privilege scopes." }
    ],
    keyChapters: [
      { time: "00:00", label: "NIST AI RMF 1.0 (Govern, Map, Measure, Manage)", technicalPoint: "Inventorying model lineage, training data provenance, and deployment risk tiers." },
      { time: "05:55", label: "RAG Citation Faithfulness & Hallucination Rate Benchmarking", technicalPoint: "Measuring Groundedness = Supported Claims / Total Claims across golden eval sets." },
      { time: "11:30", label: "Defending Against Indirect Prompt Injection & Tool Privilege Escalation", technicalPoint: "Isolating system instructions from untrusted documents and enforcing least-privilege scopes." }
    ],
    interactiveSimType: "dfir-timeline"
  }
]


// ============================================================================
// CAREERS #34 TO #60 SPECIALIZED SPECIFICATIONS ACROSS 7 ADDITIONAL DOMAINS
// ============================================================================

export const SPECIALIST_CAREERS_34_TO_60_SPECS: SpecializedTangibleCareerSpec[] = [
  // --------------------------------------------------------------------------
  // DOMAIN 8: AVIATION, AEROSPACE AND MARITIME CAREERS (34-37)
  // --------------------------------------------------------------------------
  {
    careerNumber: 34,
    id: "spec-career-34-aircraft-maintenance-avionics",
    title: "Aircraft Maintenance and Avionics",
    domainNumber: 8,
    domainTitle: "8. Aviation, aerospace and maritime careers",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    tangibleEvidenceType: "Aircraft System Fault Isolation Report, Bus Load Worksheet & Airworthiness Maintenance Release Log",
    coreCurriculumBullets: [
      "Aircraft electrical systems and avionics fundamentals",
      "Instrumentation and navigation systems",
      "Maintenance documentation and traceability",
      "Fault isolation and troubleshooting",
      "Reliability and maintenance planning",
      "Airworthiness and regulatory requirements"
    ],
    capstoneProject: "Analyze a simulated aircraft system fault and produce a maintenance investigation report.",
    regulatoryBoundaryNote:
      "Airworthiness Regulatory Notice: Performing or returning aircraft to service requires statutory aviation authority certification (such as FAA Part 65 A&P Certificate / Repair Station authorization or EASA Part-66 license) and current manufacturer Approved Maintenance Manuals (AMM/FIM).",
    workedFormulaTitle: "28V DC / 115V 400Hz AC Bus Continuous Load Limit & Pitot-Static Dynamic Pressure",
    workedFormulaEquations: [
      "Generator Continuous Bus Load Rule:  I_continuous_total <= 0.80 × I_generator_rated",
      "Wire Voltage Drop Check:             ΔV = 2 × L × I × R_per_meter <= ΔV_max_allowed",
      "Pitot Impact Pressure (Subsonic):    q_c = P_total - P_static = 0.5 × ρ × V_TAS²"
    ],
    workedFormulaExplanation:
      "Aircraft maintenance and avionics technicians verify that continuous electrical bus loads do not exceed 80% of rated generator capacity, isolate avionics bus faults using the manufacturer's Fault Isolation Manual (FIM), and ensure every replacement part carries traceable airworthiness release documentation (e.g., FAA Form 8130-3).",
    workedProblemStatement:
      "A 28 V DC aircraft generator is rated at 300 A continuous capacity. The aircraft's normal continuous DC bus load is 222 A, and an avionics upgrade adds a 25 A continuous mission rack. Does the new total continuous load comply with the 80% continuous generator loading limit?",
    workedStepByStep: [
      "1. Compute 80% continuous capacity limit of the 300 A generator: 0.80 × 300 A = 240.0 A.",
      "2. Compute proposed total continuous load: 222 A + 25 A = 247.0 A.",
      "3. Compare 247.0 A against 240.0 A limit: Exceeds limit by 7.0 A (82.3% loading).",
      "4. Engineering action: Do not approve installation without load-shedding non-essential cabin loads or upgrading generator capacity under an approved STC/engineering order."
    ],
    workedConclusion:
      "The 247 A continuous load exceeds the 240 A (80%) rating by 7 A; an electrical load analysis (ELA) modification or load-shed interlock is required.",
    practicalLabScenario:
      "Investigate a simulated intermittent ARINC 429 Attitude/Heading Reference System (AHRS) bus fault and 28 V DC voltage drop on a training aircraft dataset using BITE fault codes, wiring diagrams, and the Fault Isolation Manual (FIM).",
    practicalLabTasks: [
      "Trace the 28 V DC circuit breaker, relay, and shield ground path on the Aircraft Wiring Diagram Manual (WDM).",
      "Isolate a high-resistance corroded connector pin causing a 3.8 V drop during avionics transmit load.",
      "Verify traceable part numbers, serial numbers, and Authorized Release Certificates (Form 8130-3 / EASA Form 1).",
      "Complete the Discrepancy, Corrective Action, and Return-to-Service inspection log entry."
    ],
    answerKeyQuestion: {
      prompt: "In aviation maintenance, what must a technician do if a replacement avionics Line Replaceable Unit (LRU) in the parts bin has a matching part number but lacks a traceable Authorized Release Certificate (such as FAA Form 8130-3) or verifiable service history?",
      options: [
        "Quarantine the undocumented part as unserviceable/suspected unapproved and never install it on an aircraft until full airworthiness traceability is verified.",
        "Install the part anyway as long as the connector plugs fit.",
        "Write a homemade serial number on the box with a marker.",
        "Bypass the pre-installation inspection check."
      ],
      correctIndex: 0,
      explanation: "Strict part traceability and approved airworthiness documentation are mandatory for every component installed on an aircraft."
    },
    careerGuidance: {
      prerequisites: "DC/AC electricity, digital electronics, mechanical tool precision, and technical manual literacy.",
      targetRoles: "Aircraft Maintenance Technician (AMT) Trainee, Avionics Bench/Line Technician, Maintenance Reliability Analyst, Quality Control Inspector.",
      qualificationsAndNextSteps: "FAA Part 147 school / Airframe & Powerplant (A&P) Certificate, FCC GROL, NCATT AET (Aircraft Electronics Technician)."
    },
    mentorReviewCriteria: [
      "Every troubleshooting step cites the specific Fault Isolation Manual (FIM) task and Wiring Diagram reference.",
      "Tool calibration IDs (torque wrench, crimp tool, multimeter) and part traceability tags are recorded.",
      "Independent RII (Required Inspection Item) sign-off boundaries are respected."
    ],
    principalReferences: [
      {
        title: "FAA Aviation Maintenance Technician Handbook — General & Airframe (FAA-H-8083-30B / 31B)",
        organization: "Federal Aviation Administration (FAA)",
        url: "https://www.faa.gov/regulations_policies/handbooks_manuals/aviation",
        summary: "Official FAA reference manuals covering aircraft electrical systems, avionics, instrumentation, maintenance records, and airworthiness."
      }
    ]
  },
  {
    careerNumber: 35,
    id: "spec-career-35-aerospace-systems-satellite-engineering",
    title: "Aerospace Systems and Satellite Engineering",
    domainNumber: 8,
    domainTitle: "8. Aviation, aerospace and maritime careers",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    tangibleEvidenceType: "SmallSat Mission Architecture Document, Orbital & RF Link Budget, Power/Thermal Balance & Verification Matrix",
    coreCurriculumBullets: [
      "Orbital mechanics fundamentals",
      "Satellite power and communications",
      "Thermal and structural design",
      "Telemetry, tracking, and command",
      "Systems integration and verification",
      "Mission reliability and failure analysis"
    ],
    capstoneProject: "Design a conceptual small-satellite mission and document its subsystem requirements.",
    workedFormulaTitle: "Circular Orbital Velocity/Period, Solar Eclipse Power Balance & RF Link Margin",
    workedFormulaEquations: [
      "Circular Orbital Velocity & Period:  v = √(μ_E / r)   ;   T = 2π √(r³ / μ_E)",
      "Orbit Energy Balance:                P_solar_day × t_sun × η_path >= (P_day × t_sun) + (P_eclipse × t_eclipse / η_batt)",
      "RF Link Budget (dB):                 P_rx = P_tx + G_tx - L_FSPL - L_atm + G_rx"
    ],
    workedFormulaExplanation:
      "Spacecraft systems engineers close four interdependent budgets across the mission lifecycle: Mass Budget (with 15–20% margin), Orbit-Average Power & Battery Depth-of-Discharge (DoD) Budget across sunlit and eclipse phases, RF Telemetry/Command Link Budget, and Radiative Thermal Equilibrium.",
    workedProblemStatement:
      "A 6U CubeSat in a 95-minute Low Earth Orbit (t_sun = 60 min, t_eclipse = 35 min) consumes P_day = 18 W during sunlight and P_eclipse = 12 W during eclipse. If battery round-trip charging/discharging efficiency is η_batt = 85%, what minimum solar array power generation P_solar is required during the 60-minute sunlit period to maintain a positive energy balance?",
    workedStepByStep: [
      "1. Compute sunlit energy consumed directly by spacecraft buses/payloads: E_day = 18 W × (60/60 hr) = 18.00 Wh.",
      "2. Compute eclipse energy required from battery: E_eclipse = 12 W × (35/60 hr) = 7.00 Wh.",
      "3. Account for 85% battery recharge efficiency: E_recharge = 7.00 Wh / 0.85 = 8.24 Wh.",
      "4. Total energy solar arrays must generate during 1.0 hour of sunlight: 18.00 + 8.24 = 26.24 Wh ⇒ P_solar >= 26.24 W (plus 20% End-of-Life degradation margin = 31.5 W)."
    ],
    workedConclusion:
      "The solar array must generate at least 26.24 W EOL (31.5 W with 20% margin) during the 60-minute sunlit window to sustain continuous orbit operations.",
    practicalLabScenario:
      "Design a 6U Earth-Observation CubeSat in a 550 km Sun-Synchronous Orbit (SSO), close the Mass, Power, RF Downlink, and Thermal budgets, and compile a NASA-style Systems Verification & FMEA Matrix.",
    practicalLabTasks: [
      "Calculate orbital altitude, velocity, period, eclipse duration, and ground-station contact windows.",
      "Close the Electrical Power System (EPS) solar generation and lithium-ion battery Depth-of-Discharge (<20% DoD) worksheet.",
      "Calculate UHF TT&C and S/X-band payload downlink Eb/N0 link margins with >= 3.0 dB positive margin.",
      "Create the Requirements Verification Matrix (Test, Analysis, Inspection, Demonstration) and single-point failure FMEA."
    ],
    answerKeyQuestion: {
      prompt: "In spacecraft thermal engineering, why can conventional forced-convection cooling fans NOT be used to reject waste heat from a satellite into the vacuum of space?",
      options: [
        "Space is a hard vacuum with virtually zero air molecules for convective heat transfer; heat must be moved internally by conduction/heat pipes and rejected to space exclusively by thermal radiation (Q = εσAT⁴).",
        "Because fans spin backwards in microgravity.",
        "Because solar panels absorb all sound waves.",
        "Spacecraft never generate heat from electronics."
      ],
      correctIndex: 0,
      explanation: "In orbital vacuum, external heat exchange occurs via radiation (`Q = εσA(T_surface⁴ - T_space⁴)`), while internal heat is transported by conduction and loop heat pipes."
    },
    careerGuidance: {
      prerequisites: "Classical mechanics, thermodynamics, RF/electrical fundamentals, and systems engineering.",
      targetRoles: "Spacecraft Systems Engineer, SmallSat Integration & Test (I&T) Engineer, Mission Operations & TT&C Analyst, Aerospace Reliability Engineer.",
      qualificationsAndNextSteps: "INCOSE ASEP/CSEP (Systems Engineering Professional), NASA Systems Engineering Handbook & CubeSat 101 workflows."
    },
    mentorReviewCriteria: [
      "Mass, power, data volume, and link budgets include explicit Beginning-of-Life (BOL) and End-of-Life (EOL) margins.",
      "Safe-mode autonomous recovery logic handles low-battery under-voltage and attitude tumbling.",
      "Verification matrix maps every requirement to a concrete verification method."
    ],
    principalReferences: [
      {
        title: "NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev2) & CubeSat 101",
        organization: "National Aeronautics and Space Administration (NASA)",
        url: "https://www.nasa.gov/reference/systems-engineering-handbook/",
        summary: "Authoritative lifecycle systems engineering methodology for spacecraft design, subsystem budgets, integration, verification, and risk management."
      }
    ]
  },
  {
    careerNumber: 36,
    id: "spec-career-36-marine-engineering-vessel-systems",
    title: "Marine Engineering and Vessel Systems",
    domainNumber: 8,
    domainTitle: "8. Aviation, aerospace and maritime careers",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    tangibleEvidenceType: "Vessel Engine-Room Planned Maintenance System (PMS) Schedule, Bilge/MARPOL Compliance Log & Auxiliary Watch Handover",
    coreCurriculumBullets: [
      "Marine propulsion and auxiliary systems",
      "Shipboard electrical systems",
      "Pumps, piping, and fluid systems",
      "Machinery condition monitoring",
      "Planned maintenance systems",
      "Marine safety and environmental protection"
    ],
    capstoneProject: "Develop a preventive maintenance plan for a simulated vessel engine room.",
    workedFormulaTitle: "Specific Fuel Oil Consumption (SFOC), Shaft Power & MARPOL 15 ppm Bilge Separator Limit",
    workedFormulaEquations: [
      "Daily Fuel Consumption (MT/day):  M_fuel = (P_BHP_kW × SFOC_g_kWh × 24) / 10^6",
      "Propeller Law Cubic Relation:     P_2 / P_1 ≈ (V_2 / V_1)³",
      "MARPOL Annex I Oily Water Limit:  Effluent_Oil_Content <= 15 ppm (with automatic stopping device)"
    ],
    workedFormulaExplanation:
      "Marine engineers manage main propulsion diesels/turbines, shipboard 440 V insulated-neutral auxiliary generators, jacket-water/seawater heat exchangers, purifiers, and Oily Water Separators (OWS) under IMO STCW, SOLAS, and MARPOL Annex I/VI regulations.",
    workedProblemStatement:
      "A merchant vessel's main propulsion engine operates at a continuous brake power of P = 8,500 kW with a Specific Fuel Oil Consumption (SFOC) of 172 g/kWh. Calculate the daily fuel consumption in metric tons (MT/day) and the required voyage fuel reserve for a 10-day transit including a 15% weather/safety margin.",
    workedStepByStep: [
      "1. Compute hourly fuel burn: 8,500 kW × 172 g/kWh = 1,462,000 g/hr = 1.462 MT/hr.",
      "2. Multiply by 24 hours for daily fuel consumption: 1.462 MT/hr × 24 hr = 35.088 MT/day.",
      "3. Compute 10-day base voyage burn: 35.088 × 10 = 350.88 MT.",
      "4. Add 15% safety/weather reserve: 350.88 × 1.15 = 403.51 MT total bunker requirement."
    ],
    workedConclusion:
      "The main engine burns 35.09 MT/day, requiring 403.51 MT of bunkers for the 10-day voyage including the 15% safety margin.",
    practicalLabScenario:
      "Analyze a 30-day vessel engine-room log (main engine exhaust cylinder temperatures, lube-oil pressure, seawater cooling ΔT, auxiliary generator running hours, and Oily Water Separator 15 ppm Oil Content Monitor logs) and build an ISM-compliant Planned Maintenance System (PMS) schedule.",
    practicalLabTasks: [
      "Diagnose a rising exhaust gas temperature and falling compression pressure on Main Engine Cylinder #4.",
      "Detect fouled seawater central cooler tubes from rising freshwater inlet temperatures and increased differential pressure.",
      "Build a running-hour Planned Maintenance System (PMS) schedule for main engines, auxiliary diesel generators, emergency fire pump, and steering gear.",
      "Audit Oil Record Book (Part I) entries and verify 15 ppm OWS automatic three-way recirculation valve compliance."
    ],
    answerKeyQuestion: {
      prompt: "Under MARPOL Annex I marine environmental regulations, what must occur immediately if a ship's Oily Water Separator (OWS) 15 ppm Oil Content Monitor detects an oil concentration exceeding 15 ppm during bilge discharge?",
      options: [
        "An audible/visual alarm must sound and the automatic 3-way stopping device must immediately halt overboard discharge and recirculate the fluid back to the bilge/sludge tank, with all operations recorded in the Oil Record Book.",
        "The crew should dilute the sensor sample line with fresh drinking water to trick the alarm.",
        "Overboard discharge is allowed up to 5,000 ppm as long as it is nighttime.",
        "The Oil Record Book is optional for commercial vessels."
      ],
      correctIndex: 0,
      explanation: "MARPOL Annex I strictly mandates <= 15 ppm oil content, automatic overboard shutoff/recirculation, and accurate Oil Record Book logging."
    },
    careerGuidance: {
      prerequisites: "Thermodynamics, diesel/mechanical systems, fluid piping, 3-phase marine electrical systems, and marine safety.",
      targetRoles: "Marine Engineering Cadet / Junior Engineer, Port Technical Superintendent Assistant, Vessel Reliability & PMS Coordinator, Shipyard Systems Technician.",
      qualificationsAndNextSteps: "USCG Merchant Mariner Credential (MMC) / STCW III/1 Officer in Charge of an Engineering Watch (requires accredited maritime academy or approved sea service + exams)."
    },
    mentorReviewCriteria: [
      "PMS schedule prioritizes SOLAS critical safety equipment (emergency generator, steering gear, emergency fire pump, bilge alarms).",
      "Cylinder exhaust gas temperature deviation analysis accurately identifies fuel injector or exhaust valve wear.",
      "MARPOL Oil Record Book traceability is 100% compliant."
    ],
    principalReferences: [
      {
        title: "USCG Marine Engineering Regulations (46 CFR Subchapter F) & IMO MARPOL / SOLAS Overview",
        organization: "U.S. Coast Guard / International Maritime Organization (IMO)",
        url: "https://www.dco.uscg.mil/",
        summary: "Statutory safety and engineering regulations for shipboard machinery, piping, electrical systems, and pollution prevention."
      }
    ]
  },
  {
    careerNumber: 37,
    id: "spec-career-37-port-operations-maritime-logistics",
    title: "Port Operations and Maritime Logistics",
    domainNumber: 8,
    domainTitle: "8. Aviation, aerospace and maritime careers",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/business-capstone-cover.jpg",
    tangibleEvidenceType: "Vessel Berth & Crane Turnaround Schedule, IMDG Dangerous Goods Segregation Plan & Customs/Bill-of-Lading Audit",
    coreCurriculumBullets: [
      "Container terminal operations",
      "Vessel turnaround planning",
      "Cargo documentation",
      "Port safety and security",
      "Customs and trade documentation",
      "Logistics performance analysis"
    ],
    capstoneProject: "Plan a simulated vessel turnaround while balancing labor, equipment, and cargo deadlines.",
    workedFormulaTitle: "Quay Crane Gross/Net Productivity, Berth Occupancy & Vessel Turnaround Time",
    workedFormulaEquations: [
      "Total Crane Hours Required:  H_crane = Total_Container_Moves / Gross_Crane_Productivity (MPH)",
      "Parallel Working Time:       t_cargo_ops = Max_Bay_Moves_on_Critical_Crane / MPH_crane",
      "Vessel Turnaround Time:      T_turn = t_berthing + t_cargo_ops + t_unberthing"
    ],
    workedFormulaExplanation:
      "Terminal planners allocate Ship-to-Shore (STS) quay cranes across vessel bays (respecting crane boom clearance and critical-bay split), verify Verified Gross Mass (SOLAS VGM) and IMDG dangerous-goods segregation, and synchronize yard tractor/RTG gangs to minimize vessel port stay.",
    workedProblemStatement:
      "A container vessel arrives requiring 1,800 discharge moves and 1,500 load moves (3,300 total moves). The terminal assigns 3 Ship-to-Shore (STS) cranes with an average productivity of 27.5 moves per crane-hour (MPH), and the heaviest critical bay assigned to Crane #2 requires 1,210 moves. Berthing/lashings take 1.5 hours before and 1.0 hour after cargo operations. Calculate the total vessel turnaround time.",
    workedStepByStep: [
      "1. Check average crane workload: 3,300 moves / 3 cranes = 1,100 moves/crane, BUT Crane #2 is constrained by the critical bay cluster of 1,210 moves.",
      "2. Compute critical-path cargo operation duration on Crane #2: 1,210 moves / 27.5 MPH = 44.0 hours.",
      "3. Add berthing/lashing (1.5 hr) and unberthing/clearance (1.0 hr): T_turn = 1.5 + 44.0 + 1.0 = 46.5 hours.",
      "4. Optimization: Rebalance 110 hatch moves from Crane #2 to adjacent Crane #1/#3 so all three cranes complete 1,100 moves in 1,100 / 27.5 = 40.0 hours, cutting vessel turnaround to 42.5 hours (-4.0 hours saved)."
    ],
    workedConclusion:
      "Rebalancing crane bay splits eliminates the 1,210-move bottleneck and reduces total vessel turnaround time from 46.5 hours to 42.5 hours.",
    practicalLabScenario:
      "Plan a 48-hour container vessel call (3,300 moves including 24 Reefers, 8 Out-of-Gauge flats, and 12 IMDG Class 3 & Class 5.1 hazardous containers), reconcile the Bill of Lading / Customs Manifest / SOLAS VGM records, and build the Crane & Yard Operating Plan.",
    practicalLabTasks: [
      "Build the Quay Crane Working Program (bay-by-bay sequence) balancing crane intensity without boom collisions.",
      "Audit the cargo manifest for SOLAS Verified Gross Mass (VGM) compliance and IMDG Code segregation between Class 3 (Flammable Liquids) and Class 5.1 (Oxidizers).",
      "Size the yard tractor and Rubber-Tired Gantry (RTG) support equipment per quay crane to prevent apron starvation.",
      "Compile the Port Safety (ISPS Code) & Vessel Turnaround Performance Report."
    ],
    answerKeyQuestion: {
      prompt: "Under SOLAS Chapter VI Regulation 2 (Verified Gross Mass — VGM), what is the mandatory rule if a packed export shipping container arrives at the marine terminal gate without a signed VGM weight certificate?",
      options: [
        "'No VGM, No Load' — the container must NOT be loaded onto a SOLAS vessel until its Verified Gross Mass is obtained via certified weighing and communicated to the carrier/terminal stowage planner.",
        "Load the container onto the top tier of the ship and guess its weight later.",
        "VGM only applies to empty cardboard boxes.",
        "Unweighed containers are always placed next to dangerous goods."
      ],
      correctIndex: 0,
      explanation: "Misdeclared container weights cause stack collapses, crane overloads, and vessel stability hazards; SOLAS strictly enforces 'No VGM, No Load'."
    },
    careerGuidance: {
      prerequisites: "Supply chain logistics, spreadsheet modeling, international trade (Incoterms, Bills of Lading), and maritime safety rules.",
      targetRoles: "Vessel Planner / Stowage Coordinator, Port Operations Supervisor, Maritime Logistics & Freight Documentation Specialist, Terminal Yard Planner.",
      qualificationsAndNextSteps: "IMDG Code Dangerous Goods training, ISPS Port Facility Security awareness, Institute of Chartered Shipbrokers (ICS) / CILT."
    },
    mentorReviewCriteria: [
      "Crane split plan accounts for physical crane-to-crane clearance (minimum 2 forty-foot bays apart) and critical-bay pacing.",
      "IMDG hazardous cargo stowage and segregation rules are verified.",
      "Cargo documentation audit checks Bill of Lading, Commercial Invoice, Packing List, Customs filing, and VGM consistency."
    ],
    principalReferences: [
      {
        title: "UNCTAD Port Management Series & IMO SOLAS / IMDG / FAL Convention Guidelines",
        organization: "IMO / UNCTAD / U.S. Customs and Border Protection",
        url: "https://www.imo.org/en/OurWork/Safety/Pages/Cargoes.aspx",
        summary: "International standards for safe container stowage, Verified Gross Mass (VGM), dangerous goods handling, and maritime trade facilitation."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 9: TELECOMMUNICATIONS AND NETWORK INFRASTRUCTURE (38-41)
  // --------------------------------------------------------------------------
  {
    careerNumber: 38,
    id: "spec-career-38-fiber-optics-telecommunications",
    title: "Fiber Optics and Telecommunications Infrastructure",
    domainNumber: 9,
    domainTitle: "9. Telecommunications and network infrastructure",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    tangibleEvidenceType: "Optical Link Loss Budget Worksheet, OTDR Trace Fault-Localization Analysis & TIA-568 Acceptance Test Report",
    coreCurriculumBullets: [
      "Fiber-optic transmission fundamentals",
      "Cable installation and routing",
      "Splicing and termination",
      "Optical loss measurements",
      "OTDR testing and fault localization",
      "Network documentation and acceptance testing"
    ],
    capstoneProject: "Troubleshoot a simulated fiber link and prepare an acceptance test report.",
    workedFormulaTitle: "Total Optical Link Loss Budget & Optical Power Margin (dB / dBm)",
    workedFormulaEquations: [
      "Total Link Attenuation (dB):  L_total = (α_dB_km × Length_km) + (N_conn × L_conn) + (N_splice × L_splice)",
      "Received Optical Power (dBm): P_rx (dBm) = P_tx (dBm) - L_total (dB)",
      "Optical Power Margin (dB):    Margin = P_rx (dBm) - Receiver_Sensitivity_min (dBm)"
    ],
    workedFormulaExplanation:
      "Fiber-optic technicians calculate maximum allowable end-to-end link attenuation at 1310 nm and 1550 nm (for OS2 single-mode fiber), measure actual insertion loss with a calibrated Optical Loss Test Set (OLTS), and use an Optical Time-Domain Reflectometer (OTDR) with launch and receive cables to pinpoint dirty connectors, bad splices, macrobends, or breaks.",
    workedProblemStatement:
      "A 12.0 km single-mode OS2 fiber link operating at 1310 nm (attenuation coefficient α = 0.35 dB/km) contains 4 mated LC/UPC connector pairs (0.50 dB max each) and 6 fusion splices (0.10 dB max each). If the SFP+ optical transceiver transmits at P_tx = -2.0 dBm and has a minimum receiver sensitivity of -14.0 dBm, calculate L_total, expected P_rx, and available system margin.",
    workedStepByStep: [
      "1. Fiber cable attenuation: 12.0 km × 0.35 dB/km = 4.20 dB.",
      "2. Connector loss (4 mated pairs): 4 × 0.50 dB = 2.00 dB.",
      "3. Fusion splice loss (6 splices): 6 × 0.10 dB = 0.60 dB.",
      "4. Total Link Loss Budget: L_total = 4.20 + 2.00 + 0.60 = 6.80 dB.",
      "5. Expected Received Power: P_rx = -2.0 dBm - 6.80 dB = -8.80 dBm; Available Link Margin = -8.80 dBm - (-14.0 dBm) = +5.20 dB (passes >= 3.0 dB engineering safety margin)."
    ],
    workedConclusion:
      "Total link budget loss is 6.80 dB, yielding -8.80 dBm received power and a healthy +5.20 dB operating margin above receiver sensitivity.",
    practicalLabScenario:
      "Analyze bi-directional 1310 nm / 1550 nm OTDR traces and OLTS readings for a 12-strand single-mode campus backbone where Fibers 3 and 7 fail acceptance testing, pinpoint the exact meter distance and root cause of each fault, and author a TIA-568.3 Acceptance Test Report.",
    practicalLabTasks: [
      "Compute the theoretical TIA-568.3 optical loss budget for all 12 strands at 1310 nm and 1550 nm.",
      "Distinguish a wavelength-dependent macrobend at 4,120 m (low loss at 1310 nm, severe 2.4 dB drop at 1550 nm) from a contaminated/air-gapped connector at Patch Panel B (high reflectance spike + 1.8 dB loss at both wavelengths).",
      "Explain why bi-directional OTDR averaging is required to eliminate apparent 'gainers' caused by mode-field diameter mismatch across splices.",
      "Compile the Splice Tray As-Built Map and Customer Acceptance Test Certificate."
    ],
    answerKeyQuestion: {
      prompt: "On a dual-wavelength single-mode OTDR trace, what physical fault is indicated when a non-reflective point event at 1,850 meters shows only 0.15 dB loss at 1310 nm but a steep 2.10 dB loss at 1550 nm?",
      options: [
        "A macrobend (tight bend radius violation or pinched cable in a splice tray/conduit), because longer wavelengths (1550 nm) are much more sensitive to bend-induced radiation loss than 1310 nm.",
        "A completely severed fiber cable.",
        "That the speed of light in glass is zero at 1550 nm.",
        "That the optical laser is turned off."
      ],
      correctIndex: 0,
      explanation: "Higher loss at 1550 nm compared to 1310 nm at the same non-reflective point location is the classic signature of a macrobend."
    },
    careerGuidance: {
      prerequisites: "Basic optics, cable handling safety (minimum bend radius, pulling tension, glass shard disposal, laser eye safety), and decibel math.",
      targetRoles: "Fiber Optic Technician, OSP (Outside Plant) Splicing Specialist, Telecom Test & Turn-Up Engineer, Network Infrastructure Installer.",
      qualificationsAndNextSteps: "FOA CFOT (Certified Fiber Optic Technician) & CFOS/T (Testing) / CFOS/S (Splicing), BICSI Installer/Technician, Corning/CommScope certifications."
    },
    mentorReviewCriteria: [
      "Decibel (dB relative loss vs. dBm absolute power referenced to 1 mW) units are used accurately.",
      "OTDR test setup includes both Launch and Receive reference fibers so first and last connectors are measured.",
      "Laser safety and fiber shard disposal procedures are explicitly documented."
    ],
    principalReferences: [
      {
        title: "The Fiber Optic Association (FOA) Reference Guide & TIA-568.3 Optical Fiber Cabling Standard",
        organization: "FOA / Telecommunications Industry Association (TIA)",
        url: "https://www.thefoa.org/tech/ref/index.html",
        summary: "Industry technical reference for optical fiber installation, splicing, OLTS loss budgets, and OTDR trace interpretation."
      }
    ]
  },
  {
    careerNumber: 39,
    id: "spec-career-39-wireless-networks-rf-engineering",
    title: "Wireless Networks and RF Engineering",
    domainNumber: 9,
    domainTitle: "9. Telecommunications and network infrastructure",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/cyber-specialist-cover.jpg",
    tangibleEvidenceType: "RF Link Budget & Free-Space Path Loss Sheet, Non-Overlapping Channel Plan, Heat-Map Coverage Design & SINR Optimization Report",
    coreCurriculumBullets: [
      "Radio frequency fundamentals",
      "Antenna gain and propagation",
      "Link budgets and interference",
      "Cellular and Wi-Fi architecture",
      "Spectrum planning",
      "Wireless network optimization"
    ],
    capstoneProject: "Design a simulated wireless coverage plan and justify antenna placement.",
    workedFormulaTitle: "Free-Space Path Loss (FSPL), Effective Isotropic Radiated Power (EIRP) & Thermal Noise Floor",
    workedFormulaEquations: [
      "EIRP (dBm):                  EIRP = P_tx (dBm) - L_cable (dB) + G_ant,tx (dBi)",
      "Free-Space Path Loss (dB):   FSPL = 20 log_10(d_km) + 20 log_10(f_MHz) + 32.44",
      "Received Signal & SNR (dB):  RSSI = EIRP - Path_Loss + G_ant,rx  ;  SNR = RSSI - Noise_Floor"
    ],
    workedFormulaExplanation:
      "RF engineers design wireless links and high-density Wi-Fi/Private-5G networks by balancing transmit power, directional/omnidirectional antenna patterns, wall/obstacle attenuation, co-channel interference (CCI), and Signal-to-Interference-plus-Noise Ratio (SINR).",
    workedProblemStatement:
      "A 5 GHz (f = 5,200 MHz) point-to-point outdoor wireless bridge spans d = 2.0 km with clear Fresnel-zone line of sight. The transmitter outputs P_tx = +16 dBm with 2 dB coax loss and a +19 dBi directional dish antenna at both ends. Calculate EIRP, Free-Space Path Loss (FSPL), and expected Received Signal Strength (RSSI).",
    workedStepByStep: [
      "1. Compute transmitter EIRP: +16 dBm - 2 dB + 19 dBi = +33.0 dBm.",
      "2. Compute Free-Space Path Loss at d = 2.0 km, f = 5,200 MHz: FSPL = 20 log_10(2.0) + 20 log_10(5200) + 32.44 = 6.02 + 74.32 + 32.44 = 112.78 dB.",
      "3. Add receiver antenna gain (+19 dBi) and subtract receiver jumper loss (2 dB): RSSI = +33.0 dBm - 112.78 dB + 19.0 dBi - 2.0 dB = -62.78 dBm.",
      "4. Against a -90 dBm noise floor, SNR = -62.78 - (-90) = +27.22 dB (supports high-order 256-QAM modulation with fade margin)."
    ],
    workedConclusion:
      "The 2 km 5.2 GHz link experiences 112.8 dB FSPL and delivers -62.8 dBm RSSI (+27.2 dB SNR).",
    practicalLabScenario:
      "Design a high-density enterprise Wi-Fi 6E / Private LTE indoor wireless network for a 3-floor manufacturing and office building (concrete elevator core, high-bay metal racking, and 400 concurrent mobile clients), and optimize AP placement, antenna selection, transmit power, and channel reuse.",
    practicalLabTasks: [
      "Account for wall/racking attenuation (dB loss through drywall, glass, cinderblock, and steel racking) and calculate target -65 dBm primary / -70 dBm secondary roaming cells.",
      "Assign non-overlapping 20/40 MHz channels across 2.4 GHz (Channels 1, 6, 11), 5 GHz UNII bands, and 6 GHz to minimize Co-Channel Interference (CCI).",
      "Select patch/directional high-bay antennas vs. ceiling omnidirectional antennas and tune 2.4 GHz transmit power 6 dB lower than 5 GHz to balance cell sizes.",
      "Produce the RF Predictive Coverage & Capacity Justification Report."
    ],
    answerKeyQuestion: {
      prompt: "In a high-density multi-AP indoor wireless deployment, what problem is created if every Access Point is set to its maximum transmit power (e.g., 100 mW / 20 dBm) on the same or overlapping channels?",
      options: [
        "Severe Co-Channel Interference (CCI) and 'sticky client' syndrome: APs hear each other across the building, forcing airtime contention, while low-power mobile client devices hear a booming AP signal they cannot talk back to (asymmetric link).",
        "Maximum AP transmit power increases battery power inside client smartphones.",
        "Overlapping channels double the speed of light.",
        "2.4 GHz signals have more non-overlapping channels than 5 GHz and 6 GHz."
      ],
      correctIndex: 0,
      explanation: "Balanced transmit power (matched to mobile client capabilities ~12–15 dBm), proper cell sizing, and clean channel reuse maximize SINR and airtime capacity."
    },
    careerGuidance: {
      prerequisites: "Electromagnetic wave basics, decibel math (dBm, dBi, dB), TCP/IP networking, and spectrum regulations.",
      targetRoles: "Wireless Network Engineer, RF Design & Optimization Engineer, Wi-Fi / Private 5G Solutions Architect, Spectrum & Field RF Technician.",
      qualificationsAndNextSteps: "CWNP CWNA / CWDP / CWAP (Certified Wireless Network Administrator/Design/Analysis Professional), Ekahau ECSE, 3GPP 5G NR fundamentals."
    },
    mentorReviewCriteria: [
      "Link budget calculations properly account for first Fresnel zone 60% clearance and obstacle attenuation.",
      "Channel plan avoids adjacent-channel interference (e.g., never using channels 2, 3, 4, 5 in 2.4 GHz).",
      "Capacity calculation verifies airtime utilization per radio under peak concurrent client load."
    ],
    principalReferences: [
      {
        title: "NIST Wireless Systems Metrology & ITU-R Propagation Recommendations",
        organization: "NIST Communications Technology Laboratory / ITU-R",
        url: "https://www.nist.gov/ctl",
        summary: "Reference methodologies for RF propagation modeling, spectrum coexistence, antenna measurements, and wireless network evaluation."
      }
    ]
  },
  {
    careerNumber: 40,
    id: "spec-career-40-data-center-infrastructure-engineering",
    title: "Data Center Infrastructure Engineering",
    domainNumber: 9,
    domainTitle: "9. Telecommunications and network infrastructure",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    tangibleEvidenceType: "Data Center Rack Layout, 2N UPS Power Single-Line, Thermal Cooling Load Calculation & PUE/Availability Assessment",
    coreCurriculumBullets: [
      "Server, storage, and network architecture",
      "Power distribution and UPS systems",
      "Cooling and airflow management",
      "Redundancy and availability",
      "Environmental monitoring",
      "Disaster recovery and capacity planning"
    ],
    capstoneProject: "Design a small data center layout and assess its power, cooling, and resilience requirements.",
    workedFormulaTitle: "Power Usage Effectiveness (PUE), Sensible Air Cooling Flow & 2N UPS Capacity",
    workedFormulaEquations: [
      "Power Usage Effectiveness:  PUE = P_Total_Facility_kW / P_IT_Equipment_kW   (Ideal = 1.0)",
      "IT Heat Rejection Load:     Q_cooling_kW ≈ P_IT_kW   (1 Ton of Refrigeration ≈ 3.517 kW)",
      "Airflow Required (m³/s):    V_dot = Q_kW / (ρ_air × c_p × ΔT_air)"
    ],
    workedFormulaExplanation:
      "Data center engineers size redundant power distribution (`N+1` or `2N` A/B feeds so neither feed exceeds 40% NEC continuous load during normal operation, staying <= 80% on failover), manage hot-aisle/cold-aisle containment or liquid cooling, and track Power Usage Effectiveness (PUE).",
    workedProblemStatement:
      "A 20-rack edge data center runs an IT load of P_IT = 200 kW. The cooling chillers/CRAHs consume 52 kW, UPS/PDU transformer losses are 14 kW, and lighting/security draws 4 kW. Calculate total facility power, PUE, cooling load in Tons of Refrigeration (TR), and the maximum allowable normal load on each UPS in a 2N (A+B) dual-corded architecture where each UPS breaker is rated for 80% max continuous duty.",
    workedStepByStep: [
      "1. Total Facility Power: P_total = 200 kW (IT) + 52 kW (Cooling) + 14 kW (UPS/PDU loss) + 4 kW (Aux) = 270 kW.",
      "2. Compute PUE: 270 kW / 200 kW = 1.35.",
      "3. Convert 214 kW internal heat load (IT + UPS/PDU losses in room) to Tons of Refrigeration: 214 kW / 3.517 kW/TR = 60.85 TR.",
      "4. In a 2N (A/B) dual-fed system where one UPS must carry 100% of the 200 kW IT load at <= 80% capacity during an A-side failure: each UPS must be rated >= 200 / 0.80 = 250 kW, running at <= 40% (100 kW each) during normal operation."
    ],
    workedConclusion:
      "The facility operates at PUE = 1.35 with 60.9 TR cooling demand, requiring twin 250 kW UPS units loaded at 100 kW (40%) each in normal 2N operation.",
    practicalLabScenario:
      "Design a 20-rack high-density AI/enterprise data center room (10 kW to 25 kW per rack), produce the Cold-Aisle/Hot-Aisle floor layout, size the 2N UPS/generator/PDU power train and N+1 CRAH cooling system, and verify ASHRAE TC 9.9 environmental envelopes.",
    practicalLabTasks: [
      "Lay out 20 racks with hot-aisle containment, blanking panels, and structured overhead fiber/power pathways.",
      "Create the A/B 2N electrical single-line diagram (Utility → ATS → Generator → UPS → PDU → Rack A/B PDU) and verify breaker sizing.",
      "Calculate airflow (CFM / m³/s) and cooling capacity (kW / TR) with N+1 CRAH redundancy.",
      "Specify DCIM environmental sensor placement (rack inlet top/middle/bottom temperature, humidity, underfloor water-leak rope, and VESDA smoke detection)."
    ],
    answerKeyQuestion: {
      prompt: "In a dual-corded 2N (A-side and B-side) data center power architecture, what happens if both the A-side UPS and B-side UPS are loaded to 65% of their maximum capacity during normal operation?",
      options: [
        "If the A-side UPS fails or is taken offline for maintenance, the B-side UPS instantly receives 65% + 65% = 130% load, tripping on overload and dropping the entire data center!",
        "The servers automatically generate electricity for the utility grid.",
        "65% + 65% equals 65% on the surviving UPS.",
        "Dual-corded servers only draw power on weekends."
      ],
      correctIndex: 0,
      explanation: "In a true 2N system, normal load per side must remain below 40–45% (so failover load stays below the 80–90% continuous UPS/breaker limit)."
    },
    careerGuidance: {
      prerequisites: "3-phase electrical distribution, HVAC thermodynamics, server/network hardware, and facility operations.",
      targetRoles: "Data Center Infrastructure Engineer, Critical Facilities Engineer, Data Center Capacity Planner, DCIM & Reliability Specialist.",
      qualificationsAndNextSteps: "Uptime Institute ATD (Accredited Tier Designer), BICSI DCDC (Data Center Design Consultant), EPI CDCP, ASHRAE TC 9.9 guidelines."
    },
    mentorReviewCriteria: [
      "2N and N+1 redundancy calculations prove concurrent maintainability without dropping critical load.",
      "Airflow design prevents hot/cold air mixing (installing blanking panels in all unused rack U-spaces).",
      "Environmental monitoring covers ASHRAE Recommended inlet envelope (18°C–27°C)."
    ],
    principalReferences: [
      {
        title: "DOE Center of Expertise for Energy Efficiency in Data Centers & ASHRAE TC 9.9 Guidelines",
        organization: "U.S. Department of Energy / Lawrence Berkeley National Laboratory",
        url: "https://datacenters.lbl.gov/",
        summary: "Authoritative engineering tools and best practices for data center power distribution, thermal management, liquid cooling, and PUE optimization."
      }
    ]
  },
  {
    careerNumber: 41,
    id: "spec-career-41-enterprise-network-architecture",
    title: "Enterprise Network Architecture",
    domainNumber: 9,
    domainTitle: "9. Telecommunications and network infrastructure",
    academyId: "academy-1-cybersecurity-specialist",
    coverImage: "/images/connectln-studies/packet-soc-cover.jpg",
    tangibleEvidenceType: "Segmented Enterprise Network Topology, VLSM IP/VLAN Addressing Table, OSPF/BGP/FHRP Configs & Failover Validation Log",
    coreCurriculumBullets: [
      "Routing and switching",
      "VLANs and network segmentation",
      "DNS, DHCP, and IP address management",
      "Network availability and redundancy",
      "Quality of service",
      "Network monitoring and troubleshooting"
    ],
    capstoneProject: "Design and validate a segmented enterprise network in a simulator.",
    workedFormulaTitle: "VLSM Subnet Usable Host Capacity, Link Serialization Latency & QoS Voice Bandwidth",
    workedFormulaEquations: [
      "Usable IPv4 Hosts per Subnet:  N_hosts = 2^(32 - Prefix_Length) - 2",
      "Availability of Parallel Pair: A_parallel = 1 - (1 - A_1)(1 - A_2)",
      "Bandwidth-Delay Product:       BDP (bits) = Bandwidth_bps × RTT_seconds"
    ],
    workedFormulaExplanation:
      "Enterprise network architects segment broadcast and security domains using VLANs and VRFs, allocate IPv4/IPv6 address blocks via Variable Length Subnet Masking (VLSM), eliminate single points of failure with Rapid PVST+/LACP/VRRP/OSPF, and prioritize real-time voice/video traffic via DSCP EF/AF QoS queues.",
    workedProblemStatement:
      "An enterprise campus requires segmented VLAN subnets from `10.20.0.0/22` for: Engineering (210 hosts), VoIP Phones (115 hosts), Servers (50 hosts), and Point-to-Point Core Links (2 hosts each). Size the optimal CIDR prefix length and subnet mask for each segment without wasting address space.",
    workedStepByStep: [
      "1. Engineering (210 hosts): Needs 2^8 - 2 = 254 usable hosts ⇒ `/24` (`255.255.255.0`), `10.20.0.0/24`.",
      "2. VoIP Phones (115 hosts): Needs 2^7 - 2 = 126 usable hosts ⇒ `/25` (`255.255.255.128`), `10.20.1.0/25`.",
      "3. Servers (50 hosts): Needs 2^6 - 2 = 62 usable hosts ⇒ `/26` (`255.255.255.192`), `10.20.1.128/26`.",
      "4. Point-to-Point routed links (2 hosts): Needs 2^2 - 2 = 2 usable hosts ⇒ `/30` (`255.255.255.252`), `10.20.1.192/30` (or `/31` RFC 3021)."
    ],
    workedConclusion:
      "Allocating `/24`, `/25`, `/26`, and `/30` in descending size order prevents subnet overlap and preserves contiguous summary blocks for OSPF routing.",
    practicalLabScenario:
      "Architect, configure, and validate a dual-core segmented enterprise network (User, VoIP, Server, Management, IoT/OT, and DMZ VLANs) with VRRP/HSRP gateway redundancy, OSPF multi-area routing, DHCP Snooping / Dynamic ARP Inspection, and DSCP QoS policies.",
    practicalLabTasks: [
      "Design the hierarchical Core / Distribution / Access (or Spine-Leaf) topology and complete the VLSM IPAM & VLAN table.",
      "Configure 802.1Q trunking, LACP EtherChannels, Root Bridge placement, BPDU Guard, and VRRP/HSRP active/standby gateway failover.",
      "Implement inter-VLAN firewall ACLs enforcing least-privilege segmentation between IoT, User, and Server zones.",
      "Simulate a core switch failure and capture packet-loss / convergence time (< 1 second) plus SNMP/Syslog/NetFlow telemetry."
    ],
    answerKeyQuestion: {
      prompt: "What security and availability risk occurs on an enterprise access switch if PortFast is enabled on user ports WITHOUT enabling BPDU Guard, and someone plugs an unauthorized switch with a lower bridge priority into a wall jack?",
      options: [
        "The unauthorized switch can win the Spanning Tree Root Bridge election, diverting campus traffic through a slow/untrusted edge link or creating a Layer-2 bridging loop that brings down the network.",
        "BPDU Guard only affects Wi-Fi passwords.",
        "Layer-2 broadcast storms automatically fix themselves because Ethernet frames have a Time-To-Live (TTL) header.",
        "VLAN tags encrypt all payload data by default."
      ],
      correctIndex: 0,
      explanation: "Ethernet Layer-2 frames have no TTL field; BPDU Guard immediately err-disables any edge port that receives a Spanning Tree BPDU, protecting the root topology."
    },
    careerGuidance: {
      prerequisites: "OSI & TCP/IP models, binary/hexadecimal subnetting, Linux/CLI fundamentals, and packet analysis (Wireshark).",
      targetRoles: "Enterprise Network Architect, Senior Network Engineer, Network Operations Center (NOC) Lead, Infrastructure Solutions Engineer.",
      qualificationsAndNextSteps: "Cisco CCNA / CCNP Enterprise, Arista ACE, Juniper JNCIA/JNCIS, Wireshark WCNA."
    },
    mentorReviewCriteria: [
      "VLSM address plan has zero overlapping ranges and supports clean route summarization.",
      "First-Hop Redundancy Protocol (VRRP/HSRP) priority aligns symmetrically with Spanning Tree Root Bridge placement.",
      "Edge security includes DHCP Snooping, Dynamic ARP Inspection (DAI), and 802.1X / MAB port authentication."
    ],
    principalReferences: [
      {
        title: "NIST SP 800-207 Zero Trust Architecture & IETF RFC Routing/Switching Standards",
        organization: "NIST / Internet Engineering Task Force (IETF)",
        url: "https://csrc.nist.gov/pubs/sp/800/207/final",
        summary: "Authoritative architecture standards for network micro-segmentation, enterprise routing resilience, and zero-trust access control."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 10: SEMICONDUCTOR MANUFACTURING AND ADVANCED MATERIALS (42-44)
  // --------------------------------------------------------------------------
  {
    careerNumber: 42,
    id: "spec-career-42-semiconductor-manufacturing-technology",
    title: "Semiconductor Manufacturing Technology",
    domainNumber: 10,
    domainTitle: "10. Semiconductor manufacturing and advanced materials",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/semiconductor-cleanroom-bento.png",
    tangibleEvidenceType: "Wafer Inspection & Traveler Record, SPC Control Chart Analysis, Lot Traceability Gap Report & Shift Handover Package",
    coreCurriculumBullets: [
      "Wafer fabrication fundamentals",
      "Cleanroom procedures and contamination control",
      "Lithography and thin-film deposition",
      "Etching and metrology",
      "Yield analysis and defect classification",
      "Equipment maintenance and process control"
    ],
    capstoneProject: "Analyze a simulated wafer defect dataset and recommend process improvements.",
    workedFormulaTitle: "Poisson Particle Defect Model, Film Mean/Range SPC, Etch/Deposition Rate & First-Pass Yield",
    workedFormulaEquations: [
      "Poisson Particle Model:   μ = λ × A  ;  P(0) = e^(-μ)",
      "Wafer Film Mean & Range:  x̄ = (Σ x_i) / n  ;  R = x_max - x_min",
      "Etch / Deposition Rate:   Rate (nm/min) = |ΔThickness| / Δt",
      "Yield & First-Pass Yield: Yield = (Accepted / Evaluated) × 100%  ;  FPY = (Passed_First_Time / Entered) × 100%"
    ],
    workedFormulaExplanation:
      "Semiconductor technicians verify wafer thickness and film uniformity (mean x̄ and range R), distinguish engineering Specification Limits from statistical Control Limits, maintain 100% lot/wafer/tool/recipe traceability, and follow documented hold and escalation rules rather than changing recipes independently.",
    workedProblemStatement:
      "Three wafer lots (A, B, C) are inspected after film deposition (Target = 100 nm, Specification = 97–103 nm). Lot A (Tool DEP-01) measures [99, 100, 101, 100, 100] nm. Lot B (Tool DEP-01) measures [100, 101, 104, 100, 102] nm with 1 particle defect. Lot C (Tool DEP-02) measures [99, 100, 100, 101, 100] nm but is missing a required equipment ID on one process step. Calculate the mean and range for each lot and state the required disposition.",
    workedStepByStep: [
      "1. Lot A: Mean x̄_A = (99+100+101+100+100)/5 = 100.0 nm; Range R_A = 101 - 99 = 2 nm. Measurements pass 97–103 nm spec.",
      "2. Lot B: Mean x̄_B = (100+101+104+100+102)/5 = 101.4 nm; Range R_B = 104 - 100 = 4 nm. The 104 nm reading exceeds the 103 nm upper spec limit, and a particle defect was observed ⇒ Place Lot B on Hold and escalate per procedure.",
      "3. Lot C: Mean x̄_C = 100.0 nm; Range R_C = 2 nm. Measurements pass spec, BUT the missing equipment ID is a traceability gap that must be resolved through the authorized traceability procedure before release."
    ],
    workedConclusion:
      "Lot A measurements pass; Lot B requires Hold & engineering escalation (104 nm out-of-spec + particle defect); Lot C requires authorized traceability correction for the missing tool ID.",
    practicalLabScenario:
      "Complete the 12-week Semiconductor Manufacturing Technology capstone case study across Lots A, B, and C, including wafer unit conversions (775 µm = 0.775 mm), lithography CD error calculation (206 nm vs 200 nm = 3%), etch/deposition rate comparison, SPC control-limit analysis, and shift handover.",
    practicalLabTasks: [
      "Calculate mean thickness and range for Lots A, B, and C and compare each reading against the 97–103 nm specification.",
      "Complete the Defect & Nonconformance Record for Lot B (104 nm excursion + particle observation).",
      "Complete the Traceability-Gap Report for Lot C without guessing or fabricating the missing tool identifier.",
      "Write a structured Shift Handover Note and present the evidence and its limitations."
    ],
    answerKeyQuestion: {
      prompt: "Which statement correctly distinguishes specification limits from control limits in semiconductor metrology and SPC?",
      options: [
        "Specification limits define acceptable product/engineering requirements, whereas control limits are statistically derived from process behavior to detect unusual variation.",
        "They always mean the exact same thing.",
        "Control limits are always set by the customer without looking at process data.",
        "If a measurement exceeds the upper specification limit, a trainee should repeat the measurement until one passes."
      ],
      correctIndex: 0,
      explanation: "Specification limits reflect engineering/product requirements; control limits reflect statistical process behavior. Out-of-spec or out-of-control points require following the documented reaction and escalation plan."
    },
    careerGuidance: {
      prerequisites: "Basic mathematics (fractions, decimals, percentages, unit conversions), spreadsheets, ability to follow written SOPs, and safety awareness.",
      targetRoles: "Semiconductor Manufacturing Technician, Wafer Fabrication Technician, Cleanroom Production Technician, Process/Metrology Technician Trainee.",
      qualificationsAndNextSteps: "12-week foundation + employer on-the-job tool qualification, SEMI S19 safety awareness, AAS in Microelectronics / Mechatronics."
    },
    mentorReviewCriteria: [
      "80/100 overall score with zero critical safety violations.",
      "Correct identification of Lot B's 104 nm out-of-specification reading and particle defect.",
      "Correct identification of Lot C's missing equipment ID traceability gap without inventing data."
    ],
    principalReferences: [
      {
        title: "OSHA Semiconductor Silicon Device Manufacturing & NIST CHIPS Metrology Program",
        organization: "OSHA / NIST / SEMI / UIUC ECE 444 / BLS",
        url: "https://www.osha.gov/semiconductors/silicon",
        summary: "Authoritative safety, metrology, standards, and workforce references for semiconductor wafer fabrication and technician training."
      }
    ]
  },
  {
    careerNumber: 43,
    id: "spec-career-43-materials-science-failure-analysis",
    title: "Materials Science and Failure Analysis",
    domainNumber: 10,
    domainTitle: "10. Semiconductor manufacturing and advanced materials",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    tangibleEvidenceType: "Fractographic & Metallographic Examination Log, Stress-Strain Mechanical Analysis & Component Failure Investigation Report",
    coreCurriculumBullets: [
      "Material properties and selection",
      "Metallography and microscopy",
      "Mechanical testing",
      "Fracture and corrosion analysis",
      "Polymer and composite materials",
      "Failure investigation and technical reporting"
    ],
    capstoneProject: "Investigate a fictional component failure using test results, photographs, and material specifications.",
    workedFormulaTitle: "Engineering Stress/Strain, Young's Modulus & Fracture Toughness (K_IC)",
    workedFormulaEquations: [
      "Engineering Tensile Stress & Strain:  σ = F / A_0 (MPa)   ;   ε = ΔL / L_0",
      "Hooke's Law (Elastic Region):         E = σ / ε",
      "Mode I Stress Intensity Factor:       K_I = Y × σ × √(π × a)   (Fracture occurs when K_I >= K_IC)"
    ],
    workedFormulaExplanation:
      "Materials and failure-analysis engineers preserve fracture surfaces from post-failure mechanical/chemical damage, distinguish ductile overload (dimpled cup-and-cone microvoid coalescence) from high-cycle fatigue (ratchet marks, beach marks, fatigue striations, and small final fast-fracture zone), and verify alloy composition, hardness, and microstructure against design specs.",
    workedProblemStatement:
      "A cylindrical steel tie-rod (diameter d = 20.0 mm, cross-sectional area A_0 = π × 10² = 314.16 mm²) with specified Yield Strength σ_y = 650 MPa and Fracture Toughness K_IC = 55 MPa·√m experiences a tensile load of F = 125.66 kN. A sharp surface corrosion pit/crack of depth a = 4.5 mm (geometry factor Y = 1.12) forms in service. Compute nominal stress σ, compare against yield strength, and calculate whether K_I exceeds K_IC.",
    workedStepByStep: [
      "1. Compute nominal tensile stress: σ = 125,660 N / 314.16 mm² = 400.0 MPa (well below the 650 MPa yield strength — only 61.5% of yield).",
      "2. Convert crack depth a = 4.5 mm to meters: a = 0.0045 m.",
      "3. Compute Stress Intensity Factor K_I: K_I = 1.12 × 400.0 MPa × √(π × 0.0045 m) = 448.0 × √(0.014137) = 448.0 × 0.1189 = 53.27 MPa·√m.",
      "4. As fatigue grows the crack from 4.5 mm to 4.8 mm, K_I reaches 55.0 MPa·√m = K_IC, triggering sudden brittle fast fracture even though nominal stress (400 MPa) never reached yield (650 MPa)."
    ],
    workedConclusion:
      "Linear-elastic fracture mechanics explains why the rod fractured catastrophically at 400 MPa (below 650 MPa yield) once the fatigue crack reached critical length a_c = 4.8 mm.",
    practicalLabScenario:
      "Investigate a fractured industrial pump shaft using supplied optical/SEM fractographs, Rockwell hardness readings, optical metallography micrographs, and OES chemical composition tables, and write an ASM-style Root-Cause Failure Analysis Report.",
    practicalLabTasks: [
      "Examine macro-fractographs to locate ratchet marks at an unradiused keyway corner, fatigue beach marks across 70% of the cross-section, and the final overload shear lip.",
      "Compare OES alloy chemistry and Rockwell C hardness against the engineering drawing heat-treatment specification.",
      "Calculate nominal bending/torsional stress concentration factor (K_t) at the sharp keyway fillet.",
      "Author the Failure Investigation Report separating physical evidence from root cause (keyway stress concentration + improper heat treatment) and specify redesign corrective actions."
    ],
    answerKeyQuestion: {
      prompt: "During the initial field collection of a fractured metal component for laboratory failure analysis, why must technicians NEVER fit the two mating fracture halves back together and grind them against each other to 'see how they broke'?",
      options: [
        "Touching or rubbing the mating fracture surfaces crushes microscopic fatigue striations, cleavage facets, and corrosion products needed for SEM fractography, permanently destroying primary physical evidence.",
        "Because metal pieces weld themselves together at room temperature.",
        "Because Rockwell hardness tests can only be performed on painted surfaces.",
        "Fitting the halves together changes the chemical elements inside the steel."
      ],
      correctIndex: 0,
      explanation: "Fracture surfaces are delicate primary evidence; they must be protected from mechanical contact, fingerprints, and moisture prior to optical and SEM examination."
    },
    careerGuidance: {
      prerequisites: "Materials science, mechanics of materials, chemistry, microscopy, and technical report writing.",
      targetRoles: "Materials & Failure Analysis Engineer, Metallurgical Lab Technician, Quality & Reliability Materials Specialist, Aerospace/Manufacturing Materials Analyst.",
      qualificationsAndNextSteps: "ASM International Failure Analysis & Metallography certificates, ASTM mechanical testing standards (ASTM E8, E18, E399), PE Metallurgical/Materials."
    },
    mentorReviewCriteria: [
      "Non-destructive photography and surface preservation precede any destructive sectioning or etching.",
      "Fractographic interpretation accurately distinguishes fatigue progression from final overload.",
      "Recommendations address both geometry (fillet radius K_t) and material processing controls."
    ],
    principalReferences: [
      {
        title: "NIST Materials Science and Engineering Division & ASTM Mechanical Testing Standards",
        organization: "National Institute of Standards and Technology (NIST) / ASM / ASTM",
        url: "https://www.nist.gov/mml/acmd",
        summary: "Reference methodologies for mechanical testing, fracture mechanics, metallography, and quantitative failure analysis."
      }
    ]
  },
  {
    careerNumber: 44,
    id: "spec-career-44-battery-systems-energy-storage",
    title: "Battery Systems and Energy Storage Technology",
    domainNumber: 10,
    domainTitle: "10. Semiconductor manufacturing and advanced materials",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/solar-microgrid-cover.jpg",
    tangibleEvidenceType: "Battery Pack Series-Parallel Architecture Sheet, SoC/SoH Degradation Analysis, Thermal Runaway Risk Matrix & BMS Validation Report",
    coreCurriculumBullets: [
      "Cell chemistry and battery architecture",
      "Battery management systems",
      "State of charge and state of health",
      "Thermal management",
      "Degradation and lifecycle analysis",
      "Storage safety and recycling"
    ],
    capstoneProject: "Evaluate a simulated battery pack's performance, degradation, and operating risks.",
    workedFormulaTitle: "Pack Configuration (NsNp), State of Health (SoH), C-Rate & Joule Heating Loss",
    workedFormulaEquations: [
      "Pack Voltage & Capacity (Ns × Np):  V_pack = N_s × V_cell  ;  Q_pack_Ah = N_p × Q_cell_Ah  ;  E_kWh = (V_pack × Q_pack_Ah) / 1000",
      "State of Health & C-Rate:           SoH (%) = (Q_aged_max / Q_nominal_BOL) × 100%  ;  C_rate = I_current / Q_nominal_Ah",
      "Internal Ohmic Heat Generation:     P_heat = I² × R_internal"
    ],
    workedFormulaExplanation:
      "Battery engineers configure cells in series (`N_s` to build voltage) and parallel (`N_p` to build amp-hour capacity), monitor cell-to-cell voltage divergence and DC Internal Resistance (`R_internal`) via the Battery Management System (BMS), and prevent overcharge, lithium plating (cold fast-charging), and thermal propagation.",
    workedProblemStatement:
      "A 100S2P LFP (Lithium Iron Phosphate) battery module uses cells with nominal voltage V_cell = 3.20 V and BOL capacity Q_cell = 100 Ah (internal resistance per parallel pair = 0.8 mΩ, total pack R_int = 100 × 0.8 mΩ = 0.080 Ω). After 2,500 cycles, a full 0.5C capacity test measures 172 Ah. Calculate nominal BOL pack voltage, BOL energy (kWh), current State of Health (SoH), and internal ohmic heat generation at a 100 A discharge.",
    workedStepByStep: [
      "1. Nominal Pack Voltage (100 series): V_pack = 100 × 3.20 V = 320.0 V.",
      "2. Nominal BOL Capacity (2 parallel): Q_BOL = 2 × 100 Ah = 200.0 Ah; BOL Energy = (320 V × 200 Ah) / 1,000 = 64.0 kWh.",
      "3. Compute aged State of Health (SoH): (172 Ah / 200 Ah) × 100% = 86.0% SoH.",
      "4. Compute Joule heating at I = 100 A: P_heat = (100 A)² × 0.080 Ω = 10,000 × 0.080 = 800 W (0.80 kW of thermal load that the liquid/air cooling plate must reject)."
    ],
    workedConclusion:
      "The 320 V / 64 kWh pack is at 86.0% SoH and generates 800 W of ohmic heat during a 100 A (0.5C) discharge.",
    practicalLabScenario:
      "Analyze a 1,000-cycle telemetry dataset from a 100S2P stationary/EV battery pack (cell voltages V_1..V_100, thermistor temperatures, coulomb-counted Ah capacity, and pulse resistance), identify a weak cell with elevated internal resistance and thermal hotspot, and produce a BMS Safety & Degradation Report.",
    practicalLabTasks: [
      "Compare NMC vs. LFP cell chemistry trade-offs (nominal voltage, specific energy, cycle life, and thermal runaway onset temperature).",
      "Compute pack SoC, SoH capacity fade curve, and DC internal resistance growth over 1,000 cycles.",
      "Isolate Cell Group #47 exhibiting a 95 mV voltage sag under load and +9°C local temperature rise due to a degraded tab weld / internal impedance spike.",
      "Specify BMS protection thresholds (OVP, UVP, OTP, UTP cold-charge inhibit, and UL 9540A gas/thermal runaway venting)."
    ],
    answerKeyQuestion: {
      prompt: "Why must a Battery Management System (BMS) strictly restrict or prohibit high-rate fast charging when lithium-ion cell temperatures are below freezing (0°C) until the pack is warmed?",
      options: [
        "Fast-charging cold lithium-ion cells causes metallic lithium plating on the graphite anode instead of normal intercalation, permanently degrading capacity and growing lithium dendrites that can pierce the separator and cause an internal short circuit.",
        "Because lithium-ion batteries freeze into ice cubes at +15°C.",
        "Because cold copper wires cannot conduct DC current.",
        "Fast-charging at -10°C doubles the battery's lifespan."
      ],
      correctIndex: 0,
      explanation: "Slow lithium-ion diffusion in the graphite anode at low temperatures causes metallic lithium plating during high-current charging, creating severe internal short-circuit hazards."
    },
    careerGuidance: {
      prerequisites: "Electrochemistry basics, DC circuit theory, thermal heat transfer, and Python/spreadsheet time-series analysis.",
      targetRoles: "Battery Systems Engineer, Energy Storage (BESS) Commissioning & Reliability Analyst, BMS Validation Technician, Battery Lifecycle & Recycling Specialist.",
      qualificationsAndNextSteps: "UL 9540 / UL 9540A / NFPA 855 stationary storage safety standards, SAE battery testing standards, NREL battery modeling tools."
    },
    mentorReviewCriteria: [
      "Pack sizing calculations distinguish usable energy (accounting for DoD window and efficiency) from nameplate energy.",
      "Diagnostic analysis detects weak cells via under-load voltage divergence (`ΔV_cell`) and `dV/dQ` / internal resistance metrics.",
      "Safety plan addresses high-voltage arc-flash PPE, off-gas detection, and safe end-of-life discharge/recycling."
    ],
    principalReferences: [
      {
        title: "NREL Energy Storage Research & NFPA 855 / UL 9540A Battery Safety Standards",
        organization: "National Renewable Energy Laboratory (NREL) / DOE",
        url: "https://www.nrel.gov/transportation/energy-storage.html",
        summary: "Authoritative research and technical standards on lithium-ion battery performance, degradation modeling, thermal management, and safety."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 11: TRANSPORTATION, FLEET AND MOBILITY TECHNOLOGY (45-47)
  // --------------------------------------------------------------------------
  {
    careerNumber: 45,
    id: "spec-career-45-ev-diagnostics-charging-infrastructure",
    title: "Electric Vehicle Diagnostics and Charging Infrastructure",
    domainNumber: 11,
    domainTitle: "11. Transportation, fleet and mobility technology",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/cyber-specialist-cover.jpg",
    tangibleEvidenceType: "High-Voltage Zero-Potential Safety Log, SAE J1772/CCS Charging Handshake Trace & EV Fault Service Report",
    coreCurriculumBullets: [
      "EV architecture and power electronics",
      "Charging systems and communication",
      "Diagnostic trouble codes",
      "Battery performance and thermal management",
      "Charging network operation",
      "Maintenance safety and fault reporting"
    ],
    capstoneProject: "Diagnose a simulated charging fault and produce a structured service report.",
    workedFormulaTitle: "High-Voltage Isolation Resistance, J1772 Control Pilot PWM Current & Charging Time",
    workedFormulaEquations: [
      "HV Isolation Safety Requirement:  R_iso >= 500 Ω/V × V_nominal   (FMVSS 305 / ISO 6469-3)",
      "SAE J1772 Control Pilot (10%–85%): Max_AC_Amps = (%Duty_Cycle) × 0.6 A",
      "Charging Duration (hr):           t_charge = [ E_pack_kWh × (SoC_target - SoC_start) ] / (P_charger_kW × η_charge)"
    ],
    workedFormulaExplanation:
      "EV technicians follow strict High-Voltage de-energization procedures (Class 0 1,000 V insulated gloves, Manual Service Disconnect removal, 5-minute capacitor bleed-down wait, and Live-Dead-Live zero-potential verification) before diagnosing HV isolation faults, pre-charge resistor failures, or SAE J1772 / CCS / OCPP charging faults.",
    workedProblemStatement:
      "An 800 V nominal EV powertrain sets Diagnostic Trouble Code `P0AA6 — Hybrid/EV Battery Voltage System Isolation Fault`. An insulation resistance tester at 1,000 V DC measures 180 kΩ between the High-Voltage negative bus and vehicle chassis ground ( localized to the HV cabin PTC heater). Calculate the minimum required isolation resistance at 800 V using the 500 Ω/V standard, and determine what AC charging current a Level 2 EVSE advertises when its 1 kHz Control Pilot PWM duty cycle is 50%.",
    workedStepByStep: [
      "1. Minimum safe HV isolation resistance at 800 V: R_iso,min = 500 Ω/V × 800 V = 400,000 Ω = 400 kΩ.",
      "2. Compare measured 180 kΩ against 400 kΩ threshold: 180 kΩ < 400 kΩ (FAILS isolation check; explains why BMS inhibited HV contactor closure).",
      "3. Compute J1772 advertised AC current at 50% PWM duty cycle: I_max = 50 × 0.6 A = 30.0 A.",
      "4. Service action: Perform full HV de-energization and Live-Dead-Live zero-voltage verification, disconnect the faulty HV PTC cabin heater, verify bus isolation rises above 10 MΩ, and replace the heater."
    ],
    workedConclusion:
      "Measured isolation of 180 kΩ falls below the 400 kΩ minimum at 800 V, and a 50% J1772 Control Pilot duty cycle commands a 30.0 A maximum AC charge limit.",
    practicalLabScenario:
      "Diagnose a commercial EV and DC Fast Charger (CCS1/NACS) customer complaint where AC Level 2 charging aborts at State B→C transition and DC fast charging fails pre-charge contactor closure, and produce a complete High-Voltage Safety & Service Report.",
    practicalLabTasks: [
      "Complete the High-Voltage De-Energization Checklist (PPE inspection, 12V disconnect, MSD removal, capacitor discharge wait, and Live-Dead-Live CAT III 1000V meter check).",
      "Analyze the SAE J1772 Control Pilot voltage levels (+12V State A, +9V State B detected, +6V State C ready) and Proximity Pilot resistor values.",
      "Pinpoint an open pre-charge resistor causing excessive inrush current fault on the HV main contactors.",
      "Review OCPP 1.6J/2.0.1 charger station logs and author the Customer & Engineering Service Report."
    ],
    answerKeyQuestion: {
      prompt: "When verifying that a High-Voltage (400 V / 800 V) electric vehicle system is safely de-energized after removing the Manual Service Disconnect (MSD), what does the mandatory 'Live-Dead-Live' meter procedure require?",
      options: [
        "1) Measure a known live voltage source (e.g., 12V battery) to prove the CAT III/IV voltmeter and leads work, 2) Measure HV+ to HV-, HV+ to chassis, and HV- to chassis to confirm 0.0 V, and 3) Re-test the known live source to prove the meter did not fail during the test.",
        "Touch the orange high-voltage busbars with bare hands.",
        "Only check the dashboard battery percentage icon.",
        "Remove the MSD plug while the vehicle is actively DC fast-charging at 350 kW."
      ],
      correctIndex: 0,
      explanation: "A broken test lead or blown meter fuse will falsely read 0.0 V on a lethal 800 V bus; Live-Dead-Live verification proves the meter is functioning before and after the zero-voltage test."
    },
    careerGuidance: {
      prerequisites: "Automotive electrical fundamentals, CAN bus diagnostics, high-voltage electrical safety, and power electronics.",
      targetRoles: "EV Diagnostic Technician, Charging Infrastructure (EVSE) Field Service Engineer, Fleet Electrification Specialist, High-Voltage Battery Repair Technician.",
      qualificationsAndNextSteps: "ASE L3 (Light Duty Hybrid/Electric Vehicle Specialist), EVITP (Electric Vehicle Infrastructure Training Program) for licensed electricians."
    },
    mentorReviewCriteria: [
      "High-voltage safety sequence (Class 0 glove air-test, MSD lockout, capacitor wait, Live-Dead-Live check) is 100% complete before any HV component disconnection.",
      "Diagnostic tree isolates component root cause using quantitative resistance/voltage measurements rather than parts-swapping.",
      "Charging protocol analysis accurately interprets Control Pilot states (+12V / +9V / +6V) and PLC/ISO 15118 stages."
    ],
    principalReferences: [
      {
        title: "DOE Alternative Fuels Data Center (AFDC) & SAE J1772 / J2990 EV Safety Standards",
        organization: "U.S. Department of Energy / SAE International",
        url: "https://afdc.energy.gov/fuels/electricity-infrastructure",
        summary: "Technical reference standards for electric vehicle charging infrastructure, connector protocols, and high-voltage service safety."
      }
    ]
  },
  {
    careerNumber: 46,
    id: "spec-career-46-railway-systems-signaling-technology",
    title: "Railway Systems and Signaling Technology",
    domainNumber: 11,
    domainTitle: "11. Transportation, fleet and mobility technology",
    academyId: "academy-2-engineering-critical-infrastructure",
    coverImage: "/images/connectln-studies/robotics-plc-cover.jpg",
    tangibleEvidenceType: "Track-Circuit Fail-Safe Logic Analysis, Braking Headway Calculation, Track Geometry Defect Log & Rail Safety Investigation Report",
    coreCurriculumBullets: [
      "Railway infrastructure fundamentals",
      "Signaling and train control concepts",
      "Track inspection and maintenance",
      "Rolling stock systems",
      "Safety assurance and incident analysis",
      "Asset reliability and maintenance planning"
    ],
    capstoneProject: "Analyze a simulated rail-system failure and prepare a safety-focused investigation.",
    workedFormulaTitle: "Fail-Safe Track Circuit Drop-Away, Emergency Braking Distance & Minimum Safe Headway",
    workedFormulaEquations: [
      "Kinematic Stopping Distance:  d_stop = (v_0 × t_reaction) + [ v_0² / (2 × (a_brake ± g sin(θ))) ]",
      "Fail-Safe Vital Relay Principle:  De-energized_Relay_State == Most_Restrictive_Signal_Aspect (RED / STOP)"
    ],
    workedFormulaExplanation:
      "Railway signaling systems are engineered around the fail-safe principle: a broken rail, power loss, broken wire, or wheel-axle shunt across the running rails drops the vital track-circuit relay by gravity, automatically displaying the most restrictive stop aspect and enforcing Positive Train Control (PTC) / CBTC braking curves.",
    workedProblemStatement:
      "A freight/passenger train travels at v_0 = 25.0 m/s (90 km/h) on level track (θ = 0). The signaling/brake propagation reaction delay is t_r = 3.0 s, and the guaranteed service wet-rail deceleration rate is a_brake = 1.0 m/s². Calculate the total stopping distance d_stop and the minimum signal block length including a 25% safety overlap margin.",
    workedStepByStep: [
      "1. Distance traveled during 3.0 s reaction/brake build-up time: d_r = 25.0 m/s × 3.0 s = 75.0 m.",
      "2. Braking deceleration distance: d_b = (25.0 m/s)² / (2 × 1.0 m/s²) = 625.0 / 2.0 = 312.5 m.",
      "3. Total stopping distance: d_stop = 75.0 + 312.5 = 387.5 m.",
      "4. Multiply by 1.25 safety margin: Minimum Block / Braking Curve Distance = 387.5 m × 1.25 = 484.4 m."
    ],
    workedConclusion:
      "At 90 km/h (25 m/s), stopping requires 387.5 m (484.4 m with 25% overlap margin), defining minimum block signal spacing.",
    practicalLabScenario:
      "Investigate a simulated rail incident involving a false 'track clear' loss-of-shunt condition on a rusted/contaminated secondary siding and a track gauge-widening geometry exceedance, and author a FRA/EN 50126 Safety Investigation & Corrective Action Report.",
    practicalLabTasks: [
      "Trace the vital DC/Audio-Frequency track circuit or axle-counter interlocking diagram and identify how rail-head rust/leaf-film contamination raised shunt impedance above the 0.06 Ω drop-away threshold.",
      "Verify interlocking truth tables (route locking, approach locking, and point-machine detection correspondence).",
      "Evaluate Track Geometry Car measurements (gauge, cross-level, alignment, profile, and ultrasonic rail-flaw inspection logs) against FRA Class 4 track tolerances.",
      "Compile the Rail Safety Investigation Report with CENELEC EN 50126 / 50128 / 50129 SIL-4 hazard mitigations."
    ],
    answerKeyQuestion: {
      prompt: "How does a traditional vital railway track circuit achieve 'fail-safe' operation if a rail breaks completely in two or the track-side battery power supply fails?",
      options: [
        "The track relay is held energized ONLY when current flows continuously through intact rails; a broken rail, power loss, or train axle shunt interrupts current to the relay coil, causing the vital relay contacts to drop by gravity and command a RED (Stop) signal.",
        "The signal turns green whenever power is lost so trains can drive faster.",
        "Track circuits require an internet connection to cloud servers to turn red.",
        "A broken rail increases current into the vital relay coil."
      ],
      correctIndex: 0,
      explanation: "Closed-circuit energized hold-up with gravity drop-out ensures that wire breaks, rail breaks, power failures, and train shunts all default to the safest restrictive state."
    },
    careerGuidance: {
      prerequisites: "Electrical circuits, relay/PLC interlocking logic, mechanical dynamics, and safety-critical systems.",
      targetRoles: "Railway Signaling Technician, Train Control (PTC/CBTC) Systems Engineer, Track Inspection & Reliability Specialist, Rail Safety Assurance Analyst.",
      qualificationsAndNextSteps: "FRA Part 236 Signal & Train Control rules, AREMA Communications & Signals Manual, IRSE (Institution of Railway Signal Engineers) licensing."
    },
    mentorReviewCriteria: [
      "Braking curve calculations account for worst-case downhill grade, wet rail adhesion, and brake build-up propagation time.",
      "Interlocking analysis proves impossibility of conflicting routes and point movement under a train.",
      "Roadway Worker Protection (RWP / foul-time protection) safety rules are strictly enforced."
    ],
    principalReferences: [
      {
        title: "Federal Railroad Administration (FRA) Track & Signal Safety Standards (49 CFR Parts 213 & 236)",
        organization: "U.S. DOT Federal Railroad Administration (FRA)",
        url: "https://railroads.dot.gov/safety-security",
        summary: "Federal regulations and technical compliance manuals for railway track geometry, signaling, interlocking, and Positive Train Control (PTC)."
      }
    ]
  },
  {
    careerNumber: 47,
    id: "spec-career-47-fleet-telematics-maintenance-analytics",
    title: "Fleet Telematics and Maintenance Analytics",
    domainNumber: 11,
    domainTitle: "11. Transportation, fleet and mobility technology",
    academyId: "academy-3-ai-software-engineering",
    coverImage: "/images/connectln-studies/mlops-data-cover.jpg",
    tangibleEvidenceType: "J1939/OBD-II Telematics Pipeline, Fleet MTBF/Availability Dashboard, Cost-Per-Mile Model & Predictive Maintenance Schedule",
    coreCurriculumBullets: [
      "Vehicle sensor data and telematics",
      "Preventive and predictive maintenance",
      "Fuel and energy efficiency",
      "Route and utilization analysis",
      "Maintenance cost forecasting",
      "Fleet performance dashboards"
    ],
    capstoneProject: "Use a simulated fleet dataset to identify maintenance priorities and reduce avoidable downtime.",
    workedFormulaTitle: "Mean Time Between Failures (MTBF), Fleet Technical Availability & Total Cost Per Mile (CPM)",
    workedFormulaEquations: [
      "Mean Time Between Failures:  MTBF = Total_Operating_Hours / Number_of_Breakdowns",
      "Fleet Availability (%):      A = [ MTBF / (MTBF + MTTR) ] × 100%",
      "Total Cost Per Mile (CPM):   CPM = (C_fixed + C_fuel_energy + C_maint_repair + C_tires + C_downtime) / Total_Miles"
    ],
    workedFormulaExplanation:
      "Fleet analytics engineers ingest SAE J1939 CAN bus / OBD-II telematics (SPN/FMI fault codes, DPF soot load, coolant temp, alternator voltage, idle fuel burn, and harsh braking), compute MTBF/MTTR and Cost Per Mile (CPM), and convert unscheduled roadside breakdowns into scheduled preventive/predictive shop interventions.",
    workedProblemStatement:
      "A 50-truck regional delivery fleet logs 100,000 operating hours over a year and suffers 80 unscheduled roadside breakdowns, with an average Mean Time To Repair (MTTR) including towing of 25.0 hours per breakdown. Calculate Fleet MTBF, Fleet Availability, and the availability gain if predictive J1939 telematics cuts unscheduled breakdowns by 50% and reduces average repair time to 8.0 hours.",
    workedStepByStep: [
      "1. Baseline MTBF = 100,000 operating hours / 80 breakdowns = 1,250 hours.",
      "2. Baseline Availability = 1,250 / (1,250 + 25.0) = 1,250 / 1,275 = 98.04% (representing 80 × 25 = 2,000 lost truck-hours/yr).",
      "3. Post-telematics MTBF (40 breakdowns): 100,000 / 40 = 2,500 hours; with MTTR = 8.0 hr, New Availability = 2,500 / (2,500 + 8.0) = 99.68%.",
      "4. Lost downtime drops from 2,000 truck-hours to 40 × 8 = 320 truck-hours, recovering 1,680 productive truck-hours/year."
    ],
    workedConclusion:
      "Predictive telematics triage doubles MTBF to 2,500 hours, cuts repair downtime by 1,680 truck-hours/year, and lifts availability from 98.04% to 99.68%.",
    practicalLabScenario:
      "Analyze a 90-day telematics, fuel-card, and work-order dataset for a 60-vehicle mixed diesel and electric commercial fleet, isolate vehicles with recurring J1939 DPF regeneration, battery voltage sag, and excessive idle burn, and build an Executive Fleet Maintenance & Uptime Plan.",
    practicalLabTasks: [
      "Decode SAE J1939 SPN/FMI fault logs (e.g., SPN 3251 DPF Differential Pressure high, SPN 110 Coolant Temp, SPN 168 Cranking Voltage drop) to flag imminent roadside failures.",
      "Calculate vehicle-by-vehicle Cost Per Mile (CPM), idle fuel waste %, and Preventive Maintenance (PM) schedule compliance.",
      "Rank the top 10 high-risk vehicles requiring immediate shop intervention before their next route dispatch.",
      "Design a Fleet Operations KPI Dashboard (Availability, MTBF, MTTR, PM Compliance %, and CPM)."
    ],
    answerKeyQuestion: {
      prompt: "In heavy-duty commercial fleet telematics (SAE J1939), why is monitoring continuous sensor trends (such as cranking voltage drop during starter engagement or rising Diesel Particulate Filter differential pressure) superior to waiting for a red dashboard 'Stop Engine' lamp?",
      options: [
        "Once a red 'Stop Engine' derate lamp illuminates on the highway, the vehicle is already experiencing an expensive roadside breakdown and tow; pre-threshold sensor trends allow the shop to service the battery or DPF during a planned overnight window.",
        "Because J1939 CAN buses only transmit data after the engine explodes.",
        "Because roadside towing is always cheaper than preventive filter cleaning.",
        "Idle time has zero impact on DPF soot loading or fuel cost."
      ],
      correctIndex: 0,
      explanation: "Predictive trend monitoring converts high-cost unscheduled roadside breakdowns (towing + missed delivery SLA + driver overtime) into low-cost planned shop maintenance."
    },
    careerGuidance: {
      prerequisites: "Data analytics (SQL, Excel, Power BI / Python), automotive/heavy-duty systems basics, and operations research.",
      targetRoles: "Fleet Telematics Analyst, Maintenance Reliability Planner, Connected Vehicle Data Analyst, Fleet Operations & Electrification Manager.",
      qualificationsAndNextSteps: "NAFA CAFM (Certified Automotive Fleet Manager), ASE Medium/Heavy Truck & Telematics literacy, Geotab/Samsara API analytics."
    },
    mentorReviewCriteria: [
      "CPM and MTBF/MTTR calculations reconcile telematics odometer/engine-hour logs with maintenance work-order costs.",
      "Prioritization matrix separates safety-critical defects (brakes, steering, tires, HV isolation) for immediate out-of-service hold.",
      "Dashboard recommendations link data trends to concrete shop workflows."
    ],
    principalReferences: [
      {
        title: "DOE Vehicle Technologies Office Fleet DNA & TMC Recommended Maintenance Practices",
        organization: "U.S. Department of Energy / NREL Fleet DNA",
        url: "https://www.nrel.gov/transportation/fleettest-fleet-dna.html",
        summary: "Real-world commercial fleet telematics benchmarking, duty-cycle analysis, fuel/energy efficiency, and maintenance reliability metrics."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 12: EMERGENCY MANAGEMENT, SAFETY AND RESILIENCE (48-50)
  // --------------------------------------------------------------------------
  {
    careerNumber: 48,
    id: "spec-career-48-emergency-management-disaster-preparedness",
    title: "Emergency Management and Disaster Preparedness",
    domainNumber: 12,
    domainTitle: "12. Emergency management, safety and resilience",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    tangibleEvidenceType: "THIRA Hazard Vulnerability Assessment, ICS 201/202 Incident Action Plan (IAP), Resource Burn-Rate Model & After-Action Report (AAR)",
    coreCurriculumBullets: [
      "Hazard and vulnerability assessments",
      "Emergency operations plans",
      "Incident coordination",
      "Resource allocation and logistics",
      "Public warning and risk communication",
      "Recovery planning and after-action reviews"
    ],
    capstoneProject: "Coordinate a simulated severe-weather emergency from initial response through recovery.",
    workedFormulaTitle: "Shelter Logistics Resource Burn Rate, Evacuation Clearance Time & HVA Risk Score",
    workedFormulaEquations: [
      "Potable Water Requirement:     V_water_L = Population × 3.8 L/person/day × Days_Autonomy",
      "Supply Days of Autonomy:       Days_Remaining = Current_Inventory / Daily_Consumption_Rate",
      "Hazard Vulnerability Score:    Risk_% = Probability_Rating × (Human_Impact + Property_Impact + Service_Impact)"
    ],
    workedFormulaExplanation:
      "Emergency managers structure multi-agency response using the National Incident Management System (NIMS) and Incident Command System (ICS: Command, Operations, Planning, Logistics, Finance/Admin), establish verifiable Operational Period objectives in an Incident Action Plan (IAP), and forecast critical supply burn rates.",
    workedProblemStatement:
      "A coastal county Emergency Operations Center (EOC) activates 3 emergency shelters housing 2,400 displaced residents following a Category 3 hurricane. Using the emergency planning standard of 4.0 liters of drinking water and 2,000 kcal (3 MRE meals) per person per day, plus 25% buffer for medical/sanitation staff, calculate the 72-hour (3-day) water volume and meal requirement.",
    workedStepByStep: [
      "1. Base daily water for 2,400 residents: 2,400 × 4.0 L/day = 9,600 L/day.",
      "2. Add 25% staff/medical/contingency buffer: 9,600 L/day × 1.25 = 12,000 L/day.",
      "3. Compute 72-hour (3-day) water requirement: 12,000 L/day × 3 days = 36,000 liters (36.0 m³).",
      "4. Compute 72-hour meal requirement (with 25% buffer): 2,400 × 3 meals/day × 3 days × 1.25 = 27,000 shelf-stable meals."
    ],
    workedConclusion:
      "Sustaining 2,400 shelter occupants for 72 hours requires staging 36,000 liters of potable water and 27,000 meals.",
    practicalLabScenario:
      "Coordinate a 72-hour simulated severe-flooding and power-outage emergency across a municipality of 85,000 residents: complete the Hazard Vulnerability Assessment (HVA), author the Operational Period 1 Incident Action Plan (ICS Forms 201, 202, 204, 205, 206), allocate shelter/generator/pump resources, draft accessible WEA public warning messages, and write the HSEEP After-Action Report / Improvement Plan.",
    practicalLabTasks: [
      "Establish the ICS organizational chart (Incident Commander, Safety Officer, PIO, Liaison, and 4 Section Chiefs) Maintaining a 3-to-7 span of control.",
      "Complete ICS 202 Incident Objectives, ICS 204 Division Assignments, and the 72-hour Shelter & Generator Fuel Burn-Rate Logistics table.",
      "Write clear, actionable, multi-lingual/accessible Public Warning & Evacuation messages (specifying Hazard, Location, Protective Action, and Timeframe).",
      "Produce an HSEEP-compliant After-Action Report (AAR) and Improvement Plan matrix."
    ],
    answerKeyQuestion: {
      prompt: "In the Incident Command System (ICS / NIMS), why is maintaining a manageable 'Span of Control' (typically 3 to 7 subordinates, with 5 being optimal) per supervisor essential during a rapidly escalating disaster?",
      options: [
        "When a single coordinator tries to directly supervise 15 or 20 independent teams during an emergency, communication bottlenecks, missed safety checks, and conflicting orders occur; modular ICS divisions/groups keep supervision effective.",
        "Because radios can only transmit to 5 people on Earth.",
        "Span of control means only 5 citizens are allowed to evacuate.",
        "ICS prohibits Logistics and Operations from talking to each other."
      ],
      correctIndex: 0,
      explanation: "Modular expansion and a 3-to-7 supervisory span of control ensure clear accountability, safety oversight, and rapid communication under stress."
    },
    careerGuidance: {
      prerequisites: "Crisis communication, logistics planning, GIS mapping literacy, and interagency coordination.",
      targetRoles: "Emergency Management Specialist, Disaster Preparedness Coordinator, EOC Operations/Planning Analyst, Humanitarian Logistics Coordinator.",
      qualificationsAndNextSteps: "FEMA EMI Professional Development Series (IS-100, IS-200, IS-700, IS-800, G-300/400), IAEM Associate/Certified Emergency Manager (AEM/CEM)."
    },
    mentorReviewCriteria: [
      "Incident Action Plan objectives are SMART (Specific, Measurable, Action-oriented, Realistic, Time-sensitive) and prioritize Life Safety -> Incident Stabilization -> Property/Environment Preservation.",
      "Logistics calculations account for generator fuel resupply lead times and access road closures.",
      "Public warnings address vulnerable and access/functional-needs populations."
    ],
    principalReferences: [
      {
        title: "FEMA National Incident Management System (NIMS) & Comprehensive Preparedness Guide (CPG 101)",
        organization: "Federal Emergency Management Agency (FEMA)",
        url: "https://www.fema.gov/emergency-managers/nims",
        summary: "National standard for incident command, emergency operations planning, resource management, and public warning coordination."
      }
    ]
  },
  {
    careerNumber: 49,
    id: "spec-career-49-occupational-health-safety-management",
    title: "Occupational Health and Safety Management",
    domainNumber: 12,
    domainTitle: "12. Emergency management, safety and resilience",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    tangibleEvidenceType: "Job Hazard Analysis (JHA), LOTO Energy-Control Procedure, Hierarchy-of-Controls Risk Matrix & Incident Root-Cause Report",
    coreCurriculumBullets: [
      "Hazard identification and risk assessment",
      "Job hazard analysis",
      "Incident investigation",
      "Lockout/tagout principles",
      "Contractor safety",
      "Safety audits and corrective action tracking"
    ],
    capstoneProject: "Assess a simulated industrial workplace and create a risk-based safety improvement plan.",
    workedFormulaTitle: "OSHA Total Recordable Incident Rate (TRIR), 8-Hour Noise TWA & Hierarchy of Controls",
    workedFormulaEquations: [
      "OSHA Recordable Incident Rate:  TRIR = (Number_of_Recordable_Cases × 200,000) / Total_Employee_Hours_Worked",
      "8-Hour Time-Weighted Average:   TWA = (1 / 8) × Σ (C_i × t_i)",
      "NIOSH Hierarchy of Controls:    Elimination > Substitution > Engineering Controls > Administrative Controls > PPE"
    ],
    workedFormulaExplanation:
      "Occupational safety specialists quantify injury frequency normalized per 100 full-time workers/year (`200,000 hours`), enforce machine-specific Lockout/Tagout (OSHA 1910.147) energy isolation + try-start verification, and prioritize Elimination and Engineering Controls (guards, interlocks, local exhaust ventilation) over relying solely on PPE.",
    workedProblemStatement:
      "A 250-employee manufacturing plant worked 500,000 total employee-hours over the past year and recorded 11 OSHA-recordable injury/illness cases (including 4 Days-Away-Restricted-or-Transferred [DART] cases). Calculate the facility's TRIR and DART rate, and specify the proper control hierarchy for an unguarded conveyor pinch point.",
    workedStepByStep: [
      "1. Compute TRIR: (11 × 200,000) / 500,000 = 2,200,000 / 500,000 = 4.40 recordable incidents per 100 full-time workers.",
      "2. Compute DART rate: (4 × 200,000) / 500,000 = 800,000 / 500,000 = 1.60.",
      "3. Apply Hierarchy of Controls to the unguarded pinch point: Do NOT rely merely on a 'Watch Your Hands' sign (Administrative) or leather gloves (PPE); install a fixed physical barrier guard and interlocked e-stop gate (Engineering Control) plus a machine-specific LOTO procedure for jam clearing."
    ],
    workedConclusion:
      "Facility TRIR is 4.40 (DART = 1.60), and the conveyor hazard requires an interlocked physical barrier guard (Engineering Control) rather than warning signs alone.",
    practicalLabScenario:
      "Inspect a simulated manufacturing facility dataset (inspection photos, chemical SDS inventory, noise dosimetry logs, contractor permit-to-work records, and a near-miss LOTO incident), author a Job Hazard Analysis (JHA) and Machine-Specific LOTO Procedure, and deliver a Risk-Based Safety Improvement Plan.",
    practicalLabTasks: [
      "Break down a maintenance task into sequential steps and complete a Job Hazard Analysis (JHA) mapping hazards to Engineering, Administrative, and PPE controls.",
      "Write a machine-specific Lockout/Tagout (LOTO) procedure covering all energy sources (480V electrical, 90 psi pneumatic accumulator, elevated gravity ram, and thermal).",
      "Investigate a near-miss incident using 5-Why / Swiss-Cheese barrier analysis to identify latent management-system gaps.",
      "Create a 90-day Corrective Action Tracker prioritizing hazards by Severity × Likelihood."
    ],
    answerKeyQuestion: {
      prompt: "During a multi-technician maintenance job on an industrial mixer under Lockout/Tagout (OSHA 1910.147 Group LOTO), how many personal padlocks must be applied to the group lockout hasp/box?",
      options: [
        "One lock per person: EVERY authorized worker performing maintenance inside the hazard zone must attach and control the key to their own personal padlock so the machine cannot be re-energized while any worker is still inside.",
        "Only the plant manager needs to hold a single lock in their office.",
        "A cardboard tag without a physical padlock is preferred when a padlock fits the disconnect switch.",
        "Workers should share one key among five people to save money on padlocks."
      ],
      correctIndex: 0,
      explanation: "One-person, one-lock individual control ensures no worker can accidentally re-energize equipment while a colleague is still exposed to hazardous energy."
    },
    careerGuidance: {
      prerequisites: "Workplace hazard recognition, OSHA 1910/1926 standards literacy, industrial hygiene basics, and incident investigation.",
      targetRoles: "Occupational Health & Safety (EHS) Specialist, Safety Coordinator, Site Safety Officer, Risk & Loss Control Consultant.",
      qualificationsAndNextSteps: "OSHA 30-Hour General Industry / Construction, BCSP ASP (Associate Safety Professional) & CSP (Certified Safety Professional), ISO 45001."
    },
    mentorReviewCriteria: [
      "Control recommendations strictly follow the NIOSH Hierarchy of Controls (never substituting PPE where an Engineering Control is feasible).",
      "LOTO procedure explicitly includes stored-energy dissipation (bleeding pneumatic/hydraulic pressure, blocking gravity loads) and Try-Start zero-energy verification.",
      "Incident root cause identifies systemic barrier failures rather than blaming the injured worker."
    ],
    principalReferences: [
      {
        title: "OSHA Recommended Practices for Safety and Health Programs & 29 CFR 1910 Standards",
        organization: "Occupational Safety and Health Administration (OSHA) / NIOSH",
        url: "https://www.osha.gov/safety-management",
        summary: "Federal standards and core elements for workplace hazard identification, lockout/tagout, machine guarding, and safety management systems."
      }
    ]
  },
  {
    careerNumber: 50,
    id: "spec-career-50-fire-protection-life-safety",
    title: "Fire Protection and Life Safety Systems",
    domainNumber: 12,
    domainTitle: "12. Emergency management, safety and resilience",
    academyId: "academy-4-master-trades-construction",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    tangibleEvidenceType: "Life Safety Egress Capacity Worksheet, NFPA 25/72 Inspection Deficiency Report & Qualified Engineer Escalation Package",
    coreCurriculumBullets: [
      "Fire detection and alarm systems",
      "Sprinkler and suppression principles",
      "Egress and evacuation planning",
      "Fire risk assessment",
      "Inspection and maintenance records",
      "Emergency preparedness exercises"
    ],
    capstoneProject: "Review a fictional building's fire protection documentation and identify deficiencies requiring qualified review.",
    regulatoryBoundaryNote:
      "Life Safety Regulatory Notice: Designing, modifying, or certifying active fire suppression, fire alarm, and life-safety egress systems requires licensed Fire Protection Engineers (FPE), NICET-certified technicians, and approval by the Authority Having Jurisdiction (AHJ).",
    workedFormulaTitle: "Occupant Load, Required Egress Stair/Door Width & Sprinkler Design Demand",
    workedFormulaEquations: [
      "Design Occupant Load:          N_occ = Gross_or_Net_Floor_Area / Occupant_Load_Factor (NFPA 101 / IBC)",
      "Required Egress Width (Stair): W_stair_in = N_occ × 0.3 in/person   (0.2 in/person for level doors)",
      "Sprinkler Flow Demand:         Q_sprinkler = Density (gpm/ft²) × Design_Area (ft²) + Hose_Stream_Allowance"
    ],
    workedFormulaExplanation:
      "Fire protection and life safety specialists review building occupant loads, means-of-egress capacity (verifying that loss of any single exit still leaves adequate independent egress capacity and common path / travel distance compliance), and audit NFPA 25 (water-based suppression) and NFPA 72 (fire alarm) inspection, testing, and maintenance (ITM) records.",
    workedProblemStatement:
      "A 2nd-floor conference/assembly hall measures 6,000 ft² net floor area with movable chairs (Occupant Load Factor = 7 net ft²/person per NFPA 101 / IBC). Calculate the design occupant load, minimum number of independent exits required, and minimum total stair width in inches (at 0.3 in/person for an unsprinklered legacy calculation).",
    workedStepByStep: [
      "1. Compute design occupant load: N_occ = 6,000 ft² / 7 ft²/person = 857.1 ⇒ 858 occupants.",
      "2. Determine minimum number of exits: For occupant loads between 501 and 1,000 persons, at least 3 separate, remotely located exits are required (2 exits are insufficient!).",
      "3. Compute minimum total stair egress width: 858 occupants × 0.3 in/person = 257.4 inches total clear stair width distributed across the exits.",
      "4. Verify doors swing in the direction of egress travel and are equipped with listed panic hardware (since assembly load >= 50–100)."
    ],
    workedConclusion:
      "An 858-person assembly floor requires at least 3 remote exits with panic hardware and 257.4 inches of cumulative stair capacity.",
    practicalLabScenario:
      "Audit the fire protection and life safety documentation binder for a fictional 4-story mixed-use facility (floor plans, NFPA 25 sprinkler inspection reports, fire pump churn/flow test curves, NFPA 72 alarm battery/sensitivity logs, and fire door drop-test records) and produce a Deficiency & Qualified Escalation Report.",
    practicalLabTasks: [
      "Verify occupant load, exit count, exit remoteness (1/2 or 1/3 diagonal rule), travel distance, and dead-end corridor limits on the sample floor plans.",
      "Review NFPA 25 reports and flag critical impairments (a closed riser control valve, painted/loaded sprinkler heads, and 5-year internal pipe obstruction check overdue).",
      "Audit NFPA 72 fire alarm secondary battery standby calculations (24 hours standby + 5 or 15 minutes alarm) and smoke detector sensitivity test logs.",
      "Compile the Prioritized Deficiency Matrix distinguishing immediate life-safety impairments (requiring Fire Watch / AHJ notice and licensed FPE/contractor action) from routine maintenance items."
    ],
    answerKeyQuestion: {
      prompt: "During a walk-through review of a building's NFPA 25 sprinkler documentation and riser room, what is the immediate response if you discover a main zone sprinkler control valve shut (closed) without an active impairment tag or authorized work in progress?",
      options: [
        "Treat it as a critical fire protection system impairment: immediately notify building management, the qualified fire protection contractor/engineer, and the Impairment Coordinator to verify system status, implement fire watch procedures if impaired, and restore protection under NFPA 25.",
        "Paint the valve green and wait until next year's inspection.",
        "Lock the emergency exit doors so no one enters the building.",
        "Disconnect the fire alarm panel battery so the trouble buzzer stops beeping."
      ],
      correctIndex: 0,
      explanation: "Closed control valves are the #1 cause of sprinkler system failure during a fire; NFPA 25 requires immediate impairment management and restoration by qualified personnel."
    },
    careerGuidance: {
      prerequisites: "Building construction reading, hydraulics basics, electrical alarm circuits, and fire/life-safety code structure.",
      targetRoles: "Fire Protection & Life Safety Inspector Trainee, Fire Alarm / Suppression ITM Coordinator, Facility Life Safety Compliance Specialist, Fire Engineering CAD/BIM Technician.",
      qualificationsAndNextSteps: "NFPA Certified Fire Protection Specialist (CFPS), NICET Water-Based Systems / Fire Alarm Systems Levels I–IV, ICC Fire Inspector I/II, PE Fire Protection."
    },
    mentorReviewCriteria: [
      "Egress calculations accurately apply Occupant Load Factors and minimum number of exits (<500 = 2, 501–1000 = 3, >1000 = 4).",
      "NFPA 25 / 72 review clearly separates Critical Impairments from Non-Critical Deficiencies.",
      "Report explicitly escalates design modifications and code interpretations to a licensed Fire Protection Engineer (FPE) and the AHJ."
    ],
    principalReferences: [
      {
        title: "U.S. Fire Administration (USFA) & NFPA 101 / NFPA 25 / NFPA 72 Technical Codes Overview",
        organization: "FEMA U.S. Fire Administration / NFPA",
        url: "https://www.usfa.fema.gov/prevention/",
        summary: "Authoritative national references for fire prevention, life safety egress, water-based suppression inspection (NFPA 25), and fire alarm signaling (NFPA 72)."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 13: LAW, COMPLIANCE AND DIGITAL EVIDENCE (51-53)
  // --------------------------------------------------------------------------
  {
    careerNumber: 51,
    id: "spec-career-51-legal-technology-ediscovery",
    title: "Legal Technology and E-Discovery",
    domainNumber: 13,
    domainTitle: "13. Law, compliance and digital evidence",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    tangibleEvidenceType: "Litigation Hold & Custodian Map, SHA-256 Metadata Preservation Log, EDRM Cull/Deduplication Report & Production Load File",
    coreCurriculumBullets: [
      "Electronic evidence identification",
      "Document preservation and collection",
      "Metadata and file integrity",
      "Review workflows and privilege concepts",
      "Litigation hold procedures",
      "Evidence production and audit trails"
    ],
    capstoneProject: "Organize a simulated document collection and produce a defensible evidence inventory.",
    regulatoryBoundaryNote:
      "Legal Practice Boundary Notice: This pathway teaches technical E-Discovery (EDRM), digital evidence preservation, metadata handling, and litigation support workflows. It does NOT constitute legal advice or authorize the practice of law; legal strategy, privilege determinations, and court filings must be directed by licensed legal counsel.",
    workedFormulaTitle: "EDRM Deduplication/Culling Ratio, Recall/Precision in TAR & Production Volume",
    workedFormulaEquations: [
      "Deduplication Reduction (%):   R_dedup = [ 1 - (Unique_Docs_By_SHA256 / Raw_Collected_Docs) ] × 100%",
      "Family-Inclusive Cull Volume:  V_review = Count(Docs_Matching_Keywords_And_Date ∪ All_Parent_Child_Attachments)",
      "Privilege Redaction Rule:      Produce_Bates(Doc) ∩ Unredacted_Privileged_Content = ∅"
    ],
    workedFormulaExplanation:
      "E-Discovery specialists follow the Electronic Discovery Reference Model (EDRM: Identification → Preservation → Collection → Processing → Review → Analysis → Production), preserve original file system and email header metadata via forensic collection (never opening and re-saving files, which alters `Date Modified`), deduplicate by cryptographic MD5/SHA-256 hash while keeping parent-attachment document families intact, and log withheld privileged items on a Privilege Log.",
    workedProblemStatement:
      "A forensic collection across 8 custodians gathers 250,000 raw files (180 GB). Global SHA-256 deduplication removes 35% of the files, date-range and NIST-de-nisting filtering removes 40% of the remaining unique files, and keyword search hits (including full email-attachment families) select 20% of the date-filtered pool for attorney review. How many documents enter the attorney review queue?",
    workedStepByStep: [
      "1. After 35% global SHA-256 deduplication: 250,000 × (1 - 0.35) = 162,500 unique documents.",
      "2. After 40% date-range and system-file (NIST list) culling: 162,500 × (1 - 0.40) = 97,500 documents.",
      "3. After 20% family-inclusive keyword hit selection: 97,500 × 0.20 = 19,500 documents entering attorney review.",
      "4. Overall volume reduction prior to review: (250,000 - 19,500) / 250,000 = 92.2% defensible reduction with complete audit trail."
    ],
    workedConclusion:
      "Defensible SHA-256 deduplication, date filtering, and family-inclusive keyword culling reduce the review set by 92.2% to 19,500 documents.",
    practicalLabScenario:
      "Manage a simulated corporate contract-dispute E-Discovery matter across 5 custodians: draft the technical Litigation Hold preservation checklist, audit a 500-document sample collection for metadata preservation and parent-child email attachment integrity, generate a Bates-numbered production load file (`.DAT` / `.OPT`), and compile a Privilege Log.",
    practicalLabTasks: [
      "Create a Custodian Data Map covering Exchange/M365 email, Slack/Teams chat exports, cloud drives, and mobile devices, and suspend auto-delete retention policies.",
      "Verify SHA-256 hash values and original file metadata (`DateCreated`, `DateModified`, `Author`, `Message-ID`, `ParentID`) across the collected evidence.",
      "Apply family-inclusive search filters so that if an attachment matches a search term, its parent email and sibling attachments remain linked together.",
      "Produce a validated Concordance/Relativity `.DAT` metadata load file, Bates-stamped TIFF/PDF + native Excel production set, and a Privilege Log for withheld attorney-client communications."
    ],
    answerKeyQuestion: {
      prompt: "Why is asking a custodian employee to manually 'forward relevant emails to the legal team' or 'drag-and-drop Word files onto a USB thumb drive' a major E-Discovery preservation error?",
      options: [
        "Forwarding emails or copying files via standard OS drag-and-drop alters original system/header metadata (such as Date Created/Modified, sender routing headers, and BCC fields), risks self-selection spoliation, and breaks cryptographic hash traceability.",
        "Because USB thumb drives cannot store PDF files.",
        "Because courts require all emails to be printed on paper and faxed.",
        "Metadata has no relevance in digital evidence."
      ],
      correctIndex: 0,
      explanation: "Forensically sound collection tools preserve original timestamps, email headers, folder paths, and cryptographic hashes without spoliation."
    },
    careerGuidance: {
      prerequisites: "File systems & email architectures, database/SQL search syntax, Boolean/regex queries, and strict quality assurance.",
      targetRoles: "E-Discovery Project Analyst, Litigation Support Specialist, Digital Evidence & Forensics Coordinator, Legal Operations Technologist.",
      qualificationsAndNextSteps: "ACEDS CEDS (Certified E-Discovery Specialist), Relativity Certified Administrator (RCA), EDRM framework mastery."
    },
    mentorReviewCriteria: [
      "Collection audit proves zero alteration of original file modification timestamps and preserves SHA-256 hashes.",
      "Parent-child family relationships (email + attachments) are never broken during deduplication or production.",
      "Final production QC verifies zero unredacted privileged documents or hidden speaker-notes/tracked-changes leaks in TIFF/native exports."
    ],
    principalReferences: [
      {
        title: "EDRM (Electronic Discovery Reference Model) & The Sedona Conference Principles",
        organization: "EDRM / The Sedona Conference / NIST CFTT",
        url: "https://edrm.net/",
        summary: "Industry standard framework for defensible identification, preservation, collection, processing, review, and production of electronically stored information (ESI)."
      }
    ]
  },
  {
    careerNumber: 52,
    id: "spec-career-52-regulatory-compliance-policy-operations",
    title: "Regulatory Compliance and Policy Operations",
    domainNumber: 13,
    domainTitle: "13. Law, compliance and digital evidence",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    tangibleEvidenceType: "Unified Regulatory Control Matrix, Policy/SOP Governance Hierarchy, TOD/TOE Audit Workpapers & Remediation Package",
    coreCurriculumBullets: [
      "Regulatory obligation mapping",
      "Policy and procedure development",
      "Control testing",
      "Evidence collection",
      "Audit findings and corrective action",
      "Compliance reporting and change management"
    ],
    capstoneProject: "Build a control matrix and compliance evidence package for a fictional company.",
    workedFormulaTitle: "Control Testing Sample Size, Exception Rate & Harmonized Control Coverage",
    workedFormulaEquations: [
      "Audit Sample Exception Rate:    E_rate = (Failed_Sample_Items / Total_Sampled_Population) × 100%",
      "Cross-Framework Harmonization:  1_Internal_Control → Maps_To { NIST_800_53, ISO_27001, SOC_2, GDPR/HIPAA }"
    ],
    workedFormulaExplanation:
      "Compliance operations specialists translate external statutory/regulatory citations into a Unified Control Matrix ('test once, comply many'), distinguish Test of Design (TOD — does the control as designed prevent/detect the risk?) from Test of Operating Effectiveness (TOE — did the control actually operate consistently across the 6–12 month audit period?), and track Corrective Action Plans (CAPs).",
    workedProblemStatement:
      "An organization must comply with SOC 2 (CC6.2), ISO 27001 (A.5.18), and NIST SP 800-53 (AC-2) requiring that terminated employees have all system access revoked within 24 hours of separation. During an annual Test of Operating Effectiveness (TOE), 85 employees were terminated during the year; the compliance analyst tests a random sample of 25 terminations and finds 3 instances where access remained active for 4 to 9 days. Compute the sample exception rate and classify the audit result.",
    workedStepByStep: [
      "1. Compute sample exception rate: 3 exceptions / 25 sampled terminations = 12.0% failure rate.",
      "2. Distinguish TOD vs. TOE: The written policy and HR-to-IT ticket workflow exist (Test of Design passes), BUT a 12.0% failure rate across the audit period means the Test of Operating Effectiveness (TOE) FAILS.",
      "3. Root-cause investigation: Contractors and off-cycle Friday terminations bypassed the automated HRIS webhook.",
      "4. Corrective Action Plan (CAP): Automate IAM de-provisioning directly from HRIS status change + run a daily reconciliation script comparing active AD/SSO accounts against active HR roster."
    ],
    workedConclusion:
      "A 12.0% sample exception rate (3 of 25) constitutes an Operating Effectiveness deficiency requiring automated HRIS-to-IAM termination triggers and daily reconciliation.",
    practicalLabScenario:
      "Build a harmonized Unified Control Matrix mapping 10 core operational controls across NIST SP 800-53, ISO 27001, and SOC 2 for a fictional SaaS/financial services company, evaluate an audit evidence bundle for TOD and TOE, and author a formal Audit Findings & Corrective Action Report.",
    practicalLabTasks: [
      "Map 10 regulatory obligations into a Unified Control Matrix with specific control owners, frequencies, and evidence artifact definitions.",
      "Author a clear Policy → Standard → Procedure hierarchy document with version control and exception-waiver governance.",
      "Inspect 20 supplied evidence artifacts (access reviews, change-management tickets, backup logs, vendor reviews) to verify population completeness, timestamps, and reviewer sign-off.",
      "Document 3 formal Audit Findings (Condition, Criteria, Cause, Effect/Risk, and Management Corrective Action Plan with target dates)."
    ],
    answerKeyQuestion: {
      prompt: "During an audit Test of Operating Effectiveness (TOE) covering a 12-month review period, why is an un-dated screenshot of a single configuration screen without a system-generated population query or timestamp insufficient audit evidence?",
      options: [
        "An un-dated screenshot does not prove when the screenshot was taken, which production system it came from, or whether the control operated consistently across the entire 12-month audit period.",
        "Because auditors only accept handwritten sticky notes.",
        "Screenshots are illegal in SOC 2 audits.",
        "Test of Design and Test of Operating Effectiveness never require evidence."
      ],
      correctIndex: 0,
      explanation: "Defensible audit evidence (IPE — Information Produced by the Entity) must demonstrate source system authenticity, timestamp/period coverage, and population completeness."
    },
    careerGuidance: {
      prerequisites: "Regulatory reading comprehension, IT/business process literacy, internal audit methodology, and structured documentation.",
      targetRoles: "Regulatory Compliance Analyst, GRC Operations Specialist, Internal Controls & Policy Coordinator, IT Audit & Assurance Associate.",
      qualificationsAndNextSteps: "ISACA CISA (Certified Information Systems Auditor) / CRISC, SCCE CCEP (Certified Compliance & Ethics Professional), ISO 27001 Lead Auditor."
    },
    mentorReviewCriteria: [
      "Unified Control Matrix maps each internal control statement to concrete, verifiable evidence artifacts.",
      "Audit findings follow the standard 5-C structure (Condition, Criteria, Cause, Consequence/Effect, Corrective Action).",
      "Clear boundary maintained between operational compliance coordination and formal legal counsel opinions."
    ],
    principalReferences: [
      {
        title: "NIST SP 800-53A Rev. 5: Assessing Security and Privacy Controls in Information Systems",
        organization: "NIST",
        url: "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final",
        summary: "Authoritative assessment procedures (Examine, Interview, Test) for verifying control design and operating effectiveness."
      }
    ]
  },
  {
    careerNumber: 53,
    id: "spec-career-53-digital-identity-biometrics-privacy",
    title: "Digital Identity, Biometrics and Privacy Engineering",
    domainNumber: 13,
    domainTitle: "13. Law, compliance and digital evidence",
    academyId: "academy-1-cybersecurity-specialist",
    coverImage: "/images/connectln-studies/agentic-mcp-cover.jpg",
    tangibleEvidenceType: "NIST 800-63 IAL/AAL Architecture, Biometric FAR/FRR Subgroup Fairness Evaluation & Privacy Impact Assessment (PIA)",
    coreCurriculumBullets: [
      "Identity proofing and authentication",
      "Biometrics fundamentals",
      "Privacy-by-design principles",
      "Consent and data minimization",
      "Identity fraud risks",
      "Security and privacy impact assessments"
    ],
    capstoneProject: "Assess a fictional identity-verification system for security, accessibility, privacy, and fairness.",
    workedFormulaTitle: "Biometric False Match Rate (FMR / FAR), False Non-Match Rate (FNMR / FRR) & Demographic Equity",
    workedFormulaEquations: [
      "False Match Rate (Security Risk):     FMR = False_Impostor_Accepts / Total_Impostor_Comparisons",
      "False Non-Match Rate (Usability):     FNMR = False_Genuine_Rejects / Total_Genuine_Comparisons",
      "Equal Error Rate (EER):               Operating threshold τ* where FMR(τ*) == FNMR(τ*)"
    ],
    workedFormulaExplanation:
      "Identity and privacy engineers design systems around NIST SP 800-63-3/4 Assurance Levels (IAL for identity proofing, AAL for Phishing-Resistant FIDO2/WebAuthn authentication), evaluate biometric Presentation Attack Detection (PAD / liveness) and FMR/FNMR demographic differentials, and enforce Privacy-by-Design (stores salted cryptographic templates or on-device passkeys rather than raw centrally stored biometric images).",
    workedProblemStatement:
      "A remote identity-verification system tests 10,000 impostor spoofing attempts and 10,000 genuine user verifications at similarity threshold τ = 0.75. It mistakenly accepts 25 impostors and mistakenly rejects 180 genuine users (with FNMR = 0.8% on Demographic Group A vs. 3.6% on Demographic Group B, and no non-biometric fallback path for users with visual or motor disabilities). Calculate overall FMR, overall FNMR, and identify the three critical assurance/privacy/fairness defects.",
    workedStepByStep: [
      "1. Overall False Match Rate (FMR): 25 / 10,000 = 0.0025 = 0.25%.",
      "2. Overall False Non-Match Rate (FNMR): 180 / 10,000 = 0.0180 = 1.80%.",
      "3. Defect 1 (Demographic Bias): Group B experiences a 4.5× higher false rejection rate (3.6% vs 0.8%) than Group A.",
      "4. Defect 2 (Accessibility Exclusion): Lack of an alternative verification pathway locks out users who cannot complete the biometric gesture.",
      "5. Defect 3 (Privacy Risk): Storing raw facial video and unredacted government ID images indefinitely in a central cloud bucket violates data minimization; enforce immediate deletion/tokenization after verification and FIDO2 passkey binding."
    ],
    workedConclusion:
      "Quantitative FMR (0.25%), FNMR (1.80%), and subgroup differential analysis (4.5× disparity) expose biometric fairness, accessibility, and data-retention risks requiring immediate remediation.",
    practicalLabScenario:
      "Conduct a comprehensive Security, Privacy, Accessibility, and Fairness Assessment (including a formal Privacy Impact Assessment / DPIA) on a fictional remote onboarding and biometric authentication platform, and architect a NIST SP 800-63 & NIST Privacy Framework remediation plan.",
    practicalLabTasks: [
      "Evaluate the system's Identity Assurance Level (IAL2) and Authenticator Assurance Level (AAL2/AAL3 phishing-resistant FIDO2/WebAuthn) architecture.",
      "Compute overall and demographic-subgroup FMR, FNMR, and Presentation Attack Detection (PAD) spoof error rates from the test dataset.",
      "Map personal data flows and apply Privacy-by-Design controls (data minimization, purpose limitation, explicit consent, TTL retention deletion, and local/cancelable biometric templates).",
      "Verify accessible alternative identity-proofing pathways and publish the Privacy & Equity Impact Assessment (PIA)."
    ],
    answerKeyQuestion: {
      prompt: "Why is storing raw, unencrypted biometric images (such as raw fingerprint scans or facial geometry databases) in a centralized server much riskier than storing salted password hashes or on-device FIDO2 cryptographic public keys?",
      options: [
        "Biometrics are permanently tied to a human body and cannot be rotated or re-issued like a compromised password; if a centralized raw biometric database is breached, those biometric identifiers are compromised for life.",
        "Because biometric images take up zero bytes of disk space.",
        "Because FIDO2 passkeys send the user's fingerprint image across the internet on every login.",
        "Passwords can never be changed once created."
      ],
      correctIndex: 0,
      explanation: "In FIDO2/WebAuthn, the biometric unlock stays strictly inside the user's local device Secure Enclave/TPM and never leaves the device — only a cryptographic signature using a site-specific private key is transmitted."
    },
    careerGuidance: {
      prerequisites: "Identity protocols (OIDC, SAML, FIDO2/WebAuthn), privacy engineering principles, statistical evaluation, and security architecture.",
      targetRoles: "Privacy Engineer, Digital Identity & Biometrics Assurance Specialist, Trust & Safety Architect, Data Protection / DPIA Analyst.",
      qualificationsAndNextSteps: "IAPP CIPT (Certified Information Privacy Technologist) / CIPP, NIST SP 800-63 Digital Identity Guidelines, FIDO Alliance certifications."
    },
    mentorReviewCriteria: [
      "Biometric evaluation reports both FMR and FNMR across demographic subgroups (per NIST FRVT / FRTE methodology).",
      "Architecture enforces data minimization, explicit retention limits, and non-discriminatory fallback verification paths.",
      "Authentication design favors phishing-resistant FIDO2/WebAuthn passkeys over SMS OTP."
    ],
    principalReferences: [
      {
        title: "NIST SP 800-63 Digital Identity Guidelines & NIST Privacy Framework",
        organization: "National Institute of Standards and Technology (NIST)",
        url: "https://pages.nist.gov/800-63-3/",
        summary: "Technical standards for identity proofing, authentication assurance, biometric evaluation, and privacy risk engineering."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // DOMAIN 14: MORE SPECIALIST CAREERS WORTH ADDING (54-60)
  // --------------------------------------------------------------------------
  {
    careerNumber: 54,
    id: "spec-career-54-technical-sales-engineering",
    title: "Technical Sales Engineering",
    domainNumber: 14,
    domainTitle: "14. Specialist professional, conservation, food & workforce systems",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/business-capstone-cover.jpg",
    tangibleEvidenceType: "Technical Discovery & Requirements Matrix, Reference Solution Architecture, PoC Success Plan & ROI Proposal Package",
    coreCurriculumBullets: [
      "Product specifications, demonstrations, solution design, requirements discovery, and proposals."
    ],
    capstoneProject: "Present a technical solution to a fictional client.",
    workedFormulaTitle: "Client Return on Investment (ROI), Payback Period & Sizing Capacity Margin",
    workedFormulaEquations: [
      "Annual Net Benefit:      B_net = Annual_Operational_Savings - Annual_Subscription_And_Support_Cost",
      "3-Year ROI (%):          ROI = [ (3 × B_net - C_implementation) / (C_implementation + 3 × C_annual) ] × 100%",
      "Payback Period (Months): t_payback = (C_implementation / B_net) × 12"
    ],
    workedFormulaExplanation:
      "Technical Sales Engineers (Solutions Architects / Pre-Sales Engineers) bridge engineering and commercial teams by conducting structured technical discovery, mapping client pain points to verifiable product capabilities (honestly documenting product boundaries without over-promising), running time-boxed Proofs of Concept (PoCs) with measurable success criteria, and quantifying business ROI.",
    workedProblemStatement:
      "A prospective manufacturing client loses $320,000/year to unplanned quality rework and manual inspection labor. Your proposed automated inspection platform requires $60,000 in one-time onboarding/integration and $80,000/year in licensing and support, and validated PoC benchmarks show a 75% reduction in the $320,000 loss. Calculate Annual Gross Savings, Annual Net Benefit, and Simple Payback in months.",
    workedStepByStep: [
      "1. Compute Annual Gross Savings: 75% × $320,000 = $240,000/year.",
      "2. Subtract recurring annual licensing/support ($80,000/yr): Annual Net Benefit B_net = $240,000 - $80,000 = $160,000/year.",
      "3. Compute Simple Payback on the $60,000 upfront implementation cost: ($60,000 / $160,000/yr) × 12 months = 4.5 months.",
      "4. Document all PoC throughput, network bandwidth, and integration assumptions transparently in the Statement of Work (SOW)."
    ],
    workedConclusion:
      "The solution delivers $160,000/year net savings after recurring costs and achieves payback on implementation in 4.5 months.",
    practicalLabScenario:
      "Review a fictional enterprise client's discovery transcript and technical RFP for an industrial telemetry & analytics platform, design the reference integration architecture, define a 14-day Proof of Concept (PoC) Mutual Success Plan, and build the Technical Proposal & Executive Demo Deck.",
    practicalLabTasks: [
      "Complete the Technical Discovery Matrix separating Functional Requirements, Non-Functional (Security/Latency/Scale) Requirements, and Current-State Pain Points.",
      "Complete the RFP Compliance Matrix honestly marking items as `Supported Out-of-the-Box`, `Supported via API/Configuration`, `Roadmap`, or `Not Supported`.",
      "Author a 14-day PoC Charter with 4 measurable pass/fail acceptance tests.",
      "Build the Solution Architecture Diagram, Bill of Materials (BoM), 3-Year ROI Model, and 15-minute Demo Script."
    ],
    answerKeyQuestion: {
      prompt: "During a competitive enterprise RFP and live technical demonstration, what should a Sales Engineer do when a client asks for a specific regulatory or technical feature that the product does NOT currently support?",
      options: [
        "State clearly and honestly that the feature is not natively supported today, explain any validated workaround or partner integration, and log the gap with Product Management — never claim an unbuilt feature exists just to win the deal.",
        "Promise the client that the feature is already built and hope they don't notice until after signing the contract.",
        "Hard-code a fake button in the demo that does nothing in production.",
        "Ignore the security team's questions completely."
      ],
      correctIndex: 0,
      explanation: "Pre-sales integrity is critical: misrepresenting product capabilities leads to failed implementations, contract breach claims, and destroyed trust."
    },
    careerGuidance: {
      prerequisites: "Strong technical foundation (software/cloud/hardware/industrial systems), architecture diagramming, financial ROI literacy, and presentation skills.",
      targetRoles: "Sales Engineer (SE), Solutions Architect (Pre-Sales), Technical Account Manager (TAM), Customer Solutions Engineer.",
      qualificationsAndNextSteps: "PreSales Collective certifications, Cloud Solutions Architect credentials (AWS/Azure/GCP), Demo2Win / Great Demo methodology."
    },
    mentorReviewCriteria: [
      "Demo flow leads with solving the client's specific business problem rather than a generic feature-by-feature menu tour.",
      "Architecture diagram clearly specifies security boundaries, API protocols, and customer vs. vendor responsibilities.",
      "RFP responses and ROI assumptions are 100% factual and delivery-verified."
    ],
    principalReferences: [
      {
        title: "NIST Baldrige Performance Excellence Framework & Enterprise Systems Engineering Guides",
        organization: "NIST / Industry Solutions Architecture Standards",
        url: "https://www.nist.gov/baldrige",
        summary: "Frameworks for aligning technical solutions, customer requirements, measurable value delivery, and operational quality."
      }
    ]
  },
  {
    careerNumber: 55,
    id: "spec-career-55-grant-writing-program-development",
    title: "Grant Writing and Program Development",
    domainNumber: 14,
    domainTitle: "14. Specialist professional, conservation, food & workforce systems",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    tangibleEvidenceType: "Notice of Funding Opportunity (NOFO) Compliance Matrix, Program Logic Model, Line-Item Budget + Narrative & Evaluation Plan",
    coreCurriculumBullets: [
      "Funding research, proposal writing, budgets, evaluation plans, and compliance."
    ],
    capstoneProject: "Prepare a complete sample grant application.",
    workedFormulaTitle: "Direct vs. Indirect (F&A) Cost Allocation, Cost-Share Match & Cost Per Beneficiary",
    workedFormulaEquations: [
      "Modified Total Direct Costs (MTDC):  Indirect_Cost = Rate_NICRA × MTDC_Base",
      "Total Project Budget:                Total = Direct_Costs + Indirect_Costs  =  Grant_Request + NonFederal_Match",
      "Required Cost-Share Match:           Match_Required = Grant_Award × Match_Percentage"
    ],
    workedFormulaExplanation:
      "Grant writers and program developers align community/scientific needs with funder priorities (NOFO/RFP scoring criteria), construct Logic Models (`Inputs → Activities → Outputs → Short/Long-Term Outcomes`), reconcile every line item in the spreadsheet budget with the written Budget Justification Narrative, and comply with 2 CFR 200 Uniform Guidance cost principles (Allowable, Allocable, Reasonable, and Consistently Treated).",
    workedProblemStatement:
      "A workforce training grant application has $200,000 in Personnel + Fringe, $30,000 in Training Supplies, and $50,000 in capital Equipment (single unit > $5,000, which is excluded from Modified Total Direct Costs [MTDC]). The organization uses the 15% de minimis indirect cost rate on MTDC, and the funder requires a 20% non-federal match of total project costs. Calculate Total Direct Costs, MTDC, Indirect Costs, Total Project Cost, Funder Request, and Required Match.",
    workedStepByStep: [
      "1. Total Direct Costs = $200,000 (Personnel/Fringe) + $30,000 (Supplies) + $50,000 (Capital Equipment) = $280,000.",
      "2. Compute MTDC base (excluding capital equipment > $5,000): $280,000 - $50,000 = $230,000.",
      "3. Compute 15% Indirect Costs on MTDC: 0.15 × $230,000 = $34,500.",
      "4. Compute Total Project Cost: $280,000 + $34,500 = $314,500.",
      "5. Split into 20% Match ($62,900 verifiable non-federal cost share) and 80% Grant Request ($251,600)."
    ],
    workedConclusion:
      "Excluding capital equipment from the MTDC base yields $34,500 in indirect costs and a $314,500 total project budget ($251,600 grant request + $62,900 match).",
    practicalLabScenario:
      "Develop a complete, submission-ready Grant Application Package in response to a simulated federal/foundation Notice of Funding Opportunity (NOFO) for a regional technical skills training or community infrastructure program.",
    practicalLabTasks: [
      "Build a NOFO Eligibility & Scoring Rubric Checklist mapping every required narrative section and page limit.",
      "Construct a Program Logic Model distinguishing quantifiable Outputs (e.g., 120 trainees enrolled, 1,440 lab hours delivered) from measurable Outcomes (e.g., 85% competency pass rate, 75% job placement within 6 months).",
      "Prepare a 12-month Line-Item Budget Spreadsheet and matching Budget Narrative (Personnel FTE %, Fringe, Travel, Equipment, Supplies, Contractual, and Indirect Costs).",
      "Write the Program Evaluation, Risk Mitigation, and Post-Award 2 CFR 200 Compliance Plan."
    ],
    answerKeyQuestion: {
      prompt: "In program design and grant evaluation logic models, what is the critical difference between a program 'Output' and a program 'Outcome'?",
      options: [
        "Outputs are the direct volume counts of activities delivered (e.g., '40 workshops held for 200 participants'), whereas Outcomes measure the demonstrable change in skill, behavior, condition, or performance resulting from those activities (e.g., '165 participants passed the practical competency exam and reduced workplace defect rates by 30%').",
        "Outputs and Outcomes both mean the total dollar amount spent on office rent.",
        "Grant reviewers prefer proposals that have zero measurable metrics.",
        "A Budget Narrative does not need to match the numbers in the budget spreadsheet."
      ],
      correctIndex: 0,
      explanation: "Funders evaluate whether activities produce measurable outcomes, and every dollar in the budget spreadsheet must reconcile identically with the written Budget Justification."
    },
    careerGuidance: {
      prerequisites: "Research & persuasive technical writing, spreadsheet budgeting, program evaluation design, and federal/foundation grant regulations.",
      targetRoles: "Grant Writer & Proposal Manager, Program Development Specialist, Sponsored Projects / Grants Compliance Administrator, Nonprofit & Public Sector Development Lead.",
      qualificationsAndNextSteps: "GPCI GPC (Grant Professional Certified), CGMS (Certified Grant Management Specialist), 2 CFR Part 200 Uniform Guidance mastery."
    },
    mentorReviewCriteria: [
      "100% mathematical reconciliation between the Line-Item Budget table, Budget Narrative prose, and Abstract summary.",
      "Need Statement uses cited, current local/national demographic and baseline data.",
      "Logic model defines SMART outcomes and realistic data collection instruments."
    ],
    principalReferences: [
      {
        title: "Grants.gov Applicant Learning Center & 2 CFR Part 200 Uniform Administrative Requirements",
        organization: "Grants.gov / U.S. Office of Management and Budget (OMB)",
        url: "https://www.grants.gov/learn-grants",
        summary: "Official federal guidance on grant lifecycles, Notice of Funding Opportunities (NOFOs), cost principles, and post-award compliance."
      }
    ]
  },
  {
    careerNumber: 56,
    id: "spec-career-56-museum-cultural-heritage-conservation",
    title: "Museum and Cultural Heritage Conservation",
    domainNumber: 14,
    domainTitle: "14. Specialist professional, conservation, food & workforce systems",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/certifications-hub-cover.jpg",
    tangibleEvidenceType: "Object Condition Assessment Report, Preventive Environmental Log (Lux-Hours/RH/Temp), Dublin Core Archive Record & Conservation Plan",
    coreCurriculumBullets: [
      "Collection care, condition assessment, preservation, cataloging, and digital archives."
    ],
    capstoneProject: "Create a conservation and documentation plan.",
    regulatoryBoundaryNote:
      "Conservation Ethics Notice: Preventive collections care, condition documentation, and archival cataloging can be practiced safely; however, invasive interventive chemical/structural treatments on original cultural artifacts must only be performed by accredited professional conservators following AIC Code of Ethics principles (minimal intervention, documentation, and reversibility/retreatability).",
    workedFormulaTitle: "Cumulative Light Exposure (Lux-Hours) & Relative Humidity Fluctuation Control",
    workedFormulaEquations: [
      "Annual Cumulative Light Dose:  Dose (lux·hr/yr) = Illuminance (lux) × Hours_per_Day × Days_per_Year",
      "Reciprocity Principle:         100 lux × 5 hr = 50 lux × 10 hr = 500 lux·hours cumulative photochemical damage"
    ],
    workedFormulaExplanation:
      "Collections care and conservation specialists control the 10 Agents of Deterioration (physical forces, thieves/vandals, fire, water, pests, pollutants, light/UV radiation, incorrect temperature, incorrect relative humidity, and dissociation/loss of metadata), limiting highly light-sensitive works on paper, textiles, and dyed artifacts to <= 50 lux and <= 50,000–150,000 lux-hours per year with UV < 75 µW/lumen.",
    workedProblemStatement:
      "A historic 19th-century watercolor and manuscript collection (highly sensitive class: maximum recommended annual light exposure = 50,000 lux·hours/year at <= 50 lux with UV filtering) is proposed for display 8 hours/day, 300 days/year under gallery lighting measured at 150 lux. Calculate the proposed annual lux-hour dose and redesign the exhibition lighting and rotation schedule.",
    workedStepByStep: [
      "1. Compute proposed annual exposure at 150 lux for 8 hr/day × 300 days (2,400 hr/yr): 150 lux × 2,400 hr = 360,000 lux·hours/yr.",
      "2. Compare against the 50,000 lux·hr/yr preservation limit: 360,000 lux·hr exceeds the safe annual dose by 7.2× (causing irreversible fading and cellulose embrittlement).",
      "3. Redesign Step A: Dim gallery LEDs to 50 lux with zero UV (< 10 µW/lm) and install occupancy-sensor dimming.",
      "4. Redesign Step B: Limit display rotation of each original manuscript page to 125 days/year (1,000 hours × 50 lux = 50,000 lux·hr/yr) and display high-resolution archival facsimiles or rotated pages for the remainder of the year."
    ],
    workedConclusion:
      "Reducing illuminance from 150 lux to 50 lux and rotating pages after 1,000 display hours caps cumulative exposure at 50,000 lux·hr/yr.",
    practicalLabScenario:
      "Evaluate a simulated museum/archive collection of 10 historical objects (parchment manuscripts, silver/copper-alloy metalwork, polychrome wood, and glass-plate photographic negatives) using thermo-hygrometer data logs, light/UV meter readings, and high-resolution photographs, and produce a Preventive Conservation, Cataloging & Digital Preservation Plan.",
    practicalLabTasks: [
      "Complete a standardized Object Condition Assessment Report (mapping abrasion, foxing, active bronze disease/corrosion, and flaking media without touching fragile surfaces).",
      "Analyze 12-month gallery and storage Relative Humidity (%RH) and Temperature logs to diagnose diurnal RH swings causing hygroscopic wood warping.",
      "Catalog all 10 items using Dublin Core / Spectrum metadata standards (Accession Number, Provenance, Materials, Dimensions, Location, and Rights) to prevent dissociation.",
      "Specify archival acid-free/lignin-free housing (PAT-passed enclosures) and a 3-2-1 FADGI/LOC digital archive master preservation workflow (uncompressed TIFF + SHA-256 fixity)."
    ],
    answerKeyQuestion: {
      prompt: "Among the 10 Agents of Deterioration in museum and archival collections management, what is 'Dissociation' and why is it considered just as destructive as physical damage?",
      options: [
        "Dissociation is the loss of an object's accession number, catalog record, provenance, or contextual documentation — turning a priceless historical or scientific artifact into an unidentifiable, orphaned object with lost research value.",
        "Dissociation is a type of LED lightbulb.",
        "It means storing paper in acid-free boxes.",
        "Catalog records are only needed if an object is sold at auction."
      ],
      correctIndex: 0,
      explanation: "Without persistent physical numbering and linked metadata records, an artifact's historical provenance, legal ownership, and scientific context are permanently lost."
    },
    careerGuidance: {
      prerequisites: "Art history / anthropology / archival science or chemistry fundamentals, meticulous documentation, and collections handling care.",
      targetRoles: "Collections Manager, Museum Registrar, Archival Preservation Specialist, Conservation Technician, Digital Heritage Archivist.",
      qualificationsAndNextSteps: "Society of American Archivists (SAA) Digital Archives Specialist (DAS), AIC preventive care training, MA/MS in Museum Studies, Library/Archival Science, or Art Conservation."
    },
    mentorReviewCriteria: [
      "Condition report uses precise, objective visual terminology and separates preventive care from interventive treatment.",
      "Environmental plan matches target %RH and lux-hour limits to specific material sensitivities (metals vs. organic wood/paper/textiles).",
      "Catalog metadata schema enforces persistent unique identifiers and digital fixity checksums."
    ],
    principalReferences: [
      {
        title: "National Park Service (NPS) Museum Handbook & Library of Congress Preservation Guidelines",
        organization: "U.S. National Park Service / Canadian Conservation Institute (CCI) / AIC",
        url: "https://www.nps.gov/museum/publications/handbook.html",
        summary: "Comprehensive reference standard for museum collections care, environmental monitoring, condition reporting, and archival preservation."
      }
    ]
  },
  {
    careerNumber: 57,
    id: "spec-career-57-food-manufacturing-food-safety",
    title: "Food Manufacturing and Food Safety",
    domainNumber: 14,
    domainTitle: "14. Specialist professional, conservation, food & workforce systems",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/grc-governance-cover.jpg",
    tangibleEvidenceType: "HACCP / HARPC Food Safety Plan, CCP Thermal/Sanitation Monitoring Log, Lot Traceability Recall Tree & Incident Investigation Report",
    coreCurriculumBullets: [
      "Hazard analysis, sanitation, traceability, quality control, and production processes."
    ],
    capstoneProject: "Investigate a simulated product-quality incident.",
    workedFormulaTitle: "Thermal Pasteurization / Cooking Critical Limit, Sanitation Dilution & Mass-Balance Recall Traceability",
    workedFormulaEquations: [
      "Decimal Reduction (D-value):   Log_Reduction = t_hold / D_T   (e.g., 5-log or 6.5-log pathogen lethality)",
      "Sanitizer Dilution Balance:    C_1 × V_1 = C_2 × V_2   (ppm concentration check)",
      "Recall Mass Reconciliation:    M_produced = M_in_warehouse + M_in_transit + M_at_customers + M_rework_scrap"
    ],
    workedFormulaExplanation:
      "Food safety and quality assurance specialists identify Biological, Chemical (including Undeclared Allergens), and Physical hazards under FDA FSMA (21 CFR Part 117 Preventive Controls) and USDA HACCP, monitor Critical Control Points (CCPs: cooking lethality temperature/time, chilling rate, metal detection, allergen sanitation changeover), and maintain 1-step-back / 1-step-forward lot traceability.",
    workedProblemStatement:
      "A ready-to-eat (RTE) soup line has a validated Cooking Critical Control Point (CCP-1) requiring every batch to reach >= 74.0°C (165°F) for at least 15 seconds to achieve a 5-log reduction of Listeria monocytogenes / Salmonella. Batch #2026-1020-B4 records a peak hold temperature of 68.5°C for 12 seconds due to a steam valve pressure drop, and 400 cases were packaged before the chart recorder was reviewed. State the required HACCP/FSMA corrective action and calculate sanitizer volume V_1 of a 12.5% (125,000 ppm) stock solution needed to prepare 500 L of a 200 ppm food-contact sanitizing rinse.",
    workedStepByStep: [
      "1. Evaluate CCP-1 deviation: 68.5°C for 12 s FAILS the validated Critical Limit (>= 74.0°C for >= 15 s).",
      "2. Mandatory CCP Corrective Action: Immediately place all 400 cases of Batch #2026-1020-B4 on Quality Hold (do NOT ship!), repair the steam pressure regulator, and have a Process Authority evaluate whether the held product can be safely re-pasteurized or must be destroyed.",
      "3. Compute sanitizer concentrate volume using C_1 V_1 = C_2 V_2: (125,000 ppm) × V_1 = (200 ppm) × (500 L) = 100,000 ppm·L.",
      "4. Solve for V_1: 100,000 / 125,000 = 0.800 L (800 mL of stock concentrate diluted to 500 L total volume), verified with calibrated test strips."
    ],
    workedConclusion:
      "Batch #2026-1020-B4 must be placed on immediate CCP Hold due to sub-lethal thermal processing, and the 200 ppm sanitation rinse requires 800 mL of 12.5% concentrate per 500 L.",
    practicalLabScenario:
      "Investigate a simulated food manufacturing incident involving an undeclared allergen cross-contact risk during a line changeover and a metal-detector CCP rejection spike, trace 100% of affected ingredient and finished-product lots, and author a FSMA/HACCP Deviation & Corrective Action Report.",
    practicalLabTasks: [
      "Conduct a Hazard Analysis across 8 process steps (Receiving, Cold Storage, Batching, Thermal Cooking CCP-1, Cooling CCP-2, Packaging/Allergen Label Check CCP-3, Metal Detection CCP-4, and Shipping).",
      "Review CCP-1 thermal chart logs, CCP-2 cooling logs, ATP sanitation swab results, and CCP-4 Fe / Non-Fe / Stainless Steel test-wand challenges.",
      "Execute a 2-hour Mock Recall Traceability Exercise reconciling 100% of a contaminated spice ingredient lot across 4 finished product batches.",
      "Author the Root-Cause Investigation, Non-Conforming Product Disposition, and Preventive Control CAPA Report."
    ],
    answerKeyQuestion: {
      prompt: "In a food manufacturing facility running Peanut-Containing products followed by Peanut-Free products on the same packaging line, why is a standard water rinse alone insufficient during changeover?",
      options: [
        "Allergens are heat-stable proteins (not bacteria that can simply be killed by heat or sanitizer); changeover requires validated wet/detergent cleaning to physically remove protein residues, visual inspection, and allergen-specific swab verification before running the non-allergen product, paired with strict label barcode verification.",
        "Because boiling water turns peanut protein into sugar.",
        "Because metal detectors automatically detect peanut butter.",
        "Undeclared allergens are never a cause of Class I food recalls."
      ],
      correctIndex: 0,
      explanation: "Undeclared allergens are the leading cause of FDA Class I food recalls; thermal sanitizers kill microbes but do not destroy allergenic proteins, requiring validated physical protein removal and label controls."
    },
    careerGuidance: {
      prerequisites: "Microbiology/chemistry basics, GMPs (Good Manufacturing Practices), HACCP/FSMA principles, and meticulous record auditing.",
      targetRoles: "Food Safety & Quality Assurance (FSQA) Technician, HACCP/PCQI Coordinator, Sanitation & Allergen Control Supervisor, Food Production Quality Specialist.",
      qualificationsAndNextSteps: "FSPCA Preventive Controls Qualified Individual (PCQI), International HACCP Alliance Certification, SQF / BRCGS Practitioner."
    },
    mentorReviewCriteria: [
      "Hazard analysis addresses Biological, Chemical, Physical, and Radiological/Allergen hazards at every process step.",
      "CCP corrective action satisfies all 4 mandatory HACCP pillars (stop/quarantine product, fix process cause, evaluate product disposition, prevent recurrence).",
      "Mock recall achieves 100% mass-balance reconciliation of affected lots."
    ],
    principalReferences: [
      {
        title: "FDA Food Safety Modernization Act (FSMA) — 21 CFR Part 117 Current Good Manufacturing Practice & Preventive Controls",
        organization: "U.S. Food and Drug Administration (FDA) / USDA FSIS",
        url: "https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-preventive-controls-human-food",
        summary: "Federal regulatory standard for hazard analysis, risk-based preventive controls, allergen management, sanitation, and supply-chain traceability."
      }
    ]
  },
  {
    careerNumber: 58,
    id: "spec-career-58-education-technology-administration",
    title: "Education Technology Administration",
    domainNumber: 14,
    domainTitle: "14. Specialist professional, conservation, food & workforce systems",
    academyId: "academy-3-ai-software-engineering",
    coverImage: "/images/connectln-studies/certifications-hub-cover.jpg",
    tangibleEvidenceType: "LMS Tenant Architecture & RBAC Matrix, SAML/LTI 1.3 Integration Spec, FERPA/COPPA Privacy Audit & WCAG 2.2 AA Evaluation Report",
    coreCurriculumBullets: [
      "Learning management systems, digital accessibility, data privacy, and user support."
    ],
    capstoneProject: "Deploy and evaluate a sample digital learning environment.",
    workedFormulaTitle: "LMS Concurrent Peak Load, WCAG Color Contrast Ratio & Student Data Retention Compliance",
    workedFormulaEquations: [
      "Peak Concurrent Exam Requests/sec:  RPS_peak = (Active_Exam_Users × Requests_per_Min) / 60",
      "WCAG Relative Luminance Contrast:   Contrast_Ratio = (L_lighter + 0.05) / (L_darker + 0.05) >= 4.5 : 1 (Normal Text)",
      "Role-Based Access Control (FERPA):  Access(User_u, Record_s) == TRUE  iff  Has_Legitimate_Educational_Interest(u, s)"
    ],
    workedFormulaExplanation:
      "EdTech administrators configure Learning Management Systems (Canvas, Moodle, Blackboard, Cornerstone), integrate Single Sign-On (SAML 2.0 / OIDC), automated SIS roster provisioning (OneRoster / SCIM), and LTI 1.3 external learning tools, while strictly enforcing student data privacy (FERPA/COPPA/GDPR) and WCAG 2.2 AA accessibility.",
    workedProblemStatement:
      "A university LMS administrator is asked by an instructor to install a free third-party AI grading browser plugin that requires full read/write LMS API admin tokens, exports student names, emails, and essay submissions to an unvetted external server, and uses light-gray `#94A3B8` text on a white `#FFFFFF` background (contrast ratio = 2.56 : 1). Identify the security, privacy, and accessibility failures and specify the compliant architecture.",
    workedStepByStep: [
      "1. Security Failure: Never grant global LMS admin API tokens to a third-party plugin; use scoped LTI 1.3 Advantage with OAuth 2.0 / OIDC role and course context restrictions.",
      "2. Privacy Failure (FERPA): Exporting identifiable student education records (PII + grades/essays) to an unvetted third party without a signed Data Processing Addendum (DPA) / School Official agreement violates FERPA.",
      "3. Accessibility Failure (WCAG 1.4.3): A contrast ratio of 2.56 : 1 fails the mandatory 4.5 : 1 minimum for normal text (requiring `#475569` or darker on `#FFFFFF` to achieve >= 7.0 : 1).",
      "4. Action: Place the tool in sandbox review, require vendor HECVAT/SOC 2 + DPA execution, enforce scoped LTI 1.3 deployment, and verify VPAT / WCAG 2.2 AA conformance before production release."
    ],
    workedConclusion:
      "Production EdTech deployment requires scoped LTI 1.3 integration, a signed FERPA Data Processing Addendum, and verified >= 4.5:1 WCAG 2.2 AA accessibility.",
    practicalLabScenario:
      "Configure, audit, and evaluate a multi-department Digital Learning Environment (LMS tenant hierarchy, SIS automated roster sync, LTI 1.3 tool integration, WCAG 2.2 AA accessibility audit, and FERPA/privacy governance) and produce an EdTech Deployment & Assurance Report.",
    practicalLabTasks: [
      "Design the LMS sub-account hierarchy and Least-Privilege RBAC matrix (Student, TA, Instructor, Designer, Sub-Account Admin, Observer).",
      "Configure automated SIS roster CSV/OneRoster provisioning and troubleshoot a duplicate-user enrollment conflict.",
      "Audit a third-party LTI 1.3 tool vendor using a HECVAT (Higher Education Cloud Vendor Assessment Tool), FERPA privacy checklist, and VPAT accessibility test.",
      "Build a Tier-1 / Tier-2 / Tier-3 User Support Runbook and Final Exam Peak-Load Readiness Checklist."
    ],
    answerKeyQuestion: {
      prompt: "Why is LTI 1.3 (Learning Tools Interoperability Advantage) preferred over legacy LTI 1.1 or sharing raw LMS administrator API keys when integrating external tools into an LMS?",
      options: [
        "LTI 1.3 uses modern OAuth 2.0, OpenID Connect (OIDC), and asymmetric public/private key pairs with granularly scoped permissions (Names & Role Provisioning, Deep Linking, Assignment & Grade Services) instead of shared static secrets or over-privileged admin keys.",
        "Because LTI 1.3 disables all encryption.",
        "Because sharing the root admin password with every vendor is required by FERPA.",
        "LTI 1.3 only works on desktop computers from 1998."
      ],
      correctIndex: 0,
      explanation: "LTI 1.3 Advantage replaces shared consumer secrets with OIDC/OAuth 2.0 asymmetric cryptography and least-privilege service scopes."
    },
    careerGuidance: {
      prerequisites: "LMS administration, web technologies (HTML/CSS, JSON, REST APIs, SAML/OIDC), accessibility standards, and user support.",
      targetRoles: "EdTech Administrator, Learning Management System (LMS) Engineer, Academic Technology Specialist, Corporate Learning Platform Administrator.",
      qualificationsAndNextSteps: "1EdTech LTI 1.3 / OneRoster standards, IAAP CPACC / WAS (Web Accessibility Specialist), Canvas/Moodle Certified Admin."
    },
    mentorReviewCriteria: [
      "RBAC permissions strictly prevent instructors or TAs in one department from viewing grades or PII in unrelated courses.",
      "Accessibility evaluation tests real keyboard-only navigation, screen-reader landmarks, captions, and 4.5:1 color contrast.",
      "Vendor governance includes signed data-privacy terms and incident escalation contacts."
    ],
    principalReferences: [
      {
        title: "U.S. Department of Education Student Privacy (FERPA) & W3C WCAG 2.2 Accessibility Guidelines",
        organization: "U.S. Dept. of Education PTAC / W3C / 1EdTech",
        url: "https://studentprivacy.ed.gov/",
        summary: "Official federal guidance on protecting student education records, evaluating EdTech third-party vendors, and ensuring digital accessibility."
      }
    ]
  },
  {
    careerNumber: 59,
    id: "spec-career-59-building-envelope-waterproofing",
    title: "Building Envelope and Waterproofing",
    domainNumber: 14,
    domainTitle: "14. Specialist professional, conservation, food & workforce systems",
    academyId: "academy-4-master-trades-construction",
    coverImage: "/images/connectln-studies/trades-superintendent-cover.jpg",
    tangibleEvidenceType: "4-Control-Layer Wall Section Detail, Hygrothermal Dew-Point Analysis, Leak Diagnostic Test Log & Repair Specification",
    coreCurriculumBullets: [
      "Moisture movement, roofing, insulation, air barriers, and façade inspections."
    ],
    capstoneProject: "Diagnose a simulated building leak and document repairs.",
    workedFormulaTitle: "Thermal Gradient, Dew-Point Condensation Check & Air-Barrier Leakage Rate",
    workedFormulaEquations: [
      "Layer Temperature Drop:          ΔT_layer = (R_layer / R_total) × (T_indoor - T_outdoor)",
      "Interstitial Condensation Rule:  If T_interface <= T_dew_point(T_air, %RH)  ⇒  Liquid Condensation Occurs!",
      "Whole-Building Air Leakage:      Q_75 <= 0.40 cfm/ft² (2.0 L/(s·m²)) at 75 Pa (IECC / ASHRAE 90.1)"
    ],
    workedFormulaExplanation:
      "Building envelope specialists trace the Four Control Layers in correct continuity order across walls, roofs, windows, and foundations (1. Bulk Water Control Layer / Rainscreen & Shingle-Lapped Flashing, 2. Air Barrier Layer, 3. Vapor Retarder Layer positioned for the climate zone, 4. Thermal Insulation Layer), keeping interior moisture-laden air from reaching cold surfaces below the dew point.",
    workedProblemStatement:
      "In a cold winter climate, indoor air is T_in = 21.0°C at 40% RH (Dew Point T_dp = 6.9°C) and outdoor temperature is T_out = -9.0°C (total ΔT = 30.0°C). A wall assembly has total thermal resistance R_total = 4.0 m²·K/W, with interior drywall + fiberglass cavity insulation (R_in_to_sheathing = 3.2 m²·K/W) and no exterior continuous insulation outside the OSB sheathing. If an unsealed electrical outlet leaks indoor air directly onto the interior face of the cold OSB sheathing, calculate the OSB sheathing temperature T_sheathing and determine whether condensation will occur.",
    workedStepByStep: [
      "1. Compute temperature drop from indoor air (21.0°C) to the OSB sheathing: ΔT = (3.2 / 4.0) × 30.0°C = 0.80 × 30.0°C = 24.0°C.",
      "2. Compute OSB sheathing temperature: T_sheathing = 21.0°C - 24.0°C = -3.0°C.",
      "3. Compare T_sheathing (-3.0°C) against the indoor air Dew Point (T_dp = +6.9°C): Since -3.0°C << +6.9°C, indoor moisture leaking through the unsealed air barrier condenses (and freezes as frost!) on the back of the OSB sheathing.",
      "4. Remediation: Seal the continuous interior air barrier AND add exterior continuous insulation outside the sheathing to keep the sheathing temperature above the 6.9°C dew point."
    ],
    workedConclusion:
      "The sheathing sits at -3.0°C (nearly 10°C below the +6.9°C indoor dew point), proving why air-barrier continuity and exterior continuous insulation are critical to prevent interstitial rot.",
    practicalLabScenario:
      "Investigate a recurring water-intrusion and mold complaint around 3rd-floor curtain-wall/window heads and a low-slope parapet roof transition using infrared thermography, capacitance/pin moisture meters, ASTM E1105 spray-rack test logs, and architectural detail drawings, and author a Forensic Envelope Diagnosis & Flashing Repair Specification.",
    practicalLabTasks: [
      "Perform the 'Four-Pen Test' on the wall-to-window and roof-to-parapet section drawings to trace Water, Air, Vapor, and Thermal continuity.",
      "Distinguish bulk rainwater intrusion (reverse-lapped window head flashing and missing end dams) from winter interstitial air-leakage condensation.",
      "Interpret ASTM E1105 chamber water-penetration test logs and infrared thermal anomalies.",
      "Produce a step-by-step Shingle-Lapped Flashing & Air-Barrier Repair Detail with mock-up verification testing."
    ],
    answerKeyQuestion: {
      prompt: "When installing flexible membrane flashing around a window opening or wall penetration, why must every horizontal lap joint be 'shingle-lapped' (with the upper membrane layer overlapping ON TOP OF the lower layer) and why must pan flashings include turned-up 'end dams'?",
      options: [
        "Gravity pulls liquid water downward; a reverse lap (lower piece over upper piece) acts as a funnel that catches water running down the wall and directs it behind the membrane, while missing sill end dams allow water to pour off the ends of the sill pan into the stud cavity.",
        "Because rainwater flows uphill inside brick walls.",
        "Because caulk lasts forever and never cracks.",
        "Weep holes at the bottom of a masonry wall should always be sealed shut with mortar."
      ],
      correctIndex: 0,
      explanation: "Shingle-lapping with gravity, sill pans with end dams, and unobstructed weep paths ensure any water entering the cladding drains safely back to the exterior."
    },
    careerGuidance: {
      prerequisites: "Building construction materials, architectural detail reading, heat/moisture physics (psychrometrics), and field diagnostic instruments.",
      targetRoles: "Building Envelope Consultant, Waterproofing & Façade Inspector, Building Enclosure Commissioning (BECx) Specialist, Roofing/Waterproofing Project Estimator.",
      qualificationsAndNextSteps: "IIBEC Registered Roof Observer (RRO) / Registered Waterproofing Consultant (RWC) / Registered Exterior Wall Consultant (REWC), ABAA Air Barrier Inspector."
    },
    mentorReviewCriteria: [
      "Drawings verify uninterrupted continuity of all 4 control layers (Water, Air, Vapor, Thermal) across transitions.",
      "Diagnosis accurately separates rainwater bulk entry from psychrometric dew-point condensation.",
      "Repair sequence specifies substrate preparation, primer compatibility, lap dimensions, and ASTM water test verification."
    ],
    principalReferences: [
      {
        title: "Whole Building Design Guide (WBDG) Building Envelope Design Guide & NIST Hygrothermal Research",
        organization: "National Institute of Building Sciences (NIBS) / DOE Building America",
        url: "https://www.wbdg.org/guides-specifications/building-envelope-design-guide",
        summary: "Authoritative engineering guidance on building enclosure control layers, waterproofing, fenestration flashing, air barriers, and moisture durability."
      }
    ]
  },
  {
    careerNumber: 60,
    id: "spec-career-60-workforce-development-apprenticeship-design",
    title: "Workforce Development and Apprenticeship Design",
    domainNumber: 14,
    domainTitle: "14. Specialist professional, conservation, food & workforce systems",
    academyId: "academy-5-professional-services",
    coverImage: "/images/connectln-studies/certifications-hub-cover.jpg",
    tangibleEvidenceType: "DACUM Occupational Task Matrix, Registered Apprenticeship Work Process Schedule (OJT + RTI), Competency Rubric & Employer Partnership Charter",
    coreCurriculumBullets: [
      "Competency mapping, curriculum design, employer partnerships, and practical assessment."
    ],
    capstoneProject: "Design a complete industry-aligned apprenticeship pathway.",
    workedFormulaTitle: "Registered Apprenticeship OJT-to-RTI Hours, Wage Progression & Employer Training ROI",
    workedFormulaEquations: [
      "Standard Annual Apprenticeship Ratio:  OJT_Hours >= 2,000 hr/yr  ;  Related_Technical_Instruction (RTI) >= 144 hr/yr",
      "Progressive Wage Schedule:             Wage_step_k = α_k × Journeyworker_Base_Wage   (e.g., 60% → 70% → 80% → 90% → 100%)",
      "Employer Net Apprenticeship ROI:       ROI_emp = (Value_of_Apprentice_Output + Retention_Savings) / (Wages + Mentor_Time + Tuition)"
    ],
    workedFormulaExplanation:
      "Workforce development architects Partner with employers to conduct DACUM (Developing A Curriculum) job-task analyses, structure Registered Apprenticeship Standards combining paid On-the-Job Training (OJT, typically >= 2,000 hr/yr under a qualified mentor) with Related Technical Instruction (RTI, >= 144 hr/yr), define progressive wage steps tied to verified competencies, and establish objective performance rubrics.",
    workedProblemStatement:
      "A regional employer consortium designs a 2-year competency-based Industrial Mechatronics Apprenticeship where the full Journeyworker wage is $36.00/hour. The program requires 4,000 OJT hours (4 milestones of 1,000 hours + competency check) and 288 RTI classroom/lab hours, with progressive wage tiers of 65%, 75%, 85%, and 95% before reaching 100% ($36.00/hr) upon completion. Calculate the apprentice hourly wage at each of the 4 tiers and total gross apprentice wages earned across the 4,000 OJT hours.",
    workedStepByStep: [
      "1. Tier 1 Wage (Hours 1–1,000 at 65%): 0.65 × $36.00 = $23.40/hr × 1,000 hr = $23,400.",
      "2. Tier 2 Wage (Hours 1,001–2,000 at 75%): 0.75 × $36.00 = $27.00/hr × 1,000 hr = $27,000.",
      "3. Tier 3 Wage (Hours 2,001–3,000 at 85%): 0.85 × $36.00 = $30.60/hr × 1,000 hr = $30,600.",
      "4. Tier 4 Wage (Hours 3,001–4,000 at 95%): 0.95 × $36.00 = $34.20/hr × 1,000 hr = $34,200.",
      "5. Total apprentice OJT earnings over the 2-year pathway: $23,400 + $27,000 + $30,600 + $34,200 = $115,200 (graduating debt-free into a $36.00/hr / $74,880/yr role)."
    ],
    workedConclusion:
      "The 4-tier progressive wage schedule pays $23.40, $27.00, $30.60, and $34.20/hr ($115,200 total OJT earnings) tied directly to verified workplace competency milestones.",
    practicalLabScenario:
      "Design a complete Industry-Aligned Apprenticeship Pathway (Standards Document, Work Process Schedule, Related Technical Instruction Outline, Mentor Evaluation Rubric, and Employer Consortium Agreement) for one of the 60 specialist careers.",
    practicalLabTasks: [
      "Conduct a DACUM Job-Task Analysis organizing the occupation into 6–8 Major Duty Areas and 35 observable Workplace Tasks.",
      "Build the Work Process Schedule (mapping OJT hours and competency sign-offs) and align it with >= 144 hours/year of Related Technical Instruction (RTI).",
      "Design the 4-tier Progressive Wage Schedule, Mentor-to-Apprentice Supervision Ratio, and Equal Employment Opportunity (EEO) recruitment plan.",
      "Create the Practical Assessment & Journeyworker Sign-Off Portfolio Rubric."
    ],
    answerKeyQuestion: {
      prompt: "What is the primary advantage of a 'Hybrid' or 'Competency-Based' apprenticeship Work Process Schedule over a purely 'Time-Based' log that only counts hours spent sitting at a jobsite?",
      options: [
        "Time-based hours alone can allow an apprentice to spend 2,000 hours doing only one repetitive low-skill task without mastering the full trade; competency-based and hybrid models require a qualified mentor/assessor to verify demonstrated performance across every required occupational duty before wage advancement and completion.",
        "Because apprentices are not allowed to learn theory in a classroom.",
        "Because employers prefer workers who cannot perform hands-on tasks.",
        "Related Technical Instruction (RTI) replaces the need for workplace safety rules."
      ],
      correctIndex: 0,
      explanation: "Rotating across all occupational duty areas and verifying hands-on competence against a transparent rubric ensures graduates can perform the complete job."
    },
    careerGuidance: {
      prerequisites: "Curriculum/instructional design, labor-market analysis, employer partnership building, and workforce regulatory frameworks.",
      targetRoles: "Workforce Development Specialist, Apprenticeship Program Designer, Employer Partnerships Director, Technical Training & Credentialing Manager.",
      qualificationsAndNextSteps: "U.S. DOL ApprenticeshipUSA Registered Apprenticeship Standards design, NAWDP CWDP (Certified Workforce Development Professional), NIST NICE / Advanced Manufacturing competency frameworks."
    },
    mentorReviewCriteria: [
      "Work Process Schedule maps 100% of OJT duty areas to aligned Related Technical Instruction (RTI) modules.",
      "Assessment rubrics require tangible workplace performance verification rather than attendance alone.",
      "Program standards include safety prerequisites, mentor ratios, and progressive wage structures."
    ],
    principalReferences: [
      {
        title: "U.S. Department of Labor ApprenticeshipUSA Toolkit & NIST Workforce Frameworks",
        organization: "U.S. Department of Labor (DOL) / NIST",
        url: "https://www.apprenticeship.gov/employers/registered-apprenticeship-program",
        summary: "Official federal guidelines for designing Registered Apprenticeship Programs, Work Process Schedules, Related Technical Instruction, and competency assessments."
      }
    ]
  }
]

// Helper for clean lesson text generation on #34-#60
SPECIALIST_CAREERS_34_TO_60_SPECS.forEach((s) => {
  s.WorkedFormulaExplanationText = (spec) =>
    `${spec.workedFormulaExplanation} Capstone Requirement: ${spec.capstoneProject}`
})

export const SPECIALIST_CAREERS_34_TO_60_PATHWAYS: PriorityCareerPathway[] = []

// Complete 60-Career Combined Arrays
export const ALL_60_SPECIALIST_CAREER_SPECS: SpecializedTangibleCareerSpec[] = [
  ...SPECIALIZED_33_CAREER_SPECS,
  ...SPECIALIST_CAREERS_34_TO_60_SPECS
]

export const ALL_60_SPECIALIST_CAREER_PATHWAYS: PriorityCareerPathway[] = []

// ============================================================================
// 5. HOW TO DECIDE WHICH CAREERS TO DEVELOP FIRST (5-CRITERIA SCORING MODEL)
// ============================================================================

export const FIVE_CAREER_SELECTION_CRITERIA = [
  {
    number: "01",
    criterion: "Employer demand and local workforce needs",
    description:
      "Prioritize occupations with active regional hiring shortages, infrastructure investment (CHIPS Act, grid modernization, broadband, maritime, healthcare), and clear entry-to-senior demand."
  },
  {
    number: "02",
    criterion: "Ability to teach skills through practical exercises",
    description:
      "Select careers where core problem-solving, calculations, diagnostics, and workflows can be practiced safely via simulations, datasets, bench labs, and structured projects."
  },
  {
    number: "03",
    criterion: "Availability of qualified instructors and reliable reference material",
    description:
      "Anchor every pathway in public, authoritative reference standards (NIST, OSHA, FAA, EPA, IEEE, SEMI, CDC, DOL) and verify content with subject-matter experts."
  },
  {
    number: "04",
    criterion: "Clear assessment and portfolio outcomes",
    description:
      "Ensure every learner graduates with tangible evidence of competence — a technical report, calculation sheet, CAD/network model, audit binder, or tested prototype."
  },
  {
    number: "05",
    criterion: "Access to employers, apprenticeships, or recognized qualifications",
    description:
      "Connect training directly to employer interviews, Registered Apprenticeships, supervised lab placements, or recognized industry certification exams."
  }
]

// ============================================================================
// 6. VIBE AI-ASSISTED CAREER PATHWAY GENERATOR PRESET OPTIONS
// ============================================================================

export const VIBE_GENERATOR_CAREER_PRESETS = [
  "Semiconductor manufacturing",
  "Fiber optics and telecommunications",
  "Emergency management",
  "Digital forensics",
  "Battery technology",
  "Aircraft maintenance",
  "Building envelope and waterproofing",
  "Another specialist career"
]

export const VIBE_GENERATOR_STARTING_LEVELS = [
  "Beginner",
  "Intermediate",
  "Experienced professional"
]

export const VIBE_GENERATOR_DURATIONS = [
  "4 weeks",
  "12 weeks",
  "24 weeks"
]

export const VIBE_GENERATOR_OBJECTIVES = [
  "Job readiness",
  "Advanced specialization",
  "Supervisory and leadership",
  "Business ownership"
]

export const VIBE_GENERATOR_CONTENT_DEPTHS = [
  "Course outline",
  "Detailed lesson plans",
  "Full teaching material, examples, labs and answer keys"
]
