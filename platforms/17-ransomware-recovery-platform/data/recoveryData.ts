import {
  RansomwareCase,
  EncryptedFilePattern,
  RansomNoteIntel,
  BackupReadinessSource,
  RecoveryPlanPhase,
  ReinfectionFinding,
  CleanValidationCheck,
  DigitalTwinNode
} from "@/types/recovery";

export const MOCK_CASES: RansomwareCase[] = [
  {
    id: "case-001",
    caseNumber: "INC-2026-8841",
    title: "Regional Healthcare EHR & PACS Outage",
    organization: "Mercy General Health System",
    industry: "Healthcare / Critical Infrastructure",
    severity: "CRITICAL",
    status: "RECOVERING",
    ransomwareFamily: "LockBit 3.0 (Black)",
    confidenceScore: 97.4,
    threatActor: "LockBit Supporter Gang (FIN12 Affiliate)",
    affectedHosts: 24,
    affectedFiles: 47281,
    totalDataSizeGB: 1840,
    ransomDemandUSD: 1800000,
    cryptoCurrency: "BTC",
    walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    torNegotiationUrl: "http://lockbitaptc2xnk7b5yvh7y5vxsq.onion/chat/8841",
    deadlineTimestamp: "2026-08-26T18:00:00Z",
    dataExfiltrationLikelihood: "CONFIRMED",
    primaryRecoveryPath: "BACKUP_ONLY",
    reinfectionRisk: "HIGH",
    estimatedRecoveryTimeHours: 18.5,
    assignedLead: "Elena Rostova, CISSP",
    leadRole: "Lead DFIR Incident Commander",
    createdAt: "2026-08-23T06:14:00Z",
    updatedAt: "2026-08-24T00:15:00Z",
    summary: "Mass ransomware deployment via compromised Domain Admin credentials. Hyper-V cluster and patient billing SQL databases encrypted with .lockbit extension. Shadow copies deleted via vssadmin. Immutable S3 backups verified intact."
  },
  {
    id: "case-002",
    caseNumber: "INC-2026-9012",
    title: "Clearing & Settlement Node Encryption",
    organization: "Apex Global Financial Group",
    industry: "Banking & Financial Services",
    severity: "CRITICAL",
    status: "ANALYZING",
    ransomwareFamily: "BlackCat / ALPHV (Rust)",
    confidenceScore: 94.8,
    threatActor: "Scattered Spider (UNC3944)",
    affectedHosts: 88,
    affectedFiles: 1240500,
    totalDataSizeGB: 8600,
    ransomDemandUSD: 4500000,
    cryptoCurrency: "XMR / BTC",
    walletAddress: "888tNkZrPN6JsEkgFjhx7739YvBkd7993kKlhZ904",
    torNegotiationUrl: "http://alphvchat7xnk27b5yvhlkdjfk.onion/apex",
    deadlineTimestamp: "2026-08-27T12:00:00Z",
    dataExfiltrationLikelihood: "CONFIRMED",
    primaryRecoveryPath: "FEASIBLE_WITH_EFFORT",
    reinfectionRisk: "CRITICAL",
    estimatedRecoveryTimeHours: 32.0,
    assignedLead: "Marcus Vance, GCIH",
    leadRole: "Principal Forensics Investigator",
    createdAt: "2026-08-23T14:30:00Z",
    updatedAt: "2026-08-24T00:05:00Z",
    summary: "High-speed intermittent AES-256-CTR encryption targeting VMware ESXi datastores and SWIFT payment transaction logs. Intermittent encryption left file headers partially recoverable."
  },
  {
    id: "case-003",
    caseNumber: "INC-2026-7492",
    title: "Avionics Assembly Line Controller Lockout",
    organization: "Precision Dynamics Aerospace",
    industry: "Defense & Aerospace Manufacturing",
    severity: "HIGH",
    status: "VALIDATING",
    ransomwareFamily: "Royal Ransomware",
    confidenceScore: 91.2,
    threatActor: "DEV-0569 (Zeon Syndicate)",
    affectedHosts: 14,
    affectedFiles: 189000,
    totalDataSizeGB: 950,
    ransomDemandUSD: 950000,
    cryptoCurrency: "BTC",
    walletAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    torNegotiationUrl: "http://royal7xnk27b5yvhlkdjfk.onion/precision",
    deadlineTimestamp: "2026-08-28T09:00:00Z",
    dataExfiltrationLikelihood: "SUSPECTED",
    primaryRecoveryPath: "BACKUP_ONLY",
    reinfectionRisk: "MODERATE",
    estimatedRecoveryTimeHours: 12.0,
    assignedLead: "Sarah Jenkins, CISM",
    leadRole: "Recovery Operations Director",
    createdAt: "2026-08-22T20:10:00Z",
    updatedAt: "2026-08-23T22:45:00Z",
    summary: "OT supervisory SCADA workstation and CAD engineering repository locked with .royal_u extension. Air-gapped LTO-8 tape backups retrieved from offsite vault."
  },
  {
    id: "case-004",
    caseNumber: "INC-2026-5520",
    title: "Legacy SCADA Terminal Infection",
    organization: "Heritage Energy Pipeline Operations",
    industry: "Energy / Oil & Gas",
    severity: "MEDIUM",
    status: "RESOLVED",
    ransomwareFamily: "WannaCry 2.0 (MS17-010)",
    confidenceScore: 99.1,
    threatActor: "Lazarus Group (APT38 Outlier)",
    affectedHosts: 6,
    affectedFiles: 12840,
    totalDataSizeGB: 120,
    ransomDemandUSD: 300,
    cryptoCurrency: "BTC",
    walletAddress: "115p7UMMngoj1pMvkpHijcRdfJNXj6LrLn",
    torNegotiationUrl: "N/A (Static Hardcoded Bitcoin Wallets)",
    deadlineTimestamp: "2026-08-25T00:00:00Z",
    dataExfiltrationLikelihood: "LOW",
    primaryRecoveryPath: "AVAILABLE",
    reinfectionRisk: "CLEAN",
    estimatedRecoveryTimeHours: 2.5,
    assignedLead: "David Kross, GCFA",
    leadRole: "Senior Malware Researcher",
    createdAt: "2026-08-23T08:00:00Z",
    updatedAt: "2026-08-23T19:30:00Z",
    summary: "WannaCry worm spread via unpatched SMBv1 port 445 on isolated OT subnet. Recovered 100% of files using in-memory RSA key extraction via wanakiwi heap carver without ransom payment."
  }
];

export const MOCK_FILE_PATTERNS: EncryptedFilePattern[] = [
  {
    id: "pat-001",
    sampleName: "Patient_Records_2026.mdf.lockbit",
    extensionAppended: ".lockbit",
    originalExtension: ".mdf",
    headerDamageBytes: 512,
    encryptionMode: "BLOCK_CIPHER",
    cipherAlgorithm: "ChaCha20 + Curve25519",
    keySizeBits: 256,
    ivLengthBytes: 12,
    entropyScore: 7.988,
    footerMetadataPresent: true,
    canaryMarker: "LOCKBIT_META_V3_TAG"
  },
  {
    id: "pat-002",
    sampleName: "Swift_Transactions_Q3.dat.crypted",
    extensionAppended: ".crypted",
    originalExtension: ".dat",
    headerDamageBytes: 1024,
    encryptionMode: "INTERMITTENT",
    cipherAlgorithm: "AES-256-CTR",
    keySizeBits: 256,
    ivLengthBytes: 16,
    entropyScore: 7.912,
    footerMetadataPresent: true,
    canaryMarker: "ALPHV_FOOTER_0x89"
  }
];

export const MOCK_RANSOM_NOTES: RansomNoteIntel[] = [
  {
    id: "note-001",
    caseId: "case-001",
    filename: "Restore-My-Files.txt",
    rawText: `>>> LockBit 3.0 (Black) Ransomware Notice <<<
Your hospital files are encrypted and 1.8 TB of patient confidential records have been downloaded to our darknet servers.
If you do not pay $1,800,000 in Bitcoin within 72 hours, all patient medical histories and SSNs will be published to the public leak blog.
To decrypt your files, download Tor Browser and navigate to:
http://lockbitaptc2xnk7b5yvh7y5vxsq.onion/chat/8841
BTC Address: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`,
    detectedLanguage: "English",
    paymentDemands: {
      amount: 28.5,
      currency: "BTC",
      usdEquivalent: 1800000
    },
    wallets: ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"],
    torUrls: ["http://lockbitaptc2xnk7b5yvh7y5vxsq.onion/chat/8841"],
    emails: ["lockbithelp@onionmail.org"],
    keyExtortionPhrases: [
      "patient confidential records have been downloaded",
      "published to the public leak blog",
      "do not reset servers or modify files"
    ],
    matchedFamilySimilarity: 98.4,
    attributionLead: "LockBit Supporter Gang #31 (Affiliate Lead)"
  }
];

export const MOCK_BACKUP_SOURCES: BackupReadinessSource[] = [
  {
    id: "bak-001",
    sourceName: "AWS S3 Object Lock (Immutable Vault)",
    type: "IMMUTABLE_CLOUD",
    totalCapacityTB: 45.8,
    lastSnapshotTime: "2026-08-23T04:00:00Z (2 hours prior to attack)",
    isolationStatus: "FULLY_ISOLATED",
    integrityCheckStatus: "VERIFIED_CLEAN",
    recoveryFeasibilityPct: 98.5,
    estimatedRTOHours: 6.2,
    estimatedRPOHours: 2.0
  },
  {
    id: "bak-002",
    sourceName: "ZFS Storage SAN Air-Gapped Snapshots",
    type: "ZFS_SNAPSHOT",
    totalCapacityTB: 120.0,
    lastSnapshotTime: "2026-08-23T00:00:00Z",
    isolationStatus: "ONLINE_READONLY",
    integrityCheckStatus: "VERIFIED_CLEAN",
    recoveryFeasibilityPct: 92.0,
    estimatedRTOHours: 4.5,
    estimatedRPOHours: 6.0
  },
  {
    id: "bak-003",
    sourceName: "Offsite LTO-8 Tape Archive (Iron Mountain)",
    type: "AIR_GAPPED_TAPE",
    totalCapacityTB: 250.0,
    lastSnapshotTime: "2026-08-22T18:00:00Z",
    isolationStatus: "FULLY_ISOLATED",
    integrityCheckStatus: "VERIFIED_CLEAN",
    recoveryFeasibilityPct: 100.0,
    estimatedRTOHours: 14.0,
    estimatedRPOHours: 12.0
  },
  {
    id: "bak-004",
    sourceName: "Local Volume Shadow Copies (VSS)",
    type: "LOCAL_VSS",
    totalCapacityTB: 8.5,
    lastSnapshotTime: "2026-08-23T05:30:00Z",
    isolationStatus: "COMPROMISED",
    integrityCheckStatus: "ENCRYPTED",
    recoveryFeasibilityPct: 0.0,
    estimatedRTOHours: 0,
    estimatedRPOHours: 0
  }
];

export const MOCK_RECOVERY_PHASES: RecoveryPlanPhase[] = [
  {
    phaseNumber: 1,
    name: "Evidence Preservation & Network Isolation",
    description: "Cryptographically freeze all affected hypervisors, preserve RAM dumps, and isolate active Vlans.",
    status: "COMPLETED",
    tasks: [
      { id: "t-1", title: "Sever inter-Vlan routing and disable outbound Internet egress", assignedTo: "SecOps Team", status: "DONE", durationMinutes: 15 },
      { id: "t-2", title: "Capture live RAM dump on Domain Controller DC01.mercy.local", assignedTo: "Forensics Team", status: "DONE", durationMinutes: 25 },
      { id: "t-3", title: "Generate SHA-256 Merkle hashes for 24 encrypted VM disk images", assignedTo: "Aegis Evidence Engine", status: "DONE", durationMinutes: 45 }
    ]
  },
  {
    phaseNumber: 2,
    name: "Identity & Authentication Infrastructure Recovery",
    description: "Rebuild and validate Tier-0 Active Directory Domain Controllers in an isolated quarantine enclave.",
    status: "COMPLETED",
    tasks: [
      { id: "t-4", title: "Restore DC01 from immutable S3 backup (Snapshot 04:00 UTC)", assignedTo: "Infra Ops", status: "DONE", durationMinutes: 60 },
      { id: "t-5", title: "Enforce enterprise-wide Kerberos KRBTGT password reset (Double Roll)", assignedTo: "SecOps Lead", status: "DONE", durationMinutes: 30 },
      { id: "t-6", title: "Purge compromised Domain Admin account svc_backup_mgmt", assignedTo: "SecOps Team", status: "DONE", durationMinutes: 10 }
    ]
  },
  {
    phaseNumber: 3,
    name: "Critical Clinical & Business Systems Restoration",
    description: "Restore Epic EHR, PACS Medical Imaging, and MS SQL billing clusters into production sandbox.",
    status: "IN_PROGRESS",
    tasks: [
      { id: "t-7", title: "Restore SQL-PROD-01 database from ZFS Snapshot #20260823", assignedTo: "DBA Team", status: "RUNNING", durationMinutes: 120 },
      { id: "t-8", title: "Execute database consistency check (DBCC CHECKDB) on PatientDB", assignedTo: "DBA Lead", status: "PENDING", durationMinutes: 45 },
      { id: "t-9", title: "Restore PACS Imaging Archive storage node", assignedTo: "Storage Team", status: "PENDING", durationMinutes: 90 }
    ]
  },
  {
    phaseNumber: 4,
    name: "Integrity Verification & Reinfection Check",
    description: "Deep scan restored hosts for dormant web shells, scheduled tasks, and C2 beacons before production reconnect.",
    status: "QUEUED",
    tasks: [
      { id: "t-10", title: "Run Aegis Reinfection Hunter across all 24 restored VM guest OS", assignedTo: "Aegis AI Engine", status: "PENDING", durationMinutes: 30 },
      { id: "t-11", title: "Validate cryptographic checksums of all restored clinical binaries", assignedTo: "Integrity Validator", status: "PENDING", durationMinutes: 20 }
    ]
  },
  {
    phaseNumber: 5,
    name: "Production Reintegration & Continuous Monitoring",
    description: "Gradually reconnect clinical Vlans under 24/7 EDR micro-telemetry and canary surveillance.",
    status: "QUEUED",
    tasks: [
      { id: "t-12", title: "Obtain dual-custody authorization from CISO & Medical Director", assignedTo: "Executive Board", status: "PENDING", durationMinutes: 15 },
      { id: "t-13", title: "Enable production traffic routing and activate canary tripwire traps", assignedTo: "NetOps Team", status: "PENDING", durationMinutes: 20 }
    ]
  }
];

export const MOCK_REINFECTION_FINDINGS: ReinfectionFinding[] = [
  {
    id: "reinf-001",
    hostName: "DC01.mercy.local",
    ipAddress: "10.14.2.10",
    category: "PERSISTENCE",
    description: "Malicious scheduled task 'WindowsUpdateCheck_Svc' executing base64 encoded PowerShell stager at 03:00 AM daily",
    severity: "CRITICAL",
    mitreTechnique: "T1053.005 (Scheduled Task)",
    remediationAction: "Delete scheduled task and purge registry key HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Schedule\\TaskCache\\Tree\\WindowsUpdateCheck_Svc",
    status: "QUARANTINED"
  },
  {
    id: "reinf-002",
    hostName: "APP-IIS-04.mercy.local",
    ipAddress: "10.14.4.22",
    category: "WEBSHELL",
    description: "Obfuscated China Chopper / Godzilla web shell found in C:\\inetpub\\wwwroot\\portal\\error_handler.aspx",
    severity: "CRITICAL",
    mitreTechnique: "T1505.003 (Web Shell)",
    remediationAction: "Remove .aspx file and revoke IIS worker process write privileges on wwwroot",
    status: "CLEARED"
  },
  {
    id: "reinf-003",
    hostName: "HYPERV-NODE-02.mercy.local",
    ipAddress: "10.14.1.12",
    category: "C2_BEACON",
    description: "Periodic DNS TXT tunneling request beaconing to c2-healthcheck.dynamic-dns.net every 45 seconds",
    severity: "HIGH",
    mitreTechnique: "T1071.004 (DNS C2)",
    remediationAction: "Sinkhole domain at enterprise DNS resolver and kill rogue PID 4920",
    status: "CLEARED"
  }
];

export const MOCK_DIGITAL_TWIN: DigitalTwinNode[] = [
  { id: "dt-1", name: "Primary Domain Controller (DC01)", type: "IDENTITY_DC", tier: "TIER_0", financialHourlyImpactUSD: 85000, dependsOn: [], status: "RECOVERED" },
  { id: "dt-2", name: "Secondary Domain Controller (DC02)", type: "IDENTITY_DC", tier: "TIER_0", financialHourlyImpactUSD: 45000, dependsOn: ["dt-1"], status: "HEALTHY" },
  { id: "dt-3", name: "Epic EHR Database (SQL-CLINICAL)", type: "DATABASE", tier: "TIER_0", financialHourlyImpactUSD: 240000, dependsOn: ["dt-1"], status: "ENCRYPTED" },
  { id: "dt-4", name: "PACS Medical Imaging SAN", type: "STORAGE_SAN", tier: "TIER_1", financialHourlyImpactUSD: 120000, dependsOn: ["dt-1"], status: "ENCRYPTED" },
  { id: "dt-5", name: "Patient Portal Web Farm (IIS-01/02)", type: "APP_SERVER", tier: "TIER_2", financialHourlyImpactUSD: 35000, dependsOn: ["dt-1", "dt-3"], status: "STANDBY" },
  { id: "dt-6", name: "Billing & Claims Processing Engine", type: "APP_SERVER", tier: "TIER_1", financialHourlyImpactUSD: 95000, dependsOn: ["dt-3"], status: "ENCRYPTED" }
];

export const MOCK_CLEAN_VALIDATION_CHECKS: CleanValidationCheck[] = [
  {
    id: "chk-001",
    systemName: "DC01.mercy.local",
    ipAddress: "10.14.2.10",
    checks: [
      { name: "Rootkit & Driver Integrity", passed: true, details: "Kernel code integrity signed. No unbacked SSDT hooks detected." },
      { name: "Active Directory Account Audit", passed: true, details: "svc_backup_mgmt removed. KRBTGT password rolled twice." },
      { name: "Persistence Scan", passed: true, details: "0 dormant scheduled tasks or run keys." },
      { name: "Egress Filtering", passed: true, details: "Strict quarantine egress rules enforced." }
    ],
    overallStatus: "APPROVED_FOR_PROD",
    certifiedBy: "Marcus Vance, GCIH",
    timestamp: "2026-08-23T23:45:00Z"
  },
  {
    id: "chk-002",
    systemName: "SQL-CLINICAL-01.mercy.local",
    ipAddress: "10.14.3.15",
    checks: [
      { name: "DBCC CHECKDB Integrity", passed: true, details: "0 allocation errors and 0 consistency errors reported." },
      { name: "Binary Checksum Verification", passed: true, details: "sqlservr.exe hash matches Microsoft baseline." },
      { name: "Malicious Trigger Check", passed: true, details: "No rogue DDL triggers or unauthorized xp_cmdshell calls." },
      { name: "Backup Verification", passed: true, details: "Point-in-time recovery to 04:00 UTC verified clean." }
    ],
    overallStatus: "APPROVED_FOR_PROD",
    certifiedBy: "Elena Rostova, CISSP",
    timestamp: "2026-08-24T00:10:00Z"
  }
];

export const MOCK_READINESS_AUDIT = {
  overallScore: 78,
  breakdown: {
    backupReadiness: 90,
    identityResilience: 62,
    recoveryTesting: 45,
    networkSegmentation: 82,
    airgapCoverage: 88,
    runbookAutomation: 74
  },
  recommendations: [
    { id: "rec-1", priority: "CRITICAL", title: "Test restoration of identity infrastructure (AD DC forest recovery) in air-gapped sandbox quarterly." },
    { id: "rec-2", priority: "HIGH", title: "Enforce AWS S3 Object Lock Compliance Mode across secondary PACS imaging archives." },
    { id: "rec-3", priority: "MEDIUM", title: "Automate daily DBCC CHECKDB validation pipelines on all clinical database replicas." }
  ]
};
