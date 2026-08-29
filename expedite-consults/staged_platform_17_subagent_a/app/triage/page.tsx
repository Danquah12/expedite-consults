"use client";

import { useState } from "react";
import {
  Scan,
  UploadCloud,
  FileCheck,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Binary,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Database,
  Lock,
  Layers,
  FileText
} from "lucide-react";

export default function AutomatedTriage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("lockbit");
  const [analysisResult, setAnalysisResult] = useState<any>({
    family: "LockBit 3.0 (Black)",
    confidence: 97.4,
    cipher: "ChaCha20 + Curve25519 (Hybrid Public-Key)",
    entropy: 7.988,
    exfiltration: "CONFIRMED (1.8 TB Egress to Mega.nz)",
    recoveryPath: "BACKUP_ONLY (Immutable S3 Snapshot)",
    headerDamage: "512 bytes overwritten at offset 0x00",
    canaryMarker: "LOCKBIT_META_V3_TAG",
    matchedYara: "RULE_RANSOM_LOCKBIT_V3_BUILDER_SIG",
    fileSuffix: ".lockbit"
  });

  const samplePresets = [
    {
      id: "lockbit",
      name: "Patient_Records.mdf.lockbit + Restore-My-Files.txt",
      family: "LockBit 3.0 (Black)",
      confidence: 97.4,
      cipher: "ChaCha20 + Curve25519 (Hybrid)",
      entropy: 7.988,
      exfiltration: "CONFIRMED (1.8 TB Egress to Mega.nz)",
      recoveryPath: "BACKUP_ONLY (Immutable S3 Snapshot)",
      headerDamage: "512 bytes overwritten at offset 0x00",
      canaryMarker: "LOCKBIT_META_V3_TAG",
      matchedYara: "RULE_RANSOM_LOCKBIT_V3_BUILDER_SIG",
      fileSuffix: ".lockbit"
    },
    {
      id: "blackcat",
      name: "Swift_Transactions.dat.crypted + alphv_readme.txt",
      family: "BlackCat / ALPHV (Rust)",
      confidence: 94.8,
      cipher: "AES-256-CTR (Intermittent 10MB Stripe)",
      entropy: 7.912,
      exfiltration: "CONFIRMED (AWS S3 Bucket Dump)",
      recoveryPath: "FEASIBLE_WITH_EFFORT (Partial Header Carve)",
      headerDamage: "1024 bytes intermittent header block",
      canaryMarker: "ALPHV_FOOTER_0x89",
      matchedYara: "RULE_RANSOM_ALPHV_RUST_CORE",
      fileSuffix: ".crypted"
    },
    {
      id: "wannacry",
      name: "Scada_Controller.bin.wnry + @Please_Read_Me@.txt",
      family: "WannaCry 2.0 (MS17-010)",
      confidence: 99.1,
      cipher: "AES-128-CBC + RSA-2048",
      entropy: 7.995,
      exfiltration: "LOW (Worm Spreader Only)",
      recoveryPath: "AVAILABLE (Wanakiwi In-Memory Key Extract)",
      headerDamage: "WANACRY! magic signature prepended",
      canaryMarker: "WANACRY!_MAGIC_HEADER",
      matchedYara: "RULE_WANNACRY_ETERNALBLUE_WORM",
      fileSuffix: ".wnry"
    }
  ];

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    setIsAnalyzing(true);
    setTimeout(() => {
      const found = samplePresets.find((p) => p.id === presetId);
      if (found) setAnalysisResult(found);
      setIsAnalyzing(false);
    }, 600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult(samplePresets[0]);
    }, 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#10b981", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              PILLAR 1: RAPID FORENSIC TRIAGE
            </span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 700 }}>
              1-CLICK AI ARTIFACT PARSER
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
            Automated Ransomware Incident Triage & AI Verdict
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Quick Sample Feeds:</span>
          {samplePresets.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                background: selectedPreset === p.id ? "rgba(16,185,129,0.2)" : "var(--surface-2)",
                color: selectedPreset === p.id ? "#10b981" : "var(--muted)",
                border: selectedPreset === p.id ? "1px solid #10b981" : "1px solid var(--border)"
              }}
            >
              {p.family.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* DRAG AND DROP INTAKE ZONE */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: isDragging ? "2px dashed #10b981" : "2px dashed var(--border)",
          background: isDragging ? "rgba(16,185,129,0.08)" : "var(--surface)",
          borderRadius: 10,
          padding: "32px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          transition: "all 0.15s ease",
          cursor: "pointer"
        }}
        onClick={() => handleSelectPreset("lockbit")}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 12,
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {isAnalyzing ? (
            <RefreshCw size={26} color="#10b981" className="animate-spin" />
          ) : (
            <UploadCloud size={26} color="#10b981" />
          )}
        </div>

        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
            {isAnalyzing ? "Executing Forensic Heuristic Pipeline..." : "Drop Ransom Note, Encrypted File Sample, or RAM Dump Here"}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
            Accepts <code style={{ color: "#06b6d4" }}>.txt</code>, <code style={{ color: "#06b6d4" }}>.lockbit</code>, <code style={{ color: "#06b6d4" }}>.crypted</code>, <code style={{ color: "#06b6d4" }}>.dmp</code>, <code style={{ color: "#06b6d4" }}>.raw</code>, <code style={{ color: "#06b6d4" }}>.pcap</code> (Processed entirely in local memory)
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "var(--surface-2)", borderRadius: 4, color: "var(--muted)", border: "1px solid var(--border)" }}>
            ⚡ Instant Magic Byte Analysis
          </span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "var(--surface-2)", borderRadius: 4, color: "var(--muted)", border: "1px solid var(--border)" }}>
            🔍 Shannon Entropy &lt; 8.00
          </span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "var(--surface-2)", borderRadius: 4, color: "var(--muted)", border: "1px solid var(--border)" }}>
            🛡️ YARA Family Fingerprint
          </span>
        </div>
      </div>

      {/* AI ASSESSMENT VERDICT DASHBOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Left: AI Assessment Verdict Card */}
        <div className="card-tactical" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={18} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#f8fafc" }}>
                  TRIAGE VERDICT: {analysisResult.family}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  Attribution Confidence: <strong style={{ color: "#10b981" }}>{analysisResult.confidence}%</strong>
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "4px 8px",
                borderRadius: 4,
                fontFamily: "monospace",
                background: "rgba(244,63,94,0.15)",
                color: "#f43f5e",
                border: "1px solid rgba(244,63,94,0.3)"
              }}
            >
              CRITICAL SEVERITY
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Encryption Cipher</span>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#f8fafc", marginTop: 4 }}>{analysisResult.cipher}</div>
            </div>

            <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Shannon Entropy</span>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#06b6d4", fontFamily: "monospace", marginTop: 4 }}>
                {analysisResult.entropy} / 8.00 (High Randomness)
              </div>
            </div>

            <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Exfiltration Likelihood</span>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#f43f5e", marginTop: 4 }}>{analysisResult.exfiltration}</div>
            </div>

            <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Primary Recovery Path</span>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#10b981", marginTop: 4 }}>{analysisResult.recoveryPath}</div>
            </div>
          </div>

          <div style={{ padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f8fafc" }}>Forensic Indicators Found:</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
              <div>• Appended Extension: <strong style={{ color: "#10b981", fontFamily: "monospace" }}>{analysisResult.fileSuffix}</strong></div>
              <div>• Header Damage: <span style={{ color: "#f59e0b" }}>{analysisResult.headerDamage}</span></div>
              <div>• Canary Footer Marker: <span style={{ color: "#06b6d4", fontFamily: "monospace" }}>{analysisResult.canaryMarker}</span></div>
              <div>• Matched YARA Rule: <span style={{ color: "#a855f7", fontFamily: "monospace" }}>{analysisResult.matchedYara}</span></div>
            </div>
          </div>
        </div>

        {/* Right: Recommended Autonomous Response */}
        <div className="card-tactical" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            RECOMMENDED AUTONOMOUS IR PLAYBOOK
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>1. Lock Vlans & Inhibit Egress</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Sever lateral SMB (445) and RDP (3389) immediately</div>
              </div>
              <span style={{ fontSize: 9.5, padding: "2px 6px", background: "rgba(16,185,129,0.2)", color: "#10b981", fontWeight: 800, borderRadius: 3 }}>
                APPLIED
              </span>
            </div>

            <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>2. Verify Immutable Snapshot #20260823</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Verify AWS S3 Compliance Vault WORM lock</div>
              </div>
              <span style={{ fontSize: 9.5, padding: "2px 6px", background: "rgba(16,185,129,0.2)", color: "#10b981", fontWeight: 800, borderRadius: 3 }}>
                VERIFIED
              </span>
            </div>

            <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>3. Stage Tier-0 Domain Controller DC01</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Reconstruct AD database in isolated Sandbox Enclave</div>
              </div>
              <span style={{ fontSize: 9.5, padding: "2px 6px", background: "rgba(6,182,212,0.2)", color: "#06b6d4", fontWeight: 800, borderRadius: 3 }}>
                IN RESTORE
              </span>
            </div>
          </div>

          <button
            onClick={() => alert("Forwarded Triage Verdict to Recovery Orchestrator.")}
            className="btn-primary"
            style={{ marginTop: 8, justifyContent: "center" }}
          >
            <span>Promote Triage Case to Active Recovery Orchestration</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
