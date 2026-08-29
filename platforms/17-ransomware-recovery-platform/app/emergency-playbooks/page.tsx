"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Zap,
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
  Check,
  X,
  Plus,
  ArrowRight,
  TrendingUp,
  Filter,
  FileCode,
  Sparkles
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { RansomwareCase } from "@/types/recovery";

interface PlaybookRule {
  id: string;
  name: string;
  enabled: boolean;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  executionMode: "AUTONOMOUS_IMMEDIATE" | "SEMI_AUTONOMOUS" | "MANUAL_APPROVAL";
  conditionText: string;
  conditions: {
    field: string;
    operator: string;
    value: string;
  }[];
  actions: string[];
  executionCount: number;
  avgExecutionTimeMs: number;
  lastTriggered?: string;
  falsePositiveGuard: string;
}

const INITIAL_PLAYBOOKS: PlaybookRule[] = [
  {
    id: "pb-001",
    name: "Zero-Hesitation Blast Containment on Canary Tripwire & Backup Tampering",
    enabled: true,
    severity: "CRITICAL",
    executionMode: "AUTONOMOUS_IMMEDIATE",
    conditionText: "IF Ransomware Confidence > 95% AND Canary Triggered = TRUE AND Backup Tampering = TRUE THEN Isolate Host + Protect Backups + Create Incident + Require Commander Approval",
    conditions: [
      { field: "Ransomware ML Confidence", operator: ">", value: "95%" },
      { field: "Canary Tripwire Touched", operator: "==", value: "TRUE" },
      { field: "Backup Tamper / Shadow Purge", operator: "==", value: "TRUE" }
    ],
    actions: [
      "Isolate Affected Host (EDR VLAN Quarantine)",
      "Enforce S3 Object Lock & ZFS Snapshot Freeze",
      "Generate Priority P1 Incident in Command Center",
      "Dispatch High-Priority Dual-Custody Approval Prompt"
    ],
    executionCount: 18,
    avgExecutionTimeMs: 140,
    lastTriggered: "2026-08-24T00:32:15Z",
    falsePositiveGuard: "Requires multi-vector heuristic consensus across >= 3 sensors"
  },
  {
    id: "pb-002",
    name: "Immediate Lateral SMB Sever on Mass Shadow Copy Deletion",
    enabled: true,
    severity: "CRITICAL",
    executionMode: "AUTONOMOUS_IMMEDIATE",
    conditionText: "IF VSS Shadow Deletion Detected AND EDR Blinding Attempt = TRUE THEN Sever SMB Ports 445/139 + Isolate Host Subnet + Snapshot VM Disk",
    conditions: [
      { field: "VSS Delete Shadows Call", operator: "==", value: "DETECTED" },
      { field: "EDR BYOVD Driver Blinding", operator: "==", value: "TRUE" }
    ],
    actions: [
      "Block SMB 445 / RDP 3389 across Host Subnet",
      "Isolate Stager Host from Core Identity Subnet",
      "Capture Live Memory Crashdump and VM Disk Snapshot"
    ],
    executionCount: 9,
    avgExecutionTimeMs: 210,
    lastTriggered: "2026-08-24T00:15:00Z",
    falsePositiveGuard: "Bypasses whitelisted hypervisor backup agents"
  },
  {
    id: "pb-003",
    name: "Automated Egress Throttle on High-Volume Exfiltration Burst",
    enabled: true,
    severity: "HIGH",
    executionMode: "SEMI_AUTONOMOUS",
    conditionText: "IF Mass Outbound Data Exfiltration > 20GB/5min TO Untrusted ASN THEN Throttle BGP Egress + Revoke Cloud Access Tokens + Notify Legal CISO",
    conditions: [
      { field: "Encrypted Outbound Egress Rate", operator: ">", value: "20 GB / 5 min" },
      { field: "Destination ASN Reputation", operator: "==", value: "UNTRUSTED / TOR" }
    ],
    actions: [
      "Sever BGP Egress Route to Rogue IP",
      "Revoke Microsoft 365 / Cloud API Tokens for Source Host",
      "Draft SEC Item 1.05 & HIPAA Data Exposure Assessment"
    ],
    executionCount: 4,
    avgExecutionTimeMs: 380,
    lastTriggered: "2026-08-23T22:10:00Z",
    falsePositiveGuard: "Azure & AWS Cloud CDN ranges automatically exempted"
  },
  {
    id: "pb-004",
    name: "Active Directory Identity Lockout on DCSync / Golden Ticket",
    enabled: true,
    severity: "CRITICAL",
    executionMode: "AUTONOMOUS_IMMEDIATE",
    conditionText: "IF DCSync or Golden Ticket Attack Detected ON Domain Controller THEN Trigger KRBTGT Double-Roll + Enforce SmartCard/FIDO2 + Lock Tier-0 Enclave",
    conditions: [
      { field: "Directory Replication RPC (MS-DRSR)", operator: "==", value: "UNAUTHORIZED_HOST" },
      { field: "Kerberos TGT Lifetime Anomaly", operator: "==", value: "TRUE" }
    ],
    actions: [
      "Execute Automated Active Directory KRBTGT Double-Roll",
      "Enforce FIDO2 Hardware-Token Verification across all Tier-0 Accounts",
      "Sever Non-Essential Inter-Domain Trusts"
    ],
    executionCount: 6,
    avgExecutionTimeMs: 195,
    lastTriggered: "2026-08-23T04:12:00Z",
    falsePositiveGuard: "Validates against secondary Domain Controller sync schedules"
  },
  {
    id: "pb-005",
    name: "Intermittent Encryption Cleanroom Spinup & Key Ingest",
    enabled: true,
    severity: "HIGH",
    executionMode: "SEMI_AUTONOMOUS",
    conditionText: "IF Intermittent Encryption Pattern Detected (.lockbit / .crypted) THEN Spin up Isolated Cleanroom VM + Dump In-Memory RSA Keys + Freeze Storage Pools",
    conditions: [
      { field: "Encryption Mode", operator: "==", value: "INTERMITTENT" },
      { field: "File Header Damage", operator: "<", value: "2048 BYTES" }
    ],
    actions: [
      "Spin up Air-Gapped Cleanroom Inspection Enclave",
      "Extract In-Memory RSA/ChaCha20 Private Key via Heap Carver",
      "Issue Storage Volume Snapshot Freeze"
    ],
    executionCount: 11,
    avgExecutionTimeMs: 450,
    lastTriggered: "2026-08-23T06:14:00Z",
    falsePositiveGuard: "Requires cryptographic entropy verification (>7.85)"
  }
];

export default function EmergencyPlaybooksPage() {
  const [selectedCase, setSelectedCase] = useState<RansomwareCase>(MOCK_CASES[0]);
  const [playbooks, setPlaybooks] = useState<PlaybookRule[]>(INITIAL_PLAYBOOKS);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("pb-001");
  const [isSimulatingRun, setIsSimulatingRun] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: "IDLE" | "SUCCESS" | "FAILED";
    timeTakenMs: number;
    executedActions: string[];
    logs: string[];
  }>({
    status: "IDLE",
    timeTakenMs: 0,
    executedActions: [],
    logs: []
  });

  const selectedPlaybook = playbooks.find((p) => p.id === selectedPlaybookId) || playbooks[0];

  const togglePlaybookEnable = (id: string) => {
    setPlaybooks((prev) =>
      prev.map((pb) => (pb.id === id ? { ...pb, enabled: !pb.enabled } : pb))
    );
  };

  const runSimulation = () => {
    setIsSimulatingRun(true);
    setSimulationResult({
      status: "IDLE",
      timeTakenMs: 0,
      executedActions: [],
      logs: ["Initializing dry-run simulation against active case telemetry..."]
    });

    setTimeout(() => {
      setIsSimulatingRun(false);
      setSimulationResult({
        status: "SUCCESS",
        timeTakenMs: selectedPlaybook.avgExecutionTimeMs,
        executedActions: selectedPlaybook.actions,
        logs: [
          `[00:00:00] Condition evaluated: ${selectedPlaybook.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(" AND ")} => MATCHED (TRUE)`,
          `[00:00:45] Dispatched Action 1: ${selectedPlaybook.actions[0]}`,
          `[00:01:10] Dispatched Action 2: ${selectedPlaybook.actions[1]}`,
          `[00:01:40] All actions verified in ${selectedPlaybook.avgExecutionTimeMs}ms. Blast radius reduced.`
        ]
      });
    }, 600);
  };

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
              <Cpu size={18} color="var(--primary)" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
              Pre-Approved Emergency Playbooks
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
              Autonomous IF/THEN Incident Response Logic
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 750 }}>
            Configurable, pre-authorized autonomous rules executed instantly when ransomware heuristics, canary tripwires, and backup tampering conditions match high-confidence thresholds.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={runSimulation} className="btn-primary" style={{ background: "var(--primary)" }}>
            <Play size={14} />
            Test Selected Playbook (Dry-Run)
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
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>ACTIVE PLAYBOOKS</span>
            <CheckCircle2 size={14} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}>
            {playbooks.filter((p) => p.enabled).length} <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>/ {playbooks.length} Armed</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Sub-second autonomous execution</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>MEAN RESPONSE TIME</span>
            <Clock size={14} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--cyan)" }}>195 ms</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Trigger-to-containment latency</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>INCIDENTS MITIGATED</span>
            <Zap size={14} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--amber)" }}>48 Executions</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Zero false-positive lockouts</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>SAFETY GUARD STATUS</span>
            <ShieldCheck size={14} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--purple)" }}>100% Active</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Multi-sensor consensus required</div>
        </div>
      </div>

      {/* Main Grid: Playbook Library (Left) + Rule Inspector & Dry-Run Simulator (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: 20 }}>
        {/* Left: Playbooks List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
              📜 Pre-Approved Playbook Directives
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {playbooks.map((pb) => {
                const isSelected = selectedPlaybookId === pb.id;
                return (
                  <div
                    key={pb.id}
                    onClick={() => setSelectedPlaybookId(pb.id)}
                    style={{
                      background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                      border: `1px solid ${isSelected ? "#3b82f6" : "var(--border)"}`,
                      borderRadius: 8,
                      padding: "14px 16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 14,
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "rgba(244, 63, 94, 0.2)",
                            color: "var(--rose)"
                          }}
                        >
                          {pb.severity}
                        </span>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--fg)" }}>{pb.name}</span>
                      </div>

                      <div
                        style={{
                          background: "var(--surface)",
                          padding: "8px 10px",
                          borderRadius: 6,
                          border: "1px solid var(--border-subtle)",
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: "var(--cyan)",
                          lineHeight: 1.4,
                          marginTop: 6,
                          marginBottom: 6
                        }}
                      >
                        {pb.conditionText}
                      </div>

                      <div style={{ display: "flex", gap: 12, fontSize: 10.5, color: "var(--muted)" }}>
                        <span>Mode: <strong style={{ color: "var(--primary)" }}>{pb.executionMode.replace("_", " ")}</strong></span>
                        <span>Avg Latency: <strong style={{ color: "var(--cyan)" }}>{pb.avgExecutionTimeMs}ms</strong></span>
                        <span>Executions: <strong style={{ color: "var(--amber)" }}>{pb.executionCount}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlaybookEnable(pb.id);
                        }}
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "4px 8px",
                          borderRadius: 4,
                          background: pb.enabled ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.05)",
                          color: pb.enabled ? "var(--primary)" : "var(--muted)",
                          border: `1px solid ${pb.enabled ? "var(--primary)" : "var(--border)"}`,
                          cursor: "pointer"
                        }}
                      >
                        {pb.enabled ? "ARMED ✓" : "DISABLED"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Playbook Inspector & Simulator */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Rule Inspector */}
          <div className="card-tactical" style={{ padding: 18, border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(16, 185, 129, 0.2)", color: "var(--primary)" }}>
                PLAYBOOK INSPECTOR
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{selectedPlaybook.id}</span>
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 10 }}>
              {selectedPlaybook.name}
            </div>

            {/* Conditions List */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                ⚡ IF Trigger Conditions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {selectedPlaybook.conditions.map((c, idx) => (
                  <div key={idx} style={{ background: "var(--surface-2)", padding: "6px 10px", borderRadius: 4, fontSize: 11, fontFamily: "monospace" }}>
                    <span style={{ color: "var(--fg-2)" }}>{c.field}</span>{" "}
                    <span style={{ color: "var(--amber)", fontWeight: 700 }}>{c.operator}</span>{" "}
                    <span style={{ color: "var(--primary)", fontWeight: 700 }}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions List */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                🚀 THEN Autonomous Actions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {selectedPlaybook.actions.map((act, idx) => (
                  <div key={idx} style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "6px 10px", borderRadius: 4, fontSize: 11, color: "var(--fg)" }}>
                    {idx + 1}. {act}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6, fontSize: 11, color: "var(--muted)" }}>
              <strong style={{ color: "var(--fg-2)" }}>False-Positive Guard:</strong> {selectedPlaybook.falsePositiveGuard}
            </div>
          </div>

          {/* Simulator Dry-Run Console */}
          <div className="card-tactical" style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={14} color="var(--cyan)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>Execution Simulator (Dry-Run)</span>
              </div>
              <button
                onClick={runSimulation}
                disabled={isSimulatingRun}
                className="btn-primary"
                style={{ fontSize: 10.5, padding: "3px 8px" }}
              >
                {isSimulatingRun ? "Evaluating..." : "Run Test"}
              </button>
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
                maxHeight: "220px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 4
              }}
            >
              {simulationResult.logs.length > 0 ? (
                simulationResult.logs.map((log, idx) => (
                  <div key={idx} style={{ color: log.includes("MATCHED") || log.includes("verified") ? "var(--primary)" : "var(--fg-2)" }}>
                    {log}
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--muted)" }}>Click 'Run Test' to evaluate playbook logic against real-time telemetry.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
