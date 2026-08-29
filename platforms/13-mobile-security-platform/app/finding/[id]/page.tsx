import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FINDINGS } from "@/data/findings";
import { sevColor, sevBg, sevBorder, platformColor, platformBg, categoryIcon } from "@/lib/utils";
import { ArrowLeft, Clock, User, Smartphone } from "lucide-react";

export async function generateStaticParams() {
  return FINDINGS.map(f => ({ id: f.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = FINDINGS.find(f => f.id === id);
  if (!f) return { title: "Not Found" };
  return { title: `${f.id} — ${f.title}`, description: f.description };
}

export default async function FindingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = FINDINGS.find(f => f.id === id);
  if (!f) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors"
            style={{ color: "var(--muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-xs font-mono px-3 py-1 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--primary)" }}>{f.id}</span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: sevBg(f.severity), border: `1px solid ${sevBorder(f.severity)}`, color: sevColor(f.severity) }}>{f.severity}</span>
              <span className="text-lg">{categoryIcon(f.category)}</span>
              <span className="px-3 py-1 rounded text-xs font-semibold" style={{ color: platformColor(f.platform), background: platformBg(f.platform) }}>{f.platform}</span>
              <span className="px-3 py-1 rounded text-xs" style={{ background: "rgba(236,72,153,0.08)", color: "var(--primary)", border: "1px solid rgba(236,72,153,0.25)" }}>{f.owaspRef}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{f.cweId}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{f.title}</h1>
            <code className="text-sm" style={{ color: "var(--muted)" }}>{f.file}{f.line ? `:${f.line}` : ""}</code>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-3">📋 Description</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{f.description}</p>
              </div>

              <div className="rounded-2xl p-6" style={{ background: "rgba(255,59,48,0.04)", border: "1px solid rgba(255,59,48,0.2)" }}>
                <h2 className="text-lg font-bold text-white mb-3">💥 Impact</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{f.impact}</p>
              </div>

              {/* Code blocks */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-4">🔍 Vulnerable Code</h2>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Decompiled / Source</span>
                </div>
                <pre className="code-block" style={{ color: "#ef5350" }}>{f.codeExample}</pre>
              </div>

              <div className="rounded-2xl p-6" style={{ background: "rgba(52,199,89,0.04)", border: "1px solid rgba(52,199,89,0.2)" }}>
                <h2 className="text-lg font-bold text-white mb-4">✅ Fixed Code</h2>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Remediated</span>
                </div>
                <pre className="code-block" style={{ color: "#34c759" }}>{f.codeFix}</pre>
              </div>

              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-3">🔧 Remediation</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{f.remediation}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold text-white mb-4">📌 Details</h2>
                <div className="space-y-2">
                  {[
                    { label: "Severity",  value: f.severity,  color: sevColor(f.severity) },
                    { label: "Platform",  value: f.platform,  color: platformColor(f.platform) },
                    { label: "Category",  value: f.category,  color: "var(--primary)" },
                    { label: "Status",    value: f.status,    color: f.status === "Open" ? "var(--critical)" : "var(--low)" },
                    { label: "OWASP",     value: f.owaspRef,  color: "var(--primary)" },
                    { label: "CWE",       value: f.cweId,     color: "var(--muted)" },
                    { label: "App ID",    value: f.appId,     color: "var(--muted)" },
                    { label: "Version",   value: f.appVersion,color: "var(--muted)" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 text-xs" style={{ borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>{item.label}</span>
                      <span className="font-semibold font-mono" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="space-y-2 text-xs" style={{ color: "var(--muted)" }}>
                  <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" />Owner: <span className="text-white">{f.owner}</span></div>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />Detected: <span className="text-white">{f.detectedAt}</span></div>
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-bold text-white mb-3">Related Findings</h3>
                <div className="space-y-2">
                  {FINDINGS.filter(rf => rf.id !== f.id && rf.platform === f.platform).slice(0, 3).map(rf => (
                    <Link key={rf.id} href={`/finding/${rf.id}`}
                      className="flex items-center gap-2 text-xs hover:text-white transition-colors"
                      style={{ color: "var(--muted)" }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sevColor(rf.severity) }} />
                      <span className="truncate">{rf.title}</span>
                    </Link>
                  ))}
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
