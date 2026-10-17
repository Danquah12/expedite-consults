"use client";

import Link from "next/link";
import { FileJson, Cpu } from "lucide-react";
import Footer from "@/components/layout/Footer";

const SCHEMA_DRIFT = [
  {
    endpoint: "PUT /api/v2/users/{id}",
    contractStatus: "Schema Drift (Mass Assignment)",
    owasp: "API3:2023 · CWE-915",
    detail: "OpenAPI 3.1 `UserUpdateInput` omits `additionalProperties: false`; controller binds `is_admin` and `role` directly to ORM.",
  },
  {
    endpoint: "GET /api/v2/admin/users/{id}",
    contractStatus: "Response Over-Exposure",
    owasp: "API3:2023 · CWE-312",
    detail: "Live HTTP 200 payload includes `password_hash` (bcrypt) which is not declared in OpenAPI `AdminUserDTO`.",
  },
  {
    endpoint: "GET /api/swagger-ui",
    contractStatus: "Undocumented Shadow Route",
    owasp: "API9:2023 · CWE-200",
    detail: "Interactive Swagger UI exposed in production gateway without authentication (`API-008`).",
  },
  {
    endpoint: "POST /api/graphql",
    contractStatus: "Introspection Enabled",
    owasp: "API8:2023 · CWE-200",
    detail: "GraphQL `__schema` introspection query allowed in production (`API-003`).",
  },
];

export default function OpenApiIngestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="card-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium"
              style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid rgba(122,162,247,0.28)" }}>
              <FileJson className="w-3.5 h-3.5" />
              <span>OpenAPI 3.1 &amp; GraphQL Schema Drift Auditor</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              OpenAPI 3.1 Specification Ingestion &amp; Shadow API Discovery
            </h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Stage A of the Proof Validation Pipeline: diffs signed OpenAPI 3.1 contracts against live router ASTs and gateway telemetry.
            </p>
          </div>
          <Link
            href="/validation-engine"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            <Cpu className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span>Open Validation Pipeline</span>
          </Link>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCHEMA_DRIFT.map((d) => (
            <div key={d.endpoint} className="card-surface p-5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold" style={{ color: "var(--accent)" }}>{d.endpoint}</span>
                <span className="badge-high text-[11px] font-semibold px-2 py-0.5 rounded">{d.owasp}</span>
              </div>
              <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{d.contractStatus}</div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{d.detail}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
