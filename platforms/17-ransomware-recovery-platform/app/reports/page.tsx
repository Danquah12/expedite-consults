"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  Sliders,
  Copy,
  Layers,
  Sparkles,
  Building,
  Activity
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

export default function ReportsPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [reportType, setReportType] = useState<"EXECUTIVE" | "TECHNICAL_DFIR" | "INSURANCE" | "REGULATORY">("EXECUTIVE");
  const [maskPII, setMaskPII] = useState(true);
  const [maskIPs, setMaskIPs] = useState(false);
  const [maskWallets, setMaskWallets] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCase = MOCK_CASES.find(c => c.id === selectedCaseId) || MOCK_CASES[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(`# AEGIS INCIDENT REPORT: ${activeCase.caseNumber}\n\nOrganization: ${activeCase.organization}\nRansomware Variant: ${activeCase.ransomwareFamily}\nStatus: ${activeCase.status}\nRTO: ${activeCase.estimatedRecoveryTimeHours} Hours\nPrimary Recovery Path: ${activeCase.primaryRecoveryPath}`);
    showToast("Report markdown summary copied to clipboard.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: 70,
          right: 24,
          zIndex: 100,
          background: "rgba(16, 185, 129, 0.95)",
          color: "#04100c",
          padding: "10px 18px",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 13,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        padding: "16px 20px",
        borderRadius: 8,
        border: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "rgba(6, 182, 212, 0.15)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FileSpreadsheet size={22} color="#06b6d4" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                Multi-Tier Post-Incident Forensic & Executive Reporting
              </h1>
              <span className="badge-sev badge-medium">PILLAR 5 · REPORT</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Generates Board Briefings, Technical DFIR Reports, Insurance Proof-of-Loss & HIPAA / SEC 8-K Regulatory Disclosures.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="tool-select"
            style={{ fontWeight: 600 }}
          >
            {MOCK_CASES.map(c => (
              <option key={c.id} value={c.id}>
                {c.caseNumber}: {c.organization}
              </option>
            ))}
          </select>

          <button
            onClick={() => showToast("Exported full formatted report package (PDF).")}
            className="btn-primary"
          >
            <Download size={14} />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Report Tier Selector & Redaction Options Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        padding: "12px 18px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        flexWrap: "wrap",
        gap: 12
      }}>
        {/* Tier Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[
            { key: "EXECUTIVE", label: "Executive Board Briefing" },
            { key: "TECHNICAL_DFIR", label: "Technical DFIR & Cryptography" },
            { key: "INSURANCE", label: "Cyber Insurance Proof-of-Loss" },
            { key: "REGULATORY", label: "Regulatory Breach Disclosure (HIPAA / SEC)" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key as any)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: reportType === tab.key ? "rgba(6, 182, 212, 0.2)" : "var(--surface-2)",
                color: reportType === tab.key ? "#06b6d4" : "var(--muted)",
                border: reportType === tab.key ? "1px solid rgba(6, 182, 212, 0.4)" : "1px solid var(--border)"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Redaction Toggles */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11.5 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={maskPII}
              onChange={e => setMaskPII(e.target.checked)}
              style={{ accentColor: "#10b981" }}
            />
            <span style={{ color: "var(--fg-2)" }}>Mask PHI / PII</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={maskIPs}
              onChange={e => setMaskIPs(e.target.checked)}
              style={{ accentColor: "#10b981" }}
            />
            <span style={{ color: "var(--fg-2)" }}>Anonymize IPs</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={maskWallets}
              onChange={e => setMaskWallets(e.target.checked)}
              style={{ accentColor: "#10b981" }}
            />
            <span style={{ color: "var(--fg-2)" }}>Redact Crypto Wallets</span>
          </label>

          <button
            onClick={handleCopyMarkdown}
            className="btn-secondary"
            style={{ padding: "4px 8px", fontSize: 11 }}
          >
            <Copy size={12} />
            <span>Copy Markdown</span>
          </button>
        </div>
      </div>

      {/* Interactive Document Preview Pane */}
      <div className="card-tactical" style={{
        padding: 32,
        background: "#0a0f1d",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}>
        {/* Document Header Letterhead */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid var(--border)",
          paddingBottom: 16
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#10b981", textTransform: "uppercase" }}>
              AEGIS INCIDENT RESPONSE & DIGITAL FORENSICS GROUP
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
              {reportType === "EXECUTIVE" && "EXECUTIVE CYBER INCIDENT BOARD BRIEFING"}
              {reportType === "TECHNICAL_DFIR" && "TECHNICAL FORENSIC & CRYPTOGRAPHIC ROOT-CAUSE REPORT"}
              {reportType === "INSURANCE" && "CYBER INSURANCE FORMAL PROOF-OF-LOSS CLAIM LEDGER"}
              {reportType === "REGULATORY" && "REGULATORY MATERIAL BREACH NOTIFICATION (HIPAA § 164.400 / SEC 8-K)"}
            </h2>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              Case File: {activeCase.caseNumber} · Issued: {new Date().toLocaleDateString()} · Classification: STRICTLY CONFIDENTIAL
            </div>
          </div>

          <div style={{
            padding: "8px 14px",
            borderRadius: 6,
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            textAlign: "right"
          }}>
            <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>DIGITAL SEAL</div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#10b981", fontWeight: 700 }}>SHA-256: 0x9f88a...e102</div>
          </div>
        </div>

        {/* Metadata Summary Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          background: "var(--surface-2)",
          padding: 14,
          borderRadius: 6,
          border: "1px solid var(--border)",
          fontSize: 12
        }}>
          <div>
            <span style={{ color: "var(--muted)", display: "block", fontSize: 10.5 }}>VICTIM ORGANIZATION</span>
            <strong style={{ color: "var(--fg)" }}>{activeCase.organization}</strong>
          </div>
          <div>
            <span style={{ color: "var(--muted)", display: "block", fontSize: 10.5 }}>THREAT ACTOR / FAMILY</span>
            <strong style={{ color: "#f43f5e" }}>{activeCase.ransomwareFamily} ({activeCase.threatActor})</strong>
          </div>
          <div>
            <span style={{ color: "var(--muted)", display: "block", fontSize: 10.5 }}>IMPACTED ASSETS</span>
            <strong style={{ color: "var(--fg)" }}>{activeCase.affectedHosts} Hosts / {activeCase.totalDataSizeGB} GB</strong>
          </div>
          <div>
            <span style={{ color: "var(--muted)", display: "block", fontSize: 10.5 }}>RECOVERY PATH / RTO</span>
            <strong style={{ color: "#10b981" }}>{activeCase.primaryRecoveryPath} ({activeCase.estimatedRecoveryTimeHours}h)</strong>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            1. Incident Overview & Operational Impact Summary
          </h3>
          <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.6 }}>
            On <strong>{activeCase.createdAt}</strong>, {activeCase.organization} experienced an automated ransomware intrusion deploying {activeCase.ransomwareFamily}. The threat actor gained initial execution via compromised administrator credentials, executing mass encryption across {activeCase.affectedHosts} core virtual machines and attempting shadow copy deletion. Forensic evidence confirms the threat actor demanded <strong>${activeCase.ransomDemandUSD.toLocaleString()} USD</strong> in {activeCase.cryptoCurrency} ({maskWallets ? "bc1q[REDACTED]" : activeCase.walletAddress}).
          </p>
        </div>

        {/* Section 2: Technical & Cryptographic Findings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            2. Cryptographic Analysis & Feasibility Findings
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cipher Algorithm</th>
                  <th>Encryption Mode</th>
                  <th>Key Size</th>
                  <th>Entropy Score</th>
                  <th>Recoverability Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ChaCha20 + Curve25519</td>
                  <td>Block Cipher (512B Header)</td>
                  <td>256-bit</td>
                  <td>7.988 (High)</td>
                  <td><span className="badge-sev badge-success">Recovered via Immutable S3</span></td>
                </tr>
                <tr>
                  <td>AES-256-CTR</td>
                  <td>Intermittent (50%)</td>
                  <td>256-bit</td>
                  <td>7.912 (High)</td>
                  <td><span className="badge-sev badge-success">Headers Rebuilt</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Recovery Timeline & Governance Attestation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            3. Regulatory Compliance & Forensic Sign-Off Attestation
          </h3>
          <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.6 }}>
            All systems underwent mandatory 6-Point Clean Validation gatekeeper checks prior to production reconnection. No data ransom was paid to sanctioned extortion entities (OFAC compliance validated).
          </p>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 14,
            borderTop: "1px solid var(--border)",
            paddingTop: 16
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>Elena Rostova, CISSP</div>
              <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Principal Incident Commander · Aegis DFIR</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>Dr. Arthur Vance</div>
              <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Chief Information Security Officer · {activeCase.organization}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
