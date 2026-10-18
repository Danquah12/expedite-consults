"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  KeyRound,
  FileJson,
  Lock,
  ArrowRight,
  RefreshCw,
  Terminal,
  Layers,
} from "lucide-react";
import { FINDINGS, SCAN_SUMMARY } from "@/data/findings";
import { API_PIPELINE_FINDINGS } from "@/lib/validation-engine";

type WorkbenchTab =
  | "post-scan-proof"
  | "owasp-fuzzer"
  | "jwt-lab"
  | "openapi-schema"
  | "request-replay";

const ENDPOINT_INVENTORY = [
  { method: "POST", path: "/api/v2/auth/login", auth: "Public", owasp: "API4:2023", status: "Likely (Rate Limit)" },
  { method: "GET", path: "/api/v2/users/{id}", auth: "Bearer JWT", owasp: "API1:2023", status: "Confirmed (BOLA)" },
  { method: "PUT", path: "/api/v2/users/{id}", auth: "Bearer JWT", owasp: "API3:2023", status: "Confirmed (BOPLA)" },
  { method: "GET", path: "/api/v2/admin/users", auth: "Admin JWT", owasp: "API2:2023", status: "Confirmed (JWT alg:none)" },
  { method: "GET", path: "/api/v2/admin/users/{id}", auth: "Admin JWT", owasp: "API3:2023", status: "Confirmed (Hash Leak)" },
  { method: "POST", path: "/api/graphql", auth: "Optional JWT", owasp: "API8:2023", status: "Confirmed (Introspection)" },
  { method: "GET", path: "/api/v2/users/me", auth: "Session/JWT", owasp: "API8:2023", status: "Confirmed (CORS)" },
  { method: "GET", path: "/api/v2/products/search", auth: "Bearer JWT", owasp: "API8:2023", status: "False Positive (Safe Bind)" },
];

export default function ApiScanWorkspacePage() {
  const [targetUrl, setTargetUrl] = useState("https://staging.api.acme.com/v2");
  const [apiType, setApiType] = useState<"REST" | "GraphQL" | "gRPC">("REST");
  const [authProfile, setAuthProfile] = useState("Multi-Role Differential (Tenant A vs. Tenant B + Admin)");
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkbenchTab>("post-scan-proof");
  const [selectedProofId, setSelectedProofId] = useState(API_PIPELINE_FINDINGS[0].id);
  const [jwtTokenInput, setJwtTokenInput] = useState(
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsInRlbmFudF9pZCI6Im9yZ19hbHBoYSJ9."
  );
  const [replayPrincipal, setReplayPrincipal] = useState<"tenant_a" | "tenant_b" | "anonymous">("tenant_a");

  const activeProof =
    API_PIPELINE_FINDINGS.find((p) => p.id === selectedProofId) ||
    API_PIPELINE_FINDINGS[0];

  const handleRunScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setActiveTab("post-scan-proof");
    }, 650);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Workspace Header */}
        <section className="card-surface p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid rgba(139, 69, 40, 0.25)",
                }}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>API Scan &amp; Post-Scan Proof Workbench (1360px)</span>
              </span>
              <span
                className="text-xs font-mono px-2.5 py-0.5 rounded"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                Target: {SCAN_SUMMARY.target} &middot; {SCAN_SUMMARY.endpointsScanned} Endpoints
              </span>
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              API Security Scanner &amp; Role-Differential Proof Validator
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/validation-engine"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium"
              style={{
                background: "var(--surface-2)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <Cpu className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              <span>Open Full 6-Tab Validation Engine</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium"
              style={{
                background: "var(--surface)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              <span>Triage Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Main 2-Column 1360px Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (lg:col-span-4): Scan Configuration & Endpoint Inventory */}
          <div className="lg:col-span-4 space-y-5">
            <div className="card-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2
                  className="text-sm font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  1. Target &amp; Auth Matrix Setup
                </h2>
                <span
                  className="text-[11px] font-mono"
                  style={{ color: "var(--muted)" }}
                >
                  OpenAPI 3.1 + SARIF
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label
                    className="block mb-1 font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    API Base URL / Gateway Endpoint
                  </label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg font-mono text-xs outline-none"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block mb-1 font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Protocol &amp; Schema Contract
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["REST", "GraphQL", "gRPC"] as const).map((proto) => (
                      <button
                        key={proto}
                        onClick={() => setApiType(proto)}
                        className="py-1.5 rounded-lg font-medium text-xs cursor-pointer"
                        style={{
                          background:
                            apiType === proto
                              ? "var(--accent-soft)"
                              : "var(--surface-2)",
                          color:
                            apiType === proto
                              ? "var(--accent)"
                              : "var(--muted)",
                          border:
                            apiType === proto
                              ? "1px solid var(--accent)"
                              : "1px solid var(--border)",
                        }}
                      >
                        {proto}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="block mb-1 font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Principal Validation Context
                  </label>
                  <select
                    value={authProfile}
                    onChange={(e) => setAuthProfile(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option>
                      Multi-Role Differential (Tenant A vs. Tenant B + Admin)
                    </option>
                    <option>JWT Cryptographic Guard (alg:none / Key Pinning)</option>
                    <option>OpenAPI 3.1 Strict DTO &amp; Shadow Route Diff</option>
                  </select>
                </div>

                <button
                  onClick={handleRunScan}
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: "var(--accent)", color: "#fbf8f3" }}
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Running Scan &amp; Stages A–F Proof...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Run API Scan + Auto-Validate Findings</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Discovered Endpoint Inventory */}
            <div className="card-surface p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2
                  className="text-sm font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  2. Audited API Routes ({ENDPOINT_INVENTORY.length} / 83)
                </h2>
                <span
                  className="text-[11px] font-mono"
                  style={{ color: "var(--success)" }}
                >
                  100% Mapped
                </span>
              </div>

              <div className="space-y-2">
                {ENDPOINT_INVENTORY.map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg text-xs space-y-1"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-mono font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
                        <span style={{ color: "var(--accent)" }}>
                          {ep.method}
                        </span>{" "}
                        {ep.path}
                      </span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--background)",
                          color: "var(--muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {ep.owasp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted)" }}>
                      <span>Auth: {ep.auth}</span>
                      <span
                        style={{
                          color: ep.status.startsWith("False Positive")
                            ? "var(--success)"
                            : ep.status.startsWith("Likely")
                            ? "var(--high)"
                            : "var(--critical)",
                        }}
                      >
                        {ep.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (lg:col-span-8): Interactive Scan & Post-Scan Proof Workbench */}
          <div className="lg:col-span-8 space-y-5">
            {/* KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                { label: "Endpoints Audited", value: "83", sub: "REST + GraphQL" },
                { label: "Confirmed w/ Proof", value: "6", sub: "3/3 Replay Verified" },
                { label: "Likely (Env Check)", value: "1", sub: "API-004 Rate Limit" },
                { label: "False Positives Filtered", value: "1", sub: "API-009 Bound SQL" },
              ].map((stat) => (
                <div key={stat.label} className="card-surface p-4">
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    {stat.label}
                  </div>
                  <div
                    className="text-2xl font-bold mt-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{ color: "var(--subtle)" }}
                  >
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Workbench Mode Tabs */}
            <div
              className="flex items-center gap-1.5 p-1.5 rounded-xl overflow-x-auto"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              {[
                {
                  id: "post-scan-proof",
                  label: "Post-Scan Proof Validation (Stages A–F)",
                  icon: ShieldCheck,
                },
                {
                  id: "owasp-fuzzer",
                  label: "OWASP API Top 10 Probe Matrix",
                  icon: Layers,
                },
                {
                  id: "jwt-lab",
                  label: "JWT Token Guard & Decoder",
                  icon: KeyRound,
                },
                {
                  id: "openapi-schema",
                  label: "OpenAPI 3.1 Contract Diff",
                  icon: FileJson,
                },
                {
                  id: "request-replay",
                  label: "Role-Differential HTTP Replay",
                  icon: Lock,
                },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as WorkbenchTab)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors"
                    style={{
                      background: active ? "var(--surface-2)" : "transparent",
                      color: active ? "var(--foreground)" : "var(--muted)",
                      border: active
                        ? "1px solid var(--border)"
                        : "1px solid transparent",
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: active ? "var(--accent)" : "var(--subtle)" }}
                    />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: POST-SCAN PROOF VALIDATION */}
            {activeTab === "post-scan-proof" && (
              <div className="card-surface p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <h3
                      className="text-base font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      Post-Scan Automated Proof Verification (PTES / NIST 800-115)
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      Select any scanner finding below to inspect its static controller AST verdict, role-differential runtime replay, and 6-Point Proof Contract.
                    </p>
                  </div>
                  <Link
                    href="/validation-engine"
                    className="text-xs font-medium shrink-0"
                    style={{ color: "var(--accent)" }}
                  >
                    View Z3 Claims &amp; Mutation Suite &rarr;
                  </Link>
                </div>

                {/* Finding Selector Pills */}
                <div className="flex flex-wrap gap-2">
                  {API_PIPELINE_FINDINGS.map((f) => {
                    const active = f.id === activeProof.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setSelectedProofId(f.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors"
                        style={{
                          background: active
                            ? "var(--accent-soft)"
                            : "var(--surface-2)",
                          color: active ? "var(--accent)" : "var(--muted)",
                          border: active
                            ? "1px solid var(--accent)"
                            : "1px solid var(--border)",
                        }}
                      >
                        {f.id} · {f.owaspApiId} ({f.status})
                      </button>
                    );
                  })}
                </div>

                {/* Selected Finding Proof Card */}
                <div
                  className="p-5 rounded-xl space-y-4"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-mono font-bold"
                          style={{ color: "var(--accent)" }}
                        >
                          {activeProof.id} · {activeProof.owaspApiId} (
                          {activeProof.cweId})
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            activeProof.status === "CONFIRMED"
                              ? "badge-critical"
                              : activeProof.status === "LIKELY"
                              ? "badge-high"
                              : "badge-resolved"
                          }`}
                        >
                          {activeProof.status}
                        </span>
                      </div>
                      <h4
                        className="text-base font-bold mt-1"
                        style={{ color: "var(--foreground)" }}
                      >
                        {activeProof.title}
                      </h4>
                    </div>
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--muted)" }}
                    >
                      {activeProof.endpoint.method} {activeProof.endpoint.path}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div
                      className="p-3.5 rounded-lg space-y-1"
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="font-semibold"
                        style={{ color: "var(--accent)" }}
                      >
                        Stage D1 · Static Route &amp; ORM Predicate Check
                      </div>
                      <div style={{ color: "var(--foreground)" }}>
                        {activeProof.staticVerdict.missingPredicate}
                      </div>
                      <div
                        className="font-mono text-[11px] pt-1"
                        style={{ color: "var(--muted)" }}
                      >
                        File: {activeProof.endpoint.controllerFile}:
                        {activeProof.endpoint.lineRange}
                      </div>
                    </div>

                    <div
                      className="p-3.5 rounded-lg space-y-1"
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="font-semibold"
                        style={{ color: "var(--accent)" }}
                      >
                        Stage D2 · Controlled Multi-Role Runtime Replay
                      </div>
                      <div style={{ color: "var(--foreground)" }}>
                        {activeProof.runtimeDifferential.differentialResponse}
                      </div>
                      <div
                        className="font-mono text-[11px] pt-1"
                        style={{ color: "var(--success)" }}
                      >
                        {activeProof.runtimeDifferential.replaysMatched}
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-3.5 rounded-lg text-xs space-y-1.5"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="font-semibold"
                      style={{ color: "var(--success)" }}
                    >
                      Stage F · Verified Remediation &amp; Contract Test
                    </div>
                    <div
                      className="font-mono"
                      style={{ color: "var(--foreground)" }}
                    >
                      {activeProof.proofContract.point6RemediationAndContractTest}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: OWASP API TOP 10 PROBE MATRIX */}
            {activeTab === "owasp-fuzzer" && (
              <div className="card-surface p-6 space-y-4">
                <h3
                  className="text-base font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  OWASP API Security Top 10:2023 Probe Results ({FINDINGS.length} Alerts)
                </h3>
                <div className="space-y-3">
                  {FINDINGS.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-xl space-y-2"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-mono font-bold"
                            style={{ color: "var(--accent)" }}
                          >
                            {f.id}
                          </span>
                          <span
                            className="text-xs font-mono px-2 py-0.5 rounded"
                            style={{
                              background: "var(--background)",
                              color: "var(--muted)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {f.owaspRef} · {f.cweId}
                          </span>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--foreground)" }}
                          >
                            {f.title}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            f.severity === "Critical"
                              ? "badge-critical"
                              : f.severity === "High"
                              ? "badge-high"
                              : "badge-medium"
                          }`}
                        >
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {f.description}
                      </p>
                      <div className="text-xs font-mono" style={{ color: "var(--foreground)" }}>
                        Remediation: {f.remediation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: JWT TOKEN GUARD & DECODER */}
            {activeTab === "jwt-lab" && (
              <div className="card-surface p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-base font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      JWT Cryptographic Guard &amp; Claim Verifier (`API2:2023` / `CWE-347`)
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      Inspects JWT header/payload invariants and checks whether the target verifier pins asymmetric `RS256`/`ES256` signatures.
                    </p>
                  </div>
                  <Link
                    href="/jwt-guard"
                    className="text-xs font-medium"
                    style={{ color: "var(--accent)" }}
                  >
                    Open Dedicated JWT Guard Studio &rarr;
                  </Link>
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: "var(--muted)" }}
                  >
                    Captured Bearer Token Fixture
                  </label>
                  <textarea
                    rows={2}
                    value={jwtTokenInput}
                    onChange={(e) => setJwtTokenInput(e.target.value)}
                    className="w-full p-3 rounded-lg font-mono text-xs outline-none"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div
                    className="p-4 rounded-lg space-y-2"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      Decoded Header &amp; Payload Claims
                    </div>
                    <pre
                      className="p-3 rounded code-block overflow-x-auto"
                      style={{
                        background: "var(--background)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
{`// Header
{ "alg": "none", "typ": "JWT" }

// Payload
{
  "userId": 1,
  "role": "admin",
  "tenant_id": "org_alpha"
}`}
                    </pre>
                  </div>

                  <div
                    className="p-4 rounded-lg space-y-2.5"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      Cryptographic Invariant Checks
                    </div>
                    {[
                      {
                        check: "Reject `alg: none` unsigned tokens",
                        status: "FAIL (API-002 Confirmed)",
                        ok: false,
                      },
                      {
                        check: "Pin asymmetric `RS256` / `ES256` allowlist",
                        status: "FAIL (Unpinned `jwt.decode`)",
                        ok: false,
                      },
                      {
                        check: "Require `exp`, `iss`, and `aud` claims",
                        status: "WARN (`exp` missing on fixture)",
                        ok: false,
                      },
                      {
                        check: "JWKS key-id (`kid`) allowlist validation",
                        status: "PASS (No SQL/path traversal in `kid`)",
                        ok: true,
                      },
                    ].map((c) => (
                      <div
                        key={c.check}
                        className="flex items-center justify-between gap-2 p-2 rounded"
                        style={{
                          background: "var(--background)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <span>{c.check}</span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            c.ok ? "badge-resolved" : "badge-critical"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: OPENAPI 3.1 SCHEMA CONTRACT DIFF */}
            {activeTab === "openapi-schema" && (
              <div className="card-surface p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-base font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      OpenAPI 3.1 Contract vs. Live Router Drift (`API3:2023` &amp; `API9:2023`)
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      Detects undocumented shadow routes, unvalidated mass-assignment properties, and undeclared sensitive response fields.
                    </p>
                  </div>
                  <Link
                    href="/openapi-ingest"
                    className="text-xs font-medium"
                    style={{ color: "var(--accent)" }}
                  >
                    Open OpenAPI 3.1 Studio &rarr;
                  </Link>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    {
                      route: "PUT /api/v2/users/{id}",
                      issue:
                        "Request schema allows additionalProperties; controller binds `is_admin` and `role` directly to ORM model (`API-006`).",
                      severity: "High",
                    },
                    {
                      route: "GET /api/v2/admin/users/{id}",
                      issue:
                        "Live HTTP 200 response emits `password_hash` not declared in OpenAPI `AdminUserResponse` schema (`API-005`).",
                      severity: "High",
                    },
                    {
                      route: "GET /api/swagger-ui & GET /api/v1/users/export-csv",
                      issue:
                        "Undocumented shadow/documentation routes exposed in production gateway (`API-008` / `API9:2023`).",
                      severity: "Medium",
                    },
                  ].map((item) => (
                    <div
                      key={item.route}
                      className="p-4 rounded-lg flex items-start justify-between gap-4"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="space-y-1">
                        <div
                          className="font-mono font-semibold"
                          style={{ color: "var(--accent)" }}
                        >
                          {item.route}
                        </div>
                        <div style={{ color: "var(--foreground)" }}>
                          {item.issue}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-semibold shrink-0 ${
                          item.severity === "High"
                            ? "badge-high"
                            : "badge-medium"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: ROLE-DIFFERENTIAL HTTP REPLAY */}
            {activeTab === "request-replay" && (
              <div className="card-surface p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3
                      className="text-base font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      Controlled Role-Differential Replay (`GET /api/v2/users/1001`)
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      Compare deterministic HTTP responses across Tenant A, Tenant B, and Anonymous principals to verify object-level authorization.
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { id: "tenant_a", label: "Principal: Tenant A (user_1000)" },
                      { id: "tenant_b", label: "Principal: Tenant B Owner (user_1001)" },
                      { id: "anonymous", label: "Principal: Unauthenticated" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setReplayPrincipal(p.id as typeof replayPrincipal)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                        style={{
                          background:
                            replayPrincipal === p.id
                              ? "var(--accent-soft)"
                              : "var(--surface-2)",
                          color:
                            replayPrincipal === p.id
                              ? "var(--accent)"
                              : "var(--muted)",
                          border:
                            replayPrincipal === p.id
                              ? "1px solid var(--accent)"
                              : "1px solid var(--border)",
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: "var(--muted)" }}
                    >
                      HTTP Request Trace
                    </div>
                    <pre
                      className="p-4 rounded-lg code-block overflow-x-auto"
                      style={{
                        background: "var(--background)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
{replayPrincipal === "tenant_a"
  ? `GET /api/v2/users/1001 HTTP/1.1
Host: staging.api.acme.com
Authorization: Bearer <jwt_sub_1000_tenant_alpha>
X-Validation-Probe: BOLA-Differential-Replay`
  : replayPrincipal === "tenant_b"
  ? `GET /api/v2/users/1001 HTTP/1.1
Host: staging.api.acme.com
Authorization: Bearer <jwt_sub_1001_tenant_beta>
X-Validation-Probe: Baseline-Owner`
  : `GET /api/v2/users/1001 HTTP/1.1
Host: staging.api.acme.com
X-Validation-Probe: Unauthenticated-Baseline`}
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: "var(--muted)" }}
                    >
                      Observed HTTP Response &amp; Verdict
                    </div>
                    <pre
                      className="p-4 rounded-lg code-block overflow-x-auto"
                      style={{
                        background: "var(--background)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
{replayPrincipal === "tenant_a"
  ? `HTTP/1.1 200 OK  [VIOLATION: Expected 403/404]
Content-Type: application/json

{
  "id": 1001,
  "tenant_id": "org_beta",
  "name": "Jane Smith",
  "email": "jane@corp.com",
  "ssn_last4": "7821",
  "salary": 94000
}`
  : replayPrincipal === "tenant_b"
  ? `HTTP/1.1 200 OK  [Authorized Resource Owner]
Content-Type: application/json

{
  "id": 1001,
  "tenant_id": "org_beta",
  "name": "Jane Smith",
  "email": "jane@corp.com"
}`
  : `HTTP/1.1 401 Unauthorized  [Authentication Enforced]
Content-Type: application/json

{
  "error": "missing_bearer_token"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
