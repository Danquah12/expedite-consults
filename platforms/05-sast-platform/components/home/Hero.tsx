"use client";

import Link from "next/link";
import { ArrowRight, Play, Shield, Zap, Eye } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background glows */}
      <div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none pulse-glow"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,59,48,0.06) 0%, transparent 70%)" }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium"
          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "var(--primary)" }}
        >
          <Shield className="w-3.5 h-3.5" />
          Platform 5 of 34 — Static Application Security Testing
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Find Vulnerabilities{" "}
          <span style={{ color: "var(--primary)" }}>Before</span>
          <br />
          Attackers Do
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--muted)" }}>
          Multi-engine static analysis using{" "}
          <span className="text-white font-semibold">CodeQL</span>,{" "}
          <span className="text-white font-semibold">Semgrep</span>,{" "}
          <span className="text-white font-semibold">Joern</span>, and AI-driven validation
          that eliminates false positives and surfaces only real, exploitable risks.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/scan"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #00d4ff, #0098b8)", color: "#0a0f1a" }}
          >
            <Play className="w-4 h-4" />
            Run Demo Scan
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:text-white"
            style={{ border: "1px solid var(--border)", color: "var(--muted)", background: "rgba(255,255,255,0.02)" }}
          >
            <Eye className="w-4 h-4" />
            View Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats bar */}
        <div
          className="inline-flex flex-wrap justify-center gap-8 px-8 py-5 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {[
            { value: "4",    label: "Analysis Engines" },
            { value: "27+",  label: "CWE Categories" },
            { value: "94%",  label: "Avg Confidence" },
            { value: "< 2s", label: "Per File Analysis" },
            { value: "5",    label: "Validation Layers" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-20 flex flex-col items-center gap-2" style={{ color: "var(--muted)" }}>
          <Zap className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <span className="text-xs">Scroll to explore</span>
          <div className="w-px h-8 mt-1" style={{ background: "linear-gradient(to bottom, var(--primary), transparent)" }} />
        </div>
      </div>
    </section>
  );
}
