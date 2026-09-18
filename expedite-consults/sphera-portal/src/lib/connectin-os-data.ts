export interface CompanyProfileData {
  id: string
  name: string
  tagline: string
  logo: string
  coverImage: string
  headquarters: string
  founded: string
  companySize: string
  industry: string
  website: string
  verifiedStatus: 'FedRAMP Authorized' | 'DOD Cleared Defense Contractor' | 'Enterprise Verified'
  about: string
  metrics: {
    followersCount: string
    activeEmployees: number
    productsCount: number
    servicesCount: number
    openJobsCount: number
  }
  certifications: string[]
  securityPosture: {
    soc2: boolean
    iso27001: boolean
    fedrampStatus: string
    dataResidency: string
    encryptionStandard: string
    catoReady: boolean
  }
  products: {
    id: string
    name: string
    icon: string
    tagline: string
    price: string
    rating: number
    reviewsCount: number
    trialAvailable: boolean
  }[]
  services: {
    id: string
    name: string
    scope: string
    startingPrice: string
    deliveryTimeline: string
  }[]
  openJobs: {
    id: string
    title: string
    department: string
    location: string
    salaryRange: string
    clearanceReq: string
  }[]
  clientReviews: {
    author: string
    role: string
    company: string
    avatar: string
    rating: number
    tenure: string
    comment: string
    verifiedContract: boolean
  }[]
  recentResearch: {
    title: string
    date: string
    summary: string
    downloadUrl: string
  }[]
}

export const EXPEDITE_CONSULTS_COMPANY_DATA: CompanyProfileData = {
  id: 'comp_expedite',
  name: 'Expedite Consults',
  tagline: 'Autonomous Cyber Defense, AI AppSec Engineering & FedRAMP cATO Advisory',
  logo: '🛡️',
  coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
  headquarters: 'Washington, DC Metro Area',
  founded: '2021',
  companySize: '51-200 Employees (100% US Cleared Technical Cadre)',
  industry: 'Cybersecurity, Cloud Defense & Federal Advisory',
  website: 'https://expediteconsults.com',
  verifiedStatus: 'DOD Cleared Defense Contractor',
  about: 'Expedite Consults is an elite enterprise cybersecurity and artificial intelligence advisory firm. We build autonomous threat verification platforms (Expedite Strike, AXIOM Cyber Suite), provide continuous ATO (cATO) authorization accelerators, and supply fractional CISO governance to Fortune 500 enterprises and federal civilian defense agencies.',
  metrics: {
    followersCount: '48.2K',
    activeEmployees: 86,
    productsCount: 4,
    servicesCount: 6,
    openJobsCount: 8
  },
  certifications: [
    'NIST SP 800-207 Zero Trust Validated',
    'FedRAMP 3PAO Audited',
    'ISO/IEC 27001:2022 Certified',
    'SOC 2 Type II Audited',
    'CMMC 2.0 Level 2 Ready'
  ],
  securityPosture: {
    soc2: true,
    iso27001: true,
    fedrampStatus: 'FedRAMP High In-Process (GovCloud Enclave)',
    dataResidency: 'US-Only Isolated GovCloud Data Centers',
    encryptionStandard: 'AES-256-GCM at Rest / TLS 1.3 in Transit (FIPS 140-3 Cryptographic Module)',
    catoReady: true
  },
  products: [
    {
      id: 'expedite-strike',
      name: 'Expedite Strike & Fusion 2026',
      icon: '⚡',
      tagline: 'Autonomous Red Teaming, ASPM & Hybrid AI AppSec.',
      price: '$499 / mo',
      rating: 4.98,
      reviewsCount: 142,
      trialAvailable: true
    },
    {
      id: 'axiom-cyber-suite',
      name: 'AXIOM AI-Powered Cyber Suite',
      icon: '🛡️',
      tagline: 'Autonomous zero-trust verification and threat surface mapping.',
      price: '$499 / mo',
      rating: 4.94,
      reviewsCount: 98,
      trialAvailable: true
    },
    {
      id: 'oscal-cato-machine',
      name: 'OSCAL Automated cATO Dossier Generator',
      icon: '📑',
      tagline: 'Machine-readable NIST 800-53 OSCAL JSON evidence exporter.',
      price: '$799 / mo',
      rating: 5.0,
      reviewsCount: 46,
      trialAvailable: true
    }
  ],
  services: [
    {
      id: 'srv_1',
      name: 'Fractional CISO & SEC Cyber Disclosure Retainer',
      scope: 'Board Governance, Incident Disclosure Strategy, NIST 800-53 Audits',
      startingPrice: '$6,500 / mo',
      deliveryTimeline: 'Dedicated CISO Partner'
    },
    {
      id: 'srv_2',
      name: 'Full-Scope Red Team Adversary Emulation',
      scope: 'Cloud Ingress, Active Directory, Zero-Day Emulation & Triage Auto-PR',
      startingPrice: '$12,000 / Engagement',
      deliveryTimeline: '2 Weeks'
    },
    {
      id: 'srv_3',
      name: 'AWS GovCloud cATO Architecture & Migration Sprint',
      scope: 'Multi-Account Landing Zone, SCP Guardrails, Automated OSCAL Pipeline',
      startingPrice: '$15,000 / Sprint',
      deliveryTimeline: '3 Weeks'
    }
  ],
  openJobs: [
    {
      id: 'job_1',
      title: 'Principal Cloud & Zero Trust Architect (Fellow)',
      department: 'Cloud Security Practice',
      location: 'Washington, DC / Remote',
      salaryRange: '$195,000 - $235,000 Base ($245K TC)',
      clearanceReq: 'Secret / Top Secret Eligible'
    },
    {
      id: 'job_2',
      title: 'Senior Offensive AppSec / Exploit Engineer',
      department: 'Expedite Strike Labs',
      location: 'Remote (US)',
      salaryRange: '$175,000 - $210,000 Base ($220K TC)',
      clearanceReq: 'Public Trust'
    },
    {
      id: 'job_3',
      title: 'Information System Security Engineer (ISSE - cATO)',
      department: 'Federal Compliance',
      location: 'Reston, VA / Hybrid',
      salaryRange: '$165,000 - $195,000 Base ($205K TC)',
      clearanceReq: 'TS/SCI'
    }
  ],
  clientReviews: [
    {
      author: 'Marcus Vance',
      role: 'VP of Engineering @ CloudScale Systems',
      company: 'CloudScale Corp (1,000-5,000 Employees)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      tenure: 'Used Expedite Strike for 14 months',
      comment: 'Eliminated 92% of our SAST alert noise within 48 hours. The automated GitHub fix PRs save our engineering squads 30+ hours every sprint.',
      verifiedContract: true
    },
    {
      author: 'Col. Raymond Sterling (Ret.)',
      role: 'Chief Information Security Officer',
      company: 'Federal Defense Systems Group',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      tenure: 'GovCloud cATO Retainer for 9 months',
      comment: 'Achieved continuous ATO authorization in under 3 weeks. The machine-readable OSCAL JSON exports satisfied all statutory DNI/DoD auditors seamlessly.',
      verifiedContract: true
    }
  ],
  recentResearch: [
    {
      title: '2026 Autonomous Threat Surface & AI-BOM Vulnerability Benchmark',
      date: 'August 2026',
      summary: 'Empirical analysis across 4,200 Kubernetes clusters analyzing eBPF micro-segmentation efficacy vs traditional iptables.',
      downloadUrl: '#'
    },
    {
      title: 'OSCAL Continuous Monitoring Architecture for FedRAMP 2026',
      date: 'July 2026',
      summary: 'Practical implementation guide for automated system security plan (SSP) telemetry synchronization.',
      downloadUrl: '#'
    }
  ]
}

export interface SellerCenterStats {
  mrr: string
  totalRevenue: string
  activeLicenses: number
  activeTrials: number
  conversionRate: string
  avgContractValue: string
  escrowPending: string
  supportOpenTickets: number
  monthlyViews: string
}

export const SELLER_CENTER_METRICS: SellerCenterStats = {
  mrr: '$122,740 / mo',
  totalRevenue: '$1,480,200',
  activeLicenses: 634,
  activeTrials: 44,
  conversionRate: '28.4%',
  avgContractValue: '$5,988 / yr',
  escrowPending: '$34,500 held in ConnectIn Escrow',
  supportOpenTickets: 2,
  monthlyViews: '48.9k views'
}

export interface ConnectInEvent {
  id: string
  title: string
  type: 'Webinar' | 'Product Demo' | 'Conference' | 'Hands-On Workshop' | 'Recruiting Summit'
  host: string
  hostLogo: string
  date: string
  time: string
  attendeesCount: number
  description: string
  featuredProduct?: string
  speakerName: string
  speakerRole: string
  speakerAvatar: string
  isRegistered?: boolean
}

export const PLATFORM_EVENTS_DATA: ConnectInEvent[] = [
  {
    id: 'evt_1',
    title: 'AXIOM Enterprise Security Demo: Autonomous Zero-Trust Defense',
    type: 'Product Demo',
    host: 'Expedite Consults Product Lab',
    hostLogo: '🛡️',
    date: 'Wednesday, September 3, 2026',
    time: '2:00 PM - 3:00 PM EST',
    attendeesCount: 342,
    description: 'Live interactive teardown of AXIOM and Expedite Strike. Watch real-time eBPF micro-segmentation, AI-BOM scanning, and 1-click cATO evidence export.',
    featuredProduct: 'AXIOM AI Cyber Suite',
    speakerName: 'Alex Taylor',
    speakerRole: 'Principal Cloud Security Architect (Fellow)',
    speakerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    isRegistered: false
  },
  {
    id: 'evt_2',
    title: 'FedRAMP High & Continuous ATO (cATO) 2026 Executive Briefing',
    type: 'Webinar',
    host: 'GovTech Compliance Forum',
    hostLogo: '🏛️',
    date: 'Thursday, September 11, 2026',
    time: '1:00 PM - 2:30 PM EST',
    attendeesCount: 512,
    description: 'How defense contractors are leveraging machine-readable OSCAL JSON pipelines to accelerate federal authorizations from 9 months to 14 days.',
    featuredProduct: 'OSCAL Automated cATO Generator',
    speakerName: 'Alexander Novak',
    speakerRole: 'FedRAMP 3PAO Lead Reviewer',
    speakerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    isRegistered: true
  },
  {
    id: 'evt_3',
    title: 'Agentic AI Safety & MCP Tool Protocol Security Masterclass',
    type: 'Hands-On Workshop',
    host: 'AI Safety Consortium',
    hostLogo: '🤖',
    date: 'Tuesday, September 16, 2026',
    time: '11:00 AM - 1:00 PM EST',
    attendeesCount: 289,
    description: 'Hands-on coding workshop on cryptographic Ed25519 nonce validation, WebAssembly runtime containment, and prompt injection defense.',
    featuredProduct: 'Sphera AI-BOM Scanner',
    speakerName: 'Dr. Elena Rostova',
    speakerRole: 'Chief AI Safety Scientist @ Stanford AI Fellow',
    speakerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    isRegistered: false
  }
]

export interface AIAgentItem {
  id: string
  name: string
  role: string
  icon: string
  rating: number
  installsCount: string
  price: string
  description: string
  capabilities: string[]
  mcpCompatible: boolean
}

export const AI_AGENTS_MARKETPLACE_DATA: AIAgentItem[] = [
  {
    id: 'agent_sec',
    name: 'ÆGIS Autonomous Security & SAST Fix Agent',
    role: 'Autonomous AppSec Triage & Auto-PR Bot',
    icon: '🛡️',
    rating: 4.98,
    installsCount: '8.4k installs',
    price: '$49 / agent / mo',
    description: 'Monitors GitHub/GitLab repositories in real time, scans for zero-days, and submits tested, non-breaking pull requests with vulnerability fixes.',
    capabilities: ['Auto-PR Code Patching', 'SAST/SCA False Positive Pruning', 'MCP Server Protocol v2026.1'],
    mcpCompatible: true
  },
  {
    id: 'agent_cato',
    name: 'OSCAL cATO Compliance Verification Agent',
    role: 'Continuous NIST 800-53 Auditor',
    icon: '📑',
    rating: 4.95,
    installsCount: '4.9k installs',
    price: '$89 / agent / mo',
    description: 'Continuously queries AWS GovCloud telemetry and validates 340+ statutory security controls, generating instant OSCAL evidence packages.',
    capabilities: ['Continuous Telemetry Assertion', 'OSCAL JSON Machine Exporter', 'STIG Drift Auto-Correction'],
    mcpCompatible: true
  },
  {
    id: 'agent_research',
    name: 'VeritasLens Fact-Radar Intelligence Agent',
    role: 'Real-Time Threat & Bias Intelligence',
    icon: '🌐',
    rating: 5.0,
    installsCount: '12.1k installs',
    price: '$39 / agent / mo',
    description: 'Clusters 14 national media feeds, detects algorithmic blindspots, and checks statutory legal citations across SEC and CISA advisories.',
    capabilities: ['Blindspot NLP Detection', 'Statutory Cross-Checking', 'Real-time WebSocket Push'],
    mcpCompatible: true
  },
  {
    id: 'agent_cloud',
    name: 'Multi-Cloud eBPF Mesh Topology Agent',
    role: 'Kernel Micro-Segmentation Enforcer',
    icon: '☁️',
    rating: 4.92,
    installsCount: '6.2k installs',
    price: '$69 / agent / mo',
    description: 'Attaches directly to Linux cgroups via eBPF to trace socket telemetry, detect unauthenticated ingress, and enforce Zero Trust policies.',
    capabilities: ['Kernel Socket Sniffing', 'Cilium ClusterMesh Auto-Config', 'Zero Performance Overhead'],
    mcpCompatible: true
  }
]

export interface DigitalDownloadProduct {
  id: string
  title: string
  category: 'Architecture Template' | 'Compliance Package' | 'Security Script' | 'Research Dossier'
  icon: string
  author: string
  price: string
  rating: number
  downloadsCount: string
  description: string
  fileFormat: string
}

export const DIGITAL_DOWNLOADS_DATA: DigitalDownloadProduct[] = [
  {
    id: 'dl_1',
    title: 'Enterprise AWS GovCloud Multi-Account Terraform Blueprint',
    category: 'Architecture Template',
    icon: '🏗️',
    author: 'Expedite Consults Advisory',
    price: '$199 (One-Time)',
    rating: 5.0,
    downloadsCount: '1,420 downloads',
    description: 'Production-ready Terraform modules for AWS Organizations, Transit Gateway, GuardDuty central logging, and KMS HSM envelope encryption.',
    fileFormat: 'Terraform HCL + Architecture PDF'
  },
  {
    id: 'dl_2',
    title: 'NIST SP 800-53 Rev 5 Complete OSCAL Machine Evidence Package',
    category: 'Compliance Package',
    icon: '📑',
    author: 'GovTech Compliance Labs',
    price: '$299 (One-Time)',
    rating: 4.98,
    downloadsCount: '890 downloads',
    description: 'Machine-readable OSCAL JSON templates for 340 controls pre-mapped to AWS Config rules and STIG automation scripts.',
    fileFormat: 'OSCAL JSON + CSV Matrix'
  },
  {
    id: 'dl_3',
    title: 'Model Context Protocol (MCP) Server Hardening & Nonce Validator',
    category: 'Security Script',
    icon: '🤖',
    author: 'AI Safety Consortium',
    price: '$99 (One-Time)',
    rating: 4.96,
    downloadsCount: '2,100 downloads',
    description: 'Python & TypeScript middleware preventing prompt injection, zero-width unicode attacks, and parameter tampering in agentic tool bindings.',
    fileFormat: 'Node/Py Source Code + Test Suite'
  }
]
