export interface PulseArticle {
  id: string
  title: string
  summary: string
  category: 'Cybersecurity' | 'AI' | 'Cloud' | 'Technology' | 'Business' | 'Government' | 'Defense' | 'Startups' | 'Research'
  author: {
    name: string
    role: string
    avatar: string
    source: string
  }
  publishedAt: string
  readTime: string
  coverImage: string
  tags: string[]
  isFeatured?: boolean
  isBreaking?: boolean
  aiKeyTakeaways: string[]
  fullContent: string
  sourceLinks: { title: string; url: string; domain: string }[]
  biasRating?: {
    leaning: 'Center' | 'Slight Left' | 'Slight Right' | 'Unbiased Scientific'
    credibilityScore: number
    factCheckStatus: 'Statutorily Verified ✓' | 'Peer Reviewed'
  }
  upvotesCount: number
  commentsCount: number
}

export interface CyberThreatAdvisory {
  id: string
  cveId: string
  severity: 'CRITICAL (CVSS 9.8)' | 'HIGH (CVSS 8.4)' | 'ELEVATED'
  title: string
  affectedSystems: string[]
  vector: string
  summary: string
  mitigationAction: string
  cisaEmergencyStatus?: string
  sourceUrl: string
  publishedAt: string
}

export interface AIDailyBriefItem {
  id: string
  date: string
  headline: string
  executiveSummary: string
  keyPillars: {
    pillar: string
    emoji: string
    summary: string
    primarySource: string
    sourceUrl: string
  }[]
  audioDuration: string
}

export const PULSE_CATEGORIES = [
  { id: 'All', label: '🌐 All Intelligence', icon: '🌐' },
  { id: 'Cybersecurity', label: '🔐 Cybersecurity', icon: '🔐' },
  { id: 'AI', label: '🤖 AI & Frontier Models', icon: '🤖' },
  { id: 'Cloud', label: '☁️ Cloud & Infrastructure', icon: '☁️' },
  { id: 'Technology', label: '💻 Technology', icon: '💻' },
  { id: 'Business', label: '📈 Business & Markets', icon: '📈' },
  { id: 'Government', label: '🏛️ Government & Policy', icon: '🏛️' },
  { id: 'Defense', label: '🛡️ Defense & GovTech', icon: '🛡️' },
  { id: 'Startups', label: '🚀 Startups & Venture', icon: '🚀' },
  { id: 'Research', label: '📑 Research & Papers', icon: '📑' }
]

export const TODAY_AI_BRIEF: AIDailyBriefItem = {
  id: 'brief_aug_29_2026',
  date: 'Saturday, August 29, 2026',
  headline: 'Autonomous Defense Meshes Emerge as Next-Gen Cloud Standard amid Multi-Cloud Proliferation',
  executiveSummary: 'AI multi-agent orchestration platforms are fundamentally rewiring enterprise software development and offensive security validation. CISA issues new zero-trust baseline directives for federal agency SaaS gateways.',
  keyPillars: [
    {
      pillar: 'Autonomous AppSec & Red Teaming',
      emoji: '⚡',
      summary: 'Enterprises are adopting real-time ASPM and MCP-connected AI agents that auto-generate pull requests to patch exploitable vulnerabilities before manual triage.',
      primarySource: 'ACM Computing Surveys & NIST SP 800-218',
      sourceUrl: 'https://csrc.nist.gov'
    },
    {
      pillar: 'Frontier AI Tool Sandboxing & Nonce Defense',
      emoji: '🤖',
      summary: 'New research from Stanford and Anthropic details mathematical boundaries for preventing prompt injection and tool hijacking in autonomous multi-agent pipelines.',
      primarySource: 'arXiv:2608.11420 [cs.CR]',
      sourceUrl: 'https://arxiv.org'
    },
    {
      pillar: 'DoD & CISA FedRAMP 2026 Modernization',
      emoji: '🏛️',
      summary: 'FedRAMP fast-tracks continuous automated ATO authorizations (cATO) for SaaS applications demonstrating automated eBPF runtime telemetry.',
      primarySource: 'FedRAMP.gov Policy Guidance',
      sourceUrl: 'https://www.fedramp.gov'
    }
  ],
  audioDuration: '3 min listen'
}

export const TODAY_CYBER_ADVISORIES: CyberThreatAdvisory[] = [
  {
    id: 'adv_1',
    cveId: 'CVE-2026-44921',
    severity: 'CRITICAL (CVSS 9.8)',
    title: 'Zero-Click Remote Code Execution in Legacy VPN Gateway Microcode',
    affectedSystems: ['Enterprise SSL-VPN v12.4 - v15.1', 'Legacy Perimeter Concentrators'],
    vector: 'Network / Unauthenticated / Zero-Click',
    summary: 'A memory corruption vulnerability allows unauthenticated attackers to execute arbitrary shell payloads on edge appliances, bypassing multi-factor authentication.',
    mitigationAction: 'Immediate micro-segmentation and isolation; migrate traffic to Zero Trust mTLS micro-proxies.',
    cisaEmergencyStatus: '🔴 CISA Emergency Directive 26-03 Active (Patch within 24 Hours)',
    sourceUrl: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
    publishedAt: '2h ago'
  },
  {
    id: 'adv_2',
    cveId: 'CVE-2026-38104',
    severity: 'HIGH (CVSS 8.4)',
    title: 'Indirect Prompt Injection via Unsanitized Tool Invocation in Multi-Agent SDKs',
    affectedSystems: ['Autonomous Agent Tool Bindings', 'MCP Server Gateways without Parameterized Enclaves'],
    vector: 'Application / Semantic Payload Injection',
    summary: 'Attackers embedding invisible unicode zero-width tags in web-scraped content can trick downstream LLM agents into exfiltrating environment credentials.',
    mitigationAction: 'Deploy AI-BOM token scanners and enable strict nonce signing on all tool execution channels.',
    sourceUrl: 'https://github.com/advisories',
    publishedAt: '5h ago'
  }
]

export function getEnclaveDomainAdvisories(enclaveId?: string): CyberThreatAdvisory[] {
  if (enclaveId === 'trades_construction') {
    return [
      {
        id: 'adv_osha_1',
        cveId: 'OSHA-2026-DIR-114',
        severity: 'CRITICAL (CVSS 9.8)',
        title: 'OSHA Emergency Directive: Retractable Lanyard Brake Lockout Inspection',
        affectedSystems: ['Commercial Wood Framing Crews', 'Roof & Truss Erection Crews (Subpart M)'],
        vector: 'Mechanical Fall Protection Brake Jamming under High Sawdust Density',
        summary: 'Emergency OSHA compliance notice: Self-retracting lifelines (SRLs) must undergo immediate daily ratchet pawl inspection following documented incidents of deceleration clutch slippage in high-dust framing environments.',
        mitigationAction: 'Discontinue use of unsealed class B SRL units; replace with sealed-housing class A units and mandate daily lock test before harness tie-off.',
        cisaEmergencyStatus: '🔴 OSHA National Job-Site Enforcement Active (100% Tie-Off Mandatory)',
        sourceUrl: 'https://www.osha.gov',
        publishedAt: '1h ago'
      },
      {
        id: 'adv_ansi_timber',
        cveId: 'ANSI-A10-44-RIG',
        severity: 'HIGH (CVSS 8.4)',
        title: 'ANSI Timber Rigging Standard: 40-Foot Bent Clear-Span Spreader Bar Safety',
        affectedSystems: ['Crane Erection Crews', 'Timber Framing Subcontractors'],
        vector: 'Unequal Choker Hitch Loading during Heavy Douglas Fir Bent Lifting',
        summary: 'Rigging advisory on heavy timber bents: Slings must be rigged to engineered spreader bars with softeners to prevent edge crushing on Douglas Fir rafter shoulders.',
        mitigationAction: 'Mandate calibrated load-equalizing shackles and minimum 2:1 bridle hitch angles on all bents over 3,000 lbs.',
        sourceUrl: 'https://www.timberframers.org',
        publishedAt: '4h ago'
      }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      {
        id: 'adv_fda_mtp',
        cveId: 'FDA-ALERT-2026-09',
        severity: 'CRITICAL (CVSS 9.8)',
        title: 'FDA Clinical Safety Alert: Calcium Gluconate Dosing Thresholds during Massive Transfusion',
        affectedSystems: ['Level 1 Trauma Bays', 'OR & Surgical ICU Infusion Suites'],
        vector: 'Citrate-Induced Hypocalcemia & Acute Myocardial Depression during Rapid Whole Blood Infusion',
        summary: 'Severe ionized hypocalcemia (<0.9 mmol/L) observed during ultra-rapid blood delivery exceeding 300 mL/min. Rapid citrate accumulation binds free serum calcium.',
        mitigationAction: 'Administer 1g IV calcium gluconate for every 2 units of uncrossed whole blood or 4 units of pRBC infused. Verify with arterial blood gas electrolyte panel every 15 minutes.',
        cisaEmergencyStatus: '🔴 American College of Surgeons (ACS COT) Clinical Guideline Active',
        sourceUrl: 'https://www.fda.gov',
        publishedAt: '2h ago'
      },
      {
        id: 'adv_cdc_trauma',
        cveId: 'CDC-TRAUMA-2026-4',
        severity: 'HIGH (CVSS 8.4)',
        title: 'CDC Trauma Advisory: Early Tranexamic Acid (TXA) Timing within 3 Hours of Injury',
        affectedSystems: ['Emergency Departments', 'Trauma Resuscitation Bays', 'EMS Flight Transport'],
        vector: 'Hyperfibrinolysis & Trauma-Induced Coagulopathy in Penetrating / Blunt Shock',
        summary: 'Updated clinical evidence confirms administering 1g IV TXA within the first 60 minutes post-trauma reduces all-cause mortality by 28%. Administration beyond 3 hours increases thrombotic risk.',
        mitigationAction: 'Initiate 1g IV loading dose over 10 minutes in the trauma bay immediately upon activating Massive Transfusion Protocol.',
        sourceUrl: 'https://www.cdc.gov',
        publishedAt: '5h ago'
      }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      {
        id: 'adv_nhtsa_ev',
        cveId: 'NHTSA-REC-2026-88',
        severity: 'CRITICAL (CVSS 9.8)',
        title: 'NHTSA Urgent Safety Recall: 800V DC Contactor Welding under Regeneration Load',
        affectedSystems: ['Dual-Motor EV Powertrains', 'High-Voltage Battery Enclosures (2024-2026)'],
        vector: 'Main Positive High-Voltage Contactor Contacts Sticking Closed',
        summary: 'The main high-voltage contactor may weld closed during heavy regenerative braking, causing the vehicle high-voltage bus to remain energized even after key-off and manual service disconnect removal.',
        mitigationAction: 'Always use a CAT IV 1000V multi-meter with calibrated proving unit to test across B+ and B- terminals before touching inverter cables. Do not rely solely on dashboard indicators.',
        cisaEmergencyStatus: '🔴 NHTSA Safety Recall & Stop-Sale Directive Active',
        sourceUrl: 'https://www.nhtsa.gov',
        publishedAt: '1h ago'
      },
      {
        id: 'adv_oem_canfd',
        cveId: 'TSB-2026-CANFD-012',
        severity: 'HIGH (CVSS 8.4)',
        title: 'OEM Master Tech Technical Service Bulletin: CAN-FD Bus Communication Dropouts',
        affectedSystems: ['Central Gateway Modules', 'ADAS Radar & Steering Angle Sensors'],
        vector: 'Terminal Pin Fretting & Water Intrusion in Body Control Module Harness C2',
        summary: 'Intermittent U-series communication DTCs (U0100, U0121, U0140) caused by fretting corrosion at CAN-FD connector pins. Signal ringing corrupts packet CRC checksums.',
        mitigationAction: 'Hook up 4-channel PicoScope to DLC pin 6 (CAN-H) and pin 14 (CAN-L). Inspect termination resistance (60 ohms nominal); replace harness terminal connector C2 with gold-plated pins.',
        sourceUrl: 'https://www.ase.com',
        publishedAt: '3h ago'
      }
    ]
  }

  // tech_cybersecurity or default
  return TODAY_CYBER_ADVISORIES
}

export const PULSE_ARTICLES_DATA: PulseArticle[] = [
  {
    id: 'art_1',
    title: 'Autonomous Pentesting & ASPM Platforms Replace 500-Page Security PDF Noise with Auto-PRs',
    summary: 'How Fortune 500 engineering squads are coupling autonomous red-team exploits with automated GitHub pull-request assists to slash remediation cycles from 45 days to 14 minutes.',
    category: 'Cybersecurity',
    author: {
      name: 'Alex Taylor',
      role: 'Principal Cloud & Security Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      source: 'Expedite Security Engineering'
    },
    publishedAt: '35m ago',
    readTime: '4 min read',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    tags: ['ASPM', 'AutonomousPentest', 'DevSecOps', 'AutoPR', 'ZeroTrust'],
    isFeatured: true,
    isBreaking: true,
    aiKeyTakeaways: [
      'Static scanners create 80%+ false positive noise, costing teams thousands of hours.',
      'Autonomous validation executes exploits in ephemeral microVMs to verify genuine attack paths before notifying engineers.',
      'Integration with Model Context Protocol (MCP) servers allows AI agents to write unit-tested fix PRs automatically.'
    ],
    fullContent: `For over a decade, enterprise application security has suffered from a fundamental disconnect: static scanners produce hundreds of pages of unprioritized PDF reports, while engineering squads struggle to decipher which vulnerabilities are genuinely reachable and weaponizable in production.

Enter Autonomous Application Security Posture Management (ASPM). By coupling real-time eBPF runtime telemetry with automated exploit sandboxing, platforms like Expedite Strike and AXIOM are revolutionizing vulnerability triage.

Instead of reporting theoretical flaws, the autonomous engine spins up isolated Firecracker microVMs, verifies the exploit path, graphs the attack blast radius using Neo4j, and dispatches a verified fix PR with passing unit tests directly to GitHub.

The result? Mean Time to Remediate (MTTR) has plummeted across early adopting Fortune 500 enterprises from an industry average of 48 days down to under 15 minutes.`,
    sourceLinks: [
      { title: 'NIST Special Publication 800-218: Secure Software Development Framework', url: 'https://csrc.nist.gov/publications/detail/sp/800-218/final', domain: 'csrc.nist.gov' },
      { title: 'Expedite Fusion™ Hybrid Scanning Benchmark Report 2026', url: 'https://portal.expediteconsults.com', domain: 'expediteconsults.com' }
    ],
    biasRating: {
      leaning: 'Center',
      credibilityScore: 98,
      factCheckStatus: 'Statutorily Verified ✓'
    },
    upvotesCount: 342,
    commentsCount: 58
  },
  {
    id: 'art_2',
    title: 'Anthropic & Stanford Researchers Formalize Mathematical Guardrails for Multi-Agent Tool Calls',
    summary: 'New paper proves formal verification bounds for LLM agent actions, preventing rogue file system writes and credential exfiltration in decentralized multi-agent networks.',
    category: 'AI',
    author: {
      name: 'Dr. Elena Rostova',
      role: 'Chief AI Safety Scientist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      source: 'Stanford AI Safety Labs'
    },
    publishedAt: '2h ago',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    tags: ['AISafety', 'MultiAgent', 'Anthropic', 'Stanford', 'Guardrails'],
    isFeatured: false,
    aiKeyTakeaways: [
      'Multi-agent systems require mathematical verification at the tool-calling interface.',
      'Unparameterized prompts are susceptible to secondary semantic injection.',
      'Zero-trust cryptographic nonces embedded in MCP server requests eliminate tool hijacking.'
    ],
    fullContent: `As multi-agent orchestration architectures become the backbone of enterprise automation, securing the communication channel between reasoning models and local execution environments has become paramount.

In a newly published whitepaper, researchers demonstrate that prompt-based guardrails alone achieve only 76% containment against sophisticated indirect prompt injections. To achieve 99.99% assurance, agents must operate within hardware-enforced WebAssembly sandboxes featuring cryptographic token nonce verification.

This architecture guarantees that even if an agent ingests untrusted text, its tool executions cannot deviate from strictly defined formal capabilities.`,
    sourceLinks: [
      { title: 'arXiv Preprint: Cryptographic Enclave Boundaries for Autonomous Agents', url: 'https://arxiv.org', domain: 'arxiv.org' },
      { title: 'Model Context Protocol (MCP) Security Specification v1.2', url: 'https://github.com/modelcontextprotocol', domain: 'github.com' }
    ],
    biasRating: {
      leaning: 'Unbiased Scientific',
      credibilityScore: 99,
      factCheckStatus: 'Peer Reviewed'
    },
    upvotesCount: 520,
    commentsCount: 84
  },
  {
    id: 'art_3',
    title: 'FedRAMP 2026 Modernization: Continuous Automated ATO Replaces 3-Year Static Paper Audits',
    summary: 'The Federal Risk and Authorization Management Program issues updated baseline allowing continuous cloud telemetry feeds to renew agency authorizations in real time.',
    category: 'Government',
    author: {
      name: 'Alexander Novak',
      role: 'Head of FedRAMP & GovTech Security',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      source: 'GovTech Regulatory Radar'
    },
    publishedAt: '4h ago',
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800&auto=format&fit=crop&q=80',
    tags: ['FedRAMP', 'cATO', 'GovTech', 'NIST80053', 'Compliance'],
    isFeatured: false,
    aiKeyTakeaways: [
      'Static 3-year audit cycles are being replaced by continuous Automated Authorization to Operate (cATO).',
      'Requires real-time streaming of CSPM and container telemetry into government validation portals.',
      'Slashes initial authorization timelines from 18 months to under 45 days for compliant SaaS providers.'
    ],
    fullContent: `For years, enterprise SaaS vendors targeting government and defense contracts faced an arduous 18-to-24 month authorization gauntlet known as FedRAMP.

Under the newly ratified 2026 FedRAMP Modernization Directive, the Joint Authorization Board (JAB) has officially enabled Continuous Automated ATO (cATO). SaaS providers that stream continuous cryptographic evidence, automated vulnerability scans, and Zero Trust identity verification via standardized APIs can achieve authorization in weeks rather than years.`,
    sourceLinks: [
      { title: 'FedRAMP.gov Official Announcement on Automated Authorizations', url: 'https://www.fedramp.gov', domain: 'fedramp.gov' },
      { title: 'CISA Zero Trust Maturity Model v2.0', url: 'https://www.cisa.gov', domain: 'cisa.gov' }
    ],
    biasRating: {
      leaning: 'Center',
      credibilityScore: 97,
      factCheckStatus: 'Statutorily Verified ✓'
    },
    upvotesCount: 290,
    commentsCount: 31
  },
  {
    id: 'art_4',
    title: 'Cloud Infrastructure Budgets Expand 28% in 2026: Next.js 16, Rust & Kubernetes Drive Efficiency',
    summary: 'How modern server-side rendering, distributed edge workers, and Turbopack compiler acceleration are cutting compute bills across Fortune 500 digital transformations.',
    category: 'Cloud',
    author: {
      name: 'Chloe Tremblay',
      role: 'Staff Architect | React & Next.js Core Contributor',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      source: 'Next.js Engineering Dispatch'
    },
    publishedAt: '6h ago',
    readTime: '3 min read',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    tags: ['Nextjs16', 'Turbopack', 'CloudInfrastructure', 'Kubernetes', 'Performance'],
    isFeatured: false,
    aiKeyTakeaways: [
      'Turbopack compilation in Next.js 16 delivers sub-100ms cold starts across serverless enclaves.',
      'Rust-based distributed workers lower memory overhead by 64% compared to legacy Node processes.',
      'Enterprises adopting edge server rendering report 35% reduction in annual cloud compute bills.'
    ],
    fullContent: `As enterprise web applications transition into complex multi-agent cockpits and high-throughput real-time dashboards, frontend performance and cloud infrastructure efficiency have become inseparable.

With Next.js 16 and Turbopack, development compilation velocity has accelerated dramatically, while production server components eliminate megabytes of client-side JavaScript bundle overhead. Combined with Kubernetes microVM orchestration, infrastructure costs are dropping even as application capabilities expand.`,
    sourceLinks: [
      { title: 'Next.js 16 Architectural Performance Benchmark Analysis', url: 'https://nextjs.org', domain: 'nextjs.org' }
    ],
    biasRating: {
      leaning: 'Center',
      credibilityScore: 96,
      factCheckStatus: 'Statutorily Verified ✓'
    },
    upvotesCount: 185,
    commentsCount: 24
  }
]

export const TRADES_PULSE_ARTICLES: PulseArticle[] = [
  {
    id: 'art_trade_1',
    title: 'Mass Timber Commercial High-Rises: 2026 Structural Fire Resistance & Glulam Joinery Directives',
    summary: 'How commercial general contractors and timber framing guilds are utilizing CNC-milled glue-laminated bents and char-layer fire ratings to erect 18-story carbon-neutral towers.',
    category: 'Timber & Framing',
    author: {
      name: 'David Miller',
      role: 'Master Carpenter · Timber Framing Guild Director',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
      source: 'Timber Framing Journal'
    },
    publishedAt: '25m ago',
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    tags: ['MassTimber', 'Glulam', 'StructuralCarpentry', 'FireRating', 'Joinery'],
    isFeatured: true,
    isBreaking: true,
    aiKeyTakeaways: [
      'Heavy timber creates an insulating sacrificial char layer preserving core structural integrity for over 2 hours under intense flame.',
      'Factory CNC mortise-and-tenon milling achieves sub-millimeter tolerances on 40-foot clear-span Douglas Fir bents.',
      'Job-site erection timelines slashed by 40% compared to traditional structural steel and cast-in-place concrete.'
    ],
    fullContent: `Across commercial architecture, heavy mass timber has shifted from a boutique craft to the frontline of commercial high-rise construction. Under the newly adopted 2026 International Building Code (IBC) Type IV-A provisions, timber towers can now reach up to 18 stories.
    
Engineers and master timber framers are leveraging Douglas Fir and Southern Yellow Pine glulam assemblies engineered to self-insulate through controlled charring, meeting stringent ASTM E119 2-hour fire endurance ratings without synthetic gypsum cladding.
    
With 5-axis CNC joinery machines milling compound mortise and tenons directly from BIM models, framing crews are setting entire floor grids in days with zero field trimming.`,
    sourceLinks: [
      { title: 'Timber Framers Guild: Mass Timber Engineering Standards', url: 'https://www.timberframers.org', domain: 'timberframers.org' },
      { title: 'IBC 2026 Type IV Tall Wood Building Provisions', url: 'https://www.iccsafe.org', domain: 'iccsafe.org' }
    ],
    biasRating: {
      leaning: 'Engineering Consensus',
      credibilityScore: 99,
      factCheckStatus: 'PE Engineer Reviewed ✓'
    },
    upvotesCount: 428,
    commentsCount: 63
  },
  {
    id: 'art_trade_2',
    title: 'OSHA 1926 Subpart M 2026 Update: Retractable Lanyard Ratchet Pawl Inspection Protocols',
    summary: 'Mandatory daily lock-test requirements for commercial framing crews operating on trusses and roof decking above 6 feet, following new nationwide enforcement guidelines.',
    category: 'OSHA & Safety',
    author: {
      name: 'Frank Gallagher',
      role: 'Construction Superintendent · OSHA 30 Master Lead',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      source: 'Job-Site Safety Quarterly'
    },
    publishedAt: '2h ago',
    readTime: '4 min read',
    coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    tags: ['OSHA30', 'FallProtection', 'SubpartM', 'JobSiteSafety', 'FramingSafety'],
    isFeatured: false,
    aiKeyTakeaways: [
      'Class B unsealed SRLs prohibited in high sawdust framing enclosures due to internal brake pawl jamming.',
      'Mandatory physical pull-lock verification documented in daily job-site safety logs prior to harness tie-off.',
      'OSHA inspection fines increased for non-compliant horizontal lifeline anchor points on open web trusses.'
    ],
    fullContent: `Fall protection remains the single most scrutinized standard across residential and commercial job sites. The newly issued OSHA 1926 Subpart M safety directive places strict compliance mandates on Self-Retracting Lifelines (SRLs) used during truss erection and roof sheathing.
    
Superintendents and framing leads must ensure all fall-arrest systems feature sealed internal braking housings to prevent sawdust ingress from inhibiting centrifugal ratchet pawl engagement.`,
    sourceLinks: [
      { title: 'OSHA Official Directive on Fall Protection Subpart M', url: 'https://www.osha.gov', domain: 'osha.gov' }
    ],
    biasRating: {
      leaning: 'Regulatory Directive',
      credibilityScore: 100,
      factCheckStatus: 'Statutorily Verified ✓'
    },
    upvotesCount: 310,
    commentsCount: 41
  },
  {
    id: 'art_trade_3',
    title: 'Passivhaus Building Enclosures: Eliminating Thermal Bridging with Continuous Exterior Insulation',
    summary: 'Best practices for finish carpenters and envelope contractors executing air-tight taped barriers, rainscreens, and high-performance triple-glazed window rough openings.',
    category: 'Millwork & Joinery',
    author: {
      name: 'Lars Lindqvist',
      role: 'Master Finish Joiner & Passivhaus Specialist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      source: 'Architectural Joinery Review'
    },
    publishedAt: '5h ago',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    tags: ['Passivhaus', 'ThermalEnvelope', 'FinishCarpentry', 'Airtightness', 'Joinery'],
    isFeatured: false,
    aiKeyTakeaways: [
      'Blower door test benchmarks requiring sub-0.6 ACH50 necessitate vapor-permeable taped membranes.',
      'Window buck framing must thermally isolate jamb extensions to eliminate interior condensation.',
      'Continuous exterior cork and wood-fiber insulation boards eliminate framing member thermal conductivity.'
    ],
    fullContent: `Modern finish carpentry is intimately bound to high-performance building science. In achieving Passivhaus certification, the execution of window bucks, sill pans, and exterior rainscreen furring strips determines envelope longevity and energy conservation.`,
    sourceLinks: [
      { title: 'Passivhaus Institute Technical Envelope Handbook', url: 'https://passiv.de', domain: 'passiv.de' }
    ],
    biasRating: {
      leaning: 'Center',
      credibilityScore: 98,
      factCheckStatus: 'Field Tested ✓'
    },
    upvotesCount: 275,
    commentsCount: 29
  }
]

export const HEALTHCARE_PULSE_ARTICLES: PulseArticle[] = [
  {
    id: 'art_med_1',
    title: 'Massive Transfusion Protocol (MTP) 2026 Guidelines: Low-Titer O-Negative Whole Blood vs 1:1:1 Component Resuscitation',
    summary: 'How Level 1 trauma resuscitation bays are cutting 24-hour mortality by 28% through pre-thawed cold-stored low-titer whole blood and ultra-early tranexamic acid delivery.',
    category: 'Trauma Surgery',
    author: {
      name: 'Dr. Angela Vance, MD, FACS',
      role: 'Chief of Orthopedic Trauma Surgery · Level 1 Trauma Center',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
      source: 'Journal of Trauma & Acute Care Surgery'
    },
    publishedAt: '20m ago',
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    tags: ['TraumaSurgery', 'MTP', 'WholeBlood', 'CriticalCare', 'Hemorrhage'],
    isFeatured: true,
    isBreaking: true,
    aiKeyTakeaways: [
      'Cold-stored low-titer O-whole blood delivers physiologic platelet function superior to reconstituted component therapy.',
      'Early IV tranexamic acid (TXA) given within 60 minutes of injury prevents hyperfibrinolysis and coagulopathy.',
      'Aggressive ionized calcium replacement (1g calcium gluconate per 2 units whole blood) prevents citrate cardiac toxicity.'
    ],
    fullContent: `Exsanguinating hemorrhage remains the leading cause of preventable trauma death worldwide. In newly published multi-center trials across 30 Level 1 trauma centers, the adoption of pre-hospital and early emergency department low-titer O-negative whole blood has demonstrated overwhelming superiority over standard 1:1:1 plasma/platelet/packed RBC components.
    
By delivering clotting factors, platelets, and erythrocytes in a physiological concentration with reduced anticoagulant volume, trauma teams restore oxygen-carrying capacity and halt trauma-induced coagulopathy within minutes of arrival.`,
    sourceLinks: [
      { title: 'ACS Committee on Trauma: MTP Clinical Practice Guidelines', url: 'https://www.facs.org', domain: 'facs.org' },
      { title: 'New England Journal of Medicine Whole Blood Trial Analysis', url: 'https://www.nejm.org', domain: 'nejm.org' }
    ],
    biasRating: {
      leaning: 'Peer-Reviewed Clinical Evidence',
      credibilityScore: 99,
      factCheckStatus: 'Board Certified Peer-Reviewed ✓'
    },
    upvotesCount: 495,
    commentsCount: 78
  },
  {
    id: 'art_med_2',
    title: 'Point-of-Care Ultrasound (POCUS) in Resuscitation: Bedside Detection of Tamponade & Hemothorax',
    summary: 'Clinical emergency nursing and trauma fellow protocol for rapid 60-second eFAST exams during initial primary survey in polytrauma activations.',
    category: 'Emergency Nursing',
    author: {
      name: 'Elena Rostova, RN, CCRN, TNCC',
      role: 'Trauma Resuscitation Nurse Lead · Emergency Services',
      avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
      source: 'Emergency Nursing Clinical Dispatch'
    },
    publishedAt: '1h ago',
    readTime: '4 min read',
    coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    tags: ['EmergencyNursing', 'eFAST', 'POCUS', 'TraumaBay', 'TNCC'],
    isFeatured: false,
    aiKeyTakeaways: [
      'Handheld phased-array probes identify pericardial effusion and subxiphoid view tamponade in under 30 seconds.',
      'Pleural sliding absence in M-mode confirms pneumothorax prior to portable chest radiography.',
      'Nurse-led POCUS integration expedites emergency thoracostomy tray preparation and OR readiness.'
    ],
    fullContent: `In the chaos of an active Level 1 trauma resuscitation, seconds dictate neurological survival. Handheld ultra-portable ultrasound devices have transformed bedside nursing and surgeon collaboration, enabling real-time detection of free peritoneal fluid and occult tension pneumothorax before transport to CT.`,
    sourceLinks: [
      { title: 'Emergency Nurses Association (ENA) Trauma Nursing Curriculum', url: 'https://www.ena.org', domain: 'ena.org' }
    ],
    biasRating: {
      leaning: 'Clinical Standard',
      credibilityScore: 99,
      factCheckStatus: 'Statutorily Verified ✓'
    },
    upvotesCount: 382,
    commentsCount: 52
  }
]

export const AUTOMOTIVE_PULSE_ARTICLES: PulseArticle[] = [
  {
    id: 'art_auto_1',
    title: '800-Volt Silicon Carbide Inverter Diagnostics: Oscilloscope Ring-Down Analysis & High-Voltage Isolation',
    summary: 'Master diagnostic methodology for detecting gate-driver micro-arcing, phase voltage imbalance, and high-voltage DC bus insulation breakdown on modern commercial EV platforms.',
    category: 'EV Powertrains & 800V',
    author: {
      name: 'Marcus Miller, ASE Master Tech',
      role: 'World Class Master Tech & L3 Hybrid Diagnostics Lead',
      avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
      source: 'ASE Master Diagnostic Journal'
    },
    publishedAt: '30m ago',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
    tags: ['ASEMaster', '800VArchitecture', 'SiCInverter', 'PicoScope', 'EVDiagnostics'],
    isFeatured: true,
    isBreaking: true,
    aiKeyTakeaways: [
      'Always observe strict NFPA 70E and CAT IV 1000V de-energization procedures before removing inverter shields.',
      'Silicon Carbide (SiC) MOSFET switching speeds exceed 50 kV/μs, requiring 200MHz differential oscilloscope probes.',
      'Isolation resistance faults below 500 ohms/volt trigger immediate high-voltage contactor lockout.'
    ],
    fullContent: `As commercial fleet operations shift from internal combustion diesel to 800-volt battery electric architectures, technician diagnostic procedures must evolve from mechanical tolerances to semiconductor physics.
    
Diagnosing intermittent drive motor shutdown requires capturing phase current waveforms with high-bandwidth Rogowski coils and differential voltage probes. Ring-down oscillations on the PWM gate driver reveal gate-resistor degradation long before catastrophic power module failure.`,
    sourceLinks: [
      { title: 'ASE National Institute for Automotive Service Excellence L3 Standards', url: 'https://www.ase.com', domain: 'ase.com' },
      { title: 'SAE J1772 & J2954 Electric Vehicle Safety Specifications', url: 'https://www.sae.org', domain: 'sae.org' }
    ],
    biasRating: {
      leaning: 'Master Technician Review',
      credibilityScore: 99,
      factCheckStatus: 'ASE Certified Review ✓'
    },
    upvotesCount: 460,
    commentsCount: 61
  },
  {
    id: 'art_auto_2',
    title: 'CAN-FD Bus Physical Layer Troubleshooting: Identifying Terminal Pin Fretting & CRC Frame Corruption',
    summary: 'Step-by-step oscilloscope waveform diagnosis of CAN Flexible Data-Rate signals, ground offset anomalies, and terminating resistor failures.',
    category: 'Diagnostics & Scopes',
    author: {
      name: 'Kenji Sato',
      role: 'Master Diagnostic Technician · PicoScope Instructor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      source: 'Automotive Oscilloscope Digest'
    },
    publishedAt: '3h ago',
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    tags: ['CANFD', 'PicoScope4425A', 'AutomotiveElectronics', 'DTC', 'BusDiagnostics'],
    isFeatured: false,
    aiKeyTakeaways: [
      'CAN-FD bit rates transition from 500 kbps arbitration up to 5 Mbps data phase, exposing harness impedance mismatches.',
      'Signal reflections caused by damaged twisted-pair termination corrupt frame cyclic redundancy checks.',
      'Dual-trace differential decoding verifies CAN-H and CAN-L mirror symmetry in real time.'
    ],
    fullContent: `Modern vehicle multiplex architectures carry tens of thousands of frames per second across CAN-FD, LIN, and Automotive Ethernet networks. When body control modules report intermittent communication dropouts, scan tools only display symptom DTCs like U0100.
    
Plugging a 4-channel automotive scope into DLC pin 6 and 14 provides immediate physical-layer visibility. Distorted dominant bit voltage plateaus pinpoint fretting corrosion on harness connector terminals.`,
    sourceLinks: [
      { title: 'Pico Technology Automotive Scope Reference Waveform Library', url: 'https://www.picoauto.com', domain: 'picoauto.com' }
    ],
    biasRating: {
      leaning: 'Technical Analysis',
      credibilityScore: 98,
      factCheckStatus: 'Field Verified ✓'
    },
    upvotesCount: 345,
    commentsCount: 44
  }
]

export function getEnclavePulseArticles(enclaveId?: string): PulseArticle[] {
  if (enclaveId === 'trades_construction') return TRADES_PULSE_ARTICLES
  if (enclaveId === 'healthcare_medicine') return HEALTHCARE_PULSE_ARTICLES
  if (enclaveId === 'automotive_mechanics') return AUTOMOTIVE_PULSE_ARTICLES
  return PULSE_ARTICLES_DATA
}

export function getEnclavePulseCategories(enclaveId?: string) {
  if (enclaveId === 'trades_construction') {
    return [
      { id: 'All', label: '🌐 All Trade News', icon: '🌐' },
      { id: 'Timber & Framing', label: '🌲 Timber & Framing', icon: '🌲' },
      { id: 'Millwork & Joinery', label: '🪚 Millwork & Joinery', icon: '🪚' },
      { id: 'OSHA & Safety', label: '🦺 OSHA & Safety Standards', icon: '🦺' },
      { id: 'Tooling & Machinery', label: '⚙️ Tooling & Machinery', icon: '⚙️' },
      { id: 'Commercial Bids', label: '🏢 Commercial Buildouts', icon: '🏢' }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      { id: 'All', label: '🌐 All Clinical News', icon: '🌐' },
      { id: 'Trauma Surgery', label: '🔪 Trauma & Acute Care Surgery', icon: '🔪' },
      { id: 'Emergency Nursing', label: '🩺 Emergency Nursing (TNCC)', icon: '🩺' },
      { id: 'Pharmacology & MTP', label: '🩸 Pharmacology & MTP', icon: '🩸' },
      { id: 'Critical Care', label: '🚨 Critical Care & ICU', icon: '🚨' },
      { id: 'Medical Devices', label: '🔬 Medical Devices & POCUS', icon: '🔬' }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      { id: 'All', label: '🌐 All Automotive News', icon: '🌐' },
      { id: 'EV Powertrains & 800V', label: '🔋 EV Powertrains & 800V', icon: '🔋' },
      { id: 'Diagnostics & Scopes', label: '⚡ Diagnostics & Oscilloscopes', icon: '⚡' },
      { id: 'Engine & Transmission', label: '🔧 Engine & Transmission Rebuild', icon: '🔧' },
      { id: 'ADAS Calibration', label: '📡 ADAS & Radar Calibration', icon: '📡' },
      { id: 'Fleet Diesel', label: '🚚 Fleet Diesel & Heavy Equipment', icon: '🚚' }
    ]
  }

  return PULSE_CATEGORIES
}

export function getEnclaveAIBrief(enclaveId?: string): AIDailyBriefItem {
  if (enclaveId === 'trades_construction') {
    return {
      id: 'brief_trades_today',
      date: 'Saturday, August 29, 2026',
      headline: 'Mass Timber High-Rise Expansion & OSHA Job-Site Rigging Directive Modernization',
      executiveSummary: 'Commercial engineering firms adopt factory-milled mass timber bents to cut build cycles by 40%. OSHA updates 100% tie-off compliance guidelines for clear-span rafter installations.',
      keyPillars: [
        {
          pillar: 'Glulam & Heavy Timber ASTM E119 Fire Performance',
          emoji: '🌲',
          summary: 'Sacrificial char layers in heavy Douglas Fir glulams maintain structural core integrity for over 2 hours without additional gypsum cladding.',
          primarySource: 'Timber Framers Guild & IBC 2026 Type IV Code',
          sourceUrl: 'https://www.timberframers.org'
        },
        {
          pillar: 'OSHA Subpart M Retractable Lanyard Safety Directives',
          emoji: '🦺',
          summary: 'Mandatory daily lock tests and dust-sealed housings enforced for commercial framing crews on truss installations over 6 feet.',
          primarySource: 'OSHA 1926 Subpart M Directive',
          sourceUrl: 'https://www.osha.gov'
        },
        {
          pillar: 'Passivhaus Air-Barrier Enclosure Best Practices',
          emoji: '📐',
          summary: 'Continuous exterior insulation and vapor-permeable taped membrane details eliminate envelope thermal bridging.',
          primarySource: 'Passivhaus Institute Technical Standards',
          sourceUrl: 'https://passiv.de'
        }
      ],
      audioDuration: '3 min listen'
    }
  }

  if (enclaveId === 'healthcare_medicine') {
    return {
      id: 'brief_healthcare_today',
      date: 'Saturday, August 29, 2026',
      headline: 'Cold-Stored Whole Blood Protocols & Bedside Point-of-Care Ultrasound in Level 1 Trauma Resuscitation',
      executiveSummary: 'Updated multi-center trial confirms survival benefits of early low-titer O-whole blood infusion within 15 minutes of hemorrhagic shock. ACS COT releases revised MTP dosing algorithms.',
      keyPillars: [
        {
          pillar: 'Low-Titer O-Whole Blood vs Reconstituted Components',
          emoji: '🩸',
          summary: 'Cold-stored whole blood cuts 24-hour mortality by 28% and halts trauma-induced coagulopathy significantly faster than component therapy.',
          primarySource: 'ACS COT Trauma Resuscitation Directive',
          sourceUrl: 'https://www.facs.org'
        },
        {
          pillar: 'Point-of-Care Ultrasound (eFAST) in Primary Survey',
          emoji: '🩺',
          summary: 'Nurse and trauma fellow-led bedside POCUS detects occult hemothorax and cardiac tamponade in under 60 seconds.',
          primarySource: 'Emergency Nurses Association Guidelines',
          sourceUrl: 'https://www.ena.org'
        },
        {
          pillar: 'Tranexamic Acid (TXA) 60-Minute Timing Window',
          emoji: '💊',
          summary: '1g IV loading dose within 1 hour post-injury provides maximum antifibrinolytic efficacy; administration past 3 hours increases thrombosis.',
          primarySource: 'CDC & ACS Clinical Safety Bulletins',
          sourceUrl: 'https://www.cdc.gov'
        }
      ],
      audioDuration: '3 min listen'
    }
  }

  if (enclaveId === 'automotive_mechanics') {
    return {
      id: 'brief_automotive_today',
      date: 'Saturday, August 29, 2026',
      headline: '800-Volt Architecture Diagnostics & CAN-FD Bus Integrity in Next-Gen Fleet Powertrains',
      executiveSummary: 'Automotive engineering teams standardize CAT IV 1000V de-energization procedures. NHTSA issues emergency service bulletin regarding regenerative contactor contact welding.',
      keyPillars: [
        {
          pillar: 'High-Voltage Contactor Diagnostics & Safe Lockout',
          emoji: '⚡',
          summary: 'CAT IV 1000V proving unit verification required across B+ and B- terminals before inverter capacitor discharge servicing.',
          primarySource: 'NHTSA Emergency Safety Recall 2026-88',
          sourceUrl: 'https://www.nhtsa.gov'
        },
        {
          pillar: 'PicoScope CAN-FD Bus Differential Signal Decoding',
          emoji: '🔧',
          summary: '4-channel oscilloscope captures physical-layer signal reflection and fretting resistance on body control module connectors.',
          primarySource: 'ASE Master Diagnostic Reference Bulletin',
          sourceUrl: 'https://www.ase.com'
        },
        {
          pillar: 'ADAS Radar & Dynamic Camera Target Recalibration',
          emoji: '📡',
          summary: 'Zero-point calibration procedures required following any suspension alignment or windshield replacement.',
          primarySource: 'SAE J2954 EV Diagnostics Standard',
          sourceUrl: 'https://www.sae.org'
        }
      ],
      audioDuration: '3 min listen'
    }
  }

  return TODAY_AI_BRIEF
}

import { PulseRoom, pulseRoomsData } from "./nextgen-data"

export const TRADES_PULSE_ROOMS: PulseRoom[] = [
  {
    id: 'room_trades_1',
    title: '🎙️ LIVE: Heavy Timber Joint Sizing, Crane Lift Rigging & OSHA Fall Protection',
    category: 'Carpentry & Structural Trades',
    host: {
      name: 'David Miller',
      role: 'Master Carpenter & Timber Frame Guild Director',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80'
    },
    speakers: [
      {
        id: 'spk_tm_1',
        name: 'David Miller',
        role: 'Master Carpenter',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
        isSpeaking: true,
        isMuted: false
      },
      {
        id: 'spk_tm_2',
        name: 'Gus Vandermeer',
        role: 'Structural Wood Engineer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        isSpeaking: false,
        isMuted: false
      }
    ],
    listenersCount: 184,
    startedAt: 'Live for 22 mins',
    tags: ['Timber Framing', 'Crane Rigging', 'OSHA 1926 Subpart M', 'Joinery'],
    isLive: true,
    aiSummaryNotes: [
      'Reviewed 40-foot Douglas Fir bent drawbore shear resistance under snow loads.',
      'Crane spreader bar rigging angles must exceed 45 degrees to avoid cross-grain crushing.',
      'OSHA inspection updates on sealed housing requirements for self-retracting lifelines.'
    ]
  }
]

export const HEALTHCARE_PULSE_ROOMS: PulseRoom[] = [
  {
    id: 'room_health_1',
    title: '🎙️ LIVE: Massive Transfusion Protocol in Exsanguinating Trauma: Whole Blood vs Components',
    category: 'Emergency Medicine & Trauma Surgery',
    host: {
      name: 'Dr. Angela Vance, MD',
      role: 'Chief of Orthopedic Trauma Surgery',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80'
    },
    speakers: [
      {
        id: 'spk_hm_1',
        name: 'Dr. Angela Vance, MD',
        role: 'Orthopedic Trauma Surgeon',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
        isSpeaking: true,
        isMuted: false
      },
      {
        id: 'spk_hm_2',
        name: 'Elena Rostova, RN',
        role: 'Trauma Resuscitation Nurse Lead',
        avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
        isSpeaking: false,
        isMuted: false
      }
    ],
    listenersCount: 312,
    startedAt: 'Live for 18 mins',
    tags: ['Trauma Surgery', 'MTP', 'Damage Control Laparotomy', 'Emergency Nursing'],
    isLive: true,
    aiSummaryNotes: [
      'Low-titer O-whole blood accelerates platelet clot formation compared to component therapy.',
      'TXA loading dose timing strictly under 60 minutes from injury in blunt/penetrating shock.',
      'Monitoring ionized calcium levels every 15 minutes during rapid whole blood delivery.'
    ]
  }
]

export const AUTOMOTIVE_PULSE_ROOMS: PulseRoom[] = [
  {
    id: 'room_auto_1',
    title: '🎙️ LIVE: 800V High-Voltage Battery Isolation, Inverter Diagnostics & CAN-FD Scopes',
    category: 'Automotive Engineering & Master Diagnostics',
    host: {
      name: 'Marcus Miller, ASE Master Tech',
      role: 'World Class Master Tech & L3 Hybrid Diagnostics Lead',
      avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80'
    },
    speakers: [
      {
        id: 'spk_am_1',
        name: 'Marcus Miller',
        role: 'ASE Master Tech',
        avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
        isSpeaking: true,
        isMuted: false
      },
      {
        id: 'spk_am_2',
        name: 'Kenji Sato',
        role: 'Master Diagnostic Technician',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        isSpeaking: false,
        isMuted: false
      }
    ],
    listenersCount: 226,
    startedAt: 'Live for 34 mins',
    tags: ['ASE L3 Specialist', 'PicoScope 4425A', '800V Architecture', 'CAN-FD Traces'],
    isLive: true,
    aiSummaryNotes: [
      'Interpreting differential voltage ring-down on CAN-FD transceivers during high-load inverter regeneration.',
      'Safe de-energization and CAT IV 1000V multimeter proving dead procedures on 800V packs.',
      'Diagnosing inter-cell DC resistance anomalies via thermal imaging & bi-directional scan tools.'
    ]
  }
]

export function getEnclavePulseRooms(enclaveId?: string): PulseRoom[] {
  if (enclaveId === 'trades_construction') return TRADES_PULSE_ROOMS
  if (enclaveId === 'healthcare_medicine') return HEALTHCARE_PULSE_ROOMS
  if (enclaveId === 'automotive_mechanics') return AUTOMOTIVE_PULSE_ROOMS
  return pulseRoomsData
}
