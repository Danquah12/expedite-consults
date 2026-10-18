import Link from "next/link";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { severityColor, epssLabel, confidenceLabel } from "@/lib/utils";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

const SEVERITY_STYLES: Record<string, { bg: string; border: string; dot: string; glow: string }> = {
  Critical: { bg: "rgba(229, 72, 77, 0.06)",  border: "rgba(229, 72, 77, 0.2)",  dot: "var(--critical)", glow: "rgba(229, 72, 77, 0.15)" },
  High:     { bg: "rgba(226, 133, 59, 0.06)",  border: "rgba(226, 133, 59, 0.2)",  dot: "var(--high)",     glow: "rgba(226, 133, 59, 0.12)" },
  Medium:   { bg: "rgba(214, 168, 71, 0.06)",  border: "rgba(214, 168, 71, 0.2)",  dot: "var(--medium)",   glow: "rgba(214, 168, 71, 0.1)" },
  Low:      { bg: "rgba(70, 163, 110, 0.05)",  border: "rgba(70, 163, 110, 0.15)", dot: "var(--low)",      glow: "rgba(70, 163, 110, 0.08)" },
};

export default function FindingCard({ finding: f }: Props) {
  const sc = SEVERITY_STYLES[f.severity];

  return (
    <Link
      href={`/finding/${f.id}`}
      className="block rounded-2xl p-5 transition-all duration-200 group"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        // @ts-ignore CSS custom property
        "--hover-glow": sc.glow,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = sc.dot;
        el.style.boxShadow   = `0 0 30px ${sc.glow}, 0 4px 20px rgba(0, 0, 0, 0.3)`;
        el.style.transform   = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border)";
        el.style.boxShadow   = "";
        el.style.transform   = "";
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
            <span className={severityColor(f.severity)}>{f.severity}</span>
          </span>
          <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: "var(--background)", color: "var(--muted)" }}>
            {f.cwe}
          </span>
          <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "var(--background)", color: "var(--muted)" }}>
            CVSS {f.cvss.toFixed(1)}
          </span>
        </div>
        <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--muted)" }} />
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-[#1f1b18] mb-2 line-clamp-2 group-hover:text-[#8b4528] transition-colors">
        {f.title}
      </h3>

      {/* File */}
      <div className="text-xs font-mono mb-4 truncate" style={{ color: "var(--muted)" }}>
        {f.file.split("/").slice(-2).join("/")}:{f.line}
      </div>

      {/* Engine badges */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {f.engines.map((e) => (
          <span
            key={e.name}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
            style={{
              background: e.confirmed ? "rgba(70, 163, 110, 0.08)" : "var(--background)",
              border: `1px solid ${e.confirmed ? "rgba(70, 163, 110, 0.3)" : "var(--border)"}`,
              color: e.confirmed ? "var(--low)" : "var(--muted)",
            }}
          >
            {e.confirmed && <CheckCircle2 className="w-3 h-3" />}
            {e.name}
          </span>
        ))}
      </div>

      {/* Confidence bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span style={{ color: "var(--muted)" }}>Confidence</span>
          <span style={{ color: "var(--primary)" }}>{confidenceLabel(f.confidence)} — {Math.round(f.confidence * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--background)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${f.confidence * 100}%`,
              background: f.confidence >= 0.9 ? "var(--low)" : f.confidence >= 0.7 ? "var(--primary)" : "var(--high)",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 flex items-center justify-between text-xs" style={{ borderTop: "1px solid var(--border)" }}>
        <span style={{ color: "var(--muted)" }}>EPSS: <span style={{ color: "var(--foreground)" }}>{epssLabel(f.epss)}</span></span>
        <span style={{ color: "var(--foreground)" }}>{f.owasp}</span>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{
            background: f.status === "Open" ? "rgba(229, 72, 77, 0.1)" : f.status === "In Progress" ? "rgba(226, 133, 59, 0.1)" : "rgba(70, 163, 110, 0.1)",
            color:      f.status === "Open" ? "var(--critical)"      : f.status === "In Progress" ? "var(--high)"        : "var(--low)",
          }}
        >
          {f.status}
        </span>
      </div>
    </Link>
  );
}
