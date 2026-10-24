import { runZeroTrustPolicyTestSuite } from "../src/lib/noctis-pde.ts";

const suite = runZeroTrustPolicyTestSuite();
console.log("==================================================================");
console.log(" NOCTIS ZERO TRUST POLICY DECISION ENGINE (PDE) — 10-TEST MATRIX");
console.log("==================================================================");
for (const r of suite.results) {
  console.log(
    `[${r.passed ? "PASS" : "FAIL"}] ${r.id} | ${r.category.padEnd(32)} | ${r.actualDecision} | ${r.latencyMs.toFixed(2)}ms`
  );
}
console.log("------------------------------------------------------------------");
console.log(
  `Summary: ${suite.passedCount}/${suite.totalCount} tests passed | In-Process PDP Rule Eval p95: ${suite.p95LatencyMs.toFixed(
    2
  )}ms (In-process policy check SLO < 50ms; excludes network I/O, retrieval & tool execution)`
);
if (suite.passedCount !== suite.totalCount) {
  process.exit(1);
}
