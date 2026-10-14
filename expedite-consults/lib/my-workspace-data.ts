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
  category: 'Software' | 'Training' | 'Services' | 'Enterprise Solutions' | 'Trade Plans' | 'Diagnostics'
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
