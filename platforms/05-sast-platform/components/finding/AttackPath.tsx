import { ArrowDown } from "lucide-react";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

const NODE_STYLES = {
  entry:         { bg: "rgba(0,212,255,0.08)",   border: "rgba(0,212,255,0.3)",   color: "var(--primary)",  icon: "🌐" },
  vulnerability: { bg: "rgba(255,59,48,0.1)",    border: "rgba(255,59,48,0.4)",   color: "var(--critical)", icon: "⚡" },
  lateral:       { bg: "rgba(255,149,0,0.08)",   border: "rgba(255,149,0,0.3)",   color: "var(--high)",     icon: "→" },
  asset:         { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.3)", color: "#a78bfa",         icon: "🗄" },
  impact:        { bg: "rgba(255,59,48,0.15)",   border: "rgba(255,59,48,0.5)",   color: "var(--critical)", icon: "💥" },
} as const;

export default function AttackPath({ finding: f }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h2 className="text-lg font-bold text-white mb-6">⚔️ Attack Path</h2>
      <div className="flex flex-col items-center gap-0">
        {f.attackPath.map((step, i) => {
          const style = NODE_STYLES[step.type];
          return (
            <div key={i} className="flex flex-col items-center w-full">
              <div
                className="w-full rounded-xl p-4 text-center"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
              >
                <div className="text-xl mb-1">{style.icon}</div>
                <div className="text-sm font-bold" style={{ color: style.color }}>{step.label}</div>
                {step.description && (
                  <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{step.description}</div>
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
