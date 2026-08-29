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
  ArrowRight,
  TrendingUp,
  Crosshair,
  UserX,
  Network
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { RansomwareCase } from "@/types/recovery";

interface InterruptionAction {
  id: string;
  name: string;
  targetScope: string;
  attackStageSevered: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  mlConfidencePct: number;
  blastRadiusReductionPct: number;
  latencyMs: number;
  status: "ARMED_READY" | "EXECUTING" | "ENGAGED_ACTIVE" | "VERIFIED" | "ROLLED_BACK";
  commandSnippet: string;
  safetyRollbackTimeSeconds: number;
  lastExecutedTimestamp?: string;
}

const INITIAL_ACTIONS: InterruptionAction[] = [
  {
    id: "act-001",
    name: "Disable Compromised Account (svc_backup_mgmt & da_administrator)",
    targetScope: "Active Directory Identity Tier-0 (mercy.local)",
    attackStageSevered: "Stage 4: Privilege Escalation & Stage 5: Lateral Movement",
    severity: "CRITICAL",
    mlConfidencePct: 99.2,
    blastRadiusReductionPct: 78,
    latencyMs: 120,
    status: "ARMED_READY",
    commandSnippet: "Disable-ADAccount -Identity 'svc_backup_mgmt'; Revoke-AzureADUserAllRefreshToken -UserId 'da_admin@mercy.org'",
    safetyRollbackTimeSeconds: 15
  },
  {
    id: "act-002",
    name: "Isolate Affected Host (DC01.mercy.local & WS-CLINIC-409)",
    targetScope: "10.14.2.10 (DC01), 10.14.8.44 (WS-409)",
    attackStageSevered: "Stage 5: Lateral Movement & Stage 6: Defense Evasion",
    severity: "CRITICAL",
    mlConfidencePct: 98.7,
    blastRadiusReductionPct: 84,
    latencyMs: 240,
    status: "ARMED_READY",
    commandSnippet: "Invoke-EDRHostIsolation -HostName 'DC01.mercy.local' -AllowForensicsTunnel -VlanQuarantine 999",
    safetyRollbackTimeSeconds: 30
  },
  {
    id: "act-003",
    name: "Block Attacker C2 Infrastructure (c2-healthcheck.dynamic-dns.net)",
    targetScope: "Border BGP Routers & Core DNS Sinkhole",
    attackStageSevered: "Stage 1: Initial Access & Stage 6: Command & Control",
    severity: "HIGH",
    mlConfidencePct: 96.5,
    blastRadiusReductionPct: 62,
    latencyMs: 180,
    status: "ARMED_READY",
    commandSnippet: "Add-DnsServerResourceRecordSinkhole -Domain 'c2-healthcheck.dynamic-dns.net' -TargetIp '127.0.0.1'",
    safetyRollbackTimeSeconds: 10
  },
  {
    id: "act-004",
    name: "Restrict Administrative Protocols (Block SMB 445 / RDP 3389 / WinRM)",
    targetScope: "Core Inter-VLAN Subnets (VLAN 10, 20, 30, 40)",
    attackStageSevered: "Stage 5: Lateral Movement & Stage 8: Mass Encryption",
    severity: "CRITICAL",
    mlConfidencePct: 99.8,
    blastRadiusReductionPct: 92,
    latencyMs: 310,
    status: "ARMED_READY",
    commandSnippet: "New-NetFirewallRule -Name 'EMERGENCY_KILL_SMB_RDP' -Direction Inbound -Protocol TCP -LocalPort 445,3389,5985 -Action Block",
    safetyRollbackTimeSeconds: 20
  },
  {
    id: "act-005",
    name: "Lockdown Backup Repositories (AWS S3 Object Lock & ZFS Snapshot Freeze)",
    targetScope: "AWS S3 Vault (mercy-immutable) & TrueNAS ZFS SAN",
    attackStageSevered: "Stage 7: Backup Destruction",
    severity: "CRITICAL",
    mlConfidencePct: 100.0,
    blastRadiusReductionPct: 99,
    latencyMs: 95,
    status: "ARMED_READY",
    commandSnippet: "aws s3api put-object-legal-hold --bucket mercy-immutable-vault --legal-hold Status=ON --recursive",
    safetyRollbackTimeSeconds: 60
  }
];

export default function KillchainInterrupterPage() {
  const [selectedCase, setSelectedCase] = useState<RansomwareCase>(MOCK_CASES[0]);
  const [actions, setActions] = useState<InterruptionAction[]>(INITIAL_ACTIONS);
  const [selectedActionId, setSelectedActionId] = useState<string>("act-001");
  const [isExecutingAll, setIsExecutingAll] = useState<boolean>(false);
  const [cliOutput, setCliOutput] = useState<string[]>([
    "Aegis Kill-Chain Interruption Engine v2.4 initialized.",
    "Connecting to Active Directory, EDR API, Core BGP Routers, and S3 Storage...",
    "Ready for sub-second zero-hesitation execution."
  ]);

  const selectedAction = actions.find((a) => a.id === selectedActionId) || actions[0];

  const executeAction = (actionId: string) => {
    const timeStr = new Date().toTimeString().split(" ")[0];
    setActions((prev) =>
      prev.map((act) => {
        if (act.id === actionId) {
          return {
            ...act,
            status: "ENGAGED_ACTIVE",
            lastExecutedTimestamp: timeStr
          };
        }
        return act;
      })
    );

    const actObj = actions.find((a) => a.id === actionId);
    setCliOutput((prev) => [
      `[${timeStr}] ⚡ EXECUTED: ${actObj?.name} (Latency: ${actObj?.latencyMs}ms)`,
      `> ${actObj?.commandSnippet}`,
      `> Status: ENGAGED_ACTIVE | Blast Radius Reduced by ${actObj?.blastRadiusReductionPct}%`,
      ...prev
    ]);
  };

  const rollbackAction = (actionId: string) => {
    const timeStr = new Date().toTimeString().split(" ")[0];
    setActions((prev) =>
      prev.map((act) => {
        if (act.id === actionId) {
          return {
            ...act,
            status: "ROLLED_BACK",
            lastExecutedTimestamp: timeStr
          };
        }
        return act;
      })
    );

    const actObj = actions.find((a) => a.id === actionId);
    setCliOutput((prev) => [
      `[${timeStr}] 🔄 ROLLBACK: Restored baseline configuration for ${actObj?.name}`,
      ...prev
    ]);
  };

  const executeAllCutoffs = () => {
    setIsExecutingAll(true);
    const timeStr = new Date().toTimeString().split(" ")[0];

    setActions((prev) =>
      prev.map((act) => ({
        ...act,
        status: "ENGAGED_ACTIVE",
        lastExecutedTimestamp: timeStr
      }))
    );

    setCliOutput((prev) => [
      `[${timeStr}] 🚨 MASTER EMERGENCY CUTOFF TRIGGERED! Executing all 5 high-impact kill-chain sever directives in sub-second sequence...`,
      `[${timeStr}] ✅ svc_backup_mgmt revoked in Active Directory (120ms)`,
      `[${timeStr}] ✅ DC01.mercy.local and WS-CLINIC-409 microsegmented (240ms)`,
      `[${timeStr}] ✅ C2 domain c2-healthcheck.dynamic-dns.net sinkholed (180ms)`,
      `[${timeStr}] ✅ Ports 445/3389 blocked across all Core VLANs (310ms)`,
      `[${timeStr}] ✅ AWS S3 Object Lock & ZFS snapshots frozen (95ms)`,
      `[${timeStr}] 🛡️ TOTAL LATERAL PROPAGATION REDUCTION: 96.4% ACHIEVED.`,
      ...prev
    ]);
  };

  const resetAllActions = () => {
    setActions(INITIAL_ACTIONS);
    setCliOutput(["Aegis Kill-Chain Interruption Engine reset to standby."]);
  };

  const activeCount = actions.filter((a) => a.status === "ENGAGED_ACTIVE").length;

  return (
    <div style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Top Header */}
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
              Ransomware Kill-Chain Interruption Engine
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
              Zero-Hesitation Sever Action Executor
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 750 }}>
            Calculates and dispatches surgical, sub-second interruption actions directly across identity stores, network perimeters, hypervisors, and storage repositories to halt ransomware propagation instantly.
          </p>
        </div>

        {/* Master Emergency Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={executeAllCutoffs}
            className="btn-primary"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#02150e",
              fontWeight: 800,
              padding: "9px 18px",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)"
            }}
          >
            <Zap size={15} />
            Execute All Interruptions (Master Emergency Cutoff)
          </button>

          <button onClick={resetAllActions} className="btn-secondary">
            <RotateCcw size={14} />
            Reset State
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 20
        }}
      >
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>CUMULATIVE BLAST REDUCTION</span>
            <TrendingUp size={14} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}>96.4%</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Calculated propagation risk severed</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>ACTIVE INTERVENTIONS</span>
            <Activity size={14} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--amber)" }}>
            {activeCount} <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>/ {actions.length} Directives</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Sub-second execution status</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>MEAN SEVER LATENCY</span>
            <Clock size={14} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--cyan)" }}>189 ms</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Sub-second API dispatch</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>ROLLBACK SAFETY SCORE</span>
            <ShieldCheck size={14} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--purple)" }}>100%</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Fully reversible actions</div>
        </div>
      </div>

      {/* Main Layout: Action Cards List (Left) + Terminal CLI & Action Inspector (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: 20 }}>
        {/* Left: Interruption Actions List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card-tactical" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
              ⚡ High-Impact Interruption Actions
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {actions.map((act) => {
                const isSelected = selectedActionId === act.id;
                const isEngaged = act.status === "ENGAGED_ACTIVE";
                const isRolledBack = act.status === "ROLLED_BACK";

                let borderCol = "var(--border)";
                let badgeColor = "var(--muted)";
                let badgeBg = "rgba(255,255,255,0.05)";

                if (isEngaged) {
                  borderCol = "rgba(16, 185, 129, 0.4)";
                  badgeColor = "var(--primary)";
                  badgeBg = "rgba(16, 185, 129, 0.2)";
                } else if (isRolledBack) {
                  borderCol = "var(--amber)";
                  badgeColor = "var(--amber)";
                  badgeBg = "rgba(245, 158, 11, 0.2)";
                }

                if (isSelected) {
                  borderCol = "#3b82f6";
                }

                return (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActionId(act.id)}
                    style={{
                      background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                      border: `1px solid ${borderCol}`,
                      borderRadius: 8,
                      padding: "14px 16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 14,
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "rgba(244, 63, 94, 0.2)",
                            color: "var(--rose)"
                          }}
                        >
                          {act.severity}
                        </span>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--fg)" }}>{act.name}</span>
                      </div>

                      <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>
                        Target: <strong style={{ color: "var(--fg-2)" }}>{act.targetScope}</strong>
                      </div>

                      <div style={{ fontSize: 11, color: "var(--cyan)", fontFamily: "monospace" }}>
                        Severing: {act.attackStageSevered}
                      </div>

                      <div style={{ display: "flex", gap: 14, fontSize: 10.5, color: "var(--muted)", marginTop: 6 }}>
                        <span>Confidence: <strong style={{ color: "var(--primary)" }}>{act.mlConfidencePct}%</strong></span>
                        <span>Blast Reduction: <strong style={{ color: "var(--primary)" }}>-{act.blastRadiusReductionPct}%</strong></span>
                        <span>Latency: <strong style={{ color: "var(--cyan)" }}>{act.latencyMs}ms</strong></span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: badgeBg,
                          color: badgeColor,
                          textTransform: "uppercase",
                          fontFamily: "monospace"
                        }}
                      >
                        {act.status.replace("_", " ")}
                      </span>

                      <div style={{ display: "flex", gap: 6 }}>
                        {!isEngaged ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              executeAction(act.id);
                            }}
                            className="btn-primary"
                            style={{ fontSize: 11, padding: "5px 10px", background: "var(--primary)" }}
                          >
                            <Zap size={12} />
                            Execute
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rollbackAction(act.id);
                            }}
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: "5px 10px", color: "var(--amber)" }}
                          >
                            <RotateCcw size={12} />
                            Rollback
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kill-Chain Sever Matrix */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 10 }}>
              🛡️ Kill-Chain Severance Matrix
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 11 }}>
              {[
                { phase: "Initial Access", severedBy: "Block C2 DNS", active: true },
                { phase: "Privilege Escalation", severedBy: "Disable svc_backup_mgmt", active: true },
                { phase: "Lateral Movement", severedBy: "Block SMB 445 / RDP", active: true },
                { phase: "Backup Destruction", severedBy: "S3 Object Lock Freeze", active: true }
              ].map((m, idx) => (
                <div key={idx} style={{ background: "var(--surface-2)", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ color: "var(--muted)", fontSize: 10, textTransform: "uppercase" }}>{m.phase}</div>
                  <div style={{ color: "var(--primary)", fontWeight: 700, marginTop: 2 }}>{m.severedBy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Action Inspector & Terminal Command Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Action Inspector Card */}
          <div className="card-tactical" style={{ padding: 18, border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(16, 185, 129, 0.2)", color: "var(--primary)" }}>
                INTERRUPTER DIRECTIVE
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>ID: {selectedAction.id}</span>
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 8 }}>
              {selectedAction.name}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 800 }}>
                  PowerShell / API Command Payload
                </span>
                <div style={{ color: "var(--cyan)", fontFamily: "monospace", fontSize: 11, marginTop: 4, wordBreak: "break-all" }}>
                  {selectedAction.commandSnippet}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Execution Latency:</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--cyan)", marginTop: 2 }}>
                    {selectedAction.latencyMs} ms
                  </div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Blast Reduction:</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>
                    -{selectedAction.blastRadiusReductionPct}% Risk
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal CLI Execution Stream */}
          <div className="card-tactical" style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={14} color="var(--primary)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>Interruption Execution Log</span>
              </div>
              <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>Sub-second socket</span>
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
                maxHeight: "280px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 4
              }}
            >
              {cliOutput.map((line, idx) => (
                <div key={idx} style={{ color: line.includes("🚨") || line.includes("⚡") ? "var(--primary)" : line.includes("🔄") ? "var(--amber)" : "var(--fg-2)" }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
