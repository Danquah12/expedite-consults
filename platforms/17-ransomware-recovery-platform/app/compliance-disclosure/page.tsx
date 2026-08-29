"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Download,
  Search,
  ExternalLink,
  Lock,
  FileText,
  Building2,
  Scale,
  Calendar,
  Sparkles,
  Users,
  Eye,
  RefreshCw,
  Send
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { RansomwareCase } from "@/types/recovery";

interface RegulatoryClock {
  id: string;
  framework: "HIPAA Breach Notification Rule" | "SEC Form 8-K Item 1.05" | "GDPR Article 33" | "NYDFS Part 500.17";
  regulatoryBody: string;
  statutoryLimitText: string;
  hoursRemaining: number;
  totalLimitHours: number;
  triggerEvent: string;
  status: "CRITICAL" | "WARNING" | "SAFE" | "FILED";
  penaltiesSummary: string;
  legalCitation: string;
  prerequisites: { title: string; completed: boolean }[];
}

interface OFACCheckState {
  walletAddress: string;
  threatActor: string;
  ransomwareFamily: string;
  sdnMatch: boolean;
  sdnRiskScore: number;
  chainalysisRisk: "SEVERE_SANCTIONS_RISK" | "HIGH_RISK_ASSOCIATION" | "CLEAN";
  complianceVerdict: "PAYMENT_STRICTLY_PROHIBITED" | "HIGH_PENALTY_EXPOSURE" | "COMPLIANT_WITH_TREASURY_GUIDANCE";
  advisoryNote: string;
}

const INITIAL_REGULATORY_CLOCKS: RegulatoryClock[] = [
  {
    id: "reg-sec",
    framework: "SEC Form 8-K Item 1.05",
    regulatoryBody: "U.S. Securities and Exchange Commission",
    statutoryLimitText: "4 Business Days from Materiality Determination",
    hoursRemaining: 48,
    totalLimitHours: 96,
    triggerEvent: "Materiality Determined by Board Audit Committee (2026-08-23 18:00 UTC)",
    status: "WARNING",
    penaltiesSummary: "SEC Division of Enforcement civil fines, shareholder derivative actions, and mandatory restatement of 10-K cyber disclosures.",
    legalCitation: "17 CFR § 249.308 (Item 1.05)",
    prerequisites: [
      { title: "Materiality determination memo drafted by General Counsel", completed: true },
      { title: "Financial & operational disruption estimate formulated", completed: true },
      { title: "Filing approval by Chief Legal Officer & CISO", completed: false }
    ]
  },
  {
    id: "reg-gdpr",
    framework: "GDPR Article 33",
    regulatoryBody: "European Data Protection Board / Irish DPC",
    statutoryLimitText: "72 Hours from Becoming Aware of Breach",
    hoursRemaining: 22,
    totalLimitHours: 72,
    triggerEvent: "Exfiltration confirmation of EU patient research cohorts (2026-08-23 03:14 UTC)",
    status: "CRITICAL",
    penaltiesSummary: "Statutory fines up to €20M or 4% of total worldwide annual turnover of preceding financial year.",
    legalCitation: "EU Regulation 2016/679 Art. 33(1)",
    prerequisites: [
      { title: "Categories and approximate number of data subjects identified", completed: true },
      { title: "Contact details of Data Protection Officer (DPO) attached", completed: true },
      { title: "Description of likely consequences and containment measures", completed: true },
      { title: "Transmission to Lead Supervisory Authority", completed: false }
    ]
  },
  {
    id: "reg-hipaa",
    framework: "HIPAA Breach Notification Rule",
    regulatoryBody: "HHS Office for Civil Rights (OCR)",
    statutoryLimitText: "60 Calendar Days from Discovery",
    hoursRemaining: 1360,
    totalLimitHours: 1440,
    triggerEvent: "Confirmation of Compromised ePHI Database (384,000 Patient Records)",
    status: "SAFE",
    penaltiesSummary: "Civil Monetary Penalties up to $2,014,000 per violation category per calendar year (Tier 4 Willful Neglect).",
    legalCitation: "45 CFR §§ 164.400-414",
    prerequisites: [
      { title: "Forensic record count validation completed", completed: true },
      { title: "Written notification letters drafted for individual patients", completed: false },
      { title: "Major media outlet press release drafted for >500 residents", completed: false },
      { title: "HHS OCR Electronic Portal Filing submitted", completed: false }
    ]
  },
  {
    id: "reg-nydfs",
    framework: "NYDFS Part 500.17",
    regulatoryBody: "New York Department of Financial Services",
    statutoryLimitText: "72 Hours from Cybersecurity Incident",
    hoursRemaining: 18,
    totalLimitHours: 72,
    triggerEvent: "Ransomware encryption affecting regulated financial settlement systems",
    status: "CRITICAL",
    penaltiesSummary: "Civil enforcement penalties under NY Banking Law § 44 (up to $250,000/day).",
    legalCitation: "23 NYCRR 500.17(a)",
    prerequisites: [
      { title: "Impact assessment on N.Y. banking operations compiled", completed: true },
      { title: "Electronic filing via NYDFS Secure Portal", completed: false }
    ]
  }
];

const INITIAL_OFAC_STATE: OFACCheckState = {
  walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  threatActor: "LockBit Supporter Gang (FIN12 Affiliate)",
  ransomwareFamily: "LockBit 3.0 (Black)",
  sdnMatch: true,
  sdnRiskScore: 98.4,
  chainalysisRisk: "SEVERE_SANCTIONS_RISK",
  complianceVerdict: "PAYMENT_STRICTLY_PROHIBITED",
  advisoryNote: "Target Bitcoin wallet is linked to OFAC-sanctioned Russian cybercriminal cartel (FIN12/Evil Corp nexus). Payment exposes company and executives to strict-liability civil penalties under IEEPA."
};

export default function ComplianceDisclosurePage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [activeTab, setActiveTab] = useState<"TIMELINES" | "OFAC" | "DOSSIERS" | "WORKFLOW">("TIMELINES");
  const [clocks, setClocks] = useState<RegulatoryClock[]>(INITIAL_REGULATORY_CLOCKS);
  const [ofacState, setOfacState] = useState<OFACCheckState>(INITIAL_OFAC_STATE);
  const [selectedClock, setSelectedClock] = useState<RegulatoryClock>(INITIAL_REGULATORY_CLOCKS[0]);
  const [customWalletInput, setCustomWalletInput] = useState("");
  const [isScanningWallet, setIsScanningWallet] = useState(false);
  const [dossierExported, setDossierExported] = useState(false);

  const currentCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  const handleScanCustomWallet = () => {
    if (!customWalletInput) return;
    setIsScanningWallet(true);
    setTimeout(() => {
      setIsScanningWallet(false);
      setOfacState({
        walletAddress: customWalletInput,
        threatActor: "Unknown Affiliate Cluster (Sanctioned Association)",
        ransomwareFamily: currentCase.ransomwareFamily,
        sdnMatch: true,
        sdnRiskScore: 94.2,
        chainalysisRisk: "SEVERE_SANCTIONS_RISK",
        complianceVerdict: "PAYMENT_STRICTLY_PROHIBITED",
        advisoryNote: `Wallet ${customWalletInput.slice(0, 10)}... correlates with high-risk mixer hops and Treasury SDN listed addresses.`
      });
    }, 800);
  };

  const handleTogglePrereq = (clockId: string, pIdx: number) => {
    setClocks((prev) =>
      prev.map((c) => {
        if (c.id !== clockId) return c;
        const newPrereqs = [...c.prerequisites];
        newPrereqs[pIdx] = { ...newPrereqs[pIdx], completed: !newPrereqs[pIdx].completed };
        return { ...c, prerequisites: newPrereqs };
      })
    );
    if (selectedClock.id === clockId) {
      setSelectedClock((prev) => {
        const newPrereqs = [...prev.prerequisites];
        newPrereqs[pIdx] = { ...newPrereqs[pIdx], completed: !newPrereqs[pIdx].completed };
        return { ...prev, prerequisites: newPrereqs };
      });
    }
  };

  const handleExportDossier = () => {
    setDossierExported(true);
    setTimeout(() => setDossierExported(false), 4000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid var(--border)",
          paddingBottom: 16
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(168, 85, 247, 0.15)",
                color: "var(--purple)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}
            >
              Stage 8: GOVERN, LEARN & DISCLOSE
            </span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>•</span>
            <span style={{ fontSize: 12, color: "var(--cyan)", fontWeight: 600 }}>
              Statutory Disclosures & OFAC Compliance
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 10 }}>
            <Scale size={24} color="var(--purple)" />
            Regulatory Assessment & Compliance Disclosure Generator
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 850 }}>
            Automated statutory countdown clocks (SEC Form 8-K 4-day, GDPR 72-hour, HIPAA 60-day OCR), OFAC Sanctions crypto screening, and board-ready regulatory export dossiers with legal citations.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            style={{
              background: "var(--surface-2)",
              color: "var(--fg)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              outline: "none"
            }}
          >
            {MOCK_CASES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.organization}
              </option>
            ))}
          </select>

          <button onClick={handleExportDossier} className="btn-primary">
            <Download size={14} />
            {dossierExported ? "Regulatory Pack Exported!" : "Export Regulatory Disclosure Pack"}
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>NEAREST DEADLINE</span>
            <Clock size={15} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--rose)" }}>
            18h 00m Remaining
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            NYDFS 500.17 & GDPR Art. 33
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>SEC FORM 8-K STATUS</span>
            <Building2 size={15} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--amber)" }}>
            48h Remaining
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Item 1.05 Materiality Confirmed
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>HIPAA OCR BREACH RULE</span>
            <FileSpreadsheet size={15} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>
            57 Days Remaining
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            384k ePHI Records Affected
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>OFAC SANCTIONS VERDICT</span>
            <ShieldAlert size={15} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--rose)" }}>
            PAYMENT PROHIBITED
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            SDN List Match: 98.4%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
        <button
          onClick={() => setActiveTab("TIMELINES")}
          style={{
            background: activeTab === "TIMELINES" ? "var(--surface-2)" : "transparent",
            color: activeTab === "TIMELINES" ? "var(--rose)" : "var(--fg-2)",
            border: activeTab === "TIMELINES" ? "1px solid var(--rose)" : "1px solid transparent",
            borderRadius: "6px 6px 0 0",
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Clock size={15} />
          Statutory Disclosure Timelines ({clocks.length})
        </button>

        <button
          onClick={() => setActiveTab("OFAC")}
          style={{
            background: activeTab === "OFAC" ? "var(--surface-2)" : "transparent",
            color: activeTab === "OFAC" ? "var(--rose)" : "var(--fg-2)",
            border: activeTab === "OFAC" ? "1px solid var(--rose)" : "1px solid transparent",
            borderRadius: "6px 6px 0 0",
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <ShieldAlert size={15} />
          OFAC Sanctions & Wallet Screener
        </button>

        <button
          onClick={() => setActiveTab("DOSSIERS")}
          style={{
            background: activeTab === "DOSSIERS" ? "var(--surface-2)" : "transparent",
            color: activeTab === "DOSSIERS" ? "var(--cyan)" : "var(--fg-2)",
            border: activeTab === "DOSSIERS" ? "1px solid var(--cyan)" : "1px solid transparent",
            borderRadius: "6px 6px 0 0",
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <FileText size={15} />
          Form 8-K & Regulatory Dossier Previews
        </button>

        <button
          onClick={() => setActiveTab("WORKFLOW")}
          style={{
            background: activeTab === "WORKFLOW" ? "var(--surface-2)" : "transparent",
            color: activeTab === "WORKFLOW" ? "var(--primary)" : "var(--fg-2)",
            border: activeTab === "WORKFLOW" ? "1px solid var(--primary)" : "1px solid transparent",
            borderRadius: "6px 6px 0 0",
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Users size={15} />
          Multi-Stakeholder Signoff Tracker
        </button>
      </div>

      {/* TAB 1: STATUTORY TIMELINES */}
      {activeTab === "TIMELINES" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {clocks.map((clock) => {
              const isSelected = selectedClock.id === clock.id;
              const isCritical = clock.status === "CRITICAL";
              const isWarning = clock.status === "WARNING";

              return (
                <div
                  key={clock.id}
                  onClick={() => setSelectedClock(clock)}
                  className="card-tactical"
                  style={{
                    padding: 16,
                    cursor: "pointer",
                    border: isSelected ? "1px solid var(--cyan)" : "1px solid var(--border)",
                    background: isSelected ? "rgba(6, 182, 212, 0.06)" : "var(--surface)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: isSelected ? "var(--cyan)" : "var(--fg)" }}>
                          {clock.framework}
                        </h3>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: isCritical
                              ? "rgba(244, 63, 94, 0.15)"
                              : isWarning
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(16, 185, 129, 0.15)",
                            color: isCritical
                              ? "var(--rose)"
                              : isWarning
                              ? "var(--amber)"
                              : "var(--primary)",
                            border: "1px solid var(--border)"
                          }}
                        >
                          {clock.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        {clock.regulatoryBody} • {clock.legalCitation}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: isCritical ? "var(--rose)" : isWarning ? "var(--amber)" : "var(--primary)" }}>
                        {clock.hoursRemaining} Hours Left
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>{clock.statutoryLimitText}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Trigger: {clock.triggerEvent}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Clock Details & Filing Checklist */}
          {selectedClock && (
            <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>MANDATORY FILING CHECKLIST</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--cyan)", marginTop: 2 }}>
                  {selectedClock.framework}
                </h3>
              </div>

              <div style={{ background: "rgba(244, 63, 94, 0.08)", padding: 12, borderRadius: 6, border: "1px solid rgba(244, 63, 94, 0.2)", fontSize: 11.5 }}>
                <div style={{ color: "var(--rose)", fontWeight: 700, marginBottom: 2 }}>Statutory Non-Compliance Risk:</div>
                <div style={{ color: "var(--fg-2)", lineHeight: 1.4 }}>{selectedClock.penaltiesSummary}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Prerequisite Filing Deliverables:</div>
                {selectedClock.prerequisites.map((p, idx) => (
                  <label
                    key={idx}
                    onClick={() => handleTogglePrereq(selectedClock.id, idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "var(--surface-2)",
                      padding: 10,
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: "pointer"
                    }}
                  >
                    <input type="checkbox" checked={p.completed} readOnly />
                    <span style={{ color: p.completed ? "var(--primary)" : "var(--fg)", fontWeight: p.completed ? 700 : 500 }}>
                      {p.title}
                    </span>
                  </label>
                ))}
              </div>

              <button onClick={handleExportDossier} className="btn-primary" style={{ justifyContent: "center" }}>
                <Download size={14} />
                Generate {selectedClock.framework.split(" ")[0]} Filing Dossier
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OFAC SANCTIONS & WALLET SCREENER */}
      {activeTab === "OFAC" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>TREASURY OFAC SANCTIONS AUDIT</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--rose)", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert size={18} />
                Specially Designated Nationals (SDN) Screener
              </h3>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Scan Bitcoin / Monero Wallet Address (e.g. bc1q...)"
                value={customWalletInput}
                onChange={(e) => setCustomWalletInput(e.target.value)}
                style={{
                  flex: 1,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  color: "var(--fg)",
                  fontSize: 12,
                  fontFamily: "monospace",
                  outline: "none"
                }}
              />
              <button onClick={handleScanCustomWallet} className="btn-secondary" disabled={isScanningWallet}>
                <Search size={14} />
                {isScanningWallet ? "Screening..." : "Screen Wallet"}
              </button>
            </div>

            <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: 6, display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Target Wallet:</span>
                <span style={{ fontFamily: "monospace", color: "var(--cyan)", fontWeight: 700 }}>{ofacState.walletAddress}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Associated Threat Actor:</span>
                <span style={{ color: "var(--amber)", fontWeight: 700 }}>{ofacState.threatActor}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>OFAC SDN Match Probability:</span>
                <span style={{ color: "var(--rose)", fontWeight: 800 }}>{ofacState.sdnRiskScore}% MATCH</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Chainalysis Reactor Score:</span>
                <span style={{ color: "var(--rose)", fontWeight: 800 }}>{ofacState.chainalysisRisk}</span>
              </div>
            </div>

            <div style={{ background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: 6, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "var(--rose)", marginBottom: 4 }}>
                ⛔ COMPLIANCE VERDICT: {ofacState.complianceVerdict.replace(/_/g, " ")}
              </div>
              <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.4 }}>
                {ofacState.advisoryNote}
              </p>
            </div>
          </div>

          <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
              Treasury Department Regulatory Advisory Summary
            </h3>
            <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.5 }}>
              Under the U.S. Department of the Treasury&apos;s Office of Foreign Assets Control (OFAC) Advisory on Potential Sanctions Risks for Facilitating Ransomware Payments, companies that facilitate payments to sanctioned persons or jurisdictions face <strong>strict liability civil penalties</strong> under the International Emergency Economic Powers Act (IEEPA).
            </p>

            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, fontSize: 11 }}>
              <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 2 }}>Mitigating Factors Recognized by OFAC:</div>
              <ul style={{ paddingLeft: 16, color: "var(--muted)", lineHeight: 1.4 }}>
                <li>Immediate notification to CISA and FBI Field Office</li>
                <li>Preservation of cryptographic forensic evidence</li>
                <li>Zero ransom payment execution without explicit OFAC specific license</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FORM 8-K & REGULATORY DOSSIER PREVIEWS */}
      {activeTab === "DOSSIERS" && (
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>SEC EDGAR REPORT PREVIEW</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--fg)" }}>
                UNITED STATES SECURITIES AND EXCHANGE COMMISSION — FORM 8-K
              </h3>
            </div>

            <button onClick={handleExportDossier} className="btn-primary">
              <Download size={14} />
              Export Signed Form 8-K XML/PDF
            </button>
          </div>

          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: 16, borderRadius: 6, fontFamily: "monospace", fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.6 }}>
            <div style={{ textAlign: "center", fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
              CURRENT REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934
            </div>
            <div><strong>Item 1.05. Material Cybersecurity Incidents.</strong></div>
            <div style={{ marginTop: 8 }}>
              On August 23, 2026, {currentCase.organization} (&quot;the Company&quot;) determined that a cybersecurity incident involving unauthorized access and encryption of portions of its clinical information technology infrastructure by threat actor {currentCase.threatActor} constitutes a material cybersecurity event.
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Scope and Nature of Impact:</strong> The incident has caused temporary downtime for the Company&apos;s EHR and PACS imaging databases ({currentCase.affectedHosts} server hosts affected). The Company activated its air-gapped clean recovery environments and immutable WORM backups, with estimated RTO of {currentCase.estimatedRecoveryTimeHours} hours.
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Financial Impact Assessment:</strong> While operational disruption is ongoing, the Company maintains comprehensive cyber insurance coverage with zero ransom payment authorized in adherence with Treasury OFAC regulations.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MULTI-STAKEHOLDER SIGNOFF */}
      {activeTab === "WORKFLOW" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <div className="card-tactical" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>External Legal Counsel</h4>
              <CheckCircle2 size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Latham & Watkins LLP</div>
            <div style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700, marginTop: 6 }}>Attested & Approved (2026-08-23 21:00 UTC)</div>
          </div>

          <div className="card-tactical" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>Cyber Insurance Carrier</h4>
              <CheckCircle2 size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Marsh McLennan / Chubb Policy #8812-44</div>
            <div style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700, marginTop: 6 }}>Notice of Claim Filed (Within 24h Window)</div>
          </div>

          <div className="card-tactical" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>Law Enforcement (FBI IC3 & CISA)</h4>
              <CheckCircle2 size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>FBI Cyber Division Field Referral</div>
            <div style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700, marginTop: 6 }}>IC3 Incident ID: #IC3-2026-904812</div>
          </div>
        </div>
      )}
    </div>
  );
}
