export interface PulseArticle {
  id: string
  title: string
  summary: string
  category: 'Cybersecurity' | 'AI' | 'Cloud' | 'Technology' | 'Business' | 'Government' | 'Defense' | 'Startups' | 'Research'
  author: {
    name: string
    role: string
    avatar: string
    source: string
  }
  publishedAt: string
  readTime: string
  coverImage: string
  tags: string[]
  isFeatured?: boolean
  isBreaking?: boolean
  aiKeyTakeaways: string[]
  fullContent: string
  sourceLinks: { title: string; url: string; domain: string }[]
  biasRating?: {
    leaning: 'Center' | 'Slight Left' | 'Slight Right' | 'Unbiased Scientific'
    credibilityScore: number
    factCheckStatus: 'Statutorily Verified ✓' | 'Peer Reviewed'
  }
  upvotesCount: number
  commentsCount: number
}

export interface CyberThreatAdvisory {
  id: string
  cveId: string
  severity: 'CRITICAL (CVSS 9.8)' | 'HIGH (CVSS 8.4)' | 'ELEVATED'
  title: string
  affectedSystems: string[]
  vector: string
  summary: string
  mitigationAction: string
  cisaEmergencyStatus?: string
  sourceUrl: string
  publishedAt: string
}

export interface AIDailyBriefItem {
  id: string
  date: string
  headline: string
  executiveSummary: string
  keyPillars: {
    pillar: string
    emoji: string
    summary: string
    primarySource: string
    sourceUrl: string
  }[]
  audioDuration: string
}

export const PULSE_CATEGORIES = [
  { id: 'All', label: '🌐 All Intelligence', icon: '🌐' },
  { id: 'Cybersecurity', label: '🔐 Cybersecurity', icon: '🔐' },
  { id: 'AI', label: '🤖 AI & Frontier Models', icon: '🤖' },
  { id: 'Cloud', label: '☁️ Cloud & Infrastructure', icon: '☁️' },
  { id: 'Technology', label: '💻 Technology', icon: '💻' },
  { id: 'Business', label: '📈 Business & Markets', icon: '📈' },
  { id: 'Government', label: '🏛️ Government & Policy', icon: '🏛️' },
  { id: 'Defense', label: '🛡️ Defense & GovTech', icon: '🛡️' },
  { id: 'Startups', label: '🚀 Startups & Venture', icon: '🚀' },
  { id: 'Research', label: '📑 Research & Papers', icon: '📑' }
]

export const TODAY_AI_BRIEF: AIDailyBriefItem = {
  id: 'brief_aug_29_2026',
  date: 'Saturday, August 29, 2026',
  headline: 'Autonomous Defense Meshes Emerge as Next-Gen Cloud Standard amid Multi-Cloud Proliferation',
  executiveSummary: 'AI multi-agent orchestration platforms are fundamentally rewiring enterprise software development and offensive security validation. CISA issues new zero-trust baseline directives for federal agency SaaS gateways.',
  keyPillars: [
    {
      pillar: 'Autonomous AppSec & Red Teaming',
      emoji: '⚡',
      summary: 'Enterprises are adopting real-time ASPM and MCP-connected AI agents that auto-generate pull requests to patch exploitable vulnerabilities before manual triage.',
      primarySource: 'ACM Computing Surveys & NIST SP 800-218',
      sourceUrl: 'https://csrc.nist.gov'
    },
    {
      pillar: 'Frontier AI Tool Sandboxing & Nonce Defense',
      emoji: '🤖',
      summary: 'New research from Stanford and Anthropic details mathematical boundaries for preventing prompt injection and tool hijacking in autonomous multi-agent pipelines.',
      primarySource: 'arXiv:2608.11420 [cs.CR]',
      sourceUrl: 'https://arxiv.org'
    },
    {
      pillar: 'DoD & CISA FedRAMP 2026 Modernization',
      emoji: '🏛️',
      summary: 'FedRAMP fast-tracks continuous automated ATO authorizations (cATO) for SaaS applications demonstrating automated eBPF runtime telemetry.',
      primarySource: 'FedRAMP.gov Policy Guidance',
      sourceUrl: 'https://www.fedramp.gov'
    }
  ],
  audioDuration: '3 min listen'
}

export const TODAY_CYBER_ADVISORIES: CyberThreatAdvisory[] = [
  {
    id: 'adv_1',
    cveId: 'CVE-2026-44921',
    severity: 'CRITICAL (CVSS 9.8)',
    title: 'Zero-Click Remote Code Execution in Legacy VPN Gateway Microcode',
    affectedSystems: ['Enterprise SSL-VPN v12.4 - v15.1', 'Legacy Perimeter Concentrators'],
    vector: 'Network / Unauthenticated / Zero-Click',
    summary: 'A memory corruption vulnerability allows unauthenticated attackers to execute arbitrary shell payloads on edge appliances, bypassing multi-factor authentication.',
    mitigationAction: 'Immediate micro-segmentation and isolation; migrate traffic to Zero Trust mTLS micro-proxies.',
    cisaEmergencyStatus: '🔴 CISA Emergency Directive 26-03 Active (Patch within 24 Hours)',
    sourceUrl: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
    publishedAt: '2h ago'
  },
  {
    id: 'adv_2',
    cveId: 'CVE-2026-38104',
    severity: 'HIGH (CVSS 8.4)',
    title: 'Indirect Prompt Injection via Unsanitized Tool Invocation in Multi-Agent SDKs',
    affectedSystems: ['Autonomous Agent Tool Bindings', 'MCP Server Gateways without Parameterized Enclaves'],
    vector: 'Application / Semantic Payload Injection',
    summary: 'Attackers embedding invisible unicode zero-width tags in web-scraped content can trick downstream LLM agents into exfiltrating environment credentials.',
    mitigationAction: 'Deploy AI-BOM token scanners and enable strict nonce signing on all tool execution channels.',
    sourceUrl: 'https://github.com/advisories',
    publishedAt: '5h ago'
  }
]

export const PULSE_ARTICLES_DATA: PulseArticle[] = [
  {
    id: 'art_1',
    title: 'Autonomous Pentesting & ASPM Platforms Replace 500-Page Security PDF Noise with Auto-PRs',
    summary: 'How Fortune 500 engineering squads are coupling autonomous red-team exploits with automated GitHub pull-request assists to slash remediation cycles from 45 days to 14 minutes.',
    category: 'Cybersecurity',
    author: {
      name: 'Alex Taylor',
      role: 'Principal Cloud & Security Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      source: 'Expedite Security Engineering'
    },
    publishedAt: '35m ago',
    readTime: '4 min read',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    tags: ['ASPM', 'AutonomousPentest', 'DevSecOps', 'AutoPR', 'ZeroTrust'],
    isFeatured: true,
    isBreaking: true,
    aiKeyTakeaways: [
      'Static scanners create 80%+ false positive noise, costing teams thousands of hours.',
      'Autonomous validation executes exploits in ephemeral microVMs to verify genuine attack paths before notifying engineers.',
      'Integration with Model Context Protocol (MCP) servers allows AI agents to write unit-tested fix PRs automatically.'
    ],
    fullContent: `For over a decade, enterprise application security has suffered from a fundamental disconnect: static scanners produce hundreds of pages of unprioritized PDF reports, while engineering squads struggle to decipher which vulnerabilities are genuinely reachable and weaponizable in production.

Enter Autonomous Application Security Posture Management (ASPM). By coupling real-time eBPF runtime telemetry with automated exploit sandboxing, platforms like Expedite Strike and AXIOM are revolutionizing vulnerability triage.

Instead of reporting theoretical flaws, the autonomous engine spins up isolated Firecracker microVMs, verifies the exploit path, graphs the attack blast radius using Neo4j, and dispatches a verified fix PR with passing unit tests directly to GitHub.

The result? Mean Time to Remediate (MTTR) has plummeted across early adopting Fortune 500 enterprises from an industry average of 48 days down to under 15 minutes.`,
    sourceLinks: [
      { title: 'NIST Special Publication 800-218: Secure Software Development Framework', url: 'https://csrc.nist.gov/publications/detail/sp/800-218/final', domain: 'csrc.nist.gov' },
      { title: 'Expedite Fusion™ Hybrid Scanning Benchmark Report 2026', url: 'https://portal.expediteconsults.com', domain: 'expediteconsults.com' }
    ],
    biasRating: {
      leaning: 'Center',
      credibilityScore: 98,
      factCheckStatus: 'Statutorily Verified ✓'
    },
    upvotesCount: 342,
    commentsCount: 58
  },
  {
    id: 'art_2',
    title: 'Anthropic & Stanford Researchers Formalize Mathematical Guardrails for Multi-Agent Tool Calls',
    summary: 'New paper proves formal verification bounds for LLM agent actions, preventing rogue file system writes and credential exfiltration in decentralized multi-agent networks.',
    category: 'AI',
    author: {
      name: 'Dr. Elena Rostova',
      role: 'Chief AI Safety Scientist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      source: 'Stanford AI Safety Labs'
    },
    publishedAt: '2h ago',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    tags: ['AISafety', 'MultiAgent', 'Anthropic', 'Stanford', 'Guardrails'],
    isFeatured: false,
    aiKeyTakeaways: [
      'Multi-agent systems require mathematical verification at the tool-calling interface.',
      'Unparameterized prompts are susceptible to secondary semantic injection.',
      'Zero-trust cryptographic nonces embedded in MCP server requests eliminate tool hijacking.'
    ],
    fullContent: `As multi-agent orchestration architectures become the backbone of enterprise automation, securing the communication channel between reasoning models and local execution environments has become paramount.

In a newly published whitepaper, researchers demonstrate that prompt-based guardrails alone achieve only 76% containment against sophisticated indirect prompt injections. To achieve 99.99% assurance, agents must operate within hardware-enforced WebAssembly sandboxes featuring cryptographic token nonce verification.

This architecture guarantees that even if an agent ingests untrusted text, its tool executions cannot deviate from strictly defined formal capabilities.`,
    sourceLinks: [
      { title: 'arXiv Preprint: Cryptographic Enclave Boundaries for Autonomous Agents', url: 'https://arxiv.org', domain: 'arxiv.org' },
      { title: 'Model Context Protocol (MCP) Security Specification v1.2', url: 'https://github.com/modelcontextprotocol', domain: 'github.com' }
    ],
    biasRating: {
      leaning: 'Unbiased Scientific',
      credibilityScore: 99,
      factCheckStatus: 'Peer Reviewed'
    },
    upvotesCount: 520,
    commentsCount: 84
  },
  {
    id: 'art_3',
    title: 'FedRAMP 2026 Modernization: Continuous Automated ATO Replaces 3-Year Static Paper Audits',
    summary: 'The Federal Risk and Authorization Management Program issues updated baseline allowing continuous cloud telemetry feeds to renew agency authorizations in real time.',
    category: 'Government',
    author: {
      name: 'Alexander Novak',
      role: 'Head of FedRAMP & GovTech Security',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      source: 'GovTech Regulatory Radar'
    },
    publishedAt: '4h ago',
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800&auto=format&fit=crop&q=80',
    tags: ['FedRAMP', 'cATO', 'GovTech', 'NIST80053', 'Compliance'],
    isFeatured: false,
    aiKeyTakeaways: [
      'Static 3-year audit cycles are being replaced by continuous Automated Authorization to Operate (cATO).',
      'Requires real-time streaming of CSPM and container telemetry into government validation portals.',
      'Slashes initial authorization timelines from 18 months to under 45 days for compliant SaaS providers.'
    ],
    fullContent: `For years, enterprise SaaS vendors targeting government and defense contracts faced an arduous 18-to-24 month authorization gauntlet known as FedRAMP.

Under the newly ratified 2026 FedRAMP Modernization Directive, the Joint Authorization Board (JAB) has officially enabled Continuous Automated ATO (cATO). SaaS providers that stream continuous cryptographic evidence, automated vulnerability scans, and Zero Trust identity verification via standardized APIs can achieve authorization in weeks rather than years.`,
    sourceLinks: [
      { title: 'FedRAMP.gov Official Announcement on Automated Authorizations', url: 'https://www.fedramp.gov', domain: 'fedramp.gov' },
      { title: 'CISA Zero Trust Maturity Model v2.0', url: 'https://www.cisa.gov', domain: 'cisa.gov' }
    ],
    biasRating: {
      leaning: 'Center',
      credibilityScore: 97,
      factCheckStatus: 'Statutorily Verified ✓'
    },
    upvotesCount: 290,
    commentsCount: 31
  },
  {
    id: 'art_4',
    title: 'Cloud Infrastructure Budgets Expand 28% in 2026: Next.js 16, Rust & Kubernetes Drive Efficiency',
    summary: 'How modern server-side rendering, distributed edge workers, and Turbopack compiler acceleration are cutting compute bills across Fortune 500 digital transformations.',
    category: 'Cloud',
    author: {
      name: 'Chloe Tremblay',
      role: 'Staff Architect | React & Next.js Core Contributor',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      source: 'Next.js Engineering Dispatch'
    },
    publishedAt: '6h ago',
    readTime: '3 min read',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    tags: ['Nextjs16', 'Turbopack', 'CloudInfrastructure', 'Kubernetes', 'Performance'],
    isFeatured: false,
    aiKeyTakeaways: [
      'Turbopack compilation in Next.js 16 delivers sub-100ms cold starts across serverless enclaves.',
      'Rust-based distributed workers lower memory overhead by 64% compared to legacy Node processes.',
      'Enterprises adopting edge server rendering report 35% reduction in annual cloud compute bills.'
    ],
    fullContent: `As enterprise web applications transition into complex multi-agent cockpits and high-throughput real-time dashboards, frontend performance and cloud infrastructure efficiency have become inseparable.

With Next.js 16 and Turbopack, development compilation velocity has accelerated dramatically, while production server components eliminate megabytes of client-side JavaScript bundle overhead. Combined with Kubernetes microVM orchestration, infrastructure costs are dropping even as application capabilities expand.`,
    sourceLinks: [
      { title: 'Next.js 16 Architectural Performance Benchmark Analysis', url: 'https://nextjs.org', domain: 'nextjs.org' }
    ],
    biasRating: {
      leaning: 'Center',
      credibilityScore: 96,
      factCheckStatus: 'Statutorily Verified ✓'
    },
    upvotesCount: 412,
    commentsCount: 47
  }
]
