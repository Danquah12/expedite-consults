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
  liveUrl?: string
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

// ================= ENCLAVE-SEGREGATED LEARNING PROVIDERS =================

export const TRADES_CARPENTRY_LEARNING_PATH: CareerLearningPath = {
  id: 'path-trades-carpentry',
  title: 'Master Craftsman & Timber Framing Journey',
  targetRole: 'Master Timber Joiner & Construction Superintendent',
  estimatedCompletion: '12 Weeks (Hands-On Guild Mentorship)',
  salaryTarget: '$125,000 - $160,000 / yr',
  heroBanner: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
  description: 'Comprehensive heavy timber and architectural joinery path: Master coastal Douglas Fir timber layout, Festool Domino mortising, compound rafter mathematics, OSHA 30 job-site safety, and PE-stamped load coordination.',
  steps: [
    {
      stepNumber: 1,
      title: 'Wood Science, Species & Moisture Diagnostics',
      skills: ['FOHC Douglas Fir', 'Moisture Meters (<14%)', 'Grain Deflection Diagnostics'],
      duration: 'Week 1',
      status: 'Completed'
    },
    {
      stepNumber: 2,
      title: 'Traditional Mortise & Tenon Joinery with Draw-Boring',
      skills: ['White Oak Octagonal Trunnels', 'Mortise Chisel Work', 'Sub-1mm Tolerances'],
      duration: 'Week 2-3',
      status: 'Completed'
    },
    {
      stepNumber: 3,
      title: 'Compound Roof Geometry & Hip-Valley Pitch Calculations',
      skills: ['Compound Miter Angles', 'Backing Bevels', 'Timber CAD Takeoffs'],
      duration: 'Week 4-5',
      status: 'In Progress',
      recommendedTool: {
        name: 'Festool Domino XL DF 700 Joiner',
        icon: '🧰',
        actionText: 'View Tool in Store'
      }
    },
    {
      stepNumber: 4,
      title: 'Structural Rigging, Crane Signaling & Crane Picks',
      skills: ['OSHA Rigging', 'Spreader Bars', 'Bent Erection Sequencing'],
      duration: 'Week 6-7',
      status: 'Up Next'
    },
    {
      stepNumber: 5,
      title: 'Structural PE Stamped Calculations & Wind Uplift',
      skills: ['45 PSF Snow Load', '115 MPH Wind Envelope', 'Seismic Anchor Ties'],
      duration: 'Week 8',
      status: 'Up Next'
    },
    {
      stepNumber: 6,
      title: 'Architectural Finish Joinery & Coffered Ceilings',
      skills: ['Coped Crown Molding', 'Curved Handrails', 'Bookmatched Walnut Paneling'],
      duration: 'Week 9-10',
      status: 'Up Next'
    },
    {
      stepNumber: 7,
      title: 'Subcontractor Bidding, Estimating & Lien Waivers',
      skills: ['Board-Foot Takeoffs', 'Milestone Escrow Draws', 'Procore Coordination'],
      duration: 'Week 11',
      status: 'Up Next'
    },
    {
      stepNumber: 8,
      title: 'OSHA 30 Job-Site Safety & Fall Protection Lead',
      skills: ['100% Tie-Off Protocols', 'Scaffolding Inspection', 'Job Hazard Analysis'],
      duration: 'Week 12',
      status: 'Up Next'
    },
    {
      stepNumber: 9,
      title: 'Guild Capstone: Clear-Span Timber Pavilion Bent Erection',
      skills: ['Full Bent Assembly', 'PE Stamped Inspection', 'Master Craftsman Defense'],
      duration: 'Capstone',
      status: 'Up Next',
      recommendedTool: {
        name: 'Master Carpenter Guild Peer Review',
        icon: '🔨',
        actionText: 'View Guild Rubric'
      }
    }
  ],
  recommendedMarketplaceTools: [
    {
      id: 'tool_festool_domino',
      name: 'Festool Domino XL DF 700 Joiner',
      icon: '🧰',
      tagline: 'Heavy-duty mortise and tenon joinery up to 140mm depth.',
      price: '$1,650',
      actionText: 'View in Tool Hub'
    },
    {
      id: 'tool_leica_disto',
      name: 'Leica 3D Disto Total Station',
      icon: '📐',
      tagline: 'Millimeter-accurate 3D room measurement & CAD coordinate export.',
      price: '$7,800',
      actionText: 'View Specs'
    }
  ]
}

export const HEALTHCARE_LEARNING_PATH: CareerLearningPath = {
  id: 'path-healthcare-trauma',
  title: 'Level 1 Trauma & Complex Surgical Resuscitation Mastery',
  targetRole: 'Attending Orthopedic Trauma Surgeon / Lead Emergency Resuscitation Nurse',
  estimatedCompletion: '16 Weeks (CME / Board Specialty Track)',
  salaryTarget: '$145,000 - $650,000 / yr',
  heroBanner: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80',
  description: 'Elite clinical resuscitation and surgical trauma pathway: Master Massive Transfusion Protocols, arterial line placement, pelvic ring disrupture reduction, open fracture debridement, and damage control resuscitation.',
  steps: [
    {
      stepNumber: 1,
      title: 'Emergency Severity Index (ESI Level 1) & Triage Directives',
      skills: ['Rapid Triage Bay Scoring', 'Airway Priority Assessment', 'Trauma Activation'],
      duration: 'Week 1-2',
      status: 'Completed'
    },
    {
      stepNumber: 2,
      title: 'Massive Transfusion Protocol (MTP) & Rapid Infusion',
      skills: ['Belmont RI-2 Operation', '1:1:1 Blood Component Ratios', 'Calcium Gluconate Monitoring'],
      duration: 'Week 3-4',
      status: 'Completed'
    },
    {
      stepNumber: 3,
      title: 'Hemodynamic Monitoring & Arterial Line Placement',
      skills: ['Radial & Femoral A-Lines', 'Waveform Damping Diagnostics', 'Central Venous Catheterization'],
      duration: 'Week 5-6',
      status: 'In Progress',
      recommendedTool: {
        name: 'Belmont Rapid Infuser RI-2',
        icon: '🩸',
        actionText: 'View Device Manual'
      }
    },
    {
      stepNumber: 4,
      title: 'FAST Bedside Sonography & Diagnostic Ultrasound',
      skills: ['Pericardial Window', 'Morison Pouch Sonography', 'Pneumothorax Sliding Sign'],
      duration: 'Week 7-8',
      status: 'Up Next'
    },
    {
      stepNumber: 5,
      title: 'Damage Control Resuscitation & TEG-Guided Hemostasis',
      skills: ['Thromboelastography (TEG)', 'TXA Administration', 'Coagulopathy Reversal'],
      duration: 'Week 9-10',
      status: 'Up Next'
    },
    {
      stepNumber: 6,
      title: 'Pelvic Ring Disruption Fixation & External C-Clamp',
      skills: ['Young-Burgess Classification', 'Anterior Pelvic Binder', 'Percutaneous SI Screws'],
      duration: 'Week 11-12',
      status: 'Up Next'
    },
    {
      stepNumber: 7,
      title: 'Complex Articular ORIF & Periprosthetic Fixation',
      skills: ['Anatomic Contoured Plating', 'Sub-Millimeter Articular Reduction', 'Intramedullary Nailing'],
      duration: 'Week 13-14',
      status: 'Up Next'
    },
    {
      stepNumber: 8,
      title: 'ICU Critical Care Ventilator Optimization & ARDS Protocols',
      skills: ['Protective Lung Ventilation (6 mL/kg)', 'Prone Positioning', 'Extracorporeal Support (ECMO)'],
      duration: 'Week 15',
      status: 'Up Next'
    },
    {
      stepNumber: 9,
      title: 'Board Specialty Capstone: Complex Trauma Resuscitation & M&M Defense',
      skills: ['Double-Blind M&M Presentation', 'Interdisciplinary Team Leadership', 'CME Defense'],
      duration: 'Capstone',
      status: 'Up Next',
      recommendedTool: {
        name: 'ABOS / AACN Specialty Board Credential',
        icon: '🩺',
        actionText: 'View Clinical Rubric'
      }
    }
  ],
  recommendedMarketplaceTools: [
    {
      id: 'tool_butterfly_iq',
      name: 'Butterfly iQ3 Bedside Ultrasound',
      icon: '🩺',
      tagline: 'Whole-body single-probe handheld clinical ultrasound for FAST scans.',
      price: '$2,890',
      actionText: 'View Clinical Specs'
    },
    {
      id: 'tool_belmont_infuser',
      name: 'Belmont Rapid Infuser RI-2',
      icon: '🩸',
      tagline: 'Up to 500 mL/min warmed blood component infusion with ultrasonic air elimination.',
      price: '$24,500',
      actionText: 'View Hospital RFP'
    }
  ]
}

export const AUTOMOTIVE_LEARNING_PATH: CareerLearningPath = {
  id: 'path-automotive-diagnostic',
  title: 'ASE World Class Master Diagnostic Technician Track',
  targetRole: 'Shop Foreman & Master Diagnostic Specialist',
  estimatedCompletion: '12 Weeks (Scope Labs & High-Voltage EV Bays)',
  salaryTarget: '$110,000 - $155,000 / yr ($65 - $80 / flag hr)',
  heroBanner: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
  description: 'Master advanced vehicle diagnostics: 4-channel PicoScope CAN-FD packet waveforms, 800V EV high-voltage safety de-energization, Cummins X15 commercial diesel SCR emissions, and intermittent electrical tracing.',
  steps: [
    {
      stepNumber: 1,
      title: 'Electrical Diagnostics & Voltage Drop Fundamentals',
      skills: ['Fluke 87V Mastery', 'Parasitic Current Draw Isolation', 'Ground Circuit Resistance'],
      duration: 'Week 1-2',
      status: 'Completed'
    },
    {
      stepNumber: 2,
      title: 'PicoScope 4-Channel CAN-Bus & CAN-FD Waveforms',
      skills: ['CAN-H / CAN-L Differential Signal', '120-Ohm Termination Resistors', 'Bus Glitch Isolation'],
      duration: 'Week 3-4',
      status: 'Completed'
    },
    {
      stepNumber: 3,
      title: 'Gasoline Direct Injection (GDI) & Dual-Pulse Analysis',
      skills: ['Current Clamps (60A)', 'High-Pressure Fuel Rail Dynamics', 'Injector Pintle Flyback Voltages'],
      duration: 'Week 5-6',
      status: 'In Progress',
      recommendedTool: {
        name: 'PicoScope 4425A Master Kit',
        icon: '⚡',
        actionText: 'View Scope Specs'
      }
    },
    {
      stepNumber: 4,
      title: 'Secondary Ignition & Coil-on-Plug (COP) Diagnostics',
      skills: ['COP Paddles', 'Spark Burn Time (>1.2ms)', 'Turbulence & Rich Mis-fire Signatures'],
      duration: 'Week 7',
      status: 'Up Next'
    },
    {
      stepNumber: 5,
      title: '800V High-Voltage EV Lockout/Tagout (NFPA 70E)',
      skills: ['CAT IV 1000V Lineman Gloves', 'Manual Service Disconnect (MSD)', 'Capacitor Discharge Verification'],
      duration: 'Week 8-9',
      status: 'Up Next'
    },
    {
      stepNumber: 6,
      title: 'EV Inverter Silicon-Carbide Drivers & Resolver Alignment',
      skills: ['3-Phase Motor Megohmmeter Testing', 'Sin/Cos Resolver Waveforms', 'Pre-Charge Resistor Diagnostics'],
      duration: 'Week 10',
      status: 'Up Next'
    },
    {
      stepNumber: 7,
      title: 'Commercial Fleet Cummins X15 Aftertreatment & DPF',
      skills: ['Cummins INSITE Telemetry', 'DEF Dosing Verification', 'SCR Catalyst NOx Conversion Ratio'],
      duration: 'Week 11',
      status: 'Up Next'
    },
    {
      stepNumber: 8,
      title: 'Transmission Electronic Hydraulics & Solenoid PWM',
      skills: ['Duty Cycle Modulation', 'Clutch Pressure Waveforms', 'Valve Body Rebuild'],
      duration: 'Week 12',
      status: 'Up Next'
    },
    {
      stepNumber: 9,
      title: 'World Class Capstone: Intermittent No-Start & CAN-FD Fault Teardown',
      skills: ['Real-World Customer Complaint Verification', 'Flag-Hour Diagnostic Efficiency', 'Foreman Endorsement'],
      duration: 'Capstone',
      status: 'Up Next',
      recommendedTool: {
        name: 'ASE World Class Master Defense',
        icon: '🔧',
        actionText: 'View Exam Rubric'
      }
    }
  ],
  recommendedMarketplaceTools: [
    {
      id: 'tool_picoscope_4425a',
      name: 'PicoScope 4425A 4-Channel Master Diagnostic Kit',
      icon: '⚡',
      tagline: 'High-speed 400MS/s floating inputs with connect-detect smart probes.',
      price: '$3,850',
      actionText: 'View in Tool Hub'
    },
    {
      id: 'tool_snapon_zeus',
      name: 'Snap-on ZEUS+ Diagnostic Workstation',
      icon: '🧰',
      tagline: 'Intelligent diagnostics, Fast-Track guided component tests & OEM flashing.',
      price: '$11,995',
      actionText: 'View Tool Profile'
    }
  ]
}

export function getEnclaveLearningPath(enclaveId?: string): CareerLearningPath {
  switch (enclaveId) {
    case 'trades_construction':
      return TRADES_CARPENTRY_LEARNING_PATH
    case 'healthcare_medicine':
      return HEALTHCARE_LEARNING_PATH
    case 'automotive_mechanics':
      return AUTOMOTIVE_LEARNING_PATH
    default:
      return CLOUD_SECURITY_LEARNING_PATH
  }
}

export function getEnclaveLearningCourses(enclaveId?: string): LearningCourse[] {
  if (enclaveId === 'trades_construction') {
    return [
      {
        id: 'crs_timber_1',
        title: 'Heavy Timber Mortise & Tenon Joinery & Bent Fabrication',
        category: 'Business',
        provider: 'ConnectIn Masterclass',
        instructor: {
          name: 'David Miller',
          role: 'Master Timber Carpenter & Joinery Superintendent',
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80'
        },
        rating: 4.99,
        reviewsCount: 680,
        duration: '12 hours (Hands-On Guild Course)',
        level: 'Advanced',
        coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
        summary: 'Step-by-step master class on mortise and tenon timber framing: layout geometry, draw-bored white oak trunnel engineering, and crane pick rigging.',
        curriculumModules: [
          '1. Selecting Coastal Douglas Fir #1 FOHC Timbers',
          '2. Mortise & Tenon Layout with Centerline Method',
          '3. Draw-Bored Trunnel Peg Physics & Tension Holding',
          '4. Compound Rafter Bevels & Hip Pitch Calculations',
          '5. Crane Pick Sequencing & Job-Site Bent Erection'
        ],
        hasCertificate: true,
        isEnrolled: true,
        progressPercent: 45,
        recommendedMarketplaceTools: [
          {
            id: 'tool_festool_domino',
            name: 'Festool Domino XL DF 700 Joiner',
            icon: '🧰',
            tagline: 'Precision mortising system for heavy timber joinery.',
            category: 'Tools',
            price: '$1,650',
            actionText: 'View Specs'
          }
        ]
      },
      {
        id: 'crs_trade_finish',
        title: 'Architectural Finish Carpentry & Custom Coffered Ceilings',
        category: 'Business',
        provider: 'ConnectIn Masterclass',
        instructor: {
          name: 'Frank Gallagher',
          role: 'General Contractor & Construction Superintendent',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
        },
        rating: 4.95,
        reviewsCount: 520,
        duration: '10 hours',
        level: 'Intermediate',
        coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
        summary: 'Precision architectural trim techniques: coped inside corners, compound miter coffered ceiling beams, curved handrails, and zero-gap joints.',
        curriculumModules: [
          '1. Crown Molding Compound Miter Math & Table Settings',
          '2. Coped Joints vs Mitered Corners on Uneven Walls',
          '3. Grid Layout for Coffered Beam Ceilings',
          '4. Wall Paneling & Wainscoting Proportion Systems'
        ],
        hasCertificate: true,
        recommendedMarketplaceTools: []
      },
      {
        id: 'crs_trade_osha',
        title: 'OSHA 30 Construction Job-Site Safety & Rigging Standards',
        category: 'Business',
        provider: "O'Reilly",
        instructor: {
          name: 'Sarah Jenkins',
          role: 'Master Electrician & OSHA 30 Lead',
          avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&auto=format&fit=crop&q=80'
        },
        rating: 4.92,
        reviewsCount: 1100,
        duration: '30 hours (Official Certification Track)',
        level: 'Beginner',
        coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
        summary: 'Mandatory OSHA 30 job-site safety: fall protection systems, crane signaling, scaffolding inspections, electrical hazard lockouts, and OSHA inspection readiness.',
        curriculumModules: [
          '1. Introduction to OSHA & Job Hazard Analysis (JHA)',
          '2. Subpart M: Fall Protection Systems & Calculation of Fall Clearances',
          '3. Scaffolding Load Ratings & Competent Person Requirements',
          '4. Crane Rigging, Taglines & Certified Hand Signals'
        ],
        hasCertificate: true,
        recommendedMarketplaceTools: []
      }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      {
        id: 'crs_health_atls',
        title: 'Advanced Trauma Life Support (ATLS 10th Ed) & Damage Control',
        category: 'Business',
        provider: 'ConnectIn Masterclass',
        instructor: {
          name: 'Dr. Angela Vance, MD, FACS',
          role: 'Attending Orthopedic Trauma Surgeon',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80'
        },
        rating: 5.0,
        reviewsCount: 940,
        duration: '16 hours (CME Accredited)',
        level: 'Advanced',
        coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
        summary: 'Standardized resuscitation protocols for life-threatening trauma: primary survey ABCDE, massive hemothorax chest tubes, and damage control laparotomy.',
        curriculumModules: [
          '1. Primary Survey & Resuscitative Endovascular Balloon Occlusion (REBOA)',
          '2. Airway Management in Cervical Spine Instability',
          '3. Massive Transfusion Protocol: Balancing Coagulopathy',
          '4. Musculoskeletal Trauma & Compartment Syndrome Decompression'
        ],
        hasCertificate: true,
        isEnrolled: true,
        progressPercent: 70,
        recommendedMarketplaceTools: [
          {
            id: 'tool_butterfly_iq',
            name: 'Butterfly iQ3 Ultrasound',
            icon: '🩺',
            tagline: 'Ultrasound probe for FAST trauma exams.',
            category: 'Devices',
            price: '$2,890',
            actionText: 'View Specs'
          }
        ]
      },
      {
        id: 'crs_health_mtp',
        title: 'Massive Transfusion Protocol (MTP) & Belmont RI-2 Infusion',
        category: 'Business',
        provider: 'ConnectIn Masterclass',
        instructor: {
          name: 'Elena Rostova, RN, CCRN, TNCC',
          role: 'Emergency Trauma Resuscitation Nurse Lead',
          avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80'
        },
        rating: 4.98,
        reviewsCount: 820,
        duration: '8 hours',
        level: 'Advanced',
        coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
        summary: 'Rapid blood product warming and delivery during exsanguinating hemorrhage: 1:1:1 pRBC to FFP to Platelet ratios, TEG analysis, and Belmont RI-2 management.',
        curriculumModules: [
          '1. MTP Trigger Criteria & Trauma Bay Activation',
          '2. Belmont RI-2 Setup, Priming & Ultrasonic Air Elimination',
          '3. Thromboelastography (TEG) Directed Component Therapy',
          '4. Monitoring Hypocalcemia, Acidosis & Hypothermia Triad'
        ],
        hasCertificate: true,
        recommendedMarketplaceTools: []
      }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      {
        id: 'crs_auto_scope',
        title: 'PicoScope 4-Channel CAN-FD & Oscilloscope Waveforms',
        category: 'Programming',
        provider: 'ConnectIn Masterclass',
        instructor: {
          name: 'Marcus Miller, ASE Master Tech',
          role: 'Lead Master Diagnostic Specialist',
          avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80'
        },
        rating: 4.98,
        reviewsCount: 780,
        duration: '14 hours',
        level: 'Advanced',
        coverImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
        summary: 'Capture, filter, and decode high-speed CAN-FD bus signals, secondary ignition flyback spikes, direct injection current ramps, and intermittent sensor dropouts.',
        curriculumModules: [
          '1. Voltage Division, Timebase Setup & Triggering on Glitches',
          '2. CAN-FD Physical Layer Analysis & Termination Resistors',
          '3. High-Pressure GDI Injector Current Ramps with Low-Amp Clamps',
          '4. In-Cylinder Pressure Transducer Waveforms (WPS500X)'
        ],
        hasCertificate: true,
        isEnrolled: true,
        progressPercent: 55,
        recommendedMarketplaceTools: [
          {
            id: 'tool_picoscope_4425a',
            name: 'PicoScope 4425A Kit',
            icon: '⚡',
            tagline: 'High-speed 4-channel automotive scope.',
            category: 'Tools',
            price: '$3,850',
            actionText: 'View Specs'
          }
        ]
      },
      {
        id: 'crs_auto_ev',
        title: '800V High-Voltage EV Powertrain & Battery Safety (NFPA 70E)',
        category: 'Cloud',
        provider: 'ConnectIn Masterclass',
        instructor: {
          name: 'Marcus Miller, ASE Master Tech',
          role: 'EV Powertrain & High-Voltage Specialist',
          avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80'
        },
        rating: 4.96,
        reviewsCount: 650,
        duration: '12 hours',
        level: 'Advanced',
        coverImage: 'https://images.unsplash.com/photo-1558441719-8b449c6ff673?w=800&auto=format&fit=crop&q=80',
        summary: 'Safe de-energization of high-voltage battery enclosures, silicon-carbide inverters, resolver offset calibration, and insulation resistance megohmmeter testing.',
        curriculumModules: [
          '1. NFPA 70E Category 4 Arc Flash & 1000V Gloves Testing',
          '2. Manual Service Disconnect (MSD) Lockout/Tagout Protocols',
          '3. Checking Zero Energy State with Calibrated Proving Units',
          '4. Inverter Pre-Charge Contactor Diagnostics'
        ],
        hasCertificate: true,
        recommendedMarketplaceTools: []
      }
    ]
  }

  // tech_cybersecurity or default
  return LEARNING_COURSES_DATA
}

export function getEnclaveInteractiveLabs(enclaveId?: string): InteractiveLab[] {
  if (enclaveId === 'trades_construction') {
    return [
      {
        id: 'lab_skillhands_trades',
        title: 'SkillHands Vocational Trade Master Network',
        category: 'Cloud labs',
        difficulty: 'Intermediate',
        estimatedDuration: 'Live Marketplace',
        environment: 'AWS MicroVM Sandbox',
        summary: 'Explore real-world trade project specifications, architectural joinery takeoffs, and contractor bidding pipelines.',
        learningObjectives: [
          'Review residential and commercial timber framing requisitions',
          'Evaluate verified craftsman certifications and portfolio standards',
          'Test milestone escrow disbursements and lien waiver workflows'
        ],
        recommendedMarketplaceTools: [
          {
            name: 'SkillHands Vocational Hub',
            icon: '🛠️',
            tagline: 'Verified craftsman network.',
            actionText: 'Launch Hub'
          }
        ],
        isLiveSandboxReady: true,
        liveUrl: 'https://skillhands-client.vercel.app'
      },
      {
        id: 'lab_desknote_trades',
        title: 'DeskNote Field Takeoff & Cut-List Notebook',
        category: 'Secure coding',
        difficulty: 'Beginner',
        estimatedDuration: '20 mins',
        environment: 'Live IDE Terminal',
        summary: 'Ruggedized digital field notebook for recording lumber takeoff specs, saw kerf calculations, and jobsite daily logs.',
        learningObjectives: [
          'Test offline-first note sync with IndexedDB',
          'Format structural timber cut tables with board-foot calculations',
          'Export PE-ready PDF site logs'
        ],
        recommendedMarketplaceTools: [
          {
            name: 'DeskNote Field Systems',
            icon: '📓',
            tagline: 'Digital field notebook.',
            actionText: 'Open App'
          }
        ],
        isLiveSandboxReady: true,
        liveUrl: 'https://desk-note-kwesi-asiedus-projects.vercel.app'
      },
      {
        id: 'lab_vibetok_trades',
        title: 'VibeTok Trade Video Masterclasses',
        category: 'Cloud labs',
        difficulty: 'Intermediate',
        estimatedDuration: '30 mins',
        environment: 'Live IDE Terminal',
        summary: 'Stream master joinery demonstrations, mortise geometry walkthroughs, and Festool precision tool calibrations.',
        learningObjectives: [
          'Watch high-definition step-by-step joinery tutorials',
          'Complete interactive quizzes on compound roof rafter pitch math',
          'Earn verifiable master craftsman digital credentials'
        ],
        recommendedMarketplaceTools: [
          {
            name: 'VibeTok Learning Hub',
            icon: '🎥',
            tagline: 'Masterclass video learning.',
            actionText: 'Watch Masterclass'
          }
        ],
        isLiveSandboxReady: true,
        liveUrl: 'https://vibetok-learning-hub.vercel.app'
      },
      {
        id: 'lab_cutlist',
        title: 'Cut-List & Board-Foot Timber Optimization Sandbox',
        category: 'Cloud labs',
        difficulty: 'Intermediate',
        estimatedDuration: '30 mins',
        environment: 'Live IDE Terminal',
        summary: 'Calculate structural board-foot volumes for 40ft Douglas Fir bents and generate zero-waste cutting patterns with saw kerf adjustments.',
        learningObjectives: [
          'Calculate board-foot volumes from lumber dimensions',
          'Optimize nesting to achieve sub-4% scrap rate',
          'Export PE-ready timber takeoff spreadsheet'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true
      }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      {
        id: 'lab_vibetok_med',
        title: 'VibeTok Clinical Grand Rounds Video Hub',
        category: 'Cloud labs',
        difficulty: 'Intermediate',
        estimatedDuration: '30 mins',
        environment: 'Live IDE Terminal',
        summary: 'Interactive video streams covering level 1 trauma resuscitation, sterile surgical field setup, and advanced hemodynamic monitoring.',
        learningObjectives: [
          'Observe synchronized dual-angle procedural surgery',
          'Answer clinical decision check-points during active hemorrhage cases',
          'Track CME contact hours for state board licensing'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true,
        liveUrl: 'https://vibetok-learning-hub.vercel.app'
      },
      {
        id: 'lab_belmont',
        title: 'Belmont RI-2 Rapid Blood Infusion & MTP Simulator',
        category: 'Cloud labs',
        difficulty: 'Intermediate',
        estimatedDuration: '25 mins',
        environment: 'Live IDE Terminal',
        summary: 'Prime the disposables, calibrate ultrasonic bubble sensors, and manage a 500 mL/min warmed resuscitation for an unstable hemorrhagic shock case.',
        learningObjectives: [
          'Perform sterile disposable cassette installation',
          'Manage rapid heating to 37.5°C at flow rates exceeding 300 mL/min',
          'Troubleshoot air detector alarms and automated fluid clamp engagement'
        ],
        recommendedMarketplaceTools: [
          {
            name: 'Belmont Rapid Infuser',
            icon: '🩸',
            tagline: '500 mL/min warmed delivery.',
            actionText: 'View Specs'
          }
        ],
        isLiveSandboxReady: true
      },
      {
        id: 'lab_fast_ultra',
        title: 'FAST Bedside Trauma Ultrasound Interactive Case Simulator',
        category: 'Secure coding',
        difficulty: 'Advanced',
        estimatedDuration: '40 mins',
        environment: 'AWS MicroVM Sandbox',
        summary: 'Navigate probe positions across Morison pouch, spleno-renal recess, and subxiphoid view to identify free intraperitoneal fluid in a blunt trauma patient.',
        learningObjectives: [
          'Differentiate normal peritoneal reflections from hemoperitoneum',
          'Evaluate pericardial effusion versus cardiac tamponade',
          'Execute thoracic lung sliding sweep for pneumothorax'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true
      }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      {
        id: 'lab_desknote_auto',
        title: 'DeskNote Vehicle Diagnostic Field Notes',
        category: 'Secure coding',
        difficulty: 'Beginner',
        estimatedDuration: '20 mins',
        environment: 'Live IDE Terminal',
        summary: 'Ruggedized shop notebook for logging CAN-bus pinouts, intermittent DTC freeze frames, and warranty repair orders.',
        learningObjectives: [
          'Record multi-channel oscilloscope pinout connections',
          'Structure diagnostic troubleshooting trees for CAN-FD communication faults',
          'Sync records with fleet maintenance databases'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true,
        liveUrl: 'https://desk-note-kwesi-asiedus-projects.vercel.app'
      },
      {
        id: 'lab_vibetok_auto',
        title: 'VibeTok Automotive Waveform Masterclasses',
        category: 'Cloud labs',
        difficulty: 'Intermediate',
        estimatedDuration: '30 mins',
        environment: 'Live IDE Terminal',
        summary: 'Video teardowns of modern direct injection current waveforms, EV battery pack cell balance diagnostics, and turbo boost control.',
        learningObjectives: [
          'Analyze high-speed secondary ignition waveforms',
          'Troubleshoot CAN-FD bus termination reflection glitches',
          'Complete ASE L1 Advanced Engine Performance quizzes'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true,
        liveUrl: 'https://vibetok-learning-hub.vercel.app'
      },
      {
        id: 'lab_pico_canfd',
        title: 'Live PicoScope 4425A CAN-FD Waveform Signal Generator',
        category: 'Pentesting labs',
        difficulty: 'Advanced',
        estimatedDuration: '45 mins',
        environment: 'Live IDE Terminal',
        summary: 'Decode differential CAN-H and CAN-L waveforms running at 2 Mbit/s CAN-FD. Isolate ringing reflections caused by a missing 120-ohm termination resistor.',
        learningObjectives: [
          'Configure 4-channel analog inputs with DC coupling and 50V range',
          'Decode CAN-FD packet arbitration and payload data phases',
          'Diagnose stub line impedance mismatches and ground offsets'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true
      },
      {
        id: 'lab_ev_lockout',
        title: '800V High-Voltage Battery Pack Lockout/Tagout Sandbox',
        category: 'Cloud labs',
        difficulty: 'Intermediate',
        estimatedDuration: '30 mins',
        environment: 'AWS MicroVM Sandbox',
        summary: 'Perform live-dead-live testing with a CAT IV 1000V multi-meter on an 800V silicon-carbide inverter DC bus following manual service disconnect removal.',
        learningObjectives: [
          'Inspect class 0 1000V lineman rubber gloves with pneumatic air test',
          'Verify zero voltage across B+ and B- terminals using a calibrated proving unit',
          'Apply OSHA lock and Danger tag to the high-voltage interlock loop'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true
      }
    ]
  }

  if (enclaveId === 'tech_software') {
    return [
      {
        id: 'lab_sast_live',
        title: '05-SAST Abstract Syntax Tree Security Analysis',
        category: 'Secure coding',
        difficulty: 'Intermediate',
        estimatedDuration: '25 mins',
        environment: 'Live IDE Terminal',
        summary: 'Inspect live AST taint flow analysis in TypeScript/Rust codebases and verify automated GitHub remediation PR generation.',
        learningObjectives: [
          'Trace unvalidated query parameter to PostgreSQL execution sink',
          'Observe AST parsing identifying injection vectors in <4ms',
          'Merge automated fix PR with verified regression test suite'
        ],
        recommendedMarketplaceTools: [
          {
            name: '05-SAST Platform',
            icon: '🔍',
            tagline: 'Sub-4ms AST code analysis.',
            actionText: 'Launch SAST'
          }
        ],
        isLiveSandboxReady: true,
        liveUrl: 'https://05-sast-platform.vercel.app'
      },
      {
        id: 'lab_sca_live',
        title: '06-SCA Software Composition & AI-BOM Sandbox',
        category: 'Cloud labs',
        difficulty: 'Intermediate',
        estimatedDuration: '30 mins',
        environment: 'AWS MicroVM Sandbox',
        summary: 'Audit dependency lockfiles, scan AI model weights for deserialization attacks, and generate compliant CycloneDX SBOM packages.',
        learningObjectives: [
          'Generate CycloneDX and SPDX format software bills of materials',
          'Detect malicious typosquatting packages in NPM/Cargo manifests',
          'Enforce strict open-source licensing policy gates'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true,
        liveUrl: 'https://06-sca-platform.vercel.app'
      },
      {
        id: 'lab_iac_live',
        title: '10-IaC Terraform Drift & Security Audit',
        category: 'Cloud labs',
        difficulty: 'Advanced',
        estimatedDuration: '35 mins',
        environment: 'Live IDE Terminal',
        summary: 'Evaluate Terraform plans against CIS AWS Benchmarks using Open Policy Agent (OPA) Rego rules to catch misconfigured S3 buckets.',
        learningObjectives: [
          'Write custom OPA Rego rules for AWS GovCloud guardrails',
          'Evaluate Terraform JSON plans in pre-commit hooks',
          'Remediate unencrypted EBS volume and public subnet findings'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true,
        liveUrl: 'https://10-iac-security-platform.vercel.app'
      },
      {
        id: 'lab_careerorbit_live',
        title: 'CareerOrbit Skill Passport & Competency Assessment',
        category: 'Cloud labs',
        difficulty: 'Beginner',
        estimatedDuration: '15 mins',
        environment: 'Live IDE Terminal',
        summary: 'Analyze your GitHub repositories to generate verified competency vectors and unlock high-paying Staff+ software roles.',
        learningObjectives: [
          'Sync public and private GitHub repositories',
          'Generate cryptographic proof of distributed systems proficiency',
          'Match competencies against real-time $250k+ software requisitions'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true,
        liveUrl: 'https://careerorbit-standalone.vercel.app'
      },
      {
        id: 'lab_vibetok_dev_live',
        title: 'VibeTok Developer Video Learning Hub',
        category: 'Cloud labs',
        difficulty: 'Intermediate',
        estimatedDuration: '30 mins',
        environment: 'Live IDE Terminal',
        summary: 'Bite-sized system design video masterclasses, eBPF microVM deep dives, and Next.js 16 architectural teardowns.',
        learningObjectives: [
          'Master distributed consensus algorithms (Raft, Paxos)',
          'Build low-latency WebAssembly microVM sandbox runners',
          'Earn verifiable DevSecOps completion certificates'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true,
        liveUrl: 'https://vibetok-learning-hub.vercel.app'
      }
    ]
  }

  if (enclaveId === 'law_gov_defense') {
    return [
      {
        id: 'lab_aegis_rmf_live',
        title: 'Aegis RMF Continuous ATO Compliance Engine',
        category: 'Cloud labs',
        difficulty: 'Expert',
        estimatedDuration: '45 mins',
        environment: 'AWS MicroVM Sandbox',
        summary: 'Map live cloud telemetry to NIST SP 800-53 Rev 5 controls and export automated OSCAL packages for DoD eMASS review.',
        learningObjectives: [
          'Evaluate AC, AU, IA, and SC controls against AWS GovCloud posture',
          'Generate System Security Plan (SSP) artifacts automatically',
          'Synchronize real-time evidence directly with eMASS APIs'
        ],
        recommendedMarketplaceTools: [
          {
            name: 'Aegis RMF Platform',
            icon: '🛡️',
            tagline: 'Continuous ATO automation.',
            actionText: 'Launch Aegis'
          }
        ],
        isLiveSandboxReady: true,
        liveUrl: 'https://aegis-rmf.vercel.app'
      },
      {
        id: 'lab_threat_modeling_live',
        title: '15-Threat Modeling STRIDE Suite',
        category: 'Secure coding',
        difficulty: 'Advanced',
        estimatedDuration: '40 mins',
        environment: 'Live IDE Terminal',
        summary: 'Construct architectural data flow diagrams (DFDs) and compute automated STRIDE threat matrices for cleared defense applications.',
        learningObjectives: [
          'Diagram trust boundaries and external entity data flows',
          'Identify Spoofing, Tampering, and Elevation of Privilege threats',
          'Export CMMC 2.0 Level 3 compliant threat documentation'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true,
        liveUrl: 'https://15-threat-modeling-platform.vercel.app'
      },
      {
        id: 'lab_secrets_live',
        title: '07-Secrets Token Vault & Auditing',
        category: 'Pentesting labs',
        difficulty: 'Intermediate',
        estimatedDuration: '30 mins',
        environment: 'Live IDE Terminal',
        summary: 'Detect exposed private keys, AWS access tokens, and API credentials across Git commits with automated revocation hooks.',
        learningObjectives: [
          'Execute entropy-based secret detection across git commit history',
          'Integrate automatic revocation webhooks with AWS IAM',
          'Enforce pre-commit cryptographic secret blocking'
        ],
        recommendedMarketplaceTools: [],
        isLiveSandboxReady: true,
        liveUrl: 'https://07-secrets-platform.vercel.app'
      }
    ]
  }

  // tech_cybersecurity or default
  return [
    {
      id: 'lab_11_dast_live',
      title: '11-DAST Automated Dynamic Pentesting Live Sandbox',
      category: 'Pentesting labs',
      difficulty: 'Expert',
      estimatedDuration: '45 mins',
      environment: 'Kali Linux Enclave',
      summary: 'Execute autonomous dynamic vulnerability scans against authenticated REST/GraphQL endpoints with weaponized proof-of-concept verification.',
      learningObjectives: [
        'Perform unauthenticated and JWT-authenticated attack surface discovery',
        'Verify SQLi and remote code execution vulnerabilities in isolated sandboxes',
        'Inspect raw HTTP request/response proofs with zero false-positive rate'
      ],
      recommendedMarketplaceTools: [
        {
          name: '11-DAST Security Platform',
          icon: '🎯',
          tagline: 'Dynamic application pentesting.',
          actionText: 'Launch DAST'
        }
      ],
      isLiveSandboxReady: true,
      liveUrl: 'https://11-dast-security-platform.vercel.app'
    },
    {
      id: 'lab_16_malware_live',
      title: '16-Malware Dynamic Reverse Engineering Hypervisor',
      category: 'Malware analysis',
      difficulty: 'Expert',
      estimatedDuration: '50 mins',
      environment: 'AWS MicroVM Sandbox',
      summary: 'Detonate live malware samples in bare-metal hypervisor sandboxes and inspect decompiled C pseudocode in interactive Ghidra workspaces.',
      learningObjectives: [
        'Monitor kernel-level process injection and reflective DLL loading',
        'Decompile obfuscated binaries into clean C pseudocode in Ghidra',
        'Generate automated YARA and Sigma rules for threat detection'
      ],
      recommendedMarketplaceTools: [
        {
          name: '16-Malware Analysis Platform',
          icon: '🔬',
          tagline: 'Dynamic hypervisor detonation.',
          actionText: 'Launch Sandbox'
        }
      ],
      isLiveSandboxReady: true,
      liveUrl: 'https://16-malware-analysis-platform.vercel.app'
    },
    {
      id: 'lab_17_ransomware_live',
      title: '17-Ransomware Blast Radius & Recovery Console',
      category: 'Cloud labs',
      difficulty: 'Advanced',
      estimatedDuration: '40 mins',
      environment: 'AWS MicroVM Sandbox',
      summary: 'Simulate an enterprise ransomware outbreak, compute lateral blast radius paths, and execute point-in-time immutable recoveries.',
      learningObjectives: [
        'Contain lateral infection movement across Active Directory forests',
        'Verify cryptographic integrity of immutable cloud snapshots',
        'Execute automated disaster recovery workflows in < 15 minutes'
      ],
      recommendedMarketplaceTools: [],
      isLiveSandboxReady: true,
      liveUrl: 'https://17-ransomware-recovery-platform.vercel.app'
    },
    {
      id: 'lab_careerorbit_cyber_live',
      title: 'CareerOrbit Cyber Skills Passport',
      category: 'Cloud labs',
      difficulty: 'Intermediate',
      estimatedDuration: '20 mins',
      environment: 'Live IDE Terminal',
      summary: 'Verify your offensive red teaming and penetration testing competencies to unlock top-tier cyber defense roles and bounties.',
      learningObjectives: [
        'Link verified OSCP, CRTO, and CISSP credentials',
        'Showcase published CVE discoveries and authorized exploit proofs',
        'Match with cleared enterprise defense and GovCloud security requisitions'
      ],
      recommendedMarketplaceTools: [],
      isLiveSandboxReady: true,
      liveUrl: 'https://careerorbit-standalone.vercel.app'
    },
    {
      id: 'lab_vibetok_cyber_live',
      title: 'VibeTok Cyber Labs & Adversary Teardowns',
      category: 'Pentesting labs',
      difficulty: 'Intermediate',
      estimatedDuration: '30 mins',
      environment: 'Live IDE Terminal',
      summary: 'Interactive video masterclasses covering EDR hooking bypasses, Active Directory Kerberoasting, and SCADA PLC defense.',
      learningObjectives: [
        'Watch real-time adversary simulation and evasion techniques',
        'Solve interactive sandbox challenges following video modules',
        'Earn verified offensive security training credentials'
      ],
      recommendedMarketplaceTools: [],
      isLiveSandboxReady: true,
      liveUrl: 'https://vibetok-learning-hub.vercel.app'
    },
    ...INTERACTIVE_LABS_DATA
  ]
}

export function getEnclaveCertificationTracks(enclaveId?: string): CertificationTrack[] {
  if (enclaveId === 'trades_construction') {
    return [
      {
        id: 'cert_master_carpenter',
        name: 'Master Carpenter Guild Certification (Timber Framing & Joinery)',
        issuingBody: 'CompTIA',
        badgeIcon: '🔨',
        examCode: 'TFG-MC-2026',
        questionsCount: 100,
        passingScore: '80%',
        medianSalaryUnlock: '$135,000 / yr',
        overview: 'The highest professional credential in heavy timber joinery, roof framing mathematics, and heritage structural craftsmanship.',
        domains: [
          { name: 'Heavy Timber Mortise & Tenon Geometry', weight: '25%' },
          { name: 'Compound Roof Rafters & Pitch Math', weight: '20%' },
          { name: 'Structural Load & PE Blueprint Interpretation', weight: '20%' },
          { name: 'Job-Site Crane Rigging & Erection Sequencing', weight: '20%' },
          { name: 'Architectural Finish & Coped Joinery', weight: '15%' }
        ],
        practiceExamReady: true,
        recommendedMarketplaceTools: []
      },
      {
        id: 'cert_osha_30',
        name: 'OSHA 30-Hour Construction Safety & Health Card',
        issuingBody: 'CompTIA',
        badgeIcon: '🦺',
        examCode: 'OSHA-CONST-30',
        questionsCount: 80,
        passingScore: '75%',
        medianSalaryUnlock: '$118,000 / yr',
        overview: 'Official US Department of Labor construction safety certification authorizing job-site safety supervision and fall protection enforcement.',
        domains: [
          { name: 'Fall Protection Systems (Subpart M)', weight: '30%' },
          { name: 'Electrical & Arc Flash Safety', weight: '20%' },
          { name: 'Scaffolding & Stairway Requirements', weight: '20%' },
          { name: 'Crane Rigging & Material Handling', weight: '15%' },
          { name: 'Hazard Communication & Silica Standards', weight: '15%' }
        ],
        practiceExamReady: true,
        recommendedMarketplaceTools: []
      }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      {
        id: 'cert_abos_ortho',
        name: 'ABOS Board Certification (Orthopaedic Surgery & Trauma)',
        issuingBody: 'ISC2',
        badgeIcon: '🔪',
        examCode: 'ABOS-PART-II',
        questionsCount: 120,
        passingScore: 'Passing Score (Peer Oral & Written)',
        medianSalaryUnlock: '$620,000 / yr',
        overview: 'American Board of Orthopaedic Surgery credential verifying full surgical mastery of complex trauma, articular reduction, and pelvic reconstructive procedures.',
        domains: [
          { name: 'Pelvic & Acetabular Fracture Reconstruction', weight: '25%' },
          { name: 'Open Fractures & Damage Control Orthopedics', weight: '25%' },
          { name: 'Periprosthetic Fracture & Revision Fixation', weight: '20%' },
          { name: 'Articular Nonunion & Osteotomy Fixation', weight: '15%' },
          { name: 'Surgical Morbidity, Ethics & Quality Assurance', weight: '15%' }
        ],
        practiceExamReady: true,
        recommendedMarketplaceTools: []
      },
      {
        id: 'cert_aacn_ccrn',
        name: 'AACN CCRN: Critical Care Registered Nurse (Adult)',
        issuingBody: 'ISC2',
        badgeIcon: '🩺',
        examCode: 'AACN-CCRN-ADULT',
        questionsCount: 150,
        passingScore: '70%',
        medianSalaryUnlock: '$142,000 / yr',
        overview: 'Validates advanced clinical acumen for direct bedside care of acutely ill and injured patients in Level 1 Trauma, Surgical, and Cardiac ICUs.',
        domains: [
          { name: 'Cardiovascular & Hemodynamic Instability', weight: '33%' },
          { name: 'Pulmonary & Mechanical Ventilation Management', weight: '24%' },
          { name: 'Neurology, Renal & Multi-Organ Failure', weight: '23%' },
          { name: 'Professional Caring & Ethical Practice', weight: '20%' }
        ],
        practiceExamReady: true,
        recommendedMarketplaceTools: []
      }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      {
        id: 'cert_ase_master',
        name: 'ASE Certified Master Automobile Technician (A1–A8)',
        issuingBody: 'OffSec',
        badgeIcon: '🔧',
        examCode: 'ASE-A1-A8-MASTER',
        questionsCount: 200,
        passingScore: '72%',
        medianSalaryUnlock: '$130,000 / yr',
        overview: 'The pinnacle automotive service credential covering all 8 automotive mechanical and electrical vehicle domains.',
        domains: [
          { name: 'A8: Engine Performance & Driveability', weight: '20%' },
          { name: 'A6: Electrical / Electronic Systems', weight: '20%' },
          { name: 'A1: Engine Repair & Teardown', weight: '12%' },
          { name: 'A2: Automatic Transmission / Transaxle', weight: '12%' },
          { name: 'A3: Manual Drive Train & Axles', weight: '12%' },
          { name: 'A4: Suspension & Steering', weight: '12%' },
          { name: 'A5: Brakes & ABS / Stability Control', weight: '12%' }
        ],
        practiceExamReady: true,
        recommendedMarketplaceTools: []
      },
      {
        id: 'cert_ase_l1',
        name: 'ASE L1: Advanced Engine Performance Specialist',
        issuingBody: 'OffSec',
        badgeIcon: '⚡',
        examCode: 'ASE-L1-COMPOSITE',
        questionsCount: 50,
        passingScore: '70%',
        medianSalaryUnlock: '$145,000 / yr',
        overview: 'Advanced diagnostic specialist credential evaluating complex composite vehicle oscilloscope and scanner diagnostic strategies.',
        domains: [
          { name: 'General Powertrain Diagnosis & Scope Analysis', weight: '28%' },
          { name: 'Computerized Powertrain Controls', weight: '26%' },
          { name: 'Fuel Systems & Direct Injection Analysis', weight: '24%' },
          { name: 'Ignition Systems & Secondary Waveforms', weight: '22%' }
        ],
        practiceExamReady: true,
        recommendedMarketplaceTools: []
      }
    ]
  }

  // tech_cybersecurity or default
  return CERTIFICATION_TRACKS_DATA
}
