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
  BookOpen,
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
  XTRIKE_WORKFLOW_INTEGRATIONS,
  XTRIKE_PIPELINE_HOURGLASS_STAGES,
  XTRIKE_HOURGLASS_TOP_PILLARS,
  XTRIKE_EXTRACTION_COLLECTORS,
  XTRIKE_HYBRID_FLEET_TELEMETRY,
  XTRIKE_AI_EXPLAIN_DOSSIERS,
  XTRIKE_SYNTHETIC_PLANS,
  XTRIKE_SYNTHETIC_HOST_NODES,
  XTRIKE_SYNTHETIC_RUNTIME_SERIES,
  XTRIKE_SYNTHETIC_UX_STEPS,
  XTRIKE_LEARN_MEGA_HUB,
  XTRIKE_CYBER_MONITOR_MENU_GROUPS,
  XTRIKE_SERVER_DEVOPS_CAPABILITIES,
  XTRIKE_NETWORK_MONITORING_DOMAINS,
  XTRIKE_DATABASE_MONITORING_CAPABILITIES,
  type HoneycombHostCell,
  type HourglassStageItem,
  type AiExplainProblemDossier,
  type CyberMonitorInspectableDossier,
} from "@/lib/cyber-monitoring-data";
import { openAskNoctisPopup } from "@/components/DeveloperAssistAgent";
import { loadActiveScanSession } from "@/lib/live-sast-scanner";

export default function CyberMonitoringPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "platform" | "fleet" | "ux" | "domains" | "posture" | "sensors" | "mesh" | "cli"
  >("all");
  const [selectedHourglassStage, setSelectedHourglassStage] = useState<HourglassStageItem>(
    XTRIKE_PIPELINE_HOURGLASS_STAGES[3] // Default to "Ingest" as in screenshot
  );
  const [selectedAiDossier, setSelectedAiDossier] = useState<AiExplainProblemDossier>(
    XTRIKE_AI_EXPLAIN_DOSSIERS[0]
  );
  const [showLearnMegaMenu, setShowLearnMegaMenu] = useState<boolean>(true);
  const [activeTopMenu, setActiveTopMenu] = useState<
    "product" | "solutions" | "pricing" | "learn" | "community" | null
  >("learn");
  const [selectedMenuDetail, setSelectedMenuDetail] = useState<CyberMonitorInspectableDossier>(
    XTRIKE_CYBER_MONITOR_MENU_GROUPS[3].items[0]
  );
  const [autoNoctisOnMenuClick, setAutoNoctisOnMenuClick] = useState<boolean>(true);
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
  const [allAiDossiers, setAllAiDossiers] = useState<AiExplainProblemDossier[]>(XTRIKE_AI_EXPLAIN_DOSSIERS);

  useEffect(() => {
    const syncWithScanSession = () => {
      const session = loadActiveScanSession();
      if (session && session.repoUrl && Array.isArray(session.sastFindings) && session.sastFindings.length > 0) {
        setActiveScanRepo(session.repoUrl);
        setActiveScanCount(session.sastFindings.length);

        const primaryScanFindings = session.sastFindings
          .filter(
            (f) =>
              f.findingOrigin !== "ARCHITECTURAL_CANDIDATE_HYPOTHESIS" &&
              !String(f.id).startsWith("RE-ENUM-")
          )
          .slice(0, 4);

        const dynamicDossiers: AiExplainProblemDossier[] = primaryScanFindings.map((f) => {
          const isCrit = f.severity === "Critical" || f.severity === "High";
          const shortFile = (f.file || "source").split("/").pop() || f.file;
          return {
            id: `live-scan-${f.id}`,
            host: session.repoUrl.replace(/^https?:\/\/github\.com\//i, ""),
            hostStatus: "UP",
            service: `${f.id} · ${f.cwe} (${shortFile}:${f.line})`,
            serviceStatus: isCrit ? "CRIT" : "WARN",
            pluginOutput: `${isCrit ? "CRIT" : "WARN"} - ${f.proofState || "DATAFLOW_CONFIRMED"}: ${f.title} at ${shortFile}:${f.line}`,
            since: "Live Scan",
            cweOrCategory: `${f.cwe} · ${f.language || session.language}`,
            dataQuality: "Verified",
            aiSummary:
              f.executiveSummary ||
              `Live workspace scan of ${session.repoUrl} identified ${f.title} (${f.cwe}) at ${f.file}:${f.line}. Canonical proof state is ${f.proofState || "DATAFLOW_CONFIRMED"} with CVSS v3.1 base score ${f.cvss}. Apply the language-matched ${f.language || session.language} remediation patch before promoting the build.`,
            metrics: [
              {
                metric: "Canonical Proof State",
                value: `${f.proofState || "DATAFLOW_CONFIRMED"}`,
                status: isCrit ? "CRIT" : "WARN",
              },
              {
                metric: "CVSS v3.1 Base Score",
                value: `${f.cvss} ${f.severity} (${f.cvssVector || "Verified"})`,
                status: isCrit ? "CRIT" : "WARN",
              },
              {
                metric: "Source -> Sink Location",
                value: `${shortFile}:${f.line} (${f.language || session.language})`,
                status: "OK",
              },
              {
                metric: "Context-Exact Remediation",
                value: f.remediation?.[0]?.platform
                  ? `${f.remediation[0].platform} Patch Ready`
                  : "AST Patch Ready",
                status: "OK",
              },
            ],
            serviceContext: `The service: Live XTRIKE SAST Workspace Scan (${session.repoUrl} @ ${(session.commitSha || "HEAD").slice(0, 8)}) synchronized with the Explain with XTRIKE AI problem drawer.`,
          };
        });

        const merged = [...dynamicDossiers, ...XTRIKE_AI_EXPLAIN_DOSSIERS];
        setAllAiDossiers(merged);
        if (dynamicDossiers.length > 0) {
          setSelectedAiDossier(dynamicDossiers[0]);
        }
      } else {
        setActiveScanRepo(null);
        setActiveScanCount(null);
        setAllAiDossiers(XTRIKE_AI_EXPLAIN_DOSSIERS);
      }
    };

    syncWithScanSession();
    window.addEventListener("xtrike-scan-updated", syncWithScanSession);
    window.addEventListener("xtrike-scan-cleared", syncWithScanSession);
    return () => {
      window.removeEventListener("xtrike-scan-updated", syncWithScanSession);
      window.removeEventListener("xtrike-scan-cleared", syncWithScanSession);
    };
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

  const allMenuDossiers: CyberMonitorInspectableDossier[] = XTRIKE_CYBER_MONITOR_MENU_GROUPS.flatMap(
    (g) => g.items
  );

  const handleInspectCustomDossier = (
    dossier: CyberMonitorInspectableDossier,
    triggerNoctis = autoNoctisOnMenuClick
  ) => {
    setSelectedMenuDetail(dossier);
    if (triggerNoctis) {
      openAskNoctisPopup(
        `Inspect Cyber Monitor Dossier ${dossier.id}: ${dossier.title} (${dossier.badge}) — show all 4 technical details and CLI command`
      );
    }
    if (typeof document !== "undefined") {
      const el = document.getElementById("cyber-monitor-detail-inspector");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  const handleSelectMenuDossierById = (id: string, triggerNoctis = autoNoctisOnMenuClick) => {
    const found = allMenuDossiers.find((item) => item.id === id);
    if (found) {
      handleInspectCustomDossier(found, triggerNoctis);
    }
  };

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

          {/* =================================================================
              CLICKABLE CYBER MONITOR TOP NAVIGATION MENU BAR
              (Product ▾ | Solutions ▾ | Pricing ▾ | Learn ▾ | Community ▾)
             ================================================================= */}
          <div
            className="mt-6 pt-5 space-y-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div
              className="rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3"
              style={{
                background: "#191512",
                border: "1px solid #332b25",
                color: "#fbf8f3",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{
                    background: "var(--emerald)",
                    color: "#fbf8f3",
                  }}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wide" style={{ color: "#fbf8f3" }}>
                    XTRIKE CYBER MONITOR MENU
                  </div>
                  <div className="text-[10px]" style={{ color: "#b5aa9d" }}>
                    Click any menu category or item below to inspect its 4 live details
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {XTRIKE_CYBER_MONITOR_MENU_GROUPS.map((group) => {
                  const isOpen = activeTopMenu === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => {
                        if (group.id === "learn") {
                          setShowLearnMegaMenu(true);
                        }
                        setActiveTopMenu(group.id);
                        if (group.items.length > 0) {
                          setSelectedMenuDetail(group.items[0]);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                      style={{
                        background: isOpen ? "#8b4528" : "#231e1a",
                        color: isOpen ? "#fbf8f3" : "#e6ddd2",
                        border: isOpen ? "1px solid #e6b89c" : "1px solid #38302a",
                      }}
                    >
                      <span>{group.label}</span>
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px]"
                        style={{
                          background: isOpen ? "rgba(251, 248, 243, 0.2)" : "#191512",
                          color: isOpen ? "#fbf8f3" : "#d4a359",
                        }}
                      >
                        {group.items.length}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoNoctisOnMenuClick((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                  style={{
                    background: autoNoctisOnMenuClick ? "rgba(45, 106, 79, 0.25)" : "#231e1a",
                    color: autoNoctisOnMenuClick ? "#68b684" : "#b5aa9d",
                    border: autoNoctisOnMenuClick ? "1px solid #68b684" : "1px solid #38302a",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Noctis Answers on Click: {autoNoctisOnMenuClick ? "ON" : "OFF"}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("cli");
                    handleSelectMenuDossierById("learn-plugin-catalog");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                  style={{
                    background: "transparent",
                    color: "#e6b89c",
                    border: "1px solid #8b4528",
                  }}
                >
                  CLI &amp; Agents (v5.2.0)
                </button>
                <button
                  onClick={() =>
                    openAskNoctisPopup(
                      `Inspect Cyber Monitor Dossier ${selectedMenuDetail.id}: ${selectedMenuDetail.title} (${selectedMenuDetail.badge}) — show all 4 technical details and CLI command`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                  style={{
                    background: "#2d6a4f",
                    color: "#fbf8f3",
                    border: "1px solid #68b684",
                  }}
                >
                  Ask Noctis Now
                </button>
              </div>
            </div>

            {/* Active Menu Group Pill Strip (Clickable Items for Product, Solutions, Pricing, Learn, Community) */}
            {activeTopMenu && (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                {(() => {
                  const currentGroup =
                    XTRIKE_CYBER_MONITOR_MENU_GROUPS.find((g) => g.id === activeTopMenu) ??
                    XTRIKE_CYBER_MONITOR_MENU_GROUPS[0];
                  return (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: "var(--accent)",
                              color: "#fbf8f3",
                            }}
                          >
                            {currentGroup.label} Menu
                          </span>
                          <span className="text-xs font-semibold" style={{ color: "var(--foreground-muted)" }}>
                            {currentGroup.tagline || currentGroup.subtitle}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                          Click any item: updates 4 Details + Noctis AI answers
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {currentGroup.items.map((item) => {
                          const isSelected = selectedMenuDetail.id === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                handleInspectCustomDossier(item);
                              }}
                              className="text-left rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-between gap-2"
                              style={{
                                background: isSelected ? "#191512" : "var(--surface)",
                                color: isSelected ? "#fbf8f3" : "var(--foreground)",
                                border: isSelected
                                  ? "1.5px solid var(--accent)"
                                  : "1px solid var(--border)",
                                boxShadow: isSelected ? "0 6px 18px rgba(25, 21, 18, 0.14)" : "none",
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold leading-snug">{item.title}</span>
                                <span
                                  className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
                                  style={{
                                    background: isSelected ? "#8b4528" : "var(--surface-2)",
                                    color: isSelected ? "#fbf8f3" : "var(--emerald)",
                                  }}
                                >
                                  {item.badge}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span style={{ color: isSelected ? "#d4a359" : "var(--muted)" }}>
                                  {item.category}
                                </span>
                                <span
                                  className="font-bold underline"
                                  style={{ color: isSelected ? "#68b684" : "var(--accent)" }}
                                >
                                  {isSelected ? "Noctis Answered ✓" : "Click: 4 Details + Noctis →"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Section Filter Bar + Learn Mega-Hub Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "All Suites & Ledgers", dossierId: "menu-prod-platform" },
                  { id: "platform", label: "The XTRIKE Platform (Hourglass & Hexagon)", dossierId: "menu-prod-platform" },
                  { id: "fleet", label: "Hybrid Fleet & Explain with AI", dossierId: "menu-prod-ai" },
                  { id: "ux", label: "Synthetic UX Monitoring", dossierId: "menu-prod-ux" },
                  { id: "domains", label: "Server, Network & DB Suites", dossierId: "menu-sol-server" },
                  { id: "posture", label: "1. SAST & CVE Ledger", dossierId: "learn-user-guide" },
                  { id: "sensors", label: "2. Sink Sensors", dossierId: "learn-plugin-catalog" },
                  { id: "mesh", label: "3. 710-Node Mesh", dossierId: "menu-prod-fleet" },
                  { id: "cli", label: "4. XTRIKE CLI (v5.2.0)", dossierId: "learn-changelog" },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as typeof activeTab);
                        const match = allMenuDossiers.find((d) => d.id === tab.dossierId);
                        if (match) setSelectedMenuDetail(match);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
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

              <button
                onClick={() => setShowLearnMegaMenu((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                style={{
                  background: showLearnMegaMenu ? "var(--accent)" : "#191512",
                  color: "#fbf8f3",
                  border: "1px solid #332b25",
                }}
              >
                <span>Learn &amp; Docs Mega-Menu (12 Items)</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLearnMegaMenu ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* Interactive Learn & Documentation Mega-Menu (Customized from Screenshot 6 — Every Item Clickable) */}
          {showLearnMegaMenu && (
            <div
              className="mt-4 rounded-2xl p-6 shadow-xl"
              style={{
                background: "var(--surface)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2">
                  <span className="desk-kicker">INTERACTIVE LEARN &amp; DOCUMENTATION MEGA-MENU</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    Click any item to inspect its 4 details below
                  </span>
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--emerald)" }}>
                  Currently Inspecting: {selectedMenuDetail.title}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {XTRIKE_LEARN_MEGA_HUB.columns.map((col) => (
                  <div key={col.heading} className="space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div
                        className="text-sm font-bold pb-2"
                        style={{ borderBottom: "1px solid var(--border)", color: "var(--foreground)" }}
                      >
                        {col.heading}
                      </div>
                      <ul className="space-y-2">
                        {col.items.map((item) => {
                          const isSelected = selectedMenuDetail.id === item.id;
                          return (
                            <li key={item.label}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTopMenu("learn");
                                  handleSelectMenuDossierById(item.id);
                                }}
                                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all text-left"
                                style={{
                                  background: isSelected ? "#191512" : "var(--surface-2)",
                                  color: isSelected ? "#fbf8f3" : "var(--foreground)",
                                  border: isSelected
                                    ? "1px solid var(--accent)"
                                    : "1px solid transparent",
                                }}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{
                                      background: isSelected ? "#d4a359" : "var(--accent)",
                                    }}
                                  />
                                  <span>{item.label}</span>
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                                  style={{
                                    background: isSelected ? "#8b4528" : "var(--surface)",
                                    color: isSelected ? "#fbf8f3" : "var(--emerald)",
                                  }}
                                >
                                  {item.badge}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {col.ctaCard && (
                      <div
                        className="mt-4 pt-3 pl-3 pr-2 pb-2 rounded-r-xl"
                        style={{
                          borderLeft:
                            col.ctaCard.accent === "emerald"
                              ? "3px solid var(--emerald)"
                              : "3px solid var(--accent)",
                          background:
                            col.ctaCard.accent === "emerald"
                              ? "rgba(45, 106, 79, 0.08)"
                              : "var(--accent-soft)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (col.ctaCard?.id) {
                              handleSelectMenuDossierById(col.ctaCard.id);
                            }
                          }}
                          className="w-full text-left cursor-pointer space-y-1 p-1"
                        >
                          <div
                            className="text-xs font-bold flex items-center justify-between gap-1.5"
                            style={{
                              color: col.ctaCard.accent === "emerald" ? "var(--emerald)" : "var(--accent)",
                            }}
                          >
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{col.ctaCard.title}</span>
                            </span>
                            <span className="text-[10px] underline">Inspect 4 Details →</span>
                          </div>
                          <p className="text-[11px] leading-snug" style={{ color: "var(--muted)" }}>
                            {col.ctaCard.subtitle}
                          </p>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              4-PART CYBER MONITOR MENU ITEM DETAIL INSPECTOR
              Displays the 4 structured details for whichever menu item is clicked:
              1. Executive Summary & Operational Scope
              2. Architecture & Security Guard Verification
              3. Live Telemetry & Proof Metrics (4 KPIs)
              4. CLI Runner Command & Studio Actions
             ================================================================= */}
          <div
            id="cyber-monitor-detail-inspector"
            className="mt-5 rounded-2xl p-5 sm:p-6 transition-all"
            style={{
              background: "#191512",
              color: "#fbf8f3",
              border: "1.5px solid #8b4528",
              boxShadow: "0 12px 30px rgba(25, 21, 18, 0.16)",
            }}
          >
            {/* Header Bar */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5"
              style={{ borderBottom: "1px solid #332b25" }}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: "#8b4528", color: "#fbf8f3" }}
                  >
                    {selectedMenuDetail.category}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold"
                    style={{ background: "#231e1a", color: "#d4a359", border: "1px solid #38302a" }}
                  >
                    {selectedMenuDetail.badge}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      background:
                        selectedMenuDetail.status === "VERIFIED"
                          ? "rgba(45, 106, 79, 0.25)"
                          : selectedMenuDetail.status === "ACTIVE"
                          ? "rgba(212, 163, 89, 0.2)"
                          : "rgba(139, 69, 40, 0.25)",
                      color:
                        selectedMenuDetail.status === "VERIFIED"
                          ? "#68b684"
                          : selectedMenuDetail.status === "ACTIVE"
                          ? "#d4a359"
                          : "#e6b89c",
                      border: "1px solid #38302a",
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>STATUS: {selectedMenuDetail.status}</span>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-editorial" style={{ color: "#fbf8f3" }}>
                  {selectedMenuDetail.title} — 4-Part Technical Dossier
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(selectedMenuDetail.targetTab)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-opacity hover:opacity-90"
                  style={{
                    background: "#231e1a",
                    color: "#e6b89c",
                    border: "1px solid #8b4528",
                  }}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Focus Section: {selectedMenuDetail.targetTab.toUpperCase()}</span>
                </button>

                <Link
                  href={selectedMenuDetail.relatedRoute}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold"
                  style={{
                    background: "#8b4528",
                    color: "#fbf8f3",
                    textDecoration: "none",
                  }}
                >
                  <span>{selectedMenuDetail.relatedRouteLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 4 Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* DETAIL 1: Executive Summary & Operational Scope */}
              <div
                className="rounded-xl p-4 space-y-2.5 flex flex-col justify-between"
                style={{ background: "#231e1a", border: "1px solid #38302a" }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(139, 69, 40, 0.25)", color: "#e6b89c" }}
                    >
                      Detail 01 &middot; Overview
                    </span>
                    <BookOpen className="w-4 h-4" style={{ color: "#e6b89c" }} />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: "#fbf8f3" }}>
                    Executive Summary &amp; Scope
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#d6cdc2" }}>
                    {selectedMenuDetail.summary}
                  </p>
                </div>
                <div
                  className="pt-2.5 text-[11px] font-mono flex items-center justify-between"
                  style={{ borderTop: "1px solid #332b25", color: "#b5aa9d" }}
                >
                  <span>Dossier ID</span>
                  <span style={{ color: "#fbf8f3" }}>{selectedMenuDetail.id}</span>
                </div>
              </div>

              {/* DETAIL 2: Architecture & Security Guard Specification */}
              <div
                className="rounded-xl p-4 space-y-2.5 flex flex-col justify-between"
                style={{ background: "#231e1a", border: "1px solid #38302a" }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(212, 163, 89, 0.2)", color: "#d4a359" }}
                    >
                      Detail 02 &middot; Architecture
                    </span>
                    <Cpu className="w-4 h-4" style={{ color: "#d4a359" }} />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: "#fbf8f3" }}>
                    Architecture &amp; Guard Spec
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#d6cdc2" }}>
                    {selectedMenuDetail.architectureNotes}
                  </p>
                </div>
                <div
                  className="pt-2.5 text-[11px] font-mono flex items-center justify-between"
                  style={{ borderTop: "1px solid #332b25", color: "#b5aa9d" }}
                >
                  <span>Verification Engine</span>
                  <span style={{ color: "#d4a359" }}>PTES / NIST 800-115</span>
                </div>
              </div>

              {/* DETAIL 3: Live Telemetry & Proof Metrics (4 KPIs) */}
              <div
                className="rounded-xl p-4 space-y-2.5 flex flex-col justify-between"
                style={{ background: "#231e1a", border: "1px solid #38302a" }}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(45, 106, 79, 0.25)", color: "#68b684" }}
                    >
                      Detail 03 &middot; Live Metrics
                    </span>
                    <Activity className="w-4 h-4" style={{ color: "#68b684" }} />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: "#fbf8f3" }}>
                    4 Live Telemetry Indicators
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMenuDetail.liveMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-lg p-2"
                        style={{ background: "#191512", border: "1px solid #332b25" }}
                      >
                        <div className="text-[10px] truncate" style={{ color: "#b5aa9d" }}>
                          {metric.label}
                        </div>
                        <div className="text-xs font-bold font-mono mt-0.5" style={{ color: "#fbf8f3" }}>
                          {metric.value}
                        </div>
                        <div className="text-[10px] font-semibold" style={{ color: "#68b684" }}>
                          {metric.delta || metric.status || "VERIFIED"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="pt-2 text-[11px] font-mono flex items-center justify-between"
                  style={{ borderTop: "1px solid #332b25", color: "#b5aa9d" }}
                >
                  <span>Telemetry Stream</span>
                  <span style={{ color: "#68b684" }}>LIVE SYNC (15s)</span>
                </div>
              </div>

              {/* DETAIL 4: CLI Runner Command & Interactive Studio Actions */}
              <div
                className="rounded-xl p-4 space-y-2.5 flex flex-col justify-between"
                style={{ background: "#231e1a", border: "1px solid #38302a" }}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(139, 69, 40, 0.3)", color: "#e6b89c" }}
                    >
                      Detail 04 &middot; CLI &amp; Dispatch
                    </span>
                    <Terminal className="w-4 h-4" style={{ color: "#e6b89c" }} />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: "#fbf8f3" }}>
                    Executable CLI &amp; AI Action
                  </h3>
                  <div
                    className="rounded-lg p-2.5 font-mono text-[11px] break-all leading-relaxed"
                    style={{
                      background: "#14110f",
                      color: "#e6b89c",
                      border: "1px solid #332b25",
                    }}
                  >
                    $ {selectedMenuDetail.cliCommand}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(`dossier-cli-${selectedMenuDetail.id}`, selectedMenuDetail.cliCommand)
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                      style={{
                        background: "#191512",
                        color: "#fbf8f3",
                        border: "1px solid #38302a",
                      }}
                    >
                      {copiedId === `dossier-cli-${selectedMenuDetail.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5" style={{ color: "#68b684" }} />
                          <span>Copied CLI</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" style={{ color: "#d4a359" }} />
                          <span>Copy CLI</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openAskNoctisPopup(
                          `Inspect Cyber Monitor Dossier ${selectedMenuDetail.id}: ${selectedMenuDetail.title} (${selectedMenuDetail.badge}) — show all 4 technical details and CLI command`
                        )
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                      style={{
                        background: "#2d6a4f",
                        color: "#fbf8f3",
                        border: "1px solid #68b684",
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask Noctis</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Noctis AI Direct Answer Banner inside the 4-Part Inspector */}
            <div
              className="mt-4 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              style={{
                background: "rgba(45, 106, 79, 0.14)",
                border: "1px solid #408a67",
              }}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: "#2d6a4f", color: "#fbf8f3" }}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Noctis AI Live Answer &middot; Synced with Menu Selection</span>
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: "#68b684" }}>
                    [{selectedMenuDetail.id}] &middot; {selectedMenuDetail.badge}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#f3eee4" }}>
                  <strong>Noctis Verdict on {selectedMenuDetail.title}:</strong> {selectedMenuDetail.summary}{" "}
                  <span style={{ color: "#d6cdc2" }}>
                    Guard &amp; Verification Spec: {selectedMenuDetail.architectureNotes}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    openAskNoctisPopup(
                      `Inspect Cyber Monitor Dossier ${selectedMenuDetail.id}: ${selectedMenuDetail.title} (${selectedMenuDetail.badge}) — show all 4 technical details and CLI command`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-opacity hover:opacity-90"
                  style={{
                    background: "#8b4528",
                    color: "#fbf8f3",
                    border: "1px solid #e6b89c",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Full Answer in Noctis Chat</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            THE XTRIKE PLATFORM — INTERACTIVE 4-CHEVRON HEXAGONAL CORE &
            4-STAGE DATA-TO-OBSERVABILITY HOURGLASS (SCREENSHOTS 1 & 10)
           ===================================================================== */}
        {(activeTab === "all" || activeTab === "platform") && (
          <section
            className="rounded-2xl overflow-hidden relative"
            style={{
              background: "linear-gradient(180deg, #191512 0%, #14110e 50%, #191512 100%)",
              border: "1px solid #332b25",
              boxShadow: "0 18px 44px rgba(31, 27, 24, 0.2)",
              color: "#f3eee4",
            }}
          >
            {/* Central Glowing Hourglass Neck Backdrop */}
            <div
              className="pointer-events-none absolute inset-0 flex justify-center items-stretch opacity-90"
              aria-hidden="true"
            >
              <svg viewBox="0 0 900 980" className="w-full max-w-[880px] h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="xtrikeHourglassGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b4528" stopOpacity="0.45" />
                    <stop offset="28%" stopColor="#996b1f" stopOpacity="0.55" />
                    <stop offset="58%" stopColor="#408a67" stopOpacity="0.65" />
                    <stop offset="84%" stopColor="#2d6a4f" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#191512" stopOpacity="0.08" />
                  </linearGradient>
                </defs>
                <path
                  d="M 140 0 Q 345 190 355 490 Q 345 790 120 980 L 780 980 Q 555 790 545 490 Q 555 190 760 0 Z"
                  fill="url(#xtrikeHourglassGrad)"
                />
              </svg>
            </div>

            <div className="relative z-10 px-5 sm:px-10 py-10 space-y-10">
              {/* Top Row: 5 Terracotta Hexagonal Workflow Integrations (ITSM, AI Agents, Collaboration, Automation, MCP server) */}
              <div className="text-center space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-7">
                  {XTRIKE_WORKFLOW_INTEGRATIONS.map((wf, idx) => (
                    <button
                      key={wf.id}
                      type="button"
                      onClick={() =>
                        openAskNoctisPopup(
                          `Inspect XTRIKE ${wf.label} workflow integration (${wf.detail}) and how it connects to the 4-stage Solve/Analyze/Transform/Ingest hourglass`
                        )
                      }
                      className="flex flex-col items-center gap-1.5 group cursor-pointer bg-transparent border-0 p-0"
                    >
                      <div
                        className="w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{
                          background: "rgba(28, 24, 21, 0.92)",
                          clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                          border: "2px solid #c86d44",
                          boxShadow: "0 0 18px rgba(200, 109, 68, 0.35)",
                        }}
                        title={wf.detail}
                      >
                        {idx === 0 && <ArrowUpRight className="w-5 h-5" style={{ color: "#e6b89c" }} />}
                        {idx === 1 && <Cpu className="w-5 h-5" style={{ color: "#e6b89c" }} />}
                        {idx === 2 && <Layers className="w-5 h-5" style={{ color: "#e6b89c" }} />}
                        {idx === 3 && (
                          <span className="text-xs font-extrabold px-1.5 py-0.5 rounded-full border border-[#e6b89c] text-[#e6b89c]">
                            A
                          </span>
                        )}
                        {idx === 4 && <Sparkles className="w-5 h-5" style={{ color: "#e6b89c" }} />}
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: "#e6decb" }}>
                        {wf.label}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold tracking-wider uppercase" style={{ color: "#f3eee4" }}>
                  Integrate into workflows
                </div>
              </div>

              {/* Part A: "The XTRIKE Platform" Interactive 4-Chevron Hexagon + Dynamic Right-Side Stage Explanation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-[1140px] mx-auto pt-2">
                {/* Left Column: Title */}
                <div className="lg:col-span-3 text-center lg:text-right space-y-2">
                  <div className="text-xs font-mono uppercase tracking-widest" style={{ color: "#e6b89c" }}>
                    UNIFIED ARCHITECTURE
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight" style={{ color: "#fbf8f3" }}>
                    The
                    <br />
                    XTRIKE
                    <br />
                    Platform
                  </h2>
                  <p className="text-xs" style={{ color: "#cbbca6" }}>
                    Click any chevron stage (<strong>Solve</strong>, <strong>Analyze</strong>,{" "}
                    <strong>Transform</strong>, or <strong>Ingest</strong>) to inspect XTRIKE&apos;s architecture.
                  </p>
                </div>

                {/* Center Column: Interactive 3D 4-Chevron Hexagon */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-[300px] sm:w-[340px] h-[350px] sm:h-[380px] select-none">
                    <svg viewBox="0 0 320 360" className="w-full h-full drop-shadow-[0_16px_36px_rgba(0,0,0,0.55)]">
                      {/* Outer 3D Terracotta Hexagon Frame */}
                      <polygon
                        points="160,10 300,90 300,270 160,350 20,270 20,90"
                        fill="#192a22"
                        stroke="#c86d44"
                        strokeWidth="8"
                        strokeLinejoin="round"
                      />
                      {/* Inner Hexagon Clip & 4 Upward Chevrons */}
                      <defs>
                        <clipPath id="xtrikeHexInnerClip">
                          <polygon points="160,16 294,93 294,267 160,344 26,267 26,93" />
                        </clipPath>
                      </defs>

                      <g clipPath="url(#xtrikeHexInnerClip)">
                        {/* Stage 4: Solve (Top band) */}
                        <g
                          className="cursor-pointer transition-opacity hover:opacity-95"
                          onClick={() => setSelectedHourglassStage(XTRIKE_PIPELINE_HOURGLASS_STAGES[0])}
                        >
                          <polygon
                            points="20,16 300,16 300,145 160,82 20,145"
                            fill={
                              selectedHourglassStage.verticalLabel === "Solve" ? "#52a37d" : "#408a67"
                            }
                            stroke="#192a22"
                            strokeWidth="1.5"
                          />
                          <text
                            x="160"
                            y="64"
                            textAnchor="middle"
                            fill="#fbf8f3"
                            fontSize="17"
                            fontWeight="700"
                          >
                            Solve
                          </text>
                        </g>

                        {/* Stage 3: Analyze */}
                        <g
                          className="cursor-pointer transition-opacity hover:opacity-95"
                          onClick={() => setSelectedHourglassStage(XTRIKE_PIPELINE_HOURGLASS_STAGES[1])}
                        >
                          <polygon
                            points="20,145 160,82 300,145 300,220 160,155 20,220"
                            fill={
                              selectedHourglassStage.verticalLabel === "Analyze" ? "#408a67" : "#2d6a4f"
                            }
                            stroke="#192a22"
                            strokeWidth="1.5"
                          />
                          <text
                            x="160"
                            y="134"
                            textAnchor="middle"
                            fill="#fbf8f3"
                            fontSize="17"
                            fontWeight="700"
                          >
                            Analyze
                          </text>
                        </g>

                        {/* Stage 2: Transform */}
                        <g
                          className="cursor-pointer transition-opacity hover:opacity-95"
                          onClick={() => setSelectedHourglassStage(XTRIKE_PIPELINE_HOURGLASS_STAGES[2])}
                        >
                          <polygon
                            points="20,220 160,155 300,220 300,295 160,230 20,295"
                            fill={
                              selectedHourglassStage.verticalLabel === "Transform" ? "#387c5d" : "#245740"
                            }
                            stroke="#192a22"
                            strokeWidth="1.5"
                          />
                          <text
                            x="160"
                            y="206"
                            textAnchor="middle"
                            fill="#fbf8f3"
                            fontSize="17"
                            fontWeight="700"
                          >
                            Transform
                          </text>
                        </g>

                        {/* Stage 1: Ingest */}
                        <g
                          className="cursor-pointer transition-opacity hover:opacity-95"
                          onClick={() => setSelectedHourglassStage(XTRIKE_PIPELINE_HOURGLASS_STAGES[3])}
                        >
                          <polygon
                            points="20,295 160,230 300,295 300,350 20,350"
                            fill={
                              selectedHourglassStage.verticalLabel === "Ingest" ? "#68b684" : "#49946e"
                            }
                            stroke="#192a22"
                            strokeWidth="1.5"
                          />
                          <text
                            x="160"
                            y="272"
                            textAnchor="middle"
                            fill="#fbf8f3"
                            fontSize="17"
                            fontWeight="700"
                          >
                            Ingest
                          </text>
                        </g>

                        {/* Bottom Dark Apex Triangle + XTRIKE Upward Shield Emblem */}
                        <polygon points="95,350 160,296 225,350" fill="#191512" />
                        <polygon
                          points="160,310 176,319 176,337 160,346 144,337 144,319"
                          fill="#fbf8f3"
                        />
                        <path
                          d="M160 338 L160 318 M160 318 L153 325 M160 318 L167 325"
                          stroke="#8b4528"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Right Column: Dynamic Stage Narrative Panel */}
                <div
                  className="lg:col-span-4 rounded-2xl p-6 space-y-3"
                  style={{
                    background: "rgba(35, 30, 26, 0.9)",
                    border: "1px solid #4a3d33",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold" style={{ color: "#fbf8f3" }}>
                      {selectedHourglassStage.verticalLabel}
                    </h3>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: "rgba(104, 182, 132, 0.16)",
                        color: "#68b684",
                        border: "1px solid rgba(104, 182, 132, 0.35)",
                      }}
                    >
                      Stage {selectedHourglassStage.stepNumber} of 4
                    </span>
                  </div>
                  <p className="text-sm font-bold leading-snug" style={{ color: "#fbf8f3" }}>
                    {selectedHourglassStage.leadBold}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#d6cbb9" }}>
                    {selectedHourglassStage.paragraph1}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#d6cbb9" }}>
                    {selectedHourglassStage.paragraph2}
                  </p>
                </div>
              </div>

              {/* Part B: Top 3 Gradient Monitoring Pillars + 4-Stage Horizontal Funnel Bars (Screenshot 1) */}
              <div className="max-w-[920px] mx-auto space-y-3 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {XTRIKE_HOURGLASS_TOP_PILLARS.map((pillar) => (
                    <button
                      key={pillar.id}
                      type="button"
                      onClick={() => {
                        if (pillar.id === "infra-monitoring") setActiveTab("fleet");
                        else if (pillar.id === "app-monitoring") setActiveTab("posture");
                        else if (pillar.id === "synthetic-monitoring") setActiveTab("ux");
                      }}
                      className="rounded-t-xl px-5 py-4 text-center shadow-md cursor-pointer transition-transform hover:-translate-y-0.5 border-0"
                      style={{
                        background: "linear-gradient(180deg, #e6b89c 0%, #86c7a3 100%)",
                        color: "#1f1b18",
                      }}
                    >
                      <div className="text-base font-extrabold tracking-tight">{pillar.title}</div>
                      <div className="text-[11px] font-medium opacity-85 mt-0.5">{pillar.subtitle}</div>
                      <div className="text-[10px] font-mono font-bold mt-1 opacity-90">{pillar.metricBadge}</div>
                    </button>
                  ))}
                </div>

                {/* 4 Horizontal Stage Bars (4 Solve -> 3 Analyze -> 2 Transform -> 1 Ingest) */}
                <div className="space-y-3">
                  {XTRIKE_PIPELINE_HOURGLASS_STAGES.map((stage) => {
                    const isSelected = selectedHourglassStage.stepNumber === stage.stepNumber;
                    return (
                      <div
                        key={stage.stepNumber}
                        onClick={() => setSelectedHourglassStage(stage)}
                        className="rounded-xl px-4 py-4 flex items-center gap-4 cursor-pointer transition-all"
                        style={{
                          background: isSelected ? "#2c2520" : "#231e1a",
                          border: isSelected
                            ? `1.5px solid ${stage.accentColor}`
                            : "1px solid #332b25",
                          boxShadow: isSelected
                            ? "0 8px 24px rgba(0,0,0,0.35)"
                            : "0 4px 14px rgba(0,0,0,0.2)",
                        }}
                      >
                        {/* Number + Chevron Badge */}
                        <div
                          className="w-9 h-12 rounded-lg flex flex-col items-center justify-center shrink-0"
                          style={{ background: "#191512", border: "1px solid #332b25" }}
                        >
                          <span className="text-sm font-bold" style={{ color: "#fbf8f3" }}>{stage.stepNumber}</span>
                          <ChevronDown className="w-3.5 h-3.5" style={{ color: stage.accentColor }} />
                        </div>

                        {/* Vertical Pill Label */}
                        <div
                          className="w-8 h-14 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: "#14110e",
                            borderRight: `2px solid ${stage.accentColor}`,
                          }}
                        >
                          <span
                            className="text-[11px] font-bold tracking-wider"
                            style={{
                              color: "#fbf8f3",
                              writingMode: "vertical-rl",
                              transform: "rotate(180deg)",
                            }}
                          >
                            {stage.verticalLabel}
                          </span>
                        </div>

                        {/* Center Headline & Subdetail */}
                        <div className="flex-1 text-center px-2">
                          <div className="text-base sm:text-lg font-bold" style={{ color: "#fbf8f3" }}>
                            {stage.headline}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "#cbbca6" }}>
                            {stage.subDetail}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row: Data Extraction + 7 Forest Emerald Hexagonal Collector Icons */}
              <div className="text-center space-y-4 pt-2">
                <div className="text-xs font-bold tracking-wider uppercase" style={{ color: "#f3eee4" }}>
                  Data Extraction
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  {XTRIKE_EXTRACTION_COLLECTORS.map((col, idx) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        if (col.id === "col-net" || col.id === "col-srv" || col.id === "col-db") {
                          setActiveTab("domains");
                        } else if (col.id === "col-app") {
                          setActiveTab("posture");
                        } else {
                          setActiveTab("fleet");
                        }
                        openAskNoctisPopup(
                          `Inspect XTRIKE Data Extraction collector: ${col.label} (${col.tag}) and live telemetry`
                        );
                      }}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer bg-transparent border-0 p-0"
                    >
                      <div
                        className="w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{
                          background: "#1c1815",
                          clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                          border: "2px solid #408a67",
                          boxShadow: "0 0 16px rgba(64, 138, 103, 0.35)",
                        }}
                      >
                        {idx === 0 && <GitBranch className="w-5 h-5" style={{ color: "#68b684" }} />}
                        {idx === 1 && <Cpu className="w-5 h-5" style={{ color: "#68b684" }} />}
                        {idx === 2 && <Terminal className="w-5 h-5" style={{ color: "#68b684" }} />}
                        {idx === 3 && <Activity className="w-5 h-5" style={{ color: "#68b684" }} />}
                        {idx === 4 && <Layers className="w-5 h-5" style={{ color: "#68b684" }} />}
                        {idx === 5 && <Hash className="w-5 h-5" style={{ color: "#68b684" }} />}
                        {idx === 6 && <FileCode2 className="w-5 h-5" style={{ color: "#68b684" }} />}
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: "#fbf8f3" }}>{col.label}</span>
                      <span className="text-[10px]" style={{ color: "#86c7a3" }}>
                        {col.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            HYBRID ENTERPRISE FLEET DASHBOARD & "EXPLAIN WITH XTRIKE AI"
            PROBLEM DRAWER (SCREENSHOTS 4 & 5)
           ===================================================================== */}
        {(activeTab === "all" || activeTab === "fleet") && (
          <section className="space-y-6">
            {/* Part 1: Infrastructure Monitoring for the Hybrid Enterprise (Screenshot 5) */}
            <div
              className="rounded-2xl p-5 sm:p-6 space-y-5"
              style={{
                background: "#191512",
                border: "1px solid #332b25",
                color: "#f3eee4",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3" style={{ borderBottom: "1px solid #332b25" }}>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "#e6b89c" }}>
                    {XTRIKE_HYBRID_FLEET_TELEMETRY.dashboardTitle}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mt-0.5" style={{ color: "#fbf8f3" }}>
                    Infrastructure &amp; Runner Monitoring for the Hybrid Enterprise
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded bg-[#231e1a] border border-[#332b25] text-[#d6cbb9]">
                    Dashboard: <strong>Linux &amp; Hybrid SAST Hosts</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#1b2e24] border border-[#408a67] text-[#68b684] font-semibold">
                    Live Telemetry
                  </span>
                </div>
              </div>

              {/* Top Row: Host Statistics Hexagon + Service Statistics Hexagon + Total Agent Execution Time Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Host Statistics Card */}
                <div
                  className="lg:col-span-3 rounded-xl p-4 space-y-3"
                  style={{ background: "#231e1a", border: "1px solid #332b25" }}
                >
                  <div className="text-xs font-bold text-center text-[#d6cbb9]">Host statistics</div>
                  <div className="flex items-center justify-around gap-3">
                    <svg viewBox="0 0 120 120" className="w-24 h-24 shrink-0">
                      <polygon
                        points="60,8 106,34 106,86 60,112 14,86 14,34"
                        fill="none"
                        stroke="#408a67"
                        strokeWidth="6"
                      />
                      <polygon
                        points="60,22 94,41 94,79 60,98 26,79 26,41"
                        fill="rgba(64,138,103,0.12)"
                        stroke="#2d6a4f"
                        strokeWidth="2"
                      />
                      <text x="60" y="64" textAnchor="middle" fill="#68b684" fontSize="16" fontWeight="700">
                        {XTRIKE_HYBRID_FLEET_TELEMETRY.hostStats.total}
                      </text>
                    </svg>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#a89f91]">Up</span>
                        <span className="font-bold text-[#68b684]">{XTRIKE_HYBRID_FLEET_TELEMETRY.hostStats.up}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#a89f91]">In downtime</span>
                        <span className="font-bold text-[#fbf8f3]">{XTRIKE_HYBRID_FLEET_TELEMETRY.hostStats.inDowntime}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#a89f91]">Unreachable</span>
                        <span className="font-bold text-[#fbf8f3]">{XTRIKE_HYBRID_FLEET_TELEMETRY.hostStats.unreachable}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#a89f91]">Down</span>
                        <span className="font-bold text-[#fbf8f3]">{XTRIKE_HYBRID_FLEET_TELEMETRY.hostStats.down}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#332b25]">
                        <span className="text-[#d6cbb9] font-semibold">Total</span>
                        <span className="font-bold text-[#fbf8f3]">{XTRIKE_HYBRID_FLEET_TELEMETRY.hostStats.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Statistics Card */}
                <div
                  className="lg:col-span-4 rounded-xl p-4 space-y-3"
                  style={{ background: "#231e1a", border: "1px solid #332b25" }}
                >
                  <div className="text-xs font-bold text-center text-[#d6cbb9]">Service statistics</div>
                  <div className="flex items-center justify-around gap-3">
                    <svg viewBox="0 0 120 120" className="w-24 h-24 shrink-0">
                      <polygon
                        points="60,8 106,34 106,86 60,112 14,86 14,34"
                        fill="none"
                        stroke="#408a67"
                        strokeWidth="6"
                      />
                      <polygon
                        points="60,36 82,48 82,72 60,84 38,72 38,48"
                        fill="#9e2a2b"
                        stroke="#d4a359"
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#a89f91]">OK</span>
                        <span className="font-bold text-[#68b684]">{XTRIKE_HYBRID_FLEET_TELEMETRY.serviceStats.ok}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#a89f91]">Warning</span>
                        <span className="font-bold text-[#d4a359]">{XTRIKE_HYBRID_FLEET_TELEMETRY.serviceStats.warning}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#a89f91]">In downtime</span>
                        <span className="font-bold text-[#fbf8f3]">{XTRIKE_HYBRID_FLEET_TELEMETRY.serviceStats.inDowntime}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#a89f91]">Critical</span>
                        <span className="font-bold text-[#e06c6d]">{XTRIKE_HYBRID_FLEET_TELEMETRY.serviceStats.critical}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#a89f91]">On down host</span>
                        <span className="font-bold text-[#fbf8f3]">{XTRIKE_HYBRID_FLEET_TELEMETRY.serviceStats.onDownHost}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#332b25]">
                        <span className="text-[#d6cbb9] font-semibold">Total</span>
                        <span className="font-bold text-[#fbf8f3]">{XTRIKE_HYBRID_FLEET_TELEMETRY.serviceStats.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Agent Execution Time Chart */}
                <div
                  className="lg:col-span-5 rounded-xl p-4 space-y-2"
                  style={{ background: "#231e1a", border: "1px solid #332b25" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#d6cbb9]">Total agent execution time</span>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1 text-[#e6b89c]">● Mean</span>
                      <span className="flex items-center gap-1 text-[#68b684]">● Median</span>
                      <span className="flex items-center gap-1 text-[#d4a359]">● Host Peak</span>
                    </div>
                  </div>
                  <svg viewBox="0 0 420 95" className="w-full h-24">
                    <line x1="28" y1="15" x2="410" y2="15" stroke="#332b25" strokeDasharray="2 2" />
                    <line x1="28" y1="45" x2="410" y2="45" stroke="#332b25" strokeDasharray="2 2" />
                    <line x1="28" y1="75" x2="410" y2="75" stroke="#332b25" />
                    <text x="4" y="18" fill="#a89f91" fontSize="9">20 s</text>
                    <text x="4" y="48" fill="#a89f91" fontSize="9">10 s</text>
                    <text x="8" y="78" fill="#a89f91" fontSize="9">0 s</text>
                    {/* Host Peak Line */}
                    <polyline
                      fill="none"
                      stroke="#d4a359"
                      strokeWidth="1.5"
                      points="30,42 75,38 120,22 165,44 210,39 255,26 300,37 345,43 400,39"
                    />
                    {/* Mean Line */}
                    <polyline
                      fill="none"
                      stroke="#e6b89c"
                      strokeWidth="1.8"
                      points="30,62 75,60 120,57 165,63 210,61 255,58 300,60 345,62 400,60"
                    />
                    {/* Median Line */}
                    <polyline
                      fill="none"
                      stroke="#68b684"
                      strokeWidth="1.5"
                      points="30,67 75,66 120,65 165,68 210,66 255,64 300,66 345,67 400,66"
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom Row: 4-Column Top 10 Utilization Bars (CPU, Memory, Input/Output Bandwidth, Disk) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Top 10: CPU utilization */}
                <div className="rounded-xl p-3.5 space-y-2" style={{ background: "#231e1a", border: "1px solid #332b25" }}>
                  <div className="text-xs font-bold text-[#d6cbb9]">Top 10: CPU utilization (Click host)</div>
                  <div className="space-y-1.5">
                    {XTRIKE_HYBRID_FLEET_TELEMETRY.top10Cpu.map((row) => (
                      <button
                        key={row.host}
                        type="button"
                        onClick={() =>
                          handleInspectCustomDossier({
                            id: `cpu-${row.host}`,
                            title: `Host CPU Telemetry: ${row.host}`,
                            category: "Hybrid Fleet · Top 10 CPU",
                            badge: row.valueLabel,
                            status: row.pctBar > 85 ? "ACTIVE" : "VERIFIED",
                            targetTab: "fleet",
                            summary: `Real-time multi-core CPU telemetry for hybrid enterprise host ${row.host}. Currently operating at ${row.valueLabel} across AST/dataflow worker threads and runtime eBPF probes.`,
                            architectureNotes: `Monitored via XTRIKE Bakery Agent (mTLS 1.3 + Ed25519 signed manifest) with cgroup v2 CPU throttling guards and sub-15s kernel scheduling telemetry.`,
                            liveMetrics: [
                              { label: "CPU Utilization", value: row.valueLabel, delta: "Multi-core active" },
                              { label: "Bar Saturation", value: `${row.pctBar}%`, delta: "Threshold 90%" },
                              { label: "Agent Execution", value: "0.34 s", delta: "Sub-second poll" },
                              { label: "Host State", value: "UP · VERIFIED", delta: "0 packet loss" },
                            ],
                            cliCommand: `xtrike-sast-cli fleet inspect --host ${row.host} --metric cpu --window 15m`,
                            relatedRoute: "/scan",
                            relatedRouteLabel: "Inspect Host in Scan Studio",
                          })
                        }
                        className="w-full grid grid-cols-12 items-center gap-2 text-[11px] text-left cursor-pointer hover:bg-[#2c2520] p-0.5 rounded transition-colors"
                      >
                        <span className="col-span-6 truncate text-[#cbbca6] underline decoration-dotted" title={row.host}>
                          {row.host}
                        </span>
                        <div className="col-span-6 h-4 rounded bg-[#191512] overflow-hidden relative">
                          <div
                            className="h-full"
                            style={{
                              width: `${row.pctBar}%`,
                              background: "#408a67",
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-end pr-1.5 text-[10px] font-bold text-[#fbf8f3]">
                            {row.valueLabel}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top 10: Memory utilization */}
                <div className="rounded-xl p-3.5 space-y-2" style={{ background: "#231e1a", border: "1px solid #332b25" }}>
                  <div className="text-xs font-bold text-[#d6cbb9]">Top 10: Memory utilization (Click host)</div>
                  <div className="space-y-1.5">
                    {XTRIKE_HYBRID_FLEET_TELEMETRY.top10Memory.map((row) => (
                      <button
                        key={row.host}
                        type="button"
                        onClick={() =>
                          handleInspectCustomDossier({
                            id: `mem-${row.host}`,
                            title: `Host Memory Telemetry: ${row.host}`,
                            category: "Hybrid Fleet · Top 10 RAM",
                            badge: row.valueLabel,
                            status: "VERIFIED",
                            targetTab: "fleet",
                            summary: `Heap, RSS, and page-cache memory utilization for ${row.host} (${row.valueLabel}). Tracks interprocedural taint graph memory footprint and container RSS limits.`,
                            architectureNotes: `Enforces OOM-killer guardrails, jemalloc arena telemetry, and automatic heap snapshot capture when RSS crosses 80% of container cgroup ceiling.`,
                            liveMetrics: [
                              { label: "RAM Usage", value: row.valueLabel, delta: "Within SLA" },
                              { label: "Heap Allocation", value: `${row.pctBar}%`, delta: "Zero OOM events" },
                              { label: "Swap Pressure", value: "0.0%", delta: "Locked memory" },
                              { label: "GC Pause p99", value: "4.2 ms", delta: "Optimal" },
                            ],
                            cliCommand: `xtrike-sast-cli fleet inspect --host ${row.host} --metric memory --heap-profile`,
                            relatedRoute: "/scan",
                            relatedRouteLabel: "Inspect Host Memory",
                          })
                        }
                        className="w-full grid grid-cols-12 items-center gap-2 text-[11px] text-left cursor-pointer hover:bg-[#2c2520] p-0.5 rounded transition-colors"
                      >
                        <span className="col-span-6 truncate text-[#cbbca6] underline decoration-dotted" title={row.host}>
                          {row.host}
                        </span>
                        <div className="col-span-6 h-4 rounded bg-[#191512] overflow-hidden relative">
                          <div
                            className="h-full"
                            style={{
                              width: `${row.pctBar}%`,
                              background: "#8b4528",
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-end pr-1.5 text-[10px] font-bold text-[#fbf8f3]">
                            {row.valueLabel}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top 10: Input & Output bandwidth */}
                <div className="rounded-xl p-3.5 space-y-3" style={{ background: "#231e1a", border: "1px solid #332b25" }}>
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-[#d6cbb9]">Top 10: Input bandwidth</div>
                    {XTRIKE_HYBRID_FLEET_TELEMETRY.top10InputBandwidth.map((row, i) => (
                      <button
                        key={`${row.host}-in-${i}`}
                        type="button"
                        onClick={() =>
                          handleInspectCustomDossier({
                            id: `bw-in-${row.host}-${i}`,
                            title: `Ingress Bandwidth: ${row.host} (${row.service})`,
                            category: "Hybrid Fleet · Network I/O",
                            badge: row.valueLabel,
                            status: "VERIFIED",
                            targetTab: "domains",
                            summary: `Ingress network throughput on ${row.host} via ${row.service} (${row.valueLabel}). Monitored for anomalous payload spikes and SSRF/exfiltration bursts.`,
                            architectureNotes: `SNMP v3 + eBPF socket filter telemetry with zero-trust mTLS SPIFFE identity verification on every ingress interface.`,
                            liveMetrics: [
                              { label: "Ingress Rate", value: row.valueLabel, delta: row.service },
                              { label: "Packet Drop Rate", value: "0.001%", delta: "Zero congestion" },
                              { label: "mTLS Handshake", value: "1.4 ms", delta: "TLS 1.3 strict" },
                              { label: "Interface Status", value: "UP · FULL DUPLEX", delta: "10GbE link" },
                            ],
                            cliCommand: `xtrike-sast-cli net-flow --host ${row.host} --iface "${row.service}" --direction in`,
                            relatedRoute: "/scan",
                            relatedRouteLabel: "Open Network Flow",
                          })
                        }
                        className="w-full grid grid-cols-12 items-center gap-1.5 text-[11px] text-left cursor-pointer hover:bg-[#2c2520] p-0.5 rounded transition-colors"
                      >
                        <span className="col-span-4 truncate text-[#cbbca6] underline decoration-dotted">{row.host}</span>
                        <span className="col-span-3 truncate text-[10px] text-[#a89f91]">{row.service}</span>
                        <div className="col-span-5 h-4 rounded bg-[#191512] overflow-hidden relative">
                          <div className="h-full" style={{ width: `${row.pctBar}%`, background: "#408a67" }} />
                          <span className="absolute inset-0 flex items-center justify-end pr-1 text-[10px] font-bold text-[#fbf8f3]">
                            {row.valueLabel}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-[#332b25]">
                    <div className="text-xs font-bold text-[#d6cbb9]">Top 10: Output bandwidth</div>
                    {XTRIKE_HYBRID_FLEET_TELEMETRY.top10OutputBandwidth.map((row, i) => (
                      <button
                        key={`${row.host}-out-${i}`}
                        type="button"
                        onClick={() =>
                          handleInspectCustomDossier({
                            id: `bw-out-${row.host}-${i}`,
                            title: `Egress Bandwidth: ${row.host} (${row.service})`,
                            category: "Hybrid Fleet · Network Egress",
                            badge: row.valueLabel,
                            status: "VERIFIED",
                            targetTab: "domains",
                            summary: `Egress network throughput on ${row.host} via ${row.service} (${row.valueLabel}). Continuously audited against outbound SSRF and data-exfiltration policies.`,
                            architectureNotes: `Egress allowlist enforcement via XTRIKE eBPF socket guard + OTel span correlation for outbound API calls.`,
                            liveMetrics: [
                              { label: "Egress Rate", value: row.valueLabel, delta: row.service },
                              { label: "SSRF Blocks", value: "0 blocked", delta: "Policy enforced" },
                              { label: "Retransmits", value: "0.002%", delta: "Clean link" },
                              { label: "Cipher Suite", value: "AEAD-CHACHA20", delta: "Verified" },
                            ],
                            cliCommand: `xtrike-sast-cli net-flow --host ${row.host} --iface "${row.service}" --direction out`,
                            relatedRoute: "/scan",
                            relatedRouteLabel: "Open Egress Audit",
                          })
                        }
                        className="w-full grid grid-cols-12 items-center gap-1.5 text-[11px] text-left cursor-pointer hover:bg-[#2c2520] p-0.5 rounded transition-colors"
                      >
                        <span className="col-span-4 truncate text-[#cbbca6] underline decoration-dotted">{row.host}</span>
                        <span className="col-span-3 truncate text-[10px] text-[#a89f91]">{row.service}</span>
                        <div className="col-span-5 h-4 rounded bg-[#191512] overflow-hidden relative">
                          <div className="h-full" style={{ width: `${row.pctBar}%`, background: "#996b1f" }} />
                          <span className="absolute inset-0 flex items-center justify-end pr-1 text-[10px] font-bold text-[#fbf8f3]">
                            {row.valueLabel}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top 10: Disk utilization */}
                <div className="rounded-xl p-3.5 space-y-2" style={{ background: "#231e1a", border: "1px solid #332b25" }}>
                  <div className="text-xs font-bold text-[#d6cbb9]">Top 10: Disk utilization (Click host)</div>
                  <div className="space-y-1.5">
                    {XTRIKE_HYBRID_FLEET_TELEMETRY.top10Disk.map((row) => (
                      <button
                        key={row.host}
                        type="button"
                        onClick={() =>
                          handleInspectCustomDossier({
                            id: `disk-${row.host}`,
                            title: `Storage & Volume Telemetry: ${row.host}`,
                            category: "Hybrid Fleet · Top 10 Disk",
                            badge: row.valueLabel,
                            status: row.pctBar > 85 ? "ACTIVE" : "VERIFIED",
                            targetTab: "fleet",
                            summary: `Filesystem volume utilization and IOPS telemetry for ${row.host} (${row.valueLabel}). Tracks SARIF artifact staging, crash dumps, and container layer storage.`,
                            architectureNotes: `Monitored via SMART NVMe health checks, inode exhaustion guards, and automated staging-log rotation when volume usage exceeds 85%.`,
                            liveMetrics: [
                              { label: "Volume Used", value: row.valueLabel, delta: row.pctBar > 85 ? "Near threshold" : "Healthy" },
                              { label: "Read/Write IOPS", value: "14.2K / 6.8K", delta: "NVMe Gen4" },
                              { label: "Inode Usage", value: "18.4%", delta: "Nominal" },
                              { label: "Filesystem", value: "ext4 / xfs", delta: "LUKS encrypted" },
                            ],
                            cliCommand: `xtrike-sast-cli fleet storage --host ${row.host} --check-inodes --rotate-staging`,
                            relatedRoute: "/reports",
                            relatedRouteLabel: "Inspect Storage Report",
                          })
                        }
                        className="w-full grid grid-cols-12 items-center gap-2 text-[11px] text-left cursor-pointer hover:bg-[#2c2520] p-0.5 rounded transition-colors"
                      >
                        <span className="col-span-7 truncate text-[#cbbca6] underline decoration-dotted" title={row.host}>
                          {row.host}
                        </span>
                        <div className="col-span-5 h-4 rounded bg-[#191512] overflow-hidden relative">
                          <div
                            className="h-full"
                            style={{
                              width: `${Math.min(100, row.pctBar)}%`,
                              background: row.pctBar > 85 ? "#9e2a2b" : "#5c5349",
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-end pr-1.5 text-[10px] font-bold text-[#fbf8f3]">
                            {row.valueLabel}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Part 2: Experience AI-Powered Workflows with XTRIKE — Split Problem Dashboard + "Explain with AI" Drawer (Screenshot 4) */}
            <div
              id="explain-with-ai"
              className="rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
              style={{
                background: "#191512",
                border: "1px solid #332b25",
                color: "#f3eee4",
              }}
            >
              {/* Left Pane: Problem Dashboard & Unhandled Service Problems */}
              <div className="lg:col-span-6 p-5 sm:p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-[#332b25]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-[#e6b89c]">
                      Monitor &gt; Problems &gt; Problem dashboard
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#fbf8f3] mt-0.5">
                      Experience AI-Powered Workflows with XTRIKE
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#231e1a] border border-[#332b25] text-[#cbbca6]">
                    Click any row to Explain with AI
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#332b25]">
                  <div className="px-3.5 py-2 bg-[#231e1a] text-[11px] font-bold text-[#d6cbb9] flex items-center justify-between">
                    <span>Service problems (unhandled)</span>
                    <span className="text-[#68b684]">{allAiDossiers.length} active dossiers</span>
                  </div>
                  <div className="divide-y divide-[#2b241f]">
                    {allAiDossiers.map((dossier) => {
                      const active = selectedAiDossier.id === dossier.id;
                      const isCrit = dossier.serviceStatus === "CRIT";
                      return (
                        <button
                          key={dossier.id}
                          onClick={() => setSelectedAiDossier(dossier)}
                          className="w-full text-left px-3.5 py-3 flex items-start gap-3 cursor-pointer transition-colors"
                          style={{
                            background: active ? "#2a231e" : "#1c1815",
                          }}
                        >
                          <span
                            className="px-2 py-1 rounded text-[10px] font-extrabold shrink-0 mt-0.5"
                            style={{
                              background: isCrit ? "#9e2a2b" : "#996b1f",
                              color: "#fbf8f3",
                            }}
                          >
                            {dossier.serviceStatus}
                          </span>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#fbf8f3] truncate">{dossier.host}</span>
                              <span className="text-[10px] text-[#a89f91] shrink-0">{dossier.since}</span>
                            </div>
                            <div className="text-xs font-semibold text-[#e6b89c] truncate">
                              {dossier.service}
                            </div>
                            <div className="text-[11px] text-[#cbbca6] line-clamp-2">
                              {dossier.pluginOutput}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Pane: "Explain with XTRIKE AI" Drawer */}
              <div className="lg:col-span-6 p-5 sm:p-6 space-y-5" style={{ background: "#14110e" }}>
                <div className="flex items-center justify-between pb-3 border-b border-[#332b25]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#e6b89c]" />
                    <span className="text-sm font-bold text-[#fbf8f3]">Explain with XTRIKE AI</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#a89f91]">{selectedAiDossier.cweOrCategory}</span>
                </div>

                {/* Host & Service Status Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl p-3 bg-[#231e1a] border border-[#332b25] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1b2e24] flex items-center justify-center text-[#68b684] font-bold text-xs">
                      H
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#a89f91]">Host</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#2d6a4f] text-[#fbf8f3]">
                          {selectedAiDossier.hostStatus}
                        </span>
                        <span className="text-xs font-semibold text-[#fbf8f3] truncate">
                          {selectedAiDossier.host}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl p-3 bg-[#231e1a] border border-[#332b25] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#381d1c] flex items-center justify-center text-[#e06c6d] font-bold text-xs">
                      S
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#a89f91]">Service</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-extrabold"
                          style={{
                            background: selectedAiDossier.serviceStatus === "CRIT" ? "#9e2a2b" : "#996b1f",
                            color: "#fbf8f3",
                          }}
                        >
                          {selectedAiDossier.serviceStatus}
                        </span>
                        <span className="text-xs font-semibold text-[#fbf8f3] truncate">
                          {selectedAiDossier.service}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI-Generated Answer Header + Data Quality */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#fbf8f3] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#68b684]" />
                        <span>AI-generated answer</span>
                      </div>
                      <div className="text-[10px] text-[#a89f91]">
                        Verified against XTRIKE Evidence Ledger &amp; live host telemetry.
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#a89f91]">Data quality:</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#1b2e24] text-[#68b684] border border-[#408a67]">
                        {selectedAiDossier.dataQuality}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="text-xs font-bold text-[#fbf8f3] mb-1">Summary</div>
                    <p className="text-xs leading-relaxed text-[#d6cbb9]">{selectedAiDossier.aiSummary}</p>
                  </div>
                </div>

                {/* Metric / Value / Status Table */}
                <div className="rounded-xl overflow-hidden border border-[#332b25]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#231e1a] text-[#a89f91] border-b border-[#332b25]">
                        <th className="py-2 px-3 font-semibold">Metric</th>
                        <th className="py-2 px-3 font-semibold">Value</th>
                        <th className="py-2 px-3 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2b241f]">
                      {selectedAiDossier.metrics.map((m) => (
                        <tr key={m.metric} className="bg-[#191512]">
                          <td className="py-2 px-3 text-[#d6cbb9]">{m.metric}</td>
                          <td className="py-2 px-3 font-mono text-[#fbf8f3]">{m.value}</td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold"
                              style={{
                                background:
                                  m.status === "CRIT"
                                    ? "#9e2a2b"
                                    : m.status === "WARN"
                                    ? "#996b1f"
                                    : "#2d6a4f",
                                color: "#fbf8f3",
                              }}
                            >
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Service Context + Ask Noctis Action */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-[#fbf8f3]">Service context</div>
                    <div className="rounded-xl p-3 bg-[#231e1a] border border-[#332b25] text-xs text-[#d6cbb9] leading-relaxed">
                      {selectedAiDossier.serviceContext}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        openAskNoctisPopup(
                          `Explain with XTRIKE AI dossier for ${selectedAiDossier.host} (${selectedAiDossier.service} · ${selectedAiDossier.cweOrCategory}) and provide remediation steps`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                      style={{
                        background: "#8b4528",
                        color: "#fbf8f3",
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open in Ask Noctis AI Copilot</span>
                    </button>
                    <Link
                      href="/reports"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold"
                      style={{
                        background: "#231e1a",
                        color: "#f3eee4",
                        border: "1px solid #332b25",
                        textDecoration: "none",
                      }}
                    >
                      <span>View Full Evidence Dossier</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#68b684]" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            USER EXPERIENCE (SYNTHETIC JOURNEY) MONITORING FOR ANY APPLICATION
            (SCREENSHOT 6)
           ===================================================================== */}
        {(activeTab === "all" || activeTab === "ux") && (
          <section
            className="rounded-2xl p-6 sm:p-8 space-y-6"
            style={{
              background: "#191512",
              border: "1px solid #332b25",
              color: "#f3eee4",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-3">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1b2e24] text-[#68b684] border border-[#408a67]">
                  SYNTHETIC USER EXPERIENCE &amp; API JOURNEYS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#fbf8f3] leading-tight">
                  User experience monitoring for any application
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-[#d6cbb9]">
                  Stop waiting for customer tickets or post-release breach reports to find out if your services or auth
                  flows are degraded. Monitor critical user journeys and security invariants end-to-end and catch
                  breakages or slowdowns before they impact your users.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Link
                    href="/scan"
                    className="px-4 py-2 rounded-lg text-xs font-bold"
                    style={{ background: "#8b4528", color: "#fbf8f3", textDecoration: "none" }}
                  >
                    Launch Synthetic Probe
                  </Link>
                  <button
                    onClick={() =>
                      openAskNoctisPopup(
                        "Analyze XTRIKE Synthetic User Journey runtimes (Checkout 641ms, OAuth2 PKCE 1.25s, Catalog Search 4.92s WARN)"
                      )
                    }
                    className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer bg-[#231e1a] text-[#fbf8f3] border border-[#332b25]"
                  >
                    Ask Noctis AI on UX Latency
                  </button>
                </div>
              </div>

              {/* Right Synthetic Telemetry Console */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Synthetic Node Runtimes */}
                <div className="rounded-xl p-4 bg-[#231e1a] border border-[#332b25] space-y-2.5">
                  <div className="text-xs font-bold text-[#d6cbb9]">Synthetic Runner Nodes</div>
                  {XTRIKE_SYNTHETIC_HOST_NODES.map((n) => (
                    <div key={n.host} className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-[#d6cbb9]">
                        <span className="truncate font-semibold">{n.host}</span>
                        <span className="font-mono font-bold text-[#68b684]">{n.runtimeLabel}</span>
                      </div>
                      <div className="h-2 rounded bg-[#14110e] overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${n.pct}%`,
                            background: n.tone === "cyan" ? "#c86d44" : "#408a67",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Plan Executions */}
                <div className="rounded-xl p-4 bg-[#231e1a] border border-[#332b25] space-y-2">
                  <div className="text-xs font-bold text-[#d6cbb9]">Plan Execution Waterfall</div>
                  <div className="space-y-1.5">
                    {XTRIKE_SYNTHETIC_PLANS.map((p) => (
                      <div
                        key={p.planName}
                        className="flex items-center justify-between gap-2 text-[11px] py-1 border-b border-[#332b25] last:border-none"
                      >
                        <span className="truncate text-[#d6cbb9]" title={p.planName}>
                          {p.planName}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0"
                          style={{
                            background: p.state === "OK" ? "#1b2e24" : "#3a2c15",
                            color: p.state === "OK" ? "#68b684" : "#d4a359",
                          }}
                        >
                          {p.durationSec} s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Multi-Line Step Runtime Chart + End-to-End Step Verification Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Step Runtime Multi-Line Chart */}
              <div className="lg:col-span-5 rounded-xl p-4 bg-[#231e1a] border border-[#332b25] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#fbf8f3]">Test runtime (End-to-End Journey Steps)</span>
                  <span className="text-[10px] text-[#a89f91]">08:30 – 09:10 UTC</span>
                </div>
                <svg viewBox="0 0 420 170" className="w-full h-44">
                  <line x1="30" y1="25" x2="405" y2="25" stroke="#332b25" strokeDasharray="2 2" />
                  <line x1="30" y1="65" x2="405" y2="65" stroke="#332b25" strokeDasharray="2 2" />
                  <line x1="30" y1="105" x2="405" y2="105" stroke="#332b25" strokeDasharray="2 2" />
                  <line x1="30" y1="145" x2="405" y2="145" stroke="#332b25" />
                  <text x="4" y="28" fill="#a89f91" fontSize="9">1.2s</text>
                  <text x="4" y="68" fill="#a89f91" fontSize="9">0.8s</text>
                  <text x="4" y="108" fill="#a89f91" fontSize="9">0.4s</text>
                  <text x="8" y="148" fill="#a89f91" fontSize="9">0s</text>
                  {/* Checkout Curve */}
                  <polyline
                    fill="none"
                    stroke="#e06c6d"
                    strokeWidth="1.8"
                    points="35,55 80,48 125,64 170,38 215,22 260,52 305,60 350,45 400,50"
                  />
                  {/* Search Curve */}
                  <polyline
                    fill="none"
                    stroke="#e6b89c"
                    strokeWidth="1.8"
                    points="35,88 80,84 125,92 170,82 215,74 260,89 305,93 350,86 400,88"
                  />
                  {/* Auth PKCE Curve */}
                  <polyline
                    fill="none"
                    stroke="#d4a359"
                    strokeWidth="1.8"
                    points="35,105 80,102 125,108 170,98 215,95 260,104 305,107 350,101 400,103"
                  />
                  {/* API Settlement Curve */}
                  <polyline
                    fill="none"
                    stroke="#68b684"
                    strokeWidth="1.8"
                    points="35,128 80,126 125,130 170,124 215,122 260,127 305,129 350,125 400,127"
                  />
                </svg>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#d6cbb9]">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#e06c6d]" /> Checkout Flow</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#e6b89c]" /> Catalog Search</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#d4a359]" /> OAuth2 PKCE</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#68b684]" /> Ledger API</span>
                </div>
              </div>

              {/* Step-by-Step Synthetic Verification Table */}
              <div className="lg:col-span-7 rounded-xl overflow-hidden bg-[#231e1a] border border-[#332b25]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#1c1815] text-[#a89f91] border-b border-[#332b25]">
                        <th className="py-2.5 px-3">State</th>
                        <th className="py-2.5 px-3">Host node</th>
                        <th className="py-2.5 px-3">Application</th>
                        <th className="py-2.5 px-3">Task</th>
                        <th className="py-2.5 px-3">Status detail</th>
                        <th className="py-2.5 px-3 text-right">Runtime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2b241f]">
                      {XTRIKE_SYNTHETIC_UX_STEPS.map((step) => (
                        <tr
                          key={step.id}
                          onClick={() =>
                            handleInspectCustomDossier({
                              id: `ux-${step.id}`,
                              title: `Synthetic Step: ${step.application} — ${step.taskName}`,
                              category: `Synthetic UX · ${step.hostNode}`,
                              badge: step.runtimeLabel,
                              status: step.state === "OK" ? "VERIFIED" : "ACTIVE",
                              targetTab: "ux",
                              summary: `${step.statusDetail}. Executed on headless Chromium synthetic runner node ${step.hostNode} for application ${step.application}.`,
                              architectureNotes: `Playwright + Robotmk deterministic step assertion with DOM mutation guard, CSP header validation, and sub-millisecond HAR waterfall capture.`,
                              liveMetrics: [
                                { label: "Step Runtime", value: step.runtimeLabel, delta: step.state },
                                { label: "Runner Node", value: step.hostNode, delta: "Isolated microVM" },
                                { label: "Application", value: step.application, delta: "TLS 1.3 Verified" },
                                { label: "DOM / API Guard", value: step.state === "OK" ? "PASS" : "WARN", delta: "SLA 3.0s" },
                              ],
                              cliCommand: `xtrike-sast-cli synthetic replay --node ${step.hostNode} --app "${step.application}" --step "${step.taskName}"`,
                              relatedRoute: "/validation-engine",
                              relatedRouteLabel: "Replay in Proof Engine",
                            })
                          }
                          className="hover:bg-[#2a231e] cursor-pointer transition-colors"
                        >
                          <td className="py-2 px-3">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-extrabold"
                              style={{
                                background: step.state === "OK" ? "#2d6a4f" : "#996b1f",
                                color: "#fbf8f3",
                              }}
                            >
                              {step.state}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-[#cbbca6] underline decoration-dotted">{step.hostNode}</td>
                          <td className="py-2 px-3 font-semibold text-[#fbf8f3]">{step.application}</td>
                          <td className="py-2 px-3 text-[#e6b89c] font-medium underline decoration-dotted">{step.taskName}</td>
                          <td className="py-2 px-3 text-[11px] text-[#d6cbb9]">{step.statusDetail}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#fbf8f3]">{step.runtimeLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            FULL-STACK DOMAIN SUITES — SERVER, NETWORK & DATABASE MONITORING
            WITH CUSTOM ISOMETRIC XTRIKE ILLUSTRATIONS (SCREENSHOTS 7, 8, 9)
           ===================================================================== */}
        {(activeTab === "all" || activeTab === "domains") && (
          <section className="space-y-6">
            {/* Suite 1: Scalable Server & Build-Runner Monitoring for Sysadmins, DevOps & AppSec (Screenshot 7) */}
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="text-center max-w-3xl mx-auto space-y-2 mb-8">
                <span className="desk-kicker">SERVER &amp; RUNNER OBSERVABILITY</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-editorial">
                  {XTRIKE_SERVER_DEVOPS_CAPABILITIES.title}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {XTRIKE_SERVER_DEVOPS_CAPABILITIES.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Isometric Hub-and-Spoke XTRIKE Server Illustration */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <svg viewBox="0 0 380 280" className="w-full max-w-[360px] h-auto">
                    {/* Connecting Isometric Circuit Lines */}
                    <g stroke="#4a4239" strokeWidth="2" fill="none">
                      <path d="M190 145 L95 85" />
                      <path d="M190 145 L285 85" />
                      <path d="M190 145 L95 210" />
                      <path d="M190 145 L285 210" />
                    </g>
                    {/* Top-Left Spoke: Web / Mail Node */}
                    <g transform="translate(55, 45)">
                      <polygon points="40,55 80,35 40,15 0,35" fill="#e2d9c8" />
                      <polygon points="40,35 68,21 40,7 12,21" fill="#68b684" />
                      <polygon points="12,21 40,35 40,55 12,41" fill="#408a67" />
                      <polygon points="68,21 40,35 40,55 68,41" fill="#2d6a4f" />
                    </g>
                    {/* Top-Right Spoke: App / Container Node */}
                    <g transform="translate(245, 45)">
                      <polygon points="40,55 80,35 40,15 0,35" fill="#e2d9c8" />
                      <polygon points="40,35 68,21 40,7 12,21" fill="#e6b89c" />
                      <polygon points="12,21 40,35 40,55 12,41" fill="#b8633e" />
                      <polygon points="68,21 40,35 40,55 68,41" fill="#8b4528" />
                    </g>
                    {/* Bottom-Left Spoke: Cloud / K8s Cube */}
                    <g transform="translate(55, 170)">
                      <polygon points="40,55 80,35 40,15 0,35" fill="#e2d9c8" />
                      <polygon points="40,35 68,21 40,7 12,21" fill="#86c7a3" />
                      <polygon points="12,21 40,35 40,55 12,41" fill="#408a67" />
                      <polygon points="68,21 40,35 40,55 68,41" fill="#2d6a4f" />
                    </g>
                    {/* Bottom-Right Spoke: Database Cylinder */}
                    <g transform="translate(250, 165)">
                      <polygon points="35,60 75,40 35,20 -5,40" fill="#e2d9c8" />
                      <ellipse cx="35" cy="38" rx="24" ry="12" fill="#1f1b18" />
                      <rect x="11" y="14" width="48" height="24" fill="#332b25" />
                      <ellipse cx="35" cy="14" rx="24" ry="12" fill="#68b684" />
                    </g>
                    {/* Central XTRIKE Core Server Cube */}
                    <g transform="translate(135, 90)">
                      <polygon points="55,95 115,65 55,35 -5,65" fill="#d5c8b4" />
                      <polygon points="55,48 98,26 55,4 12,26" fill="#408a67" />
                      <polygon points="12,26 55,48 55,86 12,64" fill="#2d6a4f" />
                      <polygon points="98,26 55,48 55,86 98,64" fill="#1f1b18" />
                      <polygon points="55,14 67,20 67,31 55,37 43,31 43,20" fill="#fbf8f3" />
                    </g>
                  </svg>

                  <div className="grid grid-cols-2 gap-2.5 w-full mt-2">
                    {XTRIKE_SERVER_DEVOPS_CAPABILITIES.serverTopologyNodes.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-xl p-2.5 text-xs"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{n.label}</span>
                          <span className="text-[10px] font-extrabold" style={{ color: "var(--emerald)" }}>
                            {n.status}
                          </span>
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
                          {n.metrics}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7-Checkmark Server Capabilities List */}
                <div className="lg:col-span-7 space-y-3">
                  {XTRIKE_SERVER_DEVOPS_CAPABILITIES.checkmarks.map((line) => (
                    <div
                      key={line}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    >
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--emerald)" }} />
                      <span className="text-xs sm:text-sm font-medium leading-snug">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suite 2: Holistic Network & Zero-Trust Service-Mesh Monitoring (Screenshot 8) */}
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="text-center max-w-3xl mx-auto space-y-2 mb-8">
                <span className="desk-kicker">HOLISTIC NETWORK &amp; ZERO-TRUST FABRIC</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-editorial">
                  {XTRIKE_NETWORK_MONITORING_DOMAINS.title}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {XTRIKE_NETWORK_MONITORING_DOMAINS.leadParagraph}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Isometric Network Cube (Router, Switch, Wireless AP, Firewall) */}
                <div className="lg:col-span-5 flex justify-center">
                  <svg viewBox="0 0 360 300" className="w-full max-w-[340px] h-auto">
                    {/* Isometric Cube Background Walls */}
                    <polygon points="180,20 330,95 180,170 30,95" fill="#ece5d8" />
                    <polygon points="30,95 180,170 180,280 30,205" fill="#f3eee4" />
                    <polygon points="330,95 180,170 180,280 330,205" fill="#e2d9c8" />
                    {/* Central XTRIKE Network Core */}
                    <g transform="translate(135, 110)">
                      <polygon points="45,36 85,16 45,-4 5,16" fill="#408a67" />
                      <polygon points="5,16 45,36 45,76 5,56" fill="#2d6a4f" />
                      <polygon points="85,16 45,36 45,76 85,56" fill="#1f1b18" />
                    </g>
                    {/* Wireless Router with Dual Antennas (Left) */}
                    <g transform="translate(55, 150)">
                      <line x1="20" y1="20" x2="20" y2="-18" stroke="#1f1b18" strokeWidth="3.5" />
                      <line x1="62" y1="20" x2="62" y2="-12" stroke="#1f1b18" strokeWidth="3.5" />
                      <polygon points="40,38 76,20 40,2 4,20" fill="#68b684" />
                      <polygon points="4,20 40,38 40,52 4,34" fill="#2d6a4f" />
                      <polygon points="76,20 40,38 40,52 76,34" fill="#1f1b18" />
                    </g>
                    {/* Firewall Wall Shield (Right) */}
                    <g transform="translate(230, 115)">
                      <polygon points="0,15 45,38 45,82 0,58" fill="#1f1b18" />
                      <polygon points="0,15 10,10 55,33 45,38" fill="#8b4528" />
                      <circle cx="22" cy="48" r="11" fill="#e6b89c" />
                    </g>
                    {/* Bottom Managed Switch */}
                    <g transform="translate(145, 205)">
                      <polygon points="40,32 76,14 40,-4 4,14" fill="#68b684" />
                      <polygon points="4,14 40,32 40,46 4,28" fill="#2d6a4f" />
                      <polygon points="76,14 40,32 40,46 76,28" fill="#1f1b18" />
                    </g>
                  </svg>
                </div>

                {/* 3 Network Domains (Switches & Routers, Wireless, Firewalls) */}
                <div className="lg:col-span-7 space-y-4">
                  {XTRIKE_NETWORK_MONITORING_DOMAINS.domains.map((dom) => (
                    <div
                      key={dom.category}
                      className="rounded-xl p-4 space-y-2.5"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 inline-block"
                            style={{
                              background: "var(--accent)",
                              clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                            }}
                          />
                          <h3 className="text-sm sm:text-base font-bold">{dom.category}</h3>
                        </div>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                          style={{ background: "rgba(45, 106, 79, 0.12)", color: "var(--emerald)" }}
                        >
                          {dom.liveStat}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                        {dom.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dom.vendors.map((v) => (
                          <span
                            key={v}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suite 3: Complete Database & Query Security Monitoring with XTRIKE (Screenshot 9) */}
            <div
              className="rounded-2xl p-6 sm:p-8 space-y-6"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <span className="desk-kicker">DATABASE &amp; QUERY PARAMETERIZATION TELEMETRY</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-editorial">
                  {XTRIKE_DATABASE_MONITORING_CAPABILITIES.title}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {XTRIKE_DATABASE_MONITORING_CAPABILITIES.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Isometric Database Cluster Illustration */}
                <div className="lg:col-span-5 flex justify-center">
                  <svg viewBox="0 0 360 270" className="w-full max-w-[340px] h-auto">
                    <polygon points="180,15 330,90 180,165 30,90" fill="#ece5d8" />
                    <polygon points="30,90 180,165 180,260 30,185" fill="#f3eee4" />
                    <polygon points="330,90 180,165 180,260 330,185" fill="#e2d9c8" />
                    {/* Left XTRIKE Agent Cube */}
                    <g transform="translate(55, 145)">
                      <polygon points="40,32 76,14 40,-4 4,14" fill="#408a67" />
                      <polygon points="4,14 40,32 40,70 4,52" fill="#2d6a4f" />
                      <polygon points="76,14 40,32 40,70 76,52" fill="#1f1b18" />
                    </g>
                    {/* Right 3-Cylinder Database Cluster */}
                    <g transform="translate(175, 115)">
                      {/* Large DB Cylinder */}
                      <ellipse cx="40" cy="75" rx="30" ry="14" fill="#1f1b18" />
                      <rect x="10" y="25" width="60" height="50" fill="#332b25" />
                      <ellipse cx="40" cy="25" rx="30" ry="14" fill="#e6b89c" />
                      {/* Medium DB Cylinder */}
                      <ellipse cx="88" cy="85" rx="24" ry="11" fill="#1b3a2b" />
                      <rect x="64" y="45" width="48" height="40" fill="#2d6a4f" />
                      <ellipse cx="88" cy="45" rx="24" ry="11" fill="#68b684" />
                    </g>
                  </svg>
                </div>

                {/* 6-Checkmark Database Capabilities */}
                <div className="lg:col-span-7 space-y-2.5">
                  {XTRIKE_DATABASE_MONITORING_CAPABILITIES.checkmarks.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    >
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--emerald)" }} />
                      <span className="text-xs sm:text-sm font-medium leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monitored Database Fleet Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {XTRIKE_DATABASE_MONITORING_CAPABILITIES.engines.map((db) => (
                  <div
                    key={db.name}
                    className="rounded-xl p-3.5 space-y-1.5"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{db.name}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-extrabold"
                        style={{ background: "rgba(45, 106, 79, 0.14)", color: "var(--emerald)" }}
                      >
                        {db.state} · Cache {db.cacheHitRatio}
                      </span>
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                      {db.role} &middot; Volume: <strong>{db.sizeLabel}</strong>
                    </div>
                    <div className="text-[11px] font-mono" style={{ color: "var(--accent)" }}>
                      Guard: {db.queryGuard}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

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
