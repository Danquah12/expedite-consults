"use client";

import { useMemo } from "react";
import { generateTrendData } from "@/lib/risk";

type Props = { currentScore: number };

export default function RiskTrendChart({ currentScore }: Props) {
  const data = useMemo(() => generateTrendData(currentScore), [currentScore]);

  const scores = data.map(d => d.score);
  const max    = Math.max(...scores);
  const min    = Math.min(...scores);
  const range  = max - min || 1;

  const W = 800; const H = 120;
  const PAD = { top: 10, bottom: 30, left: 10, right: 10 };

  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right),
    y: PAD.top + (1 - (d.score - min) / range) * (H - PAD.top - PAD.bottom),
    score: d.score,
    day: d.day,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H - PAD.bottom} L ${points[0].x} ${H - PAD.bottom} Z`;

  const first = points[0];
  const last  = points[points.length - 1];
  const trend = last.score - first.score;

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Risk Score Trend</h3>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Last 30 days</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold" style={{ color: trend <= 0 ? "var(--low)" : "var(--critical)" }}>
            {trend <= 0 ? "↓" : "↑"} {Math.abs(Math.round(trend))} points
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>{trend <= 0 ? "Improving" : "Worsening"}</div>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t, i) => (
          <line key={i}
            x1={PAD.left} y1={PAD.top + t * (H - PAD.top - PAD.bottom)}
            x2={W - PAD.right} y2={PAD.top + t * (H - PAD.top - PAD.bottom)}
            stroke="var(--border)" strokeWidth="1"
          />
        ))}
        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last.x} cy={last.y} r="4" fill="var(--primary)" />
        <circle cx={last.x} cy={last.y} r="8" fill="var(--primary)" fillOpacity="0.2" />
        {points.filter((_, i) => i % 6 === 0 || i === points.length - 1).map((p, i) => (
          <text key={i} x={p.x} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--muted)">{p.day}</text>
        ))}
      </svg>
    </div>
  );
}
