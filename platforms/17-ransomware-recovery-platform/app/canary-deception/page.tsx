"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileWarning,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  HardDrive,
  Terminal,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Search,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  Eye,
  Crosshair,
  Hash,
  Share2,
  FolderLock,
  Plus,
  Copy,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Database,
  KeyRound
} from "lucide-react";
import { CanaryTrapFile, CanaryTripEvent } from "@/types/recovery";

// 24 Deployed Honeypot Canary Files across corporate shares
const INITIAL_CANARY_TRAPS: CanaryTrapFile[] = [
  {
    id: "canary-01",
    shareName: "HR_Finance_Confidential",
    uncPath: "\\\\NAS-CORP-01\\HR_Finance_Confidential\\~$2026_Executive_Payroll_Comp.xlsx",
    fileName: "~$2026_Executive_Payroll_Comp.xlsx",
    fileType: "XLSX",
    fileSizeBytes: 48200,
    originalSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    deployedAt: "2026-08-20T08:00:00Z",
    status: "TRIPPED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:32:00Z",
    lastTamperTime: "2026-08-24T00:30:45Z",
    tamperingProcess: {
      pid: 9028,
      processName: "svchost_updater.exe",
      executableHash: "8f4c2b9a7d3e110a562bf0198cd44a9e223019ab7612f00a84d0b17849c23114",
      userAccount: "mercy\\svc_backup_mgmt",
      parentProcess: "powershell.exe",
      parentPid: 8812,
      tamperedSha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
      entropyJump: 4.88
    }
  },
  {
    id: "canary-02",
    shareName: "Clinical_EHR_Root",
    uncPath: "\\\\FS-CLINICAL-01\\EHR_Data\\Patient_Billing_Master_2026.mdf",
    fileName: "Patient_Billing_Master_2026.mdf",
    fileType: "MDF",
    fileSizeBytes: 10485760,
    originalSha256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    deployedAt: "2026-08-20T08:00:00Z",
    status: "ARMED",
    tripwireType: "MINIFILTER_DRIVER",
    lastHeartbeat: "2026-08-24T00:33:00Z"
  },
  {
    id: "canary-03",
    shareName: "Legal_Litigation",
    uncPath: "\\\\FS-LEGAL-03\\Litigation\\~$M&A_Acquisition_Terms_Secret.docx",
    fileName: "~$M&A_Acquisition_Terms_Secret.docx",
    fileType: "DOCX",
    fileSizeBytes: 32400,
    originalSha256: "1f8ac10f23c5b5bc1167bda84b833e5c057a77d2ec394040f82727d260f9b84f",
    deployedAt: "2026-08-20T08:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:33:10Z"
  },
  {
    id: "canary-04",
    shareName: "DevOps_Infrastructure",
    uncPath: "\\\\GIT-BACKUP-01\\RepoStaging\\prod_aws_master_keys.env",
    fileName: "prod_aws_master_keys.env",
    fileType: "ENV",
    fileSizeBytes: 2048,
    originalSha256: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    deployedAt: "2026-08-21T10:15:00Z",
    status: "ARMED",
    tripwireType: "SMB_ACCESS_AUDIT",
    lastHeartbeat: "2026-08-24T00:33:20Z"
  },
  {
    id: "canary-05",
    shareName: "SecOps_KeyStore",
    uncPath: "\\\\SEC-VAULT-02\\EmergencyKeePass\\Global_Domain_Admins.kdbx",
    fileName: "Global_Domain_Admins.kdbx",
    fileType: "KDBX",
    fileSizeBytes: 184000,
    originalSha256: "bc54f81496191e66b809ec613595b1fa139b5ae454f4d24a3776ae41f1163299",
    deployedAt: "2026-08-21T10:15:00Z",
    status: "ARMED",
    tripwireType: "MINIFILTER_DRIVER",
    lastHeartbeat: "2026-08-24T00:33:30Z"
  },
  {
    id: "canary-06",
    shareName: "Radiology_PACS_Share",
    uncPath: "\\\\PACS-STORE-01\\Archive\\DICOM_Master_Index_2026.sql",
    fileName: "DICOM_Master_Index_2026.sql",
    fileType: "SQL",
    fileSizeBytes: 524000,
    originalSha256: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    deployedAt: "2026-08-21T12:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:33:40Z"
  },
  {
    id: "canary-07",
    shareName: "Executive_Board_Deck",
    uncPath: "\\\\EXEC-NAS-01\\BoardDecks\\Q4_Strategic_Restructuring.pdf",
    fileName: "Q4_Strategic_Restructuring.pdf",
    fileType: "PDF",
    fileSizeBytes: 1840200,
    originalSha256: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    deployedAt: "2026-08-22T09:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:33:00Z"
  },
  {
    id: "canary-08",
    shareName: "Pharmacy_Billing_Share",
    uncPath: "\\\\PHARM-SRV-01\\BillingLogs\\Rx_Prescription_Claims_Aug2026.xlsx",
    fileName: "Rx_Prescription_Claims_Aug2026.xlsx",
    fileType: "XLSX",
    fileSizeBytes: 62000,
    originalSha256: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    deployedAt: "2026-08-22T09:30:00Z",
    status: "ARMED",
    tripwireType: "MINIFILTER_DRIVER",
    lastHeartbeat: "2026-08-24T00:33:15Z"
  },
  {
    id: "canary-09",
    shareName: "Accounting_General_Ledger",
    uncPath: "\\\\ACCT-FS-01\\GL_Exports\\SAP_General_Ledger_FY26.xlsx",
    fileName: "SAP_General_Ledger_FY26.xlsx",
    fileType: "XLSX",
    fileSizeBytes: 98000,
    originalSha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    deployedAt: "2026-08-22T10:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:33:20Z"
  },
  {
    id: "canary-10",
    shareName: "Research_Clinical_Trials",
    uncPath: "\\\\RESEARCH-FS-02\\Oncology_Study\\DoubleBlind_Trial_Results.docx",
    fileName: "DoubleBlind_Trial_Results.docx",
    fileType: "DOCX",
    fileSizeBytes: 142000,
    originalSha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    deployedAt: "2026-08-22T11:00:00Z",
    status: "ARMED",
    tripwireType: "MINIFILTER_DRIVER",
    lastHeartbeat: "2026-08-24T00:33:25Z"
  },
  {
    id: "canary-11",
    shareName: "Cardiology_Telemetry",
    uncPath: "\\\\CARDIO-SRV-01\\TelemetryDumps\\ICU_ECG_LiveStream.mdf",
    fileName: "ICU_ECG_LiveStream.mdf",
    fileType: "MDF",
    fileSizeBytes: 8400000,
    originalSha256: "bc527777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    deployedAt: "2026-08-22T14:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:33:30Z"
  },
  {
    id: "canary-12",
    shareName: "ERP_Supply_Chain",
    uncPath: "\\\\ERP-APP-03\\SupplyChain\\Vendor_Wire_Routing_Codes.pdf",
    fileName: "Vendor_Wire_Routing_Codes.pdf",
    fileType: "PDF",
    fileSizeBytes: 72000,
    originalSha256: "3495ff6210c6db0d32c4bf0469e324d708b476d31fb02c4172a0f3eee797dd18",
    deployedAt: "2026-08-22T15:00:00Z",
    status: "ARMED",
    tripwireType: "SMB_ACCESS_AUDIT",
    lastHeartbeat: "2026-08-24T00:33:35Z"
  },
  // Additional shares for full 24 corporate shares coverage
  {
    id: "canary-13",
    shareName: "Facilities_SCADA_Configs",
    uncPath: "\\\\SCADA-GW-01\\HVAC_Configs\\Generator_Override_Pins.docx",
    fileName: "Generator_Override_Pins.docx",
    fileType: "DOCX",
    fileSizeBytes: 24000,
    originalSha256: "8e2b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7",
    deployedAt: "2026-08-23T06:00:00Z",
    status: "ARMED",
    tripwireType: "MINIFILTER_DRIVER",
    lastHeartbeat: "2026-08-24T00:33:40Z"
  },
  {
    id: "canary-14",
    shareName: "HR_Employee_Benefits",
    uncPath: "\\\\HR-BENEFITS-01\\2026_Enrollment\\SSN_Deduction_Table.xlsx",
    fileName: "SSN_Deduction_Table.xlsx",
    fileType: "XLSX",
    fileSizeBytes: 44000,
    originalSha256: "5e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85",
    deployedAt: "2026-08-23T07:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:33:45Z"
  },
  {
    id: "canary-15",
    shareName: "Lab_Pathology_Reports",
    uncPath: "\\\\PATH-FS-01\\BiopsyResults\\~$Oncology_Histology_Database.sql",
    fileName: "~$Oncology_Histology_Database.sql",
    fileType: "SQL",
    fileSizeBytes: 310000,
    originalSha256: "9afbf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c14",
    deployedAt: "2026-08-23T08:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:33:50Z"
  },
  {
    id: "canary-16",
    shareName: "Network_Core_Switches",
    uncPath: "\\\\NET-OPS-01\\SwitchBackups\\Cisco_Core_Secrets.env",
    fileName: "Cisco_Core_Secrets.env",
    fileType: "ENV",
    fileSizeBytes: 3500,
    originalSha256: "27ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb924",
    deployedAt: "2026-08-23T09:00:00Z",
    status: "ARMED",
    tripwireType: "MINIFILTER_DRIVER",
    lastHeartbeat: "2026-08-24T00:33:52Z"
  },
  {
    id: "canary-17",
    shareName: "Telehealth_WebRTC_Logs",
    uncPath: "\\\\TELE-SRV-02\\SessionVault\\Patient_VideoCall_Tokens.pdf",
    fileName: "Patient_VideoCall_Tokens.pdf",
    fileType: "PDF",
    fileSizeBytes: 120000,
    originalSha256: "ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934",
    deployedAt: "2026-08-23T10:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:33:54Z"
  },
  {
    id: "canary-18",
    shareName: "Identity_ActiveDirectory_Snap",
    uncPath: "\\\\DC-BACKUP-01\\AD_Snapshots\\ntds_dit_decoy.mdf",
    fileName: "ntds_dit_decoy.mdf",
    fileType: "MDF",
    fileSizeBytes: 15400000,
    originalSha256: "b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991",
    deployedAt: "2026-08-23T11:00:00Z",
    status: "ARMED",
    tripwireType: "MINIFILTER_DRIVER",
    lastHeartbeat: "2026-08-24T00:33:55Z"
  },
  {
    id: "canary-19",
    shareName: "Billing_Insurance_Claims",
    uncPath: "\\\\INS-CLAIMS-01\\EDI_835\\Medicare_Remittance_Advice.xlsx",
    fileName: "Medicare_Remittance_Advice.xlsx",
    fileType: "XLSX",
    fileSizeBytes: 89000,
    originalSha256: "92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb",
    deployedAt: "2026-08-23T12:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:33:56Z"
  },
  {
    id: "canary-20",
    shareName: "Compliance_HIPAA_Audits",
    uncPath: "\\\\AUDIT-FS-01\\HIPAA_2026\\OCR_Investigation_Response.docx",
    fileName: "OCR_Investigation_Response.docx",
    fileType: "DOCX",
    fileSizeBytes: 64000,
    originalSha256: "4649b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e",
    deployedAt: "2026-08-23T13:00:00Z",
    status: "ARMED",
    tripwireType: "SMB_ACCESS_AUDIT",
    lastHeartbeat: "2026-08-24T00:33:57Z"
  },
  {
    id: "canary-21",
    shareName: "Emergency_Dept_Triage",
    uncPath: "\\\\ED-TRIAGE-01\\FastTrack\\Trauma_Admissions_NightShift.mdf",
    fileName: "Trauma_Admissions_NightShift.mdf",
    fileType: "MDF",
    fileSizeBytes: 3200000,
    originalSha256: "34ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b9",
    deployedAt: "2026-08-23T14:00:00Z",
    status: "ARMED",
    tripwireType: "MINIFILTER_DRIVER",
    lastHeartbeat: "2026-08-24T00:33:58Z"
  },
  {
    id: "canary-22",
    shareName: "Card_Payment_Gateways",
    uncPath: "\\\\PCI-VAULT-01\\MerchantKeys\\Stripe_Production_Webhook.env",
    fileName: "Stripe_Production_Webhook.env",
    fileType: "ENV",
    fileSizeBytes: 1800,
    originalSha256: "91b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca4959",
    deployedAt: "2026-08-23T15:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:33:58Z"
  },
  {
    id: "canary-23",
    shareName: "BioMed_Infusion_Pumps",
    uncPath: "\\\\IOT-BIOMED-01\\FirmwareVault\\Alaris_Pump_Firmware_Keys.pdf",
    fileName: "Alaris_Pump_Firmware_Keys.pdf",
    fileType: "PDF",
    fileSizeBytes: 1400000,
    originalSha256: "55e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8",
    deployedAt: "2026-08-23T16:00:00Z",
    status: "ARMED",
    tripwireType: "MINIFILTER_DRIVER",
    lastHeartbeat: "2026-08-24T00:33:59Z"
  },
  {
    id: "canary-24",
    shareName: "CSuite_Credentials_Vault",
    uncPath: "\\\\EXEC-SEC-01\\KeepassMaster\\CSuite_Master_Passwords.kdbx",
    fileName: "CSuite_Master_Passwords.kdbx",
    fileType: "KDBX",
    fileSizeBytes: 240000,
    originalSha256: "1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc",
    deployedAt: "2026-08-23T17:00:00Z",
    status: "ARMED",
    tripwireType: "SUB_500MS_FS_NOTIFY",
    lastHeartbeat: "2026-08-24T00:34:00Z"
  }
];

export default function CanaryDeceptionPage() {
  const [traps, setTraps] = useState<CanaryTrapFile[]>(INITIAL_CANARY_TRAPS);
  const [selectedTrap, setSelectedTrap] = useState<CanaryTrapFile>(INITIAL_CANARY_TRAPS[0]);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"grid" | "simulator" | "deploy">("grid");
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [microRules, setMicroRules] = useState<string[]>([
    "iptables -I FORWARD -s 10.14.4.18 -j DROP # Auto-quarantine by Canary-01 tripwire",
    "New-NetFirewallRule -DisplayName 'Aegis-Canary-Quarantine-PID-9028' -Direction Outbound -Action Block"
  ]);

  // Deployment form state
  const [deployShare, setDeployShare] = useState("Finance_Q4_Audit");
  const [deployType, setDeployType] = useState<"DOCX" | "XLSX" | "PDF" | "MDF" | "ENV" | "KDBX" | "SQL">("XLSX");
  const [deployBaitTheme, setDeployBaitTheme] = useState("Executive Compensation & Bonus FY26");
  const [deployTripwire, setDeployTripwire] = useState<"SUB_500MS_FS_NOTIFY" | "MINIFILTER_DRIVER" | "SMB_ACCESS_AUDIT">("SUB_500MS_FS_NOTIFY");
  const [deploySuccess, setDeploySuccess] = useState(false);

  // Filtered traps
  const filteredTraps = useMemo(() => {
    return traps.filter((trap) => {
      const matchSearch =
        searchFilter === "" ||
        trap.shareName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        trap.fileName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        trap.uncPath.toLowerCase().includes(searchFilter.toLowerCase());
      const matchStatus = statusFilter === "ALL" || trap.status === statusFilter;
      const matchType = typeFilter === "ALL" || trap.fileType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [traps, searchFilter, statusFilter, typeFilter]);

  // Simulate ransomware probing and tripwire trigger
  const handleSimulateProbe = (trapId: string) => {
    setSimulationRunning(true);
    setTimeout(() => {
      setTraps((prev) =>
        prev.map((t) => {
          if (t.id === trapId) {
            return {
              ...t,
              status: "TRIPPED",
              lastTamperTime: new Date().toISOString(),
              tamperingProcess: {
                pid: 7412,
                processName: "ransom_encryptor.exe",
                executableHash: "3f7b2c9a1d4e560a892bf0198cd44a9e223019ab7612f00a84d0b17849c29881",
                userAccount: "mercy\\compromised_admin",
                parentProcess: "powershell.exe",
                parentPid: 4210,
                tamperedSha256: "cc7a1928374615243546576879809182736451234567890abcdef1234567890a",
                entropyJump: 5.12
              }
            };
          }
          return t;
        })
      );
      const newRule = `iptables -I FORWARD -s 10.14.7.55 -j DROP # Trapped by ${trapId} at sub-120ms latency`;
      setMicroRules((prev) => [newRule, ...prev]);
      setSimulationRunning(false);
      const tripped = traps.find((t) => t.id === trapId);
      if (tripped) {
        setSelectedTrap({
          ...tripped,
          status: "TRIPPED",
          lastTamperTime: new Date().toISOString()
        });
      }
    }, 900);
  };

  // Deploy new canary decoy
  const handleDeployCanary = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrap: CanaryTrapFile = {
      id: `canary-${traps.length + 1}`,
      shareName: deployShare,
      uncPath: `\\\\NAS-SHARE-02\\${deployShare}\\~$${deployBaitTheme.replace(/ /g, "_")}.${deployType.toLowerCase()}`,
      fileName: `~$${deployBaitTheme.replace(/ /g, "_")}.${deployType.toLowerCase()}`,
      fileType: deployType,
      fileSizeBytes: Math.floor(Math.random() * 50000) + 15000,
      originalSha256: "a9f8e7d6c5b4a3210987654321fedcba0987654321abcdef0123456789abcdef",
      deployedAt: new Date().toISOString(),
      status: "ARMED",
      tripwireType: deployTripwire,
      lastHeartbeat: new Date().toISOString()
    };
    setTraps((prev) => [newTrap, ...prev]);
    setSelectedTrap(newTrap);
    setDeploySuccess(true);
    setTimeout(() => {
      setDeploySuccess(false);
      setActiveTab("grid");
    }, 1500);
  };

  return (
    <div style={{ padding: "20px 24px", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Breadcrumb & Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
            <span style={{ color: "#10b981", fontWeight: 700 }}>STAGE 2: PREVENT</span>
            <span>/</span>
            <span>DECEPTION & TRIPWIRES</span>
            <span>/</span>
            <span style={{ color: "var(--fg)" }}>CANARY DECEPTION TRAP GRID</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "#f8fafc" }}>
              Canary Files & Deception Trap Grid
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 8px",
                borderRadius: 4,
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.3)"
              }}
            >
              24 SHARES PROTECTED
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Sub-500ms tripwire sensor grid intercepting unauthorized directory traversals, read/write payloads, and auto-generating network micro-segmentation rules.
          </p>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: 6, padding: 2, border: "1px solid var(--border)" }}>
            <button
              onClick={() => setActiveTab("grid")}
              style={{
                padding: "6px 14px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                background: activeTab === "grid" ? "var(--primary)" : "transparent",
                color: activeTab === "grid" ? "#070b12" : "var(--fg-2)",
                cursor: "pointer"
              }}
            >
              Trap Grid (24)
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              style={{
                padding: "6px 14px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                background: activeTab === "simulator" ? "var(--primary)" : "transparent",
                color: activeTab === "simulator" ? "#070b12" : "var(--fg-2)",
                cursor: "pointer"
              }}
            >
              Probe Simulator
            </button>
            <button
              onClick={() => setActiveTab("deploy")}
              style={{
                padding: "6px 14px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                background: activeTab === "deploy" ? "var(--primary)" : "transparent",
                color: activeTab === "deploy" ? "#070b12" : "var(--fg-2)",
                cursor: "pointer"
              }}
            >
              + Deploy Decoy
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Telemetry Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Active Honeypot Traps
            </span>
            <FolderLock size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 6, fontFamily: "monospace" }}>
            24 <span style={{ fontSize: 12, color: "var(--muted)" }}>Shares Armed</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            100% Coverage of Critical Storage SMB
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Detection Latency
            </span>
            <Activity size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 6, fontFamily: "monospace" }}>
            142 ms <span style={{ fontSize: 12, color: "var(--muted)" }}>Avg Sensor Time</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Threshold: Sub-500ms kernel notification
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Tripped Tripwires
            </span>
            <FileWarning size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f43f5e", marginTop: 6, fontFamily: "monospace" }}>
            {traps.filter((t) => t.status === "TRIPPED").length} <span style={{ fontSize: 12, color: "var(--muted)" }}>Active Breaches</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Rogue PID 9028 Intercepted & Segregated
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Auto-Isolation Rules
            </span>
            <ShieldAlert size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#a855f7", marginTop: 6, fontFamily: "monospace" }}>
            {microRules.length} Enforced
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Zero-Trust Network Micro-Segmentation
          </div>
        </div>
      </div>

      {/* Tab 1: 24 Share Grid View */}
      {activeTab === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20 }}>
          {/* Left: 24 Trap Grid & Filters */}
          <div className="card-tactical" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FolderLock size={16} color="#10b981" />
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
                  Corporate Honeypot Trap Inventory (24 Shares)
                </h2>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="tool-select"
                  style={{ fontSize: 11.5, padding: "4px 8px" }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ARMED">Armed Only</option>
                  <option value="TRIPPED">Tripped Only</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="tool-select"
                  style={{ fontSize: 11.5, padding: "4px 8px" }}
                >
                  <option value="ALL">All File Types</option>
                  <option value="XLSX">.xlsx (Excel)</option>
                  <option value="DOCX">.docx (Word)</option>
                  <option value="PDF">.pdf (Acrobat)</option>
                  <option value="MDF">.mdf (SQL DB)</option>
                  <option value="ENV">.env (Secrets)</option>
                  <option value="KDBX">.kdbx (KeePass)</option>
                  <option value="SQL">.sql (Dump)</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <Search size={14} color="var(--muted)" style={{ position: "absolute", left: 10, top: 10 }} />
              <input
                type="text"
                placeholder="Search by Share Name, Bait File, UNC Path..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="tool-input"
                style={{ width: "100%", paddingLeft: 32, fontSize: 12 }}
              />
            </div>

            {/* Grid Table */}
            <div style={{ overflowX: "auto", maxHeight: "580px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Share Name</th>
                    <th>Decoy Bait File</th>
                    <th>Type</th>
                    <th>Sensor Driver</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTraps.map((trap) => {
                    const isSelected = selectedTrap?.id === trap.id;
                    const isTripped = trap.status === "TRIPPED";

                    return (
                      <tr
                        key={trap.id}
                        onClick={() => setSelectedTrap(trap)}
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "rgba(16,185,129,0.08)" : undefined,
                          borderLeft: isSelected ? "3px solid #10b981" : "3px solid transparent"
                        }}
                      >
                        <td>
                          <span
                            className={`badge-sev ${
                              isTripped ? "badge-critical animate-pulse" : "badge-success"
                            }`}
                          >
                            {trap.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: 12 }}>
                            {trap.shareName}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                            {trap.uncPath.length > 38 ? trap.uncPath.substring(0, 38) + "..." : trap.uncPath}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {trap.fileType === "XLSX" ? (
                              <FileSpreadsheet size={13} color="#10b981" />
                            ) : trap.fileType === "DOCX" ? (
                              <FileText size={13} color="#06b6d4" />
                            ) : trap.fileType === "MDF" || trap.fileType === "SQL" ? (
                              <Database size={13} color="#f59e0b" />
                            ) : (
                              <KeyRound size={13} color="#a855f7" />
                            )}
                            <span style={{ fontSize: 11.5, color: isTripped ? "#f43f5e" : "var(--fg)", fontWeight: 600 }}>
                              {trap.fileName}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)" }}>
                            .{trap.fileType.toLowerCase()}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 10.5, color: "#06b6d4" }}>
                            {trap.tripwireType === "SUB_500MS_FS_NOTIFY"
                              ? "FS Notify Hook"
                              : trap.tripwireType === "MINIFILTER_DRIVER"
                              ? "Kernel Minifilter"
                              : "SMB Audit Event"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {isTripped ? (
                            <span style={{ fontSize: 11, color: "#f43f5e", fontWeight: 700 }}>
                              SEGREGATED
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSimulateProbe(trap.id);
                              }}
                              style={{
                                background: "rgba(6,182,212,0.12)",
                                border: "1px solid rgba(6,182,212,0.3)",
                                color: "#06b6d4",
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 10.5,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              Test Probe
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

          {/* Right: Trap Sensor Forensics Inspector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {selectedTrap && (
              <div className="card-tactical" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                    <Eye size={15} color="#10b981" />
                    <span>Canary Sensor Forensics</span>
                  </div>
                  <span
                    className={`badge-sev ${
                      selectedTrap.status === "TRIPPED" ? "badge-critical" : "badge-success"
                    }`}
                  >
                    {selectedTrap.status}
                  </span>
                </div>

                {/* Bait UNC Path */}
                <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "12px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                    Deception Tripwire Location
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981", wordBreak: "break-all", fontFamily: "monospace" }}>
                    {selectedTrap.uncPath}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
                    Size: {(selectedTrap.fileSizeBytes / 1024).toFixed(1)} KB | Deployed: {selectedTrap.deployedAt.split("T")[0]}
                  </div>
                </div>

                {/* Cryptographic Hash Baseline */}
                <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "10px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                    Baseline SHA-256 Checksum
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#cbd5e1", wordBreak: "break-all" }}>
                    {selectedTrap.originalSha256}
                  </div>
                </div>

                {/* Tampering Forensics if Tripped */}
                {selectedTrap.tamperingProcess ? (
                  <div
                    style={{
                      background: "rgba(244,63,94,0.1)",
                      border: "1px solid rgba(244,63,94,0.3)",
                      borderRadius: 6,
                      padding: "12px",
                      marginBottom: 12
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#f43f5e", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
                      <AlertTriangle size={14} />
                      <span>UNAUTHORIZED ACCESS INTERCEPTED</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, marginBottom: 8 }}>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Rogue Process:</span>
                        <div style={{ color: "#f43f5e", fontWeight: 700, fontFamily: "monospace" }}>
                          {selectedTrap.tamperingProcess.processName} (PID {selectedTrap.tamperingProcess.pid})
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>User Account:</span>
                        <div style={{ color: "#f8fafc", fontWeight: 700 }}>
                          {selectedTrap.tamperingProcess.userAccount}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)" }}>Parent Executable:</span>{" "}
                      <span style={{ color: "#f8fafc", fontFamily: "monospace" }}>
                        {selectedTrap.tamperingProcess.parentProcess} (PPID {selectedTrap.tamperingProcess.parentPid})
                      </span>
                    </div>

                    <div style={{ fontSize: 10, fontFamily: "monospace", color: "#f43f5e", wordBreak: "break-all", marginTop: 4 }}>
                      Tampered Hash: {selectedTrap.tamperingProcess.tamperedSha256}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "12px", marginBottom: 12, textAlign: "center" }}>
                    <CheckCircle2 size={20} color="#10b981" style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>
                      Zero Tamper Events Detected
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      Minifilter monitoring sub-500ms filesystem IRP_MJ_CREATE & IRP_MJ_WRITE requests.
                    </div>
                  </div>
                )}

                {/* Simulate Probe Action */}
                {selectedTrap.status !== "TRIPPED" && (
                  <button
                    onClick={() => handleSimulateProbe(selectedTrap.id)}
                    disabled={simulationRunning}
                    style={{
                      width: "100%",
                      background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                      color: "#070b12",
                      fontWeight: 800,
                      padding: "9px 14px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <Crosshair size={14} />
                    <span>{simulationRunning ? "Simulating Probe..." : "Simulate Ransomware Traversal Probe"}</span>
                  </button>
                )}
              </div>
            )}

            {/* Active Micro-Segmentation Rules */}
            <div className="card-tactical" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Terminal size={15} color="#10b981" />
                <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
                  Auto-Generated Micro-Segmentation Rules
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {microRules.map((rule, idx) => (
                  <pre
                    key={idx}
                    style={{
                      background: "#070b12",
                      padding: "6px 8px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontFamily: "monospace",
                      color: "#10b981",
                      whiteSpace: "pre-wrap",
                      margin: 0
                    }}
                  >
                    {rule}
                  </pre>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Ransomware Traversal Probe Simulator */}
      {activeTab === "simulator" && (
        <div className="card-tactical" style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Crosshair size={22} color="#06b6d4" />
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                Ransomware Traversal & Tripwire Probe Simulator
              </h2>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Simulate an adversary discovering network shares, traversing folder trees, and attempting to encrypt a decoy canary payload.
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Target File Share
              </label>
              <select
                value={selectedTrap.id}
                onChange={(e) => {
                  const found = traps.find((t) => t.id === e.target.value);
                  if (found) setSelectedTrap(found);
                }}
                className="tool-select"
                style={{ width: "100%", marginTop: 6, fontSize: 12 }}
              >
                {traps.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.shareName} ({t.fileName})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Simulated Ransomware Variant
              </label>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f43f5e", marginTop: 8 }}>
                LockBit 3.0 (Black) · Multi-Threaded I/O Traversal
              </div>
            </div>
          </div>

          <div style={{ background: "#070b12", borderRadius: 6, padding: "14px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>
              Simulated Execution Log
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--fg-2)", display: "flex", flexDirection: "column", gap: 4 }}>
              <div>[00:34:01] Adversary connects to SMB share: {selectedTrap.uncPath}</div>
              <div>[00:34:02] Enumerating file entries: Found high-value decoy &quot;{selectedTrap.fileName}&quot;</div>
              <div style={{ color: "#f59e0b" }}>[00:34:02.140] Attempting IRP_MJ_CREATE with FILE_WRITE_DATA...</div>
              <div style={{ color: "#10b981", fontWeight: 700 }}>
                [00:34:02.142] ★ AEGIS TRIPWIRE TRIGGERED (Latency: 142ms)
              </div>
              <div style={{ color: "#06b6d4" }}>
                [00:34:02.143] Micro-segmentation rule injected: Severed SMB connection from 10.14.7.55
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSimulateProbe(selectedTrap.id)}
            disabled={simulationRunning}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#070b12",
              fontWeight: 900,
              padding: "12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            <Play size={16} />
            <span>{simulationRunning ? "EXECUTING SIMULATION..." : "RUN INTERACTIVE PROBE SIMULATION"}</span>
          </button>
        </div>
      )}

      {/* Tab 3: Deception Decoy Deployment Manager */}
      {activeTab === "deploy" && (
        <div className="card-tactical" style={{ padding: "24px", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Plus size={22} color="#10b981" />
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                Deploy New Deception Trap Decoy
              </h2>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Plant bait files with cryptographic watermarks into vulnerable shares to detect threat actors instantly.
              </div>
            </div>
          </div>

          {deploySuccess && (
            <div
              style={{
                background: "rgba(16,185,129,0.15)",
                border: "1px solid #10b981",
                borderRadius: 6,
                padding: "12px",
                marginBottom: 16,
                color: "#10b981",
                fontSize: 12.5,
                fontWeight: 700
              }}
            >
              ✓ Decoy successfully generated, watermarked, and armed across SMB share!
            </div>
          )}

          <form onSubmit={handleDeployCanary} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Target Corporate Share
              </label>
              <input
                type="text"
                value={deployShare}
                onChange={(e) => setDeployShare(e.target.value)}
                className="tool-input"
                style={{ width: "100%", marginTop: 4 }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Bait File Extension
                </label>
                <select
                  value={deployType}
                  onChange={(e) => setDeployType(e.target.value as any)}
                  className="tool-select"
                  style={{ width: "100%", marginTop: 4 }}
                >
                  <option value="XLSX">.xlsx (Financial / Payroll)</option>
                  <option value="DOCX">.docx (Legal / Strategy)</option>
                  <option value="PDF">.pdf (Executive M&A)</option>
                  <option value="MDF">.mdf (Database)</option>
                  <option value="ENV">.env (API Secrets)</option>
                  <option value="KDBX">.kdbx (Password Vault)</option>
                  <option value="SQL">.sql (Database Dump)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Tripwire Sensor Driver
                </label>
                <select
                  value={deployTripwire}
                  onChange={(e) => setDeployTripwire(e.target.value as any)}
                  className="tool-select"
                  style={{ width: "100%", marginTop: 4 }}
                >
                  <option value="SUB_500MS_FS_NOTIFY">Sub-500ms FS Notify Hook</option>
                  <option value="MINIFILTER_DRIVER">Kernel Minifilter Driver</option>
                  <option value="SMB_ACCESS_AUDIT">SMB Access Event Audit</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Deceptive Bait Theme Name
              </label>
              <input
                type="text"
                value={deployBaitTheme}
                onChange={(e) => setDeployBaitTheme(e.target.value)}
                className="tool-input"
                style={{ width: "100%", marginTop: 4 }}
                placeholder="e.g. Master_SSH_Keys_Q3"
                required
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 10,
                background: "var(--primary)",
                color: "#070b12",
                fontWeight: 900,
                padding: "10px 16px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <ShieldCheck size={16} />
              <span>DEPLOY & ARM CANARY TRIPWIRE</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
