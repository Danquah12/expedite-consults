"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Layers,
  HelpCircle,
  FileText,
  Compass,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { SlideData } from "@/lib/types";

interface PresenterControlsProps {
  currentSlideIndex: number;
  totalSlides: number;
  activeSlide?: SlideData;
  isOverview: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  showNotes: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOverview: () => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleNotes: () => void;
  onToggleDrawer: () => void;
  onOpenHelp: () => void;
  onTriggerConfetti: () => void;
  onJumpToSlideIndex: (idx: number) => void;
}

export const PresenterControls: React.FC<PresenterControlsProps> = ({
  currentSlideIndex,
  totalSlides,
  activeSlide,
  isOverview,
  isPlaying,
  isMuted,
  isFullscreen,
  showNotes,
  onPrev,
  onNext,
  onOverview,
  onTogglePlay,
  onToggleMute,
  onToggleFullscreen,
  onToggleNotes,
  onToggleDrawer,
  onOpenHelp,
  onTriggerConfetti,
  onJumpToSlideIndex,
}) => {
  return (
    <>
      {/* Top Floating Header HUD */}
      <header className="fixed top-4 inset-x-4 md:inset-x-8 z-40 flex items-center justify-between pointer-events-none">
        {/* Brand & Location */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div
            onClick={onOverview}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl cursor-pointer hover:border-blue-500/50 transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-white text-xs shadow-md">
              O
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                OREA-PREZI
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {isOverview ? "Overview Constellation" : `Node ${currentSlideIndex + 1} of ${totalSlides}`}
              </div>
            </div>
          </div>

          {activeSlide && !isOverview && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs text-slate-300">
              <span className="font-mono text-cyan-400">{activeSlide.kicker}</span>
              <span className="text-slate-600">/</span>
              <span className="font-medium text-white truncate max-w-xs">{activeSlide.title}</span>
            </div>
          )}
        </div>

        {/* Top Control Tools */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl pointer-events-auto">
          {/* Autoplay Toggle */}
          <button
            onClick={onTogglePlay}
            className={`p-2 rounded-lg text-xs transition-colors flex items-center gap-1 ${
              isPlaying
                ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title={isPlaying ? "Pause autoplay (P)" : "Start autoplay (P)"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-emerald-400" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg text-xs transition-colors ${
              isMuted
                ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                : "text-cyan-400 hover:bg-slate-800"
            }`}
            title={isMuted ? "Unmute audio (M)" : "Mute audio (M)"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Presenter Notes Toggle */}
          <button
            onClick={onToggleNotes}
            className={`p-2 rounded-lg text-xs transition-colors ${
              showNotes
                ? "bg-blue-600/30 text-blue-400 border border-blue-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Toggle speaker teleprompter notes (N)"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Slide Drawer Outline */}
          <button
            onClick={onToggleDrawer}
            className="p-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Browse all slides & clusters"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle fullscreen (F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Help Modal Toggle */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Presentation keyboard shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Bottom Floating Navigation Dock */}
      <footer className="fixed bottom-4 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-40 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 shadow-2xl pointer-events-auto">
          {/* Previous Button */}
          <button
            onClick={onPrev}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors active:scale-95 disabled:opacity-40"
            disabled={currentSlideIndex <= 0 && isOverview}
            title="Previous node (Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Overview Reset Button */}
          <button
            onClick={onOverview}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isOverview
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Zoom to Macro Overview (Esc)"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          {/* Interactive Slide Progress Track */}
          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const isCurrent = !isOverview && currentSlideIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => onJumpToSlideIndex(idx)}
                  className={`h-2 transition-all rounded-full ${
                    isCurrent
                      ? "w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      : "w-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={`Jump to Slide ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={onNext}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
            title="Next node (Space / Right Arrow)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Celebration / Confetti Button */}
          <button
            onClick={onTriggerConfetti}
            className="p-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors active:scale-95"
            title="Celebrate Milestone!"
          >
            <PartyPopper className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </>
  );
};
