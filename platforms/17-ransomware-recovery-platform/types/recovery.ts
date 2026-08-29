export type IncidentSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type IncidentStatus = "TRIAGE" | "CONTAINED" | "ANALYZING" | "RECOVERING" | "VALIDATING" | "RESOLVED" | "CLOSED";
export type RecoveryPathStatus = "AVAILABLE" | "FEASIBLE_WITH_EFFORT" | "BACKUP_ONLY" | "UNAVAILABLE" | "EXPERIMENTAL";
export type ReinfectionRiskLevel = "CRITICAL" | "HIGH" | "MODERATE" | "CLEAN";

export interface RansomwareCase {
  id: string;
  caseNumber: string;
  title: string;
  organization: string;
  industry: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  ransomwareFamily: string;
  confidenceScore: number;
  threatActor: string;
  affectedHosts: number;
  affectedFiles: number;
  totalDataSizeGB: number;
  ransomDemandUSD: number;
  cryptoCurrency: string;
  walletAddress: string;
  torNegotiationUrl: string;
  deadlineTimestamp: string;
  dataExfiltrationLikelihood: "CONFIRMED" | "HIGH" | "SUSPECTED" | "LOW";
  primaryRecoveryPath: RecoveryPathStatus;
  reinfectionRisk: ReinfectionRiskLevel;
  estimatedRecoveryTimeHours: number;
  assignedLead: string;
  leadRole: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
}

export interface EncryptedFilePattern {
  id: string;
  sampleName: string;
  extensionAppended: string;
  originalExtension: string;
  headerDamageBytes: number;
  encryptionMode: "FULL" | "INTERMITTENT" | "HEADER_ONLY" | "BLOCK_CIPHER";
  cipherAlgorithm: string;
  keySizeBits: number;
  ivLengthBytes: number;
  entropyScore: number;
  footerMetadataPresent: boolean;
  canaryMarker: string;
}

export interface RansomNoteIntel {
  id: string;
  caseId: string;
  filename: string;
  rawText: string;
  detectedLanguage: string;
  paymentDemands: {
    amount: number;
    currency: string;
    usdEquivalent: number;
  };
  wallets: string[];
  torUrls: string[];
  emails: string[];
  keyExtortionPhrases: string[];
  matchedFamilySimilarity: number;
  attributionLead: string;
}

export interface BackupReadinessSource {
  id: string;
  sourceName: string;
  type: "IMMUTABLE_CLOUD" | "AIR_GAPPED_TAPE" | "ZFS_SNAPSHOT" | "SAN_REPLICA" | "LOCAL_VSS";
  totalCapacityTB: number;
  lastSnapshotTime: string;
  isolationStatus: "FULLY_ISOLATED" | "ONLINE_READONLY" | "SHARED_NETWORK" | "COMPROMISED";
  integrityCheckStatus: "VERIFIED_CLEAN" | "PARTIAL_DAMAGE" | "ENCRYPTED" | "UNTESTED";
  recoveryFeasibilityPct: number;
  estimatedRTOHours: number;
  estimatedRPOHours: number;
}

export interface RecoveryPlanPhase {
  phaseNumber: number;
  name: string;
  description: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING_APPROVAL" | "QUEUED";
  tasks: {
    id: string;
    title: string;
    assignedTo: string;
    status: "DONE" | "RUNNING" | "PENDING";
    durationMinutes: number;
  }[];
}

export interface ReinfectionFinding {
  id: string;
  hostName: string;
  ipAddress: string;
  category: "PERSISTENCE" | "CREDENTIAL_COMPROMISE" | "C2_BEACON" | "WEBSHELL" | "UNPATCHED_CVE";
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  mitreTechnique: string;
  remediationAction: string;
  status: "ACTIVE" | "CLEARED" | "QUARANTINED";
}

export interface CleanValidationCheck {
  id: string;
  systemName: string;
  ipAddress: string;
  checks: {
    name: string;
    passed: boolean;
    details: string;
  }[];
  overallStatus: "APPROVED_FOR_PROD" | "REQUIRES_REMEDIATION" | "BLOCKED";
  certifiedBy: string;
  timestamp: string;
}

export interface DigitalTwinNode {
  id: string;
  name: string;
  type: "IDENTITY_DC" | "DATABASE" | "APP_SERVER" | "STORAGE_SAN" | "ENDPOINT_WORKSTATION";
  tier: "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3";
  financialHourlyImpactUSD: number;
  dependsOn: string[];
  status: "ENCRYPTED" | "RECOVERED" | "STANDBY" | "HEALTHY";
}

export interface IOCItem {
  id: string;
  type: "IP" | "DOMAIN" | "HASH_SHA256" | "BITCOIN_WALLET" | "ONION_HOST" | "REGISTRY_KEY";
  value: string;
  threatActor: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  firstSeen: string;
  detectionSource: string;
  reputationScore: number;
  status: "ACTIVE_BLOCK" | "MONITORING" | "SINKHOLED" | "WHITELISTED";
}

export interface MitreAttackMapping {
  phase: "Initial Access" | "Execution" | "Persistence" | "Privilege Escalation" | "Defense Evasion" | "Credential Access" | "Lateral Movement" | "Exfiltration" | "Impact";
  techniqueId: string;
  techniqueName: string;
  description: string;
  detectedArtifact: string;
  status: "DETECTED" | "MITIGATED" | "INVESTIGATING";
}

export interface C2BeaconTrace {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  destDomain: string;
  protocol: string;
  port: number;
  payloadBytes: number;
  beaconIntervalSec: number;
  threatVerdict: "MALICIOUS_C2" | "SUSPICIOUS_HEURISTIC" | "BENIGN_TELEMETRY";
  actionTaken: "BLOCKED_SNORT" | "DNS_SINKHOLE" | "ISOLATED_HOST" | "MONITORING";
}

export interface AnalystNote {
  id: string;
  caseId: string;
  author: string;
  role: string;
  timestamp: string;
  category: "INTEL" | "CONTAINMENT" | "DECRYPTION_HYPOTHESIS" | "CHAIN_OF_CUSTODY";
  content: string;
  signatureHash: string;
  isVerified: boolean;
}

export interface StorageVolumeRestore {
  id: string;
  volumeName: string;
  storageType: "ZFS_POOL" | "HYPERV_VHDX" | "ESXI_VMFS" | "NETAPP_LUN" | "PURE_FLASH";
  clusterNode: string;
  totalCapacityTB: number;
  restoredTB: number;
  restoreSpeedMBs: number;
  progressPct: number;
  status: "RESTORING" | "VERIFYING_INTEGRITY" | "COMPLETED" | "PAUSED" | "QUEUED";
  sourceSnapshot: string;
  rtoEstimateMinutes: number;
}

export interface HostRebootSequence {
  step: number;
  hostName: string;
  role: string;
  tier: "TIER_0" | "TIER_1" | "TIER_2";
  preflightCheck: "PASSED" | "WARNING" | "PENDING";
  status: "POWERED_ON" | "REBOOTING" | "STAGED_ISOLATED" | "WAITING_DEPENDENCY";
  vlanEnclave: string;
  postRebootHealth: number; // %
}

export interface CampaignNexus {
  id: string;
  campaignCode: string;
  threatActor: string;
  ransomwareVariant: string;
  firstObserved: string;
  activeAffiliateCluster: string;
  targetedSectors: string[];
  totalDemandedUSD: number;
  correlatedTenants: string[];
  sharedWallets: string[];
  sharedTorMirrors: string[];
  sharedExtensions: string[];
  confidenceScore: number;
}

export interface ChainOfCustodyItem {
  id: string;
  evidenceTag: string;
  description: string;
  sourceDevice: string;
  itemType: "RAM_IMAGE" | "DISK_VHDX" | "PCAP" | "EVENT_LOGS" | "RANSOM_SAMPLE";
  md5: string;
  sha256: string;
  acquiredBy: string;
  acquisitionTimestamp: string;
  storageLocation: string;
  freStatus: "FRE_901_CERTIFIED" | "PENDING_VERIFICATION" | "CHAIN_BROKEN";
}

// Pillar 4: Pre-Incident Recovery Readiness
export interface ReadinessDimension {
  id: string;
  name: string;
  weight: number;
  score: number; // 0-100
  status: "OPTIMAL" | "ADEQUATE" | "NEEDS_IMPROVEMENT" | "CRITICAL_GAP";
  description: string;
  keyMetrics: { label: string; value: string; compliant: boolean }[];
  recommendedActions: string[];
}

export interface ReadinessPostureAudit {
  overallScore: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  lastAuditDate: string;
  auditor: string;
  complianceFrameworks: { name: string; score: number; passed: boolean }[];
  dimensions: ReadinessDimension[];
}

// Pillar 4: Tabletop Simulation & Exercise Mode
export interface SimulationScenario {
  id: string;
  title: string;
  threatActor: string;
  family: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "CATASTROPHIC";
  targetSector: string;
  estimatedDurationMin: number;
  description: string;
  initialInfectionVector: string;
  targetAssets: string[];
  stagesCount: number;
  injects: {
    minute: number;
    title: string;
    description: string;
    choices: { text: string; rtoImpactMin: number; riskImpactPct: number; feedback: string }[];
  }[];
}

// Pillar 5: Dual-Custody Approval & Governance
export interface ApprovalRequest {
  id: string;
  actionType: "MASS_DECRYPTION" | "KERBEROS_DOUBLE_ROLL" | "DB_RESTORE_OVERWRITE" | "ENCLAVE_RECONNECT" | "RANSOM_PAYMENT_AUTH" | "EVIDENCE_SANITIZATION";
  title: string;
  description: string;
  requestedBy: string;
  requestorRole: string;
  timestamp: string;
  status: "PENDING_SIGNATURES" | "APPROVED" | "REJECTED" | "EXECUTED";
  requiredSignatures: number;
  currentSignatures: {
    signerName: string;
    role: string;
    signedAt: string;
    signatureHash: string;
    decision: "APPROVE" | "REJECT";
  }[];
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  affectedScope: string;
  expiresInMinutes: number;
}

// Pillar 5: Multi-Tenant Isolation & RBAC
export interface TenantAccount {
  id: string;
  name: string;
  code: string;
  tier: "ENTERPRISE_PLUS" | "MSSP_MANAGED" | "GOV_ENCLAVE" | "COMMERCIAL";
  status: "ACTIVE_INCIDENT" | "HEALTHY_MONITORED" | "ISOLATED_QUARANTINE" | "ONBOARDING";
  industry: string;
  activeIncidentsCount: number;
  dataResidencyRegion: string;
  cmekKeyId: string;
  cmekStatus: "HSM_PROTECTED" | "ROTATING" | "ACTIVE";
  retentionDays: number;
  userCount: number;
  totalStorageTB: number;
}

export interface TenantAuditLog {
  id: string;
  timestamp: string;
  tenantId: string;
  tenantName: string;
  actor: string;
  action: string;
  ipAddress: string;
  resource: string;
  outcome: "SUCCESS" | "DENIED" | "BLOCKED_BY_POLICY";
}

// Pillar 5: Enterprise Integrations
export interface EnterpriseConnector {
  id: string;
  name: string;
  category: "SIEM_XDR" | "EDR" | "IDENTITY" | "HYPERVISOR_CLOUD" | "BACKUP_STORAGE";
  vendor: string;
  version: string;
  status: "CONNECTED" | "SYNCING" | "DEGRADED" | "DISCONNECTED";
  lastSyncTimestamp: string;
  syncEventsPerMinute: number;
  description: string;
  authMethod: "OAUTH2" | "MUTUAL_TLS" | "API_KEY_SECRET" | "SAML_SCIM";
  featuresEnabled: string[];
  latencyMs: number;
}

// Pillar 5: Predictive Recovery AI
export interface RecoveryPathwayOption {
  id: string;
  name: string;
  strategyType: "IMMUTABLE_S3_RESTORE" | "HYPERVISOR_ROLLBACK" | "CRYPTO_KEY_DECRYPT" | "AIR_GAP_TAPE_INGEST";
  successProbabilityPct: number;
  estimatedRTOHours: number;
  estimatedDataLossPct: number;
  reinfectionRiskScore: number; // 0-100
  financialCostUSD: number;
  recommended: boolean;
  pros: string[];
  cons: string[];
}

// Pillar 5: Knowledge Base
export interface RansomwareEncyclopediaEntry {
  id: string;
  familyName: string;
  aliases: string[];
  threatActors: string[];
  firstObserved: string;
  cipherAlgorithms: string[];
  keyExchangeMethod: string;
  encryptionMode: "Full" | "Intermittent" | "Header-Only" | "Block-Cipher";
  fileExtensions: string[];
  ransomNoteFilenames: string[];
  decryptorStatus: "DECRYPTOR_AVAILABLE" | "FLAW_EXPLOITABLE" | "PARTIAL_RECOVERY" | "UNBREAKABLE_BACKUP_ONLY";
  decryptorName?: string;
  decryptorAuthor?: string;
  knownFlaws: string;
  mitreTechniques: string[];
  targetOperatingSystems: string[];
  yaraRulePreview: string;
  sampleSha256: string;
}

// Stage 5: Data Exfiltration & Double-Extortion Assessor
export interface StagedArchive {
  id: string;
  fileName: string;
  path: string;
  toolUsed: "7-Zip (7z.exe)" | "WinRAR (rar.exe)" | "rclone" | "MEGAcmd" | "Restic" | "Dropbox Sync" | "PowerShell Tar";
  archiveFormat: "7z (AES-256)" | "RAR5 (Encrypted Header)" | "ZIP (Split Volume)" | "TAR.GZ" | "Encrypted Payload";
  sizeMB: number;
  fileCount: number;
  stagingHost: string;
  stagingDirectory: string;
  discoveredTimestamp: string;
  status: "STAGED_LOCAL" | "UPLOAD_IN_PROGRESS" | "EXFILTRATED" | "QUARANTINED" | "INTERCEPTED";
  exfilCloudTarget?: string;
  commandLineEvidence: string;
  sha256: string;
}

export interface OutboundEgressFlow {
  id: string;
  timestamp: string;
  sourceHost: string;
  sourceIp: string;
  destinationIp: string;
  destinationDomain: string;
  destinationService: "MEGA.nz" | "Dropbox API" | "MegaSync" | "Custom VPS C2" | "AnonFiles" | "AWS S3 Rogue Bucket" | "Wasabi Cloud";
  protocol: string;
  port: number;
  transferredMB: number;
  transferSpeedMBs: number;
  status: "ACTIVE_BURST" | "COMPLETED" | "BLOCKED_FIREWALL" | "THROTTLED";
  mitreTechnique: string;
  threatVerdict: "CONFIRMED_EXFILTRATION" | "SUSPICIOUS_HIGH_VOLUME" | "ANOMALOUS_UPLOAD";
}

export interface DataExposureDataset {
  id: string;
  directoryPath: string;
  category: "PII" | "HIPAA_PHI" | "PCI_DSS" | "INTELLECTUAL_PROPERTY" | "FINANCIAL_LEDGER" | "CORP_CREDENTIALS";
  recordCount: number;
  sizeGB: number;
  sensitivityLevel: "CRITICAL" | "HIGH" | "CONFIDENTIAL" | "INTERNAL";
  stagedInArchive: boolean;
  legalNotificationRequired: boolean;
  sampleDataTypes: string[];
  regulationsTriggered: ("HIPAA OCR" | "GDPR Art. 33" | "SEC Item 1.05" | "PCI DSS §12" | "State AG Laws")[];
}

// Stage 6: Air-Gapped Clean Recovery Zone Orchestrator (IRE)
export interface IREZone {
  id: string;
  name: string;
  vlanTag: number;
  vSwitch: string;
  hypervisorCluster: string;
  isolationLevel: "TRUE_AIRGAP_DISCONNECTED" | "MICROSEGMENTED_QUARANTINE" | "DIODE_ONE_WAY_EGRESS" | "INSPECTION_TUNNEL";
  status: "READY" | "PROVISIONING" | "ACTIVE_ANALYSIS" | "FAILSAFE_ISOLATED";
  activeHostsCount: number;
  allocatedCores: number;
  allocatedRAMGB: number;
  allocatedStorageTB: number;
  wormStorageAttached: boolean;
  canaryTripwiresArmed: boolean;
}

export interface JumpBoxSession {
  id: string;
  analyst: string;
  role: string;
  ipAddress: string;
  targetHost: string;
  targetZone: string;
  mfaVerified: boolean;
  dualSignerApproval: string;
  sessionStarted: string;
  durationMinutes: number;
  kernelKeyloggerActive: boolean;
  status: "ACTIVE" | "TERMINATED" | "IDLE" | "FLAGGED_BEHAVIOR";
}

export interface CleanRoomRebuildJob {
  id: string;
  vmName: string;
  goldenImageBaseline: string;
  osType: "Windows Server 2022" | "Windows Server 2019" | "RHEL 9.2" | "Ubuntu 22.04 LTS";
  slipstreamPatchesCount: number;
  firmwareVerification: "PASSED_TPM2_SECUREBOOT" | "FIRMWARE_VERIFIED" | "PENDING_CHECK";
  driverSignatureEnforced: boolean;
  progressPct: number;
  status: "BUILDING" | "SCANNING_YARA" | "VERIFYING_INTEGRITY" | "CERTIFIED_CLEAN" | "FAILED";
  assignedEngineer: string;
  rtoMinutesRemaining: number;
}

// Stage 8: Recovery Confidence Index (RCI) Calculator
export interface RCIComponentScore {
  key: string;
  name: string;
  category: "AVAILABILITY" | "INTEGRITY" | "FRESHNESS" | "ERADICATION" | "IDENTITY" | "REINFECTION";
  score: number; // 0-100
  weight: number; // e.g. 0.20
  baselineBenchmark: number;
  description: string;
  status: "OPTIMAL" | "ADEQUATE" | "AT_RISK" | "CRITICAL_GAP";
  auditMetrics: { label: string; value: string; pass: boolean }[];
  impactOnOverall: number;
}

export interface RCIScenario {
  id: string;
  title: string;
  description: string;
  deltaRCI: number;
  applied: boolean;
  category: "IDENTITY" | "BACKUP" | "CONTAINMENT" | "DECRYPTION" | "FORENSICS";
  remediationAction: string;
}

export interface RCIGapRemediation {
  id: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  title: string;
  componentKey: string;
  potentialScoreBoost: number;
  effortHours: number;
  owner: string;
  status: "ACTION_REQUIRED" | "IN_EXECUTION" | "COMPLETED";
}

// Stage 8: Regulatory Assessment & Compliance Disclosure Generator
export interface RegulatoryDeadline {
  id: string;
  framework: "HIPAA Breach Notification Rule" | "SEC Form 8-K Item 1.05" | "GDPR Article 33" | "OFAC Sanctions & Ransomware Advisory" | "NYDFS Part 500.17" | "DORA EU";
  regulatoryBody: string;
  statutoryLimitHours: number;
  elapsedHours: number;
  remainingHours: number;
  triggerEvent: string;
  status: "SAFE" | "WARNING" | "CRITICAL" | "REPORTED" | "EXEMPT";
  penaltiesSummary: string;
  filingPrerequisites: { task: string; completed: boolean }[];
  legalCitation: string;
}

export interface OFACSanctionAudit {
  walletScanned: string;
  threatActor: string;
  ransomFamily: string;
  sdnMatch: boolean;
  sdnListScore: number; // 0-100
  chainalysisRiskScore: "SEVERE_SANCTIONS_RISK" | "HIGH_RISK_ASSOCIATION" | "UNREGISTERED_MIXER" | "LOW_RISK_CLEAN";
  complianceVerdict: "PAYMENT_STRICTLY_PROHIBITED" | "HIGH_PENALTY_EXPOSURE" | "OFAC_LICENSE_REQUIRED" | "COMPLIANT_WITH_TREASURY_GUIDANCE";
  advisoryNote: string;
  checkedTimestamp: string;
}

// Stage 8: Platform Self-Disaster Recovery & Break-Glass Vault
export interface PlatformDRHealth {
  component: string;
  role: string;
  haStatus: "ACTIVE_SYNCHRONIZED" | "STANDBY_COLD" | "AIRGAP_OFFLINE" | "DEGRADED";
  replicationLatencyMs: number;
  lastSnapshotUtc: string;
  integrityHash: string;
  storageTarget: string;
}

export interface BreakGlassVaultState {
  vaultStatus: "LOCKED_ARMED" | "BREAK_GLASS_PENDING_QUORUM" | "EMERGENCY_DECRYPTED" | "SEALED_QUARANTINE";
  requiredQuorum: number;
  activeSigners: number;
  signers: { name: string; role: string; keyShardHeld: string; approved: boolean; timestamp?: string }[];
  emergencyMasterKeyFingerprint: string;
  lastAuditAttestation: string;
}

export interface OfflineUSBManifest {
  usbVolumeId: string;
  encryptionMode: "XTS-AES-256 (Hardware Encrypted)" | "FIPS 140-3 Level 3";
  firmwareHash: string;
  offlinePackagesCount: number;
  yaraSignaturesVersion: string;
  decryptorBinariesIncluded: string[];
  standaloneDatabaseSnapshotDate: string;
  hardwareTokenId: string;
  lastOfflineDrillPassed: string;
}


// ==========================================
// PROACTIVE & INVESTIGATIVE STUDIO TYPES
// ==========================================

// 1. Attack Path & Chokepoint Types
export interface AttackPathNode {
  id: string;
  label: string;
  type: "ENTRY_POINT" | "WORKSTATION" | "CREDENTIAL_STORE" | "DOMAIN_CONTROLLER" | "HYPERVISOR" | "BACKUP_REPO" | "DATABASE" | "CLOUD_CONTROL";
  zone: "PERIMETER" | "USER_SUBNET" | "CORE_IDENTITY" | "DATA_TIER" | "BACKUP_VAULT";
  x: number;
  y: number;
  ip: string;
  os: string;
  compromised: boolean;
  criticality: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  vulnerabilities: string[];
  privileges: string;
  blastRadiusHosts: number;
}

export interface AttackPathEdge {
  id: string;
  source: string;
  target: string;
  protocol: "SMB" | "RDP" | "KERBEROS_TGS" | "LSASS_INJECTION" | "WMI_EXEC" | "CLOUD_IAM_ASSUME" | "SSH" | "RPC";
  technique: string;
  mitreId: string;
  isChokepoint: boolean;
  chokepointName?: string;
  chokepointRemediation?: string;
  disabled?: boolean;
  riskScore: number;
}

export interface ChokepointRecommendation {
  id: string;
  title: string;
  description: string;
  edgeId: string;
  sourceNode: string;
  targetNode: string;
  impactReductionPct: number;
  effort: "LOW" | "MEDIUM" | "HIGH";
  mitigationType: "CONFIG_CHANGE" | "GPO_POLICY" | "NETWORK_MICROSEG" | "CREDENTIAL_TIERING";
  implementationCommand: string;
  isApplied: boolean;
}

// 2. Backup Verification & Auto-Drills Types
export interface BackupDrillTest {
  id: string;
  drillName: string;
  backupSourceId: string;
  sourceType: "AWS_S3_OBJECT_LOCK" | "ZFS_SNAPSHOT" | "LTO8_AIRGAP_TAPE" | "PURE_STORAGE_FLASH";
  storageLocation: string;
  snapshotTimestamp: string;
  frequency: "HOURLY" | "DAILY_AUTOMATED" | "WEEKLY_DEEP" | "MONTHLY_AIRGAP";
  status: "PASSED" | "RUNNING" | "FAILED" | "DEGRADED" | "SCHEDULED";
  sandboxMicroVmId: string;
  vmBootTimeSec: number;
  dbccCheckDbResult: "PASSED_0_ERRORS" | "CORRUPTED_PAGES" | "RUNNING" | "SKIPPED";
  totalDataSizeGB: number;
  restoreThroughputGBMin: number;
  actualRTOMinutes: number;
  targetRTOMinutes: number;
  slaVarianceMinutes: number; // actual - target
  sha256MerkleRoot: string;
  lastRunTimestamp: string;
  nextRunTimestamp: string;
  testLogs: string[];
}

export interface BackupStorageTierStats {
  tierName: string;
  type: string;
  totalTB: number;
  immutabilityMode: "WORM_COMPLIANCE" | "ZFS_READONLY" | "PHYSICAL_AIRGAP" | "SAFE_MODE_LOCK";
  avgThroughputGBMin: number;
  meanRTOHours: number;
  targetRTOHours: number;
  complianceRatePct: number;
  lastDrillSuccess: boolean;
}

// 3. Automated Containment & Policy Engine Types
export type ContainmentAutomationMode = 
  | "MODE_1_ADVISORY" 
  | "MODE_2_ASSISTED" 
  | "MODE_3_SEMI_AUTONOMOUS" 
  | "MODE_4_HIGHLY_AUTONOMOUS";

export interface ContainmentPolicyRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerEvent: string;
  severityThreshold: "CRITICAL" | "HIGH" | "MEDIUM";
  mlConfidenceThreshold: number; // 0-100
  actions: ("BGP_EGRESS_CUTOFF" | "S3_WORM_FREEZE" | "AD_KRBTGT_DOUBLE_ROLL" | "EDR_HOST_ISOLATE" | "SMB_PORT_BLOCK" | "REVOKE_ACTIVE_SESSIONS")[];
  autoExecutionMode: ContainmentAutomationMode;
  falsePositiveGuard: string;
  executionCount: number;
  avgResponseTimeMs: number;
}

export interface EmergencyLockdownControl {
  id: string;
  name: string;
  actionCode: string;
  description: string;
  currentStatus: "ARMED_READY" | "ENGAGED_ACTIVE" | "DEGRADED" | "OVERRIDDEN";
  targetScope: string;
  latencySeconds: number;
  reversible: boolean;
  warningText: string;
}

export interface ContainmentAuditLogItem {
  id: string;
  timestamp: string;
  ruleTriggered: string;
  mode: ContainmentAutomationMode;
  targetHostOrVlan: string;
  actionSummary: string;
  executedBy: string;
  durationMs: number;
  status: "SUCCESS" | "PENDING_AUTH" | "BLOCKED_BY_GUARD" | "ROLLBACK";
}

// 4. Pre-Encryption ML Progression Types
export interface MLProgressionSample {
  id: string;
  processName: string;
  processId: number;
  parentProcess: string;
  userAccount: string;
  hostName: string;
  timestamp: string;
  classification: "MALICIOUS_STAGER" | "BENIGN_SYSADMIN" | "SUSPICIOUS_HEURISTIC";
  overallConfidencePct: number; // e.g. 99.4%
  currentProgressionPhase: "RECON" | "PRIVILEGE_STAGING" | "VSS_SHADOW_KILL" | "CANARY_TRIP" | "PRE_ENCRYPTION_BURST" | "CONTAINED";
  progressionScore: number; // 0 - 100
  featureAttributions: {
    featureName: string;
    weightPct: number;
    value: string;
    description: string;
    isAnomalous: boolean;
  }[];
  commandLine: string;
  fileOperationsPerSec: number;
  entropyJump: number;
  vssDeleteAttempted: boolean;
  edrTamperingDetected: boolean;
}

export interface MLModelMetric {
  precisionPct: number;
  recallPct: number;
  f1Score: number;
  aucRoc: number;
  falsePositiveRatePct: number;
  inferenceLatencyMs: number;
  trainingSamplesCount: number;
}

// 5. Root Cause Correlator Types
export interface RootCauseEvent {
  id: string;
  phase: "INITIAL_ACCESS" | "DEFENSE_EVASION" | "CREDENTIAL_DUMPING" | "LATERAL_MOVEMENT" | "PRE_RANSOMWARE_STAGING" | "IMPACT";
  timestamp: string;
  title: string;
  host: string;
  actorOrAccount: string;
  mitreId: string;
  confidenceScore: number; // 0 - 100
  description: string;
  evidenceType: "PCAP_STREAM" | "EVENT_LOG_4624" | "SYSMON_EID1" | "LSASS_MEMDUMP" | "FIREWALL_FLOW" | "POWERSHELL_TRANSCRIPT";
  evidenceArtifactId: string;
  rawLogSnippet: string;
  isPivotalRootCause: boolean;
}

export interface CompromisedAccountEntity {
  accountName: string;
  accountType: "DOMAIN_ADMIN" | "SERVICE_ACCOUNT" | "VPN_USER" | "ENTERPRISE_ADMIN" | "LOCAL_SYSTEM";
  initialCompromiseTime: string;
  compromiseVector: string;
  lateralHopsCount: number;
  kerberosTicketsForged: number;
  remediationStatus: "REVOKED_AND_ROLLED" | "DISABLED" | "PENDING_AUDIT";
}

export interface ForensicEvidenceLink {
  id: string;
  name: string;
  type: string;
  sizeBytes: string;
  sha256: string;
  chainOfCustodyVerified: boolean;
  sourceHost: string;
  captureTime: string;
}


// Proactive Studio 1: Early Warning Engine
export interface EarlyWarningEvent {
  id: string;
  timestamp: string;
  type: "FILE_BURST" | "VSS_DELETE_ATTEMPT" | "ENTROPY_SPIKE" | "SMB_MASS_CONNECT" | "CANARY_TOUCH" | "ENCRYPTION_HEURISTIC";
  host: string;
  ipAddress: string;
  processName: string;
  pid: number;
  parentProcess: string;
  parentPid: number;
  userAccount: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  details: string;
  fileRatePerMin?: number;
  entropyValue?: number;
  commandLine?: string;
  riskScoreContribution: number;
  status: "ACTIVE_ALERT" | "INTERCEPTED" | "CONTAINED" | "INVESTIGATING";
}

export interface EarlyWarningRiskMetrics {
  currentRiskScore: number;
  alertThreshold: number;
  filesModifiedLastMin: number;
  averageEntropy: number;
  vssTamperAttempts: number;
  activeSmbBursts: number;
  monitoredEndpoints: number;
  activeIntercepts: number;
}

// Proactive Studio 2: Canary Deception Grid
export interface CanaryTrapFile {
  id: string;
  shareName: string;
  uncPath: string;
  fileName: string;
  fileType: "DOCX" | "XLSX" | "PDF" | "MDF" | "ENV" | "KDBX" | "SQL";
  fileSizeBytes: number;
  originalSha256: string;
  deployedAt: string;
  status: "ARMED" | "TRIPPED" | "MONITORING" | "QUARANTINED";
  tripwireType: "SUB_500MS_FS_NOTIFY" | "MINIFILTER_DRIVER" | "SMB_ACCESS_AUDIT";
  lastHeartbeat: string;
  lastTamperTime?: string;
  tamperingProcess?: {
    pid: number;
    processName: string;
    executableHash: string;
    userAccount: string;
    parentProcess: string;
    parentPid: number;
    tamperedSha256: string;
    entropyJump: number;
  };
}

export interface CanaryTripEvent {
  id: string;
  timestamp: string;
  canaryId: string;
  shareName: string;
  filePath: string;
  sourceHost: string;
  sourceIp: string;
  roguePid: number;
  rogueProcess: string;
  userAccount: string;
  readLatencyMs: number;
  writeLatencyMs: number;
  originalHash: string;
  payloadHash: string;
  quarantineTriggered: boolean;
  microSegmentationRule: string;
}

// Proactive Studio 3: Identity Attack & Active Directory Defense
export interface IdentityAttackEvent {
  id: string;
  timestamp: string;
  attackType: "DCSYNC" | "GOLDEN_TICKET" | "SILVER_TICKET" | "KERBEROASTING" | "UNAUTHORIZED_DOMAIN_ADMIN" | "ASREP_ROASTING" | "SHADOW_ADMIN_ACL";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  sourceHost: string;
  sourceIp: string;
  targetAccount: string;
  targetDomainController: string;
  mitreId: string;
  protocol: "RPC / MS-DRSR" | "KERBEROS / TGS" | "LDAP" | "SAMR" | "KERBEROS / AS-REQ";
  rawArtifact: string;
  status: "DETECTED" | "CONTAINED" | "MITIGATED" | "INVESTIGATING";
  riskImpact: string;
}

export interface IdentityRecoveryStep {
  stepNumber: number;
  title: string;
  actionCode: "BREAK_GLASS_LOGIN" | "KRBTGT_DOUBLE_ROLL" | "ROGUE_SPN_PURGE" | "DC_FOREST_RESTORE" | "DSRM_RECOVERY" | "CLEAN_REPLICATION";
  description: string;
  status: "COMPLETED" | "IN_PROGRESS" | "READY" | "BLOCKED" | "WAITING_CONFIRMATION";
  estimatedTimeMin: number;
  logs: string[];
  commandPreview: string;
}

// Proactive Studio 4: Ransomware Attack Surface Manager
export interface ExposedAttackAsset {
  id: string;
  hostname: string;
  ipAddress: string;
  exposureType: "RDP_EXPOSED" | "VULNERABLE_VPN" | "EXCHANGE_PROXYSHELL" | "EXPOSED_VNC" | "OPEN_SMB" | "PUBLIC_S3" | "UNAUTH_API";
  servicePort: number;
  serviceBanner: string;
  vulnerabilityCve: string;
  cvssScore: number;
  assetCriticality: "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3";
  ransomwareAffinities: ("LockBit" | "BlackCat" | "Akira" | "Play" | "Medusa" | "Black Basta" | "Cl0p")[];
  exploitAvailability: "ACTIVE_WORM" | "PUBLIC_EXPLOIT" | "POC_AVAILABLE" | "THEORETICAL";
  exposureIndexScore: number;
  firstDiscovered: string;
  lastScanned: string;
  remediationStatus: "UNMITIGATED" | "HARDENED" | "PORT_BLOCKED" | "PATCH_SCHEDULED";
}

// Proactive Studio 5: Vulnerability Prioritizer
export interface RansomwareVulnerability {
  id: string;
  cveId: string;
  title: string;
  affectedSoftware: string;
  cvssScore: number;
  epssProbabilityPct: number;
  cisaKevKnownRansomware: boolean;
  weaponizedGroups: string[];
  lateralMovementPotential: number; // 1 - 10
  assetTier: "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3";
  calculatedRiskScore: number; // 0 - 100
  patchSlaHours: number;
  timeRemainingHours: number;
  patchStatus: "OVERDUE" | "ACTION_REQUIRED" | "IN_PROGRESS" | "PATCHED";
  affectedAssetsCount: number;
  runbookSnippet: string;
  mitigationSteps: string[];
}

// ----------------------------------------------------
// Flagship Studio 1: eBPF Freeze & In-Memory Key Rescue
// ----------------------------------------------------
export interface EbpfMonitoredProcess {
  pid: number;
  ppid: number;
  name: string;
  exePath: string;
  sha256: string;
  user: string;
  osType: "WINDOWS_FLTMGR" | "LINUX_EBPF";
  status: "FROZEN" | "MONITORING" | "TRIPPED" | "PREVENTED_ZEROIZATION";
  filesModifiedCount: number;
  entropyJumpDelta: number;
  writeBurstIops: number;
  hookTracepoint: string;
  freezeLatencyMs: number;
  ramDumpAvailable: boolean;
  carvedKeysCount: number;
  detectedFamily: string;
}

export interface CarvedKeyCandidate {
  id: string;
  pid: number;
  algorithm: "AES-256-CBC" | "AES-256-CTR" | "RSA-2048-CRT" | "CHACHA20" | "CURVE25519";
  memoryOffsetHex: string;
  memoryRegion: string;
  keyBytesHex: string;
  entropy: number;
  verificationConfidencePct: number;
  expandedRounds?: string[];
  privateExponentSnippet?: string;
  chachaStateMatrix?: number[][];
  status: "CONFIRMED_VALID" | "CANDIDATE" | "ZEROIZED_ATTEMPT_BLOCKED";
  discoveredAt: string;
}

// ----------------------------------------------------
// Flagship Studio 2: Diff Reconstruction & Surgical Repair
// ----------------------------------------------------
export interface IntermittentCorruptedFile {
  id: string;
  path: string;
  format: "DOCX" | "XLSX" | "SQL_MDF" | "VMDK" | "MP4" | "PDF";
  totalSizeBytes: number;
  encryptedHeaderBytes: number;
  intactDataPayloadBytes: number;
  intermittentStrideBlockSizeKB: number;
  ransomwareSignature: string;
  reconstructabilityPct: number;
  reconstructionMethod: string;
  status: "RECOVERABLE" | "RECONSTRUCTED" | "PROCESSING" | "DAMAGED_CRITICAL";
  restoredDataPreview: string;
}

export interface BlockDifferentialSegment {
  blockIndex: number;
  startOffsetHex: string;
  endOffsetHex: string;
  sizeKB: number;
  state: "ENCRYPTED_HEADER" | "INTACT_PAYLOAD" | "SURGICALLY_REPAIRED" | "RECONSTRUCTED_XML" | "RECONSTRUCTED_BTREE";
  entropy: number;
  description: string;
}

// ----------------------------------------------------
// Flagship Studio 3: AD Forest Disaster Recovery (AD-FDR)
// ----------------------------------------------------
export interface CleanDcProvisionNode {
  id: string;
  hostname: string;
  site: string;
  ipAddress: string;
  fsmoRoles: string[];
  ifmSnapshotDate: string;
  provisionStatus: "PROVISIONED_CLEAN" | "IFM_BOOTSTRAP" | "DSRM_STAGING" | "REPLICATING" | "ISOLATED";
  airgapVlan: number;
  healthScore: number;
  adminCountSanitized: number;
}

export interface KrbtgtRollPhase {
  phaseIndex: number;
  title: string;
  description: string;
  status: "COMPLETED" | "ACTIVE" | "PENDING";
  timeSkewAcceleratedSec: number;
  kerberosTicketsPurged: number;
  targetDc: string;
}

export interface MaliciousGpoFinding {
  id: string;
  gpoName: string;
  guid: string;
  threatType: "ROGUE_SCHEDULED_TASK" | "BACKDOORED_TRUST" | "ROGUE_ADMINCOUNT_1" | "WRITABLE_ADMINSDHOLDER" | "TOMBSTONE_OBJECT";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  details: string;
  remediationCommand: string;
  cleared: boolean;
}

// ----------------------------------------------------
// Flagship Studio 4: AI Actor Negotiator & OFAC Screener
// ----------------------------------------------------
export interface TorNegotiationMessage {
  id: string;
  timestamp: string;
  sender: "ACTOR_OPERATOR" | "ACTOR_AFFILIATE" | "AEGIS_NEGOTIATOR" | "SYSTEM_EVENT";
  messageText: string;
  sentimentScore: number; // -1 to 1
  frustrationScore: number; // 0 to 100
  bluffProbabilityPct: number;
  extractedTerms?: {
    demandedAmountUSD?: number;
    cryptoAddress?: string;
    deadlineHoursRemaining?: number;
  };
}

export interface SyndicateDiscountProfile {
  syndicateName: string;
  avgDiscountPct: number;
  maxHistoricalDiscountPct: number;
  optimalStallWindowHours: number;
  bluffThresholdHours: number;
  paymentRiskScore: number;
  preferredCoin: "BTC" | "XMR";
  reputationDecryptionSuccessPct: number;
  psycholinguisticDemeanor: string;
}

export interface OfacScreeningCheck {
  id: string;
  cryptoAddress: string;
  currency: "BTC" | "XMR" | "ETH";
  sdnMatch: boolean;
  sanctionedAffiliation: string;
  chainalysisRiskScore: number; // 0-100
  legalClearanceStatus: "CLEARED_LEGAL" | "SANCTIONED_BLOCKED" | "UNDER_REVIEW";
  reviewedBy: string;
  timestamp: string;
}

// ----------------------------------------------------
// Flagship Studio 5: CERBERUS-RE Cryptanalytic Bridge
// ----------------------------------------------------
export interface CerberusCryptanalyticFinding {
  id: string;
  variantName: string;
  flawType: "PRNG_MERSENNE_TWISTER_SEED" | "HARDCODED_RC4_KEYSTREAM" | "IV_NONCE_COLLISION" | "FLAWED_KDF_ROUNDS";
  discoveredInCerberusPlatform: string;
  confidencePct: number;
  technicalProof: string;
  decompiledFunctionSnippet: string;
  cppMultiThreadedDecryptorSrc: string;
  pluginStatus: "COMPILED_READY" | "DISPATCHED_TO_AEGIS" | "EXECUTING_RESTORE" | "ANALYZING";
  restoredFileCount: number;
  throughputMBps: number;
}




