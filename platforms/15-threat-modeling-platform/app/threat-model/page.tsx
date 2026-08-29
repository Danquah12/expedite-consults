"use client";

import { useState } from "react";
import {
  Shield, CheckCircle2, ShieldAlert, Info, X, ClipboardList, HelpCircle, Download, FileText, Printer, Check, ExternalLink, Filter, Plus
} from "lucide-react";

type StrideItem = {
  id: string;
  category: "Spoofing" | "Tampering" | "Repudiation" | "Information Disclosure" | "Denial of Service" | "Elevation of Privilege";
  check: string;
  mitigation: string;
  compliant: boolean;
  framework: "SOC 2" | "ISO 27001" | "NIST CSF" | "PCI-DSS";
};

type DetailInfo = {
  title: string;
  category: string;
  what: string;
  why: string;
  risk: string;
  mitigationGoal?: string;
  frameworkRef?: string;
};

const STRIDE_DETAILS: Record<string, DetailInfo> = {
  "Spoofing": {
    title: "Spoofing (Identity Threat)",
    category: "STRIDE Category",
    what: "An attacker impersonating a legitimate user, system component, or external client.",
    why: "Monitored to guarantee authentication integrity, ensuring access claims are cryptographically valid.",
    risk: "Attackers can log into user accounts, forge session tokens, or spoof API server requests.",
    mitigationGoal: "Enforce Multi-Factor Authentication (MFA) and secure session cookies.",
    frameworkRef: "SOC 2 CC6.1 · ISO 27001 A.9.4.2"
  },
  "Tampering": {
    title: "Tampering (Data Integrity Threat)",
    category: "STRIDE Category",
    what: "Malicious modification of files, database records, network packets, or memory parameters.",
    why: "Ensures information integrity so transactions, logs, and configurations remain unmodified.",
    risk: "Attackers can change transaction prices, modify configuration variables, or inject SQL query scripts.",
    mitigationGoal: "Enforce input parameter sanitization and hash validation signatures.",
    frameworkRef: "PCI-DSS Req 6.4 · NIST CSF PR.DS-1"
  },
  "Repudiation": {
    title: "Repudiation (Audit Threat)",
    category: "STRIDE Category",
    what: "An attacker performing a hostile action but claiming they did not, due to lack of proof.",
    why: "Ensures log logs are secure, unalterable, and trace action authors uniquely.",
    risk: "Inability to prove who executed an admin command, allowing inside actors to cover tracks.",
    mitigationGoal: "Enable write-once audit logs and secure centralized IP tracking.",
    frameworkRef: "SOC 2 CC7.2 · ISO 27001 A.12.4.1"
  },
  "Information Disclosure": {
    title: "Information Disclosure (Confidentiality Threat)",
    category: "STRIDE Category",
    what: "Exposing private database records, certificates, configuration passwords, or user keys to unauthorized parties.",
    why: "Protects secret keys and PII to comply with compliance laws (PCI-DSS, GDPR).",
    risk: "Leaks database records, credentials, or API secret keys.",
    mitigationGoal: "Mask credentials, use HSMs, and configure strict CORS policies.",
    frameworkRef: "PCI-DSS Req 3.4 · NIST CSF PR.DS-5"
  },
  "Denial of Service": {
    title: "Denial of Service (Availability Threat)",
    category: "STRIDE Category",
    what: "Flooding memory, consuming sockets, or crashing services to block access for legitimate users.",
    why: "Guarantees runtime service availability.",
    risk: "Loss of system accessibility, causing client disruption and financial damage.",
    mitigationGoal: "Implement rate-limit filters and socket limits.",
    frameworkRef: "ISO 27001 A.12.1.3 · NIST CSF PR.PT-4"
  },
  "Elevation of Privilege": {
    title: "Elevation of Privilege (Authorization Threat)",
    category: "STRIDE Category",
    what: "A standard user obtaining administrative privileges to access private dashboards or system panels.",
    why: "Enforces strict access control boundaries (RBAC/ABAC).",
    risk: "A low-level compromised user account taking complete control of system configurations.",
    mitigationGoal: "Enforce least privilege access mappings and RBAC checking on routes.",
    frameworkRef: "SOC 2 CC6.3 · ISO 27001 A.9.2.3"
  }
};

const INITIAL_ITEMS: StrideItem[] = [
  { id: "S-1", category: "Spoofing", check: "Enforce Multi-Factor Authentication (MFA) on admin accounts", mitigation: "MFA active via OAuth 2.0 / SAML", compliant: true, framework: "SOC 2" },
  { id: "S-2", category: "Spoofing", check: "Prevent LLM System Persona Spoofing via DAN roleplay filters", mitigation: "Prefix validation rules active", compliant: true, framework: "NIST CSF" },
  { id: "T-1", category: "Tampering", check: "Parameterize database inputs to block SQL injection attacks", mitigation: "Spring JPA prepared statements enforced", compliant: true, framework: "PCI-DSS" },
  { id: "T-2", category: "Tampering", check: "Encrypt local storage configurations using AES-GCM-256", mitigation: "Plaintext keys found in configs", compliant: false, framework: "ISO 27001" },
  { id: "R-1", category: "Repudiation", check: "Establish centralized write-once audit logs (WORM / CloudTrail)", mitigation: "Logs writable by admin role", compliant: false, framework: "SOC 2" },
  { id: "I-1", category: "Information Disclosure", check: "Mask database passwords and credentials in properties", mitigation: "Secrets stored in HashiCorp Vault", compliant: true, framework: "SOC 2" },
  { id: "I-2", category: "Information Disclosure", check: "Restrict CORS origin headers and enforce IMDSv2 metadata tokens", mitigation: "Access-Control-Allow-Origin: * active", compliant: false, framework: "PCI-DSS" },
  { id: "D-1", category: "Denial of Service", check: "Rate limit incoming client API request counts (Token Bucket)", mitigation: "No rate-limiting filters mapped on gateway", compliant: false, framework: "ISO 27001" },
  { id: "E-1", category: "Elevation of Privilege", check: "Enforce RBAC authorization and BOLA object tenancy validation", mitigation: "RBAC filter mapped on gateway", compliant: true, framework: "SOC 2" },
  { id: "E-2", category: "Elevation of Privilege", check: "Audit Kubernetes ServiceAccount tokens for wildcard privileges", mitigation: "ClusterRoleBinding audit clean", compliant: true, framework: "NIST CSF" }
];

export default function STRIDEModeler() {
  const [items, setItems] = useState<StrideItem[]>(INITIAL_ITEMS);
  const [selectedDetail, setSelectedDetail] = useState<DetailInfo | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string>("All");
  const [showExportModal, setShowExportModal] = useState(false);

  const toggleCompliant = (id: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, compliant: !item.compliant } : item))
    );
  };

  const filteredItems = selectedFramework === "All"
    ? items
    : items.filter(i => i.framework === selectedFramework);

  const total = items.length;
  const compliantCount = items.filter(i => i.compliant).length;
  const complianceScore = Math.round((compliantCount / total) * 100);

  const downloadJSONReport = () => {
    const report = {
      title: "AXIOM STRIDE Threat Modeling & Compliance Audit Report",
      organization: "Expedite Consults Enterprise Ecosystem",
      generatedAt: new Date().toISOString(),
      complianceSummary: {
        totalChecks: total,
        passedChecks: compliantCount,
        failedChecks: total - compliantCount,
        complianceScore: `${complianceScore}%`,
        rating: complianceScore >= 80 ? "STRONG" : complianceScore >= 60 ? "MODERATE" : "HIGH RISK"
      },
      frameworksCovered: ["SOC 2 Type II", "ISO/IEC 27001:2022", "NIST CSF 2.0", "PCI-DSS v4.0"],
      checklists: items.map(item => ({
        id: item.id,
        category: item.category,
        requirement: item.check,
        framework: item.framework,
        status: item.compliant ? "COMPLIANT" : "NON-COMPLIANT",
        auditFinding: item.mitigation
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AXIOM_STRIDE_Compliance_Report_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 32, overflowY: "auto", flex: 1, background: "var(--bg)" }}>
      
      {/* Title & Actions Bar */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={24} style={{ color: "var(--blue)" }} />
            AXIOM STRIDE Threat Modeler & Compliance Engine
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
            Evaluate trust boundaries, review threat checklists, and audit architecture design against SOC 2, ISO 27001, and NIST CSF.
          </p>
        </div>

        {/* Right Actions: Compliance Meter & Export */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 16px" }}>
            <div>
              <div style={{ fontSize: 9.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase" }}>STRIDE Score</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: complianceScore > 75 ? "var(--green)" : "#ff9500" }}>{complianceScore}% Compliant</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {compliantCount} / {total} Passed
            </div>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #00d4ff, #0070f3)",
              color: "#0a0f1a",
              fontWeight: 800,
              fontSize: 12,
              borderRadius: 10,
              padding: "9px 16px",
              border: "none",
              cursor: "pointer"
            }}
          >
            <FileText size={14} />
            Export Compliance Report
          </button>
        </div>
      </div>

      {/* AI & Big Data Compliance Engine Bar */}
      <div style={{
        marginBottom: 20,
        padding: "10px 16px",
        borderRadius: 12,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
        fontSize: 11
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4ff" }} />
          <span style={{ color: "var(--muted)" }}>Threat Synthesis LLM:</span>
          <strong style={{ color: "#fff" }}>OpenAI GPT-4o / Claude 3.5 Sonnet</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
          <span style={{ color: "var(--muted)" }}>In-Memory Engine:</span>
          <strong style={{ color: "#fff" }}>Apache Arrow + Polars Columnar Engine</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8912d" }} />
          <span style={{ color: "var(--muted)" }}>Compliance Pipeline:</span>
          <strong style={{ color: "#fff" }}>SOC 2 / ISO 27001 / NIST CSF Ingestion</strong>
        </div>
      </div>

      {/* Framework Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <Filter size={12} /> Filter Framework:
        </span>
        {["All", "SOC 2", "ISO 27001", "NIST CSF", "PCI-DSS"].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFramework(f)}
            style={{
              fontSize: 11,
              padding: "4px 12px",
              borderRadius: 8,
              border: selectedFramework === f ? "1px solid var(--blue)" : "1px solid var(--border)",
              background: selectedFramework === f ? "rgba(0, 212, 255, 0.15)" : "var(--surface)",
              color: selectedFramework === f ? "#00d4ff" : "var(--muted)",
              cursor: "pointer",
              fontWeight: selectedFramework === f ? 700 : 500
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* STRIDE Checklist Grid */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
            <ClipboardList size={16} style={{ color: "var(--blue)" }} />
            Architecture Threat Mappings ({filteredItems.length} Controls)
          </h3>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Toggle checkbox to verify remediation state</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "12px 16px",
                gap: 16,
                transition: "all 0.2s"
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={item.compliant}
                onChange={() => toggleCompliant(item.id)}
                style={{
                  width: 16,
                  height: 16,
                  accentColor: "var(--blue)",
                  cursor: "pointer"
                }}
              />

              {/* Threat context */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span
                    onClick={() => setSelectedDetail(STRIDE_DETAILS[item.category])}
                    style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "rgba(0, 212, 255, 0.12)",
                      color: "var(--blue)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 3
                    }}
                  >
                    {item.category}
                    <Info size={9} />
                  </span>
                  <span style={{ fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "rgba(255, 255, 255, 0.06)", color: "var(--fg)" }}>
                    {item.framework}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{item.id}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginTop: 4 }}>
                  {item.check}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
                  Audit Finding: <span style={{ color: item.compliant ? "var(--green)" : "#ef5350" }}>{item.mitigation}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {item.compliant ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--green)", fontWeight: 700 }}>
                    <CheckCircle2 size={16} /> Compliant
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#ef5350", fontWeight: 700 }}>
                    <ShieldAlert size={16} /> Action Required
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Report Export Modal */}
      {showExportModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: 20
          }}
        >
          <div
            className="animate-scaleIn"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 680,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              position: "relative"
            }}
          >
            <button
              onClick={() => setShowExportModal(false)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer"
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Title & Branding */}
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--blue)", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
                <Shield size={16} /> Expedite Consults Security Audit
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 4 }}>
                STRIDE Threat Model & Compliance Audit Report
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 11.5, marginTop: 2 }}>
                Generated on {new Date().toLocaleDateString()} · SOC 2 Type II, ISO 27001, NIST CSF & PCI-DSS Standards
              </p>
            </div>

            {/* Executive Summary Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Compliance Score</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: complianceScore > 75 ? "var(--green)" : "#ff9500", marginTop: 2 }}>{complianceScore}%</div>
              </div>
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Controls Passed</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--green)", marginTop: 2 }}>{compliantCount} / {total}</div>
              </div>
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Audit Verdict</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: complianceScore >= 75 ? "var(--green)" : "#ef5350", marginTop: 6 }}>
                  {complianceScore >= 75 ? "AUDIT READY" : "ACTION REQUIRED"}
                </div>
              </div>
            </div>

            {/* Detailed Findings Summary List */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", marginBottom: 8 }}>
                Threat Category Breakdown
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                {items.map((i) => (
                  <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "var(--blue)", fontWeight: 700 }}>[{i.category}]</span>
                      <span style={{ color: "var(--fg)" }}>{i.check}</span>
                    </div>
                    <span style={{ color: i.compliant ? "var(--green)" : "#ef5350", fontWeight: 700, fontFamily: "monospace" }}>
                      {i.compliant ? "PASS" : "FAIL"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: JSON Download & Print PDF */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={downloadJSONReport}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                <Download size={14} /> Download JSON Data
              </button>

              <button
                onClick={() => window.print()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "linear-gradient(135deg, #00d4ff, #0070f3)",
                  border: "none",
                  color: "#0a0f1a",
                  padding: "8px 18px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                <Printer size={14} /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Detail Modal Dialog */}
      {selectedDetail && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            className="animate-scaleIn"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              width: "100%",
              maxWidth: 500,
              padding: 24,
              position: "relative"
            }}
          >
            <button
              onClick={() => setSelectedDetail(null)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer"
              }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: 20 }}>
              <span style={{
                fontSize: 9.5,
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "2px 6px",
                borderRadius: 4,
                background: "rgba(0, 212, 255, 0.12)",
                color: "var(--blue)"
              }}>
                {selectedDetail.category}
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 8 }}>{selectedDetail.title}</h3>
            </div>

            {/* Content sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 12, lineHeight: "1.5" }}>
              <div>
                <strong style={{ color: "#fff", display: "block", marginBottom: 3 }}>What is it?</strong>
                <p style={{ color: "var(--fg-2)" }}>{selectedDetail.what}</p>
              </div>
              <div>
                <strong style={{ color: "#fff", display: "block", marginBottom: 3 }}>Why we check this?</strong>
                <p style={{ color: "var(--fg-2)" }}>{selectedDetail.why}</p>
              </div>
              <div>
                <strong style={{ color: "#fff", display: "block", marginBottom: 3 }}>How it impacts risk?</strong>
                <p style={{ color: "var(--fg-2)" }}>{selectedDetail.risk}</p>
              </div>
              {selectedDetail.mitigationGoal && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                  <span style={{ color: "var(--muted)", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Mitigation Strategy Goal:</span>
                  <strong style={{ color: "var(--blue)" }}>{selectedDetail.mitigationGoal}</strong>
                </div>
              )}
              {selectedDetail.frameworkRef && (
                <div style={{ display: "flex", justifyContent: "space-between", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px" }}>
                  <span style={{ color: "var(--muted)" }}>Compliance Framework:</span>
                  <strong style={{ color: "#00d4ff", fontFamily: "monospace", fontSize: 11 }}>{selectedDetail.frameworkRef}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

