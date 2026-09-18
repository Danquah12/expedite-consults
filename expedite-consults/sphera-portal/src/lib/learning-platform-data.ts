export interface LearningCourse {
  id: string
  title: string
  category: 'Cybersecurity' | 'AI' | 'Cloud' | 'Programming' | 'Business'
  provider: "O'Reilly" | "ConnectIn Masterclass" | "Coursera" | "Udemy" | "AWS Training"
  instructor: {
    name: string
    role: string
    avatar: string
  }
  rating: number
  reviewsCount: number
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  coverImage: string
  summary: string
  curriculumModules: string[]
  isEnrolled?: boolean
  progressPercent?: number
  hasCertificate: boolean
  recommendedMarketplaceTools: {
    id: string
    name: string
    icon: string
    tagline: string
    category: string
    price: string
    actionText: string
  }[]
}

export interface InteractiveLab {
  id: string
  title: string
  category: 'Cloud labs' | 'Pentesting labs' | 'Malware analysis' | 'Secure coding'
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  estimatedDuration: string
  environment: 'AWS MicroVM Sandbox' | 'Kali Linux Enclave' | 'Isolated Firecracker VM' | 'Live IDE Terminal'
  summary: string
  learningObjectives: string[]
  recommendedMarketplaceTools: {
    name: string
    icon: string
    tagline: string
    actionText: string
  }[]
  isLiveSandboxReady: boolean
}

export interface CertificationTrack {
  id: string
  name: string
  issuingBody: 'ISC2' | 'AWS' | 'OffSec' | 'ISACA' | 'CompTIA'
  badgeIcon: string
  examCode: string
  questionsCount: number
  passingScore: string
  medianSalaryUnlock: string
  overview: string
  domains: { name: string; weight: string }[]
  practiceExamReady: boolean
  recommendedMarketplaceTools: {
    name: string
    icon: string
    tagline: string
    actionText: string
  }[]
}

export interface CareerLearningPath {
  id: string
  title: string
  targetRole: string
  estimatedCompletion: string
  salaryTarget: string
  heroBanner: string
  description: string
  steps: {
    stepNumber: number
    title: string
    skills: string[]
    duration: string
    status: 'Completed' | 'In Progress' | 'Up Next'
    recommendedTool?: {
      name: string
      icon: string
      actionText: string
    }
  }[]
  recommendedMarketplaceTools: {
    id: string
    name: string
    icon: string
    tagline: string
    price: string
    actionText: string
  }[]
}

export const LEARNING_COURSES_DATA: LearningCourse[] = [
  {
    id: 'crs_zt_arch',
    title: 'Zero Trust Cloud Architecture & NIST SP 800-207 Defense',
    category: 'Cybersecurity',
    provider: 'ConnectIn Masterclass',
    instructor: {
      name: 'Alex Taylor',
      role: 'Principal Cloud & Security Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    rating: 4.98,
    reviewsCount: 1420,
    duration: '14 hours (Self-Paced)',
    level: 'Advanced',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    summary: 'Master enterprise zero-trust implementation: identity-centric perimeters, eBPF micro-segmentation, continuous authentication, and automated ATO pipelines.',
    curriculumModules: [
      '1. Deconstructing the Castle-and-Moat Architecture',
      '2. NIST SP 800-207 & CISA Zero Trust Maturity Model v2.0',
      '3. Policy Enforcement Points (PEP) & Policy Decision Points (PDP)',
      '4. Micro-Segmentation with Cilium eBPF and WireGuard Mesh',
      '5. Hands-on Zero Trust Sandbox Deployment'
    ],
    hasCertificate: true,
    isEnrolled: true,
    progressPercent: 65,
    recommendedMarketplaceTools: [
      {
        id: 'axiom-cyber-suite',
        name: 'AXIOM AI-Powered Cyber Suite',
        icon: '🛡️',
        tagline: 'Autonomous zero-trust verification and threat surface mapping.',
        category: 'Software',
        price: '$499/mo',
        actionText: '14-Day Free Trial'
      },
      {
        id: 'sphera-app-12',
        name: 'Sphera Zero-Trust Analyzer',
        icon: '🔒',
        tagline: 'Automated policy validator for microservice network topologies.',
        category: 'Micro-App',
        price: 'Included',
        actionText: 'Launch App'
      }
    ]
  },
  {
    id: 'crs_ai_guardrails',
    title: 'LLM Agent Safety, MCP Nonce Security & Guardrails Engineering',
    category: 'AI',
    provider: "O'Reilly",
    instructor: {
      name: 'Dr. Elena Rostova',
      role: 'Chief AI Safety Scientist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
    },
    rating: 5.0,
    reviewsCount: 890,
    duration: '10 hours',
    level: 'Advanced',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    summary: 'Implement formal verification boundaries, prompt injection containment, and cryptographically verified Model Context Protocol (MCP) server gateways.',
    curriculumModules: [
      '1. Anatomy of Direct and Indirect Prompt Injections',
      '2. Tool Bindings Vulnerability: The Arbitrary Invocation Attack',
      '3. Enforcing WebAssembly Cryptographic Nonces in MCP Gateways',
      '4. Real-time AI-BOM Token Scanning in Production Pipelines'
    ],
    hasCertificate: true,
    recommendedMarketplaceTools: [
      {
        id: 'veritaslens-platform',
        name: 'VeritasLens Media Intelligence',
        icon: '🌐',
        tagline: 'Real-time NLP bias clustering and fact validation.',
        category: 'Software',
        price: '$349/mo',
        actionText: 'Free Trial'
      }
    ]
  },
  {
    id: 'crs_rust_syssec',
    title: 'Rust for High-Performance Systems Security & Firecracker MicroVMs',
    category: 'Programming',
    provider: "ConnectIn Masterclass",
    instructor: {
      name: 'David Sterling',
      role: 'Principal Offensive Red Team Lead',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80'
    },
    rating: 4.96,
    reviewsCount: 650,
    duration: '18 hours',
    level: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    summary: 'Write memory-safe low-level network proxies, eBPF kernel probes, and ephemeral microVM hypervisors with zero undefined behavior.',
    curriculumModules: [
      '1. Memory Safety and Ownership Guarantees in Security Engineering',
      '2. Writing eBPF Probes in Aya & Rust',
      '3. Orchestrating Ephemeral Firecracker MicroVMs for Exploit Sandboxes',
      '4. Building High-Throughput Packet Inspection Engines'
    ],
    hasCertificate: true,
    recommendedMarketplaceTools: [
      {
        id: 'aegis-pentest-hub',
        name: 'ÆGIS SOC Autonomous PenTest Hub',
        icon: '⚡',
        tagline: 'Rust-accelerated attack chain execution engine.',
        category: 'Software',
        price: '$899/mo',
        actionText: 'Request Demo'
      }
    ]
  }
]

export const INTERACTIVE_LABS_DATA: InteractiveLab[] = [
  {
    id: 'lab_1',
    title: 'Multi-Region AWS EKS Cilium mTLS Mesh Breach Simulation',
    category: 'Cloud labs',
    difficulty: 'Advanced',
    estimatedDuration: '45 mins',
    environment: 'AWS MicroVM Sandbox',
    summary: 'Simulate a pod breakout attack, detect lateral movement via eBPF kernel events, and deploy micro-segmentation policies in real time.',
    learningObjectives: [
      'Inject rogue traffic into Kubernetes cluster',
      'Observe eBPF telemetry bypassing traditional iptables',
      'Enforce zero-trust network policies via Cilium ClusterMesh'
    ],
    recommendedMarketplaceTools: [
      {
        name: 'Expedite Strike & Fusion 2026',
        icon: '⚡',
        tagline: 'Offensive AppSec and hybrid attack graph simulator.',
        actionText: '14-Day Free Trial'
      }
    ],
    isLiveSandboxReady: true
  },
  {
    id: 'lab_2',
    title: 'Autonomous Exploit Validation & Auto-PR Triage Challenge',
    category: 'Pentesting labs',
    difficulty: 'Expert',
    estimatedDuration: '60 mins',
    environment: 'Kali Linux Enclave',
    summary: 'Execute authenticated penetration testing against 5 benchmark microservices and generate automated fix pull requests with passing tests.',
    learningObjectives: [
      'Identify unauthenticated RCE vulnerabilities',
      'Construct automated weaponized exploit proof-of-concept',
      'Integrate Checkmarx MCP auto-PR generator to dispatch code patch'
    ],
    recommendedMarketplaceTools: [
      {
        name: 'AXIOM AI-Powered Cyber Suite',
        icon: '🛡️',
        tagline: 'Autonomous red teaming and false positive elimination.',
        actionText: 'Launch Sandbox'
      }
    ],
    isLiveSandboxReady: true
  },
  {
    id: 'lab_3',
    title: 'Model Context Protocol (MCP) Prompt Injection Containment',
    category: 'Secure coding',
    difficulty: 'Intermediate',
    estimatedDuration: '30 mins',
    environment: 'Live IDE Terminal',
    summary: 'Harden an open MCP server against zero-width unicode prompt injection payloads using cryptographic nonce parameter validation.',
    learningObjectives: [
      'Analyze unsanitized LLM tool execution payload',
      'Implement Ed25519 token signature verification in TypeScript/Rust',
      'Verify automated rejection of replayed nonces'
    ],
    recommendedMarketplaceTools: [
      {
        name: 'Sphera Micro-Apps #45 (AI-BOM Scanner)',
        icon: '🤖',
        tagline: 'Token-level guardrail scanner for agentic pipelines.',
        actionText: 'Try Micro-App'
      }
    ],
    isLiveSandboxReady: true
  }
]

export const CERTIFICATION_TRACKS_DATA: CertificationTrack[] = [
  {
    id: 'cert_cissp',
    name: 'CISSP: Certified Information Systems Security Professional',
    issuingBody: 'ISC2',
    badgeIcon: '🏆',
    examCode: 'ISC2-CISSP-2026',
    questionsCount: 150,
    passingScore: '700 / 1000',
    medianSalaryUnlock: '$178,000 / yr',
    overview: 'The gold standard in enterprise cybersecurity leadership, architecture, and governance.',
    domains: [
      { name: 'Security and Risk Management', weight: '15%' },
      { name: 'Asset Security', weight: '10%' },
      { name: 'Security Architecture and Engineering', weight: '13%' },
      { name: 'Communication and Network Security', weight: '13%' },
      { name: 'Identity and Access Management (IAM)', weight: '13%' },
      { name: 'Security Assessment and Testing', weight: '12%' },
      { name: 'Security Operations', weight: '13%' },
      { name: 'Software Development Security', weight: '11%' }
    ],
    practiceExamReady: true,
    recommendedMarketplaceTools: [
      {
        name: 'Fractional CISO Transformation Retainer',
        icon: '👔',
        tagline: 'Executive security leadership and board governance.',
        actionText: 'View Retainers'
      }
    ]
  },
  {
    id: 'cert_aws_sec',
    name: 'AWS Certified Security - Specialty (SCS-C02)',
    issuingBody: 'AWS',
    badgeIcon: '☁️',
    examCode: 'AWS-SCS-C02',
    questionsCount: 65,
    passingScore: '750 / 1000',
    medianSalaryUnlock: '$192,000 / yr',
    overview: 'Validates expertise in securing AWS multi-account landing zones, encryption, and automated incident response.',
    domains: [
      { name: 'Threat Detection and Incident Response', weight: '14%' },
      { name: 'Security Logging and Monitoring', weight: '18%' },
      { name: 'Infrastructure Security', weight: '20%' },
      { name: 'Identity and Access Management', weight: '16%' },
      { name: 'Data Protection (KMS & Encryption)', weight: '18%' },
      { name: 'Management and Security Governance', weight: '14%' }
    ],
    practiceExamReady: true,
    recommendedMarketplaceTools: [
      {
        name: 'AXIOM Cloud Defense Suite',
        icon: '🛡️',
        tagline: 'Automated CSPM and identity threat detection on AWS.',
        actionText: '14-Day Free Trial'
      }
    ]
  },
  {
    id: 'cert_oscp',
    name: 'OSCP: Offensive Security Certified Professional',
    issuingBody: 'OffSec',
    badgeIcon: '🎯',
    examCode: 'PEN-200',
    questionsCount: 5,
    passingScore: '70 / 100 Points',
    medianSalaryUnlock: '$185,000 / yr',
    overview: 'The hands-on benchmark for technical penetration testing and exploit development.',
    domains: [
      { name: 'Information Gathering & Recon', weight: '20%' },
      { name: 'Vulnerability Assessment', weight: '20%' },
      { name: 'Web Application Attacks', weight: '20%' },
      { name: 'Client-Side Attacks & Buffer Overflows', weight: '20%' },
      { name: 'Active Directory Attacks & Pivoting', weight: '20%' }
    ],
    practiceExamReady: true,
    recommendedMarketplaceTools: [
      {
        name: 'Expedite Strike & Fusion 2026',
        icon: '⚡',
        tagline: 'Autonomous offensive validation and exploit sandboxing.',
        actionText: 'Try Strike Suite'
      }
    ]
  }
]

export const CLOUD_SECURITY_LEARNING_PATH: CareerLearningPath = {
  id: 'path_cloud_security_engineer',
  title: 'Become a Cloud Security Engineer',
  targetRole: 'Senior / Staff Cloud Security Engineer',
  estimatedCompletion: '12 Weeks (8 hrs/week)',
  salaryTarget: '$175K - $245K Median TC',
  heroBanner: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
  description: 'The definitive multi-stage curriculum taking you from fundamental networking and Linux systems to enterprise AWS architecture, IAM least-privilege, Terraform automation, and live capstone security assessment.',
  steps: [
    {
      stepNumber: 1,
      title: 'Networking & Traffic Fundamentals',
      skills: ['TCP/IP', 'CIDR Blocks', 'Subnets', 'VPC Peering', 'DNS', 'mTLS'],
      duration: 'Week 1-2',
      status: 'Completed'
    },
    {
      stepNumber: 2,
      title: 'Linux Systems & Kernel Fundamentals',
      skills: ['systemd', 'cgroups', 'Namespaces', 'Kernel Modules', 'eBPF Basics'],
      duration: 'Week 2-3',
      status: 'Completed'
    },
    {
      stepNumber: 3,
      title: 'AWS Core & Cloud Infrastructure',
      skills: ['AWS Organizations', 'VPC Endpoints', 'Security Groups', 'EC2 & EKS', 'GovCloud'],
      duration: 'Week 3-4',
      status: 'In Progress'
    },
    {
      stepNumber: 4,
      title: 'Identity & Access Management (IAM)',
      skills: ['RBAC', 'ABAC', 'OIDC Identity Providers', 'KMS Key Policies', 'SCP Guardrails'],
      duration: 'Week 5-6',
      status: 'Up Next'
    },
    {
      stepNumber: 5,
      title: 'Cloud Security & Threat Detection',
      skills: ['AWS GuardDuty', 'Security Hub', 'CloudTrail Telemetry', 'CSPM', 'Zero Trust'],
      duration: 'Week 7-8',
      status: 'Up Next',
      recommendedTool: {
        name: 'AXIOM AI-Powered Cyber Suite',
        icon: '🛡️',
        actionText: 'Try 14-Day Sandbox'
      }
    },
    {
      stepNumber: 6,
      title: 'Infrastructure as Code (Terraform & OpenTofu)',
      skills: ['Terraform Modules', 'Checkov', 'Tfsec', 'Policy as Code (OPA Sentinel)'],
      duration: 'Week 9',
      status: 'Up Next'
    },
    {
      stepNumber: 7,
      title: 'DevSecOps & Automated CI/CD Pipelines',
      skills: ['GitHub Actions', 'Trivy Container Scanning', 'Checkmarx MCP Server', 'Auto-PRs'],
      duration: 'Week 10',
      status: 'Up Next',
      recommendedTool: {
        name: 'Expedite Strike & Fusion 2026',
        icon: '⚡',
        actionText: 'Explore Tool'
      }
    },
    {
      stepNumber: 8,
      title: 'Security Assessment & Threat Modeling',
      skills: ['STRIDE Threat Modeling', 'Autonomous Exploit Verification', 'Blast Radius Graphing'],
      duration: 'Week 11',
      status: 'Up Next'
    },
    {
      stepNumber: 9,
      title: 'Capstone: Multi-Cloud Zero Trust Defense Mesh',
      skills: ['Full Production Deployment', 'Automated ATO Dossier Generation', 'Peer Review Defense'],
      duration: 'Week 12',
      status: 'Up Next',
      recommendedTool: {
        name: 'Expedite Capstone Certificate & Peer Review Defense',
        icon: '🎓',
        actionText: 'View Capstone Rubric'
      }
    }
  ],
  recommendedMarketplaceTools: [
    {
      id: 'axiom-cyber-suite',
      name: 'AXIOM AI-Powered Cyber Suite',
      icon: '🛡️',
      tagline: 'Used extensively across Step 5 & 8 for automated zero trust verification.',
      price: '$499 / mo',
      actionText: '14-Day Free Trial'
    },
    {
      id: 'expedite-strike-suite',
      name: 'Expedite Strike & Fusion 2026',
      icon: '⚡',
      tagline: 'Used in Step 7 & 9 for autonomous red teaming and auto-PR assists.',
      price: '$499 / mo',
      actionText: 'Free Sandbox Key'
    }
  ]
}
