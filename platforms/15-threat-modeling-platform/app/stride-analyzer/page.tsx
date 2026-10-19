"use client";

import Link from "next/link";
import { Shield, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

const strideVectors = [
  { code: "S", name: "Spoofing Identity", threats: 5, mitigated: 5, control: "OAuth 2.0 / OIDC + mTLS client certificates", status: "Verified" },
  { code: "T", name: "Tampering with Data", threats: 8, mitigated: 7, control: "Prepared SQL statements + KMS AES-GCM-256 config encryption", status: "1 Drift Alert" },
  { code: "R", name: "Repudiation", threats: 4, mitigated: 3, control: "Immutable WORM CloudTrail + Ed25519 signed audit ledger", status: "1 Drift Alert" },
  { code: "I", name: "Information Disclosure", threats: 7, mitigated: 6, control: "HashiCorp Vault secret injection + strict CORS allowlist", status: "1 Drift Alert" },
  { code: "D", name: "Denial of Service", threats: 6, mitigated: 6, control: "API Gateway token-bucket rate limiter + circuit breakers", status: "Verified" },
  { code: "E", name: "Elevation of Privilege", threats: 12, mitigated: 11, control: "Row-level tenant predicates + Kubernetes RBAC least privilege", status: "Verified" },
];

export default function StrideAnalyzerPage() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 max-w-3xl">
        <div className="desk-kicker">AXIOM THREAT DESK &middot; STRIDE TAXONOMY STUDIO</div>
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
          STRIDE Risk Identification &amp; Taxonomy Studio
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Decomposition of all 42 architectural threats across Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {strideVectors.map((v) => (
          <div key={v.code} className="card-surface p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--border)" }}>
                <span className="desk-kicker">STRIDE &middot; CATEGORY {v.code}</span>
                <span className={`${v.status === "Verified" ? "badge-resolved" : "badge-high"} px-2.5 py-0.5 rounded-full text-[11px] font-bold`}>
                  {v.status}
                </span>
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: "var(--accent)", color: "#fbf8f3" }}
                >
                  {v.code}
                </div>
                <h2 className="text-lg font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                  {v.name}
                </h2>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                <strong>Primary Control:</strong> {v.control}
              </p>
            </div>
            <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
              <span>
                <strong style={{ color: "var(--foreground)" }}>{v.mitigated}/{v.threats}</strong> threats mitigated
              </span>
              <Link href="/threat-model" className="inline-flex items-center gap-1 font-bold" style={{ color: "var(--accent)" }}>
                <span>Inspect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
