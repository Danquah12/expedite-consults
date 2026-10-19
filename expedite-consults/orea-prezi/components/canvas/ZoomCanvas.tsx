"use client";

import React, { useRef, useState } from "react";
import { ClusterData, SlideData, CameraState } from "@/lib/types";
import { ConstellationLines } from "./ConstellationLines";
import { CenterBeacon } from "./CenterBeacon";
import { ClusterNode } from "./ClusterNode";
import { SlideCard } from "./SlideCard";

interface ZoomCanvasProps {
  clusters: ClusterData[];
  camera: CameraState;
  activeClusterId?: string;
  activeSlideId?: string;
  isOverview: boolean;
  onSelectCluster: (cluster: ClusterData) => void;
  onSelectSlide: (slide: SlideData) => void;
  onNextSlide: () => void;
  onOverview: () => void;
  onUpdateCamera: (camera: CameraState) => void;
}

export const ZoomCanvas: React.FC<ZoomCanvasProps> = ({
  clusters,
  camera,
  activeClusterId,
  activeSlideId,
  isOverview,
  onSelectCluster,
  onSelectSlide,
  onNextSlide,
  onOverview,
  onUpdateCamera,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; camX: number; camY: number }>({
    mouseX: 0,
    mouseY: 0,
    camX: 0,
    camY: 0,
  });

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on canvas background, not on interactive cards or buttons
    if ((e.target as HTMLElement).closest("button, input, a, .pointer-events-auto")) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      camX: camera.x,
      camY: camera.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = (e.clientX - dragStartRef.current.mouseX) / camera.zoom;
    const deltaY = (e.clientY - dragStartRef.current.mouseY) / camera.zoom;

    onUpdateCamera({
      ...camera,
      x: dragStartRef.current.camX - deltaX,
      y: dragStartRef.current.camY - deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel Zoom support
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.min(Math.max(camera.zoom * zoomFactor, 0.15), 2.8);

    onUpdateCamera({
      ...camera,
      zoom: newZoom,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full h-full overflow-hidden select-none bg-[#070a13] ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* Parallax Starfield & Cyber Grid Background */}
      <div
        className="absolute inset-[-100%] pointer-events-none bg-grid-pattern opacity-25"
        style={{
          transform: `translate3d(${-camera.x * 0.1}px, ${-camera.y * 0.1}px, 0)`,
          transition: isDragging ? "none" : "transform 850ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Ambient Radial Vignette & Cosmic Glow */}
      <div className="absolute inset-0 pointer-events-none bg-radial-vignette" />

      {/* Ambient Nebula Blobs */}
      <div
        className="absolute w-[1100px] h-[1100px] rounded-full blur-[160px] pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          left: "20%",
          top: "10%",
          transform: `translate3d(${-camera.x * 0.05}px, ${-camera.y * 0.05}px, 0)`,
        }}
      />
      <div
        className="absolute w-[1000px] h-[1000px] rounded-full blur-[160px] pointer-events-none opacity-15"
        style={{
          background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
          right: "15%",
          bottom: "10%",
          transform: `translate3d(${-camera.x * 0.05}px, ${-camera.y * 0.05}px, 0)`,
        }}
      />

      {/* Master 2D/3D Transform Plane */}
      <div
        className="absolute top-0 left-0 w-full h-full transform-gpu"
        style={{
          transformOrigin: "0 0",
          transform: `translate3d(calc(50vw - ${camera.x * camera.zoom}px), calc(50vh - ${
            camera.y * camera.zoom
          }px), 0) scale(${camera.zoom})`,
          transition: isDragging ? "none" : "transform 900ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Constellation Link Arcs */}
        <ConstellationLines
          clusters={clusters}
          activeClusterId={activeClusterId}
          activeSlideId={activeSlideId}
        />

        {/* Center Nexus / Master Beacon */}
        <CenterBeacon onStartTour={onNextSlide} isOverview={isOverview} />

        {/* Cluster Constellation Planets with Interactive Capsules */}
        {clusters.map((cluster) => (
          <ClusterNode
            key={cluster.id}
            cluster={cluster}
            isActive={activeClusterId === cluster.id}
            onSelectCluster={onSelectCluster}
            onSelectSlide={onSelectSlide}
          />
        ))}

        {/* Individual Slide Cards - Rendered only when zoomed into a topic */}
        {!isOverview &&
          clusters.flatMap((cluster) =>
            cluster.slides.map((slide) => {
              const isActive = activeSlideId === slide.id;
              const isSibling = activeClusterId === cluster.id;
              return (
                <SlideCard
                  key={slide.id}
                  slide={slide}
                  isActive={isActive}
                  isVisible={isActive || isSibling}
                  onFocus={() => onSelectSlide(slide)}
                  onNext={onNextSlide}
                  onOverview={onOverview}
                  accentColor={cluster.accentColor}
                />
              );
            })
          )}
      </div>
    </div>
  );
};
