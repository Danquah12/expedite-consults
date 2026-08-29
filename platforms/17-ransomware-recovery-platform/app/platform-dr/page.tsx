"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  HardDrive,
  Usb,
  Database,
  RefreshCw,
  Zap,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Download,
  Flame,
  Users,
  Play,
  Layers,
  Key,
  Radio,
  FileCode,
  Server
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

interface ShardSigner {
  id: string;
  name: string;
  role: string;
  shardIndex: string;
  hardwareToken: string;
  hasSubmitted: boolean;
  submittedTime?: string;
}

interface ConfigSnapshot {
  id: string;
  timestamp: string;
  fileName: string;
  sizeMB: number;
  sha256: string;
  tenantsCount: number;
  policyRulesCount: number;
  integrityStatus: "VERIFIED_MATCH" | "VERIFYING" | "CORRUPTED";
}

interface DRChaosDrill {
  id: string;
  name: string;
  description: string;
  targetFailure: string;
  expectedRTO: string;
  lastDrillDate: string;
  status: "PASSED" | "READY" | "RUNNING";
}

const INITIAL_SIGNERS: ShardSigner[] = [
  { id: "sign-1", name: "Elena Rostova, CISSP", role: "Chief Information Security Officer", shardIndex: "Shard #1 (Threshold Key A)", hardwareToken: "YubiKey 5C FIPS (Serial #94821)", hasSubmitted: true, submittedTime: "2026-08-23 23:10 UTC" },
  { id: "sign-2", name: "Marcus Vance, GCIH", role: "Principal Forensics Architect", shardIndex: "Shard #2 (Threshold Key B)", hardwareToken: "YubiKey 5C FIPS (Serial #94822)", hasSubmitted: true, submittedTime: "2026-08-23 23:25 UTC" },
  { id: "sign-3", name: "Dr. Sarah Jenkins", role: "VP Infrastructure & Operations", shardIndex: "Shard #3 (Threshold Key C)", hardwareToken: "Nitrokey 3A NFC (Serial #44012)", hasSubmitted: false },
  { id: "sign-4", name: "Arthur Sterling, Esq.", role: "General Counsel & Compliance", shardIndex: "Shard #4 (Threshold Key D)", hardwareToken: "YubiKey 5 NFC (Serial #88194)", hasSubmitted: false },
  { id: "sign-5", name: "David Kross, GCFA", role: "Senior Malware Researcher", shardIndex: "Shard #5 (Threshold Key E)", hardwareToken: "YubiKey 5C FIPS (Serial #94825)", hasSubmitted: false }
];

const INITIAL_CONFIG_SNAPSHOTS: ConfigSnapshot[] = [
  { id: "snap-01", timestamp: "2026-08-24 00:15:00 UTC", fileName: "aegis_config_state_20260824_0015.sqlite.enc", sizeMB: 42.5, sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", tenantsCount: 8, policyRulesCount: 1420, integrityStatus: "VERIFIED_MATCH" },
  { id: "snap-02", timestamp: "2026-08-23 20:00:00 UTC", fileName: "aegis_config_state_20260823_2000.sqlite.enc", sizeMB: 42.1, sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", tenantsCount: 8, policyRulesCount: 1418, integrityStatus: "VERIFIED_MATCH" },
  { id: "snap-03", timestamp: "2026-08-23 16:00:00 UTC", fileName: "aegis_config_state_20260823_1600.sqlite.enc", sizeMB: 41.8, sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a", tenantsCount: 8, policyRulesCount: 1412, integrityStatus: "VERIFIED_MATCH" }
];

const INITIAL_DRILLS: DRChaosDrill[] = [
  { id: "drill-1", name: "Total Public Cloud Telemetry Outage", description: "Simulates complete loss of AWS/Azure outbound connectivity; tests local standalone offline operations.", targetFailure: "WAN Disconnection", expectedRTO: "< 15 seconds", lastDrillDate: "2026-08-20", status: "PASSED" },
  { id: "drill-2", name: "Master Configuration Database Corruption", description: "Simulates sudden storage controller failure on primary SQLite database; verifies automatic rollback to latest immutable WORM snapshot.", targetFailure: "Storage CRC Error", expectedRTO: "< 45 seconds", lastDrillDate: "2026-08-22", status: "PASSED" },
  { id: "drill-3", name: "Break-Glass Multi-Custodian Quorum Execution", description: "Tests hardware token challenge-response and Shamir 3-of-5 secret reconstruction in zero-connectivity clean room.", targetFailure: "Identity Outage", expectedRTO: "< 3 minutes", lastDrillDate: "2026-08-23", status: "PASSED" }
];

export default function PlatformDRPage() {
  const [activeTab, setActiveTab] = useState<"BREAKGLASS" | "USB" | "SNAPSHOTS" | "DRILLS">("BREAKGLASS");
  const [signers, setSigners] = useState<ShardSigner[]>(INITIAL_SIGNERS);
  const [snapshots, setSnapshots] = useState<ConfigSnapshot[]>(INITIAL_CONFIG_SNAPSHOTS);
  const [drills, setDrills] = useState<DRChaosDrill[]>(INITIAL_DRILLS);
  const [disconnectedAirgapMode, setDisconnectedAirgapMode] = useState(false);
  const [usbBuilding, setUsbBuilding] = useState(false);
  const [usbFlashProgress, setUsbFlashProgress] = useState(0);
  const [runningDrillId, setRunningDrillId] = useState<string | null>(null);
  const [drillLogs, setDrillLogs] = useState<string[]>([]);

  const submittedCount = signers.filter((s) => s.hasSubmitted).length;
  const isQuorumReached = submittedCount >= 3;

  const handleSubmitShard = (signerId: string) => {
    setSigners((prev) =>
      prev.map((s) =>
        s.id === signerId ? { ...s, hasSubmitted: true, submittedTime: "Just now" } : s
      )
    );
  };

  const handleBuildUSB = () => {
    setUsbBuilding(true);
    setUsbFlashProgress(10);
    const interval = setInterval(() => {
      setUsbFlashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUsbBuilding(false);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleRunDrill = (drill: DRChaosDrill) => {
    setRunningDrillId(drill.id);
    setDrillLogs([
      `[INIT] Launching Chaos Drill: ${drill.name}`,
      `[SIM] Injecting artificial fault: ${drill.targetFailure}`,
      `[FAILOVER] Aegis Self-Healing Watchdog activated...`,
      `[REPAIR] Restoring local state from immutable Merkle snapshot...`,
      `[SUCCESS] Platform verified 100% operational in ${drill.expectedRTO}`
    ]);
    setTimeout(() => {
      setRunningDrillId(null);
    }, 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid var(--border)",
          paddingBottom: 16
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--primary)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}
            >
              Stage 8: GOVERN, LEARN & DISCLOSE
            </span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>•</span>
            <span style={{ fontSize: 12, color: "var(--cyan)", fontWeight: 600 }}>
              Aegis Recovery Platform Self-Disaster Recovery
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 10 }}>
            <Lock size={24} color="var(--primary)" />
            Platform Disaster Recovery & Break-Glass Vault
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 850 }}>
            Guarantees high-availability disaster recovery for Aegis Recovery itself: Air-gapped offline rescue USB key failover, immutable SQLite/JSON configuration snapshots, break-glass Shamir 3-of-5 quorum unlocking, and 100% disconnected operation mode.
          </p>
        </div>

        {/* Disconnected Mode Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            onClick={() => setDisconnectedAirgapMode(!disconnectedAirgapMode)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: disconnectedAirgapMode ? "rgba(16, 185, 129, 0.15)" : "var(--surface-2)",
              border: `1px solid ${disconnectedAirgapMode ? "var(--primary)" : "var(--border)"}`,
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            <Radio size={14} color={disconnectedAirgapMode ? "var(--primary)" : "var(--muted)"} />
            <div style={{ fontSize: 11, fontWeight: 700, color: disconnectedAirgapMode ? "var(--primary)" : "var(--fg-2)" }}>
              {disconnectedAirgapMode ? "Disconnected Airgap Mode: ACTIVE" : "Disconnected Airgap Mode: OFF"}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>PLATFORM HA STATE</span>
            <ShieldCheck size={15} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>
            SYNCHRONIZED
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Active-Passive Geo-Cluster (0 ms Lag)
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>BREAK-GLASS QUORUM</span>
            <Users size={15} color={isQuorumReached ? "var(--primary)" : "var(--amber)"} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: isQuorumReached ? "var(--primary)" : "var(--amber)" }}>
            {submittedCount} / 3 Shards Submitted
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            {isQuorumReached ? "QUORUM READY TO UNLOCK" : "2 of 5 Custodians Needed"}
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>OFFLINE RESCUE KEY</span>
            <Usb size={15} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--cyan)" }}>
            READY (FIPS 140-3)
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Portable Rescue OS Flash Synced
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>CONFIG SNAPSHOTS</span>
            <Database size={15} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--purple)" }}>
            100% IMMUTABLE
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            SHA-256 Merkle Signed
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
        <button
          onClick={() => setActiveTab("BREAKGLASS")}
          style={{
            background: activeTab === "BREAKGLASS" ? "var(--surface-2)" : "transparent",
            color: activeTab === "BREAKGLASS" ? "var(--amber)" : "var(--fg-2)",
            border: activeTab === "BREAKGLASS" ? "1px solid var(--amber)" : "1px solid transparent",
            borderRadius: "6px 6px 0 0",
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Lock size={15} />
          Break-Glass Vault & Shamir Quorum ({submittedCount}/3)
        </button>

        <button
          onClick={() => setActiveTab("USB")}
          style={{
            background: activeTab === "USB" ? "var(--surface-2)" : "transparent",
            color: activeTab === "USB" ? "var(--cyan)" : "var(--fg-2)",
            border: activeTab === "USB" ? "1px solid var(--cyan)" : "1px solid transparent",
            borderRadius: "6px 6px 0 0",
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Usb size={15} />
          Air-Gapped Offline USB Key Failover
        </button>

        <button
          onClick={() => setActiveTab("SNAPSHOTS")}
          style={{
            background: activeTab === "SNAPSHOTS" ? "var(--surface-2)" : "transparent",
            color: activeTab === "SNAPSHOTS" ? "var(--purple)" : "var(--fg-2)",
            border: activeTab === "SNAPSHOTS" ? "1px solid var(--purple)" : "1px solid transparent",
            borderRadius: "6px 6px 0 0",
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Database size={15} />
          Immutable SQLite & JSON Config Snapshots
        </button>

        <button
          onClick={() => setActiveTab("DRILLS")}
          style={{
            background: activeTab === "DRILLS" ? "var(--surface-2)" : "transparent",
            color: activeTab === "DRILLS" ? "var(--primary)" : "var(--fg-2)",
            border: activeTab === "DRILLS" ? "1px solid var(--primary)" : "1px solid transparent",
            borderRadius: "6px 6px 0 0",
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Zap size={15} />
          Self-DR Chaos Drills ({drills.length})
        </button>
      </div>

      {/* TAB 1: BREAK-GLASS VAULT & SHAMIR QUORUM */}
      {activeTab === "BREAKGLASS" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card-tactical" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                    3-of-5 Shamir Secret Sharing Quorum Custodians
                  </h3>
                  <p style={{ fontSize: 11.5, color: "var(--muted)" }}>
                    Emergency master credentials for Aegis Recovery can only be decrypted when at least 3 hardware key shards are submitted.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: isQuorumReached ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                    color: isQuorumReached ? "var(--primary)" : "var(--amber)",
                    border: "1px solid var(--border)"
                  }}
                >
                  {isQuorumReached ? "QUORUM ATTAINED" : "AWAITING 1 MORE SHARD"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {signers.map((signer) => (
                  <div
                    key={signer.id}
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      padding: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--fg)" }}>{signer.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{signer.role}</div>
                      <div style={{ fontSize: 10, color: "var(--cyan)", fontFamily: "monospace", marginTop: 2 }}>
                        {signer.shardIndex} • {signer.hardwareToken}
                      </div>
                    </div>

                    <div>
                      {signer.hasSubmitted ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--primary)", fontSize: 11, fontWeight: 700 }}>
                          <CheckCircle2 size={15} />
                          <span>Shard Ingested</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSubmitShard(signer.id)}
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 11 }}
                        >
                          <Key size={13} />
                          Submit Hardware Token Shard
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Unlocked Vault Console */}
          <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>EMERGENCY ROOT ACCESS</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: isQuorumReached ? "var(--primary)" : "var(--amber)", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                {isQuorumReached ? <Unlock size={18} /> : <Lock size={18} />}
                {isQuorumReached ? "Emergency Vault Unlocked" : "Vault Sealed (Quorum Locked)"}
              </h3>
            </div>

            {isQuorumReached ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 6, padding: 12 }}>
                  <div style={{ color: "var(--primary)", fontWeight: 700, marginBottom: 4 }}>Root Decryption Master Key Reconstructed:</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--fg)", wordBreak: "break-all", background: "var(--bg)", padding: 8, borderRadius: 4 }}>
                    AEGIS-MASTER-SEC-9918-X25519-d89f81a74e99c8201a61c
                  </div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                  <div style={{ color: "var(--muted)", fontWeight: 700 }}>Offline Standalone DB Access:</div>
                  <div style={{ color: "var(--cyan)", fontFamily: "monospace", marginTop: 2 }}>sqlite:///var/aegis/offline_master.db (Unlocked)</div>
                </div>

                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>
                  All access and key operations are permanently recorded to immutable hardware WORM audit ledgers.
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                Submit at least 1 more custodian key shard using their FIPS 140-3 hardware token to reconstruct the emergency root decryption key.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AIR-GAPPED OFFLINE USB KEY */}
      {activeTab === "USB" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>PORTABLE BOOTABLE RESCUE OS</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--cyan)", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                <Usb size={18} />
                Offline Aegis Rescue USB Key Builder
              </h3>
            </div>

            <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
              Generates a zero-dependency, bootable Linux/Windows live image packed with static YARA threat scanner binaries, offline ransomware decryptors, and an embedded web console that functions 100% isolated from any external network.
            </p>

            <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Encryption Mode:</span>
                <span style={{ color: "var(--primary)", fontWeight: 700 }}>XTS-AES-256 (FIPS 140-3 Level 3)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Offline Threat Signatures:</span>
                <span style={{ color: "var(--fg)", fontWeight: 700 }}>48,200 YARA Rules + 14 Known Decryptors</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Target Hardware Token:</span>
                <span style={{ color: "var(--cyan)", fontWeight: 700 }}>Kingston IronKey Locker+ 50 (32 GB)</span>
              </div>
            </div>

            {usbBuilding && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "var(--muted)" }}>Flashing portable rescue image...</span>
                  <span style={{ color: "var(--cyan)", fontWeight: 800 }}>{usbFlashProgress}%</span>
                </div>
                <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${usbFlashProgress}%`, height: "100%", background: "var(--cyan)", transition: "width 0.3s ease" }} />
                </div>
              </div>
            )}

            <button onClick={handleBuildUSB} className="btn-primary" disabled={usbBuilding}>
              <Download size={14} />
              {usbBuilding ? "Compiling Portable Rescue Key..." : "Compile & Flash Offline Rescue Image to USB"}
            </button>
          </div>

          <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>Rescue Key Hardware Requirements</h3>
            <ul style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.6, paddingLeft: 16 }}>
              <li>Hardware-encrypted USB drive with physical keypad or FIPS 140-3 controller.</li>
              <li>Read-only physical write-block switch recommended for forensic evidence extraction.</li>
              <li>Pre-seeded with complete offline threat database and Merkle configuration tree.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: IMMUTABLE CONFIG SNAPSHOTS */}
      {activeTab === "SNAPSHOTS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                Cryptographic Immutable SQLite Configuration Snapshots
              </h3>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                Every configuration change, RBAC assignment, and case record is continuously snapshotted and cryptographically sealed with SHA-256 Merkle roots.
              </p>
            </div>

            <button
              onClick={() => {
                const newSnap: ConfigSnapshot = {
                  id: `snap-${Date.now().toString().slice(-3)}`,
                  timestamp: "Just now",
                  fileName: `aegis_config_state_${Date.now().toString().slice(-6)}.sqlite.enc`,
                  sizeMB: 42.6,
                  sha256: "3a8c519d08e8b2b918b91fa8201ac61b8f434346648f6b96df89dda901c5176b",
                  tenantsCount: 8,
                  policyRulesCount: 1422,
                  integrityStatus: "VERIFIED_MATCH"
                };
                setSnapshots(prev => [newSnap, ...prev]);
              }}
              className="btn-primary"
            >
              <Database size={14} />
              Take Instant Immutable Snapshot
            </button>
          </div>

          <div className="card-tactical" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>TIMESTAMP</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>FILE NAME</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>SHA-256 HASH</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>SIZE</th>
                  <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>INTEGRITY</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snap) => (
                  <tr key={snap.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", color: "var(--fg-2)" }}>{snap.timestamp}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--cyan)" }}>{snap.fileName}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 10, color: "var(--muted)" }}>{snap.sha256.slice(0, 24)}...</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>{snap.sizeMB} MB</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ color: "var(--primary)", fontWeight: 800, fontSize: 10 }}>VERIFIED CLEAN</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SELF-DR DRILLS */}
      {activeTab === "DRILLS" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {drills.map((drill) => (
              <div key={drill.id} className="card-tactical" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>{drill.name}</h4>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{drill.description}</div>
                  </div>

                  <button
                    onClick={() => handleRunDrill(drill)}
                    className="btn-secondary"
                    style={{ padding: "4px 10px", fontSize: 11 }}
                    disabled={runningDrillId === drill.id}
                  >
                    <Play size={12} />
                    {runningDrillId === drill.id ? "Running Drill..." : "Launch Chaos Drill"}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, background: "var(--surface-2)", padding: 8, borderRadius: 6, marginTop: 8 }}>
                  <span style={{ color: "var(--muted)" }}>Simulated Target: <strong style={{ color: "var(--amber)" }}>{drill.targetFailure}</strong></span>
                  <span style={{ color: "var(--muted)" }}>Expected RTO: <strong style={{ color: "var(--primary)" }}>{drill.expectedRTO}</strong></span>
                  <span style={{ color: "var(--primary)", fontWeight: 800 }}>LAST DRILL: PASSED</span>
                </div>
              </div>
            ))}
          </div>

          {/* Live Drill Log Stream */}
          <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6 }}>
              <Terminal size={14} color="var(--primary)" />
              Chaos Drill Output Stream
            </h3>

            <div style={{ background: "var(--bg)", padding: 12, borderRadius: 6, fontFamily: "monospace", fontSize: 11, color: "var(--fg-2)", lineHeight: 1.6, minHeight: 180 }}>
              {drillLogs.length > 0 ? (
                drillLogs.map((log, idx) => <div key={idx}>{log}</div>)
              ) : (
                <div style={{ color: "var(--muted)" }}>Awaiting next chaos recovery drill execution...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
