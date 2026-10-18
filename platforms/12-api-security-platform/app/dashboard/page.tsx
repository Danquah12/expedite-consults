"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Search,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  Columns,
  Maximize2,
  Layers,
} from "lucide-react";
import { FINDINGS, SCAN_SUMMARY } from "@/data/findings";
import { API_RELEASE_GATES, API_PIPELINE_FINDINGS } from "@/lib/validation-engine";
import type { APIFinding, APISeverity } from "@/types/api";

type WorkspaceLayout = "split" | "findings" | "analytics";
type TriageViewMode = "cards" | "table";

export default function ApiSecurityDashboardPage() {
  const [findings, setFindings] = useState<APIFinding[]>(FINDINGS);
  const [selectedId, setSelectedId] = useState<string>(FINDINGS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<APISeverity | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Resolved" | "Suppressed">("All");
  const [workspaceLayout, setWorkspaceLayout] = useState<WorkspaceLayout>("split");
  const [viewMode, setViewMode] = useState<TriageViewMode>("cards");

  const categories = ["All", ...Array.from(new Set(FINDINGS.map((f) => f.category)))];

  const filtered = findings.filter((f) => {
    const matchSearch =
      !searchQuery ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.owaspRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.cweId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSev = severityFilter === "All" || f.severity === severityFilter;
    const matchCat = categoryFilter === "All" || f.category === categoryFilter;
    const matchStatus = statusFilter === "All" || f.status === statusFilter;
    return matchSearch && matchSev && matchCat && matchStatus;
  });

  const selectedFinding =
    findings.find((f) => f.id === selectedId) || filtered[0] || findings[0];

  const linkedProof = API_PIPELINE_FINDINGS.find(
    (p) => p.id === selectedFinding?.id
  );

  const updateStatus = (id: string, status: APIFinding["status"]) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status } : f))
    );
  };

  const severityBadge = (sev: APISeverity) => {
    if (sev === "Critical") return "badge-critical";
    if (sev === "High") return "badge-high";
    if (sev === "Medium") return "badge-medium";
    return "badge-low";
  };

  const statusBadge = (st: APIFinding["status"]) => {
    if (st === "Open") return "badge-open";
    if (st === "Resolved") return "badge-resolved";
    return "badge-suppressed";
  };

  const openCount = findings.filter((f) => f.status === "Open").length;
  const resolvedCount = findings.filter((f) => f.status === "Resolved").length;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Command Header */}
        <section className="card-surface p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid rgba(139, 69, 40, 0.25)",
                }}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>API Security Posture &amp; Proof Governance</span>
              </span>
              <span
                className="text-xs font-mono px-2.5 py-0.5 rounded"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                Gateway: {SCAN_SUMMARY.target} &middot; commit: 9f4c2a1e
              </span>
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              Enterprise API Triage &amp; Proof-Driven Release Gates
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 3-Mode Layout Switcher */}
            <div
              className="flex items-center gap-1 p-1 rounded-lg"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              {[
                { id: "split", label: "Split Workspace", icon: Columns },
                { id: "findings", label: "Findings Focus", icon: Maximize2 },
                { id: "analytics", label: "Gates & Analytics", icon: ShieldCheck },
              ].map((m) => {
                const Icon = m.icon;
                const active = workspaceLayout === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setWorkspaceLayout(m.id as WorkspaceLayout)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors"
                    style={{
                      background: active ? "var(--surface)" : "transparent",
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
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <Link
              href="/validation-engine"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
              style={{
                background: "var(--surface-2)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <Cpu className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              <span>Validation Engine</span>
            </Link>

            <Link
              href="/scan"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold"
              style={{ background: "var(--accent)", color: "#fbf8f3" }}
            >
              <Play className="w-3.5 h-3.5" />
              <span>New API Scan</span>
            </Link>
          </div>
        </section>

        {/* 5-Card Executive KPI Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              label: "Indexed API Endpoints",
              value: `${SCAN_SUMMARY.endpointsScanned}`,
              sub: "REST, GraphQL & gRPC",
              tone: "var(--foreground)",
            },
            {
              label: "Confirmed w/ 6-Point Proof",
              value: "6",
              sub: "100% Replay Reproducible",
              tone: "var(--critical)",
            },
            {
              label: "Open / Resolved Triage",
              value: `${openCount} / ${resolvedCount}`,
              sub: `${findings.length} Total Tracked Alerts`,
              tone: "var(--accent)",
            },
            {
              label: "API Mutation Catch Rate",
              value: "95.0%",
              sub: "19/20 Seeded Mutants Caught",
              tone: "var(--success)",
            },
            {
              label: "Release Quality Gates",
              value: "6 / 6 PASS",
              sub: "Zero Unverified Confirmations",
              tone: "var(--success)",
            },
          ].map((kpi) => (
            <div key={kpi.label} className="card-surface p-4">
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {kpi.label}
              </div>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: kpi.tone }}
              >
                {kpi.value}
              </div>
              <div
                className="text-[11px] mt-0.5"
                style={{ color: "var(--subtle)" }}
              >
                {kpi.sub}
              </div>
            </div>
          ))}
        </section>

        {/* Unified Filter & View Toggle Toolbar */}
        {workspaceLayout !== "analytics" && (
          <section className="card-surface p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-64">
                <Search
                  className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted)" }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search route, BOLA, API1:2023, CWE..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1">
                {(["All", "Critical", "High", "Medium"] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                    style={{
                      background:
                        severityFilter === sev
                          ? "var(--accent-soft)"
                          : "var(--surface-2)",
                      color:
                        severityFilter === sev
                          ? "var(--accent)"
                          : "var(--muted)",
                      border:
                        severityFilter === sev
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                    }}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              {/* Category Select */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
                className="px-2.5 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <option value="All">Status: All</option>
                <option value="Open">Status: Open</option>
                <option value="Resolved">Status: Resolved</option>
                <option value="Suppressed">Status: Suppressed</option>
              </select>
            </div>

            {/* Cards vs Table Toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                Showing {filtered.length} of {findings.length} findings
              </span>
              <div
                className="flex items-center gap-1 p-1 rounded-lg"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                <button
                  onClick={() => setViewMode("cards")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer"
                  style={{
                    background:
                      viewMode === "cards" ? "var(--surface)" : "transparent",
                    color:
                      viewMode === "cards"
                        ? "var(--foreground)"
                        : "var(--muted)",
                  }}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer"
                  style={{
                    background:
                      viewMode === "table" ? "var(--surface)" : "transparent",
                    color:
                      viewMode === "table"
                        ? "var(--foreground)"
                        : "var(--muted)",
                  }}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Workspace Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT / MAIN TRIAGE PANEL */}
          {workspaceLayout !== "analytics" && (
            <div
              className={
                workspaceLayout === "split"
                  ? "lg:col-span-7 space-y-3"
                  : "lg:col-span-12 space-y-3"
              }
            >
              {viewMode === "cards" ? (
                <div className="space-y-3">
                  {filtered.map((f) => {
                    const isSelected = f.id === selectedFinding?.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedId(f.id)}
                        className="card-surface p-5 cursor-pointer transition-colors space-y-3"
                        style={{
                          background: isSelected
                            ? "var(--surface-2)"
                            : "var(--surface)",
                          borderColor: isSelected
                            ? "var(--accent)"
                            : "var(--border)",
                        }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="text-xs font-mono font-bold"
                              style={{ color: "var(--accent)" }}
                            >
                              {f.id}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded ${severityBadge(
                                f.severity
                              )}`}
                            >
                              {f.severity}
                            </span>
                            <span
                              className="text-xs font-mono px-2 py-0.5 rounded"
                              style={{
                                background: "var(--background)",
                                color: "var(--muted)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {f.owaspRef} &middot; {f.cweId}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                background: "var(--background)",
                                color: "var(--foreground)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {f.category}
                            </span>
                          </div>

                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded ${statusBadge(
                              f.status
                            )}`}
                          >
                            {f.status}
                          </span>
                        </div>

                        <div>
                          <h3
                            className="text-base font-bold"
                            style={{ color: "var(--foreground)" }}
                          >
                            {f.title}
                          </h3>
                          <div
                            className="text-xs font-mono mt-1"
                            style={{ color: "var(--muted)" }}
                          >
                            <span style={{ color: "var(--accent)" }}>
                              {f.endpoint.method}
                            </span>{" "}
                            {f.endpoint.path} &middot; {f.apiType} &middot; Owner:{" "}
                            {f.owner}
                          </div>
                        </div>

                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: "var(--muted)" }}
                        >
                          {f.description}
                        </p>

                        <div
                          className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <span
                            className="font-mono text-[11px]"
                            style={{ color: "var(--success)" }}
                          >
                            Proof Status: 6-Point Contract Verified (commit 9f4c2a1e)
                          </span>
                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(["Open", "Resolved", "Suppressed"] as const).map(
                              (st) => (
                                <button
                                  key={st}
                                  onClick={() => updateStatus(f.id, st)}
                                  className="px-2 py-1 rounded text-[11px] font-medium cursor-pointer"
                                  style={{
                                    background:
                                      f.status === st
                                        ? "var(--accent-soft)"
                                        : "var(--background)",
                                    color:
                                      f.status === st
                                        ? "var(--accent)"
                                        : "var(--muted)",
                                    border: "1px solid var(--border)",
                                  }}
                                >
                                  {st}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
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
                          <th className="py-3 px-4 font-semibold">ID</th>
                          <th className="py-3 px-4 font-semibold">Severity</th>
                          <th className="py-3 px-4 font-semibold">Endpoint &amp; Title</th>
                          <th className="py-3 px-4 font-semibold">OWASP / CWE</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((f) => (
                          <tr
                            key={f.id}
                            onClick={() => setSelectedId(f.id)}
                            className="border-b cursor-pointer transition-colors"
                            style={{
                              borderColor: "var(--border)",
                              background:
                                f.id === selectedFinding?.id
                                  ? "var(--surface-2)"
                                  : "transparent",
                            }}
                          >
                            <td
                              className="py-3.5 px-4 font-mono font-semibold"
                              style={{ color: "var(--accent)" }}
                            >
                              {f.id}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${severityBadge(
                                  f.severity
                                )}`}
                              >
                                {f.severity}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div
                                className="font-semibold"
                                style={{ color: "var(--foreground)" }}
                              >
                                {f.title}
                              </div>
                              <div
                                className="font-mono text-[11px]"
                                style={{ color: "var(--muted)" }}
                              >
                                {f.endpoint.method} {f.endpoint.path}
                              </div>
                            </td>
                            <td
                              className="py-3.5 px-4 font-mono"
                              style={{ color: "var(--muted)" }}
                            >
                              {f.owaspRef} &middot; {f.cweId}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${statusBadge(
                                  f.status
                                )}`}
                              >
                                {f.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RIGHT / GOVERNANCE, REQUEST-RESPONSE EVIDENCE & RELEASE GATES RAIL */}
          {workspaceLayout !== "findings" && (
            <div
              className={
                workspaceLayout === "split"
                  ? "lg:col-span-5 space-y-5"
                  : "lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6"
              }
            >
              {/* Selected Finding Evidence Inspector */}
              {selectedFinding && (
                <div className="card-surface p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-mono font-bold"
                          style={{ color: "var(--accent)" }}
                        >
                          {selectedFinding.id} · {selectedFinding.owaspRef} (
                          {selectedFinding.cweId})
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${severityBadge(
                            selectedFinding.severity
                          )}`}
                        >
                          {selectedFinding.severity}
                        </span>
                      </div>
                      <h3
                        className="text-base font-bold mt-1"
                        style={{ color: "var(--foreground)" }}
                      >
                        {selectedFinding.title}
                      </h3>
                    </div>
                  </div>

                  {linkedProof && (
                    <div
                      className="p-3.5 rounded-lg text-xs space-y-1.5"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="font-semibold flex items-center justify-between"
                        style={{ color: "var(--accent)" }}
                      >
                        <span>6-Point Proof Contract Summary</span>
                        <span className="font-mono text-[11px]" style={{ color: "var(--success)" }}>
                          {linkedProof.status} ({(linkedProof.confidence * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <div style={{ color: "var(--foreground)" }}>
                        {linkedProof.staticVerdict.missingPredicate}
                      </div>
                      <div className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>
                        Controller: {linkedProof.endpoint.controllerFile}:
                        {linkedProof.endpoint.lineRange}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <div
                      className="font-semibold"
                      style={{ color: "var(--muted)" }}
                    >
                      Controlled HTTP Request Evidence
                    </div>
                    <pre
                      className="p-3 rounded-lg code-block overflow-x-auto"
                      style={{
                        background: "var(--background)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {selectedFinding.requestExample.trim()}
                    </pre>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div
                      className="font-semibold"
                      style={{ color: "var(--muted)" }}
                    >
                      Observed HTTP Response Evidence
                    </div>
                    <pre
                      className="p-3 rounded-lg code-block overflow-x-auto"
                      style={{
                        background: "var(--background)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {selectedFinding.responseExample.trim()}
                    </pre>
                  </div>

                  <div
                    className="p-3.5 rounded-lg text-xs space-y-1"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="font-semibold"
                      style={{ color: "var(--success)" }}
                    >
                      Verified Engineering Remediation
                    </div>
                    <div style={{ color: "var(--foreground)" }}>
                      {selectedFinding.remediation}
                    </div>
                  </div>
                </div>
              )}

              {/* Release Quality Gates Card */}
              <div className="card-surface p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      CI/CD API Release Quality Gates (6 / 6 PASS)
                    </h3>
                  </div>
                  <Link
                    href="/validation-engine"
                    className="text-xs font-medium"
                    style={{ color: "var(--accent)" }}
                  >
                    Inspect Gates &rarr;
                  </Link>
                </div>

                <div className="space-y-2.5 text-xs">
                  {API_RELEASE_GATES.map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded-lg flex items-center justify-between gap-3"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <div
                          className="font-semibold"
                          style={{ color: "var(--foreground)" }}
                        >
                          {g.id} · {g.name}
                        </div>
                        <div
                          className="text-[11px] font-mono mt-0.5"
                          style={{ color: "var(--muted)" }}
                        >
                          {g.measured}
                        </div>
                      </div>
                      <span className="badge-resolved px-2 py-0.5 rounded text-[11px] font-semibold shrink-0">
                        {g.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
