import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { IMAGES } from "@/data/images";
import { sevColor, sevBg, sevBorder, statusColor, statusBg, fixStatusColor, formatBytes, shortDigest } from "@/lib/utils";
import { ArrowLeft, Layers, AlertTriangle, CheckCircle2, Clock, User, ShieldAlert, Activity } from "lucide-react";

export async function generateStaticParams() {
  return IMAGES.map(img => ({ id: img.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const img = IMAGES.find(i => i.id === id);
  if (!img) return { title: "Not Found" };
  return { title: `${img.name}:${img.tag} — Container Security`, description: `${img.totalVulns} vulnerabilities, ${img.misconfigs.length} misconfigurations` };
}

export default async function ImageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const img = IMAGES.find(i => i.id === id);
  if (!img) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors"
            style={{ color: "var(--muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Back to Registry
          </Link>

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-xs font-mono px-3 py-1 rounded-lg"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--primary)" }}>{img.id}</span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{ background: statusBg(img.status), color: statusColor(img.status) }}>{img.status}</span>
              {img.isRunning && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(52,199,89,0.1)", color: "var(--low)", border: "1px solid rgba(52,199,89,0.25)" }}>
                  <Activity className="w-3 h-3" /> Running · {img.replicaCount} replicas · {img.namespace}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">
              🐳 {img.name}<span className="text-lg font-mono ml-2" style={{ color: "var(--muted)" }}>:{img.tag}</span>
            </h1>
            <div className="text-sm font-mono" style={{ color: "var(--muted)" }}>
              sha256:{shortDigest(img.digest)} · {img.os} · {img.arch} · {formatBytes(img.sizeBytes)} · {img.layerCount} layers
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                { l: "Critical CVEs", v: img.criticalCount, c: "var(--critical)", bg: "rgba(255,59,48,0.08)", border: "rgba(255,59,48,0.25)" },
                { l: "High CVEs",     v: img.highCount,     c: "var(--high)",    bg: "rgba(255,149,0,0.08)", border: "rgba(255,149,0,0.25)" },
                { l: "Total CVEs",    v: img.totalVulns,    c: "var(--primary)", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)" },
                { l: "Misconfigs",    v: img.misconfigs.length, c: "var(--high)", bg: "rgba(255,149,0,0.08)", border: "rgba(255,149,0,0.25)" },
              ].map(m => (
                <div key={m.l} className="rounded-xl px-4 py-2.5" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                  <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "var(--muted)" }}>{m.l}</div>
                  <div className="text-xl font-black" style={{ color: m.c }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">

              {/* CVEs table */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-4">🔴 Vulnerabilities ({img.totalVulns})</h2>
                <div className="space-y-3">
                  {img.cves.map(cve => (
                    <div key={cve.id} className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold" style={{ color: "var(--primary)" }}>{cve.id}</span>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                            style={{ background: sevBg(cve.severity), color: sevColor(cve.severity) }}>{cve.severity}</span>
                          <span className="text-sm font-bold" style={{ color: sevColor(cve.severity) }}>CVSS {cve.cvss}</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ color: fixStatusColor(cve.fixStatus), background: "var(--surface)" }}>{cve.fixStatus}</span>
                      </div>
                      <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                        <span className="text-white font-semibold">{cve.packageName}</span>
                        {" "}<span style={{ color: "var(--critical)" }}>v{cve.installedVer}</span>
                        {cve.fixedVer && <span> → <span style={{ color: "var(--low)" }}>v{cve.fixedVer}</span></span>}
                        {" "}<span>· Layer {shortDigest(cve.layer)}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{cve.description}</p>
                    </div>
                  ))}
                  {img.totalVulns > img.cves.length && (
                    <div className="text-center py-4 text-sm" style={{ color: "var(--muted)" }}>
                      + {img.totalVulns - img.cves.length} more vulnerabilities in full report
                    </div>
                  )}
                </div>
              </div>

              {/* Misconfigurations */}
              {img.misconfigs.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <h2 className="text-lg font-bold text-white mb-4">⚙️ Misconfigurations ({img.misconfigs.length})</h2>
                  <div className="space-y-3">
                    {img.misconfigs.map(mc => (
                      <div key={mc.id} className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-xs font-mono"
                            style={{ background: "var(--surface)", color: "var(--primary)", border: "1px solid var(--border)" }}>{mc.rule}</span>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                            style={{ background: sevBg(mc.severity), color: sevColor(mc.severity) }}>{mc.severity}</span>
                          <span className="text-sm font-semibold text-white">{mc.title}</span>
                        </div>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--muted)" }}>{mc.description}</p>
                        <p className="text-xs" style={{ color: "var(--low)" }}>✓ Fix: {mc.remediation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Layer analysis */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5" style={{ color: "var(--primary)" }} /> Layer Analysis
                </h2>
                <div className="space-y-2">
                  {img.layers.map((layer, i) => (
                    <div key={layer.digest} className="rounded-xl p-3 flex items-center gap-4"
                      style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                      <div className="flex-shrink-0 text-xs font-mono" style={{ color: "var(--muted)", width: 80 }}>
                        {shortDigest(layer.digest)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono truncate text-white">{layer.command}</div>
                      </div>
                      <div className="flex-shrink-0 text-xs" style={{ color: "var(--muted)" }}>{formatBytes(layer.size)}</div>
                      <div className="flex-shrink-0">
                        {layer.vulnCount > 0
                          ? <span className="text-xs font-bold" style={{ color: "var(--critical)" }}>{layer.vulnCount} CVEs</span>
                          : <CheckCircle2 className="w-4 h-4" style={{ color: "var(--low)" }} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-4">🔧 Remediation</h2>
                {img.baseImageFix && (
                  <div className="rounded-xl p-4 mb-4"
                    style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.25)" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: "var(--low)" }}>Recommended base image upgrade</div>
                    <div className="flex items-center gap-3 text-sm font-mono">
                      <span style={{ color: "var(--critical)" }}>{img.baseImage}</span>
                      <span style={{ color: "var(--muted)" }}>→</span>
                      <span style={{ color: "var(--low)" }}>{img.baseImageFix}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {img.remediationSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", color: "var(--primary)" }}>
                        {i + 1}
                      </div>
                      <span style={{ color: "var(--muted)" }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Risk flags */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold text-white mb-4">⚡ Security Posture</h2>
                <div className="space-y-2">
                  {[
                    { label: "Root User",        value: img.hasRootUser    ? "Yes ❌" : "No ✓",  danger: img.hasRootUser },
                    { label: "Privileged",        value: img.hasPrivileged  ? "Yes ❌" : "No ✓",  danger: img.hasPrivileged },
                    { label: "Read-only FS",      value: img.noReadOnly     ? "No ❌" : "Yes ✓",  danger: img.noReadOnly },
                    { label: "Internet Facing",   value: img.internetFacing ? "Yes" : "No",       danger: img.internetFacing },
                    { label: "Currently Running", value: img.isRunning ? "Yes" : "No",             danger: img.isRunning && img.status === "Critical" },
                    { label: "Base Image",        value: img.baseImage,                           danger: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 text-xs"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>{item.label}</span>
                      <span className="font-semibold" style={{ color: item.danger ? "var(--critical)" : "var(--low)" }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              {img.complianceRefs.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <h2 className="text-base font-bold text-white mb-4">📋 Compliance</h2>
                  <div className="space-y-3">
                    {img.complianceRefs.map((c, i) => (
                      <div key={i} className="rounded-xl p-3" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: "var(--primary)", color: "#000" }}>{c.ref}</span>
                          <span className="text-xs font-semibold text-white">{c.framework}</span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="space-y-2 text-xs" style={{ color: "var(--muted)" }}>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />SLA: <span className="text-white">{img.slaDeadline}</span></div>
                  <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" />Owner: <span className="text-white">{img.owner}</span></div>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />Scanned: <span className="text-white">{new Date(img.scannedAt).toLocaleString()}</span></div>
                  <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <span className="font-semibold text-white">Scanner: </span>{img.scanner}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
