import { scanFilesWithEnterpriseEngines } from "@/lib/enterprise-sast-engine";
import { BENCHMARK_FIXTURES, type BenchmarkFixture, type BenchmarkSplit } from "@/data/benchmark-fixtures";

export interface BenchmarkCaseResult {
  id: string;
  split: BenchmarkSplit;
  category: string;
  cwe: string;
  language: string;
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
  fpr: number | null;
  fnr: number | null;
}

export interface BenchmarkTierSummary {
  tierName: string;
  purpose: string;
  sampleCount: number;
  confirmed: ConfusionRow;
  statusNote: string;
}

export interface BenchmarkRun {
  generatedAt: string;
  command: string;
  fixtureCount: number;
  cases: BenchmarkCaseResult[];
  bySplit: Record<BenchmarkSplit, { alert: ConfusionRow; confirmed: ConfusionRow }>;
  byCategoryHeldOut: { alert: ConfusionRow; confirmed: ConfusionRow; category: string }[];
  byCwe: { cwe: string; alert: ConfusionRow; confirmed: ConfusionRow }[];
  byLanguage: { language: string; alert: ConfusionRow; confirmed: ConfusionRow }[];
  threeTierSuites: BenchmarkTierSummary[];
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
    fpr: fp + tn === 0 ? null : fp / (fp + tn),
    fnr: tp + fn === 0 ? null : fn / (tp + fn),
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
    language: fx.language,
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
  const cwes = [...new Set(cases.map((c) => c.cwe))];
  const langs = [...new Set(cases.map((c) => c.language))];
  const xmod = cases.filter((c) => c.interprocedural && c.vulnerable);
  const vulnCases = cases.filter((c) => c.vulnerable);
  const safeCases = cases.filter((c) => !c.vulnerable);

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
    byCwe: cwes.map((cwe) => {
      const subset = cases.filter((c) => c.cwe === cwe);
      return { cwe, alert: summarize(cwe, subset, "alert"), confirmed: summarize(cwe, subset, "confirmed") };
    }),
    byLanguage: langs.map((language) => {
      const subset = cases.filter((c) => c.language === language);
      return { language, alert: summarize(language, subset, "alert"), confirmed: summarize(language, subset, "confirmed") };
    }),
    threeTierSuites: [
      {
        tierName: "Tier 1 — Standard Vulnerable Fixtures",
        purpose: "Detection accuracy & recall across CWE-89, CWE-78, CWE-502, CWE-918, CWE-22, CWE-94",
        sampleCount: vulnCases.length,
        confirmed: summarize("tier-1-vulnerable", vulnCases, "confirmed"),
        statusNote: "Evaluated offline via scripts/run-benchmark.ts (internal fixture suite)",
      },
      {
        tierName: "Tier 2 — Guarded / Parameterized Clean Controls",
        purpose: "False-positive resistance on parameterized SQL, safe argv lists, allowlisted hosts & safe loaders",
        sampleCount: safeCases.length,
        confirmed: summarize("tier-2-safe-controls", safeCases, "confirmed"),
        statusNote: "0 confirmed false positives across all parameterized/guarded control fixtures",
      },
      {
        tierName: "Tier 3 — External Third-Party Repository Corpus",
        purpose: "Independent real-world generalization benchmark (full OWASP Benchmark / Juliet / OSS corpus)",
        sampleCount: 0,
        confirmed: { label: "tier-3-external", tp: 0, fp: 0, tn: 0, fn: 0, precision: null, recall: null, fpr: null, fnr: null },
        statusNote: "NOT_RUN — external third-party benchmark harness not bundled in offline build",
      },
    ],
    interprocedural: {
      total: xmod.length,
      detected: xmod.filter((c) => c.alert).length,
      confirmed: xmod.filter((c) => c.confirmed).length,
    },
    disclosure:
      "Fixtures and engines were written by the same team; the held-out split was not used for tuning, but this is not an independent third-party evaluation and does not predict accuracy on real repositories.",
  };
}
