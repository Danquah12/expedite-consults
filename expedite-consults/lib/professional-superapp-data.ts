export interface CareerMissionTask {
  id: string
  title: string
  category: 'Profile' | 'Skills' | 'Portfolio' | 'Assessment' | 'Network' | 'Learning' | 'Jobs'
  isCompleted: boolean
  points: number
  actionUrl?: string
}

export interface CareerMission {
  id: string
  title: string
  roleTarget: string
  currentProgress: number
  totalTasks: number
  completedTasks: number
  xpEarned: number
  nextMilestone: string
  tasks: CareerMissionTask[]
  professionalJourneySteps: {
    stepNumber: number
    name: string
    category: 'Learn' | 'Practice' | 'Verify' | 'Build' | 'Network' | 'Apply' | 'Work' | 'Advance' | 'Monetize' | 'Sell'
    status: 'completed' | 'in_progress' | 'upcoming'
    description: string
    deliverable: string
  }[]
}

export const USER_CAREER_MISSION: CareerMission = {
  id: 'mission_cloud_sec',
  title: 'Lead Cloud & Zero Trust Security Architect 2026',
  roleTarget: '$195K-$235K Base Requisitions',
  currentProgress: 72,
  totalTasks: 7,
  completedTasks: 5,
  xpEarned: 1850,
  nextMilestone: 'Complete Kubernetes Cilium eBPF Lab to unlock Verified Fellow Badge',
  tasks: [
    { id: 't1', title: 'Complete Unified Identity & Workspace Profile', category: 'Profile', isCompleted: true, points: 200 },
    { id: 't2', title: 'Verify AWS GovCloud & Zero Trust Skill Badges', category: 'Skills', isCompleted: true, points: 300 },
    { id: 't3', title: 'Publish Multi-Account Terraform Portfolio Blueprint', category: 'Portfolio', isCompleted: true, points: 400 },
    { id: 't4', title: 'Complete NIST SP 800-53 OSCAL Assessment', category: 'Assessment', isCompleted: true, points: 350 },
    { id: 't5', title: 'Connect with 3 Principal Cloud Security Fellows', category: 'Network', isCompleted: true, points: 200 },
    { id: 't6', title: 'Execute Kubernetes eBPF Micro-Segmentation Lab', category: 'Learning', isCompleted: false, points: 400 },
    { id: 't7', title: 'Submit 1-Click Applications to 4 Cleared Roles', category: 'Jobs', isCompleted: false, points: 300 },
  ],
  professionalJourneySteps: [
    { stepNumber: 1, name: 'Learn AWS & GovCloud Architecture', category: 'Learn', status: 'completed', description: 'Master multi-account landing zones, SCP guardrails & IAM perimeters.', deliverable: 'Masterclass Certificate' },
    { stepNumber: 2, name: 'Practice in Zero-Trust Cloud Lab', category: 'Practice', status: 'completed', description: 'Deploy Cilium eBPF mesh and live GuardDuty automated triage.', deliverable: 'Lab Execution Log' },
    { stepNumber: 3, name: 'Verify with ConnectIn Assessment', category: 'Verify', status: 'completed', description: 'Proctored 45-minute architectural scenario examination.', deliverable: 'Verified Fellow Badge' },
    { stepNumber: 4, name: 'Build Production Portfolio Project', category: 'Build', status: 'completed', description: 'Publish verified multi-tenant Terraform architecture repository.', deliverable: 'GitHub Verified Project' },
    { stepNumber: 5, name: 'Network with Cleared Security Leaders', category: 'Network', status: 'completed', description: 'Connect with VP of Security & Defense Contractors.', deliverable: '500+ Connections' },
    { stepNumber: 6, name: 'Apply to High-Compensation Roles', category: 'Apply', status: 'in_progress', description: 'Target $195K-$235K Cleared Principal Architect requisitions.', deliverable: '4 Active Applications' },
    { stepNumber: 7, name: 'Work in Mission-Critical Enclaves', category: 'Work', status: 'upcoming', description: 'Lead enterprise defense security engineering and cATO pipelines.', deliverable: 'Full-Time Position' },
    { stepNumber: 8, name: 'Advance to Top 1% Peer Reviewer', category: 'Advance', status: 'upcoming', description: 'Validate architectures submitted by community engineers.', deliverable: '4.98 ★ Reviewer Score' },
    { stepNumber: 9, name: 'Monetize Fractional Advisory Retainers', category: 'Monetize', status: 'upcoming', description: 'Offer 1:1 architecture teardowns and SOW consulting.', deliverable: '$150-$175 / hr Bookings' },
    { stepNumber: 10, name: 'Sell Autonomous Software on Marketplace', category: 'Sell', status: 'upcoming', description: 'Publish custom security agents, MCP tools, and templates.', deliverable: 'ConnectIn Seller Storefront' },
  ]
}

export interface ProcurementSpendDashboard {
  companyName: string
  annualSpend: string
  pendingApprovalsCount: number
  activeVendorsCount: number
  activeSubscriptionsCount: number
  renewalsThisMonthCount: number
  approvalWorkflow: {
    step: number
    role: string
    status: 'Approved' | 'Pending Review' | 'Upcoming'
    assignee: string
  }[]
  activeRequisitions: {
    id: string
    product: string
    vendor: string
    requestedBy: string
    department: string
    amount: string
    status: 'Pending Security Review' | 'Pending Procurement Approval' | 'Approved'
    date: string
  }[]
}

export const CORPORATE_PROCUREMENT_DATA: ProcurementSpendDashboard = {
  companyName: 'Acme Federal Technologies Inc.',
  annualSpend: '$2,480,000 / yr',
  pendingApprovalsCount: 14,
  activeVendorsCount: 38,
  activeSubscriptionsCount: 62,
  renewalsThisMonthCount: 7,
  approvalWorkflow: [
    { step: 1, role: 'Employee Request', status: 'Approved', assignee: 'Alex Taylor (Principal Architect)' },
    { step: 2, role: 'Manager Approval', status: 'Approved', assignee: 'Sarah Jenkins (VP Engineering)' },
    { step: 3, role: 'Security & Compliance Review', status: 'Pending Review', assignee: 'Marcus Vance (CISO Office)' },
    { step: 4, role: 'Corporate Procurement Sign-off', status: 'Upcoming', assignee: 'Procurement Board' }
  ],
  activeRequisitions: [
    { id: 'REQ-9941', product: 'AXIOM Enterprise Cyber Suite (GovCloud 500-Node)', vendor: 'Expedite Consults', requestedBy: 'Alex Taylor', department: 'Cloud Defense', amount: '$54,000 / yr', status: 'Pending Security Review', date: 'Aug 29, 2026' },
    { id: 'REQ-9940', product: 'Expedite Strike ASPM & Checkmarx MCP Gateway', vendor: 'Expedite Strike Labs', requestedBy: 'David K.', department: 'AppSec Engineering', amount: '$18,500 / yr', status: 'Pending Procurement Approval', date: 'Aug 28, 2026' },
    { id: 'REQ-9939', product: 'Microsoft Sentinel Multi-Tenant Ingress Connector', vendor: 'Microsoft Partner Hub', requestedBy: 'Elena Rostova', department: 'SOC Operations', amount: '$12,000 / yr', status: 'Approved', date: 'Aug 25, 2026' }
  ]
}

export interface RFPQuoteRequest {
  id: string
  title: string
  clientName: string
  clientType: 'Enterprise (Fortune 500)' | 'Defense Contractor' | 'Federal Agency'
  scope: string
  budgetRange: string
  deadline: string
  bids: {
    vendorName: string
    vendorLogo: string
    bidAmount: string
    estimatedTimeline: string
    rating: number
    verifiedBadges: string[]
    deliverables: string[]
  }[]
}

export const RFP_MARKETPLACE_DATA: RFPQuoteRequest[] = [
  {
    id: 'rfp_1',
    title: 'Full-Scope Red Team Adversary Emulation & Penetration Test (2,000 Hosts)',
    clientName: 'Global Financial Infrastructure Corp',
    clientType: 'Enterprise (Fortune 500)',
    scope: 'External ingress assessment, Active Directory privilege escalation, eBPF container escapes, and tested GitHub fix PRs.',
    budgetRange: '$25,000 - $35,000',
    deadline: 'Bids close in 3 days',
    bids: [
      {
        vendorName: 'Expedite Consults Advisory',
        vendorLogo: '🛡️',
        bidAmount: '$28,000',
        estimatedTimeline: '10 Business Days',
        rating: 4.98,
        verifiedBadges: ['FedRAMP 3PAO Audited', 'TS/SCI Cleared Cadre', 'Zero-Day Exploitation Verified'],
        deliverables: ['Automated PR Fixes for SAST/SCA', 'Executive Board PDF Dossier', 'Live Re-Testing Guarantee']
      },
      {
        vendorName: 'Deloitte Cyber Risk Practice',
        vendorLogo: '🏛️',
        bidAmount: '$34,000',
        estimatedTimeline: '3 Weeks',
        rating: 4.85,
        verifiedBadges: ['Big 4 Global Firm', 'ISO 27001 Certified'],
        deliverables: ['Compliance Gap Matrix', 'Formal Attestation Letter', 'C-Suite Briefing']
      },
      {
        vendorName: 'Mandiant Threat Labs',
        vendorLogo: '⚡',
        bidAmount: '$31,500',
        estimatedTimeline: '2 Weeks',
        rating: 4.92,
        verifiedBadges: ['Google Cloud Security', 'Nation-State Threat Intel'],
        deliverables: ['Adversary TTP Mapping', 'SIEM Rule Packs', 'Debrief Workshop']
      }
    ]
  }
]

export interface CollaborationPost {
  id: string
  authorName: string
  authorAvatar: string
  authorRole: string
  seekingRole: string
  projectTitle: string
  description: string
  requiredSkills: string[]
  equityOrComp: string
  responsesCount: number
}

export const COLLABORATION_DATA: CollaborationPost[] = [
  {
    id: 'collab_1',
    authorName: 'Marcus Vance',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    authorRole: 'Founder @ Stealth Sec (Ex-Palantir / NSA)',
    seekingRole: 'Co-Founder & Chief AI Safety Architect',
    projectTitle: 'Autonomous MCP Guardrail Protocol for Defense AI Enclaves',
    description: 'We are building an Ed25519 cryptographic token firewall for agentic LLMs operating on AWS GovCloud. Looking for a technical co-founder with deep eBPF and NIST AI RMF expertise.',
    requiredSkills: ['Model Context Protocol (MCP)', 'Rust / eBPF', 'NIST AI RMF', 'TS/SCI Clearance'],
    equityOrComp: '18% - 25% Equity + Seed Retainer',
    responsesCount: 14
  },
  {
    id: 'collab_2',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    authorRole: 'Stanford AI Fellow & Research Lead',
    seekingRole: 'Senior Rust Systems Engineer (Part-Time / Contributor)',
    projectTitle: 'VeritasLens Fact-Radar Open-Source Engine',
    description: 'Building an open-source real-time news clustering parser that detects editorial blindspots and validates statutory legal references.',
    requiredSkills: ['Rust', 'Vector Databases', 'NLP Transformers', 'Open Source'],
    equityOrComp: '$8,000 Grant Milestone + Core Maintainer Rights',
    responsesCount: 8
  }
]

export interface IdeaItem {
  id: string
  title: string
  author: string
  authorAvatar: string
  category: 'AI Defense' | 'Cloud Security' | 'DevSecOps' | 'Compliance'
  supportCount: number
  commentsCount: number
  pitch: string
  lookingFor: string[]
  hasSupported?: boolean
}

export const COMMUNITY_IDEAS_DATA: IdeaItem[] = [
  {
    id: 'idea_1',
    title: 'AI-Powered RMF & Continuous OSCAL Automation for Defense Subcontractors',
    author: 'Col. Raymond Sterling (Ret.)',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    category: 'Compliance',
    supportCount: 2381,
    commentsCount: 142,
    pitch: 'Small defense vendors spend 9 months and $150K writing static Word doc SSPs. Let’s build an automated parser that queries AWS Config and outputs instant NIST 800-53 OSCAL JSON packages for automated approval.',
    lookingFor: ['Rust Developers', 'FedRAMP 3PAO Auditors', 'Seed Investors'],
    hasSupported: true
  },
  {
    id: 'idea_2',
    title: 'Dynamic Honeytoken Deception Mesh for Agentic LLM MCP Tools',
    author: 'Alex Taylor',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    category: 'AI Defense',
    supportCount: 1840,
    commentsCount: 96,
    pitch: 'Inject fake synthetic AWS credentials and database connections into agentic tool memory. When a prompt injection adversary attempts to exfiltrate keys, trigger instant automated containment.',
    lookingFor: ['AppSec Researchers', 'Python MCP Engineers', 'Beta Enterprise Testers'],
    hasSupported: false
  }
]

export interface MentorProfile {
  id: string
  name: string
  avatar: string
  role: string
  company: string
  rating: number
  reviewsCount: number
  pricing: string
  specialties: string[]
  bio: string
  slotsAvailable: number
}

export const MENTORS_DATA: MentorProfile[] = [
  {
    id: 'mentor_1',
    name: 'Dr. Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    role: 'Chief Information Security Officer',
    company: 'Federal Defense Technologies',
    rating: 5.0,
    reviewsCount: 68,
    pricing: '$75 / 45-min Session · $250 / Month',
    specialties: ['CISO Transition', 'FedRAMP cATO Strategy', 'Executive Board Communications'],
    bio: '20+ years leading enterprise cyber defenses. Mentored 40+ senior architects into VP and CISO leadership roles across Fortune 500 and defense agencies.',
    slotsAvailable: 2
  },
  {
    id: 'mentor_2',
    name: 'Alex Taylor (Fellow)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'Principal Cloud Security Architect',
    company: 'Expedite Consults',
    rating: 4.98,
    reviewsCount: 127,
    pricing: '$60 / 45-min Session · $200 / Month',
    specialties: ['AWS GovCloud Landing Zones', 'Zero Trust NIST 800-207', 'Exploit Triage & Auto-PR'],
    bio: 'Specialist in multi-account cloud security, eBPF micro-segmentation, and high-compensation cleared architecture roles.',
    slotsAvailable: 3
  }
]

export interface CreatorCampaign {
  id: string
  brandName: string
  brandLogo: string
  campaignTitle: string
  compensation: string
  deliverableType: 'Technical Deep Dive Post' | 'Webinar Demo' | 'Architecture Whitepaper' | 'Product Benchmark'
  description: string
  applicantsCount: number
}

export const CREATOR_CAMPAIGNS_DATA: CreatorCampaign[] = [
  {
    id: 'camp_1',
    brandName: 'Checkmarx Enterprise AppSec',
    brandLogo: '⚡',
    campaignTitle: 'Technical Teardown: Model Context Protocol (MCP) in DevSecOps',
    compensation: '$2,500 / Post + Benchmark Report',
    deliverableType: 'Technical Deep Dive Post',
    description: 'Looking for verified Cloud & AppSec Fellows to run a benchmark comparing SAST false positive rates with vs without MCP auto-PR triage.',
    applicantsCount: 12
  },
  {
    id: 'camp_2',
    brandName: 'Expedite Consults Product Lab',
    brandLogo: '🛡️',
    campaignTitle: 'Live Architecture Teardown: Autonomous cATO with OSCAL',
    compensation: '$3,500 / Webinar & Code Repo',
    deliverableType: 'Webinar Demo',
    description: 'Co-host a live ConnectIn Stage demonstrating automated OSCAL JSON telemetry synchronization across multi-account AWS environments.',
    applicantsCount: 19
  }
]

export interface SecurityLabExercise {
  id: string
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master'
  duration: string
  environment: 'AWS GovCloud MicroVM' | 'Kubernetes Cilium Cluster' | 'Firecracker Sandbox'
  skillsGained: string[]
  description: string
  isStarted?: boolean
}

export const SECURITY_LABS_DATA: SecurityLabExercise[] = [
  {
    id: 'lab_1',
    title: 'Kubernetes Cilium eBPF Zero-Trust Micro-Segmentation',
    difficulty: 'Advanced',
    duration: '45 Minutes',
    environment: 'Kubernetes Cilium Cluster',
    skillsGained: ['eBPF Socket Sniffing', 'Cilium ClusterMesh', 'Zero-Trust Pod Isolation'],
    description: 'Deploy real-time network policy rules via Linux kernel eBPF probes. Block unauthorized cross-namespace egress without iptables performance bottlenecks.',
    isStarted: false
  },
  {
    id: 'lab_2',
    title: 'Adversary Emulation: Escaping AWS IAM Permissions Boundaries',
    difficulty: 'Master',
    duration: '60 Minutes',
    environment: 'AWS GovCloud MicroVM',
    skillsGained: ['IAM Privilege Escalation', 'CloudTrail Evasion', 'KMS Key Re-encryption'],
    description: 'Investigate a misconfigured assume-role chain in an isolated AWS GovCloud environment and construct an automated remediation guardrail.',
    isStarted: true
  },
  {
    id: 'lab_3',
    title: 'Prompt Injection Defense: Hardening Model Context Protocol (MCP) Gateways',
    difficulty: 'Intermediate',
    duration: '30 Minutes',
    environment: 'Firecracker Sandbox',
    skillsGained: ['Ed25519 Nonce Validation', 'WASM Sandbox Boundaries', 'AI-BOM Scanning'],
    description: 'Execute adversarial jailbreak prompts against an unhardened MCP agent, then implement cryptographic parameter validation middleware.',
    isStarted: false
  }
]
