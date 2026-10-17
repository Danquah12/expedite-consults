"use client";

import React from "react";
import { X, Keyboard } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Space / →", desc: "Advance to next slide" },
    { key: "←", desc: "Return to previous slide" },
    { key: "Esc / O", desc: "Zoom out to overview map" },
    { key: "F", desc: "Toggle Fullscreen mode" },
    { key: "N", desc: "Toggle Presenter Notes teleprompter" },
    { key: "M", desc: "Mute / Unmute presentation sound FX" },
    { key: "P", desc: "Toggle Auto-advance playback" },
    { key: "Click + Drag", desc: "Pan infinite canvas freely" },
    { key: "Mouse Wheel", desc: "Continuous smooth spatial zoom" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Presentation Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-800/40 text-xs"
            >
              <span className="text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-400 shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-950/70 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-lg shadow-blue-600/30"
          >
            Got it, Let&apos;s Present!
          </button>
        </div>
      </div>
    </div>
  );
};
