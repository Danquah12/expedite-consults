"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Lock,
  Layers,
  Activity,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Eye,
  Sliders,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Award,
  ChevronDown,
  ChevronRight,
  Check,
  Copy
} from "lucide-react";

interface AIRecommendation {
  id: string;
  title: string;
  category: "RECOVERY_STRATEGY" | "CONTAINMENT_ISOLATION" | "FORENSIC_PRESERVATION" | "CREDENTIAL_ROLL";
  aiConfidencePct: number;
  recommendationState: "PENDING_HUMAN_APPROVAL" | "AUTONOMOUSLY_STAGED" | "APPROVED_EXECUTING" | "REJECTED_BY_ANALYST";
  recommendedAction: string;
  evidenceSources: {
    name: string;
    type: string;
    telemetryId: string;
    verified: boolean;
  }[];
  alternativesEvaluated: {
    actionName: string;
    confidencePct: number;
    tradeoffSummary: string;
    reasonRejected: string;
  }[];
  riskOfDelay: {
    financialHourlyUSD: number;
    lateralSpreadProbabilityPct: number;
    urgencyLevel: "CRITICAL" | "HIGH" | "MEDIUM";
    narrative: string;
  };
  explainabilityAttributions: {
    feature: string;
    contributionPct: number;
    evidenceValue: string;
  }[];
  safetyGuardrailsEnforced: string[];
  dualApprovalRequired: boolean;
}

const INITIAL_AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "rec-01",
    title: "Execute Automated Bare-Metal Rollback on Domain Controller DC01 to S3 Snapshot #20260823-0400",
    category: "RECOVERY_STRATEGY",
    aiConfidencePct: 97.4,
    recommendationState: "PENDING_HUMAN_APPROVAL",
    recommendedAction: "Restore virtual disk from immutable S3 Object Lock snapshot captured 2 hours prior to initial malware intrusion. Purge infected local VHDX.",
    evidenceSources: [
      { name: "AWS S3 Object Lock Compliance Seal", type: "Cryptographic Merkle Hash", telemetryId: "S3-OBJ-8841-A", verified: true },
      { name: "Sysmon Event ID 1 (Process Creation)", type: "vssadmin shadow copy delete invocation", telemetryId: "EID-1-PID-4892", verified: true },
      { name: "Active Directory Replication Health", type: "Clean forest metadata check", telemetryId: "AD-REP-01", verified: true }
    ],
    alternativesEvaluated: [
      {
        actionName: "In-Memory RSA Key Carving from RAM",
        confidencePct: 34.2,
        tradeoffSummary: "Avoids snapshot rollback but has < 35% probability of key extraction for LockBit 3.0 ChaCha20 implementation.",
        reasonRejected: "High failure rate with modern curve25519 cipher keys."
      },
      {
        actionName: "Selective File-Level Decryption Tooling",
        confidencePct: 12.0,
        tradeoffSummary: "No public decryptor exists for LockBit 3.0 Black without private master key.",
        reasonRejected: "Zero viable cryptographic flaw discovered."
      }
    ],
    riskOfDelay: {
      financialHourlyUSD: 14200,
      lateralSpreadProbabilityPct: 22,
      urgencyLevel: "CRITICAL",
      narrative: "Each hour of delay costs $14,200 in patient intake downtime; 22% risk of secondary stager beaconing to C2 if host remains powered."
    },
    explainabilityAttributions: [
      { feature: "Immutable S3 Snapshot Integrity", contributionPct: 42, evidenceValue: "100% clean SHA-256 match" },
      { feature: "Entropy Destruction on Local Volume", contributionPct: 32, evidenceValue: "7.988 Shannon Entropy jump" },
      { feature: "Time-to-Restore Feasibility", contributionPct: 18, evidenceValue: "18.5 min estimated RTO" },
      { feature: "Zero Known Cryptographic Flaw", contributionPct: 8, evidenceValue: "LockBit 3.0 ChaCha20/Curve25519" }
    ],
    safetyGuardrailsEnforced: [
      "Mandatory Dual-Custody Approval for Tier-0 AD DC Destruction/Overwrite",
      "Hallucination Guardrail Check Passed (No phantom restore targets detected)",
      "Chain-of-Reasoning Verifiable Audit Trail Generated"
    ],
    dualApprovalRequired: true
  },
  {
    id: "rec-02",
    title: "Enforce Dynamic Network Micro-Segmentation on Clinical VLAN 10.14.3.0/24",
    category: "CONTAINMENT_ISOLATION",
    aiConfidencePct: 94.8,
    recommendationState: "AUTONOMOUSLY_STAGED",
    recommendedAction: "Apply immediate Palo Alto drop rule blocking ports 445/3389 between User Workstations and Clinical SQL Database servers.",
    evidenceSources: [
      { name: "Palo Alto Flow Analytics", type: "SMB high-volume anomaly (1,420 pkts/sec)", telemetryId: "PAN-FLOW-091", verified: true },
      { name: "CrowdStrike Falcon Sensor", type: "PsExec lateral movement detection", telemetryId: "CS-IOA-992", verified: true }
    ],
    alternativesEvaluated: [
      {
        actionName: "Per-Host EDR Network Containment",
        confidencePct: 72.0,
        tradeoffSummary: "Isolates hosts individually but risks missing unmanaged medical devices.",
        reasonRejected: "Potential lateral worming to non-agent clinical carts."
      }
    ],
    riskOfDelay: {
      financialHourlyUSD: 8500,
      lateralSpreadProbabilityPct: 65,
      urgencyLevel: "CRITICAL",
      narrative: "Malware lateral spread velocity is 3.4 hosts per minute. Immediate micro-segmentation prevents EHR DB encryption."
    },
    explainabilityAttributions: [
      { feature: "Lateral SMB Propagation Spike", contributionPct: 48, evidenceValue: "1,420 pkts/sec across subnet boundary" },
      { feature: "EHR Database Proximity", contributionPct: 34, evidenceValue: "Target is Tier-0 SQL-CLINICAL-01" },
      { feature: "Blast Radius Prediction", contributionPct: 18, evidenceValue: "24 susceptible hosts in destination VLAN" }
    ],
    safetyGuardrailsEnforced: [
      "Auto-Containment Guardrail Active (Advisory Mode with 60s rollback failsafe)",
      "Zero Clinical Traffic Dropped between verified medical diagnostic carts"
    ],
    dualApprovalRequired: false
  }
];

export default function AISafetyPage() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(INITIAL_AI_RECOMMENDATIONS);
  const [selectedId, setSelectedId] = useState<string>("rec-01");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedRec = recommendations.find(r => r.id === selectedId) || recommendations[0];

  const stats = useMemo(() => {
    return {
      overallTrustScore: 96.4,
      hallucinationGuardHealthPct: 99.8,
      modelDriftIndex: 0.02,
      activeRecommendationsCount: recommendations.length,
      pendingApprovalsCount: recommendations.filter(r => r.recommendationState === "PENDING_HUMAN_APPROVAL").length
    };
  }, [recommendations]);

  const approveRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(r => (r.id === id ? { ...r, recommendationState: "APPROVED_EXECUTING" } : r))
    );
    setToastMessage("AI recommendation authorized and queued for safe orchestration.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const rejectRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(r => (r.id === id ? { ...r, recommendationState: "REJECTED_BY_ANALYST" } : r))
    );
    setToastMessage("AI recommendation rejected. Feedback logged to model refinement pipeline.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div style={{ padding: "24px 28px", minHeight: "calc(100vh - 54px)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast */}
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

      {/* Header Banner */}
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
              EXPLAINABLE AI SAFETY & TRUST LAYER
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Transparent Decision Provenance & Human Governance
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--fg)", margin: 0 }}>
            Explainable AI Safety Layer & Trust Score
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4, maxWidth: 880 }}>
            Provides complete explainability for all automated recovery recommendations: full evidence source provenance, SHAP feature attributions, alternative action trade-off evaluations, cost-of-delay quantification, and dual-custody approval enforcement.
          </p>
        </div>

        {/* Status Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.3)",
            padding: "8px 14px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 700,
            color: "var(--primary)"
          }}>
            <ShieldCheck size={16} />
            AI Guardrails Enforced: 100% Compliant
          </div>
        </div>
      </div>

      {/* KPI & Trust Scoreboard */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {/* Model Trust Score */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Overall Model Trust Score</span>
            <Award size={16} color="var(--primary)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--primary)" }}>{stats.overallTrustScore}%</span>
            <span style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700 }}>High Fidelity</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Calibrated on 4,200+ Ransomware Incidents</div>
        </div>

        {/* Hallucination Health */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--cyan)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Hallucination Guard Health</span>
            <Sparkles size={16} color="var(--cyan)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--cyan)" }}>{stats.hallucinationGuardHealthPct}%</span>
            <span style={{ fontSize: 11.5, color: "var(--fg-2)" }}>0 Anomalies</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Target Host & Disk Artifacts 100% Grounded</div>
        </div>

        {/* Pending Human Approvals */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--amber)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Pending Human Approvals</span>
            <Lock size={16} color="var(--amber)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--amber)" }}>{stats.pendingApprovalsCount}</span>
            <span style={{ fontSize: 11.5, color: "var(--amber)", fontWeight: 700 }}>Dual-Custody</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Zero autonomous destructive actions allowed</div>
        </div>

        {/* Model Drift Index */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--purple)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Telemetry Drift Index</span>
            <Activity size={16} color="var(--purple)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--fg)" }}>0.02</span>
            <span style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700 }}>Nominal</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Continuous EDR and SIEM Drift Monitoring</div>
        </div>
      </div>

      {/* Main Two-Column Layout: Recommendations Selector + Explainability Deep Dive */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: 16, flex: 1 }}>
        {/* Left Column: Recommendations List */}
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Active AI Recovery Decisions ({recommendations.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recommendations.map((rec) => {
              const isSelected = selectedId === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedId(rec.id)}
                  style={{
                    background: isSelected ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--fg-2)",
                      fontFamily: "monospace"
                    }}>
                      {rec.category}
                    </span>

                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "var(--primary)"
                    }}>
                      {rec.aiConfidencePct}% Confidence
                    </span>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                    {rec.title}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                    <span>Urgency: <strong style={{ color: "var(--rose)" }}>{rec.riskOfDelay.urgencyLevel}</strong></span>
                    <span style={{
                      color:
                        rec.recommendationState === "APPROVED_EXECUTING"
                          ? "var(--primary)"
                          : rec.recommendationState === "REJECTED_BY_ANALYST"
                          ? "var(--rose)"
                          : "var(--amber)",
                      fontWeight: 700
                    }}>
                      {rec.recommendationState.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Complete Explainability & Evidence Deep Dive */}
        <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Recommendation Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(16,185,129,0.15)",
                  color: "var(--primary)",
                  fontFamily: "monospace"
                }}>
                  CONFIDENCE RATING: {selectedRec.aiConfidencePct}%
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  {selectedRec.category}
                </span>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "var(--fg)", margin: 0 }}>
                {selectedRec.title}
              </h2>
            </div>

            {/* Approval Status Badge */}
            <div style={{
              background:
                selectedRec.recommendationState === "APPROVED_EXECUTING"
                  ? "rgba(16,185,129,0.15)"
                  : selectedRec.recommendationState === "REJECTED_BY_ANALYST"
                  ? "rgba(244,63,94,0.15)"
                  : "rgba(245,158,11,0.15)",
              color:
                selectedRec.recommendationState === "APPROVED_EXECUTING"
                  ? "var(--primary)"
                  : selectedRec.recommendationState === "REJECTED_BY_ANALYST"
                  ? "var(--rose)"
                  : "var(--amber)",
              border: "1px solid currentColor",
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800
            }}>
              {selectedRec.recommendationState.replace(/_/g, " ")}
            </div>
          </div>

          {/* Recommended Action Summary Box */}
          <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 18px",
            fontSize: 12.5,
            color: "var(--fg)",
            lineHeight: 1.5
          }}>
            <strong style={{ color: "var(--primary)" }}>Recommended Execution: </strong>
            {selectedRec.recommendedAction}
          </div>

          {/* Evidence Sources & Provenance */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              1. Verifiable Evidence Sources & Telemetry Grounds ({selectedRec.evidenceSources.length})
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
              {selectedRec.evidenceSources.map((ev, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{ev.name}</span>
                    <CheckCircle2 size={13} color="var(--primary)" />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{ev.type}</span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--cyan)" }}>Ref: {ev.telemetryId}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explainability / SHAP Feature Attributions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--purple)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              2. Explainability & Feature Contribution Weights (SHAP Analysis)
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedRec.explainabilityAttributions.map((attr, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface-3)",
                    padding: "8px 12px",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 11.5
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--fg)", fontWeight: 600 }}>{attr.feature}</span>
                    <span style={{ color: "var(--muted)", fontSize: 10.5 }}>({attr.evidenceValue})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 80, height: 5, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${attr.contributionPct * 2}%`, height: "100%", background: "var(--purple)" }} />
                    </div>
                    <span style={{ color: "var(--purple)", fontWeight: 800, width: 35, textAlign: "right" }}>
                      +{attr.contributionPct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Actions Evaluated */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              3. Evaluated Alternative Strategies & Rejection Rationale
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedRec.alternativesEvaluated.map((alt, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    padding: "10px 14px",
                    borderRadius: 6,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{alt.actionName}</span>
                    <span style={{ fontSize: 11, color: "var(--amber)", fontWeight: 700 }}>Confidence: {alt.confidencePct}%</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{alt.tradeoffSummary}</div>
                  <div style={{ fontSize: 11, color: "var(--rose)" }}><strong>Rejection Reason:</strong> {alt.reasonRejected}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk of Delay Calculation */}
          <div style={{
            background: "rgba(244,63,94,0.08)",
            border: "1px solid rgba(244,63,94,0.25)",
            padding: "12px 16px",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--rose)", textTransform: "uppercase" }}>
                Cost of Hesitation & Delay Risk Model
              </span>
              <span style={{ fontSize: 12, fontWeight: 900, color: "var(--rose)" }}>
                +${selectedRec.riskOfDelay.financialHourlyUSD.toLocaleString()} / Hour
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-2)" }}>
              {selectedRec.riskOfDelay.narrative}
            </div>
          </div>

          {/* Human Sign-Off / Approval Controls */}
          {selectedRec.recommendationState === "PENDING_HUMAN_APPROVAL" && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--border)"
            }}>
              <button
                onClick={() => rejectRecommendation(selectedRec.id)}
                className="btn-secondary"
                style={{ color: "var(--rose)", borderColor: "rgba(244,63,94,0.4)" }}
              >
                Reject / Override Recommendation
              </button>

              <button
                onClick={() => approveRecommendation(selectedRec.id)}
                className="btn-primary"
              >
                <ShieldCheck size={15} />
                Authorize & Sign Action (Dual-Custody)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
