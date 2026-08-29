"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Scale } from "lucide-react";
import { SCA_FINDINGS } from "@/data/findings";
import { severityHex, severityBgHex, statusColor, statusBg, ecosystemIcon, cvssColor, epssLabel } from "@/lib/utils";

export default function FindingsTable() {
  const top = SCA_FINDINGS.slice(0, 6);
  return (
    <section className="py-24" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)", color: "var(--critical)" }}>
            Live Findings
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Top Vulnerabilities Detected</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
            Prioritized by CVSS score, EPSS exploitability probability, and whether a fix is available.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{ background: "var(--background)", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
            <div className="col-span-3">Package</div>
            <div className="col-span-2">CVE</div>
            <div className="col-span-1">CVSS</div>
            <div className="col-span-1">Severity</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">EPSS</div>
            <div className="col-span-1">Fix</div>
          </div>

          {top.map((f, i) => {
            const topCve = f.cves[0];
            return (
              <Link key={f.id} href={`/finding/${f.id}`}
                className="grid grid-cols-12 gap-3 px-6 py-4 items-center transition-colors group hover:bg-white/[0.02]"
                style={{ borderBottom: i < top.length - 1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = `${severityBgHex(f.severity)}`)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{ecosystemIcon(f.ecosystem)}</span>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{f.packageName}</div>
                      <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>v{f.packageVersion}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  {topCve
                    ? <span className="text-xs font-mono" style={{ color: "var(--primary)" }}>{topCve.id}</span>
                    : <span className="text-xs" style={{ color: "var(--muted)" }}>License Risk</span>}
                </div>
                <div className="col-span-1">
                  {topCve
                    ? <span className="text-sm font-bold" style={{ color: cvssColor(topCve.cvss) }}>{topCve.cvss.toFixed(1)}</span>
                    : <span className="text-xs" style={{ color: "var(--muted)" }}>—</span>}
                </div>
                <div className="col-span-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: severityBgHex(f.severity), color: severityHex(f.severity) }}>
                    {f.severity}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="px-2 py-1 rounded-lg text-[10px] font-medium"
                    style={{ background: statusBg(f.status), color: statusColor(f.status) }}>
                    {f.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs" style={{ color: topCve?.epss && topCve.epss > 0.1 ? "var(--critical)" : "var(--muted)" }}>
                    {topCve ? epssLabel(topCve.epss) : "—"}
                  </span>
                </div>
                <div className="col-span-1">
                  {f.fixAvailable
                    ? <CheckCircle2 className="w-4 h-4" style={{ color: "var(--low)" }} />
                    : <AlertTriangle className="w-4 h-4" style={{ color: "var(--critical)" }} />}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
            View All {SCA_FINDINGS.length} Findings
          </Link>
        </div>
      </div>
    </section>
  );
}
