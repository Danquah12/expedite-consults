import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn, riskScoreColor } from "@/lib/utils";
import type { SASTFinding } from "@/types/sast";
import { severityCounts, averageConfidence, calculateRiskScore } from "@/lib/risk";

type Props = {
  findings: SASTFinding[];
  onCardClick?: (label: string) => void;
};

export default function RiskSummaryBar({ findings, onCardClick }: Props) {
  const counts     = severityCounts(findings);
  const riskScore  = calculateRiskScore(findings);
  const confidence = averageConfidence(findings);

  const metrics = [
    {
      label: "Risk Score",
      value: `${riskScore}`,
      suffix: "/100",
      sub: riskScore >= 75 ? "Critical Risk" : riskScore >= 50 ? "High Risk" : "Medium Risk",
      icon: AlertTriangle,
      color: riskScoreColor(riskScore),
      bg: "rgba(255,59,48,0.06)",
      border: "rgba(255,59,48,0.2)",
    },
    {
      label: "Critical",
      value: `${counts.critical}`,
      suffix: "",
      sub: "Immediate action required",
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "rgba(255,59,48,0.06)",
      border: "rgba(255,59,48,0.2)",
    },
    {
      label: "High",
      value: `${counts.high}`,
      suffix: "",
      sub: "Address within 7 days",
      icon: AlertTriangle,
      color: "text-orange-400",
      bg: "rgba(255,149,0,0.06)",
      border: "rgba(255,149,0,0.2)",
    },
    {
      label: "Avg Confidence",
      value: `${Math.round(confidence * 100)}`,
      suffix: "%",
      sub: "Engine consensus score",
      icon: CheckCircle2,
      color: "text-cyan-400",
      bg: "rgba(0,212,255,0.06)",
      border: "rgba(0,212,255,0.2)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.label}
            onClick={() => onCardClick?.(m.label)}
            className="rounded-2xl p-5 hover:brightness-110"
            style={{
              background: m.bg,
              border: `1px solid ${m.border}`,
              cursor: onCardClick ? "pointer" : "default",
              transition: "filter 0.2s"
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                {m.label}
              </span>
              <Icon className={cn("w-4 h-4", m.color)} />
            </div>
            <div className={cn("text-4xl font-black mb-1", m.color)}>
              {m.value}<span className="text-xl font-bold">{m.suffix}</span>
            </div>
            <div className="text-xs flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
              {m.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}
