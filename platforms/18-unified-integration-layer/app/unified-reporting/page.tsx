"use client";
import { useState } from "react";
import {
  FileText, Download, Printer, ShieldCheck, CheckCircle, AlertTriangle,
  Layers, FileSpreadsheet, Award, Globe, Lock, Sparkles, ChevronRight,
  TrendingUp, Share2, Info, HelpCircle, DollarSign, Clock, CheckCircle2,
  Shield, Check, AlertOctagon, RefreshCw
} from "lucide-react";
import { UNIFIED_REPORT_SUMMARIES } from "@/data/integrationData";
import { UnifiedReportSummary } from "@/types/integration";

export default function UnifiedReportingPage() {
  const [report, setReport] = useState<UnifiedReportSummary>(UNIFIED_REPORT_SUMMARIES[0] || {} as any);
  const [selectedFramework, setSelectedFramework] = useState<"SEC_8K" | "HIPAA" | "SOC2" | "NIST" | "ISO">("SEC_8K");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  
  // Interactive Financial Impact Calculator State
  const [hourlyRevenueLoss, setHourlyRevenueLoss] = useState<number>(60000);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiExecutiveSummary, setAiExecutiveSummary] = useState<string>(
    "Expedite Security Ecosystem successfully contained LockBit 3.0 stage-2 payload within 410ms and verified WORM S3 snapshot immutability across 44.2 TB. Operational disruption: 0 days. Under SEC Item 1.05 Form 8-K guidelines, this incident is non-material and requires no emergency public disclosure. Total downtime loss avoided: $840,000."
  );

  const handleExport = (format: "PDF" | "HTML" | "JSON") => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(`Executive Briefing compiled in ${format} format with SHA-256 HSM Digital Seal: 0x8a91b42...`);
      setTimeout(() => setExportSuccess(null), 5000);
    }, 900);
  };

  const handleRegenerateAiSummary = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setIsAiGenerating(false);
      setAiExecutiveSummary(
        `AI Executive Synthesis (Updated ${new Date().toLocaleTimeString()}): All 16 platforms report optimal compliance posture (96.4%). AXIOM DAST audited 3,410 endpoints with zero unpatched critical vulnerabilities. Aegis Recovery validated WORM S3 immutable backups. Enterprise audit readiness: SEC 8-K (Contained), HIPAA (99.2%), SOC 2 Type II (98.8%), NIST CSF 2.0 (Tier 4 Adaptive).`
      );
    }, 700);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ── Top Header Banner with Plain-English Explainer ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 50%, rgba(139,92,246,0.1) 100%)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 12,
        padding: "18px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(16,185,129,0.35)"
          }}>
            <FileText size={24} color="#050811" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
                Multi-Tier Unified Compliance & Boardroom Executive Reporting
              </h1>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.3)",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}>
                AUDIT COMPLIANT
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "3px 0 0 0" }}>
              Boardroom-ready intelligence combining malware forensics, ransomware resilience, and web vulnerability scorecards into executive risk ratings.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => handleExport("PDF")}
            disabled={isExporting}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              fontWeight: 700,
              fontSize: 12,
              padding: "8px 16px",
              borderRadius: 8,
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
            style={{ fontSize: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Printer size={13} />
            <span>Print Boardroom Briefing</span>
          </button>
        </div>
      </div>

      {/* ── Plain-English "What Does This Page Mean?" Helper Card ── */}
      <div style={{
        background: "rgba(56,189,248,0.06)",
        border: "1px solid rgba(56,189,248,0.25)",
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12
      }}>
        <Info size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--foreground-muted)" }}>
          <strong style={{ color: "#38bdf8" }}>Plain-English Executive Overview: </strong>
          This briefing translates complex technical security data into business risk terms. It proves whether your company meets regulatory standards (like SEC 8-K breach reporting, HIPAA patient privacy, and SOC 2 audits) and quantifies how much financial downtime loss was prevented by autonomous security defenses.
        </div>
      </div>

      {exportSuccess && (
        <div style={{
          background: "rgba(16,185,129,0.15)",
          border: "1px solid #10b981",
          color: "#10b981",
          padding: "10px 16px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* ── SEC 8-K Materiality & Overall Health Card ── */}
      <div className="card-tactical" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              EXPEDITE CYBERSECURITY FLEET EXECUTIVE INTELLIGENCE
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>
              Executive Cybersecurity Posture & SEC 8-K Materiality Briefing
            </h2>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
              Report Code: {report.reportCode || "EXP-EXEC-2026-08-24"} · Generated: {report.generatedAt || "2026-08-28 01:00:00 UTC"} · HSM Signed
            </div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))",
            border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: 10,
            padding: "10px 18px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Overall Health Score</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981" }}>{report.overallHealthScore || 96.4}%</div>
            <div style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>AUDIT COMPLIANT</div>
          </div>
        </div>

        {/* SEC Item 1.05 Banner */}
        <div style={{
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <ShieldCheck size={20} color="#10b981" />
          <div style={{ flex: 1, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <strong style={{ color: "#f8fafc" }}>SEC Item 1.05 Form 8-K Cybersecurity Materiality Evaluation:</strong>
              <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(16,185,129,0.2)", color: "#10b981", padding: "1px 6px", borderRadius: 3 }}>
                MATERIAL IMPACT: NEGATIVE (ZERO BREACH DISRUPTION)
              </span>
            </div>
            <p style={{ color: "var(--foreground-muted)", margin: 0, lineHeight: 1.4 }}>
              All critical ransomware loader indicators were quarantined within 410ms. WORM backup storage verified intact. No exfiltration of customer PII detected. SEC 8-K 4-day disclosure threshold NOT triggered.
            </p>
          </div>
        </div>
      </div>

      {/* ── Interactive Framework Switcher Tabs ── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          { id: "SEC_8K", label: "SEC Item 1.05 Form 8-K", score: "CONTAINED", sub: "0 Days Downtime", color: "#10b981" },
          { id: "HIPAA", label: "HIPAA Security Rule", score: `${report.hipaaReadiness || 99.2}%`, sub: "ePHI Encrypted / Vaulted", color: "#06b6d4" },
          { id: "SOC2", label: "SOC 2 Type II Controls", score: `${report.soc2Readiness || 98.8}%`, sub: "Continuous CC6.1 - CC7.4", color: "#a855f7" },
          { id: "NIST", label: "NIST CSF 2.0 Maturity", score: "Tier 4", sub: "Adaptive Automated SOAR", color: "#f59e0b" }
        ].map(fw => (
          <button
            key={fw.id}
            onClick={() => setSelectedFramework(fw.id as any)}
            style={{
              flex: 1,
              minWidth: 200,
              textAlign: "left",
              padding: "12px 16px",
              borderRadius: 8,
              border: selectedFramework === fw.id ? `1px solid ${fw.color}` : "1px solid var(--border)",
              background: selectedFramework === fw.id ? "var(--surface-3)" : "var(--surface-2)",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{fw.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: "2px 0" }}>{fw.score}</div>
            <div style={{ fontSize: 11, color: fw.color, fontWeight: 600 }}>{fw.sub}</div>
          </button>
        ))}
      </div>

      {/* ── 3 Core Platform Summary Pillars ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        
        {/* Pillar 1: CERBERUS-RE */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={16} color="#06b6d4" />
            <strong style={{ fontSize: 13, color: "#f8fafc" }}>CERBERUS-RE (Malware Forensics)</strong>
          </div>
          <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, fontSize: 11.5, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Total Binaries Decompiled:</span>
              <strong style={{ color: "#f8fafc" }}>{(report.cerberusFindingsCount?.analyzedBinaries || 1840).toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Critical Zero-Days Isolated:</span>
              <strong style={{ color: "#f43f5e" }}>{report.cerberusFindingsCount?.critical || 3}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>High-Severity Variants:</span>
              <strong style={{ color: "#f59e0b" }}>{report.cerberusFindingsCount?.high || 14}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>YARA Signatures Generated:</span>
              <strong style={{ color: "#10b981" }}>42 rules</strong>
            </div>
          </div>
        </div>

        {/* Pillar 2: Aegis Recovery */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={16} color="#10b981" />
            <strong style={{ fontSize: 13, color: "#f8fafc" }}>Aegis Recovery (Resilience & RTO)</strong>
          </div>
          <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, fontSize: 11.5, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Recovery Time (RTO):</span>
              <strong style={{ color: "#10b981" }}>{report.aegisRecoveryMetrics?.rtoMinutes || 14} minutes</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Recovery Point (RPO):</span>
              <strong style={{ color: "#10b981" }}>{report.aegisRecoveryMetrics?.rpoMinutes || 0} minutes (Zero Loss)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>WORM S3 Vault Integrity:</span>
              <strong style={{ color: "#10b981" }}>{report.aegisRecoveryMetrics?.cleanSnapshotIntegrity || 100}% Clean</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Crypto Feasibility:</span>
              <strong style={{ color: "#06b6d4" }}>Flaw Detected (Decryptable)</strong>
            </div>
          </div>
        </div>

        {/* Pillar 3: AXIOM DAST */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Globe size={16} color="#a855f7" />
            <strong style={{ fontSize: 13, color: "#f8fafc" }}>AXIOM DAST (Web & API Security)</strong>
          </div>
          <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, fontSize: 11.5, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>API Endpoints Scanned:</span>
              <strong style={{ color: "#f8fafc" }}>{(report.axiomDastMetrics?.webEndpointsScanned || 3410).toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>High-Risk Web Vulns:</span>
              <strong style={{ color: "#f43f5e" }}>{report.axiomDastMetrics?.highRiskVulns || 2}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>API Schema Drift Score:</span>
              <strong style={{ color: "#10b981" }}>{report.axiomDastMetrics?.apiDriftScore || 1.2}% (Minimal)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Automated Virtual Patches:</span>
              <strong style={{ color: "#10b981" }}>2 Injected</strong>
            </div>
          </div>
        </div>

      </div>

      {/* ── Interactive AI Executive Summary Generator ── */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} color="#a855f7" />
            <strong style={{ fontSize: 14, color: "#f8fafc" }}>AI Executive Synthesis for Board Members</strong>
          </div>
          <button
            onClick={handleRegenerateAiSummary}
            disabled={isAiGenerating}
            style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              color: "#c084fc",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <RefreshCw size={11} className={isAiGenerating ? "animate-spin" : ""} />
            <span>Regenerate Summary</span>
          </button>
        </div>

        <div style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 14,
          fontSize: 12.5,
          color: "var(--foreground-muted)",
          lineHeight: 1.6
        }}>
          {aiExecutiveSummary}
        </div>
      </div>

    </div>
  );
}
