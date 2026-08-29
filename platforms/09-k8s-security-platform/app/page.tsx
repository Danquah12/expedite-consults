"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { CLUSTER_SUMMARY, NAMESPACE_SUMMARIES, FINDINGS } from "@/data/findings";
import { sevColor, sevBg, clusterStatusColor, clusterStatusBg, categoryIcon } from "@/lib/utils";
import { Shield, ArrowRight, Play } from "lucide-react";

const TOOLS = ["kube-bench", "Falco", "OPA Gatekeeper", "Trivy", "kube-hunter", "Checkov"];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium"
              style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.25)", color: "var(--primary)" }}>
              <Shield className="w-3.5 h-3.5" /> Platform 9 of 34 — Kubernetes Security
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Secure Every Cluster.<br />
              <span style={{ color: "var(--primary)" }}>Zero Trust Kubernetes.</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-10" style={{ color: "var(--muted)" }}>
              Continuously audit your Kubernetes clusters against <span className="text-white">CIS Benchmarks</span>, detect{" "}
              <span className="text-white">RBAC misconfigurations</span>, enforce{" "}
              <span className="text-white">NetworkPolicies</span>, and prevent container escapes before they happen.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/scan"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold transition-all hover:opacity-90 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)", color: "#fff" }}>
                <Play className="w-4 h-4" /> Audit Cluster
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold"
                style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                View Findings <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Cluster summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-12">
              {[
                { v: `${CLUSTER_SUMMARY.cisScore}%`,              l: "CIS Score",         c: CLUSTER_SUMMARY.cisScore < 70 ? "var(--critical)" : "var(--low)" },
                { v: CLUSTER_SUMMARY.criticalFindings.toString(), l: "Critical Findings",  c: "var(--critical)" },
                { v: CLUSTER_SUMMARY.rbacRisks.toString(),        l: "RBAC Risks",        c: "var(--high)" },
                { v: CLUSTER_SUMMARY.networkGaps.toString(),      l: "Network Gaps",      c: "#818cf8" },
                { v: CLUSTER_SUMMARY.podCount.toString(),         l: "Pods Monitored",    c: "var(--primary)" },
              ].map(s => (
                <div key={s.l} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="text-2xl font-black mb-0.5" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Namespace breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-12">
              {NAMESPACE_SUMMARIES.map(ns => (
                <div key={ns.name} className="rounded-xl p-4 text-left"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-white">{ns.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: clusterStatusBg(ns.status), color: clusterStatusColor(ns.status) }}>
                      {ns.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {ns.criticalCount > 0 && <span style={{ color: "var(--critical)" }}>🔴 {ns.criticalCount}</span>}
                    {ns.highCount > 0 && <span style={{ color: "var(--high)" }}>🟠 {ns.highCount}</span>}
                    <span style={{ color: "var(--muted)" }}>/ {ns.totalCount}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tool marquee */}
            <div className="overflow-hidden mb-16">
              <div className="marquee-track inline-flex gap-6 whitespace-nowrap">
                {[...TOOLS, ...TOOLS].map((t, i) => (
                  <span key={i} className="px-4 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)", color: "var(--primary)" }}>
                    ☸️ {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Top findings preview */}
            <div className="space-y-3 max-w-3xl mx-auto">
              {FINDINGS.slice(0, 4).map(f => (
                <Link key={f.id} href={`/finding/${f.id}`}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl transition-all group text-left"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = sevColor(f.severity); }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                  <span className="text-lg">{categoryIcon(f.category)}</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold flex-shrink-0"
                    style={{ background: sevBg(f.severity), color: sevColor(f.severity) }}>{f.severity}</span>
                  <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors flex-1 text-left">{f.title}</span>
                  <span className="text-xs font-mono hidden sm:block" style={{ color: "var(--muted)" }}>
                    {f.resource.kind}/{f.resource.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded"
                    style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>{f.cisRef}</span>
                </Link>
              ))}
              <Link href="/dashboard"
                className="block text-center py-3 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
                style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.25)", color: "var(--primary)" }}>
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
