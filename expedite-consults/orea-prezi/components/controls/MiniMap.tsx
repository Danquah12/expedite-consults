"use client";

import React, { useState } from "react";
import { ClusterData, CameraState } from "@/lib/types";
import { Map, ChevronUp, ChevronDown } from "lucide-react";

interface MiniMapProps {
  clusters: ClusterData[];
  camera: CameraState;
  onNavigate: (x: number, y: number, zoom?: number) => void;
  activeClusterId?: string;
  activeSlideId?: string;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  clusters,
  camera,
  onNavigate,
  activeClusterId,
  activeSlideId,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Map virtual canvas coordinates [-1600, 1600] x [-1200, 1400] to MiniMap size [160, 110]
  const mapWidth = 170;
  const mapHeight = 115;
  const canvasMinX = -1300;
  const canvasMaxX = 1300;
  const canvasMinY = -900;
  const canvasMaxY = 1200;

  const toMapX = (x: number) => {
    return ((x - canvasMinX) / (canvasMaxX - canvasMinX)) * mapWidth;
  };

  const toMapY = (y: number) => {
    return ((y - canvasMinY) / (canvasMaxY - canvasMinY)) * mapHeight;
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const virtX = canvasMinX + (clickX / mapWidth) * (canvasMaxX - canvasMinX);
    const virtY = canvasMinY + (clickY / mapHeight) * (canvasMaxY - canvasMinY);

    onNavigate(virtX, virtY, 1.2);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 select-none">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/60 cursor-pointer text-slate-300 hover:text-white"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-400">
            <Map className="w-3 h-3" />
            <span>Spatial Radar</span>
          </div>
          {collapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>

        {!collapsed && (
          <div className="p-2 bg-slate-950/70">
            <svg
              width={mapWidth}
              height={mapHeight}
              onClick={handleMapClick}
              className="bg-slate-950/90 rounded border border-slate-800/80 cursor-crosshair relative"
            >
              {/* Center origin crosshair */}
              <circle cx={toMapX(0)} cy={toMapY(-80)} r={3} fill="#38bdf8" fillOpacity={0.7} />

              {/* Cluster nodes */}
              {clusters.map((c) => {
                const cx = toMapX(c.x);
                const cy = toMapY(c.y);
                const isSelected = activeClusterId === c.id;

                return (
                  <g key={c.id}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 6 : 4}
                      fill={c.accentColor}
                      fillOpacity={isSelected ? 0.9 : 0.6}
                      stroke={isSelected ? "#ffffff" : "none"}
                      strokeWidth={1}
                    />

                    {/* Slides within cluster */}
                    {c.slides.map((s) => {
                      const sx = toMapX(s.x);
                      const sy = toMapY(s.y);
                      const isSlide = activeSlideId === s.id;
                      return (
                        <circle
                          key={s.id}
                          cx={sx}
                          cy={sy}
                          r={isSlide ? 3.5 : 2}
                          fill={isSlide ? "#ffffff" : c.accentColor}
                          fillOpacity={isSlide ? 1 : 0.4}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Viewport indicator camera box */}
              {(() => {
                const boxW = Math.max(25, 120 / (camera.zoom || 1));
                const boxH = Math.max(16, 75 / (camera.zoom || 1));
                const camX = toMapX(camera.x) - boxW / 2;
                const camY = toMapY(camera.y) - boxH / 2;

                return (
                  <rect
                    x={camX}
                    y={camY}
                    width={boxW}
                    height={boxH}
                    fill="rgba(56, 189, 248, 0.15)"
                    stroke="#38bdf8"
                    strokeWidth={1.2}
                    rx={2}
                    className="transition-all duration-300 pointer-events-none"
                  />
                );
              })()}
            </svg>
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-1 px-0.5">
              <span>Zoom: {(camera.zoom || 1).toFixed(2)}x</span>
              <span>Click to pan</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
