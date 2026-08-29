"use client";
import Link from "next/link";
import { KeyRound, ShieldAlert, ArrowRight, Play, Eye, GitBranch, Zap } from "lucide-react";
import { SCAN_SUMMARY } from "@/data/secrets";

const DETECTORS = ["TruffleHog", "Gitleaks", "Detect-Secrets", "git-secrets", "Semgrep", "Custom Rules"];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,59,48,0.05) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Critical alert banner */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 text-sm font-semibold pulse-red"
          style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.35)", color: "var(--critical)" }}>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {SCAN_SUMMARY.activeSecrets} Active Secrets Detected · {SCAN_SUMMARY.criticalCount} Critical — Immediate Action Required
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
          Find Every{" "}
          <span className="relative inline-block" style={{ color: "var(--primary)" }}>
            Exposed Secret
          </span>
          <br />Before Attackers Do.
        </h1>

        <p className="text-xl max-w-3xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--muted)" }}>
          Scan git history, source code, CI/CD pipelines, Docker images, and IaC files for{" "}
          <span className="text-white">API keys</span>,{" "}
          <span className="text-white">credentials</span>,{" "}
          <span className="text-white">private keys</span>, and{" "}
          <span className="text-white">tokens</span> — with live validation and one-click rotation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/scan"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}>
            <Play className="w-4 h-4" /> Scan Repository Now
          </Link>
          <Link href="/dashboard"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition-all hover:text-white"
            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
            View Findings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-12">
          {[
            { value: SCAN_SUMMARY.reposScanned.toString(),             label: "Repos Scanned",    color: "var(--primary)" },
            { value: SCAN_SUMMARY.filesScanned.toLocaleString(),       label: "Files Analyzed",   color: "var(--primary)" },
            { value: SCAN_SUMMARY.commitsScanned.toLocaleString(),     label: "Commits Checked",  color: "var(--primary)" },
            { value: SCAN_SUMMARY.inGitHistory.toString(),             label: "In Git History",   color: "var(--high)" },
            { value: SCAN_SUMMARY.criticalCount.toString(),            label: "Critical Severity", color: "var(--critical)" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Detector marquee */}
        <div className="overflow-hidden">
          <div className="marquee-track inline-flex gap-6 whitespace-nowrap">
            {[...DETECTORS, ...DETECTORS].map((d, i) => (
              <span key={i} className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "var(--primary)" }}>
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
