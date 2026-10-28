"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Activity,
  Cpu,
  Terminal,
  Copy,
  Check,
  Download,
  Hash,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Layers,
  Code2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  FileCode2,
} from "lucide-react";
import {
  CYBER_VULN_KPI_SUMMARY,
  OPEN_RISK_INSTANCES,
  OPEN_DEPLOYMENT_INSTANCES,
  VULNERABILITY_TRENDS_TIMELINE,
  ANTIVIRUS_PERFORMANCE_KPIS,
  MONITORED_HOSTS_BY_OS,
  ACTIVITY_DETECTION_TIMELINE,
  MOST_RECENT_DETECTIONS,
  XTRIKE_FLEET_OVERVIEW,
  XTRIKE_HOST_PROBLEMS,
  XTRIKE_TOP_ALERTERS,
  XTRIKE_HONEYCOMB_HOSTS,
  XTRIKE_DISTRO_ACCORDION_GROUPS,
  XTRIKE_CLI_RUNTIME_SPEC,
  type HoneycombHostCell,
} from "@/lib/cyber-monitoring-data";
import { openAskNoctisPopup } from "@/components/DeveloperAssistAgent";
import { loadActiveScanSession } from "@/lib/live-sast-scanner";

export default function CyberMonitoringPage() {
  const [activeTab, setActiveTab] = useState<"all" | "posture" | "sensors" | "mesh" | "cli">("all");
  const [selectedNode, setSelectedNode] = useState<HoneycombHostCell>(XTRIKE_HONEYCOMB_HOSTS[3]);
  const [meshFilter, setMeshFilter] = useState<"ALL" | "CRIT" | "WARN" | "OK">("ALL");
  const [openDistros, setOpenDistros] = useState<Record<string, boolean>>({
    "Ubuntu / Debian APT": true,
    "RHEL / Rocky / Amazon Linux": false,
    "macOS Homebrew & Apple Silicon": false,
    "Docker / Helm & GitHub Actions": false,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleHashId, setVisibleHashId] = useState<string | null>(null);
  const [cliStep, setCliStep] = useState<number>(3);
  const [cliRunning, setCliRunning] = useState<boolean>(false);
  const [activeScanRepo, setActiveScanRepo] = useState<string | null>(null);
  const [activeScanCount, setActiveScanCount] = useState<number | null>(null);

  useEffect(() => {
    const session = loadActiveScanSession();
    if (session && session.repoUrl) {
      setActiveScanRepo(session.repoUrl);
      setActiveScanCount(Array.isArray(session.sastFindings) ? session.sastFindings.length : null);
    }
  }, []);

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const runCliProvisionSimulation = () => {
    setCliRunning(true);
    setCliStep(1);
    setTimeout(() => setCliStep(2), 550);
    setTimeout(() => {
      setCliStep(3);
      setCliRunning(false);
    }, 1200);
  };

  const filteredMeshNodes = XTRIKE_HONEYCOMB_HOSTS.filter((h) => {
    if (meshFilter === "ALL") return true;
    return h.state === meshFilter;
  });

  const totalMonitoredNodes = MONITORED_HOSTS_BY_OS.reduce((acc, item) => acc + item.hosts, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =====================================================================
            EDITORIAL MASTHEAD — WARM PARCHMENT & TERRACOTTA XTRIKE SAST DESK
           ===================================================================== */}
        <section
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 6px 24px rgba(31, 27, 24, 0.04)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="desk-kicker">
                  XTRIKE SAST DESK &middot; PLATFORM 05 POSTURE &amp; RUNTIME TELEMETRY
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    border: "1px solid var(--border)",
                  }}
                >
                  4 AST Engines &middot; 401 CWE Rules &middot; 5 Canonical Proof States
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold font-editorial leading-tight">
                XTRIKE SAST Posture Ledger, Code-to-Runtime Sensor Mesh &amp; CLI Runner
              </h1>

              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                Unified static-to-runtime security posture across your repositories, CI/CD release gates, and execution
                sandboxes. Every metric distinguishes{" "}
                <strong style={{ color: "var(--foreground)" }}>Static AST/Dataflow Detection</strong> from{" "}
                <strong style={{ color: "var(--foreground)" }}>Verified Runtime Proof</strong> under the PTES &amp; NIST
                SP 800-115 6-stage validation contract.
              </p>

              {activeScanRepo && (
                <div
                  className="inline-flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-xl text-xs"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" style={{ color: "var(--emerald)" }} />
                  <span>
                    Synced with Active Workspace Scan: <strong>{activeScanRepo}</strong>
                    {activeScanCount !== null ? ` (${activeScanCount} findings indexed)` : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Right Editorial Command Card */}
            <div
              className="lg:col-span-5 rounded-xl p-5 space-y-3.5"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="desk-kicker">NOCTIS AI &amp; SAST DESK DISPATCH</span>
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold"
                  style={{ color: "var(--emerald)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: "var(--emerald)" }}
                  />
                  LIVE SYNC ACTIVE
                </span>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                Query <strong>Ask Noctis</strong> right inside this workspace to audit open SAST findings (`16.8K`),
                reachable SCA CVEs (`6.4K`), active sink triggers (`213`), or generate `xtrike-sast-cli` runner configs.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    openAskNoctisPopup(
                      "Audit XTRIKE SAST Posture KPIs (16.8K findings, 6.4K reachable CVEs, 213 sink triggers) and xtrike-sast-cli v4.2.0 setup"
                    )
                  }
                  className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-opacity hover:opacity-90"
                  style={{
                    background: "var(--accent)",
                    color: "#fbf8f3",
                    border: "1px solid var(--accent)",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Noctis: Audit SAST Posture</span>
                </button>

                <Link
                  href="/scan"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: "var(--surface)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                  }}
                >
                  <Code2 className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  <span>Scan Workspace</span>
                </Link>

                <Link
                  href="/validation-engine"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: "var(--surface)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                  }}
                >
                  <Cpu className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  <span>6-Stage Proof Engine</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Section Filter Bar */}
          <div
            className="mt-6 pt-5 flex flex-wrap items-center gap-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {[
              { id: "all", label: "Complete SAST Posture Desk (All 4 Ledgers)" },
              { id: "posture", label: "1. SAST & Reachable CVE Ledger" },
              { id: "sensors", label: "2. Code-to-Runtime Sink Sensors" },
              { id: "mesh", label: "3. Repository & Service Mesh (710 Nodes)" },
              { id: "cli", label: "4. XTRIKE SAST CLI & Runner (v4.2.0)" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  style={{
                    background: active ? "var(--accent)" : "var(--surface-2)",
                    color: active ? "#fbf8f3" : "var(--foreground-muted)",
                    border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            LEDGER 1 — SAST & REACHABLE CVE POSTURE LEDGER
           ===================================================================== */}
        {(activeTab === "all" || activeTab === "posture") && (
          <section
            className="rounded-2xl p-6 sm:p-8 space-y-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="desk-kicker">LEDGER 01 &middot; STATIC &amp; SCA POSTURE</div>
                <h2 className="text-xl sm:text-2xl font-bold font-editorial">
                  SAST Finding Inventory, Canonical Proof Distribution &amp; Reachable CVEs
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Aggregated across 4 XTRIKE AST engines (`XQL`, `DeepFlow`, `StructSCA`, `AST-Query`) with strict
                  separation between static candidates and verified dataflow/runtime proof.
                </p>
              </div>
              <button
                onClick={() =>
                  openAskNoctisPopup(
                    "Explain the XTRIKE SAST Posture breakdown: 16.8K Open SAST Findings, 6.4K Reachable SCA CVEs, and 1.3K Verified AST Fixes"
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid var(--border)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Noctis: Inspect Posture Ledger</span>
              </button>
            </div>

            {/* Top 3 KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CYBER_VULN_KPI_SUMMARY.map((kpi) => (
                <div
                  key={kpi.id}
                  className="rounded-xl p-5 flex flex-col justify-between"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                      {kpi.label}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{
                        background: "var(--surface)",
                        color: kpi.accentColor,
                        border: "1px solid var(--border)",
                      }}
                    >
                      {kpi.deltaDirection === "up" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {kpi.delta}
                    </span>
                  </div>

                  <div className="my-3 flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-bold font-editorial" style={{ color: kpi.accentColor }}>
                      {kpi.value}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      {kpi.deltaContext}
                    </span>
                  </div>

                  <div
                    className="pt-2.5 text-[11px] font-mono flex items-center justify-between"
                    style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--foreground-muted)" }}
                  >
                    <span>{kpi.subLabel}</span>
                    <span>VERIFIED</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 3-Column Breakdown: Proof State Donut | Monitored Repositories | 9-Week Velocity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Column 1: Canonical Proof State & Severity Distribution */}
              <div
                className="lg:col-span-4 rounded-xl p-5 space-y-4"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                      Findings by Severity &amp; Proof State
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--subtle)" }}>
                      5 Canonical XTRIKE Validation States
                    </div>
                  </div>
                  <span className="text-sm font-bold font-editorial">16.1K Active</span>
                </div>

                {/* Editorial Segmented Bar + Legend */}
                <div className="h-3.5 w-full rounded-full overflow-hidden flex" style={{ background: "var(--surface-3)" }}>
                  {OPEN_RISK_INSTANCES.map((slice) => (
                    <div
                      key={slice.severity}
                      style={{
                        width: `${slice.percentage}%`,
                        background: slice.color,
                      }}
                      title={`${slice.severity}: ${slice.countLabel} (${slice.proofState})`}
                    />
                  ))}
                </div>

                <div className="space-y-2.5 pt-1">
                  {OPEN_RISK_INSTANCES.map((slice) => (
                    <div
                      key={slice.severity}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg"
                      style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ background: slice.color }}
                        />
                        <div>
                          <div className="font-bold" style={{ color: "var(--foreground)" }}>
                            {slice.severity}
                          </div>
                          <div className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>
                            {slice.proofState}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold font-mono" style={{ color: slice.color }}>
                          {slice.countLabel}
                        </div>
                        <div className="text-[10px]" style={{ color: "var(--subtle)" }}>
                          {slice.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Findings by Application Tier & Repository */}
              <div
                className="lg:col-span-4 rounded-xl p-5 space-y-3.5"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    Findings by Repository &amp; Service Tier
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--subtle)" }}>
                    Dominant CWE &amp; AST sink concentration per codebase
                  </div>
                </div>

                <div className="space-y-2.5">
                  {OPEN_DEPLOYMENT_INSTANCES.map((dep) => {
                    const widthPct = Math.max(10, Math.round((dep.count / 3500) * 100));
                    return (
                      <div key={dep.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                            {dep.name}
                          </span>
                          <span className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>
                            <strong style={{ color: dep.color }}>{dep.countLabel}</strong> &middot; {dep.primaryCwe}
                          </span>
                        </div>
                        <div
                          className="h-2 w-full rounded-full overflow-hidden"
                          style={{ background: "var(--surface-3)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${widthPct}%`, background: dep.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 3: 9-Week Discovery vs. Verified AST Fix Trend */}
              <div
                className="lg:col-span-4 rounded-xl p-5 flex flex-col justify-between space-y-4"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    SAST Discovery vs. Verified AST Fix Velocity
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--subtle)" }}>
                    9-Week trajectory across Open SAST, Reachable CVEs &amp; Retested Diffs
                  </div>
                </div>

                <svg viewBox="0 0 320 170" className="w-full h-44 overflow-visible">
                  {[0, 40, 80, 120, 150].map((y) => (
                    <line
                      key={y}
                      x1={24}
                      y1={y + 10}
                      x2={308}
                      y2={y + 10}
                      stroke="#ded5c5"
                      strokeDasharray="3 3"
                    />
                  ))}
                  {/* Open SAST Findings line (#9e2a2b) */}
                  <polyline
                    fill="none"
                    stroke="#9e2a2b"
                    strokeWidth="2.5"
                    points={VULNERABILITY_TRENDS_TIMELINE.map((pt, i) => {
                      const x = 28 + i * 34;
                      const y = 150 - (pt.openVulnerabilities / 18000) * 130;
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                  {/* Reachable CVEs line (#8b4528) */}
                  <polyline
                    fill="none"
                    stroke="#8b4528"
                    strokeWidth="2.2"
                    points={VULNERABILITY_TRENDS_TIMELINE.map((pt, i) => {
                      const x = 28 + i * 34;
                      const y = 150 - (pt.openCves / 18000) * 130;
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                  {/* Verified Remediations line (#2d6a4f) */}
                  <polyline
                    fill="none"
                    stroke="#2d6a4f"
                    strokeWidth="2.5"
                    points={VULNERABILITY_TRENDS_TIMELINE.map((pt, i) => {
                      const x = 28 + i * 34;
                      const y = 150 - (pt.verifiedRemediations / 3000) * 90;
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                  {VULNERABILITY_TRENDS_TIMELINE.map((pt, i) => {
                    const x = 28 + i * 34;
                    return (
                      <text key={pt.date} x={x} y={166} textAnchor="middle" fontSize="9" fill="#5c5349">
                        {pt.date}
                      </text>
                    );
                  })}
                </svg>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: "#9e2a2b" }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#9e2a2b" }} />
                    SAST Findings (16.8K)
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: "#8b4528" }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#8b4528" }} />
                    Reachable CVEs (6.4K)
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: "#2d6a4f" }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#2d6a4f" }} />
                    Verified Fixes (1.3K)
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            LEDGER 2 — CODE-TO-RUNTIME SINK SENSORS & EXPLOIT PREVENTION
           ===================================================================== */}
        {(activeTab === "all" || activeTab === "sensors") && (
          <section
            className="rounded-2xl p-6 sm:p-8 space-y-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="desk-kicker">LEDGER 02 &middot; CODE-TO-RUNTIME SINK SENSORS</div>
                <h2 className="text-xl sm:text-2xl font-bold font-editorial">
                  Runtime Sink Triggers, Sanitizer Gate Blocks &amp; Build Runner Coverage
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Correlates static AST taint paths (`PLG-001`–`PLG-401`) with live sandbox probes and runtime guard
                  interceptions across `1,765` build runners and microservice nodes.
                </p>
              </div>
              <button
                onClick={() =>
                  openAskNoctisPopup(
                    "Analyze our Code-to-Runtime Sink Sensor KPIs: 213 Active Sink Triggers, 32 Exploit Probes Halted, 73 AST Diffs Verified, and 84/100 Release Gate Score"
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid var(--border)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Noctis: Audit Sink Sensors</span>
              </button>
            </div>

            {/* 6 Compact XTRIKE Sensor KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {ANTIVIRUS_PERFORMANCE_KPIS.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl p-4 flex flex-col justify-between"
                  style={{ background: "var(--background)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold" style={{ color: "var(--muted)" }}>
                      {card.title}
                    </span>
                  </div>

                  <div className="my-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-editorial" style={{ color: card.color }}>
                      {card.value}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: "var(--surface)",
                        color: card.color,
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {card.delta}
                    </span>
                  </div>

                  <div
                    className="pt-2 text-[10px] font-mono"
                    style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--subtle)" }}
                  >
                    {card.ruleRef}
                  </div>
                </div>
              ))}
            </div>

            {/* Runner Environment Distribution + Live Code-to-Runtime Interception Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Protected Runners & Runtime Nodes */}
              <div
                className="lg:col-span-5 rounded-xl p-5 space-y-3.5"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                      Instrumented Build &amp; Runtime Nodes
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--subtle)" }}>
                      Active XTRIKE AST &amp; DFG sensor coverage by platform
                    </div>
                  </div>
                  <span className="text-base font-bold font-editorial">{totalMonitoredNodes.toLocaleString()} Nodes</span>
                </div>

                <div className="space-y-2.5">
                  {MONITORED_HOSTS_BY_OS.map((item) => {
                    const pct = Math.round((item.hosts / 500) * 100);
                    return (
                      <div key={item.os} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium" style={{ color: "var(--foreground)" }}>
                            {item.os}
                          </span>
                          <span className="font-mono font-bold" style={{ color: item.color }}>
                            {item.hosts}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Code-to-Runtime Sink Interceptions */}
              <div
                className="lg:col-span-7 rounded-xl p-5 space-y-3.5"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                      Recent SAST Sink &amp; Release-Gate Interceptions
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--subtle)" }}>
                      Click any finding event to inspect its AST rule and remediation diff in Ask Noctis
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>
                    401 PLUGINS ACTIVE
                  </span>
                </div>

                <div className="space-y-2">
                  {MOST_RECENT_DETECTIONS.map((det) => (
                    <div
                      key={det.id}
                      onClick={() =>
                        openAskNoctisPopup(
                          `Inspect ${det.pluginId} (${det.cwe}) triggered at ${det.host}: "${det.signature}" and show language-verified remediation`
                        )
                      }
                      className="p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 cursor-pointer transition-all hover:opacity-95"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                            style={{
                              background:
                                det.severity === "Critical"
                                  ? "rgba(158, 42, 43, 0.12)"
                                  : det.severity === "High"
                                  ? "rgba(139, 69, 40, 0.12)"
                                  : "rgba(153, 107, 31, 0.12)",
                              color:
                                det.severity === "Critical"
                                  ? "var(--critical)"
                                  : det.severity === "High"
                                  ? "var(--accent)"
                                  : "var(--amber)",
                            }}
                          >
                            {det.pluginId} &middot; {det.cwe}
                          </span>
                          <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                            {det.signature}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                          Target: <strong>{det.host}</strong> ({det.os}) &middot; {det.timestamp}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                          style={{
                            background: "var(--surface-2)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {det.action}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            LEDGER 3 — XTRIKE REPOSITORY & SERVICE MESH TOPOLOGY (710 NODES)
           ===================================================================== */}
        {(activeTab === "all" || activeTab === "mesh") && (
          <section
            className="rounded-2xl p-6 sm:p-8 space-y-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="desk-kicker">LEDGER 03 &middot; REPOSITORY &amp; SERVICE MESH</div>
                <h2 className="text-xl sm:text-2xl font-bold font-editorial">
                  Monitored Repository Mesh ({XTRIKE_FLEET_OVERVIEW.totalHosts} Nodes) &amp; Policy Gate Telemetry (
                  {XTRIKE_FLEET_OVERVIEW.totalServices.toLocaleString()} Gates)
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Interactive repository &amp; microservice topology mapped to XTRIKE SAST release gates and canonical
                  proof states.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(["ALL", "CRIT", "WARN", "OK"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setMeshFilter(st)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                    style={{
                      background: meshFilter === st ? "var(--accent)" : "var(--background)",
                      color: meshFilter === st ? "#fbf8f3" : "var(--foreground-muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {st === "ALL" ? "All Nodes (72)" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Mesh Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="text-[11px] font-bold uppercase" style={{ color: "var(--muted)" }}>
                  Monitored Repositories &amp; Runners
                </div>
                <div className="text-2xl font-bold font-editorial mt-1" style={{ color: "var(--foreground)" }}>
                  {XTRIKE_FLEET_OVERVIEW.totalHosts}{" "}
                  <span className="text-xs font-normal" style={{ color: "var(--emerald)" }}>
                    ({XTRIKE_FLEET_OVERVIEW.hostsUp} Online)
                  </span>
                </div>
              </div>

              <div
                className="rounded-xl p-4"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="text-[11px] font-bold uppercase" style={{ color: "var(--muted)" }}>
                  Passing AST &amp; CWE Policy Gates
                </div>
                <div className="text-2xl font-bold font-editorial mt-1" style={{ color: "var(--emerald)" }}>
                  {XTRIKE_FLEET_OVERVIEW.servicesOk.toLocaleString()}
                </div>
              </div>

              <div
                className="rounded-xl p-4"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="text-[11px] font-bold uppercase" style={{ color: "var(--muted)" }}>
                  Release-Blocking SAST Gates
                </div>
                <div className="text-2xl font-bold font-editorial mt-1" style={{ color: "var(--critical)" }}>
                  {XTRIKE_FLEET_OVERVIEW.servicesCrit}{" "}
                  <span className="text-xs font-normal" style={{ color: "var(--amber)" }}>
                    (+{XTRIKE_FLEET_OVERVIEW.servicesWarn} Warn)
                  </span>
                </div>
              </div>

              <div
                className="rounded-xl p-4"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="text-[11px] font-bold uppercase" style={{ color: "var(--muted)" }}>
                  Live Taint Trace Events (24h)
                </div>
                <div className="text-2xl font-bold font-editorial mt-1" style={{ color: "var(--accent)" }}>
                  {XTRIKE_FLEET_OVERVIEW.totalEvents.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Interactive Repository Node Grid + Selected Node Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div
                className="lg:col-span-7 rounded-xl p-5 space-y-4"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    Interactive Repository &amp; Microservice Node Matrix
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--subtle)" }}>
                    Select any cell to inspect SAST gates
                  </span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-2">
                  {filteredMeshNodes.map((cell) => {
                    const isSelected = selectedNode.id === cell.id;
                    const cellBg =
                      cell.state === "CRIT"
                        ? "#9e2a2b"
                        : cell.state === "WARN"
                        ? "#996b1f"
                        : cell.state === "UNKNOWN"
                        ? "#8b4528"
                        : "#2d6a4f";
                    return (
                      <button
                        key={cell.id}
                        onClick={() => setSelectedNode(cell)}
                        title={`${cell.hostname} (${cell.state})`}
                        className="h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold cursor-pointer transition-transform hover:scale-105"
                        style={{
                          background: cellBg,
                          color: "#fbf8f3",
                          outline: isSelected ? "2px solid #1f1b18" : "none",
                          outlineOffset: "2px",
                        }}
                      >
                        <span>{cell.id.replace("NODE-", "#")}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Node Dossier Bar */}
                <div
                  className="p-4 rounded-xl flex flex-wrap items-center justify-between gap-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold" style={{ color: "var(--accent)" }}>
                        {selectedNode.id}
                      </span>
                      <span className="text-sm font-bold">{selectedNode.hostname}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {selectedNode.language} &middot; {selectedNode.cluster}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      Policy Gates: <strong>{selectedNode.servicesCount}</strong> &middot; Open SAST Findings:{" "}
                      <strong style={{ color: selectedNode.openFindings > 0 ? "var(--critical)" : "var(--emerald)" }}>
                        {selectedNode.openFindings}
                      </strong>{" "}
                      &middot; AST Scan Time: <strong>{selectedNode.latencyMs}ms</strong>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      openAskNoctisPopup(
                        `Audit repository node ${selectedNode.hostname} (${selectedNode.language}, ${selectedNode.cluster}) with ${selectedNode.openFindings} open SAST findings`
                      )
                    }
                    className="px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                    style={{
                      background: "var(--accent)",
                      color: "#fbf8f3",
                    }}
                  >
                    Inspect Node in Noctis
                  </button>
                </div>
              </div>

              {/* Right Column: Top Release-Gate Violators */}
              <div
                className="lg:col-span-5 rounded-xl p-5 space-y-3.5"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    Priority Release-Gate Violators (7-Day SAST Volume)
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--subtle)" }}>
                    Services with unparameterized sinks or unverified dynamic compilation
                  </div>
                </div>

                <div className="space-y-3">
                  {XTRIKE_TOP_ALERTERS.map((bar) => {
                    const critW = Math.round((bar.critCount / 120) * 100);
                    const warnW = Math.round((bar.warnCount / 120) * 100);
                    return (
                      <div key={bar.host} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold">{bar.host}</span>
                          <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                            {bar.primaryCwe} &middot; <strong>{bar.totalAlerts}</strong> gates
                          </span>
                        </div>
                        <div
                          className="h-2.5 w-full rounded-full overflow-hidden flex"
                          style={{ background: "var(--surface-3)" }}
                        >
                          <div style={{ width: `${critW}%`, background: "#9e2a2b" }} title={`Critical: ${bar.critCount}`} />
                          <div style={{ width: `${warnW}%`, background: "#996b1f" }} title={`Warning: ${bar.warnCount}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Release-Gate Violations Table */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--background)", border: "1px solid var(--border)" }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}
              >
                <span className="text-xs font-bold uppercase tracking-wider">
                  Active SAST Release-Gate Findings Requiring Remediation or Proof Review
                </span>
                <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                  PTES / NIST 800-115 GATED
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {XTRIKE_HOST_PROBLEMS.map((row) => (
                  <div
                    key={`${row.host}-${row.service}`}
                    className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 max-w-3xl">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                          style={{
                            background: row.state === "CRIT" ? "#9e2a2b" : "#996b1f",
                            color: "#fbf8f3",
                          }}
                        >
                          {row.state} &middot; {row.proofState}
                        </span>
                        <span className="font-mono font-bold">{row.host}</span>
                        <span style={{ color: "var(--muted)" }}>&mdash; {row.service}</span>
                      </div>
                      <div className="font-mono text-[11px]" style={{ color: "var(--foreground-muted)" }}>
                        {row.pluginOutput}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        openAskNoctisPopup(
                          `Inspect ${row.host} (${row.service}, ${row.cwe}, Proof State: ${row.proofState}) and generate the language-verified remediation diff`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
                      style={{
                        background: "var(--surface)",
                        color: "var(--accent)",
                        border: "1px solid var(--accent)",
                      }}
                    >
                      Generate Fix in Noctis
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            LEDGER 4 — XTRIKE SAST CLI & PROOF SANDBOX RUNNER (v4.2.0)
           ===================================================================== */}
        {(activeTab === "all" || activeTab === "cli") && (
          <section
            className="rounded-2xl p-6 sm:p-8 space-y-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="desk-kicker">LEDGER 04 &middot; XTRIKE SAST CLI &amp; CI/CD RUNNER</div>
                <h2 className="text-xl sm:text-2xl font-bold font-editorial">
                  Deploy XTRIKE SAST CLI (`v{XTRIKE_CLI_RUNTIME_SPEC.version}`) &amp; Local PTES Proof Sandbox
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Install the standalone XTRIKE SAST binary on Linux, macOS, or CI/CD containers to execute all 4 AST
                  engines (`XQL`, `DeepFlow`, `StructSCA`, `AST-Query`) and stream SARIF v2.1.0 directly into Noctis.
                </p>
              </div>
              <button
                onClick={runCliProvisionSimulation}
                disabled={cliRunning}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
                style={{
                  background: "var(--accent)",
                  color: "#fbf8f3",
                }}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{cliRunning ? "Initializing 4 AST Engines..." : "Run CLI Sandbox Verification"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Collapsible OS & CI/CD Package Accordion */}
              <div className="lg:col-span-7 space-y-3">
                {XTRIKE_DISTRO_ACCORDION_GROUPS.map((group) => {
                  const isOpen = !!openDistros[group.family];
                  return (
                    <div
                      key={group.family}
                      className="rounded-xl overflow-hidden"
                      style={{ background: "var(--background)", border: "1px solid var(--border)" }}
                    >
                      <button
                        onClick={() =>
                          setOpenDistros((prev) => ({
                            ...prev,
                            [group.family]: !prev[group.family],
                          }))
                        }
                        className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer"
                        style={{ background: "var(--surface-2)" }}
                      >
                        <div className="flex items-center gap-2.5">
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4" style={{ color: "var(--accent)" }} />
                          ) : (
                            <ChevronRight className="w-4 h-4" style={{ color: "var(--muted)" }} />
                          )}
                          <span className="text-sm font-bold">{group.family}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                            style={{
                              background: "var(--surface)",
                              color: "var(--accent)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {group.badge}
                          </span>
                        </div>
                        <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                          {group.packages.length} {group.packages.length === 1 ? "bundle" : "bundles"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-4 space-y-3">
                          <p className="text-xs" style={{ color: "var(--muted)" }}>
                            {group.description}
                          </p>
                          {group.packages.map((pkg) => (
                            <div
                              key={pkg.id}
                              className="p-3.5 rounded-xl space-y-2.5"
                              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <span className="text-xs font-bold">{pkg.distroVersion}</span>
                                  <span className="text-[11px] font-mono ml-2" style={{ color: "var(--muted)" }}>
                                    ({pkg.edition} &middot; {pkg.architecture})
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleCopy(pkg.id, `${pkg.wgetCommand} && ${pkg.installCommand}`)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
                                    style={{
                                      background: "var(--surface-2)",
                                      border: "1px solid var(--border)",
                                    }}
                                  >
                                    {copiedId === pkg.id ? (
                                      <Check className="w-3 h-3" style={{ color: "var(--emerald)" }} />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                    <span>{copiedId === pkg.id ? "Copied" : "Copy CLI"}</span>
                                  </button>

                                  <button
                                    onClick={() =>
                                      setVisibleHashId((prev) => (prev === pkg.id ? null : pkg.id))
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
                                    style={{
                                      background: "var(--surface-2)",
                                      border: "1px solid var(--border)",
                                    }}
                                  >
                                    <Hash className="w-3 h-3" />
                                    <span>SHA-256</span>
                                  </button>

                                  <a
                                    href={pkg.downloadUrl}
                                    download={pkg.packageFilename}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold"
                                    style={{
                                      background: "var(--accent)",
                                      color: "#fbf8f3",
                                      textDecoration: "none",
                                    }}
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download</span>
                                  </a>
                                </div>
                              </div>

                              <div
                                className="p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1"
                                style={{
                                  background: "#1c1815",
                                  color: "#f3eee4",
                                }}
                              >
                                <div>$ {pkg.wgetCommand}</div>
                                <div style={{ color: "#e6b89c" }}>$ {pkg.installCommand}</div>
                              </div>

                              {visibleHashId === pkg.id && (
                                <div
                                  className="px-3 py-2 rounded-lg text-[11px] font-mono break-all"
                                  style={{
                                    background: "var(--surface-2)",
                                    border: "1px solid var(--border)",
                                  }}
                                >
                                  <strong>SHA-256 Checksum:</strong> {pkg.sha256}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: XTRIKE SAST CLI & Engine Daemon Terminal */}
              <div className="lg:col-span-5">
                <div
                  className="rounded-xl overflow-hidden h-full flex flex-col justify-between"
                  style={{
                    background: "#191512",
                    color: "#f3eee4",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div
                      className="px-4 py-3 flex items-center justify-between text-xs font-mono"
                      style={{ background: "#231e1a", borderBottom: "1px solid #332b25" }}
                    >
                      <span className="font-bold" style={{ color: "#e6b89c" }}>
                        xtrike-sast-cli v{XTRIKE_CLI_RUNTIME_SPEC.version} &middot; Engine Console
                      </span>
                      <span style={{ color: "#68b684" }}>PROFILE: {XTRIKE_CLI_RUNTIME_SPEC.profileName}</span>
                    </div>

                    <div className="p-4 font-mono text-xs space-y-3 leading-relaxed">
                      <div>
                        <div style={{ color: "#a89f91" }}># 1. Verify XTRIKE SAST Hybrid AST/DFG Binary</div>
                        <div>$ xtrike-sast --version</div>
                        <div style={{ color: "#68b684" }}>
                          XTRIKE SAST Hybrid Engine v{XTRIKE_CLI_RUNTIME_SPEC.version} (401 CWE Plugins · SARIF v2.1.0)
                        </div>
                      </div>

                      {cliStep >= 2 && (
                        <div>
                          <div style={{ color: "#a89f91" }}>
                            # 2. Initialize PTES / NIST SP 800-115 Validation Profile
                          </div>
                          <div>$ xtrike-sast init --profile {XTRIKE_CLI_RUNTIME_SPEC.profileName}</div>
                          <div style={{ color: "#e6b89c" }}>
                            [OK] Locked 5 Canonical Proof States &amp; language-strict rule dispatch
                          </div>
                        </div>
                      )}

                      {cliStep >= 3 && (
                        <div className="space-y-1">
                          <div style={{ color: "#a89f91" }}>
                            # 3. Start XTRIKE SAST Daemons &amp; Noctis AI Telemetry Sync
                          </div>
                          <div>$ xtrike-sast daemon start --engines xql,deepflow,structsca,ast-query</div>
                          <div className="pt-1 space-y-1">
                            {XTRIKE_CLI_RUNTIME_SPEC.daemons.map((d) => (
                              <div key={d.name} className="flex items-center justify-between text-[11px]">
                                <span>Starting {d.name}...</span>
                                <span style={{ color: "#68b684" }}>[{d.status}]</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="p-4 text-[11px] font-mono flex items-center justify-between"
                    style={{ background: "#231e1a", borderTop: "1px solid #332b25", color: "#cbbca6" }}
                  >
                    <span>Noctis Bridge: /api/noctis</span>
                    <span>4 Engines · 401 Rules Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
