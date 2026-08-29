"use client";
import Link from "next/link";
import { Package, ArrowRight, Play, ShieldAlert, AlertTriangle, GitBranch } from "lucide-react";
import { DEPENDENCY_STATS } from "@/data/findings";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none pulse-glow"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,59,48,0.06) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--primary)" }}>
          <Package className="w-3.5 h-3.5" />
          Platform 6 of 34 — Software Composition Analysis
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Know Every Dependency.{" "}
          <br />
          <span style={{ color: "var(--primary)" }}>Own Every Risk.</span>
        </h1>

        <p className="text-xl sm:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--muted)" }}>
          Scan your entire open-source supply chain for{" "}
          <span className="text-white font-semibold">CVEs</span>,{" "}
          <span className="text-white font-semibold">license violations</span>, and{" "}
          <span className="text-white font-semibold">transitive risks</span>{" "}
          across npm, Maven, PyPI, NuGet, and more — in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/scan"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
            <Play className="w-4 h-4" />
            Scan Dependencies
          </Link>
          <Link href="/dashboard"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition-all hover:text-white"
            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
            View Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Live stats */}
        <div className="inline-flex flex-wrap justify-center gap-8 px-8 py-5 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {[
            { value: DEPENDENCY_STATS.total.toLocaleString(), label: "Total Dependencies", icon: Package },
            { value: DEPENDENCY_STATS.vulnerable.toString(), label: "Vulnerable", icon: ShieldAlert },
            { value: DEPENDENCY_STATS.outdated.toString(), label: "Outdated", icon: AlertTriangle },
            { value: "5", label: "Ecosystems", icon: GitBranch },
            { value: "SBOM", label: "Auto-generated", icon: Package },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
