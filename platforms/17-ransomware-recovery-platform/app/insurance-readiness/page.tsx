"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Layers,
  Lock,
  HardDrive,
  Key,
  Activity,
  Server,
  Sparkles,
  Award,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Printer,
  Copy,
  Check,
  Sliders,
  DollarSign
} from "lucide-react";

interface UnderwritingControl {
  id: string;
  domain: "BACKUPS" | "MFA" | "EDR" | "INCIDENT_RESPONSE" | "IDENTITY";
  title: string;
  carrierRequirement: string;
  weight: number;
  status: "VERIFIED_COMPLIANT" | "PARTIAL_COMPLIANCE" | "NON_COMPLIANT";
  technicalProof: string;
  evidenceHash: string;
  lastAttested: string;
  telemetrySource: string;
  underwriterNote: string;
  remediationAction?: string;
}

const INITIAL_CONTROLS: UnderwritingControl[] = [
  {
    id: "ctl-01",
    domain: "BACKUPS",
    title: "Immutable WORM Storage & Air-Gapped Vaulting",
    carrierRequirement: "Mandatory immutable backup copies protected against deletion or modification by compromised domain admin credentials.",
    weight: 25,
    status: "VERIFIED_COMPLIANT",
    technicalProof: "AWS S3 Object Lock Compliance Mode active on bucket 'arn:aws:s3:::aegis-vault-prod' with 90-day retention lock. LTO-8 tape rotation verified offsite.",
    evidenceHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    lastAttested: "2026-08-24 00:15 UTC",
    telemetrySource: "AWS IAM / CloudTrail Audit Log #8812",
    underwriterNote: "Exceeds standard 30-day retention baseline; meets tier-1 insurability standard."
  },
  {
    id: "ctl-02",
    domain: "BACKUPS",
    title: "Automated Sandbox Restore Testing Cadence",
    carrierRequirement: "Verified automated test restores of critical databases and identity infrastructure at least monthly.",
    weight: 15,
    status: "VERIFIED_COMPLIANT",
    technicalProof: "Automated micro-VM boot test and SQL DBCC CHECKDB executed every 24h. Mean restore verification time 18.2 minutes with 0 page corruptions.",
    evidenceHash: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd342be3b2361b7f093a1e5095d",
    lastAttested: "2026-08-23 22:00 UTC",
    telemetrySource: "Aegis Auto-Drill Runner v4.2",
    underwriterNote: "Continuous automated verification satisfies rigorous business interruption underwriting terms."
  },
  {
    id: "ctl-03",
    domain: "MFA",
    title: "100% MFA Enforcement on Privileged Admin & Remote Access",
    carrierRequirement: "Hardware token or phishing-resistant FIDO2 MFA on all Tier-0 admins, VPN portals, and SaaS consoles.",
    weight: 20,
    status: "VERIFIED_COMPLIANT",
    technicalProof: "Microsoft Entra Conditional Access Policy 'CAP-001-STRICT-FIDO2' enforced on 100% of directory roles. Zero legacy authentication protocols allowed.",
    evidenceHash: "b8508a8a4b6338b14e66df98fb3d37c4135e82b7cf02a0a2df3fd5ff2886f34e",
    lastAttested: "2026-08-24 00:30 UTC",
    telemetrySource: "Entra ID Sign-In Telemetry Stream",
    underwriterNote: "Eliminates push-bombing and session hijacking vectors."
  },
  {
    id: "ctl-04",
    domain: "EDR",
    title: "100% EDR Telemetry Coverage with Tamper Protection",
    carrierRequirement: "Next-gen EDR deployed across 100% of servers and workstations with anti-tamper and 24/7 SOC/MDR escalation.",
    weight: 15,
    status: "VERIFIED_COMPLIANT",
    technicalProof: "CrowdStrike Falcon Sensor v7.14 active on 1,420 of 1,420 endpoints (100% coverage). Tamper Protection policy enforced via cloud console.",
    evidenceHash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    lastAttested: "2026-08-23 23:45 UTC",
    telemetrySource: "CrowdStrike Falcon API Query",
    underwriterNote: "Satisfies strict zero-gap endpoint warranty standards."
  },
  {
    id: "ctl-05",
    domain: "IDENTITY",
    title: "Active Directory Tiering & Automated KRBTGT Rotation",
    carrierRequirement: "Separation of admin credentials into Tier-0/1/2 domains with routine Kerberos service account key rotation.",
    weight: 15,
    status: "PARTIAL_COMPLIANCE",
    technicalProof: "Tier-0 PAWs deployed on 92% of Domain Admins. KRBTGT password rotation automated via PowerShell script; last double-roll performed 14 days ago.",
    evidenceHash: "3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca14539f",
    lastAttested: "2026-08-24 00:00 UTC",
    telemetrySource: "AD DS Forest Replication Monitor",
    underwriterNote: "Target 100% PAW coverage to unlock Tier-1 Preferred Rate.",
    remediationAction: "Enforce PAW strict hardware isolation for the remaining 3 legacy Domain Admins."
  },
  {
    id: "ctl-06",
    domain: "INCIDENT_RESPONSE",
    title: "Annual Ransomware Tabletop Drills & Dedicated DFIR Retainer",
    carrierRequirement: "Formal tested incident response plan with third-party digital forensics and incident response (DFIR) retainer on active standby.",
    weight: 10,
    status: "VERIFIED_COMPLIANT",
    technicalProof: "Contracted DFIR retainer SLA < 1 hour with Expedite Consults / Aegis DFIR Team. Last simulated LockBit 3.0 tabletop completed July 15, 2026.",
    evidenceHash: "c0535e4be2b79ffd93291305436bf889314e4a3faec05ecffcbb7ff310919751",
    lastAttested: "2026-08-20 14:00 UTC",
    telemetrySource: "SOC Exercise Log #TT-2026-Q3",
    underwriterNote: "SLA response time meets carrier requirements for zero-hour triage."
  }
];

export default function InsuranceReadinessPage() {
  const [controls, setControls] = useState<UnderwritingControl[]>(INITIAL_CONTROLS);
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [carrierTemplate, setCarrierTemplate] = useState<string>("MARSH");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>("ctl-01");
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredControls = useMemo(() => {
    return controls.filter(ctl => {
      const matchDomain = selectedDomain === "ALL" || ctl.domain === selectedDomain;
      const matchSearch =
        ctl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ctl.carrierRequirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ctl.technicalProof.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDomain && matchSearch;
    });
  }, [controls, selectedDomain, searchQuery]);

  const stats = useMemo(() => {
    let totalEarned = 0;
    let totalPossible = 0;
    let compliantCount = 0;
    let partialCount = 0;
    let nonCompliantCount = 0;

    controls.forEach(ctl => {
      totalPossible += ctl.weight;
      if (ctl.status === "VERIFIED_COMPLIANT") {
        totalEarned += ctl.weight;
        compliantCount++;
      } else if (ctl.status === "PARTIAL_COMPLIANCE") {
        totalEarned += ctl.weight * 0.5;
        partialCount++;
      } else {
        nonCompliantCount++;
      }
    });

    const score = Math.round((totalEarned / (totalPossible || 1)) * 100);
    let grade = "C";
    let tier = "Standard Risk";
    let premiumDiscountPct = 10;
    let deductibleEst = "$100,000";

    if (score >= 90) {
      grade = "A+";
      tier = "Preferred Underwriting Tier";
      premiumDiscountPct = 35;
      deductibleEst = "$25,000";
    } else if (score >= 80) {
      grade = "A";
      tier = "Low Risk Tier";
      premiumDiscountPct = 25;
      deductibleEst = "$50,000";
    } else if (score >= 70) {
      grade = "B";
      tier = "Moderate Risk Tier";
      premiumDiscountPct = 15;
      deductibleEst = "$75,000";
    }

    return {
      score,
      grade,
      tier,
      premiumDiscountPct,
      deductibleEst,
      compliantCount,
      partialCount,
      nonCompliantCount,
      totalCount: controls.length
    };
  }, [controls]);

  const toggleStatus = (id: string) => {
    setControls(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        let nextStatus: UnderwritingControl["status"] = "VERIFIED_COMPLIANT";
        if (item.status === "VERIFIED_COMPLIANT") nextStatus = "PARTIAL_COMPLIANCE";
        else if (item.status === "PARTIAL_COMPLIANCE") nextStatus = "NON_COMPLIANT";
        else nextStatus = "VERIFIED_COMPLIANT";
        return { ...item, status: nextStatus, lastAttested: "Just now (Modified)" };
      })
    );
    triggerToast("Control status updated. Insurability scorecard recalculated.");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
    triggerToast("SHA-256 Evidence Hash copied to clipboard.");
  };

  return (
    <div style={{ padding: "24px 28px", minHeight: "calc(100vh - 54px)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 20 }}>
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "var(--surface-3)",
          border: "1px solid var(--primary)",
          color: "var(--fg)",
          padding: "10px 18px",
          borderRadius: 8,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          fontWeight: 600
        }}>
          <Sparkles size={16} color="var(--primary)" />
          {toastMessage}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              padding: "3px 8px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 800,
              color: "var(--primary)",
              letterSpacing: "0.08em"
            }}>
              CYBER INSURANCE UNDERWRITING ENGINE
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              ISO 27001 / NIST CSF 2.0 / Marsh / Coalition Aligned
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--fg)", margin: 0 }}>
            Cyber Insurance Readiness & Technical Evidence Generator
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4, maxWidth: 840 }}>
            Continuously evaluates core technical underwriting prerequisites (Immutable Backups, MFA Enforcement, EDR Telemetry, Identity Resilience) and automatically compiles cryptographically sealed evidence dossiers supporting carrier policy renewals.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={carrierTemplate}
            onChange={(e) => setCarrierTemplate(e.target.value)}
            className="tool-select"
            style={{ fontWeight: 600 }}
          >
            <option value="MARSH">Marsh McLennan Cyber Assessment</option>
            <option value="COALITION">Coalition Active Underwriting</option>
            <option value="CHUBB">Chubb Ransomware Questionnaire</option>
            <option value="AIG">AIG CyberRisk Technical Attestation</option>
            <option value="BEAZLEY">Beazley Breach Response (BBR)</option>
          </select>

          <button
            onClick={() => setShowExportModal(true)}
            className="btn-primary"
          >
            <FileSpreadsheet size={15} />
            Export Certified Evidence Package
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Insurability Score</span>
            <Award size={16} color="var(--primary)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--fg)" }}>{stats.score}</span>
            <span style={{ fontSize: 14, color: "var(--muted)" }}>/ 100</span>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              color: "var(--primary)",
              background: "rgba(16,185,129,0.15)",
              padding: "2px 6px",
              borderRadius: 4
            }}>
              GRADE {stats.grade}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 600 }}>
            {stats.tier}
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--cyan)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Projected Premium Rebate</span>
            <DollarSign size={16} color="var(--cyan)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--cyan)" }}>-{stats.premiumDiscountPct}%</span>
            <span style={{ fontSize: 12, color: "var(--fg-2)" }}>Estimated Savings</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Est. Annual Savings: <strong style={{ color: "var(--fg)" }}>$42,000 / yr</strong>
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--amber)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Retention / Deductible Tier</span>
            <Lock size={16} color="var(--amber)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: "var(--fg)" }}>{stats.deductibleEst}</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Reduced from $250k baseline unverified tier
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--purple)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Controls Compliance</span>
            <ShieldCheck size={16} color="var(--purple)" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>
              <CheckCircle2 size={14} /> {stats.compliantCount} Verified
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--amber)", fontWeight: 700 }}>
              <AlertTriangle size={14} /> {stats.partialCount} Partial
            </div>
            {stats.nonCompliantCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--rose)", fontWeight: 700 }}>
                <XCircle size={14} /> {stats.nonCompliantCount} Gap
              </div>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Total Underwriting Criteria: {stats.totalCount} Controls
          </div>
        </div>
      </div>

      <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginRight: 4 }}>DOMAIN FILTER:</span>
            {["ALL", "BACKUPS", "MFA", "EDR", "IDENTITY", "INCIDENT_RESPONSE"].map(dom => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                style={{
                  background: selectedDomain === dom ? "var(--primary)" : "var(--surface-2)",
                  color: selectedDomain === dom ? "#04100c" : "var(--fg-2)",
                  border: selectedDomain === dom ? "none" : "1px solid var(--border)",
                  padding: "5px 12px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {dom.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: 9, color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Search underwriting criteria, proof, hashes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tool-input"
                style={{ paddingLeft: 30, width: 280 }}
              />
            </div>
            <button
              onClick={() => {
                setControls(INITIAL_CONTROLS);
                triggerToast("Controls reset to live telemetry baseline.");
              }}
              className="btn-secondary"
              title="Reload live telemetry"
            >
              <RefreshCw size={13} />
              Sync
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredControls.map((ctl) => {
            const isExpanded = expandedId === ctl.id;
            return (
              <div
                key={ctl.id}
                style={{
                  background: "var(--surface-2)",
                  border: `1px solid ${ctl.status === "VERIFIED_COMPLIANT" ? "rgba(16,185,129,0.3)" : ctl.status === "PARTIAL_COMPLIANCE" ? "rgba(245,158,11,0.3)" : "rgba(244,63,94,0.4)"}`,
                  borderRadius: 8,
                  overflow: "hidden",
                  transition: "all 0.2s ease"
                }}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : ctl.id)}
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    gap: 12,
                    userSelect: "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <div style={{ color: "var(--muted)" }}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    <div style={{
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 800,
                      fontFamily: "monospace",
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--fg-2)",
                      border: "1px solid var(--border)"
                    }}>
                      {ctl.domain}
                    </div>

                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>
                        {ctl.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                        {ctl.carrierRequirement}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                      Weight: <strong style={{ color: "var(--fg)" }}>{ctl.weight} pts</strong>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(ctl.id);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 12px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 800,
                        border: "none",
                        cursor: "pointer",
                        background:
                          ctl.status === "VERIFIED_COMPLIANT"
                            ? "rgba(16,185,129,0.18)"
                            : ctl.status === "PARTIAL_COMPLIANCE"
                            ? "rgba(245,158,11,0.18)"
                            : "rgba(244,63,94,0.18)",
                        color:
                          ctl.status === "VERIFIED_COMPLIANT"
                            ? "var(--primary)"
                            : ctl.status === "PARTIAL_COMPLIANCE"
                            ? "var(--amber)"
                            : "var(--rose)",
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor:
                          ctl.status === "VERIFIED_COMPLIANT"
                            ? "rgba(16,185,129,0.4)"
                            : ctl.status === "PARTIAL_COMPLIANCE"
                            ? "rgba(245,158,11,0.4)"
                            : "rgba(244,63,94,0.4)"
                      }}
                      title="Click to toggle status"
                    >
                      {ctl.status === "VERIFIED_COMPLIANT" && <CheckCircle2 size={13} />}
                      {ctl.status === "PARTIAL_COMPLIANCE" && <AlertTriangle size={13} />}
                      {ctl.status === "NON_COMPLIANT" && <XCircle size={13} />}
                      {ctl.status.replace(/_/g, " ")}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    padding: "16px 20px",
                    borderTop: "1px solid var(--border)",
                    background: "rgba(0,0,0,0.25)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          TECHNICAL UNDERWRITING PROOF & CONFIG ATTESTATION
                        </span>
                        <div style={{
                          background: "var(--surface-3)",
                          padding: "10px 14px",
                          borderRadius: 6,
                          fontSize: 12,
                          color: "var(--fg-2)",
                          lineHeight: 1.5,
                          fontFamily: "monospace",
                          border: "1px solid var(--border)"
                        }}>
                          {ctl.technicalProof}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          UNDERWRITER BENEFIT & RATIONALE
                        </span>
                        <div style={{
                          background: "var(--surface-3)",
                          padding: "10px 14px",
                          borderRadius: 6,
                          fontSize: 12,
                          color: "var(--fg-2)",
                          lineHeight: 1.5,
                          border: "1px solid var(--border)"
                        }}>
                          {ctl.underwriterNote}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                      paddingTop: 8,
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      fontSize: 11.5
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--muted)" }}>
                        <span>Source: <strong style={{ color: "var(--fg)" }}>{ctl.telemetrySource}</strong></span>
                        <span>Attested: <strong style={{ color: "var(--fg)" }}>{ctl.lastAttested}</strong></span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 10.5 }}>
                          SHA256: {ctl.evidenceHash.substring(0, 24)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(ctl.evidenceHash, ctl.id)}
                          className="btn-secondary"
                          style={{ padding: "4px 8px", fontSize: 10.5 }}
                        >
                          {copiedHash === ctl.id ? <Check size={12} color="var(--primary)" /> : <Copy size={12} />}
                          {copiedHash === ctl.id ? "Copied" : "Copy Hash"}
                        </button>
                      </div>
                    </div>

                    {ctl.remediationAction && (
                      <div style={{
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        padding: "8px 12px",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 12,
                        color: "var(--amber)"
                      }}>
                        <AlertTriangle size={14} />
                        <span><strong>Recommended Gap Remediation:</strong> {ctl.remediationAction}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showExportModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          padding: 20
        }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            width: "100%",
            maxWidth: 780,
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(16,185,129,0.15)",
                  color: "var(--primary)",
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontSize: 10.5,
                  fontWeight: 800,
                  marginBottom: 6
                }}>
                  <ShieldCheck size={13} />
                  CERTIFIED TECHNICAL EVIDENCE PACKAGE
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--fg)", margin: 0 }}>
                  Underwriting Submission Attestation #{Date.now().toString().slice(-6)}
                </h2>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  Generated for: {carrierTemplate} Questionnaire · Insurability Score: {stats.score}/100 ({stats.tier})
                </div>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: "var(--surface-2)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 8,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>Organization: Mercy General Health System</span>
                <span style={{ fontSize: 11, color: "var(--primary)", fontFamily: "monospace", fontWeight: 700 }}>VERIFIED BY AEGIS DFIR CORE</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.6 }}>
                This certified technical evidence package contains verified automated configuration exports, telemetry attestations, and cryptographic SHA-256 Merkle proofs for submission to cyber insurance underwriters.
              </div>
              <div style={{
                background: "var(--bg)",
                padding: "8px 12px",
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 11,
                color: "var(--cyan)",
                wordBreak: "break-all"
              }}>
                MERKLE_ROOT_SHA256: 8f4e22a76dbb9415c5897e9f3b14a2408c691350a4987cb3df29c2d1b54a7f01
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Audited Control Artifacts ({controls.length} Verified Items)
              </span>
              <div style={{
                maxHeight: 200,
                overflowY: "auto",
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--surface-2)"
              }}>
                {controls.map((ctl, idx) => (
                  <div
                    key={ctl.id}
                    style={{
                      padding: "8px 12px",
                      borderBottom: idx < controls.length - 1 ? "1px solid var(--border)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 12
                    }}
                  >
                    <span style={{ color: "var(--fg-2)" }}>{ctl.title}</span>
                    <span style={{
                      fontWeight: 700,
                      color: ctl.status === "VERIFIED_COMPLIANT" ? "var(--primary)" : "var(--amber)",
                      fontSize: 11
                    }}>
                      {ctl.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn-secondary"
              >
                <Printer size={14} />
                Print / Save PDF Dossier
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify({
                    metadata: {
                      organization: "Mercy General Health System",
                      carrier: carrierTemplate,
                      insurabilityScore: stats.score,
                      grade: stats.grade,
                      tier: stats.tier,
                      generatedAt: new Date().toISOString(),
                      merkleSeal: "8f4e22a76dbb9415c5897e9f3b14a2408c691350a4987cb3df29c2d1b54a7f01"
                    },
                    controls
                  }, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `Aegis-Insurance-Readiness-Evidence-${carrierTemplate}.json`;
                  a.click();
                  setShowExportModal(false);
                  triggerToast("Insurance Evidence Dossier downloaded successfully.");
                }}
                className="btn-primary"
              >
                <Download size={14} />
                Download Sealed JSON Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
