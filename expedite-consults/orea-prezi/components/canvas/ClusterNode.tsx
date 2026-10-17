"use client";

import React from "react";
import { ClusterData } from "@/lib/types";
import { DynamicIcon } from "@/components/common/DynamicIcon";
import { Layers } from "lucide-react";

interface ClusterNodeProps {
  cluster: ClusterData;
  isActive: boolean;
  onSelectCluster: (cluster: ClusterData) => void;
}

export const ClusterNode: React.FC<ClusterNodeProps> = ({
  cluster,
  isActive,
  onSelectCluster,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: cluster.x,
        top: cluster.y,
        width: cluster.radius * 2,
        height: cluster.radius * 2,
        transform: "translate(-50%, -50%)",
      }}
      className="pointer-events-none flex items-center justify-center"
    >
      {/* Outer Constellation Boundary Ring */}
      <div
        className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 ${
          isActive
            ? "border-blue-400/60 scale-105 shadow-[0_0_80px_-10px_rgba(59,130,246,0.3)]"
            : "border-slate-800/70 hover:border-slate-700"
        }`}
        style={{
          borderColor: isActive ? cluster.accentColor : undefined,
        }}
      />

      {/* Cluster Header Badge & Title (Floating at the top of the cluster) */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-auto cursor-pointer group text-center z-10"
        onClick={() => onSelectCluster(cluster)}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border backdrop-blur-md shadow-md"
            style={{
              backgroundColor: `${cluster.accentColor}20`,
              borderColor: `${cluster.accentColor}50`,
              color: cluster.accentColor,
            }}
          >
            {cluster.badge}
          </span>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
            <Layers className="w-3 h-3 text-slate-400" />
            {cluster.slides.length} Slides
          </span>
        </div>

        <h3 className="text-base md:text-lg font-bold text-white group-hover:text-blue-300 transition-colors drop-shadow-md whitespace-nowrap">
          {cluster.title}
        </h3>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto line-clamp-1 group-hover:text-slate-300 transition-colors">
          {cluster.tagline}
        </p>
      </div>

      {/* Cluster Center Aura Anchor */}
      <div
        onClick={() => onSelectCluster(cluster)}
        className="pointer-events-auto cursor-pointer p-4 rounded-full backdrop-blur-lg border transition-all duration-500 hover:scale-110 shadow-2xl flex items-center justify-center group"
        style={{
          backgroundColor: `${cluster.accentColor}18`,
          borderColor: `${cluster.accentColor}40`,
        }}
      >
        <div
          className="p-3 rounded-full shadow-inner transition-transform group-hover:rotate-12 duration-300"
          style={{
            backgroundColor: `${cluster.accentColor}30`,
          }}
        >
          <DynamicIcon name={cluster.icon} className="w-8 h-8 text-white drop-shadow" />
        </div>
      </div>
    </div>
  );
};
