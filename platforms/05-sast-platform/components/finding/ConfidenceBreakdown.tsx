import { CheckCircle2, XCircle, Sliders } from "lucide-react";
import type { SASTFinding } from "@/types/sast";
import type { AuthoritativeProofStatus } from "@/components/finding/FindingHeader";

type Props = {
  finding: SASTFinding;
  proofStatus?: AuthoritativeProofStatus;
  runtimeReproduced?: boolean;
  mitigationVerified?: boolean;
};

const ENGINE_COLORS: Record<string, string> = {
  "XTRIKE XQL": "#8b4528",
  "XTRIKE DeepFlow": "#8b4528",
  "XTRIKE StructSCA": "#8b4528",
  "XTRIKE AST-Query": "#8b4528",
  "XTRIKE PatternGuard": "#8b4528",
  "XTRIKE DepGuard": "#e2853b",
  "XTRIKE GraphCPG": "#8b4528",
  "XTRIKE TaintFlow": "#46a36e",
};

export default function ConfidenceBreakdown({
  finding: f,
  proofStatus = "Dataflow Confirmed",
  runtimeReproduced = false,
  mitigationVerified = false,
}: Props) {
  const staticConfPct = Math.round(f.confidence * 100);
  const pathFeasibilityPct = f.reachable ? 86 : 25;
  const runtimeReproPct = mitigationVerified ? 100 : runtimeReproduced ? 96 : 0;
  const impactConfPct =
    proofStatus === "Impact Confirmed" ? 92 : runtimeReproduced ? 35 : 20;

  const dimensions = [
    {
      label: "1. Static-Analysis Confidence",
      pct: staticConfPct,
      badge: `${staticConfPct}% (High)`,
      color: "var(--low)",
      note: "AST source parameter, string concatenation, and execution sink matched deterministically.",
    },
    {
      label: "2. Path Feasibility",
      pct: pathFeasibilityPct,
      badge: `${pathFeasibilityPct}% (Intra-Procedural)`,
      color: "#8b4528",
      note: "0 sanitizers in local method path; upstream Spring Security / API gateway filters unverified statically.",
    },
    {
      label: "3. Runtime Reproducibility",
      pct: runtimeReproPct,
      badge: mitigationVerified
        ? "100% (Retest Passed)"
        : runtimeReproduced
        ? "96% (Sandbox Verified)"
        : "0% (Not Yet Executed)",
      color: runtimeReproduced || mitigationVerified ? "var(--low)" : "#b45309",
      note: mitigationVerified
        ? "Parameterized query retested against TC-SQLI-089-001; injection blocked."
        : runtimeReproduced
        ? "Controlled probe TC-SQLI-089-001 confirmed SQL WHERE predicate alteration."
        : "No runtime exploit has been executed yet; click 'Execute Isolated Runtime Probe' in Proof Engine.",
    },
    {
      label: "4. Impact Confidence",
      pct: impactConfPct,
      badge:
        proofStatus === "Impact Confirmed"
          ? "92% (Verified)"
          : `${impactConfPct}% (SELECT Read Only)`,
      color: proofStatus === "Impact Confirmed" ? "var(--critical)" : "#b45309",
      note: "Displayed code proves SELECT query execution only; DB write access and RCE are not evidenced by this method.",
    },
  ];

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div>
        <h2 className="text-lg font-bold text-[#1f1b18] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#8b4528]" />
          4-Dimensional Confidence Breakdown
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
          Separates static detection, path feasibility, runtime reproducibility, and impact confidence.
        </p>
      </div>

      {/* 4 Separated Dimensions */}
      <div className="space-y-3">
        {dimensions.map((dim) => (
          <div
            key={dim.label}
            className="rounded-xl p-3"
            style={{ background: "var(--background)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-[#1f1b18]">{dim.label}</span>
              <span
                className="text-[10.5px] font-extrabold px-2 py-0.5 rounded"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: dim.color,
                }}
              >
                {dim.badge}
              </span>
            </div>
            <p className="text-[10.5px] leading-snug mb-2" style={{ color: "var(--muted)" }}>
              {dim.note}
            </p>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--surface)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(4, dim.pct)}%`,
                  background: dim.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Per-Engine Static Signals */}
      <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
        <div
          className="text-[10.5px] font-extrabold uppercase tracking-wider mb-3"
          style={{ color: "var(--muted)" }}
        >
          Static Engine Consensus ({f.engines.filter((e) => e.confirmed).length}/{f.engines.length} Static Analyzers)
        </div>
        <div className="space-y-3">
          {f.engines.map((engine) => {
            const color = ENGINE_COLORS[engine.name] || "var(--primary)";
            return (
              <div key={engine.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {engine.confirmed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--low)" }} />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--muted)" }} />
                    )}
                    <span className="text-xs font-semibold text-[#1f1b18]">{engine.name}</span>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color }}>
                    {Math.round(engine.confidence * 100)}%
                  </span>
                </div>
                {engine.details && (
                  <div
                    className="text-[10px] mb-1 pl-5"
                    style={{
                      color: "var(--muted)",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {engine.details}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="rounded-xl p-3 text-[11px] leading-snug"
        style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted)" }}
      >
        <strong className="text-[#1f1b18]">Release Gate Note:</strong> Static engine consensus ({staticConfPct}%) confirms a suspicious source-to-sink code pattern, not runtime exploitability. Release blocking is enforced by policy and verified evidence in the Proof Engine.
      </div>
    </div>
  );
}
