export interface SolutionPackage {
  id: string
  title: string
  icon: string
  problemStatement: string
  targetOutcome: string
  estimatedTime: string
  complianceFramework: string
  categories: ('Cloud' | 'Cybersecurity' | 'AI' | 'Compliance' | 'Enterprise')[]
  flywheel: {
    contentTrigger: string
    problemDefinition: string
    solutionArchitecture: string
  }
  recommendedProducts: {
    id: string
    name: string
    icon: string
    tagline: string
    price: string
    trialAvailable: boolean
    actionText: string
  }[]
  recommendedServices: {
    name: string
    provider: string
    scope: string
    price: string
    deliveryTimeline: string
  }[]
  recommendedExperts: {
    name: string
    role: string
    avatar: string
    rating: number
    reviewsCount: number
    hourlyRate: string
    badge: string
  }[]
  recommendedLearning: {
    title: string
    provider: string
    duration: string
    skillsGained: string[]
  }[]
  recommendedJobs: {
    title: string
    company: string
    salary: string
    location: string
  }[]
}

export const ENTERPRISE_SOLUTIONS_DATA: SolutionPackage[] = [
  {
    id: 'sol_secure_aws',
    title: 'Secure My AWS & GovCloud Environment',
    icon: '🔐',
    problemStatement: 'Multi-account AWS sprawl, misconfigured IAM permissions, lack of continuous compliance monitoring, and lateral breach risks across Kubernetes workloads.',
    targetOutcome: 'Full zero-trust perimeter, eBPF micro-segmentation with Cilium, automated GuardDuty remediation, and 100% NIST 800-207 compliance posture.',
    estimatedTime: '2 - 4 Weeks',
    complianceFramework: 'NIST SP 800-207 · CISA Zero Trust v2.0',
    categories: ['Cloud', 'Cybersecurity'],
    flywheel: {
      contentTrigger: 'Pulse Article: "Emergency CVE Analysis for Multi-Cloud Ingress"',
      problemDefinition: 'Ingress points exposed with excessive IAM permissions in GovCloud accounts.',
      solutionArchitecture: 'Deploy identity-aware proxy, enforce Cilium eBPF packet micro-segmentation, and automate least-privilege key rotations.'
    },
    recommendedProducts: [
      {
        id: 'axiom-cyber-suite',
        name: 'AXIOM AI-Powered Cyber Suite',
        icon: '🛡️',
        tagline: 'Autonomous zero-trust verification and threat surface mapping.',
        price: '$499 / mo',
        trialAvailable: true,
        actionText: '14-Day Free Trial'
      },
      {
        id: 'sphera-app-12',
        name: 'Sphera Zero-Trust Analyzer',
        icon: '🔒',
        tagline: 'Automated policy validator for microservice network topologies.',
        price: 'Included in Suite',
        trialAvailable: true,
        actionText: 'Launch App'
      }
    ],
    recommendedServices: [
      {
        name: 'AWS GovCloud Security Architecture Blueprint & Hardening',
        provider: 'Expedite Consults Advisory Group',
        scope: 'Multi-Account Landing Zone, SCP Guardrails, KMS Policy Review',
        price: '$8,500 One-Time',
        deliveryTimeline: '2 Weeks'
      }
    ],
    recommendedExperts: [
      {
        name: 'Alex Taylor',
        role: 'Principal Cloud Security Architect (Fellow)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        rating: 4.98,
        reviewsCount: 127,
        hourlyRate: '$150 / hr',
        badge: 'AWS Security Specialist'
      }
    ],
    recommendedLearning: [
      {
        title: 'Zero Trust Cloud Architecture & NIST SP 800-207 Defense',
        provider: 'ConnectIn Masterclass',
        duration: '14 Hours (Hands-On Labs)',
        skillsGained: ['Cilium eBPF', 'AWS GuardDuty', 'IAM Least-Privilege', 'mTLS Mesh']
      }
    ],
    recommendedJobs: [
      {
        title: 'Lead Cloud Security Architect',
        company: 'Northrop Grumman',
        salary: '$195K - $225K TC',
        location: 'Washington, DC / Remote'
      }
    ]
  },
  {
    id: 'sol_fedramp_cato',
    title: 'Achieve FedRAMP High & Continuous ATO (cATO)',
    icon: '📋',
    problemStatement: 'Traditional 9-month manual ATO documentation cycles, lack of machine-readable evidence, and static SSP reports failing continuous monitoring audits.',
    targetOutcome: 'Automated OSCAL JSON machine-readable evidence pipeline mapping 340+ NIST SP 800-53 Rev 5 controls to live AWS telemetry, cutting approval to 14 days.',
    estimatedTime: '4 - 6 Weeks',
    complianceFramework: 'FedRAMP High · NIST SP 800-53 Rev 5 · DoD IL5',
    categories: ['Compliance', 'Cloud', 'Enterprise'],
    flywheel: {
      contentTrigger: 'Pulse Brief: "FedRAMP 2026 Modernization: Continuous ATO Mandates"',
      problemDefinition: 'Federal contractors face severe audit bottlenecks with outdated manual spreadsheets.',
      solutionArchitecture: 'Automate evidence ingestion via OSCAL JSON and live telemetry assertion directly into federal auditor portals.'
    },
    recommendedProducts: [
      {
        id: 'oscal-cato-machine',
        name: 'OSCAL Automated cATO Dossier Generator',
        icon: '📑',
        tagline: 'Real-time telemetry to NIST 800-53 machine-readable evidence.',
        price: '$799 / mo',
        trialAvailable: true,
        actionText: 'Request Staging Key'
      },
      {
        id: 'axiom-cloud-defense',
        name: 'AXIOM FedRAMP Compliance Radar',
        icon: '🏛️',
        tagline: 'Continuous monitoring and drift detection for GovCloud.',
        price: '$499 / mo',
        trialAvailable: true,
        actionText: '14-Day Free Trial'
      }
    ],
    recommendedServices: [
      {
        name: 'FedRAMP 3PAO Pre-Assessment & Authorization Support',
        provider: 'Expedite Consults Federal Practice',
        scope: 'Complete SSP Gap Analysis, SAP Generation, and SAR Defense',
        price: '$15,000 / Engagement',
        deliveryTimeline: '4 Weeks'
      }
    ],
    recommendedExperts: [
      {
        name: 'Alexander Novak',
        role: 'FedRAMP 3PAO Lead Reviewer & Security Fellow',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        rating: 4.98,
        reviewsCount: 94,
        hourlyRate: '$175 / hr',
        badge: 'Certified 3PAO Lead'
      }
    ],
    recommendedLearning: [
      {
        title: 'Continuous ATO (cATO) & NIST 800-53 Rev 5 Automation',
        provider: "O'Reilly & ConnectIn",
        duration: '10 Hours',
        skillsGained: ['OSCAL JSON', 'STIG Compliance', 'Continuous Monitoring', 'FedRAMP PMO']
      }
    ],
    recommendedJobs: [
      {
        title: 'Information System Security Engineer (ISSE)',
        company: 'Expedite Consults',
        salary: '$175K - $205K Base ($195K TC)',
        location: 'Washington, DC Metro'
      }
    ]
  },
  {
    id: 'sol_pentest_aspm',
    title: 'Perform Penetration Testing & Autonomous ASPM',
    icon: '🛡️',
    problemStatement: 'Static scans produce 500-page alert noise with 90% false positives, while manual penetration testing cannot keep pace with weekly CI/CD code releases.',
    targetOutcome: 'Autonomous offensive exploit verification, false positive elimination, and automated tested pull-request dispatch in GitHub pipelines.',
    estimatedTime: 'Immediate (1-Click)',
    complianceFramework: 'OWASP Top 10 · NIST 800-115 · CWE/SANS 25',
    categories: ['Cybersecurity', 'Enterprise'],
    flywheel: {
      contentTrigger: 'Pulse Article: "Autonomous AppSec & Triage Auto-PR Benchmarks"',
      problemDefinition: 'DevSecOps teams overwhelmed by triage backlogs and unverified alerts.',
      solutionArchitecture: 'Deploy Checkmarx MCP Server with hybrid offensive attack graph simulation to auto-generate code fixes.'
    },
    recommendedProducts: [
      {
        id: 'expedite-strike',
        name: 'Expedite Strike & Fusion 2026',
        icon: '⚡',
        tagline: 'Autonomous Red Teaming, ASPM & Hybrid AI AppSec.',
        price: '$499 / mo',
        trialAvailable: true,
        actionText: 'Launch 14-Day Sandbox'
      },
      {
        id: 'aegis-pentest',
        name: 'ÆGIS SOC Autonomous PenTest Hub',
        icon: '⚡',
        tagline: 'Rust-accelerated attack chain execution engine.',
        price: '$899 / mo',
        trialAvailable: true,
        actionText: 'Request Demo'
      }
    ],
    recommendedServices: [
      {
        name: 'Full-Scope Red Team Adversary Emulation',
        provider: 'Expedite Strike Offensive Labs',
        scope: 'External, Internal, Active Directory & Cloud Ingress Breach Tests',
        price: '$12,000 / Sprint',
        deliveryTimeline: '2 Weeks'
      }
    ],
    recommendedExperts: [
      {
        name: 'David Sterling',
        role: 'Principal Offensive Red Team Lead (OSCP / OSCE)',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
        rating: 4.96,
        reviewsCount: 114,
        hourlyRate: '$165 / hr',
        badge: 'Red Team Fellow'
      }
    ],
    recommendedLearning: [
      {
        title: 'Offensive Security & Autonomous Exploit Development',
        provider: 'ConnectIn Masterclass',
        duration: '16 Hours',
        skillsGained: ['Buffer Overflows', 'WebAssembly Exploitation', 'Auto-PR Dispatch', 'STRIDE']
      }
    ],
    recommendedJobs: [
      {
        title: 'Senior Offensive Security / Red Team Lead',
        company: 'Lockheed Martin',
        salary: '$180K - $220K TC',
        location: 'Remote / DC'
      }
    ]
  },
  {
    id: 'sol_ai_security',
    title: 'Deploy AI Securely & MCP Guardrail Engineering',
    icon: '🤖',
    problemStatement: 'Direct and indirect prompt injections, unauthorized tool execution in agentic pipelines, and unverified AI-BOM supply chain risks.',
    targetOutcome: 'Cryptographically isolated MCP gateways with Ed25519 nonce verification, token-level guardrails, and real-time AI-BOM scanning.',
    estimatedTime: '1 - 2 Weeks',
    complianceFramework: 'NIST AI RMF 1.0 · OWASP Top 10 for LLMs',
    categories: ['AI', 'Cybersecurity'],
    flywheel: {
      contentTrigger: 'Research Paper: "Eliminating Indirect Prompt Injection in MCP Tool Bindings"',
      problemDefinition: 'Agentic LLM tool execution hijacked via zero-width unicode injection.',
      solutionArchitecture: 'Deploy WebAssembly runtime sandbox with cryptographic nonce parameter validation.'
    },
    recommendedProducts: [
      {
        id: 'veritaslens-intel',
        name: 'VeritasLens NLP Media Intelligence',
        icon: '🌐',
        tagline: 'Real-time NLP bias clustering and fact verification.',
        price: '$349 / mo',
        trialAvailable: true,
        actionText: 'Free Trial'
      },
      {
        id: 'sphera-aibom',
        name: 'Sphera AI-BOM & Token Guardrail Scanner',
        icon: '🤖',
        tagline: 'Token-level guardrail scanner for agentic pipelines.',
        price: 'Included in Suite',
        trialAvailable: true,
        actionText: 'Try Micro-App'
      }
    ],
    recommendedServices: [
      {
        name: 'Enterprise Agentic AI Security Architecture & Safety Audit',
        provider: 'Expedite Consults AI Safety Practice',
        scope: 'MCP Tool Binding Formal Verification, Prompt Containment, AI-BOM',
        price: '$9,500 / Audit',
        deliveryTimeline: '10 Days'
      }
    ],
    recommendedExperts: [
      {
        name: 'Dr. Elena Rostova',
        role: 'Chief AI Safety Scientist & Stanford Fellow',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        rating: 5.0,
        reviewsCount: 89,
        hourlyRate: '$200 / hr',
        badge: 'AI Safety Fellow'
      }
    ],
    recommendedLearning: [
      {
        title: 'LLM Agent Safety, MCP Nonce Security & Guardrails Engineering',
        provider: "O'Reilly & ConnectIn",
        duration: '10 Hours',
        skillsGained: ['Ed25519 Nonces', 'Prompt Injection Defense', 'MCP Protocol', 'AI-BOM']
      }
    ],
    recommendedJobs: [
      {
        title: 'Staff AI Security Engineer',
        company: 'Stripe',
        salary: '$245K Base ($385K TC)',
        location: 'San Francisco, CA / Remote'
      }
    ]
  }
]
