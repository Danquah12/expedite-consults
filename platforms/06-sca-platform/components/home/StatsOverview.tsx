import { DEPENDENCY_STATS, LICENSE_SUMMARY, ECOSYSTEM_BREAKDOWN } from "@/data/findings";
import { licenseRiskColor, licenseRiskBg, ecosystemIcon } from "@/lib/utils";
import { Package, AlertTriangle, ShieldCheck, FileText } from "lucide-react";

export default function StatsOverview() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--primary)" }}>
          Dependency Intelligence
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Full Visibility. Zero Surprises.</h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
          Every dependency — direct and transitive — is catalogued, enriched with CVE data, and assessed for license risk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dep breakdown */}
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <Package className="w-4 h-4" style={{ color: "var(--primary)" }} /> Dependency Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { label: "Total Dependencies", value: DEPENDENCY_STATS.total.toLocaleString(), color: "var(--primary)" },
              { label: "Direct",             value: DEPENDENCY_STATS.direct.toString(),      color: "var(--foreground)" },
              { label: "Transitive",         value: DEPENDENCY_STATS.transitive.toLocaleString(), color: "var(--muted)" },
              { label: "Outdated",           value: DEPENDENCY_STATS.outdated.toString(),    color: "var(--medium)" },
              { label: "Vulnerable",         value: DEPENDENCY_STATS.vulnerable.toString(),  color: "var(--critical)" },
              { label: "License Issues",     value: DEPENDENCY_STATS.licenseIssues.toString(), color: "var(--high)" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--muted)" }}>{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* License summary */}
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: "#a78bfa" }} /> License Distribution
          </h3>
          <div className="space-y-3">
            {LICENSE_SUMMARY.map(l => (
              <div key={l.license} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium">{l.license}</span>
                    <span className="text-xs font-bold" style={{ color: licenseRiskColor(l.risk) }}>{l.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--background)" }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${(l.count / DEPENDENCY_STATS.total) * 100}%`, background: licenseRiskColor(l.risk) }} />
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md flex-shrink-0"
                  style={{ background: licenseRiskBg(l.risk), color: licenseRiskColor(l.risk) }}>
                  {l.risk}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ecosystem breakdown */}
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" style={{ color: "var(--low)" }} /> By Ecosystem
          </h3>
          <div className="space-y-4">
            {ECOSYSTEM_BREAKDOWN.map(e => (
              <div key={e.ecosystem}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{ecosystemIcon(e.ecosystem)}</span>
                    <span className="text-sm text-white font-medium">{e.ecosystem}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {e.vulnerable > 0 && (
                      <span className="text-xs font-bold" style={{ color: "var(--critical)" }}>
                        {e.vulnerable} vuln
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{e.count} total</span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--background)" }}>
                  <div className="h-full rounded-full flex overflow-hidden">
                    <div style={{ width: `${((e.count - e.vulnerable) / e.count) * 100}%`, background: "var(--primary)", opacity: 0.7 }} />
                    <div style={{ width: `${(e.vulnerable / e.count) * 100}%`, background: "var(--critical)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
