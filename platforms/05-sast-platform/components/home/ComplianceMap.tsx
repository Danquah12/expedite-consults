import { CheckCircle2, MinusCircle } from "lucide-react";
import { COMPLIANCE_FRAMEWORKS } from "@/data/compliance";

export default function ComplianceMap() {
  return (
    <section id="compliance" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div
          className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }}
        >
          Compliance Coverage
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Every Major Framework. Automated.</h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
          Every finding is automatically mapped to the relevant compliance controls, turning vulnerability reports into audit-ready evidence packages.
        </p>
      </div>

      <div className="space-y-6">
        {COMPLIANCE_FRAMEWORKS.map((fw) => (
          <div key={fw.name} className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div
              className="flex items-center gap-3 px-6 py-4"
              style={{ background: `${fw.color}15`, borderBottom: "1px solid var(--border)" }}
            >
              <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: fw.color, color: "#fff" }}>
                {fw.name}
              </div>
              <span className="text-sm" style={{ color: "var(--muted)" }}>v{fw.version}</span>
              <div className="ml-auto text-sm" style={{ color: "var(--muted)" }}>
                {fw.categories.filter(c => c.covered).length}/{fw.categories.length} controls covered
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
              {fw.categories.map((cat) => (
                <div key={cat.ref} className="flex items-center gap-3 px-5 py-3.5" style={{ background: "var(--surface)" }}>
                  {cat.covered
                    ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--low)" }} />
                    : <MinusCircle  className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted)" }} />}
                  <div className="min-w-0">
                    <div className="text-xs font-mono" style={{ color: cat.covered ? "var(--primary)" : "var(--muted)" }}>{cat.ref}</div>
                    <div className="text-xs truncate text-white">{cat.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
