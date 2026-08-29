"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Clock,
  AlertTriangle,
  Radio,
  Lock,
  Terminal,
  Server,
  Layers,
  CheckCircle2,
  XCircle,
  Crosshair,
  ArrowRight,
  TrendingUp,
  Cpu,
  Eye,
  Activity,
  Sliders
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { RansomwareCase } from "@/types/recovery";

interface AttackStage {
  stageNumber: number;
  name: string;
  shortTitle: string;
  description: string;
  mitreTechniques: string[];
  status: "COMPLETED" | "ACTIVE_IN_PROGRESS" | "PREDICTED_NEXT" | "PREVENTED_BLOCKED";
  confidencePct: number;
  detectedTimestamp: string;
  attackerDwellTime: string;
  evidenceSnippet: string;
  associatedProcess: string;
  targetScope: string;
}

const ATTACK_STAGES: AttackStage[] = [
  {
    stageNumber: 1,
    name: "Stage 1: Initial Access",
    shortTitle: "Initial Access",
    description: "Exploitation of perimeter VPN appliance (CVE-2024-3400) and spearphishing payload execution.",
    mitreTechniques: ["T1190 (Exploit Public-Facing App)", "T1566.001 (Spearphishing Attachment)"],
    status: "COMPLETED",
    confidencePct: 98.2,
    detectedTimestamp: "2026-08-23T02:14:22Z",
    attackerDwellTime: "T+00:00",
    evidenceSnippet: "Inbound POST request to /ssl-vpn/login.cgi with buffer overflow payload from 185.220.101.52",
    associatedProcess: "vpn_daemon.exe",
    targetScope: "Perimeter Gateway GW-EDGE-01"
  },
  {
    stageNumber: 2,
    name: "Stage 2: Discovery & Network Recon",
    shortTitle: "Discovery",
    description: "AdFind.exe and BloodHound queries to map Active Directory Domain trust topologies and user groups.",
    mitreTechniques: ["T1087.002 (Domain Account Discovery)", "T1018 (Remote System Discovery)"],
    status: "COMPLETED",
    confidencePct: 96.5,
    detectedTimestamp: "2026-08-23T03:02:10Z",
    attackerDwellTime: "T+00:48",
    evidenceSnippet: "AdFind.exe -f '(objectCategory=computer)' -csv name operatingSystem dNSHostName",
    associatedProcess: "adfind.exe (PID 6112)",
    targetScope: "Active Directory Domain Controller DC01"
  },
  {
    stageNumber: 3,
    name: "Stage 3: Credential Access",
    shortTitle: "Credential Access",
    description: "LSASS in-memory credential harvesting via Mimikatz and Kerberoasting against service accounts.",
    mitreTechniques: ["T1003.001 (LSASS Memory Dump)", "T1558.003 (Kerberoasting)"],
    status: "COMPLETED",
    confidencePct: 99.1,
    detectedTimestamp: "2026-08-23T03:45:30Z",
    attackerDwellTime: "T+01:31",
    evidenceSnippet: "sekurlsa::logonpasswords extracted NTLM hash for service account svc_backup_mgmt",
    associatedProcess: "rundll32.exe (injected LSASS)",
    targetScope: "Endpoint WS-CLINIC-409"
  },
  {
    stageNumber: 4,
    name: "Stage 4: Privilege Escalation",
    shortTitle: "Privilege Escalation",
    description: "SeDebugPrivilege token impersonation and elevation to Domain Admin via svc_backup_mgmt.",
    mitreTechniques: ["T1134.001 (Token Impersonation)", "T1078.002 (Domain Accounts)"],
    status: "COMPLETED",
    confidencePct: 97.4,
    detectedTimestamp: "2026-08-23T04:12:05Z",
    attackerDwellTime: "T+01:58",
    evidenceSnippet: "Event ID 4672: Special privileges assigned to new logon: mercy\\svc_backup_mgmt",
    associatedProcess: "svchost.exe (Token Elevated)",
    targetScope: "Enterprise Domain Controllers"
  },
  {
    stageNumber: 5,
    name: "Stage 5: Lateral Movement",
    shortTitle: "Lateral Movement",
    description: "Mass remote execution via SMB PsExec and WMI scripts across 24 clinical and database nodes.",
    mitreTechniques: ["T1021.002 (SMB/Windows Admin Shares)", "T1047 (WMI Execution)"],
    status: "COMPLETED",
    confidencePct: 95.8,
    detectedTimestamp: "2026-08-23T05:20:18Z",
    attackerDwellTime: "T+03:06",
    evidenceSnippet: "psexec.exe \\\\SQL-BILLING-01 -u mercy\\svc_backup_mgmt -c stage_payload.exe",
    associatedProcess: "psexesvc.exe (PID 9104)",
    targetScope: "24 Enterprise Windows Server Nodes"
  },
  {
    stageNumber: 6,
    name: "Stage 6: Defense Evasion & Staging",
    shortTitle: "Defense Evasion",
    description: "EDR kernel driver blinding via Bring-Your-Own-Vulnerable-Driver (BYOVD) and clearing Security Event Logs.",
    mitreTechniques: ["T1562.001 (Disable Security Tools)", "T1070.001 (Clear Windows Event Logs)"],
    status: "ACTIVE_IN_PROGRESS",
    confidencePct: 89.4,
    detectedTimestamp: "2026-08-24T00:15:00Z",
    attackerDwellTime: "T+04:12",
    evidenceSnippet: "wevtutil.exe cl Security & gdrv.sys vulnerable kernel driver loaded to blind EDR telemetry",
    associatedProcess: "cmd.exe -> wevtutil.exe (PID 4820)",
    targetScope: "Hyper-V & VMware Cluster Hosts"
  },
  {
    stageNumber: 7,
    name: "Stage 7: Backup Destruction Attempt",
    shortTitle: "Backup Destruction",
    description: "Executing vssadmin delete shadows /all /quiet and issuing S3 API DeleteObject commands.",
    mitreTechniques: ["T1490 (Inhibit System Recovery)", "T1485 (Data Destruction)"],
    status: "PREVENTED_BLOCKED",
    confidencePct: 99.8,
    detectedTimestamp: "2026-08-24T00:32:15Z",
    attackerDwellTime: "T+04:18",
    evidenceSnippet: "vssadmin delete shadows intercepted by Aegis Minifilter Driver. S3 Object Lock Compliance WORM blocked deletion.",
    associatedProcess: "vssadmin.exe (PID 8944 - KILLED)",
    targetScope: "Volume Shadow Copies & S3 Repos"
  },
  {
    stageNumber: 8,
    name: "Stage 8: Mass File Encryption",
    shortTitle: "Mass Encryption",
    description: "Multithreaded high-speed ChaCha20 + Curve25519 file encryption with .lockbit extension append.",
    mitreTechniques: ["T1486 (Data Encrypted for Impact)"],
    status: "PREDICTED_NEXT",
    confidencePct: 98.4,
    detectedTimestamp: "Estimated in 42 minutes if uncontained",
    attackerDwellTime: "Imminent (T+05:00)",
    evidenceSnippet: "LockBit 3.0 binary pre-staged in C:\\Windows\\Temp\\msupdate.exe across 18 endpoints",
    associatedProcess: "msupdate.exe (Staged)",
    targetScope: "Clinical SQL Databases, File Shares, VM Disks"
  }
];

export default function AttackProgressionPage() {
  const [selectedCase, setSelectedCase] = useState<RansomwareCase>(MOCK_CASES[0]);
  const [stages, setStages] = useState<AttackStage[]>(ATTACK_STAGES);
  const [selectedStageNum, setSelectedStageNum] = useState<number>(6);
  const [remainingMinutes, setRemainingMinutes] = useState<number>(42);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [timelineScrubMinute, setTimelineScrubMinute] = useState<number>(252); // 4h 12m in minutes

  const selectedStage = stages.find((s) => s.stageNumber === selectedStageNum) || stages[5];

  // Countdown timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && remainingMinutes > 0) {
      interval = setInterval(() => {
        setRemainingMinutes((prev) => Math.max(0, prev - 1));
      }, 30000); // 30s tick for realistic feel
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, remainingMinutes]);

  const executeImmediateContainment = () => {
    setIsTimerRunning(false);
    setRemainingMinutes(999); // Safe / Halted

    setStages((prev) =>
      prev.map((st) => {
        if (st.stageNumber === 6) return { ...st, status: "COMPLETED" };
        if (st.stageNumber === 8) return { ...st, status: "PREVENTED_BLOCKED" };
        return st;
      })
    );
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
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid var(--amber)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Flame size={18} color="var(--amber)" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
              Autonomous Attack-Progression Model
            </h1>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(245, 158, 11, 0.2)",
                color: "var(--amber)",
                border: "1px solid var(--amber)",
                letterSpacing: "0.06em",
                textTransform: "uppercase"
              }}
            >
              8-Stage Real-Time Tracker
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 750 }}>
            Real-time multi-vector machine learning model estimating exact adversary dwell progression through the 8-stage ransomware lifecycle to calculate remaining time before catastrophic file encryption.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={executeImmediateContainment}
            className="btn-primary"
            style={{
              background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
              color: "#fff",
              fontWeight: 800,
              boxShadow: "0 0 15px rgba(244, 63, 94, 0.4)"
            }}
          >
            <Zap size={14} />
            Execute Immediate Containment
          </button>

          <Link href="/killchain-interrupter" className="btn-secondary">
            <Crosshair size={14} />
            Open Interrupter
          </Link>
        </div>
      </div>

      {/* Hero Banner: Current Stage & Countdown Timer */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(244, 63, 94, 0.15) 0%, rgba(14, 21, 38, 0.95) 50%, rgba(245, 158, 11, 0.15) 100%)",
          border: "1px solid rgba(244, 63, 94, 0.4)",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20
        }}
      >
        {/* Left: Stage Estimation */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "rgba(244, 63, 94, 0.2)",
              border: "2px solid var(--rose)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 900,
              color: "var(--rose)"
            }}
          >
            6/8
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "var(--fg)" }}>
                CURRENT STAGE: Stage 6 of 8 — Defense Evasion & Pre-Encryption Staging
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "var(--rose)",
                  color: "#fff"
                }}
              >
                89% CONFIDENCE
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              Encryption Risk Level: <strong style={{ color: "var(--rose)" }}>CRITICAL (98.4 / 100)</strong> • Adversary Dwell Time:{" "}
              <strong style={{ color: "var(--amber)" }}>4 hours 12 minutes</strong> • Payload:{" "}
              <strong style={{ color: "var(--cyan)" }}>LockBit 3.0 (Black)</strong>
            </div>
          </div>
        </div>

        {/* Right: Actionable Countdown Clock */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "10px 16px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
            Estimated Time to Full Encryption
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: remainingMinutes < 60 ? "var(--rose)" : "var(--primary)", fontFamily: "monospace" }}>
            {remainingMinutes === 999 ? "HALTED (SAFE)" : `~ ${remainingMinutes} min remaining`}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            Urgent: Pre-encryption burst imminent
          </div>
        </div>
      </div>

      {/* Recommended Immediate Action Callout */}
      <div
        style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.35)",
          borderRadius: 8,
          padding: "12px 18px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={18} color="var(--primary)" />
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--fg)" }}>
              Recommended Immediate Containment Step:
            </span>{" "}
            <span style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 700 }}>
              Sever Lateral SMB/RPC Chokepoints (Port 445) & Freeze Immutable S3 Snapshots
            </span>
          </div>
        </div>
        <button
          onClick={executeImmediateContainment}
          className="btn-primary"
          style={{ fontSize: 11, padding: "5px 12px", background: "var(--primary)" }}
        >
          Execute Now (-92% Blast Risk)
        </button>
      </div>

      {/* 8-Stage Progression Pipeline (Horizontal Step Cards) */}
      <div className="card-tactical" style={{ padding: 18, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 14 }}>
          Adversary Kill-Chain Progression Pipeline
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 8
          }}
        >
          {stages.map((stage) => {
            const isSelected = selectedStageNum === stage.stageNumber;
            const isCompleted = stage.status === "COMPLETED";
            const isActive = stage.status === "ACTIVE_IN_PROGRESS";
            const isBlocked = stage.status === "PREVENTED_BLOCKED";

            let borderCol = "var(--border)";
            let statusText = "Pending";
            let statusBg = "rgba(255,255,255,0.05)";
            let statusCol = "var(--muted)";

            if (isCompleted) {
              borderCol = "rgba(16, 185, 129, 0.4)";
              statusText = "Completed";
              statusBg = "rgba(16, 185, 129, 0.15)";
              statusCol = "var(--primary)";
            } else if (isActive) {
              borderCol = "var(--rose)";
              statusText = "Active (Stage 6)";
              statusBg = "rgba(244, 63, 94, 0.25)";
              statusCol = "var(--rose)";
            } else if (isBlocked) {
              borderCol = "var(--cyan)";
              statusText = "Blocked by WORM";
              statusBg = "rgba(6, 182, 212, 0.2)";
              statusCol = "var(--cyan)";
            }

            if (isSelected) {
              borderCol = "#3b82f6";
            }

            return (
              <div
                key={stage.stageNumber}
                onClick={() => setSelectedStageNum(stage.stageNumber)}
                style={{
                  background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                  border: `1px solid ${borderCol}`,
                  borderRadius: 6,
                  padding: "10px 12px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--fg-2)" }}>
                    Stage {stage.stageNumber}
                  </span>
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 800,
                      padding: "1px 5px",
                      borderRadius: 3,
                      background: statusBg,
                      color: statusCol,
                      textTransform: "uppercase"
                    }}
                  >
                    {statusText}
                  </span>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>
                  {stage.shortTitle}
                </div>

                <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                  {stage.attackerDwellTime}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Detail Grid: Stage Telemetry Inspector (Left) + MITRE ATT&CK & Forensics (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Left: Stage Telemetry Deep Dive */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 18, border: "1px solid rgba(59, 130, 246, 0.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(59, 130, 246, 0.2)",
                  color: "#60a5fa",
                  fontFamily: "monospace"
                }}
              >
                STAGE {selectedStage.stageNumber} OF 8 INSPECTION
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                Confidence: <strong style={{ color: "var(--primary)" }}>{selectedStage.confidencePct}%</strong>
              </span>
            </div>

            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--fg)", marginBottom: 8 }}>
              {selectedStage.name}
            </div>

            <p style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.4, marginBottom: 14 }}>
              {selectedStage.description}
            </p>

            {/* Diagnostic Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                  🔬 Forensic Telemetry Snippet
                </div>
                <div style={{ color: "var(--amber)", fontFamily: "monospace", fontSize: 11.5, wordBreak: "break-all" }}>
                  {selectedStage.evidenceSnippet}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 800 }}>
                    Associated Rogue Process
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)", fontFamily: "monospace", marginTop: 2 }}>
                    {selectedStage.associatedProcess}
                  </div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 800 }}>
                    Target Scope & Infrastructure
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--cyan)", marginTop: 2 }}>
                    {selectedStage.targetScope}
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                  🛡️ MITRE ATT&CK Techniques Mapped
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedStage.mitreTechniques.map((tech, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "rgba(6, 182, 212, 0.15)",
                        color: "var(--cyan)",
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "monospace"
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
                Attacker Dwell Timeline Scrubber (0h to 5h)
              </span>
              <span style={{ fontSize: 11, color: "var(--amber)", fontFamily: "monospace" }}>
                Current: T+04:12 (Minute {timelineScrubMinute})
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={300}
              value={timelineScrubMinute}
              onChange={(e) => setTimelineScrubMinute(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--amber)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
              <span>T-0 Initial Access (02:14 UTC)</span>
              <span>T+2h Priv Escalation</span>
              <span>T+4h Pre-Encryption (Now)</span>
              <span>T+5h Est. Encryption</span>
            </div>
          </div>
        </div>

        {/* Right: MITRE Heatmap & Fast Containment Triggers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
              ⚡ High-Impact Pre-Encryption Controls
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { title: "Isolate DC01 & Reset KRBTGT", impact: "-88% Propagation", href: "/identity-defense" },
                { title: "Block SMB 445 / RDP 3389", impact: "-92% Lateral Spread", href: "/killchain-interrupter" },
                { title: "Enforce S3 WORM Compliance Freeze", impact: "100% Backups Safe", href: "/backup-lockdown" }
              ].map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{c.title}</div>
                    <div style={{ fontSize: 10.5, color: "var(--primary)", marginTop: 2 }}>{c.impact}</div>
                  </div>
                  <Link href={c.href} className="btn-secondary" style={{ fontSize: 11, padding: "4px 8px" }}>
                    Trigger
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="card-tactical" style={{ padding: 18, flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 10 }}>
              🧠 ML Feature Attribution Weights
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5 }}>
              {[
                { feature: "Shannon Entropy Jump (>7.90)", weight: 38, isTriggered: true },
                { feature: "vssadmin shadow copy deletion", weight: 28, isTriggered: true },
                { feature: "BYOVD vulnerable driver load", weight: 18, isTriggered: true },
                { feature: "Lateral PsExec execution count", weight: 16, isTriggered: true }
              ].map((f, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--fg-2)" }}>{f.feature}</span>
                  <span style={{ color: "var(--rose)", fontWeight: 800, fontFamily: "monospace" }}>
                    +{f.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
