import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { FIFTEEN_DIVISIONS, runNoctisEvalSuite } from "../src/lib/noctis-eval-suite.ts";

const suiteArg = (process.argv[2] || "all").toLowerCase() as
  | "all"
  | "cyber"
  | "risk"
  | "engineering"
  | "research";

const report = runNoctisEvalSuite(suiteArg);

console.log("================================================================================");
console.log(`  NOCTIS 400-QUESTION EVALUATION & CALIBRATION RUNNER (${report.runId})`);
console.log("================================================================================");
console.log(`Timestamp          : ${report.timestamp}`);
console.log(`Total Questions    : ${report.totalQuestions}`);
console.log(`Total Passed       : ${report.totalPassed} / ${report.totalQuestions} (${report.overallPassRatePct}%)`);
console.log(`Adversarial Slice  : ${report.adversarialPassed} / ${report.adversarialTotal} (${report.adversarialPassRatePct}%)`);
console.log(`Composite Score    : ${report.overallScore} / 100`);
console.log("--------------------------------------------------------------------------------");
console.log("SUITE BREAKDOWN (4 x 100 QUESTIONS):");
for (const s of report.suites) {
  console.log(
    `  - [${s.suite.toUpperCase().padEnd(11)}] ${String(s.passedQuestions).padStart(3)}/${String(
      s.totalQuestions
    ).padEnd(3)} (${s.passRatePct}%) | Adversarial: ${s.adversarialCount} (${s.adversarialPassPct}%) | Score: ${s.averageScore}/100`
  );
}
console.log("--------------------------------------------------------------------------------");
console.log("8-DIMENSION EPISTEMIC & TECHNICAL CALIBRATION:");
console.log(`  1. Factual Correctness           : ${report.dimensions.factualCorrectness}%`);
console.log(`  2. Completeness & Relevance      : ${report.dimensions.completenessRelevance}%`);
console.log(`  3. Evidence & Citation Accuracy  : ${report.dimensions.evidenceCitationAccuracy}%`);
console.log(`  4. Math & Technical Correctness  : ${report.dimensions.mathTechnicalCorrectness}%`);
console.log(`  5. Appropriate Uncertainty (20%) : ${report.dimensions.appropriateUncertainty}%`);
console.log(`  6. Safe & Authorized Tool Use    : ${report.dimensions.safeAuthorizedToolUse}%`);
console.log(`  7. Missing-Input Identification  : ${report.dimensions.missingInfoIdentification}%`);
console.log(`  8. Rephrase Consistency          : ${report.dimensions.rephraseConsistency}%`);
console.log("--------------------------------------------------------------------------------");
console.log("15 KNOWLEDGE DIVISIONS COVERAGE:");
for (const d of FIFTEEN_DIVISIONS) {
  const stat = report.divisions.find((x) => x.division === d.id);
  console.log(
    `  ${d.number}. ${d.name.padEnd(42)} | ${String(stat?.count || 0).padStart(3)} Qs | Pass: ${
      stat?.passRatePct ?? 100
    }%`
  );
}
console.log("================================================================================");

const outDir = path.join(process.cwd(), "data");
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "noctis-eval-report.json");
writeFileSync(
  outFile,
  JSON.stringify(
    {
      runId: report.runId,
      timestamp: report.timestamp,
      totalQuestions: report.totalQuestions,
      totalPassed: report.totalPassed,
      overallPassRatePct: report.overallPassRatePct,
      overallScore: report.overallScore,
      adversarialTotal: report.adversarialTotal,
      adversarialPassed: report.adversarialPassed,
      adversarialPassRatePct: report.adversarialPassRatePct,
      dimensions: report.dimensions,
      suites: report.suites,
      divisions: report.divisions,
      sampleResults: report.sampleResults,
    },
    null,
    2
  ),
  "utf8"
);
console.log(`Saved JSON benchmark artifact -> ${outFile}`);

if (report.overallPassRatePct < 95) {
  process.exitCode = 1;
}
