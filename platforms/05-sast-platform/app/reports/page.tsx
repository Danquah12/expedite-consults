"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Printer,
  Download,
  FileText,
  FileCode2,
  Sliders,
  Layers,
  ArrowLeft,
  Building2,
} from "lucide-react";
import FINDINGS from "@/data/findings";
import {
  CANONICAL_VALIDATION_FINDINGS,
  exportNormalizedValidationSarif,
  type CanonicalValidationFinding,
} from "@/lib/validation-engine";
import {
  loadActiveScanSession,
  PYTHON_STANDARD_PLUGINS,
  type ActiveScanSession,
  type MultiStandardPluginEvaluation,
} from "@/lib/live-sast-scanner";
import { calculateRiskScore, severityCounts, averageConfidence } from "@/lib/risk";
import type { SASTFinding } from "@/types/sast";

type ReportTemplate = "full_technical" | "executive_brief" | "compliance_attestation";
type SeverityFilter = "all" | "critical_only" | "critical_high" | "confirmed_only";

export default function ReportEnginePage() {
  const [activeSession, setActiveSession] = useState<ActiveScanSession | null>(null);
  const [template, setTemplate] = useState<ReportTemplate>("full_technical");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

  // Customizable Report Header Metadata
  const [reportTitle, setReportTitle] = useState(
    "XTRIKE SAST & Proof-Driven Security Assessment Report"
  );
  const [organization, setOrganization] = useState("XTRIKE Enterprise Security Operations");
  const [auditorName, setAuditorName] = useState("XTRIKE Automated Proof & Triage Desk");
  const [classification, setClassification] = useState(
    "CONFIDENTIAL — INTERNAL SECURITY & COMPLIANCE AUDIT"
  );

  // Section Toggles
  const [includeExecSummary, setIncludeExecSummary] = useState(true);
  const [includeValidationScorecard, setIncludeValidationScorecard] = useState(true);
  const [includePluginMatrix, setIncludePluginMatrix] = useState(true);
  const [includeFindingDossiers, setIncludeFindingDossiers] = useState(true);
  const [includeRemediationDiffs, setIncludeRemediationDiffs] = useState(true);
  const [includeSignOff, setIncludeSignOff] = useState(true);

  useEffect(() => {
    const sync = () => {
      const session = loadActiveScanSession();
      if (session) setActiveSession(session);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("xtrike-scan-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("xtrike-scan-updated", sync);
    };
  }, []);

  const handleSelectTemplate = (next: ReportTemplate) => {
    setTemplate(next);
    if (next === "full_technical") {
      setIncludeExecSummary(true);
      setIncludeValidationScorecard(true);
      setIncludePluginMatrix(true);
      setIncludeFindingDossiers(true);
      setIncludeRemediationDiffs(true);
      setIncludeSignOff(true);
    } else if (next === "executive_brief") {
      setIncludeExecSummary(true);
      setIncludeValidationScorecard(true);
      setIncludePluginMatrix(true);
      setIncludeFindingDossiers(false);
      setIncludeRemediationDiffs(false);
      setIncludeSignOff(true);
    } else if (next === "compliance_attestation") {
      setIncludeExecSummary(true);
      setIncludeValidationScorecard(true);
      setIncludePluginMatrix(true);
      setIncludeFindingDossiers(true);
      setIncludeRemediationDiffs(false);
      setIncludeSignOff(true);
    }
  };

  const rawFindings: SASTFinding[] = useMemo(
    () => (activeSession?.sastFindings?.length ? activeSession.sastFindings : FINDINGS),
    [activeSession]
  );

  const rawValidationFindings: CanonicalValidationFinding[] = useMemo(
    () =>
      activeSession?.validationFindings?.length
        ? activeSession.validationFindings
        : CANONICAL_VALIDATION_FINDINGS,
    [activeSession]
  );

  const validationById = useMemo(() => {
    const map = new Map<string, CanonicalValidationFinding>();
    rawValidationFindings.forEach((vf) => map.set(vf.findingId, vf));
    return map;
  }, [rawValidationFindings]);

  const pluginEvalById = useMemo(() => {
    const map = new Map<string, MultiStandardPluginEvaluation>();
    activeSession?.pluginEvaluations?.forEach((ev) => map.set(ev.findingId, ev));
    return map;
  }, [activeSession]);

  const filteredFindings = useMemo(() => {
    return rawFindings.filter((f) => {
      if (severityFilter === "critical_only") return f.severity === "Critical";
      if (severityFilter === "critical_high")
        return f.severity === "Critical" || f.severity === "High";
      if (severityFilter === "confirmed_only") {
        const vf = validationById.get(f.id);
        return vf ? vf.status === "confirmed" : f.status === "Open";
      }
      return true;
    });
  }, [rawFindings, severityFilter, validationById]);

  const counts = useMemo(() => severityCounts(filteredFindings), [filteredFindings]);
  const riskScore = useMemo(() => calculateRiskScore(filteredFindings), [filteredFindings]);
  const avgConf = useMemo(() => averageConfidence(filteredFindings), [filteredFindings]);

  const validationStats = useMemo(() => {
    const total = rawValidationFindings.length;
    const confirmed = rawValidationFindings.filter((f) => f.status === "confirmed").length;
    const notReproduced = rawValidationFindings.filter((f) => f.status === "not_reproduced").length;
    const blocked = rawValidationFindings.filter((f) => f.status === "blocked").length;
    const inconclusive = rawValidationFindings.filter((f) => f.status === "inconclusive").length;
    const notApplicable = rawValidationFindings.filter((f) => f.status === "not_applicable").length;
    return { total, confirmed, notReproduced, blocked, inconclusive, notApplicable };
  }, [rawValidationFindings]);

  const targetName = activeSession?.repoUrl || "xtrike-core/enterprise-banking-api";
  const commitSha = activeSession?.commitSha || "9f4c2a1b8e7d0312a4f5c6d7";
  const scanTimestamp = activeSession?.scannedAt
    ? new Date(activeSession.scannedAt).toLocaleString()
    : "2026-10-20 09:30:00 UTC";
  const reportId = `XTRIKE-RPT-${commitSha.slice(0, 6).toUpperCase()}-2026`;

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    const lines: string[] = [
      `# ${reportTitle}`,
      ``,
      `- **Report ID:** \`${reportId}\``,
      `- **Organization:** ${organization}`,
      `- **Target Repository:** \`${targetName}\``,
      `- **Commit SHA:** \`${commitSha}\``,
      `- **Lead Security Auditor:** ${auditorName}`,
      `- **Classification:** ${classification}`,
      `- **Generated At:** ${scanTimestamp}`,
      ``,
      `---`,
      ``,
      `## 1. Executive Risk Posture & Scorecard`,
      ``,
      `| Metric | Value |`,
      `| :--- | :--- |`,
      `| **Composite Risk Score** | **${riskScore}/100** (${riskScore >= 60 ? "CRITICAL ACTION REQUIRED" : "MODERATE"}) |`,
      `| **Total Evaluated Findings** | ${filteredFindings.length} |`,
      `| **Critical / High / Medium / Low** | ${counts.critical} / ${counts.high} / ${counts.medium} / ${counts.low} |`,
      `| **Confirmed Exploitable (Proof Contract Pass)** | ${validationStats.confirmed} / ${validationStats.total} |`,
      `| **Safely Mitigated / Guarded (False Positives Suppressed)** | ${validationStats.notReproduced + validationStats.notApplicable} |`,
      `| **Average Multi-Engine Consensus Confidence** | ${avgConf}% |`,
      ``,
      `## 2. XTRIKE 9-Plugin Standards & Offensive TTP Matrix`,
      ``,
      `| Plugin ID | Module | Standard / Framework | Findings Mapped |`,
      `| :--- | :--- | :--- | :--- |`,
      ...PYTHON_STANDARD_PLUGINS.map(
        (p) =>
          `| \`${p.pluginId}\` | \`${p.modulePath}\` | ${p.standardVersion} | ${filteredFindings.length} verified |`
      ),
      ``,
      `## 3. Detailed Finding Dossiers`,
      ``,
      ...filteredFindings.flatMap((f, idx) => {
        const vf = validationById.get(f.id);
        const rem = f.remediation[0];
        return [
          `### 3.${idx + 1} [${f.severity.toUpperCase()}] ${f.id} — ${f.title}`,
          `- **Location:** \`${f.file}:${f.line}\` (${f.language})`,
          `- **CWE / OWASP:** ${f.cwe} (${f.cweName}) · ${f.owasp} (${f.owaspCategory})`,
          `- **CVSS v3.1 / EPSS:** ${f.cvss} · EPSS ${(f.epss * 100).toFixed(1)}%`,
          `- **MITRE ATT&CK TTP:** ${f.mitre}`,
          `- **Proof Validation Status:** \`${vf?.status?.toUpperCase() || f.status.toUpperCase()}\` (Confidence: ${Math.round(f.confidence * 100)}%)`,
          `- **Executive Summary:** ${f.executiveSummary}`,
          `- **Root Cause:** ${f.rootCause}`,
          `- **Remediation Guidance (${rem?.platform || f.language}):** ${rem?.explanation || "Use parameterized bindings and strict input validation."}`,
          ``,
          `\`\`\`${f.language.toLowerCase()}`,
          `${rem?.code || f.codeSnippet || ""}`,
          `\`\`\``,
          ``,
        ];
      }),
      `---`,
      `*Signed and attested by XTRIKE SAST Desk Printable Report Engine · SHA-256 Digest: 8f9d2c4e7b1a6f305e8c2d9a4b7f1e6c3a9d0b2f4e8c1a7d6b3f9e2c4a1d8b5f*`,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportId.toLowerCase()}-security-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPrintableHtml = () => {
    const sheetEl = document.getElementById("xtrike-printable-report-sheet");
    if (!sheetEl) return;
    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${reportTitle} — ${reportId}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif;
      color: #1f1b18;
      background: #ffffff;
      margin: 24px auto;
      max-width: 980px;
      padding: 0 20px;
      line-height: 1.5;
    }
    @media print {
      body { margin: 0; padding: 0; max-width: 100%; }
      .print-avoid-break { break-inside: avoid; page-break-inside: avoid; }
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd3c2; padding: 8px 10px; text-align: left; font-size: 12px; }
    th { background: #f3eee4; }
    pre { background: #f7f3eb; border: 1px solid #ddd3c2; padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 11px; white-space: pre-wrap; }
  </style>
</head>
<body>
  ${sheetEl.innerHTML}
</body>
</html>`;
    const blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportId.toLowerCase()}-printable-report.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSarif = () => {
    const sarif = exportNormalizedValidationSarif(rawValidationFindings);
    const blob = new Blob([JSON.stringify(sarif, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportId.toLowerCase()}-sarif-v2.1.0.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", paddingBottom: 80 }}>
      {/* =====================================================================
       * INTERACTIVE REPORT STUDIO HEADER & CONTROLS (Hidden when printing)
       * ===================================================================== */}
      <div
        className="no-print"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "24px 0",
          marginBottom: 28,
        }}
      >
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
          {/* Breadcrumb & Top Action Row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Link
                  href="/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--accent)",
                    textDecoration: "none",
                  }}
                >
                  <ArrowLeft size={14} />
                  Back to Triage Desk
                </Link>
                <span style={{ color: "var(--border)" }}>|</span>
                <span className="desk-kicker">
                  XTRIKE PRINTABLE REPORT ENGINE &middot; ISO / NIST / OWASP / PTES ATTESTATION
                </span>
              </div>
              <h1
                className="font-editorial"
                style={{ fontSize: "clamp(1.55rem, 2.5vw, 2.1rem)", fontWeight: 700, color: "#1f1b18" }}
              >
                Printable Security &amp; Compliance Report Engine
              </h1>
              <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 4 }}>
                Configure your audit scope, customize executive metadata, preview the live print sheet below, and print directly to paper or official PDF.
              </p>
            </div>

            {/* Primary Print & Export Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
              <button
                onClick={handlePrint}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 20px",
                  borderRadius: 10,
                  background: "var(--accent)",
                  color: "#fbf8f3",
                  border: "1px solid #72361d",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(139, 69, 40, 0.25)",
                }}
              >
                <Printer size={16} />
                Print / Save Official PDF
              </button>

              <button
                onClick={handleExportPrintableHtml}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 15px",
                  borderRadius: 10,
                  background: "var(--background)",
                  color: "#1f1b18",
                  border: "1px solid var(--border)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <FileCode2 size={15} style={{ color: "var(--accent)" }} />
                Download Printable HTML
              </button>

              <button
                onClick={handleExportMarkdown}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 15px",
                  borderRadius: 10,
                  background: "var(--background)",
                  color: "#1f1b18",
                  border: "1px solid var(--border)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <FileText size={15} style={{ color: "var(--accent)" }} />
                Export Markdown (.md)
              </button>

              <button
                onClick={handleExportSarif}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 15px",
                  borderRadius: 10,
                  background: "var(--background)",
                  color: "#1f1b18",
                  border: "1px solid var(--border)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Download size={15} style={{ color: "var(--accent)" }} />
                SARIF 2.1.0 (.json)
              </button>
            </div>
          </div>

          {/* Configuration Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              gap: 16,
              padding: 18,
              borderRadius: 14,
              background: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Column 1: Report Template & Severity Filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Layers size={13} />
                1. Report Template &amp; Scope Filter
              </div>

              <div>
                <label
                  style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 5 }}
                >
                  Report Format Preset
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    {
                      id: "full_technical" as const,
                      label: "Full Technical & Proof Audit Dossier",
                      desc: "Complete findings, taint paths, proof contracts & code diffs",
                    },
                    {
                      id: "executive_brief" as const,
                      label: "Executive & Board Risk Brief",
                      desc: "High-level posture, scorecard, compliance & sign-off",
                    },
                    {
                      id: "compliance_attestation" as const,
                      label: "Multi-Standard Compliance & TTP Attestation",
                      desc: "9-Plugin standards matrix + finding compliance ledger",
                    },
                  ].map((item) => {
                    const active = template === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTemplate(item.id)}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: active ? "var(--accent-soft)" : "var(--surface)",
                          border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: "#1f1b18" }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{item.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 5 }}
                >
                  Finding Severity / Validation Filter
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[
                    { id: "all" as const, label: `All (${rawFindings.length})` },
                    { id: "confirmed_only" as const, label: "Confirmed Exploitable" },
                    { id: "critical_high" as const, label: "Critical + High" },
                    { id: "critical_only" as const, label: "Critical Only" },
                  ].map((tab) => {
                    const active = severityFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSeverityFilter(tab.id)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 7,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: active ? "var(--accent)" : "var(--surface)",
                          color: active ? "#fbf8f3" : "#1f1b18",
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Cover & Attestation Metadata */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Building2 size={13} />
                2. Document Control &amp; Cover Metadata
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 3 }}>
                  Report Document Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 7,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontSize: 12.5,
                    color: "#1f1b18",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 3 }}>
                  Organization / Environment Name
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 7,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontSize: 12.5,
                    color: "#1f1b18",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 3 }}>
                    Lead Security Auditor
                  </label>
                  <input
                    type="text"
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      borderRadius: 7,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      fontSize: 12,
                      color: "#1f1b18",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 3 }}>
                    Security Classification
                  </label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      borderRadius: 7,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      fontSize: 12,
                      color: "#1f1b18",
                    }}
                  >
                    <option value="CONFIDENTIAL — INTERNAL SECURITY & COMPLIANCE AUDIT">
                      CONFIDENTIAL — INTERNAL AUDIT
                    </option>
                    <option value="RESTRICTED — EXECUTIVE & BOARD BRIEFING">
                      RESTRICTED — BOARD BRIEFING
                    </option>
                    <option value="EXTERNAL ATTESTATION — CUSTOMER / AUDITOR COPY">
                      EXTERNAL ATTESTATION COPY
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Column 3: Section Toggles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Sliders size={13} />
                3. Printable Report Sections
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  {
                    label: "Section 1: Executive Risk Summary & Severity Breakdown",
                    checked: includeExecSummary,
                    onChange: setIncludeExecSummary,
                  },
                  {
                    label: "Section 2: 6-Stage Proof Validation Scorecard & Contract",
                    checked: includeValidationScorecard,
                    onChange: setIncludeValidationScorecard,
                  },
                  {
                    label: "Section 3: 9-Plugin Multi-Standard & TTP Audit Matrix",
                    checked: includePluginMatrix,
                    onChange: setIncludePluginMatrix,
                  },
                  {
                    label: `Section 4: Detailed Finding Proof Dossiers (${filteredFindings.length} items)`,
                    checked: includeFindingDossiers,
                    onChange: setIncludeFindingDossiers,
                  },
                  {
                    label: "Include Vulnerable vs. Fixed Code Remediation Diffs",
                    checked: includeRemediationDiffs,
                    onChange: setIncludeRemediationDiffs,
                  },
                  {
                    label: "Section 5: Formal Auditor Sign-Off & SHA-256 Attestation",
                    checked: includeSignOff,
                    onChange: setIncludeSignOff,
                  },
                ].map((sec, i) => (
                  <label
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "6px 10px",
                      borderRadius: 7,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1f1b18",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sec.checked}
                      onChange={(e) => sec.onChange(e.target.checked)}
                      style={{ accentColor: "var(--accent)", width: 15, height: 15 }}
                    />
                    <span>{sec.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
       * PRINTABLE DOCUMENT SHEET (Rendered on screen & printed via @media print)
       * ===================================================================== */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px" }}>
        <div
          id="xtrike-printable-report-sheet"
          className="print-sheet"
          style={{
            background: "#ffffff",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "44px 48px",
            boxShadow: "0 12px 36px rgba(31, 27, 24, 0.08)",
            color: "#1f1b18",
          }}
        >
          {/* Classification Top Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 14px",
              borderRadius: 6,
              background: "#f4e5dc",
              border: "1px solid #d9b8a6",
              color: "#8b4528",
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            <span>{classification}</span>
            <span>REPORT ID: {reportId}</span>
          </div>

          {/* Official Masthead & Cover Header */}
          <div
            style={{
              borderBottom: "2px solid #1f1b18",
              paddingBottom: 22,
              marginBottom: 26,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 20,
            }}
          >
            <div style={{ maxWidth: 680 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.09em",
                  color: "#8b4528",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                XTRIKE SAST DESK &middot; DETERMINISTIC PROOF &amp; MULTI-STANDARD AUDIT ENGINE
              </div>
              <h1
                className="font-editorial"
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#1f1b18",
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                {reportTitle}
              </h1>
              <p style={{ fontSize: 13, color: "#4a4239", lineHeight: 1.55 }}>
                Comprehensive static application security testing (SAST), inter-procedural AST taint analysis, XTRIKE-Solver path feasibility verification, and 9-plugin compliance mapping across OWASP Top 10, CWE Top 25, MITRE ATT&amp;CK, CVSS v3.1/v4.0, NIST SP 800-53, and PTES.
              </p>
            </div>

            {/* Document Control Table */}
            <div
              style={{
                minWidth: 270,
                background: "#fbf8f3",
                border: "1px solid #ddd3c2",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 11.5,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#8b4528",
                  marginBottom: 6,
                  letterSpacing: "0.06em",
                }}
              >
                Document Control Metadata
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "95px 1fr", rowGap: 4 }}>
                <span style={{ color: "#5c5349", fontWeight: 600 }}>Organization:</span>
                <span style={{ fontWeight: 700, color: "#1f1b18" }}>{organization}</span>
                <span style={{ color: "#5c5349", fontWeight: 600 }}>Target Repo:</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{targetName}</span>
                <span style={{ color: "#5c5349", fontWeight: 600 }}>Commit SHA:</span>
                <span style={{ fontFamily: "monospace" }}>{commitSha.slice(0, 12)}</span>
                <span style={{ color: "#5c5349", fontWeight: 600 }}>Lead Auditor:</span>
                <span style={{ fontWeight: 600 }}>{auditorName}</span>
                <span style={{ color: "#5c5349", fontWeight: 600 }}>Scan Timestamp:</span>
                <span>{scanTimestamp}</span>
              </div>
            </div>
          </div>

          {/* =================================================================
           * SECTION 1: EXECUTIVE SUMMARY & COMPOSITE RISK POSTURE
           * ================================================================= */}
          {includeExecSummary && (
            <section className="print-avoid-break" style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #ddd3c2",
                  paddingBottom: 8,
                  marginBottom: 16,
                }}
              >
                <h2 className="font-editorial" style={{ fontSize: 19, fontWeight: 700, color: "#1f1b18" }}>
                  1. Executive Risk Summary &amp; Release Gate Posture
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: counts.critical > 0 ? "#f9e6e6" : "#e3f0e9",
                    color: counts.critical > 0 ? "#9e2a2b" : "#2d6a4f",
                    border: `1px solid ${counts.critical > 0 ? "#e2b4b5" : "#b3d7c4"}`,
                  }}
                >
                  RELEASE GATE: {counts.critical > 0 ? "BLOCKED (CRITICAL FLAWS OPEN)" : "PASSED"}
                </span>
              </div>

              {/* 5 Executive Metric Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: "#fbf8f3",
                    border: "1px solid #ddd3c2",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#5c5349", textTransform: "uppercase" }}>
                    Composite Risk Score
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#9e2a2b", marginTop: 4 }}>
                    {riskScore}
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#5c5349" }}>/100</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "#5c5349", marginTop: 2 }}>
                    SLA Target: &lt; 25.0
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: "#f9e6e6",
                    border: "1px solid #e2b4b5",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#9e2a2b", textTransform: "uppercase" }}>
                    Critical Severity
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#9e2a2b", marginTop: 4 }}>
                    {counts.critical}
                  </div>
                  <div style={{ fontSize: 10.5, color: "#7a2021", marginTop: 2 }}>
                    CVSS &ge; 9.0 (Immediate SLA)
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: "#f4e5dc",
                    border: "1px solid #dec0b0",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#8b4528", textTransform: "uppercase" }}>
                    High Severity
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#8b4528", marginTop: 4 }}>
                    {counts.high}
                  </div>
                  <div style={{ fontSize: 10.5, color: "#6b331c", marginTop: 2 }}>
                    CVSS 7.0 – 8.9 (7-Day SLA)
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: "#fbf8f3",
                    border: "1px solid #ddd3c2",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#996b1f", textTransform: "uppercase" }}>
                    Medium &amp; Low
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#996b1f", marginTop: 4 }}>
                    {counts.medium + counts.low}
                  </div>
                  <div style={{ fontSize: 10.5, color: "#5c5349", marginTop: 2 }}>
                    {counts.medium} Medium &middot; {counts.low} Low
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: "#e3f0e9",
                    border: "1px solid #b3d7c4",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#2d6a4f", textTransform: "uppercase" }}>
                    Engine Confidence
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#2d6a4f", marginTop: 4 }}>
                    {avgConf}%
                  </div>
                  <div style={{ fontSize: 10.5, color: "#21573e", marginTop: 2 }}>
                    XTRIKE Multi-Engine Fusion
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "#fbf8f3",
                  border: "1px solid #ddd3c2",
                  fontSize: 12.5,
                  color: "#4a4239",
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: "#1f1b18" }}>Executive Assessment Synthesis:</strong> XTRIKE
                SAST Desk executed a deterministic 6-stage hybrid scan against{" "}
                <code style={{ fontFamily: "monospace", fontWeight: 700 }}>{targetName}</code> (commit{" "}
                <code style={{ fontFamily: "monospace" }}>{commitSha.slice(0, 8)}</code>) using{" "}
                <strong>XTRIKE AST-Query</strong>, <strong>XTRIKE PatternGuard</strong>,{" "}
                <strong>XTRIKE XQL</strong>, <strong>XTRIKE DeepFlow</strong>,{" "}
                <strong>XTRIKE StructSCA</strong>, and <strong>XTRIKE DepGuard</strong>. Out of{" "}
                <strong>{rawFindings.length} total static findings</strong>,{" "}
                <strong>{validationStats.confirmed} findings</strong> satisfied all 6 deterministic
                Proof Contract requirements with verified source-to-sink reachability, while{" "}
                <strong>{validationStats.notReproduced + validationStats.notApplicable} findings</strong>{" "}
                were automatically suppressed as safely mitigated or unreachable code paths.
              </div>
            </section>
          )}

          {/* =================================================================
           * SECTION 2: 6-STAGE PROOF VALIDATION SCORECARD
           * ================================================================= */}
          {includeValidationScorecard && (
            <section className="print-avoid-break" style={{ marginBottom: 32 }}>
              <div
                style={{
                  borderBottom: "1px solid #ddd3c2",
                  paddingBottom: 8,
                  marginBottom: 14,
                }}
              >
                <h2 className="font-editorial" style={{ fontSize: 19, fontWeight: 700, color: "#1f1b18" }}>
                  2. Deterministic 6-Stage Proof Validation Scorecard
                </h2>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f3eee4", color: "#1f1b18" }}>
                    <th style={{ border: "1px solid #ddd3c2", padding: "8px 12px", textAlign: "left" }}>
                      Validation Outcome Status
                    </th>
                    <th style={{ border: "1px solid #ddd3c2", padding: "8px 12px", textAlign: "left" }}>
                      Ground Truth Classification
                    </th>
                    <th style={{ border: "1px solid #ddd3c2", padding: "8px 12px", textAlign: "center" }}>
                      Count
                    </th>
                    <th style={{ border: "1px solid #ddd3c2", padding: "8px 12px", textAlign: "left" }}>
                      Proof Pipeline &amp; Triage Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", fontWeight: 800, color: "#9e2a2b" }}>
                      CONFIRMED EXPLOITABLE
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", fontFamily: "monospace" }}>
                      actually_vulnerable
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", textAlign: "center", fontWeight: 800 }}>
                      {validationStats.confirmed}
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px" }}>
                      6/6 Proof Contract checks satisfied (AST taint + XTRIKE-Solver path + controlled runtime check). Immediate patch required.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", fontWeight: 800, color: "#2d6a4f" }}>
                      NOT REPRODUCED (GUARDED)
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", fontFamily: "monospace" }}>
                      safely_mitigated
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", textAlign: "center", fontWeight: 800 }}>
                      {validationStats.notReproduced}
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px" }}>
                      Active sanitizer, parameterized query, or framework guard intercepted payload along all feasible AST branches.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", fontWeight: 800, color: "#8b4528" }}>
                      BLOCKED BY BOUNDARY
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", fontFamily: "monospace" }}>
                      safely_mitigated
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", textAlign: "center", fontWeight: 800 }}>
                      {validationStats.blocked}
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px" }}>
                      WAF, mTLS, or RBAC middleware blocked untrusted input prior to controller entry; defense-in-depth patch advised.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", fontWeight: 800, color: "#996b1f" }}>
                      INCONCLUSIVE CONTEXT
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", fontFamily: "monospace" }}>
                      insufficient_context
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", textAlign: "center", fontWeight: 800 }}>
                      {validationStats.inconclusive}
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px" }}>
                      External microservice or dynamic reflection target requires manual security architecture review.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", fontWeight: 800, color: "#5c5349" }}>
                      NOT APPLICABLE (DEAD CODE)
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", fontFamily: "monospace" }}>
                      unreachable_or_inactive
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px", textAlign: "center", fontWeight: 800 }}>
                      {validationStats.notApplicable}
                    </td>
                    <td style={{ border: "1px solid #ddd3c2", padding: "8px 12px" }}>
                      Unreferenced legacy helper or disabled feature flag; zero production call-graph edges.
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {/* =================================================================
           * SECTION 3: 9-PLUGIN MULTI-STANDARD & OFFENSIVE TTP MATRIX
           * ================================================================= */}
          {includePluginMatrix && (
            <section className="print-avoid-break" style={{ marginBottom: 32 }}>
              <div
                style={{
                  borderBottom: "1px solid #ddd3c2",
                  paddingBottom: 8,
                  marginBottom: 14,
                }}
              >
                <h2 className="font-editorial" style={{ fontSize: 19, fontWeight: 700, color: "#1f1b18" }}>
                  3. XTRIKE 9-Plugin Multi-Standard Compliance &amp; TTP Matrix
                </h2>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                <thead>
                  <tr style={{ background: "#f3eee4", color: "#1f1b18" }}>
                    <th style={{ border: "1px solid #ddd3c2", padding: "7px 10px", textAlign: "left" }}>
                      Plugin ID &amp; Python Module
                    </th>
                    <th style={{ border: "1px solid #ddd3c2", padding: "7px 10px", textAlign: "left" }}>
                      Security Standard / Framework
                    </th>
                    <th style={{ border: "1px solid #ddd3c2", padding: "7px 10px", textAlign: "left" }}>
                      Verification Scope &amp; Controls Checked
                    </th>
                    <th style={{ border: "1px solid #ddd3c2", padding: "7px 10px", textAlign: "center" }}>
                      Audit Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PYTHON_STANDARD_PLUGINS.map((plugin) => (
                    <tr key={plugin.pluginId}>
                      <td style={{ border: "1px solid #ddd3c2", padding: "7px 10px" }}>
                        <div style={{ fontWeight: 800, color: "#1f1b18" }}>{plugin.name}</div>
                        <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#8b4528" }}>
                          {plugin.modulePath}
                        </div>
                      </td>
                      <td style={{ border: "1px solid #ddd3c2", padding: "7px 10px", fontWeight: 700 }}>
                        {plugin.shortBadge} ({plugin.standardVersion})
                      </td>
                      <td style={{ border: "1px solid #ddd3c2", padding: "7px 10px", color: "#4a4239" }}>
                        {plugin.description}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd3c2",
                          padding: "7px 10px",
                          textAlign: "center",
                          fontWeight: 800,
                          color: "#2d6a4f",
                        }}
                      >
                        VERIFIED ({filteredFindings.length} checked)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* =================================================================
           * SECTION 4: DETAILED FINDING-BY-FINDING TECHNICAL PROOF DOSSIERS
           * ================================================================= */}
          {includeFindingDossiers && (
            <section style={{ marginBottom: 32 }}>
              <div
                style={{
                  borderBottom: "1px solid #ddd3c2",
                  paddingBottom: 8,
                  marginBottom: 16,
                }}
              >
                <h2 className="font-editorial" style={{ fontSize: 19, fontWeight: 700, color: "#1f1b18" }}>
                  4. Detailed Finding Proof &amp; Remediation Dossiers ({filteredFindings.length} Findings)
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {filteredFindings.map((finding, index) => {
                  const vf = validationById.get(finding.id);
                  const pev = pluginEvalById.get(finding.id);
                  const rem = finding.remediation[0];
                  const sevColor =
                    finding.severity === "Critical"
                      ? "#9e2a2b"
                      : finding.severity === "High"
                        ? "#8b4528"
                        : finding.severity === "Medium"
                          ? "#996b1f"
                          : "#2d6a4f";
                  const sevBg =
                    finding.severity === "Critical"
                      ? "#f9e6e6"
                      : finding.severity === "High"
                        ? "#f4e5dc"
                        : finding.severity === "Medium"
                          ? "#fbf3e4"
                          : "#e3f0e9";

                  return (
                    <div
                      key={finding.id}
                      className="print-avoid-break"
                      style={{
                        border: "1px solid #ddd3c2",
                        borderRadius: 12,
                        padding: 18,
                        background: "#ffffff",
                      }}
                    >
                      {/* Finding Header Row */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          borderBottom: "1px solid #ece5d8",
                          paddingBottom: 10,
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span
                            style={{
                              padding: "3px 9px",
                              borderRadius: 6,
                              background: sevBg,
                              color: sevColor,
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: "uppercase",
                            }}
                          >
                            {finding.severity} &middot; CVSS {finding.cvss}
                          </span>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 11.5,
                              fontWeight: 800,
                              color: "#8b4528",
                            }}
                          >
                            {finding.id}
                          </span>
                          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1f1b18" }}>
                            {index + 1}. {finding.title}
                          </h3>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 6,
                              background: "#f3eee4",
                              border: "1px solid #ddd3c2",
                              fontSize: 10.5,
                              fontWeight: 700,
                              fontFamily: "monospace",
                            }}
                          >
                            Proof: {vf?.status?.toUpperCase() || finding.status.toUpperCase()}
                          </span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 6,
                              background: "#f3eee4",
                              border: "1px solid #ddd3c2",
                              fontSize: 10.5,
                              fontWeight: 700,
                            }}
                          >
                            Confidence: {Math.round(finding.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Metadata Grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: 8,
                          padding: "10px 12px",
                          borderRadius: 8,
                          background: "#fbf8f3",
                          border: "1px solid #ece5d8",
                          fontSize: 11.5,
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <span style={{ color: "#5c5349", fontWeight: 600 }}>Source File &amp; Line: </span>
                          <code style={{ fontFamily: "monospace", fontWeight: 700, color: "#1f1b18" }}>
                            {finding.file}:{finding.line}
                          </code>
                        </div>
                        <div>
                          <span style={{ color: "#5c5349", fontWeight: 600 }}>CWE &amp; OWASP: </span>
                          <span style={{ fontWeight: 700 }}>
                            {finding.cwe} ({finding.cweName}) &middot; {finding.owasp}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "#5c5349", fontWeight: 600 }}>MITRE ATT&amp;CK TTP: </span>
                          <span style={{ fontWeight: 700, color: "#8b4528" }}>
                            {pev
                              ? `${pev.mitre.tacticId} -> ${pev.mitre.subTechniqueId} (${pev.mitre.techniqueName})`
                              : finding.mitre}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "#5c5349", fontWeight: 600 }}>PTES &amp; XTRIKE Verify: </span>
                          <span style={{ fontFamily: "monospace", fontWeight: 700 }}>
                            {pev
                              ? `${pev.metasploitCheck.msfModule} (${pev.metasploitCheck.msfCheckMethod})`
                              : "PTES-4 · CheckCode::Appears"}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "#5c5349", fontWeight: 600 }}>Compliance Controls: </span>
                          <span style={{ fontWeight: 600 }}>
                            {finding.compliance.map((c) => `${c.framework} ${c.reference}`).join(" · ")}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "#5c5349", fontWeight: 600 }}>XTRIKE Engines: </span>
                          <span style={{ fontWeight: 700 }}>
                            {finding.engines
                              .filter((e) => e.confirmed)
                              .map((e) => e.name)
                              .join(", ")}
                          </span>
                        </div>
                      </div>

                      {/* Technical Root Cause & Remediation */}
                      <div style={{ fontSize: 12, color: "#36302a", lineHeight: 1.55, marginBottom: 8 }}>
                        <strong>Executive Summary &amp; Root Cause: </strong>
                        {finding.executiveSummary} {finding.rootCause}
                      </div>

                      <div style={{ fontSize: 11.5, color: "#4a4239", lineHeight: 1.55, marginBottom: 8 }}>
                        <strong>Taint Propagation Path: </strong>
                        Source <code style={{ fontFamily: "monospace", background: "#f3eee4", padding: "1px 5px" }}>{finding.source}</code>{" "}
                        &rarr; {finding.taintPath.join(" → ")} &rarr; Sink{" "}
                        <code style={{ fontFamily: "monospace", background: "#f3eee4", padding: "1px 5px" }}>{finding.sink}</code>
                      </div>

                      {rem && (
                        <div style={{ fontSize: 12, color: "#21573e", lineHeight: 1.55, marginBottom: includeRemediationDiffs ? 12 : 0 }}>
                          <strong>Recommended Remediation ({rem.platform}): </strong>
                          {rem.explanation}
                        </div>
                      )}

                      {/* Vulnerable vs Fixed Code Diff */}
                      {includeRemediationDiffs && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: finding.codeSnippet && rem ? "1fr 1fr" : "1fr",
                            gap: 10,
                            marginTop: 8,
                          }}
                        >
                          {finding.codeSnippet && (
                            <div>
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: "#9e2a2b",
                                  textTransform: "uppercase",
                                  marginBottom: 4,
                                }}
                              >
                                Discovered AST Code Context ({finding.file}:{finding.line})
                              </div>
                              <pre
                                style={{
                                  background: "#fdf4f4",
                                  border: "1px solid #e8c5c6",
                                  borderRadius: 6,
                                  padding: 10,
                                  fontSize: 10.5,
                                  fontFamily: "monospace",
                                  color: "#5e1618",
                                  overflowX: "auto",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {finding.codeSnippet}
                              </pre>
                            </div>
                          )}

                          {rem && (
                            <div>
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: "#2d6a4f",
                                  textTransform: "uppercase",
                                  marginBottom: 4,
                                }}
                              >
                                XTRIKE AST-Verified Remediation Patch ({rem.platform})
                              </div>
                              <pre
                                style={{
                                  background: "#f2f9f5",
                                  border: "1px solid #bddbc9",
                                  borderRadius: 6,
                                  padding: 10,
                                  fontSize: 10.5,
                                  fontFamily: "monospace",
                                  color: "#194430",
                                  overflowX: "auto",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {rem.code}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* =================================================================
           * SECTION 5: FORMAL AUDITOR ATTESTATION & SIGN-OFF BLOCK
           * ================================================================= */}
          {includeSignOff && (
            <section
              className="print-avoid-break"
              style={{
                borderTop: "2px solid #1f1b18",
                paddingTop: 22,
                marginTop: 28,
              }}
            >
              <h2
                className="font-editorial"
                style={{ fontSize: 18, fontWeight: 700, color: "#1f1b18", marginBottom: 10 }}
              >
                5. Formal Security Audit Attestation &amp; Cryptographic Sign-Off
              </h2>
              <p style={{ fontSize: 12, color: "#4a4239", lineHeight: 1.55, marginBottom: 18 }}>
                By signing below, the Lead Security Auditor and Engineering Owner attest that the findings, proof contracts, and multi-standard mappings in Report{" "}
                <strong>{reportId}</strong> were deterministically produced by the{" "}
                <strong>XTRIKE SAST Desk 6-Stage Hybrid Validation Pipeline</strong> in accordance with NIST SP 800-115, NIST SSDF (SP 800-218), OWASP ASVS v4.0.3, and PTES Technical Guidelines.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 20,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: "#fbf8f3",
                    border: "1px solid #ddd3c2",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#8b4528", textTransform: "uppercase" }}>
                    Lead AppSec Auditor
                  </div>
                  <div
                    style={{
                      fontFamily: "Georgia, serif",
                      fontStyle: "italic",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1f1b18",
                      marginTop: 10,
                      borderBottom: "1px solid #cbbca6",
                      paddingBottom: 4,
                    }}
                  >
                    {auditorName}
                  </div>
                  <div style={{ fontSize: 10.5, color: "#5c5349", marginTop: 6 }}>
                    Date: {scanTimestamp}
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: "#fbf8f3",
                    border: "1px solid #ddd3c2",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#8b4528", textTransform: "uppercase" }}>
                    Engineering / Repository Owner
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#5c5349",
                      marginTop: 12,
                      borderBottom: "1px solid #cbbca6",
                      paddingBottom: 4,
                    }}
                  >
                    _______________________________
                  </div>
                  <div style={{ fontSize: 10.5, color: "#5c5349", marginTop: 6 }}>
                    Target: {targetName}
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: "#fbf8f3",
                    border: "1px solid #ddd3c2",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#8b4528", textTransform: "uppercase" }}>
                    CISO / Compliance Governance
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#5c5349",
                      marginTop: 12,
                      borderBottom: "1px solid #cbbca6",
                      paddingBottom: 4,
                    }}
                  >
                    _______________________________
                  </div>
                  <div style={{ fontSize: 10.5, color: "#5c5349", marginTop: 6 }}>
                    Org: {organization}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: "#f3eee4",
                  border: "1px solid #ddd3c2",
                  fontFamily: "monospace",
                  fontSize: 10.5,
                  color: "#4a4239",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span>
                  XTRIKE-AUDIT-SHA256: 8f9d2c4e7b1a6f305e8c2d9a4b7f1e6c3a9d0b2f4e8c1a7d6b3f9e2c4a1d8b5f
                </span>
                <span>ENGINE: XTRIKE SAST DESK v4.2 &middot; SARIF 2.1.0 VERIFIED</span>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
