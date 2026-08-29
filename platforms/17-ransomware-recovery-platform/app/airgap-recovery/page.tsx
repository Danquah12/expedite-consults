"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  HardDrive,
  Radio,
  Sliders,
  Terminal,
  Activity,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Layers,
  Flame,
  ArrowRight,
  Eye,
  GitBranch,
  Key,
  Users,
  Database,
  Play
} from "lucide-react";
import { MOCK_CASES, MOCK_BACKUP_SOURCES } from "@/data/recoveryData";

interface IREZoneConfig {
  id: string;
  name: string;
  vlanTag: number;
  vSwitch: string;
  hypervisorCluster: string;
  isolationLevel: "TRUE_AIRGAP_DISCONNECTED" | "MICROSEGMENTED_QUARANTINE" | "DIODE_ONE_WAY_EGRESS" | "CANARY_DMZ";
  status: "READY" | "ACTIVE_ANALYSIS" | "FAILSAFE_ISOLATED" | "PROVISIONING";
  activeHostsCount: number;
  allocatedCores: number;
  allocatedRAMGB: number;
  allocatedStorageTB: number;
  wormStorageAttached: boolean;
  canaryTripwiresArmed: boolean;
}

interface JumpBoxSessionItem {
  id: string;
  analyst: string;
  role: string;
  ipAddress: string;
  targetHost: string;
  targetZone: string;
  mfaVerified: boolean;
  dualSignerApproval: string;
  sessionStarted: string;
  durationMinutes: number;
  kernelKeyloggerActive: boolean;
  status: "ACTIVE" | "TERMINATED" | "IDLE";
}

interface CleanRoomRebuildItem {
  id: string;
  vmName: string;
  goldenImageBaseline: string;
  osType: "Windows Server 2022" | "Windows Server 2019" | "RHEL 9.2" | "Ubuntu 22.04 LTS";
  slipstreamPatchesCount: number;
  firmwareVerification: "PASSED_TPM2_SECUREBOOT" | "FIRMWARE_VERIFIED" | "PENDING_CHECK";
  driverSignatureEnforced: boolean;
  progressPct: number;
  status: "BUILDING" | "SCANNING_YARA" | "VERIFYING_INTEGRITY" | "CERTIFIED_CLEAN" | "FAILED";
  assignedEngineer: string;
  rtoMinutesRemaining: number;
}

const INITIAL_ZONES: IREZoneConfig[] = [
  {
    id: "zone-101",
    name: "IRE Enclave Alpha (Quarantine Core)",
    vlanTag: 4094,
    vSwitch: "vSwitch-Airgap-IRE-01",
    hypervisorCluster: "Cluster-Nutanix-Forensic-01",
    isolationLevel: "TRUE_AIRGAP_DISCONNECTED",
    status: "ACTIVE_ANALYSIS",
    activeHostsCount: 14,
    allocatedCores: 64,
    allocatedRAMGB: 256,
    allocatedStorageTB: 45.0,
    wormStorageAttached: true,
    canaryTripwiresArmed: true
  },
  {
    id: "zone-102",
    name: "IRE Clean-Room Image Factory",
    vlanTag: 4093,
    vSwitch: "vSwitch-Golden-Build-02",
    hypervisorCluster: "Cluster-ESXi-CleanRoom-01",
    isolationLevel: "MICROSEGMENTED_QUARANTINE",
    status: "READY",
    activeHostsCount: 6,
    allocatedCores: 32,
    allocatedRAMGB: 128,
    allocatedStorageTB: 20.0,
    wormStorageAttached: true,
    canaryTripwiresArmed: true
  },
  {
    id: "zone-103",
    name: "IRE Production Gateway Transition DMZ",
    vlanTag: 4092,
    vSwitch: "vSwitch-Gateway-DMZ-03",
    hypervisorCluster: "Cluster-HyperV-Bridge-01",
    isolationLevel: "DIODE_ONE_WAY_EGRESS",
    status: "READY",
    activeHostsCount: 4,
    allocatedCores: 32,
    allocatedRAMGB: 128,
    allocatedStorageTB: 15.0,
    wormStorageAttached: false,
    canaryTripwiresArmed: true
  }
];

const INITIAL_JUMPBOX_SESSIONS: JumpBoxSessionItem[] = [
  {
    id: "jb-001",
    analyst: "Marcus Vance, GCIH",
    role: "Principal Forensics Investigator",
    ipAddress: "10.99.1.14",
    targetHost: "DC01-RESTORE.ire.local",
    targetZone: "IRE Enclave Alpha",
    mfaVerified: true,
    dualSignerApproval: "Elena Rostova (CISO)",
    sessionStarted: "2026-08-23 22:15 UTC",
    durationMinutes: 135,
    kernelKeyloggerActive: true,
    status: "ACTIVE"
  },
  {
    id: "jb-002",
    analyst: "David Kross, GCFA",
    role: "Senior Malware Reverse Engineer",
    ipAddress: "10.99.1.18",
    targetHost: "SQL-CLINICAL-01.ire.local",
    targetZone: "IRE Enclave Alpha",
    mfaVerified: true,
    dualSignerApproval: "Sarah Jenkins (SecOps)",
    sessionStarted: "2026-08-23 23:40 UTC",
    durationMinutes: 50,
    kernelKeyloggerActive: true,
    status: "ACTIVE"
  }
];

const INITIAL_REBUILD_JOBS: CleanRoomRebuildItem[] = [
  {
    id: "job-01",
    vmName: "DC01-REBUILD-CLEAN",
    goldenImageBaseline: "Win2022-Hardened-CIS-L2-v2026.08",
    osType: "Windows Server 2022",
    slipstreamPatchesCount: 14,
    firmwareVerification: "PASSED_TPM2_SECUREBOOT",
    driverSignatureEnforced: true,
    progressPct: 100,
    status: "CERTIFIED_CLEAN",
    assignedEngineer: "Elena Rostova",
    rtoMinutesRemaining: 0
  },
  {
    id: "job-02",
    vmName: "SQL-PROD-01-CLEAN",
    goldenImageBaseline: "Win2022-MSSQL2022-Hardened-v2026.05",
    osType: "Windows Server 2022",
    slipstreamPatchesCount: 9,
    firmwareVerification: "PASSED_TPM2_SECUREBOOT",
    driverSignatureEnforced: true,
    progressPct: 78,
    status: "VERIFYING_INTEGRITY",
    assignedEngineer: "Marcus Vance",
    rtoMinutesRemaining: 25
  },
  {
    id: "job-03",
    vmName: "PACS-ARCHIVE-NODE-01",
    goldenImageBaseline: "RHEL-9.2-STIG-Compliant-v2026.04",
    osType: "RHEL 9.2",
    slipstreamPatchesCount: 22,
    firmwareVerification: "FIRMWARE_VERIFIED",
    driverSignatureEnforced: true,
    progressPct: 45,
    status: "BUILDING",
    assignedEngineer: "David Kross",
    rtoMinutesRemaining: 55
  }
];

export default function AirgapRecoveryPage() {
  const [zones, setZones] = useState<IREZoneConfig[]>(INITIAL_ZONES);
  const [jumpboxSessions, setJumpboxSessions] = useState<JumpBoxSessionItem[]>(INITIAL_JUMPBOX_SESSIONS);
  const [rebuildJobs, setRebuildJobs] = useState<CleanRoomRebuildItem[]>(INITIAL_REBUILD_JOBS);
  const [activeTab, setActiveTab] = useState<"TOPOLOGY" | "JUMPBOX" | "REBUILDER" | "GATEWAY" | "TELEMETRY">("TOPOLOGY");
  const [gatewayState, setGatewayState] = useState<"TOTAL_AIRGAP" | "DIODE_EGRESS" | "CANARY_DMZ" | "FULL_CUTOVER">("TOTAL_AIRGAP");
  const [emergencyCutActive, setEmergencyCutActive] = useState(false);
  const [spawnModal, setSpawnModal] = useState(false);
  const [newAnalystName, setNewAnalystName] = useState("");
  const [newTargetHost, setNewTargetHost] = useState("");
  const [simulatingRebuild, setSimulatingRebuild] = useState(false);

  // Gatekeeper checks for production gateway
  const [gateChecklist, setGateChecklist] = useState({
    forensicSignoff: true,
    canaryTripwiresClean: true,
    krbtgtDoubleRolled: true,
    executiveDualCustody: false
  });

  const handleEmergencyAirgapSever = () => {
    setEmergencyCutActive(true);
    setGatewayState("TOTAL_AIRGAP");
    setZones((prev) =>
      prev.map((z) => ({
        ...z,
        status: "FAILSAFE_ISOLATED",
        isolationLevel: "TRUE_AIRGAP_DISCONNECTED"
      }))
    );
  };

  const handleSpawnJumpbox = () => {
    if (!newAnalystName || !newTargetHost) return;
    const newSession: JumpBoxSessionItem = {
      id: `jb-${Date.now().toString().slice(-3)}`,
      analyst: newAnalystName,
      role: "DFIR Forensic Specialist",
      ipAddress: `10.99.1.${Math.floor(Math.random() * 50 + 20)}`,
      targetHost: newTargetHost,
      targetZone: "IRE Enclave Alpha",
      mfaVerified: true,
      dualSignerApproval: "Automated Ephemeral Bastion Policy",
      sessionStarted: "Just now",
      durationMinutes: 1,
      kernelKeyloggerActive: true,
      status: "ACTIVE"
    };
    setJumpboxSessions((prev) => [newSession, ...prev]);
    setSpawnModal(false);
    setNewAnalystName("");
    setNewTargetHost("");
  };

  const handleTriggerRebuild = () => {
    setSimulatingRebuild(true);
    setTimeout(() => {
      setSimulatingRebuild(false);
      setRebuildJobs((prev) =>
        prev.map((j) =>
          j.status === "BUILDING" ? { ...j, progressPct: 90, status: "VERIFYING_INTEGRITY" } : j
        )
      );
    }, 1200);
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
              Stage 6: RECOVER & ORCHESTRATE
            </span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>•</span>
            <span style={{ fontSize: 12, color: "var(--cyan)", fontWeight: 600 }}>
              Isolated Recovery Environment (IRE) Console
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 10 }}>
            <Server size={24} color="var(--cyan)" />
            Air-Gapped Clean Recovery Zone Orchestrator
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 850 }}>
            Dedicated management plane for Isolated Recovery Environments (IRE): Isolated vSwitch hypervisor routing, zero-trust ephemeral jump-boxes, golden image slipstream rebuilders, and diode-governed production cutover gateways.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleEmergencyAirgapSever}
            style={{
              background: emergencyCutActive ? "rgba(244, 63, 94, 0.2)" : "var(--rose)",
              color: "#fff",
              border: emergencyCutActive ? "1px solid var(--rose)" : "none",
              borderRadius: 6,
              padding: "8px 16px",
              fontWeight: 800,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(244, 63, 94, 0.3)"
            }}
          >
            <Zap size={14} />
            {emergencyCutActive ? "FAILSAFE AIRGAP ACTIVE" : "EMERGENCY TOTAL AIRGAP SEVER"}
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>IRE STATUS</span>
            <ShieldCheck size={15} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>
            {emergencyCutActive ? "SEVERED (SAFE)" : "ISOLATED & READY"}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            vSwitch-Airgap (VLAN 4094)
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>ISOLATED CAPACITY</span>
            <Cpu size={15} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--fg)" }}>
            128 <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>vCPU</span> / 512 <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>GB</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            24 Restored VMs Staged
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>ATTACHED WORM STORAGE</span>
            <HardDrive size={15} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--purple)" }}>
            120.0 <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>TB</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Immutable S3 + ZFS Read-Only
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>ACTIVE JUMPBOXES</span>
            <Users size={15} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--amber)" }}>
            {jumpboxSessions.filter(s => s.status === "ACTIVE").length} <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Sessions</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            MFA + Keylogged Bastion
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>GATEWAY DIODE</span>
            <Lock size={15} color={gatewayState === "TOTAL_AIRGAP" ? "var(--rose)" : "var(--primary)"} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: gatewayState === "TOTAL_AIRGAP" ? "var(--rose)" : "var(--primary)" }}>
            {gatewayState.replace("_", " ")}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            0 B/s Egress to Prod
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
        <button
          onClick={() => setActiveTab("TOPOLOGY")}
          style={{
            background: activeTab === "TOPOLOGY" ? "var(--surface-2)" : "transparent",
            color: activeTab === "TOPOLOGY" ? "var(--cyan)" : "var(--fg-2)",
            border: activeTab === "TOPOLOGY" ? "1px solid var(--cyan)" : "1px solid transparent",
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
          <Layers size={15} />
          IRE Zone Topology ({zones.length})
        </button>

        <button
          onClick={() => setActiveTab("JUMPBOX")}
          style={{
            background: activeTab === "JUMPBOX" ? "var(--surface-2)" : "transparent",
            color: activeTab === "JUMPBOX" ? "var(--amber)" : "var(--fg-2)",
            border: activeTab === "JUMPBOX" ? "1px solid var(--amber)" : "1px solid transparent",
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
          <Terminal size={15} />
          Forensic Jump-Boxes ({jumpboxSessions.length})
        </button>

        <button
          onClick={() => setActiveTab("REBUILDER")}
          style={{
            background: activeTab === "REBUILDER" ? "var(--surface-2)" : "transparent",
            color: activeTab === "REBUILDER" ? "var(--purple)" : "var(--fg-2)",
            border: activeTab === "REBUILDER" ? "1px solid var(--purple)" : "1px solid transparent",
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
          <Cpu size={15} />
          Clean-Room Image Rebuilder ({rebuildJobs.length})
        </button>

        <button
          onClick={() => setActiveTab("GATEWAY")}
          style={{
            background: activeTab === "GATEWAY" ? "var(--surface-2)" : "transparent",
            color: activeTab === "GATEWAY" ? "var(--primary)" : "var(--fg-2)",
            border: activeTab === "GATEWAY" ? "1px solid var(--primary)" : "1px solid transparent",
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
          <Radio size={15} />
          Production Gateway Switch
        </button>

        <button
          onClick={() => setActiveTab("TELEMETRY")}
          style={{
            background: activeTab === "TELEMETRY" ? "var(--surface-2)" : "transparent",
            color: activeTab === "TELEMETRY" ? "var(--rose)" : "var(--fg-2)",
            border: activeTab === "TELEMETRY" ? "1px solid var(--rose)" : "1px solid transparent",
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
          <Activity size={15} />
          IRE Security Telemetry
        </button>
      </div>

      {/* TAB 1: IRE TOPOLOGY & ENCLAVES */}
      {activeTab === "TOPOLOGY" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {zones.map((zone) => (
              <div key={zone.id} className="card-tactical" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>{zone.name}</h3>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "var(--surface-2)",
                          color: "var(--cyan)",
                          border: "1px solid var(--border)",
                          fontFamily: "monospace"
                        }}
                      >
                        VLAN {zone.vlanTag}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, fontFamily: "monospace" }}>
                      vSwitch: {zone.vSwitch} • Hypervisor: {zone.hypervisorCluster}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: zone.status === "ACTIVE_ANALYSIS"
                        ? "rgba(16, 185, 129, 0.15)"
                        : "rgba(6, 182, 212, 0.15)",
                      color: zone.status === "ACTIVE_ANALYSIS" ? "var(--primary)" : "var(--cyan)",
                      border: "1px solid var(--border)"
                    }}
                  >
                    {zone.status}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 11 }}>
                  <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                    <div style={{ color: "var(--muted)" }}>Active VMs:</div>
                    <div style={{ fontWeight: 800, color: "var(--fg)", fontSize: 13, marginTop: 2 }}>{zone.activeHostsCount} Nodes</div>
                  </div>

                  <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                    <div style={{ color: "var(--muted)" }}>Compute Cores:</div>
                    <div style={{ fontWeight: 800, color: "var(--fg)", fontSize: 13, marginTop: 2 }}>{zone.allocatedCores} Cores</div>
                  </div>

                  <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                    <div style={{ color: "var(--muted)" }}>Memory RAM:</div>
                    <div style={{ fontWeight: 800, color: "var(--fg)", fontSize: 13, marginTop: 2 }}>{zone.allocatedRAMGB} GB</div>
                  </div>

                  <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                    <div style={{ color: "var(--muted)" }}>WORM Storage:</div>
                    <div style={{ fontWeight: 800, color: zone.wormStorageAttached ? "var(--primary)" : "var(--muted)", fontSize: 13, marginTop: 2 }}>
                      {zone.wormStorageAttached ? "ATTACHED" : "UNMOUNTED"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border-subtle)", fontSize: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--primary)" }}>
                    <CheckCircle2 size={13} />
                    <span>Micro-segmented SDN firewall rules active (0 cross-VLAN leaks)</span>
                  </div>
                  <span style={{ color: "var(--muted)", fontFamily: "monospace" }}>Tripwires: ARMED</span>
                </div>
              </div>
            ))}
          </div>

          {/* IRE Control Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card-tactical" style={{ padding: 16 }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>IRE Network Policy Engine</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--fg)" }}>Gratuitous ARP Filter</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Prevents ARP cache poisoning</div>
                  </div>
                  <span style={{ color: "var(--primary)", fontWeight: 800, fontSize: 11 }}>ENFORCED</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--fg)" }}>DHCP / DNS Snooping</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Disallows rogue C2 resolvers</div>
                  </div>
                  <span style={{ color: "var(--primary)", fontWeight: 800, fontSize: 11 }}>ENFORCED</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--fg)" }}>Egress Data Diode</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Unidirectional packet enforcement</div>
                  </div>
                  <span style={{ color: "var(--rose)", fontWeight: 800, fontSize: 11 }}>BLOCKED</span>
                </div>
              </div>
            </div>

            <div className="card-tactical" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--cyan)", marginBottom: 8 }}>
                WORM Backup Mount Inspector
              </h3>
              <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.4 }}>
                S3 Object Lock & ZFS immutable snapshots are mounted in <strong>Read-Only Block Mode</strong> directly onto IRE hypervisor host bus adapters. Restored disk writes are cached in ephemeral memory overlays (overlayfs) to guarantee zero damage to cold snapshots.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FORENSIC JUMP-BOXES */}
      {activeTab === "JUMPBOX" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                Zero-Trust Ephemeral Bastion Jump-Boxes
              </h3>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                Every analyst access session is strictly bounded by hardware MFA, dual-custody peer signoff, and kernel-level keystroke telemetry.
              </p>
            </div>

            <button onClick={() => setSpawnModal(true)} className="btn-primary">
              <Terminal size={14} />
              Spawn Ephemeral Bastion Jump-Box
            </button>
          </div>

          {/* Spawn Modal */}
          {spawnModal && (
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}
            >
              <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--cyan)" }}>Provision New Ephemeral Bastion Container</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Analyst Name (e.g., Sarah Jenkins, CISM)"
                  value={newAnalystName}
                  onChange={(e) => setNewAnalystName(e.target.value)}
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "8px 12px",
                    color: "var(--fg)",
                    fontSize: 12,
                    outline: "none"
                  }}
                />
                <input
                  type="text"
                  placeholder="Target Host (e.g., SQL-BILLING-02.ire.local)"
                  value={newTargetHost}
                  onChange={(e) => setNewTargetHost(e.target.value)}
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "8px 12px",
                    color: "var(--fg)",
                    fontSize: 12,
                    outline: "none"
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setSpawnModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleSpawnJumpbox} className="btn-primary">Authenticate & Launch Container</button>
              </div>
            </div>
          )}

          {/* Sessions Table */}
          <div className="card-tactical" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>ANALYST & ROLE</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>BASTION IP & TARGET</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>DUAL SIGNER</th>
                  <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>MFA TOKEN</th>
                  <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>KEYLOGGER</th>
                  <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {jumpboxSessions.map((session) => (
                  <tr key={session.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 700, color: "var(--fg)" }}>{session.analyst}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>{session.role}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 700, color: "var(--cyan)", fontFamily: "monospace" }}>{session.targetHost}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>Bastion IP: {session.ipAddress}</div>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--fg-2)" }}>{session.dualSignerApproval}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ color: "var(--primary)", fontWeight: 800, fontSize: 10 }}>FIPS-140 YubiKey</span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ color: "var(--primary)", fontWeight: 800, fontSize: 10 }}>LOGGING (eBPF)</span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "var(--primary)",
                          border: "1px solid rgba(16, 185, 129, 0.3)"
                        }}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CLEAN-ROOM IMAGE REBUILDER */}
      {activeTab === "REBUILDER" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                Clean-Room Golden Image Factory & Patch Slipstreaming
              </h3>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                Rebuild compromised guest OS kernels from cryptographically signed vendor baselines with automatic driver verification and zero-day security slipstreaming.
              </p>
            </div>

            <button onClick={handleTriggerRebuild} className="btn-primary" disabled={simulatingRebuild}>
              <Play size={14} />
              {simulatingRebuild ? "Compiling Slipstream Patches..." : "Execute Automated Rebuild Pipeline"}
            </button>
          </div>

          <div className="card-tactical" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>VM NAME & OS</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>GOLDEN BASELINE</th>
                  <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>FIRMWARE / TPM</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>PROGRESS</th>
                  <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {rebuildJobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 700, color: "var(--fg)" }}>{job.vmName}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>{job.osType}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ color: "var(--cyan)", fontWeight: 600 }}>{job.goldenImageBaseline}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>{job.slipstreamPatchesCount} Slipstream KBs Applied</div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800 }}>TPM 2.0 SecureBoot</span>
                    </td>
                    <td style={{ padding: "10px 12px", width: 220 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                        <span style={{ color: "var(--muted)" }}>Building...</span>
                        <span style={{ color: "var(--primary)", fontWeight: 800 }}>{job.progressPct}%</span>
                      </div>
                      <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${job.progressPct}%`, height: "100%", background: "var(--primary)", transition: "width 0.3s ease" }} />
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: job.status === "CERTIFIED_CLEAN" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: job.status === "CERTIFIED_CLEAN" ? "var(--primary)" : "var(--amber)",
                          border: "1px solid var(--border)"
                        }}
                      >
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTION GATEWAY SWITCH */}
      {activeTab === "GATEWAY" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>GATEWAY DIODE ROUTER</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>
                Controlled Production Gateway Controller
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              <button
                onClick={() => setGatewayState("TOTAL_AIRGAP")}
                style={{
                  background: gatewayState === "TOTAL_AIRGAP" ? "rgba(244, 63, 94, 0.15)" : "var(--surface-2)",
                  border: gatewayState === "TOTAL_AIRGAP" ? "1px solid var(--rose)" : "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 12,
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13, color: "var(--rose)" }}>1. TOTAL AIRGAP</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>100% disconnected. 0 B/s Egress. Failsafe armed.</div>
              </button>

              <button
                onClick={() => setGatewayState("DIODE_EGRESS")}
                style={{
                  background: gatewayState === "DIODE_EGRESS" ? "rgba(6, 182, 212, 0.15)" : "var(--surface-2)",
                  border: gatewayState === "DIODE_EGRESS" ? "1px solid var(--cyan)" : "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 12,
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13, color: "var(--cyan)" }}>2. DIODE EGRESS</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>One-way replication to secondary cold DR cluster.</div>
              </button>

              <button
                onClick={() => setGatewayState("CANARY_DMZ")}
                style={{
                  background: gatewayState === "CANARY_DMZ" ? "rgba(245, 158, 11, 0.15)" : "var(--surface-2)",
                  border: gatewayState === "CANARY_DMZ" ? "1px solid var(--amber)" : "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 12,
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13, color: "var(--amber)" }}>3. CANARY DMZ</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>5% micro-metered production traffic with canary tripwires.</div>
              </button>

              <button
                onClick={() => {
                  if (gateChecklist.executiveDualCustody) {
                    setGatewayState("FULL_CUTOVER");
                  } else {
                    alert("Cannot perform Full Cutover: Executive Dual-Custody signoff is required.");
                  }
                }}
                style={{
                  background: gatewayState === "FULL_CUTOVER" ? "rgba(16, 185, 129, 0.15)" : "var(--surface-2)",
                  border: gatewayState === "FULL_CUTOVER" ? "1px solid var(--primary)" : "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 12,
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13, color: "var(--primary)" }}>4. FULL CUTOVER</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>Requires CISO dual-approval signature.</div>
              </button>
            </div>

            <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, fontSize: 12 }}>
              <div style={{ color: "var(--muted)", fontWeight: 700, marginBottom: 4 }}>Current Routing Policy:</div>
              <div style={{ color: "var(--fg)", lineHeight: 1.4 }}>
                Currently in <strong>{gatewayState.replace("_", " ")}</strong> mode. All TCP packets from IRE are inspected by Palo Alto PAN-OS inline virtual firewalls before crossing to core production switches.
              </div>
            </div>
          </div>

          {/* Gatekeeper Checklist */}
          <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>GATEKEEPER VALIDATION</span>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", marginTop: 2 }}>
                Pre-Cutover Security Signoffs
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)", padding: 10, borderRadius: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={gateChecklist.forensicSignoff}
                  onChange={(e) => setGateChecklist(prev => ({ ...prev, forensicSignoff: e.target.checked }))}
                />
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>Forensic Memory & Persistence Clean Check (GCIH)</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)", padding: 10, borderRadius: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={gateChecklist.canaryTripwiresClean}
                  onChange={(e) => setGateChecklist(prev => ({ ...prev, canaryTripwiresClean: e.target.checked }))}
                />
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>Canary Tripwires Ingested & 0 Alerts Fired in 24h</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)", padding: 10, borderRadius: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={gateChecklist.krbtgtDoubleRolled}
                  onChange={(e) => setGateChecklist(prev => ({ ...prev, krbtgtDoubleRolled: e.target.checked }))}
                />
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>AD KRBTGT Password Double-Roll Completed</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)", padding: 10, borderRadius: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={gateChecklist.executiveDualCustody}
                  onChange={(e) => setGateChecklist(prev => ({ ...prev, executiveDualCustody: e.target.checked }))}
                />
                <span style={{ color: "var(--amber)", fontWeight: 700 }}>Executive Dual-Custody Approval (CISO + Board)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IRE SECURITY TELEMETRY */}
      {activeTab === "TELEMETRY" && (
        <div className="card-tactical" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
            Real-Time IRE Microsegmentation Filter Logs
          </h3>
          <div style={{ background: "var(--bg)", padding: 14, borderRadius: 6, fontFamily: "monospace", fontSize: 11, color: "var(--fg-2)", lineHeight: 1.6, maxHeight: 350, overflowY: "auto" }}>
            <div>[2026-08-24 00:31:12 UTC] <span style={{ color: "var(--primary)" }}>[IRE-vSwitch-DROP]</span> Blocked NetBIOS broadcast from 10.14.4.22 (Restored-Node) -&gt; 255.255.255.255:137</div>
            <div>[2026-08-24 00:32:05 UTC] <span style={{ color: "var(--primary)" }}>[IRE-SDN-PASS]</span> Bastion Jumpbox 10.99.1.14 authenticated via FIPS YubiKey -&gt; DC01-RESTORE (RDP/TLS)</div>
            <div>[2026-08-24 00:33:44 UTC] <span style={{ color: "var(--rose)" }}>[IRE-TRIPWIRE-CLEAN]</span> Canary file &apos;C:\Finance\Q3_Salaries.xlsx&apos; hash verified 100% untouched</div>
            <div>[2026-08-24 00:34:10 UTC] <span style={{ color: "var(--cyan)" }}>[IRE-WORM-MOUNT]</span> S3 Object Lock snapshot #20260823-0400UTC mapped read-only to /dev/sdb</div>
            <div>[2026-08-24 00:35:00 UTC] <span style={{ color: "var(--primary)" }}>[IRE-GATEWAY]</span> Diode Egress Switch: ENFORCING TOTAL AIRGAP (0 packets leaked to production core)</div>
          </div>
        </div>
      )}
    </div>
  );
}
