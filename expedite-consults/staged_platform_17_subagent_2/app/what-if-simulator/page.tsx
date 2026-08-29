"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Server,
  HardDrive,
  Database,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  ArrowRight,
  Sliders,
  CheckCircle2,
  XCircle,
  Zap,
  Activity,
  Layers,
  Info,
  DollarSign,
  Clock
} from "lucide-react";
import { MOCK_CASES, MOCK_BACKUP_SOURCES } from "@/data/recoveryData";

interface ScenarioDefinition {
  id: string;
  name: string;
  category: "ISOLATION" | "BACKUP_FAILURE" | "EXTORTION_LEAK" | "IDENTITY_DCSYNC" | "SAN_OUTAGE";
  description: string;
  hypothesis: string;
  impactedServices: string[];
  slaDegradationHours: number;
  financialImpactDeltaUSD: number;
  patientCareRisk: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  recommendedMitigation: string;
}

const PRESET_SCENARIOS: ScenarioDefinition[] = [
  {
    id: "scen-1",
    name: "Scenario A: Isolate Primary Domain Controller (DC01)",
    category: "ISOLATION",
    description: "Sever all network communication to DC01 to halt Kerberos ticket forging and GPO ransomware deployment.",
    hypothesis: "If DC01 is isolated without a staged backup KDC, all SQL and IIS services relying on Kerberos authentication will fail within 15 minutes.",
    impactedServices: ["Epic EHR Authentication", "SWIFT Wire Portal", "Exchange Hybrid Mail", "VPN Concentrator"],
    slaDegradationHours: 6.5,
    financialImpactDeltaUSD: 520000,
    patientCareRisk: "HIGH",
    recommendedMitigation: "Activate isolated secondary DC02 in clean recovery VLAN prior to cutting DC01 network ports."
  },
  {
    id: "scen-2",
    name: "Scenario B: Backup Storage SAN Array Unavailable / Damaged",
    category: "SAN_OUTAGE",
    description: "Simulate catastrophic SAN controller corruption or malicious snapshot wiping by ransomware script.",
    hypothesis: "If on-premises ZFS SAN snapshots are wiped, recovery must pull 1.8 TB across WAN from AWS S3 Immutable Cloud Object Lock.",
    impactedServices: ["PACS Medical Imaging SAN", "Historical Billing Archives", "File Storage FS01"],
    slaDegradationHours: 12.0,
    financialImpactDeltaUSD: 1740000,
    patientCareRisk: "CRITICAL",
    recommendedMitigation: "Provision AWS DirectConnect dedicated 10Gbps link to reduce WAN egress hydration from 14 hours down to 2.5 hours."
  },
  {
    id: "scen-3",
    name: "Scenario C: Threat Actor Executes Darknet Leak at Deadline -4h",
    category: "EXTORTION_LEAK",
    description: "Threat actor publishes 1.8 TB of patient PII and medical records to darknet onion mirror ahead of scheduled deadline.",
    hypothesis: "Immediate public disclosure triggers Class Action legal notices and mandatory SEC 4-day material filing acceleration.",
    impactedServices: ["Public Brand Reputation", "Compliance Disclosures", "Investor / Board Relations"],
    slaDegradationHours: 0.0,
    financialImpactDeltaUSD: 850000,
    patientCareRisk: "LOW",
    recommendedMitigation: "Pre-stage automated DMCA and darknet sinkholing notices; notify cyber insurance extortion response counsel."
  },
  {
    id: "scen-4",
    name: "Scenario D: Active Directory Kerberoasting + DCSync Attempt",
    category: "IDENTITY_DCSYNC",
    description: "Attacker uses compromised service account to request Active Directory replication (DCSync) to steal all domain password hashes.",
    hypothesis: "Full domain compromise allows attacker to forge Golden Tickets and reinfect any restored server upon network reconnection.",
    impactedServices: ["Entire Enterprise Forest", "All Domain Joined Workstations & Hypervisors"],
    slaDegradationHours: 24.0,
    financialImpactDeltaUSD: 3480000,
    patientCareRisk: "CRITICAL",
    recommendedMitigation: "Enforce enterprise KRBTGT double password reset and disable RC4-HMAC Kerberos encryption."
  }
];

export default function WhatIfSimulatorPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scen-1");
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [simResultsCalculated, setSimResultsCalculated] = useState<boolean>(true);

  // Mitigation Switchboard Toggles
  const [activeMitigations, setActiveMitigations] = useState({
    zeroTrustMicrosegmentation: true,
    cloudStandbyPilotLight: false,
    strictEgressSinkhole: true,
    doubleKrbtgtRoll: true,
  });

  const activeScenario = PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];

  const handleRunSimulation = () => {
    setSimulationRunning(true);
    setTimeout(() => {
      setSimulationRunning(false);
      setSimResultsCalculated(true);
    }, 600);
  };

  const toggleMitigation = (key: keyof typeof activeMitigations) => {
    setActiveMitigations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamically calculate mitigated SLA and financial impact
  const mitigatedImpact = useMemo(() => {
    let penaltyHours = activeScenario.slaDegradationHours;
    let costDelta = activeScenario.financialImpactDeltaUSD;

    if (activeMitigations.zeroTrustMicrosegmentation) {
      penaltyHours = Math.max(1.0, penaltyHours * 0.5);
      costDelta = costDelta * 0.45;
    }
    if (activeMitigations.cloudStandbyPilotLight) {
      penaltyHours = Math.max(0.5, penaltyHours * 0.35);
      costDelta = costDelta * 0.35;
    }
    if (activeMitigations.strictEgressSinkhole && activeScenario.category === "EXTORTION_LEAK") {
      costDelta = costDelta * 0.6;
    }
    if (activeMitigations.doubleKrbtgtRoll && activeScenario.category === "IDENTITY_DCSYNC") {
      penaltyHours = 4.0;
      costDelta = 450000;
    }

    return {
      adjustedHours: Math.round(penaltyHours * 10) / 10,
      adjustedCost: Math.round(costDelta),
      confidenceScore: 94.2
    };
  }, [activeScenario, activeMitigations]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(168,85,247,0.06) 50%, rgba(14,21,38,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              background: "rgba(6,182,212,0.15)",
              border: "1px solid rgba(6,182,212,0.4)",
              borderRadius: 8,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <HelpCircle size={18} color="var(--cyan)" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--cyan)", letterSpacing: "0.08em" }}>
                STAGE 5: INCIDENT & MITIGATION SIMULATOR
              </span>
            </div>
            <span className="badge-sev badge-medium">WHAT-IF ENGINE</span>
            <span className="badge-sev badge-success">BLAST RADIUS PREDICTOR</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginBottom: 6 }}>
            "What-If" Incident & Containment Strategy Simulator
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Interactive simulation testbed for operational hypothesis testing: Test server isolation blast radius, backup SAN failure contingencies, DCSync credential attacks, and measure SLA degradation across clinical services.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleRunSimulation}
            className="btn-primary"
            style={{ padding: "10px 18px", fontSize: 13 }}
            disabled={simulationRunning}
          >
            <Play size={16} />
            {simulationRunning ? "Simulating Scenario..." : "Run Scenario Simulation"}
          </button>
        </div>
      </div>

      {/* Preset Scenario Selector Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {PRESET_SCENARIOS.map((scen) => {
          const isSelected = selectedScenarioId === scen.id;

          return (
            <div
              key={scen.id}
              onClick={() => setSelectedScenarioId(scen.id)}
              className="card-tactical"
              style={{
                padding: 16,
                cursor: "pointer",
                border: isSelected ? "2px solid var(--cyan)" : "1px solid var(--border)",
                background: isSelected ? "rgba(6,182,212,0.08)" : "var(--surface)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                boxShadow: isSelected ? "0 0 15px rgba(6,182,212,0.2)" : "none"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge-sev badge-medium">{scen.category}</span>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: scen.patientCareRisk === "CRITICAL" ? "var(--rose)" : "var(--amber)" }}>
                  {scen.patientCareRisk} RISK
                </span>
              </div>

              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: "var(--fg)", lineHeight: 1.3 }}>
                {scen.name}
              </h3>

              <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.4 }}>
                {scen.description}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--fg-2)", paddingTop: 6, borderTop: "1px solid var(--border-subtle)" }}>
                <span>SLA Delay: <strong>+{scen.slaDegradationHours}h</strong></span>
                <span>Loss: <strong style={{ color: "var(--amber)" }}>+${(scen.financialImpactDeltaUSD / 1000).toFixed(0)}k</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Active Scenario Deep Dive (Left) + Mitigation Switchboard & Forecast (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr", gap: 20 }}>
        
        {/* Left Column: Hypothesis & Impacted Services */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          <div className="card-tactical" style={{ padding: 20, borderTop: "3px solid var(--cyan)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--cyan)", letterSpacing: "0.06em" }}>
                HYPOTHESIS & BLAST RADIUS PREDICTOR
              </span>
              <span className="badge-sev badge-critical">{activeScenario.category}</span>
            </div>

            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--fg)", marginBottom: 8 }}>
              {activeScenario.name}
            </h2>

            <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: 8, border: "1px solid var(--border)", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--amber)", textTransform: "uppercase", marginBottom: 4 }}>
                Simulation Hypothesis:
              </div>
              <p style={{ fontSize: 12.5, color: "var(--fg)", lineHeight: 1.5 }}>
                "{activeScenario.hypothesis}"
              </p>
            </div>

            {/* Impacted Services List */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
                Downstream Services Experiencing Cascading Outage:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeScenario.impactedServices.map((svc, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(244,63,94,0.08)",
                      border: "1px solid rgba(244,63,94,0.25)",
                      borderRadius: 6,
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "var(--rose)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    <AlertTriangle size={14} />
                    <span>{svc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Mitigation */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", marginBottom: 4 }}>
                Recommended Proactive Countermeasure:
              </div>
              <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.4 }}>
                {activeScenario.recommendedMitigation}
              </p>
            </div>

          </div>

        </div>

        {/* Right Column: Mitigation Switchboard & Comparative Outcome Forecast */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Mitigations Switchboard */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Sliders size={16} color="var(--primary)" />
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: "var(--fg)" }}>
                  Mitigation Switchboard & Countermeasure Tester
                </h3>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Toggle to re-calculate outcome</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 12, color: "var(--fg-2)" }}>
                <span>🛡️ Zero-Trust VLAN Microsegmentation</span>
                <input
                  type="checkbox"
                  checked={activeMitigations.zeroTrustMicrosegmentation}
                  onChange={() => toggleMitigation("zeroTrustMicrosegmentation")}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 12, color: "var(--fg-2)" }}>
                <span>☁️ AWS Cloud Standby Pilot-Light Enclave</span>
                <input
                  type="checkbox"
                  checked={activeMitigations.cloudStandbyPilotLight}
                  onChange={() => toggleMitigation("cloudStandbyPilotLight")}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 12, color: "var(--fg-2)" }}>
                <span>🔒 Strict Darknet & Tor Egress Sinkholing</span>
                <input
                  type="checkbox"
                  checked={activeMitigations.strictEgressSinkhole}
                  onChange={() => toggleMitigation("strictEgressSinkhole")}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 12, color: "var(--fg-2)" }}>
                <span>🔑 Active Directory KRBTGT Double Roll</span>
                <input
                  type="checkbox"
                  checked={activeMitigations.doubleKrbtgtRoll}
                  onChange={() => toggleMitigation("doubleKrbtgtRoll")}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }}
                />
              </label>
            </div>
          </div>

          {/* Before vs After Outcome Forecast */}
          <div className="card-tactical" style={{ padding: 18, background: "rgba(14,21,38,0.8)", border: "1px solid var(--cyan)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={16} color="var(--cyan)" />
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: "var(--fg)" }}>
                  Predicted Simulation Outcome Comparison
                </h3>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)", fontFamily: "monospace" }}>
                {mitigatedImpact.confidenceScore}% CONFIDENCE
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* Unmitigated */}
              <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--rose)", textTransform: "uppercase", marginBottom: 4 }}>
                  Raw Unmitigated Impact
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--rose)" }}>
                  +{activeScenario.slaDegradationHours} Hours
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)", marginTop: 2 }}>
                  +${(activeScenario.financialImpactDeltaUSD / 1000).toFixed(0)}k Loss
                </div>
              </div>

              {/* Mitigated */}
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", marginBottom: 4 }}>
                  With Active Mitigations
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>
                  +{mitigatedImpact.adjustedHours} Hours
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginTop: 2 }}>
                  +${(mitigatedImpact.adjustedCost / 1000).toFixed(0)}k Loss
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(6,182,212,0.1)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-2)" }}>
              💡 Mitigations reduce outage duration by <strong>{Math.round((1 - (mitigatedImpact.adjustedHours / activeScenario.slaDegradationHours)) * 100)}%</strong> and save <strong>${((activeScenario.financialImpactDeltaUSD - mitigatedImpact.adjustedCost) / 1000).toFixed(0)}k</strong> in downtime overhead.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
