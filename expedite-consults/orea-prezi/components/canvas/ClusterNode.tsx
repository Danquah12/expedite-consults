"use client";

import React from "react";
import { ClusterData, SlideData } from "@/lib/types";
import { DynamicIcon } from "@/components/common/DynamicIcon";
import { ChevronRight, Sparkles } from "lucide-react";

interface ClusterNodeProps {
  cluster: ClusterData;
  isActive: boolean;
  onSelectCluster: (cluster: ClusterData) => void;
  onSelectSlide: (slide: SlideData) => void;
}

export const ClusterNode: React.FC<ClusterNodeProps> = ({
  cluster,
  isActive,
  onSelectCluster,
  onSelectSlide,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: cluster.x,
        top: cluster.y,
        width: 520,
        transform: "translate(-50%, -50%)",
      }}
      className="pointer-events-auto flex flex-col items-center justify-center z-10 select-none"
    >
      {/* Outer Constellation Orbit Ring */}
      <div
        className={`absolute -inset-10 rounded-full border border-dashed transition-all duration-700 pointer-events-none ${
          isActive
            ? "border-blue-400/80 scale-105 shadow-[0_0_120px_-10px_rgba(59,130,246,0.35)]"
            : "border-slate-800/80"
        }`}
        style={{
          borderColor: isActive ? cluster.accentColor : undefined,
        }}
      />

      {/* Main Cluster Planet Bubble */}
      <div
        onClick={() => onSelectCluster(cluster)}
        className="w-full rounded-3xl p-6 backdrop-blur-2xl border transition-all duration-500 shadow-2xl cursor-pointer hover:scale-[1.03] group relative overflow-hidden flex flex-col items-center text-center"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${cluster.accentColor}25 0%, rgba(15, 23, 42, 0.92) 80%)`,
          borderColor: isActive ? cluster.accentColor : "rgba(255, 255, 255, 0.12)",
          boxShadow: `0 25px 60px -15px rgba(0,0,0,0.85), 0 0 45px -10px ${cluster.accentColor}30`,
        }}
      >
        {/* Top Accent Strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            background: `linear-gradient(90deg, transparent, ${cluster.accentColor}, transparent)`,
          }}
        />

        {/* Badge & Icon */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase border backdrop-blur-md shadow-md"
            style={{
              backgroundColor: `${cluster.accentColor}25`,
              borderColor: `${cluster.accentColor}60`,
              color: cluster.accentColor,
            }}
          >
            {cluster.badge}
          </span>
          <span className="text-[11px] text-slate-400 font-mono bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
            {cluster.slides.length} Chapters
          </span>
        </div>

        {/* Center Glowing Icon */}
        <div
          className="p-4 rounded-2xl mb-3 shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 border"
          style={{
            backgroundColor: `${cluster.accentColor}20`,
            borderColor: `${cluster.accentColor}50`,
          }}
        >
          <DynamicIcon
            name={cluster.icon}
            className="w-10 h-10 drop-shadow-lg"
            style={{ color: cluster.accentColor }}
          />
        </div>

        {/* Cluster Title & Tagline */}
        <h3 className="text-xl font-extrabold text-white group-hover:text-blue-200 transition-colors drop-shadow-md mb-1.5 leading-snug">
          {cluster.title}
        </h3>
        <p className="text-xs text-slate-300 font-normal leading-relaxed mb-4 max-w-sm">
          {cluster.tagline}
        </p>

        {/* Child Slide Clickable Capsules */}
        <div className="w-full space-y-2 pt-3 border-t border-slate-800/80">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Interactive Topics (Click to Zoom)</span>
          </div>

          {cluster.slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlide(s);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-cyan-400/70 hover:bg-slate-900 transition-all text-left group/btn shadow-md"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 text-white"
                  style={{ backgroundColor: `${cluster.accentColor}60` }}
                >
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-200 group-hover/btn:text-white truncate">
                  {s.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover/btn:text-cyan-400 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
