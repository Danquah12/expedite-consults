"use client";
import Link from "next/link";
import { Container, ArrowRight, Play, ShieldAlert, Layers, AlertTriangle } from "lucide-react";
import { IMAGES, REGISTRY_SUMMARY } from "@/data/images";
import { sevColor, sevBg, statusColor, statusBg, formatBytes, shortDigest } from "@/lib/utils";

const SCANNERS = ["Trivy", "Grype", "Syft", "Docker Scout", "Anchore", "Clair"];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar placeholder — imported in layout */}
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium"
              style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.25)", color: "var(--primary)" }}>
              <Container className="w-3.5 h-3.5" /> Platform 8 of 34 — Container Security
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Scan Every Layer.{" "}
              <br />
              <span style={{ color: "var(--primary)" }}>Secure Every Image.</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--muted)" }}>
              Layer-by-layer analysis of Docker images for <span className="text-white">CVEs</span>,{" "}
              <span className="text-white">misconfigurations</span>, <span className="text-white">secrets</span>, and{" "}
              <span className="text-white">malware</span> — across your entire registry, CI/CD pipeline, and running Kubernetes workloads.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/scan"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold transition-all hover:opacity-90 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)", color: "#000" }}>
                <Play className="w-4 h-4" /> Scan Docker Image
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition-all hover:text-white"
                style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                Registry Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-12">
              {[
                { v: REGISTRY_SUMMARY.totalImages.toString(),      l: "Images Scanned",    c: "var(--primary)" },
                { v: REGISTRY_SUMMARY.totalVulns.toString(),       l: "CVEs Found",        c: "var(--critical)" },
                { v: REGISTRY_SUMMARY.criticalImages.toString(),   l: "Critical Images",   c: "var(--critical)" },
                { v: REGISTRY_SUMMARY.totalMisconfigs.toString(),  l: "Misconfigurations", c: "var(--high)" },
                { v: "16",                                          l: "Layers Analyzed",   c: "var(--primary)" },
              ].map(s => (
                <div key={s.l} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="text-2xl font-black mb-0.5" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Scanner marquee */}
            <div className="overflow-hidden mb-16">
              <div className="marquee-track inline-flex gap-6 whitespace-nowrap">
                {[...SCANNERS, ...SCANNERS].map((s, i) => (
                  <span key={i} className="px-4 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", color: "var(--primary)" }}>
                    🐳 {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Image cards preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {IMAGES.map(img => (
                <Link key={img.id} href={`/image/${img.id}`}
                  className="text-left rounded-2xl p-5 transition-all duration-200 group"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = img.status === "Critical" ? "var(--critical)" : "var(--high)"; el.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.transform = ""; }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">{img.name}</div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: "var(--muted)" }}>:{img.tag} · {shortDigest(img.digest)}</div>
                    </div>
                    <span className="px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0"
                      style={{ background: statusBg(img.status), color: statusColor(img.status) }}>
                      {img.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {img.criticalCount > 0 && <span style={{ color: "var(--critical)" }}>🔴 {img.criticalCount} Critical</span>}
                    {img.highCount > 0 && <span style={{ color: "var(--high)" }}>🟠 {img.highCount} High</span>}
                    <span style={{ color: "var(--muted)" }}>· {img.layerCount} layers · {formatBytes(img.sizeBytes)}</span>
                  </div>
                  {img.isRunning && (
                    <div className="mt-2 text-xs" style={{ color: "var(--primary)" }}>
                      ● Running · {img.replicaCount} replicas · {img.namespace}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
