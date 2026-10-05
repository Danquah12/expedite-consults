"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Sliders,
  ThumbsUp,
  ThumbsDown,
  EyeOff,
  VolumeX,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users
} from "lucide-react";
import { AlgorithmExplanation } from "@/lib/recommendations/engine";

interface AlgorithmExplanationModalProps {
  isOpen: boolean;
  contentId: string | null;
  authorUsername?: string;
  onClose: () => void;
  onOpenPreferences: () => void;
  onTuneAlgorithm?: (action: string, meta?: any) => void;
}

export function AlgorithmExplanationModal({
  isOpen,
  contentId,
  authorUsername,
  onClose,
  onOpenPreferences,
  onTuneAlgorithm,
}: AlgorithmExplanationModalProps) {
  const [explanation, setExplanation] = useState<AlgorithmExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && contentId) {
      setIsLoading(true);
      fetch(`/api/v1/recommendations/explain?contentId=${contentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.explanation) setExplanation(data.explanation);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setExplanation(null);
      setActionNotice(null);
    }
  }, [isOpen, contentId]);

  if (!isOpen) return null;

  const handleAction = async (action: string, meta?: any) => {
    if (onTuneAlgorithm) onTuneAlgorithm(action, meta);

    if (action === "MORE") setActionNotice("🚀 Boosted this topic in your algorithm!");
    else if (action === "LESS") setActionNotice("📉 Reduced this topic in your algorithm.");
    else if (action === "NOT_INTERESTED") setActionNotice("🚫 We won't show this again.");
    else if (action === "MUTE_CREATOR") setActionNotice(`🔇 Muted @${authorUsername || "creator"}.`);
    else if (action === "MUTE_TOPIC") setActionNotice(`🔕 Muted topic #${meta}.`);

    // Report interaction to telemetry
    try {
      fetch("/api/v1/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          interactionType: action === "NOT_INTERESTED" ? "NOT_INTERESTED" : "CLICK",
          metadata: { action, ...meta },
        }),
      }).catch(() => {});
    } catch {}

    setTimeout(() => {
      setActionNotice(null);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#18191a] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100">
              <Sparkles className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Why am I seeing this?</h3>
              <p className="text-[11px] text-zinc-400">Feed ranking & topic transparency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {actionNotice && (
            <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-zinc-200 font-medium text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>{actionNotice}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Loading recommendations context...</span>
            </div>
          ) : (
            <>
              {/* Primary Reason */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-1.5">
                <span className="text-[10px] font-semibold uppercase text-zinc-400 tracking-wider">Primary Reason</span>
                <p className="text-sm font-medium text-zinc-100 leading-snug">
                  {explanation?.primaryReason || "Recommended based on topics you follow and campus interactions."}
                </p>
              </div>

              {/* Matched Topics & Affinity Bars */}
              {explanation?.matchedTopics && explanation.matchedTopics.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                    <span>Topic Relevance</span>
                    <span className="text-zinc-300 font-mono">{explanation.recommendationScore}% Match</span>
                  </div>

                  <div className="space-y-2">
                    {explanation.matchedTopics.map((topic) => (
                      <div key={topic.name} className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">#{topic.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-zinc-400 rounded-full"
                              style={{ width: `${Math.min(100, topic.userAffinityScore)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-zinc-400 w-8 text-right">{topic.userAffinityScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Signals */}
              {explanation?.socialSignals && explanation.socialSignals.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-zinc-400">Network Activity</span>
                  {explanation.socialSignals.map((sig, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900/40 px-3 py-2 rounded-xl border border-zinc-800/60">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{sig.description}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct Algorithmic Controls */}
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <span className="text-[11px] font-semibold text-zinc-400">Feedback</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAction("MORE")}
                    className="flex items-center justify-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Show more like this</span>
                  </button>
                  <button
                    onClick={() => handleAction("LESS")}
                    className="flex items-center justify-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition"
                  >
                    <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                    <span>Show less like this</span>
                  </button>
                  <button
                    onClick={() => handleAction("NOT_INTERESTED")}
                    className="flex items-center justify-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold transition"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Not interested</span>
                  </button>
                  <button
                    onClick={() => handleAction("MUTE_CREATOR")}
                    className="flex items-center justify-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold transition"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Mute author</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-medium">You control your feed</span>
          <button
            onClick={() => {
              onClose();
              onOpenPreferences();
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Feed Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}
