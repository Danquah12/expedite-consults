import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SECRETS } from "@/data/secrets";
import { severityColor, severityBg, severityBorder, statusColor, statusBg, validationColor, entropyColor, locationIcon, formatAge } from "@/lib/utils";
import { ArrowLeft, Clock, User, GitBranch, ExternalLink, AlertTriangle, CheckCircle2, RotateCcw, ShieldAlert, Flame } from "lucide-react";

export async function generateStaticParams() {
  return SECRETS.map(s => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = SECRETS.find(s => s.id === id);
  if (!s) return { title: "Not Found" };
  return { title: `${s.id} — ${s.type}`, description: s.blastRadius };
}

export default async function FindingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = SECRETS.find(s => s.id === id);
  if (!s) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors"
            style={{ color: "var(--muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-xs font-mono px-3 py-1 rounded-lg"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--primary)" }}>{s.id}</span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{ background: severityBg(s.severity), border: `1px solid ${severityBorder(s.severity)}`, color: severityColor(s.severity) }}>
                {s.severity}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs"
                style={{ background: statusBg(s.status), color: statusColor(s.status) }}>{s.status}</span>
              {s.validation === "Verified Live" && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(255,59,48,0.15)", color: "var(--critical)", border: "1px solid rgba(255,59,48,0.35)" }}>
                  <Flame className="w-3.5 h-3.5" /> VERIFIED LIVE — Credential Active
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">{s.type}</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>{s.service} · {s.environment} · First detected {formatAge(s.age)} ago</p>
          </div>

          {/* Redacted secret */}
          <div className="rounded-2xl p-5" style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--primary)" }}>DETECTED SECRET (REDACTED)</div>
            <div className="font-mono text-sm break-all" style={{ color: "var(--primary)" }}>{s.maskedValue}</div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs" style={{ color: "var(--muted)" }}>
              <span>Prefix: <span className="font-mono text-white">{s.prefix}</span></span>
              <span>Rule: <span className="font-mono text-white">{s.ruleId}</span></span>
              <span>Entropy: <span style={{ color: entropyColor(s.entropy.score) }}>{s.entropy.score.toFixed(1)} ({s.entropy.label})</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">

              {/* Blast Radius */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" style={{ color: "var(--critical)" }} /> Blast Radius
                </h2>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--muted)" }}>{s.blastRadius}</p>
                <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                  <div className="text-xs font-semibold text-white mb-1">Access Scope</div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{s.accessScope}</p>
                </div>
              </div>

              {/* Locations */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-4">📍 Detected Locations ({s.locations.length})</h2>
                <div className="space-y-3">
                  {s.locations.map((loc, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span>{locationIcon(loc.locationType)}</span>
                        <span className="text-xs px-2 py-0.5 rounded"
                          style={{ background: "var(--surface)", color: "var(--primary)", border: "1px solid var(--border)" }}>
                          {loc.locationType}
                        </span>
                        <span className="text-xs font-mono text-white">{loc.file}</span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>:{loc.line}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--muted)" }}>
                        <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{loc.branch}</span>
                        <span>Commit: <span className="font-mono text-white">{loc.commit}</span></span>
                        <span>By: {loc.author}</span>
                        <span>{new Date(loc.committedAt).toLocaleDateString()}</span>
                        <span className="font-mono text-xs">{loc.repository}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {s.inGitHistory && (
                  <div className="mt-3 rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
                    style={{ background: "rgba(255,149,0,0.08)", border: "1px solid rgba(255,149,0,0.25)" }}>
                    <AlertTriangle className="w-4 h-4" style={{ color: "var(--high)" }} />
                    <span style={{ color: "var(--high)" }}>This secret is buried in git history — git purge required even after removal from current code.</span>
                  </div>
                )}
              </div>

              {/* Remediation */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="text-lg font-bold text-white">🔧 Remediation Steps</h2>
                  {s.rotationUrl && (
                    <a href={s.rotationUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}>
                      <RotateCcw className="w-3.5 h-3.5" /> Rotate Now
                    </a>
                  )}
                </div>
                <div className="space-y-2">
                  {s.remediationSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "var(--primary)" }}>
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
              {/* Risk */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold text-white mb-4">⚡ Risk Context</h2>
                <div className="space-y-2">
                  {[
                    { label: "Validation",      value: s.validation,                    color: validationColor(s.validation) },
                    { label: "Internet Exposed", value: s.internetExposed ? "Yes" : "No", color: s.internetExposed ? "var(--critical)" : "var(--low)" },
                    { label: "In Git History",  value: s.inGitHistory ? "Yes" : "No",   color: s.inGitHistory ? "var(--high)" : "var(--low)" },
                    { label: "Age",             value: formatAge(s.age),                color: s.age > 30 ? "var(--critical)" : "var(--medium)" },
                    { label: "Environment",     value: s.environment,                   color: s.environment === "Production" ? "var(--critical)" : "var(--medium)" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 text-xs"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>{item.label}</span>
                      <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entropy */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold text-white mb-4">Entropy Analysis</h2>
                <div className="text-center mb-3">
                  <div className="text-4xl font-black mb-1" style={{ color: entropyColor(s.entropy.score) }}>
                    {s.entropy.score.toFixed(1)}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>Shannon Entropy / 8.0</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: entropyColor(s.entropy.score) }}>
                    {s.entropy.label}
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--background)" }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${(s.entropy.score / 8) * 100}%`, background: entropyColor(s.entropy.score) }} />
                </div>
                <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
                  High entropy confirms this is a real credential, not a test value or placeholder.
                </p>
              </div>

              {/* Meta */}
              <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="space-y-2 text-xs" style={{ color: "var(--muted)" }}>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />
                    SLA: <span className="text-white">{s.slaDeadline}</span></div>
                  <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" />
                    Owner: <span className="text-white">{s.owner}</span></div>
                  <div className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5" />
                    <a href={s.locations[0].repository} className="hover:text-white transition-colors truncate">
                      {s.locations[0].repository}
                    </a>
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
