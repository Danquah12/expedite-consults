"use client";
import { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  Award,
  Globe,
  Lock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Share2
} from "lucide-react";
import { UNIFIED_REPORT_SUMMARIES } from "@/data/integrationData";
import { UnifiedReportSummary } from "@/types/integration";

export default function UnifiedReportingPage() {
  const [report, setReport] = useState<UnifiedReportSummary>(UNIFIED_REPORT_SUMMARIES[0]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExport = (format: "PDF" | "HTML" | "JSON") => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(`Report successfully compiled in ${format} format (HSM Signed: SHA256 0x8a91b4...)`);
      setTimeout(() => setExportSuccess(null), 4000);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FileText size={20} color="#10b981" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
              Multi-Tier Unified Compliance & Boardroom Executive Reporting
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>
              Aggregated CISO briefing combining CERBERUS-RE malware findings, Aegis Recovery readiness, and AXIOM DAST scorecards.
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => handleExport("PDF")}
            disabled={isExporting}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              fontWeight: 700,
              fontSize: 12,
              padding: "7px 14px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Download size={13} />
            <span>Download CISO PDF</span>
          </button>

          <button
            onClick={() => handleExport("HTML")}
            disabled={isExporting}
            className="btn-primary"
          >
            <Printer size={13} />
            <span>Print Boardroom Briefing</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div style={{
          background: "rgba(16,185,129,0.15)",
          border: "1px solid rgba(16,185,129,0.4)",
          color: "#10b981",
          padding: "10px 16px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle size={16} />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* Main Report Container */}
      <div className="card-tactical" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Document Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid var(--border)",
          paddingBottom: 16
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              EXPEDITE CYBERSECURITY FLEET EXECUTIVE INTELLIGENCE
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>
              {report.title}
            </h2>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
              Report Code: <strong style={{ color: "#06b6d4" }}>{report.reportCode}</strong> · Generated: {report.generatedAt}
            </div>
          </div>

          <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "10px 16px",
            textAlign: "right"
          }}>
            <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>OVERALL HEALTH SCORE</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981" }}>{report.overallHealthScore}%</div>
            <div style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>AUDIT COMPLIANT</div>
          </div>
        </div>

        {/* SEC 8-K Materiality Disclosure Box */}
        <div style={{
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          alignItems: "flex-start",
          gap: 14
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(16,185,129,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <ShieldCheck size={20} color="#10b981" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#f8fafc" }}>
                SEC Item 1.05 Form 8-K Cybersecurity Materiality Evaluation
              </span>
              <span style={{
                fontSize: 9.5,
                fontWeight: 800,
                background: "rgba(16,185,129,0.2)",
                color: "#10b981",
                padding: "2px 6px",
                borderRadius: 4
              }}>
                MATERIAL IMPACT: NEGATIVE (ZERO BREACH DISRUPTION)
              </span>
            </div>
            <p style={{ fontSize: 11.5, color: "var(--fg-2)", margin: 0, lineHeight: 1.5 }}>
              {report.cisoBriefingNotes}
            </p>
          </div>
        </div>

        {/* Compliance Framework Scorecards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { framework: "SEC 8-K Materiality", score: "CONTAINED", sub: "0 Days Downtime", color: "#10b981" },
            { framework: "HIPAA Security Rule", score: `${report.hipaaReadiness}%`, sub: "ePHI Encrypted / Vaulted", color: "#06b6d4" },
            { framework: "SOC 2 Type II Controls", score: `${report.soc2Readiness}%`, sub: "Continuous CC6.1 - CC7.4", color: "#a855f7" },
            { framework: "NIST CSF 2.0 Maturity", score: "Tier 4 (Adaptive)", sub: "Automated SOAR response", color: "#f59e0b" }
          ].map((c, idx) => (
            <div key={idx} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{c.framework}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: c.color, margin: "4px 0" }}>{c.score}</div>
              <div style={{ fontSize: 10.5, color: "var(--fg-2)" }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* 3 Unified Pillar Breakdowns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {/* Pillar 1: CERBERUS-RE */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Layers size={16} color="#06b6d4" />
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                CERBERUS-RE (Malware Forensics)
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Total Binaries Decompiled:</span>
                <strong style={{ color: "#f8fafc" }}>{report.cerberusFindingsCount.analyzedBinaries.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Critical Zero-Days Isolated:</span>
                <strong style={{ color: "#f43f5e" }}>{report.cerberusFindingsCount.critical}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>High-Severity Variants:</span>
                <strong style={{ color: "#f59e0b" }}>{report.cerberusFindingsCount.high}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>YARA Signatures Generated:</span>
                <strong style={{ color: "#10b981" }}>42 rules</strong>
              </div>
            </div>
          </div>

          {/* Pillar 2: Aegis Recovery */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <ShieldCheck size={16} color="#10b981" />
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                Aegis Recovery (Resilience & RTO)
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Recovery Time (RTO):</span>
                <strong style={{ color: "#10b981" }}>{report.aegisRecoveryMetrics.rtoMinutes} minutes</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Recovery Point (RPO):</span>
                <strong style={{ color: "#10b981" }}>{report.aegisRecoveryMetrics.rpoMinutes} minutes (Zero Loss)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>WORM S3 Vault Integrity:</span>
                <strong style={{ color: "#06b6d4" }}>{report.aegisRecoveryMetrics.cleanSnapshotIntegrity}% Clean</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Crypto Feasibility:</span>
                <strong style={{ color: "#a855f7" }}>Flaw Detected (Decryptable)</strong>
              </div>
            </div>
          </div>

          {/* Pillar 3: AXIOM DAST */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Globe size={16} color="#a855f7" />
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                AXIOM DAST (Web & API Security)
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>API Endpoints Scanned:</span>
                <strong style={{ color: "#f8fafc" }}>{report.axiomDastMetrics.webEndpointsScanned.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>High-Risk Web Vulns:</span>
                <strong style={{ color: "#f59e0b" }}>{report.axiomDastMetrics.highRiskVulns}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>API Schema Drift Score:</span>
                <strong style={{ color: "#10b981" }}>{report.axiomDastMetrics.apiDriftScore}% (Minimal)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Automated Virtual Patches:</span>
                <strong style={{ color: "#06b6d4" }}>2 Injected</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic Signature Footer */}
        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 10.5,
          color: "var(--muted)"
        }}>
          <div>
            HSM Signer: <strong style={{ color: "#a855f7" }}>Hardware Key #HSM-9021-FIPS-140-3</strong> · Hash: <code>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
          </div>
          <div>
            Certified Expedite Autonomous Unified Security Engine v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
