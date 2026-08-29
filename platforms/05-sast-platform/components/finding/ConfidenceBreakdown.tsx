import { CheckCircle2, XCircle } from "lucide-react";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

const ENGINE_COLORS: Record<string, string> = {
  CodeQL:   "#6e40c9",
  Semgrep:  "#1f8dd6",
  Joern:    "#00d4ff",
  DataFlow: "#34d399",
};

export default function ConfidenceBreakdown({ finding: f }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h2 className="text-lg font-bold text-white mb-5">🎯 Confidence Breakdown</h2>

      <div className="space-y-4 mb-5">
        {f.engines.map((engine) => {
          const color = ENGINE_COLORS[engine.name] || "var(--primary)";
          return (
            <div key={engine.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  {engine.confirmed
                    ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--low)" }} />
                    : <XCircle      className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted)" }} />}
                  <span className="text-sm font-semibold text-white">{engine.name}</span>
                </div>
                <span className="text-sm font-bold flex-shrink-0" style={{ color }}>{Math.round(engine.confidence * 100)}%</span>
              </div>
              {engine.details && (
                <div className="text-[10px] mb-1 pl-6" style={{ color: "var(--muted)" }}>{engine.details}</div>
              )}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--background)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${engine.confidence * 100}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl p-4 flex items-center justify-between"
        style={{ background: "var(--background)", border: "1px solid var(--border)" }}
      >
        <div>
          <div className="text-xs font-semibold text-white mb-0.5">Aggregate Score</div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            {f.engines.filter(e => e.confirmed).length}/{f.engines.length} engines confirmed
          </div>
        </div>
        <div className="text-3xl font-black" style={{
          color: f.confidence >= 0.9 ? "var(--low)" : f.confidence >= 0.7 ? "var(--primary)" : "var(--high)",
        }}>
          {Math.round(f.confidence * 100)}%
        </div>
      </div>
    </div>
  );
}
