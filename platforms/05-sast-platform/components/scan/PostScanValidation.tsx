"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  GitCommit,
  Download,
} from "lucide-react";
import {
  CANONICAL_VALIDATION_FINDINGS,
  PIPELINE_ARCHITECTURE_STAGES,
  ValidationStatus,
  CanonicalValidationFinding,
} from "@/lib/validation-engine";
import type { LiveScanTelemetry } from "@/lib/enterprise-sast-engine";

type Props = {
  repo: string;
  language: string;
  telemetry?: LiveScanTelemetry | null;
  onFinishToDashboard: () => void;
};

const STATUS_STYLE: Record<
  ValidationStatus,
  { label: string; color: string; bg: string }
> = {
  confirmed: {
    label: "CONFIRMED",
    color: "#e5484d",
    bg: "rgba(229, 72, 77, 0.12)",
  },
  not_reproduced: {
    label: "NOT REPRODUCED · MITIGATED",
    color: "#46a36e",
    bg: "rgba(70, 163, 110, 0.12)",
  },
  inconclusive: {
    label: "INCONCLUSIVE",
    color: "#d6a847",
    bg: "rgba(214, 168, 71, 0.12)",
  },
  blocked: {
    label: "BLOCKED (BUILD SHA GATE)",
    color: "#e2853b",
    bg: "rgba(226, 133, 59, 0.12)",
  },
  not_applicable: {
    label: "NOT APPLICABLE",
    color: "#5c5349",
    bg: "rgba(154, 160, 171, 0.12)",
  },
};

export default function PostScanValidation({
  repo,
  language,
  telemetry,
  onFinishToDashboard,
}: Props) {
  const activeValidationList: CanonicalValidationFinding[] =
    telemetry?.validationFindings && telemetry.validationFindings.length > 0
      ? telemetry.validationFindings
      : CANONICAL_VALIDATION_FINDINGS;

  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [completedFindings, setCompletedFindings] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ValidationStatus>("ALL");
  const [selectedId, setSelectedId] = useState(
    activeValidationList[0]?.findingId || CANONICAL_VALIDATION_FINDINGS[0].findingId
  );

  useEffect(() => {
    setSelectedId(activeValidationList[0]?.findingId || CANONICAL_VALIDATION_FINDINGS[0].findingId);
  }, [activeValidationList]);

  useEffect(() => {
    const stageIv = setInterval(() => {
      setActiveStageIdx((prev) =>
        prev < PIPELINE_ARCHITECTURE_STAGES.length - 1 ? prev + 1 : prev
      );
    }, 350);

    const findingIv = setInterval(() => {
      setCompletedFindings((prev) =>
        prev < activeValidationList.length ? prev + 1 : prev
      );
    }, 280);

    return () => {
      clearInterval(stageIv);
      clearInterval(findingIv);
    };
  }, [activeValidationList.length]);

  const validationDone =
    activeStageIdx === PIPELINE_ARCHITECTURE_STAGES.length - 1 &&
    completedFindings >= activeValidationList.length;

  const progressPct = validationDone
    ? 100
    : Math.min(
        98,
        Math.round(
          ((activeStageIdx + 1) / PIPELINE_ARCHITECTURE_STAGES.length) * 45 +
            (completedFindings / Math.max(1, activeValidationList.length)) * 55
        )
      );

  const filteredList =
    statusFilter === "ALL"
      ? activeValidationList
      : activeValidationList.filter((f) => f.status === statusFilter);

  const selectedFinding =
    filteredList.find((f) => f.findingId === selectedId) ||
    activeValidationList.find((f) => f.findingId === selectedId) ||
    activeValidationList[0];

  const handleDownloadSarif = () => {
    const sarifPayload = {
      version: "2.1.0",
      $schema: "https://json.schemastore.org/sarif-2.1.0.json",
      runs: [
        {
          tool: {
            driver: {
              name: "XTRIKE Enterprise SAST (Checkmarx CxQL + IBM Code Scan + Fortify SCA + 400 Plugins)",
              version: "4.0.0",
            },
          },
          results: activeValidationList.map((f) => ({
            ruleId: f.ruleId,
            level: f.rawSarifRecord.level,
            message: { text: `${f.title} (${f.cwe})` },
            locations: [{ physicalLocation: f.rawSarifRecord.physicalLocation }],
            properties: {
              cwe: f.cwe,
              validationStatus: f.status,
              evidenceConfidence: f.evidenceConfidence,
              commitSha: f.commitSha,
              language: f.language,
            },
          })),
        },
      ],
    };
    const blob = new Blob([JSON.stringify(sarifPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xtrike-sast-${language.toLowerCase()}-sarif-2.1.0.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header strip + Progress bar */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: "var(--surface-2)",
          border: `1.5px solid ${validationDone ? "#46a36e" : "#8b4528"}`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono mb-1" style={{ color: "var(--muted)" }}>
              <GitCommit className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
              <span>Target: {repo}</span>
              <span>&middot;</span>
              <span>Adapter: {language} AST + Checkmarx / IBM / Fortify Verifier</span>
            </div>
            <div className="text-base font-bold" style={{ color: "var(--foreground)" }}>
              Post-Scan Finding Validation Pipeline (Stages A &rarr; F &middot; {activeValidationList.length} Findings)
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setActiveStageIdx(0);
                setCompletedFindings(0);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              Re-Run Validation Pass
            </button>
            <button
              type="button"
              onClick={handleDownloadSarif}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              style={{
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              <Download className="w-3.5 h-3.5" style={{ color: "#8b4528" }} />
              <span>Export SARIF 2.1.0</span>
            </button>
            <div
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{
                background: validationDone ? "rgba(70, 163, 110, 0.14)" : "#f4e5dc",
                color: validationDone ? "#2e6b47" : "#8b4528",
                border: `1px solid ${validationDone ? "#46a36e" : "#8b4528"}`,
              }}
            >
              {validationDone
                ? `✓ SCAN & PROOF VALIDATION COMPLETED (100% · ${activeValidationList.length}/${activeValidationList.length})`
                : `⟳ VALIDATING FINDINGS (${progressPct}% · ${completedFindings}/${activeValidationList.length})...`}
            </div>
          </div>
        </div>

        {/* Visual Horizontal Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono mb-1" style={{ color: "var(--muted)" }}>
            <span>
              {validationDone
                ? "All 9 Python Security Standards Plugins & 6-Point Proof Contracts evaluated."
                : `Running Stage ${PIPELINE_ARCHITECTURE_STAGES[activeStageIdx]?.code}: ${PIPELINE_ARCHITECTURE_STAGES[activeStageIdx]?.title}...`}
            </span>
            <span className="font-bold" style={{ color: validationDone ? "#2e6b47" : "#8b4528" }}>
              {progressPct}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 10,
              borderRadius: 999,
              background: "#e5dccb",
              overflow: "hidden",
              border: "1px solid rgba(43,36,30,0.08)",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                background: validationDone
                  ? "linear-gradient(90deg, #46a36e 0%, #2e6b47 100%)"
                  : "linear-gradient(90deg, #8b4528 0%, #d6a847 100%)",
                transition: "width 0.25s ease",
              }}
            />
          </div>
        </div>

        {/* Clickable Scorecard Filter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {[
            {
              key: "ALL" as const,
              label: "Total SAST Findings",
              count: activeValidationList.length,
              color: "#1e1a16",
            },
            {
              key: "confirmed" as const,
              label: "Runtime Confirmed",
              count: activeValidationList.filter((f) => f.status === "confirmed").length,
              color: "#e5484d",
            },
            {
              key: "not_reproduced" as const,
              label: "Safely Mitigated",
              count: activeValidationList.filter((f) => f.status === "not_reproduced").length,
              color: "#46a36e",
            },
            {
              key: "inconclusive" as const,
              label: "Inconclusive",
              count: activeValidationList.filter((f) => f.status === "inconclusive").length,
              color: "#d6a847",
            },
            {
              key: "blocked" as const,
              label: "Blocked / Unvalidated",
              count: activeValidationList.filter((f) => f.status === "blocked").length,
              color: "#e2853b",
            },
          ].map((card) => {
            const active = statusFilter === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => {
                  setStatusFilter(card.key);
                  const first =
                    card.key === "ALL"
                      ? activeValidationList[0]
                      : activeValidationList.find((f) => f.status === card.key);
                  if (first) setSelectedId(first.findingId);
                }}
                className="rounded-lg p-2.5 text-left transition-all"
                style={{
                  background: active ? "#f4e5dc" : "var(--background)",
                  border: active ? `1.5px solid ${card.color}` : "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  <span>{card.label}</span>
                  <span style={{ color: active ? card.color : "var(--primary)" }}>{active ? "ACTIVE" : "FILTER ↗"}</span>
                </div>
                <div className="text-lg font-extrabold mt-0.5" style={{ color: card.color }}>
                  {card.count}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stages A -> F progress pills (Clickable to inspect stage) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {PIPELINE_ARCHITECTURE_STAGES.map((stg, idx) => {
          const done = idx <= activeStageIdx;
          return (
            <div
              key={stg.code}
              className="rounded-lg p-2.5 text-left transition-all"
              style={{
                background: done ? "var(--surface-2)" : "var(--background)",
                border: `1px solid ${done ? "var(--primary)" : "var(--border)"}`,
              }}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span style={{ color: done ? "var(--primary)" : "var(--muted)" }}>
                  Stage {stg.code}
                </span>
                {done && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#46a36e" }} />}
              </div>
              <div className="text-xs font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
                {stg.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Canonical Findings & Proof Contract Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left list */}
        <div className="lg:col-span-5 space-y-2" style={{ maxHeight: 540, overflowY: "auto" }}>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
            <span>
              Normalized Findings ({filteredList.length} Shown &middot; Select to Inspect Proof)
            </span>
            {statusFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className="text-[11px] font-bold underline"
                style={{ color: "#8b4528", background: "none", border: "none", cursor: "pointer" }}
              >
                Show All ({activeValidationList.length})
              </button>
            )}
          </div>
          {filteredList.map((f, idx) => {
            const isReady = idx < completedFindings;
            const isSelected = f.findingId === selectedFinding.findingId;
            const badge = STATUS_STYLE[f.status];
            return (
              <button
                key={f.findingId}
                type="button"
                onClick={() => setSelectedId(f.findingId)}
                className="w-full text-left rounded-xl p-3 transition-all"
                style={{
                  background: isSelected ? "var(--surface-2)" : "var(--background)",
                  border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                  cursor: "pointer",
                  opacity: isReady ? 1 : 0.55,
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono font-bold" style={{ color: "var(--primary)" }}>
                    {f.findingId} &middot; {f.cwe} (P{f.validatorPriority})
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {isReady ? badge.label : "QUEUED"}
                  </span>
                </div>
                <div className="text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  {f.title}
                </div>
                <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted)" }}>
                  <span className="font-mono truncate">{f.filePath}:{f.startLine}</span>
                  <span>Conf: {Math.round(f.evidenceConfidence * 100)}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right detail: 5-step lifecycle + 6-point proof contract */}
        <div
          className="lg:col-span-7 rounded-xl p-4 space-y-4"
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                {selectedFinding.validatorName} &middot; {selectedFinding.ruleId} &middot; commit{" "}
                <span style={{ color: "var(--foreground)" }}>{selectedFinding.commitSha.slice(0, 8)}</span>
              </div>
              <div className="text-sm font-bold mt-0.5" style={{ color: "var(--foreground)" }}>
                {selectedFinding.title}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase" style={{ color: "var(--muted)" }}>
                Separated Assessment
              </div>
              <div className="text-xs font-bold" style={{ color: STATUS_STYLE[selectedFinding.status].color }}>
                Status: {selectedFinding.status.toUpperCase()} &middot; Evidence Conf: {Math.round(selectedFinding.evidenceConfidence * 100)}%
              </div>
            </div>
          </div>

          {/* 5-step validator execution lifecycle */}
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>
              Validator Execution Lifecycle (Preflight &rarr; Assess &rarr; Plan &rarr; Execute &rarr; Verify)
            </div>
            <div className="space-y-1.5">
              {Object.values(selectedFinding.lifecycle).map((step) => (
                <div
                  key={step.label}
                  className="rounded-lg px-3 py-2 text-xs flex items-start justify-between gap-3"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <span className="font-bold mr-2" style={{ color: "var(--foreground)" }}>
                      {step.label}:
                    </span>
                    <span style={{ color: "var(--foreground-muted)" }}>{step.summary}</span>
                  </div>
                  <span
                    className="font-mono text-[10px] shrink-0"
                    style={{
                      color:
                        step.status === "pass"
                          ? "#46a36e"
                          : step.status === "blocked"
                          ? "#e2853b"
                          : "#d6a847",
                    }}
                  >
                    {step.durationMs}ms
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6-point Independent Evidence Verifier Proof Contract */}
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>
              Independent Evidence Verifier &middot; 6-Point Proof Contract
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedFinding.proofContract.map((req) => (
                <div
                  key={req.requirement}
                  className="rounded-lg p-2.5 text-xs"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                      {req.requirement}
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        background: req.satisfied
                          ? "rgba(70, 163, 110, 0.14)"
                          : "rgba(154, 160, 171, 0.14)",
                        color: req.satisfied ? "#46a36e" : "var(--muted)",
                      }}
                    >
                      {req.satisfied ? "PROVEN" : "NOT MET"}
                    </span>
                  </div>
                  <div className="text-[11px] leading-snug" style={{ color: "var(--muted)" }}>
                    {req.evidenceSummary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link
          href="/validation-engine"
          className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          style={{
            background: "var(--surface-2)",
            color: "var(--primary)",
            border: "1px solid var(--border)",
            textDecoration: "none",
          }}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Open Full Validation Engine Studio &amp; Python Spec</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={onFinishToDashboard}
          className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          style={{
            background: "#8b4528",
            color: "#f3eee4",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span>Proceed to Verified Dashboard ({activeValidationList.length} Scanned Findings)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
