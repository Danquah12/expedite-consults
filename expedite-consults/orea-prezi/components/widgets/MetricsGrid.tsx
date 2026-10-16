"use client";

import React from "react";
import { MetricItem } from "@/lib/types";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricsGridProps {
  metrics: MetricItem[];
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 hover:border-blue-500/40 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-xs font-medium text-slate-400 truncate">{m.label}</span>
            {m.trend === "up" && (
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {m.change}
              </span>
            )}
            {m.trend === "down" && (
              <span className="inline-flex items-center text-[10px] font-semibold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/30">
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                {m.change}
              </span>
            )}
            {m.trend === "neutral" && (
              <span className="inline-flex items-center text-[10px] font-semibold text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30">
                <Minus className="w-3 h-3 mr-0.5" />
                {m.change}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold tracking-tight text-white mb-1">{m.value}</div>
          {m.description && <p className="text-[11px] text-slate-400 leading-tight">{m.description}</p>}
        </div>
      ))}
    </div>
  );
};
