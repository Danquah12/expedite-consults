"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertTriangle, Lock, FileCheck2 } from "lucide-react";
import { severityColor } from "@/lib/utils";
import type { SASTFinding } from "@/types/sast";

export type AuthoritativeProofStatus =
  | "Static Candidate"
  | "Dataflow Confirmed"
  | "Runtime Reproduced"
  | "Impact Confirmed"
  | "Inconclusive"
  | "False Positive";

type Props = {
  finding: SASTFinding;
  proofStatus?: AuthoritativeProofStatus;
  onProofStatusChange?: (status: AuthoritativeProofStatus) => void;
  runtimeReproduced?: boolean;
  mitigationVerified?: boolean;
};

const SEVERITY_DOT: Record<string, string> = {
  Critical: "var(--critical)",
  High: "var(--high)",
  Medium: "var(--medium)",
  Low: "var(--low)",
};

const PROOF_STATUS_STYLE: Record<
  AuthoritativeProofStatus,
  { bg: string; border: string; color: string; sub: string }
> = {
  "Static Candidate": {
    bg: "rgba(214, 168, 71, 0.14)",
    border: "rgba(214, 168, 71, 0.45)",
    color: "#9a6700",
    sub: "Pattern matched statically; source-to-sink dataflow or sink I/O not yet confirmed.",
  },
  "Dataflow Confirmed": {
    bg: "rgba(226, 133, 59, 0.14)",
    border: "rgba(226, 133, 59, 0.45)",
    color: "#b45309",
    sub: "Source-to-sink taint propagation confirmed statically (0 sanitizers); runtime exploitation not yet executed.",
  },
  "Runtime Reproduced": {
    bg: "rgba(229, 72, 77, 0.14)",
    border: "rgba(229, 72, 77, 0.45)",
    color: "var(--critical)",
    sub: "Controlled sandbox probe verified input alters SQL/sink interpretation; downstream write/RCE impact remains scoped.",
  },
  "Impact Confirmed": {
    bg: "rgba(229, 72, 77, 0.2)",
    border: "rgba(229, 72, 77, 0.6)",
    color: "#9e2a2b",
    sub: "Both runtime exploitability and downstream data/privilege impact verified with captured artifacts.",
  },
  Inconclusive: {
    bg: "rgba(139, 69, 40, 0.1)",
    border: "rgba(139, 69, 40, 0.35)",
    color: "#8b4528",
    sub: "Requires manual environment/credential/middleware inspection before disposition.",
  },
  "False Positive": {
    bg: "rgba(70, 163, 110, 0.14)",
    border: "rgba(70, 163, 110, 0.45)",
    color: "var(--low)",
    sub: "Upstream guard/parameterization verified or retest confirmed vulnerable behavior no longer reproduces.",
  },
};

const ALL_PROOF_STATUSES: AuthoritativeProofStatus[] = [
  "Static Candidate",
  "Dataflow Confirmed",
  "Runtime Reproduced",
  "Impact Confirmed",
  "Inconclusive",
  "False Positive",
];

export default function FindingHeader({
  finding: f,
  proofStatus = "Dataflow Confirmed",
  onProofStatusChange,
  runtimeReproduced = false,
  mitigationVerified = false,
}: Props) {
  const dotColor = SEVERITY_DOT[f.severity];
  const activeStyle = PROOF_STATUS_STYLE[proofStatus];
  const hasVerifiedCve = f.advisoryApplicability === "DEPENDENCY_VERSION_MATCHED";

  const releaseGateBlocked =
    !mitigationVerified &&
    proofStatus !== "False Positive" &&
    (proofStatus === "Dataflow Confirmed" ||
      proofStatus === "Runtime Reproduced" ||
      proofStatus === "Impact Confirmed");

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm mb-2 transition-colors hover:text-[#1f1b18]"
        style={{ color: "var(--muted)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-2.5 flex-wrap">
        <span
          className="text-xs font-mono px-3 py-1 rounded-lg font-bold"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--primary)",
          }}
        >
          {f.id}
        </span>
        <span
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold"
          style={{ background: `${dotColor}18`, border: `1px solid ${dotColor}40` }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
          <span className={severityColor(f.severity)}>
            {f.severity} (Static Severity)
          </span>
        </span>
        <span
          className="px-3 py-1 rounded-lg text-xs font-bold"
          style={{
            background: activeStyle.bg,
            border: `1px solid ${activeStyle.border}`,
            color: activeStyle.color,
          }}
        >
          Proof Status: {mitigationVerified ? "Mitigated (Retest Verified)" : proofStatus}
        </span>
        <span
          className="px-3 py-1 rounded-lg text-xs font-semibold"
          style={{
            background: releaseGateBlocked
              ? "rgba(229, 72, 77, 0.12)"
              : "rgba(70, 163, 110, 0.14)",
            border: `1px solid ${
              releaseGateBlocked ? "rgba(229, 72, 77, 0.4)" : "rgba(70, 163, 110, 0.4)"
            }`,
            color: releaseGateBlocked ? "var(--critical)" : "var(--low)",
          }}
        >
          Release Gate: {releaseGateBlocked ? "BLOCKED (Policy ASVS-5.3.4)" : "PASS (Verified Clean)"}
        </span>
        <span
          className="text-xs px-3 py-1 rounded-lg"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--muted)",
          }}
        >
          {f.application}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-[#1f1b18]">{f.title}</h1>

      <div className="flex flex-wrap gap-3">
        {[
          {
            label: "CVSS v3.1 (Base)",
            value: f.cvss.toFixed(1),
            sub: "Worst-case static base",
            color: f.cvss >= 9 ? "var(--critical)" : f.cvss >= 7 ? "var(--high)" : "var(--medium)",
          },
          {
            label: "CWE Weakness",
            value: f.cwe,
            sub: "First-party code pattern",
            color: "var(--primary)",
          },
          {
            label: "OWASP / ASVS",
            value: f.owasp,
            sub: "ASVS v4.0.3 §5.3.4",
            color: "#8b4528",
          },
          {
            label: "MITRE ATT&CK",
            value: f.mitre,
            sub: "Candidate technique",
            color: "#d6a847",
          },
          {
            label: "CVE / EPSS",
            value: hasVerifiedCve ? `${(f.epss * 100).toFixed(1)}%` : "N/A (No CVE)",
            sub: hasVerifiedCve
              ? "FIRST.org EPSS v3"
              : `CWE Class Ref: ${(f.epss * 100).toFixed(1)}%`,
            color: "var(--muted)",
          },
          {
            label: "Language",
            value: f.language,
            sub: `${f.file.split("/").pop()}:${f.line}`,
            color: "var(--muted)",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl px-4 py-2.5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div
              className="text-[10px] uppercase tracking-widest mb-0.5"
              style={{ color: "var(--muted)" }}
            >
              {m.label}
            </div>
            <div className="text-sm font-bold" style={{ color: m.color }}>
              {m.value}
            </div>
            <div className="text-[10px]" style={{ color: "var(--muted)" }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Authoritative Proof Engine vs. Taint Graph Banner */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#8b4528]" />
            <div>
              <div className="text-sm font-bold text-[#1f1b18]">
                Authoritative Proof Engine Status &amp; Policy Release Gate
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                The Taint Graph explains why the code is suspicious statically; the Proof Engine &amp; Evidence Ledger establish what has actually been proved.
              </div>
            </div>
          </div>

          {onProofStatusChange && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10.5px] font-bold uppercase tracking-wider mr-1" style={{ color: "var(--muted)" }}>
                Proof State:
              </span>
              {ALL_PROOF_STATUSES.map((st) => {
                const isCurrent = proofStatus === st;
                const stStyle = PROOF_STATUS_STYLE[st];
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onProofStatusChange(st)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all"
                    style={{
                      background: isCurrent ? stStyle.bg : "var(--background)",
                      border: `1px solid ${isCurrent ? stStyle.border : "var(--border)"}`,
                      color: isCurrent ? stStyle.color : "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Column 1: What Static Analysis Detected */}
          <div
            className="rounded-xl p-3.5"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="font-bold text-[#1f1b18] mb-1 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-[#8b4528]" />
              1. What Static Analysis Detected (Taint Graph)
            </div>
            <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
              Credible <strong>{f.cwe}</strong> candidate: untrusted input (<code>{f.source}</code>) is concatenated into a query string and passed to <code>{f.sink}</code> at line {f.line} with zero sanitizers in local method scope.
            </p>
          </div>

          {/* Column 2: What Runtime Proof Has Established */}
          <div
            className="rounded-xl p-3.5"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="font-bold text-[#1f1b18] mb-1 flex items-center gap-1.5">
              <AlertTriangle
                className="w-3.5 h-3.5"
                style={{ color: runtimeReproduced ? "var(--critical)" : "#d6a847" }}
              />
              2. What Has Actually Been Proved (Evidence Ledger)
            </div>
            <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
              {mitigationVerified ? (
                <>
                  <strong>Mitigation Verified by Retest:</strong> Tainted parameter is now bound via parameterized <code>PreparedStatement</code>; test case <code>TC-SQLI-089-001</code> no longer alters query interpretation.
                </>
              ) : runtimeReproduced ? (
                <>
                  <strong>Runtime Reproduced (Scoped):</strong> Controlled sandbox test case <code>TC-SQLI-089-001</code> demonstrated SQL <code>SELECT</code> predicate alteration. <strong>Not Proved:</strong> Database write access, DDL permissions, and RCE are not established by this method.
                </>
              ) : (
                <>
                  <strong>Runtime Proof Not Yet Executed:</strong> Static source-to-sink dataflow is confirmed, but no live runtime exploit or database response has been executed yet. Displayed code shows a <code>SELECT</code> query only and does <strong>not</strong> prove DB write access or RCE.
                </>
              )}
            </p>
          </div>

          {/* Column 3: Policy & Evidence-Driven Release Gate */}
          <div
            className="rounded-xl p-3.5"
            style={{
              background: releaseGateBlocked
                ? "rgba(229, 72, 77, 0.06)"
                : "rgba(70, 163, 110, 0.08)",
              border: `1px solid ${
                releaseGateBlocked ? "rgba(229, 72, 77, 0.3)" : "rgba(70, 163, 110, 0.35)"
              }`,
            }}
          >
            <div
              className="font-bold mb-1 flex items-center gap-1.5"
              style={{ color: releaseGateBlocked ? "var(--critical)" : "var(--low)" }}
            >
              <Lock className="w-3.5 h-3.5" />
              3. Release Gate Decision ({releaseGateBlocked ? "HOLD RELEASE" : "PASS"})
            </div>
            <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
              {releaseGateBlocked ? (
                <>
                  Blocked by <strong>Policy Rule ASVS-5.3.4 / NIST SI-10</strong> based on verified static evidence (unparameterized SQL dataflow at lines 9→10→12). Unsupported impact narratives (DBA/RCE) and raw aggregate scores are excluded from this gate.
                </>
              ) : (
                <>
                  Release gate cleared based on verified parameterization or false-positive proof artifact in the Evidence Ledger.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
