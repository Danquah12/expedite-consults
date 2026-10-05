"use client";

import { useState, useEffect } from "react";
import {
  Sliders,
  X,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  VolumeX,
  Check,
  Zap,
  Lock
} from "lucide-react";
import { UserAlgorithmControls } from "@/lib/recommendations/engine";

interface AlgorithmPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function AlgorithmPreferencesModal({
  isOpen,
  onClose,
  onSaved,
}: AlgorithmPreferencesModalProps) {
  const [controls, setControls] = useState<UserAlgorithmControls>({
    topicSliders: {
      Cybersecurity: 85,
      "AI Protocols": 80,
      "Campus & Web3": 75,
      Career: 70,
      "Robotics & Dev": 65,
      Entertainment: 50,
      Sports: 40,
    },
    mutedTopics: [],
    mutedCreators: [],
    engagementThreshold: "balanced",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/v1/recommendations/preferences?userId=kwesi")
        .then((res) => res.json())
        .then((data) => {
          if (data.preferences) setControls(data.preferences);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSliderChange = (topic: string, val: number) => {
    setControls((prev) => ({
      ...prev,
      topicSliders: {
        ...prev.topicSliders,
        [topic]: val,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/recommendations/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "kwesi",
          ...controls,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        if (onSaved) onSaved();
        setTimeout(() => {
          setSavedSuccess(false);
          onClose();
        }, 1200);
      }
    } catch {
      // offline fallback
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setControls({
      topicSliders: {
        Cybersecurity: 85,
        "AI Protocols": 80,
        "Campus & Web3": 75,
        Career: 70,
        "Robotics & Dev": 65,
        Entertainment: 50,
        Sports: 40,
      },
      mutedTopics: [],
      mutedCreators: [],
      engagementThreshold: "balanced",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#18191a] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Sovereign Algorithm Preferences</h3>
              <p className="text-[11px] text-zinc-400">Directly weight what SpheraNet ranks on your feed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 font-bold text-xs flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4" />
              <span>Algorithm weights saved to PostgreSQL sovereign profile!</span>
            </div>
          )}

          {/* Topic Sliders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-zinc-300 tracking-wider">Topic Interest Weights</span>
              <span className="text-[11px] text-cyan-400 font-semibold">0% (Hidden) to 100% (High Priority)</span>
            </div>

            <div className="space-y-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
              {Object.entries(controls.topicSliders).map(([topic, value]) => (
                <div key={topic} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-200">{topic}</span>
                    <span className="font-mono font-black text-cyan-400">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => handleSliderChange(topic, parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Threshold */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-zinc-300 tracking-wider">Feed Discovery Mode</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "balanced", label: "⚖️ Balanced", desc: "Equal mix of friends & discovery" },
                { key: "viral_only", label: "🔥 Top Trending", desc: "Collegiate high-velocity posts" },
                { key: "niche_specialized", label: "🎯 Deep Niche", desc: "Specialized research & hackathons" },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setControls((p) => ({ ...p, engagementThreshold: mode.key as any }))}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                    controls.engagementThreshold === mode.key
                      ? "bg-cyan-500/10 border-cyan-500 text-white"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-xs font-black">{mode.label}</span>
                  <span className="text-[10px] text-zinc-500 leading-tight">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Apply Preferences"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
