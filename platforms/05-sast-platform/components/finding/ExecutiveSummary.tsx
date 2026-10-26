import { AlertTriangle, TrendingUp, Target } from "lucide-react";
import type { SASTFinding } from "@/types/sast";
import type { AuthoritativeProofStatus } from "@/components/finding/FindingHeader";

type Props = {
  finding: SASTFinding;
  proofStatus?: AuthoritativeProofStatus;
  runtimeReproduced?: boolean;
};

export default function ExecutiveSummary({
  finding: f,
  proofStatus = "Dataflow Confirmed",
  runtimeReproduced = false,
}: Props) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 className="text-lg font-bold text-[#1f1b18] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--critical)" }} />
          Executive &amp; Technical Summary
        </h2>
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-md"
          style={{
            background: "rgba(139, 69, 40, 0.12)",
            color: "#8b4528",
            border: "1px solid rgba(139, 69, 40, 0.3)",
          }}
        >
          Authoritative Status: {proofStatus}
        </span>
      </div>

      <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--muted)" }}>
        {f.executiveSummary}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--background)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: "#b45309" }} />
              <span className="text-xs font-bold text-[#1f1b18]">
                Hypothesized Impact (Conditional)
              </span>
            </div>
            <span
              className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded"
              style={{
                background: "rgba(214, 168, 71, 0.18)",
                color: "#9a6700",
              }}
            >
              {runtimeReproduced ? "SELECT Scope Verified" : "Unverified Without Runtime Proof"}
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            {f.businessImpact}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{ background: "var(--background)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" style={{ color: "var(--high)" }} />
            <span className="text-xs font-bold text-[#1f1b18]">
              Verified Static Root Cause (Lines 9&rarr;10&rarr;12)
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            {f.rootCause}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {[
          {
            label: "Exposure",
            value: "Unverified (Static Repo Scan — Check Ingress)",
            highlight: false,
          },
          {
            label: "Auth Requirement",
            value: "Unverified (@PostMapping alone does not prove absent auth)",
            highlight: false,
          },
          {
            label: "Exploitability",
            value: runtimeReproduced
              ? "Reproduced in Isolated Sandbox"
              : "Conditional on Reachability & Auth Middleware",
            highlight: runtimeReproduced,
          },
          {
            label: "Static Taint Path",
            value: "Confirmed (0 Sanitizers in Method Scope)",
            highlight: true,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{
              background: item.highlight ? "rgba(226, 133, 59, 0.1)" : "var(--background)",
              border: `1px solid ${
                item.highlight ? "rgba(226, 133, 59, 0.35)" : "var(--border)"
              }`,
            }}
          >
            <span style={{ color: "var(--muted)" }}>{item.label}:</span>
            <span
              style={{ color: item.highlight ? "#8b4528" : "var(--foreground)" }}
              className="font-semibold"
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
