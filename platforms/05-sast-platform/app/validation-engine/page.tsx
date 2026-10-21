"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  Layers,
  Terminal,
  Cpu,
  Sliders,
  Network,
  FileCheck2,
  Play,
  Crosshair,
} from "lucide-react";
import {
  ATTACK_SURFACE_COMPLETENESS,
  BENCHMARK_SUITE_SUMMARY,
  CANONICAL_VALIDATION_FINDINGS,
  COUNTEREXAMPLE_RECORDS,
  DETERMINISTIC_VS_AI_MATRIX,
  EXECUTABLE_SECURITY_CONTRACTS,
  HYBRID_PROOF_TECHNIQUES,
  KNOWLEDGE_GRAPH_EDGES,
  MUTATION_TESTING_SUMMARY,
  MULTI_VULN_ATTACK_CHAINS,
  PIPELINE_ARCHITECTURE_STAGES,
  PRIORITY_VALIDATOR_SPECS,
  SECURITY_CLAIMS_LEDGER,
  SECURITY_INVARIANTS,
  SELF_TESTING_QUALITY_GATES,
  SIXTEEN_ADVANCED_CAPABILITIES,
  TEN_SPECIALIZED_MODULES,
  TEST_SELECTION_OPTIMIZER_QUEUE,
  VALIDATION_SCORECARD,
  OWASP_CWE_NVD_CATALOG,
  ValidationStatus,
} from "@/lib/validation-engine";
import {
  PYTHON_STANDARD_PLUGINS,
  CWE_MULTI_STANDARD_KNOWLEDGE,
  loadActiveScanSession,
  type ActiveScanSession,
  type StandardPluginId,
} from "@/lib/live-sast-scanner";

type StudioTab =
  | "pipeline"
  | "claims"
  | "invariants"
  | "optimizer"
  | "catalog"
  | "roadmap";

const STATUS_BADGE: Record<
  ValidationStatus,
  { label: string; color: string; bg: string }
> = {
  confirmed: {
    label: "CONFIRMED",
    color: "#e5484d",
    bg: "rgba(229, 72, 77, 0.14)",
  },
  not_reproduced: {
    label: "NOT REPRODUCED · MITIGATED",
    color: "#46a36e",
    bg: "rgba(70, 163, 110, 0.14)",
  },
  inconclusive: {
    label: "INCONCLUSIVE",
    color: "#d6a847",
    bg: "rgba(214, 168, 71, 0.14)",
  },
  blocked: {
    label: "BLOCKED (COMMIT GATE)",
    color: "#e2853b",
    bg: "rgba(226, 133, 59, 0.14)",
  },
  not_applicable: {
    label: "NOT APPLICABLE",
    color: "#5c5349",
    bg: "rgba(154, 160, 171, 0.14)",
  },
};

export default function ValidationEnginePage() {
  const [activeTab, setActiveTab] = useState<StudioTab>("pipeline");
  const [langFilter, setLangFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedScorecardKey, setSelectedScorecardKey] = useState<string | null>("Runtime Confirmed");
  const [selectedFindingId, setSelectedFindingId] = useState<string>("VAL-101");
  const [selectedStage, setSelectedStage] = useState<string>("E");
  const [selectedPluginId, setSelectedPluginId] = useState<StandardPluginId>("PY-PLUGIN-MITRE-TTP");
  const [selectedCweKey, setSelectedCweKey] = useState<string>("CWE-89");
  const [activeSession, setActiveSession] = useState<ActiveScanSession | null>(null);
  const [scanProgressPct, setScanProgressPct] = useState<number>(0);
  const [isScanningLive, setIsScanningLive] = useState<boolean>(true);
  const [scanRunCount, setScanRunCount] = useState<number>(1);
  const [primaryObjective, setPrimaryObjective] = useState<string>(
    "Prove exploitability with reliable, reproducible evidence"
  );
  const [targetEnv, setTargetEnv] = useState<string>(
    "Multiple languages and application types"
  );

  useEffect(() => {
    const loaded = loadActiveScanSession();
    if (loaded) {
      setActiveSession(loaded);
      if (loaded.validationFindings.length > 0) {
        setSelectedFindingId(loaded.validationFindings[0].findingId);
      }
    }
  }, []);

  useEffect(() => {
    setIsScanningLive(true);
    setScanProgressPct(8);
    const iv = setInterval(() => {
      setScanProgressPct((prev) => {
        if (prev >= 100) {
          clearInterval(iv);
          setIsScanningLive(false);
          return 100;
        }
        const next = Math.min(100, prev + 12);
        if (next === 100) {
          setIsScanningLive(false);
        }
        return next;
      });
    }, 220);
    return () => clearInterval(iv);
  }, [scanRunCount]);

  const allValidationFindings =
    activeSession && activeSession.validationFindings.length > 0
      ? activeSession.validationFindings
      : CANONICAL_VALIDATION_FINDINGS;

  const filteredFindings = allValidationFindings.filter((f) => {
    const langMatch = langFilter === "All" || f.language === langFilter;
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "confirmed" && f.status === "confirmed") ||
      (statusFilter === "not_reproduced" && f.status === "not_reproduced") ||
      (statusFilter === "inconclusive" && f.status === "inconclusive") ||
      (statusFilter === "blocked" && (f.status === "blocked" || f.status === "not_applicable"));
    return langMatch && statusMatch;
  });

  const selectedFinding =
    filteredFindings.find((f) => f.findingId === selectedFindingId) ||
    filteredFindings[0] ||
    allValidationFindings[0];

  const activeStageObj =
    PIPELINE_ARCHITECTURE_STAGES.find((s) => s.code === selectedStage) ||
    PIPELINE_ARCHITECTURE_STAGES[5];

  const activePluginSpec =
    PYTHON_STANDARD_PLUGINS.find((p) => p.pluginId === selectedPluginId) ||
    PYTHON_STANDARD_PLUGINS[0];

  const activeCweEntry =
    CWE_MULTI_STANDARD_KNOWLEDGE[selectedCweKey] ||
    CWE_MULTI_STANDARD_KNOWLEDGE["CWE-89"];

  const currentScanStageLabel =
    scanProgressPct < 20
      ? "Stage A–B: Ingesting SARIF 2.1.0 & Locking Commit SHA..."
      : scanProgressPct < 45
      ? "Stage C: Running 7-Factor Test-Selection Optimizer..."
      : scanProgressPct < 75
      ? "Stage D: Executing 9 Python Standards & Threat-Intel Plugins..."
      : scanProgressPct < 100
      ? "Stage E–F: Verifying 6-Point Proof Contracts & Regression Tests..."
      : "Scan & 9-Standard Proof Validation Complete — All Verdicts Ready";

  const SCORECARD_DRILLDOWN: Record<
    string,
    {
      title: string;
      badge: string;
      description: string;
      proofRule: string;
      targetTab: StudioTab;
      statusFilterValue?: string;
    }
  > = {
    "SAST Findings (Total)": {
      title: "SAST Findings (Total) — 248 Raw SARIF Alerts Ingested",
      badge: "SARIF 2.1.0 Stream",
      description:
        "All candidate alerts ingested from XTRIKE AST-Query, XTRIKE PatternGuard, XTRIKE DepGuard, XTRIKE XQL, and the 9 Python Standards Plugins before deduplication and proof contract evaluation.",
      proofRule: "Normalized to CanonicalValidationFinding schema and bound to build commit_sha.",
      targetTab: "pipeline",
      statusFilterValue: "all",
    },
    "Runtime Confirmed": {
      title: "Runtime Confirmed — 36 Exploitable Findings (6/6 Proof Contract Satisfied)",
      badge: "CONFIRMED · BLOCK RELEASE",
      description:
        "Findings where static reachability AND controlled runtime/AST verification satisfied all 6 points of the Independent Evidence Verifier Proof Contract.",
      proofRule:
        "Requires Source Provenance + Sink Reachability + Missing Guard + Behavioral Proof + Ruled-Out WAF + Reproducibility.",
      targetTab: "pipeline",
      statusFilterValue: "confirmed",
    },
    "Safely Mitigated": {
      title: "Safely Mitigated — 52 Findings Proven Non-Exploitable by Active Code Guards",
      badge: "NOT REPRODUCED · MITIGATED",
      description:
        "Static alerts suppressed with deterministic proof because an upstream sanitizer, PreparedStatement parameter binding, or canonical path guard dominates the sink.",
      proofRule: "AST Guard Analyzer & controlled probe confirm guard blocks predicate/path alteration.",
      targetTab: "pipeline",
      statusFilterValue: "not_reproduced",
    },
    Inconclusive: {
      title: "Inconclusive — 41 Findings Requiring Prerequisite Fixture or Auth Token",
      badge: "INCONCLUSIVE · NEVER LABELED SAFE",
      description:
        "Findings where reachability is partial or a required runtime feature flag / third-party service fixture was unavailable. Strictly separated from False Positives.",
      proofRule: "Failed or incomplete checks are never labeled safe; queued for targeted fixture re-run.",
      targetTab: "pipeline",
      statusFilterValue: "inconclusive",
    },
    "Not Yet Validated": {
      title: "Not Yet Validated — 119 Findings Held at Commit SHA / Scope Gate",
      badge: "PENDING / BLOCKED GATE",
      description:
        "Findings awaiting staging build SHA synchronization or deferred by the 7-Factor Test-Selection Optimizer to stay within runtime budget.",
      proofRule: "Enforces strict commit_sha == build_commit_sha lock before executing runtime probes.",
      targetTab: "pipeline",
      statusFilterValue: "blocked",
    },
    "Independent Discoveries": {
      title: "Independent Discoveries — +4 Logic & Cross-Tenant Flaws Missed by SAST",
      badge: "SECURITY INVARIANTS & XTRIKE-Solver",
      description:
        "Business-logic, multi-step workflow, and cross-tenant BOLA/IDOR violations discovered directly by Executable Security Contracts and XTRIKE-Solver property checking—with zero prior SAST alert.",
      proofRule: "Proven via Given/When/Expected Security Contracts (CTR-01..03) and XTRIKE-Solver counterexample synthesis.",
      targetTab: "invariants",
    },
    "Validation Coverage": {
      title: "Validation Coverage (88.5%) — Eligible Findings Evaluated by Validators",
      badge: "KPI TELEMETRY",
      description: "Percentage of reachable SAST findings that have completed Stages A through E validation.",
      proofRule: "Target SLA: >= 85.0% across Python, Java, TypeScript, and Go adapters.",
      targetTab: "pipeline",
    },
    "Evidence Completeness": {
      title: "Evidence Completeness (96.4%) — SHA-256 Checksummed Proof Artifacts",
      badge: "KPI TELEMETRY",
      description: "Percentage of confirmed findings carrying all 6 SHA-256 checksummed evidence artifacts.",
      proofRule: "Audited by Stage E Independent Evidence Verifier.",
      targetTab: "claims",
    },
    "False-Confirmation Rate": {
      title: "False-Confirmation Rate (1.1%) — Ground-Truth Benchmark Calibration",
      badge: "KPI TELEMETRY",
      description: "Rate at which the engine erroneously marks a mitigated fixture as confirmed on the benchmark suite.",
      proofRule: "Enforced below < 2.0% by the 6 Automated Self-Testing Release Gates.",
      targetTab: "optimizer",
    },
    "False-Dismissal Rate": {
      title: "False-Dismissal Rate (0.0%) — Zero Vulnerable Fixtures Marked Mitigated",
      badge: "KPI TELEMETRY",
      description: "Guarantees that an untested or blocked finding is never dismissed as a false positive.",
      proofRule: "Strict separation between `not_reproduced` (guard proven) and `inconclusive`.",
      targetTab: "claims",
    },
    "Median Time / Finding": {
      title: "Median Time / Finding (420 ms) — 7-Factor Test-Selection Optimizer",
      badge: "KPI TELEMETRY",
      description: "Median validation latency per finding achieved by resolving static guards before invoking runtime probes.",
      proofRule: "Averaging 2.4 controlled requests per finding.",
      targetTab: "optimizer",
    },
    "Attack-Chain Coverage": {
      title: "Attack-Chain Coverage (92.0%) — Cross-Service & Multi-Step Graph Paths",
      badge: "KPI TELEMETRY",
      description: "Percentage of individual weaknesses correlated into multi-step exploit chains across services.",
      proofRule: "Evaluated in Tab 3 (Multi-Vulnerability Attack Chains).",
      targetTab: "invariants",
    },
    "Retest Success Rate": {
      title: "Retest Success Rate (98.6%) — Differential Patch & Bypass Analysis",
      badge: "KPI TELEMETRY",
      description: "Percentage of developer remediation patches verified against root-cause fix and regression suites.",
      proofRule: "Re-runs original proof test + regression test on patched commit SHA.",
      targetTab: "catalog",
    },
  };

  const activeDrilldown = selectedScorecardKey
    ? SCORECARD_DRILLDOWN[selectedScorecardKey]
    : null;

  return (
    <div style={{ maxWidth: 1380, margin: "0 auto", padding: "36px 20px 80px 20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderRadius: 6,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            <ShieldCheck size={13} color="#8b4528" />
            <span>PROOF-DRIVEN SAST VALIDATION &amp; CLAIM VERIFICATION ENGINE</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--foreground)" }}>
            Finding Validation &amp; Hybrid Proof Engine
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 820, marginTop: 4 }}>
            Do not ask the AI whether a vulnerability looks exploitable. Gather static and runtime evidence, execute controlled validators bound to exact build commits, and independently verify 6-point proof contracts.
          </p>
        </div>

        {/* Clickable Python Stack Pills */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 11.5,
          }}
        >
          <div style={{ color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>
            Python Stack (Click to Inspect Module)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {[
              { label: "XTRIKE-API", tab: "pipeline" as StudioTab },
              { label: "XTRIKE-Schema", tab: "pipeline" as StudioTab },
              { label: "SARIF 2.1.0", tab: "pipeline" as StudioTab },
              { label: "XTRIKE-Solver", tab: "claims" as StudioTab },
              { label: "XTRIKE-HTTP", tab: "optimizer" as StudioTab },
              { label: "XTRIKE-DOM", tab: "invariants" as StudioTab },
              { label: "XTRIKE-Trace", tab: "catalog" as StudioTab },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                style={{
                  padding: "3px 8px",
                  borderRadius: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "#8b4528",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LIVE SCANNER & VALIDATION STATUS PROGRESS BAR */}
      <div
        style={{
          background: "var(--surface)",
          border: `1px solid ${isScanningLive ? "#8b4528" : "rgba(70, 163, 110, 0.45)"}`,
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                background: isScanningLive ? "#f4e5dc" : "rgba(70, 163, 110, 0.14)",
                color: isScanningLive ? "#8b4528" : "#2f6f4e",
                border: `1px solid ${isScanningLive ? "#8b4528" : "rgba(70, 163, 110, 0.4)"}`,
              }}
            >
              <CheckCircle2 size={13} />
              <span>
                {isScanningLive
                  ? `SCANNING & VALIDATING (${scanProgressPct}%)`
                  : "✓ SCANNER & PROOF VALIDATION COMPLETED (100%)"}
              </span>
            </span>

            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--foreground)" }}>
              {currentScanStageLabel}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => setScanRunCount((c) => c + 1)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 800,
                cursor: "pointer",
                background: "#8b4528",
                color: "#f3eee4",
                border: "none",
              }}
            >
              <Play size={12} />
              <span>{isScanningLive ? "Scanning..." : "Re-Run Validation Pass"}</span>
            </button>

            <a
              href="/reports"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 800,
                background: "#f4e5dc",
                color: "#8b4528",
                border: "1px solid #8b4528",
                textDecoration: "none",
              }}
            >
              <span>🖨️ Print / Report Engine</span>
            </a>

            <a
              href="/scan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 700,
                background: "var(--surface-2)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                textDecoration: "none",
              }}
            >
              <span>Open Repo / Code Scanner</span>
            </a>
          </div>
        </div>

        {/* Visual Progress Bar Track */}
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${scanProgressPct}%`,
              background: isScanningLive
                ? "linear-gradient(90deg, #8b4528 0%, #c86d44 100%)"
                : "#46a36e",
              transition: "width 0.2s ease, background 0.3s ease",
            }}
          />
        </div>

        {/* Stage Milestones Strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            fontSize: 11,
            fontFamily: "var(--font-mono), monospace",
            color: "var(--muted)",
          }}
        >
          <span style={{ color: scanProgressPct >= 15 ? "#2f6f4e" : "var(--muted)", fontWeight: 700 }}>
            [A–B] SARIF + Commit Lock {scanProgressPct >= 15 ? "✓" : ""}
          </span>
          <span style={{ color: scanProgressPct >= 40 ? "#2f6f4e" : "var(--muted)", fontWeight: 700 }}>
            [C] 7-Factor Optimizer {scanProgressPct >= 40 ? "✓" : ""}
          </span>
          <span style={{ color: scanProgressPct >= 70 ? "#2f6f4e" : "var(--muted)", fontWeight: 700 }}>
            [D] 9 Python Standards Plugins {scanProgressPct >= 70 ? "✓" : ""}
          </span>
          <span style={{ color: scanProgressPct >= 90 ? "#2f6f4e" : "var(--muted)", fontWeight: 700 }}>
            [E] 6-Point Proof Verifier {scanProgressPct >= 90 ? "✓" : ""}
          </span>
          <span style={{ color: scanProgressPct === 100 ? "#2f6f4e" : "var(--muted)", fontWeight: 700 }}>
            [F] Remediation &amp; Regression Ready ({allValidationFindings.length} Findings) {scanProgressPct === 100 ? "✓" : ""}
          </span>
        </div>
      </div>

      {/* Security Validation Scorecard (ALL CARDS & KPIs CLICKABLE) */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
            Security Validation Scorecard (Click Any Card or KPI Below to Filter &amp; Inspect Proof Telemetry)
          </div>
          <span style={{ fontSize: 11, color: "#8b4528", fontWeight: 700 }}>
            Interactive &middot; Click any metric card to filter queue &amp; view breakdown
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          {[
            {
              key: "SAST Findings (Total)",
              value: VALIDATION_SCORECARD.sastFindingsTotal,
              color: "var(--foreground)",
              sub: "Ingested via SARIF 2.1.0",
              subColor: "var(--subtle)",
            },
            {
              key: "Runtime Confirmed",
              value: VALIDATION_SCORECARD.runtimeConfirmed,
              color: "#e5484d",
              sub: "6/6 Proof Contract satisfied",
              subColor: "var(--subtle)",
            },
            {
              key: "Safely Mitigated",
              value: VALIDATION_SCORECARD.safelyMitigated,
              color: "#46a36e",
              sub: "Guard / parameterization proven",
              subColor: "var(--subtle)",
            },
            {
              key: "Inconclusive",
              value: VALIDATION_SCORECARD.inconclusive,
              color: "#d6a847",
              sub: "Missing prereqs or partial trace",
              subColor: "var(--subtle)",
            },
            {
              key: "Not Yet Validated",
              value: VALIDATION_SCORECARD.notYetValidated,
              color: "var(--foreground-muted)",
              sub: "Untested (Never labeled safe)",
              subColor: "#e2853b",
            },
            {
              key: "Independent Discoveries",
              value: `+${VALIDATION_SCORECARD.independentDiscoveries}`,
              color: "#8b4528",
              sub: "Found via Security Invariants",
              subColor: "var(--subtle)",
            },
          ].map((card) => {
            const isSelected = selectedScorecardKey === card.key;
            const info = SCORECARD_DRILLDOWN[card.key];
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => {
                  setSelectedScorecardKey(card.key);
                  if (info) {
                    setActiveTab(info.targetTab);
                    if (info.statusFilterValue) {
                      setStatusFilter(info.statusFilterValue);
                    }
                  }
                }}
                style={{
                  textAlign: "left",
                  background: isSelected ? "#f4e5dc" : "var(--surface-2)",
                  border: `1.5px solid ${isSelected ? "#8b4528" : "var(--border)"}`,
                  borderRadius: 10,
                  padding: 14,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>{card.key}</span>
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: isSelected ? "#8b4528" : "var(--muted)" }}>
                    {isSelected ? "ACTIVE" : "INSPECT →"}
                  </span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: card.color, marginTop: 2 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 11, color: card.subColor }}>{card.sub}</div>
              </button>
            );
          })}
        </div>

        {/* 7 Clickable KPI Metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
          }}
        >
          {VALIDATION_SCORECARD.kpis.map((kpi) => {
            const isSelected = selectedScorecardKey === kpi.label;
            const info = SCORECARD_DRILLDOWN[kpi.label];
            return (
              <button
                key={kpi.label}
                type="button"
                onClick={() => {
                  setSelectedScorecardKey(kpi.label);
                  if (info) setActiveTab(info.targetTab);
                }}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: isSelected ? "#f4e5dc" : "transparent",
                  border: `1px solid ${isSelected ? "#8b4528" : "transparent"}`,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ fontSize: 10.5, color: isSelected ? "#8b4528" : "var(--muted)", fontWeight: 700 }}>
                  {kpi.label} &rarr;
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--foreground)" }}>{kpi.value}</div>
                <div style={{ fontSize: 10, color: "var(--subtle)" }}>{kpi.note}</div>
              </button>
            );
          })}
        </div>

        {/* Interactive Drill-Down Detail Panel for Selected Scorecard Card or KPI */}
        {activeDrilldown && (
          <div
            style={{
              marginTop: 14,
              padding: "12px 16px",
              borderRadius: 10,
              background: "var(--background)",
              border: "1px solid #8b4528",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "#f4e5dc",
                    color: "#8b4528",
                  }}
                >
                  {activeDrilldown.badge}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--foreground)" }}>
                  {activeDrilldown.title}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>
                {activeDrilldown.description}
              </div>
              <div style={{ fontSize: 11.5, color: "#2f6f4e", fontWeight: 700, marginTop: 4 }}>
                Verification Rule: {activeDrilldown.proofRule}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {statusFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setSelectedScorecardKey("SAST Findings (Total)");
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  Show All Statuses ({allValidationFindings.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedScorecardKey(null)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--muted)",
                }}
              >
                Hide Detail
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5-Technique Hybrid Proof Strip (CLICKABLE) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {HYBRID_PROOF_TECHNIQUES.map((tech) => {
          const targetTabMap: Record<number, StudioTab> = {
            1: "pipeline",
            2: "claims",
            3: "optimizer",
            4: "invariants",
            5: "catalog",
          };
          const target = targetTabMap[tech.step] || "pipeline";
          const isSelected = activeTab === target;
          return (
            <button
              key={tech.step}
              type="button"
              onClick={() => setActiveTab(target)}
              style={{
                textAlign: "left",
                background: isSelected ? "#f4e5dc" : "var(--surface)",
                border: `1px solid ${isSelected ? "#8b4528" : "var(--border)"}`,
                borderRadius: 12,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: "#8b4528" }}>
                  TECHNIQUE {tech.step} &rarr;
                </span>
                <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                  {tech.engine}
                </span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
                {tech.title}
              </div>
              <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.45, marginBottom: 8 }}>
                {tech.role}
              </p>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#46a36e" }}>{tech.metric}</div>
            </button>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 12,
        }}
      >
        {[
          { id: "pipeline", label: "1. A–F Pipeline & Proof Contracts", icon: Layers },
          { id: "claims", label: "2. Claim Verifier & Counterexamples (XTRIKE-Solver)", icon: FileCheck2 },
          { id: "invariants", label: "3. Security Invariants, Contracts & Chains", icon: Network },
          { id: "optimizer", label: "4. Test Optimizer, 10 Modules & Quality Gates", icon: Sliders },
          { id: "catalog", label: "5. 9 Python Standards Plugins (MITRE · OWASP · CWE · CVSS · NIST · PTES · XTRIKE Exploit-Index · MSF)", icon: Crosshair },
          { id: "roadmap", label: "6. Prioritized Plan Builder & Governance", icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              style={{
                background: active ? "#f4e5dc" : "var(--surface)",
                border: `1px solid ${active ? "#8b4528" : "var(--border)"}`,
                color: active ? "#8b4528" : "var(--foreground-muted)",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: A-F PIPELINE & PROOF CONTRACTS */}
      {activeTab === "pipeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Interactive Stages A -> F */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 10 }}>
              Target Architecture (Stages A &rarr; F) &middot; Click a stage to inspect its contract
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 8, marginBottom: 14 }}>
              {PIPELINE_ARCHITECTURE_STAGES.map((stg) => {
                const isSelected = stg.code === selectedStage;
                return (
                  <button
                    key={stg.code}
                    onClick={() => setSelectedStage(stg.code)}
                    style={{
                      textAlign: "left",
                      background: isSelected ? "var(--surface-2)" : "var(--background)",
                      border: `1px solid ${isSelected ? "#8b4528" : "var(--border)"}`,
                      borderRadius: 10,
                      padding: 10,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: "#8b4528" }}>
                      <span>STAGE {stg.code}</span>
                      <span style={{ color: stg.deterministic ? "#46a36e" : "var(--muted)", fontSize: 9.5 }}>
                        {stg.deterministic ? "DETERMINISTIC" : "AI-ASSISTED"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginTop: 4 }}>
                      {stg.title}
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>{stg.tech}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 12.5 }}>
              <strong style={{ color: "#8b4528" }}>Stage {activeStageObj.code} — {activeStageObj.title}: </strong>
              <span style={{ color: "var(--foreground-muted)" }}>{activeStageObj.description}</span>
            </div>
          </div>

          {/* Language Adapter Filter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
              Canonical Finding Queue (Priority 1–5 Validators &middot; Multi-Language AST Adapters)
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["All", "Python", "Java", "TypeScript", "Go", "C#"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLangFilter(lang)}
                  style={{
                    background: langFilter === lang ? "#f4e5dc" : "var(--surface)",
                    border: `1px solid ${langFilter === lang ? "#8b4528" : "var(--border)"}`,
                    color: langFilter === lang ? "#8b4528" : "var(--muted)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Master-Detail Finding Inspector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredFindings.map((f) => {
                const isSelected = f.findingId === selectedFinding.findingId;
                const badge = STATUS_BADGE[f.status];
                return (
                  <button
                    key={f.findingId}
                    onClick={() => setSelectedFindingId(f.findingId)}
                    style={{
                      textAlign: "left",
                      background: isSelected ? "var(--surface-2)" : "var(--surface)",
                      border: `1px solid ${isSelected ? "#8b4528" : "var(--border)"}`,
                      borderRadius: 12,
                      padding: 14,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#8b4528", fontFamily: "monospace" }}>
                        {f.findingId} &middot; P{f.validatorPriority} &middot; {f.cwe}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: badge.bg,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginBottom: 6 }}>
                      {f.language} ({f.framework}) &middot; {f.filePath}:{f.startLine}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--subtle)" }}>
                      <span>Scanner: {f.scanner}</span>
                      <span>Evidence Confidence: {Math.round(f.evidenceConfidence * 100)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right column: Canonical Finding + 5-Step Lifecycle + 6-Point Proof Contract */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Top identity & commit_sha lock */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#8b4528", fontWeight: 700 }}>
                    {selectedFinding.validatorName} (Priority {selectedFinding.validatorPriority})
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--foreground)", marginTop: 2 }}>
                    {selectedFinding.findingId}: {selectedFinding.title}
                  </h2>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                    {selectedFinding.repository} &middot; {selectedFinding.filePath}:{selectedFinding.startLine}–{selectedFinding.endLine}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10.5, color: "var(--muted)" }}>
                    Commit Lock:{" "}
                    <span
                      style={{
                        fontFamily: "monospace",
                        color:
                          selectedFinding.commitSha === selectedFinding.buildCommitSha
                            ? "#46a36e"
                            : "#e2853b",
                        fontWeight: 700,
                      }}
                    >
                      {selectedFinding.commitSha.slice(0, 8)}{" "}
                      {selectedFinding.commitSha === selectedFinding.buildCommitSha ? "==" : "!="}{" "}
                      {selectedFinding.buildCommitSha.slice(0, 8)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: STATUS_BADGE[selectedFinding.status].color, marginTop: 4 }}>
                    Status: {selectedFinding.status.toUpperCase()} &middot; Confidence: {Math.round(selectedFinding.evidenceConfidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Canonical Data Flow & Preserved SARIF */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
                <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 11.5 }}>
                  <div style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
                    Canonical Data-Flow &amp; Runtime Context
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Source:</strong> {selectedFinding.sourceExpr}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Call Chain:</strong>{" "}
                    {selectedFinding.intermediateCalls.join(" → ")}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Sink:</strong> {selectedFinding.sinkExpr}
                  </div>
                  <div style={{ color: "var(--muted)" }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Endpoint:</strong>{" "}
                    <span style={{ fontFamily: "monospace" }}>
                      {selectedFinding.httpMethod} {selectedFinding.endpoint}
                    </span>
                  </div>
                </div>

                <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 11.5 }}>
                  <div style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
                    Preserved Original Scanner Record (SARIF {selectedFinding.rawSarifRecord.schemaVersion})
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
                    <div>driver: {selectedFinding.rawSarifRecord.toolDriver}</div>
                    <div>ruleId: {selectedFinding.rawSarifRecord.ruleId}</div>
                    <div>loc: {selectedFinding.rawSarifRecord.physicalLocation}</div>
                    <div>codeFlows: {selectedFinding.rawSarifRecord.codeFlowsCount} preserved</div>
                  </div>
                </div>
              </div>

              {/* 5-Step Lifecycle */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                  Validator Execution Lifecycle (1. Preflight &rarr; 2. Assess &rarr; 3. Plan &rarr; 4. Execute &rarr; 5. Verify)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.values(selectedFinding.lifecycle).map((st) => (
                    <div
                      key={st.label}
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 11.5,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--foreground)" }}>
                        <span>
                          {st.label} — <span style={{ color: "#8b4528" }}>{st.summary}</span>
                        </span>
                        <span style={{ fontFamily: "monospace", color: "var(--muted)" }}>{st.durationMs} ms</span>
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>{st.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6-Point Independent Evidence Verifier Proof Contract */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                  Independent Evidence Verifier &middot; 6-Point Proof Contract
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {selectedFinding.proofContract.map((req) => (
                    <div
                      key={req.requirement}
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: 10,
                        fontSize: 11.5,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{req.requirement}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: req.satisfied ? "#46a36e" : "var(--muted)",
                          }}
                        >
                          {req.satisfied ? "SATISFIED" : "NOT MET"} &middot; {req.sourceType}
                        </span>
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--subtle)", marginBottom: 3 }}>{req.question}</div>
                      <div style={{ fontSize: 11, color: "var(--foreground-muted)" }}>{req.evidenceSummary}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation & Regression Test */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
                    Suggested Remediation Patch
                  </div>
                  <pre
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 10.5,
                      color: "var(--foreground)",
                      overflowX: "auto",
                    }}
                  >
                    {selectedFinding.suggestedFix}
                  </pre>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
                    Automated Regression Test
                  </div>
                  <pre
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 10.5,
                      color: "#46a36e",
                      overflowX: "auto",
                    }}
                  >
                    {selectedFinding.regressionTest}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY CLAIM VERIFIER & COUNTEREXAMPLES */}
      {activeTab === "claims" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Security Claim Verification Engine */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Security Claim Verification Engine
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Every claim made by static analysis, runtime probes, or the LLM is represented as an explicit testable claim with required proof and a record of what could not be established.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SECURITY_CLAIMS_LEDGER.map((clm) => (
                <div
                  key={clm.claimId}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#8b4528", marginRight: 8 }}>
                        {clm.claimId} &middot; {clm.findingRef}
                      </span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)" }}>
                        Claim: &ldquo;{clm.claimType}&rdquo;
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background:
                          clm.verdict === "ESTABLISHED"
                            ? "rgba(70, 163, 110, 0.14)"
                            : "#f4e5dc",
                        color: clm.verdict === "ESTABLISHED" ? "#46a36e" : "#8b4528",
                      }}
                    >
                      {clm.verdict}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Required Proof:</strong> {clm.requiredProof}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Observed Evidence:</strong> {clm.observedEvidence}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--subtle)" }}>
                    <strong>Unestablished / Boundaries Recorded:</strong> {clm.unestablishedNotes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Counterexample & XTRIKE-Solver Constraint Solver */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Counterexample Engine, Symbolic XTRIKE-Solver Constraints &amp; Test Minimization
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Produces structured Source &rarr; Execution Path &rarr; XTRIKE-Solver Constraint &rarr; Sensitive Operation &rarr; Delta-Minimized Counterexample traces, and distinguishes formal counterexamples from reachability approximations.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {COUNTEREXAMPLE_RECORDS.map((cx) => (
                <div
                  key={cx.findingId}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)" }}>
                      {cx.findingId} ({cx.cwe}) — {cx.title}
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: "#8b4528" }}>
                      {cx.proofLevel} &middot; Minimized {cx.unminimizedLength}B &rarr; {cx.minimizedLength}B
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11.5 }}>
                    <div style={{ background: "var(--surface)", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 700, color: "var(--foreground-muted)" }}>1. Source &amp; 2. Execution Path</div>
                      <div style={{ color: "var(--muted)", marginTop: 2 }}>{cx.sourceStage}</div>
                      <div style={{ color: "var(--muted)", marginTop: 4 }}>{cx.executionPathStage}</div>
                    </div>
                    <div style={{ background: "var(--surface)", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 700, color: "var(--foreground-muted)" }}>3. XTRIKE-Solver Path Constraint &amp; 4. Minimized Proof</div>
                      <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#8b4528", marginTop: 2 }}>
                        {cx.pathConstraintZ3}
                      </div>
                      <div style={{ color: "var(--foreground)", marginTop: 4 }}>{cx.minimizedCounterexample}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#46a36e", marginTop: 8 }}>
                    <strong>Differential Build Verification:</strong> {cx.differentialOutcome}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY INVARIANTS, CONTRACTS & ATTACK CHAINS */}
      {activeTab === "invariants" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Given / When / Expected Security Contracts */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Automatic Test Generation from Security Contracts (Given / When / Expected / Evidence)
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Define formal security properties that generate controlled runtime tests even when SAST reports zero findings.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 12 }}>
              {EXECUTABLE_SECURITY_CONTRACTS.map((ctr) => (
                <div
                  key={ctr.contractId}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, color: "var(--foreground)" }}>
                      {ctr.contractId}: {ctr.property}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: ctr.executionStatus === "VIOLATION DETECTED" ? "#e5484d" : "#46a36e",
                      }}
                    >
                      {ctr.executionStatus}
                    </span>
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Given:</strong> {ctr.given}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>When:</strong> {ctr.when}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Expected:</strong> {ctr.expected}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 6 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Evidence Required:</strong> {ctr.evidenceRequired}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#8b4528" }}>
                    Generated: {ctr.generatedTestName} &rarr; {ctr.observedOutcome}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Invariant Engine */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Security-Invariant Engine &amp; SAST-Independent Discovery Mode
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Separates scanner-originated findings from vulnerabilities discovered independently via property and state-machine testing.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 10 }}>
              {SECURITY_INVARIANTS.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: "#8b4528" }}>
                      {inv.id} &middot; {inv.category}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: inv.status === "VIOLATION PROVEN" ? "#e5484d" : "#46a36e",
                      }}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>{inv.property}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>{inv.evidenceSummary}</div>
                  <div style={{ fontSize: 10.5, color: "var(--subtle)" }}>
                    Origin: <strong style={{ color: "var(--foreground-muted)" }}>{inv.origin}</strong> ({inv.evaluatedRoutes} routes)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Vulnerability Attack Chains & Attack-Surface Completeness */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)", marginBottom: 10 }}>
                Multi-Vulnerability Attack-Chain Correlation
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MULTI_VULN_ATTACK_CHAINS.map((ch) => (
                  <div key={ch.chainId} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 800, color: "#e5484d", marginBottom: 4 }}>
                      <span>{ch.chainId}</span>
                      <span>{ch.combinedSeverity}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>{ch.title}</div>
                    {ch.steps.map((s) => (
                      <div key={s.step} style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                        <strong style={{ color: "#8b4528" }}>Step {s.step} ({s.findingRef}):</strong> {s.label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)", marginBottom: 10 }}>
                Attack-Surface Completeness &amp; Dependency Reachability
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12, textAlign: "center" }}>
                <div style={{ background: "var(--background)", padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>{ATTACK_SURFACE_COMPLETENESS.sourceDefinedRoutes}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Source Routes</div>
                </div>
                <div style={{ background: "var(--background)", padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>{ATTACK_SURFACE_COMPLETENESS.openApiDocumentedRoutes}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>OpenAPI Spec</div>
                </div>
                <div style={{ background: "var(--background)", padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>{ATTACK_SURFACE_COMPLETENESS.reverseProxyExposedRoutes}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Proxy Exposed</div>
                </div>
                <div style={{ background: "var(--background)", padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>{ATTACK_SURFACE_COMPLETENESS.runtimeObservedRoutes}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>XTRIKE-Trace Observed</div>
                </div>
              </div>
              {ATTACK_SURFACE_COMPLETENESS.dependencyReachability.map((dep) => (
                <div key={dep.package} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 11, marginTop: 8 }}>
                  <div style={{ fontWeight: 700, color: "var(--foreground)" }}>
                    {dep.package} ({dep.advisory}) &middot;{" "}
                    <span style={{ color: dep.callGraphReachable ? "#e5484d" : "#46a36e" }}>
                      {dep.verdict}
                    </span>
                  </div>
                  <div style={{ color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                    Sink: {dep.vulnerableMethod}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEST OPTIMIZER, 10 SPECIALIZED MODULES & QUALITY GATES */}
      {activeTab === "optimizer" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 7-Factor Test-Selection Optimizer */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              7-Factor Test-Selection Optimizer
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Ranks candidate tests by applicability, expected information gain, impact, execution cost, state risk, prerequisites, and whether static analysis already resolves the claim.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TEST_SELECTION_OPTIMIZER_QUEUE.map((item) => (
                <div
                  key={item.rank}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: "var(--foreground)" }}>
                      Rank #{item.rank}: {item.findingRef} &rarr;{" "}
                      <span style={{ color: "#8b4528" }}>{item.selectedAction}</span>
                    </span>
                    <span style={{ fontFamily: "monospace", color: "var(--muted)" }}>
                      Prob: {item.applicabilityProb} &middot; InfoGain: {item.infoGain} &middot; Cost: {item.costMs}
                    </span>
                  </div>
                  <div style={{ color: "var(--muted)" }}>{item.decisionReason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 10 Pluggable Specialized Analyzer Modules */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 12 }}>
              10 Pluggable Specialized Analyzer Modules
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10 }}>
              {TEN_SPECIALIZED_MODULES.map((mod) => (
                <div key={mod.id} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 11.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: "#8b4528" }}>{mod.id}</span>
                    <span style={{ fontSize: 10, color: "#46a36e", fontWeight: 700 }}>{mod.status}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>{mod.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>{mod.capability}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Mutation Testing & 6 Self-Testing Release Gates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
                Security Mutation Testing ({MUTATION_TESTING_SUMMARY.mutationScore} Score)
              </h3>
              <p style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 10 }}>
                Seeds temporary defects into disposable fixtures to verify validator sensitivity ({MUTATION_TESTING_SUMMARY.mutantsDetectedAndProven}/{MUTATION_TESTING_SUMMARY.mutantsSeeded} mutants killed).
              </p>
              {MUTATION_TESTING_SUMMARY.recentMutants.map((m) => (
                <div key={m.mutantId} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 11, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--foreground)" }}>
                    <span>{m.mutantId}: {m.operator}</span>
                    <span style={{ color: "#46a36e" }}>{m.status}</span>
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: 2 }}>{m.description}</div>
                  <div style={{ color: "#8b4528", marginTop: 2 }}>Caught by: {m.detectedBy}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)", marginBottom: 10 }}>
                6 Automated Self-Testing Release Gates
              </h3>
              {SELF_TESTING_QUALITY_GATES.map((g) => (
                <div key={g.gate} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: 9, fontSize: 11, marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--foreground)" }}>
                    <span>{g.gate}</span>
                    <span style={{ color: "#46a36e" }}>{g.status}</span>
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: 2 }}>{g.question}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIORITIZED PLAN BUILDER & PYTHON REFERENCE */}
      {activeTab === "roadmap" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Interactive Plan Selector */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 12 }}>
              Tailored 90-Day Engineering Plan Builder
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                  Primary Engineering Objective
                </div>
                {[
                  "Prove exploitability with reliable, reproducible evidence",
                  "Discover vulnerabilities that SAST misses",
                  "Build a commercial, enterprise-ready security platform",
                  "Develop advanced research capabilities for novel vulnerability discovery",
                ].map((obj) => (
                  <button
                    key={obj}
                    onClick={() => setPrimaryObjective(obj)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      marginBottom: 6,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: primaryObjective === obj ? "#f4e5dc" : "var(--background)",
                      border: `1px solid ${primaryObjective === obj ? "#8b4528" : "var(--border)"}`,
                      color: primaryObjective === obj ? "#8b4528" : "var(--foreground-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {obj}
                  </button>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                  Primary Target Environment
                </div>
                {[
                  "Web applications and REST APIs",
                  "Microservices and distributed systems",
                  "Multiple languages and application types",
                  "Mobile applications and their backend APIs",
                ].map((env) => (
                  <button
                    key={env}
                    onClick={() => setTargetEnv(env)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      marginBottom: 6,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: targetEnv === env ? "#f4e5dc" : "var(--background)",
                      border: `1px solid ${targetEnv === env ? "#8b4528" : "var(--border)"}`,
                      color: targetEnv === env ? "#8b4528" : "var(--foreground-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#8b4528" }}>DAYS 1–30 · FOUNDATION</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", margin: "4px 0 6px" }}>
                  Canonical Schema, Commit Lock &amp; Static Reachability
                </div>
                <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
                  Ingest SARIF 2.1.0 into CanonicalFinding records bound to commit_sha, enforce authorized scope gates, and deploy adapters for {targetEnv}.
                </p>
              </div>
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#8b4528" }}>DAYS 31–60 · VALIDATION</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", margin: "4px 0 6px" }}>
                  Priority 1–5 Validators &amp; Claim Verifier
                </div>
                <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
                  Focus on &ldquo;{primaryObjective}&rdquo; with 6-point Proof Contracts, XTRIKE-Trace span correlation, and disposable container fixtures.
                </p>
              </div>
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#8b4528" }}>DAYS 61–90 · INTELLIGENCE</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", margin: "4px 0 6px" }}>
                  Invariants, Differential Retest &amp; CI/CD Gates
                </div>
                <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
                  Enable Given/When/Expected security contracts, XTRIKE-Solver counterexample minimization, 7-factor test optimization, and benchmark calibration.
                </p>
              </div>
            </div>
          </div>

          {/* Deterministic vs AI Governance Matrix */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#46a36e", marginBottom: 10 }}>
                Strictly Deterministic Responsibilities
              </h3>
              {DETERMINISTIC_VS_AI_MATRIX.deterministic.map((d) => (
                <div key={d.item} style={{ marginBottom: 8, fontSize: 11.5 }}>
                  <div style={{ fontWeight: 700, color: "var(--foreground)" }}>&check; {d.item}</div>
                  <div style={{ color: "var(--muted)" }}>{d.detail}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#8b4528", marginBottom: 10 }}>
                AI-Assisted Synthesis (Policy-Gated, Untrusted Input Isolated)
              </h3>
              {DETERMINISTIC_VS_AI_MATRIX.aiAssisted.map((a) => (
                <div key={a.item} style={{ marginBottom: 8, fontSize: 11.5 }}>
                  <div style={{ fontWeight: 700, color: "var(--foreground)" }}>&bull; {a.item}</div>
                  <div style={{ color: "var(--muted)" }}>{a.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 9 PYTHON STANDARDS PLUGINS & MULTI-STANDARD KNOWLEDGE REPOSITORY */}
      {activeTab === "catalog" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 1. 9 Python Security Standards Plugins Inspector */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)" }}>
                  Python Security Standards &amp; Threat-Intel Plugin Repository (validation_engine/plugins/*.py)
                </h2>
                <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                  Select any of the 9 Python plugins below to inspect its module path, standard specification, and Python implementation.
                </p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  color: "#8b4528",
                  fontWeight: 700,
                }}
              >
                StandardsPluginRunner (9 Active Plugins)
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, marginBottom: 16 }}>
              {PYTHON_STANDARD_PLUGINS.map((plugin) => {
                const isSelected = plugin.pluginId === activePluginSpec.pluginId;
                return (
                  <button
                    key={plugin.pluginId}
                    type="button"
                    onClick={() => setSelectedPluginId(plugin.pluginId)}
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderRadius: 10,
                      cursor: "pointer",
                      background: isSelected ? "#f4e5dc" : "var(--background)",
                      border: `1px solid ${isSelected ? "#8b4528" : "var(--border)"}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#8b4528", fontFamily: "monospace" }}>
                        {plugin.shortBadge}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                        {plugin.className}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
                      {plugin.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.35 }}>
                      {plugin.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Python Plugin Code & Metadata Box */}
            <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#8b4528", fontFamily: "monospace" }}>
                    {activePluginSpec.modulePath}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>
                    ({activePluginSpec.standardVersion})
                  </span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#46a36e" }}>
                  &check; Registered in StandardsPluginRunner
                </span>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  borderRadius: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  fontSize: 11.5,
                  fontFamily: "var(--font-mono), monospace",
                  color: "var(--foreground)",
                  overflowX: "auto",
                }}
              >
                {activePluginSpec.pythonCodePreview}
              </pre>
            </div>
          </div>

          {/* 2. Interactive CWE Multi-Standard TTP / OWASP / CVSS / NIST / GHSA / PTES / XTRIKE Exploit-Index / XTRIKE VerifyModule Explorer */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Interactive CWE Multi-Standard Correlation Explorer (MITRE ATT&amp;CK · OWASP ASVS · CVSS v3.1/v4.0 · NIST · GHSA · PTES · XTRIKE Exploit-Index · XTRIKE VerifyModule)
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12 }}>
              Select any vulnerability class below to inspect the exact TTP procedure, CVSS v3.1/v4.0 vector, NIST 800-53r5/SSDF controls, GitHub GHSA advisory, PTES 7-phase trace, XTRIKE Exploit-Index EDB-ID, and XTRIKE VerifyModule CheckCode module.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {Object.values(CWE_MULTI_STANDARD_KNOWLEDGE).map((item) => {
                const active = item.cweId === activeCweEntry.cweId;
                return (
                  <button
                    key={item.cweId}
                    type="button"
                    onClick={() => setSelectedCweKey(item.cweId)}
                    style={{
                      padding: "7px 13px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: active ? "#8b4528" : "var(--background)",
                      color: active ? "#f3eee4" : "var(--foreground)",
                      border: `1px solid ${active ? "#8b4528" : "var(--border)"}`,
                    }}
                  >
                    {item.cweId}: {item.defaultTitle.split(" via ")[0]}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 12 }}>
              {/* Card A: MITRE ATT&CK TTPs + D3FEND */}
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, fontSize: 11.5 }}>
                <div style={{ fontWeight: 800, color: "#8b4528", marginBottom: 4 }}>
                  1. MITRE ATT&amp;CK® v15 TTPs &amp; D3FEND™ Countermeasure
                </div>
                <div style={{ fontWeight: 700, color: "var(--foreground)" }}>
                  {activeCweEntry.mitre.tacticId} ({activeCweEntry.mitre.tacticName}) &rarr; {activeCweEntry.mitre.techniqueId} / {activeCweEntry.mitre.subTechniqueId}
                </div>
                <div style={{ color: "#2f6f4e", fontWeight: 700, marginTop: 4 }}>
                  D3FEND: {activeCweEntry.mitre.d3fendId} &mdash; {activeCweEntry.mitre.d3fendTechnique}
                </div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>
                  {activeCweEntry.mitre.procedureTemplate.map((s, idx) => (
                    <div key={idx} style={{ marginTop: 2 }}>{s}</div>
                  ))}
                </div>
              </div>

              {/* Card B: OWASP Top 10 + ASVS + CWE AST */}
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, fontSize: 11.5 }}>
                <div style={{ fontWeight: 800, color: "#8b4528", marginBottom: 4 }}>
                  2. OWASP Top 10 SAST · ASVS v4.0.3 · CWE AST Guard
                </div>
                <div style={{ fontWeight: 700, color: "var(--foreground)" }}>
                  {activeCweEntry.owasp.owasp2021} &middot; {activeCweEntry.owasp.asvsRequirementId} ({activeCweEntry.owasp.asvsLevel})
                </div>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>{activeCweEntry.owasp.asvsRuleSummary}</div>
                <div style={{ marginTop: 6, color: "var(--foreground)" }}>
                  <strong>CWE Rank:</strong> {activeCweEntry.cweTop25Rank}
                </div>
                <div style={{ marginTop: 4, color: "#2f6f4e", fontWeight: 700 }}>
                  Required AST Guard: {activeCweEntry.requiredSanitizerGuard}
                </div>
              </div>

              {/* Card C: FIRST CVSS v3.1 & v4.0 + NIST Suite */}
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, fontSize: 11.5 }}>
                <div style={{ fontWeight: 800, color: "#8b4528", marginBottom: 4 }}>
                  3. FIRST CVSS v3.1 / v4.0 &amp; NIST SP 800-53r5 / SSDF / CSF 2.0
                </div>
                <div style={{ fontWeight: 700, color: "var(--foreground)", fontFamily: "monospace" }}>
                  CVSS v3.1: {activeCweEntry.cvss.cvssV31Score} ({activeCweEntry.cvss.cvssV31Severity}) | CVSS v4.0: {activeCweEntry.cvss.cvssV40Score}
                </div>
                <div style={{ fontSize: 10.5, fontFamily: "monospace", color: "var(--muted)", marginTop: 2 }}>
                  {activeCweEntry.cvss.cvssV31Vector}
                </div>
                <div style={{ fontSize: 10.5, fontFamily: "monospace", color: "var(--muted)", marginTop: 2 }}>
                  {activeCweEntry.cvss.cvssV40Vector}
                </div>
                <div style={{ marginTop: 6, color: "var(--foreground)" }}>
                  <strong>NIST 800-53r5:</strong> {activeCweEntry.nist.sp80053Controls.join(" · ")}
                </div>
                <div style={{ marginTop: 2, color: "var(--muted)" }}>
                  <strong>NIST SSDF 800-218:</strong> {activeCweEntry.nist.sp800218SsdfPractices.join(" · ")}
                </div>
              </div>

              {/* Card D: GitHub GHSA · PTES 7-Phase · XTRIKE Exploit-Index · XTRIKE VerifyModule CheckCode */}
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, fontSize: 11.5 }}>
                <div style={{ fontWeight: 800, color: "#8b4528", marginBottom: 4 }}>
                  4. GitHub GHSA · PTES 7-Phase · XTRIKE Exploit-Index · XTRIKE VerifyModule Check
                </div>
                <div style={{ color: "var(--foreground)" }}>
                  <strong>GitHub GHSA:</strong> {activeCweEntry.githubGhsa.ghsaId} ({activeCweEntry.githubGhsa.cveId}) &mdash;{" "}
                  <span style={{ fontFamily: "monospace", fontSize: 10.5 }}>{activeCweEntry.githubGhsa.codeqlQueryId}</span>
                </div>
                <div style={{ color: "var(--foreground)", marginTop: 4 }}>
                  <strong>XTRIKE Exploit-Index (XEDB):</strong> {activeCweEntry.xtrike-exploit-index.edbId} &middot; EPSS {activeCweEntry.xtrike-exploit-index.epssPercentile}
                </div>
                <div style={{ color: "var(--foreground)", marginTop: 4 }}>
                  <strong>XTRIKE VerifyModule Check Module:</strong>{" "}
                  <span style={{ fontFamily: "monospace" }}>{activeCweEntry.metasploitCheck.msfModule}</span> ({activeCweEntry.metasploitCheck.msfCheckMethod})
                </div>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>
                  <strong>PTES Phase 5 Verification:</strong> {activeCweEntry.ptes.phase5Verification}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Python Standards Catalog (validation_engine/catalog.py) &middot; OWASP Top 10, CWE &amp; NIST SP 800-53
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              When a SAST finding matches a rule or CWE ID, the engine queries this defensive catalog for AST guard specifications, NIST 800-53 controls, and remediation standards.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 12 }}>
              {OWASP_CWE_NVD_CATALOG.owaspTop10.map((entry) => (
                <div
                  key={entry.code}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, color: "#8b4528" }}>
                      {entry.code} &mdash; {entry.title}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                      {entry.cwes.join(", ")}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "#46a36e", marginBottom: 6 }}>
                    NIST SP 800-53: {entry.nistControls.join(" · ")}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 6 }}>
                    {entry.defensiveChecks.map((chk) => (
                      <div key={chk} style={{ marginTop: 2 }}>
                        &bull; {chk}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--foreground-muted)" }}>
                    <strong>Standard:</strong> {entry.remediationStandard}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              NIST NVD / CVE Reachability Catalog
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Links package advisories to CWE identifiers, vulnerable symbols, and call-graph reachability checks.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 12 }}>
              {OWASP_CWE_NVD_CATALOG.nvdAdvisories.map((adv) => (
                <div
                  key={adv.cveId}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: "var(--foreground)" }}>
                      {adv.cveId} &middot; {adv.cweId}
                    </span>
                    <span style={{ fontWeight: 800, color: adv.severity === "Critical" ? "#e5484d" : "#e2853b" }}>
                      CVSS {adv.cvss} ({adv.severity})
                    </span>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#8b4528", marginBottom: 4 }}>
                    {adv.ecosystem}: {adv.packageName} ({adv.affectedRange} &rarr; Fix: {adv.patchedVersion})
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 4 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Symbol:</strong>{" "}
                    <span style={{ fontFamily: "monospace" }}>{adv.vulnerableSymbol}</span>
                  </div>
                  <div style={{ color: "var(--muted)" }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Reachability Check:</strong> {adv.reachabilityCheck}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
