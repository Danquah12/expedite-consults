"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Key,
  Cpu,
  Binary,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Terminal,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  Copy,
  Radio,
  Play,
  Server,
  ShieldCheck
} from "lucide-react";
import { CerberusCryptanalyticFinding } from "@/types/recovery";

const INITIAL_CERBERUS_FLAWS: CerberusCryptanalyticFinding[] = [
  {
    id: "flaw-01",
    variantName: "SikoMode 2.0 (Mersenne Twister Seed Flaw)",
    flawType: "PRNG_MERSENNE_TWISTER_SEED",
    discoveredInCerberusPlatform: "CERBERUS-RE (Platform 16) · Ghidra Symbol Analyzer",
    confidencePct: 99.8,
    technicalProof: "PRNG seeded with 32-bit time(NULL) timestamp offset at process entry (0x00401820). 624 32-bit outputs untampered allow instant state reconstruction in 2^16 operations.",
    decompiledFunctionSnippet: `// Discovered in Ghidra RE Decompiler (Platform 16)
void init_cipher_prng() {
    time_t raw_time = time(NULL); // Flaw: 32-bit deterministic seed
    mt_seed(raw_time ^ 0x5A5A5A5A);
    for (int i = 0; i < 32; i++) {
        session_aes_key[i] = (uint8_t)(mt_rand() & 0xFF);
    }
}`,
    cppMultiThreadedDecryptorSrc: `#include <iostream>
#include <vector>
#include <thread>
#include <openssl/aes.h>

// Aegis-Cerberus Auto-Compiled Multi-Threaded Decryptor
void crack_and_decrypt_chunk(uint64_t start_time, uint64_t end_time, const std::string& filepath) {
    for (uint64_t t = start_time; t <= end_time; ++t) {
        uint8_t candidate_key[32];
        mt_seed(t ^ 0x5A5A5A5A);
        for (int i = 0; i < 32; ++i) candidate_key[i] = (uint8_t)(mt_rand() & 0xFF);
        if (verify_known_header(candidate_key, filepath)) {
            decrypt_file_lossless(candidate_key, filepath);
            return;
        }
    }
}`,
    pluginStatus: "DISPATCHED_TO_AEGIS",
    restoredFileCount: 47281,
    throughputMBps: 1840.5
  },
  {
    id: "flaw-02",
    variantName: "SillyPutty Ransomware (Hardcoded RC4 S-Box)",
    flawType: "HARDCODED_RC4_KEYSTREAM",
    discoveredInCerberusPlatform: "CERBERUS-RE (Platform 16) · Dynamic Unpacker Enclave",
    confidencePct: 100.0,
    technicalProof: "Hardcoded 16-byte ASCII key 'S!llyPuttyKey2026' embedded directly in .rdata section without asymmetric encapsulation.",
    decompiledFunctionSnippet: `// Discovered in CERBERUS-RE .rdata table
const char* master_rc4_key = "S!llyPuttyKey2026"; // Hardcoded symmetric secret
rc4_init(&rc4_state, master_rc4_key, 17);`,
    cppMultiThreadedDecryptorSrc: `#include <iostream>
#include <openssl/rc4.h>

void fast_rc4_restore(const char* encrypted_path, const char* out_path) {
    RC4_KEY key;
    RC4_set_key(&key, 17, (const unsigned char*)"S!llyPuttyKey2026");
    // Stream decryption pipeline running at 4.2 GB/s across AVX2 registers
}`,
    pluginStatus: "COMPILED_READY",
    restoredFileCount: 18900,
    throughputMBps: 4200.0
  }
];

export default function CryptanalyticBridgePage() {
  const [flaws, setFlaws] = useState<CerberusCryptanalyticFinding[]>(INITIAL_CERBERUS_FLAWS);
  const [selectedFlawId, setSelectedFlawId] = useState<string>("flaw-01");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileLog, setCompileLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"BRIDGE_PIPELINE" | "DECOMPILED_PROOF" | "CPP_DECRYPTOR_SRC" | "RESTORE_QUEUE">("BRIDGE_PIPELINE");

  const selectedFlaw = flaws.find(f => f.id === selectedFlawId) || flaws[0];

  const handleCompileAndDispatch = () => {
    setIsCompiling(true);
    setCompileLog([
      `[00.0s] Linking CERBERUS-RE telemetry bridge endpoint (gRPC :50051)...`,
      `[00.4s] Received verified PRNG flaw proof for ${selectedFlaw.variantName}.`,
      `[00.9s] Invoking LLVM Clang++ with -O3 -mavx512f -fopenmp multi-threading optimization...`,
      `[01.5s] Compiled standalone decryptor binary (aegis_sikomode_decryptor.so / .exe).`,
      `[02.1s] Packaging as Aegis Live Restore Queue Plugin (.aegis-plugin)...`
    ]);

    setTimeout(() => {
      setCompileLog(prev => [
        ...prev,
        `[02.8s] DISPATCHED TO RESTORE QUEUE: Plugin mounted into Aegis multi-node recovery cluster at 1,840 MB/s!`
      ]);
      setFlaws(prev =>
        prev.map(f => (f.id === selectedFlawId ? { ...f, pluginStatus: "EXECUTING_RESTORE" } : f))
      );
      setIsCompiling(false);
    }, 2200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 24px", minHeight: "calc(100vh - 54px)" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(16,185,129,0.06) 50%, rgba(14,21,38,0.9) 100%)",
        border: "1px solid rgba(168,85,247,0.3)",
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
            background: "linear-gradient(135deg, #a855f7 0%, #10b981 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(168,85,247,0.4)"
          }}>
            <Cpu size={24} color="#070b12" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: "#f8fafc" }}>
                CERBERUS-RE (Platform 16) ↔ Aegis Recovery (Platform 17) Cryptanalytic Bridge
              </h1>
              <span style={{
                background: "rgba(168,85,247,0.2)",
                color: "#a855f7",
                border: "1px solid rgba(168,85,247,0.4)",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 800,
                fontFamily: "monospace"
              }}>
                CLOSED-LOOP PIPELINE
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
                C++ AVX-512 AUTO-COMPILER
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 3 }}>
              Synchronizes reverse engineering discoveries from CERBERUS-RE (Mersenne Twister seed weaknesses, hardcoded keys), compiles custom multi-threaded C++ decryptors, and dispatches them directly into Aegis Recovery live queues.
            </p>
          </div>
        </div>

        {/* Global Action */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleCompileAndDispatch}
            disabled={isCompiling}
            style={{
              background: isCompiling ? "rgba(245,158,11,0.2)" : "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
              border: isCompiling ? "1px solid #f59e0b" : "none",
              color: isCompiling ? "#f59e0b" : "#fff",
              padding: "9px 18px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 800,
              cursor: isCompiling ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 0 16px rgba(168,85,247,0.35)",
              transition: "all 0.2s ease"
            }}
          >
            {isCompiling ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
            <span>{isCompiling ? "COMPILING DECRYPTOR..." : "Auto-Compile & Dispatch Plugin"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>BRIDGE SYNC STATUS</span>
            <Radio size={14} color="#10b981" className="animate-pulse" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>P16 ↔ P17 LIVE</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>gRPC Telemetry Stream</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>DISCOVERED PRNG FLAWS</span>
            <Sparkles size={14} color="#a855f7" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#a855f7", marginTop: 4 }}>2 Verified</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Mersenne Twister / RC4 S-Box</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>RESTORE THROUGHPUT</span>
            <Zap size={14} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#06b6d4", marginTop: 4 }}>1,840 MB/s</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>AVX-512 Multi-Threaded</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>FILES RESTORED</span>
            <CheckCircle2 size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>47,281 Files</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Zero ransom paid</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>PLUGINS COMPILED</span>
            <FileCode size={14} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b", marginTop: 4 }}>2 Ready</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Native C++ / Rust shared obj</div>
        </div>
      </div>

      {/* Main Grid: Flaws List + Bridge Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16, flex: 1 }}>
        {/* Left Column: Discovered PRNG Flaws */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card-tactical" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)" }}>CERBERUS-RE DISCOVERIES</span>
              <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{flaws.length} FLAWS</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {flaws.map(flaw => {
                const isSelected = flaw.id === selectedFlawId;
                return (
                  <div
                    key={flaw.id}
                    onClick={() => setSelectedFlawId(flaw.id)}
                    style={{
                      background: isSelected ? "rgba(168,85,247,0.08)" : "var(--surface-2)",
                      border: isSelected ? "1px solid rgba(168,85,247,0.4)" : "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "10px 12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: isSelected ? "#a855f7" : "#f8fafc" }}>
                        {flaw.variantName}
                      </span>
                      <span className={`badge-sev ${flaw.pluginStatus === "EXECUTING_RESTORE" ? "badge-success" : "badge-medium"}`}>
                        {flaw.pluginStatus.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div style={{ fontSize: 10, color: "var(--muted)" }}>
                      Origin: {flaw.discoveredInCerberusPlatform}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10, background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: 4 }}>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Confidence: </span>
                        <strong style={{ color: "#10b981" }}>{flaw.confidencePct}%</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Speed: </span>
                        <strong style={{ color: "#06b6d4" }}>{flaw.throughputMBps} MB/s</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compilation Console Stream */}
          {compileLog.length > 0 && (
            <div className="card-tactical" style={{ padding: 12, background: "#050912", border: "1px solid rgba(168,85,247,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11, fontWeight: 800, color: "#a855f7" }}>
                <Terminal size={13} />
                <span>LLVM CLANG++ COMPILER STREAM</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, fontFamily: "monospace", fontSize: 10, color: "#cbd5e1" }}>
                {compileLog.map((l, i) => (
                  <div key={i} style={{ color: l.includes("DISPATCHED") ? "#10b981" : l.includes("Clang++") ? "#06b6d4" : "#cbd5e1" }}>{l}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Code & Proof Inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
            {[
              { id: "BRIDGE_PIPELINE", label: "Closed-Loop RE Pipeline", icon: Layers },
              { id: "DECOMPILED_PROOF", label: "Ghidra Decompiled Proof (P16)", icon: Binary },
              { id: "CPP_DECRYPTOR_SRC", label: "Generated C++ AVX-512 Source", icon: FileCode },
              { id: "RESTORE_QUEUE", label: "Live Aegis Restore Queue (P17)", icon: Zap }
            ].map(tab => {
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
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#a855f7" : "var(--fg-2)",
                    background: active ? "rgba(168,85,247,0.12)" : "transparent",
                    border: active ? "1px solid rgba(168,85,247,0.3)" : "1px solid transparent",
                    cursor: "pointer"
                  }}
                >
                  <Icon size={14} color={active ? "#a855f7" : "var(--muted)"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Bridge Pipeline */}
          {activeTab === "BRIDGE_PIPELINE" && (
            <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>
                    CLOSED-LOOP REVERSE ENGINEERING TO PRODUCTION RECOVERY PIPELINE
                  </span>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    Active Case: {selectedFlaw.variantName}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#a855f7", marginBottom: 6 }}>1. CERBERUS-RE (P16) Discovery</div>
                  <p style={{ fontSize: 11, color: "var(--fg-2)", lineHeight: 1.4, margin: 0 }}>
                    Identifies deterministic pseudo-random number generator (PRNG) or hardcoded symmetric key inside sandbox decompilation.
                  </p>
                </div>

                <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#06b6d4", marginBottom: 6 }}>2. LLVM Clang++ Auto-Compiler</div>
                  <p style={{ fontSize: 11, color: "var(--fg-2)", lineHeight: 1.4, margin: 0 }}>
                    Generates native AVX-512 multi-threaded decryptor module and packages as an Aegis-compatible plugin (.aegis-plugin).
                  </p>
                </div>

                <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#10b981", marginBottom: 6 }}>3. Aegis Live Recovery Queue</div>
                  <p style={{ fontSize: 11, color: "var(--fg-2)", lineHeight: 1.4, margin: 0 }}>
                    Dispatches plugin into cluster nodes, recovering 47,281 encrypted endpoints at 1,840 MB/s with zero data loss.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Decompiled Proof */}
          {activeTab === "DECOMPILED_PROOF" && (
            <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                GHIDRA / IDA DECOMPILED DISASSEMBLY PROOF (CERBERUS-RE)
              </span>
              <pre style={{ background: "#040711", border: "1px solid var(--border)", borderRadius: 6, padding: 14, color: "#06b6d4", fontFamily: "monospace", fontSize: 11.5, lineHeight: 1.6, overflowX: "auto" }}>
                {selectedFlaw.decompiledFunctionSnippet}
              </pre>
            </div>
          )}

          {/* TAB 3: Generated C++ Source */}
          {activeTab === "CPP_DECRYPTOR_SRC" && (
            <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                AUTO-COMPILED C++ MULTI-THREADED DECRYPTOR SOURCE
              </span>
              <pre style={{ background: "#040711", border: "1px solid var(--border)", borderRadius: 6, padding: 14, color: "#34d399", fontFamily: "monospace", fontSize: 11.5, lineHeight: 1.6, overflowX: "auto" }}>
                {selectedFlaw.cppMultiThreadedDecryptorSrc}
              </pre>
            </div>
          )}

          {/* TAB 4: Live Restore Queue */}
          {activeTab === "RESTORE_QUEUE" && (
            <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                  AEGIS LIVE RESTORE CLUSTER (JOB: SIKOMODE-47K-RESTORE)
                </span>
                <span className="badge-sev badge-success">ACTIVE RUNNING</span>
              </div>
              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <span style={{ color: "var(--muted)" }}>Restored Files:</span>
                  <strong style={{ color: "#10b981" }}>47,281 / 47,281 (100%)</strong>
                </div>
                <div style={{ width: "100%", height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: "100%", height: "100%", background: "#10b981" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)" }}>
                  <span>Throughput: <strong style={{ color: "#06b6d4" }}>1,840.5 MB/s</strong></span>
                  <span>Cluster Workers: <strong>64 AVX-512 Threads</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
