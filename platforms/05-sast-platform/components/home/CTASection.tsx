import Link from "next/link";
import { Play, ArrowRight, ShieldCheck } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
          style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)" }}
        >
          <ShieldCheck className="w-8 h-8" style={{ color: "var(--primary)" }} />
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
          Start Finding Real Vulnerabilities{" "}
          <span style={{ color: "var(--primary)" }}>Today</span>
        </h2>

        <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
          Run an interactive demo scan now, or explore 27 real findings in the live dashboard. No sign-up required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/scan"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #00d4ff, #0098b8)", color: "#0a0f1a" }}
          >
            <Play className="w-5 h-5" />
            Run Demo Scan
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all hover:text-white"
            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
          >
            View Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: "var(--muted)" }}>
          {["✓ OWASP Benchmark tested", "✓ Multi-engine validation", "✓ < 2s per file analysis", "✓ 27+ CWE categories", "✓ 5-layer false positive reduction"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
