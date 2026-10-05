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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="w-full max-w-5xl flex items-center justify-between border-b border-zinc-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
            <ShieldCheck size={22} className="text-zinc-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">VeritasLens Content Verification</h1>
              <span className="text-[11px] font-semibold text-zinc-300 bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-700">
                Fact Check & Media Analysis
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Detect synthetic media, inspect image provenance, and verify claims</p>
          </div>
        </div>

        <Link
          href="/feed"
          className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-xl transition"
        >
          ← Back to Feed
        </Link>
      </div>

      {/* ── Inspection Control Panel ──────────────────────────────── */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form & Sample Targets (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Search size={16} className="text-zinc-400" />
              Content Inspector
            </h2>

            {/* Media URL Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Image or Media URL
              </label>
              <input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://.../photo.jpg"
                className="w-full h-10 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Claim Text Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Claim Text or Statement
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste any factual claim or caption to verify..."
                rows={3}
                className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
              />
            </div>

            {/* Trigger Button */}
            <button
              onClick={() => handleScan()}
              disabled={(!inputUrl.trim() && !inputText.trim()) || scanMutation.isPending}
              className="w-full h-11 rounded-xl bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-zinc-200 transition cursor-pointer"
            >
              {scanMutation.isPending ? (
                <Loader2 size={16} className="animate-spin text-zinc-900" />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Verify Content Authenticity</span>
                </>
              )}
            </button>
          </div>

          {/* Sample Presets */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Sample Verification Checks
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
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">{st.label}</p>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">{st.claim}</p>
                  </div>
                  <ArrowRight size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Results Display (7 cols) */}
        <div className="lg:col-span-7">
          {scanMutation.isPending && (
            <div className="h-full min-h-[420px] bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
                <Activity size={22} className="text-zinc-400 absolute inset-0 m-auto" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Analyzing Media & Claims</h3>
                <p className="text-xs text-zinc-400 mt-1">Checking metadata signatures and factual references...</p>
              </div>
            </div>
          )}

          {!scanResult && !scanMutation.isPending && (
            <div className="h-full min-h-[420px] bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center">
              <ShieldCheck size={44} className="text-zinc-600" />
              <h3 className="text-sm font-semibold text-white">Ready to Inspect</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Select a sample check or enter an image URL to inspect provenance, authenticity signals, and fact-checking status.
              </p>
            </div>
          )}

          {scanResult && !scanMutation.isPending && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-6">
              {/* Top Score Dashboard */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Deepfake Probability</p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      scanResult.deepfakeProbability < 20 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {scanResult.deepfakeProbability.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {scanResult.deepfakeProbability < 20 ? "Likely Natural Media" : "Possible Synthetic Content"}
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Provenance Match</p>
                  <p className="text-2xl font-bold mt-1 text-white">
                    {scanResult.metadataIntegrity.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">Integrity Score</p>
                </div>
              </div>

              {/* Verdict Summary */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  scanResult.isAuthentic
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                {scanResult.isAuthentic ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <AlertTriangle size={20} className="shrink-0 mt-0.5" />}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide">
                    Verdict: {scanResult.factCheckStatus}
                  </h4>
                  <p className="text-xs text-zinc-200 mt-1 leading-relaxed">
                    {scanResult.claims[0]?.explanation}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-2 font-mono">
                    Source: {scanResult.claims[0]?.source}
                  </p>
                </div>
              </div>

              {/* Face-Mesh & Frequency Telemetry */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                  <Activity size={14} className="text-zinc-400" />
                  Media Analysis Signals
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs text-zinc-300">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-400">Spectrum Score:</span>
                    <span className="font-mono font-semibold text-white">{scanResult.faceMesh.frequencySpectrumPurity}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-400">Lighting Consistency:</span>
                    <span className="font-semibold text-emerald-400">{scanResult.faceMesh.lightingConsistent ? "Normal ✓" : "Inconsistent ✗"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-400">Micro-Dynamics:</span>
                    <span className="font-semibold text-emerald-400">{scanResult.faceMesh.blinkRateNormal ? "Natural ✓" : "Abnormal ✗"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-400">Boundary Artifacts:</span>
                    <span className={`font-semibold ${scanResult.faceMesh.anomalyDetected ? "text-rose-400" : "text-emerald-400"}`}>
                      {scanResult.faceMesh.anomalyDetected ? "Detected" : "None"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Digital Certificate Seal */}
              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-zinc-400" />
                  <span className="text-[11px] font-mono text-zinc-300">
                    Hash: {scanResult.signatureHash}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Scanned: {new Date(scanResult.scannedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
