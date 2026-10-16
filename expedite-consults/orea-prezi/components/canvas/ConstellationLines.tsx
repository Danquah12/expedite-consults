"use client";

import React from "react";
import { ClusterData } from "@/lib/types";

interface ConstellationLinesProps {
  clusters: ClusterData[];
  activeClusterId?: string;
  activeSlideId?: string;
}

export const ConstellationLines: React.FC<ConstellationLinesProps> = ({
  clusters,
  activeClusterId,
  activeSlideId,
}) => {
  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible z-0"
      style={{
        width: 1,
        height: 1,
      }}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Center Gradient */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Center Beacon Ambient Ring */}
      <circle cx={0} cy={-80} r={420} fill="none" stroke="#38bdf815" strokeWidth={1} strokeDasharray="4 8" />
      <circle cx={0} cy={-80} r={720} fill="none" stroke="#818cf812" strokeWidth={1} strokeDasharray="6 12" />

      {/* Lines from Center to each Cluster */}
      {clusters.map((cluster) => {
        const isClusterActive = activeClusterId === cluster.id;
        const color = cluster.accentColor || "#38bdf8";

        return (
          <g key={cluster.id}>
            {/* Trunk line from Center to Cluster */}
            <line
              x1={0}
              y1={-80}
              x2={cluster.x}
              y2={cluster.y}
              stroke={color}
              strokeWidth={isClusterActive ? 2.5 : 1.2}
              strokeOpacity={isClusterActive ? 0.8 : 0.22}
              strokeDasharray={isClusterActive ? "none" : "6 6"}
              filter={isClusterActive ? "url(#glow-line)" : undefined}
            />

            {/* Orbit paths from Cluster Center to its child Slides */}
            {cluster.slides.map((slide) => {
              const isSlideActive = activeSlideId === slide.id;
              return (
                <line
                  key={slide.id}
                  x1={cluster.x}
                  y1={cluster.y}
                  x2={slide.x}
                  y2={slide.y}
                  stroke={color}
                  strokeWidth={isSlideActive ? 2.5 : 1}
                  strokeOpacity={isSlideActive ? 0.9 : 0.3}
                  strokeDasharray="4 4"
                  filter={isSlideActive ? "url(#glow-line)" : undefined}
                />
              );
            })}
          </g>
        );
      })}

      {/* Ring interconnecting all clusters in sequence */}
      {clusters.map((cluster, idx) => {
        const nextCluster = clusters[(idx + 1) % clusters.length];
        return (
          <line
            key={`ring-${cluster.id}`}
            x1={cluster.x}
            y1={cluster.y}
            x2={nextCluster.x}
            y2={nextCluster.y}
            stroke="#64748b"
            strokeWidth={0.8}
            strokeOpacity={0.15}
            strokeDasharray="8 8"
          />
        );
      })}
    </svg>
  );
};
