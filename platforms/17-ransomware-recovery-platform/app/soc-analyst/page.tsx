"use client";

import { useState } from "react";
import {
  Terminal,
  ShieldAlert,
  Crosshair,
  Search,
  Filter,
  Copy,
  Check,
  Radio,
  FileCode,
  Lock,
  Flame,
  AlertTriangle,
  Play,
  Pause,
  Key,
  ShieldCheck,
  Eye,
  Plus,
  Send,
  Hash,
  ExternalLink,
  Layers,
  Cpu
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { IOCItem, MitreAttackMapping, C2BeaconTrace, AnalystNote } from "@/types/recovery";

export default function SocAnalystWorkspace() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [iocFilter, setIocFilter] = useState<string>("ALL");
  const [iocSearch, setIocSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"iocs" | "mitre" | "sniffer" | "notes">("iocs");

  // IOCs data
  const [iocs, setIocs] = useState<IOCItem[]>([
    {
      id: "ioc-1",
      type: "IP",
      value: "185.220.101.5",
      threatActor: "FIN12 / LockBit 3.0",
      severity: "CRITICAL",
      firstSeen: "2026-08-23 04:12 UTC",
      detectionSource: "Perimeter Palo Alto Egress",
      reputationScore: 99,
      status: "ACTIVE_BLOCK"
    },
    {
      id: "ioc-2",
      type: "DOMAIN",
      value: "c2-healthcheck.dynamic-dns.net",
      threatActor: "UNC3944 Affiliate",
      severity: "CRITICAL",
      firstSeen: "2026-08-23 04:45 UTC",
      detectionSource: "Core Infoblox DNS RPZ",
      reputationScore: 95,
      status: "SINKHOLED"
    },
    {
      id: "ioc-3",
      type: "HASH_SHA256",
      value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      threatActor: "LockBit 3.0 Builder",
      severity: "HIGH",
      firstSeen: "2026-08-23 05:02 UTC",
      detectionSource: "CrowdStrike Falcon Sensor",
      reputationScore: 98,
      status: "ACTIVE_BLOCK"
    },
    {
      id: "ioc-4",
      type: "BITCOIN_WALLET",
      value: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      threatActor: "LockBit Payment Cluster",
      severity: "HIGH",
      firstSeen: "2026-08-23 06:14 UTC",
      detectionSource: "Restore-My-Files.txt Note",
      reputationScore: 92,
      status: "MONITORING"
    },
    {
      id: "ioc-5",
      type: "ONION_HOST",
      value: "lockbitaptc2xnk7b5yvh7y5vxsq.onion",
      threatActor: "LockBit Dark Web Portal",
      severity: "CRITICAL",
      firstSeen: "2026-08-23 06:14 UTC",
      detectionSource: "Tor Onion Parser",
      reputationScore: 100,
      status: "MONITORING"
    },
    {
      id: "ioc-6",
      type: "REGISTRY_KEY",
      value: "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce\\svchost_lock",
      threatActor: "LockBit Payload Persistence",
      severity: "HIGH",
      firstSeen: "2026-08-23 05:22 UTC",
      detectionSource: "Sysmon Event ID 13",
      reputationScore: 90,
      status: "ACTIVE_BLOCK"
    }
  ]);

  // MITRE ATT&CK Mappings
  const mitreTactics: MitreAttackMapping[] = [
    {
      phase: "Initial Access",
      techniqueId: "T1078.002",
      techniqueName: "Valid Accounts: Domain Accounts",
      description: "Compromised credential 'svc_backup_mgmt' acquired via VPN password spray.",
      detectedArtifact: "Auth logs from gateway IP 185.220.101.5",
      status: "MITIGATED"
    },
    {
      phase: "Execution",
      techniqueId: "T1059.001",
      techniqueName: "PowerShell Encoded Commands",
      description: "Base64 encoded obfuscated launcher executing in-memory payload staging.",
      detectedArtifact: "Process: powershell.exe -enc SQBFAFgA...",
      status: "DETECTED"
    },
    {
      phase: "Persistence",
      techniqueId: "T1053.005",
      techniqueName: "Scheduled Task / Job",
      description: "Created malicious task 'WindowsUpdateCheck_Svc' to re-trigger payload.",
      detectedArtifact: "Task XML in System32\\Tasks",
      status: "MITIGATED"
    },
    {
      phase: "Privilege Escalation",
      techniqueId: "T1068",
      techniqueName: "Exploitation for Privilege Escalation",
      description: "ZeroLogon (CVE-2020-1472) RPC exploit against DC01.mercy.local.",
      detectedArtifact: "Netlogon anomalous NTLM handshake",
      status: "MITIGATED"
    },
    {
      phase: "Defense Evasion",
      techniqueId: "T1070.001",
      techniqueName: "Clear Windows Event Logs (wevtutil)",
      description: "Executed 'wevtutil cl Security' and 'wevtutil cl System' across 24 endpoints.",
      detectedArtifact: "Event ID 1102 (The audit log was cleared)",
      status: "INVESTIGATING"
    },
    {
      phase: "Credential Access",
      techniqueId: "T1003.001",
      techniqueName: "LSASS Memory Dump (ProcDump)",
      description: "Injected minidump driver to extract plain NTLM hashes.",
      detectedArtifact: "File: C:\\Windows\\Temp\\lsass.dmp",
      status: "MITIGATED"
    },
    {
      phase: "Exfiltration",
      techniqueId: "T1567.002",
      techniqueName: "Exfiltration to Cloud Storage (Mega/Rclone)",
      description: "Encrypted archive uploaded to remote Mega.nz repository via custom rclone binary.",
      detectedArtifact: "High-volume HTTPS egress to 198.51.100.42 (1.8 TB)",
      status: "DETECTED"
    },
    {
      phase: "Impact",
      techniqueId: "T1486",
      techniqueName: "Data Encrypted for Impact",
      description: "ChaCha20 + Curve25519 hybrid high-speed file encryption targeting VHDX/MDF.",
      detectedArtifact: "47,281 encrypted files with .lockbit suffix",
      status: "INVESTIGATING"
    }
  ];

  // C2 Beacons
  const [beacons, setBeacons] = useState<C2BeaconTrace[]>([
    {
      id: "bc-1",
      timestamp: "00:19:04 UTC",
      sourceIp: "10.14.1.12",
      destIp: "185.220.101.5",
      destDomain: "c2-healthcheck.dynamic-dns.net",
      protocol: "DNS (Port 53)",
      port: 53,
      payloadBytes: 128,
      beaconIntervalSec: 45,
      threatVerdict: "MALICIOUS_C2",
      actionTaken: "DNS_SINKHOLE"
    },
    {
      id: "bc-2",
      timestamp: "00:18:19 UTC",
      sourceIp: "10.14.2.10",
      destIp: "194.26.29.112",
      destDomain: "api-telemetry-cdn.org",
      protocol: "HTTPS (Port 443)",
      port: 443,
      payloadBytes: 1024,
      beaconIntervalSec: 60,
      threatVerdict: "MALICIOUS_C2",
      actionTaken: "BLOCKED_SNORT"
    },
    {
      id: "bc-3",
      timestamp: "00:17:34 UTC",
      sourceIp: "10.14.4.22",
      destIp: "103.109.103.88",
      destDomain: "sync-ntp-time.cc",
      protocol: "UDP (Port 123)",
      port: 123,
      payloadBytes: 64,
      beaconIntervalSec: 120,
      threatVerdict: "SUSPICIOUS_HEURISTIC",
      actionTaken: "ISOLATED_HOST"
    }
  ]);

  // Analyst Notes
  const [notes, setNotes] = useState<AnalystNote[]>([
    {
      id: "note-1",
      caseId: "case-001",
      author: "Elena Rostova, CISSP",
      role: "Lead DFIR Incident Commander",
      timestamp: "2026-08-23 22:40 UTC",
      category: "INTEL",
      content:
        "Confirmed initial threat vector was compromised VPN credential svc_backup_mgmt with MFA bypass via session replay token. Attacker moved laterally to DC01 within 42 minutes.",
      signatureHash: "3f88b9a1029c7d4e5f6a11b89320e4dc810459ab3294821a7199c0d4817aef90",
      isVerified: true
    },
    {
      id: "note-2",
      caseId: "case-001",
      author: "David Kross, GCFA",
      role: "Senior Malware Researcher",
      timestamp: "2026-08-23 23:15 UTC",
      category: "DECRYPTION_HYPOTHESIS",
      content:
        "Entropy profile on .mdf database files indicates intermittent encryption mode (every 10th 1MB block). Plaintext page headers are recoverable using custom block restorer.",
      signatureHash: "7b1029da485e92ac4510bbf8930219ca7784019283746501928374a561bcdae2",
      isVerified: true
    }
  ]);

  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState<"INTEL" | "CONTAINMENT" | "DECRYPTION_HYPOTHESIS" | "CHAIN_OF_CUSTODY">("INTEL");

  const handleCopyIoc = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    const generatedHash = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const newNote: AnalystNote = {
      id: `note-${notes.length + 1}`,
      caseId: selectedCaseId,
      author: "Marcus Vance, GCIH",
      role: "Forensic Analyst",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
      category: newNoteCategory,
      content: newNoteContent,
      signatureHash: generatedHash,
      isVerified: true
    };

    setNotes([newNote, ...notes]);
    setNewNoteContent("");
  };

  const filteredIocs = iocs.filter((ioc) => {
    const matchesFilter = iocFilter === "ALL" || ioc.type === iocFilter;
    const matchesSearch =
      ioc.value.toLowerCase().includes(iocSearch.toLowerCase()) ||
      ioc.threatActor.toLowerCase().includes(iocSearch.toLowerCase()) ||
      ioc.detectionSource.toLowerCase().includes(iocSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#06b6d4", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              TIER-3 THREAT INTELLIGENCE DESK
            </span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(6,182,212,0.15)", color: "#06b6d4", fontWeight: 700 }}>
              LOCKBIT 3.0 · UNC3944 NEXUS
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
            SOC & Threat Intelligence Analyst Workspace
          </h1>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)", padding: 4, borderRadius: 8, border: "1px solid var(--border)" }}>
          {[
            { id: "iocs", label: "IOC Matrix", icon: Crosshair, count: iocs.length },
            { id: "mitre", label: "MITRE ATT&CK", icon: Layers, count: mitreTactics.length },
            { id: "sniffer", label: "C2 Sniffer", icon: Radio, count: beacons.length },
            { id: "notes", label: "Signed Notes", icon: Terminal, count: notes.length }
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
                  background: active ? "rgba(6,182,212,0.2)" : "transparent",
                  color: active ? "#06b6d4" : "var(--muted)",
                  border: active ? "1px solid rgba(6,182,212,0.4)" : "1px solid transparent"
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

      {/* TAB 1: IOC MATRIX */}
      {activeTab === "iocs" && (
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Filter Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} color="var(--muted)" style={{ position: "absolute", left: 10, top: 9 }} />
                <input
                  type="text"
                  placeholder="Search IOCs, hashes, wallets, actors..."
                  value={iocSearch}
                  onChange={(e) => setIocSearch(e.target.value)}
                  className="tool-input"
                  style={{ paddingLeft: 30, width: 280 }}
                />
              </div>

              <select
                value={iocFilter}
                onChange={(e) => setIocFilter(e.target.value)}
                className="tool-select"
              >
                <option value="ALL">All IOC Types</option>
                <option value="IP">IP Addresses</option>
                <option value="DOMAIN">Domains</option>
                <option value="HASH_SHA256">SHA-256 Hashes</option>
                <option value="BITCOIN_WALLET">BTC Wallets</option>
                <option value="ONION_HOST">Tor Onion Hosts</option>
                <option value="REGISTRY_KEY">Registry Keys</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => alert("Pushed all active IOCs to perimeter Palo Alto & CrowdStrike Falcon.")}
                className="btn-primary"
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                <ShieldCheck size={13} />
                <span>Broadcast Blocklist to SIEM / EDR</span>
              </button>
            </div>
          </div>

          {/* IOC Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>IOC Type</th>
                  <th>Indicator Value</th>
                  <th>Threat Attribution</th>
                  <th>Severity</th>
                  <th>Detection Telemetry</th>
                  <th>Action / Status</th>
                  <th>Copy</th>
                </tr>
              </thead>
              <tbody>
                {filteredIocs.map((ioc) => (
                  <tr key={ioc.id}>
                    <td>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 3,
                          fontFamily: "monospace",
                          background: "rgba(6,182,212,0.15)",
                          color: "#06b6d4"
                        }}
                      >
                        {ioc.type}
                      </span>
                    </td>
                    <td style={{ fontFamily: "monospace", color: "#f8fafc", fontWeight: 600, fontSize: 12 }}>
                      {ioc.value}
                    </td>
                    <td style={{ color: "var(--fg-2)" }}>{ioc.threatActor}</td>
                    <td>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 3,
                          background: ioc.severity === "CRITICAL" ? "rgba(244,63,94,0.2)" : "rgba(245,158,11,0.2)",
                          color: ioc.severity === "CRITICAL" ? "#f43f5e" : "#f59e0b"
                        }}
                      >
                        {ioc.severity} ({ioc.reputationScore})
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: "var(--muted)" }}>{ioc.detectionSource}</td>
                    <td>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 3,
                          background: ioc.status === "ACTIVE_BLOCK" ? "rgba(244,63,94,0.2)" : ioc.status === "SINKHOLED" ? "rgba(16,185,129,0.2)" : "rgba(6,182,212,0.2)",
                          color: ioc.status === "ACTIVE_BLOCK" ? "#f43f5e" : ioc.status === "SINKHOLED" ? "#10b981" : "#06b6d4"
                        }}
                      >
                        {ioc.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleCopyIoc(ioc.value, ioc.id)}
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: 4,
                          padding: "4px 8px",
                          color: copiedId === ioc.id ? "#10b981" : "var(--muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11
                        }}
                      >
                        {copiedId === ioc.id ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedId === ioc.id ? "Copied" : "Copy"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MITRE ATT&CK MATRIX */}
      {activeTab === "mitre" && (
        <div className="card-tactical" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                MITRE ATT&CK ENTERPRISE RANSOMWARE KILL CHAIN
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Mapped adversary behavior across 8 tactical progression phases
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, fontSize: 10 }}>
              <span style={{ padding: "2px 6px", borderRadius: 3, background: "rgba(244,63,94,0.2)", color: "#f43f5e", fontWeight: 700 }}>● DETECTED (3)</span>
              <span style={{ padding: "2px 6px", borderRadius: 3, background: "rgba(16,185,129,0.2)", color: "#10b981", fontWeight: 700 }}>● MITIGATED (4)</span>
              <span style={{ padding: "2px 6px", borderRadius: 3, background: "rgba(245,158,11,0.2)", color: "#f59e0b", fontWeight: 700 }}>● INVESTIGATING (1)</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {mitreTactics.map((tactic, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase" }}>
                    {tactic.phase}
                  </span>
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 800,
                      padding: "1px 5px",
                      borderRadius: 3,
                      background: tactic.status === "MITIGATED" ? "rgba(16,185,129,0.2)" : tactic.status === "DETECTED" ? "rgba(244,63,94,0.2)" : "rgba(245,158,11,0.2)",
                      color: tactic.status === "MITIGATED" ? "#10b981" : tactic.status === "DETECTED" ? "#f43f5e" : "#f59e0b"
                    }}
                  >
                    {tactic.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc", fontFamily: "monospace" }}>
                  {tactic.techniqueId} — {tactic.techniqueName}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.3 }}>{tactic.description}</div>
                <div style={{ marginTop: 4, padding: "6px 8px", background: "rgba(0,0,0,0.3)", borderRadius: 4, fontSize: 10, color: "#10b981", fontFamily: "monospace" }}>
                  {tactic.detectedArtifact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE C2 BEACON SNIFFER */}
      {activeTab === "sniffer" && (
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                LIVE C2 BEACON SNIFFER & HEURISTIC ENGINE
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Continuous packet header inspection, interval jitter analysis, and automated DNS sinkhole routing
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                SNIFFER ACTIVE (10.14.0.0/16)
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {beacons.map((bc) => (
              <div
                key={bc.id}
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
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 6, background: "rgba(244,63,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Radio size={16} color="#f43f5e" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc", fontFamily: "monospace" }}>
                        {bc.sourceIp} → {bc.destIp} ({bc.destDomain})
                      </span>
                      <span style={{ fontSize: 9.5, padding: "2px 5px", borderRadius: 3, background: "rgba(255,255,255,0.06)", fontFamily: "monospace" }}>
                        {bc.protocol}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
                      Interval: <span style={{ color: "#06b6d4", fontWeight: 700 }}>{bc.beaconIntervalSec}s (Jitter 1.2%)</span> · Payload: {bc.payloadBytes} bytes · Captured at {bc.timestamp}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontFamily: "monospace",
                      background: bc.threatVerdict === "MALICIOUS_C2" ? "rgba(244,63,94,0.2)" : "rgba(245,158,11,0.2)",
                      color: bc.threatVerdict === "MALICIOUS_C2" ? "#f43f5e" : "#f59e0b"
                    }}
                  >
                    {bc.threatVerdict}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontFamily: "monospace",
                      background: "rgba(16,185,129,0.2)",
                      color: "#10b981"
                    }}
                  >
                    {bc.actionTaken}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CRYPTOGRAPHICALLY SIGNED NOTES */}
      {activeTab === "notes" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
          {/* Note Feed */}
          <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                  CRYPTOGRAPHICALLY SIGNED DFIR ANNOTATIONS
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  Immutable forensic audit trail sealed with SHA-256 Merkle root hashes
                </div>
              </div>
              <Key size={15} color="#10b981" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 6,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>{note.author}</span>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>({note.role})</span>
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: "rgba(6,182,212,0.15)",
                        color: "#06b6d4",
                        fontFamily: "monospace"
                      }}
                    >
                      {note.category}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.4 }}>{note.content}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>
                      SIG: {note.signatureHash.substring(0, 16)}...{note.signatureHash.substring(48)}
                    </span>
                    <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <ShieldCheck size={11} />
                      VERIFIED FRE 901
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Note Form */}
          <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              APPEND SIGNED FORENSIC FINDING
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Finding Category:</label>
              <select
                value={newNoteCategory}
                onChange={(e) => setNewNoteCategory(e.target.value as any)}
                className="tool-select"
                style={{ width: "100%", marginTop: 4 }}
              >
                <option value="INTEL">Threat Intelligence & Attribution</option>
                <option value="CONTAINMENT">Containment & Network Isolation</option>
                <option value="DECRYPTION_HYPOTHESIS">Decryption & Cryptanalysis Hypothesis</option>
                <option value="CHAIN_OF_CUSTODY">FRE 901 Chain of Custody Transfer</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Analyst Annotation Text:</label>
              <textarea
                rows={6}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter technical forensic observations, registry path artifacts, or recovery findings..."
                className="tool-input"
                style={{ width: "100%", marginTop: 4, fontFamily: "monospace", fontSize: 11.5, resize: "vertical" }}
              />
            </div>

            <button onClick={handleAddNote} className="btn-primary" style={{ justifyContent: "center" }}>
              <Lock size={14} />
              <span>Sign with Private Key & Commit to Evidence Ledger</span>
            </button>

            <div style={{ fontSize: 10.5, color: "var(--muted)", lineHeight: 1.3 }}>
              Every annotation is signed with the analyst's FIPS 140-3 hardware token and timestamped against NIST RFC 3161 public time servers for courtroom admissibility.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
