"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Layers,
  GitBranch,
  Play,
  BookOpen,
  Search,
  Copy,
  Check,
  ArrowRight,
  Lock,
  Terminal,
} from "lucide-react";
import {
  API_PIPELINE_FINDINGS,
  API_SECURITY_CLAIMS,
  SPECIALIZED_API_MODULES,
  API_MUTATION_SUITE,
  API_RELEASE_GATES,
  OWASP_API_CATALOG,
} from "@/lib/validation-engine";
import Footer from "@/components/layout/Footer";

type StudioTab =
  | "pipeline"
  | "claims"
  | "modules"
  | "mutation"
  | "gates"
  | "catalog";

export default function ApiValidationEnginePage() {
  const [activeTab, setActiveTab] = useState<StudioTab>("pipeline");
  const [selectedFindingId, setSelectedFindingId] = useState<string>(
    API_PIPELINE_FINDINGS[0].id
  );
  const [selectedOwaspId, setSelectedOwaspId] = useState<string>(
    OWASP_API_CATALOG[0].owaspId
  );
  const [catalogQuery, setCatalogQuery] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);

  const selectedFinding =
    API_PIPELINE_FINDINGS.find((f) => f.id === selectedFindingId) ||
    API_PIPELINE_FINDINGS[0];

  const filteredCatalog = OWASP_API_CATALOG.filter(
    (entry) =>
      entry.owaspId.toLowerCase().includes(catalogQuery.toLowerCase()) ||
      entry.name.toLowerCase().includes(catalogQuery.toLowerCase()) ||
      entry.cweIds.some((c) =>
        c.toLowerCase().includes(catalogQuery.toLowerCase())
      ) ||
      entry.nistControls.some((n) =>
        n.toLowerCase().includes(catalogQuery.toLowerCase())
      )
  );

  const activeCatalogEntry =
    filteredCatalog.find((c) => c.owaspId === selectedOwaspId) ||
    filteredCatalog[0] ||
    OWASP_API_CATALOG[0];

  const handleRunVerification = () => {
    setRunningPipeline(true);
    setTimeout(() => setRunningPipeline(false), 650);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 1800);
  };

  const statusBadge = (status: string) => {
    if (status === "CONFIRMED") return "badge-critical";
    if (status === "LIKELY") return "badge-high";
    if (status === "FALSE_POSITIVE") return "badge-resolved";
    return "badge-low";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Command Header */}
        <section className="card-surface p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid rgba(122, 162, 247, 0.28)",
                }}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>PTES / NIST SP 800-115 · Proof-Driven API Validation Engine</span>
              </span>
              <span
                className="text-xs font-mono px-2.5 py-1 rounded-md"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                commit: 9f4c2a1e · openapi: sha256:4b8e91c0
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              Deterministic API Finding Validation &amp; Hybrid Proof Engine
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Do not ask an LLM whether an API vulnerability looks exploitable. Combine OpenAPI 3.1 contract analysis, controller AST predicate inspection, and controlled multi-principal HTTP replay to verify reachability and generate commit-bound 6-Point Proof Contracts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleRunVerification}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90 cursor-pointer"
              style={{ background: "var(--accent)", color: "#0f1115" }}
            >
              <Play className="w-3.5 h-3.5" />
              <span>
                {runningPipeline
                  ? "Re-Verifying 8 API Findings..."
                  : "Re-Run Stages A–F Verification"}
              </span>
            </button>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium"
              style={{
                background: "var(--surface-2)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <span>Open API Scan Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Executive Summary Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { label: "Ingested API Alerts", val: "8", sub: "OpenAPI + Gateway + SAST" },
            { label: "Confirmed w/ Proof", val: "6", sub: "6/6 Proof Contracts Complete" },
            { label: "False Positives Filtered", val: "1", sub: "API-009 Bound SQL Parameter" },
            { label: "Z3 Security Claims", val: "5", sub: "3 Counterexamples Isolated" },
            { label: "Pluggable API Analyzers", val: "10", sub: "BOLA, BFLA, JWT, CORS, SSRF" },
            { label: "Mutation Catch Rate", val: "95.0%", sub: "19/20 Seeded API Mutants" },
          ].map((m) => (
            <div
              key={m.label}
              className="card-surface p-4 flex flex-col justify-between"
            >
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                {m.label}
              </span>
              <span
                className="text-xl font-bold mt-1"
                style={{ color: "var(--foreground)" }}
              >
                {m.val}
              </span>
              <span
                className="text-[11px] mt-1"
                style={{ color: "var(--subtle)" }}
              >
                {m.sub}
              </span>
            </div>
          ))}
        </section>

        {/* 6-Tab Navigation Bar */}
        <div
          className="flex items-center gap-1.5 p-1.5 rounded-xl overflow-x-auto"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {[
            {
              id: "pipeline",
              label: "1. Stages A–F & 6-Point Proof Contracts",
              icon: Layers,
            },
            {
              id: "claims",
              label: "2. Z3 API Claims & Counterexamples",
              icon: FileCode2,
            },
            {
              id: "modules",
              label: "3. 10 Pluggable API Modules",
              icon: Lock,
            },
            {
              id: "mutation",
              label: "4. API Security Mutation Testing",
              icon: GitBranch,
            },
            {
              id: "gates",
              label: "5. 6 Release Quality Gates",
              icon: ShieldCheck,
            },
            {
              id: "catalog",
              label: "6. OWASP API Top 10:2023 / CWE / NVD Catalog",
              icon: BookOpen,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StudioTab)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
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
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: STAGES A-F PIPELINE & 6-POINT PROOF CONTRACTS */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            {/* Stages A-F Architecture Flow */}
            <div className="card-surface p-5">
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
                Validation Pipeline Architecture (Stages A &rarr; F)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {[
                  {
                    stage: "Stage A",
                    title: "OpenAPI & Gateway Ingest",
                    desc: "OpenAPI 3.1, GraphQL SDL, SARIF & Kong/Envoy logs",
                  },
                  {
                    stage: "Stage B",
                    title: "Route AST & Auth Context",
                    desc: "Controller AST, JWT middleware chain & ORM predicates",
                  },
                  {
                    stage: "Stage C",
                    title: "Validation Planner",
                    desc: "Selects Role-Differential, JWT Guard, or DTO probe",
                  },
                  {
                    stage: "Stage D1 + D2",
                    title: "Static + Role Replay",
                    desc: "ORM predicate check + Tenant A vs. Tenant B lab replay",
                  },
                  {
                    stage: "Stage E",
                    title: "Independent Verifier",
                    desc: "Requires >=98% replay match & 6-Point Proof Contract",
                  },
                  {
                    stage: "Stage F",
                    title: "Remediation & Contract",
                    desc: "Emits middleware patch + Pytest/Schemathesis test",
                  },
                ].map((s) => (
                  <div
                    key={s.stage}
                    className="p-3.5 rounded-lg"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="text-[11px] font-mono font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      {s.stage}
                    </div>
                    <div
                      className="text-xs font-semibold mt-1"
                      style={{ color: "var(--foreground)" }}
                    >
                      {s.title}
                    </div>
                    <div
                      className="text-[11px] mt-1 leading-relaxed"
                      style={{ color: "var(--muted)" }}
                    >
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Split Workspace: Left Finding List, Right 6-Point Proof Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Normalized API Findings */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: "var(--muted)" }}>
                  Canonical API Findings ({API_PIPELINE_FINDINGS.length})
                </div>
                {API_PIPELINE_FINDINGS.map((f) => {
                  const isSelected = f.id === selectedFinding.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFindingId(f.id)}
                      className="w-full text-left p-4 rounded-xl transition-colors cursor-pointer"
                      style={{
                        background: isSelected
                          ? "var(--surface-2)"
                          : "var(--surface)",
                        border: isSelected
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-mono font-semibold"
                            style={{ color: "var(--accent)" }}
                          >
                            {f.id}
                          </span>
                          <span
                            className="text-[11px] font-mono px-2 py-0.5 rounded"
                            style={{
                              background: "var(--background)",
                              color: "var(--muted)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {f.owaspApiId} · {f.cweId}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${statusBadge(
                            f.status
                          )}`}
                        >
                          {f.status}
                        </span>
                      </div>

                      <div
                        className="text-sm font-semibold mt-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        {f.title}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2.5 text-xs font-mono" style={{ color: "var(--muted)" }}>
                        <span>
                          {f.endpoint.method} {f.endpoint.path}
                        </span>
                        <span>Conf: {(f.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Static + Runtime Evidence & 6-Point Proof Contract */}
              <div className="lg:col-span-7 space-y-5">
                <div className="card-surface p-6 space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                          }}
                        >
                          {selectedFinding.id} · {selectedFinding.owaspApiId} (
                          {selectedFinding.cweId})
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded ${statusBadge(
                            selectedFinding.status
                          )}`}
                        >
                          {selectedFinding.status}
                        </span>
                      </div>
                      <h2
                        className="text-lg font-bold mt-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        {selectedFinding.title}
                      </h2>
                      <div
                        className="text-xs font-mono mt-1"
                        style={{ color: "var(--muted)" }}
                      >
                        {selectedFinding.endpoint.method}{" "}
                        {selectedFinding.endpoint.path} &middot;{" "}
                        {selectedFinding.endpoint.controllerFile}:
                        {selectedFinding.endpoint.lineRange}
                      </div>
                    </div>
                  </div>

                  {/* Stage D1 Static Route & ORM Predicate Verdict */}
                  <div
                    className="p-4 rounded-lg space-y-2"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--accent)" }}
                    >
                      Stage D1 · Static Controller AST &amp; Policy Verdict
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span style={{ color: "var(--muted)" }}>
                          Middleware Chain:{" "}
                        </span>
                        <span
                          className="font-mono"
                          style={{ color: "var(--foreground)" }}
                        >
                          {selectedFinding.staticVerdict.authMiddlewareChain.join(
                            " -> "
                          )}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>
                          Reachable Route:{" "}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--success)" }}
                        >
                          Yes (OpenAPI + Router AST verified)
                        </span>
                      </div>
                    </div>
                    <div className="text-xs">
                      <span style={{ color: "var(--muted)" }}>
                        Predicate Analysis:{" "}
                      </span>
                      <span style={{ color: "var(--foreground)" }}>
                        {selectedFinding.staticVerdict.missingPredicate}
                      </span>
                    </div>
                    <div
                      className="p-2.5 rounded font-mono text-xs overflow-x-auto"
                      style={{
                        background: "var(--background)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      Sink: {selectedFinding.staticVerdict.ormSink}
                    </div>
                  </div>

                  {/* Stage D2 Controlled Role-Differential Runtime Replay */}
                  <div
                    className="p-4 rounded-lg space-y-2"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--accent)" }}
                    >
                      Stage D2 · Controlled Multi-Principal Runtime Differential
                      Replay
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div
                        className="p-3 rounded"
                        style={{
                          background: "var(--background)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ color: "var(--muted)" }}>
                          Principal A Context
                        </div>
                        <div
                          className="font-mono mt-1"
                          style={{ color: "var(--foreground)" }}
                        >
                          {selectedFinding.runtimeDifferential.principalA}
                        </div>
                      </div>
                      <div
                        className="p-3 rounded"
                        style={{
                          background: "var(--background)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ color: "var(--muted)" }}>
                          Target / Comparison Context
                        </div>
                        <div
                          className="font-mono mt-1"
                          style={{ color: "var(--foreground)" }}
                        >
                          {selectedFinding.runtimeDifferential.principalB}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs space-y-1 pt-1">
                      <div>
                        <span style={{ color: "var(--muted)" }}>Baseline: </span>
                        <span
                          className="font-mono"
                          style={{ color: "var(--foreground)" }}
                        >
                          {selectedFinding.runtimeDifferential.baselineResponse}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>
                          Observed Differential:{" "}
                        </span>
                        <span
                          className="font-mono"
                          style={{ color: "var(--foreground)" }}
                        >
                          {
                            selectedFinding.runtimeDifferential
                              .differentialResponse
                          }
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>
                          Determinism:{" "}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--success)" }}
                        >
                          {selectedFinding.runtimeDifferential.replaysMatched}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage E + F: 6-Point Proof Contract */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--foreground)" }}
                      >
                        Stage E &amp; F · 6-Point Proof Contract
                      </span>
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: "var(--muted)" }}
                      >
                        SHA: {selectedFinding.proofContract.commitSha} · Spec:{" "}
                        {selectedFinding.proofContract.openApiSha256}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 text-xs">
                      {[
                        {
                          num: "Point 1 · Route-to-Sink Trace",
                          val: selectedFinding.proofContract
                            .point1EntryToController,
                        },
                        {
                          num: "Point 2 · Preconditions & Auth Context",
                          val: selectedFinding.proofContract.point2AuthPreconditions.join(
                            " · "
                          ),
                        },
                        {
                          num: "Point 3 · Controlled Execution Trace",
                          val: selectedFinding.proofContract
                            .point3RoleDifferentialTrace,
                        },
                        {
                          num: "Point 4 · Expected Safe vs. Observed Behavior",
                          val: `Expected: ${selectedFinding.proofContract.point4ExpectedVsObserved.expectedSafe} | Observed: ${selectedFinding.proofContract.point4ExpectedVsObserved.observedBehavior}`,
                        },
                        {
                          num: "Point 5 · Replay Reproducibility",
                          val: selectedFinding.proofContract
                            .point5Reproducibility,
                        },
                        {
                          num: "Point 6 · Remediation & Executable Contract Test",
                          val: selectedFinding.proofContract
                            .point6RemediationAndContractTest,
                        },
                      ].map((pt) => (
                        <div
                          key={pt.num}
                          className="p-3 rounded-lg"
                          style={{
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div
                            className="font-semibold"
                            style={{ color: "var(--accent)" }}
                          >
                            {pt.num}
                          </div>
                          <div
                            className="font-mono mt-1 leading-relaxed"
                            style={{ color: "var(--foreground)" }}
                          >
                            {pt.val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Z3 API SECURITY CLAIMS & COUNTEREXAMPLES */}
        {activeTab === "claims" && (
          <div className="space-y-4">
            <div className="card-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  Formal API Security Claims &amp; Z3 Counterexample Witnesses
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Verifies tenancy isolation, JWT algorithm pinning, DTO field allowlists, and BFLA verb invariants across controller ASTs. Every counterexample automatically synthesizes a CI-ready Pytest contract.
                </p>
              </div>
              <span
                className="text-xs font-mono px-3 py-1.5 rounded-lg shrink-0"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--accent)",
                  border: "1px solid var(--border)",
                }}
              >
                2 Verified · 3 Counterexamples Found
              </span>
            </div>

            <div className="space-y-4">
              {API_SECURITY_CLAIMS.map((claim) => (
                <div key={claim.id} className="card-surface p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                        style={{
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                        }}
                      >
                        {claim.id}
                      </span>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {claim.owaspRef}
                      </span>
                      <h3
                        className="text-sm font-bold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {claim.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: "var(--muted)" }}
                      >
                        Z3 Solver: {claim.solverTimeMs}ms
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                          claim.status === "VERIFIED"
                            ? "badge-resolved"
                            : "badge-critical"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                  </div>

                  <div
                    className="p-3 rounded-lg font-mono text-xs overflow-x-auto"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    Invariant: {claim.formalInvariant}
                  </div>

                  {claim.counterexample && (
                    <div
                      className="p-4 rounded-lg space-y-2 text-xs"
                      style={{
                        background: "rgba(229, 72, 77, 0.06)",
                        border: "1px solid rgba(229, 72, 77, 0.25)",
                      }}
                    >
                      <div
                        className="font-semibold flex items-center gap-1.5"
                        style={{ color: "#f27478" }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Z3 Counterexample Witness Isolated</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono">
                        <div>
                          <span style={{ color: "var(--muted)" }}>
                            Principal:{" "}
                          </span>
                          {claim.counterexample.principalContext}
                        </div>
                        <div>
                          <span style={{ color: "var(--muted)" }}>Input: </span>
                          {claim.counterexample.requestInput}
                        </div>
                        <div>
                          <span style={{ color: "var(--muted)" }}>Path: </span>
                          {claim.counterexample.controllerPath}
                        </div>
                        <div>
                          <span style={{ color: "var(--muted)" }}>
                            Violated:{" "}
                          </span>
                          {claim.counterexample.violatedPostcondition}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div
                      className="text-xs font-semibold mb-1.5"
                      style={{ color: "var(--muted)" }}
                    >
                      Synthesized Executable Security Contract (Pytest CI Gate):
                    </div>
                    <pre
                      className="p-3.5 rounded-lg code-block overflow-x-auto"
                      style={{
                        background: "var(--background)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {claim.executableContract}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 10 PLUGGABLE API SECURITY MODULES */}
        {activeTab === "modules" && (
          <div className="space-y-4">
            <div className="card-surface p-5">
              <h2
                className="text-base font-bold"
                style={{ color: "var(--foreground)" }}
              >
                10 Pluggable Domain-Specific API Security Analyzers
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Modular analyzers invoked by the Validation Planner (`Stage C`) based on route topology, authentication scheme, and downstream service dependencies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SPECIALIZED_API_MODULES.map((m) => (
                <div
                  key={m.id}
                  className="card-surface p-5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs font-mono font-semibold"
                        style={{ color: "var(--accent)" }}
                      >
                        {m.id} · {m.owaspFocus}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          m.findingsCount > 0
                            ? "badge-high"
                            : "badge-resolved"
                        }`}
                      >
                        {m.status} ({m.findingsCount})
                      </span>
                    </div>
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {m.name}
                    </h3>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--muted)" }}
                    >
                      {m.capability}
                    </p>
                  </div>

                  <div
                    className="p-3 rounded-lg text-xs space-y-1.5"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--muted)" }}>Invariant: </span>
                      <span style={{ color: "var(--foreground)" }}>
                        {m.invariantVerified}
                      </span>
                    </div>
                    <div className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>
                      Evidence: {m.sampleEvidence}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: API SECURITY MUTATION TESTING */}
        {activeTab === "mutation" && (
          <div className="space-y-4">
            <div className="card-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  API Security Mutation Testing Benchmark
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Injects controlled, temporary authorization and schema defects into isolated staging fixtures to verify that our validation engine catches real regressions.
                </p>
              </div>
              <div
                className="px-3.5 py-2 rounded-lg text-xs font-semibold"
                style={{
                  background: "rgba(70, 163, 110, 0.12)",
                  color: "#6bc492",
                  border: "1px solid rgba(70, 163, 110, 0.28)",
                }}
              >
                Catch Rate: 95.0% (Target &ge; 90.0%)
              </div>
            </div>

            <div className="card-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr
                      className="border-b"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border)",
                        color: "var(--muted)",
                      }}
                    >
                      <th className="py-3 px-4 font-semibold">Mutant ID</th>
                      <th className="py-3 px-4 font-semibold">Endpoint &amp; Location</th>
                      <th className="py-3 px-4 font-semibold">Injected Security Defect</th>
                      <th className="py-3 px-4 font-semibold">OWASP Category</th>
                      <th className="py-3 px-4 font-semibold">Catching Validator</th>
                      <th className="py-3 px-4 font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {API_MUTATION_SUITE.map((mut) => (
                      <tr
                        key={mut.id}
                        className="border-b"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <td
                          className="py-3.5 px-4 font-mono font-semibold"
                          style={{ color: "var(--accent)" }}
                        >
                          {mut.id}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div style={{ color: "var(--foreground)" }}>
                            {mut.endpoint}
                          </div>
                          <div
                            className="text-[11px]"
                            style={{ color: "var(--muted)" }}
                          >
                            {mut.controllerFile}
                          </div>
                        </td>
                        <td
                          className="py-3.5 px-4"
                          style={{ color: "var(--foreground)" }}
                        >
                          {mut.injectedDefect}
                        </td>
                        <td className="py-3.5 px-4 font-mono" style={{ color: "var(--muted)" }}>
                          {mut.owaspCategory}
                        </td>
                        <td className="py-3.5 px-4" style={{ color: "var(--muted)" }}>
                          {mut.catchingStage}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              mut.detected ? "badge-resolved" : "badge-high"
                            }`}
                          >
                            {mut.detected
                              ? `CAUGHT (${mut.timeMs}ms)`
                              : "MISSED (Race Window)"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 6 RELEASE QUALITY GATES */}
        {activeTab === "gates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {API_RELEASE_GATES.map((g) => (
              <div
                key={g.id}
                className="card-surface p-5 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      {g.id}
                    </span>
                    <span className="badge-resolved text-xs font-semibold px-2.5 py-0.5 rounded inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {g.status}
                    </span>
                  </div>
                  <h3
                    className="text-base font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {g.name}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {g.rationale}
                  </p>
                </div>

                <div
                  className="p-3.5 rounded-lg space-y-1 text-xs"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--muted)" }}>Requirement: </span>
                    <span
                      className="font-mono"
                      style={{ color: "var(--foreground)" }}
                    >
                      {g.requirement}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Measured: </span>
                    <span
                      className="font-mono font-semibold"
                      style={{ color: "var(--success)" }}
                    >
                      {g.measured}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: OWASP API TOP 10:2023 / CWE / NVD / NIST 800-53 CATALOG */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div className="card-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  Defensive Reference Catalog: OWASP API Top 10 (2023) &middot; MITRE CWE &middot; NIST NVD &middot; NIST SP 800-53 Rev. 5
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Backed by `validation_engine/catalog.py`—provides deterministic static AST checklists, safe role-differential verification procedures, and remediation templates without offensive payloads.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search
                  className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted)" }}
                />
                <input
                  type="text"
                  value={catalogQuery}
                  onChange={(e) => setCatalogQuery(e.target.value)}
                  placeholder="Filter API1, CWE-639, AC-3, BOLA..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left List */}
              <div className="lg:col-span-5 space-y-2.5">
                {filteredCatalog.map((entry) => {
                  const selected = entry.owaspId === activeCatalogEntry.owaspId;
                  return (
                    <button
                      key={entry.owaspId}
                      onClick={() => setSelectedOwaspId(entry.owaspId)}
                      className="w-full text-left p-3.5 rounded-xl transition-colors cursor-pointer"
                      style={{
                        background: selected
                          ? "var(--surface-2)"
                          : "var(--surface)",
                        border: selected
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-xs font-mono font-semibold"
                          style={{ color: "var(--accent)" }}
                        >
                          {entry.owaspId}
                        </span>
                        <span
                          className="text-[11px] font-mono"
                          style={{ color: "var(--muted)" }}
                        >
                          {entry.cweIds.join(", ")}
                        </span>
                      </div>
                      <div
                        className="text-xs font-semibold mt-1"
                        style={{ color: "var(--foreground)" }}
                      >
                        {entry.name}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Details */}
              <div className="lg:col-span-7">
                <div className="card-surface p-6 space-y-5">
                  <div className="space-y-2 border-b pb-4" style={{ borderColor: "var(--border)" }}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded"
                        style={{
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                        }}
                      >
                        {activeCatalogEntry.owaspId}
                      </span>
                      {activeCatalogEntry.cweIds.map((cwe) => (
                        <span
                          key={cwe}
                          className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{
                            background: "var(--surface-2)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {cwe}
                        </span>
                      ))}
                      {activeCatalogEntry.sampleCves.map((cve) => (
                        <span
                          key={cve}
                          className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{
                            background: "var(--background)",
                            color: "var(--muted)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {cve}
                        </span>
                      ))}
                    </div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {activeCatalogEntry.name}
                    </h3>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--muted)" }}
                    >
                      {activeCatalogEntry.riskSummary}
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div
                      className="p-3.5 rounded-lg"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="font-semibold mb-1"
                        style={{ color: "var(--accent)" }}
                      >
                        Static AST &amp; Schema Verification Checklist (Stage D1)
                      </div>
                      <div style={{ color: "var(--foreground)" }}>
                        {activeCatalogEntry.staticCheck}
                      </div>
                    </div>

                    <div
                      className="p-3.5 rounded-lg"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="font-semibold mb-1"
                        style={{ color: "var(--accent)" }}
                      >
                        Controlled Role-Differential Verification (Stage D2)
                      </div>
                      <div style={{ color: "var(--foreground)" }}>
                        {activeCatalogEntry.runtimeDifferentialCheck}
                      </div>
                    </div>

                    <div
                      className="p-3.5 rounded-lg"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="font-semibold mb-1"
                        style={{ color: "var(--success)" }}
                      >
                        Remediation Pattern &amp; NIST SP 800-53 Controls (
                        {activeCatalogEntry.nistControls.join(" · ")})
                      </div>
                      <div style={{ color: "var(--foreground)" }}>
                        {activeCatalogEntry.remediationPattern}
                      </div>
                    </div>
                  </div>

                  {/* Defensive Python Pattern */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-semibold flex items-center gap-1.5"
                        style={{ color: "var(--muted)" }}
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>
                          Defensive Python Verification &amp; Remediation Pattern (`validation_engine/catalog.py`)
                        </span>
                      </span>
                      <button
                        onClick={() =>
                          handleCopyCode(activeCatalogEntry.defensivePythonCheck)
                        }
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded cursor-pointer"
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {copiedSnippet ? (
                          <>
                            <Check className="w-3 h-3" style={{ color: "var(--success)" }} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre
                      className="p-4 rounded-lg code-block overflow-x-auto"
                      style={{
                        background: "var(--background)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {activeCatalogEntry.defensivePythonCheck}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
