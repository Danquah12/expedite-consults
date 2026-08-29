"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  Lock,
  Terminal,
  Clock,
  Eye,
  Server,
  Layers,
  Power,
  RefreshCw,
  Cpu,
  Activity,
  ArrowRight,
  Sparkles,
  Target,
  FileCheck,
  Network,
  Crosshair,
  Shield
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { RansomwareCase } from "@/types/recovery";

interface LifecycleStep {
  id: number;
  name: string;
  shortName: string;
  tagline: string;
  phase: "PREVENT" | "CONTAIN" | "RECOVER" | "GOVERN";
  status: "COMPLETED" | "ACTIVE" | "CRITICAL_ENGAGED" | "STANDBY" | "MONITORING" | "OPTIMIZING";
  confidencePct: number;
  durationEst: string;
  systemsInvolved: string[];
  keyAction: string;
  telemetryInput: string;
  outputArtifact: string;
  linkHref: string;
}

const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    id: 1,
    name: "1. Continuous Readiness & Baseline",
    shortName: "Prepare",
    tagline: "Cryptographic baseline verification & canary trap seeding",
    phase: "PREVENT",
    status: "COMPLETED",
    confidencePct: 99.8,
    durationEst: "Continuous",
    systemsInvolved: ["Canary Grid", "Posture Auditor", "Backup Verifier"],
    keyAction: "1,240 canary tripwires armed across 14 file shares; baseline SHA-256 verified.",
    telemetryInput: "Filesystem minifilter hooks, hourly immutable snapshot probes",
    outputArtifact: "Readiness Score: 94.2% (Grade A) - Posture baseline certified",
    linkHref: "/readiness"
  },
  {
    id: 2,
    name: "2. Attack Surface & Threat Risk",
    shortName: "Assess Risk",
    tagline: "Weaponized CVE identification & EPSS vulnerability triage",
    phase: "PREVENT",
    status: "COMPLETED",
    confidencePct: 96.5,
    durationEst: "< 500 ms",
    systemsInvolved: ["Attack Surface Mgr", "Vuln Prioritizer", "CISA KEV Feed"],
    keyAction: "Triaged 18 perimeter assets; prioritized CVE-2024-3400 (VPN Gateway CVSS 10.0).",
    telemetryInput: "External port telemetry, CISA Known Exploited Vulnerabilities catalog",
    outputArtifact: "Attack Surface Index: 14 High-risk perimeter ingress points identified",
    linkHref: "/attack-surface"
  },
  {
    id: 3,
    name: "3. Pre-Encryption Early Warning",
    shortName: "Detect Progression",
    tagline: "Sub-second entropy bursts & heuristic stager detection",
    phase: "CONTAIN",
    status: "COMPLETED",
    confidencePct: 99.4,
    durationEst: "180 ms",
    systemsInvolved: ["Early Warning Engine", "Shannon Entropy ML", "Sysmon EID1"],
    keyAction: "Intercepted vssadmin shadow purge & Shannon entropy jump (7.988) on SQL-BILLING.",
    telemetryInput: "Kernel minifilter I/O rate (5,420 ops/sec), vssadmin.exe process injection",
    outputArtifact: "Early Warning Alert: INC-2026-8841 LockBit 3.0 stager confirmed",
    linkHref: "/early-warning"
  },
  {
    id: 4,
    name: "4. Blast Radius Graph Propagation",
    shortName: "Predict Blast",
    tagline: "Autonomous lateral movement & SMB share exposure modeling",
    phase: "CONTAIN",
    status: "COMPLETED",
    confidencePct: 94.8,
    durationEst: "320 ms",
    systemsInvolved: ["Blast Radius Predictor", "AD Graph DAG", "SMB Share Mapper"],
    keyAction: "Projected 24 hosts / 14 SMB shares / 1.8 TB data impact before propagation.",
    telemetryInput: "BloodHound Active Directory graph, Kerberos TGT tickets, SMB session map",
    outputArtifact: "Blast Graph Model: 4 Chokepoints calculated with 92% containment ROI",
    linkHref: "/blast-radius"
  },
  {
    id: 5,
    name: "5. Zero-Hesitation Kill-Chain Sever",
    shortName: "Interrupt Kill Chain",
    tagline: "Sub-second BGP cutoff, SMB isolation & KRBTGT double-roll",
    phase: "CONTAIN",
    status: "ACTIVE",
    confidencePct: 98.7,
    durationEst: "Sub-Second",
    systemsInvolved: ["Kill-Chain Interrupter", "BGP Router Engine", "EDR Micro-Seg"],
    keyAction: "Severing SMB 445 on Core VLAN, isolating DC01, and revoking svc_backup_mgmt.",
    telemetryInput: "C2 beacon trace (c2-healthcheck.dynamic-dns.net:443), PsExec execution",
    outputArtifact: "Containment Directives: 5 High-impact interruption actions executing",
    linkHref: "/killchain-interrupter"
  },
  {
    id: 6,
    name: "6. Immutable Backup Emergency Lockdown",
    shortName: "Protect Backups",
    tagline: "AWS S3 WORM Object Lock & ZFS snapshot freeze",
    phase: "CONTAIN",
    status: "CRITICAL_ENGAGED",
    confidencePct: 100.0,
    durationEst: "95 ms",
    systemsInvolved: ["Backup Lockdown Module", "AWS S3 API", "TrueNAS ZFS Core"],
    keyAction: "Enforced compliance mode on 45.8 TB S3 bucket; suspended lifecycle deletion.",
    telemetryInput: "API audit trail, snapshot deletion RPC intercept, quorum signer state",
    outputArtifact: "Lockdown Certificate: 100% immutable backup retention verified intact",
    linkHref: "/backup-lockdown"
  },
  {
    id: 7,
    name: "7. Forensic Evidence & Memory Freeze",
    shortName: "Preserve Evidence",
    tagline: "FRE 901 cryptographic hashing & RAM acquisition",
    phase: "RECOVER",
    status: "STANDBY",
    confidencePct: 97.1,
    durationEst: "12 min",
    systemsInvolved: ["Evidence Vault", "RAM Dump Engine", "Merkle Hash Tree"],
    keyAction: "Capture 128 GB volatile RAM from DC01; generate SHA-256 Merkle chain of custody.",
    telemetryInput: "Hyper-V memory snapshot, crashdump kernel driver, pcap stream capture",
    outputArtifact: "Evidence Package: FRE-901-2026-8841-A sealed into WORM vault",
    linkHref: "/evidence"
  },
  {
    id: 8,
    name: "8. Recovery Feasibility & AI Pathway",
    shortName: "Assess Options",
    tagline: "Multi-pathway optimizer: S3 restore vs Key Decryption vs Cleanroom",
    phase: "RECOVER",
    status: "STANDBY",
    confidencePct: 95.3,
    durationEst: "45 sec",
    systemsInvolved: ["Feasibility AI", "RTO / RPO Optimizer", "Crypto Analyzer"],
    keyAction: "Calculate optimal restore vector (ZFS Snapshots + S3 Immutable: RTO 4.5h, 0% ransom).",
    telemetryInput: "Backup readiness ratings, cipher flaw analysis, DB transaction logs",
    outputArtifact: "Optimal Recovery Pathway: Pathway A (Immutable S3 + ZFS Rollback)",
    linkHref: "/feasibility"
  },
  {
    id: 9,
    name: "9. Phased Recovery Orchestration",
    shortName: "Orchestrate Recovery",
    tagline: "Tier-0 AD -> Tier-1 DB -> Tier-2 App dependency DAG execution",
    phase: "RECOVER",
    status: "STANDBY",
    confidencePct: 93.8,
    durationEst: "3.2 hours",
    systemsInvolved: ["Plan Orchestrator", "Hypervisor Control", "DBCC Engine"],
    keyAction: "Execute phased parallel restoration of 24 VMs into isolated quarantine enclave.",
    telemetryInput: "Dependency DAG graph, SAN IOPS allocation, host health telemetry",
    outputArtifact: "Execution Progress: Phase 1 (Identity DC) -> Phase 2 (Clinical SQL)",
    linkHref: "/recovery-planner"
  },
  {
    id: 10,
    name: "10. Clean Environment & Gatekeeper",
    shortName: "Validate Environment",
    tagline: "Reinfection hunting, webshell scan & production sign-off",
    phase: "RECOVER",
    status: "STANDBY",
    confidencePct: 98.9,
    durationEst: "30 min",
    systemsInvolved: ["Reinfection Hunter", "Clean Gatekeeper", "YARA Engine"],
    keyAction: "Deep scan restored hosts for scheduled tasks, rootkits, and dormant C2 web shells.",
    telemetryInput: "Memory inspection, binary cryptographic checksums, Autoruns telemetry",
    outputArtifact: "Production Gatekeeper: Dual-custody certification approval",
    linkHref: "/clean-validation"
  },
  {
    id: 11,
    name: "11. Post-Incident Synthesis & Disclosures",
    shortName: "Learn & Improve",
    tagline: "Timeline generation, SEC 8-K / HIPAA disclosure & root cause",
    phase: "GOVERN",
    status: "STANDBY",
    confidencePct: 99.0,
    durationEst: "15 min",
    systemsInvolved: ["Compliance Generator", "Root-Cause Correlator", "Report Engine"],
    keyAction: "Generate SEC Form 8-K Item 1.05 and HIPAA breach notification legal filing drafts.",
    telemetryInput: "Incident timeline audit log, exfiltration assessor data exposure records",
    outputArtifact: "Regulatory Package: SEC / OCR statutory filings & executive brief",
    linkHref: "/compliance-disclosure"
  },
  {
    id: 12,
    name: "12. Continuous Resilience & Simulation",
    shortName: "Continuous Hardening",
    tagline: "Policy auto-tuning, tabletop drill injects & insurance attestation",
    phase: "GOVERN",
    status: "STANDBY",
    confidencePct: 96.0,
    durationEst: "Ongoing",
    systemsInvolved: ["Tabletop Simulator", "Confidence Index", "Policy Engine"],
    keyAction: "Incorporate incident indicators into proactive canary grid; boost RCI score.",
    telemetryInput: "Attack progression timeline, SOC analyst response latency telemetry",
    outputArtifact: "Updated Resilience Posture: Recovery Confidence Index 94/100",
    linkHref: "/simulation"
  }
];

export default function AutopilotPage() {
  const [selectedCase, setSelectedCase] = useState<RansomwareCase>(MOCK_CASES[0]);
  const [automationMode, setAutomationMode] = useState<"ADVISORY" | "ASSISTED" | "AUTONOMOUS">("AUTONOMOUS");
  const [cycleStatus, setCycleStatus] = useState<"IDLE" | "RUNNING" | "PAUSED" | "COMPLETED">("RUNNING");
  const [selectedStepId, setSelectedStepId] = useState<number>(5);
  const [activeStepId, setActiveStepId] = useState<number>(5);
  const [executionLogs, setExecutionLogs] = useState<
    { id: string; timestamp: string; stepId: number; level: "INFO" | "CRITICAL" | "ACTION" | "SUCCESS"; message: string }[]
  >([
    {
      id: "log-1",
      timestamp: "00:32:01",
      stepId: 1,
      level: "SUCCESS",
      message: "Continuous readiness baseline verified: 1,240 Canary tripwires armed across 14 file shares."
    },
    {
      id: "log-2",
      timestamp: "00:32:05",
      stepId: 2,
      level: "INFO",
      message: "Threat intelligence correlation: LockBit 3.0 IOCs matched against active perimeter telemetry."
    },
    {
      id: "log-3",
      timestamp: "00:32:10",
      stepId: 3,
      level: "CRITICAL",
      message: "Early Warning: Shannon entropy spike 7.988 detected on FS-CLINICAL-02 (5,420 files/min burst)."
    },
    {
      id: "log-4",
      timestamp: "00:32:14",
      stepId: 4,
      level: "INFO",
      message: "Blast Radius Engine: Modeled propagation DAG across 24 hosts, 14 SMB shares, 1.8 TB data impact."
    },
    {
      id: "log-5",
      timestamp: "00:32:18",
      stepId: 6,
      level: "ACTION",
      message: "Emergency Backup Lockdown ENGAGED: AWS S3 Object Lock Compliance freeze enforced on 45.8 TB vault."
    },
    {
      id: "log-6",
      timestamp: "00:32:22",
      stepId: 5,
      level: "CRITICAL",
      message: "Autonomous Kill-Chain Sever executing: BGP egress blocked, SMB 445 isolated, svc_backup_mgmt revoked."
    }
  ]);

  const [steps, setSteps] = useState<LifecycleStep[]>(LIFECYCLE_STEPS);

  const selectedStep = steps.find((s) => s.id === selectedStepId) || steps[4];

  const advanceStep = () => {
    if (activeStepId < 12) {
      const nextId = activeStepId + 1;
      setActiveStepId(nextId);
      setSelectedStepId(nextId);

      setSteps((prev) =>
        prev.map((step) => {
          if (step.id === activeStepId) return { ...step, status: "COMPLETED" };
          if (step.id === nextId) return { ...step, status: "ACTIVE" };
          return step;
        })
      );

      const nextStepObj = steps.find((s) => s.id === nextId);
      const timeStr = new Date().toTimeString().split(" ")[0];
      setExecutionLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          stepId: nextId,
          level: nextId <= 6 ? "CRITICAL" : "ACTION",
          message: `Autopilot transitioned to Step ${nextId}: ${nextStepObj?.name}. Key action: ${nextStepObj?.keyAction}`
        },
        ...prev
      ]);
    } else {
      setCycleStatus("COMPLETED");
      setExecutionLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toTimeString().split(" ")[0],
          stepId: 12,
          level: "SUCCESS",
          message: "🎉 Full 12-Step Autonomous Resilience Lifecycle successfully executed and validated."
        },
        ...prev
      ]);
    }
  };

  const triggerMasterEmergencyCycle = () => {
    setCycleStatus("RUNNING");
    setActiveStepId(5);
    setSelectedStepId(5);

    const timeStr = new Date().toTimeString().split(" ")[0];
    setExecutionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        stepId: 5,
        level: "CRITICAL",
        message: `🚨 MASTER EMERGENCY CYCLE TRIGGERED by Incident Commander for ${selectedCase.caseNumber} (${selectedCase.organization}). DEFCON 1 Engaged.`
      },
      ...prev
    ]);
  };

  const resetCycle = () => {
    setSteps(LIFECYCLE_STEPS);
    setActiveStepId(5);
    setSelectedStepId(5);
    setCycleStatus("RUNNING");
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Top Header & Tactical Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          gap: 16,
          flexWrap: "wrap"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Zap size={18} color="var(--primary)" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
              Ransomware Resilience Autopilot Hub
            </h1>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(16, 185, 129, 0.2)",
                color: "var(--primary)",
                border: "1px solid var(--primary)",
                letterSpacing: "0.06em",
                textTransform: "uppercase"
              }}
            >
              Central 12-Step Coordinator
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 750 }}>
            Unified autonomous coordinator managing the entire end-to-end ransomware defense lifecycle: from pre-incident baseline and early detection to blast radius prediction, kill-chain interruption, backup lockdown, and cleanroom recovery.
          </p>
        </div>

        {/* Master Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Active Case Selector */}
          <select
            value={selectedCase.id}
            onChange={(e) => {
              const found = MOCK_CASES.find((c) => c.id === e.target.value);
              if (found) setSelectedCase(found);
            }}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              padding: "7px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600
            }}
          >
            {MOCK_CASES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.organization} ({c.ransomwareFamily})
              </option>
            ))}
          </select>

          <button
            onClick={triggerMasterEmergencyCycle}
            className="btn-primary"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#02150e",
              fontWeight: 800,
              padding: "8px 16px",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.35)"
            }}
          >
            <Zap size={14} />
            Engage Full Autopilot Cycle
          </button>

          <button onClick={resetCycle} className="btn-secondary" title="Reset Cycle State">
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Top Banner: Active Incident & DEFCON Status */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(244, 63, 94, 0.12) 0%, rgba(14, 21, 38, 0.95) 50%, rgba(16, 185, 129, 0.1) 100%)",
          border: "1px solid rgba(244, 63, 94, 0.35)",
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(244, 63, 94, 0.2)",
              border: "2px solid var(--rose)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 2s infinite"
            }}
          >
            <ShieldAlert size={22} color="var(--rose)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                ACTIVE THREAT IN PROGRESS: {selectedCase.caseNumber} — {selectedCase.organization}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: "var(--rose)",
                  color: "#fff"
                }}
              >
                CRITICAL
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Threat Actor: <strong style={{ color: "var(--fg-2)" }}>{selectedCase.threatActor}</strong> • Variant:{" "}
              <strong style={{ color: "var(--amber)" }}>{selectedCase.ransomwareFamily}</strong> • Target Scope:{" "}
              <strong style={{ color: "var(--cyan)" }}>{selectedCase.affectedHosts} Hosts / {selectedCase.totalDataSizeGB} GB</strong>
            </div>
          </div>
        </div>

        {/* Live DEFCON & Autopilot Mode Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Mode Selector Tabs */}
          <div
            style={{
              background: "var(--surface-2)",
              padding: 3,
              borderRadius: 8,
              border: "1px solid var(--border)",
              display: "flex",
              gap: 2
            }}
          >
            {[
              { id: "ADVISORY", label: "Mode 1: Advisory", color: "var(--cyan)" },
              { id: "ASSISTED", label: "Mode 2: Assisted", color: "var(--primary)" },
              { id: "AUTONOMOUS", label: "Mode 3: Autonomous", color: "var(--amber)" }
            ].map((m) => {
              const active = automationMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setAutomationMode(m.id as any)}
                  style={{
                    background: active ? m.color : "transparent",
                    color: active ? "#04100c" : "var(--muted)",
                    fontWeight: active ? 800 : 500,
                    fontSize: 11,
                    padding: "5px 10px",
                    borderRadius: 5,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* DEFCON Badge */}
          <div
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid var(--rose)",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 800, color: "var(--rose)", textTransform: "uppercase" }}>Defense Level</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>DEFCON 2 — ACTIVE SURGE</div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Ribbon */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 24
        }}
      >
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>AUTOPILOT READINESS</span>
            <Sparkles size={14} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--primary)" }}>99.8%</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Sub-systems synchronized</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>CURRENT ACTIVE STAGE</span>
            <Flame size={14} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--rose)" }}>Step 5: Kill Chain Sever</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Zero-hesitation isolation</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>MEAN RESPONSE TIME</span>
            <Zap size={14} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--amber)" }}>340 ms</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Pre-encryption containment</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>RTO TARGET vs PROJECTED</span>
            <Clock size={14} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--cyan)" }}>3.2 hrs <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>/ 4.5h SLA</span></div>
          <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 2 }}>+1.3 hrs ahead of target</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>BACKUP IMMUTABILITY</span>
            <Lock size={14} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--primary)" }}>100% WORM</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>S3 Object Lock & ZFS verified</div>
        </div>
      </div>

      {/* Main Layout: 12-Step Lifecycle Grid & Visualizer (Left) + Inspector & Telemetry (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: 20 }}>
        {/* Left Column: 12-Step Lifecycle Coordinator */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                  12-Step Autonomous Lifecycle Loop
                </h3>
                <p style={{ fontSize: 11.5, color: "var(--muted)" }}>
                  Click any step to inspect real-time sub-system diagnostics, telemetry inputs, output artifacts, and direct tool links.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={advanceStep}
                  disabled={activeStepId >= 12}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: "5px 10px" }}
                >
                  <Play size={12} />
                  Simulate Next Step
                </button>
              </div>
            </div>

            {/* 12-Step Grid Layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 10
              }}
            >
              {steps.map((step) => {
                const isSelected = selectedStepId === step.id;
                const isActive = activeStepId === step.id;
                const isCompleted = step.status === "COMPLETED";
                const isCritical = step.status === "CRITICAL_ENGAGED" || (isActive && step.id === 5);

                let borderColor = "var(--border)";
                let statusBg = "rgba(255,255,255,0.05)";
                let statusColor = "var(--muted)";

                if (isCritical) {
                  borderColor = "var(--rose)";
                  statusBg = "rgba(244, 63, 94, 0.2)";
                  statusColor = "var(--rose)";
                } else if (isActive) {
                  borderColor = "var(--amber)";
                  statusBg = "rgba(245, 158, 11, 0.2)";
                  statusColor = "var(--amber)";
                } else if (isCompleted) {
                  borderColor = "rgba(16, 185, 129, 0.4)";
                  statusBg = "rgba(16, 185, 129, 0.15)";
                  statusColor = "var(--primary)";
                }

                if (isSelected) {
                  borderColor = "#3b82f6";
                }

                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStepId(step.id)}
                    style={{
                      background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      padding: "12px 14px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      position: "relative",
                      boxShadow: isSelected ? "0 0 14px rgba(59, 130, 246, 0.3)" : "none"
                    }}
                  >
                    {/* Header: Step Number & Status Badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: isCompleted ? "var(--primary)" : isCritical ? "var(--rose)" : isActive ? "var(--amber)" : "var(--surface)",
                            color: isCompleted || isCritical || isActive ? "#000" : "var(--muted)",
                            fontSize: 10,
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {step.id}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)" }}>{step.shortName}</span>
                      </div>

                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: statusBg,
                          color: statusColor,
                          textTransform: "uppercase",
                          fontFamily: "monospace"
                        }}
                      >
                        {step.status}
                      </span>
                    </div>

                    {/* Tagline */}
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, lineHeight: 1.3 }}>
                      {step.tagline}
                    </div>

                    {/* Footer: Confidence & Sub-systems */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 10,
                        borderTop: "1px solid var(--border-subtle)",
                        paddingTop: 6,
                        color: "var(--fg-2)"
                      }}
                    >
                      <span>Confidence: <strong style={{ color: "var(--primary)" }}>{step.confidencePct}%</strong></span>
                      <span style={{ color: "var(--cyan)", fontFamily: "monospace" }}>{step.durationEst}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Sub-Engine Launchpad */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
              🚀 Dedicated Flagship Defense & Recovery Modules
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {[
                { label: "Blast Radius Predictor", href: "/blast-radius", desc: "1.8 TB / 24 Hosts Propagation DAG", icon: Network, color: "var(--rose)" },
                { label: "Attack Progression Model", href: "/attack-progression", desc: "8-Stage Real-Time Tracker (Stage 6)", icon: Flame, color: "var(--amber)" },
                { label: "Kill-Chain Interrupter", href: "/killchain-interrupter", desc: "Sub-Second Zero-Hesitation Sever", icon: Zap, color: "var(--primary)" },
                { label: "Backup Emergency Lockdown", href: "/backup-lockdown", desc: "Immutable WORM & Quorum Freeze", icon: Lock, color: "var(--cyan)" },
                { label: "Point of No Return (PONR)", href: "/point-of-no-return", desc: "Window of Opportunity (38 min)", icon: Clock, color: "var(--purple)" },
                { label: "Emergency Playbooks", href: "/emergency-playbooks", desc: "Configurable IF/THEN Auto Engine", icon: Cpu, color: "var(--primary)" }
              ].map((m, idx) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={idx}
                    href={m.href}
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "10px 12px",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={14} color={m.color} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{m.label}</span>
                    </div>
                    <span style={{ fontSize: 10.5, color: "var(--muted)" }}>{m.desc}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Step Inspector & Live Telemetry Execution Stream */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Step Inspector Card */}
          <div className="card-tactical" style={{ padding: 18, border: "1px solid rgba(59, 130, 246, 0.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: "rgba(59, 130, 246, 0.2)",
                    color: "#60a5fa",
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: "monospace"
                  }}
                >
                  STEP {selectedStep.id} OF 12
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                  {selectedStep.shortName} Inspector
                </span>
              </div>

              <Link
                href={selectedStep.linkHref}
                className="btn-primary"
                style={{ fontSize: 11, padding: "4px 10px", background: "var(--primary)" }}
              >
                Open Studio Page <ArrowRight size={12} />
              </Link>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-2)", marginBottom: 12 }}>
              {selectedStep.name}
            </div>

            {/* Diagnostic Details Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                  ⚡ Key Autonomous Action
                </div>
                <div style={{ color: "var(--fg)", fontWeight: 600 }}>{selectedStep.keyAction}</div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                  📡 Live Telemetry Ingestion
                </div>
                <div style={{ color: "var(--cyan)", fontFamily: "monospace", fontSize: 11 }}>{selectedStep.telemetryInput}</div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                  📦 Certified Output Artifact
                </div>
                <div style={{ color: "var(--primary)", fontWeight: 600 }}>{selectedStep.outputArtifact}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Sub-systems:</span>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-2)", marginTop: 2 }}>
                    {selectedStep.systemsInvolved.join(", ")}
                  </div>
                </div>
                <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Confidence Score:</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>
                    {selectedStep.confidencePct}% ML Consensus
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Telemetry Execution Stream */}
          <div className="card-tactical" style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Terminal size={14} color="var(--cyan)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
                  Autopilot Telemetry & Action Stream
                </span>
              </div>
              <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                Auto-sync active (sub-second)
              </span>
            </div>

            <div
              style={{
                background: "#030712",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px 12px",
                fontFamily: "monospace",
                fontSize: 11,
                lineHeight: 1.5,
                maxHeight: "340px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}
            >
              {executionLogs.map((log) => {
                let badgeColor = "var(--cyan)";
                let badgeBg = "rgba(6, 182, 212, 0.15)";
                if (log.level === "CRITICAL") {
                  badgeColor = "var(--rose)";
                  badgeBg = "rgba(244, 63, 94, 0.2)";
                } else if (log.level === "ACTION") {
                  badgeColor = "var(--amber)";
                  badgeBg = "rgba(245, 158, 11, 0.2)";
                } else if (log.level === "SUCCESS") {
                  badgeColor = "var(--primary)";
                  badgeBg = "rgba(16, 185, 129, 0.2)";
                }

                return (
                  <div key={log.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--muted)", flexShrink: 0 }}>[{log.timestamp}]</span>
                    <span
                      style={{
                        padding: "1px 5px",
                        borderRadius: 3,
                        background: badgeBg,
                        color: badgeColor,
                        fontSize: 9.5,
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {log.level}
                    </span>
                    <span style={{ color: "var(--fg-2)", wordBreak: "break-word" }}>{log.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
