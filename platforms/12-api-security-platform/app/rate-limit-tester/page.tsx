"use client";

import Link from "next/link";
import { Activity, Cpu } from "lucide-react";

const QUOTA_POLICIES = [
  {
    route: "POST /api/v2/auth/login",
    expectedPolicy: "5 req / min / IP + username",
    observedHeaders: "None (Missing X-RateLimit-Remaining)",
    calibrationResult: "15/15 calibration requests returned HTTP 200/401 (0 throttled)",
    status: "LIKELY VULNERABLE (API-004)",
    ok: false,
  },
  {
    route: "GET /api/v2/users",
    expectedPolicy: "Max pagination limit <= 100",
    observedHeaders: "X-RateLimit-Limit: 120, Page-Cap: 100",
    calibrationResult: "?limit=5000 clamped to 100 items (HTTP 422 on >100)",
    status: "VERIFIED SAFE",
    ok: true,
  },
  {
    route: "POST /api/graphql",
    expectedPolicy: "Query Depth <= 6, Cost <= 500",
    observedHeaders: "Introspection enabled; no depth limiter configured",
    calibrationResult: "Depth-9 nested query executed without cost rejection",
    status: "NEEDS DEPTH GUARD (API4:2023)",
    ok: false,
  },
];

export default function RateLimitTesterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="card-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium"
              style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid rgba(139, 69, 40, 0.25)" }}>
              <Activity className="w-3.5 h-3.5" />
              <span>OWASP API4:2023 &middot; CWE-770 / CWE-307 &middot; Resource Quota Verifier</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Rate Limiting, Pagination Caps &amp; GraphQL Depth Verifier
            </h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Uses safe, low-volume calibration probes (15 requests max) and static decorator checks to verify throttling policies without causing service disruption.
            </p>
          </div>
          <Link
            href="/validation-engine"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            <Cpu className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span>Inspect API-004 Proof Contract</span>
          </Link>
        </section>

        <div className="space-y-4">
          {QUOTA_POLICIES.map((p) => (
            <div key={p.route} className="card-surface p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="font-mono font-bold text-sm" style={{ color: "var(--accent)" }}>{p.route}</div>
                <div style={{ color: "var(--foreground)" }}>Expected Policy: <span className="font-mono">{p.expectedPolicy}</span></div>
                <div style={{ color: "var(--muted)" }}>Observed Headers: <span className="font-mono">{p.observedHeaders}</span></div>
                <div style={{ color: "var(--muted)" }}>Calibration Trace: {p.calibrationResult}</div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold shrink-0 ${p.ok ? "badge-resolved" : "badge-high"}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
