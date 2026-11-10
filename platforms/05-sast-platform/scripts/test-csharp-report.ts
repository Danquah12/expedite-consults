import { LANGUAGE_STARTER_CODEBASES, scanFilesWithEnterpriseEngines } from "../lib/enterprise-sast-engine";
import { findBenchmarkRepoByUrl } from "../data/benchmark-repos";
import { generateDeepReEnumeratedFindings } from "../lib/deep-enumeration-engine";
import {
  validateReportIntegrity,
  computeAuditableRiskWorksheet,
  runTenGateReportAcceptanceSuite,
  proofStateBuckets,
  resolveTypedProofClassification,
} from "../lib/cvss31";
import { computeProofLifecycle } from "../lib/proof-lifecycle";
import { computeRiskIntelligence } from "../lib/risk-intelligence";
import {
  validateFindingProvenance,
  findEvidenceLedgerContradictions,
  synchronizeFindingWithEvidenceLedger,
  verifyEvidenceChainIndependently,
  reconcileAssessmentEndToEndV541,
} from "../lib/finding-evidence-ledger";
import { runExternalBenchmarkAccuracySuite } from "../lib/controlled-verification-stage";
import { summarizePatchVerificationPortfolio } from "../lib/patch-verification-engine";
import { validateSourceProvenance } from "../lib/source-provenance";
import { buildStrikeHandoffEnvelope } from "../lib/strike-handoff-contract";
import { normalizeFindingCvssAndProof } from "../lib/cvss31";
import { consolidateAdjacentRootCauseFindings } from "../lib/live-sast-scanner";
import FINDINGS from "../data/findings";
import { CANONICAL_VALIDATION_FINDINGS } from "../lib/validation-engine";
import { buildDeepExploitabilityDossier } from "../lib/deep-enumeration-engine";
import { getLanguageMatchedRemediation } from "../lib/enterprise-sast-engine";
import {
  computeModernizedRiskEngineV55,
  runXtrikeV55TwelveGateAcceptanceSuite,
} from "../lib/xtrike-v55-engine";
import {
  computeThreeScopeReleaseGatesV60,
  computeSixTierRemediationBreakdownV60,
  computeCanonicalRiskObjectV60,
  buildAcceptanceSuiteSupersessionLedgerV60,
  computeFiveStateRiskDisclosureContractV60,
  buildCanonicalFindingRegistryV60,
  runIndependentEvidenceVerifierTenPointV60,
  reconstructAttackPathsV60,
  getNineSubsystemArchitectureV60,
  getSevenContractVersionGovernanceV60,
  evaluateElevenSuitePermanentBenchmarkV60,
  computeSecurityAssuranceDashboardV60,
} from "../lib/xtrike-v60-engine";
import { buildCorrectiveAuditBundleV552 } from "../lib/xtrike-v552-corrective-engine";

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
const javaRuntimeReproducedCount = javaWithBuildAndSandbox.filter(
  (f) =>
    f.findingOrigin !== "ARCHITECTURAL_CANDIDATE_HYPOTHESIS" &&
    !f.id.startsWith("RE-ENUM-") &&
    f.evidenceRecord?.canonicalRegistry.runtime_state === "REPRODUCED"
).length;
console.log("ShiftLeftSecurity/Benchmark (ea0146) Primary Findings:", javaPrimaryCount, "Runtime Reproduced:", javaRuntimeReproducedCount, "Patch Portfolio (Controlled Verification Stage):", javaPortfolio);
if (
  javaPortfolio.compiledSuccessfullyCount !== javaPrimaryCount ||
  javaPortfolio.functionalRegressionPassedCount !== javaPrimaryCount ||
  javaPortfolio.securityRegressionPassedCount !== javaRuntimeReproducedCount ||
  javaPortfolio.remediationVerifiedCount !== javaRuntimeReproducedCount
) {
  console.error("FAIL: Expected primary repository patches to compile (and only runtime-reproduced findings to claim REMEDIATION_VERIFIED) in Controlled Verification Stage:", javaPortfolio);
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

// ---- Test exact app/reports/page.tsx pipeline on default FINDINGS + CANONICAL_VALIDATION_FINDINGS ----
const defaultValMap = new Map(CANONICAL_VALIDATION_FINDINGS.map((vf) => [vf.findingId, vf]));
const defaultFullCommit = "9f4c2a1b8e7d0312a4f5c6d7".padEnd(40, "a1b2c3d4e5f60718293a").slice(0, 40);
const defaultTargetName = "xtrike-core/enterprise-banking-api";
const defaultReportFindings = FINDINGS.map((f, idx) => {
  const lang = f.language || "Java";
  const languageMatched = {
    ...f,
    language: lang,
    remediation: getLanguageMatchedRemediation(f.remediation || [], lang, f.cwe),
  };
  const normalized = normalizeFindingCvssAndProof(languageMatched, defaultValMap.get(f.id));
  const withDossier = {
    ...normalized,
    deepExploitability: buildDeepExploitabilityDossier(normalized, idx),
  };
  return synchronizeFindingWithEvidenceLedger(withDossier, defaultFullCommit, defaultTargetName);
});
const defaultReportIssues = validateReportIntegrity(defaultReportFindings, defaultValMap);
console.log("Default /reports FINDINGS Integrity Issues:", defaultReportIssues);
if (defaultReportIssues.length > 0) {
  console.error("FAIL: Default /reports FINDINGS had integrity issues:", defaultReportIssues);
  process.exit(1);
}

// ---- Test exact app/reports/page.tsx pipeline on OWASP/www-project-benchmark (f502b2c34d5e2002) ----
const portalBench = findBenchmarkRepoByUrl("https://github.com/OWASP/www-project-benchmark")!;
const portalCommit = "f502b2c34d5e2002a1b2c3d4e5f60718293aa1b2";
const portalRes = scanFilesWithEnterpriseEngines({
  files: portalBench.seedFiles,
  repoUrl: "OWASP/www-project-benchmark",
  branch: "master",
  commitSha: portalCommit,
  primaryLanguage: "Java",
  selectedEngines: ["XQL"],
});
const portalDeep = generateDeepReEnumeratedFindings({
  primaryFindings: portalRes.findings,
  primaryValidation: portalRes.validationFindings,
  repoUrl: "OWASP/www-project-benchmark",
  commitSha: portalCommit,
  language: "Java",
});
const portalValMap = new Map(portalDeep.allValidationFindings.map((vf) => [vf.findingId, vf]));
const portalReportFindings = portalDeep.allFindings.map((f, idx) => {
  const lang = f.language || "Java";
  const languageMatched = {
    ...f,
    language: lang,
    remediation: getLanguageMatchedRemediation(f.remediation || [], lang, f.cwe),
  };
  const normalized = normalizeFindingCvssAndProof(languageMatched, portalValMap.get(f.id));
  const withDossier = {
    ...normalized,
    deepExploitability: buildDeepExploitabilityDossier(normalized, idx),
  };
  return synchronizeFindingWithEvidenceLedger(withDossier, portalCommit, "OWASP/www-project-benchmark");
});
const portalIssues = validateReportIntegrity(portalReportFindings, portalValMap);
console.log("OWASP/www-project-benchmark (f502b2c3) Findings:", portalReportFindings.length, "Integrity Issues:", portalIssues);
if (portalIssues.length > 0) {
  console.error("FAIL: OWASP/www-project-benchmark had integrity issues:", portalIssues);
  process.exit(1);
}

// ---- XTRIKE 5.5 12-Gate Release Acceptance Suite (XTR-01 .. XTR-12) Verification ----
const v55PortalGates = runXtrikeV55TwelveGateAcceptanceSuite(portalReportFindings);
const v55PortalRisk = computeModernizedRiskEngineV55(portalReportFindings);
const v55PortalPassCount = v55PortalGates.filter((g) => g.status === "PASS").length;
console.log(
  "XTRIKE v5.5 12-Gate Suite (OWASP/www-project-benchmark):",
  `${v55PortalPassCount}/${v55PortalGates.length}`,
  "Pre->Post Risk:",
  `${v55PortalRisk.portfolioScores.preMergeRepositoryResidualRiskIndex}->${v55PortalRisk.portfolioScores.postPatchProjectedResidualRiskIndex}`
);
for (const gate of v55PortalGates) {
  console.log(`  [${gate.status}] ${gate.id} (${gate.requirement}): ${gate.measuredEvidence}`);
}
if (v55PortalPassCount !== 12) {
  console.error("FAIL: XTRIKE v5.5 12-Gate Suite failed on OWASP/www-project-benchmark:", v55PortalGates.filter((g) => g.status !== "PASS"));
  process.exit(1);
}

const v55DefaultGates = runXtrikeV55TwelveGateAcceptanceSuite(defaultReportFindings);
const v55DefaultPassCount = v55DefaultGates.filter((g) => g.status === "PASS").length;
console.log(
  "XTRIKE v5.5 12-Gate Suite (Default FINDINGS):",
  `${v55DefaultPassCount}/${v55DefaultGates.length}`
);
if (v55DefaultPassCount !== 12) {
  console.error("FAIL: XTRIKE v5.5 12-Gate Suite failed on Default FINDINGS:", v55DefaultGates.filter((g) => g.status !== "PASS"));
  process.exit(1);
}

// ---- XTRIKE v5.5.0 Technical Remediation & v6.0 Governance Verification ----
for (const [label, suiteFindings] of [
  ["C# BenchmarkDotNet", deep.allFindings],
  ["Java ShiftLeftSecurity/Benchmark", javaDeep.allFindings],
  ["PHP DVWA / BenchmarkPHP", phpConsolidated.findings],
  ["OWASP/www-project-benchmark", portalReportFindings],
  ["Default FINDINGS", defaultReportFindings],
] as const) {
  const gates3 = computeThreeScopeReleaseGatesV60(suiteFindings);
  const rem6 = computeSixTierRemediationBreakdownV60(suiteFindings);
  const risk6 = computeCanonicalRiskObjectV60(suiteFindings);
  const supLedger = buildAcceptanceSuiteSupersessionLedgerV60(suiteFindings);
  const fiveStateRisk = computeFiveStateRiskDisclosureContractV60(suiteFindings);
  const regRecords = buildCanonicalFindingRegistryV60(suiteFindings, label);
  const verifier10 = runIndependentEvidenceVerifierTenPointV60(suiteFindings);
  const attackPaths = reconstructAttackPathsV60(suiteFindings);
  const dash = computeSecurityAssuranceDashboardV60(suiteFindings);
  const passedChecks = verifier10.checks.filter((c) => c.status === "VERIFIED").length;

  console.log(`v6.0 Governance [${label}]:`, {
    gate1Engine: gates3.engineReleaseGate.status,
    gate2Remediation: `${gates3.remediationVerificationGate.status} (${rem6.tiers[4].count}/${rem6.totalPrimaryFindings} Exploit-Blocked vs ${rem6.tiers[2].count}/${rem6.totalPrimaryFindings} Build-Passed)`,
    gate3ProdDeploy: gates3.productionDeploymentGate.status,
    canonicalRisk: {
      inherent: risk6.inherentRisk.score,
      observed: risk6.currentObservedRisk.score,
      contextAdjusted: risk6.contextAdjustedRisk.score,
      confidence: risk6.evidenceConfidence.score,
      harnessProjected: risk6.residualRiskAfterVerifiedRemediation.score,
      prodActive: risk6.residualRiskAfterProductionDeployment.score,
    },
    fiveStateContractInvariant: fiveStateRisk.productionRiskUnchangedInvariantVerified,
    verifier10Point: `${passedChecks}/${verifier10.checks.length} (LLM Final Authority=${verifier10.llmFinalAuthorityPermitted})`,
    attackPathsReconstructed: attackPaths.length,
    refusalToPromoteRate: `${dash.correctRefusalToPromoteRatePercent}%`,
    prodCertification: `${dash.metrics[4].headlinePercent}%`,
    v53Reconciled: `${supLedger.suites[0].passedTests}/${supLedger.suites[0].totalTests}`,
    v55Reconciled: `${supLedger.suites[1].passedTests}/${supLedger.suites[1].totalTests}`,
  });

  if (
    gates3.engineReleaseGate.status !== "PASSED_ENGINE_READY" ||
    gates3.productionDeploymentGate.status !== "BLOCKED_UNMERGED_PRODUCTION" ||
    gates3.overallTargetApplicationReleaseAllowed !== false
  ) {
    console.error(`FAIL [${label}]: 3-Scope Release Gates violated invariant:`, gates3);
    process.exit(1);
  }
  if (
    risk6.residualRiskAfterProductionDeployment.score !== risk6.currentObservedRisk.score ||
    !fiveStateRisk.productionRiskUnchangedInvariantVerified ||
    fiveStateRisk.states.length !== 5
  ) {
    console.error(`FAIL [${label}]: Production residual risk must equal current observed risk before PR merge`);
    process.exit(1);
  }
  if (!supLedger.allHistoricalDiscrepanciesResolved) {
    console.error(`FAIL [${label}]: Historical 18-test vs 12-gate supersession ledger unreconciled:`, supLedger);
    process.exit(1);
  }
  if (
    !verifier10.overallValid ||
    passedChecks !== 10 ||
    verifier10.llmFinalAuthorityPermitted !== false ||
    regRecords.length !== suiteFindings.length ||
    dash.correctRefusalToPromoteRatePercent !== 100 ||
    dash.metrics[4].headlinePercent !== 0
  ) {
    console.error(`FAIL [${label}]: v6.0 10-point verifier / dashboard / registry check failed:`, {
      verifier10,
      regRecordsLen: regRecords.length,
      dash,
    });
    process.exit(1);
  }
}

const arch9 = getNineSubsystemArchitectureV60();
const contracts7 = getSevenContractVersionGovernanceV60();
const bench11 = evaluateElevenSuitePermanentBenchmarkV60();
if (arch9.length !== 9 || contracts7.length !== 7 || bench11.length !== 11) {
  console.error("FAIL: Expected 9 architecture subsystems, 7 version contracts, and 11 permanent benchmark suites");
  process.exit(1);
}

// ---- XTRIKE v5.5.2 Detection-Correctness, Patch-Fidelity, 4-Layer Verification & 60-Test Regression Verification ----
const v552Bundle = buildCorrectiveAuditBundleV552(undefined, "XTRIKE-RPT-4E98F1-2026");
console.log("XTRIKE v5.5.2 Corrective Audit Summary:", {
  version: v552Bundle.version,
  adjudicatedCount: v552Bundle.adjudicatedFindings.length,
  confirmedProductionRisk: `${v552Bundle.separatedRisk.authoritativeConfirmedProductionRiskScore}/100 (down from ${v552Bundle.separatedRisk.preAdjudicationRawScore}/100 raw)`,
  benchmark26Manifest: `${v552Bundle.benchmark26Manifest.activeCalibrationCases} active + ${v552Bundle.benchmark26Manifest.heldOutScopeFixtures} held-out = ${v552Bundle.benchmark26Manifest.totalCatalogedFixtures} total`,
  regression60: `${v552Bundle.regressionSuite60.passedTests}/${v552Bundle.regressionSuite60.totalTests} passed`,
  categoryCounts: v552Bundle.regressionSuite60.categoryCounts,
});

if (!v552Bundle.regressionSuite60.allPassed || v552Bundle.regressionSuite60.passedTests !== 60) {
  const failed = v552Bundle.regressionSuite60.results.filter((r) => !r.passed);
  console.error("FAIL: XTRIKE v5.5.2 60-Test Regression Suite had failures:", failed);
  process.exit(1);
}
if (
  v552Bundle.benchmark26Manifest.entries.length !== 26 ||
  v552Bundle.separatedRisk.authoritativeConfirmedProductionRiskScore !== 18 ||
  v552Bundle.separatedRisk.testClientExcludedExposureScore !== 0
) {
  console.error("FAIL: XTRIKE v5.5.2 benchmark manifest or separated risk invariant failed");
  process.exit(1);
}

// ---- XTRIKE v5.5.3 OWASP Juice Shop Audit (XTRIKE-RPT-266448-2026) & Cross-Repo Isolation Verification ----
const juiceShopCommit = "266448085bc2a1b2c3d4e5f60718293aa1b2c3d4";
const juiceShopScan = scanFilesWithEnterpriseEngines({
  files: [
    {
      path: "routes/search.ts",
      language: "TypeScript",
      content: `import models = require('../models/index')\nmodule.exports = function searchProducts () {\n  return (req: Request, res: Response, next: NextFunction) => {\n    let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''\n    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)\n    models.sequelize.query(\`SELECT * FROM Products WHERE ((name LIKE '%\${criteria}%' OR description LIKE '%\${criteria}%') AND deletedAt IS NULL) ORDER BY name\`).then(([products]: any) => {\n      res.json(utils.queryResultToJson(products))\n    })\n  }\n}`,
    },
    {
      path: "server.ts",
      language: "TypeScript",
      content: `import express = require('express')\nimport multer = require('multer')\nconst app = express()\nconst storage = multer.diskStorage({\n  destination: '/tmp/uploads',\n  filename: (_req: any, file: any, cb: any) => {\n    cb(null, security.sanitizeFilename(file.originalname))\n  }\n})\nconst uploadToDisk = multer({ storage: storage, fileFilter: fileFilter })\nif (process.env.STATIC_FILES) {\n  process.exit(0)\n}\nfunction closeGracefully (exitCode: number) {\n  process.exit(exitCode)\n}`,
    },
    {
      path: "package.json",
      language: "Node.js",
      content: `{\n  "name": "juice-shop",\n  "dependencies": {\n    "jsonwebtoken": "^0.4.0",\n    "compression": "~1.7.4",\n    "express-jwt": "0.1.3"\n  }\n}`,
    },
  ],
  repoUrl: "https://github.com/juice-shop/juice-shop",
  branch: "master",
  commitSha: juiceShopCommit,
  primaryLanguage: "TypeScript",
  selectedEngines: ["XTRIKE XQL", "XTRIKE DeepFlow", "XTRIKE StructSCA", "XTRIKE AST-Query"],
});

const juiceShopSynced = juiceShopScan.findings.map((f) =>
  synchronizeFindingWithEvidenceLedger(
    { ...f },
    juiceShopCommit,
    "juice-shop/juice-shop",
    { executeSandboxAndBuildHarness: true }
  )
);

// 1. P0-01: Verify SAST-001 (routes/search.ts) uses Sequelize replacements on Products and criteria (NEVER orders / req.db.query)
const jsSqli = juiceShopSynced.find((f) => f.cwe === "CWE-89" && f.file === "routes/search.ts");
if (
  !jsSqli ||
  !/models\.sequelize\.query/i.test(jsSqli.remediation[0]?.code || "") ||
  !/Products/i.test(jsSqli.remediation[0]?.code || "") ||
  !/replacements/i.test(jsSqli.remediation[0]?.code || "") ||
  /FROM\s+orders/i.test(jsSqli.remediation[0]?.code || "") ||
  /FROM\s+orders/i.test(jsSqli.evidenceRecord?.controlledVerification?.exploitReplay?.prePatchObservedTrace || "")
) {
  console.error("FAIL [P0-01]: Juice Shop routes/search.ts SQLi remediation or runtime trace mismatched:", jsSqli);
  process.exit(1);
}

// 2. P0-02: Verify non-request lifecycle process.exit(0) and process.exit(exitCode) are suppressed
const jsProcessExit = juiceShopSynced.filter((f) => /process\.exit/i.test(f.sink || ""));
if (jsProcessExit.length !== 0) {
  console.error("FAIL [P0-02]: Expected 0 findings for startup/shutdown process.exit(0 | exitCode):", jsProcessExit);
  process.exit(1);
}

// 3. P0-02: Verify Multer limits (CWE-770) preserves storage & fileFilter (never memoryStorage) and Multer originalname (CWE-22) is GUARD_ANALYZED
const jsMulterLimits = juiceShopSynced.find((f) => f.cwe === "CWE-770");
const jsMulterFilename = juiceShopSynced.find((f) => f.cwe === "CWE-22" && /sanitizeFilename/i.test(f.sink || ""));
const jsXPoweredBy = juiceShopSynced.find((f) => f.cwe === "CWE-200");
if (
  !jsMulterLimits ||
  /memoryStorage/i.test(jsMulterLimits.remediation[0]?.code || "") ||
  !/limits\s*:/i.test(jsMulterLimits.remediation[0]?.code || "") ||
  !jsMulterFilename ||
  jsMulterFilename.proofState !== "GUARD_ANALYZED" ||
  /readFileSync/i.test(jsMulterFilename.remediation[0]?.code || "") ||
  !jsXPoweredBy ||
  jsXPoweredBy.proofState !== "GUARD_ANALYZED"
) {
  console.error("FAIL [P0-02]: Juice Shop server.ts findings misclassified or mismatched patch:", {
    jsMulterLimits,
    jsMulterFilename,
    jsXPoweredBy,
  });
  process.exit(1);
}

// 4. P0-03 & P0-06: Verify package.json CWE-1395 finding uses 8-stage SCA pipeline and never emits package.json:caller()
const jsJwtSca = juiceShopSynced.find((f) => f.cwe === "CWE-1395");
const jsDiag = jsJwtSca?.evidenceRecord?.manualValidationDiagnostic;
if (
  !jsJwtSca ||
  !jsDiag ||
  /package\.json:caller\(\)/i.test(jsDiag.propagationPathSummary) ||
  !/1\.\s*Manifest/i.test(jsDiag.propagationPathSummary)
) {
  console.error("FAIL [P0-06]: CWE-1395 package.json finding failed 8-stage SCA diagnostic check:", jsDiag);
  process.exit(1);
}

// 5. P0-04 & P0-05: Verify Juice Shop Corrective Audit Bundle has 0 WebGoat Java references and 12/12 XTR v5.5 gates pass with 0 reconciliation errors
const jsAuditBundle = buildCorrectiveAuditBundleV552(
  juiceShopSynced,
  "XTRIKE-RPT-266448-2026",
  "juice-shop/juice-shop",
  juiceShopCommit
);
const jsAuditJson = JSON.stringify({
  adjudicatedFindings: jsAuditBundle.adjudicatedFindings,
  separatedRisk: jsAuditBundle.separatedRisk,
  fourLayerVerification: jsAuditBundle.fourLayerVerification,
});
if (/SqlInjectionLesson8|BlindScript|PathTraversalIntegrationTest|49927b9fd0f0/i.test(jsAuditJson)) {
  console.error("FAIL [P0-04]: Cross-repository WebGoat contamination detected in Juice Shop audit bundle:", jsAuditJson);
  process.exit(1);
}
const jsV55Gates = runXtrikeV55TwelveGateAcceptanceSuite(juiceShopSynced);
const jsReconcile = reconcileAssessmentEndToEndV541(juiceShopSynced);
const jsContradictions = findEvidenceLedgerContradictions(juiceShopSynced);
console.log("OWASP Juice Shop (XTRIKE-RPT-266448-2026) Verification:", {
  findingsCount: juiceShopSynced.length,
  v55GatesPassed: `${jsV55Gates.filter((g) => g.status === "PASS").length}/${jsV55Gates.length}`,
  reconciled: jsReconcile.allReconciled,
  contradictions: jsContradictions.length,
  webGoatContamination: false,
});
if (
  jsV55Gates.some((g) => g.status !== "PASS") ||
  !jsReconcile.allReconciled ||
  jsContradictions.length !== 0
) {
  console.error("FAIL [P0-05]: Juice Shop report failed v5.5 gates or reconciliation:", {
    failedGates: jsV55Gates.filter((g) => g.status !== "PASS"),
    jsReconcile,
    jsContradictions,
  });
  process.exit(1);
}

// ============================================================================
// XTRIKE v5.5.3 — OWASP BenchmarkDotNet (XTRIKE-RPT-B104D2-2026) Audit Verification
// ============================================================================
const csCommit = "b104d2e9a1b2c3d4e5f60718293aa1b2c3d4e5f6";
const csSynced = deep.allFindings.map((f, idx) => {
  const withDossier = {
    ...f,
    deepExploitability: buildDeepExploitabilityDossier({ ...f, deepExploitability: undefined }, idx),
  };
  return synchronizeFindingWithEvidenceLedger(
    withDossier,
    csCommit,
    "OWASP/BenchmarkDotNet",
    { executeSandboxAndBuildHarness: true }
  );
});
const csPrimary = csSynced.filter(
  (f) => f.findingOrigin !== "ARCHITECTURAL_CANDIDATE_HYPOTHESIS" && !f.id.startsWith("RE-ENUM-")
);
const csSynthetic = csSynced.filter(
  (f) => f.findingOrigin === "ARCHITECTURAL_CANDIDATE_HYPOTHESIS" || f.id.startsWith("RE-ENUM-")
);
const csWs = computeAuditableRiskWorksheet(csSynced);
const csAuditBundle = buildCorrectiveAuditBundleV552(
  csSynced,
  "XTRIKE-RPT-B104D2-2026",
  "OWASP/BenchmarkDotNet",
  csCommit
);
const csPrimaryPortfolio = summarizePatchVerificationPortfolio(
  csPrimary.map((f) => f.evidenceRecord?.patchVerification)
);

// 1. P0 Risk Reconciliation: Single authoritative risk score (42/100) across Worksheet and Corrective Audit (no 42 vs 54 contradiction)
// AND unified post-harness projected residual risk (13/100) across Page 3 (v55ModernizedRisk) and Pages 4-5 (CanonicalRiskObjectV60) (no 11 vs 13 contradiction)
const csV55Risk = computeModernizedRiskEngineV55(csSynced);
const csV60Risk = computeCanonicalRiskObjectV60(csSynced);
if (
  csWs.compositeRiskScore !== 42 ||
  csAuditBundle.separatedRisk.authoritativeConfirmedProductionRiskScore !== csWs.compositeRiskScore ||
  csV55Risk.portfolioScores.postPatchProjectedResidualRiskIndex !== 13 ||
  csV60Risk.residualRiskAfterVerifiedRemediation.score !== 13 ||
  csV55Risk.portfolioScores.postPatchProjectedResidualRiskIndex !== csV60Risk.residualRiskAfterVerifiedRemediation.score
) {
  console.error("FAIL [B104D2-P0-RISK]: Risk score or residual risk contradiction on OWASP BenchmarkDotNet:", {
    worksheetScore: csWs.compositeRiskScore,
    auditBundleScore: csAuditBundle.separatedRisk.authoritativeConfirmedProductionRiskScore,
    v55ResidualRisk: csV55Risk.portfolioScores.postPatchProjectedResidualRiskIndex,
    v60ResidualRisk: csV60Risk.residualRiskAfterVerifiedRemediation.score,
  });
  process.exit(1);
}

// 2. P0 SAST-001 (CWE-798) Patch Lifecycle vs Remediation Certification & 7-Stage Proof Lifecycle:
// SAST-001 is NEEDS_MANUAL_VALIDATION -> must report PATCH_COMPILED_UNVERIFIED_REMEDIATION (never UNCOMPILED),
// cap at PATCH_COMPILED, and mark 7-stage REMEDIATION_VERIFIED as BLOCKED (never PASSED when runtime is NOT_RUN)
const csSast001 = csPrimary.find((f) => f.id === "SAST-001" && f.cwe === "CWE-798");
const csSast001Lifecycle = csSast001 ? computeProofLifecycle(csSast001) : undefined;
const csSast001RemMilestone = csSast001Lifecycle?.stages.find((s) => s.stage === "REMEDIATION_VERIFIED");
if (
  !csSast001 ||
  csSast001.proofState !== "NEEDS_MANUAL_VALIDATION" ||
  csSast001.evidenceRecord?.patchVerification.currentLifecycleStage !== "PATCH_COMPILED" ||
  csSast001.evidenceRecord?.patchVerification.status !== "PATCH_COMPILED_UNVERIFIED_REMEDIATION" ||
  csSast001.evidenceRecord?.canonicalRegistry.patch_state !== "COMPILED_UNVERIFIED" ||
  csSast001.evidenceRecord?.canonicalRegistry.remediation_state !== "STATIC_READY_UNVERIFIED" ||
  csSast001RemMilestone?.verdict !== "BLOCKED" ||
  csPrimaryPortfolio.compiledSuccessfullyCount !== 4 ||
  csPrimaryPortfolio.remediationVerifiedCount !== 3
) {
  console.error("FAIL [B104D2-P0-LIFECYCLE]: SAST-001 (NEEDS_MANUAL_VALIDATION) patch label or 7-stage REMEDIATION_VERIFIED mismatch:", {
    sast001Stage: csSast001?.evidenceRecord?.patchVerification.currentLifecycleStage,
    sast001Status: csSast001?.evidenceRecord?.patchVerification.status,
    sast001PatchState: csSast001?.evidenceRecord?.canonicalRegistry.patch_state,
    sast001RemMilestone: csSast001RemMilestone,
    csPrimaryPortfolio,
  });
  process.exit(1);
}

// 3. P0 Zero Cross-Report Contamination in C# Corrective Audit Bundle (no Multer, npm SemVer, process.exit, or WebGoat Java text)
const csAuditText = JSON.stringify({
  adjudicatedFindings: csAuditBundle.adjudicatedFindings,
  separatedRisk: csAuditBundle.separatedRisk,
  fourLayerVerification: csAuditBundle.fourLayerVerification,
  correctivePhases: csAuditBundle.correctivePhases,
});
if (/Multer|npm SemVer|process\.exit|SqlInjectionLesson8|BlindScript|PathTraversalIntegrationTest/i.test(csAuditText)) {
  console.error("FAIL [B104D2-P0-ISOLATION]: Cross-report JS/Java text found in C# BenchmarkDotNet audit bundle:", csAuditText);
  process.exit(1);
}

// 4. P0 Synthetic Hypotheses (RE-ENUM-001..010) Wording: zero "Observed Static Evidence", "Static AST confirmed",
// "Static AST analyzer confirmed", "AST sink matched", "Literal string constant present in AST", or manualValidationDiagnostic
for (const sf of csSynthetic) {
  const sfTyped = resolveTypedProofClassification(sf);
  const sfFullText = JSON.stringify({
    deepExploitability: sf.deepExploitability,
    evidenceRecord: sf.evidenceRecord,
    typedProof: sfTyped,
  });
  if (
    sf.evidenceRecord?.manualValidationDiagnostic ||
    /Observed Static Evidence|Static AST confirmed|Static AST analyzer confirmed|AST sink matched|Lexical & AST sink detection matched|Literal string constant present in AST|identified statically in AST/i.test(
      sfFullText
    )
  ) {
    console.error("FAIL [B104D2-P0-SYNTHETIC]: Synthetic finding claimed observed AST sink:", sf.id, sfFullText);
    process.exit(1);
  }
}

// 5. P0 Report Integrity & Attack-Path Call-Graph Accuracy:
const csIntegrityIssues = validateReportIntegrity(csSynced);
const csLedgerContradictions = findEvidenceLedgerContradictions(csSynced);
const csPaths = reconstructAttackPathsV60(csSynced);
if (
  csIntegrityIssues.length > 0 ||
  csLedgerContradictions.length > 0 ||
  !csPaths[0]?.chainPattern.includes("Intra-Procedural") ||
  csPaths[0]?.predicates.multiVulnerabilityChainable !== false ||
  csPaths[1]?.predicates.pathReachable !== "CANDIDATE_UNVERIFIED"
) {
  console.error("FAIL [B104D2-P0-INTEGRITY]: Integrity issues or attack path mismatch:", {
    csIntegrityIssues,
    csLedgerContradictions,
    csPaths,
  });
  process.exit(1);
}

console.log("OWASP BenchmarkDotNet (XTRIKE-RPT-B104D2-2026) Audit Verification:", {
  authoritativeRiskScore: `${csWs.compositeRiskScore}/100 (Unified across Page 4 & Page 6)`,
  residualRiskAfterHarness: `${csV55Risk.portfolioScores.postPatchProjectedResidualRiskIndex}/100 (Unified across Page 3 & Pages 4-5)`,
  sast001Lifecycle: `${csSast001.proofState} -> ${csSast001.evidenceRecord?.patchVerification.status} (${csSast001.evidenceRecord?.patchVerification.currentLifecycleStage}, 7-stage REMEDIATION_VERIFIED=${csSast001RemMilestone?.verdict})`,
  primaryPortfolio: `${csPrimaryPortfolio.compiledSuccessfullyCount}/4 Compiled · ${csPrimaryPortfolio.remediationVerifiedCount}/4 Remediation Verified`,
  crossReportContamination: false,
  syntheticHypothesesClean: `${csSynthetic.length}/10 labeled Illustrative Architectural Hypothesis (0 AST sink claims)`,
  integrityIssues: csIntegrityIssues.length,
  attackPathsAligned: true,
});

console.log("ALL XTRIKE v5.5.0, v5.5.2 (60/60 REGRESSION TESTS), v5.5.3 (OWASP JUICE SHOP & OWASP BENCHMARKDOTNET B104D2 P0 AUDIT FIXES) & v6.0 GOVERNANCE CHECKS PASSED");
