"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lock,
  Search,
  Upload,
  Globe,
  Camera,
  Activity,
  Award,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { VeritasScanResult } from "@/types";

const sampleTargets = [
  {
    label: "Authentic Hardware Photo",
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    claim: "Unedited optical capture on Sony Alpha 7 IV with C2PA hardware enclave signature.",
  },
  {
    label: "Synthetic Face / Deepfake",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    claim: "AI-generated face synthesis with GAN boundary high-frequency noise.",
  },
  {
    label: "Viral Breaking Claim",
    url: "",
    claim: "Sphera platform integrates zero-trust cryptographic verification across all campus communities.",
  },
];

export default function VeritasLensStudioPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [inputText, setInputText] = useState("");
  const [scanResult, setScanResult] = useState<VeritasScanResult | null>(null);

  const scanMutation = useMutation({
    mutationFn: async (payload: { mediaUrl?: string; textClaim?: string }) => {
      const res = await fetch("/api/ai/veritaslens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as VeritasScanResult;
    },
    onSuccess: (data) => {
      setScanResult(data);
    },
  });

  const handleScan = (url?: string, text?: string) => {
    const targetUrl = url !== undefined ? url : inputUrl.trim();
    const targetText = text !== undefined ? text : inputText.trim();

    if (!targetUrl && !targetText) return;

    scanMutation.mutate({
      mediaUrl: targetUrl || undefined,
      textClaim: targetText || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-white p-6 md:p-10 flex flex-col items-center">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="w-full max-w-5xl flex items-center justify-between border-b border-[#1c202e] pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[#00d4ff] flex items-center justify-center text-[#08090d] shadow-[0_0_20px_rgba(0,212,255,0.4)]">
            <ShieldCheck size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">VeritasLens Intelligence Studio</h1>
              <span className="text-[10px] font-black text-[#00d4ff] bg-[#00d4ff]/15 px-2 py-0.5 rounded-full border border-[#00d4ff]/30">
                PROVENANCE CORE
              </span>
            </div>
            <p className="text-xs text-[#94a3b8]">Real-time deepfake detection, synthetic artifact scanning & fact-checking</p>
          </div>
        </div>

        <Link
          href="/feed"
          className="text-xs font-bold text-[#00d4ff] hover:underline flex items-center gap-1"
        >
          Return to Sphera →
        </Link>
      </div>

      {/* ── Inspection Control Panel ──────────────────────────────── */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form & Sample Targets (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#10121a] border border-[#1c202e] rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Search size={16} className="text-[#00d4ff]" />
              Target Inspection Workbench
            </h2>

            {/* Media URL Input */}
            <div>
              <label className="block text-xs font-bold text-[#9ca3af] mb-1.5">
                Image or Media URL
              </label>
              <input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://.../photo.jpg"
                className="w-full h-10 px-3.5 rounded-xl border border-[#1c202e] bg-[#161924] text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff]"
              />
            </div>

            {/* Claim Text Input */}
            <div>
              <label className="block text-xs font-bold text-[#9ca3af] mb-1.5">
                Claim Text or Statement
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste any factual claim or caption to cross-examine..."
                rows={3}
                className="w-full p-3 rounded-xl border border-[#1c202e] bg-[#161924] text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] resize-none"
              />
            </div>

            {/* Trigger Button */}
            <button
              onClick={() => handleScan()}
              disabled={(!inputUrl.trim() && !inputText.trim()) || scanMutation.isPending}
              className="w-full h-11 rounded-2xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] text-xs font-black flex items-center justify-center gap-2 disabled:opacity-40 hover:scale-[1.01] transition-transform shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            >
              {scanMutation.isPending ? (
                <Loader2 size={16} className="animate-spin text-[#08090d]" />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Execute Neural & Cryptographic Scan</span>
                </>
              )}
            </button>
          </div>

          {/* Sample Presets */}
          <div className="bg-[#10121a] border border-[#1c202e] rounded-3xl p-6 space-y-3">
            <h3 className="text-xs font-black text-[#9ca3af] uppercase tracking-wider">
              Quick Test Verification Targets
            </h3>
            <div className="space-y-2">
              {sampleTargets.map((st, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setInputUrl(st.url);
                    setInputText(st.claim);
                    handleScan(st.url, st.claim);
                  }}
                  className="p-3 rounded-2xl bg-[#161924] border border-[#1c202e] hover:border-[#00d4ff] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-[#00d4ff]">{st.label}</p>
                    <p className="text-[11px] text-[#64748b] line-clamp-1">{st.claim}</p>
                  </div>
                  <ArrowRight size={14} className="text-[#64748b] group-hover:text-[#00d4ff] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Results Display (7 cols) */}
        <div className="lg:col-span-7">
          {scanMutation.isPending && (
            <div className="h-full min-h-[420px] bg-[#10121a] border border-[#1c202e] rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-[#00d4ff]/20 border-t-[#00d4ff] animate-spin" />
                <Activity size={28} className="text-[#00d4ff] absolute inset-0 m-auto" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Analyzing Neural Boundary Frequencies</h3>
                <p className="text-xs text-[#94a3b8] mt-1">Cross-referencing C2PA hardware provenance enclave...</p>
              </div>
            </div>
          )}

          {!scanResult && !scanMutation.isPending && (
            <div className="h-full min-h-[420px] bg-[#10121a] border border-[#1c202e] rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-center">
              <ShieldCheck size={48} className="text-[#64748b]" />
              <h3 className="text-sm font-bold text-white">No Target Inspected Yet</h3>
              <p className="text-xs text-[#64748b] max-w-sm">
                Select a preset or enter a media URL to view synthetic artifact telemetry and provenance verification certificates.
              </p>
            </div>
          )}

          {scanResult && !scanMutation.isPending && (
            <div className="bg-[#10121a] border border-[#1c202e] rounded-3xl p-7 space-y-6 shadow-2xl animate-in fade-in duration-300">
              {/* Top Score Dashboard */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#161924] border border-[#1c202e] rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-[#64748b] font-black uppercase tracking-wider">Deepfake Risk Probability</p>
                  <p
                    className={`text-3xl font-black mt-1 ${
                      scanResult.deepfakeProbability < 20 ? "text-[#10b981]" : "text-[#ef4444]"
                    }`}
                  >
                    {scanResult.deepfakeProbability.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-[#9ca3af] mt-1">
                    {scanResult.deepfakeProbability < 20 ? "Natural Optical Sensor" : "High GAN Synthesis Probability"}
                  </p>
                </div>

                <div className="bg-[#161924] border border-[#1c202e] rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-[#64748b] font-black uppercase tracking-wider">Cryptographic Provenance</p>
                  <p className="text-3xl font-black mt-1 text-[#00d4ff]">
                    {scanResult.metadataIntegrity.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-[#9ca3af] mt-1">C2PA Hardware Verified</p>
                </div>
              </div>

              {/* Verdict Summary */}
              <div
                className={`p-5 rounded-2xl border flex items-start gap-4 ${
                  scanResult.isAuthentic
                    ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]"
                    : "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"
                }`}
              >
                {scanResult.isAuthentic ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                <div>
                  <h4 className="text-sm font-black">
                    Verdict: {scanResult.factCheckStatus}
                  </h4>
                  <p className="text-xs text-white/90 mt-1.5 leading-relaxed">
                    {scanResult.claims[0]?.explanation}
                  </p>
                  <p className="text-[11px] text-[#9ca3af] mt-2 font-mono">
                    Source: {scanResult.claims[0]?.source}
                  </p>
                </div>
              </div>

              {/* Face-Mesh & Frequency Telemetry */}
              <div className="bg-[#161924] border border-[#1c202e] rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Activity size={14} className="text-[#00d4ff]" />
                  Neural & Optical Telemetry Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs text-[#cbd5e1]">
                  <div className="p-2.5 rounded-xl bg-[#10121a] flex justify-between">
                    <span className="text-[#9ca3af]">Frequency Purity:</span>
                    <span className="font-mono font-bold text-white">{scanResult.faceMesh.frequencySpectrumPurity}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#10121a] flex justify-between">
                    <span className="text-[#9ca3af]">Lighting Consistency:</span>
                    <span className="font-bold text-[#10b981]">{scanResult.faceMesh.lightingConsistent ? "Passed ✓" : "Failed ✗"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#10121a] flex justify-between">
                    <span className="text-[#9ca3af]">Micro-Blink Normalcy:</span>
                    <span className="font-bold text-[#10b981]">{scanResult.faceMesh.blinkRateNormal ? "Passed ✓" : "Failed ✗"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#10121a] flex justify-between">
                    <span className="text-[#9ca3af]">Boundary Artifacts:</span>
                    <span className={`font-bold ${scanResult.faceMesh.anomalyDetected ? "text-[#ef4444]" : "text-[#10b981]"}`}>
                      {scanResult.faceMesh.anomalyDetected ? "Detected" : "None"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Digital Certificate Seal */}
              <div className="p-4 bg-[#0d0f17] border border-[#00d4ff]/30 rounded-2xl flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-[#00d4ff]" />
                  <span className="text-xs font-mono text-[#00d4ff]">
                    Certificate Hash: {scanResult.signatureHash}
                  </span>
                </div>
                <span className="text-[10px] text-[#64748b] font-mono">
                  Timestamp: {new Date(scanResult.scannedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
