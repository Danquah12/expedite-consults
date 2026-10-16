"use client";

import React from "react";
import { SlideData } from "@/lib/types";
import { X, Mic, Clock, Sparkles, ArrowRight } from "lucide-react";

interface PresenterNotesProps {
  isOpen: boolean;
  onClose: () => void;
  slide?: SlideData;
  nextSlide?: SlideData;
  elapsedSeconds: number;
}

export const PresenterNotes: React.FC<PresenterNotesProps> = ({
  isOpen,
  onClose,
  slide,
  nextSlide,
  elapsedSeconds,
}) => {
  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-20 left-4 z-40 w-96 max-w-[calc(100vw-2rem)] select-text">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[460px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/90 border-b border-slate-700/60 select-none">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Presenter Teleprompter
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {slide ? (
            <>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  Current Slide:
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{slide.title}</h4>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 leading-relaxed space-y-2">
                <div className="text-[10px] font-mono text-emerald-400 font-semibold uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Speaking Cue & Executive Script
                </div>
                <p>{slide.presenterNotes}</p>
              </div>

              {nextSlide && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
                    Up Next <ArrowRight className="w-3 h-3 text-slate-400" />
                  </span>
                  <div className="text-xs font-semibold text-slate-300 mt-1 line-clamp-1">
                    {nextSlide.title}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Overview Canvas Active</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Select or fly into any cluster to view speaker notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
