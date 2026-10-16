"use client";

import React from "react";
import { usePresentation } from "@/lib/use-presentation";
import { ZoomCanvas } from "@/components/canvas/ZoomCanvas";
import { PresenterControls } from "@/components/controls/PresenterControls";
import { MiniMap } from "@/components/controls/MiniMap";
import { PresenterNotes } from "@/components/controls/PresenterNotes";
import { SlideDrawer } from "@/components/controls/SlideDrawer";
import { HelpModal } from "@/components/controls/HelpModal";

export default function PresentationPage() {
  const {
    clusters,
    totalSlides,
    currentSlideIndex,
    activeSlide,
    nextSlide,
    activeCluster,
    camera,
    setCamera,
    isOverview,
    isPlaying,
    isMuted,
    isFullscreen,
    showNotes,
    showDrawer,
    showHelp,
    elapsedSeconds,
    goToSlide,
    onNext,
    onPrev,
    goToOverview,
    goToCluster,
    triggerConfetti,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    toggleNotes,
    toggleDrawer,
    openHelp,
    closeHelp,
  } = usePresentation();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#070a13] text-slate-100 font-sans">
      {/* 2D/3D Infinite Spatial Zoom Canvas */}
      <ZoomCanvas
        clusters={clusters}
        camera={camera}
        activeClusterId={activeCluster?.id}
        activeSlideId={activeSlide?.id}
        isOverview={isOverview}
        onSelectCluster={goToCluster}
        onSelectSlide={(slide) => {
          const idx = clusters.flatMap((c) => c.slides).findIndex((s) => s.id === slide.id);
          if (idx !== -1) goToSlide(idx);
        }}
        onNextSlide={onNext}
        onOverview={goToOverview}
        onUpdateCamera={setCamera}
      />

      {/* Top Header & Bottom Navigation Floating HUDs */}
      <PresenterControls
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlides}
        activeSlide={activeSlide}
        isOverview={isOverview}
        isPlaying={isPlaying}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        showNotes={showNotes}
        onPrev={onPrev}
        onNext={onNext}
        onOverview={goToOverview}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onToggleFullscreen={toggleFullscreen}
        onToggleNotes={toggleNotes}
        onToggleDrawer={toggleDrawer}
        onOpenHelp={openHelp}
        onTriggerConfetti={triggerConfetti}
        onJumpToSlideIndex={goToSlide}
      />

      {/* Spatial Radar MiniMap */}
      <MiniMap
        clusters={clusters}
        camera={camera}
        onNavigate={(x, y, zoom) => setCamera({ x, y, zoom: zoom ?? 1.2 })}
        activeClusterId={activeCluster?.id}
        activeSlideId={activeSlide?.id}
      />

      {/* Presenter Teleprompter Notes Drawer */}
      <PresenterNotes
        isOpen={showNotes}
        onClose={toggleNotes}
        slide={activeSlide}
        nextSlide={nextSlide}
        elapsedSeconds={elapsedSeconds}
      />

      {/* Slide / Cluster Directory Drawer */}
      <SlideDrawer
        isOpen={showDrawer}
        onClose={toggleDrawer}
        clusters={clusters}
        activeSlideId={activeSlide?.id}
        onSelectSlide={(slide) => {
          const idx = clusters.flatMap((c) => c.slides).findIndex((s) => s.id === slide.id);
          if (idx !== -1) goToSlide(idx);
        }}
        onSelectCluster={goToCluster}
        onOverview={goToOverview}
      />

      {/* Keyboard Shortcuts Help Dialog */}
      <HelpModal isOpen={showHelp} onClose={closeHelp} />
    </main>
  );
}
