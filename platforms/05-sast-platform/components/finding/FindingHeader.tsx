import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { severityColor } from "@/lib/utils";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

const SEVERITY_DOT: Record<string, string> = {
  Critical: "var(--critical)",
  High:     "var(--high)",
  Medium:   "var(--medium)",
  Low:      "var(--low)",
};

export default function FindingHeader({ finding: f }: Props) {
  const dotColor = SEVERITY_DOT[f.severity];

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white"
        style={{ color: "var(--muted)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs font-mono px-3 py-1 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--primary)" }}>
          {f.id}
        </span>
        <span
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold"
          style={{ background: `${dotColor}18`, border: `1px solid ${dotColor}40` }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
          <span className={severityColor(f.severity)}>{f.severity}</span>
        </span>
        <span
          className="px-3 py-1 rounded-lg text-xs font-medium"
          style={{
            background: f.status === "Open" ? "rgba(255,59,48,0.1)" : f.status === "In Progress" ? "rgba(255,149,0,0.1)" : "rgba(52,199,89,0.1)",
            color:      f.status === "Open" ? "var(--critical)"      : f.status === "In Progress" ? "var(--high)"        : "var(--low)",
          }}
        >
          {f.status}
        </span>
        <span className="text-xs px-3 py-1 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
          {f.application}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-5">{f.title}</h1>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "CVSS",     value: f.cvss.toFixed(1),                    color: f.cvss >= 9 ? "var(--critical)" : f.cvss >= 7 ? "var(--high)" : "var(--medium)" },
          { label: "CWE",      value: f.cwe,                                 color: "var(--primary)" },
          { label: "OWASP",    value: f.owasp,                               color: "#a78bfa" },
          { label: "MITRE",    value: f.mitre,                               color: "#fbbf24" },
          { label: "EPSS",     value: `${(f.epss * 100).toFixed(1)}%`,      color: "var(--muted)" },
          { label: "Language", value: f.language,                            color: "var(--muted)" },
        ].map(m => (
          <div key={m.label} className="rounded-xl px-4 py-2.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "var(--muted)" }}>{m.label}</div>
            <div className="text-sm font-bold" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
