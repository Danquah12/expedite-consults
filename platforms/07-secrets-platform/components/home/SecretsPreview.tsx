"use client";
import Link from "next/link";
import { SECRETS } from "@/data/secrets";
import { severityColor, severityBg, severityBorder, statusColor, statusBg, maskSecret, locationIcon } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, ExternalLink, Flame } from "lucide-react";

export default function SecretsPreview() {
  const top = SECRETS.slice(0, 5);
  return (
    <section className="py-24" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "var(--critical)" }}>
            <Flame className="inline w-3.5 h-3.5 mr-1" />Live Detections
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Secrets Detected Across Your Repos</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
            Every secret is automatically validated against live APIs — showing you exactly what&apos;s still active and exploitable.
          </p>
        </div>

        <div className="space-y-3">
          {top.map((s, i) => (
            <Link key={s.id} href={`/finding/${s.id}`}
              className="block rounded-2xl p-5 transition-all duration-200 group"
              style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = severityColor(s.severity); el.style.boxShadow = `0 0 30px rgba(${s.severity === "Critical" ? "255,59,48" : "255,149,0"},0.12)`; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = ""; }}>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs font-mono px-2 py-1 rounded"
                  style={{ background: "var(--surface)", color: "var(--muted)" }}>{s.id}</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: severityBg(s.severity), border: `1px solid ${severityBorder(s.severity)}`, color: severityColor(s.severity) }}>
                  {s.severity}
                </span>
                <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex-1">{s.type}</span>
                <span className="font-mono text-xs redacted hidden md:block">{s.maskedValue.slice(0, 32)}…</span>
                <span className="px-2 py-1 rounded-lg text-xs" style={{ background: statusBg(s.status), color: statusColor(s.status) }}>
                  {s.validation}
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {locationIcon(s.locations[0].locationType)} {s.locations[0].file.split("/").pop()}:{s.locations[0].line}
                </span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--muted)" }} />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}>
            View All {SECRETS.length} Secrets
          </Link>
        </div>
      </div>
    </section>
  );
}
