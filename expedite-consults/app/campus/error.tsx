"use client";

import React, { useEffect } from "react";
import { resetCampusDemoData } from "@/lib/campus-storage";
import { RotateCcw, Sparkles } from "lucide-react";

export default function CampusErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CampusSync Caught Runtime Error:", error);
  }, [error]);

  const handleResetStorage = () => {
    try {
      resetCampusDemoData();
      localStorage.clear();
      window.location.reload();
    } catch (_) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-3xl text-amber-400">
          ⚡
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">TowsonSync Campus Hub</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A cached client state mismatch occurred in your browser's local cache. Click below to auto-heal and reload with clean cloud state.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleResetStorage}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black py-3 rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Auto-Heal & Reload TowsonSync</span>
          </button>

          <button
            onClick={() => reset()}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Try Again</span>
          </button>
        </div>

        <span className="text-[10px] text-slate-500 font-mono block">
          Error: {error?.message || "Storage State Desync"}
        </span>
      </div>
    </div>
  );
}
