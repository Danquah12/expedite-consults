"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  Lock,
  Unlock,
  Terminal,
  Clock,
  Eye,
  Server,
  Layers,
  Check,
  X,
  Power,
  RefreshCw,
  Cpu,
  Activity,
  Filter
} from "lucide-react";
import {
  ContainmentAutomationMode,
  ContainmentPolicyRule,
  EmergencyLockdownControl,
  ContainmentAuditLogItem
} from "@/types/recovery";

const AUTOMATION_MODES: {
  id: ContainmentAutomationMode;
  number: number;
  name: string;
  badge: string;
  description: string;
  latencyExpectation: string;
  humanInTheLoop: string;
  color: string;
}[] = [
  {
    id: "MODE_1_ADVISORY",
    number: 1,
    name: "Mode 1: Advisory",
    badge: "Analyst-Driven",
    description: "System analyzes telemetry and generates containment recommendations. No actions are executed without full analyst manual invocation.",
    latencyExpectation: "2 - 15 minutes",
    humanInTheLoop: "100% Required",
    color: "var(--cyan)"
  },
  {
    id: "MODE_2_ASSISTED",
    number: 2,
    name: "Mode 2: Assisted",
    badge: "1-Click Approvals",
    description: "Policy engine pre-stages isolation scripts and firewall rules. Analyst clicks a single confirmation button to trigger immediate orchestrated containment.",
    latencyExpectation: "10 - 30 seconds",
    humanInTheLoop: "Single-Click Confirmation",
    color: "var(--primary)"
  },
  {
    id: "MODE_3_SEMI_AUTONOMOUS",
    number: 3,
    name: "Mode 3: Semi-Autonomous",
    badge: "High-Confidence Auto",
    description: "Endpoints with ML confidence > 90% and non-critical tier status are automatically isolated in sub-seconds. Core DCs and routers require confirmation.",
    latencyExpectation: "500ms - 2 seconds",
    humanInTheLoop: "Tier-0 Escalations Only",
    color: "var(--amber)"
  },
  {
    id: "MODE_4_HIGHLY_AUTONOMOUS",
    number: 4,
    name: "Mode 4: Highly Autonomous",
    badge: "Sub-Second Killswitch",
    description: "Sub-second zero-hesitation enterprise containment: Immediate BGP egress cutoff, S3 Object Lock compliance freeze, and KRBTGT Kerberos token invalidation.",
    latencyExpectation: "< 400 milliseconds",
    humanInTheLoop: "Post-Action Rollback Only",
    color: "var(--rose)"
  }
];

const INITIAL_POLICIES: ContainmentPolicyRule[] = [
  {
    id: "pol-001",
    name: "Zero-Second BGP Egress Sever on Mass C2 Exfiltration",
    enabled: true,
    triggerEvent: "High-volume encrypted outbound egress (>50GB/10min) to untrusted ASN",
    severityThreshold: "CRITICAL",
    mlConfidenceThreshold: 92,
    actions: ["BGP_EGRESS_CUTOFF", "REVOKE_ACTIVE_SESSIONS"],
    autoExecutionMode: "MODE_4_HIGHLY_AUTONOMOUS",
    falsePositiveGuard: "Whitelisted CDNs & Microsoft 365 ASN range bypassed",
    executionCount: 14,
    avgResponseTimeMs: 420
  },
  {
    id: "pol-002",
    name: "Immutable S3 & ZFS WORM Lockout on Pre-Encryption Stager",
    enabled: true,
    triggerEvent: "Pre-encryption ML model detects mass vssadmin or shadow copy purge",
    severityThreshold: "CRITICAL",
    mlConfidenceThreshold: 95,
    actions: ["S3_WORM_FREEZE", "SMB_PORT_BLOCK"],
    autoExecutionMode: "MODE_4_HIGHLY_AUTONOMOUS",
    falsePositiveGuard: "Requires ML feature consensus across >= 4 heuristic vectors",
    executionCount: 8,
    avgResponseTimeMs: 180
  },
  {
    id: "pol-003",
    name: "Kerberos KRBTGT Double-Roll & AD Session Invalidation",
    enabled: true,
    triggerEvent: "Mimikatz / DCSync credential dumping detected on Domain Controller",
    severityThreshold: "CRITICAL",
    mlConfidenceThreshold: 90,
    actions: ["AD_KRBTGT_DOUBLE_ROLL", "REVOKE_ACTIVE_SESSIONS"],
    autoExecutionMode: "MODE_3_SEMI_AUTONOMOUS",
    falsePositiveGuard: "Excludes scheduled identity directory synchronization jobs",
    executionCount: 5,
    avgResponseTimeMs: 1200
  },
  {
    id: "pol-004",
    name: "EDR Microsegmentation & Lateral SMB Port 445 Blackhole",
    enabled: true,
    triggerEvent: "High-speed port 445/135 sweep with PsExec or WMI lateral spawning",
    severityThreshold: "HIGH",
    mlConfidenceThreshold: 85,
    actions: ["EDR_HOST_ISOLATE", "SMB_PORT_BLOCK"],
    autoExecutionMode: "MODE_3_SEMI_AUTONOMOUS",
    falsePositiveGuard: "Permits approved SCCM / Tanium management IP addresses",
    executionCount: 29,
    avgResponseTimeMs: 650
  },
  {
    id: "pol-005",
    name: "Advisory Ransomware Note Generation Trap",
    enabled: true,
    triggerEvent: "Creation of known ransom note file (e.g. *.README.txt, *-DECRYPT.html)",
    severityThreshold: "MEDIUM",
    mlConfidenceThreshold: 75,
    actions: ["REVOKE_ACTIVE_SESSIONS"],
    autoExecutionMode: "MODE_1_ADVISORY",
    falsePositiveGuard: "NLP signature similarity matching threshold > 80%",
    executionCount: 42,
    avgResponseTimeMs: 3100
  }
];

const INITIAL_SWITCHES: EmergencyLockdownControl[] = [
  {
    id: "sw-bgp",
    name: "BGP Egress Global Cutoff",
    actionCode: "BGP_EGRESS_CUTOFF",
    description: "Immediately withdraws enterprise BGP autonomous system routes, severing all outbound WAN / Internet exfiltration pipes.",
    currentStatus: "ARMED_READY",
    targetScope: "Border Routers (BGP AS-64512 & AS-64513)",
    latencySeconds: 0.35,
    reversible: true,
    warningText: "Will immediately disconnect all remote VPN users and cloud sync tunnels."
  },
  {
    id: "sw-worm",
    name: "AWS S3 WORM Compliance Freeze",
    actionCode: "S3_WORM_FREEZE",
    description: "Locks all cloud backup repositories into immutable compliance mode, disallowing snapshot deletion or modification even with root credentials.",
    currentStatus: "ARMED_READY",
    targetScope: "All AWS S3, Azure Blob, and Wasabi Vaults",
    latencySeconds: 0.18,
    reversible: false,
    warningText: "Objects cannot be deleted by anyone until compliance retention period expires."
  },
  {
    id: "sw-ad",
    name: "Kerberos KRBTGT Double-Roll",
    actionCode: "AD_KRBTGT_DOUBLE_ROLL",
    description: "Forces immediate dual-cycle password rotation of the Active Directory KRBTGT service account, invalidating Golden & Silver Kerberos tickets across the forest.",
    currentStatus: "ARMED_READY",
    targetScope: "Entire Active Directory Domain Forest",
    latencySeconds: 1.2,
    reversible: false,
    warningText: "All active user and service Kerberos tickets will be invalidated."
  },
  {
    id: "sw-microseg",
    name: "Microsegmentation Host Quarantine",
    actionCode: "EDR_HOST_ISOLATE",
    description: "Broadcasts zero-trust isolation policies via CrowdStrike / SentinelOne / CarbonBlack EDR agents to freeze all inter-workstation communication.",
    currentStatus: "ARMED_READY",
    targetScope: "350 Managed Endpoints & Servers",
    latencySeconds: 0.65,
    reversible: true,
    warningText: "Restricts all host network interfaces to Aegis C2 telemetry channels only."
  }
];

const INITIAL_LOGS: ContainmentAuditLogItem[] = [
  {
    id: "log-101",
    timestamp: "2026-08-24T00:22:15Z",
    ruleTriggered: "Zero-Second BGP Egress Sever on Mass C2 Exfiltration",
    mode: "MODE_4_HIGHLY_AUTONOMOUS",
    targetHostOrVlan: "VLAN-104 (Clinical Workstations) -> ASN 4837",
    actionSummary: "BGP Egress withdrawn in 380ms. Terminated 14 open TCP connections to suspected Mega.nz exfil bucket.",
    executedBy: "Aegis Autonomous Containment Daemon",
    durationMs: 380,
    status: "SUCCESS"
  },
  {
    id: "log-102",
    timestamp: "2026-08-24T00:18:40Z",
    ruleTriggered: "EDR Microsegmentation & Lateral SMB Port 445 Blackhole",
    mode: "MODE_3_SEMI_AUTONOMOUS",
    targetHostOrVlan: "Host FIN-WS-09 (10.14.8.109)",
    actionSummary: "Host isolated from subnet. Inbound/Outbound SMB port 445 blocked instantly.",
    executedBy: "Policy Engine (Confidence 98.4%)",
    durationMs: 512,
    status: "SUCCESS"
  },
  {
    id: "log-103",
    timestamp: "2026-08-24T00:14:02Z",
    ruleTriggered: "Immutable S3 & ZFS WORM Lockout on Pre-Encryption Stager",
    mode: "MODE_4_HIGHLY_AUTONOMOUS",
    targetHostOrVlan: "Bucket: s3://aegis-immutable-vault-us-east-1",
    actionSummary: "Object Lock Compliance Mode enforced. S3 IAM credentials rotated and locked.",
    executedBy: "Aegis Autonomous Containment Daemon",
    durationMs: 145,
    status: "SUCCESS"
  }
];

export default function ContainmentPage() {
  const [currentMode, setCurrentMode] = useState<ContainmentAutomationMode>("MODE_3_SEMI_AUTONOMOUS");
  const [policies, setPolicies] = useState<ContainmentPolicyRule[]>(INITIAL_POLICIES);
  const [switches, setSwitches] = useState<EmergencyLockdownControl[]>(INITIAL_SWITCHES);
  const [logs, setLogs] = useState<ContainmentAuditLogItem[]>(INITIAL_LOGS);
  const [engagingSwitchId, setEngagingSwitchId] = useState<string | null>(null);
  const [testingTrigger, setTestingTrigger] = useState(false);

  const togglePolicyEnabled = (id: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const triggerEmergencySwitch = (switchItem: EmergencyLockdownControl) => {
    setEngagingSwitchId(switchItem.id);
    setTimeout(() => {
      setSwitches((prev) =>
        prev.map((s) =>
          s.id === switchItem.id
            ? { ...s, currentStatus: s.currentStatus === "ENGAGED_ACTIVE" ? "ARMED_READY" : "ENGAGED_ACTIVE" }
            : s
        )
      );
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ruleTriggered: `Manual Emergency Killswitch: ${switchItem.name}`,
          mode: currentMode,
          targetHostOrVlan: switchItem.targetScope,
          actionSummary: `Emergency killswitch ${switchItem.name} executed in ${switchItem.latencySeconds * 1000}ms.`,
          executedBy: "Lead Incident Commander",
          durationMs: Math.round(switchItem.latencySeconds * 1000),
          status: "SUCCESS"
        },
        ...prev
      ]);
      setEngagingSwitchId(null);
    }, 900);
  };

  const testTriggerSandbox = () => {
    setTestingTrigger(true);
    setTimeout(() => {
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ruleTriggered: "Simulated Lateral SMB Port 445 Sweep",
          mode: currentMode,
          targetHostOrVlan: "Sandbox Host TEST-WS-99 (10.14.99.12)",
          actionSummary: "Microsegmentation rule applied. Port 445 blackholed in 410ms.",
          executedBy: "Aegis Policy Sandbox Tester",
          durationMs: 410,
          status: "SUCCESS"
        },
        ...prev
      ]);
      setTestingTrigger(false);
    }, 1200);
  };

  const activeModeDetails = AUTOMATION_MODES.find((m) => m.id === currentMode) || AUTOMATION_MODES[2];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1440, margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(245,158,11,0.05) 50%, rgba(14,21,38,0.9) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "rgba(244,63,94,0.15)",
            border: "1px solid rgba(244,63,94,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Radio size={24} color="var(--rose)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
                Automated Containment & Policy Engine
              </h1>
              <span className="badge-sev badge-critical" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <ShieldAlert size={11} /> STAGE 3: CONTAIN
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              4 Operating Automation Modes: Advisory, Assisted, Semi-Autonomous, and Sub-Second Highly Autonomous Enterprise Lockdown.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn-secondary"
            onClick={testTriggerSandbox}
            disabled={testingTrigger}
            style={{ fontSize: 12 }}
          >
            <Play size={13} className={testingTrigger ? "animate-spin" : ""} />
            {testingTrigger ? "Simulating Trigger..." : "Test Policy Pipeline"}
          </button>
        </div>
      </div>

      {/* 4 Automation Operating Modes Switcher */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <Sliders size={15} color="var(--primary)" />
          <span>Automation Operating Mode Switcher</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {AUTOMATION_MODES.map((mode) => {
            const isSelected = currentMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setCurrentMode(mode.id)}
                style={{
                  padding: "16px 18px",
                  borderRadius: 8,
                  background: isSelected ? "rgba(30,44,77,0.9)" : "var(--surface)",
                  border: `2px solid ${isSelected ? mode.color : "var(--border)"}`,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  transition: "all 0.15s ease",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: isSelected ? mode.color : "var(--fg)" }}>
                    {mode.name}
                  </span>
                  <span style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: isSelected ? "rgba(255,255,255,0.1)" : "var(--surface-2)",
                    color: isSelected ? mode.color : "var(--muted)",
                    border: "1px solid var(--border)"
                  }}>
                    {mode.badge}
                  </span>
                </div>

                <p style={{ fontSize: 11, color: "var(--fg-2)", lineHeight: 1.5 }}>
                  {mode.description}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
                  <span>Latency: <strong style={{ color: "var(--fg)" }}>{mode.latencyExpectation}</strong></span>
                  <span>Human: <strong style={{ color: "var(--fg)" }}>{mode.humanInTheLoop}</strong></span>
                </div>

                {isSelected && (
                  <div style={{
                    marginTop: 6,
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: "rgba(16,185,129,0.15)",
                    color: "#10b981",
                    fontSize: 10.5,
                    fontWeight: 700,
                    textAlign: "center"
                  }}>
                    ● ACTIVE SYSTEM OPERATING MODE
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Lockdown Killswitches Panel */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Power size={18} color="var(--rose)" />
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
              Emergency Sub-Second Lockdown Kill Switches
            </span>
          </div>
          <span className="badge-sev badge-critical">
            Dual-Auth Ready & Logged
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {switches.map((sw) => {
            const isEngaged = sw.currentStatus === "ENGAGED_ACTIVE";
            const isProcessing = engagingSwitchId === sw.id;

            return (
              <div
                key={sw.id}
                style={{
                  padding: "16px 18px",
                  borderRadius: 8,
                  background: isEngaged ? "rgba(244,63,94,0.12)" : "var(--surface-2)",
                  border: `1px solid ${isEngaged ? "var(--rose)" : "var(--border)"}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                    {sw.name}
                  </span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: isEngaged ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.15)",
                    color: isEngaged ? "#f43f5e" : "#10b981",
                    border: `1px solid ${isEngaged ? "rgba(244,63,94,0.4)" : "rgba(16,185,129,0.3)"}`
                  }}>
                    {isEngaged ? "🔥 ENGAGED" : "ARMED"}
                  </span>
                </div>

                <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>
                  {sw.description}
                </p>

                <div style={{ fontSize: 10.5, color: "var(--rose)", background: "rgba(244,63,94,0.05)", padding: 6, borderRadius: 4 }}>
                  ⚠️ {sw.warningText}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10.5, color: "var(--muted)" }}>
                  <span>Scope: {sw.targetScope}</span>
                  <span>Latency: <strong style={{ color: "var(--cyan)" }}>{sw.latencySeconds}s</strong></span>
                </div>

                <button
                  onClick={() => triggerEmergencySwitch(sw)}
                  disabled={isProcessing}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    border: "none",
                    background: isEngaged ? "var(--surface-3)" : "var(--rose)",
                    color: isEngaged ? "var(--fg)" : "#fff",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Executing Action...
                    </>
                  ) : isEngaged ? (
                    "DISENGAGE / ROLLBACK"
                  ) : (
                    "TRIGGER IMMEDIATE LOCKDOWN"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Policy Rules Table & Live Execution Log */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
        {/* Policy Rules Engine */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={16} color="var(--amber)" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>Configured Containment Policy Rules</span>
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{policies.filter((p) => p.enabled).length} of {policies.length} Active</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {policies.map((policy) => (
              <div
                key={policy.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: policy.enabled ? "var(--surface-2)" : "rgba(14,21,38,0.4)",
                  border: `1px solid ${policy.enabled ? "var(--border)" : "rgba(255,255,255,0.05)"}`,
                  opacity: policy.enabled ? 1 : 0.6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>
                      {policy.name}
                    </span>
                    <span className={`badge-sev ${policy.severityThreshold === "CRITICAL" ? "badge-critical" : "badge-high"}`}>
                      {policy.severityThreshold}
                    </span>
                  </div>
                  <button
                    onClick={() => togglePolicyEnabled(policy.id)}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "none",
                      background: policy.enabled ? "var(--primary)" : "var(--surface-3)",
                      color: policy.enabled ? "#04100c" : "var(--muted)"
                    }}
                  >
                    {policy.enabled ? "ENABLED" : "DISABLED"}
                  </button>
                </div>

                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  Trigger: <span style={{ color: "var(--fg-2)" }}>{policy.triggerEvent}</span>
                </div>

                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                  {policy.actions.map((act, i) => (
                    <span key={i} style={{
                      fontSize: 9.5,
                      fontFamily: "monospace",
                      background: "#040811",
                      padding: "2px 6px",
                      borderRadius: 4,
                      color: "var(--cyan)",
                      border: "1px solid var(--border)"
                    }}>
                      ⚡ {act}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
                  <span>Min ML Confidence: <strong style={{ color: "var(--fg)" }}>{policy.mlConfidenceThreshold}%</strong></span>
                  <span>Executions: <strong style={{ color: "var(--primary)" }}>{policy.executionCount}</strong></span>
                  <span>Avg Latency: <strong style={{ color: "var(--cyan)" }}>{policy.avgResponseTimeMs}ms</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Containment Audit Logs */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={16} color="var(--cyan)" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>Live Incident Containment Audit Stream</span>
            </div>
            <span className="badge-sev badge-success">IMMUTABLE LOG</span>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: 380,
            overflowY: "auto"
          }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10.5 }}>
                  <span style={{ color: "var(--muted)", fontFamily: "monospace" }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="badge-sev badge-success">
                    {log.durationMs}ms - {log.status}
                  </span>
                </div>

                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--fg)" }}>
                  {log.ruleTriggered}
                </div>

                <div style={{ fontSize: 11, color: "var(--fg-2)" }}>
                  {log.actionSummary}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                  <span>Target: {log.targetHostOrVlan}</span>
                  <span>By: {log.executedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
