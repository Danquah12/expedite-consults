"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Key,
  Binary,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Lock,
  Unlock,
  Terminal,
  RefreshCw,
  Search,
  Sliders,
  Flame,
  ArrowRight,
  Database,
  Layers,
  HelpCircle,
  TrendingUp,
  Download
} from "lucide-react";
import { MOCK_CASES, MOCK_FILE_PATTERNS } from "@/data/recoveryData";

interface CryptoFlaw {
  id: string;
  name: string;
  category: "PRNG_ENTROPY" | "IV_REUSE" | "IMPLEMENTATION_BUG" | "ASYMMETRIC_ENCAPSULATION" | "PADDING_ORACLE";
  severity: "CRITICAL_EXPLOITABLE" | "HIGH_PARTIAL" | "THEORETICAL" | "SECURE_UNEXPLOITABLE";
  ransomwareFamily: string;
  cipherUsed: string;
  description: string;
  exploitMechanism: string;
  recoveryFeasibilityPct: number;
  knownTool: string;
  mitigationOrBypass: string;
}

const MOCK_CRYPTO_FLAWS: CryptoFlaw[] = [
  {
    id: "flaw-001",
    name: "WannaCry / Wanakiwi Ephemeral Prime Persistence",
    category: "IMPLEMENTATION_BUG",
    severity: "CRITICAL_EXPLOITABLE",
    ransomwareFamily: "WannaCry 2.0",
    cipherUsed: "RSA-2048 + AES-128-CBC",
    description: "Windows CryptReleaseContext fails to zero out memory pages containing prime factors p and q from heap before freeing.",
    exploitMechanism: "Heap carving scans unallocated memory of wcry.exe or lsass.exe to extract prime numbers and recompute private exponent d.",
    recoveryFeasibilityPct: 94.5,
    knownTool: "Wanakiwi / Aegis Memory Carver",
    mitigationOrBypass: "Must capture RAM before rebooting infected endpoints; 100% lossless decryption if heap intact."
  },
  {
    id: "flaw-002",
    name: "ALPHV / BlackCat Intermittent AES-CTR Padding Leak",
    category: "IMPLEMENTATION_BUG",
    severity: "HIGH_PARTIAL",
    ransomwareFamily: "BlackCat (ALPHV)",
    cipherUsed: "AES-256-CTR / ChaCha20",
    description: "Intermittent encryption skips alternating 10MB blocks to maximize speed, leaving database and VMDK metadata tables intact in unencrypted segments.",
    exploitMechanism: "Partial file reconstruction parses untouched B-tree headers, transactional WALs, and SQL page maps to restore data tables without the key.",
    recoveryFeasibilityPct: 68.0,
    knownTool: "Aegis Intermittent CarveEngine",
    mitigationOrBypass: "Header carving can restore up to 80% of tabular records even with zero key recovery."
  },
  {
    id: "flaw-003",
    name: "Phobos / Dharma Static Salt & Key Derivation Weakness",
    category: "PRNG_ENTROPY",
    severity: "HIGH_PARTIAL",
    ransomwareFamily: "Phobos",
    cipherUsed: "AES-CBC + Static Salt",
    description: "Key derivation uses 32-bit timestamp seeds from GetTickCount() combined with machine GUID, reducing brute-force entropy search space from 2^256 to 2^32.",
    exploitMechanism: "Time-bounded GPU cluster keyspace reduction tests ~4.2 billion candidates in under 3 hours per target file.",
    recoveryFeasibilityPct: 82.0,
    knownTool: "Hashcat OpenCL + Aegis Cluster",
    mitigationOrBypass: "Requires precise host event log timestamp to calibrate the seed offset window."
  },
  {
    id: "flaw-004",
    name: "LockBit 3.0 Curve25519 Ephemeral Key Encapsulation",
    category: "ASYMMETRIC_ENCAPSULATION",
    severity: "SECURE_UNEXPLOITABLE",
    ransomwareFamily: "LockBit 3.0 (Black)",
    cipherUsed: "ChaCha20 + Curve25519 (X25519)",
    description: "Generates unique 32-byte ephemeral X25519 keypair per file, encrypts file with ChaCha20, and encapsulates session key using threat actor public key.",
    exploitMechanism: "Cryptographically sound implementation. No mathematical shortcut known against Curve25519 without private master key.",
    recoveryFeasibilityPct: 5.0,
    knownTool: "Aegis DecryptIQ (Backup-driven)",
    mitigationOrBypass: "Recovery must rely exclusively on immutable backup restoration or memory key carving before process termination."
  },
  {
    id: "flaw-005",
    name: "Babuk Builder Source Leak Public Master Key Recovery",
    category: "ASYMMETRIC_ENCAPSULATION",
    severity: "CRITICAL_EXPLOITABLE",
    ransomwareFamily: "Babuk / Babuk ESXi",
    cipherUsed: "ECDH (Curve25519) + Sosemanuk",
    description: "Leaked full builder source code included multiple threat actor private master keys and faulty ECDH point multiplication routines in Linux/ESXi variants.",
    exploitMechanism: "Universal decryptor matches target file footer marker with cataloged master private key derived from builder leak.",
    recoveryFeasibilityPct: 91.0,
    knownTool: "Avast Babuk Decryptor / Aegis Hub",
    mitigationOrBypass: "Direct decryption available for 14 out of 16 known Babuk affiliate campaigns."
  }
];

export default function CryptoAnalysisPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [selectedFamily, setSelectedFamily] = useState("ALL");
  const [selectedFlaw, setSelectedFlaw] = useState<CryptoFlaw>(MOCK_CRYPTO_FLAWS[0]);
  const [analyzingSample, setAnalyzingSample] = useState(false);
  const [sampleHexView, setSampleHexView] = useState<"HEADER" | "BODY" | "FOOTER">("HEADER");
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulatingExploit, setIsSimulatingExploit] = useState(false);

  const activeCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  const filteredFlaws = selectedFamily === "ALL"
    ? MOCK_CRYPTO_FLAWS
    : MOCK_CRYPTO_FLAWS.filter(f => f.ransomwareFamily.toLowerCase().includes(selectedFamily.toLowerCase()));

  const runSampleAnalysis = () => {
    setAnalyzingSample(true);
    setSimulationLogs(["[+] Initializing Aegis Cryptanalysis Engine v4.8..."]);
    
    setTimeout(() => {
      setSimulationLogs(prev => [
        ...prev,
        `[+] Parsing file header markers for: ${activeCase.ransomwareFamily}...`,
        "[+] Calculating Shannon Entropy across 4KB sliding block window: 7.988 / 8.000 (Ciphertext Confirmed)",
        "[+] Analyzing PRNG entropy source: CryptGenRandom [PASSED - 256-bit CSPRNG]",
        "[+] Testing IV / Nonce uniqueness across 500 samples: 0 duplicate nonces detected",
        `[+] Evaluating Asymmetric Key Encapsulation: Curve25519 (ECDH) encapsulated with Threat Actor Public Key`,
        `[*] Cryptographic Feasibility Score: ${selectedFlaw.recoveryFeasibilityPct}% for current attack vector.`
      ]);
      setAnalyzingSample(false);
    }, 1200);
  };

  const simulateExploitCarve = () => {
    setIsSimulatingExploit(true);
    setSimulationLogs([`[!] Initiating exploit sequence for: ${selectedFlaw.name}...`]);

    const steps = [
      `[1/4] Probing memory pages for ${selectedFlaw.cipherUsed} state vectors...`,
      `[2/4] Executing ${selectedFlaw.exploitMechanism.slice(0, 70)}...`,
      `[3/4] Validating extracted candidate keys against file canary header...`,
      `[4/4] EXPLOIT COMPLETE: Feasibility confirmed at ${selectedFlaw.recoveryFeasibilityPct}%.`
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSimulationLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) setIsSimulatingExploit(false);
      }, (idx + 1) * 700);
    });
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
              <Key size={18} color="#10b981" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              Cryptographic & Encryption Implementation Analyzer
            </h1>
            <span className="badge-sev badge-success">Pillar 2: Analyze & Preserve</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Reverse-engineer ransomware cryptographic implementations: audit PRNG entropy weaknesses, detect IV/nonce reuse,
            evaluate asymmetric key encapsulation (RSA/Curve25519), and score algorithmic recovery feasibility.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={runSampleAnalysis}
            disabled={analyzingSample}
            className="btn-primary"
            style={{
              padding: "10px 18px",
              cursor: analyzingSample ? "wait" : "pointer"
            }}
          >
            <RefreshCw size={15} className={analyzingSample ? "animate-spin" : ""} />
            {analyzingSample ? "Running Cryptanalysis..." : "Run Cryptanalysis"}
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Target Ransomware Cipher
            </span>
            <Lock size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>
            ChaCha20 + X25519
          </div>
          <div style={{ fontSize: 11, color: "#10b981", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <span>Active Target: {activeCase.ransomwareFamily}</span>
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Shannon Entropy
            </span>
            <Activity size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#06b6d4" }}>
            7.988 / 8.000
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            High Uniformity (Block Cipher Active)
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Algorithmic Feasibility
            </span>
            <TrendingUp size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b" }}>
            {selectedFlaw.recoveryFeasibilityPct}%
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Strategy: {selectedFlaw.recoveryFeasibilityPct > 60 ? "Exploit Feasible" : "Backup Priority"}
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Vulnerabilities Cataloged
            </span>
            <Flame size={15} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f43f5e" }}>
            {MOCK_CRYPTO_FLAWS.length} Known Flaws
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            2 Critical Flaws with 90%+ Recovery
          </div>
        </div>
      </div>

      {/* Main Grid: Cryptographic Flaw Catalog & Live Deep Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>
        {/* Left Column: Flaw Detection Matrix */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldAlert size={16} color="#06b6d4" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
                Cryptographic Flaw & Implementation Vulnerability Matrix
              </h3>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Filter Family:</span>
              <select
                className="tool-select"
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                <option value="ALL">All Families</option>
                <option value="LockBit">LockBit 3.0</option>
                <option value="BlackCat">BlackCat / ALPHV</option>
                <option value="Phobos">Phobos</option>
                <option value="WannaCry">WannaCry 2.0</option>
                <option value="Babuk">Babuk</option>
              </select>
            </div>
          </div>

          {/* Flaw List Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredFlaws.map((flaw) => {
              const isSelected = selectedFlaw.id === flaw.id;
              const isCritical = flaw.severity === "CRITICAL_EXPLOITABLE";
              const isHigh = flaw.severity === "HIGH_PARTIAL";
              const isSecure = flaw.severity === "SECURE_UNEXPLOITABLE";

              return (
                <div
                  key={flaw.id}
                  onClick={() => setSelectedFlaw(flaw)}
                  style={{
                    background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
                          {flaw.name}
                        </span>
                        <span className={`badge-sev ${
                          isCritical ? "badge-critical" : isHigh ? "badge-high" : isSecure ? "badge-low" : "badge-medium"
                        }`}>
                          {flaw.category.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        Family: <strong style={{ color: "var(--fg-2)" }}>{flaw.ransomwareFamily}</strong> · Cipher: <code style={{ color: "#06b6d4" }}>{flaw.cipherUsed}</code>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: flaw.recoveryFeasibilityPct > 70 ? "#10b981" : flaw.recoveryFeasibilityPct > 30 ? "#f59e0b" : "#f43f5e" }}>
                        {flaw.recoveryFeasibilityPct}%
                      </div>
                      <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase" }}>
                        Recovery Feasibility
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.4, margin: 0 }}>
                    {flaw.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, fontSize: 10.5, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "var(--muted)" }}>
                      Tool: <strong style={{ color: "#10b981" }}>{flaw.knownTool}</strong>
                    </span>
                    <span style={{ color: "#06b6d4", display: "flex", alignItems: "center", gap: 4 }}>
                      Inspect Exploit Details <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Inspector & Entropy Workbench */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Detailed Selected Flaw Inspector */}
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Cpu size={16} color="#10b981" />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#f8fafc" }}>
                  Selected Flaw Exploit Deep Dive
                </h3>
              </div>
              <span className="badge-sev badge-success">
                {selectedFlaw.ransomwareFamily}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Exploitation Mechanism
                </span>
                <div style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  fontSize: 12,
                  color: "#cbd5e1",
                  lineHeight: 1.45,
                  marginTop: 4
                }}>
                  {selectedFlaw.exploitMechanism}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Operational Constraint & Prerequisite
                </span>
                <div style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  fontSize: 12,
                  color: "#f59e0b",
                  lineHeight: 1.45,
                  marginTop: 4
                }}>
                  {selectedFlaw.mitigationOrBypass}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={simulateExploitCarve}
                  disabled={isSimulatingExploit}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <Zap size={14} className={isSimulatingExploit ? "animate-spin" : ""} />
                  {isSimulatingExploit ? "Executing Exploit Simulation..." : "Simulate Exploit & Key Carving"}
                </button>
              </div>
            </div>
          </div>

          {/* Live Shannon Entropy & Hex Stream Inspector */}
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Binary size={16} color="#06b6d4" />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#f8fafc" }}>
                  Encrypted Sample Byte Density & Entropy
                </h3>
              </div>

              <div style={{ display: "flex", gap: 4 }}>
                {(["HEADER", "BODY", "FOOTER"] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setSampleHexView(view)}
                    style={{
                      background: sampleHexView === view ? "var(--primary)" : "var(--surface-2)",
                      color: sampleHexView === view ? "#070b12" : "var(--muted)",
                      border: "1px solid var(--border)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Byte Entropy Density Meter */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: "var(--muted)" }}>Shannon Entropy Visual Density:</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>
                  {sampleHexView === "HEADER" ? "7.988 / 8.000 (Random/Encrypted)" : sampleHexView === "BODY" ? "4.120 / 8.000 (Sparse/Intermittent)" : "6.850 / 8.000 (Structured Meta)"}
                </span>
              </div>
              <div style={{ width: "100%", height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden", display: "flex" }}>
                <div style={{
                  width: sampleHexView === "HEADER" ? "99.8%" : sampleHexView === "BODY" ? "51.5%" : "85.6%",
                  background: sampleHexView === "HEADER" ? "linear-gradient(90deg, #10b981, #f43f5e)" : "#06b6d4",
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>

            {/* Hex Dump Window */}
            <div style={{
              background: "#050811",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "10px 12px",
              fontFamily: "monospace",
              fontSize: 11,
              color: "#94a3b8",
              lineHeight: 1.5,
              overflowX: "auto"
            }}>
              {sampleHexView === "HEADER" && (
                <>
                  <div style={{ color: "#f43f5e" }}>00000000: 4c 4f 43 4b 42 49 54 5f  4d 45 54 41 5f 56 33 00  [LOCKBIT_META_V3.]</div>
                  <div style={{ color: "#10b981" }}>00000010: a4 92 f8 e1 c9 40 8b 11  3d e4 a0 99 ff 10 32 b1  [....@..=.....2.]</div>
                  <div style={{ color: "#cbd5e1" }}>00000020: 89 31 b4 c2 77 12 ea 49  10 9a cd ee 04 55 ba 82  [.1..w..I.....U..]</div>
                  <div style={{ color: "#cbd5e1" }}>00000030: fe dc ba 98 76 54 32 10  01 23 45 67 89 ab cd ef  [....vT2..#Eg....]</div>
                </>
              )}
              {sampleHexView === "BODY" && (
                <>
                  <div style={{ color: "#06b6d4" }}>00001000: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  [................]</div>
                  <div style={{ color: "#cbd5e1" }}>00001010: 4d 53 53 51 4c 50 61 67  65 48 64 72 00 00 01 00  [MSSQLPageHdr....]</div>
                  <div style={{ color: "#cbd5e1" }}>00001020: 50 61 74 69 65 6e 74 49  64 00 00 00 4e 61 6d 65  [PatientId...Name]</div>
                  <div style={{ color: "#06b6d4" }}>00001030: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  [................]</div>
                </>
              )}
              {sampleHexView === "FOOTER" && (
                <>
                  <div style={{ color: "#a855f7" }}>0007ff00: 58 32 35 35 31 39 5f 50  55 42 4b 45 59 5f 53 45  [X25519_PUBKEY_SE]</div>
                  <div style={{ color: "#cbd5e1" }}>0007ff10: 1f 92 88 a1 c0 34 b8 22  4d e4 a0 88 ff 10 99 a2  [.....4."M.......]</div>
                  <div style={{ color: "#f59e0b" }}>0007ff20: 43 41 4e 41 52 59 5f 45  4e 44 5f 53 45 41 4c 21  [CANARY_END_SEAL!]</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Telemetry / Execution Output Log */}
      <div className="card-tactical" style={{ padding: 18, background: "#050811" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Terminal size={15} color="#10b981" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc", fontFamily: "monospace" }}>
              AEGIS CRYPTO-ENGINE TELEMETRY CONSOLE
            </span>
          </div>
          <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
            CSPRNG_SEED_STATUS: OK | ASYMMETRIC_ORACLE: STANDBY
          </span>
        </div>

        <div style={{
          fontFamily: "monospace",
          fontSize: 11.5,
          color: "#10b981",
          lineHeight: 1.6,
          maxHeight: 140,
          overflowY: "auto"
        }}>
          {simulationLogs.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>
              &gt; Ready. Click &quot;Run Cryptanalysis&quot; or &quot;Simulate Exploit & Key Carving&quot; to begin reverse-engineering session.
            </div>
          ) : (
            simulationLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
