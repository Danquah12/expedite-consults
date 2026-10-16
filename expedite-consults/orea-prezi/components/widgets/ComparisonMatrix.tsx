"use client";

import React from "react";
import { ComparisonItem } from "@/lib/types";
import { Check, X, ShieldAlert, Sparkles } from "lucide-react";

interface ComparisonMatrixProps {
  comparisons: ComparisonItem[];
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ comparisons }) => {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/60 shadow-lg">
      <div className="grid grid-cols-12 bg-slate-800/90 text-[11px] font-bold text-slate-300 uppercase tracking-wider py-2.5 px-4 border-b border-slate-700">
        <div className="col-span-3">Workflow Dimension</div>
        <div className="col-span-4 text-slate-400">Legacy / Fragmented Process</div>
        <div className="col-span-5 text-emerald-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          OREA Standard Forms 2.0 Smart Suite
        </div>
      </div>
      <div className="divide-y divide-slate-800">
        {comparisons.map((c, i) => (
          <div
            key={i}
            className="grid grid-cols-12 py-3 px-4 text-xs items-center hover:bg-slate-800/40 transition-colors"
          >
            <div className="col-span-3 font-semibold text-slate-200">{c.feature}</div>
            <div className="col-span-4 text-slate-400 flex items-start gap-1.5 pr-3">
              <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{c.legacy}</span>
            </div>
            <div className="col-span-5 text-slate-100 font-medium flex items-start gap-1.5 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{c.oreaNext}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
