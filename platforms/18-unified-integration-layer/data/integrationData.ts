import {
  ConnectedPlatform,
  TelemetryEvent,
  UnifiedIOC,
  CrossPlatformPlaybook,
  IdentityTenant,
  ScopedApiToken,
  UnifiedReportSummary,
  ApiGatewayRoute,
  DataLakeRecord,
  WebhookConnector,
  MeshServiceNode,
} from "@/types/integration";

export const CONNECTED_PLATFORMS: ConnectedPlatform[] = [
  {
    id: "sast-v1",
    name: "SAST Platform (Version 1 — CodeQL / Semgrep)",
    codeName: "SAST-1 (Port 3005)",
    category: "Static Application Security Testing (Version 1)",
    version: "v1.0.0-PROD",
    status: "ONLINE",
    port: 3005,
    url: "https://05-sast-platform.vercel.app",
    eventsPerSec: 3200,
    latencyMs: 18,
    healthScore: 99.2,
    activeAlerts: 1,
    lastHeartbeat: "Just now (gRPC Heartbeat)",
    description: "Multi-engine static code analysis with CodeQL, Semgrep, Joern, and AI false positive reduction.",
    grpcStreamStatus: "CONNECTED",
    features: ["CodeQL Scanning", "Semgrep Engine", "False Positive Reduction", "Compliance Mapping"]
  },
  {
    id: "sast-2-version-dast",
    name: "SAST-2 VERSION-DAST: AXIOM Security Intelligence (Version 2)",
    codeName: "SAST-2 / DAST (Port 3011)",
    category: "Dual SAST-2 / DAST Security Intelligence (Version 2)",
    version: "v5.2.0-PROD",
    status: "ONLINE",
    port: 3011,
    url: "https://11-dast-security-platform.vercel.app",
    eventsPerSec: 5820,
    latencyMs: 22,
    healthScore: 98.8,
    activeAlerts: 4,
    lastHeartbeat: "Just now (gRPC Stream)",
    description: "Comprehensive security intelligence gateway: Engine Brain orchestrator, Vuln Probe registry, multi-target AST fuzzer, and AI Copilot.",
    grpcStreamStatus: "CONNECTED",
    features: ["Engine Brain v4", "Vuln Probe Registry", "Multi-Target Simulator", "AI Copilot"]
  },
  {
    id: "sca-platform",
    name: "SCA Platform (Open Source Dependencies)",
    codeName: "Platform 06 (Port 3006)",
    category: "Software Composition & Dependency Analysis",
    version: "v2.1.0-PROD",
    status: "ONLINE",
    port: 3006,
    url: "https://06-sca-platform.vercel.app",
    eventsPerSec: 2840,
    latencyMs: 20,
    healthScore: 98.4,
    activeAlerts: 1,
    lastHeartbeat: "3s ago",
    description: "Deep open-source dependency analysis, SBOM generation, license compliance, and CVE correlation.",
    grpcStreamStatus: "CONNECTED",
    features: ["SBOM Generator", "License Compliance", "Dependency Graph", "CVE Correlator"]
  },
  {
    id: "secrets-platform",
    name: "Secrets Detection Platform",
    codeName: "Platform 07 (Port 3007)",
    category: "Credential & API Key Leak Prevention",
    version: "v2.4.0-PROD",
    status: "ONLINE",
    port: 3007,
    url: "https://07-secrets-platform.vercel.app",
    eventsPerSec: 4120,
    latencyMs: 15,
    healthScore: 99.5,
    activeAlerts: 0,
    lastHeartbeat: "Just now",
    description: "Entropy-based secret scanning, Git commit history hunter, and verified token validation.",
    grpcStreamStatus: "CONNECTED",
    features: ["Git History Scan", "Entropy Analysis", "Token Verifier", "Pre-Commit Hooks"]
  },
  {
    id: "cerberus-re",
    name: "CERBERUS-RE",
    codeName: "Platform 16 (Port 3016)",
    category: "Autonomous Malware Analysis & Reverse Engineering",
    version: "v4.2.0-PROD",
    status: "ONLINE",
    port: 3016,
    url: "https://16-malware-analysis-platform.vercel.app",
    eventsPerSec: 8420,
    latencyMs: 14,
    healthScore: 99.4,
    activeAlerts: 2,
    lastHeartbeat: "Just now (gRPC Heartbeat)",
    description: "Deep symbolic execution, automated deobfuscation, YARA engine, and C2 extractor.",
    grpcStreamStatus: "CONNECTED",
    features: ["Dynamic Sandbox", "Ghidra Decompiler", "CFG Visualizer", "YARA Rule Gen"]
  },
  {
    id: "aegis-recovery",
    name: "Aegis Recovery",
    codeName: "Platform 17 (Port 3017)",
    category: "Ransomware Recovery & Cyber Resilience",
    version: "v3.8.1-PROD",
    status: "ONLINE",
    port: 3017,
    url: "https://17-ransomware-recovery-platform.vercel.app",
    eventsPerSec: 6150,
    latencyMs: 18,
    healthScore: 98.9,
    activeAlerts: 1,
    lastHeartbeat: "Just now (gRPC Heartbeat)",
    description: "Autonomous cryptographic feasibility, WORM backup orchestration, and clean validation sandbox.",
    grpcStreamStatus: "CONNECTED",
    features: ["WORM S3 Vault", "Crypto Analyzer", "Blast Radius DAG", "Safe Sandbox Recovery"]
  },
  {
    id: "axiom-cloud",
    name: "AXIOM Cloud Security",
    codeName: "Platform 19 (Port 3019)",
    category: "Multi-Cloud PenTest & Attack Path Engine",
    version: "v4.0.0-PROD",
    status: "ONLINE",
    port: 3019,
    url: "https://19-cloud-security-platform.vercel.app",
    eventsPerSec: 7890,
    latencyMs: 12,
    healthScore: 99.1,
    activeAlerts: 3,
    lastHeartbeat: "Just now (gRPC Stream)",
    description: "Multi-cloud attack path analysis, IAM privilege escalation graphing, CSPM posture & authorized pen-testing across AWS, Azure, GCP, and Kubernetes.",
    grpcStreamStatus: "CONNECTED",
    features: ["Attack Path Graph", "IAM Escalator", "Multi-Cloud CSPM", "K8s RBAC Analyzer"]
  },
  {
    id: "mobile-sec",
    name: "Mobile AppSec",
    codeName: "Platform 13 (Port 3013)",
    category: "iOS & Android Mobile Binary Security",
    version: "v2.9.4-PROD",
    status: "ONLINE",
    port: 3013,
    url: "https://13-mobile-security-platform.vercel.app",
    eventsPerSec: 1850,
    latencyMs: 31,
    healthScore: 99.1,
    activeAlerts: 0,
    lastHeartbeat: "4s ago",
    description: "IPA/APK bytecode decompilation, hardcoded credential hunting, and runtime Frida instrumentation.",
    grpcStreamStatus: "CONNECTED",
    features: ["Frida Hooking", "APK Static Scan", "IPA Entitlements", "Hardcoded Secret Hunter"]
  },
  {
    id: "exploitability-ai",
    name: "Exploitability AI",
    codeName: "Platform 14 (Port 3014)",
    category: "Autonomous Exploit Verification Engine",
    version: "v3.0.2-PROD",
    status: "ONLINE",
    port: 3014,
    url: "https://14-exploitability-platform.vercel.app",
    eventsPerSec: 1680,
    latencyMs: 22,
    healthScore: 96.5,
    activeAlerts: 1,
    lastHeartbeat: "1s ago",
    description: "AI-driven weaponization checker, proof-of-concept generator, and EPSS correlation index.",
    grpcStreamStatus: "CONNECTED",
    features: ["PoC Generator", "EPSS Correlator", "Memory Corrupter", "WAF Bypass Analyzer"]
  },
  {
    id: "threat-modeler",
    name: "Threat Modeling Suite",
    codeName: "Platform 15 (Port 3015)",
    category: "Architecture & STRIDE Attack Modeling",
    version: "v2.4.0-PROD",
    status: "ONLINE",
    port: 3015,
    url: "https://15-threat-modeling-platform.vercel.app",
    eventsPerSec: 1480,
    latencyMs: 19,
    healthScore: 99.7,
    activeAlerts: 0,
    lastHeartbeat: "3s ago",
    description: "Cloud infrastructure graph mapping, STRIDE threat generation, and attack path simulation.",
    grpcStreamStatus: "CONNECTED",
    features: ["STRIDE AI Engine", "Cloud Architecture DAG", "Mitre Attack Matrix", "Risk Scorer"]
  }
];

export const MOCK_TELEMETRY_EVENTS: TelemetryEvent[] = [
  {
    id: "EVT-90412",
    timestamp: "2026-08-24 01:14:02.140",
    sourcePlatform: "cerberus-re",
    eventType: "MALWARE_C2_EXTRACTED",
    severity: "CRITICAL",
    targetHost: "sandbox-node-us-east-09",
    correlationId: "CORR-88219-LOCKBIT",
    details: "Unpacked LockBit 3.0 stage 2 loader; extracted active C2 endpoints & AES-256 master key derivation.",
    payload: {
      sha256: "8e9b42cf431a0e4d7701a2c3b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
      c2_ip: "185.220.101.44:8443",
      c2_domain: "sync-telemetry-relay-dark.su",
      packer: "Custom_VMP_v3",
      strings_matched: ["vssadmin delete shadows /all /quiet", "bcdedit /set {default} bootstatuspolicy ignoreallfailures"]
    },
    actionTaken: "Pushed to Shared Threat Intel Hub & Triggered SOAR Playbook",
    latencyMs: 8
  },
  {
    id: "EVT-90411",
    timestamp: "2026-08-24 01:13:58.820",
    sourcePlatform: "aegis-recovery",
    eventType: "BACKUP_LOCKDOWN_ENFORCED",
    severity: "HIGH",
    targetHost: "vault-s3-immutable-01",
    correlationId: "CORR-88219-LOCKBIT",
    details: "Automated lock of 44 TB primary snapshot pool in AWS us-east-1 to prevent ransomware overwrite.",
    payload: {
      vault_arn: "arn:aws:s3:::aegis-immutable-snapshots-prod",
      locked_snapshots: 184,
      retention_lock_days: 90,
      worm_compliance: "COMPLIANT_SEC_17a4"
    },
    actionTaken: "Immutable WORM Object Lock Engaged",
    latencyMs: 12
  },
  {
    id: "EVT-90410",
    timestamp: "2026-08-24 01:13:52.310",
    sourcePlatform: "axiom-dast",
    eventType: "BLIND_SSRF_DETECTED",
    severity: "CRITICAL",
    targetHost: "api.customer-portal.corp:443",
    correlationId: "CORR-44102-AXIOM",
    details: "Out-of-band DNS callback verified from AWS IMDSv2 internal metadata endpoint via /v1/fetch-avatar.",
    payload: {
      endpoint: "POST /v1/fetch-avatar",
      parameter: "avatar_url",
      callback_ip: "169.254.169.254",
      http_response_code: 200,
      cwe_id: "CWE-918"
    },
    actionTaken: "Generated Sigma WAF Rule & Notified Cloud Security",
    latencyMs: 24
  },
  {
    id: "EVT-90409",
    timestamp: "2026-08-24 01:13:44.912",
    sourcePlatform: "exploitability-ai",
    eventType: "RCE_WEAPONIZATION_CONFIRMED",
    severity: "CRITICAL",
    targetHost: "auth-gateway-svc:8080",
    correlationId: "CORR-44102-AXIOM",
    details: "PoC confirmed arbitrary shell command execution via Spring Framework Expression Injection.",
    payload: {
      cve: "CVE-2026-3829",
      cvss: 9.8,
      epss_percentile: 0.994,
      payload_signature: "T(java.lang.Runtime).getRuntime().exec('id')"
    },
    actionTaken: "Auto-generated Virtual Patch & Injected into Envoy Proxy",
    latencyMs: 16
  },
  {
    id: "EVT-90408",
    timestamp: "2026-08-24 01:13:38.104",
    sourcePlatform: "mobile-sec",
    eventType: "HARDCODED_PROD_JWT_SECRET",
    severity: "HIGH",
    targetHost: "ios-build-v4.1.0.ipa",
    correlationId: "CORR-12948-MOBILE",
    details: "Discovered HMAC-SHA256 master signing secret in plaintext embedded Mach-O binary section.",
    payload: {
      app_bundle: "com.expedite.enterprise.mobile",
      entropy_score: 5.82,
      secret_type: "JWT_SIGNING_KEY",
      key_preview: "sk_live_99a8*******************"
    },
    actionTaken: "Triggered Okta Key Rotation Webhook",
    latencyMs: 19
  },
  {
    id: "EVT-90407",
    timestamp: "2026-08-24 01:13:29.450",
    sourcePlatform: "threat-modeler",
    eventType: "ATTACK_PATH_RECALCULATED",
    severity: "MEDIUM",
    targetHost: "k8s-payment-cluster",
    correlationId: "CORR-99014-THREAT",
    details: "Lateral movement path discovered from DAST-flagged staging Pod to production RDS master.",
    payload: {
      chokepoint_node: "iam-role-staging-runner",
      blast_radius_nodes: 12,
      probability_escalation: 0.87
    },
    actionTaken: "Synced to Aegis Recovery Blast-Radius DAG",
    latencyMs: 14
  }
];

export const UNIFIED_IOCS: UnifiedIOC[] = [
  {
    id: "IOC-001",
    type: "SHA256",
    value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    threatActor: "LockBit 3.0 (ALPHV Affiliates)",
    malwareFamily: "LockBit Black Builder v3",
    confidenceScore: 99,
    firstSeen: "2026-08-23 18:22:00",
    lastSeen: "2026-08-24 01:10:00",
    originatingPlatform: "cerberus-re",
    propagatedPlatforms: ["cerberus-re", "aegis-recovery", "axiom-dast", "edr-crowdstrike", "siem-sentinel"],
    syncStatus: "ENFORCED",
    mitreTactics: ["T1486 Data Encrypted for Impact", "T1489 Service Stop", "T1490 Inhibit System Recovery"],
    description: "High-entropy polymorphic encryptor targeting ESXi and Windows hypervisors with ChaCha20/RSA."
  },
  {
    id: "IOC-002",
    type: "IP_C2",
    value: "185.220.101.44",
    threatActor: "BlackCat / ALPHV",
    malwareFamily: "Exfiltration Beacon Rust-v2",
    confidenceScore: 95,
    firstSeen: "2026-08-24 00:15:30",
    lastSeen: "2026-08-24 01:08:12",
    originatingPlatform: "cerberus-re",
    propagatedPlatforms: ["cerberus-re", "aegis-recovery", "edr-crowdstrike", "siem-sentinel"],
    syncStatus: "ENFORCED",
    mitreTactics: ["T1071.001 Web Protocols", "T1567 Exfiltration Over Web Service"],
    description: "Hardcoded fast-flux C2 endpoint routing exfiltrated customer PII to bulletproof VPS."
  },
  {
    id: "IOC-003",
    type: "DOMAIN",
    value: "update-telemetry-resolver-darknet.su",
    threatActor: "APT29 (Cozy Bear)",
    malwareFamily: "Cobalt Strike Beacon 4.9",
    confidenceScore: 92,
    firstSeen: "2026-08-22 14:00:00",
    lastSeen: "2026-08-24 00:45:00",
    originatingPlatform: "cerberus-re",
    propagatedPlatforms: ["cerberus-re", "axiom-dast", "edr-crowdstrike"],
    syncStatus: "ENFORCED",
    mitreTactics: ["T1071 Application Layer Protocol", "T1568 Dynamic Resolution"],
    description: "Domain-fronted DNS/HTTPS staging domain used for DLL side-loading payloads."
  },
  {
    id: "IOC-004",
    type: "YARA_RULE",
    value: "rule Expedite_LockBit3_ChaCha20_Routine { strings: $s1 = { 8B 44 24 10 33 C0 85 C0 7E 1E } condition: $s1 }",
    threatActor: "LockBit Affiliates",
    malwareFamily: "LockBit",
    confidenceScore: 98,
    firstSeen: "2026-08-24 01:00:00",
    lastSeen: "2026-08-24 01:14:00",
    originatingPlatform: "cerberus-re",
    propagatedPlatforms: ["cerberus-re", "aegis-recovery", "mobile-sec"],
    syncStatus: "ENFORCED",
    mitreTactics: ["T1027 Obfuscated Files or Information"],
    description: "Extracted compiled cryptographic loop detecting in-memory key scheduling routines."
  },
  {
    id: "IOC-005",
    type: "SIGMA_RULE",
    value: "title: Web_App_SSRF_IMDSv2_Attempt\nstatus: production\nlogsource:\n  category: webserver\ndetection:\n  selection:\n    request.uri|contains: '169.254.169.254'\n  condition: selection",
    threatActor: "Opportunistic Cloud Attackers",
    malwareFamily: "Cloud Crawler Bots",
    confidenceScore: 90,
    firstSeen: "2026-08-24 01:12:00",
    lastSeen: "2026-08-24 01:12:00",
    originatingPlatform: "axiom-dast",
    propagatedPlatforms: ["axiom-dast", "siem-sentinel"],
    syncStatus: "SYNCING",
    mitreTactics: ["T1552.005 Cloud Instance Metadata API"],
    description: "Sigma rule auto-generated from live AXIOM DAST blind SSRF exploitation test."
  }
];

export const CROSS_PLATFORM_PLAYBOOKS: CrossPlatformPlaybook[] = [
  {
    id: "PBK-001",
    name: "Autonomous Malware-to-Recovery Lockdown",
    description: "Triggered on CERBERUS-RE critical malware classification. Automatically isolates affected endpoints in EDR, freezes S3 immutable backups in Aegis Recovery, and dispatches DAST perimeter scans on exposed ports.",
    triggerEvent: "MALWARE_CLASSIFIED_CRITICAL",
    triggerSource: "cerberus-re",
    category: "RANSOMWARE_CONTAINMENT",
    status: "ACTIVE",
    lastRun: "2 mins ago",
    executionsTotal: 342,
    successRate: 99.7,
    steps: [
      {
        stepNumber: 1,
        name: "Extract C2 & Crypto Signatures",
        targetPlatform: "cerberus-re",
        action: "Run deep Ghidra headless decompiler & extract C2 IP/port strings",
        status: "COMPLETED",
        durationMs: 410,
        outputSummary: "Extracted 2 C2 IPs & AES-256 IV from payload"
      },
      {
        stepNumber: 2,
        name: "Propagate IOCs to Ecosystem Bus",
        targetPlatform: "edr-crowdstrike",
        action: "Broadcast STIX 2.1 IOC bundle to CrowdStrike Falcon Real-Time Blocklist",
        status: "COMPLETED",
        durationMs: 120,
        outputSummary: "Blocked on 2,410 enterprise endpoints"
      },
      {
        stepNumber: 3,
        name: "Lockdown Immutable Backup Snapshots",
        targetPlatform: "aegis-recovery",
        action: "Activate WORM Object Lock on AWS S3 & Azure Blob storage tiers",
        status: "COMPLETED",
        durationMs: 380,
        requiresDualApproval: false,
        outputSummary: "Protected 44 TB primary backup vault"
      },
      {
        stepNumber: 4,
        name: "Perimeter Vulnerability Scan",
        targetPlatform: "axiom-dast",
        action: "Launch targeted DAST crawler on external IP associated with affected asset",
        status: "COMPLETED",
        durationMs: 1250,
        outputSummary: "Audited 18 exposed API endpoints"
      }
    ]
  },
  {
    id: "PBK-002",
    name: "Zero-Day Web Exploit to Virtual Patching",
    description: "When AXIOM DAST or Exploitability AI validates an in-the-wild zero-day RCE, automatically deploy an Envoy WAF regex filter and isolate the host environment.",
    triggerEvent: "EXPLOIT_VERIFIED_RCE",
    triggerSource: "exploitability-ai",
    category: "ZERO_DAY_TRIAGE",
    status: "ACTIVE",
    lastRun: "35 mins ago",
    executionsTotal: 188,
    successRate: 98.9,
    steps: [
      {
        stepNumber: 1,
        name: "Generate Proof-of-Concept Exploit Artifact",
        targetPlatform: "exploitability-ai",
        action: "Compile sanitized payload & test against isolated staging replica",
        status: "COMPLETED",
        durationMs: 820,
        outputSummary: "Exploit verified: CVSS 9.8 (Spring Core RCE)"
      },
      {
        stepNumber: 2,
        name: "Push Virtual Patch to Envoy Ingress",
        targetPlatform: "axiom-dast",
        action: "Inject WAF rate-limiting rule and header blocker across K8s ingress",
        status: "COMPLETED",
        durationMs: 240,
        outputSummary: "Deployed to 6 cluster ingress controllers"
      },
      {
        stepNumber: 3,
        name: "Verify Exploit Mitigation via Re-Scan",
        targetPlatform: "axiom-dast",
        action: "Execute AXIOM DAST regression verification probe",
        status: "COMPLETED",
        durationMs: 510,
        outputSummary: "Mitigation confirmed: HTTP 403 Forbidden"
      }
    ]
  },
  {
    id: "PBK-003",
    name: "Ransomware Cryptographic Feasibility & Clean Recovery",
    description: "Correlates Aegis Recovery crypto analyzer with Cerberus reverse-engineered key derivation to calculate mathematical probability of plaintext recovery without paying ransom.",
    triggerEvent: "RANSOM_INCIDENT_INTAKE",
    triggerSource: "aegis-recovery",
    category: "BACKUP_LOCKDOWN",
    status: "ACTIVE",
    lastRun: "1 hour ago",
    executionsTotal: 94,
    successRate: 100.0,
    steps: [
      {
        stepNumber: 1,
        name: "Analyze Encrypted File Headers",
        targetPlatform: "aegis-recovery",
        action: "Inspect header entropy, IV reuse, and PRNG seed flaw candidates",
        status: "COMPLETED",
        durationMs: 650,
        outputSummary: "Flaw detected: PRNG seeded from GetTickCount64 (brute-forceable in 4.2 hours)"
      },
      {
        stepNumber: 2,
        name: "Launch Distributed Decryptor Solver",
        targetPlatform: "cerberus-re",
        action: "Spin up GPU cluster to reconstruct ChaCha20 state matrix",
        status: "COMPLETED",
        durationMs: 3400,
        outputSummary: "Key recovered: 0x9f4a12... 100% data integrity verified"
      }
    ]
  }
];

export const IDENTITY_TENANTS: IdentityTenant[] = [
  {
    id: "TENANT-001",
    tenantName: "Acme Financial Global Corp",
    domain: "acmefinancial.com",
    ssoProvider: "Okta",
    ssoStatus: "ACTIVE",
    zeroTrustPostureScore: 96,
    mfaEnforcementRate: 100,
    activeUsersCount: 142,
    apiTokensCount: 28,
    isolatedDbCluster: "db-cluster-acme-prod-us-east",
    complianceTier: "FINRA_COMPLIANT"
  },
  {
    id: "TENANT-002",
    tenantName: "Apex Healthcare & LifeSciences",
    domain: "apexhealth.org",
    ssoProvider: "Microsoft Entra ID",
    ssoStatus: "ACTIVE",
    zeroTrustPostureScore: 92,
    mfaEnforcementRate: 100,
    activeUsersCount: 88,
    apiTokensCount: 16,
    isolatedDbCluster: "db-cluster-apex-hipaa-us-central",
    complianceTier: "HIPAA_SOC2"
  },
  {
    id: "TENANT-003",
    tenantName: "Defense Dynamics Aerospace",
    domain: "defensedynamics.mil.cloud",
    ssoProvider: "PingIdentity",
    ssoStatus: "ACTIVE",
    zeroTrustPostureScore: 99,
    mfaEnforcementRate: 100,
    activeUsersCount: 64,
    apiTokensCount: 42,
    isolatedDbCluster: "db-cluster-govcloud-fedramp-high",
    complianceTier: "FEDRAMP_HIGH"
  }
];

export const SCOPED_API_TOKENS: ScopedApiToken[] = [
  {
    id: "TOK-9910",
    name: "SOAR Automation Service Engine",
    prefix: "exp_live_sec_8849...",
    issuedTo: "svc-soar-autopilot@acmefinancial.com",
    assignedPlatforms: ["cerberus-re", "aegis-recovery", "axiom-dast"],
    permissions: ["telemetry:read", "ioc:write", "playbook:execute", "vault:read"],
    createdAt: "2026-08-01",
    expiresAt: "2027-08-01",
    lastUsedAt: "3 seconds ago",
    rateLimitPerMin: 10000,
    status: "ACTIVE"
  },
  {
    id: "TOK-9911",
    name: "CrowdStrike Falcon Ingestion Bridge",
    prefix: "exp_live_edr_1102...",
    issuedTo: "svc-edr-sync@acmefinancial.com",
    assignedPlatforms: ["cerberus-re", "threat-modeler"],
    permissions: ["ioc:read", "ioc:write", "telemetry:read"],
    createdAt: "2026-07-15",
    expiresAt: "2027-07-15",
    lastUsedAt: "Just now",
    rateLimitPerMin: 5000,
    status: "ACTIVE"
  },
  {
    id: "TOK-9912",
    name: "AXIOM DAST CI/CD Pipeline Probe",
    prefix: "exp_live_dast_4491...",
    issuedTo: "gitlab-runner-ci@apexhealth.org",
    assignedPlatforms: ["axiom-dast", "exploitability-ai"],
    permissions: ["dast:scan", "dast:report", "exploit:verify"],
    createdAt: "2026-08-10",
    expiresAt: "2026-11-10",
    lastUsedAt: "18 mins ago",
    rateLimitPerMin: 2000,
    status: "ACTIVE"
  }
];

export const UNIFIED_REPORT_SUMMARIES: UnifiedReportSummary[] = [
  {
    id: "REP-2026-Q3-AUG",
    reportCode: "EXP-EXEC-2026-08-24",
    title: "Executive Cybersecurity Ecosystem Posture & SEC 8-K Materiality Briefing",
    period: "August 2026 (Real-Time Current State)",
    generatedAt: "2026-08-24 01:00:00 UTC",
    overallHealthScore: 96.4,
    sec8kMateriality: "MATERIAL_EVENT_CONTAINED",
    hipaaReadiness: 99.2,
    soc2Readiness: 98.8,
    cerberusFindingsCount: { critical: 3, high: 14, analyzedBinaries: 1840 },
    aegisRecoveryMetrics: { rtoMinutes: 14, rpoMinutes: 0, cleanSnapshotIntegrity: 100 },
    axiomDastMetrics: { webEndpointsScanned: 3410, highRiskVulns: 2, apiDriftScore: 1.2 },
    cisoBriefingNotes: "All critical ransomware loader indicators quarantined within 410ms. WORM backup storage verified intact. No exfiltration of customer PII detected. SEC 8-K disclosure threshold not triggered due to zero operational disruption."
  }
];

export const API_GATEWAY_ROUTES: ApiGatewayRoute[] = [
  {
    id: "RT-001",
    method: "POST",
    endpointPath: "/v1/telemetry/events/ingest",
    targetPlatform: "cerberus-re",
    downstreamService: "telemetry-ingestion-svc:50051",
    authLevel: "JWT_BEARER",
    rateLimitTier: "ENTERPRISE_10K",
    p99LatencyMs: 4.8,
    status2xxPercentage: 99.98,
    activeSubscribers: 14,
    schemaVersion: "v1.4.0"
  },
  {
    id: "RT-002",
    method: "GRAPHQL",
    endpointPath: "/graphql",
    targetPlatform: "cerberus-re",
    downstreamService: "unified-graphql-nexus:4000",
    authLevel: "JWT_BEARER",
    rateLimitTier: "UNLIMITED",
    p99LatencyMs: 12.4,
    status2xxPercentage: 99.92,
    activeSubscribers: 48,
    schemaVersion: "v2.1.0"
  },
  {
    id: "RT-003",
    method: "POST",
    endpointPath: "/v1/iocs/synchronize",
    targetPlatform: "cerberus-re",
    downstreamService: "threat-intel-hub:50052",
    authLevel: "MUTUAL_TLS",
    rateLimitTier: "ENTERPRISE_10K",
    p99LatencyMs: 6.2,
    status2xxPercentage: 100.0,
    activeSubscribers: 22,
    schemaVersion: "stix-2.1"
  },
  {
    id: "RT-004",
    method: "POST",
    endpointPath: "/v1/playbooks/trigger",
    targetPlatform: "aegis-recovery",
    downstreamService: "soar-orchestrator-svc:8080",
    authLevel: "JWT_BEARER",
    rateLimitTier: "STANDARD_1K",
    p99LatencyMs: 18.0,
    status2xxPercentage: 99.85,
    activeSubscribers: 8,
    schemaVersion: "v3.0.0"
  },
  {
    id: "RT-005",
    method: "GRPC_STREAM",
    endpointPath: "expedite.telemetry.v1.EventStream/Subscribe",
    targetPlatform: "cerberus-re",
    downstreamService: "grpc-streaming-bus:9090",
    authLevel: "MUTUAL_TLS",
    rateLimitTier: "UNLIMITED",
    p99LatencyMs: 1.8,
    status2xxPercentage: 99.99,
    activeSubscribers: 128,
    schemaVersion: "proto3"
  }
];

export const DATA_LAKE_RECORDS: DataLakeRecord[] = [
  {
    id: "DL-88019",
    partition: "re_binaries",
    timestamp: "2026-08-24 01:04:12",
    source: "cerberus-re",
    subjectHashOrHost: "8e9b42cf431a0e4d7701a2c3b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
    rawSizeKb: 1420,
    summary: "PE32+ executable; LockBit 3.0 builder unpacked in QEMU hypervisor sandbox",
    tags: ["ransomware", "unpacked", "ghidra_disassembly", "chacha20"],
    indexedFields: {
      compiler: "MSVC 2022",
      anti_debug_tricks: ["IsDebuggerPresent", "CheckRemoteDebuggerPresent", "NtQueryInformationProcess"],
      entropy: 7.94
    }
  },
  {
    id: "DL-88020",
    partition: "recovery_snapshots",
    timestamp: "2026-08-24 01:02:40",
    source: "aegis-recovery",
    subjectHashOrHost: "s3-snapshot-vault-acme-prod",
    rawSizeKb: 44200000,
    summary: "Immutable WORM cryptographic snapshot manifest signed by HSM key-04",
    tags: ["s3_worm", "clean_validation", "rto_14min"],
    indexedFields: {
      total_objects: 1492000,
      sha256_root_tree: "91a82f...d49c",
      quarantine_flag: false
    }
  },
  {
    id: "DL-88021",
    partition: "dast_http_traces",
    timestamp: "2026-08-24 00:58:19",
    source: "axiom-dast",
    subjectHashOrHost: "api.acmefinancial.com/v1/auth/token",
    rawSizeKb: 84,
    summary: "DAST fuzzing trace with 1,200 mutated HTTP requests for JWT algorithm confusion",
    tags: ["jwt_fuzzing", "owasp_api1", "status_401"],
    indexedFields: {
      vulnerability_found: false,
      tested_algorithms: ["none", "RS256_to_HS256", "ES256_weak_r"],
      waf_blocks_recorded: 1200
    }
  },
  {
    id: "DL-88022",
    partition: "zeek_network_pcap",
    timestamp: "2026-08-24 00:45:00",
    source: "cerberus-re",
    subjectHashOrHost: "185.220.101.44:8443",
    rawSizeKb: 12800,
    summary: "Full packet capture of encrypted TLS 1.3 handshake with JA3 fingerprint 771,4865-4866...",
    tags: ["ja3_match", "cobalt_strike", "tls13_pcap"],
    indexedFields: {
      sni: "sync-telemetry-relay-dark.su",
      cipher_suite: "TLS_AES_256_GCM_SHA384",
      alert_status: "BLOCKED"
    }
  }
];

export const WEBHOOK_CONNECTORS: WebhookConnector[] = [
  {
    id: "CONN-SPLUNK",
    name: "Splunk Enterprise / Cloud HEC",
    category: "SIEM",
    iconName: "Flame",
    status: "CONNECTED",
    endpointUrl: "https://http-inputs-acme.splunkcloud.com:8088/services/collector/raw",
    eventsForwarded24h: 1428000,
    avgLatencyMs: 14,
    retryQueueCount: 0,
    authType: "BEARER_TOKEN",
    lastPing: "Just now"
  },
  {
    id: "CONN-SENTINEL",
    name: "Microsoft Sentinel Log Analytics",
    category: "SIEM",
    iconName: "Shield",
    status: "CONNECTED",
    endpointUrl: "https://workspace-id.ods.opinsights.azure.com/api/logs?api-version=2016-04-01",
    eventsForwarded24h: 984000,
    avgLatencyMs: 18,
    retryQueueCount: 0,
    authType: "OAUTH2_CLIENT",
    lastPing: "Just now"
  },
  {
    id: "CONN-CROWDSTRIKE",
    name: "CrowdStrike Falcon Real-Time IOC Sync",
    category: "EDR",
    iconName: "Radio",
    status: "CONNECTED",
    endpointUrl: "https://api.crowdstrike.com/indicators/entities/iocs/v1",
    eventsForwarded24h: 42100,
    avgLatencyMs: 22,
    retryQueueCount: 0,
    authType: "OAUTH2_CLIENT",
    lastPing: "1s ago"
  },
  {
    id: "CONN-AWS-HUB",
    name: "AWS Security Hub & GuardDuty",
    category: "CLOUD_SECURITY",
    iconName: "Cloud",
    status: "CONNECTED",
    endpointUrl: "https://securityhub.us-east-1.amazonaws.com/findings/import",
    eventsForwarded24h: 189000,
    avgLatencyMs: 11,
    retryQueueCount: 0,
    authType: "MUTUAL_TLS",
    lastPing: "Just now"
  },
  {
    id: "CONN-SERVICENOW",
    name: "ServiceNow Security Incident Response (SIR)",
    category: "ITSM",
    iconName: "Building2",
    status: "CONNECTED",
    endpointUrl: "https://acme.service-now.com/api/now/table/sn_si_incident",
    eventsForwarded24h: 1420,
    avgLatencyMs: 45,
    retryQueueCount: 0,
    authType: "BEARER_TOKEN",
    lastPing: "4s ago"
  },
  {
    id: "CONN-JIRA",
    name: "Jira Security Task Automation",
    category: "ITSM",
    iconName: "CheckSquare",
    status: "CONNECTED",
    endpointUrl: "https://acme-sec.atlassian.net/rest/api/3/issue",
    eventsForwarded24h: 310,
    avgLatencyMs: 62,
    retryQueueCount: 0,
    authType: "BEARER_TOKEN",
    lastPing: "6s ago"
  },
  {
    id: "CONN-SLACK",
    name: "Slack SOC War Room Alert Bot",
    category: "COLLABORATION",
    iconName: "MessageSquare",
    status: "CONNECTED",
    endpointUrl: "https://hooks.slack.com/services/SAMPLE_HOOK_REDACTED",
    eventsForwarded24h: 580,
    avgLatencyMs: 28,
    retryQueueCount: 0,
    authType: "WEBHOOK_SECRET",
    lastPing: "Just now"
  },
  {
    id: "CONN-PAGERDUTY",
    name: "PagerDuty High-Urgency Incident Escrow",
    category: "COLLABORATION",
    iconName: "Bell",
    status: "CONNECTED",
    endpointUrl: "https://events.pagerduty.com/v2/enqueue",
    eventsForwarded24h: 12,
    avgLatencyMs: 16,
    retryQueueCount: 0,
    authType: "WEBHOOK_SECRET",
    lastPing: "Just now"
  }
];

export const MESH_SERVICE_NODES: MeshServiceNode[] = [
  {
    id: "MESH-01",
    serviceName: "telemetry-bus-kafka-broker-01",
    cluster: "k8s-us-east-cluster-primary",
    instanceCount: 6,
    cpuPercent: 38,
    memoryPercent: 54,
    grpcPoolActive: 128,
    grpcPoolMax: 500,
    circuitBreakerStatus: "CLOSED",
    p99LatencyMs: 1.8,
    errorRatePercent: 0.01,
    traceSpansCount: 4820000
  },
  {
    id: "MESH-02",
    serviceName: "stix-ioc-sync-engine",
    cluster: "k8s-us-east-cluster-primary",
    instanceCount: 4,
    cpuPercent: 24,
    memoryPercent: 42,
    grpcPoolActive: 48,
    grpcPoolMax: 200,
    circuitBreakerStatus: "CLOSED",
    p99LatencyMs: 3.4,
    errorRatePercent: 0.00,
    traceSpansCount: 1240000
  },
  {
    id: "MESH-03",
    serviceName: "soar-orchestrator-core",
    cluster: "k8s-us-east-cluster-primary",
    instanceCount: 3,
    cpuPercent: 31,
    memoryPercent: 49,
    grpcPoolActive: 32,
    grpcPoolMax: 150,
    circuitBreakerStatus: "CLOSED",
    p99LatencyMs: 6.2,
    errorRatePercent: 0.02,
    traceSpansCount: 890000
  },
  {
    id: "MESH-04",
    serviceName: "federated-graphql-gateway",
    cluster: "k8s-us-east-cluster-primary",
    instanceCount: 8,
    cpuPercent: 44,
    memoryPercent: 62,
    grpcPoolActive: 256,
    grpcPoolMax: 1000,
    circuitBreakerStatus: "CLOSED",
    p99LatencyMs: 8.9,
    errorRatePercent: 0.04,
    traceSpansCount: 9400000
  },
  {
    id: "MESH-05",
    serviceName: "data-lake-opensearch-bridge",
    cluster: "k8s-us-east-cluster-primary",
    instanceCount: 4,
    cpuPercent: 52,
    memoryPercent: 71,
    grpcPoolActive: 84,
    grpcPoolMax: 300,
    circuitBreakerStatus: "CLOSED",
    p99LatencyMs: 14.1,
    errorRatePercent: 0.01,
    traceSpansCount: 3100000
  },
  {
    id: "MESH-06",
    serviceName: "identity-oauth2-pki-vault",
    cluster: "k8s-us-east-cluster-primary",
    instanceCount: 3,
    cpuPercent: 18,
    memoryPercent: 35,
    grpcPoolActive: 16,
    grpcPoolMax: 100,
    circuitBreakerStatus: "CLOSED",
    p99LatencyMs: 2.1,
    errorRatePercent: 0.00,
    traceSpansCount: 650000
  }
];
