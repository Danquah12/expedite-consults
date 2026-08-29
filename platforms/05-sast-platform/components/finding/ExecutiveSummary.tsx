import { AlertTriangle, TrendingUp, Target } from "lucide-react";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

export default function ExecutiveSummary({ finding: f }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" style={{ color: "var(--critical)" }} />
        Executive Summary
      </h2>
      <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
        {f.executiveSummary}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: "var(--critical)" }} />
            <span className="text-xs font-semibold text-white">Business Impact</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{f.businessImpact}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" style={{ color: "var(--high)" }} />
            <span className="text-xs font-semibold text-white">Root Cause</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{f.rootCause}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Internet Facing", value: f.internetFacing ? "Yes — Public" : "No — Internal", danger: f.internetFacing },
          { label: "Auth Required",   value: f.authRequired   ? "Yes"          : "No",            danger: !f.authRequired },
          { label: "Exploitability",  value: f.exploitabilityLevel,                                danger: f.exploitabilityLevel === "Very Easy" || f.exploitabilityLevel === "Easy" },
          { label: "False Positive",  value: `${f.falsePositiveLikelihood} likelihood`,            danger: false },
        ].map(item => (
          <div
            key={item.label}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background: item.danger ? "rgba(255,59,48,0.08)" : "var(--background)",
              border: `1px solid ${item.danger ? "rgba(255,59,48,0.25)" : "var(--border)"}`,
            }}
          >
            <span style={{ color: "var(--muted)" }}>{item.label}:</span>
            <span style={{ color: item.danger ? "var(--critical)" : "var(--foreground)" }} className="font-semibold">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
