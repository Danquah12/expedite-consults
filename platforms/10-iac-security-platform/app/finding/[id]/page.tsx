import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FINDINGS } from "@/data/findings";
import { sevColor, sevBg, sevBorder, providerColor, providerBg, frameworkColor, categoryIcon } from "@/lib/utils";
import { ArrowLeft, Clock, User, FileCode } from "lucide-react";

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
                style={{ color: providerColor(f.provider), background: providerBg(f.provider), border: `1px solid ${providerColor(f.provider)}50` }}>
                {f.provider}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{ color: frameworkColor(f.framework), background: "var(--surface)", border: "1px solid var(--border)" }}>
                {f.framework}
              </span>
              <span className="text-lg">{categoryIcon(f.category)}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{f.category}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{f.title}</h1>
            <div className="flex items-center gap-2 text-sm flex-wrap" style={{ color: "var(--muted)" }}>
              <FileCode className="w-4 h-4" />
              <span className="font-mono">{f.file}</span>
              <span>line {f.line}</span>
              <span>·</span>
              <span className="font-mono">{f.resource}</span>
              <span className="px-2 py-0.5 rounded text-xs"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--primary)" }}>
                {f.ruleId}
              </span>
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

              {/* Code comparison */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-lg font-bold text-white mb-4">💻 Code Comparison</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-xs font-semibold text-white">Vulnerable — {f.file}:{f.line}</span>
                    </div>
                    <pre className="code-block text-red-300">{f.codeSnippet}</pre>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="text-xs font-semibold text-white">Fixed</span>
                    </div>
                    <pre className="code-block text-green-300">{f.codeFix}</pre>
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
              {/* Details */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold text-white mb-4">📌 Details</h2>
                <div className="space-y-2">
                  {[
                    { label: "Severity",   value: f.severity,   color: sevColor(f.severity) },
                    { label: "Category",   value: f.category,   color: "var(--primary)" },
                    { label: "Framework",  value: f.framework,  color: frameworkColor(f.framework) },
                    { label: "Provider",   value: f.provider,   color: providerColor(f.provider) },
                    { label: "Status",     value: f.status,     color: f.status === "Open" ? "var(--critical)" : "var(--low)" },
                    { label: "Rule ID",    value: f.ruleId,     color: "var(--muted)" },
                    { label: "Resource",   value: f.resource,   color: "var(--foreground)" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 text-xs"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>{item.label}</span>
                      <span className="font-semibold font-mono truncate max-w-32" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold text-white mb-4">📜 Compliance</h2>
                <div className="space-y-2">
                  {f.complianceRefs.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 text-xs"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <span className="px-2 py-0.5 rounded font-bold flex-shrink-0"
                        style={{ background: "rgba(249,115,22,0.1)", color: "var(--primary)", border: "1px solid rgba(249,115,22,0.3)" }}>
                        {c.control}
                      </span>
                      <span style={{ color: "var(--muted)" }}>{c.framework}</span>
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

              {/* Related */}
              <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-bold text-white mb-3">Related Findings</h3>
                <div className="space-y-2">
                  {FINDINGS.filter(rf => rf.id !== f.id && rf.provider === f.provider).slice(0, 3).map(rf => (
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
