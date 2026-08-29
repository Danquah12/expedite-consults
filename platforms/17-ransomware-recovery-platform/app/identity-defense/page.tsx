"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Key,
  Terminal,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Search,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  Eye,
  Crosshair,
  AlertTriangle,
  Server,
  Database,
  ArrowRight,
  GitBranch,
  RefreshCw,
  FileCode,
  Check
} from "lucide-react";
import { IdentityAttackEvent, IdentityRecoveryStep } from "@/types/recovery";

// Active Directory Compromise Events Telemetry
const INITIAL_IDENTITY_ATTACKS: IdentityAttackEvent[] = [
  {
    id: "id-atk-001",
    timestamp: "2026-08-24T00:32:40Z",
    attackType: "DCSYNC",
    severity: "CRITICAL",
    sourceHost: "WORKSTATION-RAD-19.mercy.local",
    sourceIp: "10.14.8.94",
    targetAccount: "KRBTGT & mercy\\Administrator",
    targetDomainController: "DC01.mercy.local",
    mitreId: "T1003.006 (DCSync)",
    protocol: "RPC / MS-DRSR",
    rawArtifact: "DsGetNCChanges request from non-DC computer account mercy\\j.miller with DS-Replication-Get-Changes-All rights",
    status: "DETECTED",
    riskImpact: "Threat actor possesses full NTLM password hash database including KRBTGT key."
  },
  {
    id: "id-atk-002",
    timestamp: "2026-08-24T00:31:15Z",
    attackType: "GOLDEN_TICKET",
    severity: "CRITICAL",
    sourceHost: "UNKNOWN_ENCLAVE_NODE",
    sourceIp: "10.14.4.18",
    targetAccount: "mercy\\svc_backup_mgmt",
    targetDomainController: "DC02.mercy.local",
    mitreId: "T1558.001 (Golden Ticket)",
    protocol: "KERBEROS / TGS",
    rawArtifact: "Forged TGT presented with 10-year validity lifetime and PAC forged group SID 512 (Domain Admins)",
    status: "DETECTED",
    riskImpact: "Adversary can impersonate any domain identity without authenticating to KDC."
  },
  {
    id: "id-atk-003",
    timestamp: "2026-08-24T00:29:50Z",
    attackType: "KERBEROASTING",
    severity: "HIGH",
    sourceHost: "FS-CLINICAL-02.mercy.local",
    sourceIp: "10.14.4.18",
    targetAccount: "MSSQLSvc/sql-billing.mercy.local:1433",
    targetDomainController: "DC01.mercy.local",
    mitreId: "T1558.003 (Kerberoasting)",
    protocol: "KERBEROS / TGS",
    rawArtifact: "High-frequency RC4_HMAC (Type 23) TGS ticket requests across 18 sensitive service accounts in 4 seconds",
    status: "CONTAINED",
    riskImpact: "Adversary extracted encrypted ticket payloads for offline GPU hash cracking."
  },
  {
    id: "id-atk-004",
    timestamp: "2026-08-24T00:28:10Z",
    attackType: "UNAUTHORIZED_DOMAIN_ADMIN",
    severity: "CRITICAL",
    sourceHost: "DC01.mercy.local",
    sourceIp: "10.14.2.10",
    targetAccount: "mercy\\backdoor_svc99",
    targetDomainController: "DC01.mercy.local",
    mitreId: "T1098 (Account Manipulation)",
    protocol: "SAMR",
    rawArtifact: "Account backdoor_svc99 added to CN=Domain Admins,CN=Users,DC=mercy,DC=local by NT AUTHORITY\\SYSTEM",
    status: "CONTAINED",
    riskImpact: "Persistence account injected with Tier-0 domain governance rights."
  },
  {
    id: "id-atk-005",
    timestamp: "2026-08-24T00:25:30Z",
    attackType: "SHADOW_ADMIN_ACL",
    severity: "HIGH",
    sourceHost: "APP-IIS-04.mercy.local",
    sourceIp: "10.14.4.22",
    targetAccount: "CN=AdminSDHolder,CN=System,DC=mercy,DC=local",
    targetDomainController: "DC01.mercy.local",
    mitreId: "T1484 (Domain Policy Mod)",
    protocol: "LDAP",
    rawArtifact: "WriteDACL granted on AdminSDHolder object allowing automatic propagation of full control to all protected groups",
    status: "CONTAINED",
    riskImpact: "Stealth ACL backdoor enabling recurring re-elevation even after password resets."
  }
];

// 4-Step Guided Identity Recovery Sequence
const INITIAL_RECOVERY_STEPS: IdentityRecoveryStep[] = [
  {
    stepNumber: 1,
    title: "Break-Glass Admin Access & Compromised Session Termination",
    actionCode: "BREAK_GLASS_LOGIN",
    description: "Authenticate using hardware FIDO2 emergency break-glass account, invalidate all active Kerberos TGT/TGS sessions, and sever interactive RDP tokens.",
    status: "COMPLETED",
    estimatedTimeMin: 10,
    logs: [
      "Break-glass credential verified (FIDO2 WebAuthn + Hardware Token)",
      "Executed Revoke-ADUserSession across 2 Domain Controllers",
      "Terminated 142 rogue interactive sessions on Tier-0 infrastructure"
    ],
    commandPreview: "Invoke-EmergencySessionPurge -TargetDomain 'mercy.local' -EnforceTicketRevocation $true"
  },
  {
    stepNumber: 2,
    title: "Double Kerberos KRBTGT Password Roll Planner",
    actionCode: "KRBTGT_DOUBLE_ROLL",
    description: "Roll the Active Directory KRBTGT account password twice to completely invalidate forged Golden Tickets while allowing replication convergence.",
    status: "IN_PROGRESS",
    estimatedTimeMin: 45,
    logs: [
      "Pass 1: Reset-KDSKey & Reset-KRBTGTPassword -FirstRoll executed successfully",
      "KDS Root Key synchronized to DC01 and DC02",
      "Waiting for Kerberos Ticket Maximum Lifetime (10h) or Emergency Accelerated Second Roll..."
    ],
    commandPreview: "Reset-KrbTgtPassword -Domain 'mercy.local' -Mode 'DoubleRoll' -ForceImmediateReplication"
  },
  {
    stepNumber: 3,
    title: "Rogue SPN Purging & Domain Admin Access Revocation",
    actionCode: "ROGUE_SPN_PURGE",
    description: "Scan Active Directory for unauthorized Kerberoastable SPNs, revoke backdoor accounts, and restore AdminSDHolder default security descriptors.",
    status: "READY",
    estimatedTimeMin: 15,
    logs: [],
    commandPreview: "Remove-RogueSPN -AuditList @('MSSQLSvc/sql-billing', 'backdoor_svc99') -RestoreAdminSDHolderDefaults"
  },
  {
    stepNumber: 4,
    title: "Tier-0 Domain Controller Restoration & Clean Forest Rebuild",
    actionCode: "DC_FOREST_RESTORE",
    description: "Rebuild secondary Domain Controller DC02 from immutable S3 system state backup, execute ntdsutil clean metadata purge, and verify Sysvol DFS replication.",
    status: "WAITING_CONFIRMATION",
    estimatedTimeMin: 60,
    logs: [],
    commandPreview: "Restore-ADForestRecovery -SystemStateSource 'S3-WORM-Snapshot-0400' -ExecuteMetadataCleanup"
  }
];

export default function IdentityDefensePage() {
  const [attacks, setAttacks] = useState<IdentityAttackEvent[]>(INITIAL_IDENTITY_ATTACKS);
  const [recoverySteps, setRecoverySteps] = useState<IdentityRecoveryStep[]>(INITIAL_RECOVERY_STEPS);
  const [selectedAttack, setSelectedAttack] = useState<IdentityAttackEvent>(INITIAL_IDENTITY_ATTACKS[0]);
  const [activeStepTab, setActiveStepTab] = useState<number>(2);
  const [krbtgtCountdownHours, setKrbtgtCountdownHours] = useState(8.5);
  const [emergencyRollSuccess, setEmergencyRollSuccess] = useState(false);
  const [isExecutingStep, setIsExecutingStep] = useState(false);
  const [activeView, setActiveView] = useState<"sequence" | "blast-radius">("sequence");

  // Execute Step Action
  const handleExecuteStep = (stepNumber: number) => {
    setIsExecutingStep(true);
    setTimeout(() => {
      setRecoverySteps((prev) =>
        prev.map((step) => {
          if (step.stepNumber === stepNumber) {
            return {
              ...step,
              status: "COMPLETED",
              logs: [
                ...step.logs,
                `[${new Date().toISOString().split("T")[1].replace("Z", "")} UTC] Action executed successfully. Verified clean telemetry.`
              ]
            };
          }
          if (step.stepNumber === stepNumber + 1 && step.status === "WAITING_CONFIRMATION") {
            return { ...step, status: "READY" };
          }
          return step;
        })
      );
      if (stepNumber === 2) {
        setEmergencyRollSuccess(true);
        setKrbtgtCountdownHours(0);
      }
      setIsExecutingStep(false);
    }, 1200);
  };

  return (
    <div style={{ padding: "20px 24px", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Breadcrumb & Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
            <span style={{ color: "#10b981", fontWeight: 700 }}>STAGE 2: PREVENT</span>
            <span>/</span>
            <span>IDENTITY & ACTIVE DIRECTORY</span>
            <span>/</span>
            <span style={{ color: "var(--fg)" }}>ACTIVE DIRECTORY DEFENSE & RECOVERY</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "#f8fafc" }}>
              Identity Attack & Active Directory Defense
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 8px",
                borderRadius: 4,
                background: "rgba(244,63,94,0.15)",
                color: "#f43f5e",
                border: "1px solid rgba(244,63,94,0.3)"
              }}
            >
              TIER-0 THREAT DETECTED
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Active Directory compromise sensor intercepting DCSync, Golden Tickets, Kerberoasting, and executing orchestrated 4-step identity restoration workflows.
          </p>
        </div>

        {/* View Switcher */}
        <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: 6, padding: 2, border: "1px solid var(--border)" }}>
          <button
            onClick={() => setActiveView("sequence")}
            style={{
              padding: "6px 14px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              background: activeView === "sequence" ? "var(--primary)" : "transparent",
              color: activeView === "sequence" ? "#070b12" : "var(--fg-2)",
              cursor: "pointer"
            }}
          >
            4-Step Recovery Sequence
          </button>
          <button
            onClick={() => setActiveView("blast-radius")}
            style={{
              padding: "6px 14px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              background: activeView === "blast-radius" ? "var(--primary)" : "transparent",
              color: activeView === "blast-radius" ? "#070b12" : "var(--fg-2)",
              cursor: "pointer"
            }}
          >
            Tier-0 Blast Radius Map
          </button>
        </div>
      </div>

      {/* 4 Identity Posture Telemetry Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Active Directory Forest
            </span>
            <Server size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981", marginTop: 6, fontFamily: "monospace" }}>
            mercy.local <span style={{ fontSize: 11, color: "var(--muted)" }}>(Win2022)</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            2 Domain Controllers · 4,820 Objects
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              DCSync / Golden Ticket
            </span>
            <ShieldAlert size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f43f5e", marginTop: 6, fontFamily: "monospace" }}>
            2 Critical Attacks
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            KRBTGT Account Compromise Confirmed
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              KRBTGT Password Roll Status
            </span>
            <Key size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: emergencyRollSuccess ? "#10b981" : "#f59e0b", marginTop: 6, fontFamily: "monospace" }}>
            {emergencyRollSuccess ? "DOUBLE ROLL COMPLETE" : "PASS 1 DONE (Pass 2 Pending)"}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            {emergencyRollSuccess ? "All forged tickets invalidated" : "Replication buffer: 8.5h remaining"}
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Identity Recovery Progress
            </span>
            <Activity size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 6, fontFamily: "monospace" }}>
            {Math.round(
              (recoverySteps.filter((s) => s.status === "COMPLETED").length / recoverySteps.length) * 100
            )}% <span style={{ fontSize: 12, color: "var(--muted)" }}>Completed</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Stage: Step 2/4 KRBTGT Double Roll
          </div>
        </div>
      </div>

      {activeView === "sequence" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: 20 }}>
          {/* Left: 4-Step Orchestrated Identity Recovery Workflow */}
          <div className="card-tactical" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Key size={18} color="#10b981" />
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc" }}>
                  Automated Identity Recovery Sequence
                </h2>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                Zero-Trust Forest Sanitization Pipeline
              </span>
            </div>

            {/* Steps Stepper */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {recoverySteps.map((step) => {
                const isSelected = activeStepTab === step.stepNumber;
                const isDone = step.status === "COMPLETED";
                const isRunning = step.status === "IN_PROGRESS";

                return (
                  <div
                    key={step.stepNumber}
                    onClick={() => setActiveStepTab(step.stepNumber)}
                    style={{
                      background: isSelected ? "rgba(16,185,129,0.06)" : "var(--surface-2)",
                      border: isSelected ? "1px solid #10b981" : "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: isDone
                              ? "#10b981"
                              : isRunning
                              ? "#f59e0b"
                              : "var(--surface-3)",
                            color: isDone ? "#070b12" : "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 900
                          }}
                        >
                          {isDone ? <Check size={16} /> : step.stepNumber}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: "#f8fafc" }}>
                            {step.title}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                            Est. Duration: {step.estimatedTimeMin} mins · Code: {step.actionCode}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`badge-sev ${
                          isDone
                            ? "badge-success"
                            : isRunning
                            ? "badge-high animate-pulse"
                            : "badge-low"
                        }`}
                      >
                        {step.status.replace("_", " ")}
                      </span>
                    </div>

                    <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.4, marginTop: 10, marginBottom: 8 }}>
                      {step.description}
                    </p>

                    {/* Step Specific Details if Selected */}
                    {isSelected && (
                      <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                        {/* KRBTGT Double Roll Special Interactive Countdown & Trigger */}
                        {step.stepNumber === 2 && (
                          <div
                            style={{
                              background: "rgba(245,158,11,0.1)",
                              border: "1px solid rgba(245,158,11,0.3)",
                              borderRadius: 6,
                              padding: "12px",
                              marginBottom: 12
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#f59e0b" }}>
                                KRBTGT Pass 2 Roll Planner
                              </span>
                              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f59e0b" }}>
                                {emergencyRollSuccess ? "0h 00m (Executed)" : `${krbtgtCountdownHours}h Replication Cooldown`}
                              </span>
                            </div>
                            <p style={{ fontSize: 11, color: "var(--fg-2)", margin: "0 0 10px" }}>
                              Microsoft best practices recommend rolling KRBTGT twice. Pass 1 invalidates the master key; Pass 2 purges old ticket decryptions across all active Kerberos services.
                            </p>
                            {!emergencyRollSuccess && (
                              <button
                                onClick={() => handleExecuteStep(2)}
                                disabled={isExecutingStep}
                                style={{
                                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                  color: "#070b12",
                                  fontWeight: 800,
                                  padding: "7px 14px",
                                  borderRadius: 4,
                                  border: "none",
                                  fontSize: 11.5,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6
                                }}
                              >
                                <Zap size={13} />
                                <span>{isExecutingStep ? "Rolling Key & Syncing..." : "Execute Emergency Pass 2 Double Roll Now"}</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* PowerShell Automation Command Preview */}
                        <div style={{ background: "#070b12", borderRadius: 4, padding: "8px 10px", marginBottom: 10 }}>
                          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                            PowerShell / Aegis AD Orchestrator Command
                          </div>
                          <pre style={{ margin: 0, fontSize: 10.5, fontFamily: "monospace", color: "#10b981", overflowX: "auto" }}>
                            {step.commandPreview}
                          </pre>
                        </div>

                        {/* Step Execution Logs */}
                        {step.logs.length > 0 && (
                          <div style={{ background: "var(--surface)", borderRadius: 4, padding: "8px 10px", marginBottom: 10 }}>
                            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                              Execution Telemetry Logs
                            </div>
                            {step.logs.map((log, lIdx) => (
                              <div key={lIdx} style={{ fontSize: 11, color: "var(--fg-2)", fontFamily: "monospace" }}>
                                ✓ {log}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Execution Button */}
                        {step.status !== "COMPLETED" && step.stepNumber !== 2 && (
                          <button
                            onClick={() => handleExecuteStep(step.stepNumber)}
                            disabled={isExecutingStep}
                            style={{
                              background: "var(--primary)",
                              color: "#070b12",
                              fontWeight: 800,
                              padding: "8px 16px",
                              borderRadius: 4,
                              border: "none",
                              cursor: "pointer",
                              fontSize: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 6
                            }}
                          >
                            <Play size={13} />
                            <span>{isExecutingStep ? "Executing Step..." : `Execute Step ${step.stepNumber}: ${step.title.split("&")[0]}`}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Real-time Active Directory Compromise Monitor Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card-tactical" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                  <ShieldAlert size={15} color="#f43f5e" />
                  <span>Real-Time AD Compromise Stream</span>
                </div>
                <span className="badge-sev badge-critical">
                  {attacks.length} DETECTIONS
                </span>
              </div>

              {/* Attacks List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto" }}>
                {attacks.map((atk) => {
                  const isSel = selectedAttack.id === atk.id;
                  return (
                    <div
                      key={atk.id}
                      onClick={() => setSelectedAttack(atk)}
                      style={{
                        background: isSel ? "rgba(244,63,94,0.12)" : "var(--surface-2)",
                        border: isSel ? "1px solid #f43f5e" : "1px solid var(--border)",
                        borderRadius: 6,
                        padding: "10px 12px",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#f43f5e" }}>
                          {atk.attackType.replace("_", " ")}
                        </span>
                        <span style={{ fontSize: 9.5, fontFamily: "monospace", color: "var(--muted)" }}>
                          {atk.timestamp.split("T")[1].replace("Z", "")} UTC
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#f8fafc", fontWeight: 600 }}>
                        Target: {atk.targetAccount}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                        Source: {atk.sourceHost} ({atk.sourceIp})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Attack Inspector */}
            {selectedAttack && (
              <div className="card-tactical" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
                  Attack Forensics & Risk Impact
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc", marginBottom: 4 }}>
                  {selectedAttack.mitreId}
                </div>
                <p style={{ fontSize: 11.5, color: "#f43f5e", lineHeight: 1.4, margin: "0 0 10px" }}>
                  {selectedAttack.riskImpact}
                </p>
                <div style={{ background: "#070b12", borderRadius: 4, padding: "8px", fontSize: 10, fontFamily: "monospace", color: "var(--fg-2)" }}>
                  {selectedAttack.rawArtifact}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Blast Radius Visual View */
        <div className="card-tactical" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <GitBranch size={20} color="#10b981" />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
              Active Directory Tier-0 Forest Architecture & Attack Blast Radius
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {/* Domain Controller 1 */}
            <div style={{ background: "var(--surface-2)", border: "1px solid rgba(244,63,94,0.4)", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#f43f5e" }}>PDC EMULATOR (DC01)</span>
                <span className="badge-sev badge-critical">DCSYNC TARGET</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginBottom: 8 }}>
                IP: 10.14.2.10 · mercy.local
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-2)" }}>
                Compromised by DCSync RPC extraction. NTDS.dit snapshot isolated. Requires clean recovery pass.
              </div>
            </div>

            {/* Domain Controller 2 */}
            <div style={{ background: "var(--surface-2)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b" }}>SECONDARY DC (DC02)</span>
                <span className="badge-sev badge-high">REBUILDING</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginBottom: 8 }}>
                IP: 10.14.2.11 · mercy.local
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-2)" }}>
                Restoring clean system state from immutable S3 snapshot. Sysvol replication staged in quarantine.
              </div>
            </div>

            {/* Protected Groups & Accounts */}
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#10b981" }}>PROTECTED TIER-0 GROUPS</span>
                <span className="badge-sev badge-success">AUDITING</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
                Domain Admins, Enterprise Admins, Schema Admins
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-2)" }}>
                Rogue account `backdoor_svc99` purged. AdminSDHolder permissions reset to factory schema default.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
