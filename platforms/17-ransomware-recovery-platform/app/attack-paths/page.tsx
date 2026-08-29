"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitGraph,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  Filter,
  Eye,
  Server,
  Database,
  Lock,
  Unlock,
  Layers,
  Key,
  HardDrive,
  Cpu,
  Info,
  Network
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import {
  AttackPathNode,
  AttackPathEdge,
  ChokepointRecommendation
} from "@/types/recovery";

// Initial Attack Path Nodes
const INITIAL_NODES: AttackPathNode[] = [
  {
    id: "node-vpn",
    label: "VPN Gateway (CVE-2024-3400)",
    type: "ENTRY_POINT",
    zone: "PERIMETER",
    x: 80,
    y: 130,
    ip: "194.67.210.4",
    os: "PAN-OS 10.2.8",
    compromised: true,
    criticality: "CRITICAL",
    vulnerabilities: ["CVE-2024-3400 (Palo Alto GlobalProtect RCE)", "Weak MFA Bypass"],
    privileges: "Unauthenticated External -> Root Shell",
    blastRadiusHosts: 45
  },
  {
    id: "node-phish",
    label: "Spear Phishing / Invoice LNK",
    type: "ENTRY_POINT",
    zone: "PERIMETER",
    x: 80,
    y: 310,
    ip: "10.14.8.44",
    os: "Windows 11 23H2",
    compromised: true,
    criticality: "HIGH",
    vulnerabilities: ["Macro / ISO Stager", "Qakbot / DarkGate payload"],
    privileges: "Standard User (Finance Clerk)",
    blastRadiusHosts: 12
  },
  {
    id: "node-ws-fin01",
    label: "FIN-WS-09 (Finance Workstation)",
    type: "WORKSTATION",
    zone: "USER_SUBNET",
    x: 270,
    y: 220,
    ip: "10.14.8.109",
    os: "Windows 11 Enterprise",
    compromised: true,
    criticality: "HIGH",
    vulnerabilities: ["Uncached Kerberos Ticket", "Local Admin NTLM Hash"],
    privileges: "Local Administrator",
    blastRadiusHosts: 38
  },
  {
    id: "node-lsass",
    label: "LSASS Memory / Mimikatz Dump",
    type: "CREDENTIAL_STORE",
    zone: "CORE_IDENTITY",
    x: 460,
    y: 140,
    ip: "10.14.8.109 (In-Memory)",
    os: "LSASS Process Cache",
    compromised: true,
    criticality: "CRITICAL",
    vulnerabilities: ["WDigest Plaintext Cache", "LSA Protection Not Enforced"],
    privileges: "svc_backup_mgmt (Domain Admin Hash)",
    blastRadiusHosts: 120
  },
  {
    id: "node-dc01",
    label: "Primary Domain Controller (DC01)",
    type: "DOMAIN_CONTROLLER",
    zone: "CORE_IDENTITY",
    x: 650,
    y: 220,
    ip: "10.14.2.10",
    os: "Windows Server 2022 Datacenter",
    compromised: true,
    criticality: "CRITICAL",
    vulnerabilities: ["AD GPO Push Rights", "KRBTGT Master Secret Exposure"],
    privileges: "Enterprise Administrator",
    blastRadiusHosts: 350
  },
  {
    id: "node-hyperv",
    label: "Hyper-V / ESXi Clustered Hosts",
    type: "HYPERVISOR",
    zone: "DATA_TIER",
    x: 840,
    y: 120,
    ip: "10.14.1.12",
    os: "VMware ESXi 7.0u3 / Hyper-V",
    compromised: true,
    criticality: "CRITICAL",
    vulnerabilities: ["Open SSH Port 22", "Shared Root Password"],
    privileges: "Hypervisor Root (Virtual Machine Kill Rights)",
    blastRadiusHosts: 220
  },
  {
    id: "node-sql-prod",
    label: "Core SQL & PACS Production DB",
    type: "DATABASE",
    zone: "DATA_TIER",
    x: 840,
    y: 320,
    ip: "10.14.3.15",
    os: "SQL Server 2022 Enterprise",
    compromised: true,
    criticality: "CRITICAL",
    vulnerabilities: ["Direct SMB share traversal", "VSS Shadow Copies Enabled"],
    privileges: "sysadmin SA / NT AUTHORITY\\SYSTEM",
    blastRadiusHosts: 80
  },
  {
    id: "node-backup-repo",
    label: "Veeam / NAS Backup Storage Vault",
    type: "BACKUP_REPO",
    zone: "BACKUP_VAULT",
    x: 1020,
    y: 220,
    ip: "10.14.99.5",
    os: "Linux Hardened Repository / NAS",
    compromised: false,
    criticality: "CRITICAL",
    vulnerabilities: ["Direct SMBv1 routing from DC", "Shared domain service account"],
    privileges: "Targeted for Encryption & Shadow Deletion",
    blastRadiusHosts: 500
  }
];

// Initial Attack Path Edges
const INITIAL_EDGES: AttackPathEdge[] = [
  {
    id: "edge-1",
    source: "node-vpn",
    target: "node-ws-fin01",
    protocol: "RDP",
    technique: "T1133 External Remote Services -> T1021.001 Remote Desktop",
    mitreId: "T1133",
    isChokepoint: false,
    riskScore: 88,
    disabled: false
  },
  {
    id: "edge-2",
    source: "node-phish",
    target: "node-ws-fin01",
    protocol: "WMI_EXEC",
    technique: "T1566 Phishing -> T1047 WMI Process Creation",
    mitreId: "T1566",
    isChokepoint: false,
    riskScore: 78,
    disabled: false
  },
  {
    id: "edge-3",
    source: "node-ws-fin01",
    target: "node-lsass",
    protocol: "LSASS_INJECTION",
    technique: "T1003.001 OS Credential Dumping: LSASS Memory",
    mitreId: "T1003.001",
    isChokepoint: true,
    chokepointName: "Chokepoint Alpha: Enforce Windows LAPS & RunAsPPL",
    chokepointRemediation: "Enable LSA Protection (RunAsPPL) and rotate local admin passwords via Microsoft LAPS to block credential harvest from LSASS.",
    riskScore: 98,
    disabled: false
  },
  {
    id: "edge-4",
    source: "node-lsass",
    target: "node-dc01",
    protocol: "KERBEROS_TGS",
    technique: "T1558.003 Kerberoasting / Overpass-the-Hash onto DC01",
    mitreId: "T1558.003",
    isChokepoint: true,
    chokepointName: "Chokepoint Beta: Tier-0 PAW & Kerberos Armor",
    chokepointRemediation: "Enforce Privileged Access Workstations (PAWs) and restrict Domain Admin logon rights exclusively to Tier-0 management enclaves.",
    riskScore: 96,
    disabled: false
  },
  {
    id: "edge-5",
    source: "node-dc01",
    target: "node-hyperv",
    protocol: "SSH",
    technique: "T1021.004 Remote Services: SSH Root Execution via PuTTY saved session",
    mitreId: "T1021.004",
    isChokepoint: false,
    riskScore: 92,
    disabled: false
  },
  {
    id: "edge-6",
    source: "node-dc01",
    target: "node-sql-prod",
    protocol: "SMB",
    technique: "T1021.002 SMB / PsExec mass binary push & vssadmin shadow delete",
    mitreId: "T1021.002",
    isChokepoint: false,
    riskScore: 94,
    disabled: false
  },
  {
    id: "edge-7",
    source: "node-dc01",
    target: "node-backup-repo",
    protocol: "SMB",
    technique: "T1485 Data Destruction & T1490 Inhibit System Recovery (NAS wipe attempt)",
    mitreId: "T1490",
    isChokepoint: true,
    chokepointName: "Chokepoint Gamma: Isolate Backup VLAN & Airgap IAM",
    chokepointRemediation: "Sever all direct SMB/RPC routing from production DC to backup storage; require out-of-band hardware MFA and AWS S3 Object Lock compliance WORM.",
    riskScore: 99,
    disabled: false
  }
];

const INITIAL_CHOKEPOINTS: ChokepointRecommendation[] = [
  {
    id: "choke-1",
    title: "1. Enforce LSA Protection (RunAsPPL) & LAPS Password Randomization",
    description: "Blocks Mimikatz and ProcDump from reading plaintext Kerberos tickets and NTLM hashes in LSASS memory on compromised endpoints.",
    edgeId: "edge-3",
    sourceNode: "FIN-WS-09",
    targetNode: "LSASS Memory Dump",
    impactReductionPct: 68,
    effort: "LOW",
    mitigationType: "GPO_POLICY",
    implementationCommand: "Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Lsa' -Name 'RunAsPPL' -Value 1 -Type DWord; Update-LapsADSchema",
    isApplied: false
  },
  {
    id: "choke-2",
    title: "2. Sever Domain Admin Logon to User Workstations (Tier-0 Boundary)",
    description: "Restricts svc_backup_mgmt and DA accounts from authenticating to workstations, eliminating Pass-the-Hash elevation to DC01.",
    edgeId: "edge-4",
    sourceNode: "LSASS Memory Dump",
    targetNode: "Primary Domain Controller (DC01)",
    impactReductionPct: 84,
    effort: "MEDIUM",
    mitigationType: "CREDENTIAL_TIERING",
    implementationCommand: "New-GPO -Name 'Tier-0 Restricted Delegation' | Set-GPPermissions -TargetName 'Domain Admins' -DenyLogonLocally",
    isApplied: false
  },
  {
    id: "choke-3",
    title: "3. Air-Gap Backup Repository VLAN & Mandate S3 Object Lock WORM",
    description: "Completely breaks lateral traversal between active Domain Controller and backup storage, preventing shadow copy and snapshot deletion.",
    edgeId: "edge-7",
    sourceNode: "Primary Domain Controller (DC01)",
    targetNode: "Backup Storage Vault",
    impactReductionPct: 100,
    effort: "MEDIUM",
    mitigationType: "NETWORK_MICROSEG",
    implementationCommand: "aws s3api put-object-lock-configuration --bucket aegis-immutable-vault --object-lock-configuration '{ \"ObjectLockEnabled\": \"Enabled\", \"Rule\": { \"DefaultRetention\": { \"Mode\": \"COMPLIANCE\", \"Days\": 90 } } }'",
    isApplied: false
  }
];

export default function AttackPathsPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [selectedProtocol, setSelectedProtocol] = useState<string>("ALL");
  const [selectedNode, setSelectedNode] = useState<AttackPathNode>(INITIAL_NODES[0]);
  const [edges, setEdges] = useState<AttackPathEdge[]>(INITIAL_EDGES);
  const [chokepoints, setChokepoints] = useState<ChokepointRecommendation[]>(INITIAL_CHOKEPOINTS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatingBreach, setSimulatingBreach] = useState(false);

  const activeCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  // Calculate Lockout Risk based on applied chokepoints
  const appliedChokepointsCount = chokepoints.filter((c) => c.isApplied).length;
  const lockoutRiskPct = Math.max(0, 100 - chokepoints.reduce((acc, c) => c.isApplied ? acc + (c.impactReductionPct / 3) : acc, 0));
  const blastRadiusReductionPct = appliedChokepointsCount === 3 ? 100 : appliedChokepointsCount === 2 ? 82 : appliedChokepointsCount === 1 ? 45 : 0;

  const toggleChokepoint = (id: string) => {
    const updated = chokepoints.map((choke) => {
      if (choke.id === id) {
        const nextState = !choke.isApplied;
        // Update corresponding edge disabled status
        setEdges((prevEdges) =>
          prevEdges.map((e) =>
            e.id === choke.edgeId ? { ...e, disabled: nextState } : e
          )
        );
        return { ...choke, isApplied: nextState };
      }
      return choke;
    });
    setChokepoints(updated);
  };

  const applyAllChokepoints = () => {
    setChokepoints((prev) =>
      prev.map((c) => ({ ...c, isApplied: true }))
    );
    setEdges((prev) =>
      prev.map((e) => (e.isChokepoint ? { ...e, disabled: true } : e))
    );
  };

  const resetGraph = () => {
    setChokepoints(INITIAL_CHOKEPOINTS);
    setEdges(INITIAL_EDGES);
  };

  const handleCopyCommand = (command: string, id: string) => {
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerBreachSimulation = () => {
    setSimulatingBreach(true);
    setTimeout(() => {
      setSimulatingBreach(false);
    }, 2400);
  };

  const filteredEdges = selectedProtocol === "ALL"
    ? edges
    : edges.filter((e) => e.protocol === selectedProtocol);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1440, margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.05) 50%, rgba(14,21,38,0.9) 100%)",
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
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <GitGraph size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
                Ransomware Attack Path & Chokepoint Graph
              </h1>
              <span className="badge-sev badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <ShieldCheck size={11} /> STAGE 2: PREVENT
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              Maps critical lateral movement vectors from Phishing / Edge VPN → Workstation → LSASS → DC → Backup Storage and recommends pivotal link breaks.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <select
            className="tool-select"
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            style={{ minWidth: 230 }}
          >
            {MOCK_CASES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.ransomwareFamily}
              </option>
            ))}
          </select>

          <button
            className="btn-secondary"
            onClick={resetGraph}
            style={{ fontSize: 12 }}
            title="Reset simulation and chokepoints"
          >
            <RotateCcw size={14} /> Reset Graph
          </button>

          <button
            className="btn-primary"
            onClick={triggerBreachSimulation}
            disabled={simulatingBreach}
            style={{ fontSize: 12 }}
          >
            <Play size={14} className={simulatingBreach ? "animate-spin" : ""} />
            {simulatingBreach ? "Simulating Lateral Traversal..." : "Simulate Breach Traversal"}
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Enterprise Lockout Risk
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span style={{
              fontSize: 28,
              fontWeight: 800,
              color: lockoutRiskPct > 60 ? "var(--rose)" : lockoutRiskPct > 20 ? "var(--amber)" : "var(--primary)"
            }}>
              {Math.round(lockoutRiskPct)}%
            </span>
            <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
              {lockoutRiskPct === 0 ? "100% Mitigated" : "Catastrophic Exposure"}
            </span>
          </div>
          <div style={{
            height: 5,
            width: "100%",
            background: "var(--surface-3)",
            borderRadius: 3,
            marginTop: 10,
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              width: `${lockoutRiskPct}%`,
              background: lockoutRiskPct > 60 ? "var(--rose)" : lockoutRiskPct > 20 ? "var(--amber)" : "var(--primary)",
              transition: "width 0.4s ease"
            }} />
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Pivotal Chokepoints Identified
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--cyan)" }}>
              {appliedChokepointsCount} / {chokepoints.length}
            </span>
            <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
              Links Broken
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 6 }}>
            Breaking all 3 eliminates 100% traversal to backup storage repository.
          </p>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Blast Radius Reduction
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)" }}>
              +{blastRadiusReductionPct}%
            </span>
            <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
              Isolates 500+ Nodes
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 6 }}>
            Protects Tier-0 Active Directory & Veeam / S3 Object Lock Vaults.
          </p>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Active Threat Actor
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--rose)" }}>
              {activeCase.ransomwareFamily}
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Primary Vector: {activeCase.summary.split(".")[0]}
          </p>
        </div>
      </div>

      {/* Main Interactive Graph & Inspector Area */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18, alignItems: "start" }}>
        {/* SVG Attack Graph Canvas */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Canvas Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Filter size={14} color="var(--muted)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>Vector Protocol:</span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {["ALL", "SMB", "KERBEROS_TGS", "LSASS_INJECTION", "RDP", "SSH", "WMI_EXEC"].map((proto) => (
                  <button
                    key={proto}
                    onClick={() => setSelectedProtocol(proto)}
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: selectedProtocol === proto ? "var(--primary)" : "var(--border)",
                      background: selectedProtocol === proto ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                      color: selectedProtocol === proto ? "var(--primary)" : "var(--fg-2)",
                      cursor: "pointer"
                    }}
                  >
                    {proto}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="btn-primary"
                onClick={applyAllChokepoints}
                style={{ fontSize: 11, padding: "5px 10px" }}
              >
                <ShieldCheck size={13} /> Break All 3 Chokepoints
              </button>
            </div>
          </div>

          {/* SVG Graph Viewport */}
          <div style={{
            position: "relative",
            background: "#080d19",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden"
          }}>
            {/* Zone Background Columns */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1.2fr 1.2fr 1.2fr 1.2fr",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.15,
              pointerEvents: "none"
            }}>
              <div style={{ borderRight: "1px dashed var(--border)", padding: 8, fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>ZONE 1: PERIMETER</div>
              <div style={{ borderRight: "1px dashed var(--border)", padding: 8, fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>ZONE 2: USER SUBNET</div>
              <div style={{ borderRight: "1px dashed var(--border)", padding: 8, fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>ZONE 3: CORE IDENTITY</div>
              <div style={{ borderRight: "1px dashed var(--border)", padding: 8, fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>ZONE 4: DATA TIER</div>
              <div style={{ padding: 8, fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>ZONE 5: BACKUP VAULT</div>
            </div>

            <svg
              viewBox="0 0 1180 440"
              style={{ width: "100%", height: "auto", minHeight: 420, display: "block" }}
            >
              <defs>
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Draw Edges */}
              {filteredEdges.map((edge) => {
                const sourceNode = INITIAL_NODES.find((n) => n.id === edge.source);
                const targetNode = INITIAL_NODES.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isEdgeDisabled = edge.disabled;
                const isChoke = edge.isChokepoint;

                const midX = (sourceNode.x + targetNode.x) / 2 + 30;
                const midY = (sourceNode.y + targetNode.y) / 2 + 25;

                return (
                  <g key={edge.id}>
                    {/* Path line */}
                    <line
                      x1={sourceNode.x + 60}
                      y1={sourceNode.y + 30}
                      x2={targetNode.x + 10}
                      y2={targetNode.y + 30}
                      stroke={isEdgeDisabled ? "#10b981" : isChoke ? "#f43f5e" : "#3b82f6"}
                      strokeWidth={isChoke ? (isEdgeDisabled ? 2 : 3.5) : 2}
                      strokeDasharray={isEdgeDisabled ? "6,4" : isChoke ? "0" : "4,2"}
                      opacity={isEdgeDisabled ? 0.45 : 0.9}
                      filter={isEdgeDisabled ? "none" : isChoke ? "url(#glow-red)" : "none"}
                    />

                    {/* Edge Label / Chokepoint Badge */}
                    <g transform={`translate(${midX}, ${midY - 10})`}>
                      <rect
                        x="-48"
                        y="-10"
                        width="96"
                        height="20"
                        rx="4"
                        fill={isEdgeDisabled ? "rgba(16,185,129,0.2)" : isChoke ? "rgba(244,63,94,0.3)" : "rgba(14,21,38,0.85)"}
                        stroke={isEdgeDisabled ? "#10b981" : isChoke ? "#f43f5e" : "#1e2c4d"}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill={isEdgeDisabled ? "#10b981" : isChoke ? "#ff8095" : "#cbd5e1"}
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {isEdgeDisabled ? "✓ SEVERED" : isChoke ? "⚠️ CHOKEPOINT" : edge.protocol}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {INITIAL_NODES.map((node) => {
                const isSelected = selectedNode.id === node.id;
                const isTarget = node.type === "BACKUP_REPO";
                const isEntryPoint = node.type === "ENTRY_POINT";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedNode(node)}
                  >
                    {/* Node Container Card */}
                    <rect
                      x="0"
                      y="0"
                      width="155"
                      height="62"
                      rx="8"
                      fill={isSelected ? "rgba(30,44,77,0.95)" : "rgba(14,21,38,0.9)"}
                      stroke={
                        isSelected
                          ? "var(--primary)"
                          : node.criticality === "CRITICAL"
                          ? "rgba(244,63,94,0.7)"
                          : "var(--border)"
                      }
                      strokeWidth={isSelected ? 2 : 1}
                      filter={isSelected ? "url(#glow-green)" : "none"}
                    />

                    {/* Left Accent Strip */}
                    <rect
                      x="0"
                      y="0"
                      width="5"
                      height="62"
                      rx="2"
                      fill={
                        isEntryPoint
                          ? "#f43f5e"
                          : isTarget
                          ? "#10b981"
                          : node.criticality === "CRITICAL"
                          ? "#f59e0b"
                          : "#3b82f6"
                      }
                    />

                    {/* Node Title */}
                    <text
                      x="14"
                      y="20"
                      fill="#f8fafc"
                      fontSize="10.5"
                      fontWeight="700"
                    >
                      {node.label.length > 20 ? node.label.substring(0, 18) + "..." : node.label}
                    </text>

                    {/* Node IP & OS Subtitle */}
                    <text
                      x="14"
                      y="36"
                      fill="#8493a8"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {node.ip}
                    </text>

                    {/* Status Pill */}
                    <g transform="translate(14, 42)">
                      <rect
                        x="0"
                        y="0"
                        width="70"
                        height="14"
                        rx="3"
                        fill={
                          node.compromised
                            ? "rgba(244,63,94,0.2)"
                            : "rgba(16,185,129,0.2)"
                        }
                        stroke={
                          node.compromised
                            ? "rgba(244,63,94,0.4)"
                            : "rgba(16,185,129,0.4)"
                        }
                        strokeWidth="0.5"
                      />
                      <text
                        x="35"
                        y="10"
                        textAnchor="middle"
                        fill={node.compromised ? "#f43f5e" : "#10b981"}
                        fontSize="7.5"
                        fontWeight="800"
                        fontFamily="monospace"
                      >
                        {node.compromised ? "COMPROMISED" : "PROTECTED"}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Attack Stage Progression Sequence */}
          <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "12px 16px"
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              Ransomware Lateral Progression Sequence
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              {[
                { stage: "Stage 1", name: "Initial Breach (VPN / Phish)", status: "COMPLETED", color: "var(--rose)" },
                { stage: "Stage 2", name: "Endpoint Pivot (FIN-WS-09)", status: "COMPLETED", color: "var(--rose)" },
                { stage: "Stage 3", name: "LSASS Credential Harvest", status: chokepoints[0].isApplied ? "BLOCKED" : "COMPLETED", color: chokepoints[0].isApplied ? "var(--primary)" : "var(--rose)" },
                { stage: "Stage 4", name: "DC01 Compromise & GPO Push", status: chokepoints[1].isApplied ? "BLOCKED" : "COMPLETED", color: chokepoints[1].isApplied ? "var(--primary)" : "var(--rose)" },
                { stage: "Stage 5", name: "Backup Storage Lockout", status: (chokepoints[2].isApplied || chokepoints[0].isApplied) ? "BLOCKED" : "IN_DANGER", color: (chokepoints[2].isApplied || chokepoints[0].isApplied) ? "var(--primary)" : "var(--amber)" },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "var(--surface)",
                    border: `1px solid ${item.status === "BLOCKED" ? "rgba(16,185,129,0.4)" : "var(--border)"}`
                  }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: item.color }}>{item.stage}: {item.status}</span>
                    <span style={{ fontSize: 11, color: "var(--fg)" }}>{item.name}</span>
                  </div>
                  {idx < 4 && <ArrowRight size={14} color="var(--muted)" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node Inspector Drawer & Chokepoint Action Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Node Details Card */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Server size={16} color="var(--primary)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>Node Inspector</span>
              </div>
              <span className={`badge-sev ${selectedNode.criticality === "CRITICAL" ? "badge-critical" : "badge-high"}`}>
                {selectedNode.criticality}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
              <div>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>Node Name:</span>
                <div style={{ fontWeight: 700, color: "var(--fg)", marginTop: 2 }}>{selectedNode.label}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>IP Address:</span>
                  <div style={{ fontFamily: "monospace", color: "var(--cyan)" }}>{selectedNode.ip}</div>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>Zone:</span>
                  <div style={{ color: "var(--fg-2)" }}>{selectedNode.zone}</div>
                </div>
              </div>

              <div>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>Operating System:</span>
                <div style={{ color: "var(--fg-2)" }}>{selectedNode.os}</div>
              </div>

              <div>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>Privilege Level:</span>
                <div style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  background: "rgba(244,63,94,0.1)",
                  border: "1px solid rgba(244,63,94,0.3)",
                  color: "#f43f5e",
                  fontFamily: "monospace",
                  fontSize: 11,
                  marginTop: 2
                }}>
                  {selectedNode.privileges}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>Exploitable Vulnerabilities:</span>
                <ul style={{ paddingLeft: 16, marginTop: 4, color: "var(--fg-2)", fontSize: 11.5 }}>
                  {selectedNode.vulnerabilities.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Blast Radius if Compromised:</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--rose)" }}>
                  {selectedNode.blastRadiusHosts} Hosts
                </span>
              </div>
            </div>
          </div>

          {/* 3 Pivotal Chokepoints Remediation List */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={16} color="var(--amber)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>3 Pivotal Chokepoints</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700 }}>
                {appliedChokepointsCount}/3 Active
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {chokepoints.map((choke) => (
                <div
                  key={choke.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 8,
                    background: choke.isApplied ? "rgba(16,185,129,0.08)" : "var(--surface-2)",
                    border: `1px solid ${choke.isApplied ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: choke.isApplied ? "var(--primary)" : "var(--fg)" }}>
                      {choke.title}
                    </div>
                    <button
                      onClick={() => toggleChokepoint(choke.id)}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 10.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "none",
                        background: choke.isApplied ? "var(--primary)" : "var(--surface-3)",
                        color: choke.isApplied ? "#04100c" : "var(--fg)"
                      }}
                    >
                      {choke.isApplied ? "SEVERED" : "SEVER LINK"}
                    </button>
                  </div>

                  <p style={{ fontSize: 11, color: "var(--muted)" }}>
                    {choke.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5 }}>
                    <span style={{ color: "var(--cyan)", fontWeight: 600 }}>
                      Impact Reduction: -{choke.impactReductionPct}%
                    </span>
                    <span style={{ color: "var(--muted)" }}>
                      Effort: {choke.effort}
                    </span>
                  </div>

                  {/* PowerShell / Command Snippet */}
                  <div style={{
                    position: "relative",
                    background: "#040811",
                    padding: "6px 28px 6px 8px",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.05)",
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#a7f3d0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {choke.implementationCommand}
                    <button
                      onClick={() => handleCopyCommand(choke.implementationCommand, choke.id)}
                      style={{
                        position: "absolute",
                        right: 4,
                        top: 4,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: copiedId === choke.id ? "var(--primary)" : "var(--muted)"
                      }}
                      title="Copy implementation command"
                    >
                      {copiedId === choke.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
