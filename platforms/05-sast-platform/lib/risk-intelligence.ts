import type { SASTFinding } from "@/types/sast";

/**
 * Risk Intelligence Model v2. Every number is derived from named factors and is reproducible from the
 * emitted breakdown. Correlated findings (same root-cause group) are combined with a bounded formula so
 * duplicate detections cannot inflate the portfolio score.
 *
 * Inputs that are NOT available offline are reported as such rather than guessed:
 *  - EPSS comes from the finding record (engine-supplied), not a live FIRST.org feed.
 *  - CISA KEV membership is matched only against CVE IDs passed in `kevCveIds` (no feed is bundled).
 */

export interface RiskOptions {
  /** 1 (low) .. 5 (crown jewel). 3 is neutral. */
  assetCriticality?: number;
  kevCveIds?: string[];
  /** CVE ids attached to findings (for KEV matching), keyed by finding id. */
  cveByFinding?: Record<string, string[]>;
}

export interface RiskFactorRow {
  id: string;
  groupId: string;
  origin: "PRIMARY" | "ARCHITECTURAL";
  cvss: number;
  epss: number;
  kev: boolean;
  evidenceFactor: number;
  reachabilityFactor: number;
  authFactor: number;
  criticalityFactor: number;
  likelihoodBoost: number;
  score: number;
  formula: string;
}

export interface RiskGroupRow {
  groupId: string;
  members: string[];
  maxScore: number;
  combinedScore: number;
  rule: string;
}

export interface RiskIntelligenceResult {
  assetCriticality: number;
  kevFeed: "NOT_LOADED" | "SUPPLIED";
  kevMatches: string[];
  rows: RiskFactorRow[];
  groups: RiskGroupRow[];
  primaryScore: number;
  combinedScore: number;
  dedupAdjustment: number; // points removed vs naive max-sum-less correlation
  formula: string;
  reproducible: boolean;
}

const EVIDENCE: Record<string, number> = {
  RUNTIME_REPRODUCED: 1.0,
  IMPACT_CONFIRMED: 1.0,
  DATAFLOW_CONFIRMED: 0.85,
  PATH_FEASIBLE: 0.6,
  GUARD_ANALYZED: 0.6,
  DETECTED_STATIC: 0.5,
  NEEDS_MANUAL_VALIDATION: 0.35,
  INCONCLUSIVE: 0.3,
  MITIGATED_BY_GUARD: 0,
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function computeRiskIntelligence(findings: SASTFinding[], opts: RiskOptions = {}): RiskIntelligenceResult {
  const crit = Math.min(5, Math.max(1, Math.round(opts.assetCriticality ?? 3)));
  const criticalityFactor = r2(0.7 + 0.1 * crit); // 3 -> 1.00, 5 -> 1.20, 1 -> 0.80
  const kevSet = new Set((opts.kevCveIds || []).map((c) => c.toUpperCase()));
  const kevMatches: string[] = [];

  const rows: RiskFactorRow[] = findings.map((f) => {
    const origin = f.findingOrigin === "ARCHITECTURAL_CANDIDATE_HYPOTHESIS" ? "ARCHITECTURAL" : "PRIMARY";
    const cves = (opts.cveByFinding?.[f.id] || []).map((c) => c.toUpperCase());
    const kev = cves.some((c) => kevSet.has(c));
    if (kev) kevMatches.push(f.id);
    const epss = Math.min(1, Math.max(0, f.epss ?? 0));
    const evidenceFactor = EVIDENCE[f.proofState || "DETECTED_STATIC"] ?? 0.5;
    const reachabilityFactor = origin === "ARCHITECTURAL" ? 0.65 : f.reachable ? (f.internetFacing ? 1.0 : 0.8) : 0.6;
    const authFactor = f.authRequired ? 0.8 : 1.0;
    const likelihoodBoost = r2(1 + 0.5 * epss + (kev ? 0.5 : 0));
    const raw = 100 * (f.cvss / 10) * evidenceFactor * reachabilityFactor * authFactor * criticalityFactor * likelihoodBoost;
    const score = r2(Math.min(100, raw));
    return {
      id: f.id,
      groupId: f.rootCauseGroupId || f.duplicateGroupId || `RC-${f.id}`,
      origin,
      cvss: f.cvss,
      epss: r2(epss),
      kev,
      evidenceFactor,
      reachabilityFactor,
      authFactor,
      criticalityFactor,
      likelihoodBoost,
      score,
      formula: `100 × (${f.cvss}/10) × ${evidenceFactor} × ${reachabilityFactor} × ${authFactor} × ${criticalityFactor} × ${likelihoodBoost} = ${score}`,
    };
  });

  // Correlated findings: group score = max + 0.25 × (sum of the others), capped at 1.5 × max.
  const byGroup = new Map<string, RiskFactorRow[]>();
  for (const r of rows) byGroup.set(`${r.origin}|${r.groupId}`, [...(byGroup.get(`${r.origin}|${r.groupId}`) || []), r]);
  const groups: RiskGroupRow[] = [];
  let naive = 0;
  for (const [key, members] of byGroup) {
    const sorted = [...members].sort((a, b) => b.score - a.score);
    const max = sorted[0].score;
    const others = sorted.slice(1).reduce((s, m) => s + m.score, 0);
    const combined = r2(Math.min(max * 1.5, max + 0.25 * others));
    naive += members.reduce((s, m) => s + m.score, 0);
    groups.push({
      groupId: key,
      members: members.map((m) => m.id),
      maxScore: max,
      combinedScore: combined,
      rule: members.length > 1 ? `max + 0.25×Σothers, capped at 1.5×max` : "single finding",
    });
  }

  // Portfolio: probabilistic union 100 × (1 − Π(1 − g/100)) so adding findings never exceeds 100 and
  // saturates smoothly. Primary and combined are separate.
  const union = (rs: RiskGroupRow[]) => r2(100 * (1 - rs.reduce((p, g) => p * (1 - Math.min(100, g.combinedScore) / 100), 1)));
  const primaryGroups = groups.filter((g) => g.groupId.startsWith("PRIMARY|"));
  const primaryScore = union(primaryGroups);
  const combinedScore = union(groups);
  const grouped = groups.reduce((s, g) => s + g.combinedScore, 0);

  return {
    assetCriticality: crit,
    kevFeed: opts.kevCveIds ? "SUPPLIED" : "NOT_LOADED",
    kevMatches,
    rows,
    groups,
    primaryScore,
    combinedScore,
    dedupAdjustment: r2(naive - grouped),
    formula:
      "finding = 100×(CVSS/10)×evidence×reachability×auth×criticality×(1+0.5·EPSS+0.5·KEV); group = max+0.25·Σothers (≤1.5·max); portfolio = 100×(1−Π(1−group/100))",
    reproducible: true,
  };
}
