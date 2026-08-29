"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck2,
  Lock,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Hash,
  Clock,
  User,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
  Shield,
  FileSpreadsheet,
  Cpu,
  Fingerprint
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

interface ForensicArtifact {
  id: string;
  name: string;
  type: "RAM_DUMP" | "VMDK_IMAGE" | "PCAP_TRACE" | "REGISTRY_HIVE" | "MFT_RECORD" | "RANSOM_NOTE";
  sourceHost: string;
  sizeMB: number;
  acquiredAt: string;
  custodian: string;
  custodianRole: string;
  sha256Hash: string;
  merkleRoot: string;
  writeBlockerUsed: string;
  fre901Compliant: boolean;
  fre702Validated: boolean;
  tamperSealVerified: boolean;
  storageLocation: string;
  chainOfCustodyLogs: {
    timestamp: string;
    from: string;
    to: string;
    action: string;
    reason: string;
  }[];
}

const MOCK_ARTIFACTS: ForensicArtifact[] = [
  {
    id: "EVD-2026-0891-RAM",
    name: "DC01_PhysicalMemory_LiveCapture.raw",
    type: "RAM_DUMP",
    sourceHost: "DC01.mercy.local (10.14.2.10)",
    sizeMB: 32768,
    acquiredAt: "2026-08-23T06:45:12Z",
    custodian: "Elena Rostova (GCFA #4491)",
    custodianRole: "Lead Forensic Investigator",
    sha256Hash: "8f74a9c39e2b64d1f2e87a649b109e2381ab924e5b721894b819f72bc9a04182",
    merkleRoot: "0x4b78912e...a991f82c",
    writeBlockerUsed: "WinPmem Kernel Driver (Read-Only Ring-0 Mode)",
    fre901Compliant: true,
    fre702Validated: true,
    tamperSealVerified: true,
    storageLocation: "WORM Vault S3 / Bucket: aegis-evidence-mercy-8841",
    chainOfCustodyLogs: [
      { timestamp: "2026-08-23T06:45:12Z", from: "DC01.mercy.local", to: "Elena Rostova", action: "Volatile Memory Acquisition", reason: "Initial Incident Response Isolation" },
      { timestamp: "2026-08-23T07:15:00Z", from: "Elena Rostova", to: "Aegis Evidence Vault", action: "Encrypted Ingestion (AES-256)", reason: "Chain of Custody Immutable Archival" }
    ]
  },
  {
    id: "EVD-2026-0892-VMDK",
    name: "SQL-CLINICAL-01_EncryptedOS.vmdk",
    type: "VMDK_IMAGE",
    sourceHost: "HYPERV-NODE-01 (10.14.1.11)",
    sizeMB: 512000,
    acquiredAt: "2026-08-23T07:30:00Z",
    custodian: "Marcus Vance (GCIH #3108)",
    custodianRole: "DFIR Senior Analyst",
    sha256Hash: "3a92f810bc8749e19a4e872c01948ba981726a45bd0192847291a0bce8293741",
    merkleRoot: "0x12a9e884...719b48f1",
    writeBlockerUsed: "Tableau Forensic PCIe Bridge T8u",
    fre901Compliant: true,
    fre702Validated: true,
    tamperSealVerified: true,
    storageLocation: "Offline Enclave SAN #03 (Read-Only LUN 9)",
    chainOfCustodyLogs: [
      { timestamp: "2026-08-23T07:30:00Z", from: "HYPERV-NODE-01", to: "Marcus Vance", action: "Bit-Stream Disk Clone (Raw)", reason: "Evidence Preservation prior to restoration" }
    ]
  },
  {
    id: "EVD-2026-0893-PCAP",
    name: "C2_Egress_Tshark_Capture_0823.pcap",
    type: "PCAP_TRACE",
    sourceHost: "Core-Switch-Vlan14 (10.14.0.1)",
    sizeMB: 4850,
    acquiredAt: "2026-08-23T06:20:00Z",
    custodian: "David Kross (GCFA #5920)",
    custodianRole: "Senior Malware Researcher",
    sha256Hash: "d7a41982bfe9418294a081726b4819c9018472910abce8491028374619a84712",
    merkleRoot: "0x89e21820...41829abc",
    writeBlockerUsed: "Span Port Hardware TAP (Optical)",
    fre901Compliant: true,
    fre702Validated: true,
    tamperSealVerified: true,
    storageLocation: "WORM Vault S3 / Bucket: aegis-evidence-mercy-8841",
    chainOfCustodyLogs: [
      { timestamp: "2026-08-23T06:20:00Z", from: "Core-Switch-Vlan14", to: "David Kross", action: "Network Packet Capture Extraction", reason: "Exfiltration Volume Verification" }
    ]
  },
  {
    id: "EVD-2026-0894-REG",
    name: "DC01_SYSTEM_SAM_SOFTWARE_Hives.zip",
    type: "REGISTRY_HIVE",
    sourceHost: "DC01.mercy.local (10.14.2.10)",
    sizeMB: 340,
    acquiredAt: "2026-08-23T08:10:00Z",
    custodian: "Sarah Jenkins (CISM #8812)",
    custodianRole: "Incident Commander",
    sha256Hash: "1948bc8192a01e9284726190abce8492019481726a45b8192847102938475619",
    merkleRoot: "0x7719a84b...9201e824",
    writeBlockerUsed: "FTK Imager v4.7 (Mounted Read-Only Shadow)",
    fre901Compliant: true,
    fre702Validated: true,
    tamperSealVerified: true,
    storageLocation: "Cold Locker LTO-8 Tape Vault #2",
    chainOfCustodyLogs: [
      { timestamp: "2026-08-23T08:10:00Z", from: "DC01.mercy.local", to: "Sarah Jenkins", action: "Registry Hive Extraction", reason: "Persistence & Lateral Movement Audit" }
    ]
  }
];

export default function EvidenceChainOfCustodyPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [artifacts, setArtifacts] = useState<ForensicArtifact[]>(MOCK_ARTIFACTS);
  const [selectedArtifact, setSelectedArtifact] = useState<ForensicArtifact>(MOCK_ARTIFACTS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [newReason, setNewReason] = useState("");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const activeCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  const filteredArtifacts = artifacts.filter((art) => {
    const matchesSearch =
      art.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.sourceHost.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.custodian.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || art.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleVerifyHash = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      setVerifyingId(null);
      setArtifacts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, tamperSealVerified: true } : a))
      );
    }, 1000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleLogTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient || !newReason) return;

    const newLog = {
      timestamp: new Date().toISOString(),
      from: selectedArtifact.custodian,
      to: newRecipient,
      action: "Custodial Transfer of Digital Evidence",
      reason: newReason
    };

    const updated = {
      ...selectedArtifact,
      custodian: newRecipient,
      chainOfCustodyLogs: [...selectedArtifact.chainOfCustodyLogs, newLog]
    };

    setArtifacts((prev) => prev.map((a) => (a.id === selectedArtifact.id ? updated : a)));
    setSelectedArtifact(updated);
    setShowTransferModal(false);
    setNewRecipient("");
    setNewReason("");
  };

  const handleExportLedger = () => {
    setExportNotice("Generated Court-Ready Evidence Ledger Certificate: FRE-901-CERT-8841.pdf (Signed with RFC-3161 Timestamp)");
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(14,21,38,0.95) 0%, rgba(22,32,56,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <ShieldCheck size={18} color="#10b981" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              Forensics & Evidence Integrity Chain of Custody
            </h1>
            <span className="badge-sev badge-success">Pillar 2: Analyze & Preserve</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Maintain an unbroken, court-admissible chain of custody under FRE 901 & 702. Track bit-stream disk images, volatile memory dumps,
            and network telemetry with cryptographic SHA-256 Merkle seals and hardware write-blocker verification.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={handleExportLedger} className="btn-primary">
            <Download size={15} />
            Export Certified Ledger
          </button>
        </div>
      </div>

      {exportNotice && (
        <div style={{
          background: "rgba(16,185,129,0.15)",
          border: "1px solid #10b981",
          borderRadius: 8,
          padding: "10px 16px",
          color: "#10b981",
          fontSize: 12.5,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Total Preserved Artifacts
            </span>
            <FileText size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>
            {artifacts.length} Items
          </div>
          <div style={{ fontSize: 11, color: "#10b981", marginTop: 4 }}>
            548.8 GB Total Forensic Volume
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Chain Integrity Seal
            </span>
            <Fingerprint size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#06b6d4" }}>
            100% Validated
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            0 Tamper Alerts Detected
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Court Admissibility
            </span>
            <ShieldCheck size={15} color="#a855f7" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#a855f7" }}>
            FRE 901 / 702
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            DoJ / Fed Civil Rules Certified
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Custodial Lead
            </span>
            <User size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {activeCase.assignedLead}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {activeCase.leadRole}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        {/* Left: Artifact Table & Filter */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HardDrive size={16} color="#06b6d4" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
                Immutable Evidence Registry
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <Search size={13} color="var(--muted)" style={{ position: "absolute", left: 8, top: 9 }} />
                <input
                  type="text"
                  placeholder="Search artifact / host..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="tool-input"
                  style={{ paddingLeft: 26, fontSize: 11.5, height: 30, width: 170 }}
                />
              </div>

              <select
                className="tool-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ padding: "4px 8px", fontSize: 11.5, height: 30 }}
              >
                <option value="ALL">All Types</option>
                <option value="RAM_DUMP">RAM Dump</option>
                <option value="VMDK_IMAGE">VMDK Clone</option>
                <option value="PCAP_TRACE">PCAP Trace</option>
                <option value="REGISTRY_HIVE">Registry Hive</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Artifact ID & Name</th>
                  <th>Source Host</th>
                  <th>Size</th>
                  <th>Custodian</th>
                  <th>SHA-256 Seal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArtifacts.map((art) => {
                  const isSelected = selectedArtifact.id === art.id;
                  const isVerifying = verifyingId === art.id;

                  return (
                    <tr
                      key={art.id}
                      onClick={() => setSelectedArtifact(art)}
                      style={{
                        background: isSelected ? "rgba(16,185,129,0.08)" : undefined,
                        cursor: "pointer"
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: isSelected ? "#10b981" : "#f8fafc", fontSize: 12 }}>
                          {art.id}
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {art.name}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: 11, color: "var(--fg-2)" }}>{art.sourceHost}</span>
                      </td>

                      <td>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>
                          {(art.sizeMB / 1024).toFixed(1)} GB
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: 11, color: "var(--fg-2)" }}>{art.custodian}</span>
                      </td>

                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifyHash(art.id);
                          }}
                          style={{
                            background: art.tamperSealVerified ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
                            border: art.tamperSealVerified ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(244,63,94,0.4)",
                            color: art.tamperSealVerified ? "#10b981" : "#f43f5e",
                            padding: "3px 8px",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4
                          }}
                        >
                          <CheckCircle2 size={11} className={isVerifying ? "animate-spin" : ""} />
                          {isVerifying ? "Verifying..." : "Verified"}
                        </button>
                      </td>

                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(art.sha256Hash, art.id);
                          }}
                          title="Copy SHA-256 Hash"
                          style={{
                            background: "var(--surface-3)",
                            border: "1px solid var(--border)",
                            color: "var(--fg)",
                            padding: "4px 6px",
                            borderRadius: 4,
                            cursor: "pointer"
                          }}
                        >
                          {copiedHash === art.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Artifact Detailed Chain of Custody Ledger & FRE 901 Audit */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Artifact Details Card */}
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div>
                <span className="badge-sev badge-success" style={{ marginBottom: 4 }}>
                  {selectedArtifact.type.replace(/_/g, " ")}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
                  {selectedArtifact.id}
                </h3>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {selectedArtifact.name}
                </div>
              </div>

              <button
                onClick={() => setShowTransferModal(true)}
                className="btn-secondary"
                style={{ fontSize: 11, padding: "5px 10px" }}
              >
                <Plus size={12} />
                Log Transfer
              </button>
            </div>

            {/* Hash & Verification Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Cryptographic SHA-256 Checksum
                </span>
                <div style={{
                  background: "#050811",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  fontSize: 10.5,
                  fontFamily: "monospace",
                  color: "#10b981",
                  wordBreak: "break-all",
                  marginTop: 3
                }}>
                  {selectedArtifact.sha256Hash}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                    Write-Blocker Method
                  </span>
                  <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
                    {selectedArtifact.writeBlockerUsed}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                    Storage Vault
                  </span>
                  <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
                    {selectedArtifact.storageLocation}
                  </div>
                </div>
              </div>
            </div>

            {/* FRE 901/702 Admissibility Checklist */}
            <div style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Court Admissibility Checklist (Fed Rules of Evidence)
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={13} color="#10b981" />
                  <span><strong>FRE 901(a):</strong> Cryptographic authentication via SHA-256 match</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={13} color="#10b981" />
                  <span><strong>FRE 901(b)(9):</strong> System/Process reliability with write-blocking hardware</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={13} color="#10b981" />
                  <span><strong>FRE 702:</strong> Scientific validity & expert certification (GCFA / CISM)</span>
                </div>
              </div>
            </div>

            {/* Unbroken Custodial Timeline */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Unbroken Chain of Custody Log
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {selectedArtifact.chainOfCustodyLogs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--surface-2)",
                      borderLeft: "3px solid #10b981",
                      padding: "8px 12px",
                      borderRadius: "0 6px 6px 0",
                      fontSize: 11.5
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 10 }}>
                      <span>{log.timestamp}</span>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>Log #{idx + 1}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: "#f8fafc", marginTop: 2 }}>
                      {log.action}
                    </div>
                    <div style={{ color: "var(--fg-2)", fontSize: 10.5, marginTop: 2 }}>
                      From: <code>{log.from}</code> → To: <code>{log.to}</code>
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 10, marginTop: 2, fontStyle: "italic" }}>
                      Reason: {log.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custodial Transfer Modal */}
      {showTransferModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          backdropFilter: "blur(4px)"
        }}>
          <div className="card-tactical" style={{ width: 460, padding: 24, background: "var(--surface)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc", marginBottom: 12 }}>
              Log Chain of Custody Transfer
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
              Transferring evidence custody for: <strong>{selectedArtifact.id}</strong>. This entry will be cryptographically appended to the immutable audit trail.
            </p>

            <form onSubmit={handleLogTransfer} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  Current Custodian
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedArtifact.custodian}
                  className="tool-input"
                  style={{ width: "100%", opacity: 0.7 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  New Custodial Recipient & Certification
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Vance (GCIH #3108) or FBI Cyber Squad"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  required
                  className="tool-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  Transfer Purpose & Reason
                </label>
                <textarea
                  placeholder="State the legal or forensic operational reason for transfer..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  required
                  className="tool-input"
                  style={{ width: "100%", height: 70, resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Sign & Append Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
