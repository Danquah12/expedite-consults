"use client";

import { useMemo } from "react";

type Props = { score: number; size?: number };

export default function RiskGauge({ score, size = 180 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = (size / 2) * 0.75;

  // Arc goes from 210° to 330° (240° sweep = 3/4 of circle)
  const startAngle = 210;
  const endAngle   = 330;
  const sweep      = 300; // total arc degrees

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (startDeg: number, endDeg: number) => {
    const s  = toRad(startDeg);
    const e  = toRad(endDeg);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const filledEnd = startAngle + (score / 100) * sweep;

  const color =
    score >= 75 ? "var(--critical)"
  : score >= 50 ? "var(--high)"
  : score >= 25 ? "var(--medium)"
  : "var(--low)";

  const label =
    score >= 75 ? "Critical"
  : score >= 50 ? "High"
  : score >= 25 ? "Medium"
  : "Low";

  // Needle angle
  const needleDeg = startAngle + (score / 100) * sweep;
  const needleRad = toRad(needleDeg);
  const needleLen = r * 0.65;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.75}`} overflow="visible">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="var(--low)" />
            <stop offset="40%"  stopColor="var(--medium)" />
            <stop offset="70%"  stopColor="var(--high)" />
            <stop offset="100%" stopColor="var(--critical)" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={arcPath(startAngle, endAngle)}
          fill="none"
          stroke="var(--border)"
          strokeWidth={size * 0.08}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {score > 0 && (
          <path
            d={arcPath(startAngle, filledEnd)}
            fill="none"
            stroke={color}
            strokeWidth={size * 0.08}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const deg = startAngle + (tick / 100) * sweep;
          const rad = toRad(deg);
          const inner = r * 0.85;
          const outer = r * 1.1;
          return (
            <line
              key={tick}
              x1={cx + inner * Math.cos(rad)} y1={cy + inner * Math.sin(rad)}
              x2={cx + outer * Math.cos(rad)} y2={cy + outer * Math.sin(rad)}
              stroke="var(--muted)" strokeWidth="1.5"
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={nx} y2={ny}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <circle cx={cx} cy={cy} r={size * 0.04} fill={color} />

        {/* Score text */}
        <text x={cx} y={cy + r * 0.55} textAnchor="middle" fontSize={size * 0.22} fontWeight="900" fill={color}>
          {score}
        </text>
        <text x={cx} y={cy + r * 0.75} textAnchor="middle" fontSize={size * 0.09} fill="var(--muted)">
          / 100
        </text>
      </svg>
      <div className="mt-1 text-sm font-bold" style={{ color }}>{label} Risk</div>
    </div>
  );
}
