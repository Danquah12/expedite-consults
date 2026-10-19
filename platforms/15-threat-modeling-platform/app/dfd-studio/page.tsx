"use client";

import Link from "next/link";
import { Layers, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

const flows = [
  { id: "DFD-01", source: "External Client Browser", target: "Public API Gateway", boundary: "Internet -> DMZ VPC", protocol: "TLS 1.3 (HTTPS)", status: "Verified" },
  { id: "DFD-02", source: "Public API Gateway", target: "Auth Service (OIDC/JWT)", boundary: "DMZ VPC -> App Mesh", protocol: "Envoy mTLS + RS256", status: "Verified" },
  { id: "DFD-03", source: "Public API Gateway", target: "Customer_PII_DB (Postgres)", boundary: "DMZ VPC -> Data Enclave", protocol: "TCP 5432 (Missing mTLS)", status: "Boundary Drift" },
  { id: "DFD-04", source: "Worker Queue Service", target: "Audit WORM S3 Bucket", boundary: "App Mesh -> Storage VPC", protocol: "IAM Role + KMS CMK", status: "Verified" },
];

export default function DfdStudioPage() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 max-w-3xl">
        <div className="desk-kicker">AXIOM THREAT DESK &middot; DATA FLOW DIAGRAM CANVAS</div>
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
          Interactive Data Flow Diagram (DFD v4.2) Studio
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Inspect trust boundaries, external entities, microservices, and data stores. Every cross-boundary flow is verified for mutual TLS, token pinning, and encryption in transit.
        </p>
      </div>

      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
          <div>
            <div className="desk-kicker">TRUST BOUNDARY LEDGER</div>
            <h2 className="text-xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
              Cross-Boundary Data Flows &amp; Encryption Posture
            </h2>
          </div>
          <Link
            href="/attack-chain"
            className="px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            style={{ background: "var(--accent)", color: "#fbf8f3" }}
          >
            <span>Open Graph Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {flows.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ background: "var(--background)", border: "1px solid var(--border)" }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    {f.id}
                  </span>
                  <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                    {f.source} &rarr; {f.target}
                  </span>
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  Boundary: <strong>{f.boundary}</strong> &middot; Transport: <span className="font-mono">{f.protocol}</span>
                </div>
              </div>
              <span className={`${f.status === "Verified" ? "badge-resolved" : "badge-critical"} px-3 py-1 rounded-full text-xs font-bold shrink-0`}>
                {f.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
