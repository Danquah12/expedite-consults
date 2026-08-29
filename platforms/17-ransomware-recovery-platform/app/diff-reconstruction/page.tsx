"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Binary,
  FileCode,
  FileSpreadsheet,
  FileText,
  Database,
  HardDrive,
  Film,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  Copy,
  Cpu,
  ShieldCheck,
  Activity,
  Maximize2
} from "lucide-react";
import { IntermittentCorruptedFile, BlockDifferentialSegment } from "@/types/recovery";

// Mock intermittent corrupted files dataset
const INITIAL_INTERMITTENT_FILES: IntermittentCorruptedFile[] = [
  {
    id: "file-001",
    path: "\\\\FS-CLINICAL-01\\EHR_Data\\Patient_Billing_Master_2026.mdf",
    format: "SQL_MDF",
    totalSizeBytes: 104857600, // 100 MB
    encryptedHeaderBytes: 1048576, // First 1MB encrypted (LockBit 3.0 intermittent mode)
    intactDataPayloadBytes: 103809024, // 99 MB intact
    intermittentStrideBlockSizeKB: 1024,
    ransomwareSignature: "LockBit 3.0 (Header 1MB Cipher Mode)",
    reconstructabilityPct: 98.9,
    reconstructionMethod: "Synthetic Page Free Space (PFS) & GAM Map Extent Rebuilder",
    status: "RECOVERABLE",
    restoredDataPreview: "SQL Server Page Header synthesized. 12,480 patient billing records recovered from unencrypted B-Tree leaf pages."
  },
  {
    id: "file-002",
    path: "\\\\SAN-VMWARE-01\\Datastore_Prod\\VM-EHR-APP01-flat.vmdk",
    format: "VMDK",
    totalSizeBytes: 53687091200, // 50 GB
    encryptedHeaderBytes: 10485760, // First 10MB encrypted (BlackCat intermittent mode)
    intactDataPayloadBytes: 53676605440,
    intermittentStrideBlockSizeKB: 10240,
    ransomwareSignature: "BlackCat / ALPHV (10MB Stride Cipher)",
    reconstructabilityPct: 99.4,
    reconstructionMethod: "VMDK Descriptor & NTFS $MFT Master File Table Header Injection",
    status: "RECOVERABLE",
    restoredDataPreview: "VMDK disk descriptor and NTFS partition table restored. OS filesystem mounted in read-only forensic enclosure."
  },
  {
    id: "file-003",
    path: "\\\\FS-LEGAL-03\\Litigation\\2026_Merger_Acquisition_Terms.docx",
    format: "DOCX",
    totalSizeBytes: 4194304, // 4 MB
    encryptedHeaderBytes: 524288, // First 512 KB encrypted
    intactDataPayloadBytes: 3670016,
    intermittentStrideBlockSizeKB: 512,
    ransomwareSignature: "Play Ransomware (Partial Stride)",
    reconstructabilityPct: 97.5,
    reconstructionMethod: "ZIP Container Central Directory Reconstruction & Deflate Stream Carver",
    status: "RECOVERABLE",
    restoredDataPreview: "Repaired [Content_Types].xml and recovered document.xml raw text stream with 100% clause fidelity."
  },
  {
    id: "file-004",
    path: "\\\\FS-FINANCE-02\\Quarterly_Reports\\FY26_Cashflow_Forecast.xlsx",
    format: "XLSX",
    totalSizeBytes: 8388608, // 8 MB
    encryptedHeaderBytes: 1048576,
    intactDataPayloadBytes: 7340032,
    intermittentStrideBlockSizeKB: 1024,
    ransomwareSignature: "Babuk ESXi / Windows Locker",
    reconstructabilityPct: 96.8,
    reconstructionMethod: "SharedStrings.xml & Workbook XML Worksheet Tree Rebuilder",
    status: "RECOVERABLE",
    restoredDataPreview: "Reconstructed 42 financial model worksheets and recalculation cell formulas."
  },
  {
    id: "file-005",
    path: "\\\\PACS-STORE-01\\Radiology_Archive\\SURGERY_RECORDING_202608.mp4",
    format: "MP4",
    totalSizeBytes: 4294967296, // 4 GB
    encryptedHeaderBytes: 2097152, // 2MB
    intactDataPayloadBytes: 4292870144,
    intermittentStrideBlockSizeKB: 2048,
    ransomwareSignature: "DarkSide / Black Basta",
    reconstructabilityPct: 99.8,
    reconstructionMethod: "MPEG-4 'moov' / 'mdat' Atom Frame Index Synthesizer",
    status: "RECOVERABLE",
    restoredDataPreview: "Synthesized missing 'ftyp' and 'moov' atom header. 4K 60fps video stream decoded from offset 0x200000."
  }
];

// Block breakdown for the selected file
const MOCK_BLOCK_SEGMENTS: Record<string, BlockDifferentialSegment[]> = {
  "file-001": [
    { blockIndex: 0, startOffsetHex: "0x00000000", endOffsetHex: "0x00010000", sizeKB: 64, state: "ENCRYPTED_HEADER", entropy: 7.98, description: "LockBit Ciphertext: SQL Server File Header & Allocation Map (0x00)" },
    { blockIndex: 1, startOffsetHex: "0x00010000", endOffsetHex: "0x00020000", sizeKB: 64, state: "ENCRYPTED_HEADER", entropy: 7.95, description: "LockBit Ciphertext: PFS (Page Free Space) & GAM Map Extents" },
    { blockIndex: 2, startOffsetHex: "0x00020000", endOffsetHex: "0x00040000", sizeKB: 128, state: "SURGICALLY_REPAIRED", entropy: 4.82, description: "Aegis Reconstructed: Synthetic SQL Server 8KB Page Headers" },
    { blockIndex: 3, startOffsetHex: "0x00040000", endOffsetHex: "0x00100000", sizeKB: 768, state: "INTACT_PAYLOAD", entropy: 5.12, description: "Untouched Data Extent: Clinical Patient Records B-Tree Leaf Pages" },
    { blockIndex: 4, startOffsetHex: "0x00100000", endOffsetHex: "0x00800000", sizeKB: 7168, state: "INTACT_PAYLOAD", entropy: 5.24, description: "Untouched Data Extent: Insurance Claims & Transaction Ledger Pages" },
    { blockIndex: 5, startOffsetHex: "0x00800000", endOffsetHex: "0x06400000", sizeKB: 96256, state: "INTACT_PAYLOAD", entropy: 5.18, description: "Untouched Data Extent: Full Relational Database Table Space" }
  ],
  "file-003": [
    { blockIndex: 0, startOffsetHex: "0x00000000", endOffsetHex: "0x00080000", sizeKB: 512, state: "ENCRYPTED_HEADER", entropy: 7.99, description: "Play Ciphertext: ZIP Local File Headers PK\\x03\\x04" },
    { blockIndex: 1, startOffsetHex: "0x00080000", endOffsetHex: "0x00090000", sizeKB: 64, state: "RECONSTRUCTED_XML", entropy: 4.10, description: "Aegis Synthesized: [Content_Types].xml and /_rels/.rels Manifest" },
    { blockIndex: 2, startOffsetHex: "0x00090000", endOffsetHex: "0x00400000", sizeKB: 3520, state: "INTACT_PAYLOAD", entropy: 5.40, description: "Untouched Deflate Payload: Complete Legal Text and Tables" }
  ]
};

export default function DiffReconstructionPage() {
  const [files, setFiles] = useState<IntermittentCorruptedFile[]>(INITIAL_INTERMITTENT_FILES);
  const [selectedFileId, setSelectedFileId] = useState<string>("file-001");
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairProgress, setRepairProgress] = useState(0);
  const [repairLog, setRepairLog] = useState<string[]>([]);
  const [activeFormatFilter, setActiveFormatFilter] = useState<string>("ALL");

  const selectedFile = files.find(f => f.id === selectedFileId) || files[0];
  const segments = MOCK_BLOCK_SEGMENTS[selectedFile.id] || MOCK_BLOCK_SEGMENTS["file-001"];

  const handleExecuteSurgicalRepair = (fileId: string) => {
    setIsRepairing(true);
    setRepairProgress(10);
    setRepairLog([
      `[00.0s] Analyzing intermittent stride pattern for ${selectedFile.format} container...`,
      `[00.4s] Encrypted header size: ${(selectedFile.encryptedHeaderBytes / 1024).toFixed(0)} KB | Intact data: ${(selectedFile.intactDataPayloadBytes / (1024 * 1024)).toFixed(1)} MB (${selectedFile.reconstructabilityPct}%)`
    ]);

    setTimeout(() => {
      setRepairProgress(45);
      setRepairLog(prev => [
        ...prev,
        `[01.2s] Parsing undamaged internal structural records from offset 0x${(selectedFile.encryptedHeaderBytes).toString(16)}...`,
        `[01.8s] Applying ${selectedFile.reconstructionMethod}...`
      ]);
    }, 700);

    setTimeout(() => {
      setRepairProgress(85);
      setRepairLog(prev => [
        ...prev,
        `[02.5s] Synthesized missing container headers with strict RFC checksum alignment.`,
        `[03.1s] Validating database page CRC32 / ZIP deflate parity... All check constraints passed!`
      ]);
    }, 1500);

    setTimeout(() => {
      setRepairProgress(100);
      setRepairLog(prev => [
        ...prev,
        `[03.8s] SURGICAL REPAIR SUCCESSFUL! File restored with 98.4% data fidelity in 3.8s. (Saved 50TB full backup restore time)`
      ]);
      setFiles(prev =>
        prev.map(f => (f.id === fileId ? { ...f, status: "RECONSTRUCTED" } : f))
      );
      setIsRepairing(false);
    }, 2200);
  };

  const filteredFiles = files.filter(f => {
    if (activeFormatFilter === "ALL") return true;
    return f.format === activeFormatFilter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 24px", minHeight: "calc(100vh - 54px)" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(16,185,129,0.06) 50%, rgba(14,21,38,0.9) 100%)",
        border: "1px solid rgba(6,182,212,0.3)",
        borderRadius: 10,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(6,182,212,0.4)"
          }}>
            <Binary size={24} color="#070b12" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: "#f8fafc" }}>
                Intermittent & Partial-File Format Surgical Reconstructor
              </h1>
              <span style={{
                background: "rgba(6,182,212,0.18)",
                color: "#06b6d4",
                border: "1px solid rgba(6,182,212,0.4)",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 800,
                fontFamily: "monospace"
              }}>
                98.4% RESTORATION
              </span>
              <span style={{
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.35)",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "monospace"
              }}>
                ZERO-KEY RECONSTRUCTION
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 3 }}>
              Surgically rebuilds damaged format headers (DOCX ZIPs, SQL MDF/LDF, VMware VMDK, MP4/PDF) corrupted by modern intermittent ransomware (LockBit 3.0, BlackCat/ALPHV, Play) without requiring 50TB full backup restores.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => handleExecuteSurgicalRepair(selectedFile.id)}
            disabled={isRepairing}
            style={{
              background: isRepairing ? "rgba(245,158,11,0.2)" : "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
              border: isRepairing ? "1px solid #f59e0b" : "none",
              color: isRepairing ? "#f59e0b" : "#04100c",
              padding: "9px 18px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 800,
              cursor: isRepairing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 0 16px rgba(6,182,212,0.35)",
              transition: "all 0.2s ease"
            }}
          >
            {isRepairing ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>{isRepairing ? "RECONSTRUCTING STRUCTURE..." : "1-Click Surgical Repair"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>AVG RECONSTRUCTABILITY</span>
            <Sparkles size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>98.4%</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Intact tabular & stream data</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>RECOVERY SPEED</span>
            <Zap size={14} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#06b6d4", marginTop: 4 }}>3.8 Seconds</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>vs 18h full backup pull</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>INTERMITTENT FAMILIES</span>
            <ShieldCheck size={14} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b", marginTop: 4 }}>LockBit / ALPHV / Play</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Header & stride ciphers</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>SUPPORTED FORMATS</span>
            <Layers size={14} color="#a855f7" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#a855f7", marginTop: 4 }}>SQL / VMDK / DOCX / MP4</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>6 deep structure decoders</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>BACKUP BANDWIDTH SAVED</span>
            <HardDrive size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>54.2 TB</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Surgical in-place patching</div>
        </div>
      </div>

      {/* Main Grid: File Queue + Side-by-Side Block Differential Visualizer */}
      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 16, flex: 1 }}>
        {/* Left Column: Corrupted File Queue & Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Format Filter */}
          <div className="card-tactical" style={{ padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--fg)" }}>FORMAT FILTER</span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {(["ALL", "SQL_MDF", "VMDK", "DOCX", "XLSX", "MP4"] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setActiveFormatFilter(fmt)}
                    style={{
                      background: activeFormatFilter === fmt ? "rgba(6,182,212,0.2)" : "var(--surface-2)",
                      border: activeFormatFilter === fmt ? "1px solid #06b6d4" : "1px solid var(--border)",
                      color: activeFormatFilter === fmt ? "#06b6d4" : "var(--muted)",
                      padding: "2px 7px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {fmt.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File Queue */}
          <div className="card-tactical" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)" }}>INTERMITTENT CORRUPTED TARGETS</span>
              <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{filteredFiles.length} FILES</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 460px)", overflowY: "auto" }}>
              {filteredFiles.map(file => {
                const isSelected = file.id === selectedFileId;
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    style={{
                      background: isSelected ? "rgba(6,182,212,0.08)" : "var(--surface-2)",
                      border: isSelected ? "1px solid rgba(6,182,212,0.4)" : "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "10px 12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: isSelected ? "#06b6d4" : "#f8fafc" }}>
                        {file.path.split("\\").pop()}
                      </span>
                      <span className={`badge-sev ${file.status === "RECONSTRUCTED" ? "badge-success" : "badge-medium"}`}>
                        {file.status === "RECONSTRUCTED" ? "✅ REPAIRED" : `${file.reconstructabilityPct}% RECOVERABLE`}
                      </span>
                    </div>

                    <div style={{ fontSize: 10, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {file.ransomwareSignature}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10, background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: 4 }}>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Encrypted: </span>
                        <strong style={{ color: "#f43f5e", fontFamily: "monospace" }}>{(file.encryptedHeaderBytes / 1024).toFixed(0)} KB</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Intact Payload: </span>
                        <strong style={{ color: "#10b981", fontFamily: "monospace" }}>{(file.intactDataPayloadBytes / (1024 * 1024)).toFixed(1)} MB</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Repair Progress & Logs */}
          {repairLog.length > 0 && (
            <div className="card-tactical" style={{ padding: 12, background: "#050912", border: "1px solid rgba(6,182,212,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#06b6d4" }}>SURGICAL REPAIR PIPELINE</span>
                <span style={{ fontSize: 10, color: "#10b981", fontFamily: "monospace", fontWeight: 700 }}>{repairProgress}%</span>
              </div>
              <div style={{ width: "100%", height: 4, background: "var(--surface-3)", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: `${repairProgress}%`, height: "100%", background: "#06b6d4", transition: "width 0.3s ease" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, fontFamily: "monospace", fontSize: 10, color: "#cbd5e1" }}>
                {repairLog.map((log, idx) => (
                  <div key={idx} style={{ color: log.includes("SUCCESSFUL") ? "#10b981" : log.includes("Encrypted") ? "#f43f5e" : "#cbd5e1" }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Side-by-Side Block Differential Visualizer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* File Overview Card */}
          <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>
                    BLOCK DIFFERENTIAL MAP: {selectedFile.path.split("\\").pop()}
                  </span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: "rgba(6,182,212,0.15)",
                    color: "#06b6d4",
                    border: "1px solid rgba(6,182,212,0.3)",
                    fontFamily: "monospace"
                  }}>
                    FORMAT: {selectedFile.format}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Method: <strong style={{ color: "#10b981" }}>{selectedFile.reconstructionMethod}</strong>
                </div>
              </div>

              <button
                onClick={() => handleExecuteSurgicalRepair(selectedFile.id)}
                disabled={isRepairing}
                style={{
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.4)",
                  color: "#10b981",
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: isRepairing ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <RefreshCw size={13} />
                <span>Re-Synthesize Structure</span>
              </button>
            </div>

            {/* Visual Stride Map (Block Bar) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                <span>File Stride Differential (0x00000000 ➔ EOF):</span>
                <span>{(selectedFile.totalSizeBytes / (1024 * 1024)).toFixed(1)} MB Total</span>
              </div>

              <div style={{
                display: "flex",
                height: 28,
                borderRadius: 6,
                overflow: "hidden",
                border: "1px solid var(--border)",
                background: "#040711"
              }}>
                <div style={{ width: "8%", background: "#f43f5e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 800, color: "#fff" }} title="Encrypted Header (1MB)">
                  ENC 1MB
                </div>
                <div style={{ width: "4%", background: "#06b6d4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 800, color: "#070b12" }} title="Surgically Injected Header">
                  PATCH
                </div>
                <div style={{ width: "88%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#04100c" }} title="Intact Data Payload (99MB)">
                  INTACT DATA PAYLOAD (98.9% OF FILE) — ACCESSIBLE WITHOUT MASTER KEY
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 10.5, color: "var(--muted)", paddingTop: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#f43f5e" }} />
                  <span>Damaged / Intermittent Ciphertext</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#06b6d4" }} />
                  <span>Aegis Surgically Synthesized Header</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#10b981" }} />
                  <span>Original Unencrypted Data Payload</span>
                </span>
              </div>
            </div>

            {/* Block Segment Breakdown Table */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--fg)" }}>DETAILED EXTENT & BLOCK ANALYSIS</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {segments.map((seg, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "140px 80px 180px 1fr",
                      gap: 12,
                      padding: "8px 12px",
                      background: "var(--surface-2)",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      fontSize: 11,
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontFamily: "monospace", color: "#06b6d4" }}>
                      {seg.startOffsetHex}..
                    </span>
                    <span style={{ fontFamily: "monospace", color: "var(--fg-2)" }}>{seg.sizeKB} KB</span>
                    <span className={`badge-sev ${seg.state === "ENCRYPTED_HEADER" ? "badge-critical" : seg.state === "SURGICALLY_REPAIRED" || seg.state === "RECONSTRUCTED_XML" ? "badge-medium" : "badge-success"}`}>
                      {seg.state.replace(/_/g, " ")}
                    </span>
                    <span style={{ color: "var(--fg-2)" }}>{seg.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restored Data Preview */}
            <div style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 6,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#10b981" }}>
                <CheckCircle2 size={14} />
                <span>SURGICALLY RECOVERED DATA PREVIEW</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5, margin: 0 }}>
                {selectedFile.restoredDataPreview}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
