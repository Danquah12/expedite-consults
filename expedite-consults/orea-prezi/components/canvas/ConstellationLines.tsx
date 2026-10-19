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
      </defs>

      {/* Center Beacon Ambient Concentric Rings */}
      <circle cx={0} cy={0} r={520} fill="none" stroke="#38bdf818" strokeWidth={1} strokeDasharray="6 8" />
      <circle cx={0} cy={0} r={1150} fill="none" stroke="#818cf812" strokeWidth={1} strokeDasharray="8 12" />
      <circle cx={0} cy={0} r={1900} fill="none" stroke="#38bdf810" strokeWidth={1} strokeDasharray="10 16" />

      {/* Trunk lines from Center (0,0) to each Cluster */}
      {clusters.map((cluster) => {
        const isClusterActive = activeClusterId === cluster.id;
        const color = cluster.accentColor || "#38bdf8";

        return (
          <g key={cluster.id}>
            <line
              x1={0}
              y1={0}
              x2={cluster.x}
              y2={cluster.y}
              stroke={color}
              strokeWidth={isClusterActive ? 3 : 1.2}
              strokeOpacity={isClusterActive ? 0.85 : 0.25}
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
                  strokeOpacity={isSlideActive ? 0.9 : 0.25}
                  strokeDasharray="4 4"
                  filter={isSlideActive ? "url(#glow-line)" : undefined}
                />
              );
            })}
          </g>
        );
      })}

      {/* Hexagonal Outer Perimeter Link uniting all clusters */}
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
            strokeWidth={1}
            strokeOpacity={0.2}
            strokeDasharray="8 8"
          />
        );
      })}
    </svg>
  );
};
