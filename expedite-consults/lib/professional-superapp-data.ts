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
    { id: 'REQ-9481', product: 'AXIOM AI Cyber Suite (50 Enclave Licenses)', vendor: 'Expedite Consults', requestedBy: 'Alex Taylor', department: 'Cloud Infrastructure', amount: '$24,950 / yr', status: 'Approved', date: 'August 27, 2026' },
    { id: 'REQ-9482', product: 'CrowdStrike Falcon GovCloud EDR', vendor: 'CrowdStrike Federal', requestedBy: 'Dave Reynolds', department: 'SecOps', amount: '$85,000 / yr', status: 'Pending Security Review', date: 'August 28, 2026' },
    { id: 'REQ-9483', product: 'Red Team Penetration Testing SOW', vendor: 'Mandiant Solutions', requestedBy: 'Elena Rostova', department: 'AppSec', amount: '$60,000 SOW', status: 'Pending Procurement Approval', date: 'August 29, 2026' }
  ]
}

export interface RFPQuoteRequest {
  id: string
  title: string
  clientType: string
  budgetRange: string
  deadline: string
  scope: string
  bids: {
    vendorName: string
    vendorLogo: string
    bidAmount: string
    rating: string
    estimatedTimeline: string
    deliverables: string[]
  }[]
}

export const RFP_MARKETPLACE_DATA: RFPQuoteRequest[] = [
  {
    id: 'rfp_pentest_2000',
    title: 'RFP-2026-08: 2,000-Host External & Cloud Micro-Segmentation Penetration Test',
    clientType: 'Federal Defense Contractor (Tier 1)',
    budgetRange: '$50,000 – $80,000',
    deadline: 'Bids Close Sept 15, 2026',
    scope: 'Full-scope blackbox & greybox adversary emulation across AWS GovCloud, on-prem VMware, and Cilium Kubernetes clusters with continuous OSCAL reporting.',
    bids: [
      {
        vendorName: 'Expedite Strike Defense',
        vendorLogo: '🛡️',
        bidAmount: '$58,500',
        rating: '4.99 ★ (94 Audits)',
        estimatedTimeline: '18 Days',
        deliverables: ['Live Attack Graph', 'Automated GitHub PR Patches', 'OSCAL cATO Telemetry Machine Export']
      },
      {
        vendorName: 'Deloitte Cyber Risk',
        vendorLogo: '🏢',
        bidAmount: '$74,000',
        rating: '4.85 ★ (210 Audits)',
        estimatedTimeline: '30 Days',
        deliverables: ['Executive Board PDF Deck', 'Compliance Attestation', 'Bi-weekly Briefings']
      },
      {
        vendorName: 'Mandiant Red Team',
        vendorLogo: '⚔️',
        bidAmount: '$79,500',
        rating: '4.92 ★ (160 Audits)',
        estimatedTimeline: '21 Days',
        deliverables: ['Nation-State Emulation', 'Threat Actor Dossier', 'Remediation Workshop']
      }
    ]
  }
]

export interface CollaborationPost {
  id: string
  authorName: string
  authorRole: string
  authorAvatar: string
  projectTitle: string
  seekingRole: string
  equityOrComp: string
  description: string
  requiredSkills: string[]
}

export const COLLABORATION_DATA: CollaborationPost[] = [
  {
    id: 'collab_1',
    authorName: 'Alex Taylor (Fellow)',
    authorRole: 'Principal Cloud Security Architect',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    projectTitle: 'Building Autonomous AI-BOM & Ed25519 Prompt Injection Firewall',
    seekingRole: 'Co-Founder & Lead AI Safety ML Researcher',
    equityOrComp: '18% Equity + Co-Founder Seat',
    description: 'We have early enterprise pilot demand for an autonomous MCP token firewall. Seeking an ML safety researcher with PyTorch & kernel hook experience to partner on seed funding.',
    requiredSkills: ['Model Context Protocol', 'PyTorch', 'eBPF', 'Zero Trust']
  }
]

export interface IdeaItem {
  id: string
  title: string
  author: string
  authorAvatar: string
  category: string
  pitch: string
  lookingFor: string[]
  supportCount: number
  commentsCount: number
  hasSupported?: boolean
}

export const COMMUNITY_IDEAS_DATA: IdeaItem[] = [
  {
    id: 'idea_1',
    title: 'OpenOSCAL: Instant WebAssembly Validator for NIST 800-53 Machine Baselines',
    author: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    category: 'GovTech & Compliance',
    pitch: 'What if compliance engineers could validate a 5,000-control OSCAL JSON file locally inside the browser with zero cloud dependencies using Rust WebAssembly?',
    lookingFor: ['Rust WASM Developer', '3PAO Compliance Auditor', 'UI Engineer'],
    supportCount: 342,
    commentsCount: 48,
    hasSupported: false
  }
]

export interface MentorProfile {
  id: string
  name: string
  role: string
  company: string
  avatar: string
  bio: string
  specialties: string[]
  rating: string
  reviewsCount: number
  pricing: string
  slotsAvailable: number
}

export const MENTORS_DATA: MentorProfile[] = [
  {
    id: 'm1',
    name: 'Dr. Sarah Jenkins',
    role: 'Former Federal CISO & Senior Fellow',
    company: 'Expedite Consults Advisory',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    bio: 'Mentoring cybersecurity directors, staff architects, and aspiring CISOs on FedRAMP authorizations, board communication, and multi-cloud security transformations.',
    specialties: ['CISO Career Progression', 'FedRAMP High / DoD ATO', 'Board Presentations'],
    rating: '5.0 ★',
    reviewsCount: 68,
    pricing: '$75 / 45-min Session · $250 / mo Retainer',
    slotsAvailable: 3
  }
]

export interface CreatorCampaign {
  id: string
  brandName: string
  brandLogo: string
  campaignTitle: string
  compensation: string
  deliverableType: string
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
  }
]

// ==========================================
// 4. CONNECTIN AI AGENT MARKETPLACE
// ==========================================
export interface AIAgentItem {
  id: string
  name: string
  icon: string
  creator: string
  rating: string
  category: 'Recruiting' | 'Cybersecurity' | 'Compliance' | 'DevOps' | 'Sales' | 'Research'
  pricing: string
  description: string
  capabilities: string[]
  deployCount: string
  isVerified: boolean
}

export const AI_AGENTS_MARKETPLACE_DATA: AIAgentItem[] = [
  {
    id: 'agent_pentest',
    name: 'Autonomous Pentest & Exploit Agent',
    icon: '🛡️',
    creator: 'Expedite Consults Product Lab',
    rating: '4.98 ★',
    category: 'Cybersecurity',
    pricing: '$149 / mo per cluster',
    description: 'Continuously emulates nation-state adversary tactics against cloud workloads, discovering misconfigurations and generating automated GitHub PR fixes.',
    capabilities: ['AWS GovCloud Auditing', 'eBPF Probe Ingress', 'Automated Patch PRs', 'OSCAL Generation'],
    deployCount: '1,420 Enclaves',
    isVerified: true
  },
  {
    id: 'agent_recruiting',
    name: 'Cleared Talent Recruiter Agent',
    icon: '💼',
    creator: 'ConnectIn AI Labs',
    rating: '4.92 ★',
    category: 'Recruiting',
    pricing: '$99 / mo',
    description: 'Scans verified professional dossiers, assesses clearance attestations, conducts proctored skill challenges, and matches top 1% defense architects.',
    capabilities: ['TS/SCI Clearance Attestation', 'Automated Screening', 'Compensation Alignment', 'Direct Interview Booking'],
    deployCount: '3,840 Placements',
    isVerified: true
  },
  {
    id: 'agent_compliance',
    name: 'NIST 800-53 & FedRAMP cATO Agent',
    icon: '📋',
    creator: 'Expedite Consults Product Lab',
    rating: '5.0 ★',
    category: 'Compliance',
    pricing: '$299 / mo',
    description: 'Continuously maps cloud infrastructure telemetry to 340+ NIST 800-53 controls and exports cryptographically validated OSCAL JSON for 3PAO auditors.',
    capabilities: ['Continuous cATO Sync', 'OSCAL JSON Export', 'Control Drift Alerts', 'Audit Readiness'],
    deployCount: '890 Federal Enclaves',
    isVerified: true
  },
  {
    id: 'agent_coding',
    name: 'Zero-Trust Terraform & eBPF Refactor Agent',
    icon: '🧑‍💻',
    creator: 'Open Security Guild',
    rating: '4.88 ★',
    category: 'DevOps',
    pricing: 'Free / Open Source',
    description: 'Analyzes Infrastructure as Code (IaC) repositories, enforces least-privilege IAM policies, and automatically inserts Cilium eBPF network perimeters.',
    capabilities: ['Terraform AST Parsing', 'IAM Privilege Hardening', 'Cilium Mesh Injection', 'CI/CD Pipeline Hooks'],
    deployCount: '6,100 Repos',
    isVerified: true
  }
]

// ==========================================
// 5. CONNECTIN CODE & DEVELOPER ECOSYSTEM
// ==========================================
export interface DeveloperRepository {
  id: string
  name: string
  stars: number
  forks: number
  language: string
  languageColor: string
  description: string
  lastCommit: string
  isVerifiedProject: boolean
  contributorsCount: number
  connectedJobRole?: string
}

export const DEVELOPER_REPOSITORIES_DATA: DeveloperRepository[] = [
  {
    id: 'repo_aws_govcloud',
    name: 'danquah/aws-govcloud-zero-trust-blueprint',
    stars: 1420,
    forks: 284,
    language: 'HCL / Terraform',
    languageColor: '#7B42BC',
    description: 'Production-ready multi-account AWS GovCloud landing zone with automated SCP guardrails, transit gateway mesh, and NIST 800-53 Rev 5 compliance baselines.',
    lastCommit: '2 hours ago · Commit 9f8a1c by Alex Taylor',
    isVerifiedProject: true,
    contributorsCount: 14,
    connectedJobRole: 'Lead Cloud Security Architect ($235K)'
  },
  {
    id: 'repo_ebpf_k8s',
    name: 'danquah/cilium-ebpf-microsegmentation-enclave',
    stars: 980,
    forks: 165,
    language: 'Go / eBPF',
    languageColor: '#00ADD8',
    description: 'Linux kernel eBPF probe for zero-overhead socket packet inspection and micro-segmentation in high-density Kubernetes clusters.',
    lastCommit: 'Yesterday · Commit 3b129a by Alex Taylor',
    isVerifiedProject: true,
    contributorsCount: 8,
    connectedJobRole: 'Staff Infrastructure Security Engineer ($220K)'
  },
  {
    id: 'repo_mcp_firewall',
    name: 'danquah/model-context-protocol-prompt-guard',
    stars: 2150,
    forks: 412,
    language: 'TypeScript / Rust',
    languageColor: '#3178C6',
    description: 'Cryptographic perimeter firewall for Model Context Protocol (MCP) tool agents preventing prompt injection and unauthorized tool execution.',
    lastCommit: '3 days ago · Commit 71ef28 by Alex Taylor',
    isVerifiedProject: true,
    contributorsCount: 22,
    connectedJobRole: 'Staff AI Security Engineer ($385K)'
  }
]

// ==========================================
// 6. CONNECTIN PAY, WALLET & INVOICING
// ==========================================
export interface WalletTransaction {
  id: string
  type: 'Marketplace Sale' | 'Advisory Payout' | 'Creator Sponsorship' | 'Product Purchase'
  amount: string
  status: 'Completed' | 'In Escrow'
  counterparty: string
  date: string
}

export interface ConnectInWallet {
  availableBalance: string
  escrowBalance: string
  totalEarnedYTD: string
  currency: string
  payoutMethod: string
  transactions: WalletTransaction[]
}

export const USER_WALLET_DATA: ConnectInWallet = {
  availableBalance: '$2,430.00',
  escrowBalance: '$3,500.00',
  totalEarnedYTD: '$48,750.00',
  currency: 'USD',
  payoutMethod: 'Direct Deposit (Chase Federal ···· 4821)',
  transactions: [
    { id: 'TX-891', type: 'Advisory Payout', amount: '+$350.00', status: 'Completed', counterparty: 'Stripe Security Team (2h Session)', date: 'August 28, 2026' },
    { id: 'TX-890', type: 'Creator Sponsorship', amount: '+$2,500.00', status: 'In Escrow', counterparty: 'Checkmarx Enterprise AppSec', date: 'August 27, 2026' },
    { id: 'TX-889', type: 'Marketplace Sale', amount: '+$499.00', status: 'Completed', counterparty: 'AXIOM License (Defense Contractor)', date: 'August 25, 2026' },
    { id: 'TX-888', type: 'Product Purchase', amount: '-$149.00', status: 'Completed', counterparty: 'Autonomous Pentest Agent (Cluster Sub)', date: 'August 20, 2026' }
  ]
}

// ==========================================
// 7. PORTABLE PROFESSIONAL ID (connectin.com/id/alex)
// ==========================================
export interface PortableProfessionalID {
  customHandle: string
  fullName: string
  headline: string
  verifiedClearance: string
  clearanceVerifiedBy: string
  clearanceExpiry: string
  reputationScore: number
  topVerifiedSkills: string[]
  publicationsCount: number
  citationsCount: number
  activePatentsCount: number
  cryptographicHashProof: string
}

export const USER_PROFESSIONAL_ID_DATA: PortableProfessionalID = {
  customHandle: 'alex-taylor',
  fullName: 'Alex Taylor',
  headline: 'Principal Cloud & Zero Trust Security Architect (Fellow)',
  verifiedClearance: 'TS/SCI with Polygraph',
  clearanceVerifiedBy: 'ConnectIn Defense Identity Trust Network',
  clearanceExpiry: 'Valid through 2029',
  reputationScore: 98,
  topVerifiedSkills: ['AWS GovCloud Architecture', 'Linux eBPF Kernel Probes', 'cATO & NIST 800-53 OSCAL', 'Model Context Protocol Security'],
  publicationsCount: 23,
  citationsCount: 412,
  activePatentsCount: 3,
  cryptographicHashProof: '0x8f9c1b4e87a23d091e4f9b8c27a61e05d4b8f3a9'
}
