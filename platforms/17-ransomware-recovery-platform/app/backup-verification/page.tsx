"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HardDrive,
  ShieldCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Cpu,
  Layers,
  Database,
  Cloud,
  Terminal,
  Download,
  Calendar,
  Zap,
  Check,
  Sliders,
  Server,
  FileCheck,
  TrendingUp,
  RefreshCw,
  Box
} from "lucide-react";
import { MOCK_CASES, MOCK_BACKUP_SOURCES } from "@/data/recoveryData";
import {
  BackupDrillTest,
  BackupStorageTierStats
} from "@/types/recovery";

const MOCK_STORAGE_TIERS: BackupStorageTierStats[] = [
  {
    tierName: "AWS S3 Object Lock (Immutable Cloud Vault)",
    type: "Immutable Cloud WORM Bucket",
    totalTB: 145.8,
    immutabilityMode: "WORM_COMPLIANCE",
    avgThroughputGBMin: 22.4,
    meanRTOHours: 2.8,
    targetRTOHours: 4.0,
    complianceRatePct: 99.8,
    lastDrillSuccess: true
  },
  {
    tierName: "ZFS Storage SAN (CoW Snapshots)",
    type: "On-Premises Read-Only Snapshots",
    totalTB: 280.0,
    immutabilityMode: "ZFS_READONLY",
    avgThroughputGBMin: 48.0,
    meanRTOHours: 0.9,
    targetRTOHours: 1.5,
    complianceRatePct: 99.2,
    lastDrillSuccess: true
  },
  {
    tierName: "Pure Storage SafeMode FlashArray",
    type: "Hardware-Locked Flash Volume",
    totalTB: 85.0,
    immutabilityMode: "SAFE_MODE_LOCK",
    avgThroughputGBMin: 64.5,
    meanRTOHours: 1.2,
    targetRTOHours: 2.0,
    complianceRatePct: 100.0,
    lastDrillSuccess: true
  },
  {
    tierName: "Iron Mountain LTO-8 Tape Archive",
    type: "Physical Air-Gapped Media",
    totalTB: 500.0,
    immutabilityMode: "PHYSICAL_AIRGAP",
    avgThroughputGBMin: 9.8,
    meanRTOHours: 14.5,
    targetRTOHours: 24.0,
    complianceRatePct: 100.0,
    lastDrillSuccess: true
  }
];

const INITIAL_DRILLS: BackupDrillTest[] = [
  {
    id: "drill-001",
    drillName: "Daily Automated SQL-CLINICAL Micro-VM Restore & DBCC Drill",
    backupSourceId: "bak-001",
    sourceType: "AWS_S3_OBJECT_LOCK",
    storageLocation: "s3://aegis-immutable-vault-us-east-1/sql-prod/2026-08-23/",
    snapshotTimestamp: "2026-08-23T04:00:00Z",
    frequency: "DAILY_AUTOMATED",
    status: "PASSED",
    sandboxMicroVmId: "vm-sandbox-sandboxed-8821a",
    vmBootTimeSec: 14.2,
    dbccCheckDbResult: "PASSED_0_ERRORS",
    totalDataSizeGB: 1840,
    restoreThroughputGBMin: 18.4,
    actualRTOMinutes: 102,
    targetRTOMinutes: 120,
    slaVarianceMinutes: -18,
    sha256MerkleRoot: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    lastRunTimestamp: "2026-08-23T05:42:00Z",
    nextRunTimestamp: "2026-08-24T04:00:00Z",
    testLogs: [
      "[05:00:01] Spawning isolated Firecracker micro-VM (CPU: 16 cores, RAM: 64GB, Net: zero-route airgap)...",
      "[05:00:15] Micro-VM kernel boot verified (14.2s). Attaching S3 Object Lock snapshot stream...",
      "[05:18:40] Streaming 1.84 TB volume chunks with direct TLS 1.3 acceleration (18.4 GB/min)...",
      "[05:32:10] Ingest completed. Mounting SQL Server engine and attaching MDF/LDF database files...",
      "[05:33:00] Executing DBCC CHECKDB(PatientRecordsDB) WITH NO_INFOMSGS, ALL_ERRORMSGS...",
      "[05:41:45] DBCC CHECKDB finished: 0 allocation errors and 0 consistency errors reported.",
      "[05:42:00] Cryptographic Merkle tree validated against pre-incident ledger. Clean certified."
    ]
  },
  {
    id: "drill-002",
    drillName: "ZFS SAN Core Domain Controller DC01 Point-in-Time Mount",
    backupSourceId: "bak-002",
    sourceType: "ZFS_SNAPSHOT",
    storageLocation: "zpool-sandstore/dc01-snapshots@20260823-0000",
    snapshotTimestamp: "2026-08-23T00:00:00Z",
    frequency: "DAILY_AUTOMATED",
    status: "PASSED",
    sandboxMicroVmId: "vm-sandbox-sandboxed-9041b",
    vmBootTimeSec: 8.6,
    dbccCheckDbResult: "PASSED_0_ERRORS",
    totalDataSizeGB: 340,
    restoreThroughputGBMin: 42.5,
    actualRTOMinutes: 18,
    targetRTOMinutes: 30,
    slaVarianceMinutes: -12,
    sha256MerkleRoot: "f84a861d84b802619f71c42f02213192080a2b0e8b1b22e172a3928a6f4236a1",
    lastRunTimestamp: "2026-08-23T01:18:00Z",
    nextRunTimestamp: "2026-08-24T00:00:00Z",
    testLogs: [
      "[01:00:00] Cloning read-only ZFS snapshot zpool-sandstore/dc01-snapshots@20260823-0000...",
      "[01:00:04] CoW snapshot clone instantaneous (4s). Booting Hyper-V isolated sandbox partition...",
      "[01:08:20] Active Directory NTDS.dit database integrity check initiated via esentutl /g...",
      "[01:16:50] esentutl integrity: Database is CLEAN SHUTDOWN with 0 corrupted B-tree leaves.",
      "[01:18:00] Simulated Kerberos KDC authentication drill: 100/100 test credentials authenticated successfully."
    ]
  },
  {
    id: "drill-003",
    drillName: "PACS Medical Imaging High-Capacity SAN Tier Test",
    backupSourceId: "bak-003",
    sourceType: "PURE_STORAGE_FLASH",
    storageLocation: "pure-flashblade-san-01://volume-pacs-vault-replica",
    snapshotTimestamp: "2026-08-22T22:00:00Z",
    frequency: "HOURLY",
    status: "PASSED",
    sandboxMicroVmId: "vm-sandbox-sandboxed-7744c",
    vmBootTimeSec: 12.1,
    dbccCheckDbResult: "PASSED_0_ERRORS",
    totalDataSizeGB: 4600,
    restoreThroughputGBMin: 52.0,
    actualRTOMinutes: 88,
    targetRTOMinutes: 90,
    slaVarianceMinutes: -2,
    sha256MerkleRoot: "991823abce128371625345718293400192837482910293847561829304128374",
    lastRunTimestamp: "2026-08-23T23:30:00Z",
    nextRunTimestamp: "2026-08-24T01:00:00Z",
    testLogs: [
      "[23:30:00] Initializing 4.6 TB DICOM PACS imaging snapshot clone verification...",
      "[23:30:18] Direct NVMe-oF attachment established. Transfer throughput: 52.0 GB/min...",
      "[23:55:00] Verifying 1.4 million DICOM header checksums and thumbnail indexes...",
      "[23:58:30] 100% verified. 0 bit-rot or encrypted signatures encountered. Checksum verified."
    ]
  }
];

export default function BackupVerificationPage() {
  const [drills, setDrills] = useState<BackupDrillTest[]>(INITIAL_DRILLS);
  const [selectedDrill, setSelectedDrill] = useState<BackupDrillTest>(INITIAL_DRILLS[0]);
  const [isRunningDrill, setIsRunningDrill] = useState(false);
  const [liveThroughput, setLiveThroughput] = useState(18.4);
  const [liveLogs, setLiveLogs] = useState<string[]>(INITIAL_DRILLS[0].testLogs);
  const [drillFrequency, setDrillFrequency] = useState<"HOURLY" | "DAILY" | "WEEKLY">("DAILY");

  const runLiveDrillSimulation = () => {
    setIsRunningDrill(true);
    setLiveLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating On-Demand Sandbox Restore Drill for: ${selectedDrill.drillName}...`,
      `[${new Date().toLocaleTimeString()}] 📦 Provisioning isolated Firecracker Micro-VM container...`,
    ]);

    setTimeout(() => {
      setLiveLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚡ Micro-VM booted in 9.4s. Attaching immutable storage stream: ${selectedDrill.storageLocation}`,
        `[${new Date().toLocaleTimeString()}] 📊 Streaming raw blocks with throughput: ${(Math.random() * 15 + 25).toFixed(1)} GB/min...`
      ]);
      setLiveThroughput(34.2);
    }, 1200);

    setTimeout(() => {
      setLiveLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🔍 Invoking Microsoft SQL DBCC CHECKDB with TABLOCK and EXTENDED_LOGICAL_CHECKS...`,
        `[${new Date().toLocaleTimeString()}] 🛡️ Validating zero-allocation corruptions and zero torn-page anomalies...`
      ]);
    }, 2400);

    setTimeout(() => {
      setLiveLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ DBCC CHECKDB returned: 0 ERRORS FOUND. Database structure is 100% healthy.`,
        `[${new Date().toLocaleTimeString()}] 🔐 SHA-256 Merkle proof verified against immutable ledger. Drill PASSED.`
      ]);
      setIsRunningDrill(false);
      setLiveThroughput(selectedDrill.restoreThroughputGBMin);
    }, 3800);
  };

  const totalCapacityProtectedTB = MOCK_STORAGE_TIERS.reduce((acc, t) => acc + t.totalTB, 0);
  const avgSystemThroughput = (MOCK_STORAGE_TIERS.reduce((acc, t) => acc + t.avgThroughputGBMin, 0) / MOCK_STORAGE_TIERS.length).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1440, margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(16,185,129,0.05) 50%, rgba(14,21,38,0.9) 100%)",
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
            background: "rgba(6,182,212,0.15)",
            border: "1px solid rgba(6,182,212,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <HardDrive size={24} color="var(--cyan)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
                Continuous Backup Verification & Auto-Drills
              </h1>
              <span className="badge-sev badge-medium" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <ShieldCheck size={11} /> STAGE 1: PREPARE
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              Automated daily sandbox restore test scheduler: Spawns isolated micro-VMs from AWS S3 Object Lock & ZFS snapshots, runs DBCC CHECKDB, and certifies actual RTO.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: "var(--surface-2)", padding: 3, borderRadius: 6, border: "1px solid var(--border)" }}>
            {(["HOURLY", "DAILY", "WEEKLY"] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setDrillFrequency(freq)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: drillFrequency === freq ? "var(--cyan)" : "transparent",
                  color: drillFrequency === freq ? "#041014" : "var(--muted)"
                }}
              >
                {freq}
              </button>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={runLiveDrillSimulation}
            disabled={isRunningDrill}
            style={{ fontSize: 12 }}
          >
            <Play size={14} className={isRunningDrill ? "animate-spin" : ""} />
            {isRunningDrill ? "Running Sandbox Drill..." : "Trigger Auto-Drill Now"}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Immutable Capacity
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--cyan)" }}>
              {totalCapacityProtectedTB.toFixed(1)} TB
            </span>
            <span style={{ fontSize: 11.5, color: "var(--primary)" }}>
              100% WORM Locked
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 6 }}>
            Across S3 Object Lock, ZFS Snapshots, & Air-Gapped Tape.
          </p>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Average Restore Throughput
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)" }}>
              {avgSystemThroughput} GB/min
            </span>
            <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
              Direct NVMe/S3
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 6 }}>
            Peak sustained restore transfer rate across all verified tiers.
          </p>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            RTO SLA Compliance
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)" }}>
              99.8%
            </span>
            <span style={{ fontSize: 11.5, color: "#10b981" }}>
              -18 min Ahead of SLA
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 6 }}>
            Target RTO: 2.0 hrs vs Verified Actual: 1.7 hrs.
          </p>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Automated Consistency Check
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>
              DBCC CHECKDB: 0 ERRORS
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            0 allocation or torn page corruptions detected in last 24h.
          </p>
        </div>
      </div>

      {/* Storage Tier Cards Grid */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <Layers size={15} color="var(--primary)" />
          <span>Storage Tiers & Immutability Posture</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {MOCK_STORAGE_TIERS.map((tier, idx) => (
            <div key={idx} className="card-tactical" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{tier.tierName}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{tier.type}</div>
                </div>
                <span className="badge-sev badge-success" style={{ fontSize: 9 }}>
                  {tier.immutabilityMode}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11.5, background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                <div>
                  <span style={{ color: "var(--muted)" }}>Capacity:</span>
                  <div style={{ fontWeight: 700, color: "var(--cyan)" }}>{tier.totalTB} TB</div>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Throughput:</span>
                  <div style={{ fontWeight: 700, color: "var(--primary)" }}>{tier.avgThroughputGBMin} GB/min</div>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Actual RTO:</span>
                  <div style={{ fontWeight: 700, color: "var(--fg)" }}>{tier.meanRTOHours}h (Target: {tier.targetRTOHours}h)</div>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Compliance:</span>
                  <div style={{ fontWeight: 700, color: "var(--primary)" }}>{tier.complianceRatePct}%</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle2 size={12} /> Drill Verified Clean
                </span>
                <span style={{ color: "var(--muted)" }}>Auto-Scheduled: Daily</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Drill Details & Live Sandbox Terminal */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }}>
        {/* Drill Pipeline & Checksum Ledger */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Box size={16} color="var(--cyan)" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>Scheduled Sandbox Drill Jobs</span>
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>3 Scheduled Pipelines</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {drills.map((drill) => {
              const isSelected = selectedDrill.id === drill.id;
              return (
                <div
                  key={drill.id}
                  onClick={() => {
                    setSelectedDrill(drill);
                    setLiveLogs(drill.testLogs);
                  }}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 8,
                    background: isSelected ? "rgba(6,182,212,0.08)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "var(--cyan)" : "var(--border)"}`,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? "var(--cyan)" : "var(--fg)" }}>
                        {drill.drillName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                        {drill.storageLocation}
                      </div>
                    </div>
                    <span className="badge-sev badge-success">
                      {drill.dbccCheckDbResult}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, fontSize: 11, color: "var(--fg-2)" }}>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Size:</span> {drill.totalDataSizeGB} GB
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Boot:</span> {drill.vmBootTimeSec}s
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Rate:</span> {drill.restoreThroughputGBMin} GB/m
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>RTO:</span> {drill.actualRTOMinutes}m
                    </div>
                  </div>

                  {/* Merkle Root Checksum Proof */}
                  <div style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: "#050913",
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "var(--muted)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 380 }}>
                      SHA256 Root: {drill.sha256MerkleRoot}
                    </span>
                    <span style={{ color: "var(--primary)", fontWeight: 700, flexShrink: 0 }}>✓ PROVEN</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal & Micro-VM Log Output */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Terminal size={16} color="var(--primary)" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>Micro-VM Sandbox Execution Stream</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--primary)", fontFamily: "monospace" }}>
                {liveThroughput} GB/min
              </span>
              <span className="badge-sev badge-success">ZERO-ROUTE AIRGAP</span>
            </div>
          </div>

          <div style={{
            flex: 1,
            minHeight: 280,
            background: "#030712",
            borderRadius: 6,
            border: "1px solid var(--border)",
            padding: "14px 16px",
            fontFamily: "Consolas, Menlo, Monaco, monospace",
            fontSize: 11,
            lineHeight: 1.6,
            color: "#34d399",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}>
            {liveLogs.map((log, idx) => (
              <div key={idx} style={{ wordBreak: "break-all" }}>
                {log}
              </div>
            ))}
            {isRunningDrill && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cyan)" }}>
                <RefreshCw size={12} className="animate-spin" />
                <span>Processing Firecracker block snapshot stream...</span>
              </div>
            )}
          </div>

          {/* Drill Performance Summary Bar */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            background: "var(--surface-2)",
            borderRadius: 6,
            fontSize: 11.5
          }}>
            <span style={{ color: "var(--muted)" }}>
              Next Scheduled Automated Drill: Today at 04:00 UTC (In 3h 25m)
            </span>
            <button
              className="btn-secondary"
              style={{ fontSize: 11, padding: "4px 8px" }}
              onClick={() => alert("Verification audit certificate exported as cryptographic PDF.")}
            >
              <Download size={12} /> Export Drill Proof
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
