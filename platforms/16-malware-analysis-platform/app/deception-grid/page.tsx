"use client";

import { useState, useMemo, useEffect } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import {
  Key,
  Shield,
  ShieldAlert,
  Radio,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Server,
  Cloud,
  Lock,
  Eye,
  Terminal,
  Crosshair,
  RefreshCw,
  Sliders,
  Play,
  RotateCcw,
  Layers,
  Database,
  Bell,
  Cpu,
  Fingerprint,
  FileCode2,
  HardDrive,
  Copy,
  Check,
  Power
} from "lucide-react";

interface DeceptionDecoy {
  id: string;
  name: string;
  category: "LSASS_CREDENTIAL" | "CLOUD_API" | "CANARY_DOC" | "SMB_SHARE";
  location: string;
  fakeIdentity: string;
  trapMechanism: string;
  fidelityScore: number;
  status: "ARMED" | "TRIPPED" | "STANDBY";
  tripCount: number;
  lastTripTime?: string;
  details: Record<string, string>;
}

interface TelemetryEvent {
  id: string;
  timestamp: string;
  decoyId: string;
  decoyName: string;
  processName: string;
  pid: number;
  action: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  attackerIp: string;
  automatedResponse: string;
  status: "QUARANTINED" | "BLOCKED" | "CONTAINED";
}

const INITIAL_DECOYS: DeceptionDecoy[] = [
  {
    id: "DECOY-LSASS-01",
    name: "Decoy 1: In-Memory LSASS Domain Admin",
    category: "LSASS_CREDENTIAL",
    location: "lsass.exe (Process Memory Pool / Wdigest)",
    fakeIdentity: "CORP\\svc_backup_admin",
    trapMechanism: "Memory Access Hook on SeDebugPrivilege / OpenProcess(0x1FFFFF)",
    fidelityScore: 99,
    status: "ARMED",
    tripCount: 3,
    lastTripTime: "12 secs ago",
    details: {
      "Account Name": "svc_backup_admin",
      "Domain": "CORP.ENTERPRISE.LOCAL",
      "NTLM Hash Trap": "AAD3B435B51404EEA0E9F5D64349FB13:8846F7EAEE8FB117AD06BDD830B7586C",
      "Kerberos Ticket": "krbtgt/CORP.ENTERPRISE.LOCAL (HoneyTicket)",
      "Targeted By": "Mimikatz / sekurlsa::logonpasswords"
    }
  },
  {
    id: "DECOY-AWS-02",
    name: "Decoy 2: High-Value Cloud API Canary Key",
    category: "CLOUD_API",
    location: "%USERPROFILE%\\.aws\\credentials",
    fakeIdentity: "aws_access_key_id = AKIAIOSFODNN7CANARY",
    trapMechanism: "AWS CloudTrail Event Bridge Webhook on STS:GetCallerIdentity",
    fidelityScore: 98,
    status: "ARMED",
    tripCount: 1,
    lastTripTime: "1 min ago",
    details: {
      "Access Key ID": "AKIAIOSFODNN7CANARY",
      "Secret Access Key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYCANARYKEY",
      "Assumed Role": "arn:aws:iam::123456789012:role/ProductionS3DataAdmin",
      "Alert Destination": "https://telemetry.canarytokens.org/webhook/aws-trap",
      "Targeted By": "RedLine Stealer / Cloud Credential Harvesters"
    }
  },
  {
    id: "DECOY-DOC-03",
    name: "Decoy 3: Financial Canary Excel Spreadsheet",
    category: "CANARY_DOC",
    location: "C:\\Users\\Victim\\Documents\\Q3_Executive_Bonuses.xlsx",
    fakeIdentity: "Executive Salary & M&A Bonus Matrix 2026",
    trapMechanism: "Embedded XML External Web Beacon + Macro DNS Probe Tripwire",
    fidelityScore: 97,
    status: "ARMED",
    tripCount: 4,
    lastTripTime: "34 secs ago",
    details: {
      "File Name": "Q3_Executive_Bonuses.xlsx",
      "Beacon URL": "http://canary-beacon.cerberus-lab.net/token/q3_bonus.gif",
      "DNS Resolver Trap": "dns-probe-84a92b.canary.tripwire.io",
      "Honey Payload": "Fake Financial Spreadsheets with Encrypted Canary Macro",
      "Targeted By": "SikoMode Nim Stealer / Infostealers / APT Espionage"
    }
  },
  {
    id: "DECOY-SMB-04",
    name: "Decoy 4: Simulated Ransomware Network Share",
    category: "SMB_SHARE",
    location: "\\\\STORAGE-DC01\\Confidential_Financials\\",
    fakeIdentity: "Corporate Network Storage & Backup Volume",
    trapMechanism: "Instant SMB File Write / Overwrite Canary Trigger (I/O Intercept)",
    fidelityScore: 99,
    status: "ARMED",
    tripCount: 2,
    lastTripTime: "5 mins ago",
    details: {
      "UNC Share Path": "\\\\STORAGE-DC01\\Confidential_Financials\\",
      "Decoy Files": "120 Fake PDF/DOCX/CAD Files with tripwire headers",
      "Trigger Latency": "< 8 milliseconds on first modified byte",
      "Targeted By": "WannaCry / LockBit 3.0 / Ransomware Encryption Threads"
    }
  }
];

const INITIAL_TELEMETRY: TelemetryEvent[] = [
  {
    id: "EVT-1091",
    timestamp: "23:49:12.402",
    decoyId: "DECOY-LSASS-01",
    decoyName: "In-Memory LSASS Fake Admin",
    processName: "svchost.exe (Injected Cobalt Strike)",
    pid: 5410,
    action: "Memory handle opened with PROCESS_ALL_ACCESS targeting svc_backup_admin NTLM trap",
    severity: "CRITICAL",
    attackerIp: "104.18.21.90",
    automatedResponse: "Process Terminated (PID 5410) & Host Isolated via SOAR",
    status: "QUARANTINED"
  },
  {
    id: "EVT-1090",
    timestamp: "23:48:45.110",
    decoyId: "DECOY-AWS-02",
    decoyName: "High-Value AWS Canary Key",
    processName: "RedLineStealer.exe",
    pid: 6104,
    action: "File Read: %USERPROFILE%\\.aws\\credentials (AKIAIOSFODNN7CANARY exfiltrated)",
    severity: "CRITICAL",
    attackerIp: "185.161.248.42",
    automatedResponse: "C2 IP 185.161.248.42 Blacklisted on Perimeter Firewalls",
    status: "BLOCKED"
  },
  {
    id: "EVT-1089",
    timestamp: "23:47:20.890",
    decoyId: "DECOY-DOC-03",
    decoyName: "Financial Canary Spreadsheet",
    processName: "SikoMode.exe",
    pid: 5120,
    action: "Opened Q3_Executive_Bonuses.xlsx; Web beacon DNS probe triggered to canary.tripwire.io",
    severity: "HIGH",
    attackerIp: "192.168.195.139",
    automatedResponse: "Domain update.kbfirewall.com DNS sinkholed immediately",
    status: "CONTAINED"
  },
  {
    id: "EVT-1088",
    timestamp: "23:44:02.312",
    decoyId: "DECOY-SMB-04",
    decoyName: "Simulated Ransomware SMB Share",
    processName: "WannaCry.exe",
    pid: 3412,
    action: "Overwrote \\\\STORAGE-DC01\\Confidential\\Contract_2026.pdf with .WNCRY header",
    severity: "CRITICAL",
    attackerIp: "192.168.195.140",
    automatedResponse: "SMB Share access revoked & Volume Shadow copy roll-forward invoked",
    status: "QUARANTINED"
  }
];

export default function DeceptionGridPage() {
  const [decoys, setDecoys] = useState<DeceptionDecoy[]>(INITIAL_DECOYS);
  const [telemetryFeed, setTelemetryFeed] = useState<TelemetryEvent[]>(INITIAL_TELEMETRY);
  const [selectedDecoy, setSelectedDecoy] = useState<DeceptionDecoy>(INITIAL_DECOYS[0]);
  const [selectedSample, setSelectedSample] = useState(MALWARE_SAMPLES[0]);
  const [isLiveTelemetryRunning, setIsLiveTelemetryRunning] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "CRITICAL" | "HIGH">("ALL");
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Toggle Decoy Armed status
  const toggleDecoyStatus = (decoyId: string) => {
    setDecoys(prev => prev.map(d => {
      if (d.id === decoyId) {
        const nextStatus = d.status === "ARMED" ? "STANDBY" : "ARMED";
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  // Simulate Attacker Trigger Action
  const triggerSimulatedAttack = (type: "LSASS" | "AWS" | "DOC" | "SMB") => {
    const timestamp = new Date().toTimeString().split(" ")[0] + "." + Math.floor(Math.random() * 900 + 100);
    let targetDecoyId = "DECOY-LSASS-01";
    let decoyName = "In-Memory LSASS Fake Admin";
    let processName = selectedSample.name;
    let pid = Math.floor(Math.random() * 8000 + 2000);
    let action = "";
    let severity: "CRITICAL" | "HIGH" = "CRITICAL";
    let automatedResponse = "";

    if (type === "LSASS") {
      targetDecoyId = "DECOY-LSASS-01";
      decoyName = "In-Memory LSASS Domain Admin";
      action = `Attempted LSASS memory dump for trap user 'svc_backup_admin'`;
      automatedResponse = `Instant Kill PID ${pid} & Kernel Memory Minidump Captured`;
    } else if (type === "AWS") {
      targetDecoyId = "DECOY-AWS-02";
      decoyName = "Cloud API Canary Key";
      action = `Exfiltrated AKIAIOSFODNN7CANARY from .aws/credentials`;
      automatedResponse = `API Key Invalidation webhook sent to AWS IAM`;
    } else if (type === "DOC") {
      targetDecoyId = "DECOY-DOC-03";
      decoyName = "Financial Canary Spreadsheet";
      action = `Interrogated Q3_Executive_Bonuses.xlsx; web beacon fired`;
      automatedResponse = `Threat IP auto-blacklisted across EDR fleet`;
      severity = "HIGH";
    } else {
      targetDecoyId = "DECOY-SMB-04";
      decoyName = "Simulated Ransomware SMB Share";
      action = `Ransomware write intercepted on \\\\STORAGE-DC01\\Confidential_Financials`;
      automatedResponse = `SMB Session terminated & endpoint quarantined`;
    }

    const newEvent: TelemetryEvent = {
      id: `EVT-${Math.floor(Math.random() * 9000 + 1000)}`,
      timestamp,
      decoyId: targetDecoyId,
      decoyName,
      processName,
      pid,
      action,
      severity,
      attackerIp: "192.168.195.140",
      automatedResponse,
      status: "QUARANTINED"
    };

    setTelemetryFeed(prev => [newEvent, ...prev.slice(0, 19)]);
    setDecoys(prev => prev.map(d => {
      if (d.id === targetDecoyId) {
        return {
          ...d,
          status: "TRIPPED",
          tripCount: d.tripCount + 1,
          lastTripTime: "Just now"
        };
      }
      return d;
    }));
  };

  const filteredTelemetry = useMemo(() => {
    if (filterSeverity === "ALL") return telemetryFeed;
    return telemetryFeed.filter(e => e.severity === filterSeverity);
  }, [telemetryFeed, filterSeverity]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification("Copied honeytoken!");
    setTimeout(() => setCopiedNotification(null), 2000);
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 14, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              STAGE 6: ACTIVE DEFENSE &amp; DECEPTION
            </span>
            <span className="badge-critical">MEMORY HONEYTOKEN GRID</span>
            <span className="badge-low">ZERO FALSE POSITIVES</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#f1f5f9", marginTop: 2 }}>
            Autonomous Threat Deception &amp; Memory Honeytoken Grid
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            Dynamic sandbox deception workbench deploying high-fidelity decoys (LSASS bait, AWS tokens, financial canaries, ransomware network shares) with live telemetry tripwires.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            className="tool-select"
            value={selectedSample.id}
            onChange={(e) => {
              const s = MALWARE_SAMPLES.find(x => x.id === e.target.value);
              if (s) setSelectedSample(s);
            }}
          >
            {MALWARE_SAMPLES.map(s => (
              <option key={s.id} value={s.id}>Target Detonator: {s.name}</option>
            ))}
          </select>

          <button
            onClick={() => triggerSimulatedAttack("LSASS")}
            className="btn-primary"
          >
            <Zap size={13} fill="#04060a" />
            <span>Fire Detonation Tripwire</span>
          </button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>ACTIVE DECOYS DEPLOYED</span>
            <Lock size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981", marginTop: 6 }}>
            {decoys.filter(d => d.status === "ARMED" || d.status === "TRIPPED").length} / {decoys.length}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            High-fidelity deception traps armed
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>TRIPWIRE TRIGGER RATE</span>
            <Radio size={14} color="#ef4444" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#ef4444", marginTop: 6 }}>
            {telemetryFeed.length} Events
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            100% true-positive engagement certainty
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>AUTOMATED SOAR QUARANTINE</span>
            <ShieldAlert size={14} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#06b6d4", marginTop: 6 }}>
            100% CLOSED-LOOP
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            Avg. quarantine response time: <strong>&lt; 12ms</strong>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>HONEYTOKEN FIDELITY</span>
            <Fingerprint size={14} color="#a855f7" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#a855f7", marginTop: 6 }}>
            98.5%
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            Indistinguishable from enterprise assets
          </div>
        </div>
      </div>

      {/* WORKBENCH: 4 HIGH-FIDELITY DECOYS GRID */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Layers size={16} color="#06b6d4" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9" }}>
              High-Fidelity Deception Decoys &amp; Memory Traps
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => triggerSimulatedAttack("LSASS")} className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>
              Simulate Mimikatz LSASS Dump
            </button>
            <button onClick={() => triggerSimulatedAttack("AWS")} className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>
              Simulate AWS Steal
            </button>
            <button onClick={() => triggerSimulatedAttack("SMB")} className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>
              Simulate Ransomware Share Sweep
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {decoys.map((decoy) => {
            const isSelected = selectedDecoy.id === decoy.id;
            return (
              <div
                key={decoy.id}
                onClick={() => setSelectedDecoy(decoy)}
                style={{
                  background: isSelected ? "rgba(6, 182, 212, 0.12)" : "var(--bg)",
                  border: `1px solid ${isSelected ? "#06b6d4" : "var(--border)"}`,
                  borderRadius: 8,
                  padding: 14,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  transition: "all 0.12s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: isSelected ? "#38bdf8" : "#f1f5f9" }}>
                      {decoy.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                      {decoy.location}
                    </div>
                  </div>
                  <span className={decoy.status === "TRIPPED" ? "badge-critical" : decoy.status === "ARMED" ? "badge-low" : "badge-medium"}>
                    {decoy.status}
                  </span>
                </div>

                <div style={{ background: "var(--surface)", padding: "6px 10px", borderRadius: 4, fontSize: 11, fontFamily: "monospace", color: "#cbd5e1" }}>
                  <div style={{ color: "var(--muted)", fontSize: 9.5 }}>BAIT IDENTITY:</div>
                  <div style={{ color: "#10b981", fontWeight: 700, marginTop: 2 }}>{decoy.fakeIdentity}</div>
                </div>

                <div style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.4 }}>
                  <strong style={{ color: "var(--muted)" }}>Trap: </strong>{decoy.trapMechanism}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 8, fontSize: 10.5 }}>
                  <span style={{ color: "var(--muted)" }}>Tripped: <strong style={{ color: "#ef4444" }}>{decoy.tripCount} times</strong></span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDecoyStatus(decoy.id);
                    }}
                    style={{
                      background: decoy.status === "ARMED" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                      color: decoy.status === "ARMED" ? "#ef4444" : "#10b981",
                      border: `1px solid ${decoy.status === "ARMED" ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {decoy.status === "ARMED" ? "Disarm Trap" : "Arm Decoy"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPLIT VIEW: DECOY FORENSIC INSPECTOR & LIVE TRIPWIRE TELEMETRY FEED */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        {/* Left: Selected Decoy Technical Inspector */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Fingerprint size={14} color="#06b6d4" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9" }}>
                Decoy Inspector &amp; Honeytoken Values
              </span>
            </div>
            <span className="badge-high">Fidelity: {selectedDecoy.fidelityScore}%</span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 900, color: "#38bdf8" }}>
            {selectedDecoy.name}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(selectedDecoy.details).map(([key, val], idx) => (
              <div key={idx} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                  {key}
                </div>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "#f1f5f9", marginTop: 2, wordBreak: "break-all", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{val}</span>
                  <button
                    onClick={() => handleCopy(val)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "#06b6d4" }}
                    title="Copy Honeytoken Value"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 6, padding: "8px 10px", fontSize: 11, color: "#e2e8f0" }}>
            <strong style={{ color: "#10b981" }}>Autonomous Defense Action: </strong>
            Any process touching this honeytoken is guaranteed 100% malicious. Immediate kernel-level process termination and network isolation triggers with zero analyst delay.
          </div>
        </div>

        {/* Right: Live Tripwire Telemetry Feed */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Radio size={14} color="#ef4444" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9" }}>
                Live Deception Tripwire Telemetry Feed
              </span>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", display: "inline-block" }} />
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700 }}>SEVERITY:</span>
              {(["ALL", "CRITICAL", "HIGH"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    background: filterSeverity === sev ? "rgba(6,182,212,0.2)" : "var(--bg)",
                    color: filterSeverity === sev ? "#06b6d4" : "var(--muted)",
                    border: filterSeverity === sev ? "1px solid #06b6d4" : "1px solid var(--border)",
                    cursor: "pointer"
                  }}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Stream Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="cerberus-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Severity</th>
                  <th>Targeted Decoy</th>
                  <th>Offending Process</th>
                  <th>Adversary Interaction</th>
                  <th>SOAR Automated Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTelemetry.map((evt) => (
                  <tr key={evt.id}>
                    <td style={{ fontFamily: "monospace", color: "#38bdf8", fontSize: 10.5 }}>{evt.timestamp}</td>
                    <td>
                      <span className={evt.severity === "CRITICAL" ? "badge-critical" : "badge-high"}>
                        {evt.severity}
                      </span>
                    </td>
                    <td style={{ color: "#f1f5f9", fontWeight: 700 }}>{evt.decoyName}</td>
                    <td style={{ fontFamily: "monospace", color: "#f59e0b" }}>
                      {evt.processName} <span style={{ color: "var(--muted)" }}>(PID {evt.pid})</span>
                    </td>
                    <td style={{ fontSize: 11, color: "#cbd5e1", maxWidth: 260 }}>{evt.action}</td>
                    <td style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>{evt.automatedResponse}</td>
                    <td>
                      <span className="badge-low">{evt.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
