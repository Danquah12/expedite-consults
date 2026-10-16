"use client";

import React, { useState } from "react";
import { TimelineStep } from "@/lib/types";
import { CheckCircle2, Clock, Calendar, ChevronRight } from "lucide-react";

interface TimelineFlowProps {
  timeline: TimelineStep[];
}

export const TimelineFlow: React.FC<TimelineFlowProps> = ({ timeline }) => {
  const [selectedPhase, setSelectedPhase] = useState<number>(0);

  return (
    <div className="my-4">
      {/* Horizontal Phase Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {timeline.map((step, idx) => {
          const isSelected = selectedPhase === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedPhase(idx)}
              className={`p-3 text-left rounded-xl border transition-all ${
                isSelected
                  ? "bg-pink-950/40 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] ring-1 ring-pink-500/50"
                  : "bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-pink-400">{step.phase}</span>
                {step.status === "in-progress" ? (
                  <span className="inline-flex items-center text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40 animate-pulse">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 font-mono">{step.period}</span>
                )}
              </div>
              <div className="text-xs font-semibold text-slate-200 line-clamp-1">{step.title}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Phase Detail Showcase */}
      {timeline[selectedPhase] && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <div className="text-[11px] font-mono text-pink-400 uppercase font-semibold">
                {timeline[selectedPhase].phase} • {timeline[selectedPhase].period}
              </div>
              <h4 className="text-base font-bold text-white mt-0.5">
                {timeline[selectedPhase].title}
              </h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              <span>Target Delivery Window</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Core Deliverables & Milestones:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {timeline[selectedPhase].items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
