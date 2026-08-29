"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Network,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  Lock,
  Unlock,
  Terminal,
  Clock,
  Eye,
  Server,
  Layers,
  Check,
  X,
  HardDrive,
  Database,
  ArrowRight,
  TrendingUp,
  Filter,
  Cpu,
  Share2,
  Users,
  Activity,
  FileWarning,
  Crosshair,
  Sparkles
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { RansomwareCase } from "@/types/recovery";

interface BlastNode {
  id: string;
  name: string;
  category: "HOST" | "FILE_SHARE" | "CREDENTIAL" | "SERVER" | "BACKUP";
  tier: "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3";
  ipOrUnc?: string;
  status: "COMPROMISED" | "PROJECTED_NEXT_HOP" | "AT_RISK" | "ISOLATED_CONTAINED" | "IMMUTABLE_SAFE";
  dataSizeGB?: number;
  criticality: "CRITICAL" | "HIGH" | "MEDIUM";
  propagationProbabilityPct: number;
  chokepointAvailable: boolean;
  chokepointName?: string;
  connectedTo: string[];
}

const INITIAL_NODES: BlastNode[] = [
  // Tier 1: Compromised Hosts (Patient Zero & Stagers)
  {
    id: "node-p0",
    name: "WS-CLINIC-409 (Patient Zero)",
    category: "HOST",
    tier: "TIER_2",
    ipOrUnc: "10.14.8.44",
    status: "COMPROMISED",
    dataSizeGB: 120,
    criticality: "HIGH",
    propagationProbabilityPct: 100,
    chokepointAvailable: true,
    chokepointName: "EDR Microsegmentation & Host Network Sever",
    connectedTo: ["share-1", "cred-1", "cred-2"]
  },
  {
    id: "node-dc01",
    name: "DC01.mercy.local (Primary Domain Controller)",
    category: "HOST",
    tier: "TIER_0",
    ipOrUnc: "10.14.2.10",
    status: "COMPROMISED",
    dataSizeGB: 340,
    criticality: "CRITICAL",
    propagationProbabilityPct: 100,
    chokepointAvailable: true,
    chokepointName: "Tier-0 Kerberos KRBTGT Double-Roll & DCSync Block",
    connectedTo: ["cred-da", "srv-sql", "srv-pacs", "share-emr", "share-fin"]
  },

  // Tier 2: Accessible File Shares (14 SMB shares total)
  {
    id: "share-1",
    name: "\\\\FS01\\PatientRecords$",
    category: "FILE_SHARE",
    tier: "TIER_0",
    ipOrUnc: "\\\\10.14.4.10\\PatientRecords$",
    status: "PROJECTED_NEXT_HOP",
    dataSizeGB: 680,
    criticality: "CRITICAL",
    propagationProbabilityPct: 94,
    chokepointAvailable: true,
    chokepointName: "Block SMB Port 445 on Storage Subnet",
    connectedTo: ["srv-sql", "cred-da"]
  },
  {
    id: "share-emr",
    name: "\\\\EMR-SHARE\\ClinicalData",
    category: "FILE_SHARE",
    tier: "TIER_0",
    ipOrUnc: "\\\\10.14.4.18\\ClinicalData",
    status: "PROJECTED_NEXT_HOP",
    dataSizeGB: 520,
    criticality: "CRITICAL",
    propagationProbabilityPct: 91,
    chokepointAvailable: true,
    chokepointName: "Disable Anonymous Null Sessions & Force SMB Signing",
    connectedTo: ["srv-sql", "srv-pacs"]
  },
  {
    id: "share-fin",
    name: "\\\\FIN-SAN\\Ledger2026",
    category: "FILE_SHARE",
    tier: "TIER_1",
    ipOrUnc: "\\\\10.14.5.12\\Ledger2026",
    status: "AT_RISK",
    dataSizeGB: 380,
    criticality: "HIGH",
    propagationProbabilityPct: 82,
    chokepointAvailable: true,
    chokepointName: "Revoke Accounting Service Account Write Tokens",
    connectedTo: ["srv-swift"]
  },
  {
    id: "share-pacs",
    name: "\\\\PACS-ARCHIVE\\DicomVault",
    category: "FILE_SHARE",
    tier: "TIER_1",
    ipOrUnc: "\\\\10.14.6.20\\DicomVault",
    status: "AT_RISK",
    dataSizeGB: 1100,
    criticality: "HIGH",
    propagationProbabilityPct: 78,
    chokepointAvailable: true,
    chokepointName: "Isolate Medical Imaging VLAN 60",
    connectedTo: ["srv-pacs", "bak-s3"]
  },

  // Tier 3: Privileged Credentials
  {
    id: "cred-1",
    name: "svc_backup_mgmt (Compromised Service SA)",
    category: "CREDENTIAL",
    tier: "TIER_0",
    status: "COMPROMISED",
    criticality: "CRITICAL",
    propagationProbabilityPct: 100,
    chokepointAvailable: true,
    chokepointName: "Immediate Password Reset & Session Invalidation in AD",
    connectedTo: ["bak-s3", "bak-zfs", "srv-sql"]
  },
  {
    id: "cred-da",
    name: "DOMAIN\\da_administrator (Domain Admin)",
    category: "CREDENTIAL",
    tier: "TIER_0",
    status: "COMPROMISED",
    criticality: "CRITICAL",
    propagationProbabilityPct: 100,
    chokepointAvailable: true,
    chokepointName: "Revoke Active Kerberos TGT & Invalidate Token Cache",
    connectedTo: ["srv-sql", "srv-pacs", "srv-swift", "node-dc01"]
  },
  {
    id: "cred-2",
    name: "sql_service_sa (Database SA)",
    category: "CREDENTIAL",
    tier: "TIER_1",
    status: "PROJECTED_NEXT_HOP",
    criticality: "HIGH",
    propagationProbabilityPct: 88,
    chokepointAvailable: true,
    chokepointName: "Rotate SQL SA Password & Disable xp_cmdshell",
    connectedTo: ["srv-sql"]
  },

  // Tier 4: Reachable Core Enterprise Servers
  {
    id: "srv-sql",
    name: "SQL-CLINICAL-01 (Epic EHR Database)",
    category: "SERVER",
    tier: "TIER_0",
    ipOrUnc: "10.14.3.15",
    status: "PROJECTED_NEXT_HOP",
    dataSizeGB: 850,
    criticality: "CRITICAL",
    propagationProbabilityPct: 96,
    chokepointAvailable: true,
    chokepointName: "Pause SQL Server Service & Lock MDF File Handles",
    connectedTo: ["bak-s3", "bak-zfs"]
  },
  {
    id: "srv-pacs",
    name: "PACS-IMAGING-CLUSTER (DICOM Nodes)",
    category: "SERVER",
    tier: "TIER_1",
    ipOrUnc: "10.14.6.10",
    status: "AT_RISK",
    dataSizeGB: 1250,
    criticality: "HIGH",
    propagationProbabilityPct: 75,
    chokepointAvailable: true,
    chokepointName: "Disconnect SAN Target Fibre Channel LUNs",
    connectedTo: ["bak-zfs", "bak-tape"]
  },
  {
    id: "srv-swift",
    name: "SWIFT-PAYMENT-GATEWAY (Settlement Node)",
    category: "SERVER",
    tier: "TIER_0",
    ipOrUnc: "10.14.7.100",
    status: "AT_RISK",
    dataSizeGB: 210,
    criticality: "CRITICAL",
    propagationProbabilityPct: 68,
    chokepointAvailable: true,
    chokepointName: "Trigger HSM Hardware Key Zeroization Standby",
    connectedTo: ["bak-s3"]
  },

  // Tier 5: Backup Systems & Repositories
  {
    id: "bak-s3",
    name: "AWS S3 Object Lock (Immutable Bucket)",
    category: "BACKUP",
    tier: "TIER_0",
    ipOrUnc: "arn:aws:s3:::mercy-immutable-vault",
    status: "IMMUTABLE_SAFE",
    dataSizeGB: 45800,
    criticality: "CRITICAL",
    propagationProbabilityPct: 4,
    chokepointAvailable: true,
    chokepointName: "Enforce S3 Compliance Mode WORM Freeze",
    connectedTo: []
  },
  {
    id: "bak-zfs",
    name: "ZFS Storage SAN Air-Gapped Snapshots",
    category: "BACKUP",
    tier: "TIER_0",
    ipOrUnc: "san-pool01.storage.mercy.local",
    status: "IMMUTABLE_SAFE",
    dataSizeGB: 120000,
    criticality: "CRITICAL",
    propagationProbabilityPct: 12,
    chokepointAvailable: true,
    chokepointName: "Disconnect TrueNAS Management Web Interface",
    connectedTo: []
  },
  {
    id: "bak-tape",
    name: "LTO-8 Tape Library (Iron Mountain Offline)",
    category: "BACKUP",
    tier: "TIER_0",
    ipOrUnc: "Physical Vault Slot #841",
    status: "IMMUTABLE_SAFE",
    dataSizeGB: 250000,
    criticality: "CRITICAL",
    propagationProbabilityPct: 0,
    chokepointAvailable: false,
    connectedTo: []
  }
];

export default function BlastRadiusPage() {
  const [selectedCase, setSelectedCase] = useState<RansomwareCase>(MOCK_CASES[0]);
  const [nodes, setNodes] = useState<BlastNode[]>(INITIAL_NODES);
  const [lateralSpeed, setLateralSpeed] = useState<"SLOW_STEALTH" | "NORMAL_WORM" | "HIGH_SPEED_SCRIPT">("HIGH_SPEED_SCRIPT");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-dc01");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [appliedChokepoints, setAppliedChokepoints] = useState<string[]>([
    "Enforce S3 Compliance Mode WORM Freeze"
  ]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Calculated blast summary
  const summary = useMemo(() => {
    const compromised = nodes.filter((n) => n.status === "COMPROMISED");
    const nextHop = nodes.filter((n) => n.status === "PROJECTED_NEXT_HOP");
    const atRisk = nodes.filter((n) => n.status === "AT_RISK");
    const isolated = nodes.filter((n) => n.status === "ISOLATED_CONTAINED");
    const safe = nodes.filter((n) => n.status === "IMMUTABLE_SAFE");

    const totalDataImpactGB = nodes
      .filter((n) => n.status === "COMPROMISED" || n.status === "PROJECTED_NEXT_HOP")
      .reduce((acc, curr) => acc + (curr.dataSizeGB || 0), 0);

    return {
      compromisedCount: compromised.length,
      nextHopCount: nextHop.length,
      atRiskCount: atRisk.length,
      isolatedCount: isolated.length,
      safeCount: safe.length,
      totalHostsProjected: 24,
      totalHostsAtRisk: 88,
      fileSharesAtRisk: 14,
      dataImpactTB: (totalDataImpactGB / 1000).toFixed(1),
      maxEstateTB: "14.2"
    };
  }, [nodes]);

  const toggleChokepoint = (nodeId: string, chokepointName?: string) => {
    if (!chokepointName) return;

    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const isContained = node.status === "ISOLATED_CONTAINED";
          return {
            ...node,
            status: isContained ? "AT_RISK" : "ISOLATED_CONTAINED",
            propagationProbabilityPct: isContained ? 75 : 0
          };
        }
        return node;
      })
    );

    setAppliedChokepoints((prev) =>
      prev.includes(chokepointName) ? prev.filter((c) => c !== chokepointName) : [...prev, chokepointName]
    );
  };

  const simulateNextHop = () => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.status === "PROJECTED_NEXT_HOP") {
          return { ...n, status: "COMPROMISED", propagationProbabilityPct: 100 };
        }
        if (n.status === "AT_RISK") {
          return { ...n, status: "PROJECTED_NEXT_HOP", propagationProbabilityPct: 90 };
        }
        return n;
      })
    );
  };

  const resetBlastSimulation = () => {
    setNodes(INITIAL_NODES);
    setAppliedChokepoints(["Enforce S3 Compliance Mode WORM Freeze"]);
  };

  const filteredNodes = useMemo(() => {
    if (categoryFilter === "ALL") return nodes;
    return nodes.filter((n) => n.category === categoryFilter);
  }, [nodes, categoryFilter]);

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
                background: "rgba(244, 63, 94, 0.15)",
                border: "1px solid var(--rose)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Network size={18} color="var(--rose)" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
              Blast Radius Prediction Engine
            </h1>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(244, 63, 94, 0.2)",
                color: "var(--rose)",
                border: "1px solid var(--rose)",
                letterSpacing: "0.06em",
                textTransform: "uppercase"
              }}
            >
              Autonomous Lateral Propagation DAG
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 750 }}>
            Simulate and predict attacker lateral movement paths from compromised entry points through accessible file shares, elevated Active Directory credentials, reachable servers, and backup repositories.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={simulateNextHop} className="btn-primary" style={{ background: "var(--rose)", color: "#fff" }}>
            <Play size={14} />
            Simulate Next Hop
          </button>

          <button onClick={resetBlastSimulation} className="btn-secondary">
            <RotateCcw size={14} />
            Reset Model
          </button>

          <Link href="/killchain-interrupter" className="btn-primary" style={{ background: "var(--primary)" }}>
            <Zap size={14} />
            Execute Interruption
          </Link>
        </div>
      </div>

      {/* KPI Ribbons: Estimated Blast Impact */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 20
        }}
      >
        <div className="card-tactical" style={{ padding: "14px 16px", border: "1px solid rgba(244, 63, 94, 0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>ESTIMATED DATA IMPACT</span>
            <HardDrive size={14} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--rose)" }}>
            {summary.dataImpactTB} TB <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>/ {summary.maxEstateTB} TB Total</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>High-velocity lock projection</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>AFFECTED HOSTS</span>
            <Server size={14} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--amber)" }}>
            {summary.totalHostsProjected} <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>projected / {summary.totalHostsAtRisk} at-risk</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>6 Domain Controllers, 12 SQL nodes</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>FILE SHARES AT RISK</span>
            <Share2 size={14} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--cyan)" }}>
            {summary.fileSharesAtRisk} <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>SMB Shares</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>8 Critical EHR / 6 Internal Finance</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>CRITICAL APPS AT RISK</span>
            <ShieldAlert size={14} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)", marginTop: 4 }}>
            Epic EHR, PACS, SWIFT
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Tier-0 Clinical & Financial core</div>
        </div>
      </div>

      {/* Simulation Parameter Bar */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "12px 18px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        {/* Speed Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>Lateral Movement Speed:</span>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "SLOW_STEALTH", label: "Slow Stealth (Living-off-the-Land)" },
              { id: "NORMAL_WORM", label: "Automated Worm Spread" },
              { id: "HIGH_SPEED_SCRIPT", label: "High-Speed Mass PsExec / WMI" }
            ].map((s) => {
              const active = lateralSpeed === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setLateralSpeed(s.id as any)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 5,
                    fontSize: 11,
                    fontWeight: active ? 800 : 500,
                    background: active ? "rgba(244, 63, 94, 0.2)" : "var(--surface-2)",
                    color: active ? "var(--rose)" : "var(--fg-2)",
                    border: active ? "1px solid var(--rose)" : "1px solid var(--border)",
                    cursor: "pointer"
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Category */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={14} color="var(--muted)" />
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Filter Chain:</span>
          {["ALL", "HOST", "FILE_SHARE", "CREDENTIAL", "SERVER", "BACKUP"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                fontSize: 10.5,
                padding: "3px 8px",
                borderRadius: 4,
                background: categoryFilter === cat ? "var(--primary)" : "var(--surface-2)",
                color: categoryFilter === cat ? "#000" : "var(--muted)",
                fontWeight: categoryFilter === cat ? 800 : 500,
                border: "none",
                cursor: "pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main 5-Tier Propagation Chain Visualizer */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Left: 5-Tier Graph Flow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                  5-Tier Attack Propagation Pipeline
                </h3>
                <p style={{ fontSize: 11.5, color: "var(--muted)" }}>
                  Compromised Host → Accessible File Shares → Privileged Credentials → Reachable Servers → Backup Repositories
                </p>
              </div>
              <span style={{ fontSize: 11, color: "var(--cyan)", fontFamily: "monospace" }}>
                {nodes.length} Model Nodes Evaluated
              </span>
            </div>

            {/* Nodes Flow List / Column Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                let badgeBg = "rgba(255,255,255,0.05)";
                let badgeColor = "var(--muted)";
                let borderLeftColor = "var(--border)";

                if (node.status === "COMPROMISED") {
                  badgeBg = "rgba(244, 63, 94, 0.25)";
                  badgeColor = "var(--rose)";
                  borderLeftColor = "var(--rose)";
                } else if (node.status === "PROJECTED_NEXT_HOP") {
                  badgeBg = "rgba(245, 158, 11, 0.25)";
                  badgeColor = "var(--amber)";
                  borderLeftColor = "var(--amber)";
                } else if (node.status === "AT_RISK") {
                  badgeBg = "rgba(6, 182, 212, 0.2)";
                  badgeColor = "var(--cyan)";
                  borderLeftColor = "var(--cyan)";
                } else if (node.status === "ISOLATED_CONTAINED") {
                  badgeBg = "rgba(16, 185, 129, 0.25)";
                  badgeColor = "var(--primary)";
                  borderLeftColor = "var(--primary)";
                } else if (node.status === "IMMUTABLE_SAFE") {
                  badgeBg = "rgba(16, 185, 129, 0.25)";
                  badgeColor = "var(--primary)";
                  borderLeftColor = "var(--primary)";
                }

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderLeft: `4px solid ${borderLeftColor}`,
                      borderRadius: 6,
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.15s ease",
                      gap: 12
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
                            color: "var(--fg-2)",
                            border: "1px solid var(--border)"
                          }}
                        >
                          {node.category}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>{node.name}</span>
                        {node.ipOrUnc && (
                          <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                            ({node.ipOrUnc})
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", gap: 12 }}>
                        <span>Tier: <strong style={{ color: "var(--fg-2)" }}>{node.tier}</strong></span>
                        {node.dataSizeGB && (
                          <span>Data Size: <strong style={{ color: "var(--cyan)" }}>{node.dataSizeGB >= 1000 ? `${(node.dataSizeGB / 1000).toFixed(1)} TB` : `${node.dataSizeGB} GB`}</strong></span>
                        )}
                        <span>Propagation Risk: <strong style={{ color: node.propagationProbabilityPct > 80 ? "var(--rose)" : "var(--primary)" }}>{node.propagationProbabilityPct}%</strong></span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: badgeBg,
                          color: badgeColor,
                          textTransform: "uppercase",
                          fontFamily: "monospace"
                        }}
                      >
                        {node.status.replace("_", " ")}
                      </span>

                      {node.chokepointAvailable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleChokepoint(node.id, node.chokepointName);
                          }}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 8px",
                            borderRadius: 4,
                            background: node.status === "ISOLATED_CONTAINED" ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)",
                            color: node.status === "ISOLATED_CONTAINED" ? "var(--primary)" : "var(--rose)",
                            border: `1px solid ${node.status === "ISOLATED_CONTAINED" ? "var(--primary)" : "var(--rose)"}`,
                            cursor: "pointer"
                          }}
                        >
                          {node.status === "ISOLATED_CONTAINED" ? "Undo Sever" : "Sever Chokepoint"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Containment Priority Recommendations Ranking */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 10 }}>
              🎯 Recommended Containment Priority Actions (High ROI)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                {
                  action: "Block SMB 445 on Storage Subnet (10.14.4.0/24)",
                  roi: "94% Blast Reduction",
                  estTime: "< 200 ms",
                  target: "\\\\FS01\\PatientRecords$",
                  impact: "Saves 1.2 TB clinical data from rapid header corruption"
                },
                {
                  action: "Invalidate Domain Admin Kerberos TGT (svc_backup_mgmt)",
                  roi: "88% Blast Reduction",
                  estTime: "< 150 ms",
                  target: "Active Directory DC01",
                  impact: "Prevents attacker DCSync credential replication across 6 DCs"
                },
                {
                  action: "Enforce S3 Object Lock Compliance Freeze",
                  roi: "99% Backup Retention",
                  estTime: "< 95 ms",
                  target: "AWS S3 Cloud Vault",
                  impact: "Guarantees 45.8 TB immutable recovery source remains untouched"
                }
              ].map((item, idx) => (
                <div
                  key={idx}
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
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)" }}>{item.action}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      Target: <strong style={{ color: "var(--cyan)" }}>{item.target}</strong> • {item.impact}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)" }}>{item.roi}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{item.estTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Node Details & Blast Impact Inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Node Inspector */}
          <div className="card-tactical" style={{ padding: 18, border: "1px solid rgba(244, 63, 94, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "rgba(244, 63, 94, 0.2)",
                  color: "var(--rose)",
                  fontFamily: "monospace"
                }}
              >
                NODE INSPECTOR
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{selectedNode.category}</span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", marginBottom: 8 }}>
              {selectedNode.name}
            </div>

            {/* Metrics */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 800 }}>
                  Current Status
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: selectedNode.status === "COMPROMISED" ? "var(--rose)" : "var(--amber)", marginTop: 2 }}>
                  {selectedNode.status.replace("_", " ")}
                </div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 800 }}>
                  Downstream Connection Hops ({selectedNode.connectedTo.length})
                </div>
                <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 4 }}>
                  {selectedNode.connectedTo.length > 0
                    ? selectedNode.connectedTo.map((c) => {
                        const targetNode = nodes.find((n) => n.id === c);
                        return targetNode ? targetNode.name : c;
                      }).join(" → ")
                    : "Terminal Leaf Node (End of Chain)"}
                </div>
              </div>

              {selectedNode.chokepointName && (
                <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: "var(--primary)", textTransform: "uppercase", fontWeight: 800 }}>
                    ⚡ Available Chokepoint Action
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)", marginTop: 2 }}>
                    {selectedNode.chokepointName}
                  </div>
                  <button
                    onClick={() => toggleChokepoint(selectedNode.id, selectedNode.chokepointName)}
                    className="btn-primary"
                    style={{ marginTop: 8, width: "100%", justifyContent: "center", fontSize: 11 }}
                  >
                    {selectedNode.status === "ISOLATED_CONTAINED" ? "Rollback Chokepoint" : "Engage This Chokepoint Now"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Applied Chokepoints */}
          <div className="card-tactical" style={{ padding: 18, flex: 1 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", marginBottom: 10 }}>
              🛡️ Active Containment Chokepoints ({appliedChokepoints.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {appliedChokepoints.map((cp, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface-2)",
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    fontSize: 11.5,
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <CheckCircle2 size={13} color="var(--primary)" />
                  <span>{cp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
