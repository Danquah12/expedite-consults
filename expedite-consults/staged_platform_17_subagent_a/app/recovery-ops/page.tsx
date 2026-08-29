"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  HardDrive,
  Activity,
  Play,
  Pause,
  RotateCw,
  Server,
  Network,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Gauge,
  Sliders,
  Database,
  ArrowRight,
  RefreshCw,
  Power
} from "lucide-react";
import { StorageVolumeRestore, HostRebootSequence } from "@/types/recovery";

export default function RecoveryOpsDesk() {
  const [sanBandwidthLimitMBs, setSanBandwidthLimitMBs] = useState(1200);
  const [currentThroughputMBs, setCurrentThroughputMBs] = useState(842);
  const [isRestoring, setIsRestoring] = useState(true);
  const [activeTab, setActiveTab] = useState<"volumes" | "network" | "sequencer">("volumes");

  // Volumes state
  const [volumes, setVolumes] = useState<StorageVolumeRestore[]>([
    {
      id: "vol-1",
      volumeName: "ZFS-POOL-CLINICAL-01",
      storageType: "ZFS_POOL",
      clusterNode: "SAN-NODE-01.mercy.local",
      totalCapacityTB: 45.0,
      restoredTB: 34.2,
      restoreSpeedMBs: 480,
      progressPct: 76,
      status: "RESTORING",
      sourceSnapshot: "zfs-snap-20260823-040000",
      rtoEstimateMinutes: 48
    },
    {
      id: "vol-2",
      volumeName: "VMFS-ESXI-PACS-DATA",
      storageType: "ESXI_VMFS",
      clusterNode: "VM-CLUSTER-02.mercy.local",
      totalCapacityTB: 80.0,
      restoredTB: 38.4,
      restoreSpeedMBs: 362,
      progressPct: 48,
      status: "RESTORING",
      sourceSnapshot: "vmfs-snap-immutable-s3",
      rtoEstimateMinutes: 142
    },
    {
      id: "vol-3",
      volumeName: "HYPERV-VHDX-BILLING-SQL",
      storageType: "HYPERV_VHDX",
      clusterNode: "HV-NODE-04.mercy.local",
      totalCapacityTB: 12.5,
      restoredTB: 12.5,
      restoreSpeedMBs: 0,
      progressPct: 100,
      status: "VERIFYING_INTEGRITY",
      sourceSnapshot: "vhdx-snap-s3-vault",
      rtoEstimateMinutes: 0
    },
    {
      id: "vol-4",
      volumeName: "PURE-LUN-ORACLE-ERP",
      storageType: "PURE_FLASH",
      clusterNode: "SAN-NODE-03.mercy.local",
      totalCapacityTB: 28.0,
      restoredTB: 0.0,
      restoreSpeedMBs: 0,
      progressPct: 0,
      status: "QUEUED",
      sourceSnapshot: "pure-snap-airgapped-lto8",
      rtoEstimateMinutes: 210
    }
  ]);

  // Host Reboot Sequence
  const [rebootSteps, setRebootSteps] = useState<HostRebootSequence[]>([
    {
      step: 1,
      hostName: "DC01.mercy.local",
      role: "Tier-0 Primary Active Directory Domain Controller",
      tier: "TIER_0",
      preflightCheck: "PASSED",
      status: "POWERED_ON",
      vlanEnclave: "Vlan 990 (Quarantine Sandbox)",
      postRebootHealth: 100
    },
    {
      step: 2,
      hostName: "DC02.mercy.local",
      role: "Tier-0 Secondary Active Directory Domain Controller",
      tier: "TIER_0",
      preflightCheck: "PASSED",
      status: "POWERED_ON",
      vlanEnclave: "Vlan 990 (Quarantine Sandbox)",
      postRebootHealth: 100
    },
    {
      step: 3,
      hostName: "SQL-PROD-01.mercy.local",
      role: "Tier-1 Epic EHR Core Patient Database",
      tier: "TIER_1",
      preflightCheck: "PASSED",
      status: "REBOOTING",
      vlanEnclave: "Vlan 991 (Database Enclave)",
      postRebootHealth: 88
    },
    {
      step: 4,
      hostName: "PACS-ARCHIVE-01.mercy.local",
      role: "Tier-1 Radiology DICOM Archive Engine",
      tier: "TIER_1",
      preflightCheck: "PASSED",
      status: "STAGED_ISOLATED",
      vlanEnclave: "Vlan 992 (Clinical Sandbox)",
      postRebootHealth: 0
    },
    {
      step: 5,
      hostName: "APP-IIS-FARM-01.mercy.local",
      role: "Tier-2 Patient Web Portal & Mobile Backend",
      tier: "TIER_2",
      preflightCheck: "PENDING",
      status: "WAITING_DEPENDENCY",
      vlanEnclave: "Vlan 993 (DMZ Enclave)",
      postRebootHealth: 0
    }
  ]);

  // Real-time jitter simulation
  useEffect(() => {
    if (!isRestoring) return;
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 30) - 15;
      setCurrentThroughputMBs((prev) => Math.max(600, Math.min(sanBandwidthLimitMBs, prev + variation)));
    }, 2000);
    return () => clearInterval(interval);
  }, [isRestoring, sanBandwidthLimitMBs]);

  const handleToggleRestore = () => {
    setIsRestoring(!isRestoring);
  };

  const handleTriggerRebootSequence = () => {
    alert("Deterministic Zero-Trust Reboot Sequence triggered for Tier-1 & Tier-2 nodes.");
    setRebootSteps((prev) =>
      prev.map((step) =>
        step.step === 3
          ? { ...step, status: "POWERED_ON", postRebootHealth: 100 }
          : step.step === 4
          ? { ...step, status: "REBOOTING", postRebootHealth: 65 }
          : step
      )
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#f59e0b", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              STORAGE FABRIC & INFRASTRUCTURE OPS
            </span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontWeight: 700 }}>
              FIBRE CHANNEL 32G · ZFS 2.2 · ESXi 8.0
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
            Recovery Operations Desk & Storage Orchestrator
          </h1>
        </div>

        {/* OPS NAVIGATION TABS */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)", padding: 4, borderRadius: 8, border: "1px solid var(--border)" }}>
          {[
            { id: "volumes", label: "Storage Volumes", icon: HardDrive, count: volumes.length },
            { id: "network", label: "SAN Bandwidth", icon: Gauge, count: `${currentThroughputMBs} MB/s` },
            { id: "sequencer", label: "Reboot Sequencer", icon: Power, count: rebootSteps.length }
          ].map((tab) => {
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
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: active ? "rgba(245,158,11,0.2)" : "transparent",
                  color: active ? "#f59e0b" : "var(--muted)",
                  border: active ? "1px solid rgba(245,158,11,0.4)" : "1px solid transparent"
                }}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
                <span style={{ fontSize: 9.5, padding: "1px 5px", borderRadius: 10, background: "rgba(255,255,255,0.08)", fontFamily: "monospace" }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOP STATUS CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Active Storage Streams
            </span>
            <HardDrive size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 8 }}>
            2 Active <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>/ 4 volumes</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
            Total Payload: 165.5 TB
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Current SAN Egress
            </span>
            <Activity size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 8, fontFamily: "monospace" }}>
            {currentThroughputMBs} <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>MB/s</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#06b6d4", marginTop: 4 }}>
            Cap: {sanBandwidthLimitMBs} MB/s (70% utilization)
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Volume Integrity Check
            </span>
            <ShieldCheck size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 8 }}>
            100% CLEAN
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            Zero SHA-256 Merkle Mismatch
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Tier-0 Identity Status
            </span>
            <Server size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 8 }}>
            DC01 / DC02 ONLINE
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            Enclave Quarantine Active
          </div>
        </div>
      </div>

      {/* TAB 1: STORAGE VOLUME RESTORATION MONITOR */}
      {activeTab === "volumes" && (
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                LIVE STORAGE RESTORATION & BLOCK-LEVEL REPLICATION
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                ZFS pools, Hyper-V VHDX clusters, and ESXi VMFS datastores restoring from immutable snapshots
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleToggleRestore}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: isRestoring ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)",
                  color: isRestoring ? "#f43f5e" : "#10b981",
                  border: isRestoring ? "1px solid #f43f5e" : "1px solid #10b981"
                }}
              >
                {isRestoring ? <Pause size={13} /> : <Play size={13} />}
                <span>{isRestoring ? "Pause Streams" : "Resume Streams"}</span>
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Volume / LUN Name</th>
                  <th>Storage Type</th>
                  <th>Cluster Node</th>
                  <th>Restored / Total</th>
                  <th>Speed</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {volumes.map((vol) => (
                  <tr key={vol.id}>
                    <td style={{ fontWeight: 700, color: "#f8fafc" }}>{vol.volumeName}</td>
                    <td>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 3,
                          fontFamily: "monospace",
                          background: "rgba(245,158,11,0.15)",
                          color: "#f59e0b"
                        }}
                      >
                        {vol.storageType}
                      </span>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 11.5 }}>{vol.clusterNode}</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>
                      {vol.restoredTB.toFixed(1)} / {vol.totalCapacityTB.toFixed(1)} TB
                    </td>
                    <td style={{ fontFamily: "monospace", color: "#06b6d4", fontWeight: 700 }}>
                      {vol.restoreSpeedMBs > 0 ? `${vol.restoreSpeedMBs} MB/s` : "—"}
                    </td>
                    <td style={{ width: 140 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", width: 32 }}>{vol.progressPct}%</span>
                        <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${vol.progressPct}%`, height: "100%", background: vol.progressPct === 100 ? "#10b981" : "#06b6d4", borderRadius: 3 }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 3,
                          background: vol.status === "VERIFYING_INTEGRITY" ? "rgba(16,185,129,0.2)" : vol.status === "RESTORING" ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.05)",
                          color: vol.status === "VERIFYING_INTEGRITY" ? "#10b981" : vol.status === "RESTORING" ? "#06b6d4" : "var(--muted)"
                        }}
                      >
                        {vol.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: "monospace", color: "var(--fg-2)" }}>
                      {vol.rtoEstimateMinutes > 0 ? `${vol.rtoEstimateMinutes}m` : "Ready"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: NETWORK & SAN BANDWIDTH */}
      {activeTab === "network" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
          <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              SAN REPLICATION PIPE SATURATION & QOS CONTROLS
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>
                <span>Bandwidth Throttle Ceiling</span>
                <span style={{ color: "#f59e0b", fontFamily: "monospace" }}>{sanBandwidthLimitMBs} MB/s (10GbE Max 1250 MB/s)</span>
              </div>
              <input
                type="range"
                min={400}
                max={2500}
                step={50}
                value={sanBandwidthLimitMBs}
                onChange={(e) => setSanBandwidthLimitMBs(Number(e.target.value))}
                style={{ width: "100%", marginTop: 8, accentColor: "#f59e0b" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 6 }}>
              <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Fibre Channel 32G Fabric</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981", marginTop: 4 }}>ONLINE (0.00% Packet Loss)</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>Port FC-1/1 & FC-1/2 Multipathed</div>
              </div>

              <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>AWS DirectConnect 10G</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#06b6d4", marginTop: 4 }}>580 MB/s Egress Stream</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>S3 Vault Bucket: us-east-1</div>
              </div>
            </div>
          </div>

          <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              RESTORE QOS PRIORITY MATRIX
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Bandwidth allocation dynamically prioritizes Tier-0 Identity before launching database replication.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { name: "Tier 0: Active Directory & DNS", share: "50% Allocation", color: "#10b981", status: "COMPLETE" },
                { name: "Tier 1: Patient Care & PACS", share: "35% Allocation", color: "#06b6d4", status: "STREAMING" },
                { name: "Tier 2: Business ERP & Billing", share: "15% Allocation", color: "#f59e0b", status: "QUEUED" }
              ].map((item, idx) => (
                <div key={idx} style={{ padding: 10, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc" }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{item.share}</div>
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 3, background: "rgba(255,255,255,0.06)", color: item.color }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HOST REBOOT SEQUENCER */}
      {activeTab === "sequencer" && (
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                ZERO-TRUST DETERMINISTIC HOST REBOOT PIPELINE
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Strict dependency order: Identity (Tier-0) → Database (Tier-1) → Middleware & App Servers (Tier-2)
              </div>
            </div>
            <button onClick={handleTriggerRebootSequence} className="btn-primary" style={{ fontSize: 12 }}>
              <Power size={13} />
              <span>Step Next Reboot Stage</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rebootSteps.map((host) => (
              <div
                key={host.step}
                style={{
                  padding: "12px 14px",
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontFamily: "monospace",
                      color: "#f59e0b"
                    }}
                  >
                    0{host.step}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: "#f8fafc", fontFamily: "monospace" }}>{host.hostName}</span>
                      <span style={{ fontSize: 9.5, padding: "1px 5px", borderRadius: 3, background: "rgba(255,255,255,0.06)", fontFamily: "monospace" }}>
                        {host.tier}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {host.role} · <span style={{ color: "#06b6d4" }}>{host.vlanEnclave}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase" }}>Pre-flight Check</div>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: host.preflightCheck === "PASSED" ? "#10b981" : "#f59e0b" }}>
                      {host.preflightCheck}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontFamily: "monospace",
                      background: host.status === "POWERED_ON" ? "rgba(16,185,129,0.2)" : host.status === "REBOOTING" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
                      color: host.status === "POWERED_ON" ? "#10b981" : host.status === "REBOOTING" ? "#f59e0b" : "var(--muted)"
                    }}
                  >
                    {host.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
