"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  GitCommit,
  FileCode2,
} from "lucide-react";
import {
  CANONICAL_VALIDATION_FINDINGS,
  PIPELINE_ARCHITECTURE_STAGES,
  ValidationStatus,
} from "@/lib/validation-engine";

type Props = {
  repo: string;
  language: string;
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
  onFinishToDashboard,
}: Props) {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [completedFindings, setCompletedFindings] = useState(0);
  const [selectedId, setSelectedId] = useState(
    CANONICAL_VALIDATION_FINDINGS[0].findingId
  );

  useEffect(() => {
    const stageIv = setInterval(() => {
      setActiveStageIdx((prev) =>
        prev < PIPELINE_ARCHITECTURE_STAGES.length - 1 ? prev + 1 : prev
      );
    }, 550);

    const findingIv = setInterval(() => {
      setCompletedFindings((prev) =>
        prev < CANONICAL_VALIDATION_FINDINGS.length ? prev + 1 : prev
      );
    }, 650);

    return () => {
      clearInterval(stageIv);
      clearInterval(findingIv);
    };
  }, []);

  const validationDone =
    activeStageIdx === PIPELINE_ARCHITECTURE_STAGES.length - 1 &&
    completedFindings === CANONICAL_VALIDATION_FINDINGS.length;

  const selectedFinding =
    CANONICAL_VALIDATION_FINDINGS.find((f) => f.findingId === selectedId) ||
    CANONICAL_VALIDATION_FINDINGS[0];

  return (
    <div className="w-full space-y-6">
      {/* Header strip */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1" style={{ color: "var(--muted)" }}>
            <GitCommit className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
            <span>Target: {repo}</span>
            <span>&middot;</span>
            <span>Adapter: {language} AST + Runtime Verifier</span>
          </div>
          <div className="text-base font-bold" style={{ color: "var(--foreground)" }}>
            Post-Scan Finding Validation Pipeline (Stages A &rarr; F)
          </div>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{
            background: validationDone ? "rgba(70, 163, 110, 0.14)" : "#f4e5dc",
            color: validationDone ? "#46a36e" : "#8b4528",
            border: "1px solid var(--border)",
          }}
        >
          {validationDone
            ? "Proof Contracts Evaluated (5/5 Findings)"
            : `Validating Findings (${completedFindings}/${CANONICAL_VALIDATION_FINDINGS.length})...`}
        </div>
      </div>

      {/* Stages A -> F progress pills */}
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
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
            Normalized Findings (Select to Inspect Proof)
          </div>
          {CANONICAL_VALIDATION_FINDINGS.map((f, idx) => {
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
                {selectedFinding.validatorName} &middot; commit{" "}
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
          <span>Proceed to Verified Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
