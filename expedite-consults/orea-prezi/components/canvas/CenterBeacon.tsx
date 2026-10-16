"use client";

import React from "react";
import { Sparkles, Play, Shield, Globe, Award } from "lucide-react";

interface CenterBeaconProps {
  onStartTour: () => void;
  isOverview: boolean;
}

export const CenterBeacon: React.FC<CenterBeaconProps> = ({ onStartTour, isOverview }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: -80,
        transform: "translate(-50%, -50%)",
        width: 680,
      }}
      className={`text-center pointer-events-auto transition-all duration-700 ${
        isOverview ? "opacity-100 scale-100" : "opacity-25 scale-90"
      }`}
    >
      {/* Outer Pulse Circles */}
      <div className="relative inline-block mb-4">
        <div className="absolute -inset-6 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        <div className="absolute -inset-12 rounded-full bg-cyan-500/10 blur-2xl" />

        <div className="relative px-6 py-2 rounded-full border border-blue-400/40 bg-slate-900/90 backdrop-blur-xl shadow-2xl inline-flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
            OREA STRATEGIC HORIZON
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-300 font-mono">2026-2028 BLUEPRINT</span>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight leading-tight mb-3">
        Ontario Real Estate Modernization
      </h1>

      <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-6">
        Next-Generation Prezi spatial architecture connecting 100,000+ Ontario Realtors with Standard Forms 2.0, Unified MLS Data Fabric, and Responsible OreaAI.
      </p>

      {/* Start Tour CTA */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onStartTour}
          className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all transform hover:-translate-y-0.5"
        >
          <Play className="w-4 h-4 fill-white transition-transform group-hover:scale-110" />
          <span>Launch Presentation Tour</span>
        </button>
      </div>

      {/* High-level trust badges */}
      <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>TRESA Certified</span>
        </div>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>34 Member Boards</span>
        </div>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-purple-400" />
          <span>102K+ Realtors</span>
        </div>
      </div>
    </div>
  );
};
