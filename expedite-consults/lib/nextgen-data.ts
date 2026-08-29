export interface PulseRoom {
  id: string
  title: string
  category: string
  host: {
    name: string
    role: string
    avatar: string
  }
  speakers: {
    id: string
    name: string
    role: string
    avatar: string
    isSpeaking: boolean
    isMuted: boolean
  }[]
  listenersCount: number
  startedAt: string
  tags: string[]
  isLive: boolean
  aiSummaryNotes?: string[]
}

export interface PeerReviewItem {
  id: string
  author: {
    name: string
    role: string
    avatar: string
  }
  title: string
  diagramUrl?: string
  description: string
  submittedAt: string
  reviewsCount: number
  status: 'Open for Review' | 'Reviewed & Approved' | 'Revisions Requested'
  reputationBounty: number
  reviews: {
    reviewerName: string
    reviewerRole: string
    reviewerAvatar: string
    rating: number
    feedback: string
    timestamp: string
  }[]
}

export interface CompensationCity {
  city: string
  stateOrCountry: string
  costOfLivingIndex: number
  taxRateEstimated: number
  medianBase: number
  purchasingPowerFactor: number
}

export interface ProductLaunchItem {
  id: string
  title: string
  tagline: string
  thumbnail: string
  makers: { name: string; avatar: string }[]
  upvotesCount: number
  hasUpvoted: boolean
  category: string
  productUrl: string
  description: string
  screenshots: string[]
  commentsCount: number
}

export interface WatercoolerThread {
  id: string
  companyTag: string
  companyLogo: string
  verifiedRole: string
  title: string
  content: string
  upvotes: number
  hasUpvoted?: boolean
  commentsCount: number
  timestamp: string
  category: 'Compensation' | 'Layoffs & Reorg' | 'Interview Prep' | 'Culture & Execs'
  comments: {
    id: string
    verifiedRole: string
    content: string
    timestamp: string
    likes: number
  }[]
}

export interface AdvisorProfile {
  id: string
  name: string
  headline: string
  avatar: string
  hourlyRate: number
  fractionalRoles: string[]
  rating: number
  reviewsCount: number
  topExpertise: string[]
  availableSlots: string[]
  bio: string
}

export interface StartupJobItem {
  id: string
  companyName: string
  companyLogo: string
  tagline: string
  fundingStage: 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Bootstrapped'
  totalRaised: string
  roleTitle: string
  salaryRange: string
  equityRange: string
  workplace: 'Remote' | 'Hybrid' | 'NYC' | 'SF'
  founderName: string
  founderAvatar: string
  founderPitch: string
}

export const pulseRoomsData: PulseRoom[] = [
  {
    id: 'room_1',
    title: '🎙️ LIVE: Multi-Agent AI Containment & Sandboxing Architecture Teardown',
    category: 'Cybersecurity & AI',
    host: {
      name: 'Dr. Elena Rostova',
      role: 'Stanford AI Lab Fellow & Chief Scientist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
    },
    speakers: [
      {
        id: 'spk_1',
        name: 'Dr. Elena Rostova',
        role: 'Chief AI Research Scientist',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        isSpeaking: true,
        isMuted: false
      },
      {
        id: 'spk_2',
        name: 'Alex Taylor',
        role: 'Principal Cloud & Security Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        isSpeaking: false,
        isMuted: false
      }
    ],
    listenersCount: 428,
    startedAt: 'Live for 24 mins',
    tags: ['AI Security', 'Zero Trust', 'MicroVMs', 'Live AMA'],
    isLive: true,
    aiSummaryNotes: [
      'Discussed ephemeral container recycling vs. warm sandbox pools for sub-10ms agent response.',
      'Identified token poisoning risks in long-term memory retrieval without HMAC nonces.',
      'Audience Q&A: Best practices for multi-tenant isolation on AWS Firecracker.'
    ]
  }
]

export const peerReviewQueueData: PeerReviewItem[] = [
  {
    id: 'rev_1',
    author: {
      name: 'David Sterling',
      role: 'Principal AI Security Engineer @ Apex Defense Labs',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80'
    },
    title: 'Distributed Policy Enforcement Blueprint using eBPF & Cilium',
    diagramUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    description: 'Seeking Staff/Principal review on our kernel-level packet inspection topology for zero-trust VPC peering.',
    submittedAt: '4 hours ago',
    reviewsCount: 3,
    status: 'Open for Review',
    reputationBounty: 150,
    reviews: []
  }
]

export const compensationCitiesData: CompensationCity[] = [
  { city: 'New York', stateOrCountry: 'NY, United States', costOfLivingIndex: 100, taxRateEstimated: 0.35, medianBase: 215000, purchasingPowerFactor: 1.0 },
  { city: 'San Francisco', stateOrCountry: 'CA, United States', costOfLivingIndex: 105, taxRateEstimated: 0.38, medianBase: 225000, purchasingPowerFactor: 0.95 },
  { city: 'Austin', stateOrCountry: 'TX, United States', costOfLivingIndex: 68, taxRateEstimated: 0.24, medianBase: 185000, purchasingPowerFactor: 1.38 },
  { city: 'Boston', stateOrCountry: 'MA, United States', costOfLivingIndex: 82, taxRateEstimated: 0.32, medianBase: 195000, purchasingPowerFactor: 1.15 },
  { city: 'Remote (Worldwide)', stateOrCountry: 'Global Anywhere', costOfLivingIndex: 60, taxRateEstimated: 0.25, medianBase: 190000, purchasingPowerFactor: 1.52 },
  { city: 'London', stateOrCountry: 'United Kingdom', costOfLivingIndex: 85, taxRateEstimated: 0.34, medianBase: 155000, purchasingPowerFactor: 1.08 }
]

export const productLaunchesData: ProductLaunchItem[] = [
  {
    id: 'launch_0',
    title: 'ConnectIn Next-Gen Ecosystem',
    tagline: 'Professional network surpassing LinkedIn with AI Virality, Pulse Audio, and App Store',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    makers: [
      { name: 'Alex Taylor', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
      { name: 'Dr. Elena Rostova', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' }
    ],
    upvotesCount: 528,
    hasUpvoted: true,
    category: 'Enterprise SaaS',
    productUrl: 'https://expedite-consults.vercel.app/connectin',
    description: 'The definitive next-generation professional network uniting career mobility, real-time Pulse audio stages, 16 flagship services, and 137 Sphera apps.',
    screenshots: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80'
    ],
    commentsCount: 42
  },
  {
    id: 'launch_1',
    title: 'Expedite CareerSuite™ Pro',
    tagline: 'AI-Powered Resume Tailoring, Profile Maximizer & ATS Optimizer Suite',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    makers: [
      { name: 'Alex Taylor', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }
    ],
    upvotesCount: 412,
    hasUpvoted: true,
    category: 'AI & Data',
    productUrl: 'https://tuhousing.vercel.app/',
    description: 'Tailor master resumes against target job descriptions in seconds and maximize profile visibility for recruiters.',
    screenshots: [],
    commentsCount: 36
  },
  {
    id: 'launch_2',
    title: 'VeritasLens eBPF Security Radar',
    tagline: 'Zero-overhead kernel observability and agent containment loop engine',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    makers: [
      { name: 'Alex Taylor', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }
    ],
    upvotesCount: 342,
    hasUpvoted: false,
    category: 'Developer Tools & Security',
    productUrl: 'https://expedite-consults.vercel.app/veritaslens',
    description: 'An open-source eBPF probe engine built to detect latent semantic drift in autonomous AI agent tool executions.',
    screenshots: [],
    commentsCount: 28
  }
]

export const watercoolerThreadsData: WatercoolerThread[] = [
  {
    id: 'wc_1',
    companyTag: 'Expedite Consults',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    verifiedRole: 'Principal Cloud Architect',
    title: 'Q3 Cyber Advisory Promotion Cycle & Equity Grants Structure',
    content: 'Leadership just ratified our 2026 performance bands. Top tier advisory partners are getting 22% equity top-ups.',
    upvotes: 48,
    commentsCount: 14,
    timestamp: '2h ago',
    category: 'Compensation',
    comments: []
  }
]

export const advisorsData: AdvisorProfile[] = [
  {
    id: 'adv_1',
    name: 'Alex Taylor',
    headline: 'Principal Cloud & Security Architect | Advisory Fellow @ Expedite',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    hourlyRate: 350,
    fractionalRoles: ['Fractional CISO', 'Zero Trust Advisor', 'Security Due Diligence'],
    rating: 5.0,
    reviewsCount: 38,
    topExpertise: ['Zero Trust Multi-Cloud', 'Autonomous AI Containment', 'SOC 2 Type II', 'Kubernetes Security'],
    availableSlots: ['Tomorrow · 2:00 PM EST', 'Thursday · 10:00 AM EST', 'Friday · 4:00 PM EST'],
    bio: '10+ years guiding Series B through Fortune 100 enterprise C-suite on zero-trust transformations, cloud posture hardening, and threat mitigation.'
  },
  {
    id: 'adv_2',
    name: 'Dr. Elena Rostova',
    headline: 'Chief AI Research Scientist | Stanford AI Lab Fellow',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    hourlyRate: 450,
    fractionalRoles: ['AI Safety Advisor', 'Research Fellow', 'LLM Agent Defense'],
    rating: 4.98,
    reviewsCount: 52,
    topExpertise: ['Agent Containment', 'Cryptographic Nonces', 'Multi-Agent Loops'],
    availableSlots: ['Wednesday · 1:00 PM EST', 'Friday · 11:00 AM EST'],
    bio: 'Pioneering research in generative agent security, isolated execution sandboxes, and safety alignment.'
  }
]

export const startupJobsData: StartupJobItem[] = [
  {
    id: 'stup_1',
    companyName: 'Apex Defense Labs',
    companyLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    tagline: 'Autonomous cyber defense loops for critical financial infrastructure',
    fundingStage: 'Series A',
    totalRaised: '$14.5M (Led by Sequoia)',
    roleTitle: 'Founding Cloud Security Architect',
    salaryRange: '$210k - $255k',
    equityRange: '1.2% - 2.5% Equity',
    workplace: 'NYC / Hybrid',
    founderName: 'David Sterling',
    founderAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    founderPitch: 'We are building the first deterministic containment engine for enterprise AI tools.'
  }
]

// -------------------------------------------------------------
// EXPEDITE CONSULTS DIGITAL ECOSYSTEM: 16 PRODUCTS & 137 SPHERA APPS
// -------------------------------------------------------------

export interface FlagshipProduct {
  id: string
  name: string
  tagline: string
  description: string
  icon: string
  coverImage: string
  badge: string
  category: 'Cyber & Security' | 'Marketplace & Commerce' | 'Career & Professional' | 'Content & Creation' | 'Social & Community' | 'AI & Media' | 'Home Services'
  priceDisplay: string
  url: string
  isOnline: boolean
  featured: boolean
  highlights: string[]
}

export type MarketplaceProduct = FlagshipProduct

export interface SpheraMicroApp {
  id: string
  name: string
  tagline: string
  icon: string
  badge?: 'HOT' | 'NEW' | 'AI' | 'PRO' | 'LIVE' | 'PORT 9012' | 'PORT 9011' | 'FLAGSHIP' | 'COMING'
  category: 'Profile & Identity' | 'Content & Creation (SPHERA Studio)' | 'Social & Community (SPHERA Social)' | 'Career & Professional (CareerOrbit)' | 'Marketplace & Services (BAZAAR)' | 'Events & Time' | 'AI & Media Intelligence' | 'Security & Threat Intelligence'
  url: string
  status: 'Available' | 'Live' | 'Coming Soon'
}

// 16 FLAGSHIP PRODUCTS & SERVICES
export const flagshipProductsData: FlagshipProduct[] = [
  {
    id: 'prod_1',
    name: 'Expedite Strike & Fusion 2026',
    tagline: 'Autonomous Pentest, ASPM & Hybrid AI AppSec Platform',
    description: 'Enterprise Agentic AppSec & Offensive Security Suite — Expedite Fusion™ Hybrid Scanning, AI-BOM & LLM Scanner, Checkmarx MCP Server, Triage & Auto-PR Assist, XM Cyber Choke Point Graph, and 10-Section Board PDF Dossiers.',
    icon: '⚡',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    badge: '⚡ Flagship AppSec',
    category: 'Cyber & Security',
    priceDisplay: '$499 / mo',
    url: 'http://localhost:9012/',
    isOnline: true,
    featured: true,
    highlights: ['Expedite Fusion™ Hybrid Scanning', 'AI-BOM & LLM Scanner', 'Checkmarx MCP Server', 'XM Cyber Choke Point Graph']
  },
  {
    id: 'prod_2',
    name: 'ÆGIS · SOC Autonomous PenTest',
    tagline: 'Autonomous Agentic AI Penetration Testing & Exploit Hub',
    description: 'Full SOC Autonomous PenTest console — multi-target asset discovery, weaponized auto-exploit queue, PoC interactive evidence terminal, and Neo4j blast radius attack graphs.',
    icon: '🎯',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
    badge: '🛡️ SOC PenTest',
    category: 'Cyber & Security',
    priceDisplay: '$699 / mo',
    url: 'http://localhost:9011/app/?standalone=1',
    isOnline: true,
    featured: true,
    highlights: ['Multi-target asset discovery', 'Auto-exploit weaponization queue', 'Neo4j attack graphs', 'Interactive evidence terminal']
  },
  {
    id: 'prod_3',
    name: 'BAZAAR Marketplace',
    tagline: 'Standalone AI-Powered Marketplace & Restaurant Delivery',
    description: 'Independent multi-vendor marketplace with 68 DC/MD/VA restaurants, instant ZIP delivery lookup, real-time cart, and eBay C2C inventory sync.',
    icon: '🛍️',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
    badge: '🛍️ Multi-Vendor',
    category: 'Marketplace & Commerce',
    priceDisplay: '$199 / mo',
    url: 'https://bazaar-standalone.vercel.app/',
    isOnline: true,
    featured: true,
    highlights: ['68 DC/MD/VA Restaurants', 'Instant ZIP delivery lookup', 'Real-time cart & split payments', 'eBay C2C sync']
  },
  {
    id: 'prod_4',
    name: 'CareerOrbit Suite',
    tagline: '44-Tool Enterprise Career & ATS Mobility Suite',
    description: 'Complete standalone intelligence suite with 44 deep-linked tools — JD Match, Interview Forge, Dark Orbit, Offer War Room, and Command Center.',
    icon: '🚀',
    coverImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&auto=format&fit=crop&q=80',
    badge: '🏆 44-Tool Suite',
    category: 'Career & Professional',
    priceDisplay: '$29 / mo',
    url: 'https://careerorbit-standalone.vercel.app/',
    isOnline: true,
    featured: true,
    highlights: ['44 standalone AI career tools', 'Interview Forge with live Q&A', 'Dark Orbit hidden jobs scanner', 'Salary War Room']
  },
  {
    id: 'prod_5',
    name: 'SPHERA Studio',
    tagline: '10-Tool Creation & Content Suite',
    description: 'Dedicated creative powerhouse — Reels vertical video, SphereVision TV, Video Studio editor, AI Video Creator, SpheraCut, and Live Broadcasting.',
    icon: '🎬',
    coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
    badge: '🎬 10 Creative Tools',
    category: 'Content & Creation',
    priceDisplay: '$49 / mo',
    url: 'https://sphera-studio.vercel.app/',
    isOnline: true,
    featured: true,
    highlights: ['Reels vertical video feed', 'SphereVision TV streaming', 'AI Video Creator', 'Live audio spaces']
  },
  {
    id: 'prod_6',
    name: 'SPHERA Social',
    tagline: '9-Tool Community & Networking Suite',
    description: 'Independent social ecosystem — Communities, Encrypted SphereChat DMs, Orbit Connections, SpheraMatch AI matching, and Nexus global broadcast.',
    icon: '🌐',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    badge: '💬 9 Social Tools',
    category: 'Social & Community',
    priceDisplay: 'Free / Social',
    url: 'https://sphera-social.vercel.app/',
    isOnline: true,
    featured: true,
    highlights: ['Encrypted SphereChat DMs', 'SpheraMatch AI people swipe', 'Nexus global broadcast hub', 'Community Groups']
  },
  {
    id: 'prod_7',
    name: 'Sphera Main Platform',
    tagline: 'Unified Digital Universe',
    description: 'Next-gen social universe uniting feed streams, career mobility, marketplace commerce, and creator tools in one unified experience.',
    icon: '🌍',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    badge: '🌐 Digital Universe',
    category: 'Social & Community',
    priceDisplay: 'Connected Platform',
    url: 'https://sphera.expediteconsults.com/',
    isOnline: true,
    featured: true,
    highlights: ['Unified single sign-on', 'Feed & channel broadcasting', 'Integrated digital wallet', 'Multi-tenant architecture']
  },
  {
    id: 'prod_8',
    name: 'VeritasLens',
    tagline: 'AI Media Credibility & Information Intelligence Platform',
    description: 'Bloomberg Terminal + Ground News + Reuters + Knowledge Graph. Real-time Kafka stream ingestion, BERT claim classification, 7-Day TV scorecard & B2B Brand Safety ad-shield.',
    icon: '🌐',
    coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    badge: '🧠 Media Intel',
    category: 'AI & Media',
    priceDisplay: '$149 / mo',
    url: 'https://expedite-consults.vercel.app/veritaslens',
    isOnline: true,
    featured: true,
    highlights: ['Blindspot partisan radar', 'DeBERTa sentence verification', 'OpenLineage provenance graph', 'B2B Brand safety ad-shield']
  },
  {
    id: 'prod_9',
    name: 'SpheraCut',
    tagline: 'AI Creative Suite for Video, Image, Story & Audio',
    description: 'AI-powered creative tools for video, image, story, and audio — Text to Video, Character Builder, Motion Sync & more.',
    icon: '✂️',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
    badge: '✂️ AI Creative',
    category: 'Content & Creation',
    priceDisplay: '$39 / mo',
    url: 'https://spheracut.expediteconsults.com/',
    isOnline: true,
    featured: false,
    highlights: ['Text to Video generator', 'Character Builder', 'Motion Audio Sync', '4K Cloud Rendering']
  },
  {
    id: 'prod_10',
    name: 'AXIOM Cloud Security',
    tagline: 'Product 4 · Multi-Cloud PenTest & Attack Path Engine',
    description: 'Enterprise multi-cloud security assessment, IAM privilege escalation graphing, and authorized penetration testing across AWS, Azure, GCP, and Kubernetes.',
    icon: '☁️',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    badge: '☁️ Cloud PenTest',
    category: 'Cyber & Security',
    priceDisplay: '$399 / mo',
    url: 'https://19-cloud-security-platform.vercel.app/',
    isOnline: true,
    featured: false,
    highlights: ['Chained multi-cloud attack paths', '28+ IAM privilege escalation routes', 'Authorized cloud pentest drills', 'CIS CSPM benchmarks']
  },
  {
    id: 'prod_11',
    name: 'Unified Integration Layer',
    tagline: 'Product 3 · Cross-Platform Ecosystem Hub',
    description: 'Enterprise orchestration layer federating CERBERUS-RE, Aegis Recovery, and AXIOM DAST with 24.5k evt/s telemetry & SOAR playbooks.',
    icon: '🌐',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    badge: '📡 SOAR Hub',
    category: 'Cyber & Security',
    priceDisplay: '$299 / mo',
    url: 'https://18-unified-integration-layer.vercel.app/',
    isOnline: true,
    featured: false,
    highlights: ['Federated gRPC telemetry bus', 'Cross-platform closed-loop SOAR', 'STIX 2.1 threat intelligence sync', '24,500 evt/s pipeline']
  },
  {
    id: 'prod_12',
    name: 'Aegis Recovery',
    tagline: 'Product 2 · Ransomware Recovery & Resilience (78 Studios)',
    description: 'Full-lifecycle autonomous ransomware recovery, exposure digital twin, eBPF syscall freeze, in-memory key carving & AD-FDR.',
    icon: '🛡️',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    badge: '🛡️ Ransomware Rescue',
    category: 'Cyber & Security',
    priceDisplay: '$599 / mo',
    url: 'https://17-ransomware-recovery-platform.vercel.app/',
    isOnline: true,
    featured: false,
    highlights: ['eBPF syscall thread freeze', 'In-memory RAM key carving', 'AD Forest Recovery (AD-FDR)', 'GPU analytics with CUDA']
  },
  {
    id: 'prod_13',
    name: 'CERBERUS-RE',
    tagline: 'Product 1 · Autonomous Malware Intelligence (62 Studios)',
    description: 'Autonomous binary reverse engineering, Cutter/Ghidra disassembler, x32dbg dynamic debugger, Volatility memory analysis & YARA forge.',
    icon: '🦠',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    badge: '🦠 Malware RE',
    category: 'Cyber & Security',
    priceDisplay: '$449 / mo',
    url: 'https://16-malware-analysis-platform.vercel.app/',
    isOnline: true,
    featured: false,
    highlights: ['Autonomous binary disassembly', 'Dynamic sandbox debugger', 'Volatility memory forensics', 'YARA rule auto-generation']
  },
  {
    id: 'prod_14',
    name: 'AXIOM DAST',
    tagline: 'Dynamic Application Security Testing Platform',
    description: 'Enterprise DAST security platform with OWASP Top 10 fuzzing, post-exploitation engine, and live ZAP/Wapiti scan automation.',
    icon: '⚡',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    badge: '⚡ DAST Fuzzer',
    category: 'Cyber & Security',
    priceDisplay: '$249 / mo',
    url: 'https://11-dast-security-platform.vercel.app/',
    isOnline: true,
    featured: false,
    highlights: ['OWASP Top 10 fuzzing engine', 'Post-exploitation verification', 'Live ZAP/Wapiti scan automation', 'Cross-app telemetry broadcast']
  },
  {
    id: 'prod_15',
    name: 'Expedite Consults',
    tagline: 'Cybersecurity Solutions You Can Trust',
    description: 'Expert cybersecurity, cloud security, and risk management to help organizations move forward securely.',
    icon: '🛡️',
    coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80',
    badge: '🛡️ Consults HQ',
    category: 'Cyber & Security',
    priceDisplay: 'Enterprise Advisory',
    url: 'https://www.expediteconsults.com/',
    isOnline: true,
    featured: false,
    highlights: ['Enterprise zero-trust consulting', 'Fractional CISO advisory', 'SOC 2 & ISO 27001 readiness audits', 'Defense architecture reviews']
  },
  {
    id: 'prod_16',
    name: 'SkillHands',
    tagline: 'Book Quality Home Services',
    description: 'Need a certified expert? Licensed & insured, background checked pros with same-day service. Book in 30 seconds.',
    icon: '🔧',
    coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80',
    badge: '🔧 Home Services',
    category: 'Home Services',
    priceDisplay: 'Instant Booking',
    url: 'https://skillhands.expediteconsults.com/',
    isOnline: true,
    featured: false,
    highlights: ['Licensed & insured contractors', 'Same-day booking in 30 seconds', 'Background checked professionals', 'Transparent upfront pricing']
  }
]

// 137 SPHERA PLATFORM APPS CATEGORIZED
export const spheraAppsData: SpheraMicroApp[] = [
  // 👤 PROFILE & IDENTITY (3 apps)
  { id: 'sph_1', name: 'My Profile', tagline: 'Manage your identity & personal orbit', icon: '◯', category: 'Profile & Identity', url: 'https://sphera.expediteconsults.com/?tab=profile', status: 'Available' },
  { id: 'sph_2', name: 'Orbiters', tagline: 'Followers & following network', icon: '🌐', category: 'Profile & Identity', url: 'https://sphera-social.vercel.app/?tool=network', status: 'Available' },
  { id: 'sph_3', name: 'Your Channels', tagline: 'Professional, Creative, Personal & Business', icon: '📺', badge: 'NEW', category: 'Profile & Identity', url: 'https://sphera.expediteconsults.com/?tab=feed', status: 'Available' },

  // 🎬 CONTENT & CREATION (SPHERA STUDIO - 10 apps)
  { id: 'sph_4', name: 'Reels', tagline: 'TikTok-style vertical video feed & upload', icon: '▶', badge: 'HOT', category: 'Content & Creation (SPHERA Studio)', url: 'https://sphera-studio.vercel.app/?tool=reels', status: 'Available' },
  { id: 'sph_5', name: 'SphereVision', tagline: 'TV-style streaming content', icon: '🎥', badge: 'HOT', category: 'Content & Creation (SPHERA Studio)', url: 'https://sphera-studio.vercel.app/?tool=watch', status: 'Available' },
  { id: 'sph_6', name: 'Video Studio', tagline: 'Professional video editing in-browser', icon: '🎬', badge: 'NEW', category: 'Content & Creation (SPHERA Studio)', url: 'https://sphera-studio.vercel.app/?tool=videostudio', status: 'Available' },
  { id: 'sph_7', name: 'Video Creator', tagline: 'AI-powered video generation', icon: '🎞️', badge: 'AI', category: 'Content & Creation (SPHERA Studio)', url: 'https://sphera-studio.vercel.app/?tool=creator', status: 'Available' },
  { id: 'sph_8', name: 'SpheraCut', tagline: 'AI Creative Suite — Video, Image, Story & Audio', icon: '✂️', badge: 'HOT', category: 'Content & Creation (SPHERA Studio)', url: 'https://spheracut.expediteconsults.com/', status: 'Available' },
  { id: 'sph_9', name: 'Creator Studio', tagline: 'Analytics & content management dashboard', icon: '📊', category: 'Content & Creation (SPHERA Studio)', url: 'https://sphera-studio.vercel.app/?tool=creatorstudio', status: 'Available' },
  { id: 'sph_10', name: 'Pulse', tagline: 'Real-time live conversation streams', icon: '⟳', badge: 'LIVE', category: 'Content & Creation (SPHERA Studio)', url: 'https://sphera-studio.vercel.app/?tool=pulse', status: 'Live' },
  { id: 'sph_11', name: 'Spaces', tagline: 'Audio rooms & interactive discussions', icon: '🎙', category: 'Content & Creation (SPHERA Studio)', url: 'https://sphera-studio.vercel.app/?tool=spaces', status: 'Available' },
  { id: 'sph_12', name: 'Go Live', tagline: 'Live streaming to your audience', icon: '🔴', badge: 'LIVE', category: 'Content & Creation (SPHERA Studio)', url: 'https://sphera-studio.vercel.app/?tool=live', status: 'Live' },
  { id: 'sph_13', name: 'Stories', tagline: '24-hour ephemeral content stories', icon: '◎', category: 'Content & Creation (SPHERA Studio)', url: 'https://sphera-studio.vercel.app/?tool=stories', status: 'Available' },

  // 🌍 SOCIAL & COMMUNITY (SPHERA SOCIAL - 9 apps)
  { id: 'sph_14', name: 'Groups', tagline: 'Join & create technical communities', icon: '◈', category: 'Social & Community (SPHERA Social)', url: 'https://sphera-social.vercel.app/?tool=groups', status: 'Available' },
  { id: 'sph_15', name: 'SpheraChat', tagline: 'Real-time encrypted messaging & DMs', icon: '💬', category: 'Social & Community (SPHERA Social)', url: 'https://sphera-social.vercel.app/?tool=messages', status: 'Available' },
  { id: 'sph_16', name: 'Connections', tagline: 'Build your professional network', icon: '🤝', category: 'Social & Community (SPHERA Social)', url: 'https://sphera-social.vercel.app/?tool=network', status: 'Available' },
  { id: 'sph_17', name: 'SpheraMatch', tagline: 'AI-powered people matching & swipe cards', icon: '💫', badge: 'AI', category: 'Social & Community (SPHERA Social)', url: 'https://sphera-social.vercel.app/?tool=linkedup', status: 'Available' },
  { id: 'sph_18', name: 'Nexus', tagline: 'Twitter/X-style global broadcast hub', icon: '🌊', badge: 'NEW', category: 'Social & Community (SPHERA Social)', url: 'https://sphera-social.vercel.app/?tool=nexus', status: 'Available' },
  { id: 'sph_19', name: 'Discover', tagline: 'Explore people, topics & hashtags', icon: '🔍', category: 'Social & Community (SPHERA Social)', url: 'https://sphera-social.vercel.app/?tool=discover', status: 'Available' },
  { id: 'sph_20', name: 'Book Club', tagline: 'Read & discuss tech books together', icon: '📚', category: 'Social & Community (SPHERA Social)', url: 'https://sphera-social.vercel.app/?tool=bookclub', status: 'Available' },
  { id: 'sph_21', name: 'Recipe Hub', tagline: 'Share & discover culinary recipes', icon: '🍽', category: 'Social & Community (SPHERA Social)', url: 'https://sphera-social.vercel.app/?tool=recipehub', status: 'Available' },
  { id: 'sph_22', name: 'Fitness', tagline: 'Workout community & health tracking', icon: '💪', category: 'Social & Community (SPHERA Social)', url: 'https://sphera-social.vercel.app/?tool=fitness', status: 'Available' },

  // 💼 CAREER & PROFESSIONAL (CAREERORBIT - 44 apps)
  { id: 'sph_23', name: 'CareerOrbit', tagline: 'Job search, orbit matching & applications', icon: '🚀', badge: 'HOT', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=careerorbit', status: 'Available' },
  { id: 'sph_24', name: 'Elevate', tagline: 'Learning & skill development courses', icon: '⚡', badge: 'PRO', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=elevate', status: 'Available' },
  { id: 'sph_25', name: 'Orbit Resume', tagline: 'AI resume builder with 4 modern templates', icon: '📋', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=resume', status: 'Available' },
  { id: 'sph_26', name: 'Skill Probe', tagline: 'Skills assessment & expertise testing', icon: '⚡', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=probe', status: 'Available' },
  { id: 'sph_27', name: 'Hire Me Page', tagline: 'Professional landing page for recruiters', icon: '🏆', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=hireme', status: 'Available' },
  { id: 'sph_28', name: 'Career Path Sim', tagline: 'AI career path simulation & projections', icon: '📈', badge: 'AI', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=pathsim', status: 'Available' },
  { id: 'sph_29', name: 'Interview Forge', tagline: 'AI interview practice with live Q&A', icon: '🎤', badge: 'AI', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=forge', status: 'Available' },
  { id: 'sph_30', name: 'Interview Prep', tagline: 'Question generation & prep materials', icon: '🎤', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=interviewprep', status: 'Available' },
  { id: 'sph_31', name: 'Offer Orbit', tagline: 'Compare & negotiate multiple job offers', icon: '💼', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=offers', status: 'Available' },
  { id: 'sph_32', name: 'Fraud Sentinel', tagline: 'AI job posting fraud & scam detection', icon: '🛡️', badge: 'AI', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=fraudsentinel', status: 'Available' },
  { id: 'sph_33', name: 'Resume Score', tagline: 'AI resume scoring & ATS optimization', icon: '⭐', badge: 'AI', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=resumescore', status: 'Available' },
  { id: 'sph_34', name: 'Benefits Decoder', tagline: 'Total offer value calculator & comparison', icon: '💰', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=decoder', status: 'Available' },
  { id: 'sph_35', name: 'Orbit Debrief', tagline: 'Post-interview analysis & structured feedback', icon: '🔍', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=debrief', status: 'Available' },
  { id: 'sph_36', name: 'Orbit Watch', tagline: 'Company watchlist & intelligence tracking', icon: '👁', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=orbitwatch', status: 'Available' },
  { id: 'sph_37', name: 'Proof Orbit', tagline: 'Portfolio & proof-of-work project visualizer', icon: '🗂', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=proof', status: 'Available' },
  { id: 'sph_38', name: 'Interview Log', tagline: 'Interview notes & tracking journal', icon: '📝', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=interviewlog', status: 'Available' },
  { id: 'sph_39', name: 'Referral Engine', tagline: 'Professional referral requests & tracking', icon: '🤝', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=referrals', status: 'Available' },
  { id: 'sph_40', name: 'Relocate Advisor', tagline: 'Relocation cost & city comparison tool', icon: '🗺', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=relocate', status: 'Available' },
  { id: 'sph_41', name: 'Signal Check', tagline: 'Career signal health & visibility score', icon: '🌱', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=signalcheck', status: 'Available' },
  { id: 'sph_42', name: 'Command Center', tagline: 'Central executive career command dashboard', icon: '🚀', badge: 'PRO', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=commandcenter', status: 'Available' },
  { id: 'sph_43', name: 'Orbit Intel', tagline: 'Company & market intelligence reports', icon: '🔭', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=orbitintel', status: 'Available' },
  { id: 'sph_44', name: 'Salary War Room', tagline: 'Salary negotiation analysis & benchmarks', icon: '💵', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=salarywar', status: 'Available' },
  { id: 'sph_45', name: 'Dark Orbit', tagline: 'Hidden job market scanner & lead generator', icon: '🌑', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=darkorbit', status: 'Available' },
  { id: 'sph_46', name: 'Orbit Blind', tagline: 'Anonymous company reviews & ratings', icon: '🙈', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=blind', status: 'Available' },
  { id: 'sph_47', name: 'Team Match', tagline: 'Team compatibility & engineering culture matching', icon: '🤜', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=teammatch', status: 'Available' },
  { id: 'sph_48', name: 'MedOrbit', tagline: 'Healthcare career vertical & licensing tracker', icon: '🏥', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=medorbit', status: 'Available' },
  { id: 'sph_49', name: 'Command Orbit', tagline: 'Military & defense career transition vertical', icon: '🪖', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=commandorbit', status: 'Available' },
  { id: 'sph_50', name: 'Launch Pad', tagline: 'Startup & entrepreneurship career tools', icon: '🚀', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=launchpad', status: 'Available' },
  { id: 'sph_51', name: 'Orbit Score', tagline: 'Gamified professional readiness score', icon: '⚡', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=orbitscore', status: 'Available' },
  { id: 'sph_52', name: 'Mission Sim', tagline: 'Career gamification missions & skill challenges', icon: '🎮', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=missionsim', status: 'Available' },
  { id: 'sph_53', name: 'Orbit Market', tagline: 'Professional services & freelance marketplace', icon: '🏪', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=orbitmarket', status: 'Available' },
  { id: 'sph_54', name: 'Offer Timeline', tagline: 'Offer deadline tracking & decision management', icon: '⏱️', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=offertimeline', status: 'Available' },
  { id: 'sph_55', name: 'Orbit Pulse', tagline: 'Career market pulse & hiring trend analysis', icon: '📡', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=orbitpulse', status: 'Available' },
  { id: 'sph_56', name: 'Skill Gap Radar', tagline: 'Skills gap analysis & upskill roadmap', icon: '🎯', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=radar', status: 'Available' },
  { id: 'sph_57', name: 'Orbit Vault', tagline: 'Secure credential & certification storage', icon: '🔐', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=vault', status: 'Available' },
  { id: 'sph_58', name: 'App Funnel', tagline: 'Application pipeline analytics & interview tracking', icon: '📊', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=funnel', status: 'Available' },
  { id: 'sph_59', name: 'JD Match', tagline: 'Job description matching & fit analysis', icon: '🎯', badge: 'AI', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=jdmatch', status: 'Available' },
  { id: 'sph_60', name: 'CPE Tracker', tagline: 'Continuing education & CISSP/CEH certification tracking', icon: '🎓', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=cpetracker', status: 'Available' },
  { id: 'sph_61', name: 'Negotiation', tagline: 'Salary negotiation scripts & AI coaching', icon: '💬', badge: 'AI', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=negotiation', status: 'Available' },
  { id: 'sph_62', name: 'References', tagline: 'Reference management & request dispatch tracking', icon: '📋', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=references', status: 'Available' },
  { id: 'sph_63', name: 'Comp Builder', tagline: 'Compensation package builder & tax analyzer', icon: '💰', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=compbuilder', status: 'Available' },
  { id: 'sph_64', name: 'Career Timeline', tagline: 'Visual career milestone roadmap', icon: '📅', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=careertimeline', status: 'Available' },
  { id: 'sph_65', name: 'Orbit News', tagline: 'Curated tech career news & salary updates', icon: '📰', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=orbitnews', status: 'Available' },
  { id: 'sph_66', name: 'Orbit Copilot', tagline: 'Floating AI career assistant & resume advisor', icon: '🤖', badge: 'AI', category: 'Career & Professional (CareerOrbit)', url: 'https://careerorbit-standalone.vercel.app/?tool=copilot', status: 'Available' },

  // 🛍️ MARKETPLACE & SERVICES (BAZAAR - 5 apps)
  { id: 'sph_67', name: 'BAZAAR Marketplace', tagline: 'Standalone marketplace with 37+ products & full checkout', icon: '✦', badge: 'LIVE', category: 'Marketplace & Services (BAZAAR)', url: 'https://bazaar-standalone.vercel.app/', status: 'Live' },
  { id: 'sph_68', name: 'BAZAAR Eats', tagline: 'DC/MD/VA restaurant delivery with ZIP lookup', icon: '🍽', badge: 'NEW', category: 'Marketplace & Services (BAZAAR)', url: 'https://bazaar-standalone.vercel.app/', status: 'Available' },
  { id: 'sph_69', name: 'eBay Seller Portal', tagline: 'Cross-list & manage eBay inventory automatically', icon: '📦', category: 'Marketplace & Services (BAZAAR)', url: 'https://sphera-backend-alpha.vercel.app/docs#/eBay%20Marketplace', status: 'Available' },
  { id: 'sph_70', name: 'Sphera Pay', tagline: 'Multi-currency payments & digital wallet', icon: '💳', badge: 'LIVE', category: 'Marketplace & Services (BAZAAR)', url: 'https://sphera.expediteconsults.com/?tab=spherapay', status: 'Live' },
  { id: 'sph_71', name: 'Local', tagline: 'Nearby tech hubs & regional meetups', icon: '📍', category: 'Marketplace & Services (BAZAAR)', url: 'https://sphera.expediteconsults.com/?tab=local', status: 'Available' },

  // 🎉 EVENTS & TIME (2 apps)
  { id: 'sph_72', name: 'Events', tagline: 'Discover & host technical webinars & events', icon: '📅', category: 'Events & Time', url: 'https://sphera.expediteconsults.com/?tab=events', status: 'Available' },
  { id: 'sph_73', name: 'Time Capsule', tagline: 'Save career achievements & memories for the future', icon: '⧗', badge: 'NEW', category: 'Events & Time', url: 'https://sphera.expediteconsults.com/?tab=timecapsule', status: 'Available' },

  // 🤖 AI & MEDIA INTELLIGENCE (10 apps)
  { id: 'sph_74', name: 'VeritasLens Platform', tagline: 'Bloomberg Terminal for Media Credibility & Fact Verification', icon: '🌐', badge: 'HOT', category: 'AI & Media Intelligence', url: 'https://expedite-consults.vercel.app/veritaslens', status: 'Available' },
  { id: 'sph_75', name: 'Blindspot Radar', tagline: 'Asymmetric partisan coverage & 1-click unspun wire facts', icon: '👁️', badge: 'FLAGSHIP', category: 'AI & Media Intelligence', url: 'https://expedite-consults.vercel.app/veritaslens', status: 'Available' },
  { id: 'sph_76', name: 'BERT Claim Classifier', tagline: 'Sentence verification, DeBERTa inference & MLOps drift', icon: '🧠', category: 'AI & Media Intelligence', url: 'https://expedite-consults.vercel.app/veritaslens', status: 'Available' },
  { id: 'sph_77', name: 'VeritasGraph Lineage', tagline: 'OpenLineage provenance graph & XAI confidence weights', icon: '🕸️', category: 'AI & Media Intelligence', url: 'https://expedite-consults.vercel.app/veritaslens', status: 'Available' },
  { id: 'sph_78', name: '7-Day TV Scorecard', tagline: 'Network credibility deductions & headline spin deconstructor', icon: '📺', category: 'AI & Media Intelligence', url: 'https://expedite-consults.vercel.app/veritaslens', status: 'Available' },
  { id: 'sph_79', name: 'B2B Brand Safety', tagline: 'Programmatic ad blocklists (JSON/CSV) & Slack webhooks', icon: '🛡️', category: 'AI & Media Intelligence', url: 'https://expedite-consults.vercel.app/veritaslens', status: 'Available' },
  { id: 'sph_80', name: 'AI Match 2.0', tagline: 'Smart people & content matching engine', icon: '🤖', badge: 'AI', category: 'AI & Media Intelligence', url: 'https://sphera-social.vercel.app/?tool=discover', status: 'Available' },
  { id: 'sph_81', name: 'AI News Anchor', tagline: 'AI-generated executive news broadcasts', icon: '📡', badge: 'AI', category: 'AI & Media Intelligence', url: 'https://sphera.expediteconsults.com/?tab=feed', status: 'Available' },
  { id: 'sph_82', name: 'Video Creator AI', tagline: 'Generate architecture videos with AI prompts', icon: '🎞️', badge: 'AI', category: 'AI & Media Intelligence', url: 'https://sphera-studio.vercel.app/?tool=videocreator', status: 'Available' },
  { id: 'sph_83', name: 'SpheraReel AI', tagline: 'Auto-generated short viral tech reels', icon: '🎬', badge: 'COMING', category: 'AI & Media Intelligence', url: 'https://sphera-studio.vercel.app/', status: 'Coming Soon' },

  // 🛡️ SECURITY & THREAT INTELLIGENCE (54 apps)
  { id: 'sph_84', name: 'Expedite Strike & Fusion', tagline: 'Autonomous Pentest & ASPM Platform — Expedite Fusion™ Hybrid Scanning', icon: '⚡', badge: 'PORT 9012', category: 'Security & Threat Intelligence', url: 'http://localhost:9012/', status: 'Available' },
  { id: 'sph_85', name: 'ÆGIS · SOC PenTest', tagline: 'Autonomous AI PenTest console, asset discovery, PoC terminal & Neo4j attack graphs', icon: '🎯', badge: 'PORT 9011', category: 'Security & Threat Intelligence', url: 'http://localhost:9011/app/?standalone=1', status: 'Available' },
  { id: 'sph_86', name: 'Expedite Fusion™ Engine', tagline: 'Deterministic Rules + Frontier AI Reasoning. 70% fewer false positives', icon: '✨', category: 'Security & Threat Intelligence', url: 'http://localhost:9012/', status: 'Available' },
  { id: 'sph_87', name: 'Checkmarx / Strike MCP Server', tagline: 'Model Context Protocol connection providing IDE assistants with enterprise context', icon: '🔌', category: 'Security & Threat Intelligence', url: 'http://localhost:9012/', status: 'Available' },
  { id: 'sph_88', name: 'AI-BOM & LLM Scanner', tagline: 'AI Supply Chain Security — Tracks AI models, fine-tuning datasets, agent swarms', icon: '🧠', category: 'Security & Threat Intelligence', url: 'http://localhost:9012/', status: 'Available' },
  { id: 'sph_89', name: 'Triage & Auto-PR Assist', tagline: 'Autonomous agents that verify exploitability and generate review-ready fix PRs', icon: '🤖', category: 'Security & Threat Intelligence', url: 'http://localhost:9012/', status: 'Available' },
  { id: 'sph_90', name: 'Unified Integration Layer', tagline: 'Product 3 · Cross-Platform Ecosystem Hub — Enterprise orchestration with 24.5k evt/s', icon: '🌐', badge: 'LIVE', category: 'Security & Threat Intelligence', url: 'https://18-unified-integration-layer.vercel.app/', status: 'Live' },
  { id: 'sph_91', name: 'AXIOM DAST', tagline: 'Dynamic Application Security Testing Platform with OWASP Top 10 fuzzing', icon: '⚡', badge: 'LIVE', category: 'Security & Threat Intelligence', url: 'https://11-dast-security-platform.vercel.app/', status: 'Live' },
  { id: 'sph_92', name: 'Aegis Recovery', tagline: 'Product 2 · Ransomware Recovery & Resilience (78 Studios)', icon: '🛡️', badge: 'LIVE', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/', status: 'Live' },
  { id: 'sph_93', name: 'Expedite Consults HQ', tagline: 'Cybersecurity Solutions You Can Trust — Zero Trust & Risk Management', icon: '🛡️', badge: 'LIVE', category: 'Security & Threat Intelligence', url: 'https://expedite-consults.vercel.app/', status: 'Live' },
  { id: 'sph_94', name: 'CERBERUS-RE', tagline: 'Product 1 · Autonomous Malware Intelligence (62 Studios)', icon: '🦠', badge: 'LIVE', category: 'Security & Threat Intelligence', url: 'https://16-malware-analysis-platform.vercel.app/', status: 'Live' },
  { id: 'sph_95', name: 'AXIOM Cloud Security', tagline: 'Product 4 · Multi-cloud attack path analysis, IAM privesc & pentest', icon: '☁️', category: 'Security & Threat Intelligence', url: 'https://19-cloud-security-platform.vercel.app/', status: 'Available' },
  { id: 'sph_96', name: 'Multi-Cloud Attack Paths', tagline: 'Chained exploit paths across AWS STS, Azure RBAC & GCP IAM', icon: '🕸️', badge: 'FLAGSHIP', category: 'Security & Threat Intelligence', url: 'https://19-cloud-security-platform.vercel.app/attack-paths', status: 'Available' },
  { id: 'sph_97', name: 'IAM Privilege Escalation', tagline: '28+ Cloud IAM privesc paths (PassRole, AssumeRole, actAs)', icon: '🔑', category: 'Security & Threat Intelligence', url: 'https://19-cloud-security-platform.vercel.app/iam-analyzer', status: 'Available' },
  { id: 'sph_98', name: 'Cloud PenTest Drills', tagline: 'Safe authorized exploit verification across AWS, Azure & GCP', icon: '⚡', category: 'Security & Threat Intelligence', url: 'https://19-cloud-security-platform.vercel.app/pentest', status: 'Available' },
  { id: 'sph_99', name: 'Multi-Cloud CSPM Engine', tagline: 'CIS AWS/Azure/GCP v3.0, NIST 800-53 & auto-remediation', icon: '🛡️', category: 'Security & Threat Intelligence', url: 'https://19-cloud-security-platform.vercel.app/cspm', status: 'Available' },
  { id: 'sph_100', name: 'Kubernetes Cloud Security', tagline: 'EKS, AKS & GKE pod escape & cloud IAM role protection', icon: '📦', category: 'Security & Threat Intelligence', url: 'https://19-cloud-security-platform.vercel.app/kubernetes', status: 'Available' },
  { id: 'sph_101', name: 'GPU Analytics & RAPIDS cuDF', tagline: '10,000 CUDA worker threads scanning parallel file blocks in < 12ms', icon: '⚡', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/gpu-analytics', status: 'Available' },
  { id: 'sph_102', name: 'Adaptive Dynamic Baselining', tagline: 'Gaussian 3-sigma (μ+3σ) role-based device profiles & time windows', icon: '📊', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/adaptive-baselining', status: 'Available' },
  { id: 'sph_103', name: 'Multi-Stage 6-Signal Scoring', tagline: '6-tier false-positive elimination with FPR < 1.2% & Precision 98.6%', icon: '🎯', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/multi-stage-scoring', status: 'Available' },
  { id: 'sph_104', name: 'Zero-Loss Safe Recovery', tagline: '5-Step non-destructive pipeline with application render verification', icon: '🛡️', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/zero-loss-workflow', status: 'Available' },
  { id: 'sph_105', name: 'Synthetic Attack Lab', tagline: '5 Safe non-destructive behavioral attack simulations & SLA bench', icon: '🧪', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/synthetic-attack-lab', status: 'Available' },
  { id: 'sph_106', name: 'Exposure Digital Twin', tagline: '6-layer ransomware cascade failure & blast radius modeler', icon: '🕸️', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/exposure-digital-twin', status: 'Available' },
  { id: 'sph_107', name: 'eBPF Syscall Freeze & Key Rescue', tagline: 'Sub-millisecond thread pre-emption & RAM key carving', icon: '⚡', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/ebpf-freeze', status: 'Available' },
  { id: 'sph_108', name: 'AD Forest Recovery (AD-FDR)', tagline: 'Clean DC factory & automated KRBTGT double-roll sequencer', icon: '🌳', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/ad-forest-recovery', status: 'Available' },
  { id: 'sph_109', name: 'Attack Progression Model', tagline: '8-stage kill chain tracking & pre-encryption countdown', icon: '⏱️', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/attack-progression', status: 'Available' },
  { id: 'sph_110', name: 'Cryptanalytic Bridge', tagline: 'CERBERUS-RE to Aegis live decryptor auto-compiler & dispatcher', icon: '🔗', category: 'Security & Threat Intelligence', url: 'https://17-ransomware-recovery-platform.vercel.app/cryptanalytic-bridge', status: 'Available' },
  { id: 'sph_111', name: 'Cross-Platform SOAR Engine', tagline: 'Multi-product closed-loop automated playbooks & workflow DAG', icon: '🤖', category: 'Security & Threat Intelligence', url: 'https://18-unified-integration-layer.vercel.app/cross-platform-playbooks', status: 'Available' },
  { id: 'sph_112', name: 'Federated Telemetry Bus', tagline: 'Real-time streaming gRPC/Kafka telemetry (24,500 evt/sec)', icon: '📡', category: 'Security & Threat Intelligence', url: 'https://18-unified-integration-layer.vercel.app/federated-telemetry', status: 'Available' },
  { id: 'sph_113', name: 'Enterprise Threat Intel Hub', tagline: 'Bi-directional STIX 2.1 / TAXII 2.1 IOC & threat actor sync', icon: '🛡️', category: 'Security & Threat Intelligence', url: 'https://18-unified-integration-layer.vercel.app/shared-threat-intel', status: 'Available' },
  { id: 'sph_114', name: 'Aegis Security SOC', tagline: 'Real-time SIEM defense cockpit & ClickHouse/Kafka threat streams', icon: '⚡', badge: 'LIVE', category: 'Security & Threat Intelligence', url: 'https://expedite-strike.onrender.com/app/', status: 'Live' },
  { id: 'sph_115', name: 'Expedite Strike Engine', tagline: 'Autonomous pentesting engine dashboard and execution control', icon: '⚡', badge: 'LIVE', category: 'Security & Threat Intelligence', url: 'https://expedite-strike.onrender.com/xstrike/', status: 'Live' },
  { id: 'sph_116', name: 'AI/LLM Security Sandbox', tagline: 'Meta Llama Guard 3 & NeMo guardrail defense evaluator', icon: '🧠', badge: 'AI', category: 'Security & Threat Intelligence', url: 'https://14-exploitability-platform.vercel.app/ai-security', status: 'Available' },
  { id: 'sph_117', name: 'AI Red Teaming', tagline: 'Autonomous adversary agent emulator & MITRE ATT&CK simulator', icon: '🎯', badge: 'AI', category: 'Security & Threat Intelligence', url: 'https://14-exploitability-platform.vercel.app/ai-redteam', status: 'Available' },
  { id: 'sph_118', name: 'Multi-Agent Swarm', tagline: 'Decentralized ReAct consensus engine & autonomic software repair', icon: '🤖', category: 'Security & Threat Intelligence', url: 'https://14-exploitability-platform.vercel.app/agent-swarm', status: 'Available' },
  { id: 'sph_119', name: 'Attack Chain Visualizer', tagline: 'PyTorch GNN GraphSAGE & Neo4j blast radius visualizer', icon: '🔗', category: 'Security & Threat Intelligence', url: 'https://15-threat-modeling-platform.vercel.app/attack-chain', status: 'Available' },
  { id: 'sph_120', name: 'SOC2 STRIDE Modeler', tagline: 'LLM-synthesized threat modeling & SOC2/ISO 27001 export', icon: '🛡️', category: 'Security & Threat Intelligence', url: 'https://15-threat-modeling-platform.vercel.app/threat-model', status: 'Available' },
  { id: 'sph_121', name: 'AXIOM Exploitability', tagline: 'Controlled exploit validation & live cross-app telemetry broadcast', icon: '⚡', badge: 'LIVE', category: 'Security & Threat Intelligence', url: 'https://14-exploitability-platform.vercel.app/exploit', status: 'Live' },
  { id: 'sph_122', name: '05-SAST Platform', tagline: 'DeepSeek-Coder source code vulnerability analyzer', icon: '🛡️', category: 'Security & Threat Intelligence', url: 'https://05-sast-platform.vercel.app/', status: 'Available' },
  { id: 'sph_123', name: '06-SCA Platform', tagline: 'Software Composition Analysis dependency scanning', icon: '📦', category: 'Security & Threat Intelligence', url: 'https://06-sca-platform.vercel.app/', status: 'Available' },
  { id: 'sph_124', name: '07-Secrets Platform', tagline: 'Audit credentials, certificates, and leaked keys', icon: '🔑', category: 'Security & Threat Intelligence', url: 'https://07-secrets-platform.vercel.app/', status: 'Available' },
  { id: 'sph_125', name: '08-Container Security', tagline: 'Docker container and base image vulnerability checks', icon: '🐳', category: 'Security & Threat Intelligence', url: 'https://08-container-security-platform.vercel.app/', status: 'Available' },
  { id: 'sph_126', name: '09-Kubernetes Security', tagline: 'K8s cluster runtime and manifest configuration checks', icon: '☸️', category: 'Security & Threat Intelligence', url: 'https://09-k8s-security-platform.vercel.app/', status: 'Available' },
  { id: 'sph_127', name: '10-IaC Security', tagline: 'Infrastructure-as-Code Terraform policy checks', icon: '🏗️', category: 'Security & Threat Intelligence', url: 'https://10-iac-security-platform.vercel.app/', status: 'Available' },
  { id: 'sph_128', name: '12-API Security', tagline: 'REST/GraphQL API schema fuzzing and validation checks', icon: '📡', category: 'Security & Threat Intelligence', url: 'https://12-api-security-platform.vercel.app/', status: 'Available' },
  { id: 'sph_129', name: '13-Mobile Security', tagline: 'iOS and Android client security verification audits', icon: '📱', category: 'Security & Threat Intelligence', url: 'https://13-mobile-security-platform.vercel.app/', status: 'Available' },
  { id: 'sph_130', name: '14-Exploitability Hub', tagline: 'Exploitation probability & weaponization validation', icon: '⚡', category: 'Security & Threat Intelligence', url: 'https://14-exploitability-platform.vercel.app/', status: 'Available' },
  { id: 'sph_131', name: '15-Threat Modeler', tagline: 'Automated architecture threat analysis & STRIDE mapping', icon: '🗺️', category: 'Security & Threat Intelligence', url: 'https://15-threat-modeling-platform.vercel.app/', status: 'Available' }
]

export const marketplaceProductsData = flagshipProductsData

