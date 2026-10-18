"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe2,
  Shield,
  Lock,
  FileJson,
  Activity,
  KeyRound,
  Cpu,
  ArrowRight,
  CheckCircle2,
  GitCompare,
  Layers,
  Terminal,
  Search,
  RefreshCw,
} from "lucide-react";

const studios = [
  {
    href: "/validation-engine",
    kicker: "PTES & NIST 800-115",
    badge: "6 Proof Contracts",
    title: "Proof-Driven API Validation Engine",
    desc: "6-stage OpenAPI & gateway ingestion to role-differential runtime proof pipeline, Z3 tenancy/JWT claim verification, 10 pluggable API analyzers, mutation testing, and OWASP API Top 10:2023 reference catalog.",
    icon: Cpu,
    metrics: ["Stages A–F", "Z3 Claim Verifier", "OWASP API Top 10:2023"],
    category: "proof",
  },
  {
    href: "/scan",
    kicker: "INTERACTIVE WORKBENCH",
    badge: "83 Endpoints",
    title: "API Scan, Fuzzer & Post-Scan Proof Studio",
    desc: "Full-width 1360px API request workbench, OWASP API Top 10 fuzzer, JWT token decoder, OpenAPI 3.1 contract auditor, and automated post-scan evidence verification.",
    icon: Terminal,
    metrics: ["REST / GraphQL / gRPC", "Post-Scan Proof", "Live Replay"],
    category: "scan",
  },
  {
    href: "/bola-matrix",
    kicker: "API1:2023 · CWE-639",
    badge: "Alert 1",
    title: "BOLA / IDOR Cross-Tenant Authorization Matrix",
    desc: "Controlled multi-principal replay across Tenant A, Tenant B, Member, and Unauthenticated contexts to verify object-level ownership predicates.",
    icon: Lock,
    metrics: ["4 Auth Contexts", "Row-Level Verification", "Differential Diff"],
    category: "auth",
  },
  {
    href: "/bfla-hunter",
    kicker: "API5:2023 · CWE-285",
    badge: "RBAC Matrix",
    title: "BFLA Function-Level Authorization Hunter",
    desc: "Inspects administrative and privileged routes across HTTP verbs (GET, POST, PUT, DELETE) to detect missing role middleware and method-override drift.",
    icon: Shield,
    metrics: ["Verb Matrix", "RBAC Policy Graph", "Admin Route Guard"],
    category: "auth",
  },
  {
    href: "/openapi-ingest",
    kicker: "API3 / API8 / API9",
    badge: "4 Drift Alerts",
    title: "OpenAPI 3.1 & Shadow API Drift Studio",
    desc: "Compares live API gateway traffic against declared OpenAPI 3.1 schemas to uncover shadow/zombie endpoints, unvalidated mass-assignment fields, and PII exposure.",
    icon: FileJson,
    metrics: ["Schema Conformance", "Shadow API Diff", "DTO Projection Check"],
    category: "schema",
  },
  {
    href: "/jwt-guard",
    kicker: "API2:2023 · CWE-347",
    badge: "Alert 2",
    title: "JWT Token Security & Algorithm Guard",
    desc: "Verifies RS256/ES256 algorithm pinning, rejects alg:none and HMAC/RSA key confusion, and audits token expiration, issuer, and audience claims.",
    icon: KeyRound,
    metrics: ["Alg:None Guard", "JWKS Pinning", "Claim Invariants"],
    category: "auth",
  },
];

const owaspApiTop10 = [
  { id: "API1:2023", name: "Broken Object Level Authorization (BOLA)", cwe: "CWE-639", status: "Verified Proof" },
  { id: "API2:2023", name: "Broken Authentication (JWT / Token Handling)", cwe: "CWE-347", status: "Verified Proof" },
  { id: "API3:2023", name: "Broken Object Property Level Authorization (BOPLA)", cwe: "CWE-915", status: "Verified Proof" },
  { id: "API4:2023", name: "Unrestricted Resource Consumption (Rate Limits)", cwe: "CWE-770", status: "Verified Proof" },
  { id: "API5:2023", name: "Broken Function Level Authorization (BFLA)", cwe: "CWE-285", status: "Verified Proof" },
  { id: "API6:2023", name: "Unrestricted Access to Sensitive Business Flows", cwe: "CWE-841", status: "Active Rule" },
  { id: "API7:2023", name: "Server Side Request Forgery (SSRF)", cwe: "CWE-918", status: "Active Rule" },
  { id: "API8:2023", name: "Security Misconfiguration (CORS / Introspection)", cwe: "CWE-942", status: "Verified Proof" },
  { id: "API9:2023", name: "Improper Inventory Management (Shadow APIs)", cwe: "CWE-1059", status: "Verified Proof" },
  { id: "API10:2023", name: "Unsafe Consumption of Third-Party APIs", cwe: "CWE-20", status: "Active Rule" },
];

export default function HomePage() {
  const [deskQuery, setDeskQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredStudios = studios.filter((s) => {
    const matchFilter = selectedFilter === "all" || s.category === selectedFilter;
    const matchQuery =
      !deskQuery ||
      s.title.toLowerCase().includes(deskQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(deskQuery.toLowerCase()) ||
      s.kicker.toLowerCase().includes(deskQuery.toLowerCase());
    return matchFilter && matchQuery;
  });

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* XTRIKE API DESK Editorial Masthead Section */}
      <section className="space-y-6">
        <div className="space-y-2 max-w-3xl">
          <div className="desk-kicker">XTRIKE SECURITY DESK &middot; PLATFORM 12</div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight font-editorial"
            style={{ color: "var(--foreground)" }}
          >
            XTRIKE API DESK
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--muted)" }}>
            Live API telemetry and OpenAPI 3.1 contracts stay current. The six verification studios below are the deterministic validation desk. The proof engine scores reachability and role-differential replay—it is an evidence verifier, not an unverified guess.
          </p>
        </div>

        {/* Action Strip (Like "Notify this phone" in the reference design) */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/scan"
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
            style={{
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 2px rgba(31, 27, 24, 0.05)",
            }}
          >
            Run API Scan &amp; Proof Desk
          </Link>
          <p className="text-xs max-w-xl leading-relaxed" style={{ color: "var(--muted)" }}>
            Each scanner alert is normalized into a canonical finding record. Open the Proof Studio or launch a live role-differential replay so the independent verifier can bind a 6-Point Proof Contract to `commit 9f4c2a1e`.
          </p>
        </div>

        {/* Search the desk */}
        <div className="space-y-2 pt-2">
          <label
            className="block text-xs font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Search the desk
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--subtle)" }}
            />
            <input
              type="text"
              value={deskQuery}
              onChange={(e) => setDeskQuery(e.target.value)}
              placeholder="Endpoint, BOLA, BFLA, CWE-639, OpenAPI 3.1, or Z3 claim..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                boxShadow: "0 1px 2px rgba(31, 27, 24, 0.03)",
              }}
            />
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Last job &middot; Commit `9f4c2a1e` (83 endpoints indexed). Open a studio, or inspect a 6-point proof contract.
          </div>
        </div>

        {/* Filter Pill Strip + Breaking Ticker (Matching the Desk Note reference image) */}
        <div
          className="pt-4 border-t space-y-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All", count: null },
              { id: "proof", label: "Proof Studio", count: "Alert 1" },
              { id: "scan", label: "Scan Workbench", count: "83" },
              { id: "auth", label: "BOLA & JWT Guards", count: "6 Confirmed" },
              { id: "schema", label: "OpenAPI 3.1 Drift", count: "Alert 2" },
            ].map((pill) => {
              const active = selectedFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedFilter(pill.id)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{
                    background: active ? "var(--accent)" : "var(--surface)",
                    color: active ? "#fbf8f3" : "var(--foreground)",
                    border: active
                      ? "1px solid #72361d"
                      : "1px solid var(--border)",
                    boxShadow: "0 1px 2px rgba(31, 27, 24, 0.04)",
                  }}
                >
                  <span>{pill.label}</span>
                  {pill.count && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: active ? "#fbf8f3" : "var(--accent-soft)",
                        color: "var(--accent)",
                      }}
                    >
                      {pill.count}
                    </span>
                  )}
                </button>
              );
            })}

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "var(--surface)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <span>Executive Triage</span>
            </Link>
            <Link
              href="/rate-limit-tester"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "var(--surface)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <span>Quota Verifier</span>
            </Link>
          </div>

          {/* Breaking / Verified Proof Ticker Strip */}
          <div
            className="flex items-center rounded-lg overflow-hidden border text-xs"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <span
              className="px-3 py-2 font-bold uppercase tracking-wider shrink-0"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
                fontSize: "0.68rem",
              }}
            >
              VERIFIED
            </span>
            <div
              className="px-3.5 py-2 flex items-center gap-6 overflow-x-auto whitespace-nowrap"
              style={{ color: "var(--muted)" }}
            >
              <span>
                <strong style={{ color: "var(--foreground)" }}>API-001 (BOLA)</strong> &middot; Cross-tenant `/api/v2/users/1001` confirmed across 3/3 replays
              </span>
              <span>
                <strong style={{ color: "var(--foreground)" }}>API-002 (JWT)</strong> &middot; Unsigned `alg: none` token accepted on `/api/v2/admin/users`
              </span>
              <span>
                <strong style={{ color: "var(--foreground)" }}>API-009 (Filtered)</strong> &middot; SQLi alert on `/api/v2/products/search` proven safe via bound parameter
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Major Updates / Main Editorial Container Card */}
      <section className="card-surface p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="desk-kicker">OCTOBER 2026 &middot; PTES &amp; NIST SP 800-115</div>
            <h2
              className="text-2xl sm:text-3xl font-bold font-editorial"
              style={{ color: "var(--foreground)" }}
            >
              Major validation updates &amp; workbenches
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              OpenAPI 3.1 contract checks, controller AST predicate analysis, Z3 security claims, and role-differential replays from the latest build. A confirmed badge means all 6 points of the Proof Contract passed deterministically.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs" style={{ color: "var(--muted)" }}>
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: "var(--foreground)" }}
              />
              <strong style={{ color: "var(--foreground)" }}>Live</strong>
              <span>83 endpoints indexed &middot; 6 confirmed with proof &middot; 95.0% mutation catch rate.</span>
            </div>
          </div>

          <Link
            href="/validation-engine"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0"
            style={{
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 2px rgba(31, 27, 24, 0.04)",
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Open Proof Studio</span>
          </Link>
        </div>

        {/* 3-Column Editorial Workbench Grid (Matching the Nation / World / Politics columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudios.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className="flex flex-col justify-between p-5 rounded-xl transition-all card-hover"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: "var(--border)" }}>
                    <span className="desk-kicker">{s.kicker}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                      }}
                    >
                      {s.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--accent)",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3
                      className="text-lg font-bold leading-snug font-editorial"
                      style={{ color: "var(--foreground)" }}
                    >
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {s.desc}
                  </p>
                </div>

                <div
                  className="pt-4 mt-4 border-t flex flex-wrap items-center justify-between gap-2"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {s.metrics.map((m) => (
                      <span
                        key={m}
                        className="text-[11px] px-2 py-0.5 rounded font-medium"
                        style={{
                          background: "var(--surface)",
                          color: "var(--muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* OWASP API Security Top 10:2023 Coverage Matrix */}
      <section className="card-surface p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="desk-kicker">REFERENCE CATALOG &middot; PYTHON SDK</div>
            <h2 className="text-2xl font-bold mt-1 font-editorial" style={{ color: "var(--foreground)" }}>
              OWASP API Security Top 10 (2023) Verification Coverage
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Mapped to MITRE CWE, NIST NVD/CVE, and NIST SP 800-53 Rev. 5 controls inside the Python `validation_engine` package.
            </p>
          </div>
          <Link
            href="/validation-engine"
            className="text-xs font-bold inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
            style={{
              background: "var(--accent)",
              color: "#fbf8f3",
            }}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Explore Full OWASP API / CWE / NVD Catalog</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {owaspApiTop10.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl flex items-center justify-between gap-3"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded shrink-0"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {item.id}
                </span>
                <div className="truncate">
                  <div
                    className="text-xs font-semibold truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {item.name}
                  </div>
                  <div className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                    {item.cwe}
                  </div>
                </div>
              </div>
              <span className="badge-resolved text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
