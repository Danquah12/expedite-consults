export interface MarketplaceProduct {
  id: string
  name: string
  tagline: string
  category: 'Software' | 'Services' | 'Training' | 'Enterprise Solutions'
  subCategory: string
  icon: string
  badge?: string
  rating: number
  reviewsCount: number
  activeUsersCount?: string
  pricing: {
    displayPrice: string
    billingPeriod: string
    hasFreeTrial: boolean
    trialDays?: number
  }
  vendor: {
    name: string
    logo: string
    isVerified: boolean
    isFellow?: boolean
  }
  overview: string
  features: { title: string; desc: string }[]
  screenshots: string[]
  demoUrl?: string
  architecture: {
    title: string
    summary: string
    layers: string[]
    latency: string
    dataPrivacy: string
  }
  integrations: string[]
  security: {
    compliance: string[]
    encryption: string
    isolation: string
  }
  pricingTiers: {
    name: string
    price: string
    period: string
    description: string
    features: string[]
    recommended?: boolean
    ctaText: string
  }[]
  reviews: {
    author: string
    role: string
    company: string
    avatar: string
    rating: number
    text: string
    date: string
  }[]
  documentation: {
    quickstart: string
    apiEndpoints: string[]
    sdkSupport: string[]
  }
  caseStudies: {
    customer: string
    logo: string
    headline: string
    results: string[]
  }[]
  support: {
    sla: string
    channel: string
    responseHours: string
  }
}

export const MARKETPLACE_CATEGORIES_CONFIG = [
  {
    id: 'Software',
    label: '💻 Software',
    subCategories: ['All Software', 'Cybersecurity', 'AI', 'Cloud', 'DevSecOps', 'Data', 'Productivity', 'Business']
  },
  {
    id: 'Services',
    label: '🛠️ Services',
    subCategories: ['All Services', 'Consulting', 'Penetration Testing', 'Security Assessments', 'Cloud Assessments', 'Compliance', 'Architecture']
  },
  {
    id: 'Training',
    label: '🎓 Training',
    subCategories: ['All Training', 'Courses', 'Certifications', 'Labs', 'Bootcamps']
  },
  {
    id: 'Enterprise Solutions',
    label: '🏢 Enterprise Solutions',
    subCategories: ['All Enterprise', 'SaaS', 'APIs', 'Security platforms', 'Enterprise software']
  }
]

export const MASTER_MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'axiom_ai',
    name: 'AXIOM AI-Powered Cyber Suite',
    tagline: 'Autonomous AI Threat Detection, Posture Correlation & Exploit Neutralization',
    category: 'Software',
    subCategory: 'Cybersecurity',
    icon: '⚡',
    badge: '🔥 Flagship AI Platform',
    rating: 4.98,
    reviewsCount: 218,
    activeUsersCount: '14,800+ Active Nodes',
    pricing: {
      displayPrice: '$499',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Consults Core Labs',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'AXIOM is an enterprise-grade agentic AI security platform combining continuous ASPM telemetry, real-time eBPF microVM monitoring, and automated remediation PR generation to secure hybrid cloud ecosystems.',
    features: [
      { title: 'Autonomous Multi-Agent Pentesting', desc: 'Weaponized exploit validation safely sandboxed to verify zero false positives.' },
      { title: 'AI-BOM & LLM Guardrails', desc: 'Scan training pipelines, tokenized prompts, and third-party AI agents for prompt injections and nonce bypasses.' },
      { title: 'Checkmarx MCP & GitHub Auto-PR Assist', desc: 'Generates secure pull requests with unit tests directly in your CI/CD repository.' },
      { title: 'Neo4j Blast Radius Graphing', desc: 'Visualizes attack choke points and identity privilege escalation paths in real time.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
    ],
    demoUrl: 'http://localhost:9012/',
    architecture: {
      title: 'Decentralized MicroVM Agent Mesh',
      summary: 'Runs telemetry collectors in lightweight WebAssembly enclaves while aggregating cryptographic attack graphs via Rust distributed workers.',
      layers: ['Next.js 16 Web Dashboard', 'GraphQL & MCP Server Gateway', 'Neo4j Blast Radius Engine', 'eBPF Kernel Telemetry'],
      latency: '< 18ms real-time event pipeline',
      dataPrivacy: 'Zero customer source code retention, 100% on-prem / sovereign VPC capable.'
    },
    integrations: ['AWS Security Hub', 'Checkmarx MCP', 'Slack', 'Jira Software', 'GitHub Actions', 'Datadog', 'Splunk SIEM', 'Kubernetes'],
    security: {
      compliance: ['SOC 2 Type II', 'FedRAMP High Ready', 'HIPAA BAA Compliant', 'ISO 27001'],
      encryption: 'AES-256-GCM at rest · TLS 1.3 mTLS with hardware TPM keys',
      isolation: 'Dedicated tenant enclave per enterprise deployment'
    },
    pricingTiers: [
      {
        name: 'Starter Cloud',
        price: '$499',
        period: '/ month',
        description: 'Ideal for fast-scaling engineering teams securing up to 50 cloud repositories.',
        features: ['Up to 50 Repositories', 'Continuous AI-BOM Scanning', 'Checkmarx MCP Integration', 'Slack & Jira Realtime Alerts', '14-Day Free Trial'],
        ctaText: 'Start 14-Day Free Trial'
      },
      {
        name: 'Enterprise Scale',
        price: '$1,850',
        period: '/ month',
        description: 'Full autonomous offensive validation, blast radius choke point graphs, and auto-PR assists.',
        recommended: true,
        features: ['Unlimited Repositories & MicroVMs', 'Autonomous Weaponized Exploit Queue', 'Neo4j Blast Radius Attack Graphs', 'Custom MCP Tool Server Connectors', '24/7 Dedicated Cyber Engineer SLA'],
        ctaText: 'Buy Enterprise License'
      },
      {
        name: 'Defense Enclave (On-Prem)',
        price: 'Custom',
        period: 'annual contract',
        description: 'Air-gapped sovereign deployment with FIPS 140-3 hardware enclave support.',
        features: ['Air-Gapped / IL-5 / IL-6 Ready', 'Dedicated Custom LLM Fine-Tuning', 'Continuous ATO Compliance Pack', 'Direct Engineering Hotline'],
        ctaText: 'Contact Defense Solutions'
      }
    ],
    reviews: [
      {
        author: 'Marcus Vance',
        role: 'VP of Information Security',
        company: 'CloudScale Global',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'AXIOM cut our vulnerability triage time by 78%. The auto-PR generator writes cleaner code and tests than our tier 2 security analysts.',
        date: 'August 2026'
      },
      {
        author: 'Dr. Elena Rostova',
        role: 'Chief AI Safety Scientist',
        company: 'Stanford AI Labs',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'The AI-BOM and prompt injection validation features are lightyears ahead of standard static scanners. Essential for agentic systems.',
        date: 'July 2026'
      }
    ],
    documentation: {
      quickstart: 'npm install @expedite/axiom-agent && npx axiom init --token=$EXPEDITE_KEY',
      apiEndpoints: ['POST /api/v1/scan/hybrid', 'POST /api/v1/exploit/sandbox-verify', 'GET /api/v1/graph/blast-radius'],
      sdkSupport: ['TypeScript / Node.js', 'Python 3.12+', 'Go 1.23+', 'Rust']
    },
    caseStudies: [
      {
        customer: 'Horizon FinTech Group',
        logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
        headline: 'Automated 100% of SOC2 Type II AppSec Evidence for Series B Audit',
        results: ['Zero critical vulnerabilities in production', '600+ engineer hours saved annually', 'Instant board PDF reports']
      }
    ],
    support: {
      sla: '99.99% Availability Guarantee',
      channel: 'Dedicated Slack Connect Channel & Encrypted Ticket Terminal',
      responseHours: '< 15 Minutes for P1 Security Incidents'
    }
  },
  {
    id: 'aegis_pentest',
    name: 'ÆGIS · SOC Autonomous PenTest Hub',
    tagline: 'Full Autonomous Agentic AI Penetration Testing & Exploit Hub',
    category: 'Software',
    subCategory: 'Cybersecurity',
    icon: '🎯',
    badge: '⭐ Red Team Certified',
    rating: 4.95,
    reviewsCount: 164,
    activeUsersCount: '8,400+ Targets Scanned',
    pricing: {
      displayPrice: '$349',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Offensive Red Team',
      logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Autonomous agentic AI penetration testing console featuring multi-target asset discovery, weaponized auto-exploit queues, PoC interactive evidence terminals, and Neo4j attack graphs.',
    features: [
      { title: 'Autonomous Reconnaissance', desc: 'Discovers subdomains, exposed cloud buckets, and API endpoints across multi-cloud assets.' },
      { title: 'Interactive Evidence Terminal', desc: 'Inspects HTTP payloads, shell returns, and cryptographic proofs in a browser terminal.' },
      { title: 'Zero-Noise PoC Validation', desc: 'Validates that every single flagged CVE is genuinely exploitable before reporting.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    ],
    demoUrl: 'http://localhost:9011/app/?standalone=1',
    architecture: {
      title: 'Sandboxed Exploit Execution MicroVMs',
      summary: 'Isolated Firecracker microVMs executing parameterized exploit modules without touching production data.',
      layers: ['Next.js Terminal Interface', 'Docker / Firecracker Sandbox', 'Neo4j Target Graph'],
      latency: '< 50ms command execution',
      dataPrivacy: 'Encrypted ephemeral evidence storage destroyed post-report.'
    },
    integrations: ['Jira', 'GitHub Issues', 'Slack', 'Splunk', 'AWS GuardDuty'],
    security: {
      compliance: ['ISO 27001', 'SOC 2 Type II'],
      encryption: 'End-to-End PGP & AES-256',
      isolation: 'Ephemeral container isolation'
    },
    pricingTiers: [
      {
        name: 'Target Pack 10',
        price: '$349',
        period: '/ month',
        description: 'Scan up to 10 root domains with unlimited continuous scheduled pentests.',
        features: ['10 Target Domains', 'Continuous Scheduled Scans', 'Evidence PoC Terminal', 'PDF Board Dossiers'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Red Team Unlimited',
        price: '$999',
        period: '/ month',
        recommended: true,
        description: 'Unlimited external and internal target IPs, priority exploit queues, and live chat assistance.',
        features: ['Unlimited Targets', 'Custom Exploit Module Builder', 'API & CI/CD Gating', 'Dedicated Offensive Engineer Support'],
        ctaText: 'Activate Unlimited'
      }
    ],
    reviews: [
      {
        author: 'David Sterling',
        role: 'Principal Red Team Lead',
        company: 'Apex Defense',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'The automatic exploit verification proves to clients without doubt that vulnerabilities are real, completely eliminating back-and-forth arguments.',
        date: 'August 2026'
      }
    ],
    documentation: {
      quickstart: 'curl -sSL https://portal.expediteconsults.com/install-aegis.sh | bash',
      apiEndpoints: ['POST /api/pentest/target', 'GET /api/pentest/evidence/:id'],
      sdkSupport: ['Python', 'CLI', 'REST']
    },
    caseStudies: [
      {
        customer: 'Quantico Capital',
        logo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        headline: 'Eliminated $180k in third-party penetration testing vendor costs',
        results: ['100% automated weekly audits', 'Discovered critical SSRF before production launch']
      }
    ],
    support: {
      sla: '99.9% Uptime',
      channel: 'Red Team Priority Discord & Slack Connect',
      responseHours: '< 30 Minutes'
    }
  },
  {
    id: 'serv_fractional_ciso',
    name: 'Fractional CISO & Zero Trust Transformation',
    tagline: 'Executive Cyber Leadership, Zero-Trust Roadmaps & Regulatory Defense',
    category: 'Services',
    subCategory: 'Consulting',
    icon: '👔',
    badge: '⭐ Premier Advisory',
    rating: 5.0,
    reviewsCount: 48,
    pricing: {
      displayPrice: '$350',
      billingPeriod: '/ hr (or $5,000 retainer)',
      hasFreeTrial: false
    },
    vendor: {
      name: 'Alex Taylor (Expedite Senior Fellow)',
      logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'Retain a verified Principal Security Architect and former Fortune 500 CISO to lead your executive security strategy, prepare for Series B/C cyber due diligence, and eliminate perimeter VPNs.',
    features: [
      { title: 'Zero Trust Multi-Cloud Architecture Review', desc: 'Comprehensive micro-segmentation blueprint across AWS, GCP, and Kubernetes.' },
      { title: 'SOC 2 Type II & FedRAMP Readiness', desc: 'End-to-end policy, evidence mapping, and auditor defense sessions.' },
      { title: 'Board Cyber Deck & Investor Briefings', desc: 'Quarterly executive board slides translating technical telemetry into business risk.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Zero Trust Governance Framework',
      summary: 'Architectural blueprints following NIST SP 800-207 and DoD Zero Trust Reference Architecture.',
      layers: ['Identity (Okta / Entra)', 'Edge Micro-segmentation (Cloudflare / Zscaler)', 'eBPF Workload Telemetry'],
      latency: 'Advisory Cadence: Weekly Sprint Alignment',
      dataPrivacy: 'Strict NDA & Attorney-Client Privilege Protection Available'
    },
    integrations: ['AWS', 'GCP', 'Okta', 'Jira', 'Notion', 'Google Workspace'],
    security: {
      compliance: ['CISSP Certified', 'CCSP Certified', 'FedRAMP 3PAO Lead'],
      encryption: 'Encrypted Enclave Delivery',
      isolation: 'Dedicated Consulting Workspace'
    },
    pricingTiers: [
      {
        name: 'Advisory Retainer',
        price: '$5,000',
        period: '/ month',
        description: '15 Hours of monthly executive leadership, weekly syncs, and architecture reviews.',
        features: ['Weekly 1:1 Executive Sync', 'Architecture Review of up to 4 Systems', 'Quarterly Board Deck Preparation', 'Slack Hotline Access'],
        recommended: true,
        ctaText: 'Book Advisory Retainer'
      },
      {
        name: 'Hourly Deep-Dive',
        price: '$350',
        period: '/ hour',
        description: 'Targeted architectural consultation for specific cloud migrations or audit fire drills.',
        features: ['1-on-1 Deep-Dive Session', 'Written Architectural Decision Record', 'Vulnerability Assessment Review'],
        ctaText: 'Book Consultation Hour'
      }
    ],
    reviews: [
      {
        author: 'Victoria Hastings',
        role: 'CTO',
        company: 'Horizon FinTech Systems',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'Alex navigated our SOC 2 Type II audit in under 60 days with zero non-conformances. Highly recommended.',
        date: 'June 2026'
      }
    ],
    documentation: {
      quickstart: 'Schedule initial 30-min discovery call via ConnectIn Calendar.',
      apiEndpoints: ['N/A (Human Executive Service)'],
      sdkSupport: ['Direct Slack / Google Meet']
    },
    caseStudies: [
      {
        customer: 'CyberNova Infrastructure',
        logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        headline: 'Migrated 12,000 corporate seats to Zero Trust in 4 months',
        results: ['Eliminated legacy VPN costs by $420k/yr', 'Zero credential stuffing breaches']
      }
    ],
    support: {
      sla: 'Same-day response for retained clients',
      channel: 'Direct WhatsApp / Slack Hotline',
      responseHours: '< 2 Hours'
    }
  },
  {
    id: 'train_zerotrust_masterclass',
    name: 'Zero Trust & Cloud Defense Masterclass',
    tagline: 'Hands-on Weaponized Lab Certification for Senior Architects & Engineers',
    category: 'Training',
    subCategory: 'Certifications',
    icon: '🎓',
    badge: '🏆 Verified Certificate',
    rating: 4.97,
    reviewsCount: 312,
    activeUsersCount: '4,200+ Enrolled Engineers',
    pricing: {
      displayPrice: '$199',
      billingPeriod: 'one-time (Lifetime Access)',
      hasFreeTrial: true,
      trialDays: 7
    },
    vendor: {
      name: 'ConnectIn Academy & O\'Reilly Partner',
      logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Comprehensive hands-on training with 12 interactive cloud sandbox labs, eBPF telemetry engineering, and NIST 800-207 Zero Trust architectural blueprints.',
    features: [
      { title: '12 Live Interactive Sandbox Terminals', desc: 'Practice real exploit attacks and mitigation directly in your browser.' },
      { title: 'Verifiable ConnectIn Credential Badge', desc: 'Automatically embeds into your ConnectIn profile and signals to recruiters.' },
      { title: 'Production Terraform & Kubernetes Blueprints', desc: 'Downloadable open-source modules ready to deploy into enterprise environments.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Browser-Based WebAssembly Terminals',
      summary: 'Instant microVM spinning up in < 2 seconds with live attack generation.',
      layers: ['Next.js Video Player', 'Xterm.js Web Terminal', 'Docker Cloud Enclave'],
      latency: '< 10ms browser interaction',
      dataPrivacy: 'Individual sandbox isolation'
    },
    integrations: ['GitHub Classroom', 'ConnectIn Profile Badge Sync', 'LinkedIn Credential URL'],
    security: {
      compliance: ['NIST 800-207 Aligned', 'DoD Zero Trust Pillars Aligned'],
      encryption: 'TLS 1.3 Streaming',
      isolation: 'Student Sandbox Enclave'
    },
    pricingTiers: [
      {
        name: 'Individual Masterclass',
        price: '$199',
        period: 'one-time',
        description: 'Lifetime access to all 12 modules, interactive labs, and verified certificate.',
        features: ['12 High-Definition Video Modules', '12 Interactive Sandbox Labs', 'Verifiable Profile Credential', 'Community Discord Access'],
        recommended: true,
        ctaText: 'Enroll Now ($199)'
      },
      {
        name: 'Enterprise Team Pass',
        price: '$1,499',
        period: 'up to 10 seats',
        description: 'Upskill your entire engineering squad with team progress dashboards and instructor Q&A.',
        features: ['10 Student Licenses', 'Manager Progress Dashboard', 'Monthly Live Instructor Office Hours', 'Custom Enterprise Labs'],
        ctaText: 'Get Team Pass'
      }
    ],
    reviews: [
      {
        author: 'Kavita Patel',
        role: 'Director of Cloud Governance',
        company: 'CyberNova',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'The best Zero Trust masterclass available. The hands-on eBPF labs gave me the exact skills needed to lead our company-wide migration.',
        date: 'August 2026'
      }
    ],
    documentation: {
      quickstart: 'Instant access after enrollment. No software install required.',
      apiEndpoints: ['GET /api/academy/progress', 'POST /api/academy/sandbox/start'],
      sdkSupport: ['Browser (Any OS)']
    },
    caseStudies: [
      {
        customer: 'Atlassian Cyber Labs',
        logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80',
        headline: 'Upskilled 40+ staff architects across 3 continents',
        results: ['100% passing rate on Zero Trust architecture assessments', 'Immediate application to cloud products']
      }
    ],
    support: {
      sla: 'Instructor Q&A in community forums',
      channel: 'Academy Student Discord & Help Desk',
      responseHours: '< 6 Hours'
    }
  },
  {
    id: 'veritaslens_enterprise',
    name: 'VeritasLens Media Intelligence & Bias Radar',
    tagline: 'Clustered Media Bias, Blindspot Intelligence & Statutory Fact Verification',
    category: 'Enterprise Solutions',
    subCategory: 'SaaS',
    icon: '🔍',
    badge: '🌐 Global Newsroom Suite',
    rating: 4.96,
    reviewsCount: 189,
    activeUsersCount: '14 Newsrooms & 52k Readers',
    pricing: {
      displayPrice: '$149',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Consults Information Lab',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Real-time clustering across 14 newsrooms, blindspot detection, statutory fact verification, and LLM-powered narrative discrepancy scoring.',
    features: [
      { title: '14-Newsroom Real-Time Clustering', desc: 'Aggregates Reuters, AP, WSJ, BBC, and independent publishers with automatic duplicate event clustering.' },
      { title: 'Blindspot Radar Matrix', desc: 'Pinpoints critical stories covered exclusively by left-leaning or right-leaning outlets.' },
      { title: 'Statutory Claim Verifier', desc: 'Cross-checks politician and executive quotes against official regulatory and legal records.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80'
    ],
    demoUrl: 'https://expedite-consults.vercel.app/veritaslens',
    architecture: {
      title: 'Semantic Vector Clustering Pipeline',
      summary: 'Processes 40,000+ articles daily using cosine similarity clustering and automated bias extraction.',
      layers: ['Next.js 16 Interface', 'Vector Similarity Microservice', 'PostgreSQL TimescaleDB'],
      latency: '< 400ms cluster latency',
      dataPrivacy: 'Public newsroom syndication with RSS & API connectors'
    },
    integrations: ['Slack', 'Reuters API', 'Bloomberg Terminal', 'Notion', 'Zapier'],
    security: {
      compliance: ['Statutory Fact Checking Standards', 'GDPR Compliant'],
      encryption: 'TLS 1.3 Transport',
      isolation: 'Multi-Tenant Cloud'
    },
    pricingTiers: [
      {
        name: 'Professional Newsroom',
        price: '$149',
        period: '/ month',
        description: 'Full access to bias clustering, blindspot radar, and statutory claim search.',
        features: ['14 Newsrooms Clustered', 'Blindspot Matrix Alerts', 'Statutory Fact Checker', 'Daily AI Executive Briefing'],
        recommended: true,
        ctaText: 'Start 14-Day Trial'
      },
      {
        name: 'Enterprise Media Syndication',
        price: '$650',
        period: '/ month',
        description: 'Direct API feeds, custom newsroom scrapers, and white-label widget embedding.',
        features: ['Full REST API Access', 'Custom Feed Ingestion', 'White-Label Embeds', 'Unlimited Team Seats'],
        ctaText: 'Activate API Access'
      }
    ],
    reviews: [
      {
        author: 'Sarah Lin',
        role: 'Senior Investigative Editor',
        company: 'Global Policy Review',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'VeritasLens has become indispensable for our morning editorial meetings. The blindspot radar instantly exposes stories our competitors are missing.',
        date: 'August 2026'
      }
    ],
    documentation: {
      quickstart: 'curl -H "Authorization: Bearer $VL_KEY" https://expedite-consults.vercel.app/api/veritaslens',
      apiEndpoints: ['GET /api/veritaslens/clusters', 'POST /api/veritaslens/verify'],
      sdkSupport: ['REST', 'Python', 'Node.js']
    },
    caseStudies: [
      {
        customer: 'Atlantic Intelligence Consortium',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
        headline: 'Automated Daily Geopolitical Bias Tracking Across 8 Nations',
        results: ['Real-time discrepancy alerts', '85% faster statutory quote verification']
      }
    ],
    support: {
      sla: '99.9% API Uptime',
      channel: 'Developer Support Portal & Dedicated Email',
      responseHours: '< 1 Hour'
    }
  },
  {
    id: 'expedite_fusion',
    name: 'Expedite Strike & Fusion 2026',
    tagline: 'Autonomous Pentest, ASPM & Hybrid AI Offensive Security Suite',
    category: 'Software',
    subCategory: 'Cybersecurity',
    icon: '⚡',
    badge: '🏆 Enterprise Flagship',
    rating: 4.99,
    reviewsCount: 284,
    activeUsersCount: '22,400+ Repos Secured',
    pricing: {
      displayPrice: '$499',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Consults Enterprise',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'Enterprise offensive security suite with hybrid scanning, AI-BOM LLM scanner, Checkmarx MCP server, Triage auto-PR assist, XM Cyber choke point graphs, and 10-section board PDF dossiers.',
    features: [
      { title: 'Autonomous Multi-Target Discovery', desc: 'Instant discovery across AWS, GCP, Azure, and on-prem IP ranges.' },
      { title: 'AI-BOM & LLM Tool Security', desc: 'Inspects third-party AI agents and tool bindings for prompt injections and data leaks.' },
      { title: 'Checkmarx MCP Server', desc: 'Syncs findings directly to Anthropic Claude & Gemini agent developer workflows.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    ],
    demoUrl: 'http://localhost:9012/',
    architecture: {
      title: 'Hybrid Offensive Orchestrator',
      summary: 'Connects DAST, SAST, and real-time eBPF sensors into a unified event bus with automated PR mitigation.',
      layers: ['Cloud Dashboard', 'MCP Tool Bus', 'Neo4j Graph Core', 'eBPF Sensor Agents'],
      latency: '< 15ms stream latency',
      dataPrivacy: 'Enterprise tenant VPC boundary isolation'
    },
    integrations: ['AWS Security Hub', 'Checkmarx MCP', 'Slack', 'Jira', 'Splunk', 'Datadog'],
    security: {
      compliance: ['SOC 2 Type II', 'FedRAMP High Ready', 'NIST SP 800-53'],
      encryption: 'FIPS 140-3 Cryptographic Core',
      isolation: 'Sovereign Tenant Enclaves'
    },
    pricingTiers: [
      {
        name: 'Enterprise Cloud',
        price: '$499',
        period: '/ month',
        description: 'Full hybrid offensive scanning, AI-BOM guardrails, and Auto-PR assist.',
        features: ['50 Cloud Repositories', 'AI-BOM Scanner', 'Checkmarx MCP Server', '14-Day Free Trial'],
        recommended: true,
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Defense Enclave',
        price: '$2,400',
        period: '/ month',
        description: 'Unlimited repositories, on-prem hardware enclaves, and 24/7 Red Team escalation.',
        features: ['Unlimited Targets', 'Air-Gapped Sovereign Deployment', 'Continuous ATO Pack', 'Dedicated Cyber Architect'],
        ctaText: 'Deploy Defense Enclave'
      }
    ],
    reviews: [
      {
        author: 'Dr. Liam O’Connor',
        role: 'Head of Quantum Cryptography',
        company: 'DARPA Partner Group',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'Expedite Strike & Fusion replaced 4 separate scanning vendors and gave our leadership instant board dossiers.',
        date: 'July 2026'
      }
    ],
    documentation: {
      quickstart: 'npm install @expedite/strike-fusion && npx expedite auth',
      apiEndpoints: ['POST /api/v1/strike/scan', 'GET /api/v1/fusion/dossier'],
      sdkSupport: ['Node.js', 'Python', 'Go', 'Rust']
    },
    caseStudies: [
      {
        customer: 'Apex Defense Labs',
        logo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
        headline: 'Automated 100% of Continuous Pentesting Across 85 Microservices',
        results: ['Zero breached credentials', '94% automated PR remediation']
      }
    ],
    support: {
      sla: '99.99% Availability Guarantee',
      channel: 'Dedicated Slack Connect & Encrypted Ticket Terminal',
      responseHours: '< 15 Minutes'
    }
  }
]
