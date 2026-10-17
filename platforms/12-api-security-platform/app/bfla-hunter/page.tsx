"use client";

import Link from "next/link";
import { Shield, Cpu } from "lucide-react";
import Footer from "@/components/layout/Footer";

const BFLA_MATRIX = [
  { path: "/api/v2/admin/users", get: "200 OK (JWT alg:none)", post: "403 Forbidden", put: "403 Forbidden", del: "403 Forbidden", issue: "API-002: Accepts unsigned alg:none JWT on GET" },
  { path: "/api/v2/admin/users/{id}", get: "200 OK (Leaks Hash)", post: "405", put: "403 Forbidden", del: "403 Forbidden", issue: "API-005: Serializes bcrypt password_hash in DTO" },
  { path: "/api/v2/users/{id}", get: "200 OK (BOLA)", post: "405", put: "200 OK (Escalates is_admin)", del: "403 Forbidden", issue: "API-006: PUT allows member to set role='admin'" },
  { path: "/api/v2/admin/audit-logs", get: "403 Forbidden", post: "403 Forbidden", put: "405", del: "403 Forbidden", issue: "Verified: @require_role('ADMIN') enforced across all verbs" },
];

export default function BflaHunterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="card-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium"
              style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid rgba(122,162,247,0.28)" }}>
              <Shield className="w-3.5 h-3.5" />
              <span>OWASP API5:2023 &middot; CWE-285 &middot; Function-Level RBAC Hunter</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Broken Function Level Authorization (BFLA) HTTP Verb Matrix
            </h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Audits administrative and privileged routes across GET, POST, PUT, and DELETE verbs using low-privilege member tokens.
            </p>
          </div>
          <Link
            href="/validation-engine"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            <Cpu className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span>Inspect Z3 Claim CLAIM-API-04</span>
          </Link>
        </section>

        <section className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b" style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--muted)" }}>
                  <th className="py-3 px-4 font-semibold">Route Pattern</th>
                  <th className="py-3 px-4 font-semibold">GET (Member Token)</th>
                  <th className="py-3 px-4 font-semibold">POST (Member Token)</th>
                  <th className="py-3 px-4 font-semibold">PUT (Member Token)</th>
                  <th className="py-3 px-4 font-semibold">DELETE (Member Token)</th>
                  <th className="py-3 px-4 font-semibold">Static + Runtime Assessment</th>
                </tr>
              </thead>
              <tbody>
                {BFLA_MATRIX.map((row) => (
                  <tr key={row.path} className="border-b" style={{ borderColor: "var(--border)" }}>
                    <td className="py-3.5 px-4 font-mono font-semibold" style={{ color: "var(--accent)" }}>{row.path}</td>
                    <td className="py-3.5 px-4 font-mono">{row.get}</td>
                    <td className="py-3.5 px-4 font-mono">{row.post}</td>
                    <td className="py-3.5 px-4 font-mono">{row.put}</td>
                    <td className="py-3.5 px-4 font-mono">{row.del}</td>
                    <td className="py-3.5 px-4" style={{ color: "var(--muted)" }}>{row.issue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
