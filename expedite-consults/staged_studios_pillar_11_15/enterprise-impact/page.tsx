"use client";

import { useState, useMemo } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import { MalwareSample } from "@/types/malware";
import { downloadBlob, sevColor, sevBg, sevBorder } from "@/lib/utils";
import {
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  DollarSign,
  Clock,
  Server,
  Database,
  Lock,
  Unlock,
  Key,
  Users,
  Activity,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Check
} from "lucide-react";

interface AttackHop {
  id: number;
  stageName: string;
  assetName: string;
  assetType: "Workstation" | "Server" | "DomainController" | "Database" | "Cloud";
  zone: string;
  technique: string;
  techniqueId: string;
  compromiseProbability: number; // 0 - 100%
  timeToCompromiseMinutes: number;
  impactScore: number; // 0 - 100
  status: "Compromised" | "Active_Attack" | "At_Risk" | "Protected";
  chokePointRemediation: string;
}

interface CompensatingControl {
  name: string;
  category: string;
  status: "Active" | "Bypassed" | "Missing" | "Partial";
  targetHop: string;
  gapDetails: string;
  remediationCost: string;
}

const TOPOLOGY_PRESETS = [
  {
    id: "financial",
    name: "Tier-1 Financial Network & SWIFT Gateway",
    description: "Multi-tiered banking infrastructure with PCI-DSS cardholder databases and SWIFT payment rails.",
    crownJewels: "SWIFT Transaction Gateway & Oracle Core Banking DB",
    estimatedValue: "$48,500,000"
  },
  {
    id: "healthcare",
    name: "Regional Healthcare Hospital & Epic EHR",
    description: "Connected hospital subnet with medical telemetry IoT, PACS medical imaging, and Epic EHR records.",
    crownJewels: "Epic Systems Electronic Health Records (EHR)",
    estimatedValue: "$32,000,000"
  },
  {
    id: "cloud_hybrid",
    name: "Cloud Hybrid AWS VPC & Azure AD Entra",
    description: "Enterprise hybrid cloud with on-prem Active Directory syncing to AWS IAM roles and Kubernetes clusters.",
    crownJewels: "AWS Production S3 Buckets & Customer PII Cluster",
    estimatedValue: "$24,000,000"
  },
  {
    id: "critical_infra",
    name: "Critical Infrastructure OT & SCADA Grid",
    description: "Industrial control networks with Purdue model levels 0 to 4 connecting HMIs and substation PLCs.",
    crownJewels: "Substation SCADA Master HMI & Turbine Controllers",
    estimatedValue: "$75,000,000"
  }
];

export default function EnterpriseImpactPage() {
  const [selectedSample, setSelectedSample] = useState<MalwareSample>(MALWARE_SAMPLES[0]);
  const [selectedTopology, setSelectedTopology] = useState(TOPOLOGY_PRESETS[0]);
  const [chokePointApplied, setChokePointApplied] = useState(false);
  const [activeTab, setActiveTab] = useState<"attack_path" | "blast_radius" | "controls_gap" | "choke_points">("attack_path");

  // Dynamic Attack Path Generation based on Malware Capabilities
  const attackHops = useMemo<AttackHop[]>(() => {
    const s = selectedSample;
    const isWorm = s.capabilities.some(c => c.toLowerCase().includes("smb") || c.toLowerCase().includes("propagation"));
    const isLsass = s.memoryAnalysis.lsassAccess.grantedAccess !== "None" || s.capabilities.some(c => c.toLowerCase().includes("lsass"));
    const isStealer = s.family === "Stealer";

    return [
      {
        id: 1,
        stageName: "Patient Zero Infiltration",
        assetName: "CORP-WS-8491 (Finance Analyst)",
        assetType: "Workstation",
        zone: "Corp User VLAN (10.10.20.0/24)",
        technique: "Initial Execution / Masquerading",
        techniqueId: "T1204 / T1036",
        compromiseProbability: 100,
        timeToCompromiseMinutes: 0.5,
        impactScore: 35,
        status: "Compromised",
        chokePointRemediation: "EDR Behavioral Process Blocking & Automated Host Isolation"
      },
      {
        id: 2,
        stageName: "Local Privilege Escalation",
        assetName: "CORP-WS-8491 (SYSTEM Privileges)",
        assetType: "Workstation",
        zone: "Host Local Security Authority",
        technique: "UAC Bypass / Access Token Impersonation",
        techniqueId: "T1068 / T1134",
        compromiseProbability: 94,
        timeToCompromiseMinutes: 1.8,
        impactScore: 55,
        status: "Compromised",
        chokePointRemediation: "Enforce Windows LAPS & Remove Local Admin Privileges"
      },
      {
        id: 3,
        stageName: "Credential Harvesting (LSASS)",
        assetName: "Local SAM Database & Memory Cache",
        assetType: "Workstation",
        zone: "LSASS.exe Process Memory",
        technique: isLsass ? "OS Credential Dumping (LSASS Memory)" : "Credentials from Web Browsers",
        techniqueId: isLsass ? "T1003.001" : "T1555.003",
        compromiseProbability: isLsass ? 98 : 82,
        timeToCompromiseMinutes: 3.2,
        impactScore: 78,
        status: chokePointApplied ? "Protected" : "Compromised",
        chokePointRemediation: "Enable Windows Defender Credential Guard (Virtualization-Based Security)"
      },
      {
        id: 4,
        stageName: "Lateral Movement & Worming",
        assetName: isWorm ? "Subnet-Wide SMB Broadcast" : "CORP-SRV-APPMGT (Internal Server)",
        assetType: "Server",
        zone: "Server Farm DMZ (10.10.100.0/24)",
        technique: isWorm ? "SMBv1 MS17-010 EternalBlue Worm" : "Pass-the-Hash / WinRM Remote Execution",
        techniqueId: isWorm ? "T1210" : "T1550.002",
        compromiseProbability: isWorm ? (chokePointApplied ? 15 : 96) : (chokePointApplied ? 20 : 78),
        timeToCompromiseMinutes: isWorm ? 4.5 : 8.0,
        impactScore: 88,
        status: chokePointApplied ? "Protected" : "Compromised",
        chokePointRemediation: "Strict Zero-Trust Microsegmentation: Block TCP 445 / 5985 cross-VLAN"
      },
      {
        id: 5,
        stageName: "Active Directory Domain Escalation",
        assetName: "PRIMARY-DC-01 (Active Directory)",
        assetType: "DomainController",
        zone: "Identity Core (10.10.5.0/24)",
        technique: "Kerberoasting & DCSync Replication",
        techniqueId: "T1558.003 / T1003.006",
        compromiseProbability: chokePointApplied ? 5 : 89,
        timeToCompromiseMinutes: 11.4,
        impactScore: 98,
        status: chokePointApplied ? "Protected" : "Compromised",
        chokePointRemediation: "Rotate Active Directory KRBTGT Password Twice & Enforce Tier-0 Silo"
      },
      {
        id: 6,
        stageName: "Crown Jewels Exfiltration / Encryption",
        assetName: selectedTopology.crownJewels,
        assetType: "Database",
        zone: "Secure Data Vault (10.10.1.0/24)",
        technique: isStealer ? "Data Exfiltration over C2 Channel" : "Data Encrypted for Impact (Ransomware)",
        techniqueId: isStealer ? "T1041" : "T1486",
        compromiseProbability: chokePointApplied ? 2 : 92,
        timeToCompromiseMinutes: 14.8,
        impactScore: 100,
        status: chokePointApplied ? "Protected" : "Compromised",
        chokePointRemediation: "Air-Gapped Immutable Storage Backups & Database Field-Level Encryption"
      }
    ];
  }, [selectedSample, selectedTopology, chokePointApplied]);

  // Quantified Financial Exposure Calculation
  const financialExposure = useMemo(() => {
    if (chokePointApplied) {
      return {
        total: "$185,000",
        downtime: "$45,000",
        forensics: "$80,000",
        regulatoryFines: "$0",
        ransomLeverage: "$0",
        reductionPercent: "96.2%",
        blastRadiusScore: 12.4
      };
    }

    const baseVal = selectedSample.riskScore > 90 ? 4850000 : 1850000;
    return {
      total: `$${(baseVal * 1.8).toLocaleString()}`,
      downtime: `$${(baseVal * 0.45).toLocaleString()}`,
      forensics: `$${(baseVal * 0.25).toLocaleString()}`,
      regulatoryFines: `$${(baseVal * 0.6).toLocaleString()}`,
      ransomLeverage: `$${(baseVal * 0.5).toLocaleString()}`,
      reductionPercent: "0%",
      blastRadiusScore: selectedSample.riskScore > 90 ? 94.5 : 76.0
    };
  }, [selectedSample, chokePointApplied]);

  // Compensating Controls Matrix
  const compensatingControls: CompensatingControl[] = [
    {
      name: "Network Microsegmentation (Port 445/RPC)",
      category: "Network Defense",
      status: chokePointApplied ? "Active" : "Bypassed",
      targetHop: "Hop 4: Lateral Movement",
      gapDetails: "Open SMB port 445 allowed worm propagation across workstation VLANs.",
      remediationCost: "$12,000 (Palo Alto ACL Update)"
    },
    {
      name: "Windows Defender Credential Guard (VBS)",
      category: "Endpoint Isolation",
      status: chokePointApplied ? "Active" : "Missing",
      targetHop: "Hop 3: LSASS Harvest",
      gapDetails: "Virtualization-based security disabled on legacy Windows 10 endpoints.",
      remediationCost: "$5,000 (Group Policy rollout)"
    },
    {
      name: "Tier-0 Active Directory Admin Tiering",
      category: "Identity & Access",
      status: chokePointApplied ? "Active" : "Partial",
      targetHop: "Hop 5: Domain Controller",
      gapDetails: "Domain Admin credentials cached on Tier-3 workstation memory.",
      remediationCost: "$25,000 (Architecture overhaul)"
    },
    {
      name: "Air-Gapped Immutable Snapshot Backups",
      category: "Disaster Recovery",
      status: "Active",
      targetHop: "Hop 6: Crown Jewels",
      gapDetails: "WORM immutable storage retains 30-day offline snapshots.",
      remediationCost: "Implemented"
    }
  ];

  // Export Assessment
  const handleExportAssessment = () => {
    const reportData = {
      title: "CERBERUS Enterprise Attack Path & Blast Radius Report",
      sample: selectedSample.name,
      topology: selectedTopology.name,
      financialExposure,
      chokePointApplied,
      attackHops,
      compensatingControls,
      generatedAt: new Date().toISOString()
    };
    downloadBlob(JSON.stringify(reportData, null, 2), `enterprise_impact_${selectedSample.id}.json`, "application/json");
  };

  return (
    <div style={{ padding: "20px 24px", minHeight: "100%", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        paddingBottom: 16,
        marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "rgba(6, 182, 212, 0.12)",
            border: "1px solid rgba(6, 182, 212, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <GitBranch size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--fg)" }}>
                Enterprise Attack Path & Lateral Movement Estimator
              </h1>
              <span className="badge-critical" style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee", borderColor: "rgba(6,182,212,0.3)" }}>
                Pillar 13 • Breach Path Engine
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Simulates realistic multi-hop breach paths from Patient Zero workstation to Active Directory and Crown Jewels. Quantifies financial blast radius and validates choke-point mitigations.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setChokePointApplied(!chokePointApplied)}
            className={chokePointApplied ? "btn-success" : "btn-primary"}
            style={{ fontSize: 11.5 }}
          >
            {chokePointApplied ? (
              <>
                <CheckCircle2 size={13} /> Choke-Points Deployed (Risk Mitigated)
              </>
            ) : (
              <>
                <Zap size={13} /> Deploy Choke-Point Policy Simulator
              </>
            )}
          </button>

          <button onClick={handleExportAssessment} className="btn-secondary" style={{ fontSize: 11.5 }}>
            Export Impact Assessment (.JSON)
          </button>
        </div>
      </div>

      {/* Control Bar: Sample & Topology Picker */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "12px 16px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 20
      }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
            1. Select Adversary Malware Profile:
          </label>
          <select
            value={selectedSample.id}
            onChange={(e) => {
              const s = MALWARE_SAMPLES.find(x => x.id === e.target.value);
              if (s) setSelectedSample(s);
            }}
            className="tool-select"
            style={{ width: "100%" }}
          >
            {MALWARE_SAMPLES.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.family} • Risk: {s.riskScore}/100)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
            2. Select Enterprise Topology Scenario:
          </label>
          <select
            value={selectedTopology.id}
            onChange={(e) => {
              const t = TOPOLOGY_PRESETS.find(x => x.id === e.target.value);
              if (t) setSelectedTopology(t);
            }}
            className="tool-select"
            style={{ width: "100%" }}
          >
            {TOPOLOGY_PRESETS.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} (Value: {t.estimatedValue})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Estimated Financial Exposure</span>
            <DollarSign size={16} color={chokePointApplied ? "var(--green)" : "var(--red)"} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: chokePointApplied ? "#10b981" : "#f87171", marginTop: 4 }}>
            {financialExposure.total}
          </div>
          <div style={{ fontSize: 10.5, color: chokePointApplied ? "var(--green)" : "var(--muted)", marginTop: 2 }}>
            {chokePointApplied ? `Risk reduced by ${financialExposure.reductionPercent}` : "Unmitigated critical exposure"}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Quantified Blast Radius</span>
            <AlertOctagon size={16} color={chokePointApplied ? "var(--green)" : "var(--yellow)"} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: chokePointApplied ? "#10b981" : "#fbbf24", marginTop: 4 }}>
            {financialExposure.blastRadiusScore.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>/ 100</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            {chokePointApplied ? "Localized to patient-zero host" : "Multi-subnet catastrophic spread"}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Time to Crown Jewels</span>
            <Clock size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginTop: 4 }}>
            {chokePointApplied ? "Severed" : "14.8 mins"}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            Automated lateral spread speed
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Target Crown Jewel</span>
            <Database size={16} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#c084fc", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selectedTopology.crownJewels}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
            Asset Value: {selectedTopology.estimatedValue}
          </div>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div style={{
        display: "flex",
        gap: 6,
        borderBottom: "1px solid var(--border)",
        marginBottom: 20
      }}>
        {[
          { id: "attack_path", label: "Multi-Hop Simulated Attack Path", icon: GitBranch },
          { id: "blast_radius", label: "Financial & Operational Blast Radius", icon: DollarSign },
          { id: "controls_gap", label: "Compensating Controls Gap Analysis", icon: ShieldCheck },
          { id: "choke_points", label: "Choke-Point Remediation Directives", icon: Zap },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: isActive ? "var(--surface)" : "transparent",
                borderTop: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                borderLeft: isActive ? "1px solid var(--border)" : "1px solid transparent",
                borderRight: isActive ? "1px solid var(--border)" : "1px solid transparent",
                borderBottom: "none",
                borderRadius: "6px 6px 0 0",
                color: isActive ? "var(--primary)" : "var(--muted)",
                fontWeight: isActive ? 700 : 500,
                fontSize: 12.5,
                cursor: "pointer"
              }}
            >
              <Icon size={14} color={isActive ? "var(--primary)" : "var(--muted)"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MULTI-HOP ATTACK PATH */}
      {activeTab === "attack_path" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                  Lateral Movement Kill Chain: {selectedSample.name} → {selectedTopology.crownJewels}
                </h3>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Step-by-step adversary pivot chain combining binary capabilities with active network topology.
                </p>
              </div>
              <span className={chokePointApplied ? "badge-low" : "badge-critical"}>
                {chokePointApplied ? "Attack Chain Severed at Hop 3" : "Active Lateral Path Unblocked"}
              </span>
            </div>

            {/* Visual Hop Flow */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {attackHops.map((hop, idx) => {
                const isBlocked = hop.status === "Protected";
                return (
                  <div
                    key={hop.id}
                    style={{
                      background: isBlocked ? "rgba(16,185,129,0.06)" : "var(--surface-2)",
                      border: isBlocked ? "1px solid rgba(16,185,129,0.3)" : "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 14,
                      display: "grid",
                      gridTemplateColumns: "80px 1fr 200px 140px",
                      gap: 16,
                      alignItems: "center"
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: isBlocked ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                        border: isBlocked ? "2px solid #10b981" : "2px solid #ef4444",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        fontWeight: 800,
                        color: isBlocked ? "#10b981" : "#ef4444"
                      }}>
                        {hop.id}
                      </div>
                      <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 4, fontFamily: "monospace" }}>
                        +{hop.timeToCompromiseMinutes} min
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>{hop.stageName}</span>
                        <span className="badge-critical" style={{ fontSize: 9.5, background: "rgba(6,182,212,0.12)", color: "#22d3ee", borderColor: "rgba(6,182,212,0.3)" }}>
                          {hop.techniqueId}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
                        Target: <strong style={{ color: "var(--fg)" }}>{hop.assetName}</strong> • <span style={{ color: "var(--muted)" }}>{hop.zone}</span>
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
                        Technique: {hop.technique}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 2 }}>Compromise Probability:</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: "100%", height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            width: `${hop.compromiseProbability}%`,
                            height: "100%",
                            background: isBlocked ? "#10b981" : hop.compromiseProbability > 80 ? "#ef4444" : "#f59e0b"
                          }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: isBlocked ? "#10b981" : "#ef4444" }}>
                          {hop.compromiseProbability}%
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span className={isBlocked ? "badge-low" : "badge-critical"} style={{ fontSize: 10 }}>
                        {isBlocked ? "BLOCKED / ISOLATED" : "COMPROMISED"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLAST RADIUS FINANCIAL QUANTIFICATION */}
      {activeTab === "blast_radius" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
              Financial Loss Exposure Breakdown ($ USD)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Operational Downtime & Business Interruption", val: financialExposure.downtime, desc: "Hourly loss of core transaction processing & billing" },
                { label: "Incident Response & Forensic Remediation", val: financialExposure.forensics, desc: "Retainer call-out, memory triage, host reimaging" },
                { label: "Regulatory Fines (GDPR / HIPAA / SEC)", val: financialExposure.regulatoryFines, desc: "Mandatory breach disclosures & data privacy penalties" },
                { label: "Ransom Demands & Extortion Leverage", val: financialExposure.ransomLeverage, desc: "Exfiltrated data auction value on dark web forums" },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: 10, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--fg)" }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#f87171", fontFamily: "monospace" }}>{item.val}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
              Asset Criticality & Crown Jewels Exposure
            </h3>
            <div style={{ padding: 14, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Selected Infrastructure Target:</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>{selectedTopology.name}</div>
              <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 6 }}>{selectedTopology.description}</div>
            </div>

            <div style={{ padding: 12, background: "rgba(6, 182, 212, 0.08)", borderRadius: 6, border: "1px solid rgba(6,182,212,0.3)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)" }}>Crown Jewels Asset:</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", marginTop: 2 }}>{selectedTopology.crownJewels}</div>
              <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
                Estimated replacement & business continuity valuation: <strong style={{ color: "#34d399" }}>{selectedTopology.estimatedValue}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPENSATING CONTROLS GAP ANALYSIS */}
      {activeTab === "controls_gap" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
              Compensating Controls & Defensive Posture Gap Matrix
            </h3>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              {compensatingControls.length} Controls Evaluated
            </span>
          </div>

          <table className="cerberus-table">
            <thead>
              <tr>
                <th>Defensive Control</th>
                <th>Category</th>
                <th>Status</th>
                <th>Target Kill-Chain Hop</th>
                <th>Vulnerability / Gap Analysis</th>
                <th>Estimated Implementation Cost</th>
              </tr>
            </thead>
            <tbody>
              {compensatingControls.map((ctrl, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: "var(--fg)" }}>{ctrl.name}</td>
                  <td style={{ fontSize: 11, color: "var(--fg-2)" }}>{ctrl.category}</td>
                  <td>
                    <span className={ctrl.status === "Active" ? "badge-low" : ctrl.status === "Partial" ? "badge-high" : "badge-critical"}>
                      {ctrl.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 10.5, color: "var(--primary)" }}>{ctrl.targetHop}</td>
                  <td style={{ fontSize: 10.5, color: "var(--muted)" }}>{ctrl.gapDetails}</td>
                  <td style={{ fontFamily: "monospace", color: "#34d399" }}>{ctrl.remediationCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: CHOKE-POINT REMEDIATION DIRECTIVES */}
      {activeTab === "choke_points" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
            Tactical Choke-Point Remediation Directives
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                priority: "PRIORITY 1 (CRITICAL)",
                title: "Cross-VLAN SMB Port 445 / RPC Null Route",
                desc: "Configure core aggregation switch ACLs to prohibit workstation-to-workstation TCP port 445 traffic. Eliminates 98% of autonomous worm propagation vectors.",
                command: "access-list 101 deny tcp 10.10.20.0 0.0.0.255 10.10.20.0 0.0.0.255 eq 445"
              },
              {
                priority: "PRIORITY 2 (HIGH)",
                title: "Enable Windows Defender Credential Guard via Group Policy",
                desc: "Isolates LSASS secrets in a Virtual Secure Mode (VSM) enclave. Prevents Mimikatz and memory dumping tools from acquiring NTLM hashes or plaintext Kerberos tickets.",
                command: "reg add HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa /v LsaCfgFlags /t REG_DWORD /d 1 /f"
              },
              {
                priority: "PRIORITY 3 (HIGH)",
                title: "Active Directory KRBTGT Key Double Rotation",
                desc: "Invalidates all forged Golden Tickets and Kerberos TGT tickets across the entire forest. Halts persistence gained via DCSync.",
                command: "Invoke-RestApi -Uri 'https://cerberus-soar/api/v1/playbook/rotate-krbtgt'"
              }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: 14, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>{item.title}</span>
                  <span className="badge-critical" style={{ fontSize: 9 }}>{item.priority}</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--fg-2)", marginBottom: 8 }}>{item.desc}</p>
                <div className="terminal-box" style={{ padding: "6px 10px", fontSize: 10.5, color: "#22d3ee" }}>
                  {item.command}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
