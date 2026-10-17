"use client";

import React, { useState } from "react";
import { Server, Database, Cloud, Cpu } from "lucide-react";

interface LayerData {
  layer: string;
  title: string;
  tags: string[];
  details: string;
}

interface ArchitectureDiagramProps {
  pillars: LayerData[];
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ pillars }) => {
  const [activeLayer, setActiveLayer] = useState<number>(0);

  const getLayerIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Cloud className="w-5 h-5 text-cyan-400" />;
      case 1:
        return <Database className="w-5 h-5 text-blue-400" />;
      case 2:
        return <Server className="w-5 h-5 text-purple-400" />;
      default:
        return <Cpu className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="my-4 space-y-2.5">
      <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
        <span>Click any architectural tier to inspect technical protocol specifics:</span>
        <span className="text-[11px] text-cyan-400 font-medium">RESO 2.0 & MLS Interop Certified</span>
      </div>

      <div className="space-y-2">
        {pillars.map((pillar, idx) => {
          const isSelected = activeLayer === idx;
          return (
            <div
              key={idx}
              onClick={() => setActiveLayer(idx)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-800/90 border-cyan-400/80 shadow-[0_0_20px_-3px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/40"
                  : "bg-slate-900/50 border-slate-700/60 hover:bg-slate-800/60 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {getLayerIcon(idx)}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      {pillar.layer}
                    </div>
                    <div className="text-sm font-semibold text-white">{pillar.title}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {pillar.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-950/80 text-slate-300 border border-slate-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-slate-700/60 text-xs text-slate-300 leading-relaxed bg-cyan-950/20 p-2.5 rounded-lg border-cyan-500/20">
                  <span className="font-semibold text-cyan-300">Technical Capability: </span>
                  {pillar.details}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
