"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crosshair,
  Search,
  Server,
  Shield,
  ShieldAlert,
  Terminal,
  Activity,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Copy,
  Download,
  Filter,
  Zap,
  Layers,
  Database,
  Cpu,
  Lock,
  Globe,
  Radio,
  FileCode,
  ArrowRight,
  Eye,
  Sliders,
  RefreshCw
} from "lucide-react";
import { MALWARE_SAMPLES } from "@/data/samples";

// Threat Hypothesis Definition
interface ThreatHypothesis {
  id: string;
  title: string;
  tactic: string;
  tacticId: string;
  severity: "Critical" | "High" | "Medium";
  targetOs: "Windows" | "Linux" | "All";
  targetProcess: string;
  description: string;
  recommendedEngine: "osquery" | "Velociraptor" | "CrowdStrike RTR" | "MDE KQL";
  sampleId?: string;
  querySnippet: string;
}

const THREAT_HYPOTHESES: ThreatHypothesis[] = [
  {
    id: "HYPO-001",
    title: "Unbacked Executable Memory Regions (RWX) in svchost.exe",
    tactic: "Defense Evasion / Process Injection",
    tacticId: "T1055.012",
    severity: "Critical",
    targetOs: "Windows",
    targetProcess: "svchost.exe",
    description: "Hunts for hollowed or reflectively injected svchost.exe instances with PAGE_EXECUTE_READWRITE memory segments not backed by on-disk DLL modules (characteristic of Cobalt Strike Beacon or Metasploit stagers).",
    recommendedEngine: "osquery",
    sampleId: "SAMPLE-005",
    querySnippet: `SELECT p.pid, p.name, p.path, m.base_address, m.size, m.permissions
FROM processes p
JOIN process_memory_map m ON p.pid = m.pid
WHERE p.name = 'svchost.exe'
  AND m.permissions = 'rwx'
  AND m.path = '';`
  },
  {
    id: "HYPO-002",
    title: "Anomalous PuTTY / Office Spawning Hidden PowerShell",
    tactic: "Execution",
    tacticId: "T1059.001",
    severity: "High",
    targetOs: "Windows",
    targetProcess: "putty.exe / WINWORD.EXE",
    description: "Identifies interactive terminal clients or document viewers spawning hidden powershell.exe or cmd.exe child processes with network redirection flags (SillyPutty Trojan reverse shell pattern).",
    recommendedEngine: "MDE KQL",
    sampleId: "SAMPLE-002",
    querySnippet: `DeviceProcessEvents
| where InitiatingProcessFileName in~ ("putty.exe", "winword.exe", "excel.exe")
| where FileName in~ ("powershell.exe", "cmd.exe", "wscript.exe")
| where ProcessCommandLine has_any ("-w hidden", "-nop", "-enc", "TCPClient", "DownloadString")
| project Timestamp, DeviceName, InitiatingProcessFileName, FileName, ProcessCommandLine, AccountName`
  },
  {
    id: "HYPO-003",
    title: "Fleet-Wide Volume Shadow Copy Deletion Events",
    tactic: "Impact / Inhibit System Recovery",
    tacticId: "T1490",
    severity: "Critical",
    targetOs: "Windows",
    targetProcess: "vssadmin.exe / wmic.exe",
    description: "Searches for ransomware staging attempts attempting to delete Volume Shadow Copies to prevent system restore operations (WannaCry, LockBit, BlackCat indicator).",
    recommendedEngine: "Velociraptor",
    sampleId: "SAMPLE-001",
    querySnippet: `name: Windows.Detection.ShadowCopyWipe
sources:
  - query: |
      SELECT EventData.ProcessId AS PID, EventData.Image AS Image, EventData.CommandLine AS CommandLine,
             EventData.ParentImage AS ParentImage, System.TimeCreated.SystemTime AS Time
      FROM parse_evtx(filename="C:/Windows/System32/Winevt/Logs/Microsoft-Windows-Sysmon%4Operational.evtx")
      WHERE System.EventID.Value = 1
        AND CommandLine =~ "(?i)(delete\\s+shadows|shadowcopy\\s+delete|resize\\s+shadowstorage)"`
  },
  {
    id: "HYPO-004",
    title: "DPAPI MasterKey Extraction & Chromium SQLite Scraping",
    tactic: "Credential Access",
    tacticId: "T1555.003",
    severity: "High",
    targetOs: "Windows",
    targetProcess: "RedLine / Unknown Binaries",
    description: "Detects non-browser executables accessing '%LocalAppData%\\Google\\Chrome\\User Data\\Default\\Login Data' SQLite databases and calling CryptUnprotectData.",
    recommendedEngine: "osquery",
    sampleId: "SAMPLE-004",
    querySnippet: `SELECT f.path, f.filename, p.pid, p.name, p.cmdline
FROM processes p
JOIN process_open_files f ON p.pid = f.pid
WHERE f.path LIKE '%\\Google\\Chrome\\User Data\\Default\\Login Data'
  AND p.name NOT IN ('chrome.exe', 'msedge.exe', 'brave.exe');`
  },
  {
    id: "HYPO-005",
    title: "Cobalt Strike Named Pipe Pivot Infrastructure (\\pipe\\msagent_*)",
    tactic: "Command and Control / Lateral Movement",
    tacticId: "T1570",
    severity: "Critical",
    targetOs: "Windows",
    targetProcess: "All System Hosts",
    description: "Scans SMB named pipes across all corporate workstations for standard Cobalt Strike SMB beacon listeners and pivot endpoints.",
    recommendedEngine: "Velociraptor",
    sampleId: "SAMPLE-005",
    querySnippet: `name: Windows.Detection.NamedPipes
sources:
  - query: |
      SELECT Name, Instances, MaxInstances
      FROM glob(globs="\\\\.\\pipe\\*")
      WHERE Name =~ "(?i)(msagent_|status_|interact_|spoolss_rpc_)"`
  },
  {
    id: "HYPO-006",
    title: "Nim / Rust / Golang Binaries with Direct Outbound Sockets",
    tactic: "Defense Evasion / Network Egress",
    tacticId: "T1071.001",
    severity: "Medium",
    targetOs: "All",
    targetProcess: "Non-standard PE/ELF",
    description: "Hunts for compiled binaries containing language runtime signatures (e.g. '@m..@sNimMain', 'go.buildid') establishing external HTTP POST connections to unrecognized dynamic DNS domains.",
    recommendedEngine: "MDE KQL",
    sampleId: "SAMPLE-003",
    querySnippet: `DeviceNetworkEvents
| where RemotePort in (80, 443, 8080, 8443)
| where InitiatingProcessCommandLine has_any ("Nim httpclient", "Go-http-client", "reqwest")
| project Timestamp, DeviceName, InitiatingProcessFileName, RemoteIP, RemoteUrl, LocalIP`
  }
];

// Simulated Fleet Endpoints Hit Data
interface FleetHit {
  id: string;
  hostname: string;
  ip: string;
  os: string;
  user: string;
  process: string;
  pid: number;
  hash: string;
  matchedRule: string;
  detectionTime: string;
  status: "Infected" | "Quarantined" | "Remediated" | "Under Investigation";
  isolated: boolean;
}

const INITIAL_FLEET_HITS: FleetHit[] = [
  {
    id: "HIT-101",
    hostname: "FIN-SRV-04.corp.local",
    ip: "10.140.12.44",
    os: "Windows Server 2022",
    user: "NT AUTHORITY\\SYSTEM",
    process: "svchost.exe",
    pid: 5410,
    hash: "3182938102938102938102938102938102938102938102938102938102938102",
    matchedRule: "Unbacked RWX VAD Allocation (Beacon Watermark #1337)",
    detectionTime: "2026-08-23 23:14:02 UTC",
    status: "Infected",
    isolated: false
  },
  {
    id: "HIT-102",
    hostname: "DEV-WS-119.corp.local",
    ip: "10.140.88.19",
    os: "Windows 11 Enterprise",
    user: "corp\\jsmith",
    process: "SillyPutty.exe",
    pid: 2104,
    hash: "0fa642a8b30d35e1654ff4560799f2e347ad64da0ca0d5cfab4a259c7f66a2e4",
    matchedRule: "PuTTY spawned PowerShell TCP reverse shell to 192.168.195.139:4444",
    detectionTime: "2026-08-23 23:18:45 UTC",
    status: "Infected",
    isolated: false
  },
  {
    id: "HIT-103",
    hostname: "HR-DESK-02.corp.local",
    ip: "10.140.19.102",
    os: "Windows 10 Pro 22H2",
    user: "corp\\mwilson",
    process: "SikoMode.exe",
    pid: 5120,
    hash: "9ef39b6b7a9925f448c474d284a1e94829391029481928391829381928391829",
    matchedRule: "HTTP POST credential exfiltration to update.kbfirewall.com",
    detectionTime: "2026-08-23 23:22:11 UTC",
    status: "Infected",
    isolated: false
  },
  {
    id: "HIT-104",
    hostname: "EXEC-LAPTOP-01.corp.local",
    ip: "10.140.5.12",
    os: "Windows 11 Enterprise",
    user: "corp\\ceo_office",
    process: "RedLineStealer.exe",
    pid: 6104,
    hash: "d829103948102938102938102938102938102938102938102938102938102938",
    matchedRule: "MetaMask extension key scrape & Net.Tcp C2 stream",
    detectionTime: "2026-08-23 23:25:39 UTC",
    status: "Infected",
    isolated: false
  },
  {
    id: "HIT-105",
    hostname: "DC-PRIMARY-01.corp.local",
    ip: "10.140.1.10",
    os: "Windows Server 2022",
    user: "NT AUTHORITY\\SYSTEM",
    process: "tasksche.exe",
    pid: 3820,
    hash: "24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c",
    matchedRule: "WannaCry service wrapper 'mssecsvc2.0' spawned vssadmin shadow copy wipe",
    detectionTime: "2026-08-23 23:29:10 UTC",
    status: "Infected",
    isolated: false
  }
];

export default function ThreatHuntingPage() {
  const [selectedSample, setSelectedSample] = useState(MALWARE_SAMPLES[4]); // Cobalt Strike by default
  const [selectedHypothesis, setSelectedHypothesis] = useState<ThreatHypothesis>(THREAT_HYPOTHESES[0]);
  const [activeEngine, setActiveEngine] = useState<"osquery" | "Velociraptor" | "CrowdStrike RTR" | "MDE KQL">("osquery");
  
  // Fleet Query Dispatcher state
  const [sqlQuery, setSqlQuery] = useState<string>(THREAT_HYPOTHESES[0].querySnippet);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchProgress, setDispatchProgress] = useState<number>(0);
  const [fleetHits, setFleetHits] = useState<FleetHit[]>(INITIAL_FLEET_HITS);
  const [remediationToast, setRemediationToast] = useState<string | null>(null);

  // Synchronize when sample or hypothesis is selected
  const handleHypothesisSelect = (hypo: ThreatHypothesis) => {
    setSelectedHypothesis(hypo);
    setActiveEngine(hypo.recommendedEngine);
    setSqlQuery(hypo.querySnippet);
  };

  const handleSampleSelect = (sampleId: string) => {
    const s = MALWARE_SAMPLES.find(x => x.id === sampleId);
    if (s) {
      setSelectedSample(s);
      const matchedHypo = THREAT_HYPOTHESES.find(h => h.sampleId === s.id);
      if (matchedHypo) {
        handleHypothesisSelect(matchedHypo);
      }
    }
  };

  // Run Fleet-Wide Search Simulator
  const runFleetSearch = () => {
    setIsDispatching(true);
    setDispatchProgress(10);
    const interval = setInterval(() => {
      setDispatchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDispatching(false);
          setRemediationToast(`Fleet Query Completed! Polled 14,850 nodes in 1.34s. Identified ${fleetHits.length} high-confidence malicious telemetry matches.`);
          setTimeout(() => setRemediationToast(null), 6000);
          return 100;
        }
        return prev + 20;
      });
    }, 160);
  };

  // Bulk Remediation Actions
  const handleIsolateAll = () => {
    setFleetHits(prev => prev.map(h => ({ ...h, isolated: true, status: "Quarantined" })));
    setRemediationToast(`🚨 Emergency EDR Action: Successfully sent network isolation commands to all ${fleetHits.length} compromised endpoints via Falcon/MDE API.`);
    setTimeout(() => setRemediationToast(null), 5000);
  };

  const handleKillProcesses = () => {
    setFleetHits(prev => prev.map(h => ({ ...h, status: "Remediated" })));
    setRemediationToast(`⚡ Dispatched SIGKILL & TerminateProcess across fleet for PIDs: ${fleetHits.map(h => h.pid).join(", ")}. Malicious processes neutralized.`);
    setTimeout(() => setRemediationToast(null), 5000);
  };

  const handleQuarantineHashes = () => {
    setRemediationToast(`🔒 Pushed global hash blacklist to CrowdStrike Falcon / MDE Cloud Policy for 5 active malware families.`);
    setTimeout(() => setRemediationToast(null), 5000);
  };

  const handleBlockC2Ips = () => {
    setRemediationToast(`🌐 Edge Firewall API: 4 malicious C2 IPs & domains pushed to Palo Alto / Fortinet blocklist.`);
    setTimeout(() => setRemediationToast(null), 5000);
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner Header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(14,20,34,0.98) 100%)",
          border: "1px solid rgba(6,182,212,0.3)",
          borderRadius: 10,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(6,182,212,0.2)",
                color: "#06b6d4",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}
            >
              STAGE 4.1: THREAT HUNTING &amp; FLEET DISPATCHER
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>OSQUERY / VELOCIRAPTOR / CROWDSTRIKE RTR / MDE KQL</span>
            <span className="badge-critical">14,850 SENSORS ACTIVE</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            Autonomous Threat Hunting &amp; EDR Fleet Dispatcher
          </h1>
          <p style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 4, maxWidth: 840 }}>
            Converts reverse-engineered malware indicators into fleet-wide hunting queries across osquery SQL, Velociraptor VQL, CrowdStrike Real Time Response (RTR), and Microsoft Defender for Endpoint (MDE) KQL. Validates threat hypotheses, surfaces infected enterprise hosts, and executes 1-click containment.
          </p>
        </div>

        {/* Sample Synchronizer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 280 }}>
          <label style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            Sync Reverse-Engineered Sample:
          </label>
          <select
            className="tool-select"
            value={selectedSample.id}
            onChange={(e) => handleSampleSelect(e.target.value)}
            style={{ width: "100%", background: "var(--surface-2)", borderColor: "rgba(6,182,212,0.4)" }}
          >
            {MALWARE_SAMPLES.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.family} - Score: {s.riskScore})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fleet Telemetry Dashboard Banner */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12
      }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Fleet Endpoints</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#38bdf8", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <Server size={16} />
            14,850 Hosts
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Win: 11,200 | Lin: 2,950 | Mac: 700</div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Active EDR Agents</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#10b981", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <Shield size={16} />
            99.8% Online
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>CrowdStrike &bull; MDE &bull; Velociraptor</div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Compromised Hosts Identified</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#ef4444", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={16} />
            {fleetHits.filter(h => h.status === "Infected").length} Critical Hits
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Across 4 subnets</div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Mean Query Execution</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#f59e0b", marginTop: 4 }}>
            1.34 Seconds
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Distributed asynchronous polling</div>
        </div>
      </div>

      {/* Main Grid: Threat Hypothesis Catalog (Left) + Query Dispatcher Engine (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
        {/* Left Column: Threat Hypothesis Catalog */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
              <Crosshair size={14} color="#06b6d4" />
              Threat Hypothesis Catalog
            </span>
            <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 4, background: "rgba(6,182,212,0.15)", color: "#06b6d4", fontFamily: "monospace" }}>
              {THREAT_HYPOTHESES.length} Active
            </span>
          </div>

          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            Select an enterprise threat hypothesis derived from static/dynamic reverse engineering findings:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 580, overflowY: "auto", paddingRight: 4 }}>
            {THREAT_HYPOTHESES.map((hypo) => {
              const isSelected = selectedHypothesis.id === hypo.id;
              return (
                <div
                  key={hypo.id}
                  onClick={() => handleHypothesisSelect(hypo)}
                  style={{
                    background: isSelected ? "rgba(6,182,212,0.12)" : "var(--surface-2)",
                    border: isSelected ? "1px solid #06b6d4" : "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9.5, fontFamily: "monospace", color: "#38bdf8", fontWeight: 700 }}>
                      {hypo.tacticId} &bull; {hypo.tactic}
                    </span>
                    <span className={hypo.severity === "Critical" ? "badge-critical" : "badge-high"}>
                      {hypo.severity}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 800, color: isSelected ? "#06b6d4" : "#f1f5f9" }}>
                    {hypo.title}
                  </div>

                  <div style={{ fontSize: 10.5, color: "var(--muted)", lineHeight: 1.4 }}>
                    {hypo.description.substring(0, 110)}...
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 9.5, color: "var(--muted)" }}>
                      Target: <strong style={{ color: "var(--fg-2)" }}>{hypo.targetProcess}</strong>
                    </span>
                    <span style={{ fontSize: 9.5, color: "#10b981", fontWeight: 700, background: "rgba(16,185,129,0.1)", padding: "1px 6px", borderRadius: 3 }}>
                      {hypo.recommendedEngine}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: EDR Query Dispatcher & Syntax Forge */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Query Dispatcher Header */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                  <FileCode size={16} color="#06b6d4" />
                  Fleet Hunting Query Forge: <span style={{ color: "#06b6d4" }}>{selectedHypothesis.title}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Selected Tactic: {selectedHypothesis.tactic} ({selectedHypothesis.tacticId}) &bull; Target OS: {selectedHypothesis.targetOs}
                </div>
              </div>

              {/* Engine Switcher Tabs */}
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { id: "osquery", label: "osquery SQL", icon: Database },
                  { id: "Velociraptor", label: "Velociraptor VQL", icon: Terminal },
                  { id: "CrowdStrike RTR", label: "CrowdStrike RTR", icon: Shield },
                  { id: "MDE KQL", label: "Defender KQL", icon: Zap }
                ].map(eng => {
                  const active = activeEngine === eng.id;
                  return (
                    <button
                      key={eng.id}
                      onClick={() => {
                        setActiveEngine(eng.id as any);
                        if (eng.id === "osquery") {
                          setSqlQuery(selectedHypothesis.querySnippet);
                        } else if (eng.id === "CrowdStrike RTR") {
                          setSqlQuery(`# CrowdStrike Real Time Response (RTR) Scripting\nrunscript -CloudFile="Cerberus_Memory_Hunter.ps1" -CommandLine="-Process ${selectedHypothesis.targetProcess} -ScanRWX"\nkill -Force -PID 5410\nfile get "C:\\Windows\\tasksche.exe"`);
                        } else if (eng.id === "MDE KQL") {
                          setSqlQuery(`// Microsoft Defender for Endpoint (MDE) Advanced Hunting\nDeviceProcessEvents\n| where FileName =~ "${selectedHypothesis.targetProcess}"\n| where ProcessCommandLine has_any ("-w hidden", "vssadmin", "mssecsvc")\n| project Timestamp, DeviceName, FileName, ProcessCommandLine, AccountName`);
                        } else {
                          setSqlQuery(`name: Custom.ThreatHunt.${selectedHypothesis.id}\nsources:\n  - query: |\n      SELECT * FROM pslist() WHERE Name =~ "${selectedHypothesis.targetProcess}"`);
                        }
                      }}
                      style={{
                        fontSize: 11,
                        fontWeight: active ? 700 : 500,
                        padding: "5px 10px",
                        borderRadius: 4,
                        background: active ? "rgba(6,182,212,0.2)" : "var(--surface-2)",
                        color: active ? "#06b6d4" : "var(--muted)",
                        border: active ? "1px solid #06b6d4" : "1px solid var(--border)",
                        cursor: "pointer"
                      }}
                    >
                      {eng.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Query Editor */}
            <div style={{ position: "relative" }}>
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: 140,
                  background: "#020408",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
                  fontSize: 11.5,
                  color: "#38bdf8",
                  lineHeight: 1.5,
                  resize: "vertical",
                  outline: "none"
                }}
              />
            </div>

            {/* Query Controls & Action Dispatch */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Targeting: <strong style={{ color: "#f1f5f9" }}>All 14,850 Workstations &amp; Servers</strong>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlQuery);
                    setRemediationToast("Query copied to clipboard!");
                    setTimeout(() => setRemediationToast(null), 3000);
                  }}
                  className="btn-secondary"
                  style={{ padding: "6px 12px", fontSize: 11 }}
                >
                  <Copy size={12} />
                  Copy Query
                </button>

                <button
                  onClick={runFleetSearch}
                  disabled={isDispatching}
                  className="btn-primary"
                  style={{ padding: "6px 16px", fontSize: 11 }}
                >
                  <Play size={13} />
                  {isDispatching ? `Dispatching (${dispatchProgress}%)...` : "Execute Fleet-Wide Hunt"}
                </button>
              </div>
            </div>

            {/* Dispatch Progress Indicator */}
            {isDispatching && (
              <div style={{ marginTop: 10 }}>
                <div style={{ width: "100%", height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${dispatchProgress}%`, height: "100%", background: "#06b6d4", transition: "width 0.15s ease" }} />
                </div>
                <div style={{ fontSize: 10, color: "#38bdf8", marginTop: 4, textAlign: "right" }}>
                  Polling US-East (4,200), US-West (3,100), EU-Central (5,100), APAC (2,450)...
                </div>
              </div>
            )}
          </div>

          {/* Toast Notification Banner */}
          {remediationToast && (
            <div style={{
              background: "rgba(6,182,212,0.15)",
              border: "1px solid #06b6d4",
              borderRadius: 6,
              padding: "10px 14px",
              fontSize: 12,
              fontWeight: 700,
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "fadeIn 0.2s ease"
            }}>
              <Zap size={15} color="#06b6d4" />
              {remediationToast}
            </div>
          )}

          {/* Fleet Search Results Grid & 1-Click Remediation Console */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldAlert size={15} color="#ef4444" />
                  Live Fleet Threat Detections ({fleetHits.length} Hosts Flagged)
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Real-time telemetry stream aggregated from CrowdStrike Falcon, MDE, and Velociraptor endpoints.
                </div>
              </div>

              {/* 1-Click Remediation Actions Toolbar */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={handleIsolateAll}
                  className="btn-danger"
                  style={{ padding: "5px 10px", fontSize: 10.5 }}
                >
                  <Lock size={12} />
                  Isolate All {fleetHits.length} Hosts
                </button>

                <button
                  onClick={handleKillProcesses}
                  className="btn-primary"
                  style={{ padding: "5px 10px", fontSize: 10.5, background: "#ef4444", color: "#fff" }}
                >
                  <Zap size={12} />
                  Kill Remote PIDs
                </button>

                <button
                  onClick={handleQuarantineHashes}
                  className="btn-secondary"
                  style={{ padding: "5px 10px", fontSize: 10.5 }}
                >
                  <Shield size={12} />
                  Quarantine Hashes
                </button>

                <button
                  onClick={handleBlockC2Ips}
                  className="btn-secondary"
                  style={{ padding: "5px 10px", fontSize: 10.5 }}
                >
                  <Globe size={12} />
                  Block C2 IPs
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div style={{ overflowX: "auto" }}>
              <table className="cerberus-table">
                <thead>
                  <tr>
                    <th>Hostname / IP</th>
                    <th>OS / User</th>
                    <th>Process &amp; PID</th>
                    <th>Matched Behavioral Indicator</th>
                    <th>Detection Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fleetHits.map((hit) => (
                    <tr key={hit.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: "#f1f5f9", fontFamily: "monospace" }}>{hit.hostname}</div>
                        <div style={{ fontSize: 10.5, color: "#06b6d4", fontFamily: "monospace" }}>{hit.ip}</div>
                      </td>
                      <td>
                        <div style={{ color: "var(--fg-2)" }}>{hit.os}</div>
                        <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>{hit.user}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: "#f59e0b", fontFamily: "monospace" }}>{hit.process}</div>
                        <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>PID: {hit.pid}</div>
                      </td>
                      <td style={{ maxWidth: 280, fontSize: 11, color: "var(--fg-2)" }}>
                        {hit.matchedRule}
                      </td>
                      <td style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>
                        {hit.detectionTime}
                      </td>
                      <td>
                        <span className={hit.status === "Infected" ? "badge-critical" : hit.status === "Quarantined" ? "badge-high" : "badge-low"}>
                          {hit.isolated ? "ISOLATED" : hit.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setFleetHits(prev => prev.map(h => h.id === hit.id ? { ...h, isolated: !h.isolated, status: h.isolated ? "Infected" : "Quarantined" } : h));
                            setRemediationToast(`${hit.hostname} isolation toggled!`);
                            setTimeout(() => setRemediationToast(null), 3000);
                          }}
                          style={{
                            fontSize: 10,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: hit.isolated ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                            color: hit.isolated ? "#10b981" : "#ef4444",
                            border: "1px solid var(--border)",
                            cursor: "pointer",
                            fontWeight: 700
                          }}
                        >
                          {hit.isolated ? "Reconnect" : "Isolate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
