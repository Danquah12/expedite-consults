"use client";
import Link from "next/link";
import { FINDINGS, SCAN_SUMMARY } from "@/data/findings";
import { sevColor, sevBg, sevBorder, sevGlow, providerColor, providerBg, categoryIcon, frameworkColor } from "@/lib/utils";
import { Code2, ArrowRight, Play, ExternalLink } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TOOLS = ["Checkov", "Terrascan", "tfsec", "Regula", "OPA", "Trivy (IaC)", "cfn-nag", "KICS"];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium"
              style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", color: "var(--primary)" }}>
              <Code2 className="w-3.5 h-3.5" /> Platform 10 of 34 — Infrastructure-as-Code Security
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Secure Infrastructure<br />
              <span style={{ color: "var(--primary)" }}>Before It Deploys.</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-10" style={{ color: "var(--muted)" }}>
              Scan <span className="text-white">Terraform</span>, <span className="text-white">CloudFormation</span>,{" "}
              <span className="text-white">Pulumi</span>, and <span className="text-white">Ansible</span> for security misconfigurations.
              Shift left — catch public S3 buckets, open security groups, and unencrypted databases in code review, not after breach.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/scan"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold transition-all hover:opacity-90 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff" }}>
                <Play className="w-4 h-4" /> Scan IaC Files
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold"
                style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                View Findings <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-12">
              {[
                { v: SCAN_SUMMARY.filesScanned.toString(),     l: "Files Scanned",    c: "var(--primary)" },
                { v: SCAN_SUMMARY.resourcesScanned.toString(), l: "Resources Checked", c: "var(--primary)" },
                { v: SCAN_SUMMARY.criticalCount.toString(),    l: "Critical",          c: "var(--critical)" },
                { v: SCAN_SUMMARY.highCount.toString(),        l: "High",              c: "var(--high)" },
                { v: `${Math.round((SCAN_SUMMARY.passedChecks / (SCAN_SUMMARY.passedChecks + SCAN_SUMMARY.failedChecks)) * 100)}%`, l: "Pass Rate", c: "var(--low)" },
              ].map(s => (
                <div key={s.l} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="text-2xl font-black mb-0.5" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Tool marquee */}
            <div className="overflow-hidden mb-16">
              <div className="marquee-track inline-flex gap-6 whitespace-nowrap">
                {[...TOOLS, ...TOOLS].map((t, i) => (
                  <span key={i} className="px-4 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "var(--primary)" }}>
                    🏗️ {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent findings */}
            <div className="space-y-3 max-w-3xl mx-auto">
              {FINDINGS.slice(0, 5).map(f => (
                <Link key={f.id} href={`/finding/${f.id}`}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl transition-all group text-left"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = sevColor(f.severity); }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                  <span className="text-lg">{categoryIcon(f.category)}</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold flex-shrink-0"
                    style={{ background: sevBg(f.severity), color: sevColor(f.severity) }}>{f.severity}</span>
                  <span className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors flex-1 text-left">{f.title}</span>
                  <span className="text-xs font-mono hidden sm:block" style={{ color: "var(--muted)" }}>{f.file}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ color: frameworkColor(f.framework), background: "var(--background)", border: "1px solid var(--border)" }}>{f.framework}</span>
                </Link>
              ))}
              <Link href="/dashboard"
                className="block text-center py-3 text-sm font-semibold rounded-xl hover:opacity-90 transition-all"
                style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", color: "var(--primary)" }}>
                View All {FINDINGS.length} Findings →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
