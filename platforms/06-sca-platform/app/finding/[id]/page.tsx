import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SCA_FINDINGS } from "@/data/findings";
import { severityHex, severityBgHex, severityBorderHex, statusColor, statusBg, ecosystemIcon, cvssColor, epssLabel, licenseRiskColor, licenseRiskBg, formatDate } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, AlertTriangle, GitBranch, Scale, ShieldAlert, Clock, User, ExternalLink } from "lucide-react";

export async function generateStaticParams() {
  return SCA_FINDINGS.map(f => ({ id: f.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = SCA_FINDINGS.find(f => f.id === id);
  if (!f) return { title: "Not Found" };
  return { title: `${f.id} — ${f.packageName}@${f.packageVersion}`, description: f.executiveSummary };
}

export default async function FindingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = SCA_FINDINGS.find(f => f.id === id);
  if (!f) notFound();

  const topCve = f.cves[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Breadcrumb */}
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
            style={{ color: "var(--muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-xs font-mono px-3 py-1 rounded-lg"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--primary)" }}>{f.id}</span>
              <span className="text-2xl">{ecosystemIcon(f.ecosystem)}</span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{ background: severityBgHex(f.severity), border: `1px solid ${severityBorderHex(f.severity)}`, color: severityHex(f.severity) }}>
                {f.severity}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-medium"
                style={{ background: statusBg(f.status), color: statusColor(f.status) }}>{f.status}</span>
              {f.activelyExploited && (
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(255,59,48,0.15)", color: "var(--critical)", border: "1px solid rgba(255,59,48,0.3)" }}>
                  ⚡ Actively Exploited in Wild
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {f.packageName} <span className="font-mono text-lg" style={{ color: "var(--muted)" }}>v{f.packageVersion}</span>
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {f.ecosystem} · {f.isDirect ? "Direct dependency" : `Transitive dependency (depth ${f.depth})`} · {f.dependentCount} dependent packages
            </p>

            {/* CVE metrics row */}
            {topCve && (
              <div className="flex flex-wrap gap-3 mt-4">
                {[
                  { label: "CVSS", value: topCve.cvss.toFixed(1), color: cvssColor(topCve.cvss) },
                  { label: "CVE",  value: topCve.id,              color: "var(--primary)" },
                  { label: "EPSS", value: `${(topCve.epss * 100).toFixed(1)}%`, color: topCve.epss > 0.1 ? "var(--critical)" : "var(--muted)" },
                  { label: "Published", value: formatDate(topCve.publishedAt), color: "var(--muted)" },
                  { label: "Fix in", value: topCve.patchedIn ? `v${topCve.patchedIn}` : "No fix", color: topCve.patchedIn ? "var(--low)" : "var(--critical)" },
                ].map(m => (
                  <div key={m.label} className="rounded-xl px-4 py-2.5"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "var(--muted)" }}>{m.label}</div>
                    <div className="text-sm font-bold" style={{ color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: main content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Executive Summary */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" style={{ color: "var(--critical)" }} /> Executive Summary
                </h2>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--muted)" }}>{f.executiveSummary}</p>
                <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                  <div className="text-xs font-semibold text-white mb-2">Business Impact</div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{f.businessImpact}</p>
                </div>
              </div>

              {/* All CVEs */}
              {f.cves.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <h2 className="text-lg font-bold text-white mb-4">🔴 CVE Details</h2>
                  <div className="space-y-4">
                    {f.cves.map(cve => (
                      <div key={cve.id} className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <span className="font-mono font-bold" style={{ color: "var(--primary)" }}>{cve.id}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: cvssColor(cve.cvss) }}>CVSS {cve.cvss.toFixed(1)}</span>
                            {cve.exploitInWild && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: "rgba(255,59,48,0.15)", color: "var(--critical)" }}>⚡ Exploited</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--muted)" }}>{cve.description}</p>
                        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
                          <span>Published: {formatDate(cve.publishedAt)}</span>
                          <span>EPSS: {epssLabel(cve.epss)}</span>
                          {cve.patchedIn && <span style={{ color: "var(--low)" }}>✓ Patched in v{cve.patchedIn}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remediation */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-4">🔧 Remediation</h2>
                {f.fixAvailable ? (
                  <div className="rounded-xl p-4 mb-4"
                    style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.25)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4" style={{ color: "var(--low)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--low)" }}>
                        Fix available — upgrade to v{f.fixVersion}
                        {f.breakingChange && <span className="ml-2 text-xs" style={{ color: "var(--high)" }}>(breaking change)</span>}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl p-4 mb-4"
                    style={{ background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.2)" }}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" style={{ color: "var(--critical)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--critical)" }}>No patch available — mitigation required</span>
                    </div>
                  </div>
                )}
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--muted)" }}>{f.remediation}</p>
                <div className="space-y-2">
                  {f.validationSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--primary)" }}>
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

              {/* Dependency Path */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4" style={{ color: "var(--primary)" }} /> Dependency Paths
                </h2>
                <div className="space-y-4">
                  {f.transitivePaths.map((path, i) => (
                    <div key={i} className="space-y-1">
                      {path.chain.map((pkg, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="flex flex-col items-center" style={{ width: 16 }}>
                            {j > 0 && <div className="w-px h-3" style={{ background: "var(--border)" }} />}
                            <div className="w-2 h-2 rounded-full"
                              style={{ background: j === path.chain.length - 1 ? "var(--critical)" : j === 0 ? "var(--primary)" : "var(--border)" }} />
                          </div>
                          <span className="text-xs font-mono"
                            style={{ color: j === path.chain.length - 1 ? "var(--critical)" : j === 0 ? "var(--primary)" : "var(--muted)" }}>
                            {pkg}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* License */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Scale className="w-4 h-4" style={{ color: "#a78bfa" }} /> License
                </h2>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1.5 rounded-lg text-sm font-bold"
                    style={{ background: licenseRiskBg(f.license.risk), color: licenseRiskColor(f.license.risk) }}>
                    {f.license.name}
                  </span>
                  <span className="text-xs" style={{ color: licenseRiskColor(f.license.risk) }}>{f.license.risk}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{f.license.notes}</p>
                <div className="mt-3 flex gap-3 text-xs" style={{ color: "var(--muted)" }}>
                  <span>{f.license.copyleft ? "⚠ Copyleft" : "✓ Non-copyleft"}</span>
                  <span>{f.license.commercial ? "✓ Commercial OK" : "✗ Commercial restricted"}</span>
                </div>
              </div>

              {/* Risk context */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold text-white mb-4">⚡ Risk Context</h2>
                <div className="space-y-2">
                  {[
                    { label: "Internet Facing",  value: f.internetFacing    ? "Yes" : "No",  danger: f.internetFacing },
                    { label: "Actively Exploited",value: f.activelyExploited ? "Yes" : "No", danger: f.activelyExploited },
                    { label: "Code Reachable",   value: f.reachable         ? "Yes" : "No",  danger: f.reachable },
                    { label: "Breaking Upgrade", value: f.breakingChange    ? "Yes" : "No",  warn: f.breakingChange },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 text-xs"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>{item.label}</span>
                      <span className="font-semibold"
                        style={{ color: item.danger ? "var(--critical)" : (item as any).warn ? "var(--high)" : "var(--low)" }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              {f.compliance.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <h2 className="text-base font-bold text-white mb-4">📋 Compliance</h2>
                  <div className="space-y-3">
                    {f.compliance.map((c, i) => (
                      <div key={i} className="rounded-xl p-3" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: "var(--primary)", color: "#fff", opacity: 0.9 }}>{c.reference}</span>
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
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>SLA: <span className="text-white">{f.slaDeadline}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Owner: <span className="text-white">{f.owner}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <a href={f.repository} className="hover:text-white transition-colors truncate">{f.repository}</a>
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
