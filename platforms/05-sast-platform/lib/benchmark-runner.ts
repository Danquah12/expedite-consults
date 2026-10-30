import { scanFilesWithEnterpriseEngines } from "@/lib/enterprise-sast-engine";
import { BENCHMARK_FIXTURES, type BenchmarkFixture, type BenchmarkSplit } from "@/data/benchmark-fixtures";

export interface BenchmarkCaseResult {
  id: string;
  split: BenchmarkSplit;
  category: string;
  cwe: string;
  vulnerable: boolean;
  interprocedural: boolean;
  /** states of every finding with the CWE under test (empty = nothing reported) */
  reportedStates: string[];
  alert: boolean; // any finding for the CWE under test
  confirmed: boolean; // finding in a state other than NEEDS_MANUAL_VALIDATION / MITIGATED / INCONCLUSIVE
  outcomeAlert: "TP" | "FP" | "TN" | "FN";
  outcomeConfirmed: "TP" | "FP" | "TN" | "FN";
}

export interface ConfusionRow {
  label: string;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  precision: number | null;
  recall: number | null;
}

export interface BenchmarkRun {
  generatedAt: string;
  command: string;
  fixtureCount: number;
  cases: BenchmarkCaseResult[];
  bySplit: Record<BenchmarkSplit, { alert: ConfusionRow; confirmed: ConfusionRow }>;
  byCategoryHeldOut: { alert: ConfusionRow; confirmed: ConfusionRow; category: string }[];
  interprocedural: { total: number; detected: number; confirmed: number };
  disclosure: string;
}

const UNCONFIRMED = new Set(["NEEDS_MANUAL_VALIDATION", "MITIGATED_BY_GUARD", "INCONCLUSIVE"]);

function outcome(vulnerable: boolean, positive: boolean): "TP" | "FP" | "TN" | "FN" {
  if (vulnerable) return positive ? "TP" : "FN";
  return positive ? "FP" : "TN";
}

export function summarize(label: string, cases: BenchmarkCaseResult[], kind: "alert" | "confirmed"): ConfusionRow {
  const o = (c: BenchmarkCaseResult) => (kind === "alert" ? c.outcomeAlert : c.outcomeConfirmed);
  const tp = cases.filter((c) => o(c) === "TP").length;
  const fp = cases.filter((c) => o(c) === "FP").length;
  const tn = cases.filter((c) => o(c) === "TN").length;
  const fn = cases.filter((c) => o(c) === "FN").length;
  return {
    label,
    tp,
    fp,
    tn,
    fn,
    precision: tp + fp === 0 ? null : tp / (tp + fp),
    recall: tp + fn === 0 ? null : tp / (tp + fn),
  };
}

export function runFixture(fx: BenchmarkFixture): BenchmarkCaseResult {
  const scan = scanFilesWithEnterpriseEngines({
    files: fx.files.map((f) => ({ path: f.path, content: f.content })),
    repoUrl: `https://example.invalid/${fx.id.toLowerCase()}`,
    branch: "main",
    commitSha: "0000000000000000000000000000000000000000",
    primaryLanguage: fx.language,
    selectedEngines: [],
  });
  const relevant = scan.findings.filter((f) => f.cwe === fx.cwe);
  const reportedStates = relevant.map((f) => f.proofState || "UNKNOWN");
  const alert = relevant.length > 0;
  const confirmed = relevant.some((f) => !UNCONFIRMED.has(f.proofState || ""));
  return {
    id: fx.id,
    split: fx.split,
    category: fx.category,
    cwe: fx.cwe,
    vulnerable: fx.vulnerable,
    interprocedural: Boolean(fx.interprocedural),
    reportedStates,
    alert,
    confirmed,
    outcomeAlert: outcome(fx.vulnerable, alert),
    outcomeConfirmed: outcome(fx.vulnerable, confirmed),
  };
}

export function runBenchmark(fixtures: BenchmarkFixture[] = BENCHMARK_FIXTURES): BenchmarkRun {
  const cases = fixtures.map(runFixture);
  const dev = cases.filter((c) => c.split === "development");
  const held = cases.filter((c) => c.split === "held_out");
  const cats = [...new Set(held.map((c) => c.category))];
  const xmod = cases.filter((c) => c.interprocedural && c.vulnerable);
  return {
    generatedAt: new Date().toISOString(),
    command: "npx tsx scripts/run-benchmark.ts",
    fixtureCount: cases.length,
    cases,
    bySplit: {
      development: { alert: summarize("development", dev, "alert"), confirmed: summarize("development", dev, "confirmed") },
      held_out: { alert: summarize("held_out", held, "alert"), confirmed: summarize("held_out", held, "confirmed") },
    },
    byCategoryHeldOut: cats.map((category) => {
      const subset = held.filter((c) => c.category === category);
      return { category, alert: summarize(category, subset, "alert"), confirmed: summarize(category, subset, "confirmed") };
    }),
    interprocedural: {
      total: xmod.length,
      detected: xmod.filter((c) => c.alert).length,
      confirmed: xmod.filter((c) => c.confirmed).length,
    },
    disclosure:
      "Fixtures and engines were written by the same team; the held-out split was not used for tuning, but this is not an independent third-party evaluation and does not predict accuracy on real repositories.",
  };
}
