"use client";

import React, { useState } from "react";
import {
  Activity,
  ShieldCheck,
  HardDrive,
  Key,
  Archive,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Zap
} from "lucide-react";
import { MOCK_READINESS_AUDIT } from "@/data/recoveryData";
import { ReadinessDimension } from "@/types/recovery";

export default function ReadinessPage() {
  const [dimensions, setDimensions] = useState<ReadinessDimension[]>(
    MOCK_READINESS_AUDIT?.dimensions || [
      {
        id: "dim-1",
        name: "Backup Immortality & WORM Object Locking",
        weight: 25,
        score: 92,
        status: "OPTIMAL",
        description: "Evaluation of cloud and on-prem backup repositories against adversarial deletion, API credential theft, and encryption.",
        keyMetrics: [
          { label: "AWS S3 Object Lock Compliance Mode", value: "Enabled (30-day retention)", compliant: true },
          { label: "Immutable Backup Retention Lock", value: "Strict WORM policy active", compliant: true },
          { label: "Multi-Party Root MFA for Vault Deletion", value: "3 of 4 Keys Required", compliant: true }
        ],
        recommendedActions: [
          "Extend S3 Object Lock retention from 30 days to 90 days for Tier-0 billing databases.",
          "Implement AWS CloudTrail real-time alert on PutBucketPolicy tampering attempts."
        ]
      },
      {
        id: "dim-2",
        name: "Identity & Tier-0 Active Directory Resilience",
        weight: 25,
        score: 78,
        status: "ADEQUATE",
        description: "Resistance of identity providers (AD DS, Entra ID, Okta) to Golden Ticket forging, DCSync, and admin takeover.",
        keyMetrics: [
          { label: "Isolated Forest Recovery Automation", value: "Configured & scripted", compliant: true },
          { label: "KRBTGT Periodic Automated Rotation", value: "Semi-annual (Target: 90 days)", compliant: false },
          { label: "Privileged Access Workstations (PAWs)", value: "Deployed on 82% of Admin pool", compliant: true }
        ],
        recommendedActions: [
          "Enforce automated 90-day KRBTGT key roll schedule via PowerShell scheduled workflow.",
          "Eliminate unconstrained Kerberos delegation on remaining 4 legacy IIS app servers."
        ]
      },
      {
        id: "dim-3",
        name: "Air-Gap Coverage & Out-of-Band Vaulting",
        weight: 20,
        score: 84,
        status: "OPTIMAL",
        description: "Physical and logical separation of secondary recovery copies from internet and primary enterprise routing.",
        keyMetrics: [
          { label: "Physical LTO-8 Tape Archival Offsite", value: "Weekly rotation to Iron Mountain", compliant: true },
          { label: "Unidirectional Data Diode Replication", value: "Active on OT SCADA networks", compliant: true },
          { label: "Standby Bare-Metal Quarantine Enclave", value: "Pre-provisioned (10Gbps air-gap)", compliant: true }
        ],
        recommendedActions: [
          "Accelerate weekly tape rotation to daily automated delta vaulting for critical PACS imagery.",
          "Conduct periodic physical tape drive read verification in sandbox lab."
        ]
      },
      {
        id: "dim-4",
        name: "Recovery Testing Frequency & SLA Validation",
        weight: 15,
        score: 68,
        status: "NEEDS_IMPROVEMENT",
        description: "Frequency and rigor of automated end-to-end sandbox restore drills measured against targeted RTO/RPO SLAs.",
        keyMetrics: [
          { label: "Monthly Automated Restore Validation", value: "Conducted on 60% of Tier-0 apps", compliant: false },
          { label: "Mean Time to Rebuild Active Directory", value: "3.2 hours (Target: < 2.0 hours)", compliant: false },
          { label: "Tabletop Cyber Drill Cadence", value: "Quarterly executed", compliant: true }
        ],
        recommendedActions: [
          "Expand automated VM boot verification to include secondary billing SQL database clusters.",
          "Implement continuous synthetic data integrity checksum testing post-restore."
        ]
      },
      {
        id: "dim-5",
        name: "Network Micro-Segmentation & Blast Radius Control",
        weight: 15,
        score: 86,
        status: "OPTIMAL",
        description: "Isolation boundaries preventing lateral malware worming between IT office networks, medical devices, and server enclaves.",
        keyMetrics: [
          { label: "Clinical VLAN Egress Filtering", value: "Strict zero-trust micro-seg", compliant: true },
          { label: "SMBv1 and RDP Inter-VLAN Blocking", value: "Enforced at core Palo Alto firewall", compliant: true },
          { label: "Software-Defined Per-Host Quarantine", value: "CrowdStrike Network Containment Ready", compliant: true }
        ],
        recommendedActions: [
          "Review exception rules on Radiology DICOM subnet port 104.",
          "Implement 802.1X dynamic VLAN assignment across all physical medical carts."
        ]
      }
    ]
  );

  const [isAuditing, setIsAuditing] = useState(false);
  const [selectedDimId, setSelectedDimId] = useState("dim-1");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const calculateOverallScore = () => {
    const totalWeighted = dimensions.reduce((acc, dim) => acc + (dim.score * dim.weight), 0);
    const totalWeight = dimensions.reduce((acc, dim) => acc + dim.weight, 0);
    return Math.round(totalWeighted / totalWeight);
  };

  const overallScore = calculateOverallScore();
  const getGrade = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  const handleScoreChange = (dimId: string, delta: number) => {
    setDimensions(prev =>
      prev.map(dim => {
        if (dim.id === dimId) {
          const newScore = Math.min(100, Math.max(0, dim.score + delta));
          const newStatus = newScore >= 85 ? "OPTIMAL" : newScore >= 70 ? "ADEQUATE" : newScore >= 50 ? "NEEDS_IMPROVEMENT" : "CRITICAL_GAP";
          return { ...dim, score: newScore, status: newStatus };
        }
        return dim;
      })
    );
  };

  const handleRunFullAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      showToast("Full continuous posture assessment completed! Compliance frameworks validated.");
    }, 1200);
  };

  const selectedDim = dimensions.find(d => d.id === selectedDimId) || dimensions[0];

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
            <Activity size={22} color="#06b6d4" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                Pre-Incident Recovery Readiness & Posture Assessor
              </h1>
              <span className="badge-sev badge-medium">PILLAR 4 · ASSESS</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Preventive posture scorer (0-100) assessing backup immortality, identity resilience, air-gapping & RTO readiness.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => showToast("Exported Cyber Insurance Posture Scorecard (PDF / JSON).")}
            className="btn-secondary"
          >
            <Download size={14} color="#06b6d4" />
            <span>Insurance Scorecard</span>
          </button>

          <button
            onClick={handleRunFullAudit}
            disabled={isAuditing}
            className="btn-primary"
            style={{
              background: isAuditing ? "var(--surface-3)" : "var(--primary)",
              cursor: isAuditing ? "not-allowed" : "pointer"
            }}
          >
            <RefreshCw size={14} className={isAuditing ? "animate-spin" : ""} />
            <span>{isAuditing ? "Auditing Telemetry..." : "Run Full Posture Audit"}</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard Overview Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
        {/* Overall Posture Radial Gauge */}
        <div className="card-tactical" style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          background: "linear-gradient(180deg, var(--surface) 0%, rgba(14,21,38,0.9) 100%)",
          border: "1px solid var(--border)"
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            OVERALL RESILIENCE SCORE
          </div>

          <div style={{
            position: "relative",
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: `conic-gradient(#10b981 ${overallScore * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "14px 0"
          }}>
            <div style={{
              width: 106,
              height: 106,
              borderRadius: "50%",
              background: "var(--surface)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: overallScore >= 80 ? "#10b981" : overallScore >= 70 ? "#06b6d4" : "#f59e0b" }}>
                {overallScore}
              </span>
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>
                OUT OF 100
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Posture Rating:</span>
            <span style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#10b981",
              background: "rgba(16,185,129,0.15)",
              padding: "2px 8px",
              borderRadius: 4
            }}>
              Grade {getGrade(overallScore)} (Robust)
            </span>
          </div>
        </div>

        {/* Compliance Frameworks Checklist & Mini Bar Stats */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
              Regulatory & Insurance Compliance Adherence
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              Continuous automated evaluation against international ransomware recovery standards.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { name: "NIST CSF 2.0 (Recover)", score: 86, passed: true },
              { name: "HIPAA § 164.308", score: 88, passed: true },
              { name: "CISA RRA Framework", score: 79, passed: true },
              { name: "CMMC 2.0 Level 2", score: 74, passed: false },
              { name: "NYDFS 23 NYCRR 500", score: 85, passed: true },
              { name: "ISO 27031 (BCP/DR)", score: 82, passed: true }
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--fg)" }}>{f.name}</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: f.passed ? "#10b981" : "#f59e0b"
                  }}>
                    {f.score}%
                  </span>
                </div>
                <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${f.score}%`, height: "100%", background: f.passed ? "#10b981" : "#f59e0b" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(6, 182, 212, 0.08)", padding: "10px 14px", borderRadius: 6, border: "1px solid rgba(6, 182, 212, 0.2)" }}>
            <Sparkles size={16} color="#06b6d4" />
            <span style={{ fontSize: 11.5, color: "var(--fg-2)" }}>
              <strong>AI Posture Projection:</strong> Implementing 90-day automated KRBTGT rotation will elevate overall readiness score to <strong>88 (+6 pts)</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* 5 Dimensions Interactive Breakout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 16 }}>
        {/* Left: Dimension Selector Cards */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
            5 Core Readiness Dimensions
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dimensions.map(dim => {
              const isSelected = dim.id === selectedDimId;
              const icons = [HardDrive, Key, Archive, RefreshCw, Layers];
              const Icon = dim.id === "dim-1" ? HardDrive : dim.id === "dim-2" ? Key : dim.id === "dim-3" ? Archive : dim.id === "dim-4" ? RefreshCw : Layers;

              return (
                <div
                  key={dim.id}
                  onClick={() => setSelectedDimId(dim.id)}
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    cursor: "pointer",
                    background: isSelected ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                    border: isSelected ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: isSelected ? "rgba(16,185,129,0.2)" : "var(--surface-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Icon size={16} color={isSelected ? "#10b981" : "var(--muted)"} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "#10b981" : "var(--fg)" }}>
                        {dim.name}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: dim.score >= 80 ? "#10b981" : dim.score >= 70 ? "#06b6d4" : "#f59e0b" }}>
                        {dim.score}/100
                      </span>
                    </div>

                    <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 4 }}>
                      <div style={{ width: `${dim.score}%`, height: "100%", background: dim.score >= 80 ? "#10b981" : dim.score >= 70 ? "#06b6d4" : "#f59e0b" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dimension Deep Dive & What-If Simulation Sliders */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                {selectedDim.name}
              </h2>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Dimension Weight: {selectedDim.weight}% · Status: {selectedDim.status}
              </div>
            </div>

            {/* Score Tuner Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                onClick={() => handleScoreChange(selectedDim.id, -5)}
                className="btn-secondary"
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                -5%
              </button>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#10b981", minWidth: 40, textAlign: "center" }}>
                {selectedDim.score}%
              </span>
              <button
                onClick={() => handleScoreChange(selectedDim.id, 5)}
                className="btn-secondary"
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                +5%
              </button>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
            {selectedDim.description}
          </p>

          {/* Key Metrics Checklist */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              Active Posture Telemetry Checks
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedDim.keyMetrics.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 12
                  }}
                >
                  <span style={{ color: "var(--fg)" }}>{m.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 11 }}>{m.value}</span>
                    {m.compliant ? (
                      <CheckCircle2 size={14} color="#10b981" />
                    ) : (
                      <AlertTriangle size={14} color="#f59e0b" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Remediation Roadmap */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              Prescribed Posture Hardening Actions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedDim.recommendedActions.map((act, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "rgba(16, 185, 129, 0.05)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "var(--fg-2)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Zap size={13} color="#10b981" />
                    <span>{act}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleScoreChange(selectedDim.id, 4);
                      showToast(`Applied hardening fix: ${act}`);
                    }}
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      color: "#10b981",
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Apply Fix (+4%)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
