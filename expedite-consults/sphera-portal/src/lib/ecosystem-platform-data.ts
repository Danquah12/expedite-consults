export interface DeveloperAPIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'MCP'
  endpoint: string
  title: string
  description: string
  category: 'Intelligence' | 'Auth & RBAC' | 'Jobs & Match' | 'Marketplace' | 'Peer Review'
  sampleResponse: string
}

export interface DeveloperSDK {
  language: string
  icon: string
  packageName: string
  installCommand: string
  version: string
  downloadsCount: string
  githubUrl: string
}

export interface EnterpriseIntegration {
  id: string
  name: string
  category: 'Cloud' | 'DevOps & Code' | 'ITSM & Ticketing' | 'SIEM & SOC'
  icon: string
  provider: string
  status: 'Connected' | 'Ready to Connect' | 'Enterprise Addon'
  description: string
  capabilities: string[]
  docsUrl: string
}

export interface EcosystemPartner {
  id: string
  name: string
  partnerType: 'Technology Partner' | 'Consulting Partner' | 'Reseller & Distributor'
  logo: string
  tier: 'Global Strategic' | 'Premier Federal' | 'Authorized Gold'
  specialization: string
  jointOfferings: string[]
  contactActionText: string
}

export interface EcosystemCommunity {
  id: string
  name: string
  category: 'Cybersecurity' | 'AI' | 'Cloud' | 'Developers'
  icon: string
  membersCount: number
  activeDiscussions: number
  leadCurator: string
  description: string
  recentTopic: string
}

export interface ThirdPartyApp {
  id: string
  name: string
  developerName: string
  icon: string
  category: 'Security Utility' | 'AI Agent' | 'Compliance Automation' | 'DevOps Connector'
  rating: number
  installsCount: string
  description: string
  isVerifiedEcosystem: boolean
  isInstalled?: boolean
}

export const DEVELOPER_APIS_DATA: DeveloperAPIEndpoint[] = [
  {
    method: 'MCP',
    endpoint: 'mcp://api.connectin.com/v1/tools/security-audit',
    title: 'Model Context Protocol (MCP) Autonomous AppSec Tool Bindings',
    description: 'Dispatch real-time zero-trust audits, prompt injection scans, and auto-PR fixes with cryptographic nonce validation.',
    category: 'Intelligence',
    sampleResponse: `{\n  "status": "success",\n  "mcp_protocol": "2026.1",\n  "verified_nonce": "0x9842aef912",\n  "audit_results": {\n    "vulnerabilities_found": 0,\n    "passed_checks": 42,\n    "cato_evidence_ready": true\n  }\n}`
  },
  {
    method: 'GET',
    endpoint: '/api/v1/intelligence/pulse/radar',
    title: 'Real-Time Cyber Threat Radar & CISA Emergency Directives',
    description: 'Stream structured CVE alerts, blast-radius matrices, and automated remediation playbooks directly into your SIEM.',
    category: 'Intelligence',
    sampleResponse: `{\n  "cve_id": "CVE-2026-44921",\n  "severity": "CRITICAL",\n  "cvss_score": 9.8,\n  "affected_component": "Multi-Cloud Ingress Gateway",\n  "remediation_status": "PATCH_AVAILABLE"\n}`
  },
  {
    method: 'POST',
    endpoint: '/api/v1/marketplace/licenses/provision',
    title: 'Instant Marketplace License Key & Staging Sandbox Provisioner',
    description: 'Programmatically spin up 14-day evaluation licenses and ephemeral Firecracker MicroVM sandboxes for vendor apps.',
    category: 'Marketplace',
    sampleResponse: `{\n  "license_key": "CIN-AXIOM-9924-STAGING",\n  "expiry_utc": "2026-09-12T21:00:00Z",\n  "sandbox_url": "https://sandbox-9942.connectin.internal"\n}`
  },
  {
    method: 'GET',
    endpoint: '/api/v1/talent/match/careertwin',
    title: 'AI Semantic Candidate Matching & Capability Graph API',
    description: 'Query candidates based on verified peer review ratings, clearance levels, and benchmark code assessments.',
    category: 'Jobs & Match',
    sampleResponse: `{\n  "candidates_matched": 14,\n  "top_profile": {\n    "name": "Alex Taylor",\n    "match_score": 98.4,\n    "verified_skills": ["Zero Trust", "AWS GovCloud", "eBPF"],\n    "peer_review_rating": 4.98\n  }\n}`
  }
]

export const DEVELOPER_SDKS_DATA: DeveloperSDK[] = [
  {
    language: 'TypeScript / Node.js',
    icon: '🟦',
    packageName: '@connectin/sdk',
    installCommand: 'npm install @connectin/sdk',
    version: 'v2.4.0',
    downloadsCount: '48.2k / wk',
    githubUrl: 'https://github.com/Danquah12/expedite-consults'
  },
  {
    language: 'Python',
    icon: '🐍',
    packageName: 'connectin-py',
    installCommand: 'pip install connectin-py',
    version: 'v2.4.0',
    downloadsCount: '62.8k / wk',
    githubUrl: 'https://github.com/Danquah12/expedite-consults'
  },
  {
    language: 'Go',
    icon: '🐹',
    packageName: 'github.com/connectin/go-sdk',
    installCommand: 'go get github.com/connectin/go-sdk',
    version: 'v1.9.2',
    downloadsCount: '24.1k / wk',
    githubUrl: 'https://github.com/Danquah12/expedite-consults'
  },
  {
    language: 'Rust',
    icon: '🦀',
    packageName: 'connectin-rs',
    installCommand: 'cargo add connectin-rs',
    version: 'v0.8.4',
    downloadsCount: '19.6k / wk',
    githubUrl: 'https://github.com/Danquah12/expedite-consults'
  }
]

export const ENTERPRISE_INTEGRATIONS_DATA: EnterpriseIntegration[] = [
  {
    id: 'int_aws',
    name: 'Amazon Web Services (AWS & GovCloud)',
    category: 'Cloud',
    icon: '☁️',
    provider: 'Amazon Web Services',
    status: 'Connected',
    description: 'Native telemetry ingestion from GuardDuty, Security Hub, and multi-account AWS Organizations with automated cATO OSCAL sync.',
    capabilities: ['GovCloud US-East & US-West Support', 'GuardDuty Automated Remediation', 'IAM OIDC Least-Privilege Asserter'],
    docsUrl: '#'
  },
  {
    id: 'int_azure',
    name: 'Microsoft Azure & Sentinel',
    category: 'Cloud',
    icon: '🔷',
    provider: 'Microsoft Corporation',
    status: 'Connected',
    description: 'Bi-directional incident sync with Microsoft Sentinel SIEM, Microsoft Defender for Cloud posture, and Entra ID Conditional Access.',
    capabilities: ['Microsoft Sentinel Analytics Rules', 'Defender for Cloud Score Sync', 'Entra ID Risk-Based Auth'],
    docsUrl: '#'
  },
  {
    id: 'int_gcp',
    name: 'Google Cloud & Chronicle SIEM',
    category: 'Cloud',
    icon: '🌐',
    provider: 'Google Cloud Platform',
    status: 'Ready to Connect',
    description: 'Real-time telemetry feeds into Chronicle SIEM with automated Security Command Center finding triage.',
    capabilities: ['Chronicle UDM Log Forwarder', 'Security Command Center Auto-PR', 'Assured Workloads Gov Mode'],
    docsUrl: '#'
  },
  {
    id: 'int_github',
    name: 'GitHub Enterprise & Actions',
    category: 'DevOps & Code',
    icon: '🐙',
    provider: 'GitHub Inc.',
    status: 'Connected',
    description: 'Checkmarx MCP Server integration, auto-PR code fix dispatcher, and GitHub Actions security scanning workflows.',
    capabilities: ['Automated PR Fix Dispatcher', 'AI-BOM Container Scanning Step', 'Branch Protection Policy Validator'],
    docsUrl: '#'
  },
  {
    id: 'int_servicenow',
    name: 'ServiceNow ITSM & SecOps',
    category: 'ITSM & Ticketing',
    icon: '📋',
    provider: 'ServiceNow',
    status: 'Connected',
    description: 'Automated Change Request (CR) dispatch, CAB voting integration, and Security Incident Response ticket workflows.',
    capabilities: ['Automated CR Risk Scoring Engine', 'CAB Real-Time Voting Webhooks', 'SecOps Threat Remediation Sync'],
    docsUrl: '#'
  },
  {
    id: 'int_splunk',
    name: 'Splunk Enterprise Security',
    category: 'SIEM & SOC',
    icon: '📊',
    provider: 'Splunk Inc.',
    status: 'Ready to Connect',
    description: 'High-throughput HEC event collector forwarder streaming ConnectIn Pulse radar events and threat intel.',
    capabilities: ['HTTP Event Collector (HEC) Stream', 'Custom ConnectIn CIM App', 'Alert Triggered Automated Sandboxes'],
    docsUrl: '#'
  }
]

export const ECOSYSTEM_PARTNERS_DATA: EcosystemPartner[] = [
  {
    id: 'part_aws',
    name: 'Amazon Web Services Partner Network',
    partnerType: 'Technology Partner',
    logo: '☁️',
    tier: 'Global Strategic',
    specialization: 'Public Sector, GovCloud & Defense Cloud Migration',
    jointOfferings: ['AWS Marketplace 1-Click Purchase', 'GovCloud cATO Automation Enclave', 'FedRAMP High Authorization Acceleration'],
    contactActionText: 'View AWS Joint Solution'
  },
  {
    id: 'part_expedite',
    name: 'Expedite Consults Advisory Group',
    partnerType: 'Consulting Partner',
    logo: '🛡️',
    tier: 'Premier Federal',
    specialization: 'Zero Trust Architecture, SEC Cyber Compliance & Fractional CISO',
    jointOfferings: ['Fractional CISO Retainer Desk', 'NIST SP 800-207 Architecture Assessment', 'FedRAMP 3PAO Readiness Audit'],
    contactActionText: 'Book Architecture Briefing'
  },
  {
    id: 'part_carahsoft',
    name: 'Carahsoft Government Solutions',
    partnerType: 'Reseller & Distributor',
    logo: '🏛️',
    tier: 'Premier Federal',
    specialization: 'Federal, State & Local Enterprise Contracting (GSA Schedule 70)',
    jointOfferings: ['GSA Multiple Award Schedule (MAS)', 'SEWP V Fast-Track Procurement', 'DoD ESI Blanket Purchase Agreements'],
    contactActionText: 'Request Government Quote'
  },
  {
    id: 'part_checkmarx',
    name: 'Checkmarx Application Security',
    partnerType: 'Technology Partner',
    logo: '⚡',
    tier: 'Global Strategic',
    specialization: 'Static/Dynamic AppSec, SAST, SCA & Checkmarx MCP Server',
    jointOfferings: ['Checkmarx MCP Auto-Fix Generator', 'AI-BOM Supply Chain Token Scanner', 'Fusion 2026 Unified Threat Correlator'],
    contactActionText: 'Explore AppSec Integration'
  }
]

export const ECOSYSTEM_COMMUNITIES_DATA: EcosystemCommunity[] = [
  {
    id: 'comm_zt',
    name: 'Zero Trust Architecture & NIST 800-207 Guild',
    category: 'Cybersecurity',
    icon: '🛡️',
    membersCount: 4820,
    activeDiscussions: 142,
    leadCurator: 'Alex Taylor (Expedite Consults)',
    description: 'The global community for enterprise defense architects implementing identity perimeters, eBPF micro-segmentation, and cATO pipelines.',
    recentTopic: 'Benchmarking Cilium ClusterMesh on Graviton4 vs AMD Genoa'
  },
  {
    id: 'comm_ai_safety',
    name: 'Agentic AI Safety & MCP Standards Consortium',
    category: 'AI',
    icon: '🤖',
    membersCount: 3940,
    activeDiscussions: 89,
    leadCurator: 'Dr. Elena Rostova (Stanford AI Fellow)',
    description: 'Engineers establishing cryptographic nonces, WebAssembly sandbox boundaries, and token guardrails for multi-agent LLM systems.',
    recentTopic: 'Zero-width unicode injection containment in MCP servers'
  },
  {
    id: 'comm_cloud_mesh',
    name: 'Multi-Cloud eBPF & Kernel Networking Architects',
    category: 'Cloud',
    icon: '☁️',
    membersCount: 3210,
    activeDiscussions: 67,
    leadCurator: 'David Sterling (OffSec Red Team Lead)',
    description: 'Deep-dive systems engineering on Linux cgroups, eBPF socket tracing, WireGuard mesh topologies, and GovCloud landing zones.',
    recentTopic: 'Bypassing traditional iptables overhead for 100Gbps interfaces'
  },
  {
    id: 'comm_dev_sys',
    name: 'Rust Systems & High-Performance Security Engineering',
    category: 'Developers',
    icon: '🦀',
    membersCount: 5430,
    activeDiscussions: 215,
    leadCurator: 'Marcus Vance (VP of Eng @ CloudScale)',
    description: 'Writing memory-safe network hypervisors, Firecracker MicroVM managers, and zero-undefined-behavior systems software.',
    recentTopic: 'Aya eBPF vs libbpf-rs ergonomics in production kernels'
  }
]

export const THIRD_PARTY_APPS_DATA: ThirdPartyApp[] = [
  {
    id: 'app_1',
    name: 'Sphera Zero-Trust Topology Validator',
    developerName: 'Sphera Micro-Apps Studio',
    icon: '🔒',
    category: 'Security Utility',
    rating: 4.98,
    installsCount: '12.4k installs',
    description: 'Automatically analyzes Kubernetes network policies and generates Cilium eBPF enforcement rules in 1 click.',
    isVerifiedEcosystem: true,
    isInstalled: true
  },
  {
    id: 'app_2',
    name: 'OSCAL Automated cATO Dossier Generator',
    developerName: 'GovTech Compliance Labs',
    icon: '📑',
    category: 'Compliance Automation',
    rating: 4.94,
    installsCount: '8.9k installs',
    description: 'Maps live AWS Config and GuardDuty telemetry directly into NIST SP 800-53 Rev 5 machine-readable OSCAL JSON.',
    isVerifiedEcosystem: true,
    isInstalled: true
  },
  {
    id: 'app_3',
    name: 'VeritasLens Real-Time NLP Fact-Radar',
    developerName: 'Veritas Intelligence',
    icon: '🌐',
    category: 'AI Agent',
    rating: 5.0,
    installsCount: '24.1k installs',
    description: 'Clusters 14 national newsrooms in real-time, detecting algorithmic blindspots and fact-checking statutory legal citations.',
    isVerifiedEcosystem: true,
    isInstalled: false
  },
  {
    id: 'app_4',
    name: 'Checkmarx Auto-PR Triage Bot',
    developerName: 'Checkmarx Core Engineering',
    icon: '⚡',
    category: 'DevOps Connector',
    rating: 4.96,
    installsCount: '18.7k installs',
    description: 'Dispatches instant GitHub pull requests with tested code fixes for identified SAST/SCA vulnerabilities.',
    isVerifiedEcosystem: true,
    isInstalled: false
  }
]
