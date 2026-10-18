"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, CheckCircle2, AlertTriangle, Play, Cpu } from "lucide-react";

const BOLA_ROUTES = [
  {
    route: "GET /api/v2/users/{id}",
    ownerStatus: "200 OK (Own Record)",
    crossTenantStatus: "200 OK (LEAKS PII)",
    anonymousStatus: "401 Unauthorized",
    adminStatus: "200 OK (Authorized)",
    verdict: "CONFIRMED BOLA (API-001)",
    vulnerable: true,
    ormQuery: "session.query(User).filter(User.id == id).first()  # Missing tenant_id predicate",
    fix: "session.query(User).filter(User.id == id, User.tenant_id == jwt.tenant_id).first()",
  },
  {
    route: "GET /api/v2/invoices/{id}",
    ownerStatus: "200 OK",
    crossTenantStatus: "403 Forbidden",
    anonymousStatus: "401 Unauthorized",
    adminStatus: "200 OK",
    verdict: "VERIFIED SAFE",
    vulnerable: false,
    ormQuery: "session.query(Invoice).filter(Invoice.id == id, Invoice.tenant_id == jwt.tenant_id).first()",
    fix: "Tenant ownership filter enforced via Depends(require_tenant_scope).",
  },
  {
    route: "PUT /api/v2/users/{id}",
    ownerStatus: "200 OK (Mass Assign)",
    crossTenantStatus: "403 Forbidden",
    anonymousStatus: "401 Unauthorized",
    adminStatus: "200 OK",
    verdict: "BOPLA / MASS ASSIGN (API-006)",
    vulnerable: true,
    ormQuery: "for k, v in request.json.items(): setattr(user, k, v)  # Binds is_admin",
    fix: "Bind strictly to UserProfileUpdateDTO(extra='forbid').",
  },
  {
    route: "DELETE /api/v2/orgs/{id}/members/{member_id}",
    ownerStatus: "403 Forbidden",
    crossTenantStatus: "403 Forbidden",
    anonymousStatus: "401 Unauthorized",
    adminStatus: "204 No Content",
    verdict: "VERIFIED SAFE",
    vulnerable: false,
    ormQuery: "delete(Member).where(Member.id == member_id, Member.org_id == jwt.org_id)",
    fix: "Scoped to authenticated organization admin.",
  },
];

export default function BolaMatrixPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const active = BOLA_ROUTES[selectedIdx];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="card-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium"
              style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid rgba(139, 69, 40, 0.25)" }}>
              <Lock className="w-3.5 h-3.5" />
              <span>OWASP API1:2023 &middot; CWE-639 &middot; Cross-Tenant BOLA Matrix</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Broken Object Level Authorization (BOLA / IDOR) Differential Matrix
            </h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Controlled 4-principal replay comparing Resource Owner, Cross-Tenant Peer, Anonymous, and Admin responses against ORM AST predicates.
            </p>
          </div>
          <Link
            href="/validation-engine"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            <Cpu className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span>View Z3 Claim CLAIM-API-01</span>
          </Link>
        </section>

        <section className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b" style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--muted)" }}>
                  <th className="py-3 px-4 font-semibold">API Endpoint</th>
                  <th className="py-3 px-4 font-semibold">Owner (Tenant B)</th>
                  <th className="py-3 px-4 font-semibold">Cross-Tenant (Tenant A)</th>
                  <th className="py-3 px-4 font-semibold">Anonymous</th>
                  <th className="py-3 px-4 font-semibold">Admin Role</th>
                  <th className="py-3 px-4 font-semibold">Proof Verdict</th>
                </tr>
              </thead>
              <tbody>
                {BOLA_ROUTES.map((r, i) => (
                  <tr
                    key={r.route}
                    onClick={() => setSelectedIdx(i)}
                    className="border-b cursor-pointer transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      background: selectedIdx === i ? "var(--surface-2)" : "transparent",
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold" style={{ color: "var(--accent)" }}>{r.route}</td>
                    <td className="py-3.5 px-4 font-mono" style={{ color: "var(--foreground)" }}>{r.ownerStatus}</td>
                    <td className="py-3.5 px-4 font-mono" style={{ color: r.vulnerable ? "var(--critical)" : "var(--success)" }}>{r.crossTenantStatus}</td>
                    <td className="py-3.5 px-4 font-mono" style={{ color: "var(--muted)" }}>{r.anonymousStatus}</td>
                    <td className="py-3.5 px-4 font-mono" style={{ color: "var(--foreground)" }}>{r.adminStatus}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${r.vulnerable ? "badge-critical" : "badge-resolved"}`}>
                        {r.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card-surface p-6 space-y-4">
          <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
            Static ORM Query AST &amp; Remediation for `{active.route}`
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg space-y-1.5" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="font-semibold" style={{ color: "var(--accent)" }}>Observed Controller ORM Sink</div>
              <pre className="p-3 rounded code-block overflow-x-auto" style={{ background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {active.ormQuery}
              </pre>
            </div>
            <div className="p-4 rounded-lg space-y-1.5" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="font-semibold" style={{ color: "var(--success)" }}>Verified Tenancy Predicate Fix</div>
              <pre className="p-3 rounded code-block overflow-x-auto" style={{ background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {active.fix}
              </pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
