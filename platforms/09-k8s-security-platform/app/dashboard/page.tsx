"use client";
import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FINDINGS, CLUSTER_SUMMARY, NAMESPACE_SUMMARIES } from "@/data/findings";
import { sevColor, sevBg, sevBorder, sevGlow, clusterStatusColor, clusterStatusBg, categoryIcon, categoryColor } from "@/lib/utils";
import { ExternalLink, Shield } from "lucide-react";
import type { K8sSeverity, FindingCategory } from "@/types/k8s";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter    = (searchParams.get("sev") ?? "All") as K8sSeverity | "All";
  const catFilter = (searchParams.get("cat") ?? "All") as FindingCategory | "All";

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All") params.delete(key); else params.set(key, value);
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  let results = [...FINDINGS];
  if (filter !== "All") results = results.filter(f => f.severity === filter);
  if (catFilter !== "All") results = results.filter(f => f.category === catFilter);

  const CATS: (FindingCategory | "All")[] = ["All", "Misconfiguration", "RBAC", "Network", "Workload", "Secret"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Kubernetes Security Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            ☸️ {CLUSTER_SUMMARY.clusterName} · {CLUSTER_SUMMARY.k8sVersion} · {CLUSTER_SUMMARY.nodeCount} nodes · {CLUSTER_SUMMARY.podCount} pods
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl text-sm"
          style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.25)", color: "var(--primary)" }}>
          CIS Score: <span className="font-bold text-lg" style={{ color: "var(--high)" }}>{CLUSTER_SUMMARY.cisScore}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Critical", value: CLUSTER_SUMMARY.criticalFindings, color: "var(--critical)", bg: "rgba(255,59,48,0.06)",  border: "rgba(255,59,48,0.2)" },
          { label: "High",     value: CLUSTER_SUMMARY.highFindings,     color: "var(--high)",    bg: "rgba(255,149,0,0.06)",  border: "rgba(255,149,0,0.2)" },
          { label: "RBAC Risks",  value: CLUSTER_SUMMARY.rbacRisks,    color: "#a78bfa",         bg: "rgba(167,139,250,0.06)", border: "rgba(167,139,250,0.2)" },
          { label: "Network Gaps",value: CLUSTER_SUMMARY.networkGaps,   color: "var(--primary)", bg: "rgba(129,140,248,0.06)", border: "rgba(129,140,248,0.2)" },
        ].map(m => (
          <div key={m.label} className="rounded-2xl p-5" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>{m.label}</div>
            <div className="text-4xl font-black" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Namespace summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {NAMESPACE_SUMMARIES.map(ns => (
          <div key={ns.name} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-white">{ns.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: clusterStatusBg(ns.status), color: clusterStatusColor(ns.status) }}>{ns.status}</span>
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              {ns.criticalCount > 0 && <span style={{ color: "var(--critical)" }}>🔴 {ns.criticalCount} · </span>}
              {ns.highCount > 0 && <span style={{ color: "var(--high)" }}>🟠 {ns.highCount} · </span>}
              <span>{ns.totalCount} total</span>
            </div>
          </div>
        ))}
      </div>

      {/* Severity + category filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(["All", "Critical", "High", "Medium", "Low"] as const).map(tab => (
          <button key={tab} onClick={() => update("sev", tab)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: filter === tab ? "rgba(129,140,248,0.12)" : "var(--surface)",
              border: `1px solid ${filter === tab ? "rgba(129,140,248,0.4)" : "var(--border)"}`,
              color: filter === tab ? "var(--primary)" : "var(--muted)",
            }}>
            {tab}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATS.map(cat => (
          <button key={cat} onClick={() => update("cat", cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: catFilter === cat ? "rgba(129,140,248,0.12)" : "var(--surface)",
              border: `1px solid ${catFilter === cat ? "rgba(129,140,248,0.35)" : "var(--border)"}`,
              color: catFilter === cat ? "var(--primary)" : "var(--muted)",
            }}>
            {cat !== "All" && categoryIcon(cat as FindingCategory)} {cat}
          </button>
        ))}
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Showing <span className="text-white font-medium">{results.length}</span> of {FINDINGS.length} findings
      </p>

      {/* Finding cards */}
      <div className="space-y-3">
        {results.map(f => (
          <Link key={f.id} href={`/finding/${f.id}`}
            className="block rounded-2xl p-5 transition-all duration-200 group"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = sevColor(f.severity); el.style.boxShadow = `0 0 24px ${sevGlow(f.severity)}`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = ""; }}>
            <div className="flex items-start gap-4 flex-wrap">
              <span className="text-xl">{categoryIcon(f.category)}</span>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <span className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{ background: "var(--background)", color: "var(--muted)" }}>{f.id}</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: sevBg(f.severity), border: `1px solid ${sevBorder(f.severity)}`, color: sevColor(f.severity) }}>
                  {f.severity}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ color: categoryColor(f.category), background: "var(--background)", border: "1px solid var(--border)" }}>
                  {f.category}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{f.title}</div>
                <div className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: "var(--muted)" }}>
                  <span>{f.resource.kind}/{f.resource.name}</span>
                  <span>· {f.resource.namespace}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{ background: "var(--background)", border: "1px solid var(--border)" }}>{f.cisRef}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" style={{ color: "var(--muted)" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <Suspense fallback={<div className="text-center py-24" style={{ color: "var(--muted)" }}>Loading...</div>}>
          <DashboardContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
