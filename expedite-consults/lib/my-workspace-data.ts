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
  category: 'Security' | 'Cloud' | 'AI' | 'Systems' | 'Compliance'
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
  type: 'Whitepaper' | 'Technical Report' | 'CVE Advisory' | 'Research Paper'
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
  reviewType: 'Architecture Review' | 'Security Review' | 'Code Review' | 'Product Review'
  comment: string
}

export interface VendorProductItem {
  id: string
  name: string
  category: 'Software' | 'Training' | 'Services' | 'Enterprise Solutions'
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
    reviewerName: 'Dr. Elena Rostova',
    reviewerRole: 'Chief AI Safety Scientist @ Stanford',
    reviewerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    rating: 5.0,
    date: '2 weeks ago',
    reviewType: 'Architecture Review',
    comment: 'Alex demonstrated unparalleled mastery in cryptographic perimeter isolation. His microVM sandbox architecture was flawlessly designed.'
  },
  {
    reviewerName: 'Marcus Vance',
    reviewerRole: 'VP of Engineering @ CloudScale Global',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 4.96,
    date: '1 month ago',
    reviewType: 'Security Review',
    comment: 'Alex conducted a thorough, authoritative zero-trust validation for our Kubernetes cluster. The findings saved us months of remediation.'
  }
]

export const MY_PRODUCTS_DATA: VendorProductItem[] = [
  {
    id: 'prod_axiom',
    name: 'AXIOM AI-Powered Cyber Suite',
    category: 'Software',
    icon: '🛡️',
    pricingModel: 'Monthly SaaS',
    price: '$499 / mo',
    activeLicensesCount: 142,
    activeTrialsCount: 18,
    mrrOrRevenue: '$70,858 / mo MRR',
    rating: 4.98,
    reviewsCount: 142,
    status: 'Active Listing',
    leadsCount: 38
  },
  {
    id: 'prod_strike',
    name: 'Expedite Strike & Fusion 2026',
    category: 'Enterprise Solutions',
    icon: '⚡',
    pricingModel: 'Tiered License',
    price: '$499 / mo',
    activeLicensesCount: 68,
    activeTrialsCount: 24,
    mrrOrRevenue: '$33,932 / mo MRR',
    rating: 4.96,
    reviewsCount: 89,
    status: 'Active Listing',
    leadsCount: 52
  },
  {
    id: 'prod_zt_masterclass',
    name: 'Zero Trust Cloud Architecture Masterclass',
    category: 'Training',
    icon: '🎓',
    pricingModel: 'One-time Purchase',
    price: '$199 one-time',
    activeLicensesCount: 420,
    activeTrialsCount: 0,
    mrrOrRevenue: '$83,580 Total Gross',
    rating: 4.98,
    reviewsCount: 142,
    status: 'Active Listing',
    leadsCount: 110
  },
  {
    id: 'prod_ciso_retainer',
    name: 'Fractional CISO & Architecture Advisory Retainer',
    category: 'Services',
    icon: '👔',
    pricingModel: 'Monthly Retainer',
    price: '$4,500 / mo',
    activeLicensesCount: 4,
    activeTrialsCount: 2,
    mrrOrRevenue: '$18,000 / mo MRR',
    rating: 5.0,
    reviewsCount: 12,
    status: 'Active Listing',
    leadsCount: 7
  }
]
