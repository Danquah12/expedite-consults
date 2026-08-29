"use client";
import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FINDINGS, SCAN_SUMMARY, APPS } from "@/data/findings";
import { sevColor, sevBg, sevBorder, sevGlow, platformColor, platformBg, categoryIcon } from "@/lib/utils";
import type { MobileSeverity } from "@/types/mobile";
import { ExternalLink, Smartphone } from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sev      = (searchParams.get("sev") ?? "All") as MobileSeverity | "All";
  const platform = searchParams.get("platform") ?? "All";

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All") params.delete(key); else params.set(key, value);
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  let results = [...FINDINGS];
  if (sev !== "All")      results = results.filter(f => f.severity === sev);
  if (platform !== "All") results = results.filter(f => f.platform === platform || f.platform === "Both");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Mobile Security Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            📱 {SCAN_SUMMARY.apps} apps · Avg Risk Score: {SCAN_SUMMARY.avgRiskScore}/100 · OWASP MASVS 2.1
          </p>
        </div>
      </div>

      {/* App risk cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {APPS.map(app => (
          <div key={app.id} className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-3">
              <Smartphone className="w-5 h-5" style={{ color: platformColor(app.platform) }} />
              <div>
                <div className="text-sm font-bold text-white">{app.name}</div>
                <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>{app.bundleId}</div>
              </div>
            </div>
            <div className="flex justify-between text-xs" style={{ color: "var(--muted)" }}>
              <span className="px-2 py-0.5 rounded" style={{ background: platformBg(app.platform), color: platformColor(app.platform) }}>{app.platform}</span>
              <span style={{ color: app.riskScore > 70 ? "var(--critical)" : app.riskScore > 40 ? "var(--high)" : "var(--low)", fontWeight: 700 }}>
                Risk {app.riskScore}/100
              </span>
              <span style={{ color: "var(--critical)", fontWeight: 700 }}>{app.findings} findings</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Critical", value: SCAN_SUMMARY.criticalCount, color: "var(--critical)", bg: "rgba(255,59,48,0.06)",  border: "rgba(255,59,48,0.2)" },
          { label: "High",     value: SCAN_SUMMARY.highCount,     color: "var(--high)",     bg: "rgba(255,149,0,0.06)",  border: "rgba(255,149,0,0.2)" },
          { label: "Medium",   value: SCAN_SUMMARY.mediumCount,   color: "var(--medium)",   bg: "rgba(255,204,0,0.06)",  border: "rgba(255,204,0,0.2)" },
          { label: "Total",    value: SCAN_SUMMARY.totalFindings, color: "var(--primary)",  bg: "rgba(236,72,153,0.06)", border: "rgba(236,72,153,0.2)" },
        ].map(m => (
          <div key={m.label} className="rounded-2xl p-5" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>{m.label}</div>
            <div className="text-4xl font-black" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(["All","Critical","High","Medium","Low"] as const).map(s => (
          <button key={s} onClick={() => update("sev", s)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: sev === s ? "rgba(236,72,153,0.12)" : "var(--surface)", border: `1px solid ${sev === s ? "rgba(236,72,153,0.4)" : "var(--border)"}`, color: sev === s ? "var(--primary)" : "var(--muted)" }}>
            {s}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "iOS", "Android", "React Native", "Flutter", "Both"].map(p => (
          <button key={p} onClick={() => update("platform", p)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: platform === p ? "rgba(236,72,153,0.1)" : "var(--surface)", border: `1px solid ${platform === p ? "rgba(236,72,153,0.35)" : "var(--border)"}`, color: platform === p ? "var(--primary)" : "var(--muted)" }}>
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
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-sm">{categoryIcon(f.category)}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "var(--background)", color: "var(--muted)" }}>{f.id}</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: sevBg(f.severity), border: `1px solid ${sevBorder(f.severity)}`, color: sevColor(f.severity) }}>{f.severity}</span>
              <span className="text-xs px-2 py-0.5 rounded" style={{ color: platformColor(f.platform), background: "var(--background)", border: "1px solid var(--border)" }}>{f.platform}</span>
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" style={{ color: "var(--muted)" }} />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors mb-1">{f.title}</h3>
            <div className="text-xs font-mono mb-3" style={{ color: "var(--muted)" }}>{f.file}{f.line ? `:${f.line}` : ""}</div>
            <div className="pt-3 flex items-center gap-2 flex-wrap text-xs" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="px-2 py-0.5 rounded" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted)" }}>{f.owaspRef}</span>
              <span style={{ color: "var(--muted)" }}>{f.cweId}</span>
              <span className="px-2 py-0.5 rounded" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted)" }}>{f.category}</span>
              <span style={{ color: "var(--muted)", fontSize: 10 }}>v{f.appVersion}</span>
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
        <Suspense fallback={<div className="text-center py-24" style={{ color: "var(--muted)" }}>Loading…</div>}>
          <DashboardContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
