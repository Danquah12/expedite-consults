export type Severity = "Critical" | "High" | "Medium" | "Low";

export type Status = "Open" | "In Progress" | "In Review" | "Resolved" | "False Positive";

export type EngineName =
  | "XTRIKE XQL"
  | "XTRIKE DeepFlow"
  | "XTRIKE StructSCA"
  | "XTRIKE AST-Query"
  | "XTRIKE PatternGuard"
  | "XTRIKE DepGuard"
  | "XTRIKE GraphCPG"
  | "XTRIKE TaintFlow";

export type EngineResult = {
  name: EngineName;
  confidence: number; // 0–1
  confirmed: boolean;
  details?: string;
};

export type AttackPathStep = {
  label: string;
  type: "entry" | "vulnerability" | "lateral" | "asset" | "impact";
  description?: string;
};

export type ComplianceRef = {
  framework: "PCI DSS" | "NIST 800-53" | "ISO 27001" | "CIS Controls" | "OWASP Top 10";
  reference: string;
  description: string;
};

export type Remediation = {
  platform:
    | "Java"
    | "Python"
    | "Node.js"
    | "TypeScript"
    | "JavaScript"
    | "React / TypeScript"
    | "Terraform HCL"
    | "Maven / XML"
    | "Package Manifest (JSON/XML)"
    | "Go"
    | "C#"
    | "PHP"
    | "Ruby"
    | "Kotlin"
    | "Swift";
  code: string;
  explanation: string;
};

export type ExploitabilityLevel = "Very Easy" | "Easy" | "Moderate" | "Difficult" | "Very Difficult";

export type CanonicalProofState =
  | "DETECTED_STATIC"
  | "DATAFLOW_CONFIRMED"
  | "GUARD_ANALYZED"
  | "PATH_FEASIBLE"
  | "RUNTIME_REPRODUCED"
  | "IMPACT_CONFIRMED"
  | "NEEDS_MANUAL_VALIDATION"
  | "MITIGATED_BY_GUARD"
  | "INCONCLUSIVE";

export type EvidenceCategory =
  | "TAINT_DATAFLOW"
  | "AUTHORIZATION_ENFORCEMENT"
  | "CONFIGURATION_CONTROL"
  | "SECRET_PROVENANCE"
  | "CRYPTOGRAPHIC_PRIMITIVE"
  | "DEPENDENCY_VERSION"
  | "CONCURRENCY_STATE";

export type DeepExploitabilityDossier = {
  enumerationPhase: {
    discoveryPass:
      | "Pass 1: Primary AST & Surface Enumeration"
      | "Pass 2: Second-Order Re-Enumeration (Post-Pivot)"
      | "Pass 3: Deep Supply-Chain & Config Enumeration";
    entrypointRoute: string;
    astNodeSignature: string;
    enumeratedAssets: string[];
  };
  databaseCorrelations: {
    githubGhsa: {
      advisoryId: string;
      cveId: string;
      ghRepoMatches: number;
      exploitMaturity:
        | "PoC Public on GitHub"
        | "Functional Verification Module"
        | "High-Signal Advisory"
        | "CWE Taxonomy Pattern (No Product CVE)"
        | "Needs Source-to-Execution Validation";
      summary: string;
    };
    searchsploit: {
      edbId: string;
      queryCmd: string;
      exploitTitle: string;
      verifiedEdb: boolean;
      platformType: string;
      exploitRank: "Excellent" | "Great" | "Normal" | "Manual Review Required";
    };
    googleIntel: {
      osvId: string;
      googleDorkSignature: string;
      cisaKevListed: boolean;
      projectZeroRef: string;
      zeroDayRisk: string;
      nvdCvssV4: number;
    };
    otherDatabases: {
      packetStormRef: string;
      vulnDbId: string;
      epssScore: number;
      epssPercentile: string;
      exploitabilityExtent: string;
    };
  };
  penetrationTestLifecycle: {
    initialPentest: {
      phase: string;
      probeType: string;
      targetBoundary: string;
      resultStatus:
        | "DATAFLOW_CONFIRMED (Needs Runtime Reproduction)"
        | "DATAFLOW_CONFIRMED (Runtime: NOT_RUN)"
        | "PATH_FEASIBLE (Static Constraints Satisfied)"
        | "NEEDS_MANUAL_VALIDATION (Context/Sink Dependent)"
        | "NEEDS_MANUAL_VALIDATION"
        | "STATIC_CANDIDATE"
        | "RUNTIME_REPRODUCED (Sandbox Verified)"
        | "MITIGATED_BY_GUARD (Not Exploitable)"
        | "EXPLOITABLE (Confirmed)"
        | "PARTIAL BYPASS (Chained)"
        | "GUARDED";
      evidenceLog: string;
    };
    reEnumeration: {
      triggeredBy: string;
      newlyDiscoveredSurface: string[];
      secondarySinksFound: number;
      summary: string;
    };
    rePenetrationTest: {
      chainId: string;
      attackChainSteps: string[];
      chainedCvss: number;
      verificationVerdict: string;
      proofArtifact: string;
    };
    postExploitation: {
      privilegeAttained: string;
      lateralMovementPaths: string[];
      dataExfiltrationScope: string;
      persistenceRisk: string;
      blastRadiusScore: number;
      executiveRemediationPriority: string;
    };
  };
};

export type SASTFinding = {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  cwe: string;
  cweName: string;
  cvss: number;
  cvssVector?: string;
  cvssRationale?: string;
  epss: number; // 0–1 probability
  mitre: string;
  owasp: string;
  owaspCategory: string;

  // Canonical State Machine & Deduplication Identity (AT-01, AT-12, AT-17)
  sinkId?: string;
  duplicateGroupId?: string;
  deduplicatedCount?: number;
  rootCauseGroupId?: string;
  findingOrigin?:
    | "PRIMARY_CODE_VULNERABILITY"
    | "MULTI_SINK_SHARED_ROOT_CAUSE"
    | "ARCHITECTURAL_CANDIDATE_HYPOTHESIS";
  controlDominanceSummary?: string;
  proofState?: CanonicalProofState;
  evidenceType?: EvidenceCategory;
  modeledAssumptions?: string;
  regressionTest?: string;
  auditDisposition?: string;
  isBenchmarkFixture?: boolean;
  deploymentContextNote?: string;
  advisoryApplicability?:
    | "DEPENDENCY_VERSION_MATCHED"
    | "DEPENDENCY_MANIFEST_ADVISORY"
    | "FIRST_PARTY_CODE_WEAKNESS_NO_CVE";
  consolidatedSinkLines?: number[];

  /**
   * Whether the reported file/line/snippet was checked against the scanned repository content.
   * SYNTHETIC_TEMPLATE = an illustrative hypothesis pattern that was NOT located in the repository.
   */
  sourceProvenance?: {
    status: "VERIFIED" | "LINE_MISMATCH" | "FILE_NOT_FOUND" | "LANGUAGE_MISMATCH" | "SYNTHETIC_TEMPLATE";
    detail: string;
  };

  /** Result of the inter-procedural taint engine + path-feasibility solver for this finding. */
  interprocedural?: {
    status: "ESTABLISHED" | "NOT_ESTABLISHED" | "UNSUPPORTED_LANGUAGE";
    crossesFunctions: boolean;
    functionChain: string[];
    steps: { file: string; line: number; text: string; kind: "source" | "propagation" | "call" | "return" | "sink" }[];
    pathFeasibility?: {
      status: "FEASIBLE" | "INFEASIBLE" | "GUARDED";
      constraints: string[];
      reason: string;
    };
    note?: string;
  };

  /** Structured context checks (SSRF controls, cryptographic context). */
  contextAssessment?: {
    kind: "SSRF" | "CRYPTO";
    summary: string;
    riskContext: "HIGH" | "MEDIUM" | "LOW" | "UNESTABLISHED";
    checks: { id: string; label: string; status: "PRESENT" | "ABSENT" | "UNKNOWN"; evidence: string }[];
  };

  /** Stored execution records. A finding may only claim runtime/impact/remediation proof with one of these. */
  verificationRecords?: {
    kind: "RUNTIME_REPRODUCTION" | "IMPACT_VERIFICATION" | "PATCH_EXECUTION" | "REGRESSION_TEST";
    executedAt: string;
    environment: string;
    artifactSha256: string;
    result: "PASS" | "FAIL";
  }[];
  dependencyEvidence?: {
    packageName: string;
    declaredVersionSpec: string;
    lockfileResolvedVersion: string;
    advisoryId: string;
    affectedVersionRange: string;
    patchedVersion: string;
    dependencyPath: string;
    vulnerableApiReachability:
      | "UNVERIFIED_REQUIRES_CALLGRAPH_TRACE"
      | "REACHABLE_IN_SOURCE"
      | "NOT_INVOKED";
  };

  // Location
  file: string;
  line: number;
  language: string;
  codeSnippet?: string;
  snippetStartLine?: number;

  // Taint analysis
  source: string;
  sink: string;
  taintPath: string[];

  // XTRIKE Enterprise Engine Telemetry (XTRIKE XQL / XTRIKE DeepFlow / XTRIKE StructSCA)
  checkmarxQuery?: string;
  checkmarxBfl?: string;
  ibmRuleId?: string;
  ibmTraceSummary?: string;
  fortifyKingdom?: string;
  fortifyAnalyzer?: "Dataflow" | "Control Flow" | "Structural" | "Configuration" | "Semantic";

  // Engine results
  engines: EngineResult[];
  confidence: number; // 0–1 aggregate

  // Exploitability
  reachable: boolean;
  internetFacing: boolean;
  authRequired: boolean;
  exploitabilityLevel: ExploitabilityLevel;
  privilegeGain: string;

  // Attack context
  attackPath: AttackPathStep[];
  executiveSummary: string;
  businessImpact: string;
  rootCause: string;
  falsePositiveLikelihood: "Very Low" | "Low" | "Medium" | "High";

  // Compliance
  compliance: ComplianceRef[];

  // Fix guidance
  remediation: Remediation[];
  validationSteps: string[];

  // Management
  slaDeadline: string;
  owner: string;
  application: string;
  riskScore: number;

  // Trend
  firstDetected: string;
  lastSeen: string;

  // Deep Enumeration, Multi-DB Correlation (GitHub/SearchSploit/Google) & PTES Re-Penetration / Post-Exploitation
  deepExploitability?: DeepExploitabilityDossier;

  // Authoritative Immutable Finding Evidence & Patch Verification Ledger (V5)
  evidenceRecord?: import("@/lib/finding-evidence-ledger").FindingEvidenceRecord;
};

export type ScanResult = {
  id: string;
  repoUrl: string;
  language: string;
  startedAt: string;
  completedAt: string;
  linesScanned: number;
  filesScanned: number;
  findings: SASTFinding[];
  riskScore: number;
  engines: string[];
};

export type RiskBand = "Critical" | "High" | "Medium" | "Low";

export function getRiskBand(score: number): RiskBand {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}
