"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Zap,
  HardDrive,
  Database,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
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
  FileCheck,
  Key
} from "lucide-react";
import { MOCK_BACKUP_SOURCES } from "@/data/recoveryData";
import { BackupReadinessSource } from "@/types/recovery";

interface LockdownControl {
  id: string;
  name: string;
  category: "ACCESS_CONTROL" | "GOVERNANCE_QUORUM" | "RETENTION_POLICY" | "WORM_COMPLIANCE" | "AIRGAP_SNAPSHOT";
  description: string;
  status: "ACTIVE_ENFORCED" | "PENDING_AUDIT" | "DISABLED";
  latencyMs: number;
  criticality: "CRITICAL" | "HIGH";
  verificationHash: string;
}

const INITIAL_CONTROLS: LockdownControl[] = [
  {
    id: "ctrl-1",
    name: "Restrict Administrative Access & Revoke Cloud Tokens",
    category: "ACCESS_CONTROL",
    description: "Temporarily revoke all active backup administrator sessions, invalidate API tokens, and enforce hardware FIDO2 WebAuthn authentication.",
    status: "ACTIVE_ENFORCED",
    latencyMs: 120,
    criticality: "CRITICAL",
    verificationHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    id: "ctrl-2",
    name: "Require Cryptographic Dual-Approval for Deletions",
    category: "GOVERNANCE_QUORUM",
    description: "Enforce 2-of-3 multi-party cryptographic quorum (Incident Commander + CISO + Lead Forensics) for any snapshot modification or purge command.",
    status: "ACTIVE_ENFORCED",
    latencyMs: 95,
    criticality: "CRITICAL",
    verificationHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
  },
  {
    id: "ctrl-3",
    name: "Suspend Destructive Retention Pruning & Cron Tasks",
    category: "RETENTION_POLICY",
    description: "Halt all automated lifecycle expiration rules, backup garbage collection, and synthetic full rollover jobs to prevent attacker-triggered mass purging.",
    status: "ACTIVE_ENFORCED",
    latencyMs: 65,
    criticality: "CRITICAL",
    verificationHash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d"
  },
  {
    id: "ctrl-4",
    name: "Verify Immutable Object Lock Compliance (WORM)",
    category: "WORM_COMPLIANCE",
    description: "Verify AWS S3 Object Lock in Compliance Mode and Pure Storage SafeMode locks with Merkle tree cryptographic proof.",
    status: "ACTIVE_ENFORCED",
    latencyMs: 180,
    criticality: "CRITICAL",
    verificationHash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
  },
  {
    id: "ctrl-5",
    name: "Trigger Instant Offline Air-Gap Snapshots",
    category: "AIRGAP_SNAPSHOT",
    description: "Issue atomic hardware snapshot commands to isolated ZFS pools and dispatch offline LTO-8 tape robotic slot lock.",
    status: "ACTIVE_ENFORCED",
    latencyMs: 310,
    criticality: "CRITICAL",
    verificationHash: "c89efdaa54c0f20c7adf612882df0950f5a951637e0307cd26c81b56cf568e21"
  }
];

export default function BackupLockdownPage() {
  const [isLockdownActive, setIsLockdownActive] = useState<boolean>(true);
  const [controls, setControls] = useState<LockdownControl[]>(INITIAL_CONTROLS);
  const [backupSources, setBackupSources] = useState<BackupReadinessSource[]>(MOCK_BACKUP_SOURCES);
  const [signers, setSigners] = useState<
    { name: string; role: string; approved: boolean; signedAt?: string }[]
  >([
    { name: "Elena Rostova, CISSP", role: "Incident Commander", approved: true, signedAt: "00:32:05 UTC" },
    { name: "Marcus Vance, GCIH", role: "Principal Forensics Lead", approved: true, signedAt: "00:32:12 UTC" },
    { name: "David Chen, CISO", role: "Chief Information Security Officer", approved: false }
  ]);

  const toggleMasterLockdown = () => {
    const nextState = !isLockdownActive;
    setIsLockdownActive(nextState);

    setControls((prev) =>
      prev.map((c) => ({
        ...c,
        status: nextState ? "ACTIVE_ENFORCED" : "DISABLED"
      }))
    );
  };

  const toggleSignerApproval = (name: string) => {
    setSigners((prev) =>
      prev.map((s) => {
        if (s.name === name) {
          const nextApp = !s.approved;
          return {
            ...s,
            approved: nextApp,
            signedAt: nextApp ? new Date().toTimeString().split(" ")[0] + " UTC" : undefined
          };
        }
        return s;
      })
    );
  };

  const approvedCount = signers.filter((s) => s.approved).length;

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
              <Lock size={18} color="var(--primary)" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
              Critical Backup Emergency Lockdown Mode
            </h1>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 4,
                background: isLockdownActive ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)",
                color: isLockdownActive ? "var(--primary)" : "var(--rose)",
                border: `1px solid ${isLockdownActive ? "var(--primary)" : "var(--rose)"}`,
                letterSpacing: "0.06em",
                textTransform: "uppercase"
              }}
            >
              {isLockdownActive ? "DEFENSIVE POSTURE ENGAGED" : "LOCKDOWN INACTIVE"}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 750 }}>
            Instantly places all enterprise backup repositories into an immutable, air-gapped defensive posture when ransomware is suspected, halting deletion commands, revoking admin tokens, and enforcing dual-approval quorum.
          </p>
        </div>

        {/* Master Lockdown Switch */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={toggleMasterLockdown}
            className="btn-primary"
            style={{
              background: isLockdownActive
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
              color: isLockdownActive ? "#02150e" : "#fff",
              fontWeight: 800,
              padding: "10px 20px",
              boxShadow: isLockdownActive
                ? "0 0 20px rgba(16, 185, 129, 0.4)"
                : "0 0 20px rgba(244, 63, 94, 0.4)"
            }}
          >
            {isLockdownActive ? <Lock size={15} /> : <Unlock size={15} />}
            {isLockdownActive ? "EMERGENCY LOCKDOWN ENGAGED" : "ENGAGE EMERGENCY LOCKDOWN"}
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
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>IMMUTABLE VAULT STATUS</span>
            <Lock size={14} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}>100% WORM</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>AWS S3 Compliance Mode Active</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>PROTECTED CAPACITY</span>
            <HardDrive size={14} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--cyan)" }}>415.8 TB</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Across 4 Enterprise Repositories</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>DUAL-APPROVAL QUORUM</span>
            <Key size={14} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--amber)" }}>
            {approvedCount} / 3 Signers
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Quorum 2-of-3 Satisfied</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>TAMPER ATTEMPTS INTERCEPTED</span>
            <ShieldAlert size={14} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--rose)" }}>4 Blocked</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>vssadmin & S3 Delete calls denied</div>
        </div>
      </div>

      {/* Main Grid: 5 Core Lockdown Controls (Left) + Repositories & Quorum Simulator (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        {/* Left: 5 Core Lockdown Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
              🛡️ 5 Core Defensive Lockdown Controls
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {controls.map((ctrl) => {
                const isActive = ctrl.status === "ACTIVE_ENFORCED";
                return (
                  <div
                    key={ctrl.id}
                    style={{
                      background: "var(--surface-2)",
                      border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.35)" : "var(--border)"}`,
                      borderRadius: 8,
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 14
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            padding: "1px 6px",
                            borderRadius: 4,
                            background: "var(--surface)",
                            color: "var(--cyan)"
                          }}
                        >
                          {ctrl.category}
                        </span>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--fg)" }}>{ctrl.name}</span>
                      </div>

                      <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4, marginBottom: 6 }}>
                        {ctrl.description}
                      </p>

                      <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>
                        Attestation Hash: <span style={{ color: "var(--fg-2)" }}>{ctrl.verificationHash.substring(0, 24)}...</span> • Latency: <span style={{ color: "var(--primary)" }}>{ctrl.latencyMs}ms</span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 4,
                        background: isActive ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.05)",
                        color: isActive ? "var(--primary)" : "var(--muted)",
                        textTransform: "uppercase",
                        fontFamily: "monospace",
                        flexShrink: 0
                      }}
                    >
                      {ctrl.status.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backup Repositories Status Table */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
              💾 Protected Backup Repositories
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {backupSources.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)" }}>{b.sourceName}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      Capacity: <strong style={{ color: "var(--cyan)" }}>{b.totalCapacityTB} TB</strong> • Last Clean Snap:{" "}
                      <span style={{ color: "var(--fg-2)" }}>{b.lastSnapshotTime}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: b.isolationStatus === "FULLY_ISOLATED" || b.isolationStatus === "ONLINE_READONLY"
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(244, 63, 94, 0.2)",
                        color: b.isolationStatus === "FULLY_ISOLATED" || b.isolationStatus === "ONLINE_READONLY"
                          ? "var(--primary)"
                          : "var(--rose)"
                      }}
                    >
                      {b.isolationStatus}
                    </span>
                    <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, marginTop: 4 }}>
                      {b.recoveryFeasibilityPct}% Feasible
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Dual-Approval Quorum & Break-Glass Procedures */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quorum Signers */}
          <div className="card-tactical" style={{ padding: 18, border: "1px solid rgba(245, 158, 11, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(245, 158, 11, 0.2)", color: "var(--amber)" }}>
                2-OF-3 DUAL-CUSTODY QUORUM
              </span>
              <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700 }}>
                {approvedCount >= 2 ? "QUORUM MET" : "SIGNATURES NEEDED"}
              </span>
            </div>

            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
              Destructive retention modification and break-glass actions require 2 verified cryptographic signatures.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {signers.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface-2)",
                    border: `1px solid ${s.approved ? "rgba(16, 185, 129, 0.3)" : "var(--border)"}`,
                    borderRadius: 6,
                    padding: "10px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{s.name}</div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)" }}>
                      {s.role} {s.signedAt && `• Signed ${s.signedAt}`}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSignerApproval(s.name)}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 4,
                      background: s.approved ? "rgba(16, 185, 129, 0.2)" : "var(--surface)",
                      color: s.approved ? "var(--primary)" : "var(--muted)",
                      border: `1px solid ${s.approved ? "var(--primary)" : "var(--border)"}`,
                      cursor: "pointer"
                    }}
                  >
                    {s.approved ? "Signed ✓" : "Sign Quorum"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Break-Glass Procedure Card */}
          <div className="card-tactical" style={{ padding: 18, flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--rose)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={15} color="var(--rose)" />
              Break-Glass Emergency Unlock Protocol
            </h3>
            <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.4, marginBottom: 12 }}>
              Overriding immutable lockdown locks generates immutable audit logs sent to legal & insurance compliance vaults.
            </p>
            <button
              className="btn-secondary"
              style={{ width: "100%", justifyContent: "center", color: "var(--rose)", borderColor: "var(--rose)" }}
              onClick={() => alert("Break-Glass protocol requires 3-of-3 quorum and hardware HSM key insertion.")}
            >
              Initiate Break-Glass Quorum (Requires HSM Token)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
