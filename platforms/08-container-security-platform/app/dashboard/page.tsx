"use client";
import { Suspense } from "react";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { IMAGES, REGISTRY_SUMMARY } from "@/data/images";
import { sevColor, sevBg, statusColor, statusBg, formatBytes, shortDigest } from "@/lib/utils";
import { ExternalLink, Layers, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import type { ImageStatus } from "@/types/container";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = (searchParams.get("status") ?? "All") as ImageStatus | "All";

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All") params.delete(key); else params.set(key, value);
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const results = filter === "All" ? IMAGES : IMAGES.filter(i => i.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Container Registry</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {REGISTRY_SUMMARY.totalImages} images · {REGISTRY_SUMMARY.totalVulns} CVEs · {REGISTRY_SUMMARY.totalMisconfigs} misconfigurations
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl text-sm"
          style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.25)", color: "var(--primary)" }}>
          🐳 Trivy · Grype · Syft · CIS Docker Benchmark
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Critical Images", value: REGISTRY_SUMMARY.criticalImages,   color: "var(--critical)", bg: "rgba(255,59,48,0.06)",  border: "rgba(255,59,48,0.2)" },
          { label: "Total CVEs",      value: REGISTRY_SUMMARY.totalVulns,       color: "var(--critical)", bg: "rgba(255,59,48,0.06)",  border: "rgba(255,59,48,0.2)" },
          { label: "Misconfigs",      value: REGISTRY_SUMMARY.totalMisconfigs,  color: "var(--high)",    bg: "rgba(255,149,0,0.06)",  border: "rgba(255,149,0,0.2)" },
          { label: "Images Scanned",  value: REGISTRY_SUMMARY.totalImages,      color: "var(--primary)", bg: "rgba(56,189,248,0.06)", border: "rgba(56,189,248,0.2)" },
        ].map(m => (
          <div key={m.label} className="rounded-2xl p-5" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>{m.label}</div>
            <div className="text-4xl font-black" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(["All", "Critical", "Vulnerable", "Clean"] as const).map(tab => (
          <button key={tab} onClick={() => update("status", tab)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: filter === tab ? "rgba(56,189,248,0.12)" : "var(--surface)",
              border: `1px solid ${filter === tab ? "rgba(56,189,248,0.4)" : "var(--border)"}`,
              color: filter === tab ? "var(--primary)" : "var(--muted)",
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Image cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map(img => (
          <Link key={img.id} href={`/image/${img.id}`}
            className="block rounded-2xl p-6 transition-all duration-200 group"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = img.status === "Critical" ? "var(--critical)" : img.status === "Vulnerable" ? "var(--high)" : "var(--low)"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 8px 32px ${img.status === "Critical" ? "rgba(255,59,48,0.15)" : "rgba(56,189,248,0.1)"}`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.transform = ""; el.style.boxShadow = ""; }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🐳</span>
                  <span className="text-base font-bold text-white group-hover:text-sky-400 transition-colors truncate">{img.name}</span>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: "var(--background)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                    :{img.tag}
                  </span>
                </div>
                <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                  sha256:{shortDigest(img.digest)} · {img.os} · {formatBytes(img.sizeBytes)}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                <span className="px-2 py-1 rounded-lg text-xs font-bold"
                  style={{ background: statusBg(img.status), color: statusColor(img.status) }}>
                  {img.status}
                </span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--muted)" }} />
              </div>
            </div>

            {/* CVE severity bar */}
            <div className="flex items-center gap-2 mb-3">
              {img.criticalCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(255,59,48,0.1)", color: "var(--critical)", border: "1px solid rgba(255,59,48,0.25)" }}>
                  🔴 {img.criticalCount} Critical
                </span>
              )}
              {img.highCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(255,149,0,0.08)", color: "var(--high)", border: "1px solid rgba(255,149,0,0.2)" }}>
                  🟠 {img.highCount} High
                </span>
              )}
              {img.mediumCount > 0 && (
                <span className="text-xs" style={{ color: "var(--muted)" }}>+{img.mediumCount} med</span>
              )}
              <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>{img.totalVulns} total</span>
            </div>

            {/* Misconfig badges */}
            {img.misconfigs.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                {img.hasRootUser && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,59,48,0.08)", color: "var(--critical)" }}>root user</span>}
                {img.hasPrivileged && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,59,48,0.08)", color: "var(--critical)" }}>privileged</span>}
                {img.noReadOnly && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,149,0,0.08)", color: "var(--high)" }}>writable root</span>}
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-3"
              style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <Layers className="w-3.5 h-3.5" />
                <span>{img.layerCount} layers</span>
              </div>
              {img.isRunning && (
                <div className="flex items-center gap-1.5" style={{ color: "var(--low)" }}>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live · {img.replicaCount}× · {img.namespace}</span>
                </div>
              )}
              <div className="flex items-center gap-1" style={{ color: "var(--muted)" }}>
                <span>{img.registry}</span>
              </div>
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
