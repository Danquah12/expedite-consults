"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Server,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Terminal,
  RefreshCw,
  Clock,
  Trash2,
  Users,
  Building,
  Radio,
  Sliders,
  Sparkles,
  ArrowRight,
  Download,
  Copy,
  Layers,
  KeyRound
} from "lucide-react";
import { CleanDcProvisionNode, KrbtgtRollPhase, MaliciousGpoFinding } from "@/types/recovery";

const INITIAL_CLEAN_DCS: CleanDcProvisionNode[] = [
  {
    id: "dc-01",
    hostname: "DC01-RECOVERY.mercy.local",
    site: "Isolated-Airgap-Site",
    ipAddress: "10.99.1.10",
    fsmoRoles: ["PDC Emulator", "RID Master", "Infrastructure Master", "Schema Master", "Domain Naming Master"],
    ifmSnapshotDate: "2026-08-23 04:00:00 UTC",
    provisionStatus: "PROVISIONED_CLEAN",
    airgapVlan: 994,
    healthScore: 99.4,
    adminCountSanitized: 6
  },
  {
    id: "dc-02",
    hostname: "DC02-RECOVERY.mercy.local",
    site: "Isolated-Airgap-Site",
    ipAddress: "10.99.1.11",
    fsmoRoles: ["Global Catalog"],
    ifmSnapshotDate: "2026-08-23 04:00:00 UTC",
    provisionStatus: "REPLICATING",
    airgapVlan: 994,
    healthScore: 97.8,
    adminCountSanitized: 4
  },
  {
    id: "dc-03",
    hostname: "DC03-RODC-CLINIC.mercy.local",
    site: "Clinical-Branch-Isolated",
    ipAddress: "10.99.4.10",
    fsmoRoles: ["Read-Only DC"],
    ifmSnapshotDate: "2026-08-22 23:00:00 UTC",
    provisionStatus: "ISOLATED",
    airgapVlan: 998,
    healthScore: 94.0,
    adminCountSanitized: 2
  }
];

const INITIAL_KRBTGT_PHASES: KrbtgtRollPhase[] = [
  {
    phaseIndex: 1,
    title: "KRBTGT Password Roll #1 (Primary DC01)",
    description: "Generates new 128-character cryptographic secret for krbtgt account. Previous password becomes 'Current - 1' to avoid service disruption.",
    status: "COMPLETED",
    timeSkewAcceleratedSec: 12,
    kerberosTicketsPurged: 840,
    targetDc: "DC01-RECOVERY"
  },
  {
    phaseIndex: 2,
    title: "Accelerated Time-Skew Ticket Invalidation (10h ➔ 45s)",
    description: "Simulates Kerberos MaxTicketAge expiration window in air-gapped clock domain, flushing Golden Tickets and forged PAC signatures across forest.",
    status: "COMPLETED",
    timeSkewAcceleratedSec: 45,
    kerberosTicketsPurged: 3120,
    targetDc: "ALL_FOREST_DCS"
  },
  {
    phaseIndex: 3,
    title: "KRBTGT Password Roll #2 (Final Invalidation)",
    description: "Overwrites secondary historical key. All forged Golden Tickets generated prior to incident are mathematically dead.",
    status: "ACTIVE",
    timeSkewAcceleratedSec: 18,
    kerberosTicketsPurged: 4890,
    targetDc: "DC01-RECOVERY"
  }
];

const INITIAL_GPO_FINDINGS: MaliciousGpoFinding[] = [
  {
    id: "gpo-01",
    gpoName: "Default Domain Controllers Policy",
    guid: "{6AC1786C-016F-11D2-945F-00C04fB984F9}",
    threatType: "ROGUE_SCHEDULED_TASK",
    severity: "CRITICAL",
    details: "Rogue ScheduledTasks.xml item 'WinDefendHealth_Updater' executing obfuscated PowerShell beacon from C:\\ProgramData\\svchost.ps1",
    remediationCommand: "Remove-GPPrefScheduledTask -Guid '{6AC1786C-016F-11D2-945F-00C04fB984F9}' -TaskName 'WinDefendHealth_Updater'",
    cleared: false
  },
  {
    id: "gpo-02",
    gpoName: "Corporate Workstation Hardening Baseline",
    guid: "{31B2F340-016D-11D2-945F-00C04FB984F9}",
    threatType: "ROGUE_ADMINCOUNT_1",
    severity: "CRITICAL",
    details: "Backdoored service account 'mercy\\svc_backup_mgmt' granted AdminCount=1 and SeDebugPrivilege rights",
    remediationCommand: "Set-ADUser 'svc_backup_mgmt' -Clear adminCount; Remove-ADGroupMember 'Domain Admins' 'svc_backup_mgmt'",
    cleared: false
  },
  {
    id: "gpo-03",
    gpoName: "Forest External Trust Policy",
    guid: "{94F12830-4491-11D2-945F-00C04FB984F9}",
    threatType: "BACKDOORED_TRUST",
    severity: "HIGH",
    details: "Unauthorized external bidirectional trust created to 'corp-partner-staging.net' with SID filtering disabled",
    remediationCommand: "Remove-ADTrust -Target 'corp-partner-staging.net' -Force",
    cleared: true
  },
  {
    id: "gpo-04",
    gpoName: "CN=Deleted Objects (Tombstone Vault)",
    guid: "CN=Deleted Objects,DC=mercy,DC=local",
    threatType: "TOMBSTONE_OBJECT",
    severity: "MEDIUM",
    details: "Dormant rogue shadow admin account 'admin_recovery_temp' flagged for authoritative tombstone reanimation",
    remediationCommand: "Remove-ADObject -Identity 'CN=admin_recovery_temp\\0ADEL:...CN=Deleted Objects,DC=mercy,DC=local' -Recursive",
    cleared: true
  }
];

export default function AdForestRecoveryPage() {
  const [cleanDcs, setCleanDcs] = useState<CleanDcProvisionNode[]>(INITIAL_CLEAN_DCS);
  const [krbtgtPhases, setKrbtgtPhases] = useState<KrbtgtRollPhase[]>(INITIAL_KRBTGT_PHASES);
  const [gpoFindings, setGpoFindings] = useState<MaliciousGpoFinding[]>(INITIAL_GPO_FINDINGS);
  const [activeTab, setActiveTab] = useState<"CLEAN_FACTORY" | "KRBTGT_ROLL" | "GPO_SANITIZER" | "FOREST_TOPOLOGY">("CLEAN_FACTORY");
  const [isRollingKrbtgt, setIsRollingKrbtgt] = useState(false);
  const [rollStep, setRollStep] = useState(3);
  const [rollLog, setRollLog] = useState<string[]>([]);
  const [isSanitizingGpo, setIsSanitizingGpo] = useState(false);

  const handleExecuteKrbtgtRoll = () => {
    setIsRollingKrbtgt(true);
    setRollLog([
      `[00:00] Initiating KRBTGT Double-Roll Pipeline on DC01-RECOVERY...`,
      `[00:08] Reset-ADAccountPassword 'krbtgt' -PassThru -RollType PrimaryKey... [Roll #1 COMPLETE]`,
      `[00:20] Engaging Time-Skew Clock Acceleration (10-hour Kerberos TGT lifetime expired in 45s)...`,
      `[00:48] Purging local Kerberos credential tickets via klist purge /li 0x3e7...`,
      `[01:15] Executing KRBTGT Roll #2 (Invalidating secondary key to terminate all forged Golden Tickets)...`
    ]);

    setTimeout(() => {
      setRollLog(prev => [
        ...prev,
        `[01:45] Repadmin /syncall DC01-RECOVERY DC=mercy,DC=local /e /d /A /P /q... All DCs synchronized!`,
        `[02:10] GOLDEN TICKET PURGE VERIFIED: 100% of rogue Kerberos sessions invalidated across AD Forest.`
      ]);
      setKrbtgtPhases(prev =>
        prev.map(p => ({ ...p, status: "COMPLETED" }))
      );
      setIsRollingKrbtgt(false);
    }, 2000);
  };

  const handleSanitizeGpo = (gpoId: string) => {
    setGpoFindings(prev =>
      prev.map(g => (g.id === gpoId ? { ...g, cleared: true } : g))
    );
  };

  const handleSanitizeAllGpos = () => {
    setIsSanitizingGpo(true);
    setTimeout(() => {
      setGpoFindings(prev => prev.map(g => ({ ...g, cleared: true })));
      setIsSanitizingGpo(false);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 24px", minHeight: "calc(100vh - 54px)" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(168,85,247,0.06) 50%, rgba(14,21,38,0.9) 100%)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 10,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "linear-gradient(135deg, #10b981 0%, #a855f7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(16,185,129,0.4)"
          }}>
            <Server size={24} color="#070b12" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: "#f8fafc" }}>
                Automated Active Directory Forest Disaster Recovery (AD-FDR) Stager
              </h1>
              <span style={{
                background: "rgba(16,185,129,0.2)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.4)",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 800,
                fontFamily: "monospace"
              }}>
                TIER-0 AIR-GAP
              </span>
              <span style={{
                background: "rgba(168,85,247,0.18)",
                color: "#a855f7",
                border: "1px solid rgba(168,85,247,0.4)",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "monospace"
              }}>
                &lt; 3 MIN KRBTGT DOUBLE-ROLL
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 3 }}>
              Isolated bare-metal Domain Controller factory, accelerated KRBTGT double-roll Kerberos invalidator, and automated GPO/Tombstone sanitizer for ransomware-tainted Active Directory forests.
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleExecuteKrbtgtRoll}
            disabled={isRollingKrbtgt}
            style={{
              background: isRollingKrbtgt ? "rgba(245,158,11,0.2)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: isRollingKrbtgt ? "1px solid #f59e0b" : "none",
              color: isRollingKrbtgt ? "#f59e0b" : "#04100c",
              padding: "9px 18px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 800,
              cursor: isRollingKrbtgt ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 0 16px rgba(16,185,129,0.35)",
              transition: "all 0.2s ease"
            }}
          >
            {isRollingKrbtgt ? <RefreshCw size={15} className="animate-spin" /> : <KeyRound size={15} />}
            <span>{isRollingKrbtgt ? "ROLLING KRBTGT KEYS..." : "Execute KRBTGT Double-Roll"}</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>CLEAN DC FACTORY</span>
            <ShieldCheck size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>3 DCs Staged</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Airgap VLAN 994 (Isolated)</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>KRBTGT ROLL DURATION</span>
            <Zap size={14} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#06b6d4", marginTop: 4 }}>2m 10s</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>vs 10h standard manual skew</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>GOLDEN TICKETS PURGED</span>
            <Lock size={14} color="#a855f7" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#a855f7", marginTop: 4 }}>4,890 / 4,890</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>100% PAC hash revocation</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>GPO SANITIZATION</span>
            <Trash2 size={14} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b", marginTop: 4 }}>
            {gpoFindings.filter(g => g.cleared).length} / {gpoFindings.length} Cleared
          </div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Scheduled tasks & trusts</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>FOREST HEALTH SCORE</span>
            <Activity size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>98.6% RCI</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Ready for production rejoin</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        {[
          { id: "CLEAN_FACTORY", label: "Clean DC Bare-Metal Factory", icon: Server },
          { id: "KRBTGT_ROLL", label: "Automated KRBTGT Double-Roll Sequence", icon: KeyRound },
          { id: "GPO_SANITIZER", label: "Malicious GPO & Tombstone Scrubber", icon: Trash2 },
          { id: "FOREST_TOPOLOGY", label: "Air-Gapped Forest Replication Map", icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                color: active ? "#10b981" : "var(--fg-2)",
                background: active ? "rgba(16,185,129,0.12)" : "transparent",
                border: active ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                cursor: "pointer"
              }}
            >
              <Icon size={14} color={active ? "#10b981" : "var(--muted)"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Clean DC Bare-Metal Factory */}
      {activeTab === "CLEAN_FACTORY" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                  ISOLATED DOMAIN CONTROLLER PROVISIONING NODES
                </span>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Restored from clean Install-from-Media (IFM) snapshots inside isolated hypervisor micro-segments.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cleanDcs.map(dc => (
                <div key={dc.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#10b981" }}>
                        {dc.hostname}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>({dc.ipAddress})</span>
                    </div>
                    <span className={`badge-sev ${dc.provisionStatus === "PROVISIONED_CLEAN" ? "badge-success" : "badge-medium"}`}>
                      {dc.provisionStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {dc.fsmoRoles.map((role, rIdx) => (
                      <span key={rIdx} style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)" }}>
                        {role}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 10.5, background: "rgba(0,0,0,0.2)", padding: "6px 10px", borderRadius: 4 }}>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Snapshot: </span>
                      <span style={{ color: "var(--fg-2)" }}>{dc.ifmSnapshotDate.split(" ")[0]}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Airgap VLAN: </span>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>VLAN {dc.airgapVlan}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Sanitized Admins: </span>
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>{dc.adminCountSanitized} Accounts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Sidecard */}
          <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)" }}>AIR-GAP FACTORY SAFEGUARDS</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.5 }}>
              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, border: "1px solid var(--border)" }}>
                <strong style={{ color: "#10b981" }}>1. DSRM Mode Isolation:</strong> DCs are booted into Directory Services Restore Mode with network interfaces mapped strictly to a non-routable internal bridge.
              </div>
              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, border: "1px solid var(--border)" }}>
                <strong style={{ color: "#06b6d4" }}>2. Metadata Cleansing:</strong> Dead domain controllers and compromised replication links are stripped via automated <code style={{ color: "var(--fg)" }}>ntdsutil</code> metadata cleanup.
              </div>
              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, border: "1px solid var(--border)" }}>
                <strong style={{ color: "#a855f7" }}>3. RID Pool Invalidation:</strong> Prevents duplicate SID issuance by resetting the RID allocation pool baseline by +100,000.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KRBTGT Double-Roll Sequence */}
      {activeTab === "KRBTGT_ROLL" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                  KERBEROS GOLDEN TICKET INVALIDATION PIPELINE
                </span>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Accelerates the 10-hour Kerberos TGT lifetime window into &lt; 3 minutes using controlled time-skew injection.
                </div>
              </div>

              <button
                onClick={handleExecuteKrbtgtRoll}
                disabled={isRollingKrbtgt}
                style={{
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.4)",
                  color: "#10b981",
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: isRollingKrbtgt ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <RefreshCw size={13} />
                <span>Re-Execute Double Roll</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {krbtgtPhases.map((phase) => (
                <div key={phase.phaseIndex} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: phase.status === "COMPLETED" ? "#10b981" : "#f59e0b", color: "#070b12", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {phase.phaseIndex}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: "#f8fafc" }}>{phase.title}</span>
                    </div>
                    <span className={`badge-sev ${phase.status === "COMPLETED" ? "badge-success" : "badge-high"}`}>
                      {phase.status}
                    </span>
                  </div>

                  <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.4, margin: 0 }}>
                    {phase.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)", background: "rgba(0,0,0,0.2)", padding: "6px 10px", borderRadius: 4 }}>
                    <span>Target: <strong style={{ color: "#06b6d4" }}>{phase.targetDc}</strong></span>
                    <span>Skew Acceleration: <strong style={{ color: "#10b981" }}>{phase.timeSkewAcceleratedSec}s elapsed</strong></span>
                    <span>Tickets Invalidated: <strong style={{ color: "#a855f7" }}>{phase.kerberosTicketsPurged}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Console Log */}
          <div className="card-tactical" style={{ padding: 14, background: "#050912", border: "1px solid rgba(16,185,129,0.3)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#10b981" }}>
              <Terminal size={13} />
              <span>KERBEROS REVOCATION TELEMETRY</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "monospace", fontSize: 10.5, color: "#cbd5e1", maxHeight: 380, overflowY: "auto" }}>
              {rollLog.length > 0 ? (
                rollLog.map((l, i) => <div key={i} style={{ color: l.includes("COMPLETE") || l.includes("VERIFIED") ? "#10b981" : "#cbd5e1" }}>{l}</div>)
              ) : (
                <div style={{ color: "var(--muted)" }}>Click 'Execute KRBTGT Double-Roll' to initiate accelerated Kerberos revocation sequence.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Malicious GPO & Tombstone Scrubber */}
      {activeTab === "GPO_SANITIZER" && (
        <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                MALICIOUS GPO PREFERENCES, TRUSTS & TOMBSTONE OBJECTS
              </span>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Identifies persistence backdoors embedded into Group Policy before promoting recovered forest to production.
              </div>
            </div>

            <button
              onClick={handleSanitizeAllGpos}
              disabled={isSanitizingGpo}
              style={{
                background: "rgba(244,63,94,0.15)",
                border: "1px solid rgba(244,63,94,0.4)",
                color: "#f43f5e",
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              {isSanitizingGpo ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
              <span>Sanitize All Rogue Artifacts</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {gpoFindings.map((gpo) => (
              <div key={gpo.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>{gpo.gpoName}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{gpo.guid}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={`badge-sev ${gpo.severity === "CRITICAL" ? "badge-critical" : "badge-high"}`}>
                      {gpo.threatType.replace(/_/g, " ")}
                    </span>
                    {gpo.cleared ? (
                      <span className="badge-sev badge-success">CLEARED & REMOVED</span>
                    ) : (
                      <button
                        onClick={() => handleSanitizeGpo(gpo.id)}
                        style={{
                          background: "rgba(16,185,129,0.15)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          color: "#10b981",
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 10.5,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Strip Artifact
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.4, margin: 0 }}>
                  {gpo.details}
                </p>

                <div style={{ background: "#050912", padding: "6px 10px", borderRadius: 4, fontFamily: "monospace", fontSize: 10.5, color: "#06b6d4" }}>
                  {gpo.remediationCommand}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Forest Topology Map */}
      {activeTab === "FOREST_TOPOLOGY" && (
        <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
            AIR-GAPPED RECOVERY FOREST TOPOLOGY & REPLICATION TOPOLOGY
          </span>
          <div style={{ background: "#040711", border: "1px solid var(--border)", borderRadius: 8, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid #10b981", padding: "10px 20px", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#10b981" }}>DC01-RECOVERY (Primary Forest Root)</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>FSMO Roles: PDC, RID, Schema, Naming · Airgap VLAN 994</div>
            </div>

            <div style={{ width: 2, height: 24, background: "#10b981" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, width: "100%", maxWidth: 640 }}>
              <div style={{ background: "rgba(6,182,212,0.15)", border: "1px solid #06b6d4", padding: "10px 16px", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#06b6d4" }}>DC02-RECOVERY (Replica)</div>
                <div style={{ fontSize: 9.5, color: "var(--muted)" }}>Global Catalog · Airgap VLAN 994</div>
              </div>

              <div style={{ background: "rgba(168,85,247,0.15)", border: "1px solid #a855f7", padding: "10px 16px", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#a855f7" }}>DC03-RODC (Clinical Branch)</div>
                <div style={{ fontSize: 9.5, color: "var(--muted)" }}>Read-Only Domain Controller · Airgap VLAN 998</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
