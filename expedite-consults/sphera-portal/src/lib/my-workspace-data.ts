import { findProfessionById, findEnclaveById } from './connectin-professions'

export interface WorkspaceProject {
  id: string
  title: string
  clientOrOrg: string
  completionDate: string
  category: string
  summary: string
  techStack: string[]
  metrics: string
  liveDemoUrl?: string
  githubUrl?: string
  coverImage: string
}

export interface WorkspaceVerifiedSkill {
  name: string
  category: 'Security' | 'Cloud' | 'AI' | 'Systems' | 'Compliance' | 'Trades' | 'Automotive' | 'Clinical'
  endorsementsCount: number
  isVerified: boolean
  verifiedBy: string
  proficiencyLevel: 'Expert (Top 1%)' | 'Advanced' | 'Proficient'
}

export interface WorkspaceCertification {
  name: string
  issuingBody: string
  badgeIcon: string
  issueDate: string
  credentialId: string
  verificationUrl?: string
  isVerifiedBadge: boolean
}

export interface WorkspaceExperience {
  role: string
  company: string
  logo?: string
  location: string
  period: string
  isCurrent: boolean
  description: string
  achievements: string[]
}

export interface WorkspacePublication {
  title: string
  publisher: string
  date: string
  type: 'Whitepaper' | 'Technical Report' | 'CVE Advisory' | 'Research Paper' | 'Clinical Study' | 'Trade Spec'
  summary: string
  link: string
  citationsCount: number
}

export interface WorkspaceReview {
  reviewerName: string
  reviewerRole: string
  reviewerAvatar: string
  rating: number
  date: string
  reviewType: 'Architecture Review' | 'Security Review' | 'Code Review' | 'Product Review' | 'Trade Review' | 'Clinical Review'
  comment: string
}

export interface VendorProductItem {
  id: string
  name: string
  category:
    | 'Software'
    | 'Training'
    | 'Services'
    | 'Enterprise Solutions'
    | 'Trade Plans'
    | 'Diagnostics'
    | 'Clinical Services'
    | 'Consultations'
    | 'Maintenance Plans'
  icon: string
  pricingModel: string
  price: string
  activeLicensesCount: number
  activeTrialsCount: number
  mrrOrRevenue: string
  rating: number
  reviewsCount: number
  status: 'Active Listing' | 'Pending Review' | 'Staging'
  leadsCount: number
  description?: string
  turnaround?: string
}

// ─── 1. SKILLED TRADES & CARPENTRY WORKSPACE DATA ──────────────────────────────
export const TRADES_PORTFOLIO_DATA: WorkspaceProject[] = [
  {
    id: 'proj_trade_1',
    title: 'Heavy Timber Douglas Fir Vaulted Pavilion (6,400 sq.ft.)',
    clientOrOrg: 'Rocky Mountain Heritage Estates & Park Service',
    completionDate: 'Q2 2026',
    category: 'Heavy Timber Framing',
    summary: 'Milled and raised 12x12 Coastal Douglas Fir timber bents with traditional draw-bored mortise and tenon joinery, secured with 1-inch white oak trunnels.',
    techStack: ['Heavy Timber Framing', 'Festool Domino XL', 'Timber Takeoff CAD', 'Draw-Bored Joinery', 'OSHA 30 Crane Pick'],
    metrics: '115 MPH Wind Uplift Certified · 45 PSF Snow Load · Sub-1mm Tolerances',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'proj_trade_2',
    title: 'Custom Curved Walnut Staircase & Architectural Coffered Ceiling',
    clientOrOrg: 'Private Architectural Commission',
    completionDate: 'Q1 2026',
    category: 'Finish Carpentry & Joinery',
    summary: 'Crafted free-standing curved helical stringers, continuous handrails with hand-carved volutes, and integrated 16-box coffered ceiling with compound crown trim.',
    techStack: ['Architectural Millwork', 'Compound Bevel Miters', 'Vacuum Press Veneering', 'Festool Track Saw'],
    metrics: '100% Coped Joints · Zero Caulking Tolerances · Premium Black Walnut',
    coverImage: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'proj_trade_3',
    title: 'Historic 1890 Post-and-Beam Barn Structural Leveling & Restoration',
    clientOrOrg: 'Agricultural Heritage Preservation Trust',
    completionDate: '2025',
    category: 'Historic Preservation Carpentry',
    summary: 'Engineered temporary shoring towers, raised slumped foundation by 4.2 inches with 50-ton hydraulic bottle jacks, and scarfed replacement sill timbers with Dutchmen patches.',
    techStack: ['Historic Scarf Joints', 'Hydraulic Rigging', 'Traditional Timber Guild Specs', 'White Oak Sills'],
    metrics: '135-Year-Old Barn Restored · PE Stamped Foundation Leveling',
    coverImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80'
  }
]

export const TRADES_VERIFIED_SKILLS: WorkspaceVerifiedSkill[] = [
  {
    name: 'Heavy Timber Mortise & Tenon Joinery',
    category: 'Trades',
    endorsementsCount: 164,
    isVerified: true,
    verifiedBy: 'Timber Framers Guild & ConnectIn Trades Board',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Architectural Finish Crown & Compound Angles',
    category: 'Trades',
    endorsementsCount: 142,
    isVerified: true,
    verifiedBy: 'Master Craftsman Peer Committee',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Festool Domino XL DF 700 Joinery Rig',
    category: 'Trades',
    endorsementsCount: 128,
    isVerified: true,
    verifiedBy: 'Festool USA Technical Academy',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Total Station & Laser Transit Plumb Elevation',
    category: 'Trades',
    endorsementsCount: 110,
    isVerified: true,
    verifiedBy: 'Commercial General Contractor Board',
    proficiencyLevel: 'Advanced'
  },
  {
    name: 'OSHA 30 Construction Safety & Fall Rigging',
    category: 'Compliance',
    endorsementsCount: 98,
    isVerified: true,
    verifiedBy: 'OSHA Authorized Instructor',
    proficiencyLevel: 'Expert (Top 1%)'
  }
]

// ─── 2. AUTOMOTIVE & FLEET MECHANICS WORKSPACE DATA ──────────────────────────
export const AUTOMOTIVE_PORTFOLIO_DATA: WorkspaceProject[] = [
  {
    id: 'proj_auto_1',
    title: '800V High-Voltage EV Powertrain Inverter Teardown & IGBT Diagnostics',
    clientOrOrg: 'Apex Fleet Performance Labs',
    completionDate: 'Q2 2026',
    category: 'EV Powertrain Diagnostic',
    summary: 'Executed complete NFPA 70E high-voltage lockout/tagout, verified zero-energy state (<50V), diagnosed gate-driver failure on a Silicon Carbide (SiC) traction inverter, and repaired busbar connections.',
    techStack: ['800V EV Lockout', 'CAT-IV 1000V Fluke Insulation Tester', 'SiC Inverter', 'CAN-FD Telemetry'],
    metrics: 'Sub-1 Ohm Isolation Resistance Restored · Zero Arc Hazard · First-Time Fix',
    coverImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'proj_auto_2',
    title: 'Commercial Fleet Overhaul: 24x Cummins ISX15 Aftertreatment SCR Recalibration',
    clientOrOrg: 'Intermountain Interstate Transport Lines',
    completionDate: 'Q1 2026',
    category: 'Heavy Diesel Fleet Diagnostics',
    summary: 'Diagnosed intermittent DEF doser valve crystallization and SCR catalyst NOx conversion efficiency codes using Cummins INSITE. Restored stationary regen protocols and calibrated differential pressure sensors.',
    techStack: ['Cummins INSITE', 'NOx Sensors', 'SCR Catalyst', 'FMCSA DOT Compliance', 'DEF Dosing'],
    metrics: '24 Class 8 Tractors Back in Service · 0% Defect Return · FMCSA Cleared',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'proj_auto_3',
    title: 'PicoScope 4-Channel CAN-FD Bus Arbitration & Gateway Recovery',
    clientOrOrg: 'Precision Euro & Fleet Diagnostics',
    completionDate: '2025',
    category: 'CAN-Bus Oscilloscope Diagnostics',
    summary: 'Traced a phantom U0100 loss of comms and limp-mode condition to a corroded 120-ohm terminating resistor within the rear differential control module using differential voltage scope captures.',
    techStack: ['PicoScope 4425A', 'CAN-FD Waveform Capture', 'Mitchell 1 Schematics', 'Snap-on ZEUS+'],
    metrics: 'Identified Intermittent Fault in 42 Minutes · 2.5V Recessive Baseline Verified',
    coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
  }
]

export const AUTOMOTIVE_VERIFIED_SKILLS: WorkspaceVerifiedSkill[] = [
  {
    name: 'PicoScope 4-Channel CAN-FD Bus Waveforms',
    category: 'Automotive',
    endorsementsCount: 172,
    isVerified: true,
    verifiedBy: 'ASE National Board & Master Tech Council',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: '800V High-Voltage EV Lockout/Tagout (NFPA 70E)',
    category: 'Automotive',
    endorsementsCount: 154,
    isVerified: true,
    verifiedBy: 'ASE L3 Electric Vehicle Council',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Snap-on ZEUS+ Diagnostic Hub & Lab Scope',
    category: 'Automotive',
    endorsementsCount: 138,
    isVerified: true,
    verifiedBy: 'Snap-on Diagnostics Certified Instructor',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Cummins ISX15 / Detroit DD15 Fleet Rebuilds',
    category: 'Automotive',
    endorsementsCount: 124,
    isVerified: true,
    verifiedBy: 'Cummins Certified Power Systems Board',
    proficiencyLevel: 'Advanced'
  },
  {
    name: 'Mitchell 1 & ALLDATA ProDemand Wiring Tracing',
    category: 'Automotive',
    endorsementsCount: 115,
    isVerified: true,
    verifiedBy: 'Automotive Master Diagnostic Association',
    proficiencyLevel: 'Expert (Top 1%)'
  }
]

// ─── 3. CLINICAL HEALTHCARE & MEDICINE WORKSPACE DATA ─────────────────────────
export const CLINICAL_PORTFOLIO_DATA: WorkspaceProject[] = [
  {
    id: 'proj_health_1',
    title: 'Level 1 Trauma Resuscitation Protocol Optimization & MTP Streamlining',
    clientOrOrg: 'Johns Hopkins Hospital · Adult Trauma Center',
    completionDate: 'Q2 2026',
    category: 'Trauma Resuscitation & Nursing',
    summary: 'Streamlined emergency activation of Massive Transfusion Protocol (1:1:1 PRBC, FFP, Platelets) with Belmont rapid blood warmers, cutting door-to-transfusion time by 18 minutes in severe hemorrhagic shock.',
    techStack: ['Belmont Rapid Infuser', 'Level 1 Trauma ESI', 'MTP 1:1:1 Protocol', 'Ultrasound Vascular Access', 'TNCC'],
    metrics: 'Door-to-Blood Time: 7.2 min · 34% Reduction in Early Hypovolemic Arrest',
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'proj_health_2',
    title: 'Dual-Column Locking Plate Fixation of Schatzker VI Tibial Plateau Fractures',
    clientOrOrg: 'Mass General Brigham / Harvard Orthopaedic Trauma',
    completionDate: 'Q1 2026',
    category: 'Orthopedic Trauma Surgery',
    summary: 'Prospective series of 28 high-energy intra-articular proximal tibia bicondylar fractures managed with anterolateral and posteromedial locking plates under 3D intraoperative O-arm navigation.',
    techStack: ['Intra-Articular ORIF', 'O-Arm 3D Navigation', 'Subchondral Bone Grafting', 'ATLS Protocols'],
    metrics: '99.4% Joint Congruity Restored · Zero Post-Op Infection in Series',
    coverImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'proj_health_3',
    title: 'Critical Care ARDS Mechanical Ventilation Prone Positioning Initiative',
    clientOrOrg: 'Inova Fairfax Medical & Surgical ICU',
    completionDate: '2025',
    category: 'Critical Care ICU Nursing',
    summary: 'Standardized a 16-hour prone positioning nursing checklist for severe ARDS with multi-pressor cardiovascular support, preventing endotracheal tube dislodgement and facial pressure injuries.',
    techStack: ['CCRN Critical Care', 'Ventilator ARDSnet Protocol', 'Arterial Line Telemetry', 'CRRT Dialysis'],
    metrics: 'PaO2/FiO2 Ratio Improved by 68 mmHg Average · Zero Unplanned Extubations',
    coverImage: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=800&auto=format&fit=crop&q=80'
  }
]

export const CLINICAL_VERIFIED_SKILLS: WorkspaceVerifiedSkill[] = [
  {
    name: 'Emergency Trauma Resuscitation (ESI Level 1 & TNCC)',
    category: 'Clinical',
    endorsementsCount: 184,
    isVerified: true,
    verifiedBy: 'Emergency Nurses Association (ENA)',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Complex Intra-Articular Pelvic & Tibial ORIF',
    category: 'Clinical',
    endorsementsCount: 168,
    isVerified: true,
    verifiedBy: 'American Board of Orthopaedic Surgery (ABOS)',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Massive Transfusion Protocol (MTP) & Rapid Infusion',
    category: 'Clinical',
    endorsementsCount: 152,
    isVerified: true,
    verifiedBy: 'AACN Critical Care Credentialing Board',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Arterial Line & Central Venous Telemetry Monitoring',
    category: 'Clinical',
    endorsementsCount: 140,
    isVerified: true,
    verifiedBy: 'American College of Critical Care Medicine',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Ventilator ARDS Lung Protective Protocol',
    category: 'Clinical',
    endorsementsCount: 125,
    isVerified: true,
    verifiedBy: 'Pulmonary Critical Care Medicine Board',
    proficiencyLevel: 'Advanced'
  }
]

// ─── 4. DEEP CYBERSECURITY & RED TEAMING WORKSPACE DATA ───────────────────────
export const CYBER_PORTFOLIO_DATA: WorkspaceProject[] = [
  {
    id: 'proj_cyber_1',
    title: 'Sliver / Havoc C2 Adversary Simulation & Indirect Syscalls EDR Bypass',
    clientOrOrg: 'Apex Cyber Defense Labs · Cleared Red Team',
    completionDate: 'Q2 2026',
    category: 'Red Teaming & Exploitation',
    summary: 'Engineered an in-memory reflective DLL loader with custom indirect syscall stubs, unhooked ntdll in execution space, and established stealth mTLS beaconing across a tier-1 monitored active directory forest.',
    techStack: ['Sliver C2', 'Indirect Syscalls', 'EDR Evasion', 'Cobalt Strike', 'BloodHound', 'C/C++ Assembly'],
    metrics: '100% Behavioral Heuristic Evasion · Domain Admin in 48 Hours · Zero Alert Tripped',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'proj_cyber_2',
    title: 'Purdue Model Level 2/3 SCADA Modbus PLC Air-Gap Firmware Defense',
    clientOrOrg: 'National Critical Infrastructure Security Directorate',
    completionDate: 'Q1 2026',
    category: 'SCADA / ICS OT Security',
    summary: 'Conducted hardware JTAG pin extraction, reverse-engineered proprietary ladder logic binaries in Ghidra, and built real-time Modbus TCP deep packet inspection sensors for electrical grid substations.',
    techStack: ['Modbus TCP', 'DNP3 Protocol', 'Ghidra Decompiler', 'Purdue Model', 'Siemens S7', 'Wireshark OT'],
    metrics: 'Intercepted Unauthorized Coil Write Attacks · <0.4ms Packet Inspection Overhead',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'proj_cyber_3',
    title: 'Zero-Day UEFI Bootkit x86_64 Reverse Engineering & Artifact Decryption',
    clientOrOrg: 'Mandiant / DoD Defense Threat Intelligence',
    completionDate: '2025',
    category: 'Malware Reverse Engineering',
    summary: 'Decompiled an advanced persistent threat (APT) SPI flash bootkit in IDA Pro and Ghidra. Recovered obfuscated RC4 cryptographic keys and reconstructed the pre-OS kernel hooking routine.',
    techStack: ['IDA Pro', 'Ghidra', 'x86_64 Assembly', 'UEFI Firmware', 'Kernel Hooking', 'YARA'],
    metrics: 'Full Cryptographic Recovery · YARA Signatures Deployed to 2.4M Federal Hosts',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80'
  }
]

export const CYBER_VERIFIED_SKILLS: WorkspaceVerifiedSkill[] = [
  {
    name: 'C2 Frameworks (Sliver, Havoc, Mythic) & Malleable TTPs',
    category: 'Security',
    endorsementsCount: 198,
    isVerified: true,
    verifiedBy: 'Offensive Security (OSCP/CRTO Board)',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Kernel-Level EDR Evasion & Indirect Syscalls',
    category: 'Security',
    endorsementsCount: 185,
    isVerified: true,
    verifiedBy: 'Zero-Point Security CRTO Council',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'SCADA / ICS Modbus & DNP3 Critical Infrastructure Defense',
    category: 'Security',
    endorsementsCount: 167,
    isVerified: true,
    verifiedBy: 'SANS Global Industrial Cyber Security (GICSP)',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Ghidra & IDA Pro x86_64 / ARM Reverse Engineering',
    category: 'Security',
    endorsementsCount: 154,
    isVerified: true,
    verifiedBy: 'GIAC Reverse Engineering Malware (GREM)',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Velociraptor DFIR Live Memory Forensics & IOC Hunting',
    category: 'Security',
    endorsementsCount: 142,
    isVerified: true,
    verifiedBy: 'Federal Incident Response Review Board',
    proficiencyLevel: 'Advanced'
  }
]

// ─── 5. CLOUD SECURITY & SYSTEMS WORKSPACE DATA (DEFAULT / EXISTING) ───────────
export const WORKSPACE_PORTFOLIO_DATA: WorkspaceProject[] = [
  {
    id: 'proj_1',
    title: 'Autonomous eBPF Multi-Cluster Micro-Segmentation Mesh',
    clientOrOrg: 'Expedite Consults Core Infrastructure',
    completionDate: 'Q2 2026',
    category: 'Cloud Security',
    summary: 'Architected and deployed a multi-cloud Cilium ClusterMesh with WireGuard encryption and kernel-level zero-trust policies, reducing lateral attack surfaces by 94%.',
    techStack: ['eBPF', 'Cilium', 'Kubernetes', 'WireGuard', 'Rust', 'AWS GovCloud'],
    metrics: '94% Attack Surface Reduction · <0.8ms Socket Latency',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'proj_2',
    title: 'Continuous ATO (cATO) Automated Compliance Machine',
    clientOrOrg: 'Defense Mission Systems',
    completionDate: 'Q1 2026',
    category: 'FedRAMP / DoD',
    summary: 'Engineered an automated OSCAL-based evidence generation pipeline mapping 340+ NIST SP 800-53 Rev 5 controls to live AWS telemetry, cutting ATO approval cycle from 9 months to 14 days.',
    techStack: ['NIST 800-53', 'OSCAL JSON', 'AWS Config', 'Terraform', 'Checkov'],
    metrics: '14-Day cATO Approval · 100% Audit Readiness',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'proj_3',
    title: 'VeritasLens NLP Media Intelligence Engine',
    clientOrOrg: 'Public Intelligence Research',
    completionDate: '2025',
    category: 'AI / NLP',
    summary: 'Built real-time clustering engine analyzing 14 major national newsrooms with algorithmic bias scoring and automated statutory source fact-checking.',
    techStack: ['Next.js 16', 'TypeScript', 'Vector Embeddings', 'FastAPI', 'Tailwind CSS'],
    metrics: '14 Newsrooms Streamed · <1.2s Real-time Latency',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  }
]

export const WORKSPACE_VERIFIED_SKILLS_DATA: WorkspaceVerifiedSkill[] = [
  {
    name: 'Zero Trust Architecture (NIST SP 800-207)',
    category: 'Security',
    endorsementsCount: 148,
    isVerified: true,
    verifiedBy: 'ISC2 CISSP & ConnectIn Peer Review Board',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'AWS GovCloud & Multi-Account Landing Zones',
    category: 'Cloud',
    endorsementsCount: 112,
    isVerified: true,
    verifiedBy: 'AWS Certified Security Specialty',
    proficiencyLevel: 'Expert (Top 1%)'
  },
  {
    name: 'Autonomous Red Teaming & Offensive AppSec',
    category: 'Security',
    endorsementsCount: 96,
    isVerified: true,
    verifiedBy: 'OffSec OSCP Benchmark Exam',
    proficiencyLevel: 'Advanced'
  },
  {
    name: 'Rust & eBPF Kernel Probe Engineering',
    category: 'Systems',
    endorsementsCount: 84,
    isVerified: true,
    verifiedBy: 'ConnectIn Verified Code Review',
    proficiencyLevel: 'Advanced'
  },
  {
    name: 'FedRAMP High & DoD IL5 Compliance',
    category: 'Compliance',
    endorsementsCount: 78,
    isVerified: true,
    verifiedBy: '3PAO Certified Lead Assessor',
    proficiencyLevel: 'Expert (Top 1%)'
  }
]

export const WORKSPACE_CERTIFICATIONS_DATA: WorkspaceCertification[] = [
  {
    name: 'CISSP: Certified Information Systems Security Professional',
    issuingBody: 'ISC2',
    badgeIcon: '🏆',
    issueDate: 'Issued Oct 2021 · Active',
    credentialId: 'ISC2-ID-984210',
    isVerifiedBadge: true
  },
  {
    name: 'AWS Certified Security - Specialty (SCS-C02)',
    issuingBody: 'Amazon Web Services',
    badgeIcon: '☁️',
    issueDate: 'Issued Jan 2023 · Valid thru 2027',
    credentialId: 'AWS-SEC-774921',
    isVerifiedBadge: true
  },
  {
    name: 'OSCP: Offensive Security Certified Professional',
    issuingBody: 'Offensive Security',
    badgeIcon: '⚡',
    issueDate: 'Issued Aug 2022',
    credentialId: 'OS-2022-8419',
    isVerifiedBadge: true
  },
  {
    name: 'ConnectIn Verified Expert Reviewer Fellow',
    issuingBody: 'ConnectIn Governance Board',
    badgeIcon: '⭐',
    issueDate: 'Awarded 2026 · Top 1% Architect',
    credentialId: 'CIN-FELLOW-0012',
    isVerifiedBadge: true
  }
]

export const WORKSPACE_EXPERIENCE_DATA: WorkspaceExperience[] = [
  {
    role: 'Principal Cloud & Security Architect',
    company: 'Expedite Consults',
    location: 'Washington, DC (Hybrid)',
    period: '2023 – Present · 3 yrs',
    isCurrent: true,
    description: 'Leading enterprise zero trust transformation, sovereign GovCloud architectures, and AI-powered offensive AppSec product development.',
    achievements: [
      'Architected AXIOM autonomous security suite protecting 500k+ multi-cloud endpoints.',
      'Authored NIST SP 800-207 Zero Trust migration blueprint adopted by 4 federal agencies.',
      'Achieved 100% FedRAMP High Ready compliance certification in record 4 months.'
    ]
  },
  {
    role: 'Lead DevSecOps & Security Architect',
    company: 'Northrop Grumman Mission Systems',
    location: 'Northern Virginia / DC Metro',
    period: '2020 – 2023 · 3 yrs',
    isCurrent: false,
    description: 'Spearheaded automated CI/CD pipeline security, container hardening, and DoD IL5 cloud authorization for defense mission workloads.',
    achievements: [
      'Integrated static and dynamic application security testing (SAST/DAST) blocking 98% of pre-prod vulnerabilities.',
      'Automated STIG compliance scanning across 12,000+ virtualized microservice nodes.'
    ]
  }
]

export const WORKSPACE_PUBLICATIONS_DATA: WorkspacePublication[] = [
  {
    title: 'Eliminating Indirect Prompt Injection in MCP Tool Bindings via WebAssembly Nonce Verification',
    publisher: 'arXiv:2604.09182 & ConnectIn Research Intelligence',
    date: 'April 2026',
    type: 'Research Paper',
    summary: 'A formal mathematical model establishing provable boundaries against tool-binding replay attacks in agentic LLM pipelines.',
    link: '#',
    citationsCount: 42
  },
  {
    title: 'Micro-Segmentation at the Socket Layer: Benchmarking Cilium eBPF vs Linux Iptables',
    publisher: 'ConnectIn Pulse Whitepapers',
    date: 'January 2026',
    type: 'Whitepaper',
    summary: 'In-depth performance evaluation across 100,000 concurrent network streams showing 72% CPU overhead savings using eBPF.',
    link: '#',
    citationsCount: 68
  }
]

export const WORKSPACE_REVIEWS_DATA: WorkspaceReview[] = [
  {
    reviewerName: 'Dr. Aris Thorne',
    reviewerRole: 'VP of Systems Architecture @ GovCloud Dynamics',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    date: '3 weeks ago',
    reviewType: 'Architecture Review',
    comment: 'Exceptional technical rigor. Designed our multi-region Kubernetes mesh with flawless zero-trust isolation and automated audit logging.'
  },
  {
    reviewerName: 'Victoria Sterling',
    reviewerRole: 'Senior Defense Counsel @ Sterling & Associates',
    reviewerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    date: '1 month ago',
    reviewType: 'Security Review',
    comment: 'The CMMC 2.0 Level 3 compliance audit workspace reduced our discovery timeline by weeks. Clear, defensible evidence.'
  }
]

export const MY_PRODUCTS_DATA: VendorProductItem[] = [
  {
    id: 'prod_1',
    name: 'AXIOM Autonomous Cyber Defense Suite',
    category: 'Software',
    icon: '⚡',
    pricingModel: 'Monthly Subscription',
    price: '$499 / mo',
    activeLicensesCount: 28,
    activeTrialsCount: 64,
    mrrOrRevenue: '$13,972 / mo MRR',
    rating: 4.98,
    reviewsCount: 42,
    status: 'Active Listing',
    leadsCount: 18
  },
  {
    id: 'prod_2',
    name: 'GovCloud cATO Automation Accelerator',
    category: 'Enterprise Solutions',
    icon: '🏛️',
    pricingModel: 'Annual Enterprise License',
    price: '$24,500 / yr',
    activeLicensesCount: 4,
    activeTrialsCount: 7,
    mrrOrRevenue: '$98,000 / yr ARR',
    rating: 5.0,
    reviewsCount: 18,
    status: 'Active Listing',
    leadsCount: 9
  },
  {
    id: 'prod_3',
    name: 'Zero Trust eBPF Kernel Policy Kit',
    category: 'Software',
    icon: '🔒',
    pricingModel: 'Per Seat / Month',
    price: '$49 / user / mo',
    activeLicensesCount: 220,
    activeTrialsCount: 110,
    mrrOrRevenue: '$10,780 / mo MRR',
    rating: 4.94,
    reviewsCount: 56,
    status: 'Active Listing',
    leadsCount: 31
  }
]

// ─── HELPER: GET WORKSPACE DATA FOR SPECIFIC ENCLAVE ───────────────────────────
export function getWorkspaceDataForEnclave(enclaveId?: string) {
  if (enclaveId === 'trades_construction') {
    return {
      portfolio: TRADES_PORTFOLIO_DATA,
      verifiedSkills: TRADES_VERIFIED_SKILLS,
      certifications: [
        {
          name: 'Master Craftsman Guild Seal (Timber Framing)',
          issuingBody: 'Timber Framers Guild of North America',
          badgeIcon: '🔨',
          issueDate: 'Issued 2014 · Lifetime Fellow',
          credentialId: 'TFG-MASTER-8821',
          isVerifiedBadge: true
        },
        {
          name: 'OSHA 30 Construction Safety Supervisor',
          issuingBody: 'Occupational Safety and Health Administration',
          badgeIcon: '🦺',
          issueDate: 'Issued 2023 · Active',
          credentialId: 'OSHA-30-CONST-991',
          isVerifiedBadge: true
        },
        {
          name: 'Festool Certified System Technician',
          issuingBody: 'Festool USA Technical Academy',
          badgeIcon: '🧰',
          issueDate: 'Issued 2021 · Certified',
          credentialId: 'FESTOOL-SYS-5510',
          isVerifiedBadge: true
        }
      ],
      publications: [
        {
          title: 'Moment Capacity and Shear Deflection in Draw-Bored White Oak Trunnels Under Wind Uplift',
          publisher: 'Journal of Architectural Timber Engineering',
          date: 'March 2026',
          type: 'Trade Spec' as const,
          summary: 'Engineering load deflection curves for 1-inch traditional draw-bored white oak pegs in 10x10 Douglas Fir bents.',
          link: '#',
          citationsCount: 28
        }
      ],
      reviews: [
        {
          reviewerName: 'Frank Gallagher',
          reviewerRole: 'Licensed General Contractor · Commercial Buildouts',
          reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
          rating: 5,
          date: '1 week ago',
          reviewType: 'Trade Review' as const,
          comment: 'David’s timber framing joinery passed city inspection on the first walkthrough with zero corrections. Cleanest mortise and tenons in the state.'
        }
      ]
    }
  }

  if (enclaveId === 'automotive_mechanics') {
    return {
      portfolio: AUTOMOTIVE_PORTFOLIO_DATA,
      verifiedSkills: AUTOMOTIVE_VERIFIED_SKILLS,
      certifications: [
        {
          name: 'ASE Master Automobile Technician (A1-A8)',
          issuingBody: 'National Institute for Automotive Service Excellence',
          badgeIcon: '🔧',
          issueDate: 'Issued 2012 · Recertified Current',
          credentialId: 'ASE-MASTER-9941',
          isVerifiedBadge: true
        },
        {
          name: 'ASE L1 Advanced Engine Performance Specialist',
          issuingBody: 'National Institute for Automotive Service Excellence',
          badgeIcon: '⚡',
          issueDate: 'Issued 2015 · Active',
          credentialId: 'ASE-L1-PERF-884',
          isVerifiedBadge: true
        },
        {
          name: 'ASE L3 Light Duty Hybrid/Electric Vehicle Specialist (800V)',
          issuingBody: 'National Institute for Automotive Service Excellence',
          badgeIcon: '🔋',
          issueDate: 'Issued 2022 · Active',
          credentialId: 'ASE-L3-EV-710',
          isVerifiedBadge: true
        }
      ],
      publications: [
        {
          title: 'Diagnosing Intermittent Termination Resistor Faults in High-Speed Automotive CAN-FD Networks',
          publisher: 'Society of Automotive Engineers (SAE)',
          date: 'February 2026',
          type: 'Technical Report' as const,
          summary: 'Differential voltage scope analysis methods for identifying physical layer CAN-FD anomalies without full wire harness teardowns.',
          link: '#',
          citationsCount: 34
        }
      ],
      reviews: [
        {
          reviewerName: 'Carlos Santana',
          reviewerRole: 'Commercial Fleet Maintenance Director',
          reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          rating: 5,
          date: '2 weeks ago',
          reviewType: 'Trade Review' as const,
          comment: 'Marcus identified a parasitic drain and CAN gateway arbitration error in 45 minutes that had baffled two other shops. World-class diagnostic skills.'
        }
      ]
    }
  }

  if (enclaveId === 'healthcare_medicine') {
    return {
      portfolio: CLINICAL_PORTFOLIO_DATA,
      verifiedSkills: CLINICAL_VERIFIED_SKILLS,
      certifications: [
        {
          name: 'Critical Care Registered Nurse (CCRN)',
          issuingBody: 'American Association of Critical-Care Nurses',
          badgeIcon: '🩺',
          issueDate: 'Issued 2018 · Active',
          credentialId: 'AACN-CCRN-9982',
          isVerifiedBadge: true
        },
        {
          name: 'Trauma Nursing Core Course (TNCC Lead)',
          issuingBody: 'Emergency Nurses Association',
          badgeIcon: '🏥',
          issueDate: 'Issued 2020 · Active',
          credentialId: 'ENA-TNCC-4412',
          isVerifiedBadge: true
        },
        {
          name: 'Board Certified in Orthopaedic Surgery (ABOS)',
          issuingBody: 'American Board of Orthopaedic Surgery',
          badgeIcon: '🔪',
          issueDate: 'Issued 2019 · Active',
          credentialId: 'ABOS-SURG-771',
          isVerifiedBadge: true
        }
      ],
      publications: [
        {
          title: 'Hemodynamic Outcomes and Coagulopathy Mitigation in Level 1 Trauma Massive Transfusion Protocols',
          publisher: 'Journal of Trauma and Acute Care Surgery',
          date: 'January 2026',
          type: 'Clinical Study' as const,
          summary: 'Multi-center analysis of 1:1:1 balanced plasma-to-RBC ratio infusions using Belmont rapid warming technology.',
          link: '#',
          citationsCount: 58
        }
      ],
      reviews: [
        {
          reviewerName: 'Dr. Aris Thorne',
          reviewerRole: 'Attending Interventional Cardiologist',
          reviewerAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
          rating: 5,
          date: '3 weeks ago',
          reviewType: 'Clinical Review' as const,
          comment: 'Exemplary clinical leadership in the resuscitation bay. Rapid arterial line placement and flawless telemetry monitoring under immense pressure.'
        }
      ]
    }
  }

  if (enclaveId === 'tech_cybersecurity') {
    return {
      portfolio: CYBER_PORTFOLIO_DATA,
      verifiedSkills: CYBER_VERIFIED_SKILLS,
      certifications: [
        {
          name: 'Offensive Security Certified Professional (OSCP)',
          issuingBody: 'OffSec',
          badgeIcon: '🎯',
          issueDate: 'Issued 2018 · Active',
          credentialId: 'OSCP-9812-ADV',
          isVerifiedBadge: true
        },
        {
          name: 'Certified Red Team Operator (CRTO)',
          issuingBody: 'Zero-Point Security',
          badgeIcon: '⚡',
          issueDate: 'Issued 2022 · Active',
          credentialId: 'CRTO-C2-4410',
          isVerifiedBadge: true
        },
        {
          name: 'GIAC Reverse Engineering Malware (GREM)',
          issuingBody: 'SANS GIAC',
          badgeIcon: '🧬',
          issueDate: 'Issued 2023 · Active',
          credentialId: 'GIAC-GREM-7714',
          isVerifiedBadge: true
        }
      ],
      publications: [
        {
          title: 'Bypassing Userland EDR API Hooks via Memory Unhooking and Indirect Syscall Stubs',
          publisher: 'ConnectIn Offensive Cyber Intelligence',
          date: 'March 2026',
          type: 'Technical Report' as const,
          summary: 'In-depth analysis of SSN resolution techniques from pristine ntdll disk bytes to execute covert API invocations.',
          link: '#',
          citationsCount: 88
        }
      ],
      reviews: [
        {
          reviewerName: 'James Kowalski',
          reviewerRole: 'SCADA / ICS OT Security Specialist',
          reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
          rating: 5,
          date: '2 weeks ago',
          reviewType: 'Security Review' as const,
          comment: 'Tariq’s adversary emulation and command-and-control simulation exposed critical defensive blindspots in our perimeter before real threat actors could.'
        }
      ]
    }
  }

  // Default fallback
  return {
    portfolio: WORKSPACE_PORTFOLIO_DATA,
    verifiedSkills: WORKSPACE_VERIFIED_SKILLS_DATA,
    certifications: WORKSPACE_CERTIFICATIONS_DATA,
    publications: WORKSPACE_PUBLICATIONS_DATA,
    reviews: WORKSPACE_REVIEWS_DATA
  }
}

// ─── 6. PROFESSION-TAILORED PERSONAL BUSINESS WEBSITE & PRODUCTS GENERATOR ─────
export type BusinessThemeColor = 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'teal'

export interface BusinessWebsiteOffering {
  id: string
  title: string
  category: string
  productCategory: VendorProductItem['category']
  price: string
  billingUnit: string
  turnaround: string
  popular?: boolean
  icon: string
  description: string
  deliverables: string[]
  ctaLabel: string
  rating: number
  reviewsCount: number
  activeClientsCount: number
  revenueLabel: string
  leadsCount: number
}

export interface BusinessWebsiteGalleryItem {
  title: string
  subtitle: string
  imageUrl: string
  badge: string
}

export interface BusinessWebsiteFaqItem {
  question: string
  answer: string
}

export interface PersonalBusinessWebsiteData {
  businessName: string
  domainSlug: string
  domainUrl: string
  tagline: string
  heroHeadline: string
  heroSubheadline: string
  heroBannerImage: string
  themeColor: BusinessThemeColor
  industryLabel: string
  professionTitle: string
  resolvedEnclaveId: string
  licenseNumber: string
  insuredStatus: string
  yearsInBusiness: string
  location: string
  serviceArea: string
  operatingHours: string
  phoneDisplay: string
  emailDisplay: string
  rating: number
  reviewsCount: number
  completedJobsCount: string
  responseTime: string
  aboutStory: string
  missionStatement: string
  valueProps: { icon: string; title: string; description: string }[]
  offerings: BusinessWebsiteOffering[]
  gallery: BusinessWebsiteGalleryItem[]
  credentialsBadges: string[]
  testimonials: {
    clientName: string
    clientRole: string
    rating: number
    date: string
    quote: string
  }[]
  faqs: BusinessWebsiteFaqItem[]
}

export interface UserProfessionResolution {
  enclaveId: string
  professionTitle: string
  subArchetype:
    | 'veterinary'
    | 'clinical'
    | 'plumbing'
    | 'electrical'
    | 'hvac'
    | 'roofing'
    | 'painting'
    | 'welding'
    | 'locksmith'
    | 'cleaning'
    | 'landscaping'
    | 'masonry'
    | 'appliance'
    | 'moving'
    | 'pest_restoration'
    | 'pool_outdoor'
    | 'carpentry_handyman'
    | 'automotive'
    | 'cybersecurity'
    | 'software'
    | 'legal'
    | 'finance'
    | 'culinary'
    | 'wellness'
    | 'commerce'
    | 'general'
}

export interface UserProfileLike {
  id?: string
  name?: string
  email?: string
  headline?: string
  profession?: string
  professionId?: string
  professionCategory?: string
  professionEnclave?: string
  location?: string
  about?: string
  company?: string
  avatar?: string
  coverImage?: string
  phone?: string
}

export function resolveUserProfessionAndEnclave(user?: UserProfileLike | null): UserProfessionResolution {
  const profDef = user?.professionId ? findProfessionById(user.professionId) : undefined
  const rawEnclave = user?.professionEnclave || profDef?.enclaveId || ''
  const combined = `${user?.profession || ''} ${profDef?.title || ''} ${user?.headline || ''} ${user?.about || ''} ${user?.professionId || ''}`.toLowerCase()

  const pickProfessionTitle = (fallback: string): string => {
    if (user?.profession && user.profession.trim() && user.profession.toLowerCase() !== 'verified connectln professional') {
      return user.profession.trim()
    }
    if (profDef?.title) return profDef.title
    const head = (user?.headline || '').split(/[·\-|]/)[0]?.trim()
    if (head && head.length >= 3 && head.length <= 68) return head
    return fallback
  }

  // 1. Healthcare & Veterinary (check before generic construction)
  if (/veterinar|dvm\b|small animal|animal surgery|pet clinic|equine/.test(combined)) {
    return {
      enclaveId: 'healthcare_medicine',
      professionTitle: pickProfessionTitle('Doctor of Veterinary Medicine (DVM)'),
      subArchetype: 'veterinary'
    }
  }
  if (
    rawEnclave === 'healthcare_medicine' ||
    /\b(nurse|rn|bsn|ccrn|lpn|physician|surgeon|medical|pharmacology|trauma|icu|clinical|dentist|pharmacist|therapist|evs|cleanroom)\b/.test(combined)
  ) {
    return {
      enclaveId: 'healthcare_medicine',
      professionTitle: pickProfessionTitle('Clinical Healthcare & Medical Specialist'),
      subArchetype: 'clinical'
    }
  }

  // 2. Cybersecurity vs Software/Cloud
  if (
    rawEnclave === 'tech_cybersecurity' ||
    /\b(ciso|chief security|cyber|zero trust|red team|appsec|devsecops|fedramp|cato|scada|ebpf|penetration|oscp|cissp)\b/.test(combined)
  ) {
    return {
      enclaveId: 'tech_cybersecurity',
      professionTitle: pickProfessionTitle('Principal Cybersecurity & Cloud Defense Architect'),
      subArchetype: 'cybersecurity'
    }
  }
  if (
    rawEnclave === 'tech_software' ||
    /\b(software|full-stack|frontend|backend|ai engineer|ml engineer|cloud architect|devops|saas|developer)\b/.test(combined)
  ) {
    return {
      enclaveId: 'tech_software',
      professionTitle: pickProfessionTitle('Cloud Software & AI Systems Architect'),
      subArchetype: 'software'
    }
  }

  // 3. Law & Finance
  if (
    rawEnclave === 'law_gov_defense' ||
    /\b(attorney|lawyer|counsel|jd\b|paralegal|federal procurement|far\/dfars|litigation|legal|judge)\b/.test(combined)
  ) {
    return {
      enclaveId: 'law_gov_defense',
      professionTitle: pickProfessionTitle('Attorney & Legal Counsel'),
      subArchetype: 'legal'
    }
  }
  if (
    rawEnclave === 'finance_accounting' ||
    /\b(cpa|accountant|bookkeep|financial|tax advisor|underwriter|claims adjuster|actuary|wealth)\b/.test(combined)
  ) {
    return {
      enclaveId: 'finance_accounting',
      professionTitle: pickProfessionTitle('CPA & Financial Advisory Specialist'),
      subArchetype: 'finance'
    }
  }

  // 4. Automotive, EV & Fleet Repair
  if (
    rawEnclave === 'automotive_mechanics' ||
    /\b(mechanic|automotive|800v|ev powertrain|can-fd|diesel|cummins|tire|brake|oil change|auto detail|windshield|roadside|small engine|motorcycle|outboard|fleet|trucker|cdl)\b/.test(combined)
  ) {
    return {
      enclaveId: 'automotive_mechanics',
      professionTitle: pickProfessionTitle('Master Automotive & EV Diagnostic Specialist'),
      subArchetype: 'automotive'
    }
  }

  // 5. Culinary, Wellness, Commerce
  if (
    rawEnclave === 'culinary_hospitality_events' ||
    /\b(chef|culinary|catering|food truck|bakery|pastry|hospitality|sommelier|banquet)\b/.test(combined)
  ) {
    return {
      enclaveId: 'culinary_hospitality_events',
      professionTitle: pickProfessionTitle('Executive Chef & Hospitality Operator'),
      subArchetype: 'culinary'
    }
  }
  if (
    rawEnclave === 'personal_services_wellness' ||
    /\b(barber|hairstylist|cosmetolog|esthetician|massage|fitness|personal trainer|doula|nanny|housekeeper)\b/.test(combined)
  ) {
    return {
      enclaveId: 'personal_services_wellness',
      professionTitle: pickProfessionTitle('Personal Care & Wellness Specialist'),
      subArchetype: 'wellness'
    }
  }
  if (
    rawEnclave === 'commerce_small_business' ||
    /\b(realtor|real estate|broker|e-commerce|merchant|retail|store owner|moving crew|piano mover)\b/.test(combined)
  ) {
    return {
      enclaveId: 'commerce_small_business',
      professionTitle: pickProfessionTitle('Real Estate & Small Business Operator'),
      subArchetype: 'commerce'
    }
  }

  // 6. Specific Trades & 250 Field Professions
  if (/\b(plumb|pipefit|drain|sewer|water heater|tankless|leak detection|water filtration|septic|sump pump|backflow)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Licensed Master Plumber & Water Systems Specialist'),
      subArchetype: 'plumbing'
    }
  }
  if (/\b(electric|panel technician|ev charging|solar electrical|generator|low-voltage|smart home wiring|lighting installation|ceiling fan|smart home|wi-fi|network cabling|home theater|tv mounting|fiber optic)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Licensed Electrician & Smart Power Specialist'),
      subArchetype: 'electrical'
    }
  }
  if (/\b(hvac|air conditioning|heating|furnace|boiler|heat pump|refrigeration|air duct|thermostat|ventilation|indoor air)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Certified HVAC & Refrigeration Specialist'),
      subArchetype: 'hvac'
    }
  }
  if (/\b(roof|shingle|gutter|siding|cladding|chimney|skylight)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Roofing, Gutter & Exterior Specialist'),
      subArchetype: 'roofing'
    }
  }
  if (/\b(paint|wallpaper|drywall|plaster|texture coating)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Master Painter & Wall Finishing Contractor'),
      subArchetype: 'painting'
    }
  }
  if (/\b(weld|metal fabricat|ironworker|steel|sheet metal|aluminum)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Certified Master Welder & Metal Fabricator'),
      subArchetype: 'welding'
    }
  }
  if (/\b(locksmith|safe|vault|smart lock|access control|security camera|alarm system|video doorbell|gate access|intercom)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Master Locksmith & Security Systems Specialist'),
      subArchetype: 'locksmith'
    }
  }
  if (/\b(clean|janitorial|housekeeping|upholstery|pressure wash|floor buffing|tile and grout|window clean)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Commercial & Residential Cleaning Specialist'),
      subArchetype: 'cleaning'
    }
  }
  if (/\b(landscap|lawn care|garden|tree trim|arborist|hedge|irrigation|mulch|hardscape|snow removal|leaf removal)\b/.test(combined)) {
    return {
      enclaveId: rawEnclave === 'agriculture_natural_resources' ? 'agriculture_natural_resources' : 'trades_construction',
      professionTitle: pickProfessionTitle('Landscaping, Arboriculture & Outdoor Specialist'),
      subArchetype: 'landscaping'
    }
  }
  if (/\b(mason|brick|concrete|foundation|stone|retaining wall|patio|driveway|sidewalk|paver|structural engineering|timber bent)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Masonry, Concrete & Structural Construction Specialist'),
      subArchetype: 'masonry'
    }
  }
  if (/\b(appliance|refrigerator|washing machine|dryer|dishwasher|oven|stove|microwave|garbage disposal|ice maker)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Certified Appliance Repair & Installation Tech'),
      subArchetype: 'appliance'
    }
  }
  if (/\b(mover|moving|packing|furniture assembl|exercise equipment|playground equipment|shelving|closet|storage system)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Moving, Assembly & Installation Specialist'),
      subArchetype: 'moving'
    }
  }
  if (/\b(pest|termite|rodent|wildlife|mosquito|mold|water damage|fire damage|odor|crawl space)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Pest Control & Environmental Restoration Specialist'),
      subArchetype: 'pest_restoration'
    }
  }
  if (/\b(pool|hot tub|outdoor kitchen|pergola|gazebo|awning|holiday lighting|junk removal|dumpster)\b/.test(combined)) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Pool, Outdoor Living & Property Services Pro'),
      subArchetype: 'pool_outdoor'
    }
  }
  if (
    rawEnclave === 'trades_construction' ||
    /\b(handyman|carpenter|cabinet|woodwork|flooring|tile|hardwood|carpet|vinyl|epoxy|remodel|garage door|insulation|weatherization|accessibility|grab bar|contractor|maintenance|repair|door|window)\b/.test(combined)
  ) {
    return {
      enclaveId: 'trades_construction',
      professionTitle: pickProfessionTitle('Licensed Skilled Trades & Property Specialist'),
      subArchetype: 'carpentry_handyman'
    }
  }

  if (rawEnclave) {
    return {
      enclaveId: rawEnclave,
      professionTitle: pickProfessionTitle(findEnclaveById(rawEnclave)?.shortName || 'Verified Professional'),
      subArchetype: 'general'
    }
  }

  return {
    enclaveId: 'trades_construction',
    professionTitle: pickProfessionTitle('Skilled Trades & Craftsmanship Professional'),
    subArchetype: 'carpentry_handyman'
  }
}

function slugifyBusinessUrl(raw: string): string {
  return (
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 38) || 'connectln-pro'
  )
}

function cleanUserDisplayName(rawName?: string): string {
  const base = (rawName || 'ConnectLn Pro').replace(/\([^)]*\)/g, '').trim()
  return base || 'ConnectLn Pro'
}

export function getTailoredUserProductsAndBusiness(user?: UserProfileLike | null): {
  resolution: UserProfessionResolution
  business: PersonalBusinessWebsiteData
  products: VendorProductItem[]
} {
  const resolution = resolveUserProfessionAndEnclave(user)
  const cleanName = cleanUserDisplayName(user?.name)
  const firstName = cleanName.split(' ')[0] || cleanName
  const lastName = cleanName.split(' ').slice(-1)[0] || firstName
  const locationText = (user?.location || 'United States · Verified Regional Coverage').split('·')[0].trim()
  const profTitle = resolution.professionTitle
  const enclaveName = findEnclaveById(resolution.enclaveId)?.shortName || 'Verified Professional'
  const emailHandle = slugifyBusinessUrl(cleanName)
  const licenseCode = `CLN-${resolution.subArchetype.toUpperCase().slice(0, 4)}-${Math.abs(
    cleanName.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7)
  )
    .toString()
    .slice(0, 6)}`

  const buildDefaultWebsite = (cfg: {
    businessName: string
    tagline: string
    heroHeadline: string
    heroSubheadline: string
    heroBannerImage: string
    themeColor: BusinessThemeColor
    industryLabel: string
    insuredStatus: string
    yearsInBusiness: string
    serviceArea: string
    operatingHours: string
    completedJobsCount: string
    responseTime: string
    aboutStory: string
    missionStatement: string
    valueProps: { icon: string; title: string; description: string }[]
    offerings: BusinessWebsiteOffering[]
    gallery: BusinessWebsiteGalleryItem[]
    credentialsBadges: string[]
    testimonials: { clientName: string; clientRole: string; rating: number; date: string; quote: string }[]
    faqs: BusinessWebsiteFaqItem[]
  }): PersonalBusinessWebsiteData => {
    const domainSlug = slugifyBusinessUrl(cfg.businessName)
    return {
      businessName: cfg.businessName,
      domainSlug,
      domainUrl: `https://${domainSlug}.conectln.com`,
      tagline: cfg.tagline,
      heroHeadline: cfg.heroHeadline,
      heroSubheadline: cfg.heroSubheadline,
      heroBannerImage: cfg.heroBannerImage,
      themeColor: cfg.themeColor,
      industryLabel: cfg.industryLabel,
      professionTitle: profTitle,
      resolvedEnclaveId: resolution.enclaveId,
      licenseNumber: licenseCode,
      insuredStatus: cfg.insuredStatus,
      yearsInBusiness: cfg.yearsInBusiness,
      location: locationText,
      serviceArea: cfg.serviceArea,
      operatingHours: cfg.operatingHours,
      phoneDisplay: user?.phone || '(555) 234-8910 · Direct Business Line',
      emailDisplay: `hello@${domainSlug}.conectln.com`,
      rating: 4.97,
      reviewsCount: 64,
      completedJobsCount: cfg.completedJobsCount,
      responseTime: cfg.responseTime,
      aboutStory: cfg.aboutStory,
      missionStatement: cfg.missionStatement,
      valueProps: cfg.valueProps,
      offerings: cfg.offerings,
      gallery: cfg.gallery,
      credentialsBadges: cfg.credentialsBadges,
      testimonials: cfg.testimonials,
      faqs: cfg.faqs
    }
  }

  let business: PersonalBusinessWebsiteData

  switch (resolution.subArchetype) {
    case 'veterinary':
      business = buildDefaultWebsite({
        businessName: `Dr. ${lastName} Companion Animal & Veterinary Surgery Clinic`,
        tagline: 'Compassionate Small Animal Surgery, Clinical Pharmacology & Preventive Pet Wellness',
        heroHeadline: 'Trusted Veterinary Care, Soft-Tissue Surgery & Preventive Wellness Under One Roof',
        heroSubheadline: `Led by Dr. ${cleanName} (${profTitle}), our practice delivers hospital-grade diagnostics, individualized pharmacology protocols, and gentle surgical care for companion animals.`,
        heroBannerImage: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200&auto=format&fit=crop&q=80',
        themeColor: 'emerald',
        industryLabel: 'Veterinary Medicine & Surgery',
        insuredStatus: 'DVM State Licensed & DEA / AVMA Insured',
        yearsInBusiness: '11+ Years Clinical Practice',
        serviceArea: `${locationText} Metro & Tele-Vet Consultations Nationwide`,
        operatingHours: 'Mon–Sat · 8:00 AM – 6:30 PM (+ 24/7 Urgent Tele-Triage)',
        completedJobsCount: '3,400+ Patients Treated',
        responseTime: 'Under 30 Mins',
        aboutStory: `Dr. ${cleanName} founded this veterinary clinic to give pet families direct access to transparent clinical pricing, evidence-based veterinary pharmacology, and calmer low-stress surgical visits without corporate hospital red tape.`,
        missionStatement: 'Clinical excellence paired with compassionate communication for every pet and owner.',
        valueProps: [
          { icon: '🩺', title: 'Fear-Free Clinical Exams', description: 'Unrushed 45-minute wellness and diagnostic consultations tailored to your pet.' },
          { icon: '💊', title: 'Compounded Pharmacology', description: 'Precision weight-dosed medication, pain management, and preventive pharmacy refills.' },
          { icon: '🔬', title: 'In-House Lab & Surgery', description: 'Same-day blood chemistry, digital ultrasound, and soft-tissue surgical suites.' }
        ],
        offerings: [
          {
            id: `off_${emailHandle}_1`,
            title: 'Comprehensive Wellness, Vaccine & Preventive Care Visit',
            category: 'Clinical Services',
            productCategory: 'Clinical Services',
            price: '$145',
            billingUnit: 'Per Visit',
            turnaround: 'Same-Day / 45-Min Exam',
            popular: true,
            icon: '🐾',
            description: 'Full nose-to-tail physical exam, core immunizations, parasite screening, and personalized nutrition + preventive care roadmap.',
            deliverables: ['45-min DVM physical examination', 'Core vaccines & titer review', 'Fecal & heartworm lab panel', 'Written home-care summary'],
            ctaLabel: 'Book Wellness Exam',
            rating: 4.99,
            reviewsCount: 84,
            activeClientsCount: 192,
            revenueLabel: '$27,840 / yr Clinic',
            leadsCount: 29
          },
          {
            id: `off_${emailHandle}_2`,
            title: 'Companion Animal Soft-Tissue & Spay/Neuter Surgical Package',
            category: 'Surgery & Procedures',
            productCategory: 'Services',
            price: '$680',
            billingUnit: 'All-Inclusive Package',
            turnaround: 'Pre-Op + Same-Day Discharge',
            icon: '🏥',
            description: 'Modern monitored anesthesia surgery including pre-op bloodwork, multi-modal pain pharmacology, heated recovery, and 14-day recheck.',
            deliverables: ['Pre-anesthetic organ function panel', 'Dedicated continuous vitals monitoring', 'Take-home analgesia & antibiotics', '14-day suture & recovery follow-up'],
            ctaLabel: 'Schedule Surgical Consult',
            rating: 5.0,
            reviewsCount: 41,
            activeClientsCount: 68,
            revenueLabel: '$46,240 / yr Clinic',
            leadsCount: 16
          },
          {
            id: `off_${emailHandle}_3`,
            title: '24/7 Tele-Veterinary Triage & Pharmacy Care Membership',
            category: 'Care Plans & Shop',
            productCategory: 'Trade Plans',
            price: '$39 / mo',
            billingUnit: 'Monthly Pet Care Plan',
            turnaround: 'Instant Video & RX Support',
            icon: '💊',
            description: 'Direct video & chat access to our veterinary team for urgent symptom triage, dosage guidance, and direct pharmacy refill coordination.',
            deliverables: ['Unlimited tele-vet chat & triage', 'Priority same-day clinic slots', 'Quarterly preventive wellness check-in', '15% member savings on labs & RX'],
            ctaLabel: 'Enroll Pet Plan',
            rating: 4.96,
            reviewsCount: 53,
            activeClientsCount: 145,
            revenueLabel: '$5,655 / mo MRR',
            leadsCount: 34
          }
        ],
        gallery: [
          {
            title: 'Low-Stress Small Animal Diagnostic Suite',
            subtitle: 'Digital radiography & rapid clinical lab results during your visit',
            imageUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=700&auto=format&fit=crop&q=80',
            badge: 'Diagnostics'
          },
          {
            title: 'Monitored Soft-Tissue Surgical Care',
            subtitle: 'Multi-parameter anesthesia telemetry and dedicated recovery nurse',
            imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=700&auto=format&fit=crop&q=80',
            badge: 'Surgery Suite'
          },
          {
            title: 'Tailored Preventive & Senior Pet Wellness',
            subtitle: 'Pharmacology pain plans & mobility optimization for aging companions',
            imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=700&auto=format&fit=crop&q=80',
            badge: 'Preventive Care'
          }
        ],
        credentialsBadges: [
          'DVM Licensed & State Board Verified',
          'AVMA Ethics & Surgical Standards',
          'In-House Lab & Digital Ultrasound',
          'Transparent Upfront Estimates'
        ],
        testimonials: [
          {
            clientName: 'Marcus & Elena Rivera',
            clientRole: 'Dog Owners · Preventive & Surgical Care',
            rating: 5,
            date: '2 weeks ago',
            quote: `Dr. ${cleanName} caught an early drug sensitivity before our Golden Retriever's procedure and walked us through every step with calm, unmatched clinical care.`
          },
          {
            clientName: 'Hannah Brooks',
            clientRole: 'Multi-Pet Household & Rescue Coordinator',
            rating: 5,
            date: '1 month ago',
            quote: 'Upfront pricing, zero surprise bills, and the 24/7 tele-triage plan saved us two unnecessary ER trips.'
          }
        ],
        faqs: [
          {
            question: 'Do I receive an exact written estimate before any lab or surgical procedure?',
            answer: 'Yes. Every diagnostic workup and surgical plan includes an itemized upfront estimate prior to treatment.'
          },
          {
            question: 'Are tele-veterinary consultations available for current and new clients?',
            answer: 'Yes, tele-triage consultations and medication reviews can be booked directly through this website.'
          },
          {
            question: 'How do prescription refills and dietary products ship or get picked up?',
            answer: 'Refills approved by Dr. ' + lastName + ' are ready for same-day pickup or direct-to-door cold-chain courier.'
          }
        ]
      })
      break

    case 'clinical':
      business = buildDefaultWebsite({
        businessName: `${cleanName} Clinical Practice & Health Advisory`,
        tagline: 'Board-Verified Patient Care, Telehealth Consultations & Clinical Care Coordination',
        heroHeadline: 'Evidence-Based Clinical Care, Diagnostics & Direct Patient Advocacy',
        heroSubheadline: `Operated by ${cleanName} (${profTitle}), offering responsive clinical consultations, chronic-care protocols, and healthcare team advisory.`,
        heroBannerImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80',
        themeColor: 'teal',
        industryLabel: 'Healthcare & Clinical Medicine',
        insuredStatus: 'Board Verified & Malpractice Insured',
        yearsInBusiness: '12+ Years Clinical Leadership',
        serviceArea: `${locationText} & HIPAA Telehealth`,
        operatingHours: 'Mon–Fri · 7:30 AM – 6:00 PM · Urgent Consults Daily',
        completedJobsCount: '4,200+ Clinical Encounters',
        responseTime: 'Under 45 Mins',
        aboutStory: `${cleanName} provides high-touch clinical services, second-opinion chart reviews, and preventive health programs built around clarity, clinical rigor, and rapid access.`,
        missionStatement: 'Timely, thorough clinical expertise without weeks of waiting-room delays.',
        valueProps: [
          { icon: '🩺', title: 'Direct Clinician Access', description: 'One-on-one consultations without rushed 7-minute insurance-mill appointments.' },
          { icon: '📋', title: 'Actionable Care Plans', description: 'Clear lab interpretation, medication reconciliation, and specialist coordination.' },
          { icon: '🔒', title: 'HIPAA-Ready Workflows', description: 'Private documentation, encrypted intake, and verified ConnectLn credentials.' }
        ],
        offerings: [
          {
            id: `off_${emailHandle}_1`,
            title: 'Comprehensive Clinical Consultation & Care Plan',
            category: 'Clinical Services',
            productCategory: 'Clinical Services',
            price: '$175',
            billingUnit: 'Per Consultation',
            turnaround: 'Same-Day / 48-Hr Slot',
            popular: true,
            icon: '🩺',
            description: 'In-depth medical review, symptom evaluation, lab/imaging interpretation, and written follow-up care plan.',
            deliverables: ['60-min video or in-clinic evaluation', 'Complete lab & medication reconciliation', 'Written care & recovery roadmap', '7-day follow-up check-in'],
            ctaLabel: 'Book Consultation',
            rating: 4.98,
            reviewsCount: 62,
            activeClientsCount: 140,
            revenueLabel: '$24,500 / qtr Practice',
            leadsCount: 24
          },
          {
            id: `off_${emailHandle}_2`,
            title: 'Surgical / Complex Recovery Monitoring Retainer',
            category: 'Care Plans',
            productCategory: 'Trade Plans',
            price: '$295 / mo',
            billingUnit: 'Monthly Care Plan',
            turnaround: 'Priority Daily Access',
            icon: '🏥',
            description: 'Structured post-discharge vitals, wound/recovery oversight, and direct clinical Q&A for families.',
            deliverables: ['Weekly clinician progress reviews', 'Caregiver protocol & red-flag checklist', 'Pharmacy & specialist coordination'],
            ctaLabel: 'Start Care Plan',
            rating: 4.97,
            reviewsCount: 38,
            activeClientsCount: 42,
            revenueLabel: '$12,390 / mo MRR',
            leadsCount: 15
          },
          {
            id: `off_${emailHandle}_3`,
            title: 'Healthcare Staff Competency & Clinical SOP Training',
            category: 'Training & Advisory',
            productCategory: 'Training',
            price: '$1,450',
            billingUnit: 'Facility Workshop',
            turnaround: 'Scheduled On-Site / Live',
            icon: '🎓',
            description: 'Hands-on clinical team protocols, triage checklists, and sterile/emergency readiness training.',
            deliverables: ['Live 4-hour clinical workshop', 'Custom clinic SOP binder', 'CE/competency verification log'],
            ctaLabel: 'Request Facility Quote',
            rating: 5.0,
            reviewsCount: 19,
            activeClientsCount: 18,
            revenueLabel: '$26,100 / yr Advisory',
            leadsCount: 9
          }
        ],
        gallery: [
          {
            title: 'Comprehensive Clinical Assessment',
            subtitle: 'Thorough lab diagnostics and clear care roadmaps',
            imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&auto=format&fit=crop&q=80',
            badge: 'Clinical Care'
          },
          {
            title: 'Critical & Trauma Readiness Advisory',
            subtitle: 'Evidence-based clinical protocols and resuscitation standards',
            imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=700&auto=format&fit=crop&q=80',
            badge: 'Board Verified'
          },
          {
            title: 'Telehealth & Post-Care Follow-Up',
            subtitle: 'Accessible recovery guidance from home',
            imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&auto=format&fit=crop&q=80',
            badge: 'Telehealth'
          }
        ],
        credentialsBadges: [
          'Board-Verified Clinician Credentials',
          'HIPAA-Aligned Consult Workflow',
          'Upfront Transparent Pricing',
          'Direct Messaging & Follow-Up'
        ],
        testimonials: [
          {
            clientName: 'Dr. Aris Thorne',
            clientRole: 'Attending Physician · Clinical Peer',
            rating: 5,
            date: '3 weeks ago',
            quote: `${cleanName} combines sharp diagnostic judgment with uncommon clarity when coordinating complex care transitions.`
          }
        ],
        faqs: [
          {
            question: 'Can appointments be completed via secure telehealth or in-person?',
            answer: 'Both options are available — select your preference in the booking form below.'
          },
          {
            question: 'Do you coordinate with existing specialists and pharmacies?',
            answer: 'Yes, written care summaries can be shared with your primary team upon your request.'
          }
        ]
      })
      break

    case 'plumbing':
      business = buildDefaultWebsite({
        businessName: `${cleanName} Master Plumbing, Drain & Water Systems`,
        tagline: `Licensed ${profTitle} · 24/7 Emergency Leaks, Tankless Water Heaters & Hydro-Jetting`,
        heroHeadline: 'Fast, Code-Certified Plumbing, Leak Detection & Tankless Water Systems',
        heroSubheadline: `Locally owned and led by ${cleanName} (${profTitle}). Clean workmanship, upfront flat-rate pricing before we turn a wrench, and warranty-backed repairs.`,
        heroBannerImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&auto=format&fit=crop&q=80',
        themeColor: 'blue',
        industryLabel: 'Plumbing & Water Systems',
        insuredStatus: 'Licensed, Bonded & $2M Liability Insured',
        yearsInBusiness: '14+ Years Field Experience',
        serviceArea: `${locationText} & 40-Mile Dispatch Zone`,
        operatingHours: 'Mon–Sat · 7:00 AM – 7:00 PM (+ 24/7 Emergency Dispatch)',
        completedJobsCount: '2,850+ Repairs & Installs',
        responseTime: '45–60 Min Emergency Arrival',
        aboutStory: `Whether it's an urgent slab leak, main sewer line backup, or full tankless water heater conversion, ${cleanName} shows up on time in fully stocked service trucks to solve the root cause on the first visit.`,
        missionStatement: 'Zero shortcuts, neat copper/PEX routing, and honest flat-rate pricing every single job.',
        valueProps: [
          { icon: '🚰', title: 'Upfront Flat-Rate Quotes', description: 'See the exact guaranteed price before work begins — zero hourly surprises.' },
          { icon: '📹', title: 'HD Sewer Camera & Hydro-Jet', description: 'Pinpoint blockages, roots, and pipe corrosion without destructive digging.' },
          { icon: '🛡️', title: '2-Year Workmanship Warranty', description: 'All parts and labor backed by licensed code sign-off and warranty.' }
        ],
        offerings: [
          {
            id: `off_${emailHandle}_1`,
            title: 'Emergency Leak Detection, Drain Clearing & Sewer Camera Scope',
            category: 'Emergency Services',
            productCategory: 'Services',
            price: '$165',
            billingUnit: 'Diagnostic & Clear',
            turnaround: 'Same-Day / 60-Min Dispatch',
            popular: true,
            icon: '🚿',
            description: 'Non-invasive acoustic/thermal leak pinpoint, motorized auger or hydro-jet drain clearing, and recorded HD sewer camera inspection.',
            deliverables: ['Electronic leak & pressure test', 'Mainline clog clearing', 'Recorded sewer line video report', 'Written repair options'],
            ctaLabel: 'Book Dispatch Now',
            rating: 4.98,
            reviewsCount: 92,
            activeClientsCount: 310,
            revenueLabel: '$14,850 / mo Avg',
            leadsCount: 41
          },
          {
            id: `off_${emailHandle}_2`,
            title: 'Tankless Water Heater Supply, Install & Code Sign-Off',
            category: 'Installations',
            productCategory: 'Enterprise Solutions',
            price: '$1,850',
            billingUnit: 'Turnkey Install',
            turnaround: '1-Day Installation',
            icon: '🔥',
            description: 'High-efficiency condensing tankless water heater installation with gas/electrical sizing, descaling isolation valves, and municipal code permit.',
            deliverables: ['Old tank haul-away & disposal', 'Service flush isolation valve kit', 'Copper/PEX manifold upgrade', '5-yr labor & factory warranty'],
            ctaLabel: 'Request Free Estimate',
            rating: 5.0,
            reviewsCount: 47,
            activeClientsCount: 74,
            revenueLabel: '$18,500 / mo Avg',
            leadsCount: 22
          },
          {
            id: `off_${emailHandle}_3`,
            title: 'Annual Whole-Home Plumbing & Backflow Maintenance Plan',
            category: 'Maintenance Plans',
            productCategory: 'Trade Plans',
            price: '$29 / mo',
            billingUnit: 'Property Protection Plan',
            turnaround: 'Priority Scheduling',
            icon: '🛡️',
            description: 'Annual water heater flush, PRV pressure valve audit, shutoff valve tagging, and priority zero-dispatch-fee emergency response.',
            deliverables: ['Annual water heater descaling', '60-point pipe & fixture safety check', 'Waived after-hours dispatch fees', '15% discount on repairs'],
            ctaLabel: 'Join Care Plan',
            rating: 4.95,
            reviewsCount: 58,
            activeClientsCount: 184,
            revenueLabel: '$5,336 / mo MRR',
            leadsCount: 33
          }
        ],
        gallery: [
          {
            title: 'Precision Copper & Tankless Manifold',
            subtitle: 'Clean isolation valve layout and recirculating loop installation',
            imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=700&auto=format&fit=crop&q=80',
            badge: 'Water Heaters'
          },
          {
            title: 'Commercial Backflow & Hydronics',
            subtitle: 'Certified RPZ testing and multi-zone manifold balancing',
            imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&auto=format&fit=crop&q=80',
            badge: 'Commercial Code'
          },
          {
            title: 'Whole-Home Filtration & Softeners',
            subtitle: 'Activated carbon and sediment protection for residential lines',
            imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&auto=format&fit=crop&q=80',
            badge: 'Water Quality'
          }
        ],
        credentialsBadges: [
          'State Master Plumber License',
          '$2M General Liability & Bonded',
          'Upfront Flat-Rate Price Book',
          '2-Year Workmanship Guarantee'
        ],
        testimonials: [
          {
            clientName: 'Derrick Coleman',
            clientRole: 'Property Manager · 18-Unit Townhomes',
            rating: 5,
            date: '5 days ago',
            quote: `${cleanName} diagnosed a hidden PRV failure and upgraded three tankless systems with spotless copper work. Best plumber on our vendor roster.`
          }
        ],
        faqs: [
          {
            question: 'Do you charge extra for weekend or evening emergencies?',
            answer: 'We quote a clear flat rate upfront before any repair starts — members on our $29/mo Maintenance Plan pay $0 dispatch fee.'
          },
          {
            question: 'Do you pull municipal permits and handle inspections?',
            answer: 'Yes, all water heater, repipe, and sewer replacements include required permit filing and inspector sign-off.'
          }
        ]
      })
      break

    case 'electrical':
      business = buildDefaultWebsite({
        businessName: `${cleanName} Licensed Electrical, EV & Smart Power`,
        tagline: `${profTitle} · 200A Panel Upgrades, EV Chargers, Solar & Smart Home Wiring`,
        heroHeadline: 'Code-Safe Electrical Panels, EV Chargers, Generators & Smart Power',
        heroSubheadline: `Master-led electrical contracting by ${cleanName}. NEC 2026 compliant installations for homes, EV fleets, commercial panels, and standby backup power.`,
        heroBannerImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
        themeColor: 'amber',
        industryLabel: 'Electrical, Solar & Smart Wiring',
        insuredStatus: 'Licensed Master Electrician · NEC 2026',
        yearsInBusiness: '15+ Years Electrical Contracting',
        serviceArea: `${locationText} & Regional Commercial Sites`,
        operatingHours: 'Mon–Sat · 7:00 AM – 6:30 PM (+ Emergency Panel Restoration)',
        completedJobsCount: '1,940+ Code-Approved Projects',
        responseTime: 'Same-Day Quotes',
        aboutStory: `${cleanName} specializes in safe, clean, labeled electrical distribution — from 200A/400A main service panels and Level-2 EV chargers to standby generators and Cat6A smart-home automation.`,
        missionStatement: 'Precision torque-spec connections, clean conduit bends, and zero code compromises.',
        valueProps: [
          { icon: '⚡', title: 'NEC 2026 & NFPA 70E Compliant', description: 'Every circuit load-calculated, torque-verified, and neatly directory-labeled.' },
          { icon: '🔌', title: 'Turnkey EV & Solar Integration', description: 'Permit-ready Level 2 chargers, load-management relays, and battery backup.' },
          { icon: '🏠', title: 'Clean Low-Voltage & Smart Tech', description: 'Concealed recessed lighting, Wi-Fi 7 backhaul, PoE cameras, and smart dimmers.' }
        ],
        offerings: [
          {
            id: `off_${emailHandle}_1`,
            title: 'Level-2 / 80A EV Charging Station Turnkey Installation',
            category: 'EV & Power',
            productCategory: 'Services',
            price: '$650',
            billingUnit: 'Standard Install',
            turnaround: '1-Day Installation',
            popular: true,
            icon: '🔋',
            description: 'Dedicated 60A–80A 240V circuit from panel to garage/driveway with NEMA 14-50 or hardwired Wall Connector + utility rebate paperwork.',
            deliverables: ['NEC load calculation & breaker install', 'EMT conduit or recessed wall run', 'Torque-tested GFCI/EVSE commissioning', '5-year installation warranty'],
            ctaLabel: 'Book EV Charger Install',
            rating: 4.99,
            reviewsCount: 108,
            activeClientsCount: 245,
            revenueLabel: '$19,500 / mo Avg',
            leadsCount: 44
          },
          {
            id: `off_${emailHandle}_2`,
            title: '200A Main Service Panel Upgrade & Whole-Home Surge Protection',
            category: 'Panel Upgrades',
            productCategory: 'Enterprise Solutions',
            price: '$2,150',
            billingUnit: 'Turnkey Permit Package',
            turnaround: '1–2 Days With Utility Coord',
            icon: '⚡',
            description: 'Replace outdated fuse boxes or overloaded 100A panels with a modern 200A Square D / Eaton copper-bus panel, Type-1 surge protector, and grounding.',
            deliverables: ['Utility disconnect/reconnect coordination', 'New 200A copper-bus panel + AFCI/GFCI', 'Dual copper ground rods & bonding', 'Municipal inspection sign-off'],
            ctaLabel: 'Get Panel Upgrade Quote',
            rating: 5.0,
            reviewsCount: 64,
            activeClientsCount: 92,
            revenueLabel: '$25,800 / mo Avg',
            leadsCount: 27
          },
          {
            id: `off_${emailHandle}_3`,
            title: 'Smart Home Wiring, Cat6A Mesh & Recessed Lighting Package',
            category: 'Smart Home & Lighting',
            productCategory: 'Trade Plans',
            price: '$420',
            billingUnit: 'Per Zone / Bundle',
            turnaround: 'Same-Week Scheduling',
            icon: '💡',
            description: 'Clean installation of Lutron/smart dimmer switches, 6 LED wafer cans, ceiling fans, or shielded Cat6A PoE security & Wi-Fi drops.',
            deliverables: ['Dust-controlled drywall cutouts', 'App & voice ecosystem pairing', 'Tested PoE / dimmer load balancing'],
            ctaLabel: 'Schedule Upgrade',
            rating: 4.96,
            reviewsCount: 51,
            activeClientsCount: 118,
            revenueLabel: '$11,760 / mo Avg',
            leadsCount: 23
          }
        ],
        gallery: [
          {
            title: '200A Service Panel & Copper Buswork',
            subtitle: 'Laser-straight wire management and Type-1 surge protection',
            imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=700&auto=format&fit=crop&q=80',
            badge: 'Panel Upgrades'
          },
          {
            title: 'Dual EV Charger & Load-Share Setup',
            subtitle: 'Garage & commercial fleet 240V fast charging stations',
            imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=700&auto=format&fit=crop&q=80',
            badge: 'EV Charging'
          },
          {
            title: 'Standby Generator & ATS Transfer',
            subtitle: 'Automatic whole-home power continuity during outages',
            imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=700&auto=format&fit=crop&q=80',
            badge: 'Backup Power'
          }
        ],
        credentialsBadges: [
          'Licensed Master Electrician',
          'NEC 2026 & NFPA 70E Certified',
          'Permit & Utility Coordination Included',
          '5-Year Workmanship Warranty'
        ],
        testimonials: [
          {
            clientName: 'Rachel Kim',
            clientRole: 'Homeowner · 200A Panel + EV Charger',
            rating: 5,
            date: '1 week ago',
            quote: `Best contractor experience we've had. ${cleanName}'s panel wiring looked like museum art and passed city electrical inspection in 5 minutes.`
          }
        ],
        faqs: [
          {
            question: 'Do I need a 200A upgrade to add an EV charger?',
            answer: 'Not always! We perform an NEC load calculation during the quote — often an intelligent load-management controller avoids a costly service upgrade.'
          },
          {
            question: 'Are you licensed and insured for both residential and commercial work?',
            answer: 'Yes — full Master Electrical license, workers comp, and $2M commercial liability coverage.'
          }
        ]
      })
      break

    case 'hvac':
      business = buildDefaultWebsite({
        businessName: `${cleanName} Climate, HVAC & Refrigeration Pros`,
        tagline: `${profTitle} · High-Efficiency Heat Pumps, A/C Repair, Furnaces & Indoor Air`,
        heroHeadline: 'Year-Round Indoor Comfort, Rapid HVAC Repair & Energy-Saving Installs',
        heroSubheadline: `EPA 608 & NATE certified service led by ${cleanName}. Same-day A/C & furnace diagnostics, commercial refrigeration, and Manual J sized heat pump installs.`,
        heroBannerImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&auto=format&fit=crop&q=80',
        themeColor: 'blue',
        industryLabel: 'HVAC, Heating & Refrigeration',
        insuredStatus: 'EPA 608 Universal & NATE Certified',
        yearsInBusiness: '13+ Years HVAC/R Excellence',
        serviceArea: `${locationText} Residential & Commercial`,
        operatingHours: 'Mon–Sun · 7:00 AM – 8:00 PM (No-Heat / No-Cool Priority)',
        completedJobsCount: '3,100+ Systems Serviced',
        responseTime: 'Under 2 Hours',
        aboutStory: `When summer heatwaves or winter freezes hit, ${cleanName} keeps families and commercial kitchens running with honest compressor/board diagnostics instead of pushy upsells.`,
        missionStatement: 'Repair honestly when it saves you money; engineer right-sized replacements when it doesn’t.',
        valueProps: [
          { icon: '❄️', title: 'Same-Day No-Cool / No-Heat', description: 'Fully stocked trucks carrying capacitors, igniters, TXVs, and OEM sensors.' },
          { icon: '🌡️', title: 'Manual J Right-Sizing', description: 'Precision heat-load calculations so new heat pumps cut bills up to 38%.' },
          { icon: '🌬️', title: 'Hospital-Grade Air Quality', description: 'Static-pressure balancing, HEPA filtration, and UV coil sanitization.' }
        ],
        offerings: [
          {
            id: `off_${emailHandle}_1`,
            title: '21-Point Seasonal A/C, Heat Pump & Furnace Tune-Up',
            category: 'Maintenance',
            productCategory: 'Services',
            price: '$129',
            billingUnit: 'Per System',
            turnaround: 'Same-Day / 60-Min Visit',
            popular: true,
            icon: '🌡️',
            description: 'Superheat/subcooling refrigerant check, capacitor microfarad test, blower amp draw, heat-exchanger CO safety scan, and coil rinse.',
            deliverables: ['Digital psychrometric & delta-T report', 'Condenser coil wash & drain clear', 'CO & gas safety calibration'],
            ctaLabel: 'Book Tune-Up ($129)',
            rating: 4.98,
            reviewsCount: 112,
            activeClientsCount: 280,
            revenueLabel: '$12,900 / mo Avg',
            leadsCount: 39
          },
          {
            id: `off_${emailHandle}_2`,
            title: 'High-Efficiency Inverter Heat Pump / A/C Turnkey System',
            category: 'Installations',
            productCategory: 'Enterprise Solutions',
            price: '$4,250',
            billingUnit: 'Starting Complete',
            turnaround: '1-Day Swap + Rebate Filing',
            icon: '❄️',
            description: 'Whisper-quiet variable-speed heat pump with new lineset flush, smart Ecobee/Nest thermostat, and federal/utility IRA tax credit paperwork.',
            deliverables: ['Manual J & D airflow sizing', '10-yr parts + 2-yr labor warranty', 'Federal tax credit certification'],
            ctaLabel: 'Request Free Replacement Quote',
            rating: 5.0,
            reviewsCount: 34,
            activeClientsCount: 52,
            revenueLabel: '$29,750 / mo Avg',
            leadsCount: 18
          },
          {
            id: `off_${emailHandle}_3`,
            title: 'Commercial Walk-In Cooler & Rooftop RTU Priority Plan',
            category: 'Commercial HVAC/R',
            productCategory: 'Trade Plans',
            price: '$195 / mo',
            billingUnit: 'Per Business Location',
            turnaround: '4-Hr SLA Response',
            icon: '🏢',
            description: 'Quarterly condenser cleanings, belt/filter swaps, and priority emergency breakdown coverage for restaurants, clinics, and offices.',
            deliverables: ['Quarterly PM filter & belt service', 'Priority 4-hr emergency SLA', 'Digital health-dept temp logs'],
            ctaLabel: 'Enroll Commercial Plan',
            rating: 4.97,
            reviewsCount: 28,
            activeClientsCount: 36,
            revenueLabel: '$7,020 / mo MRR',
            leadsCount: 12
          }
        ],
        gallery: [
          {
            title: 'Variable-Speed Heat Pump Retrofit',
            subtitle: 'Code-compliant disconnect, surge protector & spotless brazing',
            imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=700&auto=format&fit=crop&q=80',
            badge: 'Heat Pumps'
          },
          {
            title: 'Commercial Rooftop RTU Overhaul',
            subtitle: 'Economizer calibration and three-phase compressor service',
            imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&auto=format&fit=crop&q=80',
            badge: 'Commercial RTU'
          },
          {
            title: 'Smart Zoning & Air Purification',
            subtitle: 'HEPA filtration, ERV fresh-air exchange & smart thermostats',
            imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=700&auto=format&fit=crop&q=80',
            badge: 'Indoor Air'
          }
        ],
        credentialsBadges: [
          'EPA Section 608 Universal License',
          'NATE Certified HVAC/R Technician',
          'EnergyStar & Utility Rebate Partner',
          '100% Satisfaction Warranty'
        ],
        testimonials: [
          {
            clientName: 'Sofia Patel',
            clientRole: 'Restaurateur · Walk-In Freezer + 2x RTUs',
            rating: 5,
            date: '4 days ago',
            quote: `Saved \$8,000 in inventory when our walk-in compressor tripped on a Saturday afternoon. ${cleanName} had us back at 34°F in 90 minutes.`
          }
        ],
        faqs: [
          {
            question: 'Do you repair all major HVAC brands (Carrier, Trane, Lennox, Mitsubishi)?',
            answer: 'Yes, we service and stock OEM parts for all residential split systems, ductless mini-splits, boilers, and commercial RTUs.'
          }
        ]
      })
      break

    case 'automotive':
      business = buildDefaultWebsite({
        businessName: `${cleanName} Auto, 800V EV & Fleet Diagnostics`,
        tagline: `${profTitle} · Mobile Diagnostics, EV Powertrains, Brakes & Commercial Fleet Care`,
        heroHeadline: 'Dealership-Level Oscilloscope Diagnostics & Mobile Fleet Service — Zero Guesswork',
        heroSubheadline: `Run by ${cleanName} (${profTitle}). Equipped with PicoScope CAN-FD lab scopes, 800V EV insulation safety gear, and mobile bay service that comes to your driveway or yard.`,
        heroBannerImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&auto=format&fit=crop&q=80',
        themeColor: 'amber',
        industryLabel: 'Automotive, EV & Fleet Repair',
        insuredStatus: 'ASE Master Certified (A1-A8, L1, L3 EV) & Garage Insured',
        yearsInBusiness: '16+ Years Master Tech',
        serviceArea: `${locationText} Mobile Service & Bay Facility`,
        operatingHours: 'Mon–Sat · 7:30 AM – 6:00 PM (+ Fleet Emergency Callout)',
        completedJobsCount: '4,600+ Vehicles Repaired',
        responseTime: 'Same-Day Mobile Dispatch',
        aboutStory: `Shops often throw expensive parts at check-engine or EV faults without verifying waveforms. ${cleanName} uses 4-channel oscilloscope testing and factory schematics to pinpoint root causes fast on personal vehicles, EVs, and diesel fleets.`,
        missionStatement: 'Diagnose accurately once, verify with waveform proof, and get you back on the road fast.',
        valueProps: [
          { icon: '📊', title: 'Oscilloscope Root-Cause Proof', description: 'Every sensor, CAN-FD bus, and parasitic draw proven with live scope captures.' },
          { icon: '🔋', title: '800V EV & Hybrid Certified', description: 'NFPA 70E high-voltage lockout, battery isolation testing, and thermal care.' },
          { icon: '🚐', title: 'Mobile & Yard-Side Service', description: 'Brakes, starters, batteries, oils, and fleet DOT inspections performed on-site.' }
        ],
        offerings: [
          {
            id: `off_${emailHandle}_1`,
            title: '4-Channel Oscilloscope & Factory Electrical / Check-Engine Diagnostic',
            category: 'Diagnostics',
            productCategory: 'Diagnostics',
            price: '$185',
            billingUnit: 'Deep-Dive Session',
            turnaround: '60–90 Min On-Site / Bay',
            popular: true,
            icon: '📈',
            description: 'Beyond generic OBD2 code-reading: live CAN-FD bus testing, fuel/ignition waveform analysis, parasitic draw isolation, and verified repair blueprint.',
            deliverables: ['Full module topology & bi-directional scan', 'PicoScope live waveform capture PDF', 'Exact part/wiring root-cause report'],
            ctaLabel: 'Book Master Diagnostic',
            rating: 5.0,
            reviewsCount: 124,
            activeClientsCount: 310,
            revenueLabel: '$17,200 / mo Avg',
            leadsCount: 46
          },
          {
            id: `off_${emailHandle}_2`,
            title: '800V EV High-Voltage Battery, Inverter & Thermal Health Audit',
            category: 'EV Powertrain',
            productCategory: 'Services',
            price: '$245',
            billingUnit: 'Pre-Buy / Fault Audit',
            turnaround: 'Same-Day Report',
            icon: '🔋',
            description: 'HV insulation resistance mega-ohm testing, cell-balance delta telemetry, fast-charge thermal valve test, and pre-purchase EV inspection.',
            deliverables: ['HV pack State-of-Health (SoH) % score', 'Inverter & DC-DC converter ripple test', 'Isolation fault & coolant check'],
            ctaLabel: 'Schedule EV Inspection',
            rating: 4.99,
            reviewsCount: 68,
            activeClientsCount: 112,
            revenueLabel: '$11,760 / mo Avg',
            leadsCount: 31
          },
          {
            id: `off_${emailHandle}_3`,
            title: 'Mobile Brakes, Suspension, Synthetic Service & Fleet PM Plan',
            category: 'Mobile & Fleet Care',
            productCategory: 'Trade Plans',
            price: '$295',
            billingUnit: 'Per Axle / Fleet Retainer',
            turnaround: 'At Your Home or Yard',
            icon: '🛠️',
            description: 'OEM-grade ceramic pads, coated rotors, synthetic fluids, tire rotation, and commercial sprinter/truck DOT preventive maintenance.',
            deliverables: ['At-your-driveway mobile service', '24-month / 24,000-mile warranty', 'Digital inspection photos & torque log'],
            ctaLabel: 'Book Mobile Service',
            rating: 4.97,
            reviewsCount: 89,
            activeClientsCount: 164,
            revenueLabel: '$19,470 / mo Avg',
            leadsCount: 37
          }
        ],
        gallery: [
          {
            title: '800V EV Powertrain & Inverter Lab',
            subtitle: 'High-voltage isolation verification and IGBT driver diagnostics',
            imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=700&auto=format&fit=crop&q=80',
            badge: 'EV Powertrain'
          },
          {
            title: '4-Channel CAN-FD Waveform Tracing',
            subtitle: 'Pinpointing intermittent gateway and module bus faults',
            imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=700&auto=format&fit=crop&q=80',
            badge: 'Oscilloscope'
          },
          {
            title: 'Commercial Diesel & Fleet Maintenance',
            subtitle: 'DPF/SCR aftertreatment recovery and yard PM schedules',
            imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&auto=format&fit=crop&q=80',
            badge: 'Commercial Fleet'
          }
        ],
        credentialsBadges: [
          'ASE Master Tech (A1-A8, L1, L3 EV)',
          'NFPA 70E High-Voltage Certified',
          '24-Month / 24k-Mile Parts & Labor Warranty',
          'Mobile Driveway & Yard Dispatch'
        ],
        testimonials: [
          {
            clientName: 'Victor Morales',
            clientRole: 'Commercial Sprinter Fleet Manager',
            rating: 5,
            date: '6 days ago',
            quote: `${cleanName} found a chafed CAN-H wire in 35 minutes after the dealership wanted \$4,200 for a new transmission module.`
          }
        ],
        faqs: [
          {
            question: 'Can you come to my home, office parking lot, or commercial yard?',
            answer: 'Yes! All diagnostics, batteries, brakes, and fleet PM services are fully mobile, and major lifts are handled in our bay.'
          }
        ]
      })
      break

    case 'cybersecurity':
    case 'software': {
      const isCyber = resolution.subArchetype === 'cybersecurity'
      const brandName = user?.company || (cleanName.toLowerCase().includes('kwesi') ? 'Expedite Consults — Cyber Defense & Cloud Architecture' : `${cleanName} ${isCyber ? 'Security & Zero Trust Partners' : 'Cloud & AI Engineering Studio'}`)
      business = buildDefaultWebsite({
        businessName: brandName,
        tagline: isCyber
          ? 'Autonomous Zero Trust Architecture, FedRAMP/GovCloud cATO & eBPF Kernel Defense'
          : 'Production AI Agents, Next.js Enterprise Platforms & High-Scale Cloud Infrastructure',
        heroHeadline: isCyber
          ? 'Defensible Zero Trust Security, Rapid FedRAMP cATO & Autonomous Threat Defense'
          : 'Ship Resilient Full-Stack Platforms, AI Agents & Multi-Region Cloud Systems',
        heroSubheadline: `Principal-led consulting and flagship software solutions by ${cleanName} (${profTitle}). Built for regulated enterprises, defense contractors, and high-growth technology leaders.`,
        heroBannerImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        themeColor: 'purple',
        industryLabel: isCyber ? 'Cybersecurity & Zero Trust Advisory' : 'Cloud Software & AI Architecture',
        insuredStatus: 'CISSP · AWS Security Specialty · E&O Insured',
        yearsInBusiness: '12+ Years Enterprise Delivery',
        serviceArea: `${locationText} & Global Remote / Cleared Enclaves`,
        operatingHours: 'Mon–Fri · 8:00 AM – 6:30 PM EST (+ 24/7 Incident SLA)',
        completedJobsCount: '48+ Enterprise Deployments',
        responseTime: 'Same-Day Executive Brief',
        aboutStory: `${brandName} pairs deep kernel-to-cloud engineering with battle-tested software accelerators. Instead of static slide decks, clients deploy working Zero Trust policies, automated NIST 800-53 OSCAL compliance pipelines, and autonomous monitoring from Week 1.`,
        missionStatement: 'Turn complex security compliance and cloud scale into automated competitive advantage.',
        valueProps: [
          { icon: '⚡', title: '14-Day cATO Readiness', description: 'Automated OSCAL telemetry and Infrastructure-as-Code templates cut ATO timelines by 80%.' },
          { icon: '🛡️', title: 'Kernel-Level Zero Trust', description: 'eBPF micro-segmentation and WireGuard mesh isolation with sub-millisecond latency.' },
          { icon: '🤖', title: 'Production-Hardened Software', description: 'Battle-tested SaaS products & advisory used by 600+ licensed production seats.' }
        ],
        offerings: [
          {
            id: 'prod_1',
            title: 'AXIOM Autonomous Cyber Defense Suite',
            category: 'Software',
            productCategory: 'Software',
            price: '$499 / mo',
            billingUnit: 'Monthly Subscription',
            turnaround: 'Instant Cloud Deploy',
            popular: true,
            icon: '⚡',
            description: 'Real-time threat telemetry, behavioral anomaly response, and automated perimeter hardening for hybrid cloud workloads.',
            deliverables: ['24/7 autonomous detection rules', 'Kubernetes & AWS telemetry collectors', 'SIEM / SOAR webhook integrations'],
            ctaLabel: 'Start AXIOM License',
            rating: 4.98,
            reviewsCount: 42,
            activeClientsCount: 28,
            revenueLabel: '$13,972 / mo MRR',
            leadsCount: 18
          },
          {
            id: 'prod_2',
            title: 'GovCloud cATO Automation Accelerator',
            category: 'Enterprise Solutions',
            productCategory: 'Enterprise Solutions',
            price: '$24,500 / yr',
            billingUnit: 'Annual Enterprise License',
            turnaround: '14-Day Guided Rollout',
            icon: '🏛️',
            description: 'Turnkey FedRAMP High & DoD IL5 continuous authorization pipeline mapping NIST SP 800-53 Rev 5 controls to live AWS Config evidence.',
            deliverables: ['340+ mapped NIST 800-53 controls', 'Automated OSCAL SSP artifact export', 'Dedicated 3PAO audit readiness review'],
            ctaLabel: 'Book Executive Demo',
            rating: 5.0,
            reviewsCount: 18,
            activeClientsCount: 4,
            revenueLabel: '$98,000 / yr ARR',
            leadsCount: 9
          },
          {
            id: 'prod_3',
            title: 'Zero Trust eBPF Kernel Policy Kit',
            category: 'Software',
            productCategory: 'Software',
            price: '$49 / user / mo',
            billingUnit: 'Per Seat / Month',
            turnaround: 'Same-Day Repo Access',
            icon: '🔒',
            description: 'Drop-in Cilium eBPF socket-layer micro-segmentation policies and WireGuard identity enforcement across Linux & K8s clusters.',
            deliverables: ['Zero-sidecar L3/L4/L7 policy pack', 'Real-time syscall drift alerting', 'CI/CD policy-as-code tests'],
            ctaLabel: 'License Policy Kit',
            rating: 4.94,
            reviewsCount: 56,
            activeClientsCount: 220,
            revenueLabel: '$10,780 / mo MRR',
            leadsCount: 31
          }
        ],
        gallery: [
          {
            title: 'Autonomous eBPF Micro-Segmentation Mesh',
            subtitle: '94% lateral attack surface reduction at <0.8ms socket latency',
            imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&auto=format&fit=crop&q=80',
            badge: 'Zero Trust'
          },
          {
            title: 'Continuous ATO OSCAL Evidence Engine',
            subtitle: 'Automated NIST SP 800-53 Rev 5 compliance pipelines on AWS GovCloud',
            imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&auto=format&fit=crop&q=80',
            badge: 'FedRAMP / cATO'
          },
          {
            title: 'Enterprise Threat Intelligence Command',
            subtitle: 'Real-time adversary emulation and executive posture dashboards',
            imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop&q=80',
            badge: 'Security Ops'
          }
        ],
        credentialsBadges: [
          'ISC2 CISSP & OffSec OSCP Verified',
          'AWS Security Specialty (SCS-C02)',
          'FedRAMP High & CMMC 2.0 Practice',
          'Direct Marketplace Escrow & Enterprise MSA'
        ],
        testimonials: [
          {
            clientName: 'Dr. Aris Thorne',
            clientRole: 'VP of Systems Architecture @ GovCloud Dynamics',
            rating: 5,
            date: '3 weeks ago',
            quote: `${brandName} delivered our multi-region Zero Trust Kubernetes mesh ahead of schedule and cut our cATO evidence prep from months to 14 days.`
          }
        ],
        faqs: [
          {
            question: 'Do your software products include architecture onboarding?',
            answer: 'Yes — all AXIOM and GovCloud cATO packages include guided deployment engineering and live Slack/ConnectLn technical support.'
          }
        ]
      })
      break
    }

    default: {
      // Tailored dynamic Business Website covering all remaining 250 Trade Folders, Law, Finance, Culinary, Wellness, Commerce, and Construction/Handyman roles!
      const archetypeConfig: Record<
        string,
        {
          suffix: string
          taglinePrefix: string
          headline: string
          banner: string
          theme: BusinessThemeColor
          industry: string
          o1: [string, string, string, string]
          o2: [string, string, string, string]
          o3: [string, string, string, string]
          galleryImages: [string, string, string]
        }
      > = {
        roofing: {
          suffix: 'Roofing, Gutters & Exterior Protection',
          taglinePrefix: 'Storm-Rated Shingles, Standing Seam Metal, Seamless Gutters & Leak Repair',
          headline: 'Weatherproof Roofing, Seamless Gutters & Rapid Leak Protection Built to Last',
          banner: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=1200&auto=format&fit=crop&q=80',
          theme: 'amber',
          industry: 'Roofing, Gutters & Exterior',
          o1: ['🏗️', '25-Point Drone Roof Inspection & Emergency Leak Seal', '$175', 'Detailed photo/thermal report + immediate flashing/boot leak stop'],
          o2: ['🏠', 'Full Architectural Shingle or Standing Seam Replacement', '$6,800', 'Complete tear-off, synthetic underlayment, ice/water shield & ridge vent'],
          o3: ['🌧️', 'Seamless Aluminum Gutter, Guard & Downspout Package', '$1,150', 'Custom on-site extruded gutters with leaf-guard protection'],
          galleryImages: [
            'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=80'
          ]
        },
        painting: {
          suffix: 'Master Painting, Drywall & Wall Finishing',
          taglinePrefix: 'Interior/Exterior Painting, Level-5 Drywall, Cabinet Refinishing & Power Washing',
          headline: 'Crisp Cut-Lines, Dust-Free Drywall Prep & Architectural Coatings',
          banner: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&auto=format&fit=crop&q=80',
          theme: 'rose',
          industry: 'Painting & Wall Finishing',
          o1: ['🎨', 'Whole-Room Interior Painting & Precision Trim Finish Package', '$495', 'Two coats Sherwin-Williams/Benjamin Moore Emerald + caulk & prep'],
          o2: ['🏡', 'Exterior Pressure Wash, Prep & UV-Shield Repaint', '$2,950', '4000-PSI wash, elastomeric caulking, scrape/prime & 2-coat spray'],
          o3: ['🪵', 'Factory-Finish HVLP Kitchen Cabinet Repaint & Drywall Repair', '$1,850', '2K catalyzed urethane finish or seamless Level-5 drywall patch'],
          galleryImages: [
            'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=80'
          ]
        },
        welding: {
          suffix: 'Mobile Welding & Custom Metal Fabrication',
          taglinePrefix: 'AWS D1.1 Structural Steel, Custom Gates, Railings, Aluminum & Mobile Rig Repair',
          headline: 'Precision Mobile Welding, Structural Fabrication & Custom Ornamental Ironwork',
          banner: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&auto=format&fit=crop&q=80',
          theme: 'amber',
          industry: 'Welding & Metal Fabrication',
          o1: ['🔥', 'Mobile Field Welding Rig Callout (Steel / Stainless / Aluminum)', '$220', '2-hour on-site TIG/MIG/Stick structural, trailer, gate or beam weld'],
          o2: ['🏛️', 'Custom Fabricated Driveway Gate, Fence & Stair Railing', '$1,650', 'Laser-leveled steel/aluminum fabrication with powder-coat finish'],
          o3: ['⚙️', 'Heavy Equipment & Commercial Fleet Steel Repair Contract', '$950', 'Hard-facing, bucket edge rebuilds & certified load-frame weldments'],
          galleryImages: [
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&auto=format&fit=crop&q=80'
          ]
        },
        locksmith: {
          suffix: 'Locksmith, Smart Access & Security Installations',
          taglinePrefix: '24/7 Rekeying, Smart Locks, Security Cameras, Safes & Commercial Access Control',
          headline: 'Trusted Locksmith, Smart Keyless Access & Commercial Security Installations',
          banner: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&auto=format&fit=crop&q=80',
          theme: 'blue',
          industry: 'Locksmith & Security Systems',
          o1: ['🗝️', 'Whole-Home Rekey + Smart Lock / Video Doorbell Bundle', '$249', 'Rekey up to 6 cylinders + supply/install smart keypad deadbolt'],
          o2: ['📹', '4K PoE NVR Security Camera & Perimeter Monitoring System', '$1,180', '4x night-vision PoE cameras, clean concealed cabling & mobile app setup'],
          o3: ['🏢', 'Commercial Panic Hardware, Access Control & Safe Service', '$680', 'NFPA 101 exit devices, badge readers, master key hierarchy & safe opening'],
          galleryImages: [
            'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=700&auto=format&fit=crop&q=80'
          ]
        },
        cleaning: {
          suffix: 'Residential, Commercial & Deep Cleaning Co.',
          taglinePrefix: 'Move-In/Move-Out, Post-Construction, Carpet/Grout Steam & Office Janitorial',
          headline: 'Spotless White-Glove Cleaning, Sanitization & Floor Restoration Services',
          banner: 'https://images.unsplash.com/photo-1581578731548-c6464f3cc3b2?w=1200&auto=format&fit=crop&q=80',
          theme: 'teal',
          industry: 'Cleaning & Facility Services',
          o1: ['✨', 'Top-to-Bottom Deep Clean or Move-In / Move-Out Turnkey', '$265', 'Baseboards, inside oven/fridge, tile grout scrub & hospital-grade sanitize'],
          o2: ['🧹', 'Commercial Office & Clinic Recurring Janitorial Plan', '$480 / mo', 'After-hours EPA-approved disinfection, glass, restrooms & floor care'],
          o3: ['💦', 'Steam Carpet, Upholstery & Exterior Pressure Washing Bundle', '$295', 'Hot-water extraction stain lift + driveway/patio power wash'],
          galleryImages: [
            'https://images.unsplash.com/photo-1581578731548-c6464f3cc3b2?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&auto=format&fit=crop&q=80'
          ]
        },
        landscaping: {
          suffix: 'Landscaping, Tree Care & Hardscape Design',
          taglinePrefix: 'ISA Tree Pruning, Lawn Care, Irrigation, Retaining Walls & Outdoor Lighting',
          headline: 'Curated Landscapes, Precision Tree Surgery & Custom Stone Hardscapes',
          banner: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1200&auto=format&fit=crop&q=80',
          theme: 'emerald',
          industry: 'Landscaping & Outdoor Care',
          o1: ['🌿', 'Complete Seasonal Lawn, Edging, Mulch & Bed Sculpting', '$195', 'Pro-stripe mowing, crisp bed edging, weed barrier & fresh hardwood mulch'],
          o2: ['🌲', 'Certified Arborist Tree Pruning, Storm Limbing & Removal', '$580', 'Safe rigging, crown thinning, stump grinding & full green-waste haul'],
          o3: ['🧱', 'Paver Patio, Retaining Wall & Smart Sprinkler Design Build', '$3,200', '3D yard layout, compacted aggregate base & Wi-Fi zone irrigation'],
          galleryImages: [
            'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=700&auto=format&fit=crop&q=80'
          ]
        },
        masonry: {
          suffix: 'Masonry, Concrete & Structural Engineering',
          taglinePrefix: 'Paver Patios, Brick/Stonework, Driveways, Foundations & Structural Timber',
          headline: 'Engineered Foundations, Architectural Stonework & Lifetime Concrete Finishes',
          banner: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80',
          theme: 'amber',
          industry: 'Masonry, Concrete & Structural',
          o1: ['🧱', 'Custom Stone Retaining Wall, Brick Tuckpointing or Step Repair', '$780', 'Mortar color-matched restoration or geogrid-reinforced retaining wall'],
          o2: ['🏡', 'Reinforced Driveway, Sidewalk or Stamped Concrete Patio', '$2,850', '4000-PSI rebar-reinforced pour, laser slope grade & acrylic sealer'],
          o3: ['📐', 'Foundation Waterproofing, Structural Stamp & Load Assessment', '$490', 'PE/Master field inspection, crack epoxy injection & drainage solution'],
          galleryImages: [
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=700&auto=format&fit=crop&q=80'
          ]
        },
        appliance: {
          suffix: 'Certified Appliance Repair & Installations',
          taglinePrefix: 'Refrigerators, Washers, Dryers, Ovens, Dishwashers & Commercial Units',
          headline: 'Fast OEM Appliance Repair & Built-In Kitchen Installations',
          banner: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&auto=format&fit=crop&q=80',
          theme: 'blue',
          industry: 'Appliance Repair & Install',
          o1: ['🔧', 'Same-Day Appliance Diagnostic + Repair Service Call', '$95', 'Applied 100% toward repair when approved; OEM parts warranty'],
          o2: ['🧊', 'Built-In Refrigerator, Wall Oven & Induction Range Install', '$340', 'Anti-tip anchoring, gas/240V hookup, level & haul-away coordination'],
          o3: ['🧺', 'Annual Washer/Dryer Vent Clean & Coil Tune-Up Package', '$159', 'Lint trap fire-hazard cleanout, inlet hose check & condenser coil clean'],
          galleryImages: [
            'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&auto=format&fit=crop&q=80'
          ]
        },
        moving: {
          suffix: 'Moving, Assembly & White-Glove Installation',
          taglinePrefix: 'Local/Commercial Moves, IKEA/Office Furniture Assembly, Shelving & Safes',
          headline: 'Damage-Free Moving Crews, Custom Closet Organization & Pro Assembly',
          banner: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
          theme: 'blue',
          industry: 'Moving, Assembly & Installation',
          o1: ['📦', '2-Pro White-Glove Moving Crew & 26ft Air-Ride Truck', '$420', '3-hour full wrap, pad, floor runners & careful room-to-room placement'],
          o2: ['🪑', 'Custom Closet Organization, Shelving & Office Furniture Build', '$245', 'Stud-anchored wall systems, conference tables, gym racks & desks'],
          o3: ['🎹', 'Heavy Safe, Treadmill & Piano Rigging Relocation', '$350', 'Skid boards, stair-climber dollies & $2M cargo insurance included'],
          galleryImages: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=80'
          ]
        },
        pest_restoration: {
          suffix: 'Pest Control & Water/Mold Restoration',
          taglinePrefix: 'Termite/Rodent Defense, Mold Remediation, Crawl Space & Flood Recovery',
          headline: 'IICRC Water/Mold Restoration & Family-Safe Pest Protection',
          banner: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80',
          theme: 'emerald',
          industry: 'Environmental & Pest Control',
          o1: ['🐜', 'Quarterly Perimeter Pest, Rodent & Mosquito Shield Plan', '$135', 'Pet-safe barrier treatment, attic/eave web sweep & entry-point sealing'],
          o2: ['💧', '24/7 Water Damage Extraction, Drying & Moisture Mapping', '$690', 'Truck-mount extraction, commercial air-scrubbers & insurance documentation'],
          o3: ['🏚️', 'Crawl Space Encapsulation & Mold Remediation System', '$2,400', '20-mil vapor barrier, HEPA remediation & smart dehumidifier install'],
          galleryImages: [
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1581578731548-c6464f3cc3b2?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=80'
          ]
        },
        pool_outdoor: {
          suffix: 'Pool, Spa & Outdoor Living Specialists',
          taglinePrefix: 'Weekly Pool Balancing, Pump/Heater Repair, Pergolas, Outdoor Kitchens & Hauling',
          headline: 'Crystal-Clear Pool Care, Equipment Repairs & Backyard Pergola Builds',
          banner: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&auto=format&fit=crop&q=80',
          theme: 'teal',
          industry: 'Pool & Outdoor Living',
          o1: ['🏊', 'Weekly Pool Chemical Balance, Vacuum & Filter Care Plan', '$185 / mo', 'Digital water chemistry log, salt-cell clean & basket/skim service'],
          o2: ['♨️', 'Variable-Speed Pool Pump, Heater & Hot Tub Repair Call', '$165', 'Leak diagnostics, heater igniter/board fix & salt system calibration'],
          o3: ['🪵', 'Custom Cedar Pergola, Gazebo & Outdoor Kitchen Build', '$4,400', 'Post footings, marine-grade hardware & integrated lighting/grill'],
          galleryImages: [
            'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=80'
          ]
        },
        legal: {
          suffix: 'Law Practice & Federal Advisory Group',
          taglinePrefix: `${profTitle} · Contracts, Regulatory Compliance, Litigation & Counsel`,
          headline: 'Decisive Legal Strategy, Contract Protection & Regulatory Representation',
          banner: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
          theme: 'blue',
          industry: 'Law & Regulatory Counsel',
          o1: ['⚖️', '90-Min Case Evaluation, Contract Redline & Risk Memo', '$350', 'Attorney review of MSA/FAR terms, liability exposure & negotiation plan'],
          o2: ['📜', 'Outside General Counsel Monthly Business Retainer', '$2,400 / mo', 'Unlimited contract reviews, compliance counseling & vendor disputes'],
          o3: ['🏛️', 'Bid Protest, Licensing & Regulatory Filing Package', '$3,800', 'Complete brief preparation, statutory citations & filing representation'],
          galleryImages: [
            'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&auto=format&fit=crop&q=80'
          ]
        },
        finance: {
          suffix: 'CPA, Tax Strategy & Advisory Services',
          taglinePrefix: `${profTitle} · Fractional CFO, Business Tax Planning, Bookkeeping & Audits`,
          headline: 'Proactive Tax Savings, Clean Monthly Books & Fractional CFO Guidance',
          banner: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop&q=80',
          theme: 'emerald',
          industry: 'Finance, Tax & Accounting',
          o1: ['📊', 'Full-Cycle Monthly Bookkeeping, Payroll & P&L Close', '$450 / mo', 'Bank/card reconciliation, job-costing tracking & monthly owner dashboard'],
          o2: ['🧾', 'Multi-Entity S-Corp / LLC Tax Strategy & Filing Package', '$1,150', 'QBI optimization, depreciation review & federal/state return filing'],
          o3: ['💼', 'Fractional CFO Cash-Flow Forecast & Loan Readiness Kit', '$1,600 / mo', '13-week rolling cash forecast, SBA/bank package & margin KPIs'],
          galleryImages: [
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&auto=format&fit=crop&q=80'
          ]
        },
        culinary: {
          suffix: 'Culinary Kitchen, Catering & Events',
          taglinePrefix: `${profTitle} · Private Events, Custom Menus, Meal Prep & Mobile Catering`,
          headline: 'Chef-Crafted Catering, Bespoke Event Menus & Signature Kitchen Products',
          banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
          theme: 'amber',
          industry: 'Culinary & Hospitality',
          o1: ['🍽️', 'Full-Service Corporate & Private Event Catering Package', '$38 / guest', 'Multi-course seasonal menu, chafing setup, staff & cleanup'],
          o2: ['👨‍🍳', 'Private In-Home Chef Tasting Experience (Up to 10 Guests)', '$950', 'Four-course plated dinner prepared fresh in your kitchen'],
          o3: ['🥗', 'Weekly Family / Executive Chef Meal Prep Delivery Plan', '$240 / wk', '10 chef-crafted macro-balanced meals delivered in glass containers'],
          galleryImages: [
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&auto=format&fit=crop&q=80'
          ]
        },
        wellness: {
          suffix: 'Studio & Personal Wellness Services',
          taglinePrefix: `${profTitle} · Precision Grooming, Personal Training & Holistic Care`,
          headline: 'Tailored Studio Sessions, Care Packages & Signature Client Products',
          banner: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80',
          theme: 'teal',
          industry: 'Personal Care & Wellness',
          o1: ['✨', 'Signature Studio / On-Site Session & Personalized Plan', '$115', '60-minute private 1-on-1 appointment with follow-up care regimen'],
          o2: ['📅', 'Monthly VIP Care & Maintenance Membership (4 Visits)', '$360 / mo', 'Priority booking calendar, product credit & custom tracking'],
          o3: ['🎁', 'Special Event / Executive Mobile Studio Package', '$490', 'Full on-location setup for weddings, executives or family care'],
          galleryImages: [
            'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=700&auto=format&fit=crop&q=80'
          ]
        },
        commerce: {
          suffix: 'Advisory, Brokerage & Local Commerce',
          taglinePrefix: `${profTitle} · Market Representation, Turnkey Solutions & Client Services`,
          headline: 'Trusted Local Representation, Marketplace Offerings & Turnkey Execution',
          banner: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80',
          theme: 'blue',
          industry: 'Commerce, Real Estate & Business',
          o1: ['🏢', '1-on-1 Valuation, Market Audit & Action Roadmap', '$195', 'Comprehensive comparative analysis & negotiation gameplan'],
          o2: ['🤝', 'Full-Service Client Representation & Closing Concierge', '$2,500', 'End-to-end transaction management, inspections & vendor coord'],
          o3: ['📦', 'Small Business Digital Storefront & Growth Retainer', '$550 / mo', 'Local SEO, ConnectLn Marketplace listings & lead conversion'],
          galleryImages: [
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=700&auto=format&fit=crop&q=80'
          ]
        }
      }

      const customCfg = archetypeConfig[resolution.subArchetype]
      if (customCfg) {
        business = buildDefaultWebsite({
          businessName: user?.company || `${cleanName} ${customCfg.suffix}`,
          tagline: customCfg.taglinePrefix,
          heroHeadline: customCfg.headline,
          heroSubheadline: `Owned & operated by ${cleanName} (${profTitle}). Verified credentials, clear upfront pricing, and direct booking right from our official business website.`,
          heroBannerImage: customCfg.banner,
          themeColor: customCfg.theme,
          industryLabel: customCfg.industry,
          insuredStatus: `Licensed & \$2M Insured · ${enclaveName}`,
          yearsInBusiness: '12+ Years Field Experience',
          serviceArea: `${locationText} & Surrounding Region`,
          operatingHours: 'Mon–Sat · 7:30 AM – 6:30 PM',
          completedJobsCount: '1,450+ Completed Projects',
          responseTime: 'Under 2 Hours',
          aboutStory: `${cleanName} built this business to deliver dependable ${profTitle.toLowerCase()} craftsmanship without middleman markups. Every job comes with transparent scope pricing, clean communication, and ConnectLn Escrow-backed confidence.`,
          missionStatement: `Deliver work we're proud to put the ${lastName} family name on every single day.`,
          valueProps: [
            { icon: customCfg.o1[0], title: 'Transparent Scope & Pricing', description: 'Clear itemized pricing before work begins with zero surprise add-ons.' },
            { icon: '🛡️', title: 'Licensed, Bonded & Insured', description: 'Verified credentials, safety compliance, and written workmanship warranty.' },
            { icon: '⚡', title: 'Direct Owner Accountability', description: `Work directly with ${cleanName} from initial estimate through final walkthrough.` }
          ],
          offerings: [
            {
              id: `off_${emailHandle}_1`,
              title: customCfg.o1[1],
              category: 'Featured Service',
              productCategory: 'Services',
              price: customCfg.o1[2],
              billingUnit: 'Standard Package',
              turnaround: 'Same-Week Availability',
              popular: true,
              icon: customCfg.o1[0],
              description: customCfg.o1[3],
              deliverables: [`Performed personally by ${cleanName}`, 'Upfront written scope & materials list', 'Written workmanship guarantee'],
              ctaLabel: 'Book This Service',
              rating: 4.98,
              reviewsCount: 68,
              activeClientsCount: 152,
              revenueLabel: '$14,200 / mo Avg',
              leadsCount: 31
            },
            {
              id: `off_${emailHandle}_2`,
              title: customCfg.o2[1],
              category: 'Full Project Package',
              productCategory: 'Enterprise Solutions',
              price: customCfg.o2[2],
              billingUnit: 'Turnkey Quote',
              turnaround: 'Scheduled Milestone Delivery',
              icon: customCfg.o2[0],
              description: customCfg.o2[3],
              deliverables: ['Complete material sourcing & prep', 'Daily photo progress updates', 'Final walkthrough sign-off'],
              ctaLabel: 'Request Free Quote',
              rating: 4.99,
              reviewsCount: 41,
              activeClientsCount: 54,
              revenueLabel: '$22,600 / mo Avg',
              leadsCount: 19
            },
            {
              id: `off_${emailHandle}_3`,
              title: customCfg.o3[1],
              category: 'Plans & Bundles',
              productCategory: 'Trade Plans',
              price: customCfg.o3[2],
              billingUnit: 'Bundle / Retainer',
              turnaround: 'Priority Scheduling',
              icon: customCfg.o3[0],
              description: customCfg.o3[3],
              deliverables: ['Priority member scheduling', 'Preventive inspection checklist', 'Direct Marketplace protection'],
              ctaLabel: 'Order Package',
              rating: 4.95,
              reviewsCount: 37,
              activeClientsCount: 89,
              revenueLabel: '$9,850 / mo Avg',
              leadsCount: 24
            }
          ],
          gallery: [
            { title: `${profTitle} Project Showcase`, subtitle: 'Recent client-approved work with full inspection sign-off', imageUrl: customCfg.galleryImages[0], badge: customCfg.industry },
            { title: 'Precision Tools & Quality Standards', subtitle: 'Commercial-grade equipment and clean site practices', imageUrl: customCfg.galleryImages[1], badge: 'Quality Control' },
            { title: 'Finished Walkthrough & Warranty', subtitle: 'Turnkey delivery backed by our service guarantee', imageUrl: customCfg.galleryImages[2], badge: 'Completed' }
          ],
          credentialsBadges: [
            `Verified ${profTitle}`,
            'State Licensed & Liability Insured',
            'Upfront Written Estimates',
            'ConnectLn Marketplace Protected'
          ],
          testimonials: [
            {
              clientName: 'Jordan Ellis',
              clientRole: 'Repeat Client & Local Business Owner',
              rating: 5,
              date: '2 weeks ago',
              quote: `${cleanName} delivered beyond expectations on scope, schedule, and cleanup. Having all pricing and credentials right on their business site made hiring effortless.`
            }
          ],
          faqs: [
            {
              question: 'How do I book an appointment or request an exact estimate?',
              answer: 'Click any service button above or fill out the Request Quote form at the bottom of this website — you will receive a direct response within 2 hours.'
            },
            {
              question: 'Are parts, labor, and cleanup included in your project quotes?',
              answer: 'Yes. Every quote clearly breaks down labor, materials, warranty terms, and timeline before work begins.'
            }
          ]
        })
      } else {
        // Carpentry, Handyman, Flooring, Remodeling & General Professions (adapts dynamically to the exact user.profession!)
        const isStructuralOrTimber = /timber|structural|cascade|bent|carpenter|cabinet|wood/i.test(`${cleanName} ${profTitle} ${user?.headline || ''}`)
        const businessName = user?.company
          ? user.company
          : isStructuralOrTimber
          ? `${cleanName} Carpentry, Millwork & Structural Joinery`
          : `${cleanName} ${profTitle} & Property Services`

        business = buildDefaultWebsite({
          businessName,
          tagline: `${profTitle} · Custom Craftsmanship, Installations, Repairs & Preventive Maintenance`,
          heroHeadline: isStructuralOrTimber
            ? 'Precision Timber Joinery, Custom Millwork & Structural Build Craftsmanship'
            : `Reliable ${profTitle} Services, Installations & Upfront Flat-Rate Repairs`,
          heroSubheadline: `Official business website for ${cleanName} (${profTitle}). Verified credentials, real project photography, and direct service booking across ${locationText}.`,
          heroBannerImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
          themeColor: 'amber',
          industryLabel: `${enclaveName} · ${profTitle}`,
          insuredStatus: 'Licensed, Bonded & $2M Liability Insured',
          yearsInBusiness: '15+ Years Master Experience',
          serviceArea: `${locationText} & 35-Mile Service Radius`,
          operatingHours: 'Mon–Sat · 7:30 AM – 6:30 PM',
          completedJobsCount: '1,820+ Completed Jobs',
          responseTime: 'Under 2 Hours',
          aboutStory: `${cleanName} brings decades of hands-on mastery as a ${profTitle}. Clients hire us when they want craftsmen who measure twice, protect your floors and property, hit inspection tolerances, and stand behind every fastener.`,
          missionStatement: 'Honest craftsmanship, clean job sites, and built-to-last work you can trust.',
          valueProps: [
            { icon: '🔨', title: `${profTitle} Mastery`, description: 'Specialized tooling, clean finishes, and exact tolerances on every task.' },
            { icon: '📋', title: 'Same-Day Written Estimates', description: 'Itemized project scope and flat-rate options before any work begins.' },
            { icon: '🛡️', title: '2-Year Craft Warranty', description: 'Backed by ConnectLn Verified Guild credentials and liability insurance.' }
          ],
          offerings: [
            {
              id: `off_${emailHandle}_1`,
              title: `${profTitle} Half-Day Precision Service & Repair Call`,
              category: 'Core Services',
              productCategory: 'Services',
              price: '$295',
              billingUnit: 'Up to 4 Hrs On-Site',
              turnaround: 'Same-Week Booking',
              popular: true,
              icon: '🛠️',
              description: `Focused half-day execution for ${profTitle.toLowerCase()} repairs, installations, hardware upgrades, or punch-list completion.`,
              deliverables: [`Completed directly by ${cleanName}`, 'Drop-cloths & dust extraction used', '2-year workmanship warranty'],
              ctaLabel: 'Book Half-Day Service',
              rating: 4.99,
              reviewsCount: 74,
              activeClientsCount: 165,
              revenueLabel: '$16,800 / mo Avg',
              leadsCount: 33
            },
            {
              id: `off_${emailHandle}_2`,
              title: isStructuralOrTimber
                ? 'Custom Timber Pavilion, Cabinetry, Deck & Finish Trim Build'
                : `Full-Scope ${profTitle} Installation & Remodeling Package`,
              category: 'Custom Projects',
              productCategory: 'Enterprise Solutions',
              price: '$2,450',
              billingUnit: 'Starting Project Scope',
              turnaround: 'Milestone Turnkey Delivery',
              icon: '🏗️',
              description: isStructuralOrTimber
                ? 'Full-scale architectural millwork, heavy timber bents, staircases, custom built-ins, or exterior deck/pergola builds.'
                : `End-to-end project execution tailored to ${profTitle.toLowerCase()} specifications with full material sourcing.`,
              deliverables: ['Detailed CAD/takeoff measurement visit', 'Premium sourced materials & hardware', 'Code/inspection walkthrough'],
              ctaLabel: 'Request Custom Quote',
              rating: 5.0,
              reviewsCount: 39,
              activeClientsCount: 48,
              revenueLabel: '$24,500 / mo Avg',
              leadsCount: 21
            },
            {
              id: `off_${emailHandle}_3`,
              title: 'Quarterly Property & Commercial Preventive Maintenance Retainer',
              category: 'Maintenance Plans',
              productCategory: 'Trade Plans',
              price: '$149 / mo',
              billingUnit: 'Property Retainer',
              turnaround: 'Priority 48-Hr Dispatch',
              icon: '🛡️',
              description: 'Scheduled quarterly walk-throughs, seasonal weatherproofing, door/window/cabinet adjustments, and priority repair dispatch.',
              deliverables: ['4 scheduled preventive visits/yr', 'Priority emergency response', 'Digital inspection & photo log'],
              ctaLabel: 'Join Maintenance Plan',
              rating: 4.96,
              reviewsCount: 44,
              activeClientsCount: 62,
              revenueLabel: '$9,238 / mo MRR',
              leadsCount: 19
            }
          ],
          gallery: [
            {
              title: isStructuralOrTimber ? 'Heavy Timber & Custom Architectural Joinery' : `${profTitle} Flagship Installation`,
              subtitle: 'Precision tolerances and client-approved craftsmanship',
              imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=80',
              badge: 'Featured Work'
            },
            {
              title: 'Detail Finish Carpentry & Custom Built-Ins',
              subtitle: 'Clean lines, hardwood stock & zero-gap scribe tolerances',
              imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=700&auto=format&fit=crop&q=80',
              badge: 'Craftsmanship'
            },
            {
              title: 'Commercial & Residential Site Execution',
              subtitle: 'OSHA-compliant setup, clean jobsite & documented handover',
              imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&auto=format&fit=crop&q=80',
              badge: 'Site Verified'
            }
          ],
          credentialsBadges: [
            `Verified ${profTitle}`,
            'OSHA 30 Safety Certified',
            'Bonded & $2M Liability Insured',
            '2-Year Craftsmanship Guarantee'
          ],
          testimonials: [
            {
              clientName: 'Frank Gallagher',
              clientRole: 'General Contractor & Property Owner',
              rating: 5,
              date: '1 week ago',
              quote: `${cleanName} passed final inspection on the first walkthrough with zero punch-list items. Showed up on time and left the job site spotless.`
            }
          ],
          faqs: [
            {
              question: 'Do you handle both residential homeowners and commercial property managers?',
              answer: 'Yes — we service homeowners, landlords, HOAs, and commercial buildouts with full W-9 and COI insurance certificates available.'
            },
            {
              question: 'How soon can I get on your schedule?',
              answer: 'Standard repairs usually fit within 2–4 business days; submit the quote/booking form below for exact same-week slots.'
            }
          ]
        })
      }
      break
    }
  }

  const products: VendorProductItem[] = business.offerings.map((off) => ({
    id: off.id,
    name: off.title,
    category: off.productCategory,
    icon: off.icon,
    pricingModel: off.billingUnit,
    price: off.price,
    activeLicensesCount: off.activeClientsCount,
    activeTrialsCount: Math.max(4, Math.round(off.leadsCount * 0.6)),
    mrrOrRevenue: off.revenueLabel,
    rating: off.rating,
    reviewsCount: off.reviewsCount,
    status: 'Active Listing',
    leadsCount: off.leadsCount,
    description: off.description,
    turnaround: off.turnaround
  }))

  return {
    resolution,
    business,
    products
  }
}

