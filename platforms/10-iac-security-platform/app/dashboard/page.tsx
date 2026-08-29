"use client";
import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FINDINGS, SCAN_SUMMARY } from "@/data/findings";
import { sevColor, sevBg, sevBorder, sevGlow, providerColor, providerBg, frameworkColor, categoryIcon } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import type { IaCSeverity, IaCCategory, CloudProvider } from "@/types/iac";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sev      = (searchParams.get("sev")      ?? "All") as IaCSeverity | "All";
  const provider = (searchParams.get("provider") ?? "All") as CloudProvider | "All";

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All") params.delete(key); else params.set(key, value);
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  let results = [...FINDINGS];
  if (sev !== "All")      results = results.filter(f => f.severity === sev);
  if (provider !== "All") results = results.filter(f => f.provider === provider);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">IaC Security Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {SCAN_SUMMARY.filesScanned} files · {SCAN_SUMMARY.resourcesScanned} resources · {SCAN_SUMMARY.passedChecks} passed · {SCAN_SUMMARY.failedChecks} failed
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl text-sm"
          style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", color: "var(--primary)" }}>
          Pass Rate: <span className="font-bold text-lg">
            {Math.round((SCAN_SUMMARY.passedChecks / (SCAN_SUMMARY.passedChecks + SCAN_SUMMARY.failedChecks)) * 100)}%
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Critical", value: SCAN_SUMMARY.criticalCount, color: "var(--critical)", bg: "rgba(255,59,48,0.06)",  border: "rgba(255,59,48,0.2)" },
          { label: "High",     value: SCAN_SUMMARY.highCount,     color: "var(--high)",    bg: "rgba(255,149,0,0.06)",  border: "rgba(255,149,0,0.2)" },
          { label: "Medium",   value: SCAN_SUMMARY.mediumCount,   color: "var(--medium)",  bg: "rgba(255,204,0,0.06)",  border: "rgba(255,204,0,0.2)" },
          { label: "Total",    value: SCAN_SUMMARY.totalFindings, color: "var(--primary)", bg: "rgba(249,115,22,0.06)", border: "rgba(249,115,22,0.2)" },
        ].map(m => (
          <div key={m.label} className="rounded-2xl p-5" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>{m.label}</div>
            <div className="text-4xl font-black" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(["All", "Critical", "High", "Medium", "Low"] as const).map(tab => (
          <button key={tab} onClick={() => update("sev", tab)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: sev === tab ? "rgba(249,115,22,0.12)" : "var(--surface)",
              border: `1px solid ${sev === tab ? "rgba(249,115,22,0.4)" : "var(--border)"}`,
              color: sev === tab ? "var(--primary)" : "var(--muted)",
            }}>
            {tab}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {(["All", "AWS", "Azure", "GCP"] as const).map(p => (
          <button key={p} onClick={() => update("provider", p)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: provider === p ? providerBg(p as CloudProvider) : "var(--surface)",
              border: `1px solid ${provider === p ? providerColor(p as CloudProvider) : "var(--border)"}`,
              color: provider === p ? providerColor(p as CloudProvider) : "var(--muted)",
            }}>
            {p}
          </button>
        ))}
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Showing <span className="text-white font-medium">{results.length}</span> of {FINDINGS.length} findings
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {results.map(f => (
          <Link key={f.id} href={`/finding/${f.id}`}
            className="block rounded-2xl p-5 transition-all duration-200 group"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = sevColor(f.severity); el.style.boxShadow = `0 0 24px ${sevGlow(f.severity)}`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = ""; }}>
            <div className="flex items-start gap-3 mb-3 flex-wrap">
              <span className="text-lg">{categoryIcon(f.category)}</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: sevBg(f.severity), border: `1px solid ${sevBorder(f.severity)}`, color: sevColor(f.severity) }}>
                {f.severity}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold"
                style={{ color: providerColor(f.provider), background: providerBg(f.provider), border: `1px solid ${providerColor(f.provider)}40` }}>
                {f.provider}
              </span>
              <span className="px-2 py-0.5 rounded text-xs"
                style={{ color: frameworkColor(f.framework), background: "var(--background)", border: "1px solid var(--border)" }}>
                {f.framework}
              </span>
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" style={{ color: "var(--muted)" }} />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors mb-1">{f.title}</h3>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
              <span className="font-mono">{f.resource}</span>
              <span>·</span>
              <span>{f.file}:{f.line}</span>
            </div>
            <div className="mt-3 pt-3 flex items-center gap-2 text-xs flex-wrap" style={{ borderTop: "1px solid var(--border)" }}>
              {f.complianceRefs.slice(0, 2).map(r => (
                <span key={r.control} className="px-2 py-0.5 rounded"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  {r.framework} {r.control}
                </span>
              ))}
              <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>{f.ruleId}</span>
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
