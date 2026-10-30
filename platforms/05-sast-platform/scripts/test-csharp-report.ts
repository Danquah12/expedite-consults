import { LANGUAGE_STARTER_CODEBASES, scanFilesWithEnterpriseEngines } from "../lib/enterprise-sast-engine";
import { findBenchmarkRepoByUrl } from "../data/benchmark-repos";
import { generateDeepReEnumeratedFindings } from "../lib/deep-enumeration-engine";
import {
  validateReportIntegrity,
  computeAuditableRiskWorksheet,
  runTenGateReportAcceptanceSuite,
  proofStateBuckets,
} from "../lib/cvss31";
import { computeRiskIntelligence } from "../lib/risk-intelligence";
import { validateFindingProvenance } from "../lib/finding-evidence-ledger";
import { summarizePatchVerificationPortfolio } from "../lib/patch-verification-engine";

const benchRepo = findBenchmarkRepoByUrl("https://github.com/OWASP/BenchmarkDotNet");
const files = benchRepo ? benchRepo.seedFiles : LANGUAGE_STARTER_CODEBASES["C#"];
const res = scanFilesWithEnterpriseEngines({
  files,
  repoUrl: "OWASP/BenchmarkDotNet",
  branch: "main",
  commitSha: "b104d2a19f5c9504a1b2c3d4e5f60718293aa1b2",
  primaryLanguage: "C#",
  selectedEngines: ["XQL"],
});
const deep = generateDeepReEnumeratedFindings({
  primaryFindings: res.findings,
  primaryValidation: res.validationFindings,
  repoUrl: "OWASP/BenchmarkDotNet",
  commitSha: "b104d2a19f5c9504a1b2c3d4e5f60718293aa1b2",
  language: "C#",
});
const vMap = new Map(deep.allValidationFindings.map((v) => [v.findingId, v]));
const issues = validateReportIntegrity(deep.allFindings, vMap);
const ws = computeAuditableRiskWorksheet(deep.allFindings, vMap);
const ri = computeRiskIntelligence(deep.allFindings);
const gates = runTenGateReportAcceptanceSuite(deep.allFindings, vMap);
const buckets = proofStateBuckets(deep.allFindings, vMap);

console.log(
  "Findings:",
  deep.allFindings.map((f) => ({
    id: f.id,
    cwe: f.cwe,
    lang: f.language,
    remPlat: f.remediation[0]?.platform,
    ip: f.interprocedural?.status,
    prov: f.sourceProvenance?.status,
  }))
);
console.log("Integrity issues:", issues);
console.log("Worksheet:", {
  primaryScore: ws.compositeRiskScore,
  combinedScore: ws.combinedPostureRiskScore,
  primarySum: ws.primaryCodeWeightedSum,
  archSum: ws.architecturalCandidateWeightedSum,
  reconciles: ws.reconciliation.reconciles,
});
console.log("RiskIntel v2:", {
  primary: ri.primaryScore,
  peak: ri.peakPrimaryFindingScore,
  archExposure: ri.architecturalExposureScore,
});
console.log("Buckets:", Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])));
console.log("AT-TRACE-02:", gates.find((g) => g.testId === "AT-TRACE-02"));
console.log("AT-PROOF-06:", gates.find((g) => g.testId === "AT-PROOF-06"));
console.log("AT-REM-08:", gates.find((g) => g.testId === "AT-REM-08"));

if (issues.length > 0) {
  console.error("FAIL: integrity issues found", issues);
  process.exit(1);
}
const dataflowCwes = new Set(["CWE-89", "CWE-78", "CWE-502", "CWE-22", "CWE-918"]);
if (res.findings.filter((f) => dataflowCwes.has(f.cwe)).some((f) => f.interprocedural?.status !== "ESTABLISHED")) {
  console.error("FAIL: C# primary dataflow finding interprocedural not ESTABLISHED");
  process.exit(1);
}
console.log("ALL C# REPORT INTEGRITY CHECKS PASSED");

// ---- ShiftLeftSecurity/Benchmark (OWASP/BenchmarkJava) Verification ----
const javaBench = findBenchmarkRepoByUrl("https://github.com/ShiftLeftSecurity/Benchmark") || findBenchmarkRepoByUrl("https://github.com/OWASP/BenchmarkJava");
const javaFiles = javaBench ? javaBench.seedFiles : LANGUAGE_STARTER_CODEBASES["Java"];
const javaRes = scanFilesWithEnterpriseEngines({
  files: javaFiles,
  repoUrl: "ShiftLeftSecurity/Benchmark",
  branch: "master",
  commitSha: "ea0146607a2d7ec7a1b2c3d4e5f60718293aa1b2",
  primaryLanguage: "Java",
  selectedEngines: ["XQL"],
});
const javaDeep = generateDeepReEnumeratedFindings({
  primaryFindings: javaRes.findings,
  primaryValidation: javaRes.validationFindings,
  repoUrl: "ShiftLeftSecurity/Benchmark",
  commitSha: "ea0146607a2d7ec7a1b2c3d4e5f60718293aa1b2",
  language: "Java",
});
const javaVMap = new Map(javaDeep.allValidationFindings.map((v) => [v.findingId, v]));
const javaIssues = validateReportIntegrity(javaDeep.allFindings, javaVMap);
const javaGates = runTenGateReportAcceptanceSuite(javaDeep.allFindings, javaVMap);
console.log("Java ShiftLeftSecurity/Benchmark Findings:", javaDeep.allFindings.length, "Integrity issues:", javaIssues.length);
console.log("Java AT-PROOF-06:", javaGates.find((g) => g.testId === "AT-PROOF-06")?.status, javaGates.find((g) => g.testId === "AT-PROOF-06")?.measuredMetric);
console.log("Java AT-REM-08:", javaGates.find((g) => g.testId === "AT-REM-08")?.status, javaGates.find((g) => g.testId === "AT-REM-08")?.measuredMetric);
if (javaIssues.length > 0) {
  console.error("FAIL: Java integrity issues found", javaIssues);
  process.exit(1);
}
if (javaGates.find((g) => g.testId === "AT-PROOF-06")?.status !== "PASS" || javaGates.find((g) => g.testId === "AT-REM-08")?.status !== "PASS") {
  console.error("FAIL: Java AT-PROOF-06 or AT-REM-08 did not pass");
  process.exit(1);
}
const allCheckedFindings = [...deep.allFindings, ...javaDeep.allFindings];
const badPatchSink = allCheckedFindings.filter(
  (f) => f.evidenceRecord?.patchVerification.status === "PATCH_INTRODUCED_NEW_SINK"
);
if (badPatchSink.length > 0) {
  console.error("FAIL: PATCH_INTRODUCED_NEW_SINK found on:", badPatchSink.map((f) => `${f.id} (${f.cwe})`));
  process.exit(1);
}
const missingEvents = allCheckedFindings.filter(
  (f) => !f.evidenceRecord || f.evidenceRecord.events.length !== 4 || !f.evidenceRecord.findingUuid || !f.evidenceRecord.verificationSignature
);
if (missingEvents.length > 0) {
  console.error("FAIL: Missing append-only 4-event chain on findings:", missingEvents.map((f) => f.id));
  process.exit(1);
}
const javaCrossFn = javaDeep.allFindings.find((f) => f.interprocedural?.crossesFunctions);
console.log(
  "Java 3-hop interprocedural finding:",
  javaCrossFn?.id,
  javaCrossFn?.interprocedural?.functionChain,
  javaCrossFn?.evidenceRecord?.callGraphScope
);
if (!javaCrossFn || javaCrossFn.evidenceRecord?.callGraphScope !== "INTER_PROCEDURAL_CROSS_FUNCTION") {
  console.error("FAIL: Expected Java ShiftLeftSecurity/Benchmark seed to demonstrate INTER_PROCEDURAL_CROSS_FUNCTION");
  process.exit(1);
}

// ---- OWASP/Benchmark (b101e4a98c3d7201 — 14 Findings: 4 Primary + 10 Architectural Threat Hypotheses) ----
const owaspBench = findBenchmarkRepoByUrl("https://github.com/OWASP/Benchmark")!;
const owaspCommit = "b101e4a98c3d7201a1b2c3d4e5f60718293aa1b2";
const owaspRes = scanFilesWithEnterpriseEngines({
  files: owaspBench.seedFiles,
  repoUrl: "OWASP/Benchmark",
  branch: "master",
  commitSha: owaspCommit,
  primaryLanguage: "Java",
  selectedEngines: ["XQL"],
});
const owaspDeep = generateDeepReEnumeratedFindings({
  primaryFindings: owaspRes.findings,
  primaryValidation: owaspRes.validationFindings,
  repoUrl: "OWASP/Benchmark",
  commitSha: owaspCommit,
  language: "Java",
});
const owaspVMap = new Map(owaspDeep.allValidationFindings.map((v) => [v.findingId, v]));
const owaspIssues = validateReportIntegrity(owaspDeep.allFindings, owaspVMap);
const owaspPortfolio = summarizePatchVerificationPortfolio(
  owaspDeep.allFindings.map((f) => f.evidenceRecord?.patchVerification)
);
console.log("OWASP/Benchmark (b101e4) Findings:", owaspDeep.allFindings.length, "Integrity issues:", owaspIssues.length);
console.log("OWASP/Benchmark Patch Portfolio:", owaspPortfolio);
if (owaspIssues.length > 0) {
  console.error("FAIL: OWASP/Benchmark integrity issues:", owaspIssues);
  process.exit(1);
}
if (owaspPortfolio.staticValidationFailedCount > 0 || owaspPortfolio.staticValidationPassedCount !== owaspDeep.allFindings.length) {
  console.error("FAIL: Expected 100% static patch validation pass (including RE-ENUM-010 CWE-611 http:// URLs):", owaspPortfolio);
  process.exit(1);
}
for (const f of owaspDeep.allFindings) {
  const prov = validateFindingProvenance({ repositoryId: "OWASP/Benchmark", commitSha: owaspCommit }, f);
  if (!prov.valid || f.evidenceRecord?.repositoryCommitSha !== owaspCommit) {
    console.error("FAIL: Provenance mismatch on finding", f.id, prov.errors);
    process.exit(1);
  }
}
// Adversarial provenance test: verify that a stale commit SHA ("ea0146607a2d...") is caught and rejected
const staleCheck = validateFindingProvenance(
  { repositoryId: "OWASP/Benchmark", commitSha: "ea0146607a2d7ec7a1b2c3d4e5f60718293aa1b2" },
  owaspDeep.allFindings[0]
);
if (staleCheck.valid || !staleCheck.errors.some((e) => e.startsWith("COMMIT_SHA_MISMATCH"))) {
  console.error("FAIL: validateFindingProvenance failed to reject stale commit SHA", staleCheck);
  process.exit(1);
}
console.log("ALL JAVA SHIFTLEFTSECURITY/BENCHMARK & OWASP/BENCHMARK (B101E4) REPORT INTEGRITY & PROVENANCE CHECKS PASSED");
