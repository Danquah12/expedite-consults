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
    liveUrl?: string
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
        name: 'DStrike & AXIOM AI-Powered Cyber Suite',
        icon: '🛡️',
        tagline: 'Autonomous zero-trust verification, threat surface mapping, and predictive cyber defense.',
        price: '$499 / mo',
        trialAvailable: true,
        actionText: '14-Day Free Trial',
        liveUrl: 'https://dstrike-app.vercel.app'
      },
      {
        id: 'sphera-app-12',
        name: 'Noctis Threat Intelligence & Zero-Trust Analyzer',
        icon: '🔒',
        tagline: 'Automated policy validator for microservice network topologies and dark-web telemetry.',
        price: 'Included in Suite',
        trialAvailable: true,
        actionText: 'Launch App',
        liveUrl: 'https://noctis-26.vercel.app'
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
        id: 'prod_aagiis_federal_rmf',
        name: 'Aagiis — Federal Compliance Solutions | DoD RMF & DCSA NISP Platform',
        icon: '🛡️',
        tagline: 'End-to-end DoD RMF (DoDI 8510.01), DCSA NISP (32 CFR Part 117), DISA STIG/SCAP (.cklb) & ATO platform.',
        price: 'Enterprise / Free Trial',
        trialAvailable: true,
        actionText: '14-Day Free Trial',
        liveUrl: 'https://aagiis.com'
      },
      {
        id: 'oscal-cato-machine',
        name: 'OSCAL Automated cATO Dossier Generator',
        icon: '📑',
        tagline: 'Real-time telemetry to NIST 800-53 machine-readable evidence.',
        price: '$799 / mo',
        trialAvailable: true,
        actionText: 'Request Staging Key',
        liveUrl: 'https://aagiis.com'
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
        name: 'Expedite Strike & Fusion 2026 (DAST Engine)',
        icon: '⚡',
        tagline: 'Autonomous Red Teaming, ASPM & Hybrid AI AppSec with live web scanning.',
        price: '$499 / mo',
        trialAvailable: true,
        actionText: 'Launch 14-Day Sandbox',
        liveUrl: 'https://strike-2026-21.vercel.app'
      },
      {
        id: 'aegis-pentest',
        name: 'Expedite Strike Web Interface & PenTest Hub',
        icon: '🎯',
        tagline: 'Rust-accelerated attack chain execution engine and executive reporting portal.',
        price: '$899 / mo',
        trialAvailable: true,
        actionText: 'Request Demo',
        liveUrl: 'https://strike-landing-chi.vercel.app'
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
        name: 'DeskNote AI Workspace & Knowledge Engine',
        icon: '📝',
        tagline: 'AI-augmented engineering notes, technical runbooks, and secure document intelligence.',
        price: '$29 / mo',
        trialAvailable: true,
        actionText: 'Free Trial',
        liveUrl: 'https://desknote-lime.vercel.app'
      },
      {
        id: 'sphera-aibom',
        name: 'PDFAdore Suite (31+ Document & Redaction Tools)',
        icon: '📄',
        tagline: 'Zero-trust document sanitization, OCR, digital signatures, and PDF processing.',
        price: 'Free / Pro',
        trialAvailable: true,
        actionText: 'Try Suite',
        liveUrl: 'https://www.pdfadore.com/'
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
  },
  {
    id: 'sol_trades_cad_jobsite',
    title: 'Modernize Jobsite CAD, Total Station & Field Operations',
    icon: '🏗️',
    problemStatement: 'Blueprint drift between architectural revisions and field crews, uncalibrated layout measurements, and delayed subcontractor milestone sign-offs.',
    targetOutcome: 'Sub-millimeter robotic Total Station layout sync, live cloud field runbooks, and automated PDF blueprint markup across all site foremen.',
    estimatedTime: '3 - 5 Days',
    complianceFramework: 'OSHA 1926 · ISO 19650 BIM · ANSI Z87.1',
    categories: ['Enterprise', 'Cloud'],
    flywheel: {
      contentTrigger: 'Field Report: "Eliminating Rework on Commercial Timber & Steel Structural Layouts"',
      problemDefinition: 'Outdated paper blueprints and manual tape layouts cause costly structural rework.',
      solutionArchitecture: 'Combine robotic laser layout telemetry with DeskNote field logs and PDFAdore blueprint annotation.'
    },
    recommendedProducts: [
      {
        id: 'trades-desknote-field',
        name: 'DeskNote Field Log & Punch-List Workspace',
        icon: '📝',
        tagline: 'Real-time site foreman logs, inspection checklists, and crew punch-lists.',
        price: '$19 / mo',
        trialAvailable: true,
        actionText: 'Start Free Trial',
        liveUrl: 'https://desknote-lime.vercel.app'
      },
      {
        id: 'trades-pdfadore-blueprints',
        name: 'PDFAdore Blueprint Markup & Submittal Suite',
        icon: '📐',
        tagline: 'Instant blueprint merging, scale stamping, RFI redlining, and contractor sign-off.',
        price: 'Free / Enterprise',
        trialAvailable: true,
        actionText: 'Open PDF Suite',
        liveUrl: 'https://www.pdfadore.com/'
      }
    ],
    recommendedServices: [
      {
        name: 'Turnkey BIM-to-Field Total Station Calibration & Crew Onboarding',
        provider: 'ConnectIn Master Builders & Surveying Guild',
        scope: '3D Point-Cloud Site Setup, Leica/Trimble Calibration & Foreman Workflow Setup',
        price: '$4,200 / Site',
        deliveryTimeline: '5 Days'
      }
    ],
    recommendedExperts: [
      {
        name: 'Marcus Vance',
        role: 'Master Timber Framer & Structural Layout Director',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        rating: 4.99,
        reviewsCount: 142,
        hourlyRate: '$135 / hr',
        badge: 'Master Guild Fellow'
      }
    ],
    recommendedLearning: [
      {
        title: 'Robotic Total Station Layout, BIM Sync & Heavy Timber Joinery',
        provider: 'ConnectIn Trade Academy',
        duration: '12 Hours (Field Video Labs)',
        skillsGained: ['Robotic Total Station', 'BIM 360 Field', 'Blueprint Redlining', 'OSHA Site Safety']
      }
    ],
    recommendedJobs: [
      {
        title: 'Senior Commercial Site Superintendent (BIM / Layout)',
        company: 'Turner Construction',
        salary: '$145K - $175K + Bonus',
        location: 'On-Site / Regional'
      }
    ]
  },
  {
    id: 'sol_clinical_pharmacy_health',
    title: 'Clinical Pharmacy, Nursing Telemetry & Hospital Administration',
    icon: '🏥',
    problemStatement: 'Fragmented medication reconciliation, high-alert IV dosing errors, ICU nurse handoff bottlenecks, and manual HIPAA / Joint Commission audit trails across multi-facility health systems.',
    targetOutcome: 'Automated PharmD barcode medication verification (BCMA), real-time POCUS & ICU bedside nursing telemetry, Medical Aide triage workflows, and 100% Joint Commission & HIPAA compliance.',
    estimatedTime: '1 - 3 Weeks',
    complianceFramework: 'HIPAA HITECH · USP <797>/<800> · Joint Commission · HL7 FHIR R4',
    categories: ['Enterprise', 'Compliance', 'Cloud'],
    flywheel: {
      contentTrigger: 'Clinical Briefing: "Eliminating High-Alert Anticoagulant & ICU Infusion Errors via PharmD + RN Closed-Loop Telemetry"',
      problemDefinition: 'Disconnected pharmacy formularies, bedside infusion pumps, and EHR administration records create preventable adverse drug events (ADEs).',
      solutionArchitecture: 'Unify NIH DailyMed/OpenFDA drug interaction checks, MDCalc bedside dosing, and HL7 FHIR nursing/medical-aide handoff boards.'
    },
    recommendedProducts: [
      {
        id: 'nih-dailymed-rxnorm',
        name: 'NIH DailyMed & OpenFDA Clinical Pharmacology Hub',
        icon: '💊',
        tagline: 'Live FDA-approved drug labeling, IV compatibility, black-box warnings & PharmD formulary verification.',
        price: 'Free / Public Health API',
        trialAvailable: true,
        actionText: 'Open NIH DailyMed',
        liveUrl: 'https://dailymed.nlm.nih.gov/dailymed/'
      },
      {
        id: 'mdcalc-clinical-suite',
        name: 'MDCalc & PubMed Clinical Decision Support Suite',
        icon: '🩺',
        tagline: '900+ evidence-based clinical calculators, renal CrCl dosing, sepsis SOFA scores & bedside triage for MDs, RNs & PharmDs.',
        price: 'Free / Hospital Enterprise',
        trialAvailable: true,
        actionText: 'Launch MDCalc Live',
        liveUrl: 'https://www.mdcalc.com/'
      }
    ],
    recommendedServices: [
      {
        name: 'Turnkey Hospital Pharmacy USP <797>/<800>, Nursing Telemetry & Joint Commission Readiness',
        provider: 'ConnectIn Clinical Health & Hospital Administration Practice',
        scope: 'Antimicrobial Stewardship, BCMA Infusion Integration, RN/CNA Staffing Ratios & HIPAA Audit',
        price: '$9,800 / Facility',
        deliveryTimeline: '2 Weeks'
      }
    ],
    recommendedExperts: [
      {
        name: 'Dr. Kwame Mensah, PharmD, BCPS',
        role: 'Director of Clinical Pharmacy & Antimicrobial Stewardship',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
        rating: 4.99,
        reviewsCount: 164,
        hourlyRate: '$160 / hr',
        badge: 'Board Certified Pharmacotherapist'
      },
      {
        name: 'Evelyn Boateng, RN, BSN, CCRN',
        role: 'Chief Nursing Officer (CNO) & Critical Care Trauma Lead',
        avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&auto=format&fit=crop&q=80',
        rating: 4.98,
        reviewsCount: 138,
        hourlyRate: '$140 / hr',
        badge: 'CCRN Trauma Fellow'
      }
    ],
    recommendedLearning: [
      {
        title: 'Multidisciplinary Clinical Rounds: PharmD IV Dosing, ICU Nursing Triage & Hospital Admin',
        provider: 'ConnectIn Health Academy & Johns Hopkins CME',
        duration: '15 Hours (CME / CEU Accredited)',
        skillsGained: ['Vancomycin AUC Dosing', 'ICU Vasopressor Titration', 'Medical Aide Vitals Triage', 'HL7 FHIR Revenue Cycle']
      }
    ],
    recommendedJobs: [
      {
        title: 'Lead Clinical Specialist Pharmacist (Oncology / ICU) & Nurse Manager',
        company: 'Mayo Clinic / Kaiser Permanente Health Network',
        salary: '$165K - $210K + Sign-On Bonus',
        location: 'Hybrid / Major Medical Centers'
      }
    ]
  }
]


