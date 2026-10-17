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
} from "lucide-react";
import Footer from "@/components/layout/Footer";

const studios = [
  {
    href: "/validation-engine",
    badge: "PTES & NIST 800-115",
    title: "Proof-Driven API Validation Engine",
    desc: "6-stage OpenAPI & gateway ingestion to role-differential runtime proof pipeline, Z3 tenancy/JWT claim verification, 10 pluggable API analyzers, mutation testing, and OWASP API Top 10:2023 reference catalog.",
    icon: Cpu,
    metrics: ["6 Proof Contracts", "Z3 Claim Verifier", "OWASP API Top 10:2023"],
  },
  {
    href: "/scan",
    badge: "Interactive Workbench",
    title: "API Scan, Fuzzer & Post-Scan Proof Studio",
    desc: "Full-width 1360px API request workbench, OWASP API Top 10 fuzzer, JWT token decoder, OpenAPI 3.1 contract auditor, and automated post-scan evidence verification.",
    icon: Terminal,
    metrics: ["83 Endpoints", "REST / GraphQL / gRPC", "Post-Scan Proof"],
  },
  {
    href: "/bola-matrix",
    badge: "API1:2023 · CWE-639",
    title: "BOLA / IDOR Cross-Tenant Authorization Matrix",
    desc: "Controlled multi-principal replay across Tenant A, Tenant B, Member, and Unauthenticated contexts to verify object-level ownership predicates.",
    icon: Lock,
    metrics: ["4 Auth Contexts", "Row-Level Verification", "Differential Diff"],
  },
  {
    href: "/bfla-hunter",
    badge: "API5:2023 · CWE-285",
    title: "BFLA Function-Level Authorization Hunter",
    desc: "Inspects administrative and privileged routes across HTTP verbs (GET, POST, PUT, DELETE) to detect missing role middleware and method-override drift.",
    icon: Shield,
    metrics: ["Verb Matrix", "RBAC Policy Graph", "Admin Route Guard"],
  },
  {
    href: "/openapi-ingest",
    badge: "API3 / API8 / API9",
    title: "OpenAPI 3.1 & Shadow API Drift Studio",
    desc: "Compares live API gateway traffic against declared OpenAPI 3.1 schemas to uncover shadow/zombie endpoints, unvalidated mass-assignment fields, and PII exposure.",
    icon: FileJson,
    metrics: ["Schema Conformance", "Shadow API Diff", "DTO Projection Check"],
  },
  {
    href: "/jwt-guard",
    badge: "API2:2023 · CWE-347",
    title: "JWT Token Security & Algorithm Guard",
    desc: "Verifies RS256/ES256 algorithm pinning, rejects alg:none and HMAC/RSA key confusion, and audits token expiration, issuer, and audience claims.",
    icon: KeyRound,
    metrics: ["Alg:None Guard", "JWKS Pinning", "Claim Invariants"],
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
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero */}
        <section className="card-surface p-8 sm:p-10">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
                border: "1px solid rgba(122, 162, 247, 0.28)",
              }}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Platform 12 &middot; Proof-Driven API Security &amp; Governance</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              Deterministic API Security Testing &amp; Role-Differential Proof Validation
            </h1>

            <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              Combine OpenAPI 3.1 contract analysis, route-controller AST inspection, and controlled multi-role HTTP replay to prove whether BOLA, BFLA, JWT, and Mass Assignment findings are reachable and reproducible—backed by commit-bound 6-point Proof Contracts.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)", color: "#0f1115" }}
              >
                <span>Open API Scan &amp; Fuzzer Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/validation-engine"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                <Cpu className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <span>Proof-Driven API Validation Studio</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: "var(--surface)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                <span>Executive API Posture Dashboard</span>
              </Link>
            </div>
          </div>

          {/* KPI Strip */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            {[
              { label: "Monitored Endpoints", value: "83", sub: "REST, GraphQL & gRPC" },
              { label: "Verified Proof Contracts", value: "6 / 8", sub: "100% Replay Reproducibility" },
              { label: "Z3 Security Claims", value: "5 Active", sub: "2 Counterexamples Isolated" },
              { label: "API Mutation Catch Rate", value: "95.0%", sub: "19 / 20 Injected Mutants Caught" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="p-4 rounded-lg"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {kpi.label}
                </div>
                <div
                  className="text-2xl font-bold mt-1"
                  style={{ color: "var(--foreground)" }}
                >
                  {kpi.value}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--subtle)" }}>
                  {kpi.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Studios Grid */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                Specialized API Security Workbenches
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                Inspect authorization matrices, OpenAPI 3.1 contracts, JWT cryptographic guards, and deterministic proof pipelines.
              </p>
            </div>
            <Link
              href="/rate-limit-tester"
              className="text-xs font-medium inline-flex items-center gap-1.5"
              style={{ color: "var(--accent)" }}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Open Rate Limit &amp; Resource Quota Tester &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {studios.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="card-surface card-hover p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[11px] font-mono px-2 py-0.5 rounded"
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--accent)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {s.badge}
                      </span>
                      <Icon className="w-4 h-4" style={{ color: "var(--muted)" }} />
                    </div>
                    <h3
                      className="text-base font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {s.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                      {s.desc}
                    </p>
                  </div>

                  <div
                    className="pt-3 border-t flex flex-wrap items-center gap-2"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {s.metrics.map((m) => (
                      <span
                        key={m}
                        className="text-[11px] px-2 py-0.5 rounded"
                        style={{
                          background: "var(--background)",
                          color: "var(--muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {m}
                      </span>
                    ))}
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
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                  OWASP API Security Top 10 (2023) Verification Coverage
                </h2>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Mapped to MITRE CWE, NIST NVD/CVE, and NIST SP 800-53 Rev. 5 controls inside the Python `validation_engine` package.
              </p>
            </div>
            <Link
              href="/validation-engine"
              className="text-xs font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--surface-2)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <GitCompare className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              <span>Explore Full OWASP API / CWE / NVD Catalog</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {owaspApiTop10.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg flex items-center justify-between gap-3"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="text-xs font-mono font-semibold px-2 py-1 rounded shrink-0"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    {item.id}
                  </span>
                  <div className="truncate">
                    <div
                      className="text-xs font-medium truncate"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.name}
                    </div>
                    <div className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                      {item.cwe}
                    </div>
                  </div>
                </div>
                <span
                  className="text-[11px] px-2 py-0.5 rounded inline-flex items-center gap-1 shrink-0"
                  style={{
                    background: "rgba(70, 163, 110, 0.12)",
                    color: "#6bc492",
                    border: "1px solid rgba(70, 163, 110, 0.28)",
                  }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
