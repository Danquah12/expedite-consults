"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Loader2,
  CheckCircle2,
  FileCheck,
  Lock,
} from "lucide-react";
import type { VeritasScanResult } from "@/types";

interface VeritasLensModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl?: string;
  caption?: string;
}

export function VeritasLensModal({
  isOpen,
  onClose,
  mediaUrl,
  caption,
}: VeritasLensModalProps) {
  const [result, setResult] = useState<VeritasScanResult | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/veritaslens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaUrl, textClaim: caption }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleStartScan = () => {
    mutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#111827] border border-[#1e2a3a] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2a3a]">
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#f9fafb] transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 font-bold text-sm text-[#f9fafb]">
            <ShieldCheck size={18} className="text-[#00d4ff]" />
            <span>VeritasLens AI & Deepfake Inspection</span>
          </div>
          <div className="w-5" />
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Media/Claim Preview */}
          <div className="bg-[#161924] border border-[#1c202e] rounded-2xl p-4 flex gap-4 items-center">
            {mediaUrl && (
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-zinc-900 border border-[#1c202e] flex-shrink-0">
                <img src={mediaUrl} alt="Inspection target" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white mb-1 truncate">
                Target: {mediaUrl ? "Media Provenance Scan" : "Text Claim Verification"}
              </p>
              <p className="text-xs text-[#94a3b8] line-clamp-2">
                {caption || mediaUrl || "Ready to run deepfake and cryptographic metadata inspection."}
              </p>
            </div>
          </div>

          {!result && !mutation.isPending && (
            <div className="text-center py-6 space-y-4">
              <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
                VeritasLens runs neural artifact analysis, camera sensor EXIF provenance hashing, and C2PA trust seals.
              </p>
              <button
                onClick={handleStartScan}
                className="px-6 py-2.5 rounded-full bg-[#00d4ff] text-[#0a0f1e] text-xs font-bold shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:bg-[#00bce0] transition-all"
              >
                Run VeritasLens Inspection
              </button>
            </div>
          )}

          {mutation.isPending && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 size={32} className="text-[#00d4ff] animate-spin" />
              <p className="text-xs font-bold text-[#00d4ff]">
                Scanning frequency spectrum & camera sensor telemetry...
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Score Gauges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#161924] border border-[#1c202e] rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider">Deepfake Risk</p>
                  <p
                    className={`text-2xl font-black mt-1 ${
                      result.deepfakeProbability < 20 ? "text-[#10b981]" : "text-[#ef4444]"
                    }`}
                  >
                    {result.deepfakeProbability.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">
                    {result.deepfakeProbability < 20 ? "Low / Natural Optical" : "Synthetic Manipulation"}
                  </p>
                </div>

                <div className="bg-[#161924] border border-[#1c202e] rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider">Metadata Trust</p>
                  <p className="text-2xl font-black mt-1 text-[#00d4ff]">
                    {result.metadataIntegrity.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">C2PA Hardware Enclave</p>
                </div>
              </div>

              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  result.isAuthentic
                    ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]"
                    : "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"
                }`}
              >
                {result.isAuthentic ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                <div>
                  <p className="text-xs font-bold">
                    Verdict: {result.factCheckStatus}
                  </p>
                  <p className="text-[11px] text-white/80 mt-1 leading-relaxed">
                    {result.claims[0]?.explanation}
                  </p>
                </div>
              </div>

              {/* Signature Proof */}
              <div className="p-3 bg-[#0d0f17] border border-[#1c202e] rounded-xl flex items-center justify-between text-[11px] font-mono text-[#64748b]">
                <span className="flex items-center gap-1.5 text-[#00d4ff]">
                  <Lock size={12} />
                  Veritas Signature:
                </span>
                <span className="truncate max-w-[200px]">{result.signatureHash}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
