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
import {
  validateFindingProvenance,
  findEvidenceLedgerContradictions,
  synchronizeFindingWithEvidenceLedger,
  verifyEvidenceChainIndependently,
} from "../lib/finding-evidence-ledger";
import { runExternalBenchmarkAccuracySuite } from "../lib/controlled-verification-stage";
import { summarizePatchVerificationPortfolio } from "../lib/patch-verification-engine";
import { validateSourceProvenance } from "../lib/source-provenance";
import { buildStrikeHandoffEnvelope } from "../lib/strike-handoff-contract";
import { normalizeFindingCvssAndProof } from "../lib/cvss31";
import { consolidateAdjacentRootCauseFindings } from "../lib/live-sast-scanner";

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

// ---- Milestone Verification: SCA-007 Provenance + 22 Primary Patches Compiled/Retested + Expedite Strike Runtime Validation + 8-Stage Lifecycle ----
const samplePkgJson = JSON.stringify(
  {
    name: "shiftleft-benchmark-deps",
    version: "1.0.0",
    dependencies: {
      lodash: "4.17.15",
      minimist: "1.2.0",
      axios: "0.21.1",
      express: "4.17.1",
      jsonwebtoken: "8.5.1",
      "serialize-javascript": "2.1.2",
      "node-fetch": "2.6.0",
    },
  },
  null,
  2
);
const pkgLines = samplePkgJson.split("\n");
const nodeFetchIdx = pkgLines.findIndex((l) => l.includes('"node-fetch"'));
const exactLine = nodeFetchIdx + 1;
const exactSnippet = pkgLines.slice(Math.max(0, nodeFetchIdx - 1), Math.min(pkgLines.length, nodeFetchIdx + 2)).join("\n");
const sca007Prov = validateSourceProvenance(
  {
    id: "SCA-007",
    cwe: "CWE-1395",
    file: "package.json",
    line: exactLine,
    codeSnippet: `${exactSnippet}\n// Advisory: GHSA-node-fetch`,
    sink: "Live OSV/NVD Advisory GHSA-node-fetch",
  },
  samplePkgJson
);
if (sca007Prov.status !== "VERIFIED") {
  console.error("FAIL: SCA-007 source provenance check failed:", sca007Prov);
  process.exit(1);
}
const sca007Finding = normalizeFindingCvssAndProof(
  {
    ...javaDeep.allFindings[0],
    id: "SCA-007",
    cwe: "CWE-1395",
    cweName: "Dependency on Vulnerable Third-Party Component",
    title: "Vulnerable Dependency: node-fetch@2.6.0 (GHSA-r683-j2x4-v87g)",
    file: "package.json",
    line: exactLine,
    language: "TypeScript",
    codeSnippet: `${exactSnippet}\n// Advisory: GHSA-r683-j2x4-v87g`,
    sink: pkgLines[nodeFetchIdx].trim(),
    sourceProvenance: sca007Prov,
    remediation: [
      {
        platform: "Node.js",
        explanation: "Upgrade node-fetch to >= 2.6.7 in package.json.",
        code: `// Remediated package.json dependency constraint\n{\n  "dependencies": {\n    "node-fetch": "^2.6.7"\n  }\n}`,
      },
    ],
  },
  {
    ...javaDeep.allValidationFindings[0],
    findingId: "SCA-007",
    commitSha: "ea0146607a2d7ec7", // 16-char short SHA to test normalization against 40-char SHA
    repository: "https://github.com/ShiftLeftSecurity/Benchmark",
  }
);
const mixedPortfolio = [...javaDeep.allFindings, sca007Finding];
const contradictions = findEvidenceLedgerContradictions(mixedPortfolio);
if (contradictions.length > 0) {
  console.error("FAIL: findEvidenceLedgerContradictions reported issues with SCA-007:", contradictions);
  process.exit(1);
}
// Verify Opt-In Polyglot Build Harness + Expedite Strike Controlled Runtime Validation when executeSandboxAndBuildHarness = true
const javaWithBuildAndSandbox = javaDeep.allFindings.map((f) =>
  synchronizeFindingWithEvidenceLedger(
    { ...f },
    "ea0146607a2d7ec7a1b2c3d4e5f60718293aa1b2",
    "ShiftLeftSecurity/Benchmark",
    { executeSandboxAndBuildHarness: true }
  )
);
const javaPortfolio = summarizePatchVerificationPortfolio(
  javaWithBuildAndSandbox.map((f) => f.evidenceRecord?.patchVerification)
);
const javaPrimaryCount = javaWithBuildAndSandbox.filter(
  (f) => f.findingOrigin !== "ARCHITECTURAL_CANDIDATE_HYPOTHESIS" && !f.id.startsWith("RE-ENUM-")
).length;
console.log("ShiftLeftSecurity/Benchmark (ea0146) Primary Findings:", javaPrimaryCount, "Patch Portfolio (Controlled Verification Stage):", javaPortfolio);
if (
  javaPortfolio.compiledSuccessfullyCount !== javaPrimaryCount ||
  javaPortfolio.securityRegressionPassedCount !== javaPrimaryCount ||
  javaPortfolio.functionalRegressionPassedCount !== javaPrimaryCount ||
  javaPortfolio.remediationVerifiedCount !== javaPrimaryCount
) {
  console.error("FAIL: Expected all primary repository patches (and 0 synthetic hypotheses) to compile and pass regression in Controlled Verification Stage:", javaPortfolio);
  process.exit(1);
}
const javaBuildGates = runTenGateReportAcceptanceSuite(javaWithBuildAndSandbox, javaVMap);
const atPatch11 = javaBuildGates.find((g) => g.testId === "AT-PATCH-11");
const atRegression12 = javaBuildGates.find((g) => g.testId === "AT-REGRESSION-12");
const atEvidence14 = javaBuildGates.find((g) => g.testId === "AT-EVIDENCE-14");
const atBenchmark15 = javaBuildGates.find((g) => g.testId === "AT-INTERNAL-BENCHMARK-15");
console.log("AT-PATCH-11 (Controlled Verification Stage):", atPatch11?.status, atPatch11?.measuredMetric);
console.log("AT-REGRESSION-12 (Controlled Verification Stage):", atRegression12?.status, atRegression12?.measuredMetric);
console.log("AT-EVIDENCE-14 (Controlled Verification Stage):", atEvidence14?.status, atEvidence14?.measuredMetric);
console.log("AT-INTERNAL-BENCHMARK-15 (External Benchmark):", atBenchmark15?.status, atBenchmark15?.measuredMetric);
if (
  atPatch11?.status !== "PASS" ||
  atRegression12?.status !== "PASS" ||
  atEvidence14?.status !== "PASS" ||
  atBenchmark15?.status !== "PASS"
) {
  console.error("FAIL: Expected AT-PATCH-11, AT-REGRESSION-12, AT-EVIDENCE-14, and AT-INTERNAL-BENCHMARK-15 to PASS in Controlled Verification Stage");
  process.exit(1);
}
const confirmedJavaFindings = javaWithBuildAndSandbox.filter(
  (f) =>
    f.findingOrigin !== "ARCHITECTURAL_CANDIDATE_HYPOTHESIS" &&
    (f.proofState === "DATAFLOW_CONFIRMED" || f.proofState === "RUNTIME_REPRODUCED")
);
for (const cf of confirmedJavaFindings) {
  const env = buildStrikeHandoffEnvelope(cf);
  if (
    cf.evidenceRecord?.runtimeSandboxVerdict !== "REPRODUCED" ||
    cf.evidenceRecord?.canonicalRegistry.dataflow_state !== "RUNTIME_REPRODUCED" ||
    !cf.evidenceRecord?.lifecycleCertified ||
    cf.evidenceRecord?.eightStageLifecycle.length !== 8 ||
    !env.steps.every((s) => s.status === "COMPLETED")
  ) {
    console.error("FAIL: Confirmed finding not fully validated by Expedite Strike or 8-stage lifecycle:", cf.id, env.steps);
    process.exit(1);
  }
}

// ---- Verify 6-Step Controlled Verification Stage on OWASP/Benchmark (XTRIKE-RPT-B101E4-2026: 4 Primary + 10 Synthetic) ----
const owaspNormalized = owaspDeep.allFindings.map((f) =>
  normalizeFindingCvssAndProof(f, owaspVMap.get(f.id))
);
const owaspBuckets = proofStateBuckets(owaspNormalized, owaspVMap);
const owaspGates = runTenGateReportAcceptanceSuite(owaspNormalized, owaspVMap);
const owaspPrimary = owaspNormalized.filter(
  (f) => f.findingOrigin !== "ARCHITECTURAL_CANDIDATE_HYPOTHESIS" && !f.id.startsWith("RE-ENUM-")
);
const owaspSynth = owaspNormalized.filter(
  (f) => f.findingOrigin === "ARCHITECTURAL_CANDIDATE_HYPOTHESIS" || f.id.startsWith("RE-ENUM-")
);
if (owaspPrimary.length !== 4 || owaspSynth.length !== 10) {
  console.error("FAIL: Expected 4 primary + 10 synthetic findings on OWASP/Benchmark, got:", owaspPrimary.length, owaspSynth.length);
  process.exit(1);
}
// Directive 1: Verify Proof-State Scorecard / Executive Summary / Dossiers / AT-PROOF-06 / AT-RUNTIME-07 alignment (4 RUNTIME_REPRODUCED, 0 DATAFLOW_CONFIRMED)
if (
  owaspBuckets.RUNTIME_REPRODUCED.length !== 4 ||
  owaspBuckets.DATAFLOW_CONFIRMED.length !== 0
) {
  console.error("FAIL: Expected 4 RUNTIME_REPRODUCED and 0 DATAFLOW_CONFIRMED in OWASP/Benchmark buckets:", owaspBuckets);
  process.exit(1);
}
// Directive 4: Verify AT-GATE-10 separates Primary Repository Findings (3/4 Critical/High) from Synthetic Hypotheses (9 Critical/High)
const owaspGate10 = owaspGates.find((g) => g.testId === "AT-GATE-10")!;
console.log("OWASP/Benchmark AT-GATE-10:", owaspGate10.measuredMetric);
if (!owaspGate10.measuredMetric.includes("3/4 Critical/High Primary Repository Findings") || !owaspGate10.measuredMetric.includes("9 synthetic Critical/High hypotheses segregated")) {
  console.error("FAIL: AT-GATE-10 did not separate primary repository findings from synthetic hypotheses:", owaspGate10);
  process.exit(1);
}
// Step 1 & Directive 2: Verify context-exact variable/table/path names AND symlink/hardlink/TOCTOU hardening in SAST-003 (BenchmarkTest00017.java)
const sast001 = owaspPrimary.find((f) => f.cwe === "CWE-89")!;
const sast002 = owaspPrimary.find((f) => f.cwe === "CWE-78")!;
const sast003 = owaspPrimary.find((f) => f.cwe === "CWE-22")!;
const sast004 = owaspPrimary.find((f) => f.cwe === "CWE-79")!;
if (
  !sast001?.remediation[0]?.code.includes("SELECT * FROM USERS WHERE USERNAME = 'foo' AND PASSWORD = ?") ||
  !sast001?.remediation[0]?.code.includes("ps.setString(1, input)") ||
  !sast002?.remediation[0]?.code.includes("X-Benchmark-Command") ||
  !sast002?.remediation[0]?.code.includes("cmd") ||
  !sast003?.remediation[0]?.code.includes("/var/owasp/data") ||
  !sast003?.remediation[0]?.code.includes("reportParam") ||
  !sast003?.remediation[0]?.code.includes("candidate.toRealPath(java.nio.file.LinkOption.NOFOLLOW_LINKS)") ||
  !sast003?.remediation[0]?.code.includes("unix:nlink") ||
  !sast003?.remediation[0]?.code.includes("FileChannel.open") ||
  !sast003?.evidenceRecord?.controlledVerification?.adversarialPathTraversalSuite?.overallPassed ||
  !sast004?.remediation[0]?.code.includes("Encode.forHtml(reportParam)") ||
  !sast004?.remediation[0]?.code.includes("content.length")
) {
  console.error("FAIL: Context-exact or adversarial CWE-22 hardening missing on OWASP/Benchmark primary findings:", {
    sast001: sast001?.remediation[0]?.code,
    sast002: sast002?.remediation[0]?.code,
    sast003: sast003?.remediation[0]?.code,
    sast003Adv: sast003?.evidenceRecord?.controlledVerification?.adversarialPathTraversalSuite,
    sast004: sast004?.remediation[0]?.code,
  });
  process.exit(1);
}
// Steps 1-4: Verify all 4 primary findings compiled, reproduced pre-patch, blocked post-patch, and passed functional regression, while 10 synthetic hypotheses are excluded
for (const pf of owaspPrimary) {
  const cv = pf.evidenceRecord?.controlledVerification;
  if (
    !cv ||
    cv.stageStatus !== "CONTROLLED_VERIFICATION_COMPLETE" ||
    cv.buildCapture?.exitCode !== 0 ||
    cv.exploitReplay?.prePatchStatus !== "REPRODUCED" ||
    cv.exploitReplay?.postPatchStatus !== "EXPLOIT_BLOCKED" ||
    cv.functionalRegression?.status !== "PASSED" ||
    pf.evidenceRecord?.canonicalRegistry.compile_state !== "PASSED" ||
    pf.evidenceRecord?.canonicalRegistry.runtime_state !== "REPRODUCED" ||
    pf.evidenceRecord?.canonicalRegistry.regression_state !== "PASSED" ||
    !pf.evidenceRecord?.lifecycleCertified
  ) {
    console.error("FAIL: Controlled Verification Stage incomplete on OWASP/Benchmark primary finding:", pf.id, cv);
    process.exit(1);
  }
}
for (const sf of owaspSynth) {
  if (
    sf.evidenceRecord?.controlledVerification?.stageStatus !== "EXCLUDED_SYNTHETIC_HYPOTHESIS" ||
    sf.evidenceRecord?.canonicalRegistry.compile_state !== "NOT_RUN" ||
    sf.evidenceRecord?.canonicalRegistry.runtime_state !== "NOT_APPLICABLE" ||
    (sf.verificationRecords && sf.verificationRecords.length > 0)
  ) {
    console.error("FAIL: Synthetic hypothesis was not excluded from build/runtime execution:", sf.id, sf.evidenceRecord?.canonicalRegistry);
    process.exit(1);
  }
}
// Step 5 & 6: Verify external benchmark suite and independent evidence chain audit
const extBench = runExternalBenchmarkAccuracySuite();
const owaspChainAudit = verifyEvidenceChainIndependently(owaspNormalized, {
  repositoryId: "OWASP/Benchmark",
  commitSha: owaspCommit,
});
console.log("External Benchmark Ground-Truth Suite:", {
  suite: extBench.suiteVersion,
  TP: extBench.truePositives,
  FP: extBench.falsePositives,
  TN: extBench.trueNegatives,
  FN: extBench.falseNegatives,
  TPR: `${extBench.truePositiveRatePercent}%`,
  FPR: `${extBench.falsePositiveRatePercent}%`,
  YoudenJ: `${extBench.youdenIndexPercent}%`,
});
console.log("OWASP/Benchmark Independent Evidence-Chain Audit:", {
  overallValid: owaspChainAudit.overallValid,
  signatures: `${owaspChainAudit.validSignaturesCount}/${owaspChainAudit.totalFindingsAudited}`,
  eventChains: `${owaspChainAudit.validEventChainsCount}/${owaspChainAudit.totalFindingsAudited}`,
  sha256ExecRecords: `${owaspChainAudit.validSha256ExecutionRecordsCount}/${owaspChainAudit.totalExecutionRecordsAudited}`,
  oneToOneAssociations: `${owaspChainAudit.oneToOneAssociationsVerifiedCount}/${owaspChainAudit.totalFindingsAudited}`,
});
if (!owaspChainAudit.overallValid || extBench.youdenIndexPercent < 80 || extBench.falsePositives > 0) {
  console.error("FAIL: External benchmark or independent evidence chain audit failed:", { extBench, owaspChainAudit });
  process.exit(1);
}

// ---- OWASP/BenchmarkPHP (XTRIKE-RPT-A1978A-2026 — Commit a1978a2fed195acda1b2c3d4e5f60718293aa1b2) ----
const phpBench = findBenchmarkRepoByUrl("https://github.com/OWASP/BenchmarkPHP")!;
const phpCommit = "a1978a2fed195acda1b2c3d4e5f60718293aa1b2";
const phpRes = scanFilesWithEnterpriseEngines({
  files: phpBench.seedFiles,
  repoUrl: "OWASP/BenchmarkPHP",
  branch: "main",
  commitSha: phpCommit,
  primaryLanguage: "PHP",
  selectedEngines: ["XQL", "DeepFlow", "StructSCA", "AST-Query"],
});
const phpConsolidated = consolidateAdjacentRootCauseFindings(phpRes.findings, phpRes.validationFindings);
const phpVMap = new Map(phpConsolidated.valFindings.map((v) => [v.findingId, v]));
const phpIssues = validateReportIntegrity(phpConsolidated.findings, phpVMap);
const phpGates = runTenGateReportAcceptanceSuite(phpConsolidated.findings, phpVMap);
const phpPortfolio = summarizePatchVerificationPortfolio(
  phpConsolidated.findings.map((f) => f.evidenceRecord?.patchVerification)
);
console.log(
  "OWASP/BenchmarkPHP (a1978a) Consolidated Findings:",
  phpConsolidated.findings.map((f) => ({
    id: f.id,
    cwe: f.cwe,
    file: f.file,
    line: f.line,
    prov: f.sourceProvenance?.status,
    remPlatform: f.remediation[0]?.platform,
    patchStatus: f.evidenceRecord?.patchVerification.status,
    runtimeVerdict: f.evidenceRecord?.runtimeSandboxVerdict,
    staticComplete: f.evidenceRecord?.staticLifecycleComplete,
    certified: f.evidenceRecord?.lifecycleCertified,
    consolidatedSinksCount: f.consolidatedSinks?.length || 1,
  }))
);
console.log("OWASP/BenchmarkPHP Integrity Issues:", phpIssues);
console.log("OWASP/BenchmarkPHP Patch Portfolio (Controlled Verification Stage):", phpPortfolio);

if (phpIssues.length > 0) {
  console.error("FAIL: OWASP/BenchmarkPHP integrity issues found:", phpIssues);
  process.exit(1);
}
if (phpPortfolio.staticValidationFailedCount > 0 || phpPortfolio.staticValidationPassedCount !== phpConsolidated.findings.length) {
  console.error("FAIL: Expected 100% of PHP remediation patches to pass static validation:", phpPortfolio);
  process.exit(1);
}
if (phpPortfolio.compiledSuccessfullyCount !== phpConsolidated.findings.length) {
  console.error("FAIL: Expected all 9 primary PHP patches to compile in Controlled Verification Stage:", phpPortfolio);
  process.exit(1);
}
// Verify contiguous finding IDs (SAST-001..SAST-00N) with no missing SAST-007 gap
for (let i = 0; i < phpConsolidated.findings.length; i++) {
  const expectedId = `SAST-${String(i + 1).padStart(3, "0")}`;
  if (phpConsolidated.findings[i].id !== expectedId) {
    console.error(`FAIL: Finding ID sequence gap at index ${i}: expected ${expectedId}, got ${phpConsolidated.findings[i].id}`);
    process.exit(1);
  }
}
// Verify consolidated sink preservation on DVWA vulnerabilities/sqli/source/low.php
const consolidatedSqli = phpConsolidated.findings.find(
  (f) => f.file === "vulnerabilities/sqli/source/low.php"
);
if (!consolidatedSqli || !consolidatedSqli.consolidatedSinks || consolidatedSqli.consolidatedSinks.length < 2) {
  console.error("FAIL: Expected consolidatedSinks on vulnerabilities/sqli/source/low.php to preserve both line 8 and line 9 sinks:", consolidatedSqli);
  process.exit(1);
}
// Verify Controlled Verification Stage consistency on all 9 PHP primary findings (including P0 SAST-013 gate on NEEDS_MANUAL_VALIDATION)
for (const pf of phpConsolidated.findings) {
  const isManual = pf.evidenceRecord?.authoritativeProofState === "NEEDS_MANUAL_VALIDATION";
  if (isManual) {
    if (
      pf.evidenceRecord?.runtimeSandboxVerdict !== "NOT_RUN" ||
      pf.evidenceRecord?.canonicalRegistry.runtime_state !== "NOT_RUN" ||
      pf.evidenceRecord?.canonicalRegistry.compile_state !== "PASSED" ||
      pf.evidenceRecord?.canonicalStatus12 !== "NEEDS_MANUAL_VALIDATION" ||
      !pf.evidenceRecord?.manualValidationDiagnostic
    ) {
      console.error("FAIL: NEEDS_MANUAL_VALIDATION PHP finding was not properly gated per P0 SAST-013 rule:", pf.id, pf.evidenceRecord?.canonicalRegistry);
      process.exit(1);
    }
  } else if (
    pf.evidenceRecord?.runtimeSandboxVerdict !== "REPRODUCED" ||
    pf.evidenceRecord?.canonicalRegistry.runtime_state !== "REPRODUCED" ||
    pf.evidenceRecord?.canonicalRegistry.compile_state !== "PASSED" ||
    !pf.evidenceRecord?.staticLifecycleComplete ||
    !pf.evidenceRecord?.lifecycleCertified ||
    pf.evidenceRecord?.canonicalStatus12 !== "FULLY_CERTIFIED"
  ) {
    console.error("FAIL: Controlled Verification Stage consistency violated on PHP finding:", pf.id, pf.evidenceRecord?.canonicalRegistry);
    process.exit(1);
  }
}
const failedPhpGates = phpGates.filter(
  (g) => g.status === "FAIL" || g.status === "NOT_RUN"
);
if (failedPhpGates.length > 0) {
  console.error("FAIL: OWASP/BenchmarkPHP had failing or NOT_RUN acceptance gates:", failedPhpGates);
  process.exit(1);
}

// ---- P0 Verification: SAST-012 (TLS Hostname-Verification CWE-297) & SAST-013 (NEEDS_MANUAL_VALIDATION Gate) ----
const sast012Raw = normalizeFindingCvssAndProof({
  ...javaDeep.allFindings[0],
  id: "SAST-012",
  title: "[AST] Permissive TLS Hostname Verifier (CWE-862)",
  cwe: "CWE-862",
  cweName: "Missing Authorization",
  owasp: "A01:2021 - Broken Access Control",
  owaspCategory: "Broken Access Control",
  mitre: "T1078",
  severity: "High",
  cvss: 7.5,
  cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
  confidence: 92,
  status: "Open",
  lastSeen: "2026-10-30",
  language: "Java",
  file: "src/main/java/org/owasp/benchmark/tls/TlsClientConfig.java",
  line: 44,
  source: "HttpClients.custom()",
  sink: ".setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)",
  taintPath: ["SSLContexts.custom().loadTrustMaterial(null, new TrustSelfSignedStrategy())", ".setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)"],
  codeSnippet: `SSLContext sslContext = SSLContexts.custom().loadTrustMaterial(null, new TrustSelfSignedStrategy()).build();\nCloseableHttpClient client = HttpClients.custom()\n    .setSSLContext(sslContext)\n    .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)\n    .build();`,
  executiveSummary: "TLS client disables hostname verification via NoopHostnameVerifier.INSTANCE.",
  rootCause: "Permissive NoopHostnameVerifier.INSTANCE and TrustSelfSignedStrategy allow MITM certificate spoofing.",
  privilegeGain: "TLS interception",
  authRequired: false,
  validationSteps: ["Verify certificate with mismatched SAN is rejected"],
  remediation: [
    {
      platform: "Java",
      explanation: "Enforce resource ownership check",
      code: "return repository.findByIdAndTenantId(id, principal.getTenantId());",
    },
  ],
});
const sast012Synced = synchronizeFindingWithEvidenceLedger(
  sast012Raw,
  "ea0146607a2d7ec7a1b2c3d4e5f60718293aa1b2",
  "ShiftLeftSecurity/Benchmark",
  { executeSandboxAndBuildHarness: true }
);
if (
  sast012Synced.cwe !== "CWE-297" ||
  sast012Synced.remediation[0]?.code.includes("findByIdAndTenantId") ||
  !sast012Synced.remediation[0]?.code.includes("DefaultHostnameVerifier") ||
  !sast012Synced.remediation[0]?.code.includes("SSLPeerUnverifiedException") ||
  sast012Synced.evidenceRecord?.patchVerification.status !== "PATCH_VERIFIED" ||
  sast012Synced.evidenceRecord?.canonicalStatus12 !== "FULLY_CERTIFIED"
) {
  console.error("FAIL: P0 SAST-012 TLS Hostname-Verification fix failed:", {
    cwe: sast012Synced.cwe,
    patchStatus: sast012Synced.evidenceRecord?.patchVerification.status,
    status12: sast012Synced.evidenceRecord?.canonicalStatus12,
    code: sast012Synced.remediation[0]?.code,
  });
  process.exit(1);
}
console.log("P0 SAST-012 Verified:", {
  id: sast012Synced.id,
  cwe: sast012Synced.cwe,
  patchStatus: sast012Synced.evidenceRecord?.patchVerification.status,
  canonicalStatus12: sast012Synced.evidenceRecord?.canonicalStatus12,
});

const sast013Raw = normalizeFindingCvssAndProof({
  ...javaDeep.allFindings[0],
  id: "SAST-013",
  title: "[AST] Potential Command Sink Across Unresolved Interface (CWE-78)",
  cwe: "CWE-78",
  cweName: "OS Command Injection",
  owasp: "A03:2021 - Injection",
  owaspCategory: "Injection",
  mitre: "T1059",
  severity: "High",
  cvss: 7.8,
  cvssVector: "CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:H",
  confidence: 78,
  status: "Open",
  lastSeen: "2026-10-30",
  language: "Java",
  file: "src/main/java/org/owasp/benchmark/cmd/CommandExecutor.java",
  line: 61,
  source: "CommandJobDispatcher.dispatch(jobPayload)",
  sink: "Runtime.getRuntime().exec(cmdArgs)",
  taintPath: ["CommandJobDispatcher.dispatch()", "CommandExecutor.run()"],
  codeSnippet: `public void run(String rawArg) throws IOException {\n  Runtime.getRuntime().exec("sh -c " + rawArg);\n}`,
  executiveSummary: "Command execution sink observed across unresolved interface boundary.",
  rootCause: "Sink executes shell command, but upstream interface binding is not statically resolved.",
  privilegeGain: "OS process execution",
  authRequired: true,
  proofState: "NEEDS_MANUAL_VALIDATION",
  interprocedural: {
    status: "NOT_ESTABLISHED",
    crossesFunctions: false,
    functionChain: ["CommandExecutor.run"],
    steps: [],
    note: "Upstream caller invokes CommandExecutor via dynamic DI interface.",
  },
  validationSteps: ["Trace DI caller binding"],
  remediation: [],
});
const sast013Synced = synchronizeFindingWithEvidenceLedger(
  sast013Raw,
  "ea0146607a2d7ec7a1b2c3d4e5f60718293aa1b2",
  "ShiftLeftSecurity/Benchmark",
  { executeSandboxAndBuildHarness: true }
);
if (
  sast013Synced.proofState !== "NEEDS_MANUAL_VALIDATION" ||
  sast013Synced.evidenceRecord?.authoritativeProofState !== "NEEDS_MANUAL_VALIDATION" ||
  sast013Synced.evidenceRecord?.runtimeSandboxVerdict !== "NOT_RUN" ||
  sast013Synced.evidenceRecord?.canonicalStatus12 !== "NEEDS_MANUAL_VALIDATION" ||
  !sast013Synced.evidenceRecord?.manualValidationDiagnostic
) {
  console.error("FAIL: P0 SAST-013 proof-consistency gate failed (was falsely promoted):", {
    proofState: sast013Synced.proofState,
    runtimeVerdict: sast013Synced.evidenceRecord?.runtimeSandboxVerdict,
    status12: sast013Synced.evidenceRecord?.canonicalStatus12,
    diag: sast013Synced.evidenceRecord?.manualValidationDiagnostic,
  });
  process.exit(1);
}
console.log("P0 SAST-013 Verified:", {
  id: sast013Synced.id,
  proofState: sast013Synced.proofState,
  runtimeSandboxVerdict: sast013Synced.evidenceRecord?.runtimeSandboxVerdict,
  canonicalStatus12: sast013Synced.evidenceRecord?.canonicalStatus12,
  diagnosticPresent: Boolean(sast013Synced.evidenceRecord?.manualValidationDiagnostic),
});

console.log("ALL JAVA SHIFTLEFTSECURITY/BENCHMARK, OWASP/BENCHMARK (B101E4), OWASP/BENCHMARKPHP (A1978A), SAST-012, SAST-013, SCA-007 PROVENANCE, CONTROLLED VERIFICATION STAGE & PROOF INTEGRITY CHECKS PASSED");
