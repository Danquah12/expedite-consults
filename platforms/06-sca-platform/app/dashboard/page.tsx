"use client";
import { Suspense } from "react";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SCA_FINDINGS, DEPENDENCY_STATS } from "@/data/findings";
import { severityHex, severityBgHex, severityBorderHex, severityGlow, statusColor, statusBg, ecosystemIcon, cvssColor, epssLabel } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Package, ExternalLink, Scale } from "lucide-react";
import type { Severity } from "@/types/sca";

const ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = (searchParams.get("severity") ?? "All") as Severity | "All";
  const search = searchParams.get("q") ?? "";

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All") params.delete(key); else params.set(key, value);
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  let results = [...SCA_FINDINGS];
  if (filter !== "All") results = results.filter(f => f.severity === filter);
  if (search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(f =>
      f.packageName.toLowerCase().includes(q) ||
      f.cves.some(c => c.id.toLowerCase().includes(q)) ||
      f.ecosystem.toLowerCase().includes(q)
    );
  }
  results.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  const counts = {
    All: SCA_FINDINGS.length,
    Critical: SCA_FINDINGS.filter(f => f.severity === "Critical").length,
    High:     SCA_FINDINGS.filter(f => f.severity === "High").length,
    Medium:   SCA_FINDINGS.filter(f => f.severity === "Medium").length,
    Low:      SCA_FINDINGS.filter(f => f.severity === "Low").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">SCA Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Customer API · <span className="text-white">{DEPENDENCY_STATS.total.toLocaleString()}</span> dependencies · {SCA_FINDINGS.length} vulnerabilities detected
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl text-sm"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--primary)" }}>
          ✓ OSV · NVD · GHSA · License Check
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Vulnerable",   value: DEPENDENCY_STATS.vulnerable, color: "var(--critical)", bg: "rgba(255,59,48,0.06)", border: "rgba(255,59,48,0.2)" },
          { label: "Critical CVEs",value: counts.Critical,             color: "var(--critical)", bg: "rgba(255,59,48,0.06)", border: "rgba(255,59,48,0.2)" },
          { label: "Outdated",     value: DEPENDENCY_STATS.outdated,   color: "var(--high)",    bg: "rgba(255,149,0,0.06)", border: "rgba(255,149,0,0.2)" },
          { label: "License Issues",value: DEPENDENCY_STATS.licenseIssues, color: "#a78bfa",   bg: "rgba(167,139,250,0.06)", border: "rgba(167,139,250,0.2)" },
        ].map(m => (
          <div key={m.label} className="rounded-2xl p-5" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>{m.label}</div>
            <div className="text-4xl font-black" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["All", "Critical", "High", "Medium", "Low"] as const).map(tab => (
          <button key={tab} onClick={() => update("severity", tab)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: filter === tab ? `${severityHex(tab as Severity) || "var(--primary)"}18` : "var(--surface)",
              border: `1px solid ${filter === tab ? (severityHex(tab as Severity) || "var(--primary)") : "var(--border)"}`,
              color: filter === tab ? (severityHex(tab as Severity) || "var(--primary)") : "var(--muted)",
            }}>
            {tab} <span className="text-xs font-bold opacity-70">{counts[tab]}</span>
          </button>
        ))}
        <div className="flex-1 max-w-sm relative">
          <input type="text" value={search} onChange={e => update("q", e.target.value)}
            placeholder="Search package, CVE, ecosystem..."
            className="w-full pl-4 pr-4 py-2 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
        </div>
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Showing <span className="text-white font-medium">{results.length}</span> of {SCA_FINDINGS.length} findings
      </p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map(f => {
          const topCve = f.cves[0];
          return (
            <Link key={f.id} href={`/finding/${f.id}`}
              className="block rounded-2xl p-5 transition-all duration-200 group"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = severityHex(f.severity); el.style.boxShadow = `0 0 30px ${severityGlow(f.severity)}`; el.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = ""; el.style.transform = ""; }}>

              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base">{ecosystemIcon(f.ecosystem)}</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{ background: severityBgHex(f.severity), border: `1px solid ${severityBorderHex(f.severity)}`, color: severityHex(f.severity) }}>
                    {f.severity}
                  </span>
                  {f.activelyExploited && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: "rgba(255,59,48,0.15)", color: "var(--critical)", border: "1px solid rgba(255,59,48,0.3)" }}>
                      ⚡ Active
                    </span>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: "var(--muted)" }} />
              </div>

              <div className="mb-1">
                <span className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">{f.packageName}</span>
                <span className="text-sm font-mono ml-2" style={{ color: "var(--muted)" }}>v{f.packageVersion}</span>
              </div>
              <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>{f.ecosystem} · {f.isDirect ? "Direct" : `Transitive (depth ${f.depth})`}</div>

              {topCve && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md"
                    style={{ background: "var(--background)", color: "var(--primary)", border: "1px solid var(--border)" }}>
                    {topCve.id}
                  </span>
                  <span className="text-sm font-bold" style={{ color: cvssColor(topCve.cvss) }}>CVSS {topCve.cvss.toFixed(1)}</span>
                  {f.cves.length > 1 && <span className="text-xs" style={{ color: "var(--muted)" }}>+{f.cves.length - 1} more</span>}
                </div>
              )}

              {f.cves.length === 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                  <span className="text-xs" style={{ color: "#a78bfa" }}>License violation: {f.license.name}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-3"
                style={{ borderTop: "1px solid var(--border)" }}>
                <span className="px-2 py-1 rounded-lg" style={{ background: statusBg(f.status), color: statusColor(f.status) }}>{f.status}</span>
                {f.fixAvailable
                  ? <span className="flex items-center gap-1" style={{ color: "var(--low)" }}><CheckCircle2 className="w-3.5 h-3.5" />Fix: v{f.fixVersion}</span>
                  : <span className="flex items-center gap-1" style={{ color: "var(--muted)" }}><AlertTriangle className="w-3.5 h-3.5" />No fix</span>}
              </div>
            </Link>
          );
        })}
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
