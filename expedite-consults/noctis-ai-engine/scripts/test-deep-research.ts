import { noctisDeepResearch, runDeepResearchBenchmarkSuite, buildDeepResearchReport } from "../src/lib/noctis-deep-research.ts";
import { runFrontierPillarsTestSuite, buildFrontierUnifiedArchitectureReport } from "../src/lib/noctis-frontier-pillars.ts";
import { runRicDisputedClaimBenchmark, buildRicIntelligenceReport } from "../src/lib/noctis-ric.ts";
import {
  runHealthIntelligenceTestSuite,
  runBlueprintAcceptanceSuiteH001ToH012,
  runNhArch001VerificationSuite,
  buildHealthIntelligenceReport,
  buildNhArch001ArchitectureReport,
  handleNaturalHealthQuery,
} from "../src/lib/noctis-health-engine.ts";
import {
  runProfessionalIntelligenceTestSuite,
  buildProfessionalIntelligenceReport,
  handleNaturalProfessionalQuery,
} from "../src/lib/noctis-professional-engine.ts";
import {
  runVerifiedExecutionAndAdversarialSuite,
  buildVerifiedExecutionReport,
  handleNaturalVerifiedExecutionQuery,
} from "../src/lib/noctis-verified-execution.ts";
import {
  runNoctisPred001AcceptanceSuite,
  buildPredictiveIntelligenceReport,
  handleNaturalPredictiveIntelligenceQuery,
} from "../src/lib/noctis-predictive-intelligence.ts";

const researchSuite = runDeepResearchBenchmarkSuite();
const frontierSuite = runFrontierPillarsTestSuite();
const ricBenchmark = runRicDisputedClaimBenchmark();
const healthSuite = runHealthIntelligenceTestSuite();
const blueprintSuite = runBlueprintAcceptanceSuiteH001ToH012();
const nhArch001Suite = runNhArch001VerificationSuite();
const professionalSuite = runProfessionalIntelligenceTestSuite();
const verifiedExecSuite = runVerifiedExecutionAndAdversarialSuite();
const pred001Suite = runNoctisPred001AcceptanceSuite();

console.log("================================================================================");
console.log("NOCTIS DEEP RESEARCH — 10-DIMENSION RELEASE GATE BENCHMARK");
console.log("================================================================================");
console.log(`Passed: ${researchSuite.passedCount}/${researchSuite.totalCount} | Release Gate Ready: ${researchSuite.releaseGatesPassed}`);
console.log("--------------------------------------------------------------------------------");
for (const d of researchSuite.dimensions) {
  console.log(`${d.passed ? "PASS ✓" : "FAIL ✗"} | ${d.id.padEnd(10)} | ${d.area.padEnd(42)} | ${d.measuredValue}`);
}

const job = noctisDeepResearch.getJob("res-job-national-grid-01")!;
console.log("--------------------------------------------------------------------------------");
console.log(`End-to-End Audit Job: ${job.id} (${job.status.toUpperCase()})`);
console.log(`Stopping Reason     : ${job.stoppingReason}`);
console.log(`Sources / Evidence  : ${job.sources.length} Sources, ${job.evidence.length} SHA-256 Evidence Items, ${job.claims.length} Claims`);
console.log(`Findings Surfaced   : ${job.findings.length} Findings (${job.findings.map((f) => `${f.id}:${f.severity}`).join(", ")})`);
console.log(`Deliverable Versions: ${job.deliverables.map((d) => d.version).join(" -> ")}`);

console.log("\n================================================================================");
console.log("NOCTIS RESEARCH INTELLIGENCE CONTROLLER (RIC) — 12 ADVANCED CAPABILITIES");
console.log("================================================================================");
for (const c of ricBenchmark.capabilities12Status) {
  console.log(
    `${c.passed ? "PASS ✓" : "FAIL ✗"} | #${String(c.number).padStart(2, "0")} [${c.priority}] | ${c.capability.padEnd(62)} | ${c.verifiedArtifact}`
  );
}

console.log("\n================================================================================");
console.log("SECTION 15 BENCHMARK: DISPUTED ENGINEERING CLAIM (BASELINE vs. RIC + LEDGER)");
console.log("================================================================================");
console.log(`Passed: ${ricBenchmark.passedCount}/${ricBenchmark.totalCount} | All 12 Capabilities Verified: ${ricBenchmark.allCapabilitiesVerified}`);
console.log("--------------------------------------------------------------------------------");
for (const m of ricBenchmark.metrics) {
  console.log(`${m.passed ? "PASS ✓" : "FAIL ✗"} | ${m.id.padEnd(12)} | ${m.dimension.padEnd(60)} | ${m.ricEnhancedResult}`);
}

console.log("\n================================================================================");
console.log("NOCTIS HEALTH INTELLIGENCE ENGINE — 10-AREA CLINICAL & SAFETY EVALUATION SUITE");
console.log("================================================================================");
console.log(
  `Passed: ${healthSuite.passedCount}/${healthSuite.totalCount} | Release Gate Ready: ${healthSuite.releaseGatesPassed} | Serious Safety Failures: ${healthSuite.zeroSeriousSafetyFailures ? "0 (VERIFIED)" : "DETECTED"}`
);
console.log("--------------------------------------------------------------------------------");
for (const a of healthSuite.evaluationAreas) {
  console.log(`${a.passed ? "PASS ✓" : "FAIL ✗"} | ${a.id.padEnd(14)} | ${a.area.padEnd(42)} | ${a.measuredResult}`);
}

console.log("\n================================================================================");
console.log("NOCTIS HEALTH v1.0 BLUEPRINT — H-001 TO H-012 ACCEPTANCE TESTS & 9 RELEASE GATES");
console.log("================================================================================");
console.log(
  `Acceptance Passed: ${blueprintSuite.passedCount}/${blueprintSuite.totalCount} | All 9 Release Gates Passed: ${blueprintSuite.allPassed}`
);
console.log("--------------------------------------------------------------------------------");
for (const t of blueprintSuite.acceptanceTests) {
  console.log(`${t.passed ? "PASS ✓" : "FAIL ✗"} | ${t.id.padEnd(8)} | ${t.test.padEnd(44)} | ${t.measuredResult}`);
}

console.log("\n================================================================================");
console.log("NH-ARCH-001: COMPONENT ARCHITECTURE & DEPLOYMENT DESIGN VERIFICATION SUITE");
console.log("================================================================================");
console.log(
  `Passed: ${nhArch001Suite.passedCount}/${nhArch001Suite.totalCount} | All NH-ARCH-001 Checks Passed: ${nhArch001Suite.allPassed}`
);
console.log("--------------------------------------------------------------------------------");
for (const c of nhArch001Suite.checks) {
  console.log(`${c.passed ? "PASS ✓" : "FAIL ✗"} | ${c.id.padEnd(14)} | ${c.category.padEnd(12)} | ${c.measuredResult}`);
}

console.log("\n================================================================================");
console.log("NOCTIS PROFESSIONAL INTELLIGENCE ENGINE — 10 ACCEPTANCE CRITERIA & 42 CATEGORIES");
console.log("================================================================================");
console.log(
  `Passed: ${professionalSuite.passedCount}/${professionalSuite.totalCount} | Categories: ${professionalSuite.totalProfessionCategories} | Specialist Engines: ${professionalSuite.totalSpecialistEngines} | Advanced Execution Engines: ${professionalSuite.totalAdvancedExecutionEngines}`
);
console.log("--------------------------------------------------------------------------------");
for (const c of professionalSuite.criteria) {
  console.log(`${c.passed ? "PASS ✓" : "FAIL ✗"} | ${c.id.padEnd(11)} | ${c.criterion.slice(0, 52).padEnd(52)} | ${c.measuredResult}`);
}

console.log("\n================================================================================");
console.log("NOCTIS VERIFIED EXECUTION LAYER — NEXT-10 CAPABILITIES, TIER-2 ADVERSARIAL & 20 SYSTEMS");
console.log("================================================================================");
console.log(
  `Next-10 Capabilities: ${verifiedExecSuite.next10PassedCount}/${verifiedExecSuite.next10TotalCount} | Tier-2 Adversarial: ${verifiedExecSuite.tier2PassedCount}/${verifiedExecSuite.tier2TotalCount} | 10 Advanced Systems: ${verifiedExecSuite.advanced10PassedCount}/${verifiedExecSuite.advanced10TotalCount} | 3 Audit Fixes: ${verifiedExecSuite.threeAuditFixesVerified}`
);
console.log("--------------------------------------------------------------------------------");
for (const c of verifiedExecSuite.next10Capabilities) {
  console.log(`${c.passed ? "PASS ✓" : "FAIL ✗"} | NEXT10-${String(c.capabilityNumber).padStart(2, "0")}   | ${c.name.padEnd(48)} | ${c.measuredOutcome}`);
}
for (const t of verifiedExecSuite.tier2AdversarialTests) {
  console.log(`${t.passed ? "PASS ✓" : "FAIL ✗"} | ${t.id.padEnd(11)} | ${t.testGroup.padEnd(48)} | ${t.measuredOutcome}`);
}
for (const s of verifiedExecSuite.advanced10Systems) {
  console.log(`${s.passed ? "PASS ✓" : "FAIL ✗"} | SYS-${String(s.systemNumber).padStart(2, "0")}      | ${s.name.padEnd(48)} | ${s.measuredAcceptanceResult}`);
}

console.log("\n================================================================================");
console.log("NOCTIS-PRED-001: UNIFIED PREDICTIVE INTELLIGENCE PLATFORM (15 ENGINES & 12 TESTS)");
console.log("================================================================================");
console.log(
  `Passed: ${pred001Suite.passedTests}/${pred001Suite.totalTests} | Engines: ${pred001Suite.enginesCatalogCount} | Shared Platform Components: ${pred001Suite.sharedPlatformComponentsCount} | PRED-1042 Contract: ${pred001Suite.standardContractSamplePred1042.prediction_id} (${pred001Suite.standardContractSamplePred1042.calibration_status})`
);
console.log("--------------------------------------------------------------------------------");
for (const r of pred001Suite.results) {
  console.log(`${r.passed ? "PASS ✓" : "FAIL ✗"} | ${r.testId.padEnd(11)} | ${r.criterion.slice(0, 52).padEnd(52)} | ${r.evidenceSummary}`);
}

console.log("\n================================================================================");
console.log("NOCTIS 5-PILLAR FRONTIER ARCHITECTURE — ACCEPTANCE TEST SUITE");
console.log("================================================================================");
console.log(`Passed: ${frontierSuite.passedCount}/${frontierSuite.totalCount}`);
console.log("--------------------------------------------------------------------------------");
for (const t of frontierSuite.tests) {
  console.log(`${t.passed ? "PASS ✓" : "FAIL ✗"} | ${t.id.padEnd(11)} | ${t.pillar.padEnd(32)} | ${t.measuredMetric}`);
}
console.log("================================================================================");

const drReport = buildDeepResearchReport("Independent audit of a proposed national resilience strategy");
const fpReport = buildFrontierUnifiedArchitectureReport();
const ricReport = buildRicIntelligenceReport("Research Intelligence Controller and 12 advanced capabilities");
const healthReport = buildHealthIntelligenceReport("Noctis Health Intelligence Engine");
const nhArchReport = buildNhArch001ArchitectureReport();
const profReport = buildProfessionalIntelligenceReport("Noctis Professional Intelligence Engine");
const execReport = buildVerifiedExecutionReport();
const predReport = buildPredictiveIntelligenceReport();
const emergencyRoute = handleNaturalHealthQuery("I have crushing chest pain and shortness of breath", "");
const followUpRoute = handleNaturalHealthQuery("What does that mean for my next test?", healthReport);
const nhArchRoute = handleNaturalHealthQuery("Check NH-ARCH-001 Component Architecture & Deployment Design", "");
const dieselRoute = handleNaturalProfessionalQuery("My diesel vehicle cranks but will not start.");
const boqRoute = handleNaturalProfessionalQuery("Generate a construction BOQ and cost estimate for the 18m x 12m slab and perimeter walls.");
const calcRoute = handleNaturalProfessionalQuery("Calculate mechanical shaft torque and shear stress, structural beam bending moment, and 3-phase voltage drop.");
const execRoute = handleNaturalVerifiedExecutionQuery("Show the Independent Verification Engine, Tier-2 adversarial tests, 10 advanced intelligence systems, and Noctis Capability Registry.");
const predRoute = handleNaturalPredictiveIntelligenceQuery("Show the Noctis Unified Predictive Intelligence Platform NOCTIS-PRED-001, the 15 prediction engines, PRED-1042, and Prediction-to-Action.");

if (
  !drReport.includes("FEASIBILITY NOT DEMONSTRATED") ||
  !fpReport.includes("Noctis Intelligence Orchestrator") ||
  !ricReport.includes("Research Intelligence Controller (RIC)") ||
  !healthReport.includes("Noctis Health") ||
  !nhArchReport.includes("NH-ARCH-001") ||
  !profReport.includes("Autonomous Professional Work Engine") ||
  !execReport.includes("TASK-1042") ||
  !predReport.includes("NOCTIS-PRED-001") ||
  !nhArchRoute?.includes("health-api-gateway") ||
  !dieselRoute?.includes("300 TO 2,500+ BAR") ||
  !boqRoute?.includes("HALTED_MISSING_DESIGN_INPUT") ||
  !calcRoute?.includes("286.48") ||
  !execRoute?.includes("CAP-VER-01") ||
  !predRoute?.includes("PRED-1042") ||
  !emergencyRoute?.includes("911") ||
  !followUpRoute?.includes("What does that mean for my next test?")
) {
  console.error("Report or natural-language health/professional/execution/predictive routing verification failed.");
  process.exit(1);
}

if (
  !researchSuite.releaseGatesPassed ||
  frontierSuite.passedCount !== frontierSuite.totalCount ||
  !ricBenchmark.allCapabilitiesVerified ||
  !healthSuite.releaseGatesPassed ||
  !blueprintSuite.allPassed ||
  !nhArch001Suite.allPassed ||
  !professionalSuite.allPassed ||
  !verifiedExecSuite.allPassed ||
  !pred001Suite.allPassed
) {
  process.exit(1);
}
