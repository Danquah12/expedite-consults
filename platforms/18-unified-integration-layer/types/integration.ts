export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type PlatformId =
  | "cerberus-re"
  | "aegis-recovery"
  | "axiom-dast"
  | "mobile-sec"
  | "exploitability-ai"
  | "threat-modeler"
  | "edr-crowdstrike"
  | "siem-sentinel";

export interface ConnectedPlatform {
  id: PlatformId;
  name: string;
  codeName: string;
  category: string;
  version: string;
  status: "ONLINE" | "DEGRADED" | "STANDBY" | "ERROR";
  port: number;
  url: string;
  eventsPerSec: number;
  latencyMs: number;
  healthScore: number;
  activeAlerts: number;
  lastHeartbeat: string;
  description: string;
  grpcStreamStatus: "CONNECTED" | "BUFFERING" | "RECONNECTING";
  features: string[];
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  sourcePlatform: PlatformId;
  eventType: string;
  severity: Severity;
  targetHost: string;
  correlationId: string;
  details: string;
  payload: Record<string, any>;
  actionTaken?: string;
  latencyMs: number;
}

export type IOCType = "SHA256" | "IP_C2" | "DOMAIN" | "YARA_RULE" | "SIGMA_RULE" | "MUTEX" | "REGISTRY_KEY";

export interface UnifiedIOC {
  id: string;
  type: IOCType;
  value: string;
  threatActor: string;
  malwareFamily: string;
  confidenceScore: number; // 0 - 100
  firstSeen: string;
  lastSeen: string;
  originatingPlatform: PlatformId;
  propagatedPlatforms: PlatformId[];
  syncStatus: "ENFORCED" | "SYNCING" | "PENDING_APPROVAL" | "QUARANTINED";
  mitreTactics: string[];
  description: string;
}

export interface PlaybookStep {
  stepNumber: number;
  name: string;
  targetPlatform: PlatformId;
  action: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "WAITING_APPROVAL";
  durationMs?: number;
  requiresDualApproval?: boolean;
  outputSummary?: string;
}

export interface CrossPlatformPlaybook {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  triggerSource: PlatformId;
  category: "RANSOMWARE_CONTAINMENT" | "ZERO_DAY_TRIAGE" | "C2_INTERCEPTION" | "BACKUP_LOCKDOWN" | "DAST_CORRELATION";
  status: "ACTIVE" | "PAUSED" | "EXECUTING" | "DRAFT";
  lastRun: string;
  executionsTotal: number;
  successRate: number;
  steps: PlaybookStep[];
}

export interface IdentityTenant {
  id: string;
  tenantName: string;
  domain: string;
  ssoProvider: "Okta" | "Microsoft Entra ID" | "PingIdentity" | "Google Workspace";
  ssoStatus: "ACTIVE" | "SYNCING" | "MAINTENANCE";
  zeroTrustPostureScore: number; // 0 - 100
  mfaEnforcementRate: number; // e.g. 100%
  activeUsersCount: number;
  apiTokensCount: number;
  isolatedDbCluster: string;
  complianceTier: "FEDRAMP_HIGH" | "HIPAA_SOC2" | "FINRA_COMPLIANT";
}

export interface ScopedApiToken {
  id: string;
  name: string;
  prefix: string;
  issuedTo: string;
  assignedPlatforms: PlatformId[];
  permissions: string[];
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string;
  rateLimitPerMin: number;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
}

export interface UnifiedReportSummary {
  id: string;
  reportCode: string;
  title: string;
  period: string;
  generatedAt: string;
  overallHealthScore: number;
  sec8kMateriality: "NO_MATERIAL_BREACH" | "EVALUATION_REQUIRED" | "MATERIAL_EVENT_CONTAINED";
  hipaaReadiness: number; // %
  soc2Readiness: number; // %
  cerberusFindingsCount: { critical: number; high: number; analyzedBinaries: number };
  aegisRecoveryMetrics: { rtoMinutes: number; rpoMinutes: number; cleanSnapshotIntegrity: number };
  axiomDastMetrics: { webEndpointsScanned: number; highRiskVulns: number; apiDriftScore: number };
  cisoBriefingNotes: string;
}

export interface ApiGatewayRoute {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "GRAPHQL" | "GRPC_STREAM";
  endpointPath: string;
  targetPlatform: PlatformId;
  downstreamService: string;
  authLevel: "MUTUAL_TLS" | "JWT_BEARER" | "HMAC_SIGNED" | "PUBLIC_TOKEN";
  rateLimitTier: "UNLIMITED" | "ENTERPRISE_10K" | "STANDARD_1K";
  p99LatencyMs: number;
  status2xxPercentage: number;
  activeSubscribers: number;
  schemaVersion: string;
}

export interface DataLakeRecord {
  id: string;
  partition: "re_binaries" | "recovery_snapshots" | "dast_http_traces" | "zeek_network_pcap" | "siem_audit_logs";
  timestamp: string;
  source: PlatformId;
  subjectHashOrHost: string;
  rawSizeKb: number;
  summary: string;
  tags: string[];
  indexedFields: Record<string, any>;
}

export interface WebhookConnector {
  id: string;
  name: string;
  category: "SIEM" | "EDR" | "SOAR" | "ITSM" | "COLLABORATION" | "CLOUD_SECURITY";
  iconName: string;
  status: "CONNECTED" | "DEGRADED" | "DISCONNECTED";
  endpointUrl: string;
  eventsForwarded24h: number;
  avgLatencyMs: number;
  retryQueueCount: number;
  authType: "BEARER_TOKEN" | "WEBHOOK_SECRET" | "MUTUAL_TLS" | "OAUTH2_CLIENT";
  lastPing: string;
}

export interface MeshServiceNode {
  id: string;
  serviceName: string;
  cluster: string;
  instanceCount: number;
  cpuPercent: number;
  memoryPercent: number;
  grpcPoolActive: number;
  grpcPoolMax: number;
  circuitBreakerStatus: "CLOSED" | "HALF_OPEN" | "OPEN";
  p99LatencyMs: number;
  errorRatePercent: number;
  traceSpansCount: number;
}
