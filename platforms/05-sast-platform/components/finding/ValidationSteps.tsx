import { CheckCircle2 } from "lucide-react";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

export default function ValidationSteps({ finding: f }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h2 className="text-lg font-bold text-white mb-4">✅ Validation Steps</h2>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
        After applying the fix, confirm it is effective using these verification steps:
      </p>
      <ol className="space-y-3">
        {f.validationSteps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "var(--primary)" }}
            >
              {i + 1}
            </div>
            <span className="text-sm" style={{ color: "var(--muted)" }}>{step}</span>
          </li>
        ))}
      </ol>

      <div
        className="mt-6 rounded-xl p-4 flex items-start gap-3"
        style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.25)" }}
      >
        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--low)" }} />
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          SLA Deadline: <span className="text-white font-semibold">{f.slaDeadline}</span>
          {" · "}
          Owner: <span className="text-white font-semibold">{f.owner}</span>
          {" · "}
          Application: <span className="text-white font-semibold">{f.application}</span>
        </div>
      </div>
    </div>
  );
}
