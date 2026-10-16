"use client";

import React from "react";
import { ClusterData, SlideData } from "@/lib/types";
import { X, Layers, Sparkles, ChevronRight } from "lucide-react";
import { DynamicIcon } from "@/components/common/DynamicIcon";

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clusters: ClusterData[];
  activeSlideId?: string;
  onSelectSlide: (slide: SlideData) => void;
  onSelectCluster: (cluster: ClusterData) => void;
  onOverview: () => void;
}

export const SlideDrawer: React.FC<SlideDrawerProps> = ({
  isOpen,
  onClose,
  clusters,
  activeSlideId,
  onSelectSlide,
  onSelectCluster,
  onOverview,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 max-w-full bg-slate-900/95 backdrop-blur-2xl border-l border-slate-700/80 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Presentation Outline
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Button */}
      <div className="p-3 border-b border-slate-800">
        <button
          onClick={() => {
            onOverview();
            onClose();
          }}
          className="w-full py-2 px-3 rounded-xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 text-xs font-semibold text-blue-300 flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Macro Constellation Overview</span>
        </button>
      </div>

      {/* Cluster & Slides List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {clusters.map((cluster) => (
          <div key={cluster.id} className="space-y-1.5">
            <div
              onClick={() => {
                onSelectCluster(cluster);
                onClose();
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer font-bold text-slate-200 transition-colors"
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cluster.accentColor }}
              />
              <span className="flex-1 truncate">{cluster.title}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {cluster.slides.length}
              </span>
            </div>

            <div className="pl-4 space-y-1 border-l border-slate-800 ml-2">
              {cluster.slides.map((slide) => {
                const isSelected = activeSlideId === slide.id;
                return (
                  <button
                    key={slide.id}
                    onClick={() => {
                      onSelectSlide(slide);
                      onClose();
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? "bg-blue-600/30 border border-blue-500/50 text-white font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <span className="truncate pr-2">{slide.title}</span>
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
