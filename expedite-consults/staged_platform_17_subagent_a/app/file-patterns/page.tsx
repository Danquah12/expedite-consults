"use client";

import { useState } from "react";
import {
  Binary,
  Layers,
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Cpu,
  FileCode,
  Gauge,
  Sliders,
  CheckCircle2,
  Lock,
  Unlock,
  Key
} from "lucide-react";
import { MOCK_FILE_PATTERNS } from "@/data/recoveryData";
import { EncryptedFilePattern } from "@/types/recovery";

export default function FilePatternsAnalyzer() {
  const [selectedPatternId, setSelectedPatternId] = useState<string>("pat-001");
  const [activeOffset, setActiveOffset] = useState<number>(0);
  const [zoomMode, setZoomMode] = useState<"HEX" | "ENTROPY" | "RECOVERY">("HEX");

  const patterns: EncryptedFilePattern[] = [
    MOCK_FILE_PATTERNS[0],
    MOCK_FILE_PATTERNS[1],
    {
      id: "pat-003",
      sampleName: "SCADA_Telemetry_Archive.bin.wnry",
      extensionAppended: ".wnry",
      originalExtension: ".bin",
      headerDamageBytes: 128,
      encryptionMode: "FULL",
      cipherAlgorithm: "AES-128-CBC + RSA-2048",
      keySizeBits: 128,
      ivLengthBytes: 16,
      entropyScore: 7.995,
      footerMetadataPresent: false,
      canaryMarker: "WANACRY!_HEADER_0x00"
    }
  ];

  const currentPattern = patterns.find((p) => p.id === selectedPatternId) || patterns[0];

  // Plaintext vs Encrypted Mock Hex Lines
  const hexLines = [
    { offset: "0x00000000", plainHex: "4D 53 53 51 4C 5F 44 42  30 31 00 00 04 00 00 00", cryptHex: "9A 4F C2 81 33 B8 19 0E  77 F1 AA 20 49 BD 8C 11", status: "ENCRYPTED_HEADER" },
    { offset: "0x00000010", plainHex: "00 10 00 00 00 20 00 00  40 00 00 00 80 00 00 00", cryptHex: "14 E8 7B C9 03 FA 44 91  22 66 CD 10 99 FE 31 0A", status: "ENCRYPTED_HEADER" },
    { offset: "0x00000020", plainHex: "50 61 74 69 65 6E 74 53  63 68 65 6D 61 5F 76 33", cryptHex: "88 C1 04 99 DA 30 1F 7C  A1 B2 C3 04 55 99 82 FC", status: "ENCRYPTED_HEADER" },
    { offset: "0x00000030", plainHex: "00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00", cryptHex: "EE 34 11 90 AB CD EF 01  23 45 67 89 0A BC DE F0", status: "ENCRYPTED_HEADER" },
    { offset: "0x00000200", plainHex: "54 41 42 4C 45 5F 53 50  41 43 45 5F 44 41 54 41", cryptHex: "54 41 42 4C 45 5F 53 53  41 43 45 5F 44 41 54 41", status: "PLAINTEXT_INTACT" },
    { offset: "0x00000210", plainHex: "30 30 30 31 2E 64 61 74  00 00 00 00 00 00 00 00", cryptHex: "30 30 30 31 2E 64 61 74  00 00 00 00 00 00 00 00", status: "PLAINTEXT_INTACT" }
  ];

  // Entropy blocks across 64 sectors
  const entropyBlocks = Array.from({ length: 64 }, (_, i) => {
    if (currentPattern.encryptionMode === "INTERMITTENT") {
      // Intermittent pattern: high entropy every 4th block
      const isEncrypted = i % 4 === 0 || i < 4;
      return {
        block: i,
        entropy: isEncrypted ? (7.9 + Math.random() * 0.08).toFixed(3) : (3.5 + Math.random() * 1.8).toFixed(3),
        isEncrypted
      };
    } else {
      // Full encryption
      return {
        block: i,
        entropy: (7.92 + Math.random() * 0.07).toFixed(3),
        isEncrypted: true
      };
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#06b6d4", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              PILLAR 1: CRYPTOGRAPHIC HEADER CARVER
            </span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(6,182,212,0.15)", color: "#06b6d4", fontWeight: 700 }}>
              BYTE OFFSET & ENTROPY PROFILER
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
            Encrypted File Pattern & Header Damage Analyzer
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Select Sample:</span>
          {patterns.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPatternId(p.id)}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                background: selectedPatternId === p.id ? "rgba(6,182,212,0.2)" : "var(--surface-2)",
                color: selectedPatternId === p.id ? "#06b6d4" : "var(--muted)",
                border: selectedPatternId === p.id ? "1px solid #06b6d4" : "1px solid var(--border)"
              }}
            >
              {p.extensionAppended}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC CHIPS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Header Damage Size
            </span>
            <Binary size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#f59e0b", marginTop: 8, fontFamily: "monospace" }}>
            {currentPattern.headerDamageBytes} Bytes
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
            Overwritten from offset 0x00
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Encryption Mode
            </span>
            <Lock size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#06b6d4", marginTop: 8 }}>
            {currentPattern.encryptionMode}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
            Cipher: {currentPattern.cipherAlgorithm}
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Shannon Entropy
            </span>
            <Gauge size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981", marginTop: 8, fontFamily: "monospace" }}>
            {currentPattern.entropyScore} / 8.00
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            High-entropy cipher randomness
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Canary Footer Marker
            </span>
            <Key size={15} color="#a855f7" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#a855f7", marginTop: 8, fontFamily: "monospace" }}>
            {currentPattern.canaryMarker}
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            {currentPattern.footerMetadataPresent ? "✓ RSA Metadata Sealed" : "✗ No Footer Metadata"}
          </div>
        </div>
      </div>

      {/* SHANNON ENTROPY HEATMAP */}
      <div className="card-tactical" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
              SHANNON ENTROPY HEATMAP (64-BLOCK SECTOR PROFILE)
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Differentiates encrypted blocks (&gt; 7.80, red) from unencrypted structured plaintext (&lt; 6.00, green/cyan)
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
            <span style={{ padding: "2px 6px", background: "rgba(244,63,94,0.2)", color: "#f43f5e", borderRadius: 3, fontWeight: 700 }}>■ Encrypted (&gt;7.8)</span>
            <span style={{ padding: "2px 6px", background: "rgba(16,185,129,0.2)", color: "#10b981", borderRadius: 3, fontWeight: 700 }}>■ Plaintext Body (&lt;6.0)</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(16, 1fr)", gap: 6 }}>
          {entropyBlocks.map((blk) => (
            <div
              key={blk.block}
              title={`Block #${blk.block}: Entropy ${blk.entropy}`}
              style={{
                height: 28,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 800,
                fontFamily: "monospace",
                background: blk.isEncrypted ? "rgba(244,63,94,0.3)" : "rgba(16,185,129,0.25)",
                color: blk.isEncrypted ? "#fecdd3" : "#a7f3d0",
                border: blk.isEncrypted ? "1px solid rgba(244,63,94,0.5)" : "1px solid rgba(16,185,129,0.4)",
                cursor: "pointer"
              }}
            >
              {blk.entropy}
            </div>
          ))}
        </div>
      </div>

      {/* HEX DUMP COMPARISON: PLAINTEXT VS ENCRYPTED */}
      <div className="card-tactical" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
              HEADER BYTE OVERWRITE INSPECTION ({currentPattern.sampleName})
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Side-by-side diff comparing known clean header template against encrypted artifact
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4" }}>
            MODIFIED EXTENSION: {currentPattern.extensionAppended}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ fontFamily: "monospace" }}>
            <thead>
              <tr>
                <th>Offset</th>
                <th>Clean Plaintext Template</th>
                <th>Encrypted Artifact Bytes</th>
                <th>Damage Assessment</th>
              </tr>
            </thead>
            <tbody>
              {hexLines.map((line, idx) => (
                <tr key={idx}>
                  <td style={{ color: "#06b6d4", fontWeight: 700 }}>{line.offset}</td>
                  <td style={{ color: "#10b981", letterSpacing: "0.05em" }}>{line.plainHex}</td>
                  <td style={{ color: line.status === "ENCRYPTED_HEADER" ? "#f43f5e" : "#10b981", letterSpacing: "0.05em", fontWeight: 700 }}>
                    {line.cryptHex}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: line.status === "ENCRYPTED_HEADER" ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)",
                        color: line.status === "ENCRYPTED_HEADER" ? "#f43f5e" : "#10b981"
                      }}
                    >
                      {line.status === "ENCRYPTED_HEADER" ? "OVERWRITTEN / ENCRYPTED" : "INTACT DATA PAGE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
