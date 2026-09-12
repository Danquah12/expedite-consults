"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Loader2, Sparkles, AlertCircle, Settings2 } from "lucide-react";
import { useHumanVoice, OPENAI_VOICES } from "@/lib/truth-platform/useHumanVoice";

interface HumanVoicePlayerProps {
  textToRead: string;
  label?: string;
  sublabel?: string;
  compact?: boolean;
  className?: string;
}

export function HumanVoicePlayer({
  textToRead,
  label = "Listen in True Human Voice (OpenAI HD)",
  sublabel = "Neural Voice Synthesis with authentic human intonation",
  compact = false,
  className = "",
}: HumanVoicePlayerProps) {
  const {
    speak,
    stop,
    isPlaying,
    isLoading,
    selectedVoice,
    setSelectedVoice,
    playbackSpeed,
    setPlaybackSpeed,
    errorMessage,
  } = useHumanVoice();

  const [showSettings, setShowSettings] = useState(false);

  const handleToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(textToRead);
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
            isPlaying
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20 animate-pulse"
              : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500"
          }`}
          title="Play in True Human Voice (OpenAI HD)"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : isPlaying ? (
            <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{isLoading ? "Generating..." : isPlaying ? "Stop Audio" : "Listen (HD Voice)"}</span>
        </button>

        {errorMessage && (
          <span className="text-[11px] text-amber-400 font-mono" title={errorMessage}>
            ⚠️ {errorMessage.slice(0, 45)}...
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-emerald-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/30 p-4 backdrop-blur-md shadow-lg shadow-black/40 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-wide">{label}</h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {selectedVoice} HD
              </span>
            </div>
            <p className="text-xs text-slate-400">{sublabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-xs flex items-center gap-1"
            title="Audio Voice & Speed Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
              isPlaying
                ? "bg-red-600 hover:bg-red-500 text-white shadow-red-900/30"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Voice...</span>
              </>
            ) : isPlaying ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Play Live Voice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Select Human Voice Model:
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {OPENAI_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.gender}) — {v.desc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Playback Cadence / Speed:
            </label>
            <div className="flex items-center gap-1.5">
              {[0.85, 1.0, 1.15, 1.3].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                    playbackSpeed === speed
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="font-bold">Notice regarding OpenAI Voice API:</p>
            <p className="text-[11px] text-amber-200/90">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
