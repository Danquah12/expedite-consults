import type { SASTFinding } from "@/types/sast";

/** Weights used in the risk score formula */
const WEIGHTS = {
  critical: 10,
  high: 5,
  medium: 2,
  low: 1,
  attackChain: 15,
  internetFacing: 10,
  noAuth: 8,
  mitigated: -5,
};

/**
 * Calculate a 0–100 risk score for a set of findings.
 * Formula mirrors the PMS Risk Scoring Model.
 */
export function calculateRiskScore(findings: SASTFinding[]): number {
  const criticals = findings.filter(f => f.severity === "Critical" && f.status !== "Resolved").length;
  const highs     = findings.filter(f => f.severity === "High"     && f.status !== "Resolved").length;
  const mediums   = findings.filter(f => f.severity === "Medium"   && f.status !== "Resolved").length;
  const lows      = findings.filter(f => f.severity === "Low"      && f.status !== "Resolved").length;

  const exposed   = findings.filter(f => f.internetFacing && f.status !== "Resolved").length;
  const noAuth    = findings.filter(f => !f.authRequired  && f.status !== "Resolved").length;

  const raw =
    criticals * WEIGHTS.critical +
    highs     * WEIGHTS.high +
    mediums   * WEIGHTS.medium +
    lows      * WEIGHTS.low +
    exposed   * WEIGHTS.internetFacing +
    noAuth    * WEIGHTS.noAuth;

  // Normalize to 100
  const max = 150;
  return Math.min(100, Math.round((raw / max) * 100));
}

/** Average confidence across all findings */
export function averageConfidence(findings: SASTFinding[]): number {
  if (findings.length === 0) return 0;
  return findings.reduce((acc, f) => acc + f.confidence, 0) / findings.length;
}

/** Severity counts */
export function severityCounts(findings: SASTFinding[]) {
  return {
    critical: findings.filter(f => f.severity === "Critical").length,
    high:     findings.filter(f => f.severity === "High").length,
    medium:   findings.filter(f => f.severity === "Medium").length,
    low:      findings.filter(f => f.severity === "Low").length,
    total:    findings.length,
  };
}

/** Generate synthetic 30-day trend data */
export function generateTrendData(currentScore: number): { day: string; score: number }[] {
  const data: { day: string; score: number }[] = [];
  let score = Math.min(100, currentScore + 15);

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    // Simulate gradual improvement with noise
    const noise = Math.floor(Math.random() * 6) - 3;
    score = Math.max(10, Math.min(100, score + noise - (i > 10 ? 0.3 : -0.5)));
    data.push({ day: label, score: Math.round(score) });
  }
  return data;
}
