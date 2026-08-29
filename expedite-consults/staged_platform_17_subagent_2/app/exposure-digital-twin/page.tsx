"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GitGraph,
  Users,
  Laptop,
  Server,
  AppWindow,
  Shield,
  HardDrive,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Flame,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  Lock,
  Unlock,
  Radio,
  Zap,
  Info,
  ChevronRight,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Activity,
  Terminal
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

export type HierarchyLayer = "USERS" | "WORKSTATIONS" | "SERVERS" | "APPLICATIONS" | "IDENTITY" | "BACKUPS";

export interface ExposureNode {
  id: string;
  name: string;
  layer: HierarchyLayer;
  type: string;
  role: string;
  ipOrEmail: string;
  tier: "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3";
  hourlyCostUSD: number;
  compromiseProbabilityPct: number;
  connections: string[]; // downstream IDs it can reach/pivot to
  privileges: string[];
  vulnerabilities: string[];
  mfaEnforced: boolean;
  status: "CLEAN" | "COMPROMISED" | "CONTAINED" | "ISOLATED";
}

const HIERARCHY_NODES: ExposureNode[] = [
  // USERS
  {
    id: "usr-1",
    name: "Dr. Arthur Vance (Chief Medical Officer)",
    layer: "USERS",
    type: "Executive User",
    role: "Clinical Executive / VIP",
    ipOrEmail: "avance@mercyhealth.org",
    tier: "TIER_1",
    hourlyCostUSD: 45000,
    compromiseProbabilityPct: 88,
    connections: ["ws-1", "app-1"],
    privileges: ["EHR Supervisor", "Clinical Override", "Email Access"],
    vulnerabilities: ["Target of High-Purity Spear Phishing", "No FIDO2 Token"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "usr-2",
    name: "Marcus Vance (Domain & Backup Admin)",
    layer: "USERS",
    type: "Privileged Admin",
    role: "Lead Infrastructure Architect",
    ipOrEmail: "mvance-adm@mercy.local",
    tier: "TIER_0",
    hourlyCostUSD: 120000,
    compromiseProbabilityPct: 65,
    connections: ["ws-2", "id-1", "srv-1", "bak-4"],
    privileges: ["Domain Admins", "Schema Admins", "Veeam Root"],
    vulnerabilities: ["Shared Local Admin Hash", "RDP Session Cached in LSASS"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "usr-3",
    name: "Elena Rostova (DevOps & Database Tech)",
    layer: "USERS",
    type: "DevOps Engineer",
    role: "Database & Cloud Lead",
    ipOrEmail: "erostova@mercy.local",
    tier: "TIER_1",
    hourlyCostUSD: 75000,
    compromiseProbabilityPct: 72,
    connections: ["ws-3", "srv-2", "srv-3"],
    privileges: ["SQL sysadmin", "Hyper-V Operator", "K8s Cluster Admin"],
    vulnerabilities: ["Hardcoded Service Account Credential in Git Repository"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "usr-4",
    name: "Apex Billing Contractor (Third-Party MSP)",
    layer: "USERS",
    type: "Contractor Account",
    role: "MSP Billing Integration Specialist",
    ipOrEmail: "ext-billing@vendor-apex.net",
    tier: "TIER_2",
    hourlyCostUSD: 30000,
    compromiseProbabilityPct: 94,
    connections: ["ws-4", "app-2"],
    privileges: ["Billing Portal Admin", "AnyDesk Remote Access"],
    vulnerabilities: ["Unmanaged Contractor Device", "SMS-Based MFA Bypassed via SIM Swap"],
    mfaEnforced: false,
    status: "CLEAN"
  },

  // WORKSTATIONS
  {
    id: "ws-1",
    name: "CMO-LAPTOP-W11 (Executive VIP)",
    layer: "WORKSTATIONS",
    type: "VIP Endpoint",
    role: "Secure Executive Laptop",
    ipOrEmail: "10.14.8.45",
    tier: "TIER_2",
    hourlyCostUSD: 20000,
    compromiseProbabilityPct: 82,
    connections: ["srv-1", "app-1"],
    privileges: ["Local Admin", "Cached Domain Credentials"],
    vulnerabilities: ["CVE-2024-21413 (Outlook Moniker RCE)", "LAPS Disabled"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "ws-2",
    name: "IT-ADMIN-WS01 (Privileged Workstation)",
    layer: "WORKSTATIONS",
    type: "PAW Endpoint",
    role: "Infrastructure Admin Console",
    ipOrEmail: "10.14.2.55",
    tier: "TIER_0",
    hourlyCostUSD: 90000,
    compromiseProbabilityPct: 60,
    connections: ["id-1", "id-2", "srv-1", "srv-4"],
    privileges: ["Domain Admin Token in Memory", "RSAT Toolset Installed"],
    vulnerabilities: ["Unquoted Service Path", "WDigest Credential Caching"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "ws-3",
    name: "DEV-WORKSTATION-04 (Clinical Dev Node)",
    layer: "WORKSTATIONS",
    type: "Engineering Workstation",
    role: "EHR API Development Hub",
    ipOrEmail: "10.14.6.12",
    tier: "TIER_2",
    hourlyCostUSD: 35000,
    compromiseProbabilityPct: 78,
    connections: ["srv-2", "srv-3", "app-3"],
    privileges: ["SSH Keys to Production DB", "Docker Socket Exposed"],
    vulnerabilities: ["Exposed .env containing SQL connection string"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "ws-4",
    name: "CONTRACTOR-VDI-02 (Remote Desktop)",
    layer: "WORKSTATIONS",
    type: "VDI Instance",
    role: "Third-Party MSP Gateway",
    ipOrEmail: "10.14.9.88",
    tier: "TIER_3",
    hourlyCostUSD: 25000,
    compromiseProbabilityPct: 96,
    connections: ["app-2", "srv-2"],
    privileges: ["Remote Desktop Users", "Local Write to Shared C:"],
    vulnerabilities: ["ScreenConnect Agent 23.9.7 (CVE-2024-1709)", "Outdated AV Engine"],
    mfaEnforced: false,
    status: "CLEAN"
  },

  // SERVERS
  {
    id: "srv-1",
    name: "HYPERV-CLUSTER-01/02 (Core Compute)",
    layer: "SERVERS",
    type: "Hypervisor Cluster",
    role: "Production Virtualization Host",
    ipOrEmail: "10.14.1.10 / 10.14.1.11",
    tier: "TIER_0",
    hourlyCostUSD: 160000,
    compromiseProbabilityPct: 70,
    connections: ["srv-2", "srv-3", "srv-4", "bak-4"],
    privileges: ["Host-level VHDX disk direct control"],
    vulnerabilities: ["Hyper-V vSwitch Promiscuous Sniffing", "Local Admin reuse with DC01"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "srv-2",
    name: "SQL-CLINICAL-PROD (Epic EHR Database)",
    layer: "SERVERS",
    type: "Database Cluster",
    role: "Primary EHR & Patient Care DB",
    ipOrEmail: "10.14.3.15",
    tier: "TIER_0",
    hourlyCostUSD: 240000,
    compromiseProbabilityPct: 85,
    connections: ["app-1", "app-2", "bak-1", "bak-3"],
    privileges: ["Patient Master Index", "Direct T-SQL Storage Engine"],
    vulnerabilities: ["xp_cmdshell enabled by legacy report job", "Unencrypted database backups on D:"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "srv-3",
    name: "APP-IIS-FARM (Web Portal Cluster)",
    layer: "SERVERS",
    type: "Application Server",
    role: "Patient & Physician Web Gateway",
    ipOrEmail: "10.14.4.20 - 24",
    tier: "TIER_1",
    hourlyCostUSD: 65000,
    compromiseProbabilityPct: 75,
    connections: ["app-1", "app-3"],
    privileges: ["IIS AppPool Identity", "Domain User Service Account"],
    vulnerabilities: ["T1505.003 Web Shell Dropper Risk", "CVE-2023-34362 Vulnerability"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "srv-4",
    name: "PACS-STORAGE-SAN-01 (Medical Imaging)",
    layer: "SERVERS",
    type: "SAN Array Host",
    role: "DICOM PACS Archive Storage",
    ipOrEmail: "10.14.5.100",
    tier: "TIER_1",
    hourlyCostUSD: 110000,
    compromiseProbabilityPct: 68,
    connections: ["app-4", "bak-2", "bak-3"],
    privileges: ["LUN Export Controls", "iSCSI Target Admin"],
    vulnerabilities: ["Default SNMP Community String (public)", "SMBv2 Signing Not Required"],
    mfaEnforced: true,
    status: "CLEAN"
  },

  // APPLICATIONS
  {
    id: "app-1",
    name: "Epic EHR Clinical System",
    layer: "APPLICATIONS",
    type: "Healthcare Core",
    role: "Inpatient, Emergency & Pharmacy Operations",
    ipOrEmail: "https://ehr.mercyhealth.org",
    tier: "TIER_0",
    hourlyCostUSD: 280000,
    compromiseProbabilityPct: 90,
    connections: ["id-1", "bak-1"],
    privileges: ["Electronic Health Record Authority"],
    vulnerabilities: ["High blast dependency on SQL-CLINICAL and DC01"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "app-2",
    name: "Billing & Revenue Cycle Engine",
    layer: "APPLICATIONS",
    type: "Financial Core",
    role: "Claims Processing & Insurance Settlement",
    ipOrEmail: "https://billing.mercyhealth.org",
    tier: "TIER_1",
    hourlyCostUSD: 95000,
    compromiseProbabilityPct: 80,
    connections: ["id-1", "bak-1"],
    privileges: ["Automated ACH & Merchant Settlement"],
    vulnerabilities: ["Third-party API key exposure in MSP proxy"],
    mfaEnforced: false,
    status: "CLEAN"
  },
  {
    id: "app-3",
    name: "Patient Telehealth & Web Portal",
    layer: "APPLICATIONS",
    type: "Public Web App",
    role: "External Patient Access & Scheduling",
    ipOrEmail: "https://mychart.mercyhealth.org",
    tier: "TIER_2",
    hourlyCostUSD: 40000,
    compromiseProbabilityPct: 70,
    connections: ["id-2"],
    privileges: ["External JWT Token Generation"],
    vulnerabilities: ["Public Facing Endpoint"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "app-4",
    name: "PACS DICOM Radiology Viewer",
    layer: "APPLICATIONS",
    type: "Clinical Diagnostic",
    role: "MRI, CT & X-Ray Real-time Diagnostic Feeds",
    ipOrEmail: "https://pacs.mercyhealth.org",
    tier: "TIER_1",
    hourlyCostUSD: 85000,
    compromiseProbabilityPct: 75,
    connections: ["bak-2"],
    privileges: ["Direct DICOM Stream Access"],
    vulnerabilities: ["DICOM unencrypted port 104 in internal subnet"],
    mfaEnforced: true,
    status: "CLEAN"
  },

  // IDENTITY SYSTEMS
  {
    id: "id-1",
    name: "DC01.mercy.local (Primary Domain Controller)",
    layer: "IDENTITY",
    type: "Tier-0 Identity Engine",
    role: "Active Directory Forest Root & Kerberos KDC",
    ipOrEmail: "10.14.2.10",
    tier: "TIER_0",
    hourlyCostUSD: 310000,
    compromiseProbabilityPct: 85,
    connections: ["srv-1", "srv-2", "srv-3", "srv-4", "app-1", "app-2", "bak-4"],
    privileges: ["KRBTGT Key Holder", "Enterprise Admins", "Group Policy (GPO) Distribution"],
    vulnerabilities: ["DCSync Replication Permitted", "Kerberoasting on SPN accounts", "vssadmin access"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "id-2",
    name: "Azure Entra ID & Okta SSO Federation",
    layer: "IDENTITY",
    type: "Cloud Identity Provider",
    role: "Hybrid Cloud Token Authority & Conditional Access",
    ipOrEmail: "https://login.microsoftonline.com",
    tier: "TIER_0",
    hourlyCostUSD: 180000,
    compromiseProbabilityPct: 40,
    connections: ["app-1", "app-2", "app-3"],
    privileges: ["Global Admin Token Creation", "SAML Signature Key"],
    vulnerabilities: ["AADC Password Hash Sync (PHS) agent on DC01"],
    mfaEnforced: true,
    status: "CLEAN"
  },

  // BACKUPS
  {
    id: "bak-1",
    name: "AWS S3 Object Lock (Immutable WORM Vault)",
    layer: "BACKUPS",
    type: "Immutable Cloud Vault",
    role: "Compliance Mode Offsite Immutable Repository",
    ipOrEmail: "s3://aegis-mercy-immutable-vault",
    tier: "TIER_0",
    hourlyCostUSD: 0,
    compromiseProbabilityPct: 2,
    connections: [],
    privileges: ["Legal Hold & WORM Lock enforcement"],
    vulnerabilities: ["IAM Root Account MFA bypass (Mitigated via Hardware Key)"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "bak-2",
    name: "Offsite LTO-8 Tape Vault (Air-Gapped)",
    layer: "BACKUPS",
    type: "Air-Gapped Tape",
    role: "Physically Disconnected Tape Library",
    ipOrEmail: "Physical Storage Enclave",
    tier: "TIER_0",
    hourlyCostUSD: 0,
    compromiseProbabilityPct: 0.1,
    connections: [],
    privileges: ["Offline Cryptographic Volume Key"],
    vulnerabilities: ["Manual transport latency (12-14 hours RTO)"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "bak-3",
    name: "ZFS Storage SAN Air-Gapped Snapshots",
    layer: "BACKUPS",
    type: "Immutable SAN Snapshots",
    role: "Read-Only Hardware Level Snapshots",
    ipOrEmail: "10.14.5.200 (Read-Only VLAN)",
    tier: "TIER_1",
    hourlyCostUSD: 0,
    compromiseProbabilityPct: 15,
    connections: [],
    privileges: ["ZFS Pool Destroy Guard"],
    vulnerabilities: ["Admin credentials stored in PAM"],
    mfaEnforced: true,
    status: "CLEAN"
  },
  {
    id: "bak-4",
    name: "Local Volume Shadow Copies (VSS on Windows Hosts)",
    layer: "BACKUPS",
    type: "Local Windows VSS",
    role: "Host-Level Local Snapshots",
    ipOrEmail: "Local Host VSS Subsystem",
    tier: "TIER_3",
    hourlyCostUSD: 50000,
    compromiseProbabilityPct: 98,
    connections: [],
    privileges: ["Local VSS Restore"],
    vulnerabilities: ["Easily deleted via 'vssadmin delete shadows /all /quiet' and 'wmic shadowcopy delete'"],
    mfaEnforced: false,
    status: "CLEAN"
  }
];

export default function ExposureDigitalTwinPage() {
  const [nodes, setNodes] = useState<ExposureNode[]>(HIERARCHY_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("usr-4");
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeLayerFilter, setActiveLayerFilter] = useState<string>("ALL");

  // Defenses Switchboard
  const [defenses, setDefenses] = useState({
    lapsEnabled: false,
    tierZeroPAM: false,
    immutableS3Lock: true,
    edrMicroIsolation: false,
    mfaFido2Enforced: false,
  });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Calculate downstream blast radius dynamically using recursive depth traversal
  const calculateBlastRadius = (startId: string, customDefenses = defenses): {
    impactedIds: string[];
    paths: { from: string; to: string; technique: string; prevented: boolean }[];
  } => {
    const visited = new Set<string>();
    const paths: { from: string; to: string; technique: string; prevented: boolean }[] = [];

    const queue: string[] = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currNode = nodes.find((n) => n.id === currentId);
      if (!currNode) continue;

      for (const targetId of currNode.connections) {
        const targetNode = nodes.find((n) => n.id === targetId);
        if (!targetNode) continue;

        let technique = "Lateral Movement / RPC";
        let isPrevented = false;

        // Check defensive barriers
        if (targetNode.layer === "IDENTITY" && customDefenses.tierZeroPAM) {
          technique = "Blocked by Tier-0 PAM & Kerberos Armoring";
          isPrevented = true;
        } else if (targetNode.id === "bak-1" && customDefenses.immutableS3Lock) {
          technique = "Blocked by AWS S3 Compliance Mode WORM Lock";
          isPrevented = true;
        } else if (targetNode.id === "bak-2") {
          technique = "Air-gap prevents electronic lateral compromise";
          isPrevented = true;
        } else if (targetNode.layer === "SERVERS" && customDefenses.edrMicroIsolation) {
          technique = "Contained by EDR Microsegmentation Rule";
          isPrevented = true;
        } else if (currNode.layer === "USERS" && targetNode.layer === "WORKSTATIONS" && customDefenses.mfaFido2Enforced && !currNode.mfaEnforced) {
          technique = "Blocked by Hardware FIDO2 MFA enforcement";
          isPrevented = true;
        } else if (currNode.layer === "WORKSTATIONS" && targetNode.layer === "SERVERS" && customDefenses.lapsEnabled) {
          technique = "Blocked by LAPS unique local administrator passwords";
          isPrevented = true;
        } else {
          // Unblocked attack path
          if (targetNode.id === "id-1") technique = "DCSync / Kerberoasting Privilege Escalation (T1003)";
          else if (targetNode.id === "bak-4") technique = "vssadmin delete shadows /all /quiet (T1490)";
          else if (targetNode.layer === "SERVERS") technique = "PsExec / WMI Lateral Deployment (T1021.002)";
          else if (targetNode.layer === "APPLICATIONS") technique = "Service Account Token Hijack (T1078)";
          else technique = "Network Pivot / Shared Credential Re-use";
        }

        paths.push({
          from: currentId,
          to: targetId,
          technique,
          prevented: isPrevented
        });

        if (!isPrevented && !visited.has(targetId)) {
          visited.add(targetId);
          queue.push(targetId);
        }
      }
    }

    return {
      impactedIds: Array.from(visited),
      paths
    };
  };

  const blastResult = useMemo(() => {
    return calculateBlastRadius(selectedNode.id, defenses);
  }, [selectedNode.id, defenses, nodes]);

  const totalHourlyDowntime = useMemo(() => {
    return blastResult.impactedIds.reduce((sum, id) => {
      const n = nodes.find((node) => node.id === id);
      return sum + (n ? n.hourlyCostUSD : 0);
    }, 0);
  }, [blastResult.impactedIds, nodes]);

  const layersList: HierarchyLayer[] = ["USERS", "WORKSTATIONS", "SERVERS", "APPLICATIONS", "IDENTITY", "BACKUPS"];

  const runSimulation = () => {
    setSimulationActive(true);
    setNodes((prev) =>
      prev.map((n) => {
        if (blastResult.impactedIds.includes(n.id)) {
          return { ...n, status: "COMPROMISED" };
        }
        return { ...n, status: "CLEAN" };
      })
    );
  };

  const resetSimulation = () => {
    setSimulationActive(false);
    setNodes(HIERARCHY_NODES);
  };

  const toggleDefense = (key: keyof typeof defenses) => {
    setDefenses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLayer = activeLayerFilter === "ALL" || n.layer === activeLayerFilter;
    return matchesSearch && matchesLayer;
  });

  const getLayerIcon = (layer: HierarchyLayer) => {
    switch (layer) {
      case "USERS": return Users;
      case "WORKSTATIONS": return Laptop;
      case "SERVERS": return Server;
      case "APPLICATIONS": return AppWindow;
      case "IDENTITY": return Shield;
      case "BACKUPS": return HardDrive;
    }
  };

  const getLayerColor = (layer: HierarchyLayer) => {
    switch (layer) {
      case "USERS": return "var(--cyan)";
      case "WORKSTATIONS": return "var(--blue)";
      case "SERVERS": return "var(--purple)";
      case "APPLICATIONS": return "var(--amber)";
      case "IDENTITY": return "var(--rose)";
      case "BACKUPS": return "var(--primary)";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.05) 50%, rgba(14,21,38,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              borderRadius: 8,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <GitGraph size={18} color="var(--primary)" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--primary)", letterSpacing: "0.08em" }}>
                STAGE 2: PREVENT & DIGITAL TWIN
              </span>
            </div>
            <span className="badge-sev badge-critical">ENHANCED ENVIRONMENT MODEL</span>
            <span className="badge-sev badge-medium">6 HIERARCHY TIERS</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginBottom: 6 }}>
            Ransomware Exposure Digital Twin & Lateral Movement Simulator
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Full multi-layered cyber topology model replicating Users, Workstations, Compute Servers, Applications, Identity Engines, and Backup Repositories. Test entry point compromises to simulate instant lateral movement cascade and quantify downstream blast radius in real time.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {!simulationActive ? (
            <button
              onClick={runSimulation}
              className="btn-primary"
              style={{ padding: "10px 18px", fontSize: 13 }}
            >
              <Play size={16} />
              Simulate Infection Cascade
            </button>
          ) : (
            <button
              onClick={resetSimulation}
              className="btn-secondary"
              style={{ borderColor: "var(--rose)", color: "var(--rose)", padding: "10px 18px" }}
            >
              <RotateCcw size={16} />
              Reset Digital Twin
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Active Entry Node</span>
            <Flame size={16} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selectedNode.name}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <span>Layer: <strong style={{ color: getLayerColor(selectedNode.layer) }}>{selectedNode.layer}</strong></span>
            <span>•</span>
            <span>Tier: {selectedNode.tier}</span>
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 16, borderLeft: `3px solid ${blastResult.impactedIds.length > 5 ? "var(--rose)" : "var(--amber)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Simulated Blast Radius</span>
            <AlertTriangle size={16} color={blastResult.impactedIds.length > 5 ? "var(--rose)" : "var(--amber)"} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: blastResult.impactedIds.length > 5 ? "var(--rose)" : "var(--amber)" }}>
            {blastResult.impactedIds.length} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)" }}>/ {nodes.length} Nodes ({Math.round((blastResult.impactedIds.length / nodes.length) * 100)}%)</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
            {blastResult.impactedIds.length > 8 ? "Critical Enterprise Cascade" : "Contained Blast Zone"}
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Financial Downstream Burn</span>
            <DollarSign size={16} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--amber)" }}>
            ${totalHourlyDowntime.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>/ hr</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
            Cumulative production downtime loss
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 16, borderLeft: "3px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Backup Vault Status</span>
            <ShieldCheck size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: defenses.immutableS3Lock ? "var(--primary)" : "var(--rose)" }}>
            {defenses.immutableS3Lock ? "IMMUTABLE PROTECTED" : "AT RISK OF PURGE"}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
            AWS S3 Object Lock & Tape Vault
          </div>
        </div>
      </div>

      {/* Main Grid: Topology Hierarchy + Simulation Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: 20 }}>
        
        {/* Left Column: Multi-Tier Hierarchy View */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Controls Bar: Search & Layer Filters */}
          <div className="card-tactical" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Search size={15} color="var(--muted)" />
              <input
                type="text"
                placeholder="Search user, workstation, server or database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--fg)",
                  fontSize: 12.5,
                  width: 240
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                onClick={() => setActiveLayerFilter("ALL")}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "1px solid var(--border)",
                  background: activeLayerFilter === "ALL" ? "rgba(16,185,129,0.2)" : "var(--surface-2)",
                  color: activeLayerFilter === "ALL" ? "var(--primary)" : "var(--fg-2)",
                  cursor: "pointer"
                }}
              >
                All (6 Layers)
              </button>
              {layersList.map((l) => (
                <button
                  key={l}
                  onClick={() => setActiveLayerFilter(l)}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                    background: activeLayerFilter === l ? "rgba(6,182,212,0.2)" : "var(--surface-2)",
                    color: activeLayerFilter === l ? "var(--cyan)" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Layer by Layer Interactive Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {layersList
              .filter((layer) => activeLayerFilter === "ALL" || activeLayerFilter === layer)
              .map((layer) => {
                const LayerIcon = getLayerIcon(layer);
                const layerColor = getLayerColor(layer);
                const layerNodes = filteredNodes.filter((n) => n.layer === layer);

                if (layerNodes.length === 0) return null;

                return (
                  <div
                    key={layer}
                    className="card-tactical"
                    style={{
                      padding: 16,
                      background: "rgba(14,21,38,0.7)",
                      border: "1px solid var(--border)",
                      borderLeft: `4px solid ${layerColor}`
                    }}
                  >
                    {/* Layer Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          background: `rgba(${layer === "BACKUPS" ? "16,185,129" : layer === "IDENTITY" ? "244,63,94" : "6,182,212"}, 0.15)`,
                          padding: 6,
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center"
                        }}>
                          <LayerIcon size={16} color={layerColor} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", letterSpacing: "0.04em" }}>
                          {layer} LAYER
                        </span>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>({layerNodes.length} Assets)</span>
                      </div>

                      <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                        LATERAL CASCADE STEP {layersList.indexOf(layer) + 1} OF 6
                      </div>
                    </div>

                    {/* Nodes Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                      {layerNodes.map((node) => {
                        const isSelected = selectedNode.id === node.id;
                        const isImpacted = blastResult.impactedIds.includes(node.id);
                        const isSimCompromised = node.status === "COMPROMISED";

                        return (
                          <div
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            style={{
                              background: isSelected
                                ? "rgba(16,185,129,0.12)"
                                : isImpacted && simulationActive
                                ? "rgba(244,63,94,0.12)"
                                : isImpacted
                                ? "rgba(245,158,11,0.06)"
                                : "var(--surface-2)",
                              border: isSelected
                                ? "2px solid var(--primary)"
                                : isImpacted && simulationActive
                                ? "1.5px solid var(--rose)"
                                : isImpacted
                                ? "1px dashed var(--amber)"
                                : "1px solid var(--border)",
                              borderRadius: 8,
                              padding: "12px 14px",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              position: "relative",
                              boxShadow: isSelected ? "0 0 15px rgba(16,185,129,0.2)" : "none"
                            }}
                          >
                            {/* Card Top Row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)", lineHeight: 1.3 }}>
                                {node.name}
                              </div>
                              <span
                                style={{
                                  fontSize: 9.5,
                                  fontWeight: 800,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: node.tier === "TIER_0" ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.05)",
                                  color: node.tier === "TIER_0" ? "var(--rose)" : "var(--fg-2)",
                                  border: "1px solid var(--border)",
                                  fontFamily: "monospace"
                                }}
                              >
                                {node.tier}
                              </span>
                            </div>

                            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
                              {node.role} • <span style={{ color: "var(--fg-2)", fontFamily: "monospace" }}>{node.ipOrEmail}</span>
                            </div>

                            {/* Status and Impact Badges */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border-subtle)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {isSimCompromised ? (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--rose)", display: "flex", alignItems: "center", gap: 3 }}>
                                    <Flame size={12} /> COMPROMISED
                                  </span>
                                ) : isImpacted ? (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--amber)", display: "flex", alignItems: "center", gap: 3 }}>
                                    <AlertTriangle size={12} /> IN BLAST RADIUS
                                  </span>
                                ) : (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", display: "flex", alignItems: "center", gap: 3 }}>
                                    <CheckCircle2 size={12} /> PROTECTED
                                  </span>
                                )}
                              </div>

                              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>
                                ${node.hourlyCostUSD.toLocaleString()}/hr
                              </div>
                            </div>

                            {isSelected && (
                              <div style={{
                                position: "absolute",
                                top: -8,
                                right: 10,
                                background: "var(--primary)",
                                color: "#04100c",
                                fontSize: 9,
                                fontWeight: 800,
                                padding: "1px 6px",
                                borderRadius: 3,
                                textTransform: "uppercase"
                              }}>
                                SELECTED PATIENT ZERO
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: Lateral Movement Simulator & Attack Path Visualizer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Active Node Detail Card */}
          <div className="card-tactical" style={{ padding: 18, borderTop: "3px solid var(--primary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)", letterSpacing: "0.06em" }}>
                SELECTED SIMULATION NODE
              </span>
              <span className="badge-sev badge-medium">{selectedNode.layer}</span>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--fg)", marginBottom: 4 }}>
              {selectedNode.name}
            </h2>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
              {selectedNode.type} • {selectedNode.role}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, background: "var(--surface-2)", padding: 12, borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Endpoint / Handle:</span>
                <span style={{ fontFamily: "monospace", color: "var(--fg)" }}>{selectedNode.ipOrEmail}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Compromise Probability:</span>
                <span style={{ fontWeight: 700, color: selectedNode.compromiseProbabilityPct > 75 ? "var(--rose)" : "var(--amber)" }}>
                  {selectedNode.compromiseProbabilityPct}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Outage Cost:</span>
                <span style={{ fontWeight: 700, color: "var(--amber)" }}>
                  ${selectedNode.hourlyCostUSD.toLocaleString()} / hour
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>MFA Status:</span>
                <span style={{ fontWeight: 700, color: selectedNode.mfaEnforced ? "var(--primary)" : "var(--rose)" }}>
                  {selectedNode.mfaEnforced ? "Enforced" : "Disabled / Bypassed"}
                </span>
              </div>
            </div>

            {/* Privileges & Vulnerabilities */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-2)", textTransform: "uppercase", marginBottom: 6 }}>
                Active Privileges & Tokens
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                {selectedNode.privileges.map((p, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: 10.5,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "rgba(6,182,212,0.12)",
                      color: "var(--cyan)",
                      border: "1px solid rgba(6,182,212,0.3)",
                      fontFamily: "monospace"
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--rose)", textTransform: "uppercase", marginBottom: 6 }}>
                Identified Exploit Vectors
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {selectedNode.vulnerabilities.map((v, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: 11,
                      padding: "4px 8px",
                      borderRadius: 4,
                      background: "rgba(244,63,94,0.1)",
                      color: "var(--rose)",
                      border: "1px solid rgba(244,63,94,0.25)"
                    }}
                  >
                    ⚠ {v}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Defensive Mitigations Switchboard */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Sliders size={16} color="var(--primary)" />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--fg)" }}>
                  Defensive Barrier Controls
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Toggle to re-test</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 12, color: "var(--fg-2)" }}>
                <span>🛡️ Tier-0 Privileged Access (PAM)</span>
                <input
                  type="checkbox"
                  checked={defenses.tierZeroPAM}
                  onChange={() => toggleDefense("tierZeroPAM")}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 12, color: "var(--fg-2)" }}>
                <span>🔒 LAPS Unique Local Admin Passwords</span>
                <input
                  type="checkbox"
                  checked={defenses.lapsEnabled}
                  onChange={() => toggleDefense("lapsEnabled")}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 12, color: "var(--fg-2)" }}>
                <span>📦 Immutable AWS S3 WORM Object Lock</span>
                <input
                  type="checkbox"
                  checked={defenses.immutableS3Lock}
                  onChange={() => toggleDefense("immutableS3Lock")}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 12, color: "var(--fg-2)" }}>
                <span>⚡ EDR Microsegmentation & Containment</span>
                <input
                  type="checkbox"
                  checked={defenses.edrMicroIsolation}
                  onChange={() => toggleDefense("edrMicroIsolation")}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 12, color: "var(--fg-2)" }}>
                <span>🔑 Hardware FIDO2 MFA Token Enforcement</span>
                <input
                  type="checkbox"
                  checked={defenses.mfaFido2Enforced}
                  onChange={() => toggleDefense("mfaFido2Enforced")}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }}
                />
              </label>
            </div>
          </div>

          {/* Lateral Movement Attack Path Sequence */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Zap size={16} color="var(--amber)" />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--fg)" }}>
                  Lateral Movement Propagation Path
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>
                {blastResult.paths.length} PIVOT VECTORS
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
              {blastResult.paths.length === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                  No downstream pivots available from this terminal node.
                </div>
              ) : (
                blastResult.paths.map((p, idx) => {
                  const fromNode = nodes.find((n) => n.id === p.from);
                  const toNode = nodes.find((n) => n.id === p.to);

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 6,
                        background: p.prevented ? "rgba(16,185,129,0.06)" : "rgba(244,63,94,0.06)",
                        border: p.prevented ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(244,63,94,0.25)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
                        <span style={{ fontWeight: 700, color: "var(--fg)" }}>
                          {fromNode?.name.split(" ")[0]} ➔ {toNode?.name.split(" ")[0]}
                        </span>
                        {p.prevented ? (
                          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--primary)", display: "flex", alignItems: "center", gap: 3 }}>
                            <CheckCircle2 size={12} /> BLOCKED
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--rose)", display: "flex", alignItems: "center", gap: 3 }}>
                            <Flame size={12} /> EXPLOITED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10.5, color: p.prevented ? "var(--primary)" : "var(--muted)", fontFamily: "monospace" }}>
                        {p.technique}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
