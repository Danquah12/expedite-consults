import type { Finding } from "@/types/dast";

/**
 * TrePath v6.9 — Canonical Assessment Database Types & Cryptographic Primitives
 * Single Source of Truth for Executive, Technical, Forensic, Compliance, and Remediation Reporting.
 */

export type ExecutionProvenance =
  | "PASSIVE_OBSERVATION"
  | "STATIC_ANALYSIS"
  | "ACTIVE_READ_ONLY_PROBE"
  | "ACTIVE_SECURITY_TEST"
  | "EXPLOIT_REPRODUCED"
  | "POST_EXPLOITATION_VERIFIED"
  | "ANALYTICALLY_INFERRED"
  | "NOT_EXECUTED"
  | "OUT_OF_SCOPE";

export const VALID_EXECUTION_PROVENANCE_SET: ReadonlySet<ExecutionProvenance> = new Set([
  "PASSIVE_OBSERVATION",
  "STATIC_ANALYSIS",
  "ACTIVE_READ_ONLY_PROBE",
  "ACTIVE_SECURITY_TEST",
  "EXPLOIT_REPRODUCED",
  "POST_EXPLOITATION_VERIFIED",
  "ANALYTICALLY_INFERRED",
  "NOT_EXECUTED",
  "OUT_OF_SCOPE"
]);

export type AttackChainEvidenceState = "OBSERVED" | "REPRODUCED" | "INFERRED";

export type FindingTaxonomyCategory =
  | "CONFIRMED_VULNERABILITY"
  | "CONFIRMED_CONFIGURATION_WEAKNESS"
  | "INFORMATIONAL_OBSERVATION"
  | "UNVERIFIED_HYPOTHESIS"
  | "OUT_OF_SCOPE_CONDITION";

export type AssessmentExecutionMode =
  | "NOT_EXECUTED_PRE_SCAN"
  | "READ_ONLY_VERIFICATION"
  | "ACTIVE_EXPLOITATION_VERIFIED";

export type FrameworkDisposition =
  | "MAPPED"
  | "TESTED"
  | "PASSED"
  | "FAILED"
  | "NOT_TESTED"
  | "NOT_APPLICABLE";

export type RetestDisposition =
  | "OPEN"
  | "IN_REMEDIATION"
  | "VERIFIED_FIXED"
  | "MITIGATED_WAF"
  | "RISK_ACCEPTED"
  | "UNVERIFIED_CLAIM";

/**
 * Known placeholder / empty SHA-256 digests explicitly prohibited in signed evidence manifests.
 * - e3b0c442...: "" (empty byte sequence)
 * - 8f434346...: "test\n"
 * - 9f86d081...: "test"
 * - 2c26b46b...: "foo"
 * - 4e074085...: "3"
 */
export const PROHIBITED_PLACEHOLDER_SHA256: ReadonlySet<string> = new Set([
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
  "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
  "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce"
]);

export function encodeUtf8Bytes(input: string): Uint8Array {
  return new TextEncoder().encode(String(input ?? ""));
}

export function utf8ByteLength(input: string): number {
  return encodeUtf8Bytes(input).byteLength;
}

/**
 * Pure TypeScript FIPS 180-4 SHA-256 over exact Uint8Array bytes (identical in Browser & Node.js).
 */
export function sha256Bytes(bytes: Uint8Array): Uint8Array {
  const K: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));
  const msgLen = bytes.length;
  const bitLenHi = Math.floor((msgLen * 8) / 0x100000000);
  const bitLenLo = (msgLen * 8) >>> 0;
  const totalBytes = (((msgLen + 8) >> 6) + 1) << 6;
  const words = new Uint32Array(totalBytes >> 2);
  for (let i = 0; i < msgLen; i++) {
    words[i >> 2] |= (bytes[i] & 0xff) << (24 - (i & 3) * 8);
  }
  words[msgLen >> 2] |= 0x80 << (24 - (msgLen & 3) * 8);
  words[words.length - 2] = bitLenHi;
  words[words.length - 1] = bitLenLo;

  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
  let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;
  const W = new Uint32Array(64);

  for (let offset = 0; offset < words.length; offset += 16) {
    for (let t = 0; t < 16; t++) W[t] = words[offset + t];
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(7, W[t - 15]) ^ rotr(18, W[t - 15]) ^ (W[t - 15] >>> 3);
      const s1 = rotr(17, W[t - 2]) ^ rotr(19, W[t - 2]) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }
    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    H0 = (H0 + a) >>> 0; H1 = (H1 + b) >>> 0; H2 = (H2 + c) >>> 0; H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0; H5 = (H5 + f) >>> 0; H6 = (H6 + g) >>> 0; H7 = (H7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const hs = [H0, H1, H2, H3, H4, H5, H6, H7];
  for (let i = 0; i < 8; i++) {
    out[i * 4] = (hs[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (hs[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (hs[i] >>> 8) & 0xff;
    out[i * 4 + 3] = hs[i] & 0xff;
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

export function sha256Utf8Hex(input: string): string {
  return bytesToHex(sha256Bytes(encodeUtf8Bytes(input)));
}

/**
 * RFC 2104 HMAC-SHA-256 for signing and verifying the Forensic Evidence Manifest.
 */
export function hmacSha256Utf8Hex(keyStr: string, messageStr: string): string {
  const blockSize = 64;
  let keyBytes = encodeUtf8Bytes(keyStr);
  if (keyBytes.length > blockSize) {
    keyBytes = sha256Bytes(keyBytes);
  }
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(keyBytes);

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = paddedKey[i] ^ 0x5c;
    iKeyPad[i] = paddedKey[i] ^ 0x36;
  }

  const msgBytes = encodeUtf8Bytes(messageStr);
  const innerInput = new Uint8Array(blockSize + msgBytes.length);
  innerInput.set(iKeyPad, 0);
  innerInput.set(msgBytes, blockSize);
  const innerHash = sha256Bytes(innerInput);

  const outerInput = new Uint8Array(blockSize + innerHash.length);
  outerInput.set(oKeyPad, 0);
  outerInput.set(innerHash, blockSize);
  return bytesToHex(sha256Bytes(outerInput));
}

/**
 * Redacts raw credential secrets before artifact preservation & hashing so digests match preserved bytes 1:1.
 */
export function sanitizeForensicArtifactText(raw: string): string {
  return String(raw ?? "")
    .replace(/(Authorization\s*:\s*Bearer\s+)([A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+)/gi, "$1[REDACTED_BEARER_JWT]")
    .replace(/(JWT_SECRET\s*=\s*)([^\s\r\n"']+)/gi, "$1[REDACTED_SECRET]")
    .replace(/(DB_PASSWORD\s*=\s*)([^\s\r\n"']+)/gi, "$1[REDACTED_DB_CREDENTIAL]")
    .replace(/(AWS_SECRET_ACCESS_KEY\s*[:=]\s*["']?)([A-Za-z0-9/+=]{16,})(["']?)/gi, "$1[REDACTED_CLOUD_KEY]$3")
    .replace(/\bsk_live_[0-9a-zA-Z]{20,}\b/g, "[REDACTED_STRIPE_LIVE_KEY]")
    .replace(/(\$2[aby]\$\d{2}\$)[./A-Za-z0-9]{20,}/g, "$1[REDACTED_BCRYPT_HASH]");
}

export interface CanonicalScopedTarget {
  id: string;
  url: string;
  host: string;
  port: number;
  protocol: "http" | "https";
  resolvedIp: string;
  scopeClass: "RFC1918_PRIVATE_OR_LAB" | "LOOPBACK_LOCALHOST" | "PUBLIC_EXTERNAL";
  scopeValidated: boolean;
  scopeValidationNote: string;
  reachabilityStatus: "REACHABLE" | "UNREACHABLE" | "NOT_YET_SCANNED";
}

export interface CanonicalExecutionRecord {
  executionId: string;
  stage:
    | "RECONNAISSANCE"
    | "DAST_CRAWL"
    | "ACTIVE_VULN_SCAN"
    | "PENTEST_VALIDATION"
    | "POST_EXPLOITATION_CHECK"
    | "REPORT_GENERATION";
  startedAtIso: string;
  completedAtIso: string;
  sourceIdentity: string;
  targetIdentity: string;
  requestIds: string[];
  responseArtifactIds: string[];
  toolName: string;
  toolVersion: string;
  roeAuthorizationRef: string;
  provenance: ExecutionProvenance;
  metrics: {
    requestsSent: number;
    responsesReceived: number;
    pagesSpidered: number;
    linksDiscovered: number;
    scriptsInspected: number;
    formsInspected: number;
    endpointsProbed: number;
    tcpPortsProbed: number;
    udpPortsProbed: number;
    testCasesExecuted: number;
    skippedByRoe: number;
  };
  summary: string;
}

export interface CanonicalHostServiceRecord {
  recordId: string;
  hostIp: string;
  hostname: string;
  targetUrl: string;
  port: number;
  protocol: "tcp" | "udp";
  service: string;
  observedVersion: string;
  detectionMethod: string;
  observedAtIso: string;
  confidence: "CONFIRMED (99%)" | "HIGH (85%)" | "INFERRED (50%)" | "UNPROBED (0%)";
  fingerprintStatus: "DIRECTLY_OBSERVED" | "INFERRED" | "NOT_PROBED";
  executionId: string;
}

export interface CanonicalHostSummaryRow {
  url: string;
  host: string;
  resolvedIp: string;
  stack: string;
  ports: string;
  mitreValidatedSummary: string;
  privilegeAndPosture: string;
  riskLabel: string;
}

export interface CanonicalFindingRecord {
  canonicalId: string; // e.g. DAST-WEB-2026-001
  rawId: string;
  index: number;
  title: string;
  cleanTitle: string;
  targetHost: string;
  targetUrl: string;
  method: string;
  endpoint: string;
  parameter: string;
  cweId: string;
  owaspRef: string;
  mitreTacticId: string;
  mitreTechniqueId: string;
  d3fendCountermeasure: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Informational";
  cvssScore: number;
  cvssScoreText: string;
  cvssVector: string;
  taxonomyCategory: FindingTaxonomyCategory;
  provenance: ExecutionProvenance;
  executionId: string;
  evidenceArtifactIds: string[];
  observationConfidence: string;
  controlGapVerification: string;
  exploitabilityStatus: string;
  confirmedImpact: string;
  inferredDownstreamRisk: string;
  remediationRecommendation: string;
  retestStatus: RetestDisposition;
  sourceFinding: Finding;
}

export interface CanonicalEvidenceArtifact {
  artifactId: string;
  appendixId?: "APPENDIX A" | "APPENDIX B" | "APPENDIX C" | "APPENDIX D";
  findingId?: string;
  title: string;
  fileName: string;
  mimeType: "text/plain; charset=utf-8" | "message/http; charset=utf-8" | "application/json; charset=utf-8";
  rawBytesUtf8: string;
  byteSize: number;
  collectedAtIso: string;
  collectionMethod: string;
  toolNameAndVersion: string;
  executionId: string;
  targetHost: string;
  provenance: ExecutionProvenance;
  sha256: string;
  recalculatedSha256: string;
  integrityVerified: boolean;
}

export interface SignedEvidenceManifest {
  manifestId: string;
  keyId: string;
  algorithm: "HMAC-SHA256 + FIPS-180-4-SHA256";
  signedAtIso: string;
  artifactCount: number;
  totalBytesPreserved: number;
  canonicalManifestPayload: string;
  manifestRootSha256: string;
  signatureHmacSha256: string;
  recalculatedSignatureHmacSha256: string;
  allArtifactsVerified: boolean;
}

export interface CanonicalAttackChainStep {
  stepNumber: number;
  sourceFindingOrObservation: string;
  mitreTacticId: string;
  mitreTechnique: string;
  supportingEvidenceArtifactIds: string[];
  evidenceState: AttackChainEvidenceState;
  executionProvenance: ExecutionProvenance;
  confidence: string;
  requiredPrerequisites: string;
  demonstratedImpact: string;
  d3fendCountermeasure: string;
  retestCriterion: string;
  narrative: string;
}

export interface CanonicalAttackChain {
  chainId: string;
  title: string;
  standardRef: string;
  hostsAffected: string;
  securityRisk: string;
  overallEvidenceState: AttackChainEvidenceState | "NOT_EXECUTED";
  riskSummary: string;
  sourceFindingIds: string[];
  evidenceArtifactIds: string[];
  steps: CanonicalAttackChainStep[];
  stepSummaries: string[];
  mimicCommands: string;
  evidenceOutput: string;
}

export interface CanonicalMitreTacticRecord {
  order: number;
  tacticId: string;
  tactic: string;
  techniques: string;
  ptesNist: string;
  engineModule: string;
  evidenceState: AttackChainEvidenceState | "NOT_EXECUTED";
  provenance: ExecutionProvenance;
  supportingIds: string[];
  labValidation: string;
  d3fend: string;
}

export interface CanonicalFrameworkCoverageRecord {
  priority: number;
  frameworkId: string;
  standard: string;
  purpose: string;
  testRef: string;
  mappedCount: number;
  testedCount: number;
  passedCount: number;
  failedCount: number;
  notTestedCount: number;
  notApplicableCount: number;
  overallStatus: FrameworkDisposition;
  supportingExecutionIds: string[];
  coverageSummary: string;
}

export interface CanonicalRetestRecord {
  findingId: string;
  rawFindingKey: string;
  originalFindingTitle: string;
  severity: string;
  expectedSecureState: string;
  functionalRegressionTest: string;
  negativeBoundaryTest: string;
  executionEvidence: string;
  retestTimestampIso: string | null;
  verificationHash: string | null;
  disposition: RetestDisposition;
  verifiedByExecution: boolean;
  retestNote: string;
}

export interface CanonicalRiskCalculation {
  formulaExpression: string;
  formulaTextWithValues: string;
  rawFindingCount: number;
  scoredFindingCount: number;
  informationalCount: number;
  deduplicatedClusterCount: number;
  dedupCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  rawCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  clusterLedgerText: string;
  measuredPostureScore: number;
  recomputedFormulaScore: number;
  measuredPostureGrade: string;
  postureContextLabel: string;
  projectedPostureScores: {
    phase1: number;
    phase2: number;
    phase3: number;
    isMonotonic: boolean;
  };
  maxCvssScore: number;
  maxCvssText: string;
  contextualBusinessRisk: "Critical" | "High" | "Medium" | "Low";
  criticalHighReleaseGate: "PASSED" | "BLOCKED_CRITICAL_HIGH_OPEN" | "UNVERIFIED_PRE_SCAN";
  criticalHighReleaseGateDetail: string;
}

export interface CanonicalBoundaryRow {
  id: string;
  src: string;
  dst: string;
  desc: string;
  mitre: string;
  badge: "crit" | "high" | "med" | "verified" | "std-badge";
  status: string;
  linkedFindingIds: string[];
  provenance: ExecutionProvenance;
}

export interface CanonicalQualityGateResult {
  gateId:
    | "AT-REPORT-01"
    | "AT-REPORT-02"
    | "AT-REPORT-03"
    | "AT-REPORT-04"
    | "AT-REPORT-05"
    | "AT-REPORT-06"
    | "AT-REPORT-07"
    | "AT-REPORT-08"
    | "AT-REPORT-09"
    | "AT-REPORT-10";
  gateName: string;
  status: "PASSED" | "FAILED";
  blocking: boolean;
  verificationDetail: string;
}

export interface CanonicalAssessmentDatabase {
  assessmentId: string;
  reportVersion: "6.9.0" | "7.0.0";
  engineVersion: string;
  generatedAtIso: string;
  generatedAtDualLabel?: string;
  startDateIso: string;
  endDateIso: string;
  assessmentMode: AssessmentExecutionMode;
  rulesOfEngagement: {
    roeId: string;
    authorizationScope: string;
    testingMode: "READ_ONLY_NON_DESTRUCTIVE" | "AUTHORIZED_ACTIVE_EXPLOITATION" | "PRE_SCAN_STAGED";
    authenticatedTestingAuthorized: boolean;
    destructivePayloadsAuthorized: boolean;
    hostIntrusionAuthorized: boolean;
    summaryStatement: string;
  };
  targetScope: {
    clientOrgName: string;
    leadAssessorName: string;
    primaryTargetUrl: string;
    primaryHost: string;
    allScopedUrlsStr: string;
    scopedTargets: CanonicalScopedTarget[];
  };
  executionRecords: CanonicalExecutionRecord[];
  reconciledCoverage: {
    spideredPagesCount: number;
    linksCount: number;
    scriptsCount: number;
    formsCount: number;
    discoveredParametersCount: number;
    endpointsProbedCount: number;
    plannedProbesCount: number;
    attemptedProbesCount: number;
    completedProbesCount: number;
    skippedDestructiveProbesCount: number;
    httpRequestsSent: number;
    httpResponsesReceived: number;
    tcpPortsProbedCount: number;
    udpPortsProbedCount: number;
    pentestVectorsExecutedCount: number;
  };
  hostServiceInventory: CanonicalHostServiceRecord[];
  hostSummaryRows: CanonicalHostSummaryRow[];
  primaryServerStackLabel: string;
  primaryPageTitleLabel: string;
  findingRegistry: CanonicalFindingRecord[];
  taxonomyCounts: {
    confirmedVulnerabilities: number;
    confirmedConfigurationWeaknesses: number;
    informationalObservations: number;
    unverifiedHypotheses: number;
    outOfScopeConditions: number;
  };
  rootCauseClusters: Array<{
    clusterId: string;
    cweId: string;
    owaspRef: string;
    highestSeverity: string;
    findingIds: string[];
    affectedTarget: string;
    rootCauseTitle: string;
    remediation: string;
  }>;
  boundaryValidationRows: CanonicalBoundaryRow[];
  endpointDiscoveryRows: Array<{
    endpoint: string;
    category: string;
    httpStatus: string;
    observedControl: string;
    accessContext: string;
    verdict: string;
    badge: "verified" | "med" | "high" | "std-badge";
    executionId: string;
  }>;
  attackChains: CanonicalAttackChain[];
  mitreAttackMatrix: CanonicalMitreTacticRecord[];
  brainStagesMatrix: Array<{
    name: string;
    title: string;
    detail: string;
    standards: string;
    executionId: string;
    provenance: ExecutionProvenance;
    status: string;
  }>;
  ptesNistPhasesMatrix: Array<{
    ptesPhase: string;
    nistPhase: string;
    mitreTactics: string;
    engineModule: string;
    executionId: string;
    deliverable: string;
    status: string;
  }>;
  owaspTop10Matrix: Array<{
    id: string;
    name: string;
    mitre: string;
    validatingEngine: string;
    findingSummary: string;
    linkedFindingIds: string[];
    riskBadge: string;
    status: string;
  }>;
  frameworkCoverageLedger: CanonicalFrameworkCoverageRecord[];
  riskCalculations: CanonicalRiskCalculation[];
  primaryRiskCalculation: CanonicalRiskCalculation;
  retestRecords: CanonicalRetestRecord[];
  verifiedRemediatedCount: number;
  evidenceArtifacts: CanonicalEvidenceArtifact[];
  appendices: Array<{
    appendixId: "APPENDIX A" | "APPENDIX B" | "APPENDIX C" | "APPENDIX D";
    artifactId: string;
    title: string;
    fileName: string;
    mimeType: string;
    byteSize: number;
    collectedAtIso: string;
    executionId: string;
    host: string;
    tool: string;
    provenance: ExecutionProvenance;
    sha256: string;
    recalculatedSha256: string;
    integrityVerified: boolean;
    rawArtifact: string;
  }>;
  evidenceManifest: SignedEvidenceManifest;
  qualityGates: CanonicalQualityGateResult[];
  reportCertification: {
    certified: boolean;
    status: "CERTIFIED" | "STAGED_PRE_SCAN_NOT_CERTIFIED" | "BLOCKED";
    passedGatesCount: number;
    totalGatesCount: number;
    failedGateIds: string[];
    badgeLabel: string;
    summaryStatement: string;
  };
}
