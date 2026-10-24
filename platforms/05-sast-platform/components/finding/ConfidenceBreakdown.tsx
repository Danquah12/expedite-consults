import { CheckCircle2, XCircle } from "lucide-react";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

const ENGINE_COLORS: Record<string, string> = {
  "XTRIKE XQL":          "#8b4528",
  "XTRIKE DeepFlow":     "#8b4528",
  "XTRIKE StructSCA":    "#8b4528",
  "XTRIKE AST-Query":    "#8b4528",
  "XTRIKE PatternGuard": "#8b4528",
  "XTRIKE DepGuard":     "#e2853b",
  "XTRIKE GraphCPG":     "#8b4528",
  "XTRIKE TaintFlow":    "#46a36e",
};

export default function ConfidenceBreakdown({ finding: f }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h2 className="text-lg font-bold text-[#1f1b18] mb-5">🎯 Confidence Breakdown</h2>

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
                  <span className="text-sm font-semibold text-[#1f1b18]">{engine.name}</span>
                </div>
                <span className="text-sm font-bold flex-shrink-0" style={{ color }}>{Math.round(engine.confidence * 100)}%</span>
              </div>
              {engine.details && (
                <div
                  className="text-[10.5px] mb-1.5 pl-6"
                  style={{ color: "var(--muted)", wordBreak: "break-word", overflowWrap: "anywhere" }}
                >
                  {engine.details}
                </div>
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
          <div className="text-xs font-semibold text-[#1f1b18] mb-0.5">Aggregate Score</div>
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
