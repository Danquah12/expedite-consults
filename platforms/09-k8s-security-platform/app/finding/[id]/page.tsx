import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FINDINGS } from "@/data/findings";
import { sevColor, sevBg, sevBorder, categoryIcon, categoryColor } from "@/lib/utils";
import { ArrowLeft, Clock, User, ExternalLink } from "lucide-react";

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

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-xs font-mono px-3 py-1 rounded-lg"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--primary)" }}>{f.id}</span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{ background: sevBg(f.severity), border: `1px solid ${sevBorder(f.severity)}`, color: sevColor(f.severity) }}>
                {f.severity}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ color: categoryColor(f.category), border: "1px solid var(--border)", background: "var(--surface)" }}>
                {categoryIcon(f.category)} {f.category}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-mono"
                style={{ background: "rgba(129,140,248,0.1)", color: "var(--primary)", border: "1px solid rgba(129,140,248,0.3)" }}>
                {f.cisRef}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{f.title}</h1>
            <div className="text-sm flex items-center gap-2 flex-wrap" style={{ color: "var(--muted)" }}>
              <span className="font-mono">{f.resource.kind}/{f.resource.name}</span>
              <span>· namespace: <span className="text-white">{f.resource.namespace}</span></span>
              <span>· apiVersion: <span className="font-mono text-white">{f.resource.apiVersion}</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">

              {/* Description */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-3">📋 Description</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{f.description}</p>
              </div>

              {/* Impact */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,59,48,0.04)", border: "1px solid rgba(255,59,48,0.2)" }}>
                <h2 className="text-lg font-bold text-white mb-3">💥 Impact</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{f.impact}</p>
              </div>

              {/* YAML comparison */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-4">📄 YAML Comparison</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-xs font-semibold text-white">Vulnerable Config</span>
                    </div>
                    <pre className="yaml-block text-red-300 overflow-x-auto whitespace-pre-wrap">{f.yamlSnippet}</pre>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="text-xs font-semibold text-white">Fixed Config</span>
                    </div>
                    <pre className="yaml-block text-green-300 overflow-x-auto whitespace-pre-wrap">{f.yamlFix}</pre>
                  </div>
                </div>
              </div>

              {/* Remediation */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-3">🔧 Remediation</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{f.remediation}</p>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold text-white mb-4">📌 Details</h2>
                <div className="space-y-2">
                  {[
                    { label: "Severity",   value: f.severity, color: sevColor(f.severity) },
                    { label: "Category",   value: f.category, color: categoryColor(f.category) },
                    { label: "Status",     value: f.status,   color: f.status === "Open" ? "var(--critical)" : "var(--low)" },
                    { label: "CIS Ref",    value: f.cisRef,   color: "var(--primary)" },
                    { label: "Resource",   value: `${f.resource.kind}/${f.resource.name}`, color: "var(--foreground)" },
                    { label: "Namespace",  value: f.resource.namespace, color: "var(--foreground)" },
                    { label: "Detected",   value: f.detectedAt, color: "var(--muted)" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 text-xs"
                      style={{ borderBottom: "1px solid var(--border)" }}>
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

              {/* Related findings */}
              <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-bold text-white mb-3">Related Findings</h3>
                <div className="space-y-2">
                  {FINDINGS.filter(rf => rf.id !== f.id && rf.category === f.category).slice(0, 3).map(rf => (
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
