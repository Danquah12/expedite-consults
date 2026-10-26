import { ArrowDown, AlertTriangle } from "lucide-react";
import type { SASTFinding } from "@/types/sast";
import type { AuthoritativeProofStatus } from "@/components/finding/FindingHeader";

type Props = {
  finding: SASTFinding;
  proofStatus?: AuthoritativeProofStatus;
  runtimeReproduced?: boolean;
};

const NODE_STYLES = {
  entry: {
    bg: "#f4e5dc",
    border: "rgba(139, 69, 40, 0.35)",
    color: "var(--primary)",
    icon: "🌐",
    badge: "STATICALLY DETECTED",
  },
  vulnerability: {
    bg: "rgba(229, 72, 77, 0.08)",
    border: "rgba(229, 72, 77, 0.35)",
    color: "var(--critical)",
    icon: "⚡",
    badge: "DATAFLOW CONFIRMED",
  },
  lateral: {
    bg: "rgba(226, 133, 59, 0.08)",
    border: "rgba(226, 133, 59, 0.3)",
    color: "var(--high)",
    icon: "→",
    badge: "RUNTIME VALIDATION GATE",
  },
  asset: {
    bg: "#f4e5dc",
    border: "rgba(139, 69, 40, 0.35)",
    color: "#8b4528",
    icon: "🗄",
    badge: "SINK CONFIRMED",
  },
  impact: {
    bg: "rgba(214, 168, 71, 0.12)",
    border: "rgba(214, 168, 71, 0.55)",
    color: "#9a6700",
    icon: "⚠️",
    badge: "UNVERIFIED — REQUIRES RUNTIME PROOF",
  },
} as const;

export default function AttackPath({
  finding: f,
  proofStatus = "Dataflow Confirmed",
  runtimeReproduced = false,
}: Props) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#1f1b18]">⚔️ Source-to-Sink &amp; Impact Path</h2>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          Distinguishes confirmed static AST nodes from hypothesized downstream impact.
        </p>
      </div>

      <div className="flex flex-col items-center gap-0">
        {f.attackPath.map((step, i) => {
          const style = NODE_STYLES[step.type];
          const isImpact = step.type === "impact";
          const displayLabel = isImpact ? "Hypothesized Impact" : step.label;
          const badgeText = isImpact
            ? proofStatus === "Impact Confirmed"
              ? "IMPACT CONFIRMED BY ARTIFACT"
              : runtimeReproduced
              ? "SELECT SCOPE REPRODUCED · WRITE/RCE UNVERIFIED"
              : "UNVERIFIED — REQUIRES RUNTIME PROOF"
            : style.badge;

          return (
            <div key={i} className="flex flex-col items-center w-full">
              <div
                className="w-full rounded-xl p-3.5 text-center"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span
                    className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded"
                    style={{
                      background: isImpact
                        ? "rgba(214, 168, 71, 0.22)"
                        : "rgba(255, 255, 255, 0.65)",
                      color: style.color,
                      border: `1px solid ${style.border}`,
                    }}
                  >
                    {badgeText}
                  </span>
                </div>

                <div className="text-sm font-bold flex items-center justify-center gap-1.5" style={{ color: style.color }}>
                  {isImpact && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{displayLabel}</span>
                </div>

                {isImpact ? (
                  <div className="text-xs mt-1.5 space-y-1 text-left rounded-lg p-2.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div style={{ color: "#1f1b18" }}>
                      <strong>Demonstrated by Code:</strong> Method calls <code>{f.sink}</code> (executes SQL query on configured connection).
                    </div>
                    <div style={{ color: "var(--muted)" }}>
                      <strong>Unverified Hypothesis:</strong> Unauthenticated database write access, schema tampering, and remote code execution via DB extensions are <strong>not proved</strong> by the displayed code and require runtime privilege verification.
                    </div>
                  </div>
                ) : (
                  step.description && (
                    <div className="text-xs mt-1 font-mono" style={{ color: "var(--muted)", wordBreak: "break-word" }}>
                      {step.description}
                    </div>
                  )
                )}
              </div>
              {i < f.attackPath.length - 1 && (
                <div className="py-1.5">
                  <ArrowDown className="w-4 h-4" style={{ color: "var(--border)" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
